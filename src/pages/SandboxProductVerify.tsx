import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";
import {
  CheckCircle, XCircle, RefreshCw, Eye, FileText,
  ShieldCheck, Clock, User, Calendar, Tag, Server, ClipboardList,
  AlertTriangle, Info
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
  submitter?: string;
  version?: string;
  description?: string;
  dataSources?: string[];
  algorithms?: string[];
}

interface VerifyStandard {
  id: string;
  name: string;
  category: string;
  description: string;
  required: boolean;
  checked: boolean;
  passed: boolean;
}

interface VerifyRecord {
  time: string;
  operator: string;
  action: string;
  result: string;
  comment: string;
}

const mockProducts: SandboxProduct[] = [
  {
    id: "VERIFY-001",
    name: "医疗影像筛查模型",
    sceneName: "医疗影像筛查场景",
    envType: "隐私计算",
    submitTime: "2026-04-28 10:00:00",
    status: "pending",
    submitter: "张三",
    version: "v2.1.0",
    description: "基于联邦学习的医疗影像筛查模型，支持肺部CT影像的自动筛查和分类",
    dataSources: ["医疗影像数据", "患者基本信息", "诊断记录"],
    algorithms: ["纵向逻辑回归", "隐私求交"],
  },
  {
    id: "VERIFY-002",
    name: "城市治理分析报告",
    sceneName: "城市治理分析",
    envType: "数据沙箱",
    submitTime: "2026-04-27 16:30:00",
    status: "verified",
    verifyResult: "passed",
    submitter: "李四",
    version: "v1.5.2",
    description: "城市交通拥堵分析、公共服务资源配置优化等综合报告",
    dataSources: ["交通流量数据", "人口分布数据", "公共服务设施"],
    algorithms: ["聚类分析", "时间序列预测"],
  },
  {
    id: "VERIFY-003",
    name: "公积金缴存分析API",
    sceneName: "公积金缴存分析",
    envType: "密态计算",
    submitTime: "2026-04-26 09:15:00",
    status: "failed",
    verifyResult: "rejected",
    submitter: "王五",
    version: "v1.0.0",
    description: "公积金缴存趋势分析、异常检测与风险预警",
    dataSources: ["公积金缴存记录", "工资流水数据"],
    algorithms: ["同态加密统计", "异常检测"],
  },
  {
    id: "VERIFY-004",
    name: "气象数据服务产品",
    sceneName: "气象数据服务场景",
    envType: "数据沙箱",
    submitTime: "2026-04-25 14:20:00",
    status: "pending",
    submitter: "赵六",
    version: "v3.0.1",
    description: "气象数据查询与分析服务，支持历史数据回溯和趋势预测",
    dataSources: ["气象观测数据", "卫星遥感数据"],
    algorithms: ["回归分析", "模式识别"],
  },
];

const mockStandards: VerifyStandard[] = [
  { id: "S1", name: "数据脱敏检查", category: "安全性", description: "敏感字段是否已脱敏处理", required: true, checked: true, passed: true },
  { id: "S2", name: "模型准确率验证", category: "准确性", description: "模型在测试集上的准确率是否达标", required: true, checked: true, passed: true },
  { id: "S3", name: "代码规范检查", category: "规范性", description: "代码是否符合团队编码规范", required: true, checked: true, passed: false },
  { id: "S4", name: "依赖安全检查", category: "安全性", description: "第三方依赖是否存在已知漏洞", required: true, checked: true, passed: true },
  { id: "S5", name: "性能基准测试", category: "性能", description: "响应时间和吞吐量是否满足要求", required: false, checked: true, passed: true },
  { id: "S6", name: "文档完整性", category: "规范性", description: "API文档和使用说明是否完整", required: true, checked: true, passed: true },
];

const mockVerifyRecords: VerifyRecord[] = [
  { time: "2026-04-28 10:05:00", operator: "审核员A", action: "提交验证", result: "待审核", comment: "产品已提交，等待审核" },
  { time: "2026-04-28 14:30:00", operator: "审核员B", action: "自动检查", result: "进行中", comment: "正在执行自动化验证流程" },
];

export default function SandboxProductVerify() {
  const [products, setProducts] = useState<SandboxProduct[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SandboxProduct | null>(null);

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

  const handleOpenDetail = (product: SandboxProduct) => {
    setSelectedProduct(product);
    setDetailOpen(true);
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
        <ActionButtons
          buttons={[
            { key: "detail", icon: <Eye className="w-4 h-4" />, label: "详情", onClick: () => handleOpenDetail(row) },
            ...(row.status === "pending" ? [
              { key: "verify", icon: <CheckCircle className="w-4 h-4" />, label: "通过", className: "text-green-600", onClick: () => handleVerify(row.id) },
              { key: "reject", icon: <XCircle className="w-4 h-4" />, label: "驳回", className: "text-red-600", onClick: () => handleReject(row.id) },
            ] : []),
            ...(row.status === "failed" ? [
              { key: "reverify", icon: <RefreshCw className="w-4 h-4" />, label: "重新验证", onClick: () => handleReverify(row.id) },
            ] : []),
            ...(row.status === "verified" ? [
              { key: "published", icon: <ShieldCheck className="w-4 h-4" />, label: "已发布", className: "text-green-600", onClick: () => {} },
            ] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="沙箱产品验证" />

      <PageSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="搜索产品名称或场景..."
        onReset={() => setSearchTerm("")}
      />

      <DataTable
        data={filteredProducts}
        columns={columns}
        rowKey={(row) => row.id}
      />

      {/* 详情对话框 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              产品验证详情
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} - {selectedProduct?.sceneName}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 py-4">
              {/* 产品基本信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4" />产品基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">产品名称</Label>
                      <div className="text-sm font-medium">{selectedProduct.name}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">所属场景</Label>
                      <div className="text-sm text-indigo-600">{selectedProduct.sceneName}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">开发环境</Label>
                      <div><Badge variant="outline">{selectedProduct.envType}</Badge></div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">版本号</Label>
                      <div className="text-sm font-mono">{selectedProduct.version}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">提交人</Label>
                      <div className="text-sm flex items-center gap-1">
                        <User className="w-3 h-3" />{selectedProduct.submitter}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">提交时间</Label>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{selectedProduct.submitTime}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <Label className="text-xs text-gray-500">产品描述</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded">{selectedProduct.description}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">数据源</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.dataSources?.map(ds => (
                          <Badge key={ds} variant="outline" className="bg-blue-50">
                            <Server className="w-3 h-3 mr-1" />{ds}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">使用算法</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.algorithms?.map(alg => (
                          <Badge key={alg} variant="outline" className="bg-purple-50">
                            <Tag className="w-3 h-3 mr-1" />{alg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 验证标准 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />验证标准
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockStandards.map(std => (
                      <div key={std.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="mt-0.5">
                          {std.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{std.name}</span>
                            {std.required && <Badge variant="outline" className="text-xs">必填</Badge>}
                            <Badge variant="outline" className="text-xs">{std.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{std.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 验证结果 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />验证结果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg flex-1">
                      <div className="text-3xl font-bold text-green-600">4/6</div>
                      <div className="text-xs text-gray-500 mt-1">通过项数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg flex-1">
                      <div className="text-3xl font-bold text-red-600">2/6</div>
                      <div className="text-xs text-gray-500 mt-1">未通过项数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg flex-1">
                      <div className="text-3xl font-bold text-blue-600">66.7%</div>
                      <div className="text-xs text-gray-500 mt-1">通过率</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {mockStandards.filter(s => !s.passed).map(std => (
                      <div key={std.id} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-700">{std.name}</div>
                          <p className="text-sm text-red-600">{std.description} - 未通过验证</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 审核记录 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />审核记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockVerifyRecords.map((record, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{record.action}</span>
                            <span className="text-xs text-gray-500">{record.time}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            操作人: {record.operator} | 结果: {record.result}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{record.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 审核意见 */}
              {selectedProduct.status === "verified" && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />审核意见
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">审核通过</Badge>
                        <span className="text-sm text-gray-500">审核员: 审核员B | 2026-04-28 16:00:00</span>
                      </div>
                      <div className="text-sm bg-white p-3 rounded border">
                        产品符合所有必填验证标准，代码规范检查中的 minor issues 已在 v2.1.1 中修复。建议发布到生产环境。
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedProduct.status === "failed" && (
                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />审核意见
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">审核未通过</Badge>
                        <span className="text-sm text-gray-500">审核员: 审核员C | 2026-04-26 11:30:00</span>
                      </div>
                      <div className="text-sm bg-white p-3 rounded border">
                        代码规范检查未通过，存在以下问题：1. 缺少异常处理；2. 敏感数据日志打印未脱敏；3. 单元测试覆盖率不足60%。请修复后重新提交。
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
