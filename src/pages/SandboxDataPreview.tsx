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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, RefreshCw, Download, Trash2, Edit3, Eye, Shield,
  Plus, Database, FileSpreadsheet, Settings, Filter,
} from "lucide-react";

const dataSources = [
  { id: "DS-001", name: "零售交易数据", type: "MySQL", tables: 12, records: "2.4M", updated: "2024-04-15" },
  { id: "DS-002", name: "客户画像数据", type: "PostgreSQL", tables: 8, records: "850K", updated: "2024-04-14" },
  { id: "DS-003", name: "风控样本数据", type: "CSV", tables: 3, records: "120K", updated: "2024-04-13" },
];

const sampleData = [
  { id: 1, name: "张三", age: 28, city: "北京", income: 15000, gender: "男", isSensitive: false },
  { id: 2, name: "李四", age: 35, city: "上海", income: 22000, gender: "女", isSensitive: true },
  { id: 3, name: "王五", age: 42, city: "广州", income: 18000, gender: "男", isSensitive: false },
  { id: 4, name: "赵六", age: 31, city: "深圳", income: 25000, gender: "女", isSensitive: true },
  { id: 5, name: "孙七", age: 26, city: "成都", income: 12000, gender: "男", isSensitive: false },
  { id: 6, name: "周八", age: 38, city: "杭州", income: 30000, gender: "女", isSensitive: true },
];

const columnsMeta = [
  { name: "id", type: "int", label: "ID", nullable: false, sensitive: false },
  { name: "name", type: "varchar", label: "姓名", nullable: false, sensitive: true },
  { name: "age", type: "int", label: "年龄", nullable: true, sensitive: false },
  { name: "city", type: "varchar", label: "城市", nullable: true, sensitive: false },
  { name: "income", type: "decimal", label: "收入", nullable: true, sensitive: true },
  { name: "gender", type: "varchar", label: "性别", nullable: true, sensitive: false },
  { name: "isSensitive", type: "boolean", label: "敏感标记", nullable: false, sensitive: false },
];

const tableList = [
  { id: "T-001", name: "customers", records: 24000, size: "12MB", updated: "2024-04-15" },
  { id: "T-002", name: "transactions", records: 1200000, size: "480MB", updated: "2024-04-15" },
  { id: "T-003", name: "products", records: 5600, size: "2.4MB", updated: "2024-04-14" },
  { id: "T-004", name: "orders", records: 890000, size: "320MB", updated: "2024-04-14" },
];

export default function SandboxDataPreview() {
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("DS-001");
  const [selectedTable, setSelectedTable] = useState("T-001");
  const [activeTab, setActiveTab] = useState("preview");
  const [editColOpen, setEditColOpen] = useState(false);
  const [editCol, setEditCol] = useState<any>(null);
  const [colLabel, setColLabel] = useState("");
  const [colSensitive, setColSensitive] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const currentSource = dataSources.find(d => d.id === selectedSource);

  const handleEditColumn = (col: any) => {
    setEditCol(col);
    setColLabel(col.label);
    setColSensitive(col.sensitive);
    setEditColOpen(true);
  };

  const handleSaveColumn = () => {
    if (editCol) {
      editCol.label = colLabel;
      editCol.sensitive = colSensitive;
    }
    setEditColOpen(false);
  };

  const handleDeleteTable = (table: any) => {
    setDeleteTarget(table);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    // 实际删除逻辑
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据探查</h1>
          <p className="text-sm text-gray-500 mt-1">浏览数据源、预览数据内容、管理表结构</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" />刷新</Button>
          <Button className="gap-2" onClick={() => setExportOpen(true)}><Download className="w-4 h-4" />导出</Button>
        </div>
      </div>

      {/* Data Source Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-64">
            <Database className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map(ds => (
              <SelectItem key={ds.id} value={ds.id}>{ds.name} ({ds.type})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveTab("tables")}>
          <FileSpreadsheet className="w-4 h-4" />管理数据源
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4" />数据预览</TabsTrigger>
          <TabsTrigger value="tables" className="gap-2"><FileSpreadsheet className="w-4 h-4" />表管理</TabsTrigger>
          <TabsTrigger value="columns" className="gap-2"><Settings className="w-4 h-4" />字段管理</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">数据预览</CardTitle>
                <Badge variant="outline">{currentSource?.name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnsMeta.map(col => (
                        <TableHead key={col.name} className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {col.label}
                            {col.sensitive && <Shield className="w-3 h-3 text-red-400" />}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleData.map(row => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>{row.city}</TableCell>
                        <TableCell className="font-mono text-xs">{row.income}</TableCell>
                        <TableCell>{row.gender}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={row.isSensitive ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>
                            {row.isSensitive ? "敏感" : "正常"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索表名..." className="pl-9" />
            </div>
            <Button className="gap-2"><Plus className="w-4 h-4" />新建表</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数据表列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>表ID</TableHead><TableHead>表名</TableHead><TableHead>记录数</TableHead><TableHead>大小</TableHead><TableHead>更新时间</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {tableList.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.records.toLocaleString()}</TableCell>
                      <TableCell>{t.size}</TableCell>
                      <TableCell className="text-xs text-gray-500">{t.updated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTable(t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="columns" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">字段管理</CardTitle>
                <Button variant="outline" size="sm" className="gap-2"><Plus className="w-4 h-4" />添加字段</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>字段名</TableHead><TableHead>显示名称</TableHead><TableHead>数据类型</TableHead><TableHead>可空</TableHead><TableHead>敏感字段</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {columnsMeta.map(col => (
                    <TableRow key={col.name}>
                      <TableCell className="font-mono text-xs">{col.name}</TableCell>
                      <TableCell>{col.label}</TableCell>
                      <TableCell><Badge variant="outline">{col.type}</Badge></TableCell>
                      <TableCell>{col.nullable ? "是" : "否"}</TableCell>
                      <TableCell>
                        <Badge className={col.sensitive ? "bg-red-50 text-red-700 gap-1" : "bg-gray-50 text-gray-700"}>
                          {col.sensitive ? <><Shield className="w-3 h-3" />敏感</> : "正常"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditColumn(col)}><Edit3 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Column Dialog */}
      <Dialog open={editColOpen} onOpenChange={setEditColOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>编辑字段</DialogTitle>
            <DialogDescription>修改字段显示名称和敏感标记</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">字段名</label>
              <Input value={editCol?.name || ""} disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">显示名称</label>
              <Input value={colLabel} onChange={e => setColLabel(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sensitive" checked={colSensitive} onChange={e => setColSensitive(e.target.checked)} />
              <label htmlFor="sensitive" className="text-sm">标记为敏感字段</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditColOpen(false)}>取消</Button>
            <Button onClick={handleSaveColumn}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>导出数据</DialogTitle>
            <DialogDescription>选择导出格式</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="parquet">Parquet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
            <Button onClick={() => setExportOpen(false)}>导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>删除表 {deleteTarget?.name} 后不可恢复，确认继续？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
