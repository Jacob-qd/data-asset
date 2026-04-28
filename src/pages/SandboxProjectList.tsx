import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  FlaskConical, Play, Pause, BarChart3, Search, Plus,
  Filter, ArrowUpDown, MoreHorizontal, FolderKanban, Zap,
  HardDrive, Settings, ChevronDown, Trash2, Edit3, Eye,
  Terminal, Clock, CheckCircle2, AlertTriangle, FileText,
  Users, Globe, BookOpen, XCircle, RotateCcw, Activity,
  Cpu, Database, TrendingUp, LayoutDashboard, Server, Box,
  Share,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface Project {
  id: string;
  name: string;
  owner: string;
  type: string;
  status: string;
  startTime: string;
  env: string;
  progress: number;
}

interface Activity {
  id: string;
  action: string;
  target: string;
  user: string;
  time: string;
  type: string;
}

interface RecentSandbox {
  id: string;
  name: string;
  user: string;
  accessedAt: string;
  env: string;
}

const initialProjects: Project[] = [
  { id: "SBX-2024-001", name: "零售客户画像分析", owner: "张三", type: "数据分析", status: "running", startTime: "2024-01-15", env: "Python 3.9", progress: 78 },
  { id: "SBX-2024-002", name: "信用评分模型", owner: "李四", type: "模型开发", status: "completed", startTime: "2024-01-10", env: "Python 3.10 + PyTorch", progress: 100 },
  { id: "SBX-2024-003", name: "异常交易检测", owner: "王五", type: "模型开发", status: "paused", startTime: "2024-01-20", env: "Python 3.9 + TensorFlow", progress: 45 },
  { id: "SBX-2024-004", name: "供应链预测", owner: "赵六", type: "数据分析", status: "running", startTime: "2024-01-25", env: "R 4.2", progress: 32 },
  { id: "SBX-2024-005", name: "用户流失预警", owner: "张三", type: "模型开发", status: "draft", startTime: "2024-02-01", env: "Python 3.10", progress: 0 },
  { id: "SBX-2024-006", name: "推荐系统实验", owner: "李四", type: "算法实验", status: "running", startTime: "2024-02-05", env: "Python 3.10 + PyTorch", progress: 65 },
  { id: "SBX-2024-007", name: "金融风险预警", owner: "王五", type: "模型开发", status: "completed", startTime: "2024-02-08", env: "Python 3.9", progress: 100 },
  { id: "SBX-2024-008", name: "用户行为分析", owner: "赵六", type: "数据分析", status: "paused", startTime: "2024-02-10", env: "R 4.2", progress: 28 },
  { id: "SBX-2024-009", name: "销量预测模型", owner: "张三", type: "模型开发", status: "draft", startTime: "2024-02-12", env: "Python 3.10", progress: 15 },
  { id: "SBX-2024-010", name: "客户分群实验", owner: "李四", type: "算法实验", status: "running", startTime: "2024-02-15", env: "Julia 1.9", progress: 52 },
];

const quickActions = [
  { label: "沙箱IDE", desc: "进入在线开发环境", icon: <Terminal className="w-5 h-5" />, path: "/sandbox/ide", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "数据探查", desc: "浏览数据源", icon: <BookOpen className="w-5 h-5" />, path: "/sandbox/preview", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  { label: "数据加工", desc: "数据清洗与转换", icon: <Zap className="w-5 h-5" />, path: "/sandbox/preprocess", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { label: "模型开发", desc: "算法训练与评估", icon: <FlaskConical className="w-5 h-5" />, path: "/sandbox/train", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { label: "结果审查", desc: "审批与发布", icon: <CheckCircle2 className="w-5 h-5" />, path: "/sandbox/review", color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { label: "运行环境", desc: "查看环境状态", icon: <HardDrive className="w-5 h-5" />, path: "/sandbox/run", color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
  { label: "隐私计算", desc: "将沙箱成果发布到隐私计算平台", icon: <Share className="w-5 h-5" />, path: "/sandbox/privacy-computing", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
];

const initialActivities: Activity[] = [
  { id: "ACT-001", action: "训练完成", target: "信用评分模型", user: "李四", time: "10分钟前", type: "success" },
  { id: "ACT-002", action: "数据导入", target: "零售客户数据", user: "张三", time: "30分钟前", type: "info" },
  { id: "ACT-003", action: "审查驳回", target: "异常交易模型", user: "审核员A", time: "1小时前", type: "warning" },
  { id: "ACT-004", action: "环境创建", target: "Python 3.10", user: "系统", time: "2小时前", type: "info" },
  { id: "ACT-005", action: "任务暂停", target: "供应链预测", user: "赵六", time: "3小时前", type: "warning" },
  { id: "ACT-006", action: "模型发布", target: "用户流失预警", user: "张三", time: "4小时前", type: "success" },
  { id: "ACT-007", action: "数据导出", target: "推荐系统数据", user: "李四", time: "5小时前", type: "info" },
  { id: "ACT-008", action: "审查通过", target: "金融风险预警", user: "审核员B", time: "6小时前", type: "success" },
  { id: "ACT-009", action: "环境更新", target: "R 4.2", user: "系统", time: "8小时前", type: "info" },
  { id: "ACT-010", action: "任务失败", target: "销量预测模型", user: "张三", time: "10小时前", type: "warning" },
];

const recentSandboxes: RecentSandbox[] = [
  { id: "SBX-2024-002", name: "信用评分模型", user: "李四", accessedAt: "5分钟前", env: "Python 3.10 + PyTorch" },
  { id: "SBX-2024-001", name: "零售客户画像分析", user: "张三", accessedAt: "15分钟前", env: "Python 3.9" },
  { id: "SBX-2024-004", name: "供应链预测", user: "赵六", accessedAt: "42分钟前", env: "R 4.2" },
  { id: "SBX-2024-003", name: "异常交易检测", user: "王五", accessedAt: "1小时前", env: "Python 3.9 + TensorFlow" },
  { id: "SBX-2024-006", name: "推荐系统实验", user: "李四", accessedAt: "2小时前", env: "Python 3.10 + PyTorch" },
  { id: "SBX-2024-007", name: "金融风险预警", user: "王五", accessedAt: "3小时前", env: "Python 3.9" },
  { id: "SBX-2024-010", name: "客户分群实验", user: "李四", accessedAt: "4小时前", env: "Julia 1.9" },
  { id: "SBX-2024-008", name: "用户行为分析", user: "赵六", accessedAt: "5小时前", env: "R 4.2" },
];

const environments = [
  { name: "Python 3.9", version: "3.9.18", status: "active", packages: 284, usage: 3 },
  { name: "Python 3.10", version: "3.10.13", status: "active", packages: 312, usage: 2 },
  { name: "R 4.2", version: "4.2.3", status: "active", packages: 156, usage: 1 },
  { name: "Julia 1.9", version: "1.9.3", status: "maintenance", packages: 89, usage: 0 },
];

const resourceStats = {
  cpu: { used: 68, total: 100, unit: "核" },
  memory: { used: 42, total: 64, unit: "GB" },
  storage: { used: 820, total: 1024, unit: "GB" },
};

const projectFields: FieldConfig[] = [
  { key: "name", label: "项目名称", type: "text", required: true, placeholder: "请输入项目名称" },
  { key: "owner", label: "负责人", type: "text", placeholder: "默认当前用户" },
  {
    key: "type", label: "项目类型", type: "select", required: true, options: [
      { label: "数据分析", value: "数据分析" },
      { label: "模型开发", value: "模型开发" },
      { label: "数据探查", value: "数据探查" },
      { label: "算法实验", value: "算法实验" },
    ],
  },
  {
    key: "status", label: "状态", type: "select", options: [
      { label: "草稿", value: "draft" },
      { label: "运行中", value: "running" },
      { label: "已暂停", value: "paused" },
      { label: "已完成", value: "completed" },
    ],
  },
  { key: "startTime", label: "开始时间", type: "text", placeholder: "YYYY-MM-DD" },
  {
    key: "env", label: "运行环境", type: "select", required: true, options: [
      { label: "Python 3.9", value: "Python 3.9" },
      { label: "Python 3.10", value: "Python 3.10" },
      { label: "Python 3.10 + PyTorch", value: "Python 3.10 + PyTorch" },
      { label: "Python 3.9 + TensorFlow", value: "Python 3.9 + TensorFlow" },
      { label: "R 4.2", value: "R 4.2" },
      { label: "Julia 1.9", value: "Julia 1.9" },
    ],
  },
  { key: "progress", label: "进度", type: "number", placeholder: "0-100" },
];

const algorithmOptions = [
  { label: "PSI隐私求交", value: "PSI隐私求交" },
  { label: "PIR隐匿查询", value: "PIR隐匿查询" },
  { label: "联合统计", value: "联合统计" },
  { label: "联邦学习", value: "联邦学习" },
];

export default function SandboxProjectList() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [recentActivities, setRecentActivities] = useState<Activity[]>(initialActivities);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any>>({});

  // Publish dialog state
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishProject, setPublishProject] = useState<Project | null>(null);
  const [publishAlgorithm, setPublishAlgorithm] = useState("PSI隐私求交");
  const [publishTaskName, setPublishTaskName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(search) || p.id.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    running: { label: "运行中", color: "bg-green-50 text-green-700 border-green-200", icon: <Play className="w-3 h-3" /> },
    paused: { label: "已暂停", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Pause className="w-3 h-3" /> },
    completed: { label: "已完成", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    draft: { label: "草稿", color: "bg-gray-50 text-gray-700 border-gray-200", icon: <FileText className="w-3 h-3" /> },
  };

  const openCreate = () => {
    setDialogMode("create");
    setDialogData({ status: "draft", progress: "0", startTime: new Date().toISOString().split('T')[0] });
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setDialogMode("edit");
    setDialogData({ ...project, progress: String(project.progress) });
    setDialogOpen(true);
  };

  const openView = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const openDelete = (project: Project) => {
    setDialogMode("delete");
    setDialogData(project);
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const openPublishDialog = (project: Project) => {
    setPublishProject(project);
    setPublishAlgorithm("PSI隐私求交");
    setPublishTaskName(`${project.name}-隐私计算`);
    setPublishDescription("");
    setPublishDialogOpen(true);
  };

  const handlePublishConfirm = () => {
    if (!publishProject) return;
    setPublishedIds(prev => new Set(prev).add(publishProject.id));
    setRecentActivities(prev => [
      { id: `ACT-${Date.now()}`, action: `发布到隐私计算: ${publishAlgorithm}`, target: publishProject.name, user: publishProject.owner, time: "刚刚", type: "success" },
      ...prev,
    ]);
    setPublishSuccess(`项目"${publishProject.name}"已成功发布到隐私计算平台`);
    setPublishDialogOpen(false);
    setTimeout(() => setPublishSuccess(null), 4000);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newProject: Project = {
        id: `SBX-2024-${String(projects.length + 1).padStart(3, '0')}`,
        name: data.name || "",
        owner: data.owner || "当前用户",
        type: data.type || "",
        status: data.status || "draft",
        startTime: data.startTime || new Date().toISOString().split('T')[0],
        env: data.env || "",
        progress: Number(data.progress) || 0,
      };
      setProjects(prev => [newProject, ...prev]);
      setRecentActivities(prev => [
        { id: `ACT-${Date.now()}`, action: "创建项目", target: newProject.name, user: newProject.owner, time: "刚刚", type: "info" },
        ...prev,
      ]);
    } else if (dialogMode === "edit" && dialogData.id) {
      setProjects(prev => prev.map(p => p.id === dialogData.id ? {
        ...p,
        name: data.name || p.name,
        owner: data.owner || p.owner,
        type: data.type || p.type,
        status: data.status || p.status,
        startTime: data.startTime || p.startTime,
        env: data.env || p.env,
        progress: Number(data.progress) ?? p.progress,
      } : p));
    }
  };

  const handleDelete = () => {
    if (selectedProject) {
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setSelectedProject(null);
      setDetailOpen(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      let newStatus = p.status;
      if (p.status === "running") newStatus = "paused";
      else if (p.status === "paused") newStatus = "running";
      else if (p.status === "draft") newStatus = "running";
      return { ...p, status: newStatus };
    }));
  };

  const detailFields = [
    { key: "id", label: "项目ID" },
    { key: "name", label: "项目名称" },
    { key: "owner", label: "负责人" },
    { key: "type", label: "项目类型", type: "badge" as const },
    { key: "env", label: "运行环境" },
    { key: "startTime", label: "创建时间", type: "date" as const },
    { key: "progress", label: "当前进度" },
  ];

  const activeProjects = projects.filter(p => p.status === "running").length;
  const todayRuns = 42;
  const resourceUsage = Math.round((resourceStats.cpu.used / resourceStats.cpu.total) * 100);
  const exploreCount = 128;

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {publishSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{publishSuccess}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">沙箱工作台</h1>
          <p className="text-sm text-gray-500 mt-1">管理沙箱项目、快速进入开发环境</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />新建项目
        </Button>
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
                    const isPublished = publishedIds.has(p.id);
                    const canPublish = p.status === "completed" || p.progress >= 80;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {p.name}
                            {isPublished && (
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                                已发布
                              </Badge>
                            )}
                          </div>
                        </TableCell>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(p)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit3 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(p.id)}>
                              {p.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            {canPublish && (
                              isPublished ? (
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-indigo-600" disabled>
                                  <Share className="w-4 h-4 mr-1" />已发布
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => openPublishDialog(p)} title="发布到隐私计算">
                                  <Share className="w-4 h-4" />
                                </Button>
                              )
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDelete(p)}><Trash2 className="w-4 h-4" /></Button>
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

        <TabsContent value="quick" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">活跃项目数</p>
                    <p className="text-2xl font-bold mt-1">{activeProjects}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">今日运行次数</p>
                    <p className="text-2xl font-bold mt-1">{todayRuns}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">资源使用率</p>
                    <p className="text-2xl font-bold mt-1">{resourceUsage}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">数据探查次数</p>
                    <p className="text-2xl font-bold mt-1">{exploreCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">快捷操作</h3>
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Card key={action.label} className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${action.color}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                      {action.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{action.label}</div>
                      <p className="text-xs opacity-80 mt-0.5">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resource Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                资源概览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <span className="text-sm text-gray-500">{resourceStats.cpu.used} / {resourceStats.cpu.total} {resourceStats.cpu.unit}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(resourceStats.cpu.used / resourceStats.cpu.total) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">内存</span>
                  </div>
                  <span className="text-sm text-gray-500">{resourceStats.memory.used} / {resourceStats.memory.total} {resourceStats.memory.unit}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(resourceStats.memory.used / resourceStats.memory.total) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">存储</span>
                  </div>
                  <span className="text-sm text-gray-500">{resourceStats.storage.used} / {resourceStats.storage.total} {resourceStats.storage.unit}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(resourceStats.storage.used / resourceStats.storage.total) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Environments + Recent Usage */}
          <div className="grid grid-cols-2 gap-6">
            {/* Common Environments */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">常用环境</h3>
              <div className="space-y-3">
                {environments.map((env) => (
                  <Card key={env.name} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${env.status === "active" ? "bg-green-500" : "bg-amber-500"}`} />
                        <div>
                          <div className="text-sm font-medium">{env.name}</div>
                          <div className="text-xs text-gray-500">v{env.version} · {env.packages} 包</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{env.usage} 个项目使用</span>
                        <Badge variant="outline" className={env.status === "active" ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"}>
                          {env.status === "active" ? "正常" : "维护中"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Usage */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">最近使用</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">沙箱名称</TableHead>
                        <TableHead className="text-xs">用户</TableHead>
                        <TableHead className="text-xs">环境</TableHead>
                        <TableHead className="text-xs">时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSandboxes.map((sb) => (
                        <TableRow key={sb.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="text-sm font-medium py-2">{sb.name}</TableCell>
                          <TableCell className="text-xs py-2">{sb.user}</TableCell>
                          <TableCell className="text-xs py-2">{sb.env}</TableCell>
                          <TableCell className="text-xs text-gray-500 py-2">{sb.accessedAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
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

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>发布到隐私计算</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="algorithm">算法类型</Label>
              <Select value={publishAlgorithm} onValueChange={setPublishAlgorithm}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="选择算法类型" />
                </SelectTrigger>
                <SelectContent>
                  {algorithmOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskName">任务名称</Label>
              <Input
                id="taskName"
                value={publishTaskName}
                onChange={(e) => setPublishTaskName(e.target.value)}
                placeholder="请输入任务名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="请输入任务描述"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>取消</Button>
            <Button onClick={handlePublishConfirm}>确认发布</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="沙箱项目"
        fields={projectFields}
        data={dialogData}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="项目详情"
        data={selectedProject || {}}
        fields={detailFields}
        onEdit={() => {
          if (selectedProject) {
            setDialogMode("edit");
            setDialogData({ ...selectedProject, progress: String(selectedProject.progress) });
            setDialogOpen(true);
          }
        }}
        onDelete={() => {
          if (selectedProject) {
            setDialogMode("delete");
            setDialogData(selectedProject);
            setDialogOpen(true);
          }
        }}
      />
    </div>
  );
}
