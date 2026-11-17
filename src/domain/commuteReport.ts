import { useEffect, useState } from "react";
import { localCommute, type CommuteItem } from "./commute.ts";
import { useSavedWishes, useSavedWorkplace } from "./storage.ts";
import type { CommuteReport } from "../server/amap.ts";

export type { CommuteReport };

const noteCopy = {
  "missing-key": "距离和周边先按记下的地点来算。",
  amap: "距离和周边按高德来算。",
  "amap-unavailable": "这次没有算出新的距离，下面仍按记下的地点来算。",
} as const;

export function commuteNote(note: CommuteReport["note"] | "pending"): string | null {
  if (note === "pending") return null;
  return noteCopy[note];
}

function sample(workplaceId: string | null, wishes: readonly string[], custom: string): CommuteReport {
  return {
    keySet: false,
    source: "sample",
    note: "missing-key",
    items: localCommute(workplaceId, wishes, custom),
  };
}

const pending = new Map<string, Promise<CommuteReport>>();

async function fetchReport(workplaceId: string | null, wishes: readonly string[], custom: string): Promise<CommuteReport> {
  const key = JSON.stringify([workplaceId, wishes, custom]);
  const existing = pending.get(key);
  if (existing) return existing;
  const task = fetch("/api/commute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workplaceId, wishes, custom }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("status");
      const payload: unknown = await response.json();
      if (!isReport(payload)) throw new Error("shape");
      return payload;
    })
    .catch(() => ({ ...sample(workplaceId, wishes, custom), note: "amap-unavailable" as const }))
    .finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}

function isReport(value: unknown): value is CommuteReport {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<CommuteReport>;
  return (
    typeof record.keySet === "boolean" &&
    (record.source === "amap" || record.source === "sample") &&
    (record.note === "missing-key" || record.note === "amap" || record.note === "amap-unavailable") &&
    Array.isArray(record.items)
  );
}

export function useCommuteReport(): { report: CommuteReport; ready: boolean } {
  const saved = useSavedWorkplace();
  const wishes = useSavedWishes();
  const workplaceId = saved?.presetId ?? null;
  const wishKey = wishes.presets.join(",");
  const fallback = sample(workplaceId, wishes.presets, wishes.custom);
  const [report, setReport] = useState<CommuteReport>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    setReady(false);
    setReport(sample(workplaceId, wishes.presets, wishes.custom));
    void fetchReport(workplaceId, wishes.presets, wishes.custom).then((next) => {
      if (!cancel) {
        setReport(next);
        setReady(true);
      }
    });
    return () => {
      cancel = true;
    };
  }, [workplaceId, wishKey, wishes.custom]);

  return { report, ready };
}

export function itemOf(items: readonly CommuteItem[], id: string): CommuteItem | null {
  return items.find((item) => item.id === id) ?? null;
}
