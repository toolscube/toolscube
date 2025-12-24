# Tools Cube

> 70+ free online tools for developers and professionals

Essential online utilities built with Next.js 16, TypeScript, and modern web technologies. URL shortener, QR codes, JSON formatter, image converter, calculators, SEO tools, and more. Privacy-first, open source, MIT licensed.

**Live:** [toolscube.app](https://toolscube.app) • **Docs:** [/docs](./docs)

## Quick Start

```bash
git clone https://github.com/toolscube/toolscube.git
cd tools-cube
npm install

# Setup environment
cp .env.example .env
# Edit .env with DATABASE_URL and BETTER_AUTH_SECRET

# Setup database
npx prisma migrate dev
npx prisma generate

# Start dev server
npm run dev
```

Open [localhost:3000](http://localhost:3000)

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** Shadcn/ui + Tailwind CSS
- **Database:** PostgreSQL + Prisma 7
- **Auth:** Better Auth
- **Deployment:** Docker

## Features

- URL shortener, QR codes, UTM builder
- Text utilities, case converter, word counter
- Developer tools, JSON/JWT, regex tester
- Calculators, unit converter, BMI
- SEO tools, meta generator, schema builder
- Image tools, resize, compress, convert

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## License

MIT © [toolscube](https://github.com/toolscube)

---

⭐ Star this repo • 💙 [Sponsor](https://github.com/sponsors/toolscube)
