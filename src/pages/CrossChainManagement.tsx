import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/DataTable";
import {
  Search, Plus, Edit, Eye, Trash2, ArrowLeftRight,
  Settings, BarChart3, FileCode, Activity
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
  status: string;
  description: string;
}

interface CrossChainContract {
  id: string;
  name: string;
  chain: string;
  version: string;
  deployTime: string;
  status: string;
}

const mockGateways: CrossChainGateway[] = [
  {
    id: "GW-001",
    name: "gateway",
    hostUser: "root",
    externalPort: "22",
    gatewayAddress: "172.16.0.6",
    port: "8250",
    status: "stopped",
    description: "主跨链网关",
  },
  {
    id: "GW-002",
    name: "gateway-bak",
    hostUser: "admin",
    externalPort: "22",
    gatewayAddress: "172.16.0.7",
    port: "8251",
    status: "running",
    description: "备份跨链网关",
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
  },
  {
    id: "CON-002",
    name: "DataAnchor",
    chain: "Hyperledger",
    version: "2.1.0",
    deployTime: "2026-04-22 14:30:00",
    status: "active",
  },
];

export default function CrossChainManagement() {
  const [gateways, setGateways] = useState<CrossChainGateway[]>(mockGateways);
  const [contracts] = useState<CrossChainContract[]>(mockContracts);
  const [activeTab, setActiveTab] = useState("gateways");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGateways = gateways.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setGateways(gateways.map((g) =>
      g.id === id ? { ...g, status: g.status === "running" ? "stopped" : "running" } : g
    ));
    toast.success("状态已更新");
  };

  const gatewayColumns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: CrossChainGateway, index: number) => index + 1 },
    { key: "name", title: "网关名称" },
    { key: "hostUser", title: "主机用户" },
    { key: "externalPort", title: "主机对外端口" },
    { key: "gatewayAddress", title: "跨链网关地址" },
    { key: "port", title: "端口" },
    {
      key: "status",
      title: "状态",
      render: (row: CrossChainGateway) => (
        <Badge variant={row.status === "running" ? "default" : "secondary"}>
          {row.status === "running" ? "运行中" : "停用"}
        </Badge>
      ),
    },
    { key: "description", title: "描述" },
    {
      key: "actions",
      title: "操作",
      width: "w-48",
      render: (row: CrossChainGateway) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row.id)}>
            {row.status === "running" ? "停用" : "启用"}
          </Button>
          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
        </div>
      ),
    },
  ];

  const contractColumns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: CrossChainContract, index: number) => index + 1 },
    { key: "name", title: "合约名称" },
    { key: "chain", title: "所属链" },
    { key: "version", title: "版本" },
    { key: "deployTime", title: "部署时间" },
    {
      key: "status",
      title: "状态",
      render: (row: CrossChainContract) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status === "active" ? "已激活" : "未激活"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">跨链管理</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gateways">
            <Settings className="w-4 h-4 mr-1" />跨链网关
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileCode className="w-4 h-4 mr-1" />跨链合约
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="w-4 h-4 mr-1" />统计分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索网关名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">查询</Button>
            <Button variant="ghost" size="sm">重置</Button>
            <Button size="sm" onClick={() => toast.info("新增网关功能开发中")}>
              <Plus className="w-4 h-4 mr-1" />新增
            </Button>
          </div>

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
              { label: "跨链交易总数", value: "1,234", icon: <ArrowLeftRight className="w-5 h-5" /> },
              { label: "成功交易", value: "1,198", icon: <Activity className="w-5 h-5" /> },
              { label: "成功率", value: "97.1%", icon: <BarChart3 className="w-5 h-5" /> },
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
    </div>
  );
}
