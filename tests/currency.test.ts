import { describe, it, expect } from "vitest";
import { formatPrice, CURRENCIES } from "../src/utils/currency";

describe("Currency formatting utilities", () => {
  it("converts and formats price correctly in USD", () => {
    const priceInUsd = 100;
    const formatted = formatPrice(priceInUsd, "USD");
    expect(formatted).toBe("$100.00");
  });

  it("converts and formats price correctly in EUR with appropriate conversion rate", () => {
    const priceInUsd = 100;
    const formatted = formatPrice(priceInUsd, "EUR");
    const expectedRate = CURRENCIES.EUR.rate;
    const expectedValue = (priceInUsd * expectedRate).toFixed(2);
    expect(formatted).toBe(`€${expectedValue}`);
  });

  it("converts and formats price correctly in GBP with appropriate conversion rate", () => {
    const priceInUsd = 100;
    const formatted = formatPrice(priceInUsd, "GBP");
    const expectedRate = CURRENCIES.GBP.rate;
    const expectedValue = (priceInUsd * expectedRate).toFixed(2);
    expect(formatted).toBe(`£${expectedValue}`);
  });

  it("handles zero values and edge cases gracefully", () => {
    expect(formatPrice(0, "USD")).toBe("$0.00");
    expect(formatPrice(0.005, "USD")).toBe("$0.01"); // Rounding test
    expect(formatPrice(99.999, "GBP")).toBe("£78.00"); // Rounding test (99.999 * 0.78 = 77.999 -> rounds to 78.00)
  });
});
