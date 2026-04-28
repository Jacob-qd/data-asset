import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

type CrossChainConfig = {
  id: string;
  name: string;
  sourceChain: string;
  targetChain: string;
  protocol: string;
  status: string;
  createTime: string;
  description: string;
};

const initialData: CrossChainConfig[] = [
  { id: "CC-001", name: "ETH-BSC 跨链桥", sourceChain: "Ethereum", targetChain: "BNB Chain", protocol: "LayerZero", status: "已启用", createTime: "2026-04-20", description: "ETH 主网到 BSC 的跨链资产桥接配置" },
  { id: "CC-002", name: "Polygon-Arbitrum 通道", sourceChain: "Polygon", targetChain: "Arbitrum", protocol: "Axelar", status: "已禁用", createTime: "2026-04-22", description: "Polygon 与 Arbitrum 之间的消息传递通道" },
  { id: "CC-003", name: "Solana-ETH 互通", sourceChain: "Solana", targetChain: "Ethereum", protocol: "Wormhole", status: "已启用", createTime: "2026-04-24", description: "Solana 与 Ethereum 的跨链互操作配置" },
];

const statusColor: Record<string, string> = {
  "已启用": "bg-green-100 text-green-700",
  "已禁用": "bg-gray-100 text-gray-700",
  "配置中": "bg-blue-100 text-blue-700",
  "异常": "bg-red-100 text-red-700",
};

const formFields: FieldConfig[] = [
  { key: "name", label: "名称", type: "text", required: true, placeholder: "输入跨链配置名称" },
  { key: "sourceChain", label: "源链", type: "text", required: true, placeholder: "输入源链名称" },
  { key: "targetChain", label: "目标链", type: "text", required: true, placeholder: "输入目标链名称" },
  { key: "protocol", label: "协议", type: "select", required: true, options: [
    { label: "LayerZero", value: "LayerZero" },
    { label: "Axelar", value: "Axelar" },
    { label: "Wormhole", value: "Wormhole" },
    { label: "Chainlink CCIP", value: "Chainlink CCIP" },
    { label: "IBC", value: "IBC" },
    { label: "其他", value: "其他" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已启用", value: "已启用" },
    { label: "已禁用", value: "已禁用" },
    { label: "配置中", value: "配置中" },
    { label: "异常", value: "异常" },
  ]},
  { key: "description", label: "描述", type: "textarea", placeholder: "输入配置描述" },
];

const detailFields = [
  { key: "id", label: "ID" },
  { key: "name", label: "名称" },
  { key: "sourceChain", label: "源链" },
  { key: "targetChain", label: "目标链" },
  { key: "protocol", label: "协议", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "createTime", label: "创建时间", type: "date" as const },
  { key: "description", label: "描述" },
];

export default function CrossChain() {
  const [data, setData] = useState<CrossChainConfig[]>(initialData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selected, setSelected] = useState<CrossChainConfig | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = data.filter(d =>
    d.name.includes(search) ||
    d.id.includes(search) ||
    d.sourceChain.includes(search) ||
    d.targetChain.includes(search)
  );

  const handleCreate = () => {
    setSelected(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: CrossChainConfig) => {
    setSelected(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (item: CrossChainConfig) => {
    setSelected(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (item: CrossChainConfig) => {
    setSelected(item);
    setDrawerOpen(true);
  };

  const handleSubmit = (formData: Record<string, any>) => {
    if (dialogMode === "create") {
      const newItem: CrossChainConfig = {
        id: `CC-${String(data.length + 1).padStart(3, "0")}`,
        name: formData.name || "",
        sourceChain: formData.sourceChain || "",
        targetChain: formData.targetChain || "",
        protocol: formData.protocol || "",
        status: formData.status || "配置中",
        createTime: new Date().toISOString().slice(0, 10),
        description: formData.description || "",
      };
      setData([...data, newItem]);
    } else if (dialogMode === "edit" && selected) {
      setData(data.map(d => d.id === selected.id ? { ...d, ...formData } : d));
    }
  };

  const handleConfirmDelete = () => {
    if (selected) {
      setData(data.filter(d => d.id !== selected.id));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/blockchain">区块链</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>跨链配置</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">跨链配置</h1>
          <p className="text-sm text-gray-500 mt-1.5">区块链跨链通信配置</p>
        </div>
        <Button
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{data.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已启用</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{data.filter(d => d.status === "已启用").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已禁用</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-600">{data.filter(d => d.status === "已禁用").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">配置中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{data.filter(d => d.status === "配置中").length}</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input
              placeholder="搜索关键词"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>源链</TableHead>
                <TableHead>目标链</TableHead>
                <TableHead>协议</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.sourceChain}</TableCell>
                  <TableCell>{d.targetChain}</TableCell>
                  <TableCell>{d.protocol}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status] || "bg-gray-100 text-gray-700"}`}>{d.status}</span></TableCell>
                  <TableCell className="text-xs">{d.createTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200" onClick={() => handleView(d)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200" onClick={() => handleEdit(d)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" onClick={() => handleDelete(d)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? selected?.name || "" : "跨链配置"}
        fields={formFields}
        data={selected}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected?.name || "详情"}
        data={selected || {}}
        fields={detailFields}
        onEdit={selected ? () => { setDrawerOpen(false); handleEdit(selected); } : undefined}
        onDelete={selected ? () => { setDrawerOpen(false); handleDelete(selected); } : undefined}
      />
    </div>
  );
}
