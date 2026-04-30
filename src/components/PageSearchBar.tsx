import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  onReset?: () => void;
  extraFilters?: React.ReactNode;
  className?: string;
}

export default function PageSearchBar({
  value,
  onChange,
  placeholder = "搜索...",
  onSearch,
  onReset,
  extraFilters,
  className,
}: PageSearchBarProps) {
  return (
    <div className={cn("flex items-center gap-3 bg-white p-4 rounded-lg border", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
        />
      </div>
      {extraFilters}
      <Button variant="outline" size="sm" onClick={onSearch}>
        查询
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="w-3.5 h-3.5 mr-1" />
        重置
      </Button>
    </div>
  );
}
