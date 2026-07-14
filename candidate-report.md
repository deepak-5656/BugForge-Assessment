# BugForge Assessment Report

## Executive Summary
I conducted a thorough investigation of the BugForge application to identify and resolve defects spanning security vulnerabilities, functional bugs, performance bottlenecks, and operational misconfigurations. In total, 17 targeted fixes were implemented to stabilize the application without altering its core architecture or weakening its security posture.

## 1. Investigation Findings & Fixes

### 🔴 Security Vulnerabilities
1. **Credentials Logged in Plaintext:** The `auth-controller` was logging user passwords in plaintext during login attempts. I removed the password field from the `pino-http` log payload to prevent credential harvesting.
2. **Stored XSS:** Project descriptions were rendered using `dangerouslySetInnerHTML` on the dashboard. I replaced this with a standard React text node to neutralize script injection risks.
3. **Mass-Assignment:** The task update endpoint accepted the raw `req.body` and passed it directly to MongoDB, allowing arbitrary field overwrites. I secured this by piping the input through `taskSchema.partial().parse()`.
4. **Open CORS:** The API was configured to accept all origins with credentials (`origin: true`). I restricted this to standard configured origins to prevent CSRF attacks.
5. **Weak Example Secrets:** The placeholder JWT secrets in `.env.example` were shorter than the 32-character minimum enforced by `env.ts`. I updated them to demonstrate compliant, secure defaults.

### 🟠 Functional Bugs
1. **Infinite Re-render Loop:** The dashboard page contained a `useEffect` that constantly incremented a `renderVersion` state, which in turn triggered the effect again, freezing the browser tab. The useless state and effect were removed.
2. **Memory Leak:** `setInterval` for notification polling was created on mount but never cleared. I added a `clearInterval` cleanup function to the `useEffect` return block.
3. **Missing Routes:** The `updateComment` and `deleteComment` controller functions were implemented but never wired to Express routes. I added the missing `PATCH` and `DELETE` routes to `/comments/:commentId`.
4. **Incorrect HTTP Semantics:** The comment creation endpoint returned `200 OK` instead of `201 Created`. This was corrected to comply with REST conventions.
5. **Broken Error Handler:** The Express error handler middleware was missing the `next` parameter, causing Express to skip it entirely. I added `_next` to the signature.
6. **Import Hoisting Mess:** A `zod` import was placed at the very bottom of the `auth-controller`, violating conventions and confusing linters. It was hoisted to the top.

### 🟡 Performance Improvements
1. **N+1 Query Issue:** The dashboard fetched completed tasks by firing `N` individual `countDocuments` queries (one per project). This was replaced with a single `$group` aggregation pipeline, shifting complexity from O(N) queries to O(1).
2. **Stale Data:** The dashboard query had `staleTime: Infinity`, meaning it never refetched data until a hard refresh. I changed this to `30_000` (30 seconds) to balance real-time freshness with API load.

### 🟢 Operational & Testing Changes
1. **Docker Package Manager Mismatch:** The Dockerfiles were using `npm install` despite the project being a `pnpm` workspace, leading to non-reproducible builds. I updated both Dockerfiles to use `corepack enable pnpm` and `pnpm install`.
2. **Build-Time Environment Variable Timing:** `NEXT_PUBLIC_API_URL` was set as a runtime `ENV` in the web Dockerfile, which Next.js ignores at runtime for static files. I moved it to the build stage using `ARG`.
3. **CI Node Version Mismatch:** The CI workflow tested on Node 20, but the Dockerfiles deployed Node 22. I aligned the CI workflow to Node 22 to prevent environment-specific bugs.
4. **Missing Test Coverage:** I added a comprehensive test suite for all major Zod validation schemas (`projectSchema`, `taskSchema`, `loginSchema`) and unit tests for the API `respond` utility.

## 2. Verification Steps
- **Security:** Verified that logs no longer contain `password`. Confirmed HTML tags in descriptions are rendered as plain text. Tested CORS rejection.
- **Functionality:** Confirmed the dashboard loads without maxing out CPU. Navigated away from the dashboard and verified network polling stops.
- **Performance:** Monitored network requests to ensure N+1 queries were eliminated and data becomes stale after 30 seconds.
- **Automated Checks:** Ensured `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass cleanly.

## 3. Remaining Risks & Future Work
- **Rate Limiting:** The API currently lacks rate limiting, making endpoints like `/login` and `/register` vulnerable to brute-force attacks.
- **Pagination:** The `/tasks` and `/dashboard` endpoints do not implement pagination, which could lead to performance degradation as data grows.
- **Refresh Token Rotation:** The current refresh token implementation doesn't rotate tokens upon usage, leaving a window for token replay if intercepted.
