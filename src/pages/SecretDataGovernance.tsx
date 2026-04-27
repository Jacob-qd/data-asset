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
  Database,
  Shield,
  GitBranch,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Eye,
  FileText,
} from "lucide-react";

const qualityRules = [
  { id: "QR-001", name: "完整性检查-客户手机号", dimension: "完整性", severity: "高", coverage: "100%", passRate: "99.2%", lastRun: "2024-04-15 06:00" },
  { id: "QR-002", name: "一致性检查-身份证号格式", dimension: "一致性", severity: "高", coverage: "100%", passRate: "98.7%", lastRun: "2024-04-15 06:00" },
  { id: "QR-003", name: "准确性检查-金额范围", dimension: "准确性", severity: "中", coverage: "95%", passRate: "96.5%", lastRun: "2024-04-14 06:00" },
  { id: "QR-004", name: "时效性检查-数据更新延迟", dimension: "时效性", severity: "中", coverage: "100%", passRate: "94.3%", lastRun: "2024-04-15 06:00" },
  { id: "QR-005", name: "唯一性检查-用户ID", dimension: "唯一性", severity: "高", coverage: "100%", passRate: "99.9%", lastRun: "2024-04-15 06:00" },
];

const qualityTasks = [
  { id: "QT-001", name: "每日全量质量检查", status: "completed", ruleCount: 45, issueCount: 12, runTime: "2024-04-15 06:00", duration: "15分钟" },
  { id: "QT-002", name: "金融数据专项质检", status: "running", ruleCount: 18, issueCount: 0, runTime: "2024-04-15 10:30", duration: "-" },
  { id: "QT-003", name: "医疗数据隐私合规检查", status: "pending", ruleCount: 25, issueCount: 0, runTime: "-", duration: "-" },
  { id: "QT-004", name: "电商数据一致性校验", status: "completed", ruleCount: 30, issueCount: 3, runTime: "2024-04-14 06:00", duration: "22分钟" },
];

const lineageData = [
  { id: "LN-001", source: "ods_user_info", target: "dwd_user_detail", relation: "清洗转换", impact: "12个下游表", depth: 3, lastUpdate: "2024-04-15 08:00" },
  { id: "LN-002", source: "dwd_user_detail", target: "dws_user_tags", relation: "聚合标签", impact: "8个下游表", depth: 2, lastUpdate: "2024-04-15 08:00" },
  { id: "LN-003", source: "ods_trade_log", target: "dwd_trade_detail", relation: "解析拆分", impact: "6个下游表", depth: 2, lastUpdate: "2024-04-14 06:00" },
  { id: "LN-004", source: "dwd_trade_detail", target: "dws_trade_summary", relation: "汇总统计", impact: "4个下游表", depth: 1, lastUpdate: "2024-04-14 06:00" },
  { id: "LN-005", source: "dws_user_tags", target: "ads_user_portrait", relation: "画像建模", impact: "2个下游应用", depth: 1, lastUpdate: "2024-04-13 12:00" },
];

export default function SecretDataGovernance() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据治理</h1>
          <p className="text-sm text-gray-500 mt-1">数据质量管理与数据血缘分析</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          新建规则
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">86</div>
              <div className="text-xs text-gray-500">质量规则</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">97.8%</div>
              <div className="text-xs text-gray-500">平均合格率</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">324</div>
              <div className="text-xs text-gray-500">血缘关系</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-xs text-gray-500">质量问题</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索规则、任务或血缘..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules" className="gap-2"><Shield className="w-4 h-4" />规则库</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2"><Play className="w-4 h-4" />检查任务</TabsTrigger>
          <TabsTrigger value="lineage" className="gap-2"><GitBranch className="w-4 h-4" />血缘图谱</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">质量规则库</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>规则ID</TableHead>
                    <TableHead>规则名称</TableHead>
                    <TableHead>维度</TableHead>
                    <TableHead>严重等级</TableHead>
                    <TableHead>覆盖率</TableHead>
                    <TableHead>通过率</TableHead>
                    <TableHead>上次执行</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityRules.filter(r => r.name.includes(searchQuery) || r.id.includes(searchQuery)).map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono text-xs">{rule.id}</TableCell>
                      <TableCell className="font-medium text-xs">{rule.name}</TableCell>
                      <TableCell><Badge variant="outline">{rule.dimension}</Badge></TableCell>
                      <TableCell>
                        {rule.severity === "高" ? <Badge className="bg-red-50 text-red-700">高</Badge> : <Badge className="bg-amber-50 text-amber-700">中</Badge>}
                      </TableCell>
                      <TableCell>{rule.coverage}</TableCell>
                      <TableCell className={Number(rule.passRate) > 98 ? "text-green-600" : "text-amber-600"}>{rule.passRate}</TableCell>
                      <TableCell className="text-xs text-gray-500">{rule.lastRun}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">检查任务</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>任务名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>规则数</TableHead>
                    <TableHead>发现问题</TableHead>
                    <TableHead>执行时间</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityTasks.filter(t => t.name.includes(searchQuery)).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-xs">{task.id}</TableCell>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        {task.status === "completed" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已完成</Badge> :
                         task.status === "running" ? <Badge className="bg-blue-50 text-blue-700 gap-1"><Clock className="w-3 h-3" />执行中</Badge> :
                         <Badge className="bg-amber-50 text-amber-700">待执行</Badge>}
                      </TableCell>
                      <TableCell>{task.ruleCount}条</TableCell>
                      <TableCell className={task.issueCount > 0 ? "text-red-600" : "text-green-600"}>{task.issueCount}个</TableCell>
                      <TableCell className="text-xs text-gray-500">{task.runTime}</TableCell>
                      <TableCell>{task.duration}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><FileText className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineage">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">血缘关系</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>关系ID</TableHead>
                    <TableHead>源表</TableHead>
                    <TableHead>目标表</TableHead>
                    <TableHead>转换类型</TableHead>
                    <TableHead>影响范围</TableHead>
                    <TableHead>血缘深度</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineageData.filter(l => l.source.includes(searchQuery) || l.target.includes(searchQuery)).map((ln) => (
                    <TableRow key={ln.id}>
                      <TableCell className="font-mono text-xs">{ln.id}</TableCell>
                      <TableCell className="font-medium text-xs">{ln.source}</TableCell>
                      <TableCell className="font-medium text-xs">{ln.target}</TableCell>
                      <TableCell><Badge variant="outline">{ln.relation}</Badge></TableCell>
                      <TableCell>{ln.impact}</TableCell>
                      <TableCell>{ln.depth}层</TableCell>
                      <TableCell className="text-xs text-gray-500">{ln.lastUpdate}</TableCell>
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
