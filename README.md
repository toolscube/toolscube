# Tools Cube

> 70+ free online tools for developers and professionals

**🌐 Live:** [toolscube.app](https://toolscube.app)

Privacy-first online utilities built with Next.js 16, TypeScript, and modern web technologies. No signup required, all free, open source.

## Features

- **URL Tools** - Shortener, QR codes, UTM builder, link expander
- **Developer Tools** - JSON formatter, hash generator, regex tester, JWT decoder
- **Text Utilities** - Word counter, case converter, Base64 encoder, text cleaner
- **Calculators** - BMI, currency converter, unit converter, EMI calculator
- **SEO Tools** - Meta generator, schema markup, robots.txt, sitemap generator
- **Image Tools** - Format converter, resizer, compressor

## Quick Start

```bash
git clone https://github.com/toolscube/toolscube.git
cd toolscube
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret"
```

Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate

# Start dev server
npm run dev
```

Open [localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework** - Next.js 16 (App Router, Turbopack)
- **UI** - Shadcn/ui + Tailwind CSS v4
- **Database** - PostgreSQL + Prisma 7
- **Auth** - Better Auth
- **Deployment** - Docker + Vercel

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

MIT © [Tools Cube](https://toolscube.app)

---

⭐ Star this repo • 🐛 [Report Bug](https://github.com/toolscube/toolscube/issues) • 💙 [Sponsor](https://github.com/sponsors/toolscube)
