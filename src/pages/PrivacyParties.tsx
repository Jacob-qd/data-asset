import { useState } from "react";
import { Users, Search, Plus, Eye, Edit2, Trash2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

interface PrivacyParty { id: string; name: string; type: string; status: string; ip: string; port: string; publicKey: string; registeredDate: string; role: string; projectCount: number; cpu: number; memory: number; }

const mockParties: PrivacyParty[] = [
  { id: "PP-001", name: "阿里云", type: "企业", status: "online", ip: "10.0.1.10", port: "8080", publicKey: "a1b2c3...d4e5", registeredDate: "2026-01-15", role: "数据方+计算方", projectCount: 5, cpu: 45, memory: 62 },
  { id: "PP-002", name: "腾讯云", type: "企业", status: "online", ip: "10.0.1.11", port: "8080", publicKey: "b2c3d4...e5f6", registeredDate: "2026-01-20", role: "数据方", projectCount: 3, cpu: 32, memory: 48 },
  { id: "PP-003", name: "华为云", type: "企业", status: "online", ip: "10.0.1.12", port: "8080", publicKey: "c3d4e5...f6g7", registeredDate: "2026-02-10", role: "计算方", projectCount: 4, cpu: 78, memory: 85 },
  { id: "PP-004", name: "招商银行", type: "企业", status: "online", ip: "10.0.2.10", port: "9090", publicKey: "d4e5f6...g7h8", registeredDate: "2026-02-15", role: "数据方", projectCount: 2, cpu: 25, memory: 35 },
  { id: "PP-005", name: "平安科技", type: "企业", status: "offline", ip: "10.0.2.11", port: "8080", publicKey: "e5f6g7...h8i9", registeredDate: "2026-03-01", role: "审计方", projectCount: 1, cpu: 0, memory: 0 },
  { id: "PP-006", name: "微众银行", type: "企业", status: "online", ip: "10.0.3.10", port: "8080", publicKey: "f6g7h8...i9j0", registeredDate: "2026-03-10", role: "计算方", projectCount: 6, cpu: 55, memory: 58 },
  { id: "PP-007", name: "百度智能云", type: "企业", status: "online", ip: "10.0.3.11", port: "8080", publicKey: "g7h8i9...j0k1", registeredDate: "2026-03-20", role: "数据方", projectCount: 2, cpu: 40, memory: 42 },
  { id: "PP-008", name: "中科院", type: "机构", status: "online", ip: "10.0.5.10", port: "7070", publicKey: "h8i9j0...k1l2", registeredDate: "2026-04-10", role: "审计方", projectCount: 2, cpu: 15, memory: 28 },
];

const fields: FieldConfig[] = [
  { key: "name", label: "名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", options: [{ label: "企业", value: "企业" }, { label: "机构", value: "机构" }] },
  { key: "status", label: "状态", type: "select", options: [{ label: "在线", value: "online" }, { label: "离线", value: "offline" }] },
  { key: "ip", label: "IP地址", type: "text" },
  { key: "port", label: "端口", type: "text" },
  { key: "publicKey", label: "公钥", type: "text" },
  { key: "role", label: "角色", type: "select", options: [{ label: "数据方", value: "数据方" }, { label: "计算方", value: "计算方" }, { label: "审计方", value: "审计方" }, { label: "数据方+计算方", value: "数据方+计算方" }] },
  { key: "projectCount", label: "项目数", type: "number" },
];

const detailFields = [
  { key: "id", label: "ID" },
  { key: "name", label: "名称" },
  { key: "type", label: "类型" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "ip", label: "IP地址" },
  { key: "port", label: "端口" },
  { key: "publicKey", label: "公钥" },
  { key: "role", label: "角色" },
  { key: "projectCount", label: "项目数" },
  { key: "cpu", label: "CPU使用率" },
  { key: "memory", label: "内存使用率" },
  { key: "registeredDate", label: "注册日期" },
];

export default function PrivacyParties() {
  const [parties, setParties] = useState<PrivacyParty[]>(mockParties);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<PrivacyParty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = parties.filter((p) => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "all" || p.status === statusFilter;
    return ms && mf;
  });

  const stats = [
    { label: "参与方总数", value: parties.length, icon: Users, color: "text-blue-500" },
    { label: "在线", value: parties.filter((p) => p.status === "online").length, icon: Wifi, color: "text-emerald-500" },
    { label: "离线", value: parties.filter((p) => p.status === "offline").length, icon: WifiOff, color: "text-red-500" },
  ];

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (party: PrivacyParty) => {
    setSelectedItem(party);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (party: PrivacyParty) => {
    setParties((prev) => prev.filter((p) => p.id !== party.id));
    setDrawerOpen(false);
    setDialogOpen(false);
  };

  const handleView = (party: PrivacyParty) => {
    setSelectedItem(party);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newParty: PrivacyParty = {
        id: `PP-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        type: data.type || "企业",
        status: data.status || "online",
        ip: data.ip || "",
        port: data.port || "",
        publicKey: data.publicKey || "",
        registeredDate: new Date().toISOString().split("T")[0],
        role: data.role || "数据方",
        projectCount: Number(data.projectCount) || 0,
        cpu: 0,
        memory: 0,
      };
      setParties((prev) => [...prev, newParty]);
    } else if (dialogMode === "edit" && selectedItem) {
      setParties((prev) =>
        prev.map((p) =>
          p.id === selectedItem.id
            ? {
                ...p,
                ...data,
                projectCount: Number(data.projectCount) || p.projectCount,
              }
            : p
        )
      );
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "id", title: "ID", cell: (p: PrivacyParty) => <span className="font-mono text-xs text-slate-500">{p.id}</span> },
    { key: "name", title: "名称", cell: (p: PrivacyParty) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: "type", title: "类型", cell: (p: PrivacyParty) => <Badge variant="outline" className="text-xs">{p.type}</Badge> },
    { key: "status", title: "状态", cell: (p: PrivacyParty) => <div className="flex items-center gap-1.5"><span className={cn("w-2 h-2 rounded-full", p.status === "online" ? "bg-emerald-500" : "bg-red-500")} /><span className="text-xs text-slate-500">{p.status === "online" ? "在线" : "离线"}</span></div> },
    { key: "endpoint", title: "地址", cell: (p: PrivacyParty) => <span className="font-mono text-xs text-slate-500">{p.ip}:{p.port}</span> },
    { key: "role", title: "角色", cell: (p: PrivacyParty) => <span className="text-xs text-slate-500">{p.role}</span> },
    { key: "projects", title: "项目数", cell: (p: PrivacyParty) => <span className="text-xs text-slate-500">{p.projectCount}</span> },
    { key: "actions", title: "操作", cell: (p: PrivacyParty) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleView(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索参与方" className="pl-9 w-64" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option value="all">全部</option><option value="online">在线</option><option value="offline">离线</option></select>
        </div>
        <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" />注册参与方</Button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="参与方"
        fields={fields}
        data={selectedItem || {}}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={selectedItem ? () => handleDelete(selectedItem) : undefined}
      />
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="参与方详情"
        data={selectedItem || {}}
        fields={detailFields}
        onEdit={selectedItem ? () => handleEdit(selectedItem) : undefined}
        onDelete={selectedItem ? () => handleDelete(selectedItem) : undefined}
      />
    </div>
  );
}
