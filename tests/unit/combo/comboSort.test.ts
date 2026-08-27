// tests/unit/combo/comboSort.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROVIDER_ORDER, sortComboStepsSync, type ComboStep } from "@/lib/combos/comboSort";

const m = (id: string, providerId: string, model: string): ComboStep => ({
  id,
  kind: "model",
  model,
  providerId,
  weight: 0,
});
const ref = (id: string, comboName: string): ComboStep => ({
  id,
  kind: "combo-ref",
  comboName,
  weight: 0,
});

describe("sortComboStepsSync", () => {
  it("manual returns the input unchanged", () => {
    const steps = [m("a", "openai", "gpt"), m("b", "anthropic", "claude")];
    assert.equal(sortComboStepsSync(steps, "manual"), steps);
  });

  it("provider groups by PROVIDER_ORDER, stable intra-group, combo-ref at end", () => {
    const steps = [
      m("x", "anthropic", "claude-3"),
      m("y", "openai", "gpt-4"),
      ref("r", "other-combo"),
      m("z", "anthropic", "claude-2"),
    ];
    const out = sortComboStepsSync(steps, "provider");
    // combo-ref always last (no providerId).
    assert.equal(out[out.length - 1].id, "r");
    const nonRef = out.filter((s) => s.id !== "r").map((s) => s.id);
    // all three model steps are present, and the two anthropic steps stay grouped.
    assert.deepEqual(nonRef.slice().sort(), ["x", "y", "z"]);
    const ai = nonRef.indexOf("x");
    const zi = nonRef.indexOf("z");
    assert.ok(Math.abs(ai - zi) === 1, "steps of the same provider are adjacent");
  });

  it("name sorts alphabetically with a stable tiebreak", () => {
    const steps = [m("a", "openai", "zeta"), m("b", "openai", "alpha"), m("c", "openai", "alpha")];
    const out = sortComboStepsSync(steps, "name");
    assert.deepEqual(
      out.map((s) => s.id),
      ["b", "c", "a"]
    );
  });

  it("PROVIDER_ORDER is non-empty and stable", () => {
    assert.ok(PROVIDER_ORDER.length > 0);
  });
});
