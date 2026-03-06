# Firebase Deployment Technical Post-Mortem

**Date:** March 4, 2026
**Project:** Vualiku XP (Monorepo with `tourist` and `admin` Next.js applications)

## 1. Executive Summary
The goal was to deploy the Vualiku XP monorepo—consisting of a `tourist` application, an `admin` application, and a `@vualiku/shared` local package—to Firebase Hosting. 

While the local development environment, project refactoring, and local builds succeed flawlessly, the actual deployment to Firebase Hosting via the Firebase CLI has consistently failed. The root cause is a fundamental incompatibility between npm Workspaces (our monorepo structure) and how Firebase Web Frameworks attempts to execute isolated builds in the cloud.

## 2. What Worked
*   **Monorepo Refactoring:** Successfully migrated shared logic, database schemas, server initialization, and utility functions into the `@vualiku/shared` local package.
*   **Local Builds:** Running `npm run build` from the monorepo root successfully compiles both the `tourist` and `admin` applications.
*   **Dependency Management (Locally):** Resolving peer dependency conflicts (`ERESOLVE`) was successfully managed locally.
*   **Firestore & Indexes:** Successfully deployed all Firestore security rules and composite indexes to the Firebase project.

## 3. What Failed & The Steps Taken
The core issue stems from Firebase's "Web Frameworks" feature (the `source` directive in `firebase.json`). When deploying, Firebase detects Next.js, packages the source code, sends it to Google Cloud Build, and attempts to run `npm install` from *within* the application subdirectory (e.g., `apps/tourist`). Because it is inside an npm workspace, npm demands the root context, which Firebase's isolated build container fails to provide correctly, resulting in persistent `ENOWORKSPACES` errors.

Here is the chronological sequence of attempted fixes and why they failed:

### Attempt 1: Standard Firebase Web Frameworks Deploy
*   **Action:** Configured `firebase.json` with `"source": "apps/tourist"` and `"source": "apps/admin"`, then ran `firebase deploy`.
*   **Result (Failed):** Firebase cloud build failed with `ERESOLVE` (peer dependency conflicts) and later `ENOWORKSPACES`. The build container attempted to run `npm install` inside the subdirectory without understanding the parent workspace, causing it to crash.

### Attempt 2: Propagating `.npmrc` Rules
*   **Action:** Created local `.npmrc` files inside `apps/tourist` and `apps/admin` with `legacy-peer-deps=true` to force the cloud build to bypass dependency conflicts.
*   **Result (Failed):** While it bypassed `ERESOLVE`, it immediately hit the `ENOWORKSPACES` error.

### Attempt 3: Static HTML Export (`output: 'export'`)
*   **Action:** Attempted to bypass Firebase Cloud Build entirely by changing `next.config.js` to `output: 'export'`. This would generate static HTML/CSS/JS that could be deployed to standard Firebase Hosting via the `"public"` directory.
*   **Result (Failed):** 
    *   The `admin` app could theoretically be exported (if it lacked API routes).
    *   The `tourist` app *failed* because it heavily relies on Next.js API Route Handlers (`app/api/...` for checkouts, webhooks, generic endpoints). Next.js API routes require a running Node.js server and cannot be statically exported.

### Attempt 4: Next.js Standalone Output (`output: 'standalone'`)
*   **Action:** Reverted the static export and configured Next.js to use `output: 'standalone'`. This feature creates a highly optimized, self-contained Node.js server within the `.next/standalone` folder, theoretically allowing Firebase to just wrap and run it without needing to run `npm install` itself.
*   **Result (Failed):** The standalone build process itself failed locally with `ENOWORKSPACES`. Next.js attempts to trace dependencies (like the local `@vualiku/shared` package) and copies them. Because it triggers an internal install process during tracing that lacks workspace context, it crashed.
*   **Follow-up Action:** Attempted to fix the standalone trace by explicitly setting the root: `experimental: { outputFileTracingRoot: require('path').join(__dirname, '../../') }`.
*   **Result (Failed):** The build still failed, as Next.js 15 handles monorepo tracing differently and still relies on isolated installs that break in our setup.

### Attempt 5: Firebase Experimental Monorepo Flags
*   **Action:** Attempted to use Firebase's undocumented experimental support for monorepos by injecting environment variables (`FIREBASE_FRAMEWORKS_BUILD_TARGET="admin"`).
*   **Result (Failed):** Native PowerShell injection failed due to syntax processing errors. Using `cross-env` to inject the variables caused the Firebase CLI to fail entirely with a core spawn error (`spawn npm ENOENT`), indicating `cross-env` was interfering with Firebase's internal executable spawning on Windows.

### Attempt 6: Forcing Workspace Ignorance (`npm_config_workspaces=false`)
*   **Action:** Attempted to inject the `npm_config_workspaces=false` environment variable during deployment, theoretically forcing npm to ignore the fact that it's in a workspace and just install the dependencies blindly.
*   **Result (Failed):** Resulted in the same `spawn npm ENOENT` error on Windows.

## 4. Where We Are Now (Current State)
Currently, the codebase is perfectly functional locally. If you run `npm run dev:tourist` or `npm run dev:admin`, the applications work, communicate with the shared package, and interface with the production Firebase database correctly.

**The Blocker:**
We are completely blocked from deploying the Next.js applications to Firebase Hosting using standard methods because the Firebase Web Frameworks build pipeline cannot handle the npm Sub-Workspace + Shared Local Package architecture.

**Potential Next Steps & Alternatives:**
To get this live, we must abandon the "magic" Firebase Web Frameworks (`source` directive in `firebase.json`) and pivot to a manual deployment strategy:

1.  **Manual Cloud Run Deployment (Recommended for Monorepos):**
    Instead of Firebase Hosting, we write a `Dockerfile` for the monorepo root, build Docker images containing the Next.js apps, and deploy them directly to Google Cloud Run. Firebase Hosting can then be configured to route requests directly to these Cloud Run instances. This entirely bypasses Firebase's flawed internal build system because we handle the build explicitly.
2.  **Custom Firebase Functions Wrap (Complex):**
    We write a manual script that builds the application locally, zips the `.next` output along with a custom `package.json`, and deploys it as a standard Firebase Cloud Function (essentially doing manually what Web Frameworks is failing to do automatically).
3.  **Vercel Deployment (Easiest):**
    Vercel natively supports Next.js monorepos flawlessly. We could deploy the Next.js frontends to Vercel (which takes minutes), while leaving the database, auth, and storage on Firebase.

**Recommendation:** If keeping everything strictly inside Google Cloud is a requirement, pivoting to **Google Cloud Run via Docker** is the most robust and professional solution for this monorepo structure. If speed of deployment is the priority, deploying the frontends to **Vercel** will solve this instantly.
