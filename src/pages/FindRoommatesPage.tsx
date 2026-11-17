import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar.tsx";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { ScoreParts, TierTag } from "../components/ScoreCard.tsx";
import {
  budgetBands,
  cleanlinessHabits,
  cookingHabits,
  genders,
  labelOf,
  placeLabel,
  rentalModes,
  SCORE_DISCLAIMER,
  sleepHabits,
  socialHabits,
} from "../domain/catalog.ts";
import { hardBlocks, suggestRoommates } from "../domain/match.ts";
import { roommateCandidates, testRoommates } from "../domain/people.ts";
import type { RoommateProfile } from "../domain/profile.ts";
import { isMutual, setMinScore, useApplications, useMinScore, useSavedProfile } from "../domain/storage.ts";

const linkClass =
  "block rounded-2xl focus-visible:ring-2 focus-visible:ring-[#C9855A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]";

const chip = "rounded-full bg-[#FAFAF8] px-2 py-1 text-[11px] leading-4 text-[#858585]";

const sleepShort: Record<RoommateProfile["sleep"], string> = {
  early: "早睡",
  regular: "作息规律",
  late: "晚睡",
};
const cleanShort: Record<RoommateProfile["cleanliness"], string> = {
  tidy: "爱干净",
  normal: "整洁适中",
  relaxed: "不太挑剔",
};
const socialShort: Record<RoommateProfile["social"], string> = {
  quiet: "喜欢安静",
  sometimes: "偶尔见朋友",
  often: "常约朋友",
};

export function FindRoommatesPage() {
  const profile = useSavedProfile();
  const minScore = useMinScore();
  const applications = useApplications();

  if (!profile) {
    return (
      <PageShell title="找室友">
        <h1 className="text-2xl font-semibold">找室友</h1>
        <TestUsers />
        <div className="panel mt-4 p-4">
          <h2 className="text-[15px] font-semibold">先写好自己的资料</h2>
          <p className="mt-2 text-sm leading-6 text-[#858585]">看室友建议之前，需要知道你是谁、想怎么住。资料会留在这台手机上。</p>
          <div className="mt-4">
            <PrimaryButton to="/onboarding">去填写</PrimaryButton>
          </div>
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
      <TestUsers />
      <p className="mt-2 text-sm leading-6">
        下面是示例室友，用来演示，不是正在找房的真人。性别、能否接受情侣、一起住的人数对不上的人不会出现。
      </p>
      <p className="mt-2 text-sm leading-6 text-warm">{SCORE_DISCLAIMER}</p>

      <label htmlFor="min-score" className="mt-6 block text-sm">
        <span className="text-[#858585]">最低参考分 {minScore}%</span>
        <input
          id="min-score"
          type="range"
          min={0}
          max={100}
          step={5}
          value={minScore}
          onChange={(event) => setMinScore(Number(event.target.value))}
          className="mt-3 w-full accent-[#C9855A]"
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
                      <Avatar id={person.avatarId} gender={person.gender} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="text-[15px] leading-5 font-semibold">
                              {person.nickname}
                              <span className="ml-1.5 text-xs font-normal text-[#858585]">
                                {person.age}岁 · {labelOf(genders, person.gender)}
                              </span>
                            </h2>
                            <p className="mt-0.5 truncate text-xs text-[#858585]">
                              {person.bio.trim() || labelOf(rentalModes, person.rentalMode)}
                            </p>
                          </div>
                          <p className="shrink-0 text-right">
                            <span className="block text-[1.35rem] leading-none font-semibold text-[#C9855A] tabular-nums">
                              {match.total}%
                            </span>
                            <span className="mt-1 block text-[11px] text-[#858585]">资料参考</span>
                          </p>
                        </div>
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                          {[sleepShort[person.sleep], cleanShort[person.cleanliness], socialShort[person.social]].map((habit) => (
                            <li key={habit} className={chip}>
                              {habit}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[11px] text-[#858585]">
                          {placeLabel(person.cityId, person.areaId)} · {labelOf(rentalModes, person.rentalMode)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <TierTag tier={match.tier} />
                        </div>
                        <div className="mt-2 text-[#858585]">
                          <ScoreParts match={match} />
                        </div>
                        {match.highlights[0] ? <p className="mt-1 text-[11px] leading-4 text-[#858585]">{match.highlights[0]}</p> : null}
                        {status ? <p className="mt-2 text-xs text-[#858585]">{status}</p> : null}
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

function TestUsers() {
  return (
    <section className="mt-6">
      <h2 className="text-[15px] font-semibold">测试用户</h2>
      <p className="mt-1 text-xs leading-5 text-[#858585]">这几位已经可以聊天，不用等双方同意。消息留在这台手机上。</p>
      <ul className="mt-3 flex flex-col gap-3">
        {testRoommates.map((person) => (
          <li key={person.id}>
            <Link to={`/roommates/${person.id}`} className={linkClass}>
              <Card>
                <div className="flex gap-3">
                  <Avatar id={person.avatarId} gender={person.gender} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold">
                      {person.nickname}
                      <span className="ml-1.5 text-xs font-normal text-[#C9855A]">测试用户</span>
                    </h3>
                    <p className="mt-0.5 text-xs text-[#858585]">
                      {placeLabel(person.cityId, person.areaId)} · {labelOf(budgetBands, person.budget)}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {[
                        labelOf(sleepHabits, person.sleep),
                        labelOf(cleanlinessHabits, person.cleanliness),
                        labelOf(socialHabits, person.social),
                        labelOf(cookingHabits, person.cooking),
                      ].map((habit) => (
                        <li key={habit} className={chip}>
                          {habit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState({ eligibleCount, minScore }: { eligibleCount: number; minScore: number }) {
  return (
    <div className="panel mt-6 p-4">
      <h2 className="text-[15px] font-semibold">现在没有同时符合的人</h2>
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
