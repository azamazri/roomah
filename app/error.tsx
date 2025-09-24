// app/error.tsx — client-only, tanpa <html>/<body>
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-2">Terjadi kesalahan</h1>
      <pre className="text-sm bg-surface-1 p-3 rounded-md border border-border">
        {error.message}
      </pre>
      <button
        onClick={() => reset()}
        className="mt-4 px-3 py-2 rounded-md bg-primary text-primary-foreground focus-ring"
      >
        Muat ulang
      </button>
    </div>
  );
}
