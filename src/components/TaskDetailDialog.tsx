import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock, User, Database, Activity, Download, CheckCircle, AlertCircle, Info, XCircle,
  ArrowRight, Lock, Search, BarChart3, FileSpreadsheet, BrainCircuit, Shield, Zap,
  Eye, Server, KeyRound, TrendingUp, TrendingDown, Minus, Table2, Code2, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PrivacyTask } from "@/data/mock/privacy-tasks";
import { statusMap } from "@/data/mock/privacy-tasks";
import type {
  TaskParticipant, TaskExecutionLog, PSIResult, PIRResult, StatsResult, SQLResult, ModelResult,
} from "@/data/mock/task-details";

interface TaskDetailDialogProps {
  task: PrivacyTask | null;
  open: boolean;
  onClose: () => void;
  participants?: TaskParticipant[];
  logs?: TaskExecutionLog[];
  psiResult?: PSIResult;
  pirResult?: PIRResult;
  statsResult?: StatsResult;
  sqlResult?: SQLResult;
  modelResult?: ModelResult;
  type: "psi" | "pir" | "stats" | "sql" | "modeling";
}

const levelIcons = {
  INFO: <Info className="w-4 h-4 text-blue-500" />,
  WARN: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  ERROR: <XCircle className="w-4 h-4 text-red-500" />,
  SUCCESS: <CheckCircle className="w-4 h-4 text-green-500" />,
};

const levelColors = {
  INFO: "text-blue-700 bg-blue-50",
  WARN: "text-yellow-700 bg-yellow-50",
  ERROR: "text-red-700 bg-red-50",
  SUCCESS: "text-green-700 bg-green-50",
};

export default function TaskDetailDialog({
  task, open, onClose, participants, logs, psiResult, pirResult, statsResult, sqlResult, modelResult, type,
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!task) return null;

  const status = statusMap[task.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{task.name}</DialogTitle>
            <Badge
              variant={status?.color === "green" ? "default" : status?.color === "red" ? "destructive" : "secondary"}
              className={cn(
                status?.color === "blue" && "bg-blue-100 text-blue-700",
                status?.color === "yellow" && "bg-yellow-100 text-yellow-700"
              )}
            >
              {status?.label || task.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mt-1">{task.projectName} · {task.id}</div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="overview">概览</TabsTrigger>
            {participants && <TabsTrigger value="participants">参与方</TabsTrigger>}
            {(psiResult || pirResult || statsResult || sqlResult || modelResult) && (
              <TabsTrigger value="result">执行结果</TabsTrigger>
            )}
            {logs && <TabsTrigger value="logs">执行日志</TabsTrigger>}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<User className="w-4 h-4" />} label="创建人" value={task.createdBy} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="创建时间" value={task.createdAt} />
                <InfoItem icon={<Database className="w-4 h-4" />} label="任务类型" value={type.toUpperCase()} />
                <InfoItem icon={<Activity className="w-4 h-4" />} label="参与状态" value={task.participantStatus} />
              </div>

              {type === "psi" && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    PSI配置
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">求交键：</span> <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{task.intersectionKey || "--"}</span></div>
                    <div><span className="text-gray-500">参与方：</span> {task.participantCount || 2} 方</div>
                    <div><span className="text-gray-500">数据量级：</span> {task.dataSize || "--"}</div>
                    <div><span className="text-gray-500">算法：</span> ECDH-PSI</div>
                  </div>
                </div>
              )}

              {type === "pir" && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Search className="w-4 h-4 text-teal-500" />
                    PIR配置
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">查询类型：</span> <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{task.queryType || "--"}</span></div>
                    <div><span className="text-gray-500">被查询方：</span> {task.targetParty || "--"}</div>
                    <div className="col-span-2"><span className="text-gray-500">查询条件：</span> <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{task.queryCondition || "--"}</code></div>
                  </div>
                </div>
              )}

              {type === "stats" && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    统计配置
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">统计类型：</span> <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{task.statType || "--"}</span></div>
                    <div><span className="text-gray-500">统计维度：</span> {task.statDimensions || "--"}</div>
                  </div>
                </div>
              )}

              {type === "sql" && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-slate-500" />
                    SQL配置
                  </h4>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-auto font-mono">
                    <code>{task.sqlPreview || "--"}</code>
                  </pre>
                </div>
              )}

              {type === "modeling" && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-purple-500" />
                      模型配置
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">算法类型：</span> <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{task.algorithmType || "--"}</span></div>
                      <div><span className="text-gray-500">模型名称：</span> {task.modelName || "--"}</div>
                      <div><span className="text-gray-500">业务标签：</span> {task.businessTag || "--"}</div>
                      {task.federationType && (
                        <div><span className="text-gray-500">联邦类型：</span> 
                          <Badge className={cn(
                            task.federationType === "horizontal" && "bg-green-100 text-green-700",
                            task.federationType === "vertical" && "bg-blue-100 text-blue-700",
                            task.federationType === "traditional" && "bg-gray-100 text-gray-700",
                          )}>
                            {task.federationType === "horizontal" ? "横向联邦" : task.federationType === "vertical" ? "纵向联邦" : "传统联合建模"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 联邦学习特有配置 */}
                  {task.federationType && (
                    <div className="border rounded-lg p-4 space-y-3 bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        联邦学习配置
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {task.communicationRounds && (
                          <div><span className="text-gray-500">通信轮数：</span> {task.communicationRounds}</div>
                        )}
                        {task.clientSamplingRate && (
                          <div><span className="text-gray-500">客户端采样率：</span> {task.clientSamplingRate}%</div>
                        )}
                        {task.privacyBudget && (
                          <div><span className="text-gray-500">隐私预算(ε)：</span> {task.privacyBudget}</div>
                        )}
                        {task.gradientProtection && (
                          <div><span className="text-gray-500">梯度保护：</span> {task.gradientProtection}</div>
                        )}
                        {task.alignmentKey && (
                          <div><span className="text-gray-500">对齐字段：</span> {task.alignmentKey}</div>
                        )}
                        {task.labelParty && (
                          <div><span className="text-gray-500">标签方：</span> {task.labelParty}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* PSI 前置联动信息 */}
                  {task.psiTaskId && (
                    <div className="border rounded-lg p-4 space-y-3 bg-amber-50/30 border-amber-200">
                      <h4 className="font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-600" />
                        隐私求交前置任务
                      </h4>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                          {task.psiTaskId}
                        </Badge>
                        <span className="font-medium">{task.psiTaskName || "隐私求交任务"}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        纵向联邦训练前，已通过该 PSI 任务完成各参与方样本对齐。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {participants && (
              <TabsContent value="participants" className="space-y-3">
                {participants.map((p) => (
                  <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
                        p.status === "online" ? "bg-green-500" : p.status === "busy" ? "bg-yellow-500" : "bg-gray-400"
                      )}>
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-500">{p.role}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 justify-end">
                        <div className={cn("w-2 h-2 rounded-full", p.status === "online" ? "bg-green-500" : "bg-gray-400")} />
                        {p.status === "online" ? "在线" : "离线"}
                      </div>
                      {p.dataSize && <div className="text-gray-500">数据量：{p.dataSize}</div>}
                    </div>
                  </div>
                ))}
              </TabsContent>
            )}

            <TabsContent value="result">
              {psiResult && <PSIResultView result={psiResult} />}
              {pirResult && <PIRResultView result={pirResult} task={task} />}
              {statsResult && <StatsResultView result={statsResult} />}
              {sqlResult && <SQLResultView result={sqlResult} task={task} />}
              {modelResult && <ModelResultView result={modelResult} />}
            </TabsContent>

            {logs && (
              <TabsContent value="logs" className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className={cn("flex items-start gap-3 p-3 rounded-lg text-sm", levelColors[log.level])}>
                    <div className="shrink-0 mt-0.5">{levelIcons[log.level]}</div>
                    <div className="flex-1">
                      <div className="text-xs opacity-70">{log.timestamp}</div>
                      <div>{log.message}</div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>

        <div className="shrink-0 flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>关闭</Button>
          {task.status === "success" && (
            <Button onClick={() => toast.info("下载功能开发中")}>
              <Download className="w-4 h-4 mr-2" />下载结果
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════
   PSI Result — Visual overlap + data comparison
   ═══════════════════════════════════════════════════════════ */
function PSIResultView({ result }: { result: PSIResult }) {
  const maxCount = Math.max(result.totalCountA, result.totalCountB, 1);
  const aWidth = `${(result.totalCountA / maxCount) * 100}%`;
  const bWidth = `${(result.totalCountB / maxCount) * 100}%`;
  const overlapWidth = `${Math.max((result.intersectionCount / maxCount) * 100, 8)}%`;

  return (
    <div className="space-y-6">
      {/* Top metric cards */}
      <div className="grid grid-cols-4 gap-4">
        <ResultCard label="交集数量" value={result.intersectionCount.toLocaleString()} icon={<Zap className="w-5 h-5" />} color="indigo" />
        <ResultCard label="A方数据" value={result.totalCountA.toLocaleString()} icon={<Database className="w-5 h-5" />} color="blue" />
        <ResultCard label="B方数据" value={result.totalCountB.toLocaleString()} icon={<Database className="w-5 h-5" />} color="cyan" />
        <ResultCard label="重叠率" value={`${result.overlapRate}%`} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
      </div>

      {/* Visual overlap diagram */}
      <div className="border rounded-xl p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-500" />
          数据重叠可视化
        </h4>
        <div className="flex items-center justify-center gap-8 py-4">
          {/* Circle A */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 rounded-full border-4 border-blue-400 bg-blue-100 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">A方</div>
                <div className="text-sm text-blue-600">{result.totalCountA.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">{result.totalCountA.toLocaleString()} 条</div>
          </div>

          {/* Overlap indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl font-bold text-indigo-600">{result.overlapRate}%</div>
            <div className="text-xs text-gray-500">重叠率</div>
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(result.overlapRate, 100)}%` }} />
            </div>
          </div>

          {/* Circle B */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400 bg-cyan-100 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-700">B方</div>
                <div className="text-sm text-cyan-600">{result.totalCountB.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">{result.totalCountB.toLocaleString()} 条</div>
          </div>
        </div>

        {/* Data volume bars */}
        <div className="space-y-3 mt-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600 font-medium">A方数据量</span>
              <span>{result.totalCountA.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: aWidth }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-cyan-600 font-medium">B方数据量</span>
              <span>{result.totalCountB.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: bWidth }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-indigo-600 font-medium">交集数据量</span>
              <span>{result.intersectionCount.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: overlapWidth }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Timer className="w-4 h-4" />
        执行耗时：{result.executionTime}
      </div>
      <Button onClick={() => toast.info("结果下载功能开发中")}>
        <Download className="w-4 h-4 mr-2" />下载求交结果
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PIR Result — Query flow + response records + privacy metrics
   ═══════════════════════════════════════════════════════════ */
function PIRResultView({ result, task }: { result: PIRResult; task: PrivacyTask }) {
  // Generate mock response records based on responseCount
  const responseRecords = Array.from({ length: Math.min(result.responseCount, 5) }, (_, i) => ({
    id: `R${String(i + 1).padStart(3, "0")}`,
    queryId: `Q-${Date.now().toString(36).slice(-6)}-${i + 1}`,
    status: result.hitRate > 0 ? "命中" : "未命中",
    encrypted: true,
    responseTime: result.responseTime,
  }));

  return (
    <div className="space-y-6">
      {/* Query flow visualization */}
      <div className="border rounded-xl p-6 bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-teal-500" />
          隐匿查询流程
        </h4>
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-teal-100 border-2 border-teal-400 flex items-center justify-center">
              <Search className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-medium">发起方</span>
            <span className="text-xs text-gray-500">加密查询</span>
          </div>
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full h-0.5 bg-teal-300 relative">
              <Lock className="w-4 h-4 text-teal-500 absolute -top-2 left-1/2 -translate-x-1/2 bg-white" />
            </div>
            <span className="text-xs text-teal-600 mt-2">OT协议传输</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-cyan-100 border-2 border-cyan-400 flex items-center justify-center">
              <Server className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-sm font-medium">被查询方</span>
            <span className="text-xs text-gray-500">{task.targetParty || "--"}</span>
          </div>
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full h-0.5 bg-cyan-300 relative">
              <Lock className="w-4 h-4 text-cyan-500 absolute -top-2 left-1/2 -translate-x-1/2 bg-white" />
            </div>
            <span className="text-xs text-cyan-600 mt-2">加密响应</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-teal-100 border-2 border-teal-400 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-medium">发起方</span>
            <span className="text-xs text-gray-500">解密结果</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <ResultCard label="查询次数" value={result.queryCount.toString()} icon={<Search className="w-5 h-5" />} color="teal" />
        <ResultCard label="响应数量" value={result.responseCount.toString()} icon={<FileSpreadsheet className="w-5 h-5" />} color="cyan" />
        <ResultCard label="命中率" value={`${result.hitRate}%`} icon={result.hitRate > 0 ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />} color={result.hitRate > 0 ? "emerald" : "rose"} />
        <ResultCard label="响应耗时" value={result.responseTime} icon={<Timer className="w-5 h-5" />} color="amber" />
      </div>

      {/* Privacy metrics */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-500" />
          隐私保护指标
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-teal-600">100%</div>
            <div className="text-xs text-gray-500 mt-1">查询隐私保护</div>
            <div className="text-xs text-gray-400">查询内容不可见</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-cyan-600">{result.responseCount}</div>
            <div className="text-xs text-gray-500 mt-1">数据暴露量</div>
            <div className="text-xs text-gray-400">仅返回匹配记录</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-emerald-600">OT协议</div>
            <div className="text-xs text-gray-500 mt-1">通信安全</div>
            <div className="text-xs text-gray-400">不经意传输</div>
          </div>
        </div>
      </div>

      {/* Response records */}
      {responseRecords.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium border-b">响应记录</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">记录ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">查询ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">状态</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">加密状态</th>
              </tr>
            </thead>
            <tbody>
              {responseRecords.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{record.id}</td>
                  <td className="px-4 py-2 font-mono text-xs">{record.queryId}</td>
                  <td className="px-4 py-2">
                    <Badge variant={record.status === "命中" ? "default" : "secondary"} className={record.status === "命中" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1 text-xs text-teal-600">
                      <Lock className="w-3 h-3" /> 已加密
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stats Result — Statistical breakdown + distribution bars
   ═══════════════════════════════════════════════════════════ */
function StatsResultView({ result }: { result: StatsResult }) {
  // Parse result value into dimension rows
  const dimensionItems = result.resultValue !== "—"
    ? result.resultValue.split(",").map((item) => {
        const [name, value] = item.split(":").map((s) => s.trim());
        return { name: name || item.trim(), value: value || "" };
      })
    : [];

  // Determine trend for each dimension (mock logic)
  const getTrend = (index: number) => {
    const trends = ["up", "up", "down", "up", "down", "up"];
    return trends[index % trends.length];
  };

  return (
    <div className="space-y-6">
      {/* Main stats card */}
      <div className="border rounded-xl p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            统计结果概览
          </h4>
          <Badge className="bg-amber-100 text-amber-700">{result.statType}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <ResultCard label="样本量" value={result.sampleSize.toLocaleString()} icon={<Database className="w-5 h-5" />} color="amber" />
          <ResultCard label="统计维度" value={result.dimensions} icon={<Table2 className="w-5 h-5" />} color="orange" />
          <ResultCard label="置信区间" value={result.confidenceInterval?.split(":")[0] || "95%"} icon={<Shield className="w-5 h-5" />} color="yellow" />
        </div>
      </div>

      {/* Dimension breakdown */}
      {dimensionItems.length > 0 && (
        <div className="border rounded-xl p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            维度详细分析
          </h4>
          <div className="space-y-3">
            {dimensionItems.map((item, i) => {
              const trend = getTrend(i);
              return (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-700">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.name}</span>
                      <div className="flex items-center gap-1">
                        {trend === "up" && <TrendingUp className="w-4 h-4 text-red-500" />}
                        {trend === "down" && <TrendingDown className="w-4 h-4 text-green-500" />}
                        {trend === "flat" && <Minus className="w-4 h-4 text-gray-500" />}
                        <span className="font-bold text-amber-700">{item.value}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(60 + (i * 15) % 40, 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confidence interval visualization */}
      {result.confidenceInterval && result.confidenceInterval !== "—" && (
        <div className="border rounded-xl p-4 bg-gray-50">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            置信区间
          </h4>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-center gap-2 text-lg font-mono">
              <span className="text-gray-500">{result.confidenceInterval}</span>
            </div>
            <div className="flex items-center justify-between mt-4 px-8">
              <div className="text-center">
                <div className="text-xs text-gray-500">下限</div>
                <div className="font-bold text-amber-700">
                  {result.confidenceInterval.match(/\[([^,]+)/)?.[1] || "—"}
                </div>
              </div>
              <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 rounded-full relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-3 h-3 bg-amber-600 rounded-full border-2 border-white" />
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">上限</div>
                <div className="font-bold text-amber-700">
                  {result.confidenceInterval.match(/,\s*([^\]]+)/)?.[1] || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SQL Result — SQL display + execution plan + styled table
   ═══════════════════════════════════════════════════════════ */
function SQLResultView({ result, task }: { result: SQLResult; task: PrivacyTask }) {
  // Mock execution plan steps
  const executionPlan = [
    { step: 1, operation: "Table Scan", table: "party_a.users", rows: result.rowCount > 0 ? Math.floor(result.rowCount * 1.2) : 0, cost: "12%" },
    { step: 2, operation: "Index Join", table: "party_b.transactions", rows: result.rowCount > 0 ? Math.floor(result.rowCount * 1.5) : 0, cost: "45%" },
    { step: 3, operation: "Aggregation", table: "—", rows: result.rowCount, cost: "28%" },
    { step: 4, operation: "Result", table: "—", rows: result.rowCount, cost: "15%" },
  ].filter((s) => s.rows > 0 || result.rowCount === 0);

  return (
    <div className="space-y-6">
      {/* SQL Query Display */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-300" />
            <span className="text-sm text-slate-300 font-medium">SQL 查询语句</span>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
            {result.columnCount} 列 · {result.rowCount.toLocaleString()} 行
          </Badge>
        </div>
        <pre className="bg-slate-900 text-slate-100 p-4 text-sm overflow-auto font-mono leading-relaxed">
          <code>{task.sqlPreview || "--"}</code>
        </pre>
      </div>

      {/* Execution metrics */}
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="结果行数" value={result.rowCount.toLocaleString()} icon={<Table2 className="w-5 h-5" />} color="slate" />
        <ResultCard label="列数" value={result.columnCount.toString()} icon={<Database className="w-5 h-5" />} color="gray" />
        <ResultCard label="执行耗时" value={result.executionTime} icon={<Timer className="w-5 h-5" />} color="zinc" />
      </div>

      {/* Execution plan */}
      {result.rowCount > 0 && (
        <div className="border rounded-xl p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-500" />
            执行计划
          </h4>
          <div className="space-y-2">
            {executionPlan.map((step) => (
              <div key={step.step} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-700">{step.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{step.operation}</span>
                    <Badge variant="outline" className="text-xs">{step.cost}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>表: {step.table}</span>
                    <span>估算行数: {step.rows.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: step.cost }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result table */}
      {result.preview.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium border-b flex items-center justify-between">
            <span>查询结果预览</span>
            <span className="text-xs text-gray-500">前 {result.preview.length} 条</span>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(result.preview[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left font-medium text-gray-600 uppercase text-xs tracking-wider">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.preview.map((row, i) => (
                  <tr key={i} className={cn("border-t", i % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-2 font-mono text-xs">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button onClick={() => toast.info("结果导出功能开发中")}>
        <Download className="w-4 h-4 mr-2" />导出结果
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Model Result — Enhanced metrics display
   ═══════════════════════════════════════════════════════════ */
function ModelResultView({ result }: { result: ModelResult }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <ResultCard label="准确率" value={`${(result.accuracy * 100).toFixed(1)}%`} icon={<CheckCircle className="w-5 h-5" />} color="purple" />
        <ResultCard label="AUC" value={result.auc.toFixed(3)} icon={<TrendingUp className="w-5 h-5" />} color="violet" />
        <ResultCard label="F1分数" value={result.f1Score.toFixed(3)} icon={<BarChart3 className="w-5 h-5" />} color="fuchsia" />
        <ResultCard label="精确率" value={result.precision.toFixed(3)} icon={<TargetIcon />} color="indigo" />
        <ResultCard label="召回率" value={result.recall.toFixed(3)} icon={<Eye className="w-5 h-5" />} color="blue" />
      </div>

      {/* Training info */}
      <div className="border rounded-xl p-4 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-500" />
          训练信息
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-purple-600">{result.trainingTime}</div>
            <div className="text-xs text-gray-500 mt-1">训练耗时</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-indigo-600">{result.epochs}</div>
            <div className="text-xs text-gray-500 mt-1">训练轮数</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-violet-600">
              {result.lossCurve.length > 0 ? result.lossCurve[result.lossCurve.length - 1].loss.toFixed(4) : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">最终损失</div>
          </div>
        </div>
      </div>

      {/* Loss curve visualization */}
      {result.lossCurve.length > 0 && (
        <div className="border rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-purple-500" />
            损失曲线
          </h4>
          <div className="flex items-end gap-1 h-32 px-2">
            {result.lossCurve.map((point, i) => {
              const maxLoss = Math.max(...result.lossCurve.map((p) => p.loss));
              const height = `${(point.loss / maxLoss) * 100}%`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-purple-400 rounded-t transition-all hover:bg-purple-500"
                    style={{ height }}
                    title={`Epoch ${point.epoch}: Loss ${point.loss.toFixed(4)}`}
                  />
                  {i % 4 === 0 && <span className="text-[10px] text-gray-400">{point.epoch}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Button onClick={() => toast.info("模型下载功能开发中")}>
        <Download className="w-4 h-4 mr-2" />下载模型
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Shared Components
   ═══════════════════════════════════════════════════════════ */
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-400">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-700", light: "bg-indigo-50" },
  blue: { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-50" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-700", light: "bg-cyan-50" },
  teal: { bg: "bg-teal-500", text: "text-teal-700", light: "bg-teal-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50" },
  amber: { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-700", light: "bg-orange-50" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-700", light: "bg-yellow-50" },
  slate: { bg: "bg-slate-500", text: "text-slate-700", light: "bg-slate-50" },
  gray: { bg: "bg-gray-500", text: "text-gray-700", light: "bg-gray-50" },
  zinc: { bg: "bg-zinc-500", text: "text-zinc-700", light: "bg-zinc-50" },
  purple: { bg: "bg-purple-500", text: "text-purple-700", light: "bg-purple-50" },
  violet: { bg: "bg-violet-500", text: "text-violet-700", light: "bg-violet-50" },
  fuchsia: { bg: "bg-fuchsia-500", text: "text-fuchsia-700", light: "bg-fuchsia-50" },
  rose: { bg: "bg-rose-500", text: "text-rose-700", light: "bg-rose-50" },
};

function ResultCard({ label, value, icon, color = "indigo" }: { label: string; value: string; icon?: React.ReactNode; color?: string }) {
  const colors = colorMap[color] || colorMap.indigo;
  return (
    <div className={cn("p-4 rounded-lg text-center border", colors.light)}>
      <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center", colors.bg, "text-white")}>
        {icon}
      </div>
      <div className={cn("text-2xl font-bold", colors.text)}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
