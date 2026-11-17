/** 已经有房源，或还没有房源、想一起租。 */
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

/** 早期占位。室友建议的计分在 domain/match.ts，不使用这个类型。 */
export interface MatchResult {
  id: string;
  profileId: string;
  otherProfileId: string;
  summary: string;
}
