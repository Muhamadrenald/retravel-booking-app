import React from "react";

const Table = ({ columns, data, renderRow, emptyMessage, searchTerm }) => {
  return (
    <>
      {data.length === 0 && !searchTerm ? (
        <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm sm:text-base">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-50/10">
              <tr className="text-left text-gray-600 uppercase text-xs sm:text-sm font-semibold">
                {columns.map((col) => (
                  <th key={col.key} className={col.className}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{data.map((item, index) => renderRow(item, index))}</tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Table;
