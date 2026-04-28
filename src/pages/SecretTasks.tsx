import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Plus, Search, Play, Square, RotateCcw, Eye, Clock, CheckCircle, XCircle, PauseCircle, ChevronRight, Database, Users, Cpu, Pencil, Trash2,
  FileText, Download, Filter, Search as SearchIcon, Copy, Pause, PlayCircle, X, ChevronDown, ChevronUp, GripVertical, Save, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SecretTask {
  id: string; name: string; project: string; algorithm: string;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  progress: number; participants: number; startTime: string; duration: string;
  dependencies?: string[];
}

interface TaskResult {
  summary: string;
  computationTime: string;
  accuracy: string;
  f1Score: string;
  precision: string;
  recall: string;
  preview: { col1: string; col2: string; col3: string; col4: string; col5: string }[];
}

interface TaskLog {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  config: Partial<SecretTask>;
}

const generateId = () => Date.now().toString(36).toUpperCase();

const initialTasks: SecretTask[] = [
  { id: "ST-001", name: "联合训练-第3轮", project: "联合风控建模", algorithm: "MPC", status: "running", progress: 65, participants: 5, startTime: "2026-04-21 09:00", duration: "2h 15m", dependencies: ["ST-013"] },
  { id: "ST-002", name: "数据聚合统计", project: "跨机构统计", algorithm: "MPC", status: "running", progress: 42, participants: 6, startTime: "2026-04-21 08:30", duration: "3h 45m", dependencies: [] },
  { id: "ST-003", name: "基因序列比对", project: "基因数据计算", algorithm: "HE", status: "failed", progress: 0, participants: 7, startTime: "2026-04-20 14:00", duration: "-", dependencies: [] },
  { id: "ST-004", name: "身份验证测试", project: "身份隐私验证", algorithm: "ZKP", status: "completed", progress: 100, participants: 3, startTime: "2026-04-19 10:00", duration: "45m", dependencies: [] },
  { id: "ST-005", name: "加密特征提取", project: "医疗数据融合", algorithm: "HE", status: "running", progress: 78, participants: 8, startTime: "2026-04-21 07:00", duration: "4h 30m", dependencies: ["ST-004"] },
  { id: "ST-006", name: "安全推理-批次2", project: "安全图像识别", algorithm: "TEE", status: "pending", progress: 0, participants: 4, startTime: "-", duration: "-", dependencies: ["ST-017"] },
  { id: "ST-007", name: "投票结果汇总", project: "隐私投票系统", algorithm: "ZKP", status: "completed", progress: 100, participants: 2, startTime: "2026-04-18 09:00", duration: "15m", dependencies: [] },
  { id: "ST-008", name: "联合训练-第5轮", project: "隐私推荐引擎", algorithm: "HE", status: "paused", progress: 30, participants: 4, startTime: "2026-04-21 06:00", duration: "5h 10m", dependencies: ["ST-018"] },
  { id: "ST-009", name: "供应链数据对齐", project: "供应链协同", algorithm: "MPC", status: "running", progress: 55, participants: 10, startTime: "2026-04-21 05:00", duration: "6h 20m", dependencies: [] },
  { id: "ST-010", name: "密钥分发验证", project: "密钥管理优化", algorithm: "TEE", status: "pending", progress: 0, participants: 3, startTime: "-", duration: "-", dependencies: [] },
  { id: "ST-011", name: "年龄证明生成", project: "年龄验证", algorithm: "ZKP", status: "completed", progress: 100, participants: 2, startTime: "2026-04-17 11:00", duration: "5m", dependencies: [] },
  { id: "ST-012", name: "日志异常检测", project: "安全日志分析", algorithm: "TEE", status: "pending", progress: 0, participants: 3, startTime: "-", duration: "-", dependencies: ["ST-010"] },
  { id: "ST-013", name: "联合训练-第2轮", project: "联合风控建模", algorithm: "MPC", status: "completed", progress: 100, participants: 5, startTime: "2026-04-20 08:00", duration: "1h 50m", dependencies: [] },
  { id: "ST-014", name: "加密矩阵运算", project: "基因数据计算", algorithm: "HE", status: "failed", progress: 0, participants: 7, startTime: "2026-04-19 16:00", duration: "-", dependencies: ["ST-003"] },
  { id: "ST-015", name: "跨域特征聚合", project: "供应链协同", algorithm: "MPC", status: "running", progress: 12, participants: 10, startTime: "2026-04-21 10:00", duration: "1h 5m", dependencies: [] },
  { id: "ST-016", name: "证明参数调优", project: "身份隐私验证", algorithm: "ZKP", status: "completed", progress: 100, participants: 3, startTime: "2026-04-16 14:00", duration: "30m", dependencies: ["ST-004"] },
  { id: "ST-017", name: "安全训练-批次1", project: "安全图像识别", algorithm: "TEE", status: "running", progress: 88, participants: 4, startTime: "2026-04-21 03:00", duration: "8h 15m", dependencies: [] },
  { id: "ST-018", name: "推荐模型更新", project: "隐私推荐引擎", algorithm: "HE", status: "pending", progress: 0, participants: 4, startTime: "-", duration: "-", dependencies: [] },
];

const mockResults: Record<string, TaskResult> = {
  "ST-004": {
    summary: "身份验证测试成功完成，所有参与方均通过零知识证明验证。",
    computationTime: "45m 12s",
    accuracy: "99.8%",
    f1Score: "0.996",
    precision: "0.998",
    recall: "0.994",
    preview: [
      { col1: "user_001", col2: "verified", col3: "0.999", col4: "pass", col5: "2026-04-19" },
      { col1: "user_002", col2: "verified", col3: "0.997", col4: "pass", col5: "2026-04-19" },
      { col1: "user_003", col2: "failed", col3: "0.832", col4: "reject", col5: "2026-04-19" },
      { col1: "user_004", col2: "verified", col3: "0.995", col4: "pass", col5: "2026-04-19" },
      { col1: "user_005", col2: "verified", col3: "0.998", col4: "pass", col5: "2026-04-19" },
    ],
  },
  "ST-007": {
    summary: "投票结果汇总完成，共收集2,340张有效选票，零知识证明验证通过。",
    computationTime: "15m 30s",
    accuracy: "100%",
    f1Score: "1.000",
    precision: "1.000",
    recall: "1.000",
    preview: [
      { col1: "option_A", col2: "1,245", col3: "53.2%", col4: "valid", col5: "2026-04-18" },
      { col1: "option_B", col2: "892", col3: "38.1%", col4: "valid", col5: "2026-04-18" },
      { col1: "option_C", col2: "203", col3: "8.7%", col4: "valid", col5: "2026-04-18" },
      { col1: "invalid", col2: "0", col3: "0.0%", col4: "valid", col5: "2026-04-18" },
      { col1: "total", col2: "2,340", col3: "100%", col4: "valid", col5: "2026-04-18" },
    ],
  },
  "ST-011": {
    summary: "年龄证明生成任务完成，所有证明均满足隐私保护要求。",
    computationTime: "5m 18s",
    accuracy: "100%",
    f1Score: "1.000",
    precision: "1.000",
    recall: "1.000",
    preview: [
      { col1: "proof_001", col2: "age>=18", col3: "valid", col4: "ZKP", col5: "2026-04-17" },
      { col1: "proof_002", col2: "age>=21", col3: "valid", col4: "ZKP", col5: "2026-04-17" },
      { col1: "proof_003", col2: "age>=18", col3: "valid", col4: "ZKP", col5: "2026-04-17" },
      { col1: "proof_004", col2: "age>=65", col3: "valid", col4: "ZKP", col5: "2026-04-17" },
      { col1: "proof_005", col2: "age>=18", col3: "valid", col4: "ZKP", col5: "2026-04-17" },
    ],
  },
  "ST-013": {
    summary: "联合训练第2轮完成，模型性能显著提升。",
    computationTime: "1h 50m 05s",
    accuracy: "94.2%",
    f1Score: "0.938",
    precision: "0.941",
    recall: "0.935",
    preview: [
      { col1: "epoch_10", col2: "0.892", col3: "0.901", col4: "improving", col5: "2026-04-20" },
      { col1: "epoch_20", col2: "0.918", col3: "0.925", col4: "improving", col5: "2026-04-20" },
      { col1: "epoch_30", col2: "0.935", col3: "0.938", col4: "improving", col5: "2026-04-20" },
      { col1: "epoch_40", col2: "0.940", col3: "0.942", col4: "stable", col5: "2026-04-20" },
      { col1: "epoch_50", col2: "0.942", col3: "0.938", col4: "stable", col5: "2026-04-20" },
    ],
  },
  "ST-016": {
    summary: "证明参数调优完成，找到了最优参数组合。",
    computationTime: "30m 45s",
    accuracy: "97.5%",
    f1Score: "0.973",
    precision: "0.978",
    recall: "0.968",
    preview: [
      { col1: "param_set_1", col2: "0.961", col3: "120ms", col4: "good", col5: "2026-04-16" },
      { col1: "param_set_2", col2: "0.968", col3: "145ms", col4: "better", col5: "2026-04-16" },
      { col1: "param_set_3", col2: "0.973", col3: "138ms", col4: "best", col5: "2026-04-16" },
      { col1: "param_set_4", col2: "0.970", col3: "152ms", col4: "good", col5: "2026-04-16" },
      { col1: "param_set_5", col2: "0.965", col3: "110ms", col4: "fast", col5: "2026-04-16" },
    ],
  },
};

const mockLogs: Record<string, TaskLog[]> = {
  "ST-001": [
    { timestamp: "2026-04-21 09:00:01", level: "INFO", message: "任务初始化完成" },
    { timestamp: "2026-04-21 09:00:05", level: "INFO", message: "MPC协议握手成功，参与方: 5" },
    { timestamp: "2026-04-21 09:05:23", level: "INFO", message: "第1轮训练开始，batch_size=64" },
    { timestamp: "2026-04-21 09:15:42", level: "WARN", message: "参与方3响应延迟 > 500ms" },
    { timestamp: "2026-04-21 09:30:10", level: "INFO", message: "第10轮完成，loss=0.823" },
    { timestamp: "2026-04-21 09:45:33", level: "INFO", message: "第20轮完成，loss=0.691" },
    { timestamp: "2026-04-21 10:00:15", level: "WARN", message: "梯度裁剪触发，max_norm=1.0" },
    { timestamp: "2026-04-21 10:15:08", level: "INFO", message: "第30轮完成，loss=0.542" },
    { timestamp: "2026-04-21 10:30:45", level: "INFO", message: "第40轮完成，loss=0.431" },
    { timestamp: "2026-04-21 10:45:22", level: "INFO", message: "进度 65%，预计剩余 1h 10m" },
  ],
  "ST-002": [
    { timestamp: "2026-04-21 08:30:00", level: "INFO", message: "数据聚合任务启动" },
    { timestamp: "2026-04-21 08:30:12", level: "INFO", message: "连接6个数据参与方" },
    { timestamp: "2026-04-21 08:35:45", level: "INFO", message: "数据对齐完成，共12个特征" },
    { timestamp: "2026-04-21 08:45:20", level: "WARN", message: "参与方2数据质量警告：缺失率 3.2%" },
    { timestamp: "2026-04-21 09:00:33", level: "INFO", message: "聚合计算中，进度 42%" },
  ],
  "ST-003": [
    { timestamp: "2026-04-20 14:00:00", level: "INFO", message: "基因序列比对任务启动" },
    { timestamp: "2026-04-20 14:00:10", level: "INFO", message: "加载参考基因组，大小 3.2GB" },
    { timestamp: "2026-04-20 14:05:25", level: "ERROR", message: "内存不足：请求 16GB，可用 12GB" },
    { timestamp: "2026-04-20 14:05:26", level: "ERROR", message: "任务失败：无法分配同态加密上下文" },
    { timestamp: "2026-04-20 14:05:30", level: "WARN", message: "尝试清理缓存并重启..." },
    { timestamp: "2026-04-20 14:05:35", level: "ERROR", message: "重启失败，任务终止" },
  ],
  "ST-004": [
    { timestamp: "2026-04-19 10:00:00", level: "INFO", message: "身份验证测试开始" },
    { timestamp: "2026-04-19 10:00:05", level: "INFO", message: "生成零知识证明参数" },
    { timestamp: "2026-04-19 10:05:15", level: "INFO", message: "验证3个参与方身份" },
    { timestamp: "2026-04-19 10:10:30", level: "INFO", message: "所有证明验证通过" },
    { timestamp: "2026-04-19 10:15:00", level: "INFO", message: "生成测试报告" },
    { timestamp: "2026-04-19 10:45:12", level: "INFO", message: "任务完成，耗时 45m" },
  ],
};

const allLogLevels: ("INFO" | "WARN" | "ERROR")[] = ["INFO", "INFO", "INFO", "INFO", "WARN", "INFO", "INFO", "ERROR", "INFO", "WARN"];
const allLogMessages = [
  "任务初始化完成", "连接参与方", "协议握手成功", "数据加载完成", "计算开始",
  "进度更新", "参与方响应正常", "数据质量检查通过", "聚合计算中", "结果验证通过",
  "警告：网络延迟波动", "错误：连接超时", "重试连接...", "检查点保存成功",
  "内存使用：65%", "GPU利用率：78%", "任务完成", "生成报告", "清理临时文件"
];

initialTasks.forEach((task) => {
  if (!mockLogs[task.id]) {
    const logs: TaskLog[] = [];
    const count = 5 + Math.floor(Math.random() * 10);
    const baseDate = task.startTime !== "-" ? task.startTime.split(" ")[0] : "2026-04-21";
    for (let i = 0; i < count; i++) {
      const hour = 9 + Math.floor(Math.random() * 8);
      const min = Math.floor(Math.random() * 60);
      const sec = Math.floor(Math.random() * 60);
      logs.push({
        timestamp: `${baseDate} ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`,
        level: allLogLevels[i % allLogLevels.length],
        message: allLogMessages[Math.floor(Math.random() * allLogMessages.length)],
      });
    }
    mockLogs[task.id] = logs;
  }
});

const algoColors: Record<string, string> = { MPC: "bg-blue-500/15 text-blue-500", HE: "bg-purple-500/15 text-purple-500", ZKP: "bg-emerald-500/15 text-emerald-500", TEE: "bg-amber-500/15 text-amber-500" };

const statusTextMap: Record<string, string> = {
  pending: "待执行", running: "执行中", completed: "已完成", failed: "失败", paused: "已暂停"
};

const statusTagMap: Record<string, string> = {
  pending: "info", running: "warning", completed: "success", failed: "danger", paused: "info"
};

const detailFields = [
  { key: "id", label: "任务ID" },
  { key: "name", label: "任务名称" },
  { key: "project", label: "所属项目" },
  { key: "algorithm", label: "算法类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "progress", label: "进度" },
  { key: "participants", label: "参与方数" },
  { key: "startTime", label: "开始时间" },
  { key: "duration", label: "持续时间" },
];

const fields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "project", label: "所属项目", type: "text", required: true },
  { key: "algorithm", label: "算法", type: "select", required: true, options: [
    { label: "MPC", value: "MPC" },
    { label: "HE", value: "HE" },
    { label: "ZKP", value: "ZKP" },
    { label: "TEE", value: "TEE" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "待执行", value: "pending" },
    { label: "执行中", value: "running" },
    { label: "已完成", value: "completed" },
    { label: "失败", value: "failed" },
    { label: "已暂停", value: "paused" },
  ]},
  { key: "progress", label: "进度", type: "number", required: true },
  { key: "participants", label: "参与方", type: "number", required: true },
  { key: "startTime", label: "开始时间", type: "text" },
  { key: "duration", label: "持续时间", type: "text" },
];

export default function SecretTasks() {
  const [tasks, setTasks] = useState<SecretTask[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<Partial<SecretTask>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<SecretTask | null>(null);

  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultTask, setResultTask] = useState<SecretTask | null>(null);

  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logTask, setLogTask] = useState<SecretTask | null>(null);
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
  const [logSearch, setLogSearch] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);

  const [depDialogOpen, setDepDialogOpen] = useState(false);
  const [depTask, setDepTask] = useState<SecretTask | null>(null);
  const [depAddId, setDepAddId] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [templates, setTemplates] = useState<TaskTemplate[]>([
    { id: "TP-001", name: "MPC联合训练模板", config: { algorithm: "MPC", status: "pending", progress: 0, participants: 5 } },
    { id: "TP-002", name: "HE加密计算模板", config: { algorithm: "HE", status: "pending", progress: 0, participants: 7 } },
    { id: "TP-003", name: "ZKP验证模板", config: { algorithm: "ZKP", status: "pending", progress: 0, participants: 3 } },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);

  const filtered = tasks.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCards = [
    { key: "pending", label: "待执行", count: tasks.filter((t) => t.status === "pending").length, color: "bg-slate-100 text-slate-600", icon: Clock },
    { key: "running", label: "执行中", count: tasks.filter((t) => t.status === "running").length, color: "bg-blue-50 text-blue-600", icon: Play },
    { key: "completed", label: "已完成", count: tasks.filter((t) => t.status === "completed").length, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
    { key: "failed", label: "失败", count: tasks.filter((t) => t.status === "failed").length, color: "bg-red-50 text-red-600", icon: XCircle },
  ];

  useEffect(() => {
    if (logDialogOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logDialogOpen, logFilter, logSearch, logTask]);

  const handleCreate = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      setSelectedItem({ ...template.config });
    } else {
      setSelectedItem({});
    }
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (task: SecretTask) => {
    setSelectedItem({ ...task });
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (task: SecretTask) => {
    setSelectedItem({ ...task });
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (task: SecretTask) => {
    setDetailTask(task);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newTask: SecretTask = {
        id: generateId(),
        name: data.name || "",
        project: data.project || "",
        algorithm: data.algorithm || "MPC",
        status: (data.status || "pending") as SecretTask["status"],
        progress: Number(data.progress) || 0,
        participants: Number(data.participants) || 0,
        startTime: data.startTime || "-",
        duration: data.duration || "-",
        dependencies: [],
      };
      setTasks((prev) => [newTask, ...prev]);
    } else if (dialogMode === "edit") {
      const id = selectedItem.id;
      if (!id) return;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                name: data.name || t.name,
                project: data.project || t.project,
                algorithm: data.algorithm || t.algorithm,
                status: data.status || t.status,
                progress: Number(data.progress ?? t.progress),
                participants: Number(data.participants ?? t.participants),
                startTime: data.startTime ?? t.startTime,
                duration: data.duration ?? t.duration,
              }
            : t
        )
      );
    }
  };

  const handleConfirmDelete = () => {
    const id = selectedItem.id;
    if (!id) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (detailTask?.id === id) {
      setDrawerOpen(false);
      setDetailTask(null);
    }
  };

  const handleClone = (task: SecretTask) => {
    const cloned: SecretTask = {
      ...task,
      id: generateId(),
      name: `${task.name}(复制)`,
      status: "pending",
      progress: 0,
      startTime: "-",
      duration: "-",
      dependencies: [],
    };
    setTasks((prev) => [cloned, ...prev]);
  };

  const handleRetry = (task: SecretTask) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: "pending" as const, progress: 0, startTime: "-", duration: "-" } : t));
  };

  const handlePauseResume = (task: SecretTask) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: t.status === "running" ? "paused" as const : "running" as const } : t));
  };

  const handleCancel = (task: SecretTask) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: "failed" as const, progress: 0, duration: "-" } : t));
  };

  const handleStart = (task: SecretTask) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: "running" as const, startTime: new Date().toISOString().slice(0, 16).replace("T", " ") } : t));
  };

  const handleViewResult = (task: SecretTask) => {
    setResultTask(task);
    setResultDialogOpen(true);
  };

  const handleViewLogs = (task: SecretTask) => {
    setLogTask(task);
    setLogDialogOpen(true);
    setLogFilter("ALL");
    setLogSearch("");
  };

  const handleViewDeps = (task: SecretTask) => {
    setDepTask(task);
    setDepDialogOpen(true);
    setDepAddId("");
  };

  const handleAddDep = () => {
    if (!depTask || !depAddId || depAddId === depTask.id) return;
    setTasks((prev) => prev.map((t) => t.id === depTask.id ? { ...t, dependencies: [...(t.dependencies || []), depAddId] } : t));
    setDepTask((prev) => prev ? { ...prev, dependencies: [...(prev.dependencies || []), depAddId] } : null);
    setDepAddId("");
  };

  const handleRemoveDep = (depId: string) => {
    if (!depTask) return;
    setTasks((prev) => prev.map((t) => t.id === depTask.id ? { ...t, dependencies: (t.dependencies || []).filter((d) => d !== depId) } : t));
    setDepTask((prev) => prev ? { ...prev, dependencies: (prev.dependencies || []).filter((d) => d !== depId) } : null);
  };

  const handleBatchStart = () => {
    setTasks((prev) => prev.map((t) => selectedIds.has(t.id) && t.status === "pending" ? { ...t, status: "running" as const, startTime: new Date().toISOString().slice(0, 16).replace("T", " ") } : t));
    setSelectedIds(new Set());
  };

  const handleBatchStop = () => {
    setTasks((prev) => prev.map((t) => selectedIds.has(t.id) && t.status === "running" ? { ...t, status: "paused" as const } : t));
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  };

  const handleBatchClone = () => {
    const toClone = tasks.filter((t) => selectedIds.has(t.id));
    const cloned = toClone.map((task) => ({
      ...task,
      id: generateId(),
      name: `${task.name}(复制)`,
      status: "pending" as const,
      progress: 0,
      startTime: "-",
      duration: "-",
      dependencies: [],
    }));
    setTasks((prev) => [...cloned, ...prev]);
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate: TaskTemplate = {
      id: generateId(),
      name: templateName,
      config: { ...selectedItem },
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setTemplateName("");
    setSaveTemplateOpen(false);
  };

  const result = resultTask ? mockResults[resultTask.id] : null;
  const logs = logTask ? mockLogs[logTask.id] || [] : [];
  const filteredLogs = logs.filter((l) => {
    const matchLevel = logFilter === "ALL" || l.level === logFilter;
    const matchSearch = !logSearch || l.message.toLowerCase().includes(logSearch.toLowerCase());
    return matchLevel && matchSearch;
  });

  const columns = [
    {
      key: "select",
      title: "",
      render: (t: SecretTask) => (
        <input
          type="checkbox"
          checked={selectedIds.has(t.id)}
          onChange={() => handleSelectOne(t.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
        />
      ),
      width: "40px",
    },
    { key: "id", title: "任务ID", render: (t: SecretTask) => <span className="font-mono text-xs text-slate-500">{t.id}</span> },
    { key: "name", title: "任务名称", render: (t: SecretTask) => <span className="font-medium text-slate-800">{t.name}</span> },
    { key: "project", title: "所属项目", render: (t: SecretTask) => <span className="text-xs text-slate-500">{t.project}</span> },
    { key: "algorithm", title: "算法", render: (t: SecretTask) => <Badge className={cn(algoColors[t.algorithm], "font-medium text-xs")}>{t.algorithm}</Badge> },
    { key: "status", title: "状态", render: (t: SecretTask) => <StatusTag status={statusTagMap[t.status] as any} text={statusTextMap[t.status]} /> },
    { key: "progress", title: "进度", render: (t: SecretTask) => (
      <div className="w-full"><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>{t.progress}%</span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all", t.status === "running" ? "bg-blue-500" : t.status === "completed" ? "bg-emerald-500" : "bg-slate-300")} style={{ width: `${t.progress}%` }} /></div></div>
    )},
    { key: "participants", title: "参与方", render: (t: SecretTask) => <span className="flex items-center gap-1 text-xs text-slate-500"><Users className="w-3 h-3" />{t.participants}</span> },
    { key: "dependencies", title: "依赖", render: (t: SecretTask) => (
      <button onClick={() => handleViewDeps(t)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-500 transition-colors">
        <span className={cn("px-2 py-0.5 rounded-full bg-slate-100", (t.dependencies?.length || 0) > 0 && "bg-blue-50 text-blue-600")}>{t.dependencies?.length || 0}</span>
      </button>
    )},
    { key: "actions", title: "操作", render: (t: SecretTask) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleView(t)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="查看"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleEdit(t)} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-500" title="编辑"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(t)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleClone(t)} className="p-1.5 rounded-md hover:bg-purple-50 text-slate-400 hover:text-purple-500" title="克隆"><Copy className="w-3.5 h-3.5" /></button>
        {t.status === "pending" && <button onClick={() => handleStart(t)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500" title="开始"><Play className="w-3.5 h-3.5" /></button>}
        {t.status === "running" && <button onClick={() => handlePauseResume(t)} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500" title="暂停"><Pause className="w-3.5 h-3.5" /></button>}
        {t.status === "paused" && <button onClick={() => handlePauseResume(t)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500" title="恢复"><PlayCircle className="w-3.5 h-3.5" /></button>}
        {t.status === "failed" && <button onClick={() => handleRetry(t)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400" title="重试"><RotateCcw className="w-3.5 h-3.5" /></button>}
        {t.status === "pending" && <button onClick={() => handleCancel(t)} className="p-1.5 rounded-md hover:bg-red-50 text-red-400" title="取消"><X className="w-3.5 h-3.5" /></button>}
        {t.status === "completed" && <button onClick={() => handleViewResult(t)} className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-500" title="查看结果"><FileText className="w-3.5 h-3.5" /></button>}
        <button onClick={() => handleViewLogs(t)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="查看日志"><Database className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  const upstreamTasks = depTask ? tasks.filter((t) => depTask.dependencies?.includes(t.id)) : [];
  const downstreamTasks = depTask ? tasks.filter((t) => t.dependencies?.includes(depTask.id)) : [];
  const availableDeps = depTask ? tasks.filter((t) => t.id !== depTask.id && !(depTask.dependencies || []).includes(t.id)) : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((s) => (
          <div key={s.key} className={cn("rounded-xl p-5 border", s.color.split(" ")[0].replace("bg-", "border-").replace("50", "200"))}>
            <div className="flex items-center justify-between"><span className={cn("text-sm", s.color.split(" ")[1])}>{s.label}</span><s.icon className={cn("w-5 h-5", s.color.split(" ")[1])} /></div>
            <div className={cn("text-2xl font-bold mt-2", s.color.split(" ")[1])}>{s.count}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索任务ID或名称" className="pl-9 w-64" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600"><option value="all">全部状态</option><option value="pending">待执行</option><option value="running">执行中</option><option value="completed">已完成</option><option value="failed">失败</option><option value="paused">已暂停</option></select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600"
            title="选择模板"
          >
            <option value="">不使用模板</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" />新建任务</Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
        >
          <span className="text-sm text-blue-700 font-medium">已选择 {selectedIds.size} 项</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleSelectAll}>
              {selectedIds.size === filtered.length ? "取消全选" : "全选"}
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleBatchStart}><Play className="w-3 h-3" />批量开始</Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleBatchStop}><Pause className="w-3 h-3" />批量暂停</Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleBatchClone}><Copy className="w-3 h-3" />批量克隆</Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs text-red-500 hover:text-red-600 hover:border-red-200" onClick={handleBatchDelete}><Trash2 className="w-3 h-3" />批量删除</Button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-500 hover:text-slate-700 ml-2">取消选择</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedTemplate("");
        }}
        title="密态任务"
        fields={fields}
        data={selectedItem}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="密态任务详情"
        data={detailTask || {}}
        fields={detailFields}
        onEdit={() => detailTask && handleEdit(detailTask)}
        onDelete={() => detailTask && handleDelete(detailTask)}
      />

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              任务结果 - {resultTask?.name}
            </DialogTitle>
            <DialogDescription>查看任务执行结果详情</DialogDescription>
          </DialogHeader>
          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">计算时间</div><div className="text-sm font-semibold text-slate-800">{result.computationTime}</div></div>
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">准确率</div><div className="text-sm font-semibold text-emerald-600">{result.accuracy}</div></div>
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">F1 Score</div><div className="text-sm font-semibold text-slate-800">{result.f1Score}</div></div>
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">精确率 / 召回率</div><div className="text-sm font-semibold text-slate-800">{result.precision} / {result.recall}</div></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500 mb-1">结果摘要</div><div className="text-sm text-slate-700">{result.summary}</div></div>
              <div>
                <div className="text-xs text-slate-500 mb-2">结果预览（前5行）</div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50"><th className="px-3 py-2 text-left font-medium text-slate-600">Col 1</th><th className="px-3 py-2 text-left font-medium text-slate-600">Col 2</th><th className="px-3 py-2 text-left font-medium text-slate-600">Col 3</th><th className="px-3 py-2 text-left font-medium text-slate-600">Col 4</th><th className="px-3 py-2 text-left font-medium text-slate-600">Col 5</th></tr></thead>
                    <tbody>
                      {result.preview.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100"><td className="px-3 py-2 text-slate-700">{row.col1}</td><td className="px-3 py-2 text-slate-700">{row.col2}</td><td className="px-3 py-2 text-slate-700">{row.col3}</td><td className="px-3 py-2 text-slate-700">{row.col4}</td><td className="px-3 py-2 text-slate-700">{row.col5}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Button className="gap-2 w-full" onClick={() => alert("模拟下载结果文件")}><Download className="w-4 h-4" />下载结果</Button>
            </div>
          ) : (
            <div className="text-sm text-slate-500 py-8 text-center">暂无结果数据</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Log Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              任务日志 - {logTask?.name}
            </DialogTitle>
            <DialogDescription>查看任务执行日志</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {(["ALL", "INFO", "WARN", "ERROR"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLogFilter(level)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                    logFilter === level
                      ? level === "ALL" ? "bg-white text-slate-700 shadow-sm" : level === "INFO" ? "bg-blue-50 text-blue-600" : level === "WARN" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {level === "ALL" ? "全部" : level}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="搜索日志关键词" className="pl-8 h-8 text-xs" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg p-3 font-mono text-xs space-y-1 max-h-[400px]">
            {filteredLogs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-400 shrink-0">{log.timestamp}</span>
                <span className={cn(
                  "shrink-0 font-bold w-12",
                  log.level === "INFO" && "text-blue-400",
                  log.level === "WARN" && "text-amber-400",
                  log.level === "ERROR" && "text-red-400"
                )}>[{log.level}]</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && <div className="text-slate-500 text-center py-4">无匹配日志</div>}
            <div ref={logEndRef} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dependency Dialog */}
      <Dialog open={depDialogOpen} onOpenChange={setDepDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-blue-500" />
              依赖管理 - {depTask?.name}
            </DialogTitle>
            <DialogDescription>管理任务的前置和后续依赖</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">前置任务（{upstreamTasks.length}）</div>
              {upstreamTasks.length > 0 ? (
                <div className="space-y-1.5">
                  {upstreamTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{t.id}</span>
                        <span className="text-sm text-slate-700">{t.name}</span>
                        <Badge className={cn(algoColors[t.algorithm], "text-[10px]")}>{t.algorithm}</Badge>
                      </div>
                      <button onClick={() => handleRemoveDep(t.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2">暂无前置任务</div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">后续任务（{downstreamTasks.length}）</div>
              {downstreamTasks.length > 0 ? (
                <div className="space-y-1.5">
                  {downstreamTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="font-mono text-xs text-slate-500">{t.id}</span>
                      <span className="text-sm text-slate-700">{t.name}</span>
                      <Badge className={cn(algoColors[t.algorithm], "text-[10px]")}>{t.algorithm}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2">暂无后续任务</div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-200">
              <div className="text-sm font-medium text-slate-700 mb-2">添加依赖</div>
              <div className="flex items-center gap-2">
                <select value={depAddId} onChange={(e) => setDepAddId(e.target.value)} className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                  <option value="">选择任务</option>
                  {availableDeps.map((t) => (
                    <option key={t.id} value={t.id}>{t.id} - {t.name}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAddDep} disabled={!depAddId}><Plus className="w-3.5 h-3.5" />添加</Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">依赖链</div>
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                {depTask && (
                  <div className="flex flex-wrap items-center gap-1">
                    {upstreamTasks.map((t) => (
                      <span key={t.id} className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-white rounded border border-slate-200">{t.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium">{depTask.name}</span>
                    {downstreamTasks.map((t) => (
                      <span key={t.id} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span className="px-2 py-0.5 bg-white rounded border border-slate-200">{t.name}</span>
                      </span>
                    ))}
                    {upstreamTasks.length === 0 && downstreamTasks.length === 0 && <span className="text-slate-400">无依赖链</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-500" />
              保存为模板
            </DialogTitle>
            <DialogDescription>将当前配置保存为可复用的任务模板</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">模板名称</label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="输入模板名称" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveTemplateOpen(false)}>取消</Button>
            <Button size="sm" onClick={handleSaveTemplate} disabled={!templateName.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
