import type { ChangeEvent } from "react";

export function TextField({
  id,
  label,
  name,
  value,
  placeholder,
  disabled = false,
  onChange,
}: {
  id: string;
  label: string;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
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
        onChange={handleChange}
        className="h-12 w-full rounded-input border border-oat bg-cream px-3 text-base text-ink outline-none placeholder:text-muted focus-visible:border-warm"
      />
    </label>
  );
}
