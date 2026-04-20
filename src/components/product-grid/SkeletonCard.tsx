import { memo } from "react";

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#1e1e1e]">
      <div className="aspect-square w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-5 w-1/3 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-9 w-9 rounded-full bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  );
});
