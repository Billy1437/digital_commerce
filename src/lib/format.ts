export function formatPrice(amount: number, currency = "MMK") {
  const formatted = new Intl.NumberFormat("en-US").format(amount);
  return currency === "MMK" ? `${formatted} Ks` : `${formatted} ${currency}`;
}
