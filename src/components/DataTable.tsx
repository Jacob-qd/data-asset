import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  title: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  pagination = true,
  pageSize: defaultPageSize = 10,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === paginatedData.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(paginatedData.map((row) => rowKey(row))));
    }
  };

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIdx, startIdx + pageSize);

  return (
    <div className={cn("bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#1E293B]/80 border-b border-slate-200 dark:border-[#334155]">
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedKeys.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-[#475569] text-primary-500 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider",
                    col.sortable && "cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.title}
                    {col.sortable && sortKey === col.key && (
                      sortOrder === "asc" ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => {
              const key = rowKey(row);
              const isSelected = selectedKeys.has(key);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-slate-100 dark:border-[#334155]/50 transition-colors duration-150 animate-fadeIn",
                    idx % 2 === 1 && "bg-slate-50/50 dark:bg-[#1E293B]/30",
                    "hover:bg-primary-50/50 dark:hover:bg-primary-900/10",
                    onRowClick && "cursor-pointer",
                    isSelected && "bg-primary-50 dark:bg-primary-900/10 border-l-2 border-l-primary-500"
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(key)}
                        className="rounded border-slate-300 dark:border-[#475569] text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {col.render
                        ? col.render(row, idx)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#334155]">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            显示 {startIdx + 1}-{Math.min(startIdx + pageSize, data.length)} 条，共{" "}
            {data.length} 条
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                page = currentPage - 3 + i;
                if (page > totalPages) page = totalPages - 4 + i;
              }
              if (page < 1 || page > totalPages) return null;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 text-xs",
                    currentPage === page
                      ? "bg-primary-500 text-white hover:bg-primary-600"
                      : "dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 h-8 px-2 text-xs rounded-md border border-slate-200 dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-300"
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s}/页
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <img src="./no-data.svg" alt="No data" className="w-24 h-24 mb-4 opacity-50" />
          <p className="text-sm text-slate-400 dark:text-slate-500">暂无数据</p>
        </div>
      )}
    </div>
  );
}
