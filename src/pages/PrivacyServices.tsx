import { useState } from "react";
import { Activity, Plus, Search, Globe, Zap, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  type: string;
  version: string;
  status: string;
  qos: { latency: string; throughput: string; availability: string };
  rateLimit: string;
  circuitBreaker: string;
  deploy: string;
};

const initialServices: Service[] = [
  { id: "SVC-001", name: "MPC联合计算服务", type: "API", version: "2.1.0", status: "online", qos: { latency: "<50ms", throughput: "1000TPS", availability: "99.9%" }, rateLimit: "10000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-002", name: "HE加密计算服务", type: "Stream", version: "1.5.0", status: "online", qos: { latency: "<100ms", throughput: "500TPS", availability: "99.5%" }, rateLimit: "5000/h", circuitBreaker: "closed", deploy: "canary" },
  { id: "SVC-003", name: "ZKP验证服务", type: "API", version: "3.0.0", status: "online", qos: { latency: "<30ms", throughput: "2000TPS", availability: "99.99%" }, rateLimit: "20000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-004", name: "TEE安全推理服务", type: "Batch", version: "2.0.0", status: "deploying", qos: { latency: "<200ms", throughput: "100TPS", availability: "99.0%" }, rateLimit: "2000/h", circuitBreaker: "closed", deploy: "gray" },
  { id: "SVC-005", name: "联邦学习训练服务", type: "Stream", version: "4.0.0", status: "online", qos: { latency: "<500ms", throughput: "50TPS", availability: "99.5%" }, rateLimit: "1000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-006", name: "隐私求交服务", type: "API", version: "2.2.0", status: "offline", qos: { latency: "-", throughput: "-", availability: "0%" }, rateLimit: "-", circuitBreaker: "open", deploy: "blue-green" },
  { id: "SVC-007", name: "隐匿查询服务", type: "API", version: "1.8.0", status: "online", qos: { latency: "<80ms", throughput: "800TPS", availability: "99.9%" }, rateLimit: "8000/h", circuitBreaker: "closed", deploy: "canary" },
  { id: "SVC-008", name: "联合统计服务", type: "Batch", version: "3.1.0", status: "online", qos: { latency: "<300ms", throughput: "200TPS", availability: "99.5%" }, rateLimit: "3000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-009", name: "密钥管理服务", type: "API", version: "5.0.0", status: "online", qos: { latency: "<20ms", throughput: "5000TPS", availability: "99.99%" }, rateLimit: "50000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-010", name: "结果验证服务", type: "API", version: "2.0.0", status: "online", qos: { latency: "<40ms", throughput: "1500TPS", availability: "99.9%" }, rateLimit: "15000/h", circuitBreaker: "closed", deploy: "gray" },
];

export default function PrivacyServices() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Service | null>(null);

  const filtered = services.filter((s) => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "all" || s.type === typeFilter;
    return ms && mt;
  });

  const stats = [
    { label: "服务总数", value: services.length, icon: Activity, color: "text-blue-500" },
    { label: "在线", value: services.filter((s) => s.status === "online").length, icon: Globe, color: "text-emerald-500" },
    { label: "总调用", value: "98.5K", icon: Zap, color: "text-amber-500" },
  ];

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: Service) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (item: Service) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (item: Service) => {
    setSelectedItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newService: Service = {
        id: Date.now().toString(36).toUpperCase(),
        name: data.name || "",
        type: data.type || "API",
        version: data.version || "1.0.0",
        status: data.status || "offline",
        qos: { latency: "-", throughput: "-", availability: "0%" },
        rateLimit: data.rateLimit || "-",
        circuitBreaker: data.circuitBreaker || "closed",
        deploy: data.deploy || "blue-green",
      };
      setServices((prev) => [...prev, newService]);
    } else if (dialogMode === "edit" && selectedItem) {
      setServices((prev) => prev.map((s) => (s.id === selectedItem.id ? { ...s, ...data } : s)));
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setServices((prev) => prev.filter((s) => s.id !== selectedItem.id));
    }
    setDialogOpen(false);
  };

  const fields: FieldConfig[] = [
    { key: "name", label: "服务名称", type: "text", required: true },
    { key: "type", label: "类型", type: "select", options: [{ label: "API", value: "API" }, { label: "Stream", value: "Stream" }, { label: "Batch", value: "Batch" }] },
    { key: "version", label: "版本", type: "text" },
    { key: "status", label: "状态", type: "select", options: [{ label: "在线", value: "online" }, { label: "部署中", value: "deploying" }, { label: "离线", value: "offline" }] },
    { key: "rateLimit", label: "限流", type: "text" },
    { key: "circuitBreaker", label: "熔断器", type: "select", options: [{ label: "关闭", value: "closed" }, { label: "开启", value: "open" }, { label: "半开", value: "half-open" }] },
    { key: "deploy", label: "部署策略", type: "select", options: [{ label: "蓝绿", value: "blue-green" }, { label: "金丝雀", value: "canary" }, { label: "灰度", value: "gray" }] },
  ];

  const columns = [
    { key: "id", title: "ID", render: (s: Service) => <span className="font-mono text-xs text-slate-500">{s.id}</span> },
    { key: "name", title: "服务名称", render: (s: Service) => <span className="font-medium text-slate-800">{s.name}</span> },
    { key: "type", title: "类型", render: (s: Service) => <Badge variant="outline" className="text-xs">{s.type}</Badge> },
    { key: "version", title: "版本", render: (s: Service) => <Badge className="font-mono text-xs bg-slate-100 text-slate-600">{s.version}</Badge> },
    { key: "status", title: "状态", render: (s: Service) => <StatusTag status={s.status === "online" ? "success" : s.status === "deploying" ? "warning" : "danger"} text={s.status === "online" ? "在线" : s.status === "deploying" ? "部署中" : "离线"} /> },
    { key: "qos", title: "QoS", render: (s: Service) => <div className="text-xs text-slate-500"><div>延迟: {s.qos.latency}</div><div>吞吐: {s.qos.throughput}</div></div> },
    { key: "circuit", title: "熔断器", render: (s: Service) => <Badge className={cn("text-xs", s.circuitBreaker === "closed" ? "bg-emerald-500/10 text-emerald-600" : s.circuitBreaker === "open" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600")}>{s.circuitBreaker === "closed" ? "关闭" : s.circuitBreaker === "open" ? "开启" : "半开"}</Badge> },
    { key: "deploy", title: "部署策略", render: (s: Service) => <Badge variant="outline" className="text-xs">{s.deploy === "blue-green" ? "蓝绿" : s.deploy === "canary" ? "金丝雀" : "灰度"}</Badge> },
    { key: "actions", title: "操作", width: "120px", render: (s: Service) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleView(s); }}>
          <Eye className="w-4 h-4 text-slate-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>
          <Pencil className="w-4 h-4 text-slate-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDelete(s); }}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    )},
  ];

  const drawerFields: { key: string; label: string; type?: "text" | "badge" | "date" | "list" }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "服务名称" },
    { key: "type", label: "类型", type: "badge" },
    { key: "version", label: "版本", type: "badge" },
    { key: "status", label: "状态", type: "badge" },
    { key: "qosSummary", label: "QoS" },
    { key: "rateLimit", label: "限流" },
    { key: "circuitBreaker", label: "熔断器", type: "badge" },
    { key: "deploy", label: "部署策略", type: "badge" },
  ];

  const drawerData = selectedItem
    ? {
        ...selectedItem,
        status: selectedItem.status === "online" ? "在线" : selectedItem.status === "deploying" ? "部署中" : "离线",
        circuitBreaker: selectedItem.circuitBreaker === "closed" ? "关闭" : selectedItem.circuitBreaker === "open" ? "开启" : "半开",
        deploy: selectedItem.deploy === "blue-green" ? "蓝绿" : selectedItem.deploy === "canary" ? "金丝雀" : "灰度",
        qosSummary: `延迟: ${selectedItem.qos.latency}, 吞吐: ${selectedItem.qos.throughput}, 可用性: ${selectedItem.qos.availability}`,
      }
    : {};

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索服务" className="pl-9 w-64" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm">
            <option value="all">全部</option>
            <option>API</option>
            <option>Stream</option>
            <option>Batch</option>
          </select>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />新建服务
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} />
      </div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="数据服务"
        fields={fields}
        data={selectedItem ?? undefined}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="数据服务详情"
        data={drawerData}
        fields={drawerFields}
        onEdit={() => { setDrawerOpen(false); if (selectedItem) handleEdit(selectedItem); }}
        onDelete={() => { setDrawerOpen(false); if (selectedItem) handleDelete(selectedItem); }}
      />
    </div>
  );
}
