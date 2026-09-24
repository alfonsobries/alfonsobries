const HOUSEHOLD_CURRENCY = 'MXN';

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string, compact: boolean): Intl.NumberFormat {
  const key = `${currency}:${compact}`;
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      currencyDisplay: currency === HOUSEHOLD_CURRENCY ? 'narrowSymbol' : 'code',
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: compact ? 0 : 2,
    });
    formatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Money the way the household reads it: "$1,234.50" for pesos, with the code
 * for anything else ("USD 20.00"). `compact` drops the cents for totals.
 */
export function formatMoney(
  amount: number,
  currency: string = HOUSEHOLD_CURRENCY,
  { compact = false }: { compact?: boolean } = {},
): string {
  return formatterFor(currency, compact && Number.isInteger(Math.round(amount))).format(
    compact ? Math.round(amount) : amount,
  );
}
