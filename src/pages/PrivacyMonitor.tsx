import { useState, useRef, useEffect } from "react";
import { Activity, Bell, Search, Plus, Server, Cpu, HardDrive, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";

const nodes = [
  { name: "Node-A", status: "online", cpu: 45, memory: 62, disk: 30, network: 120 },
  { name: "Node-B", status: "online", cpu: 32, memory: 48, disk: 55, network: 85 },
  { name: "Node-C", status: "warning", cpu: 78, memory: 85, disk: 40, network: 200 },
  { name: "Node-D", status: "online", cpu: 25, memory: 35, disk: 60, network: 60 },
  { name: "Node-E", status: "offline", cpu: 0, memory: 0, disk: 0, network: 0 },
  { name: "Node-F", status: "online", cpu: 55, memory: 58, disk: 45, network: 150 },
];

const alerts = [
  { id: "ALT-001", name: "CPU使用率超过80%", severity: "critical", metric: "CPU", threshold: "80%", triggered: "2026-04-21 10:00", status: "active" },
  { id: "ALT-002", name: "任务执行失败率过高", severity: "warning", metric: "task_failure", threshold: "5%", triggered: "2026-04-21 09:30", status: "active" },
  { id: "ALT-003", name: "网络延迟超过阈值", severity: "warning", metric: "latency", threshold: "100ms", triggered: "2026-04-21 08:00", status: "resolved" },
  { id: "ALT-004", name: "内存使用率超过85%", severity: "critical", metric: "memory", threshold: "85%", triggered: "2026-04-20 22:00", status: "active" },
  { id: "ALT-005", name: "节点离线", severity: "critical", metric: "node_status", threshold: "-", triggered: "2026-04-20 20:00", status: "active" },
  { id: "ALT-006", name: "磁盘空间不足", severity: "info", metric: "disk", threshold: "90%", triggered: "2026-04-20 18:00", status: "resolved" },
];

const alertRules = [
  { id: "R-001", name: "CPU高负载告警", metric: "CPU使用率", comparison: ">", threshold: "80%", severity: "critical", channel: "邮件+短信", status: "active" },
  { id: "R-002", name: "内存不足告警", metric: "内存使用率", comparison: ">", threshold: "85%", severity: "critical", channel: "邮件", status: "active" },
  { id: "R-003", name: "任务失败率告警", metric: "任务失败率", comparison: ">", threshold: "5%", severity: "warning", channel: "Webhook", status: "active" },
  { id: "R-004", name: "网络延迟告警", metric: "网络延迟", comparison: ">", threshold: "100ms", severity: "warning", channel: "邮件", status: "inactive" },
  { id: "R-005", name: "节点离线告警", metric: "节点状态", comparison: "=", threshold: "offline", severity: "critical", channel: "邮件+短信+Webhook", status: "active" },
];

export default function PrivacyMonitor() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "rules" | "history">("dashboard");
  const [showDrawer, setShowDrawer] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && activeTab === "dashboard") {
      const c = echarts.init(chartRef.current);
      c.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["CPU", "内存"], bottom: 0 },
        grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"] },
        yAxis: { type: "value", name: "%" },
        series: [
          { name: "CPU", type: "line", data: [25, 30, 55, 70, 45, 35], smooth: true, itemStyle: { color: "#3B82F6" } },
          { name: "内存", type: "line", data: [40, 45, 60, 80, 55, 48], smooth: true, itemStyle: { color: "#8B5CF6" } },
        ],
      });
      return () => c.dispose();
    }
  }, [activeTab]);

  const alertCols = [
    { key: "id", title: "ID", cell: (a: typeof alerts[0]) => <span className="font-mono text-xs text-slate-500">{a.id}</span> },
    { key: "name", title: "告警名称", cell: (a: typeof alerts[0]) => <span className="font-medium text-slate-800">{a.name}</span> },
    { key: "severity", title: "级别", cell: (a: typeof alerts[0]) => <Badge className={cn("text-xs", a.severity === "critical" ? "bg-red-500/10 text-red-600" : a.severity === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600")}>{a.severity === "critical" ? "紧急" : a.severity === "warning" ? "警告" : "信息"}</Badge> },
    { key: "metric", title: "指标", cell: (a: typeof alerts[0]) => <span className="text-xs text-slate-500">{a.metric}</span> },
    { key: "triggered", title: "触发时间", cell: (a: typeof alerts[0]) => <span className="text-xs text-slate-500">{a.triggered}</span> },
    { key: "status", title: "状态", cell: (a: typeof alerts[0]) => <StatusTag status={a.status === "active" ? "danger" : "success"} text={a.status === "active" ? "未恢复" : "已恢复"} /> },
  ];

  const ruleCols = [
    { key: "id", title: "ID", cell: (r: typeof alertRules[0]) => <span className="font-mono text-xs text-slate-500">{r.id}</span> },
    { key: "name", title: "规则名称", cell: (r: typeof alertRules[0]) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: "metric", title: "指标", cell: (r: typeof alertRules[0]) => <span className="text-xs text-slate-500">{r.metric}</span> },
    { key: "condition", title: "条件", cell: (r: typeof alertRules[0]) => <span className="font-mono text-xs text-gray-500">{r.comparison} {r.threshold}</span> },
    { key: "severity", title: "级别", cell: (r: typeof alertRules[0]) => <Badge className={cn("text-xs", r.severity === "critical" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600")}>{r.severity === "critical" ? "紧急" : "警告"}</Badge> },
    { key: "channel", title: "通知渠道", cell: (r: typeof alertRules[0]) => <span className="text-xs text-slate-500">{r.channel}</span> },
    { key: "status", title: "状态", cell: (r: typeof alertRules[0]) => <StatusTag status={r.status === "active" ? "success" : "info"} text={r.status === "active" ? "启用" : "停用"} /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">执行任务</span><Activity className="w-5 h-5 text-blue-500" /></div><div className="text-2xl font-bold text-slate-800 mt-2">12</div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">今日告警</span><Bell className="w-5 h-5 text-red-500" /></div><div className="text-2xl font-bold text-slate-800 mt-2">5</div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">健康评分</span><Server className="w-5 h-5 text-emerald-500" /></div><div className="text-2xl font-bold text-slate-800 mt-2">82</div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">网络延迟</span><Wifi className="w-5 h-5 text-purple-500" /></div><div className="text-2xl font-bold text-slate-800 mt-2">45ms</div></div>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"dashboard",l:"监控Dashboard"},{k:"rules",l:"告警规则"},{k:"history",l:"告警历史"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "dashboard" && <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">资源利用率趋势</h3></div>
          <div ref={chartRef} style={{ height: 300 }} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {nodes.filter((n) => n.status !== "offline").map((n) => (
            <div key={n.name} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Server className="w-4 h-4 text-slate-500" /><span className="font-medium text-slate-800">{n.name}</span></div>
                <span className={cn("w-2 h-2 rounded-full", n.status === "online" ? "bg-emerald-500" : "bg-amber-500")} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">CPU</span><span className="text-slate-700">{n.cpu}%</span></div>
                <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${n.cpu}%` }} /></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">内存</span><span className="text-slate-700">{n.memory}%</span></div>
                <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${n.memory}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b"><h3 className="text-sm font-semibold text-slate-700">活跃告警</h3></div>
          <DataTable rowKey={(r: any) => r.id} columns={alertCols} data={alerts.filter((a) => a.status === "active")} />
        </div>
      </div>}

      {activeTab === "rules" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索规则" className="pl-9 w-64" /></div>
          <Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />新建规则</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={ruleCols} data={alertRules} /></div>
        <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建告警规则" size="lg">
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700">规则名称</label><Input placeholder="如: CPU高负载告警" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">监控指标</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>CPU使用率</option><option>内存使用率</option><option>任务失败率</option><option>网络延迟</option><option>节点状态</option></select></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">比较</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>&gt;</option><option>&lt;</option><option>=</option></select></div><div><label className="text-sm font-medium text-slate-700">阈值</label><Input placeholder="80%" className="mt-1" /></div></div>
            <div><label className="text-sm font-medium text-slate-700">告警级别</label><div className="flex gap-3 mt-2"><label className="flex items-center gap-2"><input type="radio" name="sev" defaultChecked />紧急</label><label className="flex items-center gap-2"><input type="radio" name="sev" />警告</label><label className="flex items-center gap-2"><input type="radio" name="sev" />信息</label></div></div>
            <div><label className="text-sm font-medium text-slate-700">通知渠道</label><div className="flex gap-3 mt-2"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked />邮件</label><label className="flex items-center gap-2"><input type="checkbox" />短信</label><label className="flex items-center gap-2"><input type="checkbox" />Webhook</label></div></div>
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>保存</Button></div>
          </div>
        </Drawer>
      </div>}

      {activeTab === "history" && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-700">告警历史</h3><div className="flex gap-2"><select className="h-8 px-2 rounded border border-slate-200 text-xs"><option>全部级别</option><option>紧急</option><option>警告</option></select><select className="h-8 px-2 rounded border border-slate-200 text-xs"><option>全部状态</option><option>已恢复</option><option>未恢复</option></select></div></div>
        <DataTable rowKey={(r: any) => r.id} columns={alertCols} data={alerts} />
      </div>}
    </div>
  );
}
