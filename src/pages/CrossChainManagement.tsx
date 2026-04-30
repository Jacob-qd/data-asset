import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";
import {
  Plus, Edit, Eye, Trash2, ArrowLeftRight,
  Settings, BarChart3, FileCode, Activity, Play, Square,
  CheckCircle, XCircle, Globe, Link2, Server, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CrossChainGateway {
  id: string;
  name: string;
  hostUser: string;
  externalPort: string;
  gatewayAddress: string;
  port: string;
  status: "running" | "stopped" | "error";
  description: string;
  chainType: string;
  createTime: string;
}

interface CrossChainContract {
  id: string;
  name: string;
  chain: string;
  version: string;
  deployTime: string;
  status: "active" | "inactive";
  txHash: string;
}

const mockGateways: CrossChainGateway[] = [
  {
    id: "GW-001",
    name: "gateway-main",
    hostUser: "root",
    externalPort: "22",
    gatewayAddress: "172.16.0.6",
    port: "8250",
    status: "running",
    description: "主跨链网关-以太坊",
    chainType: "Ethereum",
    createTime: "2026-04-01 10:00:00",
  },
  {
    id: "GW-002",
    name: "gateway-bak",
    hostUser: "admin",
    externalPort: "22",
    gatewayAddress: "172.16.0.7",
    port: "8251",
    status: "running",
    description: "备份跨链网关-以太坊",
    chainType: "Ethereum",
    createTime: "2026-04-05 14:30:00",
  },
  {
    id: "GW-003",
    name: "gateway-fabric",
    hostUser: "fabric",
    externalPort: "22",
    gatewayAddress: "172.16.0.8",
    port: "8252",
    status: "stopped",
    description: "Hyperledger Fabric跨链网关",
    chainType: "Hyperledger",
    createTime: "2026-04-10 09:00:00",
  },
  {
    id: "GW-004",
    name: "gateway-bsc",
    hostUser: "bsc",
    externalPort: "22",
    gatewayAddress: "172.16.0.9",
    port: "8253",
    status: "running",
    description: "BSC跨链网关",
    chainType: "BSC",
    createTime: "2026-04-15 16:00:00",
  },
  {
    id: "GW-005",
    name: "gateway-polygon",
    hostUser: "polygon",
    externalPort: "22",
    gatewayAddress: "172.16.0.10",
    port: "8254",
    status: "error",
    description: "Polygon跨链网关",
    chainType: "Polygon",
    createTime: "2026-04-20 11:00:00",
  },
];

const mockContracts: CrossChainContract[] = [
  {
    id: "CON-001",
    name: "CrossChainTransfer",
    chain: "Ethereum",
    version: "1.0.2",
    deployTime: "2026-04-20 10:00:00",
    status: "active",
    txHash: "0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
  },
  {
    id: "CON-002",
    name: "DataAnchor",
    chain: "Hyperledger",
    version: "2.1.0",
    deployTime: "2026-04-22 14:30:00",
    status: "active",
    txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
  },
  {
    id: "CON-003",
    name: "TokenBridge",
    chain: "BSC",
    version: "1.2.0",
    deployTime: "2026-04-25 09:00:00",
    status: "active",
    txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
  },
  {
    id: "CON-004",
    name: "MessageRelay",
    chain: "Polygon",
    version: "1.0.0",
    deployTime: "2026-04-28 15:00:00",
    status: "inactive",
    txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
  },
];

export default function CrossChainManagement() {
  const [gateways, setGateways] = useState<CrossChainGateway[]>(mockGateways);
  const [contracts] = useState<CrossChainContract[]>(mockContracts);
  const [activeTab, setActiveTab] = useState("gateways");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailGateway, setDetailGateway] = useState<CrossChainGateway | null>(null);
  const [editGateway, setEditGateway] = useState<CrossChainGateway | null>(null);
  const [editForm, setEditForm] = useState<Partial<CrossChainGateway>>({});

  const filteredGateways = gateways.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.gatewayAddress.includes(searchTerm) ||
    g.chainType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setGateways(gateways.map((g) => {
      if (g.id === id) {
        const newStatus = g.status === "running" ? "stopped" : "running";
        toast.success(`网关 ${g.name} 已${newStatus === "running" ? "启用" : "停用"}`);
        return { ...g, status: newStatus };
      }
      return g;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除该网关？")) {
      setGateways(gateways.filter((g) => g.id !== id));
      toast.success("网关已删除");
    }
  };

  const handleSaveEdit = () => {
    if (!editGateway) return;
    setGateways(gateways.map((g) =>
      g.id === editGateway.id ? { ...g, ...editForm } as CrossChainGateway : g
    ));
    setEditGateway(null);
    toast.success("网关信息已更新");
  };

  const runningCount = gateways.filter((g) => g.status === "running").length;
  const stoppedCount = gateways.filter((g) => g.status === "stopped").length;
  const errorCount = gateways.filter((g) => g.status === "error").length;

  const gatewayColumns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: CrossChainGateway, index: number) => index + 1 },
    { key: "name", title: "网关名称", render: (row: CrossChainGateway) => (
      <span className="font-medium text-indigo-600">{row.name}</span>
    )},
    { key: "hostUser", title: "主机用户" },
    { key: "externalPort", title: "主机对外端口" },
    { key: "gatewayAddress", title: "跨链网关地址", render: (row: CrossChainGateway) => (
      <span className="font-mono text-sm">{row.gatewayAddress}</span>
    )},
    { key: "port", title: "端口" },
    {
      key: "chainType",
      title: "链类型",
      render: (row: CrossChainGateway) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Globe className="w-3 h-3 mr-1" />
          {row.chainType}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "状态",
      render: (row: CrossChainGateway) => (
        <div className="flex items-center gap-1.5">
          {row.status === "running" ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">运行中</span>
            </>
          ) : row.status === "stopped" ? (
            <>
              <Square className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">已停用</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">异常</span>
            </>
          )}
        </div>
      ),
    },
    { key: "description", title: "描述", render: (row: CrossChainGateway) => (
      <span className="text-sm text-gray-600">{row.description}</span>
    )},
    {
      key: "actions",
      title: "操作",
      width: "w-56",
      render: (row: CrossChainGateway) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row.id)}>
            {row.status === "running" ? (
              <><Square className="w-4 h-4 mr-1" />停用</>
            ) : (
              <><Play className="w-4 h-4 mr-1" />启用</>
            )}
          </Button>
          <ActionButtons buttons={[
            createEditAction(() => { setEditGateway(row); setEditForm(row); }),
            createViewAction(() => setDetailGateway(row)),
            createDeleteAction(() => handleDelete(row.id)),
          ]} />
        </div>
      ),
    },
  ];

  const contractColumns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: CrossChainContract, index: number) => index + 1 },
    { key: "name", title: "合约名称", render: (row: CrossChainContract) => (
      <span className="font-medium text-indigo-600">{row.name}</span>
    )},
    { key: "chain", title: "所属链", render: (row: CrossChainContract) => (
      <Badge variant="outline" className="bg-purple-50 text-purple-700">
        <Link2 className="w-3 h-3 mr-1" />
        {row.chain}
      </Badge>
    )},
    { key: "version", title: "版本" },
    { key: "deployTime", title: "部署时间", render: (row: CrossChainContract) => (
      <span className="text-sm text-gray-500">{row.deployTime}</span>
    )},
    {
      key: "status",
      title: "状态",
      render: (row: CrossChainContract) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status === "active" ? "已激活" : "未激活"}
        </Badge>
      ),
    },
    {
      key: "txHash",
      title: "交易哈希",
      render: (row: CrossChainContract) => (
        <span className="font-mono text-xs text-gray-500">{row.txHash.slice(0, 20)}...</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="跨链管理"
        actions={
          <Button size="sm" onClick={() => toast.info("新增网关功能开发中")}>
            <Plus className="w-4 h-4 mr-1" />新增网关
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">运行中</p>
                <p className="text-2xl font-bold text-green-600">{runningCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已停用</p>
                <p className="text-2xl font-bold text-gray-600">{stoppedCount}</p>
              </div>
              <Square className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">异常</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">合约总数</p>
                <p className="text-2xl font-bold text-indigo-600">{contracts.length}</p>
              </div>
              <FileCode className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gateways">
            <Server className="w-4 h-4 mr-1" />跨链网关
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileCode className="w-4 h-4 mr-1" />跨链合约
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="w-4 h-4 mr-1" />统计分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <PageSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="搜索网关名称/地址/链类型..."
            onReset={() => setSearchTerm("")}
          />

          <DataTable
            data={filteredGateways}
            columns={gatewayColumns}
            rowKey={(row) => row.id}
          />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <DataTable
            data={contracts}
            columns={contractColumns}
            rowKey={(row) => row.id}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "跨链交易总数", value: "12,456", icon: <ArrowLeftRight className="w-5 h-5" /> },
              { label: "成功交易", value: "12,198", icon: <Activity className="w-5 h-5" /> },
              { label: "成功率", value: "97.9%", icon: <BarChart3 className="w-5 h-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                  <div className="text-indigo-600">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium mb-4">跨链交易趋势</h3>
            <div className="h-48 flex items-end gap-4">
              {[
                { date: "周一", count: 45 },
                { date: "周二", count: 62 },
                { date: "周三", count: 38 },
                { date: "周四", count: 78 },
                { date: "周五", count: 55 },
                { date: "周六", count: 32 },
                { date: "周日", count: 28 },
              ].map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-500">{item.count}</div>
                  <div
                    className="w-full bg-indigo-500 rounded-t-md"
                    style={{ height: `${item.count * 2}px` }}
                  />
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailGateway} onOpenChange={() => setDetailGateway(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>网关详情</DialogTitle>
          </DialogHeader>
          {detailGateway && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">网关名称</Label>
                  <p className="font-medium">{detailGateway.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">链类型</Label>
                  <p className="font-medium">{detailGateway.chainType}</p>
                </div>
                <div>
                  <Label className="text-gray-500">主机用户</Label>
                  <p className="font-medium">{detailGateway.hostUser}</p>
                </div>
                <div>
                  <Label className="text-gray-500">对外端口</Label>
                  <p className="font-medium">{detailGateway.externalPort}</p>
                </div>
                <div>
                  <Label className="text-gray-500">网关地址</Label>
                  <p className="font-medium font-mono">{detailGateway.gatewayAddress}</p>
                </div>
                <div>
                  <Label className="text-gray-500">端口</Label>
                  <p className="font-medium">{detailGateway.port}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">描述</Label>
                <p className="text-sm">{detailGateway.description}</p>
              </div>
              <div>
                <Label className="text-gray-500">创建时间</Label>
                <p className="text-sm">{detailGateway.createTime}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editGateway} onOpenChange={() => setEditGateway(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑网关</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>网关名称</Label>
              <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>描述</Label>
              <Input value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div>
              <Label>主机用户</Label>
              <Input value={editForm.hostUser || ""} onChange={(e) => setEditForm({ ...editForm, hostUser: e.target.value })} />
            </div>
            <div>
              <Label>网关地址</Label>
              <Input value={editForm.gatewayAddress || ""} onChange={(e) => setEditForm({ ...editForm, gatewayAddress: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGateway(null)}>取消</Button>
            <Button onClick={handleSaveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
