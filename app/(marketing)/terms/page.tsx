import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/molecules/legal-page-shell";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "Terms of use for the Foodie food delivery service.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms & conditions"
      description="Please read these terms before using Foodie. Last updated April 2026."
    >
      <p>
        By accessing or using Foodie’s website and services, you agree to these terms. If you do not
        agree, please do not use the service.
      </p>
      <h2>1. Service</h2>
      <p>
        Foodie provides an online menu, ordering, payment processing (where applicable), and
        coordination with the kitchen and delivery. Availability of items, delivery areas, and
        payment methods may change.
      </p>
      <h2>2. Accounts</h2>
      <p>
        You are responsible for your account credentials and for activity under your account. Notify
        us promptly if you suspect unauthorized access.
      </p>
      <h2>3. Orders & payments</h2>
      <p>
        Prices and fees (including delivery) are shown at checkout. Card payments are processed by
        our payment provider; cash-on-delivery terms apply when you select that option. Orders are
        subject to acceptance by the kitchen and availability.
      </p>
      <h2>4. Cancellations & refunds</h2>
      <p>
        Cancellation and refund rules depend on order status and local policy. Contact support
        through your order details for help with a specific order.
      </p>
      <h2>5. Acceptable use</h2>
      <p>
        You agree not to misuse the service, interfere with other users, or attempt unauthorized
        access to systems or data.
      </p>
      <h2>6. Limitation of liability</h2>
      <p>
        To the extent permitted by law, Foodie is not liable for indirect or consequential damages
        arising from use of the service. Nothing in these terms excludes liability that cannot be
        excluded by law.
      </p>
      <h2>7. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use after changes constitutes
        acceptance of the updated terms.
      </p>
      <p>
        See also our{" "}
        <Link href={ROUTES.privacy}>Privacy policy</Link> for how we handle personal data.
      </p>
    </LegalPageShell>
  );
}
