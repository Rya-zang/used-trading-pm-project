import {
  budgetBands,
  coupleAcceptances,
  genders,
  genderPreferences,
  householdSizes,
  labelOf,
  moveInOptions,
  placeLabel,
  rentalModes,
  cleanlinessHabits,
  cookingHabits,
  sleepHabits,
  socialHabits,
} from "../domain/catalog.ts";
import type { RoommateProfile } from "../domain/profile.ts";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="shrink-0 text-sm text-warm">{label}</dt>
      <dd className="text-right text-sm leading-6">{value}</dd>
    </div>
  );
}

export function arrangementText(person: RoommateProfile): string {
  if (person.relationship === "single") return "一个人住";
  if (person.partnerMoveIn === "together") return "有伴侣，会一起入住";
  return "有伴侣，不一起入住";
}

export function ProfileFacts({ person }: { person: RoommateProfile }) {
  return (
    <div>
      {person.bio ? <p className="text-base leading-7">{person.bio}</p> : <p className="text-sm text-warm">还没有写介绍。</p>}
      <dl className="mt-2 divide-y divide-oat">
        <Row label="城市片区" value={placeLabel(person.cityId, person.areaId)} />
        <Row label="预算" value={labelOf(budgetBands, person.budget)} />
        <Row label="入住" value={labelOf(moveInOptions, person.moveIn)} />
        <Row label="房源" value={labelOf(rentalModes, person.rentalMode)} />
        <Row label="性别" value={labelOf(genders, person.gender)} />
        <Row label="希望室友" value={labelOf(genderPreferences, person.genderPreference)} />
        <Row label="入住情况" value={arrangementText(person)} />
        <Row label="情侣合住" value={labelOf(coupleAcceptances, person.coupleAcceptance)} />
        <Row label="希望人数" value={labelOf(householdSizes, person.householdSize)} />
        <Row label="作息" value={labelOf(sleepHabits, person.sleep)} />
        <Row label="整洁" value={labelOf(cleanlinessHabits, person.cleanliness)} />
        <Row label="在家见朋友" value={labelOf(socialHabits, person.social)} />
        <Row label="做饭" value={labelOf(cookingHabits, person.cooking)} />
        <Row label="MBTI" value={person.mbti ?? "未填写"} />
      </dl>
    </div>
  );
}
