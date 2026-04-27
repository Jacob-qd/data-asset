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
  Shield,
  ClipboardList,
  Search,
  Download,
  CheckCircle2,
  Fingerprint,
  Clock,
  FileText,
  Eye,
  Link2,
} from "lucide-react";

const auditLogs = [
  { id: "AUD-001", type: "项目创建", object: "项目 SC-2024-001", operator: "管理员A", result: "成功", time: "2024-04-15 09:30:12", ip: "192.168.1.100", detail: "创建密态计算项目\"金融风险评估\"" },
  { id: "AUD-002", type: "任务执行", object: "任务 TS-2024-045", operator: "系统", result: "成功", time: "2024-04-15 10:15:33", ip: "-", detail: "PSI任务执行完成，匹配记录12,847条" },
  { id: "AUD-003", type: "密钥轮换", object: "密钥 KEY-003", operator: "管理员B", result: "成功", time: "2024-04-14 16:45:01", ip: "192.168.1.105", detail: "联邦学习梯度密钥自动轮换" },
  { id: "AUD-004", type: "成员变更", object: "项目 SC-2024-002", operator: "管理员A", result: "成功", time: "2024-04-14 14:20:18", ip: "192.168.1.100", detail: "添加参与方D到项目" },
  { id: "AUD-005", type: "任务取消", object: "任务 TS-2024-044", operator: "用户C", result: "成功", time: "2024-04-14 11:10:05", ip: "192.168.1.110", detail: "用户手动取消正在执行的PIR任务" },
];

const evidence = [
  { id: "EVD-001", hash: "0x8f3a2b...c4d5e6f", time: "2024-04-15 10:15:33", content: "PSI任务执行结果存证", blockchain: "0x7a8b9c...d0e1f2a", status: "confirmed", txHash: "0xabc123...def456" },
  { id: "EVD-002", hash: "0x1a2b3c...4d5e6f7", time: "2024-04-15 09:30:12", content: "项目创建存证", blockchain: "0x7a8b9c...d0e1f2a", status: "confirmed", txHash: "0x789abc...012def" },
  { id: "EVD-003", hash: "0x9e8d7c...6b5a4f3", time: "2024-04-14 16:45:01", content: "密钥轮换存证", blockchain: "0x7a8b9c...d0e1f2a", status: "confirmed", txHash: "0x345678...9abcdef" },
  { id: "EVD-004", hash: "0x2f4e6d...8c0a1b3", time: "2024-04-14 14:20:18", content: "成员变更存证", blockchain: "0x7a8b9c...d0e1f2a", status: "pending", txHash: "0xpending...000000" },
];

const traceLogs = [
  { id: "TRC-001", operation: "任务全生命周期", object: "TS-2024-045", steps: "创建→配置→提交→执行→完成→结果存证", duration: "45分钟", startTime: "2024-04-15 09:30", endTime: "2024-04-15 10:15" },
  { id: "TRC-002", operation: "密钥使用追溯", object: "KEY-003", steps: "创建→分发→加密→解密→轮换→归档", duration: "180天", startTime: "2023-10-15", endTime: "2024-04-14" },
  { id: "TRC-003", operation: "数据授权追溯", object: "DS-2024-012", steps: "授权申请→审批→授权生效→数据使用→授权到期→回收", duration: "30天", startTime: "2024-03-15", endTime: "2024-04-14" },
];

export default function SecretAuditLog() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">审计存证</h1>
          <p className="text-sm text-gray-500 mt-1">审计日志、区块链存证与操作追溯</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          导出报表
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3,284</div>
              <div className="text-xs text-gray-500">审计日志总数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">486</div>
              <div className="text-xs text-gray-500">区块链存证</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">152</div>
              <div className="text-xs text-gray-500">操作追溯</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-xs text-gray-500">存证验证通过率</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索审计日志或存证..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit" className="gap-2"><ClipboardList className="w-4 h-4" />审计日志</TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2"><Shield className="w-4 h-4" />区块链存证</TabsTrigger>
          <TabsTrigger value="trace" className="gap-2"><Link2 className="w-4 h-4" />操作追溯</TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">审计日志列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日志ID</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>操作对象</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>结果</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.filter(l => l.id.includes(searchQuery) || l.type.includes(searchQuery)).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.id}</TableCell>
                      <TableCell><Badge variant="outline">{log.type}</Badge></TableCell>
                      <TableCell className="font-medium text-xs">{log.object}</TableCell>
                      <TableCell>{log.operator}</TableCell>
                      <TableCell>
                        {log.result === "成功" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />成功</Badge> : <Badge className="bg-red-50 text-red-700">失败</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{log.time}</TableCell>
                      <TableCell className="font-mono text-xs">{log.ip}</TableCell>
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

        <TabsContent value="evidence">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">区块链存证记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>存证ID</TableHead>
                    <TableHead>存证哈希</TableHead>
                    <TableHead>存证内容</TableHead>
                    <TableHead>存证时间</TableHead>
                    <TableHead>区块链地址</TableHead>
                    <TableHead>交易哈希</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidence.filter(e => e.id.includes(searchQuery)).map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-mono text-xs">{ev.id}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.hash}</TableCell>
                      <TableCell className="font-medium text-xs">{ev.content}</TableCell>
                      <TableCell className="text-xs text-gray-500">{ev.time}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.blockchain}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.txHash}</TableCell>
                      <TableCell>
                        {ev.status === "confirmed" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已确认</Badge> : <Badge className="bg-amber-50 text-amber-700 gap-1"><Clock className="w-3 h-3" />待确认</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Fingerprint className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trace">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">操作追溯</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>追溯ID</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>对象</TableHead>
                    <TableHead>流程步骤</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>结束时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traceLogs.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell className="font-mono text-xs">{tr.id}</TableCell>
                      <TableCell><Badge variant="outline">{tr.operation}</Badge></TableCell>
                      <TableCell className="font-medium text-xs">{tr.object}</TableCell>
                      <TableCell className="text-xs max-w-[300px]">{tr.steps}</TableCell>
                      <TableCell>{tr.duration}</TableCell>
                      <TableCell className="text-xs text-gray-500">{tr.startTime}</TableCell>
                      <TableCell className="text-xs text-gray-500">{tr.endTime}</TableCell>
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
