import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/molecules/legal-page-shell";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Foodie collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      description="How we handle personal information. Last updated April 2026."
    >
      <p>
        This policy describes how Foodie (“we”, “us”) collects, uses, and shares information when you
        use our website and services. By using Foodie, you agree to this policy alongside our{" "}
        <Link href={ROUTES.terms}>Terms & conditions</Link>.
      </p>
      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> name, email, phone, and delivery address details you
          provide.
        </li>
        <li>
          <strong>Order data:</strong> items ordered, amounts, payment status, and delivery-related
          information.
        </li>
        <li>
          <strong>Technical data:</strong> basic device and usage data needed to run the service
          securely (e.g. cookies for authentication where used).
        </li>
      </ul>
      <h2>2. How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>Create and manage your account and orders.</li>
        <li>Process payments and prevent fraud.</li>
        <li>Communicate about your order and service updates.</li>
        <li>Improve reliability and security of the platform.</li>
      </ul>
      <h2>3. Sharing</h2>
      <p>
        We share information with service providers as needed to operate the service (for example
        payment processing and hosting). We do not sell your personal information. We may disclose
        information if required by law or to protect rights and safety.
      </p>
      <h2>4. Retention</h2>
      <p>
        We retain information as long as needed to provide the service, meet legal obligations, and
        resolve disputes.
      </p>
      <h2>5. Security</h2>
      <p>
        We use appropriate technical and organizational measures to protect your information. No
        method of transmission over the internet is completely secure.
      </p>
      <h2>6. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, or delete certain
        personal data. Contact us through your account or order channels to make a request.
      </p>
      <h2>7. Children</h2>
      <p>
        Foodie is not directed at children under 13, and we do not knowingly collect their personal
        information.
      </p>
      <h2>8. Changes</h2>
      <p>
        We may update this policy from time to time. We will post the updated policy on this page
        with a new “last updated” date.
      </p>
    </LegalPageShell>
  );
}
