import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [rules, setRules] = useState([
    { id: "AR-001", name: "节点CPU使用率告警", metric: "节点CPU使用率", condition: "> 80%", level: "warning", status: "active", notify: "邮件+短信" },
    { id: "AR-002", name: "节点内存使用率告警", metric: "节点内存使用率", condition: "> 85%", level: "warning", status: "active", notify: "邮件" },
    { id: "AR-003", name: "节点离线告警", metric: "节点状态", condition: "= 离线", level: "critical", status: "active", notify: "邮件+短信+电话" },
    { id: "AR-004", name: "区块高度停滞告警", metric: "区块高度增长", condition: "5分钟无增长", level: "critical", status: "active", notify: "邮件+短信" },
    { id: "AR-005", name: "交易池拥堵告警", metric: "待处理交易数", condition: "> 1000", level: "warning", status: "paused", notify: "邮件" },
    { id: "AR-006", name: "磁盘空间告警", metric: "磁盘使用率", condition: "> 90%", level: "critical", status: "active", notify: "邮件+短信" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="搜索告警规则..." className={cn("w-full pl-9 pr-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Plus className="w-3.5 h-3.5" />
          新建规则
        </button>
      </div>
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
            {rules.map((r) => (
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
                  <button className="text-xs text-primary-600 mr-2">编辑</button>
                  <button className="text-xs text-red-600">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

/* ─── Backup & Recovery ─── */
function BackupRecovery() {
  const [backups, setBackups] = useState([
    { id: "BK-001", name: "每日自动备份", type: "自动", scope: "全量", schedule: "每天 02:00", retention: 30, lastRun: "2025-04-22 02:00:00", status: "success" },
    { id: "BK-002", name: "每周完整备份", type: "自动", scope: "全量", schedule: "每周日 03:00", retention: 12, lastRun: "2025-04-20 03:00:00", status: "success" },
    { id: "BK-003", name: "手动备份-20250421", type: "手动", scope: "增量", schedule: "-", retention: 90, lastRun: "2025-04-21 15:30:00", status: "success" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
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
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500">{bk.scope}</span>
                    <span className="text-[10px] text-slate-400">保留 {bk.retention} 天</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{bk.schedule}</span>
                <span className="text-xs text-slate-500">上次: {bk.lastRun}</span>
                {bk.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                <button className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#273548]">恢复</button>
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

/* ─── Main ─── */
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
                  {[{v:node.cpu,c:node.cpu>70},{v:node.memory,c:node.memory>80},{v:node.disk,c:node.disk>80}].map((m,j)=>(
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

export default function BlockchainOps() {
  const [activeTab, setActiveTab] = useState<"logs" | "alerts" | "audit" | "backup" | "performance" | "monitoring">("monitoring");

  const tabs = [
    { key: "monitoring" as const, label: "实时监控", icon: <Monitor className="w-4 h-4" /> },
    { key: "logs" as const, label: "日志配置", icon: <FileText className="w-4 h-4" /> },
    { key: "alerts" as const, label: "告警规则", icon: <Bell className="w-4 h-4" /> },
    { key: "audit" as const, label: "审计策略", icon: <Activity className="w-4 h-4" /> },
    { key: "backup" as const, label: "备份恢复", icon: <Archive className="w-4 h-4" /> },
    { key: "performance" as const, label: "性能调优", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">运维监控</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">日志配置、告警规则、审计策略、备份恢复、快照归档、性能调优</p>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="flex border-b border-slate-200 dark:border-[#334155]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3 text-sm transition-colors border-b-2",
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
          {activeTab === "alerts" && <AlertRules />}
          {activeTab === "audit" && <AuditPolicy />}
          {activeTab === "backup" && <BackupRecovery />}
          {activeTab === "performance" && <PerformanceTuning />}
        </div>
      </div>
    </div>
  );
}
