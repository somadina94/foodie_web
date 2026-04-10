import { MarketingHero } from "@/components/organisms/marketing-hero";
import { MarketingMealsSection } from "@/components/organisms/marketing-meals-section";

export default function HomePage() {
  return (
    <>
      <MarketingHero />

      <MarketingMealsSection />

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-heading text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How Foodie works
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Pick your favorites",
              body: "Explore the menu with photos and clear pricing.",
            },
            {
              step: "02",
              title: "Pay & confirm",
              body: "Checkout with Stripe or pay on delivery — your choice.",
            },
            {
              step: "03",
              title: "Track & enjoy",
              body: "Follow your order from kitchen to doorstep.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-4xl font-black text-primary/30">{item.step}</span>
              <h3 className="mt-4 font-heading text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
