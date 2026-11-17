import { placeWishPresets, type NearbyId } from "./commute.ts";
import type { FakeListing } from "./places.ts";

export type PlaceWishId = NearbyId;

export interface PlaceWishPick {
  id: PlaceWishId;
  must: boolean;
}

export interface PlaceWishState {
  mine: PlaceWishPick[];
  theirs: PlaceWishPick[];
  myConfirmed: boolean;
  theirConfirmed: boolean;
}

export interface WishGroupItem {
  id: PlaceWishId;
  label: string;
  must: boolean;
}

export interface WishGroups {
  shared: WishGroupItem[];
  mine: WishGroupItem[];
  theirs: WishGroupItem[];
}

export type WishWho = "me" | "them" | "both";

export interface MetWish {
  id: PlaceWishId;
  label: string;
  who: WishWho;
}

export function emptyPlaceWishes(): PlaceWishState {
  return { mine: [], theirs: [], myConfirmed: false, theirConfirmed: false };
}

export function isPlaceWishId(value: string): value is PlaceWishId {
  return placeWishPresets.some((item) => item.id === value);
}

export function placeWishLabel(id: string): string {
  return placeWishPresets.find((item) => item.id === id)?.label ?? id;
}

function without(list: readonly PlaceWishPick[], id: PlaceWishId): PlaceWishPick[] {
  return list.filter((item) => item.id !== id);
}

export function writePlaceWish(
  state: PlaceWishState,
  side: "me" | "them",
  id: PlaceWishId,
  pick: PlaceWishPick | null,
): PlaceWishState {
  const key = side === "me" ? "mine" : "theirs";
  const next = pick ? [...without(state[key], id), pick] : without(state[key], id);
  return { ...state, [key]: next, myConfirmed: false, theirConfirmed: false };
}

export function confirmPlaceWishes(state: PlaceWishState, side: "me" | "them"): PlaceWishState {
  if (side === "me") return { ...state, myConfirmed: true };
  return { ...state, theirConfirmed: true };
}

export function placeWishesReady(state: PlaceWishState): boolean {
  return state.myConfirmed && state.theirConfirmed;
}

function itemOf(list: readonly PlaceWishPick[], id: PlaceWishId): WishGroupItem | null {
  const pick = list.find((item) => item.id === id);
  if (!pick) return null;
  return { id, label: placeWishLabel(id), must: pick.must };
}

export function wishGroups(state: PlaceWishState): WishGroups {
  const shared: WishGroupItem[] = [];
  const mine: WishGroupItem[] = [];
  const theirs: WishGroupItem[] = [];
  for (const preset of placeWishPresets) {
    const left = itemOf(state.mine, preset.id);
    const right = itemOf(state.theirs, preset.id);
    if (left && right) {
      shared.push({ id: preset.id, label: preset.label, must: left.must && right.must });
    } else if (left) {
      mine.push(left);
    } else if (right) {
      theirs.push(right);
    }
  }
  return { shared, mine, theirs };
}

export function sharedMustIds(state: PlaceWishState): PlaceWishId[] {
  return wishGroups(state)
    .shared.filter((item) => item.must)
    .map((item) => item.id);
}

export function listingPassesSharedMusts(listing: FakeListing, state: PlaceWishState): boolean {
  if (!placeWishesReady(state)) return true;
  return sharedMustIds(state).every((id) => listing.nearby.includes(id));
}

export function metWishes(listing: FakeListing, state: PlaceWishState): MetWish[] {
  const groups = wishGroups(state);
  const rows = [
    ...groups.shared.map((item) => ({ ...item, who: "both" as const })),
    ...groups.mine.map((item) => ({ ...item, who: "me" as const })),
    ...groups.theirs.map((item) => ({ ...item, who: "them" as const })),
  ];
  return rows
    .filter((item) => listing.nearby.includes(item.id))
    .map((item) => ({ id: item.id, label: item.label, who: item.who }));
}

export function metWishText(item: MetWish): string {
  if (item.who === "both") return `双方都有${item.label}`;
  if (item.who === "me") return `我有${item.label}`;
  return `对方有${item.label}`;
}

export function parsePlaceWishes(value: unknown): PlaceWishState {
  const base = emptyPlaceWishes();
  if (!value || typeof value !== "object") return base;
  const record = value as Record<string, unknown>;
  base.mine = parsePicks(record.mine);
  base.theirs = parsePicks(record.theirs);
  base.myConfirmed = record.myConfirmed === true;
  base.theirConfirmed = record.theirConfirmed === true;
  return base;
}

function parsePicks(value: unknown): PlaceWishPick[] {
  if (!Array.isArray(value)) return [];
  const picks: PlaceWishPick[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || !isPlaceWishId(record.id)) continue;
    if (picks.some((pick) => pick.id === record.id)) continue;
    picks.push({ id: record.id, must: record.must === true });
  }
  return picks;
}
