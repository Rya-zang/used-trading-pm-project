export const searchFields = [
  ["city", "城市"],
  ["areas", "片区"],
  ["nearby", "附近还能接受的片区"],
  ["metro", "地铁"],
  ["commute", "通勤"],
  ["wholeRent", "整套租金"],
  ["eachRent", "每个人出的租金"],
  ["sharedBills", "公共费用"],
  ["layout", "户型"],
  ["privateRoom", "自己的卧室"],
  ["livingRoom", "共用客厅"],
  ["pets", "宠物"],
  ["elevator", "电梯"],
  ["cooking", "做饭"],
  ["others", "还有没有别人一起住"],
] as const;

export type SearchFieldId = (typeof searchFields)[number][0];
export type Stance = "must" | "prefer" | "flexible";
export type SearchRelation = "same" | "different" | "talking";

export interface SearchValue {
  value: string;
  stance: Stance;
}

export type SearchSheet = Partial<Record<SearchFieldId, SearchValue>>;

export interface SearchState {
  mine: SearchSheet;
  theirs: SearchSheet;
  myConfirmed: boolean;
  theirConfirmed: boolean;
}

export const stanceLabel: Record<Stance, string> = {
  must: "必须",
  prefer: "最好",
  flexible: "可以商量",
};

export const relationLabel: Record<SearchRelation, string> = {
  same: "一样",
  different: "不一样",
  talking: "还在说",
};

export function emptySearch(): SearchState {
  return { mine: {}, theirs: {}, myConfirmed: false, theirConfirmed: false };
}

export function searchRelation(mine: SearchValue | undefined, theirs: SearchValue | undefined): SearchRelation {
  const left = mine?.value.trim() ?? "";
  const right = theirs?.value.trim() ?? "";
  if (!left || !right) return "talking";
  if (left === right) return "same";
  if (mine?.stance === "must" || theirs?.stance === "must") return "different";
  return "talking";
}

export function sheetComplete(sheet: SearchSheet): boolean {
  return searchFields.every(([id]) => Boolean(sheet[id]?.value.trim()));
}

export function mustConflicts(state: SearchState): SearchFieldId[] {
  return searchFields
    .map(([id]) => id)
    .filter((id) => searchRelation(state.mine[id], state.theirs[id]) === "different");
}

export function hasSharedStandard(state: SearchState): boolean {
  return (
    state.myConfirmed &&
    state.theirConfirmed &&
    sheetComplete(state.mine) &&
    sheetComplete(state.theirs) &&
    mustConflicts(state).length === 0
  );
}

export function canConfirmSheet(sheet: SearchSheet, other: SearchSheet): boolean {
  if (!sheetComplete(sheet)) return false;
  return searchFields.every(([id]) => searchRelation(sheet[id], other[id]) !== "different");
}

export const demoTheirSearch: SearchSheet = {
  city: { value: "上海", stance: "must" },
  areas: { value: "徐汇", stance: "must" },
  nearby: { value: "静安", stance: "prefer" },
  metro: { value: "步行 10 分钟内有地铁", stance: "prefer" },
  commute: { value: "单程 40 分钟内", stance: "flexible" },
  wholeRent: { value: "整套每月 7000 元以内", stance: "must" },
  eachRent: { value: "每人每月 3500 元左右", stance: "prefer" },
  sharedBills: { value: "水电燃气另算，不放进房租", stance: "must" },
  layout: { value: "两室", stance: "prefer" },
  privateRoom: { value: "要有自己的卧室", stance: "must" },
  livingRoom: { value: "客厅一起用", stance: "flexible" },
  pets: { value: "不养宠物", stance: "must" },
  elevator: { value: "最好有电梯", stance: "flexible" },
  cooking: { value: "可以在家做饭", stance: "prefer" },
  others: { value: "不要再加别人", stance: "must" },
};

export function withMyItem(state: SearchState, id: SearchFieldId, value: SearchValue): SearchState {
  return {
    ...state,
    mine: { ...state.mine, [id]: value },
    myConfirmed: false,
    theirConfirmed: false,
  };
}

export function acceptTheirItem(state: SearchState, id: SearchFieldId): SearchState {
  const theirs = state.theirs[id];
  if (!theirs) return state;
  return withMyItem(state, id, { ...theirs });
}

export function copyMineToTheirs(state: SearchState): SearchState {
  return { ...state, theirs: { ...state.mine }, myConfirmed: false, theirConfirmed: false };
}

export function confirmSearchSide(state: SearchState, side: "me" | "them"): SearchState {
  const sheet = side === "me" ? state.mine : state.theirs;
  const other = side === "me" ? state.theirs : state.mine;
  if (!canConfirmSheet(sheet, other)) return state;
  if (side === "me") return { ...state, myConfirmed: true };
  return { ...state, theirConfirmed: true };
}
