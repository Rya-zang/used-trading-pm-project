import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar.tsx";
import { Card } from "../components/Card.tsx";
import { MutualGate } from "../components/MutualGate.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { SelectField } from "../components/SelectField.tsx";
import {
  addAgreement,
  addReminder,
  agreementCategories,
  choreMeta,
  confirmAgreement,
  editAgreement,
  markChore,
  pairOf,
  replyRequest,
  requestTemplates,
  respondReminder,
  sendRequest,
  useDemo,
  type AgreementCategory,
} from "../domain/demoStore.ts";
import { findCandidate, roommateCandidates } from "../domain/people.ts";
import { isMutual, useApplications, useSavedProfile } from "../domain/storage.ts";

const linkClass =
  "block rounded-2xl focus-visible:ring-2 focus-visible:ring-[#C9855A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]";

export function SharedSpacePage() {
  const { personId } = useParams();
  const profile = useSavedProfile();
  const applications = useApplications();
  const demo = useDemo();
  const partners = roommateCandidates.filter((person) => isMutual(applications[person.id]));

  if (!personId) {
    return (
      <PageShell title="合租空间">
        <h1 className="text-2xl font-semibold">合租空间</h1>
        <p className="mt-2 text-sm leading-6 text-[#858585]">
          双方都决定住在一起之后，才能写家里的约定、轻轻说一句、留提醒、记一下家务。这里没有分数，也没有惩罚。
        </p>
        {!profile ? (
          <div className="panel mt-6 p-4">
            <h2 className="text-[15px] font-semibold">先填写资料</h2>
            <p className="mt-1 text-[11px] leading-4 text-[#858585]">填好之后，才能看到可以一起住的人。</p>
            <div className="mt-4">
              <PrimaryButton to="/onboarding">先填写资料</PrimaryButton>
            </div>
          </div>
        ) : partners.length === 0 ? (
          <div className="panel mt-6 p-4">
            <h2 className="text-[15px] font-semibold">还没有双方都同意的人</h2>
            <p className="mt-1 text-[11px] leading-4 text-[#858585]">先去建议里申请，双方都同意后再回来。</p>
            <div className="mt-4">
              <PrimaryButton to="/roommates">去看室友建议</PrimaryButton>
            </div>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {partners.map((person) => {
              const pair = pairOf(demo, person.id);
              const ready = pair.myMoveIn && pair.theirMoveIn;
              return (
                <li key={person.id}>
                  <Link to={ready ? `/space/${person.id}` : `/together/${person.id}`} className={linkClass}>
                    <Card>
                      <div className="flex items-center gap-3">
                        <Avatar id={person.avatarId} size="sm" gender={person.gender} />
                        <div className="min-w-0 flex-1">
                          <h2 className="text-[15px] font-semibold">和{person.nickname}</h2>
                          <p className="mt-0.5 text-[11px] leading-4 text-[#858585]">
                            {ready ? "已经决定住在一起" : "还没双方都决定，先去把看房、租金和约法走完"}
                          </p>
                        </div>
                        <Arrow />
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PageShell>
    );
  }

  const person = findCandidate(personId);
  const pair = pairOf(demo, personId);
  const ready = pair.myMoveIn && pair.theirMoveIn;

  return (
    <MutualGate personId={personId} title="合租空间">
      <PageShell title="合租空间">
        <Link to="/space" className="text-sm text-warm">
          ← 返回合租空间
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">和{person?.nickname}住在一起之后</h1>
        {ready ? (
          <SpaceTools personId={personId} />
        ) : (
          <div className="mt-4">
            <p className="text-sm leading-6">还没到住在一起。先把看房、租金和约法都由双方点完，再各自决定一次。</p>
            <div className="mt-4">
              <PrimaryButton to={`/together/${personId}`}>回到一起往下走</PrimaryButton>
            </div>
          </div>
        )}
      </PageShell>
    </MutualGate>
  );
}

function SpaceTools({ personId }: { personId: string }) {
  const pair = pairOf(useDemo(), personId);
  return (
    <div className="mt-6 flex flex-col gap-8">
      <p className="text-sm leading-6 text-warm">约定要两边各自确认。你可以改一句再发，对方的回复用「模拟对方」来点。</p>
      <Agreements personId={personId} items={pair.agreements} />
      <Requests personId={personId} items={pair.requests} />
      <Reminders personId={personId} items={pair.reminders} />
      <Chores personId={personId} chores={pair.chores} />
    </div>
  );
}

function Agreements({
  personId,
  items,
}: {
  personId: string;
  items: ReturnType<typeof pairOf>["agreements"];
}) {
  const [category, setCategory] = useState<AgreementCategory>("cleaning");
  const [text, setText] = useState("");
  return (
    <ToolSection title="家里的约定" detail="打扫、作息、客人和账单" icon={<NoteIcon />}>
      <div className="flex flex-col gap-3">
        <SelectField
          id="agreement-category"
          label="哪一类"
          value={category}
          options={agreementCategories.map(([id, label]) => ({ value: id, label }))}
          onChange={(value) => setCategory(value as AgreementCategory)}
        />
        <input
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, 80))}
          placeholder="写一句家里的约定"
          className="h-12 rounded-input border border-oat bg-white px-3"
        />
        <PrimaryButton
          onClick={() => {
            addAgreement(personId, category, text);
            setText("");
          }}
        >
          加上这一句
        </PrimaryButton>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <AgreementRow key={item.id} personId={personId} item={item} />
        ))}
      </ul>
    </ToolSection>
  );
}

function AgreementRow({
  personId,
  item,
}: {
  personId: string;
  item: ReturnType<typeof pairOf>["agreements"][number];
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const label = agreementCategories.find(([id]) => id === item.category)?.[1] ?? item.category;
  return (
    <li className="panel p-4">
      <p className="text-sm text-warm">{label}</p>
      <p className="mt-1 text-sm leading-6">{item.text}</p>
      <p className="mt-2 text-sm leading-6">
        你：{item.myConfirmed ? "确认了" : "还没确认"}。对方：{item.theirConfirmed ? "确认了" : "还没确认"}。
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <PrimaryButton variant="quiet" onClick={() => confirmAgreement(personId, item.id, "me")}>
          我确认
        </PrimaryButton>
        <PrimaryButton variant="quiet" onClick={() => confirmAgreement(personId, item.id, "them")}>
          模拟对方也确认
        </PrimaryButton>
        <PrimaryButton variant="quiet" onClick={() => setEditing((current) => !current)}>
          改一句
        </PrimaryButton>
        {editing ? (
          <>
            <input value={text} onChange={(event) => setText(event.target.value.slice(0, 80))} className="h-12 rounded-input border border-oat bg-white px-3" />
            <PrimaryButton
              onClick={() => {
                editAgreement(personId, item.id, text);
                setEditing(false);
              }}
            >
              保存修改
            </PrimaryButton>
          </>
        ) : null}
      </div>
    </li>
  );
}

function Requests({
  personId,
  items,
}: {
  personId: string;
  items: ReturnType<typeof pairOf>["requests"];
}) {
  const [text, setText] = useState<string>(requestTemplates[0].text);
  return (
    <ToolSection title="轻轻说一句" detail="先选一句，可以改完再发" icon={<TalkIcon />}>
      <div className="flex flex-wrap gap-2">
        {requestTemplates.map((template) => (
          <button key={template.id} type="button" onClick={() => setText(template.text)} className="h-8 rounded-full border border-[#EAEAE6] bg-[#FAFAF8] px-3 text-xs text-[#858585]">
            {template.label}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, 80))}
        className="mt-3 min-h-20 w-full rounded-input border border-oat bg-white px-3 py-3 text-base"
      />
      <div className="mt-3">
        <PrimaryButton
          onClick={() => {
            sendRequest(personId, text);
          }}
        >
          发给对方
        </PrimaryButton>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="panel p-4">
            <p className="text-sm leading-6">{item.text}</p>
            <p className="mt-2 text-sm leading-6">对方：{item.reply === "ok" ? "好的" : item.reply === "talk" ? "我们聊聊" : "还没回"}</p>
            <div className="mt-3 flex flex-col gap-2">
              <PrimaryButton variant="quiet" onClick={() => replyRequest(personId, item.id, "ok")}>
                模拟对方说好的
              </PrimaryButton>
              <PrimaryButton variant="quiet" onClick={() => replyRequest(personId, item.id, "talk")}>
                模拟对方说我们聊聊
              </PrimaryButton>
            </div>
          </li>
        ))}
      </ul>
    </ToolSection>
  );
}

function Reminders({
  personId,
  items,
}: {
  personId: string;
  items: ReturnType<typeof pairOf>["reminders"];
}) {
  const [text, setText] = useState("");
  return (
    <ToolSection title="提醒" detail="做完、稍后再说，或者想聊聊，由对方来标" icon={<BellIcon />}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, 80))}
        placeholder="比如：周五把共用纸巾补上"
        className="h-12 w-full rounded-xl border border-[#EAEAE6] bg-white px-3"
      />
      <div className="mt-3">
        <PrimaryButton
          onClick={() => {
            addReminder(personId, text);
            setText("");
          }}
        >
          记下提醒
        </PrimaryButton>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="panel p-4">
            <p className="text-sm leading-6">{item.text}</p>
            <p className="mt-2 text-sm leading-6">
              对方标成：{item.response === "done" ? "做完了" : item.response === "later" ? "稍后再说" : item.response === "talk" ? "我们聊聊" : "还没标"}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <PrimaryButton variant="quiet" onClick={() => respondReminder(personId, item.id, "done")}>
                模拟对方标成做完了
              </PrimaryButton>
              <PrimaryButton variant="quiet" onClick={() => respondReminder(personId, item.id, "later")}>
                模拟对方标成稍后再说
              </PrimaryButton>
              <PrimaryButton variant="quiet" onClick={() => respondReminder(personId, item.id, "talk")}>
                模拟对方说我们聊聊
              </PrimaryButton>
            </div>
          </li>
        ))}
      </ul>
    </ToolSection>
  );
}

function Chores({
  personId,
  chores,
}: {
  personId: string;
  chores: ReturnType<typeof pairOf>["chores"];
}) {
  return (
    <ToolSection title="家务" detail="只记最近一次是谁做的。不加分，也不扣分。" icon={<ChoreIcon />}>
      <ul className="flex flex-col gap-3">
        {choreMeta.map(([id, label]) => {
          const mark = chores[id];
          return (
            <li key={id} className="panel p-4">
              <h3 className="text-base font-medium">{label}</h3>
              <p className="mt-1 text-sm leading-6">
                {mark.by ? `${mark.by === "me" ? "我" : "对方"} · ${formatTime(mark.at)}` : "还没有人记过"}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <PrimaryButton variant="quiet" onClick={() => markChore(personId, id, "me")}>
                  我做了
                </PrimaryButton>
                <PrimaryButton variant="quiet" onClick={() => markChore(personId, id, "them")}>
                  模拟对方做了
                </PrimaryButton>
              </div>
            </li>
          );
        })}
      </ul>
    </ToolSection>
  );
}

function ToolSection({
  title,
  detail,
  icon,
  children,
}: {
  title: string;
  detail: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAFAF8] text-[#C9855A]">
          {icon}
        </span>
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <p className="mt-0.5 text-[11px] leading-4 text-[#858585]">{detail}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Arrow() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAFAF8] text-[#858585]" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20.5H7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4.2M9.5 12.5h6M9.5 16h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TalkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M5 6.5h14v9H8l-3 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M6.5 16.5h11l-1.2-2.2V10a4.3 4.3 0 0 0-8.6 0v4.3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 16.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ChoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M8 4.5h8l1 3H7zM7.5 7.5h9l-.6 12H8.1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function formatTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
