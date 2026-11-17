import { useSyncExternalStore } from "react";
import { isRentalMode } from "./catalog.ts";
import {
  draftFromProfile,
  draftInProgress,
  emptyDraft,
  parseDraft,
  parseProfile,
  type OnboardingDraft,
  type RoommateProfile,
} from "./profile.ts";

const PROFILE_KEY = "shunxin.profile.v1";
const DRAFT_KEY = "shunxin.draft.v1";
const APPLICATIONS_KEY = "shunxin.applications.v1";
const MESSAGES_KEY = "shunxin.messages.v1";
const MIN_SCORE_KEY = "shunxin.min-score.v1";

export const CURRENT_USER_ID = "me";
export const DEFAULT_MIN_SCORE = 40;

export interface ApplicationRecord {
  myAccepted: boolean;
  theirAccepted: boolean;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  personId: string;
  sender: "me" | "them";
  text: string;
  createdAt: string;
}

type ApplicationMap = Record<string, ApplicationRecord>;

function readRaw(key: string): unknown {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: unknown): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeRaw(key: string) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // 浏览器拒绝访问时，内存里的状态仍然更新。
  }
}

function createStore<T>(key: string, initial: T, parse: (value: unknown) => T | null) {
  let current = parse(readRaw(key)) ?? initial;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return current;
    },
    write(next: T) {
      current = next;
      writeRaw(key, next);
      emit();
    },
    reset() {
      current = initial;
      removeRaw(key);
      emit();
    },
  };
}

function parseApplicationMap(value: unknown): ApplicationMap | null {
  if (!value || typeof value !== "object") return null;
  const next: ApplicationMap = {};
  for (const [id, item] of Object.entries(value)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.myAccepted !== "boolean" || typeof record.theirAccepted !== "boolean") {
      continue;
    }
    next[id] = {
      myAccepted: record.myAccepted,
      theirAccepted: record.theirAccepted,
      updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : new Date(0).toISOString(),
    };
  }
  return next;
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.personId !== "string") continue;
    if (record.sender !== "me" && record.sender !== "them") continue;
    if (typeof record.text !== "string" || record.text.trim() === "") continue;
    messages.push({
      id: record.id,
      personId: record.personId,
      sender: record.sender,
      text: record.text.slice(0, 500),
      createdAt: typeof record.createdAt === "string" ? record.createdAt : new Date(0).toISOString(),
    });
  }
  return messages;
}

function parseMinScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 0 || value > 100) return null;
  return value;
}

const profileStore = createStore<RoommateProfile | null>(PROFILE_KEY, null, parseProfile);
const draftStore = createStore<OnboardingDraft | null>(DRAFT_KEY, null, parseDraft);
const applicationStore = createStore<ApplicationMap>(APPLICATIONS_KEY, {}, parseApplicationMap);
const messageStore = createStore<readonly ChatMessage[]>(MESSAGES_KEY, [], parseMessages);
const minScoreStore = createStore<number>(MIN_SCORE_KEY, DEFAULT_MIN_SCORE, parseMinScore);

function useStore<T>(store: {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
}): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useSavedProfile(): RoommateProfile | null {
  return useStore(profileStore);
}

export function useOnboardingDraft(): OnboardingDraft | null {
  return useStore(draftStore);
}

export function useApplications(): ApplicationMap {
  return useStore(applicationStore);
}

export function useMessages(): readonly ChatMessage[] {
  return useStore(messageStore);
}

export function useMinScore(): number {
  return useStore(minScoreStore);
}

export function saveProfile(profile: RoommateProfile) {
  profileStore.write(profile);
  draftStore.reset();
}

export function saveDraft(draft: OnboardingDraft) {
  draftStore.write(draft);
}

export function clearDraft() {
  draftStore.reset();
}

export function setMinScore(score: number) {
  const next = Math.min(100, Math.max(0, Math.round(score)));
  minScoreStore.write(next);
}

export function isMutual(record: ApplicationRecord | undefined): boolean {
  return Boolean(record?.myAccepted && record.theirAccepted);
}

export function applyToPerson(personId: string) {
  const current = applicationStore.getSnapshot();
  const previous = current[personId];
  applicationStore.write({
    ...current,
    [personId]: {
      myAccepted: true,
      theirAccepted: previous?.theirAccepted ?? false,
      updatedAt: new Date().toISOString(),
    },
  });
}

export function simulateTheirAcceptance(personId: string) {
  const current = applicationStore.getSnapshot();
  const previous = current[personId];
  if (!previous?.myAccepted) return;
  applicationStore.write({
    ...current,
    [personId]: {
      myAccepted: true,
      theirAccepted: true,
      updatedAt: new Date().toISOString(),
    },
  });
}

export function receiveTheirApplication(personId: string) {
  const current = applicationStore.getSnapshot();
  const previous = current[personId];
  applicationStore.write({
    ...current,
    [personId]: {
      myAccepted: previous?.myAccepted ?? false,
      theirAccepted: true,
      updatedAt: new Date().toISOString(),
    },
  });
}

export function acceptTheirApplication(personId: string) {
  const current = applicationStore.getSnapshot();
  const previous = current[personId];
  if (!previous?.theirAccepted) return;
  applicationStore.write({
    ...current,
    [personId]: {
      myAccepted: true,
      theirAccepted: true,
      updatedAt: new Date().toISOString(),
    },
  });
}

export function sendMessage(personId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    personId,
    sender: "me",
    text: trimmed.slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  messageStore.write([...messageStore.getSnapshot(), message]);
}

export function clearLocalRoommateData() {
  profileStore.reset();
  draftStore.reset();
  applicationStore.reset();
  messageStore.reset();
  minScoreStore.reset();
}

export function initialDraftFromLocation(search: string): OnboardingDraft {
  const params = new URLSearchParams(search);
  const modeValue = params.get("mode");
  const mode = isRentalMode(modeValue) ? modeValue : null;
  const profile = profileStore.getSnapshot();

  if (params.get("edit") === "1" && profile) {
    return draftFromProfile(profile);
  }

  const draft = draftStore.getSnapshot();
  if (draft && draftInProgress(draft)) {
    return draft;
  }

  if (profile) {
    const next = draftFromProfile(profile);
    if (mode) next.rentalMode = mode;
    return next;
  }

  const empty = emptyDraft();
  if (mode) empty.rentalMode = mode;
  return empty;
}
