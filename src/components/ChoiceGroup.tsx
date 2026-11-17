export function ChoiceGroup<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: T | null;
  options: readonly { id: T; label: string; hint?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-warm">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <label
              key={option.id}
              className={[
                "block cursor-pointer rounded-2xl bg-white px-3 py-3 shadow-[0_8px_24px_rgba(37,37,37,0.05)] focus-within:ring-2 focus-within:ring-[#C9855A]",
                selected ? "border-2 border-[#C9855A]" : "border border-[#EAEAE6]",
              ].join(" ")}
            >
              <input
                className="sr-only"
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
              />
              <span className="block text-base text-ink">{option.label}</span>
              {option.hint ? <span className="mt-1 block text-sm leading-6 text-ink/80">{option.hint}</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
