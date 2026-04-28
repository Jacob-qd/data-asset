import { useState } from "react";
import { HardDrive, Plus, Server, Cpu, MemoryStick, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

type TabKey = "pool" | "quota" | "reservation" | "strategy";
type DialogMode = "create" | "edit" | "view" | "delete";
type DialogType = "resource" | "quota" | "reservation";

interface ResourceItem {
  id: string;
  node: string;
  cpu: { used: number; total: number };
  memory: { used: number; total: number };
  gpu: { used: number; total: number };
  disk: string;
  bandwidth: string;
  status: string;
}

interface QuotaItem {
  id: string;
  project: string;
  party: string;
  cpu: string;
  memory: string;
  gpu: string;
  disk: string;
}

interface ReservationItem {
  id: string;
  project: string;
  resource: string;
  amount: string;
  start: string;
  end: string;
  status: string;
}

const initialResources: ResourceItem[] = [
  { id: "R-001", node: "Node-A", cpu: { used: 16, total: 32 }, memory: { used: 64, total: 128 }, gpu: { used: 2, total: 4 }, disk: "512GB/2TB", bandwidth: "1Gbps", status: "active" },
  { id: "R-002", node: "Node-B", cpu: { used: 10, total: 32 }, memory: { used: 48, total: 128 }, gpu: { used: 1, total: 4 }, disk: "800GB/2TB", bandwidth: "1Gbps", status: "active" },
  { id: "R-003", node: "Node-C", cpu: { used: 25, total: 32 }, memory: { used: 109, total: 128 }, gpu: { used: 4, total: 4 }, disk: "1.2TB/2TB", bandwidth: "10Gbps", status: "warning" },
  { id: "R-004", node: "Node-D", cpu: { used: 8, total: 16 }, memory: { used: 32, total: 64 }, gpu: { used: 0, total: 2 }, disk: "300GB/1TB", bandwidth: "1Gbps", status: "active" },
  { id: "R-005", node: "Node-E", cpu: { used: 0, total: 32 }, memory: { used: 0, total: 128 }, gpu: { used: 0, total: 4 }, disk: "0/2TB", bandwidth: "-", status: "offline" },
  { id: "R-006", node: "Node-F", cpu: { used: 18, total: 32 }, memory: { used: 74, total: 128 }, gpu: { used: 2, total: 4 }, disk: "600GB/2TB", bandwidth: "1Gbps", status: "active" },
];

const initialQuotas: QuotaItem[] = [
  { id: "Q-001", project: "联合风控建模", party: "阿里云", cpu: "16/32核", memory: "64/128GB", gpu: "2/4卡", disk: "500GB/1TB" },
  { id: "Q-002", project: "医疗数据融合", party: "腾讯云", cpu: "8/32核", memory: "32/128GB", gpu: "1/4卡", disk: "300GB/1TB" },
  { id: "Q-003", project: "跨机构统计", party: "华为云", cpu: "24/32核", memory: "96/128GB", gpu: "4/4卡", disk: "800GB/1TB" },
  { id: "Q-004", project: "供应链协同", party: "微众银行", cpu: "12/32核", memory: "48/128GB", gpu: "2/4卡", disk: "400GB/1TB" },
  { id: "Q-005", project: "推荐引擎", party: "百度智能云", cpu: "8/16核", memory: "32/64GB", gpu: "1/2卡", disk: "200GB/500GB" },
];

const initialReservations: ReservationItem[] = [
  { id: "RS-001", project: "联合风控", resource: "GPU", amount: "2卡", start: "2026-04-21 08:00", end: "2026-04-21 18:00", status: "active" },
  { id: "RS-002", project: "医疗数据", resource: "CPU", amount: "16核", start: "2026-04-21 10:00", end: "2026-04-21 20:00", status: "active" },
  { id: "RS-003", project: "跨机构统计", resource: "内存", amount: "64GB", start: "2026-04-20 08:00", end: "2026-04-20 18:00", status: "expired" },
  { id: "RS-004", project: "供应链", resource: "GPU", amount: "1卡", start: "2026-04-22 08:00", end: "2026-04-22 18:00", status: "pending" },
];

export default function PrivacyResources() {
  const [activeTab, setActiveTab] = useState<TabKey>("pool");
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [quotas, setQuotas] = useState<QuotaItem[]>(initialQuotas);
  const [reservations, setReservations] = useState<ReservationItem[]>(initialReservations);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [dialogType, setDialogType] = useState<DialogType>("resource");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalCpu = resources.reduce((sum, r) => sum + r.cpu.total, 0);
  const totalMem = resources.reduce((sum, r) => sum + r.memory.total, 0);
  const usedGpu = resources.reduce((sum, r) => sum + r.gpu.used, 0);
  const totalGpu = resources.reduce((sum, r) => sum + r.gpu.total, 0);
  const activeResCount = reservations.filter((r) => r.status === "active").length;

  const stats = [
    { label: "总CPU核数", value: `${totalCpu}核`, icon: Cpu, color: "text-blue-500" },
    { label: "总内存", value: `${totalMem}GB`, icon: MemoryStick, color: "text-purple-500" },
    { label: "GPU分配", value: `${usedGpu}/${totalGpu}卡`, icon: Server, color: "text-amber-500" },
    { label: "活跃预留", value: `${activeResCount}`, icon: HardDrive, color: "text-emerald-500" },
  ];

  const openCreate = (type: DialogType) => {
    setDialogType(type);
    setDialogMode("create");
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const openEdit = (type: DialogType, item: any) => {
    setDialogType(type);
    setDialogMode("edit");
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDelete = (type: DialogType, item: any) => {
    setDialogType(type);
    setDialogMode("delete");
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDetail = (item: any) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newId = Date.now().toString(36).toUpperCase();
      if (dialogType === "resource") {
        setResources([
          ...resources,
          {
            id: newId,
            node: data.node,
            cpu: { used: Number(data.cpuUsed) || 0, total: Number(data.cpuTotal) || 32 },
            memory: { used: Number(data.memoryUsed) || 0, total: Number(data.memoryTotal) || 128 },
            gpu: { used: Number(data.gpuUsed) || 0, total: Number(data.gpuTotal) || 4 },
            disk: data.disk,
            bandwidth: data.bandwidth,
            status: data.status,
          },
        ]);
      } else if (dialogType === "quota") {
        setQuotas([
          ...quotas,
          {
            id: newId,
            project: data.project,
            party: data.party,
            cpu: data.cpu,
            memory: data.memory,
            gpu: data.gpu,
            disk: data.disk,
          },
        ]);
      } else if (dialogType === "reservation") {
        setReservations([
          ...reservations,
          {
            id: newId,
            project: data.project,
            resource: data.resource,
            amount: data.amount,
            start: data.start,
            end: data.end,
            status: data.status,
          },
        ]);
      }
    } else if (dialogMode === "edit") {
      if (dialogType === "resource") {
        setResources(
          resources.map((r) =>
            r.id === selectedItem.id
              ? {
                  ...r,
                  node: data.node,
                  cpu: { used: Number(data.cpuUsed) || 0, total: Number(data.cpuTotal) || 32 },
                  memory: { used: Number(data.memoryUsed) || 0, total: Number(data.memoryTotal) || 128 },
                  gpu: { used: Number(data.gpuUsed) || 0, total: Number(data.gpuTotal) || 4 },
                  disk: data.disk,
                  bandwidth: data.bandwidth,
                  status: data.status,
                }
              : r
          )
        );
      } else if (dialogType === "quota") {
        setQuotas(quotas.map((q) => (q.id === selectedItem.id ? { ...q, ...data } : q)));
      } else if (dialogType === "reservation") {
        setReservations(reservations.map((r) => (r.id === selectedItem.id ? { ...r, ...data } : r)));
      }
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (dialogType === "resource") {
      setResources(resources.filter((r) => r.id !== selectedItem.id));
    } else if (dialogType === "quota") {
      setQuotas(quotas.filter((q) => q.id !== selectedItem.id));
    } else if (dialogType === "reservation") {
      setReservations(reservations.filter((r) => r.id !== selectedItem.id));
    }
  };

  const resourceFields: FieldConfig[] = [
    { key: "node", label: "节点", type: "text", required: true },
    { key: "cpuUsed", label: "CPU已用", type: "number", required: true },
    { key: "cpuTotal", label: "CPU总计", type: "number", required: true },
    { key: "memoryUsed", label: "内存已用(GB)", type: "number", required: true },
    { key: "memoryTotal", label: "内存总计(GB)", type: "number", required: true },
    { key: "gpuUsed", label: "GPU已用", type: "number", required: true },
    { key: "gpuTotal", label: "GPU总计", type: "number", required: true },
    { key: "disk", label: "磁盘", type: "text", required: true },
    { key: "bandwidth", label: "带宽", type: "text", required: true },
    {
      key: "status",
      label: "状态",
      type: "select",
      required: true,
      options: [
        { label: "正常", value: "active" },
        { label: "警告", value: "warning" },
        { label: "离线", value: "offline" },
      ],
    },
  ];

  const quotaFields: FieldConfig[] = [
    { key: "project", label: "项目", type: "text", required: true },
    { key: "party", label: "参与方", type: "text", required: true },
    { key: "cpu", label: "CPU", type: "text", required: true },
    { key: "memory", label: "内存", type: "text", required: true },
    { key: "gpu", label: "GPU", type: "text", required: true },
    { key: "disk", label: "磁盘", type: "text", required: true },
  ];

  const reservationFields: FieldConfig[] = [
    { key: "project", label: "项目", type: "text", required: true },
    { key: "resource", label: "资源", type: "text", required: true },
    { key: "amount", label: "数量", type: "text", required: true },
    { key: "start", label: "开始时间", type: "text", required: true },
    { key: "end", label: "结束时间", type: "text", required: true },
    {
      key: "status",
      label: "状态",
      type: "select",
      required: true,
      options: [
        { label: "生效中", value: "active" },
        { label: "待生效", value: "pending" },
        { label: "已过期", value: "expired" },
      ],
    },
  ];

  const getDialogFields = (): FieldConfig[] => {
    switch (dialogType) {
      case "resource":
        return resourceFields;
      case "quota":
        return quotaFields;
      case "reservation":
        return reservationFields;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "resource":
        return "资源";
      case "quota":
        return "配额";
      case "reservation":
        return "预留";
    }
  };

  const getDialogData = () => {
    if (!selectedItem) return {};
    if (dialogType === "resource") {
      return {
        node: selectedItem.node,
        cpuUsed: selectedItem.cpu?.used,
        cpuTotal: selectedItem.cpu?.total,
        memoryUsed: selectedItem.memory?.used,
        memoryTotal: selectedItem.memory?.total,
        gpuUsed: selectedItem.gpu?.used,
        gpuTotal: selectedItem.gpu?.total,
        disk: selectedItem.disk,
        bandwidth: selectedItem.bandwidth,
        status: selectedItem.status,
      };
    }
    return selectedItem;
  };

  const actionCell = (type: DialogType, item: any) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => openDetail(item)}>
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => openEdit(type, item)}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => openDelete(type, item)}>
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  const resCols = [
    {
      key: "node",
      title: "节点",
      cell: (r: ResourceItem) => <span className="font-medium text-slate-800">{r.node}</span>,
    },
    {
      key: "cpu",
      title: "CPU",
      cell: (r: ResourceItem) => (
        <div className="w-20">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{r.cpu.used}/{r.cpu.total}核</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full">
            <div
              className={cn("h-full rounded-full", r.cpu.used / r.cpu.total > 0.8 ? "bg-red-500" : "bg-blue-500")}
              style={{ width: `${(r.cpu.used / r.cpu.total) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "memory",
      title: "内存",
      cell: (r: ResourceItem) => (
        <div className="w-20">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{r.memory.used}/{r.memory.total}G</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full">
            <div
              className={cn("h-full rounded-full", r.memory.used / r.memory.total > 0.8 ? "bg-red-500" : "bg-purple-500")}
              style={{ width: `${(r.memory.used / r.memory.total) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "gpu",
      title: "GPU",
      cell: (r: ResourceItem) => <span className="text-xs text-slate-500">{r.gpu.used}/{r.gpu.total}卡</span>,
    },
    {
      key: "disk",
      title: "磁盘",
      cell: (r: ResourceItem) => <span className="text-xs text-slate-500">{r.disk}</span>,
    },
    {
      key: "status",
      title: "状态",
      cell: (r: ResourceItem) => (
        <Badge
          className={cn(
            "text-xs",
            r.status === "active" ? "bg-emerald-500/10 text-emerald-600" : r.status === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
          )}
        >
          {r.status === "active" ? "正常" : r.status === "warning" ? "警告" : "离线"}
        </Badge>
      ),
    },
    { key: "actions", title: "操作", cell: (r: ResourceItem) => actionCell("resource", r) },
  ];

  const getDetailFields = () => {
    switch (activeTab) {
      case "pool":
        return [
          { key: "node", label: "节点" },
          { key: "cpu", label: "CPU" },
          { key: "memory", label: "内存" },
          { key: "gpu", label: "GPU" },
          { key: "disk", label: "磁盘" },
          { key: "bandwidth", label: "带宽" },
          { key: "status", label: "状态", type: "badge" as const },
        ];
      case "quota":
        return [
          { key: "project", label: "项目" },
          { key: "party", label: "参与方" },
          { key: "cpu", label: "CPU" },
          { key: "memory", label: "内存" },
          { key: "gpu", label: "GPU" },
          { key: "disk", label: "磁盘" },
        ];
      case "reservation":
        return [
          { key: "id", label: "预留ID" },
          { key: "project", label: "项目" },
          { key: "resource", label: "资源", type: "badge" as const },
          { key: "amount", label: "数量" },
          { key: "start", label: "开始时间" },
          { key: "end", label: "结束时间" },
          { key: "status", label: "状态", type: "badge" as const },
        ];
      default:
        return [];
    }
  };

  const getDetailData = () => {
    if (!selectedItem) return {};
    if (activeTab === "pool") {
      return {
        node: selectedItem.node,
        cpu: `${selectedItem.cpu?.used}/${selectedItem.cpu?.total}核`,
        memory: `${selectedItem.memory?.used}/${selectedItem.memory?.total}GB`,
        gpu: `${selectedItem.gpu?.used}/${selectedItem.gpu?.total}卡`,
        disk: selectedItem.disk,
        bandwidth: selectedItem.bandwidth,
        status: selectedItem.status === "active" ? "正常" : selectedItem.status === "warning" ? "警告" : "离线",
      };
    } else if (activeTab === "reservation") {
      return {
        ...selectedItem,
        status: selectedItem.status === "active" ? "生效中" : selectedItem.status === "pending" ? "待生效" : "已过期",
      };
    }
    return selectedItem;
  };

  const getDetailTitle = () => {
    switch (activeTab) {
      case "pool":
        return "资源详情";
      case "quota":
        return "配额详情";
      case "reservation":
        return "预留详情";
      default:
        return "详情";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
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
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[
          { k: "pool", l: "资源池" },
          { k: "quota", l: "配额管理" },
          { k: "reservation", l: "预留管理" },
          { k: "strategy", l: "调度策略" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k as TabKey)}
            className={
              "px-4 py-2 rounded-md text-sm font-medium transition-colors " +
              (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")
            }
          >
            {t.l}
          </button>
        ))}
      </div>

      {activeTab === "pool" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex justify-end p-4">
            <Button onClick={() => openCreate("resource")} className="gap-2">
              <Plus className="w-4 h-4" />
              新建资源
            </Button>
          </div>
          <DataTable rowKey={(r: any) => r.id} columns={resCols} data={resources} />
        </div>
      )}

      {activeTab === "quota" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openCreate("quota")} className="gap-2">
              <Plus className="w-4 h-4" />
              设置配额
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">项目</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">参与方</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">CPU</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">内存</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">GPU</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">磁盘</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotas.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{q.project}</td>
                    <td className="py-3 px-4 text-xs">{q.party}</td>
                    <td className="py-3 px-4 text-xs font-mono">{q.cpu}</td>
                    <td className="py-3 px-4 text-xs font-mono">{q.memory}</td>
                    <td className="py-3 px-4 text-xs font-mono">{q.gpu}</td>
                    <td className="py-3 px-4 text-xs font-mono">{q.disk}</td>
                    <td className="py-3 px-4">{actionCell("quota", q)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reservation" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex justify-end p-4">
            <Button onClick={() => openCreate("reservation")} className="gap-2">
              <Plus className="w-4 h-4" />
              新建预留
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">预留ID</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">项目</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">资源</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">数量</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">开始时间</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">结束时间</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.id}</td>
                  <td className="py-3 px-4 text-slate-700">{r.project}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{r.resource}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs">{r.amount}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{r.start}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{r.end}</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={cn(
                        "text-xs",
                        r.status === "active" ? "bg-emerald-500/10 text-emerald-600" : r.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {r.status === "active" ? "生效中" : r.status === "pending" ? "待生效" : "已过期"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{actionCell("reservation", r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "strategy" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">策略名称</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">类型</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">参数</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { n: "FIFO调度", t: "FIFO", p: "先进先出", s: "active" },
                { n: "优先级调度", t: "Priority", p: "高优先级优先", s: "active" },
                { n: "资源感知调度", t: "Resource-Aware", p: "根据资源使用情况动态分配", s: "active" },
              ].map((s, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{s.n}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{s.t}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{s.p}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">启用</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={getDialogTitle()}
        fields={getDialogFields()}
        data={getDialogData()}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={getDetailTitle()}
        data={getDetailData()}
        fields={getDetailFields()}
        onEdit={() => {
          setDrawerOpen(false);
          if (activeTab === "pool") openEdit("resource", selectedItem);
          else if (activeTab === "quota") openEdit("quota", selectedItem);
          else if (activeTab === "reservation") openEdit("reservation", selectedItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (activeTab === "pool") openDelete("resource", selectedItem);
          else if (activeTab === "quota") openDelete("quota", selectedItem);
          else if (activeTab === "reservation") openDelete("reservation", selectedItem);
        }}
      />
    </div>
  );
}
