import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CircuitBoard, Play, Pause, Search, Plus,
  CheckCircle2, AlertTriangle, Activity, Zap,
  Eye, Pencil, Trash2, Shield, FileCode, Layers,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Protocol {
  id: string;
  name: string;
  type: string;
  status: "active" | "standby" | "disabled";
  circuits: number;
  parties: number;
  latency: string;
  throughput: string;
  description?: string;
  created?: string;
}

interface Circuit {
  id: string;
  name: string;
  gates: number;
  depth: number;
  protocol: string;
  status: "optimized" | "review" | "deprecated";
  description?: string;
  created?: string;
}

interface SecretShare {
  id: string;
  protocol: string;
  threshold: number;
  totalShares: number;
  status: "active" | "revoked";
  created: string;
}

interface PreprocessTask {
  id: string;
  name: string;
  protocol: string;
  type: string;
  status: "running" | "completed" | "failed" | "pending";
  progress: number;
  created: string;
}

const initialProtocols: Protocol[] = [
  { id: "MPC-001", name: "SPDZ-2k", type: "dishonest-majority", status: "active", circuits: 128, parties: 5, latency: "12ms", throughput: "2.4k ops/s", description: "支持恶意多数方的SPDZ协议变体", created: "2024-01-15" },
  { id: "MPC-002", name: "GMW", type: "boolean", status: "active", circuits: 86, parties: 3, latency: "8ms", throughput: "4.1k ops/s", description: "布尔电路GMW协议", created: "2024-02-20" },
  { id: "MPC-003", name: "BMR", type: "constant-round", status: "standby", circuits: 42, parties: 4, latency: "-", throughput: "-", description: "常数轮BMR协议", created: "2024-03-10" },
  { id: "MPC-004", name: "ABY3", type: "3PC", status: "active", circuits: 64, parties: 3, latency: "5ms", throughput: "8.7k ops/s", description: "三方计算ABY3协议", created: "2024-03-15" },
];

const initialCircuits: Circuit[] = [
  { id: "CIRC-001", name: "比较电路", gates: 12500, depth: 24, protocol: "SPDZ-2k", status: "optimized", description: "用于安全比较操作", created: "2024-01-20" },
  { id: "CIRC-002", name: "乘法电路", gates: 8200, depth: 12, protocol: "ABY3", status: "optimized", description: "用于安全乘法操作", created: "2024-02-01" },
  { id: "CIRC-003", name: "排序电路", gates: 48600, depth: 56, protocol: "GMW", status: "review", description: "用于安全排序操作", created: "2024-02-15" },
  { id: "CIRC-004", name: "求交电路", gates: 15600, depth: 32, protocol: "SPDZ-2k", status: "optimized", description: "用于隐私求交操作", created: "2024-03-01" },
];

const initialShares: SecretShare[] = [
  { id: "SS-001", protocol: "SPDZ-2k", threshold: 3, totalShares: 5, status: "active", created: "2024-04-01" },
  { id: "SS-002", protocol: "ABY3", threshold: 2, totalShares: 3, status: "active", created: "2024-04-05" },
  { id: "SS-003", protocol: "GMW", threshold: 2, totalShares: 3, status: "revoked", created: "2024-03-20" },
];

const initialTasks: PreprocessTask[] = [
  { id: "TASK-001", name: "SPDZ三元组生成", protocol: "SPDZ-2k", type: "三元组", status: "running", progress: 65, created: "2024-04-10 10:00" },
  { id: "TASK-002", name: "ABY3比特生成", protocol: "ABY3", type: "比特共享", status: "completed", progress: 100, created: "2024-04-09 14:00" },
  { id: "TASK-003", name: "GMW预处理", protocol: "GMW", type: "OT扩展", status: "pending", progress: 0, created: "2024-04-11 09:00" },
];

const protocolFields: FieldConfig[] = [
  { key: "name", label: "协议名称", type: "text", required: true },
  { key: "type", label: "协议类型", type: "select", required: true, options: [
    { label: "恶意多数方", value: "dishonest-majority" },
    { label: "布尔电路", value: "boolean" },
    { label: "常数轮", value: "constant-round" },
    { label: "三方计算", value: "3PC" },
    { label: "两方计算", value: "2PC" },
  ]},
  { key: "circuits", label: "电路数", type: "number", required: true },
  { key: "parties", label: "参与方数", type: "number", required: true },
  { key: "latency", label: "延迟", type: "text", placeholder: "例如: 12ms" },
  { key: "throughput", label: "吞吐量", type: "text", placeholder: "例如: 2.4k ops/s" },
  { key: "description", label: "描述", type: "textarea" },
];

const circuitFields: FieldConfig[] = [
  { key: "name", label: "电路名称", type: "text", required: true },
  { key: "protocol", label: "所属协议", type: "select", required: true, options: [
    { label: "SPDZ-2k", value: "SPDZ-2k" },
    { label: "GMW", value: "GMW" },
    { label: "BMR", value: "BMR" },
    { label: "ABY3", value: "ABY3" },
  ]},
  { key: "gates", label: "门数量", type: "number", required: true },
  { key: "depth", label: "深度", type: "number", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已优化", value: "optimized" },
    { label: "待审", value: "review" },
    { label: "已废弃", value: "deprecated" },
  ]},
  { key: "description", label: "描述", type: "textarea" },
];

const shareFields: FieldConfig[] = [
  { key: "protocol", label: "所属协议", type: "select", required: true, options: [
    { label: "SPDZ-2k", value: "SPDZ-2k" },
    { label: "GMW", value: "GMW" },
    { label: "BMR", value: "BMR" },
    { label: "ABY3", value: "ABY3" },
  ]},
  { key: "threshold", label: "门限值", type: "number", required: true },
  { key: "totalShares", label: "总份额数", type: "number", required: true },
];

const taskFields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "protocol", label: "所属协议", type: "select", required: true, options: [
    { label: "SPDZ-2k", value: "SPDZ-2k" },
    { label: "GMW", value: "GMW" },
    { label: "BMR", value: "BMR" },
    { label: "ABY3", value: "ABY3" },
  ]},
  { key: "type", label: "任务类型", type: "select", required: true, options: [
    { label: "三元组", value: "三元组" },
    { label: "比特共享", value: "比特共享" },
    { label: "OT扩展", value: "OT扩展" },
    { label: "随机数", value: "随机数" },
  ]},
];

export default function MpcEngine() {
  const [protocols, setProtocols] = useState<Protocol[]>(initialProtocols);
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits);
  const [shares, setShares] = useState<SecretShare[]>(initialShares);
  const [tasks, setTasks] = useState<PreprocessTask[]>(initialTasks);

  const [search, setSearch] = useState("");
  const [circuitSearch, setCircuitSearch] = useState("");
  const [shareSearch, setShareSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogType, setDialogType] = useState<"protocol" | "circuit" | "share" | "task">("protocol");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<"protocol" | "circuit" | "share" | "task">("protocol");

  const filteredProtocols = protocols.filter(p => p.name.includes(search) || p.id.includes(search));
  const filteredCircuits = circuits.filter(c => c.name.includes(circuitSearch) || c.id.includes(circuitSearch));
  const filteredShares = shares.filter(s => s.protocol.includes(shareSearch) || s.id.includes(shareSearch));
  const filteredTasks = tasks.filter(t => t.name.includes(taskSearch) || t.id.includes(taskSearch));

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

  const handleProtocolSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newProtocol: Protocol = {
        id: `MPC-${String(protocols.length + 1).padStart(3, "0")}`,
        ...data,
        status: "standby",
        created: new Date().toISOString().split("T")[0],
      };
      setProtocols([...protocols, newProtocol]);
    } else if (dialogMode === "edit" && selectedItem) {
      setProtocols(protocols.map(p => p.id === selectedItem.id ? { ...p, ...data } : p));
    }
  };

  const handleCircuitSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newCircuit: Circuit = {
        id: `CIRC-${String(circuits.length + 1).padStart(3, "0")}`,
        ...data,
        created: new Date().toISOString().split("T")[0],
      };
      setCircuits([...circuits, newCircuit]);
    } else if (dialogMode === "edit" && selectedItem) {
      setCircuits(circuits.map(c => c.id === selectedItem.id ? { ...c, ...data } : c));
    }
  };

  const handleShareSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newShare: SecretShare = {
        id: `SS-${String(shares.length + 1).padStart(3, "0")}`,
        ...data,
        status: "active",
        created: new Date().toISOString().split("T")[0],
      };
      setShares([...shares, newShare]);
    }
  };

  const handleTaskSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newTask: PreprocessTask = {
        id: `TASK-${String(tasks.length + 1).padStart(3, "0")}`,
        ...data,
        status: "pending",
        progress: 0,
        created: new Date().toLocaleString("zh-CN"),
      };
      setTasks([...tasks, newTask]);
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    switch (dialogType) {
      case "protocol":
        setProtocols(protocols.filter(p => p.id !== selectedItem.id));
        break;
      case "circuit":
        setCircuits(circuits.filter(c => c.id !== selectedItem.id));
        break;
      case "share":
        setShares(shares.filter(s => s.id !== selectedItem.id));
        break;
      case "task":
        setTasks(tasks.filter(t => t.id !== selectedItem.id));
        break;
    }
    setDialogOpen(false);
  };

  const toggleProtocolStatus = (id: string) => {
    setProtocols(protocols.map(p => {
      if (p.id !== id) return p;
      return { ...p, status: p.status === "active" ? "standby" : "active" as const };
    }));
  };

  const getDialogFields = () => {
    switch (dialogType) {
      case "protocol": return protocolFields;
      case "circuit": return circuitFields;
      case "share": return shareFields;
      case "task": return taskFields;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "protocol": return "协议实例";
      case "circuit": return "电路";
      case "share": return "秘密共享";
      case "task": return "预处理任务";
    }
  };

  const getDrawerFields = () => {
    switch (drawerType) {
      case "protocol":
        return [
          { key: "id", label: "协议ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "type", label: "类型", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "circuits", label: "电路数", type: "text" as const },
          { key: "parties", label: "参与方数", type: "text" as const },
          { key: "latency", label: "延迟", type: "text" as const },
          { key: "throughput", label: "吞吐量", type: "text" as const },
          { key: "description", label: "描述", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
      case "circuit":
        return [
          { key: "id", label: "电路ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "protocol", label: "所属协议", type: "badge" as const },
          { key: "gates", label: "门数量", type: "text" as const },
          { key: "depth", label: "深度", type: "text" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
      case "share":
        return [
          { key: "id", label: "共享ID", type: "text" as const },
          { key: "protocol", label: "所属协议", type: "badge" as const },
          { key: "threshold", label: "门限值", type: "text" as const },
          { key: "totalShares", label: "总份额数", type: "text" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
      case "task":
        return [
          { key: "id", label: "任务ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "protocol", label: "所属协议", type: "badge" as const },
          { key: "type", label: "任务类型", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "progress", label: "进度", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
    }
  };

  const activeProtocols = protocols.filter(p => p.status === "active").length;
  const totalCircuits = circuits.length;
  const totalThroughput = protocols.reduce((sum, p) => {
    const val = parseFloat(p.throughput.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">密码协议引擎</h1>
          <p className="text-sm text-gray-500 mt-1">MPC协议配置、电路管理、秘密共享与预处理</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => openDialog("protocol", "create")}>
          <Plus className="w-4 h-4" />添加协议
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><CircuitBoard className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">{protocols.length}</div><div className="text-xs text-gray-500">协议实例</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">{activeProtocols}</div><div className="text-xs text-gray-500">运行中</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Zap className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">{totalCircuits}</div><div className="text-xs text-gray-500">电路总数</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Activity className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">{totalThroughput.toFixed(1)}k</div><div className="text-xs text-gray-500">总吞吐(ops/s)</div></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="protocols" className="space-y-4">
        <TabsList>
          <TabsTrigger value="protocols" className="gap-2"><CircuitBoard className="w-4 h-4" />协议实例</TabsTrigger>
          <TabsTrigger value="circuits" className="gap-2"><FileCode className="w-4 h-4" />电路库</TabsTrigger>
          <TabsTrigger value="shares" className="gap-2"><Shield className="w-4 h-4" />秘密共享</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2"><Layers className="w-4 h-4" />预处理任务</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索协议..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">协议实例</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead>
                    <TableHead>电路数</TableHead><TableHead>参与方</TableHead><TableHead>延迟</TableHead><TableHead>吞吐</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProtocols.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell>{p.status === "active" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />运行中</Badge> : <Badge className="bg-gray-50 text-gray-700">待机</Badge>}</TableCell>
                      <TableCell>{p.circuits}</TableCell>
                      <TableCell>{p.parties}方</TableCell>
                      <TableCell>{p.latency}</TableCell>
                      <TableCell>{p.throughput}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("protocol", p)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("protocol", "edit", p)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleProtocolStatus(p.id)}>
                            {p.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("protocol", "delete", p)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circuits" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索电路..." className="pl-9" value={circuitSearch} onChange={e => setCircuitSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("circuit", "create")}><Plus className="w-4 h-4" />新建电路</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">电路库</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>电路名称</TableHead><TableHead>门数量</TableHead>
                    <TableHead>深度</TableHead><TableHead>所属协议</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCircuits.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.gates.toLocaleString()}</TableCell>
                      <TableCell>{c.depth}</TableCell>
                      <TableCell>{c.protocol}</TableCell>
                      <TableCell>{c.status === "optimized" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已优化</Badge> : c.status === "review" ? <Badge className="bg-amber-50 text-amber-700 gap-1"><AlertTriangle className="w-3 h-3" />待审</Badge> : <Badge className="bg-gray-50 text-gray-700">已废弃</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("circuit", c)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("circuit", "edit", c)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("circuit", "delete", c)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shares" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索共享..." className="pl-9" value={shareSearch} onChange={e => setShareSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("share", "create")}><Plus className="w-4 h-4" />新建共享</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">秘密共享</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>协议</TableHead><TableHead>门限</TableHead>
                    <TableHead>总份额</TableHead><TableHead>状态</TableHead><TableHead>创建时间</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShares.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell><Badge variant="outline">{s.protocol}</Badge></TableCell>
                      <TableCell>{s.threshold}/{s.totalShares}</TableCell>
                      <TableCell>{s.totalShares}</TableCell>
                      <TableCell>{s.status === "active" ? <Badge className="bg-green-50 text-green-700">有效</Badge> : <Badge className="bg-red-50 text-red-700">已吊销</Badge>}</TableCell>
                      <TableCell className="text-xs text-gray-500">{s.created}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("share", s)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("share", "delete", s)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索任务..." className="pl-9" value={taskSearch} onChange={e => setTaskSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("task", "create")}><Plus className="w-4 h-4" />新建任务</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">预处理任务</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>任务名称</TableHead><TableHead>协议</TableHead>
                    <TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>进度</TableHead><TableHead>创建时间</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell><Badge variant="outline">{t.protocol}</Badge></TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.status === "running" ? <Badge className="bg-blue-50 text-blue-700">运行中</Badge> : t.status === "completed" ? <Badge className="bg-green-50 text-green-700">已完成</Badge> : t.status === "failed" ? <Badge className="bg-red-50 text-red-700">失败</Badge> : <Badge className="bg-gray-50 text-gray-700">待执行</Badge>}</TableCell>
                      <TableCell>{t.progress}%</TableCell>
                      <TableCell className="text-xs text-gray-500">{t.created}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("task", t)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("task", "delete", t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
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
            case "protocol": handleProtocolSubmit(data); break;
            case "circuit": handleCircuitSubmit(data); break;
            case "share": handleShareSubmit(data); break;
            case "task": handleTaskSubmit(data); break;
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
        title={drawerType === "protocol" ? "协议详情" : drawerType === "circuit" ? "电路详情" : drawerType === "share" ? "共享详情" : "任务详情"}
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
