import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FlaskConical, Play, Pause, BarChart3, Search, Plus,
  Filter, ArrowUpDown, MoreHorizontal, FolderKanban, Zap,
  HardDrive, Settings, ChevronDown, Trash2, Edit3, Eye,
  Terminal, Clock, CheckCircle2, AlertTriangle, FileText,
  Users, Globe, BookOpen, XCircle, RotateCcw, Activity,
  Cpu, Database, TrendingUp, LayoutDashboard, Server, Box,
  Share, Copy, UserPlus, UserMinus, Download, Bell, Shield,
  ChevronRight, ChevronLeft, Save, PlayCircle, StopCircle,
  History, Lock, Info, HelpCircle,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

/* ─── Types ─── */
interface Project {
  id: string;
  name: string;
  owner: string;
  type: string;
  status: string;
  startTime: string;
  env: string;
  progress: number;
}

interface Activity {
  id: string;
  action: string;
  target: string;
  user: string;
  time: string;
  type: string;
}

interface RecentSandbox {
  id: string;
  name: string;
  user: string;
  accessedAt: string;
  env: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Viewer";
  joinTime: string;
  avatar?: string;
}

interface AuditEntry {
  id: string;
  time: string;
  operator: string;
  action: string;
  target: string;
  result: "成功" | "失败" | "警告";
  ip: string;
}

interface ScheduledTask {
  id: string;
  name: string;
  script: string;
  cron: string;
  nextRun: string;
  lastRun: string;
  status: "运行中" | "成功" | "失败" | "待运行";
  enabled: boolean;
  history: TaskRun[];
}

interface TaskRun {
  time: string;
  duration: string;
  status: "成功" | "失败";
}

interface PublishHistory {
  id: string;
  projectName: string;
  algorithm: string;
  time: string;
  status: "成功" | "失败";
  operator: string;
}

/* ─── Helpers ─── */
const genId = () => Date.now().toString(36).toUpperCase();

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

const roleDesc: Record<string, string> = {
  Owner: "全部权限：管理、编辑、执行、成员管理",
  Editor: "编辑+执行：可修改代码并运行任务",
  Viewer: "只读：可查看项目，不可修改",
};

/* ─── Templates ─── */
const projectTemplates = [
  { label: "空项目", value: "empty" },
  { label: "数据分析模板", value: "data_analysis" },
  { label: "模型开发模板", value: "model_dev" },
  { label: "数据清洗模板", value: "data_clean" },
];

const templateDefaults: Record<string, Partial<Project>> = {
  empty: { type: "数据分析", env: "Python 3.9", progress: 0, status: "draft" },
  data_analysis: { type: "数据分析", env: "Python 3.9", progress: 10, status: "draft" },
  model_dev: { type: "模型开发", env: "Python 3.10 + PyTorch", progress: 5, status: "draft" },
  data_clean: { type: "数据探查", env: "Python 3.9", progress: 15, status: "draft" },
};

/* ─── Initial Data ─── */
const initialProjects: Project[] = [
  { id: "SBX-2024-001", name: "零售客户画像分析", owner: "张三", type: "数据分析", status: "running", startTime: "2024-01-15", env: "Python 3.9", progress: 78 },
  { id: "SBX-2024-002", name: "信用评分模型", owner: "李四", type: "模型开发", status: "completed", startTime: "2024-01-10", env: "Python 3.10 + PyTorch", progress: 100 },
  { id: "SBX-2024-003", name: "异常交易检测", owner: "王五", type: "模型开发", status: "paused", startTime: "2024-01-20", env: "Python 3.9 + TensorFlow", progress: 45 },
  { id: "SBX-2024-004", name: "供应链预测", owner: "赵六", type: "数据分析", status: "running", startTime: "2024-01-25", env: "R 4.2", progress: 32 },
  { id: "SBX-2024-005", name: "用户流失预警", owner: "张三", type: "模型开发", status: "draft", startTime: "2024-02-01", env: "Python 3.10", progress: 0 },
  { id: "SBX-2024-006", name: "推荐系统实验", owner: "李四", type: "算法实验", status: "running", startTime: "2024-02-05", env: "Python 3.10 + PyTorch", progress: 65 },
  { id: "SBX-2024-007", name: "金融风险预警", owner: "王五", type: "模型开发", status: "completed", startTime: "2024-02-08", env: "Python 3.9", progress: 100 },
  { id: "SBX-2024-008", name: "用户行为分析", owner: "赵六", type: "数据分析", status: "paused", startTime: "2024-02-10", env: "R 4.2", progress: 28 },
  { id: "SBX-2024-009", name: "销量预测模型", owner: "张三", type: "模型开发", status: "draft", startTime: "2024-02-12", env: "Python 3.10", progress: 15 },
  { id: "SBX-2024-010", name: "客户分群实验", owner: "李四", type: "算法实验", status: "running", startTime: "2024-02-15", env: "Julia 1.9", progress: 52 },
];

const initialActivities: Activity[] = [
  { id: "ACT-001", action: "训练完成", target: "信用评分模型", user: "李四", time: "10分钟前", type: "success" },
  { id: "ACT-002", action: "数据导入", target: "零售客户数据", user: "张三", time: "30分钟前", type: "info" },
  { id: "ACT-003", action: "审查驳回", target: "异常交易模型", user: "审核员A", time: "1小时前", type: "warning" },
  { id: "ACT-004", action: "环境创建", target: "Python 3.10", user: "系统", time: "2小时前", type: "info" },
  { id: "ACT-005", action: "任务暂停", target: "供应链预测", user: "赵六", time: "3小时前", type: "warning" },
  { id: "ACT-006", action: "模型发布", target: "用户流失预警", user: "张三", time: "4小时前", type: "success" },
  { id: "ACT-007", action: "数据导出", target: "推荐系统数据", user: "李四", time: "5小时前", type: "info" },
  { id: "ACT-008", action: "审查通过", target: "金融风险预警", user: "审核员B", time: "6小时前", type: "success" },
  { id: "ACT-009", action: "环境更新", target: "R 4.2", user: "系统", time: "8小时前", type: "info" },
  { id: "ACT-010", action: "任务失败", target: "销量预测模型", user: "张三", time: "10小时前", type: "warning" },
];

const recentSandboxes: RecentSandbox[] = [
  { id: "SBX-2024-002", name: "信用评分模型", user: "李四", accessedAt: "5分钟前", env: "Python 3.10 + PyTorch" },
  { id: "SBX-2024-001", name: "零售客户画像分析", user: "张三", accessedAt: "15分钟前", env: "Python 3.9" },
  { id: "SBX-2024-004", name: "供应链预测", user: "赵六", accessedAt: "42分钟前", env: "R 4.2" },
  { id: "SBX-2024-003", name: "异常交易检测", user: "王五", accessedAt: "1小时前", env: "Python 3.9 + TensorFlow" },
  { id: "SBX-2024-006", name: "推荐系统实验", user: "李四", accessedAt: "2小时前", env: "Python 3.10 + PyTorch" },
  { id: "SBX-2024-007", name: "金融风险预警", user: "王五", accessedAt: "3小时前", env: "Python 3.9" },
  { id: "SBX-2024-010", name: "客户分群实验", user: "李四", accessedAt: "4小时前", env: "Julia 1.9" },
  { id: "SBX-2024-008", name: "用户行为分析", user: "赵六", accessedAt: "5小时前", env: "R 4.2" },
];

const environments = [
  { name: "Python 3.9", version: "3.9.18", status: "active", packages: 284, usage: 3 },
  { name: "Python 3.10", version: "3.10.13", status: "active", packages: 312, usage: 2 },
  { name: "R 4.2", version: "4.2.3", status: "active", packages: 156, usage: 1 },
  { name: "Julia 1.9", version: "1.9.3", status: "maintenance", packages: 89, usage: 0 },
];

const resourceStats = {
  cpu: { used: 68, total: 100, unit: "核" },
  memory: { used: 42, total: 64, unit: "GB" },
  storage: { used: 820, total: 1024, unit: "GB" },
};

const initialMembers: Member[] = [
  { id: "M1", name: "张三", email: "zhangsan@example.com", role: "Owner", joinTime: "2024-01-10 09:30" },
  { id: "M2", name: "李四", email: "lisi@example.com", role: "Editor", joinTime: "2024-01-15 14:20" },
  { id: "M3", name: "王五", email: "wangwu@example.com", role: "Editor", joinTime: "2024-02-01 11:00" },
  { id: "M4", name: "赵六", email: "zhaoliu@example.com", role: "Viewer", joinTime: "2024-02-10 16:45" },
  { id: "M5", name: "孙七", email: "sunqi@example.com", role: "Viewer", joinTime: "2024-03-05 08:15" },
];

const initialAuditEntries: AuditEntry[] = [
  { id: "A1", time: "2024-03-15 09:23:15", operator: "张三", action: "创建项目", target: "零售客户画像分析", result: "成功", ip: "192.168.1.10" },
  { id: "A2", time: "2024-03-15 09:45:02", operator: "李四", action: "数据导入", target: "客户数据集V2", result: "成功", ip: "192.168.1.11" },
  { id: "A3", time: "2024-03-15 10:12:38", operator: "王五", action: "启动训练", target: "异常交易检测", result: "成功", ip: "192.168.1.12" },
  { id: "A4", time: "2024-03-15 10:30:00", operator: "系统", action: "自动备份", target: "全部项目", result: "成功", ip: "10.0.0.1" },
  { id: "A5", time: "2024-03-15 11:05:22", operator: "赵六", action: "修改配置", target: "供应链预测", result: "成功", ip: "192.168.1.13" },
  { id: "A6", time: "2024-03-15 11:45:18", operator: "张三", action: "发布模型", target: "信用评分模型", result: "失败", ip: "192.168.1.10" },
  { id: "A7", time: "2024-03-15 12:00:05", operator: "李四", action: "数据导出", target: "推荐系统数据", result: "成功", ip: "192.168.1.11" },
  { id: "A8", time: "2024-03-15 12:30:33", operator: "王五", action: "暂停任务", target: "异常交易检测", result: "成功", ip: "192.168.1.12" },
  { id: "A9", time: "2024-03-15 13:15:47", operator: "系统", action: "资源告警", target: "CPU使用率>80%", result: "警告", ip: "10.0.0.1" },
  { id: "A10", time: "2024-03-15 13:45:12", operator: "张三", action: "邀请成员", target: "孙七", result: "成功", ip: "192.168.1.10" },
  { id: "A11", time: "2024-03-15 14:20:00", operator: "赵六", action: "删除文件", target: "临时数据.csv", result: "成功", ip: "192.168.1.13" },
  { id: "A12", time: "2024-03-15 14:55:38", operator: "李四", action: "运行脚本", target: "数据清洗.py", result: "成功", ip: "192.168.1.11" },
  { id: "A13", time: "2024-03-15 15:30:15", operator: "王五", action: "更新环境", target: "Python 3.10", result: "成功", ip: "192.168.1.12" },
  { id: "A14", time: "2024-03-15 16:10:22", operator: "张三", action: "修改权限", target: "赵六→Viewer", result: "成功", ip: "192.168.1.10" },
  { id: "A15", time: "2024-03-15 16:45:00", operator: "系统", action: "定时任务", target: "每日报表生成", result: "成功", ip: "10.0.0.1" },
  { id: "A16", time: "2024-03-15 17:20:18", operator: "孙七", action: "查看项目", target: "零售客户画像分析", result: "成功", ip: "192.168.1.14" },
  { id: "A17", time: "2024-03-15 18:00:05", operator: "李四", action: "提交审查", target: "信用评分模型", result: "成功", ip: "192.168.1.11" },
  { id: "A18", time: "2024-03-15 18:35:42", operator: "审核员A", action: "审查通过", target: "信用评分模型", result: "成功", ip: "192.168.1.20" },
  { id: "A19", time: "2024-03-15 19:15:33", operator: "张三", action: "发布到隐私计算", target: "信用评分模型", result: "成功", ip: "192.168.1.10" },
  { id: "A20", time: "2024-03-15 20:00:00", operator: "系统", action: "自动清理", target: "过期缓存", result: "成功", ip: "10.0.0.1" },
  { id: "A21", time: "2024-03-15 20:45:12", operator: "王五", action: "创建任务", target: "模型评估", result: "成功", ip: "192.168.1.12" },
  { id: "A22", time: "2024-03-15 21:30:25", operator: "赵六", action: "数据上传", target: "供应链原始数据", result: "成功", ip: "192.168.1.13" },
  { id: "A23", time: "2024-03-15 22:10:08", operator: "系统", action: "资源告警", target: "内存使用率>95%", result: "警告", ip: "10.0.0.1" },
  { id: "A24", time: "2024-03-15 22:45:00", operator: "李四", action: "停止任务", target: "推荐系统训练", result: "成功", ip: "192.168.1.11" },
  { id: "A25", time: "2024-03-15 23:20:15", operator: "张三", action: "克隆项目", target: "零售客户画像分析", result: "成功", ip: "192.168.1.10" },
  { id: "A26", time: "2024-03-16 00:00:00", operator: "系统", action: "定时备份", target: "全部项目", result: "成功", ip: "10.0.0.1" },
  { id: "A27", time: "2024-03-16 08:30:22", operator: "孙七", action: "下载报告", target: "数据分析报告.pdf", result: "成功", ip: "192.168.1.14" },
  { id: "A28", time: "2024-03-16 09:15:05", operator: "王五", action: "修改参数", target: "异常检测阈值", result: "成功", ip: "192.168.1.12" },
  { id: "A29", time: "2024-03-16 10:00:18", operator: "赵六", action: "启动调度", target: "供应链日报", result: "成功", ip: "192.168.1.13" },
  { id: "A30", time: "2024-03-16 10:45:33", operator: "张三", action: "移除成员", target: "临时账户", result: "成功", ip: "192.168.1.10" },
  { id: "A31", time: "2024-03-16 11:30:00", operator: "李四", action: "环境切换", target: "R 4.2", result: "成功", ip: "192.168.1.11" },
  { id: "A32", time: "2024-03-16 12:15:42", operator: "系统", action: "安全扫描", target: "全部数据", result: "成功", ip: "10.0.0.1" },
];

const initialScheduledTasks: ScheduledTask[] = [
  {
    id: "T1", name: "每日数据清洗", script: "clean_daily.py", cron: "0 2 * * *",
    nextRun: "2024-03-17 02:00", lastRun: "2024-03-16 02:00", status: "成功", enabled: true,
    history: [
      { time: "2024-03-16 02:00", duration: "15分32秒", status: "成功" },
      { time: "2024-03-15 02:00", duration: "14分10秒", status: "成功" },
    ],
  },
  {
    id: "T2", name: "模型自动评估", script: "evaluate_model.py", cron: "0 */6 * * *",
    nextRun: "2024-03-16 18:00", lastRun: "2024-03-16 12:00", status: "成功", enabled: true,
    history: [
      { time: "2024-03-16 12:00", duration: "8分45秒", status: "成功" },
      { time: "2024-03-16 06:00", duration: "9分20秒", status: "成功" },
    ],
  },
  {
    id: "T3", name: "数据备份", script: "backup_data.sh", cron: "0 0 * * *",
    nextRun: "2024-03-17 00:00", lastRun: "2024-03-16 00:00", status: "成功", enabled: true,
    history: [
      { time: "2024-03-16 00:00", duration: "22分18秒", status: "成功" },
    ],
  },
  {
    id: "T4", name: "异常检测巡检", script: "anomaly_check.py", cron: "0 */4 * * *",
    nextRun: "2024-03-16 16:00", lastRun: "2024-03-16 12:00", status: "失败", enabled: false,
    history: [
      { time: "2024-03-16 12:00", duration: "2分05秒", status: "失败" },
      { time: "2024-03-16 08:00", duration: "7分30秒", status: "成功" },
    ],
  },
  {
    id: "T5", name: "报表生成", script: "generate_report.py", cron: "30 8 * * 1",
    nextRun: "2024-03-18 08:30", lastRun: "2024-03-11 08:30", status: "待运行", enabled: true,
    history: [
      { time: "2024-03-11 08:30", duration: "5分12秒", status: "成功" },
    ],
  },
];

const initialPublishHistory: PublishHistory[] = [
  { id: "P1", projectName: "信用评分模型", algorithm: "联邦学习", time: "2024-03-15 19:15", status: "成功", operator: "张三" },
  { id: "P2", projectName: "零售客户画像分析", algorithm: "联合统计", time: "2024-03-10 14:30", status: "成功", operator: "李四" },
  { id: "P3", projectName: "异常交易检测", algorithm: "PSI隐私求交", time: "2024-03-08 11:20", status: "失败", operator: "王五" },
];

const resourceTopTasks = [
  { name: "信用评分模型训练", cpu: 28.5, memory: 12.3 },
  { name: "推荐系统实验", cpu: 18.2, memory: 8.7 },
  { name: "零售客户画像分析", cpu: 12.4, memory: 6.5 },
  { name: "异常交易检测", cpu: 8.1, memory: 4.2 },
  { name: "供应链预测", cpu: 5.3, memory: 3.1 },
];

const algorithmOptions = [
  { label: "PSI隐私求交", value: "PSI隐私求交" },
  { label: "PIR隐匿查询", value: "PIR隐匿查询" },
  { label: "联合统计", value: "联合统计" },
  { label: "联邦学习", value: "联邦学习" },
];

const partyList = ["Party A - 银行", "Party B - 保险", "Party C - 电商", "Party D - 运营商"];

const quickActions = [
  { label: "沙箱IDE", desc: "进入在线开发环境", icon: <Terminal className="w-5 h-5" />, path: "/sandbox/ide", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "数据探查", desc: "浏览数据源", icon: <BookOpen className="w-5 h-5" />, path: "/sandbox/preview", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  { label: "数据加工", desc: "数据清洗与转换", icon: <Zap className="w-5 h-5" />, path: "/sandbox/preprocess", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { label: "模型开发", desc: "算法训练与评估", icon: <FlaskConical className="w-5 h-5" />, path: "/sandbox/train", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { label: "结果审查", desc: "审批与发布", icon: <CheckCircle2 className="w-5 h-5" />, path: "/sandbox/review", color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { label: "运行环境", desc: "查看环境状态", icon: <HardDrive className="w-5 h-5" />, path: "/sandbox/run", color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
  { label: "隐私计算", desc: "将沙箱成果发布到隐私计算平台", icon: <Share className="w-5 h-5" />, path: "/sandbox/privacy-computing", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
];

/* ─── Main Component ─── */
export default function SandboxProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [recentActivities, setRecentActivities] = useState<Activity[]>(initialActivities);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any>>({});
  const [selectedTemplate, setSelectedTemplate] = useState("empty");

  // Publish dialog state
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishProject, setPublishProject] = useState<Project | null>(null);
  const [publishAlgorithm, setPublishAlgorithm] = useState("PSI隐私求交");
  const [publishTaskName, setPublishTaskName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Enhanced publish wizard
  const [publishWizardOpen, setPublishWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardAlgo, setWizardAlgo] = useState("PSI隐私求交");
  const [wizardParams, setWizardParams] = useState("{\"epsilon\": 1.0, \"delta\": 1e-5}");
  const [wizardParties, setWizardParties] = useState<string[]>([]);
  const [wizardSensitivity, setWizardSensitivity] = useState("medium");
  const [wizardOutputRestrict, setWizardOutputRestrict] = useState(true);
  const [publishHistory, setPublishHistory] = useState<PublishHistory[]>(initialPublishHistory);

  // Member management
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberInviteEmail, setMemberInviteEmail] = useState("");
  const [memberInviteRole, setMemberInviteRole] = useState<"Owner" | "Editor" | "Viewer">("Viewer");

  // Audit log
  const [auditEntries] = useState<AuditEntry[]>(initialAuditEntries);
  const [auditFilterDateFrom, setAuditFilterDateFrom] = useState("");
  const [auditFilterDateTo, setAuditFilterDateTo] = useState("");
  const [auditFilterOperator, setAuditFilterOperator] = useState("");
  const [auditFilterAction, setAuditFilterAction] = useState("all");

  // Scheduled tasks
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(initialScheduledTasks);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskScript, setTaskScript] = useState("");
  const [taskCron, setTaskCron] = useState({ minute: "0", hour: "2", day: "*", month: "*", weekday: "*" });
  const [selectedTaskHistory, setSelectedTaskHistory] = useState<string | null>(null);

  // Resource quota
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const [quotaCpu, setQuotaCpu] = useState(100);
  const [quotaMemory, setQuotaMemory] = useState(64);
  const [quotaStorage, setQuotaStorage] = useState(1024);

  const chartRef = useRef<HTMLDivElement>(null);

  /* ─── Effects ─── */
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const cpuData = hours.map((_, i) => 30 + Math.sin(i / 3) * 20 + Math.random() * 15);
    const memData = hours.map((_, i) => 40 + Math.cos(i / 4) * 15 + Math.random() * 10);
    const stoData = hours.map((_, i) => 60 + Math.sin(i / 5) * 10 + Math.random() * 5);

    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["CPU (%)", "内存 (%)", "存储 (%)"], bottom: 0 },
      grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: hours },
      yAxis: { type: "value", max: 100 },
      series: [
        { name: "CPU (%)", type: "line", smooth: true, data: cpuData, itemStyle: { color: "#3b82f6" }, areaStyle: { opacity: 0.1 } },
        { name: "内存 (%)", type: "line", smooth: true, data: memData, itemStyle: { color: "#10b981" }, areaStyle: { opacity: 0.1 } },
        { name: "存储 (%)", type: "line", smooth: true, data: stoData, itemStyle: { color: "#f59e0b" }, areaStyle: { opacity: 0.1 } },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);

  /* ─── Filtering ─── */
  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(search) || p.id.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredAudit = useMemo(() => {
    return auditEntries.filter(a => {
      const d = a.time.split(" ")[0];
      if (auditFilterDateFrom && d < auditFilterDateFrom) return false;
      if (auditFilterDateTo && d > auditFilterDateTo) return false;
      if (auditFilterOperator && !a.operator.includes(auditFilterOperator)) return false;
      if (auditFilterAction !== "all" && !a.action.includes(auditFilterAction)) return false;
      return true;
    });
  }, [auditEntries, auditFilterDateFrom, auditFilterDateTo, auditFilterOperator, auditFilterAction]);

  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    running: { label: "运行中", color: "bg-green-50 text-green-700 border-green-200", icon: <Play className="w-3 h-3" /> },
    paused: { label: "已暂停", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Pause className="w-3 h-3" /> },
    completed: { label: "已完成", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    draft: { label: "草稿", color: "bg-gray-50 text-gray-700 border-gray-200", icon: <FileText className="w-3 h-3" /> },
  };

  /* ─── Handlers ─── */
  const openCreate = () => {
    setDialogMode("create");
    setSelectedTemplate("empty");
    setDialogData({ status: "draft", progress: "0", startTime: new Date().toISOString().split('T')[0] });
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setDialogMode("edit");
    setDialogData({ ...project, progress: String(project.progress) });
    setDialogOpen(true);
  };

  const openView = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const openDelete = (project: Project) => {
    setDialogMode("delete");
    setDialogData(project);
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleClone = (project: Project) => {
    const cloned: Project = {
      ...project,
      id: `SBX-${Date.now().toString(36).toUpperCase()}`,
      name: `${project.name} (克隆)`,
      status: "draft",
      progress: 0,
      startTime: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [cloned, ...prev]);
    setRecentActivities(prev => [
      { id: `ACT-${genId()}`, action: "克隆项目", target: cloned.name, user: project.owner, time: "刚刚", type: "info" },
      ...prev,
    ]);
  };

  const openPublishDialog = (project: Project) => {
    setPublishProject(project);
    setPublishAlgorithm("PSI隐私求交");
    setPublishTaskName(`${project.name}-隐私计算`);
    setPublishDescription("");
    setPublishDialogOpen(true);
  };

  const openPublishWizard = (project: Project) => {
    setPublishProject(project);
    setWizardStep(1);
    setWizardAlgo("PSI隐私求交");
    setWizardParams("{\"epsilon\": 1.0, \"delta\": 1e-5}");
    setWizardParties([]);
    setWizardSensitivity("medium");
    setWizardOutputRestrict(true);
    setPublishWizardOpen(true);
  };

  const handlePublishConfirm = () => {
    if (!publishProject) return;
    setPublishedIds(prev => new Set(prev).add(publishProject.id));
    setRecentActivities(prev => [
      { id: `ACT-${genId()}`, action: `发布到隐私计算: ${publishAlgorithm}`, target: publishProject.name, user: publishProject.owner, time: "刚刚", type: "success" },
      ...prev,
    ]);
    setPublishSuccess(`项目"${publishProject.name}"已成功发布到隐私计算平台`);
    setPublishDialogOpen(false);
    setTimeout(() => setPublishSuccess(null), 4000);
  };

  const handleWizardConfirm = () => {
    if (!publishProject) return;
    setPublishedIds(prev => new Set(prev).add(publishProject.id));
    const entry: PublishHistory = {
      id: `P-${genId()}`,
      projectName: publishProject.name,
      algorithm: wizardAlgo,
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "成功",
      operator: publishProject.owner,
    };
    setPublishHistory(prev => [entry, ...prev]);
    setRecentActivities(prev => [
      { id: `ACT-${genId()}`, action: `发布到隐私计算: ${wizardAlgo}`, target: publishProject.name, user: publishProject.owner, time: "刚刚", type: "success" },
      ...prev,
    ]);
    setPublishSuccess(`项目"${publishProject.name}"已通过向导发布到隐私计算平台`);
    setPublishWizardOpen(false);
    setTimeout(() => setPublishSuccess(null), 4000);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const defaults = templateDefaults[selectedTemplate] || {};
      const newProject: Project = {
        id: `SBX-${genId()}`,
        name: data.name || "",
        owner: data.owner || "当前用户",
        type: data.type || defaults.type || "",
        status: data.status || defaults.status || "draft",
        startTime: data.startTime || new Date().toISOString().split('T')[0],
        env: data.env || defaults.env || "",
        progress: Number(data.progress) || defaults.progress || 0,
      };
      setProjects(prev => [newProject, ...prev]);
      setRecentActivities(prev => [
        { id: `ACT-${genId()}`, action: "创建项目", target: newProject.name, user: newProject.owner, time: "刚刚", type: "info" },
        ...prev,
      ]);
    } else if (dialogMode === "edit" && dialogData.id) {
      setProjects(prev => prev.map(p => p.id === dialogData.id ? {
        ...p,
        name: data.name || p.name,
        owner: data.owner || p.owner,
        type: data.type || p.type,
        status: data.status || p.status,
        startTime: data.startTime || p.startTime,
        env: data.env || p.env,
        progress: Number(data.progress) ?? p.progress,
      } : p));
    }
  };

  const handleDelete = () => {
    if (selectedProject) {
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setSelectedProject(null);
      setDetailOpen(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      let newStatus = p.status;
      if (p.status === "running") newStatus = "paused";
      else if (p.status === "paused") newStatus = "running";
      else if (p.status === "draft") newStatus = "running";
      return { ...p, status: newStatus };
    }));
  };

  const handleInviteMember = () => {
    if (!memberInviteEmail.trim()) return;
    const newMember: Member = {
      id: `M-${genId()}`,
      name: memberInviteEmail.split("@")[0],
      email: memberInviteEmail,
      role: memberInviteRole,
      joinTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setMembers(prev => [...prev, newMember]);
    setMemberDialogOpen(false);
    setMemberInviteEmail("");
    setMemberInviteRole("Viewer");
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleToggleTask = (id: string) => {
    setScheduledTasks(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleRunTask = (id: string) => {
    setScheduledTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const run: TaskRun = { time: new Date().toISOString().slice(0, 16).replace("T", " "), duration: "5分00秒", status: "成功" };
      return { ...t, lastRun: run.time, status: "成功", history: [run, ...t.history] };
    }));
  };

  const handleCreateTask = () => {
    const cron = `${taskCron.minute} ${taskCron.hour} ${taskCron.day} ${taskCron.month} ${taskCron.weekday}`;
    const newTask: ScheduledTask = {
      id: `T-${genId()}`,
      name: taskName,
      script: taskScript,
      cron,
      nextRun: "计算中...",
      lastRun: "-",
      status: "待运行",
      enabled: true,
      history: [],
    };
    setScheduledTasks(prev => [...prev, newTask]);
    setTaskDialogOpen(false);
    setTaskName("");
    setTaskScript("");
    setTaskCron({ minute: "0", hour: "2", day: "*", month: "*", weekday: "*" });
  };

  const handleSaveQuota = () => {
    setQuotaDialogOpen(false);
    setRecentActivities(prev => [
      { id: `ACT-${genId()}`, action: "修改资源配额", target: `CPU:${quotaCpu} 内存:${quotaMemory}GB 存储:${quotaStorage}GB`, user: "当前用户", time: "刚刚", type: "info" },
      ...prev,
    ]);
  };

  const detailFields = [
    { key: "id", label: "项目ID" },
    { key: "name", label: "项目名称" },
    { key: "owner", label: "负责人" },
    { key: "type", label: "项目类型", type: "badge" as const },
    { key: "env", label: "运行环境" },
    { key: "startTime", label: "创建时间", type: "date" as const },
    { key: "progress", label: "当前进度" },
  ];

  const activeProjects = projects.filter(p => p.status === "running").length;
  const todayRuns = 42;
  const resourceUsage = Math.round((resourceStats.cpu.used / resourceStats.cpu.total) * 100);
  const exploreCount = 128;

  const cpuPct = Math.round((resourceStats.cpu.used / resourceStats.cpu.total) * 100);
  const memPct = Math.round((resourceStats.memory.used / resourceStats.memory.total) * 100);
  const stoPct = Math.round((resourceStats.storage.used / resourceStats.storage.total) * 100);

  const projectFields: FieldConfig[] = [
    { key: "name", label: "项目名称", type: "text", required: true, placeholder: "请输入项目名称" },
    { key: "owner", label: "负责人", type: "text", placeholder: "默认当前用户" },
    {
      key: "type", label: "项目类型", type: "select", required: true, options: [
        { label: "数据分析", value: "数据分析" },
        { label: "模型开发", value: "模型开发" },
        { label: "数据探查", value: "数据探查" },
        { label: "算法实验", value: "算法实验" },
      ],
    },
    {
      key: "status", label: "状态", type: "select", options: [
        { label: "草稿", value: "draft" },
        { label: "运行中", value: "running" },
        { label: "已暂停", value: "paused" },
        { label: "已完成", value: "completed" },
      ],
    },
    { key: "startTime", label: "开始时间", type: "text", placeholder: "YYYY-MM-DD" },
    {
      key: "env", label: "运行环境", type: "select", required: true, options: [
        { label: "Python 3.9", value: "Python 3.9" },
        { label: "Python 3.10", value: "Python 3.10" },
        { label: "Python 3.10 + PyTorch", value: "Python 3.10 + PyTorch" },
        { label: "Python 3.9 + TensorFlow", value: "Python 3.9 + TensorFlow" },
        { label: "R 4.2", value: "R 4.2" },
        { label: "Julia 1.9", value: "Julia 1.9" },
      ],
    },
    { key: "progress", label: "进度", type: "number", placeholder: "0-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {publishSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{publishSuccess}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">沙箱工作台</h1>
          <p className="text-sm text-gray-500 mt-1">管理沙箱项目、快速进入开发环境</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />新建项目
        </Button>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="projects" className="gap-2"><FolderKanban className="w-4 h-4" />我的项目</TabsTrigger>
          <TabsTrigger value="quick" className="gap-2"><Zap className="w-4 h-4" />快速入口</TabsTrigger>
          <TabsTrigger value="activities" className="gap-2"><Clock className="w-4 h-4" />最近动态</TabsTrigger>
          <TabsTrigger value="members" className="gap-2"><Users className="w-4 h-4" />成员管理</TabsTrigger>
          <TabsTrigger value="resources" className="gap-2"><Server className="w-4 h-4" />资源监控</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><FileText className="w-4 h-4" />操作日志</TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2"><Clock className="w-4 h-4" />调度任务</TabsTrigger>
        </TabsList>

        {/* ─── Projects Tab ─── */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索项目ID或名称..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="running">运行中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">项目列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>项目ID</TableHead>
                    <TableHead>项目名称</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>环境</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const s = statusMap[p.status];
                    const isPublished = publishedIds.has(p.id);
                    const canPublish = p.status === "completed" || p.progress >= 80;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {p.name}
                            {isPublished && (
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                                已发布
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" />{p.owner}</TableCell>
                        <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`gap-1 ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                        <TableCell className="text-xs">{p.env}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-xs">{p.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(p)} title="查看"><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)} title="编辑"><Edit3 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleClone(p)} title="克隆"><Copy className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(p.id)}>
                              {p.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            {canPublish && (
                              isPublished ? (
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-indigo-600" disabled>
                                  <Share className="w-4 h-4 mr-1" />已发布
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => openPublishWizard(p)} title="发布到隐私计算">
                                  <Share className="w-4 h-4" />
                                </Button>
                              )
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDelete(p)} title="删除"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Quick Tab ─── */}
        <TabsContent value="quick" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">活跃项目数</p>
                    <p className="text-2xl font-bold mt-1">{activeProjects}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">今日运行次数</p>
                    <p className="text-2xl font-bold mt-1">{todayRuns}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">资源使用率</p>
                    <p className="text-2xl font-bold mt-1">{resourceUsage}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">数据探查次数</p>
                    <p className="text-2xl font-bold mt-1">{exploreCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">快捷操作</h3>
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Card key={action.label} className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${action.color}`} onClick={() => navigate(action.path)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                      {action.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{action.label}</div>
                      <p className="text-xs opacity-80 mt-0.5">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                资源概览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cpuPct > 95 && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />告警</Badge>}
                    {cpuPct > 80 && cpuPct <= 95 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Bell className="w-3 h-3 mr-1" />警告</Badge>}
                    <span className="text-sm text-gray-500">{resourceStats.cpu.used} / {resourceStats.cpu.total} {resourceStats.cpu.unit}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${cpuPct > 95 ? "bg-red-500" : cpuPct > 80 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${(resourceStats.cpu.used / resourceStats.cpu.total) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">内存</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {memPct > 95 && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />告警</Badge>}
                    {memPct > 80 && memPct <= 95 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Bell className="w-3 h-3 mr-1" />警告</Badge>}
                    <span className="text-sm text-gray-500">{resourceStats.memory.used} / {resourceStats.memory.total} {resourceStats.memory.unit}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${memPct > 95 ? "bg-red-500" : memPct > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${(resourceStats.memory.used / resourceStats.memory.total) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">存储</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stoPct > 95 && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />告警</Badge>}
                    {stoPct > 80 && stoPct <= 95 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Bell className="w-3 h-3 mr-1" />警告</Badge>}
                    <span className="text-sm text-gray-500">{resourceStats.storage.used} / {resourceStats.storage.total} {resourceStats.storage.unit}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${stoPct > 95 ? "bg-red-500" : stoPct > 80 ? "bg-amber-500" : "bg-amber-500"}`} style={{ width: `${(resourceStats.storage.used / resourceStats.storage.total) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">常用环境</h3>
              <div className="space-y-3">
                {environments.map((env) => (
                  <Card key={env.name} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${env.status === "active" ? "bg-green-500" : "bg-amber-500"}`} />
                        <div>
                          <div className="text-sm font-medium">{env.name}</div>
                          <div className="text-xs text-gray-500">v{env.version} · {env.packages} 包</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{env.usage} 个项目使用</span>
                        <Badge variant="outline" className={env.status === "active" ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"}>
                          {env.status === "active" ? "正常" : "维护中"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">最近使用</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">沙箱名称</TableHead>
                        <TableHead className="text-xs">用户</TableHead>
                        <TableHead className="text-xs">环境</TableHead>
                        <TableHead className="text-xs">时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSandboxes.map((sb) => (
                        <TableRow key={sb.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="text-sm font-medium py-2">{sb.name}</TableCell>
                          <TableCell className="text-xs py-2">{sb.user}</TableCell>
                          <TableCell className="text-xs py-2">{sb.env}</TableCell>
                          <TableCell className="text-xs text-gray-500 py-2">{sb.accessedAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Activities Tab ─── */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">最近动态</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      act.type === "success" ? "bg-green-50 text-green-600" :
                      act.type === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {act.type === "success" ? <CheckCircle2 className="w-4 h-4" /> :
                       act.type === "warning" ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{act.action} — <span className="text-gray-700">{act.target}</span></div>
                      <div className="text-xs text-gray-500 mt-0.5">{act.user} · {act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Members Tab ─── */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <Card className="flex-1 mr-4">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">成员总数</p>
                  <p className="text-2xl font-bold mt-1">{members.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
            <Button className="gap-2" onClick={() => setMemberDialogOpen(true)}>
              <UserPlus className="w-4 h-4" />邀请成员
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">成员列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>头像</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>加入时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-xs text-gray-500">{m.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="outline" className={
                            m.role === "Owner" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            m.role === "Editor" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                          }>{m.role}</Badge>
                          <span className="text-[10px] text-gray-400 leading-tight">{roleDesc[m.role]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{m.joinTime}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveMember(m.id)} title="移除成员">
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Resources Tab ─── */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">CPU 使用率</p>
                    <p className="text-2xl font-bold mt-1">{cpuPct}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">内存 使用率</p>
                    <p className="text-2xl font-bold mt-1">{memPct}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">存储 使用率</p>
                    <p className="text-2xl font-bold mt-1">{stoPct}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <HardDrive className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3 flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                24小时资源使用趋势
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setQuotaDialogOpen(true)}>
                <Settings className="w-3 h-3" />配额设置
              </Button>
            </CardHeader>
            <CardContent>
              <div ref={chartRef} style={{ width: "100%", height: 300 }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">资源占用 Top 5 任务</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务名称</TableHead>
                    <TableHead>CPU (核)</TableHead>
                    <TableHead>内存 (GB)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourceTopTasks.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.cpu}</TableCell>
                      <TableCell>{t.memory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Audit Log Tab ─── */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索操作人..." className="pl-9" value={auditFilterOperator} onChange={e => setAuditFilterOperator(e.target.value)} />
            </div>
            <Input type="date" className="w-40" value={auditFilterDateFrom} onChange={e => setAuditFilterDateFrom(e.target.value)} placeholder="开始日期" />
            <Input type="date" className="w-40" value={auditFilterDateTo} onChange={e => setAuditFilterDateTo(e.target.value)} placeholder="结束日期" />
            <Select value={auditFilterAction} onValueChange={setAuditFilterAction}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="操作类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                <SelectItem value="创建">创建</SelectItem>
                <SelectItem value="修改">修改</SelectItem>
                <SelectItem value="删除">删除</SelectItem>
                <SelectItem value="发布">发布</SelectItem>
                <SelectItem value="运行">运行</SelectItem>
                <SelectItem value="导入">导入</SelectItem>
                <SelectItem value="导出">导出</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => alert("日志导出功能（模拟）")}>
              <Download className="w-4 h-4" />导出日志
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">操作日志 ({filteredAudit.length} 条)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>操作对象</TableHead>
                    <TableHead>结果</TableHead>
                    <TableHead>IP地址</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudit.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs font-mono">{a.time}</TableCell>
                      <TableCell className="text-sm">{a.operator}</TableCell>
                      <TableCell className="text-sm">{a.action}</TableCell>
                      <TableCell className="text-sm text-gray-600">{a.target}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          a.result === "成功" ? "bg-green-50 text-green-700 border-green-200" :
                          a.result === "失败" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }>{a.result}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-500">{a.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Schedule Tab ─── */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">调度任务列表</h3>
            <Button className="gap-2" onClick={() => setTaskDialogOpen(true)}>
              <Plus className="w-4 h-4" />新建任务
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务名称</TableHead>
                    <TableHead>脚本</TableHead>
                    <TableHead>Cron 表达式</TableHead>
                    <TableHead>下次运行</TableHead>
                    <TableHead>上次运行</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>启用</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-xs font-mono">{t.script}</TableCell>
                      <TableCell className="text-xs font-mono">{t.cron}</TableCell>
                      <TableCell className="text-xs">{t.nextRun}</TableCell>
                      <TableCell className="text-xs">{t.lastRun}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          t.status === "成功" ? "bg-green-50 text-green-700 border-green-200" :
                          t.status === "失败" ? "bg-red-50 text-red-700 border-red-200" :
                          t.status === "运行中" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }>{t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={t.enabled} onCheckedChange={() => handleToggleTask(t.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRunTask(t.id)} title="立即运行"><PlayCircle className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTaskHistory(selectedTaskHistory === t.id ? null : t.id)} title="执行历史"><History className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedTaskHistory && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  执行历史 — {scheduledTasks.find(t => t.id === selectedTaskHistory)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>执行时间</TableHead>
                      <TableHead>耗时</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledTasks.find(t => t.id === selectedTaskHistory)?.history.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{h.time}</TableCell>
                        <TableCell className="text-xs">{h.duration}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={h.status === "成功" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                            {h.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-400 text-sm py-4">暂无执行记录</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Publish Dialog (legacy simple) ─── */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>发布到隐私计算</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="algorithm">算法类型</Label>
              <Select value={publishAlgorithm} onValueChange={setPublishAlgorithm}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="选择算法类型" />
                </SelectTrigger>
                <SelectContent>
                  {algorithmOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskName">任务名称</Label>
              <Input id="taskName" value={publishTaskName} onChange={(e) => setPublishTaskName(e.target.value)} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea id="description" value={publishDescription} onChange={(e) => setPublishDescription(e.target.value)} placeholder="请输入任务描述" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>取消</Button>
            <Button onClick={handlePublishConfirm}>确认发布</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Publish Wizard Dialog ─── */}
      <Dialog open={publishWizardOpen} onOpenChange={setPublishWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              发布到隐私计算 — 步骤 {wizardStep}/5
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>选择算法类型</Label>
                  <Select value={wizardAlgo} onValueChange={setWizardAlgo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {algorithmOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium">预发布检查</p>
                    <p>数据敏感度扫描：已通过</p>
                    <p>合规检查：已通过</p>
                  </div>
                </div>
              </div>
            )}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>算法参数 (JSON)</Label>
                  <Textarea value={wizardParams} onChange={e => setWizardParams(e.target.value)} rows={5} className="font-mono text-xs" />
                </div>
              </div>
            )}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>选择参与方</Label>
                  <div className="border rounded-md p-2 space-y-1">
                    {partyList.map((party) => {
                      const selected = wizardParties.includes(party);
                      return (
                        <div key={party} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                          onClick={() => setWizardParties(prev => selected ? prev.filter(p => p !== party) : [...prev, party])}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                            {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span>{party}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>敏感度级别</Label>
                  <Select value={wizardSensitivity} onValueChange={setWizardSensitivity}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">输出限制</p>
                    <p className="text-xs text-gray-500">限制输出结果的可见范围</p>
                  </div>
                  <Switch checked={wizardOutputRestrict} onCheckedChange={setWizardOutputRestrict} />
                </div>
              </div>
            )}
            {wizardStep === 5 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">发布确认</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">项目</span><span>{publishProject?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">算法</span><span>{wizardAlgo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">参与方</span><span>{wizardParties.join(", ") || "未选择"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">敏感度</span><span>{wizardSensitivity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">输出限制</span><span>{wizardOutputRestrict ? "开启" : "关闭"}</span></div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800 font-medium">✓ 所有预发布检查已通过</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)} className="gap-1">
                  <ChevronLeft className="w-4 h-4" />上一步
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPublishWizardOpen(false)}>取消</Button>
              {wizardStep < 5 ? (
                <Button onClick={() => setWizardStep(wizardStep + 1)} className="gap-1">
                  下一步<ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleWizardConfirm}>确认发布</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Member Invite Dialog ─── */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>邀请成员</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱 / 用户名</Label>
              <Input id="email" value={memberInviteEmail} onChange={e => setMemberInviteEmail(e.target.value)} placeholder="请输入邮箱或用户名" />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={memberInviteRole} onValueChange={(v: any) => setMemberInviteRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{roleDesc[memberInviteRole]}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>取消</Button>
            <Button onClick={handleInviteMember}>邀请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Task Create Dialog ─── */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建调度任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tname">任务名称</Label>
              <Input id="tname" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="请输入任务名称" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tscript">选择脚本</Label>
              <Select value={taskScript} onValueChange={setTaskScript}>
                <SelectTrigger id="tscript"><SelectValue placeholder="选择脚本" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean_daily.py">clean_daily.py</SelectItem>
                  <SelectItem value="evaluate_model.py">evaluate_model.py</SelectItem>
                  <SelectItem value="backup_data.sh">backup_data.sh</SelectItem>
                  <SelectItem value="anomaly_check.py">anomaly_check.py</SelectItem>
                  <SelectItem value="generate_report.py">generate_report.py</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cron 表达式（可视化）</Label>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <Label className="text-[10px] text-gray-500">分钟</Label>
                  <Input value={taskCron.minute} onChange={e => setTaskCron({ ...taskCron, minute: e.target.value })} className="font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">小时</Label>
                  <Input value={taskCron.hour} onChange={e => setTaskCron({ ...taskCron, hour: e.target.value })} className="font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">日</Label>
                  <Input value={taskCron.day} onChange={e => setTaskCron({ ...taskCron, day: e.target.value })} className="font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">月</Label>
                  <Input value={taskCron.month} onChange={e => setTaskCron({ ...taskCron, month: e.target.value })} className="font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">周</Label>
                  <Input value={taskCron.weekday} onChange={e => setTaskCron({ ...taskCron, weekday: e.target.value })} className="font-mono text-xs" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-mono">{taskCron.minute} {taskCron.hour} {taskCron.day} {taskCron.month} {taskCron.weekday}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>取消</Button>
            <Button onClick={handleCreateTask}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Quota Dialog ─── */}
      <Dialog open={quotaDialogOpen} onOpenChange={setQuotaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>资源配额设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="qcpu">CPU 上限 (核)</Label>
              <Input id="qcpu" type="number" value={quotaCpu} onChange={e => setQuotaCpu(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qmem">内存上限 (GB)</Label>
              <Input id="qmem" type="number" value={quotaMemory} onChange={e => setQuotaMemory(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qsto">存储上限 (GB)</Label>
              <Input id="qsto" type="number" value={quotaStorage} onChange={e => setQuotaStorage(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuotaDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveQuota}><Save className="w-4 h-4 mr-1" />保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CRUD Dialog ─── */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="沙箱项目"
        fields={[
          ...(dialogMode === "create" ? [{
            key: "template",
            label: "模板",
            type: "select" as const,
            options: projectTemplates,
          }] : []),
          ...projectFields,
        ]}
        data={dialogData}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* ─── Detail Drawer ─── */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="项目详情"
        data={selectedProject || {}}
        fields={detailFields}
        onEdit={() => {
          if (selectedProject) {
            setDialogMode("edit");
            setDialogData({ ...selectedProject, progress: String(selectedProject.progress) });
            setDialogOpen(true);
          }
        }}
        onDelete={() => {
          if (selectedProject) {
            setDialogMode("delete");
            setDialogData(selectedProject);
            setDialogOpen(true);
          }
        }}
      />
    </div>
  );
}
