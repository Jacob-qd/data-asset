import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/lib/store";
import KPICard from "@/components/KPICard";
import DataTable from "@/components/DataTable";
import Drawer from "@/components/Drawer";
import StatusTag from "@/components/StatusTag";
import SearchFilter from "@/components/SearchFilter";
import ChartCard from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Package,
  DollarSign,
  Activity,
  Star,
  Search,
  Filter,
  LayoutGrid,
  Table2,
  ChevronRight,
  ChevronDown,
  Eye,
  PhoneCall,
  PhoneOff,
  TrendingUp,
  FileText,
  Award,
  UserCheck,
  Building2,
  MapPin,
  Code2,
  BarChart3,
  Layers,
  Wifi,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

/* ─── Types ─── */
interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  industry: string;
  region: string;
  developer: string;
  status: "success" | "warning" | "danger" | "info" | "disabled" | "processing";
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  callCount: number;
  description: string;
  updateTime: string;
  certificateNo: string;
  authChain: string[];
  rightsInfo: { ownership: string; usage: string; distribution: string };
  reviews: { reviewer: string; date: string; rating: number; comment: string }[];
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  time: string;
  pricingModel: string;
  specs: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CallRecord {
  id: string;
  time: string;
  status: "success" | "failure";
  duration: number;
  endpoint: string;
}

/* ─── ECharts type stub ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EChartsInstance = any;

/* ─── Mock Data ─── */
const CATEGORIES = ["全部", "API", "数据集", "报告", "模型", "服务"];

const SUB_CATEGORIES: Record<string, string[]> = {
  API: ["实时查询", "批量下载", "数据推送"],
  数据集: ["结构化数据", "非结构化数据", "时序数据"],
  报告: ["行业报告", "定制报告", "分析报表"],
  模型: ["评分模型", "预测模型", "分类模型"],
  服务: ["数据清洗", "数据标注", "数据脱敏"],
};

const productsData: Product[] = [
  {
    id: "DP-2024-001", name: "企业工商信息查询接口", category: "API", subCategory: "实时查询",
    industry: "金融", region: "全国", developer: "张伟", status: "success", price: 500, priceUnit: "/月",
    rating: 4.9, reviewCount: 234, callCount: 12345, description: "提供全国企业工商注册信息实时查询服务，支持多维度筛选。",
    updateTime: "2026-04-18", certificateNo: "CERT-2024-001-A",
    authChain: ["数据源方：国家市场监管总局", "加工方：数据科技有限公司", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "数据资产管理平台", usage: "授权使用", distribution: "不可转售" },
    reviews: [
      { reviewer: "李明", date: "2026-04-15", rating: 5, comment: "查询速度快，数据准确。" },
      { reviewer: "王芳", date: "2026-04-10", rating: 4, comment: "整体不错，希望能增加更多字段。" },
    ],
    transactions: [
      { id: "TR-202604150001", time: "2026-04-15 14:30", pricingModel: "包月", specs: "标准版", quantity: 1, unitPrice: 500, total: 500 },
      { id: "TR-202604100002", time: "2026-04-10 09:15", pricingModel: "包月", specs: "标准版", quantity: 1, unitPrice: 500, total: 500 },
    ],
  },
  {
    id: "DP-2024-002", name: "个人信用评分模型", category: "模型", subCategory: "评分模型",
    industry: "金融", region: "全国", developer: "刘洋", status: "success", price: 2000, priceUnit: "/月",
    rating: 4.8, reviewCount: 156, callCount: 8234, description: "基于多维度数据的个人信用评分模型，支持自定义权重配置。",
    updateTime: "2026-04-16", certificateNo: "CERT-2024-002-B",
    authChain: ["数据源方：中国人民银行征信中心", "模型方：智能科技有限公司", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "智能科技有限公司", usage: "授权调用", distribution: "仅限内部使用" },
    reviews: [
      { reviewer: "赵强", date: "2026-04-12", rating: 5, comment: "模型准确率高，对风控帮助很大。" },
      { reviewer: "孙丽", date: "2026-04-08", rating: 4, comment: "评分维度很全面。" },
    ],
    transactions: [
      { id: "TR-202604120003", time: "2026-04-12 11:20", pricingModel: "包月", specs: "企业版", quantity: 1, unitPrice: 2000, total: 2000 },
      { id: "TR-202604050004", time: "2026-04-05 16:45", pricingModel: "包月", specs: "企业版", quantity: 1, unitPrice: 2000, total: 2000 },
    ],
  },
  {
    id: "DP-2024-003", name: "金融行业分析报告", category: "报告", subCategory: "行业报告",
    industry: "金融", region: "华东", developer: "陈静", status: "success", price: 300, priceUnit: "/次",
    rating: 4.7, reviewCount: 89, callCount: 2156, description: "深度分析金融行业发展趋势，覆盖银行、保险、证券等子行业。",
    updateTime: "2026-04-14", certificateNo: "CERT-2024-003-C",
    authChain: ["数据来源：各大金融机构公开数据", "分析方：研究院", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "研究院", usage: "单次购买", distribution: "仅限购买者内部使用" },
    reviews: [
      { reviewer: "周涛", date: "2026-04-11", rating: 5, comment: "报告质量很高，数据详实。" },
      { reviewer: "吴敏", date: "2026-04-06", rating: 4, comment: "分析角度很独特。" },
    ],
    transactions: [
      { id: "TR-202604110005", time: "2026-04-11 10:00", pricingModel: "按次", specs: "PDF报告", quantity: 1, unitPrice: 300, total: 300 },
    ],
  },
  {
    id: "DP-2024-004", name: "数据脱敏处理服务", category: "服务", subCategory: "数据脱敏",
    industry: "科技", region: "全国", developer: "郑浩", status: "success", price: 100, priceUnit: "/万次",
    rating: 4.6, reviewCount: 67, callCount: 45678, description: "提供高效的数据脱敏处理服务，支持多种脱敏算法和自定义规则。",
    updateTime: "2026-04-17", certificateNo: "CERT-2024-004-D",
    authChain: ["技术方：安全科技有限公司", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "安全科技有限公司", usage: "按量计费", distribution: "无限制" },
    reviews: [
      { reviewer: "黄蕾", date: "2026-04-13", rating: 4, comment: "处理速度快，脱敏效果好。" },
    ],
    transactions: [
      { id: "TR-202604130006", time: "2026-04-13 15:20", pricingModel: "按量", specs: "标准脱敏", quantity: 50000, unitPrice: 0.001, total: 50 },
    ],
  },
  {
    id: "DP-2024-005", name: "交通流量预测模型", category: "模型", subCategory: "预测模型",
    industry: "交通", region: "华南", developer: "马超", status: "success", price: 5000, priceUnit: "/月",
    rating: 4.9, reviewCount: 45, callCount: 3456, description: "基于深度学习的路网交通流量预测模型，支持多时间粒度预测。",
    updateTime: "2026-04-19", certificateNo: "CERT-2024-005-E",
    authChain: ["数据方：交通运输局", "模型方：AI研究院", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "AI研究院", usage: "授权使用", distribution: "不可转售" },
    reviews: [
      { reviewer: "林峰", date: "2026-04-14", rating: 5, comment: "预测准确率很高，实用性强。" },
      { reviewer: "朱娜", date: "2026-04-09", rating: 5, comment: "非常好用的模型。" },
    ],
    transactions: [
      { id: "TR-202604140007", time: "2026-04-14 16:45", pricingModel: "包月", specs: "完整版", quantity: 1, unitPrice: 5000, total: 5000 },
    ],
  },
  {
    id: "DP-2024-006", name: "人口基础信息批量下载", category: "API", subCategory: "批量下载",
    industry: "政务", region: "全国", developer: "徐凯", status: "success", price: 1000, priceUnit: "/月",
    rating: 4.5, reviewCount: 178, callCount: 6789, description: "提供人口基础信息批量下载服务，支持多条件组合查询。",
    updateTime: "2026-04-13", certificateNo: "CERT-2024-006-F",
    authChain: ["数据方：国家统计局", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "国家统计局", usage: "授权使用", distribution: "需二次审批" },
    reviews: [
      { reviewer: "何婷", date: "2026-04-10", rating: 4, comment: "数据全面，下载稳定。" },
    ],
    transactions: [
      { id: "TR-202604100008", time: "2026-04-10 08:30", pricingModel: "包月", specs: "标准版", quantity: 1, unitPrice: 1000, total: 1000 },
    ],
  },
  {
    id: "DP-2024-007", name: "医疗健康档案查询服务", category: "API", subCategory: "实时查询",
    industry: "医疗", region: "华东", developer: "杨帆", status: "processing", price: 800, priceUnit: "/月",
    rating: 4.3, reviewCount: 56, callCount: 3456, description: "医疗健康档案跨机构查询服务，支持电子病历调阅。",
    updateTime: "2026-04-12", certificateNo: "CERT-2024-007-G",
    authChain: ["数据方：卫健委", "技术方：医疗科技", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "卫健委", usage: "授权查询", distribution: "不可转售" },
    reviews: [],
    transactions: [
      { id: "TR-202604090009", time: "2026-04-09 10:20", pricingModel: "包月", specs: "基础版", quantity: 1, unitPrice: 800, total: 800 },
    ],
  },
  {
    id: "DP-2024-008", name: "环境监测实时数据集", category: "数据集", subCategory: "时序数据",
    industry: "环保", region: "全国", developer: "高翔", status: "success", price: 2000, priceUnit: "/月",
    rating: 4.7, reviewCount: 34, callCount: 1234, description: "全国环境监测站点实时数据，包括AQI、水质、噪音等指标。",
    updateTime: "2026-04-20", certificateNo: "CERT-2024-008-H",
    authChain: ["数据方：生态环境部", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "生态环境部", usage: "授权使用", distribution: "注明出处" },
    reviews: [
      { reviewer: "谢芳", date: "2026-04-16", rating: 5, comment: "数据实时性很好。" },
    ],
    transactions: [
      { id: "TR-202604160010", time: "2026-04-16 13:00", pricingModel: "包月", specs: "实时版", quantity: 1, unitPrice: 2000, total: 2000 },
    ],
  },
  {
    id: "DP-2024-009", name: "供应链风险分析模型", category: "模型", subCategory: "评分模型",
    industry: "企业", region: "华东", developer: "曾伟", status: "warning", price: 3500, priceUnit: "/月",
    rating: 4.4, reviewCount: 23, callCount: 890, description: "基于企业多维数据的供应链风险分析模型。",
    updateTime: "2026-04-11", certificateNo: "CERT-2024-009-I",
    authChain: ["数据方：海关/税务", "模型方：风控科技", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "风控科技", usage: "授权使用", distribution: "不可转售" },
    reviews: [],
    transactions: [],
  },
  {
    id: "DP-2024-010", name: "教育资源共享数据集", category: "数据集", subCategory: "结构化数据",
    industry: "教育", region: "全国", developer: "唐丽", status: "success", price: 0, priceUnit: "",
    rating: 4.2, reviewCount: 312, callCount: 5678, description: "全国教育资源共享数据集，包含课程、教材、试题等。",
    updateTime: "2026-04-08", certificateNo: "CERT-2024-010-J",
    authChain: ["数据方：教育部", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "教育部", usage: "开放使用", distribution: "可转载" },
    reviews: [
      { reviewer: "宋明", date: "2026-04-05", rating: 4, comment: "免费数据集质量还不错。" },
    ],
    transactions: [
      { id: "TR-202604050011", time: "2026-04-05 10:00", pricingModel: "免费", specs: "开放版", quantity: 1, unitPrice: 0, total: 0 },
    ],
  },
  {
    id: "DP-2024-011", name: "消费行为分析服务", category: "服务", subCategory: "数据分析",
    industry: "零售", region: "华南", developer: "韩冰", status: "success", price: 1500, priceUnit: "/次",
    rating: 4.6, reviewCount: 78, callCount: 2345, description: "消费者行为深度分析服务，提供用户画像和购买意向预测。",
    updateTime: "2026-04-15", certificateNo: "CERT-2024-011-K",
    authChain: ["数据方：电商平台", "分析方：大数据公司", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "大数据公司", usage: "单次购买", distribution: "报告可内部分享" },
    reviews: [
      { reviewer: "许强", date: "2026-04-12", rating: 5, comment: "分析非常深入， actionable insights 很多。" },
    ],
    transactions: [
      { id: "TR-202604120012", time: "2026-04-12 09:30", pricingModel: "按次", specs: "深度分析", quantity: 1, unitPrice: 1500, total: 1500 },
    ],
  },
  {
    id: "DP-2024-012", name: "气象数据实时推送", category: "API", subCategory: "数据推送",
    industry: "气象", region: "全国", developer: "冯雷", status: "success", price: 600, priceUnit: "/月",
    rating: 4.5, reviewCount: 145, callCount: 8900, description: "全国气象数据实时推送服务，支持WebSocket长连接。",
    updateTime: "2026-04-17", certificateNo: "CERT-2024-012-L",
    authChain: ["数据方：气象局", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "气象局", usage: "授权使用", distribution: "不可转售" },
    reviews: [
      { reviewer: "董洋", date: "2026-04-14", rating: 4, comment: "推送及时，数据准确。" },
    ],
    transactions: [
      { id: "TR-202604140013", time: "2026-04-14 07:00", pricingModel: "包月", specs: "实时推送", quantity: 1, unitPrice: 600, total: 600 },
    ],
  },
  {
    id: "DP-2024-013", name: "工业设备故障预测", category: "模型", subCategory: "预测模型",
    industry: "制造", region: "华北", developer: "蒋文", status: "success", price: 8000, priceUnit: "/月",
    rating: 4.8, reviewCount: 19, callCount: 567, description: "基于IoT传感器数据的工业设备故障预测模型。",
    updateTime: "2026-04-19", certificateNo: "CERT-2024-013-M",
    authChain: ["数据方：制造企业", "模型方：工业智能", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "工业智能", usage: "授权使用", distribution: "按设备授权" },
    reviews: [
      { reviewer: "沈刚", date: "2026-04-16", rating: 5, comment: "预测准确率高，帮我们避免了一次重大停机。" },
    ],
    transactions: [
      { id: "TR-202604160014", time: "2026-04-16 11:00", pricingModel: "包月", specs: "企业版", quantity: 1, unitPrice: 8000, total: 8000 },
    ],
  },
  {
    id: "DP-2024-014", name: "城市人口热力分布", category: "数据集", subCategory: "时序数据",
    industry: "政务", region: "华东", developer: "蔡敏", status: "success", price: 1200, priceUnit: "/月",
    rating: 4.4, reviewCount: 67, callCount: 2345, description: "基于运营商数据的城市人口实时热力分布数据集。",
    updateTime: "2026-04-10", certificateNo: "CERT-2024-014-N",
    authChain: ["数据方：运营商", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "运营商", usage: "授权使用", distribution: "不可转售" },
    reviews: [
      { reviewer: "田亮", date: "2026-04-07", rating: 4, comment: "数据维度丰富。" },
    ],
    transactions: [
      { id: "TR-202604070015", time: "2026-04-07 14:00", pricingModel: "包月", specs: "城市版", quantity: 1, unitPrice: 1200, total: 1200 },
    ],
  },
  {
    id: "DP-2024-015", name: "舆情监测分析服务", category: "服务", subCategory: "数据标注",
    industry: "媒体", region: "全国", developer: "邓杰", status: "processing", price: 2500, priceUnit: "/月",
    rating: 4.7, reviewCount: 88, callCount: 3456, description: "全网舆情实时监测分析服务，支持情感分析和热点追踪。",
    updateTime: "2026-04-18", certificateNo: "CERT-2024-015-O",
    authChain: ["数据方：互联网", "技术方：舆情科技", "平台方：数据资产管理平台"],
    rightsInfo: { ownership: "舆情科技", usage: "授权使用", distribution: "不可转售" },
    reviews: [
      { reviewer: "曹颖", date: "2026-04-13", rating: 5, comment: "监测全面，预警及时。" },
    ],
    transactions: [
      { id: "TR-202604130016", time: "2026-04-13 10:00", pricingModel: "包月", specs: "全能版", quantity: 1, unitPrice: 2500, total: 2500 },
    ],
  },
];

const callRecordsData: CallRecord[] = [
  { id: "CL-001", time: "2026-04-20 10:30:15", status: "success", duration: 125, endpoint: "/api/v1/query" },
  { id: "CL-002", time: "2026-04-20 10:30:20", status: "success", duration: 98, endpoint: "/api/v1/query" },
  { id: "CL-003", time: "2026-04-20 10:30:45", status: "failure", duration: 0, endpoint: "/api/v1/batch" },
  { id: "CL-004", time: "2026-04-20 10:31:05", status: "success", duration: 210, endpoint: "/api/v1/score" },
  { id: "CL-005", time: "2026-04-20 10:31:30", status: "success", duration: 156, endpoint: "/api/v1/query" },
  { id: "CL-006", time: "2026-04-20 10:32:00", status: "failure", duration: 0, endpoint: "/api/v1/predict" },
  { id: "CL-007", time: "2026-04-20 10:32:15", status: "success", duration: 88, endpoint: "/api/v1/query" },
  { id: "CL-008", time: "2026-04-20 10:32:40", status: "success", duration: 134, endpoint: "/api/v1/score" },
  { id: "CL-009", time: "2026-04-20 10:33:00", status: "success", duration: 167, endpoint: "/api/v1/query" },
  { id: "CL-010", time: "2026-04-20 10:33:30", status: "failure", duration: 0, endpoint: "/api/v1/batch" },
];

/* ─── Revenue Chart Data ─── */
const revenueMonths = ["2026-01", "2026-02", "2026-03", "2026-04"];
const revenueSeries = [
  { name: "平台抽成", data: [15000, 16000, 17500, 18000], color: "#6366F1" },
  { name: "数据提供方", data: [42000, 45000, 48000, 50000], color: "#3B82F6" },
  { name: "技术服务方", data: [22000, 23000, 24000, 25000], color: "#06B6D4" },
  { name: "运营方", data: [8000, 8500, 9000, 9500], color: "#10B981" },
];

/* ─── Helpers ─── */
const categoryColors: Record<string, string> = {
  API: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  数据集: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  报告: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  模型: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  服务: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const categoryIcons: Record<string, typeof Code2> = {
  API: Wifi,
  数据集: Layers,
  报告: FileText,
  模型: BarChart3,
  服务: Code2,
};

/* ─── Stacked Area Chart Component ─── */
function RevenueChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<EChartsInstance>(null);
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    let disposed = false;
    const init = async () => {
      if (!chartRef.current) return;
      const echarts = await import("echarts");
      if (disposed) return;
      const inst = echarts.init(chartRef.current, undefined, { renderer: "canvas" });
      chartInstance.current = inst;

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } },
          backgroundColor: isDark ? "#1E293B" : "#fff",
          borderColor: isDark ? "#334155" : "#e2e8f0",
          textStyle: { color: isDark ? "#e2e8f0" : "#1e293b" },
        },
        legend: {
          data: revenueSeries.map((s) => s.name),
          bottom: 0,
          textStyle: { color: isDark ? "#94a3b8" : "#475569" },
        },
        grid: { left: 12, right: 16, top: 24, bottom: 40, containLabel: true },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: revenueMonths,
          axisLine: { lineStyle: { color: isDark ? "#334155" : "#e2e8f0" } },
          axisLabel: { color: isDark ? "#94a3b8" : "#64748b" },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: isDark ? "#334155" : "#f1f5f9" } },
          axisLabel: { color: isDark ? "#94a3b8" : "#64748b", formatter: (v: number) => `¥${(v / 10000).toFixed(0)}万` },
        },
        series: revenueSeries.map((s) => ({
          name: s.name,
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: { width: 2, color: s.color },
          showSymbol: false,
          areaStyle: { opacity: 0.25, color: s.color },
          itemStyle: { color: s.color },
          emphasis: { focus: "series" },
          data: s.data,
        })),
        animationDuration: 1000,
        animationEasing: "cubicOut" as const,
      };

      inst.setOption(option);
      const handleResize = () => inst.resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        inst.dispose();
      };
    };

    const cleanup = init();
    return () => {
      disposed = true;
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
      void cleanup;
    };
  }, [isDark]);

  return <div ref={chartRef} style={{ width: "100%", height: "280px" }} />;
}

/* ─── Category Filter Sidebar ─── */
function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  selectedSubCategory,
  onSelectSubCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedSubCategory: string;
  onSelectSubCategory: (sub: string) => void;
}) {
  const getCategoryCount = (cat: string) =>
    cat === "全部"
      ? productsData.length
      : productsData.filter((p) => p.category === cat).length;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-md p-4 w-52 flex-shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">产品分类</h3>
      </div>
      <div className="space-y-1">
        {CATEGORIES.map((cat) => (
          <div key={cat}>
            <button
              onClick={() => {
                onSelectCategory(cat);
                onSelectSubCategory("");
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                selectedCategory === cat
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <span>{cat}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                selectedCategory === cat
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              )}>
                {getCategoryCount(cat)}
              </span>
            </button>
            {/* Sub-categories */}
            {cat !== "全部" && selectedCategory === cat && SUB_CATEGORIES[cat] && (
              <div className="ml-4 mt-1 space-y-0.5">
                {SUB_CATEGORIES[cat].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => onSelectSubCategory(sub === selectedSubCategory ? "" : sub)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                      selectedSubCategory === sub
                        ? "text-primary-600 dark:text-primary-400 font-medium"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const Icon = categoryIcons[product.category] || Package;
  const statusMap: Record<string, string> = {
    success: "在售", warning: "审核中", danger: "已下架", info: "测试中",
    disabled: "已停用", processing: "审核中",
  };
  const statusTypeMap: Record<string, "success" | "warning" | "danger" | "processing"> = {
    success: "success", warning: "warning", danger: "danger", info: "processing",
    disabled: "danger", processing: "processing",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] overflow-hidden",
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
      )}
    >
      {/* Banner */}
      <div className="relative h-16 bg-gradient-to-r from-primary-500/80 to-primary-600/80 flex items-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
        <Icon className="w-8 h-8 text-white/90 relative z-10" />
        <span className="absolute right-3 top-2 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
          {product.subCategory}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
              {product.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-8">
              {product.description}
            </p>
          </div>
          <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", categoryColors[product.category])}>
            {product.category}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.reviewCount})</span>
          </div>
          <div className="text-base font-bold text-primary-600 dark:text-primary-400 font-mono">
            {product.price === 0 ? "免费" : `¥${product.price.toLocaleString()}${product.priceUnit}`}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {product.callCount.toLocaleString()}次调用
          </span>
          <StatusTag status={statusTypeMap[product.status]} text={statusMap[product.status]} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Product Detail Drawer ─── */
function ProductDetailDrawer({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!product) return null;
  const [activeTab, setActiveTab] = useState("info");
  const statusMap: Record<string, string> = {
    success: "在售", warning: "审核中", danger: "已下架", info: "测试中",
    disabled: "已停用", processing: "审核中",
  };

  return (
    <Drawer open={open} onClose={onClose} title="产品详情" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">ID: {product.id}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", categoryColors[product.category])}>
                {product.category}
              </span>
              <StatusTag status={product.status} text={statusMap[product.status]} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-[#334155]">
          <div className="flex gap-0">
            {[
              { key: "info", label: "基本信息" },
              { key: "register", label: "登记信息" },
              { key: "rights", label: "三权信息" },
              { key: "reviews", label: "评价记录" },
              { key: "transactions", label: "交易记录" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 py-2 text-sm border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<Building2 className="w-4 h-4" />} label="所属行业" value={product.industry} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="覆盖区域" value={product.region} />
                <InfoItem icon={<UserCheck className="w-4 h-4" />} label="开发者" value={product.developer} />
                <InfoItem icon={<Star className="w-4 h-4" />} label="评分" value={`${product.rating} (${product.reviewCount}条评价)`} />
                <InfoItem icon={<Activity className="w-4 h-4" />} label="调用次数" value={product.callCount.toLocaleString()} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="更新时间" value={product.updateTime} />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-xs text-slate-500 dark:text-slate-400">产品描述</span>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{product.description}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">产品定价</span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono">
                  {product.price === 0 ? "免费" : `¥${product.price.toLocaleString()}${product.priceUnit}`}
                </span>
              </div>
            </motion.div>
          )}

          {activeTab === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Certificate */}
              <div className="p-4 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg bg-primary-50/50 dark:bg-primary-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">登记证书</span>
                </div>
                <div className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
                  {product.certificateNo}
                </div>
                <div className="text-xs text-slate-500 mt-1">登记时间: 2024-01-15</div>
              </div>

              {/* Authorization Chain */}
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">授权链路</span>
                <div className="space-y-2">
                  {product.authChain.map((auth, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-600">{i + 1}</span>
                      </div>
                      {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                      <span className="text-sm text-slate-600 dark:text-slate-300">{auth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "rights" && (
            <motion.div
              key="rights"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <RightsCard
                title="所有权"
                desc="数据资源的所有权归属"
                value={product.rightsInfo.ownership}
                icon={<Building2 className="w-5 h-5" />}
                color="text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
              />
              <RightsCard
                title="使用权"
                desc="数据资源的使用授权范围"
                value={product.rightsInfo.usage}
                icon={<Eye className="w-5 h-5" />}
                color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
              />
              <RightsCard
                title="经营权"
                desc="数据资源的经营分发权限"
                value={product.rightsInfo.distribution}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
              />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {product.reviews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">暂无评价</p>
              ) : (
                product.reviews.map((review, i) => (
                  <div key={i} className="p-3 border border-slate-100 dark:border-[#334155] rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{review.reviewer}</span>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star
                          key={j}
                          className={cn(
                            "w-3 h-3",
                            j < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{review.comment}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard label="交易笔数" value={String(product.transactions.length)} />
                <SummaryCard label="总交易量" value={`¥${product.transactions.reduce((s, t) => s + t.total, 0).toLocaleString()}`} />
                <SummaryCard label="最近交易" value={product.transactions[0]?.time.split(" ")[0] ?? "-"} />
              </div>
              {/* List */}
              <div className="space-y-2">
                {product.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 border border-slate-100 dark:border-[#334155] rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">{tx.id}</span>
                      <span className="text-xs text-slate-400">{tx.time}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                      <div><span className="text-slate-400">计费模式</span><div className="text-slate-700 dark:text-slate-200">{tx.pricingModel}</div></div>
                      <div><span className="text-slate-400">规格</span><div className="text-slate-700 dark:text-slate-200">{tx.specs}</div></div>
                      <div><span className="text-slate-400">数量</span><div className="text-slate-700 dark:text-slate-200">{tx.quantity.toLocaleString()}</div></div>
                      <div className="text-right"><span className="text-slate-400">总价</span><div className="font-mono font-medium text-primary-600">¥{tx.total.toLocaleString()}</div></div>
                    </div>
                  </div>
                ))}
                {product.transactions.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">暂无交易记录</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">{icon}</span>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-slate-700 dark:text-slate-200 font-medium">{value}</div>
      </div>
    </div>
  );
}

function RightsCard({ title, desc, value, icon, color }: { title: string; desc: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-4 border border-slate-100 dark:border-[#334155] rounded-lg">
      <div className="flex items-center gap-2">
        <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          {icon}
        </span>
        <div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</div>
          <div className="text-xs text-slate-400">{desc}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded">
        {value}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono mt-1">{value}</div>
    </div>
  );
}

/* ─── Revenue Calculation Section ─── */
function RevenueSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue Calculation */}
      <ChartCard title="收益计算结果" actions={<span className="text-xs text-slate-400">本月</span>}>
        <div className="space-y-4">
          {/* Rule config */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">计费规则配置</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400">规则名称</span><div className="text-slate-700 dark:text-slate-200">按调用量阶梯计费</div></div>
              <div><span className="text-slate-400">计费周期</span><div className="text-slate-700 dark:text-slate-200">自然月</div></div>
              <div><span className="text-slate-400">阶梯1</span><div className="text-slate-700 dark:text-slate-200">0-1万: ¥0.01/次</div></div>
              <div><span className="text-slate-400">阶梯2</span><div className="text-slate-700 dark:text-slate-200">1万+: ¥0.008/次</div></div>
            </div>
          </div>
          {/* Calculation results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">本月调用量</span>
              <span className="font-mono font-medium">45,678次</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">阶梯1费用</span>
              <span className="font-mono">¥10,000</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">阶梯2费用</span>
              <span className="font-mono">¥285.42</span>
            </div>
            <div className="border-t border-slate-100 dark:border-[#334155] pt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">本月总收益</span>
              <span className="text-lg font-bold font-mono text-primary-600">¥10,285</span>
            </div>
          </div>
        </div>
      </ChartCard>

      {/* Revenue Allocation */}
      <ChartCard title="收益分配结果" actions={<span className="text-xs text-slate-400">本月</span>}>
        <div className="space-y-4">
          {/* Allocation rules */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "平台", ratio: "15%", color: "bg-[#6366F1]" },
              { label: "数据方", ratio: "50%", color: "bg-[#3B82F6]" },
              { label: "技术方", ratio: "25%", color: "bg-[#06B6D4]" },
              { label: "运营方", ratio: "10%", color: "bg-[#10B981]" },
            ].map((item) => (
              <div key={item.label} className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800">
                <div className={cn("w-3 h-3 rounded-full mx-auto mb-1", item.color)} />
                <div className="text-xs text-slate-600 dark:text-slate-300">{item.label}</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{item.ratio}</div>
              </div>
            ))}
          </div>
          {/* Allocation detail */}
          <div className="space-y-2">
            {[
              { name: "平台抽成", amount: "¥1,543", pct: "15%", color: "text-[#6366F1]" },
              { name: "数据提供方", amount: "¥5,143", pct: "50%", color: "text-[#3B82F6]" },
              { name: "技术服务方", amount: "¥2,571", pct: "25%", color: "text-[#06B6D4]" },
              { name: "运营方", amount: "¥1,029", pct: "10%", color: "text-[#10B981]" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", item.color)}>{item.name}</span>
                  <span className="text-xs text-slate-400">{item.pct}</span>
                </div>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Stacked Area Chart */}
      <ChartCard title="收益趋势分析" className="lg:col-span-2">
        <RevenueChart />
      </ChartCard>
    </div>
  );
}

/* ─── Call Records Section ─── */
function CallRecordsSection() {
  const successCount = callRecordsData.filter((r) => r.status === "success").length;
  const failureCount = callRecordsData.filter((r) => r.status === "failure").length;
  const successRate = ((successCount / callRecordsData.length) * 100).toFixed(1);

  const columns = [
    { key: "id", title: "记录编号", width: "110px", render: (row: CallRecord) => <span className="font-mono text-xs text-gray-500">{row.id}</span> },
    { key: "time", title: "调用时间", width: "150px" },
    { key: "endpoint", title: "接口路径" },
    { key: "duration", title: "耗时(ms)", width: "90px", render: (row: CallRecord) => <span className="font-mono">{row.duration > 0 ? row.duration : "-"}</span> },
    {
      key: "status",
      title: "状态",
      width: "80px",
      render: (row: CallRecord) =>
        row.status === "success" ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> 成功
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <X className="w-3.5 h-3.5" /> 失败
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1E293B] rounded-lg shadow-md">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">成功调用</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">{successCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1E293B] rounded-lg shadow-md">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <PhoneOff className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">失败调用</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">{failureCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1E293B] rounded-lg shadow-md">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">成功率</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">{successRate}%</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={callRecordsData} rowKey={(row) => row.id} pagination pageSize={5} />
    </div>
  );
}

/* ─── Main Component ─── */
export default function DataProducts() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabFilter, setTabFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"products" | "revenue" | "calls">("products");

  const filteredProducts = productsData.filter((p) => {
    const matchCategory = selectedCategory === "全部" || p.category === selectedCategory;
    const matchSub = !selectedSubCategory || p.subCategory === selectedSubCategory;
    const matchTab = tabFilter === "all"
      ? true
      : tabFilter === "active"
        ? p.status === "success"
        : tabFilter === "inactive"
          ? p.status === "disabled" || p.status === "danger"
          : tabFilter === "review"
            ? p.status === "processing" || p.status === "warning"
            : true;
    const matchSearch = !searchQuery || p.name.includes(searchQuery) || p.id.includes(searchQuery) || p.industry.includes(searchQuery);
    return matchCategory && matchSub && matchTab && matchSearch;
  });

  const activeCount = productsData.filter((p) => p.status === "success").length;
  const totalTransactions = productsData.reduce((s, p) => s + p.transactions.length, 0);
  const totalRevenue = productsData.reduce((s, p) => s + p.transactions.reduce((ts, t) => ts + t.total, 0), 0);

  const tableColumns = [
    {
      key: "name", title: "产品名称",
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", categoryColors[row.category])}>
            {row.category}
          </span>
        </div>
      ),
    },
    { key: "subCategory", title: "子分类", width: "100px" },
    {
      key: "price", title: "价格", width: "120px",
      render: (row: Product) => (
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {row.price === 0 ? "免费" : `¥${row.price.toLocaleString()}${row.priceUnit}`}
        </span>
      ),
    },
    {
      key: "callCount", title: "调用量", width: "100px",
      render: (row: Product) => <span className="font-mono">{row.callCount.toLocaleString()}</span>,
    },
    {
      key: "rating", title: "评分", width: "90px",
      render: (row: Product) => (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm">{row.rating}</span>
        </div>
      ),
    },
    {
      key: "status", title: "状态", width: "90px",
      render: (row: Product) => {
        const sm: Record<string, string> = { success: "在售", warning: "审核中", danger: "已下架", info: "测试中", disabled: "已停用", processing: "审核中" };
        const st: Record<string, "success" | "warning" | "danger" | "processing"> = { success: "success", warning: "warning", danger: "danger", info: "processing", disabled: "danger", processing: "processing" };
        return <StatusTag status={st[row.status]} text={sm[row.status]} />;
      },
    },
    { key: "updateTime", title: "更新时间", width: "110px", render: (row: Product) => <span className="text-xs text-slate-500">{row.updateTime}</span> },
  ];

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">数据产品管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理 {productsData.length} 个数据产品，累计交易 {totalTransactions} 笔</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-9 gap-1.5 bg-primary-500 hover:bg-primary-600 text-white">
            <PlusIcon /> 新增产品
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <DownloadIcon /> 导出
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="产品总数"
          value={productsData.length}
          change="15.2% 较上月"
          changeType="up"
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          sparklineData={[820, 932, 901, 1034, 1090, 1130, 1200, 1180, 1210, 1256]}
          sparklineColor="#3B82F6"
          delay={0}
        />
        <KPICard
          title="活跃产品"
          value={activeCount}
          change="10.5% 较上月"
          changeType="up"
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          sparklineData={[700, 720, 710, 750, 780, 800, 820, 810, 840, 876]}
          sparklineColor="#10B981"
          delay={80}
        />
        <KPICard
          title="累计交易"
          value={totalTransactions}
          change="28.3% 较上月"
          changeType="up"
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-cyan-50 dark:bg-cyan-900/20"
          iconColor="text-cyan-600 dark:text-cyan-400"
          sparklineData={[120, 135, 128, 150, 165, 172, 180, 178, 185, 192]}
          sparklineColor="#06B6D4"
          delay={160}
        />
        <KPICard
          title="总收益（万元）"
          value={(totalRevenue / 10000).toFixed(2)}
          change="18.7% 较上月"
          changeType="up"
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
          sparklineData={[45, 48, 52, 50, 55, 58, 62, 60, 64, 68]}
          sparklineColor="#F59E0B"
          delay={240}
        />
      </div>

      {/* Section Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#334155]">
        <div className="flex gap-0">
          {[
            { key: "products", label: "产品列表" },
            { key: "revenue", label: "收益管理" },
            { key: "calls", label: "调用记录" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key as "products" | "revenue" | "calls")}
              className={cn(
                "px-4 py-2.5 text-sm border-b-2 transition-colors",
                activeSection === s.key
                  ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      {activeSection === "products" && (
        <div className="flex gap-4">
          {/* Left: Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={setSelectedSubCategory}
          />

          {/* Right: Product List */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Search + View Toggle + Tabs */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索产品名称、编号、行业..."
                    className="w-full h-9 pl-9 pr-4 text-sm rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={tabFilter} onValueChange={setTabFilter}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs px-3">全部 ({productsData.length})</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs px-3">在售 ({activeCount})</TabsTrigger>
                    <TabsTrigger value="inactive" className="text-xs px-3">下架 ({productsData.filter(p => p.status === "disabled" || p.status === "danger").length})</TabsTrigger>
                    <TabsTrigger value="review" className="text-xs px-3">审核中 ({productsData.filter(p => p.status === "processing" || p.status === "warning").length})</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 ml-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400"
                    )}
                  >
                    <Table2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid / Table */}
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DataTable
                    columns={tableColumns}
                    data={filteredProducts}
                    rowKey={(row) => row.id}
                    onRowClick={handleProductClick}
                    pagination
                    pageSize={8}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">未找到符合条件的产品</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revenue Section */}
      {activeSection === "revenue" && <RevenueSection />}

      {/* Call Records Section */}
      {activeSection === "calls" && <CallRecordsSection />}

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedProduct(null); }}
      />
    </div>
  );
}

/* ─── Simple icon helpers ─── */
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
