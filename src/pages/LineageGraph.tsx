import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  getSmoothStepPath,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Maximize, Wand2, LayoutTemplate, ArrowDown, GitBranch,
  Database, Settings, Cloud, BarChart3, X, Info, Table,
  FileCode, Clock, UserCircle, Layers, Monitor,
  ChevronRight, ChevronDown, FlaskConical, Server, Cable
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type NodeType = "table" | "etl" | "api" | "report";

interface LineageNodeData {
  label: string;
  type: NodeType;
  status: "success" | "running" | "failed";
  dbName?: string;
  fieldCount?: number;
  owner?: string;
  updateTime?: string;
  description?: string;
  layer?: "ods" | "dwd" | "dws" | "ads" | "app";
  [key: string]: unknown;
}

/* ─── colors ─── */
const layerColors: Record<string, string> = {
  ods: "#10B981",   // emerald
  dwd: "#3B82F6",   // blue
  dws: "#8B5CF6",   // violet
  ads: "#F59E0B",   // amber
  app: "#EC4899",   // pink
};

const typeColors: Record<NodeType, string> = {
  table: "#3B82F6",
  etl: "#06B6D4",
  api: "#EC4899",
  report: "#8B5CF6",
};

const statusColors = {
  success: "#10B981",
  running: "#F59E0B",
  failed: "#EF4444",
};

const layerLabels: Record<string, string> = {
  ods: "贴源层 ODS",
  dwd: "明细层 DWD",
  dws: "汇总层 DWS",
  ads: "应用层 ADS",
  app: "应用端 APP",
};

/* ─── 12 nodes, reduced from 20, wider spacing ─── */
const initialNodes: Node<LineageNodeData>[] = [
  // ODS Layer (y=0)
  { id: "ods_user", type: "table", position: { x: 80, y: 0 }, data: { label: "ods_user_info", type: "table", status: "success", dbName: "MySQL", fieldCount: 32, owner: "张三", updateTime: "2026-04-15", description: "用户注册信息、实名认证", layer: "ods" } },
  { id: "ods_order", type: "table", position: { x: 420, y: 0 }, data: { label: "ods_order_info", type: "table", status: "success", dbName: "MySQL", fieldCount: 48, owner: "李四", updateTime: "2026-04-15", description: "订单主表信息", layer: "ods" } },
  { id: "ods_product", type: "table", position: { x: 760, y: 0 }, data: { label: "ods_product_info", type: "table", status: "success", dbName: "MySQL", fieldCount: 28, owner: "王五", updateTime: "2026-04-15", description: "商品基础信息、类目", layer: "ods" } },

  // ETL Layer (y=220)
  { id: "etl_user", type: "etl", position: { x: 80, y: 220 }, data: { label: "etl_user_clean", type: "etl", status: "success", owner: "张三", updateTime: "2026-04-15", description: "用户数据清洗：去重、标准化" } },
  { id: "etl_order", type: "etl", position: { x: 420, y: 220 }, data: { label: "etl_order_clean", type: "etl", status: "success", owner: "李四", updateTime: "2026-04-15", description: "订单清洗：异常过滤、关联支付物流" } },
  { id: "etl_product", type: "etl", position: { x: 760, y: 220 }, data: { label: "etl_product_clean", type: "etl", status: "running", owner: "王五", updateTime: "2026-04-15", description: "商品数据清洗：类目层级标准化" } },

  // DWD Layer (y=440)
  { id: "dwd_user", type: "table", position: { x: 80, y: 440 }, data: { label: "dwd_user_detail", type: "table", status: "success", dbName: "Hive", fieldCount: 45, owner: "张三", updateTime: "2026-04-15", description: "标准化用户明细数据", layer: "dwd" } },
  { id: "dwd_order", type: "table", position: { x: 420, y: 440 }, data: { label: "dwd_order_detail", type: "table", status: "success", dbName: "Hive", fieldCount: 62, owner: "李四", updateTime: "2026-04-15", description: "关联支付物流的订单明细", layer: "dwd" } },
  { id: "dwd_product", type: "table", position: { x: 760, y: 440 }, data: { label: "dwd_product_detail", type: "table", status: "success", dbName: "Hive", fieldCount: 38, owner: "王五", updateTime: "2026-04-15", description: "商品明细：类目、品牌", layer: "dwd" } },

  // DWS Layer (y=660)
  { id: "dws_user", type: "table", position: { x: 80, y: 660 }, data: { label: "dws_user_rfm", type: "table", status: "success", dbName: "ClickHouse", fieldCount: 18, owner: "张三", updateTime: "2026-04-15", description: "用户RFM评分模型", layer: "dws" } },
  { id: "dws_order", type: "table", position: { x: 420, y: 660 }, data: { label: "dws_order_daily", type: "table", status: "success", dbName: "ClickHouse", fieldCount: 24, owner: "李四", updateTime: "2026-04-15", description: "订单日汇总指标", layer: "dws" } },

  // ADS Layer (y=880)
  { id: "ads_portrait", type: "table", position: { x: 80, y: 880 }, data: { label: "ads_user_portrait", type: "table", status: "success", dbName: "Redis", fieldCount: 56, owner: "张三", updateTime: "2026-04-15", description: "用户画像标签表", layer: "ads" } },
  { id: "ads_dashboard", type: "table", position: { x: 420, y: 880 }, data: { label: "ads_sales_dashboard", type: "table", status: "success", dbName: "MySQL", fieldCount: 32, owner: "李四", updateTime: "2026-04-15", description: "销售看板预聚合数据", layer: "ads" } },
  { id: "ads_recommend", type: "table", position: { x: 760, y: 880 }, data: { label: "ads_product_recommend", type: "table", status: "success", dbName: "Redis", fieldCount: 16, owner: "王五", updateTime: "2026-04-15", description: "协同过滤推荐结果", layer: "ads" } },

  // APP Layer (y=1100)
  { id: "app_api", type: "api", position: { x: 80, y: 1100 }, data: { label: "api_user_query", type: "api", status: "success", owner: "赵六", updateTime: "2026-04-15", description: "用户查询API接口" } },
  { id: "app_report", type: "report", position: { x: 420, y: 1100 }, data: { label: "report_sales_monthly", type: "report", status: "success", owner: "钱七", updateTime: "2026-04-15", description: "月度销售报表" } },
  { id: "app_engine", type: "report", position: { x: 760, y: 1100 }, data: { label: "app_recommend_engine", type: "report", status: "running", owner: "孙八", updateTime: "2026-04-15", description: "实时推荐引擎服务" } },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "ods_user", target: "etl_user", type: "smoothstep" },
  { id: "e2", source: "ods_order", target: "etl_order", type: "smoothstep" },
  { id: "e3", source: "ods_product", target: "etl_product", type: "smoothstep" },
  { id: "e4", source: "etl_user", target: "dwd_user", type: "smoothstep" },
  { id: "e5", source: "etl_order", target: "dwd_order", type: "smoothstep" },
  { id: "e6", source: "etl_product", target: "dwd_product", type: "smoothstep" },
  { id: "e7", source: "dwd_user", target: "dws_user", type: "smoothstep" },
  { id: "e8", source: "dwd_order", target: "dws_order", type: "smoothstep" },
  { id: "e9", source: "dwd_product", target: "ads_recommend", type: "smoothstep" },
  { id: "e10", source: "dws_user", target: "ads_portrait", type: "smoothstep" },
  { id: "e11", source: "dws_order", target: "ads_dashboard", type: "smoothstep" },
  { id: "e12", source: "ads_portrait", target: "app_api", type: "smoothstep" },
  { id: "e13", source: "ads_dashboard", target: "app_report", type: "smoothstep" },
  { id: "e14", source: "ads_recommend", target: "app_engine", type: "smoothstep" },
];

/* ─── custom node: Table ─── */
function TableNode(props: { data: LineageNodeData; selected?: boolean }) {
  const { data, selected } = props;
  const layer = data.layer || "ods";
  const color = layerColors[layer] || "#3B82F6";
  const typeIcon = { table: Database, etl: Settings, api: Cloud, report: BarChart3 }[data.type];
  const IconComp = typeIcon || Database;

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden transition-all duration-200",
        selected
          ? "ring-2 shadow-[0_0_24px_rgba(59,130,246,0.35)] scale-[1.02]"
          : "hover:ring-1 hover:shadow-[0_0_16px_rgba(59,130,246,0.18)] hover:scale-[1.01]"
      )}
      style={{ width: 220, minHeight: 88, borderColor: selected ? color : "transparent", borderWidth: 1 }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !border-white/30" style={{ backgroundColor: color }} />
      <div className="h-[3px] w-full" style={{ backgroundColor: color }} />
      <div className="bg-white dark:bg-[#0F172A]/95 backdrop-blur-sm p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20" }}>
            <IconComp className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">{data.dbName}</span>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto" style={{ backgroundColor: statusColors[data.status] }} />
        </div>
        <div className="text-sm text-white font-semibold truncate" title={data.label}>{data.label}</div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-500">
          <span>{data.fieldCount} 字段</span>
          <span>{data.owner}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !border-white/30" style={{ backgroundColor: color }} />
    </div>
  );
}

/* ─── custom node: ETL ─── */
function EtlNode(props: { data: LineageNodeData; selected?: boolean }) {
  const { data, selected } = props;
  const color = "#06B6D4";

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden transition-all duration-200",
        selected ? "ring-2 ring-[#06B6D4] shadow-[0_0_24px_rgba(6,182,212,0.35)] scale-[1.02]" : "hover:ring-1 hover:ring-[#22D3EE] hover:shadow-[0_0_16px_rgba(6,182,212,0.18)]"
      )}
      style={{ width: 180, height: 58, borderColor: selected ? color : "transparent", borderWidth: 1 }}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#06B6D4] !border-2 !border-white/30" />
      <div className="h-full bg-white dark:bg-[#0F172A]/95 backdrop-blur-sm flex items-center px-3 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/15 flex items-center justify-center flex-shrink-0">
          <Settings className="w-3.5 h-3.5 text-[#06B6D4]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-white font-medium truncate">{data.label}</div>
        </div>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[data.status] }} />
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-[#06B6D4] !border-2 !border-white/30" />
    </div>
  );
}

/* ─── custom node: API ─── */
function ApiNode(props: { data: LineageNodeData; selected?: boolean }) {
  const { data, selected } = props;
  const color = "#EC4899";

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden transition-all duration-200",
        selected ? "ring-2 ring-[#EC4899] shadow-[0_0_24px_rgba(236,72,153,0.35)] scale-[1.02]" : "hover:ring-1 hover:ring-[#F472B6] hover:shadow-[0_0_16px_rgba(236,72,153,0.18)]"
      )}
      style={{ width: 160, height: 58, borderColor: selected ? color : "transparent", borderWidth: 1 }}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#EC4899] !border-2 !border-white/30" />
      <div className="h-full bg-white dark:bg-[#0F172A]/95 backdrop-blur-sm flex items-center px-3 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#EC4899]/15 flex items-center justify-center flex-shrink-0">
          <Cloud className="w-3.5 h-3.5 text-[#EC4899]" />
        </div>
        <span className="text-[13px] text-white font-medium truncate flex-1">{data.label}</span>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[data.status] }} />
      </div>
    </div>
  );
}

/* ─── custom node: Report ─── */
function ReportNode(props: { data: LineageNodeData; selected?: boolean }) {
  const { data, selected } = props;
  const color = "#8B5CF6";

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden transition-all duration-200",
        selected ? "ring-2 ring-[#8B5CF6] shadow-[0_0_24px_rgba(139,92,246,0.35)] scale-[1.02]" : "hover:ring-1 hover:ring-[#A78BFA] hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]"
      )}
      style={{ width: 200, minHeight: 64, borderColor: selected ? color : "transparent", borderWidth: 1 }}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#8B5CF6] !border-2 !border-white/30" />
      <div className="h-[3px] w-full bg-[#8B5CF6]" />
      <div className="bg-white dark:bg-[#0F172A]/95 backdrop-blur-sm p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/15 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-3 h-3 text-[#8B5CF6]" />
          </div>
          <span className="text-sm text-white font-medium truncate flex-1">{data.label}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500">
          <span>{data.updateTime}</span>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[data.status] }} />
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  table: TableNode,
  etl: EtlNode,
  api: ApiNode,
  report: ReportNode,
};

/* ─── custom edge ─── */
function CustomEdge(props: {
  id: string; sourceX: number; sourceY: number; targetX: number; targetY: number;
  sourcePosition: string; targetPosition: string; markerEnd?: string; data?: { highlighted?: boolean };
}) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data } = props;
  const highlighted = data?.highlighted;

  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition: sourcePosition as Position, targetX, targetY, targetPosition: targetPosition as Position, borderRadius: 16,
  });

  return (
    <BaseEdge
      id={id} path={edgePath} markerEnd={markerEnd}
      style={{
        strokeWidth: highlighted ? 2.5 : 1.5,
        stroke: highlighted ? "#6366F1" : "rgba(100,116,139,0.5)",
        transition: "all 0.25s ease",
      }}
    />
  );
}

const edgeTypes = { smoothstep: CustomEdge };

/* ─── Detail Panel ─── */
function DetailPanel({ node, onClose }: { node: Node<LineageNodeData> | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("basic");
  if (!node) return null;
  const data = node.data;
  const layer = data.layer || "ods";
  const color = layerColors[layer] || "#3B82F6";

  const tabs = [
    { id: "basic", label: "基本信息" },
    { id: "schema", label: "字段信息" },
    { id: "lineage", label: "血缘链路" },
    { id: "impact", label: "影响分析" },
    { id: "log", label: "操作日志" },
  ];

  const mockFields = [
    { name: "id", type: "BIGINT", desc: "主键ID", sensitivity: "低" },
    { name: "create_time", type: "DATETIME", desc: "创建时间", sensitivity: "低" },
    { name: "user_id", type: "VARCHAR(64)", desc: "用户标识", sensitivity: "高" },
    { name: "phone", type: "VARCHAR(20)", desc: "手机号", sensitivity: "高" },
    { name: "email", type: "VARCHAR(100)", desc: "邮箱", sensitivity: "中" },
    { name: "status", type: "TINYINT", desc: "状态", sensitivity: "低" },
    { name: "score", type: "DECIMAL(10,2)", desc: "评分", sensitivity: "中" },
    { name: "region", type: "VARCHAR(50)", desc: "地区", sensitivity: "低" },
  ];

  return (
    <motion.div
      initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="absolute right-0 top-0 bottom-0 w-[420px] bg-white dark:bg-[#0F172A]/98 backdrop-blur-xl border-l border-slate-200 dark:border-[#1E293B] z-20 flex flex-col shadow-2xl"
    >
      <div className="p-5 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-10 rounded-full" style={{ backgroundColor: color }} />
            <div>
              <h3 className="text-lg font-semibold text-white">{data.label as string}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{data.dbName || "ETL Task"}</span>
                {data.layer && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-[#334155]">
                    {String(data.layer).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:bg-[#1E293B] transition-colors">
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{
            backgroundColor: statusColors[data.status] + "18", color: statusColors[data.status],
          }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColors[data.status] }} />
            {data.status === "success" ? "正常运行" : data.status === "running" ? "运行中" : "失败"}
          </span>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-[#1E293B] overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors relative",
              activeTab === tab.id ? "text-[#818CF8]" : "text-slate-500 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"
            )}>
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="lineage-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "basic" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {[
              { label: "名称", value: data.label, icon: FileCode },
              { label: "类型", value: data.type === "table" ? "数据库表" : data.type === "etl" ? "ETL任务" : data.type === "api" ? "API接口" : "报表", icon: Layers },
              { label: "数据库", value: data.dbName || "-", icon: Database },
              { label: "字段数", value: String(data.fieldCount || "-"), icon: Table },
              { label: "负责人", value: data.owner || "-", icon: UserCircle },
              { label: "更新时间", value: data.updateTime || "-", icon: Clock },
              { label: "描述", value: data.description || "-", icon: Info },
            ].map((field) => (
              <div key={field.label} className="flex gap-3">
                <field.icon className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">{field.label}</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{String(field.value)}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === "schema" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-200 dark:border-[#1E293B]">
                <th className="text-left py-2.5 px-2 text-slate-500 dark:text-slate-500 font-medium">字段名</th>
                <th className="text-left py-2.5 px-2 text-slate-500 dark:text-slate-500 font-medium">类型</th>
                <th className="text-left py-2.5 px-2 text-slate-500 dark:text-slate-500 font-medium">敏感级</th>
              </tr></thead>
              <tbody className="divide-y divide-[#1E293B]">
                {mockFields.map((f) => (
                  <tr key={f.name} className="hover:bg-slate-100 dark:bg-[#1E293B]/60">
                    <td className="py-2.5 px-2 text-slate-800 dark:text-slate-200 font-mono">{f.name}</td>
                    <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400 font-mono">{f.type}</td>
                    <td className="py-2.5 px-2">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium",
                        f.sensitivity === "高" ? "bg-red-500/15 text-red-400" :
                        f.sensitivity === "中" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                      )}>{f.sensitivity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        {activeTab === "lineage" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-3">完整血缘链路（上游 → 当前 → 下游）</div>
            {["ods_user", "etl_user", "dwd_user", "dws_user", "ads_portrait", "app_api"].map((id) => (
              <div key={id} className={cn("flex items-center gap-2 p-3 rounded-lg border text-xs transition-colors",
                id === node.id ? "border-[#6366F1] bg-[#6366F1]/8 text-[#818CF8] font-semibold" : "border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0B1120] text-slate-500 dark:text-slate-400"
              )}>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                {id}
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === "impact" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 border border-slate-200 dark:border-[#1E293B]">
                <div className="text-xs text-slate-500 dark:text-slate-500">下游依赖</div>
                <div className="text-2xl font-bold text-white mt-1">5</div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 border border-slate-200 dark:border-[#1E293B]">
                <div className="text-xs text-slate-500 dark:text-slate-500">影响应用</div>
                <div className="text-2xl font-bold text-white mt-1">2</div>
              </div>
            </div>
            {[
              { name: "dwd_user_detail", level: "高", type: "table" },
              { name: "dws_user_rfm", level: "高", type: "table" },
              { name: "ads_user_portrait", level: "高", type: "table" },
              { name: "api_user_query", level: "低", type: "api" },
              { name: "report_sales_monthly", level: "中", type: "report" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold",
                  item.level === "高" ? "bg-red-500/15 text-red-400" : item.level === "中" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                )}>{item.level}</span>
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === "log" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            {[
              { time: "2026-04-15 02:00", user: "系统", action: "ETL任务执行成功", result: "成功" },
              { time: "2026-04-14 02:00", user: "系统", action: "数据质量检查通过", result: "成功" },
              { time: "2026-04-13 09:30", user: "张三", action: "Schema变更：新增字段", result: "成功" },
              { time: "2026-04-10 15:20", user: "李四", action: "权限调整：读写权限", result: "成功" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 py-4 border-l-2 border-slate-200 dark:border-[#1E293B] pl-5 relative">
                <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-[#6366F1]" />
                <div>
                  <div className="text-sm text-slate-800 dark:text-slate-200">{log.action}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{log.user} · {log.time}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Legend ─── */
function Legend({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const items = [
    { color: "#10B981", label: "贴源层 ODS" },
    { color: "#3B82F6", label: "明细层 DWD" },
    { color: "#8B5CF6", label: "汇总层 DWS" },
    { color: "#F59E0B", label: "应用层 ADS" },
    { color: "#EC4899", label: "应用端 APP" },
    { color: "#06B6D4", label: "ETL 任务" },
  ];
  return (
    <div className="bg-white dark:bg-[#0F172A]/95 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
      <button onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1E293B] transition-colors">
        <span className="font-semibold">图例说明</span>
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              {items.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1E293B] mt-2 space-y-2">
                <div className="flex items-center gap-2.5"><Cable className="w-3 h-3 text-slate-600" /><span className="text-xs text-slate-500 dark:text-slate-500">普通依赖</span></div>
                <div className="flex items-center gap-2.5"><Cable className="w-3 h-3 text-[#6366F1]" /><span className="text-xs text-slate-500 dark:text-slate-500">选中高亮</span></div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B] text-[11px] text-slate-600 space-y-1">
                <div>节点: 18 | 连线: 14</div>
                <div>覆盖层级: 6</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Layer Labels Panel ─── */
function LayerLabelsPanel() {
  const layers = [
    { key: "ods", label: "贴源层", sub: "ODS", y: 0, color: "#10B981" },
    { key: "etl", label: "清洗层", sub: "ETL", y: 220, color: "#06B6D4" },
    { key: "dwd", label: "明细层", sub: "DWD", y: 440, color: "#3B82F6" },
    { key: "dws", label: "汇总层", sub: "DWS", y: 660, color: "#8B5CF6" },
    { key: "ads", label: "应用层", sub: "ADS", y: 880, color: "#F59E0B" },
    { key: "app", label: "应用端", sub: "APP", y: 1100, color: "#EC4899" },
  ];
  return (
    <Panel position="top-left" className="!m-0 !left-0 !top-0">
      <div className="flex flex-col">
        {layers.map((l) => (
          <div key={l.key} className="flex items-center gap-2 px-3 py-5" style={{ height: l.key === "etl" ? 58 : 220 }}>
            <div className="w-1 h-full rounded-full" style={{ backgroundColor: l.color + "40" }} />
            <div className="text-[10px] text-slate-500 dark:text-slate-500 font-medium whitespace-nowrap leading-tight">
              <div style={{ color: l.color }}>{l.label}</div>
              <div className="text-slate-600">{l.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ─── Flow Component ─── */
function FlowWithToolbar({ searchQuery, layoutMode }: { searchQuery: string; layoutMode: "auto" | "horizontal" | "vertical" | "force" }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<LineageNodeData> | null>(null);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const reactFlow = useReactFlow();

  // Search highlight
  useEffect(() => {
    if (!searchQuery.trim()) {
      setNodes((prev) => prev.map((n) => ({ ...n, style: undefined })));
      setEdges((prev) => prev.map((e) => ({ ...e, style: undefined, data: { ...e.data, highlighted: false } })));
      return;
    }
    const q = searchQuery.toLowerCase();
    const matched = new Set(initialNodes.filter((n) => n.data.label.toLowerCase().includes(q)).map((n) => n.id));
    setNodes((prev) => prev.map((n) => ({ ...n, style: { opacity: matched.has(n.id) ? 1 : 0.2, transition: "opacity 0.2s" } })));
    setEdges((prev) => prev.map((e) => ({
      ...e,
      style: { opacity: matched.has(e.source) || matched.has(e.target) ? 1 : 0.08, transition: "opacity 0.2s" },
      data: { ...e.data, highlighted: matched.has(e.source) || matched.has(e.target) },
    })));
  }, [searchQuery, setNodes, setEdges]);

  // Layout
  useEffect(() => {
    if (layoutMode === "auto") {
      runAutoLayout();
    } else if (layoutMode === "horizontal") {
      const groups = [
        ["ods_user", "ods_order", "ods_product"],
        ["etl_user", "etl_order", "etl_product"],
        ["dwd_user", "dwd_order", "dwd_product"],
        ["dws_user", "dws_order"],
        ["ads_portrait", "ads_dashboard", "ads_recommend"],
        ["app_api", "app_report", "app_engine"],
      ];
      const updated = [...nodes];
      groups.forEach((group, gi) => {
        group.forEach((id, i) => {
          const idx = updated.findIndex((u) => u.id === id);
          if (idx !== -1) updated[idx] = { ...updated[idx], position: { x: gi * 280 + 60, y: i * 130 + 40 } };
        });
      });
      setNodes(updated);
      setTimeout(() => reactFlow.fitView({ padding: 0.15, duration: 500 }), 100);
    }
  }, [layoutMode]);

  const runAutoLayout = useCallback(() => {
    const levelMap: Record<string, number> = {};
    const getLevel = (id: string): number => {
      if (levelMap[id] !== undefined) return levelMap[id];
      const parents = initialEdges.filter((e) => e.target === id);
      if (parents.length === 0) { levelMap[id] = 0; return 0; }
      levelMap[id] = Math.max(...parents.map((e) => getLevel(e.source))) + 1;
      return levelMap[id];
    };
    initialNodes.forEach((n) => getLevel(n.id));
    const groups: Record<number, string[]> = {};
    Object.entries(levelMap).forEach(([id, lv]) => { if (!groups[lv]) groups[lv] = []; groups[lv].push(id); });
    const updated = nodes.map((n) => {
      const lv = levelMap[n.id] ?? 0;
      const siblings = groups[lv] || [];
      const idx = siblings.indexOf(n.id);
      const count = siblings.length;
      const totalW = count * 220 + (count - 1) * 120;
      const startX = Math.max(80, (1200 - totalW) / 2);
      return { ...n, position: { x: startX + idx * 340, y: lv * 220 + 20 } };
    });
    setNodes(updated);
    setTimeout(() => reactFlow.fitView({ padding: 0.15, duration: 500 }), 100);
  }, [nodes, setNodes, reactFlow]);

  useEffect(() => { const t = setTimeout(runAutoLayout, 300); return () => clearTimeout(t); }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as unknown as Node<LineageNodeData>);
    setEdges((prev) => prev.map((e) => ({
      ...e,
      style: {
        stroke: e.source === node.id || e.target === node.id ? "#6366F1" : "rgba(100,116,139,0.25)",
        strokeWidth: e.source === node.id || e.target === node.id ? 2.5 : 1,
        opacity: e.source === node.id || e.target === node.id ? 1 : 0.2,
      },
      animated: e.source === node.id || e.target === node.id,
      data: { ...e.data, highlighted: e.source === node.id || e.target === node.id },
    })));
    const connected = new Set(edges.filter((e) => e.source === node.id || e.target === node.id).flatMap((e) => [e.source, e.target]));
    setNodes((prev) => prev.map((n) => ({ ...n, style: { opacity: connected.has(n.id) || n.id === node.id ? 1 : 0.2, transition: "opacity 0.2s" } })));
  }, [edges, setEdges, setNodes]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setEdges((prev) => prev.map((e) => ({ ...e, style: undefined, animated: false, data: { ...e.data, highlighted: false } })));
    setNodes((prev) => prev.map((n) => ({ ...n, style: undefined })));
  }, [setEdges, setNodes]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        fitView attributionPosition="bottom-left"
        minZoom={0.08} maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: "arrowclosed", color: "rgba(100,116,139,0.6)", width: 10, height: 10 },
        }}
        style={{ background: "#020617" }}
      >
        <Background gap={24} size={1} color="rgba(99, 102, 241, 0.04)" />
        <MiniMap
          nodeColor={(n) => {
            const d = (n as unknown as Node<LineageNodeData>).data;
            return d.layer ? layerColors[d.layer] || "#3B82F6" : typeColors[d.type] || "#3B82F6";
          }}
          maskColor="rgba(2, 6, 23, 0.75)"
          className="!bg-white dark:bg-[#0F172A]/90 !border-slate-200 dark:border-[#1E293B] !rounded-xl"
          pannable zoomable
          style={{ width: 180, height: 120 }}
        />
        <Controls className="!bg-white dark:bg-[#0F172A]/90 !border-slate-200 dark:border-[#1E293B] !rounded-xl [&>button]:!border-slate-200 dark:border-[#1E293B] [&>button]:!text-slate-500 dark:text-slate-400 [&>button:hover]:!bg-slate-100 dark:bg-[#1E293B]" />
        <LayerLabelsPanel />
        <Panel position="bottom-left" className="!m-4">
          <Legend collapsed={legendCollapsed} onToggle={() => setLegendCollapsed(!legendCollapsed)} />
        </Panel>
      </ReactFlow>
      <AnimatePresence>
        {selectedNode && <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LineageGraph() {
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState<"auto" | "horizontal" | "vertical" | "force">("auto");

  return (
    <div className="h-full flex flex-col -m-6 animate-fadeIn" style={{ height: "calc(100vh - 112px)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1E293B] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索表名、字段、任务..."
              className="pl-10 w-[300px] h-9 bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-[#6366F1] focus-visible:ring-offset-0"
            />
          </div>
          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-xs text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6366F1]">
            <option>全部层级</option><option>ODS</option><option>DWD</option><option>DWS</option><option>ADS</option><option>APP</option>
          </select>
          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-xs text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6366F1]">
            <option>全部类型</option><option>数据库表</option><option>ETL任务</option><option>API</option><option>报表</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0B1120] rounded-lg p-1 border border-slate-200 dark:border-[#1E293B]">
          {[
            { id: "auto" as const, icon: Wand2, label: "自动" },
            { id: "horizontal" as const, icon: LayoutTemplate, label: "水平" },
          ].map((item) => (
            <button key={item.id} onClick={() => setLayoutMode(item.id)} title={item.label}
              className={cn("p-2 rounded-md transition-colors",
                layoutMode === item.id ? "bg-[#6366F1]/20 text-[#818CF8]" : "text-slate-500 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1E293B]"
              )}>
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-slate-500 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1E293B] transition-colors" title="全屏">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas - clean dark background, no watermark */}
      <div className="flex-1 relative bg-[#020617]">
        <ReactFlowProvider>
          <FlowWithToolbar searchQuery={searchQuery} layoutMode={layoutMode} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
