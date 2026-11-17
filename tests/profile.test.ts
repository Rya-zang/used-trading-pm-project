import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { draftFromProfile, draftToProfile, parseProfile } from "../src/domain/profile.ts";
import type { RoommateProfile } from "../src/domain/profile.ts";

const profile: RoommateProfile = {
  id: "me",
  nickname: "小林",
  age: 24,
  gender: "female",
  avatarId: "sprout",
  bio: "想安静一点。",
  cityId: "shanghai",
  areaId: "xuhui",
  budget: "2500-4000",
  moveIn: "2026-12",
  rentalMode: "has-listing",
  genderPreference: "any",
  relationship: "single",
  partnerMoveIn: null,
  coupleAcceptance: "yes",
  householdSize: "3",
  sleep: "regular",
  cleanliness: "normal",
  social: "sometimes",
  cooking: "sometimes",
  mbti: null,
};

describe("资料保存", () => {
  it("填完的草稿可以变成资料，再读回来还是同一份", () => {
    const saved = draftToProfile(draftFromProfile(profile), "me");
    assert.deepEqual(saved, profile);
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(profile))), profile);
  });

  it("一个人住却写了伴侣入住，读的时候丢掉", () => {
    assert.equal(parseProfile({ ...profile, partnerMoveIn: "together" }), null);
  });

  it("年龄不在范围内不能保存", () => {
    assert.equal(parseProfile({ ...profile, age: 17 }), null);
    assert.equal(parseProfile({ ...profile, age: 61 }), null);
  });
});
