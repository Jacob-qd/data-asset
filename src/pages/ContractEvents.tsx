import { useState, useMemo, useRef, useEffect } from "react";
import type { FieldConfig } from "@/components/CrudDialog";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  FileText,
  Filter,
  Globe,
  History,
  Play,
  Download,
  Settings,
  AlertTriangle,
  Check,
  X,
  Send,
  RotateCcw,
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

interface EventLog {
  id: string;
  contractName: string;
  eventName: string;
  blockHeight: number;
  txHash: string;
  timestamp: string;
  params: Record<string, any>;
}

interface WebhookConfig {
  id: string;
  eventId: string;
  url: string;
  method: string;
  headers: string;
  bodyTemplate: string;
  retryCount: number;
  retryInterval: number;
}

interface WebhookHistory {
  id: string;
  webhookId: string;
  sentAt: string;
  status: "success" | "failed";
  responseCode?: number;
  responseBody?: string;
}

interface FilterRule {
  id: string;
  eventId: string;
  name: string;
  conditions: FilterCondition[];
  logic: "AND" | "OR";
  enabled: boolean;
}

interface FilterCondition {
  param: string;
  operator: ">" | "<" | "=" | "!=" | "contains";
  value: string;
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

const initialLogs: EventLog[] = [
  { id: "L001", contractName: "数据资产存证合约", eventName: "Notarized", blockHeight: 18472300, txHash: "0xabc...1234", timestamp: "2025-04-28 10:30:00", params: { hash: "0xdeadbeef", sender: "0x111...", value: 1500 } },
  { id: "L002", contractName: "数据资产存证合约", eventName: "Notarized", blockHeight: 18472305, txHash: "0xabc...1235", timestamp: "2025-04-28 10:31:00", params: { hash: "0xcafebabe", sender: "0x222...", value: 800 } },
  { id: "L003", contractName: "数据确权合约", eventName: "Registered", blockHeight: 18472310, txHash: "0xdef...5678", timestamp: "2025-04-28 10:32:00", params: { assetId: "ASSET-001", owner: "0x333...", value: 2000 } },
  { id: "L004", contractName: "数据流转溯源合约", eventName: "TraceAdded", blockHeight: 18472315, txHash: "0xghi...9012", timestamp: "2025-04-28 10:33:00", params: { traceId: "TR-001", from: "0x444...", to: "0x555...", value: 500 } },
  { id: "L005", contractName: "授权管理合约", eventName: "Authorized", blockHeight: 18472320, txHash: "0xjkl...3456", timestamp: "2025-04-28 10:34:00", params: { grantee: "0x666...", resource: "DATA-001", value: 3000 } },
  { id: "L006", contractName: "数据共享合约", eventName: "Shared", blockHeight: 18472325, txHash: "0xmnop...7890", timestamp: "2025-04-28 10:35:00", params: { shareId: "SH-001", recipient: "0x777...", value: 1200 } },
  { id: "L007", contractName: "数据资产存证合约", eventName: "Notarized", blockHeight: 18472330, txHash: "0xqrs...1111", timestamp: "2025-04-28 10:36:00", params: { hash: "0xbeadface", sender: "0x888...", value: 2500 } },
  { id: "L008", contractName: "数据确权合约", eventName: "Registered", blockHeight: 18472335, txHash: "0xtuv...2222", timestamp: "2025-04-28 10:37:00", params: { assetId: "ASSET-002", owner: "0x999...", value: 900 } },
];

const initialWebhooks: WebhookConfig[] = [
  { id: "WH-001", eventId: "EVT-001", url: "https://api.example.com/webhook/notarized", method: "POST", headers: "Content-Type: application/json\nAuthorization: Bearer token123", bodyTemplate: '{"event": "{{eventName}}", "hash": "{{params.hash}}", "tx": "{{txHash}}"}', retryCount: 3, retryInterval: 5 },
];

const initialWebhookHistory: WebhookHistory[] = [
  { id: "WHH-001", webhookId: "WH-001", sentAt: "2025-04-28 10:30:05", status: "success", responseCode: 200, responseBody: "{\"ok\": true}" },
  { id: "WHH-002", webhookId: "WH-001", sentAt: "2025-04-28 10:31:05", status: "failed", responseCode: 500, responseBody: "Internal Server Error" },
];

const initialRules: FilterRule[] = [
  { id: "R001", eventId: "EVT-001", name: "高价值存证过滤", conditions: [{ param: "value", operator: ">", value: "1000" }], logic: "AND", enabled: true },
  { id: "R002", eventId: "EVT-003", name: "溯源金额过滤", conditions: [{ param: "value", operator: ">", value: "500" }, { param: "from", operator: "contains", value: "0x444" }], logic: "OR", enabled: true },
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
  const [logs, setLogs] = useState<EventLog[]>(initialLogs);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(initialWebhooks);
  const [webhookHistory, setWebhookHistory] = useState<WebhookHistory[]>(initialWebhookHistory);
  const [rules, setRules] = useState<FilterRule[]>(initialRules);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("events");

  // Event log filters
  const [logFilterEvent, setLogFilterEvent] = useState("");
  const [logFilterContract, setLogFilterContract] = useState("");
  const [logFilterStart, setLogFilterStart] = useState("");
  const [logFilterEnd, setLogFilterEnd] = useState("");

  // Webhook dialog
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookEventId, setWebhookEventId] = useState("");
  const [webhookForm, setWebhookForm] = useState<Partial<WebhookConfig>>({});
  const [webhookHistoryOpen, setWebhookHistoryOpen] = useState(false);
  const [webhookHistoryId, setWebhookHistoryId] = useState("");

  // Filter rule dialog
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleEventId, setRuleEventId] = useState("");
  const [ruleForm, setRuleForm] = useState<Partial<FilterRule> & { conditions: FilterCondition[] }>({ conditions: [] });

  // Replay state
  const [replayOpen, setReplayOpen] = useState(false);
  const [replaySelected, setReplaySelected] = useState<Set<string>>(new Set());
  const [replayResults, setReplayResults] = useState<{ logId: string; status: "success" | "failed"; message: string }[]>([]);
  const [replayViewOpen, setReplayViewOpen] = useState(false);

  // CRUD dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedEvent, setSelectedEvent] = useState<ContractEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredEvents = events.filter(
    (e) =>
      e.contractName.includes(search) ||
      e.eventName.includes(search) ||
      e.id.includes(search)
  );

  const filteredLogs = logs.filter((l) => {
    if (logFilterEvent && !l.eventName.includes(logFilterEvent)) return false;
    if (logFilterContract && !l.contractName.includes(logFilterContract)) return false;
    if (logFilterStart && l.timestamp < logFilterStart) return false;
    if (logFilterEnd && l.timestamp > logFilterEnd + " 23:59:59") return false;
    return true;
  });

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

  const openWebhook = (eventId: string, existing?: WebhookConfig) => {
    setWebhookEventId(eventId);
    setWebhookForm(existing || { url: "", method: "POST", headers: "", bodyTemplate: "", retryCount: 3, retryInterval: 5 });
    setWebhookOpen(true);
  };

  const saveWebhook = () => {
    if (!webhookForm.url) return;
    const payload: WebhookConfig = {
      id: webhooks.find(w => w.eventId === webhookEventId)?.id || Date.now().toString(36).toUpperCase(),
      eventId: webhookEventId,
      url: webhookForm.url || "",
      method: webhookForm.method || "POST",
      headers: webhookForm.headers || "",
      bodyTemplate: webhookForm.bodyTemplate || "",
      retryCount: Number(webhookForm.retryCount) || 3,
      retryInterval: Number(webhookForm.retryInterval) || 5,
    };
    setWebhooks(prev => {
      const exists = prev.find(w => w.eventId === webhookEventId);
      if (exists) return prev.map(w => w.eventId === webhookEventId ? payload : w);
      return [...prev, payload];
    });
    setWebhookOpen(false);
  };

  const openRule = (eventId: string, existing?: FilterRule) => {
    setRuleEventId(eventId);
    setRuleForm(existing ? { ...existing } : { name: "", conditions: [{ param: "", operator: ">", value: "" }], logic: "AND", enabled: true });
    setRuleOpen(true);
  };

  const saveRule = () => {
    if (!ruleForm.name) return;
    const payload: FilterRule = {
      id: ruleForm.id || Date.now().toString(36).toUpperCase(),
      eventId: ruleEventId,
      name: ruleForm.name || "",
      conditions: ruleForm.conditions || [],
      logic: ruleForm.logic || "AND",
      enabled: ruleForm.enabled ?? true,
    };
    setRules(prev => {
      const exists = prev.find(r => r.id === payload.id);
      if (exists) return prev.map(r => r.id === payload.id ? payload : r);
      return [...prev, payload];
    });
    setRuleOpen(false);
  };

  const testRule = (rule: FilterRule, log: EventLog) => {
    if (!rule.enabled) return true;
    const results = rule.conditions.map((c) => {
      const val = log.params[c.param];
      if (val === undefined) return false;
      const numVal = Number(val);
      const numCond = Number(c.value);
      switch (c.operator) {
        case ">": return !isNaN(numVal) && !isNaN(numCond) && numVal > numCond;
        case "<": return !isNaN(numVal) && !isNaN(numCond) && numVal < numCond;
        case "=": return String(val) === c.value;
        case "!=": return String(val) !== c.value;
        case "contains": return String(val).includes(c.value);
        default: return false;
      }
    });
    return rule.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
  };

  const exportLogs = () => {
    const csv = [
      ["ID", "合约", "事件", "区块高度", "交易哈希", "时间", "参数"].join(","),
      ...filteredLogs.map((l) => [
        l.id, l.contractName, l.eventName, l.blockHeight, l.txHash, l.timestamp, JSON.stringify(l.params)
      ].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `event-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const runReplay = () => {
    const selectedLogs = logs.filter((l) => replaySelected.has(l.id));
    const results = selectedLogs.map((l) => ({
      logId: l.id,
      status: (Math.random() > 0.2 ? "success" : "failed") as "success" | "failed",
      message: `Replayed ${l.eventName} at block ${l.blockHeight}`,
    }));
    setReplayResults(results);
    setReplayOpen(false);
    setReplayViewOpen(true);
    setReplaySelected(new Set());
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
            智能合约事件订阅、日志、Webhook 与重放管理
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="events">事件订阅</TabsTrigger>
          <TabsTrigger value="logs">事件日志</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook</TabsTrigger>
          <TabsTrigger value="filters">过滤规则</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
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
                {filteredEvents.map((event) => (
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
                          onClick={() => openWebhook(event.id)}
                          title="Webhook"
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openRule(event.id)}
                          title="过滤规则"
                        >
                          <Filter className="w-4 h-4" />
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
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="事件名称" value={logFilterEvent} onChange={e => setLogFilterEvent(e.target.value)} className="max-w-[160px]" />
            <Input placeholder="合约名称" value={logFilterContract} onChange={e => setLogFilterContract(e.target.value)} className="max-w-[160px]" />
            <Input type="date" value={logFilterStart} onChange={e => setLogFilterStart(e.target.value)} className="max-w-[160px]" />
            <Input type="date" value={logFilterEnd} onChange={e => setLogFilterEnd(e.target.value)} className="max-w-[160px]" />
            <Button variant="outline" className="gap-2" onClick={() => { setLogFilterEvent(""); setLogFilterContract(""); setLogFilterStart(""); setLogFilterEnd(""); }}>
              <RefreshCw className="w-4 h-4" /> 重置
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportLogs}>
              <Download className="w-4 h-4" /> 导出
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setReplayOpen(true)}>
              <RotateCcw className="w-4 h-4" /> 重放
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["时间", "区块高度", "交易哈希", "合约", "事件", "参数", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.timestamp}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.blockHeight}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.txHash}</td>
                    <td className="px-4 py-3">{log.contractName}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{log.eventName}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(log.params).map(([k, v]) => (
                          <Badge key={k} variant="secondary" className="text-[10px]">{k}: {String(v)}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => {
                        const matchingRules = rules.filter(r => r.eventId === events.find(e => e.eventName === log.eventName)?.id && testRule(r, log));
                        alert(`匹配规则: ${matchingRules.map(r => r.name).join(", ") || "无"}`);
                      }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["事件ID", "URL", "方法", "重试次数", "重试间隔(秒)", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-mono text-xs">{wh.eventId}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[300px] truncate">{wh.url}</td>
                    <td className="px-4 py-3"><Badge>{wh.method}</Badge></td>
                    <td className="px-4 py-3">{wh.retryCount}</td>
                    <td className="px-4 py-3">{wh.retryInterval}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openWebhook(wh.eventId, wh)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setWebhookHistoryId(wh.id); setWebhookHistoryOpen(true); }}><History className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setWebhooks(prev => prev.filter(w => w.id !== wh.id))}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["规则ID", "事件ID", "规则名称", "条件", "逻辑", "状态", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-mono text-xs">{rule.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{rule.eventId}</td>
                    <td className="px-4 py-3 font-medium">{rule.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {rule.conditions.map((c, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{c.param} {c.operator} {c.value}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{rule.logic}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge className={rule.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                        {rule.enabled ? "启用" : "禁用"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openRule(rule.eventId, rule)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const testLog = logs.find(l => events.find(e => e.id === rule.eventId)?.eventName === l.eventName);
                          if (testLog) {
                            const pass = testRule(rule, testLog);
                            alert(`规则测试${pass ? "通过" : "未通过"} (使用日志 ${testLog.id})`);
                          } else {
                            alert("未找到匹配的测试日志");
                          }
                        }}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

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

      {/* Webhook Dialog */}
      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" /> Webhook 配置
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input value={webhookForm.url || ""} onChange={e => setWebhookForm({ ...webhookForm, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">请求方法</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={webhookForm.method || "POST"} onChange={e => setWebhookForm({ ...webhookForm, method: e.target.value })}>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">请求头 (每行一个 Key: Value)</label>
              <textarea className="w-full border rounded-md px-3 py-2 text-sm font-mono min-h-[80px]" value={webhookForm.headers || ""} onChange={e => setWebhookForm({ ...webhookForm, headers: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">请求体模板</label>
              <textarea className="w-full border rounded-md px-3 py-2 text-sm font-mono min-h-[80px]" value={webhookForm.bodyTemplate || ""} onChange={e => setWebhookForm({ ...webhookForm, bodyTemplate: e.target.value })} placeholder='{"event": "{{eventName}}"}' />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">重试次数</label>
                <Input type="number" value={webhookForm.retryCount || 3} onChange={e => setWebhookForm({ ...webhookForm, retryCount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">重试间隔(秒)</label>
                <Input type="number" value={webhookForm.retryInterval || 5} onChange={e => setWebhookForm({ ...webhookForm, retryInterval: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveWebhook}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook History Dialog */}
      <Dialog open={webhookHistoryOpen} onOpenChange={setWebhookHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> 发送历史
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["时间", "状态", "响应码", "响应体"].map(h => <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {webhookHistory.filter(h => h.webhookId === webhookHistoryId).map(h => (
                  <tr key={h.id} className="border-t">
                    <td className="px-4 py-2">{h.sentAt}</td>
                    <td className="px-4 py-2"><Badge className={h.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>{h.status}</Badge></td>
                    <td className="px-4 py-2">{h.responseCode || "-"}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500 max-w-[300px] truncate">{h.responseBody || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Rule Dialog */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> 过滤规则
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">规则名称</label>
              <Input value={ruleForm.name || ""} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">逻辑关系</label>
              <div className="flex gap-2">
                {(["AND", "OR"] as const).map(l => (
                  <button key={l} onClick={() => setRuleForm({ ...ruleForm, logic: l })} className={cn("px-3 py-1.5 rounded text-sm border", ruleForm.logic === l ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">条件列表</label>
              <div className="space-y-2">
                {ruleForm.conditions?.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input placeholder="参数名" value={c.param} onChange={e => {
                      const conds = [...(ruleForm.conditions || [])];
                      conds[i] = { ...c, param: e.target.value };
                      setRuleForm({ ...ruleForm, conditions: conds });
                    }} className="flex-1" />
                    <select value={c.operator} onChange={e => {
                      const conds = [...(ruleForm.conditions || [])];
                      conds[i] = { ...c, operator: e.target.value as any };
                      setRuleForm({ ...ruleForm, conditions: conds });
                    }} className="border rounded-md px-2 py-1.5 text-sm">
                      <option value=">">{'>'}</option>
                      <option value="<">{'<'}</option>
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value="contains">包含</option>
                    </select>
                    <Input placeholder="值" value={c.value} onChange={e => {
                      const conds = [...(ruleForm.conditions || [])];
                      conds[i] = { ...c, value: e.target.value };
                      setRuleForm({ ...ruleForm, conditions: conds });
                    }} className="flex-1" />
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                      const conds = [...(ruleForm.conditions || [])];
                      conds.splice(i, 1);
                      setRuleForm({ ...ruleForm, conditions: conds });
                    }}><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => setRuleForm({ ...ruleForm, conditions: [...(ruleForm.conditions || []), { param: "", operator: ">", value: "" }] })}>
                <Plus className="w-4 h-4 mr-1" /> 添加条件
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={ruleForm.enabled} onChange={e => setRuleForm({ ...ruleForm, enabled: e.target.checked })} className="rounded" />
              <label className="text-sm">启用规则</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveRule}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replay Dialog */}
      <Dialog open={replayOpen} onOpenChange={setReplayOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> 事件重放
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  <th className="px-4 py-2"><input type="checkbox" checked={replaySelected.size === filteredLogs.length && filteredLogs.length > 0} onChange={e => {
                    if (e.target.checked) setReplaySelected(new Set(filteredLogs.map(l => l.id)));
                    else setReplaySelected(new Set());
                  }} /></th>
                  {["时间", "合约", "事件", "区块高度", "交易哈希"].map(h => <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2"><input type="checkbox" checked={replaySelected.has(log.id)} onChange={e => {
                      const next = new Set(replaySelected);
                      if (e.target.checked) next.add(log.id);
                      else next.delete(log.id);
                      setReplaySelected(next);
                    }} /></td>
                    <td className="px-4 py-2">{log.timestamp}</td>
                    <td className="px-4 py-2">{log.contractName}</td>
                    <td className="px-4 py-2"><Badge variant="outline">{log.eventName}</Badge></td>
                    <td className="px-4 py-2 font-mono">{log.blockHeight}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{log.txHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <span className="text-sm text-slate-500">已选择 {replaySelected.size} 条</span>
            <Button variant="outline" onClick={() => setReplayOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={replaySelected.size === 0} onClick={runReplay}>
              <Play className="w-4 h-4 mr-1" /> 批量重放
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replay Result Dialog */}
      <Dialog open={replayViewOpen} onOpenChange={setReplayViewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>重放结果</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {replayResults.map((r) => (
              <div key={r.logId} className={cn("flex items-center gap-3 p-3 rounded-lg border", r.status === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
                {r.status === "success" ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-red-600" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.logId}</div>
                  <div className="text-xs text-slate-500">{r.message}</div>
                </div>
                <Badge className={r.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>{r.status}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setReplayViewOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
