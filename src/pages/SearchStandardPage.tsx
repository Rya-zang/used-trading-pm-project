import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MutualGate } from "../components/MutualGate.tsx";
import { PlaceWishPanel } from "../components/PlaceWishPanel.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { Tag } from "../components/Tag.tsx";
import { labelOf, budgetBands, cities, placeLabel } from "../domain/catalog.ts";
import {
  acceptSearchItem,
  confirmSearch,
  pairOf,
  setMySearch,
  simulateTheirSearch,
  simulateTheyCopyMe,
  useDemo,
} from "../domain/demoStore.ts";
import { findCandidate } from "../domain/people.ts";
import {
  canConfirmSheet,
  hasSharedStandard,
  mustConflicts,
  relationLabel,
  searchFields,
  searchRelation,
  sheetComplete,
  stanceLabel,
  type SearchFieldId,
  type Stance,
} from "../domain/searchStandard.ts";
import { useSavedProfile } from "../domain/storage.ts";

export function SearchStandardPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const demo = useDemo();
  const profile = useSavedProfile();
  const search = pairOf(demo, personId).search;
  const ready = hasSharedStandard(search);
  const conflicts = mustConflicts(search);
  const mineReady = sheetComplete(search.mine) && canConfirmSheet(search.mine, search.theirs);
  const theirsReady = sheetComplete(search.theirs) && canConfirmSheet(search.theirs, search.mine);

  function fillFromProfile() {
    if (!profile) return;
    const city = cities.find((item) => item.id === profile.cityId);
    setMySearch(personId, "city", { value: city?.label ?? "", stance: "must" });
    setMySearch(personId, "areas", { value: placeLabel(profile.cityId, profile.areaId).split(" · ")[1] ?? "", stance: "must" });
    setMySearch(personId, "nearby", { value: "邻近片区也可以", stance: "flexible" });
    setMySearch(personId, "metro", { value: "步行能到地铁", stance: "prefer" });
    setMySearch(personId, "commute", { value: "单程 45 分钟内", stance: "flexible" });
    setMySearch(personId, "wholeRent", { value: labelOf(budgetBands, profile.budget), stance: "must" });
    setMySearch(personId, "eachRent", { value: "两人分开出，加起来不超过整租", stance: "prefer" });
    setMySearch(personId, "sharedBills", { value: "水电另算", stance: "must" });
    setMySearch(personId, "layout", { value: "至少两室", stance: "prefer" });
    setMySearch(personId, "privateRoom", { value: "要有自己的卧室", stance: "must" });
    setMySearch(personId, "livingRoom", { value: "客厅可以一起用", stance: "flexible" });
    setMySearch(personId, "pets", { value: "先不养宠物", stance: "prefer" });
    setMySearch(personId, "elevator", { value: "有电梯更好", stance: "flexible" });
    const cookingText = profile.cooking === "often" ? "经常做饭" : profile.cooking === "sometimes" ? "偶尔做饭" : "很少做饭";
    setMySearch(personId, "cooking", { value: cookingText, stance: "prefer" });
    setMySearch(personId, "others", { value: "不要再加不认识的人", stance: "must" });
  }

  return (
    <MutualGate personId={personId} title="找房标准">
      <PageShell title="找房标准">
        <Link to={`/together/${personId}`} className="text-sm text-warm">
          ← 返回和{person?.nickname}的安排
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">一起把找房标准说清楚</h1>
        <p className="mt-2 text-sm leading-6">每一项可以是必须、最好，或可以商量。只有双方都确认，而且没有「必须」对不上的项，才算共同标准。</p>
        <PlaceWishPanel personId={personId} />
        {ready ? <p className="mt-3 text-sm leading-6">共同标准定下来了。可以去看示例房源。</p> : null}
        {ready ? (
          <div className="mt-3">
            <PrimaryButton to={`/housing/listings/${personId}`}>去看示例房源</PrimaryButton>
          </div>
        ) : null}
        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton variant="quiet" onClick={fillFromProfile}>
            用我的资料填一版
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => simulateTheirSearch(personId)}>
            对方也写了一份
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => simulateTheyCopyMe(personId)}>
            对方改成和我一样
          </PrimaryButton>
        </div>
        <ul className="mt-6 flex flex-col gap-3">
          {searchFields.map(([id, label]) => (
            <SearchRow key={id} personId={personId} id={id} label={label} />
          ))}
        </ul>
        {conflicts.length > 0 ? (
          <p className="mt-4 text-sm leading-6">有「必须」对不上。先放着也不会变成共同标准。改成一样，或者把「必须」放宽，才能确认。</p>
        ) : null}
        {!sheetComplete(search.mine) || !sheetComplete(search.theirs) ? (
          <p className="mt-4 text-sm leading-6">每一项都要双方写上，才能确认。</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <PrimaryButton disabled={!mineReady} onClick={() => confirmSearch(personId, "me")}>
            我确认这份标准
          </PrimaryButton>
          <PrimaryButton variant="quiet" disabled={!theirsReady} onClick={() => confirmSearch(personId, "them")}>
            对方确认了
          </PrimaryButton>
          <p className="text-sm leading-6 text-warm">
            你：{search.myConfirmed ? "确认了" : "还没确认"}。对方：{search.theirConfirmed ? "确认了" : "还没确认"}。
            {ready ? "" : " 还没变成共同标准。"}
          </p>
        </div>
      </PageShell>
    </MutualGate>
  );
}

function SearchRow({ personId, id, label }: { personId: string; id: SearchFieldId; label: string }) {
  const search = pairOf(useDemo(), personId).search;
  const mine = search.mine[id];
  const theirs = search.theirs[id];
  const relation = searchRelation(mine, theirs);
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const [value, setValue] = useState(mine?.value ?? "");
  const [stance, setStance] = useState<Stance>(mine?.stance ?? "prefer");

  return (
    <li className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-medium">{label}</h2>
        <Tag tone={relation === "same" ? "sage" : relation === "different" ? "warm" : "quiet"}>{relationLabel[relation]}</Tag>
      </div>
      <p className="mt-2 text-sm leading-6">我的：{mine ? `${mine.value}（${stanceLabel[mine.stance]}）` : "还没写"}</p>
      <p className="text-sm leading-6">对方的：{theirs ? `${theirs.value}（${stanceLabel[theirs.stance]}）` : "还没写"}</p>
      <div className="mt-3 flex flex-col gap-2">
        <PrimaryButton variant="quiet" onClick={() => acceptSearchItem(personId, id)}>
          按对方的
        </PrimaryButton>
        <PrimaryButton
          variant="quiet"
          onClick={() => {
            setValue(mine?.value ?? "");
            setStance(mine?.stance ?? "prefer");
            setHeld(false);
            setOpen((current) => !current);
          }}
        >
          我来写
        </PrimaryButton>
        <PrimaryButton
          variant="quiet"
          onClick={() => {
            setOpen(false);
            setHeld(true);
          }}
        >
          先放着
        </PrimaryButton>
        {held ? <p className="text-sm leading-6 text-warm">先放着。这一项先不改。如果是必须对不上，确认仍会被拦住。</p> : null}
        {open ? (
          <div className="flex flex-col gap-2">
            <input
              value={value}
              onChange={(event) => setValue(event.target.value.slice(0, 30))}
              className="h-12 rounded-input border border-oat bg-white px-3"
              placeholder="写一句"
            />
            <div className="grid grid-cols-3 gap-2">
              {(["must", "prefer", "flexible"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStance(item)}
                  className={`h-10 rounded-input border text-sm ${stance === item ? "border-sage bg-sage text-white" : "border-oat bg-white"}`}
                >
                  {stanceLabel[item]}
                </button>
              ))}
            </div>
            <PrimaryButton
              onClick={() => {
                if (value.trim() === "") return;
                setMySearch(personId, id, { value: value.trim(), stance });
                setOpen(false);
              }}
            >
              写下这一项
            </PrimaryButton>
          </div>
        ) : null}
      </div>
    </li>
  );
}
