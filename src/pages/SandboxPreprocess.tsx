import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Search, Play, Plus, Trash2, Edit3, Pause,
  RotateCcw, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle,
  Eye, Wand2, SlidersHorizontal, Sparkles,
} from "lucide-react";

const initialTools = [
  { id: "T-001", name: "缺失值填充", category: "清洗", status: "enabled", config: "均值填充" },
  { id: "T-002", name: "异常值检测", category: "清洗", status: "enabled", config: "3σ原则" },
  { id: "T-003", name: "数据标准化", category: "转换", status: "enabled", config: "Z-Score" },
  { id: "T-004", name: "One-Hot编码", category: "转换", status: "disabled", config: "-" },
  { id: "T-005", name: "特征选择", category: "特征", status: "enabled", config: "方差阈值" },
  { id: "T-006", name: "PCA降维", category: "特征", status: "disabled", config: "-" },
  { id: "T-007", name: "数据分箱", category: "转换", status: "enabled", config: "等频分箱" },
  { id: "T-008", name: "数据脱敏", category: "清洗", status: "enabled", config: "哈希脱敏" },
  { id: "T-009", name: "数据合并", category: "转换", status: "enabled", config: "左连接" },
  { id: "T-010", name: "时间特征提取", category: "特征", status: "disabled", config: "-" },
  { id: "T-011", name: "文本分词", category: "清洗", status: "enabled", config: "jieba" },
  { id: "T-012", name: "离群点剔除", category: "清洗", status: "enabled", config: "IQR法则" },
];

const initialPipelineSteps = [
  { id: "S-001", name: "缺失值填充", tool: "T-001", status: "completed", duration: "15s", output: "2.4M" },
  { id: "S-002", name: "异常值检测", tool: "T-002", status: "completed", duration: "32s", output: "2.38M" },
  { id: "S-003", name: "数据标准化", tool: "T-003", status: "running", duration: "-", output: "-" },
  { id: "S-004", name: "特征选择", tool: "T-005", status: "pending", duration: "-", output: "-" },
  { id: "S-005", name: "数据脱敏", tool: "T-008", status: "pending", duration: "-", output: "-" },
  { id: "S-006", name: "数据合并", tool: "T-009", status: "pending", duration: "-", output: "-" },
  { id: "S-007", name: "文本分词", tool: "T-011", status: "pending", duration: "-", output: "-" },
  { id: "S-008", name: "离群点剔除", tool: "T-012", status: "pending", duration: "-", output: "-" },
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

  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [toolDialogMode, setToolDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [toolDrawerOpen, setToolDrawerOpen] = useState(false);

  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [stepDialogMode, setStepDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [stepDrawerOpen, setStepDrawerOpen] = useState(false);

  const filteredTools = tools.filter(t => t.name.includes(search) || t.id.includes(search));

  const getStepToolOptions = () => {
    return tools
      .filter(t => t.status === "enabled")
      .map(t => ({ label: `${t.name} (${t.id})`, value: t.id }));
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
      setTools(prev => [...prev, { id: newId, ...data } as any]);
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
      setPipelineSteps(prev => [...prev, { id: newId, status: "pending", duration: "-", output: "-", ...data } as any]);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">数据加工</h1>
          <p className="text-sm text-gray-500 mt-1">数据清洗、转换、特征工程</p>
        </div>
      </div>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools" className="gap-2"><Wand2 className="w-4 h-4" />加工工具库</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2"><SlidersHorizontal className="w-4 h-4" />处理流水线</TabsTrigger>
          <TabsTrigger value="output" className="gap-2"><CheckCircle2 className="w-4 h-4" />加工结果</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索工具..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={handleAddTool}><Plus className="w-4 h-4" />添加工具</Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">工具列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>工具ID</TableHead><TableHead>名称</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead>当前配置</TableHead><TableHead>操作</TableHead></TableRow>
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
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewTool(t)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTool(t)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTool(t.id)}>
                            {t.status === "enabled" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteToolPrompt(t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
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
                         <Badge className="bg-gray-50 text-gray-700">待执行</Badge>}
                      </TableCell>
                      <TableCell>{s.duration}</TableCell>
                      <TableCell>{s.output}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewStep(s)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveStep(s.id, "up")}><ArrowUp className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveStep(s.id, "down")}><ArrowDown className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStep(s)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteStepPrompt(s)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">加工结果</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">执行流水线后可在此查看加工结果</p>
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
