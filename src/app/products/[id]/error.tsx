'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-zinc-50 mb-2">
          Couldn&apos;t load this product
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          The backend might be unreachable right now. {error.message}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
