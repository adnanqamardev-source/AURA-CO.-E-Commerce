export type CurrencyCode = "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // rate relative to USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", rate: 1.0 },
  EUR: { code: "EUR", symbol: "€", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", rate: 0.78 },
};

/**
 * Converts a base price in USD to the target currency and formats it with the correct symbol.
 */
export function formatPrice(priceInUsd: number, currencyCode: CurrencyCode): string {
  const config = CURRENCIES[currencyCode];
  const converted = priceInUsd * config.rate;
  return `${config.symbol}${converted.toFixed(2)}`;
}
