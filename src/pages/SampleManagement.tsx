import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";
import {
  ChevronRight, Plus, Search, FlaskConical, Package, Trash2, Clock, CheckCircle, AlertTriangle, Eye, Thermometer, CalendarDays, Pencil, Trash, XCircle, StickyNote,
} from "lucide-react";

interface Sample {
  id: string;
  name: string;
  source: string;
  batchNo: string;
  samplingMethod: string;
  samplingDate: string;
  storageLocation: string;
  storageTemp: string;
  status: string;
  retentionDays: number;
  inspector: string;
  expireDate: string;
  observeRecords: number;
}

interface ObserveRecord {
  id: number;
  sampleId: string;
  date: string;
  item: string;
  result: string;
  note: string;
}

const initialSamples: Sample[] = [
  { id: "SP-001", name: "用户画像数据样本A", source: "ods_user_info", batchNo: "B20260424001", samplingMethod: "随机抽样", samplingDate: "2026-04-24", storageLocation: "冷库-01", storageTemp: "4°C", status: "留样中", retentionDays: 90, inspector: "张三", expireDate: "2026-07-23", observeRecords: 3 },
  { id: "SP-002", name: "订单明细样本B", source: "dwd_order_detail", batchNo: "B20260424002", samplingMethod: "分层抽样", samplingDate: "2026-04-24", storageLocation: "常温库-03", storageTemp: "25°C", status: "留样中", retentionDays: 30, inspector: "李四", expireDate: "2026-05-24", observeRecords: 1 },
  { id: "SP-003", name: "设备ID验证样本C", source: "device_info", batchNo: "B20260423001", samplingMethod: "系统抽样", samplingDate: "2026-04-23", storageLocation: "冷库-02", storageTemp: "4°C", status: "待观察", retentionDays: 60, inspector: "王五", expireDate: "2026-06-22", observeRecords: 0 },
  { id: "SP-004", name: "特征工程输出样本D", source: "credit_features", batchNo: "B20260422001", samplingMethod: "随机抽样", samplingDate: "2026-04-22", storageLocation: "常温库-01", storageTemp: "25°C", status: "已销毁", retentionDays: 0, inspector: "赵六", expireDate: "2026-04-25", observeRecords: 5 },
  { id: "SP-005", name: "模型预测样本E", source: "model_prediction", batchNo: "B20260421001", samplingMethod: "聚类抽样", samplingDate: "2026-04-21", storageLocation: "冷库-01", storageTemp: "4°C", status: "观察完成", retentionDays: 90, inspector: "钱七", expireDate: "2026-07-20", observeRecords: 4 },
];

const initialObserveRecords: ObserveRecord[] = [
  { id: 1, sampleId: "SP-001", date: "2026-04-24", item: "外观", result: "正常", note: "样本完整性良好" },
  { id: 2, sampleId: "SP-001", date: "2026-04-25", item: "数据一致性", result: "正常", note: "与源数据一致" },
  { id: 3, sampleId: "SP-001", date: "2026-04-26", item: "字段完整性", result: "正常", note: "字段无缺失" },
];

const statusColor: Record<string, string> = {
  "留样中": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待观察": "bg-blue-50 text-blue-700 border-blue-100",
  "观察完成": "bg-purple-50 text-purple-700 border-purple-100",
  "已销毁": "bg-gray-100 text-gray-500 border-gray-200",
};

const sampleFields: FieldConfig[] = [
  { key: "name", label: "样品名称", type: "text", required: true },
  { key: "source", label: "数据源", type: "text", required: true },
  { key: "batchNo", label: "批次号", type: "text", required: true },
  { key: "samplingMethod", label: "取样方式", type: "select", required: true, options: [
    { label: "随机抽样", value: "随机抽样" },
    { label: "分层抽样", value: "分层抽样" },
    { label: "系统抽样", value: "系统抽样" },
    { label: "聚类抽样", value: "聚类抽样" },
    { label: "多阶段抽样", value: "多阶段抽样" },
  ]},
  { key: "storageLocation", label: "存放位置", type: "text", required: true },
  { key: "storageTemp", label: "存储温度", type: "text", required: true },
  { key: "retentionDays", label: "留样天数", type: "number", required: true },
];

const detailFields = [
  { key: "id", label: "样品ID" },
  { key: "name", label: "样品名称" },
  { key: "source", label: "数据源" },
  { key: "batchNo", label: "批次号" },
  { key: "samplingMethod", label: "取样方式" },
  { key: "samplingDate", label: "取样日期", type: "date" as const },
  { key: "storageLocation", label: "存放位置" },
  { key: "storageTemp", label: "存储温度" },
  { key: "retentionDays", label: "留样天数" },
  { key: "expireDate", label: "到期日", type: "date" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "inspector", label: "取样人" },
  { key: "observeRecords", label: "观察记录数" },
];

function generateId(samples: Sample[]): string {
  const maxNum = samples.reduce((max, s) => {
    const num = parseInt(s.id.replace("SP-", ""), 10);
    return Math.max(max, isNaN(num) ? 0 : num);
  }, 0);
  return `SP-${String(maxNum + 1).padStart(3, "0")}`;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function SampleManagement() {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [observeRecords, setObserveRecords] = useState<ObserveRecord[]>(initialObserveRecords);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSample, setDetailSample] = useState<Sample | null>(null);

  // Observe dialog state
  const [observeDialogOpen, setObserveDialogOpen] = useState(false);
  const [observeSampleId, setObserveSampleId] = useState<string | null>(null);
  const [observeForm, setObserveForm] = useState({ item: "", result: "正常", note: "" });

  const filtered = samples.filter((s) => s.name.includes(search) || s.id.includes(search) || s.batchNo.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "",
      source: "",
      batchNo: "",
      samplingMethod: "随机抽样",
      storageLocation: "",
      storageTemp: "",
      retentionDays: 30,
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (sample: Sample) => {
    setDialogMode("edit");
    setDialogData({
      name: sample.name,
      source: sample.source,
      batchNo: sample.batchNo,
      samplingMethod: sample.samplingMethod,
      storageLocation: sample.storageLocation,
      storageTemp: sample.storageTemp,
      retentionDays: sample.retentionDays,
    });
    setEditingId(sample.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (sample: Sample) => {
    setDialogMode("delete");
    setEditingId(sample.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const id = generateId(samples);
      const samplingDate = todayStr();
      const newSample: Sample = {
        id,
        name: data.name,
        source: data.source,
        batchNo: data.batchNo,
        samplingMethod: data.samplingMethod,
        samplingDate,
        storageLocation: data.storageLocation,
        storageTemp: data.storageTemp,
        status: "留样中",
        retentionDays: Number(data.retentionDays),
        inspector: "管理员",
        expireDate: addDays(samplingDate, Number(data.retentionDays)),
        observeRecords: 0,
      };
      setSamples((prev) => [...prev, newSample]);
    } else if (dialogMode === "edit" && editingId) {
      setSamples((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: data.name,
                source: data.source,
                batchNo: data.batchNo,
                samplingMethod: data.samplingMethod,
                storageLocation: data.storageLocation,
                storageTemp: data.storageTemp,
                retentionDays: Number(data.retentionDays),
                expireDate: addDays(s.samplingDate, Number(data.retentionDays)),
              }
            : s
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setSamples((prev) => prev.filter((s) => s.id !== editingId));
      setObserveRecords((prev) => prev.filter((r) => r.sampleId !== editingId));
    }
    setDialogOpen(false);
  };

  const handleDestroy = (sample: Sample) => {
    if (window.confirm(`确定要销毁样品 ${sample.id}（${sample.name}）吗？`)) {
      setSamples((prev) =>
        prev.map((s) => (s.id === sample.id ? { ...s, status: "已销毁", retentionDays: 0 } : s))
      );
      if (detailSample?.id === sample.id) {
        setDetailSample((prev) => (prev ? { ...prev, status: "已销毁", retentionDays: 0 } : prev));
      }
    }
  };

  const openObserveDialog = (sampleId: string) => {
    setObserveSampleId(sampleId);
    setObserveForm({ item: "", result: "正常", note: "" });
    setObserveDialogOpen(true);
  };

  const handleAddObserve = () => {
    if (!observeSampleId || !observeForm.item.trim()) return;
    const newRecord: ObserveRecord = {
      id: Date.now(),
      sampleId: observeSampleId,
      date: todayStr(),
      item: observeForm.item,
      result: observeForm.result,
      note: observeForm.note,
    };
    setObserveRecords((prev) => [...prev, newRecord]);
    setSamples((prev) =>
      prev.map((s) =>
        s.id === observeSampleId
          ? { ...s, observeRecords: s.observeRecords + 1, status: s.status === "待观察" ? "观察完成" : s.status }
          : s
      )
    );
    setObserveDialogOpen(false);
  };

  const sampleObserveRecords = observeSampleId
    ? observeRecords.filter((r) => r.sampleId === observeSampleId)
    : [];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>样品管理</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="样品管理"
        badge={`${samples.length} 个样品`}
        actions={
          <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />登记样品
          </Button>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Package className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">样品总数</p><p className="text-lg font-bold">{samples.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FlaskConical className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">留样中</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "留样中").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">待观察</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "待观察").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-purple-600" /><div><p className="text-sm text-gray-500">观察完成</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "观察完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Trash2 className="h-5 w-5 text-gray-500" /><div><p className="text-sm text-gray-500">已销毁</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "已销毁").length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部样品</TabsTrigger>
          <TabsTrigger value="retention">留样中</TabsTrigger>
          <TabsTrigger value="observe">观察检验</TabsTrigger>
          <TabsTrigger value="destroyed">已销毁</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          <PageSearchBar
            value={search}
            onChange={setSearch}
            placeholder="搜索样品名称/批次号/ID..."
            onSearch={() => {}}
            onReset={() => setSearch("")}
          />
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "数据源", "批次号", "取样方式", "取样日期", "存放位置", "温度", "留样天数", "到期日", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.source}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{s.samplingMethod}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.samplingDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.storageLocation}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm"><Badge variant="outline" className="gap-1"><Thermometer className="w-3 h-3" />{s.storageTemp}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{s.retentionDays}天</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <ActionButtons
                        buttons={[
                          createViewAction(() => { setDetailSample(s); setDetailOpen(true); }),
                          createEditAction(() => handleEdit(s)),
                          ...(s.status !== "已销毁" ? [
                            {
                              key: "observe",
                              icon: <CalendarDays className="w-4 h-4" />,
                              label: "观察",
                              onClick: () => openObserveDialog(s.id),
                            },
                            {
                              key: "destroy",
                              icon: <XCircle className="w-4 h-4 text-red-600" />,
                              label: "销毁",
                              className: "text-red-600 hover:text-red-700 hover:bg-red-50",
                              onClick: () => handleDestroy(s),
                            },
                          ] : []),
                          createDeleteAction(() => handleDelete(s)),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "批次号", "存放位置", "到期日", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((s) => s.status === "留样中").map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.storageLocation}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <ActionButtons
                        buttons={[
                          createViewAction(() => { setDetailSample(s); setDetailOpen(true); }),
                          createEditAction(() => handleEdit(s)),
                          {
                            key: "observe",
                            icon: <CalendarDays className="w-4 h-4" />,
                            label: "观察",
                            onClick: () => openObserveDialog(s.id),
                          },
                          {
                            key: "destroy",
                            icon: <XCircle className="w-4 h-4 text-red-600" />,
                            label: "销毁",
                            className: "text-red-600 hover:text-red-700 hover:bg-red-50",
                            onClick: () => handleDestroy(s),
                          },
                          createDeleteAction(() => handleDelete(s)),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="observe" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "批次号", "观察记录数", "取样日期", "到期日", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((s) => s.status === "待观察" || s.status === "观察完成").map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{s.observeRecords}条</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.samplingDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <ActionButtons
                        buttons={[
                          createViewAction(() => { setDetailSample(s); setDetailOpen(true); }),
                          {
                            key: "observe",
                            icon: <CalendarDays className="w-4 h-4" />,
                            label: "观察",
                            onClick: () => openObserveDialog(s.id),
                          },
                          createEditAction(() => handleEdit(s)),
                          createDeleteAction(() => handleDelete(s)),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="destroyed" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "批次号", "销毁日期", "销毁人", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((s) => s.status === "已销毁").map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.inspector}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <ActionButtons
                        buttons={[
                          createViewAction(() => { setDetailSample(s); setDetailOpen(true); }),
                          createDeleteAction(() => handleDelete(s)),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`样品详情 - ${detailSample?.id}`}
        data={detailSample || {}}
        fields={detailFields}
        onEdit={detailSample ? () => handleEdit(detailSample) : undefined}
        onDelete={detailSample ? () => handleDelete(detailSample) : undefined}
      />

      {/* CrudDialog: create/edit/delete */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${detailSample?.name || "样品"}` : "样品"}
        fields={sampleFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* Observe Records Dialog */}
      <Dialog open={observeDialogOpen} onOpenChange={setObserveDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-indigo-600" />
              观察记录 - {observeSampleId}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {sampleObserveRecords.length > 0 ? (
              <div className="space-y-2">
                {sampleObserveRecords.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{rec.date}</span>
                      <Badge variant="outline">{rec.item}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={rec.result === "正常" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>{rec.result}</Badge>
                      <span className="text-xs text-gray-500">{rec.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">暂无观察记录</p>
            )}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">新增观察</p>
              <div>
                <Label className="text-xs">检查项目</Label>
                <Input value={observeForm.item} onChange={(e) => setObserveForm({ ...observeForm, item: e.target.value })} placeholder="如：外观" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs">检查结果</Label>
                <select value={observeForm.result} onChange={(e) => setObserveForm({ ...observeForm, result: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm mt-1">
                  <option>正常</option>
                  <option>异常</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">备注</Label>
                <Input value={observeForm.note} onChange={(e) => setObserveForm({ ...observeForm, note: e.target.value })} placeholder="可选" className="h-9 mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setObserveDialogOpen(false)}>关闭</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddObserve} disabled={!observeForm.item.trim()}>保存观察</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
