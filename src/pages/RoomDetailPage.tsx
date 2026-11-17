import { Link, useParams } from "react-router-dom";
import { PageShell } from "../components/PageShell.tsx";
import { PhotoTile } from "../components/PhotoTile.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { placeLabel } from "../domain/catalog.ts";
import { roomById, toggleSavedRoom, useDemo } from "../domain/demoStore.ts";
import { findCandidate } from "../domain/people.ts";
import type { RoomSpot } from "../domain/places.ts";
import {
  applyToPerson,
  isMutual,
  simulateTheirAcceptance,
  useApplications,
  useSavedProfile,
} from "../domain/storage.ts";

export function RoomDetailPage() {
  const { roomId = "" } = useParams();
  const demo = useDemo();
  const profile = useSavedProfile();
  const applications = useApplications();
  const room = roomById(demo, roomId);
  if (!room) {
    return (
      <PageShell title="房间">
        <h1 className="text-2xl font-semibold">没有这间房</h1>
        <div className="mt-6">
          <PrimaryButton to="/housing">返回找房</PrimaryButton>
        </div>
      </PageShell>
    );
  }
  const mine = room.ownerId === "me";
  const owner = mine ? null : findCandidate(room.ownerId);
  const saved = demo.savedRoomIds.includes(room.id);
  const record = owner ? applications[owner.id] : undefined;
  const mutual = owner ? isMutual(record) : false;

  return (
    <PageShell title={room.community}>
      <Link to="/housing" className="text-sm text-warm">
        ← 返回找房
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{room.community}</h1>
      <p className="mt-2 text-sm leading-6">
        {mine ? profile?.nickname ?? "我" : owner?.nickname ?? "室友"} · {placeLabel(room.cityId, room.areaId)}
      </p>
      <p className="mt-1 text-sm leading-6 text-warm">{room.address}。这是假地址，没有地图。</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {room.photos.map((photo) => (
          <PhotoTile key={photo} id={photo} large />
        ))}
      </div>
      <dl className="mt-4 divide-y divide-oat">
        <Row label="整套月租" value={`${room.wholeRent} 元`} />
        <Row label="户型" value={room.layout} />
        <Row label="面积" value={`${room.areaSqm} ㎡`} />
        <Row label="卧室 / 卫生间" value={`${room.bedrooms} 室 · ${room.baths} 卫`} />
        <Row label="可入住" value={room.moveIn} />
      </dl>
      <RoomBlock title="自己住的房间" spot={room.ownRoom} />
      <RoomBlock title="空给室友的房间" spot={room.roommateRoom} />
      <p className="mt-4 text-sm leading-6">{room.requirements || "没有额外要求。"}</p>
      <p className="mt-2 text-sm leading-6 text-warm">租金是演示数字，不会扣款。</p>
      <div className="mt-6 flex flex-col gap-2">
        {mine ? <PrimaryButton to="/housing/publish">修改房间</PrimaryButton> : null}
        {!mine ? (
          <PrimaryButton variant="quiet" onClick={() => toggleSavedRoom(room.id)}>
            {saved ? "已收藏" : "先收藏"}
          </PrimaryButton>
        ) : null}
        {!mine && owner && !mutual && !record?.myAccepted ? (
          <PrimaryButton onClick={() => applyToPerson(owner.id)}>申请这间房</PrimaryButton>
        ) : null}
        {!mine && owner && record?.myAccepted && !record.theirAccepted ? (
          <PrimaryButton onClick={() => simulateTheirAcceptance(owner.id)}>模拟对方同意</PrimaryButton>
        ) : null}
        {!mine && owner && mutual ? <PrimaryButton to={`/together/${owner.id}`}>约看房、谈租金</PrimaryButton> : null}
      </div>
    </PageShell>
  );
}

function RoomBlock({ title, spot }: { title: string; spot: RoomSpot }) {
  return (
    <section className="mt-4 panel p-4">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-6">
        {spot.name} · {spot.areaSqm} ㎡ · {spot.rent} 元
      </p>
      <p className="text-sm leading-6">
        {spot.privateBath ? "有独立卫生间" : "没有独立卫生间"} · {spot.light} · {spot.balcony ? "有阳台" : "没有阳台"}
      </p>
      <p className="text-sm leading-6">家具：{spot.furniture}</p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-sm text-warm">{label}</dt>
      <dd className="text-right text-sm leading-6">{value}</dd>
    </div>
  );
}
