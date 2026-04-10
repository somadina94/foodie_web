export function deliveryFeeEstimate(): number {
  const n = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
