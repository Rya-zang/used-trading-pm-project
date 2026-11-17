import { cellLabel, rosterChores, weekDays } from "../domain/roster.ts";
import { cycleRoster, useRoster } from "../domain/storage.ts";

export function ChoreRoster({ personId }: { personId: string }) {
  const roster = useRoster(personId);
  return (
    <section id="roster" className="panel p-4">
      <h2 className="text-[15px] font-semibold">值日表</h2>
      <p className="mt-1 text-xs leading-5 text-[#858585]">
        点一天，在空、我和对方之间换。两边看的是同一张表。没有打分，也没有惩罚。
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {rosterChores.map((chore) => (
          <div key={chore.id}>
            <p className="text-sm">{chore.label}</p>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {weekDays.map((day, index) => {
                const cell = roster[chore.id][index] ?? "";
                const filled = cell !== "";
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => cycleRoster(personId, chore.id, index)}
                    className={[
                      "flex h-14 flex-col items-center justify-center rounded-xl border text-[11px]",
                      filled ? "border-[#C9855A] bg-[#C9855A] text-white" : "border-[#EAEAE6] bg-[#FAFAF8] text-[#858585]",
                    ].join(" ")}
                  >
                    <span>{day.slice(1)}</span>
                    <span className="mt-0.5">{cellLabel(cell)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
