"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/** How long to wait after the last keystroke before searching. */
export const SEARCH_DEBOUNCE_MS = 400;

/**
 * Search state lives in the URL (`/?query=…&page=…`), so results are
 * server-rendered, shareable, and work with the back button. This component
 * only translates typing into URL updates.
 */
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const lastNavigatedQuery = useRef(urlQuery);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the input in sync when the URL changes from outside (back/forward, links),
  // without clobbering what the user is typing after our own debounced navigation.
  useEffect(() => {
    if (urlQuery !== lastNavigatedQuery.current) {
      lastNavigatedQuery.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  function navigate(nextQuery: string, mode: "push" | "replace") {
    clearTimeout(debounceTimer.current);

    const trimmed = nextQuery.trim();
    if (trimmed === lastNavigatedQuery.current.trim()) return;
    lastNavigatedQuery.current = trimmed;

    // A new query always starts from page 1.
    const href = trimmed
      ? `${pathname}?${new URLSearchParams({ query: trimmed })}`
      : pathname;

    startTransition(() => {
      if (mode === "push") router.push(href);
      else router.replace(href);
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => navigate(nextQuery, "replace"),
      SEARCH_DEBOUNCE_MS,
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(query, "push");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full max-w-md gap-2"
    >
      <label htmlFor="movie-search" className="sr-only">
        Search for a movie
      </label>
      <input
        id="movie-search"
        type="search"
        name="query"
        value={query}
        onChange={handleChange}
        placeholder="Search for a movie…"
        autoComplete="off"
        maxLength={200}
        aria-describedby="movie-search-status"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      />
      <button
        type="submit"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        Search
      </button>
      <span id="movie-search-status" role="status" className="sr-only">
        {isPending ? "Searching…" : ""}
      </span>
    </form>
  );
}
