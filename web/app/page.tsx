import { Suspense } from "react";

import { SearchBar } from "~/components/SearchBar";
import { SearchResults, SearchResultsSkeleton } from "~/components/SearchResults";
import { TrendingGrid } from "~/components/TrendingGrid";
import { getTrendingMovies } from "~/lib/api";

// Renders per-request rather than being statically generated at build time,
// since this page depends on the .NET API being reachable — which it isn't
// during `next build` in CI.
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ query?: string | string[]; page?: string | string[] }>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = first(params.query)?.trim() ?? "";
  const page = parsePage(first(params.page));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Movie Search Case
        </h1>
        <SearchBar />
      </header>

      {query ? (
        <section aria-labelledby="search-heading" className="flex flex-col gap-4">
          <h2 id="search-heading" className="text-lg font-medium text-foreground">
            Search results
          </h2>
          {/* Keyed so the fallback shows again for every new query/page, not just the first. */}
          <Suspense key={`${query}:${page}`} fallback={<SearchResultsSkeleton />}>
            <SearchResults query={query} page={page} />
          </Suspense>
        </section>
      ) : (
        <TrendingSection />
      )}
    </main>
  );
}

async function TrendingSection() {
  const trendingMovies = await getTrendingMovies();

  return (
    <section aria-labelledby="trending-heading" className="flex flex-col gap-4">
      <h2 id="trending-heading" className="text-lg font-medium text-foreground">
        Trending this week
      </h2>
      <TrendingGrid movies={trendingMovies} />
    </section>
  );
}
