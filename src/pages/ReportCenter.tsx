import { useState, useRef, useEffect, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Plus,
  Eye,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileJson,
  Copy,
  Pencil,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  FileCheck,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

type ReportType = "sampling" | "privacy" | "quality" | "audit";
type ReportStatus = "draft" | "published" | "archived";
type ReportFormat = "pdf" | "excel" | "csv";

interface ReportItem {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  creator: string;
  createdAt: string;
  description: string;
  format: ReportFormat;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  defaultFormat: ReportFormat;
}

const reportTypeLabel: Record<ReportType, string> = {
  sampling: "抽样报告",
  privacy: "隐私计算报告",
  quality: "质量报告",
  audit: "审计报告",
};

const reportTypeColor: Record<ReportType, string> = {
  sampling: "bg-blue-50 text-blue-700 border-blue-100",
  privacy: "bg-purple-50 text-purple-700 border-purple-100",
  quality: "bg-emerald-50 text-emerald-700 border-emerald-100",
  audit: "bg-amber-50 text-amber-700 border-amber-100",
};

const statusLabel: Record<ReportStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

const statusColor: Record<ReportStatus, string> = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

const formatIcon: Record<ReportFormat, typeof FileText> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileJson,
};

const formatColor: Record<ReportFormat, string> = {
  pdf: "text-red-500",
  excel: "text-emerald-500",
  csv: "text-blue-500",
};

const initialReports: ReportItem[] = [
  {
    id: "RPT-20260427-001",
    name: "月度抽样质量报告",
    type: "sampling",
    status: "published",
    creator: "张三",
    createdAt: "2026-04-27 10:00",
    description: "4月份数据抽样质量综合评估报告，涵盖随机抽样、分层抽样等多种抽样方式的执行情况和质量指标分析。",
    format: "pdf",
  },
  {
    id: "RPT-20260427-002",
    name: "联邦学习任务汇总",
    type: "privacy",
    status: "published",
    creator: "李四",
    createdAt: "2026-04-27 09:30",
    description: "本周联邦学习平台任务执行汇总，包含模型训练进度、参与方贡献度、安全聚合结果等关键指标。",
    format: "excel",
  },
  {
    id: "RPT-20260426-003",
    name: "数据质量巡检报告",
    type: "quality",
    status: "draft",
    creator: "王五",
    createdAt: "2026-04-26 16:00",
    description: "数据质量规则命中情况统计，包括完整性、一致性、准确性、时效性四个维度的质量评分。",
    format: "pdf",
  },
  {
    id: "RPT-20260426-004",
    name: "隐私计算审计日志",
    type: "audit",
    status: "published",
    creator: "赵六",
    createdAt: "2026-04-26 14:00",
    description: "隐私计算平台审计日志分析，记录所有参与方的操作行为、数据访问权限使用和异常告警事件。",
    format: "csv",
  },
  {
    id: "RPT-20260425-005",
    name: "PSI隐私求交结果报告",
    type: "privacy",
    status: "archived",
    creator: "张三",
    createdAt: "2026-04-25 11:00",
    description: "多方PSI求交任务结果报告，包含交集大小、执行耗时、通信开销等技术指标。",
    format: "pdf",
  },
  {
    id: "RPT-20260425-006",
    name: "数据资产盘点报告",
    type: "quality",
    status: "published",
    creator: "李四",
    createdAt: "2026-04-25 09:00",
    description: "全量数据资产盘点结果，包含数据表数量、字段覆盖率、敏感数据分布等资产台账信息。",
    format: "excel",
  },
  {
    id: "RPT-20260424-007",
    name: "差分隐私预算使用报告",
    type: "privacy",
    status: "draft",
    creator: "王五",
    createdAt: "2026-04-24 15:00",
    description: "差分隐私机制下的隐私预算消耗跟踪报告，分析各数据集的ε值使用情况和剩余预算。",
    format: "csv",
  },
  {
    id: "RPT-20260424-008",
    name: "跨机构数据交换审计",
    type: "audit",
    status: "published",
    creator: "赵六",
    createdAt: "2026-04-24 10:00",
    description: "跨机构数据交换全流程审计报告，包含交换申请、审批流程、传输日志和接收确认等环节的合规性检查。",
    format: "pdf",
  },
  {
    id: "RPT-20260423-009",
    name: "抽样规则效能评估",
    type: "sampling",
    status: "archived",
    creator: "张三",
    createdAt: "2026-04-23 16:00",
    description: "各抽样规则的效能评估报告，对比不同抽样策略的误差率、置信区间和计算效率。",
    format: "excel",
  },
  {
    id: "RPT-20260423-010",
    name: "MPC安全计算审计",
    type: "audit",
    status: "published",
    creator: "李四",
    createdAt: "2026-04-23 11:00",
    description: "安全多方计算任务审计报告，记录计算参与方、协议类型、计算结果验证和通信安全状态。",
    format: "csv",
  },
];

const reportTemplates: ReportTemplate[] = [
  {
    id: "tpl-1",
    name: "月度抽样质量报告模板",
    type: "sampling",
    description: "包含抽样规则命中率、误差率、置信区间等指标的月度统计模板",
    defaultFormat: "pdf",
  },
  {
    id: "tpl-2",
    name: "联邦学习任务汇总模板",
    type: "privacy",
    description: "联邦学习平台任务执行进度和结果汇总模板",
    defaultFormat: "excel",
  },
  {
    id: "tpl-3",
    name: "数据质量巡检模板",
    type: "quality",
    description: "数据质量四维度（完整/一致/准确/时效）巡检模板",
    defaultFormat: "pdf",
  },
  {
    id: "tpl-4",
    name: "隐私计算审计模板",
    type: "audit",
    description: "隐私计算平台操作行为和数据访问审计模板",
    defaultFormat: "csv",
  },
  {
    id: "tpl-5",
    name: "数据资产盘点模板",
    type: "quality",
    description: "数据资产台账和敏感数据分布统计模板",
    defaultFormat: "excel",
  },
];

const crudFields: FieldConfig[] = [
  { key: "name", label: "报告名称", type: "text", required: true },
  {
    key: "type",
    label: "报告类型",
    type: "select",
    required: true,
    options: [
      { label: "抽样报告", value: "sampling" },
      { label: "隐私计算报告", value: "privacy" },
      { label: "质量报告", value: "quality" },
      { label: "审计报告", value: "audit" },
    ],
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "草稿", value: "draft" },
      { label: "已发布", value: "published" },
      { label: "已归档", value: "archived" },
    ],
  },
  {
    key: "format",
    label: "格式",
    type: "select",
    required: true,
    options: [
      { label: "PDF", value: "pdf" },
      { label: "Excel", value: "excel" },
      { label: "CSV", value: "csv" },
    ],
  },
  {
    key: "description",
    label: "描述",
    type: "textarea",
    placeholder: "请输入报告描述...",
  },
];

const detailFields = [
  { key: "id", label: "报告ID", type: "text" as const },
  { key: "name", label: "报告名称", type: "text" as const },
  { key: "type", label: "报告类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "format", label: "格式", type: "badge" as const },
  { key: "creator", label: "创建人", type: "text" as const },
  { key: "createdAt", label: "创建时间", type: "date" as const },
  { key: "description", label: "描述", type: "text" as const },
];

const timeRanges = ["今日", "本周", "本月", "本季度", "本年", "自定义"];

const taskExecutionData = {
  xAxis: ["4/15", "4/16", "4/17", "4/18", "4/19", "4/20", "4/21"],
  series: [
    { name: "已完成", data: [12, 15, 8, 20, 18, 10, 6], color: "#10B981" },
    { name: "失败", data: [2, 1, 3, 0, 1, 2, 0], color: "#EF4444" },
    { name: "待执行", data: [5, 3, 8, 4, 6, 3, 4], color: "#F59E0B" },
  ],
};

const successRateData = [
  { value: 78, name: "成功", itemStyle: { color: "#10B981" } },
  { value: 12, name: "失败", itemStyle: { color: "#EF4444" } },
  { value: 8, name: "待执行", itemStyle: { color: "#F59E0B" } },
  { value: 2, name: "已取消", itemStyle: { color: "#94A3B8" } },
];

const durationData = {
  categories: ["随机抽样", "分层抽样", "系统抽样", "聚类抽样", "多阶段抽样"],
  data: [
    { name: "最小值", data: [5, 8, 3, 12, 20], color: "#3B82F6" },
    { name: "平均值", data: [15, 22, 10, 30, 45], color: "#8B5CF6" },
    { name: "最大值", data: [30, 45, 20, 55, 80], color: "#EC4899" },
  ],
};

const volumeData = {
  xAxis: ["4/15", "4/16", "4/17", "4/18", "4/19", "4/20", "4/21"],
  data: [120, 180, 95, 220, 195, 145, 85],
};

export default function ReportCenter() {
  const [activeTab, setActiveTab] = useState<"sampling" | "privacy">("sampling");
  const [timeRange, setTimeRange] = useState("本周");
  const chartRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  /* Reports state */
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [currentView, setCurrentView] = useState<"reports" | "templates">("reports");

  /* CRUD state */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<ReportItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Export state */
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ReportFormat>("csv");

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.name.includes(search) ||
        r.id.includes(search) ||
        r.creator.includes(search);
      const matchType = typeFilter === "all" || r.type === typeFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [reports, search, typeFilter, statusFilter]);

  /* Stats */
  const totalReports = reports.length;
  const publishedCount = reports.filter((r) => r.status === "published").length;
  const draftCount = reports.filter((r) => r.status === "draft").length;
  const archivedCount = reports.filter((r) => r.status === "archived").length;
  const pdfCount = reports.filter((r) => r.format === "pdf").length;
  const excelCount = reports.filter((r) => r.format === "excel").length;
  const csvCount = reports.filter((r) => r.format === "csv").length;

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: ReportItem) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (item: ReportItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (item: ReportItem) => {
    setSelectedItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newReport: ReportItem = {
        id: `RPT-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        type: data.type || "sampling",
        status: data.status || "draft",
        creator: "当前用户",
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        description: data.description || "",
        format: data.format || "pdf",
      };
      setReports((prev) => [newReport, ...prev]);
    } else if (dialogMode === "edit" && selectedItem) {
      setReports((prev) =>
        prev.map((r) => (r.id === selectedItem.id ? { ...r, ...data } : r))
      );
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setReports((prev) => prev.filter((r) => r.id !== selectedItem.id));
      if (drawerOpen) setDrawerOpen(false);
    }
  };

  const handleDuplicate = (item: ReportItem) => {
    const newReport: ReportItem = {
      ...item,
      id: `RPT-${Date.now().toString(36).toUpperCase()}`,
      name: `${item.name} (复制)`,
      status: "draft",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleExport = () => {
    const headers = ["ID", "名称", "类型", "状态", "创建人", "创建时间", "格式", "描述"];
    const rows = filteredReports.map((r) => [
      r.id,
      r.name,
      reportTypeLabel[r.type],
      statusLabel[r.status],
      r.creator,
      r.createdAt,
      r.format.toUpperCase(),
      r.description,
    ]);

    let content = "";
    if (exportFormat === "csv") {
      content = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    } else {
      content = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_export_${new Date().toISOString().slice(0, 10)}.${exportFormat === "csv" ? "csv" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleUseTemplate = (tpl: ReportTemplate) => {
    const newReport: ReportItem = {
      id: `RPT-${Date.now().toString(36).toUpperCase()}`,
      name: tpl.name.replace("模板", ""),
      type: tpl.type,
      status: "draft",
      creator: "当前用户",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      description: tpl.description,
      format: tpl.defaultFormat,
    };
    setReports((prev) => [newReport, ...prev]);
    setCurrentView("reports");
  };

  useEffect(() => {
    const charts: echarts.ECharts[] = [];

    if (chartRefs[0].current) {
      const c = echarts.init(chartRefs[0].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: taskExecutionData.series.map((s) => s.name), bottom: 0 },
        grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: taskExecutionData.xAxis },
        yAxis: { type: "value" },
        series: taskExecutionData.series.map((s) => ({
          name: s.name,
          type: "bar",
          data: s.data,
          itemStyle: { color: s.color },
          stack: "total",
        })),
      });
      charts.push(c);
    }

    if (chartRefs[1].current) {
      const c = echarts.init(chartRefs[1].current);
      c.setOption({
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            label: { show: true, formatter: "{b}\n{d}%" },
            data: successRateData,
          },
        ],
      });
      charts.push(c);
    }

    if (chartRefs[2].current) {
      const c = echarts.init(chartRefs[2].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: durationData.data.map((d) => d.name), bottom: 0 },
        grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: durationData.categories },
        yAxis: { type: "value", name: "分钟" },
        series: durationData.data.map((d) => ({
          name: d.name,
          type: "bar",
          data: d.data,
          itemStyle: { color: d.color },
        })),
      });
      charts.push(c);
    }

    if (chartRefs[3].current) {
      const c = echarts.init(chartRefs[3].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "10%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: volumeData.xAxis },
        yAxis: { type: "value", name: "GB" },
        series: [
          {
            type: "line",
            data: volumeData.data,
            smooth: true,
            areaStyle: { opacity: 0.2 },
            itemStyle: { color: "#6366F1" },
            lineStyle: { color: "#6366F1" },
          },
        ],
      });
      charts.push(c);
    }

    const handleResize = () => charts.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      charts.forEach((c) => c.dispose());
    };
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fadeIn p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">报表中心</h1>
          <p className="text-sm text-gray-500 mt-1.5">数据资产管理报告生成、管理和导出</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-3.5 h-3.5" />
            导出数据
          </Button>
          <Button
            size="sm"
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm gap-1"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4" />
            新建报告
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">报告总数</p>
              <p className="text-xl font-bold text-gray-900">{totalReports}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已发布</p>
              <p className="text-xl font-bold text-gray-900">{publishedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">草稿</p>
              <p className="text-xl font-bold text-gray-900">{draftCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Archive className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已归档</p>
              <p className="text-xl font-bold text-gray-900">{archivedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">PDF</p>
              <p className="text-xl font-bold text-gray-900">{pdfCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Excel</p>
              <p className="text-xl font-bold text-gray-900">{excelCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">CSV</p>
              <p className="text-xl font-bold text-gray-900">{csvCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setCurrentView("reports")}
            className={
              "px-4 py-2 rounded-md text-sm font-medium transition-colors " +
              (currentView === "reports"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            报告列表
          </button>
          <button
            onClick={() => setCurrentView("templates")}
            className={
              "px-4 py-2 rounded-md text-sm font-medium transition-colors " +
              (currentView === "templates"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            报告模板
          </button>
        </div>

        {currentView === "reports" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索报告..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm w-48"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ReportType | "all")}
              className="h-9 px-2 text-sm border rounded-md bg-white"
            >
              <option value="all">全部类型</option>
              <option value="sampling">抽样报告</option>
              <option value="privacy">隐私计算报告</option>
              <option value="quality">质量报告</option>
              <option value="audit">审计报告</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "all")}
              className="h-9 px-2 text-sm border rounded-md bg-white"
            >
              <option value="all">全部状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        )}
      </div>

      {/* Reports Table */}
      {currentView === "reports" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">报告ID</TableHead>
                <TableHead className="text-xs">报告名称</TableHead>
                <TableHead className="text-xs">类型</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-xs">格式</TableHead>
                <TableHead className="text-xs">创建人</TableHead>
                <TableHead className="text-xs">创建时间</TableHead>
                <TableHead className="text-xs text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const FormatIcon = formatIcon[report.format];
                return (
                  <TableRow key={report.id} className="hover:bg-slate-50">
                    <TableCell className="text-xs font-mono text-gray-500">
                      {report.id}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-gray-900">
                      {report.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${reportTypeColor[report.type]}`}
                      >
                        {reportTypeLabel[report.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusColor[report.status]}`}
                      >
                        {statusLabel[report.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FormatIcon className={`w-3.5 h-3.5 ${formatColor[report.format]}`} />
                        <span className="text-xs text-gray-500 uppercase">
                          {report.format}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {report.creator}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {report.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(report)}
                          className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="查看"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleEdit(report)}
                          className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(report)}
                          className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="复制"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredReports.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              暂无符合条件的报告
            </div>
          )}
        </div>
      )}

      {/* Templates Grid */}
      {currentView === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((tpl) => (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-xs text-gray-500">{tpl.description}</p>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${reportTypeColor[tpl.type]}`}
                  >
                    {reportTypeLabel[tpl.type]}
                  </Badge>
                  <span className="text-[10px] text-gray-400 uppercase">
                    默认格式: {tpl.defaultFormat}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleUseTemplate(tpl)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  使用此模板
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("sampling")}
            className={
              "px-4 py-2 rounded-md text-sm font-medium transition-colors " +
              (activeTab === "sampling"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            抽样统计报表
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={
              "px-4 py-2 rounded-md text-sm font-medium transition-colors " +
              (activeTab === "privacy"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            隐私计算统计
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {timeRanges.map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors " +
                  (timeRange === r
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500")
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "sampling" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">任务执行统计</h3>
              <Badge variant="outline" className="text-xs">
                按天
              </Badge>
            </div>
            <div ref={chartRefs[0]} style={{ height: 280 }} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">抽样成功率统计</h3>
              <Badge variant="outline" className="text-xs">
                总体
              </Badge>
            </div>
            <div ref={chartRefs[1]} style={{ height: 280 }} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">
                抽样耗时统计（分钟）
              </h3>
              <Badge variant="outline" className="text-xs">
                按规则类型
              </Badge>
            </div>
            <div ref={chartRefs[2]} style={{ height: 280 }} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">数据量统计</h3>
              <Badge variant="outline" className="text-xs">
                按天
              </Badge>
            </div>
            <div ref={chartRefs[3]} style={{ height: 280 }} />
          </div>
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">任务执行趋势</h3>
            </div>
            <div ref={chartRefs[0]} style={{ height: 280 }} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">算法使用分布</h3>
            </div>
            <div ref={chartRefs[1]} style={{ height: 280 }} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">资源利用率</h3>
            </div>
            <div ref={chartRefs[2]} style={{ height: 280 }} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">成功率按算法</h3>
            </div>
            <div ref={chartRefs[3]} style={{ height: 280 }} />
          </div>
        </div>
      )}

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="报告"
        fields={crudFields}
        data={selectedItem || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      {/* DetailDrawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedItem?.name || "报告详情"}
        data={selectedItem || {}}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedItem) handleEdit(selectedItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedItem) handleDelete(selectedItem);
        }}
      />

      {/* Export Dialog */}
      {exportOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExportOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              导出报告数据
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              将导出 <strong>{filteredReports.length}</strong> 条报告记录
            </p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="w-4 h-4 text-indigo-600"
                />
                <FileJson className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">CSV 格式</p>
                  <p className="text-xs text-gray-500">逗号分隔值，适合数据分析</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="exportFormat"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={() => setExportFormat("excel")}
                  className="w-4 h-4 text-indigo-600"
                />
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Excel 格式</p>
                  <p className="text-xs text-gray-500">制表符分隔，适合表格处理</p>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExportOpen(false)}>
                取消
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
