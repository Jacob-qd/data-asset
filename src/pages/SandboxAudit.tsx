import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Eye, Download, ClipboardList, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, UserCheck, FileText, Clock, Filter,
} from "lucide-react";

const auditLogs = [
  { id: "AUD-001", action: "模型提交审查", target: "信用评分模型_v2.1", user: "李四", result: "成功", time: "2024-04-15 10:00:12", ip: "192.168.1.100", detail: "提交模型文件至审查队列，等待审核员A审批" },
  { id: "AUD-002", action: "审查通过", target: "流失预警模型", user: "审核员A", result: "成功", time: "2024-04-15 09:30:45", ip: "192.168.1.105", detail: "审核员A批准模型发布，确认AUC指标达标" },
  { id: "AUD-003", action: "数据导出", target: "零售客户数据", user: "张三", result: "成功", time: "2024-04-15 08:15:33", ip: "192.168.1.100", detail: "导出样本数据至沙箱环境，用于模型训练" },
  { id: "AUD-004", action: "审查驳回", target: "异常检测模型", user: "审核员A", result: "失败", time: "2024-04-14 16:20:18", ip: "192.168.1.105", detail: "驳回原因：误报率15.2%超过阈值10%" },
  { id: "AUD-005", action: "环境变更", target: "Python 3.10环境", user: "系统", result: "成功", time: "2024-04-14 14:00:00", ip: "-", detail: "自动更新TensorFlow至2.15版本" },
];

export default function SandboxAudit() {
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const filtered = auditLogs.filter(l => l.target.includes(search) || l.id.includes(search) || l.action.includes(search));

  const handleView = (log: any) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">沙箱审计</h1>
          <p className="text-sm text-gray-500 mt-1">操作审计、合规检查与安全追溯</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />导出审计报告</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索审计日志..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">审计日志</CardTitle></CardHeader>
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
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.id}</TableCell>
                  <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                  <TableCell className="font-medium text-xs">{log.target}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    {log.result === "成功" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />成功</Badge> :
                     <Badge className="bg-red-50 text-red-700 gap-1"><XCircle className="w-3 h-3" />失败</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{log.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(log)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>审计详情</SheetTitle>
            <SheetDescription>查看完整审计信息</SheetDescription>
          </SheetHeader>
          {selectedLog && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">日志ID</span><span className="text-sm font-mono">{selectedLog.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">操作类型</span><Badge variant="outline">{selectedLog.action}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">操作对象</span><span className="text-sm font-medium">{selectedLog.target}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">操作人</span><span className="text-sm">{selectedLog.user}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">IP地址</span><span className="text-sm font-mono">{selectedLog.ip}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">操作时间</span><span className="text-sm">{selectedLog.time}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">结果</span>
                  {selectedLog.result === "成功" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />成功</Badge> :
                   <Badge className="bg-red-50 text-red-700 gap-1"><XCircle className="w-3 h-3" />失败</Badge>}
                </div>
                <div className="pt-2"><span className="text-sm text-gray-500">详细说明</span><p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedLog.detail}</p></div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
