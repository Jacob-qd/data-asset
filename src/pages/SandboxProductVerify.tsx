import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import {
  Search, CheckCircle, XCircle, RefreshCw, Eye,
  ShieldCheck, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SandboxProduct {
  id: string;
  name: string;
  sceneName: string;
  envType: string;
  submitTime: string;
  status: string;
  verifyResult?: string;
}

const mockProducts: SandboxProduct[] = [
  {
    id: "VERIFY-001",
    name: "医疗影像筛查模型",
    sceneName: "医疗影像筛查场景",
    envType: "隐私计算",
    submitTime: "2026-04-28 10:00:00",
    status: "pending",
  },
  {
    id: "VERIFY-002",
    name: "城市治理分析报告",
    sceneName: "城市治理分析",
    envType: "数据沙箱",
    submitTime: "2026-04-27 16:30:00",
    status: "verified",
    verifyResult: "passed",
  },
  {
    id: "VERIFY-003",
    name: "公积金缴存分析API",
    sceneName: "公积金缴存分析",
    envType: "密态计算",
    submitTime: "2026-04-26 09:15:00",
    status: "failed",
    verifyResult: "rejected",
  },
  {
    id: "VERIFY-004",
    name: "气象数据服务产品",
    sceneName: "气象数据服务场景",
    envType: "数据沙箱",
    submitTime: "2026-04-25 14:20:00",
    status: "pending",
  },
];

export default function SandboxProductVerify() {
  const [products, setProducts] = useState<SandboxProduct[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sceneName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = (id: string) => {
    setProducts(products.map((p) =>
      p.id === id ? { ...p, status: "verified", verifyResult: "passed" } : p
    ));
    toast.success("产品验证通过");
  };

  const handleReject = (id: string) => {
    setProducts(products.map((p) =>
      p.id === id ? { ...p, status: "failed", verifyResult: "rejected" } : p
    ));
    toast.error("产品验证未通过");
  };

  const handleReverify = (id: string) => {
    setProducts(products.map((p) =>
      p.id === id ? { ...p, status: "pending", verifyResult: undefined } : p
    ));
    toast.info("已重新提交验证");
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: {
      label: "待验证",
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      icon: <Clock className="w-4 h-4" />,
    },
    verified: {
      label: "验证通过",
      color: "text-green-700",
      bg: "bg-green-50",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    failed: {
      label: "验证失败",
      color: "text-red-700",
      bg: "bg-red-50",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const columns = [
    { key: "index", title: "序号", width: "w-16", render: (_row: SandboxProduct, index: number) => index + 1 },
    {
      key: "name",
      title: "产品名称",
      render: (row: SandboxProduct) => <span className="text-indigo-600">{row.name}</span>,
    },
    {
      key: "sceneName",
      title: "所属场景",
    },
    {
      key: "envType",
      title: "开发环境",
      render: (row: SandboxProduct) => <Badge variant="outline">{row.envType}</Badge>,
    },
    {
      key: "submitTime",
      title: "提交时间",
      render: (row: SandboxProduct) => <span className="text-gray-500 text-sm">{row.submitTime}</span>,
    },
    {
      key: "status",
      title: "验证状态",
      render: (row: SandboxProduct) => {
        const config = statusConfig[row.status];
        return config ? (
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs w-fit", config.bg)}>
            <span className={config.color}>{config.icon}</span>
            <span className={config.color}>{config.label}</span>
          </div>
        ) : row.status;
      },
    },
    {
      key: "actions",
      title: "操作",
      width: "w-64",
      render: (row: SandboxProduct) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />详情
          </Button>
          {row.status === "pending" && (
            <>
              <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleVerify(row.id)}>
                <CheckCircle className="w-4 h-4" />通过
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleReject(row.id)}>
                <XCircle className="w-4 h-4" />驳回
              </Button>
            </>
          )}
          {row.status === "failed" && (
            <Button variant="ghost" size="sm" onClick={() => handleReverify(row.id)}>
              <RefreshCw className="w-4 h-4" />重新验证
            </Button>
          )}
          {row.status === "verified" && (
            <Button variant="ghost" size="sm" className="text-green-600">
              <ShieldCheck className="w-4 h-4" />已发布
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">沙箱产品验证</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索产品名称或场景..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">查询</Button>
        <Button variant="ghost" size="sm">重置</Button>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
