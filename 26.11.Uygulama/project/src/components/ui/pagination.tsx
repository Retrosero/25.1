import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const MAX_VISIBLE_PAGES = 5;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  let visiblePages: number[] = [];
  
  if (totalPages <= MAX_VISIBLE_PAGES) {
    visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const leftSide = Math.floor(MAX_VISIBLE_PAGES / 2);
    const rightSide = MAX_VISIBLE_PAGES - leftSide - 1;
    
    if (currentPage <= leftSide + 1) {
      // Başlangıç sayfalarındayız
      visiblePages = Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => i + 1);
    } else if (currentPage >= totalPages - rightSide) {
      // Son sayfalardayız
      visiblePages = Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => totalPages - MAX_VISIBLE_PAGES + i + 1);
    } else {
      // Ortadayız
      visiblePages = Array.from(
        { length: MAX_VISIBLE_PAGES },
        (_, i) => currentPage - leftSide + i
      );
    }
  }

  const showLeftDots = visiblePages[0] > 1;
  const showRightDots = visiblePages[visiblePages.length - 1] < totalPages;

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

      {showLeftDots && (
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
          <span className="px-2">...</span>
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

      {showRightDots && (
        <>
          <span className="px-2">...</span>
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