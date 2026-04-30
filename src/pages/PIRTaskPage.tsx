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
  mockPrivacyTasks, taskTypeLabels, statusMap, queryTypeOptions, type PrivacyTask,
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
  mockPIRResults, mockParticipants, mockLogs, mockDataSources,
} from "@/data/mock/task-details";

const tabs = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我参与的" },
  { key: "executable", label: "可执行的" },
  { key: "history", label: "执行历史" },
];

export default function PIRTaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PrivacyTask[]>(
    mockPrivacyTasks.filter((t) => t.taskType === "pir")
  );
  const [activeTab, setActiveTab] = useState("created");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailTask, setDetailTask] = useState<PrivacyTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const parties = ["科技公司甲", "数据研究院乙", "智能科技丙", "金融科技丁"];
  const [createForm, setCreateForm] = useState({
    name: "", projectName: "", description: "", queryType: "", queryParty: "", targetParty: "", queryCondition: "", targetDataSource: "",
  });

  const currentUser = "科技公司甲";

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

  const targetDataSources = mockDataSources.filter((ds) => ds.owner === createForm.targetParty);

  const handleCreate = () => {
    if (!createForm.name.trim()) { toast.error("请输入任务名称"); return; }
    if (!createForm.queryType) { toast.error("请选择查询类型"); return; }
    if (!createForm.queryParty) { toast.error("请选择查询方"); return; }
    if (!createForm.targetParty) { toast.error("请选择被查询方"); return; }
    if (createForm.queryParty === createForm.targetParty) { toast.error("查询方与被查询方不能相同"); return; }
    if (!createForm.targetDataSource) { toast.error("请选择被查询数据源"); return; }
    const newTask: PrivacyTask = {
      id: "TASK-PIR-" + Date.now().toString(36).toUpperCase(),
      name: createForm.name.trim(),
      projectName: createForm.projectName.trim() || "未命名项目",
      taskType: "pir",
      participantStatus: "正常",
      status: "pending",
      createdBy: currentUser,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      queryType: createForm.queryType,
      targetParty: createForm.targetParty,
      queryCondition: createForm.queryCondition || "",
    };
    setTasks([newTask, ...tasks]);
    setCreateOpen(false);
    setCreateForm({ name: "", projectName: "", description: "", queryType: "", queryParty: "", targetParty: "", queryCondition: "", targetDataSource: "" });
    toast.success("隐匿查询任务创建成功");
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: PrivacyTask, index: number) => index + 1 },
    {
      key: "name", title: "任务名称",
      render: (row: PrivacyTask) => (
        <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => setDetailTask(row)}>{row.name}</span>
      ),
    },
    { key: "queryType", title: "查询类型", render: (row: PrivacyTask) => row.queryType || "--" },
    { key: "targetParty", title: "被查询方", render: (row: PrivacyTask) => row.targetParty || "--" },
    { key: "queryCondition", title: "查询条件", render: (row: PrivacyTask) => <span className="truncate max-w-[150px] inline-block">{row.queryCondition || "--"}</span> },
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
        title="隐匿查询 (PIR)"
        badge={taskTypeLabels["pir"]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />新建查询任务
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
        pirResult={detailTask ? mockPIRResults[detailTask.id] : undefined}
        participants={detailTask ? mockParticipants[detailTask.id] : undefined}
        logs={detailTask ? mockLogs[detailTask.id] : undefined}
        type="pir"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新建隐匿查询任务</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>任务名称 <span className="text-red-500">*</span></Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label>查询类型 <span className="text-red-500">*</span></Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={createForm.queryType} onChange={(e) => setCreateForm({ ...createForm, queryType: e.target.value })}>
                <option value="">请选择查询类型</option>
                {queryTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>查询方 <span className="text-red-500">*</span></Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={createForm.queryParty} onChange={(e) => setCreateForm({ ...createForm, queryParty: e.target.value, targetParty: "", targetDataSource: "" })}>
                  <option value="">选择查询方</option>
                  {parties.filter((p) => p !== createForm.targetParty).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>被查询方 <span className="text-red-500">*</span></Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={createForm.targetParty} onChange={(e) => setCreateForm({ ...createForm, targetParty: e.target.value, targetDataSource: "" })}>
                  <option value="">选择被查询方</option>
                  {parties.filter((p) => p !== createForm.queryParty).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {createForm.targetParty && (
              <div className="space-y-2">
                <Label>被查询数据源 <span className="text-red-500">*</span></Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={createForm.targetDataSource} onChange={(e) => setCreateForm({ ...createForm, targetDataSource: e.target.value })}>
                  <option value="">选择数据源</option>
                  {targetDataSources.map((ds) => <option key={ds.id} value={ds.id}>{ds.name} ({ds.rowCount.toLocaleString()} 行)</option>)}
                </select>
                {createForm.targetDataSource && targetDataSources.find((ds) => ds.id === createForm.targetDataSource) && (
                  <p className="text-xs text-gray-500">可用字段: {targetDataSources.find((ds) => ds.id === createForm.targetDataSource)?.schema.join(", ")}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>查询条件</Label>
              <Textarea value={createForm.queryCondition} onChange={(e) => setCreateForm({ ...createForm, queryCondition: e.target.value })} placeholder="请输入查询条件，如：用户ID = 'U123456' 或 信用分 BETWEEN 600 AND 800" rows={3} />
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
