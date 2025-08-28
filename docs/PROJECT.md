# Tools Hub – Project Roadmap & Documentation

## 🏷️ Project Overview

- **Project Name:** Tools Hub (Utility / Productivity Tools Platform)
- **Goal:** Provide free, fast, privacy-friendly online tools (URL shortener, PDF tools, image converters, text utilities, calculators).
- **Monetization:** Google AdSense (banner, sticky, in-content ads) + premium subscriptions (optional, for shortener or advanced tools).

---

## ⚙️ Technology Stack

- **Frontend Framework:** Next.js (App Router, React 18)
- **UI Library:** ShadCN UI (Blue theme + Green accent)
- **Styling:** TailwindCSS
- **Icons:** Lucide Icons
- **Animations:** Framer Motion
- **Database:**
  - PostgreSQL (via Prisma ORM) → Shortener links, analytics, users
  - MongoDB (optional, for image gallery or flexible storage)
- **Auth:** Clerk (or NextAuth if needed)
- **Storage:** Cloudinary / AWS S3 (for images, PDF processing if server-side)
- **Caching:** Vercel ISR + Redis (Upstash) for rate limiting & caching
- **Deployment:** Docker + Traefik (reverse proxy, SSL with Let’s Encrypt)
- **Monitoring:** Healthcheck + logs (pino/winston)

---

## 📂 File Path & Project Structure

```

project-root/
├── app/
│ ├── layout.tsx
│ ├── page.tsx # Homepage
│ ├── sitemap.ts # Dynamic sitemap generator
│ ├── robots.ts # Robots.txt generator
│ ├── (marketing)/
│ │ ├── about/page.tsx
│ │ ├── privacy/page.tsx
│ │ └── terms/page.tsx
│ ├── tools/ # Tools hub main route
│ │ ├── layout.tsx
│ │ ├── page.tsx # Tools index + categories
│ │ ├── url/
│ │ │ ├── page.tsx # URL shortener
│ │ │ ├── interstitial/\[id]/page.tsx
│ │ │ └── analytics/\[id]/page.tsx
│ │ ├── text/
│ │ │ ├── base64/page.tsx
│ │ │ ├── case-converter/page.tsx
│ │ │ ├── slugify/page.tsx
│ │ │ └── word-counter/page.tsx
│ │ ├── pdf/
│ │ │ ├── merge/page.tsx
│ │ │ ├── split/page.tsx
│ │ │ ├── compress/page.tsx
│ │ │ └── pdf-to-word/page.tsx
│ │ ├── image/
│ │ │ ├── convert/page.tsx
│ │ │ ├── resize/page.tsx
│ │ │ └── exif-remove/page.tsx
│ │ ├── dev/
│ │ │ ├── json-formatter/page.tsx
│ │ │ ├── jwt-decode/page.tsx
│ │ │ └── regex-tester/page.tsx
│ │ ├── seo/
│ │ │ ├── og-builder/page.tsx
│ │ │ └── robots-generator/page.tsx
│ │ └── calc/
│ │ ├── bmi/page.tsx
│ │ ├── unit-converter/page.tsx
│ │ └── date-diff/page.tsx
│ └── api/ # API routes
│ ├── shorten/route.ts # Create short URL
│ ├── click/route.ts # Log clicks
│ └── utils/...
├── components/
│ ├── ui/...
│ ├── ads/AdSlot.tsx
│ ├── seo/JsonLd.tsx
│ ├── navigation/Navbar.tsx
│ └── footer/Footer.tsx
├── lib/
│ ├── db.ts # Prisma client
│ ├── ratelimit.ts # Redis rate limit
│ ├── analytics.ts
│ └── utils.ts
├── prisma/
│ ├── schema.prisma
│ └── migrations/
├── public/
│ ├── og-templates/...
│ └── favicon.ico
├── styles/
│ └── globals.css
├── docker/
│ └── entrypoint.sh
├── docs/
│ └── PROJECT.md # This documentation
├── package.json
├── tsconfig.json
├── next.config.js
└── Dockerfile

```

---

## 🛠️ Tools List (Phase 1 – MVP)

1. **URL Shortener** (custom slug, click analytics, interstitial ads)
2. **QR Code Generator**
3. **Password / Random String Generator**
4. **Base64 Encode/Decode**
5. **Word Counter**
6. **Case Converter (Upper/Lower/Title)**
7. **PDF Merge / Split**
8. **PDF Compress**
9. **PDF to Word**
10. **Image Converter (JPG/PNG/WebP)**
11. **Image Resize / Crop**
12. **JSON Formatter**
13. **JWT Decoder**
14. **Unit Converter (Length/Weight/Temp)**
15. **BMI Calculator**

---

## 🚀 Roadmap (Milestones)

**Phase 1 (MVP – 2–3 Weeks):**

- Next.js setup (App Router, ShadCN theme = Blue primary, Green accent)
- Core UI: Navbar, Footer, Ad slots, SEO layout
- Implement 10–15 basic tools (text, PDF, image, calculator)
- Shortener with analytics + Prisma/Postgres
- Sitemap/robots + metadata for each tool
- Deploy with Docker + Traefik (domain + SSL)
- Apply for Google AdSense

**Phase 2 (Scaling – 1–2 Months):**

- Add more developer/SEO tools (regex tester, OG builder, sitemap generator)
- Add image/media tools (EXIF remover, favicon generator, palette extractor)
- Add advanced calculators (date diff, VAT, currency)
- Improve interstitial ads + premium option for shortener
- Start blog (MDX) for SEO content

**Phase 3 (Growth – 3–6 Months):**

- Localization (EN primary, BN secondary)
- Analytics dashboard for users
- API access for shortener (premium tier)
- Build backlinks (listings, blog outreach, dev communities)
- Launch companion site (PixForge – media/creative tools)

---

## 🎨 Branding Guidelines

- **Theme:** ShadCN Blue (primary) + Green (accent)
- **Fonts:**
  - Headings: Space Grotesk
  - Body: Inter
  - Code: JetBrains Mono
- **Logo Idea:** Minimal "T" monogram + tool icons (grid/wrench shape)
- **Design Tokens:**
  - Border radius: `1rem` (rounded-2xl)
  - Shadow: soft-lg
  - BG: `#F8FAFC` (light) / `#0B1220` (dark)
  - Text: `#0F172A` (light) / `#E5E7EB` (dark)

---

## 📊 Database Schema (Prisma – Shortener & Analytics)

```prisma
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  links     Link[]
  createdAt DateTime @default(now())
}

model Link {
  id        String  @id @default(cuid())
  short     String  @unique
  targetUrl String
  userId    String?
  user      User?   @relation(fields: [userId], references: [id])
  clicks    Click[]
  createdAt DateTime @default(now())
}

model Click {
  id        String  @id @default(cuid())
  linkId    String
  link      Link    @relation(fields: [linkId], references: [id])
  ts        DateTime @default(now())
  referrer  String?
  country   String?
  uaHash    String?
  ipHash    String?
}
```

---

## 📌 Next Steps

1. Pick **Project Name & Domain** (`toolery.app` or `quickkit.tools`)
2. Setup Next.js repo + ShadCN theme config
3. Create `docs/PROJECT.md` (this file) to track roadmap
4. Start with **MVP tools** + SEO config
5. Deploy on VPS with Docker + Traefik
6. Apply for AdSense once 15–20 indexed pages are live
