import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical, Cpu, ShieldCheck, Lock, Blocks,
  ArrowDown, ArrowRight, Users, Database, Search,
  CheckCircle2, FileText, Shield, Activity, Network,
} from "lucide-react";

const flows = [
  {
    id: "FLOW-001",
    title: "从抽样到隐私计算",
    scene: "多个金融机构希望在不暴露各自客户数据的前提下，找出共同客户群体并分析画像特征。",
    tags: ["抽样管理", "数据沙箱", "隐私计算", "密态计算", "区块链"],
    steps: [
      { module: "数据抽样管理", desc: "各机构从全量客户数据中抽取代表性样本，配置分层抽样规则，执行抽样任务，质检合格后入库", icon: <FlaskConical className="w-5 h-5" /> },
      { module: "数据沙箱", desc: "算法工程师在沙箱中探查样本数据分布，进行数据清洗和特征工程，开发联邦学习模型或PSI求交脚本", icon: <Cpu className="w-5 h-5" /> },
      { module: "隐私计算", desc: "业务人员选择\"隐私求交\"或\"联邦学习\"，配置参与方、选择沙箱发布的算法，提交执行", icon: <ShieldCheck className="w-5 h-5" /> },
      { module: "密态计算", desc: "平台自动调用MPC协议引擎或TEE环境执行安全计算（用户无感知）", icon: <Lock className="w-5 h-5" /> },
      { module: "区块链", desc: "关键操作（任务提交、结果输出）自动上链存证，生成可追溯的审计记录", icon: <Blocks className="w-5 h-5" /> },
    ],
  },
  {
    id: "FLOW-002",
    title: "密态引擎性能排查",
    scene: "平台运维人员发现隐私计算任务执行性能下降，需要排查密态计算引擎状态。",
    tags: ["密态计算", "区块链"],
    steps: [
      { module: "密态计算 → 资源与调度", desc: "检查资源池使用率、各参与方节点的资源配额和调度队列，确认是否存在资源争抢", icon: <Activity className="w-5 h-5" /> },
      { module: "密态计算 → 网络通信", desc: "检查网络拓扑中各节点间的通信延迟、加密通道状态，确认网络层面是否正常", icon: <Network className="w-5 h-5" /> },
      { module: "密态计算 → 密码协议引擎", desc: "查看MPC协议执行日志、电路复杂度、秘密共享效率，定位协议层面的性能瓶颈", icon: <Shield className="w-5 h-5" /> },
      { module: "区块链 → 存证记录", desc: "通过区块链存证追溯最近的关键配置变更，确认是否有人为操作导致性能下降", icon: <Blocks className="w-5 h-5" /> },
    ],
  },
  {
    id: "FLOW-003",
    title: "TEE环境安全扩容",
    scene: "业务增长导致现有TEE安全飞地资源不足，需要新增TEE节点并纳入平台统一管理。",
    tags: ["密态计算", "区块链"],
    steps: [
      { module: "密态计算 → 可信执行环境", desc: "在目标服务器上部署TEE运行时（Intel SGX/AMD SEV），完成硬件初始化", icon: <ShieldCheck className="w-5 h-5" /> },
      { module: "密态计算 → 可信执行环境", desc: "执行远程证明流程，验证新飞地的可信状态，获取证明Quote", icon: <CheckCircle2 className="w-5 h-5" /> },
      { module: "密态计算 → 网络通信", desc: "配置新节点与现有集群的网络拓扑，建立加密通信通道（TLS+mTLS）", icon: <Network className="w-5 h-5" /> },
      { module: "密态计算 → 密钥与证书", desc: "为新节点签发平台证书，配置密钥分发策略，纳入密钥轮转计划", icon: <Lock className="w-5 h-5" /> },
      { module: "区块链", desc: "将节点注册、证明验证、密钥签发等关键操作上链存证", icon: <Blocks className="w-5 h-5" /> },
    ],
  },
  {
    id: "FLOW-004",
    title: "跨机构联合风控建模",
    scene: "多家银行希望联合建立反欺诈模型，但监管要求原始数据不得出域。",
    tags: ["抽样管理", "数据沙箱", "隐私计算", "密态计算", "区块链"],
    steps: [
      { module: "数据抽样管理", desc: "各银行从交易数据中抽取欺诈/正常样本，确保正负样本均衡，质检通过后共享样本元数据", icon: <FlaskConical className="w-5 h-5" /> },
      { module: "数据沙箱", desc: "各机构在本地沙箱中对样本进行标准化处理（归一化、编码），开发横向联邦学习XGBoost模型", icon: <Cpu className="w-5 h-5" /> },
      { module: "隐私计算 → 联邦学习", desc: "发起联邦学习任务，各参与方加载本地沙箱模型，配置聚合策略（FedAvg/SecureAgg）", icon: <Users className="w-5 h-5" /> },
      { module: "密态计算 → 密码协议引擎", desc: "使用SPDZ协议保护梯度传输，防止半诚实服务器窃取中间梯度信息", icon: <Shield className="w-5 h-5" /> },
      { module: "密态计算 → 同态加密引擎", desc: "使用CKKS方案对聚合后的全局模型进行加密存储，确保模型参数安全", icon: <Lock className="w-5 h-5" /> },
      { module: "区块链", desc: "每轮训练的梯度聚合、模型更新等操作上链存证，满足监管审计要求", icon: <Blocks className="w-5 h-5" /> },
    ],
  },
  {
    id: "FLOW-005",
    title: "同态加密密钥应急轮转",
    scene: "安全告警提示某同态加密私钥可能存在泄露风险，需要紧急执行密钥轮转。",
    tags: ["密态计算", "区块链"],
    steps: [
      { module: "密态计算 → 密钥与证书", desc: "立即吊销风险密钥（HEK-001），标记为\"已吊销\"状态，禁止新数据使用该密钥加密", icon: <Lock className="w-5 h-5" /> },
      { module: "密态计算 → 同态加密引擎", desc: "使用新参数集生成替换密钥对，更新密钥版本号，确保向后兼容性", icon: <ShieldCheck className="w-5 h-5" /> },
      { module: "密态计算 → 同态加密引擎", desc: "使用新公钥对存量加密数据进行重加密（Bootstrapping），迁移至新密钥体系", icon: <Database className="w-5 h-5" /> },
      { module: "密态计算 → 网络通信", desc: "通过安全通道将新私钥分发给各授权参与方，旧私钥碎片安全销毁", icon: <Network className="w-5 h-5" /> },
      { module: "区块链", desc: "密钥吊销、新密钥生成、重加密完成等关键事件上链存证，生成应急审计报告", icon: <Blocks className="w-5 h-5" /> },
    ],
  },
];

export default function BusinessFlow() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">业务流程验证</h1>
        <p className="text-sm text-gray-500 mt-1">五大核心模块间的典型业务流程与操作路径</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4 flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-blue-600" />
          <div><div className="text-sm font-medium">L1 数据抽样</div><div className="text-xs text-gray-500">数据准备层</div></div>
        </CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardContent className="p-4 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-green-600" />
          <div><div className="text-sm font-medium">L2 数据沙箱</div><div className="text-xs text-gray-500">开发环境层</div></div>
        </CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <div><div className="text-sm font-medium">L3 隐私计算</div><div className="text-xs text-gray-500">计算框架层</div></div>
        </CardContent></Card>
        <Card className="border-l-4 border-l-amber-500"><CardContent className="p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600" />
          <div><div className="text-sm font-medium">L4 密态计算</div><div className="text-xs text-gray-500">密码引擎层</div></div>
        </CardContent></Card>
        <Card className="border-l-4 border-l-slate-500"><CardContent className="p-4 flex items-center gap-3">
          <Blocks className="w-5 h-5 text-slate-600" />
          <div><div className="text-sm font-medium">L5 区块链</div><div className="text-xs text-gray-500">可信底座层</div></div>
        </CardContent></Card>
      </div>

      {flows.map((flow) => (
        <Card key={flow.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50/50 pb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">{flow.id}</Badge>
              <CardTitle className="text-lg">{flow.title}</CardTitle>
            </div>
            <p className="text-sm text-gray-500 mt-2">{flow.scene}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {flow.tags.map(tag => (
                <Badge key={tag} className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">{tag}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {flow.steps.map((step, idx) => (
                <div key={idx}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        {step.icon}
                      </div>
                      {idx < flow.steps.length - 1 && (
                        <div className="w-0.5 h-8 bg-indigo-100 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-indigo-700">{step.module}</span>
                        <span className="text-xs text-gray-400">步骤 {idx + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
