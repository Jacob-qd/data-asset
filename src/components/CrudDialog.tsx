import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Check } from "lucide-react";

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  data?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onDelete?: () => void;
  mode: "create" | "edit" | "view" | "delete";
}

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "multiselect";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
}

export function CrudDialog({
  open,
  onOpenChange,
  title,
  fields,
  data,
  onSubmit,
  onDelete,
  mode,
}: CrudDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>(data || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  if (mode === "delete") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              确定要删除 <strong>{title}</strong> 吗？此操作不可撤销。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => { onDelete?.(); onOpenChange(false); }}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const isView = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新建" : mode === "edit" ? "编辑" : "查看"} {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  value={formData[field.key] || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, [field.key]: value })
                  }
                  disabled={isView}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || `选择${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "multiselect" ? (
                <div className="border rounded-md p-2 space-y-1 max-h-[160px] overflow-y-auto">
                  {field.options?.map((opt) => {
                    const currentValues = (formData[field.key] || "").split(",").filter(Boolean);
                    const isSelected = currentValues.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${isSelected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                        onClick={() => {
                          const newValues = isSelected
                            ? currentValues.filter((v: string) => v !== opt.value)
                            : [...currentValues, opt.value];
                          setFormData({ ...formData, [field.key]: newValues.join(",") });
                        }}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.key}
                  value={formData[field.key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  disabled={isView}
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm disabled:bg-gray-50"
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  disabled={isView}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isView ? "关闭" : "取消"}
            </Button>
            {!isView && (
              <Button type="submit">
                {mode === "create" ? "创建" : "保存"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
