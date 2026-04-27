import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Database,
  FileText,
  Layers,
  HardDrive,
  MoreHorizontal,
  Eye,
  Filter,
  X,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Clock,
  UserCircle,
  Globe,
  Building,
  Tag,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  PauseCircle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Drawer from "@/components/Drawer";
import { cn } from "@/lib/utils";

/* ──────────────────────── types ──────────────────────── */

interface TreeNode {
  id: string;
  label: string;
  count: number;
  children?: TreeNode[];
}

interface Resource {
  id: string;
  name: string;
  description: string;
  catalogNumber: string;
  type: string;
  theme: string;
  dataVolume: string;
  updateFrequency: string;
  updateTime: string;
  status: "normal" | "abnormal" | "paused";
  owner: string;
  ownerAvatar?: string;
  format: string;
  region: string;
  industry: string;
  source: string;
  registerDate: string;
  updateCycle: string;
  rightsInfo: string;
  dbType: string;
  scale: string;
}

/* ──────────────────────── mock data ──────────────────────── */

const treeData: TreeNode[] = [
  {
    id: "theme",
    label: "按主题域",
    count: 2847,
    children: [
      {
        id: "finance",
        label: "金融主题",
        count: 486,
        children: [
          { id: "bank-credit", label: "银行信贷数据", count: 124 },
          { id: "insurance", label: "保险理赔数据", count: 98 },
          { id: "securities", label: "证券交易数据", count: 156 },
          { id: "payment", label: "支付结算数据", count: 108 },
        ],
      },
      {
        id: "gov",
        label: "政务主题",
        count: 672,
        children: [
          { id: "population", label: "人口基础信息", count: 234 },
          { id: "enterprise", label: "企业登记注册", count: 189 },
          { id: "penalty", label: "行政处罚记录", count: 145 },
          { id: "license", label: "行政许可信息", count: 104 },
        ],
      },
      {
        id: "medical",
        label: "医疗主题",
        count: 423,
        children: [
          { id: "health-record", label: "电子健康档案", count: 178 },
          { id: "medical-resource", label: "医疗资源数据", count: 124 },
          { id: "insurance-settle", label: "医保结算数据", count: 121 },
        ],
      },
      {
        id: "transport",
        label: "交通主题",
        count: 356,
        children: [
          { id: "road-flow", label: "道路流量数据", count: 156 },
          { id: "public-transport", label: "公共交通数据", count: 112 },
          { id: "logistics", label: "物流运输数据", count: 88 },
        ],
      },
      {
        id: "education",
        label: "教育主题",
        count: 298,
        children: [
          { id: "student-record", label: "学籍学历数据", count: 156 },
          { id: "edu-resource", label: "教育资源数据", count: 89 },
          { id: "research", label: "科研论文数据", count: 53 },
        ],
      },
      { id: "environment", label: "环境主题", count: 245 },
      { id: "energy", label: "能源主题", count: 189 },
      { id: "agriculture", label: "农业主题", count: 178 },
    ],
  },
  {
    id: "asset-type",
    label: "按资产类型",
    count: 2847,
    children: [
      { id: "raw", label: "原始数据", count: 1234 },
      { id: "cleaned", label: "清洗数据", count: 876 },
      { id: "indicator", label: "指标数据", count: 423 },
      { id: "tag", label: "标签数据", count: 189 },
      { id: "model", label: "模型数据", count: 125 },
    ],
  },
  {
    id: "data-source",
    label: "按数据来源",
    count: 2847,
    children: [
      { id: "db-connect", label: "数据库接入", count: 1567 },
      { id: "api", label: "API接口", count: 456 },
      { id: "file", label: "文件上传", count: 389 },
      { id: "realtime", label: "实时采集", count: 235 },
      { id: "purchase", label: "第三方采购", count: 120 },
    ],
  },
];

const resources: Resource[] = [
  {
    id: "1",
    name: "企业工商信息库",
    description: "全国企业工商登记注册信息，包含企业基本信息、股东信息、变更记录等",
    catalogNumber: "RES-2024-0001",
    type: "原始数据",
    theme: "政务",
    dataVolume: "2.3亿条 / 450GB",
    updateFrequency: "日",
    updateTime: "2026-04-15 02:00",
    status: "normal",
    owner: "张三",
    format: "MySQL",
    region: "全国",
    industry: "政务",
    source: "国家市场监督管理总局",
    registerDate: "2024-01-15",
    updateCycle: "每日凌晨2:00",
    rightsInfo: "持有权: 平台方 | 加工权: 授权方 | 产品经营权: 平台方",
    dbType: "MySQL 8.0",
    scale: "2.3亿条记录",
  },
  {
    id: "2",
    name: "个人信用评分模型",
    description: "基于多维度数据的个人信用评估模型输出结果",
    catalogNumber: "RES-2024-0002",
    type: "模型数据",
    theme: "金融",
    dataVolume: "1.2亿条 / 120GB",
    updateFrequency: "周",
    updateTime: "2026-04-14 06:00",
    status: "normal",
    owner: "李四",
    format: "PostgreSQL",
    region: "全国",
    industry: "金融",
    source: "征信机构",
    registerDate: "2024-02-20",
    updateCycle: "每周一 06:00",
    rightsInfo: "持有权: 合作方 | 加工权: 平台方 | 产品经营权: 授权方",
    dbType: "PostgreSQL 15",
    scale: "1.2亿条记录",
  },
  {
    id: "3",
    name: "交通流量实时数据",
    description: "全国主要城市道路实时交通流量监测数据",
    catalogNumber: "RES-2024-0003",
    type: "原始数据",
    theme: "交通",
    dataVolume: "5000万条 / 200GB",
    updateFrequency: "实时",
    updateTime: "2026-04-15 14:30",
    status: "normal",
    owner: "王五",
    format: "Kafka",
    region: "全国重点城市",
    industry: "交通",
    source: "交通运输部",
    registerDate: "2024-03-01",
    updateCycle: "实时流式",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "Kafka + Flink",
    scale: "日均5000万条",
  },
  {
    id: "4",
    name: "医疗健康档案库",
    description: "居民电子健康档案数据，包含诊疗记录、检查报告、用药记录",
    catalogNumber: "RES-2024-0004",
    type: "原始数据",
    theme: "医疗",
    dataVolume: "8000万条 / 1.2TB",
    updateFrequency: "日",
    updateTime: "2026-04-15 01:00",
    status: "normal",
    owner: "赵六",
    format: "Oracle",
    region: "华东地区",
    industry: "医疗",
    source: "卫健委",
    registerDate: "2024-01-28",
    updateCycle: "每日凌晨1:00",
    rightsInfo: "持有权: 合作方 | 加工权: 授权方 | 产品经营权: 平台方",
    dbType: "Oracle 19c",
    scale: "8000万条记录",
  },
  {
    id: "5",
    name: "教育资源共享数据",
    description: "教育资源均衡配置监测数据，包含学校、师资、课程等信息",
    catalogNumber: "RES-2024-0005",
    type: "清洗数据",
    theme: "教育",
    dataVolume: "1200万条 / 80GB",
    updateFrequency: "周",
    updateTime: "2026-04-13 08:00",
    status: "normal",
    owner: "钱七",
    format: "MySQL",
    region: "全国",
    industry: "教育",
    source: "教育部",
    registerDate: "2024-04-10",
    updateCycle: "每周一 08:00",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "MySQL 8.0",
    scale: "1200万条记录",
  },
  {
    id: "6",
    name: "环境监测数据集",
    description: "全国重点城市空气质量、水质、噪声等环境监测数据",
    catalogNumber: "RES-2024-0006",
    type: "原始数据",
    theme: "环境",
    dataVolume: "3500万条 / 300GB",
    updateFrequency: "小时",
    updateTime: "2026-04-15 13:00",
    status: "abnormal",
    owner: "孙八",
    format: "API",
    region: "全国重点城市",
    industry: "环保",
    source: "生态环境部",
    registerDate: "2024-02-05",
    updateCycle: "每小时",
    rightsInfo: "持有权: 平台方 | 加工权: 授权方 | 产品经营权: 授权方",
    dbType: "REST API",
    scale: "日均3500万条",
  },
  {
    id: "7",
    name: "社保缴纳记录",
    description: "城镇职工社会保险缴纳记录，包含养老、医疗、失业、工伤、生育",
    catalogNumber: "RES-2024-0007",
    type: "原始数据",
    theme: "政务",
    dataVolume: "1.8亿条 / 600GB",
    updateFrequency: "日",
    updateTime: "2026-04-15 02:30",
    status: "normal",
    owner: "周九",
    format: "Oracle",
    region: "全国",
    industry: "政务",
    source: "人力资源和社会保障部",
    registerDate: "2024-01-20",
    updateCycle: "每日凌晨2:30",
    rightsInfo: "持有权: 合作方 | 加工权: 授权方 | 产品经营权: 平台方",
    dbType: "Oracle 19c",
    scale: "1.8亿条记录",
  },
  {
    id: "8",
    name: "金融风控指标集",
    description: "金融机构风控核心指标数据，包含信用风险、市场风险、操作风险指标",
    catalogNumber: "RES-2024-0008",
    type: "指标数据",
    theme: "金融",
    dataVolume: "500万条 / 50GB",
    updateFrequency: "小时",
    updateTime: "2026-04-15 14:00",
    status: "normal",
    owner: "吴十",
    format: "PostgreSQL",
    region: "全国",
    industry: "金融",
    source: "银保监会",
    registerDate: "2024-03-15",
    updateCycle: "每小时",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "PostgreSQL 15",
    scale: "500万条记录",
  },
  {
    id: "9",
    name: "物流运输轨迹",
    description: "全国物流运输轨迹追踪数据，包含公路、铁路、航空运输",
    catalogNumber: "RES-2024-0009",
    type: "原始数据",
    theme: "交通",
    dataVolume: "8000万条 / 800GB",
    updateFrequency: "实时",
    updateTime: "2026-04-15 14:32",
    status: "normal",
    owner: "郑一",
    format: "Kafka",
    region: "全国",
    industry: "交通",
    source: "物流行业协会",
    registerDate: "2024-05-01",
    updateCycle: "实时流式",
    rightsInfo: "持有权: 合作方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "Kafka + HBase",
    scale: "日均8000万条",
  },
  {
    id: "10",
    name: "科研论文数据集",
    description: "中英文科研论文元数据，包含标题、作者、摘要、关键词、引用关系",
    catalogNumber: "RES-2024-0010",
    type: "标签数据",
    theme: "教育",
    dataVolume: "200万条 / 30GB",
    updateFrequency: "月",
    updateTime: "2026-04-01 10:00",
    status: "normal",
    owner: "王二",
    format: "JSON",
    region: "全国",
    industry: "教育",
    source: "知网/万方",
    registerDate: "2024-06-12",
    updateCycle: "每月1日 10:00",
    rightsInfo: "持有权: 第三方 | 加工权: 平台方 | 产品经营权: 授权方",
    dbType: "Elasticsearch",
    scale: "200万条记录",
  },
  {
    id: "11",
    name: "电力能耗监测数据",
    description: "全国工商业电力能耗实时监测数据",
    catalogNumber: "RES-2024-0011",
    type: "原始数据",
    theme: "能源",
    dataVolume: "1.5亿条 / 500GB",
    updateFrequency: "实时",
    updateTime: "2026-04-15 14:35",
    status: "normal",
    owner: "陈三",
    format: "IoT",
    region: "全国",
    industry: "能源",
    source: "国家电网",
    registerDate: "2024-02-18",
    updateCycle: "实时流式",
    rightsInfo: "持有权: 合作方 | 加工权: 授权方 | 产品经营权: 平台方",
    dbType: "TDengine",
    scale: "日均1.5亿条",
  },
  {
    id: "12",
    name: "农产品溯源数据",
    description: "主要农产品从种植到销售的全链条溯源数据",
    catalogNumber: "RES-2024-0012",
    type: "清洗数据",
    theme: "农业",
    dataVolume: "3000万条 / 200GB",
    updateFrequency: "日",
    updateTime: "2026-04-15 03:00",
    status: "normal",
    owner: "林四",
    format: "MySQL",
    region: "全国",
    industry: "农业",
    source: "农业农村部",
    registerDate: "2024-03-22",
    updateCycle: "每日凌晨3:00",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "MySQL 8.0",
    scale: "3000万条记录",
  },
  {
    id: "13",
    name: "司法判决文书库",
    description: "全国法院公开判决文书数据，包含民事、刑事、行政案件",
    catalogNumber: "RES-2024-0013",
    type: "原始数据",
    theme: "政务",
    dataVolume: "6000万条 / 400GB",
    updateFrequency: "周",
    updateTime: "2026-04-14 09:00",
    status: "normal",
    owner: "黄五",
    format: "PostgreSQL",
    region: "全国",
    industry: "政务",
    source: "最高人民法院",
    registerDate: "2024-01-08",
    updateCycle: "每周一 09:00",
    rightsInfo: "持有权: 平台方 | 加工权: 授权方 | 产品经营权: 平台方",
    dbType: "PostgreSQL 15",
    scale: "6000万条记录",
  },
  {
    id: "14",
    name: "房价监测数据集",
    description: "全国城市商品房价格监测数据，包含新房、二手房价格",
    catalogNumber: "RES-2024-0014",
    type: "指标数据",
    theme: "金融",
    dataVolume: "800万条 / 60GB",
    updateFrequency: "周",
    updateTime: "2026-04-14 12:00",
    status: "normal",
    owner: "刘六",
    format: "MySQL",
    region: "全国",
    industry: "金融",
    source: "住建部",
    registerDate: "2024-04-01",
    updateCycle: "每周一 12:00",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 授权方",
    dbType: "MySQL 8.0",
    scale: "800万条记录",
  },
  {
    id: "15",
    name: "气象观测数据集",
    description: "全国气象站观测数据，包含温度、湿度、降水、风速等",
    catalogNumber: "RES-2024-0015",
    type: "原始数据",
    theme: "环境",
    dataVolume: "5亿条 / 1.5TB",
    updateFrequency: "小时",
    updateTime: "2026-04-15 14:00",
    status: "normal",
    owner: "赵七",
    format: "CSV",
    region: "全国",
    industry: "环保",
    source: "气象局",
    registerDate: "2024-01-25",
    updateCycle: "每小时",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "HDFS + Hive",
    scale: "5亿条记录",
  },
  {
    id: "16",
    name: "知识产权专利库",
    description: "中国及全球主要国家专利数据，包含发明、实用新型、外观设计",
    catalogNumber: "RES-2024-0016",
    type: "标签数据",
    theme: "政务",
    dataVolume: "1.5亿条 / 350GB",
    updateFrequency: "周",
    updateTime: "2026-04-14 07:00",
    status: "normal",
    owner: "孙八",
    format: "JSON",
    region: "全球",
    industry: "政务",
    source: "国家知识产权局",
    registerDate: "2024-02-28",
    updateCycle: "每周一 07:00",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "Elasticsearch",
    scale: "1.5亿条记录",
  },
  {
    id: "17",
    name: "网约车运营数据",
    description: "网约车平台运营数据，包含订单、轨迹、司机、乘客信息",
    catalogNumber: "RES-2024-0017",
    type: "原始数据",
    theme: "交通",
    dataVolume: "1亿条 / 600GB",
    updateFrequency: "日",
    updateTime: "2026-04-15 04:00",
    status: "paused",
    owner: "周九",
    format: "HBase",
    region: "全国重点城市",
    industry: "交通",
    source: "交通运输部",
    registerDate: "2024-05-20",
    updateCycle: "每日凌晨4:00",
    rightsInfo: "持有权: 合作方 | 加工权: 授权方 | 产品经营权: 授权方",
    dbType: "HBase 2.5",
    scale: "日均1亿条",
  },
  {
    id: "18",
    name: "税收征管数据集",
    description: "企业和个人税收申报及缴纳数据",
    catalogNumber: "RES-2024-0018",
    type: "原始数据",
    theme: "政务",
    dataVolume: "1.2亿条 / 500GB",
    updateFrequency: "月",
    updateTime: "2026-04-01 06:00",
    status: "normal",
    owner: "吴十",
    format: "Oracle",
    region: "全国",
    industry: "政务",
    source: "税务总局",
    registerDate: "2024-01-30",
    updateCycle: "每月1日 06:00",
    rightsInfo: "持有权: 合作方 | 加工权: 授权方 | 产品经营权: 平台方",
    dbType: "Oracle 19c",
    scale: "1.2亿条记录",
  },
  {
    id: "19",
    name: "药品监管数据",
    description: "药品生产、流通、使用全生命周期监管数据",
    catalogNumber: "RES-2024-0019",
    type: "清洗数据",
    theme: "医疗",
    dataVolume: "2000万条 / 150GB",
    updateFrequency: "日",
    updateTime: "2026-04-15 02:00",
    status: "normal",
    owner: "郑一",
    format: "MySQL",
    region: "全国",
    industry: "医疗",
    source: "药监局",
    registerDate: "2024-03-08",
    updateCycle: "每日凌晨2:00",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "MySQL 8.0",
    scale: "2000万条记录",
  },
  {
    id: "20",
    name: "消费价格指数",
    description: "居民消费价格指数(CPI)及分类指数数据",
    catalogNumber: "RES-2024-0020",
    type: "指标数据",
    theme: "金融",
    dataVolume: "500万条 / 20GB",
    updateFrequency: "月",
    updateTime: "2026-04-01 08:00",
    status: "normal",
    owner: "王二",
    format: "CSV",
    region: "全国",
    industry: "金融",
    source: "国家统计局",
    registerDate: "2024-02-10",
    updateCycle: "每月1日 08:00",
    rightsInfo: "持有权: 平台方 | 加工权: 平台方 | 产品经营权: 平台方",
    dbType: "PostgreSQL",
    scale: "500万条记录",
  },
];

/* ──────────────────────── helpers ──────────────────────── */

const statusConfig = {
  normal: {
    label: "正常",
    bg: "bg-[#ECFDF5]",
    text: "text-[#059669]",
    darkBg: "dark:bg-[#064E3B]/30",
    darkText: "dark:text-[#34D399]",
    icon: CheckCircle,
  },
  abnormal: {
    label: "异常",
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
    darkBg: "dark:bg-[#7F1D1D]/30",
    darkText: "dark:text-[#F87171]",
    icon: AlertTriangle,
  },
  paused: {
    label: "暂停",
    bg: "bg-[#F1F5F9]",
    text: "text-[#64748B]",
    darkBg: "dark:bg-[#334155]/30",
    darkText: "dark:text-[#94A3B8]",
    icon: PauseCircle,
  },
};

const typeColorMap: Record<string, string> = {
  "原始数据": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  "清洗数据": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
  "指标数据": "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  "标签数据": "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
  "模型数据": "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300",
};

/* ──────────────────────── TreeNodeRenderer ──────────────────────── */

function TreeNodeRenderer({
  node,
  depth,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string, label: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const paddingLeft = depth * 16 + 8;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-200 text-sm",
          isSelected
            ? "bg-[#EEF2FF] dark:bg-[#312E81]/30 text-[#4F46E5] dark:text-[#818CF8] border-l-[3px] border-[#6366F1]"
            : "hover:bg-slate-100 dark:hover:bg-[#273548]/50 text-slate-700 dark:text-slate-300 border-l-[3px] border-transparent"
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => {
          if (hasChildren) {
            onToggle(node.id);
          }
          onSelect(node.id, node.label);
        }}
      >
        {hasChildren && (
          <span
            className="flex-shrink-0 transition-transform duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-3.5" />}
        <FolderOpen className="w-4 h-4 flex-shrink-0 text-slate-400" />
        <span className="flex-1 truncate">{node.label}</span>
        <span className="text-xs text-slate-400 flex-shrink-0">{node.count.toLocaleString()}</span>
      </div>
      {hasChildren && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              {node.children!.map((child) => (
                <TreeNodeRenderer
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ──────────────────────── StatusTag ──────────────────────── */

function StatusTag({ status }: { status: keyof typeof statusConfig }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        cfg.bg,
        cfg.text,
        cfg.darkBg,
        cfg.darkText
      )}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

/* ──────────────────────── ResourceCard ──────────────────────── */

function ResourceCard({
  resource,
  onView,
}: {
  resource: Resource;
  onView: (r: Resource) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1E293B] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              typeColorMap[resource.type] || "bg-slate-100 text-slate-600"
            )}
          >
            {resource.type}
          </span>
          <StatusTag status={resource.status} />
        </div>
      </div>
      <h4 className="text-h5 text-slate-800 dark:text-slate-100 truncate">{resource.name}</h4>
      <p className="text-body-small text-slate-500 dark:text-slate-400 line-clamp-2">
        {resource.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-[#334155]">
        <Database className="w-3.5 h-3.5" />
        <span className="font-mono">{resource.dataVolume}</span>
        <span className="ml-auto flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {resource.updateTime}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#EEF2FF] dark:bg-[#312E81]/40 flex items-center justify-center text-xs font-medium text-[#4F46E5] dark:text-[#818CF8]">
            {resource.owner[0]}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300">{resource.owner}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(resource)}>
            <Eye className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Pagination ──────────────────────── */

function Pagination({
  total,
  pageSize,
  currentPage,
  onChange,
  onPageSizeChange,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
  onChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between py-3 px-4 border-t border-slate-200 dark:border-[#334155]">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        共 {total.toLocaleString()} 条，每页{" "}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="mx-1 px-1 py-0.5 rounded border border-slate-200 dark:border-[#334155] bg-transparent text-xs"
        >
          {[10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        条，第 {currentPage}/{totalPages} 页
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        {pageNumbers.map((p, i) =>
          typeof p === "string" ? (
            <span key={`${p}-${i}`} className="px-2 text-xs text-slate-400">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 min-w-[28px] px-1.5 text-xs",
                p === currentPage && "bg-[#6366F1] text-white hover:bg-[#4F46E5]"
              )}
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────── DetailDrawerContent ──────────────────────── */

function DetailDrawerContent({ resource }: { resource: Resource }) {
  const [activeTab, setActiveTab] = useState<string>("basic");

  const tabs = [
    { id: "basic", label: "基本信息" },
    { id: "preview", label: "数据预览" },
    { id: "lineage", label: "血缘关系" },
    { id: "permission", label: "访问权限" },
    { id: "log", label: "操作日志" },
  ];

  const mockPreviewColumns = ["字段名", "类型", "示例值", "描述"];
  const mockPreviewData = [
    ["id", "BIGINT", "1000001", "主键ID"],
    ["name", "VARCHAR(100)", "示例科技有限公司", "企业名称"],
    ["credit_code", "VARCHAR(50)", "91110108MA001234", "统一社会信用代码"],
    ["reg_capital", "DECIMAL(18,2)", "5000.00", "注册资本(万元)"],
    ["establish_date", "DATE", "2015-03-20", "成立日期"],
    ["legal_person", "VARCHAR(50)", "张三", "法定代表人"],
    ["enterprise_type", "VARCHAR(50)", "有限责任公司", "企业类型"],
    ["industry_code", "VARCHAR(20)", "I64", "行业代码"],
    ["reg_address", "VARCHAR(200)", "北京市海淀区", "注册地址"],
    ["status", "TINYINT", "1", "经营状态(1-正常)"],
  ];

  const mockLogs = [
    { time: "2026-04-15 02:00", user: "系统", action: "数据同步", result: "成功" },
    { time: "2026-04-14 02:00", user: "系统", action: "数据同步", result: "成功" },
    { time: "2026-04-13 14:30", user: "张三", action: "元数据更新", result: "成功" },
    { time: "2026-04-10 09:15", user: "李四", action: "权限变更", result: "成功" },
    { time: "2026-04-01 08:00", user: "系统", action: "月度质检", result: "通过" },
    { time: "2026-03-25 11:20", user: "王五", action: "字段注释修改", result: "成功" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-[#334155]">
        <div className="flex items-center gap-2 mb-2">
          <StatusTag status={resource.status} />
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              typeColorMap[resource.type]
            )}
          >
            {resource.type}
          </span>
        </div>
        <h2 className="text-h3 text-slate-800 dark:text-slate-100">{resource.name}</h2>
        <p className="text-body-small text-slate-500 dark:text-slate-400 mt-1">
          {resource.description}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 dark:border-[#334155] mt-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-[#4F46E5] dark:text-[#818CF8]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="detail-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {activeTab === "basic" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "资源ID", value: resource.id, icon: Tag },
                { label: "资源名称", value: resource.name, icon: FileText },
                { label: "资源类型", value: resource.type, icon: Layers },
                { label: "主题域", value: resource.theme, icon: FolderTree },
                { label: "数据格式", value: resource.format, icon: FileSpreadsheet },
                { label: "数据库类型", value: resource.dbType, icon: Database },
                { label: "数据量", value: resource.scale, icon: HardDrive },
                { label: "更新频率", value: resource.updateFrequency, icon: RefreshCw },
                { label: "所属行业", value: resource.industry, icon: Building },
                { label: "覆盖区域", value: resource.region, icon: Globe },
                { label: "数据来源", value: resource.source, icon: Database },
                { label: "负责人", value: resource.owner, icon: UserCircle },
                { label: "登记日期", value: resource.registerDate, icon: Clock },
                { label: "更新周期", value: resource.updateCycle, icon: RefreshCw },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <field.icon className="w-3 h-3" />
                    {field.label}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-[#334155]">
              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                三权信息
              </h5>
              <div className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
                {resource.rightsInfo.split(" | ").map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "preview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0F172A]">
                    {mockPreviewColumns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]/50">
                  {mockPreviewData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#EEF2FF]/50 dark:hover:bg-[#312E81]/10 transition-colors"
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={cn(
                            "px-3 py-2",
                            j === 1
                              ? "font-mono text-xs text-slate-500 dark:text-slate-400"
                              : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "lineage" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <Database className="w-4 h-4 text-[#10B981]" />
                <span>上游数据源</span>
              </div>
              <div className="pl-6 border-l-2 border-[#10B981]/30 space-y-2">
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {resource.source}
                </div>
              </div>
              <div className="flex justify-center my-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <Layers className="w-4 h-4 text-[#6366F1]" />
                <span>当前资源</span>
              </div>
              <div className="pl-6 border-l-2 border-[#6366F1]/30">
                <div className="text-sm font-medium text-[#4F46E5] dark:text-[#818CF8]">
                  {resource.name}
                </div>
              </div>
              <div className="flex justify-center my-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span>下游应用</span>
              </div>
              <div className="pl-6 border-l-2 border-[#F59E0B]/30 space-y-2">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  数据分析平台、API服务、报表系统
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "permission" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[
              { role: "管理员", scope: "全部", perm: "读/写/管理" },
              { role: "数据分析师", scope: "部门", perm: "读" },
              { role: "开发人员", scope: "项目组", perm: "读/写" },
              { role: "访客", scope: "个人", perm: "读(脱敏)" },
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0F172A] rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {p.role}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{p.scope}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81]/30 dark:text-[#818CF8]">
                  {p.perm}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "log" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            {mockLogs.map((log, i) => (
              <div
                key={i}
                className="flex gap-3 py-3 border-l-2 border-slate-200 dark:border-[#334155] pl-4 relative"
              >
                <div className="absolute -left-[5px] top-3.5 w-2 h-2 rounded-full bg-[#6366F1]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        log.result === "成功" || log.result === "通过"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : "bg-[#FEF2F2] text-[#DC2626]"
                      )}
                    >
                      {log.result}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {log.user} · {log.time}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── main component ──────────────────────── */

export default function ResourceCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["theme", "finance", "gov"]));
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    format: "",
    status: "",
    theme: "",
  });

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setCurrentPage(1);
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.catalogNumber.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.type && r.type !== filters.type) return false;
      if (filters.format && !r.format.toLowerCase().includes(filters.format.toLowerCase())) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.theme && r.theme !== filters.theme) return false;
      if (selectedNodeId) {
        const nodeLabel =
          treeData
            .flatMap((t) => [t, ...(t.children || [])])
            .flatMap((t) => [t, ...(t.children || [])])
            .find((n) => n.id === selectedNodeId)?.label || "";
        if (nodeLabel && nodeLabel !== "按主题域" && nodeLabel !== "按资产类型" && nodeLabel !== "按数据来源") {
          if (!r.theme.includes(nodeLabel) && !r.type.includes(nodeLabel) && !r.industry.includes(nodeLabel))
            return false;
        }
      }
      return true;
    });
  }, [searchQuery, filters, selectedNodeId]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => {
      if (prev.size === paginatedResources.length) return new Set();
      return new Set(paginatedResources.map((r) => r.id));
    });
  }, [paginatedResources]);

  const openDetail = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    setDrawerOpen(true);
  }, []);

  const themeOptions = ["", "政务", "金融", "交通", "医疗", "教育", "环境", "能源", "农业"];
  const typeOptions = ["", "原始数据", "清洗数据", "指标数据", "标签数据", "模型数据"];
  const formatOptions = ["", "MySQL", "PostgreSQL", "Oracle", "Kafka", "API", "JSON", "CSV"];
  const statusOptions = [
    { value: "", label: "全部" },
    { value: "normal", label: "正常" },
    { value: "abnormal", label: "异常" },
    { value: "paused", label: "暂停" },
  ];

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-h2 text-slate-800 dark:text-slate-100">数据资源目录</h1>
          <p className="text-body-small text-slate-500 dark:text-slate-400 mt-1">
            共管理 2,847 个数据资源，覆盖 12 个主题域
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1.5">
            <Plus className="w-4 h-4" />
            注册资源
          </Button>
          <Button variant="outline" className="gap-1.5 dark:border-[#334155] dark:text-slate-300">
            <Download className="w-4 h-4" />
            导入/导出
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Tree Sidebar */}
        <div className="w-[280px] flex-shrink-0 bg-white dark:bg-[#1E293B] rounded-lg shadow-md border border-slate-200 dark:border-[#334155] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-[#334155]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索目录..." className="pl-9 h-9 text-sm dark:bg-[#0F172A] dark:border-[#334155]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {treeData.map((node) => (
              <TreeNodeRenderer
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedNodeId}
                expandedIds={expandedIds}
                onToggle={toggleExpanded}
                onSelect={handleSelectNode}
              />
            ))}
          </div>
        </div>

        {/* Resource List */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1E293B] rounded-lg shadow-md border border-slate-200 dark:border-[#334155] overflow-hidden">
          {/* Search + Filter Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-[#334155] space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="搜索资源名称、描述、标签..."
                  className="pl-9 h-9 text-sm dark:bg-[#0F172A] dark:border-[#334155]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-1 dark:border-[#334155]",
                  showFilters && "border-[#6366F1] text-[#4F46E5]"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                筛选
              </Button>
              <div className="flex items-center border border-slate-200 dark:border-[#334155] rounded-md overflow-hidden ml-auto">
                <button
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "table"
                      ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81]/30 dark:text-[#818CF8]"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  onClick={() => setViewMode("table")}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "card"
                      ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81]/30 dark:text-[#818CF8]"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  onClick={() => setViewMode("card")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <select
                      value={filters.theme}
                      onChange={(e) => setFilters((f) => ({ ...f, theme: e.target.value }))}
                      className="h-8 px-2 rounded-md border border-slate-200 dark:border-[#334155] bg-transparent text-sm dark:bg-[#0F172A] dark:text-slate-200"
                    >
                      <option value="">全部主题</option>
                      {themeOptions.slice(1).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                      className="h-8 px-2 rounded-md border border-slate-200 dark:border-[#334155] bg-transparent text-sm dark:bg-[#0F172A] dark:text-slate-200"
                    >
                      <option value="">全部类型</option>
                      {typeOptions.slice(1).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.format}
                      onChange={(e) => setFilters((f) => ({ ...f, format: e.target.value }))}
                      className="h-8 px-2 rounded-md border border-slate-200 dark:border-[#334155] bg-transparent text-sm dark:bg-[#0F172A] dark:text-slate-200"
                    >
                      <option value="">全部格式</option>
                      {formatOptions.slice(1).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                      className="h-8 px-2 rounded-md border border-slate-200 dark:border-[#334155] bg-transparent text-sm dark:bg-[#0F172A] dark:text-slate-200"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-slate-500"
                      onClick={() => {
                        setFilters({ type: "", format: "", status: "", theme: "" });
                        setSearchQuery("");
                      }}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      重置
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#334155]">
                      <th className="px-3 py-3 w-10">
                        <button onClick={toggleAll} className="flex items-center justify-center">
                          {selectedRows.size === paginatedResources.length && paginatedResources.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-[#6366F1]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        资源名称
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        主题域
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        数据量
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        更新频率
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        更新时间
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        负责人
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#334155]/50">
                    {paginatedResources.map((resource, index) => (
                      <motion.tr
                        key={resource.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "hover:bg-[#EEF2FF]/50 dark:hover:bg-[#312E81]/10 transition-colors cursor-pointer group",
                          selectedRows.has(resource.id) &&
                            "bg-[#EEF2FF]/30 dark:bg-[#312E81]/10"
                        )}
                        onClick={() => openDetail(resource)}
                      >
                        <td
                          className="px-3 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(resource.id);
                          }}
                        >
                          {selectedRows.has(resource.id) ? (
                            <CheckSquare className="w-4 h-4 text-[#6366F1]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-700 dark:text-slate-200">
                            {resource.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {resource.description}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              typeColorMap[resource.type] || "bg-slate-100 text-slate-600"
                            )}
                          >
                            {resource.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                          {resource.theme}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {resource.dataVolume}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                          {resource.updateFrequency}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {resource.updateTime}
                        </td>
                        <td className="px-3 py-3">
                          <StatusTag status={resource.status} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#EEF2FF] dark:bg-[#312E81]/40 flex items-center justify-center text-xs font-medium text-[#4F46E5] dark:text-[#818CF8]">
                              {resource.owner[0]}
                            </div>
                            <span className="text-slate-600 dark:text-slate-300">
                              {resource.owner}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetail(resource);
                              }}
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} onView={openDetail} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {paginatedResources.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#0F172A] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">暂无匹配的资源</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setFilters({ type: "", format: "", status: "", theme: "" });
                    setSearchQuery("");
                  }}
                >
                  清除筛选条件
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            total={filteredResources.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800 dark:bg-[#1E293B] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-4"
          >
            <span className="text-sm">已选择 {selectedRows.size} 项</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-slate-700 h-8">
                <Download className="w-3.5 h-3.5 mr-1" />
                批量导出
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-slate-700 h-8">
                批量删除
              </Button>
            </div>
            <button
              className="ml-2 text-slate-400 hover:text-white"
              onClick={() => setSelectedRows(new Set())}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedResource?.name || "资源详情"}
        size="lg"
      >
        {selectedResource && <DetailDrawerContent resource={selectedResource} />}
      </Drawer>
    </div>
  );
}
