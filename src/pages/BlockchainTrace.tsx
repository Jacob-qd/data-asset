import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Link2,
  ArrowRight,
  FileText,
  User,
  Calendar,
  Fingerprint,
  CheckCircle2,
  Circle,
  ChevronRight,
  ShieldCheck,
  Database,
  Share2,
  Lock,
  Clock,
  Plus,
  Eye,
  Pencil,
  Trash,
  Shield,
  Download,
  AlertTriangle,
  Check,
  X,
  Upload,
  Send,
  MapPin,
  FileCheck,
  FileClock,
  FileX,
  Globe,
  Activity,
} from "lucide-react";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface TraceNode {
  stage: string;
  actor: string;
  time: string;
  action: string;
  txHash: string;
  status: string;
  detail: string;
  location?: string;
}

interface TraceChain {
  assetId: string;
  assetName: string;
  currentHolder: string;
  traceCount: number;
  nodes: TraceNode[];
}

interface VerificationResult {
  found: boolean;
  assetId?: string;
  assetName?: string;
  blockTime?: string;
  blockHeight?: number;
  txHash?: string;
  merkleRoot?: string;
}

interface AnomalyItem {
  id: string;
  traceId: string;
  traceName: string;
  type: "time" | "duplicate" | "unauthorized";
  severity: "high" | "medium" | "low";
  detectedAt: string;
  status: "open" | "reviewed";
  description: string;
  nodeIndex?: number;
}

interface AuditReport {
  id: string;
  traceId: string;
  firm: string;
  uploader: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  opinion?: string;
  fileName?: string;
}

interface CityCoord {
  name: string;
  x: number;
  y: number;
  region: string;
}

/* ─── Mock City Coordinates (simplified cartesian) ─── */
const cityCoords: CityCoord[] = [
  { name: "北京", x: 68, y: 28, region: "north" },
  { name: "上海", x: 78, y: 58, region: "east" },
  { name: "广州", x: 65, y: 82, region: "south" },
  { name: "深圳", x: 67, y: 84, region: "south" },
  { name: "杭州", x: 75, y: 62, region: "east" },
  { name: "成都", x: 42, y: 60, region: "west" },
  { name: "武汉", x: 60, y: 58, region: "central" },
  { name: "西安", x: 48, y: 48, region: "west" },
  { name: "南京", x: 74, y: 55, region: "east" },
  { name: "重庆", x: 45, y: 65, region: "west" },
];

const allowedActors = [
  "数据采集团",
  "数据治理组",
  "资产管理员",
  "授权中心",
  "金融风控中心",
  "交通监测组",
  "数据处理组",
  "智慧交通中心",
  "医疗机构",
  "隐私计算组",
  "医疗数据中心",
  "医学研究院",
];

const auditFirms = [
  "普华永道区块链审计",
  "德勤数字资产审计",
  "安永数据安全审计",
  "毕马威合规审计",
  "立信链上审计",
];

/* ─── Mock Trace Data ─── */
const initialTraceChains: TraceChain[] = [
  {
    assetId: "DA-2025-001",
    assetName: "企业信用评价数据集",
    currentHolder: "金融风控中心",
    traceCount: 6,
    nodes: [
      { stage: "数据生成", actor: "数据采集团", time: "2025-01-15 09:00:00", action: "原始数据采集", txHash: "0x1a2b...3c4d", status: "completed", detail: "从企业信用信息公示系统采集原始数据", location: "北京" },
      { stage: "质量审核", actor: "数据治理组", time: "2025-01-16 14:30:00", action: "数据质量审核", txHash: "0x2b3c...4d5e", status: "completed", detail: "通过数据质量检测，准确率99.2%", location: "上海" },
      { stage: "资产登记", actor: "资产管理员", time: "2025-01-17 10:15:00", action: "上链存证登记", txHash: "0x3c4d...5e6f", status: "completed", detail: "完成数据资产上链存证，分配DID标识", location: "北京" },
      { stage: "授权共享", actor: "授权中心", time: "2025-02-01 16:45:00", action: "授权金融风控中心使用", txHash: "0x4d5e...6f7a", status: "completed", detail: "签订数据使用协议，授权期限1年", location: "杭州" },
      { stage: "数据使用", actor: "金融风控中心", time: "2025-02-10 08:20:00", action: "数据查询调用", txHash: "0x5e6f...7a8b", status: "completed", detail: "调用数据用于风控模型训练", location: "深圳" },
      { stage: "结果反馈", actor: "金融风控中心", time: "2025-04-22 14:32:00", action: "使用结果上报", txHash: "0x6f7a...8b9c", status: "completed", detail: "上报数据使用效果和反馈评价", location: "深圳" },
    ],
  },
  {
    assetId: "DA-2025-002",
    assetName: "交通流量数据",
    currentHolder: "智慧交通中心",
    traceCount: 4,
    nodes: [
      { stage: "数据生成", actor: "交通监测组", time: "2025-03-01 00:00:00", action: "传感器数据采集", txHash: "0x7a8b...9c0d", status: "completed", detail: "全市交通传感器实时数据采集", location: "广州" },
      { stage: "数据清洗", actor: "数据处理组", time: "2025-03-01 06:00:00", action: "数据清洗加工", txHash: "0x8b9c...0d1e", status: "completed", detail: "完成数据清洗和格式标准化", location: "广州" },
      { stage: "资产登记", actor: "资产管理员", time: "2025-03-02 09:30:00", action: "上链存证登记", txHash: "0x9c0d...1e2f", status: "completed", detail: "完成数据资产上链存证", location: "武汉" },
      { stage: "开放共享", actor: "智慧交通中心", time: "2025-03-05 10:00:00", action: "数据授权开放", txHash: "0x0d1e...2f3a", status: "completed", detail: "授权5家研究机构使用", location: "成都" },
    ],
  },
  {
    assetId: "DA-2025-003",
    assetName: "医疗健康档案",
    currentHolder: "医疗数据中心",
    traceCount: 5,
    nodes: [
      { stage: "数据生成", actor: "医疗机构", time: "2025-02-10 08:00:00", action: "诊疗数据采集", txHash: "0x1e2f...3a4b", status: "completed", detail: "各医疗机构诊疗数据汇总", location: "南京" },
      { stage: "脱敏处理", actor: "隐私计算组", time: "2025-02-11 14:00:00", action: "数据脱敏处理", txHash: "0x2f3a...4b5c", status: "completed", detail: "对个人敏感信息进行脱敏", location: "杭州" },
      { stage: "资产登记", actor: "资产管理员", time: "2025-02-12 09:00:00", action: "上链存证登记", txHash: "0x3a4b...5c6d", status: "completed", detail: "完成数据资产上链存证", location: "北京" },
      { stage: "授权使用", actor: "授权中心", time: "2025-03-01 11:00:00", action: "授权科研使用", txHash: "0x4b5c...6d7e", status: "completed", detail: "授权医学研究院进行科研分析", location: "上海" },
      { stage: "流转跟踪", actor: "医学研究院", time: "2025-04-20 16:30:00", action: "数据流转记录", txHash: "0x5c6d...7e8f", status: "completed", detail: "数据流转使用记录上链", location: "西安" },
    ],
  },
];

/* ─── Fields ─── */
const traceFields: FieldConfig[] = [
  { key: "assetName", label: "资产名称", type: "text", required: true },
  { key: "currentHolder", label: "当前持有方", type: "text", required: true },
  { key: "traceCount", label: "溯源节点数", type: "number", required: true },
  { key: "nodes", label: "溯源节点 (JSON)", type: "textarea", required: true, placeholder: '[{"stage":"...","actor":"...","time":"...","action":"...","txHash":"...","status":"completed","detail":"..."}]' },
];

const detailFields = [
  { key: "assetId", label: "资产编号", type: "badge" as const },
  { key: "assetName", label: "资产名称" },
  { key: "currentHolder", label: "当前持有方" },
  { key: "traceCount", label: "溯源节点数" },
];

function generateAssetId(chains: TraceChain[]): string {
  const maxNum = chains.reduce((max, ch) => {
    const match = ch.assetId.match(/DA-2025-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `DA-2025-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Helpers ─── */
function parseTime(t: string): number {
  return new Date(t.replace(/-/g, "/")).getTime();
}

function generateId(): string {
  return Date.now().toString(36).toUpperCase();
}

/* ─── Trace Timeline ─── */
function TraceTimeline({ nodes, expanded }: { nodes: TraceNode[]; expanded: boolean }) {
  const displayNodes = expanded ? nodes : nodes.slice(0, 3);

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-[#334155]" />
      <div className="space-y-0">
        {displayNodes.map((node, i) => (
          <div key={i} className="relative pb-6 last:pb-0">
            <div className={cn(
              "absolute left-[-17px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10",
              node.status === "completed"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-slate-300 bg-white dark:bg-[#1E293B]"
            )}>
              {node.status === "completed" ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : (
                <Circle className="w-3 h-3 text-slate-400" />
              )}
            </div>
            <div className={cn(
              "rounded-lg border p-4 transition-all",
              "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {node.stage}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {node.action}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{node.txHash}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {node.detail}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {node.actor}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {node.time}
                </span>
                {node.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {node.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Geo Map Component ─── */
function GeoMap({ chains }: { chains: TraceChain[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const { scatterData, linesData } = useMemo(() => {
    const scatter: { name: string; value: [number, number]; itemStyle: { color: string }; node: TraceNode; chain: TraceChain }[] = [];
    const lines: { coords: [number, number][]; lineStyle: { color: string } }[] = [];

    const stageColors: Record<string, string> = {
      "数据生成": "#3B82F6",
      "质量审核": "#8B5CF6",
      "资产登记": "#10B981",
      "授权共享": "#F59E0B",
      "数据使用": "#EF4444",
      "结果反馈": "#6366F1",
      "数据清洗": "#06B6D4",
      "脱敏处理": "#EC4899",
      "授权使用": "#F97316",
      "流转跟踪": "#84CC16",
      "开放共享": "#14B8A6",
    };

    chains.forEach((chain) => {
      const pathCoords: [number, number][] = [];
      chain.nodes.forEach((node) => {
        const city = cityCoords.find((c) => c.name === node.location);
        if (city) {
          scatter.push({
            name: city.name,
            value: [city.x, city.y],
            itemStyle: { color: stageColors[node.stage] || "#64748B" },
            node,
            chain,
          });
          pathCoords.push([city.x, city.y]);
        }
      });
      if (pathCoords.length > 1) {
        for (let i = 0; i < pathCoords.length - 1; i++) {
          lines.push({
            coords: [pathCoords[i], pathCoords[i + 1]],
            lineStyle: { color: "#64748B" },
          });
        }
      }
    });

    return { scatterData: scatter, linesData: lines };
  }, [chains]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        textStyle: { color: "#F1F5F9" },
        formatter: (params: any) => {
          if (params.seriesType === "scatter") {
            const d = params.data as any;
            return `<div style="font-weight:600">${d.node.stage} — ${d.name}</div>
                    <div style="font-size:12px;color:#94A3B8">${d.chain.assetName}</div>
                    <div style="font-size:12px">操作: ${d.node.action}</div>
                    <div style="font-size:12px">时间: ${d.node.time}</div>
                    <div style="font-size:12px">执行人: ${d.node.actor}</div>`;
          }
          return "";
        },
      },
      grid: { left: 40, right: 40, top: 40, bottom: 40 },
      xAxis: { show: false, min: 0, max: 100 },
      yAxis: { show: false, min: 0, max: 100 },
      series: [
        {
          type: "scatter",
          coordinateSystem: "cartesian2d",
          data: scatterData.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: d.itemStyle,
            node: d.node,
            chain: d.chain,
          })),
          symbolSize: 18,
          label: {
            show: true,
            position: "bottom",
            formatter: "{b}",
            fontSize: 10,
            color: "#64748B",
          },
          emphasis: {
            itemStyle: {
              borderColor: "#F1F5F9",
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: "rgba(99,102,241,0.5)",
            },
          },
        },
        {
          type: "lines",
          coordinateSystem: "cartesian2d",
          data: linesData,
          lineStyle: { width: 2, opacity: 0.4, type: "dashed" },
          effect: {
            show: true,
            period: 4,
            trailLength: 0.4,
            symbol: "arrow",
            symbolSize: 6,
            color: "#6366F1",
          },
          z: 1,
        },
      ],
    };

    chartInstance.current.setOption(option);
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [scatterData, linesData]);

  return <div ref={chartRef} className="w-full h-[500px]" />;
}

/* ─── Main ─── */
export default function BlockchainTrace() {
  const [traceChains, setTraceChains] = useState<TraceChain[]>(initialTraceChains);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("DA-2025-001");
  const [activeTab, setActiveTab] = useState("list");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailChain, setDetailChain] = useState<TraceChain | null>(null);

  // Verification state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportChain, setExportChain] = useState<TraceChain | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "html">("pdf");
  const [exportOptions, setExportOptions] = useState({
    basic: true,
    fullChain: true,
    blockProof: false,
    geo: false,
  });

  // Anomaly state
  const [anomalyEnabled, setAnomalyEnabled] = useState(false);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [anomalyDetailOpen, setAnomalyDetailOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);

  // Audit state
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditChain, setAuditChain] = useState<TraceChain | null>(null);
  const [auditFirm, setAuditFirm] = useState(auditFirms[0]);
  const [auditReports, setAuditReports] = useState<AuditReport[]>([
    {
      id: generateId(),
      traceId: "DA-2025-001",
      firm: "普华永道区块链审计",
      uploader: "审计员A",
      uploadedAt: "2025-03-15 10:30:00",
      status: "approved",
      opinion: "该数据资产溯源链完整，所有节点均通过合规性验证，建议持续监控。",
      fileName: "DA-2025-001-审计报告.pdf",
    },
    {
      id: generateId(),
      traceId: "DA-2025-002",
      firm: "德勤数字资产审计",
      uploader: "审计员B",
      uploadedAt: "2025-03-20 14:00:00",
      status: "pending",
      fileName: "DA-2025-002-审计报告.pdf",
    },
  ]);

  const filtered = traceChains.filter(
    (c) => c.assetName.includes(search) || c.assetId.includes(search)
  );

  /* ─── Handlers ─── */
  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      assetName: "",
      currentHolder: "",
      traceCount: 1,
      nodes: JSON.stringify([
        {
          stage: "数据生成",
          actor: "",
          time: new Date().toISOString().replace("T", " ").slice(0, 19),
          action: "原始数据采集",
          txHash: "0x...",
          status: "completed",
          detail: "",
        },
      ], null, 2),
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (chain: TraceChain) => {
    setDialogMode("edit");
    setDialogData({
      assetName: chain.assetName,
      currentHolder: chain.currentHolder,
      traceCount: chain.traceCount,
      nodes: JSON.stringify(chain.nodes, null, 2),
    });
    setEditingId(chain.assetId);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (chain: TraceChain) => {
    setDialogMode("delete");
    setEditingId(chain.assetId);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    let parsedNodes: TraceNode[] = [];
    try {
      parsedNodes = JSON.parse(data.nodes || "[]");
    } catch {
      parsedNodes = [];
    }

    if (dialogMode === "create") {
      const assetId = generateAssetId(traceChains);
      const newChain: TraceChain = {
        assetId,
        assetName: data.assetName,
        currentHolder: data.currentHolder,
        traceCount: Number(data.traceCount),
        nodes: parsedNodes,
      };
      setTraceChains((prev) => [...prev, newChain]);
    } else if (dialogMode === "edit" && editingId) {
      setTraceChains((prev) =>
        prev.map((chain) =>
          chain.assetId === editingId
            ? {
                ...chain,
                assetName: data.assetName,
                currentHolder: data.currentHolder,
                traceCount: Number(data.traceCount),
                nodes: parsedNodes,
              }
            : chain
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setTraceChains((prev) => prev.filter((chain) => chain.assetId !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (chain: TraceChain) => {
    setDetailChain(chain);
    setDetailOpen(true);
  };

  /* ─── Verification ─── */
  const runVerification = () => {
    if (!verifyInput.trim()) return;
    setVerifyLoading(true);
    setVerifyResult(null);
    setTimeout(() => {
      const found = Math.random() > 0.3;
      if (found) {
        const chain = traceChains.find(
          (c) => c.assetId === verifyInput || c.assetName.includes(verifyInput)
        );
        setVerifyResult({
          found: true,
          assetId: chain?.assetId || `DA-2025-${Math.floor(Math.random() * 900 + 100)}`,
          assetName: chain?.assetName || "未知资产",
          blockTime: "2025-01-17 10:15:32",
          blockHeight: 18472931,
          txHash: "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6),
          merkleRoot: "0x" + Math.random().toString(16).slice(2, 18),
        });
      } else {
        setVerifyResult({ found: false });
      }
      setVerifyLoading(false);
    }, 800);
  };

  /* ─── Export ─── */
  const openExport = (chain: TraceChain) => {
    setExportChain(chain);
    setExportFormat("pdf");
    setExportOptions({ basic: true, fullChain: true, blockProof: false, geo: false });
    setExportOpen(true);
  };

  const runExport = () => {
    if (!exportChain) return;
    const content = `溯源报告
资产: ${exportChain.assetName}
编号: ${exportChain.assetId}
生成时间: ${new Date().toLocaleString()}
`;
    const blob = new Blob([content], { type: exportFormat === "pdf" ? "application/pdf" : "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportChain.assetId}-溯源报告.${exportFormat === "pdf" ? "pdf" : "html"}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  /* ─── Anomaly Detection ─── */
  const scanAnomalies = () => {
    const found: AnomalyItem[] = [];
    traceChains.forEach((chain) => {
      const nodeTimes = chain.nodes.map((n, i) => ({ index: i, time: parseTime(n.time), node: n }));

      // Time anomalies
      for (let i = 1; i < nodeTimes.length; i++) {
        if (nodeTimes[i].time < nodeTimes[i - 1].time) {
          found.push({
            id: generateId(),
            traceId: chain.assetId,
            traceName: chain.assetName,
            type: "time",
            severity: "high",
            detectedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
            status: "open",
            description: `节点 "${chain.nodes[i].stage}" 时间 (${chain.nodes[i].time}) 早于前一节点`,
            nodeIndex: i,
          });
        }
      }

      // Duplicate operations
      const actionCounts = new Map<string, number>();
      chain.nodes.forEach((n) => {
        actionCounts.set(n.action, (actionCounts.get(n.action) || 0) + 1);
      });
      actionCounts.forEach((count, action) => {
        if (count > 1 && action !== "上链存证登记") {
          found.push({
            id: generateId(),
            traceId: chain.assetId,
            traceName: chain.assetName,
            type: "duplicate",
            severity: "medium",
            detectedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
            status: "open",
            description: `操作 "${action}" 在溯源链中重复出现 ${count} 次`,
          });
        }
      });

      // Unauthorized actors
      chain.nodes.forEach((n, i) => {
        if (!allowedActors.includes(n.actor)) {
          found.push({
            id: generateId(),
            traceId: chain.assetId,
            traceName: chain.assetName,
            type: "unauthorized",
            severity: "high",
            detectedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
            status: "open",
            description: `执行人 "${n.actor}" 不在授权列表中`,
            nodeIndex: i,
          });
        }
      });
    });
    setAnomalies(found);
  };

  useEffect(() => {
    if (anomalyEnabled) {
      scanAnomalies();
    } else {
      setAnomalies([]);
    }
  }, [anomalyEnabled, traceChains]);

  const markAnomaliesReviewed = () => {
    setAnomalies((prev) => prev.map((a) => ({ ...a, status: "reviewed" })));
  };

  const openAnomalyDetail = (anomaly: AnomalyItem) => {
    setSelectedAnomaly(anomaly);
    setAnomalyDetailOpen(true);
  };

  /* ─── Audit ─── */
  const openAudit = (chain: TraceChain) => {
    setAuditChain(chain);
    setAuditFirm(auditFirms[0]);
    setAuditOpen(true);
  };

  const sendAuditInvitation = () => {
    if (!auditChain) return;
    const newReport: AuditReport = {
      id: generateId(),
      traceId: auditChain.assetId,
      firm: auditFirm,
      uploader: "系统",
      uploadedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      status: "pending",
    };
    setAuditReports((prev) => [...prev, newReport]);
    alert(`已向 ${auditFirm} 发送审计邀请`);
  };

  const mockUploadReport = () => {
    if (!auditChain) return;
    const newReport: AuditReport = {
      id: generateId(),
      traceId: auditChain.assetId,
      firm: auditFirm,
      uploader: "管理员",
      uploadedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      status: "approved",
      opinion: "经审计，该数据资产溯源链完整合规，所有节点存证有效。",
      fileName: `${auditChain.assetId}-审计报告-${Date.now()}.pdf`,
    };
    setAuditReports((prev) => [...prev, newReport]);
  };

  const detailData = detailChain
    ? {
        assetId: detailChain.assetId,
        assetName: detailChain.assetName,
        currentHolder: detailChain.currentHolder,
        traceCount: detailChain.traceCount,
      }
    : {};

  const severityBadge = (severity: string) => {
    const map: Record<string, string> = {
      high: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
      medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
      low: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
    };
    return map[severity] || map.low;
  };

  const anomalyTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      time: "时间异常",
      duplicate: "重复操作",
      unauthorized: "未授权执行人",
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">溯源追踪</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            基于区块链的数据资产全生命周期溯源查询
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { setVerifyOpen(true); setVerifyInput(""); setVerifyResult(null); }}>
            <Shield className="w-4 h-4" /> 验证溯源
          </Button>
          <Button
            variant={anomalyEnabled ? "default" : "outline"}
            className={cn("gap-2", anomalyEnabled && "bg-amber-600 hover:bg-amber-700 text-white")}
            onClick={() => setAnomalyEnabled((v) => !v)}
          >
            <AlertTriangle className="w-4 h-4" /> 异常检测
            {anomalies.filter((a) => a.status === "open").length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-amber-600 text-[10px] font-bold">
                {anomalies.filter((a) => a.status === "open").length}
              </span>
            )}
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" /> 创建溯源
          </Button>
        </div>
      </div>

      {/* Anomaly Banner */}
      {anomalyEnabled && anomalies.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  检测到 {anomalies.length} 项异常
                </span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={markAnomaliesReviewed}>
                全部标记已审核
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className={cn(
        "rounded-xl border p-4",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="输入资产编号或资产名称查询溯源..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm",
              "bg-white border-slate-200 text-slate-800",
              "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            )}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">溯源列表</TabsTrigger>
          <TabsTrigger value="geo">地理分布</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Trace Cards */}
          <div className="space-y-4">
            {filtered.map((chain) => (
              <div
                key={chain.assetId}
                className={cn(
                  "rounded-xl border overflow-hidden",
                  "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
                )}
              >
                {/* Card Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors"
                  onClick={() => setExpandedId(expandedId === chain.assetId ? null : chain.assetId)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {chain.assetName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 dark:bg-[#334155] dark:text-slate-400 font-mono">
                          {chain.assetId}
                        </span>
                        {anomalyEnabled && anomalies.some((a) => a.traceId === chain.assetId && a.status === "open") && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                            异常
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          当前持有: {chain.currentHolder}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {chain.traceCount} 个溯源节点
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => openAudit(chain)}>
                        <FileCheck className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openExport(chain)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openDetail(chain)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(chain)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(chain)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 text-slate-400 transition-transform",
                      expandedId === chain.assetId && "rotate-90"
                    )} />
                  </div>
                </div>

                {/* Expanded Timeline */}
                {expandedId === chain.assetId && (
                  <div className="px-4 pb-5 border-t border-slate-100 dark:border-[#334155]">
                    <div className="flex items-center gap-4 py-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-50" />
                        已完成
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-50" />
                        进行中
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3 text-blue-500" />
                        数据上链
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-violet-500" />
                        流转授权
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-red-500" />
                        安全存证
                      </span>
                    </div>
                    <TraceTimeline nodes={chain.nodes} expanded={true} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">未找到匹配的溯源记录</p>
              <p className="text-xs text-slate-400 mt-1">请检查输入的资产编号或名称</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="geo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                溯源节点地理分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GeoMap chains={traceChains} />
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
                {["数据生成", "质量审核", "资产登记", "授权共享", "数据使用", "结果反馈", "数据清洗", "脱敏处理", "授权使用", "流转跟踪", "开放共享"].map((stage) => (
                  <span key={stage} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{
                      backgroundColor: {
                        "数据生成": "#3B82F6", "质量审核": "#8B5CF6", "资产登记": "#10B981",
                        "授权共享": "#F59E0B", "数据使用": "#EF4444", "结果反馈": "#6366F1",
                        "数据清洗": "#06B6D4", "脱敏处理": "#EC4899", "授权使用": "#F97316",
                        "流转跟踪": "#84CC16", "开放共享": "#14B8A6",
                      }[stage] || "#64748B"
                    }} />
                    {stage}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Anomaly Table (when enabled) */}
      {anomalyEnabled && anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              异常检测列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">溯源资产</TableHead>
                  <TableHead className="text-xs">异常类型</TableHead>
                  <TableHead className="text-xs">严重级别</TableHead>
                  <TableHead className="text-xs">检测时间</TableHead>
                  <TableHead className="text-xs">状态</TableHead>
                  <TableHead className="text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomalies.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">
                      <div className="font-medium">{a.traceName}</div>
                      <div className="text-slate-400">{a.traceId}</div>
                    </TableCell>
                    <TableCell className="text-xs">{anomalyTypeLabel(a.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", severityBadge(a.severity))}>
                        {a.severity === "high" ? "高" : a.severity === "medium" ? "中" : "低"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{a.detectedAt}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "open" ? "destructive" : "secondary"} className="text-[10px]">
                        {a.status === "open" ? "待处理" : "已审核"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openAnomalyDetail(a)}>
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`溯源详情 - ${detailChain?.assetName || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailChain ? () => handleEdit(detailChain) : undefined}
        onDelete={detailChain ? () => handleDelete(detailChain) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${traceChains.find((c) => c.assetId === editingId)?.assetName || "溯源记录"}` : "溯源记录"}
        fields={traceFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              验证溯源
            </DialogTitle>
            <DialogDescription>
              输入数据哈希或资产编号，验证是否在区块链上存证
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="输入资产编号或数据哈希..."
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg border text-sm",
                  "bg-white border-slate-200 text-slate-800",
                  "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                )}
              />
              <Button onClick={runVerification} disabled={verifyLoading || !verifyInput.trim()}>
                {verifyLoading ? "验证中..." : "验证"}
              </Button>
            </div>

            {verifyResult && (
              <Card className={cn(
                verifyResult.found
                  ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-800"
                  : "border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800"
              )}>
                <CardContent className="p-4 space-y-3">
                  {verifyResult.found ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">已存证</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">资产名称</span>
                          <span className="font-medium">{verifyResult.assetName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">资产编号</span>
                          <span className="font-mono">{verifyResult.assetId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">存证时间</span>
                          <span>{verifyResult.blockTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">区块高度</span>
                          <span className="font-mono">{verifyResult.blockHeight?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">交易哈希</span>
                          <span className="font-mono text-xs">{verifyResult.txHash}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Merkle根</span>
                          <span className="font-mono text-xs">{verifyResult.merkleRoot}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => {
                        const chain = traceChains.find((c) => c.assetId === verifyResult.assetId);
                        if (chain) {
                          setVerifyOpen(false);
                          setExpandedId(chain.assetId);
                          setActiveTab("list");
                        }
                      }}>
                        查看完整溯源
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800 dark:text-red-200">未存证</span>
                      <span className="text-sm text-slate-500 ml-2">该数据未在区块链上找到存证记录</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              导出溯源报告
            </DialogTitle>
            <DialogDescription>
              {exportChain ? `导出 ${exportChain.assetName} (${exportChain.assetId}) 的溯源报告` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-2">选择格式</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  onClick={() => setExportFormat("pdf")}
                >
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant={exportFormat === "html" ? "default" : "outline"}
                  onClick={() => setExportFormat("html")}
                >
                  HTML
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">包含内容</p>
              <div className="space-y-2">
                {[
                  { key: "basic" as const, label: "基本信息" },
                  { key: "fullChain" as const, label: "全链路节点" },
                  { key: "blockProof" as const, label: "区块证明" },
                  { key: "geo" as const, label: "地理信息" },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions[opt.key]}
                      onChange={(e) => setExportOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                      className="rounded border-slate-300"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <Card className="bg-slate-50 dark:bg-[#0F172A] border-dashed">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">报告预览</p>
                <p className="text-xs text-slate-500 mt-1">
                  {exportChain?.assetName} — 溯源报告
                </p>
                <p className="text-xs text-slate-400">
                  共 {exportChain?.traceCount} 个节点 · {exportFormat.toUpperCase()} 格式
                </p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
            <Button onClick={runExport}>导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anomaly Detail Dialog */}
      <Dialog open={anomalyDetailOpen} onOpenChange={setAnomalyDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              异常详情
            </DialogTitle>
          </DialogHeader>
          {selectedAnomaly && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">溯源资产</span>
                  <span className="font-medium">{selectedAnomaly.traceName} ({selectedAnomaly.traceId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">异常类型</span>
                  <Badge variant="outline" className={cn("text-[10px]", severityBadge(selectedAnomaly.severity))}>
                    {anomalyTypeLabel(selectedAnomaly.type)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">严重级别</span>
                  <span>{selectedAnomaly.severity === "high" ? "高" : selectedAnomaly.severity === "medium" ? "中" : "低"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">检测时间</span>
                  <span>{selectedAnomaly.detectedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">状态</span>
                  <Badge variant={selectedAnomaly.status === "open" ? "destructive" : "secondary"} className="text-[10px]">
                    {selectedAnomaly.status === "open" ? "待处理" : "已审核"}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-slate-500">描述</span>
                  <p className="mt-1">{selectedAnomaly.description}</p>
                </div>
              </div>
              {selectedAnomaly.nodeIndex !== undefined && (
                <div>
                  <p className="text-sm font-medium mb-2">受影响节点</p>
                  {(() => {
                    const chain = traceChains.find((c) => c.assetId === selectedAnomaly.traceId);
                    const node = chain?.nodes[selectedAnomaly.nodeIndex];
                    if (!node) return null;
                    return (
                      <Card>
                        <CardContent className="p-3 text-sm space-y-1">
                          <div><span className="text-slate-500">阶段:</span> {node.stage}</div>
                          <div><span className="text-slate-500">操作:</span> {node.action}</div>
                          <div><span className="text-slate-500">执行人:</span> {node.actor}</div>
                          <div><span className="text-slate-500">时间:</span> {node.time}</div>
                          <div><span className="text-slate-500">交易:</span> <span className="font-mono text-xs">{node.txHash}</span></div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnomalyDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Dialog */}
      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              第三方审计
            </DialogTitle>
            <DialogDescription>
              {auditChain ? `管理 ${auditChain.assetName} (${auditChain.assetId}) 的审计事项` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {/* Send invitation */}
            <div className="space-y-3">
              <p className="text-sm font-medium">发送审计邀请</p>
              <div className="flex gap-2">
                <select
                  value={auditFirm}
                  onChange={(e) => setAuditFirm(e.target.value)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg border text-sm",
                    "bg-white border-slate-200 text-slate-800",
                    "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100"
                  )}
                >
                  {auditFirms.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <Button onClick={sendAuditInvitation} className="gap-1">
                  <Send className="w-4 h-4" /> 发送
                </Button>
              </div>
            </div>

            {/* Upload report */}
            <div className="space-y-3">
              <p className="text-sm font-medium">上传审计报告</p>
              <Button variant="outline" className="gap-2 w-full" onClick={mockUploadReport}>
                <Upload className="w-4 h-4" /> 模拟上传报告
              </Button>
            </div>

            {/* Audit reports list */}
            <div className="space-y-3">
              <p className="text-sm font-medium">审计报告列表</p>
              {auditReports.filter((r) => r.traceId === auditChain?.assetId).length === 0 ? (
                <p className="text-sm text-slate-500">暂无审计报告</p>
              ) : (
                <div className="space-y-2">
                  {auditReports
                    .filter((r) => r.traceId === auditChain?.assetId)
                    .map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{report.firm}</span>
                            <Badge
                              variant={
                                report.status === "approved"
                                  ? "default"
                                  : report.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {report.status === "approved" ? "已通过" : report.status === "rejected" ? "已驳回" : "审核中"}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500 space-y-0.5">
                            <div>上传人: {report.uploader}</div>
                            <div>时间: {report.uploadedAt}</div>
                            {report.fileName && <div>文件: {report.fileName}</div>}
                          </div>
                          {report.opinion && (
                            <div className="text-sm bg-slate-50 dark:bg-[#0F172A] p-2 rounded border border-slate-100 dark:border-[#334155]">
                              <span className="text-slate-500 text-xs">审计意见:</span>
                              <p className="mt-0.5">{report.opinion}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
