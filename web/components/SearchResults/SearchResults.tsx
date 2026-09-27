import Link from "next/link";

import { MovieGrid, MovieGridSkeleton } from "~/components/MovieGrid";
import { Pagination } from "~/components/Pagination";
import { ApiError, searchMovies } from "~/lib/api";
import type { Movie, PagedResponse } from "~/types/movie";

export function searchHref(query: string, page = 1) {
  const params = new URLSearchParams({ query });
  if (page > 1) params.set("page", String(page));
  return `/?${params}`;
}

export interface SearchResultsProps {
  query: string;
  page: number;
}

export async function SearchResults({ query, page }: SearchResultsProps) {
  let response: PagedResponse<Movie>;

  try {
    response = await searchMovies(query, page);
  } catch (error) {
    const isBadRequest = error instanceof ApiError && error.status === 400;

    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-4"
      >
        <p className="text-sm text-foreground">
          {isBadRequest
            ? "That search couldn't be run. Try a different search term or page."
            : "We couldn't load search results. The movie API might be slow or unavailable right now."}
        </p>
        {/* A plain anchor forces a fresh server request rather than a client-side no-op. */}
        <a
          href={isBadRequest ? searchHref(query) : searchHref(query, page)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          {isBadRequest ? "Back to first page" : "Try again"}
        </a>
      </div>
    );
  }

  const { results, totalResults, totalPages } = response;

  if (results.length === 0) {
    return (
      <p role="status" className="text-sm text-muted">
        {totalResults > 0 ? (
          <>
            There&apos;s no page {page} for &ldquo;{query}&rdquo;.{" "}
            <Link
              href={searchHref(query)}
              className="text-brand-400 underline hover:text-brand-100"
            >
              Go to the first page
            </Link>
            .
          </>
        ) : (
          <>No movies found for &ldquo;{query}&rdquo;. Try another title.</>
        )}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="text-sm text-muted">
        {totalResults.toLocaleString("en-US")}{" "}
        {totalResults === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
        {totalPages > 1 && ` — page ${page} of ${totalPages}`}
      </p>
      <MovieGrid movies={results} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        hrefForPage={(target) => searchHref(query, target)}
      />
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="sr-only">
        Loading search results…
      </p>
      <div className="h-5 w-56 animate-pulse rounded bg-surface" aria-hidden="true" />
      <MovieGridSkeleton />
    </div>
  );
}
