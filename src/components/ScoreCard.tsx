import { MBTI_DISCLAIMER, SCORE_DISCLAIMER } from "../domain/catalog.ts";
import { tierLabel, type MatchExplanation, type MatchTier } from "../domain/match.ts";
import { Tag } from "./Tag.tsx";

const tierTone: Record<MatchTier, "sage" | "warm" | "quiet"> = {
  "both-fit": "sage",
  "housing-fit-habits-differ": "warm",
  "talk-more": "quiet",
};

export function TierTag({ tier }: { tier: MatchTier }) {
  return <Tag tone={tierTone[tier]}>{tierLabel[tier]}</Tag>;
}

export function ScoreParts({ match }: { match: MatchExplanation }) {
  const parts = [
    `住房需求 ${match.housing}/50`,
    `生活习惯 ${match.habits}/35`,
    `性格参考 ${match.personality}/15`,
  ];
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6">
      {parts.map((part) => (
        <li key={part} className="whitespace-nowrap">
          {part}
        </li>
      ))}
    </ul>
  );
}

function Meter({ value, max }: { value: number; max: number }) {
  const width = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eeeeea]" aria-hidden="true">
      <div className="h-full rounded-full bg-sage" style={{ width: `${width}%` }} />
    </div>
  );
}

export function ScoreCard({ match }: { match: MatchExplanation }) {
  return (
    <section aria-label="资料参考">
      <div className="flex items-end justify-between gap-3">
        <p className="text-4xl font-semibold tabular-nums">{match.total}%</p>
        <TierTag tier={match.tier} />
      </div>
      <p className="mt-2 text-sm leading-6 text-warm">{SCORE_DISCLAIMER}</p>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <p className="text-sm">住房需求 {match.housing}/50</p>
          <Meter value={match.housing} max={50} />
        </div>
        <div>
          <p className="text-sm">生活习惯 {match.habits}/35</p>
          <Meter value={match.habits} max={35} />
        </div>
        <div>
          <p className="text-sm">性格参考 {match.personality}/15</p>
          <Meter value={match.personality} max={15} />
          <p className="mt-1 text-sm leading-6 text-warm">
            {match.personalityNote}
            {MBTI_DISCLAIMER}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-warm">比较接近的地方</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {match.highlights.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-warm">可能要提前说开</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {match.conflicts.map((item) => (
            <li key={item} className="text-sm leading-6">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 panel p-4">
        <h3 className="text-sm text-warm">情侣合住</h3>
        <p className="mt-1 text-sm leading-6">{match.couple}</p>
        <h3 className="mt-3 text-sm text-warm">一起住的人数</h3>
        <p className="mt-1 text-sm leading-6">{match.household}</p>
      </div>
    </section>
  );
}
