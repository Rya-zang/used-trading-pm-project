import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { byRoomSuggestion, confirmRentSide, evenSuggestion, otherAmount, reopenRent, sumsMatch } from "../src/domain/rent.ts";
import { emptyRent } from "../src/domain/rent.ts";
import {
  acceptTheirTopic,
  cannotAgree,
  demoTheirRules,
  emptyRules,
  submitMyRules,
  submitTheirRules,
  viewRules,
  type RuleLine,
} from "../src/domain/rules.ts";
import {
  canConfirmSheet,
  confirmSearchSide,
  demoTheirSearch,
  emptySearch,
  hasSharedStandard,
  searchRelation,
  withMyItem,
} from "../src/domain/searchStandard.ts";
import { canMoveIn } from "../src/domain/together.ts";
import { filterListings, fakeListings } from "../src/domain/places.ts";
import {
  agree,
  answerListing,
  answerRoom,
  bothAcceptListing,
  createViewing,
  decline,
  markVisited,
  propose,
} from "../src/domain/viewing.ts";

const hardLines: RuleLine[] = [
  { id: "1", topic: "吸烟", text: "可以在阳台抽", level: "avoid", custom: false },
  { id: "2", topic: "深夜声音", text: "晚上 11 点后轻一点", level: "avoid", custom: false },
  { id: "3", topic: "宠物", text: "可以考虑小宠物", level: "avoid", custom: false },
];

describe("租金", () => {
  it("填一边，另一边补到整租", () => {
    assert.equal(otherAmount(7000, 3200), 3800);
    assert.equal(otherAmount(7000, 7001), null);
    assert.equal(otherAmount(7000, -1), null);
  });

  it("平分和按房间都只是参考，两边加起来等于整租", () => {
    const even = evenSuggestion(7001);
    assert.deepEqual(even, { mine: 3500, theirs: 3501 });
    const byRoom = byRoomSuggestion(7000, 10, 20);
    assert.ok(byRoom);
    assert.equal(byRoom.mine + byRoom.theirs, 7000);
    assert.ok(byRoom.theirs > byRoom.mine);
  });

  it("我确认不会顺手确认对方，重新打开会两边一起取消", () => {
    const draft = { ...emptyRent(), myAmount: 3500, theirAmount: 3500 };
    const mine = confirmRentSide(draft, "me", "t1");
    assert.equal(mine.myConfirmed, true);
    assert.equal(mine.theirConfirmed, false);
    assert.equal(mine.agreedAt, null);
    const both = confirmRentSide(mine, "them", "t2");
    assert.equal(both.agreedAt, "t2");
    const opened = reopenRent(both);
    assert.equal(opened.myConfirmed, false);
    assert.equal(opened.theirConfirmed, false);
    assert.equal(sumsMatch(7000, 3500, 3500), true);
  });
});

describe("看房", () => {
  it("对方可以同意、改时间或拒绝", () => {
    const created = createViewing({ id: "v", placeKind: "room", placeId: "room", placeLabel: "衡复" });
    const waiting = propose(created, "me", "周六下午 2 点");
    assert.equal(waiting.status, "waiting");
    const changed = propose(waiting, "them", "周日上午 10 点");
    assert.equal(changed.status, "time-not-agreed");
    const confirmed = agree(changed, "me");
    assert.equal(confirmed.status, "confirmed");
    assert.equal(confirmed.agreedWhen, "周日上午 10 点");
    const cancelled = decline(waiting);
    assert.equal(cancelled.status, "cancelled");
  });

  it("看完后各说各的，共同接受要双方都愿意", () => {
    const done = markVisited(
      propose(createViewing({ id: "v", placeKind: "listing", placeId: "listing-01", placeLabel: "康健" }), "me", "周六下午 2 点"),
    );
    const agreed = agree(
      propose(createViewing({ id: "v2", placeKind: "listing", placeId: "listing-01", placeLabel: "康健" }), "me", "周六下午 2 点"),
      "them",
    );
    const visited = markVisited(agreed);
    assert.equal(done.status, "waiting");
    assert.equal(visited.status, "done");
    const mine = answerListing(visited, "me", { like: "yes", layout: "合适", rent: "可以", baths: "够用", other: "", keep: false });
    const both = answerListing(mine, "them", { like: "yes", layout: "合适", rent: "可以", baths: "够用", other: "", keep: true });
    assert.equal(bothAcceptListing(mine), false);
    assert.equal(bothAcceptListing(both), true);
    const room = answerRoom({ ...visited, placeKind: "room" }, "me", "yes");
    assert.equal(room.myYes, "yes");
    assert.equal(room.theirYes, null);
  });
});

describe("一起找房的标准", () => {
  it("必须对不上就不是共同标准，只确认一边也不够", () => {
    let state = emptySearch();
    for (const [id, value] of Object.entries(demoTheirSearch)) {
      state = withMyItem(state, id as keyof typeof demoTheirSearch, value);
    }
    state = { ...state, theirs: { ...demoTheirSearch, pets: { value: "可以养猫", stance: "must" } } };
    assert.equal(searchRelation(state.mine.pets, state.theirs.pets), "different");
    assert.equal(canConfirmSheet(state.mine, state.theirs), false);
    state = { ...state, theirs: demoTheirSearch };
    const mine = confirmSearchSide(state, "me");
    assert.equal(mine.myConfirmed, true);
    assert.equal(mine.theirConfirmed, false);
    assert.equal(hasSharedStandard(mine), false);
    assert.equal(hasSharedStandard(confirmSearchSide(mine, "them")), true);
  });
});

describe("一起找房的周边愿望", () => {
  it("只有一边的必须留在个人需求里，双方都标必须才拿掉房子", async () => {
    const { emptyPlaceWishes, listingPassesSharedMusts, metWishText, metWishes, wishGroups, writePlaceWish } =
      await import("../src/domain/placeWishes.ts");
    const { fakeListings } = await import("../src/domain/places.ts");
    let state = emptyPlaceWishes();
    state = writePlaceWish(state, "me", "metro", { id: "metro", must: true });
    state = writePlaceWish(state, "me", "gym", { id: "gym", must: true });
    state = writePlaceWish(state, "them", "store", { id: "store", must: true });
    const alone = wishGroups(state);
    assert.equal(alone.shared.length, 0);
    assert.equal(alone.mine.find((item) => item.id === "metro")?.must, true);
    assert.equal(alone.theirs.find((item) => item.id === "store")?.must, true);
    state = writePlaceWish(state, "them", "metro", { id: "metro", must: false });
    assert.equal(wishGroups(state).shared.find((item) => item.id === "metro")?.must, false);
    state = writePlaceWish(state, "them", "metro", { id: "metro", must: true });
    assert.equal(wishGroups(state).shared.find((item) => item.id === "metro")?.must, true);
    const confirmed = { ...state, myConfirmed: true, theirConfirmed: true };
    const flower = fakeListings.find((item) => item.id === "listing-05");
    const kangjian = fakeListings.find((item) => item.id === "listing-01");
    if (!flower || !kangjian) throw new Error("listing");
    assert.equal(listingPassesSharedMusts(flower, confirmed), false);
    assert.equal(listingPassesSharedMusts(kangjian, confirmed), true);
    assert.ok(metWishes(kangjian, confirmed).some((item) => metWishText(item) === "双方都有地铁站"));
    assert.ok(metWishes(kangjian, confirmed).some((item) => metWishText(item) === "我有健身房"));
  });
});

describe("约法三章", () => {
  it("双方都提交之前不对照，没法同意的底线会挡住住在一起", () => {
    const mineOnly = submitMyRules(emptyRules(), hardLines, "t1");
    assert.equal(viewRules(mineOnly).revealed, false);
    assert.equal(viewRules(mineOnly).theirs.length, 0);
    const both = submitTheirRules(mineOnly, "t2");
    const view = viewRules(both);
    assert.equal(view.revealed, true);
    assert.ok(view.conflicts.some((item) => item.topic === "吸烟"));
    assert.equal(view.stopsMatch, false);
    const stopped = cannotAgree(both, "吸烟", "me");
    assert.equal(viewRules(stopped).stopsMatch, true);
    const accepted = acceptTheirTopic(stopped, "吸烟", "t3");
    assert.equal(viewRules(accepted).stopsMatch, false);
    const custom = submitMyRules(emptyRules(), [
      { id: "1", topic: "不要在公共场合", text: "不要在公共场合内吸烟", level: "never", custom: true },
      { id: "2", topic: "深夜声音", text: "晚上 11 点后把声音放轻", level: "avoid", custom: false },
      { id: "3", topic: "客人过夜", text: "客人过夜要先说一声", level: "talk", custom: false },
    ], "t4");
    assert.equal(custom.mine[0]?.text, "不要在公共场合内吸烟");
    assert.equal(viewRules(custom).revealed, false);
    assert.equal(viewRules(accepted).shared.some((item) => item.topic === "吸烟"), true);
    assert.ok(accepted.history.length >= 2);
  });
});

describe("示例房源", () => {
  it("可以按片区、租金、户型、卫生间和面积筛", () => {
    assert.ok(fakeListings.length >= 8 && fakeListings.length <= 12);
    const found = filterListings(fakeListings, {
      areaId: "xuhui",
      rentMax: "7000",
      layout: "2室1厅",
      baths: "1",
      areaMin: "60",
    });
    assert.ok(found.every((item) => item.areaId === "xuhui" && item.rent <= 7000 && item.baths === 1));
    assert.ok(found.length >= 1);
  });
});

describe("住在一起", () => {
  it("看房、租金、约法都过了才可以决定，而且不能替对方决定", () => {
    const rent = confirmRentSide(confirmRentSide({ ...emptyRent(), myAmount: 3500, theirAmount: 3500 }, "me", "a"), "them", "b");
    const rules = submitTheirRules(submitMyRules(emptyRules(), [
      { id: "1", topic: "吸烟", text: "家里不吸烟", level: "never", custom: false },
      { id: "2", topic: "深夜声音", text: "晚上轻一点", level: "avoid", custom: false },
      { id: "3", topic: "公共区域", text: "当天收好", level: "avoid", custom: false },
    ], "t"), "t2");
    assert.equal(canMoveIn({ viewings: [], rent, rules }), false);
  });
});
