import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, BrainCircuit, Users, Shield, Eye, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction, createExecuteAction, createHistoryAction } from "@/components/ActionButtons";
import {
  mockPrivacyTasks, taskTypeLabels, statusMap, algorithmGroups, type PrivacyTask,
} from "@/data/mock/privacy-tasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TaskDetailDialog from "@/components/TaskDetailDialog";
import {
  mockModelResults, mockParticipants, mockLogs, mockDataSources,
} from "@/data/mock/task-details";

const tabs = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我参与的" },
  { key: "executable", label: "可执行的" },
  { key: "history", label: "执行历史" },
];

// 判断算法所属联邦类型
function getFederationType(algorithm: string): "horizontal" | "vertical" | "traditional" | null {
  if (algorithm.startsWith("横向")) return "horizontal";
  if (algorithm.startsWith("纵向")) return "vertical";
  if (["联邦神经网络", "安全多方LR", "安全多方XGBoost"].includes(algorithm)) return "traditional";
  return null;
}

export default function ModelingTaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PrivacyTask[]>(
    mockPrivacyTasks.filter((t) => t.taskType === "modeling")
  );
  const [activeTab, setActiveTab] = useState("created");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailTask, setDetailTask] = useState<PrivacyTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const parties = ["科技公司甲", "数据研究院乙", "智能科技丙", "金融科技丁"];
  
  const [createForm, setCreateForm] = useState({
    name: "", projectName: "", description: "", algorithmType: "", modelName: "", participantCount: "2",
    dataSource: "", selectedParties: [] as string[],
    learningRate: "0.01", epochs: "100", batchSize: "32", featureColumns: [] as string[],
    // 联邦特有配置
    communicationRounds: "100",
    clientSamplingRate: "80",
    privacyBudget: "1.0",
    alignmentKey: "",
    labelParty: "",
    gradientProtection: "",
    // PSI 联动
    psiTaskId: "",
  });
  const selectedDS = mockDataSources.find((ds) => ds.id === createForm.dataSource);
  const federationType = getFederationType(createForm.algorithmType);
  
  // 获取可用的 PSI 任务（已成功完成的）
  const availablePSITasks = mockPrivacyTasks.filter(
    (t) => t.taskType === "psi" && t.status === "success"
  );

  const currentUser = "数据研究院乙";

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchTab = true;
    switch (activeTab) {
      case "created": matchTab = t.createdBy === currentUser; break;
      case "joined": matchTab = t.createdBy !== currentUser; break;
      case "executable": matchTab = t.status === "pending" || t.status === "running"; break;
      case "history": matchTab = t.status === "success" || t.status === "failed"; break;
    }
    return matchSearch && matchTab;
  });

  const handleDelete = (id: string) => {
    if (confirm("确定删除该任务？")) {
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success("任务已删除");
    }
  };

  const handleExecute = (id: string) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, status: "running", trainingProgress: 0 } : t));
    toast.success("模型训练开始");
  };

  const handleCreate = () => {
    if (!createForm.name.trim()) { toast.error("请输入任务名称"); return; }
    if (!createForm.algorithmType) { toast.error("请选择算法类型"); return; }
    if (!createForm.modelName.trim()) { toast.error("请输入模型名称"); return; }
    if (!createForm.dataSource) { toast.error("请选择训练数据源"); return; }
    if (createForm.selectedParties.length < 2) { toast.error("请至少选择2个参与方"); return; }
    
    const fedType = getFederationType(createForm.algorithmType);
    const selectedPSITask = availablePSITasks.find((t) => t.id === createForm.psiTaskId);
    const newTask: PrivacyTask = {
      id: "TASK-FL-" + Date.now().toString(36).toUpperCase(),
      name: createForm.name.trim(),
      projectName: createForm.projectName.trim() || "未命名项目",
      taskType: "modeling",
      algorithmType: createForm.algorithmType,
      participantStatus: "正常",
      status: "pending",
      createdBy: currentUser,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      modelName: createForm.modelName.trim(),
      trainingProgress: 0,
      evaluationMetric: "待训练",
      participantCount: createForm.selectedParties.length,
      federationType: fedType || undefined,
      communicationRounds: parseInt(createForm.communicationRounds) || undefined,
      clientSamplingRate: parseInt(createForm.clientSamplingRate) || undefined,
      privacyBudget: parseFloat(createForm.privacyBudget) || undefined,
      alignmentKey: createForm.alignmentKey || undefined,
      labelParty: createForm.labelParty || undefined,
      gradientProtection: createForm.gradientProtection || undefined,
      psiTaskId: createForm.psiTaskId || undefined,
      psiTaskName: selectedPSITask?.name || undefined,
    };
    setTasks([newTask, ...tasks]);
    setCreateOpen(false);
    setCreateForm({ 
      name: "", projectName: "", description: "", algorithmType: "", modelName: "", participantCount: "2", 
      dataSource: "", selectedParties: [], learningRate: "0.01", epochs: "100", batchSize: "32", featureColumns: [],
      communicationRounds: "100", clientSamplingRate: "80", privacyBudget: "1.0", alignmentKey: "", labelParty: "", gradientProtection: "", psiTaskId: ""
    });
    toast.success("联合建模任务创建成功");
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: PrivacyTask, index: number) => index + 1 },
    {
      key: "name", title: "任务名称",
      render: (row: PrivacyTask) => (
        <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => setDetailTask(row)}>{row.name}</span>
      ),
    },
    { 
      key: "algorithmType", title: "算法类型", 
      render: (row: PrivacyTask) => (
        <div className="flex items-center gap-1">
          {row.federationType && (
            <Badge variant="outline" className={cn(
              "text-[10px] h-4 px-1",
              row.federationType === "horizontal" && "bg-green-50 text-green-700 border-green-200",
              row.federationType === "vertical" && "bg-blue-50 text-blue-700 border-blue-200",
              row.federationType === "traditional" && "bg-gray-50 text-gray-700 border-gray-200",
            )}>
              {row.federationType === "horizontal" ? "横向" : row.federationType === "vertical" ? "纵向" : "传统"}
            </Badge>
          )}
          <span>{row.algorithmType || "--"}</span>
        </div>
      )
    },
    { key: "modelName", title: "模型名称", render: (row: PrivacyTask) => row.modelName || "--" },
    {
      key: "trainingProgress", title: "训练进度",
      render: (row: PrivacyTask) => (
        row.trainingProgress !== undefined ? (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${row.trainingProgress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{row.trainingProgress}%</span>
          </div>
        ) : "--"
      ),
    },
    { key: "evaluationMetric", title: "评估指标", render: (row: PrivacyTask) => <span className="text-xs">{row.evaluationMetric || "--"}</span> },
    {
      key: "status", title: "状态",
      render: (row: PrivacyTask) => {
        const s = statusMap[row.status];
        return (
          <Badge variant={s?.color === "green" ? "default" : s?.color === "red" ? "destructive" : "secondary"}
            className={cn(s?.color === "blue" && "bg-blue-100 text-blue-700", s?.color === "yellow" && "bg-yellow-100 text-yellow-700")}>
            {s?.label || row.status}
          </Badge>
        );
      },
    },
    { key: "createdAt", title: "创建时间", render: (row: PrivacyTask) => <span className="text-gray-500 text-sm">{row.createdAt}</span> },
    {
      key: "actions", title: "操作", width: "w-52",
      render: (row: PrivacyTask) => (
        <ActionButtons buttons={[
          { ...createExecuteAction(() => handleExecute(row.id)), hidden: row.status !== "pending" },
          createViewAction(() => setDetailTask(row)),
          { key: "visual", icon: <BrainCircuit className="w-4 h-4" />, label: "可视化", onClick: () => navigate("/privacy/tasks/modeling/visual") },
          createEditAction(() => toast.info("编辑功能开发中")),
          createHistoryAction(() => navigate(`/privacy/tasks/execution/${row.id}`)),
          createDeleteAction(() => handleDelete(row.id)),
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="联合建模"
        badge={taskTypeLabels["modeling"]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/privacy/tasks/modeling/visual")}>
              <BrainCircuit className="w-4 h-4 mr-2" />可视化建模
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />新建建模任务
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>{tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
        ))}</TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-4 mt-4">
            <PageSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="搜索任务名称..."
              onReset={() => setSearchTerm("")}
            />
            <DataTable data={filteredTasks} columns={columns} rowKey={(row) => row.id} />
          </TabsContent>
        ))}
      </Tabs>

      <TaskDetailDialog
        task={detailTask}
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        modelResult={detailTask ? mockModelResults[detailTask.id] : undefined}
        participants={detailTask ? mockParticipants[detailTask.id] : undefined}
        logs={detailTask ? mockLogs[detailTask.id] : undefined}
        type="modeling"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>新建联合建模任务</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>任务名称 <span className="text-red-500">*</span></Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label>模型名称 <span className="text-red-500">*</span></Label>
              <Input value={createForm.modelName} onChange={(e) => setCreateForm({ ...createForm, modelName: e.target.value })} placeholder="请输入模型名称" />
            </div>

            {/* 算法类型 — 按联邦类型分组 */}
            <div className="space-y-2">
              <Label>算法类型 <span className="text-red-500">*</span></Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={createForm.algorithmType} onChange={(e) => setCreateForm({ ...createForm, algorithmType: e.target.value, alignmentKey: "", labelParty: "" })}>
                <option value="">请选择算法类型</option>
                {algorithmGroups["modeling"]?.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((algo) => (
                      <option key={algo} value={algo}>{algo}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {federationType && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn(
                    "text-xs",
                    federationType === "horizontal" && "bg-green-100 text-green-700",
                    federationType === "vertical" && "bg-blue-100 text-blue-700",
                    federationType === "traditional" && "bg-gray-100 text-gray-700",
                  )}>
                    {federationType === "horizontal" && <><Users className="w-3 h-3 mr-1" />横向联邦</>}
                    {federationType === "vertical" && <><Shield className="w-3 h-3 mr-1" />纵向联邦</>}
                    {federationType === "traditional" && "传统联合建模"}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {federationType === "horizontal" && "各参与方特征相同，样本不同"}
                    {federationType === "vertical" && "各参与方样本相同，特征不同"}
                    {federationType === "traditional" && "安全多方计算实现联合建模"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>训练数据源 <span className="text-red-500">*</span></Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={createForm.dataSource} onChange={(e) => setCreateForm({ ...createForm, dataSource: e.target.value, featureColumns: [] })}>
                <option value="">选择训练数据源</option>
                {mockDataSources.map((ds) => <option key={ds.id} value={ds.id}>{ds.name} ({ds.owner})</option>)}
              </select>
              {selectedDS && <p className="text-xs text-gray-500">字段: {selectedDS.schema.join(", ")} | {selectedDS.rowCount.toLocaleString()} 行</p>}
            </div>
            {selectedDS && (
              <div className="space-y-2">
                <Label>特征列</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDS.schema.map((field) => (
                    <label key={field} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-md border cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={createForm.featureColumns.includes(field)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...createForm.featureColumns, field]
                            : createForm.featureColumns.filter((f) => f !== field);
                          setCreateForm({ ...createForm, featureColumns: next });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>参与方 <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {parties.map((party) => (
                  <label key={party} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-md border cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={createForm.selectedParties.includes(party)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...createForm.selectedParties, party]
                          : createForm.selectedParties.filter((p) => p !== party);
                        setCreateForm({ ...createForm, selectedParties: next });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{party}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 基础训练参数 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>学习率</Label>
                <Input value={createForm.learningRate} onChange={(e) => setCreateForm({ ...createForm, learningRate: e.target.value })} placeholder="0.01" />
              </div>
              <div className="space-y-2">
                <Label>本地迭代轮数</Label>
                <Input type="number" value={createForm.epochs} onChange={(e) => setCreateForm({ ...createForm, epochs: e.target.value })} placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>批次大小</Label>
                <Input type="number" value={createForm.batchSize} onChange={(e) => setCreateForm({ ...createForm, batchSize: e.target.value })} placeholder="32" />
              </div>
            </div>

            {/* 联邦特有配置 */}
            {federationType && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50/50">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  联邦学习配置
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>通信轮数</Label>
                    <Input type="number" value={createForm.communicationRounds} onChange={(e) => setCreateForm({ ...createForm, communicationRounds: e.target.value })} placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>客户端采样率(%)</Label>
                    <Input type="number" min="1" max="100" value={createForm.clientSamplingRate} onChange={(e) => setCreateForm({ ...createForm, clientSamplingRate: e.target.value })} placeholder="80" />
                  </div>
                  <div className="space-y-2">
                    <Label>隐私预算(ε)</Label>
                    <Input type="number" step="0.1" value={createForm.privacyBudget} onChange={(e) => setCreateForm({ ...createForm, privacyBudget: e.target.value })} placeholder="1.0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>梯度保护</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={createForm.gradientProtection} onChange={(e) => setCreateForm({ ...createForm, gradientProtection: e.target.value })}>
                      <option value="">请选择梯度保护方式</option>
                      <option value="差分隐私">差分隐私</option>
                      <option value="安全聚合">安全聚合</option>
                      <option value="同态加密">同态加密</option>
                      <option value="梯度压缩">梯度压缩</option>
                      <option value="无">无</option>
                    </select>
                  </div>
                  
                  {federationType === "vertical" && (
                    <>
                      <div className="space-y-2">
                        <Label>对齐字段 <span className="text-red-500">*</span></Label>
                        <Input value={createForm.alignmentKey} onChange={(e) => setCreateForm({ ...createForm, alignmentKey: e.target.value })} placeholder="如：用户ID" />
                      </div>
                      <div className="space-y-2">
                        <Label>标签方 <span className="text-red-500">*</span></Label>
                        <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={createForm.labelParty} onChange={(e) => setCreateForm({ ...createForm, labelParty: e.target.value })}>
                          <option value="">选择持有标签的参与方</option>
                          {createForm.selectedParties.map((party) => (
                            <option key={party} value={party}>{party}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* PSI 前置联动 - 仅纵向联邦显示 */}
                {federationType === "vertical" && (
                  <div className="border rounded-lg p-4 space-y-3 bg-amber-50/50 border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h5 className="font-medium text-amber-800">隐私求交前置检查</h5>
                    </div>
                    <p className="text-xs text-amber-700">
                      纵向联邦学习需要各参与方样本对齐。请先完成隐私求交（PSI）确保参与方拥有相同的样本ID。
                    </p>
                    
                    <div className="space-y-2">
                      <Label className="text-amber-800">使用已有求交结果</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-md border border-amber-200 bg-white text-sm"
                        value={createForm.psiTaskId} 
                        onChange={(e) => setCreateForm({ ...createForm, psiTaskId: e.target.value })}
                      >
                        <option value="">选择已完成的隐私求交任务</option>
                        {availablePSITasks.length === 0 ? (
                          <option value="" disabled>暂无已完成的 PSI 任务</option>
                        ) : (
                          availablePSITasks.map((psiTask) => (
                            <option key={psiTask.id} value={psiTask.id}>
                              {psiTask.name} ({psiTask.intersectionKey} · {psiTask.participantCount}方 · {psiTask.dataSize})
                            </option>
                          ))
                        )}
                      </select>
                      {createForm.psiTaskId && (
                        <div className="flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          已关联 PSI 任务，样本将对齐后参与训练
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-amber-200" />
                      <span className="text-xs text-amber-600">或</span>
                      <div className="flex-1 h-px bg-amber-200" />
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => {
                        setCreateOpen(false);
                        navigate("/privacy/tasks/psi");
                        toast.info("请先创建隐私求交任务");
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      一键创建隐私求交任务
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>任务描述</Label>
              <Textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="请输入任务描述（可选）" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />创建任务</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
