import { useState, useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Search, RefreshCw, Download, Trash2, Edit3, Eye, Shield,
  Plus, Database, FileSpreadsheet, Settings, Filter, ArrowUpDown,
  ArrowUp, ArrowDown, BarChart3, GitBranch, Gauge, Lock,
  CheckCircle2, XCircle, AlertTriangle, FileDown, Type, Hash, Calendar, ToggleLeft,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface DataSource {
  id: string;
  name: string;
  type: string;
  tables: number;
  records: string;
  updated: string;
}

interface SampleRow {
  id: number;
  name: string;
  age: number;
  city: string;
  income: number;
  gender: string;
  isSensitive: boolean;
  phone: string;
  email: string;
  registerDate: string;
  vipLevel: number;
  creditScore: number;
}

interface ColumnMeta {
  name: string;
  type: string;
  label: string;
  nullable: boolean;
  sensitive: boolean;
}

interface TableItem {
  id: string;
  name: string;
  records: number;
  size: string;
  updated: string;
}

interface ColumnStats {
  name: string;
  type: string;
  nullCount: number;
  nullRate: number;
  uniqueCount: number;
  distinctRate: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  maxLength?: number;
  minLength?: number;
  topValues?: { value: string; count: number }[];
}

interface TableProfile {
  totalRows: number;
  totalColumns: number;
  size: string;
  duplicateRows: number;
  overallNullRate: number;
  qualityScore: number;
  columnStats: ColumnStats[];
}

interface LineageNode {
  id: string;
  name: string;
  type: "upstream" | "current" | "downstream";
}

interface LineageEdge {
  source: string;
  target: string;
}

interface QualityRule {
  id: string;
  name: string;
  type: string;
  expression: string;
  threshold: number;
  status: "active" | "inactive";
  passRate: number;
  lastRun?: string;
}

interface ExportHistory {
  id: string;
  format: string;
  columns: string[];
  rowRange: string;
  encoding: string;
  status: "completed" | "failed" | "running";
  progress: number;
  createdAt: string;
}

interface ColumnFilter {
  column: string;
  operator: string;
  value: string;
}

const generateId = () => Date.now().toString(36).toUpperCase();

const initialDataSources: DataSource[] = [
  { id: "DS-001", name: "零售交易数据", type: "MySQL", tables: 12, records: "2.4M", updated: "2024-04-15" },
  { id: "DS-002", name: "客户画像数据", type: "PostgreSQL", tables: 8, records: "850K", updated: "2024-04-14" },
  { id: "DS-003", name: "风控样本数据", type: "CSV", tables: 3, records: "120K", updated: "2024-04-13" },
  { id: "DS-004", name: "供应链数据", type: "Oracle", tables: 15, records: "5.1M", updated: "2024-04-12" },
  { id: "DS-005", name: "用户行为日志", type: "Excel", tables: 1, records: "3.2M", updated: "2024-04-11" },
  { id: "DS-006", name: "财务报表数据", type: "MySQL", tables: 20, records: "1.8M", updated: "2024-04-10" },
  { id: "DS-007", name: "产品库存数据", type: "PostgreSQL", tables: 6, records: "420K", updated: "2024-04-09" },
  { id: "DS-008", name: "营销活动数据", type: "CSV", tables: 2, records: "680K", updated: "2024-04-08" },
  { id: "DS-009", name: "客服工单数据", type: "MySQL", tables: 10, records: "960K", updated: "2024-04-07" },
  { id: "DS-010", name: "设备监控数据", type: "Oracle", tables: 18, records: "8.5M", updated: "2024-04-06" },
];

const initialSampleData: SampleRow[] = [
  { id: 1, name: "张三", age: 28, city: "北京", income: 15000, gender: "男", isSensitive: false, phone: "13800138001", email: "zhangsan@example.com", registerDate: "2022-01-15", vipLevel: 3, creditScore: 750 },
  { id: 2, name: "李四", age: 35, city: "上海", income: 22000, gender: "女", isSensitive: true, phone: "13800138002", email: "lisi@example.com", registerDate: "2021-08-20", vipLevel: 5, creditScore: 820 },
  { id: 3, name: "王五", age: 42, city: "广州", income: 18000, gender: "男", isSensitive: false, phone: "13800138003", email: "wangwu@example.com", registerDate: "2023-03-10", vipLevel: 2, creditScore: 680 },
  { id: 4, name: "赵六", age: 31, city: "深圳", income: 25000, gender: "女", isSensitive: true, phone: "13800138004", email: "zhaoliu@example.com", registerDate: "2020-11-05", vipLevel: 4, creditScore: 790 },
  { id: 5, name: "孙七", age: 26, city: "成都", income: 12000, gender: "男", isSensitive: false, phone: "13800138005", email: "sunqi@example.com", registerDate: "2023-07-22", vipLevel: 1, creditScore: 620 },
  { id: 6, name: "周八", age: 38, city: "杭州", income: 30000, gender: "女", isSensitive: true, phone: "13800138006", email: "zhouba@example.com", registerDate: "2019-05-18", vipLevel: 5, creditScore: 850 },
  { id: 7, name: "吴九", age: 29, city: "南京", income: 18500, gender: "男", isSensitive: false, phone: "13800138007", email: "wujiu@example.com", registerDate: "2022-09-30", vipLevel: 3, creditScore: 710 },
  { id: 8, name: "郑十", age: 33, city: "武汉", income: 21000, gender: "女", isSensitive: true, phone: "13800138008", email: "zhengshi@example.com", registerDate: "2021-12-12", vipLevel: 4, creditScore: 780 },
  { id: 9, name: "钱十一", age: 45, city: "西安", income: 28000, gender: "男", isSensitive: false, phone: "13800138009", email: "qian11@example.com", registerDate: "2020-03-25", vipLevel: 5, creditScore: 830 },
  { id: 10, name: "冯十二", age: 27, city: "重庆", income: 16500, gender: "女", isSensitive: true, phone: "13800138010", email: "feng12@example.com", registerDate: "2023-01-08", vipLevel: 2, creditScore: 650 },
  { id: 11, name: "陈十三", age: 36, city: "天津", income: 24000, gender: "男", isSensitive: false, phone: "13800138011", email: "chen13@example.com", registerDate: "2021-06-14", vipLevel: 4, creditScore: 760 },
  { id: 12, name: "褚十四", age: 30, city: "苏州", income: 19500, gender: "女", isSensitive: true, phone: "13800138012", email: "chu14@example.com", registerDate: "2022-04-02", vipLevel: 3, creditScore: 730 },
];

const initialColumnsMeta: ColumnMeta[] = [
  { name: "id", type: "int", label: "ID", nullable: false, sensitive: false },
  { name: "name", type: "varchar", label: "姓名", nullable: false, sensitive: true },
  { name: "age", type: "int", label: "年龄", nullable: true, sensitive: false },
  { name: "city", type: "varchar", label: "城市", nullable: true, sensitive: false },
  { name: "income", type: "decimal", label: "收入", nullable: true, sensitive: true },
  { name: "gender", type: "varchar", label: "性别", nullable: true, sensitive: false },
  { name: "isSensitive", type: "boolean", label: "敏感标记", nullable: false, sensitive: false },
  { name: "phone", type: "varchar", label: "手机号", nullable: true, sensitive: true },
  { name: "email", type: "varchar", label: "邮箱", nullable: true, sensitive: true },
  { name: "registerDate", type: "date", label: "注册日期", nullable: true, sensitive: false },
  { name: "vipLevel", type: "int", label: "VIP等级", nullable: true, sensitive: false },
  { name: "creditScore", type: "decimal", label: "信用分", nullable: true, sensitive: false },
];

const initialTableList: TableItem[] = [
  { id: "T-001", name: "customers", records: 24000, size: "12MB", updated: "2024-04-15" },
  { id: "T-002", name: "transactions", records: 1200000, size: "480MB", updated: "2024-04-15" },
  { id: "T-003", name: "products", records: 5600, size: "2.4MB", updated: "2024-04-14" },
  { id: "T-004", name: "orders", records: 890000, size: "320MB", updated: "2024-04-14" },
  { id: "T-005", name: "inventory", records: 45000, size: "18MB", updated: "2024-04-13" },
  { id: "T-006", name: "suppliers", records: 1200, size: "0.8MB", updated: "2024-04-13" },
  { id: "T-007", name: "categories", records: 80, size: "0.1MB", updated: "2024-04-12" },
  { id: "T-008", name: "reviews", records: 350000, size: "95MB", updated: "2024-04-12" },
  { id: "T-009", name: "shipments", records: 890000, size: "210MB", updated: "2024-04-11" },
  { id: "T-010", name: "promotions", records: 500, size: "0.3MB", updated: "2024-04-11" },
];

const mockProfile: TableProfile = {
  totalRows: 10000,
  totalColumns: 12,
  size: "12MB",
  duplicateRows: 23,
  overallNullRate: 0.032,
  qualityScore: 87,
  columnStats: [
    { name: "id", type: "int", nullCount: 0, nullRate: 0, uniqueCount: 10000, distinctRate: 1.0, min: 1, max: 10000, mean: 5000.5, median: 5000, stdDev: 2886.75 },
    { name: "name", type: "varchar", nullCount: 0, nullRate: 0, uniqueCount: 9876, distinctRate: 0.988, maxLength: 8, minLength: 2, topValues: [{ value: "张伟", count: 12 }, { value: "李娜", count: 10 }, { value: "王芳", count: 9 }, { value: "刘洋", count: 8 }, { value: "陈静", count: 7 }, { value: "杨帆", count: 6 }, { value: "赵敏", count: 6 }, { value: "孙强", count: 5 }, { value: "周杰", count: 5 }, { value: "吴倩", count: 4 }] },
    { name: "age", type: "int", nullCount: 45, nullRate: 0.0045, uniqueCount: 53, distinctRate: 0.0053, min: 18, max: 65, mean: 34.2, median: 33, stdDev: 9.8 },
    { name: "city", type: "varchar", nullCount: 12, nullRate: 0.0012, uniqueCount: 120, distinctRate: 0.012, maxLength: 12, minLength: 2, topValues: [{ value: "北京", count: 1200 }, { value: "上海", count: 1150 }, { value: "广州", count: 980 }, { value: "深圳", count: 920 }, { value: "成都", count: 650 }, { value: "杭州", count: 580 }, { value: "南京", count: 520 }, { value: "武汉", count: 480 }, { value: "西安", count: 420 }, { value: "重庆", count: 380 }] },
    { name: "income", type: "decimal", nullCount: 78, nullRate: 0.0078, uniqueCount: 4500, distinctRate: 0.45, min: 3500, max: 85000, mean: 21500, median: 19800, stdDev: 12400 },
    { name: "gender", type: "varchar", nullCount: 5, nullRate: 0.0005, uniqueCount: 3, distinctRate: 0.0003, maxLength: 2, minLength: 1, topValues: [{ value: "男", count: 5230 }, { value: "女", count: 4765 }, { value: "未知", count: 5 }] },
    { name: "isSensitive", type: "boolean", nullCount: 0, nullRate: 0, uniqueCount: 2, distinctRate: 0.0002 },
    { name: "phone", type: "varchar", nullCount: 120, nullRate: 0.012, uniqueCount: 9880, distinctRate: 0.988, maxLength: 11, minLength: 11, topValues: [{ value: "13800138000", count: 1 }, { value: "13900139000", count: 1 }] },
    { name: "email", type: "varchar", nullCount: 200, nullRate: 0.02, uniqueCount: 9800, distinctRate: 0.98, maxLength: 30, minLength: 8, topValues: [{ value: "test@example.com", count: 5 }, { value: "user@demo.com", count: 3 }] },
    { name: "registerDate", type: "date", nullCount: 50, nullRate: 0.005, uniqueCount: 1500, distinctRate: 0.15 },
    { name: "vipLevel", type: "int", nullCount: 0, nullRate: 0, uniqueCount: 5, distinctRate: 0.0005, min: 1, max: 5, mean: 2.8, median: 3, stdDev: 1.2 },
    { name: "creditScore", type: "decimal", nullCount: 30, nullRate: 0.003, uniqueCount: 850, distinctRate: 0.085, min: 350, max: 950, mean: 720, median: 730, stdDev: 85 },
  ],
};

const lineageNodes: LineageNode[] = [
  { id: "raw_customers", name: "raw_customers", type: "upstream" },
  { id: "raw_orders", name: "raw_orders", type: "upstream" },
  { id: "raw_products", name: "raw_products", type: "upstream" },
  { id: "dim_customers", name: "dim_customers", type: "upstream" },
  { id: "dim_products", name: "dim_products", type: "upstream" },
  { id: "fct_transactions", name: "fct_transactions", type: "upstream" },
  { id: "customers", name: "customers", type: "current" },
  { id: "customer_summary", name: "customer_summary", type: "downstream" },
  { id: "sales_report", name: "sales_report", type: "downstream" },
  { id: "recommendation", name: "recommendation", type: "downstream" },
  { id: "risk_model", name: "risk_model", type: "downstream" },
];

const lineageEdges: LineageEdge[] = [
  { source: "raw_customers", target: "dim_customers" },
  { source: "raw_orders", target: "fct_transactions" },
  { source: "raw_products", target: "dim_products" },
  { source: "dim_customers", target: "customers" },
  { source: "dim_products", target: "customers" },
  { source: "fct_transactions", target: "customers" },
  { source: "customers", target: "customer_summary" },
  { source: "customers", target: "sales_report" },
  { source: "customers", target: "recommendation" },
  { source: "customers", target: "risk_model" },
];

const initialQualityRules: QualityRule[] = [
  { id: generateId(), name: "ID非空检查", type: "completeness", expression: "id IS NOT NULL", threshold: 100, status: "active", passRate: 100, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "姓名非空检查", type: "completeness", expression: "name IS NOT NULL AND name <> ''", threshold: 100, status: "active", passRate: 100, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "年龄范围检查", type: "validity", expression: "age >= 0 AND age <= 120", threshold: 99, status: "active", passRate: 99.8, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "收入正值检查", type: "validity", expression: "income > 0", threshold: 95, status: "active", passRate: 97.5, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "邮箱格式检查", type: "validity", expression: "email REGEXP '^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$'", threshold: 98, status: "active", passRate: 96.2, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "手机号唯一性", type: "uniqueness", expression: "COUNT(phone) = COUNT(DISTINCT phone)", threshold: 100, status: "active", passRate: 99.5, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "性别一致性", type: "consistency", expression: "gender IN ('男', '女', '未知')", threshold: 100, status: "active", passRate: 100, lastRun: "2024-04-15 10:30" },
  { id: generateId(), name: "数据及时性", type: "timeliness", expression: "DATEDIFF(NOW(), updated) <= 1", threshold: 95, status: "active", passRate: 92.3, lastRun: "2024-04-15 10:30" },
];

const dsFields: FieldConfig[] = [
  { key: "name", label: "数据源名称", type: "text", required: true },
  {
    key: "type", label: "类型", type: "select", required: true, options: [
      { label: "MySQL", value: "MySQL" },
      { label: "PostgreSQL", value: "PostgreSQL" },
      { label: "CSV", value: "CSV" },
      { label: "Excel", value: "Excel" },
      { label: "Oracle", value: "Oracle" },
    ],
  },
  { key: "tables", label: "表数量", type: "number" },
  { key: "records", label: "记录数", type: "text" },
  { key: "updated", label: "更新时间", type: "text", placeholder: "YYYY-MM-DD" },
];

const tableFields: FieldConfig[] = [
  { key: "name", label: "表名", type: "text", required: true },
  { key: "records", label: "记录数", type: "number" },
  { key: "size", label: "大小", type: "text", placeholder: "如: 12MB" },
  { key: "updated", label: "更新时间", type: "text", placeholder: "YYYY-MM-DD" },
];

const columnFields: FieldConfig[] = [
  { key: "name", label: "字段名", type: "text", required: true },
  { key: "label", label: "显示名称", type: "text", required: true },
  {
    key: "type", label: "数据类型", type: "select", required: true, options: [
      { label: "int", value: "int" },
      { label: "varchar", value: "varchar" },
      { label: "decimal", value: "decimal" },
      { label: "boolean", value: "boolean" },
      { label: "date", value: "date" },
      { label: "text", value: "text" },
    ],
  },
  {
    key: "nullable", label: "可空", type: "select", options: [
      { label: "是", value: "true" },
      { label: "否", value: "false" },
      { label: "默认NULL", value: "default_null" },
      { label: "严格非空", value: "strict" },
      { label: "有条件空", value: "conditional" },
      { label: "继承父级", value: "inherit" },
    ],
  },
  {
    key: "sensitive", label: "敏感字段", type: "select", options: [
      { label: "高度敏感", value: "high" },
      { label: "敏感", value: "true" },
      { label: "内部使用", value: "internal" },
      { label: "正常", value: "false" },
      { label: "公开", value: "public" },
      { label: "待评估", value: "pending" },
    ],
  },
];

const typeIcon = (type: string) => {
  switch (type) {
    case "int": return <Hash className="w-3.5 h-3.5 text-blue-500" />;
    case "decimal": return <Hash className="w-3.5 h-3.5 text-blue-500" />;
    case "varchar": return <Type className="w-3.5 h-3.5 text-green-500" />;
    case "text": return <Type className="w-3.5 h-3.5 text-green-500" />;
    case "date": return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
    case "boolean": return <ToggleLeft className="w-3.5 h-3.5 text-orange-500" />;
    default: return <Type className="w-3.5 h-3.5 text-gray-500" />;
  }
};

export default function SandboxDataPreview() {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [sampleData, setSampleData] = useState<SampleRow[]>(initialSampleData);
  const [columnsMeta, setColumnsMeta] = useState<ColumnMeta[]>(initialColumnsMeta);
  const [tableList, setTableList] = useState<TableItem[]>(initialTableList);
  const [profile] = useState<TableProfile>(mockProfile);
  const [qualityRules, setQualityRules] = useState<QualityRule[]>(initialQualityRules);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);

  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("DS-001");
  const [selectedTable, setSelectedTable] = useState("T-001");
  const [activeTab, setActiveTab] = useState("preview");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportColumns, setExportColumns] = useState<string[]>(initialColumnsMeta.map(c => c.name));
  const [exportRowRange, setExportRowRange] = useState("all");
  const [exportRowCount, setExportRowCount] = useState("1000");
  const [exportEncoding, setExportEncoding] = useState("UTF-8");
  const [exportProgress, setExportProgress] = useState(0);
  const [exporting, setExporting] = useState(false);

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [filterPopup, setFilterPopup] = useState<string | null>(null);
  const [freezeFirstColumn, setFreezeFirstColumn] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFields, setDialogFields] = useState<FieldConfig[]>([]);
  const [dialogData, setDialogData] = useState<Record<string, any>>({});
  const [dialogTarget, setDialogTarget] = useState<"ds" | "table" | "column">("ds");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [detailFields, setDetailFields] = useState<{ key: string; label: string; type?: "text" | "badge" | "date" | "list" }[]>([]);
  const [detailTarget, setDetailTarget] = useState<"ds" | "table" | "column">("ds");

  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const [qualityDialogMode, setQualityDialogMode] = useState<"create" | "edit">("create");
  const [qualityForm, setQualityForm] = useState<Partial<QualityRule>>({});

  const profileBoxplotRef = useRef<HTMLDivElement>(null);
  const distChartRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const correlationRef = useRef<HTMLDivElement>(null);
  const lineageRef = useRef<HTMLDivElement>(null);
  const qualityPieRef = useRef<HTMLDivElement>(null);

  const currentSource = dataSources.find(d => d.id === selectedSource);
  const totalRows = 10000;

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let data = [...sampleData];
    // Apply column filters
    columnFilters.forEach(filter => {
      const col = columnsMeta.find(c => c.name === filter.column);
      if (!col) return;
      data = data.filter(row => {
        const value = (row as any)[filter.column];
        if (filter.operator === "is_null") return value === null || value === undefined || value === "";
        if (value === null || value === undefined) return false;
        const strValue = String(value);
        const numValue = Number(value);
        switch (filter.operator) {
          case ">": return numValue > Number(filter.value);
          case "<": return numValue < Number(filter.value);
          case "=": return strValue === filter.value;
          case "contains": return strValue.includes(filter.value);
          default: return true;
        }
      });
    });
    // Apply sorting
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = (a as any)[sortColumn];
        const bVal = (b as any)[sortColumn];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return sortDirection === "asc" ? -1 : 1;
        if (bVal === null || bVal === undefined) return sortDirection === "asc" ? 1 : -1;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDirection === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      });
    }
    return data;
  }, [sampleData, columnFilters, sortColumn, sortDirection, columnsMeta]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, processedData.length);
  const pageData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const addColumnFilter = (column: string, operator: string, value: string) => {
    setColumnFilters(prev => {
      const existing = prev.findIndex(f => f.column === column);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { column, operator, value };
        return next;
      }
      return [...prev, { column, operator, value }];
    });
    setFilterPopup(null);
    setCurrentPage(1);
  };

  const removeColumnFilter = (column: string) => {
    setColumnFilters(prev => prev.filter(f => f.column !== column));
    setCurrentPage(1);
  };

  // ECharts: Profile boxplot
  useEffect(() => {
    if (activeTab !== "profile" || !profileBoxplotRef.current) return;
    const numericCols = profile.columnStats.filter(c => c.min !== undefined && c.max !== undefined);
    const chart = echarts.init(profileBoxplotRef.current);
    const option: echarts.EChartsOption = {
      title: { text: "数值列分布箱线图", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { trigger: "item" },
      xAxis: { type: "category", data: numericCols.map(c => c.name) },
      yAxis: { type: "value", name: "数值" },
      series: [{
        type: "boxplot",
        data: numericCols.map(c => {
          const q1 = ((c.min || 0) + (c.mean || 0)) / 2;
          const q3 = ((c.max || 0) + (c.mean || 0)) / 2;
          return [c.min || 0, q1, c.median || 0, q3, c.max || 0];
        }),
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [activeTab, profile]);

  // ECharts: Distribution charts per column
  useEffect(() => {
    if (activeTab !== "profile") return;
    const instances: echarts.ECharts[] = [];
    profile.columnStats.forEach(col => {
      const ref = distChartRefs.current[col.name];
      if (!ref) return;
      const chart = echarts.init(ref);
      let option: echarts.EChartsOption;
      if (col.min !== undefined && col.max !== undefined) {
        // Numeric histogram
        const bins = 10;
        const binSize = (col.max - col.min) / bins;
        const data = Array(bins).fill(0).map((_, i) => {
          const binStart = col.min! + i * binSize;
          const binEnd = binStart + binSize;
          return { value: [binStart, binEnd], count: Math.floor(Math.random() * 2000) + 100 };
        });
        option = {
          title: { text: `${col.name} 分布`, left: "center", textStyle: { fontSize: 12 } },
          xAxis: { type: "category", data: data.map((d, i) => `Bin${i + 1}`) },
          yAxis: { type: "value" },
          series: [{ type: "bar", data: data.map(d => d.count), itemStyle: { color: "#3b82f6" } }],
        };
      } else if (col.topValues) {
        // Categorical bar
        option = {
          title: { text: `${col.name} 频率 (Top ${Math.min(col.topValues.length, 20)})`, left: "center", textStyle: { fontSize: 12 } },
          xAxis: { type: "category", data: col.topValues.slice(0, 20).map(v => v.value), axisLabel: { rotate: 30, fontSize: 10 } },
          yAxis: { type: "value" },
          series: [{ type: "bar", data: col.topValues.slice(0, 20).map(v => v.count), itemStyle: { color: "#10b981" } }],
        };
      } else {
        // Date/time histogram
        option = {
          title: { text: `${col.name} 时间分布`, left: "center", textStyle: { fontSize: 12 } },
          xAxis: { type: "category", data: ["2020", "2021", "2022", "2023", "2024"] },
          yAxis: { type: "value" },
          series: [{ type: "bar", data: [800, 1500, 2200, 2800, 2700], itemStyle: { color: "#8b5cf6" } }],
        };
      }
      chart.setOption(option);
      instances.push(chart);
    });
    return () => instances.forEach(c => c.dispose());
  }, [activeTab, profile]);

  // ECharts: Correlation heatmap
  useEffect(() => {
    if (activeTab !== "profile" || !correlationRef.current) return;
    const numericCols = profile.columnStats.filter(c => c.min !== undefined);
    const names = numericCols.map(c => c.name);
    const data: [number, number, number][] = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = 0; j < names.length; j++) {
        let corr = 0;
        if (i === j) corr = 1;
        else if (i < j) corr = Math.round((Math.random() * 2 - 1) * 100) / 100;
        else {
          const existing = data.find(d => d[0] === j && d[1] === i);
          corr = existing ? existing[2] : 0;
        }
        data.push([i, j, corr]);
      }
    }
    const chart = echarts.init(correlationRef.current);
    const option: echarts.EChartsOption = {
      title: { text: "数值列相关性热力图", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { position: "top" },
      xAxis: { type: "category", data: names, splitArea: { show: true } },
      yAxis: { type: "category", data: names, splitArea: { show: true } },
      visualMap: { min: -1, max: 1, calculable: true, orient: "horizontal", left: "center", bottom: "0%", inRange: { color: ["#ef4444", "#ffffff", "#22c55e"] } },
      series: [{ name: "相关系数", type: "heatmap", data: data.map(d => [d[0], d[1], d[2]]), label: { show: true, fontSize: 10 }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } } }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [activeTab, profile]);

  // ECharts: Lineage graph
  useEffect(() => {
    if (activeTab !== "lineage" || !lineageRef.current) return;
    const chart = echarts.init(lineageRef.current);
    const nodes = lineageNodes.map(n => ({
      id: n.id,
      name: n.name,
      symbolSize: n.type === "current" ? 60 : 40,
      itemStyle: { color: n.type === "current" ? "#f59e0b" : n.type === "upstream" ? "#3b82f6" : "#10b981" },
      x: n.type === "upstream" ? Math.random() * 200 : n.type === "current" ? 400 : 600 + Math.random() * 200,
      y: Math.random() * 300,
    }));
    const links = lineageEdges.map(e => ({ source: e.source, target: e.target }));
    const option: echarts.EChartsOption = {
      title: { text: "数据血缘关系图", left: "center", textStyle: { fontSize: 14 } },
      tooltip: {},
      series: [{
        type: "graph",
        layout: "none",
        data: nodes,
        links: links,
        roam: true,
        label: { show: true, position: "bottom" },
        lineStyle: { color: "#94a3b8", curveness: 0.2 },
        edgeSymbol: ["none", "arrow"],
        edgeSymbolSize: [0, 10],
      }],
    };
    chart.setOption(option);
    chart.on("click", (params: any) => {
      if (params.dataType === "node") {
        const table = tableList.find(t => t.name === params.data.name);
        if (table) setSelectedTable(table.id);
      }
    });
    return () => chart.dispose();
  }, [activeTab, tableList]);

  // ECharts: Quality pie chart
  useEffect(() => {
    if (activeTab !== "quality" || !qualityPieRef.current) return;
    const passed = qualityRules.filter(r => r.passRate >= r.threshold).length;
    const failed = qualityRules.length - passed;
    const chart = echarts.init(qualityPieRef.current);
    const option: echarts.EChartsOption = {
      title: { text: "质量规则通过情况", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { trigger: "item" },
      series: [{
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: passed, name: "通过", itemStyle: { color: "#22c55e" } },
          { value: failed, name: "未通过", itemStyle: { color: "#ef4444" } },
        ],
        label: { formatter: "{b}: {c} ({d}%)" },
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [activeTab, qualityRules]);

  const openDialog = (
    mode: "create" | "edit" | "view" | "delete",
    target: "ds" | "table" | "column",
    item?: Record<string, any>
  ) => {
    setDialogMode(mode);
    setDialogTarget(target);
    if (target === "ds") {
      setDialogTitle("数据源");
      setDialogFields(dsFields);
    } else if (target === "table") {
      setDialogTitle("数据表");
      setDialogFields(tableFields);
    } else {
      setDialogTitle("字段");
      setDialogFields(columnFields);
    }
    if (item) {
      setDialogData({
        ...item,
        tables: item.tables !== undefined ? String(item.tables) : undefined,
        records: item.records !== undefined ? String(item.records) : undefined,
        nullable: item.nullable !== undefined ? String(item.nullable) : undefined,
        sensitive: item.sensitive !== undefined ? String(item.sensitive) : undefined,
      });
    } else {
      setDialogData({});
    }
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogTarget === "ds") {
      if (dialogMode === "create") {
        const newDs: DataSource = {
          id: `DS-${String(dataSources.length + 1).padStart(3, '0')}`,
          name: data.name || "",
          type: data.type || "MySQL",
          tables: Number(data.tables) || 0,
          records: data.records || "",
          updated: data.updated || new Date().toISOString().split('T')[0],
        };
        setDataSources(prev => [...prev, newDs]);
      } else if (dialogMode === "edit" && dialogData.id) {
        setDataSources(prev => prev.map(d => d.id === dialogData.id ? {
          ...d,
          name: data.name || d.name,
          type: data.type || d.type,
          tables: Number(data.tables) ?? d.tables,
          records: data.records || d.records,
          updated: data.updated || d.updated,
        } : d));
      }
    } else if (dialogTarget === "table") {
      if (dialogMode === "create") {
        const newTable: TableItem = {
          id: `T-${String(tableList.length + 1).padStart(3, '0')}`,
          name: data.name || "",
          records: Number(data.records) || 0,
          size: data.size || "",
          updated: data.updated || new Date().toISOString().split('T')[0],
        };
        setTableList(prev => [...prev, newTable]);
      } else if (dialogMode === "edit" && dialogData.id) {
        setTableList(prev => prev.map(t => t.id === dialogData.id ? {
          ...t,
          name: data.name || t.name,
          records: Number(data.records) ?? t.records,
          size: data.size || t.size,
          updated: data.updated || t.updated,
        } : t));
      }
    } else if (dialogTarget === "column") {
      if (dialogMode === "create") {
        const newCol: ColumnMeta = {
          name: data.name || "",
          type: data.type || "varchar",
          label: data.label || "",
          nullable: data.nullable === "true",
          sensitive: data.sensitive === "true" || data.sensitive === "high" || data.sensitive === "internal",
        };
        setColumnsMeta(prev => [...prev, newCol]);
      } else if (dialogMode === "edit" && dialogData.name) {
        setColumnsMeta(prev => prev.map(c => c.name === dialogData.name ? {
          ...c,
          name: data.name || c.name,
          type: data.type || c.type,
          label: data.label || c.label,
          nullable: data.nullable === "true",
          sensitive: data.sensitive === "true" || data.sensitive === "high" || data.sensitive === "internal",
        } : c));
      }
    }
  };

  const handleDelete = () => {
    if (dialogTarget === "ds" && dialogData.id) {
      setDataSources(prev => prev.filter(d => d.id !== dialogData.id));
      if (selectedSource === dialogData.id && dataSources.length > 1) {
        setSelectedSource(dataSources.find(d => d.id !== dialogData.id)?.id || "");
      }
    } else if (dialogTarget === "table" && dialogData.id) {
      setTableList(prev => prev.filter(t => t.id !== dialogData.id));
    } else if (dialogTarget === "column" && dialogData.name) {
      setColumnsMeta(prev => prev.filter(c => c.name !== dialogData.name));
    }
  };

  const openDetail = (target: "ds" | "table" | "column", item: Record<string, any>) => {
    setDetailTarget(target);
    setDetailData(item);
    if (target === "ds") {
      setDetailTitle("数据源详情");
      setDetailFields([
        { key: "id", label: "数据源ID" },
        { key: "name", label: "数据源名称" },
        { key: "type", label: "类型", type: "badge" as const },
        { key: "tables", label: "表数量" },
        { key: "records", label: "记录数" },
        { key: "updated", label: "更新时间", type: "date" as const },
      ]);
    } else if (target === "table") {
      setDetailTitle("数据表详情");
      setDetailFields([
        { key: "id", label: "表ID" },
        { key: "name", label: "表名" },
        { key: "records", label: "记录数" },
        { key: "size", label: "大小" },
        { key: "updated", label: "更新时间", type: "date" as const },
      ]);
    } else {
      setDetailTitle("字段详情");
      setDetailFields([
        { key: "name", label: "字段名" },
        { key: "label", label: "显示名称" },
        { key: "type", label: "数据类型", type: "badge" as const },
        { key: "nullable", label: "可空" },
        { key: "sensitive", label: "敏感字段", type: "badge" as const },
      ]);
    }
    setDetailOpen(true);
  };

  const handleRunQualityCheck = () => {
    setQualityRules(prev => prev.map(r => ({
      ...r,
      passRate: Math.min(100, Math.max(0, r.passRate + (Math.random() * 10 - 5))),
      lastRun: new Date().toLocaleString("zh-CN"),
    })));
  };

  const handleExport = () => {
    setExporting(true);
    setExportProgress(0);
    const historyId = generateId();
    const newHistory: ExportHistory = {
      id: historyId,
      format: exportFormat.toUpperCase(),
      columns: exportColumns,
      rowRange: exportRowRange === "all" ? "全部" : exportRowRange === "first" ? `前${exportRowCount}行` : `条件筛选`,
      encoding: exportEncoding,
      status: "running",
      progress: 0,
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    setExportHistory(prev => [newHistory, ...prev]);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      setExportHistory(prev => prev.map(h => h.id === historyId ? { ...h, progress } : h));
      if (progress >= 100) {
        clearInterval(interval);
        setExporting(false);
        setExportOpen(false);
        setExportHistory(prev => prev.map(h => h.id === historyId ? { ...h, status: "completed", progress: 100 } : h));
      }
    }, 200);
  };

  const saveQualityRule = () => {
    if (!qualityForm.name || !qualityForm.type) return;
    if (qualityDialogMode === "create") {
      const newRule: QualityRule = {
        id: generateId(),
        name: qualityForm.name,
        type: qualityForm.type,
        expression: qualityForm.expression || "",
        threshold: Number(qualityForm.threshold) || 100,
        status: "active",
        passRate: 100,
        lastRun: "未执行",
      };
      setQualityRules(prev => [...prev, newRule]);
    } else if (qualityForm.id) {
      setQualityRules(prev => prev.map(r => r.id === qualityForm.id ? { ...r, ...qualityForm } as QualityRule : r));
    }
    setQualityDialogOpen(false);
    setQualityForm({});
  };

  const filteredTables = tableList.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const topCorrelations = useMemo(() => {
    const numericCols = profile.columnStats.filter(c => c.min !== undefined);
    const pairs: { col1: string; col2: string; corr: number }[] = [];
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        pairs.push({ col1: numericCols[i].name, col2: numericCols[j].name, corr: Math.round((Math.random() * 2 - 1) * 100) / 100 });
      }
    }
    return pairs.sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr)).slice(0, 10);
  }, [profile]);

  const qualityScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700";
    if (score >= 70) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">数据探查</h1>
          <p className="text-sm text-gray-500 mt-1">浏览数据源、预览数据内容、管理表结构</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" />刷新</Button>
          <Button className="gap-2" onClick={() => setExportOpen(true)}><Download className="w-4 h-4" />导出</Button>
        </div>
      </div>

      {/* Data Source Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-64">
            <Database className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map(ds => (
              <SelectItem key={ds.id} value={ds.id}>{ds.name} ({ds.type})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveTab("tables")}>
          <FileSpreadsheet className="w-4 h-4" />管理数据源
        </Button>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => openDialog("create", "ds")}>
          <Plus className="w-4 h-4" />新建数据源
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4" />数据预览</TabsTrigger>
          <TabsTrigger value="tables" className="gap-2"><FileSpreadsheet className="w-4 h-4" />表管理</TabsTrigger>
          <TabsTrigger value="columns" className="gap-2"><Settings className="w-4 h-4" />字段管理</TabsTrigger>
          <TabsTrigger value="profile" className="gap-2"><BarChart3 className="w-4 h-4" />数据画像</TabsTrigger>
          <TabsTrigger value="lineage" className="gap-2"><GitBranch className="w-4 h-4" />数据血缘</TabsTrigger>
          <TabsTrigger value="quality" className="gap-2"><Gauge className="w-4 h-4" />质量规则</TabsTrigger>
        </TabsList>

        {/* Data Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">数据预览</CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">{currentSource?.name}</Badge>
                  <div className="flex items-center gap-2">
                    <Checkbox id="freeze" checked={freezeFirstColumn} onCheckedChange={c => setFreezeFirstColumn(c as boolean)} />
                    <label htmlFor="freeze" className="text-sm text-gray-600">冻结首列</label>
                  </div>
                  <span className="text-sm text-gray-500">显示 {startRow}-{endRow} 共 {processedData.length.toLocaleString()} 行</span>
                  <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100行/页</SelectItem>
                      <SelectItem value="500">500行/页</SelectItem>
                      <SelectItem value="1000">1000行/页</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnsMeta.map((col, idx) => (
                        <TableHead key={col.name} className={`whitespace-nowrap ${freezeFirstColumn && idx === 0 ? "sticky left-0 bg-white z-10" : ""}`}>
                          <div className="flex items-center gap-1">
                            {typeIcon(col.type)}
                            <span className="cursor-pointer select-none flex items-center gap-1" onClick={() => handleSort(col.name)}>
                              {col.label}
                              {sortColumn === col.name && (
                                sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              )}
                              {sortColumn !== col.name && <ArrowUpDown className="w-3 h-3 text-gray-300" />}
                            </span>
                            {col.sensitive && <Shield className="w-3 h-3 text-red-400" />}
                            <div className="relative">
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setFilterPopup(filterPopup === col.name ? null : col.name)}>
                                <Filter className="w-3 h-3 text-gray-400" />
                              </Button>
                              {filterPopup === col.name && (
                                <div className="absolute top-6 left-0 z-50 bg-white border rounded-md shadow-lg p-3 w-48 space-y-2">
                                  <Select onValueChange={(op) => {
                                    if (op === "is_null") {
                                      addColumnFilter(col.name, "is_null", "");
                                    }
                                  }}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="选择操作" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value=">">大于</SelectItem>
                                      <SelectItem value="<">小于</SelectItem>
                                      <SelectItem value="=">等于</SelectItem>
                                      <SelectItem value="contains">包含</SelectItem>
                                      <SelectItem value="is_null">为空</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input placeholder="值" onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const op = (e.currentTarget.previousElementSibling?.querySelector('[data-value]') as HTMLElement)?.dataset.value || "=";
                                      addColumnFilter(col.name, op, e.currentTarget.value);
                                    }
                                  }} />
                                  <div className="flex gap-1">
                                    <Button size="sm" className="flex-1" onClick={(e) => {
                                      const parent = e.currentTarget.parentElement?.parentElement;
                                      const select = parent?.querySelector('select');
                                      const input = parent?.querySelector('input');
                                      const op = select?.value || "=";
                                      addColumnFilter(col.name, op, input?.value || "");
                                    }}>应用</Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setFilterPopup(null)}>取消</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.map(row => (
                      <TableRow key={row.id}>
                        {columnsMeta.map((col, idx) => (
                          <TableCell key={col.name} className={`${freezeFirstColumn && idx === 0 ? "sticky left-0 bg-white z-10" : ""}`}>
                            {col.name === "isSensitive" ? (
                              <Badge variant="outline" className={row.isSensitive ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>
                                {row.isSensitive ? "敏感" : "正常"}
                              </Badge>
                            ) : col.name === "id" ? (
                              <span className="font-mono text-xs">{(row as any)[col.name]}</span>
                            ) : col.type === "decimal" || col.type === "int" ? (
                              <span className="font-mono text-xs">{(row as any)[col.name]}</span>
                            ) : (
                              <span>{(row as any)[col.name]}</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Active filters */}
              {columnFilters.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-sm text-gray-500">筛选条件:</span>
                  {columnFilters.map(f => (
                    <Badge key={f.column} variant="secondary" className="gap-1">
                      {columnsMeta.find(c => c.name === f.column)?.label} {f.operator} {f.value}
                      <button onClick={() => removeColumnFilter(f.column)} className="ml-1 hover:text-red-500">x</button>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => setColumnFilters([])}>清除全部</Button>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>上一页</Button>
                <span className="text-sm text-gray-500">第 {currentPage} / {totalPages} 页</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>下一页</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">数据源列表</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => openDialog("create", "ds")}><Plus className="w-4 h-4" />新建数据源</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>类型</TableHead><TableHead>表数</TableHead><TableHead>记录数</TableHead><TableHead>更新</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map(ds => (
                    <TableRow key={ds.id}>
                      <TableCell className="font-mono text-xs">{ds.id}</TableCell>
                      <TableCell className="font-medium">{ds.name}</TableCell>
                      <TableCell><Badge variant="outline">{ds.type}</Badge></TableCell>
                      <TableCell>{ds.tables}</TableCell>
                      <TableCell>{ds.records}</TableCell>
                      <TableCell className="text-xs text-gray-500">{ds.updated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail("ds", ds)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("edit", "ds", ds)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDialog("delete", "ds", ds)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索表名..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={() => openDialog("create", "table")}><Plus className="w-4 h-4" />新建表</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数据表列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>表ID</TableHead><TableHead>表名</TableHead><TableHead>记录数</TableHead><TableHead>大小</TableHead><TableHead>更新时间</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.records.toLocaleString()}</TableCell>
                      <TableCell>{t.size}</TableCell>
                      <TableCell className="text-xs text-gray-500">{t.updated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail("table", t)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("edit", "table", t)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDialog("delete", "table", t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Columns Tab */}
        <TabsContent value="columns" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">字段管理</CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => openDialog("create", "column")}><Plus className="w-4 h-4" />添加字段</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>字段名</TableHead><TableHead>显示名称</TableHead><TableHead>数据类型</TableHead><TableHead>可空</TableHead><TableHead>敏感字段</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {columnsMeta.map(col => (
                    <TableRow key={col.name}>
                      <TableCell className="font-mono text-xs">{col.name}</TableCell>
                      <TableCell>{col.label}</TableCell>
                      <TableCell><Badge variant="outline">{col.type}</Badge></TableCell>
                      <TableCell>{col.nullable ? "是" : "否"}</TableCell>
                      <TableCell>
                        <Badge className={col.sensitive ? "bg-red-50 text-red-700 gap-1" : "bg-gray-50 text-gray-700"}>
                          {col.sensitive ? <><Shield className="w-3 h-3" />敏感</> : "正常"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail("column", col)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("edit", "column", col)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDialog("delete", "column", col)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          {/* Table-level stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card><CardContent className="pt-4 pb-3"><div className="text-2xl font-bold">{profile.totalRows.toLocaleString()}</div><div className="text-xs text-gray-500">总行数</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3"><div className="text-2xl font-bold">{profile.totalColumns}</div><div className="text-xs text-gray-500">总列数</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3"><div className="text-2xl font-bold">{profile.size}</div><div className="text-xs text-gray-500">数据大小</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3"><div className="text-2xl font-bold text-yellow-600">{profile.duplicateRows}</div><div className="text-xs text-gray-500">重复行</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3"><div className="text-2xl font-bold">{(profile.overallNullRate * 100).toFixed(2)}%</div><div className="text-xs text-gray-500">整体空值率</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3"><Badge className={`text-lg px-3 py-1 ${qualityScoreColor(profile.qualityScore)}`}>{profile.qualityScore}</Badge><div className="text-xs text-gray-500 mt-1">质量评分</div></CardContent></Card>
          </div>

          {/* Column stats table */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">字段统计信息</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>字段名</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>空值数</TableHead>
                      <TableHead>空值率</TableHead>
                      <TableHead>唯一值</TableHead>
                      <TableHead>唯一率</TableHead>
                      <TableHead>最小值/最大长度</TableHead>
                      <TableHead>最大值/最小长度</TableHead>
                      <TableHead>均值/中位数</TableHead>
                      <TableHead>标准差</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.columnStats.map(col => (
                      <TableRow key={col.name}>
                        <TableCell className="font-medium">{col.name}</TableCell>
                        <TableCell><Badge variant="outline">{col.type}</Badge></TableCell>
                        <TableCell>{col.nullCount.toLocaleString()}</TableCell>
                        <TableCell>{(col.nullRate * 100).toFixed(2)}%</TableCell>
                        <TableCell>{col.uniqueCount.toLocaleString()}</TableCell>
                        <TableCell>{(col.distinctRate * 100).toFixed(2)}%</TableCell>
                        <TableCell>{col.min ?? col.minLength ?? "-"}</TableCell>
                        <TableCell>{col.max ?? col.maxLength ?? "-"}</TableCell>
                        <TableCell>{col.mean?.toFixed(1) ?? col.median ?? "-"}</TableCell>
                        <TableCell>{col.stdDev?.toFixed(1) ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Boxplot */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数值列箱线图</CardTitle></CardHeader>
            <CardContent><div ref={profileBoxplotRef} className="w-full h-80" /></CardContent>
          </Card>

          {/* Correlation heatmap */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">相关性热力图</CardTitle></CardHeader>
            <CardContent><div ref={correlationRef} className="w-full h-80" /></CardContent>
          </Card>

          {/* Top correlations */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Top 10 相关性</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>字段1</TableHead><TableHead>字段2</TableHead><TableHead>相关系数</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {topCorrelations.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{c.col1}</TableCell>
                      <TableCell>{c.col2}</TableCell>
                      <TableCell>
                        <Badge className={Math.abs(c.corr) > 0.7 ? "bg-red-50 text-red-700" : Math.abs(c.corr) > 0.3 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}>
                          {c.corr > 0 ? "+" : ""}{c.corr.toFixed(3)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Distribution charts per column */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">列分布可视化</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.columnStats.map(col => (
                  <div key={col.name} className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">{col.name}</div>
                    <div ref={el => { distChartRefs.current[col.name] = el; }} className="w-full h-48" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Lineage Tab */}
        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数据血缘图谱</CardTitle></CardHeader>
            <CardContent><div ref={lineageRef} className="w-full h-[500px]" /></CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">上游依赖</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>表名</TableHead><TableHead>类型</TableHead><TableHead>血缘路径</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineageNodes.filter(n => n.type === "upstream").map(n => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.name}</TableCell>
                        <TableCell><Badge variant="outline">上游</Badge></TableCell>
                        <TableCell className="text-sm text-gray-500">{n.name} → {lineageEdges.filter(e => e.source === n.id).map(e => lineageNodes.find(node => node.id === e.target)?.name).join(" → ")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">下游影响</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>表名</TableHead><TableHead>类型</TableHead><TableHead>影响分析</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineageNodes.filter(n => n.type === "downstream").map(n => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.name}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-green-50">下游</Badge></TableCell>
                        <TableCell className="text-sm text-gray-500">直接依赖 customers 表</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button className="gap-2" onClick={handleRunQualityCheck}><RefreshCw className="w-4 h-4" />运行质量检查</Button>
              <Button variant="outline" className="gap-2" onClick={() => { setQualityDialogMode("create"); setQualityForm({}); setQualityDialogOpen(true); }}><Plus className="w-4 h-4" />新建规则</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">规则通过情况</CardTitle></CardHeader>
              <CardContent><div ref={qualityPieRef} className="w-full h-64" /></CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-base">质量规则列表</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>规则名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>表达式</TableHead>
                        <TableHead>阈值</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>通过率</TableHead>
                        <TableHead>最后执行</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualityRules.map(rule => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell><Badge variant="outline">{rule.type}</Badge></TableCell>
                          <TableCell className="text-xs font-mono max-w-[200px] truncate">{rule.expression}</TableCell>
                          <TableCell>{rule.threshold}%</TableCell>
                          <TableCell>
                            <Badge className={rule.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
                              {rule.status === "active" ? "启用" : "停用"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={rule.passRate >= rule.threshold ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                              {rule.passRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{rule.lastRun}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setQualityDialogMode("edit"); setQualityForm(rule); setQualityDialogOpen(true); }}><Edit3 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Failed rules */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">未通过规则</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>规则名称</TableHead><TableHead>类型</TableHead><TableHead>阈值</TableHead><TableHead>实际通过率</TableHead><TableHead>差距</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {qualityRules.filter(r => r.passRate < r.threshold).map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium text-red-600">{rule.name}</TableCell>
                      <TableCell><Badge variant="outline">{rule.type}</Badge></TableCell>
                      <TableCell>{rule.threshold}%</TableCell>
                      <TableCell className="text-red-600 font-medium">{rule.passRate.toFixed(1)}%</TableCell>
                      <TableCell><Badge variant="destructive">{(rule.threshold - rule.passRate).toFixed(1)}%</Badge></TableCell>
                    </TableRow>
                  ))}
                  {qualityRules.filter(r => r.passRate < r.threshold).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">所有规则均已通过</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        fields={dialogFields}
        data={dialogData}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={detailTitle}
        data={detailData}
        fields={detailFields}
        onEdit={() => {
          setDialogMode("edit");
          setDialogTarget(detailTarget);
          if (detailTarget === "ds") {
            setDialogTitle("数据源");
            setDialogFields(dsFields);
          } else if (detailTarget === "table") {
            setDialogTitle("数据表");
            setDialogFields(tableFields);
          } else {
            setDialogTitle("字段");
            setDialogFields(columnFields);
          }
          setDialogData({
            ...detailData,
            tables: detailData.tables !== undefined ? String(detailData.tables) : undefined,
            records: detailData.records !== undefined ? String(detailData.records) : undefined,
            nullable: detailData.nullable !== undefined ? String(detailData.nullable) : undefined,
            sensitive: detailData.sensitive !== undefined ? String(detailData.sensitive) : undefined,
          });
          setDialogOpen(true);
        }}
        onDelete={() => {
          setDialogMode("delete");
          setDialogTarget(detailTarget);
          if (detailTarget === "ds") setDialogTitle("数据源");
          else if (detailTarget === "table") setDialogTitle("数据表");
          else setDialogTitle("字段");
          setDialogData(detailData);
          setDialogOpen(true);
        }}
      />

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>导出数据</DialogTitle>
            <DialogDescription>配置导出选项</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">导出格式</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="parquet">Parquet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">选择列</label>
              <div className="border rounded-md p-2 space-y-1 max-h-[160px] overflow-y-auto">
                {columnsMeta.map(col => (
                  <div key={col.name} className="flex items-center gap-2">
                    <Checkbox
                      checked={exportColumns.includes(col.name)}
                      onCheckedChange={checked => {
                        if (checked) setExportColumns(prev => [...prev, col.name]);
                        else setExportColumns(prev => prev.filter(c => c !== col.name));
                      }}
                    />
                    <span className="text-sm">{col.label} ({col.name})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">行范围</label>
              <Select value={exportRowRange} onValueChange={setExportRowRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行</SelectItem>
                  <SelectItem value="first">前N行</SelectItem>
                </SelectContent>
              </Select>
              {exportRowRange === "first" && (
                <Input placeholder="输入行数" value={exportRowCount} onChange={e => setExportRowCount(e.target.value)} />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">编码</label>
              <Select value={exportEncoding} onValueChange={setExportEncoding}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTF-8">UTF-8</SelectItem>
                  <SelectItem value="GBK">GBK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>导出进度</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}

            {/* Export History */}
            {exportHistory.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">导出历史</label>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>格式</TableHead><TableHead>行范围</TableHead><TableHead>状态</TableHead><TableHead>时间</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {exportHistory.slice(0, 5).map(h => (
                        <TableRow key={h.id}>
                          <TableCell>{h.format}</TableCell>
                          <TableCell className="text-xs">{h.rowRange}</TableCell>
                          <TableCell>
                            {h.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                             h.status === "failed" ? <XCircle className="w-4 h-4 text-red-500" /> :
                             <div className="w-16"><Progress value={h.progress} /></div>}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{h.createdAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
            <Button onClick={handleExport} disabled={exporting || exportColumns.length === 0}>
              <FileDown className="w-4 h-4 mr-2" />导出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quality Rule Dialog */}
      <Dialog open={qualityDialogOpen} onOpenChange={setQualityDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{qualityDialogMode === "create" ? "新建质量规则" : "编辑质量规则"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">规则名称 <span className="text-red-500">*</span></label>
              <Input value={qualityForm.name || ""} onChange={e => setQualityForm(prev => ({ ...prev, name: e.target.value }))} placeholder="输入规则名称" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">规则类型 <span className="text-red-500">*</span></label>
              <Select value={qualityForm.type || ""} onValueChange={v => setQualityForm(prev => ({ ...prev, type: v }))}>
                <SelectTrigger><SelectValue placeholder="选择规则类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completeness">完整性</SelectItem>
                  <SelectItem value="consistency">一致性</SelectItem>
                  <SelectItem value="uniqueness">唯一性</SelectItem>
                  <SelectItem value="validity">有效性</SelectItem>
                  <SelectItem value="timeliness">及时性</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">检查表达式</label>
              <Input value={qualityForm.expression || ""} onChange={e => setQualityForm(prev => ({ ...prev, expression: e.target.value }))} placeholder="如: age > 0 AND age < 120" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">阈值 (%)</label>
              <Input type="number" value={qualityForm.threshold || ""} onChange={e => setQualityForm(prev => ({ ...prev, threshold: Number(e.target.value) }))} placeholder="100" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQualityDialogOpen(false)}>取消</Button>
            <Button onClick={saveQualityRule}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
