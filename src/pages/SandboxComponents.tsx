import { useState } from "react";
import { Cpu, Plus, Search, Code, Upload, Eye, GitBranch, BarChart3, Table, Filter, Layers, Brain, Gauge, FlaskConical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import type { FieldConfig } from "@/components/CrudDialog";
import { cn } from "@/lib/utils";

type ComponentItem = {
  id: string;
  name: string;
  category: string;
  desc: string;
  inputs: string;
  outputs: string;
  version: string;
  author: string;
  usage: number;
};

const categories = ["全部", "数据分析", "数据关联", "特征工程", "本地算法", "模型评估", "样本设计"];

const categoryIcons: Record<string, React.ElementType> = {
  "数据分析": BarChart3,
  "数据关联": GitBranch,
  "特征工程": Gauge,
  "本地算法": Brain,
  "模型评估": Table,
  "样本设计": FlaskConical,
};

const componentFields: FieldConfig[] = [
  { key: "id", label: "组件ID", type: "text", required: true, placeholder: "如 C-001" },
  { key: "name", label: "组件名称", type: "text", required: true },
  { key: "category", label: "分类", type: "select", required: true, options: categories.filter(c => c !== "全部").map(c => ({ label: c, value: c })) },
  { key: "desc", label: "描述", type: "textarea", required: true },
  { key: "inputs", label: "输入", type: "text", required: true },
  { key: "outputs", label: "输出", type: "text", required: true },
  { key: "version", label: "版本", type: "text", required: true, placeholder: "如 1.0.0" },
  { key: "author", label: "作者", type: "text", required: true },
  { key: "usage", label: "使用次数", type: "number", required: true },
];

const detailFields = [
  { key: "id", label: "组件ID" },
  { key: "name", label: "组件名称" },
  { key: "category", label: "分类", type: "badge" as const },
  { key: "desc", label: "描述" },
  { key: "inputs", label: "输入" },
  { key: "outputs", label: "输出" },
  { key: "version", label: "版本" },
  { key: "author", label: "作者" },
  { key: "usage", label: "使用次数" },
];

export default function SandboxComponents() {
  const [components, setComponents] = useState<ComponentItem[]>([
    { id: "C-001", name: "描述性统计", category: "数据分析", desc: "计算均值、方差、标准差等基础统计量", inputs: "数值型数据", outputs: "统计报告", version: "2.1.0", author: "系统", usage: 1250 },
    { id: "C-002", name: "相关系数矩阵", category: "数据分析", desc: "计算变量间的皮尔逊相关系数", inputs: "多变量数据", outputs: "相关系数矩阵", version: "1.5.0", author: "系统", usage: 890 },
    { id: "C-003", name: "数据探查", category: "数据分析", desc: "自动探查数据分布、异常值和缺失值", inputs: "任意数据表", outputs: "数据质量报告", version: "3.0.0", author: "系统", usage: 2100 },
    { id: "C-004", name: "表关联", category: "数据关联", desc: "多表JOIN操作，支持内连接、左连接", inputs: "两个数据表", outputs: "关联结果", version: "2.0.0", author: "系统", usage: 1560 },
    { id: "C-005", name: "特征交叉", category: "数据关联", desc: "生成交叉特征用于模型训练", inputs: "分类特征", outputs: "交叉特征", version: "1.2.0", author: "系统", usage: 670 },
    { id: "C-006", name: "标准化", category: "特征工程", desc: "Z-score标准化和Min-Max归一化", inputs: "数值特征", outputs: "标准化特征", version: "2.3.0", author: "系统", usage: 1890 },
    { id: "C-007", name: "特征编码", category: "特征工程", desc: "One-Hot编码和Label编码", inputs: "分类特征", outputs: "编码特征", version: "1.8.0", author: "系统", usage: 1430 },
    { id: "C-008", name: "逻辑回归", category: "本地算法", desc: "二分类和多分类逻辑回归模型", inputs: "特征+标签", outputs: "模型+预测", version: "3.1.0", author: "系统", usage: 980 },
    { id: "C-009", name: "XGBoost", category: "本地算法", desc: "梯度提升决策树算法", inputs: "特征+标签", outputs: "模型+预测", version: "4.0.0", author: "系统", usage: 1120 },
    { id: "C-010", name: "K-Means", category: "本地算法", desc: "K均值聚类算法", inputs: "数值特征", outputs: "聚类标签", version: "2.5.0", author: "系统", usage: 760 },
    { id: "C-011", name: "准确率评估", category: "模型评估", desc: "分类模型准确率、精确率、召回率", inputs: "预测结果+真实标签", outputs: "评估报告", version: "1.5.0", author: "系统", usage: 1340 },
    { id: "C-012", name: "AUC-ROC", category: "模型评估", desc: "绘制ROC曲线并计算AUC值", inputs: "预测概率+真实标签", outputs: "ROC曲线+AUC", version: "2.0.0", author: "系统", usage: 890 },
    { id: "C-013", name: "随机抽样", category: "样本设计", desc: "简单随机抽样", inputs: "数据表", outputs: "抽样结果", version: "1.0.0", author: "系统", usage: 2340 },
    { id: "C-014", name: "分层抽样", category: "样本设计", desc: "按分层字段进行分层抽样", inputs: "数据表+分层字段", outputs: "抽样结果", version: "1.5.0", author: "系统", usage: 1560 },
    { id: "C-015", name: "自定义Python", category: "本地算法", desc: "使用Python脚本自定义算法", inputs: "自定义", outputs: "自定义", version: "1.0.0", author: "用户", usage: 320 },
    { id: "C-016", name: "JAR函数", category: "本地算法", desc: "上传JAR包自定义函数", inputs: "自定义", outputs: "自定义", version: "1.0.0", author: "用户", usage: 45 },
    { id: "C-017", name: "卡方检验", category: "数据分析", desc: "特征与标签的卡方独立性检验", inputs: "分类特征+标签", outputs: "卡方统计量", version: "1.3.0", author: "系统", usage: 560 },
    { id: "C-018", name: "PCA降维", category: "特征工程", desc: "主成分分析降维", inputs: "数值特征", outputs: "降维结果", version: "2.0.0", author: "系统", usage: 780 },
  ]);

  const [activeCategory, setActiveCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<ComponentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = components.filter((c) => {
    const mc = activeCategory === "全部" || c.category === activeCategory;
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: ComponentItem) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (item: ComponentItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (item: ComponentItem) => {
    setSelectedItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      setComponents([...components, data as ComponentItem]);
    } else if (dialogMode === "edit" && selectedItem) {
      setComponents(components.map(c => c.id === selectedItem.id ? { ...data, id: selectedItem.id } as ComponentItem : c));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setComponents(components.filter(c => c.id !== selectedItem.id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索组件" className="pl-9 w-64" /></div>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={handleCreate} className="gap-2"><Code className="w-4 h-4" />Python脚本</Button><Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" />新建组件</Button></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => <button key={c} onClick={() => setActiveCategory(c)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", activeCategory === c ? "bg-primary-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}>{c}</button>)}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((c) => {
          const Icon = categoryIcons[c.category] || Code;
          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center"><Icon className="w-5 h-5 text-primary-500" /></div>
                <Badge variant="outline" className="text-xs">{c.category}</Badge>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{c.name}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.desc}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                <span>输入: {c.inputs}</span><span>输出: {c.outputs}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>v{c.version}</span><span>·</span><span>{c.usage}次使用</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleView(c)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="组件"
        fields={componentFields}
        data={selectedItem || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedItem?.name || "组件详情"}
        data={selectedItem || {}}
        fields={detailFields}
        onEdit={() => { if (selectedItem) { setDrawerOpen(false); handleEdit(selectedItem); } }}
        onDelete={() => { if (selectedItem) { setDrawerOpen(false); handleDelete(selectedItem); } }}
      />
    </div>
  );
}
