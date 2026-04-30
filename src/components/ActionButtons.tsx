import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Eye, Edit, Trash2, Play, History, BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";

interface ActionButton {
  key: string;
  icon: React.ReactNode;
  label?: string;
  variant?: "default" | "ghost" | "destructive" | "outline";
  className?: string;
  onClick: () => void;
  hidden?: boolean;
}

interface ActionButtonsProps {
  buttons: ActionButton[];
  size?: "sm" | "default" | "icon";
  className?: string;
}

export default function ActionButtons({ buttons, size = "sm", className }: ActionButtonsProps) {
  const visibleButtons = buttons.filter((b) => !b.hidden);
  if (visibleButtons.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visibleButtons.map((btn) => (
        <Button
          key={btn.key}
          variant={btn.variant || "ghost"}
          size={size}
          className={cn("h-8 w-8 p-0", btn.className)}
          onClick={btn.onClick}
          title={btn.label}
        >
          {btn.icon}
        </Button>
      ))}
    </div>
  );
}

// Preset action buttons
export const createViewAction = (onClick: () => void): ActionButton => ({
  key: "view",
  icon: <Eye className="w-4 h-4" />,
  label: "查看",
  onClick,
});

export const createEditAction = (onClick: () => void): ActionButton => ({
  key: "edit",
  icon: <Edit className="w-4 h-4" />,
  label: "编辑",
  onClick,
});

export const createDeleteAction = (onClick: () => void): ActionButton => ({
  key: "delete",
  icon: <Trash2 className="w-4 h-4" />,
  label: "删除",
  className: "text-red-600 hover:text-red-700 hover:bg-red-50",
  onClick,
});

export const createExecuteAction = (onClick: () => void): ActionButton => ({
  key: "execute",
  icon: <Play className="w-4 h-4 text-green-600" />,
  label: "执行",
  onClick,
});

export const createHistoryAction = (onClick: () => void): ActionButton => ({
  key: "history",
  icon: <History className="w-4 h-4" />,
  label: "历史",
  onClick,
});

export const createVisualAction = (onClick: () => void): ActionButton => ({
  key: "visual",
  icon: <BrainCircuit className="w-4 h-4" />,
  label: "可视化",
  onClick,
});
