import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger" | "info" | "disabled" | "processing";

interface StatusTagProps {
  status: StatusType;
  text?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; darkBg: string; darkText: string; label: string }> = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    darkBg: "dark:bg-emerald-900/30",
    darkText: "dark:text-emerald-400",
    label: "成功",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    darkBg: "dark:bg-amber-900/30",
    darkText: "dark:text-amber-400",
    label: "警告",
  },
  danger: {
    bg: "bg-red-50",
    text: "text-red-700",
    darkBg: "dark:bg-red-900/30",
    darkText: "dark:text-red-400",
    label: "错误",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    darkBg: "dark:bg-blue-900/30",
    darkText: "dark:text-blue-400",
    label: "进行中",
  },
  disabled: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    darkBg: "dark:bg-slate-800",
    darkText: "dark:text-slate-400",
    label: "已停用",
  },
  processing: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    darkBg: "dark:bg-indigo-900/30",
    darkText: "dark:text-indigo-400",
    label: "处理中",
  },
};

export default function StatusTag({ status, text, className }: StatusTagProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        config.darkBg,
        config.darkText,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "success" && "bg-emerald-500",
          status === "warning" && "bg-amber-500",
          status === "danger" && "bg-red-500",
          status === "info" && "bg-blue-500",
          status === "disabled" && "bg-slate-400",
          status === "processing" && "bg-indigo-500"
        )}
      />
      {text ?? config.label}
    </span>
  );
}
