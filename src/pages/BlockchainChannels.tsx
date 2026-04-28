import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import {
  Layers, Plus, Search, Lock, Unlock, Users, Activity,
  CheckCircle2, XCircle, ChevronRight, Settings, RefreshCw,
  FileCode, Database, X, Eye, Pencil, Trash, UserPlus, UserMinus,
  Server, ShieldCheck, Box, Blocks, GitBranch, Copy, Check, AlertTriangle,
  ArrowLeft, ArrowRight, Clock, Hash, FileText, Monitor
} from "lucide-react";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ─── Types ─── */
interface Channel {
  id: string;
  name: string;
  network: string;
  orgs: string[];
  status: string;
  txCount: number;
  chaincodes: number;
  createTime: string;
  policy: string;
  privacy: string;
}

interface ChannelMember {
  org: string;
  role: "member" | "admin" | "observer";
  joinedAt: string;
  anchorPeers: string[];
}

interface PrivateCollection {
  id: string;
  name: string;
  members: string[];
  blockToLive: number;
  stateCacheSize: number;
  distributionStatus: Record<string, string>;
}

interface BlockData {
  id: string;
  number: number;
  txCount: number;
  timestamp: string;
  hash: string;
  dataHash: string;
  prevHash: string;
  txs: TxData[];
}

interface TxData {
  id: string;
  type: string;
  creator: string;
  timestamp: string;
  channel: string;
  validationCode: string;
}

type PolicyNode =
  | { type: "AND"; children: PolicyNode[] }
  | { type: "OR"; children: PolicyNode[] }
  | { type: "OutOf"; n: number; children: PolicyNode[] }
  | { type: "Signature"; org: string };

/* ─── Mock Data ─── */
const initialChannels: Channel[] = [
  { id: "CH-001", name: "金融交易通道", network: "金融联盟链", orgs: ["中国银行", "工商银行", "建设银行"], status: "active", txCount: 452310, chaincodes: 4, createTime: "2024-06-20", policy: "3/3签名", privacy: "private" },
  { id: "CH-002", name: "政务数据共享通道", network: "政务数据链", orgs: ["市大数据局", "市公安局", "市卫健委", "市人社局"], status: "active", txCount: 128560, chaincodes: 2, createTime: "2024-08-25", policy: "2/4签名", privacy: "private" },
  { id: "CH-003", name: "供应链金融通道", network: "供应链金融链", orgs: ["核心企业", "供应商A", "供应商B"], status: "inactive", txCount: 34520, chaincodes: 1, createTime: "2024-10-15", policy: "2/3签名", privacy: "public" },
  { id: "CH-004", name: "医疗数据通道", network: "医疗数据链", orgs: ["三甲医院", "疾控中心", "医保局"], status: "active", txCount: 89230, chaincodes: 3, createTime: "2024-11-10", policy: "2/3签名", privacy: "private" },
  { id: "CH-005", name: "存证公证通道", network: "存证公证链", orgs: ["公证处", "法院", "仲裁委", "律所"], status: "active", txCount: 567890, chaincodes: 2, createTime: "2024-03-10", policy: "3/4签名", privacy: "public" },
];

const initialMembers: Record<string, ChannelMember[]> = {
  "CH-001": [
    { org: "中国银行", role: "admin", joinedAt: "2024-06-20", anchorPeers: ["peer0.bank-a.com:7051"] },
    { org: "工商银行", role: "member", joinedAt: "2024-06-21", anchorPeers: ["peer0.bank-b.com:7051"] },
    { org: "建设银行", role: "member", joinedAt: "2024-06-22", anchorPeers: ["peer0.bank-c.com:7051"] },
  ],
  "CH-002": [
    { org: "市大数据局", role: "admin", joinedAt: "2024-08-25", anchorPeers: ["peer0.data.gov:7051"] },
    { org: "市公安局", role: "member", joinedAt: "2024-08-26", anchorPeers: ["peer0.police.gov:7051"] },
    { org: "市卫健委", role: "member", joinedAt: "2024-08-27", anchorPeers: ["peer0.health.gov:7051"] },
    { org: "市人社局", role: "observer", joinedAt: "2024-09-01", anchorPeers: [] },
  ],
  "CH-003": [
    { org: "核心企业", role: "admin", joinedAt: "2024-10-15", anchorPeers: ["peer0.core.com:7051"] },
    { org: "供应商A", role: "member", joinedAt: "2024-10-16", anchorPeers: ["peer0.sup-a.com:7051"] },
    { org: "供应商B", role: "member", joinedAt: "2024-10-17", anchorPeers: ["peer0.sup-b.com:7051"] },
  ],
  "CH-004": [
    { org: "三甲医院", role: "admin", joinedAt: "2024-11-10", anchorPeers: ["peer0.hospital.com:7051"] },
    { org: "疾控中心", role: "member", joinedAt: "2024-11-11", anchorPeers: ["peer0.cdc.com:7051"] },
    { org: "医保局", role: "member", joinedAt: "2024-11-12", anchorPeers: ["peer0.insurance.gov:7051"] },
  ],
  "CH-005": [
    { org: "公证处", role: "admin", joinedAt: "2024-03-10", anchorPeers: ["peer0.notary.com:7051"] },
    { org: "法院", role: "member", joinedAt: "2024-03-11", anchorPeers: ["peer0.court.gov:7051"] },
    { org: "仲裁委", role: "member", joinedAt: "2024-03-12", anchorPeers: ["peer0.arb.com:7051"] },
    { org: "律所", role: "observer", joinedAt: "2024-03-15", anchorPeers: [] },
  ],
};

const initialCollections: Record<string, PrivateCollection[]> = {
  "CH-001": [
    { id: "PC-001", name: "交易明细", members: ["中国银行", "工商银行"], blockToLive: 1000000, stateCacheSize: 1000, distributionStatus: { "中国银行": "synced", "工商银行": "synced", "建设银行": "not_member" } },
  ],
  "CH-002": [
    { id: "PC-002", name: "人口数据", members: ["市大数据局", "市公安局", "市卫健委"], blockToLive: 0, stateCacheSize: 500, distributionStatus: { "市大数据局": "synced", "市公安局": "synced", "市卫健委": "syncing", "市人社局": "not_member" } },
  ],
};

function generateMockBlocks(channelId: string): BlockData[] {
  const blocks: BlockData[] = [];
  const baseTime = new Date("2025-01-01T00:00:00Z").getTime();
  for (let i = 0; i < 50; i++) {
    const num = 1000 + i;
    const txCount = Math.floor(Math.random() * 8) + 1;
    const txs: TxData[] = [];
    for (let j = 0; j < txCount; j++) {
      txs.push({
        id: `TX-${channelId}-${num}-${j}`,
        type: ["endorsement", "config", "chaincode"][Math.floor(Math.random() * 3)],
        creator: `Org${Math.floor(Math.random() * 3) + 1}MSP`,
        timestamp: new Date(baseTime + i * 600000 + j * 30000).toISOString(),
        channel: channelId,
        validationCode: Math.random() > 0.1 ? "VALID" : "ENDORSEMENT_POLICY_FAILURE",
      });
    }
    blocks.push({
      id: `BLK-${channelId}-${num}`,
      number: num,
      txCount,
      timestamp: new Date(baseTime + i * 600000).toISOString(),
      hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      dataHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      prevHash: i === 0 ? "0x0".padEnd(66, "0") : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      txs,
    });
  }
  return blocks;
}

const initialBlocks: Record<string, BlockData[]> = {};
initialChannels.forEach(ch => {
  initialBlocks[ch.id] = generateMockBlocks(ch.id);
});

const allOrgs = ["中国银行", "工商银行", "建设银行", "市大数据局", "市公安局", "市卫健委", "市人社局", "核心企业", "供应商A", "供应商B", "三甲医院", "疾控中心", "医保局", "公证处", "法院", "仲裁委", "律所", "招商银行", "支付宝", "腾讯云"];

/* ─── Helpers ─── */
function StatusBadge({ status, privacy }: { status: string; privacy: string }) {
  const config: Record<string, { text: string; class: string }> = {
    active: { text: "已激活", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    inactive: { text: "未激活", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    pending: { text: "配置中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.inactive;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>
      {privacy === "private" ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      {c.text}
    </span>
  );
}

function generateId(channels: Channel[]): string {
  const maxNum = channels.reduce((max, ch) => {
    const match = ch.id.match(/CH-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `CH-${String(maxNum + 1).padStart(3, "0")}`;
}

function policyToString(node: PolicyNode): string {
  switch (node.type) {
    case "AND": return `AND(${node.children.map(policyToString).join(", ")})`;
    case "OR": return `OR(${node.children.map(policyToString).join(", ")})`;
    case "OutOf": return `OutOf(${node.n}, ${node.children.map(policyToString).join(", ")})`;
    case "Signature": return `'${node.org}'`;
  }
}

function validatePolicy(node: PolicyNode): string | null {
  switch (node.type) {
    case "AND":
    case "OR":
      if (node.children.length < 2) return `${node.type} 规则至少需要2个子条件`;
      for (const child of node.children) {
        const err = validatePolicy(child);
        if (err) return err;
      }
      return null;
    case "OutOf":
      if (node.n < 1) return "OutOf n 必须 >= 1";
      if (node.children.length < node.n) return `OutOf 子条件数(${node.children.length})不能少于 n(${node.n})`;
      for (const child of node.children) {
        const err = validatePolicy(child);
        if (err) return err;
      }
      return null;
    case "Signature":
      if (!node.org.trim()) return "组织名不能为空";
      return null;
  }
}

/* ─── Fields ─── */
const channelFields: FieldConfig[] = [
  { key: "name", label: "通道名称", type: "text", required: true },
  { key: "network", label: "所属网络", type: "text", required: true },
  { key: "orgs", label: "参与组织", type: "textarea", required: true, placeholder: "多个组织用逗号分隔" },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已激活", value: "active" },
    { label: "未激活", value: "inactive" },
    { label: "配置中", value: "pending" },
  ]},
  { key: "txCount", label: "交易数", type: "number", required: true },
  { key: "chaincodes", label: "合约数", type: "number", required: true },
  { key: "createTime", label: "创建时间", type: "text", required: true },
  { key: "policy", label: "背书策略", type: "text", required: true },
  { key: "privacy", label: "隐私类型", type: "select", required: true, options: [
    { label: "私有通道", value: "private" },
    { label: "公共通道", value: "public" },
  ]},
];

const detailFields = [
  { key: "id", label: "通道ID" },
  { key: "name", label: "通道名称" },
  { key: "network", label: "所属网络" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "privacy", label: "隐私类型", type: "badge" as const },
  { key: "policy", label: "背书策略" },
  { key: "txCount", label: "交易总数" },
  { key: "chaincodes", label: "合约数量" },
  { key: "createTime", label: "创建时间", type: "date" as const },
  { key: "orgs", label: "参与组织", type: "list" as const },
];

/* ─── Policy Editor Component ─── */
function PolicyEditor({ node, onChange, orgs, depth = 0 }: { node: PolicyNode; onChange: (n: PolicyNode) => void; orgs: string[]; depth?: number }) {
  const addChild = (type: PolicyNode["type"]) => {
    if (node.type === "Signature") return;
    let newChild: PolicyNode;
    if (type === "Signature") newChild = { type: "Signature", org: orgs[0] || "" };
    else if (type === "OutOf") newChild = { type: "OutOf", n: 1, children: [] };
    else newChild = { type, children: [] };
    onChange({ ...node, children: [...node.children, newChild] } as PolicyNode);
  };

  const removeChild = (idx: number) => {
    if (node.type === "Signature") return;
    onChange({ ...node, children: node.children.filter((_, i) => i !== idx) } as PolicyNode);
  };

  const updateChild = (idx: number, child: PolicyNode) => {
    if (node.type === "Signature") return;
    const newChildren = [...node.children];
    newChildren[idx] = child;
    onChange({ ...node, children: newChildren } as PolicyNode);
  };

  if (node.type === "Signature") {
    return (
      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border">
        <ShieldCheck className="w-4 h-4 text-indigo-500" />
        <Select value={node.org} onValueChange={(v) => onChange({ ...node, org: v })}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orgs.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg p-3 space-y-2", depth === 0 ? "bg-white dark:bg-[#1e293b]" : "bg-slate-50 dark:bg-slate-800/50")}>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {node.type === "OutOf" ? `OutOf(${node.n})` : node.type}
        </Badge>
        {node.type === "OutOf" && (
          <Input
            type="number"
            min={1}
            value={node.n}
            onChange={(e) => onChange({ ...node, n: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-16 h-7 text-xs"
          />
        )}
        <div className="flex-1" />
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => addChild("AND")}><Plus className="w-3 h-3" /> AND</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => addChild("OR")}><Plus className="w-3 h-3" /> OR</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => addChild("OutOf")}><Plus className="w-3 h-3" /> OutOf</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => addChild("Signature")}><Plus className="w-3 h-3" /> 签名</Button>
      </div>
      <div className="space-y-2 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
        {node.children.map((child, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1">
              <PolicyEditor node={child} onChange={(c) => updateChild(idx, c)} orgs={orgs} depth={depth + 1} />
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-red-500" onClick={() => removeChild(idx)}><Trash className="w-3 h-3" /></Button>
          </div>
        ))}
        {node.children.length === 0 && (
          <div className="text-xs text-slate-400 py-2">点击上方按钮添加子条件</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainChannels() {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [search, setSearch] = useState("");

  const [membersMap, setMembersMap] = useState<Record<string, ChannelMember[]>>(initialMembers);
  const [collectionsMap, setCollectionsMap] = useState<Record<string, PrivateCollection[]>>(initialCollections);
  const [blocksMap] = useState<Record<string, BlockData[]>>(initialBlocks);

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCh, setDetailCh] = useState<Channel | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  // Member dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteOrg, setInviteOrg] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "observer">("member");
  const [joinConfigCopied, setJoinConfigCopied] = useState(false);

  // Exit confirmation
  const [exitOpen, setExitOpen] = useState(false);
  const [exitOrg, setExitOrg] = useState("");
  const [exitCleanup, setExitCleanup] = useState(true);

  // Anchor peer dialog
  const [anchorOpen, setAnchorOpen] = useState(false);
  const [anchorOrg, setAnchorOrg] = useState("");
  const [anchorPeerInput, setAnchorPeerInput] = useState("");

  // Policy editor
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyNode, setPolicyNode] = useState<PolicyNode>({ type: "AND", children: [{ type: "Signature", org: "" }] });
  const [policyError, setPolicyError] = useState<string | null>(null);

  // Collection dialog
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState({ name: "", members: [] as string[], blockToLive: 0, stateCacheSize: 1000 });

  // Block browser
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);
  const [blockDetailOpen, setBlockDetailOpen] = useState(false);

  const filtered = channels.filter(c => c.name.includes(search) || c.network.includes(search));
  const activeCount = channels.filter(c => c.status === "active").length;

  const currentMembers = detailCh ? (membersMap[detailCh.id] || []) : [];
  const currentCollections = detailCh ? (collectionsMap[detailCh.id] || []) : [];
  const currentBlocks = detailCh ? (blocksMap[detailCh.id] || []) : [];

  // Block chart ref
  const blockChartRef = useRef<HTMLDivElement>(null);
  const blockChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!blockChartRef.current || !detailCh || detailTab !== "blocks") return;
    blockChartInstance.current?.dispose();
    blockChartInstance.current = echarts.init(blockChartRef.current);
    const data = currentBlocks.slice(-20);
    blockChartInstance.current.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: { type: "category", data: data.map(b => `#${b.number}`), axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: "value", name: "交易数" },
      series: [{ data: data.map(b => b.txCount), type: "bar", itemStyle: { color: "#6366f1" } }],
    });
    const handleResize = () => blockChartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      blockChartInstance.current?.dispose();
    };
  }, [detailCh, detailTab, currentBlocks]);

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "", network: "", orgs: "", status: "active", txCount: 0, chaincodes: 0,
      createTime: new Date().toISOString().split("T")[0], policy: "", privacy: "private",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (ch: Channel) => {
    setDialogMode("edit");
    setDialogData({
      name: ch.name, network: ch.network, orgs: ch.orgs.join(", "),
      status: ch.status, txCount: ch.txCount, chaincodes: ch.chaincodes,
      createTime: ch.createTime, policy: ch.policy, privacy: ch.privacy,
    });
    setEditingId(ch.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (ch: Channel) => {
    setDialogMode("delete");
    setEditingId(ch.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const parseOrgs = (raw: any) =>
      raw ? String(raw).split(",").map((s: string) => s.trim()).filter(Boolean) : [];

    if (dialogMode === "create") {
      const id = generateId(channels);
      const newCh: Channel = {
        id, name: data.name, network: data.network, orgs: parseOrgs(data.orgs),
        status: data.status, txCount: Number(data.txCount), chaincodes: Number(data.chaincodes),
        createTime: data.createTime, policy: data.policy, privacy: data.privacy,
      };
      setChannels(prev => [...prev, newCh]);
      setMembersMap(prev => ({ ...prev, [id]: newCh.orgs.map((o: string, i: number) => ({ org: o, role: i === 0 ? "admin" as const : "member" as const, joinedAt: data.createTime, anchorPeers: [] })) }));
    } else if (dialogMode === "edit" && editingId) {
      setChannels(prev => prev.map(ch => ch.id === editingId ? {
        ...ch, name: data.name, network: data.network, orgs: parseOrgs(data.orgs),
        status: data.status, txCount: Number(data.txCount), chaincodes: Number(data.chaincodes),
        createTime: data.createTime, policy: data.policy, privacy: data.privacy,
      } : ch));
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setChannels(prev => prev.filter(ch => ch.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (ch: Channel) => {
    setDetailCh(ch);
    setDetailOpen(true);
    setDetailTab("overview");
  };

  const detailData = detailCh
    ? {
        ...detailCh,
        status: detailCh.status === "active" ? "已激活" : detailCh.status === "inactive" ? "未激活" : "配置中",
        privacy: detailCh.privacy === "private" ? "私有通道" : "公共通道",
        txCount: detailCh.txCount.toLocaleString(),
      }
    : {};

  // Member actions
  const handleInvite = () => {
    if (!detailCh || !inviteOrg) return;
    setMembersMap(prev => ({
      ...prev,
      [detailCh.id]: [...(prev[detailCh.id] || []), { org: inviteOrg, role: inviteRole, joinedAt: new Date().toISOString().split("T")[0], anchorPeers: [] }],
    }));
    setChannels(prev => prev.map(ch => ch.id === detailCh.id ? { ...ch, orgs: [...ch.orgs, inviteOrg] } : ch));
    setInviteOpen(false);
    setInviteOrg("");
    setJoinConfigCopied(false);
  };

  const handleExit = () => {
    if (!detailCh || !exitOrg) return;
    setMembersMap(prev => ({
      ...prev,
      [detailCh.id]: (prev[detailCh.id] || []).filter(m => m.org !== exitOrg),
    }));
    setChannels(prev => prev.map(ch => ch.id === detailCh.id ? { ...ch, orgs: ch.orgs.filter(o => o !== exitOrg) } : ch));
    if (exitCleanup) {
      setCollectionsMap(prev => ({
        ...prev,
        [detailCh.id]: (prev[detailCh.id] || []).map(col => ({
          ...col,
          members: col.members.filter(m => m !== exitOrg),
          distributionStatus: { ...col.distributionStatus, [exitOrg]: "removed" },
        })),
      }));
    }
    setExitOpen(false);
    setExitOrg("");
  };

  // Anchor peer actions
  const handleSetAnchor = () => {
    if (!detailCh || !anchorOrg || !anchorPeerInput.trim()) return;
    setMembersMap(prev => ({
      ...prev,
      [detailCh.id]: (prev[detailCh.id] || []).map(m =>
        m.org === anchorOrg ? { ...m, anchorPeers: [...m.anchorPeers, anchorPeerInput.trim()] } : m
      ),
    }));
    setAnchorOpen(false);
    setAnchorOrg("");
    setAnchorPeerInput("");
  };

  const handleRemoveAnchor = (org: string, peer: string) => {
    if (!detailCh) return;
    setMembersMap(prev => ({
      ...prev,
      [detailCh.id]: (prev[detailCh.id] || []).map(m =>
        m.org === org ? { ...m, anchorPeers: m.anchorPeers.filter(p => p !== peer) } : m
      ),
    }));
  };

  // Policy actions
  const handleSavePolicy = () => {
    const err = validatePolicy(policyNode);
    if (err) { setPolicyError(err); return; }
    if (detailCh) {
      setChannels(prev => prev.map(ch => ch.id === detailCh.id ? { ...ch, policy: policyToString(policyNode) } : ch));
    }
    setPolicyOpen(false);
    setPolicyError(null);
  };

  const applyPolicyTemplate = (template: string) => {
    if (!detailCh) return;
    const orgs = detailCh.orgs;
    let node: PolicyNode;
    switch (template) {
      case "all":
        node = { type: "AND", children: orgs.map(o => ({ type: "Signature" as const, org: o })) };
        break;
      case "any":
        node = { type: "OR", children: orgs.map(o => ({ type: "Signature" as const, org: o })) };
        break;
      case "majority":
        node = { type: "OutOf", n: Math.ceil(orgs.length / 2), children: orgs.map(o => ({ type: "Signature" as const, org: o })) };
        break;
      case "admin":
        node = { type: "Signature", org: orgs[0] || "" };
        break;
      default:
        node = { type: "AND", children: [{ type: "Signature", org: orgs[0] || "" }] };
    }
    setPolicyNode(node);
    setPolicyError(null);
  };

  // Collection actions
  const handleCreateCollection = () => {
    if (!detailCh || !collectionForm.name.trim()) return;
    const newCol: PrivateCollection = {
      id: `PC-${Date.now().toString(36).toUpperCase()}`,
      name: collectionForm.name,
      members: collectionForm.members,
      blockToLive: collectionForm.blockToLive,
      stateCacheSize: collectionForm.stateCacheSize,
      distributionStatus: Object.fromEntries(detailCh.orgs.map(o => [o, collectionForm.members.includes(o) ? "synced" : "not_member"])),
    };
    setCollectionsMap(prev => ({
      ...prev,
      [detailCh.id]: [...(prev[detailCh.id] || []), newCol],
    }));
    setCollectionOpen(false);
    setCollectionForm({ name: "", members: [], blockToLive: 0, stateCacheSize: 1000 });
  };

  const joinConfigText = useMemo(() => {
    if (!detailCh || !inviteOrg) return "";
    return JSON.stringify({
      channel_id: detailCh.id,
      channel_name: detailCh.name,
      organization: inviteOrg,
      orderer_endpoints: ["orderer.example.com:7050"],
      tls_root_certs: "/path/to/tls/ca.crt",
      genesis_block: "base64encoded...",
    }, null, 2);
  }, [detailCh, inviteOrg]);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">通道管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理Fabric通道生命周期，配置通道策略与隐私设置</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 创建通道
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "通道总数", value: channels.length, icon: <Layers className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已激活", value: activeCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总交易数", value: channels.reduce((s, c) => s + c.txCount, 0).toLocaleString(), icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "智能合约", value: channels.reduce((s, c) => s + c.chaincodes, 0), icon: <FileCode className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索通道名称/所属网络" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["通道名称", "所属网络", "参与组织", "状态", "交易数", "合约数", "背书策略", "创建时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(ch => (
              <tr key={ch.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ch.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.network}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{ch.orgs.length}个组织</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={ch.status} privacy={ch.privacy} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.txCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.chaincodes}</td>
                <td className="px-4 py-3"><Badge variant="outline">{ch.policy}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.createTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openDetail(ch)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(ch)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(ch)}><Trash className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DetailDrawer with Tabs */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`通道详情 - ${detailCh?.name || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailCh ? () => handleEdit(detailCh) : undefined}
        onDelete={detailCh ? () => handleDelete(detailCh) : undefined}
      >
        {detailCh && (
          <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-6">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="members">成员管理</TabsTrigger>
              <TabsTrigger value="anchors">锚节点</TabsTrigger>
              <TabsTrigger value="policy">背书策略</TabsTrigger>
              <TabsTrigger value="private">私有数据</TabsTrigger>
              <TabsTrigger value="blocks">区块浏览</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">通道统计</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">成员组织</span><span>{detailCh.orgs.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">智能合约</span><span>{detailCh.chaincodes}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">交易总数</span><span>{detailCh.txCount.toLocaleString()}</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">最近活动</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>通道创建于 {detailCh.createTime}</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>背书策略: {detailCh.policy}</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>隐私类型: {detailCh.privacy === "private" ? "私有" : "公共"}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">通道成员</h3>
                <Button size="sm" className="gap-1" onClick={() => { setInviteOpen(true); setJoinConfigCopied(false); }}><UserPlus className="w-4 h-4" /> 邀请组织</Button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-[#273548]">
                    <tr>
                      {["组织", "角色", "加入时间", "锚节点数", "操作"].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentMembers.map(m => (
                      <tr key={m.org} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-4 py-2 font-medium">{m.org}</td>
                        <td className="px-4 py-2"><Badge variant="outline">{m.role}</Badge></td>
                        <td className="px-4 py-2 text-slate-500">{m.joinedAt}</td>
                        <td className="px-4 py-2">{m.anchorPeers.length}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="ghost" className="text-red-600 h-7" onClick={() => { setExitOrg(m.org); setExitOpen(true); }}>
                            <UserMinus className="w-3 h-3" /> 退出
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="anchors" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">锚节点管理</h3>
                <Button size="sm" className="gap-1" onClick={() => setAnchorOpen(true)}><Server className="w-4 h-4" /> 设置锚节点</Button>
              </div>
              <div className="space-y-3">
                {currentMembers.filter(m => m.anchorPeers.length > 0).map(m => (
                  <Card key={m.org}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">{m.org}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {m.anchorPeers.map(peer => (
                          <Badge key={peer} variant="secondary" className="gap-1">
                            <Server className="w-3 h-3" /> {peer}
                            <button onClick={() => handleRemoveAnchor(m.org, peer)} className="ml-1 text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {currentMembers.filter(m => m.anchorPeers.length > 0).length === 0 && (
                  <div className="text-center text-slate-500 py-8">暂无锚节点配置</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="policy" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">背书策略编辑器</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => applyPolicyTemplate("all")}>全部签名</Button>
                  <Button size="sm" variant="outline" onClick={() => applyPolicyTemplate("any")}>任一签名</Button>
                  <Button size="sm" variant="outline" onClick={() => applyPolicyTemplate("majority")}>多数签名</Button>
                  <Button size="sm" variant="outline" onClick={() => applyPolicyTemplate("admin")}>仅管理员</Button>
                </div>
              </div>
              <PolicyEditor node={policyNode} onChange={setPolicyNode} orgs={detailCh.orgs} />
              {policyError && <div className="text-red-600 text-sm flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{policyError}</div>}
              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded break-all">
                <strong>策略字符串:</strong> {policyToString(policyNode)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { const err = validatePolicy(policyNode); setPolicyError(err); }}>验证策略</Button>
                <Button size="sm" variant="outline" onClick={() => setPolicyOpen(true)}>保存到通道</Button>
              </div>
            </TabsContent>

            <TabsContent value="private" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">私有数据集合</h3>
                <Button size="sm" className="gap-1" onClick={() => setCollectionOpen(true)}><Database className="w-4 h-4" /> 创建集合</Button>
              </div>
              <div className="space-y-3">
                {currentCollections.map(col => (
                  <Card key={col.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">{col.name}</CardTitle>
                        <Badge variant="outline">{col.members.length} 成员</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs text-slate-500">成员: {col.members.join(", ")}</div>
                      <div className="text-xs text-slate-500">BlockToLive: {col.blockToLive} | StateCache: {col.stateCacheSize}</div>
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 dark:bg-[#273548]">
                            <tr><th className="px-2 py-1 text-left">组织</th><th className="px-2 py-1 text-left">同步状态</th></tr>
                          </thead>
                          <tbody>
                            {detailCh.orgs.map(org => (
                              <tr key={org} className="border-t border-slate-100 dark:border-slate-700">
                                <td className="px-2 py-1">{org}</td>
                                <td className="px-2 py-1">
                                  <Badge variant={col.distributionStatus[org] === "synced" ? "default" : col.distributionStatus[org] === "syncing" ? "secondary" : "outline"} className="text-[10px]">
                                    {col.distributionStatus[org] === "synced" ? "已同步" : col.distributionStatus[org] === "syncing" ? "同步中" : "未成员"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {currentCollections.length === 0 && <div className="text-center text-slate-500 py-8">暂无私有数据集合</div>}
              </div>
            </TabsContent>

            <TabsContent value="blocks" className="space-y-4 mt-4">
              <div ref={blockChartRef} style={{ height: 200 }} />
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-[#273548] sticky top-0">
                    <tr>
                      {["区块号", "交易数", "哈希", "时间", "操作"].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentBlocks.slice().reverse().map(block => (
                      <tr key={block.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                        <td className="px-4 py-2 font-medium">#{block.number}</td>
                        <td className="px-4 py-2"><Badge variant="outline">{block.txCount}</Badge></td>
                        <td className="px-4 py-2 text-xs text-slate-500 font-mono truncate max-w-[150px]">{block.hash.slice(0, 20)}...</td>
                        <td className="px-4 py-2 text-xs text-slate-500">{new Date(block.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedBlock(block); setBlockDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>邀请组织加入通道</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择组织</label>
              <Select value={inviteOrg} onValueChange={setInviteOrg}>
                <SelectTrigger><SelectValue placeholder="选择要邀请的组织" /></SelectTrigger>
                <SelectContent>
                  {allOrgs.filter(o => !detailCh?.orgs.includes(o)).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">角色</label>
              <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="member">成员</SelectItem>
                  <SelectItem value="observer">观察员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteOrg && (
              <div className="space-y-2">
                <label className="text-sm font-medium">加入配置 (JSON)</label>
                <div className="relative">
                  <pre className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-xs overflow-x-auto">{joinConfigText}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => { navigator.clipboard.writeText(joinConfigText); setJoinConfigCopied(true); }}>
                    {joinConfigCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>取消</Button>
            <Button onClick={handleInvite} disabled={!inviteOrg}>确认邀请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="w-5 h-5" /> 确认组织退出</DialogTitle>
            <DialogDescription>组织 <strong>{exitOrg}</strong> 将从通道 <strong>{detailCh?.name}</strong> 退出。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cleanup" checked={exitCleanup} onChange={e => setExitCleanup(e.target.checked)} className="rounded" />
              <label htmlFor="cleanup" className="text-sm">清理该组织的私有数据状态</label>
            </div>
            {exitCleanup && <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">警告：数据清理操作不可撤销，该组织在私有数据集合中的状态将被清除。</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleExit}>确认退出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anchor Peer Dialog */}
      <Dialog open={anchorOpen} onOpenChange={setAnchorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>设置锚节点</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">组织</label>
              <Select value={anchorOrg} onValueChange={setAnchorOrg}>
                <SelectTrigger><SelectValue placeholder="选择组织" /></SelectTrigger>
                <SelectContent>
                  {currentMembers.map(m => <SelectItem key={m.org} value={m.org}>{m.org}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">锚节点地址</label>
              <Input placeholder="peer0.org.com:7051" value={anchorPeerInput} onChange={e => setAnchorPeerInput(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnchorOpen(false)}>取消</Button>
            <Button onClick={handleSetAnchor} disabled={!anchorOrg || !anchorPeerInput.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Save Dialog */}
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>保存背书策略</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">确定将以下策略应用到通道 <strong>{detailCh?.name}</strong> 吗？</p>
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded text-xs break-all">{policyToString(policyNode)}</div>
            {policyError && <div className="mt-2 text-red-600 text-sm">{policyError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyOpen(false)}>取消</Button>
            <Button onClick={handleSavePolicy}>确认保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Dialog */}
      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>创建私有数据集合</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">集合名称</label>
              <Input value={collectionForm.name} onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">成员组织</label>
              <div className="border rounded-md p-2 space-y-1 max-h-[120px] overflow-y-auto">
                {detailCh?.orgs.map(org => {
                  const selected = collectionForm.members.includes(org);
                  return (
                    <div key={org} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                      onClick={() => setCollectionForm({ ...collectionForm, members: selected ? collectionForm.members.filter(m => m !== org) : [...collectionForm.members, org] })}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span>{org}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">BlockToLive</label>
                <Input type="number" value={collectionForm.blockToLive} onChange={e => setCollectionForm({ ...collectionForm, blockToLive: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">StateCacheSize</label>
                <Input type="number" value={collectionForm.stateCacheSize} onChange={e => setCollectionForm({ ...collectionForm, stateCacheSize: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectionOpen(false)}>取消</Button>
            <Button onClick={handleCreateCollection} disabled={!collectionForm.name.trim() || collectionForm.members.length === 0}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Detail Dialog */}
      <Dialog open={blockDetailOpen} onOpenChange={setBlockDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Blocks className="w-5 h-5" /> 区块 #{selectedBlock?.number}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">哈希:</span> <span className="font-mono text-xs">{selectedBlock?.hash}</span></div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">DataHash:</span> <span className="font-mono text-xs">{selectedBlock?.dataHash}</span></div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">PrevHash:</span> <span className="font-mono text-xs">{selectedBlock?.prevHash}</span></div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">时间:</span> {selectedBlock && new Date(selectedBlock.timestamp).toLocaleString()}</div>
              </div>
              <h4 className="text-sm font-medium">交易列表 ({selectedBlock?.txCount})</h4>
              <div className="rounded border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-[#273548]">
                    <tr>
                      {["交易ID", "类型", "创建者", "验证结果", "时间"].map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBlock?.txs.map(tx => (
                      <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-3 py-2 font-mono">{tx.id}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{tx.type}</Badge></td>
                        <td className="px-3 py-2">{tx.creator}</td>
                        <td className="px-3 py-2">
                          <Badge variant={tx.validationCode === "VALID" ? "default" : "destructive"} className="text-[10px]">
                            {tx.validationCode}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${channels.find((c) => c.id === editingId)?.name || "通道"}` : "通道"}
        fields={channelFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
