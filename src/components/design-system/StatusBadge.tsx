import { getStatusStyle } from "./UnifiedStyles";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status);
  return (
    <span className={style}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
      {status}
    </span>
  );
}
