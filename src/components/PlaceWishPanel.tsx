import { useState } from "react";
import { PrimaryButton } from "./PrimaryButton.tsx";
import { placeWishPresets } from "../domain/commute.ts";
import { confirmPlaceWishSide, pairOf, setPlaceWish, useDemo } from "../domain/demoStore.ts";
import {
  listingPassesSharedMusts,
  metWishText,
  metWishes,
  placeWishesReady,
  wishGroups,
  type PlaceWishId,
  type PlaceWishPick,
} from "../domain/placeWishes.ts";
import { fakeListings } from "../domain/places.ts";

const chip = "h-8 rounded-full border px-3 text-xs";

export function PlaceWishPanel({ personId }: { personId: string }) {
  const wishes = pairOf(useDemo(), personId).placeWishes;
  const [showTheirs, setShowTheirs] = useState(false);
  const groups = wishGroups(wishes);
  const ready = placeWishesReady(wishes);
  const kept = fakeListings.filter((listing) => listingPassesSharedMusts(listing, wishes));

  return (
    <section className="mt-6">
      <h2 className="text-[15px] font-semibold">周边愿望</h2>
      <p className="mt-1 text-xs leading-5 text-[#858585]">
        各记各的。两边都写上的进共同需求。只有两边都标必须，才算共同必须。一边的必须不会变成共同必须。
      </p>
      <WishPicker personId={personId} side="me" title="我的" picks={wishes.mine} />
      <div className="mt-3">
        <PrimaryButton variant="quiet" onClick={() => setShowTheirs((current) => !current)}>
          模拟对方填写
        </PrimaryButton>
      </div>
      {showTheirs ? <WishPicker personId={personId} side="them" title="对方的" picks={wishes.theirs} /> : null}

      <div className="mt-4 flex flex-col gap-3">
        <WishGroup title="双方共同需求" items={groups.shared} empty="两边都写上的才会出现在这里。" />
        <WishGroup title="我的个人需求" items={groups.mine} empty="还没有只属于你的愿望。" />
        <WishGroup title="对方的个人需求" items={groups.theirs} empty="对方还没有只属于自己的愿望。" />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <PrimaryButton disabled={wishes.myConfirmed} onClick={() => confirmPlaceWishSide(personId, "me")}>
          我确认这些愿望
        </PrimaryButton>
        <PrimaryButton variant="quiet" disabled={wishes.theirConfirmed} onClick={() => confirmPlaceWishSide(personId, "them")}>
          模拟对方确认
        </PrimaryButton>
        <p className="text-sm leading-6 text-[#858585]">
          你：{wishes.myConfirmed ? "确认了" : "还没确认"}。对方：{wishes.theirConfirmed ? "确认了" : "还没确认"}。
        </p>
      </div>

      {ready ? (
        <div className="mt-4">
          <p className="text-sm leading-6">
            共同必须对不上的示例房源拿掉了 {fakeListings.length - kept.length} 套，还剩 {kept.length} 套。个人愿望只标注谁对上了。
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {kept.slice(0, 4).map((listing) => {
              const met = metWishes(listing, wishes);
              return (
                <li key={listing.id} className="panel p-3">
                  <p className="text-sm font-medium">{listing.community}</p>
                  <p className="mt-1 text-xs leading-5 text-[#858585]">
                    {met.length > 0 ? met.map((item) => metWishText(item)).join("、") : "这些愿望都没对上"}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[#858585]">双方都确认之后，才按共同必须来筛示例房源。</p>
      )}
    </section>
  );
}

function WishPicker({
  personId,
  side,
  title,
  picks,
}: {
  personId: string;
  side: "me" | "them";
  title: string;
  picks: readonly PlaceWishPick[];
}) {
  return (
    <div className="mt-4">
      <h3 className="text-sm">{title}</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {placeWishPresets.map((preset) => {
          const pick = picks.find((item) => item.id === preset.id) ?? null;
          return (
            <li key={preset.id} className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={Boolean(pick)}
                onClick={() =>
                  setPlaceWish(
                    personId,
                    side,
                    preset.id,
                    pick ? null : { id: preset.id, must: false },
                  )
                }
                className={`${chip} ${pick ? "border-[#C9855A] bg-[#C9855A] text-white" : "border-[#EAEAE6] bg-[#FAFAF8] text-[#858585]"}`}
              >
                {preset.label}
              </button>
              {pick ? (
                <button
                  type="button"
                  aria-pressed={pick.must}
                  onClick={() => setPlaceWish(personId, side, preset.id, { id: preset.id, must: !pick.must })}
                  className={`${chip} ${pick.must ? "border-[#C9855A] text-[#C9855A]" : "border-[#EAEAE6] text-[#858585]"}`}
                >
                  {pick.must ? "必须" : "标成必须"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WishGroup({
  title,
  items,
  empty,
}: {
  title: string;
  items: readonly { id: PlaceWishId; label: string; must: boolean }[];
  empty: string;
}) {
  return (
    <div className="panel p-4">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-xs leading-5 text-[#858585]">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id} className="text-sm leading-6">
              {item.label}
              <span className="text-[#858585]"> · {item.must ? "必须" : "想要"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
