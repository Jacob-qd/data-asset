import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Shield,
  Plus,
  Search,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

const keys = [
  { id: "KEY-001", name: "项目A-加密密钥", type: "AES-256", owner: "参与方A", status: "active", created: "2024-01-15", expires: "2025-01-15", algorithm: "AES-GCM" },
  { id: "KEY-002", name: "项目B-签名密钥", type: "RSA-2048", owner: "参与方B", status: "active", created: "2024-02-20", expires: "2025-02-20", algorithm: "RSA-PSS" },
  { id: "KEY-003", name: "联邦学习-梯度密钥", type: "ECDH", owner: "协调方", status: "active", created: "2024-03-10", expires: "2024-09-10", algorithm: "ECDH-P256" },
  { id: "KEY-004", name: "PSI-求交密钥", type: "AES-256", owner: "参与方C", status: "expiring", created: "2023-10-01", expires: "2024-04-30", algorithm: "AES-GCM" },
  { id: "KEY-005", name: "项目A-旧密钥", type: "AES-128", owner: "参与方A", status: "revoked", created: "2023-06-01", expires: "已吊销", algorithm: "AES-CBC" },
];

const certificates = [
  { id: "CERT-001", subject: "参与方A", issuer: "密态计算CA", status: "valid", validFrom: "2024-01-01", validTo: "2025-01-01", serial: "A1:B2:C3:D4", keyUsage: "数字签名,密钥协商" },
  { id: "CERT-002", subject: "参与方B", issuer: "密态计算CA", status: "valid", validFrom: "2024-02-01", validTo: "2025-02-01", serial: "B2:C3:D4:E5", keyUsage: "数字签名,数据加密" },
  { id: "CERT-003", subject: "协调方", issuer: "密态计算CA", status: "expiring", validFrom: "2023-04-01", validTo: "2024-05-01", serial: "C3:D4:E5:F6", keyUsage: "数字签名,证书签发" },
  { id: "CERT-004", subject: "参与方C", issuer: "密态计算CA", status: "revoked", validFrom: "2023-01-01", validTo: "2024-01-01", serial: "D4:E5:F6:G7", keyUsage: "数字签名" },
];

export default function SecretKeys() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredKeys = keys.filter((k) =>
    k.name.includes(searchQuery) || k.id.includes(searchQuery)
  );
  const filteredCerts = certificates.filter((c) =>
    c.subject.includes(searchQuery) || c.id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">密钥证书</h1>
          <p className="text-sm text-gray-500 mt-1">管理密态计算中的加密密钥和数字证书</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            导入密钥
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            新建密钥
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">42</div>
              <div className="text-xs text-gray-500">密钥总数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">38</div>
              <div className="text-xs text-gray-500">有效密钥</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">16</div>
              <div className="text-xs text-gray-500">证书总数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-500">即将过期</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜索密钥/证书..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys" className="gap-2">
            <Key className="w-4 h-4" />
            密钥管理
          </TabsTrigger>
          <TabsTrigger value="certs" className="gap-2">
            <Shield className="w-4 h-4" />
            证书管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">密钥列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>密钥ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>算法</TableHead>
                    <TableHead>持有者</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-mono text-xs">{key.id}</TableCell>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>{key.type}</TableCell>
                      <TableCell className="text-xs">{key.algorithm}</TableCell>
                      <TableCell>{key.owner}</TableCell>
                      <TableCell>
                        {key.status === "active" && <Badge className="bg-green-50 text-green-700 border-green-200 gap-1"><Lock className="w-3 h-3" />有效</Badge>}
                        {key.status === "expiring" && <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="w-3 h-3" />即将过期</Badge>}
                        {key.status === "revoked" && <Badge className="bg-red-50 text-red-700 border-red-200 gap-1"><Unlock className="w-3 h-3" />已吊销</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{key.created}</TableCell>
                      <TableCell className="text-xs text-gray-500">{key.expires}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certs">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">证书列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>证书ID</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>签发者</TableHead>
                    <TableHead>序列号</TableHead>
                    <TableHead>密钥用途</TableHead>
                    <TableHead>有效期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs">{cert.id}</TableCell>
                      <TableCell className="font-medium">{cert.subject}</TableCell>
                      <TableCell>{cert.issuer}</TableCell>
                      <TableCell className="font-mono text-xs">{cert.serial}</TableCell>
                      <TableCell className="text-xs">{cert.keyUsage}</TableCell>
                      <TableCell className="text-xs text-gray-500">{cert.validFrom} ~ {cert.validTo}</TableCell>
                      <TableCell>
                        {cert.status === "valid" && <Badge className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" />有效</Badge>}
                        {cert.status === "expiring" && <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="w-3 h-3" />即将过期</Badge>}
                        {cert.status === "revoked" && <Badge className="bg-red-50 text-red-700 border-red-200 gap-1"><AlertTriangle className="w-3 h-3" />已吊销</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Fingerprint className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
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
    </div>
  );
}
