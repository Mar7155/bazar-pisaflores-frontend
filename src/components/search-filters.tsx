import Link from "next/link";
import { Search, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";

interface CategoryFilterProps {
  /** Array of categories to render as pill buttons */
  categories: Category[];
  /** Currently active category ID, or "all" */
  currentCategory: string;
  /** Base path for links, e.g. "/businesses" or "/flash-offers" */
  basePath: string;
  /** Current search query to preserve in links (optional) */
  query?: string;
  /** Label style: "filter" shows a Filter icon, "tag" shows a Tag icon */
  labelStyle?: "filter" | "tag";
  /** Label for the "all" button */
  allLabel?: string;
}

/**
 * Builds a URL preserving category and query params.
 * Always resets page to 1 when changing category.
 */
function buildCategoryUrl(basePath: string, categoryId: string, query?: string): string {
  const params = new URLSearchParams();
  if (categoryId !== "all") params.set("category", categoryId);
  if (query) params.set("q", query);
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

/**
 * CategoryFilter — Horizontal scrolling pill buttons for filtering by category.
 * Reusable across businesses, flash-offers, and any future listing page.
 */
export function CategoryFilter({
  categories,
  currentCategory,
  basePath,
  query,
  labelStyle = "filter",
  allLabel = "Todos",
}: CategoryFilterProps) {
  const LabelIcon = labelStyle === "tag" ? Tag : Filter;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
      <span className="shrink-0 flex items-center gap-2 text-sm font-bold text-muted-foreground mr-1">
        <LabelIcon className="w-4 h-4" />
        {labelStyle === "tag" ? "Filtrar:" : "Filtros"}
      </span>
      <Button
        variant={currentCategory === "all" ? "default" : "secondary"}
        size="sm"
        className="shrink-0 rounded-full"
        asChild
      >
        <Link href={buildCategoryUrl(basePath, "all", query)}>{allLabel}</Link>
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={currentCategory === cat.id ? "default" : "secondary"}
          size="sm"
          className="shrink-0 rounded-full"
          asChild
        >
          <Link href={buildCategoryUrl(basePath, cat.id, query)}>{cat.name}</Link>
        </Button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  /** Form action path, e.g. "/businesses" or "/search" */
  action: string;
  /** Current search query to prefill */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Extra hidden fields to preserve when submitting (e.g. category) */
  hiddenFields?: Record<string, string>;
}

/**
 * SearchBar — Reusable search input form that submits via GET.
 * Preserves extra params via hidden inputs.
 */
export function SearchBar({
  action,
  defaultValue = "",
  placeholder = "Buscar...",
  hiddenFields,
}: SearchBarProps) {
  return (
    <form action={action} className="relative w-full md:w-80 shrink-0 text-card-foreground">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-card border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}
