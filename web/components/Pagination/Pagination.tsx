import Link from "next/link";
import { tv } from "tailwind-variants";

const pageLink = tv({
  base: "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
  variants: {
    state: {
      default:
        "border-border bg-surface text-foreground hover:bg-surface-hover",
      current: "border-brand-600 bg-brand-600 font-medium text-white",
      disabled: "cursor-not-allowed border-border bg-surface text-muted opacity-50",
    },
  },
  defaultVariants: { state: "default" },
});

export type PageItem = number | "ellipsis";

/**
 * Returns a compact page window, e.g. for page 6 of 20:
 * [1, "ellipsis", 5, 6, 7, "ellipsis", 20].
 */
export function getPageItems(
  currentPage: number,
  totalPages: number,
  siblings = 1,
): PageItem[] {
  const pages = new Set<number>([1, totalPages]);
  for (
    let page = currentPage - siblings;
    page <= currentPage + siblings;
    page++
  ) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) {
      // Showing a lone hidden page is more useful than an ellipsis standing in for it.
      items.push(page - previous === 2 ? previous + 1 : "ellipsis");
    }
    items.push(page);
  });

  return items;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Builds the href for a given page number. */
  hrefForPage: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Search results pages">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {hasPrevious ? (
            <Link
              href={hrefForPage(currentPage - 1)}
              className={pageLink()}
              rel="prev"
            >
              <span aria-hidden="true">←</span>&nbsp;Previous
            </Link>
          ) : (
            <span aria-disabled="true" className={pageLink({ state: "disabled" })}>
              <span aria-hidden="true">←</span>&nbsp;Previous
            </span>
          )}
        </li>

        {getPageItems(currentPage, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefForPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
                className={pageLink({
                  state: item === currentPage ? "current" : "default",
                })}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {hasNext ? (
            <Link
              href={hrefForPage(currentPage + 1)}
              className={pageLink()}
              rel="next"
            >
              Next&nbsp;<span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span aria-disabled="true" className={pageLink({ state: "disabled" })}>
              Next&nbsp;<span aria-hidden="true">→</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
