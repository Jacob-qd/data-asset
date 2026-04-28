import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Play,
  Database,
  Table,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Download,
  X,
  Check,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import Modal from "@/components/Modal";
import KPICard from "@/components/KPICard";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */

interface SamplingRule {
  id: string;
  name: string;
  description: string;
  samplingType: string;
  dataSource: string;
  tableName: string;
  samplingRatio: number;
  status: "success" | "disabled" | "warning" | "info";
  creator: string;
  updatedAt: string;
  createdAt: string;
  conditions?: string;
  isTemplate?: boolean;
  seed?: number;
  withReplacement?: boolean;
  stratumField?: string;
  stratumRatios?: { stratum: string; ratio: number }[];
  startPosition?: number;
  samplingInterval?: number;
  refStandard?: string;
  refStandardName?: string;
  clusterField?: string;
  clusterCount?: number;
  selectedFields?: string[];
  schedule?: string;
  reviewers?: string[];
}

const SAMPLING_TYPES = [
  { key: "随机抽样", label: "随机抽样", desc: "完全随机选取样本" },
  { key: "分层抽样", label: "分层抽样", desc: "按特征分层后抽样" },
  { key: "系统抽样", label: "系统抽样", desc: "等间隔抽样" },
  { key: "聚类抽样", label: "聚类抽样", desc: "按群组抽样" },
  { key: "多阶段抽样", label: "多阶段抽样", desc: "分阶段抽样" },
  { key: "条件抽样", label: "条件抽样", desc: "按条件筛选" },
  { key: "字段抽样", label: "字段抽样", desc: "指定字段抽样" },
] as const;

const DATA_SOURCES = [
  "企业工商库",
  "信用数据库",
  "医疗档案库",
  "交通流量库",
  "教育资源库",
  "社保数据库",
  "金融交易库",
  "环境监测库",
  "电商交易库",
  "物流追踪库",
] as const;

const TABLES_BY_SOURCE: Record<string, string[]> = {
  企业工商库: ["enterprise_info", "enterprise_change", "shareholder_info"],
  信用数据库: ["credit_score", "credit_record", "credit_report"],
  医疗档案库: ["patient_record", "medical_visit", "prescription"],
  交通流量库: ["traffic_flow", "vehicle_pass", "road_monitor"],
  教育资源库: ["student_info", "course_record", "education_degree"],
  社保数据库: ["social_insurance", "pension_record", "medical_insurance"],
  金融交易库: ["transaction", "account_balance", "trade_detail"],
  环境监测库: ["air_quality", "water_monitor", "noise_data"],
  电商交易库: ["order_info", "product_catalog", "user_behavior"],
  物流追踪库: ["shipment_record", "delivery_route", "warehouse_stock"],
};

const CREATORS = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十", "郑十一", "冯十二"] as const;

const STATUS_MAP: Record<string, { tag: "success" | "disabled" | "warning" | "info"; text: string }> = {
  active: { tag: "success", text: "生效中" },
  inactive: { tag: "disabled", text: "已停用" },
  pending: { tag: "warning", text: "待审核" },
  rejected: { tag: "info", text: "审核不通过" },
};

/* ───────────────────────────────────────────────
   Mock Data — 18 rules
   ─────────────────────────────────────────────── */

const MOCK_RULES: SamplingRule[] = [
  { id: "SR-001", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "企业工商信息随机抽样", description: "从企业工商库中随机抽取样本用于统计分析", samplingType: "随机抽样", dataSource: "企业工商库", tableName: "enterprise_info", samplingRatio: 10, status: "success", creator: "张三", updatedAt: "2026-04-10 14:32", createdAt: "2026-03-15", conditions: "注册时间>2020 && 注册资本>100万", seed: 42, withReplacement: false },
  { id: "SR-002", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "信用评分数据分层抽样", description: "按信用等级分层进行抽样", samplingType: "分层抽样", dataSource: "信用数据库", tableName: "credit_score", samplingRatio: 15, status: "success", creator: "李四", updatedAt: "2026-04-08 09:15", createdAt: "2026-03-20", conditions: "按信用等级分层", stratumField: "credit_level", stratumRatios: [{ stratum: "A级", ratio: 10 }, { stratum: "B级", ratio: 15 }, { stratum: "C级", ratio: 20 }, { stratum: "D级", ratio: 30 }] },
  { id: "SR-003", refStandard: "STD-001", refStandardName: "GB/T 2828.1-2012 一般检验水平I", name: "医疗档案系统抽样", description: "按固定间隔从医疗档案中抽样", samplingType: "系统抽样", dataSource: "医疗档案库", tableName: "patient_record", samplingRatio: 5, status: "success", creator: "王五", updatedAt: "2026-04-05 16:48", createdAt: "2026-03-22", conditions: "每隔20条抽1条", samplingInterval: 20, startPosition: 1 },
  { id: "SR-004", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "交通流量全量抽样", description: "高峰时段交通流量数据抽取", samplingType: "随机抽样", dataSource: "交通流量库", tableName: "traffic_flow", samplingRatio: 100, status: "disabled", creator: "赵六", updatedAt: "2026-03-28 11:22", createdAt: "2026-02-10", conditions: "高峰时段数据", withReplacement: true },
  { id: "SR-005", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "教育数据分层抽样", description: "按学历层次进行分层抽样", samplingType: "分层抽样", dataSource: "教育资源库", tableName: "education_degree", samplingRatio: 8, status: "warning", creator: "钱七", updatedAt: "2026-04-14 08:30", createdAt: "2026-04-01", conditions: "按学历层次分层", stratumField: "degree_level", stratumRatios: [{ stratum: "博士", ratio: 5 }, { stratum: "硕士", ratio: 8 }, { stratum: "本科", ratio: 10 }, { stratum: "专科", ratio: 15 }] },
  { id: "SR-006", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "社保数据随机抽样", description: "社保缴纳记录抽样", samplingType: "随机抽样", dataSource: "社保数据库", tableName: "social_insurance", samplingRatio: 12, status: "success", creator: "孙八", updatedAt: "2026-04-01 17:05", createdAt: "2026-03-05", conditions: "缴纳记录完整度>90%", seed: 123 },
  { id: "SR-007", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "金融交易分层抽样", description: "按交易金额分层抽样", samplingType: "分层抽样", dataSource: "金融交易库", tableName: "transaction", samplingRatio: 20, status: "info", creator: "周九", updatedAt: "2026-03-25 13:40", createdAt: "2026-02-28", conditions: "按交易金额分层", stratumField: "amount_range", stratumRatios: [{ stratum: "高", ratio: 5 }, { stratum: "中", ratio: 15 }, { stratum: "低", ratio: 25 }] },
  { id: "SR-008", refStandard: "STD-001", refStandardName: "GB/T 2828.1-2012 一般检验水平I", name: "环境监测系统抽样", description: "每小时抽样一次", samplingType: "系统抽样", dataSource: "环境监测库", tableName: "air_quality", samplingRatio: 10, status: "success", creator: "吴十", updatedAt: "2026-03-20 10:18", createdAt: "2026-02-15", conditions: "每小时抽样一次", samplingInterval: 60, startPosition: 0 },
  { id: "SR-009", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "电商交易聚类抽样", description: "按用户地域进行聚类抽样", samplingType: "聚类抽样", dataSource: "电商交易库", tableName: "order_info", samplingRatio: 25, status: "success", creator: "郑十一", updatedAt: "2026-04-12 15:55", createdAt: "2026-03-18", conditions: "按用户地域聚类", clusterField: "region", clusterCount: 10 },
  { id: "SR-010", refStandard: "STD-009", refStandardName: "AQL=2.5 加严检验", name: "物流追踪多阶段抽样", description: "省份→城市→仓库 三阶段抽样", samplingType: "多阶段抽样", dataSource: "物流追踪库", tableName: "shipment_record", samplingRatio: 30, status: "success", creator: "冯十二", updatedAt: "2026-04-16 09:42", createdAt: "2026-03-25", conditions: "省份→城市→仓库" },
  { id: "SR-011", refStandard: "STD-009", refStandardName: "AQL=2.5 加严检验", name: "企业异常条件抽样", description: "按异常指标条件筛选抽样", samplingType: "条件抽样", dataSource: "企业工商库", tableName: "enterprise_info", samplingRatio: 18, status: "warning", creator: "张三", updatedAt: "2026-04-18 11:10", createdAt: "2026-04-05", conditions: "异常指标>阈值 AND 注册资本<50万 OR 经营异常标记=1" },
  { id: "SR-012", refStandard: "STD-001", refStandardName: "GB/T 2828.1-2012 一般检验水平I", name: "医疗字段抽样模板", description: "仅抽取关键字段用于研究", samplingType: "字段抽样", dataSource: "医疗档案库", tableName: "patient_record", samplingRatio: 50, status: "success", creator: "王五", updatedAt: "2026-04-11 14:22", createdAt: "2026-03-28", conditions: "patient_id, age, gender, diagnosis_code", selectedFields: ["patient_id", "age", "gender", "diagnosis_code", "visit_date"], isTemplate: true },
  { id: "SR-013", refStandard: "STD-001", refStandardName: "GB/T 2828.1-2012 一般检验水平I", name: "信用报告系统抽样", description: "信用报告等间隔抽样", samplingType: "系统抽样", dataSource: "信用数据库", tableName: "credit_report", samplingRatio: 6, status: "disabled", creator: "李四", updatedAt: "2026-03-30 16:08", createdAt: "2026-02-20", conditions: "每隔15条抽1条", samplingInterval: 15, startPosition: 3 },
  { id: "SR-014", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "教育课程随机抽样", description: "课程记录随机抽样", samplingType: "随机抽样", dataSource: "教育资源库", tableName: "course_record", samplingRatio: 8, status: "success", creator: "钱七", updatedAt: "2026-04-09 08:45", createdAt: "2026-03-12", conditions: "课程状态=已完成", seed: 99 },
  { id: "SR-015", refStandard: "STD-010", refStandardName: "AQL=4.0 放宽检验", name: "噪声数据条件抽样", description: "超标噪声数据筛选", samplingType: "条件抽样", dataSource: "环境监测库", tableName: "noise_data", samplingRatio: 100, status: "success", creator: "吴十", updatedAt: "2026-04-07 13:30", createdAt: "2026-03-20", conditions: "noise_level>75dB AND time_period=夜间" },
  { id: "SR-016", refStandard: "STD-002", refStandardName: "GB/T 2828.1-2012 一般检验水平II", name: "用户行为分层抽样", description: "按用户活跃度分层", samplingType: "分层抽样", dataSource: "电商交易库", tableName: "user_behavior", samplingRatio: 12, status: "success", creator: "郑十一", updatedAt: "2026-04-17 10:05", createdAt: "2026-03-30", conditions: "按活跃度分层", stratumField: "activity_level", stratumRatios: [{ stratum: "高活跃", ratio: 5 }, { stratum: "中活跃", ratio: 10 }, { stratum: "低活跃", ratio: 20 }, { stratum: "沉睡", ratio: 30 }] },
  { id: "SR-017", refStandard: "STD-009", refStandardName: "AQL=2.5 加严检验", name: "仓库库存聚类抽样", description: "按仓库类型聚类抽样", samplingType: "聚类抽样", dataSource: "物流追踪库", tableName: "warehouse_stock", samplingRatio: 35, status: "disabled", creator: "冯十二", updatedAt: "2026-03-22 09:18", createdAt: "2026-02-25", conditions: "按仓库类型聚类", clusterField: "warehouse_type", clusterCount: 5 },
  { id: "SR-018", refStandard: "STD-010", refStandardName: "AQL=4.0 放宽检验", name: "养老金多阶段抽样模板", description: "省级→市级→个人 三阶段抽样", samplingType: "多阶段抽样", dataSource: "社保数据库", tableName: "pension_record", samplingRatio: 8, status: "success", creator: "孙八", updatedAt: "2026-04-19 15:30", createdAt: "2026-04-01", conditions: "省级→市级→个人", isTemplate: true },
];

/* ───────────────────────────────────────────────
   Type Badge
   ─────────────────────────────────────────────── */

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    随机抽样: "bg-[#EEF2FF] text-[#4338CA]",
    分层抽样: "bg-[#ECFDF5] text-[#059669]",
    系统抽样: "bg-[#EFF6FF] text-[#2563EB]",
    聚类抽样: "bg-[#FFFBEB] text-[#D97706]",
    多阶段抽样: "bg-[#FDF4FF] text-[#A855F7]",
    条件抽样: "bg-[#FFF1F2] text-[#E11D48]",
    字段抽样: "bg-[#F0FDFA] text-[#0D9488]",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium", colors[type] || "bg-slate-100 text-slate-600")}>
      {type}
    </span>
  );
}

/* ───────────────────────────────────────────────
   ProgressBar (animated)
   ─────────────────────────────────────────────── */

function ProgressBar({
  value,
  size = "sm",
  color = "bg-primary-500",
  showValue = false,
  className,
}: {
  value: number;
  size?: "sm" | "md";
  color?: string;
  showValue?: boolean;
  className?: string;
}) {
  const [width, setWidth] = useState(0);
  const barRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      requestAnimationFrame(() => setWidth(value));
    }
  }, [value]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        ref={barRef}
        className={cn(
          "flex-1 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
          style={{ width: `${width}%` }}
        />
      </div>
      {showValue && <span className="text-xs text-slate-500 font-mono w-8 text-right">{value}%</span>}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Step Indicator
   ─────────────────────────────────────────────── */

function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
              i < current && "bg-emerald-500 text-white",
              i === current && "bg-primary-500 text-white",
              i > current && "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            )}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              i <= current ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
            )}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 rounded",
                i < current ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Field Select
   ─────────────────────────────────────────────── */

function FieldSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full h-10 px-3 rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all",
        className
      )}
    >
      <option value="">{placeholder || "请选择"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ───────────────────────────────────────────────
   Main Component
   ─────────────────────────────────────────────── */

export default function SamplingRules() {
  const [rules, setRules] = useState<SamplingRule[]>(MOCK_RULES);
  const [filtered, setFiltered] = useState<SamplingRule[]>(MOCK_RULES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Drawers & Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRule, setEditRule] = useState<SamplingRule | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRule, setDetailRule] = useState<SamplingRule | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteRule, setDeleteRule] = useState<SamplingRule | null>(null);

  // Form wizard state
  const [wizardStep, setWizardStep] = useState(0);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formTable, setFormTable] = useState("");
  const [formType, setFormType] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sampling-specific state
  const [formSampleCount, setFormSampleCount] = useState<number | "">("");
  const [formSamplePercent, setFormSamplePercent] = useState<number>(10);
  const [formWithReplacement, setFormWithReplacement] = useState(false);
  const [formStratumField, setFormStratumField] = useState("");
  const [formStratumRatios, setFormStratumRatios] = useState<{ stratum: string; ratio: number }[]>([
    { stratum: "", ratio: 10 },
  ]);
  const [formStartPosition, setFormStartPosition] = useState(1);
  const [formInterval, setFormInterval] = useState(10);
  const [formClusterField, setFormClusterField] = useState("");
  const [formClusterCount, setFormClusterCount] = useState(5);
  const [formConditionGroups, setFormConditionGroups] = useState<
    { field: string; operator: string; value: string; logic: "AND" | "OR" }[]
  >([{ field: "", operator: "=", value: "", logic: "AND" }]);
  const [formSelectedFields, setFormSelectedFields] = useState<string[]>([]);
  const [formSchedule, setFormSchedule] = useState("immediate");
  const [formReviewers, setFormReviewers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  // ── Filtering ──────────────────────

  const applyFilters = useCallback(
    (q: string, t: string, s: string, src: string, c: string) => {
      let result = rules;
      if (q) {
        const lower = q.toLowerCase();
        result = result.filter(
          (r) =>
            r.name.toLowerCase().includes(lower) ||
            r.id.toLowerCase().includes(lower) ||
            r.dataSource.toLowerCase().includes(lower) ||
            r.creator.toLowerCase().includes(lower)
        );
      }
      if (t) result = result.filter((r) => r.samplingType === t);
      if (s) {
        const statusMap: Record<string, string> = { active: "success", inactive: "disabled", pending: "warning", rejected: "info" };
        result = result.filter((r) => r.status === statusMap[s]);
      }
      if (src) result = result.filter((r) => r.dataSource === src);
      if (c) result = result.filter((r) => r.creator === c);
      setFiltered(result);
    },
    [rules]
  );

  const handleSearch = (v: string) => {
    setSearchQuery(v);
    applyFilters(v, filterType, filterStatus, filterSource, filterCreator);
  };

  const handleFilterChange = (type: string, value: string) => {
    let nextType = filterType, nextStatus = filterStatus, nextSource = filterSource, nextCreator = filterCreator;
    if (type === "type") nextType = value;
    if (type === "status") nextStatus = value;
    if (type === "source") nextSource = value;
    if (type === "creator") nextCreator = value;
    setFilterType(nextType);
    setFilterStatus(nextStatus);
    setFilterSource(nextSource);
    setFilterCreator(nextCreator);
    applyFilters(searchQuery, nextType, nextStatus, nextSource, nextCreator);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterType("");
    setFilterStatus("");
    setFilterSource("");
    setFilterCreator("");
    setFiltered(rules);
    setShowFilters(false);
  };

  // ── Export ─────────────────────────

  const exportToCsv = () => {
    const headers = ["规则ID", "规则名称", "抽样方式", "数据源", "数据表", "抽样比例(%)", "状态", "创建人", "更新时间"];
    const rows = filtered.map((r) => [
      r.id,
      r.name,
      r.samplingType,
      r.dataSource,
      r.tableName,
      r.samplingRatio,
      STATUS_MAP[r.status]?.text || r.status,
      r.creator,
      r.updatedAt,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `抽样规则_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const headers = ["规则ID", "规则名称", "抽样方式", "数据源", "数据表", "抽样比例(%)", "状态", "创建人", "更新时间"];
    const rows = filtered.map((r) => [
      r.id,
      r.name,
      r.samplingType,
      r.dataSource,
      r.tableName,
      r.samplingRatio,
      STATUS_MAP[r.status]?.text || r.status,
      r.creator,
      r.updatedAt,
    ]);

    let html = "<table border='1'>";
    html += "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";
    rows.forEach((row) => {
      html += "<tr>" + row.map((cell) => `<td>${cell}</td>`).join("") + "</tr>";
    });
    html += "</table>";

    const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `抽样规则_${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
  };

  // ── CRUD ───────────────────────────

  const openCreateDrawer = () => {
    setEditRule(null);
    setWizardStep(0);
    resetForm();
    setDrawerOpen(true);
  };

  const openEditDrawer = (rule: SamplingRule) => {
    setEditRule(rule);
    setWizardStep(0);
    setFormName(rule.name);
    setFormDesc(rule.description);
    setFormSource(rule.dataSource);
    setFormTable(rule.tableName);
    setFormType(rule.samplingType);
    setFormSamplePercent(rule.samplingRatio);
    setFormWithReplacement(rule.withReplacement || false);
    setFormStratumField(rule.stratumField || "");
    setFormStratumRatios(rule.stratumRatios || [{ stratum: "", ratio: 10 }]);
    setFormStartPosition(rule.startPosition || 1);
    setFormInterval(rule.samplingInterval || 10);
    setFormClusterField(rule.clusterField || "");
    setFormClusterCount(rule.clusterCount || 5);
    setFormSelectedFields(rule.selectedFields || []);
    setDrawerOpen(true);
  };

  const openDetailModal = (rule: SamplingRule) => {
    setDetailRule(rule);
    setDetailModalOpen(true);
  };

  const confirmDelete = (rule: SamplingRule) => {
    setDeleteRule(rule);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (!deleteRule) return;
    const next = rules.filter((r) => r.id !== deleteRule.id);
    setRules(next);
    setFiltered(next);
    setDeleteConfirmOpen(false);
    setDeleteRule(null);
  };

  const duplicateRule = (rule: SamplingRule) => {
    const newRule: SamplingRule = {
      ...rule,
      id: `SR-${String(rules.length + 1).padStart(3, "0")}`,
      name: `${rule.name} (副本)`,
      status: "success",
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [newRule, ...rules];
    setRules(next);
    setFiltered(next);
  };

  const toggleStatus = (rule: SamplingRule) => {
    const nextStatus = rule.status === "success" ? "disabled" as const : "success" as const;
    const next = rules.map((r) => (r.id === rule.id ? { ...r, status: nextStatus, updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ") } : r));
    setRules(next);
    setFiltered(next);
  };

  // ── Form helpers ───────────────────

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormSource("");
    setFormTable("");
    setFormType("");
    setFormErrors({});
    setFormSampleCount("");
    setFormSamplePercent(10);
    setFormWithReplacement(false);
    setFormStratumField("");
    setFormStratumRatios([{ stratum: "", ratio: 10 }]);
    setFormStartPosition(1);
    setFormInterval(10);
    setFormClusterField("");
    setFormClusterCount(5);
    setFormConditionGroups([{ field: "", operator: "=", value: "", logic: "AND" }]);
    setFormSelectedFields([]);
    setFormSchedule("immediate");
    setFormReviewers([]);
    setConnectionStatus("idle");
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 0) {
      if (!formName.trim()) errors.name = "请输入规则名称";
      if (!formSource) errors.source = "请选择数据源";
      if (!formTable) errors.table = "请选择数据表";
      if (!formType) errors.type = "请选择抽样方式";
    }
    if (step === 1) {
      if (formType === "随机抽样") {
        if (formSamplePercent < 1 || formSamplePercent > 100) errors.ratio = "抽样比例需在1-100之间";
      }
      if (formType === "分层抽样" && !formStratumField) errors.stratumField = "请选择分层字段";
      if (formType === "系统抽样") {
        if (formInterval < 1) errors.interval = "抽样间隔需大于0";
      }
      if (formType === "聚类抽样" && !formClusterField) errors.clusterField = "请选择聚类字段";
      if (formType === "字段抽样" && formSelectedFields.length === 0) errors.fields = "请至少选择一个字段";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTestConnection = () => {
    if (!formSource) return;
    setConnectionStatus("testing");
    setTimeout(() => setConnectionStatus("success"), 1200);
  };

  const handleSaveRule = () => {
    if (!validateStep(1)) return;
    const newRule: SamplingRule = {
      id: editRule ? editRule.id : `SR-${String(rules.length + 1).padStart(3, "0")}`,
      name: formName,
      description: formDesc,
      samplingType: formType,
      dataSource: formSource,
      tableName: formTable,
      samplingRatio: formSamplePercent,
      status: "success",
      creator: editRule ? editRule.creator : "管理员",
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      createdAt: editRule ? editRule.createdAt : new Date().toISOString().slice(0, 10),
      withReplacement: formWithReplacement,
      stratumField: formStratumField || undefined,
      stratumRatios: formStratumRatios.length > 0 ? formStratumRatios : undefined,
      startPosition: formStartPosition,
      samplingInterval: formInterval,
      clusterField: formClusterField || undefined,
      clusterCount: formClusterCount,
      selectedFields: formSelectedFields.length > 0 ? formSelectedFields : undefined,
      schedule: formSchedule,
      reviewers: formReviewers,
    };
    const next = editRule
      ? rules.map((r) => (r.id === editRule.id ? newRule : r))
      : [newRule, ...rules];
    setRules(next);
    setFiltered(next);
    setDrawerOpen(false);
  };

  // ── Stats ──────────────────────────

  const stats = {
    total: rules.length,
    active: rules.filter((r) => r.status === "success").length,
    templates: rules.filter((r) => r.isTemplate).length,
  };

  // ── Table columns ──────────────────

  const columns = [
    { key: "name", title: "规则名称", render: (row: SamplingRule) => (
      <div>
        <div className="font-medium text-slate-800 dark:text-slate-200">{row.name}</div>
        <div className="text-xs text-slate-400 truncate max-w-[180px]">{row.description}</div>
      </div>
    )},
    { key: "samplingType", title: "抽样方式", width: "100px", render: (row: SamplingRule) => <TypeBadge type={row.samplingType} /> },
    { key: "dataSource", title: "数据源", width: "130px", render: (row: SamplingRule) => (
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm">{row.dataSource}</span>
      </div>
    )},
    { key: "tableName", title: "数据表", width: "140px", render: (row: SamplingRule) => (
      <div className="flex items-center gap-1.5">
        <Table className="w-3.5 h-3.5 text-slate-400" />
        <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{row.tableName}</code>
      </div>
    )},
    { key: "samplingRatio", title: "抽样比例", width: "80px", render: (row: SamplingRule) => (
      <span className="font-mono text-sm font-semibold text-primary-600">{row.samplingRatio}%</span>
    )},
    { key: "refStandard", title: "关联标准", width: "120px", render: (row: SamplingRule) => (
      <span className="text-xs text-gray-500 font-mono">{row.refStandard || "-"}</span>
    )},
    { key: "status", title: "状态", width: "90px", render: (row: SamplingRule) => {
      const st = STATUS_MAP[row.status] || { tag: "success" as const, text: "未知" };
      return <StatusTag status={st.tag} text={st.text} />;
    }},
    { key: "creator", title: "创建人", width: "90px", render: (row: SamplingRule) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium text-primary-600">
          {row.creator[0]}
        </div>
        <span className="text-sm">{row.creator}</span>
      </div>
    )},
    { key: "updatedAt", title: "更新时间", width: "130px" },
    {
      key: "actions",
      title: "操作",
      width: "140px",
      render: (_row: SamplingRule, idx: number) => {
        const rule = filtered[idx];
        return (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openDetailModal(rule); }} title="查看">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDrawer(rule); }} title="编辑">
              <Edit className="w-3.5 h-3.5 text-primary-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); duplicateRule(rule); }} title="复制">
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); confirmDelete(rule); }} title="删除">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Available fields for field selector
  const availableFields = formSource && formTable
    ? ["id", "name", "created_at", "updated_at", "status", "region", "amount", "category", "score", "level"]
    : [];

  // ── Render ─────────────────────────

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">抽样规则配置</h1>
          <p className="text-sm text-slate-500 mt-1">管理 {stats.total} 条抽样规则，覆盖 {new Set(rules.map((r) => r.dataSource)).size} 个数据源</p>
        </div>
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-primary-500 hover:bg-primary-600 text-white"
          onClick={openCreateDrawer}
        >
          <Plus className="w-4 h-4" />
          新建规则
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="规则总数"
          value={stats.total}
          change="12 条本月新增"
          changeType="up"
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-[#EEF2FF] dark:bg-primary-900/20"
          iconColor="text-[#6366F1]"
          sparklineColor="#6366F1"
          sparklineData={[20, 25, 22, 30, 28, 35, 32, 40, 38, stats.total]}
          delay={0}
        />
        <KPICard
          title="生效中规则"
          value={stats.active}
          change={`${Math.round((stats.active / stats.total) * 100)}% 生效率`}
          changeType="up"
          icon={<CheckCircle className="w-5 h-5" />}
          iconBg="bg-[#ECFDF5] dark:bg-emerald-900/20"
          iconColor="text-[#10B981]"
          sparklineColor="#10B981"
          sparklineData={[25, 27, 26, 30, 29, 33, 31, stats.active, stats.active, stats.active]}
          delay={100}
        />
        <KPICard
          title="规则模板"
          value={stats.templates}
          change="可复用模板"
          changeType="neutral"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFFBEB] dark:bg-amber-900/20"
          iconColor="text-[#F59E0B]"
          sparklineColor="#F59E0B"
          sparklineData={[2, 3, 2, 4, 3, 5, 4, stats.templates, stats.templates, stats.templates]}
          delay={200}
        />
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索规则名称、编号、创建人..."
              className="pl-9 pr-4 h-9 text-sm dark:bg-[#1E293B] dark:border-[#334155] dark:text-slate-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            高级筛选
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={resetFilters}>
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCsv}>
                导出为 CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                导出为 Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showFilters && (
          <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155] animate-slideDown">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">抽样方式</label>
                <FieldSelect value={filterType} onChange={(v) => handleFilterChange("type", v)} options={SAMPLING_TYPES.map((t) => t.key)} placeholder="全部方式" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">规则状态</label>
                <FieldSelect value={filterStatus} onChange={(v) => handleFilterChange("status", v)} options={["active", "inactive", "pending", "rejected"]} placeholder="全部状态" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">数据源</label>
                <FieldSelect value={filterSource} onChange={(v) => handleFilterChange("source", v)} options={[...DATA_SOURCES]} placeholder="全部数据源" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">创建人</label>
                <FieldSelect value={filterCreator} onChange={(v) => handleFilterChange("creator", v)} options={[...CREATORS]} placeholder="全部创建人" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table */}
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        selectable
        onRowClick={(row) => openDetailModal(row)}
      />

      {/* ─── Create/Edit Drawer ─── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editRule ? `编辑规则: ${editRule.name}` : "新建抽样规则"}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {wizardStep > 0 && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setWizardStep(wizardStep - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                  上一步
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
                取消
              </Button>
              {wizardStep < 3 ? (
                <Button
                  size="sm"
                  className="bg-primary-500 hover:bg-primary-600 text-white gap-1"
                  onClick={() => {
                    if (wizardStep === 0 && !validateStep(0)) return;
                    if (wizardStep === 1 && !validateStep(1)) return;
                    setWizardStep(wizardStep + 1);
                  }}
                >
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white" onClick={handleSaveRule}>
                  {editRule ? "保存修改" : "创建规则"}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Step Indicator */}
          <StepIndicator
            steps={["基本信息", "抽样配置", "预览", "高级设置"]}
            current={wizardStep}
          />

          {/* ─── Step 1: Basic Info ─── */}
          {wizardStep === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  规则名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="请输入规则名称"
                  className={cn(formErrors.name && "border-red-500 focus-visible:ring-red-500/30")}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">规则描述</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="请输入规则描述"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    数据源 <span className="text-red-500">*</span>
                  </label>
                  <FieldSelect
                    value={formSource}
                    onChange={(v) => { setFormSource(v); setFormTable(""); setConnectionStatus("idle"); }}
                    options={[...DATA_SOURCES]}
                    placeholder="选择数据源"
                    className={formErrors.source ? "border-red-500" : ""}
                  />
                  {formErrors.source && <p className="text-xs text-red-500 mt-1">{formErrors.source}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    数据表 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FieldSelect
                        value={formTable}
                        onChange={setFormTable}
                        options={formSource ? (TABLES_BY_SOURCE[formSource] || []) : []}
                        placeholder={formSource ? "选择数据表" : "请先选择数据源"}
                        className={formErrors.table ? "border-red-500" : ""}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-2 text-xs shrink-0"
                      disabled={!formSource || connectionStatus === "testing"}
                      onClick={handleTestConnection}
                    >
                      {connectionStatus === "testing" ? (
                        <span className="animate-spin w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full" />
                      ) : connectionStatus === "success" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <span>测试</span>
                      )}
                    </Button>
                  </div>
                  {connectionStatus === "success" && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 连接成功
                    </p>
                  )}
                  {formErrors.table && <p className="text-xs text-red-500 mt-1">{formErrors.table}</p>}
                </div>
              </div>

              {/* Field list preview */}
              {formSource && formTable && connectionStatus === "success" && (
                <div className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155]">
                  <div className="text-xs font-medium text-slate-500 mb-2">字段列表</div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableFields.map((f) => (
                      <code key={f} className="text-xs font-mono bg-white dark:bg-[#0B1120] px-2 py-0.5 rounded border border-slate-200 dark:border-[#334155]">{f}</code>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  抽样方式 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLING_TYPES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setFormType(t.key)}
                      className={cn(
                        "flex flex-col items-start p-3 rounded-lg border text-left transition-all",
                        formType === t.key
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                          : "border-slate-200 dark:border-[#334155] hover:border-primary-300 dark:hover:border-primary-700"
                      )}
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.label}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
                {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
              </div>
            </div>
          )}

          {/* ─── Step 2: Sampling Config ─── */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              {/* 随机抽样 */}
              {formType === "随机抽样" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">抽样比例 (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={formSamplePercent}
                        onChange={(e) => setFormSamplePercent(Number(e.target.value))}
                        className="flex-1 accent-primary-500"
                      />
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={formSamplePercent}
                        onChange={(e) => setFormSamplePercent(Number(e.target.value))}
                        className="w-20 h-9 text-center"
                      />
                    </div>
                    {formErrors.ratio && <p className="text-xs text-red-500 mt-1">{formErrors.ratio}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="replacement"
                      checked={formWithReplacement}
                      onChange={(e) => setFormWithReplacement(e.target.checked)}
                      className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="replacement" className="text-sm text-slate-600 dark:text-slate-300">
                      允许重复抽样（有放回）
                    </label>
                  </div>
                </div>
              )}

              {/* 分层抽样 */}
              {formType === "分层抽样" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      分层字段 <span className="text-red-500">*</span>
                    </label>
                    <FieldSelect
                      value={formStratumField}
                      onChange={setFormStratumField}
                      options={availableFields}
                      placeholder="选择分层字段"
                      className={formErrors.stratumField ? "border-red-500" : ""}
                    />
                    {formErrors.stratumField && <p className="text-xs text-red-500 mt-1">{formErrors.stratumField}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">各层抽样比例</label>
                    <div className="space-y-2">
                      {formStratumRatios.map((sr, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={sr.stratum}
                            onChange={(e) => {
                              const next = [...formStratumRatios];
                              next[i] = { ...next[i], stratum: e.target.value };
                              setFormStratumRatios(next);
                            }}
                            placeholder="层名称"
                            className="flex-1 h-8 text-sm"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={sr.ratio}
                            onChange={(e) => {
                              const next = [...formStratumRatios];
                              next[i] = { ...next[i], ratio: Number(e.target.value) };
                              setFormStratumRatios(next);
                            }}
                            className="w-20 h-8 text-sm text-center"
                          />
                          <span className="text-xs text-slate-500">%</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setFormStratumRatios(formStratumRatios.filter((_, j) => j !== i))}
                          >
                            <X className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => setFormStratumRatios([...formStratumRatios, { stratum: "", ratio: 10 }])}
                      >
                        <Plus className="w-3 h-3" />
                        添加分层
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 系统抽样 */}
              {formType === "系统抽样" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        起始位置
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={formStartPosition}
                        onChange={(e) => setFormStartPosition(Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        抽样间隔 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={formInterval}
                        onChange={(e) => setFormInterval(Number(e.target.value))}
                        className={cn("h-9", formErrors.interval && "border-red-500")}
                      />
                      {formErrors.interval && <p className="text-xs text-red-500 mt-1">{formErrors.interval}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* 聚类抽样 */}
              {formType === "聚类抽样" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      聚类字段 <span className="text-red-500">*</span>
                    </label>
                    <FieldSelect
                      value={formClusterField}
                      onChange={setFormClusterField}
                      options={availableFields}
                      placeholder="选择聚类字段"
                      className={formErrors.clusterField ? "border-red-500" : ""}
                    />
                    {formErrors.clusterField && <p className="text-xs text-red-500 mt-1">{formErrors.clusterField}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">抽取群数</label>
                    <Input
                      type="number"
                      min={1}
                      value={formClusterCount}
                      onChange={(e) => setFormClusterCount(Number(e.target.value))}
                      className="h-9"
                    />
                  </div>
                </div>
              )}

              {/* 多阶段抽样 */}
              {formType === "多阶段抽样" && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155]">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">阶段 1: 省级抽样</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">抽样比例:</span>
                      <input type="range" min={1} max={100} defaultValue={30} className="w-32 accent-primary-500" />
                      <span className="text-xs font-mono">30%</span>
                    </div>
                    <div className="text-xs text-slate-400">字段: province_code</div>
                  </div>
                  <div className="pl-4 border-l-2 border-primary-300">
                    <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155]">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">阶段 2: 市级抽样</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500">抽样比例:</span>
                        <input type="range" min={1} max={100} defaultValue={50} className="w-32 accent-primary-500" />
                        <span className="text-xs font-mono">50%</span>
                      </div>
                      <div className="text-xs text-slate-400">字段: city_code</div>
                    </div>
                  </div>
                  <div className="pl-8 border-l-2 border-primary-200">
                    <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155]">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">阶段 3: 个人抽样</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500">抽样比例:</span>
                        <input type="range" min={1} max={100} defaultValue={20} className="w-32 accent-primary-500" />
                        <span className="text-xs font-mono">20%</span>
                      </div>
                      <div className="text-xs text-slate-400">字段: person_id</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 条件抽样 */}
              {formType === "条件抽样" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">条件配置</label>
                  {formConditionGroups.map((cg, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155] space-y-2">
                      <div className="flex items-center gap-2">
                        <FieldSelect value={cg.field} onChange={(v) => {
                          const next = [...formConditionGroups];
                          next[i] = { ...next[i], field: v };
                          setFormConditionGroups(next);
                        }} options={availableFields} placeholder="选择字段" />
                        <select
                          value={cg.operator}
                          onChange={(e) => {
                            const next = [...formConditionGroups];
                            next[i] = { ...next[i], operator: e.target.value };
                            setFormConditionGroups(next);
                          }}
                          className="h-10 px-2 rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm"
                        >
                          {["=", "!=", ">", "<", ">=", "<=", "IN", "LIKE", "IS NULL"].map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                        <Input
                          value={cg.value}
                          onChange={(e) => {
                            const next = [...formConditionGroups];
                            next[i] = { ...next[i], value: e.target.value };
                            setFormConditionGroups(next);
                          }}
                          placeholder="值"
                          className="h-9 flex-1"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormConditionGroups(formConditionGroups.filter((_, j) => j !== i))}>
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                      {i < formConditionGroups.length - 1 && (
                        <div className="flex justify-center">
                          <select
                            value={cg.logic}
                            onChange={(e) => {
                              const next = [...formConditionGroups];
                              next[i] = { ...next[i], logic: e.target.value as "AND" | "OR" };
                              setFormConditionGroups(next);
                            }}
                            className="h-7 px-2 rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setFormConditionGroups([...formConditionGroups, { field: "", operator: "=", value: "", logic: "AND" }])}>
                    <Plus className="w-3 h-3" />
                    添加条件
                  </Button>
                </div>
              )}

              {/* 字段抽样 */}
              {formType === "字段抽样" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    选择抽样字段 <span className="text-red-500">*</span>
                  </label>
                  {formErrors.fields && <p className="text-xs text-red-500">{formErrors.fields}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields.map((f) => (
                      <label key={f} className="flex items-center gap-2 p-2 rounded-md border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273548] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formSelectedFields.includes(f)}
                          onChange={(e) => {
                            if (e.target.checked) setFormSelectedFields([...formSelectedFields, f]);
                            else setFormSelectedFields(formSelectedFields.filter((x) => x !== f));
                          }}
                          className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                        />
                        <code className="text-xs font-mono">{f}</code>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3: Preview ─── */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              {/* SQL Preview */}
              <div className="p-4 bg-[#1E293B] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300">SQL 预览</span>
                  <span className="text-xs text-slate-500">{formType}</span>
                </div>
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {formType === "随机抽样" && `SELECT * FROM ${formTable || "table"} \nWHERE RANDOM() < ${formSamplePercent / 100} \nLIMIT 10000;`}
                  {formType === "分层抽样" && `SELECT * FROM ${formTable || "table"} \nWHERE ${formStratumField || "stratum"} IN (...) \n  AND RANDOM() < ${formSamplePercent / 100};`}
                  {formType === "系统抽样" && `SELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (ORDER BY id) as rn\n  FROM ${formTable || "table"}\n) t\nWHERE (rn - ${formStartPosition}) % ${formInterval} = 0;`}
                  {formType === "聚类抽样" && `SELECT * FROM ${formTable || "table"} \nWHERE ${formClusterField || "cluster"} IN (\n  SELECT DISTINCT ${formClusterField || "cluster"} \n  FROM ${formTable || "table"} \n  ORDER BY RANDOM() \n  LIMIT ${formClusterCount}\n);`}
                  {formType === "多阶段抽样" && `-- 阶段1: 省级抽样\nSELECT * FROM ${formTable || "table"} \nWHERE province_code IN (SELECT ...);\n\n-- 阶段2: 市级抽样\nSELECT * FROM ... WHERE city_code IN (...);\n\n-- 阶段3: 个人抽样\nSELECT * FROM ... WHERE person_id IN (...);`}
                  {formType === "条件抽样" && `SELECT * FROM ${formTable || "table"} \nWHERE ${formConditionGroups.map((cg) => `${cg.field || "field"} ${cg.operator} '${cg.value}'`).join(` ${formConditionGroups[0]?.logic || "AND"} `)};`}
                  {formType === "字段抽样" && `SELECT ${formSelectedFields.length > 0 ? formSelectedFields.join(", ") : "*"} \nFROM ${formTable || "table"}\nLIMIT 10000;`}
                </pre>
              </div>

              {/* Sample Data Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">样本数据预览</span>
                  <span className="text-xs text-slate-400">前 10 条</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#334155]">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-[#1E293B] text-slate-500">
                      <tr>
                        {availableFields.slice(0, 5).map((f) => (
                          <th key={f} className="px-3 py-2 text-left font-medium border-b border-slate-200 dark:border-[#334155]">{f}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }, (_, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-[#334155]/50 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                          <td className="px-3 py-2 font-mono text-primary-600">{100000 + i}</td>
                          <td className="px-3 py-2">示例数据_{i + 1}</td>
                          <td className="px-3 py-2 font-mono text-slate-400">2026-04-{String(10 + i).padStart(2, "0")}</td>
                          <td className="px-3 py-2 font-mono text-slate-400">2026-04-{String(20 + i).padStart(2, "0")}</td>
                          <td className="px-3 py-2">
                            <StatusTag status={i % 3 === 0 ? "success" : i % 3 === 1 ? "warning" : "info"} text={i % 3 === 0 ? "正常" : i % 3 === 1 ? "待处理" : "审核中"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4: Advanced Settings ─── */}
          {wizardStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">调度方式</label>
                <div className="space-y-2">
                  {[
                    { key: "immediate", label: "立即执行", desc: "规则保存后立即执行一次" },
                    { key: "once", label: "定时执行", desc: "在指定时间执行一次" },
                    { key: "recurring", label: "周期性执行", desc: "按Cron表达式周期性执行" },
                  ].map((opt) => (
                    <label key={opt.key} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      formSchedule === opt.key
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-[#334155] hover:border-primary-300"
                    )}>
                      <input
                        type="radio"
                        name="schedule"
                        value={opt.key}
                        checked={formSchedule === opt.key}
                        onChange={(e) => setFormSchedule(e.target.value)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{opt.label}</div>
                        <div className="text-xs text-slate-400">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formSchedule === "recurring" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cron 表达式</label>
                  <Input placeholder="0 0 2 * * ?" defaultValue="0 0 2 * * ?" className="font-mono h-9" />
                  <p className="text-xs text-slate-400 mt-1">示例: 0 0 2 * * ? 表示每天凌晨2点执行</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">审核流程分配</label>
                <div className="grid grid-cols-2 gap-2">
                  {CREATORS.slice(0, 6).map((c) => (
                    <label key={c} className="flex items-center gap-2 p-2 rounded-md border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273548] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formReviewers.includes(c)}
                        onChange={(e) => {
                          if (e.target.checked) setFormReviewers([...formReviewers, c]);
                          else setFormReviewers(formReviewers.filter((x) => x !== c));
                        }}
                        className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-medium text-primary-600">{c[0]}</div>
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* ─── Detail Modal ─── */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={detailRule?.name || "规则详情"}
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
              关闭
            </Button>
            {detailRule && (
              <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white gap-1" onClick={() => { setDetailModalOpen(false); openEditDrawer(detailRule); }}>
                <Edit className="w-3.5 h-3.5" />
                编辑
              </Button>
            )}
          </>
        }
      >
        {detailRule && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(() => {
                const st = STATUS_MAP[detailRule.status] || { tag: "success" as const, text: "未知" };
                return <StatusTag status={st.tag} text={st.text} />;
              })()}
              {detailRule.isTemplate && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">模板</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">规则编号</div>
                <div className="text-sm font-mono text-slate-700 dark:text-slate-200">{detailRule.id}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">抽样方式</div>
                <div><TypeBadge type={detailRule.samplingType} /></div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">数据源 / 表</div>
                <div className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  {detailRule.dataSource} / <code className="text-xs font-mono bg-slate-100 px-1 rounded">{detailRule.tableName}</code>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">抽样比例</div>
                <div className="text-sm font-mono font-semibold text-primary-600">{detailRule.samplingRatio}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">创建人</div>
                <div className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">{detailRule.creator[0]}</div>
                  {detailRule.creator}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">更新时间</div>
                <div className="text-sm text-slate-700 dark:text-slate-200">{detailRule.updatedAt}</div>
              </div>
            </div>
            {detailRule.conditions && (
              <div>
                <div className="text-xs text-slate-400 mb-1">适用条件</div>
                <div className="p-2 bg-slate-50 dark:bg-[#1E293B] rounded-md text-xs text-slate-600 dark:text-slate-300 font-mono">{detailRule.conditions}</div>
              </div>
            )}
            {detailRule.description && (
              <div>
                <div className="text-xs text-slate-400 mb-1">描述</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{detailRule.description}</div>
              </div>
            )}
            {detailRule.stratumRatios && (
              <div>
                <div className="text-xs text-slate-400 mb-1">分层配置</div>
                <div className="flex flex-wrap gap-1.5">
                  {detailRule.stratumRatios.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-[#273548] rounded text-xs text-slate-600 dark:text-slate-300">
                      {s.stratum}: {s.ratio}%
                    </span>
                  ))}
                </div>
              </div>
            )}
            {detailRule.selectedFields && (
              <div>
                <div className="text-xs text-slate-400 mb-1">抽样字段</div>
                <div className="flex flex-wrap gap-1.5">
                  {detailRule.selectedFields.map((f) => (
                    <code key={f} className="text-xs font-mono bg-slate-100 dark:bg-[#273548] px-2 py-0.5 rounded">{f}</code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── Delete Confirm Modal ─── */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="确认删除"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              取消
            </Button>
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white gap-1" onClick={executeDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              确认删除
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              确定要删除规则 <strong>"{deleteRule?.name}"</strong> 吗？
            </p>
            <p className="text-xs text-slate-400 mt-1">此操作不可恢复，相关任务也将被影响。</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
