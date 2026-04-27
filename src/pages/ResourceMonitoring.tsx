import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Cpu, HardDrive, Network, Activity } from "lucide-react";

export default function ResourceMonitoring() {
  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>资源监控</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">资源监控</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">节点数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">4</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">在线节点</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">3</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">告警数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">2</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">运行任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">5</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><Cpu className="h-5 w-5 text-blue-600" /><CardTitle className="text-sm">CPU使用率</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">45.2%</div><div className="text-xs text-gray-500">16核 / 32线程</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><HardDrive className="h-5 w-5 text-green-600" /><CardTitle className="text-sm">内存使用率</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">62.8%</div><div className="text-xs text-gray-500">64GB / 128GB</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><Network className="h-5 w-5 text-purple-600" /><CardTitle className="text-sm">网络吞吐</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">1.2GB/s</div><div className="text-xs text-gray-500">入站 800MB / 出站 400MB</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><Activity className="h-5 w-5 text-red-600" /><CardTitle className="text-sm">存储使用</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">78.5%</div><div className="text-xs text-gray-500">1.5TB / 2TB</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="h-80"><CardHeader><CardTitle className="text-sm">CPU/内存趋势</CardTitle></CardHeader><CardContent><div className="bg-gray-100 rounded h-60 flex items-center justify-center text-gray-400">实时性能趋势图区域</div></CardContent></Card>
        <Card className="h-80"><CardHeader><CardTitle className="text-sm">节点资源分布</CardTitle></CardHeader><CardContent><div className="bg-gray-100 rounded h-60 flex items-center justify-center text-gray-400">节点资源热力图区域</div></CardContent></Card>
      </div>
    </div>
  );
}
