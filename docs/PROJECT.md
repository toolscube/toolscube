# Project Documentation

## Overview

Tools Cube is a free, open source platform providing 70+ online utilities.

**Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL, Shadcn/ui, Tailwind CSS

## Architecture

```
app/
├── (auth)/           # Auth pages
├── (marketing)/      # About, Privacy, Terms, Sponsor
├── tools/            # Tool categories
│   ├── url/         # URL shortener, QR codes
│   ├── text/        # Text utilities
│   ├── dev/         # Developer tools
│   ├── image/       # Image tools
│   ├── calc/        # Calculators
│   └── seo/         # SEO tools
├── api/             # API routes
└── dashboard/       # User dashboard

components/
├── tools/           # Tool-specific components
├── ui/              # Shadcn components
└── shared/          # Reusable components

lib/
├── auth.ts          # NextAuth config
├── prisma.ts        # Database client
├── env.ts           # Environment variables
└── utils.ts         # Helper functions
```

## Database Schema

See `prisma/schema.prisma` for full schema.

**Key Models:**
- User (auth, links, analytics)
- Link (URL shortener)
- Tool (tool metadata)
- Analytics (usage tracking)

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linter
npx prisma studio    # Database GUI
```

## Environment Variables

See `.env.example` for required variables:

- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Auth secret
- `NEXTAUTH_URL` - App URL
- `GOOGLE_CLIENT_ID/SECRET` - OAuth credentials

## Deployment

Dockerized with `docker-compose.yaml`:

```bash
docker compose up -d
```

## Adding a New Tool

1. Create `app/tools/[category]/[tool]/page.tsx`
2. Add tool component in `components/tools/[category]/`
3. Add metadata in `data/tools.ts`
4. Update sitemap

## Performance

- Static generation where possible
- Image optimization with Next.js Image
- Code splitting by route
- Lazy loading for heavy components

## SEO

- Dynamic metadata per tool
- JSON-LD structured data
- Sitemap generation
- Robots.txt configuration

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)
