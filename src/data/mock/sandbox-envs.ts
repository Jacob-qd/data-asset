export interface SandboxEnv {
  id: string;
  name: string;
  projectName: string;
  spaceName: string;
  dataProvider: string;
  envType: string;
  runStatus: string;
  envConfig: string;
  deployType?: string;
  deployStatus?: string;
  devStatus?: string;
  createdAt: string;
}

export const mockSandboxEnvs: SandboxEnv[] = [
  {
    id: "ENV-001",
    name: "机器学习沙箱开发场景-生产空间",
    projectName: "机器学习沙箱开发场景",
    spaceName: "机器学习沙箱开发场景-生产空间",
    dataProvider: "济南大数据集团有限公司",
    envType: "生产环境",
    runStatus: "运行中",
    envConfig: "2C | 2GB | 2GB",
    deployType: "可视化类型",
    deployStatus: "运行中",
    devStatus: "开发中",
    createdAt: "2026-04-22 16:41:12",
  },
  {
    id: "ENV-002",
    name: "机器学习场景演示-开发空间",
    projectName: "机器学习场景演示",
    spaceName: "机器学习场景演示-开发空间",
    dataProvider: "济南大数据集团有限公司",
    envType: "开发环境",
    runStatus: "运行中",
    envConfig: "2C | 2GB | 2GB",
    deployType: "可视化类型",
    deployStatus: "运行中",
    devStatus: "开发中",
    createdAt: "2026-04-22 16:37:12",
  },
  {
    id: "ENV-003",
    name: "SQL沙箱开发424-开发空间",
    projectName: "SQL沙箱开发424",
    spaceName: "SQL沙箱开发424-开发空间",
    dataProvider: "济南大数据集团有限公司",
    envType: "开发环境",
    runStatus: "运行中",
    envConfig: "2C | 2GB | 2GB",
    deployType: "SQL类型",
    deployStatus: "运行中",
    devStatus: "开发完成",
    createdAt: "2026-04-24 21:02:51",
  },
  {
    id: "ENV-004",
    name: "所得税核查-开发空间",
    projectName: "所得税核查",
    spaceName: "所得税核查-开发空间",
    dataProvider: "济南大数据集团有限公司",
    envType: "开发环境",
    runStatus: "运行中",
    envConfig: "2C | 2GB | 2GB",
    deployType: "SQL类型",
    deployStatus: "运行中",
    devStatus: "开发中",
    createdAt: "2026-04-21 15:30:42",
  },
  {
    id: "ENV-005",
    name: "jar场景新增-生产空间",
    projectName: "jar场景新增",
    spaceName: "jar场景新增-生产空间",
    dataProvider: "济南大数据集团有限公司",
    envType: "生产环境",
    runStatus: "运行中",
    envConfig: "2C | 2GB | 2GB",
    deployType: "Jar包类型",
    deployStatus: "运行中",
    devStatus: "开发完成",
    createdAt: "2026-04-21 15:30:42",
  },
];

export const devResourceStatuses = [
  { label: "运行中", value: "running", color: "green" },
  { label: "待续", value: "pending", color: "yellow" },
  { label: "已关闭", value: "closed", color: "gray" },
];
