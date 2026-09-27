import { MovieGrid } from "~/components/MovieGrid";
import type { Movie } from "~/types/movie";

export interface TrendingGridProps {
  movies: Movie[];
}

export function TrendingGrid({ movies }: TrendingGridProps) {
  if (movies.length === 0) {
    return <p className="text-sm text-muted">No trending movies right now.</p>;
  }

  return <MovieGrid movies={movies} />;
}
