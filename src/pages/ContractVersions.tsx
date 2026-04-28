import { useState, useMemo, useRef, useEffect } from "react";
import {
  GitBranch, Plus, Search, CheckCircle2, RotateCcw, FileCode, Tag,
  Eye, Pencil, Trash, Diff, ArrowLeftRight, ScrollText, ClipboardCheck,
  X, ChevronDown, ChevronUp, Play, Save, Send, Check, Clock, AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface ApprovalStep {
  id: string;
  action: "submit" | "review" | "publish" | "reject";
  actor: string;
  time: string;
  comment?: string;
}

interface ContractVersion {
  version: string;
  status: string;
  deployTime: string;
  deployer: string;
  changes: string;
  audit: string;
  size: string;
  code: string;
  abi: string;
  gas: number;
  releaseNotes: string;
  tag: "major" | "minor" | "patch";
  approvalStatus: "draft" | "submitted" | "reviewing" | "published" | "rejected";
  approvalHistory: ApprovalStep[];
}

interface Contract {
  id: string;
  name: string;
  versions: ContractVersion[];
}

/* ─── Mock Code & ABI ─── */
const mockCodeV1 = `pragma solidity ^0.8.0;
contract DataAsset {
  mapping(bytes32 => bool) public notarized;
  function notarize(bytes32 hash) public {
    notarized[hash] = true;
  }
  function verify(bytes32 hash) public view returns (bool) {
    return notarized[hash];
  }
}`;

const mockCodeV2 = `pragma solidity ^0.8.0;
contract DataAsset {
  mapping(bytes32 => bool) public notarized;
  mapping(bytes32 => uint256) public timestamp;
  event Notarized(bytes32 indexed hash, uint256 time);
  function notarize(bytes32 hash) public {
    require(!notarized[hash], "already notarized");
    notarized[hash] = true;
    timestamp[hash] = block.timestamp;
    emit Notarized(hash, block.timestamp);
  }
  function verify(bytes32 hash) public view returns (bool, uint256) {
    return (notarized[hash], timestamp[hash]);
  }
  function batchNotarize(bytes32[] calldata hashes) public {
    for (uint i = 0; i < hashes.length; i++) {
      notarize(hashes[i]);
    }
  }
}`;

const mockAbiV1 = `[{"name":"notarize","type":"function","inputs":[{"name":"hash","type":"bytes32"}]},{"name":"verify","type":"function","inputs":[{"name":"hash","type":"bytes32"}],"outputs":[{"type":"bool"}]}]`;
const mockAbiV2 = `[{"name":"notarize","type":"function","inputs":[{"name":"hash","type":"bytes32"}]},{"name":"verify","type":"function","inputs":[{"name":"hash","type":"bytes32"}],"outputs":[{"type":"bool"},{"type":"uint256"}]},{"name":"batchNotarize","type":"function","inputs":[{"name":"hashes","type":"bytes32[]"}]},{"name":"Notarized","type":"event","inputs":[{"name":"hash","type":"bytes32","indexed":true},{"name":"time","type":"uint256"}]}]`;

/* ─── Mock Contract Versions ─── */
const initialContractVersionsData: Contract[] = [
  {
    id: "SC-001",
    name: "数据资产存证合约",
    versions: [
      { version: "v2.0.0", status: "current", deployTime: "2025-04-15", deployer: "管理员", changes: "新增批量存证接口，优化gas消耗", audit: "已通过", size: "12.5KB", code: mockCodeV2, abi: mockAbiV2, gas: 85000, releaseNotes: "## v2.0.0\n- 新增批量存证接口\n- 增加时间戳记录\n- 优化gas消耗约15%", tag: "major", approvalStatus: "published", approvalHistory: [{ id: "A1", action: "submit", actor: "张三", time: "2025-04-10 09:00", comment: "提交审核" }, { id: "A2", action: "review", actor: "李四", time: "2025-04-12 14:00", comment: "代码审查通过" }, { id: "A3", action: "publish", actor: "王五", time: "2025-04-15 10:00", comment: "发布上线" }] },
      { version: "v1.2.0", status: "deprecated", deployTime: "2025-02-10", deployer: "管理员", changes: "修复重入漏洞，增强权限校验", audit: "已通过", size: "11.8KB", code: mockCodeV1, abi: mockAbiV1, gas: 92000, releaseNotes: "## v1.2.0\n- 修复重入漏洞\n- 增强权限校验", tag: "minor", approvalStatus: "published", approvalHistory: [{ id: "A4", action: "submit", actor: "张三", time: "2025-02-08 09:00" }, { id: "A5", action: "publish", actor: "王五", time: "2025-02-10 10:00" }] },
      { version: "v1.1.0", status: "deprecated", deployTime: "2024-11-20", deployer: "管理员", changes: "增加事件日志，优化存储结构", audit: "已通过", size: "10.2KB", code: mockCodeV1, abi: mockAbiV1, gas: 95000, releaseNotes: "## v1.1.0\n- 增加事件日志\n- 优化存储结构", tag: "minor", approvalStatus: "published", approvalHistory: [] },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-08-01", deployer: "管理员", changes: "初始版本，基础存证功能", audit: "已通过", size: "9.1KB", code: mockCodeV1, abi: mockAbiV1, gas: 98000, releaseNotes: "## v1.0.0\n- 初始版本", tag: "major", approvalStatus: "published", approvalHistory: [] },
    ],
  },
  {
    id: "SC-002",
    name: "数据授权合约",
    versions: [
      { version: "v1.1.0", status: "current", deployTime: "2025-03-20", deployer: "管理员", changes: "支持多级授权与委托，增加授权期限", audit: "已通过", size: "15.3KB", code: mockCodeV2, abi: mockAbiV2, gas: 120000, releaseNotes: "## v1.1.0\n- 支持多级授权\n- 增加授权期限", tag: "minor", approvalStatus: "published", approvalHistory: [] },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-09-15", deployer: "管理员", changes: "初始版本，基础授权功能", audit: "已通过", size: "12.1KB", code: mockCodeV1, abi: mockAbiV1, gas: 125000, releaseNotes: "## v1.0.0\n- 初始版本", tag: "major", approvalStatus: "published", approvalHistory: [] },
    ],
  },
  {
    id: "SC-003",
    name: "数据溯源合约",
    versions: [
      { version: "v1.2.0", status: "current", deployTime: "2025-04-01", deployer: "管理员", changes: "支持跨链溯源查询，优化查询性能", audit: "已通过", size: "18.7KB", code: mockCodeV2, abi: mockAbiV2, gas: 150000, releaseNotes: "## v1.2.0\n- 支持跨链溯源\n- 优化查询性能", tag: "minor", approvalStatus: "reviewing", approvalHistory: [{ id: "A6", action: "submit", actor: "赵六", time: "2025-03-28 09:00" }, { id: "A7", action: "review", actor: "孙七", time: "2025-04-01 11:00", comment: "正在审查中" }] },
      { version: "v1.1.0", status: "deprecated", deployTime: "2025-01-10", deployer: "管理员", changes: "增加血缘关系图谱存储", audit: "已通过", size: "16.4KB", code: mockCodeV1, abi: mockAbiV1, gas: 155000, releaseNotes: "## v1.1.0\n- 增加血缘关系图谱", tag: "minor", approvalStatus: "published", approvalHistory: [] },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-07-20", deployer: "管理员", changes: "初始版本，基础溯源功能", audit: "已通过", size: "14.2KB", code: mockCodeV1, abi: mockAbiV1, gas: 160000, releaseNotes: "## v1.0.0\n- 初始版本", tag: "major", approvalStatus: "published", approvalHistory: [] },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    current: { text: "当前版本", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    deprecated: { text: "已废弃", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    pending: { text: "待部署", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.deprecated;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function ApprovalBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    draft: { text: "草稿", class: "bg-slate-100 text-slate-600" },
    submitted: { text: "已提交", class: "bg-blue-50 text-blue-700" },
    reviewing: { text: "审核中", class: "bg-amber-50 text-amber-700" },
    published: { text: "已发布", class: "bg-emerald-50 text-emerald-700" },
    rejected: { text: "已驳回", class: "bg-red-50 text-red-700" },
  };
  const c = config[status] || config.draft;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function TagBadge({ tag }: { tag: string }) {
  const config: Record<string, { text: string; class: string }> = {
    major: { text: "MAJOR", class: "bg-red-50 text-red-700" },
    minor: { text: "MINOR", class: "bg-blue-50 text-blue-700" },
    patch: { text: "PATCH", class: "bg-green-50 text-green-700" },
  };
  const c = config[tag] || config.patch;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold", c.class)}>{c.text}</span>;
}

/* ─── Diff Utilities ─── */
function computeDiff(oldLines: string[], newLines: string[]) {
  const diff: { type: "=" | "+" | "-"; line: string }[] = [];
  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      diff.push({ type: "+", line: newLines[j++] });
    } else if (j >= newLines.length) {
      diff.push({ type: "-", line: oldLines[i++] });
    } else if (oldLines[i] === newLines[j]) {
      diff.push({ type: "=", line: oldLines[i] });
      i++; j++;
    } else {
      diff.push({ type: "-", line: oldLines[i++] });
      diff.push({ type: "+", line: newLines[j++] });
    }
  }
  return diff;
}

function DiffView({ diff }: { diff: { type: "=" | "+" | "-"; line: string }[] }) {
  return (
    <div className="border rounded-lg overflow-hidden text-xs font-mono bg-white dark:bg-[#1e293b]">
      {diff.map((d, i) => (
        <div key={i} className={cn(
          "flex px-2 py-0.5",
          d.type === "+" && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300",
          d.type === "-" && "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
          d.type === "=" && "text-slate-700 dark:text-slate-300"
        )}>
          <span className="w-6 shrink-0 text-slate-400 select-none">{d.type === "=" ? " " : d.type}</span>
          <span className="whitespace-pre">{d.line}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Simple Markdown Preview ─── */
function MarkdownPreview({ source }: { source: string }) {
  const html = useMemo(() => {
    return source
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }, [source]);
  return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ─── Fields ─── */
const contractFields: FieldConfig[] = [
  { key: "id", label: "合约编号", type: "text", required: true },
  { key: "name", label: "合约名称", type: "text", required: true },
  { key: "versions", label: "版本列表 (JSON)", type: "textarea", required: true, placeholder: '[{"version":"v1.0.0","status":"current","deployTime":"2025-01-01","deployer":"管理员","changes":"...","audit":"已通过","size":"10KB"}]' },
];

const detailFields = [
  { key: "id", label: "合约编号" },
  { key: "name", label: "合约名称" },
  { key: "versionCount", label: "版本数量" },
];

export default function ContractVersions() {
  const [contracts, setContracts] = useState<Contract[]>(initialContractVersionsData);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  // Comparison state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareContract, setCompareContract] = useState<Contract | null>(null);
  const [compareLeft, setCompareLeft] = useState<string>("");
  const [compareRight, setCompareRight] = useState<string>("");
  const [compareTab, setCompareTab] = useState<"code" | "abi" | "gas">("code");

  // Rollback state
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<ContractVersion | null>(null);
  const [rollbackContract, setRollbackContract] = useState<Contract | null>(null);

  // Release notes state
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesVersion, setNotesVersion] = useState<ContractVersion | null>(null);
  const [notesContract, setNotesContract] = useState<Contract | null>(null);
  const [notesEdit, setNotesEdit] = useState("");
  const [notesTag, setNotesTag] = useState<"major" | "minor" | "patch">("patch");

  // Approval state
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalVersion, setApprovalVersion] = useState<ContractVersion | null>(null);
  const [approvalContract, setApprovalContract] = useState<Contract | null>(null);
  const [approvalComment, setApprovalComment] = useState("");

  const filtered = contracts.filter(c => c.name.includes(search) || c.id.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({ id: "", name: "", versions: "[]" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setDialogMode("edit");
    setDialogData({
      id: contract.id,
      name: contract.name,
      versions: JSON.stringify(contract.versions, null, 2),
    });
    setEditingId(contract.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    setDialogMode("delete");
    setEditingId(contract.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    let parsedVersions: ContractVersion[] = [];
    try {
      parsedVersions = JSON.parse(data.versions || "[]");
    } catch {
      parsedVersions = [];
    }

    if (dialogMode === "create") {
      const newContract: Contract = {
        id: data.id,
        name: data.name,
        versions: parsedVersions,
      };
      setContracts(prev => [...prev, newContract]);
    } else if (dialogMode === "edit" && editingId) {
      setContracts(prev =>
        prev.map(c =>
          c.id === editingId
            ? { ...c, id: data.id, name: data.name, versions: parsedVersions }
            : c
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setContracts(prev => prev.filter(c => c.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (contract: Contract) => {
    setDetailContract(contract);
    setDetailOpen(true);
  };

  const openCompare = (contract: Contract) => {
    setCompareContract(contract);
    setCompareLeft(contract.versions[1]?.version || contract.versions[0]?.version || "");
    setCompareRight(contract.versions[0]?.version || "");
    setCompareOpen(true);
  };

  const getVersionByTag = (contract: Contract, versionTag: string) =>
    contract.versions.find(v => v.version === versionTag);

  const compareLeftVersion = compareContract ? getVersionByTag(compareContract, compareLeft) : null;
  const compareRightVersion = compareContract ? getVersionByTag(compareContract, compareRight) : null;

  const codeDiff = useMemo(() => {
    if (!compareLeftVersion || !compareRightVersion) return [];
    return computeDiff(compareLeftVersion.code.split("\n"), compareRightVersion.code.split("\n"));
  }, [compareLeftVersion, compareRightVersion]);

  const abiDiff = useMemo(() => {
    if (!compareLeftVersion || !compareRightVersion) return [];
    const left = JSON.stringify(JSON.parse(compareLeftVersion.abi), null, 2).split("\n");
    const right = JSON.stringify(JSON.parse(compareRightVersion.abi), null, 2).split("\n");
    return computeDiff(left, right);
  }, [compareLeftVersion, compareRightVersion]);

  const openRollback = (contract: Contract, version: ContractVersion) => {
    setRollbackContract(contract);
    setRollbackVersion(version);
    setRollbackOpen(true);
  };

  const executeRollback = () => {
    if (!rollbackContract || !rollbackVersion) return;
    const newVersionTag = rollbackVersion.version.replace(/\d+$/, m => String(Number(m) + 1));
    const newVersion: ContractVersion = {
      ...rollbackVersion,
      version: newVersionTag,
      status: "pending",
      deployTime: new Date().toISOString().slice(0, 10),
      approvalStatus: "draft",
      approvalHistory: [],
      releaseNotes: `## Rollback to ${rollbackVersion.version}\n- 回滚至历史版本 ${rollbackVersion.version}\n- 原版本变更: ${rollbackVersion.changes}`,
    };
    setContracts(prev => prev.map(c => {
      if (c.id !== rollbackContract.id) return c;
      return { ...c, versions: [newVersion, ...c.versions.map(v => ({ ...v, status: v.status === "current" ? "deprecated" : v.status }))] };
    }));
    setRollbackOpen(false);
  };

  const openNotes = (contract: Contract, version: ContractVersion) => {
    setNotesContract(contract);
    setNotesVersion(version);
    setNotesEdit(version.releaseNotes);
    setNotesTag(version.tag);
    setNotesOpen(true);
  };

  const saveNotes = () => {
    if (!notesContract || !notesVersion) return;
    setContracts(prev => prev.map(c => {
      if (c.id !== notesContract.id) return c;
      return { ...c, versions: c.versions.map(v => v.version === notesVersion.version ? { ...v, releaseNotes: notesEdit, tag: notesTag } : v) };
    }));
    setNotesOpen(false);
  };

  const openApproval = (contract: Contract, version: ContractVersion) => {
    setApprovalContract(contract);
    setApprovalVersion(version);
    setApprovalComment("");
    setApprovalOpen(true);
  };

  const doApprovalAction = (action: "submit" | "review" | "publish" | "reject") => {
    if (!approvalContract || !approvalVersion) return;
    const step: ApprovalStep = {
      id: Date.now().toString(36).toUpperCase(),
      action,
      actor: "当前用户",
      time: new Date().toLocaleString("zh-CN"),
      comment: approvalComment,
    };
    const nextStatus: Record<string, string> = {
      submit: "submitted",
      review: "reviewing",
      publish: "published",
      reject: "rejected",
    };
    setContracts(prev => prev.map(c => {
      if (c.id !== approvalContract.id) return c;
      return {
        ...c,
        versions: c.versions.map(v =>
          v.version === approvalVersion.version
            ? { ...v, approvalStatus: nextStatus[action] as any, approvalHistory: [...v.approvalHistory, step] }
            : v
        ),
      };
    }));
    setApprovalOpen(false);
  };

  const detailData = detailContract
    ? { id: detailContract.id, name: detailContract.name, versionCount: detailContract.versions.length }
    : {};

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约版本管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理智能合约版本迭代，追踪变更历史与审计状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}><Plus className="w-4 h-4" /> 发布新版本</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "合约总数", value: contracts.length, icon: <FileCode className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "当前版本", value: contracts.length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "历史版本", value: contracts.reduce((s, c) => s + c.versions.length - 1, 0), icon: <GitBranch className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "审计通过", value: contracts.reduce((s, c) => s + c.versions.filter(v => v.audit === "已通过").length, 0), icon: <Tag className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
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
          <Input placeholder="搜索合约名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(contract => (
          <div key={contract.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <div className="px-4 py-3 bg-slate-50 dark:bg-[#273548] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{contract.name}</span>
                <Badge variant="outline">{contract.id}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => openCompare(contract)} title="版本对比"><Diff className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => openDetail(contract)}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(contract)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(contract)}><Trash className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {["版本", "标签", "状态", "审批", "部署时间", "部署人", "变更说明", "审计", "大小", "操作"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.versions.map((v, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{v.version}</td>
                      <td className="px-4 py-3"><TagBadge tag={v.tag} /></td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3"><ApprovalBadge status={v.approvalStatus} /></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.deployTime}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.deployer}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{v.changes}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{v.audit}</Badge></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openNotes(contract, v)} title="发布说明"><ScrollText className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => openApproval(contract, v)} title="审批流程"><ClipboardCheck className="w-4 h-4" /></Button>
                          {v.status === "deprecated" && (
                            <Button size="sm" variant="ghost" onClick={() => openRollback(contract, v)} title="回滚"><RotateCcw className="w-4 h-4" /></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`合约详情 - ${detailContract?.name || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailContract ? () => handleEdit(detailContract) : undefined}
        onDelete={detailContract ? () => handleDelete(detailContract) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${contracts.find((c) => c.id === editingId)?.name || "合约"}` : "合约"}
        fields={contractFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* Compare Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Diff className="w-5 h-5" />
              版本对比 — {compareContract?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2">
            <select className="border rounded-md px-2 py-1 text-sm" value={compareLeft} onChange={e => setCompareLeft(e.target.value)}>
              {compareContract?.versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
            </select>
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
            <select className="border rounded-md px-2 py-1 text-sm" value={compareRight} onChange={e => setCompareRight(e.target.value)}>
              {compareContract?.versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
            </select>
          </div>
          <Tabs value={compareTab} onValueChange={v => setCompareTab(v as any)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code">代码对比</TabsTrigger>
              <TabsTrigger value="abi">ABI 对比</TabsTrigger>
              <TabsTrigger value="gas">Gas 对比</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="flex-1 overflow-auto">
              <DiffView diff={codeDiff} />
            </TabsContent>
            <TabsContent value="abi" className="flex-1 overflow-auto">
              <DiffView diff={abiDiff} />
            </TabsContent>
            <TabsContent value="gas" className="flex-1 overflow-auto">
              {compareLeftVersion && compareRightVersion && (
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-slate-500 mb-1">{compareLeftVersion.version}</div>
                      <div className="text-2xl font-bold">{compareLeftVersion.gas.toLocaleString()} <span className="text-sm font-normal text-slate-500">gas</span></div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-slate-500 mb-1">{compareRightVersion.version}</div>
                      <div className="text-2xl font-bold">{compareRightVersion.gas.toLocaleString()} <span className="text-sm font-normal text-slate-500">gas</span></div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Gas 变化</div>
                    <div className={cn(
                      "text-lg font-bold",
                      compareRightVersion.gas < compareLeftVersion.gas ? "text-emerald-600" : "text-red-600"
                    )}>
                      {compareRightVersion.gas < compareLeftVersion.gas ? "-" : "+"}
                      {Math.abs(compareRightVersion.gas - compareLeftVersion.gas).toLocaleString()} gas
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        ({((compareRightVersion.gas - compareLeftVersion.gas) / compareLeftVersion.gas * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={rollbackOpen} onOpenChange={setRollbackOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="w-5 h-5" />
              版本回滚确认
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                回滚将基于 <strong>{rollbackVersion?.version}</strong> 创建一个新版本，当前版本将被标记为废弃。
              </div>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium">影响分析</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> 合约: {rollbackContract?.name}</div>
                <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> 回滚目标: {rollbackVersion?.version}</div>
                <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> 代码变更: {rollbackVersion?.changes}</div>
                <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> 新状态: 草稿 (待审批)</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackOpen(false)}>取消</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={executeRollback}>
              <RotateCcw className="w-4 h-4 mr-1" /> 确认回滚
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Notes Dialog */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5" />
              发布说明 — {notesVersion?.version}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2">
            <span className="text-sm text-slate-500">版本标签:</span>
            {(["major", "minor", "patch"] as const).map(t => (
              <button
                key={t}
                onClick={() => setNotesTag(t)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-bold border",
                  notesTag === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <Tabs defaultValue="edit" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">编辑</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-1">
              <textarea
                className="w-full h-full min-h-[300px] p-3 border rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={notesEdit}
                onChange={e => setNotesEdit(e.target.value)}
                placeholder="输入 Markdown 格式的发布说明..."
              />
            </TabsContent>
            <TabsContent value="preview" className="flex-1 overflow-auto">
              <div className="border rounded-lg p-4 min-h-[300px] bg-white dark:bg-[#1e293b]">
                <MarkdownPreview source={notesEdit} />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveNotes}>
              <Save className="w-4 h-4 mr-1" /> 保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              审批流程 — {approvalVersion?.version}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">当前状态:</span>
              <ApprovalBadge status={approvalVersion?.approvalStatus || "draft"} />
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium">审批历史</div>
              {approvalVersion?.approvalHistory.length === 0 && (
                <div className="text-sm text-slate-400">暂无审批记录</div>
              )}
              <div className="space-y-2">
                {approvalVersion?.approvalHistory.map((step, idx) => (
                  <div key={step.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">
                      {step.action === "submit" && <Send className="w-4 h-4 text-blue-500" />}
                      {step.action === "review" && <Eye className="w-4 h-4 text-amber-500" />}
                      {step.action === "publish" && <Check className="w-4 h-4 text-emerald-500" />}
                      {step.action === "reject" && <X className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{step.actor}</span>
                        <span className="text-slate-400">
                          {step.action === "submit" && "提交审核"}
                          {step.action === "review" && "开始审查"}
                          {step.action === "publish" && "发布通过"}
                          {step.action === "reject" && "驳回"}
                        </span>
                      </div>
                      {step.comment && <div className="text-slate-500 mt-0.5">{step.comment}</div>}
                      <div className="text-xs text-slate-400 mt-0.5">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">审批意见</label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                value={approvalComment}
                onChange={e => setApprovalComment(e.target.value)}
                placeholder="输入审批意见..."
              />
            </div>
          </div>
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setApprovalOpen(false)}>关闭</Button>
            {approvalVersion?.approvalStatus === "draft" && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => doApprovalAction("submit")}>
                <Send className="w-4 h-4 mr-1" /> 提交审核
              </Button>
            )}
            {approvalVersion?.approvalStatus === "submitted" && (
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => doApprovalAction("review")}>
                <Eye className="w-4 h-4 mr-1" /> 开始审查
              </Button>
            )}
            {approvalVersion?.approvalStatus === "reviewing" && (
              <>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => doApprovalAction("publish")}>
                  <Check className="w-4 h-4 mr-1" /> 通过发布
                </Button>
                <Button variant="destructive" onClick={() => doApprovalAction("reject")}>
                  <X className="w-4 h-4 mr-1" /> 驳回
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
