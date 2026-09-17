import React from "react";
import { Skeleton } from "@/src/components/ui/Skeleton";

export default function BookDetailLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 lg:col-span-4">
          <Skeleton className="aspect-3/4 w-full rounded-xl" />
        </div>
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
