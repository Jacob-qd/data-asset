import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";
import {
  Plus, Play, Square, Network,
  Server, Activity, Shield, Globe, Link2, Zap, CheckCircle, XCircle,
  ArrowLeftRight, Clock, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BlockchainNetwork {
  id: string;
  name: string;
  chainType: string;
  consensus: string;
  nodeCount: number;
  blockHeight: number;
  tps: number;
  status: "running" | "stopped" | "syncing" | "error";
  createTime: string;
  orgs: string[];
  description: string;
}

interface NetworkNode {
  id: string;
  name: string;
  networkId: string;
  networkName: string;
  org: string;
  role: "orderer" | "peer" | " endorser";
  status: "online" | "offline" | "syncing";
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  ip: string;
  port: string;
}

const mockNetworks: BlockchainNetwork[] = [
  {
    id: "NET-001",
    name: "金融联盟链-main",
    chainType: "Hyperledger Fabric",
    consensus: "Raft",
    nodeCount: 8,
    blockHeight: 2458321,
    tps: 1250,
    status: "running",
    createTime: "2025-08-15 10:30:00",
    orgs: ["科技公司甲", "金融科技丁", "数据研究院乙"],
    description: "金融行业数据共享联盟链，支持隐私计算任务调度",
  },
  {
    id: "NET-002",
    name: "医疗数据链",
    chainType: "Hyperledger Fabric",
    consensus: "Kafka",
    nodeCount: 6,
    blockHeight: 1289456,
    tps: 800,
    status: "running",
    createTime: "2025-10-20 14:00:00",
    orgs: ["数据研究院乙", "智能科技丙"],
    description: "医疗健康数据跨机构共享网络",
  },
  {
    id: "NET-003",
    name: "政务数据链",
    chainType: "FISCO BCOS",
    consensus: "PBFT",
    nodeCount: 12,
    blockHeight: 3892451,
    tps: 3200,
    status: "running",
    createTime: "2025-06-01 09:00:00",
    orgs: ["科技公司甲", "数据研究院乙", "智能科技丙", "金融科技丁"],
    description: "政府数据上链存证与共享",
  },
  {
    id: "NET-004",
    name: "测试链-dev",
    chainType: "Ethereum",
    consensus: "PoA",
    nodeCount: 3,
    blockHeight: 45210,
    tps: 15,
    status: "stopped",
    createTime: "2026-01-10 16:00:00",
    orgs: ["科技公司甲"],
    description: "开发测试环境",
  },
  {
    id: "NET-005",
    name: "供应链溯源链",
    chainType: "Hyperledger Fabric",
    consensus: "Raft",
    nodeCount: 5,
    blockHeight: 567832,
    tps: 600,
    status: "syncing",
    createTime: "2025-12-05 11:00:00",
    orgs: ["智能科技丙", "金融科技丁"],
    description: "商品全生命周期溯源",
  },
];

const mockNodes: NetworkNode[] = [
  { id: "NODE-001", name: "orderer1", networkId: "NET-001", networkName: "金融联盟链-main", org: "科技公司甲", role: "orderer", status: "online", cpu: 32, memory: 45, disk: 60, uptime: "45天12小时", ip: "192.168.1.101", port: "7050" },
  { id: "NODE-002", name: "peer0-org1", networkId: "NET-001", networkName: "金融联盟链-main", org: "科技公司甲", role: "peer", status: "online", cpu: 28, memory: 52, disk: 45, uptime: "45天12小时", ip: "192.168.1.102", port: "7051" },
  { id: "NODE-003", name: "peer1-org1", networkId: "NET-001", networkName: "金融联盟链-main", org: "科技公司甲", role: "peer", status: "online", cpu: 25, memory: 48, disk: 50, uptime: "45天10小时", ip: "192.168.1.103", port: "7051" },
  { id: "NODE-004", name: "peer0-org2", networkId: "NET-001", networkName: "金融联盟链-main", org: "金融科技丁", role: "peer", status: "online", cpu: 30, memory: 55, disk: 55, uptime: "45天12小时", ip: "192.168.2.101", port: "7051" },
  { id: "NODE-005", name: "peer0-org3", networkId: "NET-001", networkName: "金融联盟链-main", org: "数据研究院乙", role: "peer", status: "syncing", cpu: 45, memory: 62, disk: 70, uptime: "2小时15分", ip: "192.168.3.101", port: "7051" },
  { id: "NODE-006", name: "orderer1", networkId: "NET-002", networkName: "医疗数据链", org: "数据研究院乙", role: "orderer", status: "online", cpu: 20, memory: 35, disk: 40, uptime: "30天5小时", ip: "192.168.4.101", port: "7050" },
  { id: "NODE-007", name: "peer0-org1", networkId: "NET-002", networkName: "医疗数据链", org: "数据研究院乙", role: "peer", status: "online", cpu: 22, memory: 38, disk: 42, uptime: "30天5小时", ip: "192.168.4.102", port: "7051" },
  { id: "NODE-008", name: "peer0-org2", networkId: "NET-002", networkName: "医疗数据链", org: "智能科技丙", role: "peer", status: "offline", cpu: 0, memory: 0, disk: 0, uptime: "—", ip: "192.168.5.101", port: "7051" },
  { id: "NODE-009", name: "node1", networkId: "NET-003", networkName: "政务数据链", org: "科技公司甲", role: "peer", status: "online", cpu: 18, memory: 30, disk: 35, uptime: "120天8小时", ip: "10.0.1.101", port: "30303" },
  { id: "NODE-010", name: "node2", networkId: "NET-003", networkName: "政务数据链", org: "数据研究院乙", role: "peer", status: "online", cpu: 15, memory: 28, disk: 32, uptime: "120天8小时", ip: "10.0.1.102", port: "30303" },
];

export default function BlockchainNetworks() {
  const [networks, setNetworks] = useState(mockNetworks);
  const [nodes] = useState(mockNodes);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("networks");
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork | null>(null);

  const filteredNetworks = networks.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.chainType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNodes = selectedNetwork
    ? nodes.filter((n) => n.networkId === selectedNetwork.id)
    : nodes;

  const handleStart = (id: string) => {
    setNetworks(networks.map((n) => n.id === id ? { ...n, status: "running" } : n));
    toast.success("网络已启动");
  };

  const handleStop = (id: string) => {
    setNetworks(networks.map((n) => n.id === id ? { ...n, status: "stopped" } : n));
    toast.success("网络已停止");
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除该网络？")) {
      setNetworks(networks.filter((n) => n.id !== id));
      toast.success("网络已删除");
    }
  };

  const networkColumns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: BlockchainNetwork, index: number) => index + 1 },
    {
      key: "name", title: "网络名称",
      render: (row: BlockchainNetwork) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      ),
    },
    {
      key: "chainType", title: "链类型",
      render: (row: BlockchainNetwork) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {row.chainType}
        </Badge>
      ),
    },
    { key: "consensus", title: "共识机制", render: (row: BlockchainNetwork) => row.consensus },
    { key: "nodeCount", title: "节点数", render: (row: BlockchainNetwork) => <span className="font-medium">{row.nodeCount}</span> },
    {
      key: "blockHeight", title: "区块高度",
      render: (row: BlockchainNetwork) => <span className="font-mono text-sm">{row.blockHeight.toLocaleString()}</span>,
    },
    { key: "tps", title: "TPS", render: (row: BlockchainNetwork) => <span className="font-medium text-emerald-600">{row.tps}</span> },
    {
      key: "status", title: "状态",
      render: (row: BlockchainNetwork) => {
        const statusConfig = {
          running: { label: "运行中", color: "bg-green-100 text-green-700" },
          stopped: { label: "已停止", color: "bg-gray-100 text-gray-700" },
          syncing: { label: "同步中", color: "bg-yellow-100 text-yellow-700" },
          error: { label: "异常", color: "bg-red-100 text-red-700" },
        };
        const cfg = statusConfig[row.status];
        return <Badge className={cfg.color}>{cfg.label}</Badge>;
      },
    },
    {
      key: "actions", title: "操作", width: "w-40",
      render: (row: BlockchainNetwork) => (
        <div className="flex items-center gap-1">
          {row.status === "stopped" && (
            <Button variant="ghost" size="sm" onClick={() => handleStart(row.id)}>
              <Play className="w-4 h-4 text-green-600" />
            </Button>
          )}
          {row.status === "running" && (
            <Button variant="ghost" size="sm" onClick={() => handleStop(row.id)}>
              <Square className="w-4 h-4 text-yellow-600" />
            </Button>
          )}
          <ActionButtons buttons={[
            createViewAction(() => setSelectedNetwork(row)),
            createEditAction(() => toast.info("编辑功能开发中")),
            createDeleteAction(() => handleDelete(row.id)),
          ]} />
        </div>
      ),
    },
  ];

  const nodeColumns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: NetworkNode, index: number) => index + 1 },
    {
      key: "name", title: "节点名称",
      render: (row: NetworkNode) => (
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { key: "networkName", title: "所属网络", render: (row: NetworkNode) => row.networkName },
    { key: "org", title: "所属组织", render: (row: NetworkNode) => row.org },
    {
      key: "role", title: "角色",
      render: (row: NetworkNode) => (
        <Badge variant="outline" className={cn(
          row.role === "orderer" && "bg-purple-50 text-purple-700",
          row.role === "peer" && "bg-blue-50 text-blue-700",
        )}>
          {row.role === "orderer" ? "排序节点" : "Peer节点"}
        </Badge>
      ),
    },
    {
      key: "status", title: "状态",
      render: (row: NetworkNode) => (
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", row.status === "online" ? "bg-green-500" : row.status === "syncing" ? "bg-yellow-500" : "bg-red-500")} />
          <span className="text-sm">{row.status === "online" ? "在线" : row.status === "syncing" ? "同步中" : "离线"}</span>
        </div>
      ),
    },
    {
      key: "resources", title: "资源使用",
      render: (row: NetworkNode) => row.status === "offline" ? <span className="text-gray-400">—</span> : (
        <div className="space-y-1 w-32">
          <ResourceBar label="CPU" value={row.cpu} color="bg-blue-500" />
          <ResourceBar label="内存" value={row.memory} color="bg-green-500" />
          <ResourceBar label="磁盘" value={row.disk} color="bg-orange-500" />
        </div>
      ),
    },
    { key: "uptime", title: "运行时间", render: (row: NetworkNode) => <span className="text-sm text-gray-500">{row.uptime}</span> },
    { key: "ip", title: "IP:Port", render: (row: NetworkNode) => <code className="text-xs bg-gray-100 px-1 rounded">{row.ip}:{row.port}</code> },
  ];

  const runningCount = networks.filter((n) => n.status === "running").length;
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter((n) => n.status === "online").length;
  const totalBlockHeight = networks.reduce((sum, n) => sum + n.blockHeight, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="链网络"
        badge={`${networks.length} 个网络`}
        actions={
          <Button onClick={() => toast.info("创建网络功能开发中")}>
            <Plus className="w-4 h-4 mr-2" />创建网络
          </Button>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{runningCount}/{networks.length}</div>
                <div className="text-sm text-gray-500">运行中网络</div>
              </div>
              <Network className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{onlineNodes}/{totalNodes}</div>
                <div className="text-sm text-gray-500">在线节点</div>
              </div>
              <Server className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold font-mono">{totalBlockHeight.toLocaleString()}</div>
                <div className="text-sm text-gray-500">总区块高度</div>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{Math.round(networks.filter((n) => n.status === "running").reduce((sum, n) => sum + n.tps, 0) / Math.max(runningCount, 1))}</div>
                <div className="text-sm text-gray-500">平均 TPS</div>
              </div>
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="networks">网络列表</TabsTrigger>
          <TabsTrigger value="nodes">节点监控</TabsTrigger>
        </TabsList>

        <TabsContent value="networks" className="space-y-4 mt-4">
          <PageSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="搜索网络名称或链类型..."
            onReset={() => setSearchTerm("")}
          />
          <DataTable data={filteredNetworks} columns={networkColumns} rowKey={(row) => row.id} />
        </TabsContent>

        <TabsContent value="nodes" className="space-y-4 mt-4">
          {selectedNetwork && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <span>当前查看：</span>
              <Badge className="bg-blue-100 text-blue-700">{selectedNetwork.name}</Badge>
              <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setSelectedNetwork(null)}>
                查看全部
              </Button>
            </div>
          )}
          <DataTable data={filteredNodes} columns={nodeColumns} rowKey={(row) => row.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-8">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 w-8 text-right">{value}%</span>
    </div>
  );
}
