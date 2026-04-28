import { useState, useRef, useEffect } from "react";
import {
  Scale, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight,
  Users, Vote, FileText, Settings, ShieldCheck, Activity, Gavel, X,
  Sparkles, BarChart3, TrendingUp, PieChart, History, Copy, UserCheck,
  Play, Check, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as echarts from "echarts";

/* ─── Types ─── */
interface Proposal {
  id: string;
  title: string;
  type: string;
  status: "voting" | "passed" | "rejected" | "executed";
  proposer: string;
  votes: { for: number; against: number; abstain: number };
  threshold: string;
  createTime: string;
  deadline: string;
  desc: string;
  paramChanges?: string;
  executedAt?: string;
  executionResult?: string;
}

interface VoteRecord {
  id: string;
  proposalId: string;
  voter: string;
  choice: "for" | "against" | "abstain";
  weight: number;
  reason: string;
  time: string;
}

interface DelegateRecord {
  id: string;
  from: string;
  to: string;
  weight: number;
  time: string;
}

interface ProposalTemplate {
  id: string;
  name: string;
  type: string;
  desc: string;
  paramChanges: string;
}

/* ─── Mock Data ─── */
const initialProposals: Proposal[] = [
  { id: "GP-001", title: "增加金融联盟链共识节点", type: "成员变更", status: "voting", proposer: "中国银行", votes: { for: 3, against: 1, abstain: 0 }, threshold: "3/5", createTime: "2025-04-20", deadline: "2025-04-27", desc: "proposal to add 2 new consensus nodes to improve network throughput", paramChanges: "共识节点数量: 5 → 7" },
  { id: "GP-002", title: "修改政务数据链出块间隔", type: "参数变更", status: "passed", proposer: "市大数据局", votes: { for: 4, against: 0, abstain: 0 }, threshold: "3/4", createTime: "2025-04-15", deadline: "2025-04-22", desc: "将出块间隔从3秒调整为2秒，提升交易处理效率", paramChanges: "出块间隔: 3s → 2s" },
  { id: "GP-003", title: "医疗数据链准入新组织", type: "成员变更", status: "rejected", proposer: "市卫健委", votes: { for: 1, against: 2, abstain: 1 }, threshold: "2/3", createTime: "2025-04-10", deadline: "2025-04-17", desc: "接纳某私立医院加入医疗数据共享联盟链", paramChanges: "新增成员: 某某私立医院" },
  { id: "GP-004", title: "升级存证公证链合约版本", type: "合约升级", status: "voting", proposer: "公证处", votes: { for: 2, against: 0, abstain: 1 }, threshold: "3/4", createTime: "2025-04-22", deadline: "2025-04-29", desc: "将存证合约升级至v2.0，支持批量存证功能", paramChanges: "合约版本: v1.5 → v2.0" },
  { id: "GP-005", title: "调整跨链桥手续费", type: "参数变更", status: "executed", proposer: "联盟管理员", votes: { for: 5, against: 0, abstain: 0 }, threshold: "3/5", createTime: "2025-04-01", deadline: "2025-04-08", desc: "将跨链资产转移手续费从0.1%调整为0.05%", paramChanges: "手续费率: 0.1% → 0.05%", executedAt: "2025-04-09", executionResult: "执行成功，新费率已生效" },
];

const initialVotes: VoteRecord[] = [
  { id: "V-001", proposalId: "GP-001", voter: "中国银行", choice: "for", weight: 15, reason: "有助于提升网络吞吐量", time: "2025-04-21 10:00" },
  { id: "V-002", proposalId: "GP-001", voter: "工商银行", choice: "for", weight: 12, reason: "支持扩展", time: "2025-04-21 11:00" },
  { id: "V-003", proposalId: "GP-001", voter: "建设银行", choice: "for", weight: 10, reason: "同意", time: "2025-04-21 14:00" },
  { id: "V-004", proposalId: "GP-001", voter: "农业银行", choice: "against", weight: 8, reason: "成本考虑", time: "2025-04-22 09:00" },
  { id: "V-005", proposalId: "GP-002", voter: "市大数据局", choice: "for", weight: 20, reason: "提升效率", time: "2025-04-16 10:00" },
];

const initialDelegates: DelegateRecord[] = [
  { id: "D-001", from: "招商银行", to: "中国银行", weight: 10, time: "2025-04-01 09:00" },
  { id: "D-002", from: "交通银行", to: "工商银行", weight: 8, time: "2025-04-05 14:00" },
];

const proposalTemplates: ProposalTemplate[] = [
  { id: "T-001", name: "共识节点扩容", type: "成员变更", desc: "增加联盟链共识节点数量以提升网络性能", paramChanges: "共识节点数量: X → Y" },
  { id: "T-002", name: "出块间隔调整", type: "参数变更", desc: "调整区块链出块间隔以优化交易确认时间", paramChanges: "出块间隔: Xs → Ys" },
  { id: "T-003", name: "智能合约升级", type: "合约升级", desc: "升级智能合约至新版本以支持新功能", paramChanges: "合约版本: vX → vY" },
  { id: "T-004", name: "新成员准入", type: "成员变更", desc: "批准新组织加入联盟链网络", paramChanges: "新增成员: [组织名称]" },
  { id: "T-005", name: "手续费调整", type: "参数变更", desc: "调整跨链或链上交易手续费率", paramChanges: "手续费率: X% → Y%" },
  { id: "T-006", name: "资金分配方案", type: "资金分配", desc: "制定联盟链运营资金分配计划", paramChanges: "分配金额: [金额] 至 [用途]" },
];

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    voting: { text: "投票中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    passed: { text: "已通过", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected: { text: "已驳回", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    executed: { text: "已执行", class: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  };
  const c = config[status] || config.voting;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

/* ─── ECharts Components ─── */
function ParticipationPieChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      series: [{
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data: [
          { value: 12, name: "积极参与", itemStyle: { color: "#10b981" } },
          { value: 5, name: "偶尔参与", itemStyle: { color: "#3b82f6" } },
          { value: 3, name: "很少参与", itemStyle: { color: "#f59e0b" } },
          { value: 2, name: "从未参与", itemStyle: { color: "#ef4444" } },
        ],
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: 240 }} />;
}

function VoteTrendChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["赞成", "反对", "弃权"], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { top: 16, right: 16, bottom: 40, left: 48 },
      xAxis: { type: "category", data: ["1月", "2月", "3月", "4月", "5月"], axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", name: "票数", axisLabel: { fontSize: 11 } },
      series: [
        { name: "赞成", type: "line", data: [8, 12, 10, 15, 11], smooth: true, itemStyle: { color: "#10b981" }, areaStyle: { opacity: 0.1 } },
        { name: "反对", type: "line", data: [2, 3, 4, 2, 3], smooth: true, itemStyle: { color: "#ef4444" }, areaStyle: { opacity: 0.1 } },
        { name: "弃权", type: "line", data: [1, 2, 1, 3, 2], smooth: true, itemStyle: { color: "#6b7280" }, areaStyle: { opacity: 0.1 } },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: 240 }} />;
}

function SuccessRateChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis", formatter: (params: any) => `${params[0].axisValue}<br/>成功率: ${params[0].value}%` },
      grid: { top: 16, right: 16, bottom: 32, left: 48 },
      xAxis: { type: "category", data: ["2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2"], axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%", fontSize: 11 } },
      series: [{
        type: "bar",
        data: [75, 80, 85, 78],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#3b82f6" },
            { offset: 1, color: "#1d4ed8" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: "40%",
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: 240 }} />;
}

/* ─── Main Component ─── */
export default function GovernanceChain() {
  const [search, setSearch] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [votes, setVotes] = useState<VoteRecord[]>(initialVotes);
  const [delegates, setDelegates] = useState<DelegateRecord[]>(initialDelegates);
  const [detailProp, setDetailProp] = useState<Proposal | null>(null);

  // Proposal creation
  const [createOpen, setCreateOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: "", type: "", desc: "", paramChanges: "" });

  // Voting dialog
  const [voteOpen, setVoteOpen] = useState(false);
  const [voteChoice, setVoteChoice] = useState<"for" | "against" | "abstain">("for");
  const [voteReason, setVoteReason] = useState("");
  const [votingPropId, setVotingPropId] = useState<string | null>(null);

  // Delegation dialog
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [delegateTo, setDelegateTo] = useState("");
  const [delegateWeight, setDelegateWeight] = useState(10);

  // Execution result
  const [execResult, setExecResult] = useState<{ open: boolean; result: string }>({ open: false, result: "" });

  // Template dialog
  const [templateOpen, setTemplateOpen] = useState(false);

  const filtered = proposals.filter(p => p.title.includes(search) || p.type.includes(search));

  const handleCreate = () => {
    const prop: Proposal = {
      id: `GP-${Date.now().toString(36).toUpperCase()}`,
      title: newProposal.title,
      type: newProposal.type,
      status: "voting",
      proposer: "当前用户",
      votes: { for: 0, against: 0, abstain: 0 },
      threshold: "3/5",
      createTime: new Date().toISOString().slice(0, 10),
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      desc: newProposal.desc,
      paramChanges: newProposal.paramChanges,
    };
    setProposals([prop, ...proposals]);
    setNewProposal({ title: "", type: "", desc: "", paramChanges: "" });
    setCreateOpen(false);
  };

  const openVote = (propId: string) => {
    setVotingPropId(propId);
    setVoteChoice("for");
    setVoteReason("");
    setVoteOpen(true);
  };

  const handleVote = () => {
    if (!votingPropId) return;
    const weight = Math.floor(Math.random() * 15) + 5;
    const newVote: VoteRecord = {
      id: `V-${Date.now().toString(36).toUpperCase()}`,
      proposalId: votingPropId,
      voter: "当前用户",
      choice: voteChoice,
      weight,
      reason: voteReason,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
    };
    setVotes([newVote, ...votes]);
    setProposals(prev => prev.map(p => {
      if (p.id !== votingPropId) return p;
      const updated = { ...p, votes: { ...p.votes } };
      if (voteChoice === "for") updated.votes.for += 1;
      else if (voteChoice === "against") updated.votes.against += 1;
      else updated.votes.abstain += 1;
      return updated;
    }));
    setVoteOpen(false);
    setVotingPropId(null);
  };

  const handleDelegate = () => {
    const newDelegate: DelegateRecord = {
      id: `D-${Date.now().toString(36).toUpperCase()}`,
      from: "当前用户",
      to: delegateTo,
      weight: delegateWeight,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
    };
    setDelegates([newDelegate, ...delegates]);
    setDelegateTo("");
    setDelegateWeight(10);
    setDelegateOpen(false);
  };

  const handleExecute = (prop: Proposal) => {
    const total = prop.votes.for + prop.votes.against + prop.votes.abstain;
    const [required] = prop.threshold.split("/").map(Number);
    if (prop.votes.for >= required) {
      setProposals(prev => prev.map(p => p.id === prop.id ? { ...p, status: "executed" as const, executedAt: new Date().toISOString().slice(0, 10), executionResult: "执行成功，参数变更已生效" } : p));
      setExecResult({ open: true, result: `提案 ${prop.id} 执行成功！${prop.paramChanges || ""} 已生效。` });
    } else {
      setExecResult({ open: true, result: `提案 ${prop.id} 未达到执行阈值，无法执行。` });
    }
    setDetailProp(null);
  };

  const useTemplate = (template: ProposalTemplate) => {
    setNewProposal({
      title: template.name,
      type: template.type,
      desc: template.desc,
      paramChanges: template.paramChanges,
    });
    setTemplateOpen(false);
    setCreateOpen(true);
  };

  const canExecute = (prop: Proposal) => {
    if (prop.status !== "passed") return false;
    const [required] = prop.threshold.split("/").map(Number);
    return prop.votes.for >= required;
  };

  const propVotes = (propId: string) => votes.filter(v => v.proposalId === propId);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">治理链</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">链上治理提案管理，支持投票表决与参数升级</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setTemplateOpen(true)}>
            <Copy className="w-4 h-4" /> 模板库
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setDelegateOpen(true)}>
            <UserCheck className="w-4 h-4" /> 委托投票
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> 发起提案
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "提案总数", value: proposals.length, icon: <Scale className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已通过", value: proposals.filter(p => p.status === "passed" || p.status === "executed").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "投票中", value: proposals.filter(p => p.status === "voting").length, icon: <Vote className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "已驳回", value: proposals.filter(p => p.status === "rejected").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="proposals" className="w-full">
        <TabsList>
          <TabsTrigger value="proposals" className="gap-1"><FileText className="w-4 h-4" /> 提案列表</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1"><BarChart3 className="w-4 h-4" /> 治理统计</TabsTrigger>
          <TabsTrigger value="votes" className="gap-1"><History className="w-4 h-4" /> 投票记录</TabsTrigger>
          <TabsTrigger value="delegates" className="gap-1"><UserCheck className="w-4 h-4" /> 委托记录</TabsTrigger>
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="搜索提案/类型" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["提案ID", "标题", "类型", "发起人", "状态", "赞成", "反对", "弃权", "阈值", "截止时间", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(prop => (
                  <tr key={prop.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{prop.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{prop.title}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{prop.type}</Badge></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.proposer}</td>
                    <td className="px-4 py-3"><StatusBadge status={prop.status} /></td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{prop.votes.for}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{prop.votes.against}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.votes.abstain}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.threshold}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.deadline}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {prop.status === "voting" && (
                          <Button size="sm" variant="ghost" onClick={() => openVote(prop.id)} title="投票">
                            <Vote className="w-4 h-4 text-blue-500" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setDetailProp(prop)} title="详情">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-500" /> 参与分布</CardTitle>
              </CardHeader>
              <CardContent><ParticipationPieChart /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> 投票趋势</CardTitle>
              </CardHeader>
              <CardContent><VoteTrendChart /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> 历史成功率</CardTitle>
              </CardHeader>
              <CardContent><SuccessRateChart /></CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "总投票数", value: votes.length, icon: <Vote className="w-5 h-5 text-blue-500" /> },
              { label: "参与率", value: "78%", icon: <Users className="w-5 h-5 text-emerald-500" /> },
              { label: "平均投票权重", value: "11.2", icon: <Scale className="w-5 h-5 text-indigo-500" /> },
              { label: "活跃委托", value: delegates.length, icon: <UserCheck className="w-5 h-5 text-violet-500" /> },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  {s.icon}
                  <div>
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Votes Tab */}
        <TabsContent value="votes" className="mt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-[#273548]">
                  {["投票ID", "提案", "投票人", "选择", "权重", "理由", "时间"].map(h => (
                    <TableHead key={h} className="text-xs font-semibold text-slate-600 dark:text-slate-400">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {votes.map(v => (
                  <TableRow key={v.id} className="border-t border-slate-100 dark:border-slate-700">
                    <TableCell className="font-mono text-xs text-slate-500">{v.id}</TableCell>
                    <TableCell className="text-sm">{proposals.find(p => p.id === v.proposalId)?.title || v.proposalId}</TableCell>
                    <TableCell className="text-sm">{v.voter}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        v.choice === "for" ? "text-emerald-600 border-emerald-200" :
                        v.choice === "against" ? "text-red-600 border-red-200" :
                        "text-slate-600 border-slate-200"
                      )}>
                        {v.choice === "for" ? "赞成" : v.choice === "against" ? "反对" : "弃权"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{v.weight}</TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{v.reason}</TableCell>
                    <TableCell className="text-xs text-slate-500">{v.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Delegates Tab */}
        <TabsContent value="delegates" className="mt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-[#273548]">
                  {["委托ID", "委托人", "受托人", "权重", "时间"].map(h => (
                    <TableHead key={h} className="text-xs font-semibold text-slate-600 dark:text-slate-400">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegates.map(d => (
                  <TableRow key={d.id} className="border-t border-slate-100 dark:border-slate-700">
                    <TableCell className="font-mono text-xs text-slate-500">{d.id}</TableCell>
                    <TableCell className="text-sm">{d.from}</TableCell>
                    <TableCell className="text-sm">{d.to}</TableCell>
                    <TableCell className="font-medium">{d.weight}</TableCell>
                    <TableCell className="text-xs text-slate-500">{d.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Proposal Detail Dialog */}
      <Dialog open={!!detailProp} onOpenChange={() => setDetailProp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-500" />提案详情 - {detailProp?.title}</DialogTitle>
          </DialogHeader>
          {detailProp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "提案ID", value: detailProp.id },
                  { label: "标题", value: detailProp.title },
                  { label: "类型", value: detailProp.type },
                  { label: "发起人", value: detailProp.proposer },
                  { label: "状态", value: <StatusBadge status={detailProp.status} /> },
                  { label: "阈值", value: detailProp.threshold },
                  { label: "创建时间", value: detailProp.createTime },
                  { label: "截止时间", value: detailProp.deadline },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-2">描述</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{detailProp.desc}</p>
              </div>
              {detailProp.paramChanges && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-2">参数变更</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{detailProp.paramChanges}</p>
                </div>
              )}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-2">投票情况</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-emerald-600">赞成 {detailProp.votes.for}</span></div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(detailProp.votes.for / Math.max(1, detailProp.votes.for + detailProp.votes.against + detailProp.votes.abstain)) * 100}%` }} /></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-red-600">反对 {detailProp.votes.against}</span></div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-red-500" style={{ width: `${(detailProp.votes.against / Math.max(1, detailProp.votes.for + detailProp.votes.against + detailProp.votes.abstain)) * 100}%` }} /></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">弃权 {detailProp.votes.abstain}</span></div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-slate-400" style={{ width: `${(detailProp.votes.abstain / Math.max(1, detailProp.votes.for + detailProp.votes.against + detailProp.votes.abstain)) * 100}%` }} /></div>
                  </div>
                </div>
              </div>
              {/* Vote Records for this proposal */}
              {propVotes(detailProp.id).length > 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-2">投票记录</div>
                  <div className="space-y-2">
                    {propVotes(detailProp.id).map(v => (
                      <div key={v.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            v.choice === "for" ? "text-emerald-600 border-emerald-200" :
                            v.choice === "against" ? "text-red-600 border-red-200" :
                            "text-slate-600 border-slate-200"
                          )}>
                            {v.choice === "for" ? "赞成" : v.choice === "against" ? "反对" : "弃权"}
                          </Badge>
                          <span>{v.voter}</span>
                          <span className="text-xs text-slate-500">权重: {v.weight}</span>
                        </div>
                        <span className="text-xs text-slate-500">{v.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailProp.executedAt && (
                <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">执行结果</div>
                  <p className="text-sm text-purple-600 dark:text-purple-300">{detailProp.executionResult}</p>
                  <p className="text-xs text-purple-500 mt-1">执行时间: {detailProp.executedAt}</p>
                </div>
              )}
              <div className="flex gap-2">
                {detailProp.status === "voting" && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => openVote(detailProp.id)}>
                      <CheckCircle2 className="w-4 h-4" /> 投票
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setDetailProp(null)}>
                      <X className="w-4 h-4" /> 关闭
                    </Button>
                  </>
                )}
                {canExecute(detailProp) && (
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2" onClick={() => handleExecute(detailProp)}>
                    <Play className="w-4 h-4" /> 执行提案
                  </Button>
                )}
                {detailProp.status === "passed" && !canExecute(detailProp) && (
                  <Button disabled className="gap-2" variant="outline">
                    <AlertTriangle className="w-4 h-4" /> 未达执行阈值
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Proposal Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-500" />发起新提案</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">提案标题 <span className="text-red-500">*</span></label>
              <Input value={newProposal.title} onChange={e => setNewProposal({ ...newProposal, title: e.target.value })} placeholder="输入提案标题" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">提案类型 <span className="text-red-500">*</span></label>
              <Select value={newProposal.type} onValueChange={v => setNewProposal({ ...newProposal, type: v })}>
                <SelectTrigger><SelectValue placeholder="选择提案类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="参数变更">参数变更</SelectItem>
                  <SelectItem value="合约升级">合约升级</SelectItem>
                  <SelectItem value="成员变更">成员变更</SelectItem>
                  <SelectItem value="资金分配">资金分配</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述 <span className="text-red-500">*</span></label>
              <Textarea value={newProposal.desc} onChange={e => setNewProposal({ ...newProposal, desc: e.target.value })} placeholder="输入提案描述" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">参数变更</label>
              <Textarea value={newProposal.paramChanges} onChange={e => setNewProposal({ ...newProposal, paramChanges: e.target.value })} placeholder="例如：出块间隔: 3s → 2s" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreate} disabled={!newProposal.title || !newProposal.type || !newProposal.desc}>
              创建提案
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voting Dialog */}
      <Dialog open={voteOpen} onOpenChange={setVoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Vote className="w-5 h-5 text-blue-500" />投票</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">投票选择</label>
              <div className="flex gap-2">
                {(["for", "against", "abstain"] as const).map(choice => (
                  <Button
                    key={choice}
                    type="button"
                    variant={voteChoice === choice ? "default" : "outline"}
                    className={cn("flex-1 gap-1", voteChoice === choice && choice === "for" && "bg-emerald-600 hover:bg-emerald-700", voteChoice === choice && choice === "against" && "bg-red-600 hover:bg-red-700")}
                    onClick={() => setVoteChoice(choice)}
                  >
                    {choice === "for" && <CheckCircle2 className="w-4 h-4" />}
                    {choice === "against" && <XCircle className="w-4 h-4" />}
                    {choice === "abstain" && <Clock className="w-4 h-4" />}
                    {choice === "for" ? "赞成" : choice === "against" ? "反对" : "弃权"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">投票理由</label>
              <Textarea value={voteReason} onChange={e => setVoteReason(e.target.value)} placeholder="输入投票理由（可选）" />
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
              <div className="text-xs text-slate-500">预估投票权重</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{Math.floor(Math.random() * 15) + 5}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleVote}>提交投票</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog open={delegateOpen} onOpenChange={setDelegateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-violet-500" />委托投票</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">受托地址 <span className="text-red-500">*</span></label>
              <Input value={delegateTo} onChange={e => setDelegateTo(e.target.value)} placeholder="输入受托人地址或名称" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">委托权重</label>
              <Input type="number" value={delegateWeight} onChange={e => setDelegateWeight(Number(e.target.value))} min={1} max={100} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelegateOpen(false)}>取消</Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleDelegate} disabled={!delegateTo}>
              确认委托
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Copy className="w-5 h-5 text-indigo-500" />提案模板库</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {proposalTemplates.map(t => (
              <div key={t.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => useTemplate(t)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.name}</span>
                  <Badge variant="outline">{t.type}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.desc}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{t.paramChanges}</p>
                <Button size="sm" variant="ghost" className="mt-2 w-full gap-1" onClick={(e) => { e.stopPropagation(); useTemplate(t); }}>
                  <Plus className="w-3 h-3" /> 快速创建
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Execution Result Dialog */}
      <Dialog open={execResult.open} onOpenChange={() => setExecResult({ open: false, result: "" })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {execResult.result.includes("成功") ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
              执行结果
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">{execResult.result}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setExecResult({ open: false, result: "" })}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
