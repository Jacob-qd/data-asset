import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Network, Plus, Search, Server, Activity, ShieldCheck,
  CheckCircle2, XCircle, Clock, ChevronRight, Settings, RefreshCw,
  Users, Database, X, Eye, Pencil, Trash2, Play, Square, ArrowUpCircle,
  Archive, AlertTriangle, Zap, TrendingUp, BarChart3, Bell,
  ChevronDown, ChevronUp, Maximize2, Minimize2, ArrowLeft, ArrowRight,
  Loader2, Shield, FileText, Key, UserPlus, UserMinus, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

/* ─── Types ─── */
interface NetworkData {
  id: string;
  name: string;
  type: string;
  consensus: string;
  status: string;
  nodes: number;
  orgs: number;
  tps: number;
  blockHeight: number;
  createTime: string;
  admin: string;
}

interface OrgData {
  id: string;
  networkId: string;
  name: string;
  role: string;
  joinTime: string;
  nodeCount: number;
  status: string;
  caCert?: string;
  caExpiry?: string;
}

interface OrgMember {
  id: string;
  orgId: string;
  name: string;
  role: string;
  email: string;
  status: string;
}

interface ChannelData {
  id: string;
  networkId: string;
  name: string;
  orgs: string[];
  blockSize: number;
  batchTimeout: string;
  status: string;
  blockHeight: number;
  txCount: number;
}

interface NodeData {
  id: string;
  networkId: string;
  orgId: string;
  name: string;
  role: "orderer" | "peer" | "client";
  status: string;
  channelIds: string[];
}

interface AlertData {
  id: string;
  networkId: string;
  time: string;
  level: "info" | "warn" | "error" | "critical";
  message: string;
  source: string;
}

/* ─── Helpers ─── */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function nowStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function generateId(): string {
  return Date.now().toString(36).toUpperCase();
}

function generateNetworkId(networks: NetworkData[]): string {
  const maxNum = networks.reduce((max, n) => {
    const num = parseInt(n.id.replace("NW-", ""), 10);
    return Math.max(max, isNaN(num) ? 0 : num);
  }, 0);
  return `NW-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Mock Data ─── */
const initialNetworks: NetworkData[] = [
  { id: "NW-001", name: "金融联盟链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 12, orgs: 5, tps: 3200, blockHeight: 4285691, createTime: "2024-06-15", admin: "金融联盟管理员" },
  { id: "NW-002", name: "政务数据链", type: "联盟链", consensus: "Raft", status: "running", nodes: 8, orgs: 4, tps: 1500, blockHeight: 2156032, createTime: "2024-08-20", admin: "政务联盟管理员" },
  { id: "NW-003", name: "供应链金融链", type: "联盟链", consensus: "PBFT", status: "stopped", nodes: 6, orgs: 3, tps: 0, blockHeight: 892341, createTime: "2024-10-10", admin: "供应链管理员" },
  { id: "NW-004", name: "医疗数据链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 10, orgs: 6, tps: 2800, blockHeight: 1567234, createTime: "2024-11-05", admin: "医疗联盟管理员" },
  { id: "NW-005", name: "存证公证链", type: "公有链", consensus: "PoA", status: "running", nodes: 15, orgs: 8, tps: 4500, blockHeight: 5623412, createTime: "2024-03-01", admin: "公证联盟管理员" },
  { id: "NW-006", name: "教育存证链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 7, orgs: 4, tps: 1800, blockHeight: 876543, createTime: "2024-12-10", admin: "教育联盟管理员" },
  { id: "NW-007", name: "物流追溯链", type: "联盟链", consensus: "Raft", status: "maintenance", nodes: 9, orgs: 5, tps: 0, blockHeight: 1234567, createTime: "2024-09-20", admin: "物流联盟管理员" },
  { id: "NW-008", name: "版权保护链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 11, orgs: 6, tps: 2400, blockHeight: 2345678, createTime: "2024-07-15", admin: "版权联盟管理员" },
  { id: "NW-009", name: "碳排放链", type: "联盟链", consensus: "PoA", status: "upgrading", nodes: 8, orgs: 4, tps: 0, blockHeight: 345678, createTime: "2025-01-05", admin: "碳排放管理员" },
  { id: "NW-010", name: "公益捐赠链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 6, orgs: 3, tps: 1200, blockHeight: 567890, createTime: "2025-02-20", admin: "公益联盟管理员" },
  { id: "NW-011", name: "测试网络", type: "私有链", consensus: "PoW", status: "error", nodes: 3, orgs: 1, tps: 0, blockHeight: 12345, createTime: "2025-03-01", admin: "测试管理员" },
  { id: "NW-012", name: "侧链-支付", type: "侧链", consensus: "DPoS", status: "running", nodes: 21, orgs: 10, tps: 8500, blockHeight: 9876543, createTime: "2024-04-10", admin: "侧链管理员" },
];

const initialOrgs: OrgData[] = [
  { id: "O-001", networkId: "NW-001", name: "中国银行", role: "创始成员", joinTime: "2024-06-15", nodeCount: 3, status: "active", caCert: "CN=中国银行,O=中国银行,C=CN", caExpiry: "2026-06-15" },
  { id: "O-002", networkId: "NW-001", name: "工商银行", role: "成员", joinTime: "2024-07-01", nodeCount: 2, status: "active", caCert: "CN=工商银行,O=工商银行,C=CN", caExpiry: "2026-07-01" },
  { id: "O-003", networkId: "NW-001", name: "建设银行", role: "成员", joinTime: "2024-07-15", nodeCount: 2, status: "active", caCert: "CN=建设银行,O=建设银行,C=CN", caExpiry: "2026-07-15" },
  { id: "O-004", networkId: "NW-001", name: "农业银行", role: "成员", joinTime: "2024-08-01", nodeCount: 2, status: "active", caCert: "CN=农业银行,O=农业银行,C=CN", caExpiry: "2026-08-01" },
  { id: "O-005", networkId: "NW-001", name: "交通银行", role: "观察成员", joinTime: "2024-09-01", nodeCount: 1, status: "active", caCert: "CN=交通银行,O=交通银行,C=CN", caExpiry: "2026-09-01" },
  { id: "O-006", networkId: "NW-002", name: "市政务服务中心", role: "创始成员", joinTime: "2024-08-20", nodeCount: 3, status: "active", caCert: "CN=市政务,O=市政务,C=CN", caExpiry: "2026-08-20" },
  { id: "O-007", networkId: "NW-002", name: "区数据局", role: "成员", joinTime: "2024-09-01", nodeCount: 2, status: "active", caCert: "CN=区数据局,O=区数据局,C=CN", caExpiry: "2026-09-01" },
  { id: "O-008", networkId: "NW-002", name: "信息中心", role: "成员", joinTime: "2024-09-15", nodeCount: 2, status: "active", caCert: "CN=信息中心,O=信息中心,C=CN", caExpiry: "2026-09-15" },
  { id: "O-009", networkId: "NW-002", name: "监管平台", role: "观察成员", joinTime: "2024-10-01", nodeCount: 1, status: "active", caCert: "CN=监管平台,O=监管平台,C=CN", caExpiry: "2026-10-01" },
  { id: "O-010", networkId: "NW-003", name: "核心企业", role: "创始成员", joinTime: "2024-10-10", nodeCount: 2, status: "active", caCert: "CN=核心企业,O=核心企业,C=CN", caExpiry: "2026-10-10" },
  { id: "O-011", networkId: "NW-003", name: "供应商A", role: "成员", joinTime: "2024-10-15", nodeCount: 2, status: "active", caCert: "CN=供应商A,O=供应商A,C=CN", caExpiry: "2026-10-15" },
  { id: "O-012", networkId: "NW-003", name: "金融机构", role: "成员", joinTime: "2024-10-20", nodeCount: 2, status: "active", caCert: "CN=金融机构,O=金融机构,C=CN", caExpiry: "2026-10-20" },
  { id: "O-013", networkId: "NW-004", name: "三甲医院", role: "创始成员", joinTime: "2024-11-05", nodeCount: 3, status: "active", caCert: "CN=三甲医院,O=三甲医院,C=CN", caExpiry: "2026-11-05" },
  { id: "O-014", networkId: "NW-004", name: "区县医院", role: "成员", joinTime: "2024-11-10", nodeCount: 2, status: "active", caCert: "CN=区县医院,O=区县医院,C=CN", caExpiry: "2026-11-10" },
  { id: "O-015", networkId: "NW-004", name: "医药企业", role: "成员", joinTime: "2024-11-15", nodeCount: 2, status: "active", caCert: "CN=医药企业,O=医药企业,C=CN", caExpiry: "2026-11-15" },
  { id: "O-016", networkId: "NW-004", name: "医保局", role: "成员", joinTime: "2024-11-20", nodeCount: 2, status: "active", caCert: "CN=医保局,O=医保局,C=CN", caExpiry: "2026-11-20" },
  { id: "O-017", networkId: "NW-004", name: "体检机构", role: "观察成员", joinTime: "2024-12-01", nodeCount: 1, status: "active", caCert: "CN=体检机构,O=体检机构,C=CN", caExpiry: "2026-12-01" },
  { id: "O-018", networkId: "NW-004", name: "科研单位", role: "观察成员", joinTime: "2024-12-05", nodeCount: 1, status: "active", caCert: "CN=科研单位,O=科研单位,C=CN", caExpiry: "2026-12-05" },
  { id: "O-019", networkId: "NW-005", name: "公证处", role: "创始成员", joinTime: "2024-03-01", nodeCount: 3, status: "active", caCert: "CN=公证处,O=公证处,C=CN", caExpiry: "2026-03-01" },
  { id: "O-020", networkId: "NW-005", name: "司法鉴定", role: "成员", joinTime: "2024-03-15", nodeCount: 2, status: "active", caCert: "CN=司法鉴定,O=司法鉴定,C=CN", caExpiry: "2026-03-15" },
  { id: "O-021", networkId: "NW-005", name: "律所联盟", role: "成员", joinTime: "2024-04-01", nodeCount: 2, status: "active", caCert: "CN=律所联盟,O=律所联盟,C=CN", caExpiry: "2026-04-01" },
  { id: "O-022", networkId: "NW-005", name: "仲裁机构", role: "成员", joinTime: "2024-04-15", nodeCount: 2, status: "active", caCert: "CN=仲裁机构,O=仲裁机构,C=CN", caExpiry: "2026-04-15" },
  { id: "O-023", networkId: "NW-005", name: "版权中心", role: "成员", joinTime: "2024-05-01", nodeCount: 2, status: "active", caCert: "CN=版权中心,O=版权中心,C=CN", caExpiry: "2026-05-01" },
  { id: "O-024", networkId: "NW-005", name: "知产局", role: "观察成员", joinTime: "2024-05-15", nodeCount: 1, status: "active", caCert: "CN=知产局,O=知产局,C=CN", caExpiry: "2026-05-15" },
  { id: "O-025", networkId: "NW-005", name: "法院", role: "观察成员", joinTime: "2024-06-01", nodeCount: 2, status: "active", caCert: "CN=法院,O=法院,C=CN", caExpiry: "2026-06-01" },
  { id: "O-026", networkId: "NW-005", name: "检察院", role: "观察成员", joinTime: "2024-06-15", nodeCount: 1, status: "active", caCert: "CN=检察院,O=检察院,C=CN", caExpiry: "2026-06-15" },
];

const initialMembers: OrgMember[] = [
  { id: "M-001", orgId: "O-001", name: "张三", role: "管理员", email: "zhangsan@boc.cn", status: "active" },
  { id: "M-002", orgId: "O-001", name: "李四", role: "操作员", email: "lisi@boc.cn", status: "active" },
  { id: "M-003", orgId: "O-001", name: "王五", role: "审计员", email: "wangwu@boc.cn", status: "active" },
  { id: "M-004", orgId: "O-002", name: "赵六", role: "管理员", email: "zhaoliu@icbc.cn", status: "active" },
  { id: "M-005", orgId: "O-002", name: "钱七", role: "操作员", email: "qianqi@icbc.cn", status: "active" },
  { id: "M-006", orgId: "O-006", name: "孙八", role: "管理员", email: "sunba@gov.cn", status: "active" },
  { id: "M-007", orgId: "O-006", name: "周九", role: "操作员", email: "zhoujiu@gov.cn", status: "active" },
  { id: "M-008", orgId: "O-013", name: "吴十", role: "管理员", email: "wushi@hospital.cn", status: "active" },
  { id: "M-009", orgId: "O-019", name: "郑十一", role: "管理员", email: "zheng@notary.cn", status: "active" },
  { id: "M-010", orgId: "O-019", name: "王十二", role: "操作员", email: "wang@notary.cn", status: "active" },
];

const initialChannels: ChannelData[] = [
  { id: "CH-001", networkId: "NW-001", name: "交易通道", orgs: ["O-001", "O-002", "O-003", "O-004"], blockSize: 2, batchTimeout: "2s", status: "running", blockHeight: 1285691, txCount: 8923412 },
  { id: "CH-002", networkId: "NW-001", name: "清算通道", orgs: ["O-001", "O-002", "O-003", "O-004", "O-005"], blockSize: 1, batchTimeout: "1s", status: "running", blockHeight: 956234, txCount: 5623411 },
  { id: "CH-003", networkId: "NW-001", name: "审计通道", orgs: ["O-001", "O-005"], blockSize: 4, batchTimeout: "5s", status: "running", blockHeight: 204156, txCount: 1234567 },
  { id: "CH-004", networkId: "NW-002", name: "政务数据通道", orgs: ["O-006", "O-007", "O-008"], blockSize: 2, batchTimeout: "2s", status: "running", blockHeight: 856234, txCount: 4567890 },
  { id: "CH-005", networkId: "NW-002", name: "监管通道", orgs: ["O-006", "O-007", "O-008", "O-009"], blockSize: 1, batchTimeout: "1s", status: "running", blockHeight: 412345, txCount: 2345678 },
  { id: "CH-006", networkId: "NW-004", name: "医疗数据通道", orgs: ["O-013", "O-014", "O-015", "O-016"], blockSize: 2, batchTimeout: "2s", status: "running", blockHeight: 567234, txCount: 3456789 },
  { id: "CH-007", networkId: "NW-004", name: "科研通道", orgs: ["O-013", "O-016", "O-018"], blockSize: 4, batchTimeout: "5s", status: "running", blockHeight: 123456, txCount: 876543 },
  { id: "CH-008", networkId: "NW-005", name: "存证通道", orgs: ["O-019", "O-020", "O-021", "O-022", "O-023"], blockSize: 2, batchTimeout: "2s", status: "running", blockHeight: 1567234, txCount: 6789012 },
];

const initialNodes: NodeData[] = [
  { id: "N-001", networkId: "NW-001", orgId: "O-001", name: "orderer.boc", role: "orderer", status: "running", channelIds: ["CH-001", "CH-002", "CH-003"] },
  { id: "N-002", networkId: "NW-001", orgId: "O-001", name: "peer0.boc", role: "peer", status: "running", channelIds: ["CH-001", "CH-002", "CH-003"] },
  { id: "N-003", networkId: "NW-001", orgId: "O-001", name: "peer1.boc", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-004", networkId: "NW-001", orgId: "O-002", name: "peer0.icbc", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-005", networkId: "NW-001", orgId: "O-002", name: "peer1.icbc", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-006", networkId: "NW-001", orgId: "O-003", name: "peer0.ccb", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-007", networkId: "NW-001", orgId: "O-003", name: "peer1.ccb", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-008", networkId: "NW-001", orgId: "O-004", name: "peer0.abc", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-009", networkId: "NW-001", orgId: "O-004", name: "peer1.abc", role: "peer", status: "running", channelIds: ["CH-001", "CH-002"] },
  { id: "N-010", networkId: "NW-001", orgId: "O-005", name: "peer0.bocom", role: "peer", status: "running", channelIds: ["CH-002", "CH-003"] },
  { id: "N-011", networkId: "NW-001", orgId: "O-005", name: "client.bocom", role: "client", status: "running", channelIds: ["CH-002"] },
  { id: "N-012", networkId: "NW-001", orgId: "O-001", name: "client.boc", role: "client", status: "running", channelIds: ["CH-001", "CH-002", "CH-003"] },
  { id: "N-013", networkId: "NW-002", orgId: "O-006", name: "orderer.gov", role: "orderer", status: "running", channelIds: ["CH-004", "CH-005"] },
  { id: "N-014", networkId: "NW-002", orgId: "O-006", name: "peer0.gov", role: "peer", status: "running", channelIds: ["CH-004", "CH-005"] },
  { id: "N-015", networkId: "NW-002", orgId: "O-007", name: "peer0.data", role: "peer", status: "running", channelIds: ["CH-004", "CH-005"] },
  { id: "N-016", networkId: "NW-002", orgId: "O-008", name: "peer0.info", role: "peer", status: "running", channelIds: ["CH-004", "CH-005"] },
  { id: "N-017", networkId: "NW-004", orgId: "O-013", name: "orderer.hospital", role: "orderer", status: "running", channelIds: ["CH-006", "CH-007"] },
  { id: "N-018", networkId: "NW-004", orgId: "O-013", name: "peer0.hospital", role: "peer", status: "running", channelIds: ["CH-006", "CH-007"] },
  { id: "N-019", networkId: "NW-004", orgId: "O-014", name: "peer0.district", role: "peer", status: "running", channelIds: ["CH-006"] },
  { id: "N-020", networkId: "NW-004", orgId: "O-015", name: "peer0.pharma", role: "peer", status: "running", channelIds: ["CH-006"] },
  { id: "N-021", networkId: "NW-004", orgId: "O-016", name: "peer0.insurance", role: "peer", status: "running", channelIds: ["CH-006", "CH-007"] },
  { id: "N-022", networkId: "NW-004", orgId: "O-018", name: "peer0.research", role: "peer", status: "running", channelIds: ["CH-007"] },
];

const initialAlerts: AlertData[] = [
  { id: "AL-001", networkId: "NW-001", time: "2026-04-28 09:30:00", level: "warn", message: "节点 peer1.boc CPU使用率超过80%", source: "peer1.boc" },
  { id: "AL-002", networkId: "NW-001", time: "2026-04-28 09:15:00", level: "error", message: "通道 清算通道 区块提交延迟超过5s", source: "CH-002" },
  { id: "AL-003", networkId: "NW-004", time: "2026-04-28 08:45:00", level: "info", message: "节点 peer0.hospital 成功同步区块", source: "peer0.hospital" },
  { id: "AL-004", networkId: "NW-002", time: "2026-04-28 08:30:00", level: "warn", message: "节点 peer0.gov 内存使用率超过75%", source: "peer0.gov" },
  { id: "AL-005", networkId: "NW-005", time: "2026-04-28 07:00:00", level: "critical", message: "Orderer集群主节点切换", source: "orderer.notary" },
  { id: "AL-006", networkId: "NW-001", time: "2026-04-28 06:30:00", level: "info", message: "网络备份完成", source: "backup-service" },
  { id: "AL-007", networkId: "NW-009", time: "2026-04-28 05:00:00", level: "warn", message: "网络升级进度 65%", source: "upgrade-service" },
  { id: "AL-008", networkId: "NW-011", time: "2026-04-28 04:20:00", level: "error", message: "节点连接超时，共识失败", source: "node-001" },
];

/* ─── Sub-Components ─── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    running: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    stopped: { text: "已停止", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    initializing: { text: "初始化中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    maintenance: { text: "维护中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    upgrading: { text: "升级中", class: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    error: { text: "故障", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    active: { text: "正常", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    revoked: { text: "已吊销", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.stopped;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function AlertLevelBadge({ level }: { level: string }) {
  const config: Record<string, string> = {
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    warn: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200",
  };
  const textMap: Record<string, string> = { info: "信息", warn: "警告", error: "错误", critical: "严重" };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", config[level] || config.info)}>{textMap[level] || level}</span>;
}

/* ECharts Topology Graph */
function TopologyChart({ networkId, nodes, orgs, channels, onNodeClick }: {
  networkId: string;
  nodes: NodeData[];
  orgs: OrgData[];
  channels: ChannelData[];
  onNodeClick?: (data: any) => void;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const networkNodes = nodes.filter(n => n.networkId === networkId);
  const networkOrgs = orgs.filter(o => o.networkId === networkId);
  const networkChannels = channels.filter(c => c.networkId === networkId);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const graphNodes: any[] = [];
    const graphLinks: any[] = [];

    // Organizations as rectangles
    networkOrgs.forEach((org, idx) => {
      graphNodes.push({
        id: org.id,
        name: org.name,
        symbol: "rect",
        symbolSize: [80, 40],
        x: Math.cos((idx / networkOrgs.length) * Math.PI * 2) * 200,
        y: Math.sin((idx / networkOrgs.length) * Math.PI * 2) * 200,
        itemStyle: { color: "#6366f1" },
        label: { show: true, fontSize: 11 },
        category: "org",
        data: org,
      });
    });

    // Nodes as circles
    networkNodes.forEach((node) => {
      const colorMap: Record<string, string> = {
        orderer: "#f59e0b",
        peer: "#10b981",
        client: "#3b82f6",
      };
      graphNodes.push({
        id: node.id,
        name: node.name,
        symbol: "circle",
        symbolSize: 30,
        itemStyle: { color: colorMap[node.role] || "#6b7280" },
        label: { show: true, fontSize: 10 },
        category: "node",
        data: node,
      });
      // Link to org
      graphLinks.push({
        source: node.orgId,
        target: node.id,
        lineStyle: { color: "#cbd5e1", width: 1 },
      });
    });

    // Channels as diamonds
    networkChannels.forEach((ch, idx) => {
      graphNodes.push({
        id: ch.id,
        name: ch.name,
        symbol: "diamond",
        symbolSize: 40,
        x: Math.cos((idx / Math.max(networkChannels.length, 1)) * Math.PI * 2 + Math.PI / networkChannels.length) * 120,
        y: Math.sin((idx / Math.max(networkChannels.length, 1)) * Math.PI * 2 + Math.PI / networkChannels.length) * 120,
        itemStyle: { color: "#8b5cf6" },
        label: { show: true, fontSize: 11 },
        category: "channel",
        data: ch,
      });
      // Link channel to orgs
      ch.orgs.forEach(orgId => {
        graphLinks.push({
          source: orgId,
          target: ch.id,
          lineStyle: { color: "#a78bfa", width: 1, type: "dashed" },
        });
      });
      // Link channel to nodes in those orgs
      networkNodes.filter(n => ch.orgs.includes(n.orgId)).forEach(node => {
        graphLinks.push({
          source: ch.id,
          target: node.id,
          lineStyle: { color: "#c4b5fd", width: 1 },
        });
      });
    });

    chart.setOption({
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const d = params.data.data;
          if (!d) return params.name;
          if (params.data.category === "org") {
            return `<strong>${d.name}</strong><br/>角色: ${d.role}<br/>节点数: ${d.nodeCount}<br/>状态: ${d.status}`;
          }
          if (params.data.category === "node") {
            return `<strong>${d.name}</strong><br/>角色: ${d.role}<br/>状态: ${d.status}`;
          }
          if (params.data.category === "channel") {
            return `<strong>${d.name}</strong><br/>区块高度: ${d.blockHeight}<br/>状态: ${d.status}`;
          }
          return params.name;
        },
      },
      series: [{
        type: "graph",
        layout: "force",
        data: graphNodes,
        links: graphLinks,
        roam: true,
        zoom: 0.8,
        label: { show: true, position: "bottom" },
        force: {
          repulsion: 400,
          edgeLength: 100,
          gravity: 0.1,
        },
        emphasis: {
          focus: "adjacency",
          lineStyle: { width: 3 },
        },
      }],
      legend: {
        data: ["组织", "节点", "通道"],
        bottom: 10,
      },
    });

    chart.on("click", (params: any) => {
      if (onNodeClick && params.data?.data) {
        onNodeClick(params.data.data);
      }
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [networkId, networkNodes, networkOrgs, networkChannels, onNodeClick]);

  return (
    <div className={cn("relative border rounded-lg overflow-hidden bg-white dark:bg-[#1e293b]", isFullscreen ? "fixed inset-0 z-50" : "h-[500px]")}>
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
      {isFullscreen && (
        <div className="absolute top-3 left-3 z-10">
          <Button size="sm" variant="outline" onClick={() => setIsFullscreen(false)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 退出全屏
          </Button>
        </div>
      )}
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      <div className="absolute bottom-3 left-3 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-sm inline-block" /> 组织</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-full inline-block" /> Orderer</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> Peer</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full inline-block" /> Client</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-violet-500 rotate-45 inline-block" style={{ width: 8, height: 8 }} /> 通道</span>
      </div>
    </div>
  );
}

/* TPS Trend Chart */
function TPSTrendChart({ networkId }: { networkId: string }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    const baseTps = networkId === "NW-001" ? 3200 : networkId === "NW-002" ? 1500 : 2000;
    const data = hours.map((_, i) => {
      const factor = i >= 9 && i <= 18 ? 1.2 : 0.6;
      return Math.round(baseTps * factor + (Math.random() - 0.5) * baseTps * 0.3);
    });

    chart.setOption({
      tooltip: { trigger: "axis" },
      grid: { top: 16, right: 16, bottom: 32, left: 56 },
      xAxis: { type: "category", data: hours, axisLabel: { fontSize: 10 } },
      yAxis: { type: "value", name: "TPS", axisLabel: { fontSize: 10 } },
      series: [{
        type: "line",
        data,
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#6366f1", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(99, 102, 241, 0.3)" },
            { offset: 1, color: "rgba(99, 102, 241, 0.05)" },
          ]),
        },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [networkId]);

  return <div ref={chartRef} style={{ width: "100%", height: 240 }} />;
}

/* Block Height Comparison Chart */
function BlockHeightChart({ channels }: { channels: ChannelData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: { trigger: "axis", formatter: (p: any) => `${p[0].name}<br/>区块高度: ${p[0].value.toLocaleString()}` },
      grid: { top: 16, right: 16, bottom: 40, left: 80 },
      xAxis: { type: "value", axisLabel: { fontSize: 10, formatter: (v: number) => (v / 10000).toFixed(0) + "万" } },
      yAxis: { type: "category", data: channels.map(c => c.name), axisLabel: { fontSize: 11 } },
      series: [{
        type: "bar",
        data: channels.map(c => c.blockHeight),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: "#6366f1" },
            { offset: 1, color: "#a5b4fc" },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 20,
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [channels]);

  return <div ref={chartRef} style={{ width: "100%", height: 200 }} />;
}

/* ─── Main Component ─── */
const networkFields: FieldConfig[] = [
  { key: "name", label: "网络名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "联盟链", value: "联盟链" },
    { label: "公有链", value: "公有链" },
    { label: "私有链", value: "私有链" },
    { label: "侧链", value: "侧链" },
    { label: "子链", value: "子链" },
    { label: "Layer2", value: "Layer2" },
  ]},
  { key: "consensus", label: "共识机制", type: "select", required: true, options: [
    { label: "PBFT", value: "PBFT" },
    { label: "Raft", value: "Raft" },
    { label: "PoA", value: "PoA" },
    { label: "PoW", value: "PoW" },
    { label: "PoS", value: "PoS" },
    { label: "DPoS", value: "DPoS" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "运行中", value: "running" },
    { label: "已停止", value: "stopped" },
    { label: "初始化中", value: "initializing" },
    { label: "维护中", value: "maintenance" },
    { label: "升级中", value: "upgrading" },
    { label: "故障", value: "error" },
  ]},
  { key: "nodes", label: "节点数", type: "number", required: true },
  { key: "tps", label: "TPS", type: "number", required: true },
  { key: "blockHeight", label: "区块高度", type: "number", required: true },
  { key: "admin", label: "管理员", type: "text", required: true },
];

export default function BlockchainNetwork() {
  const [networks, setNetworks] = useState<NetworkData[]>(initialNetworks);
  const [orgs, setOrgs] = useState<OrgData[]>(initialOrgs);
  const [members, setMembers] = useState<OrgMember[]>(initialMembers);
  const [channels, setChannels] = useState<ChannelData[]>(initialChannels);
  const [nodes] = useState<NodeData[]>(initialNodes);
  const [alerts, setAlerts] = useState<AlertData[]>(initialAlerts);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail state
  const [detailNet, setDetailNet] = useState<NetworkData | null>(null);
  const [detailTab, setDetailTab] = useState("info");

  // Org dialog state
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgDialogMode, setOrgDialogMode] = useState<"create" | "edit">("create");
  const [orgForm, setOrgForm] = useState({ name: "", role: "成员", nodeCount: 1 });
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  // Org detail drawer
  const [orgDetail, setOrgDetail] = useState<OrgData | null>(null);
  const [orgDetailTab, setOrgDetailTab] = useState("basic");
  const [newMemberForm, setNewMemberForm] = useState({ name: "", role: "操作员", email: "" });

  // Network lifecycle
  const [lifecycleDialog, setLifecycleDialog] = useState<{ open: boolean; action: string; title: string; description: string; impact: string[] }>({
    open: false, action: "", title: "", description: "", impact: [],
  });
  const [progressDialog, setProgressDialog] = useState<{ open: boolean; title: string; progress: number; step: string }>({
    open: false, title: "", progress: 0, step: "",
  });

  // Channel wizard
  const [channelWizardOpen, setChannelWizardOpen] = useState(false);
  const [channelWizardStep, setChannelWizardStep] = useState(1);
  const [newChannel, setNewChannel] = useState<Partial<ChannelData>>({ name: "", orgs: [], blockSize: 2, batchTimeout: "2s" });
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [channelConfigOpen, setChannelConfigOpen] = useState(false);

  // Topology tooltip
  const [topologyDetail, setTopologyDetail] = useState<any | null>(null);

  const filtered = networks.filter(n => n.name.includes(search) || n.type.includes(search));
  const runningCount = networks.filter(n => n.status === "running").length;

  const networkOrgs = detailNet ? orgs.filter(o => o.networkId === detailNet.id) : [];
  const networkChannels = detailNet ? channels.filter(c => c.networkId === detailNet.id) : [];
  const networkAlerts = detailNet ? alerts.filter(a => a.networkId === detailNet.id) : [];
  const networkNodes = detailNet ? nodes.filter(n => n.networkId === detailNet.id) : [];

  const healthScore = useMemo(() => {
    if (!detailNet) return 0;
    let score = 100;
    const runningNodes = networkNodes.filter(n => n.status === "running").length;
    const runningChannels = networkChannels.filter(c => c.status === "running").length;
    const errorAlerts = networkAlerts.filter(a => a.level === "error" || a.level === "critical").length;

    if (detailNet.status !== "running") score -= 30;
    if (networkNodes.length > 0) score -= (1 - runningNodes / networkNodes.length) * 30;
    if (networkChannels.length > 0) score -= (1 - runningChannels / networkChannels.length) * 20;
    score -= Math.min(errorAlerts * 5, 20);
    return Math.max(0, Math.round(score));
  }, [detailNet, networkNodes, networkChannels, networkAlerts]);

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "",
      type: "联盟链",
      consensus: "PBFT",
      status: "initializing",
      nodes: 0,
      tps: 0,
      blockHeight: 0,
      admin: "",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (net: NetworkData) => {
    setDialogMode("edit");
    setDialogData({
      name: net.name,
      type: net.type,
      consensus: net.consensus,
      status: net.status,
      nodes: net.nodes,
      tps: net.tps,
      blockHeight: net.blockHeight,
      admin: net.admin,
    });
    setEditingId(net.id);
    setDialogOpen(true);
  };

  const handleDelete = (net: NetworkData) => {
    setDialogMode("delete");
    setEditingId(net.id);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const id = generateNetworkId(networks);
      const newNetwork: NetworkData = {
        id,
        name: data.name,
        type: data.type,
        consensus: data.consensus,
        status: data.status,
        nodes: Number(data.nodes),
        orgs: 0,
        tps: Number(data.tps),
        blockHeight: Number(data.blockHeight),
        createTime: todayStr(),
        admin: data.admin,
      };
      setNetworks(prev => [...prev, newNetwork]);
    } else if (dialogMode === "edit" && editingId) {
      setNetworks(prev =>
        prev.map(n =>
          n.id === editingId
            ? {
                ...n,
                name: data.name,
                type: data.type,
                consensus: data.consensus,
                status: data.status,
                nodes: Number(data.nodes),
                tps: Number(data.tps),
                blockHeight: Number(data.blockHeight),
                admin: data.admin,
              }
            : n
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setNetworks(prev => prev.filter(n => n.id !== editingId));
      setOrgs(prev => prev.filter(o => o.networkId !== editingId));
      setChannels(prev => prev.filter(c => c.networkId !== editingId));
      setAlerts(prev => prev.filter(a => a.networkId !== editingId));
    }
    setDialogOpen(false);
  };

  const handleAddOrg = () => {
    setOrgDialogMode("create");
    setOrgForm({ name: "", role: "成员", nodeCount: 1 });
    setEditingOrgId(null);
    setOrgDialogOpen(true);
  };

  const handleEditOrg = (org: OrgData) => {
    setOrgDialogMode("edit");
    setOrgForm({ name: org.name, role: org.role, nodeCount: org.nodeCount });
    setEditingOrgId(org.id);
    setOrgDialogOpen(true);
  };

  const handleDeleteOrg = (orgId: string) => {
    const org = orgs.find(o => o.id === orgId);
    if (!org || !detailNet) return;
    setOrgs(prev => prev.filter(o => o.id !== orgId));
    setMembers(prev => prev.filter(m => m.orgId !== orgId));
    setNetworks(prev =>
      prev.map(n =>
        n.id === detailNet.id
          ? { ...n, orgs: Math.max(0, n.orgs - 1), nodes: Math.max(0, n.nodes - org.nodeCount) }
          : n
      )
    );
  };

  const handleSaveOrg = () => {
    if (!detailNet || !orgForm.name.trim()) return;
    if (orgDialogMode === "create") {
      const newOrg: OrgData = {
        id: `O-${generateId()}`,
        networkId: detailNet.id,
        name: orgForm.name,
        role: orgForm.role,
        joinTime: todayStr(),
        nodeCount: Number(orgForm.nodeCount),
        status: "active",
        caCert: `CN=${orgForm.name},O=${orgForm.name},C=CN`,
        caExpiry: `${new Date().getFullYear() + 2}-${todayStr().slice(5)}`,
      };
      setOrgs(prev => [...prev, newOrg]);
      setNetworks(prev =>
        prev.map(n =>
          n.id === detailNet.id
            ? { ...n, orgs: n.orgs + 1, nodes: n.nodes + newOrg.nodeCount }
            : n
        )
      );
    } else if (orgDialogMode === "edit" && editingOrgId) {
      const oldOrg = orgs.find(o => o.id === editingOrgId);
      setOrgs(prev =>
        prev.map(o =>
          o.id === editingOrgId
            ? { ...o, name: orgForm.name, role: orgForm.role, nodeCount: Number(orgForm.nodeCount) }
            : o
        )
      );
      if (oldOrg) {
        const diff = Number(orgForm.nodeCount) - oldOrg.nodeCount;
        setNetworks(prev =>
          prev.map(n =>
            n.id === detailNet.id
              ? { ...n, nodes: Math.max(0, n.nodes + diff) }
              : n
          )
        );
      }
    }
    setOrgForm({ name: "", role: "成员", nodeCount: 1 });
    setOrgDialogOpen(false);
  };

  const handleAddMember = () => {
    if (!orgDetail || !newMemberForm.name.trim() || !newMemberForm.email.trim()) return;
    const newMember: OrgMember = {
      id: `M-${generateId()}`,
      orgId: orgDetail.id,
      name: newMemberForm.name,
      role: newMemberForm.role,
      email: newMemberForm.email,
      status: "active",
    };
    setMembers(prev => [...prev, newMember]);
    setNewMemberForm({ name: "", role: "操作员", email: "" });
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleUpdateCaCert = (orgId: string, newCert: string) => {
    setOrgs(prev =>
      prev.map(o =>
        o.id === orgId
          ? { ...o, caCert: newCert, caExpiry: `${new Date().getFullYear() + 2}-${todayStr().slice(5)}` }
          : o
      )
    );
    if (orgDetail && orgDetail.id === orgId) {
      setOrgDetail(prev => prev ? { ...prev, caCert: newCert, caExpiry: `${new Date().getFullYear() + 2}-${todayStr().slice(5)}` } : null);
    }
  };

  const handleRevokeCaCert = (orgId: string) => {
    setOrgs(prev =>
      prev.map(o =>
        o.id === orgId ? { ...o, status: "revoked" } : o
      )
    );
    if (orgDetail && orgDetail.id === orgId) {
      setOrgDetail(prev => prev ? { ...prev, status: "revoked" } : null);
    }
  };

  const runLifecycleAction = useCallback((action: string) => {
    if (!detailNet) return;
    const actions: Record<string, { title: string; description: string; impact: string[] }> = {
      start: {
        title: "启动网络",
        description: `确定要启动网络 "${detailNet.name}" 吗？将按顺序启动所有节点和通道。`,
        impact: ["所有节点将按顺序启动", "通道状态将恢复为运行中", "网络TPS将恢复正常水平", "此操作预计需要 2-5 分钟"],
      },
      stop: {
        title: "停止网络",
        description: `确定要停止网络 "${detailNet.name}" 吗？将按反向顺序停止所有节点和通道。`,
        impact: ["所有通道将按反向顺序停止", "所有节点将依次关闭", "网络TPS将降为0", "此操作预计需要 1-3 分钟"],
      },
      upgrade: {
        title: "升级网络",
        description: `确定要升级网络 "${detailNet.name}" 的共识版本吗？`,
        impact: ["共识协议将升级到新版本", "升级期间网络将短暂不可用", "所有节点需要同步升级", "此操作预计需要 5-10 分钟", "建议先备份网络配置"],
      },
      archive: {
        title: "归档网络",
        description: `确定要归档网络 "${detailNet.name}" 吗？网络将被停止并迁移到冷存储。`,
        impact: ["网络将先停止运行", "所有数据将迁移到冷存储", "网络配置将被保留", "归档后可以通过恢复操作重新激活", "此操作不可撤销"],
      },
    };
    const a = actions[action];
    if (a) {
      setLifecycleDialog({ open: true, action, title: a.title, description: a.description, impact: a.impact });
    }
  }, [detailNet]);

  const confirmLifecycleAction = () => {
    if (!detailNet) return;
    setLifecycleDialog(prev => ({ ...prev, open: false }));
    setProgressDialog({ open: true, title: lifecycleDialog.title, progress: 0, step: "准备中..." });

    const steps = lifecycleDialog.action === "start"
      ? ["检查网络配置", "启动Orderer节点", "启动Peer节点", "启动通道", "验证网络状态"]
      : lifecycleDialog.action === "stop"
      ? ["停止通道", "停止Peer节点", "停止Orderer节点", "清理资源", "验证停止状态"]
      : lifecycleDialog.action === "upgrade"
      ? ["备份当前配置", "下载新版本", "升级Orderer", "升级Peer", "验证共识协议", "恢复网络"]
      : ["停止网络", "导出数据", "迁移到冷存储", "更新状态", "清理资源"];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      const progress = Math.min(100, Math.round((stepIdx / steps.length) * 100));
      if (stepIdx >= steps.length) {
        clearInterval(interval);
        setProgressDialog(prev => ({ ...prev, progress: 100, step: "完成" }));
        setTimeout(() => {
          setProgressDialog({ open: false, title: "", progress: 0, step: "" });
          if (lifecycleDialog.action === "start") {
            setNetworks(prev => prev.map(n => n.id === detailNet.id ? { ...n, status: "running" } : n));
          } else if (lifecycleDialog.action === "stop" || lifecycleDialog.action === "archive") {
            setNetworks(prev => prev.map(n => n.id === detailNet.id ? { ...n, status: lifecycleDialog.action === "archive" ? "archived" : "stopped", tps: 0 } : n));
          } else if (lifecycleDialog.action === "upgrade") {
            setNetworks(prev => prev.map(n => n.id === detailNet.id ? { ...n, status: "running" } : n));
          }
          if (detailNet) {
            setDetailNet(prev => prev ? { ...prev, status: lifecycleDialog.action === "archive" ? "archived" : lifecycleDialog.action === "stop" ? "stopped" : "running", tps: lifecycleDialog.action === "start" ? prev.tps : 0 } : null);
          }
        }, 800);
      } else {
        setProgressDialog(prev => ({ ...prev, progress, step: steps[stepIdx] }));
      }
    }, 600);
  };

  const handleCreateChannel = () => {
    if (!detailNet) return;
    setNewChannel({ name: "", orgs: [networkOrgs[0]?.id].filter(Boolean) as string[], blockSize: 2, batchTimeout: "2s" });
    setChannelWizardStep(1);
    setChannelWizardOpen(true);
  };

  const handleSaveChannel = () => {
    if (!detailNet || !newChannel.name || !newChannel.orgs || newChannel.orgs.length === 0) return;
    const channel: ChannelData = {
      id: `CH-${generateId()}`,
      networkId: detailNet.id,
      name: newChannel.name,
      orgs: newChannel.orgs,
      blockSize: Number(newChannel.blockSize) || 2,
      batchTimeout: newChannel.batchTimeout || "2s",
      status: "running",
      blockHeight: 0,
      txCount: 0,
    };
    setChannels(prev => [...prev, channel]);
    setChannelWizardOpen(false);
  };

  const handleUpdateChannel = () => {
    if (!selectedChannel) return;
    setChannels(prev =>
      prev.map(c =>
        c.id === selectedChannel.id
          ? { ...selectedChannel }
          : c
      )
    );
    setChannelConfigOpen(false);
    setSelectedChannel(null);
  };

  const handleStartChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, status: "running" } : c));
  };

  const handleStopChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, status: "stopped" } : c));
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannels(prev => prev.filter(c => c.id !== channelId));
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">区块链网络</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理区块链网络实例，配置共识机制与网络参数</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 创建网络
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "网络总数", value: networks.length, icon: <Network className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "运行中", value: runningCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总节点数", value: networks.reduce((s, n) => s + n.nodes, 0), icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "总TPS", value: networks.reduce((s, n) => s + n.tps, 0), icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索网络名称/类型" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      {/* Network Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["网络名称", "类型", "共识机制", "状态", "节点数", "组织数", "TPS", "区块高度", "创建时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(net => (
              <tr key={net.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{net.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{net.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.consensus}</td>
                <td className="px-4 py-3"><StatusBadge status={net.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.nodes}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.orgs}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.tps.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.blockHeight.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.createTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDetailNet(net)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(net)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(net)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer with Tabs */}
      <Sheet open={!!detailNet} onOpenChange={() => setDetailNet(null)}>
        <SheetContent className="sm:max-w-4xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              网络详情 - {detailNet?.name}
            </SheetTitle>
          </SheetHeader>
          {detailNet && (
            <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="orgs">参与组织</TabsTrigger>
                <TabsTrigger value="channels">通道管理</TabsTrigger>
                <TabsTrigger value="topology">拓扑图</TabsTrigger>
                <TabsTrigger value="health">健康监控</TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "网络ID", value: detailNet.id },
                    { label: "网络名称", value: detailNet.name },
                    { label: "类型", value: detailNet.type },
                    { label: "共识机制", value: detailNet.consensus },
                    { label: "状态", value: <StatusBadge status={detailNet.status} /> },
                    { label: "节点数量", value: `${detailNet.nodes}个` },
                    { label: "组织数量", value: `${detailNet.orgs}个` },
                    { label: "当前TPS", value: detailNet.tps.toLocaleString() },
                    { label: "区块高度", value: detailNet.blockHeight.toLocaleString() },
                    { label: "创建时间", value: detailNet.createTime },
                    { label: "管理员", value: detailNet.admin },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Lifecycle Operations */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> 网络生命周期操作
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => runLifecycleAction("start")} disabled={detailNet.status === "running"}>
                      <Play className="w-3 h-3" /> 启动网络
                    </Button>
                    <Button size="sm" className="gap-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => runLifecycleAction("stop")} disabled={detailNet.status === "stopped" || detailNet.status === "archived"}>
                      <Square className="w-3 h-3" /> 停止网络
                    </Button>
                    <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => runLifecycleAction("upgrade")} disabled={detailNet.status === "archived"}>
                      <ArrowUpCircle className="w-3 h-3" /> 升级网络
                    </Button>
                    <Button size="sm" className="gap-1 bg-slate-600 hover:bg-slate-700 text-white" onClick={() => runLifecycleAction("archive")} disabled={detailNet.status === "archived"}>
                      <Archive className="w-3 h-3" /> 归档网络
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Orgs Tab */}
              <TabsContent value="orgs" className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">参与组织 ({networkOrgs.length})</h3>
                  <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddOrg}>
                    <Plus className="w-3 h-3" /> 添加组织
                  </Button>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-[#273548]">
                      <tr>
                        {["组织名称", "角色", "加入时间", "节点数", "状态", "操作"].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {networkOrgs.map((org) => (
                        <tr key={org.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                            <button className="hover:text-indigo-600 hover:underline text-left" onClick={() => setOrgDetail(org)}>
                              {org.name}
                            </button>
                          </td>
                          <td className="px-4 py-2"><Badge variant="secondary">{org.role}</Badge></td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.joinTime}</td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.nodeCount}</td>
                          <td className="px-4 py-2"><StatusBadge status={org.status} /></td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setOrgDetail(org)}><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEditOrg(org)}><Pencil className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteOrg(org.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {networkOrgs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">暂无组织</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Channels Tab */}
              <TabsContent value="channels" className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">通道列表 ({networkChannels.length})</h3>
                  <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateChannel}>
                    <Plus className="w-3 h-3" /> 创建通道
                  </Button>
                </div>
                <div className="space-y-3">
                  {networkChannels.map(ch => (
                    <div key={ch.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">{ch.name}</span>
                          <StatusBadge status={ch.status} />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedChannel(ch); setChannelConfigOpen(true); }}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          {ch.status === "stopped" ? (
                            <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleStartChannel(ch.id)}>
                              <Play className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => handleStopChannel(ch.id)}>
                              <Square className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteChannel(ch.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div>区块高度: <span className="font-medium text-slate-900 dark:text-slate-100">{ch.blockHeight.toLocaleString()}</span></div>
                        <div>交易数: <span className="font-medium text-slate-900 dark:text-slate-100">{ch.txCount.toLocaleString()}</span></div>
                        <div>区块大小: <span className="font-medium text-slate-900 dark:text-slate-100">{ch.blockSize}MB</span></div>
                        <div>批处理超时: <span className="font-medium text-slate-900 dark:text-slate-100">{ch.batchTimeout}</span></div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ch.orgs.map(orgId => {
                          const org = orgs.find(o => o.id === orgId);
                          return org ? <Badge key={orgId} variant="outline" className="text-xs">{org.name}</Badge> : null;
                        })}
                      </div>
                    </div>
                  ))}
                  {networkChannels.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">暂无通道</div>
                  )}
                </div>
              </TabsContent>

              {/* Topology Tab */}
              <TabsContent value="topology" className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">网络拓扑图</h3>
                  <span className="text-xs text-slate-500">支持缩放、拖拽，点击查看详情</span>
                </div>
                <TopologyChart
                  networkId={detailNet.id}
                  nodes={nodes}
                  orgs={orgs}
                  channels={channels}
                  onNodeClick={setTopologyDetail}
                />
                {topologyDetail && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-[#273548]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{topologyDetail.name || topologyDetail.id}</span>
                      <Button size="sm" variant="ghost" onClick={() => setTopologyDetail(null)}><X className="w-3 h-3" /></Button>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {Object.entries(topologyDetail).filter(([k]) => !["id", "networkId", "orgId", "channelIds"].includes(k)).map(([k, v]) => (
                        <div key={k}><span className="capitalize">{k}</span>: {String(v)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Health Tab */}
              <TabsContent value="health" className="pt-4 space-y-4">
                {/* Health Score Card */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> 健康评分
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className={cn("text-4xl font-bold", healthScore >= 80 ? "text-emerald-600" : healthScore >= 60 ? "text-amber-600" : "text-red-600")}>
                          {healthScore}
                        </span>
                        <span className="text-sm text-slate-500 mb-1">/ 100</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {healthScore >= 80 ? "网络健康状态良好" : healthScore >= 60 ? "网络存在轻微问题" : "网络健康状态较差，需要关注"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-500" /> 节点状态
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {networkNodes.filter(n => n.status === "running").length} / {networkNodes.length}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">运行中 / 总节点</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Database className="w-4 h-4 text-violet-500" /> 通道状态
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {networkChannels.filter(c => c.status === "running").length} / {networkChannels.length}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">运行中 / 总通道</div>
                    </CardContent>
                  </Card>
                </div>

                {/* TPS Trend */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> 24小时TPS趋势
                  </div>
                  <TPSTrendChart networkId={detailNet.id} />
                </div>

                {/* Block Height Comparison */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> 各通道区块高度对比
                  </div>
                  <BlockHeightChart channels={networkChannels} />
                </div>

                {/* Recent Alerts */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> 最近告警
                  </div>
                  <div className="space-y-2">
                    {networkAlerts.slice(0, 5).map(alert => (
                      <div key={alert.id} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-slate-50 dark:bg-[#273548]">
                        <AlertLevelBadge level={alert.level} />
                        <div className="flex-1">
                          <div className="text-slate-900 dark:text-slate-100">{alert.message}</div>
                          <div className="text-xs text-slate-500 mt-1">{alert.time} · {alert.source}</div>
                        </div>
                      </div>
                    ))}
                    {networkAlerts.length === 0 && (
                      <div className="text-center py-4 text-slate-500">暂无告警</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Org Add/Edit Dialog */}
      <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{orgDialogMode === "create" ? "添加组织" : "编辑组织"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>组织名称</Label>
              <Input value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="输入组织名称" />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <select
                value={orgForm.role}
                onChange={e => setOrgForm({ ...orgForm, role: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm"
              >
                <option>创始成员</option>
                <option>成员</option>
                <option>观察成员</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>节点数</Label>
              <Input type="number" min={1} value={orgForm.nodeCount} onChange={e => setOrgForm({ ...orgForm, nodeCount: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrgDialogOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveOrg} disabled={!orgForm.name.trim()}>
              {orgDialogMode === "create" ? "添加" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Org Detail Drawer */}
      <DetailDrawer
        open={!!orgDetail}
        onOpenChange={() => setOrgDetail(null)}
        title={orgDetail?.name || "组织详情"}
        data={orgDetail || {}}
        fields={[
          { key: "name", label: "组织名称" },
          { key: "role", label: "角色", type: "badge" as const },
          { key: "joinTime", label: "加入时间", type: "date" },
          { key: "nodeCount", label: "节点数" },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "caCert", label: "CA证书" },
          { key: "caExpiry", label: "证书过期时间", type: "date" },
        ]}
        onEdit={() => {
          if (orgDetail) {
            setOrgDetail(null);
            handleEditOrg(orgDetail);
          }
        }}
        onDelete={() => {
          if (orgDetail) {
            handleDeleteOrg(orgDetail.id);
            setOrgDetail(null);
          }
        }}
      />

      {/* Org Detail Tabs (Sheet for more complex org detail) */}
      <Sheet open={!!orgDetail} onOpenChange={() => setOrgDetail(null)}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              {orgDetail?.name}
            </SheetTitle>
          </SheetHeader>
          {orgDetail && (
            <Tabs value={orgDetailTab} onValueChange={setOrgDetailTab} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="members">成员管理</TabsTrigger>
                <TabsTrigger value="ca">CA证书</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-4 space-y-3">
                {[
                  { label: "组织ID", value: orgDetail.id },
                  { label: "组织名称", value: orgDetail.name },
                  { label: "角色", value: <Badge variant="secondary">{orgDetail.role}</Badge> },
                  { label: "加入时间", value: orgDetail.joinTime },
                  { label: "节点数", value: orgDetail.nodeCount },
                  { label: "状态", value: <StatusBadge status={orgDetail.status} /> },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setOrgDetail(null); handleEditOrg(orgDetail); }}>
                    <Pencil className="w-4 h-4 mr-1" /> 编辑
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => { handleDeleteOrg(orgDetail.id); setOrgDetail(null); }}>
                    <Trash2 className="w-4 h-4 mr-1" /> 删除
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="members" className="pt-4 space-y-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3">添加成员</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="姓名" value={newMemberForm.name} onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })} />
                    <Input placeholder="邮箱" value={newMemberForm.email} onChange={e => setNewMemberForm({ ...newMemberForm, email: e.target.value })} />
                    <select
                      value={newMemberForm.role}
                      onChange={e => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                      className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm"
                    >
                      <option>管理员</option>
                      <option>操作员</option>
                      <option>审计员</option>
                    </select>
                  </div>
                  <Button size="sm" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={handleAddMember} disabled={!newMemberForm.name.trim() || !newMemberForm.email.trim()}>
                    <UserPlus className="w-3 h-3" /> 添加成员
                  </Button>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.filter(m => m.orgId === orgDetail.id).map(member => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{member.email}</TableCell>
                          <TableCell><StatusBadge status={member.status} /></TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleRemoveMember(member.id)}>
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {members.filter(m => m.orgId === orgDetail.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">暂无成员</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="ca" className="pt-4 space-y-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" /> CA证书信息
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">证书主题</span><span className="text-slate-900 dark:text-slate-100 font-mono text-xs">{orgDetail.caCert || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">过期时间</span><span className="text-slate-900 dark:text-slate-100">{orgDetail.caExpiry || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">状态</span><StatusBadge status={orgDetail.status} /></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1" onClick={() => handleUpdateCaCert(orgDetail.id, `CN=${orgDetail.name},O=${orgDetail.name},C=CN (更新于 ${nowStr()})`)}>
                    <Key className="w-4 h-4" /> 更新证书
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-1" onClick={() => handleRevokeCaCert(orgDetail.id)} disabled={orgDetail.status === "revoked"}>
                    <XCircle className="w-4 h-4" /> 吊销证书
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Lifecycle Confirmation Dialog */}
      <Dialog open={lifecycleDialog.open} onOpenChange={open => setLifecycleDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              {lifecycleDialog.title}
            </DialogTitle>
            <DialogDescription>{lifecycleDialog.description}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="text-sm font-medium mb-2">影响分析:</div>
            <ul className="space-y-1">
              {lifecycleDialog.impact.map((item, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLifecycleDialog(prev => ({ ...prev, open: false }))}>取消</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmLifecycleAction}>确认执行</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={progressDialog.open} onOpenChange={open => setProgressDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              {progressDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{progressDialog.step}</span>
              <span className="font-medium">{progressDialog.progress}%</span>
            </div>
            <Progress value={progressDialog.progress} className="h-2" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Channel Wizard Dialog */}
      <Dialog open={channelWizardOpen} onOpenChange={setChannelWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>创建通道 - 步骤 {channelWizardStep}/3</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {channelWizardStep === 1 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">步骤1: 选择参与组织</div>
                <div className="space-y-2">
                  <Label>通道名称</Label>
                  <Input value={newChannel.name || ""} onChange={e => setNewChannel({ ...newChannel, name: e.target.value })} placeholder="输入通道名称" />
                </div>
                <div className="space-y-2">
                  <Label>选择组织（至少2个）</Label>
                  <div className="border rounded-md p-2 space-y-1 max-h-[200px] overflow-y-auto">
                    {networkOrgs.map(org => {
                      const isSelected = (newChannel.orgs || []).includes(org.id);
                      return (
                        <div
                          key={org.id}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${isSelected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                          onClick={() => {
                            const current = newChannel.orgs || [];
                            const updated = isSelected ? current.filter(id => id !== org.id) : [...current, org.id];
                            setNewChannel({ ...newChannel, orgs: updated });
                          }}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span>{org.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">{org.role}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {channelWizardStep === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">步骤2: 配置背书策略</div>
                <div className="space-y-2">
                  <Label>区块大小 (MB)</Label>
                  <Input type="number" min={1} max={64} value={newChannel.blockSize || 2} onChange={e => setNewChannel({ ...newChannel, blockSize: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>批处理超时</Label>
                  <select
                    value={newChannel.batchTimeout || "2s"}
                    onChange={e => setNewChannel({ ...newChannel, batchTimeout: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm"
                  >
                    <option value="1s">1秒</option>
                    <option value="2s">2秒</option>
                    <option value="5s">5秒</option>
                    <option value="10s">10秒</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>背书策略</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm">
                    <option>大多数组织同意 (MAJORITY)</option>
                    <option>所有组织同意 (ALL)</option>
                    <option>任意组织同意 (ANY)</option>
                    <option>自定义策略</option>
                  </select>
                </div>
              </div>
            )}
            {channelWizardStep === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">步骤3: 确认配置</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">通道名称</span><span className="font-medium">{newChannel.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">参与组织</span><span className="font-medium">{newChannel.orgs?.length || 0} 个</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">区块大小</span><span className="font-medium">{newChannel.blockSize}MB</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">批处理超时</span><span className="font-medium">{newChannel.batchTimeout}</span></div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              if (channelWizardStep > 1) setChannelWizardStep(channelWizardStep - 1);
              else setChannelWizardOpen(false);
            }}>
              {channelWizardStep > 1 ? "上一步" : "取消"}
            </Button>
            {channelWizardStep < 3 ? (
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setChannelWizardStep(channelWizardStep + 1)} disabled={channelWizardStep === 1 && (!newChannel.name || !newChannel.orgs || newChannel.orgs.length < 2)}>
                下一步
              </Button>
            ) : (
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveChannel}>创建</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Config Dialog */}
      <Dialog open={channelConfigOpen} onOpenChange={setChannelConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>通道配置 - {selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>参与组织</Label>
                <div className="border rounded-md p-2 space-y-1 max-h-[160px] overflow-y-auto">
                  {networkOrgs.map(org => {
                    const isSelected = selectedChannel.orgs.includes(org.id);
                    return (
                      <div
                        key={org.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${isSelected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                        onClick={() => {
                          const updated = isSelected
                            ? selectedChannel.orgs.filter(id => id !== org.id)
                            : [...selectedChannel.orgs, org.id];
                          setSelectedChannel({ ...selectedChannel, orgs: updated });
                        }}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span>{org.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>区块大小 (MB)</Label>
                <Input type="number" min={1} max={64} value={selectedChannel.blockSize} onChange={e => setSelectedChannel({ ...selectedChannel, blockSize: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>批处理超时</Label>
                <select
                  value={selectedChannel.batchTimeout}
                  onChange={e => setSelectedChannel({ ...selectedChannel, batchTimeout: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm"
                >
                  <option value="1s">1秒</option>
                  <option value="2s">2秒</option>
                  <option value="5s">5秒</option>
                  <option value="10s">10秒</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setChannelConfigOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleUpdateChannel}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? (networks.find(n => n.id === editingId)?.name || "网络") : "区块链网络"}
        fields={networkFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
