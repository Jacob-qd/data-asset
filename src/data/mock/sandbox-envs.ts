export interface SandboxEnv {
  id: string;
  name: string;
  domain: string;
  dataResourceCount: number;
  devEnvStatus: "active" | "inactive";
  prodEnvStatus: "active" | "inactive";
  sceneStatus: "draft" | "submitted" | "enabled" | "disabled";
  syncStatus: "synced" | "unsynced" | "syncing" | "failed";
  createdAt: string;
  updatedAt: string;
  description?: string;
  owner: string;
  resourceConfig: {
    cpu: number;
    memory: number;
    storage: number;
    gpu?: number;
  };
  // 开发资源页面兼容字段
  projectName?: string;
  envConfig?: string;
  envType?: string;
  deployType?: string;
  deployStatus?: string;
  runStatus?: string;
  dataProvider?: string;
  devStatus?: string;
  expireAt?: string;
}

export const mockSandboxEnvs: SandboxEnv[] = [
  {
    id: "ENV-001",
    name: "金融风控联合建模",
    domain: "金融服务",
    dataResourceCount: 3,
    devEnvStatus: "active",
    prodEnvStatus: "active",
    sceneStatus: "enabled",
    syncStatus: "synced",
    createdAt: "2026-03-17 00:00:00",
    updatedAt: "2026-04-28 10:30:00",
    description: "基于隐私计算技术的多源数据联合风控建模分析场景",
    owner: "科技公司甲",
    resourceConfig: { cpu: 8, memory: 32, storage: 500 },
  },
  {
    id: "ENV-002",
    name: "医疗数据分析建模",
    domain: "医疗健康",
    dataResourceCount: 5,
    devEnvStatus: "active",
    prodEnvStatus: "inactive",
    sceneStatus: "submitted",
    syncStatus: "syncing",
    createdAt: "2026-04-01 09:00:00",
    updatedAt: "2026-04-27 16:45:00",
    description: "多机构数据联合建模与智能分析",
    owner: "数据研究院乙",
    resourceConfig: { cpu: 16, memory: 64, storage: 2048, gpu: 2 },
  },
  {
    id: "ENV-003",
    name: "城市数据融合分析",
    domain: "城市治理",
    dataResourceCount: 2,
    devEnvStatus: "active",
    prodEnvStatus: "active",
    sceneStatus: "enabled",
    syncStatus: "synced",
    createdAt: "2026-02-20 14:00:00",
    updatedAt: "2026-04-25 11:20:00",
    description: "城市交通、环境、人口等多维度数据融合治理分析",
    owner: "智能科技丙",
    resourceConfig: { cpu: 4, memory: 16, storage: 300 },
  },
  {
    id: "ENV-004",
    name: "信贷风险评估",
    domain: "金融服务",
    dataResourceCount: 1,
    devEnvStatus: "inactive",
    prodEnvStatus: "inactive",
    sceneStatus: "draft",
    syncStatus: "unsynced",
    createdAt: "2026-04-10 10:00:00",
    updatedAt: "2026-04-10 10:00:00",
    description: "信贷业务数据隐私计算分析场景",
    owner: "金融科技丁",
    resourceConfig: { cpu: 4, memory: 8, storage: 100 },
  },
  {
    id: "ENV-005",
    name: "客户价值预测",
    domain: "金融服务",
    dataResourceCount: 4,
    devEnvStatus: "active",
    prodEnvStatus: "active",
    sceneStatus: "enabled",
    syncStatus: "synced",
    createdAt: "2026-03-05 08:30:00",
    updatedAt: "2026-04-26 09:15:00",
    description: "基于联邦学习的客户行为预测与价值评估模型",
    owner: "科技公司甲",
    resourceConfig: { cpu: 12, memory: 48, storage: 1000, gpu: 1 },
  },
  {
    id: "ENV-006",
    name: "气象信息统计分析",
    domain: "气象服务",
    dataResourceCount: 2,
    devEnvStatus: "active",
    prodEnvStatus: "inactive",
    sceneStatus: "submitted",
    syncStatus: "failed",
    createdAt: "2026-04-15 11:00:00",
    updatedAt: "2026-04-20 14:30:00",
    description: "跨区域气象数据隐私计算联合统计分析",
    owner: "数据研究院乙",
    resourceConfig: { cpu: 6, memory: 24, storage: 400 },
  },
];

export const domainOptions = [
  { label: "全部", value: "" },
  { label: "金融服务", value: "金融服务" },
  { label: "医疗健康", value: "医疗健康" },
  { label: "城市治理", value: "城市治理" },
  { label: "气象服务", value: "气象服务" },
  { label: "现代农业", value: "现代农业" },
];

export const sceneStatusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "gray" },
  submitted: { label: "已提交", color: "blue" },
  enabled: { label: "已启用", color: "green" },
  disabled: { label: "已停用", color: "red" },
};

export const syncStatusMap: Record<string, { label: string; color: string; dot: string }> = {
  synced: { label: "同步成功", color: "green", dot: "bg-green-500" },
  unsynced: { label: "未同步", color: "gray", dot: "bg-gray-400" },
  syncing: { label: "同步中", color: "blue", dot: "bg-blue-500" },
  failed: { label: "同步失败", color: "red", dot: "bg-red-500" },
};
