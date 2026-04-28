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
import {
  Search, Plus, Edit, Eye, Trash2, Network,
  CheckCircle, XCircle, Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PrivacyNode {
  id: string;
  name: string;
  version: string;
  networkAddress: string;
  remark: string;
  status: string;
  latency?: number;
}

const mockNodes: PrivacyNode[] = [
  {
    id: "NODE-001",
    name: "山东区块链研究院隐私计算节点",
    version: "1",
    networkAddress: "https://ynppc.jntrustds.com/node076081",
    remark: "https://10.249.76.33:8443/node076081济南大数据集团有限公司",
    status: "online",
    latency: 12,
  },
  {
    id: "NODE-002",
    name: "中电云计算隐私计算节点",
    version: "2",
    networkAddress: "https://ynppc.jntrustds.com/node076082",
    remark: "中电云计算技术有限公司主节点",
    status: "online",
    latency: 8,
  },
  {
    id: "NODE-003",
    name: "神思电子隐私计算节点",
    version: "1",
    networkAddress: "https://ynppc.jntrustds.com/node076083",
    remark: "神思电子技术股份有限公司",
    status: "offline",
  },
];

export default function PrivacyNodeManagement() {
  const [nodes, setNodes] = useState<PrivacyNode[]>(mockNodes);
  const [searchTerm, setSearchTerm] = useState("");
  const [testingNode, setTestingNode] = useState<string | null>(null);

  const filteredNodes = nodes.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.networkAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnectivityTest = (nodeId: string) => {
    setTestingNode(nodeId);
    setTimeout(() => {
      setTestingNode(null);
      toast.success("连通测试成功，延迟 12ms");
    }, 1500);
  };

  const handleDelete = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    toast.success("节点已删除");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">隐私计算节点管理</h1>
        </div>
        <Button onClick={() => toast.info("新增节点功能开发中")}>
          <Plus className="w-4 h-4 mr-2" />
          新增隐私计算节点
        </Button>
      </div>

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
        <Button variant="ghost" size="sm">重置</Button>
      </div>

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

                {node.latency && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={cn("w-2 h-2 rounded-full", node.latency < 20 ? "bg-green-500" : "bg-yellow-500")} />
                    <span className="text-gray-500">延迟:</span>
                    <span className="font-medium">{node.latency}ms</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Edit className="w-3 h-3 mr-1" />编辑
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Eye className="w-3 h-3 mr-1" />详情
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600" onClick={() => handleDelete(node.id)}>
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
    </div>
  );
}
