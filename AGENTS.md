# AGENTS.md - AI Coding Agent Guidelines

## Project Overview

YouTube link redirection service built with Next.js 16, React 19, TypeScript 5, and Tailwind CSS 4. Deployed on Vercel. The service detects device type (iOS/Android/Desktop) and redirects to the appropriate YouTube app scheme or web URL.

## Build / Lint / Test Commands

```bash
# Development (Turbopack)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

**Note**: This project uses pnpm exclusively. The `packageManager` field in `package.json` enforces this.

### Running a Single Test

**No test framework is currently configured.** If tests are added:

```bash
# Vitest (recommended for Next.js)
npx vitest path/to/file.test.ts

# Jest
npx jest path/to/file.test.ts
```

### Type Checking

```bash
# Run TypeScript type check without emitting
npx tsc --noEmit
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and routes
│   ├── [...path]/         # Dynamic catch-all route handler
│   │   └── route.ts       # Main redirect API logic
│   ├── redirect/          # Client-side redirect page
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
└── utils/                  # Business logic utilities
    ├── constants.ts       # App constants (YOUTUBE_WEB, etc.)
    ├── deviceDetection.ts # User-Agent parsing
    ├── htmlGenerator.ts   # Social meta HTML generation
    ├── urlProcessor.ts    # URL cleaning and redirect URL generation
    └── youtubeMetadata.ts # YouTube oEmbed API integration
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** (`strict: true` in tsconfig.json)
- **NEVER use type suppressions**: No `as any`, `@ts-ignore`, `@ts-expect-error`
- Prefer inline types for simple structures over separate interfaces
- Use explicit return types for exported functions

```typescript
// Good
export const createRedirectUrl = (rawUrl: string, deviceType: string): string => {
    // ...
};

// Bad - missing return type
export const createRedirectUrl = (rawUrl: string, deviceType: string) => {
    // ...
};
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Functions/Variables | camelCase | `getDeviceType`, `redirectLocation` |
| Constants | SCREAMING_SNAKE_CASE | `YOUTUBE_WEB` |
| Components | PascalCase | `RedirectPage`, `RedirectContent` |
| Files (utilities) | camelCase.ts | `deviceDetection.ts`, `urlProcessor.ts` |
| Files (Next.js) | lowercase | `page.tsx`, `layout.tsx`, `route.ts` |
| Directories | lowercase | `utils/`, `redirect/` |

### Import Conventions

1. **External libraries first** (next, react)
2. **Internal modules second** (using `@/` alias)
3. **Group by source**, separate with blank line if needed

```typescript
// External
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Internal (use @/ alias, NOT relative paths)
import { getDeviceType, isSocialCrawler } from "@/utils/deviceDetection";
import { YOUTUBE_WEB } from "@/utils/constants";
```

### Path Aliases

Use `@/` alias for all imports from `src/` directory:

```typescript
// Good
import { createRedirectUrl } from "@/utils/urlProcessor";

// Bad - relative imports
import { createRedirectUrl } from "../../utils/urlProcessor";
```

### Error Handling

- **Always use try-catch** for async operations and external API calls
- **Log errors** with `console.error()` for debugging
- **Provide graceful fallbacks** - never let errors crash the request

```typescript
try {
    const metadata = await getYouTubeMetadata(webUrl);
    // ... use metadata
} catch (error) {
    console.error("Failed to fetch metadata:", error);
    // Fallback to default redirect
}
```

### React/Next.js Patterns

#### Route Handlers (API Routes)

```typescript
// Use route segment config for caching control
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Async params pattern (Next.js 15+)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const headersList = await headers();
    // ...
}
```

#### Client Components

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Wrap useSearchParams in Suspense
export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <Content />
        </Suspense>
    );
}
```

### Styling

- **Tailwind CSS only** - no CSS-in-JS or separate CSS modules
- Use utility classes directly in `className`
- For complex repeated styles, consider extracting to components

```tsx
// Good - Tailwind utilities
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">

// Bad - inline styles
<div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
```

### Comments

- Use JSDoc-style comments for utility functions
- Write comments in Korean or English (project uses Korean comments)
- Document "why" not "what" when the code is self-explanatory

```typescript
/**
 * User-Agent와 헤더에서 디바이스 타입 확인
 */
export const getDeviceType = (userAgent: string): string => {
    // ...
};
```

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config (strict mode, path aliases) |
| `eslint.config.mjs` | ESLint with next/core-web-vitals, next/typescript |
| `next.config.ts` | Next.js configuration |
| `postcss.config.mjs` | PostCSS for Tailwind CSS |
| `tailwind.config.ts` | Tailwind CSS configuration (if customized) |

## Common Pitfalls to Avoid

1. **Don't use relative imports** - Always use `@/` alias
2. **Don't suppress TypeScript errors** - Fix the underlying issue
3. **Don't forget async/await for params and headers** in Next.js 15+ route handlers
4. **Don't skip error handling** - Every external call needs try-catch
5. **Don't cache redirect responses** - Use appropriate cache headers for real-time redirects

## Deployment

- **Platform**: Vercel
- **Node.js**: 22 (configured via Vercel)
- **Build**: Automatic on push to main branch
- **Preview**: Automatic for pull requests

```bash
# Manual deployment
vercel        # Preview
vercel --prod # Production
```
