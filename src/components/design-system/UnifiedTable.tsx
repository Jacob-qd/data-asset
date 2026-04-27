import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (record: T, index: number) => ReactNode;
}

interface UnifiedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (record: T) => string;
  emptyText?: string;
  className?: string;
}

export default function UnifiedTable<T>({
  columns,
  data,
  rowKey,
  emptyText = "暂无数据",
  className,
}: UnifiedTableProps<T>) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 border-b border-gray-100 hover:bg-gray-50/80">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right"
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-16 text-gray-400"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((record, index) => (
              <TableRow
                key={rowKey(record)}
                className="hover:bg-indigo-50/30 transition-colors duration-150 group"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      "py-3.5 px-4 text-sm",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right"
                    )}
                  >
                    {col.render
                      ? col.render(record, index)
                      : (record as Record<string, unknown>)[col.key] as ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
