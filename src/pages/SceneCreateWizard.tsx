import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StepWizard } from "@/components/StepWizard";
import { Check, X, ChevronRight } from "lucide-react";
import {
  mockScenes,
  domainOptions,
  productFormOptions,
  devMethodOptions,
} from "@/data/mock/scenes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SceneCreateWizard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({
    selectedResources: [],
    devMethod: "sandbox",
  });

  // Mock data resources for selection
  const mockResources = [
    { id: "RES-001", name: "乳腺癌诊疗图片-host", type: "库表", provider: "神思电子", level: "重要数据", brand: "山东区块链研究院隐私计..." },
    { id: "RES-002", name: "乳腺癌诊疗标定图片-guest", type: "公共数据资源", provider: "济南大数据集团", level: "一般数据（4级）", brand: "山东区块链研究院隐私计..." },
    { id: "RES-003", name: "济南市热力用户信息", type: "公共数据资源", provider: "济南能源集团", level: "一般数据（3级）", brand: "-" },
    { id: "RES-004", name: "车辆监管及线索数据", type: "公共数据资源", provider: "济南市大数据局", level: "一般数据（1级）", brand: "-" },
    { id: "RES-005", name: "企业基本信息查询接口", type: "公共数据资源", provider: "济南市大数据局", level: "一般数据（1级）", brand: "-" },
  ];

  const handleFinish = (data: Record<string, any>) => {
    const newScene = {
      id: `SCENE-${Date.now().toString(36).toUpperCase()}`,
      ...data,
      status: "pending",
      currentStep: 5,
      createdAt: new Date().toLocaleString("zh-CN"),
      updatedAt: new Date().toLocaleString("zh-CN"),
    } as any;
    mockScenes.unshift(newScene);
    toast.success("应用场景创建成功，已提交审核");
    navigate("/scenes");
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      title: "数据资源信息",
      description: "选择数据资源",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
            如需选择新的数据资源，请先到门户-数据资源将所需资源加入选数车。
            选择单方数据资源可选择数据沙箱或隐私计算的开发方式；选择多方数据资源则建议隐私计算。
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 w-10"></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">资源名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">资源类型</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">数据提供方</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">数据分级</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">隐私计算品牌</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockResources.map((res) => (
                  <tr
                    key={res.id}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50",
                      formData.selectedResources?.includes(res.id) && "bg-indigo-50"
                    )}
                    onClick={() => {
                      const current = formData.selectedResources || [];
                      const updated = current.includes(res.id)
                        ? current.filter((id: string) => id !== res.id)
                        : [...current, res.id];
                      updateField("selectedResources", updated);
                    }}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={formData.selectedResources?.includes(res.id)}
                        onCheckedChange={() => {}}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{res.name}</td>
                    <td className="px-4 py-3">{res.type}</td>
                    <td className="px-4 py-3">{res.provider}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{res.level}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{res.brand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {formData.selectedResources?.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">已选数据项</h4>
              <div className="space-y-2">
                {formData.selectedResources.map((id: string) => {
                  const res = mockResources.find((r) => r.id === id);
                  return res ? (
                    <div key={id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                      <span>{res.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          updateField(
                            "selectedResources",
                            formData.selectedResources.filter((rid: string) => rid !== id)
                          );
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      ),
      validate: () => {
        if (!formData.selectedResources?.length) {
          toast.error("请至少选择一项数据资源");
          return false;
        }
        return true;
      },
    },
    {
      title: "应用场景信息",
      description: "填写场景信息",
      content: (
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label>应用场景名称 <span className="text-red-500">*</span></Label>
            <Input
              value={formData.sceneName || ""}
              onChange={(e) => updateField("sceneName", e.target.value)}
              placeholder="请输入应用场景名称"
              maxLength={20}
            />
            <div className="text-xs text-gray-400 text-right">{(formData.sceneName || "").length}/20</div>
          </div>

          <div className="space-y-2">
            <Label>场景所属领域 <span className="text-red-500">*</span></Label>
            <select
              value={formData.domain || ""}
              onChange={(e) => updateField("domain", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm bg-white"
            >
              <option value="">请选择领域</option>
              {domainOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>应用场景描述 <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.sceneDesc || ""}
              onChange={(e) => updateField("sceneDesc", e.target.value)}
              placeholder="请描述应用场景..."
              maxLength={2000}
              className="min-h-[120px]"
            />
            <div className="text-xs text-gray-400 text-right">{(formData.sceneDesc || "").length}/2000</div>
          </div>

          <div className="space-y-2">
            <Label>场景介绍文档</Label>
            <div className="border rounded-md p-4 border-dashed">
              <div className="text-center text-sm text-gray-500">
                <p>拖拽文件到此处，或 <span className="text-indigo-600 cursor-pointer">点击上传</span></p>
                <p className="text-xs mt-1">支持 pdf/doc/docx 格式，单个文件最大5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>场景有效期 <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={formData.validFrom || ""}
                onChange={(e) => updateField("validFrom", e.target.value)}
              />
              <span>至</span>
              <Input
                type="date"
                value={formData.validTo || ""}
                onChange={(e) => updateField("validTo", e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
      validate: () => {
        if (!formData.sceneName) {
          toast.error("请输入应用场景名称");
          return false;
        }
        if (!formData.domain) {
          toast.error("请选择场景所属领域");
          return false;
        }
        if (!formData.sceneDesc) {
          toast.error("请输入应用场景描述");
          return false;
        }
        if (!formData.validFrom || !formData.validTo) {
          toast.error("请选择场景有效期");
          return false;
        }
        return true;
      },
    },
    {
      title: "数据产品信息",
      description: "填写产品信息",
      content: (
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label>数据产品名称 <span className="text-red-500">*</span></Label>
            <Input
              value={formData.productName || ""}
              onChange={(e) => updateField("productName", e.target.value)}
              placeholder="请输入数据产品名称"
              maxLength={20}
            />
            <div className="text-xs text-gray-400 text-right">{(formData.productName || "").length}/20</div>
          </div>

          <div className="space-y-2">
            <Label>数据产品形态 <span className="text-red-500">*</span></Label>
            <select
              value={formData.productForm || ""}
              onChange={(e) => updateField("productForm", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm bg-white"
            >
              <option value="">请选择产品形态</option>
              {productFormOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>数据产品描述 <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.productDesc || ""}
              onChange={(e) => updateField("productDesc", e.target.value)}
              placeholder="请描述数据产品..."
              maxLength={500}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-400 text-right">{(formData.productDesc || "").length}/500</div>
          </div>

          <div className="space-y-2">
            <Label>开发方式 <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              {devMethodOptions.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={formData.devMethod === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField("devMethod", opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>数据抽样需求 <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.samplingReq || ""}
              onChange={(e) => updateField("samplingReq", e.target.value)}
              placeholder="请简单描述数据抽样需求，如随机抽样1000条、分层抽样等"
              maxLength={500}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-400 text-right">{(formData.samplingReq || "").length}/500</div>
          </div>

          <div className="space-y-2">
            <Label>数据脱敏规则 <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.maskingRules || ""}
              onChange={(e) => updateField("maskingRules", e.target.value)}
              placeholder="请简单描述数据脱敏规则"
              maxLength={500}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-400 text-right">{(formData.maskingRules || "").length}/500</div>
          </div>
        </div>
      ),
      validate: () => {
        if (!formData.productName) {
          toast.error("请输入数据产品名称");
          return false;
        }
        if (!formData.productForm) {
          toast.error("请选择数据产品形态");
          return false;
        }
        if (!formData.productDesc) {
          toast.error("请输入数据产品描述");
          return false;
        }
        if (!formData.samplingReq) {
          toast.error("请输入数据抽样需求");
          return false;
        }
        if (!formData.maskingRules) {
          toast.error("请输入数据脱敏规则");
          return false;
        }
        return true;
      },
    },
    {
      title: "开发机构信息",
      description: "填写机构资质",
      content: (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h4 className="text-sm font-semibold mb-3">机构资质</h4>
            <div className="space-y-3">
              {[
                { key: "softwareCert", label: "软件企业证书" },
                { key: "highTechCert", label: "高新技术企业证书" },
                { key: "dataMgmtCert", label: "数据管理能力成熟度等级证书" },
                { key: "devCase", label: "数据产品开发案例" },
                { key: "creditReport", label: "企业信用报告", required: true },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.label}</span>
                    {item.required && <span className="text-red-500">*</span>}
                  </div>
                  <Button variant="outline" size="sm">上传文件</Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">安全管理</h4>
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-sm">相关管理制度</span>
              <Button variant="outline" size="sm">上传文件</Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">成员信息</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between border rounded-md p-3">
                <span className="text-sm">场景参与人员清单</span>
                <Button variant="outline" size="sm">上传文件</Button>
              </div>
              <div className="flex items-center justify-between border rounded-md p-3">
                <span className="text-sm">场景参与人员证书</span>
                <Button variant="outline" size="sm">上传文件</Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">承诺声明 <span className="text-red-500">*</span></h4>
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-sm">承诺声明文件</span>
              <Button variant="outline" size="sm">上传文件</Button>
            </div>
          </div>
        </div>
      ),
      validate: () => {
        return true;
      },
    },
    {
      title: "完成",
      description: "确认提交",
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">信息填写完成</h3>
            <p className="text-gray-500 mt-2">请确认以下信息无误后提交审核</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">应用场景名称：</span>
                <span className="ml-2 font-medium">{formData.sceneName}</span>
              </div>
              <div>
                <span className="text-gray-500">所属领域：</span>
                <span className="ml-2 font-medium">{formData.domain}</span>
              </div>
              <div>
                <span className="text-gray-500">数据产品名称：</span>
                <span className="ml-2 font-medium">{formData.productName}</span>
              </div>
              <div>
                <span className="text-gray-500">开发方式：</span>
                <span className="ml-2 font-medium">
                  {devMethodOptions.find((o) => o.value === formData.devMethod)?.label}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">数据抽样需求：</span>
                <span className="ml-2">{formData.samplingReq}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">数据脱敏规则：</span>
                <span className="ml-2">{formData.maskingRules}</span>
              </div>
            </div>
          </div>
        </div>
      ),
      validate: () => true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/scenes")}>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <h1 className="text-2xl font-bold">创建应用场景</h1>
        </div>
      </div>

      <StepWizard
        steps={steps}
        onFinish={handleFinish}
        onSave={(step, data) => {
          toast.success(`第${step + 1}步已保存`);
        }}
        initialData={formData}
      />
    </div>
  );
}
