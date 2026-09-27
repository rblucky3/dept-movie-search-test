import Link from "next/link";

export default function MovieNotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">
        Movie not found
      </h1>
      <p className="text-sm text-muted">
        We couldn&apos;t find a movie with that id.
      </p>
      <Link
        href="/"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        Back to movies
      </Link>
    </main>
  );
}
