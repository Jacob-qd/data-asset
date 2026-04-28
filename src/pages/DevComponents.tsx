import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  ChevronRight,
  Search,
  Copy,
  Check,
  Download,
  Play,
  Plus,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Terminal,
  Globe,
  Cpu,
  Database,
  RefreshCw,
  Key,
  Code2,
  Box,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─── Types ─── */
type SdkLang = "Java" | "Go" | "Node.js" | "Python";

interface SdkInfo {
  lang: SdkLang;
  version: string;
  releaseDate: string;
  changelog: string;
}

interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  auth: boolean;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  responseSchema: string;
  exampleRequest: string;
  exampleResponse: string;
  type: "badge";
}

interface ApiKey {
  id: string;
  name: string;
  keyId: string;
  permissions: string;
  status: "active" | "revoked";
  createdAt: string;
  lastUsed: string;
  callCount: number;
  errorRate: number;
}

interface SandboxStatus {
  network: "online" | "offline";
  chainId: string;
  blockHeight: number;
  peers: number;
}

/* ─── Mock Data ─── */
const sdkData: Record<string, SdkInfo[]> = {
  Java: [
    { lang: "Java", version: "v2.4.1", releaseDate: "2026-04-15", changelog: "支持国密SM2/SM3算法，优化连接池性能" },
    { lang: "Java", version: "v2.4.0", releaseDate: "2026-03-20", changelog: "新增批量交易提交接口" },
    { lang: "Java", version: "v2.3.9", releaseDate: "2026-02-10", changelog: "修复重连时的内存泄漏问题" },
  ],
  Go: [
    { lang: "Go", version: "v1.8.2", releaseDate: "2026-04-18", changelog: "支持Go 1.24，优化并发处理" },
    { lang: "Go", version: "v1.8.1", releaseDate: "2026-03-25", changelog: "修复WebSocket订阅断线问题" },
    { lang: "Go", version: "v1.8.0", releaseDate: "2026-02-28", changelog: "新增链码事件监听功能" },
  ],
  "Node.js": [
    { lang: "Node.js", version: "v3.2.0", releaseDate: "2026-04-20", changelog: "TypeScript类型声明完善，支持ESM" },
    { lang: "Node.js", version: "v3.1.5", releaseDate: "2026-03-15", changelog: "新增Promise化API" },
    { lang: "Node.js", version: "v3.1.4", releaseDate: "2026-02-20", changelog: "修复浏览器兼容性问题" },
  ],
  Python: [
    { lang: "Python", version: "v4.1.3", releaseDate: "2026-04-22", changelog: "支持Python 3.13，异步API重构" },
    { lang: "Python", version: "v4.1.2", releaseDate: "2026-03-30", changelog: "新增数据编解码工具类" },
    { lang: "Python", version: "v4.1.1", releaseDate: "2026-02-15", changelog: "修复SSL证书验证问题" },
  ],
};

const apiEndpoints: ApiEndpoint[] = [
  {
    id: "api-001",
    method: "GET",
    path: "/api/v1/chain/blocks",
    description: "获取区块列表",
    auth: true,
    parameters: [
      { name: "page", type: "integer", required: false, description: "页码，默认1" },
      { name: "size", type: "integer", required: false, description: "每页数量，默认20" },
    ],
    responseSchema: "{ \"data\": [{ \"height\": 0, \"hash\": \"string\", \"txCount\": 0 }], \"total\": 0 }",
    exampleRequest: "GET /api/v1/chain/blocks?page=1&size=10",
    exampleResponse: '{\n  "data": [\n    { "height": 1024, "hash": "0xabc...", "txCount": 3 }\n  ],\n  "total": 1024\n}',
    type: "badge" as const,
  },
  {
    id: "api-002",
    method: "GET",
    path: "/api/v1/chain/blocks/{height}",
    description: "根据高度获取区块详情",
    auth: true,
    parameters: [
      { name: "height", type: "integer", required: true, description: "区块高度" },
    ],
    responseSchema: "{ \"height\": 0, \"hash\": \"string\", \"prevHash\": \"string\", \"timestamp\": 0, \"transactions\": [] }",
    exampleRequest: "GET /api/v1/chain/blocks/1024",
    exampleResponse: '{\n  "height": 1024,\n  "hash": "0xabc...",\n  "prevHash": "0xdef...",\n  "timestamp": 1714003200,\n  "transactions": []\n}',
    type: "badge" as const,
  },
  {
    id: "api-003",
    method: "POST",
    path: "/api/v1/transactions",
    description: "发送交易",
    auth: true,
    parameters: [
      { name: "from", type: "string", required: true, description: "发送方地址" },
      { name: "to", type: "string", required: true, description: "接收方地址" },
      { name: "value", type: "string", required: true, description: "交易金额" },
      { name: "data", type: "string", required: false, description: "附加数据" },
    ],
    responseSchema: "{ \"txHash\": \"string\", \"status\": \"pending\" }",
    exampleRequest: "POST /api/v1/transactions\n{ \"from\": \"0x123...\", \"to\": \"0x456...\", \"value\": \"1000\" }",
    exampleResponse: '{\n  "txHash": "0x789...",\n  "status": "pending"\n}',
    type: "badge" as const,
  },
  {
    id: "api-004",
    method: "GET",
    path: "/api/v1/contracts/{address}",
    description: "获取合约信息",
    auth: false,
    parameters: [
      { name: "address", type: "string", required: true, description: "合约地址" },
    ],
    responseSchema: "{ \"address\": \"string\", \"creator\": \"string\", \"bytecode\": \"string\", \"abi\": [] }",
    exampleRequest: "GET /api/v1/contracts/0xContractAddress",
    exampleResponse: '{\n  "address": "0xabc...",\n  "creator": "0xdef...",\n  "bytecode": "0x6080...",\n  "abi": []\n}',
    type: "badge" as const,
  },
  {
    id: "api-005",
    method: "POST",
    path: "/api/v1/contracts/deploy",
    description: "部署合约",
    auth: true,
    parameters: [
      { name: "bytecode", type: "string", required: true, description: "合约字节码" },
      { name: "abi", type: "array", required: true, description: "合约ABI" },
      { name: "args", type: "array", required: false, description: "构造函数参数" },
    ],
    responseSchema: "{ \"contractAddress\": \"string\", \"txHash\": \"string\" }",
    exampleRequest: "POST /api/v1/contracts/deploy\n{ \"bytecode\": \"0x6080...\", \"abi\": [], \"args\": [] }",
    exampleResponse: '{\n  "contractAddress": "0xabc...",\n  "txHash": "0xdef..."\n}',
    type: "badge" as const,
  },
  {
    id: "api-006",
    method: "POST",
    path: "/api/v1/contracts/{address}/call",
    description: "调用合约方法",
    auth: true,
    parameters: [
      { name: "address", type: "string", required: true, description: "合约地址" },
      { name: "method", type: "string", required: true, description: "方法名" },
      { name: "args", type: "array", required: false, description: "方法参数" },
    ],
    responseSchema: "{ \"result\": \"string\", \"logs\": [] }",
    exampleRequest: "POST /api/v1/contracts/0xabc.../call\n{ \"method\": \"balanceOf\", \"args\": [\"0x123...\"] }",
    exampleResponse: '{\n  "result": "1000000000000000000",\n  "logs": []\n}',
    type: "badge" as const,
  },
];

const codeExamples: Record<string, Record<string, string>> = {
  "Connect to Chain": {
    Java: `BlockchainClient client = BlockchainClient.builder()\n  .endpoint("https://api.example.com")\n  .apiKey("your-api-key")\n  .build();\nChainInfo info = client.getChainInfo();\nSystem.out.println("Chain ID: " + info.getChainId());`,
    Go: `client, err := blockchain.NewClient("https://api.example.com", "your-api-key")\nif err != nil {\n  log.Fatal(err)\n}\ninfo, err := client.GetChainInfo()\nfmt.Println("Chain ID:", info.ChainID)`,
    "Node.js": `const client = new BlockchainClient({\n  endpoint: 'https://api.example.com',\n  apiKey: 'your-api-key'\n});\nconst info = await client.getChainInfo();\nconsole.log('Chain ID:', info.chainId);`,
    Python: `client = BlockchainClient(\n    endpoint="https://api.example.com",\n    api_key="your-api-key"\n)\ninfo = client.get_chain_info()\nprint(f"Chain ID: {info.chain_id}")`,
  },
  "Deploy Contract": {
    Java: `DeployRequest req = new DeployRequest(bytecode, abi);\nDeployResult result = client.deployContract(req);\nSystem.out.println("Address: " + result.getContractAddress());`,
    Go: `result, err := client.DeployContract(ctx, bytecode, abi, nil)\nfmt.Println("Address:", result.ContractAddress)`,
    "Node.js": `const result = await client.deployContract({ bytecode, abi });\nconsole.log('Address:', result.contractAddress);`,
    Python: `result = client.deploy_contract(bytecode=bytecode, abi=abi)\nprint(f"Address: {result.contract_address}")`,
  },
  "Call Contract": {
    Java: `CallRequest req = new CallRequest(contractAddress, "balanceOf", ownerAddress);\nCallResult result = client.callContract(req);\nSystem.out.println("Balance: " + result.getResult());`,
    Go: `result, err := client.CallContract(ctx, contractAddress, "balanceOf", ownerAddress)\nfmt.Println("Balance:", result.Result)`,
    "Node.js": `const result = await client.callContract(contractAddress, 'balanceOf', [ownerAddress]);\nconsole.log('Balance:', result.result);`,
    Python: `result = client.call_contract(\n    address=contract_address,\n    method="balanceOf",\n    args=[owner_address]\n)\nprint(f"Balance: {result.result}")`,
  },
  "Query Block": {
    Java: `Block block = client.getBlockByHeight(1024L);\nSystem.out.println("Hash: " + block.getHash());\nSystem.out.println("TxCount: " + block.getTxCount());`,
    Go: `block, err := client.GetBlockByHeight(ctx, 1024)\nfmt.Println("Hash:", block.Hash)\nfmt.Println("TxCount:", block.TxCount)`,
    "Node.js": `const block = await client.getBlockByHeight(1024);\nconsole.log('Hash:', block.hash);\nconsole.log('TxCount:', block.txCount);`,
    Python: `block = client.get_block_by_height(1024)\nprint(f"Hash: {block.hash}")\nprint(f"TxCount: {block.tx_count}")`,
  },
  "Send Transaction": {
    Java: `Transaction tx = new Transaction(from, to, "1000");\nString txHash = client.sendTransaction(tx);\nSystem.out.println("TxHash: " + txHash);`,
    Go: `tx := &Transaction{From: from, To: to, Value: "1000"}\ntxHash, err := client.SendTransaction(ctx, tx)\nfmt.Println("TxHash:", txHash)`,
    "Node.js": `const tx = { from, to, value: '1000' };\nconst txHash = await client.sendTransaction(tx);\nconsole.log('TxHash:', txHash);`,
    Python: `tx = Transaction(from_addr=from_addr, to_addr=to_addr, value="1000")\ntx_hash = client.send_transaction(tx)\nprint(f"TxHash: {tx_hash}")`,
  },
};

const initialApiKeys: ApiKey[] = [
  { id: "key-001", name: "生产环境密钥", keyId: "AKID_7X3A...9F2E", permissions: "read/write", status: "active", createdAt: "2026-03-15", lastUsed: "2026-04-28 10:23", callCount: 45231, errorRate: 0.02 },
  { id: "key-002", name: "测试环境密钥", keyId: "AKID_2B9C...4D1A", permissions: "read/write/admin", status: "active", createdAt: "2026-04-01", lastUsed: "2026-04-28 09:45", callCount: 12890, errorRate: 0.05 },
  { id: "key-003", name: "只读监控密钥", keyId: "AKID_5E1F...8C3B", permissions: "read", status: "active", createdAt: "2026-04-10", lastUsed: "2026-04-27 18:00", callCount: 5600, errorRate: 0.01 },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

/* ─── Component ─── */
export default function DevComponents() {
  const [activeTab, setActiveTab] = useState("sdk");

  /* SDK */
  const [selectedSdk, setSelectedSdk] = useState<SdkLang>("Java");
  const [selectedVersion, setSelectedVersion] = useState<string>(sdkData["Java"][0].version);

  /* API Docs */
  const [apiSearch, setApiSearch] = useState("");
  const [expandedApi, setExpandedApi] = useState<string | null>(null);
  const [bookmarkedApis, setBookmarkedApis] = useState<Set<string>>(new Set());

  /* Code Examples */
  const [selectedScenario, setSelectedScenario] = useState("Connect to Chain");
  const [selectedLang, setSelectedLang] = useState<string>("Java");
  const [copiedCode, setCopiedCode] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);

  /* API Keys */
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState("read/write");
  const [newKeyExpiry, setNewKeyExpiry] = useState("30");

  /* Sandbox */
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>({
    network: "online",
    chainId: "sandbox-1337",
    blockHeight: 1024,
    peers: 4,
  });
  const [faucetRequested, setFaucetRequested] = useState(false);
  const [deployLog, setDeployLog] = useState<string>("");

  const currentSdk = sdkData[selectedSdk].find(s => s.version === selectedVersion) || sdkData[selectedSdk][0];

  const filteredApis = apiEndpoints.filter(
    ep =>
      ep.path.toLowerCase().includes(apiSearch.toLowerCase()) ||
      ep.description.includes(apiSearch)
  );

  const toggleBookmark = (id: string) => {
    setBookmarkedApis(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const runInSandbox = () => {
    setSandboxResult("执行成功:\n\nChain ID: sandbox-1337\nBlock Height: 1024\nGas Used: 21000\nStatus: confirmed\n\nTransaction Hash: 0x" + Math.random().toString(16).slice(2, 10) + "...");
  };

  const createApiKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: Date.now().toString(36).toUpperCase(),
      name: newKeyName,
      keyId: "AKID_" + Math.random().toString(36).slice(2, 6).toUpperCase() + "..." + Math.random().toString(36).slice(2, 6).toUpperCase(),
      permissions: newKeyPermissions,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "-",
      callCount: 0,
      errorRate: 0,
    };
    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName("");
    setCreateKeyOpen(false);
  };

  const revokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));
  };

  const requestFaucet = () => {
    setFaucetRequested(true);
    setTimeout(() => setFaucetRequested(false), 3000);
  };

  const deployToSandbox = () => {
    setDeployLog("正在部署合约到沙箱环境...\n编译中...\n字节码验证通过\n发送部署交易...\n交易已确认，合约地址: 0x" + Math.random().toString(16).slice(2, 42));
  };

  const resetSandbox = () => {
    setSandboxStatus({ network: "online", chainId: "sandbox-1337", blockHeight: 0, peers: 4 });
    setDeployLog("沙箱环境已重置");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/blockchain">区块链</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>开发组件</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">开发者门户</h1>
          <p className="text-sm text-gray-500 mt-1.5">SDK下载、API文档、代码示例、密钥管理与沙箱环境</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sdk"><Box className="h-4 w-4 mr-1.5" />SDK下载</TabsTrigger>
          <TabsTrigger value="api"><Globe className="h-4 w-4 mr-1.5" />API文档</TabsTrigger>
          <TabsTrigger value="code"><Code2 className="h-4 w-4 mr-1.5" />代码示例</TabsTrigger>
          <TabsTrigger value="keys"><Key className="h-4 w-4 mr-1.5" />API密钥</TabsTrigger>
          <TabsTrigger value="sandbox"><Terminal className="h-4 w-4 mr-1.5" />沙箱环境</TabsTrigger>
        </TabsList>

        {/* ─── SDK Download ─── */}
        <TabsContent value="sdk" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {(Object.keys(sdkData) as SdkLang[]).map(lang => {
              const latest = sdkData[lang][0];
              return (
                <Card
                  key={lang}
                  className={`cursor-pointer transition-all duration-200 ${selectedSdk === lang ? "ring-2 ring-indigo-500" : "hover:shadow-md"}`}
                  onClick={() => { setSelectedSdk(lang); setSelectedVersion(latest.version); }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{lang}</CardTitle>
                    <CardDescription className="text-xs">最新版本 {latest.version}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">发布于 {latest.releaseDate}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{latest.changelog}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedSdk} SDK</CardTitle>
                  <CardDescription>选择版本并查看详情</CardDescription>
                </div>
                <div className="flex gap-3 items-center">
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="选择版本" />
                    </SelectTrigger>
                    <SelectContent>
                      {sdkData[selectedSdk].map(sdk => (
                        <SelectItem key={sdk.version} value={sdk.version}>{sdk.version}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Download className="h-4 w-4 mr-1.5" />下载
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">版本号</p>
                  <p className="text-sm font-medium">{currentSdk.version}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">发布日期</p>
                  <p className="text-sm font-medium">{currentSdk.releaseDate}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">语言</p>
                  <p className="text-sm font-medium">{currentSdk.lang}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">更新日志</p>
                <p className="text-sm">{currentSdk.changelog}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速入门指南</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="install">
                  <AccordionTrigger>1. 安装SDK</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                      {selectedSdk === "Java" && "<dependency>\n  <groupId>com.example</groupId>\n  <artifactId>blockchain-sdk</artifactId>\n  <version>2.4.1</version>\n</dependency>"}
                      {selectedSdk === "Go" && "go get github.com/example/blockchain-sdk@v1.8.2"}
                      {selectedSdk === "Node.js" && "npm install @example/blockchain-sdk@3.2.0"}
                      {selectedSdk === "Python" && "pip install blockchain-sdk==4.1.3"}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="config">
                  <AccordionTrigger>2. 配置连接</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">在代码中配置API端点和密钥，建立与区块链网络的连接。</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="first">
                  <AccordionTrigger>3. 第一个请求</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">使用SDK发送第一个查询请求，获取链的基本信息。</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── API Documentation ─── */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>REST API 文档</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="搜索API..."
                    value={apiSearch}
                    onChange={e => setApiSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredApis.map(ep => (
                  <div key={ep.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedApi(expandedApi === ep.id ? null : ep.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={methodColors[ep.method] || "bg-gray-100 text-gray-700"}>{ep.method}</Badge>
                        <code className="text-sm font-mono">{ep.path}</code>
                        <span className="text-sm text-gray-600">{ep.description}</span>
                        {ep.auth && <Badge variant="secondary">需认证</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8"
                          onClick={e => { e.stopPropagation(); toggleBookmark(ep.id); }}
                        >
                          {bookmarkedApis.has(ep.id) ? <BookmarkCheck className="h-4 w-4 text-indigo-600" /> : <Bookmark className="h-4 w-4" />}
                        </Button>
                        {expandedApi === ep.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                    {expandedApi === ep.id && (
                      <div className="p-4 border-t bg-gray-50 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">请求参数</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>参数名</TableHead>
                                <TableHead>类型</TableHead>
                                <TableHead>必填</TableHead>
                                <TableHead>说明</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ep.parameters.map((param, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-mono text-xs">{param.name}</TableCell>
                                  <TableCell>{param.type}</TableCell>
                                  <TableCell>{param.required ? <Badge className="bg-red-100 text-red-700">是</Badge> : <Badge variant="outline">否</Badge>}</TableCell>
                                  <TableCell className="text-sm text-gray-600">{param.description}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">响应格式</h4>
                          <pre className="bg-white border p-3 rounded-lg text-xs font-mono overflow-x-auto">{ep.responseSchema}</pre>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">请求示例</h4>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">{ep.exampleRequest}</pre>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">响应示例</h4>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">{ep.exampleResponse}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredApis.length === 0 && (
                <div className="text-center py-8 text-gray-500">未找到匹配的API</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Code Examples ─── */}
        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>代码示例</CardTitle>
                <div className="flex gap-2">
                  {(Object.keys(codeExamples)).map(scenario => (
                    <Button
                      key={scenario}
                      variant={selectedScenario === scenario ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      {scenario}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {["Java", "Go", "Node.js", "Python"].map(lang => (
                    <Button
                      key={lang}
                      variant={selectedLang === lang ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLang(lang)}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto min-h-[200px]">
                    {codeExamples[selectedScenario][selectedLang]}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => copyCode(codeExamples[selectedScenario][selectedLang])}
                  >
                    {copiedCode ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedCode ? "已复制" : "复制"}
                  </Button>
                </div>
                <Button onClick={runInSandbox} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Play className="h-4 w-4 mr-1.5" />在沙箱中运行
                </Button>
                {sandboxResult && (
                  <pre className="bg-gray-50 border p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">{sandboxResult}</pre>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── API Key Management ─── */}
        <TabsContent value="keys" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">密钥总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{apiKeys.length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">活跃密钥</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{apiKeys.filter(k => k.status === "active").length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总调用次数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{apiKeys.reduce((sum, k) => sum + k.callCount, 0).toLocaleString()}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">平均错误率</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">{(apiKeys.reduce((sum, k) => sum + k.errorRate, 0) / (apiKeys.length || 1) * 100).toFixed(1)}%</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>API密钥列表</CardTitle>
                <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="h-4 w-4 mr-1.5" />新建密钥
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>新建API密钥</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">名称</label>
                        <Input placeholder="输入密钥名称" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">权限</label>
                        <Select value={newKeyPermissions} onValueChange={setNewKeyPermissions}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">只读</SelectItem>
                            <SelectItem value="read/write">读写</SelectItem>
                            <SelectItem value="read/write/admin">读写+管理</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">有效期（天）</label>
                        <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7天</SelectItem>
                            <SelectItem value="30">30天</SelectItem>
                            <SelectItem value="90">90天</SelectItem>
                            <SelectItem value="365">1年</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateKeyOpen(false)}>取消</Button>
                      <Button onClick={createApiKey} className="bg-indigo-600 hover:bg-indigo-700 text-white">创建</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>密钥ID</TableHead>
                    <TableHead>权限</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>最后使用</TableHead>
                    <TableHead>调用次数</TableHead>
                    <TableHead>错误率</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map(key => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-xs">{key.keyId}</TableCell>
                      <TableCell><Badge variant="outline">{key.permissions}</Badge></TableCell>
                      <TableCell>
                        {key.status === "active"
                          ? <Badge className="bg-green-100 text-green-700">活跃</Badge>
                          : <Badge className="bg-gray-100 text-gray-700">已撤销</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-xs">{key.createdAt}</TableCell>
                      <TableCell className="text-xs">{key.lastUsed}</TableCell>
                      <TableCell>{key.callCount.toLocaleString()}</TableCell>
                      <TableCell>{(key.errorRate * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        {key.status === "active" && (
                          <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => revokeKey(key.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Sandbox Environment ─── */}
        <TabsContent value="sandbox" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">网络状态</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${sandboxStatus.network === "online" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-lg font-bold">{sandboxStatus.network === "online" ? "在线" : "离线"}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">链ID</CardTitle></CardHeader>
              <CardContent><div className="text-lg font-bold font-mono">{sandboxStatus.chainId}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">区块高度</CardTitle></CardHeader>
              <CardContent><div className="text-lg font-bold">{sandboxStatus.blockHeight.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">对等节点</CardTitle></CardHeader>
              <CardContent><div className="text-lg font-bold">{sandboxStatus.peers}</div></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>测试代币水龙头</CardTitle>
                <CardDescription>向当前账户请求测试代币</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  每个账户每24小时可领取 1000 个测试代币
                </div>
                <Button
                  onClick={requestFaucet}
                  disabled={faucetRequested}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {faucetRequested ? <Check className="h-4 w-4 mr-1.5" /> : <Database className="h-4 w-4 mr-1.5" />}
                  {faucetRequested ? "领取成功" : "领取测试代币"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>沙箱合约部署</CardTitle>
                <CardDescription>仅部署到沙箱环境，不影响主网</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                  沙箱中的合约和交易数据会在重置后清除
                </div>
                <Button onClick={deployToSandbox} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Cpu className="h-4 w-4 mr-1.5" />部署示例合约
                </Button>
                {deployLog && (
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">{deployLog}</pre>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>沙箱操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" onClick={resetSandbox}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />重置沙箱环境
                </Button>
                <Button variant="outline" onClick={() => setSandboxStatus(prev => ({ ...prev, blockHeight: prev.blockHeight + 1 }))}>
                  <ChevronRight className="h-4 w-4 mr-1.5" />模拟出块
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
