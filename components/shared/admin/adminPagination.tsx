import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. "/admin/orders"
}

// Builds the visible page-number window: first, last, current ± 1,
// with an ellipsis marker ("...") wherever there's a gap.
function buildPageWindow(current: number, total: number): (number | "...")[] {
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("...");
    result.push(page);
    previous = page;
  }
  return result;
}

export function AdminPagination({ currentPage, totalPages, basePath }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const pageWindow = buildPageWindow(currentPage, totalPages);
  const hrefFor = (page: number) => `${basePath}?page=${page}`;

  return (
    <Pagination className="justify-between px-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? hrefFor(currentPage - 1) : undefined}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>

        {pageWindow.map((page, i) =>
          page === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink href={hrefFor(page)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? hrefFor(currentPage + 1) : undefined}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}