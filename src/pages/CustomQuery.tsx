import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Play, Database, Table, Plus } from "lucide-react";

export default function CustomQuery() {
  const [query, setQuery] = useState("");

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>自定义查询</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">自定义查询</h1>
          <p className="text-sm text-gray-500 mt-1.5">可视化SQL构建器，支持多方数据联合查询</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Play className="mr-2 h-4 w-4" />执行查询</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">数据源</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">6</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">查询模板</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">15</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">今日查询</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">128</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">数据源</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><Database className="h-4 w-4" /><span>银行A-客户表</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><Database className="h-4 w-4" /><span>保险B-保单表</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><Database className="h-4 w-4" /><span>征信C-信用表</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">查询构建</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select><SelectTrigger className="w-32"><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent><SelectItem value="*">*</SelectItem><SelectItem value="count">COUNT</SelectItem></SelectContent></Select>
                <Input placeholder="字段" className="w-40" />
                <span className="self-center">FROM</span>
                <Select><SelectTrigger className="w-40"><SelectValue placeholder="选择表" /></SelectTrigger><SelectContent><SelectItem value="t1">客户表</SelectItem></SelectContent></Select>
              </div>
              <div className="flex gap-2">
                <span className="self-center">WHERE</span>
                <Input placeholder="条件字段" className="w-32" />
                <Select><SelectTrigger className="w-24"><SelectValue placeholder="=" /></SelectTrigger><SelectContent><SelectItem value="=">=</SelectItem><SelectItem value=">">&gt;</SelectItem><SelectItem value="&lt;">&lt;</SelectItem></SelectContent></Select>
                <Input placeholder="值" className="w-32" />
                <Button variant="outline" size="sm"><Plus className="h-3 w-3" /></Button>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm min-h-[100px]">
                SELECT * FROM customer_table WHERE age &gt; 18
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
