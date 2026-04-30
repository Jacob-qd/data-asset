import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Play, Save, Trash2, Download, FolderOpen, Database, Wand2,
  BrainCircuit, BarChart3, GitMerge, Filter, Table as TableIcon, Split,
  ArrowRightLeft, Zap, Settings, FileCode, X, Plus, GripVertical,
  Code, Terminal, Bug, RotateCcw, ChevronDown, Layers, Eye,
  ArrowLeft, Server, Search, FileText, Folder, FolderPlus, FilePlus,
  MoreVertical, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Type,
  FileJson, Columns, Hash, AlertTriangle, CheckCircle2,
  MousePointerClick, Move, RefreshCw, Upload, FileDown, Copy,
  ChevronLeft, ChevronRight, Grid3X3, LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Types ─── */
interface ParamDef {
  name: string;
  label: string;
  type: "int" | "float" | "string" | "select" | "boolean" | "range";
  default: any;
  description?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

interface PortDef {
  id: string;
  label: string;
  type?: "input" | "output";
}

interface ComponentDef {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  params: ParamDef[];
  inputs: PortDef[];
  outputs: PortDef[];
}

interface FlowNode {
  id: string;
  componentId: string;
  name: string;
  x: number;
  y: number;
  params: Record<string, any>;
  width: number;
  height: number;
}

interface FlowEdge {
  id: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
}

interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: "python" | "sql";
}

interface DataColumn {
  name: string;
  type: string;
  missing: number;
}

/* ─── Component Library ─── */
const componentLibrary: ComponentDef[] = [
  {
    id: "read_csv",
    name: "读取CSV",
    category: "数据输入",
    description: "从CSV文件读取数据",
    icon: <TableIcon className="w-4 h-4" />,
    color: "#3b82f6",
    params: [
      { name: "path", label: "文件路径", type: "string", default: "/data/input.csv" },
      { name: "encoding", label: "编码", type: "select", default: "utf-8", options: [{ label: "UTF-8", value: "utf-8" }, { label: "GBK", value: "gbk" }] },
      { name: "header", label: "包含表头", type: "boolean", default: true },
    ],
    inputs: [],
    outputs: [{ id: "data", label: "数据" }],
  },
  {
    id: "read_mysql",
    name: "读取MySQL",
    category: "数据输入",
    description: "从MySQL数据库读取数据",
    icon: <Database className="w-4 h-4" />,
    color: "#3b82f6",
    params: [
      { name: "host", label: "主机", type: "string", default: "localhost" },
      { name: "port", label: "端口", type: "int", default: 3306 },
      { name: "database", label: "数据库", type: "string", default: "mydb" },
      { name: "table", label: "表名", type: "string", default: "users" },
    ],
    inputs: [],
    outputs: [{ id: "data", label: "数据" }],
  },
  {
    id: "drop_na",
    name: "删除缺失值",
    category: "数据预处理",
    description: "删除包含缺失值的行或列",
    icon: <Filter className="w-4 h-4" />,
    color: "#10b981",
    params: [
      { name: "axis", label: "轴", type: "select", default: "0", options: [{ label: "行", value: "0" }, { label: "列", value: "1" }] },
      { name: "how", label: "条件", type: "select", default: "any", options: [{ label: "任一缺失", value: "any" }, { label: "全部缺失", value: "all" }] },
    ],
    inputs: [{ id: "data", label: "数据" }],
    outputs: [{ id: "data", label: "数据" }],
  },
  {
    id: "fill_na",
    name: "填充缺失值",
    category: "数据预处理",
    description: "使用指定值填充缺失值",
    icon: <Wand2 className="w-4 h-4" />,
    color: "#10b981",
    params: [
      { name: "strategy", label: "策略", type: "select", default: "mean", options: [{ label: "均值", value: "mean" }, { label: "中位数", value: "median" }, { label: "常数", value: "constant" }] },
      { name: "fill_value", label: "填充值", type: "string", default: "0" },
    ],
    inputs: [{ id: "data", label: "数据" }],
    outputs: [{ id: "data", label: "数据" }],
  },
  {
    id: "train_test_split",
    name: "训练测试拆分",
    category: "数据预处理",
    description: "将数据集拆分为训练集和测试集",
    icon: <Split className="w-4 h-4" />,
    color: "#10b981",
    params: [
      { name: "test_size", label: "测试集比例", type: "range", default: 0.2, min: 0.1, max: 0.5, step: 0.05 },
      { name: "random_state", label: "随机种子", type: "int", default: 42 },
    ],
    inputs: [{ id: "data", label: "数据" }],
    outputs: [{ id: "train", label: "训练集" }, { id: "test", label: "测试集" }],
  },
  {
    id: "standard_scaler",
    name: "标准化",
    category: "特征工程",
    description: "对特征进行标准化处理（Z-score）",
    icon: <ArrowRightLeft className="w-4 h-4" />,
    color: "#8b5cf6",
    params: [
      { name: "with_mean", label: "中心化", type: "boolean", default: true },
      { name: "with_std", label: "缩放", type: "boolean", default: true },
    ],
    inputs: [{ id: "data", label: "数据" }],
    outputs: [{ id: "data", label: "数据" }],
  },
  {
    id: "pca",
    name: "PCA降维",
    category: "特征工程",
    description: "主成分分析降维",
    icon: <Layers className="w-4 h-4" />,
    color: "#8b5cf6",
    params: [
      { name: "n_components", label: "主成分数", type: "int", default: 10 },
    ],
    inputs: [{ id: "data", label: "数据" }],
    outputs: [{ id: "data", label: "数据" }],
  },
  {
    id: "random_forest",
    name: "随机森林",
    category: "模型训练",
    description: "随机森林分类/回归",
    icon: <BrainCircuit className="w-4 h-4" />,
    color: "#f59e0b",
    params: [
      { name: "n_estimators", label: "树的数量", type: "int", default: 100 },
      { name: "max_depth", label: "最大深度", type: "int", default: 10 },
      { name: "min_samples_split", label: "最小分裂样本", type: "int", default: 2 },
      { name: "task", label: "任务类型", type: "select", default: "classification", options: [{ label: "分类", value: "classification" }, { label: "回归", value: "regression" }] },
    ],
    inputs: [{ id: "train", label: "训练集" }],
    outputs: [{ id: "model", label: "模型" }],
  },
  {
    id: "xgboost",
    name: "XGBoost",
    category: "模型训练",
    description: "XGBoost梯度提升",
    icon: <Zap className="w-4 h-4" />,
    color: "#f59e0b",
    params: [
      { name: "n_estimators", label: "迭代次数", type: "int", default: 100 },
      { name: "learning_rate", label: "学习率", type: "float", default: 0.1 },
      { name: "max_depth", label: "最大深度", type: "int", default: 6 },
    ],
    inputs: [{ id: "train", label: "训练集" }],
    outputs: [{ id: "model", label: "模型" }],
  },
  {
    id: "logistic_regression",
    name: "逻辑回归",
    category: "模型训练",
    description: "逻辑回归分类",
    icon: <GitMerge className="w-4 h-4" />,
    color: "#f59e0b",
    params: [
      { name: "C", label: "正则化强度", type: "float", default: 1.0 },
      { name: "max_iter", label: "最大迭代", type: "int", default: 100 },
    ],
    inputs: [{ id: "train", label: "训练集" }],
    outputs: [{ id: "model", label: "模型" }],
  },
  {
    id: "model_predict",
    name: "模型预测",
    category: "模型评估",
    description: "使用训练好的模型进行预测",
    icon: <Eye className="w-4 h-4" />,
    color: "#ef4444",
    params: [],
    inputs: [{ id: "model", label: "模型" }, { id: "data", label: "数据" }],
    outputs: [{ id: "predictions", label: "预测结果" }],
  },
  {
    id: "evaluate",
    name: "模型评估",
    category: "模型评估",
    description: "评估模型性能指标",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "#ef4444",
    params: [
      { name: "metrics", label: "评估指标", type: "select", default: "accuracy", options: [{ label: "准确率", value: "accuracy" }, { label: "F1分数", value: "f1" }, { label: "AUC", value: "auc" }] },
    ],
    inputs: [{ id: "predictions", label: "预测结果" }, { id: "ground_truth", label: "真实标签" }],
    outputs: [{ id: "report", label: "评估报告" }],
  },
  {
    id: "save_model",
    name: "保存模型",
    category: "模型评估",
    description: "将训练好的模型保存到文件",
    icon: <FileCode className="w-4 h-4" />,
    color: "#ef4444",
    params: [
      { name: "path", label: "保存路径", type: "string", default: "/models/model.pkl" },
    ],
    inputs: [{ id: "model", label: "模型" }],
    outputs: [],
  },
];

const categories = Array.from(new Set(componentLibrary.map(c => c.category)));

/* ─── Sample Data for Data Preview ─── */
const sampleDataColumns: DataColumn[] = [
  { name: "id", type: "int64", missing: 0 },
  { name: "name", type: "object", missing: 2 },
  { name: "age", type: "int64", missing: 5 },
  { name: "gender", type: "object", missing: 1 },
  { name: "salary", type: "float64", missing: 3 },
  { name: "department", type: "object", missing: 0 },
  { name: "score", type: "float64", missing: 8 },
  { name: "joined_date", type: "datetime64", missing: 0 },
];

const sampleDataRows = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十", "郑十一", "王十二"][i % 10],
  age: [25, 30, 35, 28, 42, 33, 29, 38, 31, 27][i % 10],
  gender: ["男", "女", "男", "女", "男", "女", "男", "女", "男", "女"][i % 10],
  salary: [8500.5, 12000.0, 9500.75, 15000.0, 7800.25, 11200.5, 9800.0, 13500.75, 10500.0, 8900.5][i % 10] + (i * 10),
  department: ["技术部", "销售部", "市场部", "人事部", "财务部", "技术部", "销售部", "市场部", "人事部", "财务部"][i % 10],
  score: [85.5, 92.0, 78.5, 88.0, 95.5, 82.0, 90.5, 87.0, 91.5, 79.0][i % 10] + (i % 5),
  joined_date: ["2020-01-15", "2019-06-20", "2021-03-10", "2018-11-05", "2020-09-12", "2022-01-08", "2019-04-22", "2021-07-18", "2020-05-30", "2018-12-25"][i % 10],
}));

/* ─── Code Templates ─── */
const codeTemplates = {
  cleaning: `import pandas as pd
import numpy as np

# 数据清洗示例
df = pd.read_csv('/data/input.csv')

# 查看数据基本信息
print("数据形状:", df.shape)
print("\\n数据前5行:")
print(df.head())

# 处理缺失值
print("\\n缺失值统计:")
print(df.isnull().sum())

# 删除缺失值过多的列
df = df.dropna(thresh=len(df) * 0.6, axis=1)

# 填充数值型缺失值
numeric_cols = df.select_dtypes(include=[np.number]).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

# 删除重复行
df = df.drop_duplicates()

print("\\n清洗后数据形状:", df.shape)
print("\\n数据类型:")
print(df.dtypes)`,

  feature: `import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder

# 特征工程示例
df = pd.read_csv('/data/input.csv')

# 数值特征标准化
scaler = StandardScaler()
numeric_features = ['age', 'salary', 'score']
df[numeric_features] = scaler.fit_transform(df[numeric_features])

# 类别特征编码
le = LabelEncoder()
df['gender_encoded'] = le.fit_transform(df['gender'])

# 创建新特征
df['salary_per_age'] = df['salary'] / df['age']
df['is_high_score'] = (df['score'] > df['score'].mean()).astype(int)

# 独热编码
df = pd.get_dummies(df, columns=['department'], prefix='dept')

print("特征工程完成")
print("新特征:", ['salary_per_age', 'is_high_score'])
print("\\n处理后数据形状:", df.shape)`,

  model: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 模型训练示例
df = pd.read_csv('/data/input.csv')

# 准备特征和标签
X = df.drop('target', axis=1)
y = df['target']

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 训练随机森林模型
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
model.fit(X_train, y_train)

# 预测
y_pred = model.predict(X_test)

# 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"准确率: {accuracy:.4f}")
print("\\n分类报告:")
print(classification_report(y_test, y_pred))

# 特征重要性
importances = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\\n特征重要性:")
print(importances.head(10))`,
};

const defaultFiles: EditorFile[] = [
  { id: "f1", name: "data_cleaning.py", content: codeTemplates.cleaning, language: "python" },
  { id: "f2", name: "feature_engineering.py", content: codeTemplates.feature, language: "python" },
  { id: "f3", name: "model_training.py", content: codeTemplates.model, language: "python" },
  { id: "f4", name: "query.sql", content: "SELECT * FROM users WHERE age > 25;", language: "sql" },
];

/* ─── Helper: Generate ID ─── */
const genId = () => Math.random().toString(36).substr(2, 9);

/* ─── Syntax Highlighter (simple) ─── */
function highlightCode(code: string, language: "python" | "sql"): string {
  if (language === "python") {
    return code
      .replace(/(\b(?:import|from|as|def|class|return|if|else|elif|for|while|try|except|with|print|and|or|not|in|is|None|True|False)\b)/g, '<span class="text-pink-500">$1</span>')
      .replace(/(\b(?:int|str|float|list|dict|tuple|set|bool|len|range|enumerate|zip|map|filter)\b)/g, '<span class="text-cyan-500">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span class="text-green-500">$1</span>')
      .replace(/(#.*$)/gm, '<span class="text-gray-400">$1</span>')
      .replace(/(\b\d+(?:\.\d+)?\b)/g, '<span class="text-orange-500">$1</span>');
  } else {
    return code
      .replace(/(\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|LIMIT|HAVING|UNION|ALL|DISTINCT|AS|AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL|CREATE|TABLE|VALUES|INTO|SET)\b)/gi, '<span class="text-blue-400 font-semibold">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-green-500">$1</span>')
      .replace(/(\b\d+(?:\.\d+)?\b)/g, '<span class="text-orange-500">$1</span>');
  }
}

/* ─── Main Component ─── */
export default function SandboxIDE() {
  const { envId } = useParams<{ envId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"canvas" | "editor" | "data">("canvas");

  /* ─── Canvas State ─── */
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "[INFO] 沙箱IDE可视化工作流已启动",
    "[INFO] 拖拽左侧组件到画布开始编排",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories));
  const [componentSearch, setComponentSearch] = useState("");

  // Undo/Redo
  const [history, setHistory] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Zoom/Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Drag / connection state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connecting, setConnecting] = useState<{ nodeId: string; portId: string; type: "input" | "output" } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedComponent = selectedNode ? componentLibrary.find(c => c.id === selectedNode.componentId) : null;

  /* ─── Editor State ─── */
  const [files, setFiles] = useState<EditorFile[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState<string>(defaultFiles[0].id);
  const [editorOutput, setEditorOutput] = useState<string[]>([
    "[INFO] Python 3.11.4 环境已就绪",
    "[INFO] 选择文件开始编辑",
  ]);
  const [isEditorRunning, setIsEditorRunning] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenuFile, setContextMenuFile] = useState<string | null>(null);
  const editorConsoleRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  /* ─── Data Preview State ─── */
  const [dataPage, setDataPage] = useState(1);
  const [dataPageSize, setDataPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(sampleDataColumns.map(c => c.name)));
  const [dataSearch, setDataSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!dataSearch) return sampleDataRows;
    return sampleDataRows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(dataSearch.toLowerCase()))
    );
  }, [dataSearch]);

  const totalPages = Math.ceil(filteredRows.length / dataPageSize);
  const paginatedRows = filteredRows.slice((dataPage - 1) * dataPageSize, dataPage * dataPageSize);

  const dataStats = useMemo(() => {
    const totalRows = sampleDataRows.length;
    const totalCols = sampleDataColumns.length;
    const totalMissing = sampleDataColumns.reduce((sum, c) => sum + c.missing, 0);
    const missingRate = ((totalMissing / (totalRows * totalCols)) * 100).toFixed(2);
    const typeCounts = sampleDataColumns.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalRows, totalCols, totalMissing, missingRate, typeCounts };
  }, []);

  /* ─── History helpers ─── */
  const pushHistory = useCallback((newNodes: FlowNode[], newEdges: FlowEdge[]) => {
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      next.push({ nodes: newNodes, edges: newEdges });
      return next.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
      toast.info("已撤销");
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
      toast.info("已重做");
    }
  }, [historyIndex, history]);

  /* ─── Canvas Actions ─── */
  const handleDragStart = useCallback((e: React.DragEvent, componentId: string) => {
    e.dataTransfer.setData("componentId", componentId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData("componentId");
    if (!componentId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const comp = componentLibrary.find(c => c.id === componentId);
    if (!comp) return;
    const x = (e.clientX - rect.left - pan.x) / zoom - 80;
    const y = (e.clientY - rect.top - pan.y) / zoom - 30;
    const newNode: FlowNode = {
      id: "node-" + genId(),
      componentId: comp.id,
      name: comp.name,
      x,
      y,
      params: Object.fromEntries(comp.params.map(p => [p.name, p.default])),
      width: 160,
      height: comp.inputs.length > 0 || comp.outputs.length > 0 ? 80 + Math.max(comp.inputs.length, comp.outputs.length) * 20 : 60,
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    pushHistory(newNodes, edges);
    setSelectedNodeId(newNode.id);
    toast.success(`已添加节点：${comp.name}`);
  }, [nodes, edges, pan, zoom, pushHistory]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if ((e.target as HTMLElement).closest(".port")) return;
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNodeId(nodeId);
    setDraggingNode({ id: nodeId, offsetX: e.clientX, offsetY: e.clientY });
  }, [nodes]);

  const handlePortMouseDown = useCallback((e: React.MouseEvent, nodeId: string, portId: string, type: "input" | "output") => {
    e.stopPropagation();
    setConnecting({ nodeId, portId, type });
  }, []);

  const handlePortMouseUp = useCallback((e: React.MouseEvent, nodeId: string, portId: string, type: "input" | "output") => {
    e.stopPropagation();
    if (!connecting) return;
    let newEdges = edges;
    if (connecting.type === "output" && type === "input") {
      const existing = edges.find(ed => ed.target === nodeId && ed.targetPort === portId);
      if (!existing) {
        newEdges = [...edges, {
          id: "edge-" + genId(),
          source: connecting.nodeId,
          sourcePort: connecting.portId,
          target: nodeId,
          targetPort: portId,
        }];
        setEdges(newEdges);
        pushHistory(nodes, newEdges);
        toast.success("已连接节点");
      }
    } else if (connecting.type === "input" && type === "output") {
      const existing = edges.find(ed => ed.target === connecting.nodeId && ed.targetPort === connecting.portId);
      if (!existing) {
        newEdges = [...edges, {
          id: "edge-" + genId(),
          source: nodeId,
          sourcePort: portId,
          target: connecting.nodeId,
          targetPort: connecting.portId,
        }];
        setEdges(newEdges);
        pushHistory(nodes, newEdges);
        toast.success("已连接节点");
      }
    }
    setConnecting(null);
  }, [connecting, edges, nodes, pushHistory]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNode) {
        const dx = (e.clientX - draggingNode.offsetX) / zoom;
        const dy = (e.clientY - draggingNode.offsetY) / zoom;
        setNodes(prev => prev.map(n =>
          n.id === draggingNode.id ? { ...n, x: n.x + dx, y: n.y + dy } : n
        ));
        setDraggingNode({ ...draggingNode, offsetX: e.clientX, offsetY: e.clientY });
      }
      if (isPanning && canvasRef.current) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
      if (connecting && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });
      }
    };
    const handleMouseUp = () => {
      if (draggingNode) {
        pushHistory(nodes, edges);
      }
      setDraggingNode(null);
      setIsPanning(false);
      setConnecting(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingNode, isPanning, panStart, connecting, pan, zoom, nodes, edges, pushHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const newEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setNodes(newNodes);
    setEdges(newEdges);
    pushHistory(newNodes, newEdges);
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [nodes, edges, selectedNodeId, pushHistory]);

  const updateParam = useCallback((nodeId: string, paramName: string, value: any) => {
    const newNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, params: { ...n.params, [paramName]: value } } : n
    );
    setNodes(newNodes);
    pushHistory(newNodes, edges);
  }, [nodes, edges, pushHistory]);

  const runWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error("画布为空，请先添加节点");
      return;
    }
    setIsRunning(true);
    setConsoleOutput(prev => [...prev, "[INFO] 开始执行工作流..."]);
    let step = 0;
    const interval = setInterval(() => {
      if (step >= nodes.length) {
        clearInterval(interval);
        setConsoleOutput(prev => [
          ...prev,
          "[SUCCESS] 工作流执行完成",
          "[OUTPUT] 训练准确率: 0.9234",
          "[OUTPUT] 测试准确率: 0.8912",
          "[OUTPUT] F1分数: 0.8745",
        ]);
        setIsRunning(false);
        return;
      }
      const node = nodes[step];
      const comp = componentLibrary.find(c => c.id === node.componentId);
      setConsoleOutput(prev => [...prev, `[INFO] 执行: ${comp?.name || node.name}`]);
      step++;
    }, 800);
  }, [nodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    pushHistory([], []);
    setConsoleOutput(prev => [...prev, "[INFO] 画布已清空"]);
  }, [pushHistory]);

  const exportCode = useCallback(() => {
    const code = `# Auto-generated by Sandbox IDE
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load data
df = pd.read_csv("/data/input.csv")

# Preprocess
df = df.dropna()

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)

# Train
model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, preds):.4f}")
`;
    setConsoleOutput(prev => [...prev, "[INFO] Python代码已生成", code]);
    toast.success("代码已导出到控制台");
  }, []);

  const getPortPos = (nodeId: string, portId: string, type: "input" | "output") => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const comp = componentLibrary.find(c => c.id === node.componentId);
    if (!comp) return { x: 0, y: 0 };
    const ports = type === "input" ? comp.inputs : comp.outputs;
    const idx = ports.findIndex(p => p.id === portId);
    const spacing = node.height / (ports.length + 1);
    return {
      x: node.x + (type === "input" ? 0 : node.width),
      y: node.y + spacing * (idx + 1),
    };
  };

  /* ─── Editor Actions ─── */
  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content } : f));
  }, []);

  const createFile = useCallback(() => {
    const newFile: EditorFile = {
      id: "f-" + genId(),
      name: `untitled_${files.length + 1}.py`,
      content: "",
      language: "python",
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    toast.success("已创建新文件");
  }, [files.length]);

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter(f => f.id !== fileId);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : "");
    }
    setContextMenuFile(null);
    toast.info("文件已删除");
  }, [activeFileId, files]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    if (!newName.trim()) return;
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName.trim() } : f));
    setRenamingFile(null);
    setRenameValue("");
    toast.success("文件已重命名");
  }, []);

  const runEditorCode = useCallback(() => {
    if (!activeFile) return;
    setIsEditorRunning(true);
    setEditorOutput(prev => [...prev, `[INFO] 正在运行: ${activeFile.name}...`]);
    setTimeout(() => {
      if (activeFile.language === "python") {
        const outputs = [
          "[SUCCESS] 代码执行完成",
          "[OUTPUT] 数据形状: (1000, 8)",
          "[OUTPUT] 缺失值统计:",
          "  age        5",
          "  salary     3",
          "  score      8",
          "  dtype: int64",
          "[OUTPUT] 清洗后数据形状: (987, 8)",
          "[OUTPUT] 执行时间: 0.45s",
        ];
        setEditorOutput(prev => [...prev, ...outputs]);
      } else {
        setEditorOutput(prev => [...prev, "[SUCCESS] SQL查询执行完成", "[OUTPUT] 返回 42 行数据", "[OUTPUT] 执行时间: 0.12s"]);
      }
      setIsEditorRunning(false);
      toast.success("代码执行完成");
    }, 1500);
  }, [activeFile]);

  const saveFile = useCallback(() => {
    toast.success(`已保存: ${activeFile?.name}`);
  }, [activeFile]);

  const importFile = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".py,.sql";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          const newFile: EditorFile = {
            id: "f-" + genId(),
            name: file.name,
            content,
            language: file.name.endsWith(".sql") ? "sql" : "python",
          };
          setFiles(prev => [...prev, newFile]);
          setActiveFileId(newFile.id);
          toast.success(`已导入: ${file.name}`);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const exportFile = useCallback(() => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出: ${activeFile.name}`);
  }, [activeFile]);

  const loadTemplate = useCallback((template: keyof typeof codeTemplates) => {
    const newFile: EditorFile = {
      id: "f-" + genId(),
      name: `${template}_template.py`,
      content: codeTemplates[template],
      language: "python",
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    toast.success("已加载代码模板");
  }, []);

  useEffect(() => {
    if (editorConsoleRef.current) {
      editorConsoleRef.current.scrollTop = editorConsoleRef.current.scrollHeight;
    }
  }, [editorOutput]);

  /* ─── Keyboard shortcuts ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === "canvas") {
        if ((e.metaKey || e.ctrlKey) && e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, undo, redo]);

  /* ─── Filtered Components ─── */
  const filteredComponents = useMemo(() => {
    if (!componentSearch.trim()) return componentLibrary;
    const search = componentSearch.toLowerCase();
    return componentLibrary.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.category.toLowerCase().includes(search)
    );
  }, [componentSearch]);

  const filteredCategories = useMemo(() => {
    return Array.from(new Set(filteredComponents.map(c => c.category)));
  }, [filteredComponents]);

  /* ─── Scroll to bottom of console ─── */
  const consoleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1 text-gray-500" onClick={() => navigate("/sandbox/ide")}>
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="w-px h-6 bg-gray-200" />
          <Code className="w-6 h-6 text-indigo-600" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">沙箱IDE</h1>
              {envId && (
                <Badge variant="outline" className="text-xs font-normal text-gray-500">
                  <Server className="w-3 h-3 mr-1" />
                  {envId}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">可视化工作流编排 · 代码编辑 · 数据预览</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">运行中</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mr-2">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="canvas" className="gap-1">
                <LayoutList className="w-3.5 h-3.5" />
                画布
              </TabsTrigger>
              <TabsTrigger value="editor" className="gap-1">
                <FileCode className="w-3.5 h-3.5" />
                编辑器
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-1">
                <Database className="w-3.5 h-3.5" />
                数据
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "canvas" && (
            <>
              <Button variant="outline" size="sm" className="gap-1" onClick={exportCode}>
                <Download className="w-4 h-4" />导出代码
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4" />清空
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Save className="w-4 h-4" />保存
              </Button>
              <Button size="sm" className={cn("gap-1", isRunning && "opacity-70")} onClick={runWorkflow} disabled={isRunning}>
                <Play className="w-4 h-4" />{isRunning ? "运行中..." : "运行"}
              </Button>
            </>
          )}

          {activeTab === "editor" && (
            <>
              <Button variant="outline" size="sm" className="gap-1" onClick={importFile}>
                <Upload className="w-4 h-4" />导入
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={exportFile}>
                <FileDown className="w-4 h-4" />导出
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={saveFile}>
                <Save className="w-4 h-4" />保存
              </Button>
              <Button size="sm" className={cn("gap-1", isEditorRunning && "opacity-70")} onClick={runEditorCode} disabled={isEditorRunning}>
                <Play className="w-4 h-4" />{isEditorRunning ? "运行中..." : "运行"}
              </Button>
            </>
          )}

          {activeTab === "data" && (
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" />导出数据
            </Button>
          )}
        </div>
      </div>

      {/* ─── CANVAS TAB ─── */}
      {activeTab === "canvas" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <div className="w-60 bg-white border-r flex flex-col">
            <div className="p-3 border-b space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">组件库</span>
                <Badge variant="outline" className="text-xs">{componentLibrary.length} 组件</Badge>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索组件..."
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  className="h-8 pl-7 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2">
              {filteredCategories.map(cat => (
                <div key={cat}>
                  <button
                    className="flex items-center gap-1 w-full text-left text-xs font-medium text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setExpandedCategories(prev => {
                      const next = new Set(prev);
                      if (next.has(cat)) next.delete(cat);
                      else next.add(cat);
                      return next;
                    })}
                  >
                    <ChevronDown className={cn("w-3 h-3 transition-transform", !expandedCategories.has(cat) && "-rotate-90")} />
                    {cat}
                  </button>
                  {expandedCategories.has(cat) && (
                    <div className="space-y-1 mt-1">
                      {filteredComponents.filter(c => c.category === cat).map(comp => (
                        <div
                          key={comp.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, comp.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-grab hover:shadow-lg hover:border-indigo-300 transition-all bg-white hover:-translate-y-0.5"
                        >
                          <div className="w-8 h-8 rounded flex items-center justify-center text-white shrink-0" style={{ backgroundColor: comp.color }}>
                            {comp.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{comp.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{comp.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden bg-slate-50">
            {/* Toolbar */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white rounded-lg shadow-md border p-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="w-3.5 h-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div
              ref={canvasRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onMouseDown={(e) => {
                if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
                  setSelectedNodeId(null);
                  setIsPanning(true);
                  setPanStart({ x: e.clientX, y: e.clientY });
                }
              }}
            >
              <div
                className="absolute inset-0 canvas-bg"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                }}
              >
                {/* SVG Layer for Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                  {edges.map(edge => {
                    const src = getPortPos(edge.source, edge.sourcePort, "output");
                    const tgt = getPortPos(edge.target, edge.targetPort, "input");
                    const midX = (src.x + tgt.x) / 2;
                    return (
                      <path
                        key={edge.id}
                        d={`M ${src.x} ${src.y} C ${midX} ${src.y}, ${midX} ${tgt.y}, ${tgt.x} ${tgt.y}`}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                      />
                    );
                  })}
                  {connecting && (() => {
                    const src = getPortPos(connecting.nodeId, connecting.portId, connecting.type);
                    return (
                      <path
                        d={`M ${src.x} ${src.y} L ${mousePos.x} ${mousePos.y}`}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    );
                  })()}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const comp = componentLibrary.find(c => c.id === node.componentId);
                  if (!comp) return null;
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "absolute rounded-lg border-2 cursor-move select-none transition-shadow duration-200 hover:shadow-xl",
                        isSelected ? "border-indigo-500 shadow-xl ring-2 ring-indigo-200" : "border-gray-200 shadow-md hover:shadow-lg"
                      )}
                      style={{
                        left: node.x,
                        top: node.y,
                        width: node.width,
                        minHeight: node.height,
                        backgroundColor: "white",
                        zIndex: isSelected ? 10 : 1,
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    >
                      {/* Header */}
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 rounded-t-md text-white text-xs font-medium"
                        style={{ backgroundColor: comp.color }}
                      >
                        {comp.icon}
                        <span className="truncate">{node.name}</span>
                        <button
                          className="ml-auto hover:bg-white/20 rounded p-0.5 transition-colors"
                          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Ports */}
                      <div className="relative py-2 px-1">
                        {comp.inputs.map((port) => {
                          const connected = edges.some(e => e.target === node.id && e.targetPort === port.id);
                          return (
                            <div key={port.id} className="flex items-center gap-1 mb-1">
                              <div
                                className={cn(
                                  "port w-3 h-3 rounded-full border-2 cursor-pointer shrink-0 transition-colors",
                                  connected ? "bg-indigo-500 border-indigo-500" : "bg-white border-gray-400 hover:border-indigo-500 hover:bg-indigo-50"
                                )}
                                onMouseDown={(e) => handlePortMouseDown(e, node.id, port.id, "input")}
                                onMouseUp={(e) => handlePortMouseUp(e, node.id, port.id, "input")}
                              />
                              <span className="text-[10px] text-gray-500">{port.label}</span>
                            </div>
                          );
                        })}

                        <div className="absolute right-0 top-2 pr-1">
                          {comp.outputs.map(port => {
                            const connected = edges.some(e => e.source === node.id && e.sourcePort === port.id);
                            return (
                              <div key={port.id} className="flex items-center gap-1 mb-1 justify-end">
                                <span className="text-[10px] text-gray-500">{port.label}</span>
                                <div
                                  className={cn(
                                    "port w-3 h-3 rounded-full border-2 cursor-pointer shrink-0 transition-colors",
                                    connected ? "bg-indigo-500 border-indigo-500" : "bg-white border-gray-400 hover:border-indigo-500 hover:bg-indigo-50"
                                  )}
                                  onMouseDown={(e) => handlePortMouseDown(e, node.id, port.id, "output")}
                                  onMouseUp={(e) => handlePortMouseUp(e, node.id, port.id, "output")}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-400">
                      <Layers className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">从左侧组件库拖拽组件到此处</p>
                      <p className="text-xs mt-1">支持数据输入、预处理、特征工程、模型训练、评估</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-72 bg-white border-l flex flex-col">
            <div className="p-3 border-b">
              <span className="text-sm font-semibold">{selectedNode ? "节点属性" : "属性面板"}</span>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {selectedNode && selectedComponent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: selectedComponent.color }}>
                      {selectedComponent.icon}
                    </div>
                    <div>
                      <div className="font-medium">{selectedNode.name}</div>
                      <div className="text-xs text-gray-500">{selectedComponent.description}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-500">参数配置</Label>
                    {selectedComponent.params.map(param => (
                      <div key={param.name} className="space-y-1">
                        <Label className="text-xs">{param.label}</Label>
                        {param.type === "select" && param.options ? (
                          <select
                            className="w-full h-8 px-2 text-sm border rounded"
                            value={selectedNode.params[param.name] || ""}
                            onChange={(e) => updateParam(selectedNode.id, param.name, e.target.value)}
                          >
                            {param.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : param.type === "boolean" ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!selectedNode.params[param.name]}
                              onCheckedChange={(v) => updateParam(selectedNode.id, param.name, v)}
                            />
                            <span className="text-xs text-gray-500">{selectedNode.params[param.name] ? "是" : "否"}</span>
                          </div>
                        ) : param.type === "range" ? (
                          <div className="space-y-1">
                            <Slider
                              value={[Number(selectedNode.params[param.name]) || 0]}
                              min={param.min || 0}
                              max={param.max || 100}
                              step={param.step || 1}
                              onValueChange={([v]) => updateParam(selectedNode.id, param.name, v)}
                            />
                            <div className="text-xs text-gray-500 text-right">{selectedNode.params[param.name]}</div>
                          </div>
                        ) : (
                          <Input
                            type={param.type === "int" || param.type === "float" ? "number" : "text"}
                            value={selectedNode.params[param.name] || ""}
                            onChange={(e) => {
                              const val = param.type === "int" ? parseInt(e.target.value) : param.type === "float" ? parseFloat(e.target.value) : e.target.value;
                              updateParam(selectedNode.id, param.name, val);
                            }}
                            className="h-8 text-sm"
                          />
                        )}
                        {param.description && (
                          <p className="text-[10px] text-gray-400">{param.description}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="text-xs text-gray-500">节点ID: <span className="font-mono">{selectedNode.id}</span></div>
                    <div className="text-xs text-gray-500">位置: ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Settings className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">选择一个节点查看属性</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── EDITOR TAB ─── */}
      {activeTab === "editor" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - File Tree */}
          <div className="w-56 bg-white border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">文件</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={createFile}>
                    <FilePlus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <div className="space-y-0.5">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={cn(
                      "group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm",
                      activeFileId === file.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-100 text-gray-700"
                    )}
                    onClick={() => { setActiveFileId(file.id); setContextMenuFile(null); }}
                    onContextMenu={(e) => { e.preventDefault(); setContextMenuFile(file.id); }}
                  >
                    {file.language === "python" ? <FileCode className="w-3.5 h-3.5 shrink-0" /> : <Database className="w-3.5 h-3.5 shrink-0" />}
                    {renamingFile === file.id ? (
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => renameFile(file.id, renameValue)}
                        onKeyDown={(e) => { if (e.key === "Enter") renameFile(file.id, renameValue); if (e.key === "Escape") { setRenamingFile(null); setRenameValue(""); } }}
                        className="h-6 text-xs py-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate flex-1">{file.name}</span>
                    )}
                    {contextMenuFile === file.id && renamingFile !== file.id && (
                      <div className="absolute left-48 z-50 bg-white border rounded-lg shadow-lg py-1 w-32">
                        <button
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
                          onClick={(e) => { e.stopPropagation(); setRenamingFile(file.id); setRenameValue(file.name); setContextMenuFile(null); }}
                        >
                          <FileText className="w-3 h-3" /> 重命名
                        </button>
                        <button
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                        >
                          <Trash2 className="w-3 h-3" /> 删除
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="p-3 border-t">
              <span className="text-xs font-semibold text-gray-500">代码模板</span>
              <div className="mt-2 space-y-1">
                <button className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-gray-100 flex items-center gap-2 text-gray-700" onClick={() => loadTemplate("cleaning")}>
                  <Filter className="w-3 h-3 text-emerald-500" /> 数据清洗
                </button>
                <button className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-gray-100 flex items-center gap-2 text-gray-700" onClick={() => loadTemplate("feature")}>
                  <Wand2 className="w-3 h-3 text-violet-500" /> 特征工程
                </button>
                <button className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-gray-100 flex items-center gap-2 text-gray-700" onClick={() => loadTemplate("model")}>
                  <BrainCircuit className="w-3 h-3 text-amber-500" /> 模型训练
                </button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Editor Tabs */}
            <div className="flex items-center bg-white border-b">
              {files.map(file => (
                <button
                  key={file.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs border-r border-b-2 transition-colors",
                    activeFileId === file.id
                      ? "border-b-indigo-500 text-indigo-700 bg-gray-50"
                      : "border-b-transparent text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setActiveFileId(file.id)}
                >
                  {file.language === "python" ? <FileCode className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                  {file.name}
                  <button
                    className="hover:bg-gray-200 rounded p-0.5 ml-1"
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative overflow-hidden">
              {activeFile && (
                <div className="absolute inset-0 flex">
                  {/* Line Numbers */}
                  <div className="w-12 bg-gray-50 border-r border-gray-200 text-right py-2 select-none">
                    {activeFile.content.split("\n").map((_, i) => (
                      <div key={i} className="text-xs text-gray-400 px-2 leading-6">{i + 1}</div>
                    ))}
                  </div>
                  {/* Code Area */}
                  <div className="flex-1 relative">
                    <Textarea
                      value={activeFile.content}
                      onChange={(e) => updateFileContent(activeFile.id, e.target.value)}
                      className="absolute inset-0 resize-none border-0 rounded-none font-mono text-sm leading-6 p-2 bg-white text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Terminal */}
            <div className="h-40 bg-gray-900 text-gray-100 border-t flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  <span className="text-xs font-medium">终端</span>
                  <Badge variant="outline" className="text-[10px] h-4 border-gray-600 text-gray-400">{editorOutput.length} 条日志</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-5 text-xs text-gray-400 hover:text-white" onClick={() => setEditorOutput([])}>
                    清空
                  </Button>
                </div>
              </div>
              <div ref={editorConsoleRef} className="flex-1 p-2 font-mono text-xs overflow-auto">
                {editorOutput.map((line, i) => (
                  <div key={i} className={cn(
                    "py-0.5",
                    line.includes("ERROR") && "text-red-400",
                    line.includes("SUCCESS") && "text-green-400",
                    line.includes("INFO") && "text-blue-400",
                    line.includes("OUTPUT") && "text-yellow-300",
                  )}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── DATA TAB ─── */}
      {activeTab === "data" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Column Selector & Stats */}
          <div className="w-64 bg-white border-r flex flex-col overflow-auto">
            {/* Data Overview */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold mb-3">数据概览</h3>
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-2">
                  <div className="text-xs text-gray-500">总行数</div>
                  <div className="text-lg font-bold text-indigo-600">{dataStats.totalRows}</div>
                </Card>
                <Card className="p-2">
                  <div className="text-xs text-gray-500">总列数</div>
                  <div className="text-lg font-bold text-indigo-600">{dataStats.totalCols}</div>
                </Card>
                <Card className="p-2">
                  <div className="text-xs text-gray-500">缺失值</div>
                  <div className="text-lg font-bold text-amber-600">{dataStats.totalMissing}</div>
                </Card>
                <Card className="p-2">
                  <div className="text-xs text-gray-500">缺失率</div>
                  <div className="text-lg font-bold text-red-500">{dataStats.missingRate}%</div>
                </Card>
              </div>
            </div>

            {/* Data Type Distribution */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold mb-3">数据类型分布</h3>
              <div className="space-y-2">
                {Object.entries(dataStats.typeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {type}
                    </Badge>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(count / dataStats.totalCols) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column Selector */}
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3">列选择器</h3>
              <div className="space-y-1.5">
                {sampleDataColumns.map(col => (
                  <label key={col.name} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                    <Checkbox
                      checked={visibleColumns.has(col.name)}
                      onCheckedChange={(checked) => {
                        setVisibleColumns(prev => {
                          const next = new Set(prev);
                          if (checked) next.add(col.name);
                          else next.delete(col.name);
                          return next;
                        });
                      }}
                    />
                    <span className="text-sm flex-1">{col.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4">{col.type}</Badge>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b bg-white">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="搜索数据..."
                    value={dataSearch}
                    onChange={(e) => { setDataSearch(e.target.value); setDataPage(1); }}
                    className="h-8 pl-7 text-sm w-56"
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  显示 {Math.min((dataPage - 1) * dataPageSize + 1, filteredRows.length)} - {Math.min(dataPage * dataPageSize, filteredRows.length)} / {filteredRows.length} 行
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={String(dataPageSize)} onValueChange={(v) => { setDataPageSize(Number(v)); setDataPage(1); }}>
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 行</SelectItem>
                    <SelectItem value="20">20 行</SelectItem>
                    <SelectItem value="50">50 行</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDataPage(p => Math.max(1, p - 1))} disabled={dataPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-gray-500 w-12 text-center">
                    {dataPage} / {totalPages}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDataPage(p => Math.min(totalPages, p + 1))} disabled={dataPage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    {sampleDataColumns.filter(c => visibleColumns.has(c.name)).map(col => (
                      <TableHead key={col.name} className="text-xs font-semibold">
                        <div className="flex items-center gap-1">
                          {col.name}
                          {col.missing > 0 && (
                            <span title={`缺失 ${col.missing} 个值`}><AlertTriangle className="w-3 h-3 text-amber-500" /></span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-normal">{col.type}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      {sampleDataColumns.filter(c => visibleColumns.has(c.name)).map(col => (
                        <TableCell key={col.name} className="text-xs">
                          {String((row as any)[col.name])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Console (only for canvas tab) */}
      {activeTab === "canvas" && (
        <div className="h-36 bg-gray-900 text-gray-100 border-t">
          <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <span className="text-xs font-medium">控制台</span>
              <Badge variant="outline" className="text-[10px] h-4 border-gray-600 text-gray-400">{consoleOutput.length} 条日志</Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-5 text-xs text-gray-400 hover:text-white" onClick={() => setConsoleOutput([])}>
                清空
              </Button>
            </div>
          </div>
          <div ref={consoleRef} className="p-2 font-mono text-xs overflow-auto h-[calc(100%-28px)]">
            {consoleOutput.map((line, i) => (
              <div key={i} className={cn(
                "py-0.5",
                line.includes("ERROR") && "text-red-400",
                line.includes("SUCCESS") && "text-green-400",
                line.includes("INFO") && "text-blue-400",
              )}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
