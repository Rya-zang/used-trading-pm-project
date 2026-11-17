import type { ChangeEvent } from "react";

export function TextField({
  id,
  label,
  name,
  value,
  placeholder,
  disabled = false,
  invalid = false,
  type = "text",
  inputMode,
  maxLength,
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  type?: "text" | "number";
  inputMode?: "text" | "numeric";
  maxLength?: number;
  autoComplete?: string;
  onChange?: (value: string) => void;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event.target.value);
  }

  return (
    <label htmlFor={id} className="block text-sm text-ink">
      <span className="mb-2 block text-warm">{label}</span>
      <input
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
        className={[
          "h-12 w-full rounded-input border bg-white px-3 text-base text-ink outline-none placeholder:text-muted focus-visible:border-sage",
          invalid ? "border-error" : "border-oat",
        ].join(" ")}
      />
    </label>
  );
}
