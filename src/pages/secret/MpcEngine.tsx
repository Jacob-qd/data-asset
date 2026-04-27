import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CircuitBoard, Play, Pause, Settings, Search, Plus,
  CheckCircle2, AlertTriangle, Activity, Zap, GitBranch,
} from "lucide-react";

const protocols = [
  { id: "MPC-001", name: "SPDZ-2k", type: " dishonest-majority", status: "active", circuits: 128, parties: 5, latency: "12ms", throughput: "2.4k ops/s" },
  { id: "MPC-002", name: "GMW", type: "boolean", status: "active", circuits: 86, parties: 3, latency: "8ms", throughput: "4.1k ops/s" },
  { id: "MPC-003", name: "BMR", type: "constant-round", status: "standby", circuits: 42, parties: 4, latency: "-", throughput: "-" },
  { id: "MPC-004", name: "ABY3", type: "3PC", status: "active", circuits: 64, parties: 3, latency: "5ms", throughput: "8.7k ops/s" },
];

const circuits = [
  { id: "CIRC-001", name: "比较电路", gates: 12500, depth: 24, protocol: "SPDZ-2k", status: "optimized" },
  { id: "CIRC-002", name: "乘法电路", gates: 8200, depth: 12, protocol: "ABY3", status: "optimized" },
  { id: "CIRC-003", name: "排序电路", gates: 48600, depth: 56, protocol: "GMW", status: "review" },
  { id: "CIRC-004", name: "求交电路", gates: 15600, depth: 32, protocol: "SPDZ-2k", status: "optimized" },
];

export default function MpcEngine() {
  const [search, setSearch] = useState("");
  const filteredProtocols = protocols.filter(p => p.name.includes(search) || p.id.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">密码协议引擎</h1>
          <p className="text-sm text-gray-500 mt-1">MPC协议配置、电路管理、秘密共享与预处理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Settings className="w-4 h-4" />全局配置</Button>
          <Button className="gap-2"><Plus className="w-4 h-4" />添加协议</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><CircuitBoard className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">4</div><div className="text-xs text-gray-500">协议实例</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">320</div><div className="text-xs text-gray-500">电路总数</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Zap className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">15.2k</div><div className="text-xs text-gray-500">总吞吐(ops/s)</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Activity className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">7.5ms</div><div className="text-xs text-gray-500">平均延迟</div></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索协议..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">协议实例</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>电路数</TableHead><TableHead>参与方</TableHead><TableHead>延迟</TableHead><TableHead>吞吐</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filteredProtocols.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell>{p.status === "active" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />运行中</Badge> : <Badge className="bg-gray-50 text-gray-700">待机</Badge>}</TableCell>
                  <TableCell>{p.circuits}</TableCell>
                  <TableCell>{p.parties}方</TableCell>
                  <TableCell>{p.latency}</TableCell>
                  <TableCell>{p.throughput}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {p.status === "active" ? <Button variant="ghost" size="icon" className="h-8 w-8"><Pause className="w-4 h-4" /></Button> : <Button variant="ghost" size="icon" className="h-8 w-8"><Play className="w-4 h-4" /></Button>}
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">电路库</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>电路名称</TableHead><TableHead>门数量</TableHead><TableHead>深度</TableHead><TableHead>所属协议</TableHead><TableHead>状态</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {circuits.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.gates.toLocaleString()}</TableCell>
                  <TableCell>{c.depth}</TableCell>
                  <TableCell>{c.protocol}</TableCell>
                  <TableCell>{c.status === "optimized" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已优化</Badge> : <Badge className="bg-amber-50 text-amber-700 gap-1"><AlertTriangle className="w-3 h-3" />待审</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
