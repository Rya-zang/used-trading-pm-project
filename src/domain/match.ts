import {
  budgetBands,
  cleanlinessHabits,
  cookingHabits,
  householdSizes,
  moveInOptions,
  sleepHabits,
  socialHabits,
  type HouseholdSize,
} from "./catalog.ts";
import type { RoommateProfile } from "./profile.ts";

/** 住房 50（片区 20、预算 20、入住 10）+ 习惯 35（作息 12、整洁 10、社交 7、做饭 6）+ 性格 15。 */
export const SCORE_WEIGHTS = {
  area: 20,
  budget: 20,
  moveIn: 10,
  sleep: 12,
  cleanliness: 10,
  social: 7,
  cooking: 6,
  personality: 15,
} as const;

const HOUSING_FIT = 40;
const HABITS_FIT = 24;
const PERSONALITY_WHEN_MISSING = 8;

export type MatchTier = "both-fit" | "housing-fit-habits-differ" | "talk-more";
export type HardBlock = "gender" | "couple" | "household";

export interface MatchExplanation {
  total: number;
  housing: number;
  habits: number;
  personality: number;
  area: number;
  budget: number;
  moveIn: number;
  sleep: number;
  cleanliness: number;
  social: number;
  cooking: number;
  tier: MatchTier;
  highlights: readonly string[];
  conflicts: readonly string[];
  couple: string;
  household: string;
  personalityNote: string;
}

export interface Suggestion {
  person: RoommateProfile;
  match: MatchExplanation;
}

export function bringsPartner(
  person: Pick<RoommateProfile, "relationship" | "partnerMoveIn">,
): boolean {
  return person.relationship === "partner" && person.partnerMoveIn === "together";
}

export function occupantCount(
  person: Pick<RoommateProfile, "relationship" | "partnerMoveIn">,
): number {
  return bringsPartner(person) ? 2 : 1;
}

function householdLimit(size: HouseholdSize): number {
  if (size === "2") return 2;
  if (size === "3") return 3;
  return Number.POSITIVE_INFINITY;
}

export function genderAllows(preference: RoommateProfile["genderPreference"], gender: RoommateProfile["gender"]): boolean {
  return preference === "any" || preference === gender;
}

export function hardBlocks(me: RoommateProfile, them: RoommateProfile): readonly HardBlock[] {
  const blocks: HardBlock[] = [];
  const genderOk =
    genderAllows(me.genderPreference, them.gender) &&
    genderAllows(them.genderPreference, me.gender);
  if (!genderOk) {
    blocks.push("gender");
  }
  const meBrings = bringsPartner(me);
  const themBrings = bringsPartner(them);
  if ((themBrings && me.coupleAcceptance === "no") || (meBrings && them.coupleAcceptance === "no")) {
    blocks.push("couple");
  }
  const sameSize = me.householdSize === them.householdSize;
  const fits = occupantCount(me) + occupantCount(them) <= householdLimit(me.householdSize);
  if (!sameSize || !fits) {
    blocks.push("household");
  }
  return blocks;
}

function indexOf(ids: readonly string[], id: string): number {
  return ids.indexOf(id);
}

function ordinalScore(max: number, left: string, right: string, order: readonly string[]): number {
  const distance = Math.abs(indexOf(order, left) - indexOf(order, right));
  if (distance <= 0) return max;
  if (distance === 1) return Math.floor(max / 2);
  return 0;
}

function areaScore(me: RoommateProfile, them: RoommateProfile): number {
  if (me.areaId === them.areaId) return SCORE_WEIGHTS.area;
  if (me.cityId === them.cityId) return 10;
  return 0;
}

function budgetScore(me: RoommateProfile, them: RoommateProfile): number {
  const left = indexOf(budgetBands.map((item) => item.id), me.budget);
  const right = indexOf(budgetBands.map((item) => item.id), them.budget);
  const distance = Math.abs(left - right);
  if (distance === 0) return SCORE_WEIGHTS.budget;
  if (distance === 1) return 12;
  if (distance === 2) return 6;
  return 0;
}

function moveInScore(me: RoommateProfile, them: RoommateProfile): number {
  if (me.moveIn === "anytime" || them.moveIn === "anytime" || me.moveIn === them.moveIn) {
    return SCORE_WEIGHTS.moveIn;
  }
  const order = moveInOptions.map((item) => item.id);
  const distance = Math.abs(indexOf(order, me.moveIn) - indexOf(order, them.moveIn));
  if (distance === 1) return 6;
  if (distance === 2) return 3;
  return 0;
}

function personalityScore(me: RoommateProfile, them: RoommateProfile): number {
  if (!me.mbti || !them.mbti) return PERSONALITY_WHEN_MISSING;
  let shared = 0;
  for (let index = 0; index < 4; index += 1) {
    if (me.mbti[index] === them.mbti[index]) shared += 1;
  }
  return [2, 6, 10, 13, 15][shared] ?? PERSONALITY_WHEN_MISSING;
}

function tierFor(housing: number, habits: number): MatchTier {
  if (housing >= HOUSING_FIT && habits >= HABITS_FIT) return "both-fit";
  if (housing >= HOUSING_FIT) return "housing-fit-habits-differ";
  return "talk-more";
}

function coupleText(me: RoommateProfile, them: RoommateProfile): string {
  const meBrings = bringsPartner(me);
  const themBrings = bringsPartner(them);
  if (meBrings && themBrings) {
    return "双方都会和伴侣一起入住。";
  }
  if (themBrings) {
    return me.coupleAcceptance === "yes"
      ? "对方会和伴侣一起住，你填写的是可以接受。"
      : "对方会和伴侣一起住，你填写的是可以商量。";
  }
  if (meBrings) {
    return them.coupleAcceptance === "yes"
      ? "你会和伴侣一起住，对方填写的是可以接受。"
      : "你会和伴侣一起住，对方填写的是可以商量。";
  }
  if (me.relationship === "partner" || them.relationship === "partner") {
    return "有人有伴侣，但伴侣不一起入住。";
  }
  return "两人都是一个人入住。";
}

function householdText(me: RoommateProfile, them: RoommateProfile): string {
  const sizeLabel = householdSizes.find((item) => item.id === me.householdSize)?.label ?? "";
  const total = occupantCount(me) + occupantCount(them);
  if (me.householdSize === "4+") {
    return `都希望 ${sizeLabel}一起住。按现在的填写，一共会入住 ${total} 人，之后还可以再找。`;
  }
  const limit = householdLimit(me.householdSize);
  if (total === limit) {
    return `都希望 ${sizeLabel}一起住。按现在的填写，一共会入住 ${total} 人，刚好满员。`;
  }
  return `都希望 ${sizeLabel}一起住。按现在的填写，一共会入住 ${total} 人，还空 ${limit - total} 个位置。`;
}

function habitConflict(score: number, max: number, mild: string, strong: string): string | null {
  if (score === max) return null;
  if (score === 0) return strong;
  return mild;
}

function buildNotes(
  me: RoommateProfile,
  them: RoommateProfile,
  parts: {
    area: number;
    budget: number;
    moveIn: number;
    sleep: number;
    cleanliness: number;
    social: number;
    cooking: number;
    personality: number;
  },
): { highlights: string[]; conflicts: string[] } {
  const highlights: string[] = [];
  const conflicts: string[] = [];

  if (parts.area === SCORE_WEIGHTS.area) highlights.push("同一个片区");
  else if (parts.area === 10) highlights.push("同一座城市，片区不同");
  else conflicts.push("不在同一座城市");

  if (parts.budget === SCORE_WEIGHTS.budget) highlights.push("预算区间一样");
  else if (parts.budget === 12) highlights.push("预算比较接近");
  else if (parts.budget === 6) conflicts.push("预算差了两档");
  else conflicts.push("预算差得比较多");

  if (parts.moveIn === SCORE_WEIGHTS.moveIn) highlights.push("入住时间很接近");
  else if (parts.moveIn === 6) highlights.push("入住时间差得不多");
  else if (parts.moveIn === 3) conflicts.push("入住时间大概差了两个月");
  else conflicts.push("入住时间差得比较远");

  const sleepNote = habitConflict(parts.sleep, SCORE_WEIGHTS.sleep, "作息有一点差别", "作息差得比较多");
  const cleanNote = habitConflict(
    parts.cleanliness,
    SCORE_WEIGHTS.cleanliness,
    "对整洁的在意程度有一点差别",
    "对整洁的在意程度差得比较多",
  );
  const socialNote = habitConflict(
    parts.social,
    SCORE_WEIGHTS.social,
    "在家见朋友的期待有一点差别",
    "在家见朋友的期待差得比较多",
  );
  const cookNote = habitConflict(
    parts.cooking,
    SCORE_WEIGHTS.cooking,
    "做饭频率有一点差别",
    "做饭频率差得比较多",
  );
  if (parts.sleep === SCORE_WEIGHTS.sleep) highlights.push("作息接近");
  if (parts.cleanliness === SCORE_WEIGHTS.cleanliness) highlights.push("整洁习惯接近");
  if (parts.social === SCORE_WEIGHTS.social) highlights.push("在家的节奏接近");
  if (parts.cooking === SCORE_WEIGHTS.cooking) highlights.push("做饭习惯接近");
  for (const note of [sleepNote, cleanNote, socialNote, cookNote]) {
    if (note) conflicts.push(note);
  }

  if (me.mbti && them.mbti && parts.personality >= 13) {
    highlights.push("填写的性格标签比较接近（不是科学结论）");
  }
  if (me.mbti && them.mbti && parts.personality <= 6) {
    conflicts.push("性格标签差得比较多（不是科学结论）");
  }

  return {
    highlights: highlights.length > 0 ? highlights.slice(0, 8) : ["可以先从自我介绍聊起"],
    conflicts: conflicts.length > 0 ? conflicts.slice(0, 4) : ["资料里没有特别要提前说开的差别"],
  };
}

export function explainMatch(me: RoommateProfile, them: RoommateProfile): MatchExplanation {
  const area = areaScore(me, them);
  const budget = budgetScore(me, them);
  const moveIn = moveInScore(me, them);
  const sleep = ordinalScore(SCORE_WEIGHTS.sleep, me.sleep, them.sleep, sleepHabits.map((item) => item.id));
  const cleanliness = ordinalScore(
    SCORE_WEIGHTS.cleanliness,
    me.cleanliness,
    them.cleanliness,
    cleanlinessHabits.map((item) => item.id),
  );
  const social = ordinalScore(SCORE_WEIGHTS.social, me.social, them.social, socialHabits.map((item) => item.id));
  const cooking = ordinalScore(
    SCORE_WEIGHTS.cooking,
    me.cooking,
    them.cooking,
    cookingHabits.map((item) => item.id),
  );
  const personality = personalityScore(me, them);
  const housing = area + budget + moveIn;
  const habits = sleep + cleanliness + social + cooking;
  const notes = buildNotes(me, them, {
    area,
    budget,
    moveIn,
    sleep,
    cleanliness,
    social,
    cooking,
    personality,
  });
  const personalityNote =
    me.mbti && them.mbti
      ? "按四个字母相同的个数给分，只作参考。"
      : "有人没填 MBTI，这一项按 8 分计，避免空白把参考分拉得太低。";

  return {
    total: housing + habits + personality,
    housing,
    habits,
    personality,
    area,
    budget,
    moveIn,
    sleep,
    cleanliness,
    social,
    cooking,
    tier: tierFor(housing, habits),
    highlights: notes.highlights,
    conflicts: notes.conflicts,
    couple: coupleText(me, them),
    household: householdText(me, them),
    personalityNote,
  };
}

export function suggestRoommates(
  me: RoommateProfile,
  people: readonly RoommateProfile[],
  minScore: number,
): readonly Suggestion[] {
  return people
    .filter((person) => person.id !== me.id && hardBlocks(me, person).length === 0)
    .map((person) => ({ person, match: explainMatch(me, person) }))
    .filter((item) => item.match.total >= minScore)
    .sort(
      (left, right) =>
        right.match.total - left.match.total ||
        left.person.nickname.localeCompare(right.person.nickname, "zh"),
    );
}

export const tierLabel: Record<MatchTier, string> = {
  "both-fit": "两边都比较合适",
  "housing-fit-habits-differ": "住房合适，生活习惯有差别",
  "talk-more": "住房大致合适，可以再聊聊",
};

export const hardBlockLabel: Record<HardBlock, string> = {
  gender: "性别要求对不上。你希望的性别，和对方希望的性别，需要双方都说得通。",
  couple: "有人会和伴侣一起住，另一方填写了不接受。",
  household: "希望一起住的人数不一样，或者两个人加起来已经超过这个人数。",
};
