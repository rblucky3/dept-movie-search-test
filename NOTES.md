# Submission notes

## What I built

| Priority | Item | Status |
| --- | --- | --- |
| P0 | `GET /api/v1/movies/search?query=&page=` (controller → factory → handler → service → `TmdbClient`) | Done |
| P0 | Pagination on the API: `PagedResponse<T> { results, page, totalPages, totalResults }` | Done |
| P0 | Search box wired up, results rendered with the existing `MovieCard` | Done |
| P0 | Pagination UI: prev/next and numbered pages with ellipses | Done |
| P1 | Loading, empty, error and "page out of range" states for search | Done |
| P1 | Accessibility: labelled search landmark, live-region status, `aria-current`, visible focus rings, semantic lists | Done |
| P2 | `/movies/[id]` detail page with an embedded YouTube trailer, plus loading and not-found states | Done |
| P3 | Debounced search-as-you-type; `revalidate` caching on search and detail fetches | Done |
| P3 | TV/series search | Skipped |

### API Design Decisions


- **Response shape.** Search returns a generic `PagedResponse<T>` wrapper rather than a raw array. The domain gets a matching `PagedResult<T>`, so TMDB's snake_case never reaches our consumers (same idea as the existing `TmdbModels`).
- **Validation.** The handler returns `400` ProblemDetails for an empty query, a query over 200 characters, or `page` outside 1–500. It uses the existing `MovieException(ErrorType.InvalidRequest)` path through the middleware.
- **TMDB's 500-page cap.** TMDB rejects any `page > 500` even when `total_pages` reports more (for example, "love" reports 10,000 results). So `totalPages` is capped at 500, and the UI never links to a page that would fail.
- **Detail endpoint.** `GET /api/v1/movies/{id}` uses `append_to_response=videos`, so the details and the trailer come back in one TMDB call. The trailer is picked in this order: official YouTube trailer, any YouTube trailer, YouTube teaser. A TMDB 404 maps to `EntityNotFound` (404). Anything else maps to 503.
- **Tests.** Handler tests cover mapping and validation. `TmdbClient` tests use a stub `HttpMessageHandler` and cover query URL-encoding, the page cap, trailer selection and 404 mapping.

## Rendering strategy
- **Search state lives in the URL** (`/?query=…&page=…`). That makes the page the source of truth, so results are **server-rendered**. Links are shareable, back/forward work, pagination is plain `<Link>`s that work without JS, and the browser never talks to the .NET API directly (`lib/api.ts` stays `server-only`, so there's no CORS dependency).
- **`SearchBar` is the only new client component.** It turns typing into URL updates: a 400 ms debounce with `router.replace` (so typing doesn't flood history), and `router.push` on explicit submit. It syncs back from the URL on back/forward navigation.
- **Streaming.** Results render inside a `<Suspense key={query:page}>`, so the skeleton shows on every new query or page while the header and search box stay interactive.
- **Errors are handled inline for search.** An API failure shows a retry message inside the results area instead of bubbling to `app/error.tsx`, so the user can still edit their query. Trending keeps its existing page-level loading and error handling.
- **Detail page** is a server component. `getMovieDetails` is wrapped in React `cache()`, so `generateMetadata` and the page share one request.


### Validation

The search handler returns `400 Bad Request` (`ProblemDetails`) for:

- Empty search queries
- Queries longer than 200 characters
- `page` values outside the supported range of `1–500`

- Validation errors follow the existing exception flow using:

  ```text 
- MovieException(ErrorType.InvalidRequest)


## Skipped, and why
- **TV search.** It's a parallel set of endpoints, models and UI. Under the time box I put that effort into making the movie flow solid (states, a11y, tests).
- **API-side caching** (e.g. `IMemoryCache` or output caching). The fetch-level `revalidate` in Next covers the common case. Server-side caching would be the next step if the API is slow.
- **E2E tests.** Unit and component tests cover the logic. A Playwright pass would be next.

## Notes for running locally
- The web test suite passes (`pnpm test`). On slow Windows machines Vitest's default `forks` pool can time out while starting workers. `pnpm exec vitest run --pool=threads` works around this.
