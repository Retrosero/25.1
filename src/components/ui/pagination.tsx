import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - maxVisiblePages));
    visiblePages = pages.slice(start, start + maxVisiblePages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "p-2 rounded-lg border border-gray-200 dark:border-gray-700",
          "hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={cn(
              "w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              currentPage === 1 && "bg-primary-600 text-white border-primary-600"
            )}
          >
            1
          </button>
          {visiblePages[0] > 2 && <span>...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-100 dark:hover:bg-gray-700",
            currentPage === page && "bg-primary-600 text-white border-primary-600"
          )}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span>...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={cn(
              "w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              currentPage === totalPages && "bg-primary-600 text-white border-primary-600"
            )}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "p-2 rounded-lg border border-gray-200 dark:border-gray-700",
          "hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}