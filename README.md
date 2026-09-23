# Product Admin Dashboard

A production-quality **React.js + Vite** admin dashboard for managing a product catalog, built against the free [DummyJSON](https://dummyjson.com) API.

---

## 1. Project Overview

This is a frontend-only admin dashboard that lets an authenticated user browse, search, filter, sort, view, create, edit, and delete products from the DummyJSON product catalog. It was built as a frontend developer assignment, with a strong emphasis on **hand-written** core logic (pagination, debouncing, sorting, URL state, request cancellation) rather than relying on third-party libraries for these concerns.

## 2. Features

- Username/password authentication against DummyJSON, with token persistence and protected routes
- Product list with a responsive **table on desktop** and **cards on mobile**
- Manually implemented pagination (page numbers, Previous/Next, page-size selector, "Showing X–Y of Z")
- Debounced search (500ms) with **request cancellation** to prevent race conditions
- Category filtering
- Sorting by price, rating, or title (ascending/descending)
- Full URL state (page, limit, search, category, sortBy, order) — shareable and refresh-safe
- Defensive handling of invalid/out-of-range URL parameters
- Product details page with an image gallery and reviews
- Add / Edit product forms with client-side validation
- Delete with a confirmation modal
- Loading, empty, and error states everywhere data is fetched
- Multiple-click / duplicate-submission protection on Login, Save, and Delete
- Fully responsive, accessible, and recruiter-friendly UI built with Tailwind CSS

## 3. Tech Stack

- React 18 + Vite
- JavaScript (JSX) — no TypeScript
- Tailwind CSS
- Axios (single shared instance)
- React Router DOM v6
- React Context API (authentication)
- Lucide React (icons)

**Explicitly not used:** React Query/SWR, Redux Toolkit, any ready-made table library, any ready-made pagination library. Pagination, filtering, sorting, debouncing, and URL-state logic are all hand-written.

## 4. Folder Structure

```
product-admin-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/                 # All Axios calls live here (never in components)
│   │   ├── axios.js          # Single shared Axios instance + interceptors
│   │   ├── authApi.js
│   │   └── productApi.js
│   ├── assets/
│   ├── components/
│   │   ├── common/            # Loader, ErrorMessage, EmptyState, ConfirmModal, ProtectedRoute
│   │   ├── layout/             # Navbar, DashboardLayout
│   │   └── products/           # Table, Card, Filters, SearchBar, Pagination, Form, Reviews
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   └── useProducts.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── AddProduct.jsx
│   │   ├── EditProduct.jsx
│   │   └── NotFound.jsx
│   ├── utils/
│   │   ├── storage.js
│   │   ├── urlParams.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── App.jsx               # Routing only
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
└── vite.config.js
```

## 5. Installation

```bash
npm install
```

## 6. How to Run

```bash
npm run dev
```

The app will start on `http://localhost:5173`. Build for production with `npm run build`, and preview the production build with `npm run preview`.

## 7. API Endpoints Used

| Purpose | Endpoint |
|---|---|
| Login | `POST /auth/login` |
| List products | `GET /products?limit=&skip=&sortBy=&order=` |
| Search products | `GET /products/search?q=&limit=&skip=&sortBy=&order=` |
| Categories | `GET /products/categories` |
| Products by category | `GET /products/category/{category}?limit=&skip=&sortBy=&order=` |
| Product details | `GET /products/:id` |
| Add product | `POST /products/add` |
| Update product | `PUT /products/:id` |
| Delete product | `DELETE /products/:id` |

## 8. Authentication Details

- Login uses `emilys` / `emilyspass` (DummyJSON's documented test user).
- On success, the returned token and user profile are stored in `localStorage` via `src/utils/storage.js` (`getAuthData` / `setAuthData` / `clearAuthData`).
- `AuthContext` exposes `user`, `token`, `isAuthenticated`, `login()`, and `logout()`.
- `ProtectedRoute` wraps every `/products*` route and redirects unauthenticated users to `/login`, preserving the originally requested location.
- The shared Axios instance automatically attaches `Authorization: Bearer <token>` to every outgoing request via a request interceptor.
- A response interceptor detects `401` responses, clears stored auth data, and normalizes the error so the UI can react (the next route render redirects to `/login`).
- Logout clears storage and redirects to `/login`.

## 9. Pagination Explanation

Pagination is implemented entirely by hand in `Pagination.jsx` and `useProducts.js`:

- The app tracks `page` (1-indexed) and `limit` (10/20/50) in the URL.
- Before each fetch, `skip` is computed as `(page - 1) * limit` and passed to DummyJSON.
- The "Showing X–Y of Z" text is computed from `page`, `limit`, and the `total` returned by the API.
- Page-number buttons are generated with a compact windowing algorithm (first, last, current ± 1, with `…` for gaps).
- Previous is disabled on page 1; Next is disabled on the last page (`Math.ceil(total / limit)`).

## 10. Search Debounce Explanation

`useDebounce(value, delay)` (in `src/hooks/useDebounce.js`) returns a value that only updates after the input has been stable for `delay` milliseconds (500ms by default). The `Products` page keeps a fast-updating local `searchInput` state for a responsive typing experience, and only pushes the **debounced** value into the URL (and therefore into the fetch), so keystrokes never trigger a network request per character.

## 11. Request Cancellation Explanation

Every product-fetching function in `productApi.js` accepts an `AbortSignal`. `useProducts.js`:

1. Keeps a `ref` to the `AbortController` of the most recent request.
2. Aborts the previous controller before issuing a new request whenever the filter/sort/pagination state changes.
3. Additionally tags each request with an incrementing `requestId` and ignores any response whose id is no longer the latest — this is a second line of defense so that even if an abort doesn't fully prevent a response (e.g. it was already in flight), a stale response can never overwrite newer results.

This was specifically tested against DummyJSON's `&delay=` parameter to confirm that a slow, superseded request never overwrites a faster, newer one.

## 12. Category + Search Limitation

**DummyJSON does not provide a combined "search + category" endpoint.** This application defines and follows an explicit, documented resolution order:

1. If a search term is active → use `GET /products/search?q=`.
2. Else if a category is selected → use `GET /products/category/{category}`.
3. Else → use `GET /products`.

To avoid implying a capability the API doesn't have, the category dropdown is **disabled while a search is active**, and a short explanatory note is shown in the UI. Clearing the search re-enables category filtering.

## 13. Add / Edit / Delete DummyJSON Limitation

**DummyJSON simulates product mutations and does not permanently persist changes.** `POST /products/add`, `PUT /products/:id`, and `DELETE /products/:id` all return a realistic-looking successful response, but the underlying dataset is not actually modified server-side — a subsequent `GET /products` or `GET /products/:id` will not reflect the change (an added product's new id won't even resolve, and an edited/deleted product will come back exactly as it was before).

To make the app behave correctly during a session despite this, all product mutations are tracked in a session-wide store (`src/context/ProductStoreContext.jsx`, provided at the app root) rather than being pushed into any single page's local state. This matters because a page-local "remove this from my array" approach breaks the moment the user navigates away and back, or performs the mutation from a different page (e.g. deleting from the product details page vs. the list page). The store instead becomes the single source of truth for the current session:

- **Add:** after `POST /products/add` succeeds, the returned product is registered in the store. Since the new id doesn't really exist on the server, the app serves that product directly from the store everywhere it's needed (the details page it redirects to, and the product list) instead of trying to re-fetch it.
- **Edit:** after a successful `PUT`, the changed fields are recorded in the store, keyed by product id. Any page rendering that product — the details page, the edit form, the list/table/cards — merges these fields on top of whatever DummyJSON returns (or on top of the locally-added product, if it was created this session).
- **Delete:** after a successful `DELETE`, the id is recorded in the store's "deleted" set. Every product list fetch and detail lookup filters against this set, so a deleted product disappears everywhere immediately and stays gone even after navigating around, changing filters, or refetching.

This application updates its local UI state after successful mutation responses so that changes are immediately visible and consistent across the whole app during the current session, but it does **not** claim that DummyJSON permanently saves the changes — a hard refresh (or a new session) will show the original, unmodified DummyJSON data again.

## 14. URL State Explanation

`page`, `limit`, `search`, `category`, `sortBy`, and `order` are all stored as query parameters using React Router's `useSearchParams`. `src/utils/urlParams.js` centralizes reading and building this state:

- `readProductListState(searchParams)` parses and sanitizes every parameter in one call.
- `buildSearchParamsObject(state)` turns validated state back into a clean query-string object (omitting empty values).

Refreshing the page or opening a shared link reproduces the exact same list state, because the `Products` page derives all of its fetch parameters from the URL rather than from separate component state.

## 15. Invalid URL Handling

All URL parameters are validated defensively in `urlParams.js`:

- `page`: must be a positive integer; otherwise falls back to `1`. If the requested page exceeds the number of available pages (once the API responds with a `total`), the app automatically clamps to the last valid page and updates the URL.
- `limit`: must be one of `10`, `20`, `50`; otherwise falls back to the default (`10`).
- `sortBy`: must be one of `price`, `rating`, `title`; otherwise falls back to `title`.
- `order`: must be `asc` or `desc`; otherwise falls back to `asc`.
- `search` / `category`: free text, trimmed; no special validation needed since they're passed straight to the API as query params.

The application never crashes on malformed input such as `?page=abc`, `?page=-10`, `?page=999999`, `?limit=hello`, `?limit=999`, or `?order=random`.

## 16. Testing Instructions

Manual test checklist (matches the assignment's final quality checklist):

1. **Auth:** try logging in with `emilys` / `emilyspass` (success) and with wrong credentials (friendly error). Refresh the page — you should stay logged in. Click Logout — you should be redirected to `/login` and blocked from `/products`.
2. **List / Pagination:** change page size, navigate pages, confirm "Showing X–Y of Z" is correct, confirm Previous/Next disable correctly at the boundaries.
3. **Search:** type quickly — confirm only one request fires after you stop typing. Try DummyJSON's `&delay=2000` behavior by throttling your network in DevTools and quickly changing the search term twice — confirm the older, slower response never overwrites the newer one.
4. **Category filter:** select a category, confirm results update and the URL reflects it. Start typing a search and confirm the category dropdown disables.
5. **Sorting:** sort by price/rating/title, toggle ascending/descending, confirm the URL and results update.
6. **URL state:** copy a URL with several params set, open it in a new tab, confirm the same state is reproduced. Try malformed URLs (`?page=abc`, `?limit=999`, etc.) and confirm the app doesn't crash.
7. **Details / Reviews:** open a product, confirm the gallery, details, and reviews render. Visit `/products/999999` and confirm a "Product not found." state.
8. **Add / Edit / Delete:** create a product (validation errors first, then success), edit an existing product, delete a product with the confirmation modal — confirm the UI updates immediately in each case.
9. **Resilience:** disable your network and retry an action — confirm a friendly error message and a working Retry button.
10. **Responsive:** resize the browser / use DevTools device mode to confirm the table becomes cards on mobile with no horizontal overflow.

## 17. Future Improvements

- Add automated tests (unit tests for `urlParams.js`/`validators.js`, integration tests for the product list flow)
- Add optimistic UI updates with rollback on failure
- Add bulk actions (multi-select delete)
- Add a dedicated toast/notification system instead of inline success/error banners
- Persist added/edited/deleted products in a mock backend (e.g. `json-server`) for a more realistic persistence story
- Add column-level sorting directly from the table headers
- Add dark mode
