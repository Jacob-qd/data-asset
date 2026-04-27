import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Plus, Search, Play, Square, RotateCcw, Eye, Clock, CheckCircle, XCircle, PauseCircle, ChevronRight, Database, Users, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import { cn } from "@/lib/utils";

interface SecretTask {
  id: string; name: string; project: string; algorithm: string;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  progress: number; participants: number; startTime: string; duration: string;
}

const mockTasks: SecretTask[] = [
  { id: "ST-001", name: "联合训练-第3轮", project: "联合风控建模", algorithm: "MPC", status: "running", progress: 65, participants: 5, startTime: "2026-04-21 09:00", duration: "2h 15m" },
  { id: "ST-002", name: "数据聚合统计", project: "跨机构统计", algorithm: "MPC", status: "running", progress: 42, participants: 6, startTime: "2026-04-21 08:30", duration: "3h 45m" },
  { id: "ST-003", name: "基因序列比对", project: "基因数据计算", algorithm: "HE", status: "failed", progress: 0, participants: 7, startTime: "2026-04-20 14:00", duration: "-" },
  { id: "ST-004", name: "身份验证测试", project: "身份隐私验证", algorithm: "ZKP", status: "completed", progress: 100, participants: 3, startTime: "2026-04-19 10:00", duration: "45m" },
  { id: "ST-005", name: "加密特征提取", project: "医疗数据融合", algorithm: "HE", status: "running", progress: 78, participants: 8, startTime: "2026-04-21 07:00", duration: "4h 30m" },
  { id: "ST-006", name: "安全推理-批次2", project: "安全图像识别", algorithm: "TEE", status: "pending", progress: 0, participants: 4, startTime: "-", duration: "-" },
  { id: "ST-007", name: "投票结果汇总", project: "隐私投票系统", algorithm: "ZKP", status: "completed", progress: 100, participants: 2, startTime: "2026-04-18 09:00", duration: "15m" },
  { id: "ST-008", name: "联合训练-第5轮", project: "隐私推荐引擎", algorithm: "HE", status: "paused", progress: 30, participants: 4, startTime: "2026-04-21 06:00", duration: "5h 10m" },
  { id: "ST-009", name: "供应链数据对齐", project: "供应链协同", algorithm: "MPC", status: "running", progress: 55, participants: 10, startTime: "2026-04-21 05:00", duration: "6h 20m" },
  { id: "ST-010", name: "密钥分发验证", project: "密钥管理优化", algorithm: "TEE", status: "pending", progress: 0, participants: 3, startTime: "-", duration: "-" },
  { id: "ST-011", name: "年龄证明生成", project: "年龄验证", algorithm: "ZKP", status: "completed", progress: 100, participants: 2, startTime: "2026-04-17 11:00", duration: "5m" },
  { id: "ST-012", name: "日志异常检测", project: "安全日志分析", algorithm: "TEE", status: "pending", progress: 0, participants: 3, startTime: "-", duration: "-" },
  { id: "ST-013", name: "联合训练-第2轮", project: "联合风控建模", algorithm: "MPC", status: "completed", progress: 100, participants: 5, startTime: "2026-04-20 08:00", duration: "1h 50m" },
  { id: "ST-014", name: "加密矩阵运算", project: "基因数据计算", algorithm: "HE", status: "failed", progress: 0, participants: 7, startTime: "2026-04-19 16:00", duration: "-" },
  { id: "ST-015", name: "跨域特征聚合", project: "供应链协同", algorithm: "MPC", status: "running", progress: 12, participants: 10, startTime: "2026-04-21 10:00", duration: "1h 5m" },
  { id: "ST-016", name: "证明参数调优", project: "身份隐私验证", algorithm: "ZKP", status: "completed", progress: 100, participants: 3, startTime: "2026-04-16 14:00", duration: "30m" },
  { id: "ST-017", name: "安全训练-批次1", project: "安全图像识别", algorithm: "TEE", status: "running", progress: 88, participants: 4, startTime: "2026-04-21 03:00", duration: "8h 15m" },
  { id: "ST-018", name: "推荐模型更新", project: "隐私推荐引擎", algorithm: "HE", status: "pending", progress: 0, participants: 4, startTime: "-", duration: "-" },
];

const algoColors: Record<string, string> = { MPC: "bg-blue-500/15 text-blue-500", HE: "bg-purple-500/15 text-purple-500", ZKP: "bg-emerald-500/15 text-emerald-500", TEE: "bg-amber-500/15 text-amber-500" };

export default function SecretTasks() {
  const [tasks] = useState<SecretTask[]>(mockTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [detailTask, setDetailTask] = useState<SecretTask | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = tasks.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCards = [
    { key: "pending", label: "待执行", count: tasks.filter((t) => t.status === "pending").length, color: "bg-slate-100 text-slate-600", icon: Clock },
    { key: "running", label: "执行中", count: tasks.filter((t) => t.status === "running").length, color: "bg-blue-50 text-blue-600", icon: Play },
    { key: "completed", label: "已完成", count: tasks.filter((t) => t.status === "completed").length, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
    { key: "failed", label: "失败", count: tasks.filter((t) => t.status === "failed").length, color: "bg-red-50 text-red-600", icon: XCircle },
  ];

  const columns = [
    { key: "id", title: "任务ID", cell: (t: SecretTask) => <span className="font-mono text-xs text-slate-500">{t.id}</span> },
    { key: "name", title: "任务名称", cell: (t: SecretTask) => <span className="font-medium text-slate-800">{t.name}</span> },
    { key: "project", title: "所属项目", cell: (t: SecretTask) => <span className="text-xs text-slate-500">{t.project}</span> },
    { key: "algorithm", title: "算法", cell: (t: SecretTask) => <Badge className={cn(algoColors[t.algorithm], "font-medium text-xs")}>{t.algorithm}</Badge> },
    { key: "status", title: "状态", cell: (t: SecretTask) => <StatusTag status={t.status === "pending" ? "info" : t.status === "running" ? "warning" : t.status === "completed" ? "success" : t.status === "paused" ? "info" : "danger"} text={t.status === "pending" ? "待执行" : t.status === "running" ? "执行中" : t.status === "completed" ? "已完成" : t.status === "paused" ? "已暂停" : "失败"} /> },
    { key: "progress", title: "进度", cell: (t: SecretTask) => (
      <div className="w-full"><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>{t.progress}%</span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all", t.status === "running" ? "bg-blue-500" : t.status === "completed" ? "bg-emerald-500" : "bg-slate-300")} style={{ width: `${t.progress}%` }} /></div></div>
    )},
    { key: "participants", title: "参与方", cell: (t: SecretTask) => <span className="flex items-center gap-1 text-xs text-slate-500"><Users className="w-3 h-3" />{t.participants}</span> },
    { key: "actions", title: "操作", cell: (t: SecretTask) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setDetailTask(t); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Eye className="w-3.5 h-3.5" /></button>
        {t.status === "pending" && <button className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500"><Play className="w-3.5 h-3.5" /></button>}
        {t.status === "running" && <button className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Square className="w-3.5 h-3.5" /></button>}
        {t.status === "failed" && <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><RotateCcw className="w-3.5 h-3.5" /></button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((s) => (
          <div key={s.key} className={cn("rounded-xl p-5 border", s.color.split(" ")[0].replace("bg-", "border-").replace("50", "200"))}>
            <div className="flex items-center justify-between"><span className={cn("text-sm", s.color.split(" ")[1])}>{s.label}</span><s.icon className={cn("w-5 h-5", s.color.split(" ")[1])} /></div>
            <div className={cn("text-2xl font-bold mt-2", s.color.split(" ")[1])}>{s.count}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索任务ID或名称" className="pl-9 w-64" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600"><option value="all">全部状态</option><option value="pending">待执行</option><option value="running">执行中</option><option value="completed">已完成</option><option value="failed">失败</option><option value="paused">已暂停</option></select>
        </div>
        <Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />新建任务</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>

      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建密态计算任务" size="lg">
        <div className="space-y-5">
          <div><label className="text-sm font-medium text-slate-700">选择项目</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>联合风控建模</option><option>医疗数据融合</option><option>跨机构统计</option></select></div>
          <div><label className="text-sm font-medium text-slate-700">任务名称</label><Input placeholder="输入任务名称" className="mt-1" /></div>
          <div><label className="text-sm font-medium text-slate-700">算法配置</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {["MPC", "HE", "ZKP", "TEE"].map((a) => <div key={a} className="p-4 rounded-lg border-2 border-slate-200 hover:border-primary-500 cursor-pointer"><div className="font-semibold">{a}</div><div className="text-xs text-slate-500 mt-1">{a === "MPC" ? "安全多方计算" : a === "HE" ? "同态加密" : a === "ZKP" ? "零知识证明" : "可信执行环境"}</div></div>)}
            </div>
          </div>
          <div><label className="text-sm font-medium text-slate-700">参与方</label><div className="mt-2 space-y-2">{["张三","李四","王五","赵六"].map((u) => <label key={u} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100"><input type="checkbox" className="rounded" defaultChecked /><span className="text-sm">{u}</span></label>)}</div></div>
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>创建任务</Button></div>
        </div>
      </Drawer>

      <Drawer open={showDetail} onClose={() => setShowDetail(false)} title={detailTask?.name || "任务详情"} size="lg">
        {detailTask && <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">任务ID</div><div className="font-mono text-sm text-slate-800 mt-1">{detailTask.id}</div></div>
            <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">所属项目</div><div className="text-sm text-slate-800 mt-1">{detailTask.project}</div></div>
            <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">算法类型</div><div className="text-sm text-slate-800 mt-1">{detailTask.algorithm}</div></div>
            <div className="bg-slate-50 rounded-lg p-4"><div className="text-xs text-slate-500">参与方数</div><div className="text-sm text-slate-800 mt-1">{detailTask.participants}</div></div>
          </div>
          <div><h4 className="text-sm font-semibold text-slate-700 mb-2">执行进度</h4>
            <div className="space-y-3">
              {["任务初始化","数据加载","安全计算","结果汇总","结果输出"].map((s, i) => (
                <div key={s} className="flex items-center gap-3"><div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", i < 3 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400")}>{i < 3 ? "✓" : i + 1}</div><span className="text-sm text-slate-700">{s}</span></div>
              ))}
            </div>
          </div>
        </div>}
      </Drawer>
    </div>
  );
}
