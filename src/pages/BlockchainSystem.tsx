import { useState } from "react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  Lock,
  Fingerprint,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Save,
  Eye,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
type User = {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  lastLogin: string;
  org: string;
};

type Role = {
  id: string;
  name: string;
  desc: string;
  permissions: string[];
  userCount: number;
};

/* ─── Mock Data ─── */
const initialUsers: User[] = [
  { id: "U001", name: "管理员", username: "admin", role: "系统管理员", status: "active", lastLogin: "2025-04-22 14:30:00", org: "运营中心" },
  { id: "U002", name: "张三", username: "zhangsan", role: "节点管理员", status: "active", lastLogin: "2025-04-22 13:15:00", org: "技术部" },
  { id: "U003", name: "李四", username: "lisi", role: "合约开发者", status: "active", lastLogin: "2025-04-22 11:20:00", org: "研发部" },
  { id: "U004", name: "王五", username: "wangwu", role: "审计员", status: "active", lastLogin: "2025-04-21 18:00:00", org: "风控部" },
  { id: "U005", name: "赵六", username: "zhaoliu", role: "普通用户", status: "inactive", lastLogin: "2025-04-20 09:00:00", org: "业务部" },
  { id: "U006", name: "孙七", username: "sunqi", role: "运维工程师", status: "active", lastLogin: "2025-04-22 10:00:00", org: "运维部" },
  { id: "U007", name: "周八", username: "zhouba", role: "合约开发者", status: "active", lastLogin: "2025-04-21 16:30:00", org: "研发部" },
  { id: "U008", name: "吴九", username: "wujiu", role: "节点管理员", status: "active", lastLogin: "2025-04-21 09:45:00", org: "技术部" },
  { id: "U009", name: "郑十", username: "zhengshi", role: "普通用户", status: "locked", lastLogin: "2025-04-19 14:00:00", org: "业务部" },
  { id: "U010", name: "钱十一", username: "qianshiyi", role: "审计员", status: "active", lastLogin: "2025-04-22 08:20:00", org: "风控部" },
  { id: "U011", name: "陈十二", username: "chenshier", role: "运维工程师", status: "pending", lastLogin: "-", org: "运维部" },
  { id: "U012", name: "刘十三", username: "liushisan", role: "普通用户", status: "terminated", lastLogin: "2025-03-01 10:00:00", org: "业务部" },
];

const initialRoles: Role[] = [
  { id: "R001", name: "系统管理员", desc: "拥有所有权限", permissions: ["用户管理", "节点管理", "合约管理", "系统配置", "审计查看"], userCount: 1 },
  { id: "R002", name: "节点管理员", desc: "管理区块链节点", permissions: ["节点管理", "监控查看", "告警处理"], userCount: 2 },
  { id: "R003", name: "合约开发者", desc: "开发和部署智能合约", permissions: ["合约开发", "合约部署", "合约调用"], userCount: 2 },
  { id: "R004", name: "审计员", desc: "查看审计日志和监控", permissions: ["审计查看", "日志查看", "监控查看"], userCount: 1 },
  { id: "R005", name: "普通用户", desc: "基本查询权限", permissions: ["浏览器查看", "交易查询"], userCount: 3 },
];

const operationLogs = [
  { id: "LOG-001", user: "管理员", action: "修改共识参数", target: "共识配置", result: "success", time: "2025-04-22 14:30:00", ip: "192.168.1.100" },
  { id: "LOG-002", user: "张三", action: "重启节点", target: "共识节点-02", result: "success", time: "2025-04-22 13:15:00", ip: "192.168.1.101" },
  { id: "LOG-003", user: "李四", action: "部署合约", target: "DataSharing", result: "success", time: "2025-04-22 11:20:00", ip: "192.168.1.102" },
  { id: "LOG-004", user: "王五", action: "导出审计日志", target: "审计日志", result: "success", time: "2025-04-22 10:00:00", ip: "192.168.1.103" },
  { id: "LOG-005", user: "赵六", action: "登录失败", target: "系统", result: "failed", time: "2025-04-22 09:30:00", ip: "192.168.1.200" },
];

const userFields: FieldConfig[] = [
  { key: "id", label: "用户ID", type: "text", required: true, placeholder: "请输入用户ID" },
  { key: "name", label: "姓名", type: "text", required: true, placeholder: "请输入姓名" },
  { key: "username", label: "账号", type: "text", required: true, placeholder: "请输入账号" },
  { key: "role", label: "角色", type: "select", required: true, options: [
    { label: "系统管理员", value: "系统管理员" },
    { label: "节点管理员", value: "节点管理员" },
    { label: "合约开发者", value: "合约开发者" },
    { label: "审计员", value: "审计员" },
    { label: "普通用户", value: "普通用户" },
    { label: "运维工程师", value: "运维工程师" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "启用", value: "active" },
    { label: "禁用", value: "inactive" },
    { label: "锁定", value: "locked" },
    { label: "待审核", value: "pending" },
    { label: "已注销", value: "terminated" },
  ]},
  { key: "lastLogin", label: "最后登录", type: "text", placeholder: "YYYY-MM-DD HH:mm:ss" },
  { key: "org", label: "组织", type: "text", placeholder: "请输入组织" },
];

const roleFields: FieldConfig[] = [
  { key: "id", label: "角色ID", type: "text", required: true, placeholder: "请输入角色ID" },
  { key: "name", label: "角色名称", type: "text", required: true, placeholder: "请输入角色名称" },
  { key: "desc", label: "描述", type: "textarea", placeholder: "请输入描述" },
];

const userDetailFields = [
  { key: "id", label: "用户ID", type: "text" as const },
  { key: "name", label: "姓名", type: "text" as const },
  { key: "username", label: "账号", type: "text" as const },
  { key: "role", label: "角色", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "lastLogin", label: "最后登录", type: "date" as const },
  { key: "org", label: "组织", type: "text" as const },
];

/* ─── User Management Tab ─── */
function UserManagement() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = users.filter((u) => u.name.includes(search) || u.username.includes(search));

  const handleCreate = () => {
    setSelectedUser(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      setUsers([...users, data as User]);
    } else if (dialogMode === "edit" && selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? (data as User) : u)));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="搜索用户..." value={search} onChange={(e) => setSearch(e.target.value)} className={cn("w-full pl-9 pr-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
        </div>
        <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Plus className="w-3.5 h-3.5" />
          添加用户
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
              <th className="text-left py-3 px-3 font-medium text-xs">用户ID</th>
              <th className="text-left py-3 px-3 font-medium text-xs">姓名</th>
              <th className="text-left py-3 px-3 font-medium text-xs">账号</th>
              <th className="text-left py-3 px-3 font-medium text-xs">角色</th>
              <th className="text-left py-3 px-3 font-medium text-xs">组织</th>
              <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
              <th className="text-left py-3 px-3 font-medium text-xs">最后登录</th>
              <th className="text-center py-3 px-3 font-medium text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                <td className="py-3 px-3 font-mono text-xs text-slate-500">{u.id}</td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{u.name}</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{u.username}</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{u.role}</span></td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{u.org}</td>
                <td className="py-3 px-3 text-center">
                  {u.status === "active" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-red-500 inline" />}
                </td>
                <td className="py-3 px-3 text-xs text-slate-500">{u.lastLogin}</td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleView(u)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#334155]">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => handleEdit(u)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#334155]">
                      <Edit className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => handleDelete(u)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#334155]">
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${selectedUser?.name || ""}` : "用户"}
        fields={userFields}
        data={selectedUser || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="用户详情"
        data={selectedUser || {}}
        fields={userDetailFields}
        onEdit={() => { if (selectedUser) { setDrawerOpen(false); handleEdit(selectedUser); } }}
        onDelete={() => { if (selectedUser) { setDrawerOpen(false); handleDelete(selectedUser); } }}
      />
    </div>
  );
}

/* ─── Role Management Tab ─── */
function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleCreate = () => {
    setSelectedRole(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      setRoles([...roles, { ...(data as Role), permissions: data.permissions ? String(data.permissions).split(",").map((s: string) => s.trim()) : [], userCount: 0 }]);
    } else if (dialogMode === "edit" && selectedRole) {
      setRoles(roles.map((r) => (r.id === selectedRole.id ? { ...(data as Role), permissions: data.permissions ? String(data.permissions).split(",").map((s: string) => s.trim()) : selectedRole.permissions, userCount: selectedRole.userCount } : r)));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedRole) {
      setRoles(roles.filter((r) => r.id !== selectedRole.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Plus className="w-3.5 h-3.5" />
          创建角色
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.id} className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.name}</div>
                  <div className="text-[10px] text-slate-500">{r.userCount} 个用户</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(r)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#334155]"><Edit className="w-3.5 h-3.5 text-slate-400" /></button>
                <button onClick={() => handleDelete(r)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#334155]"><Trash2 className="w-3.5 h-3.5 text-slate-400" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2">{r.desc}</p>
            <div className="flex flex-wrap gap-1">
              {r.permissions.map((p) => (
                <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-400">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${selectedRole?.name || ""}` : "角色"}
        fields={roleFields}
        data={selectedRole || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />
    </div>
  );
}

/* ─── Operation Logs Tab ─── */
function OperationLogs() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="搜索操作记录..." className={cn("w-full pl-9 pr-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
        </div>
        <button className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 dark:border-[#334155] dark:text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          导出
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
              <th className="text-left py-3 px-3 font-medium text-xs">日志ID</th>
              <th className="text-left py-3 px-3 font-medium text-xs">用户</th>
              <th className="text-left py-3 px-3 font-medium text-xs">操作</th>
              <th className="text-left py-3 px-3 font-medium text-xs">对象</th>
              <th className="text-center py-3 px-3 font-medium text-xs">结果</th>
              <th className="text-left py-3 px-3 font-medium text-xs">IP地址</th>
              <th className="text-left py-3 px-3 font-medium text-xs">时间</th>
            </tr>
          </thead>
          <tbody>
            {operationLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                <td className="py-3 px-3 font-mono text-xs text-slate-500">{log.id}</td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{log.user}</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{log.action}</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{log.target}</td>
                <td className="py-3 px-3 text-center">
                  {log.result === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-red-500 inline" />}
                </td>
                <td className="py-3 px-3 font-mono text-xs text-slate-500">{log.ip}</td>
                <td className="py-3 px-3 text-xs text-slate-500">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Access Control Tab ─── */
function AccessControl() {
  const [acls, setAcls] = useState([
    { id: "ACL-001", resource: "共识配置", role: "系统管理员", action: "读写", status: "active" },
    { id: "ACL-002", resource: "节点管理", role: "节点管理员", action: "读写", status: "active" },
    { id: "ACL-003", resource: "合约部署", role: "合约开发者", action: "读写", status: "active" },
    { id: "ACL-004", resource: "审计日志", role: "审计员", action: "只读", status: "active" },
    { id: "ACL-005", resource: "浏览器", role: "普通用户", action: "只读", status: "active" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Plus className="w-3.5 h-3.5" />
          添加策略
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
              <th className="text-left py-3 px-3 font-medium text-xs">策略ID</th>
              <th className="text-left py-3 px-3 font-medium text-xs">资源</th>
              <th className="text-left py-3 px-3 font-medium text-xs">角色</th>
              <th className="text-left py-3 px-3 font-medium text-xs">操作权限</th>
              <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
              <th className="text-center py-3 px-3 font-medium text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {acls.map((acl) => (
              <tr key={acl.id} className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]">
                <td className="py-3 px-3 font-mono text-xs text-slate-500">{acl.id}</td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{acl.resource}</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{acl.role}</span></td>
                <td className="py-3 px-3"><span className={cn("px-2 py-0.5 rounded-full text-[10px]", acl.action === "读写" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30" : "bg-slate-50 text-slate-600 dark:bg-[#334155]")}>{acl.action}</span></td>
                <td className="py-3 px-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /></td>
                <td className="py-3 px-3 text-center"><button className="text-xs text-primary-600">编辑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Security Config Tab ─── */
function SecurityConfig() {
  const [configs, setConfigs] = useState({
    passwordMinLength: 8,
    passwordComplexity: "中高",
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    mfaEnabled: true,
    encryption: "SM2/SM3/SM4",
    tlsVersion: "TLS 1.3",
    certValidity: 365,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3.5 h-3.5" />
          保存配置
        </button>
      </div>

      {/* Password Policy */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          密码策略
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "最小密码长度", value: configs.passwordMinLength, key: "passwordMinLength" },
            { label: "密码复杂度", value: configs.passwordComplexity, key: "passwordComplexity" },
            { label: "会话超时(分钟)", value: configs.sessionTimeout, key: "sessionTimeout" },
            { label: "最大登录尝试次数", value: configs.maxLoginAttempts, key: "maxLoginAttempts" },
            { label: "锁定持续时间(分钟)", value: configs.lockoutDuration, key: "lockoutDuration" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input type="text" defaultValue={f.value} className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
            </div>
          ))}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">多因素认证(MFA)</label>
            <select defaultValue={configs.mfaEnabled ? "启用" : "禁用"} className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
              <option>启用</option>
              <option>禁用</option>
            </select>
          </div>
        </div>
      </div>

      {/* Encryption */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Fingerprint className="w-3.5 h-3.5" />
          加密与证书策略
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "加密算法", value: configs.encryption, key: "encryption" },
            { label: "TLS版本", value: configs.tlsVersion, key: "tlsVersion" },
            { label: "证书有效期(天)", value: configs.certValidity, key: "certValidity" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input type="text" defaultValue={f.value} className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainSystem() {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "logs" | "access" | "security">("users");

  const tabs = [
    { key: "users" as const, label: "用户管理", icon: <Users className="w-4 h-4" /> },
    { key: "roles" as const, label: "角色管理", icon: <KeyRound className="w-4 h-4" /> },
    { key: "logs" as const, label: "操作记录", icon: <FileText className="w-4 h-4" /> },
    { key: "access" as const, label: "访问控制", icon: <Lock className="w-4 h-4" /> },
    { key: "security" as const, label: "安全配置", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">系统管理</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">用户管理、角色管理、权限模块、操作记录、访问控制与安全配置</p>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="flex border-b border-slate-200 dark:border-[#334155]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3 text-sm transition-colors border-b-2",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-600 font-medium bg-primary-50/50 dark:bg-primary-900/10"
                  : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === "users" && <UserManagement />}
          {activeTab === "roles" && <RoleManagement />}
          {activeTab === "logs" && <OperationLogs />}
          {activeTab === "access" && <AccessControl />}
          {activeTab === "security" && <SecurityConfig />}
        </div>
      </div>
    </div>
  );
}
