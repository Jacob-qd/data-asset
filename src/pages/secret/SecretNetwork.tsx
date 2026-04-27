import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radio, Wifi, Search, Plus, CheckCircle2, AlertTriangle, Globe, Lock } from "lucide-react";

const nodes = [
  { id: "NODE-001", name: "协调节点-A", address: "10.0.1.10:8080", protocol: "TLS 1.3 + mTLS", latency: "2ms", status: "online", encrypted: true },
  { id: "NODE-002", name: "参与方节点-B", address: "10.0.2.10:8080", protocol: "TLS 1.3 + mTLS", latency: "8ms", status: "online", encrypted: true },
  { id: "NODE-003", name: "参与方节点-C", address: "10.0.3.10:8080", protocol: "TLS 1.3 + mTLS", latency: "12ms", status: "online", encrypted: true },
  { id: "NODE-004", name: "参与方节点-D", address: "10.0.4.10:8080", protocol: "QUIC + Noise", latency: "-", status: "offline", encrypted: true },
];

const channels = [
  { id: "CH-001", source: "NODE-001", target: "NODE-002", protocol: "gRPC over TLS", bandwidth: "1Gbps", packets: "12.5M", errors: 0 },
  { id: "CH-002", source: "NODE-001", target: "NODE-003", protocol: "gRPC over TLS", bandwidth: "1Gbps", packets: "8.3M", errors: 2 },
  { id: "CH-003", source: "NODE-002", target: "NODE-003", protocol: "P2P Direct", bandwidth: "500Mbps", packets: "5.1M", errors: 0 },
];

export default function SecretNetwork() {
  const [search, setSearch] = useState("");
  const filtered = nodes.filter(n => n.name.includes(search) || n.id.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">网络通信</h1>
          <p className="text-sm text-gray-500 mt-1">网络拓扑、通信协议与加密通道配置</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" />添加节点</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Globe className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">4</div><div className="text-xs text-gray-500">网络节点</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Wifi className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">3</div><div className="text-xs text-gray-500">在线节点</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Radio className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">3</div><div className="text-xs text-gray-500">通信通道</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Lock className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">100%</div><div className="text-xs text-gray-500">通道加密率</div></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索节点..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">网络节点</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>名称</TableHead><TableHead>地址</TableHead><TableHead>协议</TableHead><TableHead>延迟</TableHead><TableHead>状态</TableHead><TableHead>加密</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(n => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-xs">{n.id}</TableCell>
                  <TableCell className="font-medium">{n.name}</TableCell>
                  <TableCell className="font-mono text-xs">{n.address}</TableCell>
                  <TableCell className="text-xs">{n.protocol}</TableCell>
                  <TableCell>{n.latency}</TableCell>
                  <TableCell>{n.status === "online" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />在线</Badge> : <Badge className="bg-red-50 text-red-700 gap-1"><AlertTriangle className="w-3 h-3" />离线</Badge>}</TableCell>
                  <TableCell>{n.encrypted ? <Badge className="bg-green-50 text-green-700">已加密</Badge> : <Badge className="bg-red-50 text-red-700">未加密</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">加密通道</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>源节点</TableHead><TableHead>目标节点</TableHead><TableHead>协议</TableHead><TableHead>带宽</TableHead><TableHead>包数量</TableHead><TableHead>错误</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {channels.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium text-xs">{c.source}</TableCell>
                  <TableCell className="font-medium text-xs">{c.target}</TableCell>
                  <TableCell className="text-xs">{c.protocol}</TableCell>
                  <TableCell>{c.bandwidth}</TableCell>
                  <TableCell>{c.packets}</TableCell>
                  <TableCell className={c.errors > 0 ? "text-red-600" : "text-green-600"}>{c.errors}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
