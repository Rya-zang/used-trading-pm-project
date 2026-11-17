import { isWorkplaceId, localCommute, nearbyPresets, workplaceOf, type CommuteItem } from "../domain/commute.ts";
import { fakeListings } from "../domain/places.ts";

const AMAP_ORIGIN = "https://restapi.amap.com";
const NEAR_RADIUS_M = "1000";
const CACHE_MS = 10 * 60 * 1000;

const wishKeyword: Record<string, string> = {
  metro: "地铁站",
  snacks: "小吃",
  market: "超市",
  park: "公园",
  hospital: "医院",
};

export interface CommuteInput {
  workplaceId: string | null;
  wishes: string[];
  custom: string;
}

export interface CommuteReport {
  keySet: boolean;
  source: "amap" | "sample";
  note: "missing-key" | "amap" | "amap-unavailable";
  items: CommuteItem[];
}

const cache = new Map<string, { at: number; report: CommuteReport }>();
const hits: number[] = [];

function readKey(override?: string): string {
  if (override !== undefined) return override.trim();
  const env = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return env.process?.env?.AMAP_KEY?.trim() ?? "";
}

export function parseCommuteInput(value: unknown): CommuteInput | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const workplaceId =
    record.workplaceId === null || record.workplaceId === ""
      ? null
      : typeof record.workplaceId === "string" && isWorkplaceId(record.workplaceId)
        ? record.workplaceId
        : undefined;
  if (workplaceId === undefined) return null;
  if (!Array.isArray(record.wishes) || record.wishes.length > nearbyPresets.length) return null;
  const wishes: string[] = [];
  for (const wish of record.wishes) {
    if (typeof wish !== "string" || !nearbyPresets.some((item) => item.id === wish)) return null;
    if (!wishes.includes(wish)) wishes.push(wish);
  }
  const custom = typeof record.custom === "string" ? record.custom.trim().slice(0, 20) : "";
  return { workplaceId, wishes, custom };
}

function sampleReport(input: CommuteInput, note: CommuteReport["note"], keySet: boolean): CommuteReport {
  return {
    keySet,
    source: "sample",
    note,
    items: localCommute(input.workplaceId, input.wishes, input.custom),
  };
}

function keywordOf(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s]/gu, "").trim().slice(0, 20);
}

function amapUrl(path: string, key: string, params: Record<string, string>): URL {
  const url = new URL(path, AMAP_ORIGIN);
  if (url.origin !== AMAP_ORIGIN) throw new Error("bad-origin");
  url.searchParams.set("key", key);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  return url;
}

async function amapJson(url: URL, fetchImpl: typeof fetch): Promise<Record<string, unknown>> {
  if (url.origin !== AMAP_ORIGIN) throw new Error("bad-origin");
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("amap-status");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") throw new Error("amap-body");
  const record = payload as Record<string, unknown>;
  if (record.status !== "1") throw new Error("amap-rejected");
  return record;
}

async function drivingKm(
  workplaceId: string,
  key: string,
  fetchImpl: typeof fetch,
): Promise<Map<string, number>> {
  const place = workplaceOf(workplaceId);
  const url = amapUrl("/v3/distance", key, {
    origins: fakeListings.map((listing) => `${listing.lng},${listing.lat}`).join("|"),
    destination: `${place.lng},${place.lat}`,
    type: "1",
    output: "JSON",
  });
  const payload = await amapJson(url, fetchImpl);
  const results = payload.results;
  if (!Array.isArray(results) || results.length !== fakeListings.length) throw new Error("amap-distance");
  const km = new Map<string, number>();
  results.forEach((item, index) => {
    const listing = fakeListings[index];
    if (!listing || !item || typeof item !== "object") throw new Error("amap-distance");
    const meters = Number((item as { distance?: unknown }).distance);
    if (!Number.isFinite(meters) || meters < 0) throw new Error("amap-distance");
    km.set(listing.id, meters / 1000);
  });
  return km;
}

async function wishIsNear(
  listingId: string,
  words: string,
  key: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const listing = fakeListings.find((item) => item.id === listingId);
  if (!listing || !words) return false;
  const url = amapUrl("/v3/place/around", key, {
    location: `${listing.lng},${listing.lat}`,
    keywords: words,
    radius: NEAR_RADIUS_M,
    offset: "5",
    page: "1",
    extensions: "base",
    output: "JSON",
  });
  const payload = await amapJson(url, fetchImpl);
  const count = Number(payload.count);
  return Number.isFinite(count) && count > 0;
}

async function mapWithLimit<T, R>(items: readonly T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item !== undefined) results[index] = await worker(item);
    }
  }
  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, () => run()));
  return results;
}

function allowCall(): boolean {
  const now = Date.now();
  while (hits.length > 0 && (hits[0] ?? 0) < now - 60_000) hits.shift();
  if (hits.length >= 30) return false;
  hits.push(now);
  return true;
}

async function amapReport(input: CommuteInput, key: string, fetchImpl: typeof fetch): Promise<CommuteReport> {
  const base = localCommute(input.workplaceId, input.wishes, input.custom);
  const km = input.workplaceId ? await drivingKm(input.workplaceId, key, fetchImpl) : null;
  const tasks: { id: string; wishId: string; words: string }[] = [];
  for (const listing of fakeListings) {
    for (const wish of input.wishes) {
      const words = keywordOf(wishKeyword[wish] ?? "");
      if (words) tasks.push({ id: listing.id, wishId: wish, words });
    }
    const custom = keywordOf(input.custom);
    if (custom) tasks.push({ id: listing.id, wishId: "custom", words: custom });
  }
  const found = await mapWithLimit(tasks, 4, async (task) => ({
    ...task,
    near: await wishIsNear(task.id, task.words, key, fetchImpl),
  }));
  const met = new Map<string, string[]>();
  for (const item of found) {
    if (!item.near) continue;
    const list = met.get(item.id) ?? [];
    list.push(item.wishId);
    met.set(item.id, list);
  }
  const items: CommuteItem[] = base.map((item) => ({
    id: item.id,
    km: km ? (km.get(item.id) ?? null) : null,
    met: tasks.some((task) => task.id === item.id) ? (met.get(item.id) ?? []) : item.met,
  }));
  return { keySet: true, source: "amap", note: "amap", items };
}

export async function buildCommuteReport(
  input: CommuteInput,
  options: { key?: string; fetchImpl?: typeof fetch } = {},
): Promise<CommuteReport> {
  const key = readKey(options.key);
  if (!key) return sampleReport(input, "missing-key", false);
  const isolated = options.fetchImpl !== undefined;
  const cacheKey = JSON.stringify([input.workplaceId, input.wishes, input.custom]);
  if (!isolated) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.report;
    if (!allowCall()) return sampleReport(input, "amap-unavailable", true);
  }
  try {
    const report = await amapReport(input, key, options.fetchImpl ?? fetch);
    if (!isolated) cache.set(cacheKey, { at: Date.now(), report });
    return report;
  } catch {
    return sampleReport(input, "amap-unavailable", true);
  }
}

export async function commuteFromRequest(request: Request): Promise<Response> {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  if (raw.length > 2000) return Response.json({ error: "bad-request" }, { status: 400 });
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  const input = parseCommuteInput(body);
  if (!input) return Response.json({ error: "bad-request" }, { status: 400 });
  const report = await buildCommuteReport(input);
  return Response.json(report, { headers: { "cache-control": "no-store" } });
}
