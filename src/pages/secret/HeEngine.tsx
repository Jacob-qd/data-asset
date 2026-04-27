import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Fingerprint, Key, Search, Plus, CheckCircle2, Zap, BarChart3 } from "lucide-react";

const keys = [
  { id: "HEK-001", name: "CKKS-主密钥", scheme: "CKKS", bits: 16384, status: "active", ops: 12450, created: "2024-03-01" },
  { id: "HEK-002", name: "BFV-查询密钥", scheme: "BFV", bits: 8192, status: "active", ops: 8320, created: "2024-03-15" },
  { id: "HEK-003", name: "BGV-统计密钥", scheme: "BGV", bits: 16384, status: "active", ops: 5670, created: "2024-04-01" },
];

const params = [
  { id: "HP-001", name: "默认参数集-A", polyModulus: "8192", coeffModulus: "200-bit", scale: "2^40", scheme: "CKKS" },
  { id: "HP-002", name: "高精度参数集-B", polyModulus: "16384", coeffModulus: "438-bit", scale: "2^60", scheme: "CKKS" },
  { id: "HP-003", name: "整数参数集-C", polyModulus: "4096", coeffModulus: "109-bit", plainModulus: "65537", scheme: "BFV" },
];

export default function HeEngine() {
  const [search, setSearch] = useState("");
  const filtered = keys.filter(k => k.name.includes(search) || k.id.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">同态加密引擎</h1>
          <p className="text-sm text-gray-500 mt-1">密钥管理、参数配置与加密运算调度</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Key className="w-4 h-4" />轮转密钥</Button>
          <Button className="gap-2"><Plus className="w-4 h-4" />新建密钥</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Fingerprint className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">3</div><div className="text-xs text-gray-500">活跃密钥</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Zap className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">26.4k</div><div className="text-xs text-gray-500">累计运算</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">3</div><div className="text-xs text-gray-500">参数集</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Key className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">16k</div><div className="text-xs text-gray-500">最高位宽</div></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索密钥..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">同态密钥</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>方案</TableHead><TableHead>位宽</TableHead><TableHead>状态</TableHead><TableHead>运算次数</TableHead><TableHead>创建时间</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(k => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs">{k.id}</TableCell>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell><Badge variant="outline">{k.scheme}</Badge></TableCell>
                  <TableCell>{k.bits}</TableCell>
                  <TableCell><Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />活跃</Badge></TableCell>
                  <TableCell>{k.ops.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-gray-500">{k.created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">参数配置</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>多项式模数</TableHead><TableHead>系数模数</TableHead><TableHead>缩放因子</TableHead><TableHead>方案</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {params.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.polyModulus}</TableCell>
                  <TableCell>{p.coeffModulus}</TableCell>
                  <TableCell className="font-mono text-xs">{p.scale}</TableCell>
                  <TableCell><Badge variant="outline">{p.scheme}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
