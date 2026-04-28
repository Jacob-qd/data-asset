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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, RefreshCw, Download, Trash2, Edit3, Eye, Shield,
  Plus, Database, FileSpreadsheet, Settings, Filter,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface DataSource {
  id: string;
  name: string;
  type: string;
  tables: number;
  records: string;
  updated: string;
}

interface SampleRow {
  id: number;
  name: string;
  age: number;
  city: string;
  income: number;
  gender: string;
  isSensitive: boolean;
}

interface ColumnMeta {
  name: string;
  type: string;
  label: string;
  nullable: boolean;
  sensitive: boolean;
}

interface TableItem {
  id: string;
  name: string;
  records: number;
  size: string;
  updated: string;
}

const initialDataSources: DataSource[] = [
  { id: "DS-001", name: "零售交易数据", type: "MySQL", tables: 12, records: "2.4M", updated: "2024-04-15" },
  { id: "DS-002", name: "客户画像数据", type: "PostgreSQL", tables: 8, records: "850K", updated: "2024-04-14" },
  { id: "DS-003", name: "风控样本数据", type: "CSV", tables: 3, records: "120K", updated: "2024-04-13" },
  { id: "DS-004", name: "供应链数据", type: "Oracle", tables: 15, records: "5.1M", updated: "2024-04-12" },
  { id: "DS-005", name: "用户行为日志", type: "Excel", tables: 1, records: "3.2M", updated: "2024-04-11" },
  { id: "DS-006", name: "财务报表数据", type: "MySQL", tables: 20, records: "1.8M", updated: "2024-04-10" },
  { id: "DS-007", name: "产品库存数据", type: "PostgreSQL", tables: 6, records: "420K", updated: "2024-04-09" },
  { id: "DS-008", name: "营销活动数据", type: "CSV", tables: 2, records: "680K", updated: "2024-04-08" },
  { id: "DS-009", name: "客服工单数据", type: "MySQL", tables: 10, records: "960K", updated: "2024-04-07" },
  { id: "DS-010", name: "设备监控数据", type: "Oracle", tables: 18, records: "8.5M", updated: "2024-04-06" },
];

const initialSampleData: SampleRow[] = [
  { id: 1, name: "张三", age: 28, city: "北京", income: 15000, gender: "男", isSensitive: false },
  { id: 2, name: "李四", age: 35, city: "上海", income: 22000, gender: "女", isSensitive: true },
  { id: 3, name: "王五", age: 42, city: "广州", income: 18000, gender: "男", isSensitive: false },
  { id: 4, name: "赵六", age: 31, city: "深圳", income: 25000, gender: "女", isSensitive: true },
  { id: 5, name: "孙七", age: 26, city: "成都", income: 12000, gender: "男", isSensitive: false },
  { id: 6, name: "周八", age: 38, city: "杭州", income: 30000, gender: "女", isSensitive: true },
  { id: 7, name: "吴九", age: 29, city: "南京", income: 18500, gender: "男", isSensitive: false },
  { id: 8, name: "郑十", age: 33, city: "武汉", income: 21000, gender: "女", isSensitive: true },
  { id: 9, name: "钱十一", age: 45, city: "西安", income: 28000, gender: "男", isSensitive: false },
  { id: 10, name: "冯十二", age: 27, city: "重庆", income: 16500, gender: "女", isSensitive: true },
  { id: 11, name: "陈十三", age: 36, city: "天津", income: 24000, gender: "男", isSensitive: false },
  { id: 12, name: "褚十四", age: 30, city: "苏州", income: 19500, gender: "女", isSensitive: true },
];

const initialColumnsMeta: ColumnMeta[] = [
  { name: "id", type: "int", label: "ID", nullable: false, sensitive: false },
  { name: "name", type: "varchar", label: "姓名", nullable: false, sensitive: true },
  { name: "age", type: "int", label: "年龄", nullable: true, sensitive: false },
  { name: "city", type: "varchar", label: "城市", nullable: true, sensitive: false },
  { name: "income", type: "decimal", label: "收入", nullable: true, sensitive: true },
  { name: "gender", type: "varchar", label: "性别", nullable: true, sensitive: false },
  { name: "isSensitive", type: "boolean", label: "敏感标记", nullable: false, sensitive: false },
  { name: "phone", type: "varchar", label: "手机号", nullable: true, sensitive: true },
  { name: "email", type: "varchar", label: "邮箱", nullable: true, sensitive: true },
  { name: "registerDate", type: "date", label: "注册日期", nullable: true, sensitive: false },
  { name: "vipLevel", type: "int", label: "VIP等级", nullable: true, sensitive: false },
  { name: "creditScore", type: "decimal", label: "信用分", nullable: true, sensitive: false },
];

const initialTableList: TableItem[] = [
  { id: "T-001", name: "customers", records: 24000, size: "12MB", updated: "2024-04-15" },
  { id: "T-002", name: "transactions", records: 1200000, size: "480MB", updated: "2024-04-15" },
  { id: "T-003", name: "products", records: 5600, size: "2.4MB", updated: "2024-04-14" },
  { id: "T-004", name: "orders", records: 890000, size: "320MB", updated: "2024-04-14" },
  { id: "T-005", name: "inventory", records: 45000, size: "18MB", updated: "2024-04-13" },
  { id: "T-006", name: "suppliers", records: 1200, size: "0.8MB", updated: "2024-04-13" },
  { id: "T-007", name: "categories", records: 80, size: "0.1MB", updated: "2024-04-12" },
  { id: "T-008", name: "reviews", records: 350000, size: "95MB", updated: "2024-04-12" },
  { id: "T-009", name: "shipments", records: 890000, size: "210MB", updated: "2024-04-11" },
  { id: "T-010", name: "promotions", records: 500, size: "0.3MB", updated: "2024-04-11" },
];

const dsFields: FieldConfig[] = [
  { key: "name", label: "数据源名称", type: "text", required: true },
  {
    key: "type", label: "类型", type: "select", required: true, options: [
      { label: "MySQL", value: "MySQL" },
      { label: "PostgreSQL", value: "PostgreSQL" },
      { label: "CSV", value: "CSV" },
      { label: "Excel", value: "Excel" },
      { label: "Oracle", value: "Oracle" },
    ],
  },
  { key: "tables", label: "表数量", type: "number" },
  { key: "records", label: "记录数", type: "text" },
  { key: "updated", label: "更新时间", type: "text", placeholder: "YYYY-MM-DD" },
];

const tableFields: FieldConfig[] = [
  { key: "name", label: "表名", type: "text", required: true },
  { key: "records", label: "记录数", type: "number" },
  { key: "size", label: "大小", type: "text", placeholder: "如: 12MB" },
  { key: "updated", label: "更新时间", type: "text", placeholder: "YYYY-MM-DD" },
];

const columnFields: FieldConfig[] = [
  { key: "name", label: "字段名", type: "text", required: true },
  { key: "label", label: "显示名称", type: "text", required: true },
  {
    key: "type", label: "数据类型", type: "select", required: true, options: [
      { label: "int", value: "int" },
      { label: "varchar", value: "varchar" },
      { label: "decimal", value: "decimal" },
      { label: "boolean", value: "boolean" },
      { label: "date", value: "date" },
      { label: "text", value: "text" },
    ],
  },
  {
    key: "nullable", label: "可空", type: "select", options: [
      { label: "是", value: "true" },
      { label: "否", value: "false" },
      { label: "默认NULL", value: "default_null" },
      { label: "严格非空", value: "strict" },
      { label: "有条件空", value: "conditional" },
      { label: "继承父级", value: "inherit" },
    ],
  },
  {
    key: "sensitive", label: "敏感字段", type: "select", options: [
      { label: "高度敏感", value: "high" },
      { label: "敏感", value: "true" },
      { label: "内部使用", value: "internal" },
      { label: "正常", value: "false" },
      { label: "公开", value: "public" },
      { label: "待评估", value: "pending" },
    ],
  },
];

export default function SandboxDataPreview() {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [sampleData, setSampleData] = useState<SampleRow[]>(initialSampleData);
  const [columnsMeta, setColumnsMeta] = useState<ColumnMeta[]>(initialColumnsMeta);
  const [tableList, setTableList] = useState<TableItem[]>(initialTableList);

  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("DS-001");
  const [selectedTable, setSelectedTable] = useState("T-001");
  const [activeTab, setActiveTab] = useState("preview");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFields, setDialogFields] = useState<FieldConfig[]>([]);
  const [dialogData, setDialogData] = useState<Record<string, any>>({});
  const [dialogTarget, setDialogTarget] = useState<"ds" | "table" | "column">("ds");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [detailFields, setDetailFields] = useState<{ key: string; label: string; type?: "text" | "badge" | "date" | "list" }[]>([]);
  const [detailTarget, setDetailTarget] = useState<"ds" | "table" | "column">("ds");

  const currentSource = dataSources.find(d => d.id === selectedSource);

  const openDialog = (
    mode: "create" | "edit" | "view" | "delete",
    target: "ds" | "table" | "column",
    item?: Record<string, any>
  ) => {
    setDialogMode(mode);
    setDialogTarget(target);
    if (target === "ds") {
      setDialogTitle("数据源");
      setDialogFields(dsFields);
    } else if (target === "table") {
      setDialogTitle("数据表");
      setDialogFields(tableFields);
    } else {
      setDialogTitle("字段");
      setDialogFields(columnFields);
    }
    if (item) {
      setDialogData({
        ...item,
        tables: item.tables !== undefined ? String(item.tables) : undefined,
        records: item.records !== undefined ? String(item.records) : undefined,
        nullable: item.nullable !== undefined ? String(item.nullable) : undefined,
        sensitive: item.sensitive !== undefined ? String(item.sensitive) : undefined,
      });
    } else {
      setDialogData({});
    }
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogTarget === "ds") {
      if (dialogMode === "create") {
        const newDs: DataSource = {
          id: `DS-${String(dataSources.length + 1).padStart(3, '0')}`,
          name: data.name || "",
          type: data.type || "MySQL",
          tables: Number(data.tables) || 0,
          records: data.records || "",
          updated: data.updated || new Date().toISOString().split('T')[0],
        };
        setDataSources(prev => [...prev, newDs]);
      } else if (dialogMode === "edit" && dialogData.id) {
        setDataSources(prev => prev.map(d => d.id === dialogData.id ? {
          ...d,
          name: data.name || d.name,
          type: data.type || d.type,
          tables: Number(data.tables) ?? d.tables,
          records: data.records || d.records,
          updated: data.updated || d.updated,
        } : d));
      }
    } else if (dialogTarget === "table") {
      if (dialogMode === "create") {
        const newTable: TableItem = {
          id: `T-${String(tableList.length + 1).padStart(3, '0')}`,
          name: data.name || "",
          records: Number(data.records) || 0,
          size: data.size || "",
          updated: data.updated || new Date().toISOString().split('T')[0],
        };
        setTableList(prev => [...prev, newTable]);
      } else if (dialogMode === "edit" && dialogData.id) {
        setTableList(prev => prev.map(t => t.id === dialogData.id ? {
          ...t,
          name: data.name || t.name,
          records: Number(data.records) ?? t.records,
          size: data.size || t.size,
          updated: data.updated || t.updated,
        } : t));
      }
    } else if (dialogTarget === "column") {
      if (dialogMode === "create") {
        const newCol: ColumnMeta = {
          name: data.name || "",
          type: data.type || "varchar",
          label: data.label || "",
          nullable: data.nullable === "true",
          sensitive: data.sensitive === "true" || data.sensitive === "high" || data.sensitive === "internal",
        };
        setColumnsMeta(prev => [...prev, newCol]);
      } else if (dialogMode === "edit" && dialogData.name) {
        setColumnsMeta(prev => prev.map(c => c.name === dialogData.name ? {
          ...c,
          name: data.name || c.name,
          type: data.type || c.type,
          label: data.label || c.label,
          nullable: data.nullable === "true",
          sensitive: data.sensitive === "true" || data.sensitive === "high" || data.sensitive === "internal",
        } : c));
      }
    }
  };

  const handleDelete = () => {
    if (dialogTarget === "ds" && dialogData.id) {
      setDataSources(prev => prev.filter(d => d.id !== dialogData.id));
      if (selectedSource === dialogData.id && dataSources.length > 1) {
        setSelectedSource(dataSources.find(d => d.id !== dialogData.id)?.id || "");
      }
    } else if (dialogTarget === "table" && dialogData.id) {
      setTableList(prev => prev.filter(t => t.id !== dialogData.id));
    } else if (dialogTarget === "column" && dialogData.name) {
      setColumnsMeta(prev => prev.filter(c => c.name !== dialogData.name));
    }
  };

  const openDetail = (target: "ds" | "table" | "column", item: Record<string, any>) => {
    setDetailTarget(target);
    setDetailData(item);
    if (target === "ds") {
      setDetailTitle("数据源详情");
      setDetailFields([
        { key: "id", label: "数据源ID" },
        { key: "name", label: "数据源名称" },
        { key: "type", label: "类型", type: "badge" as const },
        { key: "tables", label: "表数量" },
        { key: "records", label: "记录数" },
        { key: "updated", label: "更新时间", type: "date" as const },
      ]);
    } else if (target === "table") {
      setDetailTitle("数据表详情");
      setDetailFields([
        { key: "id", label: "表ID" },
        { key: "name", label: "表名" },
        { key: "records", label: "记录数" },
        { key: "size", label: "大小" },
        { key: "updated", label: "更新时间", type: "date" as const },
      ]);
    } else {
      setDetailTitle("字段详情");
      setDetailFields([
        { key: "name", label: "字段名" },
        { key: "label", label: "显示名称" },
        { key: "type", label: "数据类型", type: "badge" as const },
        { key: "nullable", label: "可空" },
        { key: "sensitive", label: "敏感字段", type: "badge" as const },
      ]);
    }
    setDetailOpen(true);
  };

  const filteredTables = tableList.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">数据探查</h1>
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
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => openDialog("create", "ds")}>
          <Plus className="w-4 h-4" />新建数据源
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
          {/* Data Sources Management */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">数据源列表</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => openDialog("create", "ds")}><Plus className="w-4 h-4" />新建数据源</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>类型</TableHead><TableHead>表数</TableHead><TableHead>记录数</TableHead><TableHead>更新</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map(ds => (
                    <TableRow key={ds.id}>
                      <TableCell className="font-mono text-xs">{ds.id}</TableCell>
                      <TableCell className="font-medium">{ds.name}</TableCell>
                      <TableCell><Badge variant="outline">{ds.type}</Badge></TableCell>
                      <TableCell>{ds.tables}</TableCell>
                      <TableCell>{ds.records}</TableCell>
                      <TableCell className="text-xs text-gray-500">{ds.updated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail("ds", ds)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("edit", "ds", ds)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDialog("delete", "ds", ds)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tables Management */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索表名..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={() => openDialog("create", "table")}><Plus className="w-4 h-4" />新建表</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">数据表列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>表ID</TableHead><TableHead>表名</TableHead><TableHead>记录数</TableHead><TableHead>大小</TableHead><TableHead>更新时间</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.records.toLocaleString()}</TableCell>
                      <TableCell>{t.size}</TableCell>
                      <TableCell className="text-xs text-gray-500">{t.updated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail("table", t)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("edit", "table", t)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDialog("delete", "table", t)}><Trash2 className="w-4 h-4" /></Button>
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
                <Button variant="outline" size="sm" className="gap-2" onClick={() => openDialog("create", "column")}><Plus className="w-4 h-4" />添加字段</Button>
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
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail("column", col)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("edit", "column", col)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openDialog("delete", "column", col)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        fields={dialogFields}
        data={dialogData}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={detailTitle}
        data={detailData}
        fields={detailFields}
        onEdit={() => {
          setDialogMode("edit");
          setDialogTarget(detailTarget);
          if (detailTarget === "ds") {
            setDialogTitle("数据源");
            setDialogFields(dsFields);
          } else if (detailTarget === "table") {
            setDialogTitle("数据表");
            setDialogFields(tableFields);
          } else {
            setDialogTitle("字段");
            setDialogFields(columnFields);
          }
          setDialogData({
            ...detailData,
            tables: detailData.tables !== undefined ? String(detailData.tables) : undefined,
            records: detailData.records !== undefined ? String(detailData.records) : undefined,
            nullable: detailData.nullable !== undefined ? String(detailData.nullable) : undefined,
            sensitive: detailData.sensitive !== undefined ? String(detailData.sensitive) : undefined,
          });
          setDialogOpen(true);
        }}
        onDelete={() => {
          setDialogMode("delete");
          setDialogTarget(detailTarget);
          if (detailTarget === "ds") setDialogTitle("数据源");
          else if (detailTarget === "table") setDialogTitle("数据表");
          else setDialogTitle("字段");
          setDialogData(detailData);
          setDialogOpen(true);
        }}
      />

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
    </div>
  );
}
