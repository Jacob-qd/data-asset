import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import {
  Search, Plus, Rocket, Undo2, Download, Combine,
  Eye, Trash2, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  deployStatus: string;
  inferenceService: boolean;
}

const mockModels: Model[] = [
  {
    id: "MODEL-001",
    name: "乳腺癌筛查模型V1",
    type: "纵向逻辑回归",
    createdAt: "2026-04-26 10:33:48",
    deployStatus: "deployed",
    inferenceService: true,
  },
  {
    id: "MODEL-002",
    name: "银行客户筛选模型",
    type: "纵向逻辑回归",
    createdAt: "2026-04-24 16:13:59",
    deployStatus: "deployed",
    inferenceService: true,
  },
  {
    id: "MODEL-003",
    name: "乳腺癌筛查模型V1.1",
    type: "纵向逻辑回归",
    createdAt: "2026-04-26 16:21:34",
    deployStatus: "undeployed",
    inferenceService: false,
  },
  {
    id: "MODEL-004",
    name: "逻辑回归任务-0424",
    type: "纵向逻辑回归",
    createdAt: "2026-04-24 15:23:58",
    deployStatus: "deployed",
    inferenceService: true,
  },
  {
    id: "MODEL-005",
    name: "纵向逻辑回归模型",
    type: "纵向逻辑回归",
    createdAt: "2026-04-24 14:51:30",
    deployStatus: "deployed",
    inferenceService: true,
  },
];

export default function ModelManagement() {
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>(mockModels);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeploy = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, deployStatus: "deployed" } : m
    ));
    toast.success("模型部署成功");
  };

  const handleUndeploy = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, deployStatus: "undeployed" } : m
    ));
    toast.success("模型已撤销部署");
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: Model, index: number) => index + 1 },
    {
      key: "name",
      title: "模型名称",
      render: (row: Model) => (
        <span className="text-indigo-600 cursor-pointer hover:underline">{row.name}</span>
      ),
    },
    {
      key: "type",
      title: "模型类型",
      render: (row: Model) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: "createdAt",
      title: "建模时间",
      render: (row: Model) => <span className="text-gray-500 text-sm">{row.createdAt}</span>,
    },
    {
      key: "deployStatus",
      title: "在线部署状态",
      render: (row: Model) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", row.deployStatus === "deployed" ? "bg-green-500" : "bg-gray-300")} />
          <span className={row.deployStatus === "deployed" ? "text-green-700" : "text-gray-500"}>
            {row.deployStatus === "deployed" ? "部署成功" : "未部署"}
          </span>
          {row.deployStatus === "undeployed" ? (
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => handleDeploy(row.id)}>部署</Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleUndeploy(row.id)}>撤销</Button>
          )}
        </div>
      ),
    },
    {
      key: "inferenceService",
      title: "联合推理服务",
      render: (row: Model) => (
        <div className="flex items-center justify-center">
          {row.inferenceService ? (
            <Rocket className="w-4 h-4 text-green-600" />
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      width: "w-64",
      render: (row: Model) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/privacy/models/evaluation/${row.id}`)}>
            <BarChart3 className="w-4 h-4" />
            评估
          </Button>
          <Button variant="ghost" size="sm">
            <Rocket className="w-4 h-4" />
            去推理
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
            模型下载
          </Button>
          <Button variant="ghost" size="sm">
            <Combine className="w-4 h-4" />
            合并下载
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">模型管理</h1>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索模型名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">查询</Button>
        <Button variant="ghost" size="sm">重置</Button>
      </div>

      <DataTable
        data={filteredModels}
        columns={columns}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
