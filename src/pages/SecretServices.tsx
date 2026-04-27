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
} from "lucide-react";

const apis = [
  { id: "API-001", name: "数据查询接口", method: "POST", path: "/v1/data/query", status: "online", auth: "OAuth2", calls: "12.5万/天", latency: "45ms" },
  { id: "API-002", name: "PSI任务提交", method: "POST", path: "/v1/psi/submit", status: "online", auth: "API Key", calls: "3.2万/天", latency: "120ms" },
  { id: "API-003", name: "任务状态查询", method: "GET", path: "/v1/task/status", status: "online", auth: "OAuth2", calls: "8.7万/天", latency: "25ms" },
  { id: "API-004", name: "结果获取接口", method: "GET", path: "/v1/result/download", status: "degraded", auth: "API Key", calls: "1.8万/天", latency: "350ms" },
  { id: "API-005", name: "模型预测服务", method: "POST", path: "/v1/model/predict", status: "online", auth: "OAuth2", calls: "5.4万/天", latency: "80ms" },
];

const dataServices = [
  { id: "DS-001", name: "企业信用评分服务", category: "金融数据", version: "v2.1.0", status: "published", consumers: 12, qps: 1200, sla: "99.9%" },
  { id: "DS-002", name: "用户画像标签服务", category: "营销数据", version: "v1.5.2", status: "published", consumers: 8, qps: 800, sla: "99.5%" },
  { id: "DS-003", name: "医疗数据检索服务", category: "医疗数据", version: "v1.0.0", status: "beta", consumers: 3, qps: 200, sla: "99.0%" },
  { id: "DS-004", name: "交通流量分析服务", category: "交通数据", version: "v3.0.1", status: "published", consumers: 6, qps: 600, sla: "99.5%" },
  { id: "DS-005", name: "风险评估模型服务", category: "金融数据", version: "v2.0.0", status: "deprecated", consumers: 2, qps: 50, sla: "95.0%" },
];

const webhooks = [
  { id: "WH-001", name: "任务完成通知", url: "https://partner-a.com/callback", event: "task.completed", status: "active", lastTrigger: "2024-04-15 10:15:33" },
  { id: "WH-002", name: "异常告警通知", url: "https://alert-sys.com/webhook", event: "task.failed", status: "active", lastTrigger: "2024-04-14 16:35:01" },
  { id: "WH-003", name: "存证确认通知", url: "https://audit-log.com/evidence", event: "evidence.confirmed", status: "inactive", lastTrigger: "-" },
];

export default function SecretServices() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">服务管理</h1>
          <p className="text-sm text-gray-500 mt-1">API接口、数据服务与Webhook管理</p>
        </div>
        <Button className="gap-2">
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
              <div className="text-2xl font-bold text-gray-900">24</div>
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
              <div className="text-2xl font-bold text-gray-900">18</div>
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

      <Tabs defaultValue="apis" className="space-y-4">
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
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
