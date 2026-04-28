import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Database, Network, Cpu, ShieldCheck, FlaskConical,
  BarChart3, Settings, ChevronDown, HardDrive, Monitor,
  FileCode, Globe, Lock, Activity, Server, Layers,
  ArrowLeftRight, Blocks, ShoppingCart, Rocket, Beaker, GitBranch,
  BookOpen, FileText, ClipboardList, Shield, AlertTriangle, Package,
  Tag, Eye, Search, Bell, UserCheck, Terminal, Wand2,
  Combine, Merge, BrainCircuit, Home, Building2, Key,
  MessageSquare, PieChart, AreaChart, Ruler, PenTool,
  Gauge, FolderOpen, Zap, Users, Plus,
  Landmark, TrendingUp, CircuitBoard, Fingerprint, Radio,
} from "lucide-react";

const menuStructure = [
  {
    label: "工作台",
    icon: <LayoutDashboard className="w-5 h-5" />,
    children: [
      { label: "工作台首页", icon: <Home className="w-4 h-4" />, path: "/" },
      { label: "项目管理", icon: <FolderOpen className="w-4 h-4" />, path: "/workbench/projects" },
      { label: "规则管理", icon: <Ruler className="w-4 h-4" />, path: "/workbench/rules" },
      { label: "资产登记", icon: <PenTool className="w-4 h-4" />, path: "/workbench/registration" },
      { label: "消息通知", icon: <Bell className="w-4 h-4" />, path: "/workbench/notifications" },
    ],
  },
  {
    label: "应用场景中心",
    icon: <Zap className="w-5 h-5" />,
    children: [
      { label: "场景列表", icon: <ClipboardList className="w-4 h-4" />, path: "/scenes" },
      { label: "创建场景", icon: <Plus className="w-4 h-4" />, path: "/scenes/create" },
    ],
  },
  {
    label: "数据资产概览",
    icon: <Database className="w-5 h-5" />,
    children: [
      { label: "概览看板", icon: <BarChart3 className="w-4 h-4" />, path: "/cockpit" },
      { label: "数据资产驾驶舱", icon: <Gauge className="w-4 h-4" />, path: "/resources" },
    ],
  },
  {
    label: "数据资源目录",
    icon: <Database className="w-5 h-5" />,
    children: [
      { label: "资源目录", icon: <BookOpen className="w-4 h-4" />, path: "/resources" },
      { label: "选数车", icon: <ShoppingCart className="w-4 h-4" />, path: "/data-cart" },
      { label: "数据产品管理", icon: <Package className="w-4 h-4" />, path: "/products" },
      { label: "资产账户", icon: <Landmark className="w-4 h-4" />, path: "/accounts" },
      { label: "资产运营", icon: <TrendingUp className="w-4 h-4" />, path: "/reports" },
    ],
  },
  {
    label: "血缘图谱",
    icon: <Network className="w-5 h-5" />,
    children: [
      { label: "血缘分析", icon: <GitBranch className="w-4 h-4" />, path: "/lineage" },
    ],
  },
  {
    label: "数据沙箱",
    icon: <Cpu className="w-5 h-5" />,
    children: [
      { label: "沙箱项目", icon: <FolderOpen className="w-4 h-4" />, path: "/sandbox/projects" },
      { label: "我的开发资源", icon: <Server className="w-4 h-4" />, path: "/sandbox/resources" },
      { label: "产品验证", icon: <ShieldCheck className="w-4 h-4" />, path: "/sandbox/verify" },
      { label: "数据探查", icon: <Search className="w-4 h-4" />, path: "/sandbox/preview" },
      { label: "数据加工", icon: <Wand2 className="w-4 h-4" />, path: "/sandbox/preprocess" },
      { label: "模型开发", icon: <BrainCircuit className="w-4 h-4" />, path: "/sandbox/train" },
      { label: "结果审查", icon: <ShieldCheck className="w-4 h-4" />, path: "/sandbox/review" },
      { label: "沙箱审计", icon: <ClipboardList className="w-4 h-4" />, path: "/sandbox/audit" },
      { label: "数据源管理", icon: <Database className="w-4 h-4" />, path: "/sampling/datasources" },
    ],
  },
  // ====== 隐私计算：任务分类中心 ======
  {
    label: "隐私计算",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
      { label: "任务中心", icon: <ClipboardList className="w-4 h-4" />, path: "/privacy/tasks" },
      { label: "隐私求交(PSI)", icon: <Eye className="w-4 h-4" />, path: "/privacy/tasks/psi" },
      { label: "隐匿查询(PIR)", icon: <Search className="w-4 h-4" />, path: "/privacy/tasks/pir" },
      { label: "联合统计", icon: <BarChart3 className="w-4 h-4" />, path: "/privacy/tasks/stats" },
      { label: "联合SQL", icon: <Terminal className="w-4 h-4" />, path: "/privacy/tasks/sql" },
      { label: "联合建模", icon: <BrainCircuit className="w-4 h-4" />, path: "/privacy/tasks/modeling" },
      { label: "节点管理", icon: <Server className="w-4 h-4" />, path: "/privacy/nodes" },
      { label: "模型管理", icon: <Package className="w-4 h-4" />, path: "/privacy/models" },
    ],
  },
  // ====== 抽样管理：4项（保持不变） ======
  {
    label: "抽样管理",
    icon: <FlaskConical className="w-5 h-5" />,
    children: [
      { label: "标准与规则", icon: <BookOpen className="w-4 h-4" />, path: "/sampling/standards" },
      { label: "抽样任务", icon: <ClipboardList className="w-4 h-4" />, path: "/sampling/tasks" },
      { label: "质检中心", icon: <ShieldCheck className="w-4 h-4" />, path: "/sampling/inspection" },
      { label: "样品管理", icon: <Package className="w-4 h-4" />, path: "/sampling/samples" },
    ],
  },
  // ====== 密态计算：6项（去除业务层和通用功能，保留纯技术引擎） ======
  {
    label: "密态计算",
    icon: <Lock className="w-5 h-5" />,
    children: [
      { label: "密码协议引擎", icon: <CircuitBoard className="w-4 h-4" />, path: "/secret/mpc-engine" },
      { label: "可信执行环境(TEE)", icon: <Shield className="w-4 h-4" />, path: "/secret/tee" },
      { label: "同态加密引擎", icon: <Fingerprint className="w-4 h-4" />, path: "/secret/he-engine" },
      { label: "密钥与证书", icon: <Key className="w-4 h-4" />, path: "/secret/keys" },
      { label: "资源与调度", icon: <Server className="w-4 h-4" />, path: "/secret/resources" },
      { label: "网络通信", icon: <Radio className="w-4 h-4" />, path: "/secret/network" },
    ],
  },
  // ====== 区块链：5项（改名+精简） ======
  {
    label: "区块链",
    icon: <Blocks className="w-5 h-5" />,
    children: [
      { label: "网络运维", icon: <HardDrive className="w-4 h-4" />, path: "/blockchain/ops" },
      { label: "链网络", icon: <Network className="w-4 h-4" />, path: "/blockchain/networks" },
      { label: "智能合约", icon: <FileCode className="w-4 h-4" />, path: "/contract-lifecycle" },
      { label: "审计日志", icon: <ClipboardList className="w-4 h-4" />, path: "/blockchain/audit-logs" },
      { label: "跨链管理", icon: <ArrowLeftRight className="w-4 h-4" />, path: "/blockchain/cross-chain-mgmt" },
      { label: "系统管理", icon: <Lock className="w-4 h-4" />, path: "/blockchain/system" },
    ],
  },
  {
    label: "数据产品门户",
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      { label: "产品广场", icon: <Package className="w-4 h-4" />, path: "/product-portal" },
    ],
  },
  {
    label: "审批中心",
    icon: <UserCheck className="w-5 h-5" />,
    children: [
      { label: "资源审批", icon: <Server className="w-4 h-4" />, path: "/privacy/approval/resources" },
      { label: "代码与算法审批", icon: <FileCode className="w-4 h-4" />, path: "/privacy/approval/code" },
      { label: "模型与报告审批", icon: <FileText className="w-4 h-4" />, path: "/privacy/approval/reports" },
      { label: "合作审批", icon: <Users className="w-4 h-4" />, path: "/privacy/approval/cooperation" },
    ],
  },
  {
    label: "服务与监控",
    icon: <Activity className="w-5 h-5" />,
    children: [
      { label: "服务报表", icon: <BarChart3 className="w-4 h-4" />, path: "/privacy/service-reports" },
      { label: "监控中心", icon: <Monitor className="w-4 h-4" />, path: "/privacy/task-monitor" },
      { label: "审计日志", icon: <ClipboardList className="w-4 h-4" />, path: "/audit" },
      { label: "预警管理", icon: <AlertTriangle className="w-4 h-4" />, path: "/privacy/alerts" },
    ],
  },
  {
    label: "平台管理",
    icon: <Settings className="w-5 h-5" />,
    children: [
      { label: "机构管理", icon: <Building2 className="w-4 h-4" />, path: "/platform/institutions" },
      { label: "角色权限", icon: <Key className="w-4 h-4" />, path: "/platform/roles" },
      { label: "API密钥", icon: <Key className="w-4 h-4" />, path: "/privacy/api-keys" },
      { label: "操作日志", icon: <FileText className="w-4 h-4" />, path: "/platform/operation-log" },
      { label: "消息中心", icon: <MessageSquare className="w-4 h-4" />, path: "/workbench/notifications" },
    ],
  },
  {
    label: "统计报表中心",
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { label: "资产统计", icon: <PieChart className="w-4 h-4" />, path: "/reports" },
      { label: "运营报表", icon: <AreaChart className="w-4 h-4" />, path: "/reports" },
      { label: "合规报表", icon: <ShieldCheck className="w-4 h-4" />, path: "/reports" },
    ],
  },
];

function hasActiveChild(item: any, pathname: string): boolean {
  if (item.path && pathname.startsWith(item.path)) return true;
  if (item.children) {
    return item.children.some((child: any) => hasActiveChild(child, pathname));
  }
  return false;
}

export default function Sidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuStructure.forEach((item) => {
      initial[item.label] = hasActiveChild(item, location.pathname);
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenuItem = (item: any, depth = 0) => {
    const isActive = item.path && location.pathname.startsWith(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups[item.label] || false;
    const paddingLeft = depth === 0 ? "px-4" : depth === 1 ? "pl-10 pr-4" : "pl-14 pr-4";

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleGroup(item.label)}
            className={cn(
              "w-full flex items-center justify-between py-2.5 text-sm font-medium transition-colors",
              paddingLeft,
              isActive || hasActiveChild(item, location.pathname)
                ? "text-indigo-600 bg-indigo-50/60"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-2.5">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
          </button>
          {isExpanded && (
            <div className="pb-1">
              {item.children.map((child: any) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path || "#"}
        className={cn(
          "flex items-center gap-2.5 py-2 text-sm transition-colors",
          paddingLeft,
          isActive
            ? "text-indigo-600 bg-indigo-50/60 font-medium border-r-2 border-indigo-500"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      <nav className="flex-1 overflow-y-auto py-2">
        {menuStructure.map((item) => renderMenuItem(item))}
      </nav>
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <div className="text-xs text-gray-400">数据资产管理平台 V5.0</div>
      </div>
    </aside>
  );
}
