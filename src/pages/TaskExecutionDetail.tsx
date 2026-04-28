import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Play,
  RotateCcw, FileText, BarChart3
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExecutionInstance {
  id: string;
  name: string;
  fromTask: string;
  businessTag: string;
  startTime: string;
  duration: string;
  status: string;
  logs: string[];
}

export default function TaskExecutionDetail() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [instances] = useState<ExecutionInstance[]>([
    {
      id: "INST-001",
      name: "医疗影像筛查-执行实例-001",
      fromTask: "医疗影像筛查模型训练",
      businessTag: "医疗健康",
      startTime: "2026-04-28 09:15:32",
      duration: "12分34秒",
      status: "success",
      logs: [
        "[2026-04-28 09:15:32] 任务开始执行",
        "[2026-04-28 09:15:33] 加载数据: reader_0",
        "[2026-04-28 09:16:45] 数据预处理完成: data_transform_0",
        "[2026-04-28 09:18:12] 隐私求交完成: intersection_0",
        "[2026-04-28 09:20:56] 模型训练完成: hetero_lr_0",
        "[2026-04-28 09:22:18] 模型评估完成: evaluation_0",
        "[2026-04-28 09:27:06] AUC: 0.9234, K-S: 0.7345",
        "[2026-04-28 09:27:06] 任务执行成功",
      ],
    },
    {
      id: "INST-002",
      name: "医疗影像筛查-执行实例-002",
      fromTask: "医疗影像筛查模型训练",
      businessTag: "医疗健康",
      startTime: "2026-04-27 14:22:18",
      duration: "8分12秒",
      status: "failed",
      logs: [
        "[2026-04-27 14:22:18] 任务开始执行",
        "[2026-04-27 14:22:19] 加载数据: reader_0",
        "[2026-04-27 14:23:45] 数据预处理完成: data_transform_0",
        "[2026-04-27 14:25:30] 错误: 隐私求交失败，节点连接超时",
        "[2026-04-27 14:30:30] 任务执行失败",
      ],
    },
    {
      id: "INST-003",
      name: "医疗影像筛查-执行实例-003",
      fromTask: "医疗影像筛查模型训练",
      businessTag: "医疗健康",
      startTime: "2026-04-26 10:33:48",
      duration: "15分22秒",
      status: "success",
      logs: [
        "[2026-04-26 10:33:48] 任务开始执行",
        "[2026-04-26 10:33:49] 加载数据: reader_0",
        "[2026-04-26 10:35:12] 数据预处理完成: data_transform_0",
        "[2026-04-26 10:37:45] 隐私求交完成: intersection_0",
        "[2026-04-26 10:40:22] 模型训练完成: hetero_lr_0",
        "[2026-04-26 10:42:18] 模型评估完成: evaluation_0",
        "[2026-04-26 10:49:10] AUC: 0.9156, K-S: 0.7123",
        "[2026-04-26 10:49:10] 任务执行成功",
      ],
    },
  ]);

  const [selectedInstance, setSelectedInstance] = useState(instances[0]);

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    success: {
      label: "执行成功",
      color: "text-green-700",
      bg: "bg-green-50",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    failed: {
      label: "执行失败",
      color: "text-red-700",
      bg: "bg-red-50",
      icon: <XCircle className="w-4 h-4" />,
    },
    running: {
      label: "执行中",
      color: "text-blue-700",
      bg: "bg-blue-50",
      icon: <Play className="w-4 h-4" />,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/privacy/tasks")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">任务执行历史</h1>
            <p className="text-sm text-gray-500">任务ID: {taskId || "TASK-001"} | 医疗影像筛查模型训练</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          重新执行
        </Button>
      </div>

      {/* Instance List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">执行实例列表</h3>
          {instances.map((inst) => {
            const config = statusConfig[inst.status];
            return (
              <Card
                key={inst.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedInstance.id === inst.id ? "border-indigo-500 bg-indigo-50/30" : "hover:bg-gray-50"
                )}
                onClick={() => setSelectedInstance(inst)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">{inst.name}</span>
                    <Badge variant="outline" className={cn(config.color, config.bg)}>
                      <div className="flex items-center gap-1">
                        {config.icon}
                        {config.label}
                      </div>
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {inst.startTime}
                    </div>
                    <div>执行时长: {inst.duration}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instance Detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selectedInstance.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">来源任务</div>
                  <div className="text-sm font-medium">{selectedInstance.fromTask}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">业务标签</div>
                  <div className="text-sm font-medium">{selectedInstance.businessTag}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">开始时间</div>
                  <div className="text-sm font-medium">{selectedInstance.startTime}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">执行时长</div>
                  <div className="text-sm font-medium">{selectedInstance.duration}</div>
                </div>
              </div>

              <Tabs defaultValue="logs">
                <TabsList>
                  <TabsTrigger value="logs">
                    <FileText className="w-4 h-4 mr-1" />
                    执行日志
                  </TabsTrigger>
                  <TabsTrigger value="result">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    执行结果
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="logs">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                    {selectedInstance.logs.map((log, index) => (
                      <div key={index} className="text-gray-300">
                        <span className="text-green-400">$ </span>
                        {log}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="result">
                  {selectedInstance.status === "success" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "AUC", value: "0.9234" },
                          { label: "K-S", value: "0.7345" },
                          { label: "精确率", value: "89.23%" },
                          { label: "召回率", value: "84.56%" },
                        ].map((metric) => (
                          <div key={metric.label} className="bg-indigo-50 p-4 rounded text-center">
                            <div className="text-2xl font-bold text-indigo-700">{metric.value}</div>
                            <div className="text-xs text-indigo-500 mt-1">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <Button onClick={() => navigate("/privacy/models/evaluation/MODEL-001")}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          查看完整评估报告
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <XCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
                      <p>任务执行失败，无评估结果</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}