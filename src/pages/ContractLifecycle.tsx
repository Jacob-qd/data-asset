import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight, Search, FileCode, Rocket, Beaker, ShoppingCart, Eye, CheckCircle2, XCircle,
  Clock, ArrowRight, RotateCw, Download, Users, Code, Globe,
  Plus, Pencil, Trash, Upload, FileText, AlertTriangle, Settings,
  UserPlus, Bell, History, Play, ChevronLeft, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";

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

interface StageTransition {
  id: string;
  fromStage: string;
  toStage: string;
  reason: string;
  actor: string;
  time: string;
}

interface TransitionRule {
  id: string;
  fromStage: string;
  toStage: string;
  conditions: string[];
  allowedRoles: string[];
  autoAdvance: boolean;
  timeoutHours: number;
}

interface Stakeholder {
  id: string;
  stage: string;
  person: string;
  role: string;
  assignedAt: string;
  notifications: { time: string; message: string }[];
}

interface SLAConfig {
  stage: string;
  expectedHours: number;
}

interface AuditReport {
  id: string;
  filename: string;
  uploader: string;
  uploadedAt: string;
  status: string;
  content: string;
}

interface Contract {
  id: string;
  name: string;
  currentStage: string;
  stages: ContractStage[];
  versions: ContractVersion[];
  deploys: ContractDeploy[];
  tests: ContractTest[];
  transitions: StageTransition[];
  transitionRules: TransitionRule[];
  stakeholders: Stakeholder[];
  slaConfigs: SLAConfig[];
  auditReports: AuditReport[];
  auditOpinion: string;
}

/* ─── Helpers ─── */
const genId = () => Date.now().toString(36).toUpperCase();

const stageOrder = ["dev", "test", "deploy", "audit", "market"];

const getStageIndex = (stage: string) => stageOrder.indexOf(stage);

const getNextStage = (stage: string) => {
  const idx = getStageIndex(stage);
  return idx >= 0 && idx < stageOrder.length - 1 ? stageOrder[idx + 1] : null;
};

const getPrevStage = (stage: string) => {
  const idx = getStageIndex(stage);
  return idx > 0 ? stageOrder[idx - 1] : null;
};

const stageConfig: Record<string, { label: string; icon: typeof FileCode; color: string }> = {
  dev: { label: "开发", icon: Code, color: "bg-blue-500" },
  test: { label: "测试", icon: Beaker, color: "bg-amber-500" },
  deploy: { label: "部署", icon: Rocket, color: "bg-indigo-500" },
  audit: { label: "审计", icon: CheckCircle2, color: "bg-purple-500" },
  market: { label: "市场", icon: ShoppingCart, color: "bg-emerald-500" },
};

const defaultExitCriteria: Record<string, string[]> = {
  dev: ["代码审查通过", "单元测试通过", "文档已更新", "安全扫描无高危漏洞"],
  test: ["集成测试全部通过", "性能测试达标", "兼容性测试完成", "测试报告已提交"],
  deploy: ["部署脚本验证通过", "回滚方案已确认", "监控配置完成", "生产环境检查通过"],
  audit: ["第三方审计报告出具", "漏洞修复验证", "合规性检查通过", "审计意见已签署"],
  market: ["上架申请审批通过", "用户文档已发布", "定价策略已确认", "运营方案就绪"],
};

const defaultSLAConfigs: SLAConfig[] = [
  { stage: "dev", expectedHours: 240 },
  { stage: "test", expectedHours: 120 },
  { stage: "deploy", expectedHours: 48 },
  { stage: "audit", expectedHours: 168 },
  { stage: "market", expectedHours: 72 },
];

const getSLAStatus = (stage: ContractStage, expectedHours: number): "ontime" | "warning" | "overdue" | "neutral" => {
  if (stage.status === "pending" || stage.time === "-") return "neutral";
  const stageTime = new Date(stage.time);
  const now = new Date();
  const hoursElapsed = (now.getTime() - stageTime.getTime()) / (1000 * 60 * 60);
  if (hoursElapsed > expectedHours) return "overdue";
  if (hoursElapsed > expectedHours * 0.8) return "warning";
  return "ontime";
};

const formatHours = (hours: number) => {
  if (hours < 24) return `${hours}小时`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days}天`;
  return `${days}天${remainingHours}小时`;
};

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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2025-01-20 09:30" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试通过，准备部署", actor: "QA团队", time: "2025-02-01 14:00" },
      { id: genId(), fromStage: "deploy", toStage: "audit", reason: "部署成功，申请审计", actor: "运维组", time: "2025-02-10 10:15" },
      { id: genId(), fromStage: "audit", toStage: "market", reason: "审计通过，申请上架", actor: "安全审计组", time: "2025-02-15 11:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过", "单元测试通过"], allowedRoles: ["开发组长", "项目经理"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过", "性能测试达标"], allowedRoles: ["QA负责人", "项目经理"], autoAdvance: false, timeoutHours: 120 },
      { id: genId(), fromStage: "deploy", toStage: "audit", conditions: ["部署成功", "监控正常"], allowedRoles: ["运维组长"], autoAdvance: false, timeoutHours: 48 },
      { id: genId(), fromStage: "audit", toStage: "market", conditions: ["审计通过", "无高危漏洞"], allowedRoles: ["安全审计组", "项目经理"], autoAdvance: false, timeoutHours: 168 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "张三", role: "开发负责人", assignedAt: "2025-01-10", notifications: [{ time: "2025-01-10 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2025-01-18", notifications: [{ time: "2025-01-18 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2025-01-30", notifications: [{ time: "2025-01-30 10:00", message: "被指派为部署阶段负责人" }] },
      { id: genId(), stage: "audit", person: "赵六", role: "安全审计师", assignedAt: "2025-02-08", notifications: [{ time: "2025-02-08 16:00", message: "被指派为审计阶段负责人" }] },
      { id: genId(), stage: "market", person: "孙七", role: "产品经理", assignedAt: "2025-02-12", notifications: [{ time: "2025-02-12 11:00", message: "被指派为发布阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [
      { id: genId(), filename: "安全审计报告_SC-001_v1.pdf", uploader: "赵六", uploadedAt: "2025-02-10", status: "已通过", content: "本次安全审计对数据资产存证合约进行了全面审查，未发现高危漏洞。合约的访问控制机制完善，重入攻击防护到位。建议优化gas消耗。" },
    ],
    auditOpinion: "通过安全审计，无高危漏洞，建议优化gas消耗。",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2025-03-10 10:00" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试完成，准备部署", actor: "QA团队", time: "2025-03-20 09:30" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过"], allowedRoles: ["QA负责人"], autoAdvance: false, timeoutHours: 120 },
      { id: genId(), fromStage: "deploy", toStage: "audit", conditions: ["部署成功"], allowedRoles: ["运维组长"], autoAdvance: false, timeoutHours: 48 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "张三", role: "开发负责人", assignedAt: "2025-02-28", notifications: [{ time: "2025-02-28 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2025-03-08", notifications: [{ time: "2025-03-08 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2025-03-18", notifications: [{ time: "2025-03-18 10:00", message: "被指派为部署阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [],
    auditOpinion: "",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，进入测试", actor: "合约开发组", time: "2025-04-01 08:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过", "单元测试通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "周八", role: "开发负责人", assignedAt: "2025-01-25", notifications: [{ time: "2025-01-25 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2025-03-30", notifications: [{ time: "2025-03-30 14:00", message: "被指派为测试阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [],
    auditOpinion: "",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2025-01-25 10:00" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试通过，准备部署", actor: "QA团队", time: "2025-02-05 14:00" },
      { id: genId(), fromStage: "deploy", toStage: "audit", reason: "部署成功，申请审计", actor: "运维组", time: "2025-02-20 09:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过"], allowedRoles: ["QA负责人"], autoAdvance: false, timeoutHours: 120 },
      { id: genId(), fromStage: "deploy", toStage: "audit", conditions: ["部署成功"], allowedRoles: ["运维组长"], autoAdvance: false, timeoutHours: 48 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "张三", role: "开发负责人", assignedAt: "2025-01-05", notifications: [{ time: "2025-01-05 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2025-01-20", notifications: [{ time: "2025-01-20 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2025-02-01", notifications: [{ time: "2025-02-01 10:00", message: "被指派为部署阶段负责人" }] },
      { id: genId(), stage: "audit", person: "赵六", role: "安全审计师", assignedAt: "2025-02-18", notifications: [{ time: "2025-02-18 16:00", message: "被指派为审计阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [
      { id: genId(), filename: "审计初稿_SC-004.pdf", uploader: "赵六", uploadedAt: "2025-02-25", status: "审计中", content: "供应链金融合约审计初稿。合约逻辑清晰，但建议加强权限控制。" },
    ],
    auditOpinion: "建议加强权限控制，其余通过。",
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
    transitions: [],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过", "单元测试通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "周八", role: "开发负责人", assignedAt: "2025-03-28", notifications: [{ time: "2025-03-28 09:00", message: "被指派为开发阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [],
    auditOpinion: "",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2024-10-15 09:00" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试通过，准备部署", actor: "QA团队", time: "2024-11-01 10:00" },
      { id: genId(), fromStage: "deploy", toStage: "audit", reason: "部署成功，申请审计", actor: "运维组", time: "2024-11-15 14:00" },
      { id: genId(), fromStage: "audit", toStage: "market", reason: "审计通过，申请上架", actor: "安全审计组", time: "2024-12-01 11:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过"], allowedRoles: ["QA负责人"], autoAdvance: false, timeoutHours: 120 },
      { id: genId(), fromStage: "deploy", toStage: "audit", conditions: ["部署成功"], allowedRoles: ["运维组长"], autoAdvance: false, timeoutHours: 48 },
      { id: genId(), fromStage: "audit", toStage: "market", conditions: ["审计通过"], allowedRoles: ["安全审计组"], autoAdvance: false, timeoutHours: 168 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "张三", role: "开发负责人", assignedAt: "2024-09-25", notifications: [{ time: "2024-09-25 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2024-10-10", notifications: [{ time: "2024-10-10 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2024-10-28", notifications: [{ time: "2024-10-28 10:00", message: "被指派为部署阶段负责人" }] },
      { id: genId(), stage: "audit", person: "赵六", role: "安全审计师", assignedAt: "2024-11-10", notifications: [{ time: "2024-11-10 16:00", message: "被指派为审计阶段负责人" }] },
      { id: genId(), stage: "market", person: "孙七", role: "产品经理", assignedAt: "2024-11-28", notifications: [{ time: "2024-11-28 11:00", message: "被指派为发布阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [
      { id: genId(), filename: "政务审批合约审计报告.pdf", uploader: "赵六", uploadedAt: "2024-11-15", status: "已通过", content: "政务审批合约通过安全审计，多级审批逻辑正确，留痕机制完善。" },
    ],
    auditOpinion: "通过安全审计，多级审批逻辑正确。",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2025-02-28 10:00" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试通过，准备部署", actor: "QA团队", time: "2025-03-10 09:30" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过"], allowedRoles: ["QA负责人"], autoAdvance: false, timeoutHours: 120 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "周八", role: "开发负责人", assignedAt: "2025-02-10", notifications: [{ time: "2025-02-10 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2025-02-25", notifications: [{ time: "2025-02-25 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2025-03-08", notifications: [{ time: "2025-03-08 10:00", message: "被指派为部署阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [],
    auditOpinion: "",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，进入测试", actor: "合约开发组", time: "2025-04-10 08:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "周八", role: "开发负责人", assignedAt: "2025-02-28", notifications: [{ time: "2025-02-28 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2025-04-08", notifications: [{ time: "2025-04-08 14:00", message: "被指派为测试阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [],
    auditOpinion: "",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2024-12-15 09:00" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试通过，准备部署", actor: "QA团队", time: "2025-01-05 10:00" },
      { id: genId(), fromStage: "deploy", toStage: "audit", reason: "部署成功，申请审计", actor: "运维组", time: "2025-01-20 14:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过"], allowedRoles: ["QA负责人"], autoAdvance: false, timeoutHours: 120 },
      { id: genId(), fromStage: "deploy", toStage: "audit", conditions: ["部署成功"], allowedRoles: ["运维组长"], autoAdvance: false, timeoutHours: 48 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "张三", role: "开发负责人", assignedAt: "2024-11-25", notifications: [{ time: "2024-11-25 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2024-12-10", notifications: [{ time: "2024-12-10 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2025-01-01", notifications: [{ time: "2025-01-01 10:00", message: "被指派为部署阶段负责人" }] },
      { id: genId(), stage: "audit", person: "赵六", role: "安全审计师", assignedAt: "2025-01-18", notifications: [{ time: "2025-01-18 16:00", message: "被指派为审计阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [],
    auditOpinion: "",
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
    transitions: [
      { id: genId(), fromStage: "dev", toStage: "test", reason: "开发完成，提交测试", actor: "合约开发组", time: "2024-08-15 09:00" },
      { id: genId(), fromStage: "test", toStage: "deploy", reason: "测试通过，准备部署", actor: "QA团队", time: "2024-09-01 10:00" },
      { id: genId(), fromStage: "deploy", toStage: "audit", reason: "部署成功，申请审计", actor: "运维组", time: "2024-09-15 14:00" },
      { id: genId(), fromStage: "audit", toStage: "market", reason: "审计通过，申请上架", actor: "安全审计组", time: "2024-10-01 11:00" },
    ],
    transitionRules: [
      { id: genId(), fromStage: "dev", toStage: "test", conditions: ["代码审查通过"], allowedRoles: ["开发组长"], autoAdvance: false, timeoutHours: 240 },
      { id: genId(), fromStage: "test", toStage: "deploy", conditions: ["集成测试通过"], allowedRoles: ["QA负责人"], autoAdvance: false, timeoutHours: 120 },
      { id: genId(), fromStage: "deploy", toStage: "audit", conditions: ["部署成功"], allowedRoles: ["运维组长"], autoAdvance: false, timeoutHours: 48 },
      { id: genId(), fromStage: "audit", toStage: "market", conditions: ["审计通过"], allowedRoles: ["安全审计组"], autoAdvance: false, timeoutHours: 168 },
    ],
    stakeholders: [
      { id: genId(), stage: "dev", person: "张三", role: "开发负责人", assignedAt: "2024-07-25", notifications: [{ time: "2024-07-25 09:00", message: "被指派为开发阶段负责人" }] },
      { id: genId(), stage: "test", person: "李四", role: "QA工程师", assignedAt: "2024-08-10", notifications: [{ time: "2024-08-10 14:00", message: "被指派为测试阶段负责人" }] },
      { id: genId(), stage: "deploy", person: "王五", role: "运维工程师", assignedAt: "2024-08-28", notifications: [{ time: "2024-08-28 10:00", message: "被指派为部署阶段负责人" }] },
      { id: genId(), stage: "audit", person: "赵六", role: "安全审计师", assignedAt: "2024-09-10", notifications: [{ time: "2024-09-10 16:00", message: "被指派为审计阶段负责人" }] },
      { id: genId(), stage: "market", person: "孙七", role: "产品经理", assignedAt: "2024-09-28", notifications: [{ time: "2024-09-28 11:00", message: "被指派为发布阶段负责人" }] },
    ],
    slaConfigs: [...defaultSLAConfigs],
    auditReports: [
      { id: genId(), filename: "公益捐赠合约审计报告.pdf", uploader: "赵六", uploadedAt: "2024-09-15", status: "已通过", content: "公益捐赠合约通过安全审计，捐赠记录透明化机制完善，资金追溯逻辑正确。" },
    ],
    auditOpinion: "通过安全审计，资金追溯逻辑正确。",
  },
];

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
  { key: "auditOpinion", label: "审计意见", type: "text" as const },
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

  // Lifecycle Dialog state
  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState("timeline");

  // Transition Dialog state
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "backward">("forward");
  const [transitionReason, setTransitionReason] = useState("");
  const [transitionChecks, setTransitionChecks] = useState<boolean[]>([]);

  // SLA Dialog state
  const [slaDialogOpen, setSlaDialogOpen] = useState(false);
  const [slaEditingStage, setSlaEditingStage] = useState("");
  const [slaEditingHours, setSlaEditingHours] = useState(0);

  // Stakeholder Dialog state
  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false);
  const [stakeholderEditing, setStakeholderEditing] = useState<Stakeholder | null>(null);
  const [stakeholderForm, setStakeholderForm] = useState({ stage: "", person: "", role: "" });

  // Rule Dialog state
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [ruleEditing, setRuleEditing] = useState<TransitionRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    fromStage: "", toStage: "", conditions: "", allowedRoles: "", autoAdvance: false, timeoutHours: 48,
  });

  // Audit Report View state
  const [reportViewOpen, setReportViewOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<AuditReport | null>(null);

  // Notification history dialog
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [viewingNotifications, setViewingNotifications] = useState<Stakeholder | null>(null);

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

    const existing = editingId ? contracts.find(c => c.id === editingId) : null;

    if (dialogMode === "create") {
      const newContract: Contract = {
        id: data.id,
        name: data.name,
        currentStage: data.currentStage,
        stages: parsedStages,
        versions: parsedVersions,
        deploys: parsedDeploys,
        tests: parsedTests,
        transitions: [],
        transitionRules: defaultExitCriteria ? [] : [],
        stakeholders: [],
        slaConfigs: [...defaultSLAConfigs],
        auditReports: [],
        auditOpinion: "",
      };
      setContracts(prev => [...prev, newContract]);
    } else if (dialogMode === "edit" && editingId && existing) {
      setContracts(prev =>
        prev.map(c =>
          c.id === editingId
            ? { ...c, id: data.id, name: data.name, currentStage: data.currentStage, stages: parsedStages, versions: parsedVersions, deploys: parsedDeploys, tests: parsedTests }
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

  const openLifecycle = (contract: Contract) => {
    setActiveContract(contract);
    setActiveTab("timeline");
    setLifecycleOpen(true);
  };

  const updateContract = (updated: Contract) => {
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setActiveContract(updated);
    if (detailContract?.id === updated.id) setDetailContract(updated);
  };

  // ─── Stage Transitions ───
  const openTransitionDialog = (contract: Contract, direction: "forward" | "backward") => {
    setActiveContract(contract);
    setTransitionDirection(direction);
    setTransitionReason("");
    const currentStageKey = contract.currentStage;
    const criteria = defaultExitCriteria[currentStageKey] || [];
    setTransitionChecks(new Array(criteria.length).fill(false));
    setTransitionDialogOpen(true);
  };

  const executeTransition = () => {
    if (!activeContract) return;
    const contract = activeContract;
    const currentIdx = getStageIndex(contract.currentStage);
    if (currentIdx < 0) return;

    let newStages = [...contract.stages];
    let newCurrentStage = contract.currentStage;
    const now = new Date();
    const timeStr = now.toISOString().split("T")[0];
    const fullTimeStr = `${timeStr} ${now.toTimeString().slice(0, 5)}`;

    if (transitionDirection === "forward") {
      const nextIdx = currentIdx + 1;
      if (nextIdx < stageOrder.length) {
        newStages[currentIdx] = { ...newStages[currentIdx], status: "completed", time: timeStr };
        newStages[nextIdx] = { ...newStages[nextIdx], status: "current", time: timeStr };
        newCurrentStage = stageOrder[nextIdx];
      }
    } else {
      const prevIdx = currentIdx - 1;
      if (prevIdx >= 0) {
        newStages[currentIdx] = { ...newStages[currentIdx], status: "pending", time: "-" };
        newStages[prevIdx] = { ...newStages[prevIdx], status: "current", time: timeStr };
        newCurrentStage = stageOrder[prevIdx];
      }
    }

    const newTransition: StageTransition = {
      id: genId(),
      fromStage: contract.currentStage,
      toStage: newCurrentStage,
      reason: transitionReason,
      actor: "当前用户",
      time: fullTimeStr,
    };

    const updated: Contract = {
      ...contract,
      currentStage: newCurrentStage,
      stages: newStages,
      transitions: [...contract.transitions, newTransition],
    };

    updateContract(updated);
    setTransitionDialogOpen(false);
  };

  // ─── SLA ───
  const openSlaDialog = (stage: string, hours: number) => {
    setSlaEditingStage(stage);
    setSlaEditingHours(hours);
    setSlaDialogOpen(true);
  };

  const saveSlaConfig = () => {
    if (!activeContract) return;
    const newConfigs = activeContract.slaConfigs.map(cfg =>
      cfg.stage === slaEditingStage ? { ...cfg, expectedHours: slaEditingHours } : cfg
    );
    updateContract({ ...activeContract, slaConfigs: newConfigs });
    setSlaDialogOpen(false);
  };

  // ─── Stakeholders ───
  const openStakeholderDialog = (stakeholder?: Stakeholder) => {
    if (stakeholder) {
      setStakeholderEditing(stakeholder);
      setStakeholderForm({ stage: stakeholder.stage, person: stakeholder.person, role: stakeholder.role });
    } else {
      setStakeholderEditing(null);
      setStakeholderForm({ stage: stageOrder[0], person: "", role: "" });
    }
    setStakeholderDialogOpen(true);
  };

  const saveStakeholder = () => {
    if (!activeContract) return;
    if (stakeholderEditing) {
      const updated = activeContract.stakeholders.map(s =>
        s.id === stakeholderEditing.id
          ? { ...s, stage: stakeholderForm.stage, person: stakeholderForm.person, role: stakeholderForm.role }
          : s
      );
      updateContract({ ...activeContract, stakeholders: updated });
    } else {
      const newStakeholder: Stakeholder = {
        id: genId(),
        stage: stakeholderForm.stage,
        person: stakeholderForm.person,
        role: stakeholderForm.role,
        assignedAt: new Date().toISOString().split("T")[0],
        notifications: [{ time: `${new Date().toISOString().split("T")[0]} ${new Date().toTimeString().slice(0, 5)}`, message: "被指派为该阶段负责人" }],
      };
      updateContract({ ...activeContract, stakeholders: [...activeContract.stakeholders, newStakeholder] });
    }
    setStakeholderDialogOpen(false);
  };

  const removeStakeholder = (id: string) => {
    if (!activeContract) return;
    updateContract({ ...activeContract, stakeholders: activeContract.stakeholders.filter(s => s.id !== id) });
  };

  // ─── Transition Rules ───
  const openRuleDialog = (rule?: TransitionRule) => {
    if (rule) {
      setRuleEditing(rule);
      setRuleForm({
        fromStage: rule.fromStage,
        toStage: rule.toStage,
        conditions: rule.conditions.join(", "),
        allowedRoles: rule.allowedRoles.join(", "),
        autoAdvance: rule.autoAdvance,
        timeoutHours: rule.timeoutHours,
      });
    } else {
      setRuleEditing(null);
      setRuleForm({ fromStage: stageOrder[0], toStage: stageOrder[1], conditions: "", allowedRoles: "", autoAdvance: false, timeoutHours: 48 });
    }
    setRuleDialogOpen(true);
  };

  const saveRule = () => {
    if (!activeContract) return;
    const newRule: TransitionRule = {
      id: ruleEditing ? ruleEditing.id : genId(),
      fromStage: ruleForm.fromStage,
      toStage: ruleForm.toStage,
      conditions: ruleForm.conditions.split(",").map(s => s.trim()).filter(Boolean),
      allowedRoles: ruleForm.allowedRoles.split(",").map(s => s.trim()).filter(Boolean),
      autoAdvance: ruleForm.autoAdvance,
      timeoutHours: ruleForm.timeoutHours,
    };
    if (ruleEditing) {
      updateContract({ ...activeContract, transitionRules: activeContract.transitionRules.map(r => r.id === ruleEditing.id ? newRule : r) });
    } else {
      updateContract({ ...activeContract, transitionRules: [...activeContract.transitionRules, newRule] });
    }
    setRuleDialogOpen(false);
  };

  const removeRule = (id: string) => {
    if (!activeContract) return;
    updateContract({ ...activeContract, transitionRules: activeContract.transitionRules.filter(r => r.id !== id) });
  };

  // ─── Audit Reports ───
  const uploadAuditReport = () => {
    if (!activeContract) return;
    const mockReport: AuditReport = {
      id: genId(),
      filename: `审计报告_${activeContract.id}_${Date.now()}.pdf`,
      uploader: "当前用户",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "待审核",
      content: `这是一份模拟的审计报告内容，针对合约 ${activeContract.name}。报告显示合约代码结构良好，未发现明显漏洞。`,
    };
    updateContract({ ...activeContract, auditReports: [...activeContract.auditReports, mockReport] });
  };

  const updateAuditOpinion = (opinion: string) => {
    if (!activeContract) return;
    updateContract({ ...activeContract, auditOpinion: opinion });
  };

  // ─── Render Helpers ───
  const renderSLAIndicator = (stage: ContractStage, slaConfig?: SLAConfig) => {
    if (!slaConfig || stage.status === "pending" || stage.time === "-") {
      return <span className="text-[10px] text-gray-400">未配置</span>;
    }
    const status = getSLAStatus(stage, slaConfig.expectedHours);
    const colors = {
      ontime: "text-emerald-600 bg-emerald-50",
      warning: "text-amber-600 bg-amber-50",
      overdue: "text-red-600 bg-red-50",
      neutral: "text-gray-400 bg-gray-50",
    };
    const labels = { ontime: "正常", warning: "预警", overdue: "超期", neutral: "-" };
    return (
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", colors[status])}>
        SLA: {labels[status]} ({formatHours(slaConfig.expectedHours)})
      </span>
    );
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

      <PageHeader
        title="合约全生命周期视图"
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" /> 新建合约
          </Button>
        }
      />
      <p className="text-sm text-gray-500 mt-1.5">追踪智能合约从开发→测试→部署→审计→市场的完整生命周期状态</p>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FileCode className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">合约总数</p><p className="text-2xl font-bold">{contracts.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Code className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">开发中</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "dev").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Beaker className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">测试中</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "test").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Rocket className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">已部署</p><p className="text-2xl font-bold">{contracts.filter(c => ["deploy","audit","market"].includes(c.currentStage)).length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><ShoppingCart className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已上架</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "market").length}</p></div></CardContent></Card>
      </div>

      <PageSearchBar
        value={search}
        onChange={setSearch}
        placeholder="搜索合约名称或ID"
        onReset={() => setSearch("")}
      />

      {/* Overdue Alerts */}
      {(() => {
        const overdueItems: { contract: Contract; stage: ContractStage; sla: SLAConfig }[] = [];
        contracts.forEach(c => {
          c.stages.forEach(s => {
            const sla = c.slaConfigs.find(sc => sc.stage === s.stage);
            if (sla && s.status === "current") {
              const status = getSLAStatus(s, sla.expectedHours);
              if (status === "overdue") overdueItems.push({ contract: c, stage: s, sla });
            }
          });
        });
        if (overdueItems.length === 0) return null;
        return (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="py-3 px-4 flex flex-row items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">SLA 超期警告</span>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <div className="space-y-2">
                {overdueItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-red-700">
                    <span className="font-medium">{item.contract.name}</span>
                    <span className="text-red-500">·</span>
                    <span>{item.stage.name}</span>
                    <span className="text-red-500">·</span>
                    <span>已超期 {formatHours(Math.floor((new Date().getTime() - new Date(item.stage.time).getTime()) / (1000 * 60 * 60)) - item.sla.expectedHours)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

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
              <ActionButtons buttons={[
                createViewAction(() => openDetail(contract)),
                { key: "lifecycle", icon: <Globe className="w-4 h-4" />, label: "生命周期", onClick: () => openLifecycle(contract) },
                createEditAction(() => handleEdit(contract)),
                createDeleteAction(() => handleDelete(contract)),
              ]} />
            </CardHeader>
            <CardContent className="p-5">
              {/* Lifecycle Pipeline */}
              <div className="flex items-center mb-5">
                {contract.stages.map((s, i, arr) => {
                  const cfg = stageConfig[s.stage];
                  const Icon = cfg.icon;
                  const sla = contract.slaConfigs.find(sc => sc.stage === s.stage);
                  return (
                    <div key={s.stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white transition-all", s.status === "completed" ? cfg.color : s.status === "current" ? cfg.color + " animate-pulse" : "bg-gray-200 text-gray-400")}>
                          {s.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={cn("text-xs font-medium mt-1.5", s.status === "pending" ? "text-gray-400" : "text-gray-900")}>{s.name}</span>
                        <span className="text-[10px] text-gray-400">{s.time !== "-" ? s.time : "待定"}</span>
                        <div className="mt-1">{renderSLAIndicator(s, sla)}</div>
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

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`合约详情 - ${detailContract?.name || ""}`}
        data={detailData}
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

      {/* Lifecycle Dialog */}
      <Dialog open={lifecycleOpen} onOpenChange={setLifecycleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-500" />
              合约生命周期管理 - {activeContract?.name}
              <span className="font-mono text-xs text-gray-400 font-normal">{activeContract?.id}</span>
            </DialogTitle>
            <DialogDescription>
              管理合约从开发到市场的全生命周期流程
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">时间线</TabsTrigger>
              <TabsTrigger value="workflow">工作流配置</TabsTrigger>
              <TabsTrigger value="stakeholders">干系人</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6 m-0 px-1">
                {/* Enhanced Pipeline */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">生命周期流水线</h3>
                  <div className="flex items-center">
                    {activeContract?.stages.map((s, i, arr) => {
                      const cfg = stageConfig[s.stage];
                      const Icon = cfg.icon;
                      const sla = activeContract.slaConfigs.find(sc => sc.stage === s.stage);
                      const isCurrent = s.status === "current";
                      const canForward = isCurrent && getNextStage(s.stage) !== null;
                      const canBackward = isCurrent && getPrevStage(s.stage) !== null;

                      return (
                        <div key={s.stage} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white transition-all", s.status === "completed" ? cfg.color : isCurrent ? cfg.color + " animate-pulse" : "bg-gray-200 text-gray-400")}>
                              {s.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={cn("text-xs font-medium mt-1.5", s.status === "pending" ? "text-gray-400" : "text-gray-900")}>{s.name}</span>
                            <span className="text-[10px] text-gray-400">{s.time !== "-" ? s.time : "待定"}</span>
                            <div className="mt-1">{renderSLAIndicator(s, sla)}</div>
                            {isCurrent && (
                              <div className="flex gap-1 mt-2">
                                {canBackward && (
                                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => openTransitionDialog(activeContract, "backward")}>
                                    <ChevronLeft className="w-3 h-3 mr-0.5" /> 回退
                                  </Button>
                                )}
                                {canForward && (
                                  <Button size="sm" className="h-6 text-[10px] px-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => openTransitionDialog(activeContract, "forward")}>
                                    推进 <ArrowRight className="w-3 h-3 ml-0.5" />
                                  </Button>
                                )}
                              </div>
                            )}
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
                </div>

                {/* SLA Config Button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">SLA 配置</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {activeContract?.slaConfigs.map(cfg => (
                    <Card key={cfg.stage} className="cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => openSlaDialog(cfg.stage, cfg.expectedHours)}>
                      <CardContent className="p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">{stageConfig[cfg.stage].label}</div>
                        <div className="text-sm font-medium">{formatHours(cfg.expectedHours)}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Transition History */}
                {activeContract && activeContract.transitions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">阶段转换历史</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">时间</TableHead>
                          <TableHead className="text-xs">转换</TableHead>
                          <TableHead className="text-xs">操作人</TableHead>
                          <TableHead className="text-xs">原因</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeContract.transitions.map(t => (
                          <TableRow key={t.id}>
                            <TableCell className="text-xs">{t.time}</TableCell>
                            <TableCell className="text-xs">
                              <span className="text-gray-500">{stageConfig[t.fromStage]?.label || t.fromStage}</span>
                              <ArrowRight className="w-3 h-3 inline mx-1 text-gray-400" />
                              <span className="font-medium">{stageConfig[t.toStage]?.label || t.toStage}</span>
                            </TableCell>
                            <TableCell className="text-xs">{t.actor}</TableCell>
                            <TableCell className="text-xs text-gray-500">{t.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Audit Reports Section */}
                {activeContract && (activeContract.currentStage === "audit" || activeContract.auditReports.length > 0) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">审计报告</h3>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center mb-4 hover:border-indigo-300 transition-colors cursor-pointer" onClick={uploadAuditReport}>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">点击上传审计报告（模拟）</p>
                    </div>

                    {activeContract.auditReports.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">文件名</TableHead>
                            <TableHead className="text-xs">上传人</TableHead>
                            <TableHead className="text-xs">上传时间</TableHead>
                            <TableHead className="text-xs">状态</TableHead>
                            <TableHead className="text-xs">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeContract.auditReports.map(report => (
                            <TableRow key={report.id}>
                              <TableCell className="text-xs flex items-center gap-1">
                                <FileText className="w-3 h-3 text-gray-400" />
                                {report.filename}
                              </TableCell>
                              <TableCell className="text-xs">{report.uploader}</TableCell>
                              <TableCell className="text-xs">{report.uploadedAt}</TableCell>
                              <TableCell className="text-xs"><Badge variant="outline">{report.status}</Badge></TableCell>
                              <TableCell className="text-xs">
                                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { setViewingReport(report); setReportViewOpen(true); }}>
                                  查看
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    <div className="mt-4">
                      <Label className="text-xs font-medium">审计意见</Label>
                      <Textarea
                        className="mt-1.5 text-sm"
                        placeholder="输入审计意见..."
                        value={activeContract.auditOpinion}
                        onChange={(e) => updateAuditOpinion(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Workflow Config Tab */}
              <TabsContent value="workflow" className="space-y-4 m-0 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">阶段转换规则</h3>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={() => openRuleDialog()}>
                    <Plus className="w-3 h-3" /> 添加规则
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">从阶段</TableHead>
                      <TableHead className="text-xs">到阶段</TableHead>
                      <TableHead className="text-xs">必要条件</TableHead>
                      <TableHead className="text-xs">允许角色</TableHead>
                      <TableHead className="text-xs">自动推进</TableHead>
                      <TableHead className="text-xs">超时</TableHead>
                      <TableHead className="text-xs">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeContract?.transitionRules.map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell className="text-xs">{stageConfig[rule.fromStage]?.label || rule.fromStage}</TableCell>
                        <TableCell className="text-xs">{stageConfig[rule.toStage]?.label || rule.toStage}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            {rule.conditions.map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{c}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{rule.allowedRoles.join(", ")}</TableCell>
                        <TableCell className="text-xs">
                          <Switch checked={rule.autoAdvance} className="scale-75" />
                        </TableCell>
                        <TableCell className="text-xs">{formatHours(rule.timeoutHours)}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openRuleDialog(rule)}><Pencil className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600" onClick={() => removeRule(rule.id)}><Trash className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => {
                              const currentStage = activeContract?.currentStage;
                              const canApply = currentStage === rule.fromStage;
                              alert(canApply ? `规则测试: 当前阶段为 ${stageConfig[rule.fromStage]?.label}，满足转换条件，可以推进到 ${stageConfig[rule.toStage]?.label}` : `规则测试: 当前阶段不满足条件 (${stageConfig[currentStage || ""]?.label} ≠ ${stageConfig[rule.fromStage]?.label})`);
                            }}>
                              <Play className="w-3 h-3 mr-0.5" /> 测试
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Stakeholders Tab */}
              <TabsContent value="stakeholders" className="space-y-4 m-0 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">干系人管理</h3>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={() => openStakeholderDialog()}>
                    <UserPlus className="w-3 h-3" /> 添加干系人
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">阶段</TableHead>
                      <TableHead className="text-xs">人员</TableHead>
                      <TableHead className="text-xs">角色</TableHead>
                      <TableHead className="text-xs">指派时间</TableHead>
                      <TableHead className="text-xs">通知</TableHead>
                      <TableHead className="text-xs">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeContract?.stakeholders.map(stakeholder => (
                      <TableRow key={stakeholder.id}>
                        <TableCell className="text-xs">{stageConfig[stakeholder.stage]?.label || stakeholder.stage}</TableCell>
                        <TableCell className="text-xs flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          {stakeholder.person}
                        </TableCell>
                        <TableCell className="text-xs">{stakeholder.role}</TableCell>
                        <TableCell className="text-xs">{stakeholder.assignedAt}</TableCell>
                        <TableCell className="text-xs">
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => { setViewingNotifications(stakeholder); setNotificationDialogOpen(true); }}>
                            <Bell className="w-3 h-3" />
                            {stakeholder.notifications.length} 条
                          </Button>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openStakeholderDialog(stakeholder)}><Pencil className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600" onClick={() => removeStakeholder(stakeholder.id)}><Trash className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLifecycleOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition Dialog */}
      <Dialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>阶段转换</DialogTitle>
            <DialogDescription>
              {activeContract && (
                <span className="flex items-center gap-1 mt-1">
                  <span>{stageConfig[activeContract.currentStage]?.label}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{stageConfig[transitionDirection === "forward" ? getNextStage(activeContract.currentStage) || "" : getPrevStage(activeContract.currentStage) || ""]?.label}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">转换原因 / 审批意见</Label>
              <Textarea
                className="mt-1.5 text-sm"
                placeholder="请输入转换原因..."
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">阶段退出检查清单（必须全部勾选）</Label>
              <div className="space-y-2">
                {(activeContract ? defaultExitCriteria[activeContract.currentStage] || [] : []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Checkbox
                      id={`check-${idx}`}
                      checked={transitionChecks[idx] || false}
                      onCheckedChange={(checked) => {
                        const newChecks = [...transitionChecks];
                        newChecks[idx] = checked === true;
                        setTransitionChecks(newChecks);
                      }}
                    />
                    <Label htmlFor={`check-${idx}`} className="text-sm cursor-pointer">{item}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransitionDialogOpen(false)}>取消</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={executeTransition}
              disabled={!transitionReason.trim() || !transitionChecks.every(Boolean)}
            >
              确认转换
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SLA Config Dialog */}
      <Dialog open={slaDialogOpen} onOpenChange={setSlaDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>配置 SLA</DialogTitle>
            <DialogDescription>
              设置 {stageConfig[slaEditingStage]?.label} 阶段的预期完成时间
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">预期时长（小时）</Label>
              <Input
                type="number"
                className="mt-1.5"
                value={slaEditingHours}
                onChange={(e) => setSlaEditingHours(parseInt(e.target.value) || 0)}
              />
              <p className="text-[10px] text-gray-500 mt-1">{formatHours(slaEditingHours)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlaDialogOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveSlaConfig}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stakeholder Dialog */}
      <Dialog open={stakeholderDialogOpen} onOpenChange={setStakeholderDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{stakeholderEditing ? "编辑干系人" : "添加干系人"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">阶段</Label>
              <select
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                value={stakeholderForm.stage}
                onChange={(e) => setStakeholderForm({ ...stakeholderForm, stage: e.target.value })}
              >
                {stageOrder.map(s => (
                  <option key={s} value={s}>{stageConfig[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">人员</Label>
              <Input className="mt-1.5" value={stakeholderForm.person} onChange={(e) => setStakeholderForm({ ...stakeholderForm, person: e.target.value })} placeholder="姓名" />
            </div>
            <div>
              <Label className="text-xs">角色</Label>
              <Input className="mt-1.5" value={stakeholderForm.role} onChange={(e) => setStakeholderForm({ ...stakeholderForm, role: e.target.value })} placeholder="角色" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStakeholderDialogOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveStakeholder} disabled={!stakeholderForm.person.trim() || !stakeholderForm.role.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{ruleEditing ? "编辑转换规则" : "添加转换规则"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">从阶段</Label>
                <select
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={ruleForm.fromStage}
                  onChange={(e) => setRuleForm({ ...ruleForm, fromStage: e.target.value })}
                >
                  {stageOrder.map(s => (
                    <option key={s} value={s}>{stageConfig[s].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">到阶段</Label>
                <select
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={ruleForm.toStage}
                  onChange={(e) => setRuleForm({ ...ruleForm, toStage: e.target.value })}
                >
                  {stageOrder.map(s => (
                    <option key={s} value={s}>{stageConfig[s].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">必要条件（逗号分隔）</Label>
              <Input className="mt-1.5" value={ruleForm.conditions} onChange={(e) => setRuleForm({ ...ruleForm, conditions: e.target.value })} placeholder="例如: 代码审查通过, 单元测试通过" />
            </div>
            <div>
              <Label className="text-xs">允许角色（逗号分隔）</Label>
              <Input className="mt-1.5" value={ruleForm.allowedRoles} onChange={(e) => setRuleForm({ ...ruleForm, allowedRoles: e.target.value })} placeholder="例如: 开发组长, 项目经理" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">超时（小时）</Label>
                <Input type="number" className="mt-1.5" value={ruleForm.timeoutHours} onChange={(e) => setRuleForm({ ...ruleForm, timeoutHours: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={ruleForm.autoAdvance} onCheckedChange={(checked) => setRuleForm({ ...ruleForm, autoAdvance: checked })} />
                <Label className="text-xs">自动推进</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveRule} disabled={!ruleForm.conditions.trim() || !ruleForm.allowedRoles.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report View Dialog */}
      <Dialog open={reportViewOpen} onOpenChange={setReportViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {viewingReport?.filename}
            </DialogTitle>
            <DialogDescription>
              上传人: {viewingReport?.uploader} · 时间: {viewingReport?.uploadedAt}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingReport?.content}</p>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportViewOpen(false)}>关闭</Button>
            <Button variant="outline" className="gap-1" onClick={() => alert("下载功能（模拟）")}>
              <Download className="w-3 h-3" /> 下载
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification History Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4" />
              通知历史 - {viewingNotifications?.person}
            </DialogTitle>
            <DialogDescription>
              {stageConfig[viewingNotifications?.stage || ""]?.label} · {viewingNotifications?.role}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {viewingNotifications?.notifications.map((n, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <Bell className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-700">{n.message}</p>
                    <p className="text-[10px] text-gray-400">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
