import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar.tsx";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { ProfileFacts } from "../components/ProfileFacts.tsx";
import { genders, labelOf } from "../domain/catalog.ts";
import { findCandidate } from "../domain/people.ts";
import { clearDemoData } from "../domain/demoStore.ts";
import { clearLocalRoommateData, isMutual, useApplications, useSavedProfile } from "../domain/storage.ts";

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function MePage() {
  const profile = useSavedProfile();
  const applications = useApplications();
  const [confirmClear, setConfirmClear] = useState(false);
  const chats = Object.entries(applications)
    .filter(([, record]) => isMutual(record))
    .map(([id]) => findCandidate(id))
    .filter((person) => person !== null);

  if (!profile) {
    return (
      <PageShell title="我的">
        <h1 className="text-2xl font-semibold">我的</h1>
        <p className="mt-2 text-sm leading-6">还没有资料。填好之后会留在这台手机上。</p>
        <div className="mt-6">
          <PrimaryButton to="/onboarding">去填写</PrimaryButton>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="我的">
      <div className="flex items-center gap-3">
        <Avatar id={profile.avatarId} size="lg" gender={profile.gender} />
        <div>
          <h1 className="text-2xl font-semibold">{profile.nickname}</h1>
          <p className="mt-1 text-sm leading-6">
            {profile.age} 岁 · {labelOf(genders, profile.gender)}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-warm">这些资料保存在这台手机上，刷新后还在。</p>
      <div className="mt-4">
        <ProfileFacts person={profile} />
      </div>

      <section className="mt-6" aria-labelledby="chats-heading">
        <h2 id="chats-heading" className="text-sm text-warm">
          可以聊天的人
        </h2>
        {chats.length === 0 ? (
          <p className="mt-2 text-sm leading-6">还没有双方都同意的人。先去建议里申请。</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {chats.map((person) => (
              <li key={person.id}>
                <Link to={`/roommates/${person.id}/chat`} className={linkClass}>
                  <Card>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Avatar id={person.avatarId} size="sm" gender={person.gender} />
                        <span className="text-base">{person.nickname}</span>
                      </span>
                      <span aria-hidden="true" className="text-warm">
                        →
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-2">
        <PrimaryButton to="/housing/workplace" variant="quiet">
          上班地点和周边
        </PrimaryButton>
        <PrimaryButton to="/onboarding?edit=1">修改资料</PrimaryButton>
        {confirmClear ? (
          <>
            <p className="text-sm leading-6">会清掉资料、申请、聊天、上班地点、周边和值日表，以及这台手机上的房间、看房、租金、约法和合租空间。</p>
            <PrimaryButton
              variant="quiet"
              onClick={() => {
                clearLocalRoommateData();
                clearDemoData();
                setConfirmClear(false);
              }}
            >
              确认清除
            </PrimaryButton>
            <PrimaryButton variant="quiet" onClick={() => setConfirmClear(false)}>
              取消
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton variant="quiet" onClick={() => setConfirmClear(true)}>
            清除这台手机上的演示数据
          </PrimaryButton>
        )}
      </div>
    </PageShell>
  );
}
