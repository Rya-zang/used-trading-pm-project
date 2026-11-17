/** 已经有房源，或还没有房源、想一起租。阶段 3 才会让人选择。 */
export type RentalModeId = "has-listing" | "seek-together";

export interface RentalMode {
  id: RentalModeId;
  title: string;
  description: string;
}

export interface Profile {
  id: string;
  displayName: string;
  campus: string;
  intro: string;
  tags: readonly string[];
  rentalModeId: RentalModeId | null;
}

export interface Listing {
  id: string;
  title: string;
  area: string;
  monthlyRentYuan: number | null;
  bedroomCount: number | null;
  ownerProfileId: string;
}

/** 两个人之间的一条匹配展示。阶段 2 不计算它。 */
export interface MatchResult {
  id: string;
  profileId: string;
  otherProfileId: string;
  summary: string;
}
