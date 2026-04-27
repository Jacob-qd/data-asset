import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Settings, Play, Plus, Trash2, Edit3, Pause,
  RotateCcw, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle,
  Eye, Wand2, SlidersHorizontal, Sparkles,
} from "lucide-react";

const tools = [
  { id: "T-001", name: "缺失值填充", category: "清洗", status: "enabled", config: "均值填充" },
  { id: "T-002", name: "异常值检测", category: "清洗", status: "enabled", config: "3σ原则" },
  { id: "T-003", name: "数据标准化", category: "转换", status: "enabled", config: "Z-Score" },
  { id: "T-004", name: "One-Hot编码", category: "转换", status: "disabled", config: "-" },
  { id: "T-005", name: "特征选择", category: "特征", status: "enabled", config: "方差阈值" },
  { id: "T-006", name: "PCA降维", category: "特征", status: "disabled", config: "-" },
  { id: "T-007", name: "数据分箱", category: "转换", status: "enabled", config: "等频分箱" },
];

const pipelineSteps = [
  { id: "S-001", name: "缺失值填充", tool: "T-001", status: "completed", duration: "15s", output: "2.4M" },
  { id: "S-002", name: "异常值检测", tool: "T-002", status: "completed", duration: "32s", output: "2.38M" },
  { id: "S-003", name: "数据标准化", tool: "T-003", status: "running", duration: "-", output: "-" },
  { id: "S-004", name: "特征选择", tool: "T-005", status: "pending", duration: "-", output: "-" },
];

export default function SandboxPreprocess() {
  const [search, setSearch] = useState("");
  const [toolOpen, setToolOpen] = useState(false);
  const [editTool, setEditTool] = useState<any>(null);
  const [toolName, setToolName] = useState("");
  const [toolCategory, setToolCategory] = useState("");
  const [toolStatus, setToolStatus] = useState("");
  const [toolConfig, setToolConfig] = useState("");
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [editStep, setEditStep] = useState<any>(null);
  const [stepName, setStepName] = useState("");
  const [stepTool, setStepTool] = useState("");

  const filteredTools = tools.filter(t => t.name.includes(search) || t.id.includes(search));

  const handleAddTool = () => {
    setEditTool(null);
    setToolName(""); setToolCategory("清洗"); setToolStatus("enabled"); setToolConfig("");
    setToolOpen(true);
  };

  const handleEditTool = (tool: any) => {
    setEditTool(tool);
    setToolName(tool.name); setToolCategory(tool.category); setToolStatus(tool.status); setToolConfig(tool.config);
    setToolOpen(true);
  };

  const handleSaveTool = () => {
    if (editTool) {
      editTool.name = toolName;
      editTool.category = toolCategory;
      editTool.status = toolStatus;
      editTool.config = toolConfig;
    } else {
      tools.push({ id: `T-${String(tools.length + 1).padStart(3, '0')}`, name: toolName, category: toolCategory, status: toolStatus, config: toolConfig });
    }
    setToolOpen(false);
  };

  const handleToggleTool = (id: string) => {
    const t = tools.find(x => x.id === id);
    if (t) t.status = t.status === "enabled" ? "disabled" : "enabled";
  };

  const handleDeleteTool = (id: string) => {
    const idx = tools.findIndex(t => t.id === id);
    if (idx >= 0) tools.splice(idx, 1);
  };

  const handleAddStep = () => {
    setEditStep(null);
    setStepName(""); setStepTool("");
    setPipelineOpen(true);
  };

  const handleEditStep = (step: any) => {
    setEditStep(step);
    setStepName(step.name); setStepTool(step.tool);
    setPipelineOpen(true);
  };

  const handleSaveStep = () => {
    if (editStep) {
      editStep.name = stepName;
      editStep.tool = stepTool;
    } else {
      pipelineSteps.push({ id: `S-${String(pipelineSteps.length + 1).padStart(3, '0')}`, name: stepName, tool: stepTool, status: "pending", duration: "-", output: "-" });
    }
    setPipelineOpen(false);
  };

  const handleDeleteStep = (id: string) => {
    const idx = pipelineSteps.findIndex(s => s.id === id);
    if (idx >= 0) pipelineSteps.splice(idx, 1);
  };

  const handleMoveStep = (id: string, dir: "up" | "down") => {
    const idx = pipelineSteps.findIndex(s => s.id === id);
    if (idx < 0) return;
    if (dir === "up" && idx > 0) {
      [pipelineSteps[idx], pipelineSteps[idx - 1]] = [pipelineSteps[idx - 1], pipelineSteps[idx]];
    } else if (dir === "down" && idx < pipelineSteps.length - 1) {
      [pipelineSteps[idx], pipelineSteps[idx + 1]] = [pipelineSteps[idx + 1], pipelineSteps[idx]];
    }
  };

  const handleRunPipeline = () => {
    pipelineSteps.forEach(s => { if (s.status === "pending") s.status = "running"; });
  };

  const handlePausePipeline = () => {
    pipelineSteps.forEach(s => { if (s.status === "running") s.status = "paused"; });
  };

  const handleResetPipeline = () => {
    pipelineSteps.forEach(s => { s.status = "pending"; s.duration = "-"; s.output = "-"; });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据加工</h1>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTool(t)}><Settings className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTool(t.id)}>
                            {t.status === "enabled" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTool(t.id)}><Trash2 className="w-4 h-4" /></Button>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveStep(s.id, "up")}><ArrowUp className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveStep(s.id, "down")}><ArrowDown className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStep(s)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteStep(s.id)}><Trash2 className="w-4 h-4" /></Button>
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

      {/* Tool Config Dialog */}
      <Dialog open={toolOpen} onOpenChange={setToolOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTool ? "配置工具" : "添加工具"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">工具名称</label>
              <Input value={toolName} onChange={e => setToolName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">分类</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={toolCategory} onChange={e => setToolCategory(e.target.value)}>
                <option value="清洗">清洗</option><option value="转换">转换</option><option value="特征">特征</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">状态</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={toolStatus} onChange={e => setToolStatus(e.target.value)}>
                <option value="enabled">已启用</option><option value="disabled">已禁用</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">配置</label>
              <Input value={toolConfig} onChange={e => setToolConfig(e.target.value)} placeholder="如：均值填充、Z-Score等" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToolOpen(false)}>取消</Button>
            <Button onClick={handleSaveTool} disabled={!toolName}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pipeline Step Dialog */}
      <Dialog open={pipelineOpen} onOpenChange={setPipelineOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editStep ? "编辑步骤" : "添加步骤"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">步骤名称</label>
              <Input value={stepName} onChange={e => setStepName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">选择工具</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={stepTool} onChange={e => setStepTool(e.target.value)}>
                <option value="">请选择</option>
                {tools.filter(t => t.status === "enabled").map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPipelineOpen(false)}>取消</Button>
            <Button onClick={handleSaveStep} disabled={!stepName || !stepTool}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
