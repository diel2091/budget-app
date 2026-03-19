const currencyMap: Record<string, string> = {
  USD: "en-US",
  EUR: "es-ES",
  MXN: "es-MX",
  COP: "es-CO",
  ARS: "es-AR",
  GBP: "en-GB",
  JPY: "ja-JP",
  BRL: "pt-BR",
};

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const locale = currencyMap[currency] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    });
    return formatter.formatToParts(0).find((p) => p.type === "currency")?.value || "$";
  } catch {
    return "$";
  }
}
