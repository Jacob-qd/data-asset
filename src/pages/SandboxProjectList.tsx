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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FlaskConical, Play, Pause, BarChart3, Search, Plus,
  Filter, ArrowUpDown, MoreHorizontal, FolderKanban, Zap,
  HardDrive, Settings, ChevronDown, Trash2, Edit3, Eye,
  Terminal, Clock, CheckCircle2, AlertTriangle, FileText,
  Users, Globe, BookOpen, XCircle, RotateCcw,
} from "lucide-react";

const projects = [
  { id: "SBX-2024-001", name: "零售客户画像分析", owner: "张三", type: "数据分析", status: "running", startTime: "2024-01-15", env: "Python 3.9", progress: 78 },
  { id: "SBX-2024-002", name: "信用评分模型", owner: "李四", type: "模型开发", status: "completed", startTime: "2024-01-10", env: "Python 3.10 + PyTorch", progress: 100 },
  { id: "SBX-2024-003", name: "异常交易检测", owner: "王五", type: "模型开发", status: "paused", startTime: "2024-01-20", env: "Python 3.9 + TensorFlow", progress: 45 },
  { id: "SBX-2024-004", name: "供应链预测", owner: "赵六", type: "数据分析", status: "running", startTime: "2024-01-25", env: "R 4.2", progress: 32 },
  { id: "SBX-2024-005", name: "用户流失预警", owner: "张三", type: "模型开发", status: "draft", startTime: "2024-02-01", env: "Python 3.10", progress: 0 },
];

const quickActions = [
  { label: "沙箱IDE", desc: "进入在线开发环境", icon: <Terminal className="w-4 h-4" />, path: "/sandbox/ide" },
  { label: "数据探查", desc: "浏览数据源", icon: <BookOpen className="w-4 h-4" />, path: "/sandbox/preview" },
  { label: "数据加工", desc: "数据清洗与转换", icon: <Zap className="w-4 h-4" />, path: "/sandbox/preprocess" },
  { label: "模型开发", desc: "算法训练与评估", icon: <FlaskConical className="w-4 h-4" />, path: "/sandbox/train" },
  { label: "结果审查", desc: "审批与发布", icon: <CheckCircle2 className="w-4 h-4" />, path: "/sandbox/review" },
  { label: "运行环境", desc: "查看环境状态", icon: <HardDrive className="w-4 h-4" />, path: "/sandbox/run" },
];

const recentActivities = [
  { id: "ACT-001", action: "训练完成", target: "信用评分模型", user: "李四", time: "10分钟前", type: "success" },
  { id: "ACT-002", action: "数据导入", target: "零售客户数据", user: "张三", time: "30分钟前", type: "info" },
  { id: "ACT-003", action: "审查驳回", target: "异常交易模型", user: "审核员A", time: "1小时前", type: "warning" },
  { id: "ACT-004", action: "环境创建", target: "Python 3.10", user: "系统", time: "2小时前", type: "info" },
  { id: "ACT-005", action: "任务暂停", target: "供应链预测", user: "赵六", time: "3小时前", type: "warning" },
];

export default function SandboxProjectList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formEnv, setFormEnv] = useState("");
  const [formOwner, setFormOwner] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(search) || p.id.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    running: { label: "运行中", color: "bg-green-50 text-green-700 border-green-200", icon: <Play className="w-3 h-3" /> },
    paused: { label: "已暂停", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Pause className="w-3 h-3" /> },
    completed: { label: "已完成", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    draft: { label: "草稿", color: "bg-gray-50 text-gray-700 border-gray-200", icon: <FileText className="w-3 h-3" /> },
  };

  const handleAdd = () => {
    setFormName(""); setFormType(""); setFormEnv(""); setFormOwner(""); setFormDesc("");
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!formName || !formType || !formEnv) return;
    // 模拟添加
    projects.unshift({
      id: `SBX-2024-${String(projects.length + 1).padStart(3, '0')}`,
      name: formName,
      owner: formOwner || "当前用户",
      type: formType,
      status: "draft",
      startTime: new Date().toISOString().split('T')[0],
      env: formEnv,
      progress: 0,
    });
    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    const idx = projects.findIndex(p => p.id === id);
    if (idx >= 0) projects.splice(idx, 1);
    setDetailOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const p = projects.find(p => p.id === id);
    if (!p) return;
    if (p.status === "running") p.status = "paused";
    else if (p.status === "paused") p.status = "running";
    else if (p.status === "draft") p.status = "running";
    setDetailOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">沙箱工作台</h1>
          <p className="text-sm text-gray-500 mt-1">管理沙箱项目、快速进入开发环境</p>
        </div>
        <Button className="gap-2" onClick={handleAdd}>
          <Plus className="w-4 h-4" />新建项目
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Card key={action.label} className="cursor-pointer hover:bg-gray-50/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                {action.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs text-gray-500">{action.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2"><FolderKanban className="w-4 h-4" />我的项目</TabsTrigger>
          <TabsTrigger value="quick" className="gap-2"><Zap className="w-4 h-4" />快速入口</TabsTrigger>
          <TabsTrigger value="activities" className="gap-2"><Clock className="w-4 h-4" />最近动态</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索项目ID或名称..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="running">运行中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">项目列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>项目ID</TableHead>
                    <TableHead>项目名称</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>环境</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const s = statusMap[p.status];
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" />{p.owner}</TableCell>
                        <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`gap-1 ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                        <TableCell className="text-xs">{p.env}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-xs">{p.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedProject(p); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(p.id)}>
                              {p.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Card key={action.label} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-base font-semibold">{action.label}</div>
                    <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-indigo-600" onClick={() => window.location.href = action.path}>立即进入 →</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">最近动态</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      act.type === "success" ? "bg-green-50 text-green-600" :
                      act.type === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {act.type === "success" ? <CheckCircle2 className="w-4 h-4" /> :
                       act.type === "warning" ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{act.action} — <span className="text-gray-700">{act.target}</span></div>
                      <div className="text-xs text-gray-500 mt-0.5">{act.user} · {act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Project Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建沙箱项目</DialogTitle>
            <DialogDescription>配置项目基本信息和运行环境</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">项目名称 <span className="text-red-500">*</span></label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="请输入项目名称" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">项目类型 <span className="text-red-500">*</span></label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="数据分析">数据分析</SelectItem>
                    <SelectItem value="模型开发">模型开发</SelectItem>
                    <SelectItem value="数据探查">数据探查</SelectItem>
                    <SelectItem value="算法实验">算法实验</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">运行环境 <span className="text-red-500">*</span></label>
                <Select value={formEnv} onValueChange={setFormEnv}>
                  <SelectTrigger><SelectValue placeholder="选择环境" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Python 3.9">Python 3.9</SelectItem>
                    <SelectItem value="Python 3.10">Python 3.10</SelectItem>
                    <SelectItem value="Python 3.10 + PyTorch">Python 3.10 + PyTorch</SelectItem>
                    <SelectItem value="Python 3.9 + TensorFlow">Python 3.9 + TensorFlow</SelectItem>
                    <SelectItem value="R 4.2">R 4.2</SelectItem>
                    <SelectItem value="Julia 1.9">Julia 1.9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">负责人</label>
                <Input value={formOwner} onChange={e => setFormOwner(e.target.value)} placeholder="默认当前用户" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">项目描述</label>
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="描述项目目标和预期产出..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!formName || !formType || !formEnv}>确认创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>项目详情</SheetTitle>
            <SheetDescription>查看和管理项目信息</SheetDescription>
          </SheetHeader>
          {selectedProject && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">项目ID</span><span className="text-sm font-mono">{selectedProject.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">项目名称</span><span className="text-sm font-medium">{selectedProject.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">负责人</span><span className="text-sm">{selectedProject.owner}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">项目类型</span><Badge variant="outline">{selectedProject.type}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">运行环境</span><span className="text-sm">{selectedProject.env}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">创建时间</span><span className="text-sm">{selectedProject.startTime}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">当前进度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedProject.progress}%` }} />
                    </div>
                    <span className="text-xs">{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => handleToggleStatus(selectedProject.id)}>
                  {selectedProject.status === "running" ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />启动</>}
                </Button>
                <Button variant="outline" className="gap-2 text-red-500" onClick={() => handleDelete(selectedProject.id)}>
                  <Trash2 className="w-4 h-4" />删除
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
