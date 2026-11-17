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
                "block cursor-pointer rounded-card border-2 px-3 py-3 focus-within:ring-2 focus-within:ring-sage",
                selected ? "border-sage bg-white" : "border-[#eaeae6] bg-white",
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
