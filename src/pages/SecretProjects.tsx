import { useState } from "react";
import {
  Shield, Plus, Search, Users, Database,
  Clock, CheckCircle, Eye, Edit2, Trash2,
  Play, Square, Archive, ListTodo, X,
  Settings, Server, FileStack, UserPlus, UserMinus,
  Lock, Unlock, Save, RotateCcw, Check, XCircle,
  ChevronRight, FolderOpen, FileKey
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
interface SecretProject {
  id: string;
  name: string;
  description: string;
  algorithm: "MPC" | "HE" | "ZKP" | "TEE";
  status: "planning" | "running" | "completed" | "failed" | "archived";
  creator: string;
  createTime: string;
  memberCount: number;
  dataSourceCount: number;
  taskCount: number;
  securityLevel: string;
  communicationProtocol: string;
  phases: string[];
}

interface ProjectApproval {
  id: string;
  projectName: string;
  applicant: string;
  applyTime: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approver: string;
  comment: string;
}

interface ProjectParty {
  id: string;
  projectId: string;
  name: string;
  role: "data_provider" | "computation_node" | "result_receiver";
}

interface ProjectDataSource {
  id: string;
  projectId: string;
  name: string;
  type: string;
  size: string;
  format: string;
  encryptionStatus: "encrypted" | "unencrypted";
}

interface SecurityPolicy {
  projectId: string;
  protocol: "SSL/TLS" | "SPDZ" | "ABY3";
  precision: string;
  timeout: number;
}

/* ─── Mock Data ─── */
const initialProjects: SecretProject[] = [
  { id: "SCP-2026-001", name: "联合风控建模", description: "多方安全计算联合信用评估模型训练", algorithm: "MPC", status: "running", creator: "张三", createTime: "2026-04-10", memberCount: 5, dataSourceCount: 3, taskCount: 12, securityLevel: "高", communicationProtocol: "SPDZ", phases: ["数据准备", "模型训练", "结果分发"] },
  { id: "SCP-2026-002", name: "医疗数据融合", description: "同态加密医疗数据分析与统计", algorithm: "HE", status: "running", creator: "李四", createTime: "2026-04-08", memberCount: 8, dataSourceCount: 5, taskCount: 8, securityLevel: "极高", communicationProtocol: "SSL/TLS", phases: ["数据对齐", "联合统计", "报告生成"] },
  { id: "SCP-2026-003", name: "身份隐私验证", description: "零知识证明身份验证系统", algorithm: "ZKP", status: "completed", creator: "王五", createTime: "2026-04-05", memberCount: 3, dataSourceCount: 2, taskCount: 6, securityLevel: "高", communicationProtocol: "ABY3", phases: ["电路设计", "证明生成", "验证部署"] },
  { id: "SCP-2026-004", name: "安全图像识别", description: "TEE环境图像隐私计算推理", algorithm: "TEE", status: "planning", creator: "赵六", createTime: "2026-04-15", memberCount: 4, dataSourceCount: 2, taskCount: 0, securityLevel: "中", communicationProtocol: "SSL/TLS", phases: ["环境搭建", "模型迁移", "推理服务"] },
  { id: "SCP-2026-005", name: "跨机构统计", description: "MPC跨机构金融数据统计分析", algorithm: "MPC", status: "running", creator: "钱七", createTime: "2026-04-12", memberCount: 6, dataSourceCount: 4, taskCount: 15, securityLevel: "高", communicationProtocol: "SPDZ", phases: ["协议协商", "数据接入", "统计计算"] },
  { id: "SCP-2026-006", name: "基因数据计算", description: "同态加密基因序列比对分析", algorithm: "HE", status: "failed", creator: "孙八", createTime: "2026-04-01", memberCount: 7, dataSourceCount: 3, taskCount: 4, securityLevel: "极高", communicationProtocol: "SSL/TLS", phases: ["数据预处理", "序列比对", "结果解码"] },
  { id: "SCP-2026-007", name: "隐私投票系统", description: "零知识证明匿名投票", algorithm: "ZKP", status: "completed", creator: "周九", createTime: "2026-03-28", memberCount: 2, dataSourceCount: 1, taskCount: 3, securityLevel: "高", communicationProtocol: "ABY3", phases: ["选民注册", "投票加密", "计票验证"] },
  { id: "SCP-2026-008", name: "密钥管理优化", description: "TEE密钥安全生成与分发", algorithm: "TEE", status: "planning", creator: "吴十", createTime: "2026-04-18", memberCount: 3, dataSourceCount: 2, taskCount: 0, securityLevel: "极高", communicationProtocol: "SSL/TLS", phases: ["密钥生成", "安全分发", "轮换策略"] },
  { id: "SCP-2026-009", name: "供应链协同", description: "MPC供应链多方数据协同", algorithm: "MPC", status: "running", creator: "郑一", createTime: "2026-04-14", memberCount: 10, dataSourceCount: 6, taskCount: 20, securityLevel: "中", communicationProtocol: "SPDZ", phases: ["参与方接入", "数据协同", "结果汇总"] },
  { id: "SCP-2026-010", name: "隐私推荐引擎", description: "同态加密推荐算法", algorithm: "HE", status: "running", creator: "冯二", createTime: "2026-04-11", memberCount: 4, dataSourceCount: 3, taskCount: 9, securityLevel: "高", communicationProtocol: "SSL/TLS", phases: ["特征工程", "模型训练", "在线推理"] },
  { id: "SCP-2026-011", name: "年龄验证", description: "零知识证明年龄验证服务", algorithm: "ZKP", status: "completed", creator: "陈三", createTime: "2026-03-20", memberCount: 2, dataSourceCount: 1, taskCount: 2, securityLevel: "中", communicationProtocol: "ABY3", phases: ["凭证签发", "年龄证明", "验证服务"] },
  { id: "SCP-2026-012", name: "安全日志分析", description: "TEE日志隐私计算分析", algorithm: "TEE", status: "planning", creator: "褚四", createTime: "2026-04-19", memberCount: 3, dataSourceCount: 2, taskCount: 0, securityLevel: "高", communicationProtocol: "SSL/TLS", phases: ["日志采集", "隐私分析", "异常检测"] },
];

const initialApprovals: ProjectApproval[] = [
  { id: "APR-001", projectName: "联合风控建模", applicant: "张三", applyTime: "2026-04-10 09:30", approvalStatus: "approved", approver: " admin", comment: "符合安全规范，同意立项" },
  { id: "APR-002", projectName: "医疗数据融合", applicant: "李四", applyTime: "2026-04-08 14:20", approvalStatus: "approved", approver: " admin", comment: "已通过合规审查" },
  { id: "APR-003", projectName: "安全图像识别", applicant: "赵六", applyTime: "2026-04-15 11:00", approvalStatus: "pending", approver: "", comment: "" },
  { id: "APR-004", projectName: "密钥管理优化", applicant: "吴十", applyTime: "2026-04-18 16:45", approvalStatus: "pending", approver: "", comment: "" },
  { id: "APR-005", projectName: "跨机构统计", applicant: "钱七", applyTime: "2026-04-12 10:15", approvalStatus: "rejected", approver: " admin", comment: "数据源授权不完整，请补充材料" },
];

const initialParties: ProjectParty[] = [
  { id: "PTY-001", projectId: "SCP-2026-001", name: "银行A", role: "data_provider" },
  { id: "PTY-002", projectId: "SCP-2026-001", name: "银行B", role: "computation_node" },
  { id: "PTY-003", projectId: "SCP-2026-001", name: "风控中心", role: "result_receiver" },
  { id: "PTY-004", projectId: "SCP-2026-002", name: "医院A", role: "data_provider" },
  { id: "PTY-005", projectId: "SCP-2026-002", name: "医院B", role: "data_provider" },
  { id: "PTY-006", projectId: "SCP-2026-002", name: "研究院", role: "computation_node" },
];

const initialDataSources: ProjectDataSource[] = [
  { id: "DS-001", projectId: "SCP-2026-001", name: "用户信用表", type: "MySQL", size: "2.3GB", format: "结构化", encryptionStatus: "encrypted" },
  { id: "DS-002", projectId: "SCP-2026-001", name: "交易流水", type: "PostgreSQL", size: "5.1GB", format: "结构化", encryptionStatus: "encrypted" },
  { id: "DS-003", projectId: "SCP-2026-001", name: "风险标签", type: "CSV", size: "120MB", format: "文件", encryptionStatus: "encrypted" },
  { id: "DS-004", projectId: "SCP-2026-002", name: "电子病历", type: "Oracle", size: "8.7GB", format: "结构化", encryptionStatus: "encrypted" },
  { id: "DS-005", projectId: "SCP-2026-002", name: "检验报告", type: "JSON", size: "890MB", format: "半结构化", encryptionStatus: "unencrypted" },
];

const initialSecurityPolicies: SecurityPolicy[] = initialProjects.map(p => ({
  projectId: p.id,
  protocol: p.communicationProtocol as "SSL/TLS" | "SPDZ" | "ABY3",
  precision: "64-bit",
  timeout: 300,
}));

const availableParties = [
  "银行C", "保险公司A", "医院C", "药店A", "征信机构", "支付平台", "电商平台", "物流公司",
];

/* ─── Helpers ─── */
const algorithmColors: Record<string, string> = {
  MPC: "bg-blue-500/15 text-blue-500",
  HE: "bg-purple-500/15 text-purple-500",
  ZKP: "bg-emerald-500/15 text-emerald-500",
  TEE: "bg-amber-500/15 text-amber-500",
};

const algorithmLabels: Record<string, string> = {
  MPC: "安全多方计算", HE: "同态加密", ZKP: "零知识证明", TEE: "可信执行环境",
};

const roleLabels: Record<string, string> = {
  data_provider: "数据提供方",
  computation_node: "计算节点",
  result_receiver: "结果接收方",
};

const statusOptions = [
  { label: "规划中", value: "planning" },
  { label: "进行中", value: "running" },
  { label: "已完成", value: "completed" },
  { label: "失败", value: "failed" },
];

const algorithmOptions = [
  { label: "安全多方计算", value: "MPC" },
  { label: "同态加密", value: "HE" },
  { label: "零知识证明", value: "ZKP" },
  { label: "可信执行环境", value: "TEE" },
];

const fields: FieldConfig[] = [
  { key: "name", label: "项目名称", type: "text", required: true },
  { key: "description", label: "项目描述", type: "textarea" },
  { key: "algorithm", label: "算法类型", type: "select", options: algorithmOptions, required: true },
  { key: "status", label: "状态", type: "select", options: statusOptions, required: true },
  { key: "creator", label: "创建者", type: "text", required: true },
  { key: "createTime", label: "创建时间", type: "text", required: true },
  { key: "memberCount", label: "成员数", type: "number", required: true },
  { key: "dataSourceCount", label: "数据源数", type: "number", required: true },
  { key: "taskCount", label: "任务数", type: "number", required: true },
];

/* ─── Component ─── */
export default function SecretProjects() {
  /* State */
  const [projects, setProjects] = useState<SecretProject[]>(initialProjects);
  const [approvals, setApprovals] = useState<ProjectApproval[]>(initialApprovals);
  const [parties, setParties] = useState<ProjectParty[]>(initialParties);
  const [dataSources, setDataSources] = useState<ProjectDataSource[]>(initialDataSources);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>(initialSecurityPolicies);

  const [activeTab, setActiveTab] = useState("projects");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [algoFilter, setAlgoFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedProject, setSelectedProject] = useState<SecretProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("basic");

  /* Approval dialog */
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalDialogMode, setApprovalDialogMode] = useState<"create" | "edit">("create");
  const [selectedApproval, setSelectedApproval] = useState<ProjectApproval | null>(null);
  const [approvalForm, setApprovalForm] = useState<Record<string, any>>({});

  /* Party invite dialog */
  const [partyDialogOpen, setPartyDialogOpen] = useState(false);
  const [partyFormProjectId, setPartyFormProjectId] = useState("");
  const [partyFormName, setPartyFormName] = useState("");
  const [partyFormRole, setPartyFormRole] = useState<ProjectParty["role"]>("data_provider");

  /* Data source wizard */
  const [dsDialogOpen, setDsDialogOpen] = useState(false);
  const [dsStep, setDsStep] = useState(1);
  const [dsForm, setDsForm] = useState<Record<string, any>>({});
  const [dsEditingId, setDsEditingId] = useState<string | null>(null);

  /* Security policy */
  const [policyProjectId, setPolicyProjectId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState<Record<string, any>>({});

  /* Derived */
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchAlgo = algoFilter === "all" || p.algorithm === algoFilter;
    return matchSearch && matchStatus && matchAlgo;
  });

  const stats = [
    { label: "项目总数", value: projects.length, icon: Shield, color: "text-blue-500" },
    { label: "进行中", value: projects.filter((p) => p.status === "running").length, icon: Clock, color: "text-amber-500" },
    { label: "已完成", value: projects.filter((p) => p.status === "completed").length, icon: CheckCircle, color: "text-emerald-500" },
    { label: "今日新建", value: 2, icon: Plus, color: "text-purple-500" },
  ];

  /* ─── Handlers: Projects ─── */
  const handleCreate = () => {
    setSelectedProject(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (project: SecretProject) => {
    setSelectedProject(project);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (project: SecretProject) => {
    setSelectedProject(project);
    setDrawerTab("basic");
    setDrawerOpen(true);
  };

  const handleDelete = (project: SecretProject) => {
    setSelectedProject(project);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleStartStop = (project: SecretProject) => {
    setProjects(projects.map(p =>
      p.id === project.id
        ? { ...p, status: p.status === "running" ? "planning" : "running" as SecretProject["status"] }
        : p
    ));
  };

  const handleArchive = (project: SecretProject) => {
    setProjects(projects.map(p =>
      p.id === project.id ? { ...p, status: "archived" as SecretProject["status"] } : p
    ));
  };

  const handleViewTasks = (project: SecretProject) => {
    window.location.hash = `#/secret/tasks?project=${project.id}`;
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newProject: SecretProject = {
        id: `SCP-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        description: data.description || "",
        algorithm: data.algorithm || "MPC",
        status: data.status || "planning",
        creator: data.creator || "",
        createTime: data.createTime || new Date().toISOString().split("T")[0],
        memberCount: Number(data.memberCount) || 0,
        dataSourceCount: Number(data.dataSourceCount) || 0,
        taskCount: Number(data.taskCount) || 0,
        securityLevel: "中",
        communicationProtocol: "SSL/TLS",
        phases: ["准备阶段"],
      };
      setProjects([...projects, newProject]);
      setSecurityPolicies([...securityPolicies, { projectId: newProject.id, protocol: "SSL/TLS", precision: "64-bit", timeout: 300 }]);
    } else if (dialogMode === "edit" && selectedProject) {
      const updated = projects.map((p) =>
        p.id === selectedProject.id
          ? {
              ...p,
              name: data.name || p.name,
              description: data.description || p.description,
              algorithm: data.algorithm || p.algorithm,
              status: data.status || p.status,
              creator: data.creator || p.creator,
              createTime: data.createTime || p.createTime,
              memberCount: Number(data.memberCount) ?? p.memberCount,
              dataSourceCount: Number(data.dataSourceCount) ?? p.dataSourceCount,
              taskCount: Number(data.taskCount) ?? p.taskCount,
            }
          : p
      );
      setProjects(updated);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setParties(parties.filter(pt => pt.projectId !== selectedProject.id));
      setDataSources(dataSources.filter(ds => ds.projectId !== selectedProject.id));
      setSecurityPolicies(securityPolicies.filter(sp => sp.projectId !== selectedProject.id));
    }
  };

  /* ─── Handlers: Approvals ─── */
  const handleApprovalCreate = () => {
    setSelectedApproval(null);
    setApprovalDialogMode("create");
    setApprovalForm({});
    setApprovalDialogOpen(true);
  };

  const handleApprovalEdit = (approval: ProjectApproval) => {
    setSelectedApproval(approval);
    setApprovalDialogMode("edit");
    setApprovalForm({ ...approval });
    setApprovalDialogOpen(true);
  };

  const handleApprovalSubmit = () => {
    if (approvalDialogMode === "create") {
      const newApproval: ProjectApproval = {
        id: `APR-${Date.now().toString(36).toUpperCase()}`,
        projectName: approvalForm.projectName || "",
        applicant: approvalForm.applicant || "",
        applyTime: approvalForm.applyTime || new Date().toISOString().replace("T", " ").slice(0, 16),
        approvalStatus: approvalForm.approvalStatus || "pending",
        approver: approvalForm.approver || "",
        comment: approvalForm.comment || "",
      };
      setApprovals([...approvals, newApproval]);
    } else if (selectedApproval) {
      setApprovals(approvals.map(a =>
        a.id === selectedApproval.id
          ? { ...a, ...approvalForm, id: a.id }
          : a
      ));
    }
    setApprovalDialogOpen(false);
  };

  const handleApprovalDelete = (approval: ProjectApproval) => {
    setApprovals(approvals.filter(a => a.id !== approval.id));
  };

  const handleApprove = (approval: ProjectApproval) => {
    setApprovals(approvals.map(a =>
      a.id === approval.id ? { ...a, approvalStatus: "approved" as const, approver: " admin" } : a
    ));
  };

  const handleReject = (approval: ProjectApproval) => {
    setApprovals(approvals.map(a =>
      a.id === approval.id ? { ...a, approvalStatus: "rejected" as const, approver: " admin" } : a
    ));
  };

  /* ─── Handlers: Parties ─── */
  const handleInviteParty = () => {
    setPartyFormProjectId(projects[0]?.id || "");
    setPartyFormName("");
    setPartyFormRole("data_provider");
    setPartyDialogOpen(true);
  };

  const handlePartySubmit = () => {
    if (!partyFormName || !partyFormProjectId) return;
    const newParty: ProjectParty = {
      id: `PTY-${Date.now().toString(36).toUpperCase()}`,
      projectId: partyFormProjectId,
      name: partyFormName,
      role: partyFormRole,
    };
    setParties([...parties, newParty]);
    setProjects(projects.map(p =>
      p.id === partyFormProjectId ? { ...p, memberCount: p.memberCount + 1 } : p
    ));
    setPartyDialogOpen(false);
  };

  const handleRemoveParty = (party: ProjectParty) => {
    setParties(parties.filter(p => p.id !== party.id));
    setProjects(projects.map(p =>
      p.id === party.projectId ? { ...p, memberCount: Math.max(0, p.memberCount - 1) } : p
    ));
  };

  /* ─── Handlers: Data Sources ─── */
  const handleAddDataSource = () => {
    setDsStep(1);
    setDsForm({ projectId: projects[0]?.id || "" });
    setDsEditingId(null);
    setDsDialogOpen(true);
  };

  const handleEditDataSource = (ds: ProjectDataSource) => {
    setDsStep(1);
    setDsForm({ ...ds });
    setDsEditingId(ds.id);
    setDsDialogOpen(true);
  };

  const handleDsSubmit = () => {
    if (dsEditingId) {
      setDataSources(dataSources.map(ds => ds.id === dsEditingId ? { ...ds, ...dsForm, id: dsEditingId } : ds));
    } else {
      const newDs: ProjectDataSource = {
        id: `DS-${Date.now().toString(36).toUpperCase()}`,
        projectId: dsForm.projectId || projects[0]?.id || "",
        name: dsForm.name || "",
        type: dsForm.type || "MySQL",
        size: dsForm.size || "",
        format: dsForm.format || "结构化",
        encryptionStatus: dsForm.encryptionStatus || "unencrypted",
      };
      setDataSources([...dataSources, newDs]);
      setProjects(projects.map(p =>
        p.id === newDs.projectId ? { ...p, dataSourceCount: p.dataSourceCount + 1 } : p
      ));
    }
    setDsDialogOpen(false);
  };

  const handleRemoveDataSource = (ds: ProjectDataSource) => {
    setDataSources(dataSources.filter(d => d.id !== ds.id));
    setProjects(projects.map(p =>
      p.id === ds.projectId ? { ...p, dataSourceCount: Math.max(0, p.dataSourceCount - 1) } : p
    ));
  };

  /* ─── Handlers: Security Policy ─── */
  const handleSavePolicy = () => {
    if (!policyProjectId) return;
    setSecurityPolicies(securityPolicies.map(sp =>
      sp.projectId === policyProjectId
        ? { ...sp, protocol: policyForm.protocol || sp.protocol, precision: policyForm.precision || sp.precision, timeout: Number(policyForm.timeout) || sp.timeout }
        : sp
    ));
    setProjects(projects.map(p =>
      p.id === policyProjectId ? { ...p, communicationProtocol: policyForm.protocol || p.communicationProtocol } : p
    ));
    alert("安全策略已保存");
  };

  const handleResetPolicy = () => {
    const sp = securityPolicies.find(s => s.projectId === policyProjectId);
    if (sp) setPolicyForm({ ...sp });
  };

  /* ─── Columns ─── */
  const projectColumns = [
    { key: "id", title: "项目ID", render: (p: SecretProject) => <span className="font-mono text-xs text-slate-500">{p.id}</span> },
    { key: "name", title: "项目名称", render: (p: SecretProject) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: "algorithm", title: "算法类型", render: (p: SecretProject) => <Badge className={cn(algorithmColors[p.algorithm], "font-medium")}>{algorithmLabels[p.algorithm]}</Badge> },
    { key: "status", title: "状态", render: (p: SecretProject) => <StatusTag status={p.status === "planning" ? "info" : p.status === "running" ? "warning" : p.status === "completed" ? "success" : p.status === "archived" ? "disabled" : "danger"} text={p.status === "planning" ? "规划中" : p.status === "running" ? "进行中" : p.status === "completed" ? "已完成" : p.status === "archived" ? "已归档" : "失败"} /> },
    { key: "members", title: "成员/数据源", render: (p: SecretProject) => <div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.memberCount}</span><span className="flex items-center gap-1"><Database className="w-3 h-3" />{p.dataSourceCount}</span></div> },
    { key: "creator", title: "创建者", render: (p: SecretProject) => <span className="text-xs text-slate-500">{p.creator}</span> },
    { key: "time", title: "创建时间", render: (p: SecretProject) => <span className="text-xs text-slate-500">{p.createTime}</span> },
    { key: "actions", title: "操作", render: (p: SecretProject) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleView(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="查看"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="编辑"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleStartStop(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600" title={p.status === "running" ? "停止" : "启动"}>
          {p.status === "running" ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => handleArchive(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-amber-600" title="归档" disabled={p.status !== "completed"}><Archive className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleViewTasks(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-emerald-600" title="查看任务"><ListTodo className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  const approvalColumns = [
    { key: "projectName", title: "项目名称", render: (a: ProjectApproval) => <span className="font-medium text-slate-800">{a.projectName}</span> },
    { key: "applicant", title: "申请人", render: (a: ProjectApproval) => <span className="text-xs text-slate-500">{a.applicant}</span> },
    { key: "applyTime", title: "申请时间", render: (a: ProjectApproval) => <span className="text-xs text-slate-500">{a.applyTime}</span> },
    { key: "approvalStatus", title: "审批状态", render: (a: ProjectApproval) => <StatusTag status={a.approvalStatus === "pending" ? "warning" : a.approvalStatus === "approved" ? "success" : "danger"} text={a.approvalStatus === "pending" ? "待审批" : a.approvalStatus === "approved" ? "已通过" : "已拒绝"} /> },
    { key: "approver", title: "审批人", render: (a: ProjectApproval) => <span className="text-xs text-slate-500">{a.approver || "-"}</span> },
    { key: "comment", title: "审批意见", render: (a: ProjectApproval) => <span className="text-xs text-slate-500 max-w-[200px] truncate block">{a.comment || "-"}</span> },
    { key: "actions", title: "操作", render: (a: ProjectApproval) => (
      <div className="flex items-center gap-1">
        {a.approvalStatus === "pending" && (
          <>
            <button onClick={() => handleApprove(a)} className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-500" title="通过"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleReject(a)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500" title="拒绝"><XCircle className="w-3.5 h-3.5" /></button>
          </>
        )}
        <button onClick={() => handleApprovalEdit(a)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="编辑"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleApprovalDelete(a)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  const partyColumns = [
    { key: "name", title: "参与方名称", render: (p: ProjectParty) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: "project", title: "所属项目", render: (p: ProjectParty) => <span className="text-xs text-slate-500">{projects.find(proj => proj.id === p.projectId)?.name || p.projectId}</span> },
    { key: "role", title: "角色", render: (p: ProjectParty) => <Badge variant="outline" className="font-normal">{roleLabels[p.role]}</Badge> },
    { key: "actions", title: "操作", render: (p: ProjectParty) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleRemoveParty(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600" title="移除"><UserMinus className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  const dsColumns = [
    { key: "name", title: "数据源名称", render: (ds: ProjectDataSource) => <span className="font-medium text-slate-800">{ds.name}</span> },
    { key: "project", title: "所属项目", render: (ds: ProjectDataSource) => <span className="text-xs text-slate-500">{projects.find(p => p.id === ds.projectId)?.name || ds.projectId}</span> },
    { key: "type", title: "类型", render: (ds: ProjectDataSource) => <Badge variant="secondary" className="text-xs">{ds.type}</Badge> },
    { key: "size", title: "大小", render: (ds: ProjectDataSource) => <span className="text-xs text-slate-500">{ds.size}</span> },
    { key: "format", title: "格式", render: (ds: ProjectDataSource) => <span className="text-xs text-slate-500">{ds.format}</span> },
    { key: "encryption", title: "加密状态", render: (ds: ProjectDataSource) => ds.encryptionStatus === "encrypted" ? <span className="flex items-center gap-1 text-xs text-emerald-600"><Lock className="w-3 h-3" />已加密</span> : <span className="flex items-center gap-1 text-xs text-amber-600"><Unlock className="w-3 h-3" />未加密</span> },
    { key: "actions", title: "操作", render: (ds: ProjectDataSource) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEditDataSource(ds)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="编辑"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleRemoveDataSource(ds)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  /* ─── Detail Drawer Data ─── */
  const selectedPolicy = selectedProject ? securityPolicies.find(sp => sp.projectId === selectedProject.id) : null;
  const selectedParties = selectedProject ? parties.filter(p => p.projectId === selectedProject.id) : [];
  const selectedDataSources = selectedProject ? dataSources.filter(ds => ds.projectId === selectedProject.id) : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1">
          <TabsTrigger value="projects" className="gap-1.5"><FolderOpen className="w-4 h-4" />项目列表</TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1.5"><CheckCircle className="w-4 h-4" />项目审批</TabsTrigger>
          <TabsTrigger value="parties" className="gap-1.5"><Users className="w-4 h-4" />参与方管理</TabsTrigger>
          <TabsTrigger value="datasources" className="gap-1.5"><Database className="w-4 h-4" />数据源配置</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="w-4 h-4" />安全策略</TabsTrigger>
        </TabsList>

        {/* ─── Tab: Projects ─── */}
        <TabsContent value="projects" className="mt-4 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索项目ID或名称" className="pl-9 w-64" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                <option value="all">全部状态</option><option value="planning">规划中</option><option value="running">进行中</option><option value="completed">已完成</option><option value="failed">失败</option><option value="archived">已归档</option>
              </select>
              <select value={algoFilter} onChange={(e) => setAlgoFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                <option value="all">全部算法</option><option value="MPC">MPC</option><option value="HE">HE</option><option value="ZKP">ZKP</option><option value="TEE">TEE</option>
              </select>
            </div>
            <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" />新建项目</Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <DataTable rowKey={(r: any) => r.id} columns={projectColumns} data={filteredProjects} />
          </div>
        </TabsContent>

        {/* ─── Tab: Approvals ─── */}
        <TabsContent value="approvals" className="mt-4 space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索项目名称或申请人" className="pl-9 w-64" onChange={(e) => {
                const val = e.target.value.toLowerCase();
                // filter in place via state would be better, but for simplicity we re-filter
                // Using a local filtered state would be cleaner; here's a quick inline approach:
                if (!val) {
                  setApprovals(initialApprovals);
                  return;
                }
                setApprovals(initialApprovals.filter(a => a.projectName.toLowerCase().includes(val) || a.applicant.toLowerCase().includes(val)));
              }} />
            </div>
            <Button onClick={handleApprovalCreate} className="gap-2"><Plus className="w-4 h-4" />新建申请</Button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <DataTable rowKey={(r: any) => r.id} columns={approvalColumns} data={approvals} />
          </div>
        </TabsContent>

        {/* ─── Tab: Parties ─── */}
        <TabsContent value="parties" className="mt-4 space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索参与方" className="pl-9 w-64" onChange={(e) => {
                const val = e.target.value.toLowerCase();
                if (!val) { setParties(initialParties); return; }
                setParties(initialParties.filter(p => p.name.toLowerCase().includes(val)));
              }} />
            </div>
            <Button onClick={handleInviteParty} className="gap-2"><UserPlus className="w-4 h-4" />邀请参与方</Button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <DataTable rowKey={(r: any) => r.id} columns={partyColumns} data={parties} />
          </div>
        </TabsContent>

        {/* ─── Tab: Data Sources ─── */}
        <TabsContent value="datasources" className="mt-4 space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索数据源" className="pl-9 w-64" onChange={(e) => {
                const val = e.target.value.toLowerCase();
                if (!val) { setDataSources(initialDataSources); return; }
                setDataSources(initialDataSources.filter(ds => ds.name.toLowerCase().includes(val)));
              }} />
            </div>
            <Button onClick={handleAddDataSource} className="gap-2"><Plus className="w-4 h-4" />添加数据源</Button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <DataTable rowKey={(r: any) => r.id} columns={dsColumns} data={dataSources} />
          </div>
        </TabsContent>

        {/* ─── Tab: Security Policy ─── */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <Label>选择项目</Label>
                <select
                  value={policyProjectId || ""}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setPolicyProjectId(pid);
                    const sp = securityPolicies.find(s => s.projectId === pid);
                    if (sp) setPolicyForm({ ...sp });
                  }}
                  className="mt-1 h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600"
                >
                  <option value="">请选择项目</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {policyProjectId && (
                <>
                  <div>
                    <Label>通信协议</Label>
                    <select
                      value={policyForm.protocol || securityPolicies.find(s => s.projectId === policyProjectId)?.protocol || "SSL/TLS"}
                      onChange={(e) => setPolicyForm({ ...policyForm, protocol: e.target.value })}
                      className="mt-1 h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600"
                    >
                      <option value="SSL/TLS">SSL/TLS</option>
                      <option value="SPDZ">SPDZ</option>
                      <option value="ABY3">ABY3</option>
                    </select>
                  </div>
                  <div>
                    <Label>计算精度</Label>
                    <Input
                      value={policyForm.precision || securityPolicies.find(s => s.projectId === policyProjectId)?.precision || ""}
                      onChange={(e) => setPolicyForm({ ...policyForm, precision: e.target.value })}
                      placeholder="例如: 64-bit"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>超时时间 (秒)</Label>
                    <Input
                      type="number"
                      value={policyForm.timeout || securityPolicies.find(s => s.projectId === policyProjectId)?.timeout || ""}
                      onChange={(e) => setPolicyForm({ ...policyForm, timeout: e.target.value })}
                      placeholder="300"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSavePolicy} className="gap-2"><Save className="w-4 h-4" />保存</Button>
                    <Button variant="outline" onClick={handleResetPolicy} className="gap-2"><RotateCcw className="w-4 h-4" />重置</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── CRUD Dialog (Projects) ─── */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="密态项目"
        fields={fields}
        data={selectedProject || {}}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* ─── Approval Dialog ─── */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{approvalDialogMode === "create" ? "新建" : "编辑"}审批记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>项目名称 <span className="text-red-500">*</span></Label>
              <Input value={approvalForm.projectName || ""} onChange={e => setApprovalForm({ ...approvalForm, projectName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>申请人 <span className="text-red-500">*</span></Label>
              <Input value={approvalForm.applicant || ""} onChange={e => setApprovalForm({ ...approvalForm, applicant: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>申请时间</Label>
              <Input value={approvalForm.applyTime || ""} onChange={e => setApprovalForm({ ...approvalForm, applyTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>审批状态</Label>
              <select value={approvalForm.approvalStatus || "pending"} onChange={e => setApprovalForm({ ...approvalForm, approvalStatus: e.target.value })} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                <option value="pending">待审批</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>审批人</Label>
              <Input value={approvalForm.approver || ""} onChange={e => setApprovalForm({ ...approvalForm, approver: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>审批意见</Label>
              <textarea value={approvalForm.comment || ""} onChange={e => setApprovalForm({ ...approvalForm, comment: e.target.value })} className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>取消</Button>
            <Button onClick={handleApprovalSubmit}>{approvalDialogMode === "create" ? "创建" : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Party Invite Dialog ─── */}
      <Dialog open={partyDialogOpen} onOpenChange={setPartyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>邀请参与方</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选择项目 <span className="text-red-500">*</span></Label>
              <select value={partyFormProjectId} onChange={e => setPartyFormProjectId(e.target.value)} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>参与方 <span className="text-red-500">*</span></Label>
              <select value={partyFormName} onChange={e => setPartyFormName(e.target.value)} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                <option value="">请选择</option>
                {availableParties.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>角色 <span className="text-red-500">*</span></Label>
              <select value={partyFormRole} onChange={e => setPartyFormRole(e.target.value as ProjectParty["role"])} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                <option value="data_provider">数据提供方</option>
                <option value="computation_node">计算节点</option>
                <option value="result_receiver">结果接收方</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartyDialogOpen(false)}>取消</Button>
            <Button onClick={handlePartySubmit}>邀请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Data Source Wizard Dialog ─── */}
      <Dialog open={dsDialogOpen} onOpenChange={setDsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dsEditingId ? "编辑" : "添加"}数据源</DialogTitle>
          </DialogHeader>
          {dsStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>所属项目 <span className="text-red-500">*</span></Label>
                <select value={dsForm.projectId || ""} onChange={e => setDsForm({ ...dsForm, projectId: e.target.value })} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>数据源名称 <span className="text-red-500">*</span></Label>
                <Input value={dsForm.name || ""} onChange={e => setDsForm({ ...dsForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <select value={dsForm.type || "MySQL"} onChange={e => setDsForm({ ...dsForm, type: e.target.value })} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                  <option value="MySQL">MySQL</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="Oracle">Oracle</option>
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                  <option value="Parquet">Parquet</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>大小</Label>
                <Input value={dsForm.size || ""} onChange={e => setDsForm({ ...dsForm, size: e.target.value })} placeholder="例如: 2.3GB" />
              </div>
              <div className="space-y-2">
                <Label>格式</Label>
                <select value={dsForm.format || "结构化"} onChange={e => setDsForm({ ...dsForm, format: e.target.value })} className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                  <option value="结构化">结构化</option>
                  <option value="半结构化">半结构化</option>
                  <option value="非结构化">非结构化</option>
                  <option value="文件">文件</option>
                </select>
              </div>
            </div>
          )}
          {dsStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>加密状态</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="enc" checked={(dsForm.encryptionStatus || "unencrypted") === "encrypted"} onChange={() => setDsForm({ ...dsForm, encryptionStatus: "encrypted" })} />
                    已加密
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="enc" checked={(dsForm.encryptionStatus || "unencrypted") === "unencrypted"} onChange={() => setDsForm({ ...dsForm, encryptionStatus: "unencrypted" })} />
                    未加密
                  </label>
                </div>
              </div>
              {dsForm.encryptionStatus === "encrypted" && (
                <div className="space-y-2">
                  <Label>加密算法</Label>
                  <select className="h-9 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                    <option>AES-256-GCM</option>
                    <option>SM4</option>
                    <option>ChaCha20-Poly1305</option>
                  </select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (dsStep === 2) setDsStep(1); else setDsDialogOpen(false); }}>
              {dsStep === 2 ? "上一步" : "取消"}
            </Button>
            {dsStep === 1 ? (
              <Button onClick={() => setDsStep(2)}>下一步</Button>
            ) : (
              <Button onClick={handleDsSubmit}>{dsEditingId ? "保存" : "创建"}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Drawer (with tabs) ─── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg w-full">
          <SheetHeader>
            <SheetTitle>密态项目详情</SheetTitle>
          </SheetHeader>
          {selectedProject && (
            <>
              <div className="mt-4 border-b border-slate-200">
                <div className="flex gap-4">
                  {[
                    { key: "basic", label: "基本信息" },
                    { key: "parties", label: "参与方" },
                    { key: "datasources", label: "数据源" },
                    { key: "security", label: "安全策略" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setDrawerTab(tab.key)}
                      className={cn(
                        "pb-2 text-sm font-medium border-b-2 transition-colors",
                        drawerTab === tab.key ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-220px)] mt-4">
                <div className="space-y-4 pr-4">
                  {drawerTab === "basic" && (
                    <>
                      {[
                        { key: "id", label: "项目ID" },
                        { key: "name", label: "项目名称" },
                        { key: "description", label: "项目描述" },
                        { key: "algorithm", label: "算法类型", type: "badge" as const },
                        { key: "status", label: "状态", type: "badge" as const },
                        { key: "creator", label: "创建者" },
                        { key: "createTime", label: "创建时间", type: "date" as const },
                        { key: "memberCount", label: "成员数" },
                        { key: "dataSourceCount", label: "数据源数" },
                        { key: "taskCount", label: "任务数" },
                        { key: "securityLevel", label: "安全等级", type: "badge" as const },
                        { key: "communicationProtocol", label: "通信协议", type: "badge" as const },
                        { key: "phases", label: "项目阶段", type: "list" as const },
                      ].map((field, index) => {
                        const rawValue = (selectedProject as Record<string, any>)[field.key];
                        const value = field.key === "algorithm" ? algorithmLabels[rawValue] || rawValue
                          : field.key === "status" ? (rawValue === "planning" ? "规划中" : rawValue === "running" ? "进行中" : rawValue === "completed" ? "已完成" : rawValue === "archived" ? "已归档" : "失败")
                          : rawValue;
                        return (
                          <div key={field.key}>
                            {index > 0 && <Separator className="mb-4" />}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field.label}</p>
                              {field.type === "badge" ? (
                                <Badge variant="outline" className="font-normal">{value}</Badge>
                              ) : field.type === "date" ? (
                                <span className="text-sm text-gray-500">{value}</span>
                              ) : field.type === "list" ? (
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(value) ? value.map((item, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                                  )) : value}
                                </div>
                              ) : (
                                <span className="text-sm">{value}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {drawerTab === "parties" && (
                    <div className="space-y-3">
                      {selectedParties.length === 0 ? (
                        <p className="text-sm text-slate-400">暂无参与方</p>
                      ) : (
                        selectedParties.map(party => (
                          <div key={party.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{party.name}</p>
                              <p className="text-xs text-slate-500">{roleLabels[party.role]}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveParty(party)}><Trash2 className="w-3.5 h-3.5 text-slate-400" /></Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {drawerTab === "datasources" && (
                    <div className="space-y-3">
                      {selectedDataSources.length === 0 ? (
                        <p className="text-sm text-slate-400">暂无数据源</p>
                      ) : (
                        selectedDataSources.map(ds => (
                          <div key={ds.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{ds.name}</p>
                              <p className="text-xs text-slate-500">{ds.type} · {ds.size} · {ds.format}</p>
                            </div>
                            {ds.encryptionStatus === "encrypted" ? <Lock className="w-4 h-4 text-emerald-500" /> : <Unlock className="w-4 h-4 text-amber-500" />}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {drawerTab === "security" && selectedPolicy && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">通信协议</p>
                        <Badge variant="outline" className="font-normal mt-1">{selectedPolicy.protocol}</Badge>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">计算精度</p>
                        <p className="text-sm mt-1">{selectedPolicy.precision}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">超时时间</p>
                        <p className="text-sm mt-1">{selectedPolicy.timeout} 秒</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setDrawerOpen(false); handleEdit(selectedProject); }}>编辑</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { setDrawerOpen(false); handleDelete(selectedProject); }}>删除</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
