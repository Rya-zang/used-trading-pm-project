import { Link } from "react-router-dom";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PhotoTile } from "../components/PhotoTile.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { Tag } from "../components/Tag.tsx";
import { placeLabel } from "../domain/catalog.ts";
import { pairOf, useDemo } from "../domain/demoStore.ts";
import { hasSharedStandard } from "../domain/searchStandard.ts";
import { mockRooms } from "../domain/places.ts";
import { findCandidate, roommateCandidates } from "../domain/people.ts";
import {
  acceptTheirApplication,
  isMutual,
  receiveTheirApplication,
  useApplications,
  useSavedProfile,
} from "../domain/storage.ts";

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function FindHousingPage() {
  const profile = useSavedProfile();
  const demo = useDemo();
  const applications = useApplications();

  if (!profile) {
    return (
      <PageShell title="找房">
        <h1 className="text-2xl font-semibold">先写好自己的资料</h1>
        <p className="mt-2 text-sm leading-6">知道你是已经有房，还是想一起找，才能把后面的步骤打开。</p>
        <div className="mt-6">
          <PrimaryButton to="/onboarding">去填写</PrimaryButton>
        </div>
      </PageShell>
    );
  }

  const mutuals = roommateCandidates.filter((person) => isMutual(applications[person.id]));

  if (profile.rentalMode === "has-listing") {
    return (
      <PageShell title="找房">
        <h1 className="text-2xl font-semibold">我的房间</h1>
        <p className="mt-2 text-sm leading-6 text-warm">地址是写给演示看的，不会打开地图，也不会发给中介。</p>
        {demo.myRoom ? (
          <Link to={`/housing/rooms/${demo.myRoom.id}`} className={`${linkClass} mt-4 block`}>
            <Card>
              <PhotoTile id={demo.myRoom.photos[0] ?? "living"} />
              <h2 className="mt-3 text-base font-medium">{demo.myRoom.community}</h2>
              <p className="mt-1 text-sm leading-6">
                {placeLabel(demo.myRoom.cityId, demo.myRoom.areaId)} · 整套 {demo.myRoom.wholeRent} 元
              </p>
              <p className="text-sm leading-6">
                {demo.myRoom.layout} · 给室友的房间 {demo.myRoom.roommateRoom.rent} 元
              </p>
            </Card>
          </Link>
        ) : (
          <div className="mt-4">
            <PrimaryButton to="/housing/publish">写下我的房间</PrimaryButton>
          </div>
        )}
        {demo.myRoom ? (
          <div className="mt-3">
            <PrimaryButton to="/housing/publish" variant="quiet">
              修改房间
            </PrimaryButton>
          </div>
        ) : null}

        <section className="mt-8">
          <h2 className="text-sm text-warm">来申请的人</h2>
          <p className="mt-2 text-sm leading-6">只有你这一台手机。可以先当作对方来申请，再由你自己同意。</p>
          <ul className="mt-3 flex flex-col gap-2">
            {roommateCandidates.map((person) => {
              const record = applications[person.id];
              const mutual = isMutual(record);
              return (
                <li key={person.id}>
                  <Card>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-medium">{person.nickname}</h3>
                        <p className="mt-1 text-sm leading-6 text-warm">
                          {mutual ? "双方都同意了" : record?.theirAccepted ? "对方申请了，等你" : "还没申请"}
                        </p>
                      </div>
                      {mutual ? <Tag>可以继续</Tag> : null}
                    </div>
                    <div className="mt-3">
                      {mutual ? (
                        <PrimaryButton to={`/together/${person.id}`}>和{person.nickname}继续</PrimaryButton>
                      ) : record?.theirAccepted ? (
                        <PrimaryButton onClick={() => acceptTheirApplication(person.id)}>我同意</PrimaryButton>
                      ) : (
                        <PrimaryButton variant="quiet" onClick={() => receiveTheirApplication(person.id)}>
                          模拟{person.nickname}来申请
                        </PrimaryButton>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="找房">
      <h1 className="text-2xl font-semibold">找房</h1>
      <p className="mt-2 text-sm leading-6">
        可以先看已经有房的人，也可以和匹配好的人一起把找房标准说清楚，再看示例房源。
      </p>

      <section className="mt-6">
        <h2 className="text-sm text-warm">已经有房的人</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {mockRooms.map((room) => {
            const owner = findCandidate(room.ownerId);
            return (
              <li key={room.id}>
                <Link to={`/housing/rooms/${room.id}`} className={linkClass}>
                  <Card>
                    <PhotoTile id={room.photos[0] ?? "living"} />
                    <h3 className="mt-3 text-base font-medium">
                      {owner?.nickname ?? "室友"} · {room.community}
                    </h3>
                    <p className="mt-1 text-sm leading-6">
                      {placeLabel(room.cityId, room.areaId)} · {room.layout} · 整套 {room.wholeRent} 元
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm text-warm">还没有房，一起找</h2>
        {mutuals.length === 0 ? (
          <div className="mt-2">
            <p className="text-sm leading-6">先找到一个双方都同意的人，再一起定找房标准。</p>
            <div className="mt-3">
              <PrimaryButton to="/roommates">去看室友建议</PrimaryButton>
            </div>
          </div>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {mutuals.map((person) => {
              const ready = hasSharedStandard(pairOf(demo, person.id).search);
              return (
                <li key={person.id}>
                  <Link to={`/together/${person.id}/search`} className={linkClass}>
                    <Card>
                      <h3 className="text-base font-medium">和{person.nickname}对找房标准</h3>
                      <p className="mt-1 text-sm leading-6 text-warm">{ready ? "共同标准已经定了" : "还在对"}</p>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
