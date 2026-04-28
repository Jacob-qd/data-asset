import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Globe,
  Code2,
  BookOpen,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
  Shield,
  Eye,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";

export default function SecretServices() {
  const [apis, setApis] = useState<Record<string, any>[]>([
    { id: "API-001", name: "数据查询接口", method: "POST", path: "/v1/data/query", status: "online", auth: "OAuth2", calls: "12.5万/天", latency: "45ms" },
    { id: "API-002", name: "PSI任务提交", method: "POST", path: "/v1/psi/submit", status: "online", auth: "API Key", calls: "3.2万/天", latency: "120ms" },
    { id: "API-003", name: "任务状态查询", method: "GET", path: "/v1/task/status", status: "online", auth: "OAuth2", calls: "8.7万/天", latency: "25ms" },
    { id: "API-004", name: "结果获取接口", method: "GET", path: "/v1/result/download", status: "degraded", auth: "API Key", calls: "1.8万/天", latency: "350ms" },
    { id: "API-005", name: "模型预测服务", method: "POST", path: "/v1/model/predict", status: "online", auth: "OAuth2", calls: "5.4万/天", latency: "80ms" },
    { id: "API-006", name: "密钥分发接口", method: "POST", path: "/v1/key/distribute", status: "online", auth: "mTLS", calls: "0.8万/天", latency: "60ms" },
    { id: "API-007", name: "审计日志上报", method: "POST", path: "/v1/audit/log", status: "online", auth: "JWT", calls: "2.1万/天", latency: "30ms" },
    { id: "API-008", name: "参与方注册", method: "POST", path: "/v1/party/register", status: "maintenance", auth: "OAuth2", calls: "0.5万/天", latency: "-" },
    { id: "API-009", name: "存证验证", method: "GET", path: "/v1/evidence/verify", status: "online", auth: "HMAC", calls: "1.2万/天", latency: "55ms" },
    { id: "API-010", name: "隐私预算查询", method: "GET", path: "/v1/privacy/budget", status: "online", auth: "API Key", calls: "4.5万/天", latency: "20ms" },
  ]);

  const [dataServices, setDataServices] = useState<Record<string, any>[]>([
    { id: "DS-001", name: "企业信用评分服务", category: "金融数据", version: "v2.1.0", status: "published", consumers: 12, qps: 1200, sla: "99.9%" },
    { id: "DS-002", name: "用户画像标签服务", category: "营销数据", version: "v1.5.2", status: "published", consumers: 8, qps: 800, sla: "99.5%" },
    { id: "DS-003", name: "医疗数据检索服务", category: "医疗数据", version: "v1.0.0", status: "beta", consumers: 3, qps: 200, sla: "99.0%" },
    { id: "DS-004", name: "交通流量分析服务", category: "交通数据", version: "v3.0.1", status: "published", consumers: 6, qps: 600, sla: "99.5%" },
    { id: "DS-005", name: "风险评估模型服务", category: "金融数据", version: "v2.0.0", status: "deprecated", consumers: 2, qps: 50, sla: "95.0%" },
    { id: "DS-006", name: "政务数据融合服务", category: "政务数据", version: "v1.2.0", status: "reviewing", consumers: 5, qps: 400, sla: "99.5%" },
    { id: "DS-007", name: "电商推荐引擎", category: "电商数据", version: "v2.3.1", status: "published", consumers: 15, qps: 2000, sla: "99.9%" },
    { id: "DS-008", name: "保险精算模型", category: "金融数据", version: "v1.0.0", status: "development", consumers: 1, qps: 100, sla: "98.0%" },
    { id: "DS-009", name: "药品追溯查询", category: "医疗数据", version: "v1.1.0", status: "beta", consumers: 4, qps: 300, sla: "99.0%" },
    { id: "DS-010", name: "智慧停车分析", category: "交通数据", version: "v2.0.0", status: "published", consumers: 7, qps: 500, sla: "99.5%" },
  ]);

  const [webhooks, setWebhooks] = useState<Record<string, any>[]>([
    { id: "WH-001", name: "任务完成通知", url: "https://partner-a.com/callback", event: "task.completed", status: "active", lastTrigger: "2024-04-15 10:15:33" },
    { id: "WH-002", name: "异常告警通知", url: "https://alert-sys.com/webhook", event: "task.failed", status: "active", lastTrigger: "2024-04-14 16:35:01" },
    { id: "WH-003", name: "存证确认通知", url: "https://audit-log.com/evidence", event: "evidence.confirmed", status: "inactive", lastTrigger: "-" },
    { id: "WH-004", name: "参与方加入通知", url: "https://partner-b.com/callback", event: "party.joined", status: "active", lastTrigger: "2024-04-13 09:20:15" },
    { id: "WH-005", name: "告警触发通知", url: "https://monitor.com/webhook", event: "alert.triggered", status: "error", lastTrigger: "2024-04-12 14:10:00" },
    { id: "WH-006", name: "密钥过期通知", url: "https://security.com/webhook", event: "key.expired", status: "debugging", lastTrigger: "2024-04-11 08:45:22" },
    { id: "WH-007", name: "任务重试通知", url: "https://retry.com/callback", event: "task.failed", status: "active", lastTrigger: "2024-04-10 11:30:00" },
    { id: "WH-008", name: "存证链上确认", url: "https://blockchain.com/evidence", event: "evidence.confirmed", status: "active", lastTrigger: "2024-04-09 16:00:00" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("apis");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogType, setDialogType] = useState<"api" | "service" | "webhook">("api");
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"api" | "service" | "webhook">("api");

  const apiFields: FieldConfig[] = [
    { key: "name", label: "名称", type: "text", required: true },
    { key: "method", label: "方法", type: "select", options: [
      { label: "GET", value: "GET" },
      { label: "POST", value: "POST" },
      { label: "PUT", value: "PUT" },
      { label: "DELETE", value: "DELETE" },
      { label: "PATCH", value: "PATCH" },
    ], required: true },
    { key: "path", label: "路径", type: "text", required: true },
    { key: "auth", label: "认证方式", type: "select", options: [
      { label: "OAuth2", value: "OAuth2" },
      { label: "API Key", value: "API Key" },
      { label: "JWT", value: "JWT" },
      { label: "mTLS", value: "mTLS" },
      { label: "HMAC", value: "HMAC" },
    ], required: true },
    { key: "calls", label: "日调用量", type: "text" },
    { key: "latency", label: "平均延迟", type: "text" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "在线", value: "online" },
      { label: "降级", value: "degraded" },
      { label: "维护中", value: "maintenance" },
      { label: "离线", value: "offline" },
    ] },
  ];

  const serviceFields: FieldConfig[] = [
    { key: "name", label: "服务名称", type: "text", required: true },
    { key: "category", label: "分类", type: "select", required: true, options: [
      { label: "金融数据", value: "金融数据" },
      { label: "营销数据", value: "营销数据" },
      { label: "医疗数据", value: "医疗数据" },
      { label: "交通数据", value: "交通数据" },
      { label: "政务数据", value: "政务数据" },
      { label: "电商数据", value: "电商数据" },
    ]},
    { key: "version", label: "版本", type: "text", required: true },
    { key: "consumers", label: "消费者数量", type: "number", required: true },
    { key: "qps", label: "QPS", type: "number", required: true },
    { key: "sla", label: "SLA", type: "text" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "已发布", value: "published" },
      { label: "内测", value: "beta" },
      { label: "已下线", value: "deprecated" },
      { label: "开发中", value: "development" },
      { label: "审核中", value: "reviewing" },
    ]},
  ];

  const webhookFields: FieldConfig[] = [
    { key: "name", label: "名称", type: "text", required: true },
    { key: "url", label: "回调URL", type: "text", required: true },
    { key: "event", label: "事件类型", type: "select", required: true, options: [
      { label: "task.completed", value: "task.completed" },
      { label: "task.failed", value: "task.failed" },
      { label: "evidence.confirmed", value: "evidence.confirmed" },
      { label: "party.joined", value: "party.joined" },
      { label: "alert.triggered", value: "alert.triggered" },
      { label: "key.expired", value: "key.expired" },
    ]},
    { key: "status", label: "状态", type: "select", options: [
      { label: "启用", value: "active" },
      { label: "禁用", value: "inactive" },
      { label: "调试中", value: "debugging" },
      { label: "异常", value: "error" },
    ]},
    { key: "lastTrigger", label: "上次触发", type: "text" },
  ];

  const getDialogFields = (): FieldConfig[] => {
    if (dialogType === "api") return apiFields;
    if (dialogType === "service") return serviceFields;
    return webhookFields;
  };

  const getDialogTitle = () => {
    if (dialogType === "api") return "API服务";
    if (dialogType === "service") return "数据服务";
    return "Webhook";
  };

  const handleOpenCreate = () => {
    const type = activeTab === "apis" ? "api" : activeTab === "services" ? "service" : "webhook";
    setDialogType(type);
    setDialogMode("create");
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (type: "api" | "service" | "webhook", item: Record<string, any>) => {
    setDialogType(type);
    setDialogMode("edit");
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleOpenDelete = (type: "api" | "service" | "webhook", item: Record<string, any>) => {
    setDialogType(type);
    setDialogMode("delete");
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleOpenView = (type: "api" | "service" | "webhook", item: Record<string, any>) => {
    setDrawerType(type);
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newItem = { ...data, id: Date.now().toString(36).toUpperCase() };
      if (dialogType === "api") setApis([...apis, newItem]);
      else if (dialogType === "service") setDataServices([...dataServices, newItem]);
      else if (dialogType === "webhook") setWebhooks([...webhooks, newItem]);
    } else if (dialogMode === "edit" && selectedItem) {
      if (dialogType === "api") setApis(apis.map(a => a.id === selectedItem.id ? { ...selectedItem, ...data } : a));
      else if (dialogType === "service") setDataServices(dataServices.map(s => s.id === selectedItem.id ? { ...selectedItem, ...data } : s));
      else if (dialogType === "webhook") setWebhooks(webhooks.map(w => w.id === selectedItem.id ? { ...selectedItem, ...data } : w));
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (dialogType === "api") setApis(apis.filter(a => a.id !== selectedItem.id));
    else if (dialogType === "service") setDataServices(dataServices.filter(s => s.id !== selectedItem.id));
    else if (dialogType === "webhook") setWebhooks(webhooks.filter(w => w.id !== selectedItem.id));
  };

  const handleDrawerEdit = () => {
    setDrawerOpen(false);
    handleOpenEdit(drawerType, selectedItem!);
  };

  const handleDrawerDelete = () => {
    setDrawerOpen(false);
    if (!selectedItem) return;
    if (drawerType === "api") setApis(apis.filter(a => a.id !== selectedItem.id));
    else if (drawerType === "service") setDataServices(dataServices.filter(s => s.id !== selectedItem.id));
    else if (drawerType === "webhook") setWebhooks(webhooks.filter(w => w.id !== selectedItem.id));
  };

  const getDrawerTitle = () => {
    if (drawerType === "api") return "API服务详情";
    if (drawerType === "service") return "数据服务详情";
    return "Webhook详情";
  };

  const getDrawerFields = () => {
    if (drawerType === "api") return [
      { key: "id", label: "API ID" },
      { key: "name", label: "名称" },
      { key: "method", label: "方法", type: "badge" as const },
      { key: "path", label: "路径" },
      { key: "auth", label: "认证方式", type: "badge" as const },
      { key: "calls", label: "日调用量" },
      { key: "latency", label: "平均延迟" },
      { key: "status", label: "状态", type: "badge" as const },
    ];
    if (drawerType === "service") return [
      { key: "id", label: "服务ID" },
      { key: "name", label: "服务名称" },
      { key: "category", label: "分类", type: "badge" as const },
      { key: "version", label: "版本" },
      { key: "consumers", label: "消费者" },
      { key: "qps", label: "QPS" },
      { key: "sla", label: "SLA" },
      { key: "status", label: "状态", type: "badge" as const },
    ];
    return [
      { key: "id", label: "ID" },
      { key: "name", label: "名称" },
      { key: "url", label: "回调URL" },
      { key: "event", label: "事件类型", type: "badge" as const },
      { key: "status", label: "状态", type: "badge" as const },
      { key: "lastTrigger", label: "上次触发" },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">服务管理</h1>
          <p className="text-sm text-gray-500 mt-1">API接口、数据服务与Webhook管理</p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" />
          新建服务
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{apis.length}</div>
              <div className="text-xs text-gray-500">API接口</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{dataServices.length}</div>
              <div className="text-xs text-gray-500">数据服务</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">31.6万</div>
              <div className="text-xs text-gray-500">日均调用量</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">99.7%</div>
              <div className="text-xs text-gray-500">服务可用性</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索服务、API或Webhook..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Tabs defaultValue="apis" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="apis" className="gap-2"><Code2 className="w-4 h-4" />API接口</TabsTrigger>
          <TabsTrigger value="services" className="gap-2"><Globe className="w-4 h-4" />数据服务</TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2"><Activity className="w-4 h-4" />Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="apis">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">API接口列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>方法</TableHead>
                    <TableHead>路径</TableHead>
                    <TableHead>认证方式</TableHead>
                    <TableHead>日调用量</TableHead>
                    <TableHead>平均延迟</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apis.filter(a => a.name.includes(searchQuery) || a.path.includes(searchQuery)).map((api) => (
                    <TableRow key={api.id}>
                      <TableCell className="font-mono text-xs">{api.id}</TableCell>
                      <TableCell className="font-medium">{api.name}</TableCell>
                      <TableCell><Badge className={api.method === "GET" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>{api.method}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{api.path}</TableCell>
                      <TableCell>{api.auth}</TableCell>
                      <TableCell>{api.calls}</TableCell>
                      <TableCell>{api.latency}</TableCell>
                      <TableCell>
                        {api.status === "online" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />在线</Badge> :
                         <Badge className="bg-amber-50 text-amber-700 gap-1"><AlertTriangle className="w-3 h-3" />降级</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenView("api", api)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit("api", api)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDelete("api", api)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数据服务目录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>服务ID</TableHead>
                    <TableHead>服务名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>消费者</TableHead>
                    <TableHead>QPS</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataServices.filter(s => s.name.includes(searchQuery)).map((svc) => (
                    <TableRow key={svc.id}>
                      <TableCell className="font-mono text-xs">{svc.id}</TableCell>
                      <TableCell className="font-medium">{svc.name}</TableCell>
                      <TableCell><Badge variant="outline">{svc.category}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{svc.version}</TableCell>
                      <TableCell>{svc.consumers}个</TableCell>
                      <TableCell>{svc.qps}</TableCell>
                      <TableCell>{svc.sla}</TableCell>
                      <TableCell>
                        {svc.status === "published" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已发布</Badge> :
                         svc.status === "beta" ? <Badge className="bg-blue-50 text-blue-700 gap-1"><Clock className="w-3 h-3" />内测</Badge> :
                         <Badge className="bg-gray-50 text-gray-700">已下线</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenView("service", svc)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit("service", svc)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDelete("service", svc)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Webhook配置</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>回调URL</TableHead>
                    <TableHead>事件类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>上次触发</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.filter(w => w.name.includes(searchQuery)).map((wh) => (
                    <TableRow key={wh.id}>
                      <TableCell className="font-mono text-xs">{wh.id}</TableCell>
                      <TableCell className="font-medium">{wh.name}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">{wh.url}</TableCell>
                      <TableCell><Badge variant="outline">{wh.event}</Badge></TableCell>
                      <TableCell>
                        {wh.status === "active" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />启用</Badge> :
                         <Badge className="bg-gray-50 text-gray-700">禁用</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{wh.lastTrigger}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenView("webhook", wh)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit("webhook", wh)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDelete("webhook", wh)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        key={`${dialogType}-${dialogMode}-${selectedItem?.id || "new"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? (selectedItem?.name || "") : getDialogTitle()}
        fields={getDialogFields()}
        data={selectedItem || undefined}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={getDrawerTitle()}
        data={selectedItem || {}}
        fields={getDrawerFields()}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
      />
    </div>
  );
}
