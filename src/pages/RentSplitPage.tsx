import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckRow, SelectField } from "../components/SelectField.tsx";
import { MutualGate } from "../components/MutualGate.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { TextField } from "../components/TextField.tsx";
import { confirmRent, pairOf, reopenRentSplit, saveRent, useDemo } from "../domain/demoStore.ts";
import { findCandidate } from "../domain/people.ts";
import {
  UTILITIES_NOTE,
  airLabel,
  byRoomSuggestion,
  evenSuggestion,
  lightLabel,
  sumsMatch,
  withAmounts,
  amountsFromOne,
  type AirLevel,
  type LightLevel,
  type RentDraft,
  type SplitMode,
  type SplitRoom,
} from "../domain/rent.ts";

export function RentSplitPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const demo = useDemo();
  const rent = pairOf(demo, personId).rent;
  const [error, setError] = useState<string | null>(null);
  const even = evenSuggestion(rent.wholeRent);
  const byRoom = byRoomSuggestion(rent.wholeRent, rent.myRoom.area, rent.theirRoom.area);

  function update(next: RentDraft) {
    saveRent(personId, next);
    setError(null);
  }

  function setWhole(value: string) {
    const whole = Number(value.replace(/\D/g, "").slice(0, 6));
    update({ ...rent, wholeRent: whole || 0, myAmount: null, theirAmount: null, myConfirmed: false, theirConfirmed: false, agreedAt: null });
  }

  function setOne(who: "me" | "them", value: string) {
    const entered = Number(value.replace(/\D/g, "").slice(0, 6));
    const amounts = amountsFromOne(rent.wholeRent, who, entered);
    if (!amounts) {
      setError("这一边不能比整租还多。");
      return;
    }
    update(withAmounts(rent, amounts));
  }

  return (
    <MutualGate personId={personId} title="租金">
      <PageShell title="租金">
        <Link to={`/together/${personId}`} className="text-sm text-warm">
          ← 返回和{person?.nickname}的安排
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">租金怎么分</h1>
        <p className="mt-2 text-sm leading-6">{UTILITIES_NOTE}</p>
        <p className="mt-2 text-sm leading-6">参考数可以填进去，但不会替你们决定谁付更多。填一边，另一边会补成整租。</p>
        <div className="mt-4 flex flex-col gap-4">
          <TextField id="whole" label="整套月租（元）" value={rent.wholeRent ? String(rent.wholeRent) : ""} inputMode="numeric" onChange={setWhole} />
          <RoomEditor title="我的房间" room={rent.myRoom} onChange={(myRoom) => update({ ...rent, myRoom, myConfirmed: false, theirConfirmed: false, agreedAt: null })} />
          <RoomEditor title="对方的房间" room={rent.theirRoom} onChange={(theirRoom) => update({ ...rent, theirRoom, myConfirmed: false, theirConfirmed: false, agreedAt: null })} />
          <div className="flex flex-col gap-2">
            <ModeButton current={rent.mode} mode="even" onPick={(mode) => update({ ...rent, mode })}>
              平分
            </ModeButton>
            <ModeButton current={rent.mode} mode="by-room" onPick={(mode) => update({ ...rent, mode })}>
              按房间看
            </ModeButton>
            <ModeButton current={rent.mode} mode="custom" onPick={(mode) => update({ ...rent, mode })}>
              自己填
            </ModeButton>
          </div>
          {rent.mode === "even" && even ? (
            <p className="text-sm leading-6">平分的参考是 {even.mine} 元和 {even.theirs} 元。多出来的 1 元可以放在任意一边。</p>
          ) : null}
          {rent.mode === "by-room" && byRoom ? (
            <p className="text-sm leading-6">
              按面积摆出来是 {byRoom.mine} 元和 {byRoom.theirs} 元。面积大的参考数会高一些，要不要这么分由你们定。
            </p>
          ) : null}
          {rent.mode !== "custom" ? (
            <PrimaryButton
              variant="quiet"
              onClick={() => {
                const suggestion = rent.mode === "by-room" ? byRoom : even;
                if (!suggestion) return;
                update(withAmounts({ ...rent, mode: rent.mode }, suggestion));
              }}
            >
              填入参考数
            </PrimaryButton>
          ) : null}
          <TextField id="mine" label="我出（元）" value={rent.myAmount === null ? "" : String(rent.myAmount)} inputMode="numeric" onChange={(value) => setOne("me", value)} />
          <TextField id="theirs" label={`${person?.nickname ?? "对方"}出（元）`} value={rent.theirAmount === null ? "" : String(rent.theirAmount)} inputMode="numeric" onChange={(value) => setOne("them", value)} />
          <p className="text-sm leading-6">
            {sumsMatch(rent.wholeRent, rent.myAmount, rent.theirAmount)
              ? `两边加起来是 ${rent.wholeRent} 元。`
              : "两边加起来要等于整套租金。"}
          </p>
        </div>
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        <p className="mt-4 text-sm leading-6">
          你：{rent.myConfirmed ? "确认了" : "还没确认"}。对方：{rent.theirConfirmed ? "确认了" : "还没确认"}。
        </p>
        {rent.agreedAt && rent.myAmount !== null && rent.theirAmount !== null ? (
          <p className="mt-2 text-sm leading-6">记下了：你 {rent.myAmount} 元，对方 {rent.theirAmount} 元。</p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton onClick={() => confirmRent(personId, "me")}>我确认这个分法</PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => confirmRent(personId, "them")}>
            对方确认了
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => reopenRentSplit(personId)}>
            重新打开
          </PrimaryButton>
        </div>
      </PageShell>
    </MutualGate>
  );
}

function ModeButton({
  current,
  mode,
  onPick,
  children,
}: {
  current: SplitMode;
  mode: SplitMode;
  onPick: (mode: SplitMode) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(mode)}
      className={`h-12 rounded-button border text-base ${current === mode ? "border-sage bg-sage text-white" : "border-oat bg-white"}`}
    >
      {children}
    </button>
  );
}

function RoomEditor({ title, room, onChange }: { title: string; room: SplitRoom; onChange: (room: SplitRoom) => void }) {
  return (
    <fieldset className="panel p-4">
      <legend className="text-sm text-warm">{title}</legend>
      <div className="mt-3 flex flex-col gap-3">
        <TextField id={`${title}-area`} label="面积（㎡）" value={String(room.area)} inputMode="numeric" onChange={(value) => onChange({ ...room, area: Number(value.replace(/\D/g, "").slice(0, 3)) || 0 })} />
        <CheckRow label="独立卫生间" checked={room.privateBath} onChange={(privateBath) => onChange({ ...room, privateBath })} />
        <CheckRow label="阳台" checked={room.balcony} onChange={(balcony) => onChange({ ...room, balcony })} />
        <CheckRow label="有储物" checked={room.storage} onChange={(storage) => onChange({ ...room, storage })} />
        <SelectField
          id={`${title}-light`}
          label="光线"
          value={room.light}
          options={(Object.keys(lightLabel) as LightLevel[]).map((id) => ({ value: id, label: lightLabel[id] }))}
          onChange={(light) => onChange({ ...room, light: light as LightLevel })}
        />
        <SelectField
          id={`${title}-air`}
          label="通风"
          value={room.air}
          options={(Object.keys(airLabel) as AirLevel[]).map((id) => ({ value: id, label: airLabel[id] }))}
          onChange={(air) => onChange({ ...room, air: air as AirLevel })}
        />
        <TextField id={`${title}-furniture`} label="家具" value={room.furniture} onChange={(furniture) => onChange({ ...room, furniture })} />
      </div>
    </fieldset>
  );
}
