import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Terminal,
  MoreHorizontal,
} from "lucide-react";
import {
  mockSandboxEnvs,
  domainOptions,
  sceneStatusMap,
  syncStatusMap,
  type SandboxEnv,
} from "@/data/mock/sandbox-envs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const tabs = [
  { key: "all", label: "全部" },
  { key: "my", label: "我的环境" },
  { key: "joined", label: "参与的环境" },
];

export default function SandboxEnvList() {
  const navigate = useNavigate();
  const [envs, setEnvs] = useState<SandboxEnv[]>(mockSandboxEnvs);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailEnv, setDetailEnv] = useState<SandboxEnv | null>(null);

  // 新建环境对话框
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    domain: "",
    description: "",
    cpu: "4",
    memory: "16",
    storage: "100",
    gpu: "0",
    devEnvStatus: "active" as "active" | "inactive",
    prodEnvStatus: "inactive" as "active" | "inactive",
  });

  const currentUser = "科技公司甲";

  const filteredEnvs = envs.filter((env) => {
    const matchSearch =
      env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDomain = domainFilter ? env.domain === domainFilter : true;
    const matchStatus = statusFilter ? env.sceneStatus === statusFilter : true;

    let matchTab = true;
    switch (activeTab) {
      case "my":
        matchTab = env.owner === currentUser;
        break;
      case "joined":
        matchTab = env.owner !== currentUser;
        break;
    }

    return matchSearch && matchDomain && matchStatus && matchTab;
  });

  const handleDelete = (id: string) => {
    if (confirm("确定要删除该沙箱环境吗？")) {
      setEnvs(envs.filter((e) => e.id !== id));
      toast.success("沙箱环境已删除");
    }
  };

  const handleCreateOpen = () => {
    setCreateForm({
      name: "",
      domain: "",
      description: "",
      cpu: "4",
      memory: "16",
      storage: "100",
      gpu: "0",
      devEnvStatus: "active",
      prodEnvStatus: "inactive",
    });
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!createForm.name.trim()) {
      toast.error("请输入环境名称");
      return;
    }
    if (!createForm.domain) {
      toast.error("请选择所属领域");
      return;
    }

    const newEnv: SandboxEnv = {
      id: "ENV-" + Date.now().toString(36).toUpperCase(),
      name: createForm.name.trim(),
      domain: createForm.domain,
      dataResourceCount: 0,
      devEnvStatus: createForm.devEnvStatus,
      prodEnvStatus: createForm.prodEnvStatus,
      sceneStatus: "draft",
      syncStatus: "unsynced",
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      description: createForm.description.trim() || undefined,
      owner: currentUser,
      resourceConfig: {
        cpu: parseInt(createForm.cpu) || 4,
        memory: parseInt(createForm.memory) || 16,
        storage: parseInt(createForm.storage) || 100,
        gpu: parseInt(createForm.gpu) || undefined,
      },
    };

    setEnvs([newEnv, ...envs]);
    setCreateDialogOpen(false);
    toast.success("沙箱环境创建成功");
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: SandboxEnv, index: number) => index + 1 },
    {
      key: "name",
      title: "环境名称",
      render: (row: SandboxEnv) => (
        <div className="space-y-1">
          <span className="text-indigo-600 font-medium cursor-pointer hover:underline"
            onClick={() => setDetailEnv(row)}>
            {row.name}
          </span>
          {row.description && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "domain",
      title: "所属领域",
      render: (row: SandboxEnv) => (
        <Badge variant="outline" className="text-xs">{row.domain || "-"}</Badge>
      ),
    },
    {
      key: "dataResourceCount",
      title: "数据资源",
      render: (row: SandboxEnv) => <span className="text-sm">{row.dataResourceCount} 个</span>,
    },
    {
      key: "envStatus",
      title: "开发空间状态",
      render: (row: SandboxEnv) => (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", row.devEnvStatus === "active" ? "bg-green-500" : "bg-gray-300")} />
            <span>开发</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", row.prodEnvStatus === "active" ? "bg-green-500" : "bg-gray-300")} />
            <span>生产</span>
          </div>
        </div>
      ),
    },
    {
      key: "sceneStatus",
      title: "场景状态",
      render: (row: SandboxEnv) => {
        const status = sceneStatusMap[row.sceneStatus];
        return (
          <Badge
            variant={status?.color === "green" ? "default" : status?.color === "red" ? "destructive" : "secondary"}
            className={cn(
              "text-xs",
              status?.color === "blue" && "bg-blue-100 text-blue-700 hover:bg-blue-100"
            )}
          >
            {status?.label || row.sceneStatus}
          </Badge>
        );
      },
    },
    {
      key: "syncStatus",
      title: "同步状态",
      render: (row: SandboxEnv) => {
        const status = syncStatusMap[row.syncStatus];
        return (
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", status?.dot || "bg-gray-400")} />
            <span className="text-xs">{status?.label || row.syncStatus}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "操作",
      width: "w-52",
      render: (row: SandboxEnv) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            onClick={() => navigate(`/sandbox/ide/${row.id}`)}
          >
            <Terminal className="w-3.5 h-3.5 mr-1" />
            进入IDE
          </Button>
          <ActionButtons
            buttons={[
              { key: "view", icon: <Eye className="w-4 h-4" />, label: "查看", onClick: () => setDetailEnv(row) },
              { key: "edit", icon: <Edit className="w-4 h-4" />, label: "编辑", onClick: () => toast.info("编辑功能开发中") },
            ]}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("变更功能开发中")}>
                变更配置
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("续期功能开发中")}>
                资源续期
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.id)}>
                删除环境
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="沙箱开发环境"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info("导出列表功能开发中")}>
              导出列表
            </Button>
            <Button onClick={handleCreateOpen}>
              <Plus className="w-4 h-4 mr-2" />
              新建环境
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-4">
          <PageSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="搜索环境名称..."
            onReset={() => {
              setSearchTerm("");
              setDomainFilter("");
              setStatusFilter("");
            }}
            extraFilters={
              <>
                <select
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                >
                  {domainOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">全部状态</option>
                  <option value="draft">草稿</option>
                  <option value="submitted">已提交</option>
                  <option value="enabled">已启用</option>
                  <option value="disabled">已停用</option>
                </select>
              </>
            }
          />

          {/* Data Table */}
          <DataTable
            data={filteredEnvs}
            columns={columns}
            rowKey={(row) => row.id}
          />
        </div>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailEnv} onOpenChange={() => setDetailEnv(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>环境详情</DialogTitle>
          </DialogHeader>
          {detailEnv && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">环境名称：</span>
                  <span className="ml-2 font-medium">{detailEnv.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">所属领域：</span>
                  <span className="ml-2">{detailEnv.domain}</span>
                </div>
                <div>
                  <span className="text-gray-500">数据资源：</span>
                  <span className="ml-2">{detailEnv.dataResourceCount} 个</span>
                </div>
                <div>
                  <span className="text-gray-500">负责人：</span>
                  <span className="ml-2">{detailEnv.owner}</span>
                </div>
                <div>
                  <span className="text-gray-500">创建时间：</span>
                  <span className="ml-2">{detailEnv.createdAt}</span>
                </div>
                <div>
                  <span className="text-gray-500">更新时间：</span>
                  <span className="ml-2">{detailEnv.updatedAt}</span>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">资源配置</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{detailEnv.resourceConfig.cpu}</div>
                    <div className="text-xs text-gray-500">CPU 核</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{detailEnv.resourceConfig.memory}</div>
                    <div className="text-xs text-gray-500">内存 GB</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{detailEnv.resourceConfig.storage}</div>
                    <div className="text-xs text-gray-500">存储 GB</div>
                  </div>
                  {detailEnv.resourceConfig.gpu && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-indigo-600">{detailEnv.resourceConfig.gpu}</div>
                      <div className="text-xs text-gray-500">GPU 卡</div>
                    </div>
                  )}
                </div>
              </div>

              {detailEnv.description && (
                <div>
                  <span className="text-gray-500 text-sm">描述：</span>
                  <p className="mt-1 text-sm">{detailEnv.description}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailEnv(null)}>关闭</Button>
                <Button onClick={() => {
                  setDetailEnv(null);
                  navigate(`/sandbox/ide/${detailEnv.id}`);
                }}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  进入IDE
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Environment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建沙箱环境</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="env-name">
                环境名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="env-name"
                placeholder="请输入环境名称"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="env-domain">
                所属领域 <span className="text-red-500">*</span>
              </Label>
              <select
                id="env-domain"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={createForm.domain}
                onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
              >
                <option value="">请选择所属领域</option>
                {domainOptions.filter((opt) => opt.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="env-desc">环境描述</Label>
              <Textarea
                id="env-desc"
                placeholder="请输入环境描述（可选）"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>资源配置</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">CPU (核)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.cpu}
                    onChange={(e) => setCreateForm({ ...createForm, cpu: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">内存 (GB)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.memory}
                    onChange={(e) => setCreateForm({ ...createForm, memory: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">存储 (GB)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.storage}
                    onChange={(e) => setCreateForm({ ...createForm, storage: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">GPU (卡)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={createForm.gpu}
                    onChange={(e) => setCreateForm({ ...createForm, gpu: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>环境状态</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.devEnvStatus === "active"}
                    onChange={(e) => setCreateForm({ ...createForm, devEnvStatus: e.target.checked ? "active" : "inactive" })}
                    className="rounded border-gray-300"
                  />
                  开发环境
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.prodEnvStatus === "active"}
                    onChange={(e) => setCreateForm({ ...createForm, prodEnvStatus: e.target.checked ? "active" : "inactive" })}
                    className="rounded border-gray-300"
                  />
                  生产环境
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSubmit}>
              <Plus className="w-4 h-4 mr-2" />
              创建环境
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
