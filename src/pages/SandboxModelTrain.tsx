import { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as echarts from "echarts";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";
import {
  Play, Pause, Plus, Trash2, Edit3,
  RotateCcw, FlaskConical, BookOpen, CheckCircle2,
  AlertTriangle, XCircle, Eye, Sparkles, BarChart3,
  ChevronDown, ChevronUp, Code2, Tag, Layers, Download,
  GitCompare, FileText, Cpu, Timer, SlidersHorizontal,
  TrendingUp, Target, Crosshair, Gauge, Activity,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

interface Algorithm {
  id: string;
  name: string;
  framework: string;
  version: string;
  status: string;
  accuracy: string;
  created: string;
  category: "分类" | "回归" | "聚类" | "时序";
  description: string;
  params: { name: string; type: string; default: string; desc: string }[];
  scenario: string;
  sampleCode: string;
}

interface TrainingHistory {
  epochs: number[];
  loss: number[];
  accuracy: number[];
}

interface TrainTask {
  id: string;
  name: string;
  algorithm: string;
  status: string;
  epoch: number;
  loss: string;
  time: string;
  started: string;
  hyperparameters: Record<string, string | number>;
  logs: string[];
  trainingHistory: TrainingHistory;
}

interface EvaluationResult {
  taskId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  confusionMatrix: { tp: number; fp: number; fn: number; tn: number };
  rocCurve: { fpr: number[]; tpr: number[] };
  prCurve: { recall: number[]; precision: number[] };
  featureImportance: { name: string; value: number }[];
}

// ─── Mock Data ───────────────────────────────────────────────────────

const initialAlgorithms: Algorithm[] = [
  { id: "ALG-001", name: "XGBoost分类器", framework: "xgboost", version: "2.0.3", status: "active", accuracy: "0.923", created: "2024-01-15", category: "分类", description: "极端梯度提升树，集成学习算法", params: [{ name: "max_depth", type: "int", default: "6", desc: "树的最大深度" }, { name: "learning_rate", type: "float", default: "0.1", desc: "学习率" }, { name: "n_estimators", type: "int", default: "100", desc: "树的数量" }], scenario: "适用于结构化数据的二分类和多分类任务，如信用评分、欺诈检测", sampleCode: `import xgboost as xgb\nmodel = xgb.XGBClassifier(\n    max_depth=6,\n    learning_rate=0.1,\n    n_estimators=100\n)\nmodel.fit(X_train, y_train)` },
  { id: "ALG-002", name: "LightGBM回归", framework: "lightgbm", version: "4.1.0", status: "active", accuracy: "0.887", created: "2024-02-01", category: "回归", description: "微软开源的高效梯度提升框架", params: [{ name: "num_leaves", type: "int", default: "31", desc: "叶子节点数" }, { name: "learning_rate", type: "float", default: "0.05", desc: "学习率" }, { name: "feature_fraction", type: "float", default: "0.9", desc: "特征采样比例" }], scenario: "适用于回归预测任务，如房价预测、销量预测", sampleCode: `import lightgbm as lgb\nmodel = lgb.LGBMRegressor(\n    num_leaves=31,\n    learning_rate=0.05\n)\nmodel.fit(X_train, y_train)` },
  { id: "ALG-003", name: "神经网络MLP", framework: "pytorch", version: "2.1.0", status: "draft", accuracy: "-", created: "2024-02-10", category: "分类", description: "多层感知机神经网络", params: [{ name: "hidden_layers", type: "list", default: "[128,64]", desc: "隐藏层结构" }, { name: "activation", type: "str", default: "relu", desc: "激活函数" }, { name: "dropout", type: "float", default: "0.2", desc: " dropout比率" }], scenario: "适用于非线性分类任务和特征交互复杂的数据", sampleCode: `import torch.nn as nn\nclass MLP(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc = nn.Sequential(\n            nn.Linear(784, 128),\n            nn.ReLU(),\n            nn.Linear(128, 10)\n        )` },
  { id: "ALG-004", name: "随机森林", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.901", created: "2024-01-20", category: "分类", description: "基于Bagging的集成学习算法", params: [{ name: "n_estimators", type: "int", default: "100", desc: "决策树数量" }, { name: "max_depth", type: "int", default: "None", desc: "最大深度" }, { name: "min_samples_split", type: "int", default: "2", desc: "分裂最小样本数" }], scenario: "适用于各类分类任务，对异常值不敏感", sampleCode: `from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(\n    n_estimators=100\n)\nmodel.fit(X_train, y_train)` },
  { id: "ALG-005", name: "逻辑回归", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.856", created: "2024-01-25", category: "分类", description: "经典的线性分类算法", params: [{ name: "C", type: "float", default: "1.0", desc: "正则化强度倒数" }, { name: "solver", type: "str", default: "lbfgs", desc: "优化算法" }, { name: "max_iter", type: "int", default: "100", desc: "最大迭代次数" }], scenario: "适用于线性可分的数据，需要可解释性的场景", sampleCode: `from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(C=1.0)\nmodel.fit(X_train, y_train)` },
  { id: "ALG-006", name: "CatBoost", framework: "catboost", version: "1.2.0", status: "active", accuracy: "0.915", created: "2024-02-05", category: "分类", description: "Yandex开源的梯度提升库", params: [{ name: "depth", type: "int", default: "6", desc: "树深度" }, { name: "iterations", type: "int", default: "1000", desc: "迭代次数" }, { name: "learning_rate", type: "float", default: "0.03", desc: "学习率" }], scenario: "适用于包含大量类别特征的数据", sampleCode: `from catboost import CatBoostClassifier\nmodel = CatBoostClassifier(\n    iterations=1000,\n    depth=6\n)\nmodel.fit(X_train, y_train)` },
  { id: "ALG-007", name: "Transformer", framework: "pytorch", version: "2.1.0", status: "draft", accuracy: "-", created: "2024-02-15", category: "时序", description: "自注意力机制的深度学习模型", params: [{ name: "d_model", type: "int", default: "512", desc: "模型维度" }, { name: "nhead", type: "int", default: "8", desc: "注意力头数" }, { name: "num_layers", type: "int", default: "6", desc: "编码器层数" }], scenario: "适用于序列建模、NLP和时间序列预测", sampleCode: `import torch.nn as nn\nclass TransformerModel(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.encoder = nn.TransformerEncoder(\n            nn.TransformerEncoderLayer(d_model=512, nhead=8),\n            num_layers=6\n        )` },
  { id: "ALG-008", name: "K-Means聚类", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.812", created: "2024-01-28", category: "聚类", description: "经典的基于距离的聚类算法", params: [{ name: "n_clusters", type: "int", default: "8", desc: "聚类中心数" }, { name: "init", type: "str", default: "k-means++", desc: "初始化方法" }, { name: "max_iter", type: "int", default: "300", desc: "最大迭代次数" }], scenario: "适用于客户分群、异常检测等无监督学习任务", sampleCode: `from sklearn.cluster import KMeans\nmodel = KMeans(n_clusters=8)\nmodel.fit(X)` },
  { id: "ALG-009", name: "时间序列模型", framework: "pytorch", version: "2.1.0", status: "archived", accuracy: "0.789", created: "2023-12-10", category: "时序", description: "LSTM-based 时间序列预测", params: [{ name: "hidden_size", type: "int", default: "64", desc: "隐藏层大小" }, { name: "num_layers", type: "int", default: "2", desc: "LSTM层数" }, { name: "seq_len", type: "int", default: "30", desc: "序列长度" }], scenario: "适用于股票价格、气象数据等时间序列预测", sampleCode: `import torch.nn as nn\nclass LSTM(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.lstm = nn.LSTM(\n            input_size=1,\n            hidden_size=64,\n            num_layers=2\n        )` },
  { id: "ALG-010", name: "梯度提升树", framework: "xgboost", version: "2.0.3", status: "active", accuracy: "0.934", created: "2024-02-20", category: "分类", description: "梯度提升决策树", params: [{ name: "max_depth", type: "int", default: "5", desc: "最大深度" }, { name: "subsample", type: "float", default: "0.8", desc: "样本采样比例" }, { name: "colsample_bytree", type: "float", default: "0.8", desc: "特征采样比例" }], scenario: "适用于各类结构化数据分类任务", sampleCode: `import xgboost as xgb\nmodel = xgb.XGBClassifier(\n    max_depth=5,\n    subsample=0.8\n)\nmodel.fit(X_train, y_train)` },
];

function generateTrainingHistory(epochCount: number): TrainingHistory {
  const epochs: number[] = [];
  const loss: number[] = [];
  const accuracy: number[] = [];
  for (let i = 1; i <= epochCount; i++) {
    epochs.push(i);
    loss.push(0.5 - 0.45 * (1 - Math.exp(-i / 20)) + Math.random() * 0.02);
    accuracy.push(0.5 + 0.45 * (1 - Math.exp(-i / 20)) + Math.random() * 0.01);
  }
  return { epochs, loss, accuracy };
}

const initialTrainTasks: TrainTask[] = [
  { id: "TR-001", name: "信用评分训练", algorithm: "ALG-001", status: "completed", epoch: 100, loss: "0.023", time: "45m", started: "2024-04-15 09:00", hyperparameters: { max_depth: 6, learning_rate: 0.1, n_estimators: 100, subsample: 0.8 }, logs: ["[09:00:01] 开始加载数据...", "[09:00:05] 数据加载完成，样本数: 50000", "[09:00:10] 开始训练第1轮...", "[09:05:23] 训练完成，损失: 0.023", "[09:05:25] 保存模型到 checkpoint/model_v1.pkl"], trainingHistory: generateTrainingHistory(100) },
  { id: "TR-002", name: "流失预测训练", algorithm: "ALG-002", status: "running", epoch: 67, loss: "0.041", time: "-", started: "2024-04-15 10:30", hyperparameters: { num_leaves: 31, learning_rate: 0.05, feature_fraction: 0.9 }, logs: ["[10:30:00] 初始化训练任务...", "[10:30:02] 加载数据集...", "[10:30:08] 开始训练...", "[10:45:12] Epoch 67/100, Loss: 0.041"], trainingHistory: generateTrainingHistory(67) },
  { id: "TR-003", name: "异常检测训练", algorithm: "ALG-004", status: "failed", epoch: 12, loss: "0.156", time: "8m", started: "2024-04-15 11:00", hyperparameters: { n_estimators: 100, max_depth: 10 }, logs: ["[11:00:00] 开始训练...", "[11:02:15] 警告: 内存不足", "[11:08:00] 错误: CUDA out of memory", "[11:08:01] 训练失败"], trainingHistory: generateTrainingHistory(12) },
  { id: "TR-004", name: "神经网络训练", algorithm: "ALG-003", status: "pending", epoch: 0, loss: "-", time: "-", started: "-", hyperparameters: { hidden_layers: "[128,64]", activation: "relu", dropout: 0.2 }, logs: [], trainingHistory: { epochs: [], loss: [], accuracy: [] } },
  { id: "TR-005", name: "逻辑回归训练", algorithm: "ALG-005", status: "completed", epoch: 100, loss: "0.035", time: "22m", started: "2024-04-15 08:00", hyperparameters: { C: 1.0, solver: "lbfgs", max_iter: 100 }, logs: ["[08:00:00] 开始训练...", "[08:22:00] 训练完成，收敛正常"], trainingHistory: generateTrainingHistory(100) },
  { id: "TR-006", name: "CatBoost训练", algorithm: "ALG-006", status: "running", epoch: 45, loss: "0.028", time: "-", started: "2024-04-15 12:00", hyperparameters: { depth: 6, iterations: 1000, learning_rate: 0.03 }, logs: ["[12:00:00] 初始化CatBoost...", "[12:00:05] 开始训练...", "[12:30:00] Epoch 45/1000, Loss: 0.028"], trainingHistory: generateTrainingHistory(45) },
  { id: "TR-007", name: "聚类分析训练", algorithm: "ALG-008", status: "paused", epoch: 30, loss: "0.062", time: "15m", started: "2024-04-15 07:30", hyperparameters: { n_clusters: 8, init: "k-means++" }, logs: ["[07:30:00] 开始聚类...", "[07:45:00] Epoch 30, 惯性: 0.062", "[07:45:01] 任务已暂停"], trainingHistory: generateTrainingHistory(30) },
  { id: "TR-008", name: "Transformer训练", algorithm: "ALG-007", status: "pending", epoch: 0, loss: "-", time: "-", started: "-", hyperparameters: { d_model: 512, nhead: 8, num_layers: 6 }, logs: [], trainingHistory: { epochs: [], loss: [], accuracy: [] } },
  { id: "TR-009", name: "时间序列训练", algorithm: "ALG-009", status: "failed", epoch: 5, loss: "0.189", time: "3m", started: "2024-04-15 06:00", hyperparameters: { hidden_size: 64, num_layers: 2, seq_len: 30 }, logs: ["[06:00:00] 开始训练...", "[06:03:00] 错误: 梯度爆炸"], trainingHistory: generateTrainingHistory(5) },
  { id: "TR-010", name: "梯度提升训练", algorithm: "ALG-010", status: "completed", epoch: 100, loss: "0.019", time: "55m", started: "2024-04-15 05:00", hyperparameters: { max_depth: 5, subsample: 0.8, colsample_bytree: 0.8 }, logs: ["[05:00:00] 开始训练...", "[05:55:00] 训练完成，最佳损失: 0.019"], trainingHistory: generateTrainingHistory(100) },
];

const mockEvaluations: Record<string, EvaluationResult> = {
  "TR-001": {
    taskId: "TR-001",
    accuracy: 0.9234,
    precision: 0.9123,
    recall: 0.8987,
    f1: 0.9054,
    auc: 0.9678,
    confusionMatrix: { tp: 845, fp: 75, fn: 95, tn: 785 },
    rocCurve: {
      fpr: [0, 0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0],
      tpr: [0, 0.45, 0.68, 0.80, 0.88, 0.93, 0.96, 0.98, 0.99, 0.995, 1.0],
    },
    prCurve: {
      recall: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      precision: [1.0, 0.98, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89, 0.88],
    },
    featureImportance: [
      { name: "age", value: 0.185 }, { name: "income", value: 0.162 },
      { name: "credit_score", value: 0.148 }, { name: "debt_ratio", value: 0.132 },
      { name: "employment_years", value: 0.098 }, { name: "loan_amount", value: 0.087 },
      { name: "payment_history", value: 0.076 }, { name: "num_accounts", value: 0.054 },
      { name: "region", value: 0.034 }, { name: "gender", value: 0.024 },
    ],
  },
  "TR-005": {
    taskId: "TR-005",
    accuracy: 0.8567,
    precision: 0.8432,
    recall: 0.8211,
    f1: 0.8320,
    auc: 0.9123,
    confusionMatrix: { tp: 720, fp: 120, fn: 155, tn: 705 },
    rocCurve: {
      fpr: [0, 0.03, 0.07, 0.12, 0.18, 0.25, 0.35, 0.48, 0.62, 0.78, 1.0],
      tpr: [0, 0.38, 0.60, 0.74, 0.83, 0.89, 0.93, 0.96, 0.98, 0.99, 1.0],
    },
    prCurve: {
      recall: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      precision: [1.0, 0.96, 0.93, 0.91, 0.89, 0.87, 0.85, 0.83, 0.81, 0.79, 0.77],
    },
    featureImportance: [
      { name: "income", value: 0.210 }, { name: "credit_score", value: 0.195 },
      { name: "age", value: 0.142 }, { name: "debt_ratio", value: 0.128 },
      { name: "employment_years", value: 0.105 }, { name: "loan_amount", value: 0.089 },
      { name: "payment_history", value: 0.065 }, { name: "num_accounts", value: 0.041 },
      { name: "region", value: 0.015 }, { name: "gender", value: 0.010 },
    ],
  },
  "TR-010": {
    taskId: "TR-010",
    accuracy: 0.9345,
    precision: 0.9287,
    recall: 0.9156,
    f1: 0.9221,
    auc: 0.9789,
    confusionMatrix: { tp: 890, fp: 55, fn: 70, tn: 825 },
    rocCurve: {
      fpr: [0, 0.01, 0.03, 0.06, 0.10, 0.15, 0.22, 0.32, 0.45, 0.65, 1.0],
      tpr: [0, 0.50, 0.72, 0.84, 0.91, 0.95, 0.97, 0.985, 0.992, 0.997, 1.0],
    },
    prCurve: {
      recall: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      precision: [1.0, 0.99, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89],
    },
    featureImportance: [
      { name: "credit_score", value: 0.198 }, { name: "income", value: 0.175 },
      { name: "age", value: 0.155 }, { name: "debt_ratio", value: 0.140 },
      { name: "employment_years", value: 0.112 }, { name: "loan_amount", value: 0.088 },
      { name: "payment_history", value: 0.072 }, { name: "num_accounts", value: 0.045 },
      { name: "region", value: 0.010 }, { name: "gender", value: 0.005 },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────

const categoryBadgeColor: Record<string, string> = {
  分类: "bg-blue-50 text-blue-700",
  回归: "bg-green-50 text-green-700",
  聚类: "bg-purple-50 text-purple-700",
  时序: "bg-amber-50 text-amber-700",
};

const statusBadge = (status: string) => {
  switch (status) {
    case "active": return <Badge className="bg-green-50 text-green-700">已激活</Badge>;
    case "draft": return <Badge className="bg-gray-50 text-gray-700">草稿</Badge>;
    case "archived": return <Badge className="bg-orange-50 text-orange-700">已归档</Badge>;
    case "testing": return <Badge className="bg-blue-50 text-blue-700">测试中</Badge>;
    case "deprecated": return <Badge className="bg-red-50 text-red-700">已弃用</Badge>;
    case "reviewing": return <Badge className="bg-purple-50 text-purple-700">审核中</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

// ─── Main Component ──────────────────────────────────────────────────

export default function SandboxModelTrain() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [trainTasks, setTrainTasks] = useState<TrainTask[]>(initialTrainTasks);
  const [searchAlg, setSearchAlg] = useState("");
  const [searchTask, setSearchTask] = useState("");

  // Dialogs & Drawers
  const [algDialogOpen, setAlgDialogOpen] = useState(false);
  const [algDialogMode, setAlgDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedAlg, setSelectedAlg] = useState<Algorithm | null>(null);
  const [algDrawerOpen, setAlgDrawerOpen] = useState(false);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<TrainTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [taskLogsOpen, setTaskLogsOpen] = useState(false);

  // Evaluation tab state
  const [selectedEvalTasks, setSelectedEvalTasks] = useState<string[]>(["TR-001"]);
  const [compareMode, setCompareMode] = useState(false);
  const [threshold, setThreshold] = useState(0.5);

  const filteredAlgs = algorithms.filter(
    (a) => a.name.includes(searchAlg) || a.id.includes(searchAlg) || a.category.includes(searchAlg)
  );
  const filteredTasks = trainTasks.filter(
    (t) => t.name.includes(searchTask) || t.id.includes(searchTask)
  );

  const completedTasks = trainTasks.filter((t) => t.status === "completed");

  const getTaskAlgOptions = () =>
    algorithms
      .filter((a) => a.status === "active")
      .map((a) => ({ label: `${a.name} (${a.id})`, value: a.id }));

  // ─── Algorithm Handlers ────────────────────────────────────────────

  const handleAddAlg = () => {
    setSelectedAlg(null);
    setAlgDialogMode("create");
    setAlgDialogOpen(true);
  };

  const handleEditAlg = (a: Algorithm) => {
    setSelectedAlg(a);
    setAlgDialogMode("edit");
    setAlgDialogOpen(true);
  };

  const handleViewAlg = (a: Algorithm) => {
    setSelectedAlg(a);
    setAlgDrawerOpen(true);
  };

  const handleDeleteAlgPrompt = (a: Algorithm) => {
    setSelectedAlg(a);
    setAlgDialogMode("delete");
    setAlgDialogOpen(true);
  };

  const handleSaveAlg = (data: Record<string, any>) => {
    if (algDialogMode === "edit" && selectedAlg) {
      setAlgorithms((prev) =>
        prev.map((a) => (a.id === selectedAlg.id ? { ...a, ...data } : a))
      );
    } else {
      const newId = `ALG-${String(algorithms.length + 1).padStart(3, "0")}`;
      setAlgorithms((prev) => [
        ...prev,
        {
          id: newId,
          name: data.name || "未命名算法",
          framework: data.framework || "PyTorch",
          version: data.version || "1.0",
          status: data.status || "未发布",
          accuracy: "-",
          created: new Date().toISOString().split("T")[0],
          category: "分类",
          description: "",
          params: [],
          scenario: "",
          sampleCode: "",
          ...data,
        } as unknown as Algorithm,
      ]);
    }
  };

  const handleConfirmDeleteAlg = () => {
    if (selectedAlg) {
      setAlgorithms((prev) => prev.filter((a) => a.id !== selectedAlg.id));
    }
  };

  // ─── Task Handlers ─────────────────────────────────────────────────

  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskDialogMode("create");
    setTaskDialogOpen(true);
  };

  const handleEditTask = (t: TrainTask) => {
    setSelectedTask(t);
    setTaskDialogMode("edit");
    setTaskDialogOpen(true);
  };

  const handleViewTask = (t: TrainTask) => {
    setSelectedTask(t);
    setTaskDrawerOpen(true);
  };

  const handleDeleteTaskPrompt = (t: TrainTask) => {
    setSelectedTask(t);
    setTaskDialogMode("delete");
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (data: Record<string, any>) => {
    if (taskDialogMode === "edit" && selectedTask) {
      setTrainTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, ...data } : t))
      );
    } else {
      const newId = `TR-${String(trainTasks.length + 1).padStart(3, "0")}`;
      setTrainTasks((prev) => [
        ...prev,
        {
          id: newId,
          name: data.name || "未命名任务",
          algorithm: data.algorithm || "未知算法",
          status: data.status || "pending",
          epoch: 0,
          loss: "-",
          time: "-",
          started: "-",
          hyperparameters: {},
          logs: [],
          trainingHistory: { epochs: [], loss: [], accuracy: [] },
          ...data,
        } as unknown as TrainTask,
      ]);
    }
  };

  const handleConfirmDeleteTask = () => {
    if (selectedTask) {
      setTrainTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
    }
  };

  const handleStartTask = (id: string) => {
    setTrainTasks((prev) =>
      prev.map((t) => (t.id === id && t.status === "pending" ? { ...t, status: "running" } : t))
    );
  };

  const handlePauseTask = (id: string) => {
    setTrainTasks((prev) =>
      prev.map((t) => (t.id === id && t.status === "running" ? { ...t, status: "paused" } : t))
    );
  };

  const handleStopTask = (id: string) => {
    setTrainTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "failed" } : t)));
  };

  const handleRestartTask = (id: string) => {
    setTrainTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "running", epoch: 0 } : t))
    );
  };

  // ─── Evaluation Handlers ───────────────────────────────────────────

  const toggleEvalTask = (taskId: string) => {
    setSelectedEvalTasks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      }
      return [...prev, taskId];
    });
  };

  const handleDownloadReport = () => {
    toast.success("评估报告已生成并下载");
  };

  // ─── ECharts: Task Training History ────────────────────────────────

  const taskChartRef = useRef<HTMLDivElement>(null);
  const taskChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (taskDrawerOpen && selectedTask && taskChartRef.current && selectedTask.trainingHistory.epochs.length > 0) {
      taskChartInstance.current = echarts.init(taskChartRef.current);
      const { epochs, loss, accuracy } = selectedTask.trainingHistory;
      taskChartInstance.current.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["损失", "准确率"], bottom: 0 },
        grid: { left: "8%", right: "5%", top: "10%", bottom: "15%" },
        xAxis: { type: "category", data: epochs, name: "Epoch" },
        yAxis: [
          { type: "value", name: "损失", position: "left", min: 0, max: 0.6 },
          { type: "value", name: "准确率", position: "right", min: 0.4, max: 1.0 },
        ],
        series: [
          {
            name: "损失",
            type: "line",
            data: loss,
            smooth: true,
            lineStyle: { color: "#ef4444" },
            yAxisIndex: 0,
          },
          {
            name: "准确率",
            type: "line",
            data: accuracy,
            smooth: true,
            lineStyle: { color: "#10b981" },
            yAxisIndex: 1,
          },
        ],
      });
      const handleResize = () => taskChartInstance.current?.resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        taskChartInstance.current?.dispose();
      };
    }
  }, [taskDrawerOpen, selectedTask]);

  // ─── ECharts: Evaluation ROC ───────────────────────────────────────

  const rocRef = useRef<HTMLDivElement>(null);
  const rocInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (rocRef.current && selectedEvalTasks.length > 0) {
      rocInstance.current = echarts.init(rocRef.current);
      const series: any[] = [];
      const colors = ["#6366f1", "#10b981", "#f59e0b"];
      selectedEvalTasks.forEach((taskId, idx) => {
        const ev = mockEvaluations[taskId];
        if (!ev) return;
        const taskName = trainTasks.find((t) => t.id === taskId)?.name || taskId;
        series.push({
          name: taskName,
          type: "line",
          data: ev.rocCurve.fpr.map((x, i) => [x, ev.rocCurve.tpr[i]]),
          smooth: true,
          lineStyle: { color: colors[idx % colors.length], width: 2 },
        });
      });
      series.push({
        name: "基准线",
        type: "line",
        data: [[0, 0], [1, 1]],
        lineStyle: { color: "#e5e7eb", type: "dashed" },
        symbol: "none",
      });
      rocInstance.current.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: series.map((s) => s.name), bottom: 0 },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "20%" },
        xAxis: { type: "value", name: "假阳性率(FPR)", max: 1, min: 0 },
        yAxis: { type: "value", name: "真阳性率(TPR)", max: 1, min: 0 },
        series,
      });
      const handleResize = () => rocInstance.current?.resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        rocInstance.current?.dispose();
      };
    }
  }, [selectedEvalTasks, trainTasks]);

  // ─── ECharts: Evaluation PR ────────────────────────────────────────

  const prRef = useRef<HTMLDivElement>(null);
  const prInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (prRef.current && selectedEvalTasks.length > 0) {
      prInstance.current = echarts.init(prRef.current);
      const series: any[] = [];
      const colors = ["#8b5cf6", "#06b6d4", "#ec4899"];
      selectedEvalTasks.forEach((taskId, idx) => {
        const ev = mockEvaluations[taskId];
        if (!ev) return;
        const taskName = trainTasks.find((t) => t.id === taskId)?.name || taskId;
        series.push({
          name: taskName,
          type: "line",
          data: ev.prCurve.recall.map((x, i) => [x, ev.prCurve.precision[i]]),
          smooth: true,
          lineStyle: { color: colors[idx % colors.length], width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[idx % colors.length] + "33" },
              { offset: 1, color: colors[idx % colors.length] + "05" },
            ]),
          },
        });
      });
      prInstance.current.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: series.map((s) => s.name), bottom: 0 },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "20%" },
        xAxis: { type: "value", name: "召回率", max: 1 },
        yAxis: { type: "value", name: "精确率", max: 1, min: 0.6 },
        series,
      });
      const handleResize = () => prInstance.current?.resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        prInstance.current?.dispose();
      };
    }
  }, [selectedEvalTasks, trainTasks]);

  // ─── ECharts: Feature Importance ───────────────────────────────────

  const fiRef = useRef<HTMLDivElement>(null);
  const fiInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (fiRef.current && selectedEvalTasks.length > 0) {
      fiInstance.current = echarts.init(fiRef.current);
      const ev = mockEvaluations[selectedEvalTasks[0]];
      if (!ev) return;
      const sorted = [...ev.featureImportance].sort((a, b) => a.value - b.value);
      fiInstance.current.setOption({
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: "15%", right: "5%", top: "5%", bottom: "10%" },
        xAxis: { type: "value", name: "重要性", max: 0.25 },
        yAxis: { type: "category", data: sorted.map((s) => s.name) },
        series: [{
          type: "bar",
          data: sorted.map((s) => s.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#818cf8" },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        }],
      });
      const handleResize = () => fiInstance.current?.resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        fiInstance.current?.dispose();
      };
    }
  }, [selectedEvalTasks]);

  // ─── Confusion Matrix ──────────────────────────────────────────────

  const generateConfusionMatrix = (base: { tp: number; fp: number; fn: number; tn: number }) => {
    const factor = (threshold - 0.5) * 200;
    return {
      tp: Math.max(0, Math.round(base.tp - factor)),
      fp: Math.max(0, Math.round(base.fp + factor * 0.6)),
      tn: Math.max(0, Math.round(base.tn + factor * 0.4)),
      fn: Math.max(0, Math.round(base.fn + factor)),
    };
  };

  // ─── Fields ────────────────────────────────────────────────────────

  const algFields: FieldConfig[] = [
    { key: "name", label: "算法名称", type: "text", required: true },
    {
      key: "framework", label: "框架", type: "select", required: true, options: [
        { label: "XGBoost", value: "xgboost" },
        { label: "LightGBM", value: "lightgbm" },
        { label: "PyTorch", value: "pytorch" },
        { label: "Scikit-learn", value: "sklearn" },
        { label: "CatBoost", value: "catboost" },
      ],
    },
    { key: "version", label: "版本", type: "text", required: true },
    {
      key: "status", label: "状态", type: "select", required: true, options: [
        { label: "已激活", value: "active" },
        { label: "草稿", value: "draft" },
        { label: "已归档", value: "archived" },
        { label: "测试中", value: "testing" },
        { label: "已弃用", value: "deprecated" },
        { label: "审核中", value: "reviewing" },
      ],
    },
    { key: "accuracy", label: "准确率", type: "text" },
    { key: "created", label: "创建时间", type: "text" },
  ];

  const taskFields: FieldConfig[] = [
    { key: "name", label: "任务名称", type: "text", required: true },
    { key: "algorithm", label: "选择算法", type: "select", required: true, options: [] },
    {
      key: "status", label: "状态", type: "select", required: true, options: [
        { label: "已完成", value: "completed" },
        { label: "训练中", value: "running" },
        { label: "失败", value: "failed" },
        { label: "暂停", value: "paused" },
        { label: "待执行", value: "pending" },
      ],
    },
    { key: "epoch", label: "轮次", type: "number" },
    { key: "loss", label: "损失", type: "text" },
    { key: "time", label: "耗时", type: "text" },
    { key: "started", label: "开始时间", type: "text" },
  ];

  const algDetailFields = [
    { key: "id", label: "算法ID" },
    { key: "name", label: "算法名称" },
    { key: "framework", label: "框架", type: "badge" as const },
    { key: "version", label: "版本" },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "accuracy", label: "准确率" },
    { key: "created", label: "创建时间", type: "date" as const },
  ];

  const taskDetailFields = [
    { key: "id", label: "任务ID" },
    { key: "name", label: "任务名称" },
    { key: "algorithm", label: "算法", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "epoch", label: "轮次" },
    { key: "loss", label: "损失" },
    { key: "time", label: "耗时" },
    { key: "started", label: "开始时间", type: "date" as const },
  ];

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="模型开发" />

      <Tabs defaultValue="algorithms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="algorithms" className="gap-2"><BookOpen className="w-4 h-4" />算法库</TabsTrigger>
          <TabsTrigger value="training" className="gap-2"><FlaskConical className="w-4 h-4" />训练任务</TabsTrigger>
          <TabsTrigger value="evaluation" className="gap-2"><BarChart3 className="w-4 h-4" />模型评估</TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════
            TAB 1: 算法库
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="algorithms" className="space-y-4">
          <div className="flex items-center gap-3">
            <PageSearchBar
              value={searchAlg}
              onChange={setSearchAlg}
              placeholder="搜索算法..."
              onReset={() => setSearchAlg("")}
              className="max-w-sm"
            />
            <Button className="gap-2" onClick={handleAddAlg}><Plus className="w-4 h-4" />添加算法</Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">算法列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>算法ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>框架</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>准确率</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlgs.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>
                        <Badge className={cn(categoryBadgeColor[a.category] || "bg-gray-50 text-gray-700")}>
                          {a.category}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline">{a.framework}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{a.version}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className={a.accuracy !== "-" ? "text-green-600" : "text-gray-400"}>{a.accuracy}</TableCell>
                      <TableCell className="text-xs text-gray-500">{a.created}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedAlg(a)}><Eye className="w-4 h-4" /></Button>
                            </SheetTrigger>
                            <SheetContent className="w-[480px] sm:max-w-[480px]">
                              <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                  <Code2 className="w-5 h-5" />
                                  {a.name}
                                </SheetTitle>
                              </SheetHeader>
                              <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
                                <div className="space-y-6">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cn(categoryBadgeColor[a.category])}><Tag className="w-3 h-3 mr-1" />{a.category}</Badge>
                                    <Badge variant="outline">{a.framework} {a.version}</Badge>
                                    {statusBadge(a.status)}
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Layers className="w-4 h-4" />算法描述</h4>
                                    <p className="text-sm text-gray-600">{a.description}</p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><SlidersHorizontal className="w-4 h-4" />参数说明</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow><TableHead className="text-xs">参数名</TableHead><TableHead className="text-xs">类型</TableHead><TableHead className="text-xs">默认值</TableHead><TableHead className="text-xs">说明</TableHead></TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {a.params.map((p) => (
                                          <TableRow key={p.name}>
                                            <TableCell className="font-mono text-xs">{p.name}</TableCell>
                                            <TableCell className="text-xs">{p.type}</TableCell>
                                            <TableCell className="font-mono text-xs">{p.default}</TableCell>
                                            <TableCell className="text-xs text-gray-500">{p.desc}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Target className="w-4 h-4" />适用场景</h4>
                                    <p className="text-sm text-gray-600">{a.scenario}</p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Code2 className="w-4 h-4" />示例代码</h4>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto">{a.sampleCode}</pre>
                                  </div>
                                </div>
                              </ScrollArea>
                            </SheetContent>
                          </Sheet>
                          <ActionButtons
                            buttons={[
                              { key: "edit", icon: <Edit3 className="w-4 h-4" />, label: "编辑", onClick: () => handleEditAlg(a) },
                              { key: "delete", icon: <Trash2 className="w-4 h-4" />, label: "删除", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleDeleteAlgPrompt(a) },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            TAB 2: 训练任务
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex items-center gap-3">
            <PageSearchBar
              value={searchTask}
              onChange={setSearchTask}
              placeholder="搜索任务..."
              onReset={() => setSearchTask("")}
              className="max-w-sm"
            />
            <Button className="gap-2" onClick={handleAddTask}><Plus className="w-4 h-4" />新建任务</Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">训练任务列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>任务ID</TableHead><TableHead>任务名称</TableHead><TableHead>算法</TableHead><TableHead>状态</TableHead><TableHead>轮次</TableHead><TableHead>损失</TableHead><TableHead>耗时</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="font-mono text-xs">{t.algorithm}</TableCell>
                      <TableCell>
                        {t.status === "completed" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />完成</Badge> :
                         t.status === "running" ? <Badge className="bg-blue-50 text-blue-700 gap-1"><Sparkles className="w-3 h-3" />训练中</Badge> :
                         t.status === "failed" ? <Badge className="bg-red-50 text-red-700 gap-1"><XCircle className="w-3 h-3" />失败</Badge> :
                         t.status === "paused" ? <Badge className="bg-amber-50 text-amber-700 gap-1"><Pause className="w-3 h-3" />暂停</Badge> :
                         <Badge className="bg-gray-50 text-gray-700">待执行</Badge>}
                      </TableCell>
                      <TableCell>{t.epoch}/100</TableCell>
                      <TableCell>{t.loss}</TableCell>
                      <TableCell>{t.time}</TableCell>
                      <TableCell>
                        <ActionButtons
                          buttons={[
                            ...(t.status === "pending" ? [{ key: "start", icon: <Play className="w-4 h-4" />, label: "开始", onClick: () => handleStartTask(t.id) }] : []),
                            ...(t.status === "running" ? [{ key: "pause", icon: <Pause className="w-4 h-4" />, label: "暂停", onClick: () => handlePauseTask(t.id) }] : []),
                            ...((t.status === "running" || t.status === "paused") ? [{ key: "stop", icon: <XCircle className="w-4 h-4" />, label: "停止", onClick: () => handleStopTask(t.id) }] : []),
                            ...(t.status === "failed" ? [{ key: "restart", icon: <RotateCcw className="w-4 h-4" />, label: "重启", onClick: () => handleRestartTask(t.id) }] : []),
                            { key: "view", icon: <Eye className="w-4 h-4" />, label: "查看", onClick: () => handleViewTask(t) },
                            { key: "edit", icon: <Edit3 className="w-4 h-4" />, label: "编辑", onClick: () => handleEditTask(t) },
                            { key: "delete", icon: <Trash2 className="w-4 h-4" />, label: "删除", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleDeleteTaskPrompt(t) },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            TAB 3: 模型评估
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="evaluation" className="space-y-4">
          {/* Task Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                选择训练任务
                <Badge variant="outline" className="ml-2">{selectedEvalTasks.length} 个已选</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {completedTasks.map((t) => (
                  <Button
                    key={t.id}
                    variant={selectedEvalTasks.includes(t.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleEvalTask(t.id)}
                  >
                    {t.name}
                    {selectedEvalTasks.includes(t.id) && <CheckCircle2 className="w-3 h-3 ml-1" />}
                  </Button>
                ))}
                {completedTasks.length === 0 && <p className="text-sm text-gray-500">暂无可评估的已完成任务</p>}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={compareMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <GitCompare className="w-4 h-4 mr-1" />
                  {compareMode ? "退出对比" : "模型对比"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-1" />
                  下载评估报告
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          {selectedEvalTasks.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(() => {
                const ev = mockEvaluations[selectedEvalTasks[0]];
                if (!ev) return null;
                const metrics = [
                  { label: "准确率", value: ev.accuracy, icon: <BarChart3 className="w-5 h-5 text-pink-500" />, color: "text-pink-600" },
                  { label: "精确率", value: ev.precision, icon: <Target className="w-5 h-5 text-purple-500" />, color: "text-purple-600" },
                  { label: "召回率", value: ev.recall, icon: <Crosshair className="w-5 h-5 text-orange-500" />, color: "text-orange-600" },
                  { label: "F1-Score", value: ev.f1, icon: <Gauge className="w-5 h-5 text-indigo-500" />, color: "text-indigo-600" },
                  { label: "AUC", value: ev.auc, icon: <TrendingUp className="w-5 h-5 text-blue-500" />, color: "text-blue-600" },
                  { label: "阈值", value: threshold, icon: <SlidersHorizontal className="w-5 h-5 text-gray-500" />, color: "text-gray-600" },
                ];
                return metrics.map((m) => (
                  <Card key={m.label}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{m.label}</span>
                        {m.icon}
                      </div>
                      <div className={cn("text-2xl font-bold", m.color)}>
                        {(m.value * 100).toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          )}

          {/* Confusion Matrix + Feature Importance */}
          {selectedEvalTasks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" />混淆矩阵</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>分类阈值</span>
                      <span className="font-medium">{threshold.toFixed(2)}</span>
                    </div>
                    <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0])} min={0} max={1} step={0.01} />
                  </div>
                  {selectedEvalTasks.map((taskId) => {
                    const ev = mockEvaluations[taskId];
                    if (!ev) return null;
                    const cm = generateConfusionMatrix(ev.confusionMatrix);
                    const taskName = trainTasks.find((t) => t.id === taskId)?.name || taskId;
                    return (
                      <div key={taskId} className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">{taskName}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-700">{cm.tp}</div>
                            <div className="text-xs text-green-600 mt-1">真正例(TP)</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-700">{cm.fp}</div>
                            <div className="text-xs text-red-600 mt-1">假正例(FP)</div>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-orange-700">{cm.fn}</div>
                            <div className="text-xs text-orange-600 mt-1">假反例(FN)</div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-700">{cm.tn}</div>
                            <div className="text-xs text-blue-600 mt-1">真反例(TN)</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                          <div className="flex justify-between"><span>灵敏度(Recall):</span><span className="font-medium">{((cm.tp / (cm.tp + cm.fn || 1)) * 100).toFixed(2)}%</span></div>
                          <div className="flex justify-between"><span>特异度(Specificity):</span><span className="font-medium">{((cm.tn / (cm.tn + cm.fp || 1)) * 100).toFixed(2)}%</span></div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" />特征重要性</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={fiRef} className="h-80" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* ROC + PR Curves */}
          {selectedEvalTasks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">ROC 曲线</CardTitle></CardHeader>
                <CardContent><div ref={rocRef} className="h-80" /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">PR 曲线</CardTitle></CardHeader>
                <CardContent><div ref={prRef} className="h-80" /></CardContent>
              </Card>
            </div>
          )}

          {/* Model Comparison Table */}
          {compareMode && selectedEvalTasks.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><GitCompare className="w-4 h-4" />模型对比</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>模型</TableHead>
                      <TableHead>准确率</TableHead>
                      <TableHead>精确率</TableHead>
                      <TableHead>召回率</TableHead>
                      <TableHead>F1-Score</TableHead>
                      <TableHead>AUC</TableHead>
                      <TableHead>综合评分</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvalTasks.map((taskId) => {
                      const ev = mockEvaluations[taskId];
                      if (!ev) return null;
                      const taskName = trainTasks.find((t) => t.id === taskId)?.name || taskId;
                      const score = (ev.accuracy + ev.precision + ev.recall + ev.f1 + ev.auc) / 5;
                      return (
                        <TableRow key={taskId}>
                          <TableCell className="font-medium">{taskName}</TableCell>
                          <TableCell className="text-green-600">{(ev.accuracy * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-purple-600">{(ev.precision * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-orange-600">{(ev.recall * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-indigo-600">{(ev.f1 * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-blue-600">{(ev.auc * 100).toFixed(2)}%</TableCell>
                          <TableCell className="font-bold">{(score * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {selectedEvalTasks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">请选择至少一个已完成的训练任务进行评估</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ════════════════════════════════════════════════════════════
          Dialogs
      ════════════════════════════════════════════════════════════ */}

      <CrudDialog
        open={algDialogOpen}
        onOpenChange={setAlgDialogOpen}
        title={selectedAlg?.name || "算法"}
        fields={algFields}
        data={selectedAlg || {}}
        mode={algDialogMode}
        onSubmit={handleSaveAlg}
        onDelete={handleConfirmDeleteAlg}
      />

      <CrudDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        title={selectedTask?.name || "任务"}
        fields={taskFields.map((f) => (f.key === "algorithm" ? { ...f, options: getTaskAlgOptions() } : f))}
        data={selectedTask || {}}
        mode={taskDialogMode}
        onSubmit={handleSaveTask}
        onDelete={handleConfirmDeleteTask}
      />

      <DetailDrawer
        open={algDrawerOpen}
        onOpenChange={setAlgDrawerOpen}
        title="算法详情"
        data={selectedAlg || {}}
        fields={algDetailFields}
        onEdit={() => { setAlgDrawerOpen(false); if (selectedAlg) handleEditAlg(selectedAlg); }}
        onDelete={() => { setAlgDrawerOpen(false); if (selectedAlg) handleDeleteAlgPrompt(selectedAlg); }}
      />

      <DetailDrawer
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
        title="任务详情"
        data={selectedTask || {}}
        fields={taskDetailFields}
        onEdit={() => { setTaskDrawerOpen(false); if (selectedTask) handleEditTask(selectedTask); }}
        onDelete={() => { setTaskDrawerOpen(false); if (selectedTask) handleDeleteTaskPrompt(selectedTask); }}
      >
        {selectedTask && (
          <div className="mt-4 space-y-4">
            {/* 超参数配置 */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Cpu className="w-4 h-4" />超参数配置</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedTask.hyperparameters).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 p-2 rounded text-sm">
                      <span className="text-gray-500">{k}:</span>{" "}
                      <span className="font-mono font-medium">{String(v)}</span>
                    </div>
                  ))}
                  {Object.keys(selectedTask.hyperparameters).length === 0 && (
                    <p className="text-sm text-gray-400 col-span-2">暂无超参数配置</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 训练过程图表 */}
            {selectedTask.trainingHistory.epochs.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" />训练过程</CardTitle></CardHeader>
                <CardContent><div ref={taskChartRef} className="h-64" /></CardContent>
              </Card>
            )}

            {/* 训练日志 */}
            <Collapsible open={taskLogsOpen} onOpenChange={setTaskLogsOpen}>
              <Card>
                <CardHeader className="pb-2">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" />训练日志</CardTitle>
                      {taskLogsOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-48 bg-gray-900 rounded-lg p-3">
                      <div className="space-y-1 font-mono text-xs">
                        {selectedTask.logs.length > 0 ? (
                          selectedTask.logs.map((log, idx) => (
                            <div key={idx} className={cn(
                              log.includes("错误") || log.includes("失败") ? "text-red-400" :
                              log.includes("警告") ? "text-amber-400" :
                              log.includes("完成") ? "text-green-400" : "text-gray-300"
                            )}>
                              {log}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">暂无日志</span>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
