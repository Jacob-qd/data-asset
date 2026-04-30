import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";
import {
  Play, Plus, Trash2, Edit3, Pause,
  RotateCcw, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle,
  Eye, Wand2, SlidersHorizontal, Sparkles, Download,
  ArrowRight, Database, Timer, AlertOctagon, FileSpreadsheet,
  BarChart3, TrendingUp,
} from "lucide-react";

const categories = ["全部", "清洗", "转换", "特征", "聚合", "标注", "验证"];

const initialTools = [
  { id: "T-001", name: "缺失值填充", category: "清洗", status: "enabled", config: "均值填充", usageCount: 156 },
  { id: "T-002", name: "异常值检测", category: "清洗", status: "enabled", config: "3σ原则", usageCount: 89 },
  { id: "T-003", name: "数据标准化", category: "转换", status: "enabled", config: "Z-Score", usageCount: 234 },
  { id: "T-004", name: "One-Hot编码", category: "转换", status: "disabled", config: "-", usageCount: 67 },
  { id: "T-005", name: "特征选择", category: "特征", status: "enabled", config: "方差阈值", usageCount: 112 },
  { id: "T-006", name: "PCA降维", category: "特征", status: "disabled", config: "-", usageCount: 45 },
  { id: "T-007", name: "数据分箱", category: "转换", status: "enabled", config: "等频分箱", usageCount: 78 },
  { id: "T-008", name: "数据脱敏", category: "清洗", status: "enabled", config: "哈希脱敏", usageCount: 198 },
  { id: "T-009", name: "数据合并", category: "转换", status: "enabled", config: "左连接", usageCount: 145 },
  { id: "T-010", name: "时间特征提取", category: "特征", status: "disabled", config: "-", usageCount: 34 },
  { id: "T-011", name: "文本分词", category: "清洗", status: "enabled", config: "jieba", usageCount: 267 },
  { id: "T-012", name: "离群点剔除", category: "清洗", status: "enabled", config: "IQR法则", usageCount: 123 },
];

const initialPipelineSteps = [
  { id: "S-001", name: "缺失值填充", tool: "T-001", status: "completed", duration: "15s", output: "2.4M", dependsOn: [] },
  { id: "S-002", name: "异常值检测", tool: "T-002", status: "completed", duration: "32s", output: "2.38M", dependsOn: ["S-001"] },
  { id: "S-003", name: "数据标准化", tool: "T-003", status: "running", duration: "-", output: "-", dependsOn: ["S-002"] },
  { id: "S-004", name: "特征选择", tool: "T-005", status: "pending", duration: "-", output: "-", dependsOn: ["S-003"] },
  { id: "S-005", name: "数据脱敏", tool: "T-008", status: "pending", duration: "-", output: "-", dependsOn: ["S-004"] },
  { id: "S-006", name: "数据合并", tool: "T-009", status: "pending", duration: "-", output: "-", dependsOn: ["S-005"] },
  { id: "S-007", name: "文本分词", tool: "T-011", status: "pending", duration: "-", output: "-", dependsOn: ["S-006"] },
  { id: "S-008", name: "离群点剔除", tool: "T-012", status: "pending", duration: "-", output: "-", dependsOn: ["S-007"] },
];

const mockResultStats = {
  inputRows: 2456789,
  outputRows: 2384567,
  processingTime: "12分34秒",
  errorRows: 72222,
  completeness: 98.5,
  consistency: 96.2,
  accuracy: 94.8,
};

const mockPreviewData = [
  { id: 1, name: "张三", age: 28, city: "北京", score: 85.5, status: "正常" },
  { id: 2, name: "李四", age: 34, city: "上海", score: 92.0, status: "正常" },
  { id: 3, name: "王五", age: 22, city: "广州", score: 78.3, status: "正常" },
  { id: 4, name: "赵六", age: 45, city: "深圳", score: 88.7, status: "正常" },
  { id: 5, name: "钱七", age: 31, city: "杭州", score: 91.2, status: "正常" },
  { id: 6, name: "孙八", age: 27, city: "成都", score: 82.1, status: "异常" },
  { id: 7, name: "周九", age: 39, city: "武汉", score: 95.4, status: "正常" },
  { id: 8, name: "吴十", age: 26, city: "南京", score: 87.6, status: "正常" },
  { id: 9, name: "郑十一", age: 33, city: "西安", score: 79.9, status: "正常" },
  { id: 10, name: "陈十二", age: 29, city: "重庆", score: 93.1, status: "正常" },
];

const toolFields: FieldConfig[] = [
  { key: "name", label: "工具名称", type: "text", required: true },
  { key: "category", label: "分类", type: "select", required: true, options: [
    { label: "清洗", value: "清洗" },
    { label: "转换", value: "转换" },
    { label: "特征", value: "特征" },
    { label: "聚合", value: "聚合" },
    { label: "标注", value: "标注" },
    { label: "验证", value: "验证" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已启用", value: "enabled" },
    { label: "已禁用", value: "disabled" },
    { label: "测试中", value: "testing" },
    { label: "已弃用", value: "deprecated" },
    { label: "维护中", value: "maintenance" },
    { label: "计划中", value: "planned" },
  ]},
  { key: "config", label: "当前配置", type: "text" },
];

const stepFields: FieldConfig[] = [
  { key: "name", label: "步骤名称", type: "text", required: true },
  { key: "tool", label: "使用工具", type: "select", required: true, options: [] },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已完成", value: "completed" },
    { label: "执行中", value: "running" },
    { label: "暂停", value: "paused" },
    { label: "待执行", value: "pending" },
    { label: "失败", value: "failed" },
    { label: "跳过", value: "skipped" },
  ]},
  { key: "duration", label: "耗时", type: "text" },
  { key: "output", label: "输出", type: "text" },
];

const toolDetailFields = [
  { key: "id", label: "工具ID" },
  { key: "name", label: "工具名称" },
  { key: "category", label: "分类", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "config", label: "当前配置" },
  { key: "usageCount", label: "使用次数" },
];

const stepDetailFields = [
  { key: "id", label: "步骤ID" },
  { key: "name", label: "步骤名称" },
  { key: "tool", label: "使用工具", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "duration", label: "耗时" },
  { key: "output", label: "输出" },
];

export default function SandboxPreprocess() {
  const [tools, setTools] = useState(initialTools);
  const [pipelineSteps, setPipelineSteps] = useState(initialPipelineSteps);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");

  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [toolDialogMode, setToolDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [toolDrawerOpen, setToolDrawerOpen] = useState(false);

  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [stepDialogMode, setStepDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [stepDrawerOpen, setStepDrawerOpen] = useState(false);

  const filteredTools = tools.filter(t => {
    const matchSearch = t.name.includes(search) || t.id.includes(search);
    const matchCategory = activeCategory === "全部" || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const completedSteps = pipelineSteps.filter(s => s.status === "completed").length;
  const totalSteps = pipelineSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const getStepToolOptions = () => {
    return tools
      .filter(t => t.status === "enabled")
      .map(t => ({ label: `${t.name} (${t.id})`, value: t.id }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "running": return <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />;
      case "failed": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "paused": return <Pause className="w-5 h-5 text-amber-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "running": return "bg-blue-500";
      case "failed": return "bg-red-500";
      case "paused": return "bg-amber-500";
      default: return "bg-gray-300";
    }
  };

  const handleAddTool = () => {
    setSelectedTool(null);
    setToolDialogMode("create");
    setToolDialogOpen(true);
  };

  const handleEditTool = (tool: any) => {
    setSelectedTool(tool);
    setToolDialogMode("edit");
    setToolDialogOpen(true);
  };

  const handleViewTool = (tool: any) => {
    setSelectedTool(tool);
    setToolDrawerOpen(true);
  };

  const handleDeleteToolPrompt = (tool: any) => {
    setSelectedTool(tool);
    setToolDialogMode("delete");
    setToolDialogOpen(true);
  };

  const handleSaveTool = (data: Record<string, any>) => {
    if (toolDialogMode === "edit" && selectedTool) {
      setTools(prev => prev.map(t => t.id === selectedTool.id ? { ...t, ...data } : t));
    } else {
      const newId = `T-${String(tools.length + 1).padStart(3, '0')}`;
      setTools(prev => [...prev, { id: newId, usageCount: 0, ...data } as any]);
    }
  };

  const handleConfirmDeleteTool = () => {
    if (selectedTool) {
      setTools(prev => prev.filter(t => t.id !== selectedTool.id));
    }
  };

  const handleToggleTool = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "enabled" ? "disabled" : "enabled" } : t));
  };

  const handleAddStep = () => {
    setSelectedStep(null);
    setStepDialogMode("create");
    setStepDialogOpen(true);
  };

  const handleEditStep = (step: any) => {
    setSelectedStep(step);
    setStepDialogMode("edit");
    setStepDialogOpen(true);
  };

  const handleViewStep = (step: any) => {
    setSelectedStep(step);
    setStepDrawerOpen(true);
  };

  const handleDeleteStepPrompt = (step: any) => {
    setSelectedStep(step);
    setStepDialogMode("delete");
    setStepDialogOpen(true);
  };

  const handleSaveStep = (data: Record<string, any>) => {
    if (stepDialogMode === "edit" && selectedStep) {
      setPipelineSteps(prev => prev.map(s => s.id === selectedStep.id ? { ...s, ...data } : s));
    } else {
      const newId = `S-${String(pipelineSteps.length + 1).padStart(3, '0')}`;
      setPipelineSteps(prev => [...prev, { id: newId, status: "pending", duration: "-", output: "-", dependsOn: prev.length > 0 ? [prev[prev.length - 1].id] : [], ...data } as any]);
    }
  };

  const handleConfirmDeleteStep = () => {
    if (selectedStep) {
      setPipelineSteps(prev => prev.filter(s => s.id !== selectedStep.id));
    }
  };

  const handleMoveStep = (id: string, dir: "up" | "down") => {
    setPipelineSteps(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      if (dir === "up" && idx > 0) {
        [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      } else if (dir === "down" && idx < next.length - 1) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      }
      return next;
    });
  };

  const handleRunPipeline = () => {
    setPipelineSteps(prev => prev.map(s => s.status === "pending" ? { ...s, status: "running" } : s));
  };

  const handlePausePipeline = () => {
    setPipelineSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "paused" } : s));
  };

  const handleResetPipeline = () => {
    setPipelineSteps(prev => prev.map(s => ({ ...s, status: "pending", duration: "-", output: "-" })));
  };

  const handleExport = (format: string) => {
    alert(`正在导出 ${format} 格式...`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="数据加工" />

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools" className="gap-2"><Wand2 className="w-4 h-4" />加工工具库</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2"><SlidersHorizontal className="w-4 h-4" />处理流水线</TabsTrigger>
          <TabsTrigger value="output" className="gap-2"><CheckCircle2 className="w-4 h-4" />加工结果</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <PageSearchBar
              value={search}
              onChange={setSearch}
              placeholder="搜索工具..."
              onReset={() => { setSearch(""); setActiveCategory("全部"); }}
              extraFilters={
                <div className="flex items-center gap-2">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              }
              className="flex-1"
            />
            <Button className="gap-2" onClick={handleAddTool}><Plus className="w-4 h-4" />添加工具</Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">工具列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>工具ID</TableHead><TableHead>名称</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead>当前配置</TableHead><TableHead>使用次数</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={t.status === "enabled" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
                          {t.status === "enabled" ? "已启用" : "已禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{t.config}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {t.usageCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionButtons
                          buttons={[
                            { key: "view", icon: <Eye className="w-4 h-4" />, label: "查看", onClick: () => handleViewTool(t) },
                            { key: "edit", icon: <Edit3 className="w-4 h-4" />, label: "编辑", onClick: () => handleEditTool(t) },
                            { key: "toggle", icon: t.status === "enabled" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />, label: t.status === "enabled" ? "停用" : "启用", onClick: () => handleToggleTool(t.id) },
                            { key: "delete", icon: <Trash2 className="w-4 h-4" />, label: "删除", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleDeleteToolPrompt(t) },
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

        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center gap-3">
            <Button className="gap-2" onClick={handleAddStep}><Plus className="w-4 h-4" />添加步骤</Button>
            <Button variant="outline" className="gap-2" onClick={handleRunPipeline}><Play className="w-4 h-4" />执行流水线</Button>
            <Button variant="outline" className="gap-2" onClick={handlePausePipeline}><Pause className="w-4 h-4" />暂停</Button>
            <Button variant="outline" className="gap-2" onClick={handleResetPipeline}><RotateCcw className="w-4 h-4" />重置</Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">执行进度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">整体进度</span>
                  <span className="font-medium">{completedSteps}/{totalSteps} 步骤 ({progressPercent}%)</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {pipelineSteps.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 shrink-0">
                    <div className={`relative flex flex-col items-center p-3 rounded-lg border-2 min-w-[120px] ${
                      s.status === "completed" ? "border-green-200 bg-green-50" :
                      s.status === "running" ? "border-blue-200 bg-blue-50" :
                      s.status === "failed" ? "border-red-200 bg-red-50" :
                      s.status === "paused" ? "border-amber-200 bg-amber-50" :
                      "border-gray-200 bg-gray-50"
                    }`}>
                      <div className="mb-1">{getStatusIcon(s.status)}</div>
                      <span className="text-xs font-medium text-center">{s.name}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">{s.id}</span>
                      {s.status === "running" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                      )}
                    </div>
                    {idx < pipelineSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 已完成</div>
                <div className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-500" /> 执行中</div>
                <div className="flex items-center gap-1"><Pause className="w-3.5 h-3.5 text-amber-500" /> 暂停</div>
                <div className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> 失败</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" /> 待执行</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">流水线步骤</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>序号</TableHead><TableHead>步骤ID</TableHead><TableHead>步骤名称</TableHead><TableHead>使用工具</TableHead><TableHead>状态</TableHead><TableHead>耗时</TableHead><TableHead>输出</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineSteps.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">{s.tool}</TableCell>
                      <TableCell>
                        {s.status === "completed" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />完成</Badge> :
                         s.status === "running" ? <Badge className="bg-blue-50 text-blue-700 gap-1"><Sparkles className="w-3 h-3" />执行中</Badge> :
                         s.status === "paused" ? <Badge className="bg-amber-50 text-amber-700 gap-1"><Pause className="w-3 h-3" />暂停</Badge> :
                         s.status === "failed" ? <Badge className="bg-red-50 text-red-700 gap-1"><AlertTriangle className="w-3 h-3" />失败</Badge> :
                         <Badge className="bg-gray-50 text-gray-700">待执行</Badge>}
                      </TableCell>
                      <TableCell>{s.duration}</TableCell>
                      <TableCell>{s.output}</TableCell>
                      <TableCell>
                        <ActionButtons
                          buttons={[
                            { key: "view", icon: <Eye className="w-4 h-4" />, label: "查看", onClick: () => handleViewStep(s) },
                            { key: "up", icon: <ArrowUp className="w-4 h-4" />, label: "上移", onClick: () => handleMoveStep(s.id, "up") },
                            { key: "down", icon: <ArrowDown className="w-4 h-4" />, label: "下移", onClick: () => handleMoveStep(s.id, "down") },
                            { key: "edit", icon: <Edit3 className="w-4 h-4" />, label: "编辑", onClick: () => handleEditStep(s) },
                            { key: "delete", icon: <Trash2 className="w-4 h-4" />, label: "删除", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleDeleteStepPrompt(s) },
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

        <TabsContent value="output" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">输入行数</p>
                    <p className="text-2xl font-bold mt-1">{mockResultStats.inputRows.toLocaleString()}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">输出行数</p>
                    <p className="text-2xl font-bold mt-1">{mockResultStats.outputRows.toLocaleString()}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">处理耗时</p>
                    <p className="text-2xl font-bold mt-1">{mockResultStats.processingTime}</p>
                  </div>
                  <Timer className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">异常行数</p>
                    <p className="text-2xl font-bold mt-1">{mockResultStats.errorRows.toLocaleString()}</p>
                  </div>
                  <AlertOctagon className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">数据预览（前10行）</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("CSV")}>
                    <FileSpreadsheet className="w-4 h-4" />导出CSV
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("Excel")}>
                    <Download className="w-4 h-4" />导出Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>年龄</TableHead>
                    <TableHead>城市</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPreviewData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.age}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>{row.score}</TableCell>
                      <TableCell>
                        <Badge className={row.status === "正常" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数据质量报告</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">完整性</span>
                    </div>
                    <span className="text-lg font-bold">{mockResultStats.completeness}%</span>
                  </div>
                  <Progress value={mockResultStats.completeness} className="h-2" />
                  <p className="text-xs text-gray-500">字段填充率、非空值比例等指标综合评估</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-medium">一致性</span>
                    </div>
                    <span className="text-lg font-bold">{mockResultStats.consistency}%</span>
                  </div>
                  <Progress value={mockResultStats.consistency} className="h-2" />
                  <p className="text-xs text-gray-500">数据格式统一性、逻辑一致性等指标评估</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">准确性</span>
                    </div>
                    <span className="text-lg font-bold">{mockResultStats.accuracy}%</span>
                  </div>
                  <Progress value={mockResultStats.accuracy} className="h-2" />
                  <p className="text-xs text-gray-500">数据正确性、异常值检测等指标评估</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={toolDialogOpen}
        onOpenChange={setToolDialogOpen}
        title={selectedTool?.name || "工具"}
        fields={toolFields}
        data={selectedTool || {}}
        mode={toolDialogMode}
        onSubmit={handleSaveTool}
        onDelete={handleConfirmDeleteTool}
      />

      <CrudDialog
        open={stepDialogOpen}
        onOpenChange={setStepDialogOpen}
        title={selectedStep?.name || "步骤"}
        fields={stepFields.map(f => f.key === "tool" ? { ...f, options: getStepToolOptions() } : f)}
        data={selectedStep || {}}
        mode={stepDialogMode}
        onSubmit={handleSaveStep}
        onDelete={handleConfirmDeleteStep}
      />

      <DetailDrawer
        open={toolDrawerOpen}
        onOpenChange={setToolDrawerOpen}
        title="工具详情"
        data={selectedTool || {}}
        fields={toolDetailFields}
        onEdit={() => { setToolDrawerOpen(false); handleEditTool(selectedTool); }}
        onDelete={() => { setToolDrawerOpen(false); handleDeleteToolPrompt(selectedTool); }}
      />

      <DetailDrawer
        open={stepDrawerOpen}
        onOpenChange={setStepDrawerOpen}
        title="步骤详情"
        data={selectedStep || {}}
        fields={stepDetailFields}
        onEdit={() => { setStepDrawerOpen(false); handleEditStep(selectedStep); }}
        onDelete={() => { setStepDrawerOpen(false); handleDeleteStepPrompt(selectedStep); }}
      />
    </div>
  );
}
