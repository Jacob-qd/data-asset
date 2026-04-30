import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import {
  ArrowRight, BarChart3, BrainCircuit,
  Eye as EyeIcon, Search as SearchIcon, Terminal, Database,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";
import {
  mockPrivacyTasks, taskTypeLabels, taskTypePaths, statusMap, type PrivacyTask,
} from "@/data/mock/privacy-tasks";
import { cn } from "@/lib/utils";

export default function PrivacyTaskCenter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const typeStats = [
    { type: "psi", label: "隐私求交", count: mockPrivacyTasks.filter((t) => t.taskType === "psi").length, icon: <EyeIcon className="w-5 h-5" />, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { type: "pir", label: "隐匿查询", count: mockPrivacyTasks.filter((t) => t.taskType === "pir").length, icon: <SearchIcon className="w-5 h-5" />, color: "bg-green-50 text-green-700 border-green-200" },
    { type: "stats", label: "联合统计", count: mockPrivacyTasks.filter((t) => t.taskType === "stats").length, icon: <BarChart3 className="w-5 h-5" />, color: "bg-purple-50 text-purple-700 border-purple-200" },
    { type: "sql", label: "联合SQL", count: mockPrivacyTasks.filter((t) => t.taskType === "sql").length, icon: <Terminal className="w-5 h-5" />, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { type: "modeling", label: "联合建模", count: mockPrivacyTasks.filter((t) => t.taskType === "modeling").length, icon: <BrainCircuit className="w-5 h-5" />, color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  const totalTasks = mockPrivacyTasks.length;
  const runningTasks = mockPrivacyTasks.filter((t) => t.status === "running").length;
  const successTasks = mockPrivacyTasks.filter((t) => t.status === "success").length;
  const failedTasks = mockPrivacyTasks.filter((t) => t.status === "failed").length;

  const recentTasks = [...mockPrivacyTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const filteredRecent = recentTasks.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: PrivacyTask, index: number) => index + 1 },
    {
      key: "name", title: "任务名称",
      render: (row: PrivacyTask) => (
        <span className="text-indigo-600 font-medium">{row.name}</span>
      ),
    },
    {
      key: "taskType", title: "任务类型",
      render: (row: PrivacyTask) => (
        <Badge variant="outline" className="text-xs">{taskTypeLabels[row.taskType] || row.taskType}</Badge>
      ),
    },
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
    { key: "createdBy", title: "创建人", render: (row: PrivacyTask) => <span className="text-sm">{row.createdBy}</span> },
    { key: "createdAt", title: "创建时间", render: (row: PrivacyTask) => <span className="text-gray-500 text-sm">{row.createdAt}</span> },
    {
      key: "actions", title: "操作", width: "w-24",
      render: (row: PrivacyTask) => (
        <ActionButtons buttons={[
          { key: "enter", icon: <ArrowRight className="w-4 h-4" />, label: "进入", onClick: () => navigate(taskTypePaths[row.taskType]) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="隐私计算任务中心"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/privacy/models")}>
            <Database className="w-4 h-4 mr-2" />模型管理
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="text-sm text-gray-500">总任务数</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{runningTasks}</div>
            <div className="text-sm text-gray-500">执行中</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{successTasks}</div>
            <div className="text-sm text-gray-500">执行成功</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{failedTasks}</div>
            <div className="text-sm text-gray-500">执行失败</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">快速入口</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {typeStats.map((stat) => (
              <button
                key={stat.type}
                onClick={() => navigate(taskTypePaths[stat.type])}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md",
                  stat.color
                )}
              >
                {stat.icon}
                <span className="font-medium text-sm">{stat.label}</span>
                <span className="text-xs opacity-70">{stat.count} 个任务</span>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span>进入</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">最近任务</CardTitle>
        </CardHeader>
        <CardContent>
          <PageSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="搜索任务名称..."
            onReset={() => setSearchTerm("")}
          />
          <DataTable
            data={filteredRecent}
            columns={columns}
            rowKey={(row) => row.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
