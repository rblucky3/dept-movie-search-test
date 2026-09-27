import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SEARCH_DEBOUNCE_MS, SearchBar } from "./SearchBar";

const push = vi.fn();
const replace = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/",
  useSearchParams: () => currentSearchParams,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    push.mockReset();
    replace.mockReset();
    currentSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has an accessible label", () => {
    render(<SearchBar />);

    expect(
      screen.getByRole("searchbox", { name: "Search for a movie" }),
    ).toBeInTheDocument();
  });

  it("prefills the input from the URL", () => {
    currentSearchParams = new URLSearchParams({ query: "alien" });
    render(<SearchBar />);

    expect(screen.getByRole("searchbox")).toHaveValue("alien");
  });

  it("searches once after the user stops typing", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "ma" } });
    fireEvent.change(input, { target: { value: "matrix" } });
    expect(replace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/?query=matrix");
  });

  it("searches immediately on submit and cancels the pending debounce", () => {
    render(<SearchBar />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "  blade runner " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(push).toHaveBeenCalledWith("/?query=blade+runner");
    expect(replace).not.toHaveBeenCalled();
  });

  it("returns to trending when the query is cleared", () => {
    currentSearchParams = new URLSearchParams({ query: "alien" });
    render(<SearchBar />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    fireEvent.submit(screen.getByRole("search"));

    expect(push).toHaveBeenCalledWith("/");
  });
});
