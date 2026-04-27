import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Bell, FolderKanban, BarChart3, Users, FileText } from "lucide-react";

export default function Workbench() {
  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>工作台</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">企业工作台</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><FolderKanban className="h-5 w-5 text-blue-600" /><CardTitle className="text-sm">进行中项目</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">5</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><Bell className="h-5 w-5 text-amber-600" /><CardTitle className="text-sm">待办事项</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">3</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><BarChart3 className="h-5 w-5 text-green-600" /><CardTitle className="text-sm">数据资产</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">128</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center gap-2"><Users className="h-5 w-5 text-purple-600" /><CardTitle className="text-sm">团队成员</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">12</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">待办中心</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber-500" /><span>资源审批待处理</span></div><Badge>2</Badge></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /><span>报告待审核</span></div><Badge>1</Badge></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded"><div className="flex items-center gap-2"><FolderKanban className="h-4 w-4 text-green-500" /><span>项目待确认</span></div><Badge>3</Badge></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">最近动态</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>张三 创建了项目 金融风控建模</span><span className="text-gray-400">10分钟前</span></div>
              <div className="flex justify-between"><span>李四 审批通过了 资源申请</span><span className="text-gray-400">30分钟前</span></div>
              <div className="flex justify-between"><span>王五 完成了 PSI求交任务</span><span className="text-gray-400">1小时前</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
