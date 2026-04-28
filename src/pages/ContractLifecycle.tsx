import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  ChevronRight, Search, FileCode, Rocket, Beaker, ShoppingCart, GitBranch, Eye, CheckCircle2, XCircle,
  Clock, ArrowRight, RotateCw, Download, Tag, GitCommit, Users, Code, Terminal, Globe,
  Plus, Pencil, Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface ContractStage {
  stage: string;
  name: string;
  status: string;
  time: string;
  actor: string;
  detail: string;
}

interface ContractVersion {
  version: string;
  status: string;
  deployTime: string;
  changes: string;
  audit: string;
}

interface ContractDeploy {
  id: string;
  network: string;
  channel: string;
  status: string;
  time: string;
}

interface ContractTest {
  id: string;
  name: string;
  status: string;
  time: string;
}

interface Contract {
  id: string;
  name: string;
  currentStage: string;
  stages: ContractStage[];
  versions: ContractVersion[];
  deploys: ContractDeploy[];
  tests: ContractTest[];
}

/* ─── Initial Data ─── */
const initialContracts: Contract[] = [
  {
    id: "SC-001",
    name: "数据资产存证合约",
    currentStage: "market",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-01-15", actor: "合约开发组", detail: "完成基础存证功能开发，支持单条/批量上链" },
      { stage: "test", name: "合约测试", status: "completed", time: "2025-01-20", actor: "QA团队", detail: "6个测试用例全部通过，覆盖率92%" },
      { stage: "deploy", name: "安装部署", status: "completed", time: "2025-02-01", actor: "运维组", detail: "部署到金融联盟链3个共识节点，部署成功" },
      { stage: "audit", name: "安全审计", status: "completed", time: "2025-02-10", actor: "安全审计组", detail: "通过第三方安全审计，无高危漏洞" },
      { stage: "market", name: "市场发布", status: "current", time: "2025-02-15", actor: "产品组", detail: "已上架智能合约市场，下载量12,560次" },
    ],
    versions: [
      { version: "v2.0.0", status: "current", deployTime: "2025-04-15", changes: "新增批量存证接口，优化gas消耗", audit: "已通过" },
      { version: "v1.2.0", status: "deprecated", deployTime: "2025-02-10", changes: "修复重入漏洞", audit: "已通过" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-08-01", changes: "初始版本", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-001", network: "金融联盟链", channel: "金融交易通道", status: "success", time: "2025-04-15" },
      { id: "DP-002", network: "政务数据链", channel: "政务数据共享通道", status: "success", time: "2025-03-20" },
    ],
    tests: [
      { id: "TC-001", name: "正常存证", status: "passed", time: "0.23s" },
      { id: "TC-002", name: "重复存证拒绝", status: "passed", time: "0.18s" },
      { id: "TC-003", name: "批量存证", status: "passed", time: "1.25s" },
    ],
  },
  {
    id: "SC-002",
    name: "数据授权合约",
    currentStage: "deploy",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-03-01", actor: "合约开发组", detail: "支持多级授权与期限管理" },
      { stage: "test", name: "合约测试", status: "completed", time: "2025-03-10", actor: "QA团队", detail: "8个测试用例，覆盖率88%" },
      { stage: "deploy", name: "安装部署", status: "current", time: "2025-03-20", actor: "运维组", detail: "部署到政务数据链，等待确认" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待安排审计时间" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待审计通过后上架" },
    ],
    versions: [
      { version: "v1.1.0", status: "current", deployTime: "2025-03-20", changes: "支持多级授权与委托", audit: "已通过" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-09-15", changes: "基础授权功能", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-003", network: "政务数据链", channel: "政务数据共享通道", status: "success", time: "2025-03-20" },
    ],
    tests: [
      { id: "TC-004", name: "正常授权", status: "passed", time: "0.31s" },
      { id: "TC-005", name: "越权访问", status: "failed", time: "0.15s" },
    ],
  },
  {
    id: "SC-003",
    name: "跨链资产桥合约",
    currentStage: "test",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-02-01", actor: "合约开发组", detail: "支持HTLC协议的跨链资产锁定与释放" },
      { stage: "test", name: "合约测试", status: "current", time: "2025-04-01", actor: "QA团队", detail: "集成测试中，跨链延迟偏高" },
      { stage: "deploy", name: "安装部署", status: "pending", time: "-", actor: "运维组", detail: "等待测试通过后部署" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待部署完成后审计" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待全部通过后上架" },
    ],
    versions: [
      { version: "v1.2.0", status: "current", deployTime: "2025-04-01", changes: "支持跨链溯源查询", audit: "已通过" },
    ],
    deploys: [],
    tests: [
      { id: "TC-006", name: "锁定释放", status: "passed", time: "2.56s" },
      { id: "TC-007", name: "超时回退", status: "running", time: "-" },
    ],
  },
  {
    id: "SC-004",
    name: "供应链金融合约",
    currentStage: "audit",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-01-10", actor: "合约开发组", detail: "支持应收账款融资与兑付" },
      { stage: "test", name: "合约测试", status: "completed", time: "2025-01-25", actor: "QA团队", detail: "10个测试用例，覆盖率95%" },
      { stage: "deploy", name: "安装部署", status: "completed", time: "2025-02-05", actor: "运维组", detail: "部署到供应链金融链，状态正常" },
      { stage: "audit", name: "安全审计", status: "current", time: "2025-02-20", actor: "安全审计组", detail: "第三方安全审计进行中" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待审计通过后上架" },
    ],
    versions: [
      { version: "v1.0.0", status: "current", deployTime: "2025-02-05", changes: "初始版本，支持应收账款", audit: "审计中" },
    ],
    deploys: [
      { id: "DP-004", network: "供应链金融链", channel: "供应链交易通道", status: "success", time: "2025-02-05" },
    ],
    tests: [
      { id: "TC-008", name: "融资申请", status: "passed", time: "0.45s" },
      { id: "TC-009", name: "兑付流程", status: "passed", time: "0.38s" },
      { id: "TC-010", name: "逾期处理", status: "passed", time: "0.52s" },
    ],
  },
  {
    id: "SC-005",
    name: "医疗数据共享合约",
    currentStage: "dev",
    stages: [
      { stage: "dev", name: "合约开发", status: "current", time: "2025-04-01", actor: "合约开发组", detail: "支持患者数据授权与脱敏共享" },
      { stage: "test", name: "合约测试", status: "pending", time: "-", actor: "QA团队", detail: "待开发完成后测试" },
      { stage: "deploy", name: "安装部署", status: "pending", time: "-", actor: "运维组", detail: "等待测试通过后部署" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待部署完成后审计" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待全部通过后上架" },
    ],
    versions: [
      { version: "v0.1.0", status: "current", deployTime: "2025-04-01", changes: "原型版本", audit: "未审计" },
    ],
    deploys: [],
    tests: [
      { id: "TC-011", name: "数据授权", status: "running", time: "-" },
      { id: "TC-012", name: "脱敏验证", status: "pending", time: "-" },
    ],
  },
  {
    id: "SC-006",
    name: "政务审批合约",
    currentStage: "market",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2024-10-01", actor: "合约开发组", detail: "支持多级审批与留痕" },
      { stage: "test", name: "合约测试", status: "completed", time: "2024-10-15", actor: "QA团队", detail: "12个测试用例，覆盖率90%" },
      { stage: "deploy", name: "安装部署", status: "completed", time: "2024-11-01", actor: "运维组", detail: "部署到政务数据链，状态正常" },
      { stage: "audit", name: "安全审计", status: "completed", time: "2024-11-15", actor: "安全审计组", detail: "通过安全审计" },
      { stage: "market", name: "市场发布", status: "current", time: "2024-12-01", actor: "产品组", detail: "已上架智能合约市场" },
    ],
    versions: [
      { version: "v2.1.0", status: "current", deployTime: "2025-01-10", changes: "优化审批流程", audit: "已通过" },
      { version: "v2.0.0", status: "deprecated", deployTime: "2024-11-01", changes: "支持多级审批", audit: "已通过" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-06-01", changes: "初始版本", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-005", network: "政务数据链", channel: "政务审批通道", status: "success", time: "2025-01-10" },
      { id: "DP-006", network: "政务数据链", channel: "政务数据共享通道", status: "success", time: "2024-11-01" },
    ],
    tests: [
      { id: "TC-013", name: "正常审批", status: "passed", time: "0.28s" },
      { id: "TC-014", name: "驳回流程", status: "passed", time: "0.22s" },
      { id: "TC-015", name: "多级审批", status: "passed", time: "0.55s" },
    ],
  },
  {
    id: "SC-007",
    name: "版权登记合约",
    currentStage: "deploy",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-02-15", actor: "合约开发组", detail: "支持版权登记与转让" },
      { stage: "test", name: "合约测试", status: "completed", time: "2025-02-28", actor: "QA团队", detail: "7个测试用例，覆盖率93%" },
      { stage: "deploy", name: "安装部署", status: "current", time: "2025-03-10", actor: "运维组", detail: "部署到存证公证链，等待确认" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待安排审计时间" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待审计通过后上架" },
    ],
    versions: [
      { version: "v1.0.0", status: "current", deployTime: "2025-03-10", changes: "初始版本，支持版权登记", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-007", network: "存证公证链", channel: "版权登记通道", status: "success", time: "2025-03-10" },
    ],
    tests: [
      { id: "TC-016", name: "版权登记", status: "passed", time: "0.33s" },
      { id: "TC-017", name: "版权转让", status: "passed", time: "0.41s" },
    ],
  },
  {
    id: "SC-008",
    name: "碳排放核算合约",
    currentStage: "test",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-03-05", actor: "合约开发组", detail: "支持碳排放数据上链与核算" },
      { stage: "test", name: "合约测试", status: "current", time: "2025-04-10", actor: "QA团队", detail: "集成测试中，核算逻辑验证中" },
      { stage: "deploy", name: "安装部署", status: "pending", time: "-", actor: "运维组", detail: "等待测试通过后部署" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待部署完成后审计" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待全部通过后上架" },
    ],
    versions: [
      { version: "v0.9.0", status: "current", deployTime: "2025-04-10", changes: "测试版本", audit: "未审计" },
    ],
    deploys: [],
    tests: [
      { id: "TC-018", name: "数据上链", status: "passed", time: "0.29s" },
      { id: "TC-019", name: "核算验证", status: "running", time: "-" },
      { id: "TC-020", name: "异常数据", status: "pending", time: "-" },
    ],
  },
  {
    id: "SC-009",
    name: "物流追踪合约",
    currentStage: "audit",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2024-12-01", actor: "合约开发组", detail: "支持物流节点上链与溯源" },
      { stage: "test", name: "合约测试", status: "completed", time: "2024-12-15", actor: "QA团队", detail: "9个测试用例，覆盖率91%" },
      { stage: "deploy", name: "安装部署", status: "completed", time: "2025-01-05", actor: "运维组", detail: "部署到物流追溯链，状态正常" },
      { stage: "audit", name: "安全审计", status: "current", time: "2025-01-20", actor: "安全审计组", detail: "第三方安全审计进行中" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待审计通过后上架" },
    ],
    versions: [
      { version: "v1.0.0", status: "current", deployTime: "2025-01-05", changes: "初始版本，支持物流溯源", audit: "审计中" },
    ],
    deploys: [
      { id: "DP-008", network: "物流追溯链", channel: "物流追踪通道", status: "success", time: "2025-01-05" },
    ],
    tests: [
      { id: "TC-021", name: "节点上链", status: "passed", time: "0.35s" },
      { id: "TC-022", name: "溯源查询", status: "passed", time: "0.28s" },
    ],
  },
  {
    id: "SC-010",
    name: "公益捐赠合约",
    currentStage: "market",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2024-08-01", actor: "合约开发组", detail: "支持捐赠记录透明化与追溯" },
      { stage: "test", name: "合约测试", status: "completed", time: "2024-08-15", actor: "QA团队", detail: "5个测试用例，覆盖率89%" },
      { stage: "deploy", name: "安装部署", status: "completed", time: "2024-09-01", actor: "运维组", detail: "部署到公益捐赠链，状态正常" },
      { stage: "audit", name: "安全审计", status: "completed", time: "2024-09-15", actor: "安全审计组", detail: "通过安全审计" },
      { stage: "market", name: "市场发布", status: "current", time: "2024-10-01", actor: "产品组", detail: "已上架智能合约市场" },
    ],
    versions: [
      { version: "v1.2.0", status: "current", deployTime: "2025-02-01", changes: "增加捐赠报告生成", audit: "已通过" },
      { version: "v1.1.0", status: "deprecated", deployTime: "2024-10-01", changes: "优化查询性能", audit: "已通过" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-09-01", changes: "初始版本", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-009", network: "公益捐赠链", channel: "捐赠记录通道", status: "success", time: "2025-02-01" },
      { id: "DP-010", network: "公益捐赠链", channel: "捐赠查询通道", status: "success", time: "2024-10-01" },
    ],
    tests: [
      { id: "TC-023", name: "捐赠记录", status: "passed", time: "0.19s" },
      { id: "TC-024", name: "资金追溯", status: "passed", time: "0.25s" },
    ],
  },
];

const stageConfig: Record<string, { label: string; icon: typeof FileCode; color: string }> = {
  dev: { label: "开发", icon: Code, color: "bg-blue-500" },
  test: { label: "测试", icon: Beaker, color: "bg-amber-500" },
  deploy: { label: "部署", icon: Rocket, color: "bg-indigo-500" },
  audit: { label: "审计", icon: CheckCircle2, color: "bg-purple-500" },
  market: { label: "市场", icon: ShoppingCart, color: "bg-emerald-500" },
};

/* ─── Fields ─── */
const contractFields: FieldConfig[] = [
  { key: "id", label: "合约编号", type: "text", required: true },
  { key: "name", label: "合约名称", type: "text", required: true },
  { key: "currentStage", label: "当前阶段", type: "select", required: true, options: [
    { label: "开发", value: "dev" },
    { label: "测试", value: "test" },
    { label: "部署", value: "deploy" },
    { label: "审计", value: "audit" },
    { label: "市场", value: "market" },
  ]},
  { key: "stages", label: "阶段列表 (JSON)", type: "textarea", required: true, placeholder: '[{"stage":"dev","name":"合约开发","status":"completed","time":"2025-01-15","actor":"合约开发组","detail":"..."}]' },
  { key: "versions", label: "版本列表 (JSON)", type: "textarea", required: true, placeholder: '[{"version":"v1.0.0","status":"current","deployTime":"2025-01-01","changes":"...","audit":"已通过"}]' },
  { key: "deploys", label: "部署记录 (JSON)", type: "textarea", required: false, placeholder: '[{"id":"DP-001","network":"金融联盟链","channel":"金融交易通道","status":"success","time":"2025-04-15"}]' },
  { key: "tests", label: "测试记录 (JSON)", type: "textarea", required: false, placeholder: '[{"id":"TC-001","name":"正常存证","status":"passed","time":"0.23s"}]' },
];

const detailFields = [
  { key: "id", label: "合约编号", type: "text" as const },
  { key: "name", label: "合约名称", type: "text" as const },
  { key: "currentStage", label: "当前阶段", type: "badge" as const },
  { key: "stageCount", label: "阶段数量", type: "text" as const },
  { key: "versionCount", label: "版本数量", type: "text" as const },
  { key: "deployCount", label: "部署数量", type: "text" as const },
  { key: "testCount", label: "测试数量", type: "text" as const },
];

export default function ContractLifecycle() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  const filtered = contracts.filter((c) => c.name.includes(search) || c.id.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      id: "",
      name: "",
      currentStage: "dev",
      stages: JSON.stringify([
        { stage: "dev", name: "合约开发", status: "current", time: "-", actor: "", detail: "" },
      ], null, 2),
      versions: "[]",
      deploys: "[]",
      tests: "[]",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setDialogMode("edit");
    setDialogData({
      id: contract.id,
      name: contract.name,
      currentStage: contract.currentStage,
      stages: JSON.stringify(contract.stages, null, 2),
      versions: JSON.stringify(contract.versions, null, 2),
      deploys: JSON.stringify(contract.deploys, null, 2),
      tests: JSON.stringify(contract.tests, null, 2),
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
    let parsedStages: ContractStage[] = [];
    let parsedVersions: ContractVersion[] = [];
    let parsedDeploys: ContractDeploy[] = [];
    let parsedTests: ContractTest[] = [];

    try { parsedStages = JSON.parse(data.stages || "[]"); } catch { parsedStages = []; }
    try { parsedVersions = JSON.parse(data.versions || "[]"); } catch { parsedVersions = []; }
    try { parsedDeploys = JSON.parse(data.deploys || "[]"); } catch { parsedDeploys = []; }
    try { parsedTests = JSON.parse(data.tests || "[]"); } catch { parsedTests = []; }

    if (dialogMode === "create") {
      const newContract: Contract = {
        id: data.id,
        name: data.name,
        currentStage: data.currentStage,
        stages: parsedStages,
        versions: parsedVersions,
        deploys: parsedDeploys,
        tests: parsedTests,
      };
      setContracts(prev => [...prev, newContract]);
    } else if (dialogMode === "edit" && editingId) {
      setContracts(prev =>
        prev.map(c =>
          c.id === editingId
            ? {
                ...c,
                id: data.id,
                name: data.name,
                currentStage: data.currentStage,
                stages: parsedStages,
                versions: parsedVersions,
                deploys: parsedDeploys,
                tests: parsedTests,
              }
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

  const detailData = detailContract
    ? {
        id: detailContract.id,
        name: detailContract.name,
        currentStage: stageConfig[detailContract.currentStage]?.label || detailContract.currentStage,
        stageCount: detailContract.stages.length,
        versionCount: detailContract.versions.length,
        deployCount: detailContract.deploys.length,
        testCount: detailContract.tests.length,
      }
    : {};

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>区块链可信存证</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>合约生命周期</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">合约全生命周期视图</h1>
          <p className="text-sm text-gray-500 mt-1.5">追踪智能合约从开发→测试→部署→审计→市场的完整生命周期状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 新建合约
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FileCode className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">合约总数</p><p className="text-2xl font-bold">{contracts.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Code className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">开发中</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "dev").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Beaker className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">测试中</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "test").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Rocket className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">已部署</p><p className="text-2xl font-bold">{contracts.filter(c => ["deploy","audit","market"].includes(c.currentStage)).length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><ShoppingCart className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已上架</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "market").length}</p></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索合约名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((contract) => (
          <Card key={contract.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="font-medium text-gray-900">{contract.name}</span>
                  <span className="ml-2 font-mono text-xs text-gray-500">{contract.id}</span>
                </div>
                <Badge variant="outline">{stageConfig[contract.currentStage].label}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => openDetail(contract)}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(contract)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(contract)}><Trash className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {/* Lifecycle Pipeline */}
              <div className="flex items-center mb-5">
                {contract.stages.map((s, i, arr) => {
                  const cfg = stageConfig[s.stage];
                  const Icon = cfg.icon;
                  return (
                    <div key={s.stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white transition-all", s.status === "completed" ? cfg.color : s.status === "current" ? cfg.color + " animate-pulse" : "bg-gray-200 text-gray-400")}>
                          {s.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={cn("text-xs font-medium mt-1.5", s.status === "pending" ? "text-gray-400" : "text-gray-900")}>{s.name}</span>
                        <span className="text-[10px] text-gray-400">{s.time !== "-" ? s.time : "待定"}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex-1 h-0.5 mx-2 bg-gray-200 relative">
                          <div className={cn("absolute top-0 left-0 h-full transition-all", s.status === "completed" ? "bg-emerald-500 w-full" : "w-0")} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Current stage detail */}
              {contract.stages.find(s => s.status === "current") && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-700">当前阶段</span>
                    <span className="text-xs text-gray-600">{contract.stages.find(s => s.status === "current")?.detail}</span>
                  </div>
                  <div className="text-xs text-gray-500">负责人: {contract.stages.find(s => s.status === "current")?.actor}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Drawer with Tabs */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`合约详情 - ${detailContract?.name || ""}`}
        data={detailContract || {}}
        fields={detailFields}
        onEdit={() => { if (detailContract) handleEdit(detailContract); }}
        onDelete={() => { if (detailContract) handleDelete(detailContract); }}
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
    </div>
  );
}
