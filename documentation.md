# Maison — Fashion Catalog CMS

**Maison** is a premium editorial-style fashion catalog with a public-facing website and a role-protected admin panel (ADMIN role required). Admins can manage products, categories, hero banners, about sections, a photo gallery, site settings, media uploads, and contact form messages.

Built with Next.js 16, Prisma 7 (Neon PostgreSQL), Better Auth, and shadcn/ui.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Routes](#routes)
  - [Public Routes](#public-routes)
  - [Admin Routes](#admin-routes)
- [API Endpoints](#api-endpoints)
- [Server Actions](#server-actions)
- [Validation Schemas](#validation-schemas)
- [Components](#components)
- [Cloudinary Image Upload](#cloudinary-image-upload)
- [Security](#security)
- [Prisma & Database](#prisma--database)
- [Design & UI](#design--ui)
- [Scripts](#scripts)

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.12 | React framework |
| `react` / `react-dom` | 19.2.4 | UI library |
| `@prisma/client` | ^7.9.1 | ORM database client |
| `@prisma/adapter-neon` | ^7.9.1 | Neon serverless driver adapter |
| `@neondatabase/serverless` | ^1.1.0 | Neon database driver |
| `better-auth` | ^1.6.25 | Authentication |
| `cloudinary` | ^2.10.0 | Image upload/CDN |
| `zod` | ^4.4.3 | Validation |
| `class-variance-authority` | ^0.7.1 | UI variants (shadcn) |
| `tailwind-merge` | ^3.6.0 | Tailwind class merging |
| `tw-animate-css` | ^1.4.0 | Tailwind animations |
| `lucide-react` | ^1.27.0 | Icons |
| `sonner` | ^2.0.7 | Toast notifications |
| `next-themes` | ^0.4.6 | Theme management |
| `@base-ui/react` | ^1.6.0 | Accessible UI primitives |
| `tailwindcss` | ^4 | CSS framework |
| `typescript` | ^5 | TypeScript |

---

## Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL database (Neon serverless recommended)
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd magazine-open

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, auth secret, and Cloudinary credentials

# Initialize the database
npx prisma migrate dev

# Seed the admin user
npx tsx scripts/seed.ts admin@maison.com admin123 Admin

# Start the development server
npm run dev
```

### Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start development server (port 3000) |
| `build` | `npm run build` | Production build |
| `start` | `npm run start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| Seed | `npx tsx scripts/seed.ts <email> <password> <name>` | Create admin user |
| Prisma | `npx prisma` | Prisma CLI commands |

---

## Environment Variables

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="<random-hex-string>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="<your-cloud-name>"
CLOUDINARY_API_KEY="<your-api-key>"
CLOUDINARY_API_SECRET="<your-api-secret>"
```

**Required**: All variables must be set for the application to function.

---

## Project Structure

```
magazine-open/
├── proxy.ts                     # Admin auth proxy (Next.js 16, Node.js runtime)
├── prisma/
│   └── schema.prisma          # Database schema (12 models, 1 enum)
├── scripts/
│   └── seed.ts                # Admin user seed script
├── src/
│   ├── app/
│   │   ├── globals.css        # Global styles (Tailwind v4 + shadcn)
│   │   ├── layout.tsx         # Root layout (Geist fonts)
│   │   ├── not-found.tsx      # Custom 404 page
│   │   ├── (public)/          # Public route group
│   │   │   ├── layout.tsx     # Public layout (Header + Footer)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Product listing
│   │   │   │   └── [slug]/page.tsx  # Product detail
│   │   │   └── search/
│   │   │       ├── page.tsx          # Server component
│   │   │       └── search-client.tsx # Client-side search
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin root layout (pass-through)
│   │   │   ├── login/page.tsx    # Login page
│   │   │   └── (protected)/      # Authenticated route group
│   │   │       ├── layout.tsx    # Admin sidebar + header layout
│   │   │       ├── page.tsx      # Dashboard
│   │   │       ├── _components/
│   │   │       │   └── product-form.tsx
│   │   │       ├── products/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       ├── categories/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/
│   │   │       │       ├── page.tsx
│   │   │       │       └── category-edit-form.tsx
│   │   │       ├── hero/
│   │   │       │   ├── page.tsx
│   │   │       │   └── hero-form.tsx
│   │   │       ├── about/
│   │   │       │   ├── page.tsx
│   │   │       │   └── about-form.tsx
│   │   │       ├── gallery/
│   │   │       │   ├── page.tsx
│   │   │       │   └── gallery-grid.tsx
│   │   │       ├── settings/
│   │   │       │   ├── page.tsx
│   │   │       │   └── settings-form.tsx
│   │   │       ├── media/page.tsx
│   │   │       └── profile/page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts  # Better Auth handler
│   │       ├── upload/route.ts         # Cloudinary upload
│   │       └── revalidate/route.ts     # Cache revalidation
│   ├── components/
│   │   ├── admin/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-mobile.tsx
│   │   │   └── image-uploader.tsx
│   │   ├── public/
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   ├── shared/
│   │   │   ├── loading-skeleton.tsx
│   │   │   ├── error-state.tsx
│   │   │   └── empty-state.tsx
│   │   └── ui/                  # shadcn primitives (18 components)
│   ├── lib/
│   │   ├── auth.ts              # Better Auth server config
│   │   ├── auth-client.ts       # Better Auth client config
│   │   ├── db.ts                # Prisma client (Neon adapter)
│   │   ├── cloudinary.ts        # Cloudinary helpers
│   │   ├── utils.ts             # cn() classname utility
│   │   ├── actions/             # Server Actions (7 files)
│   │   ├── queries/             # Query helpers (6 files)
│   │   ├── rate-limit.ts        # In-memory rate limiter utility
│   │   └── validations/         # Zod schemas (6 files)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── generated/prisma/        # Auto-generated Prisma client
├── next.config.ts               # Image remote patterns
├── prisma.config.ts             # Prisma CLI config
└── components.json              # shadcn configuration
```

---

## Database Schema

**Provider**: PostgreSQL (Neon serverless)

**Models**: User, Session, Account, VerificationToken, Category, Product, ProductImage, HeroBanner, AboutSection, GalleryImage, ContactMessage, Setting

**Enum**:
```prisma
enum Role {
  ADMIN
  EDITOR
}
```

### Models

#### User
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| name | String? | Optional |
| email | String | Unique |
| emailVerified | Boolean | Default false |
| image | String? | Optional |
| role | Role | Default EDITOR |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: has many `Session[]`, `Account[]`

#### Session
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| userId | String | Foreign key to User |
| token | String | Unique |
| expiresAt | DateTime | |
| ipAddress | String? | |
| userAgent | String? | |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Belongs to `User` (cascade delete).

#### Account
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| userId | String | Foreign key to User |
| accountId | String | |
| providerId | String | |
| accessToken | String? | |
| refreshToken | String? | |
| accessTokenExpiresAt | DateTime? | |
| refreshTokenExpiresAt | DateTime? | |
| scope | String? | |
| idToken | String? | |
| password | String? | (for email/password auth) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Belongs to `User` (cascade delete).

#### VerificationToken
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| identifier | String | |
| value | String | Unique |
| expiresAt | DateTime | |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Standalone model (no relations).

#### Category
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| name | String | |
| slug | String | Unique, URL-safe |
| description | String? | |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: has many `Product[]`

#### Product
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| name | String | |
| slug | String | Unique, URL-safe |
| description | String? | |
| price | Decimal(10,2)? | Optional, 10 digits/2 decimals |
| featured | Boolean | Default false |
| status | String | Default "draft" |
| categoryId | String | Foreign key to Category |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: belongs to `Category`; has many `ProductImage[]` (cascade delete)

#### ProductImage
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| url | String | |
| publicId | String | Cloudinary public ID |
| alt | String? | |
| order | Int | Default 0 |
| productId | String | Foreign key to Product |
| createdAt | DateTime | Auto |

Belongs to `Product` (cascade delete).

#### HeroBanner
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| title | String | |
| subtitle | String? | |
| cta | String? | Call-to-action button text |
| ctaLink | String? | |
| imageUrl | String | |
| imagePublicId | String? | |
| active | Boolean | Default true |
| order | Int | Default 0 |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Standalone model.

#### AboutSection
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| title | String | |
| description | String | |
| imageUrl | String? | |
| imagePublicId | String? | |
| active | Boolean | Default true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Standalone model.

#### GalleryImage
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| url | String | |
| publicId | String? | Cloudinary public ID |
| alt | String | |
| order | Int | Default 0 |
| createdAt | DateTime | Auto |

Standalone model.

#### ContactMessage
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| name | String | |
| email | String | |
| subject | String? | Optional |
| message | String | |
| createdAt | DateTime | Auto |

Stores contact form submissions. Created via public server action (rate-limited).

#### Setting
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| key | String | Unique |
| value | String | |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Standalone model.

---

## Authentication

### Server-side (`src/lib/auth.ts`)

Better Auth configured with:
- **Adapter**: Prisma (PostgreSQL) via `@prisma/adapter-neon`
- **Methods**: Email/password
- **Custom fields**: `role` (string, default "EDITOR") added to User model
- **Plugins**: `nextCookies()` for cookie-based session management
- **Exports**: `auth` instance

### Client-side (`src/lib/auth-client.ts`)

```ts
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
// Usage: authClient.signIn.email({ email, password })
```

### Auth Proxy (`proxy.ts`)

Next.js 16 `proxy.ts` (Node.js runtime) protects `/admin/*` routes:
- Allowed without auth: `/admin/login` (redirects to dashboard if already authenticated)
- All others: checks session via `auth.api.getSession()`
- **ADMIN role required**: if `session.user.role !== "ADMIN"`, redirects to `/admin/login`
- Redirects to `/admin/login` if unauthenticated

This provides defense-in-depth alongside per-action role checks in server actions.

### Seed Admin

```bash
npx tsx scripts/seed.ts admin@maison.com admin123 Admin
```

Default credentials:
- Email: `admin@maison.com`
- Password: `admin123`
- Role: `ADMIN`

---

## Routes

### Public Routes

All public pages are **Server Components by default**, fetching data directly from Prisma. Only the contact page and search client are `"use client"`.

| Route | File | Description |
|---|---|---|
| `/` | `(public)/page.tsx` | Homepage: hero banner, featured products, about section, gallery |
| `/products` | `(public)/products/page.tsx` | Full product listing (published, newest first) |
| `/products/[slug]` | `(public)/products/[slug]/page.tsx` | Product detail with images, metadata |
| `/categories` | `(public)/categories/page.tsx` | All categories with product counts |
| `/categories/[slug]` | `(public)/categories/[slug]/page.tsx` | Products in a category |
| `/about` | `(public)/about/page.tsx` | About page content |
| `/gallery` | `(public)/gallery/page.tsx` | Editorial gallery grid |
| `/search` | `(public)/search/page.tsx` | Search with client-side filtering |
| `/contact` | `(public)/contact/page.tsx` | Contact form (client component) |

### Admin Routes

All admin routes (except login) require authentication.

| Route | File | Type | Description |
|---|---|---|---|
| `/admin/login` | `admin/login/page.tsx` | Client | Login form |
| `/admin` | `admin/(protected)/page.tsx` | Server | Dashboard with stats + recent products |
| `/admin/products` | `admin/(protected)/products/page.tsx` | Server | Products list |
| `/admin/products/new` | `admin/(protected)/products/new/page.tsx` | Server | Create product (redirects to list on success) |
| `/admin/products/[id]/edit` | `admin/(protected)/products/[id]/edit/page.tsx` | Server→Client | Edit product form (redirects to list on save) |
| `/admin/categories` | `admin/(protected)/categories/page.tsx` | Server | Categories list |
| `/admin/categories/new` | `admin/(protected)/categories/new/page.tsx` | Client | Create category |
| `/admin/categories/[id]/edit` | `admin/(protected)/categories/[id]/edit/` | Server→Client | Edit category |
| `/admin/hero` | `admin/(protected)/hero/` | Server→Client | Manage hero banners |
| `/admin/about` | `admin/(protected)/about/` | Server→Client | Manage about sections |
| `/admin/gallery` | `admin/(protected)/gallery/` | Server→Client | Manage gallery images |
| `/admin/settings` | `admin/(protected)/settings/` | Server→Client | Site settings |
| `/admin/messages` | `admin/(protected)/messages/page.tsx` | Server | Contact form submissions (force-dynamic) |
| `/admin/media` | `admin/(protected)/media/page.tsx` | Client | Media manager |
| `/admin/profile` | `admin/(protected)/profile/page.tsx` | Client | Profile page |

---

## API Endpoints

| Endpoint | Methods | Auth | Description |
|---|---|---|---|
| `/api/auth/[...all]` | GET, POST | No | Better Auth handler (signup, signin, session, etc.) |
| `/api/upload` | POST | Yes (ADMIN) | Upload image to Cloudinary |
| `/api/upload` | DELETE | Yes (ADMIN) | Delete image from Cloudinary |
| `/api/revalidate` | POST | Yes (ADMIN) | Revalidate Next.js cache paths |

### Upload API (`POST /api/upload`)

Accepts multipart form data with:
- `file`: Image file (allowed types: JPEG, PNG, WebP, AVIF; max 10MB)
- `folder` (optional): Cloudinary folder name (default: "maison")

**Server-side validation**: MIME type and file size are validated before upload.

**Rate limiting**: 10 requests per minute per user (in-memory).

Returns:
```json
{
  "url": "https://res.cloudinary.com/.../image/upload/...",
  "publicId": "maison/abc123"
}
```

### Delete API (`DELETE /api/upload`)

Accepts JSON body with `publicId`. Rate limited (10 req/min per user).

Errors return `{ "error": "<message>" }` with appropriate HTTP status.

---

## Server Actions

All actions in `src/lib/actions/` use `"use server"`.

| File | Functions | Auth | Description |
|---|---|---|---|
| `products.ts` | `createProduct`, `updateProduct`, `deleteProduct`, `updateProductImages` | ADMIN | Full product CRUD with Cloudinary cleanup |
| `categories.ts` | `createCategory`, `updateCategory`, `deleteCategory` | ADMIN | Full category CRUD (delete blocked if products linked) |
| `hero.ts` | `createHeroBanner`, `updateHeroBanner`, `deleteHeroBanner`, `reorderHeroBanners` | ADMIN | Hero banner CRUD + reorder with Cloudinary cleanup |
| `about.ts` | `createAboutSection`, `updateAboutSection`, `deleteAboutSection` | ADMIN | About section CRUD with Cloudinary cleanup |
| `gallery.ts` | `createGalleryImage`, `updateGalleryImage`, `deleteGalleryImage`, `reorderGalleryImages` | ADMIN | Gallery CRUD + reorder with Cloudinary cleanup |
| `settings.ts` | `upsertSetting`, `deleteSetting` | ADMIN | Settings management |
| `contact.ts` | `sendContactMessage`, `getContactMessages` | Public / ADMIN | Contact form submission (public, rate-limited) + message listing (ADMIN only) |

**Authentication**: All admin actions use `requireAdmin()` which checks for a valid session AND `role === "ADMIN"`. This is enforced in every action file — defense-in-depth alongside the proxy.

**Input validation**: All actions validate input with Zod schemas before database operations.

**Cache invalidation**: Mutating actions call `revalidatePath()` for relevant cached pages.

**Rate limiting**: The public `sendContactMessage` is rate-limited to 10 requests per minute per IP.

**Cloudinary cleanup**: Delete actions remove associated Cloudinary images before deleting database records. Failures are logged (not silently swallowed).

**Product Decimal serialization**: `createProduct` and `updateProduct` convert `Decimal` price to `number` before returning to avoid Next.js serialization errors.

---

## Validation Schemas

All schemas use Zod (`z`) and are in `src/lib/validations/`.

| Schema | Key Fields |
|---|---|
| `productSchema` | `name` (required), `slug` (regex: lowercase, alphanumeric, dashes), `price` (optional, coerced, positive), `categoryId` (required), `featured` (boolean), `status` (draft/published) |
| `productUpdateSchema` | Partial of productSchema |
| `categorySchema` | `name` (required), `slug` (regex), `description` (optional) |
| `categoryUpdateSchema` | Partial of categorySchema |
| `heroBannerSchema` | `title` (required), `imageUrl` (required), `active` (boolean), `order` (int) |
| `aboutSectionSchema` | `title` (required), `description` (required), `active` (boolean) |
| `settingSchema` | `key` (required), `value` (required) |
| `contactMessageSchema` | `name` (required, max 200), `email` (valid email), `subject` (optional, max 200), `message` (required, max 5000) |

Slugs are auto-sanitized server-side before validation: lowercase, spaces→hyphens, special characters stripped.

---

## Components

### Admin Components (`src/components/admin/`)

| Component | Type | Description |
|---|---|---|
| `header.tsx` | Client | Sticky admin header with mobile menu toggle |
| `sidebar.tsx` | Client | Desktop sidebar navigation with active route highlighting |
| `sidebar-mobile.tsx` | Client | Mobile slide-out sidebar drawer with overlay |
| `image-uploader.tsx` | Client | Drag-and-drop upload area → Cloudinary via `/api/upload` |

### Admin Form Components (`src/app/admin/(protected)/_components/`)

| Component | Actions | Navigation on success |
|---|---|---|
| `product-form.tsx` | Create, update, delete product; manage images | Redirects to `/admin/products`, shows toast notification |

### Admin Page-Level Components

| Component | File | Description |
|---|---|---|
| `category-edit-form.tsx` | `categories/[id]/edit/` | Edit category with delete; redirects to list with toast on delete |
| `hero-form.tsx` | `hero/` | Manage hero banners (CRUD + reorder) |
| `about-form.tsx` | `about/` | Manage about sections (CRUD) |
| `gallery-grid.tsx` | `gallery/` | Manage gallery images (CRUD + reorder) |
| `settings-form.tsx` | `settings/` | Manage site settings (upsert/delete) |

### Public Components (`src/components/public/`)

| Component | Type | Description |
|---|---|---|
| `header.tsx` | Client | Sticky nav with Collection, Categories, About, Gallery, Contact, Search |
| `footer.tsx` | Server | Multi-column footer (Navigation, Connect, Legal) |

### Shared Components (`src/components/shared/`)

| Component | Description |
|---|---|
| `loading-skeleton.tsx` | `Skeleton`, `ProductCardSkeleton`, `ProductGridSkeleton`, `SectionSkeleton` |
| `error-state.tsx` | `ErrorState` with title, message, action button |
| `empty-state.tsx` | `EmptyState` with icon, title, description, action |

### UI Primitives (`src/components/ui/`)

18 shadcn/ui components: `avatar`, `badge`, `button`, `card`, `command`, `dialog`, `dropdown-menu`, `input`, `input-group`, `label`, `navigation-menu`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `table`, `textarea`, `toast`.

### Routing Patterns

Server actions use `revalidatePath()` for cache invalidation. Client components navigate with `startTransition(() => router.push(...))` (React 19 pattern) — without `startTransition`, router updates from async event handlers can be dropped by the concurrent renderer.

### Toast Notifications

Uses **sonner** (`toast.success()`, `toast.error()`) for user feedback:

- `<Toaster richColors />` mounted in `admin/(protected)/layout.tsx`
- Shown on product create/update/delete and category update/delete
- Server action errors are caught in client try/catch and displayed as inline error banners (not toasts)

---

## Cloudinary Image Upload

### Architecture

Uploads flow through the Next.js server:
1. **Client** (`image-uploader.tsx`) validates MIME type and file size, then sends as `multipart/form-data` to `POST /api/upload`
2. **Server** (`api/upload/route.ts`) validates MIME type and file size again (server-side, cannot be bypassed)
3. **Server** converts file to base64 data URI
4. **Server** (`lib/cloudinary.ts`) uploads to Cloudinary via the SDK with `resource_type: "image"`
5. **Server** returns `{ url, publicId }` to client
6. **Client** stores the URL and public ID in the form

### Security

- **Server-side validation**: MIME type must be `image/jpeg`, `image/png`, `image/webp`, or `image/avif`. File size capped at 10MB.
- **Authentication**: Both POST (upload) and DELETE (delete) require an authenticated session with `ADMIN` role.
- **Rate limiting**: 10 requests per minute per user (in-memory).
- **Client-side validation**: The image uploader component also validates MIME and size pre-flight, but the server never trusts client-only checks.
- **Cloudinary as safety net**: Cloudinary's API with `resource_type: "image"` rejects non-image files server-to-server.

### Key Files

| File | Purpose |
|---|---|
| `src/lib/cloudinary.ts` | `uploadImage()`, `deleteImage()` helpers |
| `src/app/api/upload/route.ts` | Express-style upload API endpoint with validation + rate limiting |
| `src/components/admin/image-uploader.tsx` | Reusable client-side upload widget |
| `src/lib/rate-limit.ts` | In-memory rate limiter used by upload API |

### Error Handling

Cloudinary operation failures (e.g., delete) are logged with `console.error` to avoid silent data loss. The database operation still proceeds to prevent orphans.

### Image Hostnames

Configured in `next.config.ts` for Next.js `<Image>` component:
- `res.cloudinary.com` (production images)
- `picsum.photos` (fallback placeholder for missing product images)
- `images.unsplash.com` (fallback hero and about images)
- `i.pinimg.com` (Pinterest)

---

## Security

### Authentication & Authorization

| Layer | Mechanism | Scope |
|---|---|---|
| Proxy (`proxy.ts`) | `auth.api.getSession()` + role check | All `/admin/*` routes (redirects if unauthorized) |
| Server actions | `requireAdmin()` in each `"use server"` file | All mutating admin operations |
| API routes | `auth.api.getSession()` + role check in each handler | `/api/upload`, `/api/revalidate` |
| Query helpers | None (protected by proxy — pages under `/admin/*` require auth) | Admin page data fetching |

### Role Enforcement

The `role` field is configured with `input: false` in Better Auth, preventing client-side role manipulation during signup. Only the seed script or direct database update can set a user's role to `ADMIN`.

### Rate Limiting

An in-memory rate limiter (`src/lib/rate-limit.ts`) caps requests at 10 per minute per key:

| Endpoint | Key | Purpose |
|---|---|---|
| `/api/upload` POST | `upload:{userId}` | Prevent storage abuse |
| `/api/upload` DELETE | `delete:{userId}` | Prevent delete abuse |
| `/api/revalidate` POST | `revalidate:{userId}` | Prevent cache-flood attacks |
| `sendContactMessage` | `contact:{ip}` | Prevent contact form spam |

**Note**: In-memory rate limiting resets per serverless invocation on Vercel. For production at scale, replace with [Upstash Redis](https://upstash.com/) rate limiting.

### File Upload Security

- Server-side MIME type allowlisting (`image/jpeg`, `image/png`, `image/webp`, `image/avif`)
- Server-side file size limit (10MB)
- Cloudinary's `resource_type: "image"` as additional safety net
- All uploads authenticated with ADMIN role

### Input Validation

All user inputs are validated server-side with Zod schemas before reaching the database. Client-side validation is cosmetic only — the server never trusts it.

### Error Handling

- Server actions throw generic `"Unauthorized"` or `"Forbidden"` errors
- API routes return generic `{ error: "Upload failed" }` messages — no stack traces or internal details
- Cloudinary errors are logged server-side but not surfaced to users

### Environment Variables

| Variable | Access | Safe? |
|---|---|---|
| `DATABASE_URL` | Server-only | Yes |
| `BETTER_AUTH_SECRET` | Server-only | Yes |
| `BETTER_AUTH_URL` | Server-only | Yes |
| `NEXT_PUBLIC_APP_URL` | Client + Server | Yes (public URL) |
| `CLOUDINARY_CLOUD_NAME` | Server-only | Yes |
| `CLOUDINARY_API_KEY` | Server-only | Yes |
| `CLOUDINARY_API_SECRET` | Server-only | Yes |

`.env*` is in `.gitignore` — credentials are never committed.

---

## Prisma & Database

### Configuration

- **Schema**: `prisma/schema.prisma`
- **Config**: `prisma.config.ts`
- **Client**: Generated to `src/generated/prisma/client.ts` (ESM output)
- **Adapter**: `PrismaNeon` from `@prisma/adapter-neon` with `{ connectionString: DATABASE_URL }`

### Important Notes

- **Prisma 7** is ESM-only — client exports from `client.ts`, not `client/index.ts`
- **Neon adapter** requires the `{ connectionString: DATABASE_URL }` object format
- **Decimal fields** (`Product.price`) must be serialized to `number` before passing to client components or returning from server actions
- **Migrations**: 4 migrations applied (init, session fields, hero description, indexes + contact message). Database is up to date.
- **`prisma db push`**: Used for development schema sync. Production should use `prisma migrate deploy`.
  ```ts
  price: product.price ? Number(product.price) : null,
  ```

### Common Commands

```bash
# Run migrations (development)
npx prisma migrate dev --name <description>

# Deploy migrations (production)
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate

# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status

# Open Prisma Studio
npx prisma studio

# Sync schema without migration (development)
npx prisma db push
```

---

## Design & UI

### Tailwind CSS v4

The project uses **Tailwind CSS v4** with PostCSS (`@tailwindcss/postcss`). No `tailwind.config.ts` — all configuration is CSS-based in `src/app/globals.css`.

### shadcn/ui

The component library is configured via `components.json`:
- **Style**: `base-nova` (Tailwind v4 native)
- **Color**: `neutral`
- **CSS variables**: enabled

### Fonts

**Geist** (Geist Sans + Geist Mono) via `next/font/google`, applied in root layout.

### Theme

shadcn CSS variables in `globals.css` with light/dark mode support via `class` strategy. The design follows a "Cold Luxury" palette with muted tones, generous whitespace, and editorial-style typography.

---

## Scripts

### Seed Script (`scripts/seed.ts`)

Creates an admin user via Better Auth and promotes to ADMIN role:

```bash
npx tsx scripts/seed.ts admin@maison.com admin123 Admin
```

The script first checks if the email already exists to avoid duplicates.
