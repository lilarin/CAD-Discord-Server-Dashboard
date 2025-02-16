import React from "react";

export const PaginationControl = ({
  currentPage,
  pageCount,
  handlePageChange,
}: {
  currentPage: number;
  pageCount: number;
  handlePageChange: (page: number) => void;
}) => {
  if (pageCount <= 1) return null;

  const getVisiblePages = () => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    let pages: (number | string)[] = [];

    if (currentPage <= 2) {
        pages = [1, 2, 3, '...', pageCount];
    } else if (currentPage >= pageCount - 1) {
       pages = [1, '...', pageCount - 2, pageCount - 1, pageCount];
    } else {
        pages = [1, '...', currentPage, '...', pageCount];
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 mx-1 rounded bg-[#2f3136] text-white disabled:opacity-50 ${
          currentPage === 1 ? "" : "hover:bg-[#292B2F]"
        } transition-all duration-300`}
      >
        Попередня
      </button>

      {visiblePages.map((pageNumber, index) => {
        if (typeof pageNumber === 'number') {
          return <button
            key={index}
            onClick={() => handlePageChange(pageNumber)}
            className={`px-4 py-2 mx-1 rounded ${currentPage === pageNumber ? "bg-[#7289da]" : "bg-[#2f3136]"} text-white`}>
            {pageNumber}
          </button>
        } else {
          return <span key={index} className="px-4 py-2 mx-1 text-white">...</span>;
        }
      })}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageCount}
        className={`px-4 py-2 mx-1 rounded bg-[#2f3136] text-white disabled:opacity-50 ${
          currentPage === pageCount ? "" : "hover:bg-[#292B2F]"
        } transition-all duration-300`}
      >
        Наступна
      </button>
    </div>
  );
};