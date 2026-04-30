import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, Plus, CheckCircle2, AlertTriangle, Server, Lock,
  Play, Square, RotateCcw, Settings, FileCheck,
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

interface Enclave {
  id: string;
  name: string;
  host: string;
  type: string;
  status: "running" | "standby" | "stopped";
  attestation: "verified" | "pending" | "failed";
  uptime: string;
  tasks: number;
  description?: string;
  created?: string;
}

interface Attestation {
  id: string;
  enclave: string;
  result: "pass" | "fail";
  time: string;
  quote: string;
  details?: string;
}

interface TeeConfig {
  id: string;
  enclave: string;
  parameter: string;
  value: string;
  description?: string;
}

const initialEnclaves: Enclave[] = [
  { id: "SGX-001", name: "协调节点-A", host: "node-01.platform.local", type: "Intel SGX", status: "running", attestation: "verified", uptime: "45d 12h", tasks: 24, description: "主协调节点", created: "2024-01-10" },
  { id: "SEV-001", name: "计算节点-B", host: "node-02.platform.local", type: "AMD SEV-SNP", status: "running", attestation: "verified", uptime: "30d 8h", tasks: 18, description: "计算加速节点", created: "2024-02-15" },
  { id: "TPM-001", name: "备用节点-C", host: "node-03.platform.local", type: "TPM 2.0", status: "standby", attestation: "pending", uptime: "-", tasks: 0, description: "备用节点", created: "2024-03-01" },
  { id: "SGX-002", name: "存储节点-D", host: "node-04.platform.local", type: "Intel TDX", status: "running", attestation: "verified", uptime: "15d 3h", tasks: 12, description: "安全存储节点", created: "2024-03-10" },
];

const initialAttestations: Attestation[] = [
  { id: "ATT-001", enclave: "SGX-001", result: "pass", time: "2024-04-15 10:30:00", quote: "0x8a3f...c2d4", details: "远程证明成功，所有度量值匹配" },
  { id: "ATT-002", enclave: "SEV-001", result: "pass", time: "2024-04-15 10:25:00", quote: "0x7b2e...d3f5", details: "SEV-SNP 远程证明通过" },
  { id: "ATT-003", enclave: "SGX-002", result: "pass", time: "2024-04-15 10:20:00", quote: "0x6c1d...e4a6", details: "TDX 远程证明通过" },
];

const initialConfigs: TeeConfig[] = [
  { id: "CFG-001", enclave: "SGX-001", parameter: "EnclaveSize", value: "256MB", description: "安全飞地内存大小" },
  { id: "CFG-002", enclave: "SGX-001", parameter: "StackMinSize", value: "128KB", description: "最小栈大小" },
  { id: "CFG-003", enclave: "SEV-001", parameter: "Policy", value: "NO_DEBUG", description: "禁止调试策略" },
];

const enclaveFields: FieldConfig[] = [
  { key: "name", label: "飞地名称", type: "text", required: true },
  { key: "host", label: "主机地址", type: "text", required: true, placeholder: "例如: node-01.platform.local" },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "Intel SGX", value: "Intel SGX" },
    { label: "AMD SEV-SNP", value: "AMD SEV-SNP" },
    { label: "Intel TDX", value: "Intel TDX" },
    { label: "TPM 2.0", value: "TPM 2.0" },
  ]},
  { key: "description", label: "描述", type: "textarea" },
];

const configFields: FieldConfig[] = [
  { key: "enclave", label: "所属飞地", type: "select", required: true, options: [
    { label: "SGX-001", value: "SGX-001" },
    { label: "SEV-001", value: "SEV-001" },
    { label: "TPM-001", value: "TPM-001" },
    { label: "SGX-002", value: "SGX-002" },
  ]},
  { key: "parameter", label: "参数名", type: "text", required: true },
  { key: "value", label: "参数值", type: "text", required: true },
  { key: "description", label: "描述", type: "textarea" },
];

export default function TeeEnv() {
  const [enclaves, setEnclaves] = useState<Enclave[]>(initialEnclaves);
  const [attestations, setAttestations] = useState<Attestation[]>(initialAttestations);
  const [configs, setConfigs] = useState<TeeConfig[]>(initialConfigs);

  const [search, setSearch] = useState("");
  const [configSearch, setConfigSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogType, setDialogType] = useState<"enclave" | "config">("enclave");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<"enclave" | "attestation" | "config">("enclave");

  const filteredEnclaves = enclaves.filter(e => e.name.includes(search) || e.id.includes(search));
  const filteredConfigs = configs.filter(c => c.parameter.includes(configSearch) || c.enclave.includes(configSearch));

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

  const handleEnclaveSubmit = (data: any) => {
    if (dialogMode === "create") {
      const prefix = data.type === "Intel SGX" ? "SGX" : data.type === "AMD SEV-SNP" ? "SEV" : data.type === "Intel TDX" ? "TDX" : "TPM";
      const newEnclave: Enclave = {
        id: `${prefix}-${String(enclaves.length + 1).padStart(3, "0")}`,
        ...data,
        status: "standby",
        attestation: "pending",
        uptime: "-",
        tasks: 0,
        created: new Date().toISOString().split("T")[0],
      };
      setEnclaves([...enclaves, newEnclave]);
    } else if (dialogMode === "edit" && selectedItem) {
      setEnclaves(enclaves.map(e => e.id === selectedItem.id ? { ...e, ...data } : e));
    }
  };

  const handleConfigSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newConfig: TeeConfig = {
        id: `CFG-${String(configs.length + 1).padStart(3, "0")}`,
        ...data,
      };
      setConfigs([...configs, newConfig]);
    } else if (dialogMode === "edit" && selectedItem) {
      setConfigs(configs.map(c => c.id === selectedItem.id ? { ...c, ...data } : c));
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (dialogType === "enclave") {
      setEnclaves(enclaves.filter(e => e.id !== selectedItem.id));
    } else if (dialogType === "config") {
      setConfigs(configs.filter(c => c.id !== selectedItem.id));
    }
    setDialogOpen(false);
  };

  const handleAttestation = (enclaveId: string) => {
    const newAttestation: Attestation = {
      id: `ATT-${String(attestations.length + 1).padStart(3, "0")}`,
      enclave: enclaveId,
      result: "pass",
      time: new Date().toLocaleString("zh-CN"),
      quote: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      details: "远程证明成功执行",
    };
    setAttestations([newAttestation, ...attestations]);
    setEnclaves(enclaves.map(e => e.id === enclaveId ? { ...e, attestation: "verified" as const } : e));
  };

  const toggleEnclaveStatus = (id: string, action: "start" | "stop" | "restart") => {
    setEnclaves(enclaves.map(e => {
      if (e.id !== id) return e;
      if (action === "start") return { ...e, status: "running" as const, uptime: "0d 0h" };
      if (action === "stop") return { ...e, status: "stopped" as const, uptime: "-" };
      if (action === "restart") return { ...e, status: "running" as const, uptime: "0d 0h" };
      return e;
    }));
  };

  const getDialogFields = () => {
    return dialogType === "enclave" ? enclaveFields : configFields;
  };

  const getDialogTitle = () => {
    return dialogType === "enclave" ? "安全飞地" : "TEE配置";
  };

  const getDrawerFields = () => {
    switch (drawerType) {
      case "enclave":
        return [
          { key: "id", label: "飞地ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "host", label: "主机", type: "text" as const },
          { key: "type", label: "类型", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "attestation", label: "证明状态", type: "badge" as const },
          { key: "uptime", label: "运行时间", type: "text" as const },
          { key: "tasks", label: "任务数", type: "text" as const },
          { key: "description", label: "描述", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
      case "attestation":
        return [
          { key: "id", label: "证明ID", type: "text" as const },
          { key: "enclave", label: "飞地", type: "badge" as const },
          { key: "result", label: "结果", type: "badge" as const },
          { key: "time", label: "时间", type: "date" as const },
          { key: "quote", label: "Quote", type: "text" as const },
          { key: "details", label: "详情", type: "text" as const },
        ];
      case "config":
        return [
          { key: "id", label: "配置ID", type: "text" as const },
          { key: "enclave", label: "所属飞地", type: "badge" as const },
          { key: "parameter", label: "参数", type: "text" as const },
          { key: "value", label: "值", type: "text" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
    }
  };

  const runningCount = enclaves.filter(e => e.status === "running").length;
  const verifiedCount = enclaves.filter(e => e.attestation === "verified").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="可信执行环境(TEE)"
        actions={
          <Button className="gap-2" onClick={() => openDialog("enclave", "create")}><Plus className="w-4 h-4" />注册飞地</Button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Server className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">{enclaves.length}</div><div className="text-xs text-gray-500">安全飞地</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">{runningCount}</div><div className="text-xs text-gray-500">运行中</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Lock className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">{Math.round((verifiedCount / enclaves.length) * 100)}%</div><div className="text-xs text-gray-500">证明通过率</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Shield className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">{enclaves.reduce((s, e) => s + e.tasks, 0)}</div><div className="text-xs text-gray-500">执行任务</div></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="enclaves" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enclaves" className="gap-2"><Server className="w-4 h-4" />安全飞地</TabsTrigger>
          <TabsTrigger value="attestations" className="gap-2"><FileCheck className="w-4 h-4" />远程证明</TabsTrigger>
          <TabsTrigger value="configs" className="gap-2"><Settings className="w-4 h-4" />TEE配置</TabsTrigger>
        </TabsList>

        <TabsContent value="enclaves" className="space-y-4">
          <PageSearchBar value={search} onChange={setSearch} placeholder="搜索飞地..." onReset={() => setSearch("")} />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">安全飞地列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>主机</TableHead>
                    <TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>证明</TableHead>
                    <TableHead>运行时间</TableHead><TableHead>任务</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnclaves.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.id}</TableCell>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="font-medium text-xs">{e.host}</TableCell>
                      <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                      <TableCell>{e.status === "running" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />运行中</Badge> : e.status === "standby" ? <Badge className="bg-amber-50 text-amber-700">待机</Badge> : <Badge className="bg-red-50 text-red-700">已停止</Badge>}</TableCell>
                      <TableCell>{e.attestation === "verified" ? <Badge className="bg-green-50 text-green-700">已验证</Badge> : e.attestation === "pending" ? <Badge className="bg-amber-50 text-amber-700">待验证</Badge> : <Badge className="bg-red-50 text-red-700">失败</Badge>}</TableCell>
                      <TableCell className="text-xs text-gray-500">{e.uptime}</TableCell>
                      <TableCell>{e.tasks}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("enclave", e)),
                          createEditAction(() => openDialog("enclave", "edit", e)),
                          ...(e.status !== "running" ? [{ key: "start", icon: <Play className="w-4 h-4 text-green-600" />, label: "启动", className: "text-green-600 hover:text-green-700 hover:bg-green-50", onClick: () => toggleEnclaveStatus(e.id, "start") }] : []),
                          ...(e.status === "running" ? [
                            { key: "restart", icon: <RotateCcw className="w-4 h-4 text-amber-600" />, label: "重启", className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50", onClick: () => toggleEnclaveStatus(e.id, "restart") },
                            { key: "stop", icon: <Square className="w-4 h-4 text-red-600" />, label: "停止", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => toggleEnclaveStatus(e.id, "stop") },
                          ] : []),
                          createDeleteAction(() => openDialog("enclave", "delete", e)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attestations" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">共 {attestations.length} 条远程证明记录</p>
            <Button variant="outline" className="gap-2" onClick={() => {
              const runningEnclaves = enclaves.filter(e => e.status === "running");
              if (runningEnclaves.length > 0) {
                handleAttestation(runningEnclaves[0].id);
              }
            }}>
              <ShieldCheck className="w-4 h-4" />触发证明
            </Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">远程证明记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>证明ID</TableHead><TableHead>飞地</TableHead><TableHead>结果</TableHead>
                    <TableHead>时间</TableHead><TableHead>Quote</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attestations.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell className="font-medium">{a.enclave}</TableCell>
                      <TableCell>{a.result === "pass" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />通过</Badge> : <Badge className="bg-red-50 text-red-700 gap-1"><AlertTriangle className="w-3 h-3" />失败</Badge>}</TableCell>
                      <TableCell className="text-xs text-gray-500">{a.time}</TableCell>
                      <TableCell className="font-mono text-xs">{a.quote}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[createViewAction(() => openDrawer("attestation", a))]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs" className="space-y-4">
          <PageSearchBar value={configSearch} onChange={setConfigSearch} placeholder="搜索配置..." onReset={() => setConfigSearch("")} extraFilters={
            <Button variant="outline" className="gap-2" onClick={() => openDialog("config", "create")}><Plus className="w-4 h-4" />添加配置</Button>
          } />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">TEE配置列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>飞地</TableHead><TableHead>参数</TableHead>
                    <TableHead>值</TableHead><TableHead>描述</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConfigs.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell><Badge variant="outline">{c.enclave}</Badge></TableCell>
                      <TableCell className="font-medium">{c.parameter}</TableCell>
                      <TableCell className="font-mono text-xs">{c.value}</TableCell>
                      <TableCell className="text-xs text-gray-500">{c.description}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("config", c)),
                          createEditAction(() => openDialog("config", "edit", c)),
                          createDeleteAction(() => openDialog("config", "delete", c)),
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
          if (dialogType === "enclave") handleEnclaveSubmit(data);
          else handleConfigSubmit(data);
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
        title={drawerType === "enclave" ? "飞地详情" : drawerType === "attestation" ? "证明详情" : "配置详情"}
        data={drawerItem || {}}
        fields={getDrawerFields()}
        onEdit={() => {
          setDrawerOpen(false);
          openDialog(drawerType === "enclave" ? "enclave" : "config", "edit", drawerItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          openDialog(drawerType === "enclave" ? "enclave" : "config", "delete", drawerItem);
        }}
      />
    </div>
  );
}
