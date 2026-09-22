# LMS Migration & Development Rules

These rules govern all interactions, coding agents, and subagents operating in this workspace.

## 1. Strict Read-Only Policy for Laravel
- **Target**: `c:\HUIPPERDEV\lmsproject\mentor-lms-learning-management-system`
- **Rule**: This directory is an **IMMUTABLE REFERENCE ONLY**.
- **Prohibitions**: NEVER edit, write, delete, move, reformat, or alter any file inside the Laravel project directory. All changes must take place exclusively inside `c:\HUIPPERDEV\lmsproject\lms-nodejs`.

## 2. 1:1 Visual & Design Fidelity
- **Zero Design Drift**: Do not alter or "invent" new designs, colors, fonts, spacing, padding, borders, gaps, or typography.
- **Reference Fidelity**: Every component, section, card, button, avatar, modal, and drawer in Next.js must replicate the visual styling and layout from Laravel 1:1.
- **Color System**: Always utilize the defined OKLCH color variables and Tailwind CSS v4 `@theme` tokens (`--primary`, `--secondary`, `--muted`, `--accent`, `--card-shadow`, etc.).
- **Typography**: The primary typeface is **Inter** (`font-sans`), with exact font sizes, weights, and line heights.

## 3. Screenshot & New Section Ingestion
- When the user provides a screenshot, mockup, or instruction to add a section:
  1. Add/modify components **only** within `lms-nodejs`.
  2. Maintain consistent typography, colors, and layout spacing matching the established design system.
  3. Validate responsiveness across mobile, tablet, and desktop viewports.

## 4. Enterprise Security Standards
- **Content Security Policy (CSP)**: Enforce dynamic cryptographically secure `nonce` generation in `src/middleware.ts`. Never use `'unsafe-eval'`.
- **OWASP Headers**: Enforce `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- **Rate Limiting**: Protect all public mutation endpoints, authentication flows, and contact/newsletter forms with in-memory or Redis rate limiting.
- **Input Sanitization**: Validate all inputs using **Zod** schemas. Sanitize HTML rich-text before rendering to prevent XSS.
- **Secrets Management**: Never commit `.env` or `.env.local` files to git. Only prefix browser-required environment variables with `NEXT_PUBLIC_`.

## 5. SEO & Schema.org Structured Data
- Every course page must include Schema.org `Course` JSON-LD structured data with nested `provider` (`EducationalOrganization`), price, credential, and ratings.
- Every page must implement descriptive Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) and Twitter Cards.
- Maintain dynamic `sitemap.ts` and `robots.ts` for search engine indexation.

## 6. Git Push Policy
- Staging and committing changes locally to Git is standard practice.
- **Pushing to Remote**: Only push to GitHub (`isohelu/nextjs-lms` or any other remote) when the user **explicitly directs or requests to push code**.
