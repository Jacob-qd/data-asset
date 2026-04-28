import { useState } from "react";
import {
  Network, Plus, Search, Server, Activity, ShieldCheck,
  CheckCircle2, XCircle, Clock, ChevronRight, Settings, RefreshCw,
  Users, Database, X, Eye, Pencil, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";

/* ─── Types ─── */
interface NetworkData {
  id: string;
  name: string;
  type: string;
  consensus: string;
  status: string;
  nodes: number;
  orgs: number;
  tps: number;
  blockHeight: number;
  createTime: string;
  admin: string;
}

interface OrgData {
  id: string;
  networkId: string;
  name: string;
  role: string;
  joinTime: string;
  nodeCount: number;
  status: string;
}

/* ─── Mock Data ─── */
const initialNetworks: NetworkData[] = [
  { id: "NW-001", name: "金融联盟链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 12, orgs: 5, tps: 3200, blockHeight: 4285691, createTime: "2024-06-15", admin: "金融联盟管理员" },
  { id: "NW-002", name: "政务数据链", type: "联盟链", consensus: "Raft", status: "running", nodes: 8, orgs: 4, tps: 1500, blockHeight: 2156032, createTime: "2024-08-20", admin: "政务联盟管理员" },
  { id: "NW-003", name: "供应链金融链", type: "联盟链", consensus: "PBFT", status: "stopped", nodes: 6, orgs: 3, tps: 0, blockHeight: 892341, createTime: "2024-10-10", admin: "供应链管理员" },
  { id: "NW-004", name: "医疗数据链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 10, orgs: 6, tps: 2800, blockHeight: 1567234, createTime: "2024-11-05", admin: "医疗联盟管理员" },
  { id: "NW-005", name: "存证公证链", type: "公有链", consensus: "PoA", status: "running", nodes: 15, orgs: 8, tps: 4500, blockHeight: 5623412, createTime: "2024-03-01", admin: "公证联盟管理员" },
  { id: "NW-006", name: "教育存证链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 7, orgs: 4, tps: 1800, blockHeight: 876543, createTime: "2024-12-10", admin: "教育联盟管理员" },
  { id: "NW-007", name: "物流追溯链", type: "联盟链", consensus: "Raft", status: "maintenance", nodes: 9, orgs: 5, tps: 0, blockHeight: 1234567, createTime: "2024-09-20", admin: "物流联盟管理员" },
  { id: "NW-008", name: "版权保护链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 11, orgs: 6, tps: 2400, blockHeight: 2345678, createTime: "2024-07-15", admin: "版权联盟管理员" },
  { id: "NW-009", name: "碳排放链", type: "联盟链", consensus: "PoA", status: "upgrading", nodes: 8, orgs: 4, tps: 0, blockHeight: 345678, createTime: "2025-01-05", admin: "碳排放管理员" },
  { id: "NW-010", name: "公益捐赠链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 6, orgs: 3, tps: 1200, blockHeight: 567890, createTime: "2025-02-20", admin: "公益联盟管理员" },
  { id: "NW-011", name: "测试网络", type: "私有链", consensus: "PoW", status: "error", nodes: 3, orgs: 1, tps: 0, blockHeight: 12345, createTime: "2025-03-01", admin: "测试管理员" },
  { id: "NW-012", name: "侧链-支付", type: "侧链", consensus: "DPoS", status: "running", nodes: 21, orgs: 10, tps: 8500, blockHeight: 9876543, createTime: "2024-04-10", admin: "侧链管理员" },
];

const initialOrgs: OrgData[] = [
  { id: "O-001", networkId: "NW-001", name: "中国银行", role: "创始成员", joinTime: "2024-06-15", nodeCount: 3, status: "active" },
  { id: "O-002", networkId: "NW-001", name: "工商银行", role: "成员", joinTime: "2024-07-01", nodeCount: 2, status: "active" },
  { id: "O-003", networkId: "NW-001", name: "建设银行", role: "成员", joinTime: "2024-07-15", nodeCount: 2, status: "active" },
  { id: "O-004", networkId: "NW-001", name: "农业银行", role: "成员", joinTime: "2024-08-01", nodeCount: 2, status: "active" },
  { id: "O-005", networkId: "NW-001", name: "交通银行", role: "观察成员", joinTime: "2024-09-01", nodeCount: 1, status: "active" },
  { id: "O-006", networkId: "NW-002", name: "市政务服务中心", role: "创始成员", joinTime: "2024-08-20", nodeCount: 3, status: "active" },
  { id: "O-007", networkId: "NW-002", name: "区数据局", role: "成员", joinTime: "2024-09-01", nodeCount: 2, status: "active" },
  { id: "O-008", networkId: "NW-002", name: "信息中心", role: "成员", joinTime: "2024-09-15", nodeCount: 2, status: "active" },
  { id: "O-009", networkId: "NW-002", name: "监管平台", role: "观察成员", joinTime: "2024-10-01", nodeCount: 1, status: "active" },
  { id: "O-010", networkId: "NW-003", name: "核心企业", role: "创始成员", joinTime: "2024-10-10", nodeCount: 2, status: "active" },
  { id: "O-011", networkId: "NW-003", name: "供应商A", role: "成员", joinTime: "2024-10-15", nodeCount: 2, status: "active" },
  { id: "O-012", networkId: "NW-003", name: "金融机构", role: "成员", joinTime: "2024-10-20", nodeCount: 2, status: "active" },
  { id: "O-013", networkId: "NW-004", name: "三甲医院", role: "创始成员", joinTime: "2024-11-05", nodeCount: 3, status: "active" },
  { id: "O-014", networkId: "NW-004", name: "区县医院", role: "成员", joinTime: "2024-11-10", nodeCount: 2, status: "active" },
  { id: "O-015", networkId: "NW-004", name: "医药企业", role: "成员", joinTime: "2024-11-15", nodeCount: 2, status: "active" },
  { id: "O-016", networkId: "NW-004", name: "医保局", role: "成员", joinTime: "2024-11-20", nodeCount: 2, status: "active" },
  { id: "O-017", networkId: "NW-004", name: "体检机构", role: "观察成员", joinTime: "2024-12-01", nodeCount: 1, status: "active" },
  { id: "O-018", networkId: "NW-004", name: "科研单位", role: "观察成员", joinTime: "2024-12-05", nodeCount: 1, status: "active" },
  { id: "O-019", networkId: "NW-005", name: "公证处", role: "创始成员", joinTime: "2024-03-01", nodeCount: 3, status: "active" },
  { id: "O-020", networkId: "NW-005", name: "司法鉴定", role: "成员", joinTime: "2024-03-15", nodeCount: 2, status: "active" },
  { id: "O-021", networkId: "NW-005", name: "律所联盟", role: "成员", joinTime: "2024-04-01", nodeCount: 2, status: "active" },
  { id: "O-022", networkId: "NW-005", name: "仲裁机构", role: "成员", joinTime: "2024-04-15", nodeCount: 2, status: "active" },
  { id: "O-023", networkId: "NW-005", name: "版权中心", role: "成员", joinTime: "2024-05-01", nodeCount: 2, status: "active" },
  { id: "O-024", networkId: "NW-005", name: "知产局", role: "观察成员", joinTime: "2024-05-15", nodeCount: 1, status: "active" },
  { id: "O-025", networkId: "NW-005", name: "法院", role: "观察成员", joinTime: "2024-06-01", nodeCount: 2, status: "active" },
  { id: "O-026", networkId: "NW-005", name: "检察院", role: "观察成员", joinTime: "2024-06-15", nodeCount: 1, status: "active" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    running: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    stopped: { text: "已停止", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    initializing: { text: "初始化中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.stopped;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

const networkFields: FieldConfig[] = [
  { key: "name", label: "网络名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "联盟链", value: "联盟链" },
    { label: "公有链", value: "公有链" },
    { label: "私有链", value: "私有链" },
    { label: "侧链", value: "侧链" },
    { label: "子链", value: "子链" },
    { label: "Layer2", value: "Layer2" },
  ]},
  { key: "consensus", label: "共识机制", type: "select", required: true, options: [
    { label: "PBFT", value: "PBFT" },
    { label: "Raft", value: "Raft" },
    { label: "PoA", value: "PoA" },
    { label: "PoW", value: "PoW" },
    { label: "PoS", value: "PoS" },
    { label: "DPoS", value: "DPoS" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "运行中", value: "running" },
    { label: "已停止", value: "stopped" },
    { label: "初始化中", value: "initializing" },
    { label: "维护中", value: "maintenance" },
    { label: "升级中", value: "upgrading" },
    { label: "故障", value: "error" },
  ]},
  { key: "nodes", label: "节点数", type: "number", required: true },
  { key: "tps", label: "TPS", type: "number", required: true },
  { key: "blockHeight", label: "区块高度", type: "number", required: true },
  { key: "admin", label: "管理员", type: "text", required: true },
];

function generateId(networks: NetworkData[]): string {
  const maxNum = networks.reduce((max, n) => {
    const num = parseInt(n.id.replace("NW-", ""), 10);
    return Math.max(max, isNaN(num) ? 0 : num);
  }, 0);
  return `NW-${String(maxNum + 1).padStart(3, "0")}`;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function BlockchainNetwork() {
  const [networks, setNetworks] = useState<NetworkData[]>(initialNetworks);
  const [orgs, setOrgs] = useState<OrgData[]>(initialOrgs);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail state
  const [detailNet, setDetailNet] = useState<NetworkData | null>(null);

  // Org add dialog state
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: "", role: "成员", nodeCount: 1 });

  const filtered = networks.filter(n => n.name.includes(search) || n.type.includes(search));
  const runningCount = networks.filter(n => n.status === "running").length;

  const networkOrgs = detailNet ? orgs.filter(o => o.networkId === detailNet.id) : [];

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "",
      type: "联盟链",
      consensus: "PBFT",
      status: "initializing",
      nodes: 0,
      tps: 0,
      blockHeight: 0,
      admin: "",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (net: NetworkData) => {
    setDialogMode("edit");
    setDialogData({
      name: net.name,
      type: net.type,
      consensus: net.consensus,
      status: net.status,
      nodes: net.nodes,
      tps: net.tps,
      blockHeight: net.blockHeight,
      admin: net.admin,
    });
    setEditingId(net.id);
    setDialogOpen(true);
  };

  const handleDelete = (net: NetworkData) => {
    setDialogMode("delete");
    setEditingId(net.id);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const id = generateId(networks);
      const newNetwork: NetworkData = {
        id,
        name: data.name,
        type: data.type,
        consensus: data.consensus,
        status: data.status,
        nodes: Number(data.nodes),
        orgs: 0,
        tps: Number(data.tps),
        blockHeight: Number(data.blockHeight),
        createTime: todayStr(),
        admin: data.admin,
      };
      setNetworks(prev => [...prev, newNetwork]);
    } else if (dialogMode === "edit" && editingId) {
      setNetworks(prev =>
        prev.map(n =>
          n.id === editingId
            ? {
                ...n,
                name: data.name,
                type: data.type,
                consensus: data.consensus,
                status: data.status,
                nodes: Number(data.nodes),
                tps: Number(data.tps),
                blockHeight: Number(data.blockHeight),
                admin: data.admin,
              }
            : n
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setNetworks(prev => prev.filter(n => n.id !== editingId));
      setOrgs(prev => prev.filter(o => o.networkId !== editingId));
    }
    setDialogOpen(false);
  };

  const handleAddOrg = () => {
    if (!detailNet || !orgForm.name.trim()) return;
    const newOrg: OrgData = {
      id: `O-${Date.now()}`,
      networkId: detailNet.id,
      name: orgForm.name,
      role: orgForm.role,
      joinTime: todayStr(),
      nodeCount: Number(orgForm.nodeCount),
      status: "active",
    };
    setOrgs(prev => [...prev, newOrg]);
    setNetworks(prev =>
      prev.map(n =>
        n.id === detailNet.id
          ? { ...n, orgs: n.orgs + 1, nodes: n.nodes + newOrg.nodeCount }
          : n
      )
    );
    setOrgForm({ name: "", role: "成员", nodeCount: 1 });
    setOrgDialogOpen(false);
  };

  const handleRemoveOrg = (orgId: string) => {
    const org = orgs.find(o => o.id === orgId);
    if (!org || !detailNet) return;
    setOrgs(prev => prev.filter(o => o.id !== orgId));
    setNetworks(prev =>
      prev.map(n =>
        n.id === detailNet.id
          ? { ...n, orgs: Math.max(0, n.orgs - 1), nodes: Math.max(0, n.nodes - org.nodeCount) }
          : n
      )
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">区块链网络</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理区块链网络实例，配置共识机制与网络参数</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 创建网络
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "网络总数", value: networks.length, icon: <Network className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "运行中", value: runningCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总节点数", value: networks.reduce((s, n) => s + n.nodes, 0), icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "总TPS", value: networks.reduce((s, n) => s + n.tps, 0), icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索网络名称/类型" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["网络名称", "类型", "共识机制", "状态", "节点数", "组织数", "TPS", "区块高度", "创建时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(net => (
              <tr key={net.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{net.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{net.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.consensus}</td>
                <td className="px-4 py-3"><StatusBadge status={net.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.nodes}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.orgs}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.tps.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.blockHeight.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.createTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDetailNet(net)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(net)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(net)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer with Tabs */}
      <Sheet open={!!detailNet} onOpenChange={() => setDetailNet(null)}>
        <SheetContent className="sm:max-w-3xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              网络详情 - {detailNet?.name}
            </SheetTitle>
          </SheetHeader>
          {detailNet && (
            <Tabs defaultValue="info" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="orgs">参与组织</TabsTrigger>
                <TabsTrigger value="config">网络配置</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "网络ID", value: detailNet.id },
                    { label: "网络名称", value: detailNet.name },
                    { label: "类型", value: detailNet.type },
                    { label: "共识机制", value: detailNet.consensus },
                    { label: "状态", value: <StatusBadge status={detailNet.status} /> },
                    { label: "节点数量", value: `${detailNet.nodes}个` },
                    { label: "组织数量", value: `${detailNet.orgs}个` },
                    { label: "当前TPS", value: detailNet.tps.toLocaleString() },
                    { label: "区块高度", value: detailNet.blockHeight.toLocaleString() },
                    { label: "创建时间", value: detailNet.createTime },
                    { label: "管理员", value: detailNet.admin },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="orgs" className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">参与组织 ({networkOrgs.length})</h3>
                  <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setOrgDialogOpen(true)}>
                    <Plus className="w-3 h-3" /> 添加组织
                  </Button>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-[#273548]">
                      <tr>
                        {["组织名称", "角色", "加入时间", "节点数", "状态", "操作"].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {networkOrgs.map((org) => (
                        <tr key={org.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{org.name}</td>
                          <td className="px-4 py-2"><Badge variant="secondary">{org.role}</Badge></td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.joinTime}</td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.nodeCount}</td>
                          <td className="px-4 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                          <td className="px-4 py-2">
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleRemoveOrg(org.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {networkOrgs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">暂无组织</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="config" className="pt-4 space-y-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3">共识配置</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">共识算法</span><span className="text-slate-900 dark:text-slate-100">{detailNet.consensus}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">出块间隔</span><span className="text-slate-900 dark:text-slate-100">2秒</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">区块大小</span><span className="text-slate-900 dark:text-slate-100">2MB</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">确认阈值</span><span className="text-slate-900 dark:text-slate-100">2/3</span></div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3">网络参数</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">网络ID (ChainID)</span><span className="text-slate-900 dark:text-slate-100">{detailNet.id.replace("NW-", "")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">P2P端口</span><span className="text-slate-900 dark:text-slate-100">30303</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">RPC端口</span><span className="text-slate-900 dark:text-slate-100">8545</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">TLS加密</span><span className="text-emerald-600">已启用</span></div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Org Add Dialog */}
      <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加组织</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>组织名称</Label>
              <Input value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="输入组织名称" />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <select
                value={orgForm.role}
                onChange={e => setOrgForm({ ...orgForm, role: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm"
              >
                <option>创始成员</option>
                <option>成员</option>
                <option>观察成员</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>节点数</Label>
              <Input type="number" min={1} value={orgForm.nodeCount} onChange={e => setOrgForm({ ...orgForm, nodeCount: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrgDialogOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddOrg} disabled={!orgForm.name.trim()}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? (networks.find(n => n.id === editingId)?.name || "网络") : "区块链网络"}
        fields={networkFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
