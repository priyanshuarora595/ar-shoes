export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex items-center gap-3 text-zinc-500">
        <span className="h-4 w-4 rounded-full border-2 border-zinc-700 border-t-orange-500 animate-spin" />
        <span className="text-sm font-medium">Loading product...</span>
      </div>
    </div>
  );
}
