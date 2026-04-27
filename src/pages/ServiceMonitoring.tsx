import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Activity, CheckCircle, XCircle, Clock } from "lucide-react";

const services = [
  { name: "信贷评分API", status: "正常", qps: 1250, latency: "45ms", uptime: "99.9%", calls: "1.2M" },
  { name: "反欺诈检测", status: "正常", qps: 850, latency: "32ms", uptime: "99.8%", calls: "850K" },
  { name: "用户画像", status: "降级", qps: 420, latency: "120ms", uptime: "95.2%", calls: "420K" },
  { name: "风险预警", status: "正常", qps: 320, latency: "28ms", uptime: "99.9%", calls: "320K" },
];

export default function ServiceMonitoring() {
  const statusColor: Record<string, string> = { "正常": "bg-green-100 text-green-700", "降级": "bg-amber-100 text-amber-700", "故障": "bg-red-100 text-red-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>数据服务</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>服务监测</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">服务监测</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">在线服务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{services.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">正常</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{services.filter(s => s.status === "正常").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">今日调用</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">2.7M</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">平均延迟</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">56ms</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>服务名称</TableHead><TableHead>状态</TableHead><TableHead>QPS</TableHead><TableHead>延迟</TableHead><TableHead>可用性</TableHead><TableHead>今日调用</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {services.map(s => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                  <TableCell>{s.qps}</TableCell>
                  <TableCell>{s.latency}</TableCell>
                  <TableCell>{s.uptime}</TableCell>
                  <TableCell>{s.calls}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
