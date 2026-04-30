import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Plus, Rocket, BarChart3,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  deployStatus: string;
  inferenceService: boolean;
}

const mockModels: Model[] = [
  {
    id: "MODEL-001",
    name: "医疗影像筛查模型V1",
    type: "纵向逻辑回归",
    createdAt: "2026-04-26 10:33:48",
    deployStatus: "deployed",
    inferenceService: true,
  },
  {
    id: "MODEL-002",
    name: "银行客户筛选模型",
    type: "纵向逻辑回归",
    createdAt: "2026-04-24 16:13:59",
    deployStatus: "deployed",
    inferenceService: true,
  },
  {
    id: "MODEL-003",
    name: "医疗影像筛查模型V1.1",
    type: "纵向逻辑回归",
    createdAt: "2026-04-26 16:21:34",
    deployStatus: "undeployed",
    inferenceService: false,
  },
  {
    id: "MODEL-004",
    name: "逻辑回归任务-0424",
    type: "纵向逻辑回归",
    createdAt: "2026-04-24 15:23:58",
    deployStatus: "deployed",
    inferenceService: true,
  },
  {
    id: "MODEL-005",
    name: "纵向逻辑回归模型",
    type: "纵向逻辑回归",
    createdAt: "2026-04-24 14:51:30",
    deployStatus: "deployed",
    inferenceService: true,
  },
];

const modelFormFields: FieldConfig[] = [
  { key: "name", label: "模型名称", type: "text", required: true },
  { key: "type", label: "模型类型", type: "select", required: true, options: [
    { label: "纵向逻辑回归", value: "纵向逻辑回归" },
    { label: "横向逻辑回归", value: "横向逻辑回归" },
    { label: "XGBoost", value: "XGBoost" },
    { label: "神经网络", value: "神经网络" },
    { label: "决策树", value: "决策树" },
  ]},
  { key: "deployStatus", label: "部署状态", type: "select", options: [
    { label: "已部署", value: "deployed" },
    { label: "未部署", value: "undeployed" },
  ]},
  { key: "inferenceService", label: "联合推理服务", type: "select", options: [
    { label: "启用", value: "true" },
    { label: "禁用", value: "false" },
  ]},
];

const modelDetailFields = [
  { key: "id", label: "模型ID", type: "text" as const },
  { key: "name", label: "模型名称", type: "text" as const },
  { key: "type", label: "模型类型", type: "badge" as const },
  { key: "deployStatus", label: "部署状态", type: "badge" as const },
  { key: "inferenceService", label: "联合推理服务", type: "badge" as const },
  { key: "createdAt", label: "建模时间", type: "date" as const },
];

export default function ModelManagement() {
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>(mockModels);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeploy = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, deployStatus: "deployed" } : m
    ));
    toast.success("模型部署成功");
  };

  const handleUndeploy = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, deployStatus: "undeployed" } : m
    ));
    toast.success("模型已撤销部署");
  };

  const handleCreate = (data: Record<string, any>) => {
    const newModel: Model = {
      id: `MODEL-${Date.now().toString(36).toUpperCase()}`,
      name: data.name,
      type: data.type,
      createdAt: new Date().toLocaleString("zh-CN"),
      deployStatus: data.deployStatus || "undeployed",
      inferenceService: data.inferenceService === "true",
    };
    setModels([newModel, ...models]);
    setEditOpen(false);
    toast.success("模型创建成功");
  };

  const handleEdit = (data: Record<string, any>) => {
    if (selectedModel) {
      setModels(models.map((m) =>
        m.id === selectedModel.id
          ? { ...m, ...data, inferenceService: data.inferenceService === "true" }
          : m
      ));
      setEditOpen(false);
      toast.success("模型更新成功");
    }
  };

  const handleDelete = () => {
    if (selectedModel) {
      setModels(models.filter((m) => m.id !== selectedModel.id));
      setDeleteOpen(false);
      toast.success("模型已删除");
    }
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: Model, index: number) => index + 1 },
    {
      key: "name",
      title: "模型名称",
      render: (row: Model) => (
        <span className="text-indigo-600 cursor-pointer hover:underline">{row.name}</span>
      ),
    },
    {
      key: "type",
      title: "模型类型",
      render: (row: Model) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: "createdAt",
      title: "建模时间",
      render: (row: Model) => <span className="text-gray-500 text-sm">{row.createdAt}</span>,
    },
    {
      key: "deployStatus",
      title: "在线部署状态",
      render: (row: Model) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", row.deployStatus === "deployed" ? "bg-green-500" : "bg-gray-300")} />
          <span className={row.deployStatus === "deployed" ? "text-green-700" : "text-gray-500"}>
            {row.deployStatus === "deployed" ? "部署成功" : "未部署"}
          </span>
          {row.deployStatus === "undeployed" ? (
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => handleDeploy(row.id)}>部署</Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleUndeploy(row.id)}>撤销</Button>
          )}
        </div>
      ),
    },
    {
      key: "inferenceService",
      title: "联合推理服务",
      render: (row: Model) => (
        <div className="flex items-center justify-center">
          {row.inferenceService ? (
            <Rocket className="w-4 h-4 text-green-600" />
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      width: "w-72",
      render: (row: Model) => (
        <ActionButtons buttons={[
          createViewAction(() => { setSelectedModel(row); setDetailOpen(true); }),
          createEditAction(() => { setSelectedModel(row); setEditOpen(true); }),
          { key: "evaluate", icon: <BarChart3 className="w-4 h-4" />, label: "评估", onClick: () => navigate(`/privacy/models/evaluation/${row.id}`) },
          { key: "inference", icon: <Rocket className="w-4 h-4" />, label: "去推理", onClick: () => {} },
          createDeleteAction(() => { setSelectedModel(row); setDeleteOpen(true); }),
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="模型管理"
        actions={
          <Button onClick={() => { setSelectedModel(null); setEditOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            新建模型
          </Button>
        }
      />

      <PageSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="搜索模型名称..."
        onReset={() => setSearchTerm("")}
      />

      <DataTable
        data={filteredModels}
        columns={columns}
        rowKey={(row) => row.id}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="模型详情"
        data={selectedModel || {}}
        fields={modelDetailFields}
        onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
        onDelete={() => { setDetailOpen(false); setDeleteOpen(true); }}
      />

      {/* Create/Edit Dialog */}
      <CrudDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="模型"
        fields={modelFormFields}
        data={selectedModel || {}}
        onSubmit={selectedModel ? handleEdit : handleCreate}
        mode={selectedModel ? "edit" : "create"}
      />

      {/* Delete Dialog */}
      <CrudDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="模型"
        fields={[]}
        onSubmit={() => {}}
        onDelete={handleDelete}
        mode="delete"
      />
    </div>
  );
}
