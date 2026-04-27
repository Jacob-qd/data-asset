import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as echarts from "echarts";
import {
  Database,
  DollarSign,
  Boxes,
  Zap,
  Minimize2,
  Users,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Volume2,
} from "lucide-react";

/* ─── CountUp Hook ─── */
function useCountUp(target: number, duration = 1200, delay = 500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setValue(target * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

/* ─── Formats ─── */
const fmtInt = (n: number) => Math.round(n).toLocaleString("zh-CN");
const fmtFloat = (n: number) =>
  n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Mock Data ─── */
const kpiData = [
  {
    title: "数据资产总量",
    value: 128456,
    prefix: "",
    suffix: "",
    change: "12.5% 较上月",
    icon: <Database className="w-5 h-5" />,
    iconBg: "bg-[#6366F1]/20",
    iconColor: "text-[#818CF8]",
    sparkline: [8200, 9320, 9010, 10340, 11200, 12500, 11800, 12800, 12100, 12846],
    sparkColor: "#6366F1",
  },
  {
    title: "资产总价值（万元）",
    value: 89234.56,
    prefix: "",
    suffix: "",
    change: "8.3% 较上月",
    icon: <DollarSign className="w-5 h-5" />,
    iconBg: "bg-[#F59E0B]/20",
    iconColor: "text-[#F59E0B]",
    sparkline: [65000, 67200, 69800, 71200, 74500, 76800, 80100, 82500, 85800, 89235],
    sparkColor: "#F59E0B",
  },
  {
    title: "数据产品数量",
    value: 3456,
    prefix: "",
    suffix: "",
    change: "23.1% 较上月",
    icon: <Boxes className="w-5 h-5" />,
    iconBg: "bg-[#06B6D4]/20",
    iconColor: "text-[#06B6D4]",
    sparkline: [1800, 1950, 2100, 2280, 2450, 2620, 2780, 2950, 3200, 3456],
    sparkColor: "#06B6D4",
  },
  {
    title: "今日服务调用",
    value: 2156789,
    prefix: "",
    suffix: "",
    change: "5.7% 较昨日",
    icon: <Zap className="w-5 h-5" />,
    iconBg: "bg-[#10B981]/20",
    iconColor: "text-[#10B981]",
    sparkline: [1800000, 1920000, 1850000, 2010000, 2100000, 1980000, 2050000, 2120000, 2080000, 2156789],
    sparkColor: "#10B981",
  },
];

const trendMonths = ["2026-01", "2026-02", "2026-03", "2026-04"];
const trendTransactionCount = [45200, 52100, 48900, 56700];
const trendCumulativeGrowth = [12.5, 18.3, 15.2, 24.8];

const donutData = [
  { value: 28, name: "金融数据", itemStyle: { color: "#6366F1" } },
  { value: 22, name: "政务数据", itemStyle: { color: "#3B82F6" } },
  { value: 18, name: "医疗数据", itemStyle: { color: "#06B6D4" } },
  { value: 12, name: "交通数据", itemStyle: { color: "#10B981" } },
  { value: 10, name: "教育数据", itemStyle: { color: "#F59E0B" } },
  { value: 10, name: "其他", itemStyle: { color: "#64748B" } },
];

const provinceData = [
  { name: "北京", value: 15600, x: 66, y: 28 },
  { name: "上海", value: 14200, x: 72, y: 52 },
  { name: "广东", value: 12800, x: 60, y: 75 },
  { name: "浙江", value: 9800, x: 70, y: 55 },
  { name: "江苏", value: 11200, x: 72, y: 48 },
  { name: "山东", value: 8900, x: 68, y: 42 },
  { name: "四川", value: 7200, x: 44, y: 58 },
  { name: "湖北", value: 6500, x: 58, y: 55 },
  { name: "湖南", value: 5800, x: 56, y: 62 },
  { name: "河南", value: 6100, x: 60, y: 46 },
  { name: "河北", value: 4200, x: 64, y: 35 },
  { name: "福建", value: 5400, x: 66, y: 68 },
  { name: "陕西", value: 4800, x: 50, y: 48 },
  { name: "重庆", value: 5100, x: 46, y: 60 },
  { name: "天津", value: 3900, x: 67, y: 33 },
  { name: "云南", value: 3600, x: 38, y: 72 },
  { name: "辽宁", value: 4500, x: 74, y: 22 },
  { name: "安徽", value: 4300, x: 66, y: 52 },
  { name: "广西", value: 3200, x: 50, y: 78 },
  { name: "山西", value: 3500, x: 56, y: 40 },
];

const top10Data = [
  { name: "企业工商信息库", value: 156234 },
  { name: "人口基础信息库", value: 142567 },
  { name: "信用评价数据集", value: 128901 },
  { name: "医疗健康档案", value: 98765 },
  { name: "交通出行数据集", value: 87432 },
  { name: "教育资源数据集", value: 76098 },
  { name: "环境监测数据集", value: 65321 },
  { name: "金融交易数据集", value: 54876 },
  { name: "地理信息数据集", value: 43219 },
  { name: "社保缴纳数据集", value: 32098 },
];

const dataFlowItems = [
  { name: "工商数据", percent: 80 },
  { name: "税务数据", percent: 60 },
  { name: "社保数据", percent: 90 },
  { name: "医疗数据", percent: 50 },
  { name: "交通数据", percent: 70 },
  { name: "教育数据", percent: 40 },
];

const securityEvents = [
  { time: "14:30", text: "访问权限变更审核通过", color: "#10B981" },
  { time: "13:15", text: "数据脱敏规则更新", color: "#3B82F6" },
  { time: "11:20", text: "新用户注册审核待处理", color: "#F59E0B" },
];

const tickerText =
  "欢迎使用数据资产管理平台 V3.0 | 新增隐私计算联邦学习模块 | 数据资产登记流程已优化 | 系统将于本周日凌晨2点进行例行维护";

/* ─── Mini Sparkline Canvas ─── */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
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
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = (1 - (v - min) / range) * (h - 4) + 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = color + "18";
    ctx.fill();
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = (1 - (v - min) / range) * (h - 4) + 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }, [data, color]);
  return <canvas ref={canvasRef} className="w-20 h-8" style={{ width: 80, height: 32 }} />;
}

/* ═══════════════════════════════════════════════════════════════
   Main Cockpit Page
   ═══════════════════════════════════════════════════════════════ */
export default function Cockpit() {
  const navigate = useNavigate();

  /* Clock */
  const [clock, setClock] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      setClock(
        `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, "0")}月${String(now.getDate()).padStart(2, "0")}日 ${weekdays[now.getDay()]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* KPI count-up values */
  const kpiVal0 = useCountUp(kpiData[0].value, 1200, 500);
  const kpiVal1 = useCountUp(kpiData[1].value, 1200, 600);
  const kpiVal2 = useCountUp(kpiData[2].value, 1200, 700);
  const kpiVal3 = useCountUp(kpiData[3].value, 1200, 800);
  const kpiValues = [kpiVal0, kpiVal1, kpiVal2, kpiVal3];

  /* ── ECharts Refs ── */
  const trendRef = useRef<HTMLDivElement>(null);
  const donutRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const rankingRef = useRef<HTMLDivElement>(null);

  /* ── Build: Trend Chart (Dual Y-axis) ── */
  useEffect(() => {
    if (!trendRef.current) return;
    const chart = echarts.init(trendRef.current);
    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        textStyle: { color: "#F1F5F9" },
        axisPointer: { type: "cross", crossStyle: { color: "#64748B" } },
      },
      legend: {
        data: ["资产数量", "价值增长(%)"],
        textStyle: { color: "#94A3B8", fontSize: 12 },
        top: 0,
        right: 0,
        itemWidth: 14,
        itemHeight: 6,
      },
      grid: { top: 36, right: 56, bottom: 28, left: 48 },
      xAxis: {
        type: "category",
        data: trendMonths,
        axisLabel: { color: "#64748B", fontSize: 11 },
        axisLine: { lineStyle: { color: "#334155" } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "资产数量",
          nameTextStyle: { color: "#64748B", fontSize: 10 },
          axisLabel: { color: "#64748B", fontSize: 11 },
          splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
          axisLine: { show: false },
        },
        {
          type: "value",
          name: "增长(%)",
          nameTextStyle: { color: "#64748B", fontSize: 10 },
          axisLabel: { color: "#64748B", fontSize: 11, formatter: "{value}%" },
          splitLine: { show: false },
          axisLine: { show: false },
        },
      ],
      series: [
        {
          name: "资产数量",
          type: "bar",
          barWidth: "40%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#6366F1" },
              { offset: 1, color: "rgba(99,102,241,0.2)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: trendTransactionCount,
          animationDelay: (idx: number) => idx * 200,
        },
        {
          name: "价值增长(%)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { color: "#10B981", width: 3 },
          itemStyle: { color: "#10B981", borderWidth: 2, borderColor: "#0B1120" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16,185,129,0.2)" },
              { offset: 1, color: "rgba(16,185,129,0)" },
            ]),
          },
          data: trendCumulativeGrowth,
          animationDelay: (idx: number) => idx * 200 + 400,
        },
      ],
      animationEasing: "cubicOut",
      animationDuration: 1500,
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);

  /* ── Build: Donut Chart ── */
  useEffect(() => {
    if (!donutRef.current) return;
    const chart = echarts.init(donutRef.current);
    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        textStyle: { color: "#F1F5F9" },
        formatter: "{b}: {c}%",
      },
      series: [
        {
          type: "pie",
          radius: ["50%", "72%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: "#0B1120", borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              color: "#F1F5F9",
              formatter: "{b}\n{c}%",
            },
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" },
          },
          labelLine: { show: false },
          data: donutData,
          animationType: "scale",
          animationEasing: "cubicOut",
          animationDuration: 1000,
          animationDelay: () => 800 + Math.random() * 200,
        },
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "38%",
          style: { text: "12", fill: "#F1F5F9", fontSize: 24, fontWeight: "bold", fontFamily: "JetBrains Mono" },
        },
        {
          type: "text",
          left: "center",
          top: "52%",
          style: { text: "资产分类", fill: "#94A3B8", fontSize: 11 },
        },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);

  /* ── Build: Map Heatmap (Scatter on background) ── */
  useEffect(() => {
    if (!mapRef.current) return;
    const chart = echarts.init(mapRef.current);
    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        textStyle: { color: "#F1F5F9" },
        formatter: (params: unknown) => {
          const p = params as { name?: string; value?: number[] };
          return `<div style="font-weight:600">${p.name}</div><div>资产数量: ${fmtInt(p.value?.[2] ?? 0)}</div>`;
        },
      },
      graphic: [
        {
          type: "image",
          left: "5%",
          top: "8%",
          right: "5%",
          bottom: "12%",
          style: { image: "./asset-map-cn.png", opacity: 0.85 },
          z: 0,
        },
      ],
      xAxis: { show: false, min: 0, max: 100 },
      yAxis: { show: false, min: 0, max: 100 },
      series: [
        {
          type: "scatter",
          coordinateSystem: "cartesian2d",
          data: provinceData.map((p) => ({
            name: p.name,
            value: [p.x, p.y, p.value],
            itemStyle: {
              color:
                p.value > 10000
                  ? "#4338CA"
                  : p.value > 5000
                    ? "#6366F1"
                    : p.value > 1000
                      ? "#818CF8"
                      : "#334155",
            },
          })),
          symbolSize: (val: number[]) => Math.sqrt(val[2]) * 0.5,
          emphasis: {
            itemStyle: {
              borderColor: "#F1F5F9",
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: "rgba(99,102,241,0.5)",
            },
          },
          animationDelay: (idx: number) => 1000 + idx * 80,
          animationDuration: 800,
          animationEasing: "cubicOut",
        },
        {
          type: "effectScatter",
          coordinateSystem: "cartesian2d",
          data: provinceData
            .filter((p) => p.value > 10000)
            .map((p) => ({ name: p.name, value: [p.x, p.y, p.value] })),
          symbolSize: (val: number[]) => Math.sqrt(val[2]) * 0.6,
          rippleEffect: { brushType: "stroke", scale: 2.5 },
          itemStyle: { color: "#6366F1" },
          animationDelay: (idx: number) => 1200 + idx * 100,
        },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);

  /* ── Build: Gauge Chart ── */
  useEffect(() => {
    if (!gaugeRef.current) return;
    const chart = echarts.init(gaugeRef.current);
    chart.setOption({
      backgroundColor: "transparent",
      series: [
        {
          type: "gauge",
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          radius: "90%",
          center: ["50%", "55%"],
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.6, "#EF4444"],
                [0.8, "#F59E0B"],
                [1, "#10B981"],
              ],
            },
          },
          pointer: {
            itemStyle: { color: "#10B981" },
            width: 4,
            length: "60%",
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 32,
            fontWeight: "bold",
            fontFamily: "JetBrains Mono",
            color: "#10B981",
            offsetCenter: [0, "15%"],
            formatter: "{value}",
          },
          data: [{ value: 92.5 }],
          animationDuration: 1500,
          animationDelay: 1200,
          animationEasing: "cubicOut",
        },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);

  /* ── Build: Top 10 Ranking Bar Chart ── */
  useEffect(() => {
    if (!rankingRef.current) return;
    const chart = echarts.init(rankingRef.current);
    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        textStyle: { color: "#F1F5F9" },
      },
      grid: { top: 8, right: 16, bottom: 4, left: 4, containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: "#64748B", fontSize: 10, formatter: (v: number) => (v >= 10000 ? (v / 10000).toFixed(0) + "万" : String(v)) },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
        axisLine: { show: false },
      },
      yAxis: {
        type: "category",
        data: top10Data.map((d) => d.name).reverse(),
        axisLabel: { color: "#94A3B8", fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: top10Data.map((d) => d.value).reverse(),
          barWidth: "55%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: "#6366F1" },
              { offset: 1, color: "rgba(99,102,241,0.3)" },
            ]),
            borderRadius: [0, 3, 3, 0],
          },
          label: {
            show: true,
            position: "right",
            color: "#818CF8",
            fontSize: 10,
            fontFamily: "JetBrains Mono",
            formatter: (p: { value?: number }) => fmtInt(p.value ?? 0),
          },
          animationDelay: (idx: number) => 1400 + idx * 100,
          animationDuration: 800,
        },
      ],
      animationEasing: "cubicOut",
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);

  /* ── Real-time data flow animation ── */
  const [flowRate, setFlowRate] = useState(2345);
  const [todayTotal, setTodayTotal] = useState(12456789);
  useEffect(() => {
    const id = setInterval(() => {
      setFlowRate((prev) => {
        const delta = Math.floor(Math.random() * 200) - 100;
        return Math.max(1800, Math.min(3200, prev + delta));
      });
      setTodayTotal((prev) => prev + Math.floor(Math.random() * 50));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  /* ── Breathing animation for live indicator ── */
  const [pulseOpacity, setPulseOpacity] = useState(1);
  useEffect(() => {
    let dir = 1;
    const id = setInterval(() => {
      setPulseOpacity((prev) => {
        if (prev >= 1) dir = -1;
        if (prev <= 0.3) dir = 1;
        return prev + dir * 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  /* ── Visibility / entrance animation state ── */
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* ── Exit handler ── */
  const handleExit = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    /* Fullscreen fixed overlay covering the entire viewport (hides navbar+sidebar) */
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        backgroundColor: "#0B1120",
        backgroundImage: "url(./cockpit-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-50 dark:bg-slate-50 dark:bg-[#0B1120]/80" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col h-full p-4 gap-3">
        {/* ═══════ Section 1: Top Bar ═══════ */}
        <div
          className="flex items-center justify-between h-12 px-4 rounded-lg shrink-0"
          style={{
            background: "rgba(11,17,32,0.8)",
            borderBottom: "1px solid rgba(99,102,241,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <img src="./logo.svg" alt="Logo" className="w-7 h-7" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>
              数据资产驾驶舱
            </h1>
          </div>

          {/* Center: Clock */}
          <div className="text-sm font-mono text-[#818CF8] tabular-nums">
            {clock}
          </div>

          {/* Right: Status + Exit */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  style={{
                    animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-300">系统运行正常</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span className="font-mono text-[#818CF8]">1,234</span>
              <span>人在线</span>
            </div>
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] transition-colors border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-[#334155] hover:border-slate-300 dark:border-slate-300 dark:border-slate-300 dark:border-[#475569]"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              退出
            </button>
          </div>
        </div>

        {/* ═══════ Section 2: KPI Cards ═══════ */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {kpiData.map((kpi, i) => (
            <div
              key={kpi.title}
              className="rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? `slideUp 0.5s ease-out ${0.3 + i * 0.1}s both` : "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Top: icon + title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
                    <span className={kpi.iconColor}>{kpi.icon}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] font-medium">{kpi.title}</span>
                </div>
              </div>
              {/* Value */}
              <div className="mt-2.5">
                <div className="text-[28px] font-bold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] font-mono tracking-tight leading-none">
                  {i === 1 ? fmtFloat(kpiValues[i]) : fmtInt(kpiValues[i])}
                </div>
              </div>
              {/* Change + sparkline */}
              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-xs font-medium text-emerald-400">
                  {"\u2191 "}
                  {kpi.change}
                </span>
                <MiniSparkline data={kpi.sparkline} color={kpi.sparkColor} />
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ Section 3: Main 3-Column Grid ═══════ */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-3 flex-1 min-h-0">
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Trend Chart (dual Y-axis: bar + line) */}
            <div
              className="flex-1 rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "slideUp 0.5s ease-out 0.6s both" : "none",
              }}
            >
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9]">数据资产趋势分析</h3>
                <div className="flex gap-1">
                  {["近7天", "近30天", "近90天", "本年"].map((r) => (
                    <button
                      key={r}
                      className="px-2 py-0.5 text-[10px] rounded border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] hover:border-[#6366F1] hover:text-slate-800 dark:text-white transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div ref={trendRef} className="flex-1 min-h-0 mt-2" />
            </div>

            {/* Donut Chart */}
            <div
              className="flex-1 rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "slideUp 0.5s ease-out 0.8s both" : "none",
              }}
            >
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] shrink-0">资产分类分布</h3>
              <div ref={donutRef} className="flex-1 min-h-0" />
              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center shrink-0 mt-1">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.itemStyle.color }}
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]">{d.name}</span>
                    <span className="text-[10px] text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] font-mono">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Center Column ── */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* China Map */}
            <div
              className="flex-[2] rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "scaleIn 1s ease-out 1s both" : "none",
              }}
            >
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9]">数据资产地域分布</h3>
                {/* Legend */}
                <div className="flex items-center gap-3">
                  {[
                    { label: ">10000", color: "#4338CA" },
                    { label: "5000-10000", color: "#6366F1" },
                    { label: "1000-5000", color: "#818CF8" },
                    { label: "<1000", color: "#334155" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-[#64748B]">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div ref={mapRef} className="flex-1 min-h-0 mt-2" />
            </div>

            {/* Real-time Data Flow */}
            <div
              className="flex-1 rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "slideUp 0.5s ease-out 1.4s both" : "none",
              }}
            >
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9]">实时数据接入监控</h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    style={{ opacity: pulseOpacity }}
                  />
                  <span className="text-[10px] text-emerald-400">实时</span>
                </div>
              </div>

              {/* Flow rate */}
              <div className="mt-2 shrink-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#818CF8]">
                    {fmtInt(flowRate)}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]">条/秒</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex-1 flex flex-col justify-center gap-2.5 min-h-0 overflow-hidden mt-2">
                {dataFlowItems.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] w-14 shrink-0 text-right">{item.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${item.percent}%`,
                          background: "linear-gradient(90deg, #6366F1, #818CF8)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-[#64748B] w-8 font-mono shrink-0">{item.percent}%</span>
                  </div>
                ))}
              </div>

              {/* Today total */}
              <div className="mt-2 pt-2 shrink-0" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-[#64748B]">今日累计</span>
                  <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9]">
                    {fmtInt(todayTotal)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-[#64748B]">条</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Gauge Chart */}
            <div
              className="flex-1 rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "slideUp 0.5s ease-out 1.2s both" : "none",
              }}
            >
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] shrink-0">资产质量评分</h3>
              <div ref={gaugeRef} className="flex-1 min-h-0" />

              {/* Sub-metrics */}
              <div className="flex gap-2 shrink-0 mt-1">
                {[
                  { label: "完整性", value: 95 },
                  { label: "准确性", value: 89 },
                  { label: "及时性", value: 93 },
                ].map((m) => (
                  <div key={m.label} className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]">{m.label}</span>
                      <span className="text-[10px] text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] font-mono">{m.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${m.value}%`,
                          background:
                            m.value >= 90
                              ? "#10B981"
                              : m.value >= 80
                                ? "#F59E0B"
                                : "#EF4444",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Ranking Bar Chart */}
            <div
              className="flex-1 rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "slideUp 0.5s ease-out 1.4s both" : "none",
              }}
            >
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] shrink-0">热门数据资产 Top10</h3>
              <div ref={rankingRef} className="flex-1 min-h-0 mt-2" />
            </div>

            {/* Security Overview */}
            <div
              className="flex-1 rounded-lg p-4 flex flex-col min-h-0"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                animation: visible ? "slideUp 0.5s ease-out 1.6s both" : "none",
              }}
            >
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9] shrink-0">安全态势概览</h3>

              {/* Score */}
              <div className="flex items-center gap-3 mt-2 shrink-0">
                <span className="text-3xl font-bold font-mono text-emerald-400">98</span>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400">
                    安全等级 A+
                  </span>
                </div>
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-3 gap-2 mt-2 shrink-0">
                <div className="flex items-center gap-2 rounded-md p-2" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-emerald-400">正常</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">156</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md p-2" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-amber-400">警告</div>
                    <div className="text-sm font-mono font-bold text-amber-400">3</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md p-2" style={{ background: "rgba(100,116,139,0.15)" }}>
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500">异常</div>
                    <div className="text-sm font-mono font-bold text-slate-500">0</div>
                  </div>
                </div>
              </div>

              {/* Event list */}
              <div className="flex-1 flex flex-col justify-center gap-2 min-h-0 mt-2 overflow-hidden">
                {securityEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2"
                    style={{
                      animation: visible
                        ? `slideRight 0.4s ease-out ${1.8 + idx * 0.1}s both`
                        : "none",
                    }}
                  >
                    <span
                      className="shrink-0 mt-0.5 w-1 h-1 rounded-full"
                      style={{ backgroundColor: evt.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-[#64748B] font-mono mr-1.5">[{evt.time}]</span>
                      <span className="text-[11px]" style={{ color: evt.color }}>
                        {evt.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Section 6: Bottom Ticker ═══════ */}
        <div
          className="h-10 rounded-lg flex items-center overflow-hidden shrink-0"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            animation: visible ? "slideUp 0.4s ease-out 2s both" : "none",
          }}
        >
          <div className="flex items-center gap-2 px-4 shrink-0" style={{ borderRight: "1px solid rgba(99,102,241,0.2)" }}>
            <Volume2 className="w-3.5 h-3.5 text-[#818CF8]" />
            <span className="text-xs text-[#818CF8] font-medium">系统公告</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] animate-marquee pl-4">
              {tickerText}
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframes for marquee + ping */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
