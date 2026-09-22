---
name: lms-migration
description: Expert methodology and workflow for converting Laravel React/Inertia LMS modules into Next.js 15 App Router with 1:1 design fidelity, Supabase backend, enterprise security, and Schema.org SEO.
---

# LMS Migration Skill

Use this skill when converting components, pages, APIs, and features from the Laravel LMS project (`mentor-lms-learning-management-system`) to the Next.js 15 project (`lms-nodejs`).

## 1. Immutable Source Code Guardrail
- The Laravel LMS directory (`mentor-lms-learning-management-system`) is strictly **read-only**.
- All code generation, asset placements, and styling adjustments must occur inside `lms-nodejs`.

## 2. Inertia.js to Next.js 15 Translation Matrix

| Inertia Pattern (Laravel) | Next.js 15 Pattern (`lms-nodejs`) |
| :--- | :--- |
| `<Link href="/url">` from `@inertiajs/react` | `<Link href="/url">` from `next/link` |
| `usePage<SharedData>().props` | Server Component data / React Context / Supabase query |
| `router.post('/route', data)` | Server Actions or `/api/...` route handler with `fetch` |
| `Head` from `@inertiajs/react` | Next.js `generateMetadata` or `<head>` script tags |
| Dynamic route parameters in PHP | File-based dynamic routing: `[slug]/page.tsx` |
| `@inertiajs/react` Form helpers | `react-hook-form` with `zod` resolver |

## 3. Design System & 1:1 Visual Fidelity
- Use Tailwind CSS v4 `@theme` tokens defined in `src/app/globals.css`.
- Color references:
  - Primary text / accents: `var(--primary)`, `var(--primary-foreground)`
  - Secondary badges: `var(--secondary)`, `var(--secondary-foreground)`
  - Card backgrounds: `var(--card)` with `var(--card-shadow)`
  - Card hover state: `var(--card-shadow-hover)`
  - Muted text / backgrounds: `var(--muted)`, `var(--muted-foreground)`
- Typography: Inter (`font-sans`), strictly preserving font weights, sizes, and line-heights.

## 4. Enterprise Security Standards
- **Middleware Security Headers**: Every request passes through `src/middleware.ts` injecting:
  - Nonce-protected Content-Security-Policy (CSP)
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Rate Limiting**: Apply sliding-window token limiter (`src/lib/security/rate-limit.ts`) to sensitive endpoints.
- **Validation**: All user input must pass through Zod schemas before processing or persisting.

## 5. Structured Data (Schema.org JSON-LD)
- Add structured data scripts to courses and pages:
  - `Course`: includes title, description, instructor, provider (`EducationalOrganization`), price, credential.
  - `BreadcrumbList`: navigation hierarchy.
  - `FAQPage`: questions and accepted answers.

## 6. Git Push Policy
- Stage and commit work locally.
- **Only push to remote GitHub** when the user explicitly commands to push code.
