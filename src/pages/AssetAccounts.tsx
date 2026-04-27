import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "@/components/DataTable";
import Drawer from "@/components/Drawer";
import StatusTag from "@/components/StatusTag";
import SearchFilter from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  UserCircle,
  Search,
  LayoutGrid,
  Table2,
  TrendingUp,
  ArrowRight,
  Database,
  Receipt,
  ChevronRight,
  BarChart3,
  Award,
  Clock,
  Filter,
  ArrowDownToLine,
  Landmark,
  Wallet,
  Percent,
} from "lucide-react";

/* ─── Types ─── */
interface Account {
  id: string;
  accountNo: string;
  name: string;
  type: "enterprise" | "industry" | "personal";
  entity: string;
  transactionCount: number;
  volume: number;
  assets: number;
  status: "success" | "warning" | "danger" | "disabled";
  productCount: number;
  contact: string;
  phone: string;
  email: string;
  createdAt: string;
  assetsList: AssetItem[];
  allocationRecords: AllocationRecord[];
  revenueRecords: RevenueRecord[];
}

interface AssetItem {
  id: string;
  name: string;
  type: string;
  ranking: number;
  cumulativeRevenue: number;
  contributionRate: number;
}

interface AllocationRecord {
  id: string;
  sourceName: string;
  totalRevenue: number;
  pendingAmount: number;
  receivedAmount: number;
  allocationRatio: number;
}

interface RevenueRecord {
  serialNo: string;
  productName: string;
  revenueType: string;
  pointsEarned: number;
  allocationTime: string;
  allocationTarget: string;
  amount: number;
}

/* ─── Mock Data ─── */
const accountsData: Account[] = [
  {
    id: "AC-001", accountNo: "EA-2024-00001", name: "招商银行数据账户", type: "enterprise",
    entity: "招商银行股份有限公司", transactionCount: 342, volume: 12560, assets: 156, status: "success", productCount: 28,
    contact: "张经理", phone: "138****1234", email: "zhang@cmb.com", createdAt: "2024-01-15",
    assetsList: [
      { id: "A-001", name: "企业工商信息查询", type: "API", ranking: 1, cumulativeRevenue: 128500, contributionRate: 35.2 },
      { id: "A-002", name: "个人信用评分模型", type: "模型", ranking: 2, cumulativeRevenue: 98200, contributionRate: 26.9 },
      { id: "A-003", name: "金融行业分析报告", type: "报告", ranking: 3, cumulativeRevenue: 76500, contributionRate: 20.9 },
      { id: "A-004", name: "供应链风险分析", type: "模型", ranking: 4, cumulativeRevenue: 42300, contributionRate: 11.6 },
      { id: "A-005", name: "数据脱敏处理服务", type: "服务", ranking: 5, cumulativeRevenue: 19600, contributionRate: 5.4 },
    ],
    allocationRecords: [
      { id: "AL-001", sourceName: "数据产品交易总收益", totalRevenue: 365100, pendingAmount: 45200, receivedAmount: 319900, allocationRatio: 100 },
      { id: "AL-002", sourceName: "平台技术服务费", totalRevenue: 54765, pendingAmount: 12000, receivedAmount: 42765, allocationRatio: 15 },
      { id: "AL-003", sourceName: "数据提供方分成", totalRevenue: 182550, pendingAmount: 21500, receivedAmount: 161050, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200001", productName: "企业工商信息查询", revenueType: "调用计费", pointsEarned: 1250, allocationTime: "2026-04-20 10:30:00", allocationTarget: "平台收益池", amount: 1250.00 },
      { serialNo: "RV-202604190002", productName: "个人信用评分模型", revenueType: "订阅分成", pointsEarned: 3800, allocationTime: "2026-04-19 14:20:00", allocationTarget: "数据提供方", amount: 3800.00 },
      { serialNo: "RV-202604180003", productName: "金融行业分析报告", revenueType: "交易分成", pointsEarned: 900, allocationTime: "2026-04-18 09:15:00", allocationTarget: "技术服务方", amount: 900.00 },
      { serialNo: "RV-202604170004", productName: "供应链风险分析", revenueType: "调用计费", pointsEarned: 2100, allocationTime: "2026-04-17 16:45:00", allocationTarget: "运营方", amount: 2100.00 },
      { serialNo: "RV-202604160005", productName: "数据脱敏处理服务", revenueType: "按量计费", pointsEarned: 560, allocationTime: "2026-04-16 11:30:00", allocationTarget: "平台收益池", amount: 560.00 },
    ],
  },
  {
    id: "AC-002", accountNo: "EA-2024-00002", name: "中国移动数据账户", type: "enterprise",
    entity: "中国移动通信集团", transactionCount: 567, volume: 28900, assets: 234, status: "success", productCount: 42,
    contact: "李总监", phone: "139****5678", email: "li@chinamobile.com", createdAt: "2024-02-01",
    assetsList: [
      { id: "A-006", name: "用户行为分析数据集", type: "数据集", ranking: 1, cumulativeRevenue: 256000, contributionRate: 42.1 },
      { id: "A-007", name: "位置数据服务", type: "API", ranking: 2, cumulativeRevenue: 189000, contributionRate: 31.1 },
      { id: "A-008", name: "网络质量报告", type: "报告", ranking: 3, cumulativeRevenue: 98000, contributionRate: 16.1 },
      { id: "A-009", name: "消费趋势预测", type: "模型", ranking: 4, cumulativeRevenue: 64800, contributionRate: 10.7 },
    ],
    allocationRecords: [
      { id: "AL-004", sourceName: "数据产品交易总收益", totalRevenue: 607800, pendingAmount: 98000, receivedAmount: 509800, allocationRatio: 100 },
      { id: "AL-005", sourceName: "平台技术服务费", totalRevenue: 91170, pendingAmount: 18000, receivedAmount: 73170, allocationRatio: 15 },
      { id: "AL-006", sourceName: "数据提供方分成", totalRevenue: 303900, pendingAmount: 52000, receivedAmount: 251900, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200006", productName: "用户行为分析数据集", revenueType: "数据授权", pointsEarned: 5600, allocationTime: "2026-04-20 08:00:00", allocationTarget: "数据提供方", amount: 5600.00 },
      { serialNo: "RV-202604190007", productName: "位置数据服务", revenueType: "调用计费", pointsEarned: 3200, allocationTime: "2026-04-19 12:30:00", allocationTarget: "平台收益池", amount: 3200.00 },
      { serialNo: "RV-202604180008", productName: "网络质量报告", revenueType: "交易分成", pointsEarned: 1800, allocationTime: "2026-04-18 15:00:00", allocationTarget: "技术服务方", amount: 1800.00 },
    ],
  },
  {
    id: "AC-003", accountNo: "IA-2024-00001", name: "某市数据局账户", type: "industry",
    entity: "某市大数据管理局", transactionCount: 128, volume: 4500, assets: 89, status: "success", productCount: 15,
    contact: "王科长", phone: "137****9012", email: "wang@data.gov.cn", createdAt: "2024-01-20",
    assetsList: [
      { id: "A-010", name: "政务数据开放目录", type: "数据集", ranking: 1, cumulativeRevenue: 45000, contributionRate: 38.5 },
      { id: "A-011", name: "人口基础信息库", type: "数据集", ranking: 2, cumulativeRevenue: 38200, contributionRate: 32.7 },
      { id: "A-012", name: "城市治理分析模型", type: "模型", ranking: 3, cumulativeRevenue: 33600, contributionRate: 28.8 },
    ],
    allocationRecords: [
      { id: "AL-007", sourceName: "数据产品交易总收益", totalRevenue: 116800, pendingAmount: 12000, receivedAmount: 104800, allocationRatio: 100 },
      { id: "AL-008", sourceName: "平台技术服务费", totalRevenue: 17520, pendingAmount: 3500, receivedAmount: 14020, allocationRatio: 15 },
      { id: "AL-009", sourceName: "数据提供方分成", totalRevenue: 58400, pendingAmount: 5500, receivedAmount: 52900, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200009", productName: "政务数据开放目录", revenueType: "数据授权", pointsEarned: 2200, allocationTime: "2026-04-20 09:00:00", allocationTarget: "数据提供方", amount: 2200.00 },
      { serialNo: "RV-202604190010", productName: "人口基础信息库", revenueType: "查询计费", pointsEarned: 1500, allocationTime: "2026-04-19 11:20:00", allocationTarget: "平台收益池", amount: 1500.00 },
    ],
  },
  {
    id: "AC-004", accountNo: "EA-2024-00003", name: "某三甲医院数据账户", type: "enterprise",
    entity: "某市人民医院", transactionCount: 89, volume: 3200, assets: 67, status: "warning", productCount: 12,
    contact: "赵主任", phone: "136****3456", email: "zhao@hospital.com", createdAt: "2024-03-10",
    assetsList: [
      { id: "A-013", name: "电子病历数据集", type: "数据集", ranking: 1, cumulativeRevenue: 28500, contributionRate: 45.2 },
      { id: "A-014", name: "医疗影像分析服务", type: "服务", ranking: 2, cumulativeRevenue: 21200, contributionRate: 33.6 },
      { id: "A-015", name: "疾病预测模型", type: "模型", ranking: 3, cumulativeRevenue: 13400, contributionRate: 21.2 },
    ],
    allocationRecords: [
      { id: "AL-010", sourceName: "数据产品交易总收益", totalRevenue: 63100, pendingAmount: 8500, receivedAmount: 54600, allocationRatio: 100 },
      { id: "AL-011", sourceName: "平台技术服务费", totalRevenue: 9465, pendingAmount: 2200, receivedAmount: 7265, allocationRatio: 15 },
      { id: "AL-012", sourceName: "数据提供方分成", totalRevenue: 31550, pendingAmount: 4000, receivedAmount: 27550, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604180011", productName: "电子病历数据集", revenueType: "数据授权", pointsEarned: 1800, allocationTime: "2026-04-18 10:00:00", allocationTarget: "数据提供方", amount: 1800.00 },
      { serialNo: "RV-202604170012", productName: "医疗影像分析", revenueType: "按次计费", pointsEarned: 1200, allocationTime: "2026-04-17 14:30:00", allocationTarget: "技术服务方", amount: 1200.00 },
    ],
  },
  {
    id: "AC-005", accountNo: "PA-2024-00001", name: "个人开发者账户-陈明", type: "personal",
    entity: "陈明", transactionCount: 45, volume: 1200, assets: 23, status: "success", productCount: 5,
    contact: "陈明", phone: "135****7890", email: "chenming@dev.com", createdAt: "2024-04-01",
    assetsList: [
      { id: "A-016", name: "天气数据分析工具", type: "服务", ranking: 1, cumulativeRevenue: 6800, contributionRate: 52.3 },
      { id: "A-017", name: "新闻情感分析API", type: "API", ranking: 2, cumulativeRevenue: 6200, contributionRate: 47.7 },
    ],
    allocationRecords: [
      { id: "AL-013", sourceName: "数据产品交易总收益", totalRevenue: 13000, pendingAmount: 2100, receivedAmount: 10900, allocationRatio: 100 },
      { id: "AL-014", sourceName: "平台技术服务费", totalRevenue: 1950, pendingAmount: 500, receivedAmount: 1450, allocationRatio: 15 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200013", productName: "天气数据分析工具", revenueType: "订阅计费", pointsEarned: 580, allocationTime: "2026-04-20 10:00:00", allocationTarget: "个人收益", amount: 580.00 },
      { serialNo: "RV-202604150014", productName: "新闻情感分析API", revenueType: "调用计费", pointsEarned: 420, allocationTime: "2026-04-15 16:00:00", allocationTarget: "个人收益", amount: 420.00 },
    ],
  },
  {
    id: "AC-006", accountNo: "EA-2024-00004", name: "某物流集团数据账户", type: "enterprise",
    entity: "某物流集团有限公司", transactionCount: 234, volume: 8900, assets: 112, status: "success", productCount: 22,
    contact: "孙经理", phone: "134****2345", email: "sun@logistics.com", createdAt: "2024-02-15",
    assetsList: [
      { id: "A-018", name: "物流轨迹查询", type: "API", ranking: 1, cumulativeRevenue: 85600, contributionRate: 40.8 },
      { id: "A-019", name: "运输优化模型", type: "模型", ranking: 2, cumulativeRevenue: 62300, contributionRate: 29.7 },
      { id: "A-020", name: "仓储分析数据集", type: "数据集", ranking: 3, cumulativeRevenue: 38400, contributionRate: 18.3 },
      { id: "A-021", name: "配送预测服务", type: "服务", ranking: 4, cumulativeRevenue: 23400, contributionRate: 11.2 },
    ],
    allocationRecords: [
      { id: "AL-015", sourceName: "数据产品交易总收益", totalRevenue: 209700, pendingAmount: 28000, receivedAmount: 181700, allocationRatio: 100 },
      { id: "AL-016", sourceName: "平台技术服务费", totalRevenue: 31455, pendingAmount: 5800, receivedAmount: 25655, allocationRatio: 15 },
      { id: "AL-017", sourceName: "数据提供方分成", totalRevenue: 104850, pendingAmount: 14500, receivedAmount: 90350, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200015", productName: "物流轨迹查询", revenueType: "调用计费", pointsEarned: 2800, allocationTime: "2026-04-20 08:30:00", allocationTarget: "数据提供方", amount: 2800.00 },
      { serialNo: "RV-202604190016", productName: "运输优化模型", revenueType: "订阅分成", pointsEarned: 3500, allocationTime: "2026-04-19 13:00:00", allocationTarget: "技术服务方", amount: 3500.00 },
    ],
  },
  {
    id: "AC-007", accountNo: "IA-2024-00002", name: "金融行业数据联盟", type: "industry",
    entity: "中国金融数据共享联盟", transactionCount: 456, volume: 34500, assets: 198, status: "success", productCount: 35,
    contact: "周秘书长", phone: "133****6789", email: "zhou@f联盟.org", createdAt: "2024-01-10",
    assetsList: [
      { id: "A-022", name: "征信数据集", type: "数据集", ranking: 1, cumulativeRevenue: 325000, contributionRate: 44.5 },
      { id: "A-023", name: "反欺诈模型", type: "模型", ranking: 2, cumulativeRevenue: 218000, contributionRate: 29.9 },
      { id: "A-024", name: "风险评估报告", type: "报告", ranking: 3, cumulativeRevenue: 112000, contributionRate: 15.3 },
      { id: "A-025", name: "合规检查服务", type: "服务", ranking: 4, cumulativeRevenue: 75000, contributionRate: 10.3 },
    ],
    allocationRecords: [
      { id: "AL-018", sourceName: "数据产品交易总收益", totalRevenue: 730000, pendingAmount: 112000, receivedAmount: 618000, allocationRatio: 100 },
      { id: "AL-019", sourceName: "平台技术服务费", totalRevenue: 109500, pendingAmount: 18500, receivedAmount: 91000, allocationRatio: 15 },
      { id: "AL-020", sourceName: "数据提供方分成", totalRevenue: 365000, pendingAmount: 58000, receivedAmount: 307000, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200017", productName: "征信数据集", revenueType: "数据授权", pointsEarned: 8500, allocationTime: "2026-04-20 09:30:00", allocationTarget: "数据提供方", amount: 8500.00 },
      { serialNo: "RV-202604190018", productName: "反欺诈模型", revenueType: "订阅分成", pointsEarned: 7200, allocationTime: "2026-04-19 11:00:00", allocationTarget: "技术服务方", amount: 7200.00 },
    ],
  },
  {
    id: "AC-008", accountNo: "EA-2024-00005", name: "某电商平台数据账户", type: "enterprise",
    entity: "某电商科技有限公司", transactionCount: 678, volume: 45600, assets: 267, status: "success", productCount: 48,
    contact: "吴总监", phone: "132****0123", email: "wu@ecommerce.com", createdAt: "2023-12-01",
    assetsList: [
      { id: "A-026", name: "用户画像数据集", type: "数据集", ranking: 1, cumulativeRevenue: 456000, contributionRate: 38.2 },
      { id: "A-027", name: "推荐算法模型", type: "模型", ranking: 2, cumulativeRevenue: 378000, contributionRate: 31.7 },
      { id: "A-028", name: "商品知识图谱", type: "数据集", ranking: 3, cumulativeRevenue: 198000, contributionRate: 16.6 },
      { id: "A-029", name: "交易风控服务", type: "服务", ranking: 4, cumulativeRevenue: 156000, contributionRate: 13.5 },
    ],
    allocationRecords: [
      { id: "AL-021", sourceName: "数据产品交易总收益", totalRevenue: 1188000, pendingAmount: 156000, receivedAmount: 1032000, allocationRatio: 100 },
      { id: "AL-022", sourceName: "平台技术服务费", totalRevenue: 178200, pendingAmount: 28000, receivedAmount: 150200, allocationRatio: 15 },
      { id: "AL-023", sourceName: "数据提供方分成", totalRevenue: 594000, pendingAmount: 85000, receivedAmount: 509000, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200019", productName: "用户画像数据集", revenueType: "数据授权", pointsEarned: 12500, allocationTime: "2026-04-20 08:00:00", allocationTarget: "数据提供方", amount: 12500.00 },
      { serialNo: "RV-202604190020", productName: "推荐算法模型", revenueType: "订阅分成", pointsEarned: 9800, allocationTime: "2026-04-19 14:30:00", allocationTarget: "技术服务方", amount: 9800.00 },
    ],
  },
  {
    id: "AC-009", accountNo: "PA-2024-00002", name: "个人开发者账户-李芳", type: "personal",
    entity: "李芳", transactionCount: 23, volume: 680, assets: 15, status: "success", productCount: 4,
    contact: "李芳", phone: "131****4567", email: "lifang@dev.com", createdAt: "2024-05-01",
    assetsList: [
      { id: "A-030", name: "股票数据分析API", type: "API", ranking: 1, cumulativeRevenue: 5200, contributionRate: 60.2 },
      { id: "A-031", name: "基金净值爬虫服务", type: "服务", ranking: 2, cumulativeRevenue: 3450, contributionRate: 39.8 },
    ],
    allocationRecords: [
      { id: "AL-024", sourceName: "数据产品交易总收益", totalRevenue: 8650, pendingAmount: 1200, receivedAmount: 7450, allocationRatio: 100 },
      { id: "AL-025", sourceName: "平台技术服务费", totalRevenue: 1298, pendingAmount: 300, receivedAmount: 998, allocationRatio: 15 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200021", productName: "股票数据分析API", revenueType: "调用计费", pointsEarned: 380, allocationTime: "2026-04-20 09:00:00", allocationTarget: "个人收益", amount: 380.00 },
    ],
  },
  {
    id: "AC-010", accountNo: "EA-2024-00006", name: "某保险公司数据账户", type: "enterprise",
    entity: "某保险集团股份有限公司", transactionCount: 312, volume: 18700, assets: 145, status: "warning", productCount: 26,
    contact: "郑经理", phone: "130****8901", email: "zheng@insurance.com", createdAt: "2024-02-20",
    assetsList: [
      { id: "A-032", name: "精算数据集", type: "数据集", ranking: 1, cumulativeRevenue: 156000, contributionRate: 39.8 },
      { id: "A-033", name: "理赔预测模型", type: "模型", ranking: 2, cumulativeRevenue: 128000, contributionRate: 32.7 },
      { id: "A-034", name: "客户画像服务", type: "服务", ranking: 3, cumulativeRevenue: 68000, contributionRate: 17.4 },
      { id: "A-035", name: "合规监管报告", type: "报告", ranking: 4, cumulativeRevenue: 39600, contributionRate: 10.1 },
    ],
    allocationRecords: [
      { id: "AL-026", sourceName: "数据产品交易总收益", totalRevenue: 391600, pendingAmount: 58000, receivedAmount: 333600, allocationRatio: 100 },
      { id: "AL-027", sourceName: "平台技术服务费", totalRevenue: 58740, pendingAmount: 9500, receivedAmount: 49240, allocationRatio: 15 },
      { id: "AL-028", sourceName: "数据提供方分成", totalRevenue: 195800, pendingAmount: 32000, receivedAmount: 163800, allocationRatio: 50 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604200022", productName: "精算数据集", revenueType: "数据授权", pointsEarned: 6200, allocationTime: "2026-04-20 10:00:00", allocationTarget: "数据提供方", amount: 6200.00 },
      { serialNo: "RV-202604190023", productName: "理赔预测模型", revenueType: "订阅分成", pointsEarned: 5400, allocationTime: "2026-04-19 15:30:00", allocationTarget: "技术服务方", amount: 5400.00 },
    ],
  },
  {
    id: "AC-011", accountNo: "IA-2024-00003", name: "教育行业数据联盟", type: "industry",
    entity: "全国教育数据共享联盟", transactionCount: 187, volume: 7800, assets: 78, status: "success", productCount: 18,
    contact: "何秘书长", phone: "138****2345", email: "he@edu.org", createdAt: "2024-03-01",
    assetsList: [
      { id: "A-036", name: "教育资源目录", type: "数据集", ranking: 1, cumulativeRevenue: 45600, contributionRate: 41.5 },
      { id: "A-037", name: "学业评估模型", type: "模型", ranking: 2, cumulativeRevenue: 38200, contributionRate: 34.8 },
      { id: "A-038", name: "教学质量报告", type: "报告", ranking: 3, cumulativeRevenue: 26000, contributionRate: 23.7 },
    ],
    allocationRecords: [
      { id: "AL-029", sourceName: "数据产品交易总收益", totalRevenue: 109800, pendingAmount: 15000, receivedAmount: 94800, allocationRatio: 100 },
      { id: "AL-030", sourceName: "平台技术服务费", totalRevenue: 16470, pendingAmount: 3200, receivedAmount: 13270, allocationRatio: 15 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604180024", productName: "教育资源目录", revenueType: "数据授权", pointsEarned: 2100, allocationTime: "2026-04-18 10:30:00", allocationTarget: "数据提供方", amount: 2100.00 },
    ],
  },
  {
    id: "AC-012", accountNo: "PA-2024-00003", name: "个人开发者账户-王磊", type: "personal",
    entity: "王磊", transactionCount: 67, volume: 2100, assets: 31, status: "disabled", productCount: 8,
    contact: "王磊", phone: "137****6789", email: "wanglei@dev.com", createdAt: "2024-03-15",
    assetsList: [
      { id: "A-039", name: "房价预测模型", type: "模型", ranking: 1, cumulativeRevenue: 12500, contributionRate: 55.6 },
      { id: "A-040", name: "房产数据分析", type: "数据集", ranking: 2, cumulativeRevenue: 6800, contributionRate: 30.2 },
      { id: "A-041", name: "租金评估服务", type: "服务", ranking: 3, cumulativeRevenue: 3200, contributionRate: 14.2 },
    ],
    allocationRecords: [
      { id: "AL-031", sourceName: "数据产品交易总收益", totalRevenue: 22500, pendingAmount: 3800, receivedAmount: 18700, allocationRatio: 100 },
    ],
    revenueRecords: [
      { serialNo: "RV-202604150025", productName: "房价预测模型", revenueType: "订阅计费", pointsEarned: 890, allocationTime: "2026-04-15 11:00:00", allocationTarget: "个人收益", amount: 890.00 },
    ],
  },
];

/* ─── Type labels ─── */
const typeLabels: Record<string, string> = {
  enterprise: "企业",
  industry: "行业",
  personal: "个人",
};

const typeIcons: Record<string, typeof Building2> = {
  enterprise: Building2,
  industry: Landmark,
  personal: UserCircle,
};

/* ─── Revenue Allocation Chain Component ─── */
function AllocationChain({ totalRevenue }: { totalRevenue: number }) {
  const nodes = [
    { label: "总收益", amount: totalRevenue, color: "bg-primary-500", textColor: "text-white", pct: "100%" },
    { label: "平台抽成", amount: Math.round(totalRevenue * 0.15), color: "bg-[#6366F1]", textColor: "text-white", pct: "15%" },
    { label: "数据提供方", amount: Math.round(totalRevenue * 0.50), color: "bg-[#3B82F6]", textColor: "text-white", pct: "50%" },
    { label: "技术服务方", amount: Math.round(totalRevenue * 0.25), color: "bg-[#06B6D4]", textColor: "text-white", pct: "25%" },
    { label: "运营方", amount: Math.round(totalRevenue * 0.10), color: "bg-[#10B981]", textColor: "text-white", pct: "10%" },
  ];

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">收益分配链路</span>
      </div>

      {/* Horizontal flow diagram */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2 flex-shrink-0">
            <div className={cn("flex flex-col items-center p-3 rounded-lg min-w-[100px]", node.color)}>
              <span className={cn("text-xs font-medium", node.textColor)}>{node.label}</span>
              <span className={cn("text-sm font-bold font-mono mt-0.5", node.textColor)}>
                ¥{(node.amount / 10000).toFixed(1)}万
              </span>
              <span className={cn("text-xs opacity-80 mt-0.5", node.textColor)}>{node.pct}</span>
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step arrows description */}
      <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 flex-wrap">
        <span>总收益流入</span>
        <ChevronRight className="w-3 h-3" />
        <span>平台抽取15%</span>
        <ChevronRight className="w-3 h-3" />
        <span>数据方获得50%</span>
        <ChevronRight className="w-3 h-3" />
        <span>技术方获得25%</span>
        <ChevronRight className="w-3 h-3" />
        <span>运营方获得10%</span>
      </div>
    </div>
  );
}

/* ─── Account Detail Drawer ─── */
function AccountDetailDrawer({
  account,
  open,
  onClose,
}: {
  account: Account | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("assets");
  const [serialSearch, setSerialSearch] = useState("");

  if (!account) return null;

  const Icon = typeIcons[account.type] || Building2;
  const statusLabels: Record<string, string> = {
    success: "正常", warning: "待审核", danger: "异常", disabled: "已停用",
  };

  const filteredRevenueRecords = account.revenueRecords.filter((r) =>
    !serialSearch || r.serialNo.toLowerCase().includes(serialSearch.toLowerCase())
  );

  return (
    <Drawer open={open} onClose={onClose} title="账户详情" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{account.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">{account.accountNo}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {typeLabels[account.type]}
              </span>
              <StatusTag status={account.status} text={statusLabels[account.status]} />
            </div>
            <p className="text-xs text-slate-500 mt-1">{account.entity}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <QuickStat icon={<Database className="w-4 h-4" />} label="资产数量" value={`${account.assets}`} />
          <QuickStat icon={<Receipt className="w-4 h-4" />} label="交易笔数" value={`${account.transactionCount}`} />
          <QuickStat icon={<TrendingUp className="w-4 h-4" />} label="交易流水" value={`¥${(account.volume / 10000).toFixed(1)}万`} />
          <QuickStat icon={<Award className="w-4 h-4" />} label="产品数量" value={`${account.productCount}`} />
        </div>

        {/* Contact Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 w-12">联系人</span>
            <span className="text-slate-700 dark:text-slate-200">{account.contact}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 w-12">电话</span>
            <span className="text-slate-700 dark:text-slate-200">{account.phone}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 w-12">邮箱</span>
            <span className="text-slate-700 dark:text-slate-200">{account.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 w-12">创建时间</span>
            <span className="text-slate-700 dark:text-slate-200">{account.createdAt}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-[#334155]">
          <div className="flex gap-0">
            {[
              { key: "assets", label: "资产贡献" },
              { key: "allocation", label: "收益分配记录" },
              { key: "revenue", label: "收益明细" },
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
          {activeTab === "assets" && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-xs text-slate-500">总资产数</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{account.assets}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-xs text-slate-500">关联资产</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{account.assetsList.length}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-xs text-slate-500">累计收益</div>
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono">
                    ¥{(account.assetsList.reduce((s, a) => s + a.cumulativeRevenue, 0) / 10000).toFixed(1)}万
                  </div>
                </div>
              </div>

              {/* Asset List */}
              <div className="space-y-2">
                {account.assetsList.map((asset, idx) => (
                  <div
                    key={asset.id}
                    className="p-3 border border-slate-100 dark:border-[#334155] rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-600">{asset.ranking}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{asset.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                          {asset.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">ID: {asset.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-slate-400">累计收益: </span>
                        <span className="font-mono text-slate-700 dark:text-slate-200">¥{asset.cumulativeRevenue.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">贡献率: </span>
                        <span className="font-mono font-medium text-primary-600">{asset.contributionRate}%</span>
                      </div>
                    </div>
                    {/* Contribution bar */}
                    <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${asset.contributionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "allocation" && (
            <motion.div
              key="allocation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Allocation Chain Visual */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AllocationChain totalRevenue={account.allocationRecords[0]?.totalRevenue ?? 0} />
              </div>

              {/* Allocation Records Table */}
              <div className="space-y-2">
                {account.allocationRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 border border-slate-100 dark:border-[#334155] rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{record.sourceName}</span>
                      <span className="text-xs font-mono text-slate-400">{record.id}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                      <div><span className="text-slate-400">总收益</span><div className="font-mono text-slate-700 dark:text-slate-200">¥{record.totalRevenue.toLocaleString()}</div></div>
                      <div><span className="text-slate-400">待结算</span><div className="font-mono text-amber-600">¥{record.pendingAmount.toLocaleString()}</div></div>
                      <div><span className="text-slate-400">已到账</span><div className="font-mono text-emerald-600">¥{record.receivedAmount.toLocaleString()}</div></div>
                      <div className="text-right"><span className="text-slate-400">分配比例</span><div className="font-mono font-medium text-primary-600">{record.allocationRatio}%</div></div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(record.receivedAmount / record.totalRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-1 text-right">
                      到账率: {((record.receivedAmount / record.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "revenue" && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Search by serial */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={serialSearch}
                  onChange={(e) => setSerialSearch(e.target.value)}
                  placeholder="搜索分配流水号..."
                  className="w-full h-9 pl-9 pr-4 text-sm rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* Revenue Records */}
              <div className="space-y-2">
                {filteredRevenueRecords.map((record) => (
                  <div
                    key={record.serialNo}
                    className="p-3 border border-slate-100 dark:border-[#334155] rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary-600">{record.serialNo}</span>
                      <span className="text-xs text-slate-400">{record.allocationTime}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                      <div><span className="text-slate-400">产品名称</span><div className="text-slate-700 dark:text-slate-200">{record.productName}</div></div>
                      <div><span className="text-slate-400">收益类型</span><div className="text-slate-700 dark:text-slate-200">{record.revenueType}</div></div>
                      <div><span className="text-slate-400">分配对象</span><div className="text-slate-700 dark:text-slate-200">{record.allocationTarget}</div></div>
                      <div className="text-right">
                        <span className="text-slate-400">积分/金额</span>
                        <div className="flex items-center justify-end gap-1">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{record.pointsEarned}</span>
                          <span className="text-slate-400">|</span>
                          <span className="font-mono font-medium text-primary-600">¥{record.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredRevenueRecords.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">未找到匹配的记录</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">{value}</div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AssetAccounts() {
  const [activeTab, setActiveTab] = useState<"enterprise" | "industry" | "personal">("enterprise");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredAccounts = useMemo(() => {
    return accountsData.filter((a) => {
      const matchType = a.type === activeTab;
      const matchSearch = !searchQuery ||
        a.name.includes(searchQuery) ||
        a.accountNo.includes(searchQuery) ||
        a.entity.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [activeTab, searchQuery]);

  const tabStats = useMemo(() => ({
    enterprise: accountsData.filter((a) => a.type === "enterprise").length,
    industry: accountsData.filter((a) => a.type === "industry").length,
    personal: accountsData.filter((a) => a.type === "personal").length,
  }), []);

  const tableColumns = [
    {
      key: "accountNo", title: "账户编号", width: "130px",
      render: (row: Account) => <span className="font-mono text-xs text-slate-500">{row.accountNo}</span>,
    },
    {
      key: "name", title: "账户名称",
      render: (row: Account) => {
        const Icon = typeIcons[row.type] || Building2;
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: "type", title: "类型", width: "70px",
      render: (row: Account) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {typeLabels[row.type]}
        </span>
      ),
    },
    { key: "entity", title: "所属实体" },
    {
      key: "transactionCount", title: "交易笔数", width: "90px",
      render: (row: Account) => <span className="font-mono">{row.transactionCount}</span>,
    },
    {
      key: "volume", title: "交易流水(万)", width: "110px",
      render: (row: Account) => <span className="font-mono">¥{(row.volume / 10000).toFixed(1)}</span>,
    },
    {
      key: "assets", title: "资产数", width: "70px",
      render: (row: Account) => <span className="font-mono">{row.assets}</span>,
    },
    {
      key: "status", title: "状态", width: "90px",
      render: (row: Account) => {
        const sl: Record<string, string> = { success: "正常", warning: "待审核", danger: "异常", disabled: "已停用" };
        return <StatusTag status={row.status} text={sl[row.status]} />;
      },
    },
    {
      key: "productCount", title: "产品数", width: "70px",
      render: (row: Account) => <span className="font-mono">{row.productCount}</span>,
    },
  ];

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">资产账户管理</h1>
          <p className="text-sm text-slate-500 mt-1">企业/行业/个人账户管理、收益分配链路</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 bg-primary-500 hover:bg-primary-600 text-white">
          <PlusIcon /> 新增账户
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#334155]">
        <div className="flex gap-0">
          {[
            { key: "enterprise" as const, label: "企业资产账户", icon: Building2, count: tabStats.enterprise },
            { key: "industry" as const, label: "行业数据账户", icon: Landmark, count: tabStats.industry },
            { key: "personal" as const, label: "我的资产账户", icon: UserCircle, count: tabStats.personal },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.key
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索账户名称、编号、所属实体..."
              className="w-full h-9 pl-9 pr-4 text-sm rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            />
          </div>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
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

      {/* Account List */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DataTable
              columns={tableColumns}
              data={filteredAccounts}
              rowKey={(row) => row.id}
              onRowClick={handleAccountClick}
              pagination
              pageSize={8}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {filteredAccounts.map((account) => {
              const Icon = typeIcons[account.type] || Building2;
              const sl: Record<string, string> = { success: "正常", warning: "待审核", danger: "异常", disabled: "已停用" };
              return (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{account.name}</h4>
                        <p className="text-xs text-slate-500">{account.accountNo}</p>
                      </div>
                    </div>
                    <StatusTag status={account.status} text={sl[account.status]} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{account.entity}</p>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
                    <div className="text-center">
                      <div className="text-xs text-slate-400">交易笔数</div>
                      <div className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">{account.transactionCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400">流水(万)</div>
                      <div className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">¥{(account.volume / 10000).toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400">资产</div>
                      <div className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">{account.assets}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400">产品</div>
                      <div className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">{account.productCount}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredAccounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Search className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">未找到符合条件的账户</p>
        </div>
      )}

      {/* Account Detail Drawer */}
      <AccountDetailDrawer
        account={selectedAccount}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedAccount(null); }}
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
