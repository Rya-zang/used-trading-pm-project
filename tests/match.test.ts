import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCORE_WEIGHTS, explainMatch, hardBlocks, suggestRoommates } from "../src/domain/match.ts";
import { roommateCandidates } from "../src/domain/people.ts";
import type { RoommateProfile } from "../src/domain/profile.ts";

const viewer: RoommateProfile = {
  id: "me",
  nickname: "我",
  age: 24,
  gender: "female",
  avatarId: "tea",
  bio: "",
  cityId: "shanghai",
  areaId: "xuhui",
  budget: "2500-4000",
  moveIn: "2026-12",
  rentalMode: "seek-together",
  genderPreference: "any",
  relationship: "single",
  partnerMoveIn: null,
  coupleAcceptance: "discuss",
  householdSize: "3",
  sleep: "regular",
  cleanliness: "normal",
  social: "sometimes",
  cooking: "sometimes",
  smoking: "no",
  choreStyle: "rotate",
  mbti: "INFP",
};

function withViewer(patch: Partial<RoommateProfile>): RoommateProfile {
  return { ...viewer, ...patch };
}

function candidate(id: string): RoommateProfile {
  const person = roommateCandidates.find((item) => item.id === id);
  if (!person) throw new Error(id);
  return person;
}

describe("资料参考的权重", () => {
  it("三部分加起来是 100，住房 50、习惯 35、性格 15", () => {
    const values = Object.values(SCORE_WEIGHTS);
    assert.equal(values.reduce((sum, value) => sum + value, 0), 100);
    assert.equal(SCORE_WEIGHTS.area + SCORE_WEIGHTS.budget + SCORE_WEIGHTS.moveIn, 50);
    assert.equal(
      SCORE_WEIGHTS.sleep + SCORE_WEIGHTS.cleanliness + SCORE_WEIGHTS.social + SCORE_WEIGHTS.cooking,
      35,
    );
    assert.equal(SCORE_WEIGHTS.personality, 15);
  });
});

describe("直接筛掉，不加分", () => {
  it("不默认只配同性：男生和希望不限的女生可以互相出现", () => {
    const me = withViewer({ gender: "male", genderPreference: "any" });
    assert.deepEqual(hardBlocks(me, candidate("zhou-yuan")), []);
  });

  it("双方的性别要求都要过", () => {
    assert.deepEqual(hardBlocks(viewer, candidate("chen-yu")), []);
    assert.deepEqual(hardBlocks(withViewer({ genderPreference: "female" }), candidate("chen-yu")), ["gender"]);
    assert.deepEqual(hardBlocks(viewer, candidate("gu-xing")), ["gender"]);
    assert.deepEqual(hardBlocks(viewer, candidate("tang-ning")), ["gender"]);
    assert.deepEqual(hardBlocks(withViewer({ gender: "male" }), candidate("gu-xing")), []);
    assert.deepEqual(hardBlocks(withViewer({ genderPreference: "female" }), candidate("xu-xinghe")), ["gender"]);
  });

  it("只有明确不接受，才会筛掉会一起住的情侣", () => {
    assert.deepEqual(hardBlocks(viewer, candidate("jiang-he")), []);
    assert.deepEqual(hardBlocks(withViewer({ coupleAcceptance: "no" }), candidate("jiang-he")), ["couple"]);
    assert.deepEqual(hardBlocks(withViewer({ relationship: "partner", partnerMoveIn: "together" }), candidate("su-wan")), [
      "couple",
    ]);
    assert.deepEqual(
      hardBlocks(
        withViewer({
          relationship: "partner",
          partnerMoveIn: "together",
          householdSize: "4+",
        }),
        candidate("ma-yizhou"),
      ),
      ["couple"],
    );
  });

  it("人数要一样，而且加起来不能超过", () => {
    assert.deepEqual(hardBlocks(viewer, candidate("he-jiashu")), ["household"]);
    assert.deepEqual(hardBlocks(withViewer({ householdSize: "2" }), candidate("he-jiashu")), []);
    assert.deepEqual(
      hardBlocks(
        withViewer({ relationship: "partner", partnerMoveIn: "together", householdSize: "2" }),
        candidate("he-jiashu"),
      ),
      ["household"],
    );
    assert.deepEqual(
      hardBlocks(withViewer({ relationship: "partner", partnerMoveIn: "together" }), candidate("jiang-he")),
      ["household"],
    );
  });
});

describe("参考分", () => {
  it("条件几乎一样时是 100%，两边都比较合适", () => {
    const match = explainMatch(viewer, candidate("zhou-yuan"));
    assert.equal(match.total, 100);
    assert.equal(match.housing, 50);
    assert.equal(match.habits, 35);
    assert.equal(match.personality, 15);
    assert.equal(match.tier, "both-fit");
    assert.ok(match.highlights.includes("同一个片区"));
    assert.deepEqual(match.conflicts, ["资料里没有特别要提前说开的差别"]);
    assert.equal(match.couple, "两人都是一个人入住。");
    assert.match(match.household, /一共会入住 2 人，还空 1 个位置/);
  });

  it("住房一样但习惯有差别时，不把习惯算成合适", () => {
    const match = explainMatch(viewer, candidate("chen-yu"));
    assert.equal(match.housing, 50);
    assert.equal(match.habits, 17);
    assert.equal(match.personality, 6);
    assert.equal(match.total, 73);
    assert.equal(match.tier, "housing-fit-habits-differ");
    assert.ok(match.conflicts.includes("作息有一点差别"));
  });

  it("同一座城市但片区和预算只是接近时，归到再聊聊", () => {
    const match = explainMatch(viewer, candidate("lin-xiaoman"));
    assert.equal(match.area, 10);
    assert.equal(match.budget, 12);
    assert.equal(match.moveIn, 6);
    assert.equal(match.housing, 28);
    assert.equal(match.habits, 17);
    assert.equal(match.personality, 13);
    assert.equal(match.total, 58);
    assert.equal(match.tier, "talk-more");
    assert.ok(match.highlights.includes("同一座城市，片区不同"));
  });

  it("没填 MBTI 时性格参考按 8 分，不当成科学结论", () => {
    const match = explainMatch(viewer, candidate("xu-xinghe"));
    assert.equal(match.personality, 8);
    assert.equal(match.total, 66);
    assert.match(match.personalityNote, /8 分/);
  });

  it("会和伴侣一起住时写明可以商量，人数刚好满员", () => {
    const match = explainMatch(viewer, candidate("jiang-he"));
    assert.equal(match.total, 77);
    assert.equal(match.tier, "housing-fit-habits-differ");
    assert.equal(match.couple, "对方会和伴侣一起住，你填写的是可以商量。");
    assert.match(match.household, /一共会入住 3 人，刚好满员/);
  });

  it("城市差得远时参考分低，并写明不在同一座城市", () => {
    const match = explainMatch(viewer, candidate("zhao-qiming"));
    assert.equal(match.area, 0);
    assert.equal(match.budget, 6);
    assert.equal(match.moveIn, 0);
    assert.equal(match.total, 33);
    assert.ok(match.conflicts.includes("不在同一座城市"));
  });

  it("吸烟和家务做法会分开说明，不改原来的百分比", () => {
    const match = explainMatch(viewer, candidate("zhou-yuan"));
    assert.equal(match.total, 100);
    const smoking = match.comfort.find((item) => item.key === "smoking");
    const chore = match.comfort.find((item) => item.key === "chore");
    assert.equal(smoking?.tone, "same");
    assert.equal(smoking?.sentence, "都不吸烟。");
    assert.equal(chore?.tone, "same");
    const apart = explainMatch(viewer, candidate("chen-yu"));
    assert.equal(apart.comfort.find((item) => item.key === "smoking")?.tone, "apart");
    assert.match(apart.comfort.find((item) => item.key === "smoking")?.sentence ?? "", /不吸烟/);
    assert.equal(apart.comfort.find((item) => item.key === "chore")?.tone, "apart");
    assert.equal(apart.total, 73);
  });
});

describe("建议列表", () => {
  it("有 8 到 12 位示例室友，而且情况不完全一样", () => {
    assert.ok(roommateCandidates.length >= 8 && roommateCandidates.length <= 12);
    assert.equal(new Set(roommateCandidates.map((person) => person.rentalMode)).size, 2);
    assert.ok(new Set(roommateCandidates.map((person) => person.cityId)).size >= 3);
    assert.equal(new Set(roommateCandidates.map((person) => person.householdSize)).size, 3);
    assert.equal(new Set(roommateCandidates.map((person) => person.coupleAcceptance)).size, 3);
    assert.equal(new Set(roommateCandidates.map((person) => person.gender)).size, 3);
    assert.equal(new Set(roommateCandidates.map((person) => person.genderPreference)).size, 3);
  });

  it("最低参考分会再滤掉一批，但不会把被硬性条件挡掉的人加回来", () => {
    const visible = suggestRoommates(viewer, roommateCandidates, 40).map((item) => item.person.nickname);
    assert.deepEqual(visible, ["周予安", "苏晚", "江禾", "陈屿", "许星河", "林小满"]);
    const higher = suggestRoommates(viewer, roommateCandidates, 90).map((item) => item.person.nickname);
    assert.deepEqual(higher, ["周予安", "苏晚"]);
    const allScores = suggestRoommates(viewer, roommateCandidates, 0).map((item) => item.person.nickname);
    assert.deepEqual(allScores, ["周予安", "苏晚", "江禾", "陈屿", "许星河", "林小满", "赵启明"]);
    assert.equal(suggestRoommates(viewer, roommateCandidates, 101).length, 0);
  });
});
