/** Western Arabic digits — clearer on mobile at small sizes */
const numberFormatter = new Intl.NumberFormat("ar-IQ-u-nu-latn", {
  maximumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPrice(price: number): string {
  return `${formatNumber(price)} د.ع`;
}
