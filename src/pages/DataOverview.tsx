import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Database,
  TrendingUp,
  Package,
  PlusCircle,
  RefreshCw,
  Download,
  LayoutDashboard,
  ChevronRight,
  CheckSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import ChartCard from "@/components/ChartCard";

// KPI Data
const kpiData = [
  {
    title: "数据资产总数",
    value: "12,847",
    change: "8.2% 较上月",
    changeType: "up" as const,
    icon: <Database className="w-5 h-5" />,
    iconBg: "bg-[#EEF2FF] dark:bg-[#312E81]/30",
    iconColor: "text-[#6366F1]",
    sparklineData: [8200, 8500, 9100, 8900, 9500, 10200, 10800, 11200, 12000, 12847],
    sparklineColor: "#6366F1",
  },
  {
    title: "资产总估值（万元）",
    value: "45,678.90",
    change: "15.3% 较上月",
    changeType: "up" as const,
    icon: <TrendingUp className="w-5 h-5" />,
    iconBg: "bg-[#ECFDF5] dark:bg-[#064E3B]/30",
    iconColor: "text-[#10B981]",
    sparklineData: [30000, 32000, 31000, 34000, 35000, 37000, 38000, 40000, 42000, 45678.9],
    sparklineColor: "#10B981",
  },
  {
    title: "活跃数据产品",
    value: "1,256",
    change: "5.1% 较上月",
    changeType: "up" as const,
    icon: <Package className="w-5 h-5" />,
    iconBg: "bg-[#F0F9FF] dark:bg-[#0C4A6E]/30",
    iconColor: "text-[#3B82F6]",
    sparklineData: [900, 920, 950, 880, 1020, 1050, 1080, 1100, 1150, 1256],
    sparklineColor: "#3B82F6",
  },
  {
    title: "本月新增资产",
    value: "324",
    change: "12.0% 较上月",
    changeType: "up" as const,
    icon: <PlusCircle className="w-5 h-5" />,
    iconBg: "bg-[#FFFBEB] dark:bg-[#78350F]/30",
    iconColor: "text-[#F59E0B]",
    sparklineData: [180, 200, 150, 220, 190, 240, 210, 260, 280, 324],
    sparklineColor: "#F59E0B",
  },
];

// Trend chart data
const trendData = {
  dates: ["2026-01", "2026-02", "2026-03", "2026-04"],
  newAssets: [320, 280, 350, 324],
  valuations: [38000, 41000, 44000, 45678],
};

// Category distribution data
const categoryData = [
  { name: "金融数据", value: 3854, percent: 30, color: "#6366F1" },
  { name: "政务数据", value: 3212, percent: 25, color: "#3B82F6" },
  { name: "医疗数据", value: 2569, percent: 20, color: "#06B6D4" },
  { name: "交通数据", value: 1285, percent: 10, color: "#10B981" },
  { name: "教育数据", value: 1028, percent: 8, color: "#F59E0B" },
  { name: "其他", value: 899, percent: 7, color: "#94A3B8" },
];

// Ranking data
const rankingData = [
  { name: "金融风控数据集", value: 8560 },
  { name: "信用评价体系", value: 6230 },
  { name: "医疗健康档案", value: 5890 },
  { name: "交通流量数据", value: 4120 },
  { name: "企业工商信息", value: 3780 },
  { name: "教育资源库", value: 2560 },
  { name: "环境监测数据", value: 1890 },
  { name: "社保缴纳记录", value: 1560 },
];

// Recent activities
const activities = [
  { time: "14:32", desc: "张三创建了数据资产\"企业信用评价数据集\"", user: "张三", color: "bg-blue-500" },
  { time: "13:15", desc: "李四完成了\"交通流量数据\"的质量评估", user: "李四", color: "bg-emerald-500" },
  { time: "11:48", desc: "王五提交了\"医疗档案\"的登记申请", user: "王五", color: "bg-amber-500" },
  { time: "10:22", desc: "系统完成了每日资产自动盘点", user: "系统", color: "bg-purple-500" },
  { time: "09:05", desc: "赵六修改了\"教育资源\"的访问权限", user: "赵六", color: "bg-blue-500" },
];

// Todo items
const todoItems = [
  { text: "审核\"环境监测数据\"登记申请", priority: "high" as const, deadline: "今天 17:00" },
  { text: "完成\"金融风控数据集\"质量报告", priority: "high" as const, deadline: "今天 18:00" },
  { text: "处理3条数据血缘异常告警", priority: "medium" as const, deadline: "明天 12:00" },
  { text: "更新\"企业工商信息\"元数据", priority: "low" as const, deadline: "4月18日" },
  { text: "月度资产盘点报告审批", priority: "medium" as const, deadline: "4月20日" },
];

const priorityMap = {
  high: { label: "高优先级", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  medium: { label: "中优先级", color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  low: { label: "低优先级", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

function TrendChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 30, right: 60, bottom: 40, left: 50 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // Scales
    const maxBar = Math.max(...trendData.newAssets) * 1.2;
    const maxLine = Math.max(...trendData.valuations) * 1.2;

    // Grid lines
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      // Left axis labels
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(maxBar - (maxBar / 4) * i)), pad.left - 8, y + 4);

      // Right axis labels
      ctx.textAlign = "left";
      ctx.fillText(String(Math.round(maxLine - (maxLine / 4) * i)), w - pad.right + 8, y + 4);
    }

    // Bars
    const barW = cw / trendData.dates.length * 0.35;
    trendData.dates.forEach((date, i) => {
      const x = pad.left + (i / (trendData.dates.length - 1)) * cw;
      const barH = (trendData.newAssets[i] / maxBar) * ch;

      const grad = ctx.createLinearGradient(0, pad.top + ch - barH, 0, pad.top + ch);
      grad.addColorStop(0, "#6366F1");
      grad.addColorStop(1, "#818CF8");

      ctx.fillStyle = grad;
      ctx.roundRect(x - barW / 2, pad.top + ch - barH, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // X axis labels
      ctx.fillStyle = "#64748B";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(date, x, h - 12);
    });

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2;
    trendData.dates.forEach((_, i) => {
      const x = pad.left + (i / (trendData.dates.length - 1)) * cw;
      const y = pad.top + ch - (trendData.valuations[i] / maxLine) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Line points
    trendData.dates.forEach((_, i) => {
      const x = pad.left + (i / (trendData.dates.length - 1)) * cw;
      const y = pad.top + ch - (trendData.valuations[i] / maxLine) * ch;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Hover tooltip
    if (hoverIdx !== null) {
      const x = pad.left + (hoverIdx / (trendData.dates.length - 1)) * cw;
      const barH = (trendData.newAssets[hoverIdx] / maxBar) * ch;
      const lineY = pad.top + ch - (trendData.valuations[hoverIdx] / maxLine) * ch;

      // Highlight bar
      ctx.fillStyle = "rgba(99, 102, 241, 0.7)";
      ctx.fillRect(x - barW / 2 - 2, pad.top + ch - barH - 2, barW + 4, barH + 4);

      // Tooltip
      const tipW = 160;
      const tipH = 60;
      let tipX = x - tipW / 2;
      let tipY = Math.min(pad.top + ch - barH, lineY) - tipH - 10;
      if (tipX < pad.left) tipX = pad.left;
      if (tipX + tipW > w - pad.right) tipX = w - pad.right - tipW;
      if (tipY < 0) tipY = 10;

      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.beginPath();
      ctx.roundRect(tipX, tipY, tipW, tipH, 8);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(trendData.dates[hoverIdx], tipX + 10, tipY + 20);
      ctx.fillStyle = "#818CF8";
      ctx.fillText(`新增: ${trendData.newAssets[hoverIdx]}`, tipX + 10, tipY + 36);
      ctx.fillStyle = "#34D399";
      ctx.fillText(`估值: ${trendData.valuations[hoverIdx].toLocaleString()}万`, tipX + 10, tipY + 52);
    }

    // Legend
    const legendX = w - pad.right - 160;
    const legendY = 8;
    ctx.fillStyle = "#6366F1";
    ctx.fillRect(legendX, legendY, 12, 8);
    ctx.fillStyle = "#64748B";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("新增资产数", legendX + 18, legendY + 8);

    ctx.beginPath();
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2;
    ctx.moveTo(legendX + 80, legendY + 4);
    ctx.lineTo(legendX + 92, legendY + 4);
    ctx.stroke();
    ctx.fillStyle = "#64748B";
    ctx.fillText("资产估值", legendX + 96, legendY + 8);
  }, [hoverIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pad = 50;
    const cw = rect.width - 110;
    const innerX = x - pad;
    const idx = Math.round((innerX / cw) * (trendData.dates.length - 1));
    if (idx >= 0 && idx < trendData.dates.length) {
      setHoverIdx(idx);
    }
  };

  const handleMouseLeave = () => setHoverIdx(null);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[320px] cursor-crosshair"
      style={{ width: "100%", height: "320px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}

function DonutChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w * 0.35;
    const cy = h / 2;
    const rOut = Math.min(w * 0.28, h * 0.38);
    const rIn = rOut * 0.65;

    ctx.clearRect(0, 0, w, h);

    let startAngle = -Math.PI / 2;
    const total = categoryData.reduce((s, d) => s + d.value, 0);

    categoryData.forEach((cat) => {
      const angle = (cat.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rOut, startAngle, startAngle + angle);
      ctx.arc(cx, cy, rIn, startAngle + angle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = cat.color;
      ctx.fill();
      startAngle += angle;
    });

    // Center text
    ctx.fillStyle = "#334155";
    ctx.font = "bold 22px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("12,847", cx, cy - 8);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("资产总数", cx, cy + 12);

    // Legend on right
    const legendX = w * 0.62;
    let legendY = h / 2 - categoryData.length * 14;
    categoryData.forEach((cat) => {
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#475569";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(cat.name, legendX + 14, legendY - 1);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${cat.percent}%`, w - 10, legendY - 1);

      legendY += 28;
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ width: "100%", height: "260px" }}
    />
  );
}

function RankingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const maxVal = Math.max(...rankingData.map((d) => d.value));
    const barH = 22;
    const gap = (h - rankingData.length * barH) / (rankingData.length + 1);

    ctx.clearRect(0, 0, w, h);

    rankingData.forEach((item, i) => {
      const y = gap + i * (barH + gap);
      const labelW = 110;
      const barMaxW = w - labelW - 70;
      const barW = (item.value / maxVal) * barMaxW;

      // Label
      ctx.fillStyle = "#475569";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, labelW - 10, y + barH / 2);

      // Bar
      const grad = ctx.createLinearGradient(labelW, 0, labelW + barW, 0);
      grad.addColorStop(0, "#6366F1");
      grad.addColorStop(1, "#818CF8");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(labelW, y, barW, barH, [0, 4, 4, 0]);
      ctx.fill();

      // Value label
      ctx.fillStyle = "#64748B";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${item.value.toLocaleString()}万`, labelW + barW + 8, y + barH / 2);
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ width: "100%", height: "260px" }}
    />
  );
}

export default function DataOverview() {
  const [timeRange, setTimeRange] = useState("近30天");

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-h2 text-slate-800 dark:text-slate-100 font-bold">
            资产概览
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            全面了解数据资产的整体状况和动态变化
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            刷新数据
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#273548]"
          >
            <Download className="w-3.5 h-3.5" />
            导出报表
          </Button>
          <Link to="/cockpit">
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              进入驾驶舱
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KPICard key={i} {...kpi} delay={i * 80} />
        ))}
      </div>

      {/* Trend Chart */}
      <ChartCard
        title="资产趋势分析"
        className="animate-slideUp opacity-0"
        style={{ animationDelay: "0.4s", animationFillMode: "forwards" } as React.CSSProperties}
        actions={
          <div className="flex items-center gap-1">
            {["近7天", "近30天", "近90天", "本年"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#273548]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      >
        <TrendChart />
      </ChartCard>

      {/* Category Distribution + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="资产分类分布"
          className="animate-slideUp opacity-0"
        >
          <DonutChart />
        </ChartCard>

        <ChartCard
          title="资产价值排行 Top8"
          className="animate-slideUp opacity-0"
        >
          <RankingChart />
        </ChartCard>
      </div>

      {/* Recent Activities + Todo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activities */}
        <div
          className="bg-white dark:bg-dark-card rounded-lg shadow-md p-5 animate-slideUp opacity-0"
          style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              最近活动
            </h3>
            <button className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
              查看全部
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative pl-4">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 dark:bg-[#334155]" />

            <div className="space-y-4">
              {activities.map((act, i) => (
                <div
                  key={i}
                  className="relative flex gap-3 animate-slideRight opacity-0"
                  style={{ animationDelay: `${0.7 + i * 0.08}s`, animationFillMode: "forwards" }}
                >
                  {/* Dot */}
                  <div
                    className={`relative z-10 w-2 h-2 mt-1.5 rounded-full ${act.color} ring-4 ring-white dark:ring-dark-card`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400 font-mono">{act.time}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                      {act.desc}
                    </p>
                    <span className="text-xs text-slate-400 mt-0.5">{act.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div
          className="bg-white dark:bg-dark-card rounded-lg shadow-md p-5 animate-slideUp opacity-0"
          style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                待办事项
              </h3>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-medium">
                {todoItems.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {todoItems.map((todo, i) => {
              const p = priorityMap[todo.priority];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#273548]/50 transition-colors animate-slideRight opacity-0"
                  style={{ animationDelay: `${0.8 + i * 0.08}s`, animationFillMode: "forwards" }}
                >
                  <CheckSquare className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${p.color}`}>
                        {p.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <AlertCircle className="w-3 h-3" />
                        {todo.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
