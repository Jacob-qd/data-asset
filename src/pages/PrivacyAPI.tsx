import { useState } from "react";
import { Network, Plus, Search, Globe, Code, Webhook, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import Drawer from "@/components/Drawer";
import { cn } from "@/lib/utils";

const apis = [
  { id: "API-001", name: "任务创建", method: "POST", path: "/api/v1/tasks", version: "v1", status: "active", auth: "Token", rateLimit: "1000/h", calls: 52300 },
  { id: "API-002", name: "任务查询", method: "GET", path: "/api/v1/tasks/:id", version: "v1", status: "active", auth: "Token", rateLimit: "5000/h", calls: 128000 },
  { id: "API-003", name: "结果获取", method: "GET", path: "/api/v1/tasks/:id/result", version: "v1", status: "active", auth: "OAuth", rateLimit: "1000/h", calls: 45600 },
  { id: "API-004", name: "参与方注册", method: "POST", path: "/api/v1/parties", version: "v1", status: "active", auth: "mTLS", rateLimit: "100/h", calls: 890 },
  { id: "API-005", name: "数据上传", method: "POST", path: "/api/v1/data/upload", version: "v1", status: "active", auth: "Token", rateLimit: "500/h", calls: 12300 },
  { id: "API-006", name: "模型发布", method: "POST", path: "/api/v1/models/:id/publish", version: "v1", status: "active", auth: "OAuth", rateLimit: "50/h", calls: 450 },
  { id: "API-007", name: "监控指标", method: "GET", path: "/api/v1/metrics", version: "v2", status: "active", auth: "Token", rateLimit: "10000/h", calls: 256000 },
  { id: "API-008", name: "日志查询", method: "GET", path: "/api/v1/audit/logs", version: "v1", status: "active", auth: "OAuth", rateLimit: "2000/h", calls: 67800 },
  { id: "API-009", name: "密钥交换", method: "POST", path: "/api/v1/crypto/keyexchange", version: "v1", status: "active", auth: "mTLS", rateLimit: "500/h", calls: 5600 },
  { id: "API-010", name: "结果验证", method: "POST", path: "/api/v1/verify", version: "v2", status: "active", auth: "Token", rateLimit: "2000/h", calls: 34500 },
  { id: "API-011", name: "批处理", method: "POST", path: "/api/v1/batch", version: "v1", status: "inactive", auth: "Token", rateLimit: "100/h", calls: 1200 },
  { id: "API-012", name: "实时流", method: "WS", path: "/api/v1/stream", version: "v1", status: "active", auth: "Token", rateLimit: "∞", calls: 89000 },
];

const sdks = [
  { language: "Python", version: "2.3.1", downloads: 45200, install: "pip install privacy-sdk", docs: "/docs/python" },
  { language: "Java", version: "1.8.5", downloads: 28500, install: "<dependency>privacy-sdk</dependency>", docs: "/docs/java" },
  { language: "Go", version: "1.2.0", downloads: 12300, install: "go get privacy-sdk", docs: "/docs/go" },
  { language: "Node.js", version: "3.0.2", downloads: 18900, install: "npm install privacy-sdk", docs: "/docs/nodejs" },
];

const webhooks = [
  { id: "WH-001", name: "任务完成通知", url: "https://example.com/webhook/task", events: "task_complete", status: "active", secret: "sk_****1234", lastDelivery: "2026-04-21 10:30:00" },
  { id: "WH-002", name: "告警通知", url: "https://example.com/webhook/alert", events: "alert", status: "active", secret: "sk_****5678", lastDelivery: "2026-04-21 09:00:00" },
  { id: "WH-003", name: "节点状态", url: "https://example.com/webhook/node", events: "node_status", status: "inactive", secret: "sk_****9012", lastDelivery: "2026-04-20 18:00:00" },
];

export default function PrivacyAPI() {
  const [activeTab, setActiveTab] = useState<"api" | "sdk" | "webhook" | "stats">("api");
  const [showDrawer, setShowDrawer] = useState(false);

  const stats = [
    { label: "API总数", value: apis.length, icon: Network, color: "text-blue-500" },
    { label: "活跃", value: apis.filter((a) => a.status === "active").length, icon: Globe, color: "text-emerald-500" },
    { label: "今日调用", value: "12.8K", icon: Code, color: "text-purple-500" },
    { label: "平均延迟", value: "45ms", icon: Network, color: "text-amber-500" },
  ];

  const apiCols = [
    { key: "id", title: "ID", cell: (a: typeof apis[0]) => <span className="font-mono text-xs text-slate-500">{a.id}</span> },
    { key: "name", title: "名称", cell: (a: typeof apis[0]) => <span className="font-medium text-slate-800">{a.name}</span> },
    { key: "method", title: "方法", cell: (a: typeof apis[0]) => <Badge className={cn("text-xs", a.method === "GET" ? "bg-blue-500/10 text-blue-600" : a.method === "POST" ? "bg-emerald-500/10 text-emerald-600" : a.method === "WS" ? "bg-purple-500/10 text-purple-600" : "bg-amber-500/10 text-amber-600")}>{a.method}</Badge> },
    { key: "path", title: "路径", cell: (a: typeof apis[0]) => <span className="font-mono text-xs text-slate-600">{a.path}</span> },
    { key: "version", title: "版本", cell: (a: typeof apis[0]) => <Badge variant="outline" className="text-xs">{a.version}</Badge> },
    { key: "auth", title: "认证", cell: (a: typeof apis[0]) => <Badge variant="outline" className="text-xs">{a.auth}</Badge> },
    { key: "rate", title: "限流", cell: (a: typeof apis[0]) => <span className="text-xs text-slate-500">{a.rateLimit}</span> },
    { key: "calls", title: "调用量", cell: (a: typeof apis[0]) => <span className="text-xs text-slate-500">{a.calls.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"api",l:"API列表"},{k:"sdk",l:"SDK"},{k:"webhook",l:"Webhook"},{k:"stats",l:"调用统计"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "api" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索API" className="pl-9 w-64" /></div>
          <Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />新建API</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={apiCols} data={apis} /></div>
      </div>}

      {activeTab === "sdk" && <div className="grid grid-cols-2 gap-4">
        {sdks.map((s) => (
          <div key={s.language} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-slate-800">{s.language}</h3><Badge variant="outline">v{s.version}</Badge></div>
            <div className="text-xs text-slate-500 mb-2">下载量: {s.downloads.toLocaleString()}</div>
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 mb-3">{s.install}</div>
            <Button variant="outline" size="sm" className="gap-1"><BookOpen className="w-3.5 h-3.5" />文档</Button>
          </div>
        ))}
      </div>}

      {activeTab === "webhook" && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">名称</th><th className="text-left py-3 px-4 text-slate-500 font-medium">URL</th><th className="text-left py-3 px-4 text-slate-500 font-medium">事件类型</th><th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th><th className="text-left py-3 px-4 text-slate-500 font-medium">最后推送</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{webhooks.map((w) => (
            <tr key={w.id} className="hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{w.name}</td><td className="py-3 px-4 font-mono text-xs text-slate-500">{w.url}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{w.events}</Badge></td><td className="py-3 px-4"><Badge className={cn("text-xs", w.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500")}>{w.status === "active" ? "启用" : "停用"}</Badge></td><td className="py-3 px-4 text-xs text-slate-500">{w.lastDelivery}</td></tr>
          ))}</tbody>
        </table>
      </div>}

      {activeTab === "stats" && <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">API调用趋势</h3><div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">调用趋势图表</div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">Top API</h3><div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">TOP排行图表</div></div>
      </div>}

      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建API" size="lg">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-slate-700">API名称</label><Input placeholder="如: 任务创建" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">方法</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select></div><div><label className="text-sm font-medium text-slate-700">版本</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>v1</option><option>v2</option></select></div></div>
          <div><label className="text-sm font-medium text-slate-700">路径</label><Input placeholder="/api/v1/tasks" className="mt-1" /></div>
          <div><label className="text-sm font-medium text-slate-700">认证方式</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>Token</option><option>OAuth</option><option>mTLS</option></select></div>
          <div><label className="text-sm font-medium text-slate-700">限流</label><Input placeholder="1000/h" className="mt-1" /></div>
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>创建</Button></div>
        </div>
      </Drawer>
    </div>
  );
}
