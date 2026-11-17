export const cities = [
  {
    id: "shanghai",
    label: "上海",
    areas: [
      { id: "xuhui", label: "徐汇" },
      { id: "yangpu", label: "杨浦" },
      { id: "pudong", label: "浦东" },
      { id: "jingan", label: "静安" },
    ],
  },
  {
    id: "beijing",
    label: "北京",
    areas: [
      { id: "haidian", label: "海淀" },
      { id: "chaoyang", label: "朝阳" },
      { id: "xicheng", label: "西城" },
    ],
  },
  {
    id: "hangzhou",
    label: "杭州",
    areas: [
      { id: "xihu", label: "西湖" },
      { id: "binjiang", label: "滨江" },
      { id: "yuhang", label: "余杭" },
    ],
  },
  {
    id: "chengdu",
    label: "成都",
    areas: [
      { id: "wuhou", label: "武侯" },
      { id: "gaoxin", label: "高新区" },
      { id: "jinjiang", label: "锦江" },
    ],
  },
] as const;

export const budgetBands = [
  { id: "1500-2500", label: "每月 1500–2500 元", min: 1500, max: 2500 },
  { id: "2500-4000", label: "每月 2500–4000 元", min: 2500, max: 4000 },
  { id: "4000-6000", label: "每月 4000–6000 元", min: 4000, max: 6000 },
  { id: "6000-8000", label: "每月 6000–8000 元", min: 6000, max: 8000 },
  { id: "8000-12000", label: "每月 8000–12000 元", min: 8000, max: 12000 },
] as const;

export const moveInOptions = [
  { id: "anytime", label: "时间灵活" },
  { id: "2026-11", label: "2026年11月" },
  { id: "2026-12", label: "2026年12月" },
  { id: "2027-01", label: "2027年1月" },
  { id: "2027-02", label: "2027年2月" },
  { id: "2027-03", label: "2027年3月或更晚" },
] as const;

export const genders = [
  { id: "female", label: "女" },
  { id: "male", label: "男" },
  { id: "other", label: "其他" },
] as const;

export const genderPreferences = [
  { id: "female", label: "希望是女生" },
  { id: "male", label: "希望是男生" },
  { id: "any", label: "男生女生都可以" },
] as const;

export const rentalModes = [
  {
    id: "has-listing",
    label: "已经有房源",
    hint: "房子已经有了，想找一起住的人。",
  },
  {
    id: "seek-together",
    label: "还没有房源",
    hint: "想先找人，再一起找房。",
  },
] as const;

export const relationships = [
  { id: "single", label: "一个人住" },
  { id: "partner", label: "有伴侣" },
] as const;

export const partnerMoveIns = [
  { id: "together", label: "会一起入住" },
  { id: "not-together", label: "伴侣不一起住" },
] as const;

export const coupleAcceptances = [
  { id: "yes", label: "可以接受" },
  { id: "no", label: "不接受" },
  { id: "discuss", label: "可以商量" },
] as const;

export const householdSizes = [
  { id: "2", label: "2 人" },
  { id: "3", label: "3 人" },
  { id: "4+", label: "4 人及以上" },
] as const;

export const sleepHabits = [
  { id: "early", label: "早睡（23点前）" },
  { id: "regular", label: "普通（24点前后）" },
  { id: "late", label: "晚睡（凌晨以后）" },
] as const;

export const cleanlinessHabits = [
  { id: "tidy", label: "很在意整洁" },
  { id: "normal", label: "差不多就好" },
  { id: "relaxed", label: "不太在意" },
] as const;

export const socialHabits = [
  { id: "quiet", label: "喜欢安静，少带朋友来" },
  { id: "sometimes", label: "偶尔一起待着" },
  { id: "often", label: "经常约朋友来" },
] as const;

export const cookingHabits = [
  { id: "often", label: "经常自己做" },
  { id: "sometimes", label: "偶尔做" },
  { id: "rarely", label: "基本不做饭" },
] as const;

export const mbtiTypes = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export const avatars = [
  { id: "sprout", label: "新芽", emoji: "🌱", className: "bg-sage" },
  { id: "cloud", label: "云", emoji: "☁️", className: "bg-oat" },
  { id: "tea", label: "茶", emoji: "🍵", className: "bg-[#d5e0cf]" },
  { id: "book", label: "书", emoji: "📘", className: "bg-[#ddd4c6]" },
  { id: "moon", label: "月", emoji: "🌙", className: "bg-[#e4d7c8]" },
  { id: "sun", label: "日", emoji: "🌤️", className: "bg-[#ead7b6]" },
  { id: "fish", label: "鱼", emoji: "🐟", className: "bg-[#d7ddd4]" },
  { id: "house", label: "屋", emoji: "🏡", className: "bg-[#e3d3cc]" },
] as const;

export const SCORE_DISCLAIMER =
  "这个百分比是对照双方资料算出来的参考，不是科学的合拍分数。";

export const MBTI_DISCLAIMER = "MBTI 不是科学标准，只作为性格聊天的参考。";

export type CityId = (typeof cities)[number]["id"];
export type AreaId = (typeof cities)[number]["areas"][number]["id"];
export type BudgetBand = (typeof budgetBands)[number]["id"];
export type MoveInTime = (typeof moveInOptions)[number]["id"];
export type Gender = (typeof genders)[number]["id"];
export type GenderPreference = (typeof genderPreferences)[number]["id"];
export type RentalMode = (typeof rentalModes)[number]["id"];
export type Relationship = (typeof relationships)[number]["id"];
export type PartnerMoveIn = (typeof partnerMoveIns)[number]["id"];
export type CoupleAcceptance = (typeof coupleAcceptances)[number]["id"];
export type HouseholdSize = (typeof householdSizes)[number]["id"];
export type SleepHabit = (typeof sleepHabits)[number]["id"];
export type CleanlinessHabit = (typeof cleanlinessHabits)[number]["id"];
export type SocialHabit = (typeof socialHabits)[number]["id"];
export type CookingHabit = (typeof cookingHabits)[number]["id"];
export type MbtiType = (typeof mbtiTypes)[number];
export type AvatarId = (typeof avatars)[number]["id"];

function hasId<T extends { id: string }>(
  options: readonly T[],
  value: unknown,
): value is T["id"] {
  return options.some((option) => option.id === value);
}

export function isCityId(value: unknown): value is CityId {
  return hasId(cities, value);
}

export function isAreaId(value: unknown): value is AreaId {
  return cities.some((city) => city.areas.some((area) => area.id === value));
}

export function isBudgetBand(value: unknown): value is BudgetBand {
  return hasId(budgetBands, value);
}

export function isMoveInTime(value: unknown): value is MoveInTime {
  return hasId(moveInOptions, value);
}

export function isGender(value: unknown): value is Gender {
  return hasId(genders, value);
}

export function isGenderPreference(value: unknown): value is GenderPreference {
  return hasId(genderPreferences, value);
}

export function isRentalMode(value: unknown): value is RentalMode {
  return hasId(rentalModes, value);
}

export function isRelationship(value: unknown): value is Relationship {
  return hasId(relationships, value);
}

export function isPartnerMoveIn(value: unknown): value is PartnerMoveIn {
  return hasId(partnerMoveIns, value);
}

export function isCoupleAcceptance(value: unknown): value is CoupleAcceptance {
  return hasId(coupleAcceptances, value);
}

export function isHouseholdSize(value: unknown): value is HouseholdSize {
  return hasId(householdSizes, value);
}

export function isSleepHabit(value: unknown): value is SleepHabit {
  return hasId(sleepHabits, value);
}

export function isCleanlinessHabit(value: unknown): value is CleanlinessHabit {
  return hasId(cleanlinessHabits, value);
}

export function isSocialHabit(value: unknown): value is SocialHabit {
  return hasId(socialHabits, value);
}

export function isCookingHabit(value: unknown): value is CookingHabit {
  return hasId(cookingHabits, value);
}

export function isMbtiType(value: unknown): value is MbtiType {
  return mbtiTypes.some((item) => item === value);
}

export function isAvatarId(value: unknown): value is AvatarId {
  return hasId(avatars, value);
}

export function cityOf(id: CityId) {
  const city = cities.find((item) => item.id === id);
  if (!city) {
    throw new Error("未知城市");
  }
  return city;
}

export function areaBelongsToCity(cityId: CityId, areaId: AreaId): boolean {
  return cityOf(cityId).areas.some((area) => area.id === areaId);
}

export function labelOf<T extends { id: string; label: string }>(
  options: readonly T[],
  id: T["id"],
): string {
  const match = options.find((option) => option.id === id);
  if (!match) {
    throw new Error("未知选项");
  }
  return match.label;
}

export function placeLabel(cityId: CityId, areaId: AreaId): string {
  const city = cityOf(cityId);
  const area = city.areas.find((item) => item.id === areaId);
  if (!area) {
    throw new Error("未知片区");
  }
  return `${city.label} · ${area.label}`;
}

export function avatarOf(id: AvatarId) {
  const avatar = avatars.find((item) => item.id === id);
  if (!avatar) {
    throw new Error("未知头像");
  }
  return avatar;
}
