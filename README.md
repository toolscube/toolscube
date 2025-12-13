# Tools Cube

> Free and open source online tools platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

70+ essential online utilities for developers and professionals. Built with Next.js 15, privacy-focused, and MIT licensed.

**Live:** [toolscube.app](https://toolscube.app) • **Docs:** [/docs](./docs)

## Quick Start

```bash
git clone https://github.com/toolscube/tools-cube.git
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

**Detailed setup:** See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)

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
