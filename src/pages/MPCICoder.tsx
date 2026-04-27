import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Play, Save, Code2, FileCode, Terminal, Bug } from "lucide-react";

const sampleCode = `// MPC 安全多方计算示例
function secureSum(inputs) {
  // 秘密分享协议
  const shares = inputs.map(x => splitShare(x, 3));
  // 本地计算
  const localSum = shares.reduce((a, b) => a + b, 0);
  // 结果重构
  return reconstruct(localSum);
}`;

export default function MPCICoder() {
  const [code, setCode] = useState(sampleCode);
  const [output, setOutput] = useState("");

  return (
    <div className="p-6 space-y-4 h-[calc(100vh-80px)]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>MPC iCoder</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">MPC iCoder</h1>
          <p className="text-sm text-gray-500 mt-1.5">安全多方计算代码编辑器，支持自定义算法开发</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="python">
            <SelectTrigger className="w-32"><SelectValue placeholder="语言" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="go">Go</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Save className="mr-2 h-4 w-4" />保存</Button>
          <Button onClick={() => setOutput("运行成功！\n耗时: 1.23s\n结果: 42")}><Play className="mr-2 h-4 w-4" />运行</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">代码片段</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">12</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">运行次数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">48</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">成功率</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">96%</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">模板数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">8</div></CardContent></Card>
      </div>

      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="editor"><Code2 className="mr-2 h-4 w-4" />编辑器</TabsTrigger>
          <TabsTrigger value="templates"><FileCode className="mr-2 h-4 w-4" />模板库</TabsTrigger>
          <TabsTrigger value="debug"><Bug className="mr-2 h-4 w-4" />调试</TabsTrigger>
        </TabsList>
        <div className="flex gap-4 mt-4 flex-1">
          <Card className="flex-1">
            <CardHeader className="pb-2"><CardTitle className="text-sm">代码编辑区</CardTitle></CardHeader>
            <CardContent>
              <textarea
                className="w-full h-96 font-mono text-sm bg-gray-50 p-4 rounded border resize-none"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </CardContent>
          </Card>
          <Card className="w-80">
            <CardHeader className="pb-2"><CardTitle className="text-sm">运行输出</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded h-96 font-mono text-xs whitespace-pre-wrap overflow-auto">
                {output || ">>> 等待运行..."}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
