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

const recentAlerts = [
  { id: "ALT-001", level: "warning", content: "状态数据库内存使用率超过80%", time: "2025-04-22 14:30:00", status: "unhandled" },
  { id: "ALT-002", level: "info", content: "节点node-04网络延迟升高至45ms", time: "2025-04-22 13:15:00", status: "handled" },
  { id: "ALT-003", level: "critical", content: "存储节点-03离线超过10分钟", time: "2025-04-22 12:48:00", status: "handled" },
  { id: "ALT-004", level: "info", content: "智能合约DataSharing完成升级", time: "2025-04-22 11:20:00", status: "handled" },
  { id: "ALT-005", level: "warning", content: "交易池待处理交易数超过阈值", time: "2025-04-22 10:05:00", status: "handled" },
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

/* ─── Component ─── */
export default function BlockchainOverview() {
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
            <Link to="/blockchain/ops" className="text-[10px] text-primary-600 flex items-center gap-0.5">
              告警管理 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-4 pb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#334155]">
                  <th className="text-left py-2 font-medium">级别</th>
                  <th className="text-left py-2 font-medium">内容</th>
                  <th className="text-left py-2 font-medium">时间</th>
                  <th className="text-center py-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 dark:border-[#334155] last:border-0">
                    <td className="py-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px]",
                        a.level === "critical" ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        a.level === "warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {a.level === "critical" ? "严重" : a.level === "warning" ? "警告" : "信息"}
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
    </div>
  );
}
