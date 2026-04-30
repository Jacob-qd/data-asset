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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TaskDetailDialog from "@/components/TaskDetailDialog";
import {
  mockSQLResults, mockParticipants, mockLogs, mockDataSources,
} from "@/data/mock/task-details";

const tabs = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我参与的" },
  { key: "executable", label: "可执行的" },
  { key: "history", label: "执行历史" },
];

export default function SQLTaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PrivacyTask[]>(
    mockPrivacyTasks.filter((t) => t.taskType === "sql")
  );
  const [activeTab, setActiveTab] = useState("created");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailTask, setDetailTask] = useState<PrivacyTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const parties = ["科技公司甲", "数据研究院乙", "智能科技丙", "金融科技丁"];
  const [createForm, setCreateForm] = useState({
    name: "", projectName: "", description: "", sql: "", participantCount: "2",
    selectedTables: [] as string[], selectedParties: [] as string[],
  });

  const currentUser = "智能科技丙";

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

  const selectedTables = mockDataSources.filter((ds) => createForm.selectedTables.includes(ds.id));

  const handleCreate = () => {
    if (!createForm.name.trim()) { toast.error("请输入任务名称"); return; }
    if (!createForm.sql.trim()) { toast.error("请输入SQL语句"); return; }
    if (createForm.selectedParties.length < 2) { toast.error("请至少选择2个参与方"); return; }
    const newTask: PrivacyTask = {
      id: "TASK-SQL-" + Date.now().toString(36).toUpperCase(),
      name: createForm.name.trim(),
      projectName: createForm.projectName.trim() || "未命名项目",
      taskType: "sql",
      participantStatus: "正常",
      status: "pending",
      createdBy: currentUser,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      sqlPreview: createForm.sql.trim().slice(0, 80) + (createForm.sql.length > 80 ? "..." : ""),
      participantCount: createForm.selectedParties.length,
    };
    setTasks([newTask, ...tasks]);
    setCreateOpen(false);
    setCreateForm({ name: "", projectName: "", description: "", sql: "", participantCount: "2", selectedTables: [], selectedParties: [] });
    toast.success("联合SQL任务创建成功");
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
      key: "sqlPreview", title: "SQL预览",
      render: (row: PrivacyTask) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate max-w-[250px]">{row.sqlPreview || "--"}</code>
      ),
    },
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
        title="联合SQL"
        badge={taskTypeLabels["sql"]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />新建SQL任务
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
        sqlResult={detailTask ? mockSQLResults[detailTask.id] : undefined}
        participants={detailTask ? mockParticipants[detailTask.id] : undefined}
        logs={detailTask ? mockLogs[detailTask.id] : undefined}
        type="sql"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>新建联合SQL任务</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>任务名称 <span className="text-red-500">*</span></Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label>选择数据表</Label>
              <div className="flex flex-wrap gap-2">
                {mockDataSources.map((ds) => (
                  <label key={ds.id} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-md border cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={createForm.selectedTables.includes(ds.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...createForm.selectedTables, ds.id]
                          : createForm.selectedTables.filter((id) => id !== ds.id);
                        setCreateForm({ ...createForm, selectedTables: next });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{ds.name}</span>
                  </label>
                ))}
              </div>
              {selectedTables.length > 0 && (
                <div className="text-xs text-gray-500 space-y-1">
                  {selectedTables.map((ds) => (
                    <div key={ds.id}>{ds.name}: {ds.schema.join(", ")} ({ds.rowCount.toLocaleString()} 行)</div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>SQL语句 <span className="text-red-500">*</span></Label>
              <Textarea
                value={createForm.sql}
                onChange={(e) => setCreateForm({ ...createForm, sql: e.target.value })}
                placeholder="请输入SQL查询语句，如：&#10;SELECT a.user_id, SUM(b.amount) &#10;FROM party_a.users a &#10;JOIN party_b.transactions b ON a.user_id = b.user_id &#10;WHERE a.age > 18 &#10;GROUP BY a.user_id"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
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
