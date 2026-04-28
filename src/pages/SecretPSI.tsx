import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailDrawer } from "@/components/DetailDrawer";
import { CrudDialog } from "@/components/CrudDialog";
import {
  Plus, Eye, Trash2, Play, Pause, Copy, Hash, Tag, Bell,
  BarChart3, CheckCircle, Zap, Layers, Download, Pencil,
  AlertTriangle, ChevronRight, ChevronLeft, User, Users,
  Settings, FileText, Shield, RotateCcw, XCircle, Search,
  Calendar, Clock, TrendingUp, Activity, Filter, FileSearch,
  Gauge, ArrowRightLeft, Sparkles, X
} from "lucide-react";
import * as echarts from "echarts";

interface PartyConfig {
  name: string;
  dataSource: string;
  field: string;
  sampleSize: number;
}

interface ScheduleConfig {
  enabled: boolean;
  type: "once" | "daily" | "weekly" | "monthly";
  hour: number;
  minute: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  nextRun?: string;
}

interface TaskMetrics {
  setupTime: number;
  transferTime: number;
  computationTime: number;
  totalTime: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
}

interface PSITask {
  id: string;
  name: string;
  protocol: string;
  hashing: string;
  outputMode: string;
  status: string;
  progress: number;
  matchedCount: number;
  totalA: number;
  totalB: number;
  createdAt: string;
  duration: string;
  notifyStatus: string;
  tagField?: string;
  partyA: PartyConfig;
  partyB: PartyConfig;
  description?: string;
  schedule?: ScheduleConfig;
  metrics?: TaskMetrics;
}

const dataSources = [
  "用户行为数据",
  "设备指纹库",
  "订单交易数据",
  "广告投放数据",
  "会员基础信息",
  "风险标签库",
  "广告归因数据",
  "设备标识库",
];

const mockMetrics: Record<string, TaskMetrics> = {
  "PSI-2026-002": { setupTime: 45, transferTime: 120, computationTime: 330, totalTime: 495, precision: 0.987, recall: 0.954, f1Score: 0.970 },
  "PSI-2026-004": { setupTime: 90, transferTime: 300, computationTime: 1110, totalTime: 1500, precision: 0.992, recall: 0.968, f1Score: 0.980 },
  "PSI-2026-005": { setupTime: 60, transferTime: 180, computationTime: 645, totalTime: 885, precision: 0.985, recall: 0.961, f1Score: 0.973 },
  "PSI-2026-009": { setupTime: 75, transferTime: 240, computationTime: 1005, totalTime: 1320, precision: 0.990, recall: 0.965, f1Score: 0.977 },
  "PSI-2026-010": { setupTime: 50, transferTime: 150, computationTime: 510, totalTime: 710, precision: 0.983, recall: 0.958, f1Score: 0.970 },
};

const mockPreviewIds: Record<string, string[]> = {
  "PSI-2026-002": ["dev_abc123", "dev_def456", "dev_ghi789", "dev_jkl012", "dev_mno345", "dev_pqr678", "dev_stu901", "dev_vwx234", "dev_yza567", "dev_bcd890"],
  "PSI-2026-004": ["usr_100001", "usr_100002", "usr_100003", "usr_100004", "usr_100005", "usr_100006", "usr_100007", "usr_100008", "usr_100009", "usr_100010"],
  "PSI-2026-005": ["mob_138001", "mob_138002", "mob_138003", "mob_138004", "mob_138005", "mob_138006", "mob_138007", "mob_138008", "mob_138009", "mob_138010"],
  "PSI-2026-009": ["mem_a1b2c3", "mem_d4e5f6", "mem_g7h8i9", "mem_j0k1l2", "mem_m3n4o5", "mem_p6q7r8", "mem_s9t0u1", "mem_v2w3x4", "mem_y5z6a7", "mem_b8c9d0"],
  "PSI-2026-010": ["fpr_x1y2z3", "fpr_a4b5c6", "fpr_d7e8f9", "fpr_g0h1i2", "fpr_j3k4l5", "fpr_m6n7o8", "fpr_p9q0r1", "fpr_s2t3u4", "fpr_v5w6x7", "fpr_y8z9a0"],
};

const psiTasksInitial: PSITask[] = [
  {
    id: "PSI-2026-001",
    name: "用户ID隐私求交",
    protocol: "OPRF-based",
    hashing: "Cuckoo",
    outputMode: "带标签输出",
    status: "执行中",
    progress: 67,
    matchedCount: 845230,
    totalA: 1256789,
    totalB: 980345,
    createdAt: "2026-04-24 10:00",
    duration: "12分30秒",
    notifyStatus: "待触达",
    tagField: "label_value",
    partyA: { name: "电商平台A", dataSource: "用户行为数据", field: "user_id", sampleSize: 1256789 },
    partyB: { name: "广告公司B", dataSource: "广告投放数据", field: "device_id", sampleSize: 980345 },
    description: "用户ID跨域隐私求交，用于精准营销",
  },
  {
    id: "PSI-2026-002",
    name: "设备ID求交统计",
    protocol: "哈希PSI",
    hashing: "Simple",
    outputMode: "仅统计",
    status: "已完成",
    progress: 100,
    matchedCount: 623400,
    totalA: 890000,
    totalB: 756000,
    createdAt: "2026-04-24 09:00",
    duration: "8分15秒",
    notifyStatus: "已触达",
    partyA: { name: "设备厂商A", dataSource: "设备指纹库", field: "device_fingerprint", sampleSize: 890000 },
    partyB: { name: "应用商店B", dataSource: "设备标识库", field: "device_id", sampleSize: 756000 },
    description: "设备指纹跨平台匹配统计",
    metrics: mockMetrics["PSI-2026-002"],
  },
  {
    id: "PSI-2026-003",
    name: "订单ID多方求交",
    protocol: "多方PSI",
    hashing: "Cuckoo",
    outputMode: "带标签输出",
    status: "待执行",
    progress: 0,
    matchedCount: 0,
    totalA: 5689200,
    totalB: 3421000,
    createdAt: "2026-04-24 14:00",
    duration: "-",
    notifyStatus: "待触达",
    tagField: "order_status",
    partyA: { name: "支付平台A", dataSource: "订单交易数据", field: "order_id", sampleSize: 5689200 },
    partyB: { name: "物流平台B", dataSource: "订单交易数据", field: "order_id", sampleSize: 3421000 },
    description: "订单ID多方求交，关联物流状态",
  },
  {
    id: "PSI-2026-004",
    name: "用户标签求交",
    protocol: "OPRF-based",
    hashing: "Cuckoo",
    outputMode: "带标签输出",
    status: "已完成",
    progress: 100,
    matchedCount: 2894500,
    totalA: 3200000,
    totalB: 3100000,
    createdAt: "2026-04-23 16:00",
    duration: "25分10秒",
    notifyStatus: "已触达",
    tagField: "user_tag",
    partyA: { name: "社交平台A", dataSource: "用户行为数据", field: "user_id", sampleSize: 3200000 },
    partyB: { name: "电商联盟B", dataSource: "会员基础信息", field: "member_id", sampleSize: 3100000 },
    description: "用户标签跨域求交，构建用户画像",
    metrics: mockMetrics["PSI-2026-004"],
  },
  {
    id: "PSI-2026-005",
    name: "手机号隐私求交",
    protocol: "ECDH-PSI",
    hashing: "Double",
    outputMode: "交集元素",
    status: "已完成",
    progress: 100,
    matchedCount: 456700,
    totalA: 890000,
    totalB: 720000,
    createdAt: "2026-04-23 10:00",
    duration: "15分45秒",
    notifyStatus: "已触达",
    partyA: { name: "金融机构A", dataSource: "会员基础信息", field: "mobile", sampleSize: 890000 },
    partyB: { name: "运营商B", dataSource: "会员基础信息", field: "phone", sampleSize: 720000 },
    metrics: mockMetrics["PSI-2026-005"],
  },
  {
    id: "PSI-2026-006",
    name: "邮箱地址求交",
    protocol: "电路PSI",
    hashing: "Bloom",
    outputMode: "差集A-B",
    status: "已暂停",
    progress: 34,
    matchedCount: 123000,
    totalA: 560000,
    totalB: 480000,
    createdAt: "2026-04-22 09:30",
    duration: "6分20秒",
    notifyStatus: "待触达",
    partyA: { name: "邮件服务商A", dataSource: "会员基础信息", field: "email", sampleSize: 560000 },
    partyB: { name: "SaaS平台B", dataSource: "会员基础信息", field: "email", sampleSize: 480000 },
  },
  {
    id: "PSI-2026-007",
    name: "身份证号联邦求交",
    protocol: "标签PSI",
    hashing: "Murmur",
    outputMode: "带标签输出",
    status: "待执行",
    progress: 0,
    matchedCount: 0,
    totalA: 2300000,
    totalB: 2100000,
    createdAt: "2026-04-22 14:00",
    duration: "-",
    notifyStatus: "待触达",
    tagField: "risk_level",
    partyA: { name: "银行A", dataSource: "风险标签库", field: "id_card", sampleSize: 2300000 },
    partyB: { name: "征信机构B", dataSource: "风险标签库", field: "id_number", sampleSize: 2100000 },
    description: "身份证号联邦求交，获取风险等级标签",
  },
  {
    id: "PSI-2026-008",
    name: "广告ID归因求交",
    protocol: "OPRF-based",
    hashing: "SHA-256",
    outputMode: "仅统计",
    status: "执行中",
    progress: 78,
    matchedCount: 567000,
    totalA: 1200000,
    totalB: 980000,
    createdAt: "2026-04-21 11:00",
    duration: "18分30秒",
    notifyStatus: "待触达",
    partyA: { name: "广告主A", dataSource: "广告归因数据", field: "ad_id", sampleSize: 1200000 },
    partyB: { name: "媒体平台B", dataSource: "广告投放数据", field: "creative_id", sampleSize: 980000 },
    description: "广告ID归因求交统计",
  },
  {
    id: "PSI-2026-009",
    name: "会员ID跨平台求交",
    protocol: "哈希PSI",
    hashing: "Simple",
    outputMode: "对称差集",
    status: "已完成",
    progress: 100,
    matchedCount: 890000,
    totalA: 1500000,
    totalB: 1300000,
    createdAt: "2026-04-21 08:00",
    duration: "22分10秒",
    notifyStatus: "已触达",
    partyA: { name: "零售平台A", dataSource: "会员基础信息", field: "member_id", sampleSize: 1500000 },
    partyB: { name: "积分平台B", dataSource: "会员基础信息", field: "member_id", sampleSize: 1300000 },
    metrics: mockMetrics["PSI-2026-009"],
  },
  {
    id: "PSI-2026-010",
    name: "设备指纹隐私求交",
    protocol: "多方PSI",
    hashing: "Cuckoo",
    outputMode: "带标签输出",
    status: "已完成",
    progress: 100,
    matchedCount: 345600,
    totalA: 780000,
    totalB: 650000,
    createdAt: "2026-04-20 15:00",
    duration: "11分50秒",
    notifyStatus: "已触达",
    tagField: "device_type",
    partyA: { name: "安全厂商A", dataSource: "设备指纹库", field: "fingerprint", sampleSize: 780000 },
    partyB: { name: "游戏平台B", dataSource: "设备标识库", field: "device_hash", sampleSize: 650000 },
    description: "设备指纹隐私求交，获取设备类型标签",
    metrics: mockMetrics["PSI-2026-010"],
  },
];

const protocols = [
  { name: "OPRF-based", fullName: "OPRF-based PSI", desc: "基于不经意伪随机函数，安全性最高", security: "高", efficiency: "中", recommend: true },
  { name: "哈希PSI", fullName: "哈希PSI", desc: "基于哈希函数比对，速度快", security: "中", efficiency: "高", recommend: false },
  { name: "多方PSI", fullName: "多方PSI", desc: "支持三方及以上参与方求交", security: "高", efficiency: "低", recommend: false },
  { name: "ECDH-PSI", fullName: "ECDH-PSI", desc: "基于椭圆曲线迪菲-赫尔曼密钥交换", security: "高", efficiency: "中", recommend: false },
  { name: "电路PSI", fullName: "电路PSI", desc: "基于安全多方计算电路", security: "极高", efficiency: "低", recommend: false },
  { name: "标签PSI", fullName: "标签PSI", desc: "支持标签传递的PSI变体", security: "高", efficiency: "中", recommend: false },
];

const hashingMethods = [
  { name: "Cuckoo", fullName: "Cuckoo Hashing", desc: "布谷鸟哈希，优化大数据集求交效率", params: "stash_size=4, num_hash=3", recommend: true },
  { name: "Simple", fullName: "Simple Hashing", desc: "简单哈希，适用于小数据集", params: "num_bins=1000", recommend: false },
  { name: "Double", fullName: "Double Hashing", desc: "双哈希，减少冲突", params: "num_bins=2000", recommend: false },
  { name: "Bloom", fullName: "Bloom Filter", desc: "布隆过滤器，空间效率高", params: "false_positive=0.01", recommend: false },
  { name: "Murmur", fullName: "MurmurHash", desc: "非加密哈希，速度快", params: "seed=42", recommend: false },
  { name: "SHA-256", fullName: "SHA-256", desc: "加密哈希，安全性高", params: "-", recommend: false },
];

const outputModes = [
  "带标签输出",
  "仅统计",
  "交集元素",
  "差集A-B",
  "差集B-A",
  "对称差集",
];

const steps = [
  { label: "基本信息", icon: FileText },
  { label: "Party A", icon: User },
  { label: "Party B", icon: User },
  { label: "输出设置", icon: Settings },
  { label: "确认", icon: CheckCircle },
];

const protocolBenchmarks = [
  { protocol: "ECDH-PSI", setupCost: "中", commRounds: 2, compCost: "中", scale: "10^6", securityModel: "半诚实", latencyFriendly: true, bandwidthFriendly: false },
  { protocol: "KKRT16", setupCost: "高", commRounds: 3, compCost: "高", scale: "10^7", securityModel: "半诚实", latencyFriendly: false, bandwidthFriendly: true },
  { protocol: "OT-PSI", setupCost: "低", commRounds: 4, compCost: "低", scale: "10^5", securityModel: "恶意", latencyFriendly: true, bandwidthFriendly: true },
  { protocol: "TEE-PSI", setupCost: "低", commRounds: 1, compCost: "极低", scale: "10^8", securityModel: "TEE", latencyFriendly: true, bandwidthFriendly: true },
];

function generateId() {
  return `PSI-${Date.now().toString(36).toUpperCase()}`;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

function getScheduleNextRun(schedule: ScheduleConfig): string {
  const now = new Date();
  if (schedule.type === "once") {
    const next = new Date(now);
    next.setHours(schedule.hour, schedule.minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString().slice(0, 16).replace("T", " ");
  }
  if (schedule.type === "daily") {
    const next = new Date(now);
    next.setHours(schedule.hour, schedule.minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString().slice(0, 16).replace("T", " ");
  }
  if (schedule.type === "weekly") {
    const next = new Date(now);
    next.setHours(schedule.hour, schedule.minute, 0, 0);
    const daysUntil = ((schedule.dayOfWeek || 1) - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + (daysUntil === 0 && next <= now ? 7 : daysUntil));
    return next.toISOString().slice(0, 16).replace("T", " ");
  }
  if (schedule.type === "monthly") {
    const next = new Date(now);
    next.setHours(schedule.hour, schedule.minute, 0, 0);
    next.setDate(schedule.dayOfMonth || 1);
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return next.toISOString().slice(0, 16).replace("T", " ");
  }
  return "-";
}

export default function SecretPSI() {
  const [tasks, setTasks] = useState<PSITask[]>(psiTasksInitial);
  const [search, setSearch] = useState("");

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<PSITask>>({
    protocol: "OPRF-based",
    hashing: "Cuckoo",
    outputMode: "带标签输出",
    partyA: { name: "", dataSource: "", field: "", sampleSize: 0 },
    partyB: { name: "", dataSource: "", field: "", sampleSize: 0 },
  });

  // Quality check state (optional step 0)
  const [qualityCheckEnabled, setQualityCheckEnabled] = useState(false);
  const [qualityCheckStep, setQualityCheckStep] = useState(false);
  const [qualityResults, setQualityResults] = useState<{ score: number; formatValid: boolean; duplicates: number; nullValues: number; recommendations: string[] } | null>(null);

  // Schedule state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    enabled: false,
    type: "once",
    hour: 2,
    minute: 0,
  });

  // Detail Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Export
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportTask, setExportTask] = useState<PSITask | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTask, setPreviewTask] = useState<PSITask | null>(null);

  // Rerun dialog
  const [rerunOpen, setRerunOpen] = useState(false);
  const [rerunTask, setRerunTask] = useState<PSITask | null>(null);

  // Analysis tab state
  const [analysisTaskId, setAnalysisTaskId] = useState<string>("");
  const [compareTaskIds, setCompareTaskIds] = useState<string[]>([]);

  // Benchmark recommendation
  const [benchmarkScale, setBenchmarkScale] = useState<string>("10^6");
  const [benchmarkNetwork, setBenchmarkNetwork] = useState<string>("high");

  const [selectedItem, setSelectedItem] = useState<PSITask | null>(null);

  // ECharts refs
  const ratioChartRef = useRef<HTMLDivElement>(null);
  const ratioChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const distChartRef = useRef<HTMLDivElement>(null);
  const distChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const perfChartRef = useRef<HTMLDivElement>(null);
  const perfChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const compareChartRef = useRef<HTMLDivElement>(null);
  const compareChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const trendChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);
  const radarChartInstanceRef = useRef<echarts.ECharts | null>(null);

  const filtered = tasks.filter((d) =>
    d.name.includes(search) || d.id.includes(search) ||
    d.partyA.name.includes(search) || d.partyB.name.includes(search)
  );

  const completedTasks = tasks.filter((t) => t.status === "已完成");

  const handleCreate = () => {
    setSelectedItem(null);
    setCurrentStep(0);
    setQualityCheckStep(false);
    setQualityCheckEnabled(false);
    setQualityResults(null);
    setScheduleEnabled(false);
    setScheduleConfig({ enabled: false, type: "once", hour: 2, minute: 0 });
    setWizardData({
      name: "",
      description: "",
      protocol: "OPRF-based",
      hashing: "Cuckoo",
      outputMode: "带标签输出",
      partyA: { name: "", dataSource: "", field: "", sampleSize: 0 },
      partyB: { name: "", dataSource: "", field: "", sampleSize: 0 },
      tagField: "",
    });
    setWizardOpen(true);
  };

  const handleEdit = (task: PSITask) => {
    setSelectedItem(task);
    setCurrentStep(0);
    setQualityCheckStep(false);
    setQualityCheckEnabled(false);
    setQualityResults(null);
    setScheduleEnabled(!!task.schedule?.enabled);
    setScheduleConfig(task.schedule || { enabled: false, type: "once", hour: 2, minute: 0 });
    setWizardData({ ...task });
    setWizardOpen(true);
  };

  const handleView = (task: PSITask) => {
    setSelectedItem(task);
    setDrawerOpen(true);
  };

  const handleDeletePrompt = (task: PSITask) => {
    setSelectedItem(task);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setTasks((prev) => prev.filter((t) => t.id !== selectedItem.id));
      setDrawerOpen(false);
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const runQualityCheck = () => {
    // Mock quality check
    const score = Math.floor(75 + Math.random() * 25);
    const formatValid = Math.random() > 0.1;
    const duplicates = Math.floor(Math.random() * 500);
    const nullValues = Math.floor(Math.random() * 200);
    const recommendations: string[] = [];
    if (!formatValid) recommendations.push("数据格式不符合预期，建议清洗后重试");
    if (duplicates > 100) recommendations.push(`发现 ${duplicates} 条重复记录，建议去重`);
    if (nullValues > 50) recommendations.push(`发现 ${nullValues} 条空值记录，建议补全`);
    if (score < 90) recommendations.push("数据质量评分偏低，建议优化数据质量");
    setQualityResults({ score, formatValid, duplicates, nullValues, recommendations });
  };

  const handleWizardSubmit = () => {
    const data = wizardData as Required<typeof wizardData>;
    if (!data.name || !data.partyA?.name || !data.partyB?.name) return;

    const schedule = scheduleEnabled ? { ...scheduleConfig, enabled: true, nextRun: getScheduleNextRun(scheduleConfig) } : undefined;

    if (selectedItem) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedItem.id
            ? {
                ...t,
                name: data.name,
                description: data.description,
                protocol: data.protocol,
                hashing: data.hashing,
                outputMode: data.outputMode,
                tagField: data.outputMode === "带标签输出" ? (data.tagField || "label_value") : undefined,
                partyA: data.partyA,
                partyB: data.partyB,
                schedule,
              }
            : t
        )
      );
    } else {
      const newTask: PSITask = {
        id: generateId(),
        name: data.name,
        protocol: data.protocol,
        hashing: data.hashing,
        outputMode: data.outputMode,
        status: scheduleEnabled ? "待执行" : "待执行",
        progress: 0,
        matchedCount: 0,
        totalA: data.partyA.sampleSize || 0,
        totalB: data.partyB.sampleSize || 0,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        duration: "-",
        notifyStatus: "待触达",
        tagField: data.outputMode === "带标签输出" ? (data.tagField || "label_value") : undefined,
        partyA: data.partyA,
        partyB: data.partyB,
        description: data.description,
        schedule,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setWizardOpen(false);
    setSelectedItem(null);
  };

  const handleToggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "待执行") return { ...t, status: "执行中" };
        else if (t.status === "执行中") return { ...t, status: "已暂停" };
        else if (t.status === "已暂停") return { ...t, status: "执行中" };
        else if (t.status === "已完成") return { ...t, status: "待执行" };
        return t;
      })
    );
  };

  const handleCancelTask = (task: PSITask) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: "已取消", progress: 0 } : t));
  };

  const handleCopy = (task: PSITask) => {
    const copy: PSITask = {
      ...task,
      id: generateId(),
      name: `${task.name} (复制)`,
      status: "待执行",
      progress: 0,
      matchedCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: "-",
      schedule: undefined,
    };
    setTasks((prev) => [copy, ...prev]);
  };

  const handleRerun = (task: PSITask) => {
    const newTask: PSITask = {
      ...task,
      id: generateId(),
      name: `${task.name} (重新执行)`,
      status: "待执行",
      progress: 0,
      matchedCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: "-",
      notifyStatus: "待触达",
      schedule: undefined,
    };
    setTasks((prev) => [newTask, ...prev]);
    setRerunOpen(false);
    setRerunTask(null);
  };

  const handlePreview = (task: PSITask) => {
    setPreviewTask(task);
    setPreviewOpen(true);
  };

  const handleExport = (task: PSITask) => {
    setExportTask(task);
    setExportFormat("csv");
    setExportOpen(true);
  };

  const handleReach = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, notifyStatus: "已触达" } : t)));
  };

  const updateWizardField = (field: string, value: string) => {
    setWizardData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePartyField = (party: "partyA" | "partyB", field: keyof PartyConfig, value: string | number) => {
    setWizardData((prev) => ({
      ...prev,
      [party]: { ...(prev[party] || { name: "", dataSource: "", field: "", sampleSize: 0 }), [field]: value },
    }));
  };

  const canProceed = () => {
    if (qualityCheckStep) {
      return true;
    }
    switch (currentStep) {
      case 0:
        return !!wizardData.name?.trim();
      case 1:
        return !!wizardData.partyA?.name?.trim() && !!wizardData.partyA?.dataSource && !!wizardData.partyA?.field?.trim();
      case 2:
        return !!wizardData.partyB?.name?.trim() && !!wizardData.partyB?.dataSource && !!wizardData.partyB?.field?.trim();
      case 3:
        return true;
      default:
        return true;
    }
  };

  const detailFields: { key: string; label: string; type?: "text" | "badge" | "date" | "list" }[] = [
    { key: "id", label: "任务ID", type: "text" },
    { key: "name", label: "任务名称", type: "text" },
    { key: "description", label: "描述", type: "text" },
    { key: "protocol", label: "协议", type: "badge" as const },
    { key: "hashing", label: "Hashing", type: "text" },
    { key: "outputMode", label: "输出模式", type: "text" },
    { key: "tagField", label: "标签字段", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "progress", label: "进度", type: "text" },
    { key: "partyAName", label: "Party A", type: "text" },
    { key: "partyASource", label: "A方数据源", type: "text" },
    { key: "partyAField", label: "A方字段", type: "text" },
    { key: "partyASize", label: "A方样本", type: "text" },
    { key: "partyBName", label: "Party B", type: "text" },
    { key: "partyBSource", label: "B方数据源", type: "text" },
    { key: "partyBField", label: "B方字段", type: "text" },
    { key: "partyBSize", label: "B方样本", type: "text" },
    { key: "totalA", label: "A方总样本", type: "text" },
    { key: "totalB", label: "B方总样本", type: "text" },
    { key: "matchedCount", label: "匹配量", type: "text" },
    { key: "createdAt", label: "创建时间", type: "date" },
    { key: "duration", label: "耗时", type: "text" },
    { key: "notifyStatus", label: "通知状态", type: "badge" as const },
    { key: "scheduleInfo", label: "定时执行", type: "text" },
  ];

  const getDetailData = (task: PSITask | null): Record<string, unknown> => {
    if (!task) return {};
    return {
      ...task,
      partyAName: task.partyA.name,
      partyASource: task.partyA.dataSource,
      partyAField: task.partyA.field,
      partyASize: task.partyA.sampleSize.toLocaleString(),
      partyBName: task.partyB.name,
      partyBSource: task.partyB.dataSource,
      partyBField: task.partyB.field,
      partyBSize: task.partyB.sampleSize.toLocaleString(),
      progress: `${task.progress}%`,
      totalA: task.totalA.toLocaleString(),
      totalB: task.totalB.toLocaleString(),
      matchedCount: task.matchedCount.toLocaleString(),
      scheduleInfo: task.schedule?.enabled ? `${task.schedule.type} (下次: ${task.schedule.nextRun})` : "未设置",
    };
  };

  // ECharts: Ratio Pie Chart
  useEffect(() => {
    if (!ratioChartRef.current || !analysisTaskId) return;
    const task = completedTasks.find((t) => t.id === analysisTaskId);
    if (!task) return;
    ratioChartInstanceRef.current?.dispose();
    ratioChartInstanceRef.current = echarts.init(ratioChartRef.current);
    ratioChartInstanceRef.current.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: "0%", left: "center" },
      series: [{
        name: "数据分布",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, formatter: "{b}: {d}%" },
        data: [
          { value: task.matchedCount, name: "交集", itemStyle: { color: "#10b981" } },
          { value: task.totalA - task.matchedCount, name: "A方独有", itemStyle: { color: "#6366f1" } },
          { value: task.totalB - task.matchedCount, name: "B方独有", itemStyle: { color: "#3b82f6" } },
        ],
      }],
    });
    return () => { ratioChartInstanceRef.current?.dispose(); };
  }, [analysisTaskId, completedTasks]);

  // ECharts: Distribution Bar Chart
  useEffect(() => {
    if (!distChartRef.current || !analysisTaskId) return;
    const task = completedTasks.find((t) => t.id === analysisTaskId);
    if (!task) return;
    distChartInstanceRef.current?.dispose();
    distChartInstanceRef.current = echarts.init(distChartRef.current);
    distChartInstanceRef.current.setOption({
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: ["Party A", "Party B", "交集"] },
      yAxis: { type: "value" },
      series: [{
        data: [
          { value: task.totalA, itemStyle: { color: "#6366f1" } },
          { value: task.totalB, itemStyle: { color: "#3b82f6" } },
          { value: task.matchedCount, itemStyle: { color: "#10b981" } },
        ],
        type: "bar",
        barWidth: "50%",
        label: { show: true, position: "top", formatter: (p: any) => p.value.toLocaleString() },
      }],
    });
    return () => { distChartInstanceRef.current?.dispose(); };
  }, [analysisTaskId, completedTasks]);

  // ECharts: Performance Bar Chart
  useEffect(() => {
    if (!perfChartRef.current || !analysisTaskId) return;
    const task = completedTasks.find((t) => t.id === analysisTaskId);
    if (!task?.metrics) return;
    perfChartInstanceRef.current?.dispose();
    perfChartInstanceRef.current = echarts.init(perfChartRef.current);
    perfChartInstanceRef.current.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "category", data: ["Setup", "Transfer", "Computation", "Total"] },
      yAxis: { type: "value", name: "秒" },
      series: [{
        data: [
          { value: task.metrics.setupTime, itemStyle: { color: "#f59e0b" } },
          { value: task.metrics.transferTime, itemStyle: { color: "#6366f1" } },
          { value: task.metrics.computationTime, itemStyle: { color: "#10b981" } },
          { value: task.metrics.totalTime, itemStyle: { color: "#ef4444" } },
        ],
        type: "bar",
        barWidth: "50%",
        label: { show: true, position: "top", formatter: (p: any) => `${p.value}s` },
      }],
    });
    return () => { perfChartInstanceRef.current?.dispose(); };
  }, [analysisTaskId, completedTasks]);

  // ECharts: Comparison Bar Chart
  useEffect(() => {
    if (!compareChartRef.current || compareTaskIds.length === 0) return;
    const selectedTasks = completedTasks.filter((t) => compareTaskIds.includes(t.id));
    if (selectedTasks.length === 0) return;
    compareChartInstanceRef.current?.dispose();
    compareChartInstanceRef.current = echarts.init(compareChartRef.current);
    compareChartInstanceRef.current.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["交集比例", "A方比例", "B方比例"], bottom: 0 },
      xAxis: { type: "category", data: selectedTasks.map((t) => t.name) },
      yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
      series: [
        {
          name: "交集比例",
          type: "bar",
          data: selectedTasks.map((t) => Number(((t.matchedCount / Math.min(t.totalA, t.totalB)) * 100).toFixed(1))),
          itemStyle: { color: "#10b981" },
        },
        {
          name: "A方比例",
          type: "bar",
          data: selectedTasks.map((t) => Number(((t.matchedCount / t.totalA) * 100).toFixed(1))),
          itemStyle: { color: "#6366f1" },
        },
        {
          name: "B方比例",
          type: "bar",
          data: selectedTasks.map((t) => Number(((t.matchedCount / t.totalB) * 100).toFixed(1))),
          itemStyle: { color: "#3b82f6" },
        },
      ],
    });
    return () => { compareChartInstanceRef.current?.dispose(); };
  }, [compareTaskIds, completedTasks]);

  // ECharts: Trend Line Chart
  useEffect(() => {
    if (!trendChartRef.current) return;
    const history = completedTasks.slice(0, 5).reverse();
    if (history.length === 0) return;
    trendChartInstanceRef.current?.dispose();
    trendChartInstanceRef.current = echarts.init(trendChartRef.current);
    trendChartInstanceRef.current.setOption({
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: history.map((t) => t.name) },
      yAxis: { type: "value", name: "秒" },
      series: [{
        data: history.map((t) => t.metrics?.totalTime || 0),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#6366f1" },
        lineStyle: { width: 3 },
        areaStyle: { color: "rgba(99,102,241,0.1)" },
        label: { show: true, formatter: (p: any) => `${p.value}s` },
      }],
    });
    return () => { trendChartInstanceRef.current?.dispose(); };
  }, [completedTasks]);

  // ECharts: Radar Chart
  useEffect(() => {
    if (!radarChartRef.current) return;
    radarChartInstanceRef.current?.dispose();
    radarChartInstanceRef.current = echarts.init(radarChartRef.current);
    radarChartInstanceRef.current.setOption({
      tooltip: {},
      legend: { data: protocolBenchmarks.map((p) => p.protocol), bottom: 0 },
      radar: {
        indicator: [
          { name: "安全性", max: 100 },
          { name: "效率", max: 100 },
          { name: "可扩展性", max: 100 },
          { name: "低延迟友好", max: 100 },
          { name: "低带宽友好", max: 100 },
        ],
      },
      series: [{
        type: "radar",
        data: protocolBenchmarks.map((p) => ({
          value: [
            p.securityModel === "恶意" ? 95 : p.securityModel === "TEE" ? 85 : p.securityModel === "极高" ? 98 : 80,
            p.compCost === "极低" ? 95 : p.compCost === "低" ? 80 : p.compCost === "中" ? 60 : 40,
            p.scale === "10^8" ? 100 : p.scale === "10^7" ? 85 : p.scale === "10^6" ? 70 : 50,
            p.latencyFriendly ? 90 : 50,
            p.bandwidthFriendly ? 90 : 50,
          ],
          name: p.protocol,
        })),
      }],
    });
    return () => { radarChartInstanceRef.current?.dispose(); };
  }, []);

  const getRecommendedProtocol = () => {
    const scale = benchmarkScale;
    const network = benchmarkNetwork;
    if (scale === "10^8" || scale === "10^7") {
      return "TEE-PSI (极高扩展性，单轮通信)";
    }
    if (network === "low") {
      if (scale === "10^6") return "ECDH-PSI (低延迟，两轮通信)";
      return "OT-PSI (低带宽，安全模型强)";
    }
    if (scale === "10^5") return "OT-PSI (恶意安全，小规模最优)";
    return "ECDH-PSI (平衡方案，推荐默认)";
  };

  const handleExportAnalysis = () => {
    const task = completedTasks.find((t) => t.id === analysisTaskId);
    if (!task) return;
    const blob = new Blob([JSON.stringify({ task, metrics: task.metrics }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${task.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">隐私求交(PSI)</h1>
          <p className="text-sm text-gray-500 mt-1.5">支持OPRF/哈希/多方PSI协议，数据不出域安全求交</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />新建求交任务
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Layers className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">求交任务</p><p className="text-lg font-bold">{tasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Zap className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{tasks.filter((d) => d.status === "已完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Hash className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总匹配量</p><p className="text-lg font-bold">{(tasks.reduce((s, d) => s + d.matchedCount, 0)).toLocaleString()}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Bell className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">待触达</p><p className="text-lg font-bold">{tasks.filter((d) => d.notifyStatus === "待触达").length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks"><Layers className="h-4 w-4 mr-1" />求交任务</TabsTrigger>
          <TabsTrigger value="statistics"><BarChart3 className="h-4 w-4 mr-1" />统计任务</TabsTrigger>
          <TabsTrigger value="labels"><Tag className="h-4 w-4 mr-1" />标签任务</TabsTrigger>
          <TabsTrigger value="analysis"><Activity className="h-4 w-4 mr-1" />结果分析</TabsTrigger>
          <TabsTrigger value="benchmark"><Gauge className="h-4 w-4 mr-1" />协议对比</TabsTrigger>
          <TabsTrigger value="report"><BarChart3 className="h-4 w-4 mr-1" />交集统计报告</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称、ID或参与方" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["任务ID", "任务名称", "协议", "参与方", "输出模式", "进度", "A方/B方", "匹配量", "耗时", "通知", "定时", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map((d) => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.protocol}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="text-indigo-600 font-medium">{d.partyA.name}</span>
                        <span className="text-gray-400 text-[10px]">↔</span>
                        <span className="text-blue-600 font-medium">{d.partyB.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.outputMode}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="w-16"><Progress value={d.progress} className="h-1.5" /><span className="text-xs">{d.progress}%</span></div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.totalA.toLocaleString()} / {d.totalB.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{d.matchedCount > 0 ? d.matchedCount.toLocaleString() : "-"}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{d.duration}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.notifyStatus === "已触达" ? "bg-emerald-50 text-emerald-700" : d.notifyStatus === "已关闭" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"}`}>{d.notifyStatus}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      {d.schedule?.enabled ? (
                        <div className="flex items-center gap-1 text-xs text-indigo-600">
                          <Clock className="h-3 w-3" />
                          <span>{d.schedule.type}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(d)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)} title="复制任务"><Copy className="h-4 w-4" /></Button>
                        {d.status === "执行中" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" onClick={() => handleCancelTask(d)} title="中断任务"><XCircle className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>
                          {d.status === "执行中" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        {d.status === "已完成" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(d)} title="结果预览"><FileSearch className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(d)}><Download className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setRerunTask(d); setRerunOpen(true); }} title="重新执行"><RotateCcw className="h-4 w-4" /></Button>
                          </>
                        )}
                        {d.status === "已完成" && d.notifyStatus === "待触达" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleReach(d.id)}><Bell className="h-3 w-3 mr-1" />触达</Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeletePrompt(d)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-4 space-y-4">
          <div className="flex gap-3 items-center"><Input placeholder="搜索任务ID或名称" className="w-64 h-9" /></div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">{["任务ID","任务名称","参与方","交集数量","A方样本","B方样本","状态","操作"].map((h)=><TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {tasks.filter((t)=>t.status==="已完成").map((t)=>(
                  <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">
                      <span className="text-indigo-600">{t.partyA.name}</span>
                      <span className="text-gray-400 mx-1">↔</span>
                      <span className="text-blue-600">{t.partyB.name}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{t.matchedCount.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{t.totalA.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{t.totalB.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className="bg-emerald-50 text-emerald-700">{t.status}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(t)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(t)}><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(t)}><BarChart3 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="mt-4 space-y-4">
          <div className="flex gap-3 items-center"><Input placeholder="搜索任务ID或名称" className="w-64 h-9" /></div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">{["任务ID","任务名称","标签字段","参与方","匹配样本","状态","操作"].map((h)=><TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {tasks.filter((t)=>t.status==="已完成" && t.outputMode==="带标签输出").map((t)=>(
                  <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline">{t.tagField || "label_value"}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">
                      <span className="text-indigo-600">{t.partyA.name}</span>
                      <span className="text-gray-400 mx-1">↔</span>
                      <span className="text-blue-600">{t.partyB.name}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{t.matchedCount.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className="bg-emerald-50 text-emerald-700">{t.status}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(t)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(t)}><Download className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Result Analysis Tab */}
        <TabsContent value="analysis" className="mt-4 space-y-4">
          <div className="flex flex-col gap-4">
            {/* Task selector */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Label className="text-sm font-medium">分析任务</Label>
                </div>
                <Select value={analysisTaskId} onValueChange={setAnalysisTaskId}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="选择已完成任务" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {analysisTaskId && (
                  <Button variant="outline" size="sm" onClick={handleExportAnalysis} className="gap-1">
                    <Download className="h-3.5 w-3.5" />导出分析报告
                  </Button>
                )}
              </div>
            </Card>

            {analysisTaskId && (() => {
              const task = completedTasks.find((t) => t.id === analysisTaskId);
              if (!task) return null;
              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-600" />交集比例分布</h3>
                      <div ref={ratioChartRef} className="w-full h-64" />
                    </Card>
                    <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" />数据分布</h3>
                      <div ref={distChartRef} className="w-full h-64" />
                    </Card>
                  </div>

                  {/* Match Quality Metrics */}
                  {task.metrics && (
                    <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" />匹配质量指标</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Precision</p>
                          <p className="text-2xl font-bold text-indigo-600">{(task.metrics.precision! * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Recall</p>
                          <p className="text-2xl font-bold text-blue-600">{(task.metrics.recall! * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">F1 Score</p>
                          <p className="text-2xl font-bold text-emerald-600">{(task.metrics.f1Score! * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Performance Metrics */}
                  {task.metrics && (
                    <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-600" />性能指标</h3>
                      <div ref={perfChartRef} className="w-full h-64" />
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Setup</p>
                          <p className="text-lg font-bold">{task.metrics.setupTime}s</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Transfer</p>
                          <p className="text-lg font-bold">{task.metrics.transferTime}s</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Computation</p>
                          <p className="text-lg font-bold">{task.metrics.computationTime}s</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-bold">{task.metrics.totalTime}s</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              );
            })()}

            {/* Multi-Task Comparison */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-violet-600" />多任务对比 (最多3个)</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                {completedTasks.map((t) => {
                  const isSelected = compareTaskIds.includes(t.id);
                  return (
                    <Button
                      key={t.id}
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={`text-xs ${isSelected ? "bg-violet-600" : ""}`}
                      onClick={() => {
                        if (isSelected) {
                          setCompareTaskIds((prev) => prev.filter((id) => id !== t.id));
                        } else if (compareTaskIds.length < 3) {
                          setCompareTaskIds((prev) => [...prev, t.id]);
                        }
                      }}
                    >
                      {t.name}
                    </Button>
                  );
                })}
              </div>
              {compareTaskIds.length > 0 && (
                <>
                  <div ref={compareChartRef} className="w-full h-64 mb-4" />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">任务名称</TableHead>
                        <TableHead className="text-xs">协议</TableHead>
                        <TableHead className="text-xs">交集大小</TableHead>
                        <TableHead className="text-xs">耗时</TableHead>
                        <TableHead className="text-xs">吞吐量 (items/s)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedTasks.filter((t) => compareTaskIds.includes(t.id)).map((t) => {
                        const throughput = t.metrics ? Math.floor((t.totalA + t.totalB) / t.metrics.totalTime) : 0;
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="text-sm font-medium">{t.name}</TableCell>
                            <TableCell className="text-xs">{t.protocol}</TableCell>
                            <TableCell className="text-sm font-semibold text-emerald-600">{t.matchedCount.toLocaleString()}</TableCell>
                            <TableCell className="text-xs">{t.duration}</TableCell>
                            <TableCell className="text-xs">{throughput.toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </Card>

            {/* Performance Trend */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" />性能趋势 (最近5次执行)</h3>
              <div ref={trendChartRef} className="w-full h-64" />
            </Card>
          </div>
        </TabsContent>

        {/* Protocol Benchmark Tab */}
        <TabsContent value="benchmark" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Gauge className="h-5 w-5 text-indigo-600" />协议性能对比</h3>
              <div ref={radarChartRef} className="w-full h-80" />
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-600" />协议推荐引擎</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>数据规模</Label>
                  <Select value={benchmarkScale} onValueChange={setBenchmarkScale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10^5">10^5 (小规模)</SelectItem>
                      <SelectItem value="10^6">10^6 (中规模)</SelectItem>
                      <SelectItem value="10^7">10^7 (大规模)</SelectItem>
                      <SelectItem value="10^8">10^8 (超大规模)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>网络条件</Label>
                  <Select value={benchmarkNetwork} onValueChange={setBenchmarkNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高带宽低延迟</SelectItem>
                      <SelectItem value="low">低带宽高延迟</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-900 mb-1">推荐协议</p>
                  <p className="text-base font-bold text-indigo-700">{getRecommendedProtocol()}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["协议", "Setup成本", "通信轮次", "计算成本", "支持规模", "安全模型", "低延迟友好", "低带宽友好"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {protocolBenchmarks.map((p) => (
                  <TableRow key={p.protocol} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{p.protocol}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{p.setupCost}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{p.commRounds}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{p.compCost}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{p.scale}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline">{p.securityModel}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">{p.latencyFriendly ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}</TableCell>
                    <TableCell className="py-3.5 px-4">{p.bandwidthFriendly ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-600" />交集统计分布</h3>
              <div className="space-y-4">
                {tasks.filter((t) => t.status === "已完成").map((t) => (
                  <div key={t.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.name}</span>
                      <span className="font-semibold">{(t.matchedCount / t.totalA * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="text-indigo-600">{t.partyA.name}</span>
                      <span>↔</span>
                      <span className="text-blue-600">{t.partyB.name}</span>
                    </div>
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white" style={{ width: `${(t.matchedCount / t.totalA) * 100}%` }}>交集 {(t.matchedCount / 10000).toFixed(0)}万</div>
                      <div className="h-full bg-gray-300" style={{ width: `${((t.totalA - t.matchedCount) / t.totalA) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                      <span>A方: {t.totalA.toLocaleString()}</span>
                      <span>B方: {t.totalB.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 gap-2 w-full" variant="outline" onClick={() => { setExportFormat("pdf"); setExportOpen(true); }}><Download className="w-4 h-4" />导出报告</Button>
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" />各方贡献率</h3>
              <div className="space-y-3">
                {tasks.filter((t) => t.status === "已完成").map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="text-indigo-600">{t.partyA.name}</span>
                        <span className="mx-1">↔</span>
                        <span className="text-blue-600">{t.partyB.name}</span>
                      </p>
                      <p className="text-xs text-gray-400">协议: {t.protocol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{t.matchedCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">交集</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Multi-step Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              {selectedItem ? "编辑PSI任务" : "新建PSI求交任务"}
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6 mt-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = qualityCheckStep ? false : index === currentStep;
              const isCompleted = qualityCheckStep ? true : index < currentStep;
              return (
                <div key={index} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted && !isActive ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-indigo-600" : isCompleted ? "text-emerald-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="space-y-4 py-2 min-h-[280px]">
            {/* Optional Step 0: Data Quality Pre-check */}
            {qualityCheckStep && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-indigo-600" />数据质量预检查 (可选)
                </h3>
                {!qualityResults ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">对数据进行格式验证、重复检测和空值检查，帮助提升求交成功率。</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="border-gray-100"><CardContent className="p-4 text-center"><FileText className="h-6 w-6 text-indigo-600 mx-auto mb-2" /><p className="text-xs font-medium">格式验证</p></CardContent></Card>
                      <Card className="border-gray-100"><CardContent className="p-4 text-center"><Copy className="h-6 w-6 text-amber-600 mx-auto mb-2" /><p className="text-xs font-medium">重复检测</p></CardContent></Card>
                      <Card className="border-gray-100"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" /><p className="text-xs font-medium">空值检查</p></CardContent></Card>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={runQualityCheck}>
                      <Search className="h-4 w-4 mr-2" />开始检查
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-2 ${qualityResults.score >= 90 ? "bg-emerald-50" : qualityResults.score >= 70 ? "bg-amber-50" : "bg-red-50"}`}>
                        <span className={`text-2xl font-bold ${qualityResults.score >= 90 ? "text-emerald-600" : qualityResults.score >= 70 ? "text-amber-600" : "text-red-600"}`}>{qualityResults.score}</span>
                      </div>
                      <p className="text-sm text-gray-500">质量评分</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">格式验证</p>
                        <p className={`text-sm font-bold ${qualityResults.formatValid ? "text-emerald-600" : "text-red-600"}`}>{qualityResults.formatValid ? "通过" : "失败"}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">重复记录</p>
                        <p className="text-sm font-bold text-amber-600">{qualityResults.duplicates}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">空值记录</p>
                        <p className="text-sm font-bold text-red-600">{qualityResults.nullValues}</p>
                      </div>
                    </div>
                    {qualityResults.recommendations.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-medium text-amber-800 mb-1">优化建议</p>
                        <ul className="space-y-1">
                          {qualityResults.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-amber-700 flex items-start gap-1"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {!qualityCheckStep && currentStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />基本信息
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="w-name">任务名称 <span className="text-red-500">*</span></Label>
                  <Input
                    id="w-name"
                    value={wizardData.name || ""}
                    onChange={(e) => updateWizardField("name", e.target.value)}
                    placeholder="如：用户ID隐私求交"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w-desc">描述</Label>
                  <Textarea
                    id="w-desc"
                    value={wizardData.description || ""}
                    onChange={(e) => updateWizardField("description", e.target.value)}
                    placeholder="任务描述（可选）"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>协议 <span className="text-red-500">*</span></Label>
                    <Select value={wizardData.protocol} onValueChange={(v) => updateWizardField("protocol", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择协议" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((p) => (
                          <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hashing <span className="text-red-500">*</span></Label>
                    <Select value={wizardData.hashing} onValueChange={(v) => updateWizardField("hashing", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择Hashing" />
                      </SelectTrigger>
                      <SelectContent>
                        {hashingMethods.map((h) => (
                          <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="schedule-enabled"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="schedule-enabled" className="text-sm font-medium cursor-pointer">定时执行</Label>
                  </div>
                  {scheduleEnabled && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-xs">执行类型</Label>
                        <Select value={scheduleConfig.type} onValueChange={(v: any) => setScheduleConfig((prev) => ({ ...prev, type: v }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">单次执行</SelectItem>
                            <SelectItem value="daily">每日</SelectItem>
                            <SelectItem value="weekly">每周</SelectItem>
                            <SelectItem value="monthly">每月</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">小时</Label>
                          <Select value={String(scheduleConfig.hour)} onValueChange={(v) => setScheduleConfig((prev) => ({ ...prev, hour: parseInt(v) }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">分钟</Label>
                          <Select value={String(scheduleConfig.minute)} onValueChange={(v) => setScheduleConfig((prev) => ({ ...prev, minute: parseInt(v) }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 15, 30, 45].map((m) => (
                                <SelectItem key={m} value={String(m)}>{String(m).padStart(2, "0")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {scheduleConfig.type === "weekly" && (
                        <div className="space-y-2">
                          <Label className="text-xs">星期</Label>
                          <Select value={String(scheduleConfig.dayOfWeek || 1)} onValueChange={(v) => setScheduleConfig((prev) => ({ ...prev, dayOfWeek: parseInt(v) }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((d, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {scheduleConfig.type === "monthly" && (
                        <div className="space-y-2">
                          <Label className="text-xs">日期</Label>
                          <Select value={String(scheduleConfig.dayOfMonth || 1)} onValueChange={(v) => setScheduleConfig((prev) => ({ ...prev, dayOfMonth: parseInt(v) }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}日</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        预计下次执行: {getScheduleNextRun(scheduleConfig)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quality Check Toggle */}
                {!selectedItem && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="quality-check"
                      checked={qualityCheckEnabled}
                      onChange={(e) => setQualityCheckEnabled(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="quality-check" className="text-sm cursor-pointer">启用数据质量预检查</Label>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Party A */}
            {!qualityCheckStep && currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />Party A 配置
                </h3>
                <Card className="border-indigo-100 bg-indigo-50/30">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>参与方名称 <span className="text-red-500">*</span></Label>
                      <Input
                        value={wizardData.partyA?.name || ""}
                        onChange={(e) => updatePartyField("partyA", "name", e.target.value)}
                        placeholder="如：电商平台A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>数据源 <span className="text-red-500">*</span></Label>
                      <Select
                        value={wizardData.partyA?.dataSource || ""}
                        onValueChange={(v) => updatePartyField("partyA", "dataSource", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择数据源" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((ds) => (
                            <SelectItem key={ds} value={ds}>{ds}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ID字段 <span className="text-red-500">*</span></Label>
                      <Input
                        value={wizardData.partyA?.field || ""}
                        onChange={(e) => updatePartyField("partyA", "field", e.target.value)}
                        placeholder="如：user_id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>样本量</Label>
                      <Input
                        type="number"
                        value={wizardData.partyA?.sampleSize || 0}
                        onChange={(e) => updatePartyField("partyA", "sampleSize", parseInt(e.target.value) || 0)}
                        placeholder="样本数量"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Party B */}
            {!qualityCheckStep && currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />Party B 配置
                </h3>
                <Card className="border-blue-100 bg-blue-50/30">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>参与方名称 <span className="text-red-500">*</span></Label>
                      <Input
                        value={wizardData.partyB?.name || ""}
                        onChange={(e) => updatePartyField("partyB", "name", e.target.value)}
                        placeholder="如：广告公司B"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>数据源 <span className="text-red-500">*</span></Label>
                      <Select
                        value={wizardData.partyB?.dataSource || ""}
                        onValueChange={(v) => updatePartyField("partyB", "dataSource", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择数据源" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((ds) => (
                            <SelectItem key={ds} value={ds}>{ds}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ID字段 <span className="text-red-500">*</span></Label>
                      <Input
                        value={wizardData.partyB?.field || ""}
                        onChange={(e) => updatePartyField("partyB", "field", e.target.value)}
                        placeholder="如：device_id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>样本量</Label>
                      <Input
                        type="number"
                        value={wizardData.partyB?.sampleSize || 0}
                        onChange={(e) => updatePartyField("partyB", "sampleSize", parseInt(e.target.value) || 0)}
                        placeholder="样本数量"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Output Settings */}
            {!qualityCheckStep && currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-600" />输出设置
                </h3>
                <div className="space-y-2">
                  <Label>输出模式 <span className="text-red-500">*</span></Label>
                  <Select value={wizardData.outputMode} onValueChange={(v) => updateWizardField("outputMode", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择输出模式" />
                    </SelectTrigger>
                    <SelectContent>
                      {outputModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {wizardData.outputMode === "带标签输出" && (
                  <div className="space-y-2">
                    <Label>标签字段</Label>
                    <Input
                      value={wizardData.tagField || ""}
                      onChange={(e) => updateWizardField("tagField", e.target.value)}
                      placeholder="如：label_value, user_tag"
                    />
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
                  <p><strong>输出模式说明：</strong></p>
                  <p>• 带标签输出：返回交集及关联标签</p>
                  <p>• 仅统计：仅返回交集数量</p>
                  <p>• 交集元素：返回交集的具体元素</p>
                  <p>• 差集A-B：仅A中有B中没有的元素</p>
                  <p>• 差集B-A：仅B中有A中没有的元素</p>
                  <p>• 对称差集：A和B中不共有的元素</p>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {!qualityCheckStep && currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />确认配置
                </h3>
                <div className="space-y-3">
                  <Card className="border-gray-100">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">基本信息</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-500">名称：</span>{wizardData.name}</div>
                        <div><span className="text-gray-500">协议：</span>{wizardData.protocol}</div>
                        <div><span className="text-gray-500">Hashing：</span>{wizardData.hashing}</div>
                        {wizardData.description && <div className="col-span-2"><span className="text-gray-500">描述：</span>{wizardData.description}</div>}
                        {scheduleEnabled && <div className="col-span-2"><span className="text-gray-500">定时：</span>{scheduleConfig.type} {String(scheduleConfig.hour).padStart(2, "0")}:{String(scheduleConfig.minute).padStart(2, "0")}</div>}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-indigo-100">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-semibold text-indigo-600 uppercase">Party A</p>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-gray-500">名称：</span>{wizardData.partyA?.name}</div>
                          <div><span className="text-gray-500">数据源：</span>{wizardData.partyA?.dataSource}</div>
                          <div><span className="text-gray-500">字段：</span>{wizardData.partyA?.field}</div>
                          <div><span className="text-gray-500">样本量：</span>{(wizardData.partyA?.sampleSize || 0).toLocaleString()}</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-100">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-semibold text-blue-600 uppercase">Party B</p>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-gray-500">名称：</span>{wizardData.partyB?.name}</div>
                          <div><span className="text-gray-500">数据源：</span>{wizardData.partyB?.dataSource}</div>
                          <div><span className="text-gray-500">字段：</span>{wizardData.partyB?.field}</div>
                          <div><span className="text-gray-500">样本量：</span>{(wizardData.partyB?.sampleSize || 0).toLocaleString()}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card className="border-gray-100">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">输出设置</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-500">输出模式：</span>{wizardData.outputMode}</div>
                        {wizardData.outputMode === "带标签输出" && (
                          <div><span className="text-gray-500">标签字段：</span>{wizardData.tagField || "label_value"}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              {qualityCheckStep ? (
                <Button variant="outline" onClick={() => { setQualityCheckStep(false); setQualityResults(null); }}>
                  <ChevronLeft className="h-4 w-4 mr-1" />跳过检查
                </Button>
              ) : (
                currentStep > 0 && (
                  <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />上一步
                  </Button>
                )
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setWizardOpen(false)}>取消</Button>
              {qualityCheckStep ? (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => { setQualityCheckStep(false); setCurrentStep(0); }}
                >
                  下一步<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : currentStep < steps.length - 1 ? (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canProceed()}
                >
                  下一步<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleWizardSubmit}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {selectedItem ? "保存修改" : "创建任务"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-indigo-600" />
              结果预览 - {previewTask?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">显示前10条交集ID</p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Intersection ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(previewTask ? mockPreviewIds[previewTask.id] || [] : []).map((id, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-gray-500">{i + 1}</TableCell>
                      <TableCell className="text-xs font-mono">{id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rerun Dialog */}
      <Dialog open={rerunOpen} onOpenChange={setRerunOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-indigo-600" />
              重新执行任务
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              确定要重新执行任务 <strong>{rerunTask?.name}</strong> 吗？将创建一个新的待执行副本。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerunOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => rerunTask && handleRerun(rerunTask)}>
              <RotateCcw className="h-4 w-4 mr-1" />确认重新执行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              确定要删除任务 <strong>{selectedItem?.name}</strong> 吗？此操作不可撤销。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="PSI任务详情"
        data={getDetailData(selectedItem)}
        fields={detailFields}
        onEdit={() => {
          if (selectedItem) {
            setDrawerOpen(false);
            handleEdit(selectedItem);
          }
        }}
        onDelete={() => {
          if (selectedItem) {
            setDrawerOpen(false);
            handleDeletePrompt(selectedItem);
          }
        }}
      />

      {/* Export Dialog */}
      {exportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setExportOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-1">导出结果</h2>
            <p className="text-sm text-gray-500 mb-4">选择导出格式</p>
            <div className="space-y-2">
              {["csv", "json", "parquet", "xlsx"].map(fmt => (
                <div key={fmt} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${exportFormat === fmt ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setExportFormat(fmt)}>
                  <div className={`w-4 h-4 rounded-full border ${exportFormat === fmt ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`} />
                  <span className="text-sm font-medium uppercase">{fmt}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
              <Button onClick={() => setExportOpen(false)}>导出</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
