import type { Metadata } from "next";
import { LegalPageShell } from "@/components/molecules/legal-page-shell";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn about Foodie — our kitchen, mission, and how we deliver.",
};

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About us"
      description="Who we are and how we serve your neighborhood."
    >
      <p>
        Foodie is a single-kitchen food delivery experience built for people who want great meals
        without the noise of endless apps. We prepare curated dishes with care, pack them for the
        road, and partner with riders to get them to your door.
      </p>
      <h2>Our mission</h2>
      <p>
        We believe ordering food should feel simple: honest pricing, clear photos, secure payment,
        and reliable tracking from checkout to delivery.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Browse our menu and add meals to your cart.</li>
        <li>Pay with card (Stripe) or choose cash on delivery where available.</li>
        <li>Track your order status as the kitchen and rider work together.</li>
      </ul>
      <h2>Contact</h2>
      <p>
        Questions about your order or account? Use the contact options in your account area or reach
        out through your order confirmation details.
      </p>
    </LegalPageShell>
  );
}
