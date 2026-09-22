# Project Rules: Laravel LMS to Next.js 15 Migration

## Mission
Convert the full Laravel LMS (`mentor-lms-learning-management-system`) into the modern Next.js 15 full-stack application (`lms-nodejs`) preserving exact 1:1 design fidelity, colors, typography, layout gaps, and components.

## Core Rules

1. **Immutable Laravel Reference**:
   - `mentor-lms-learning-management-system` is STRICTLY READ-ONLY.
   - Never edit, delete, or create files in the Laravel directory. All development belongs in `lms-nodejs`.

2. **1:1 Visual Reproduction**:
   - Exactly replicate the styling, fonts (Inter), colors (OKLCH design tokens), spacing, animations, and layouts.
   - Do NOT redesign or add unrequested aesthetic alterations.

3. **Enterprise Security**:
   - Next.js 15 middleware with dynamic nonce-based Content-Security-Policy (CSP).
   - Strict OWASP headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
   - Rate limiting on API/auth endpoints to guard against brute-force and DDoS.
   - Zod validation and input sanitization to eliminate XSS and injection vulnerabilities.

4. **SEO & Schema.org**:
   - Include JSON-LD structured data for `Course`, `EducationalOrganization`, `BreadcrumbList`, and `FAQPage`.
   - Comprehensive Open Graph, Twitter Cards, dynamic sitemap, and robots.txt.

5. **Screenshot Ingestion**:
   - When the user provides a screenshot or section to add, build it faithfully inside `lms-nodejs` using the project's design tokens.

6. **Git Push Protocol**:
   - Do NOT push to remote GitHub (`isohelu/nextjs-lms`) without explicit instruction from the user.
