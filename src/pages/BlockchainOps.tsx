import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import {
  HardDrive,
  Bell,
  FileText,
  Archive,
  Zap,
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Download,
  Plus,
  Trash2,
  Pause,
  Play,
  Search,
  X,
  BarChart3,
  TrendingUp,
  Activity,
  Server,
  Database,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Eye,
  Pencil,
  TestTube,
  Send,
  Shield,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Filter,
  Copy,
  Check,
  GripVertical,
  MessageSquare,
  Mail,
  Phone,
  Webhook,
  Clock3,
  CalendarDays,
  PlayCircle,
  StopCircle,
  History,
  Link2,
  AlertCircle,
  Terminal,
  FileDown,
  Pin,
  PinOff,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction, createExecuteAction } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Types ─── */
type AlertRule = {
  id: string;
  name: string;
  metric: string;
  condition: string;
  level: "notice" | "info" | "warning" | "critical" | "emergency" | "fatal";
  status: "active" | "paused" | "disabled" | "testing";
  notify: string;
};

type BackupTask = {
  id: string;
  name: string;
  type: string;
  target: string;
  schedule: string;
  status: "success" | "failed" | "running" | "pending" | "cancelled" | "paused";
  lastRun: string;
  size: string;
};

type NotificationChannel = {
  id: string;
  name: string;
  type: "Email" | "SMS" | "DingTalk" | "WeCom" | "Webhook";
  status: "active" | "inactive";
  target: string;
  priority: "primary" | "backup";
  schedule: "work_hours" | "24x7" | "custom";
  scheduleWindow?: string;
};

type ScheduledTask = {
  id: string;
  name: string;
  cron: string;
  nextRun: string;
  lastRun: string;
  status: "active" | "paused" | "running";
  executeCount: number;
  dependencies: string[];
};

type TaskHistory = {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  status: "success" | "failed" | "running";
  output: string;
};

type TestHistory = {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  result: "triggered" | "not_triggered";
  simulatedValue: string;
};

type LogEntry = {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  node: string;
  message: string;
};

type DialogState = {
  open: boolean;
  mode: "create" | "edit" | "view" | "delete";
  data?: Record<string, any>;
};

/* ─── ID Generator ─── */
function genId(): string {
  return Date.now().toString(36).toUpperCase();
}

/* ─── Alert Rule Fields ─── */
const alertRuleFields: FieldConfig[] = [
  { key: "id", label: "规则ID", type: "text", required: true, placeholder: "如 AR-001" },
  { key: "name", label: "规则名称", type: "text", required: true },
  { key: "metric", label: "监控指标", type: "text", required: true },
  { key: "condition", label: "触发条件", type: "text", required: true, placeholder: "如 > 80%" },
  {
    key: "level",
    label: "告警级别",
    type: "select",
    required: true,
    options: [
      { label: "提示", value: "notice" },
      { label: "信息", value: "info" },
      { label: "警告", value: "warning" },
      { label: "严重", value: "critical" },
      { label: "紧急", value: "emergency" },
      { label: "致命", value: "fatal" },
    ],
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "启用", value: "active" },
      { label: "暂停", value: "paused" },
      { label: "禁用", value: "disabled" },
      { label: "测试中", value: "testing" },
    ],
  },
  { key: "notify", label: "通知方式", type: "text", required: true, placeholder: "邮件+短信" },
];

const alertRuleDetailFields = [
  { key: "id", label: "规则ID", type: "text" as const },
  { key: "name", label: "规则名称", type: "text" as const },
  { key: "metric", label: "监控指标", type: "text" as const },
  { key: "condition", label: "触发条件", type: "text" as const },
  { key: "level", label: "告警级别", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "notify", label: "通知方式", type: "text" as const },
];

/* ─── Backup Task Fields ─── */
const backupTaskFields: FieldConfig[] = [
  { key: "id", label: "任务ID", type: "text", required: true, placeholder: "如 BK-001" },
  { key: "name", label: "任务名称", type: "text", required: true },
  {
    key: "type",
    label: "备份类型",
    type: "select",
    required: true,
    options: [
      { label: "自动", value: "自动" },
      { label: "手动", value: "手动" },
      { label: "增量", value: "增量" },
      { label: "全量", value: "全量" },
      { label: "差异", value: "差异" },
      { label: "快照", value: "快照" },
    ],
  },
  { key: "target", label: "备份目标", type: "text", required: true, placeholder: "如 /data/backup" },
  { key: "schedule", label: "调度计划", type: "text", required: true, placeholder: "如 每天 02:00" },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "成功", value: "success" },
      { label: "失败", value: "failed" },
      { label: "运行中", value: "running" },
      { label: "已取消", value: "cancelled" },
      { label: "已暂停", value: "paused" },
      { label: "等待中", value: "pending" },
    ],
  },
  { key: "lastRun", label: "上次运行", type: "text", required: true, placeholder: "如 2025-04-22 02:00:00" },
  { key: "size", label: "备份大小", type: "text", required: true, placeholder: "如 2.1 GB" },
];

const backupTaskDetailFields = [
  { key: "id", label: "任务ID", type: "text" as const },
  { key: "name", label: "任务名称", type: "text" as const },
  { key: "type", label: "备份类型", type: "badge" as const },
  { key: "target", label: "备份目标", type: "text" as const },
  { key: "schedule", label: "调度计划", type: "text" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "lastRun", label: "上次运行", type: "date" as const },
  { key: "size", label: "备份大小", type: "text" as const },
];

/* ─── Notification Channel Fields ─── */
const notificationChannelFields: FieldConfig[] = [
  { key: "name", label: "渠道名称", type: "text", required: true },
  {
    key: "type",
    label: "渠道类型",
    type: "select",
    required: true,
    options: [
      { label: "Email", value: "Email" },
      { label: "SMS", value: "SMS" },
      { label: "DingTalk", value: "DingTalk" },
      { label: "WeCom", value: "WeCom" },
      { label: "Webhook", value: "Webhook" },
    ],
  },
  { key: "target", label: "目标地址", type: "text", required: true, placeholder: "如 email@example.com" },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "启用", value: "active" },
      { label: "停用", value: "inactive" },
    ],
  },
  {
    key: "priority",
    label: "优先级",
    type: "select",
    required: true,
    options: [
      { label: "主渠道", value: "primary" },
      { label: "备用渠道", value: "backup" },
    ],
  },
  {
    key: "schedule",
    label: "通知时段",
    type: "select",
    required: true,
    options: [
      { label: "工作时间", value: "work_hours" },
      { label: "全天候", value: "24x7" },
      { label: "自定义", value: "custom" },
    ],
  },
  { key: "scheduleWindow", label: "自定义时段", type: "text", placeholder: "如 09:00-18:00" },
];

const notificationChannelDetailFields = [
  { key: "name", label: "渠道名称", type: "text" as const },
  { key: "type", label: "渠道类型", type: "badge" as const },
  { key: "target", label: "目标地址", type: "text" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "priority", label: "优先级", type: "badge" as const },
  { key: "schedule", label: "通知时段", type: "badge" as const },
  { key: "scheduleWindow", label: "自定义时段", type: "text" as const },
];

/* ─── Scheduled Task Fields ─── */
const scheduledTaskFields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "cron", label: "Cron表达式", type: "text", required: true, placeholder: "如 0 2 * * *" },
  { key: "nextRun", label: "下次运行", type: "text", required: true, placeholder: "如 2025-04-23 02:00:00" },
  { key: "lastRun", label: "上次运行", type: "text", required: true, placeholder: "如 2025-04-22 02:00:00" },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "启用", value: "active" },
      { label: "暂停", value: "paused" },
    ],
  },
];

/* ─── Mock Log Generator ─── */
const NODES = ["节点-01", "节点-02", "节点-03", "节点-04", "节点-05"];
const LOG_LEVELS: LogEntry["level"][] = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
const LOG_MESSAGES = [
  "区块同步完成，高度: 4285691",
  "交易池大小: 124",
  "P2P连接数: 15",
  "共识轮次: 89234",
  "智能合约执行成功",
  "磁盘空间检查通过",
  "API请求处理: 200 OK",
  "数据库查询耗时: 12ms",
  "内存使用率: 58%",
  "CPU使用率: 42%",
  "网络延迟: 23ms",
  "证书验证通过",
  "区块验证失败，重试中",
  "交易签名验证失败",
  "节点心跳检测正常",
  "状态树更新完成",
  " Gas价格更新: 20 Gwei",
  "新区块广播: 4285692",
  "交易打包: 156笔",
  "日志轮转完成",
];

function generateMockLog(node?: string): LogEntry {
  const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)];
  return {
    id: genId(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    level,
    node: node || NODES[Math.floor(Math.random() * NODES.length)],
    message: LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)],
  };
}

/* ─── Log Config ─── */
function LogConfig() {
  const [config, setConfig] = useState({
    level: "INFO",
    format: "JSON",
    maxSize: 100,
    maxFiles: 30,
    retention: 90,
    outputTargets: ["文件", "控制台"],
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3.5 h-3.5" />
          保存配置
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "日志级别", value: config.level, key: "level", options: ["DEBUG", "INFO", "WARNING", "ERROR", "FATAL"] },
          { label: "日志格式", value: config.format, key: "format", options: ["JSON", "TEXT"] },
          { label: "单个日志文件大小(MB)", value: config.maxSize, key: "maxSize" },
          { label: "保留日志文件数", value: config.maxFiles, key: "maxFiles" },
          { label: "日志保留天数", value: config.retention, key: "retention" },
        ].map((f) => (
          <div key={f.key} className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <label className="block text-xs text-slate-500 mb-2">{f.label}</label>
            {f.options ? (
              <select defaultValue={f.value} className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type="number" defaultValue={f.value} className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Alert Rules ─── */
function AlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([
    { id: "AR-001", name: "节点CPU使用率告警", metric: "节点CPU使用率", condition: "> 80%", level: "warning", status: "active", notify: "邮件+短信" },
    { id: "AR-002", name: "节点内存使用率告警", metric: "节点内存使用率", condition: "> 85%", level: "warning", status: "active", notify: "邮件" },
    { id: "AR-003", name: "节点离线告警", metric: "节点状态", condition: "= 离线", level: "critical", status: "active", notify: "邮件+短信+电话" },
    { id: "AR-004", name: "区块高度停滞告警", metric: "区块高度增长", condition: "5分钟无增长", level: "critical", status: "active", notify: "邮件+短信" },
    { id: "AR-005", name: "交易池拥堵告警", metric: "待处理交易数", condition: "> 1000", level: "warning", status: "paused", notify: "邮件" },
    { id: "AR-006", name: "磁盘空间告警", metric: "磁盘使用率", condition: "> 90%", level: "critical", status: "active", notify: "邮件+短信" },
    { id: "AR-007", name: "网络延迟告警", metric: "网络延迟", condition: "> 100ms", level: "info", status: "active", notify: "邮件" },
    { id: "AR-008", name: "共识超时告警", metric: "共识耗时", condition: "> 10s", level: "critical", status: "testing", notify: "邮件+短信" },
    { id: "AR-009", name: "证书即将过期告警", metric: "证书有效期", condition: "< 30天", level: "warning", status: "active", notify: "邮件+短信" },
    { id: "AR-010", name: "API错误率告警", metric: "API错误率", condition: "> 5%", level: "emergency", status: "active", notify: "邮件+短信+电话" },
    { id: "AR-011", name: "存储写入延迟告警", metric: "存储延迟", condition: "> 500ms", level: "notice", status: "disabled", notify: "邮件" },
    { id: "AR-012", name: "P2P连接数告警", metric: "P2P连接数", condition: "< 3", level: "fatal", status: "active", notify: "邮件+短信" },
  ]);

  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>({ open: false, mode: "create" });
  const [drawer, setDrawer] = useState<{ open: boolean; data?: AlertRule }>({ open: false });
  const [testDialog, setTestDialog] = useState<{ open: boolean; rule?: AlertRule }>({ open: false });
  const [testResult, setTestResult] = useState<{ simulatedValue: string; triggered: boolean; preview: string } | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);

  const filteredRules = rules.filter(
    (r) =>
      r.name.includes(search) ||
      r.metric.includes(search) ||
      r.id.includes(search)
  );

  const handleSubmit = (data: Record<string, any>) => {
    if (dialog.mode === "create") {
      setRules((prev) => [...prev, data as AlertRule]);
    } else if (dialog.mode === "edit") {
      setRules((prev) => prev.map((r) => (r.id === data.id ? (data as AlertRule) : r)));
    }
  };

  const handleDelete = () => {
    if (dialog.data?.id) {
      setRules((prev) => prev.filter((r) => r.id !== dialog.data!.id));
    }
  };

  const openCreate = () => setDialog({ open: true, mode: "create" });
  const openEdit = (rule: AlertRule) => setDialog({ open: true, mode: "edit", data: rule });
  const openView = (rule: AlertRule) => setDrawer({ open: true, data: rule });
  const openDelete = (rule: AlertRule) => setDialog({ open: true, mode: "delete", data: rule });

  const runTest = (rule: AlertRule) => {
    const simulatedValue = rule.condition.includes("CPU") ? "85%" :
      rule.condition.includes("内存") ? "90%" :
      rule.condition.includes("离线") ? "离线" :
      rule.condition.includes("停滞") ? "0" :
      rule.condition.includes("拥堵") ? "1200" :
      rule.condition.includes("磁盘") ? "92%" :
      rule.condition.includes("延迟") ? "150ms" :
      rule.condition.includes("超时") ? "12s" :
      rule.condition.includes("过期") ? "15天" :
      rule.condition.includes("错误率") ? "7%" :
      rule.condition.includes("写入") ? "600ms" :
      rule.condition.includes("连接数") ? "2" :
      "未知";

    const triggered = rule.status !== "disabled";
    const preview = `[模拟告警] ${rule.name}\n指标: ${rule.metric}\n当前值: ${simulatedValue}\n条件: ${rule.condition}\n结果: ${triggered ? "触发告警" : "未触发"}`;

    setTestResult({ simulatedValue, triggered, preview });
      setTestHistory((prev) => [{
        id: genId(),
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        result: (triggered ? "triggered" : "not_triggered") as "triggered" | "not_triggered",
        simulatedValue,
      }, ...prev].slice(0, 50));
  };

  return (
    <div className="space-y-4">
      <PageSearchBar
        value={search}
        onChange={setSearch}
        placeholder="搜索告警规则..."
        onReset={() => setSearch("")}
        extraFilters={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
          >
            <Plus className="w-3.5 h-3.5" />
            新建规则
          </button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
              <th className="text-left py-3 px-3 font-medium text-xs">规则ID</th>
              <th className="text-left py-3 px-3 font-medium text-xs">规则名称</th>
              <th className="text-left py-3 px-3 font-medium text-xs">监控指标</th>
              <th className="text-left py-3 px-3 font-medium text-xs">触发条件</th>
              <th className="text-center py-3 px-3 font-medium text-xs">级别</th>
              <th className="text-left py-3 px-3 font-medium text-xs">通知方式</th>
              <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
              <th className="text-center py-3 px-3 font-medium text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                <td className="py-3 px-3 font-mono text-xs text-slate-500">{r.id}</td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{r.name}</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{r.metric}</td>
                <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">{r.condition}</td>
                <td className="py-3 px-3 text-center">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px]", r.level === "critical" ? "bg-red-50 text-red-700 dark:bg-red-900/30" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30")}>{r.level === "critical" ? "严重" : "警告"}</span>
                </td>
                <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{r.notify}</td>
                <td className="py-3 px-3 text-center">
                  {r.status === "active" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <Pause className="w-4 h-4 text-amber-500 inline" />}
                </td>
                <td className="py-3 px-3 text-center">
                  <ActionButtons buttons={[
                    createViewAction(() => openView(r)),
                    createEditAction(() => openEdit(r)),
                    { key: "test", icon: <TestTube className="w-4 h-4" />, label: "测试", onClick: () => { setTestDialog({ open: true, rule: r }); runTest(r); } },
                    createDeleteAction(() => openDelete(r)),
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Test History */}
      {testHistory.length > 0 && (
        <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            测试历史
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                  <th className="text-left py-2 font-medium">时间</th>
                  <th className="text-left py-2 font-medium">规则</th>
                  <th className="text-left py-2 font-medium">模拟值</th>
                  <th className="text-center py-2 font-medium">结果</th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0">
                    <td className="py-2 text-slate-500">{h.timestamp}</td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{h.ruleName}</td>
                    <td className="py-2 font-mono text-slate-600">{h.simulatedValue}</td>
                    <td className="py-2 text-center">
                      {h.result === "triggered" ? (
                        <span className="text-red-600 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> 触发</span>
                      ) : (
                        <span className="text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> 未触发</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CrudDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title="告警规则"
        fields={alertRuleFields}
        data={dialog.data}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialog.mode}
      />

      <DetailDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer({ open })}
        title={`告警规则详情 - ${drawer.data?.name ?? ""}`}
        data={drawer.data || {}}
        fields={alertRuleDetailFields}
        onEdit={() => { if (drawer.data) { setDrawer({ open: false }); openEdit(drawer.data); } }}
        onDelete={() => { if (drawer.data) { setDrawer({ open: false }); openDelete(drawer.data); } }}
      />

      {/* Test Dialog */}
      <Dialog open={testDialog.open} onOpenChange={(open) => { setTestDialog({ open }); if (!open) setTestResult(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-indigo-600" />
              规则测试 - {testDialog.rule?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {testResult && (
              <>
                <div className={cn("p-3 rounded-lg border", testResult.triggered ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800")}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.triggered ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    <span className={cn("text-sm font-medium", testResult.triggered ? "text-red-700" : "text-emerald-700")}>
                      {testResult.triggered ? "规则将触发告警" : "规则不会触发告警"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div>模拟值: <span className="font-mono">{testResult.simulatedValue}</span></div>
                    <div>触发条件: <span className="font-mono">{testDialog.rule?.condition}</span></div>
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg border", "bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]")}>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">模拟告警预览</div>
                  <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">{testResult.preview}</pre>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialog({ open: false })}>关闭</Button>
            {testDialog.rule && (
              <Button onClick={() => runTest(testDialog.rule!)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                重新测试
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Audit Policy ─── */
function AuditPolicy() {
  const [config, setConfig] = useState({
    auditEnabled: true,
    auditScope: ["用户登录", "配置修改", "合约部署", "权限变更"],
    logRetention: 365,
    storageType: "本地存储+远程备份",
    realTimeAlert: true,
    immutableStorage: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3.5 h-3.5" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">审计策略</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">启用审计</span>
              <select defaultValue={config.auditEnabled ? "是" : "否"} className={cn("px-2 py-1 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
                <option>是</option>
                <option>否</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">日志保留天数</span>
              <input type="number" defaultValue={config.logRetention} className={cn("w-24 px-2 py-1 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">实时告警</span>
              <select defaultValue={config.realTimeAlert ? "是" : "否"} className={cn("px-2 py-1 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
                <option>是</option>
                <option>否</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">防篡改存储</span>
              <select defaultValue={config.immutableStorage ? "是" : "否"} className={cn("px-2 py-1 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
                <option>是</option>
                <option>否</option>
              </select>
            </div>
          </div>
        </div>

        <div className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">审计范围</h4>
          <div className="space-y-2">
            {["用户登录", "配置修改", "合约部署", "权限变更", "节点操作", "数据访问", "交易发送"].map((scope) => (
              <label key={scope} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={config.auditScope.includes(scope)} className="rounded" />
                <span className="text-xs text-slate-600 dark:text-slate-400">{scope}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notification Channels ─── */
function NotificationChannels() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: "NC-001", name: "运维邮箱组", type: "Email", status: "active", target: "ops@example.com", priority: "primary", schedule: "24x7" },
    { id: "NC-002", name: "值班短信", type: "SMS", status: "active", target: "+86-138****8888", priority: "primary", schedule: "work_hours" },
    { id: "NC-003", name: "钉钉告警群", type: "DingTalk", status: "active", target: "https://oapi.dingtalk.com/robot/send?access_token=***", priority: "primary", schedule: "24x7" },
    { id: "NC-004", name: "企业微信", type: "WeCom", status: "inactive", target: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=***", priority: "backup", schedule: "work_hours" },
    { id: "NC-005", name: "Webhook通知", type: "Webhook", status: "active", target: "https://api.example.com/webhook/alerts", priority: "backup", schedule: "24x7" },
  ]);

  const [dialog, setDialog] = useState<DialogState>({ open: false, mode: "create" });
  const [drawer, setDrawer] = useState<{ open: boolean; data?: NotificationChannel }>({ open: false });
  const [testDialog, setTestDialog] = useState<{ open: boolean; channel?: NotificationChannel; status: "idle" | "sending" | "sent" }>({ open: false, status: "idle" });

  const handleSubmit = (data: Record<string, any>) => {
    if (dialog.mode === "create") {
      setChannels((prev) => [...prev, { ...data, id: genId() } as NotificationChannel]);
    } else if (dialog.mode === "edit") {
      setChannels((prev) => prev.map((c) => (c.id === data.id ? (data as NotificationChannel) : c)));
    }
  };

  const handleDelete = () => {
    if (dialog.data?.id) {
      setChannels((prev) => prev.filter((c) => c.id !== dialog.data!.id));
    }
  };

  const openCreate = () => setDialog({ open: true, mode: "create" });
  const openEdit = (ch: NotificationChannel) => setDialog({ open: true, mode: "edit", data: ch });
  const openView = (ch: NotificationChannel) => setDrawer({ open: true, data: ch });
  const openDelete = (ch: NotificationChannel) => setDialog({ open: true, mode: "delete", data: ch });

  const testChannel = (ch: NotificationChannel) => {
    setTestDialog({ open: true, channel: ch, status: "sending" });
    setTimeout(() => {
      setTestDialog({ open: true, channel: ch, status: "sent" });
    }, 1500);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "Email": return <Mail className="w-4 h-4" />;
      case "SMS": return <Phone className="w-4 h-4" />;
      case "DingTalk": return <MessageSquare className="w-4 h-4" />;
      case "WeCom": return <MessageSquare className="w-4 h-4" />;
      case "Webhook": return <Webhook className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">通知渠道列表</h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
        >
          <Plus className="w-3.5 h-3.5" />
          新建渠道
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
              <th className="text-left py-3 px-3 font-medium text-xs">渠道名称</th>
              <th className="text-left py-3 px-3 font-medium text-xs">类型</th>
              <th className="text-left py-3 px-3 font-medium text-xs">目标</th>
              <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
              <th className="text-center py-3 px-3 font-medium text-xs">优先级</th>
              <th className="text-center py-3 px-3 font-medium text-xs">通知时段</th>
              <th className="text-center py-3 px-3 font-medium text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{c.name}</td>
                <td className="py-3 px-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {typeIcon(c.type)}
                    {c.type}
                  </span>
                </td>
                <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{c.target}</td>
                <td className="py-3 px-3 text-center">
                  {c.status === "active" ? (
                    <span className="text-xs text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> 启用</span>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center justify-center gap-1"><Pause className="w-3 h-3" /> 停用</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", c.priority === "primary" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30" : "bg-slate-100 text-slate-600 dark:bg-[#334155]")}>
                    {c.priority === "primary" ? "主渠道" : "备用"}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-xs text-slate-600 dark:text-slate-400">
                  {c.schedule === "work_hours" ? "工作时间" : c.schedule === "24x7" ? "全天候" : c.scheduleWindow}
                </td>
                <td className="py-3 px-3 text-center">
                  <ActionButtons buttons={[
                    createViewAction(() => openView(c)),
                    createEditAction(() => openEdit(c)),
                    { key: "test", icon: <Send className="w-4 h-4" />, label: "测试", onClick: () => testChannel(c) },
                    createDeleteAction(() => openDelete(c)),
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CrudDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title="通知渠道"
        fields={notificationChannelFields}
        data={dialog.data}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialog.mode}
      />

      <DetailDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer({ open })}
        title={`通知渠道详情 - ${drawer.data?.name ?? ""}`}
        data={drawer.data || {}}
        fields={notificationChannelDetailFields}
        onEdit={() => { if (drawer.data) { setDrawer({ open: false }); openEdit(drawer.data); } }}
        onDelete={() => { if (drawer.data) { setDrawer({ open: false }); openDelete(drawer.data); } }}
      />

      {/* Test Dialog */}
      <Dialog open={testDialog.open} onOpenChange={(open) => setTestDialog({ open, status: "idle" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              测试通知渠道
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {testDialog.status === "sending" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-600">正在发送测试消息到 {testDialog.channel?.name}...</p>
              </div>
            ) : testDialog.status === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <p className="text-sm text-slate-600">测试消息已发送到 {testDialog.channel?.name}</p>
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-[#0F172A] p-3 rounded w-full">
                  <div>渠道: {testDialog.channel?.name}</div>
                  <div>类型: {testDialog.channel?.type}</div>
                  <div>目标: {testDialog.channel?.target}</div>
                  <div>时间: {new Date().toISOString().replace("T", " ").slice(0, 19)}</div>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialog({ open: false, status: "idle" })}>关闭</Button>
            {testDialog.status === "sent" && testDialog.channel && (
              <Button onClick={() => testChannel(testDialog.channel!)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                重新测试
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Backup & Recovery ─── */
function BackupRecovery() {
  const [backups, setBackups] = useState<BackupTask[]>([
    { id: "BK-001", name: "每日自动备份", type: "自动", target: "/data/backup/daily", schedule: "每天 02:00", status: "success", lastRun: "2025-04-22 02:00:00", size: "2.1 GB" },
    { id: "BK-002", name: "每周完整备份", type: "全量", target: "/data/backup/weekly", schedule: "每周日 03:00", status: "success", lastRun: "2025-04-20 03:00:00", size: "8.5 GB" },
    { id: "BK-003", name: "手动备份-20250421", type: "手动", target: "/data/backup/manual", schedule: "-", status: "success", lastRun: "2025-04-21 15:30:00", size: "2.0 GB" },
    { id: "BK-004", name: "增量备份-交易", type: "增量", target: "/data/backup/tx", schedule: "每小时", status: "running", lastRun: "2025-04-22 14:00:00", size: "150 MB" },
    { id: "BK-005", name: "快照备份-状态", type: "快照", target: "/data/backup/snap", schedule: "每4小时", status: "success", lastRun: "2025-04-22 12:00:00", size: "1.2 GB" },
    { id: "BK-006", name: "差异备份-日志", type: "差异", target: "/data/backup/log", schedule: "每天 06:00", status: "pending", lastRun: "-", size: "-" },
    { id: "BK-007", name: "紧急备份-20250420", type: "手动", target: "/data/backup/emergency", schedule: "-", status: "success", lastRun: "2025-04-20 18:00:00", size: "3.5 GB" },
    { id: "BK-008", name: "归档备份-2025Q1", type: "全量", target: "/data/backup/archive", schedule: "每季度", status: "cancelled", lastRun: "2025-03-31 00:00:00", size: "25 GB" },
    { id: "BK-009", name: "测试备份", type: "手动", target: "/data/backup/test", schedule: "-", status: "failed", lastRun: "2025-04-22 10:00:00", size: "-" },
    { id: "BK-010", name: "每日增量", type: "增量", target: "/data/backup/daily-inc", schedule: "每天 04:00", status: "paused", lastRun: "2025-04-21 04:00:00", size: "120 MB" },
  ]);

  const [dialog, setDialog] = useState<DialogState>({ open: false, mode: "create" });
  const [drawer, setDrawer] = useState<{ open: boolean; data?: BackupTask }>({ open: false });

  // Restore wizard state
  const [restoreWizard, setRestoreWizard] = useState<{
    open: boolean;
    step: number;
    backup?: BackupTask;
    backupPoint: string;
    target: string;
    preview: boolean;
    executing: boolean;
    progress: number;
    verifying: boolean;
    verifyResult: { success: boolean; details: string[] } | null;
  }>({
    open: false,
    step: 1,
    backupPoint: "",
    target: "",
    preview: false,
    executing: false,
    progress: 0,
    verifying: false,
    verifyResult: null,
  });

  // Integrity check dialog
  const [integrityDialog, setIntegrityDialog] = useState<{
    open: boolean;
    backup?: BackupTask;
    checking: boolean;
    result: { success: boolean; issues: string[] } | null;
  }>({ open: false, checking: false, result: null });

  const handleSubmit = (data: Record<string, any>) => {
    if (dialog.mode === "create") {
      setBackups((prev) => [...prev, data as BackupTask]);
    } else if (dialog.mode === "edit") {
      setBackups((prev) => prev.map((b) => (b.id === data.id ? (data as BackupTask) : b)));
    }
  };

  const handleDelete = () => {
    if (dialog.data?.id) {
      setBackups((prev) => prev.filter((b) => b.id !== dialog.data!.id));
    }
  };

  const openCreate = () => setDialog({ open: true, mode: "create" });
  const openEdit = (bk: BackupTask) => setDialog({ open: true, mode: "edit", data: bk });
  const openView = (bk: BackupTask) => setDrawer({ open: true, data: bk });
  const openDelete = (bk: BackupTask) => setDialog({ open: true, mode: "delete", data: bk });

  const startRestore = (bk: BackupTask) => {
    setRestoreWizard({
      open: true,
      step: 1,
      backup: bk,
      backupPoint: bk.lastRun !== "-" ? bk.lastRun : "2025-04-22 00:00:00",
      target: bk.target,
      preview: false,
      executing: false,
      progress: 0,
      verifying: false,
      verifyResult: null,
    });
  };

  const executeRestore = () => {
    setRestoreWizard((prev) => ({ ...prev, executing: true, progress: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setRestoreWizard((prev) => ({ ...prev, progress: 100, executing: false, verifying: true }));
        setTimeout(() => {
          setRestoreWizard((prev) => ({
            ...prev,
            verifying: false,
            verifyResult: {
              success: true,
              details: ["数据完整性检查通过", "区块哈希校验通过", "状态树一致性验证通过", "交易记录数量匹配", "元数据校验通过"],
            },
          }));
        }, 2000);
      } else {
        setRestoreWizard((prev) => ({ ...prev, progress }));
      }
    }, 500);
  };

  const checkIntegrity = (bk: BackupTask) => {
    setIntegrityDialog({ open: true, backup: bk, checking: true, result: null });
    setTimeout(() => {
      setIntegrityDialog({
        open: true,
        backup: bk,
        checking: false,
        result: {
          success: bk.status !== "failed",
          issues: bk.status === "failed" ? ["备份文件损坏", "校验和不匹配", "元数据缺失"] : [],
        },
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
          >
            <Plus className="w-3.5 h-3.5" />
            新建策略
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 dark:border-[#334155] dark:text-slate-400">
            <RotateCcw className="w-3.5 h-3.5" />
            立即备份
          </button>
        </div>
      </div>

      {/* Backup Strategies */}
      <div className="space-y-3">
        {backups.map((bk) => (
          <div key={bk.id} className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{bk.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500">{bk.type}</span>
                    <span className="text-[10px] text-slate-400">目标: {bk.target}</span>
                    <span className="text-[10px] text-slate-400">大小: {bk.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{bk.schedule}</span>
                <span className="text-xs text-slate-500">上次: {bk.lastRun}</span>
                {bk.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : bk.status === "failed" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-blue-500" />}
                <div className="flex gap-1">
                  <button onClick={() => openView(bk)} className="text-xs text-primary-600 px-2 py-0.5 rounded hover:bg-slate-50 dark:hover:bg-[#273548]">查看</button>
                  <button onClick={() => openEdit(bk)} className="text-xs text-primary-600 px-2 py-0.5 rounded hover:bg-slate-50 dark:hover:bg-[#273548]">编辑</button>
                  <button onClick={() => startRestore(bk)} className="text-xs text-indigo-600 px-2 py-0.5 rounded hover:bg-slate-50 dark:hover:bg-[#273548]">恢复</button>
                  <button onClick={() => checkIntegrity(bk)} className="text-xs text-amber-600 px-2 py-0.5 rounded hover:bg-slate-50 dark:hover:bg-[#273548]">完整性检查</button>
                  <button onClick={() => openDelete(bk)} className="text-xs text-red-600 px-2 py-0.5 rounded hover:bg-slate-50 dark:hover:bg-[#273548]">删除</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Snapshot Management */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          快照管理
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                <th className="text-left py-2 font-medium">快照ID</th>
                <th className="text-left py-2 font-medium">区块高度</th>
                <th className="text-left py-2 font-medium">大小</th>
                <th className="text-left py-2 font-medium">创建时间</th>
                <th className="text-center py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "SN-001", height: 4285000, size: "2.1 GB", time: "2025-04-22 00:00:00" },
                { id: "SN-002", height: 4284000, size: "2.0 GB", time: "2025-04-21 00:00:00" },
                { id: "SN-003", height: 4283000, size: "2.0 GB", time: "2025-04-20 00:00:00" },
              ].map((sn) => (
                <tr key={sn.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0">
                  <td className="py-2 font-mono text-slate-500">{sn.id}</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300 font-mono">{sn.height.toLocaleString()}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{sn.size}</td>
                  <td className="py-2 text-slate-500">{sn.time}</td>
                  <td className="py-2 text-center">
                    <button className="text-xs text-primary-600 mr-2">恢复</button>
                    <button className="text-xs text-red-600">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Wizard Dialog */}
      <Dialog open={restoreWizard.open} onOpenChange={(open) => { if (!open) setRestoreWizard((prev) => ({ ...prev, open: false })); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-indigo-600" />
              恢复向导 - {restoreWizard.backup?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center gap-2">
                   <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    restoreWizard.step >= step
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-[#334155]"
                  )}>
                    {restoreWizard.step > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && <div className={cn("w-8 h-0.5", restoreWizard.step > step ? "bg-primary-600" : "bg-slate-200 dark:bg-[#334155]")} />}
                </div>
              ))}
            </div>

            {/* Step 1: Select backup point */}
            {restoreWizard.step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-2">选择备份点</label>
                  <Select value={restoreWizard.backupPoint} onValueChange={(v) => setRestoreWizard((prev) => ({ ...prev, backupPoint: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择备份点" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={restoreWizard.backup?.lastRun || ""}>{restoreWizard.backup?.lastRun} (最新)</SelectItem>
                      <SelectItem value="2025-04-21 00:00:00">2025-04-21 00:00:00</SelectItem>
                      <SelectItem value="2025-04-20 00:00:00">2025-04-20 00:00:00</SelectItem>
                      <SelectItem value="2025-04-19 00:00:00">2025-04-19 00:00:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2">恢复目标路径</label>
                  <Input
                    value={restoreWizard.target}
                    onChange={(e) => setRestoreWizard((prev) => ({ ...prev, target: e.target.value }))}
                    placeholder="如 /data/restore"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {restoreWizard.step === 2 && (
              <div className="space-y-4">
                <div className={cn("p-3 rounded-lg border", "bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]")}>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">恢复预览</div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div>备份任务: {restoreWizard.backup?.name}</div>
                    <div>备份点: {restoreWizard.backupPoint}</div>
                    <div>恢复目标: {restoreWizard.target}</div>
                    <div>备份大小: {restoreWizard.backup?.size}</div>
                    <div>预计耗时: ~15分钟</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  恢复操作将覆盖目标路径下的现有数据，请确认备份点正确。
                </div>
              </div>
            )}

            {/* Step 3: Execute */}
            {restoreWizard.step === 3 && (
              <div className="space-y-4">
                {restoreWizard.executing || restoreWizard.progress > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>恢复进度</span>
                      <span>{Math.round(restoreWizard.progress)}%</span>
                    </div>
                    <Progress value={restoreWizard.progress} />
                    <div className="text-xs text-slate-500 font-mono">
                      {restoreWizard.progress < 30 ? "正在解压备份文件..." :
                       restoreWizard.progress < 60 ? "正在恢复数据文件..." :
                       restoreWizard.progress < 90 ? "正在重建索引..." :
                       restoreWizard.progress < 100 ? "正在最终校验..." :
                       "恢复完成"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-600">准备执行恢复操作</p>
                    <p className="text-xs text-slate-400 mt-1">点击"执行恢复"开始</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Verification */}
            {restoreWizard.step === 4 && (
              <div className="space-y-4">
                {restoreWizard.verifying ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm text-slate-600">正在进行恢复验证...</p>
                  </div>
                ) : restoreWizard.verifyResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {restoreWizard.verifyResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">恢复验证通过</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-red-700">恢复验证失败</span>
                        </>
                      )}
                    </div>
                    <div className={cn("p-3 rounded-lg border", "bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]")}>
                      {restoreWizard.verifyResult.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 py-0.5">
                          <Check className="w-3 h-3 text-emerald-500" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <DialogFooter>
            {restoreWizard.step > 1 && restoreWizard.step < 4 && !restoreWizard.executing && (
              <Button variant="outline" onClick={() => setRestoreWizard((prev) => ({ ...prev, step: prev.step - 1 }))}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                上一步
              </Button>
            )}
            {restoreWizard.step < 3 && (
              <Button onClick={() => setRestoreWizard((prev) => ({ ...prev, step: prev.step + 1 }))}>
                下一步
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {restoreWizard.step === 3 && !restoreWizard.executing && restoreWizard.progress === 0 && (
              <Button onClick={executeRestore}>
                <Play className="w-3.5 h-3.5 mr-1" />
                执行恢复
              </Button>
            )}
            {restoreWizard.step === 4 && (
              <Button variant="outline" onClick={() => setRestoreWizard({ open: false, step: 1, backupPoint: "", target: "", preview: false, executing: false, progress: 0, verifying: false, verifyResult: null })}>
                完成
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integrity Check Dialog */}
      <Dialog open={integrityDialog.open} onOpenChange={(open) => setIntegrityDialog({ open, checking: false, result: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              完整性检查 - {integrityDialog.backup?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {integrityDialog.checking ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
                <p className="text-sm text-slate-600">正在检查备份完整性...</p>
              </div>
            ) : integrityDialog.result ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {integrityDialog.result.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">完整性检查通过</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">完整性检查失败</span>
                    </>
                  )}
                </div>
                {integrityDialog.result.issues.length > 0 && (
                  <div className="space-y-1">
                    {integrityDialog.result.issues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrityDialog({ open: false, checking: false, result: null })}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title="备份任务"
        fields={backupTaskFields}
        data={dialog.data}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialog.mode}
      />

      <DetailDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer({ open })}
        title={`备份任务详情 - ${drawer.data?.name ?? ""}`}
        data={drawer.data || {}}
        fields={backupTaskDetailFields}
        onEdit={() => { if (drawer.data) { setDrawer({ open: false }); openEdit(drawer.data); } }}
        onDelete={() => { if (drawer.data) { setDrawer({ open: false }); openDelete(drawer.data); } }}
      />
    </div>
  );
}

/* ─── Log Viewer ─── */
function LogViewer() {
  const [selectedNode, setSelectedNode] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [timeRange, setTimeRange] = useState<string>("1h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialLogs: LogEntry[] = [];
    for (let i = 0; i < 20; i++) {
      initialLogs.push(generateMockLog());
    }
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    if (!autoRefresh || paused) return;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, generateMockLog(selectedNode === "all" ? undefined : selectedNode)];
        return newLogs.slice(-500);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, paused, selectedNode]);

  useEffect(() => {
    if (logContainerRef.current && !paused) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const filteredLogs = logs.filter((log) => {
    if (selectedNode !== "all" && log.node !== selectedNode) return false;
    if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
    if (searchKeyword && !log.message.includes(searchKeyword)) return false;
    return true;
  });

  const exportLogs = () => {
    const content = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.node}] ${l.message}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blockchain-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  const levelColor = (level: string) => {
    switch (level) {
      case "DEBUG": return "text-slate-500";
      case "INFO": return "text-blue-500";
      case "WARN": return "text-amber-500";
      case "ERROR": return "text-red-500";
      case "FATAL": return "text-purple-500";
      default: return "text-slate-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-500" />
          <Select value={selectedNode} onValueChange={setSelectedNode}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="选择节点" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部节点</SelectItem>
              {NODES.map((node) => (
                <SelectItem key={node} value={node}>{node}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          {["ALL", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                levelFilter === level
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#334155] dark:text-slate-400"
              )}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="搜索关键词..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-28">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">最近1小时</SelectItem>
            <SelectItem value="6h">最近6小时</SelectItem>
            <SelectItem value="24h">最近24小时</SelectItem>
            <SelectItem value="7d">最近7天</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          <span className="text-xs text-slate-500">自动刷新</span>
        </div>

        <button
          onClick={() => setPaused(!paused)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded text-xs",
            paused
              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
              : "bg-slate-100 text-slate-600 dark:bg-[#334155]"
          )}
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "继续" : "暂停"}
        </button>

        <button
          onClick={exportLogs}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#334155] dark:text-slate-400"
        >
          <FileDown className="w-3 h-3" />
          导出
        </button>
      </div>

      {/* Log stream */}
      <div
        ref={logContainerRef}
        className={cn(
          "rounded-xl border p-3 h-[400px] overflow-y-auto font-mono text-xs space-y-1",
          "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]"
        )}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            暂无日志记录
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded px-1">
              <span className="text-slate-400 shrink-0">{log.timestamp}</span>
              <span className={cn("shrink-0 font-semibold w-12", levelColor(log.level))}>{log.level}</span>
              <span className="text-slate-500 shrink-0 w-16">{log.node}</span>
              <span className="text-slate-700 dark:text-slate-300 break-all">
                {highlightText(log.message, searchKeyword)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>共 {filteredLogs.length} 条记录</span>
        <span>自动刷新: {autoRefresh ? (paused ? "已暂停" : "开启") : "关闭"}</span>
      </div>
    </div>
  );
}

/* ─── Scheduled Tasks ─── */
function ScheduledTasks() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([
    { id: "ST-001", name: "每日数据备份", cron: "0 2 * * *", nextRun: "2025-04-23 02:00:00", lastRun: "2025-04-22 02:00:00", status: "active", executeCount: 156, dependencies: [] },
    { id: "ST-002", name: "日志清理", cron: "0 3 * * 0", nextRun: "2025-04-27 03:00:00", lastRun: "2025-04-20 03:00:00", status: "active", executeCount: 24, dependencies: ["ST-001"] },
    { id: "ST-003", name: "健康检查", cron: "*/5 * * * *", nextRun: "2025-04-22 15:05:00", lastRun: "2025-04-22 15:00:00", status: "active", executeCount: 4521, dependencies: [] },
    { id: "ST-004", name: "数据同步", cron: "0 */6 * * *", nextRun: "2025-04-22 18:00:00", lastRun: "2025-04-22 12:00:00", status: "paused", executeCount: 89, dependencies: ["ST-003"] },
    { id: "ST-005", name: "证书更新检查", cron: "0 9 1 * *", nextRun: "2025-05-01 09:00:00", lastRun: "2025-04-01 09:00:00", status: "active", executeCount: 12, dependencies: [] },
  ]);

  const [history, setHistory] = useState<TaskHistory[]>([
    { id: "H-001", taskId: "ST-001", startTime: "2025-04-22 02:00:00", endTime: "2025-04-22 02:15:00", status: "success", output: "备份完成，大小: 2.1GB" },
    { id: "H-002", taskId: "ST-003", startTime: "2025-04-22 15:00:00", endTime: "2025-04-22 15:00:02", status: "success", output: "所有节点健康" },
    { id: "H-003", taskId: "ST-004", startTime: "2025-04-22 12:00:00", endTime: "2025-04-22 12:05:00", status: "failed", output: "连接超时" },
  ]);

  const [dialog, setDialog] = useState<DialogState>({ open: false, mode: "create" });
  const [drawer, setDrawer] = useState<{ open: boolean; data?: ScheduledTask }>({ open: false });
  const [cronEditorOpen, setCronEditorOpen] = useState(false);
  const [cronEditorData, setCronEditorData] = useState({ minute: "0", hour: "2", day: "*", month: "*", weekday: "*" });
  const [activeSubTab, setActiveSubTab] = useState("tasks");

  const handleSubmit = (data: Record<string, any>) => {
    if (dialog.mode === "create") {
      setTasks((prev) => [...prev, { ...data, id: genId(), executeCount: 0, dependencies: [] } as unknown as ScheduledTask]);
    } else if (dialog.mode === "edit") {
      setTasks((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } as ScheduledTask : t)));
    }
  };

  const handleDelete = () => {
    if (dialog.data?.id) {
      setTasks((prev) => prev.filter((t) => t.id !== dialog.data!.id));
    }
  };

  const openCreate = () => setDialog({ open: true, mode: "create" });
  const openEdit = (task: ScheduledTask) => setDialog({ open: true, mode: "edit", data: task });
  const openView = (task: ScheduledTask) => setDrawer({ open: true, data: task });
  const openDelete = (task: ScheduledTask) => setDialog({ open: true, mode: "delete", data: task });

  const manualRun = (task: ScheduledTask) => {
    const newHistory: TaskHistory = {
      id: genId(),
      taskId: task.id,
      startTime: new Date().toISOString().replace("T", " ").slice(0, 19),
      endTime: new Date(Date.now() + 30000).toISOString().replace("T", " ").slice(0, 19),
      status: "success",
      output: "手动执行完成",
    };
    setHistory((prev) => [newHistory, ...prev]);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, executeCount: t.executeCount + 1 } : t));
  };

  const toggleStatus = (task: ScheduledTask) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: t.status === "active" ? "paused" : "active" } : t));
  };

  const cronToString = () => `${cronEditorData.minute} ${cronEditorData.hour} ${cronEditorData.day} ${cronEditorData.month} ${cronEditorData.weekday}`;

  const taskDetailFields = [
    { key: "name", label: "任务名称", type: "text" as const },
    { key: "cron", label: "Cron表达式", type: "text" as const },
    { key: "nextRun", label: "下次运行", type: "text" as const },
    { key: "lastRun", label: "上次运行", type: "text" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "executeCount", label: "执行次数", type: "text" as const },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="tasks">任务列表</TabsTrigger>
          <TabsTrigger value="history">执行历史</TabsTrigger>
          <TabsTrigger value="dependencies">依赖配置</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="flex justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">定时任务</h3>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
            >
              <Plus className="w-3.5 h-3.5" />
              新建任务
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-xs">任务名称</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Cron表达式</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">下次运行</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">上次运行</th>
                  <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
                  <th className="text-center py-3 px-3 font-medium text-xs">执行次数</th>
                  <th className="text-center py-3 px-3 font-medium text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{t.name}</td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">{t.cron}</td>
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{t.nextRun}</td>
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{t.lastRun}</td>
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => toggleStatus(t)} className={cn("text-xs px-2 py-0.5 rounded-full", t.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30" : "bg-slate-100 text-slate-500 dark:bg-[#334155]")}>
                        {t.status === "active" ? "启用" : "暂停"}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-slate-600">{t.executeCount}</td>
                <td className="py-3 px-3 text-center">
                  <ActionButtons buttons={[
                    createViewAction(() => openView(t)),
                    createEditAction(() => openEdit(t)),
                    createExecuteAction(() => manualRun(t)),
                    createDeleteAction(() => openDelete(t)),
                  ]} />
                </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">执行历史</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-xs">任务</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">开始时间</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">结束时间</th>
                  <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">输出</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-xs">
                      {tasks.find((t) => t.id === h.taskId)?.name || h.taskId}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{h.startTime}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{h.endTime}</td>
                    <td className="py-3 px-3 text-center">
                      {h.status === "success" ? (
                        <span className="text-xs text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> 成功</span>
                      ) : h.status === "failed" ? (
                        <span className="text-xs text-red-600 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> 失败</span>
                      ) : (
                        <span className="text-xs text-blue-600 flex items-center justify-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> 运行中</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{h.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">任务依赖</h3>
          <div className="space-y-2">
            {tasks.filter((t) => t.dependencies.length > 0).map((t) => (
              <div key={t.id} className={cn("flex items-center gap-3 p-3 rounded-lg border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t.name}</span>
                </div>
                <Link2 className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  {t.dependencies.map((depId) => {
                    const dep = tasks.find((dt) => dt.id === depId);
                    return dep ? (
                      <span key={depId} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30">
                        {dep.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
            {tasks.filter((t) => t.dependencies.length > 0).length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">暂无任务依赖配置</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title="定时任务"
        fields={scheduledTaskFields}
        data={dialog.data}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialog.mode}
      />

      <DetailDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer({ open })}
        title={`定时任务详情 - ${drawer.data?.name ?? ""}`}
        data={drawer.data || {}}
        fields={taskDetailFields}
        onEdit={() => { if (drawer.data) { setDrawer({ open: false }); openEdit(drawer.data); } }}
        onDelete={() => { if (drawer.data) { setDrawer({ open: false }); openDelete(drawer.data); } }}
      />

      {/* Cron Editor Dialog */}
      <Dialog open={cronEditorOpen} onOpenChange={setCronEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Cron编辑器
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { label: "分钟", key: "minute" as const, options: ["*", "0", "5", "10", "15", "30", "45"] },
              { label: "小时", key: "hour" as const, options: ["*", "0", "2", "6", "9", "12", "18"] },
              { label: "日期", key: "day" as const, options: ["*", "1", "5", "10", "15", "20", "28"] },
              { label: "月份", key: "month" as const, options: ["*", "1", "3", "6", "9", "12"] },
              { label: "星期", key: "weekday" as const, options: ["*", "0", "1", "2", "3", "4", "5", "6"] },
            ].map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-12">{field.label}</label>
                <Select value={cronEditorData[field.key]} onValueChange={(v) => setCronEditorData((prev) => ({ ...prev, [field.key]: v }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className={cn("p-3 rounded-lg border", "bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]")}>
              <div className="text-xs text-slate-500">表达式预览</div>
              <div className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">{cronToString()}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCronEditorOpen(false)}>取消</Button>
            <Button onClick={() => setCronEditorOpen(false)}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Performance Tuning ─── */
function PerformanceTuning() {
  const [metrics, setMetrics] = useState({
    maxPeers: 200,
    maxPendingTxs: 100000,
    blockGasLimit: 15000000,
    txPoolPriceBump: 10,
    cacheSize: 512,
    trieTimeout: 60000,
    rpcThreads: 10,
    wsThreads: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3.5 h-3.5" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "最大P2P连接数", value: metrics.maxPeers, desc: "P2P网络最大对等节点数" },
          { label: "交易池容量", value: metrics.maxPendingTxs, desc: "待处理交易最大数量" },
          { label: "区块Gas上限", value: metrics.blockGasLimit, desc: "单个区块Gas消耗上限" },
          { label: "Gas价格增幅(%)", value: metrics.txPoolPriceBump, desc: "替换交易的最小Gas增幅" },
          { label: "缓存大小(MB)", value: metrics.cacheSize, desc: "状态数据库缓存大小" },
          { label: "Trie超时(ms)", value: metrics.trieTimeout, desc: "状态树缓存刷新间隔" },
          { label: "RPC线程数", value: metrics.rpcThreads, desc: "RPC服务处理线程数" },
          { label: "WS线程数", value: metrics.wsThreads, desc: "WebSocket服务线程数" },
        ].map((f) => (
          <div key={f.label} className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
            <p className="text-[10px] text-slate-400 mb-2">{f.desc}</p>
            <input type="number" defaultValue={f.value} className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
          </div>
        ))}
      </div>

      {/* Performance Charts Placeholder */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          性能指标监控
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "平均出块时间", value: "4.8s", target: "5.0s", status: "good" },
            { label: "平均交易确认", value: "2.3s", target: "3.0s", status: "good" },
            { label: "TPS", value: "2,847", target: "3,000", status: "warning" },
            { label: "CPU使用率", value: "42%", target: "< 70%", status: "good" },
          ].map((m) => (
            <div key={m.label} className={cn("p-3 rounded-lg text-center", m.status === "good" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20")}>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{m.value}</div>
              <div className="text-[10px] text-slate-500">{m.label}</div>
              <div className="text-[10px] text-slate-400">目标: {m.target}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Monitoring Dashboard ─── */
function MonitoringDashboard() {
  const nodeMetrics = [
    { name: "共识节点-01", cpu: 42, memory: 58, disk: 67, network: 320, status: "online" },
    { name: "共识节点-02", cpu: 38, memory: 52, disk: 61, network: 280, status: "online" },
    { name: "共识节点-03", cpu: 45, memory: 60, disk: 70, network: 350, status: "online" },
    { name: "共识节点-04", cpu: 78, memory: 82, disk: 75, network: 450, status: "warning" },
    { name: "共识节点-05", cpu: 35, memory: 48, disk: 55, network: 250, status: "online" },
  ];
  const alertsData = [
    { id: "AL-001", level: "critical", title: "共识节点-04 CPU使用率过高", metric: "CPU 78%", time: "2025-04-22 10:30:00", status: "unresolved" },
    { id: "AL-002", level: "warning", title: "存储节点-02 磁盘空间不足", metric: "磁盘 88%", time: "2025-04-22 09:15:00", status: "unresolved" },
    { id: "AL-003", level: "info", title: "金融联盟链出块时间波动", metric: "出块 3.5s", time: "2025-04-22 08:00:00", status: "resolved" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: "当前TPS", value: "5,200", icon: <Zap className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20", change: "+5.2%", up: true },
          { label: "区块高度", value: "4,285,691", icon: <Database className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20", change: "+128", up: true },
          { label: "待处理交易", value: "124", icon: <Clock className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20", change: "-12", up: true },
          { label: "活跃节点", value: "42", icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20", change: "0", up: true },
          { label: "平均出块", value: "2.1s", icon: <Activity className="w-5 h-5 text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/20", change: "-0.1s", up: true },
          { label: "总交易数", value: "156,789,012", icon: <BarChart3 className="w-5 h-5 text-rose-500" />, color: "bg-rose-50 dark:bg-rose-900/20", change: "+12.5K", up: true },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
            <div className={cn("text-xs mt-1 flex items-center gap-0.5", s.up ? "text-emerald-600" : "text-red-600")}>
              {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.change}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#273548] text-sm font-medium">节点监控</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-[#273548]">
              <tr>{["节点名称", "CPU", "内存", "磁盘", "网络IO", "状态"].map(h => <th key={h} className="px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-400">{h}</th>)}</tr>
            </thead>
            <tbody>
              {nodeMetrics.map((node, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100 text-xs">{node.name}</td>
                  {[{v:node.cpu,c:node.cpu>70},{v:node.memory,c:node.memory>80},{v:node.disk,c:node.disk>80}].map((m,j)=> (
                    <td key={j} className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className={cn("h-full rounded-full", m.c?"bg-red-500":"bg-indigo-500")} style={{width:`${m.v}%`}} /></div><span className="text-xs text-slate-600">{m.v}%</span></div></td>
                  ))}
                  <td className="px-3 py-2 text-xs text-slate-600">{node.network} KB/s</td>
                  <td className="px-3 py-2">{node.status==="online"?<CheckCircle2 className="w-4 h-4 text-emerald-500" />:<AlertTriangle className="w-4 h-4 text-amber-500" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#273548] text-sm font-medium">告警事件</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-[#273548]">
              <tr>{["告警ID", "级别", "标题", "时间", "状态"].map(h => <th key={h} className="px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-400">{h}</th>)}</tr>
            </thead>
            <tbody>
              {alertsData.map(alert => (
                <tr key={alert.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{alert.id}</td>
                  <td className="px-3 py-2"><span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", alert.level==="critical"?"bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400":alert.level==="warning"?"bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400":"bg-blue-50 text-blue-700")}>{alert.level==="critical"?"严重":alert.level==="warning"?"警告":"提示"}</span></td>
                  <td className="px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100">{alert.title}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{alert.time}</td>
                  <td className="px-3 py-2">{alert.status==="resolved"?<span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />已恢复</span>:<span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />未恢复</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainOps() {
  const [activeTab, setActiveTab] = useState<string>("monitoring");

  const tabs = [
    { key: "monitoring", label: "实时监控", icon: <Monitor className="w-4 h-4" /> },
    { key: "logs", label: "日志配置", icon: <FileText className="w-4 h-4" /> },
    { key: "logviewer", label: "日志查看", icon: <Terminal className="w-4 h-4" /> },
    { key: "alerts", label: "告警规则", icon: <Bell className="w-4 h-4" /> },
    { key: "channels", label: "通知渠道", icon: <Send className="w-4 h-4" /> },
    { key: "audit", label: "审计策略", icon: <Activity className="w-4 h-4" /> },
    { key: "backup", label: "备份恢复", icon: <Archive className="w-4 h-4" /> },
    { key: "scheduled", label: "定时任务", icon: <Clock3 className="w-4 h-4" /> },
    { key: "performance", label: "性能调优", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="运维监控" />
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">日志配置、告警规则、审计策略、备份恢复、快照归档、性能调优</p>

      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="flex border-b border-slate-200 dark:border-[#334155] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3 text-sm transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-600 font-medium bg-primary-50/50 dark:bg-primary-900/10"
                  : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === "monitoring" && <MonitoringDashboard />}
          {activeTab === "logs" && <LogConfig />}
          {activeTab === "logviewer" && <LogViewer />}
          {activeTab === "alerts" && <AlertRules />}
          {activeTab === "channels" && <NotificationChannels />}
          {activeTab === "audit" && <AuditPolicy />}
          {activeTab === "backup" && <BackupRecovery />}
          {activeTab === "scheduled" && <ScheduledTasks />}
          {activeTab === "performance" && <PerformanceTuning />}
        </div>
      </div>
    </div>
  );
}
