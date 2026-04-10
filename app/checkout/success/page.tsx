import { redirect } from "next/navigation";

export default async function LegacyCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) qs.append(key, item);
    } else if (typeof value === "string") {
      qs.set(key, value);
    }
  }
  redirect(`/customer/checkout/success${qs.toString() ? `?${qs.toString()}` : ""}`);
}
