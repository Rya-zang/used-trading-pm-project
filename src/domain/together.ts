import type { RentDraft } from "./rent.ts";
import { sumsMatch } from "./rent.ts";
import type { RulesState } from "./rules.ts";
import { viewRules } from "./rules.ts";
import type { Viewing } from "./viewing.ts";
import { placeAgreed } from "./viewing.ts";

export function moveInBlockers(input: {
  viewings: readonly Viewing[];
  rent: RentDraft;
  rules: RulesState;
}): string[] {
  const blockers: string[] = [];
  const rules = viewRules(input.rules);
  if (!placeAgreed(input.viewings)) {
    blockers.push("看完之后，双方还没有都说愿意。");
  }
  if (!input.rent.myConfirmed || !input.rent.theirConfirmed || !sumsMatch(input.rent.wholeRent, input.rent.myAmount, input.rent.theirAmount)) {
    blockers.push("租金还没有双方都确认。");
  }
  if (!rules.revealed) {
    blockers.push("约法还没有双方都写好。");
  } else if (rules.conflicts.length > 0) {
    blockers.push("还有对不上的底线。先接受、改一句，或者明确说没法同意。");
  }
  if (rules.stopsMatch) {
    blockers.push("有人明确说了没法同意，先别往下住。");
  }
  return blockers;
}

export function canMoveIn(input: {
  viewings: readonly Viewing[];
  rent: RentDraft;
  rules: RulesState;
}): boolean {
  return moveInBlockers(input).length === 0;
}
