export type SplitMode = "even" | "by-room" | "custom";
export type LightLevel = "bright" | "ok" | "dim";
export type AirLevel = "good" | "ok" | "poor";

export interface SplitRoom {
  label: string;
  area: number;
  privateBath: boolean;
  balcony: boolean;
  light: LightLevel;
  air: AirLevel;
  storage: boolean;
  furniture: string;
}

export interface RentDraft {
  wholeRent: number;
  myRoom: SplitRoom;
  theirRoom: SplitRoom;
  mode: SplitMode;
  myAmount: number | null;
  theirAmount: number | null;
  myConfirmed: boolean;
  theirConfirmed: boolean;
  agreedAt: string | null;
}

export const UTILITIES_NOTE = "水电燃气另算，不放进这笔房租。";

export const lightLabel: Record<LightLevel, string> = {
  bright: "光线好",
  ok: "光线一般",
  dim: "光线偏暗",
};

export const airLabel: Record<AirLevel, string> = {
  good: "通风好",
  ok: "通风一般",
  poor: "通风差一点",
};

export function emptySplitRoom(label: string): SplitRoom {
  return {
    label,
    area: 12,
    privateBath: false,
    balcony: false,
    light: "ok",
    air: "ok",
    storage: false,
    furniture: "床和衣柜",
  };
}

export function emptyRent(): RentDraft {
  return {
    wholeRent: 7000,
    myRoom: emptySplitRoom("我的房间"),
    theirRoom: emptySplitRoom("对方的房间"),
    mode: "even",
    myAmount: null,
    theirAmount: null,
    myConfirmed: false,
    theirConfirmed: false,
    agreedAt: null,
  };
}

export function otherAmount(whole: number, entered: number): number | null {
  if (!Number.isInteger(whole) || !Number.isInteger(entered)) return null;
  if (whole <= 0 || entered < 0 || entered > whole) return null;
  return whole - entered;
}

export function amountsFromOne(
  whole: number,
  who: "me" | "them",
  entered: number,
): { mine: number; theirs: number } | null {
  const other = otherAmount(whole, entered);
  if (other === null) return null;
  if (who === "me") return { mine: entered, theirs: other };
  return { mine: other, theirs: entered };
}

export function evenSuggestion(whole: number): { mine: number; theirs: number } | null {
  if (!Number.isInteger(whole) || whole <= 0) return null;
  const mine = Math.floor(whole / 2);
  return { mine, theirs: whole - mine };
}

export function byRoomSuggestion(
  whole: number,
  myArea: number,
  theirArea: number,
): { mine: number; theirs: number } | null {
  if (!Number.isInteger(whole) || whole <= 0) return null;
  if (!(myArea > 0) || !(theirArea > 0)) return null;
  const mine = Math.round((whole * myArea) / (myArea + theirArea));
  const clamped = Math.min(whole, Math.max(0, mine));
  return { mine: clamped, theirs: whole - clamped };
}

export function sumsMatch(whole: number, mine: number | null, theirs: number | null): boolean {
  if (mine === null || theirs === null) return false;
  return mine >= 0 && theirs >= 0 && mine + theirs === whole;
}

export function withAmounts(
  draft: RentDraft,
  amounts: { mine: number; theirs: number } | null,
): RentDraft {
  if (!amounts) return draft;
  return {
    ...draft,
    myAmount: amounts.mine,
    theirAmount: amounts.theirs,
    myConfirmed: false,
    theirConfirmed: false,
    agreedAt: null,
  };
}

export function confirmRentSide(draft: RentDraft, side: "me" | "them", at: string): RentDraft {
  if (!sumsMatch(draft.wholeRent, draft.myAmount, draft.theirAmount)) return draft;
  const next = side === "me" ? { ...draft, myConfirmed: true } : { ...draft, theirConfirmed: true };
  const both = next.myConfirmed && next.theirConfirmed;
  return { ...next, agreedAt: both ? at : null };
}

export function reopenRent(draft: RentDraft): RentDraft {
  return { ...draft, myConfirmed: false, theirConfirmed: false, agreedAt: null };
}
