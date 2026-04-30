import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Radio, Wifi, Plus, CheckCircle2, AlertTriangle, Globe, Lock,
  Play, Square, Settings, Network, Shield,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NetworkNode {
  id: string;
  name: string;
  address: string;
  protocol: string;
  latency: string;
  status: "online" | "offline" | "maintenance";
  encrypted: boolean;
  description?: string;
  created?: string;
}

interface NetworkChannel {
  id: string;
  name: string;
  source: string;
  target: string;
  protocol: string;
  bandwidth: string;
  packets: string;
  errors: number;
  status: "active" | "inactive";
  description?: string;
}

interface ProtocolConfig {
  id: string;
  name: string;
  type: string;
  version: string;
  port: number;
  encryption: string;
  status: "enabled" | "disabled";
  description?: string;
}

const initialNodes: NetworkNode[] = [
  { id: "NODE-001", name: "协调节点-A", address: "10.0.1.10:8080", protocol: "TLS 1.3 + mTLS", latency: "2ms", status: "online", encrypted: true, description: "主协调节点", created: "2024-01-10" },
  { id: "NODE-002", name: "参与方节点-B", address: "10.0.2.10:8080", protocol: "TLS 1.3 + mTLS", latency: "8ms", status: "online", encrypted: true, description: "参与方B通信节点", created: "2024-02-15" },
  { id: "NODE-003", name: "参与方节点-C", address: "10.0.3.10:8080", protocol: "TLS 1.3 + mTLS", latency: "12ms", status: "online", encrypted: true, description: "参与方C通信节点", created: "2024-03-01" },
  { id: "NODE-004", name: "参与方节点-D", address: "10.0.4.10:8080", protocol: "QUIC + Noise", latency: "-", status: "offline", encrypted: true, description: "参与方D通信节点", created: "2024-03-15" },
];

const initialChannels: NetworkChannel[] = [
  { id: "CH-001", name: "A-B通道", source: "NODE-001", target: "NODE-002", protocol: "gRPC over TLS", bandwidth: "1Gbps", packets: "12.5M", errors: 0, status: "active", description: "协调节点到参与方B" },
  { id: "CH-002", name: "A-C通道", source: "NODE-001", target: "NODE-003", protocol: "gRPC over TLS", bandwidth: "1Gbps", packets: "8.3M", errors: 2, status: "active", description: "协调节点到参与方C" },
  { id: "CH-003", name: "B-C通道", source: "NODE-002", target: "NODE-003", protocol: "P2P Direct", bandwidth: "500Mbps", packets: "5.1M", errors: 0, status: "active", description: "参与方B到参与方C" },
];

const initialProtocols: ProtocolConfig[] = [
  { id: "PROTO-001", name: "gRPC over TLS", type: "RPC", version: "1.58", port: 8080, encryption: "TLS 1.3", status: "enabled", description: "基于TLS的gRPC通信协议" },
  { id: "PROTO-002", name: "QUIC + Noise", type: "P2P", version: "1.0", port: 8443, encryption: "Noise Protocol", status: "enabled", description: "基于QUIC的P2P通信协议" },
  { id: "PROTO-003", name: "WebSocket Secure", type: "WebSocket", version: "13", port: 443, encryption: "TLS 1.3", status: "disabled", description: "安全的WebSocket通信协议" },
];

const nodeFields: FieldConfig[] = [
  { key: "name", label: "节点名称", type: "text", required: true },
  { key: "address", label: "地址", type: "text", required: true, placeholder: "例如: 10.0.1.10:8080" },
  { key: "protocol", label: "协议", type: "select", required: true, options: [
    { label: "TLS 1.3 + mTLS", value: "TLS 1.3 + mTLS" },
    { label: "QUIC + Noise", value: "QUIC + Noise" },
    { label: "WebSocket Secure", value: "WebSocket Secure" },
    { label: "TCP + Noise", value: "TCP + Noise" },
  ]},
  { key: "description", label: "描述", type: "textarea" },
];

const channelFields: FieldConfig[] = [
  { key: "name", label: "通道名称", type: "text", required: true },
  { key: "source", label: "源节点", type: "select", required: true, options: [
    { label: "协调节点-A", value: "NODE-001" },
    { label: "参与方节点-B", value: "NODE-002" },
    { label: "参与方节点-C", value: "NODE-003" },
    { label: "参与方节点-D", value: "NODE-004" },
  ]},
  { key: "target", label: "目标节点", type: "select", required: true, options: [
    { label: "协调节点-A", value: "NODE-001" },
    { label: "参与方节点-B", value: "NODE-002" },
    { label: "参与方节点-C", value: "NODE-003" },
    { label: "参与方节点-D", value: "NODE-004" },
  ]},
  { key: "protocol", label: "协议", type: "select", required: true, options: [
    { label: "gRPC over TLS", value: "gRPC over TLS" },
    { label: "P2P Direct", value: "P2P Direct" },
    { label: "WebSocket Secure", value: "WebSocket Secure" },
  ]},
  { key: "bandwidth", label: "带宽", type: "text", required: true, placeholder: "例如: 1Gbps" },
  { key: "description", label: "描述", type: "textarea" },
];

const protocolFields: FieldConfig[] = [
  { key: "name", label: "协议名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "RPC", value: "RPC" },
    { label: "P2P", value: "P2P" },
    { label: "WebSocket", value: "WebSocket" },
    { label: "HTTP", value: "HTTP" },
  ]},
  { key: "version", label: "版本", type: "text", required: true },
  { key: "port", label: "端口", type: "number", required: true },
  { key: "encryption", label: "加密方式", type: "text", required: true },
  { key: "description", label: "描述", type: "textarea" },
];

export default function SecretNetwork() {
  const [nodes, setNodes] = useState<NetworkNode[]>(initialNodes);
  const [channels, setChannels] = useState<NetworkChannel[]>(initialChannels);
  const [protocols, setProtocols] = useState<ProtocolConfig[]>(initialProtocols);

  const [search, setSearch] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [protocolSearch, setProtocolSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogType, setDialogType] = useState<"node" | "channel" | "protocol">("node");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<"node" | "channel" | "protocol">("node");

  const filteredNodes = nodes.filter(n => n.name.includes(search) || n.id.includes(search));
  const filteredChannels = channels.filter(c => c.name.includes(channelSearch) || c.id.includes(channelSearch));
  const filteredProtocols = protocols.filter(p => p.name.includes(protocolSearch) || p.id.includes(protocolSearch));

  const openDialog = (type: typeof dialogType, mode: typeof dialogMode, item?: any) => {
    setDialogType(type);
    setDialogMode(mode);
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDrawer = (type: typeof drawerType, item: any) => {
    setDrawerType(type);
    setDrawerItem(item);
    setDrawerOpen(true);
  };

  const handleNodeSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newNode: NetworkNode = {
        id: `NODE-${String(nodes.length + 1).padStart(3, "0")}`,
        ...data,
        status: "offline",
        encrypted: true,
        latency: "-",
        created: new Date().toISOString().split("T")[0],
      };
      setNodes([...nodes, newNode]);
    } else if (dialogMode === "edit" && selectedItem) {
      setNodes(nodes.map(n => n.id === selectedItem.id ? { ...n, ...data } : n));
    }
  };

  const handleChannelSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newChannel: NetworkChannel = {
        id: `CH-${String(channels.length + 1).padStart(3, "0")}`,
        ...data,
        packets: "0",
        errors: 0,
        status: "active",
      };
      setChannels([...channels, newChannel]);
    } else if (dialogMode === "edit" && selectedItem) {
      setChannels(channels.map(c => c.id === selectedItem.id ? { ...c, ...data } : c));
    }
  };

  const handleProtocolSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newProtocol: ProtocolConfig = {
        id: `PROTO-${String(protocols.length + 1).padStart(3, "0")}`,
        ...data,
        status: "disabled",
      };
      setProtocols([...protocols, newProtocol]);
    } else if (dialogMode === "edit" && selectedItem) {
      setProtocols(protocols.map(p => p.id === selectedItem.id ? { ...p, ...data } : p));
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    switch (dialogType) {
      case "node": setNodes(nodes.filter(n => n.id !== selectedItem.id)); break;
      case "channel": setChannels(channels.filter(c => c.id !== selectedItem.id)); break;
      case "protocol": setProtocols(protocols.filter(p => p.id !== selectedItem.id)); break;
    }
    setDialogOpen(false);
  };

  const toggleNodeStatus = (id: string) => {
    setNodes(nodes.map(n => {
      if (n.id !== id) return n;
      return { ...n, status: n.status === "online" ? "offline" as const : "online" as const, latency: n.status === "online" ? "-" : `${Math.floor(Math.random() * 20) + 1}ms` };
    }));
  };

  const toggleChannelStatus = (id: string) => {
    setChannels(channels.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === "active" ? "inactive" as const : "active" as const };
    }));
  };

  const toggleProtocolStatus = (id: string) => {
    setProtocols(protocols.map(p => {
      if (p.id !== id) return p;
      return { ...p, status: p.status === "enabled" ? "disabled" as const : "enabled" as const };
    }));
  };

  const getDialogFields = () => {
    switch (dialogType) {
      case "node": return nodeFields;
      case "channel": return channelFields;
      case "protocol": return protocolFields;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "node": return "网络节点";
      case "channel": return "加密通道";
      case "protocol": return "通信协议";
    }
  };

  const getDrawerFields = () => {
    switch (drawerType) {
      case "node":
        return [
          { key: "id", label: "节点ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "address", label: "地址", type: "text" as const },
          { key: "protocol", label: "协议", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "latency", label: "延迟", type: "text" as const },
          { key: "encrypted", label: "加密", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
      case "channel":
        return [
          { key: "id", label: "通道ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "source", label: "源节点", type: "badge" as const },
          { key: "target", label: "目标节点", type: "badge" as const },
          { key: "protocol", label: "协议", type: "badge" as const },
          { key: "bandwidth", label: "带宽", type: "text" as const },
          { key: "packets", label: "包数量", type: "text" as const },
          { key: "errors", label: "错误数", type: "text" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
      case "protocol":
        return [
          { key: "id", label: "协议ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "type", label: "类型", type: "badge" as const },
          { key: "version", label: "版本", type: "text" as const },
          { key: "port", label: "端口", type: "text" as const },
          { key: "encryption", label: "加密", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
    }
  };

  const onlineCount = nodes.filter(n => n.status === "online").length;
  const activeChannels = channels.filter(c => c.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="网络通信"
        actions={
          <Button className="gap-2" onClick={() => openDialog("node", "create")}><Plus className="w-4 h-4" />添加节点</Button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Globe className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">{nodes.length}</div><div className="text-xs text-gray-500">网络节点</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Wifi className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">{onlineCount}</div><div className="text-xs text-gray-500">在线节点</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Radio className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">{activeChannels}</div><div className="text-xs text-gray-500">通信通道</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Lock className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">{Math.round((nodes.filter(n => n.encrypted).length / nodes.length) * 100)}%</div><div className="text-xs text-gray-500">通道加密率</div></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nodes" className="gap-2"><Network className="w-4 h-4" />网络节点</TabsTrigger>
          <TabsTrigger value="channels" className="gap-2"><Radio className="w-4 h-4" />加密通道</TabsTrigger>
          <TabsTrigger value="protocols" className="gap-2"><Settings className="w-4 h-4" />协议配置</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <PageSearchBar value={search} onChange={setSearch} placeholder="搜索节点..." onReset={() => setSearch("")} extraFilters={
            <Button variant="outline" className="gap-2" onClick={() => openDialog("node", "create")}><Plus className="w-4 h-4" />添加节点</Button>
          } />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">网络节点</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>地址</TableHead>
                    <TableHead>协议</TableHead><TableHead>延迟</TableHead><TableHead>状态</TableHead>
                    <TableHead>加密</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNodes.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-mono text-xs">{n.id}</TableCell>
                      <TableCell className="font-medium">{n.name}</TableCell>
                      <TableCell className="font-mono text-xs">{n.address}</TableCell>
                      <TableCell className="text-xs">{n.protocol}</TableCell>
                      <TableCell>{n.latency}</TableCell>
                      <TableCell>{n.status === "online" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />在线</Badge> : n.status === "offline" ? <Badge className="bg-red-50 text-red-700 gap-1"><AlertTriangle className="w-3 h-3" />离线</Badge> : <Badge className="bg-amber-50 text-amber-700">维护中</Badge>}</TableCell>
                      <TableCell>{n.encrypted ? <Badge className="bg-green-50 text-green-700">已加密</Badge> : <Badge className="bg-red-50 text-red-700">未加密</Badge>}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("node", n)),
                          createEditAction(() => openDialog("node", "edit", n)),
                          { key: "toggle", icon: n.status === "online" ? <Square className="w-4 h-4 text-red-600" /> : <Play className="w-4 h-4 text-green-600" />, label: n.status === "online" ? "停止" : "启动", className: n.status === "online" ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50", onClick: () => toggleNodeStatus(n.id) },
                          createDeleteAction(() => openDialog("node", "delete", n)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <PageSearchBar value={channelSearch} onChange={setChannelSearch} placeholder="搜索通道..." onReset={() => setChannelSearch("")} extraFilters={
            <Button variant="outline" className="gap-2" onClick={() => openDialog("channel", "create")}><Plus className="w-4 h-4" />创建通道</Button>
          } />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">加密通道</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>源节点</TableHead>
                    <TableHead>目标节点</TableHead><TableHead>协议</TableHead><TableHead>带宽</TableHead>
                    <TableHead>包数量</TableHead><TableHead>错误</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChannels.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-medium text-xs">{c.source}</TableCell>
                      <TableCell className="font-medium text-xs">{c.target}</TableCell>
                      <TableCell className="text-xs">{c.protocol}</TableCell>
                      <TableCell>{c.bandwidth}</TableCell>
                      <TableCell>{c.packets}</TableCell>
                      <TableCell className={c.errors > 0 ? "text-red-600" : "text-green-600"}>{c.errors}</TableCell>
                      <TableCell>{c.status === "active" ? <Badge className="bg-green-50 text-green-700">启用</Badge> : <Badge className="bg-gray-50 text-gray-700">禁用</Badge>}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("channel", c)),
                          createEditAction(() => openDialog("channel", "edit", c)),
                          { key: "toggle", icon: c.status === "active" ? <Square className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-green-600" />, label: c.status === "active" ? "禁用" : "启用", className: c.status === "active" ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50", onClick: () => toggleChannelStatus(c.id) },
                          createDeleteAction(() => openDialog("channel", "delete", c)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <PageSearchBar value={protocolSearch} onChange={setProtocolSearch} placeholder="搜索协议..." onReset={() => setProtocolSearch("")} extraFilters={
            <Button variant="outline" className="gap-2" onClick={() => openDialog("protocol", "create")}><Plus className="w-4 h-4" />添加协议</Button>
          } />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">通信协议配置</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>类型</TableHead>
                    <TableHead>版本</TableHead><TableHead>端口</TableHead><TableHead>加密</TableHead>
                    <TableHead>状态</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProtocols.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell>{p.version}</TableCell>
                      <TableCell>{p.port}</TableCell>
                      <TableCell><Badge variant="secondary">{p.encryption}</Badge></TableCell>
                      <TableCell>{p.status === "enabled" ? <Badge className="bg-green-50 text-green-700">已启用</Badge> : <Badge className="bg-gray-50 text-gray-700">已禁用</Badge>}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("protocol", p)),
                          createEditAction(() => openDialog("protocol", "edit", p)),
                          { key: "toggle", icon: p.status === "enabled" ? <Square className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-green-600" />, label: p.status === "enabled" ? "禁用" : "启用", className: p.status === "enabled" ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50", onClick: () => toggleProtocolStatus(p.id) },
                          createDeleteAction(() => openDialog("protocol", "delete", p)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={dialogOpen && dialogMode !== "delete"}
        onOpenChange={setDialogOpen}
        title={getDialogTitle()}
        fields={getDialogFields()}
        data={selectedItem}
        onSubmit={(data) => {
          switch (dialogType) {
            case "node": handleNodeSubmit(data); break;
            case "channel": handleChannelSubmit(data); break;
            case "protocol": handleProtocolSubmit(data); break;
          }
        }}
        mode={dialogMode}
      />

      {dialogMode === "delete" && dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />确认删除
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                确定要删除 <strong>{selectedItem?.name || selectedItem?.id}</strong> 吗？此操作不可撤销。
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerType === "node" ? "节点详情" : drawerType === "channel" ? "通道详情" : "协议详情"}
        data={drawerItem || {}}
        fields={getDrawerFields()}
        onEdit={() => {
          setDrawerOpen(false);
          openDialog(drawerType, "edit", drawerItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          openDialog(drawerType, "delete", drawerItem);
        }}
      />
    </div>
  );
}
