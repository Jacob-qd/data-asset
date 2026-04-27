import { useState } from "react";
import { BookOpen, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { cn } from "@/lib/utils";

const operationLogs = [
  { id: "OL-001", time: "2026-04-21 10:30:00", operation: "任务创建", operator: "张三", target: "task-001", project: "联合风控", ip: "10.0.1.5", status: "success", detail: "创建MPC联合训练任务" },
  { id: "OL-002", time: "2026-04-21 10:15:00", operation: "数据访问", operator: "系统", target: "ds-001", project: "医疗数据", ip: "10.0.1.10", status: "success", detail: "参与方访问数据源" },
  { id: "OL-003", time: "2026-04-21 09:45:00", operation: "配置变更", operator: "李四", target: "cfg-003", project: "跨机构统计", ip: "10.0.1.6", status: "success", detail: "修改隐私预算参数" },
  { id: "OL-004", time: "2026-04-21 09:30:00", operation: "参与方添加", operator: "王五", target: "party-004", project: "供应链协同", ip: "10.0.1.7", status: "success", detail: "添加新参与方" },
  { id: "OL-005", time: "2026-04-21 09:00:00", operation: "任务执行", operator: "系统", target: "task-002", project: "联合风控", ip: "10.0.1.10", status: "success", detail: "任务开始执行" },
  { id: "OL-006", time: "2026-04-20 18:00:00", operation: "结果导出", operator: "赵六", target: "res-001", project: "身份验证", ip: "10.0.1.8", status: "success", detail: "导出计算结果" },
  { id: "OL-007", time: "2026-04-20 16:30:00", operation: "任务删除", operator: "钱七", target: "task-005", project: "图像识别", ip: "10.0.1.9", status: "failure", detail: "权限不足" },
  { id: "OL-008", time: "2026-04-20 14:00:00", operation: "任务创建", operator: "孙八", target: "task-008", project: "推荐引擎", ip: "10.0.1.5", status: "success", detail: "创建HE训练任务" },
  { id: "OL-009", time: "2026-04-20 12:00:00", operation: "配置变更", operator: "周九", target: "cfg-005", project: "基因计算", ip: "10.0.1.6", status: "success", detail: "更新加密参数" },
  { id: "OL-010", time: "2026-04-20 10:00:00", operation: "数据访问", operator: "系统", target: "ds-003", project: "风控建模", ip: "10.0.1.10", status: "success", detail: "读取用户数据" },
  { id: "OL-011", time: "2026-04-19 16:00:00", operation: "参与方添加", operator: "吴十", target: "party-006", project: "跨机构统计", ip: "10.0.1.7", status: "failure", detail: "公钥验证失败" },
  { id: "OL-012", time: "2026-04-19 14:00:00", operation: "任务创建", operator: "郑一", target: "task-010", project: "供应链", ip: "10.0.1.5", status: "success", detail: "创建MPC统计任务" },
];

const systemLogs = [
  { id: "SL-001", time: "2026-04-21 10:30:00", component: "调度器", level: "INFO", message: "任务 task-001 调度成功" },
  { id: "SL-002", time: "2026-04-21 10:28:00", component: "执行器", level: "INFO", message: "节点 Node-A 任务执行完成" },
  { id: "SL-003", time: "2026-04-21 10:25:00", component: "网络", level: "WARN", message: "节点 Node-C 网络延迟 150ms" },
  { id: "SL-004", time: "2026-04-21 10:20:00", component: "存储", level: "INFO", message: "数据分片写入完成" },
  { id: "SL-005", time: "2026-04-21 10:15:00", component: "调度器", level: "ERROR", message: "任务 task-003 调度失败: 资源不足" },
  { id: "SL-006", time: "2026-04-21 10:10:00", component: "执行器", level: "INFO", message: "节点 Node-B 开始执行计算" },
  { id: "SL-007", time: "2026-04-21 10:05:00", component: "网络", level: "INFO", message: "所有节点网络连接正常" },
  { id: "SL-008", time: "2026-04-21 10:00:00", component: "存储", level: "WARN", message: "磁盘使用率超过 80%" },
  { id: "SL-009", time: "2026-04-21 09:55:00", component: "调度器", level: "INFO", message: "资源分配完成" },
  { id: "SL-010", time: "2026-04-21 09:50:00", component: "执行器", level: "DEBUG", message: "加密计算中间值: 0.234" },
];

export default function PrivacyAuditLog() {
  const [activeTab, setActiveTab] = useState<"operation" | "system" | "report">("operation");
  const [logFilter, setLogFilter] = useState("ALL");
  const [sysFilter, setSysFilter] = useState("ALL");

  const filteredOps = logFilter === "ALL" ? operationLogs : operationLogs.filter((l) => l.status.toUpperCase() === logFilter);
  const filteredSys = sysFilter === "ALL" ? systemLogs : systemLogs.filter((l) => l.level === sysFilter);

  const opCols = [
    { key: "time", title: "时间", cell: (l: typeof operationLogs[0]) => <span className="text-xs text-slate-500 font-mono">{l.time}</span> },
    { key: "operation", title: "操作", cell: (l: typeof operationLogs[0]) => <Badge className={cn("text-xs", l.operation === "任务创建" ? "bg-blue-500/10 text-blue-600" : l.operation === "数据访问" ? "bg-purple-500/10 text-purple-600" : l.operation === "配置变更" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>{l.operation}</Badge> },
    { key: "operator", title: "操作者", cell: (l: typeof operationLogs[0]) => <span className="text-xs text-slate-700">{l.operator}</span> },
    { key: "target", title: "目标", cell: (l: typeof operationLogs[0]) => <span className="font-mono text-xs text-slate-500">{l.target}</span> },
    { key: "project", title: "项目", cell: (l: typeof operationLogs[0]) => <span className="text-xs text-slate-500">{l.project}</span> },
    { key: "status", title: "状态", cell: (l: typeof operationLogs[0]) => <StatusTag status={l.status === "success" ? "success" : "danger"} text={l.status === "success" ? "成功" : "失败"} /> },
    { key: "detail", title: "详情", cell: (l: typeof operationLogs[0]) => <span className="text-xs text-slate-500 truncate max-w-[200px]">{l.detail}</span> },
  ];

  const sysCols = [
    { key: "time", title: "时间", cell: (l: typeof systemLogs[0]) => <span className="text-xs text-slate-500 font-mono">{l.time}</span> },
    { key: "component", title: "组件", cell: (l: typeof systemLogs[0]) => <Badge variant="outline" className="text-xs">{l.component}</Badge> },
    { key: "level", title: "级别", cell: (l: typeof systemLogs[0]) => <Badge className={cn("text-xs", l.level === "ERROR" ? "bg-red-500/10 text-red-600" : l.level === "WARN" ? "bg-amber-500/10 text-amber-600" : l.level === "INFO" ? "bg-blue-500/10 text-blue-600" : "bg-slate-100 text-slate-500")}>{l.level}</Badge> },
    { key: "message", title: "消息", cell: (l: typeof systemLogs[0]) => <span className="text-xs text-slate-700">{l.message}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"operation",l:"操作日志"},{k:"system",l:"系统日志"},{k:"report",l:"审计报表"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "operation" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="搜索日志" className="pl-9 w-64" /></div>
            <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm"><option value="ALL">全部</option><option value="SUCCESS">成功</option><option value="FAILURE">失败</option></select>
          </div>
          <Button variant="outline" size="sm" className="gap-1"><Download className="w-3.5 h-3.5" />导出</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={opCols} data={filteredOps} /></div>
      </div>}

      {activeTab === "system" && <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {["ALL", "ERROR", "WARN", "INFO", "DEBUG"].map((l) => (
              <button key={l} onClick={() => setSysFilter(l)} className={"px-3 py-1.5 rounded-md text-xs font-medium transition-colors " + (sysFilter === l ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>{l === "ALL" ? "全部" : l}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1"><Download className="w-3.5 h-3.5" />导出</Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={sysCols} data={filteredSys} /></div>
      </div>}

      {activeTab === "report" && <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">操作类型分布</h3><div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">操作统计图表</div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-700 mb-4">操作者活跃度</h3><div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">活跃度热力图</div></div>
      </div>}
    </div>
  );
}
