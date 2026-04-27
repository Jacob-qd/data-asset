import { cn } from "@/lib/utils";
import { Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { CSSProperties } from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  actions?: React.ReactNode;
  extra?: React.ReactNode;
}

export default function ChartCard({
  title,
  children,
  className,
  style,
  actions,
  extra,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden",
        className
      )}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[#334155]">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {actions}
          {extra}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Body */}
      <div className="p-5">{children}</div>
    </div>
  );
}
