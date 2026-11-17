import { fakeListings, type FakeListing } from "./places.ts";

export const CLOSE_KM = 3;

export const workplaces = [
  { id: "xuhui-binjiang", label: "徐汇滨江办公区", hint: "龙腾大道一带", lat: 31.172, lng: 121.458 },
  { id: "jiaotong", label: "上海交通大学徐汇校区", hint: "华山路", lat: 31.201, lng: 121.437 },
  { id: "jingan", label: "静安嘉里中心", hint: "南京西路", lat: 31.228, lng: 121.449 },
  { id: "lujiazui", label: "陆家嘴世纪大道", hint: "浦东", lat: 31.235, lng: 121.505 },
  { id: "zhangjiang", label: "张江科学城", hint: "浦东", lat: 31.203, lng: 121.59 },
  { id: "wujiaochang", label: "五角场大学路", hint: "杨浦", lat: 31.299, lng: 121.514 },
  { id: "fudan", label: "复旦大学邯郸校区", hint: "杨浦", lat: 31.298, lng: 121.503 },
  { id: "caohejing", label: "漕河泾开发区", hint: "徐汇", lat: 31.172, lng: 121.399 },
] as const;

export type WorkplaceId = (typeof workplaces)[number]["id"];

export const nearbyPresets = [
  { id: "metro", label: "地铁站" },
  { id: "snacks", label: "小吃街" },
  { id: "market", label: "超市" },
  { id: "park", label: "公园" },
  { id: "hospital", label: "医院" },
] as const;

export type NearbyId = (typeof nearbyPresets)[number]["id"];

export interface Point {
  lat: number;
  lng: number;
}

export function isWorkplaceId(value: string): value is WorkplaceId {
  return workplaces.some((item) => item.id === value);
}

export function isNearbyId(value: string): value is NearbyId {
  return nearbyPresets.some((item) => item.id === value);
}

export function workplaceOf(id: string) {
  return workplaces.find((item) => item.id === id) ?? workplaces[0];
}

export function distanceKm(from: Point, to: Point): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function formatKm(km: number): string {
  return `${km.toFixed(1)} 公里`;
}

export function snapWorkplace(text: string) {
  const query = text.trim();
  if (!query) return workplaces[0];
  const exact = workplaces.find((item) => item.label === query || item.hint === query);
  if (exact) return exact;
  let best: (typeof workplaces)[number] = workplaces[0];
  let bestScore = -1;
  for (const place of workplaces) {
    const name = `${place.label}${place.hint}`;
    let score = 0;
    if (name.includes(query) || query.includes(place.label)) score = 1000 + query.length;
    for (const char of query) {
      if (name.includes(char)) score += 1;
    }
    if (score > bestScore) {
      best = place;
      bestScore = score;
    }
  }
  return best;
}

export interface RankedListing {
  listing: FakeListing;
  km: number;
}

export function rankListings(origin: Point): RankedListing[] {
  return fakeListings
    .map((listing) => ({ listing, km: distanceKm(origin, listing) }))
    .sort((left, right) => left.km - right.km);
}

export function recommendListings(origin: Point): { close: boolean; items: RankedListing[] } {
  const ranked = rankListings(origin);
  const close = ranked.filter((item) => item.km <= CLOSE_KM);
  if (close.length > 0) return { close: true, items: close };
  return { close: false, items: ranked.slice(0, 4) };
}

export function wishLabels(presetIds: readonly string[], custom: string): { id: string; label: string }[] {
  const picked: { id: string; label: string }[] = presetIds.filter(isNearbyId).map((id) => ({
    id,
    label: nearbyPresets.find((item) => item.id === id)?.label ?? id,
  }));
  const line = custom.trim();
  if (line) picked.push({ id: "custom", label: line });
  return picked;
}

export interface CommuteItem {
  id: string;
  km: number | null;
  met: string[];
}

export function localCommute(workplaceId: string | null, wishIds: readonly string[], custom: string): CommuteItem[] {
  const labels = wishLabels(wishIds, custom);
  const ranked = workplaceId && isWorkplaceId(workplaceId) ? rankListings(workplaceOf(workplaceId)) : null;
  const kmOf = new Map(ranked?.map((item) => [item.listing.id, item.km]));
  return fakeListings.map((listing) => ({
    id: listing.id,
    km: kmOf.get(listing.id) ?? null,
    met: labels.filter((wish) => listingMeets(listing, wish.id, custom)).map((wish) => wish.id),
  }));
}

export function listingMeets(listing: FakeListing, wishId: string, custom: string): boolean {
  if (wishId === "custom") {
    const line = custom.trim();
    if (!line) return false;
    const haystack = [listing.community, listing.description, listing.metro, ...listing.amenities].join("");
    return haystack.includes(line);
  }
  return listing.nearby.includes(wishId as NearbyId);
}
