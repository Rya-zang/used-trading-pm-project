export const viewingTimes = [
  "周六下午 2 点",
  "周六下午 4 点",
  "周日上午 10 点",
  "周日下午 3 点",
  "工作日晚上 7 点",
] as const;

export type ViewingTime = (typeof viewingTimes)[number];
export type Side = "me" | "them";
export type ViewingStatus = "waiting" | "confirmed" | "time-not-agreed" | "cancelled" | "done";

export interface Proposal {
  by: Side;
  when: string;
}

export interface VisitFeedback {
  like: "yes" | "no";
  layout: string;
  rent: string;
  baths: string;
  other: string;
  keep: boolean;
}

export interface Viewing {
  id: string;
  placeKind: "room" | "listing";
  placeId: string;
  placeLabel: string;
  status: ViewingStatus;
  proposals: Proposal[];
  agreedWhen: string | null;
  myYes: "yes" | "no" | null;
  theirYes: "yes" | "no" | null;
  myFeedback: VisitFeedback | null;
  theirFeedback: VisitFeedback | null;
}

export const viewingStatusLabel: Record<ViewingStatus, string> = {
  waiting: "等对方回应",
  confirmed: "时间定了",
  "time-not-agreed": "时间还没对上",
  cancelled: "这次取消了",
  done: "已经看过",
};

export function createViewing(input: {
  id: string;
  placeKind: Viewing["placeKind"];
  placeId: string;
  placeLabel: string;
}): Viewing {
  return {
    id: input.id,
    placeKind: input.placeKind,
    placeId: input.placeId,
    placeLabel: input.placeLabel,
    status: "waiting",
    proposals: [],
    agreedWhen: null,
    myYes: null,
    theirYes: null,
    myFeedback: null,
    theirFeedback: null,
  };
}

function open(viewing: Viewing): boolean {
  return viewing.status !== "done" && viewing.status !== "cancelled";
}

export function propose(viewing: Viewing, by: Side, when: string): Viewing {
  if (!open(viewing) || when.trim() === "") return viewing;
  const proposals = [...viewing.proposals, { by, when }];
  const previous = [...viewing.proposals].reverse().find((item) => item.by !== by);
  if (previous && previous.when === when) {
    return { ...viewing, proposals, status: "confirmed", agreedWhen: when };
  }
  if (viewing.proposals.every((item) => item.by === by)) {
    return { ...viewing, proposals, status: "waiting", agreedWhen: null };
  }
  return { ...viewing, proposals, status: "time-not-agreed", agreedWhen: null };
}

export function agree(viewing: Viewing, by: Side): Viewing {
  if (!open(viewing)) return viewing;
  const last = viewing.proposals[viewing.proposals.length - 1];
  if (!last || last.by === by) return viewing;
  return {
    ...viewing,
    proposals: [...viewing.proposals, { by, when: last.when }],
    status: "confirmed",
    agreedWhen: last.when,
  };
}

export function decline(viewing: Viewing): Viewing {
  if (viewing.proposals.length === 0 || viewing.status === "done") return viewing;
  return { ...viewing, status: "cancelled", agreedWhen: null };
}

export function markVisited(viewing: Viewing): Viewing {
  if (viewing.status !== "confirmed") return viewing;
  return { ...viewing, status: "done" };
}

export function answerRoom(viewing: Viewing, by: Side, answer: "yes" | "no"): Viewing {
  if (viewing.status !== "done" || viewing.placeKind !== "room") return viewing;
  if (by === "me") return { ...viewing, myYes: answer };
  return { ...viewing, theirYes: answer };
}

export function answerListing(viewing: Viewing, by: Side, feedback: VisitFeedback): Viewing {
  if (viewing.status !== "done" || viewing.placeKind !== "listing") return viewing;
  if (by === "me") return { ...viewing, myFeedback: feedback };
  return { ...viewing, theirFeedback: feedback };
}

export function bothWantRoom(viewing: Viewing): boolean {
  return viewing.placeKind === "room" && viewing.status === "done" && viewing.myYes === "yes" && viewing.theirYes === "yes";
}

export function bothAcceptListing(viewing: Viewing): boolean {
  return (
    viewing.placeKind === "listing" &&
    viewing.status === "done" &&
    viewing.myFeedback?.like === "yes" &&
    viewing.theirFeedback?.like === "yes"
  );
}

export function placeAgreed(viewings: readonly Viewing[]): boolean {
  return viewings.some((viewing) => bothWantRoom(viewing) || bothAcceptListing(viewing));
}
