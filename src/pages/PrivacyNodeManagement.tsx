import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search, Plus, Edit, Eye, Trash2, Network, Server,
  CheckCircle, XCircle, Activity, Cpu, HardDrive, Wifi,
  ArrowRight, Shield, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface PrivacyNode {
  id: string;
  name: string;
  version: string;
  networkAddress: string;
  remark: string;
  status: "online" | "offline";
  latency?: number;
  // 详情字段
  projectStatus?: string;
  envStatus?: string;
  envEntry?: string;
  networkStatus?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkSpeed?: string;
  lastHeartbeat?: string;
  nodeRole?: string;
  region?: string;
}

const mockNodes: PrivacyNode[] = [
  {
    id: "NODE-001",
    name: "华为云隐私计算节点",
    version: "2.1.0",
    networkAddress: "https://privacy.huaweicloud.com/node001",
    remark: "华为云计算技术有限公司主节点，负责华北地区隐私计算任务调度",
    status: "online",
    latency: 12,
    projectStatus: "运行中",
    envStatus: "正常",
    envEntry: "https://console.huaweicloud.com/privacy",
    networkStatus: "已组网",
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkSpeed: "1Gbps",
    lastHeartbeat: "2026-04-28 14:32:18",
    nodeRole: "协调节点",
    region: "华北-北京",
  },
  {
    id: "NODE-002",
    name: "阿里云隐私计算节点",
    version: "2.0.5",
    networkAddress: "https://privacy.aliyun.com/node002",
    remark: "阿里云计算有限公司节点，支持多方安全计算",
    status: "online",
    latency: 8,
    projectStatus: "运行中",
    envStatus: "正常",
    envEntry: "https://console.aliyun.com/privacy",
    networkStatus: "已组网",
    cpuUsage: 32,
    memoryUsage: 48,
    diskUsage: 25,
    networkSpeed: "10Gbps",
    lastHeartbeat: "2026-04-28 14:33:05",
    nodeRole: "计算节点",
    region: "华东-杭州",
  },
  {
    id: "NODE-003",
    name: "腾讯云隐私计算节点",
    version: "1.9.8",
    networkAddress: "https://privacy.tencentcloud.com/node003",
    remark: "腾讯云计算（北京）有限责任公司",
    status: "offline",
    projectStatus: "已停止",
    envStatus: "异常",
    envEntry: "https://console.tencentcloud.com/privacy",
    networkStatus: "未组网",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkSpeed: "-",
    lastHeartbeat: "2026-04-28 10:15:30",
    nodeRole: "计算节点",
    region: "华南-广州",
  },
  {
    id: "NODE-004",
    name: "京东云隐私计算节点",
    version: "2.1.2",
    networkAddress: "https://privacy.jdcloud.com/node004",
    remark: "京东科技控股股份有限公司，电商数据联合建模场景",
    status: "online",
    latency: 15,
    projectStatus: "运行中",
    envStatus: "正常",
    envEntry: "https://console.jdcloud.com/privacy",
    networkStatus: "已组网",
    cpuUsage: 58,
    memoryUsage: 71,
    diskUsage: 42,
    networkSpeed: "5Gbps",
    lastHeartbeat: "2026-04-28 14:32:45",
    nodeRole: "计算节点",
    region: "华北-北京",
  },
  {
    id: "NODE-005",
    name: "百度智能云隐私计算节点",
    version: "2.0.1",
    networkAddress: "https://privacy.baidu.com/node005",
    remark: "百度在线网络技术（北京）有限公司，AI模型训练场景",
    status: "online",
    latency: 20,
    projectStatus: "运行中",
    envStatus: "正常",
    envEntry: "https://console.baidu.com/privacy",
    networkStatus: "已组网",
    cpuUsage: 67,
    memoryUsage: 55,
    diskUsage: 60,
    networkSpeed: "2Gbps",
    lastHeartbeat: "2026-04-28 14:31:58",
    nodeRole: "协调节点",
    region: "华东-上海",
  },
  {
    id: "NODE-006",
    name: "字节跳动隐私计算节点",
    version: "1.8.5",
    networkAddress: "https://privacy.bytedance.com/node006",
    remark: "北京字节跳动科技有限公司，推荐算法联邦学习",
    status: "offline",
    projectStatus: "已停止",
    envStatus: "维护中",
    envEntry: "https://console.bytedance.com/privacy",
    networkStatus: "未组网",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkSpeed: "-",
    lastHeartbeat: "2026-04-27 22:00:15",
    nodeRole: "计算节点",
    region: "华北-北京",
  },
];

const nodeFormFields: FieldConfig[] = [
  { key: "name", label: "节点名称", type: "text", required: true },
  { key: "version", label: "版本号", type: "text", required: true },
  { key: "networkAddress", label: "网络地址", type: "text", required: true },
  { key: "remark", label: "备注信息", type: "textarea" },
  { key: "status", label: "状态", type: "select", options: [
    { label: "在线", value: "online" },
    { label: "离线", value: "offline" },
  ], required: true },
  { key: "nodeRole", label: "节点角色", type: "select", options: [
    { label: "协调节点", value: "协调节点" },
    { label: "计算节点", value: "计算节点" },
    { label: "数据节点", value: "数据节点" },
  ]},
  { key: "region", label: "所属区域", type: "text" },
];

export default function PrivacyNodeManagement() {
  const [nodes, setNodes] = useState<PrivacyNode[]>(mockNodes);
  const [searchTerm, setSearchTerm] = useState("");
  const [testingNode, setTestingNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<PrivacyNode | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredNodes = nodes.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.networkAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.remark.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnectivityTest = (nodeId: string) => {
    setTestingNode(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    setTimeout(() => {
      setTestingNode(null);
      if (node?.status === "online") {
        const latency = Math.floor(Math.random() * 30) + 5;
        toast.success(`连通测试成功，延迟 ${latency}ms`);
        setNodes(nodes.map((n) => n.id === nodeId ? { ...n, latency } : n));
      } else {
        toast.error("连通测试失败，节点离线");
      }
    }, 1500);
  };

  const handleCreate = (data: Record<string, any>) => {
    const newNode: PrivacyNode = {
      id: `NODE-${Date.now().toString(36).toUpperCase().slice(-4)}`,
      name: data.name,
      version: data.version,
      networkAddress: data.networkAddress,
      remark: data.remark || "",
      status: data.status,
      nodeRole: data.nodeRole || "计算节点",
      region: data.region || "",
      projectStatus: data.status === "online" ? "运行中" : "已停止",
      envStatus: data.status === "online" ? "正常" : "异常",
      envEntry: data.networkAddress,
      networkStatus: "未组网",
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkSpeed: "-",
      lastHeartbeat: "-",
    };
    setNodes([newNode, ...nodes]);
    setCreateOpen(false);
    toast.success("节点创建成功");
  };

  const handleEdit = (data: Record<string, any>) => {
    if (selectedNode) {
      setNodes(nodes.map((n) =>
        n.id === selectedNode.id
          ? { ...n, ...data, projectStatus: data.status === "online" ? "运行中" : "已停止", envStatus: data.status === "online" ? "正常" : "异常" }
          : n
      ));
      setEditOpen(false);
      toast.success("节点信息更新成功");
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      setNodes(nodes.filter((n) => n.id !== selectedNode.id));
      setDeleteOpen(false);
      toast.success("节点已删除");
    }
  };

  const openDetail = (node: PrivacyNode) => {
    setSelectedNode(node);
    setDetailOpen(true);
  };

  const openEdit = (node: PrivacyNode) => {
    setSelectedNode(node);
    setEditOpen(true);
  };

  const openDelete = (node: PrivacyNode) => {
    setSelectedNode(node);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">隐私计算节点管理</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增隐私计算节点
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索节点名称或版本号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">查询</Button>
        <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>重置</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总节点数</p>
                <p className="text-2xl font-bold">{nodes.length}</p>
              </div>
              <Server className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">在线节点</p>
                <p className="text-2xl font-bold text-green-600">
                  {nodes.filter((n) => n.status === "online").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">离线节点</p>
                <p className="text-2xl font-bold text-gray-500">
                  {nodes.filter((n) => n.status === "offline").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已组网</p>
                <p className="text-2xl font-bold text-blue-600">
                  {nodes.filter((n) => n.networkStatus === "已组网").length}
                </p>
              </div>
              <Network className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => (
          <Card key={node.id} className={cn("hover:shadow-md transition-shadow", node.status === "offline" && "opacity-75")}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{node.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      版本号: {node.version}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={node.status === "online" ? "default" : "secondary"}
                  className={cn(
                    node.status === "online" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {node.status === "online" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />在线
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />离线
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Network className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">网络地址:</span>
                  <span className="text-sm font-mono truncate">{node.networkAddress}</span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Server className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-500 shrink-0">备注信息:</span>
                  <span className="text-sm text-gray-600 break-all">{node.remark}</span>
                </div>

                {node.latency !== undefined && node.status === "online" && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={cn("w-2 h-2 rounded-full", node.latency < 20 ? "bg-green-500" : "bg-yellow-500")} />
                    <span className="text-gray-500">延迟:</span>
                    <span className="font-medium">{node.latency}ms</span>
                  </div>
                )}

                {node.status === "offline" && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-gray-500">延迟:</span>
                    <span className="font-medium text-gray-400">--</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => openEdit(node)}>
                  <Edit className="w-3 h-3 mr-1" />编辑
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => openDetail(node)}>
                  <Eye className="w-3 h-3 mr-1" />详情
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600" onClick={() => openDelete(node)}>
                  <Trash2 className="w-3 h-3 mr-1" />删除
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs ml-auto"
                  onClick={() => handleConnectivityTest(node.id)}
                  disabled={testingNode === node.id}
                >
                  {testingNode === node.id ? (
                    <>测试中...</>
                  ) : (
                    <>
                      <Network className="w-3 h-3 mr-1" />连通测试
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <CrudDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="新增隐私计算节点"
        fields={nodeFormFields}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Edit Dialog */}
      {selectedNode && (
        <CrudDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          title="编辑隐私计算节点"
          fields={nodeFormFields}
          data={selectedNode}
          onSubmit={handleEdit}
          mode="edit"
        />
      )}

      {/* Delete Dialog */}
      {selectedNode && (
        <CrudDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={selectedNode.name}
          fields={[]}
          onSubmit={handleDelete}
          onDelete={handleDelete}
          mode="delete"
        />
      )}

      {/* Detail Drawer with Tabs */}
      {selectedNode && (
        <DetailDrawer
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={selectedNode.name}
          data={selectedNode}
          fields={[
            { key: "id", label: "节点编号", type: "text" },
            { key: "name", label: "节点名称", type: "text" },
            { key: "version", label: "版本号", type: "text" },
            { key: "status", label: "节点状态", type: "badge" },
            { key: "nodeRole", label: "节点角色", type: "badge" },
            { key: "region", label: "所属区域", type: "text" },
            { key: "networkAddress", label: "网络地址", type: "text" },
            { key: "remark", label: "备注信息", type: "text" },
            { key: "latency", label: "网络延迟", type: "text" },
          ]}
          onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
          onDelete={() => { setDetailOpen(false); setDeleteOpen(true); }}
        >
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">环境概览</TabsTrigger>
              <TabsTrigger value="resources">资源监控</TabsTrigger>
              <TabsTrigger value="network">网络状态</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-500">项目状态</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{selectedNode.projectStatus || "--"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-500">环境状态</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{selectedNode.envStatus || "--"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-500">环境入口</span>
                    </div>
                    <p className="text-sm font-mono mt-1 truncate">{selectedNode.envEntry || "--"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-500">组网状态</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{selectedNode.networkStatus || "--"}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">节点信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">最后心跳</span>
                    <span>{selectedNode.lastHeartbeat || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">网络速度</span>
                    <span>{selectedNode.networkSpeed || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">节点角色</span>
                    <Badge variant="outline">{selectedNode.nodeRole || "--"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">所属区域</span>
                    <span>{selectedNode.region || "--"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 mt-4">
              {selectedNode.status === "online" ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          CPU 使用率
                        </span>
                        <span>{selectedNode.cpuUsage}%</span>
                      </div>
                      <Progress value={selectedNode.cpuUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-500" />
                          内存使用率
                        </span>
                        <span>{selectedNode.memoryUsage}%</span>
                      </div>
                      <Progress value={selectedNode.memoryUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-orange-500" />
                          磁盘使用率
                        </span>
                        <span>{selectedNode.diskUsage}%</span>
                      </div>
                      <Progress value={selectedNode.diskUsage} className="h-2" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Server className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>节点离线，无法获取资源信息</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="network" className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Wifi className="w-4 h-4 text-green-500" />
                    网络连通性
                  </span>
                  <Badge variant={selectedNode.status === "online" ? "default" : "secondary"}>
                    {selectedNode.status === "online" ? "正常" : "断开"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    网络延迟
                  </span>
                  <span className="text-sm font-medium">
                    {selectedNode.latency !== undefined ? `${selectedNode.latency}ms` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Network className="w-4 h-4 text-purple-500" />
                    组网状态
                  </span>
                  <Badge variant="outline">{selectedNode.networkStatus || "--"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    网络地址
                  </span>
                  <span className="text-sm font-mono truncate max-w-[200px]">{selectedNode.networkAddress}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleConnectivityTest(selectedNode.id)}
                  disabled={testingNode === selectedNode.id}
                >
                  {testingNode === selectedNode.id ? "测试中..." : "执行连通测试"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DetailDrawer>
      )}
    </div>
  );
}