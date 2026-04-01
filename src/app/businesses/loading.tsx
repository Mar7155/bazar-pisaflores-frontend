import { Store, Filter } from "lucide-react";

export default function BusinessesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8 flex-1 animate-fade-in opacity-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="w-64 h-10 bg-muted animate-pulse rounded-md flex items-center gap-3">
             <Store className="w-8 h-8 text-muted-foreground/30 ml-1" />
          </div>
          <div className="w-72 h-6 bg-muted animate-pulse rounded-md" />
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="w-24 h-9 bg-muted animate-pulse rounded-full" />
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="w-20 h-9 bg-muted animate-pulse rounded-full hidden sm:block" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
           <div key={id} className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden flex flex-col">
             <div className="h-40 md:h-48 bg-muted animate-pulse relative">
                <div className="absolute bottom-3 left-4 flex gap-2">
                   <div className="w-16 h-6 bg-background/50 rounded animate-pulse" />
                   <div className="w-16 h-6 bg-background/50 rounded animate-pulse" />
                </div>
             </div>
             <div className="p-4 md:p-5 flex flex-col h-[180px] gap-3">
                <div className="w-3/4 h-6 bg-muted animate-pulse rounded-md" />
                <div className="w-1/2 h-4 bg-muted animate-pulse rounded-md mt-1" />
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                  <div className="w-16 h-4 bg-muted animate-pulse rounded-md" />
                  <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />
                </div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
