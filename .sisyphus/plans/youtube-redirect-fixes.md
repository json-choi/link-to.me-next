# YouTube Redirect Service Fixes

## TL;DR

> **Quick Summary**: Fix two critical issues - (1) OG metadata fails silently for social crawlers, redirecting instead of showing preview HTML, and (2) in-app browser redirects fail because auto-redirect is blocked by Instagram/Facebook. Solution: Add fallback HTML for crawlers + rewrite redirect page with button-only approach.
> 
> **Deliverables**:
> - Fixed route.ts with fallback HTML response for metadata failures
> - Enhanced htmlGenerator.ts with og:video tags and canonical link
> - Expanded crawler detection in deviceDetection.ts
> - Improved thumbnail fallback logic in youtubeMetadata.ts
> - Rewritten redirect/page.tsx with button-only UI (no auto-redirect)
>
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (route.ts) depends on Tasks 2-4 being complete

---

## Context

### Original Request
User wants to fix two problems:
1. **OG Metadata Not Displaying**: When oEmbed API call fails, crawlers receive a redirect instead of HTML with OG tags - breaking social media previews
2. **In-App Browser Redirect Failing**: Auto-redirect via `window.location.href` is blocked in Instagram/Facebook in-app browsers since Oct 2024

### Interview Summary
**Key Discussions**:
- User prefers **minimal UI** for redirect page (button only, no video preview)
- **Auto-fallback to web YouTube** if app scheme fails (no error message)
- **Desktop behavior unchanged** - direct 302 redirect to YouTube web
- **Manual verification acceptable** (curl + browser testing)
- User explicitly said existing code can be rewritten from scratch if needed

**Research Findings**:
- Instagram/Facebook blocked `intent://` scheme in Oct 2024
- In-app browsers block auto-redirect without user gesture
- Button click = user gesture = bypasses restrictions
- Current loading spinner + auto-redirect approach fails silently

### Metis Review
**Identified Gaps** (addressed in this plan):
- Need specific og:video tags (og:video:url, og:video:type, og:video:width, og:video:height)
- Canonical link should point to YouTube URL (not our service)
- Thumbnail fallback: maxresdefault -> hqdefault -> mqdefault hierarchy
- Crawler patterns for Pinterest, Snapchat, Line needed
- Private/unavailable videos should get basic fallback metadata
- Edge cases: malformed URLs, network timeouts, deleted videos

---

## Work Objectives

### Core Objective
Fix social media preview metadata for crawlers and make mobile redirect reliable in all in-app browsers.

### Concrete Deliverables
1. `src/app/[...path]/route.ts` - Fallback HTML response when metadata fetch fails
2. `src/utils/htmlGenerator.ts` - Enhanced with og:video tags, canonical link, fallback HTML generator
3. `src/utils/deviceDetection.ts` - Expanded crawler patterns
4. `src/utils/youtubeMetadata.ts` - Improved thumbnail fallback logic
5. `src/app/redirect/page.tsx` - Complete rewrite with button-only approach

### Definition of Done
- [ ] `curl -A "facebookexternalhit" https://link-to.me/watch?v=xxx` returns HTML with og:* tags (not redirect)
- [ ] `curl -A "Pinterestbot" https://link-to.me/watch?v=xxx` returns HTML with og:* tags
- [ ] Redirect page shows button immediately (no loading spinner, no auto-redirect)
- [ ] Button click opens YouTube app on iOS/Android
- [ ] If app fails to open, automatically redirects to YouTube web

### Must Have
- Fallback HTML for crawlers even when YouTube API completely fails
- og:video tags for video content (required for rich previews)
- Button-only UI in redirect page (no auto-redirect attempts)
- User gesture triggers app open (works in all in-app browsers)

### Must NOT Have (Guardrails)
- **NO auto-redirect on page load** - only button click triggers navigation
- **NO loading spinner or "Redirecting..." state** - button visible immediately
- **NO changes to desktop behavior** - keep direct 302 redirect
- **NO retry logic for metadata fetching** - simple fallback is sufficient
- **NO app installation detection UI** - just show the button
- **NO AI-slop patterns**: over-abstraction, excessive error handling, bloated documentation

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: NO (manual verification)
- **QA approach**: Manual verification via curl + Playwright browser automation

### Automated Verification Approach

All acceptance criteria will be verified via:
1. **curl commands** for crawler responses (checking OG tags in HTML)
2. **Playwright browser automation** for redirect page behavior
3. **Build verification** via `pnpm build`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - All Independent):
├── Task 2: htmlGenerator.ts enhancements (og:video, canonical, fallback)
├── Task 3: deviceDetection.ts expanded crawler patterns
├── Task 4: youtubeMetadata.ts thumbnail fallback
└── Task 5: redirect/page.tsx complete rewrite

Wave 2 (After Wave 1):
└── Task 1: route.ts integration (uses changes from Tasks 2-4)

Wave 3 (After Wave 2):
└── Task 6: Integration testing and verification

Critical Path: Tasks 2,3,4 → Task 1 → Task 6
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | 2, 3, 4 | 6 | None (wave 2) |
| 2 | None | 1 | 3, 4, 5 |
| 3 | None | 1 | 2, 4, 5 |
| 4 | None | 1 | 2, 3, 5 |
| 5 | None | 6 | 2, 3, 4 |
| 6 | 1, 5 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|-------------------|
| 1 | 2, 3, 4, 5 | 4 parallel agents (quick category for Tasks 2-4, visual-engineering for Task 5) |
| 2 | 1 | 1 agent after Wave 1 completes |
| 3 | 6 | 1 agent for verification |

---

## TODOs

- [ ] 1. Add fallback HTML response in route.ts for crawler metadata failures

  **What to do**:
  - Import new `generateFallbackMetaHtml` function from htmlGenerator.ts
  - In the catch block (lines 52-54), instead of falling through to redirect, return fallback HTML
  - Fallback HTML should contain basic og:* tags with generic YouTube metadata
  - Ensure crawlers ALWAYS receive HTML response, never redirect

  **Must NOT do**:
  - Do NOT add retry logic for metadata fetching
  - Do NOT change desktop redirect behavior (line 61-63)
  - Do NOT modify mobile redirect flow to /redirect page

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, focused change in single file with clear before/after
  - **Skills**: None needed
    - Task is straightforward file modification
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI involved, this is backend route handling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 2, 3, 4 (needs htmlGenerator changes)

  **References**:

  **Pattern References**:
  - `src/app/[...path]/route.ts:40-55` - Current crawler handling logic with try/catch (modify catch block)
  - `src/app/[...path]/route.ts:46-51` - HTML response format pattern (copy this pattern for fallback)

  **API/Type References**:
  - `src/utils/htmlGenerator.ts:generateSocialMetaHtml` - Existing function signature to follow
  - `src/utils/youtubeMetadata.ts:YouTubeMetadata` - Type interface for metadata object

  **WHY Each Reference Matters**:
  - route.ts:40-55: This is the exact location to modify - the catch block currently falls through
  - route.ts:46-51: Shows the correct NextResponse pattern with headers to replicate

  **Acceptance Criteria**:

  **Automated Verification (curl commands)**:
  ```bash
  # Start dev server first: pnpm dev (in background)
  
  # Test 1: Crawler with valid video should get HTML (existing behavior)
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" | grep -q "og:title"
  # Assert: Exit code 0 (og:title found)
  
  # Test 2: Crawler request should NOT return 302 redirect
  curl -s -o /dev/null -w "%{http_code}" -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
  # Assert: Returns "200" (not "302")
  
  # Test 3: Even with invalid/nonexistent video, crawler should get HTML
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=INVALID_VIDEO_ID_12345" | grep -q "og:title"
  # Assert: Exit code 0 (og:title found in fallback HTML)
  ```

  **Evidence to Capture**:
  - [ ] curl output showing og:title present in response
  - [ ] HTTP status code 200 (not 302) for crawler requests

  **Commit**: YES
  - Message: `fix(route): return fallback HTML for crawlers when metadata fetch fails`
  - Files: `src/app/[...path]/route.ts`
  - Pre-commit: `pnpm build`

---

- [ ] 2. Enhance htmlGenerator.ts with og:video tags, canonical link, and fallback generator

  **What to do**:
  - Add `og:video:url` tag pointing to YouTube embed URL
  - Add `og:video:secure_url` tag (same as og:video:url but explicit https)
  - Add `og:video:type` tag with value "text/html"
  - Add `og:video:width` and `og:video:height` tags (1280x720)
  - Add `<link rel="canonical" href="${youtubeUrl}">` tag
  - Create new exported function `generateFallbackMetaHtml(webUrl: string): string` for when metadata fetch fails completely
  - Fallback should use generic title "YouTube", description "YouTube에서 시청하세요", and YouTube default thumbnail

  **Must NOT do**:
  - Do NOT modify the existing escapeHtml function
  - Do NOT change the existing function signature of generateSocialMetaHtml
  - Do NOT add complex video type detection logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: HTML template modification, straightforward additions
  - **Skills**: None needed
    - Simple string template changes
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No visual design needed, just HTML meta tags

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 4, 5)
  - **Blocks**: Task 1
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/utils/htmlGenerator.ts:25-74` - Existing generateSocialMetaHtml function (extend this template)
  - `src/utils/htmlGenerator.ts:50-58` - Current OG tag format pattern (follow this style)

  **API/Type References**:
  - `src/utils/youtubeMetadata.ts:YouTubeMetadata` - Input type for metadata (has `type` field for video/shorts/live)

  **External References**:
  - Facebook Open Graph docs: og:video requires og:video:url, og:video:type for rich video previews

  **WHY Each Reference Matters**:
  - htmlGenerator.ts:25-74: This is the file to modify - shows existing structure and escaping patterns
  - htmlGenerator.ts:50-58: Shows how og tags are formatted - match this style exactly

  **Acceptance Criteria**:

  **Automated Verification (curl + grep)**:
  ```bash
  # After changes, verify og:video tags are present
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" | grep -q 'og:video:url'
  # Assert: Exit code 0
  
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" | grep -q 'og:video:type'
  # Assert: Exit code 0
  
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" | grep -q 'rel="canonical"'
  # Assert: Exit code 0
  
  # Verify fallback function works (will be used by Task 1)
  # TypeScript compile check
  pnpm build
  # Assert: Exit code 0, no type errors
  ```

  **Evidence to Capture**:
  - [ ] curl output showing og:video:url tag present
  - [ ] curl output showing canonical link present
  - [ ] pnpm build succeeds without errors

  **Commit**: YES
  - Message: `feat(html): add og:video tags and canonical link for rich social previews`
  - Files: `src/utils/htmlGenerator.ts`
  - Pre-commit: `pnpm build`

---

- [ ] 3. Expand crawler detection patterns in deviceDetection.ts

  **What to do**:
  - Add Pinterest crawler pattern: `"pinterestbot"`
  - Add Snapchat crawler pattern: `"snapchat"`
  - Add Line crawler pattern: `"linebot"`
  - Add additional patterns: `"outbrain"`, `"quora link preview"`, `"rogerbot"`, `"embedly"`
  - These should be added to the `crawlerPatterns` array

  **Must NOT do**:
  - Do NOT modify the inAppBrowserPatterns array (separate concern)
  - Do NOT change the detection logic - just add patterns
  - Do NOT add patterns for browsers that might have false positives

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple array modification, minimal logic change
  - **Skills**: None needed
    - Just adding strings to an array
  - **Skills Evaluated but Omitted**:
    - All skills unnecessary for this trivial change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4, 5)
  - **Blocks**: Task 1
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/utils/deviceDetection.ts:22-45` - Current crawlerPatterns array (add to this list)
  - `src/utils/deviceDetection.ts:26-44` - Existing pattern format with comments (follow this style)

  **External References**:
  - Pinterest User-Agent: "Pinterest/0.2 (+https://www.pinterest.com/bot.html)" - search for "pinterestbot"
  - Snapchat User-Agent: Contains "snapchat" string
  - Line User-Agent: "Line/" prefix or "LineBot" string

  **WHY Each Reference Matters**:
  - deviceDetection.ts:22-45: Exact location to add patterns, shows naming convention
  - deviceDetection.ts:26-44: Shows comment style for documenting each pattern

  **Acceptance Criteria**:

  **Automated Verification (curl with new user agents)**:
  ```bash
  # Test Pinterest crawler detection
  curl -s -o /dev/null -w "%{http_code}" -A "Pinterestbot/1.0" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
  # Assert: Returns "200" (HTML, not "302" redirect)
  
  # Test Snapchat crawler detection  
  curl -s -o /dev/null -w "%{http_code}" -A "Snapchat/1.0" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
  # Assert: Returns "200"
  
  # Test Line crawler detection
  curl -s -o /dev/null -w "%{http_code}" -A "LineBot/1.0" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
  # Assert: Returns "200"
  
  # Build check
  pnpm build
  # Assert: Exit code 0
  ```

  **Evidence to Capture**:
  - [ ] HTTP 200 response for Pinterestbot user agent
  - [ ] HTTP 200 response for Snapchat user agent
  - [ ] HTTP 200 response for LineBot user agent

  **Commit**: YES
  - Message: `feat(detection): add Pinterest, Snapchat, Line crawler patterns`
  - Files: `src/utils/deviceDetection.ts`
  - Pre-commit: `pnpm build`

---

- [ ] 4. Improve thumbnail fallback logic in youtubeMetadata.ts

  **What to do**:
  - Change thumbnail fallback from `maxresdefault.jpg` to `hqdefault.jpg` (more reliable, always exists)
  - Update the oEmbed success path to prefer oEmbed thumbnail_url, fallback to hqdefault
  - Update the oEmbed failure path (line 95) to use `hqdefault.jpg` instead of trying `maxresdefault.jpg`
  - Add comment explaining why hqdefault is preferred (maxresdefault doesn't exist for all videos)

  **Must NOT do**:
  - Do NOT add complex thumbnail URL validation/checking logic
  - Do NOT implement thumbnail existence verification (adds latency)
  - Do NOT change the metadata type structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple string replacement in single file
  - **Skills**: None needed
    - Straightforward URL change
  - **Skills Evaluated but Omitted**:
    - All skills unnecessary for URL string changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 5)
  - **Blocks**: Task 1
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/utils/youtubeMetadata.ts:82` - Current thumbnail_url fallback using maxresdefault.jpg (change to hqdefault)
  - `src/utils/youtubeMetadata.ts:95` - Fallback path using hqdefault.jpg (keep this, verify consistency)

  **External References**:
  - YouTube thumbnail URLs: `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg` (480x360, always exists)
  - maxresdefault.jpg (1280x720) - only exists for videos uploaded in HD

  **WHY Each Reference Matters**:
  - youtubeMetadata.ts:82: Primary location to change - currently uses maxresdefault which may 404
  - youtubeMetadata.ts:95: Already uses hqdefault - ensure consistency

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Verify thumbnail URL in metadata response uses hqdefault
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" | grep -o 'og:image" content="[^"]*' | grep -q "hqdefault.jpg"
  # Assert: If oEmbed fails, hqdefault.jpg is used (may need invalid video test)
  
  # Test with old/non-HD video that might not have maxresdefault
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=jNQXAC9IVRw" | grep 'og:image'
  # Assert: Returns valid thumbnail URL (hqdefault.jpg)
  
  # Build check
  pnpm build
  # Assert: Exit code 0
  ```

  **Evidence to Capture**:
  - [ ] Thumbnail URL contains hqdefault.jpg for fallback cases
  - [ ] Build succeeds

  **Commit**: YES
  - Message: `fix(metadata): use hqdefault.jpg as reliable thumbnail fallback`
  - Files: `src/utils/youtubeMetadata.ts`
  - Pre-commit: `pnpm build`

---

- [ ] 5. Rewrite redirect/page.tsx with button-only approach (no auto-redirect)

  **What to do**:
  - Remove all useEffect auto-redirect logic (lines 15-40)
  - Remove loading state entirely - button should be visible immediately on page load
  - Keep the existing button UI and styling (minimal changes to design)
  - Simplify to single state: just render the button
  - On button click: try app scheme, then fallback to web URL
  - Implement fallback using setTimeout pattern:
    ```typescript
    const handleOpenApp = () => {
      const appUrl = platform === "ios" ? iosScheme : androidIntent;
      const webFallback = webUrl;
      
      // Try to open app
      window.location.href = appUrl;
      
      // If still here after delay, app didn't open - go to web
      setTimeout(() => {
        window.location.href = webFallback;
      }, 1500);
    };
    ```
  - Keep the "브라우저에서 계속하기" link as secondary option

  **Must NOT do**:
  - Do NOT add loading spinner or "loading" state
  - Do NOT attempt auto-redirect on page mount
  - Do NOT add video thumbnail preview (user wants minimal)
  - Do NOT add "app not installed" detection or messaging
  - Do NOT change the overall visual design (keep red button, YouTube icon)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Client-side React component with user interaction and browser behavior
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Ensures clean, minimal UI implementation as user requested
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during implementation, only verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/app/redirect/page.tsx:52-94` - Current UI layout and styling (preserve this visual design)
  - `src/app/redirect/page.tsx:74-82` - Button component styling (keep exactly as-is)
  - `src/app/redirect/page.tsx:42-50` - Current handleManualOpen function (base for new handler)

  **API/Type References**:
  - `src/app/redirect/page.tsx:10-13` - URL parameter extraction (keep this pattern)

  **External References**:
  - Spotify/TikTok landing pages: Button-first approach, no auto-redirect, clean minimal UI

  **WHY Each Reference Matters**:
  - page.tsx:52-94: Visual design to preserve - user wants minimal but this existing design is good
  - page.tsx:74-82: Exact button styling to keep unchanged
  - page.tsx:42-50: Starting point for the new click handler logic

  **Acceptance Criteria**:

  **Automated Verification (Playwright browser automation)**:
  ```
  # Agent executes via playwright skill:
  1. Navigate to: http://localhost:3000/redirect?web=https://youtube.com/watch?v=test&android=intent://test&ios=youtube://test&platform=android
  2. Wait for: page load complete (no loading spinner should appear)
  3. Assert: Button with text "앱으로 열기" is visible immediately
  4. Assert: No element with class "animate-spin" exists (no loading spinner)
  5. Assert: No text "앱을 실행하는 중..." visible
  6. Screenshot: .sisyphus/evidence/task-5-button-visible.png
  
  # Verify button is clickable (don't actually click - would navigate away)
  7. Assert: Button is enabled and clickable
  8. Assert: Link "브라우저에서 계속하기" is visible
  ```

  **Build Verification**:
  ```bash
  pnpm build
  # Assert: Exit code 0, no type errors
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing button visible immediately (no spinner)
  - [ ] Build succeeds without errors

  **Commit**: YES
  - Message: `refactor(redirect): remove auto-redirect, show button immediately for in-app browser compatibility`
  - Files: `src/app/redirect/page.tsx`
  - Pre-commit: `pnpm build`

---

- [ ] 6. Integration testing and final verification

  **What to do**:
  - Verify all OG metadata displays correctly for various crawlers
  - Verify redirect page works in simulated mobile environment
  - Run final build to ensure no regressions
  - Test edge cases: invalid video IDs, shorts URLs, playlist URLs

  **Must NOT do**:
  - Do NOT make code changes in this task
  - Do NOT skip any verification step

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: [`playwright`]
    - `playwright`: Required for browser-based verification of redirect page
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No design work, just testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 5

  **References**:

  **Test URLs to verify**:
  - Video: `http://localhost:3000/watch?v=dQw4w9WgXcQ`
  - Shorts: `http://localhost:3000/shorts/someShortId`
  - Playlist: `http://localhost:3000/playlist?list=PLxxxxxxx`
  - Invalid: `http://localhost:3000/watch?v=INVALID123`

  **Acceptance Criteria**:

  **Crawler Verification (curl)**:
  ```bash
  # Facebook crawler - should get HTML with all OG tags
  curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" > /tmp/og-test.html
  grep -q 'og:title' /tmp/og-test.html && \
  grep -q 'og:description' /tmp/og-test.html && \
  grep -q 'og:image' /tmp/og-test.html && \
  grep -q 'og:video:url' /tmp/og-test.html && \
  grep -q 'rel="canonical"' /tmp/og-test.html
  # Assert: All greps succeed (exit code 0)
  
  # Pinterest crawler
  curl -s -o /dev/null -w "%{http_code}" -A "Pinterestbot" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
  # Assert: 200
  
  # Invalid video still returns HTML (not redirect)
  curl -s -o /dev/null -w "%{http_code}" -A "facebookexternalhit" "http://localhost:3000/watch?v=INVALID_ID"
  # Assert: 200
  ```

  **Redirect Page Verification (Playwright)**:
  ```
  # Test 1: Button visible immediately
  1. Navigate to: http://localhost:3000/redirect?web=https://youtube.com&android=intent://test&ios=youtube://test&platform=ios
  2. Assert: Button "앱으로 열기" visible within 500ms
  3. Assert: No loading spinner
  4. Screenshot: .sisyphus/evidence/task-6-ios-button.png
  
  # Test 2: Android platform
  5. Navigate to: http://localhost:3000/redirect?web=https://youtube.com&android=intent://test&ios=youtube://test&platform=android
  6. Assert: Text shows "Android 앱으로 이동합니다"
  7. Screenshot: .sisyphus/evidence/task-6-android-button.png
  ```

  **Final Build**:
  ```bash
  pnpm build
  # Assert: Exit code 0
  
  pnpm lint
  # Assert: Exit code 0
  ```

  **Evidence to Capture**:
  - [ ] HTML output with all required OG tags
  - [ ] Screenshots of redirect page for iOS and Android
  - [ ] Build and lint success logs

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `feat(html): add og:video tags and canonical link for rich social previews` | htmlGenerator.ts | `pnpm build` |
| 3 | `feat(detection): add Pinterest, Snapchat, Line crawler patterns` | deviceDetection.ts | `pnpm build` |
| 4 | `fix(metadata): use hqdefault.jpg as reliable thumbnail fallback` | youtubeMetadata.ts | `pnpm build` |
| 5 | `refactor(redirect): remove auto-redirect, show button immediately for in-app browser compatibility` | redirect/page.tsx | `pnpm build` |
| 1 | `fix(route): return fallback HTML for crawlers when metadata fetch fails` | route.ts | `pnpm build` |

---

## Success Criteria

### Verification Commands
```bash
# Crawler gets HTML with OG tags (not redirect)
curl -s -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ" | head -50
# Expected: HTML with og:title, og:image, og:video:url, canonical

# HTTP 200 for crawler (not 302)
curl -s -o /dev/null -w "%{http_code}" -A "facebookexternalhit" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
# Expected: 200

# Desktop gets redirect
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/watch?v=dQw4w9WgXcQ"
# Expected: 302

# Build succeeds
pnpm build
# Expected: Exit 0
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] Fallback HTML for crawlers when API fails
  - [ ] og:video tags in HTML response
  - [ ] Button-only UI (no auto-redirect)
  - [ ] User gesture triggers app open
- [ ] All "Must NOT Have" absent:
  - [ ] No auto-redirect on page load
  - [ ] No loading spinner
  - [ ] Desktop behavior unchanged
  - [ ] No retry logic added
- [ ] Build and lint pass
