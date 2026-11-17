export const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] as const;

export const rosterChores = [
  { id: "living", label: "客厅" },
  { id: "kitchen", label: "厨房" },
  { id: "trash", label: "垃圾" },
] as const;

export type RosterChoreId = (typeof rosterChores)[number]["id"];
export type RosterCell = "me" | "them" | "";

export type WeekRoster = Record<RosterChoreId, RosterCell[]>;

export function emptyRoster(): WeekRoster {
  return {
    living: ["", "", "", "", "", "", ""],
    kitchen: ["", "", "", "", "", "", ""],
    trash: ["", "", "", "", "", "", ""],
  };
}

export function nextRosterCell(cell: RosterCell): RosterCell {
  if (cell === "") return "me";
  if (cell === "me") return "them";
  return "";
}

export function cellLabel(cell: RosterCell): string {
  if (cell === "me") return "我";
  if (cell === "them") return "对方";
  return "空";
}

function isCell(value: unknown): value is RosterCell {
  return value === "me" || value === "them" || value === "";
}

export function parseRoster(value: unknown): WeekRoster | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const next = emptyRoster();
  for (const chore of rosterChores) {
    const row = record[chore.id];
    if (!Array.isArray(row) || row.length !== 7 || !row.every(isCell)) return null;
    next[chore.id] = [...row];
  }
  return next;
}
