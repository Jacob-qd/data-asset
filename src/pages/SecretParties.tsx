import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Users, ShieldCheck, BookOpen, Search, Plus, Eye, Edit2, Trash2, Database, FileText, Lock, Fingerprint, CalendarDays, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

interface Party { id: string; name: string; type: string; status: string; publicKey: string; registeredDate: string; role: string; projectCount: number; ip: string; }
interface AuditLog { id: string; time: string; operation: string; operator: string; project: string; task: string; status: string; detail: string; }
interface Evidence { id: string; type: string; project: string; task: string; hash: string; timestamp: string; txHash: string; }

const mockLogs: AuditLog[] = [
  { id: "AL-001", time: "2026-04-21 10:30:00", operation: "任务创建", operator: "张三", project: "联合风控建模", task: "联合训练-第3轮", status: "success", detail: "成功创建MPC训练任务" },
  { id: "AL-002", time: "2026-04-21 10:15:00", operation: "数据访问", operator: "系统", project: "医疗数据融合", task: "-", status: "success", detail: "参与方 阿里云 访问数据源 user_db" },
  { id: "AL-003", time: "2026-04-21 09:45:00", operation: "配置变更", operator: "李四", project: "跨机构统计", task: "-", status: "success", detail: "更新隐私预算参数 epsilon=0.1" },
  { id: "AL-004", time: "2026-04-21 09:30:00", operation: "参与方添加", operator: "王五", project: "供应链协同", task: "-", status: "success", detail: "添加新参与方 京东云" },
  { id: "AL-005", time: "2026-04-21 09:00:00", operation: "任务执行", operator: "系统", project: "联合风控建模", task: "联合训练-第3轮", status: "success", detail: "任务开始执行，参与方: 5" },
  { id: "AL-006", time: "2026-04-20 18:00:00", operation: "结果导出", operator: "赵六", project: "身份隐私验证", task: "身份验证测试", status: "success", detail: "导出ZKP验证结果" },
  { id: "AL-007", time: "2026-04-20 16:30:00", operation: "任务创建", operator: "钱七", project: "安全图像识别", task: "安全推理-批次2", status: "failure", detail: "TEE环境初始化失败" },
  { id: "AL-008", time: "2026-04-20 14:00:00", operation: "数据访问", operator: "系统", project: "基因数据计算", task: "-", status: "success", detail: "参与方 华为云 访问数据源 gene_db" },
];

const mockEvidence: Evidence[] = [
  { id: "EV-001", type: "计算结果", project: "联合风控建模", task: "联合训练-第3轮", hash: "sha256:a1b2...c3d4", timestamp: "2026-04-21 10:30:00", txHash: "0x7a8b...9c0d" },
  { id: "EV-002", type: "中间值", project: "医疗数据融合", task: "加密特征提取", hash: "sha256:b2c3...d4e5", timestamp: "2026-04-21 09:45:00", txHash: "0x8b9c...0d1e" },
  { id: "EV-003", type: "审计记录", project: "身份隐私验证", task: "身份验证测试", hash: "sha256:c3d4...e5f6", timestamp: "2026-04-20 18:00:00", txHash: "0x9c0d...1e2f" },
  { id: "EV-004", type: "计算结果", project: "跨机构统计", task: "数据聚合统计", hash: "sha256:d4e5...f6g7", timestamp: "2026-04-21 08:30:00", txHash: "0x0d1e...2f3g" },
  { id: "EV-005", type: "梯度数据", project: "隐私推荐引擎", task: "推荐模型更新", hash: "sha256:e5f6...g7h8", timestamp: "2026-04-21 07:15:00", txHash: "0x1e2f...3g4h" },
  { id: "EV-006", type: "密钥片段", project: "密钥管理优化", task: "密钥分发验证", hash: "sha256:f6g7...h8i9", timestamp: "2026-04-20 14:30:00", txHash: "0x2f3g...4h5i" },
  { id: "EV-007", type: "投票结果", project: "隐私投票系统", task: "投票结果汇总", hash: "sha256:g7h8...i9j0", timestamp: "2026-04-19 09:00:00", txHash: "0x3g4h...5i6j" },
  { id: "EV-008", type: "审计记录", project: "安全日志分析", task: "日志异常检测", hash: "sha256:h8i9...j0k1", timestamp: "2026-04-18 16:45:00", txHash: "0x4h5i...6j7k" },
  { id: "EV-009", type: "计算结果", project: "供应链协同", task: "供应链数据对齐", hash: "sha256:i9j0...k1l2", timestamp: "2026-04-21 11:20:00", txHash: "0x5i6j...7k8l" },
  { id: "EV-010", type: "中间值", project: "基因数据计算", task: "基因序列比对", hash: "sha256:j0k1...l2m3", timestamp: "2026-04-20 10:00:00", txHash: "0x6j7k...8l9m" },
];

const partyFields: FieldConfig[] = [
  { key: "name", label: "参与方名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", options: [
    { label: "企业", value: "企业" },
    { label: "个人", value: "个人" },
    { label: "政府机构", value: "政府机构" },
    { label: "科研机构", value: "科研机构" },
    { label: "医疗机构", value: "医疗机构" },
    { label: "金融机构", value: "金融机构" },
  ]},
  { key: "status", label: "状态", type: "select", options: [
    { label: "已注册", value: "registered" },
    { label: "已认证", value: "certified" },
    { label: "已暂停", value: "suspended" },
    { label: "已注销", value: "terminated" },
    { label: "待审核", value: "pending" },
    { label: "已冻结", value: "frozen" },
  ]},
  { key: "publicKey", label: "公钥指纹", type: "text" },
  { key: "role", label: "角色", type: "select", options: [
    { label: "数据方", value: "数据方" },
    { label: "计算方", value: "计算方" },
    { label: "审计方", value: "审计方" },
    { label: "协调方", value: "协调方" },
    { label: "监管方", value: "监管方" },
    { label: "见证方", value: "见证方" },
  ]},
  { key: "ip", label: "IP地址", type: "text" },
  { key: "projectCount", label: "项目数", type: "number" },
];

const detailFields = [
  { key: "id", label: "参与方ID" },
  { key: "name", label: "名称" },
  { key: "type", label: "类型" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "role", label: "角色" },
  { key: "publicKey", label: "公钥指纹" },
  { key: "ip", label: "IP地址" },
  { key: "projectCount", label: "项目数" },
  { key: "registeredDate", label: "注册日期" },
];

export default function SecretParties() {
  const [activeTab, setActiveTab] = useState<"parties" | "logs" | "evidence">("parties");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parties, setParties] = useState<Party[]>([
    { id: "P-001", name: "阿里云", type: "企业", status: "certified", publicKey: "a1b2c3...d4e5f6", registeredDate: "2026-01-15", role: "计算方", projectCount: 5, ip: "10.0.1.10" },
    { id: "P-002", name: "腾讯云", type: "企业", status: "certified", publicKey: "b2c3d4...e5f6g7", registeredDate: "2026-01-20", role: "数据方", projectCount: 3, ip: "10.0.1.11" },
    { id: "P-003", name: "华为云", type: "企业", status: "registered", publicKey: "c3d4e5...f6g7h8", registeredDate: "2026-02-10", role: "计算方", projectCount: 4, ip: "10.0.1.12" },
    { id: "P-004", name: "招商银行", type: "企业", status: "certified", publicKey: "d4e5f6...g7h8i9", registeredDate: "2026-02-15", role: "数据方", projectCount: 2, ip: "10.0.2.10" },
    { id: "P-005", name: "平安科技", type: "企业", status: "suspended", publicKey: "e5f6g7...h8i9j0", registeredDate: "2026-03-01", role: "审计方", projectCount: 1, ip: "10.0.2.11" },
    { id: "P-006", name: "微众银行", type: "企业", status: "certified", publicKey: "f6g7h8...i9j0k1", registeredDate: "2026-03-10", role: "计算方", projectCount: 6, ip: "10.0.3.10" },
    { id: "P-007", name: "百度智能云", type: "企业", status: "registered", publicKey: "g7h8i9...j0k1l2", registeredDate: "2026-03-20", role: "数据方", projectCount: 2, ip: "10.0.3.11" },
    { id: "P-008", name: "科研机构A", type: "个人", status: "certified", publicKey: "h8i9j0...k1l2m3", registeredDate: "2026-04-01", role: "审计方", projectCount: 1, ip: "10.0.4.10" },
    { id: "P-009", name: "京东云", type: "企业", status: "certified", publicKey: "i9j0k1...l2m3n4", registeredDate: "2026-04-05", role: "计算方", projectCount: 3, ip: "10.0.4.11" },
    { id: "P-010", name: "中科院", type: "企业", status: "registered", publicKey: "j0k1l2...m3n4o5", registeredDate: "2026-04-10", role: "数据方", projectCount: 2, ip: "10.0.5.10" },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredParties = parties.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newParty: Party = {
        ...data,
        id: Date.now().toString(36).toUpperCase(),
        registeredDate: new Date().toISOString().split("T")[0],
      };
      setParties((prev) => [...prev, newParty]);
    } else {
      setParties((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
    }
    setDialogOpen(false);
    setSelectedParty(null);
  };

  const handleDelete = (data: Party) => {
    setParties((prev) => prev.filter((p) => p.id !== data.id));
    setDialogOpen(false);
    setDrawerOpen(false);
    setSelectedParty(null);
  };

  const handleEdit = (data: Party) => {
    setSelectedParty(data);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const partyCols = [
    { key: "id", title: "参与方ID", cell: (p: Party) => <span className="font-mono text-xs text-slate-500">{p.id}</span> },
    { key: "name", title: "名称", cell: (p: Party) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: "type", title: "类型", cell: (p: Party) => <Badge variant="outline">{p.type}</Badge> },
    { key: "status", title: "状态", cell: (p: Party) => <StatusTag status={p.status === "certified" ? "success" : p.status === "registered" ? "info" : "warning"} text={p.status === "certified" ? "已认证" : p.status === "registered" ? "已注册" : "已暂停"} /> },
    { key: "role", title: "角色", cell: (p: Party) => <span className="text-xs text-slate-500">{p.role}</span> },
    { key: "key", title: "公钥指纹", cell: (p: Party) => <span className="font-mono text-xs text-slate-400">{p.publicKey}</span> },
    { key: "projects", title: "项目数", cell: (p: Party) => <span className="text-xs text-slate-500">{p.projectCount}</span> },
    { key: "actions", title: "操作", cell: (p: Party) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setSelectedParty(p); setDrawerOpen(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { if (window.confirm("确定删除该参与方吗？")) handleDelete(p); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    )},
  ];

  const logCols = [
    { key: "time", title: "时间", cell: (l: AuditLog) => <span className="text-xs text-slate-500">{l.time}</span> },
    { key: "operation", title: "操作类型", cell: (l: AuditLog) => <Badge className={cn("text-xs", l.operation === "任务创建" ? "bg-blue-500/10 text-blue-600" : l.operation === "数据访问" ? "bg-purple-500/10 text-purple-600" : l.operation === "结果导出" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>{l.operation}</Badge> },
    { key: "operator", title: "操作者", cell: (l: AuditLog) => <span className="text-xs text-slate-700">{l.operator}</span> },
    { key: "project", title: "项目", cell: (l: AuditLog) => <span className="text-xs text-slate-500">{l.project}</span> },
    { key: "status", title: "状态", cell: (l: AuditLog) => <StatusTag status={l.status === "success" ? "success" : "danger"} text={l.status === "success" ? "成功" : "失败"} /> },
    { key: "detail", title: "详情", cell: (l: AuditLog) => <span className="text-xs text-slate-500 truncate max-w-[200px]">{l.detail}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"parties",l:"参与方管理",i:Users},{k:"logs",l:"审计日志",i:BookOpen},{k:"evidence",l:"存证信息",i:FileText}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors", activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500 hover:text-slate-700")}>
            <t.i className="w-4 h-4" />{t.l}
          </button>
        ))}
      </div>

      {activeTab === "parties" && <>
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索参与方" className="pl-9 w-64" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option value="all">全部</option><option value="registered">已注册</option><option value="certified">已认证</option><option value="suspended">已暂停</option></select>
          </div>
          <Button onClick={() => { setDialogMode("create"); setSelectedParty(null); setDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />注册参与方</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={partyCols} data={filteredParties} /></div>
      </>}

      {activeTab === "logs" && <>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索日志" className="pl-9 w-64" /></div>
          <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option>全部操作</option><option>任务创建</option><option>数据访问</option><option>配置变更</option><option>结果导出</option></select>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={logCols} data={mockLogs} /></div>
      </>}

      {activeTab === "evidence" && <>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">存证ID</th><th className="text-left py-3 px-4 text-slate-500 font-medium">类型</th><th className="text-left py-3 px-4 text-slate-500 font-medium">项目</th><th className="text-left py-3 px-4 text-slate-500 font-medium">Hash</th><th className="text-left py-3 px-4 text-slate-500 font-medium">时间</th><th className="text-left py-3 px-4 text-slate-500 font-medium">区块链Tx</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{mockEvidence.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50"><td className="py-3 px-4 font-mono text-xs text-slate-500">{e.id}</td><td className="py-3 px-4"><Badge variant="outline">{e.type}</Badge></td><td className="py-3 px-4 text-slate-700">{e.project}</td><td className="py-3 px-4 font-mono text-xs text-slate-400">{e.hash}</td><td className="py-3 px-4 text-xs text-slate-500">{e.timestamp}</td><td className="py-3 px-4 font-mono text-xs text-slate-400">{e.txHash}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </>}

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="参与方"
        fields={partyFields}
        data={selectedParty || {}}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={selectedParty ? () => handleDelete(selectedParty) : undefined}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="参与方详情"
        data={selectedParty || {}}
        fields={detailFields}
        onEdit={() => selectedParty && handleEdit(selectedParty)}
        onDelete={() => selectedParty && handleDelete(selectedParty)}
      />
    </div>
  );
}
