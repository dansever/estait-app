/**
 * File: use-pagination.tsx
 *
 * Responsibility:
 * Manages pagination state and logic for lists and collections
 *
 * Key features:
 * - Handles page navigation and item limits
 * - Calculates pagination metadata (total pages, visible items)
 * - Provides functions for navigating between pages
 * - Supports optional server-side pagination integration
 *
 * Components:
 * - usePagination: Hook that provides pagination functionality and state
 */

import { useState, useMemo, useCallback } from "react";

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  maxPageButtons?: number;
}

interface UsePaginationReturn {
  // Current state
  page: number;
  pageSize: number;
  totalPages: number;

  // Navigation methods
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Pagination metadata
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  visiblePageButtons: number[];

  // Utility functions
  paginate: <T>(items: T[]) => T[];
  getItemRangeLabel: () => string;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
  maxPageButtons = 5,
}: PaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination metadata
  const totalPages = useMemo(() => {
    return totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;
  }, [totalItems, pageSize]);

  // Ensure current page is valid when dependencies change
  const currentPage = useMemo(() => {
    // If totalPages is 0, keep current page as is (will show empty state)
    if (totalPages === 0) return page;

    // Otherwise, ensure current page is within valid range
    return Math.max(1, Math.min(page, totalPages));
  }, [page, totalPages]);

  // Update page if calculated currentPage is different
  if (page !== currentPage) {
    setPage(currentPage);
  }

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItems - 1);
  }, [startIndex, pageSize, totalItems]);

  // Navigation methods
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const changePageSize = useCallback(
    (newSize: number) => {
      if (newSize > 0) {
        // Preserve current position as much as possible when changing page size
        const currentFirstItemIndex = (currentPage - 1) * pageSize;
        const newPage = Math.floor(currentFirstItemIndex / newSize) + 1;

        setPageSize(newSize);
        setPage(newPage);
      }
    },
    [currentPage, pageSize]
  );

  // Navigation status
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Generate visible page buttons
  const visiblePageButtons = useMemo(() => {
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max buttons
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate range of visible buttons
    let startButton = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endButton = startButton + maxPageButtons - 1;

    // Adjust if end exceeds total
    if (endButton > totalPages) {
      endButton = totalPages;
      startButton = Math.max(1, endButton - maxPageButtons + 1);
    }

    // Generate array of page numbers
    return Array.from(
      { length: endButton - startButton + 1 },
      (_, i) => startButton + i
    );
  }, [currentPage, totalPages, maxPageButtons]);

  // Utility to paginate an array
  const paginate = useCallback(
    <T,>(items: T[]): T[] => {
      if (!items?.length) return [];
      return items.slice(startIndex, startIndex + pageSize);
    },
    [startIndex, pageSize]
  );

  // Generate human-readable range label
  const getItemRangeLabel = useCallback(() => {
    if (totalItems === 0) return "No items";

    const start = startIndex + 1;
    const end = Math.min(startIndex + pageSize, totalItems);

    return `${start}-${end} of ${totalItems} items`;
  }, [startIndex, pageSize, totalItems]);

  return {
    page: currentPage,
    pageSize,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    setPageSize: changePageSize,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    visiblePageButtons,
    paginate,
    getItemRangeLabel,
  };
}
