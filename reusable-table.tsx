import React, { useMemo, useState } from "react";
import { getNestedValue } from "@/utils/getNestedValue"; // utility to access nested props

export type TableColumn<T> = {
  header: string;
  accessor: string; // can be "name", or "user.name"
  className?: string;
};

type TransferTableProps<T> = {
  available: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  getId: (item: T) => string | number;
  columns: TableColumn<T>[];
  leftTitle?: string;
  rightTitle?: string;
  renderAction?: (item: T, side: "left" | "right") => React.ReactNode;
};

export function TransferTable<T>({
  available,
  selected,
  onChange,
  getId,
  columns,
  leftTitle = "Available",
  rightTitle = "Selected",
  renderAction,
}: TransferTableProps<T>) {
  const [search, setSearch] = useState("");

  const availableFiltered = useMemo(() => {
    const lower = search.toLowerCase();
    return available
      .filter((item) => !selected.some((sel) => getId(sel) === getId(item)))
      .filter((item) =>
        columns.some((col) => {
          const value = getNestedValue(item, col.accessor);
          return String(value).toLowerCase().includes(lower);
        })
      );
  }, [available, selected, search, columns, getId]);

  const transferToRight = (item: T) => {
    if (!selected.some((sel) => getId(sel) === getId(item))) {
      onChange([...selected, item]);
    }
  };

  const transferToLeft = (item: T) => {
    onChange(selected.filter((sel) => getId(sel) !== getId(item)));
  };

  const transferAllToRight = () => {
    const toAdd = availableFiltered.filter(
      (item) => !selected.some((sel) => getId(sel) === getId(item))
    );
    onChange([...selected, ...toAdd]);
  };

  const transferAllToLeft = () => {
    onChange([]);
  };

  const renderTable = (items: T[], side: "left" | "right") => (
    <table className="w-full border text-sm">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th key={col.accessor} className={`px-2 py-1 text-left ${col.className}`}>
              {col.header}
            </th>
          ))}
          <th className="px-2 py-1 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={getId(item)}>
            {columns.map((col) => (
              <td key={col.accessor} className={`px-2 py-1 border-t ${col.className}`}>
                {String(getNestedValue(item, col.accessor) ?? "")}
              </td>
            ))}
            <td className="px-2 py-1 border-t text-center">
              {renderAction
                ? renderAction(item, side)
                : side === "left"
                ? <button onClick={() => transferToRight(item)}>➡</button>
                : <button onClick={() => transferToLeft(item)}>⬅</button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Table */}
      <div className="w-full md:w-1/2">
        <div className="flex justify-between items-center mb-2">
          <strong>{leftTitle} ({availableFiltered.length})</strong>
          <button onClick={transferAllToRight} className="text-blue-600 text-sm">Transfer All ➡</button>
        </div>
        <input
          className="w-full mb-2 px-2 py-1 border rounded"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="border rounded max-h-80 overflow-auto">
          {renderTable(availableFiltered, "left")}
        </div>
      </div>

      {/* Right Table */}
      <div className="w-full md:w-1/2">
        <div className="flex justify-between items-center mb-2">
          <strong>{rightTitle} ({selected.length})</strong>
          <button onClick={transferAllToLeft} className="text-red-600 text-sm">⬅ Transfer All</button>
        </div>
        <div className="border rounded max-h-80 overflow-auto">
          {renderTable(selected, "right")}
        </div>
      </div>
    </div>
  );
}