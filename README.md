# 🔧 Tools Hub – Online Utilities Platform

Tools Hub is a **Next.js (App Router)** based platform providing free, fast, and privacy-friendly online tools.  
It includes a wide range of utilities such as URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators.

---

## 🚀 Features

- URL Shortener with custom slugs & click analytics
- Text & String Tools (case converter, slugify, word counter, base64 encode/decode)
- PDF Tools (merge, split, compress, convert)
- Image Tools (convert, resize, remove EXIF)
- Developer Tools (JSON formatter, JWT decoder, regex tester)
- SEO Tools (robots.txt generator, OG builder, meta preview)
- Calculators (BMI, unit converter, date diff, percentage)

---

## ⚙️ Tech Stack

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org)
- **UI:** [ShadCN UI](https://ui.shadcn.com) + TailwindCSS
- **Database:** PostgreSQL with Prisma ORM (for shortener & analytics)
- **Auth (optional):** Clerk / NextAuth
- **Storage:** Cloudinary or AWS S3 (for media/PDF if needed)
- **Deployment:** Docker + Traefik (reverse proxy, SSL via Let’s Encrypt)

---

## 📂 Project Structure

```

project-root/
├── app/
│ ├── page.tsx # Homepage
│ ├── sitemap.ts # Dynamic sitemap
│ ├── robots.ts # Robots.txt
│ ├── tools/ # Tools Hub routes
│ │ ├── url/ # URL shortener
│ │ ├── text/ # Text tools
│ │ ├── pdf/ # PDF tools
│ │ ├── image/ # Image tools
│ │ ├── dev/ # Developer tools
│ │ ├── seo/ # SEO tools
│ │ └── calc/ # Calculators
├── components/ # UI & shared components
├── lib/ # DB, rate-limit, utilities
├── prisma/ # Prisma schema & migrations
├── public/ # Static assets
├── styles/ # Global styles
├── docs/PROJECT.md # Roadmap & full documentation
├── Dockerfile
├── docker/entrypoint.sh
└── README.md

```

---

## 🛠️ Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/tools-hub.git
cd tools-hub
npm install
```

### 2. Environment Setup

Create a `.env` file with:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/tools_hub"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
# Optional
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...
```

### 3. Prisma Migration

```bash
npx prisma migrate deploy
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🐳 Docker (Production)

Build & run with Docker:

```bash
docker build -t tools-hub .
docker run -d --name tools-hub -p 3000:3000 --env-file .env tools-hub
```

---

## 📊 Roadmap

- [x] Base Next.js setup with ShadCN theme
- [x] Core UI (Navbar, Footer, Ads slots, SEO layout)
- [x] URL shortener + analytics with Prisma
- [ ] 15–20 initial tools live (text, PDF, image, calc)
- [ ] Deploy with Docker + Traefik
- [ ] Google AdSense integration
- [ ] Add advanced tools (SEO/dev/media)
- [ ] Multi-language support (EN/BN)

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN UI](https://ui.shadcn.com)
- [Prisma ORM](https://www.prisma.io/docs)
- [Traefik Reverse Proxy](https://doc.traefik.io/traefik/)

---

## 📜 License

MIT License © 2025
