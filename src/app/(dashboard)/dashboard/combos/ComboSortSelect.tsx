"use client";
import type { SortMethod } from "@/lib/combos/comboSort";

function getI18nOrFallback(
  t: (k: string, f: string) => string,
  key: string,
  fallback: string
): string {
  const out = t(key, fallback);
  return typeof out === "string" && out.length > 0 ? out : fallback;
}

const OPTIONS: { value: SortMethod; key: string; fallback: string }[] = [
  { value: "manual", key: "combo.sort.method.manual", fallback: "Manual" },
  { value: "provider", key: "combo.sort.method.provider", fallback: "Provider" },
  { value: "score", key: "combo.sort.method.score", fallback: "Score" },
  { value: "name", key: "combo.sort.method.name", fallback: "Name" },
];

export function ComboSortSelect({
  value,
  onChange,
  t,
}: {
  value: SortMethod;
  onChange: (m: SortMethod) => void;
  t: (k: string, f: string) => string;
}) {
  return (
    <label>
      {getI18nOrFallback(t, "combo.sort.label", "Sort by")}
      <select
        aria-label={getI18nOrFallback(t, "combo.sort.label", "Sort by")}
        value={value}
        onChange={(e) => onChange(e.target.value as SortMethod)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {getI18nOrFallback(t, o.key, o.fallback)}
          </option>
        ))}
      </select>
    </label>
  );
}
