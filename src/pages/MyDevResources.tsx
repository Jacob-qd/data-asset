import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import {
  Search,
  Clock,
  Settings,
  RotateCcw,
  Eye,
  Trash2,
  CheckCircle,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSandboxEnvs, type SandboxEnv } from "@/data/mock/sandbox-envs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MyDevResources() {
  const [envs, setEnvs] = useState<SandboxEnv[]>(mockSandboxEnvs);
  const [searchTerm, setSearchTerm] = useState("");
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<SandboxEnv | null>(null);
  const [sampleMethod, setSampleMethod] = useState("random");
  const [sampleCount, setSampleCount] = useState("1000");

  const filteredEnvs = envs.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExtend = (id: string) => {
    toast.success("已延长空间使用期限");
  };

  const handleRelease = (id: string) => {
    setEnvs(envs.map((e) => e.id === id ? { ...e, runStatus: "已关闭" } : e));
    toast.success("空间已释放");
  };

  const handleOpenSampleDialog = (env: SandboxEnv) => {
    setSelectedEnv(env);
    setSampleDialogOpen(true);
  };

  const handleExtractSample = () => {
    if (selectedEnv) {
      toast.success(`已从 ${selectedEnv.name} 抽取 ${sampleCount} 条样本数据（${sampleMethod === "random" ? "随机抽样" : sampleMethod === "stratified" ? "分层抽样" : "系统抽样"}）`);
      setSampleDialogOpen(false);
      setSelectedEnv(null);
    }
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    "运行中": { label: "运行中", color: "text-green-700", bg: "bg-green-50" },
    "待续": { label: "待续", color: "text-yellow-700", bg: "bg-yellow-50" },
    "已关闭": { label: "已关闭", color: "text-gray-700", bg: "bg-gray-50" },
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: SandboxEnv, index: number) => index + 1 },
    { key: "name", title: "开发空间名称" },
    {
      key: "projectName",
      title: "所属应用场景",
      render: (row: SandboxEnv) => <span className="text-indigo-600">{row.projectName}</span>,
    },
    {
      key: "envType",
      title: "环境类型",
      render: (row: SandboxEnv) => (
        <Badge variant={row.envType === "生产环境" ? "default" : "secondary"}>{row.envType}</Badge>
      ),
    },
    {
      key: "createdAt",
      title: "空间开启时间",
      render: (row: SandboxEnv) => <span className="text-gray-500 text-sm">{row.createdAt}</span>,
    },
    {
      key: "expireAt",
      title: "空间到期时间",
      render: () => <span className="text-gray-500 text-sm">2026-12-31 23:59:59</span>,
    },
    {
      key: "runStatus",
      title: "空间状态",
      render: (row: SandboxEnv) => {
        const config = statusConfig[row.runStatus];
        return config ? (
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs w-fit", config.bg)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", row.runStatus === "运行中" ? "bg-green-500" : row.runStatus === "待续" ? "bg-yellow-500" : "bg-gray-400")} />
            <span className={config.color}>{config.label}</span>
          </div>
        ) : row.runStatus;
      },
    },
    {
      key: "actions",
      title: "操作",
      width: "w-64",
      render: (row: SandboxEnv) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <CheckCircle className="w-4 h-4" />
            审核
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
            详情
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExtend(row.id)}>
            <Clock className="w-4 h-4" />
            延期
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
            变更
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenSampleDialog(row)}>
            <Database className="w-4 h-4" />
            抽取样本
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleRelease(row.id)}>
            <Trash2 className="w-4 h-4" />
            释放
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的开发资源</h1>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索开发空间名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">查询</Button>
        <Button variant="ghost" size="sm">重置</Button>
      </div>

      <DataTable
        data={filteredEnvs}
        columns={columns}
        rowKey={(row) => row.id}
      />

      {/* 抽取样本数据对话框 */}
      <Dialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>抽取样本数据</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>开发空间</Label>
              <div className="text-sm font-medium">{selectedEnv?.name}</div>
            </div>
            <div className="space-y-2">
              <Label>抽样方式</Label>
              <Select value={sampleMethod} onValueChange={setSampleMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="选择抽样方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">随机抽样</SelectItem>
                  <SelectItem value="stratified">分层抽样</SelectItem>
                  <SelectItem value="system">系统抽样</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>抽样数量</Label>
              <Input
                type="number"
                value={sampleCount}
                onChange={(e) => setSampleCount(e.target.value)}
                placeholder="请输入抽样数量"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
              提示：抽样结果将存储在当前开发空间的样本库中，可用于后续模型训练。
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSampleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleExtractSample}>
              <Database className="w-4 h-4 mr-2" />
              开始抽取
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
