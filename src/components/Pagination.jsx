// const Pagination = () => {
//   return (
//     <div className="p-4 flex items-center justify-between text-gray-500">
//       <button
//         disabled
//         className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Prev
//       </button>
//       <div className="flex items-center gap-2 text-sm">
//         <button className="px-2 rounded-sm bg-lamaSky">1</button>
//         <button className="px-2 rounded-sm ">2</button>
//         <button className="px-2 rounded-sm ">3</button>
//         ...
//         <button className="px-2 rounded-sm ">10</button>
//       </div>
//       <button className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
//         Next
//       </button>
//     </div>
//   );
// };

// export default Pagination;
import React from "react";

const Pagination = ({ page, totalPages, setPage }) => {
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = Math.min(start + maxButtons - 1, totalPages);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`px-2 rounded-sm ${
            i === page ? "bg-lamaSky text-white font-semibold" : ""
          }`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      <div className="flex items-center gap-2 text-sm">
        {renderPageButtons()}
        {totalPages > 5 && page + 2 < totalPages && <span>...</span>}
        {totalPages > 5 && page < totalPages && (
          <button
            className="px-2 rounded-sm"
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </button>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;