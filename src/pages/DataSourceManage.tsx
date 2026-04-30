import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from "@/components/ActionButtons";
import {
  Search, Plus, Edit3, Trash2, Eye, Database, RefreshCw, Server,
  CheckCircle2, AlertTriangle, XCircle, FileText, HardDrive, FolderOpen,
} from "lucide-react";

type DataSource = {
  id: string;
  name: string;
  type: string;
  host: string;
  status: string;
  tables: number;
  size: string;
  created: string;
  datasets: Dataset[];
};

type Dataset = {
  id: string;
  name: string;
  records: number;
  size: string;
  updated: string;
};

const dataSources: DataSource[] = [
  { id: "DS-001", name: "MySQL主库", type: "MySQL 8.0", host: "mysql.platform.local:3306", status: "connected", tables: 24, size: "2.4GB", created: "2024-01-15", datasets: [
    { id: "SET-001", name: "customers", records: 24000, size: "12MB", updated: "2024-04-15" },
    { id: "SET-002", name: "transactions", records: 1200000, size: "480MB", updated: "2024-04-15" },
  ]},
  { id: "DS-002", name: "PostgreSQL分析库", type: "PostgreSQL 15", host: "pg.platform.local:5432", status: "connected", tables: 18, size: "1.8GB", created: "2024-02-01", datasets: [
    { id: "SET-003", name: "user_events", records: 5600000, size: "1.2GB", updated: "2024-04-14" },
  ]},
  { id: "DS-003", name: "CSV文件存储", type: "文件系统", host: "/data/csv/", status: "connected", tables: 3, size: "156MB", created: "2024-03-10", datasets: [
    { id: "SET-004", name: "sample_data", records: 120000, size: "45MB", updated: "2024-04-13" },
    { id: "SET-005", name: "test_data", records: 50000, size: "18MB", updated: "2024-04-12" },
  ]},
  { id: "DS-004", name: "Oracle遗留系统", type: "Oracle 19c", host: "oracle.bank.local:1521", status: "error", tables: 0, size: "-", created: "2024-01-20", datasets: [] },
];

export default function DataSourceManage() {
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DataSource | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formHost, setFormHost] = useState("");

  const filtered = dataSources.filter(d => d.name.includes(search) || d.id.includes(search));

  const handleAdd = () => {
    setEditMode(false);
    setFormName(""); setFormType("MySQL 8.0"); setFormHost("");
    setFormOpen(true);
  };

  const handleEdit = (ds: DataSource) => {
    setEditMode(true);
    setSelectedSource(ds);
    setFormName(ds.name); setFormType(ds.type); setFormHost(ds.host);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (editMode && selectedSource) {
      selectedSource.name = formName;
      selectedSource.type = formType;
      selectedSource.host = formHost;
    } else {
      dataSources.push({
        id: `DS-${String(dataSources.length + 1).padStart(3, '0')}`,
        name: formName,
        type: formType,
        host: formHost,
        status: "connected",
        tables: 0,
        size: "-",
        created: new Date().toISOString().split('T')[0],
        datasets: [],
      });
    }
    setFormOpen(false);
  };

  const handleDelete = (ds: DataSource) => {
    setDeleteTarget(ds);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      const idx = dataSources.indexOf(deleteTarget);
      if (idx >= 0) dataSources.splice(idx, 1);
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
    setDetailOpen(false);
  };

  const handleDeleteDataset = (source: DataSource, datasetId: string) => {
    const idx = source.datasets.findIndex(d => d.id === datasetId);
    if (idx >= 0) source.datasets.splice(idx, 1);
    source.tables = source.datasets.length;
    // trigger re-render
    setSelectedSource({ ...source });
  };

  const handleAddDataset = (source: DataSource) => {
    source.datasets.push({
      id: `SET-${String(source.datasets.length + 1).padStart(3, '0')}`,
      name: `dataset_${source.datasets.length + 1}`,
      records: 0,
      size: "-",
      updated: new Date().toISOString().split('T')[0],
    });
    source.tables = source.datasets.length;
    setSelectedSource({ ...source });
  };

  const handleRefresh = (ds: DataSource) => {
    ds.status = ds.status === "connected" ? "disconnected" : "connected";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="数据源管理"
        badge={`${dataSources.length} 个数据源`}
        actions={
          <Button className="gap-2" onClick={handleAdd}><Plus className="w-4 h-4" />新建数据源</Button>
        }
      />

      <PageSearchBar
        value={search}
        onChange={setSearch}
        placeholder="搜索数据源..."
        onSearch={() => {}}
        onReset={() => setSearch("")}
      />

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">数据源列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>数据源ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>连接地址</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>表/数据集</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ds => (
                <TableRow key={ds.id}>
                  <TableCell className="font-mono text-xs">{ds.id}</TableCell>
                  <TableCell className="font-medium">{ds.name}</TableCell>
                  <TableCell><Badge variant="outline">{ds.type}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{ds.host}</TableCell>
                  <TableCell>
                    {ds.status === "connected" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已连接</Badge> :
                     <Badge className="bg-red-50 text-red-700 gap-1"><XCircle className="w-3 h-3" />异常</Badge>}
                  </TableCell>
                  <TableCell>{ds.tables}</TableCell>
                  <TableCell>{ds.size}</TableCell>
                  <TableCell>
                    <ActionButtons
                      buttons={[
                        createViewAction(() => { setSelectedSource(ds); setDetailOpen(true); }),
                        createEditAction(() => handleEdit(ds)),
                        {
                          key: "refresh",
                          icon: <RefreshCw className="w-4 h-4" />,
                          label: "刷新",
                          onClick: () => handleRefresh(ds),
                        },
                        createDeleteAction(() => handleDelete(ds)),
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog - high z-index wrapper */}
      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{editMode ? "编辑数据源" : "新建数据源"}</h2>
              <p className="text-sm text-gray-500">配置数据库连接信息</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">数据源名称 <span className="text-red-500">*</span></label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="如：MySQL主库" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">数据库类型 <span className="text-red-500">*</span></label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formType} onChange={e => setFormType(e.target.value)}>
                  <option value="MySQL 8.0">MySQL 8.0</option>
                  <option value="PostgreSQL 15">PostgreSQL 15</option>
                  <option value="Oracle 19c">Oracle 19c</option>
                  <option value="SQL Server 2022">SQL Server 2022</option>
                  <option value="文件系统">文件系统</option>
                  <option value="MongoDB 7.0">MongoDB 7.0</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">连接地址 <span className="text-red-500">*</span></label>
                <Input value={formHost} onChange={e => setFormHost(e.target.value)} placeholder="如：mysql.platform.local:3306" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setFormOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={!formName || !formHost}>保存</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Sheet with Dataset Management */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>数据源详情</SheetTitle>
            <SheetDescription>查看和管理数据源及数据集</SheetDescription>
          </SheetHeader>
          {selectedSource && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">数据源ID</span><span className="text-sm font-mono">{selectedSource.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">名称</span><span className="text-sm font-medium">{selectedSource.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">类型</span><Badge variant="outline">{selectedSource.type}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">连接地址</span><span className="text-sm font-mono">{selectedSource.host}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">状态</span>
                  {selectedSource.status === "connected" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已连接</Badge> :
                   <Badge className="bg-red-50 text-red-700 gap-1"><XCircle className="w-3 h-3" />异常</Badge>}
                </div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">创建时间</span><span className="text-sm">{selectedSource.created}</span></div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">数据集管理</h3>
                  <Button size="sm" className="gap-1" onClick={() => handleAddDataset(selectedSource)}><Plus className="w-3 h-3" />添加</Button>
                </div>
                {selectedSource.datasets.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">暂无数据集</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>记录数</TableHead><TableHead>大小</TableHead><TableHead>操作</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSource.datasets.map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-xs">{d.id}</TableCell>
                          <TableCell className="font-medium text-xs">{d.name}</TableCell>
                          <TableCell>{d.records.toLocaleString()}</TableCell>
                          <TableCell>{d.size}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteDataset(selectedSource, d.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => handleEdit(selectedSource)}><Edit3 className="w-4 h-4" />编辑</Button>
                <Button variant="outline" className="gap-2 text-red-500" onClick={() => handleDelete(selectedSource)}><Trash2 className="w-4 h-4" />删除</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-2">确认删除</h2>
            <p className="text-sm text-gray-500 mb-4">删除数据源 "{deleteTarget?.name}" 后将无法恢复，确认继续？</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={confirmDelete}>确认删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
