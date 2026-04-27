import { useState } from "react";
import { Activity, Plus, Search, Globe, Zap, ServerOff, GitBranch, Eye, ToggleLeft, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import { cn } from "@/lib/utils";

const services = [
  { id: "SVC-001", name: "MPC联合计算服务", type: "API", version: "2.1.0", status: "online", qos: { latency: "<50ms", throughput: "1000TPS", availability: "99.9%" }, rateLimit: "10000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-002", name: "HE加密计算服务", type: "Stream", version: "1.5.0", status: "online", qos: { latency: "<100ms", throughput: "500TPS", availability: "99.5%" }, rateLimit: "5000/h", circuitBreaker: "closed", deploy: "canary" },
  { id: "SVC-003", name: "ZKP验证服务", type: "API", version: "3.0.0", status: "online", qos: { latency: "<30ms", throughput: "2000TPS", availability: "99.99%" }, rateLimit: "20000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-004", name: "TEE安全推理服务", type: "Batch", version: "2.0.0", status: "deploying", qos: { latency: "<200ms", throughput: "100TPS", availability: "99.0%" }, rateLimit: "2000/h", circuitBreaker: "closed", deploy: "gray" },
  { id: "SVC-005", name: "联邦学习训练服务", type: "Stream", version: "4.0.0", status: "online", qos: { latency: "<500ms", throughput: "50TPS", availability: "99.5%" }, rateLimit: "1000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-006", name: "隐私求交服务", type: "API", version: "2.2.0", status: "offline", qos: { latency: "-", throughput: "-", availability: "0%" }, rateLimit: "-", circuitBreaker: "open", deploy: "blue-green" },
  { id: "SVC-007", name: "隐匿查询服务", type: "API", version: "1.8.0", status: "online", qos: { latency: "<80ms", throughput: "800TPS", availability: "99.9%" }, rateLimit: "8000/h", circuitBreaker: "closed", deploy: "canary" },
  { id: "SVC-008", name: "联合统计服务", type: "Batch", version: "3.1.0", status: "online", qos: { latency: "<300ms", throughput: "200TPS", availability: "99.5%" }, rateLimit: "3000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-009", name: "密钥管理服务", type: "API", version: "5.0.0", status: "online", qos: { latency: "<20ms", throughput: "5000TPS", availability: "99.99%" }, rateLimit: "50000/h", circuitBreaker: "closed", deploy: "blue-green" },
  { id: "SVC-010", name: "结果验证服务", type: "API", version: "2.0.0", status: "online", qos: { latency: "<40ms", throughput: "1500TPS", availability: "99.9%" }, rateLimit: "15000/h", circuitBreaker: "closed", deploy: "gray" },
];

export default function PrivacyServices() {
  const [activeTab, setActiveTab] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const filtered = services.filter((s) => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "all" || s.type === typeFilter;
    return ms && mt;
  });

  const stats = [
    { label: "服务总数", value: services.length, icon: Activity, color: "text-blue-500" },
    { label: "在线", value: services.filter((s) => s.status === "online").length, icon: Globe, color: "text-emerald-500" },
    { label: "总调用", value: "98.5K", icon: Zap, color: "text-amber-500" },
  ];

  const columns = [
    { key: "id", title: "ID", cell: (s: typeof services[0]) => <span className="font-mono text-xs text-slate-500">{s.id}</span> },
    { key: "name", title: "服务名称", cell: (s: typeof services[0]) => <span className="font-medium text-slate-800">{s.name}</span> },
    { key: "type", title: "类型", cell: (s: typeof services[0]) => <Badge variant="outline" className="text-xs">{s.type}</Badge> },
    { key: "version", title: "版本", cell: (s: typeof services[0]) => <Badge className="font-mono text-xs bg-slate-100 text-slate-600">{s.version}</Badge> },
    { key: "status", title: "状态", cell: (s: typeof services[0]) => <StatusTag status={s.status === "online" ? "success" : s.status === "deploying" ? "warning" : "danger"} text={s.status === "online" ? "在线" : s.status === "deploying" ? "部署中" : "离线"} /> },
    { key: "qos", title: "QoS", cell: (s: typeof services[0]) => <div className="text-xs text-slate-500"><div>延迟: {s.qos.latency}</div><div>吞吐: {s.qos.throughput}</div></div> },
    { key: "circuit", title: "熔断器", cell: (s: typeof services[0]) => <Badge className={cn("text-xs", s.circuitBreaker === "closed" ? "bg-emerald-500/10 text-emerald-600" : s.circuitBreaker === "open" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600")}>{s.circuitBreaker === "closed" ? "关闭" : s.circuitBreaker === "open" ? "开启" : "半开"}</Badge> },
    { key: "deploy", title: "部署策略", cell: (s: typeof services[0]) => <Badge variant="outline" className="text-xs">{s.deploy === "blue-green" ? "蓝绿" : s.deploy === "canary" ? "金丝雀" : "灰度"}</Badge> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索服务" className="pl-9 w-64" /></div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option value="all">全部</option><option>API</option><option>Stream</option><option>Batch</option></select>
        </div>
        <Button onClick={() => { setShowDrawer(true); setWizardStep(1); }} className="gap-2"><Plus className="w-4 h-4" />新建服务</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>

      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建服务" size="lg">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2"><div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold", wizardStep >= s ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-400")}>{s}</div><span className={cn("text-xs", wizardStep >= s ? "text-slate-800" : "text-slate-400")}>{s === 1 ? "基本信息" : s === 2 ? "接口配置" : s === 3 ? "治理策略" : "部署"}</span>{s < 4 && <div className="w-4 h-px bg-slate-200" />}</div>
            ))}
          </div>

          {wizardStep === 1 && <div className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700">服务名称</label><Input placeholder="输入服务名称" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">服务类型</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>API</option><option>Stream</option><option>Batch</option></select></div>
            <div><label className="text-sm font-medium text-slate-700">描述</label><textarea placeholder="服务描述" className="mt-1 w-full h-16 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" /></div>
          </div>}

          {wizardStep === 2 && <div className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700">端点路径</label><Input placeholder="/api/v1/service" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">请求Schema</label><div className="mt-1 bg-[#0F172A] rounded-lg p-3 font-mono text-xs text-slate-300 min-h-[100px]">{`{\n  "param1": "string",\n  "param2": "number"\n}`}</div></div>
            <div><label className="text-sm font-medium text-slate-700">认证方式</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>Token</option><option>OAuth</option><option>mTLS</option></select></div>
          </div>}

          {wizardStep === 3 && <div className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700">限流 (QPS)</label><Input placeholder="1000" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">熔断阈值</label><Input placeholder="5次错误/60秒" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">超时 (ms)</label><Input placeholder="5000" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">重试次数</label><Input placeholder="3" className="mt-1" /></div>
          </div>}

          {wizardStep === 4 && <div className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700">部署策略</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[{k:"blue-green",l:"蓝绿部署"},{k:"canary",l:"金丝雀"},{k:"gray",l:"灰度发布"}].map((d) => (
                  <div key={d.k} className="p-3 border rounded-lg hover:border-primary-500 cursor-pointer text-center"><div className="font-medium">{d.l}</div></div>
                ))}
              </div>
            </div>
            <div><label className="text-sm font-medium text-slate-700">灰度比例</label><Input type="range" className="mt-1" defaultValue={10} /></div>
          </div>}

          <div className="flex justify-between pt-4 border-t">
            {wizardStep > 1 ? <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>上一步</Button> : <div />}
            {wizardStep < 4 ? <Button onClick={() => setWizardStep(wizardStep + 1)}>下一步</Button> : <Button onClick={() => setShowDrawer(false)}>创建服务</Button>}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
