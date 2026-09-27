import { MovieCard } from "~/components/MovieCard";
import type { Movie } from "~/types/movie";

export const movieGridClassName =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

export interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <ul className={movieGridClassName}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={movieGridClassName} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-[2/3] w-full animate-pulse rounded-lg bg-surface"
        />
      ))}
    </div>
  );
}
