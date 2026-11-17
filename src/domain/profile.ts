import {
  areaBelongsToCity,
  isAreaId,
  isAvatarId,
  isBudgetBand,
  isCityId,
  isCleanlinessHabit,
  isCookingHabit,
  isCoupleAcceptance,
  isGender,
  isGenderPreference,
  isHouseholdSize,
  isMbtiType,
  isMoveInTime,
  isPartnerMoveIn,
  isRelationship,
  isRentalMode,
  isSleepHabit,
  isSocialHabit,
  type AreaId,
  type AvatarId,
  type BudgetBand,
  type CityId,
  type CleanlinessHabit,
  type CookingHabit,
  type CoupleAcceptance,
  type Gender,
  type GenderPreference,
  type HouseholdSize,
  type MbtiType,
  type MoveInTime,
  type PartnerMoveIn,
  type Relationship,
  type RentalMode,
  type SleepHabit,
  type SocialHabit,
} from "./catalog.ts";

export interface RoommateProfile {
  id: string;
  nickname: string;
  age: number;
  gender: Gender;
  avatarId: AvatarId;
  bio: string;
  cityId: CityId;
  areaId: AreaId;
  budget: BudgetBand;
  moveIn: MoveInTime;
  rentalMode: RentalMode;
  genderPreference: GenderPreference;
  relationship: Relationship;
  partnerMoveIn: PartnerMoveIn | null;
  coupleAcceptance: CoupleAcceptance;
  householdSize: HouseholdSize;
  sleep: SleepHabit;
  cleanliness: CleanlinessHabit;
  social: SocialHabit;
  cooking: CookingHabit;
  mbti: MbtiType | null;
}

export interface OnboardingDraft {
  step: number;
  nickname: string;
  age: string;
  gender: Gender | null;
  avatarId: AvatarId | null;
  bio: string;
  cityId: CityId | null;
  areaId: AreaId | null;
  budget: BudgetBand | null;
  moveIn: MoveInTime | null;
  rentalMode: RentalMode | null;
  genderPreference: GenderPreference | null;
  relationship: Relationship | null;
  partnerMoveIn: PartnerMoveIn | null;
  coupleAcceptance: CoupleAcceptance | null;
  householdSize: HouseholdSize | null;
  sleep: SleepHabit | null;
  cleanliness: CleanlinessHabit | null;
  social: SocialHabit | null;
  cooking: CookingHabit | null;
  mbti: MbtiType | null;
}

export const ONBOARDING_STEP_COUNT = 8;

export function emptyDraft(): OnboardingDraft {
  return {
    step: 0,
    nickname: "",
    age: "",
    gender: null,
    avatarId: null,
    bio: "",
    cityId: null,
    areaId: null,
    budget: null,
    moveIn: null,
    rentalMode: null,
    genderPreference: null,
    relationship: null,
    partnerMoveIn: null,
    coupleAcceptance: null,
    householdSize: null,
    sleep: null,
    cleanliness: null,
    social: null,
    cooking: null,
    mbti: null,
  };
}

export function nicknameError(value: string): string | null {
  const nickname = value.trim();
  if (!nickname) {
    return "先写一个昵称。";
  }
  if (nickname.length > 12) {
    return "昵称最多 12 个字。";
  }
  return null;
}

export function ageError(value: string): string | null {
  if (!/^\d{1,2}$/.test(value)) {
    return "填写 18 到 60 之间的整数。";
  }
  const age = Number(value);
  if (age < 18 || age > 60) {
    return "填写 18 到 60 之间的整数。";
  }
  return null;
}

export function bioError(value: string): string | null {
  if (value.trim().length > 80) {
    return "介绍最多 80 个字。";
  }
  return null;
}

export function stepError(draft: OnboardingDraft, step: number): string | null {
  switch (step) {
    case 0: {
      const nickname = nicknameError(draft.nickname);
      if (nickname) return nickname;
      const age = ageError(draft.age);
      if (age) return age;
      if (!draft.gender) return "选一个性别。";
      if (!draft.avatarId) return "选一个头像。";
      return null;
    }
    case 1:
      if (!draft.cityId) return "选一座城市。";
      if (!draft.areaId) return "选一个片区。";
      if (!draft.budget) return "选一个预算。";
      if (!draft.moveIn) return "选一个入住时间。";
      return null;
    case 2:
      return draft.rentalMode ? null : "选一种租房方式。";
    case 3:
      return draft.genderPreference ? null : "选你希望室友的性别。";
    case 4:
      if (!draft.relationship) return "选你现在是一个人住，还是有伴侣。";
      if (draft.relationship === "partner" && !draft.partnerMoveIn) {
        return "选伴侣会不会一起住。";
      }
      if (!draft.coupleAcceptance) return "选你能否接受情侣一起住。";
      if (!draft.householdSize) return "选希望几个人一起住。";
      return null;
    case 5:
      if (!draft.sleep || !draft.cleanliness || !draft.social || !draft.cooking) {
        return "四项生活习惯都选一下。";
      }
      return null;
    default:
      return null;
  }
}

export function firstInvalidStep(draft: OnboardingDraft): number | null {
  for (let step = 0; step < ONBOARDING_STEP_COUNT - 1; step += 1) {
    if (stepError(draft, step)) {
      return step;
    }
  }
  return null;
}

export function draftToProfile(draft: OnboardingDraft, id: string): RoommateProfile | null {
  if (firstInvalidStep(draft) !== null) {
    return null;
  }
  if (
    !draft.gender ||
    !draft.avatarId ||
    !draft.cityId ||
    !draft.areaId ||
    !draft.budget ||
    !draft.moveIn ||
    !draft.rentalMode ||
    !draft.genderPreference ||
    !draft.relationship ||
    !draft.coupleAcceptance ||
    !draft.householdSize ||
    !draft.sleep ||
    !draft.cleanliness ||
    !draft.social ||
    !draft.cooking
  ) {
    return null;
  }
  if (!areaBelongsToCity(draft.cityId, draft.areaId)) {
    return null;
  }
  const partnerMoveIn = draft.relationship === "partner" ? draft.partnerMoveIn : null;
  if (draft.relationship === "partner" && !partnerMoveIn) {
    return null;
  }
  const age = Number(draft.age);
  return {
    id,
    nickname: draft.nickname.trim(),
    age,
    gender: draft.gender,
    avatarId: draft.avatarId,
    bio: draft.bio.trim(),
    cityId: draft.cityId,
    areaId: draft.areaId,
    budget: draft.budget,
    moveIn: draft.moveIn,
    rentalMode: draft.rentalMode,
    genderPreference: draft.genderPreference,
    relationship: draft.relationship,
    partnerMoveIn,
    coupleAcceptance: draft.coupleAcceptance,
    householdSize: draft.householdSize,
    sleep: draft.sleep,
    cleanliness: draft.cleanliness,
    social: draft.social,
    cooking: draft.cooking,
    mbti: draft.mbti,
  };
}

export function draftFromProfile(profile: RoommateProfile): OnboardingDraft {
  return {
    step: 0,
    nickname: profile.nickname,
    age: String(profile.age),
    gender: profile.gender,
    avatarId: profile.avatarId,
    bio: profile.bio,
    cityId: profile.cityId,
    areaId: profile.areaId,
    budget: profile.budget,
    moveIn: profile.moveIn,
    rentalMode: profile.rentalMode,
    genderPreference: profile.genderPreference,
    relationship: profile.relationship,
    partnerMoveIn: profile.partnerMoveIn,
    coupleAcceptance: profile.coupleAcceptance,
    householdSize: profile.householdSize,
    sleep: profile.sleep,
    cleanliness: profile.cleanliness,
    social: profile.social,
    cooking: profile.cooking,
    mbti: profile.mbti,
  };
}

export function draftInProgress(draft: OnboardingDraft | null): boolean {
  if (!draft) {
    return false;
  }
  return (
    draft.step > 0 ||
    draft.nickname.trim() !== "" ||
    draft.gender !== null ||
    draft.cityId !== null ||
    draft.rentalMode !== null ||
    draft.sleep !== null
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

export function parseProfile(value: unknown): RoommateProfile | null {
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record.id !== "string" || record.id.trim() === "") return null;
  if (typeof record.nickname !== "string" || nicknameError(record.nickname)) return null;
  if (typeof record.age !== "number" || !Number.isInteger(record.age)) return null;
  if (record.age < 18 || record.age > 60) return null;
  if (!isGender(record.gender) || !isAvatarId(record.avatarId)) return null;
  if (typeof record.bio !== "string" || bioError(record.bio)) return null;
  if (!isCityId(record.cityId) || !isAreaId(record.areaId)) return null;
  if (!areaBelongsToCity(record.cityId, record.areaId)) return null;
  if (!isBudgetBand(record.budget) || !isMoveInTime(record.moveIn)) return null;
  if (!isRentalMode(record.rentalMode) || !isGenderPreference(record.genderPreference)) {
    return null;
  }
  if (!isRelationship(record.relationship)) return null;
  if (!isCoupleAcceptance(record.coupleAcceptance) || !isHouseholdSize(record.householdSize)) {
    return null;
  }
  if (
    !isSleepHabit(record.sleep) ||
    !isCleanlinessHabit(record.cleanliness) ||
    !isSocialHabit(record.social) ||
    !isCookingHabit(record.cooking)
  ) {
    return null;
  }
  let partnerMoveIn: PartnerMoveIn | null = null;
  if (record.relationship === "partner") {
    if (!isPartnerMoveIn(record.partnerMoveIn)) return null;
    partnerMoveIn = record.partnerMoveIn;
  } else if (record.partnerMoveIn !== null) {
    return null;
  }
  if (record.mbti !== null && !isMbtiType(record.mbti)) return null;
  return {
    id: record.id,
    nickname: record.nickname.trim(),
    age: record.age,
    gender: record.gender,
    avatarId: record.avatarId,
    bio: record.bio.trim(),
    cityId: record.cityId,
    areaId: record.areaId,
    budget: record.budget,
    moveIn: record.moveIn,
    rentalMode: record.rentalMode,
    genderPreference: record.genderPreference,
    relationship: record.relationship,
    partnerMoveIn,
    coupleAcceptance: record.coupleAcceptance,
    householdSize: record.householdSize,
    sleep: record.sleep,
    cleanliness: record.cleanliness,
    social: record.social,
    cooking: record.cooking,
    mbti: isMbtiType(record.mbti) ? record.mbti : null,
  };
}

function optional<T>(value: unknown, guard: (value: unknown) => value is T): T | null {
  return guard(value) ? value : null;
}

export function parseDraft(value: unknown): OnboardingDraft | null {
  const record = asRecord(value);
  if (!record) return null;
  const draft = emptyDraft();
  if (typeof record.step === "number" && Number.isInteger(record.step)) {
    let step = record.step;
    if (record.flowVersion !== 2 && step > 1) step -= 1;
    draft.step = Math.min(Math.max(step, 0), ONBOARDING_STEP_COUNT - 1);
  }
  draft.nickname = typeof record.nickname === "string" ? record.nickname.slice(0, 12) : "";
  draft.age = typeof record.age === "string" ? record.age.replace(/\D/g, "").slice(0, 2) : "";
  draft.gender = optional(record.gender, isGender);
  draft.avatarId = optional(record.avatarId, isAvatarId);
  draft.bio = typeof record.bio === "string" ? record.bio.slice(0, 80) : "";
  draft.cityId = optional(record.cityId, isCityId);
  draft.areaId = optional(record.areaId, isAreaId);
  if (draft.cityId && draft.areaId && !areaBelongsToCity(draft.cityId, draft.areaId)) {
    draft.areaId = null;
  }
  draft.budget = optional(record.budget, isBudgetBand);
  draft.moveIn = optional(record.moveIn, isMoveInTime);
  draft.rentalMode = optional(record.rentalMode, isRentalMode);
  draft.genderPreference = optional(record.genderPreference, isGenderPreference);
  draft.relationship = optional(record.relationship, isRelationship);
  draft.partnerMoveIn = optional(record.partnerMoveIn, isPartnerMoveIn);
  if (draft.relationship === "single") {
    draft.partnerMoveIn = null;
  }
  draft.coupleAcceptance = optional(record.coupleAcceptance, isCoupleAcceptance);
  draft.householdSize = optional(record.householdSize, isHouseholdSize);
  draft.sleep = optional(record.sleep, isSleepHabit);
  draft.cleanliness = optional(record.cleanliness, isCleanlinessHabit);
  draft.social = optional(record.social, isSocialHabit);
  draft.cooking = optional(record.cooking, isCookingHabit);
  draft.mbti = optional(record.mbti, isMbtiType);
  return draft;
}
