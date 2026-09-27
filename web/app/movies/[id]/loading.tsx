export default function Loading() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <p role="status" className="sr-only">
        Loading movie…
      </p>
      <div aria-hidden="true" className="flex flex-col gap-8">
        <div className="h-5 w-32 animate-pulse rounded bg-surface" />
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="aspect-[2/3] w-48 shrink-0 animate-pulse rounded-lg bg-surface" />
          <div className="flex w-full flex-col gap-3">
            <div className="h-9 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-surface" />
            <div className="h-24 w-full max-w-2xl animate-pulse rounded bg-surface" />
          </div>
        </div>
        <div className="aspect-video w-full max-w-4xl animate-pulse rounded-lg bg-surface" />
      </div>
    </main>
  );
}
