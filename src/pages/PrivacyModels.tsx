import { useState, useRef, useEffect } from "react";
import { Layers, Plus, Search, Play, Pause, RotateCcw, Eye, GitBranch, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";

interface FLModel { id: string; name: string; version: string; algorithm: string; status: string; accuracy: string; rounds: number; creator: string; updateTime: string; description: string; }

const mockModels: FLModel[] = [
  { id: "MD-001", name: "信用评分模型V3", version: "3.2.1", algorithm: "FedAvg", status: "published", accuracy: "92.5%", rounds: 50, creator: "张三", updateTime: "2026-04-20", description: "基于FedAvg的联合信用评分模型" },
  { id: "MD-002", name: "医疗诊断模型", version: "2.0.0", algorithm: "FedProx", status: "training", accuracy: "-", rounds: 32, creator: "李四", updateTime: "2026-04-21", description: "医疗影像联合诊断模型" },
  { id: "MD-003", name: "推荐系统模型", version: "1.5.3", algorithm: "SCAFFOLD", status: "evaluating", accuracy: "88.2%", rounds: 40, creator: "王五", updateTime: "2026-04-19", description: "联邦推荐算法模型" },
  { id: "MD-004", name: "风控检测模型V2", version: "2.1.0", algorithm: "FedAvg", status: "published", accuracy: "95.1%", rounds: 80, creator: "赵六", updateTime: "2026-04-18", description: "实时风控检测模型" },
  { id: "MD-005", name: "NLP情感分析", version: "1.0.0", algorithm: "FedProx", status: "draft", accuracy: "-", rounds: 0, creator: "钱七", updateTime: "2026-04-21", description: "自然语言处理情感分析模型" },
  { id: "MD-006", name: "图像分类模型", version: "4.0.0", algorithm: "FedAvg", status: "deprecated", accuracy: "85.0%", rounds: 100, creator: "孙八", updateTime: "2026-04-15", description: "图像分类联合训练模型(已下线)" },
  { id: "MD-007", name: "时序预测模型", version: "2.3.0", algorithm: "SCAFFOLD", status: "training", accuracy: "-", rounds: 18, creator: "周九", updateTime: "2026-04-21", description: "时间序列预测联合模型" },
  { id: "MD-008", name: "异常检测模型", version: "1.2.0", algorithm: "FedAvg", status: "published", accuracy: "91.8%", rounds: 60, creator: "吴十", updateTime: "2026-04-17", description: "联合异常检测模型" },
  { id: "MD-009", name: "语音识别模型", version: "3.0.0", algorithm: "FedProx", status: "evaluating", accuracy: "89.5%", rounds: 45, creator: "郑一", updateTime: "2026-04-16", description: "语音隐私计算识别模型" },
  { id: "MD-010", name: "基因分析模型", version: "1.1.0", algorithm: "SCAFFOLD", status: "draft", accuracy: "-", rounds: 0, creator: "冯二", updateTime: "2026-04-21", description: "基因序列隐私分析模型" },
];

const trainingJobs = [
  { id: "TJ-001", model: "医疗诊断模型", round: "32/100", loss: 0.234, accuracy: "87.5%", status: "running", participants: 5 },
  { id: "TJ-002", model: "时序预测模型", round: "18/50", loss: 0.567, accuracy: "82.1%", status: "running", participants: 4 },
  { id: "TJ-003", model: "NLP情感分析", round: "0/80", loss: 0, accuracy: "-", status: "pending", participants: 6 },
];

export default function PrivacyModels() {
  const [activeTab, setActiveTab] = useState<"list" | "training" | "versions">("list");
  const [models] = useState(mockModels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailModel, setDetailModel] = useState<FLModel | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && activeTab === "training") {
      const c = echarts.init(chartRef.current);
      c.setOption({ tooltip: { trigger: "axis" }, legend: { data: ["Loss", "Accuracy"], bottom: 0 }, grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true }, xAxis: { type: "category", data: Array.from({ length: 32 }, (_, i) => `${i + 1}`) }, yAxis: [{ type: "value", name: "Loss" }, { type: "value", name: "Accuracy(%)" }], series: [{ name: "Loss", type: "line", data: Array.from({ length: 32 }, () => +(Math.random() * 0.5 + 0.1).toFixed(3)), smooth: true, itemStyle: { color: "#EF4444" } }, { name: "Accuracy", type: "line", yAxisIndex: 1, data: Array.from({ length: 32 }, (_, i) => +(70 + i * 0.5 + Math.random() * 5).toFixed(1)), smooth: true, itemStyle: { color: "#10B981" } }] });
      return () => c.dispose();
    }
  }, [activeTab]);

  const filtered = models.filter((m) => {
    const ms = m.name.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "all" || m.status === statusFilter;
    return ms && mf;
  });

  const stats = [
    { label: "模型总数", value: models.length, icon: Layers, color: "text-blue-500" },
    { label: "已发布", value: models.filter((m) => m.status === "published").length, icon: CheckCircle, color: "text-emerald-500" },
    { label: "训练中", value: models.filter((m) => m.status === "training").length, icon: Play, color: "text-amber-500" },
    { label: "已下线", value: models.filter((m) => m.status === "deprecated").length, icon: ArrowDownCircle, color: "text-red-500" },
  ];

  const columns = [
    { key: "id", title: "ID", cell: (m: FLModel) => <span className="font-mono text-xs text-slate-500">{m.id}</span> },
    { key: "name", title: "模型名称", cell: (m: FLModel) => <span className="font-medium text-slate-800">{m.name}</span> },
    { key: "version", title: "版本", cell: (m: FLModel) => <Badge variant="outline" className="font-mono text-xs text-gray-500">{m.version}</Badge> },
    { key: "algorithm", title: "聚合算法", cell: (m: FLModel) => <span className="text-xs text-slate-500">{m.algorithm}</span> },
    { key: "status", title: "状态", cell: (m: FLModel) => <StatusTag status={m.status === "published" ? "success" : m.status === "training" ? "warning" : m.status === "evaluating" ? "info" : m.status === "draft" ? "info" : "disabled"} text={m.status === "published" ? "已发布" : m.status === "training" ? "训练中" : m.status === "evaluating" ? "评估中" : m.status === "draft" ? "草稿" : "已下线"} /> },
    { key: "accuracy", title: "准确率", cell: (m: FLModel) => <span className="text-sm font-medium text-slate-700">{m.accuracy}</span> },
    { key: "rounds", title: "训练轮数", cell: (m: FLModel) => <span className="text-xs text-slate-500">{m.rounds}</span> },
    { key: "actions", title: "操作", cell: (m: FLModel) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setDetailModel(m); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Eye className="w-3.5 h-3.5" /></button>
        {m.status === "published" && <button className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><ArrowDownCircle className="w-3.5 h-3.5" /></button>}
        {m.status === "draft" && <button className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-500"><Play className="w-3.5 h-3.5" /></button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"list",l:"模型列表"},{k:"training",l:"训练监控"},{k:"versions",l:"版本管理"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "list" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索模型" className="pl-9 w-64" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option value="all">全部</option><option value="published">已发布</option><option value="training">训练中</option><option value="evaluating">评估中</option><option value="draft">草稿</option><option value="deprecated">已下线</option></select>
          </div>
          <Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />新建模型</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>
      </div>}

      {activeTab === "training" && <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">训练Loss与Accuracy曲线</h3><div ref={chartRef} style={{ height: 300 }} /></div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b"><h3 className="text-sm font-semibold text-slate-700">训练任务</h3></div>
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">任务ID</th><th className="text-left py-3 px-4 text-slate-500 font-medium">模型</th><th className="text-left py-3 px-4 text-slate-500 font-medium">进度</th><th className="text-left py-3 px-4 text-slate-500 font-medium">Loss</th><th className="text-left py-3 px-4 text-slate-500 font-medium">准确率</th><th className="text-left py-3 px-4 text-slate-500 font-medium">参与方</th><th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{trainingJobs.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50"><td className="py-3 px-4 font-mono text-xs text-slate-500">{j.id}</td><td className="py-3 px-4 font-medium text-slate-800">{j.model}</td><td className="py-3 px-4"><div className="w-24 h-2 bg-slate-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${parseInt(j.round) / 100 * 100}%` }} /></div><div className="text-xs text-slate-500 mt-1">{j.round}</div></td><td className="py-3 px-4 text-xs">{j.loss || "-"}</td><td className="py-3 px-4 text-xs">{j.accuracy}</td><td className="py-3 px-4 text-xs">{j.participants}</td><td className="py-3 px-4"><StatusTag status={j.status === "running" ? "warning" : "info"} text={j.status === "running" ? "训练中" : "待执行"} /></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {activeTab === "versions" && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">模型</th><th className="text-left py-3 px-4 text-slate-500 font-medium">版本</th><th className="text-left py-3 px-4 text-slate-500 font-medium">变更说明</th><th className="text-left py-3 px-4 text-slate-500 font-medium">准确率</th><th className="text-left py-3 px-4 text-slate-500 font-medium">发布时间</th><th className="text-left py-3 px-4 text-slate-500 font-medium">操作</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {[{m:"信用评分模型",v:"3.2.1",c:"优化特征工程",a:"92.5%",t:"2026-04-20"},{m:"信用评分模型",v:"3.1.0",c:"增加新的特征",a:"91.2%",t:"2026-04-10"},{m:"信用评分模型",v:"3.0.0",c:"重大架构升级",a:"90.1%",t:"2026-03-25"},{m:"风控检测模型",v:"2.1.0",c:"引入注意力机制",a:"95.1%",t:"2026-04-18"},{m:"风控检测模型",v:"2.0.0",c:"模型重构",a:"93.8%",t:"2026-04-01"}].map((v, i) => (
              <tr key={i} className="hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{v.m}</td><td className="py-3 px-4"><Badge variant="outline" className="font-mono text-xs text-gray-500">{v.v}</Badge></td><td className="py-3 px-4 text-xs text-slate-500">{v.c}</td><td className="py-3 px-4 text-sm font-medium">{v.a}</td><td className="py-3 px-4 text-xs text-slate-500">{v.t}</td><td className="py-3 px-4"><button className="text-xs text-primary-500 hover:underline">对比</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>}

      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建模型" size="lg">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-slate-700">模型名称</label><Input placeholder="输入模型名称" className="mt-1" /></div>
          <div><label className="text-sm font-medium text-slate-700">算法类型</label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {["FedAvg", "FedProx", "SCAFFOLD"].map((a) => <div key={a} className="p-3 rounded-lg border-2 border-slate-200 hover:border-primary-500 cursor-pointer text-center"><div className="font-semibold">{a}</div></div>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">学习率</label><Input placeholder="0.01" className="mt-1" /></div><div><label className="text-sm font-medium text-slate-700">批次大小</label><Input placeholder="32" className="mt-1" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">训练轮数</label><Input placeholder="100" className="mt-1" /></div><div><label className="text-sm font-medium text-slate-700">聚合策略</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>FedAvg</option><option>FedProx</option><option>SCAFFOLD</option></select></div></div>
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>创建</Button></div>
        </div>
      </Drawer>

      <Drawer open={showDetail} onClose={() => setShowDetail(false)} title={detailModel?.name || "模型详情"} size="lg">
        {detailModel && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">ID</div><div className="font-mono text-sm">{detailModel.id}</div></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">版本</div><div className="font-mono text-sm">{detailModel.version}</div></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">聚合算法</div><div className="text-sm">{detailModel.algorithm}</div></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">准确率</div><div className="text-sm font-medium">{detailModel.accuracy}</div></div>
          </div>
          <div><h4 className="text-sm font-semibold text-slate-700 mb-1">描述</h4><p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{detailModel.description}</p></div>
        </div>}
      </Drawer>
    </div>
  );
}
