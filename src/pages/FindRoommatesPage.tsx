import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar.tsx";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { ScoreParts, TierTag } from "../components/ScoreCard.tsx";
import { genders, labelOf, placeLabel, rentalModes, SCORE_DISCLAIMER } from "../domain/catalog.ts";
import { hardBlocks, suggestRoommates } from "../domain/match.ts";
import { roommateCandidates } from "../domain/people.ts";
import { isMutual, setMinScore, useApplications, useMinScore, useSavedProfile } from "../domain/storage.ts";

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function FindRoommatesPage() {
  const profile = useSavedProfile();
  const minScore = useMinScore();
  const applications = useApplications();

  if (!profile) {
    return (
      <PageShell title="找室友">
        <h1 className="text-2xl font-semibold">先写好自己的资料</h1>
        <p className="mt-2 text-sm leading-6">看室友建议之前，需要知道你是谁、想怎么住。资料会留在这台手机上。</p>
        <div className="mt-6">
          <PrimaryButton to="/onboarding">去填写</PrimaryButton>
        </div>
      </PageShell>
    );
  }

  const eligible = roommateCandidates.filter(
    (person) => person.id !== profile.id && hardBlocks(profile, person).length === 0,
  );
  const suggestions = suggestRoommates(profile, roommateCandidates, minScore);

  return (
    <PageShell title="找室友">
      <h1 className="text-2xl font-semibold">室友建议</h1>
      <p className="mt-2 text-sm leading-6">
        下面是示例室友，用来演示，不是正在找房的真人。性别、能否接受情侣、一起住的人数对不上的人不会出现。
      </p>
      <p className="mt-2 text-sm leading-6 text-warm">{SCORE_DISCLAIMER}</p>

      <label htmlFor="min-score" className="mt-6 block text-sm">
        <span className="text-warm">最低参考分 {minScore}%</span>
        <input
          id="min-score"
          type="range"
          min={0}
          max={100}
          step={5}
          value={minScore}
          onChange={(event) => setMinScore(Number(event.target.value))}
          className="mt-3 w-full accent-sage"
        />
      </label>
      <p className="mt-2 text-sm leading-6 text-muted">低于这个参考分的人先不显示。</p>

      {suggestions.length === 0 ? (
        <EmptyState eligibleCount={eligible.length} minScore={minScore} />
      ) : (
        <ul className="mt-6 flex flex-col gap-3" aria-live="polite">
          {suggestions.map(({ person, match }) => {
            const application = applications[person.id];
            const status = isMutual(application)
              ? "双方都同意了，可以聊天"
              : application?.myAccepted
                ? "已申请，等对方同意"
                : null;
            return (
              <li key={person.id}>
                <Link to={`/roommates/${person.id}`} className={linkClass}>
                  <Card>
                    <div className="flex gap-3">
                      <Avatar id={person.avatarId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-base font-medium">{person.nickname}</h2>
                          <p className="text-right">
                            <span className="text-xl font-semibold tabular-nums">{match.total}%</span>
                            <span className="block text-[11px] text-warm">资料参考</span>
                          </p>
                        </div>
                        <p className="mt-1 text-sm leading-6">
                          {person.age} 岁 · {labelOf(genders, person.gender)} · {placeLabel(person.cityId, person.areaId)}
                        </p>
                        <p className="mt-1 text-sm text-warm">{labelOf(rentalModes, person.rentalMode)}</p>
                        <div className="mt-2">
                          <TierTag tier={match.tier} />
                        </div>
                        <div className="mt-2">
                          <ScoreParts match={match} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-warm">{match.highlights[0]}</p>
                        {status ? <p className="mt-2 text-sm">{status}</p> : null}
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}

function EmptyState({ eligibleCount, minScore }: { eligibleCount: number; minScore: number }) {
  return (
    <div className="mt-6">
      <h2 className="text-base font-medium">现在没有同时符合的人</h2>
      {eligibleCount === 0 ? (
        <p className="mt-2 text-sm leading-6">
          性别、能否接受情侣、一起住的人数会直接筛掉人，不会用分数补回来。可以去修改这些资料，把范围放宽。
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6">
          有 {eligibleCount} 个人符合性别、情侣和人数要求，但参考分都低于 {minScore}%。可以把最低参考分调低。
        </p>
      )}
      <div className="mt-4">
        <PrimaryButton to="/onboarding?edit=1" variant="quiet">
          去修改资料
        </PrimaryButton>
      </div>
    </div>
  );
}
