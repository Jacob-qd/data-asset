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
  mockPrivacyTasks, taskTypeLabels, statusMap, statTypeOptions, type PrivacyTask,
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
  mockStatsResults, mockParticipants, mockLogs, mockDataSources,
} from "@/data/mock/task-details";

const tabs = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我参与的" },
  { key: "executable", label: "可执行的" },
  { key: "history", label: "执行历史" },
];

export default function StatsTaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PrivacyTask[]>(
    mockPrivacyTasks.filter((t) => t.taskType === "stats")
  );
  const [activeTab, setActiveTab] = useState("created");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailTask, setDetailTask] = useState<PrivacyTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const parties = ["科技公司甲", "数据研究院乙", "智能科技丙", "金融科技丁"];
  const [createForm, setCreateForm] = useState({
    name: "", projectName: "", description: "", statType: "", statDimensions: "", participantCount: "2",
    dataSource: "", selectedParties: [] as string[],
  });
  const selectedDS = mockDataSources.find((ds) => ds.id === createForm.dataSource);

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

  const handleCreate = () => {
    if (!createForm.name.trim()) { toast.error("请输入任务名称"); return; }
    if (!createForm.dataSource) { toast.error("请选择数据源"); return; }
    if (!createForm.statType) { toast.error("请选择统计类型"); return; }
    if (createForm.selectedParties.length < 2) { toast.error("请至少选择2个参与方"); return; }
    const newTask: PrivacyTask = {
      id: "TASK-STATS-" + Date.now().toString(36).toUpperCase(),
      name: createForm.name.trim(),
      projectName: createForm.projectName.trim() || "未命名项目",
      taskType: "stats",
      participantStatus: "正常",
      status: "pending",
      createdBy: currentUser,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      statType: createForm.statType,
      statDimensions: createForm.statDimensions || "",
      participantCount: createForm.selectedParties.length,
    };
    setTasks([newTask, ...tasks]);
    setCreateOpen(false);
    setCreateForm({ name: "", projectName: "", description: "", statType: "", statDimensions: "", participantCount: "2", dataSource: "", selectedParties: [] });
    toast.success("联合统计任务创建成功");
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: PrivacyTask, index: number) => index + 1 },
    {
      key: "name", title: "任务名称",
      render: (row: PrivacyTask) => (
        <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => setDetailTask(row)}>{row.name}</span>
      ),
    },
    { key: "statType", title: "统计类型", render: (row: PrivacyTask) => row.statType || "--" },
    { key: "statDimensions", title: "统计维度", render: (row: PrivacyTask) => row.statDimensions || "--" },
    { key: "participantCount", title: "参与方", render: (row: PrivacyTask) => <span>{row.participantCount || 2} 方</span> },
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
        title="联合统计"
        badge={taskTypeLabels["stats"]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />新建统计任务
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
        statsResult={detailTask ? mockStatsResults[detailTask.id] : undefined}
        participants={detailTask ? mockParticipants[detailTask.id] : undefined}
        logs={detailTask ? mockLogs[detailTask.id] : undefined}
        type="stats"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新建联合统计任务</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>任务名称 <span className="text-red-500">*</span></Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label>数据源 <span className="text-red-500">*</span></Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={createForm.dataSource} onChange={(e) => setCreateForm({ ...createForm, dataSource: e.target.value, statDimensions: "" })}
              >
                <option value="">选择要统计的数据源</option>
                {mockDataSources.map((ds) => <option key={ds.id} value={ds.id}>{ds.name} ({ds.owner})</option>)}
              </select>
              {selectedDS && <p className="text-xs text-gray-500">字段: {selectedDS.schema.join(", ")} | {selectedDS.rowCount.toLocaleString()} 行</p>}
            </div>
            <div className="space-y-2">
              <Label>统计类型 <span className="text-red-500">*</span></Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={createForm.statType} onChange={(e) => setCreateForm({ ...createForm, statType: e.target.value })}>
                <option value="">请选择统计类型</option>
                {statTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {selectedDS && (
              <div className="space-y-2">
                <Label>统计维度</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDS.schema.map((field) => (
                    <label key={field} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-md border cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={createForm.statDimensions.split(",").map((s) => s.trim()).includes(field)}
                        onChange={(e) => {
                          const current = createForm.statDimensions.split(",").map((s) => s.trim()).filter(Boolean);
                          const next = e.target.checked ? [...current, field] : current.filter((f) => f !== field);
                          setCreateForm({ ...createForm, statDimensions: next.join(", ") });
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
