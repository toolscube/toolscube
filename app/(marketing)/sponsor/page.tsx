import {
  ArrowRight,
  BadgeDollarSign,
  Crown,
  Gem,
  HeartHandshake,
  Mail,
  Rocket,
  Shield,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import InputField from "@/components/shared/form-fields/input-field";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Data
const tiers = [
  {
    name: "Bronze",
    price: "$49/mo",
    icon: Star,
    highlight: false,
    perks: ["Logo on sponsor page", "Thank-you tweet", "Newsletter mention (quarterly)"],
  },
  {
    name: "Silver",
    price: "$149/mo",
    icon: Gem,
    highlight: false,
    perks: [
      "Everything in Bronze",
      "Logo on homepage carousel",
      "Social shoutouts (monthly)",
      "Priority support for requests",
    ],
  },
  {
    name: "Gold",
    price: "$399/mo",
    icon: Crown,
    highlight: true,
    perks: [
      "Everything in Silver",
      "Dedicated feature spotlight",
      "Blog post mention",
      "Custom discount code",
    ],
  },
  {
    name: "Platinum",
    price: "$999/mo",
    icon: Rocket,
    highlight: false,
    perks: [
      "Everything in Gold",
      "Co-branded tutorial/tool",
      "Quarterly planning call",
      "Logo in app footer (opt-in)",
    ],
  },
] as const;

const benefits = [
  {
    title: "2M+ yearly pageviews",
    icon: Users,
    desc: "Across utilities like PDF, Image, and Dev tools.",
  },
  {
    title: "Search-first audience",
    icon: BadgeDollarSign,
    desc: "High-intent users from SEO & direct traffic.",
  },
  { title: "Brand-safe content", icon: Shield, desc: "Utilities only—no controversial topics." },
  {
    title: "Real usage visibility",
    icon: HeartHandshake,
    desc: "Opt-in anonymized analytics showcases.",
  },
];

const faqs = [
  {
    q: "How are logos displayed?",
    a: "Your logo appears here and (for higher tiers) in a rotating carousel on the homepage & tool pages.",
  },
  {
    q: "Can I sponsor a specific tool?",
    a: "Yes—mention the tool in your message for targeted placement.",
  },
  {
    q: "Do you accept annual billing?",
    a: "Absolutely. Annual plans include a discount and an invoice.",
  },
  {
    q: "What creative assets do you need?",
    a: "A horizontal SVG/PNG logo, a one-liner, and an optional UTM link.",
  },
];

const logos = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1 }));

export default function SponsorPage() {
  return (
    <div className="relative">
      {/* Soft gradient bg */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Gem className="h-3.5 w-3.5" /> Sponsor Tools Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Power useful tools for millions
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-sm text-muted-foreground sm:text-base">
            Help us keep Tools Hub free and blazing-fast while putting your brand in front of
            high-intent makers and professionals. Flexible tiers. Brand-safe placement.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="tel:+8801785875454" className="w-full sm:w-auto">
              <Button variant="ghost" value="+8801785875454" size="lg" className="gap-2">
                <Image src="/assets/bkash.png" alt="Sponsor Tools Hub" width={32} height={32} />
                +8801785875454
              </Button>
            </Link>
            <Button size="lg" className="gap-2" asChild>
              <Link href={"/tools"}>
                Explore Tools <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border bg-background/50 p-5 shadow-sm backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <b.icon className="h-5 w-5" />
                <div>
                  <p className="font-medium leading-tight">{b.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto mt-10 w-full max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Sponsorship tiers</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 h-full">
          {tiers.map((t) => {
            const Icon = t.icon;
            return (
              <Card
                key={t.name}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-background/60 shadow-sm backdrop-blur transition",
                  t.highlight && "ring-2 ring-primary/30",
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", t.highlight && "text-primary")} />
                    <CardTitle>{t.name}</CardTitle>
                  </div>
                  <CardDescription>
                    Great for {t.name === "Bronze" ? "getting started" : t.name.toLowerCase()}{" "}
                    visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 text-2xl font-semibold">{t.price}</div>
                  <ul className="space-y-2 text-sm">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <Star className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-5 w-full">Choose {t.name}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Logo Wall */}
      <section className="mx-auto mt-12 w-full max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Brands that believe in us
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {logos.map((l) => (
            <div
              key={l.id}
              className="group rounded-2xl border bg-background/50 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex h-16 items-center justify-center opacity-80 transition group-hover:opacity-100">
                <PlaceholderLogo />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits matrix */}
      <section className="mx-auto mt-12 w-full max-w-7xl px-4">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">What sponsors get</h2>
        <div className="overflow-hidden rounded-2xl border bg-background/50 shadow-sm backdrop-blur">
          <div className="grid grid-cols-2 gap-0 border-b p-3 text-sm sm:grid-cols-4">
            <div className="font-medium">Placement</div>
            <div className="text-muted-foreground">Sponsor page + homepage</div>
            <div className="font-medium">Content</div>
            <div className="text-muted-foreground">Blogs, tutorials, tool spotlights</div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-0 p-3 text-sm sm:grid-cols-4">
            <div className="font-medium">Attribution</div>
            <div className="text-muted-foreground">Logo, link, copy, UTM tracking</div>
            <div className="font-medium">Support</div>
            <div className="text-muted-foreground">Priority requests & feedback</div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto mt-12 w-full max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Ready to reach a high-intent audience?</h3>
              <p className="text-sm text-muted-foreground">
                We’ll craft a placement that feels native, useful, and brand-safe.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="tel:+8801785875454" className="w-full sm:w-auto">
                <Button variant="ghost" value="+8801785875454" size="lg" className="gap-2">
                  <Image src="/assets/bkash.png" alt="Sponsor Tools Hub" width={32} height={32} />
                  +8801785875454
                </Button>
              </Link>
              <Button variant="outline" asChild>
                <Link href="#contact" className="gap-2 inline-flex items-center">
                  <Mail className="h-4 w-4" /> Contact us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-12 w-full max-w-7xl px-4">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">FAQ</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              <p className="font-medium">{f.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="mx-auto mt-12 w-full max-w-3xl px-4">
        <div className="rounded-3xl border bg-background/60 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Tell us about your goals</h3>
          </div>
          <form className="grid gap-4 sm:grid-cols-2">
            <InputField placeholder="Company" className="sm:col-span-1" />
            <InputField type="email" placeholder="Work email" className="sm:col-span-1" />
            <InputField placeholder="Website (https://)" className="sm:col-span-2" />
            <TextareaField
              placeholder="What would you like to achieve?"
              className="min-h-28 sm:col-span-2"
            />
            <div className="sm:col-span-2 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">We respond within 2 business days.</p>
              <Button className="gap-2">
                Send inquiry <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      <div className="h-10" />
    </div>
  );
}

function PlaceholderLogo() {
  return (
    <svg viewBox="0 0 120 32" className="h-6 w-auto opacity-70">
      <title>Placeholder Logo</title>
      <rect x="0" y="8" width="28" height="16" rx="3" className="fill-muted" />
      <rect x="36" y="8" width="82" height="16" rx="3" className="fill-muted" />
    </svg>
  );
}
