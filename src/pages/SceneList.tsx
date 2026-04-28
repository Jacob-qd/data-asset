import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { mockScenes, domainOptions, statusOptions, productFormOptions, devMethodOptions, type Scene } from "@/data/mock/scenes";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "草稿", variant: "secondary" },
  pending: { label: "待审核", variant: "outline" },
  approved: { label: "已通过", variant: "default" },
  rejected: { label: "已驳回", variant: "destructive" },
  active: { label: "已启用", variant: "default" },
  expired: { label: "已过期", variant: "secondary" },
};

const devMethodMap: Record<string, string> = {
  sandbox: "数据沙箱",
  privacy: "隐私计算",
  secret: "密态计算",
  offline: "离线下载",
};

export default function SceneList() {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[]>(mockScenes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filteredScenes = scenes.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = () => {
    if (selectedScene) {
      setScenes(scenes.filter((s) => s.id !== selectedScene.id));
      setDeleteOpen(false);
    }
  };

  const handleEdit = (data: Record<string, any>) => {
    if (selectedScene) {
      setScenes(scenes.map((s) => (s.id === selectedScene.id ? { ...s, ...data } : s)));
      setEditOpen(false);
    }
  };

  const editFields: FieldConfig[] = [
    { key: "name", label: "应用场景名称", type: "text", required: true },
    { key: "domain", label: "所属领域", type: "select", options: domainOptions, required: true },
    { key: "status", label: "状态", type: "select", options: statusOptions, required: true },
    { key: "productName", label: "数据产品名称", type: "text", required: true },
    { key: "productForm", label: "产品形态", type: "select", options: productFormOptions },
    { key: "devMethod", label: "开发方式", type: "select", options: devMethodOptions },
    { key: "samplingReq", label: "数据抽样需求", type: "textarea" },
    { key: "maskingRules", label: "数据脱敏规则", type: "textarea" },
  ];

  const detailFields = [
    { key: "id", label: "场景编号", type: "text" as const },
    { key: "name", label: "应用场景名称", type: "text" as const },
    { key: "domain", label: "所属领域", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "productName", label: "数据产品名称", type: "text" as const },
    { key: "productForm", label: "产品形态", type: "badge" as const },
    { key: "devMethod", label: "开发方式", type: "badge" as const },
    { key: "samplingReq", label: "数据抽样需求", type: "text" as const },
    { key: "maskingRules", label: "数据脱敏规则", type: "text" as const },
    { key: "createdBy", label: "创建机构", type: "text" as const },
    { key: "createdAt", label: "创建时间", type: "date" as const },
    { key: "validFrom", label: "有效期开始", type: "date" as const },
    { key: "validTo", label: "有效期结束", type: "date" as const },
  ];

  const columns = [
    { key: "id", title: "序号", width: "w-20", render: (_row: Scene, index: number) => index + 1 },
    { key: "name", title: "场景名称" },
    { key: "domain", title: "所属领域" },
    { key: "productName", title: "数据产品" },
    {
      key: "devMethod",
      title: "开发方式",
      render: (row: Scene) => devMethodMap[row.devMethod] || row.devMethod,
    },
    {
      key: "status",
      title: "状态",
      render: (row: Scene) => {
        const config = statusMap[row.status];
        return config ? (
          <Badge variant={config.variant}>{config.label}</Badge>
        ) : (
          row.status
        );
      },
    },
    {
      key: "actions",
      title: "操作",
      width: "w-40",
      render: (row: Scene) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedScene(row); setDetailOpen(true); }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedScene(row); setEditOpen(true); }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => { setSelectedScene(row); setDeleteOpen(true); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">应用场景中心</h1>
        <Button onClick={() => navigate("/scenes/create")}>
          <Plus className="w-4 h-4 mr-2" />
          新建场景
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索场景名称或数据产品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="">全部状态</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredScenes}
        columns={columns}
        rowKey={(row) => row.id}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="场景详情"
        data={selectedScene || {}}
        fields={detailFields}
        onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
        onDelete={() => { setDetailOpen(false); setDeleteOpen(true); }}
      />

      {/* Edit Dialog */}
      <CrudDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="应用场景"
        fields={editFields}
        data={selectedScene || {}}
        onSubmit={handleEdit}
        mode="edit"
      />

      {/* Delete Dialog */}
      <CrudDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="应用场景"
        fields={[]}
        onSubmit={() => {}}
        onDelete={handleDelete}
        mode="delete"
      />
    </div>
  );
}
