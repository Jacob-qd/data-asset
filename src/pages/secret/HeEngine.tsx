import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Fingerprint, Key, Plus, CheckCircle2, Zap, BarChart3,
  RotateCcw, Calculator, History, AlertTriangle, Eye,
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

interface HeKey {
  id: string;
  name: string;
  scheme: string;
  bits: number;
  status: "active" | "rotating" | "expired";
  ops: number;
  created: string;
  rotated?: string;
  description?: string;
}

interface HeParam {
  id: string;
  name: string;
  polyModulus: string;
  coeffModulus: string;
  scale: string;
  plainModulus?: string;
  scheme: string;
  description?: string;
}

interface HeOperation {
  id: string;
  name: string;
  key: string;
  type: string;
  status: "running" | "completed" | "failed" | "queued";
  progress: number;
  created: string;
}

interface KeyUsage {
  id: string;
  key: string;
  operation: string;
  type: string;
  timestamp: string;
  result: "success" | "failure";
}

const initialKeys: HeKey[] = [
  { id: "HEK-001", name: "CKKS-主密钥", scheme: "CKKS", bits: 16384, status: "active", ops: 12450, created: "2024-03-01", description: "CKKS方案主密钥对" },
  { id: "HEK-002", name: "BFV-查询密钥", scheme: "BFV", bits: 8192, status: "active", ops: 8320, created: "2024-03-15", description: "BFV方案查询密钥" },
  { id: "HEK-003", name: "BGV-统计密钥", scheme: "BGV", bits: 16384, status: "active", ops: 5670, created: "2024-04-01", description: "BGV方案统计密钥" },
];

const initialParams: HeParam[] = [
  { id: "HP-001", name: "默认参数集-A", polyModulus: "8192", coeffModulus: "200-bit", scale: "2^40", scheme: "CKKS", description: "标准安全级别参数" },
  { id: "HP-002", name: "高精度参数集-B", polyModulus: "16384", coeffModulus: "438-bit", scale: "2^60", scheme: "CKKS", description: "高精度计算参数" },
  { id: "HP-003", name: "整数参数集-C", polyModulus: "4096", coeffModulus: "109-bit", plainModulus: "65537", scale: "-", scheme: "BFV", description: "整数运算参数" },
];

const initialOperations: HeOperation[] = [
  { id: "OP-001", name: "矩阵乘法-1", key: "HEK-001", type: "乘法", status: "completed", progress: 100, created: "2024-04-15 10:00" },
  { id: "OP-002", name: "向量加法-3", key: "HEK-002", type: "加法", status: "running", progress: 65, created: "2024-04-15 11:00" },
  { id: "OP-003", name: "多项式求值", key: "HEK-003", type: "求值", status: "queued", progress: 0, created: "2024-04-15 12:00" },
];

const initialUsages: KeyUsage[] = [
  { id: "USE-001", key: "HEK-001", operation: "矩阵乘法", type: "乘法", timestamp: "2024-04-15 10:30", result: "success" },
  { id: "USE-002", key: "HEK-001", operation: "向量点积", type: "乘法", timestamp: "2024-04-15 10:45", result: "success" },
  { id: "USE-003", key: "HEK-002", operation: "数据聚合", type: "加法", timestamp: "2024-04-15 11:15", result: "failure" },
];

const keyFields: FieldConfig[] = [
  { key: "name", label: "密钥名称", type: "text", required: true },
  { key: "scheme", label: "加密方案", type: "select", required: true, options: [
    { label: "CKKS", value: "CKKS" },
    { label: "BFV", value: "BFV" },
    { label: "BGV", value: "BGV" },
  ]},
  { key: "bits", label: "位宽", type: "number", required: true },
  { key: "description", label: "描述", type: "textarea" },
];

const paramFields: FieldConfig[] = [
  { key: "name", label: "参数集名称", type: "text", required: true },
  { key: "scheme", label: "加密方案", type: "select", required: true, options: [
    { label: "CKKS", value: "CKKS" },
    { label: "BFV", value: "BFV" },
    { label: "BGV", value: "BGV" },
  ]},
  { key: "polyModulus", label: "多项式模数", type: "text", required: true },
  { key: "coeffModulus", label: "系数模数", type: "text", required: true },
  { key: "scale", label: "缩放因子", type: "text" },
  { key: "plainModulus", label: "明文模数", type: "text" },
  { key: "description", label: "描述", type: "textarea" },
];

const opFields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "key", label: "使用密钥", type: "select", required: true, options: [
    { label: "CKKS-主密钥", value: "HEK-001" },
    { label: "BFV-查询密钥", value: "HEK-002" },
    { label: "BGV-统计密钥", value: "HEK-003" },
  ]},
  { key: "type", label: "运算类型", type: "select", required: true, options: [
    { label: "加法", value: "加法" },
    { label: "乘法", value: "乘法" },
    { label: "求值", value: "求值" },
    { label: "旋转", value: "旋转" },
    { label: "重线性化", value: "重线性化" },
  ]},
];

export default function HeEngine() {
  const [keys, setKeys] = useState<HeKey[]>(initialKeys);
  const [params, setParams] = useState<HeParam[]>(initialParams);
  const [operations, setOperations] = useState<HeOperation[]>(initialOperations);
  const [usages, setUsages] = useState<KeyUsage[]>(initialUsages);

  const [search, setSearch] = useState("");
  const [paramSearch, setParamSearch] = useState("");
  const [opSearch, setOpSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogType, setDialogType] = useState<"key" | "param" | "operation">("key");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<"key" | "param" | "operation" | "usage">("key");

  const filteredKeys = keys.filter(k => k.name.includes(search) || k.id.includes(search));
  const filteredParams = params.filter(p => p.name.includes(paramSearch) || p.id.includes(paramSearch));
  const filteredOps = operations.filter(o => o.name.includes(opSearch) || o.id.includes(opSearch));

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

  const handleKeySubmit = (data: any) => {
    if (dialogMode === "create") {
      const newKey: HeKey = {
        id: `HEK-${String(keys.length + 1).padStart(3, "0")}`,
        ...data,
        status: "active",
        ops: 0,
        created: new Date().toISOString().split("T")[0],
      };
      setKeys([...keys, newKey]);
    } else if (dialogMode === "edit" && selectedItem) {
      setKeys(keys.map(k => k.id === selectedItem.id ? { ...k, ...data } : k));
    }
  };

  const handleParamSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newParam: HeParam = {
        id: `HP-${String(params.length + 1).padStart(3, "0")}`,
        ...data,
      };
      setParams([...params, newParam]);
    } else if (dialogMode === "edit" && selectedItem) {
      setParams(params.map(p => p.id === selectedItem.id ? { ...p, ...data } : p));
    }
  };

  const handleOpSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newOp: HeOperation = {
        id: `OP-${String(operations.length + 1).padStart(3, "0")}`,
        ...data,
        status: "queued",
        progress: 0,
        created: new Date().toLocaleString("zh-CN"),
      };
      setOperations([...operations, newOp]);
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    switch (dialogType) {
      case "key": setKeys(keys.filter(k => k.id !== selectedItem.id)); break;
      case "param": setParams(params.filter(p => p.id !== selectedItem.id)); break;
      case "operation": setOperations(operations.filter(o => o.id !== selectedItem.id)); break;
    }
    setDialogOpen(false);
  };

  const rotateKey = (id: string) => {
    setKeys(keys.map(k => {
      if (k.id !== id) return k;
      return { ...k, status: "rotating" as const, rotated: new Date().toISOString().split("T")[0] };
    }));
    setTimeout(() => {
      setKeys(keys.map(k => k.id === id ? { ...k, status: "active" as const, ops: 0 } : k));
    }, 2000);
  };

  const getDialogFields = () => {
    switch (dialogType) {
      case "key": return keyFields;
      case "param": return paramFields;
      case "operation": return opFields;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "key": return "同态密钥";
      case "param": return "参数配置";
      case "operation": return "运算任务";
    }
  };

  const getDrawerFields = () => {
    switch (drawerType) {
      case "key":
        return [
          { key: "id", label: "密钥ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "scheme", label: "方案", type: "badge" as const },
          { key: "bits", label: "位宽", type: "text" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "ops", label: "运算次数", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
          { key: "rotated", label: "轮转时间", type: "date" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
      case "param":
        return [
          { key: "id", label: "参数ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "scheme", label: "方案", type: "badge" as const },
          { key: "polyModulus", label: "多项式模数", type: "text" as const },
          { key: "coeffModulus", label: "系数模数", type: "text" as const },
          { key: "scale", label: "缩放因子", type: "text" as const },
          { key: "plainModulus", label: "明文模数", type: "text" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
      case "operation":
        return [
          { key: "id", label: "任务ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "key", label: "使用密钥", type: "badge" as const },
          { key: "type", label: "运算类型", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "progress", label: "进度", type: "text" as const },
          { key: "created", label: "创建时间", type: "date" as const },
        ];
      case "usage":
        return [
          { key: "id", label: "记录ID", type: "text" as const },
          { key: "key", label: "密钥", type: "badge" as const },
          { key: "operation", label: "操作", type: "text" as const },
          { key: "type", label: "类型", type: "badge" as const },
          { key: "timestamp", label: "时间", type: "date" as const },
          { key: "result", label: "结果", type: "badge" as const },
        ];
    }
  };

  const activeKeys = keys.filter(k => k.status === "active").length;
  const totalOps = keys.reduce((sum, k) => sum + k.ops, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="同态加密引擎"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => {
              const activeKey = keys.find(k => k.status === "active");
              if (activeKey) rotateKey(activeKey.id);
            }}><RotateCcw className="w-4 h-4" />轮转密钥</Button>
            <Button className="gap-2" onClick={() => openDialog("key", "create")}><Plus className="w-4 h-4" />新建密钥</Button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Fingerprint className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">{activeKeys}</div><div className="text-xs text-gray-500">活跃密钥</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Zap className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">{totalOps.toLocaleString()}</div><div className="text-xs text-gray-500">累计运算</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">{params.length}</div><div className="text-xs text-gray-500">参数集</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Key className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">{Math.max(...keys.map(k => k.bits))}k</div><div className="text-xs text-gray-500">最高位宽</div></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys" className="gap-2"><Key className="w-4 h-4" />同态密钥</TabsTrigger>
          <TabsTrigger value="params" className="gap-2"><BarChart3 className="w-4 h-4" />参数配置</TabsTrigger>
          <TabsTrigger value="operations" className="gap-2"><Calculator className="w-4 h-4" />运算调度</TabsTrigger>
          <TabsTrigger value="usages" className="gap-2"><History className="w-4 h-4" />使用记录</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <PageSearchBar value={search} onChange={setSearch} placeholder="搜索密钥..." onReset={() => setSearch("")} />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">同态密钥</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>方案</TableHead>
                    <TableHead>位宽</TableHead><TableHead>状态</TableHead><TableHead>运算次数</TableHead>
                    <TableHead>创建时间</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-mono text-xs">{k.id}</TableCell>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell><Badge variant="outline">{k.scheme}</Badge></TableCell>
                      <TableCell>{k.bits}</TableCell>
                      <TableCell>{k.status === "active" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />活跃</Badge> : k.status === "rotating" ? <Badge className="bg-blue-50 text-blue-700">轮转中</Badge> : <Badge className="bg-red-50 text-red-700">已过期</Badge>}</TableCell>
                      <TableCell>{k.ops.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-gray-500">{k.created}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("key", k)),
                          createEditAction(() => openDialog("key", "edit", k)),
                          { key: "rotate", icon: <RotateCcw className="w-4 h-4" />, label: "轮转", onClick: () => rotateKey(k.id) },
                          createDeleteAction(() => openDialog("key", "delete", k)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="params" className="space-y-4">
          <PageSearchBar value={paramSearch} onChange={setParamSearch} placeholder="搜索参数..." onReset={() => setParamSearch("")} extraFilters={
            <Button variant="outline" className="gap-2" onClick={() => openDialog("param", "create")}><Plus className="w-4 h-4" />新建参数</Button>
          } />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">参数配置</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>多项式模数</TableHead>
                    <TableHead>系数模数</TableHead><TableHead>缩放因子</TableHead><TableHead>方案</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParams.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-mono text-xs">{p.polyModulus}</TableCell>
                      <TableCell>{p.coeffModulus}</TableCell>
                      <TableCell className="font-mono text-xs">{p.scale}</TableCell>
                      <TableCell><Badge variant="outline">{p.scheme}</Badge></TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("param", p)),
                          createEditAction(() => openDialog("param", "edit", p)),
                          createDeleteAction(() => openDialog("param", "delete", p)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <PageSearchBar value={opSearch} onChange={setOpSearch} placeholder="搜索任务..." onReset={() => setOpSearch("")} extraFilters={
            <Button variant="outline" className="gap-2" onClick={() => openDialog("operation", "create")}><Plus className="w-4 h-4" />新建任务</Button>
          } />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">运算任务</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>任务名称</TableHead><TableHead>密钥</TableHead>
                    <TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>进度</TableHead><TableHead>创建时间</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOps.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id}</TableCell>
                      <TableCell className="font-medium">{o.name}</TableCell>
                      <TableCell><Badge variant="outline">{o.key}</Badge></TableCell>
                      <TableCell>{o.type}</TableCell>
                      <TableCell>{o.status === "running" ? <Badge className="bg-blue-50 text-blue-700">运行中</Badge> : o.status === "completed" ? <Badge className="bg-green-50 text-green-700">已完成</Badge> : o.status === "failed" ? <Badge className="bg-red-50 text-red-700">失败</Badge> : <Badge className="bg-gray-50 text-gray-700">队列中</Badge>}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><Progress value={o.progress} className="w-20 h-1.5" /><span className="text-xs">{o.progress}%</span></div></TableCell>
                      <TableCell className="text-xs text-gray-500">{o.created}</TableCell>
                      <TableCell>
                        <ActionButtons buttons={[
                          createViewAction(() => openDrawer("operation", o)),
                          createDeleteAction(() => openDialog("operation", "delete", o)),
                        ]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usages" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">密钥使用记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>记录ID</TableHead><TableHead>密钥</TableHead><TableHead>操作</TableHead>
                    <TableHead>类型</TableHead><TableHead>时间</TableHead><TableHead>结果</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usages.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      <TableCell><Badge variant="outline">{u.key}</Badge></TableCell>
                      <TableCell className="font-medium">{u.operation}</TableCell>
                      <TableCell>{u.type}</TableCell>
                      <TableCell className="text-xs text-gray-500">{u.timestamp}</TableCell>
                      <TableCell>{u.result === "success" ? <Badge className="bg-green-50 text-green-700">成功</Badge> : <Badge className="bg-red-50 text-red-700">失败</Badge>}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("usage", u)}><Eye className="w-4 h-4" /></Button>
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
            case "key": handleKeySubmit(data); break;
            case "param": handleParamSubmit(data); break;
            case "operation": handleOpSubmit(data); break;
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
        title={drawerType === "key" ? "密钥详情" : drawerType === "param" ? "参数详情" : drawerType === "operation" ? "任务详情" : "使用详情"}
        data={drawerItem || {}}
        fields={getDrawerFields()}
        onEdit={() => {
          setDrawerOpen(false);
          openDialog(drawerType === "usage" ? "key" : drawerType, "edit", drawerItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          openDialog(drawerType === "usage" ? "key" : drawerType, "delete", drawerItem);
        }}
      />
    </div>
  );
}
