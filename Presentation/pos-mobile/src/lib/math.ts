export const roundTo = (value: number, decimals: number = 2): number => {
  if (isNaN(value) || value === null) return 0;

  const multiplier = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

export const formatPHP = (value: number): string => {
  const roundedValue = roundTo(value);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedValue);
};

export const calculatePercentage = (total: number, percent: number): number => {
  if (total <= 0 || percent <= 0) return 0;

  const result = (total * percent) / 100;
  return roundTo(result);
};

export const calculateChange = (
  cashReceived: number,
  grandTotal: number,
): number => {
  const change = cashReceived - grandTotal;
  return change > 0 ? roundTo(change) : 0;
};
