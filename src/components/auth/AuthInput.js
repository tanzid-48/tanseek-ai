export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  name,
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="rounded-md bg-background border border-border px-3.5 py-2.5 text-text placeholder:text-muted/60 outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
