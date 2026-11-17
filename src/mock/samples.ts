import type {
  Listing,
  MatchResult,
  Profile,
  RentalMode,
} from "../types/domain.ts";

/**
 * 阶段 2 的形状示例。
 * 四个数组保持为空。sample* 只标明每种类型长什么样，页面不读取它们。
 * 这里没有匹配函数。
 */
export const SAMPLE_NOTE = "阶段 2 示例，不是真实用户、房源或匹配结果。";

export const profiles: readonly Profile[] = [];
export const rentalModes: readonly RentalMode[] = [];
export const listings: readonly Listing[] = [];
export const matchResults: readonly MatchResult[] = [];

export const sampleRentalMode: RentalMode = {
  id: "has-listing",
  title: "示例：已经有房源",
  description: SAMPLE_NOTE,
};

export const sampleProfile: Profile = {
  id: "sample-profile",
  displayName: "示例同学",
  campus: "示例校园",
  intro: SAMPLE_NOTE,
  tags: ["示例"],
  rentalModeId: null,
};

export const sampleListing: Listing = {
  id: "sample-listing",
  title: "示例房源",
  area: "示例片区",
  monthlyRentYuan: null,
  bedroomCount: null,
  ownerProfileId: sampleProfile.id,
};

export const sampleMatchResult: MatchResult = {
  id: "sample-match",
  profileId: sampleProfile.id,
  otherProfileId: "sample-profile-b",
  summary: "阶段 2 示例。这里没有匹配分数，也没有计算。",
};
