import { useState } from "react";
import { Network, Plus, Search, Globe, Code, Webhook, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface ApiItem {
  id: string;
  name: string;
  method: string;
  path: string;
  version: string;
  status: string;
  auth: string;
  rateLimit: string;
  calls: number;
}

interface SdkItem {
  language: string;
  version: string;
  downloads: number;
  install: string;
  docs: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string;
  status: string;
  secret: string;
  lastDelivery: string;
}

type DialogMode = "create" | "edit" | "view" | "delete";

const initialApis: ApiItem[] = [
  { id: "API-001", name: "任务创建", method: "POST", path: "/api/v1/tasks", version: "v1", status: "active", auth: "Token", rateLimit: "1000/h", calls: 52300 },
  { id: "API-002", name: "任务查询", method: "GET", path: "/api/v1/tasks/:id", version: "v1", status: "active", auth: "Token", rateLimit: "5000/h", calls: 128000 },
  { id: "API-003", name: "结果获取", method: "GET", path: "/api/v1/tasks/:id/result", version: "v1", status: "active", auth: "OAuth", rateLimit: "1000/h", calls: 45600 },
  { id: "API-004", name: "参与方注册", method: "POST", path: "/api/v1/parties", version: "v1", status: "active", auth: "mTLS", rateLimit: "100/h", calls: 890 },
  { id: "API-005", name: "数据上传", method: "POST", path: "/api/v1/data/upload", version: "v1", status: "active", auth: "Token", rateLimit: "500/h", calls: 12300 },
  { id: "API-006", name: "模型发布", method: "POST", path: "/api/v1/models/:id/publish", version: "v1", status: "active", auth: "OAuth", rateLimit: "50/h", calls: 450 },
  { id: "API-007", name: "监控指标", method: "GET", path: "/api/v1/metrics", version: "v2", status: "active", auth: "Token", rateLimit: "10000/h", calls: 256000 },
  { id: "API-008", name: "日志查询", method: "GET", path: "/api/v1/audit/logs", version: "v1", status: "active", auth: "OAuth", rateLimit: "2000/h", calls: 67800 },
  { id: "API-009", name: "密钥交换", method: "POST", path: "/api/v1/crypto/keyexchange", version: "v1", status: "active", auth: "mTLS", rateLimit: "500/h", calls: 5600 },
  { id: "API-010", name: "结果验证", method: "POST", path: "/api/v1/verify", version: "v2", status: "active", auth: "Token", rateLimit: "2000/h", calls: 34500 },
  { id: "API-011", name: "批处理", method: "POST", path: "/api/v1/batch", version: "v1", status: "inactive", auth: "Token", rateLimit: "100/h", calls: 1200 },
  { id: "API-012", name: "实时流", method: "WS", path: "/api/v1/stream", version: "v1", status: "active", auth: "Token", rateLimit: "∞", calls: 89000 },
];

const initialSdks: SdkItem[] = [
  { language: "Python", version: "2.3.1", downloads: 45200, install: "pip install privacy-sdk", docs: "/docs/python" },
  { language: "Java", version: "1.8.5", downloads: 28500, install: "<dependency>privacy-sdk</dependency>", docs: "/docs/java" },
  { language: "Go", version: "1.2.0", downloads: 12300, install: "go get privacy-sdk", docs: "/docs/go" },
  { language: "Node.js", version: "3.0.2", downloads: 18900, install: "npm install privacy-sdk", docs: "/docs/nodejs" },
];

const initialWebhooks: WebhookItem[] = [
  { id: "WH-001", name: "任务完成通知", url: "https://example.com/webhook/task", events: "task_complete", status: "active", secret: "sk_****1234", lastDelivery: "2026-04-21 10:30:00" },
  { id: "WH-002", name: "告警通知", url: "https://example.com/webhook/alert", events: "alert", status: "active", secret: "sk_****5678", lastDelivery: "2026-04-21 09:00:00" },
  { id: "WH-003", name: "节点状态", url: "https://example.com/webhook/node", events: "node_status", status: "inactive", secret: "sk_****9012", lastDelivery: "2026-04-20 18:00:00" },
];

const apiFields: FieldConfig[] = [
  { key: "name", label: "名称", type: "text", required: true },
  { key: "method", label: "方法", type: "select", required: true, options: [{ label: "GET", value: "GET" }, { label: "POST", value: "POST" }, { label: "PUT", value: "PUT" }, { label: "DELETE", value: "DELETE" }, { label: "WS", value: "WS" }] },
  { key: "path", label: "路径", type: "text", required: true },
  { key: "version", label: "版本", type: "select", required: true, options: [{ label: "v1", value: "v1" }, { label: "v2", value: "v2" }] },
  { key: "status", label: "状态", type: "select", required: true, options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
  { key: "auth", label: "认证", type: "select", required: true, options: [{ label: "Token", value: "Token" }, { label: "OAuth", value: "OAuth" }, { label: "mTLS", value: "mTLS" }] },
  { key: "rateLimit", label: "限流", type: "text", required: true },
];

const webhookFields: FieldConfig[] = [
  { key: "name", label: "名称", type: "text", required: true },
  { key: "url", label: "URL", type: "text", required: true },
  { key: "events", label: "事件类型", type: "text", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
  { key: "secret", label: "密钥", type: "text" },
  { key: "lastDelivery", label: "最后推送", type: "text" },
];

const apiDetailFields = [
  { key: "id", label: "ID" },
  { key: "name", label: "名称" },
  { key: "method", label: "方法", type: "badge" as const },
  { key: "path", label: "路径" },
  { key: "version", label: "版本", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "auth", label: "认证", type: "badge" as const },
  { key: "rateLimit", label: "限流" },
  { key: "calls", label: "调用量" },
];

const webhookDetailFields = [
  { key: "id", label: "ID" },
  { key: "name", label: "名称" },
  { key: "url", label: "URL" },
  { key: "events", label: "事件类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "secret", label: "密钥" },
  { key: "lastDelivery", label: "最后推送" },
];

export default function PrivacyAPI() {
  const [activeTab, setActiveTab] = useState<"api" | "sdk" | "webhook" | "stats">("api");
  const [apis, setApis] = useState<ApiItem[]>(initialApis);
  const [sdks] = useState<SdkItem[]>(initialSdks);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | undefined>(undefined);
  const [dialogType, setDialogType] = useState<"api" | "webhook">("api");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"api" | "webhook">("api");

  const stats = [
    { label: "API总数", value: apis.length, icon: Network, color: "text-blue-500" },
    { label: "活跃", value: apis.filter((a) => a.status === "active").length, icon: Globe, color: "text-emerald-500" },
    { label: "今日调用", value: "12.8K", icon: Code, color: "text-purple-500" },
    { label: "平均延迟", value: "45ms", icon: Network, color: "text-amber-500" },
  ];

  const openCreateDialog = (type: "api" | "webhook") => {
    setDialogType(type);
    setDialogMode("create");
    setSelectedItem(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (item: Record<string, any>) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: Record<string, any>) => {
    setDialogMode("delete");
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDetailDrawer = (item: Record<string, any>, type: "api" | "webhook") => {
    setDrawerType(type);
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleApiSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newApi: ApiItem = {
        id: "API-" + Date.now().toString(36).toUpperCase(),
        name: data.name,
        method: data.method,
        path: data.path,
        version: data.version,
        status: data.status,
        auth: data.auth,
        rateLimit: data.rateLimit,
        calls: 0,
      };
      setApis((prev) => [...prev, newApi]);
    } else if (dialogMode === "edit" && selectedItem) {
      setApis((prev) =>
        prev.map((a) =>
          a.id === selectedItem.id
            ? { ...a, ...data }
            : a
        )
      );
    }
  };

  const handleApiDelete = () => {
    if (selectedItem) {
      setApis((prev) => prev.filter((a) => a.id !== selectedItem.id));
    }
  };

  const handleWebhookSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newWebhook: WebhookItem = {
        id: "WH-" + Date.now().toString(36).toUpperCase(),
        name: data.name,
        url: data.url,
        events: data.events,
        status: data.status,
        secret: data.secret || "",
        lastDelivery: data.lastDelivery || "",
      };
      setWebhooks((prev) => [...prev, newWebhook]);
    } else if (dialogMode === "edit" && selectedItem) {
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === selectedItem.id
            ? { ...w, ...data }
            : w
        )
      );
    }
  };

  const handleWebhookDelete = () => {
    if (selectedItem) {
      setWebhooks((prev) => prev.filter((w) => w.id !== selectedItem.id));
    }
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogType === "api") {
      handleApiSubmit(data);
    } else {
      handleWebhookSubmit(data);
    }
  };

  const handleDelete = () => {
    if (dialogType === "api") {
      handleApiDelete();
    } else {
      handleWebhookDelete();
    }
  };

  const handleEdit = () => {
    setDrawerOpen(false);
    setDialogType(drawerType);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteFromDrawer = () => {
    setDrawerOpen(false);
    setDialogType(drawerType);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const apiCols = [
    { key: "id", title: "ID", render: (a: ApiItem) => <span className="font-mono text-xs text-slate-500">{a.id}</span> },
    { key: "name", title: "名称", render: (a: ApiItem) => <span className="font-medium text-slate-800">{a.name}</span> },
    { key: "method", title: "方法", render: (a: ApiItem) => <Badge className={cn("text-xs", a.method === "GET" ? "bg-blue-500/10 text-blue-600" : a.method === "POST" ? "bg-emerald-500/10 text-emerald-600" : a.method === "WS" ? "bg-purple-500/10 text-purple-600" : "bg-amber-500/10 text-amber-600")}>{a.method}</Badge> },
    { key: "path", title: "路径", render: (a: ApiItem) => <span className="font-mono text-xs text-slate-600">{a.path}</span> },
    { key: "version", title: "版本", render: (a: ApiItem) => <Badge variant="outline" className="text-xs">{a.version}</Badge> },
    { key: "auth", title: "认证", render: (a: ApiItem) => <Badge variant="outline" className="text-xs">{a.auth}</Badge> },
    { key: "rate", title: "限流", render: (a: ApiItem) => <span className="text-xs text-slate-500">{a.rateLimit}</span> },
    { key: "calls", title: "调用量", render: (a: ApiItem) => <span className="text-xs text-slate-500">{a.calls.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{ k: "api", l: "API列表" }, { k: "sdk", l: "SDK" }, { k: "webhook", l: "Webhook" }, { k: "stats", l: "调用统计" }].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "api" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索API" className="pl-9 w-64" /></div>
          <Button onClick={() => openCreateDialog("api")} className="gap-2"><Plus className="w-4 h-4" />新建API</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={apiCols} data={apis} onRowClick={(row) => openDetailDrawer(row, "api")} /></div>
      </div>}

      {activeTab === "sdk" && <div className="grid grid-cols-2 gap-4">
        {sdks.map((s) => (
          <div key={s.language} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-slate-800">{s.language}</h3><Badge variant="outline">v{s.version}</Badge></div>
            <div className="text-xs text-slate-500 mb-2">下载量: {s.downloads.toLocaleString()}</div>
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 mb-3">{s.install}</div>
            <Button variant="outline" size="sm" className="gap-1"><BookOpen className="w-3.5 h-3.5" />文档</Button>
          </div>
        ))}
      </div>}

      {activeTab === "webhook" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索Webhook" className="pl-9 w-64" /></div>
          <Button onClick={() => openCreateDialog("webhook")} className="gap-2"><Plus className="w-4 h-4" />新建Webhook</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">名称</th><th className="text-left py-3 px-4 text-slate-500 font-medium">URL</th><th className="text-left py-3 px-4 text-slate-500 font-medium">事件类型</th><th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th><th className="text-left py-3 px-4 text-slate-500 font-medium">最后推送</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{webhooks.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openDetailDrawer(w, "webhook")}><td className="py-3 px-4 font-medium text-slate-800">{w.name}</td><td className="py-3 px-4 font-mono text-xs text-slate-500">{w.url}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{w.events}</Badge></td><td className="py-3 px-4"><Badge className={cn("text-xs", w.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500")}>{w.status === "active" ? "启用" : "停用"}</Badge></td><td className="py-3 px-4 text-xs text-slate-500">{w.lastDelivery}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {activeTab === "stats" && <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">API调用趋势</h3><div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">调用趋势图表</div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">Top API</h3><div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">TOP排行图表</div></div>
      </div>}

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogType === "api" ? "API接口" : "Webhook"}
        fields={dialogType === "api" ? apiFields : webhookFields}
        data={selectedItem}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerType === "api" ? "API详情" : "Webhook详情"}
        data={selectedItem || {}}
        fields={drawerType === "api" ? apiDetailFields : webhookDetailFields}
        onEdit={handleEdit}
        onDelete={handleDeleteFromDrawer}
      />
    </div>
  );
}
