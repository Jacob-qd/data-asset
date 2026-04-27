import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, RotateCcw, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onReset?: () => void;
  onExport?: () => void;
  filterContent?: React.ReactNode;
  className?: string;
}

export default function SearchFilter({
  placeholder = "搜索...",
  onSearch,
  onReset,
  onExport,
  filterContent,
  className,
}: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleReset = () => {
    setQuery("");
    setShowFilters(false);
    onReset?.();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-9 pr-4 h-9 text-sm dark:bg-[#1E293B] dark:border-[#334155] dark:text-slate-200"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {filterContent && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              高级筛选
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
            onClick={handleReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </Button>
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
              onClick={onExport}
            >
              <Download className="w-3.5 h-3.5" />
              导出
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {filterContent && showFilters && (
        <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155] animate-slideDown">
          {filterContent}
        </div>
      )}
    </div>
  );
}
