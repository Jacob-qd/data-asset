export interface Scene {
  id: string;
  name: string;
  domain: string;
  description: string;
  docUrl?: string;
  validFrom: string;
  validTo: string;
  productName: string;
  productForm: string;
  productDesc: string;
  devMethod: string;
  samplingReq: string;
  maskingRules: string;
  status: string;
  currentStep: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const mockScenes: Scene[] = [
  {
    id: "SCENE-001",
    name: "医疗影像筛查模型",
    domain: "医疗健康",
    description: "基于多方医疗数据的医疗影像早期筛查模型",
    validFrom: "2026-04-01",
    validTo: "2026-12-31",
    productName: "医疗影像筛查API",
    productForm: "api",
    productDesc: "提供医疗影像风险评分API接口",
    devMethod: "privacy",
    samplingReq: "随机抽样5000条，分层抽样确保正负样本比例1:3",
    maskingRules: "患者姓名掩码，身份证号泛化，手机号扰动",
    status: "active",
    currentStep: 5,
    createdBy: "中电云计算技术有限公司",
    createdAt: "2026-03-17 15:16:18",
    updatedAt: "2026-04-28 10:30:00",
  },
  {
    id: "SCENE-002",
    name: "社保信用卡联合查询",
    domain: "金融服务",
    description: "社保数据与信用卡数据的联合查询场景",
    validFrom: "2026-03-01",
    validTo: "2026-09-30",
    productName: "社保信用卡联合查询产品",
    productForm: "service",
    productDesc: "联合查询社保缴纳和信用卡还款情况",
    devMethod: "privacy",
    samplingReq: "系统抽样10000条，覆盖所有年龄段",
    maskingRules: "身份证号掩码，银行卡号泛化",
    status: "active",
    currentStep: 5,
    createdBy: "中电云计算技术有限公司",
    createdAt: "2026-03-14 14:40:22",
    updatedAt: "2026-04-20 09:00:00",
  },
  {
    id: "SCENE-003",
    name: "气象数据服务场景",
    domain: "气象服务",
    description: "气象数据产品开发场景",
    validFrom: "2026-04-27",
    validTo: "2026-05-10",
    productName: "气象数据服务产品",
    productForm: "dataset",
    productDesc: "历史气象数据集合",
    devMethod: "sandbox",
    samplingReq: "随机抽样1000条，按月分层",
    maskingRules: "地理位置泛化到区县级别",
    status: "pending",
    currentStep: 3,
    createdBy: "数据科技有限公司A有限公司",
    createdAt: "2026-04-27 11:45:00",
    updatedAt: "2026-04-27 11:52:00",
  },
  {
    id: "SCENE-004",
    name: "城市治理分析",
    domain: "城市治理",
    description: "城市治理数据分析场景",
    validFrom: "2026-04-01",
    validTo: "2026-10-31",
    productName: "城市治理分析报告",
    productForm: "report",
    productDesc: "城市治理多维度分析报告",
    devMethod: "sandbox",
    samplingReq: "分层抽样20000条",
    maskingRules: "个人住址泛化，手机号掩码",
    status: "approved",
    currentStep: 4,
    createdBy: "数据科技有限公司A有限公司",
    createdAt: "2026-04-22 09:00:00",
    updatedAt: "2026-04-25 14:30:00",
  },
  {
    id: "SCENE-005",
    name: "公积金缴存分析",
    domain: "金融服务",
    description: "公积金缴存数据分析",
    validFrom: "2026-05-01",
    validTo: "2026-11-30",
    productName: "公积金缴存分析API",
    productForm: "api",
    productDesc: "公积金缴存情况查询API",
    devMethod: "secret",
    samplingReq: "随机抽样8000条",
    maskingRules: "身份证号掩码，单位名称泛化",
    status: "draft",
    currentStep: 2,
    createdBy: "轨道交通数据公司",
    createdAt: "2026-04-28 08:00:00",
    updatedAt: "2026-04-28 08:00:00",
  },
];

export const domainOptions = [
  { label: "气象服务", value: "气象服务" },
  { label: "城市治理", value: "城市治理" },
  { label: "医疗健康", value: "医疗健康" },
  { label: "工业制造", value: "工业制造" },
  { label: "金融服务", value: "金融服务" },
  { label: "交通运输", value: "交通运输" },
  { label: "教育", value: "教育" },
];

export const productFormOptions = [
  { label: "数据接口", value: "api" },
  { label: "数据报告", value: "report" },
  { label: "数据集", value: "dataset" },
  { label: "API服务", value: "service" },
];

export const devMethodOptions = [
  { label: "数据沙箱", value: "sandbox" },
  { label: "隐私计算", value: "privacy" },
  { label: "密态计算", value: "secret" },
  { label: "离线下载", value: "offline" },
];

export const statusOptions = [
  { label: "草稿", value: "draft" },
  { label: "待审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" },
  { label: "已启用", value: "active" },
  { label: "已过期", value: "expired" },
];
