import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ActionBar } from "../components/ActionBar.tsx";
import { Avatar } from "../components/Avatar.tsx";
import { ChoiceGroup } from "../components/ChoiceGroup.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { TextField } from "../components/TextField.tsx";
import {
  MBTI_DISCLAIMER,
  areaBelongsToCity,
  avatars,
  budgetBands,
  cities,
  cleanlinessHabits,
  cookingHabits,
  coupleAcceptances,
  genderPreferences,
  genders,
  householdSizes,
  labelOf,
  mbtiTypes,
  moveInOptions,
  partnerMoveIns,
  placeLabel,
  relationships,
  rentalModes,
  sleepHabits,
  socialHabits,
  type CityId,
} from "../domain/catalog.ts";
import {
  ONBOARDING_STEP_COUNT,
  draftToProfile,
  firstInvalidStep,
  stepError,
  type OnboardingDraft,
} from "../domain/profile.ts";
import { CURRENT_USER_ID, initialDraftFromLocation, saveDraft, saveProfile } from "../domain/storage.ts";

const shellClass = "flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-44";

const steps = [
  { title: "你是谁", lead: "昵称会显示给对方。年龄和性别用来筛选室友。" },
  { title: "一句介绍", lead: "可以不写。写了会显示在资料里。" },
  { title: "想住在哪里", lead: "城市、片区、预算和入住时间会算进资料参考。" },
  { title: "现在有没有房源", lead: "先记下来。保存之后可以去写自己的房间，或和对方一起看示例房源。" },
  { title: "希望室友是", lead: "这一项会直接决定谁能出现，不会拿来加分。" },
  { title: "伴侣和人数", lead: "能否接受情侣、想几个人住，也会直接筛掉对不上的人。" },
  { title: "生活习惯", lead: "作息、整洁、在家见朋友和做饭，会算进资料参考。" },
  { title: "性格标签", lead: `${MBTI_DISCLAIMER}可以不选。` },
  { title: "看一遍再保存", lead: "保存之后会留在这台手机上，刷新也不会丢。" },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OnboardingDraft>(() => initialDraftFromLocation(window.location.search));
  const [attempted, setAttempted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (leavingRef.current) return;
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [draft.step]);

  function update(patch: Partial<OnboardingDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function goBack() {
    setAttempted(false);
    setSaveError(null);
    update({ step: Math.max(0, draft.step - 1) });
  }

  function finish() {
    const invalid = firstInvalidStep(draft);
    if (invalid !== null) {
      setAttempted(true);
      update({ step: invalid });
      return;
    }
    const profile = draftToProfile(draft, CURRENT_USER_ID);
    if (!profile) {
      setSaveError("还有没填完的内容。");
      return;
    }
    leavingRef.current = true;
    saveProfile(profile);
    navigate("/roommates");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.step >= ONBOARDING_STEP_COUNT - 1) {
      finish();
      return;
    }
    const error = stepError(draft, draft.step);
    if (error) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    update({ step: draft.step + 1 });
  }

  const error = attempted ? stepError(draft, draft.step) : null;
  const step = steps[draft.step] ?? steps[0];

  return (
    <PageShell title="填写资料" mainClassName={shellClass}>
      <form onSubmit={onSubmit}>
        <p className="text-sm text-warm">
          第 {draft.step + 1} 步，共 {ONBOARDING_STEP_COUNT} 步
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-oat" aria-hidden="true">
          <div
            className="h-full bg-sage"
            style={{ width: `${((draft.step + 1) / ONBOARDING_STEP_COUNT) * 100}%` }}
          />
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-semibold outline-none">
          {step.title}
        </h1>
        <p className="mt-2 text-sm leading-6">{step.lead}</p>
        <div className="mt-6">
          <StepBody draft={draft} update={update} />
        </div>
        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
        {saveError ? <p className="mt-4 text-sm text-error">{saveError}</p> : null}
        <ActionBar>
          {draft.step > 0 ? (
            <div className="w-28 shrink-0">
              <PrimaryButton variant="quiet" onClick={goBack}>
                上一步
              </PrimaryButton>
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <PrimaryButton type="submit">
              {draft.step === ONBOARDING_STEP_COUNT - 1 ? "保存并去看室友" : "下一步"}
            </PrimaryButton>
          </div>
        </ActionBar>
      </form>
    </PageShell>
  );
}

function StepBody({
  draft,
  update,
}: {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}) {
  if (draft.step === 0) {
    return (
      <div className="flex flex-col gap-4">
        <TextField
          id="nickname"
          label="昵称"
          value={draft.nickname}
          maxLength={12}
          autoComplete="nickname"
          placeholder="比如：小林"
          onChange={(nickname) => update({ nickname: nickname.slice(0, 12) })}
        />
        <TextField
          id="age"
          label="年龄"
          value={draft.age}
          inputMode="numeric"
          placeholder="18–60"
          onChange={(age) => update({ age: age.replace(/\D/g, "").slice(0, 2) })}
        />
        <ChoiceGroup
          label="性别"
          name="gender"
          value={draft.gender}
          options={genders}
          onChange={(gender) => update({ gender })}
        />
        <AvatarPicker value={draft.avatarId} gender={draft.gender} onChange={(avatarId) => update({ avatarId })} />
      </div>
    );
  }

  if (draft.step === 1) {
    return (
      <label htmlFor="bio" className="block text-sm">
        <span className="mb-2 block text-warm">介绍（选填）</span>
        <textarea
          id="bio"
          value={draft.bio}
          maxLength={80}
          rows={4}
          placeholder="用一两句说说你平时怎么生活。"
          onChange={(event) => update({ bio: event.target.value.slice(0, 80) })}
          className="w-full rounded-input border border-oat bg-white px-3 py-3 text-base text-ink outline-none placeholder:text-muted focus-visible:border-sage"
        />
        <span className="mt-2 block text-warm">{draft.bio.trim().length}/80</span>
      </label>
    );
  }

  if (draft.step === 2) {
    return (
      <div className="flex flex-col gap-4">
        <ChoiceGroup
          label="城市"
          name="city"
          value={draft.cityId}
          options={cities}
          onChange={(cityId) => update(cityPatch(draft, cityId))}
        />
        {draft.cityId ? (
          <ChoiceGroup
            label="片区"
            name="area"
            value={draft.areaId}
            options={cities.find((city) => city.id === draft.cityId)?.areas ?? []}
            onChange={(areaId) => update({ areaId })}
          />
        ) : null}
        <ChoiceGroup
          label="每月预算"
          name="budget"
          value={draft.budget}
          options={budgetBands}
          onChange={(budget) => update({ budget })}
        />
        <ChoiceGroup
          label="打算何时入住"
          name="move-in"
          value={draft.moveIn}
          options={moveInOptions}
          onChange={(moveIn) => update({ moveIn })}
        />
      </div>
    );
  }

  if (draft.step === 3) {
    return (
      <ChoiceGroup
        label="租房方式"
        name="rental-mode"
        value={draft.rentalMode}
        options={rentalModes}
        onChange={(rentalMode) => update({ rentalMode })}
      />
    );
  }

  if (draft.step === 4) {
    return (
      <ChoiceGroup
        label="希望一起住的人是"
        name="gender-preference"
        value={draft.genderPreference}
        options={genderPreferences}
        onChange={(genderPreference) => update({ genderPreference })}
      />
    );
  }

  if (draft.step === 5) {
    return (
      <div className="flex flex-col gap-4">
        <ChoiceGroup
          label="你现在"
          name="relationship"
          value={draft.relationship}
          options={relationships}
          onChange={(relationship) =>
            update({
              relationship,
              partnerMoveIn: relationship === "single" ? null : draft.partnerMoveIn,
            })
          }
        />
        {draft.relationship === "partner" ? (
          <ChoiceGroup
            label="伴侣会一起住吗"
            name="partner-move-in"
            value={draft.partnerMoveIn}
            options={partnerMoveIns}
            onChange={(partnerMoveIn) => update({ partnerMoveIn })}
          />
        ) : null}
        <ChoiceGroup
          label="能否接受室友带着伴侣一起住"
          name="couple-acceptance"
          value={draft.coupleAcceptance}
          options={coupleAcceptances}
          onChange={(coupleAcceptance) => update({ coupleAcceptance })}
        />
        <ChoiceGroup
          label="希望这个家一共几个人"
          name="household"
          value={draft.householdSize}
          options={householdSizes}
          onChange={(householdSize) => update({ householdSize })}
        />
        <p className="text-sm leading-6 text-warm">如果你和伴侣一起住，两个人都算在人数里。</p>
      </div>
    );
  }

  if (draft.step === 6) {
    return (
      <div className="flex flex-col gap-4">
        <ChoiceGroup label="作息" name="sleep" value={draft.sleep} options={sleepHabits} onChange={(sleep) => update({ sleep })} />
        <ChoiceGroup
          label="整洁"
          name="cleanliness"
          value={draft.cleanliness}
          options={cleanlinessHabits}
          onChange={(cleanliness) => update({ cleanliness })}
        />
        <ChoiceGroup
          label="在家见朋友"
          name="social"
          value={draft.social}
          options={socialHabits}
          onChange={(social) => update({ social })}
        />
        <ChoiceGroup
          label="做饭"
          name="cooking"
          value={draft.cooking}
          options={cookingHabits}
          onChange={(cooking) => update({ cooking })}
        />
      </div>
    );
  }

  if (draft.step === 7) {
    return (
      <div>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="MBTI">
          {mbtiTypes.map((item) => {
            const selected = draft.mbti === item;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ mbti: item })}
                className={[
                  "h-11 rounded-input text-sm focus-visible:ring-2 focus-visible:ring-warm",
                  selected ? "bg-sage text-white" : "border border-oat bg-white text-ink",
                ].join(" ")}
              >
                {item}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <PrimaryButton variant="quiet" onClick={() => update({ mbti: null })}>
            {draft.mbti ? "先不填，清空选择" : "先不填"}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return <ConfirmSummary draft={draft} />;
}

function cityPatch(draft: OnboardingDraft, cityId: CityId): Partial<OnboardingDraft> {
  const areaId = draft.areaId;
  const keepArea = areaId !== null && areaBelongsToCity(cityId, areaId);
  return { cityId, areaId: keepArea ? areaId : null };
}

function AvatarPicker({
  value,
  gender,
  onChange,
}: {
  value: OnboardingDraft["avatarId"];
  gender: OnboardingDraft["gender"];
  onChange: (avatarId: NonNullable<OnboardingDraft["avatarId"]>) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-warm">头像</legend>
      <div className="grid grid-cols-4 gap-2">
        {avatars.map((avatar) => {
          const selected = value === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              aria-pressed={selected}
              aria-label={avatar.label}
              onClick={() => onChange(avatar.id)}
              className={[
                "flex h-16 items-center justify-center rounded-card focus-visible:ring-2 focus-visible:ring-warm",
                selected ? "ring-2 ring-ink" : "",
              ].join(" ")}
            >
              <Avatar id={avatar.id} gender={gender} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ConfirmSummary({ draft }: { draft: OnboardingDraft }) {
  const rows = [
    ["昵称", draft.nickname.trim() || "未填"],
    ["年龄", draft.age || "未填"],
    ["性别", draft.gender ? labelOf(genders, draft.gender) : "未填"],
    ["介绍", draft.bio.trim() || "未写"],
    ["地方", draft.cityId && draft.areaId ? placeLabel(draft.cityId, draft.areaId) : "未填"],
    ["预算", draft.budget ? labelOf(budgetBands, draft.budget) : "未填"],
    ["入住", draft.moveIn ? labelOf(moveInOptions, draft.moveIn) : "未填"],
    ["房源", draft.rentalMode ? labelOf(rentalModes, draft.rentalMode) : "未填"],
    ["希望室友", draft.genderPreference ? labelOf(genderPreferences, draft.genderPreference) : "未填"],
    [
      "入住情况",
      draft.relationship === "single"
        ? "一个人住"
        : draft.partnerMoveIn
          ? labelOf(partnerMoveIns, draft.partnerMoveIn)
          : "未填",
    ],
    ["情侣合住", draft.coupleAcceptance ? labelOf(coupleAcceptances, draft.coupleAcceptance) : "未填"],
    ["人数", draft.householdSize ? labelOf(householdSizes, draft.householdSize) : "未填"],
    ["作息", draft.sleep ? labelOf(sleepHabits, draft.sleep) : "未填"],
    ["整洁", draft.cleanliness ? labelOf(cleanlinessHabits, draft.cleanliness) : "未填"],
    ["在家见朋友", draft.social ? labelOf(socialHabits, draft.social) : "未填"],
    ["做饭", draft.cooking ? labelOf(cookingHabits, draft.cooking) : "未填"],
    ["MBTI", draft.mbti ?? "未填写"],
  ];

  return (
    <div>
      {draft.avatarId ? <Avatar id={draft.avatarId} size="lg" gender={draft.gender} /> : null}
      <dl className="mt-4 divide-y divide-oat">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 py-2">
            <dt className="shrink-0 text-sm text-warm">{label}</dt>
            <dd className="text-right text-sm leading-6">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
