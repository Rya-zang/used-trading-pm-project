import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MutualGate } from "../components/MutualGate.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { SelectField } from "../components/SelectField.tsx";
import { Tag } from "../components/Tag.tsx";
import {
  acceptRule,
  pairOf,
  proposeRule,
  refuseRule,
  saveMyRules,
  simulateTheirRuleSheet,
  useDemo,
} from "../domain/demoStore.ts";
import { findCandidate } from "../domain/people.ts";
import {
  hardLinesReady,
  ruleLevelLabel,
  rulePresets,
  viewRules,
  type RuleLevel,
  type RuleLine,
  type TopicPair,
} from "../domain/rules.ts";

export function RulesPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const rules = pairOf(useDemo(), personId).rules;
  const view = viewRules(rules);
  const [slots, setSlots] = useState<RuleSlot[]>(() => initialSlots(rules.mine));
  const [soft, setSoft] = useState(rules.mine.find((line) => line.level === "talk")?.text ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const lines: RuleLine[] = slots.map((slot, index) => ({
      id: `mine-${index}`,
      topic: slot.topic === "custom" ? slot.customTopic.trim() : slot.topic,
      text: slot.topic === "custom" ? slot.customText.trim() : presetText(slot.topic),
      level: slot.level,
      custom: slot.topic === "custom",
    }));
    if (soft.trim()) {
      lines.push({ id: "mine-soft", topic: "另外一句", text: soft.trim(), level: "talk", custom: true });
    }
    if (!hardLinesReady(lines)) {
      setError("硬性的三句要选三件不同的事，程度是「绝不」或「尽量不要」。");
      return;
    }
    saveMyRules(personId, lines);
    setError(null);
  }

  return (
    <MutualGate personId={personId} title="约法三章">
      <PageShell title="约法三章">
        <Link to={`/together/${personId}`} className="text-sm text-warm">
          ← 返回和{person?.nickname}的安排
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">住在一起之前，先说好这些事。</h1>
        <p className="mt-2 text-sm leading-6">这是你们过日子之前说好的话，不是合同，也没有人来惩罚。双方都写好之前，先不对照。</p>
        <div className="mt-6 flex flex-col gap-4">
          {slots.map((slot, index) => (
            <fieldset key={index} className="rounded-card bg-oat p-4">
              <legend className="text-sm text-warm">硬性的第 {index + 1} 句</legend>
              <div className="mt-3 flex flex-col gap-3">
                <SelectField
                  id={`topic-${index}`}
                  label="哪一件事"
                  value={slot.topic}
                  options={[
                    { value: "", label: "请选择" },
                    ...rulePresets.map((item) => ({ value: item.topic, label: item.topic })),
                    { value: "custom", label: "自己写" },
                  ]}
                  onChange={(topic) => setSlots(slots.map((item, itemIndex) => (itemIndex === index ? { ...item, topic } : item)))}
                />
                {slot.topic === "custom" ? (
                  <>
                    <input value={slot.customTopic} onChange={(event) => updateSlot(index, { customTopic: event.target.value.slice(0, 12) })} placeholder="短标题" className="h-12 rounded-input border border-oat bg-cream px-3" />
                    <input value={slot.customText} onChange={(event) => updateSlot(index, { customText: event.target.value.slice(0, 40) })} placeholder="想说的话" className="h-12 rounded-input border border-oat bg-cream px-3" />
                  </>
                ) : null}
                <SelectField
                  id={`level-${index}`}
                  label="到什么程度"
                  value={slot.level}
                  options={[
                    { value: "never", label: "绝不" },
                    { value: "avoid", label: "尽量不要" },
                  ]}
                  onChange={(level) =>
                    setSlots(slots.map((item, itemIndex) => (itemIndex === index ? { ...item, level: level === "never" ? "never" : "avoid" } : item)))
                  }
                />
              </div>
            </fieldset>
          ))}
          <label className="text-sm" htmlFor="soft">
            <span className="mb-2 block text-warm">还可以加一句软一点的（可以商量）</span>
            <input id="soft" value={soft} onChange={(event) => setSoft(event.target.value.slice(0, 40))} className="h-12 w-full rounded-input border border-oat bg-cream px-3" />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton onClick={submit}>我写好了</PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => simulateTheirRuleSheet(personId)}>
            模拟对方也写好
          </PrimaryButton>
        </div>
        {!view.revealed ? <p className="mt-4 text-sm leading-6">对方写好之前，你只能看到自己的，看不到对照。</p> : null}
        {view.revealed ? (
          <div className="mt-6 flex flex-col gap-4">
            <Note rules={rules} />
            <LineList title="你写的" lines={view.mine} />
            <LineList title="对方写的" lines={view.theirs} />
            <PairList title="两边一样" pairs={view.shared} />
            <PairList title="对不上" pairs={view.conflicts} personId={personId} actions />
            <PairList title="还在说" pairs={view.talking} />
            {view.stopsMatch ? <p className="text-sm leading-6">有一条绝不的事没法一起答应。先别定住在一起。</p> : null}
            <History entries={rules.history} />
          </div>
        ) : null}
      </PageShell>
    </MutualGate>
  );

  function updateSlot(index: number, patch: Partial<(typeof slots)[number]>) {
    setSlots(slots.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }
}

interface RuleSlot {
  topic: string;
  level: "never" | "avoid";
  customTopic: string;
  customText: string;
}

function initialSlots(lines: RuleLine[]): RuleSlot[] {
  const hard = lines.filter((line) => line.level !== "talk");
  return [0, 1, 2].map((index) => {
    const line = hard[index];
    const preset = rulePresets.some((item) => item.topic === line?.topic);
    return {
      topic: line ? (preset ? line.topic : "custom") : "",
      level: line?.level === "never" ? "never" : "avoid",
      customTopic: line && !preset ? line.topic : "",
      customText: line && !preset ? line.text : "",
    };
  });
}

function presetText(topic: string): string {
  return rulePresets.find((item) => item.topic === topic)?.text ?? "";
}

function Note({ rules }: { rules: ReturnType<typeof pairOf>["rules"] }) {
  return (
    <p className="text-sm leading-6">
      你们已经把要说的话对过一遍。你写好于 {formatTime(rules.mySubmittedAt)}，对方写好于 {formatTime(rules.theirSubmittedAt)}。
      最近一次修改：{formatTime(rules.lastEditAt)}。
    </p>
  );
}

function LineList({ title, lines }: { title: string; lines: RuleLine[] }) {
  return (
    <section>
      <h2 className="text-sm text-warm">{title}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line.id} className="text-sm leading-6">
            {line.topic} · {ruleLevelLabel[line.level]} · {line.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PairList({
  title,
  pairs,
  personId,
  actions = false,
}: {
  title: string;
  pairs: TopicPair[];
  personId?: string;
  actions?: boolean;
}) {
  if (pairs.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm text-warm">{title}</h2>
      <ul className="mt-2 flex flex-col gap-3">
        {pairs.map((pair) => (
          <li key={pair.topic} className="rounded-card bg-oat p-3">
            <Tag>{pair.topic}</Tag>
            <p className="mt-2 text-sm leading-6">你：{lineText(pair.mine)}</p>
            <p className="text-sm leading-6">对方：{lineText(pair.theirs)}</p>
            {actions && personId ? <ConflictActions personId={personId} pair={pair} /> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConflictActions({ personId, pair }: { personId: string; pair: TopicPair }) {
  const [text, setText] = useState(pair.mine?.text ?? "");
  const [level, setLevel] = useState<RuleLevel>(pair.mine?.level ?? "avoid");
  return (
    <div className="mt-3 flex flex-col gap-2">
      <PrimaryButton variant="quiet" onClick={() => acceptRule(personId, pair.topic)}>
        按对方的来
      </PrimaryButton>
      <SelectField
        id={`edit-${pair.topic}`}
        label="我改一句"
        value={level}
        options={[
          { value: "never", label: "绝不" },
          { value: "avoid", label: "尽量不要" },
          { value: "talk", label: "可以商量" },
        ]}
        onChange={(value) => setLevel(value as RuleLevel)}
      />
      <input value={text} onChange={(event) => setText(event.target.value.slice(0, 40))} className="h-12 rounded-input border border-oat bg-cream px-3" />
      <PrimaryButton
        variant="quiet"
        onClick={() =>
          proposeRule(personId, {
            id: `mine-${pair.topic}`,
            topic: pair.topic,
            text,
            level,
            custom: true,
          })
        }
      >
        写下修改
      </PrimaryButton>
      <PrimaryButton variant="quiet" onClick={() => refuseRule(personId, pair.topic, "me")}>
        没法同意
      </PrimaryButton>
      <PrimaryButton variant="quiet" onClick={() => refuseRule(personId, pair.topic, "them")}>
        模拟对方也没法同意
      </PrimaryButton>
    </div>
  );
}

function History({ entries }: { entries: { at: string; by: "me" | "them"; lines: RuleLine[] }[] }) {
  if (entries.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm text-warm">以前写过的</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {entries.map((entry, index) => (
          <li key={`${entry.at}-${index}`} className="text-sm leading-6">
            {formatTime(entry.at)} · {entry.by === "me" ? "我" : "对方"} · {entry.lines.map((line) => line.topic).join("、")}
          </li>
        ))}
      </ul>
    </section>
  );
}

function lineText(line: RuleLine | undefined): string {
  if (!line) return "没写";
  return `${ruleLevelLabel[line.level]}，${line.text}`;
}

function formatTime(value: string | null): string {
  if (!value) return "还没有";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "还没有";
  return date.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
