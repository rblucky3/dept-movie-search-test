import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError, getMovieDetails } from "~/lib/api";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Fetches the movie, turning an unknown id into the not-found page. */
async function loadMovie(rawId: string) {
  const id = parseId(rawId);
  if (id === null) notFound();

  try {
    return await getMovieDetails(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await loadMovie(id);

  return {
    title: `${movie.title} · Movie Search Case`,
    description: movie.overview ?? undefined,
  };
}

function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await loadMovie(id);

  const year = movie.releaseDate?.slice(0, 4);
  const facts = [
    year,
    movie.runtime ? formatRuntime(movie.runtime) : null,
    movie.genres.length > 0 ? movie.genres.join(", ") : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Link
        href="/"
        className="self-start text-sm text-brand-400 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        <span aria-hidden="true">←</span> Back to movies
      </Link>

      <article className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
            {movie.posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                alt={`Poster for ${movie.title}`}
                fill
                sizes="192px"
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                No poster
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-foreground">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-muted italic">{movie.tagline}</p>
            )}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
              <span
                className="text-accent-400"
                aria-label={`Rated ${movie.voteAverage.toFixed(1)} out of 10`}
              >
                ★ {movie.voteAverage.toFixed(1)}
              </span>
            </p>
            {movie.overview && (
              <p className="max-w-2xl leading-relaxed text-foreground">
                {movie.overview}
              </p>
            )}
          </div>
        </div>

        <section aria-labelledby="trailer-heading" className="flex flex-col gap-4">
          <h2 id="trailer-heading" className="text-lg font-medium text-foreground">
            Trailer
          </h2>
          {movie.youTubeTrailerKey ? (
            <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-surface">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(movie.youTubeTrailerKey)}`}
                title={`${movie.title} trailer`}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <p className="text-sm text-muted">
              No trailer is available for this movie.
            </p>
          )}
        </section>
      </article>
    </main>
  );
}
