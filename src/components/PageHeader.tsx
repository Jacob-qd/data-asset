import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  badge?: string | ReactNode;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  badgeClassName?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  badge,
  badgeVariant = "outline",
  badgeClassName,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {badge && (
          <Badge variant={badgeVariant} className={cn("bg-indigo-50 text-indigo-700 border-indigo-200", badgeClassName)}>
            {badge}
          </Badge>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
