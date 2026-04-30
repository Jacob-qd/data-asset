import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction, createExecuteAction, createHistoryAction } from "@/components/ActionButtons";
import {
  mockPrivacyTasks, taskTypeLabels, statusMap, type PrivacyTask,
} from "@/data/mock/privacy-tasks";
import { mockParticipants, mockLogs, mockPSIResults, mockDataSources } from "@/data/mock/task-details";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TaskDetailDialog from "@/components/TaskDetailDialog";

const tabs = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我参与的" },
  { key: "executable", label: "可执行的" },
  { key: "history", label: "执行历史" },
];

export default function PSITaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PrivacyTask[]>(
    mockPrivacyTasks.filter((t) => t.taskType === "psi")
  );
  const [activeTab, setActiveTab] = useState("created");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailTask, setDetailTask] = useState<PrivacyTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", projectName: "", description: "", intersectionKey: "", participantCount: "2",
    dataSourceA: "", dataSourceB: "",
  });

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
    setTasks(tasks.map((t) => t.id === id ? { ...t, status: "running" } : t));
    toast.success("任务开始执行");
  };

  const selectedSourceA = mockDataSources.find((ds) => ds.id === createForm.dataSourceA);
  const selectedSourceB = mockDataSources.find((ds) => ds.id === createForm.dataSourceB);
  const commonSchema = selectedSourceA && selectedSourceB
    ? selectedSourceA.schema.filter((field) => selectedSourceB.schema.includes(field))
    : [];

  const handleCreate = () => {
    if (!createForm.name.trim()) { toast.error("请输入任务名称"); return; }
    if (!createForm.dataSourceA || !createForm.dataSourceB) { toast.error("请选择双方数据源"); return; }
    if (createForm.dataSourceA === createForm.dataSourceB) { toast.error("双方数据源不能相同"); return; }
    if (!createForm.intersectionKey) { toast.error("请选择求交键"); return; }
    const newTask: PrivacyTask = {
      id: "TASK-PSI-" + Date.now().toString(36).toUpperCase(),
      name: createForm.name.trim(),
      projectName: createForm.projectName.trim() || "未命名项目",
      taskType: "psi",
      participantStatus: "正常",
      status: "pending",
      createdBy: currentUser,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      intersectionKey: createForm.intersectionKey,
      participantCount: parseInt(createForm.participantCount) || 2,
      dataSize: "待执行",
    };
    setTasks([newTask, ...tasks]);
    setCreateOpen(false);
    setCreateForm({ name: "", projectName: "", description: "", intersectionKey: "", participantCount: "2", dataSourceA: "", dataSourceB: "" });
    toast.success("隐私求交任务创建成功");
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: PrivacyTask, index: number) => index + 1 },
    {
      key: "name", title: "任务名称",
      render: (row: PrivacyTask) => (
        <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => setDetailTask(row)}>{row.name}</span>
      ),
    },
    { key: "intersectionKey", title: "求交键", render: (row: PrivacyTask) => row.intersectionKey || "--" },
    { key: "participantCount", title: "参与方", render: (row: PrivacyTask) => <span>{row.participantCount || 2} 方</span> },
    { key: "dataSize", title: "数据量级", render: (row: PrivacyTask) => row.dataSize || "--" },
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
      key: "actions", title: "操作", width: "w-48",
      render: (row: PrivacyTask) => (
        <ActionButtons buttons={[
          { ...createExecuteAction(() => handleExecute(row.id)), hidden: row.status !== "pending" },
          createViewAction(() => setDetailTask(row)),
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
        title="隐私求交 (PSI)"
        badge={taskTypeLabels["psi"]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />新建求交任务
          </Button>
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
        participants={detailTask ? mockParticipants[detailTask.id] : undefined}
        logs={detailTask ? mockLogs[detailTask.id] : undefined}
        psiResult={detailTask ? mockPSIResults[detailTask.id] : undefined}
        type="psi"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新建隐私求交任务</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>任务名称 <span className="text-red-500">*</span></Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label>所属项目</Label>
              <Input value={createForm.projectName} onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })} placeholder="请输入项目名称" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>数据源A <span className="text-red-500">*</span></Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={createForm.dataSourceA} onChange={(e) => setCreateForm({ ...createForm, dataSourceA: e.target.value, intersectionKey: "" })}>
                  <option value="">选择数据源A</option>
                  {mockDataSources.map((ds) => <option key={ds.id} value={ds.id}>{ds.name} ({ds.owner})</option>)}
                </select>
                {selectedSourceA && <p className="text-xs text-gray-500">字段: {selectedSourceA.schema.join(", ")}</p>}
              </div>
              <div className="space-y-2">
                <Label>数据源B <span className="text-red-500">*</span></Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={createForm.dataSourceB} onChange={(e) => setCreateForm({ ...createForm, dataSourceB: e.target.value, intersectionKey: "" })}>
                  <option value="">选择数据源B</option>
                  {mockDataSources.map((ds) => <option key={ds.id} value={ds.id}>{ds.name} ({ds.owner})</option>)}
                </select>
                {selectedSourceB && <p className="text-xs text-gray-500">字段: {selectedSourceB.schema.join(", ")}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>求交键字段 <span className="text-red-500">*</span></Label>
              {commonSchema.length > 0 ? (
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={createForm.intersectionKey} onChange={(e) => setCreateForm({ ...createForm, intersectionKey: e.target.value })}>
                  <option value="">选择共有字段作为求交键</option>
                  {commonSchema.map((field) => <option key={field} value={field}>{field}</option>)}
                </select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-500">
                  {createForm.dataSourceA && createForm.dataSourceB
                    ? "所选数据源无共有字段，请更换数据源"
                    : "请先选择双方数据源"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>参与方数量</Label>
              <Input type="number" min="2" value={createForm.participantCount} onChange={(e) => setCreateForm({ ...createForm, participantCount: e.target.value })} />
            </div>
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
