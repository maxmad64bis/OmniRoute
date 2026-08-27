// src/lib/combos/comboSort.ts
import { OAUTH_PROVIDERS, NOAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/providers";
import type { ComboStep } from "@/lib/combos/steps";

export type { ComboStep };

export type SortMethod = "manual" | "provider" | "score" | "name";

/** Canonical provider precedence, keyed by provider id (mirrors catalogOrder.ts). */
export const PROVIDER_ORDER: readonly string[] = [
  ...Object.keys(OAUTH_PROVIDERS),
  ...Object.keys(NOAUTH_PROVIDERS),
  ...Object.keys(APIKEY_PROVIDERS),
];

const REFERENCE_SENTINEL = " combo-ref"; // sorts after any real provider id

function providerKey(step: ComboStep): string {
  if (step.kind === "model" || step.kind === "provider-wildcard") {
    return step.providerId ?? REFERENCE_SENTINEL;
  }
  return REFERENCE_SENTINEL; // combo-ref: no providerId
}

function nameKey(step: ComboStep): string {
  if (step.kind === "model") return step.model;
  if (step.kind === "provider-wildcard") return `${step.providerId}/${step.modelPattern}`;
  return step.comboName; // combo-ref
}

/** Stable index for provider ordering; unknown providers go after the known list. */
function providerRank(providerId: string): number {
  const idx = PROVIDER_ORDER.indexOf(providerId);
  return idx === -1 ? PROVIDER_ORDER.length : idx;
}

/** Synchronous sorts: manual (noop), provider, name. Stable. */
export function sortComboStepsSync(
  steps: ComboStep[],
  method: "manual" | "provider" | "name"
): ComboStep[] {
  if (method === "manual") return steps;
  const indexed = steps.map((step, i) => ({ step, i }));
  indexed.sort((a, b) => {
    if (method === "provider") {
      const ra = providerRank(providerKey(a.step));
      const rb = providerRank(providerKey(b.step));
      if (ra !== rb) return ra - rb;
    } else {
      const na = nameKey(a.step);
      const nb = nameKey(b.step);
      if (na !== nb) return na < nb ? -1 : 1;
    }
    return a.i - b.i; // stable tiebreak preserves original order
  });
  return indexed.map((x) => x.step);
}
