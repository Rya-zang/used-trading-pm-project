import { Link, useParams } from "react-router-dom";
import { ActionBar } from "../components/ActionBar.tsx";
import { Avatar } from "../components/Avatar.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { ProfileFacts } from "../components/ProfileFacts.tsx";
import { ScoreCard } from "../components/ScoreCard.tsx";
import { genders, labelOf, placeLabel } from "../domain/catalog.ts";
import { explainMatch, hardBlockLabel, hardBlocks } from "../domain/match.ts";
import { findCandidate } from "../domain/people.ts";
import {
  applyToPerson,
  isMutual,
  simulateTheirAcceptance,
  useApplications,
  useSavedProfile,
} from "../domain/storage.ts";

const shellClass = "flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-56";

export function RoommateDetailPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const profile = useSavedProfile();
  const applications = useApplications();

  if (!person) {
    return (
      <PageShell title="找室友">
        <h1 className="text-2xl font-semibold">没有这个人</h1>
        <p className="mt-2 text-sm leading-6">可以回到建议列表再看看。</p>
        <div className="mt-6">
          <PrimaryButton to="/roommates">返回建议</PrimaryButton>
        </div>
      </PageShell>
    );
  }

  const application = applications[person.id];
  const mutual = isMutual(application);
  const blocks = profile ? hardBlocks(profile, person) : [];
  const blocked = blocks.length > 0 && !mutual;

  return (
    <PageShell title={person.nickname} mainClassName={profile && !blocked ? shellClass : undefined}>
      <Link to="/roommates" className="text-sm text-warm">
        ← 返回建议
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <Avatar id={person.avatarId} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold">{person.nickname}</h1>
          <p className="mt-1 text-sm leading-6">
            {person.age} 岁 · {labelOf(genders, person.gender)}
          </p>
          <p className="text-sm leading-6 text-warm">{placeLabel(person.cityId, person.areaId)}</p>
        </div>
      </div>

      {!profile ? (
        <div className="mt-6">
          <p className="text-sm leading-6">先填写自己的资料，才能看到参考分和申请。</p>
          <div className="mt-4">
            <PrimaryButton to="/onboarding">去填写</PrimaryButton>
          </div>
        </div>
      ) : null}

      {profile && blocked ? (
        <section className="mt-6 rounded-card bg-oat p-4">
          <h2 className="text-base font-medium">对方现在不会出现在建议里</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {blocks.map((block) => (
              <li key={block} className="text-sm leading-6">
                {hardBlockLabel[block]}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <PrimaryButton to="/onboarding?edit=1" variant="quiet">
              去修改资料
            </PrimaryButton>
          </div>
        </section>
      ) : null}

      {profile && !blocked ? (
        <div className="mt-6">
          <ScoreCard match={explainMatch(profile, person)} />
          <p className="mt-4 text-sm leading-6 text-warm">租房方式不计入参考分，只说明对方现在有没有房子。</p>
        </div>
      ) : null}

      <section className="mt-6">
        <h2 className="text-base font-medium">对方的资料</h2>
        <div className="mt-2">
          <ProfileFacts person={person} />
        </div>
      </section>

      {profile && !blocked ? (
        <ActionBar>
          {mutual ? (
            <div className="min-w-0 flex-1">
              <PrimaryButton to={`/roommates/${person.id}/chat`}>去聊天</PrimaryButton>
            </div>
          ) : application?.myAccepted ? (
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-center text-xs leading-5 text-warm">
                现在只有你这一个账号。点下面，就当作对方也同意了。双方都同意后才能聊天。
              </p>
              <PrimaryButton onClick={() => simulateTheirAcceptance(person.id)}>模拟对方同意</PrimaryButton>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <PrimaryButton onClick={() => applyToPerson(person.id)}>申请合租</PrimaryButton>
            </div>
          )}
        </ActionBar>
      ) : null}
    </PageShell>
  );
}
