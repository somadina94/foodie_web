import { Suspense } from "react";
import { CustomerCheckoutSuccess } from "@/components/organisms/customer-checkout-success";
import { CheckoutSuccessSkeleton } from "@/components/molecules/checkout-success-skeleton";

export default function CustomerCheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessSkeleton />}>
      <CustomerCheckoutSuccess />
    </Suspense>
  );
}
