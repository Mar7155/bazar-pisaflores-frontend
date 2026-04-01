import { Search } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8 flex-1 animate-fade-in opacity-0">
      
      {/* Search Header Skeleton */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto opacity-50">
          <div className="relative flex-1">
            <div className="w-full h-12 md:h-14 rounded-full bg-muted animate-pulse" />
            <Search className="w-6 h-6 text-muted-foreground/50 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <div className="w-32 h-12 md:h-14 bg-muted rounded-full animate-pulse shrink-0" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="w-64 h-8 bg-muted animate-pulse rounded-md mb-2" />
          <div className="w-40 h-5 bg-muted animate-pulse rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div key={id} className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden h-40 flex flex-col md:flex-row">
              <div className="w-full md:w-40 h-40 bg-muted animate-pulse shrink-0" />
              <div className="p-4 flex flex-col flex-1 justify-center gap-3">
                <div className="w-3/4 h-5 bg-muted animate-pulse rounded-md" />
                <div className="w-1/2 h-4 bg-muted animate-pulse rounded-md" />
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="w-16 h-6 bg-muted animate-pulse rounded-md" />
                  <div className="w-20 h-5 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
