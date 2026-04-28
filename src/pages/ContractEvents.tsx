import { useState } from "react";
import type { FieldConfig } from "@/components/CrudDialog";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

/* ─── Types ─── */
interface ContractEvent {
  id: string;
  contractName: string;
  eventName: string;
  eventType: string;
  status: string;
  subscribeTime: string;
  handler: string;
  description: string;
}

/* ─── Initial Data ─── */
const initialEvents: ContractEvent[] = [
  {
    id: "EVT-001",
    contractName: "数据资产存证合约",
    eventName: "Notarized",
    eventType: "存证事件",
    status: "subscribed",
    subscribeTime: "2025-01-15 09:30:00",
    handler: "存证处理器",
    description: "监听数据资产哈希上链存证事件，触发完整性校验流程",
  },
  {
    id: "EVT-002",
    contractName: "数据确权合约",
    eventName: "Registered",
    eventType: "确权事件",
    status: "subscribed",
    subscribeTime: "2025-02-01 14:00:00",
    handler: "确权处理器",
    description: "监听数据资产确权登记事件，更新权属状态",
  },
  {
    id: "EVT-003",
    contractName: "数据流转溯源合约",
    eventName: "TraceAdded",
    eventType: "溯源事件",
    status: "paused",
    subscribeTime: "2025-03-10 10:00:00",
    handler: "溯源处理器",
    description: "监听数据资产流转轨迹记录事件，更新全生命周期追踪",
  },
  {
    id: "EVT-004",
    contractName: "授权管理合约",
    eventName: "Authorized",
    eventType: "授权事件",
    status: "subscribed",
    subscribeTime: "2025-01-20 16:00:00",
    handler: "授权处理器",
    description: "监听数据资产访问授权事件，同步权限状态",
  },
  {
    id: "EVT-005",
    contractName: "数据共享合约",
    eventName: "Shared",
    eventType: "共享事件",
    status: "unsubscribed",
    subscribeTime: "2025-04-01 09:00:00",
    handler: "共享处理器",
    description: "监听数据资产安全共享事件，记录共享日志",
  },
];

/* ─── Status Badge ─── */
function EventStatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    subscribed: {
      text: "已订阅",
      class:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    paused: {
      text: "已暂停",
      class:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    unsubscribed: {
      text: "已取消",
      class:
        "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
    },
  };
  const c = config[status] || config.unsubscribed;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        c.class
      )}
    >
      {c.text}
    </span>
  );
}

/* ─── Form Fields ─── */
const formFields: FieldConfig[] = [
  {
    key: "id",
    label: "事件ID",
    type: "text",
    required: true,
    placeholder: "如 EVT-006",
  },
  {
    key: "contractName",
    label: "合约名称",
    type: "text",
    required: true,
  },
  {
    key: "eventName",
    label: "事件名称",
    type: "text",
    required: true,
  },
  {
    key: "eventType",
    label: "事件类型",
    type: "select",
    required: true,
    options: [
      { label: "存证事件", value: "存证事件" },
      { label: "确权事件", value: "确权事件" },
      { label: "溯源事件", value: "溯源事件" },
      { label: "授权事件", value: "授权事件" },
      { label: "共享事件", value: "共享事件" },
    ],
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "已订阅", value: "subscribed" },
      { label: "已暂停", value: "paused" },
      { label: "已取消", value: "unsubscribed" },
    ],
  },
  {
    key: "subscribeTime",
    label: "订阅时间",
    type: "text",
    placeholder: "如 2025-04-15 10:30:00",
  },
  {
    key: "handler",
    label: "处理器",
    type: "text",
    required: true,
  },
  {
    key: "description",
    label: "描述",
    type: "textarea",
    placeholder: "输入事件描述...",
  },
];

/* ─── Detail Fields ─── */
const detailFields = [
  { key: "id", label: "事件ID", type: "text" as const },
  { key: "contractName", label: "合约名称", type: "text" as const },
  { key: "eventName", label: "事件名称", type: "badge" as const },
  { key: "eventType", label: "事件类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "subscribeTime", label: "订阅时间", type: "date" as const },
  { key: "handler", label: "处理器", type: "text" as const },
  { key: "description", label: "描述", type: "text" as const },
];

/* ─── Main ─── */
export default function ContractEvents() {
  const [events, setEvents] = useState<ContractEvent[]>(initialEvents);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "view" | "delete"
  >("create");
  const [selectedEvent, setSelectedEvent] = useState<ContractEvent | null>(
    null
  );

  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = events.filter(
    (e) =>
      e.contractName.includes(search) ||
      e.eventName.includes(search) ||
      e.id.includes(search)
  );

  const openCreate = () => {
    setDialogMode("create");
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const openEdit = (event: ContractEvent) => {
    setDialogMode("edit");
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const openView = (event: ContractEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const openDelete = (event: ContractEvent) => {
    setDialogMode("delete");
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newEvent: ContractEvent = {
        id: data.id || "",
        contractName: data.contractName || "",
        eventName: data.eventName || "",
        eventType: data.eventType || "",
        status: data.status || "subscribed",
        subscribeTime: data.subscribeTime || new Date().toLocaleString("zh-CN"),
        handler: data.handler || "",
        description: data.description || "",
      };
      setEvents((prev) => [...prev, newEvent]);
    } else if (dialogMode === "edit" && selectedEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id ? { ...e, ...data } : e
        )
      );
    }
  };

  const handleDelete = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    }
  };

  const stats = [
    {
      label: "事件总数",
      value: events.length,
      icon: <Bell className="w-5 h-5 text-indigo-500" />,
      color: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: "已订阅",
      value: events.filter((e) => e.status === "subscribed").length,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "已暂停",
      value: events.filter((e) => e.status === "paused").length,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "已取消",
      value: events.filter((e) => e.status === "unsubscribed").length,
      icon: <XCircle className="w-5 h-5 text-slate-500" />,
      color: "bg-slate-50 dark:bg-slate-900/20",
    },
  ];

  const drawerData = selectedEvent
    ? {
        ...selectedEvent,
        status:
          selectedEvent.status === "subscribed"
            ? "已订阅"
            : selectedEvent.status === "paused"
            ? "已暂停"
            : "已取消",
      }
    : {};

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/blockchain">区块链</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>合约事件</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            合约事件
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            智能合约事件订阅、权限、版本
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4" /> 新建订阅
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl p-4 border border-slate-200 dark:border-slate-700",
              s.color
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {s.label}
              </span>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索合约名称、事件名称、ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setSearch("")}
        >
          <RefreshCw className="w-4 h-4" /> 刷新
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {[
                "事件ID",
                "合约名称",
                "事件名称",
                "事件类型",
                "状态",
                "订阅时间",
                "处理器",
                "操作",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => (
              <tr
                key={event.id}
                className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {event.id}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {event.contractName}
                </td>
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {event.eventName}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{event.eventType}</Badge>
                </td>
                <td className="px-4 py-3">
                  <EventStatusBadge status={event.status} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {event.subscribeTime}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {event.handler}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openView(event)}
                      title="查看"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(event)}
                      title="编辑"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDelete(event)}
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedEvent ? selectedEvent.eventName : "事件订阅"}
        fields={formFields}
        data={selectedEvent || undefined}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* DetailDrawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`事件详情 - ${selectedEvent?.eventName || ""}`}
        data={drawerData}
        fields={detailFields}
        onEdit={
          selectedEvent
            ? () => {
                setDrawerOpen(false);
                openEdit(selectedEvent);
              }
            : undefined
        }
        onDelete={
          selectedEvent
            ? () => {
                setDrawerOpen(false);
                openDelete(selectedEvent);
              }
            : undefined
        }
      />
    </div>
  );
}
