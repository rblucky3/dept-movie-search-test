import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getPageItems, Pagination } from "./Pagination";

describe("getPageItems", () => {
  it("shows every page when there are only a few", () => {
    expect(getPageItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("collapses distant pages into ellipses around the current page", () => {
    expect(getPageItems(6, 20)).toEqual([1, "ellipsis", 5, 6, 7, "ellipsis", 20]);
  });

  it("shows a single hidden page instead of an ellipsis", () => {
    expect(getPageItems(4, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
  });
});

describe("Pagination", () => {
  const hrefForPage = (page: number) => `/?query=matrix&page=${page}`;

  it("renders nothing for a single page", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} hrefForPage={hrefForPage} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("marks the current page and links to neighbours", () => {
    render(
      <Pagination currentPage={3} totalPages={10} hrefForPage={hrefForPage} />,
    );

    expect(screen.getByRole("navigation")).toHaveAccessibleName(
      "Search results pages",
    );
    expect(screen.getByRole("link", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "/?query=matrix&page=2",
    );
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "href",
      "/?query=matrix&page=4",
    );
  });

  it("disables previous on the first page", () => {
    render(
      <Pagination currentPage={1} totalPages={5} hrefForPage={hrefForPage} />,
    );

    expect(
      screen.queryByRole("link", { name: /previous/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/previous/i)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
