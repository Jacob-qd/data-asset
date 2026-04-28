import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, any>;
  fields: { key: string; label: string; type?: "text" | "badge" | "date" | "list" }[];
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  data,
  fields,
  onEdit,
  onDelete,
  children,
}: DetailDrawerProps) {
  const renderValue = (field: typeof fields[0]) => {
    const value = data[field.key];
    if (value === undefined || value === null) return "-";

    switch (field.type) {
      case "badge":
        return (
          <Badge variant="outline" className="font-normal">
            {value}
          </Badge>
        );
      case "date":
        return <span className="text-sm text-gray-500">{value}</span>;
      case "list":
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          value
        );
      default:
        return <span className="text-sm">{value}</span>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          <div className="space-y-4 pr-4">
            {fields.map((field, index) => (
              <div key={field.key}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.label}
                  </p>
                  {renderValue(field)}
                </div>
              </div>
            ))}
            {children}
          </div>
        </ScrollArea>
        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex gap-2 w-full">
            {onEdit && (
              <Button variant="outline" className="flex-1" onClick={onEdit}>
                编辑
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" className="flex-1" onClick={onDelete}>
                删除
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
