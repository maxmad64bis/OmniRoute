// @vitest-environment jsdom
// ComboHealthTab fetches /api/usage/combo-health-dashboard on mount; stub global.fetch and
// mount the real component.
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const translate = (key: string, params?: Record<string, unknown>) =>
  params && "value" in params ? String(params.value) : key;
vi.mock("next-intl", () => ({ useTranslations: () => translate }));

const ComboHealthTab = (
  await import("../../../src/app/(dashboard)/dashboard/analytics/ComboHealthTab")
).default;

const NULL_COMBO = {
  comboId: "c1",
  comboName: "null-quota",
  strategy: "auto",
  models: ["m1"],
  quotaHealth: {
    providers: [
      { provider: "openrouter", remainingPct: null, isExhausted: false, trend: "stable" },
    ],
    worstRemainingPct: null,
  },
  usageSkew: { modelDistribution: [], giniCoefficient: 0 },
  performance: { avgLatencyMs: 0, successRate: 0, totalRequests: 0 },
};
// ComboHealthTab reads a { health, errors } envelope; a bare { combos } payload would leave
// the list empty and never render n/a.
const NULL_PAYLOAD = {
  health: { timeRange: "24h", combos: [NULL_COMBO] },
  forecast: null,
  autopilot: null,
  scoring: null,
  errors: {},
};

function mount() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  return { el, root };
}

describe("combo health null quota", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown) => {
        expect(String(url)).toContain("/api/usage/combo-health-dashboard");
        return new Response(JSON.stringify(NULL_PAYLOAD), { status: 200 });
      })
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("renders n/a in the quota section, bar width 0%", async () => {
    const { el, root } = mount();
    await act(async () => {
      root.render(<ComboHealthTab />);
    });
    // Scoped to the quota section: the performance block legitimately renders "0.0%" via
    // formatPercent(successRate * 100), so a page-wide not.toContain("0%") would always fail.
    const quotaSection = el.querySelector("section") as HTMLElement | null;
    const quotaText = quotaSection?.textContent ?? "";
    expect(quotaText).toContain("n/a");
    const bar = quotaSection?.querySelector('[style*="width"]') as HTMLElement | null;
    expect(bar?.style.width).toBe("0%");
  });
});
