import Image from "next/image";
import Link from "next/link";
import { tv } from "tailwind-variants";

import type { Movie } from "~/types/movie";

const card = tv({
  slots: {
    base: "group block h-full overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
    posterWrapper: "relative aspect-[2/3] w-full bg-surface",
    body: "flex flex-col gap-1 p-3",
    title: "line-clamp-1 text-sm font-medium text-foreground",
    meta: "flex items-center gap-2 text-xs text-muted",
  },
});

const { base, posterWrapper, body, title, meta } = card();

export interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  return (
    <Link href={`/movies/${movie.id}`} className={base()}>
      <article>
        <div className={posterWrapper()}>
          {movie.posterPath ? (
            // Decorative: the title is right below, so an alt would just be read twice.
            <Image
              src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
              alt=""
              fill
              sizes="(min-width: 1024px) 200px, 45vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No poster
            </div>
          )}
        </div>
        <div className={body()}>
          <h3 className={title()}>{movie.title}</h3>
          <div className={meta()}>
            {year && <span>{year}</span>}
            <span
              aria-label={`Rated ${movie.voteAverage.toFixed(1)} out of 10`}
            >
              ★ {movie.voteAverage.toFixed(1)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
