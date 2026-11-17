import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MutualGate } from "../components/MutualGate.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { SelectField } from "../components/SelectField.tsx";
import { Tag } from "../components/Tag.tsx";
import {
  agreeTime,
  declineTime,
  finishVisit,
  pairOf,
  proposeTime,
  setListingFeedback,
  setRoomAnswer,
  useDemo,
  type DemoState,
} from "../domain/demoStore.ts";
import { findListing, mockRooms } from "../domain/places.ts";
import { findCandidate } from "../domain/people.ts";
import {
  bothAcceptListing,
  bothWantRoom,
  viewingStatusLabel,
  viewingTimes,
  type Viewing,
  type VisitFeedback,
} from "../domain/viewing.ts";

export function ViewingPage() {
  const { personId = "" } = useParams();
  const demo = useDemo();
  const pair = pairOf(demo, personId);
  const places = placeOptions(demo, personId);
  const [placeId, setPlaceId] = useState(places[0]?.id ?? "");
  const [when, setWhen] = useState<string>(viewingTimes[0]);
  const person = findCandidate(personId);

  return (
    <MutualGate personId={personId} title="看房">
      <PageShell title="看房">
        <Link to={`/together/${personId}`} className="text-sm text-warm">
          ← 返回和{person?.nickname}的安排
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">约看房</h1>
        <p className="mt-2 text-sm leading-6">你提时间，对方可以同意、改时间，或者说不去。看完以后各说各的。</p>
        {places.length === 0 ? (
          <p className="mt-4 text-sm leading-6">先有一间房，或者先收藏一套示例房源，才能约时间。</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <SelectField
              id="place"
              label="看哪里"
              value={placeId}
              options={places.map((place) => ({ value: place.id, label: place.label }))}
              onChange={setPlaceId}
            />
            <SelectField
              id="when"
              label="时间"
              value={when}
              options={viewingTimes.map((item) => ({ value: item, label: item }))}
              onChange={setWhen}
            />
            <PrimaryButton
              onClick={() => {
                const place = places.find((item) => item.id === placeId);
                if (!place) return;
                proposeTime(personId, { placeKind: place.kind, placeId: place.id, placeLabel: place.label }, "me", when);
              }}
            >
              我提出这个时间
            </PrimaryButton>
          </div>
        )}
        <ul className="mt-6 flex flex-col gap-3">
          {pair.viewings.map((viewing) => (
            <li key={viewing.id}>
              <ViewingCard personId={personId} viewing={viewing} />
            </li>
          ))}
        </ul>
      </PageShell>
    </MutualGate>
  );
}

function placeOptions(demo: DemoState, personId: string) {
  const options: { kind: "room" | "listing"; id: string; label: string }[] = [];
  if (demo.myRoom) options.push({ kind: "room", id: demo.myRoom.id, label: `我的房间 · ${demo.myRoom.community}` });
  const theirs = mockRooms.find((room) => room.ownerId === personId);
  const owner = findCandidate(personId);
  if (theirs) options.push({ kind: "room", id: theirs.id, label: `${owner?.nickname ?? "对方"}的房间 · ${theirs.community}` });
  const listingIds = [...demo.savedListingIds, ...(demo.sharedListingIds[personId] ?? [])];
  for (const id of listingIds) {
    if (options.some((item) => item.id === id)) continue;
    const listing = findListing(id);
    if (listing) options.push({ kind: "listing", id, label: `示例房 · ${listing.community}` });
  }
  return options;
}

function ViewingCard({ personId, viewing }: { personId: string; viewing: Viewing }) {
  const last = viewing.proposals[viewing.proposals.length - 1];
  const [counter, setCounter] = useState<string>(viewingTimes.find((item) => item !== last?.when) ?? viewingTimes[0]);
  const waitingOnMe = last && last.by === "them" && viewing.status !== "done" && viewing.status !== "cancelled" && viewing.status !== "confirmed";
  const waitingOnThem = last && last.by === "me" && viewing.status !== "done" && viewing.status !== "cancelled" && viewing.status !== "confirmed";

  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-medium">{viewing.placeLabel}</h2>
        <Tag tone={viewing.status === "confirmed" ? "sage" : viewing.status === "cancelled" ? "quiet" : "warm"}>
          {viewingStatusLabel[viewing.status]}
        </Tag>
      </div>
      <p className="mt-2 text-sm leading-6">
        {viewing.agreedWhen ? `定在 ${viewing.agreedWhen}` : last ? `最近一次：${last.by === "me" ? "我" : "对方"}说 ${last.when}` : "还没有时间"}
      </p>
      {waitingOnMe ? (
        <div className="mt-3 flex flex-col gap-2">
          <PrimaryButton onClick={() => agreeTime(personId, viewing.id, "me")}>同意这个时间</PrimaryButton>
          <SelectField id={`counter-${viewing.id}`} label="我改一个时间" value={counter} options={viewingTimes.map((item) => ({ value: item, label: item }))} onChange={setCounter} />
          <PrimaryButton variant="quiet" onClick={() => proposeTime(personId, viewing, "me", counter)}>
            提出新时间
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => declineTime(personId, viewing.id)}>
            这次不去了
          </PrimaryButton>
        </div>
      ) : null}
      {waitingOnThem ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm leading-6 text-warm">等对方。下面三个按钮是在演对方。</p>
          <PrimaryButton variant="quiet" onClick={() => agreeTime(personId, viewing.id, "them")}>
            模拟对方同意
          </PrimaryButton>
          <PrimaryButton
            variant="quiet"
            onClick={() =>
              proposeTime(
                personId,
                viewing,
                "them",
                viewingTimes.find((item) => item !== last.when) ?? viewingTimes[1],
              )
            }
          >
            模拟对方改时间
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => declineTime(personId, viewing.id)}>
            模拟对方说不去
          </PrimaryButton>
        </div>
      ) : null}
      {viewing.status === "confirmed" ? (
        <div className="mt-3">
          <PrimaryButton onClick={() => finishVisit(personId, viewing.id)}>看完了</PrimaryButton>
        </div>
      ) : null}
      {viewing.status === "done" && viewing.placeKind === "room" ? <RoomAnswers personId={personId} viewing={viewing} /> : null}
      {viewing.status === "done" && viewing.placeKind === "listing" ? <ListingAnswers personId={personId} viewing={viewing} /> : null}
    </article>
  );
}

function RoomAnswers({ personId, viewing }: { personId: string; viewing: Viewing }) {
  return (
    <div className="mt-3">
      <p className="text-sm leading-6">你：{yesText(viewing.myYes)}。对方：{yesText(viewing.theirYes)}。</p>
      {bothWantRoom(viewing) ? <p className="mt-1 text-sm leading-6">双方都愿意继续这间。</p> : null}
      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton onClick={() => setRoomAnswer(personId, viewing.id, "me", "yes")}>我愿意</PrimaryButton>
        <PrimaryButton variant="quiet" onClick={() => setRoomAnswer(personId, viewing.id, "me", "no")}>
          我不想住这间
        </PrimaryButton>
        <PrimaryButton variant="quiet" onClick={() => setRoomAnswer(personId, viewing.id, "them", "yes")}>
          模拟对方也愿意
        </PrimaryButton>
        <PrimaryButton variant="quiet" onClick={() => setRoomAnswer(personId, viewing.id, "them", "no")}>
          模拟对方不愿意
        </PrimaryButton>
      </div>
    </div>
  );
}

function ListingAnswers({ personId, viewing }: { personId: string; viewing: Viewing }) {
  const [layout, setLayout] = useState("户型可以");
  const [rent, setRent] = useState("租金还能谈");
  const [baths, setBaths] = useState("卫生间够用");
  const [other, setOther] = useState("");
  const [keep, setKeep] = useState(true);
  const feedback = (like: "yes" | "no"): VisitFeedback => ({ like, layout, rent, baths, other, keep });

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-sm leading-6">
        你：{feedbackText(viewing.myFeedback)}。对方：{feedbackText(viewing.theirFeedback)}。
      </p>
      {bothAcceptListing(viewing) ? <p className="text-sm leading-6">共同接受这套。两个人都说了愿意。</p> : <p className="text-sm text-warm">只有双方都说愿意，才算共同接受。先留着考虑不算。</p>}
      <SelectField id={`layout-${viewing.id}`} label="户型" value={layout} options={["户型可以", "户型不合适"].map((item) => ({ value: item, label: item }))} onChange={setLayout} />
      <SelectField id={`rent-${viewing.id}`} label="租金" value={rent} options={["租金还能谈", "租金太高"].map((item) => ({ value: item, label: item }))} onChange={setRent} />
      <SelectField id={`baths-${viewing.id}`} label="卫生间" value={baths} options={["卫生间够用", "卫生间不够"].map((item) => ({ value: item, label: item }))} onChange={setBaths} />
      <label className="text-sm" htmlFor={`other-${viewing.id}`}>
        <span className="mb-2 block text-warm">其他问题</span>
        <input id={`other-${viewing.id}`} value={other} onChange={(event) => setOther(event.target.value.slice(0, 40))} className="h-12 w-full rounded-input border border-oat bg-white px-3" />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={keep} onChange={(event) => setKeep(event.target.checked)} className="h-4 w-4 accent-sage" />
        先留着考虑
      </label>
      <PrimaryButton onClick={() => setListingFeedback(personId, viewing.id, "me", feedback("yes"))}>我愿意要这套</PrimaryButton>
      <PrimaryButton variant="quiet" onClick={() => setListingFeedback(personId, viewing.id, "me", feedback("no"))}>
        我不要这套
      </PrimaryButton>
      <PrimaryButton variant="quiet" onClick={() => setListingFeedback(personId, viewing.id, "them", { like: "yes", layout: "户型可以", rent: "租金还能谈", baths: "卫生间够用", other: "", keep: false })}>
        模拟对方也愿意
      </PrimaryButton>
      <PrimaryButton variant="quiet" onClick={() => setListingFeedback(personId, viewing.id, "them", { like: "no", layout: "户型不合适", rent: "租金太高", baths: "卫生间不够", other: "还想再看看", keep: true })}>
        模拟对方不要
      </PrimaryButton>
    </div>
  );
}

function yesText(value: "yes" | "no" | null): string {
  if (value === "yes") return "愿意";
  if (value === "no") return "不愿意";
  return "还没说";
}

function feedbackText(value: VisitFeedback | null): string {
  if (!value) return "还没说";
  return value.like === "yes" ? "愿意" : "不愿意";
}
