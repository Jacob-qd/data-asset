import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Server,
  PlayCircle,
  Cpu,
  Shield,
  Zap,
  Plus,
  Pause,
  RotateCcw,
  Square,
  Settings,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  Database,
  Lock,
  BarChart3,
  Eye,
  Layers,
  Network,
  ShieldCheck,
  Activity,
  Timer,
  TrendingUp,
  HardDrive,
  MemoryStick,
  Monitor,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Radio,
  Globe,
  Building2,
  Hospital,
  Landmark,
  Factory,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as echarts from "echarts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ClusterNode {
  id: string;
  name: string;
  type: "coordinator" | "participant";
  org: string;
  status: "online" | "offline";
  ip: string;
  cpu: number;
  memory: number;
  tasks: number;
  lastHeartbeat: string;
  icon: string;
}

interface TaskItem {
  id: string;
  name: string;
  algorithm: "联邦学习" | "PSI" | "PIR" | "联合统计" | "MPC" | "差分隐私";
  participants: number;
  status: "运行中" | "待执行" | "已完成" | "失败" | "已暂停";
  progress: number;
  startTime: string;
  execTime: string;
}

interface AlgorithmCard {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  icon: string;
  color: string;
  bgColor: string;
  count: number;
  tag?: string;
  tagColor?: string;
  protocols: string[];
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const CLUSTER_NODES: ClusterNode[] = [
  { id: "coord", name: "协调节点", type: "coordinator", org: "平台中心", status: "online", ip: "10.0.0.1", cpu: 35, memory: 48, tasks: 12, lastHeartbeat: "2s前", icon: "network" },
  { id: "p1", name: "参与方A", type: "participant", org: "市人民医院", status: "online", ip: "10.0.1.2", cpu: 42, memory: 55, tasks: 3, lastHeartbeat: "5s前", icon: "hospital" },
  { id: "p2", name: "参与方B", type: "participant", org: "工商银行", status: "online", ip: "10.0.1.3", cpu: 38, memory: 62, tasks: 4, lastHeartbeat: "3s前", icon: "landmark" },
  { id: "p3", name: "参与方C", type: "participant", org: "平安保险", status: "online", ip: "10.0.1.4", cpu: 28, memory: 40, tasks: 2, lastHeartbeat: "8s前", icon: "shield" },
  { id: "p4", name: "参与方D", type: "participant", org: "市政务中心", status: "offline", ip: "10.0.1.5", cpu: 0, memory: 0, tasks: 0, lastHeartbeat: "2h前", icon: "building" },
  { id: "p5", name: "参与方E", type: "participant", org: "某科技公司", status: "online", ip: "10.0.1.6", cpu: 55, memory: 70, tasks: 5, lastHeartbeat: "4s前", icon: "factory" },
  { id: "p6", name: "参与方F", type: "participant", org: "市疾控中心", status: "online", ip: "10.0.1.7", cpu: 31, memory: 45, tasks: 2, lastHeartbeat: "6s前", icon: "stethoscope" },
];

const TASKS: TaskItem[] = [
  { id: "PC-20260415001", name: "联邦学习-信用评分", algorithm: "联邦学习", participants: 5, status: "运行中", progress: 72, startTime: "2026-04-15 14:00", execTime: "32分钟" },
  { id: "PC-20260415002", name: "PSI隐私求交-用户ID", algorithm: "PSI", participants: 3, status: "已完成", progress: 100, startTime: "2026-04-15 13:30", execTime: "8分钟" },
  { id: "PC-20260415003", name: "联合统计-医疗分析", algorithm: "联合统计", participants: 4, status: "已完成", progress: 100, startTime: "2026-04-15 12:00", execTime: "15分钟" },
  { id: "PC-20260414004", name: "PIR隐匿查询-企业信息", algorithm: "PIR", participants: 2, status: "已完成", progress: 100, startTime: "2026-04-14 16:00", execTime: "5分钟" },
  { id: "PC-20260414005", name: "联邦学习-风控模型", algorithm: "联邦学习", participants: 6, status: "失败", progress: 45, startTime: "2026-04-14 10:00", execTime: "45分钟" },
  { id: "PC-20260414006", name: "MPC-安全计算", algorithm: "MPC", participants: 4, status: "运行中", progress: 35, startTime: "2026-04-15 11:00", execTime: "18分钟" },
  { id: "PC-20260413007", name: "差分隐私-数据发布", algorithm: "差分隐私", participants: 3, status: "待执行", progress: 0, startTime: "-", execTime: "-" },
  { id: "PC-20260413008", name: "PSI-设备ID求交", algorithm: "PSI", participants: 3, status: "已完成", progress: 100, startTime: "2026-04-13 15:30", execTime: "12分钟" },
  { id: "PC-20260413009", name: "联邦学习-反欺诈", algorithm: "联邦学习", participants: 4, status: "已暂停", progress: 60, startTime: "2026-04-13 09:00", execTime: "1小时12分" },
  { id: "PC-20260412010", name: "PIR-个人征信查询", algorithm: "PIR", participants: 2, status: "已完成", progress: 100, startTime: "2026-04-12 14:00", execTime: "6分钟" },
  { id: "PC-20260412011", name: "联合统计-销售分析", algorithm: "联合统计", participants: 5, status: "已完成", progress: 100, startTime: "2026-04-12 10:00", execTime: "22分钟" },
  { id: "PC-20260411012", name: "联邦学习-推荐模型", algorithm: "联邦学习", participants: 6, status: "运行中", progress: 18, startTime: "2026-04-15 13:00", execTime: "8分钟" },
];

const ALGORITHMS: AlgorithmCard[] = [
  { id: "fl", name: "联邦学习", nameEn: "Federated Learning", desc: "多方协同训练机器学习模型，数据不出域，支持横向/纵向联邦学习", icon: "network", color: "#6366F1", bgColor: "rgba(99,102,241,0.15)", count: 89, tag: "推荐", tagColor: "#EF4444", protocols: ["Secure Aggregation", "Diffie-Hellman"] },
  { id: "psi", name: "隐私求交", nameEn: "PSI", desc: "Private Set Intersection，多方在不泄露原始数据的前提下计算集合交集", icon: "lock", color: "#10B981", bgColor: "rgba(16,185,129,0.15)", count: 234, protocols: ["ECDH-PSI", "KKRT16"] },
  { id: "pir", name: "隐匿查询", nameEn: "PIR", desc: "Private Information Retrieval，查询方不泄露查询内容，数据方不泄露非目标数据", icon: "eye", color: "#3B82F6", bgColor: "rgba(59,130,246,0.15)", count: 156, protocols: ["SealPIR", "Labeled PSI"] },
  { id: "sa", name: "联合统计", nameEn: "Secure Aggregation", desc: "支持多方联合求和、平均值、方差等统计计算，结果加密输出", icon: "barchart", color: "#F59E0B", bgColor: "rgba(245,158,11,0.15)", count: 312, protocols: ["MPC", "Homomorphic"] },
  { id: "mpc", name: "安全多方计算", nameEn: "MPC", desc: "通用安全多方计算框架，支持任意计算逻辑的安全执行", icon: "shield", color: "#EC4899", bgColor: "rgba(236,72,153,0.15)", count: 67, tag: "高级", tagColor: "#8B5CF6", protocols: ["GMW", "BGW", "SPDZ"] },
  { id: "dp", name: "差分隐私", nameEn: "Differential Privacy", desc: "通过添加数学噪声保护个体隐私，支持多种隐私预算分配策略", icon: "layers", color: "#8B5CF6", bgColor: "rgba(139,92,246,0.15)", count: 45, protocols: ["Laplace", "Gaussian"] },
];

const PARTICIPANTS_LIST = [
  { id: "p1", name: "市人民医院", ip: "10.0.1.2", status: "online", dataSize: "2.3TB" },
  { id: "p2", name: "工商银行", ip: "10.0.1.3", status: "online", dataSize: "5.1TB" },
  { id: "p3", name: "平安保险", ip: "10.0.1.4", status: "online", dataSize: "1.8TB" },
  { id: "p4", name: "市政务中心", ip: "10.0.1.5", status: "offline", dataSize: "0TB" },
  { id: "p5", name: "某科技公司", ip: "10.0.1.6", status: "online", dataSize: "3.2TB" },
  { id: "p6", name: "市疾控中心", ip: "10.0.1.7", status: "online", dataSize: "890GB" },
];

/* ------------------------------------------------------------------ */
/*  Algorithm Icon Helper                                              */
/* ------------------------------------------------------------------ */
function AlgorithmIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "network": return <Network className={className} />;
    case "lock": return <Lock className={className} />;
    case "eye": return <Eye className={className} />;
    case "barchart": return <BarChart3 className={className} />;
    case "shield": return <ShieldCheck className={className} />;
    case "layers": return <Layers className={className} />;
    default: return <Zap className={className} />;
  }
}

function NodeIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "hospital": return <Hospital className={className} />;
    case "landmark": return <Landmark className={className} />;
    case "building": return <Building2 className={className} />;
    case "factory": return <Factory className={className} />;
    case "stethoscope": return <Stethoscope className={className} />;
    case "shield": return <Shield className={className} />;
    default: return <Server className={className} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const statusConfig: Record<string, { bg: string; text: string; icon: ReactNode }> = {
  "运行中": { bg: "bg-[#EFF6FF] dark:bg-[#1E3A5F]", text: "text-[#2563EB]", icon: <Activity className="w-3 h-3" /> },
  "待执行": { bg: "bg-[#FFFBEB] dark:bg-[#451A03]", text: "text-[#D97706]", icon: <Timer className="w-3 h-3" /> },
  "已完成": { bg: "bg-[#ECFDF5] dark:bg-[#064E3B]", text: "text-[#059669]", icon: <Check className="w-3 h-3" /> },
  "失败": { bg: "bg-[#FEF2F2] dark:bg-[#450A0A]", text: "text-[#DC2626]", icon: <Square className="w-3 h-3" /> },
  "已暂停": { bg: "bg-[#F1F5F9] dark:bg-slate-200 dark:bg-[#334155]", text: "text-slate-500 dark:text-[#64748B]", icon: <Pause className="w-3 h-3" /> },
};

const algorithmTagColor: Record<string, string> = {
  "联邦学习": "bg-[#EEF2FF] dark:bg-[#312E81] text-[#6366F1]",
  "PSI": "bg-[#ECFDF5] dark:bg-[#064E3B] text-[#10B981]",
  "PIR": "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6]",
  "联合统计": "bg-[#FFFBEB] dark:bg-[#451A03] text-[#F59E0B]",
  "MPC": "bg-[#FDF2F8] dark:bg-[#4C1D95] text-[#EC4899]",
  "差分隐私": "bg-[#F5F3FF] dark:bg-[#4C1D95] text-[#8B5CF6]",
};

/* ------------------------------------------------------------------ */
/*  React Flow Custom Nodes                                            */
/* ------------------------------------------------------------------ */
function CoordinatorNode({ data }: NodeProps) {
  return (
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-[#6366F1] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse">
        <Radio className="w-6 h-6 text-white" />
        <span className="text-[9px] text-white mt-0.5 font-medium">协调节点</span>
      </div>
      <Handle type="source" position={Position.Top} className="!bg-[#6366F1] !w-2 !h-2" id="t" />
      <Handle type="source" position={Position.Right} className="!bg-[#6366F1] !w-2 !h-2" id="r" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#6366F1] !w-2 !h-2" id="b" />
      <Handle type="source" position={Position.Left} className="!bg-[#6366F1] !w-2 !h-2" id="l" />
      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-0 w-40 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-lg p-2 shadow-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="text-[10px] text-slate-500 dark:text-[#CBD5E1] font-semibold">{data.org as string}</div>
        <div className="text-[9px] text-slate-500 dark:text-[#64748B]">{data.ip as string}</div>
        <div className="text-[9px] text-[#10B981]">在线</div>
        <div className="text-[9px] text-slate-500 dark:text-[#64748B]">任务: {data.tasks as number}</div>
      </div>
    </div>
  );
}

function ParticipantNode({ data }: NodeProps) {
  const isOnline = data.status === "online";
  return (
    <div className="relative group">
      <div className={`w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center transition-all ${
        isOnline
          ? "bg-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          : "bg-[#475569]"
      }`}>
        <NodeIcon name={data.icon as string} className={`w-5 h-5 ${isOnline ? "text-white" : "text-slate-400 dark:text-[#94A3B8]"}`} />
        <span className={`text-[8px] mt-0.5 font-medium ${isOnline ? "text-white" : "text-slate-400 dark:text-[#94A3B8]"}`}>
          {data.label as string}
        </span>
      </div>
      <Handle type="target" position={Position.Right} className="!bg-[#10B981] !w-1.5 !h-1.5" />
      {/* Tooltip on hover */}
      <div className="absolute left-full ml-2 top-0 w-44 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-lg p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] font-semibold">{data.org as string}</div>
        <div className="text-[10px] text-slate-500 dark:text-[#64748B]">{data.ip as string}</div>
        <div className={`text-[10px] ${isOnline ? "text-[#10B981]" : "text-[#EF4444]"}`}>
          {isOnline ? "在线" : "离线"}
        </div>
        {isOnline && (
          <>
            <div className="mt-1 space-y-0.5">
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-500 dark:text-[#64748B]">CPU</span>
                <span className="text-slate-500 dark:text-[#CBD5E1]">{data.cpu as number}%</span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: `${data.cpu}%` }} />
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-500 dark:text-[#64748B]">内存</span>
                <span className="text-slate-500 dark:text-[#CBD5E1]">{data.memory as number}%</span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
                <div className="h-full bg-[#3B82F6] rounded-full transition-all" style={{ width: `${data.memory}%` }} />
              </div>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-[#64748B] mt-1">任务: {data.tasks as number} | 心跳: {data.lastHeartbeat as string}</div>
          </>
        )}
      </div>
    </div>
  );
}

const topoNodeTypes = {
  coordinator: CoordinatorNode,
  participant: ParticipantNode,
};

/* ------------------------------------------------------------------ */
/*  ECharts Donut Chart Component                                      */
/* ------------------------------------------------------------------ */
function DonutChart({ data, title, color }: { data: { name: string; value: number; color: string }[]; title: string; color: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const instance = echarts.init(chartRef.current);
    chartInstance.current = instance;

    const total = data.reduce((s, d) => s + d.value, 0);

    instance.setOption({
      title: {
        text: `${total}%`,
        subtext: title,
        left: "center",
        top: "center",
        textStyle: { color: "#CBD5E1", fontSize: 16, fontWeight: "bold" },
        subtextStyle: { color: "#64748B", fontSize: 10 },
      },
      series: [
        {
          type: "pie",
          radius: ["55%", "75%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: false } },
          labelLine: { show: false },
          data: data.map((d) => ({
            value: d.value,
            name: d.name,
            itemStyle: { color: d.color },
          })),
        },
      ],
    });

    const handleResize = () => instance.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      instance.dispose();
    };
  }, [data, title]);

  return <div ref={chartRef} style={{ width: "100%", height: 160 }} />;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function PrivacyComputing() {
  const [showTaskWizard, setShowTaskWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(["p1"]);
  const [taskName, setTaskName] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [clusterTab, setClusterTab] = useState<"nodes" | "config" | "network">("nodes");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("全部");
  const [tasks, setTasks] = useState<TaskItem[]>(TASKS);

  /* Topology nodes */
  const topoNodes: Node[] = useMemo(() => {
    const centerX = 300;
    const centerY = 220;
    const radius = 160;
    const nodes: Node[] = [];

    CLUSTER_NODES.forEach((n, i) => {
      if (n.type === "coordinator") {
        nodes.push({
          id: n.id,
          type: "coordinator",
          position: { x: centerX - 40, y: centerY - 40 },
          data: { label: n.name, org: n.org, ip: n.ip, status: n.status, cpu: n.cpu, memory: n.memory, tasks: n.tasks, lastHeartbeat: n.lastHeartbeat },
        });
      } else {
        const angle = ((i - 1) * 60 * Math.PI) / 180 - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 30;
        const y = centerY + radius * Math.sin(angle) - 30;
        nodes.push({
          id: n.id,
          type: "participant",
          position: { x, y },
          data: { label: n.name, org: n.org, ip: n.ip, status: n.status, cpu: n.cpu, memory: n.memory, tasks: n.tasks, lastHeartbeat: n.lastHeartbeat, icon: n.icon },
        });
      }
    });
    return nodes;
  }, []);

  const topoEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    CLUSTER_NODES.forEach((n) => {
      if (n.type === "participant" && n.status === "online") {
        edges.push({
          id: `e-${n.id}`,
          source: "coord",
          target: n.id,
          animated: true,
          style: { stroke: "#10B981", strokeWidth: 1.5, strokeDasharray: "6 4" },
          type: "default",
        });
      } else if (n.type === "participant") {
        edges.push({
          id: `e-${n.id}`,
          source: "coord",
          target: n.id,
          animated: false,
          style: { stroke: "#475569", strokeWidth: 1 },
          type: "default",
        });
      }
    });
    return edges;
  }, []);

  /* Filtered tasks */
  const filteredTasks = useMemo(() => {
    let t = tasks;
    if (taskFilter) t = t.filter((x) => x.name.includes(taskFilter) || x.id.includes(taskFilter));
    if (taskStatusFilter !== "全部") t = t.filter((x) => x.status === taskStatusFilter);
    return t;
  }, [tasks, taskFilter, taskStatusFilter]);

  /* Stats */
  const totalNodes = CLUSTER_NODES.length;
  const onlineNodes = CLUSTER_NODES.filter((n) => n.status === "online").length;
  const avgCpu = Math.round(CLUSTER_NODES.filter((n) => n.status === "online").reduce((s, n) => s + n.cpu, 0) / onlineNodes);
  const avgMem = Math.round(CLUSTER_NODES.filter((n) => n.status === "online").reduce((s, n) => s + n.memory, 0) / onlineNodes);

  /* Donut chart data */
  const cpuDonutData = [
    { name: "已用", value: avgCpu, color: "#6366F1" },
    { name: "空闲", value: 100 - avgCpu, color: "#334155" },
  ];
  const memDonutData = [
    { name: "已用", value: avgMem, color: "#3B82F6" },
    { name: "空闲", value: 100 - avgMem, color: "#334155" },
  ];

  const handleCreateTask = () => {
    setShowTaskWizard(true);
    setWizardStep(1);
    setSelectedAlgorithm(null);
    setSelectedParticipants(["p1"]);
    setTaskName("");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-slate-800 dark:text-slate-100 font-bold">隐私计算平台</h1>
          <p className="text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                {onlineNodes}个节点在线，{tasks.filter((t) => t.status === "运行中").length}个任务正在运行
              </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-9 gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={handleCreateTask}>
            <Plus className="w-4 h-4" />
            新建任务
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]" onClick={() => setShowClusterModal(true)}>
            <Settings className="w-3.5 h-3.5" />
            集群管理
          </Button>
        </div>
      </div>

      {/* ===== CLUSTER STATUS CARDS (4 columns) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Online Nodes */}
        <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg p-5 animate-slideUp opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
              <Server className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-[#94A3B8]">在线计算节点</div>
              <div className="text-[28px] font-mono font-bold text-slate-800 dark:text-[#F1F5F9] leading-tight mt-0.5">
                {onlineNodes}<span className="text-slate-500 dark:text-[#64748B] text-lg">/{totalNodes}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] mb-1">
              <span>{totalNodes - onlineNodes}个离线</span>
              <span className="text-[#10B981]">{Math.round((onlineNodes / totalNodes) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: `${(onlineNodes / totalNodes) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2 - Running Tasks */}
        <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg p-5 animate-slideUp opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-[#94A3B8]">运行中任务</div>
              <div className="text-[28px] font-mono font-bold text-slate-800 dark:text-[#F1F5F9] leading-tight mt-0.5">
                {tasks.filter((t) => t.status === "运行中").length}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-[10px]">
            <span className="text-[#F59E0B]">待执行 {tasks.filter((t) => t.status === "待执行").length}</span>
            <span className="text-slate-500 dark:text-[#64748B]">|</span>
            <span className="text-[#10B981]">已完成 {tasks.filter((t) => t.status === "已完成").length}</span>
            <span className="text-slate-500 dark:text-[#64748B]">|</span>
            <span className="text-[#EF4444]">失败 {tasks.filter((t) => t.status === "失败").length}</span>
          </div>
        </div>

        {/* Card 3 - CPU Usage */}
        <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg p-5 animate-slideUp opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-[#94A3B8]">平均 CPU 使用率</div>
              <div className="text-[28px] font-mono font-bold text-slate-800 dark:text-[#F1F5F9] leading-tight mt-0.5">{avgCpu}%</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] mb-1">
              <span>集群平均</span>
              <span className={avgCpu > 70 ? "text-[#EF4444]" : avgCpu > 50 ? "text-[#F59E0B]" : "text-[#10B981]"}>{avgCpu}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${avgCpu > 70 ? "bg-[#EF4444]" : avgCpu > 50 ? "bg-[#F59E0B]" : "bg-[#10B981]"}`}
                style={{ width: `${avgCpu}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4 - Memory Usage */}
        <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg p-5 animate-slideUp opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(236,72,153,0.15)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#EC4899]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-[#94A3B8]">平均内存使用率</div>
              <div className="text-[28px] font-mono font-bold text-slate-800 dark:text-[#F1F5F9] leading-tight mt-0.5">{avgMem}%</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] mb-1">
              <span>集群平均</span>
              <span className={avgMem > 70 ? "text-[#EF4444]" : avgMem > 50 ? "text-[#F59E0B]" : "text-[#10B981]"}>{avgMem}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${avgMem > 70 ? "bg-[#EF4444]" : avgMem > 50 ? "bg-[#F59E0B]" : "bg-[#10B981]"}`}
                style={{ width: `${avgMem}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="space-y-4">
        {/* LEFT COLUMN (60%) */}
        <div className="space-y-4">
          {/* Star Topology */}
          <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#6366F1]" />
                <span className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">计算集群拓扑</span>
                <span className="text-xs text-slate-500 dark:text-[#64748B]">集群A-联邦学习集群</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" />在线</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#475569]" />离线</span>
                <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548]">
                  <RotateCcw className="w-3 h-3 mr-1" />刷新
                </Button>
              </div>
            </div>
            <div className="h-[300px] relative">
              <ReactFlow
                nodes={topoNodes}
                edges={topoEdges}
                nodeTypes={topoNodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                style={{ background: "#0B1120" }}
                defaultEdgeOptions={{ type: "default" }}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#334155" gap={20} size={1} />
                <Controls className="!bg-slate-100 dark:bg-[#1E293B] !border-slate-200 dark:border-[#334155] !text-slate-500 dark:text-[#CBD5E1]" />
              </ReactFlow>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#6366F1]" />
                <span className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">任务列表</span>
                <span className="text-xs text-slate-500 dark:text-[#64748B]">({filteredTasks.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#64748B]" />
                  <input
                    type="text"
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    placeholder="搜索任务..."
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md pl-6 pr-2 py-1.5 focus:outline-none focus:border-[#6366F1] w-40"
                  />
                </div>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md px-2 py-1.5 focus:outline-none"
                >
                  <option>全部</option>
                  <option>运行中</option>
                  <option>待执行</option>
                  <option>已完成</option>
                  <option>失败</option>
                  <option>已暂停</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-white dark:bg-[#0F172A]">
                  <tr className="border-b border-slate-200 dark:border-[#334155]">
                    {["任务ID", "任务名称", "算法类型", "参与方", "开始时间", "执行时间", "状态", "进度", "操作"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-slate-400 dark:text-[#94A3B8] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const sc = statusConfig[task.status] || statusConfig["待执行"];
                    return (
                      <tr key={task.id} className="border-b border-slate-200 dark:border-[#334155]/50 hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548]/30 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-slate-400 dark:text-[#94A3B8] whitespace-nowrap">{task.id}</td>
                        <td className="px-3 py-2.5 text-slate-500 dark:text-[#CBD5E1] whitespace-nowrap font-medium">{task.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${algorithmTagColor[task.algorithm] || "bg-slate-200 dark:bg-[#334155] text-slate-400 dark:text-[#94A3B8]"}`}>
                            {task.algorithm}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 dark:text-[#94A3B8]">{task.participants}方</td>
                        <td className="px-3 py-2.5 text-slate-500 dark:text-[#64748B] whitespace-nowrap">{task.startTime}</td>
                        <td className="px-3 py-2.5 text-slate-500 dark:text-[#64748B] whitespace-nowrap">{task.execTime}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                            {sc.icon}
                            {task.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  task.status === "失败" ? "bg-[#EF4444]" : task.status === "已完成" ? "bg-[#10B981]" : "bg-[#6366F1]"
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-[#64748B]">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            {task.status === "运行中" && (
                              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548] transition-colors" title="暂停">
                                <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />
                              </button>
                            )}
                            {task.status === "已暂停" && (
                              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548] transition-colors" title="恢复">
                                <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
                              </button>
                            )}
                            {(task.status === "运行中" || task.status === "已暂停") && (
                              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548] transition-colors" title="终止">
                                <Square className="w-3.5 h-3.5 text-[#EF4444]" />
                              </button>
                            )}
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548] transition-colors" title="详情">
                              <MoreHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-[#64748B]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="space-y-4">
          {/* Algorithm Cards */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] mb-3">核心算法能力</h3>
            <div className="grid grid-cols-1 gap-3">
              {ALGORITHMS.map((algo, i) => (
                <div
                  key={algo.id}
                  className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.1)] rounded-xl p-4 hover:border-[rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 transition-all cursor-pointer animate-slideUp opacity-0"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: algo.bgColor }}>
                      <span style={{ color: algo.color }}><AlgorithmIcon name={algo.icon} className="w-6 h-6" /></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">{algo.name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">{algo.nameEn}</span>
                        {algo.tag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: algo.tagColor }}>
                            {algo.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-[#94A3B8] mt-1 line-clamp-2">{algo.desc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {algo.protocols.map((p) => (
                          <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#64748B]">{p}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">已执行 {algo.count} 次</span>
                        <Button size="sm" className="h-6 text-[10px] px-2 py-0" style={{ backgroundColor: algo.color, color: "white" }}>
                          创建任务
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Usage Charts */}
          <div className="bg-slate-100 dark:bg-[#1E293B] border border-[rgba(99,102,241,0.15)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] mb-3">资源分配</h4>
            <div className="grid grid-cols-2 gap-4">
              <DonutChart data={cpuDonutData} title="CPU" color="#6366F1" />
              <DonutChart data={memDonutData} title="内存" color="#3B82F6" />
            </div>
            {/* Resource legend */}
            <div className="flex justify-center gap-6 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6366F1]" />已分配</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-[#334155]" />空闲</span>
            </div>
          </div>
        </div>
      </div>



      {/* ===== CLUSTER MANAGEMENT MODAL ===== */}
      {showClusterModal && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowClusterModal(false)}>
          <div
            className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#334155]">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">集群管理</h3>
                <p className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">集群A-联邦学习集群 · {onlineNodes}/{totalNodes} 节点在线</p>
              </div>
              <button onClick={() => setShowClusterModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors">
                <X className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 py-2 border-b border-slate-200 dark:border-[#334155]">
              {[
                { key: "nodes", label: "节点管理", icon: Server },
                { key: "config", label: "集群配置", icon: Settings },
                { key: "network", label: "网络拓扑", icon: Network },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setClusterTab(tab.key as "nodes" | "config" | "network")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    clusterTab === tab.key
                      ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                      : "text-slate-500 dark:text-[#64748B] hover:text-slate-700 dark:hover:text-[#CBD5E1]"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* Nodes Tab */}
              {clusterTab === "nodes" && (
                <div className="animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">节点列表 ({CLUSTER_NODES.length})</h4>
                    <Button size="sm" className="h-7 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                      <Plus className="w-3 h-3 mr-1" />添加节点
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-[#334155]">
                          {["节点名称", "类型", "机构", "IP地址", "CPU", "内存", "任务数", "状态", "心跳", "操作"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-slate-400 dark:text-[#94A3B8] font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CLUSTER_NODES.map((node) => (
                          <tr key={node.id} className="border-b border-slate-200 dark:border-[#334155]/50 hover:bg-slate-50 dark:hover:bg-[#273548]/30 transition-colors">
                            <td className="px-3 py-2.5 text-slate-700 dark:text-[#CBD5E1] font-medium whitespace-nowrap">{node.name}</td>
                            <td className="px-3 py-2.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${node.type === "coordinator" ? "bg-[#312E81] text-[#818CF8]" : "bg-[#1E3A5F] text-[#60A5FA]"}`}>
                                {node.type === "coordinator" ? "协调" : "参与"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-[#94A3B8]">{node.org}</td>
                            <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-[#64748B]">{node.ip}</td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-[#94A3B8]">{node.cpu}%</td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-[#94A3B8]">{node.memory}%</td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-[#94A3B8]">{node.tasks}</td>
                            <td className="px-3 py-2.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${node.status === "online" ? "bg-[#064E3B] text-[#10B981]" : "bg-slate-200 dark:bg-[#334155] text-slate-400 dark:text-[#94A3B8]"}`}>
                                {node.status === "online" ? "在线" : "离线"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-[#64748B] text-[11px]">{node.lastHeartbeat}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex gap-1">
                                <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors" title="编辑">
                                  <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B]" />
                                </button>
                                {node.type !== "coordinator" && (
                                  <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors" title="移除">
                                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Config Tab */}
              {clusterTab === "config" && (
                <div className="animate-fadeIn space-y-4 max-w-xl">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1">集群名称</label>
                    <input type="text" defaultValue="集群A-联邦学习集群" className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1">超时时间(分钟)</label>
                      <input type="number" defaultValue={30} className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1">重试次数</label>
                      <input type="number" defaultValue={3} className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1">加密协议</label>
                    <select className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]">
                      <option>Secure Aggregation</option>
                      <option>Diffie-Hellman Key Exchange</option>
                      <option>OPRF-based</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1">结果存储路径</label>
                    <input type="text" defaultValue="/data/privacy/results/" className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="autoRetry" defaultChecked className="rounded border-slate-300" />
                    <label htmlFor="autoRetry" className="text-xs text-slate-500 dark:text-[#94A3B8]">任务失败自动重试</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="auditLog" defaultChecked className="rounded border-slate-300" />
                    <label htmlFor="auditLog" className="text-xs text-slate-500 dark:text-[#94A3B8]">启用审计日志</label>
                  </div>
                </div>
              )}

              {/* Network Tab */}
              {clusterTab === "network" && (
                <div className="animate-fadeIn">
                  <div className="h-[300px] rounded-lg overflow-hidden border border-slate-200 dark:border-[#334155]">
                    <ReactFlow
                      nodes={topoNodes}
                      edges={topoEdges}
                      nodeTypes={topoNodeTypes}
                      fitView
                      fitViewOptions={{ padding: 0.2 }}
                      style={{ background: "#0B1120" }}
                      defaultEdgeOptions={{ type: "default" }}
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background color="#334155" gap={20} size={1} />
                      <Controls className="!bg-[#1E293B] !border-[#334155] !text-[#CBD5E1]" />
                    </ReactFlow>
                  </div>
                  <div className="flex justify-center gap-6 mt-3 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" />在线节点</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#475569]" />离线节点</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6366F1]" />协调节点</span>
                    <span className="flex items-center gap-1"><span className="w-8 h-0.5 bg-[#10B981] border-dashed" />活跃连接</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]" onClick={() => setShowClusterModal(false)}>
                关闭
              </Button>
              <Button size="sm" className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={() => setShowClusterModal(false)}>
                保存配置
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TASK CREATION WIZARD (Modal) ===== */}
      {showTaskWizard && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTaskWizard(false)}>
          <div
            className="bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wizard header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#334155]">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">新建隐私计算任务</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        wizardStep >= step ? "bg-[#6366F1] text-white" : "bg-slate-200 dark:bg-[#334155] text-slate-500 dark:text-[#64748B]"
                      }`}>
                        {wizardStep > step ? <Check className="w-3 h-3" /> : step}
                      </div>
                      {step < 3 && (
                        <div className={`w-8 h-0.5 rounded ${wizardStep > step ? "bg-[#6366F1]" : "bg-slate-200 dark:bg-[#334155]"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowTaskWizard(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548] transition-colors">
                <X className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
              </button>
            </div>

            {/* Wizard body */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* Step 1: Select Algorithm */}
              {wizardStep === 1 && (
                <div className="animate-fadeIn">
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider mb-3">选择算法类型</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {ALGORITHMS.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedAlgorithm === algo.id
                            ? "border-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.1)]"
                            : "border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:border-[#475569]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: algo.bgColor }}>
                            <span style={{ color: algo.color }}><AlgorithmIcon name={algo.icon} className="w-4 h-4" /></span>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">{algo.name}</div>
                            <div className="text-[9px] text-slate-500 dark:text-[#64748B]">{algo.nameEn}</div>
                          </div>
                          {selectedAlgorithm === algo.id && <Check className="w-4 h-4 text-[#6366F1] ml-auto" />}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-2 line-clamp-2">{algo.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Configure Participants */}
              {wizardStep === 2 && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider mb-3">选择参与方 (至少2个)</h4>
                    <div className="space-y-2">
                      {PARTICIPANTS_LIST.map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedParticipants.includes(p.id)
                              ? "border-[#6366F1] bg-[rgba(99,102,241,0.1)]"
                              : "border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:border-[#475569]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            selectedParticipants.includes(p.id) ? "bg-[#6366F1] border-[#6366F1]" : "border-[#64748B]"
                          }`}>
                            {selectedParticipants.includes(p.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedParticipants.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants((prev) => [...prev, p.id]);
                              } else {
                                setSelectedParticipants((prev) => prev.filter((id) => id !== p.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">{p.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.status === "online" ? "bg-[#064E3B] text-[#10B981]" : "bg-slate-200 dark:bg-[#334155] text-slate-500 dark:text-[#64748B]"}`}>
                                {p.status === "online" ? "在线" : "离线"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-[#64748B]">{p.ip} · 数据规模: {p.dataSize}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider mb-2">任务名称</h4>
                    <input
                      type="text"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="输入任务名称..."
                      className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider mb-2">资源要求</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-[#64748B]">CPU核数</label>
                        <select className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-lg px-2 py-1.5 mt-1 focus:outline-none">
                          <option>2核</option>
                          <option>4核</option>
                          <option>8核</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-[#64748B]">内存</label>
                        <select className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-lg px-2 py-1.5 mt-1 focus:outline-none">
                          <option>4GB</option>
                          <option>8GB</option>
                          <option>16GB</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {wizardStep === 3 && (
                <div className="animate-fadeIn space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider mb-3">任务配置确认</h4>

                  <div className="bg-white dark:bg-[#0F172A] rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-[#64748B]">任务名称</span>
                      <span className="text-xs text-slate-500 dark:text-[#CBD5E1] font-medium">{taskName || "未命名任务"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-[#64748B]">算法类型</span>
                      <span className="text-xs text-slate-500 dark:text-[#CBD5E1] font-medium">
                        {ALGORITHMS.find((a) => a.id === selectedAlgorithm)?.name || "未选择"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-[#64748B]">参与方数量</span>
                      <span className="text-xs text-slate-500 dark:text-[#CBD5E1] font-medium">{selectedParticipants.length} 方</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-[#64748B]">参与方列表</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedParticipants.map((pid) => {
                          const p = PARTICIPANTS_LIST.find((x) => x.id === pid);
                          return p ? (
                            <span key={pid} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#273548] text-slate-500 dark:text-[#CBD5E1]">
                              {p.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-[#64748B]">超时时间</span>
                      <span className="text-xs text-slate-500 dark:text-[#CBD5E1]">30分钟</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-[#64748B]">结果输出</span>
                      <span className="text-xs text-slate-500 dark:text-[#CBD5E1]">默认存储</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#334155] flex justify-between">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-[#273548]"
                onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowTaskWizard(false)}
              >
                {wizardStep > 1 ? "上一步" : "取消"}
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                onClick={() => {
                  if (wizardStep < 3) {
                    setWizardStep(wizardStep + 1);
                  } else {
                    const newTask: TaskItem = {
                      id: `PC-${Date.now()}`,
                      name: taskName || "未命名任务",
                      algorithm: ALGORITHMS.find((a) => a.id === selectedAlgorithm)?.name || "联邦学习" as any,
                      participants: selectedParticipants.length,
                      status: "待执行",
                      progress: 0,
                      startTime: "-",
                      execTime: "-",
                    };
                    setTasks((prev) => [newTask, ...prev]);
                    setShowTaskWizard(false);
                    setWizardStep(1);
                    setSelectedAlgorithm(null);
                    setSelectedParticipants(["p1"]);
                    setTaskName("");
                  }
                }}
                disabled={wizardStep === 1 && !selectedAlgorithm}
              >
                {wizardStep < 3 ? "下一步" : "提交任务"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
