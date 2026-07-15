import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <BackgroundGlow />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-accent" />
          <span className="text-[15px] font-semibold tracking-tight">Hours</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
          <div className="mx-auto mb-6 inline-flex animate-fade-in">
            <Badge tone="accent">
              <Sparkles className="h-3 w-3" />
              80% cheaper than Calendly &amp; TidyCal-class tools
            </Badge>
          </div>
          <h1
            className="mx-auto max-w-3xl animate-fade-in text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Get booked and paid,
            <br />
            without the busywork.
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl animate-fade-in text-lg text-foreground-muted"
            style={{ animationDelay: "120ms" }}
          >
            One beautiful link for every meeting, package, and payment you offer.
            No juggling five tools. No dated booking pages. Just Hours.
          </p>
          <div
            className="mt-9 flex animate-fade-in items-center justify-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <Link href="/signup">
              <Button size="lg">
                Claim your link <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="secondary">See a live page</Button>
            </Link>
          </div>
          <p className="mt-4 animate-fade-in text-[13px] text-foreground-subtle" style={{ animationDelay: "220ms" }}>
            Lifetime access · No subscription · 2 minute setup
          </p>
        </section>

        <section id="demo" className="mx-auto max-w-4xl px-6 pb-28">
          <BookingCardPreview />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="grid gap-5 sm:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Every kind of booking"
              description="1:1, group, and recurring events with custom availability, buffers, and limits — no plugins required."
            />
            <FeatureCard
              icon={<CreditCard className="h-5 w-5" />}
              title="Get paid on booking"
              description="Sell packages and subscriptions, run coupon codes, and collect payment via Stripe the moment someone books."
            />
            <FeatureCard
              icon={<Star className="h-5 w-5" />}
              title="Reviews that sell for you"
              description="Every completed booking can collect a review automatically, displayed right on your page for the next visitor."
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-28 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">One price. Yours forever.</h2>
          <p className="mt-3 text-foreground-muted">
            No monthly fees eating into your margin. Pay once, own it for life.
          </p>
          <div className="mx-auto mt-10 max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-[var(--shadow-md)]">
            <div className="text-sm font-medium text-foreground-muted">Lifetime access</div>
            <div className="mt-2 flex items-end justify-center gap-2">
              <span className="text-5xl font-semibold tracking-tight">$39</span>
              <span className="mb-1.5 text-foreground-subtle line-through">$144</span>
            </div>
            <Link href="/signup" className="mt-6 block">
              <Button size="lg" className="w-full">Get lifetime access</Button>
            </Link>
            <p className="mt-4 text-[13px] text-foreground-subtle">60-day money-back guarantee</p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[13px] text-foreground-subtle">
          <span>© {new Date().getFullYear()} Hours</span>
          <span>Built for people who hate scheduling tools</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 transition-shadow hover:shadow-[var(--shadow-sm)]">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">{description}</p>
    </div>
  );
}

function BookingCardPreview() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-2 shadow-[var(--shadow-lg)]">
      <div className="rounded-[calc(var(--radius-xl)-8px)] border border-border bg-background-subtle p-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-accent" />
          <div>
            <div className="font-semibold">Maya Chen</div>
            <div className="text-sm text-foreground-muted">hours.co/maya</div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { title: "Strategy Session", time: "30 min · Free" },
            { title: "1:1 Coaching", time: "60 min · $150" },
            { title: "Group Workshop", time: "90 min · $40/seat" },
            { title: "Quarterly Retainer", time: "4 sessions · $500" },
          ].map((item) => (
            <div
              key={item.title}
              className="group cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-all hover:border-accent hover:shadow-[var(--shadow-glow)]"
            >
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-[13px] text-foreground-muted">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] overflow-hidden">
      <div
        className="absolute left-1/2 top-[-220px] h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
