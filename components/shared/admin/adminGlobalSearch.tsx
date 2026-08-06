"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Package, ShoppingBag, Tag } from "lucide-react";
import {
  globalAdminSearch,
  type AdminSearchResponse,
} from "@/app/actions/admin-search.actions";

const DEBOUNCE_MS = 300;

const EMPTY_RESULTS: AdminSearchResponse = { orders: [], products: [], coupons: [] };

export function AdminGlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResponse>(EMPTY_RESULTS);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  // Close the dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    debounceTimer.current = setTimeout(() => {
      startTransition(async () => {
        const data = await globalAdminSearch(value);
        setResults(data);
      });
    }, DEBOUNCE_MS);
  }

  function handleSelect(href: string) {
    setIsOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
    router.push(href);
  }

  const hasAnyResults =
    results.orders.length > 0 || results.products.length > 0 || results.coupons.length > 0;
  const showEmptyState = isOpen && query.trim().length >= 2 && !isPending && !hasAnyResults;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search orders, products, coupons..."
          className="w-full h-9 pl-9 pr-8 rounded-md border border-gray-200 bg-gray-50 text-sm
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                     focus:bg-white transition-colors"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg
                     shadow-lg overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {showEmptyState && (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">
              No matches for &quot;{query}&quot;
            </p>
          )}

          <ResultGroup
            label="Orders"
            icon={<Package className="w-3.5 h-3.5" />}
            items={results.orders}
            onSelect={handleSelect}
          />
          <ResultGroup
            label="Products"
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
            items={results.products}
            onSelect={handleSelect}
          />
          <ResultGroup
            label="Coupons"
            icon={<Tag className="w-3.5 h-3.5" />}
            items={results.coupons}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  icon,
  items,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  items: AdminSearchResponse["orders"];
  onSelect: (href: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {icon} {label}
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.href)}
          className="w-full flex flex-col items-start gap-0.5 px-4 py-2 text-left hover:bg-orange-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900 truncate w-full">
            {item.title}
          </span>
          <span className="text-xs text-gray-400 truncate w-full">{item.subtitle}</span>
        </button>
      ))}
    </div>
  );
}