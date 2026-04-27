import { useState } from "react";
import { Users, Search, Plus, Eye, Edit2, KeyRound, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
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

export default function PrivacyParties() {
  const [parties] = useState(mockParties);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailParty, setDetailParty] = useState<PrivacyParty | null>(null);

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
        <button onClick={() => { setDetailParty(p); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Eye className="w-3.5 h-3.5" /></button>
        <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Edit2 className="w-3.5 h-3.5" /></button>
        <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><KeyRound className="w-3.5 h-3.5" /></button>
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
        <Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />注册参与方</Button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>
      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="注册参与方" size="lg">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-slate-700">名称</label><Input placeholder="企业或机构名称" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">IP地址</label><Input placeholder="10.0.1.10" className="mt-1" /></div><div><label className="text-sm font-medium text-slate-700">端口</label><Input placeholder="8080" className="mt-1" /></div></div>
          <div><label className="text-sm font-medium text-slate-700">公钥</label><textarea placeholder="粘贴公钥" className="mt-1 w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" /></div>
          <div><label className="text-sm font-medium text-slate-700">角色</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>数据方</option><option>计算方</option><option>审计方</option><option>数据方+计算方</option></select></div>
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>注册</Button></div>
        </div>
      </Drawer>
      <Drawer open={showDetail} onClose={() => setShowDetail(false)} title={detailParty?.name || "详情"} size="lg">
        {detailParty && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">ID</div><div className="font-mono text-sm">{detailParty.id}</div></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">状态</div><div className="text-sm">{detailParty.status === "online" ? "在线" : "离线"}</div></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">地址</div><div className="font-mono text-xs text-gray-500">{detailParty.ip}:{detailParty.port}</div></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">角色</div><div className="text-sm">{detailParty.role}</div></div>
          </div>
          <div><h4 className="text-sm font-semibold text-slate-700 mb-2">资源使用</h4>
            <div className="space-y-2">
              <div><div className="flex justify-between text-xs mb-1"><span>CPU</span><span>{detailParty.cpu}%</span></div><div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${detailParty.cpu}%` }} /></div></div>
              <div><div className="flex justify-between text-xs mb-1"><span>内存</span><span>{detailParty.memory}%</span></div><div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${detailParty.memory}%` }} /></div></div>
            </div>
          </div>
        </div>}
      </Drawer>
    </div>
  );
}
