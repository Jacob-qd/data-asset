export interface PrivacyTask {
  id: string;
  name: string;
  projectName: string;
  taskType: string;
  businessTag?: string;
  algorithmType?: string;
  participantStatus: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

export const mockPrivacyTasks: PrivacyTask[] = [
  {
    id: "TASK-PSI-001",
    name: "乳腺癌诊疗数据求交",
    projectName: "乳腺癌筛查模型",
    taskType: "psi",
    participantStatus: "正常",
    status: "success",
    createdBy: "济南大数据集团",
    createdAt: "2026-04-24 10:00:00",
  },
  {
    id: "TASK-PIR-001",
    name: "社保信息隐匿查询",
    projectName: "社保信用卡联合查询",
    taskType: "pir",
    participantStatus: "正常",
    status: "success",
    createdBy: "中电云计算",
    createdAt: "2026-04-23 14:30:00",
  },
  {
    id: "TASK-STATS-001",
    name: "城市治理数据统计",
    projectName: "城市治理分析",
    taskType: "stats",
    participantStatus: "正常",
    status: "running",
    createdBy: "济南大数据集团",
    createdAt: "2026-04-28 09:00:00",
  },
  {
    id: "TASK-SQL-001",
    name: "联合SQL查询-公积金",
    projectName: "公积金缴存分析",
    taskType: "sql",
    participantStatus: "异常",
    status: "failed",
    createdBy: "山东轨道集团",
    createdAt: "2026-04-25 11:00:00",
  },
  {
    id: "TASK-FL-001",
    name: "乳腺癌筛查模型V1",
    projectName: "乳腺癌筛查模型",
    taskType: "modeling",
    businessTag: "医疗",
    algorithmType: "纵向逻辑回归",
    participantStatus: "正常",
    status: "success",
    createdBy: "济南大数据集团",
    createdAt: "2026-04-20 16:00:00",
  },
  {
    id: "TASK-FL-002",
    name: "银行客户筛选模型",
    projectName: "银行优质客户筛选",
    taskType: "modeling",
    businessTag: "金融",
    algorithmType: "纵向逻辑回归",
    participantStatus: "正常",
    status: "running",
    createdBy: "中电云计算",
    createdAt: "2026-04-26 10:30:00",
  },
];

export const taskTypeLabels: Record<string, string> = {
  psi: "隐私求交",
  pir: "隐匿查询",
  stats: "联合统计",
  sql: "联合SQL",
  modeling: "联合建模",
};

export const taskTypePaths: Record<string, string> = {
  psi: "/privacy/tasks/psi",
  pir: "/privacy/tasks/pir",
  stats: "/privacy/tasks/stats",
  sql: "/privacy/tasks/sql",
  modeling: "/privacy/tasks/modeling",
};
