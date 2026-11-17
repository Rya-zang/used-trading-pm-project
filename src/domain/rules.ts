export type RuleLevel = "never" | "avoid" | "talk";
export type RuleStance = "accept" | "propose" | "cannot";

export interface RuleLine {
  id: string;
  topic: string;
  text: string;
  level: RuleLevel;
  custom: boolean;
}

export interface RulesHistoryEntry {
  at: string;
  by: "me" | "them";
  lines: RuleLine[];
}

export interface RulesState {
  mine: RuleLine[];
  theirs: RuleLine[];
  mySubmittedAt: string | null;
  theirSubmittedAt: string | null;
  myStance: Record<string, RuleStance>;
  theirStance: Record<string, RuleStance>;
  history: RulesHistoryEntry[];
  lastEditAt: string | null;
}

export interface TopicPair {
  topic: string;
  mine?: RuleLine;
  theirs?: RuleLine;
}

export interface RuleView {
  revealed: boolean;
  mine: RuleLine[];
  theirs: RuleLine[];
  shared: TopicPair[];
  conflicts: TopicPair[];
  talking: TopicPair[];
  stopsMatch: boolean;
}

export const ruleLevelLabel: Record<RuleLevel, string> = {
  never: "绝不",
  avoid: "尽量不要",
  talk: "可以商量",
};

export const rulePresets = [
  { topic: "吸烟", text: "家里不吸烟" },
  { topic: "客人过夜", text: "客人过夜要先说一声" },
  { topic: "深夜声音", text: "晚上 11 点后把声音放轻" },
  { topic: "宠物", text: "先不养宠物" },
  { topic: "公共区域", text: "用完公共区域当天收好" },
  { topic: "东西", text: "不随便动对方的东西" },
] as const;

export function emptyRules(): RulesState {
  return {
    mine: [],
    theirs: [],
    mySubmittedAt: null,
    theirSubmittedAt: null,
    myStance: {},
    theirStance: {},
    history: [],
    lastEditAt: null,
  };
}

export function hardLinesReady(lines: readonly RuleLine[]): boolean {
  const hard = lines.filter((line) => line.topic !== "另外一句");
  if (hard.length !== 3) return false;
  const topics = hard.map((line) => line.topic.trim());
  if (topics.some((topic) => topic.length === 0 || topic.length > 12)) return false;
  if (hard.some((line) => line.text.trim().length === 0 || line.text.trim().length > 40)) return false;
  if (hard.some((line) => line.level !== "never" && line.level !== "avoid" && line.level !== "talk")) return false;
  return new Set(topics).size === topics.length;
}

export function demoTheirRules(): RuleLine[] {
  return [
    { id: "their-smoke", topic: "吸烟", text: "家里不吸烟", level: "never", custom: false },
    { id: "their-night", topic: "深夜声音", text: "晚上 11 点后把声音放轻", level: "avoid", custom: false },
    { id: "their-pet", topic: "宠物", text: "先不养宠物", level: "never", custom: false },
    { id: "their-guest", topic: "客人", text: "偶尔来坐坐可以商量", level: "talk", custom: false },
  ];
}

export function viewRules(state: RulesState): RuleView {
  const revealed = state.mySubmittedAt !== null && state.theirSubmittedAt !== null;
  if (!revealed) {
    return {
      revealed: false,
      mine: state.mine,
      theirs: [],
      shared: [],
      conflicts: [],
      talking: [],
      stopsMatch: false,
    };
  }
  const topics = [...new Set([...state.mine, ...state.theirs].map((line) => line.topic))];
  const shared: TopicPair[] = [];
  const conflicts: TopicPair[] = [];
  const talking: TopicPair[] = [];
  for (const topic of topics) {
    const mine = state.mine.find((line) => line.topic === topic);
    const theirs = state.theirs.find((line) => line.topic === topic);
    const pair = { topic, mine, theirs };
    if (mine && theirs && mine.level === theirs.level) {
      shared.push(pair);
    } else if (mine && theirs && (mine.level === "never" || theirs.level === "never")) {
      conflicts.push(pair);
    } else {
      talking.push(pair);
    }
  }
  const stopsMatch = conflicts.some(
    (item) => state.myStance[item.topic] === "cannot" || state.theirStance[item.topic] === "cannot",
  );
  return { revealed: true, mine: state.mine, theirs: state.theirs, shared, conflicts, talking, stopsMatch };
}

export function submitMyRules(state: RulesState, lines: RuleLine[], at: string): RulesState {
  if (!hardLinesReady(lines)) return state;
  return {
    ...state,
    mine: lines,
    mySubmittedAt: at,
    lastEditAt: at,
    history: [...state.history, { at, by: "me", lines }],
  };
}

export function submitTheirRules(state: RulesState, at: string): RulesState {
  const lines = demoTheirRules();
  return {
    ...state,
    theirs: lines,
    theirSubmittedAt: at,
    lastEditAt: at,
    history: [...state.history, { at, by: "them", lines }],
  };
}

export function acceptTheirTopic(state: RulesState, topic: string, at: string): RulesState {
  const theirs = state.theirs.find((line) => line.topic === topic);
  if (!theirs || !state.mySubmittedAt) return state;
  const mine = state.mine.filter((line) => line.topic !== topic).concat({ ...theirs, id: `mine-${topic}` });
  return {
    ...state,
    mine,
    myStance: { ...state.myStance, [topic]: "accept" },
    lastEditAt: at,
    history: [...state.history, { at, by: "me", lines: mine }],
  };
}

export function proposeMyTopic(state: RulesState, line: RuleLine, at: string): RulesState {
  if (!state.mySubmittedAt) return state;
  const mine = state.mine.filter((item) => item.topic !== line.topic).concat(line);
  return {
    ...state,
    mine,
    myStance: { ...state.myStance, [line.topic]: "propose" },
    lastEditAt: at,
    history: [...state.history, { at, by: "me", lines: mine }],
  };
}

export function cannotAgree(state: RulesState, topic: string, side: "me" | "them"): RulesState {
  if (side === "me") return { ...state, myStance: { ...state.myStance, [topic]: "cannot" } };
  return { ...state, theirStance: { ...state.theirStance, [topic]: "cannot" } };
}
