# Maison — Fashion Catalog CMS

A premium editorial-style fashion catalog with a public website and an admin panel for managing products, categories, gallery images, hero banners, and site settings.

**Live:** [simple-phi-eight.vercel.app](https://simple-phi-eight.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, shadcn/ui, Tailwind CSS v4 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 7 |
| Auth | Better Auth (email/password, role-based) |
| Storage | Cloudinary (images) |
| Validation | Zod |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js v20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A [Cloudinary](https://cloudinary.com) account

### Install

```bash
git clone <repo-url> && cd magazine-open
npm install
cp .env.example .env    # then fill in your credentials
npx prisma migrate dev
npx tsx scripts/seed.ts admin@maison.com admin123 Admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
DATABASE_URL="postgresql://..."          # Neon / PostgreSQL
BETTER_AUTH_SECRET="<random-hex>"        # Session signing key
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

---

## Features

### Public

- Homepage with hero banner, featured products, about section, and gallery
- Product catalog with categories, detail pages, and search
- Editorial gallery grid
- Contact form with spam protection

### Admin (`/admin`)

- Dashboard with stats and recent products
- Product management (CRUD, image uploads, categories)
- Category management (CRUD, slug routing)
- Hero banner management (CRUD, reorder)
- About section management
- Gallery management (CRUD, reorder)
- Media Manager — browse, upload, and delete Cloudinary assets by folder
- Site settings (key-value store)
- Contact message inbox

**Admin access:** Sign in at `/admin/login`. Users require the `ADMIN` role.

---

## Project Structure

```
magazine-open/
├── proxy.ts                         # Admin auth proxy (Node.js runtime)
├── prisma/
│   └── schema.prisma                # Database schema
├── scripts/
│   └── seed.ts                      # Admin seed script
├── src/
│   ├── app/
│   │   ├── (public)/                # Public pages
│   │   ├── admin/(protected)/       # Admin pages
│   │   └── api/
│   │       ├── auth/[...all]/       # Better Auth handler
│   │       ├── upload/              # Cloudinary upload + delete
│   │       └── media/               # Media library listing
│   ├── components/
│   │   ├── admin/                   # Admin UI components
│   │   ├── public/                  # Public header/footer
│   │   ├── shared/                  # Loading, error, empty states
│   │   └── ui/                      # shadcn primitives
│   └── lib/
│       ├── auth.ts                  # Server auth config
│       ├── cloudinary.ts            # Upload, delete, list helpers
│       ├── actions/                 # Server actions (7 modules)
│       ├── queries/                 # Database queries
│       └── validations/             # Zod schemas
```

---

## Database

12 models backed by PostgreSQL via Prisma 7 + Neon adapter:

`User` · `Session` · `Account` · `VerificationToken` · `Category` · `Product` · `ProductImage` · `HeroBanner` · `AboutSection` · `GalleryImage` · `ContactMessage` · `Setting`

---

## Deployment

Built for [Vercel](https://vercel.com):

```bash
npm run build
```

Or connect the repository to Vercel for automatic deploys on push. Ensure all environment variables are set in the Vercel project dashboard.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Run migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma generate` | Regenerate Prisma client |
| `npx tsx scripts/seed.ts <email> <password> <name>` | Create admin user |

---

## License

Private — all rights reserved.
