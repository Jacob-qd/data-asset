import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";
import {
  Clock,
  Settings,
  Eye,
  Trash2,
  CheckCircle,
  Database,
  XCircle,
  FileText,
  Calendar,
  Cpu,
  HardDrive,
  MemoryStick,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSandboxEnvs, type SandboxEnv } from "@/data/mock/sandbox-envs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MyDevResources() {
  const [envs, setEnvs] = useState<SandboxEnv[]>(mockSandboxEnvs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<SandboxEnv | null>(null);

  // 对话框状态
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [sampleMethod, setSampleMethod] = useState("random");
  const [sampleCount, setSampleCount] = useState("1000");

  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [changeConfig, setChangeConfig] = useState({ cpu: "2", memory: "2", storage: "2" });

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditOpinion, setAuditOpinion] = useState("");
  const [auditResult, setAuditResult] = useState<"pass" | "reject" | null>(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extendDays, setExtendDays] = useState("30");

  const filteredEnvs = envs.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.projectName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 审核
  const handleOpenAuditDialog = (env: SandboxEnv) => {
    setSelectedEnv(env);
    setAuditOpinion("");
    setAuditResult(null);
    setAuditDialogOpen(true);
  };

  const handleAudit = () => {
    if (!auditResult) {
      toast.error("请选择审核结果");
      return;
    }
    if (!auditOpinion.trim()) {
      toast.error("请填写审核意见");
      return;
    }
    
    if (selectedEnv) {
      if (auditResult === "pass") {
        setEnvs(envs.map((e) => e.id === selectedEnv.id ? { ...e, runStatus: "运行中" } : e));
        toast.success("已审核通过：" + selectedEnv.name);
      } else {
        setEnvs(envs.map((e) => e.id === selectedEnv.id ? { ...e, runStatus: "待续" } : e));
        toast.error("已驳回：" + selectedEnv.name);
      }
      setAuditDialogOpen(false);
    }
  };

  // 详情
  const handleOpenDetailDialog = (env: SandboxEnv) => {
    setSelectedEnv(env);
    setDetailDialogOpen(true);
  };

  // 延期
  const handleOpenExtendDialog = (env: SandboxEnv) => {
    setSelectedEnv(env);
    setExtendDays("30");
    setExtendDialogOpen(true);
  };

  const handleExtend = () => {
    if (selectedEnv) {
      const days = parseInt(extendDays);
      toast.success("已将 " + selectedEnv.name + " 延期 " + days + " 天");
      setExtendDialogOpen(false);
    }
  };

  // 变更
  const handleOpenChangeDialog = (env: SandboxEnv) => {
    setSelectedEnv(env);
    const config = (env.envConfig || "2C | 2GB | 2GB").split(" | ");
    setChangeConfig({
      cpu: config[0]?.replace("C", "") || "2",
      memory: config[1]?.replace("GB", "") || "2",
      storage: config[2]?.replace("GB", "") || "2",
    });
    setChangeDialogOpen(true);
  };

  const handleChangeConfig = () => {
    if (selectedEnv) {
      const newConfig = changeConfig.cpu + "C | " + changeConfig.memory + "GB | " + changeConfig.storage + "GB";
      setEnvs(envs.map((e) => e.id === selectedEnv.id ? { ...e, envConfig: newConfig } : e));
      toast.success("已更新 " + selectedEnv.name + " 的资源配置");
      setChangeDialogOpen(false);
    }
  };

  // 抽样
  const handleOpenSampleDialog = (env: SandboxEnv) => {
    setSelectedEnv(env);
    setSampleDialogOpen(true);
  };

  const handleExtractSample = () => {
    if (selectedEnv) {
      const methodText = sampleMethod === "random" ? "随机抽样" : sampleMethod === "stratified" ? "分层抽样" : "系统抽样";
      toast.success("已从 " + selectedEnv.name + " 抽取 " + sampleCount + " 条样本数据（" + methodText + "）");
      setSampleDialogOpen(false);
      setSelectedEnv(null);
    }
  };

  // 释放
  const handleRelease = (id: string) => {
    setEnvs(envs.map((e) => e.id === id ? { ...e, runStatus: "已关闭" } : e));
    toast.success("空间已释放");
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
      key: "envConfig",
      title: "资源配置",
      render: (row: SandboxEnv) => (
        <div className="text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="bg-blue-50 px-1.5 py-0.5 rounded">{row.envConfig}</span>
          </div>
          {row.deployType && (
            <div className="mt-1 text-gray-400">{row.deployType}</div>
          )}
        </div>
      ),
    },
    {
      key: "runStatus",
      title: "空间状态",
      render: (row: SandboxEnv) => {
        const config = statusConfig[row.runStatus || ""];
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
      width: "w-80",
      render: (row: SandboxEnv) => (
        <ActionButtons
          buttons={[
            { key: "audit", icon: <CheckCircle className="w-4 h-4" />, label: "审核", onClick: () => handleOpenAuditDialog(row) },
            { key: "detail", icon: <Eye className="w-4 h-4" />, label: "详情", onClick: () => handleOpenDetailDialog(row) },
            { key: "extend", icon: <Clock className="w-4 h-4" />, label: "延期", onClick: () => handleOpenExtendDialog(row) },
            { key: "change", icon: <Settings className="w-4 h-4" />, label: "变更", onClick: () => handleOpenChangeDialog(row) },
            { key: "sample", icon: <Database className="w-4 h-4" />, label: "抽样", onClick: () => handleOpenSampleDialog(row) },
            { key: "release", icon: <Trash2 className="w-4 h-4" />, label: "释放", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleRelease(row.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="资源审批" />

      <PageSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="搜索开发空间名称..."
        onReset={() => setSearchTerm("")}
      />

      <DataTable
        data={filteredEnvs}
        columns={columns}
        rowKey={(row) => row.id}
      />

      {/* 审核对话框 */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>审核开发空间</DialogTitle>
            <DialogDescription>
              审核开发空间：{selectedEnv?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>审核结果 *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={auditResult === "pass" ? "default" : "outline"}
                  className="flex-1 gap-1"
                  onClick={() => setAuditResult("pass")}
                >
                  <CheckCircle className="w-4 h-4" />
                  通过
                </Button>
                <Button
                  type="button"
                  variant={auditResult === "reject" ? "destructive" : "outline"}
                  className="flex-1 gap-1"
                  onClick={() => setAuditResult("reject")}
                >
                  <XCircle className="w-4 h-4" />
                  驳回
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>审核意见 *</Label>
              <Textarea
                value={auditOpinion}
                onChange={(e) => setAuditOpinion(e.target.value)}
                placeholder="请输入审核意见..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAudit}>
              <CheckCircle className="w-4 h-4 mr-2" />
              确认审核
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              开发空间详情
            </DialogTitle>
          </DialogHeader>
          {selectedEnv && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">开发空间名称</Label>
                  <div className="text-sm font-medium">{selectedEnv.name}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">所属应用场景</Label>
                  <div className="text-sm font-medium text-indigo-600">{selectedEnv.projectName}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">环境类型</Label>
                  <div>
                    <Badge variant={selectedEnv.envType === "生产环境" ? "default" : "secondary"}>
                      {selectedEnv.envType}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">运行状态</Label>
                  <div>
                    <Badge variant={selectedEnv.runStatus === "运行中" ? "default" : "secondary"} className={cn(
                      selectedEnv.runStatus === "运行中" && "bg-green-50 text-green-700 hover:bg-green-50",
                      selectedEnv.runStatus === "待续" && "bg-yellow-50 text-yellow-700 hover:bg-yellow-50",
                      selectedEnv.runStatus === "已关闭" && "bg-gray-50 text-gray-700 hover:bg-gray-50",
                    )}>
                      {selectedEnv.runStatus}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">数据提供方</Label>
                  <div className="text-sm">{selectedEnv.dataProvider}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">部署类型</Label>
                  <div className="text-sm">{selectedEnv.deployType || "-"}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">部署状态</Label>
                  <div className="text-sm">{selectedEnv.deployStatus || "-"}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">开发状态</Label>
                  <div className="text-sm">{selectedEnv.devStatus || "-"}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-xs text-gray-500 mb-2 block">资源配置</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <Cpu className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-700">{(selectedEnv.envConfig || "-").split(" | ")[0]}</div>
                    <div className="text-xs text-gray-500">CPU</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <MemoryStick className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-700">{(selectedEnv.envConfig || "-").split(" | ")[1]}</div>
                    <div className="text-xs text-gray-500">内存</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center">
                    <HardDrive className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-amber-700">{(selectedEnv.envConfig || "-").split(" | ")[2]}</div>
                    <div className="text-xs text-gray-500">存储</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">创建时间</Label>
                  <div className="text-sm">{selectedEnv.createdAt}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">到期时间</Label>
                  <div className="text-sm">2026-12-31 23:59:59</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 延期对话框 */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              延期开发空间
            </DialogTitle>
            <DialogDescription>
              延长开发空间使用期限：{selectedEnv?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>当前到期时间</Label>
              <div className="text-sm font-medium bg-gray-50 p-2 rounded">2026-12-31 23:59:59</div>
            </div>
            <div className="space-y-2">
              <Label>延期时长 *</Label>
              <Select value={extendDays} onValueChange={setExtendDays}>
                <SelectTrigger>
                  <SelectValue placeholder="选择延期时长" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 天</SelectItem>
                  <SelectItem value="15">15 天</SelectItem>
                  <SelectItem value="30">30 天</SelectItem>
                  <SelectItem value="60">60 天</SelectItem>
                  <SelectItem value="90">90 天</SelectItem>
                  <SelectItem value="180">180 天</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
              提示：延期后新到期时间将根据选择的时长自动计算。
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleExtend}>
              <Calendar className="w-4 h-4 mr-2" />
              确认延期
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* 变更资源配置对话框 */}
      <Dialog open={changeDialogOpen} onOpenChange={setChangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>变更资源配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>开发空间</Label>
              <div className="text-sm font-medium">{selectedEnv?.name}</div>
            </div>
            <div className="space-y-2">
              <Label>CPU 核心数</Label>
              <Select value={changeConfig.cpu} onValueChange={(v) => setChangeConfig({ ...changeConfig, cpu: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择CPU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 核</SelectItem>
                  <SelectItem value="2">2 核</SelectItem>
                  <SelectItem value="4">4 核</SelectItem>
                  <SelectItem value="8">8 核</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>内存大小</Label>
              <Select value={changeConfig.memory} onValueChange={(v) => setChangeConfig({ ...changeConfig, memory: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择内存" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 GB</SelectItem>
                  <SelectItem value="2">2 GB</SelectItem>
                  <SelectItem value="4">4 GB</SelectItem>
                  <SelectItem value="8">8 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>存储空间</Label>
              <Select value={changeConfig.storage} onValueChange={(v) => setChangeConfig({ ...changeConfig, storage: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择存储" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 GB</SelectItem>
                  <SelectItem value="5">5 GB</SelectItem>
                  <SelectItem value="10">10 GB</SelectItem>
                  <SelectItem value="20">20 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleChangeConfig}>
              <Settings className="w-4 h-4 mr-2" />
              确认变更
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
