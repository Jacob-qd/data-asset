import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Pause,
  History,
  Save,
  Play,
  Settings,
} from "lucide-react";
import { mockPrivacyTasks, taskTypeLabels, type PrivacyTask } from "@/data/mock/privacy-tasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const taskTypes = [
  { key: "psi", label: "隐私求交", icon: "🔒" },
  { key: "pir", label: "隐匿查询", icon: "🔍" },
  { key: "stats", label: "联合统计", icon: "📊" },
  { key: "sql", label: "联合SQL", icon: "🗄️" },
  { key: "modeling", label: "联合建模", icon: "🧠" },
];

const tabs = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我参与的" },
  { key: "executable", label: "可执行的" },
  { key: "history", label: "执行历史" },
];

export default function PrivacyTaskCenter() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [tasks, setTasks] = useState<PrivacyTask[]>(mockPrivacyTasks);
  const [activeType, setActiveType] = useState(type || "modeling");
  const [activeTab, setActiveTab] = useState("created");
  const [searchTerm, setSearchTerm] = useState("");

  const currentType = taskTypes.find((t) => t.key === activeType) || taskTypes[4];

  const filteredTasks = tasks.filter((t) => {
    const matchType = t.taskType === activeType;
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success("任务已删除");
  };

  const handleFreeze = (id: string) => {
    toast.success("任务已冻结");
  };

  const handleSaveAsTemplate = (task: PrivacyTask) => {
    const templateName = prompt("请输入模板名称:", `${task.name}-模板`);
    if (templateName) {
      toast.success(`任务"${task.name}"已另存为模板"${templateName}"`);
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    success: { label: "执行成功", color: "green" },
    running: { label: "执行中", color: "blue" },
    failed: { label: "执行失败", color: "red" },
    pending: { label: "待执行", color: "yellow" },
  };

  const columns = [
    { key: "index", title: "序号", width: "w-20", render: (_row: PrivacyTask, index: number) => index + 1 },
    {
      key: "name",
      title: "任务名称",
      render: (row: PrivacyTask) => (
        <span className="text-indigo-600 cursor-pointer hover:underline">{row.name}</span>
      ),
    },
    {
      key: "businessTag",
      title: "业务标签",
      render: (row: PrivacyTask) => row.businessTag ? <Badge variant="secondary">{row.businessTag}</Badge> : "--",
    },
    {
      key: "algorithmType",
      title: "算法类型",
      render: (row: PrivacyTask) => row.algorithmType || "--",
    },
    {
      key: "participantStatus",
      title: "参与状态",
      render: (row: PrivacyTask) => (
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", row.participantStatus === "正常" ? "bg-green-500" : "bg-red-500")} />
          <span>{row.participantStatus}</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      width: "w-48",
      render: (row: PrivacyTask) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleFreeze(row.id)}>
            <Pause className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/privacy/tasks/execution/${row.id}`)}>
            <History className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleSaveAsTemplate(row)}>
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(row.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">隐私计算任务中心</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            模板管理
          </Button>
          <Button onClick={() => toast.info("新建任务功能开发中")}>
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      {/* Task Type Selector */}
      <div className="flex gap-2 bg-white p-2 rounded-lg border">
        {taskTypes.map((t) => (
          <Button
            key={t.key}
            variant={activeType === t.key ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex-1",
              activeType === t.key && "bg-indigo-600 hover:bg-indigo-700"
            )}
            onClick={() => {
              setActiveType(t.key);
              navigate(`/privacy/tasks/${t.key}`);
            }}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Sub Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索任务名称或ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">查询</Button>
        <Button variant="ghost" size="sm">重置</Button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("批量删除功能开发中")}>
            批量删除
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          🔄
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredTasks}
        columns={columns}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
