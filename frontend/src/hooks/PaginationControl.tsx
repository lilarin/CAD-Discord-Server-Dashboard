import React from "react";

export const PaginationControl = ({currentPage, pageCount, handlePageChange}: {currentPage: number, pageCount: number, handlePageChange: (page: number) => void}) => {
    if (pageCount <= 1) return null;
    return (
        <div className="flex justify-center mt-4">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 rounded bg-[#2f3136] text-white disabled:opacity-50"
            >
                Попередня
            </button>

            {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 mx-1 rounded ${currentPage === pageNumber ? 'bg-[#7289da]' : 'bg-[#2f3136]'} text-white`}
                >
                    {pageNumber}
                </button>
            ))}

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="px-4 py-2 mx-1 rounded bg-[#2f3136] text-white disabled:opacity-50"
            >
                Наступна
            </button>
        </div>
    );
}