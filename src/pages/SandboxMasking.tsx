import { useState } from "react";
import { Eye, EyeOff, Plus, Search, Play, Shield, Lock, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface MaskingRule {
  id: string;
  name: string;
  fieldType: string;
  method: string;
  strength: string;
  example: string;
  hitCount: number;
  status: string;
}

interface MaskingTask {
  id: string;
  sourceTable: string;
  targetTable: string;
  ruleCount: number;
  processedRows: number;
  status: string;
  startTime: string;
}

/* ─── Mock Data ─── */
const initialMaskingRules: MaskingRule[] = [
  { id: "MR-001", name: "手机号掩码", fieldType: "手机号", method: "mask", strength: "高", example: "138****1234", hitCount: 52300, status: "active" },
  { id: "MR-002", name: "姓名脱敏", fieldType: "姓名", method: "mask", strength: "中", example: "张*三", hitCount: 48900, status: "active" },
  { id: "MR-003", name: "身份证号哈希", fieldType: "身份证", method: "hash", strength: "高", example: "sha256:...", hitCount: 45600, status: "active" },
  { id: "MR-004", name: "邮箱替换", fieldType: "邮箱", method: "replace", strength: "中", example: "***@example.com", hitCount: 31200, status: "active" },
  { id: "MR-005", name: "地址模糊", fieldType: "地址", method: "fuzz", strength: "低", example: "北京市***区", hitCount: 28700, status: "active" },
  { id: "MR-006", name: "银行卡掩码", fieldType: "银行卡", method: "mask", strength: "高", example: "**** **** **** 1234", hitCount: 19800, status: "active" },
  { id: "MR-007", name: "手机号哈希", fieldType: "手机号", method: "hash", strength: "高", example: "sha256:...", hitCount: 15400, status: "inactive" },
  { id: "MR-008", name: "姓名替换", fieldType: "姓名", method: "replace", strength: "高", example: "[已脱敏]", hitCount: 12300, status: "active" },
  { id: "MR-009", name: "身份证截断", fieldType: "身份证", method: "truncate", strength: "中", example: "110101********1234", hitCount: 9800, status: "active" },
  { id: "MR-010", name: "邮箱哈希", fieldType: "邮箱", method: "hash", strength: "高", example: "sha256:...", hitCount: 7600, status: "inactive" },
];

const initialMaskingTasks: MaskingTask[] = [
  { id: "MT-001", sourceTable: "user_info", targetTable: "user_info_masked", ruleCount: 3, processedRows: 12500000, status: "completed", startTime: "2026-04-21 08:00" },
  { id: "MT-002", sourceTable: "order_detail", targetTable: "order_detail_masked", ruleCount: 2, processedRows: 48200000, status: "running", startTime: "2026-04-21 10:00" },
  { id: "MT-003", sourceTable: "customer_info", targetTable: "customer_info_masked", ruleCount: 4, processedRows: 856000, status: "completed", startTime: "2026-04-20 14:00" },
  { id: "MT-004", sourceTable: "payment_log", targetTable: "payment_log_masked", ruleCount: 2, processedRows: 0, status: "pending", startTime: "-" },
  { id: "MT-005", sourceTable: "logistics_info", targetTable: "logistics_info_masked", ruleCount: 1, processedRows: 2340000, status: "completed", startTime: "2026-04-19 09:00" },
  { id: "MT-006", sourceTable: "review_text", targetTable: "review_text_masked", ruleCount: 1, processedRows: 890000, status: "running", startTime: "2026-04-21 11:00" },
  { id: "MT-007", sourceTable: "device_info", targetTable: "device_info_masked", ruleCount: 2, processedRows: 0, status: "pending", startTime: "-" },
  { id: "MT-008", sourceTable: "consultation", targetTable: "consultation_masked", ruleCount: 3, processedRows: 456000, status: "completed", startTime: "2026-04-18 16:00" },
];

/* ─── Fields ─── */
const ruleFields: FieldConfig[] = [
  { key: "id", label: "规则ID", type: "text", required: true },
  { key: "name", label: "规则名称", type: "text", required: true },
  { key: "fieldType", label: "字段类型", type: "select", required: true, options: [{ label: "手机号", value: "手机号" }, { label: "姓名", value: "姓名" }, { label: "身份证", value: "身份证" }, { label: "邮箱", value: "邮箱" }, { label: "地址", value: "地址" }, { label: "银行卡", value: "银行卡" }] },
  { key: "method", label: "脱敏方式", type: "select", required: true, options: [{ label: "掩码", value: "mask" }, { label: "哈希", value: "hash" }, { label: "替换", value: "replace" }, { label: "模糊", value: "fuzz" }, { label: "截断", value: "truncate" }] },
  { key: "strength", label: "强度", type: "select", required: true, options: [{ label: "高", value: "高" }, { label: "中", value: "中" }, { label: "低", value: "低" }] },
  { key: "example", label: "示例", type: "text", required: true },
  { key: "hitCount", label: "命中次数", type: "number", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
];

const taskFields: FieldConfig[] = [
  { key: "id", label: "任务ID", type: "text", required: true },
  { key: "sourceTable", label: "源表", type: "text", required: true },
  { key: "targetTable", label: "目标表", type: "text", required: true },
  { key: "ruleCount", label: "规则数", type: "number", required: true },
  { key: "processedRows", label: "处理行数", type: "number", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [{ label: "已完成", value: "completed" }, { label: "执行中", value: "running" }, { label: "待执行", value: "pending" }] },
  { key: "startTime", label: "开始时间", type: "text", required: true },
];

const ruleDetailFields = [
  { key: "id", label: "规则ID" },
  { key: "name", label: "规则名称" },
  { key: "fieldType", label: "字段类型", type: "badge" as const },
  { key: "method", label: "脱敏方式", type: "badge" as const },
  { key: "strength", label: "强度", type: "badge" as const },
  { key: "example", label: "示例" },
  { key: "hitCount", label: "命中次数" },
  { key: "status", label: "状态", type: "badge" as const },
];

const taskDetailFields = [
  { key: "id", label: "任务ID" },
  { key: "sourceTable", label: "源表" },
  { key: "targetTable", label: "目标表" },
  { key: "ruleCount", label: "规则数" },
  { key: "processedRows", label: "处理行数" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "startTime", label: "开始时间", type: "date" as const },
];

export default function SandboxMasking() {
  const [activeTab, setActiveTab] = useState<"rules" | "tasks" | "preview">("rules");
  const [maskingRules, setMaskingRules] = useState<MaskingRule[]>(initialMaskingRules);
  const [maskingTasks, setMaskingTasks] = useState<MaskingTask[]>(initialMaskingTasks);
  const [ruleSearch, setRuleSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<"rule" | "task">("rule");

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRule, setDetailRule] = useState<MaskingRule | null>(null);
  const [detailTask, setDetailTask] = useState<MaskingTask | null>(null);

  const stats = [
    { label: "服务状态", value: "运行中", icon: Shield, color: "text-emerald-500" },
    { label: "今日处理", value: "2.1M", icon: Eye, color: "text-blue-500" },
  ];

  const filteredRules = maskingRules.filter(r => r.name.includes(ruleSearch) || r.id.includes(ruleSearch));
  const filteredTasks = maskingTasks.filter(t => t.sourceTable.includes(taskSearch) || t.id.includes(taskSearch));

  const handleCreateRule = () => {
    setDialogType("rule");
    setDialogMode("create");
    setDialogData({ id: "", name: "", fieldType: "手机号", method: "mask", strength: "中", example: "", hitCount: 0, status: "active" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleCreateTask = () => {
    setDialogType("task");
    setDialogMode("create");
    setDialogData({ id: "", sourceTable: "", targetTable: "", ruleCount: 0, processedRows: 0, status: "pending", startTime: "-" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEditRule = (rule: MaskingRule) => {
    setDialogType("rule");
    setDialogMode("edit");
    setDialogData({ ...rule });
    setEditingId(rule.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleEditTask = (task: MaskingTask) => {
    setDialogType("task");
    setDialogMode("edit");
    setDialogData({ ...task });
    setEditingId(task.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDeleteRule = (rule: MaskingRule) => {
    setDialogType("rule");
    setDialogMode("delete");
    setEditingId(rule.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDeleteTask = (task: MaskingTask) => {
    setDialogType("task");
    setDialogMode("delete");
    setEditingId(task.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogType === "rule") {
      if (dialogMode === "create") {
        const newRule: MaskingRule = {
          id: data.id,
          name: data.name,
          fieldType: data.fieldType,
          method: data.method,
          strength: data.strength,
          example: data.example,
          hitCount: Number(data.hitCount) || 0,
          status: data.status,
        };
        setMaskingRules(prev => [...prev, newRule]);
      } else if (dialogMode === "edit" && editingId) {
        setMaskingRules(prev =>
          prev.map(r =>
            r.id === editingId
              ? { ...r, ...data, hitCount: Number(data.hitCount) || 0 }
              : r
          )
        );
      }
    } else {
      if (dialogMode === "create") {
        const newTask: MaskingTask = {
          id: data.id,
          sourceTable: data.sourceTable,
          targetTable: data.targetTable,
          ruleCount: Number(data.ruleCount) || 0,
          processedRows: Number(data.processedRows) || 0,
          status: data.status,
          startTime: data.startTime,
        };
        setMaskingTasks(prev => [...prev, newTask]);
      } else if (dialogMode === "edit" && editingId) {
        setMaskingTasks(prev =>
          prev.map(t =>
            t.id === editingId
              ? { ...t, ...data, ruleCount: Number(data.ruleCount) || 0, processedRows: Number(data.processedRows) || 0 }
              : t
          )
        );
      }
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      if (dialogType === "rule") {
        setMaskingRules(prev => prev.filter(r => r.id !== editingId));
      } else {
        setMaskingTasks(prev => prev.filter(t => t.id !== editingId));
      }
    }
    setDialogOpen(false);
  };

  const openRuleDetail = (rule: MaskingRule) => {
    setDetailRule(rule);
    setDetailTask(null);
    setDetailOpen(true);
  };

  const openTaskDetail = (task: MaskingTask) => {
    setDetailTask(task);
    setDetailRule(null);
    setDetailOpen(true);
  };

  const methodText = (method: string) => {
    const map: Record<string, string> = { hash: "哈希", mask: "掩码", replace: "替换", fuzz: "模糊", truncate: "截断" };
    return map[method] || method;
  };

  const ruleCols = [
    { key: "id", title: "ID", render: (r: MaskingRule) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{r.id}</span> },
    { key: "name", title: "规则名称", render: (r: MaskingRule) => <span className="font-medium text-slate-800 dark:text-slate-200">{r.name}</span> },
    { key: "fieldType", title: "字段类型", render: (r: MaskingRule) => <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">{r.fieldType}</Badge> },
    { key: "method", title: "脱敏方式", render: (r: MaskingRule) => <Badge className={cn("text-xs", r.method === "hash" ? "bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : r.method === "mask" ? "bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : r.method === "replace" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400")}>{methodText(r.method)}</Badge> },
    { key: "strength", title: "强度", render: (r: MaskingRule) => <Badge className={cn("text-xs", r.strength === "高" ? "bg-red-500/10 text-red-600 dark:bg-red-900/30 dark:text-red-400" : r.strength === "中" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400")}>{r.strength}</Badge> },
    { key: "example", title: "示例", render: (r: MaskingRule) => <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{r.example}</span> },
    { key: "hitCount", title: "命中次数", render: (r: MaskingRule) => <span className="text-xs text-slate-500 dark:text-slate-400">{r.hitCount.toLocaleString()}</span> },
    { key: "status", title: "状态", render: (r: MaskingRule) => <StatusTag status={r.status === "active" ? "success" : "disabled"} text={r.status === "active" ? "启用" : "停用"} /> },
    { key: "actions", title: "操作", render: (r: MaskingRule) => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => openRuleDetail(r)}><Eye className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => handleEditRule(r)}><Pencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => handleDeleteRule(r)}><Trash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  const taskCols = [
    { key: "id", title: "ID", render: (t: MaskingTask) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{t.id}</span> },
    { key: "source", title: "源表", render: (t: MaskingTask) => <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{t.sourceTable}</span> },
    { key: "target", title: "目标表", render: (t: MaskingTask) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{t.targetTable}</span> },
    { key: "rules", title: "规则数", render: (t: MaskingTask) => <span className="text-xs">{t.ruleCount}</span> },
    { key: "processed", title: "处理行数", render: (t: MaskingTask) => <span className="text-xs text-slate-500 dark:text-slate-400">{t.processedRows > 0 ? t.processedRows.toLocaleString() : "-"}</span> },
    { key: "status", title: "状态", render: (t: MaskingTask) => <StatusTag status={t.status === "completed" ? "success" : t.status === "running" ? "warning" : "info"} text={t.status === "completed" ? "已完成" : t.status === "running" ? "执行中" : "待执行"} /> },
    { key: "startTime", title: "开始时间", render: (t: MaskingTask) => <span className="text-xs text-slate-500 dark:text-slate-400">{t.startTime}</span> },
    { key: "actions", title: "操作", render: (t: MaskingTask) => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => openTaskDetail(t)}><Eye className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => handleEditTask(t)}><Pencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => handleDeleteTask(t)}><Trash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  const dialogTitle = () => {
    if (dialogMode === "delete") {
      if (dialogType === "rule") return `${maskingRules.find(r => r.id === editingId)?.name || "规则"}`;
      return `${maskingTasks.find(t => t.id === editingId)?.sourceTable || "任务"}`;
    }
    return dialogType === "rule" ? "脱敏规则" : "脱敏任务";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{s.value}</div>
        </div>))}
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-1">
        {[{k:"rules",l:"脱敏规则"},{k:"tasks",l:"脱敏任务"},{k:"preview",l:"脱敏预览"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-slate-500 dark:text-slate-400")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "rules" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索规则" className="pl-9 w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={ruleSearch} onChange={e => setRuleSearch(e.target.value)} /></div>
          <Button onClick={handleCreateRule} className="gap-2"><Plus className="w-4 h-4" />新建规则</Button>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={ruleCols} data={filteredRules} /></div>
      </div>}

      {activeTab === "tasks" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索任务" className="pl-9 w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={taskSearch} onChange={e => setTaskSearch(e.target.value)} /></div>
          <Button onClick={handleCreateTask} className="gap-2"><Plus className="w-4 h-4" />新建任务</Button>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={taskCols} data={filteredTasks} /></div>
      </div>}

      {activeTab === "preview" && <div className="space-y-4">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-4 mb-4">
            <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm"><option>user_info</option><option>order_detail</option></select>
            <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm"><option>手机号掩码</option><option>姓名脱敏</option><option>身份证号哈希</option></select>
            <Button><Play className="w-4 h-4 mr-1" />预览</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-[#273548]"><tr><th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400">字段</th><th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400">原始值</th><th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400">脱敏后</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[{f:"name",o:"张三",m:"张*三"},{f:"phone",o:"13812345678",m:"138****5678"},{f:"id_card",o:"110101199001011234",m:"sha256:a1b2..."},{f:"email",o:"zhangsan@example.com",m:"***@example.com"},{f:"address",o:"北京市海淀区中关村大街1号",m:"北京市***区"}].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#273548]/50"><td className="py-2 px-3 font-mono text-xs">{r.f}</td><td className="py-2 px-3 text-slate-700 dark:text-slate-300">{r.o}</td><td className="py-2 px-3 font-mono text-xs text-primary-600 dark:text-primary-400">{r.m}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>}

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={detailRule ? `规则详情 - ${detailRule.name}` : detailTask ? `任务详情 - ${detailTask.id}` : "详情"}
        data={detailRule || detailTask || {}}
        fields={detailRule ? ruleDetailFields : detailTask ? taskDetailFields : []}
        onEdit={detailRule ? () => handleEditRule(detailRule) : detailTask ? () => handleEditTask(detailTask) : undefined}
        onDelete={detailRule ? () => handleDeleteRule(detailRule) : detailTask ? () => handleDeleteTask(detailTask) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle()}
        fields={dialogType === "rule" ? ruleFields : taskFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
