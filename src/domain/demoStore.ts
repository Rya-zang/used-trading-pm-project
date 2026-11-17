import { useSyncExternalStore } from "react";
import { findMockRoom, isPhotoId, type PublishedRoom, type RoomSpot } from "./places.ts";
import {
  confirmRentSide,
  emptyRent,
  reopenRent,
  type RentDraft,
  type SplitRoom,
} from "./rent.ts";
import {
  acceptTheirTopic,
  cannotAgree,
  emptyRules,
  proposeMyTopic,
  submitMyRules,
  submitTheirRules,
  type RuleLine,
  type RulesState,
} from "./rules.ts";
import {
  acceptTheirItem,
  confirmSearchSide,
  copyMineToTheirs,
  demoTheirSearch,
  emptySearch,
  withMyItem,
  type SearchFieldId,
  type SearchState,
  type SearchValue,
} from "./searchStandard.ts";
import {
  confirmPlaceWishes,
  emptyPlaceWishes,
  parsePlaceWishes,
  writePlaceWish,
  type PlaceWishId,
  type PlaceWishPick,
  type PlaceWishState,
} from "./placeWishes.ts";
import { canMoveIn } from "./together.ts";
import {
  agree,
  answerListing,
  answerRoom,
  createViewing,
  decline,
  markVisited,
  propose,
  type Proposal,
  type Side,
  type Viewing,
  type ViewingStatus,
  type VisitFeedback,
} from "./viewing.ts";

const KEY = "shunxin.demo.v1";

export type ChoreId = "living" | "kitchen" | "trash";
export type AgreementCategory = "cleaning" | "sleep" | "guests" | "shared" | "bills";

export interface Agreement {
  id: string;
  category: AgreementCategory;
  text: string;
  myConfirmed: boolean;
  theirConfirmed: boolean;
  updatedAt: string;
}

export interface GentleRequest {
  id: string;
  text: string;
  sentAt: string;
  reply: "ok" | "talk" | null;
}

export interface Reminder {
  id: string;
  text: string;
  createdAt: string;
  response: "done" | "later" | "talk" | null;
}

export interface ChoreMark {
  by: Side | null;
  at: string | null;
}

export interface PairRecord {
  viewings: Viewing[];
  search: SearchState;
  placeWishes: PlaceWishState;
  rent: RentDraft;
  rules: RulesState;
  myMoveIn: boolean;
  theirMoveIn: boolean;
  agreements: Agreement[];
  requests: GentleRequest[];
  reminders: Reminder[];
  chores: Record<ChoreId, ChoreMark>;
}

export interface DemoState {
  myRoom: PublishedRoom | null;
  savedRoomIds: string[];
  savedListingIds: string[];
  theirSavedListingIds: Record<string, string[]>;
  sharedListingIds: Record<string, string[]>;
  pairs: Record<string, PairRecord>;
}

export const choreMeta = [
  ["living", "客厅"],
  ["kitchen", "厨房"],
  ["trash", "扔垃圾"],
] as const;

export const agreementCategories = [
  ["cleaning", "打扫"],
  ["sleep", "作息"],
  ["guests", "客人"],
  ["shared", "共用的东西"],
  ["bills", "账单"],
] as const;

export const requestTemplates = [
  { id: "kitchen", label: "厨房", text: "厨房用完了，可以顺手收一下吗？" },
  { id: "noise", label: "声音", text: "晚上声音有点大，可以轻一点吗？" },
  { id: "guests", label: "客人", text: "这周想请朋友来坐坐，你方便吗？" },
  { id: "shared", label: "共用的地方", text: "客厅想一起用一下，我们商量个时间好吗？" },
] as const;

function emptyChores(): Record<ChoreId, ChoreMark> {
  return {
    living: { by: null, at: null },
    kitchen: { by: null, at: null },
    trash: { by: null, at: null },
  };
}

export function emptyPair(): PairRecord {
  return {
    viewings: [],
    search: emptySearch(),
    placeWishes: emptyPlaceWishes(),
    rent: emptyRent(),
    rules: emptyRules(),
    myMoveIn: false,
    theirMoveIn: false,
    agreements: [],
    requests: [],
    reminders: [],
    chores: emptyChores(),
  };
}

function emptyDemo(): DemoState {
  return {
    myRoom: null,
    savedRoomIds: [],
    savedListingIds: [],
    theirSavedListingIds: {},
    sharedListingIds: {},
    pairs: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function stringMap(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  const next: Record<string, string[]> = {};
  for (const [key, item] of Object.entries(value)) next[key] = stringList(item);
  return next;
}

function parseSpot(value: unknown, fallback: RoomSpot): RoomSpot {
  if (!isRecord(value)) return fallback;
  return {
    name: typeof value.name === "string" ? value.name : fallback.name,
    areaSqm: typeof value.areaSqm === "number" ? value.areaSqm : fallback.areaSqm,
    rent: typeof value.rent === "number" ? value.rent : fallback.rent,
    privateBath: value.privateBath === true,
    light: typeof value.light === "string" ? value.light : fallback.light,
    balcony: value.balcony === true,
    furniture: typeof value.furniture === "string" ? value.furniture : fallback.furniture,
  };
}

function parseRoom(value: unknown): PublishedRoom | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.ownerId !== "string") return null;
  if (typeof value.cityId !== "string" || typeof value.areaId !== "string") return null;
  const photos = stringList(value.photos).filter(isPhotoId);
  const fallback = { name: "", areaSqm: 0, rent: 0, privateBath: false, light: "", balcony: false, furniture: "" };
  return {
    id: value.id,
    ownerId: value.ownerId,
    cityId: value.cityId as PublishedRoom["cityId"],
    areaId: value.areaId as PublishedRoom["areaId"],
    community: typeof value.community === "string" ? value.community : "",
    address: typeof value.address === "string" ? value.address : "",
    wholeRent: typeof value.wholeRent === "number" ? value.wholeRent : 0,
    layout: typeof value.layout === "string" ? value.layout : "",
    areaSqm: typeof value.areaSqm === "number" ? value.areaSqm : 0,
    bedrooms: typeof value.bedrooms === "number" ? value.bedrooms : 0,
    baths: typeof value.baths === "number" ? value.baths : 0,
    ownRoom: parseSpot(value.ownRoom, fallback),
    roommateRoom: parseSpot(value.roommateRoom, fallback),
    moveIn: typeof value.moveIn === "string" ? value.moveIn : "",
    requirements: typeof value.requirements === "string" ? value.requirements : "",
    photos,
  };
}

function parseViewing(value: unknown): Viewing | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  const status = value.status;
  const known: ViewingStatus[] = ["waiting", "confirmed", "time-not-agreed", "cancelled", "done"];
  if (typeof status !== "string" || !known.includes(status as ViewingStatus)) return null;
  const proposals: Proposal[] = [];
  if (Array.isArray(value.proposals)) {
    for (const item of value.proposals) {
      if (!isRecord(item) || typeof item.when !== "string") continue;
      if (item.by !== "me" && item.by !== "them") continue;
      proposals.push({ by: item.by, when: item.when });
    }
  }
  return {
    id: value.id,
    placeKind: value.placeKind === "listing" ? "listing" : "room",
    placeId: typeof value.placeId === "string" ? value.placeId : "",
    placeLabel: typeof value.placeLabel === "string" ? value.placeLabel : "",
    status: status as ViewingStatus,
    proposals,
    agreedWhen: typeof value.agreedWhen === "string" ? value.agreedWhen : null,
    myYes: value.myYes === "yes" || value.myYes === "no" ? value.myYes : null,
    theirYes: value.theirYes === "yes" || value.theirYes === "no" ? value.theirYes : null,
    myFeedback: parseFeedback(value.myFeedback),
    theirFeedback: parseFeedback(value.theirFeedback),
  };
}

function parseFeedback(value: unknown): VisitFeedback | null {
  if (!isRecord(value) || (value.like !== "yes" && value.like !== "no")) return null;
  return {
    like: value.like,
    layout: typeof value.layout === "string" ? value.layout : "",
    rent: typeof value.rent === "string" ? value.rent : "",
    baths: typeof value.baths === "string" ? value.baths : "",
    other: typeof value.other === "string" ? value.other : "",
    keep: value.keep === true,
  };
}

function parseSearch(value: unknown): SearchState {
  const base = emptySearch();
  if (!isRecord(value)) return base;
  base.myConfirmed = value.myConfirmed === true;
  base.theirConfirmed = value.theirConfirmed === true;
  base.mine = parseSheet(value.mine);
  base.theirs = parseSheet(value.theirs);
  return base;
}

function parseSheet(value: unknown): SearchState["mine"] {
  if (!isRecord(value)) return {};
  const sheet: SearchState["mine"] = {};
  for (const [key, item] of Object.entries(value)) {
    if (!isRecord(item) || typeof item.value !== "string") continue;
    if (item.stance !== "must" && item.stance !== "prefer" && item.stance !== "flexible") continue;
    sheet[key as SearchFieldId] = { value: item.value, stance: item.stance };
  }
  return sheet;
}

function parseRules(value: unknown): RulesState {
  const base = emptyRules();
  if (!isRecord(value)) return base;
  base.mine = parseLines(value.mine);
  base.theirs = parseLines(value.theirs);
  base.mySubmittedAt = typeof value.mySubmittedAt === "string" ? value.mySubmittedAt : null;
  base.theirSubmittedAt = typeof value.theirSubmittedAt === "string" ? value.theirSubmittedAt : null;
  base.myStance = parseStance(value.myStance);
  base.theirStance = parseStance(value.theirStance);
  base.lastEditAt = typeof value.lastEditAt === "string" ? value.lastEditAt : null;
  base.history = Array.isArray(value.history)
    ? value.history.flatMap((item) => {
        if (!isRecord(item) || (item.by !== "me" && item.by !== "them")) return [];
        return [{ at: typeof item.at === "string" ? item.at : "", by: item.by, lines: parseLines(item.lines) }];
      })
    : [];
  return base;
}

function parseLines(value: unknown): RuleLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.topic !== "string" || typeof item.text !== "string") return [];
    if (item.level !== "never" && item.level !== "avoid" && item.level !== "talk") return [];
    return [
      {
        id: typeof item.id === "string" ? item.id : item.topic,
        topic: item.topic,
        text: item.text,
        level: item.level,
        custom: item.custom === true,
      },
    ];
  });
}

function parseStance(value: unknown): Record<string, "accept" | "propose" | "cannot"> {
  if (!isRecord(value)) return {};
  const next: Record<string, "accept" | "propose" | "cannot"> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === "accept" || item === "propose" || item === "cannot") next[key] = item;
  }
  return next;
}

function parseRent(value: unknown): RentDraft {
  const base = emptyRent();
  if (!isRecord(value)) return base;
  return {
    ...base,
    wholeRent: typeof value.wholeRent === "number" ? value.wholeRent : base.wholeRent,
    mode: value.mode === "by-room" || value.mode === "custom" || value.mode === "even" ? value.mode : "even",
    myAmount: typeof value.myAmount === "number" ? value.myAmount : null,
    theirAmount: typeof value.theirAmount === "number" ? value.theirAmount : null,
    myConfirmed: value.myConfirmed === true,
    theirConfirmed: value.theirConfirmed === true,
    agreedAt: typeof value.agreedAt === "string" ? value.agreedAt : null,
    myRoom: { ...base.myRoom, ...parseSplit(value.myRoom) },
    theirRoom: { ...base.theirRoom, ...parseSplit(value.theirRoom) },
  };
}

function parseSplit(value: unknown): Partial<SplitRoom> {
  if (!isRecord(value)) return {};
  const next: Partial<SplitRoom> = {};
  if (typeof value.label === "string") next.label = value.label;
  if (typeof value.area === "number") next.area = value.area;
  if (typeof value.privateBath === "boolean") next.privateBath = value.privateBath;
  if (typeof value.balcony === "boolean") next.balcony = value.balcony;
  if (value.light === "bright" || value.light === "ok" || value.light === "dim") next.light = value.light;
  if (value.air === "good" || value.air === "ok" || value.air === "poor") next.air = value.air;
  if (typeof value.storage === "boolean") next.storage = value.storage;
  if (typeof value.furniture === "string") next.furniture = value.furniture;
  return next;
}

function parsePair(value: unknown): PairRecord {
  const base = emptyPair();
  if (!isRecord(value)) return base;
  base.viewings = Array.isArray(value.viewings)
    ? value.viewings.flatMap((item) => {
        const viewing = parseViewing(item);
        return viewing ? [viewing] : [];
      })
    : [];
  base.search = parseSearch(value.search);
  base.placeWishes = parsePlaceWishes(value.placeWishes);
  base.rent = parseRent(value.rent);
  base.rules = parseRules(value.rules);
  base.myMoveIn = value.myMoveIn === true;
  base.theirMoveIn = value.theirMoveIn === true;
  base.agreements = Array.isArray(value.agreements)
    ? value.agreements.flatMap((item) => {
        if (!isRecord(item) || typeof item.id !== "string" || typeof item.text !== "string") return [];
        const category = item.category;
        if (
          category !== "cleaning" &&
          category !== "sleep" &&
          category !== "guests" &&
          category !== "shared" &&
          category !== "bills"
        ) {
          return [];
        }
        return [
          {
            id: item.id,
            category,
            text: item.text,
            myConfirmed: item.myConfirmed === true,
            theirConfirmed: item.theirConfirmed === true,
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : "",
          },
        ];
      })
    : [];
  base.requests = Array.isArray(value.requests)
    ? value.requests.flatMap((item) => {
        if (!isRecord(item) || typeof item.text !== "string") return [];
        return [
          {
            id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
            text: item.text,
            sentAt: typeof item.sentAt === "string" ? item.sentAt : "",
            reply: item.reply === "ok" || item.reply === "talk" ? item.reply : null,
          },
        ];
      })
    : [];
  base.reminders = Array.isArray(value.reminders)
    ? value.reminders.flatMap((item) => {
        if (!isRecord(item) || typeof item.text !== "string") return [];
        const response = item.response;
        return [
          {
            id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
            text: item.text,
            createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
            response: response === "done" || response === "later" || response === "talk" ? response : null,
          },
        ];
      })
    : [];
  if (isRecord(value.chores)) {
    for (const id of ["living", "kitchen", "trash"] as const) {
      const mark = value.chores[id];
      if (!isRecord(mark)) continue;
      base.chores[id] = {
        by: mark.by === "me" || mark.by === "them" ? mark.by : null,
        at: typeof mark.at === "string" ? mark.at : null,
      };
    }
  }
  return base;
}

function parseDemo(value: unknown): DemoState | null {
  if (!isRecord(value)) return null;
  const state = emptyDemo();
  state.myRoom = value.myRoom === null ? null : parseRoom(value.myRoom);
  state.savedRoomIds = stringList(value.savedRoomIds);
  state.savedListingIds = stringList(value.savedListingIds);
  state.theirSavedListingIds = stringMap(value.theirSavedListingIds);
  state.sharedListingIds = stringMap(value.sharedListingIds);
  if (isRecord(value.pairs)) {
    for (const [key, item] of Object.entries(value.pairs)) state.pairs[key] = parsePair(item);
  }
  return state;
}

function readRaw(): unknown {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

let current = parseDemo(readRaw()) ?? emptyDemo();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function write(next: DemoState) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 浏览器拒绝写入时，这次打开仍然看得到。
  }
  emit();
}

function update(recipe: (state: DemoState) => DemoState) {
  write(recipe(current));
}

function withPair(state: DemoState, personId: string, recipe: (pair: PairRecord) => PairRecord): DemoState {
  const pair = state.pairs[personId] ?? emptyPair();
  return { ...state, pairs: { ...state.pairs, [personId]: recipe(pair) } };
}

function stamp() {
  return new Date().toISOString();
}

export function useDemo(): DemoState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => current,
  );
}

export function pairOf(state: DemoState, personId: string): PairRecord {
  return state.pairs[personId] ?? emptyPair();
}

export function clearDemoData() {
  write(emptyDemo());
}

export function saveMyRoom(room: PublishedRoom) {
  update((state) => ({ ...state, myRoom: room }));
}

export function toggleSavedRoom(roomId: string) {
  update((state) => ({
    ...state,
    savedRoomIds: state.savedRoomIds.includes(roomId)
      ? state.savedRoomIds.filter((id) => id !== roomId)
      : [...state.savedRoomIds, roomId],
  }));
}

export function toggleSavedListing(listingId: string) {
  update((state) => ({
    ...state,
    savedListingIds: state.savedListingIds.includes(listingId)
      ? state.savedListingIds.filter((id) => id !== listingId)
      : [...state.savedListingIds, listingId],
  }));
}

export function simulateTheySavedListing(personId: string, listingId: string) {
  update((state) => {
    const currentIds = state.theirSavedListingIds[personId] ?? [];
    const nextIds = currentIds.includes(listingId) ? currentIds : [...currentIds, listingId];
    return { ...state, theirSavedListingIds: { ...state.theirSavedListingIds, [personId]: nextIds } };
  });
}

export function shareListing(personId: string, listingId: string) {
  update((state) => {
    const currentIds = state.sharedListingIds[personId] ?? [];
    if (currentIds.includes(listingId)) return state;
    return { ...state, sharedListingIds: { ...state.sharedListingIds, [personId]: [...currentIds, listingId] } };
  });
}

export function proposeTime(
  personId: string,
  place: { placeKind: Viewing["placeKind"]; placeId: string; placeLabel: string },
  by: Side,
  when: string,
) {
  update((state) =>
    withPair(state, personId, (pair) => {
      const existing = pair.viewings.find(
        (item) => item.placeId === place.placeId && item.status !== "cancelled" && item.status !== "done",
      );
      if (!existing) {
        const created = propose(
          createViewing({ id: crypto.randomUUID(), ...place }),
          by,
          when,
        );
        return { ...pair, viewings: [...pair.viewings, created] };
      }
      return {
        ...pair,
        viewings: pair.viewings.map((item) => (item.id === existing.id ? propose(item, by, when) : item)),
      };
    }),
  );
}

export function agreeTime(personId: string, viewingId: string, by: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      viewings: pair.viewings.map((item) => (item.id === viewingId ? agree(item, by) : item)),
    })),
  );
}

export function declineTime(personId: string, viewingId: string) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      viewings: pair.viewings.map((item) => (item.id === viewingId ? decline(item) : item)),
    })),
  );
}

export function finishVisit(personId: string, viewingId: string) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      viewings: pair.viewings.map((item) => (item.id === viewingId ? markVisited(item) : item)),
    })),
  );
}

export function setRoomAnswer(personId: string, viewingId: string, by: Side, answer: "yes" | "no") {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      viewings: pair.viewings.map((item) => (item.id === viewingId ? answerRoom(item, by, answer) : item)),
    })),
  );
}

export function setListingFeedback(personId: string, viewingId: string, by: Side, feedback: VisitFeedback) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      viewings: pair.viewings.map((item) => (item.id === viewingId ? answerListing(item, by, feedback) : item)),
    })),
  );
}

export function setMySearch(personId: string, id: SearchFieldId, value: SearchValue) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, search: withMyItem(pair.search, id, value) })),
  );
}

export function acceptSearchItem(personId: string, id: SearchFieldId) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, search: acceptTheirItem(pair.search, id) })),
  );
}

export function simulateTheirSearch(personId: string) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      search: { ...pair.search, theirs: demoTheirSearch, myConfirmed: false, theirConfirmed: false },
    })),
  );
}

export function simulateTheyCopyMe(personId: string) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, search: copyMineToTheirs(pair.search) })),
  );
}

export function setPlaceWish(personId: string, side: Side, id: PlaceWishId, pick: PlaceWishPick | null) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      placeWishes: writePlaceWish(pair.placeWishes, side, id, pick),
    })),
  );
}

export function confirmPlaceWishSide(personId: string, side: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      placeWishes: confirmPlaceWishes(pair.placeWishes, side),
    })),
  );
}

export function confirmSearch(personId: string, side: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, search: confirmSearchSide(pair.search, side) })),
  );
}

export function saveRent(personId: string, rent: RentDraft) {
  update((state) => withPair(state, personId, (pair) => ({ ...pair, rent })));
}

export function confirmRent(personId: string, side: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, rent: confirmRentSide(pair.rent, side, stamp()) })),
  );
}

export function reopenRentSplit(personId: string) {
  update((state) => withPair(state, personId, (pair) => ({ ...pair, rent: reopenRent(pair.rent) })));
}

export function saveMyRules(personId: string, lines: RuleLine[]) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, rules: submitMyRules(pair.rules, lines, stamp()) })),
  );
}

export function simulateTheirRuleSheet(personId: string) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, rules: submitTheirRules(pair.rules, stamp()) })),
  );
}

export function acceptRule(personId: string, topic: string) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, rules: acceptTheirTopic(pair.rules, topic, stamp()) })),
  );
}

export function proposeRule(personId: string, line: RuleLine) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, rules: proposeMyTopic(pair.rules, line, stamp()) })),
  );
}

export function refuseRule(personId: string, topic: string, side: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({ ...pair, rules: cannotAgree(pair.rules, topic, side) })),
  );
}

export function decideToLive(personId: string, side: Side) {
  update((state) =>
    withPair(state, personId, (pair) => {
      if (!canMoveIn(pair)) return pair;
      if (side === "me") return { ...pair, myMoveIn: true };
      return { ...pair, theirMoveIn: true };
    }),
  );
}

export function addAgreement(personId: string, category: AgreementCategory, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      agreements: [
        ...pair.agreements,
        {
          id: crypto.randomUUID(),
          category,
          text: trimmed.slice(0, 80),
          myConfirmed: false,
          theirConfirmed: false,
          updatedAt: stamp(),
        },
      ],
    })),
  );
}

export function editAgreement(personId: string, id: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      agreements: pair.agreements.map((item) =>
        item.id === id
          ? { ...item, text: trimmed.slice(0, 80), myConfirmed: false, theirConfirmed: false, updatedAt: stamp() }
          : item,
      ),
    })),
  );
}

export function confirmAgreement(personId: string, id: string, side: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      agreements: pair.agreements.map((item) => {
        if (item.id !== id) return item;
        if (side === "me") return { ...item, myConfirmed: true };
        return { ...item, theirConfirmed: true };
      }),
    })),
  );
}

export function sendRequest(personId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      requests: [
        ...pair.requests,
        { id: crypto.randomUUID(), text: trimmed.slice(0, 80), sentAt: stamp(), reply: null },
      ],
    })),
  );
}

export function replyRequest(personId: string, id: string, reply: "ok" | "talk") {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      requests: pair.requests.map((item) => (item.id === id ? { ...item, reply } : item)),
    })),
  );
}

export function addReminder(personId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      reminders: [
        ...pair.reminders,
        { id: crypto.randomUUID(), text: trimmed.slice(0, 80), createdAt: stamp(), response: null },
      ],
    })),
  );
}

export function respondReminder(personId: string, id: string, response: "done" | "later" | "talk") {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      reminders: pair.reminders.map((item) => (item.id === id ? { ...item, response } : item)),
    })),
  );
}

export function markChore(personId: string, chore: ChoreId, by: Side) {
  update((state) =>
    withPair(state, personId, (pair) => ({
      ...pair,
      chores: { ...pair.chores, [chore]: { by, at: stamp() } },
    })),
  );
}

export function roomById(state: DemoState, id: string): PublishedRoom | null {
  if (state.myRoom?.id === id) return state.myRoom;
  return findMockRoom(id);
}
