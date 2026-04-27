import { useState, useRef, useEffect } from "react";
import { BarChart3, Calendar, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as echarts from "echarts";

const timeRanges = ["今日", "本周", "本月", "本季度", "本年", "自定义"];

const taskExecutionData = {
  xAxis: ["4/15", "4/16", "4/17", "4/18", "4/19", "4/20", "4/21"],
  series: [
    { name: "已完成", data: [12, 15, 8, 20, 18, 10, 6], color: "#10B981" },
    { name: "失败", data: [2, 1, 3, 0, 1, 2, 0], color: "#EF4444" },
    { name: "待执行", data: [5, 3, 8, 4, 6, 3, 4], color: "#F59E0B" },
  ],
};

const successRateData = [
  { value: 78, name: "成功", itemStyle: { color: "#10B981" } },
  { value: 12, name: "失败", itemStyle: { color: "#EF4444" } },
  { value: 8, name: "待执行", itemStyle: { color: "#F59E0B" } },
  { value: 2, name: "已取消", itemStyle: { color: "#94A3B8" } },
];

const durationData = {
  categories: ["随机抽样", "分层抽样", "系统抽样", "聚类抽样", "多阶段抽样"],
  data: [
    { name: "最小值", data: [5, 8, 3, 12, 20], color: "#3B82F6" },
    { name: "平均值", data: [15, 22, 10, 30, 45], color: "#8B5CF6" },
    { name: "最大值", data: [30, 45, 20, 55, 80], color: "#EC4899" },
  ],
};

const volumeData = {
  xAxis: ["4/15", "4/16", "4/17", "4/18", "4/19", "4/20", "4/21"],
  data: [120, 180, 95, 220, 195, 145, 85],
};

export default function ReportCenter() {
  const [activeTab, setActiveTab] = useState<"sampling" | "privacy">("sampling");
  const [timeRange, setTimeRange] = useState("本周");
  const chartRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    const charts: echarts.ECharts[] = [];

    if (chartRefs[0].current) {
      const c = echarts.init(chartRefs[0].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: taskExecutionData.series.map((s) => s.name), bottom: 0 },
        grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: taskExecutionData.xAxis },
        yAxis: { type: "value" },
        series: taskExecutionData.series.map((s) => ({ name: s.name, type: "bar", data: s.data, itemStyle: { color: s.color }, stack: "total" })),
      });
      charts.push(c);
    }

    if (chartRefs[1].current) {
      const c = echarts.init(chartRefs[1].current);
      c.setOption({
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        series: [{ type: "pie", radius: ["40%", "70%"], avoidLabelOverlap: false, label: { show: true, formatter: "{b}\n{d}%" }, data: successRateData }],
      });
      charts.push(c);
    }

    if (chartRefs[2].current) {
      const c = echarts.init(chartRefs[2].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: durationData.data.map((d) => d.name), bottom: 0 },
        grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: durationData.categories },
        yAxis: { type: "value", name: "分钟" },
        series: durationData.data.map((d) => ({ name: d.name, type: "bar", data: d.data, itemStyle: { color: d.color } })),
      });
      charts.push(c);
    }

    if (chartRefs[3].current) {
      const c = echarts.init(chartRefs[3].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "10%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: volumeData.xAxis },
        yAxis: { type: "value", name: "GB" },
        series: [{ type: "line", data: volumeData.data, smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: "#6366F1" }, lineStyle: { color: "#6366F1" } }],
      });
      charts.push(c);
    }

    const handleResize = () => charts.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); charts.forEach((c) => c.dispose()); };
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button onClick={() => setActiveTab("sampling")} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === "sampling" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>抽样统计报表</button>
          <button onClick={() => setActiveTab("privacy")} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === "privacy" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>隐私计算统计</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {timeRanges.map((r) => <button key={r} onClick={() => setTimeRange(r)} className={"px-3 py-1.5 rounded-md text-xs font-medium transition-colors " + (timeRange === r ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>{r}</button>)}
          </div>
          <Button variant="outline" size="sm" className="gap-1"><Download className="w-3.5 h-3.5" />导出</Button>
        </div>
      </div>

      {activeTab === "sampling" && <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">任务执行统计</h3><Badge variant="outline" className="text-xs">按天</Badge></div>
          <div ref={chartRefs[0]} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">抽样成功率统计</h3><Badge variant="outline" className="text-xs">总体</Badge></div>
          <div ref={chartRefs[1]} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">抽样耗时统计（分钟）</h3><Badge variant="outline" className="text-xs">按规则类型</Badge></div>
          <div ref={chartRefs[2]} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">数据量统计</h3><Badge variant="outline" className="text-xs">按天</Badge></div>
          <div ref={chartRefs[3]} style={{ height: 280 }} />
        </div>
      </div>}

      {activeTab === "privacy" && <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">任务执行趋势</h3></div>
          <div ref={chartRefs[0]} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">算法使用分布</h3></div>
          <div ref={chartRefs[1]} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">资源利用率</h3></div>
          <div ref={chartRefs[2]} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-slate-700">成功率按算法</h3></div>
          <div ref={chartRefs[3]} style={{ height: 280 }} />
        </div>
      </div>}
    </div>
  );
}
