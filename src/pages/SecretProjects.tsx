import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Search, Filter, MoreHorizontal, Users, Database,
  Clock, CheckCircle, XCircle, PauseCircle, ChevronRight, X,
  Lock, Unlock, Eye, Edit2, Trash2, FileText, KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

interface SecretProject {
  id: string;
  name: string;
  description: string;
  algorithm: "MPC" | "HE" | "ZKP" | "TEE";
  status: "planning" | "running" | "completed" | "failed";
  creator: string;
  createTime: string;
  memberCount: number;
  dataSourceCount: number;
  taskCount: number;
}

const mockProjects: SecretProject[] = [
  { id: "SCP-2026-001", name: "联合风控建模", description: "多方安全计算联合信用评估模型训练", algorithm: "MPC", status: "running", creator: "张三", createTime: "2026-04-10", memberCount: 5, dataSourceCount: 3, taskCount: 12 },
  { id: "SCP-2026-002", name: "医疗数据融合", description: "同态加密医疗数据分析与统计", algorithm: "HE", status: "running", creator: "李四", createTime: "2026-04-08", memberCount: 8, dataSourceCount: 5, taskCount: 8 },
  { id: "SCP-2026-003", name: "身份隐私验证", description: "零知识证明身份验证系统", algorithm: "ZKP", status: "completed", creator: "王五", createTime: "2026-04-05", memberCount: 3, dataSourceCount: 2, taskCount: 6 },
  { id: "SCP-2026-004", name: "安全图像识别", description: "TEE环境图像隐私计算推理", algorithm: "TEE", status: "planning", creator: "赵六", createTime: "2026-04-15", memberCount: 4, dataSourceCount: 2, taskCount: 0 },
  { id: "SCP-2026-005", name: "跨机构统计", description: "MPC跨机构金融数据统计分析", algorithm: "MPC", status: "running", creator: "钱七", createTime: "2026-04-12", memberCount: 6, dataSourceCount: 4, taskCount: 15 },
  { id: "SCP-2026-006", name: "基因数据计算", description: "同态加密基因序列比对分析", algorithm: "HE", status: "failed", creator: "孙八", createTime: "2026-04-01", memberCount: 7, dataSourceCount: 3, taskCount: 4 },
  { id: "SCP-2026-007", name: "隐私投票系统", description: "零知识证明匿名投票", algorithm: "ZKP", status: "completed", creator: "周九", createTime: "2026-03-28", memberCount: 2, dataSourceCount: 1, taskCount: 3 },
  { id: "SCP-2026-008", name: "密钥管理优化", description: "TEE密钥安全生成与分发", algorithm: "TEE", status: "planning", creator: "吴十", createTime: "2026-04-18", memberCount: 3, dataSourceCount: 2, taskCount: 0 },
  { id: "SCP-2026-009", name: "供应链协同", description: "MPC供应链多方数据协同", algorithm: "MPC", status: "running", creator: "郑一", createTime: "2026-04-14", memberCount: 10, dataSourceCount: 6, taskCount: 20 },
  { id: "SCP-2026-010", name: "隐私推荐引擎", description: "同态加密推荐算法", algorithm: "HE", status: "running", creator: "冯二", createTime: "2026-04-11", memberCount: 4, dataSourceCount: 3, taskCount: 9 },
  { id: "SCP-2026-011", name: "年龄验证", description: "零知识证明年龄验证服务", algorithm: "ZKP", status: "completed", creator: "陈三", createTime: "2026-03-20", memberCount: 2, dataSourceCount: 1, taskCount: 2 },
  { id: "SCP-2026-012", name: "安全日志分析", description: "TEE日志隐私计算分析", algorithm: "TEE", status: "planning", creator: "褚四", createTime: "2026-04-19", memberCount: 3, dataSourceCount: 2, taskCount: 0 },
];

const algorithmColors: Record<string, string> = {
  MPC: "bg-blue-500/15 text-blue-500",
  HE: "bg-purple-500/15 text-purple-500",
  ZKP: "bg-emerald-500/15 text-emerald-500",
  TEE: "bg-amber-500/15 text-amber-500",
};

const algorithmLabels: Record<string, string> = {
  MPC: "安全多方计算", HE: "同态加密", ZKP: "零知识证明", TEE: "可信执行环境",
};

export default function SecretProjects() {
  const [projects] = useState<SecretProject[]>(mockProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [algoFilter, setAlgoFilter] = useState<string>("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<SecretProject | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchAlgo = algoFilter === "all" || p.algorithm === algoFilter;
    return matchSearch && matchStatus && matchAlgo;
  });

  const stats = [
    { label: "项目总数", value: projects.length, icon: Shield, color: "text-blue-500" },
    { label: "进行中", value: projects.filter((p) => p.status === "running").length, icon: Clock, color: "text-amber-500" },
    { label: "已完成", value: projects.filter((p) => p.status === "completed").length, icon: CheckCircle, color: "text-emerald-500" },
    { label: "今日新建", value: 2, icon: Plus, color: "text-purple-500" },
  ];

  const columns = [
    { key: "id", title: "项目ID", cell: (p: SecretProject) => <span className="font-mono text-xs text-slate-500">{p.id}</span> },
    { key: "name", title: "项目名称", cell: (p: SecretProject) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: "algorithm", title: "算法类型", cell: (p: SecretProject) => <Badge className={cn(algorithmColors[p.algorithm], "font-medium")}>{algorithmLabels[p.algorithm]}</Badge> },
    { key: "status", title: "状态", cell: (p: SecretProject) => <StatusTag status={p.status === "planning" ? "info" : p.status === "running" ? "warning" : p.status === "completed" ? "success" : "danger"} text={p.status === "planning" ? "规划中" : p.status === "running" ? "进行中" : p.status === "completed" ? "已完成" : "失败"} /> },
    { key: "members", title: "成员/数据源", cell: (p: SecretProject) => <div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.memberCount}</span><span className="flex items-center gap-1"><Database className="w-3 h-3" />{p.dataSourceCount}</span></div> },
    { key: "creator", title: "创建者", cell: (p: SecretProject) => <span className="text-xs text-slate-500">{p.creator}</span> },
    { key: "time", title: "创建时间", cell: (p: SecretProject) => <span className="text-xs text-slate-500">{p.createTime}</span> },
    { key: "actions", title: "操作", cell: (p: SecretProject) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setSelectedProject(p); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Eye className="w-3.5 h-3.5" /></button>
        <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
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

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索项目ID或名称" className="pl-9 w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
            <option value="all">全部状态</option><option value="planning">规划中</option><option value="running">进行中</option><option value="completed">已完成</option><option value="failed">失败</option>
          </select>
          <select value={algoFilter} onChange={(e) => setAlgoFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
            <option value="all">全部算法</option><option value="MPC">MPC</option><option value="HE">HE</option><option value="ZKP">ZKP</option><option value="TEE">TEE</option>
          </select>
        </div>
        <Button onClick={() => { setShowDrawer(true); setDrawerStep(1); }} className="gap-2"><Plus className="w-4 h-4" />新建项目</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} />
      </div>

      {/* New Project Drawer */}
      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建密态计算项目" size="lg">
        {showDrawer && (
          <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold", drawerStep >= s ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-400")}>{s}</div>
                  <span className={cn("text-sm", drawerStep >= s ? "text-slate-800" : "text-slate-400")}>{s === 1 ? "基本信息" : s === 2 ? "成员管理" : "数据授权"}</span>
                  {s < 3 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                </div>
              ))}
            </div>

            {drawerStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div><label className="text-sm font-medium text-slate-700">项目名称 <span className="text-red-500">*</span></label><Input placeholder="输入项目名称" className="mt-1" /></div>
                <div><label className="text-sm font-medium text-slate-700">项目描述</label><textarea placeholder="描述项目目的和范围" className="mt-1 w-full h-24 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="text-sm font-medium text-slate-700">算法类型 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[{k:"MPC",l:"安全多方计算",d:"多方在不泄露原始数据的情况下协同计算"},{k:"HE",l:"同态加密",d:"在加密数据上直接进行计算"},{k:"ZKP",l:"零知识证明",d:"证明某个陈述为真而不泄露任何额外信息"},{k:"TEE",l:"可信执行环境",d:"在硬件安全区域内执行计算"}].map((a) => (
                      <div key={a.k} className="p-4 rounded-lg border-2 border-slate-200 hover:border-primary-500 cursor-pointer transition-colors"><div className="font-semibold text-slate-800">{a.l}</div><div className="text-xs text-slate-500 mt-1">{a.d}</div></div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {drawerStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="输入用户名搜索" className="flex-1" />
                  <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option>全部角色</option><option>协调方</option><option>计算方</option><option>审计方</option></select>
                  <Button size="sm">添加</Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50"><tr><th className="text-left py-2.5 px-3 text-slate-500 font-medium">用户名</th><th className="text-left py-2.5 px-3 text-slate-500 font-medium">角色</th><th className="text-left py-2.5 px-3 text-slate-500 font-medium">公钥指纹</th><th className="py-2.5 px-3"></th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {[{u:"张三",r:"协调方",k:"a3f2...8c1d"},{u:"李四",r:"计算方",k:"b7e1...4a9f"},{u:"王五",r:"计算方",k:"c5d3...2e7b"}].map((m,i) => (
                        <tr key={i}><td className="py-2.5 px-3 font-medium text-slate-700">{m.u}</td><td className="py-2.5 px-3"><Badge variant="outline">{m.r}</Badge></td><td className="py-2.5 px-3 font-mono text-xs text-slate-400">{m.k}</td><td className="py-2.5 px-3"><button className="text-red-500 hover:text-red-700 text-xs">移除</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {drawerStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="搜索数据源" className="flex-1" />
                  <Button size="sm">授权</Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50"><tr><th className="text-left py-2.5 px-3 text-slate-500 font-medium">数据源</th><th className="text-left py-2.5 px-3 text-slate-500 font-medium">表名</th><th className="text-left py-2.5 px-3 text-slate-500 font-medium">权限</th><th className="py-2.5 px-3"></th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {[{s:"MySQL-Prod",t:"user_info",p:"读取+计算"},{s:"Hive-Warehouse",t:"order_detail",p:"读取"}].map((d,i) => (
                        <tr key={i}><td className="py-2.5 px-3 text-slate-700">{d.s}</td><td className="py-2.5 px-3 font-mono text-xs text-slate-500">{d.t}</td><td className="py-2.5 px-3"><Badge className="bg-emerald-500/10 text-emerald-600">{d.p}</Badge></td><td className="py-2.5 px-3"><button className="text-red-500 hover:text-red-700 text-xs">撤销</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between pt-4 border-t">
              {drawerStep > 1 ? <Button variant="outline" onClick={() => setDrawerStep(drawerStep - 1)}>上一步</Button> : <div />}
              {drawerStep < 3 ? <Button onClick={() => setDrawerStep(drawerStep + 1)}>下一步</Button> : <Button onClick={() => setShowDrawer(false)}>创建项目</Button>}
            </div>
          </div>
        )}
      </Drawer>

      {/* Detail Drawer */}
      <Drawer open={showDetail} onClose={() => setShowDetail(false)} title={selectedProject?.name || "项目详情"} size="lg">
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">项目ID</div><div className="font-mono text-sm text-slate-800 mt-1">{selectedProject.id}</div></div>
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">算法类型</div><div className="text-sm text-slate-800 mt-1">{algorithmLabels[selectedProject.algorithm]}</div></div>
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">创建者</div><div className="text-sm text-slate-800 mt-1">{selectedProject.creator}</div></div>
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">创建时间</div><div className="text-sm text-slate-800 mt-1">{selectedProject.createTime}</div></div>
            </div>
            <div><h4 className="text-sm font-semibold text-slate-700 mb-2">项目描述</h4><p className="text-sm text-slate-600">{selectedProject.description}</p></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center"><Users className="w-5 h-5 text-blue-500 mx-auto" /><div className="text-lg font-bold text-slate-800 mt-1">{selectedProject.memberCount}</div><div className="text-xs text-slate-500">成员</div></div>
              <div className="bg-purple-50 rounded-lg p-3 text-center"><Database className="w-5 h-5 text-purple-500 mx-auto" /><div className="text-lg font-bold text-slate-800 mt-1">{selectedProject.dataSourceCount}</div><div className="text-xs text-slate-500">数据源</div></div>
              <div className="bg-amber-50 rounded-lg p-3 text-center"><FileText className="w-5 h-5 text-amber-500 mx-auto" /><div className="text-lg font-bold text-slate-800 mt-1">{selectedProject.taskCount}</div><div className="text-xs text-slate-500">任务</div></div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
