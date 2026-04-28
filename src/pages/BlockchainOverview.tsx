import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Blocks,
  Server,
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  Zap,
  HardDrive,
  Network,
  ShieldCheck,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type FieldConfig, CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
type AlertLevel = "critical" | "warning" | "info" | "notice" | "debug" | "emergency" | "fatal";
type AlertStatus = "unhandled" | "handled" | "processing" | "escalated" | "ignored";

interface AlertRecord {
  id: string;
  level: AlertLevel;
  content: string;
  time: string;
  status: AlertStatus;
}

/* ─── Mock Data ─── */
const chainStats = [
  { label: "区块高度", value: "4,285,691", change: "+1,248", icon: <Blocks className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
  { label: "交易总数", value: "2,847,391", change: "+3,521", icon: <Zap className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { label: "共识节点", value: "10", change: "9正常 1警告", icon: <Server className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/30" },
  { label: "当前TPS", value: "2,847", change: "峰值3,500", icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
];

const componentStatus = [
  { name: "共识服务", status: "normal", latency: "12ms", uptime: "99.98%", detail: "PBFT共识运行正常" },
  { name: "网络通信", status: "normal", latency: "8ms", uptime: "99.95%", detail: "P2P网络连接稳定" },
  { name: "存储引擎", status: "normal", latency: "25ms", uptime: "99.92%", detail: "LevelDB读写正常" },
  { name: "状态数据库", status: "warning", latency: "45ms", uptime: "98.50%", detail: "内存使用率82%" },
  { name: "交易池", status: "normal", latency: "3ms", uptime: "99.99%", detail: "待处理交易:156" },
  { name: "区块生成", status: "normal", latency: "5ms", uptime: "99.97%", detail: "出块间隔:5s" },
  { name: "加密服务", status: "normal", latency: "2ms", uptime: "100%", detail: "SM2/SM3运行正常" },
  { name: "证书管理", status: "normal", latency: "1ms", uptime: "100%", detail: "证书未过期" },
];

const tpsHistory = [
  { time: "00:00", value: 1200 },
  { time: "02:00", value: 980 },
  { time: "04:00", value: 850 },
  { time: "06:00", value: 1500 },
  { time: "08:00", value: 2800 },
  { time: "10:00", value: 3500 },
  { time: "12:00", value: 3200 },
  { time: "14:00", value: 2847 },
  { time: "16:00", value: 2600 },
  { time: "18:00", value: 2100 },
  { time: "20:00", value: 1800 },
  { time: "22:00", value: 1400 },
];

const alertFields: FieldConfig[] = [
  { key: "id", label: "告警编号", type: "text", required: true, placeholder: "例如：ALT-006" },
  { key: "level", label: "级别", type: "select", required: true, options: [
    { label: "严重", value: "critical" },
    { label: "警告", value: "warning" },
    { label: "信息", value: "info" },
    { label: "提示", value: "notice" },
    { label: "调试", value: "debug" },
    { label: "紧急", value: "emergency" },
  ]},
  { key: "content", label: "内容", type: "textarea", required: true, placeholder: "告警内容描述" },
  { key: "time", label: "时间", type: "text", required: true, placeholder: "2025-04-22 14:30:00" },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "未处理", value: "unhandled" },
    { label: "处理中", value: "processing" },
    { label: "已处理", value: "handled" },
    { label: "已忽略", value: "ignored" },
    { label: "已升级", value: "escalated" },
  ]},
];

const detailFields = [
  { key: "id", label: "告警编号", type: "text" as const },
  { key: "level", label: "级别", type: "badge" as const },
  { key: "content", label: "内容", type: "text" as const },
  { key: "time", label: "时间", type: "date" as const },
  { key: "status", label: "状态", type: "badge" as const },
];

/* ─── Helper ─── */
function getLevelLabel(level: AlertLevel): string {
  const map: Record<string, string> = {
    critical: "严重", warning: "警告", info: "信息", notice: "提示",
    debug: "调试", emergency: "紧急", fatal: "致命",
  };
  return map[level] || level;
}

function getLevelBadgeClass(level: AlertLevel): string {
  const map: Record<string, string> = {
    critical: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    notice: "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
    debug: "bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
    emergency: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    fatal: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };
  return map[level] || map.info;
}

function getStatusLabel(status: AlertStatus): string {
  const map: Record<string, string> = {
    handled: "已处理", unhandled: "未处理", processing: "处理中",
    escalated: "已升级", ignored: "已忽略",
  };
  return map[status] || status;
}

/* ─── Component ─── */
export default function BlockchainOverview() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([
    { id: "ALT-001", level: "warning", content: "状态数据库内存使用率超过80%", time: "2025-04-22 14:30:00", status: "unhandled" },
    { id: "ALT-002", level: "info", content: "节点node-04网络延迟升高至45ms", time: "2025-04-22 13:15:00", status: "handled" },
    { id: "ALT-003", level: "critical", content: "存储节点-03离线超过10分钟", time: "2025-04-22 12:48:00", status: "handled" },
    { id: "ALT-004", level: "info", content: "智能合约DataSharing完成升级", time: "2025-04-22 11:20:00", status: "handled" },
    { id: "ALT-005", level: "warning", content: "交易池待处理交易数超过阈值", time: "2025-04-22 10:05:00", status: "handled" },
    { id: "ALT-006", level: "critical", content: "共识节点-02 CPU使用率超过90%", time: "2025-04-22 09:30:00", status: "processing" },
    { id: "ALT-007", level: "notice", content: "节点node-08磁盘空间使用率85%", time: "2025-04-22 08:45:00", status: "unhandled" },
    { id: "ALT-008", level: "info", content: "系统备份任务完成", time: "2025-04-22 08:00:00", status: "handled" },
    { id: "ALT-009", level: "warning", content: "跨链路由延迟超过3秒", time: "2025-04-22 07:30:00", status: "escalated" },
    { id: "ALT-010", level: "debug", content: "日志清理任务执行完成", time: "2025-04-22 06:00:00", status: "ignored" },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any>>({});
  const [dialogTitle, setDialogTitle] = useState("告警");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<AlertRecord | null>(null);

  const openCreate = () => {
    setDialogMode("create");
    setDialogData({});
    setDialogTitle("告警");
    setDialogOpen(true);
  };

  const openEdit = (alert: AlertRecord) => {
    setDialogMode("edit");
    setDialogData(alert);
    setDialogTitle(`告警 ${alert.id}`);
    setDialogOpen(true);
  };

  const openView = (alert: AlertRecord) => {
    setDrawerData(alert);
    setDrawerOpen(true);
  };

  const openDelete = (alert: AlertRecord) => {
    setDialogMode("delete");
    setDialogData(alert);
    setDialogTitle(`告警 ${alert.id}`);
    setDialogOpen(true);
  };

  const handleCreate = (data: Record<string, any>) => {
    const newAlert: AlertRecord = {
      id: data.id || `ALT-${String(Date.now()).slice(-3)}`,
      level: data.level as AlertLevel,
      content: data.content,
      time: data.time,
      status: data.status as AlertStatus,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleEdit = (data: Record<string, any>) => {
    const originalId = dialogData.id as string;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === originalId
          ? {
              ...a,
              id: data.id,
              level: data.level as AlertLevel,
              content: data.content,
              time: data.time,
              status: data.status as AlertStatus,
            }
          : a
      )
    );
  };

  const handleDelete = () => {
    const id = dialogData.id as string;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDialogSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      handleCreate(data);
    } else if (dialogMode === "edit") {
      handleEdit(data);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">区块链运维监控</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">核心组件关键数据监控与运维管理</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            网络正常运行
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {chainStats.map((s) => (
          <div key={s.label} className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{s.value}</div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">{s.label}</span>
                <span className="text-[10px] text-emerald-600">{s.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle: TPS Chart + Component Status */}
      <div className="grid grid-cols-5 gap-4">
        {/* TPS Chart */}
        <div className={cn("col-span-2 rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              TPS 趋势
            </h3>
            <span className="text-[10px] text-slate-500">近24小时</span>
          </div>
          <div className="h-32 flex items-end gap-1">
            {tpsHistory.map((d) => (
              <div key={d.time} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary-500/80 rounded-t-sm transition-all"
                  style={{ height: `${(d.value / 4000) * 100}%` }}
                />
                <span className="text-[9px] text-slate-400">{d.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Component Status */}
        <div className={cn("col-span-3 rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-violet-600" />
              核心组件状态
            </h3>
            <Link to="/blockchain/ops" className="text-[10px] text-primary-600 flex items-center gap-0.5">
              运维详情 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {componentStatus.map((c) => (
              <div key={c.name} className={cn(
                "p-2.5 rounded-lg border",
                c.status === "normal"
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                  : "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {c.status === "normal" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{c.latency}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Alerts + Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Alerts */}
        <div className={cn("col-span-2 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <div className="p-4 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              告警事件
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openCreate}>
                + 新增告警
              </Button>
              <Link to="/blockchain/ops" className="text-[10px] text-primary-600 flex items-center gap-0.5">
                告警管理 <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="px-4 pb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#334155]">
                  <th className="text-left py-2 font-medium">级别</th>
                  <th className="text-left py-2 font-medium">内容</th>
                  <th className="text-left py-2 font-medium">时间</th>
                  <th className="text-center py-2 font-medium">状态</th>
                  <th className="text-center py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 dark:border-[#334155] last:border-0">
                    <td className="py-2">
                      <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]", getLevelBadgeClass(a.level))}>
                        {getLevelLabel(a.level)}
                      </span>
                    </td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{a.content}</td>
                    <td className="py-2 text-slate-500">{a.time}</td>
                    <td className="py-2 text-center">
                      {a.status === "handled" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-500 inline" />
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                          onClick={() => openView(a)}
                        >
                          查看
                        </button>
                        <button
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                          onClick={() => openEdit(a)}
                        >
                          编辑
                        </button>
                        <button
                          className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                          onClick={() => openDelete(a)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Nav */}
        <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">功能导航</h3>
          <div className="space-y-1.5">
            {[
              { label: "联盟和节点管理", path: "/blockchain/nodes", icon: <Server className="w-4 h-4" />, desc: "联盟链与节点" },
              { label: "区块链浏览器", path: "/blockchain/explorer", icon: <Blocks className="w-4 h-4" />, desc: "区块与交易" },
              { label: "链核心管理", path: "/blockchain/core", icon: <Cpu className="w-4 h-4" />, desc: "共识、网络、存储" },
              { label: "智能合约管理", path: "/blockchain/contracts", icon: <FileText className="w-4 h-4" />, desc: "合约开发部署" },
              { label: "应用子链管理", path: "/blockchain/subchains", icon: <Network className="w-4 h-4" />, desc: "子链创建管理" },
              { label: "系统管理", path: "/blockchain/system", icon: <ShieldCheck className="w-4 h-4" />, desc: "用户、安全、权限" },
              { label: "运维监控", path: "/blockchain/ops", icon: <HardDrive className="w-4 h-4" />, desc: "日志、告警、备份" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors group"
              >
                <span className="text-slate-400 group-hover:text-primary-600">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        fields={alertFields}
        data={dialogData}
        onSubmit={handleDialogSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`告警详情 — ${drawerData?.id || ""}`}
        data={drawerData ? {
          ...drawerData,
          level: getLevelLabel(drawerData.level),
          status: getStatusLabel(drawerData.status),
        } : {}}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (drawerData) openEdit(drawerData);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (drawerData) openDelete(drawerData);
        }}
      />
    </div>
  );
}
