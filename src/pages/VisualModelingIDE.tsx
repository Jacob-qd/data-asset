import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Save, Play, Download, Upload, Trash2, Undo, Redo,
  Database, Wand2, BrainCircuit, BarChart3, GitMerge,
  ChevronRight, Plus, Minus, MousePointer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FlowNode {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  icon: React.ReactNode;
  config: Record<string, any>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

const componentLibrary = {
  "数据输入": [
    { type: "reader", name: "数据读取", icon: <Database className="w-4 h-4" /> },
  ],
  "数据预处理": [
    { type: "transform", name: "数据转换", icon: <Wand2 className="w-4 h-4" /> },
    { type: "intersection", name: "数据求交", icon: <GitMerge className="w-4 h-4" /> },
  ],
  "模型训练": [
    { type: "hetero_lr", name: "纵向逻辑回归", icon: <BrainCircuit className="w-4 h-4" /> },
    { type: "hetero_linr", name: "纵向线性回归", icon: <BrainCircuit className="w-4 h-4" /> },
    { type: "hetero_dt", name: "纵向决策树", icon: <BrainCircuit className="w-4 h-4" /> },
  ],
  "模型评估": [
    { type: "evaluation", name: "模型评估", icon: <BarChart3 className="w-4 h-4" /> },
  ],
};

const templates = [
  { name: "两方纵向逻辑回归", desc: "两方纵向联邦学习逻辑回归模型" },
  { name: "纵向线性回归", desc: "两方纵向联邦学习线性回归模型" },
  { name: "纵向决策树", desc: "两方纵向联邦学习决策树模型" },
  { name: "特征工程-缺失值填充", desc: "数据预处理+特征工程模板" },
  { name: "横向SecureBoost", desc: "横向联邦学习SecureBoost决策树" },
  { name: "安全联邦迁移学习", desc: "安全联邦迁移学习模板" },
];

const defaultNodes: FlowNode[] = [
  { id: "node-1", type: "reader", name: "数据读取", x: 300, y: 100, icon: <Database className="w-4 h-4" />, config: { role: "发起者", platform: "数据科技有限公司A" } },
  { id: "node-2", type: "transform", name: "数据转换", x: 300, y: 220, icon: <Wand2 className="w-4 h-4" />, config: {} },
  { id: "node-3", type: "intersection", name: "数据求交", x: 300, y: 340, icon: <GitMerge className="w-4 h-4" />, config: {} },
  { id: "node-4", type: "hetero_lr", name: "纵向逻辑回归", x: 300, y: 460, icon: <BrainCircuit className="w-4 h-4" />, config: { epochs: 100, lr: 0.01 } },
  { id: "node-5", type: "evaluation", name: "模型评估", x: 300, y: 580, icon: <BarChart3 className="w-4 h-4" />, config: {} },
];

const defaultEdges: FlowEdge[] = [
  { id: "edge-1", source: "node-1", target: "node-2" },
  { id: "edge-2", source: "node-2", target: "node-3" },
  { id: "edge-3", source: "node-3", target: "node-4" },
  { id: "edge-4", source: "node-4", target: "node-5" },
];

export default function VisualModelingIDE() {
  const [nodes, setNodes] = useState<FlowNode[]>(defaultNodes);
  const [edges] = useState<FlowEdge[]>(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("component");
    if (!data) return;

    const component = JSON.parse(data);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: component.type,
      name: component.name,
      x: (e.clientX - rect.left) / zoom - 60,
      y: (e.clientY - rect.top) / zoom - 20,
      icon: component.icon,
      config: {},
    };

    setNodes([...nodes, newNode]);
    toast.success(`添加组件: ${component.name}`);
  };

  const handleNodeMouseDown = (nodeId: string) => {
    setDraggingNode(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - 60;
    const y = (e.clientY - rect.top) / zoom - 20;

    setNodes(nodes.map((n) =>
      n.id === draggingNode ? { ...n, x, y } : n
    ));
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x + 60, y: node.y + 20 } : { x: 0, y: 0 };
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-2">
      {/* Left Panel - Components */}
      <div className="w-60 bg-white border rounded-lg flex flex-col">
        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="components" className="flex-1">组件</TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">模板</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="flex-1 overflow-y-auto p-2">
            {Object.entries(componentLibrary).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2 px-2">{category}</h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-move hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                    >
                      <div className="text-indigo-600">{item.icon}</div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="templates" className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.name}
                  className="p-3 border rounded-md cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  onClick={() => toast.info(`加载模板: ${tmpl.name}`)}
                >
                  <div className="text-sm font-medium">{tmpl.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{tmpl.desc}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 bg-white border rounded-lg flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("流程已保存")}>
              <Save className="w-4 h-4 mr-1" />保存
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("开始执行")}>
              <Play className="w-4 h-4 mr-1" />执行
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
          style={{
            backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {/* Edges */}
            <svg className="absolute inset-0 pointer-events-none">
              {edges.map((edge) => {
                const source = getNodePosition(edge.source);
                const target = getNodePosition(edge.target);
                return (
                  <line
                    key={edge.id}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#6366f1"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={cn(
                  "absolute flex items-center gap-2 px-4 py-2 bg-white border-2 rounded-lg cursor-move shadow-sm select-none",
                  selectedNode?.id === node.id ? "border-indigo-500 shadow-md" : "border-gray-200",
                  "hover:border-indigo-300"
                )}
                style={{ left: node.x, top: node.y }}
                onMouseDown={() => handleNodeMouseDown(node.id)}
              >
                <div className="text-indigo-600">{node.icon}</div>
                <span className="text-sm font-medium">{node.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-2 opacity-0 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Config */}
      <div className="w-72 bg-white border rounded-lg p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-4">配置面板</h3>

        {selectedNode ? (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-700">
                {selectedNode.icon}
                <span className="font-medium">{selectedNode.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>参与角色</Label>
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option>发起者</option>
                <option>guest</option>
                <option>arbiter</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>平台</Label>
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option>数据科技有限公司A有限公司</option>
                <option>中电云计算技术有限公司</option>
                <option>智能科技公司技术股份有限公司</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>数据表</Label>
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option>医疗影像诊疗标定图片</option>
                <option>车辆监管数据</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>资源名称</Label>
              <Input placeholder="请选择资源名称" />
            </div>

            <div className="space-y-2">
              <Label>资源ID</Label>
              <Input placeholder="请输入资源ID" />
            </div>

            <div className="space-y-2">
              <Label>平台ID</Label>
              <Input placeholder="请输入平台ID" />
            </div>

            {selectedNode.type === "hetero_lr" && (
              <>
                <div className="space-y-2">
                  <Label>训练轮数</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label>学习率</Label>
                  <Input type="number" step="0.001" defaultValue="0.01" />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <MousePointer className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">请选择一个组件进行配置</p>
          </div>
        )}
      </div>
    </div>
  );
}
