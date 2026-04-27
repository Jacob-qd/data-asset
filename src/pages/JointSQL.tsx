import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Play, Save, Table } from "lucide-react";

export default function JointSQL() {
  const [sql, setSql] = useState(`SELECT a.user_id, a.name, b.credit_score\nFROM bank_a.customers a\nJOIN credit_bureau.scores b ON a.user_id = b.user_id\nWHERE b.credit_score > 700`);
  const [result, setResult] = useState<any[]>([]);

  const runQuery = () => {
    setResult([
      { user_id: "U001", name: "张三", credit_score: 820 },
      { user_id: "U002", name: "李四", credit_score: 790 },
      { user_id: "U003", name: "王五", credit_score: 810 },
    ]);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>联合SQL</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">联合SQL</h1>
          <p className="text-sm text-gray-500 mt-1.5">标准SQL语句的隐私计算执行，支持JOIN、AGGREGATE等</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Save className="mr-2 h-4 w-4" />保存</Button>
          <Button onClick={runQuery}><Play className="mr-2 h-4 w-4" />执行</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">SQL模板</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">8</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">执行次数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">256</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">平均耗时</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">1.2s</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">SQL编辑区</CardTitle></CardHeader>
          <CardContent>
            <textarea
              className="w-full h-64 font-mono text-sm bg-gray-50 p-4 rounded border resize-none"
              value={sql}
              onChange={e => setSql(e.target.value)}
            />
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">查询结果</CardTitle></CardHeader>
          <CardContent>
            {result.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">user_id</th><th className="text-left p-2">name</th><th className="text-left p-2">credit_score</th></tr></thead>
                <tbody>
                  {result.map((r, i) => <tr key={i} className="border-b"><td className="p-2 font-mono">{r.user_id}</td><td className="p-2">{r.name}</td><td className="p-2">{r.credit_score}</td></tr>)}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-center py-16">点击执行查看结果</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
