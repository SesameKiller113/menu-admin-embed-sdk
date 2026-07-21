# Menu Admin Embed SDK Notes

## Status

The assignment is implemented as a small npm workspace project:

- `apps/backend`: Express API with flat-file persistence for menu items.
- `apps/menu-admin`: standalone React + TypeScript menu admin app.
- `apps/restaurant-site`: separate fictional restaurant website.
- `packages/menu-admin-core`: framework-agnostic API client, shared types, and API errors.
- `packages/menu-admin-react`: thin React UI binding for the menu admin experience.
- `packages/menu-admin-sdk`: public SDK mount/unmount entry point used by the restaurant site.

Run everything together with:

```bash
npm install
npm run dev
```

The backend runs on `http://127.0.0.1:4000`, menu-admin on `http://127.0.0.1:5173`, and restaurant-site on `http://127.0.0.1:5174`.

## Key Decisions

- I used a flat JSON file instead of SQLite to keep the backend small while still persisting data across restarts.
- The public SDK API is `mountMenuAdmin(options)`, returning an `unmount()` handle. The host passes `container`, `restaurantId`, `apiBaseUrl`, optional `auth.getAccessToken`, optional `theme`, and optional `onError`.
- The SDK does not hardcode credentials. The host owns token retrieval, and the core client sends a bearer token only when `auth.getAccessToken()` returns one.
- The API client and SDK types live outside React in `menu-admin-core`, so network logic is not tied to one framework.
- The React UI lives in `menu-admin-react`, which lets both the standalone admin app and the SDK reuse the same admin experience.
- The SDK renders into a Shadow DOM. Emotion/MUI styles are inserted into the shadow root, and MUI portal components are configured to stay inside the SDK mount.
- The restaurant site integrates the SDK with a few lines of host code and keeps its own unrelated styling.

## Network And Error Behavior

The admin UI shows loading state while menu items load, disables actions while saving, and shows visible load/save errors when requests fail. The core client normalizes backend, auth, invalid JSON, and network failures. The SDK forwards normalized errors to the host through `onError`.

## What I Left Out

- The demo backend accepts an `Authorization` header but does not validate real tokens or authorize them against `restaurantId`. In production, the backend would validate the token and enforce restaurant-level access.
- I did not add retry queues, offline editing, optimistic conflict handling, or token refresh logic.
- I did not publish the SDK package or add a CDN/browser global build.
- I kept the backend and starter apps intentionally simple so the SDK packaging and embedding work stayed central.

## AI Usage

AI helped scaffold the workspace, draft tests, iterate on TypeScript errors, and spot integration issues like build order and Shadow DOM style isolation. I guided the architecture and scope: flat-file persistence, small PR-sized branches, separating core/react/sdk layers, avoiding hardcoded secrets, and leaving production auth validation out of the demo backend.
