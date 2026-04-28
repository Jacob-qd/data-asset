import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  ChevronRight, Plus, Search, Eye, Pencil, Trash2, Play, Square, RotateCcw,
  TestTube, CheckCircle2, XCircle, Loader2, DollarSign
} from "lucide-react";
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

type RelayerNode = {
  id: string;
  name: string;
  endpoint: string;
  status: "running" | "stopped" | "error";
  latency: number;
  speed: string;
  uptime: string;
};

type FeeConfig = {
  id: string;
  assetType: string;
  direction: string;
  fee: number;
  unit: string;
  txCount: number;
  totalCollected: number;
};

type TestResult = {
  configId: string;
  status: "testing" | "success" | "error";
  message: string;
  latency?: number;
};

const initialData: CrossChainConfig[] = [
  { id: "CC-001", name: "ETH-BSC 跨链桥", sourceChain: "Ethereum", targetChain: "BNB Chain", protocol: "哈希时间锁", status: "已启用", createTime: "2026-04-20", description: "ETH 主网到 BSC 的跨链资产桥接配置" },
  { id: "CC-002", name: "Polygon-Arbitrum 通道", sourceChain: "Polygon", targetChain: "Arbitrum", protocol: "中继链", status: "已禁用", createTime: "2026-04-22", description: "Polygon 与 Arbitrum 之间的消息传递通道" },
  { id: "CC-003", name: "Solana-ETH 互通", sourceChain: "Solana", targetChain: "Ethereum", protocol: "侧链", status: "已启用", createTime: "2026-04-24", description: "Solana 与 Ethereum 的跨链互操作配置" },
];

const initialRelayers: RelayerNode[] = [
  { id: "RL-001", name: "中继节点-A", endpoint: "https://relayer-a.example.com", status: "running", latency: 120, speed: "12 tx/s", uptime: "99.9%" },
  { id: "RL-002", name: "中继节点-B", endpoint: "https://relayer-b.example.com", status: "running", latency: 200, speed: "8 tx/s", uptime: "99.5%" },
  { id: "RL-003", name: "中继节点-C", endpoint: "https://relayer-c.example.com", status: "stopped", latency: 0, speed: "-", uptime: "0%" },
  { id: "RL-004", name: "中继节点-D", endpoint: "https://relayer-d.example.com", status: "error", latency: 5000, speed: "0 tx/s", uptime: "45.2%" },
];

const initialFees: FeeConfig[] = [
  { id: "F-001", assetType: "ETH", direction: "Ethereum → BSC", fee: 0.001, unit: "ETH", txCount: 1240, totalCollected: 1.24 },
  { id: "F-002", assetType: "USDC", direction: "Polygon → Arbitrum", fee: 2, unit: "USDC", txCount: 890, totalCollected: 1780 },
  { id: "F-003", assetType: "SOL", direction: "Solana → Ethereum", fee: 0.01, unit: "SOL", txCount: 560, totalCollected: 5.6 },
  { id: "F-004", assetType: "BNB", direction: "BSC → Ethereum", fee: 0.005, unit: "BNB", txCount: 320, totalCollected: 1.6 },
];

const statusColor: Record<string, string> = {
  "已启用": "bg-green-100 text-green-700",
  "已禁用": "bg-gray-100 text-gray-700",
  "配置中": "bg-blue-100 text-blue-700",
  "异常": "bg-red-100 text-red-700",
};

const relayerStatusColor: Record<string, string> = {
  running: "bg-green-100 text-green-700",
  stopped: "bg-gray-100 text-gray-700",
  error: "bg-red-100 text-red-700",
};

function generateId() {
  return Date.now().toString(36).toUpperCase();
}

export default function CrossChain() {
  const [data, setData] = useState<CrossChainConfig[]>(initialData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selected, setSelected] = useState<CrossChainConfig | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("configs");

  const [relayers, setRelayers] = useState<RelayerNode[]>(initialRelayers);
  const [fees, setFees] = useState<FeeConfig[]>(initialFees);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testingConfig, setTestingConfig] = useState<CrossChainConfig | null>(null);

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
        id: `CC-${generateId()}`,
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

  const handleRelayerAction = (id: string, action: "start" | "stop" | "restart") => {
    setRelayers(relayers.map(r => {
      if (r.id !== id) return r;
      if (action === "start") return { ...r, status: "running" as const, latency: 150, speed: "10 tx/s", uptime: "99.0%" };
      if (action === "stop") return { ...r, status: "stopped" as const, latency: 0, speed: "-", uptime: "0%" };
      if (action === "restart") return { ...r, status: "running" as const, latency: 140, speed: "11 tx/s", uptime: "98.8%" };
      return r;
    }));
  };

  const handleTestConfig = (config: CrossChainConfig) => {
    setTestingConfig(config);
    setTestDialogOpen(true);
    setTestResults(prev => ({ ...prev, [config.id]: { configId: config.id, status: "testing", message: "正在测试连接..." } }));
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setTestResults(prev => ({
        ...prev,
        [config.id]: {
          configId: config.id,
          status: success ? "success" : "error",
          message: success ? "连接测试成功" : "连接超时，请检查网络配置",
          latency: success ? Math.floor(Math.random() * 300) + 50 : undefined,
        }
      }));
    }, 2000);
  };

  const formFields: FieldConfig[] = [
    { key: "name", label: "名称", type: "text", required: true, placeholder: "输入跨链配置名称" },
    { key: "sourceChain", label: "源链", type: "text", required: true, placeholder: "输入源链名称" },
    { key: "targetChain", label: "目标链", type: "text", required: true, placeholder: "输入目标链名称" },
    { key: "protocol", label: "协议", type: "select", required: true, options: [
      { label: "哈希时间锁", value: "哈希时间锁" },
      { label: "中继链", value: "中继链" },
      { label: "侧链", value: "侧链" },
      { label: "LayerZero", value: "LayerZero" },
      { label: "Axelar", value: "Axelar" },
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
          <p className="text-sm text-gray-500 mt-1.5">区块链跨链通信配置与管理</p>
        </div>
        <Button
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configs">跨链配置</TabsTrigger>
          <TabsTrigger value="relayers">中继节点</TabsTrigger>
          <TabsTrigger value="fees">费用配置</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-6">
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
                      <TableCell>
                        <Badge variant="outline">{d.protocol}</Badge>
                        {d.protocol === "哈希时间锁" && <span className="ml-1 text-xs text-gray-400">(HTLC)</span>}
                        {d.protocol === "中继链" && <span className="ml-1 text-xs text-gray-400">(Relay)</span>}
                        {d.protocol === "侧链" && <span className="ml-1 text-xs text-gray-400">(Side)</span>}
                      </TableCell>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200" onClick={() => handleTestConfig(d)} title="连接测试">
                            <TestTube className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="relayers" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">中继节点总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{relayers.length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">运行中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{relayers.filter(r => r.status === "running").length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已停止</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-600">{relayers.filter(r => r.status === "stopped").length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">异常</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{relayers.filter(r => r.status === "error").length}</div></CardContent></Card>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader><CardTitle>中继节点管理</CardTitle></CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>端点</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>延迟</TableHead>
                    <TableHead>速度</TableHead>
                    <TableHead>运行时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relayers.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{r.id}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-xs text-gray-500">{r.endpoint}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${relayerStatusColor[r.status] || "bg-gray-100 text-gray-700"}`}>{r.status === "running" ? "运行中" : r.status === "stopped" ? "已停止" : "异常"}</span></TableCell>
                      <TableCell>{r.latency > 0 ? `${r.latency}ms` : "-"}</TableCell>
                      <TableCell>{r.speed}</TableCell>
                      <TableCell>{r.uptime}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {r.status !== "running" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleRelayerAction(r.id, "start")} title="启动">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {r.status === "running" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100" onClick={() => handleRelayerAction(r.id, "stop")} title="停止">
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => handleRelayerAction(r.id, "restart")} title="重启">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">费用配置数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{fees.length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总交易数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-indigo-600">{fees.reduce((s, f) => s + f.txCount, 0).toLocaleString()}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总费用收入</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600 flex items-center gap-1"><DollarSign className="h-5 w-5"/>{fees.reduce((s, f) => s + f.totalCollected, 0).toFixed(2)}</div></CardContent></Card>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader><CardTitle>跨链费用配置</CardTitle></CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>资产类型</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>手续费</TableHead>
                    <TableHead>交易笔数</TableHead>
                    <TableHead>累计收入</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map(f => (
                    <TableRow key={f.id}>
                      <TableCell><Badge variant="outline">{f.assetType}</Badge></TableCell>
                      <TableCell>{f.direction}</TableCell>
                      <TableCell>{f.fee} {f.unit}</TableCell>
                      <TableCell>{f.txCount.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{f.totalCollected.toFixed(4)} {f.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>连接测试 - {testingConfig?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {testingConfig && testResults[testingConfig.id] ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {testResults[testingConfig.id].status === "testing" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                  {testResults[testingConfig.id].status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {testResults[testingConfig.id].status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                  <span className={`font-medium ${testResults[testingConfig.id].status === "success" ? "text-green-700" : testResults[testingConfig.id].status === "error" ? "text-red-700" : "text-blue-700"}`}>
                    {testResults[testingConfig.id].message}
                  </span>
                </div>
                {testResults[testingConfig.id].latency && (
                  <div className="text-sm text-gray-600">延迟: {testResults[testingConfig.id].latency}ms</div>
                )}
                <div className="text-xs text-gray-500">
                  源链: {testingConfig.sourceChain} → 目标链: {testingConfig.targetChain}<br/>
                  协议: {testingConfig.protocol}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">准备测试...</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>关闭</Button>
            {testingConfig && (
              <Button onClick={() => handleTestConfig(testingConfig)} disabled={testResults[testingConfig.id]?.status === "testing"}>
                {testResults[testingConfig.id]?.status === "testing" ? "测试中..." : "重新测试"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
