import { useState } from "react";
import {
  GitBranch, Plus, Search, CheckCircle2, RotateCcw, FileCode, Tag,
  Eye, Pencil, Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface ContractVersion {
  version: string;
  status: string;
  deployTime: string;
  deployer: string;
  changes: string;
  audit: string;
  size: string;
}

interface Contract {
  id: string;
  name: string;
  versions: ContractVersion[];
}

/* ─── Mock Contract Versions ─── */
const initialContractVersionsData: Contract[] = [
  {
    id: "SC-001",
    name: "数据资产存证合约",
    versions: [
      { version: "v2.0.0", status: "current", deployTime: "2025-04-15", deployer: "管理员", changes: "新增批量存证接口，优化gas消耗", audit: "已通过", size: "12.5KB" },
      { version: "v1.2.0", status: "deprecated", deployTime: "2025-02-10", deployer: "管理员", changes: "修复重入漏洞，增强权限校验", audit: "已通过", size: "11.8KB" },
      { version: "v1.1.0", status: "deprecated", deployTime: "2024-11-20", deployer: "管理员", changes: "增加事件日志，优化存储结构", audit: "已通过", size: "10.2KB" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-08-01", deployer: "管理员", changes: "初始版本，基础存证功能", audit: "已通过", size: "9.1KB" },
    ],
  },
  {
    id: "SC-002",
    name: "数据授权合约",
    versions: [
      { version: "v1.1.0", status: "current", deployTime: "2025-03-20", deployer: "管理员", changes: "支持多级授权与委托，增加授权期限", audit: "已通过", size: "15.3KB" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-09-15", deployer: "管理员", changes: "初始版本，基础授权功能", audit: "已通过", size: "12.1KB" },
    ],
  },
  {
    id: "SC-003",
    name: "数据溯源合约",
    versions: [
      { version: "v1.2.0", status: "current", deployTime: "2025-04-01", deployer: "管理员", changes: "支持跨链溯源查询，优化查询性能", audit: "已通过", size: "18.7KB" },
      { version: "v1.1.0", status: "deprecated", deployTime: "2025-01-10", deployer: "管理员", changes: "增加血缘关系图谱存储", audit: "已通过", size: "16.4KB" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-07-20", deployer: "管理员", changes: "初始版本，基础溯源功能", audit: "已通过", size: "14.2KB" },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    current: { text: "当前版本", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    deprecated: { text: "已废弃", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    pending: { text: "待部署", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.deprecated;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

/* ─── Fields ─── */
const contractFields: FieldConfig[] = [
  { key: "id", label: "合约编号", type: "text", required: true },
  { key: "name", label: "合约名称", type: "text", required: true },
  { key: "versions", label: "版本列表 (JSON)", type: "textarea", required: true, placeholder: '[{"version":"v1.0.0","status":"current","deployTime":"2025-01-01","deployer":"管理员","changes":"...","audit":"已通过","size":"10KB"}]' },
];

const detailFields = [
  { key: "id", label: "合约编号" },
  { key: "name", label: "合约名称" },
  { key: "versionCount", label: "版本数量" },
];

export default function ContractVersions() {
  const [contracts, setContracts] = useState<Contract[]>(initialContractVersionsData);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  const filtered = contracts.filter(c => c.name.includes(search) || c.id.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({ id: "", name: "", versions: "[]" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setDialogMode("edit");
    setDialogData({
      id: contract.id,
      name: contract.name,
      versions: JSON.stringify(contract.versions, null, 2),
    });
    setEditingId(contract.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    setDialogMode("delete");
    setEditingId(contract.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    let parsedVersions: ContractVersion[] = [];
    try {
      parsedVersions = JSON.parse(data.versions || "[]");
    } catch {
      parsedVersions = [];
    }

    if (dialogMode === "create") {
      const newContract: Contract = {
        id: data.id,
        name: data.name,
        versions: parsedVersions,
      };
      setContracts(prev => [...prev, newContract]);
    } else if (dialogMode === "edit" && editingId) {
      setContracts(prev =>
        prev.map(c =>
          c.id === editingId
            ? { ...c, id: data.id, name: data.name, versions: parsedVersions }
            : c
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setContracts(prev => prev.filter(c => c.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (contract: Contract) => {
    setDetailContract(contract);
    setDetailOpen(true);
  };

  const detailData = detailContract
    ? {
        id: detailContract.id,
        name: detailContract.name,
        versionCount: detailContract.versions.length,
      }
    : {};

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约版本管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理智能合约版本迭代，追踪变更历史与审计状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}><Plus className="w-4 h-4" /> 发布新版本</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "合约总数", value: contracts.length, icon: <FileCode className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "当前版本", value: contracts.length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "历史版本", value: contracts.reduce((s, c) => s + c.versions.length - 1, 0), icon: <GitBranch className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "审计通过", value: contracts.reduce((s, c) => s + c.versions.filter(v => v.audit === "已通过").length, 0), icon: <Tag className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索合约名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(contract => (
          <div key={contract.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <div className="px-4 py-3 bg-slate-50 dark:bg-[#273548] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{contract.name}</span>
                <Badge variant="outline">{contract.id}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => openDetail(contract)}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(contract)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(contract)}><Trash className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {["版本", "状态", "部署时间", "部署人", "变更说明", "审计", "大小", "操作"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.versions.map((v, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{v.version}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.deployTime}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.deployer}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{v.changes}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{v.audit}</Badge></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost"><FileCode className="w-4 h-4" /></Button>
                          {v.status === "deprecated" && <Button size="sm" variant="ghost"><RotateCcw className="w-4 h-4" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`合约详情 - ${detailContract?.name || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailContract ? () => handleEdit(detailContract) : undefined}
        onDelete={detailContract ? () => handleDelete(detailContract) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${contracts.find((c) => c.id === editingId)?.name || "合约"}` : "合约"}
        fields={contractFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
