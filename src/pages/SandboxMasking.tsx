import { useState } from "react";
import { Eye, EyeOff, Plus, Search, Play, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import Drawer from "@/components/Drawer";
import StatusTag from "@/components/StatusTag";
import { cn } from "@/lib/utils";

const maskingRules = [
  { id: "MR-001", name: "手机号掩码", fieldType: "手机号", method: "mask", strength: "高", example: "138****1234", hitCount: 52300, status: "active" },
  { id: "MR-002", name: "姓名脱敏", fieldType: "姓名", method: "mask", strength: "中", example: "张*三", hitCount: 48900, status: "active" },
  { id: "MR-003", name: "身份证号哈希", fieldType: "身份证", method: "hash", strength: "高", example: "sha256:...", hitCount: 45600, status: "active" },
  { id: "MR-004", name: "邮箱替换", fieldType: "邮箱", method: "replace", strength: "中", example: "***@example.com", hitCount: 31200, status: "active" },
  { id: "MR-005", name: "地址模糊", fieldType: "地址", method: "fuzz", strength: "低", example: "北京市***区", hitCount: 28700, status: "active" },
  { id: "MR-006", name: "银行卡掩码", fieldType: "银行卡", method: "mask", strength: "高", example: "**** **** **** 1234", hitCount: 19800, status: "active" },
  { id: "MR-007", name: "手机号哈希", fieldType: "手机号", method: "hash", strength: "高", example: "sha256:...", hitCount: 15400, status: "inactive" },
  { id: "MR-008", name: "姓名替换", fieldType: "姓名", method: "replace", strength: "高", example: "[已脱敏]", hitCount: 12300, status: "active" },
  { id: "MR-009", name: "身份证截断", fieldType: "身份证", method: "truncate", strength: "中", example: "110101********1234", hitCount: 9800, status: "active" },
  { id: "MR-010", name: "邮箱哈希", fieldType: "邮箱", method: "hash", strength: "高", example: "sha256:...", hitCount: 7600, status: "inactive" },
];

const maskingTasks = [
  { id: "MT-001", sourceTable: "user_info", targetTable: "user_info_masked", ruleCount: 3, processedRows: 12500000, status: "completed", startTime: "2026-04-21 08:00" },
  { id: "MT-002", sourceTable: "order_detail", targetTable: "order_detail_masked", ruleCount: 2, processedRows: 48200000, status: "running", startTime: "2026-04-21 10:00" },
  { id: "MT-003", sourceTable: "customer_info", targetTable: "customer_info_masked", ruleCount: 4, processedRows: 856000, status: "completed", startTime: "2026-04-20 14:00" },
  { id: "MT-004", sourceTable: "payment_log", targetTable: "payment_log_masked", ruleCount: 2, processedRows: 0, status: "pending", startTime: "-" },
  { id: "MT-005", sourceTable: "logistics_info", targetTable: "logistics_info_masked", ruleCount: 1, processedRows: 2340000, status: "completed", startTime: "2026-04-19 09:00" },
  { id: "MT-006", sourceTable: "review_text", targetTable: "review_text_masked", ruleCount: 1, processedRows: 890000, status: "running", startTime: "2026-04-21 11:00" },
  { id: "MT-007", sourceTable: "device_info", targetTable: "device_info_masked", ruleCount: 2, processedRows: 0, status: "pending", startTime: "-" },
  { id: "MT-008", sourceTable: "consultation", targetTable: "consultation_masked", ruleCount: 3, processedRows: 456000, status: "completed", startTime: "2026-04-18 16:00" },
];

export default function SandboxMasking() {
  const [activeTab, setActiveTab] = useState<"rules" | "tasks" | "preview">("rules");
  const [showDrawer, setShowDrawer] = useState(false);

  const stats = [
    { label: "服务状态", value: "运行中", icon: Shield, color: "text-emerald-500" },
    { label: "今日处理", value: "2.1M", icon: Eye, color: "text-blue-500" },
  ];

  const ruleCols = [
    { key: "id", title: "ID", cell: (r: typeof maskingRules[0]) => <span className="font-mono text-xs text-slate-500">{r.id}</span> },
    { key: "name", title: "规则名称", cell: (r: typeof maskingRules[0]) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: "fieldType", title: "字段类型", cell: (r: typeof maskingRules[0]) => <Badge variant="outline" className="text-xs">{r.fieldType}</Badge> },
    { key: "method", title: "脱敏方式", cell: (r: typeof maskingRules[0]) => <Badge className={cn("text-xs", r.method === "hash" ? "bg-purple-500/10 text-purple-600" : r.method === "mask" ? "bg-blue-500/10 text-blue-600" : r.method === "replace" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>{r.method === "hash" ? "哈希" : r.method === "mask" ? "掩码" : r.method === "replace" ? "替换" : "模糊"}</Badge> },
    { key: "strength", title: "强度", cell: (r: typeof maskingRules[0]) => <Badge className={cn("text-xs", r.strength === "高" ? "bg-red-500/10 text-red-600" : r.strength === "中" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>{r.strength}</Badge> },
    { key: "example", title: "示例", cell: (r: typeof maskingRules[0]) => <span className="font-mono text-xs text-slate-400">{r.example}</span> },
    { key: "hitCount", title: "命中次数", cell: (r: typeof maskingRules[0]) => <span className="text-xs text-slate-500">{r.hitCount.toLocaleString()}</span> },
    { key: "status", title: "状态", cell: (r: typeof maskingRules[0]) => <StatusTag status={r.status === "active" ? "success" : "disabled"} text={r.status === "active" ? "启用" : "停用"} /> },
  ];

  const taskCols = [
    { key: "id", title: "ID", cell: (t: typeof maskingTasks[0]) => <span className="font-mono text-xs text-slate-500">{t.id}</span> },
    { key: "source", title: "源表", cell: (t: typeof maskingTasks[0]) => <span className="font-mono text-xs text-slate-700">{t.sourceTable}</span> },
    { key: "target", title: "目标表", cell: (t: typeof maskingTasks[0]) => <span className="font-mono text-xs text-slate-500">{t.targetTable}</span> },
    { key: "rules", title: "规则数", cell: (t: typeof maskingTasks[0]) => <span className="text-xs">{t.ruleCount}</span> },
    { key: "processed", title: "处理行数", cell: (t: typeof maskingTasks[0]) => <span className="text-xs text-slate-500">{t.processedRows > 0 ? t.processedRows.toLocaleString() : "-"}</span> },
    { key: "status", title: "状态", cell: (t: typeof maskingTasks[0]) => <StatusTag status={t.status === "completed" ? "success" : t.status === "running" ? "warning" : "info"} text={t.status === "completed" ? "已完成" : t.status === "running" ? "执行中" : "待执行"} /> },
    { key: "startTime", title: "开始时间", cell: (t: typeof maskingTasks[0]) => <span className="text-xs text-slate-500">{t.startTime}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"rules",l:"脱敏规则"},{k:"tasks",l:"脱敏任务"},{k:"preview",l:"脱敏预览"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "rules" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索规则" className="pl-9 w-64" /></div>
          <Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />新建规则</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={ruleCols} data={maskingRules} /></div>
      </div>}

      {activeTab === "tasks" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索任务" className="pl-9 w-64" /></div>
          <Button className="gap-2"><Plus className="w-4 h-4" />新建任务</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={taskCols} data={maskingTasks} /></div>
      </div>}

      {activeTab === "preview" && <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-4 mb-4">
            <select className="h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>user_info</option><option>order_detail</option></select>
            <select className="h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>手机号掩码</option><option>姓名脱敏</option><option>身份证号哈希</option></select>
            <Button><Play className="w-4 h-4 mr-1" />预览</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-2 px-3 text-slate-500">字段</th><th className="text-left py-2 px-3 text-slate-500">原始值</th><th className="text-left py-2 px-3 text-slate-500">脱敏后</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {[{f:"name",o:"张三",m:"张*三"},{f:"phone",o:"13812345678",m:"138****5678"},{f:"id_card",o:"110101199001011234",m:"sha256:a1b2..."},{f:"email",o:"zhangsan@example.com",m:"***@example.com"},{f:"address",o:"北京市海淀区中关村大街1号",m:"北京市***区"}].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50"><td className="py-2 px-3 font-mono text-xs">{r.f}</td><td className="py-2 px-3 text-slate-700">{r.o}</td><td className="py-2 px-3 font-mono text-xs text-primary-600">{r.m}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>}

      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="新建脱敏规则" size="lg">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-slate-700">规则名称</label><Input placeholder="如: 手机号掩码" className="mt-1" /></div>
          <div><label className="text-sm font-medium text-slate-700">字段类型</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>手机号</option><option>姓名</option><option>身份证</option><option>邮箱</option><option>地址</option><option>银行卡</option></select></div>
          <div><label className="text-sm font-medium text-slate-700">脱敏方式</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[{k:"mask",l:"掩码",d:"保留部分信息，中间用*代替"},{k:"hash",l:"哈希",d:"使用哈希函数不可逆转换"},{k:"replace",l:"替换",d:"替换为固定值或模式"},{k:"fuzz",l:"模糊",d:"保留部分精度，模糊化"}].map((m) => (
              <div key={m.k} className="p-3 border rounded-lg hover:border-primary-500 cursor-pointer"><div className="font-medium">{m.l}</div><div className="text-xs text-slate-500">{m.d}</div></div>
            ))}
            </div>
          </div>
          <div><label className="text-sm font-medium text-slate-700">脱敏强度</label><div className="flex gap-3 mt-2"><label className="flex items-center gap-2"><input type="radio" name="strength" />高</label><label className="flex items-center gap-2"><input type="radio" name="strength" defaultChecked />中</label><label className="flex items-center gap-2"><input type="radio" name="strength" />低</label></div></div>
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>保存</Button></div>
        </div>
      </Drawer>
    </div>
  );
}
