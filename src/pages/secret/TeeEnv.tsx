import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldCheck, Search, Plus, CheckCircle2, AlertTriangle, Server, Lock } from "lucide-react";

const enclaves = [
  { id: "SGX-001", host: "node-01.platform.local", type: "Intel SGX", status: "running", attestation: "verified", uptime: "45d 12h", tasks: 24 },
  { id: "SEV-001", host: "node-02.platform.local", type: "AMD SEV-SNP", status: "running", attestation: "verified", uptime: "30d 8h", tasks: 18 },
  { id: "TPM-001", host: "node-03.platform.local", type: "TPM 2.0", status: "standby", attestation: "pending", uptime: "-", tasks: 0 },
  { id: "SGX-002", host: "node-04.platform.local", type: "Intel TDX", status: "running", attestation: "verified", uptime: "15d 3h", tasks: 12 },
];

const attestations = [
  { id: "ATT-001", enclave: "SGX-001", result: "pass", time: "2024-04-15 10:30:00", quote: "0x8a3f...c2d4" },
  { id: "ATT-002", enclave: "SEV-001", result: "pass", time: "2024-04-15 10:25:00", quote: "0x7b2e...d3f5" },
  { id: "ATT-003", enclave: "SGX-002", result: "pass", time: "2024-04-15 10:20:00", quote: "0x6c1d...e4a6" },
];

export default function TeeEnv() {
  const [search, setSearch] = useState("");
  const filtered = enclaves.filter(e => e.id.includes(search) || e.host.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">可信执行环境(TEE)</h1>
          <p className="text-sm text-gray-500 mt-1">TEE环境配置、远程证明与安全飞地管理</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" />注册飞地</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Server className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold">4</div><div className="text-xs text-gray-500">安全飞地</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold">3</div><div className="text-xs text-gray-500">运行中</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Lock className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold">100%</div><div className="text-xs text-gray-500">证明通过率</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Shield className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold">54</div><div className="text-xs text-gray-500">执行任务</div></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="搜索飞地..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">安全飞地列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>主机</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>证明状态</TableHead><TableHead>运行时间</TableHead><TableHead>任务数</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.id}</TableCell>
                  <TableCell className="font-medium text-xs">{e.host}</TableCell>
                  <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                  <TableCell>{e.status === "running" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />运行中</Badge> : <Badge className="bg-gray-50 text-gray-700">待机</Badge>}</TableCell>
                  <TableCell>{e.attestation === "verified" ? <Badge className="bg-green-50 text-green-700">已验证</Badge> : <Badge className="bg-amber-50 text-amber-700">待验证</Badge>}</TableCell>
                  <TableCell className="text-xs text-gray-500">{e.uptime}</TableCell>
                  <TableCell>{e.tasks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">远程证明记录</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>证明ID</TableHead><TableHead>飞地</TableHead><TableHead>结果</TableHead><TableHead>时间</TableHead><TableHead>Quote</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {attestations.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.enclave}</TableCell>
                  <TableCell>{a.result === "pass" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />通过</Badge> : <Badge className="bg-red-50 text-red-700 gap-1"><AlertTriangle className="w-3 h-3" />失败</Badge>}</TableCell>
                  <TableCell className="text-xs text-gray-500">{a.time}</TableCell>
                  <TableCell className="font-mono text-xs">{a.quote}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
