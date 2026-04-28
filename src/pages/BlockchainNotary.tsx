import { useState, useEffect, useRef } from "react";
import {
  Search,
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  FileText,
  Calendar,
  User,
  ExternalLink,
  Hash,
  FileSearch,
  Award,
  Package,
  Settings,
  Upload,
  AlertCircle,
  Copy,
  Check,
  X,
  Loader2,
  TreePine,
  FileDown,
  Stamp,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/components/CrudDialog";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Types ─── */
interface NotaryRecord {
  id: string;
  assetName: string;
  type: string;
  status: string;
  txHash: string;
  operator: string;
  time: string;
  blockHeight: number;
  dataHash: string;
}

interface MerkleNode {
  hash: string;
  direction?: "left" | "right";
  sibling?: string;
}

interface NotaryTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  usageCount: number;
  status: "active" | "inactive";
  content: string;
}

interface Certificate {
  id: string;
  recordId: string;
  templateId: string;
  templateName: string;
  issuedAt: string;
  institution: string;
  sealCode: string;
}

/* ─── Constants ─── */
const notaryTypes = ["全部", "数据存证", "流转存证", "授权存证", "合约存证"];
const notaryStatus = ["全部", "存证成功", "存证中", "存证失败"];

const initialRecords: NotaryRecord[] = [
  { id: "NT-20250422001", assetName: "企业信用评价数据集", type: "数据存证", status: "success", txHash: "0x8f7e2d...c4b9a1", operator: "张三", time: "2025-04-22 14:32:18", blockHeight: 4285691, dataHash: "sha256:a1b2c3d4e5f6..." },
  { id: "NT-20250422002", assetName: "交通流量数据", type: "流转存证", status: "success", txHash: "0x7a6c3e...b2d8f0", operator: "李四", time: "2025-04-22 13:15:42", blockHeight: 4285685, dataHash: "sha256:b2c3d4e5f6a7..." },
  { id: "NT-20250422003", assetName: "医疗健康档案", type: "数据存证", status: "pending", txHash: "-", operator: "王五", time: "2025-04-22 12:48:33", blockHeight: 0, dataHash: "sha256:c3d4e5f6a7b8..." },
  { id: "NT-20250422004", assetName: "环境监测数据", type: "授权存证", status: "success", txHash: "0x6b5d2f...a1e7c9", operator: "赵六", time: "2025-04-22 11:20:56", blockHeight: 4285678, dataHash: "sha256:d4e5f6a7b8c9..." },
  { id: "NT-20250422005", assetName: "教育资源数据集", type: "数据存证", status: "success", txHash: "0x5c4e1a...09f6b8", operator: "张三", time: "2025-04-22 10:05:21", blockHeight: 4285665, dataHash: "sha256:e5f6a7b8c9d0..." },
  { id: "NT-20250422006", assetName: "金融风控数据", type: "合约存证", status: "success", txHash: "0x4d3f09...e8a5c7", operator: "李四", time: "2025-04-22 09:48:12", blockHeight: 4285659, dataHash: "sha256:f6a7b8c9d0e1..." },
  { id: "NT-20250422007", assetName: "城市人口数据", type: "流转存证", status: "failed", txHash: "-", operator: "王五", time: "2025-04-22 08:30:45", blockHeight: 0, dataHash: "sha256:a7b8c9d0e1f2..." },
  { id: "NT-20250422008", assetName: "工商注册信息", type: "数据存证", status: "success", txHash: "0x3e2e8f...d7b4a6", operator: "赵六", time: "2025-04-22 07:15:30", blockHeight: 4285642, dataHash: "sha256:b8c9d0e1f2a3..." },
  { id: "NT-20250422009", assetName: "气象观测数据", type: "授权存证", status: "success", txHash: "0x2f1d7e...c6a3b5", operator: "张三", time: "2025-04-21 22:48:56", blockHeight: 4285580, dataHash: "sha256:c9d0e1f2a3b4..." },
  { id: "NT-20250422010", assetName: "物流轨迹数据", type: "数据存证", status: "pending", txHash: "-", operator: "李四", time: "2025-04-21 20:12:33", blockHeight: 0, dataHash: "sha256:d0e1f2a3b4c5..." },
];

const initialTemplates: NotaryTemplate[] = [
  { id: "TPL-001", name: "标准存证证明", type: "存证证明", description: "通用数据存证证明文件模板", usageCount: 128, status: "active", content: "兹证明数据资产 {assetName}（编号：{id}）已于 {time} 完成区块链存证，区块高度：{blockHeight}，交易哈希：{txHash}。" },
  { id: "TPL-002", name: "数据完整性证明", type: "数据完整性证明", description: "证明数据未被篡改的专用模板", usageCount: 56, status: "active", content: "兹证明数据资产 {assetName}（编号：{id}）的数据哈希值为 {dataHash}，经区块链验证，数据完整性得以确认。" },
  { id: "TPL-003", name: "时间戳证明", type: "时间戳证明", description: "区块链时间戳证明文件模板", usageCount: 89, status: "active", content: "兹证明数据资产 {assetName}（编号：{id}）于 {time} 获得区块链时间戳认证，交易哈希：{txHash}。" },
  { id: "TPL-004", name: "授权存证证明", type: "授权存证", description: "数据授权存证专用模板", usageCount: 34, status: "inactive", content: "兹证明数据资产 {assetName}（编号：{id}）的授权信息已完成区块链存证。" },
];

const dialogFields: FieldConfig[] = [
  { key: "id", label: "存证编号", type: "text", required: true },
  { key: "assetName", label: "资产名称", type: "text", required: true },
  {
    key: "type",
    label: "存证类型",
    type: "select",
    required: true,
    options: notaryTypes.filter((t) => t !== "全部").map((t) => ({ label: t, value: t })),
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "存证成功", value: "success" },
      { label: "存证中", value: "pending" },
      { label: "存证失败", value: "failed" },
    ],
  },
  { key: "txHash", label: "交易哈希", type: "text", placeholder: "0x... 或 -" },
  { key: "operator", label: "操作人", type: "text", required: true },
  { key: "time", label: "时间", type: "text", required: true, placeholder: "YYYY-MM-DD HH:mm:ss" },
  { key: "blockHeight", label: "区块高度", type: "number", placeholder: "0" },
  { key: "dataHash", label: "数据哈希", type: "text", placeholder: "sha256:..." },
];

const detailFields = [
  { key: "id", label: "存证编号" },
  { key: "assetName", label: "资产名称" },
  { key: "type", label: "存证类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "txHash", label: "交易哈希" },
  { key: "operator", label: "操作人" },
  { key: "blockHeight", label: "区块高度" },
  { key: "dataHash", label: "数据哈希" },
  { key: "time", label: "存证时间" },
];

/* ─── Helpers ─── */
function generateId() {
  return Date.now().toString(36).toUpperCase();
}

function generateHash() {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function generateMerklePath(recordHash: string): MerkleNode[] {
  const levels = 4;
  const path: MerkleNode[] = [];
  let currentHash = recordHash;
  for (let i = 0; i < levels; i++) {
    const sibling = generateHash();
    const direction = Math.random() > 0.5 ? "left" : "right";
    path.push({ hash: currentHash, direction, sibling });
    currentHash = generateHash();
  }
  path.push({ hash: currentHash });
  return path;
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    success: { text: "存证成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    pending: { text: "存证中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    failed: { text: "存证失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>
      {c.text}
    </span>
  );
}

/* ─── Hash Verification Dialog ─── */
function HashVerifyDialog({ open, onOpenChange, records }: { open: boolean; onOpenChange: (o: boolean) => void; records: NotaryRecord[] }) {
  const [inputData, setInputData] = useState("");
  const [computedHash, setComputedHash] = useState("");
  const [compareResult, setCompareResult] = useState<"match" | "mismatch" | null>(null);
  const [matchedRecord, setMatchedRecord] = useState<NotaryRecord | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const handleCompute = () => {
    if (!inputData.trim()) return;
    setIsComputing(true);
    setTimeout(() => {
      const hash = "sha256:" + generateHash().slice(2, 18) + "...";
      setComputedHash(hash);
      const match = records.find((r) => r.status === "success" && Math.random() > 0.5);
      if (match) {
        setCompareResult("match");
        setMatchedRecord(match);
      } else {
        setCompareResult("mismatch");
        setMatchedRecord(null);
      }
      setIsComputing(false);
    }, 800);
  };

  const handleReset = () => {
    setInputData("");
    setComputedHash("");
    setCompareResult(null);
    setMatchedRecord(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            哈希校验
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">原始数据或资产ID</Label>
            <Textarea
              placeholder="粘贴原始数据或输入资产ID..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="mt-1.5 min-h-[100px]"
            />
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="text-xs" disabled>
                <Upload className="w-3.5 h-3.5 mr-1" />
                上传文件 (模拟)
              </Button>
              <span className="text-xs text-slate-400">支持粘贴文本或上传文件</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCompute} disabled={!inputData.trim() || isComputing} className="flex-1">
              {isComputing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}
              计算哈希
            </Button>
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>

          {computedHash && (
            <Card className="border-dashed">
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">计算哈希:</span>
                  <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{computedHash}</code>
                </div>

                {compareResult === "match" && matchedRecord && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">哈希一致 - 数据验证通过</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        <span className="text-slate-500">区块高度:</span>
                        <div className="font-mono font-medium">{matchedRecord.blockHeight}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        <span className="text-slate-500">交易哈希:</span>
                        <div className="font-mono">{matchedRecord.txHash}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded col-span-2">
                        <span className="text-slate-500">存证时间:</span>
                        <div className="font-medium">{matchedRecord.time}</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium mb-1">
                        <TreePine className="w-4 h-4" />
                        Merkle 证明
                      </div>
                      <p className="text-blue-600 dark:text-blue-300">
                        该记录包含完整的 Merkle 证明路径，可从数据哈希验证至 Merkle 根节点。
                      </p>
                    </div>
                  </div>
                )}

                {compareResult === "mismatch" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">哈希不一致 - 数据可能已被篡改</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">输入哈希:</span>
                        <code className="font-mono text-red-600">{computedHash}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">链上哈希:</span>
                        <code className="font-mono text-emerald-600">sha256:{generateHash().slice(2, 18)}...</code>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Merkle Proof Tab ─── */
function MerkleProofTab({ record }: { record: NotaryRecord }) {
  const [path, setPath] = useState<MerkleNode[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPath(generateMerklePath(record.dataHash));
    setVerified(false);
  }, [record]);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  const handleExport = () => {
    const proofData = {
      assetId: record.id,
      dataHash: record.dataHash,
      merkleRoot: path[path.length - 1]?.hash,
      path: path.slice(0, -1).map((node) => ({
        hash: node.hash,
        direction: node.direction,
        siblingHash: node.sibling,
      })),
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merkle-proof-${record.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <TreePine className="w-4 h-4 text-primary-600" />
          Merkle 证明路径
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifying}>
            {verifying ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1" />}
            验证证明
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="w-3.5 h-3.5 mr-1" />
            导出 JSON
          </Button>
        </div>
      </div>

      {verified && (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>验证成功：Merkle 路径有效，数据哈希可追溯到根节点</span>
        </div>
      )}

      <div className="space-y-0">
        {path.map((node, index) => (
          <div key={index} className="relative">
            {index > 0 && (
              <div className="absolute left-6 -top-4 w-px h-4 bg-slate-300 dark:bg-slate-600" />
            )}
            <div className="flex items-start gap-3 py-2">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                index === path.length - 1
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {index === path.length - 1 ? "Root" : `L${index + 1}`}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate">{node.hash}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(node.hash);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-slate-400 hover:text-slate-600 shrink-0"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                {node.direction && node.sibling && (
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {node.direction === "left" ? "左节点" : "右节点"}
                    </Badge>
                    <span className="text-slate-500">兄弟节点:</span>
                    <code className="font-mono text-slate-600 dark:text-slate-400 truncate">{node.sibling}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Certificate Dialog ─── */
function CertificateDialog({ open, onOpenChange, record, templates }: { open: boolean; onOpenChange: (o: boolean) => void; record: NotaryRecord | null; templates: NotaryTemplate[] }) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (open && templates.length > 0) {
      setSelectedTemplate(templates[0].id);
      setPreview(false);
    }
  }, [open, templates]);

  const template = templates.find((t) => t.id === selectedTemplate);

  const getCertificateContent = () => {
    if (!template || !record) return "";
    return template.content
      .replace(/{assetName}/g, record.assetName)
      .replace(/{id}/g, record.id)
      .replace(/{time}/g, record.time)
      .replace(/{blockHeight}/g, record.blockHeight.toString())
      .replace(/{txHash}/g, record.txHash)
      .replace(/{dataHash}/g, record.dataHash);
  };

  const handleDownload = () => {
    const certId = "CERT-" + generateId();
    const content = `
区块链存证公证书
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

证书编号: ${certId}
签发机构: 数据资产公证中心
签发时间: ${new Date().toLocaleString()}

${getCertificateContent()}

数据哈希: ${record?.dataHash}
区块高度: ${record?.blockHeight}
交易哈希: ${record?.txHash}

本证书证明上述数据资产已在区块链上完成存证，具有不可篡改性和可追溯性。

[公证处电子签章]
防伪验证码: ${generateHash().slice(0, 16)}
    `;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${record?.id}-${certId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            生成公证书
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">选择模板</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.filter((t) => t.status === "active").map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              <Eye className="w-4 h-4 mr-2" />
              {preview ? "隐藏预览" : "预览证书"}
            </Button>
            <Button onClick={handleDownload}>
              <FileDown className="w-4 h-4 mr-2" />
              下载证书 (模拟 PDF)
            </Button>
          </div>

          {preview && template && (
            <Card className="border-dashed bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Stamp className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">区块链存证公证书</CardTitle>
                      <p className="text-xs text-slate-500">数据资产公证中心</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">正式</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">证书编号:</span>
                    <div className="font-mono font-medium">CERT-{generateId().slice(0, 8)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">签发时间:</span>
                    <div className="font-medium">{new Date().toLocaleString()}</div>
                  </div>
                </div>
                <Separator />
                <p className="text-sm leading-relaxed">{getCertificateContent()}</p>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">数据哈希:</span>
                    <code className="block font-mono text-[10px] mt-0.5">{record.dataHash}</code>
                  </div>
                  <div>
                    <span className="text-slate-500">交易哈希:</span>
                    <code className="block font-mono text-[10px] mt-0.5">{record.txHash}</code>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    本证书具有法律效力
                  </div>
                  <div className="text-xs text-slate-400">防伪码: {generateHash().slice(0, 12)}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Certificate Verify Dialog ─── */
function CertificateVerifyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<"valid" | "invalid" | null>(null);
  const [checking, setChecking] = useState(false);

  const handleVerify = () => {
    if (!certId.trim()) return;
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setResult(certId.length > 10 && Math.random() > 0.3 ? "valid" : "invalid");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            验证证书真伪
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">证书编号</Label>
            <Input
              placeholder="输入证书编号..."
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button onClick={handleVerify} disabled={!certId.trim() || checking} className="w-full">
            {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            验证
          </Button>
          {result === "valid" && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <div className="font-medium">证书有效</div>
                <div className="text-xs text-emerald-600/80">该证书经区块链验证为真实有效</div>
              </div>
            </div>
          )}
          {result === "invalid" && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <XCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">证书无效</div>
                <div className="text-xs text-red-600/80">未找到该证书记录，请检查编号是否正确</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Batch Notarization Dialog ─── */
function BatchNotaryDialog({ open, onOpenChange, records }: { open: boolean; onOpenChange: (o: boolean) => void; records: NotaryRecord[] }) {
  const [assetIds, setAssetIds] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ id: string; status: "success" | "failed"; txHash: string; notaryId: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleStart = () => {
    const ids = assetIds.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    setRunning(true);
    setProgress(0);
    setResults([]);
    setShowResults(false);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress(Math.round((current / ids.length) * 100));
      const status = Math.random() > 0.2 ? "success" : "failed";
      setResults((prev) => [
        ...prev,
        {
          id: ids[current - 1],
          status,
          txHash: status === "success" ? generateHash() : "-",
          notaryId: "NT-" + generateId().slice(0, 8).toUpperCase(),
        },
      ]);
      if (current >= ids.length) {
        clearInterval(interval);
        setRunning(false);
        setShowResults(true);
      }
    }, 400);
  };

  const handleDownload = () => {
    const csv = [
      "资产ID,公证编号,交易哈希,状态",
      ...results.map((r) => `${r.id},${r.notaryId},${r.txHash},${r.status === "success" ? "成功" : "失败"}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-notary-${generateId().slice(0, 6)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            批量公证
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!running && !showResults && (
            <>
              <div>
                <Label className="text-sm">资产ID列表</Label>
                <Textarea
                  placeholder="输入资产ID，用逗号或换行分隔...&#10;例: NT-20250422001, NT-20250422002"
                  value={assetIds}
                  onChange={(e) => setAssetIds(e.target.value)}
                  className="mt-1.5 min-h-[120px]"
                />
                <p className="text-xs text-slate-500 mt-1">支持逗号或换行分隔，每次最多处理 50 条</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  上传 CSV (模拟)
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  上传 Excel (模拟)
                </Button>
              </div>
              <Button onClick={handleStart} disabled={!assetIds.trim()} className="w-full">
                开始批量公证
              </Button>
            </>
          )}

          {running && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span>处理进度</span>
                <span className="text-slate-500">{progress}%</span>
              </div>
              <Progress value={progress} />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="text-lg font-bold">{results.length}</div>
                  <div className="text-xs text-slate-500">已处理</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">{results.filter((r) => r.status === "success").length}</div>
                  <div className="text-xs text-emerald-600/80">成功</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{results.filter((r) => r.status === "failed").length}</div>
                  <div className="text-xs text-red-600/80">失败</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 text-center">
                当前处理: {results.length > 0 ? results[results.length - 1].id : "-"}
              </div>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="text-lg font-bold">{results.length}</div>
                  <div className="text-xs text-slate-500">总数</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">{results.filter((r) => r.status === "success").length}</div>
                  <div className="text-xs text-emerald-600/80">成功</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{results.filter((r) => r.status === "failed").length}</div>
                  <div className="text-xs text-red-600/80">失败</div>
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3">资产ID</th>
                      <th className="text-left py-2 px-3">公证编号</th>
                      <th className="text-left py-2 px-3">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="py-2 px-3 font-mono">{r.id}</td>
                        <td className="py-2 px-3 font-mono">{r.notaryId}</td>
                        <td className="py-2 px-3">
                          {r.status === "success" ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 成功
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> 失败
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  下载结果 CSV
                </Button>
                <Button variant="outline" onClick={() => { setShowResults(false); setAssetIds(""); setResults([]); }}>
                  再次批量公证
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Template Management ─── */
function TemplateManagement({ templates, onTemplatesChange }: { templates: NotaryTemplate[]; onTemplatesChange: (t: NotaryTemplate[]) => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingTemplate, setEditingTemplate] = useState<NotaryTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NotaryTemplate | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");

  const openCreate = () => {
    setDialogMode("create");
    setEditingTemplate(null);
    setFormName("");
    setFormType("存证证明");
    setFormDesc("");
    setFormContent("");
    setDialogOpen(true);
  };

  const openEdit = (t: NotaryTemplate) => {
    setDialogMode("edit");
    setEditingTemplate(t);
    setFormName(t.name);
    setFormType(t.type);
    setFormDesc(t.description);
    setFormContent(t.content);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (dialogMode === "create") {
      const newTemplate: NotaryTemplate = {
        id: "TPL-" + generateId().slice(0, 6).toUpperCase(),
        name: formName,
        type: formType,
        description: formDesc,
        usageCount: 0,
        status: "active",
        content: formContent,
      };
      onTemplatesChange([...templates, newTemplate]);
    } else if (editingTemplate) {
      onTemplatesChange(templates.map((t) => (t.id === editingTemplate.id ? { ...t, name: formName, type: formType, description: formDesc, content: formContent } : t)));
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    onTemplatesChange(templates.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    onTemplatesChange(templates.map((t) => (t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">模板管理</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">管理存证公证书模板</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          新建模板
        </Button>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                <th className="text-left py-3 px-4 font-medium text-xs">模板名称</th>
                <th className="text-left py-3 px-4 font-medium text-xs">类型</th>
                <th className="text-left py-3 px-4 font-medium text-xs">描述</th>
                <th className="text-left py-3 px-4 font-medium text-xs">使用次数</th>
                <th className="text-left py-3 px-4 font-medium text-xs">状态</th>
                <th className="text-center py-3 px-4 font-medium text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{t.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">{t.type}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs max-w-[200px] truncate">{t.description}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{t.usageCount}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(t.id)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                        t.status === "active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {t.status === "active" ? "启用" : "禁用"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setPreviewTemplate(t)} className="text-xs text-primary-600 hover:text-primary-700">
                        预览
                      </button>
                      <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:text-blue-700">
                        编辑
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:text-red-700">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template CRUD Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "新建模板" : "编辑模板"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>模板名称</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>类型</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="存证证明">存证证明</SelectItem>
                  <SelectItem value="数据完整性证明">数据完整性证明</SelectItem>
                  <SelectItem value="时间戳证明">时间戳证明</SelectItem>
                  <SelectItem value="授权存证">授权存证</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>描述</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>模板内容</Label>
              <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} className="mt-1.5 min-h-[120px]" placeholder="可用占位符: {assetName}, {id}, {time}, {blockHeight}, {txHash}, {dataHash}" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || !formContent.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>模板预览: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">类型:</span>
                <div>{previewTemplate?.type}</div>
              </div>
              <div>
                <span className="text-slate-500">使用次数:</span>
                <div>{previewTemplate?.usageCount}</div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
              {previewTemplate?.content}
            </div>
            <div className="text-xs text-slate-500">
              可用占位符: {"{assetName}"}, {"{id}"}, {"{time}"}, {"{blockHeight}"}, {"{txHash}"}, {"{dataHash}"}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainNotary() {
  const [records, setRecords] = useState<NotaryRecord[]>(initialRecords);
  const [templates, setTemplates] = useState<NotaryTemplate[]>(initialTemplates);
  const [selectedType, setSelectedType] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("records");
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogData, setDialogData] = useState<NotaryRecord | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<NotaryRecord | null>(null);

  const [hashVerifyOpen, setHashVerifyOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [certRecord, setCertRecord] = useState<NotaryRecord | null>(null);
  const [certVerifyOpen, setCertVerifyOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, selectedType, selectedStatus]);

  const filtered = records.filter((r) => {
    if (selectedType !== "全部" && r.type !== selectedType) return false;
    if (selectedStatus !== "全部") {
      const s = selectedStatus === "存证成功" ? "success" : selectedStatus === "存证中" ? "pending" : "failed";
      if (r.status !== s) return false;
    }
    if (search && !r.assetName.includes(search) && !r.id.includes(search)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setDialogMode("create");
    setDialogData(null);
    setDialogOpen(true);
  };

  const openEdit = (record: NotaryRecord) => {
    setDialogMode("edit");
    setDialogData(record);
    setDialogOpen(true);
  };

  const openDelete = (record: NotaryRecord) => {
    setDialogMode("delete");
    setDialogData(record);
    setDialogOpen(true);
  };

  const openView = (record: NotaryRecord) => {
    setDrawerRecord(record);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const processed: NotaryRecord = {
      ...(data as NotaryRecord),
      blockHeight: Number(data.blockHeight) || 0,
    };
    if (dialogMode === "create") {
      setRecords([processed, ...records]);
    } else if (dialogMode === "edit" && dialogData) {
      setRecords(records.map((r) => (r.id === dialogData.id ? { ...processed, id: dialogData.id } : r)));
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (dialogData) {
      setRecords(records.filter((r) => r.id !== dialogData.id));
    }
    setDialogOpen(false);
  };

  const openCertificate = (record: NotaryRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setCertRecord(record);
    setCertDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="records" className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            存证记录
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            模板管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4 mt-0">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">存证管理</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">数据资产上链存证、验证与查询</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setHashVerifyOpen(true)}>
                <FileSearch className="w-3.5 h-3.5 mr-1.5" />
                哈希校验
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBatchDialogOpen(true)}>
                <Package className="w-3.5 h-3.5 mr-1.5" />
                批量公证
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCertVerifyOpen(true)}>
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                验证证书
              </Button>
              <Button size="sm" onClick={openCreate}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                新建存证
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className={cn(
            "rounded-xl border p-4",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索存证编号、资产名称..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-3 py-2 rounded-lg border text-sm",
                    "bg-white border-slate-200 text-slate-800",
                    "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  )}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">类型:</span>
                {notaryTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs transition-colors",
                      selectedType === t
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">状态:</span>
                {notaryStatus.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs transition-colors",
                      selectedStatus === s
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 dark:border-[#334155] dark:text-slate-400 dark:hover:bg-[#273548]">
                <Download className="w-3.5 h-3.5" />
                导出
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={cn(
            "rounded-xl border overflow-hidden",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                    <th className="text-left py-3 px-4 font-medium text-xs">存证编号</th>
                    <th className="text-left py-3 px-4 font-medium text-xs">资产名称</th>
                    <th className="text-left py-3 px-4 font-medium text-xs">类型</th>
                    <th className="text-left py-3 px-4 font-medium text-xs">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-xs">交易哈希</th>
                    <th className="text-left py-3 px-4 font-medium text-xs">操作人</th>
                    <th className="text-right py-3 px-4 font-medium text-xs">时间</th>
                    <th className="text-center py-3 px-4 font-medium text-xs">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors cursor-pointer"
                      onClick={() => openView(record)}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">{record.id}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{record.assetName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {record.type}
                        </span>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={record.status} /></td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{record.txHash}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{record.operator}</td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500">{record.time}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openView(record); }}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            查看
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(record); }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            编辑
                          </button>
                          <button
                            onClick={(e) => openCertificate(record, e)}
                            className="text-xs text-amber-600 hover:text-amber-700"
                          >
                            证书
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDelete(record); }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#334155]">
              <span className="text-xs text-slate-500">
                共 {filtered.length} 条记录
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 dark:border-[#334155]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
                  第 {page} / {totalPages} 页
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 dark:border-[#334155]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplateManagement templates={templates} onTemplatesChange={setTemplates} />
        </TabsContent>
      </Tabs>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="存证"
        fields={dialogFields}
        data={dialogData || undefined}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer with Merkle Proof Tab */}
      {drawerRecord && (
        <DetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="存证详情"
          data={drawerRecord}
          fields={detailFields}
          onEdit={() => {
            setDrawerOpen(false);
            openEdit(drawerRecord);
          }}
          onDelete={() => {
            setDrawerOpen(false);
            openDelete(drawerRecord);
          }}
        >
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Tabs defaultValue="merkle">
              <TabsList className="w-full">
                <TabsTrigger value="merkle" className="flex-1">
                  <TreePine className="w-3.5 h-3.5 mr-1.5" />
                  Merkle证明
                </TabsTrigger>
                <TabsTrigger value="cert" className="flex-1">
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  公证书
                </TabsTrigger>
              </TabsList>
              <TabsContent value="merkle" className="mt-2">
                <MerkleProofTab record={drawerRecord} />
              </TabsContent>
              <TabsContent value="cert" className="mt-2">
                <div className="space-y-3 py-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">为该存证记录生成区块链公证书</p>
                  <Button onClick={() => { setDrawerOpen(false); setCertRecord(drawerRecord); setCertDialogOpen(true); }}>
                    <Award className="w-4 h-4 mr-2" />
                    生成公证书
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DetailDrawer>
      )}

      {/* Hash Verify Dialog */}
      <HashVerifyDialog open={hashVerifyOpen} onOpenChange={setHashVerifyOpen} records={records} />

      {/* Certificate Dialog */}
      <CertificateDialog open={certDialogOpen} onOpenChange={setCertDialogOpen} record={certRecord} templates={templates} />

      {/* Certificate Verify Dialog */}
      <CertificateVerifyDialog open={certVerifyOpen} onOpenChange={setCertVerifyOpen} />

      {/* Batch Notarization Dialog */}
      <BatchNotaryDialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen} records={records} />
    </div>
  );
}
