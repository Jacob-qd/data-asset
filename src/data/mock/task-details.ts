export interface TaskExecutionLog {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  message: string;
}

export interface TaskParticipant {
  id: string;
  name: string;
  role: "发起方" | "参与方" | "协调方" | "被查询方";
  status: "online" | "offline" | "busy";
  dataSize?: string;
  dataCount?: number;
}

export interface TaskResult {
  id: string;
  taskId: string;
  resultType: string;
  content: string;
  rowCount?: number;
  fileSize?: string;
  createdAt: string;
}

export interface PSIResult {
  intersectionCount: number;
  totalCountA: number;
  totalCountB: number;
  overlapRate: number;
  executionTime: string;
}

export interface PIRResult {
  queryCount: number;
  responseCount: number;
  responseTime: string;
  hitRate: number;
}

export interface StatsResult {
  statType: string;
  dimensions: string;
  resultValue: string;
  sampleSize: number;
  confidenceInterval?: string;
}

export interface DataSource {
  id: string;
  name: string;
  owner: string;
  schema: string[];
  rowCount: number;
  description: string;
}

export const mockDataSources: DataSource[] = [
  { id: "DS-001", name: "客户基础信息表", owner: "科技公司甲", schema: ["user_id", "name", "age", "gender", "phone"], rowCount: 500000, description: "包含客户基础属性信息" },
  { id: "DS-002", name: "交易流水表", owner: "金融科技丁", schema: ["user_id", "amount", "merchant_id", "timestamp", "type"], rowCount: 2000000, description: "金融交易流水记录" },
  { id: "DS-003", name: "用户行为日志", owner: "智能科技丙", schema: ["user_id", "event_type", "page_id", "duration", "device_id"], rowCount: 10000000, description: "App用户行为埋点数据" },
  { id: "DS-004", name: "医疗就诊记录", owner: "数据研究院乙", schema: ["patient_id", "diagnosis", "treatment", "cost", "date"], rowCount: 800000, description: "医院门诊就诊记录" },
  { id: "DS-005", name: "企业信用档案", owner: "金融科技丁", schema: ["enterprise_id", "credit_score", "registration_date", "industry", "revenue"], rowCount: 300000, description: "企业信用评级数据" },
  { id: "DS-006", name: "设备传感器数据", owner: "智能科技丙", schema: ["device_id", "temperature", "pressure", "vibration", "timestamp"], rowCount: 5000000, description: "工业设备IoT传感器数据" },
  { id: "DS-007", name: "教育学籍信息", owner: "数据研究院乙", schema: ["student_id", "school", "major", "grade", "enrollment_date"], rowCount: 600000, description: "高校学生学籍信息" },
  { id: "DS-008", name: "物流订单表", owner: "科技公司甲", schema: ["order_id", "route", "weight", "delivery_time", "status"], rowCount: 3000000, description: "物流配送订单信息" },
  { id: "DS-009", name: "保险保单表", owner: "金融科技丁", schema: ["policy_id", "insured_id", "premium", "coverage", "type"], rowCount: 500000, description: "保险保单基础信息" },
  { id: "DS-010", name: "城市人口普查", owner: "数据研究院乙", schema: ["resident_id", "district", "age", "occupation", "income"], rowCount: 10000000, description: "城市常住人口普查数据" },
];

export interface SQLResult {
  rowCount: number;
  columnCount: number;
  executionTime: string;
  preview: Array<Record<string, string>>;
}

export interface ModelResult {
  accuracy: number;
  auc: number;
  f1Score: number;
  precision: number;
  recall: number;
  trainingTime: string;
  epochs: number;
  lossCurve: Array<{ epoch: number; loss: number }>;
}

// 生成通用日志模板
function generateLogs(taskName: string, resultMsg?: string): TaskExecutionLog[] {
  const now = new Date();
  const ts = (offset: number) => {
    const d = new Date(now.getTime() + offset * 1000);
    return d.toISOString().slice(0, 19).replace("T", " ");
  };
  return [
    { timestamp: ts(1), level: "INFO", message: `任务[${taskName}]开始执行` },
    { timestamp: ts(3), level: "INFO", message: "连接参与方节点..." },
    { timestamp: ts(5), level: "SUCCESS", message: "节点连接成功" },
    { timestamp: ts(8), level: "INFO", message: "数据预处理中..." },
    { timestamp: ts(15), level: "INFO", message: "执行计算协议..." },
    ...(resultMsg ? [{ timestamp: ts(20), level: "SUCCESS" as const, message: resultMsg }] : []),
    { timestamp: ts(25), level: "SUCCESS", message: "任务执行完成" },
  ];
}

function generateLossCurve(epochs: number) {
  return Array.from({ length: Math.min(epochs / 5, 20) }, (_, i) => ({
    epoch: i * 5,
    loss: Math.max(0.1, 0.8 - i * 0.03 + (Math.random() - 0.5) * 0.05),
  }));
}

// ═══════════════════════════════════════════
// Mock execution logs — ALL 60 tasks
// ═══════════════════════════════════════════
export const mockLogs: Record<string, TaskExecutionLog[]> = {
  // PSI — 12
  "TASK-PSI-001": generateLogs("智能诊疗数据求交", "求交完成，结果数量：125,000"),
  "TASK-PSI-002": generateLogs("金融客户ID对齐", "求交进行中..."),
  "TASK-PSI-003": generateLogs("城市人口数据求交", "求交失败，节点连接超时"),
  "TASK-PSI-004": generateLogs("用户画像标签求交", "求交完成，结果数量：350,000"),
  "TASK-PSI-005": generateLogs("企业工商数据求交", "等待参与方加入..."),
  "TASK-PSI-006": generateLogs("设备指纹求交", "求交完成，结果数量：800,000"),
  "TASK-PSI-007": generateLogs("信用评分数据求交", "求交进行中..."),
  "TASK-PSI-008": generateLogs("物流订单求交", "求交完成，结果数量：200,000"),
  "TASK-PSI-009": generateLogs("社交网络好友求交", "求交完成，结果数量：1,500,000"),
  "TASK-PSI-010": generateLogs("教育学籍数据求交", "求交失败，数据格式不一致"),
  "TASK-PSI-011": generateLogs("保险理赔数据求交", "求交完成，结果数量：35,000"),
  "TASK-PSI-012": generateLogs("电商用户求交", "求交进行中..."),

  // PIR — 12
  "TASK-PIR-001": generateLogs("敏感信息隐匿查询", "查询完成，返回1条记录"),
  "TASK-PIR-002": generateLogs("信用记录隐匿查询", "等待查询条件确认..."),
  "TASK-PIR-003": generateLogs("设备信息隐匿查询", "查询完成，返回5条记录"),
  "TASK-PIR-004": generateLogs("企业征信隐匿查询", "查询完成，返回1条记录"),
  "TASK-PIR-005": generateLogs("医疗档案隐匿查询", "等待被查询方响应..."),
  "TASK-PIR-006": generateLogs("学历信息隐匿查询", "查询完成，返回1条记录"),
  "TASK-PIR-007": generateLogs("房产信息隐匿查询", "查询失败，被查询方离线"),
  "TASK-PIR-008": generateLogs("车辆信息隐匿查询", "查询完成，返回3条记录"),
  "TASK-PIR-009": generateLogs("社保缴纳隐匿查询", "等待查询条件确认..."),
  "TASK-PIR-010": generateLogs("交易记录隐匿查询", "查询完成，返回12条记录"),
  "TASK-PIR-011": generateLogs("税务记录隐匿查询", "查询进行中..."),
  "TASK-PIR-012": generateLogs("知识产权隐匿查询", "等待查询条件确认..."),

  // Stats — 12
  "TASK-STATS-001": generateLogs("城市人口均值统计", "统计完成，样本量50,000"),
  "TASK-STATS-002": generateLogs("金融交易数据求和", "统计完成，样本量200,000"),
  "TASK-STATS-003": generateLogs("医疗指标方差分析", "统计失败，数据质量异常"),
  "TASK-STATS-004": generateLogs("消费行为分位数统计", "统计完成，样本量300,000"),
  "TASK-STATS-005": generateLogs("人口年龄分布计数", "等待参与方数据就绪..."),
  "TASK-STATS-006": generateLogs("气象数据均值统计", "统计完成，样本量1,000,000"),
  "TASK-STATS-007": generateLogs("交通流量分位数统计", "统计进行中..."),
  "TASK-STATS-008": generateLogs("企业营收求和统计", "统计完成，样本量50,000"),
  "TASK-STATS-009": generateLogs("用户留存率统计", "等待参与方数据就绪..."),
  "TASK-STATS-010": generateLogs("产品销售方差分析", "统计失败，样本量不足"),
  "TASK-STATS-011": generateLogs("教育成绩分位数统计", "统计完成，样本量100,000"),
  "TASK-STATS-012": generateLogs("能耗数据极值统计", "统计进行中..."),

  // SQL — 12
  "TASK-SQL-001": generateLogs("信贷风险评估查询", "查询失败，语法错误"),
  "TASK-SQL-002": generateLogs("跨机构客户画像查询", "查询完成，返回150行"),
  "TASK-SQL-003": generateLogs("城市数据联合查询", "等待查询条件确认..."),
  "TASK-SQL-004": generateLogs("金融风控特征查询", "查询完成，返回50,000行"),
  "TASK-SQL-005": generateLogs("医疗病例分析查询", "查询进行中..."),
  "TASK-SQL-006": generateLogs("供应链数据关联查询", "查询完成，返回5,000行"),
  "TASK-SQL-007": generateLogs("用户行为漏斗查询", "等待查询条件确认..."),
  "TASK-SQL-008": generateLogs("区域销售聚合查询", "查询失败，聚合函数异常"),
  "TASK-SQL-009": generateLogs("信用风险评估查询", "查询完成，返回8,000行"),
  "TASK-SQL-010": generateLogs("舆情数据筛选查询", "查询进行中..."),
  "TASK-SQL-011": generateLogs("物流时效分析查询", "查询完成，返回2,000行"),
  "TASK-SQL-012": generateLogs("能耗趋势分析查询", "等待查询条件确认..."),

  // Modeling — 12
  "TASK-FL-001": generateLogs("医疗诊断预测模型", "模型训练完成，AUC: 0.92"),
  "TASK-FL-002": generateLogs("客户价值筛选模型", "模型训练中，进度67%..."),
  "TASK-FL-003": generateLogs("风控评分卡模型", "等待训练数据就绪..."),
  "TASK-FL-004": generateLogs("销量预测模型", "模型训练完成，MAE: 0.12"),
  "TASK-FL-005": generateLogs("用户流失预警模型", "模型训练中，进度45%..."),
  "TASK-FL-006": generateLogs("反欺诈检测模型", "模型训练完成，AUC: 0.96"),
  "TASK-FL-007": generateLogs("推荐系统模型", "等待训练数据就绪..."),
  "TASK-FL-008": generateLogs("信用评分模型", "训练失败，节点连接中断"),
  "TASK-FL-009": generateLogs("异常检测模型", "模型训练完成，Precision: 0.89"),
  "TASK-FL-010": generateLogs("疾病风险预测模型", "模型训练中，进度78%..."),
  "TASK-FL-011": generateLogs("交通流量预测模型", "等待训练数据就绪..."),
  "TASK-FL-012": generateLogs("舆情情感分析模型", "模型训练完成，Accuracy: 0.91"),
};

// ═══════════════════════════════════════════
// Mock participants — ALL 60 tasks
// ═══════════════════════════════════════════
export const mockParticipants: Record<string, TaskParticipant[]> = {
  // PSI — 12
  "TASK-PSI-001": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
    { id: "P3", name: "智能科技丙", role: "参与方", status: "online", dataSize: "120万", dataCount: 1200000 },
  ],
  "TASK-PSI-002": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "busy", dataSize: "300万", dataCount: 3000000 },
  ],
  "TASK-PSI-003": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "100万", dataCount: 1000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "offline", dataSize: "150万", dataCount: 1500000 },
    { id: "P3", name: "金融科技丁", role: "参与方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P4", name: "科技公司甲", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
  ],
  "TASK-PSI-004": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "500万", dataCount: 5000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "800万", dataCount: 8000000 },
  ],
  "TASK-PSI-005": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "30万", dataCount: 300000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P3", name: "智能科技丙", role: "参与方", status: "busy", dataSize: "40万", dataCount: 400000 },
  ],
  "TASK-PSI-006": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "1000万", dataCount: 10000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "1500万", dataCount: 15000000 },
  ],
  "TASK-PSI-007": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "80万", dataCount: 800000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "busy", dataSize: "120万", dataCount: 1200000 },
    { id: "P3", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "90万", dataCount: 900000 },
  ],
  "TASK-PSI-008": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "300万", dataCount: 3000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "500万", dataCount: 5000000 },
  ],
  "TASK-PSI-009": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "2000万", dataCount: 20000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "3000万", dataCount: 30000000 },
  ],
  "TASK-PSI-010": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "500万", dataCount: 5000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "offline", dataSize: "800万", dataCount: 8000000 },
    { id: "P3", name: "金融科技丁", role: "参与方", status: "online", dataSize: "600万", dataCount: 6000000 },
  ],
  "TASK-PSI-011": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
  ],
  "TASK-PSI-012": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "busy", dataSize: "1000万", dataCount: 10000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "1500万", dataCount: 1500000 },
    { id: "P3", name: "金融科技丁", role: "参与方", status: "online", dataSize: "2000万", dataCount: 20000000 },
  ],

  // PIR — 12
  "TASK-PIR-001": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online" },
    { id: "P2", name: "数据研究院乙", role: "被查询方", status: "online", dataSize: "200万", dataCount: 2000000 },
  ],
  "TASK-PIR-002": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online" },
    { id: "P2", name: "科技公司甲", role: "被查询方", status: "online", dataSize: "500万", dataCount: 5000000 },
  ],
  "TASK-PIR-003": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online" },
    { id: "P2", name: "智能科技丙", role: "被查询方", status: "online", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-PIR-004": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online" },
    { id: "P2", name: "金融科技丁", role: "被查询方", status: "online", dataSize: "300万", dataCount: 3000000 },
  ],
  "TASK-PIR-005": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online" },
    { id: "P2", name: "科技公司甲", role: "被查询方", status: "busy", dataSize: "800万", dataCount: 8000000 },
  ],
  "TASK-PIR-006": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online" },
    { id: "P2", name: "数据研究院乙", role: "被查询方", status: "online", dataSize: "500万", dataCount: 5000000 },
  ],
  "TASK-PIR-007": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online" },
    { id: "P2", name: "科技公司甲", role: "被查询方", status: "offline", dataSize: "600万", dataCount: 6000000 },
  ],
  "TASK-PIR-008": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online" },
    { id: "P2", name: "智能科技丙", role: "被查询方", status: "online", dataSize: "120万", dataCount: 1200000 },
  ],
  "TASK-PIR-009": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online" },
    { id: "P2", name: "金融科技丁", role: "被查询方", status: "online", dataSize: "400万", dataCount: 4000000 },
  ],
  "TASK-PIR-010": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online" },
    { id: "P2", name: "科技公司甲", role: "被查询方", status: "online", dataSize: "1000万", dataCount: 10000000 },
  ],
  "TASK-PIR-011": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "busy" },
    { id: "P2", name: "数据研究院乙", role: "被查询方", status: "online", dataSize: "250万", dataCount: 2500000 },
  ],
  "TASK-PIR-012": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online" },
    { id: "P2", name: "智能科技丙", role: "被查询方", status: "online", dataSize: "180万", dataCount: 1800000 },
  ],

  // Stats — 12
  "TASK-STATS-001": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
    { id: "P3", name: "智能科技丙", role: "参与方", status: "online", dataSize: "60万", dataCount: 600000 },
  ],
  "TASK-STATS-002": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "100万", dataCount: 1000000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "online", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-STATS-003": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "30万", dataCount: 300000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "offline", dataSize: "50万", dataCount: 500000 },
  ],
  "TASK-STATS-004": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "300万", dataCount: 3000000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "online", dataSize: "500万", dataCount: 5000000 },
  ],
  "TASK-STATS-005": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "busy", dataSize: "300万", dataCount: 3000000 },
  ],
  "TASK-STATS-006": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "500万", dataCount: 5000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "800万", dataCount: 8000000 },
  ],
  "TASK-STATS-007": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "busy", dataSize: "400万", dataCount: 4000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "600万", dataCount: 6000000 },
  ],
  "TASK-STATS-008": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "20万", dataCount: 200000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "35万", dataCount: 350000 },
  ],
  "TASK-STATS-009": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "150万", dataCount: 1500000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "busy", dataSize: "200万", dataCount: 2000000 },
  ],
  "TASK-STATS-010": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "80万", dataCount: 800000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "offline", dataSize: "120万", dataCount: 1200000 },
  ],
  "TASK-STATS-011": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
  ],
  "TASK-STATS-012": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "busy", dataSize: "300万", dataCount: 3000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "450万", dataCount: 4500000 },
  ],

  // SQL — 12
  "TASK-SQL-001": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "offline", dataSize: "300万", dataCount: 3000000 },
  ],
  "TASK-SQL-002": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "300万", dataCount: 3000000 },
  ],
  "TASK-SQL-003": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "500万", dataCount: 5000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "busy", dataSize: "800万", dataCount: 8000000 },
  ],
  "TASK-SQL-004": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "500万", dataCount: 5000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "800万", dataCount: 8000000 },
  ],
  "TASK-SQL-005": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "100万", dataCount: 1000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "busy", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-SQL-006": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "100万", dataCount: 1000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-SQL-007": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "300万", dataCount: 3000000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "busy", dataSize: "500万", dataCount: 5000000 },
  ],
  "TASK-SQL-008": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "250万", dataCount: 2500000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "offline", dataSize: "400万", dataCount: 4000000 },
  ],
  "TASK-SQL-009": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "180万", dataCount: 1800000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "250万", dataCount: 2500000 },
  ],
  "TASK-SQL-010": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "busy", dataSize: "600万", dataCount: 6000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "900万", dataCount: 9000000 },
  ],
  "TASK-SQL-011": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "120万", dataCount: 1200000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "180万", dataCount: 1800000 },
  ],
  "TASK-SQL-012": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "busy", dataSize: "80万", dataCount: 800000 },
  ],

  // Modeling — 12
  "TASK-FL-001": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "10万", dataCount: 100000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "15万", dataCount: 150000 },
    { id: "P3", name: "智能科技丙", role: "参与方", status: "online", dataSize: "8万", dataCount: 80000 },
  ],
  "TASK-FL-002": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "busy", dataSize: "80万", dataCount: 800000 },
  ],
  "TASK-FL-003": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "300万", dataCount: 3000000 },
    { id: "P3", name: "数据研究院乙", role: "参与方", status: "busy", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-FL-004": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
  ],
  "TASK-FL-005": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "100万", dataCount: 1000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "busy", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-FL-006": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "200万", dataCount: 2000000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "300万", dataCount: 3000000 },
    { id: "P3", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-FL-007": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "online", dataSize: "80万", dataCount: 800000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "busy", dataSize: "120万", dataCount: 1200000 },
  ],
  "TASK-FL-008": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "150万", dataCount: 1500000 },
    { id: "P2", name: "金融科技丁", role: "参与方", status: "offline", dataSize: "200万", dataCount: 2000000 },
  ],
  "TASK-FL-009": [
    { id: "P1", name: "科技公司甲", role: "发起方", status: "online", dataSize: "100万", dataCount: 1000000 },
    { id: "P2", name: "智能科技丙", role: "参与方", status: "online", dataSize: "150万", dataCount: 1500000 },
  ],
  "TASK-FL-010": [
    { id: "P1", name: "数据研究院乙", role: "发起方", status: "busy", dataSize: "60万", dataCount: 600000 },
    { id: "P2", name: "科技公司甲", role: "参与方", status: "online", dataSize: "90万", dataCount: 900000 },
  ],
  "TASK-FL-011": [
    { id: "P1", name: "智能科技丙", role: "发起方", status: "online", dataSize: "300万", dataCount: 3000000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "450万", dataCount: 4500000 },
    { id: "P3", name: "金融科技丁", role: "参与方", status: "busy", dataSize: "200万", dataCount: 2000000 },
  ],
  "TASK-FL-012": [
    { id: "P1", name: "金融科技丁", role: "发起方", status: "online", dataSize: "50万", dataCount: 500000 },
    { id: "P2", name: "数据研究院乙", role: "参与方", status: "online", dataSize: "80万", dataCount: 800000 },
  ],
};

// ═══════════════════════════════════════════
// Mock PSI results — ALL 12 PSI tasks
// ═══════════════════════════════════════════
export const mockPSIResults: Record<string, PSIResult> = {
  "TASK-PSI-001": { intersectionCount: 125000, totalCountA: 500000, totalCountB: 800000, overlapRate: 15.6, executionTime: "2分45秒" },
  "TASK-PSI-002": { intersectionCount: 680000, totalCountA: 2000000, totalCountB: 3000000, overlapRate: 22.7, executionTime: "5分20秒" },
  "TASK-PSI-003": { intersectionCount: 0, totalCountA: 1000000, totalCountB: 1500000, overlapRate: 0, executionTime: "—" },
  "TASK-PSI-004": { intersectionCount: 350000, totalCountA: 5000000, totalCountB: 8000000, overlapRate: 7.0, executionTime: "8分30秒" },
  "TASK-PSI-005": { intersectionCount: 28000, totalCountA: 300000, totalCountB: 500000, overlapRate: 9.3, executionTime: "1分50秒" },
  "TASK-PSI-006": { intersectionCount: 800000, totalCountA: 10000000, totalCountB: 15000000, overlapRate: 8.0, executionTime: "15分20秒" },
  "TASK-PSI-007": { intersectionCount: 95000, totalCountA: 800000, totalCountB: 1200000, overlapRate: 11.9, executionTime: "3分40秒" },
  "TASK-PSI-008": { intersectionCount: 200000, totalCountA: 3000000, totalCountB: 5000000, overlapRate: 6.7, executionTime: "6分10秒" },
  "TASK-PSI-009": { intersectionCount: 1500000, totalCountA: 20000000, totalCountB: 30000000, overlapRate: 7.5, executionTime: "22分40秒" },
  "TASK-PSI-010": { intersectionCount: 0, totalCountA: 5000000, totalCountB: 8000000, overlapRate: 0, executionTime: "—" },
  "TASK-PSI-011": { intersectionCount: 35000, totalCountA: 500000, totalCountB: 800000, overlapRate: 7.0, executionTime: "3分15秒" },
  "TASK-PSI-012": { intersectionCount: 420000, totalCountA: 10000000, totalCountB: 15000000, overlapRate: 4.2, executionTime: "18分50秒" },
};

// ═══════════════════════════════════════════
// Mock PIR results — ALL 12 PIR tasks
// ═══════════════════════════════════════════
export const mockPIRResults: Record<string, PIRResult> = {
  "TASK-PIR-001": { queryCount: 1, responseCount: 1, responseTime: "2.3秒", hitRate: 100 },
  "TASK-PIR-002": { queryCount: 1, responseCount: 0, responseTime: "1.8秒", hitRate: 0 },
  "TASK-PIR-003": { queryCount: 1, responseCount: 5, responseTime: "3.5秒", hitRate: 100 },
  "TASK-PIR-004": { queryCount: 1, responseCount: 1, responseTime: "1.8秒", hitRate: 100 },
  "TASK-PIR-005": { queryCount: 1, responseCount: 0, responseTime: "2.1秒", hitRate: 0 },
  "TASK-PIR-006": { queryCount: 1, responseCount: 1, responseTime: "2.1秒", hitRate: 100 },
  "TASK-PIR-007": { queryCount: 1, responseCount: 0, responseTime: "—", hitRate: 0 },
  "TASK-PIR-008": { queryCount: 1, responseCount: 3, responseTime: "4.2秒", hitRate: 100 },
  "TASK-PIR-009": { queryCount: 1, responseCount: 0, responseTime: "2.5秒", hitRate: 0 },
  "TASK-PIR-010": { queryCount: 1, responseCount: 12, responseTime: "6.8秒", hitRate: 100 },
  "TASK-PIR-011": { queryCount: 1, responseCount: 2, responseTime: "3.2秒", hitRate: 100 },
  "TASK-PIR-012": { queryCount: 1, responseCount: 0, responseTime: "2.0秒", hitRate: 0 },
};

// ═══════════════════════════════════════════
// Mock Stats results — ALL 12 Stats tasks
// ═══════════════════════════════════════════
export const mockStatsResults: Record<string, StatsResult> = {
  "TASK-STATS-001": { statType: "均值", dimensions: "年龄、收入、消费", resultValue: "年龄: 35.2岁, 收入: 8.5万, 消费: 3.2万", sampleSize: 50000, confidenceInterval: "95% CI: [34.8, 35.6]" },
  "TASK-STATS-002": { statType: "求和+分位数", dimensions: "交易额、交易频次", resultValue: "总交易额: 12.5亿, P50: 5000元, P95: 50000元", sampleSize: 200000, confidenceInterval: "95% CI: [12.3, 12.7]亿" },
  "TASK-STATS-003": { statType: "方差+标准差", dimensions: "血压、血糖、心率", resultValue: "—", sampleSize: 0, confidenceInterval: "—" },
  "TASK-STATS-004": { statType: "分位数", dimensions: "消费金额、消费频次", resultValue: "P25: 1000元, P50: 2500元, P75: 5000元, P90: 12000元", sampleSize: 300000, confidenceInterval: "95% CI: [2450, 2550]" },
  "TASK-STATS-005": { statType: "计数", dimensions: "年龄段、性别、职业", resultValue: "18-30岁: 45万, 31-45岁: 38万, 46-60岁: 22万", sampleSize: 1050000, confidenceInterval: "95% CI: [104.5, 105.5]万" },
  "TASK-STATS-006": { statType: "均值+标准差", dimensions: "温度、湿度、降水量", resultValue: "温度: 22.5±3.2°C, 湿度: 65±12%, 降水: 5.2±8.5mm", sampleSize: 1000000, confidenceInterval: "95% CI: [22.3, 22.7]" },
  "TASK-STATS-007": { statType: "分位数", dimensions: "车流量、拥堵指数", resultValue: "车流量 P50: 3200辆/h, P95: 8500辆/h; 拥堵指数 P50: 3.2, P95: 7.8", sampleSize: 500000, confidenceInterval: "95% CI: [3150, 3250]" },
  "TASK-STATS-008": { statType: "求和", dimensions: "营收、利润、税收", resultValue: "总营收: 850亿, 总利润: 120亿, 总税收: 35亿", sampleSize: 50000, confidenceInterval: "95% CI: [840, 860]亿" },
  "TASK-STATS-009": { statType: "均值", dimensions: "日留存、周留存、月留存", resultValue: "日留存: 45.2%, 周留存: 28.6%, 月留存: 15.3%", sampleSize: 800000, confidenceInterval: "95% CI: [44.8, 45.6]%" },
  "TASK-STATS-010": { statType: "方差", dimensions: "销量、库存、退货率", resultValue: "—", sampleSize: 0, confidenceInterval: "—" },
  "TASK-STATS-011": { statType: "分位数", dimensions: "数学、语文、英语", resultValue: "数学 P50: 78, 语文 P50: 82, 英语 P50: 75", sampleSize: 100000, confidenceInterval: "95% CI: [77, 79]" },
  "TASK-STATS-012": { statType: "最大值+最小值", dimensions: "电力、燃气、水资源", resultValue: "电力: max 8500kWh/min 120kWh, 燃气: max 420m³/min 15m³, 水: max 680吨/min 8吨", sampleSize: 720000, confidenceInterval: "95% CI: [715, 725]" },
};

// ═══════════════════════════════════════════
// Mock SQL results — ALL 12 SQL tasks
// ═══════════════════════════════════════════
export const mockSQLResults: Record<string, SQLResult> = {
  "TASK-SQL-001": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
  "TASK-SQL-002": { rowCount: 150, columnCount: 3, executionTime: "1.5秒", preview: [
    { domain: "金融", count: "45", avg_score: "85.2" },
    { domain: "医疗", count: "32", avg_score: "78.5" },
    { domain: "教育", count: "28", avg_score: "82.1" },
    { domain: "零售", count: "25", avg_score: "76.8" },
    { domain: "科技", count: "20", avg_score: "88.4" },
  ]},
  "TASK-SQL-003": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
  "TASK-SQL-004": { rowCount: 50000, columnCount: 3, executionTime: "12.5秒", preview: [
    { user_id: "U001", merchant_count: "45", std_amount: "3200" },
    { user_id: "U002", merchant_count: "32", std_amount: "1800" },
    { user_id: "U003", merchant_count: "78", std_amount: "5600" },
    { user_id: "U004", merchant_count: "21", std_amount: "1200" },
    { user_id: "U005", merchant_count: "67", std_amount: "4200" },
  ]},
  "TASK-SQL-005": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
  "TASK-SQL-006": { rowCount: 5000, columnCount: 3, executionTime: "4.2秒", preview: [
    { supplier_id: "S001", total_amount: "12500000", avg_delivery: "3.2" },
    { supplier_id: "S002", total_amount: "8900000", avg_delivery: "2.8" },
    { supplier_id: "S003", total_amount: "23400000", avg_delivery: "4.5" },
    { supplier_id: "S004", total_amount: "5600000", avg_delivery: "2.1" },
    { supplier_id: "S005", total_amount: "18900000", avg_delivery: "3.8" },
  ]},
  "TASK-SQL-007": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
  "TASK-SQL-008": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
  "TASK-SQL-009": { rowCount: 8000, columnCount: 4, executionTime: "6.8秒", preview: [
    { user_id: "U001", credit_score: "520", loan_count: "3", default_count: "1" },
    { user_id: "U002", credit_score: "480", loan_count: "5", default_count: "2" },
    { user_id: "U003", credit_score: "450", loan_count: "8", default_count: "3" },
    { user_id: "U004", credit_score: "580", loan_count: "2", default_count: "0" },
    { user_id: "U005", credit_score: "490", loan_count: "4", default_count: "1" },
  ]},
  "TASK-SQL-010": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
  "TASK-SQL-011": { rowCount: 2000, columnCount: 3, executionTime: "3.5秒", preview: [
    { route: "北京-上海", avg_time: "24.5", p95_time: "36.0" },
    { route: "上海-广州", avg_time: "28.3", p95_time: "42.0" },
    { route: "广州-深圳", avg_time: "18.2", p95_time: "28.0" },
    { route: "北京-深圳", avg_time: "32.1", p95_time: "48.0" },
    { route: "上海-成都", avg_time: "35.6", p95_time: "52.0" },
  ]},
  "TASK-SQL-012": { rowCount: 0, columnCount: 0, executionTime: "—", preview: [] },
};

// ═══════════════════════════════════════════
// Mock Model results — ALL 12 Modeling tasks
// ═══════════════════════════════════════════
export const mockModelResults: Record<string, ModelResult> = {
  "TASK-FL-001": { accuracy: 0.92, auc: 0.95, f1Score: 0.88, precision: 0.90, recall: 0.86, trainingTime: "45分30秒", epochs: 100, lossCurve: generateLossCurve(100) },
  "TASK-FL-002": { accuracy: 0.85, auc: 0.88, f1Score: 0.82, precision: 0.84, recall: 0.80, trainingTime: "32分15秒", epochs: 80, lossCurve: generateLossCurve(80) },
  "TASK-FL-003": { accuracy: 0, auc: 0, f1Score: 0, precision: 0, recall: 0, trainingTime: "—", epochs: 0, lossCurve: [] },
  "TASK-FL-004": { accuracy: 0.85, auc: 0.88, f1Score: 0.82, precision: 0.84, recall: 0.80, trainingTime: "32分15秒", epochs: 80, lossCurve: generateLossCurve(80) },
  "TASK-FL-005": { accuracy: 0.78, auc: 0.82, f1Score: 0.75, precision: 0.77, recall: 0.73, trainingTime: "28分40秒", epochs: 70, lossCurve: generateLossCurve(70) },
  "TASK-FL-006": { accuracy: 0.96, auc: 0.98, f1Score: 0.91, precision: 0.93, recall: 0.89, trainingTime: "58分20秒", epochs: 120, lossCurve: generateLossCurve(120) },
  "TASK-FL-007": { accuracy: 0, auc: 0, f1Score: 0, precision: 0, recall: 0, trainingTime: "—", epochs: 0, lossCurve: [] },
  "TASK-FL-008": { accuracy: 0, auc: 0, f1Score: 0, precision: 0, recall: 0, trainingTime: "—", epochs: 0, lossCurve: [] },
  "TASK-FL-009": { accuracy: 0.89, auc: 0.92, f1Score: 0.87, precision: 0.89, recall: 0.85, trainingTime: "28分45秒", epochs: 60, lossCurve: generateLossCurve(60) },
  "TASK-FL-010": { accuracy: 0.88, auc: 0.91, f1Score: 0.85, precision: 0.87, recall: 0.83, trainingTime: "42分10秒", epochs: 90, lossCurve: generateLossCurve(90) },
  "TASK-FL-011": { accuracy: 0, auc: 0, f1Score: 0, precision: 0, recall: 0, trainingTime: "—", epochs: 0, lossCurve: [] },
  "TASK-FL-012": { accuracy: 0.91, auc: 0.94, f1Score: 0.90, precision: 0.91, recall: 0.89, trainingTime: "38分10秒", epochs: 90, lossCurve: generateLossCurve(90) },
};
