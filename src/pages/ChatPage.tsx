import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { genders, labelOf, placeLabel } from "../domain/catalog.ts";
import { findCandidate, isTestRoommate } from "../domain/people.ts";
import { isMutual, sendMessage, useApplications, useMessages, useSavedProfile } from "../domain/storage.ts";

const shellClass = "flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-44";
const linkClass =
  "rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function ChatPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const profile = useSavedProfile();
  const applications = useApplications();
  const messages = useMessages().filter((message) => message.personId === personId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const mutual = person ? isMutual(applications[person.id]) : false;
  const testing = person ? isTestRoommate(person.id) : false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (!person) {
    return (
      <PageShell title="聊天">
        <h1 className="text-2xl font-semibold">没有这个人</h1>
        <div className="mt-6">
          <PrimaryButton to="/roommates">返回建议</PrimaryButton>
        </div>
      </PageShell>
    );
  }

  if (!testing && (!profile || !mutual)) {
    return (
      <PageShell title={`和${person.nickname}聊天`}>
        <h1 className="text-2xl font-semibold">还不能聊天</h1>
        <p className="mt-2 text-sm leading-6">双方都同意之后，才能在这里发消息。</p>
        <div className="mt-6">
          <PrimaryButton to={`/roommates/${person.id}`}>返回对方资料</PrimaryButton>
        </div>
      </PageShell>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = text.trim();
    if (!next || !person) return;
    sendMessage(person.id, next);
    setText("");
  }

  return (
    <PageShell title={`和${person.nickname}聊天`} mainClassName={shellClass}>
      <Link to={`/roommates/${person.id}`} className={`panel flex items-center gap-3 p-3.5 ${linkClass}`}>
        <Avatar id={person.avatarId} size="sm" gender={person.gender} />
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">{person.nickname}</span>
          <span className="mt-0.5 block text-xs text-[#858585]">
            {person.age}岁 · {labelOf(genders, person.gender)} · {placeLabel(person.cityId, person.areaId)}
          </span>
        </span>
      </Link>
      {person.bio ? <p className="mt-3 text-sm leading-6">{person.bio}</p> : null}
      <p className="mt-2 text-sm text-warm">点上面可以看完整资料。</p>
      <div className="mt-4">
        <p className="text-sm leading-6 text-warm">可以先点一个话题，句子会填进输入框，你再自己发出去。</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chatTopics.map(([label, sentence]) => (
            <button
              key={label}
              type="button"
              onClick={() => setText(sentence)}
              className="h-8 rounded-full border border-[#EAEAE6] bg-[#FAFAF8] px-3 text-xs text-[#858585] focus-visible:ring-2 focus-visible:ring-[#C9855A]"
            >
              {label}
            </button>
          ))}
        </div>
        <Link to={`/together/${person.id}`} className="mt-3 inline-flex min-h-11 items-center text-sm text-warm">
          去看房、分租金、说约法
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {messages.length === 0 ? <p className="text-sm leading-6 text-warm">还没有消息。写一句招呼吧。</p> : null}
        {messages.map((message) => (
          <div key={message.id} className={message.sender === "me" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={[
                "max-w-[80%] rounded-card px-3 py-2",
                message.sender === "me" ? "bg-[#C9855A] text-white" : "border border-[#EAEAE6] bg-white shadow-[0_8px_24px_rgba(37,37,37,0.05)]",
              ].join(" ")}
            >
              <p className="text-base leading-6 break-words">{message.text}</p>
              <p className="mt-1 text-[11px] text-warm">
                {message.sender === "me" ? "我" : person.nickname} · {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-[#eeeeea] bg-white"
      >
        <div className="mx-auto flex w-full max-w-[420px] items-end gap-2 px-5 py-3">
          <label htmlFor="chat-text" className="sr-only">
            消息
          </label>
          <textarea
            id="chat-text"
            value={text}
            rows={1}
            maxLength={500}
            placeholder="写一句…"
            enterKeyHint="send"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            className="max-h-28 min-h-12 flex-1 resize-none rounded-input border border-oat bg-white px-3 py-3 text-base outline-none focus-visible:border-sage"
          />
          <div className="w-20 shrink-0">
            <PrimaryButton type="submit" disabled={text.trim() === ""}>
              发送
            </PrimaryButton>
          </div>
        </div>
      </form>
    </PageShell>
  );
}

const chatTopics = [
  ["房间", "想先聊聊房间。"],
  ["租金", "租金想怎么分？"],
  ["公共费用", "水电想另外算，不放进房租。"],
  ["生活习惯", "作息和打扫也想对一下。"],
  ["看房", "这周方便看房吗？"],
  ["入住", "入住时间想对一下。"],
] as const;

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}
