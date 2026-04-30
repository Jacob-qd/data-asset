import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import {
  CheckCircle, Calendar, RefreshCw,
  ChevronDown, ChevronUp, FileJson, Shield,
  Users, Network, Database, Activity, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as echarts from "echarts";

interface BlockchainLog {
  id: string;
  time: string;
  logType: string;
  rawLog: string;
  blockNumber: string;
  chainStatus: string;
  expanded?: boolean;
}

const mockLogs: BlockchainLog[] = [
  {
    id: "LOG-001",
    time: "2026-04-28 09:34:26",
    logType: "连接管理(已上链)",
    rawLog: '{"connectorName":"科技公司甲互联网区连接器","identityId":"ID-001","operation":"连接器注册","param":"{\"type\":\"MySQL\",\"host\":\"192.168.1.100\"}"}',
    blockNumber: "131501",
    chainStatus: "chained",
  },
  {
    id: "LOG-002",
    time: "2026-04-28 10:15:32",
    logType: "用户身份管理(已上链)",
    rawLog: '{"userId":"USER-1001","operation":"用户注册","role":"数据分析师","org":"科技公司甲","timestamp":"2026-04-28T10:15:32"}',
    blockNumber: "131502",
    chainStatus: "chained",
  },
  {
    id: "LOG-003",
    time: "2026-04-28 11:22:18",
    logType: "业务节点管理(已上链)",
    rawLog: '{"nodeId":"NODE-A001","operation":"节点上线","nodeType":"隐私计算节点","org":"数据研究院乙","status":"online"}',
    blockNumber: "131503",
    chainStatus: "chained",
  },
  {
    id: "LOG-004",
    time: "2026-04-28 12:05:44",
    logType: "标识管理(已上链)",
    rawLog: '{"identifier":"DID-2026-001","operation":"标识注册","owner":"金融科技丁","type":"数据资产标识","status":"active"}',
    blockNumber: "131504",
    chainStatus: "chained",
  },
  {
    id: "LOG-005",
    time: "2026-04-28 13:30:12",
    logType: "数据产品交易业务(已上链)",
    rawLog: '{"tradeId":"TRADE-001","buyer":"智能科技丙","seller":"金融科技丁","product":"客户画像数据服务","amount":50000}',
    blockNumber: "131505",
    chainStatus: "chained",
  },
  {
    id: "LOG-006",
    time: "2026-04-28 14:18:56",
    logType: "审批操作日志(已上链)",
    rawLog: '{"approvalId":"APP-001","operation":"审批通过","approver":"管理员","target":"医疗数据使用申请","resource":"患者诊疗记录"}',
    blockNumber: "131506",
    chainStatus: "chained",
  },
  {
    id: "LOG-007",
    time: "2026-04-28 15:45:22",
    logType: "数据开发业务(已上链)",
    rawLog: '{"taskId":"TASK-001","operation":"数据清洗","dataset":"用户行为日志","records":500000,"executor":"数据研究院乙"}',
    blockNumber: "131507",
    chainStatus: "chained",
  },
  {
    id: "LOG-008",
    time: "2026-04-28 16:30:10",
    logType: "连接管理(已上链)",
    rawLog: '{"connectorName":"金融科技丁连接器","identityId":"ID-002","operation":"连接器状态更新","status":"active","latency":"8ms"}',
    blockNumber: "131508",
    chainStatus: "chained",
  },
  {
    id: "LOG-009",
    time: "2026-04-28 17:20:45",
    logType: "心跳连接检查日志",
    rawLog: '{"node":"山东区块链研究院","status":"online","latency":"12ms","checkTime":"2026-04-28T17:20:45","peers":8}',
    blockNumber: "—",
    chainStatus: "pending",
  },
  {
    id: "LOG-010",
    time: "2026-04-28 18:10:33",
    logType: "用户身份管理(已上链)",
    rawLog: '{"userId":"USER-1002","operation":"权限变更","role":"管理员","org":"智能科技丙","permissions":["数据读取","模型训练"]}',
    blockNumber: "131509",
    chainStatus: "chained",
  },
];

const logTypes = [
  "连接管理(已上链)",
  "用户身份管理(已上链)",
  "业务节点管理(已上链)",
  "标识管理(已上链)",
  "数据产品交易业务(已上链)",
  "审批操作日志(已上链)",
  "数据开发业务(已上链)",
  "心跳连接检查日志",
];

const logTypeStats = [
  { type: "连接管理", count: 2, icon: Network, color: "bg-blue-50 text-blue-700" },
  { type: "用户身份", count: 2, icon: Users, color: "bg-green-50 text-green-700" },
  { type: "业务节点", count: 1, icon: Database, color: "bg-purple-50 text-purple-700" },
  { type: "标识管理", count: 1, icon: Shield, color: "bg-amber-50 text-amber-700" },
  { type: "数据交易", count: 1, icon: Activity, color: "bg-rose-50 text-rose-700" },
  { type: "审批操作", count: 1, icon: CheckCircle, color: "bg-cyan-50 text-cyan-700" },
  { type: "数据开发", count: 1, icon: Database, color: "bg-indigo-50 text-indigo-700" },
];

export default function BlockchainAuditLogs() {
  const [logs, setLogs] = useState<BlockchainLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [jsonMode, setJsonMode] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 生成近7天的日志趋势数据
  const generateTrendData = () => {
    const dates = [];
    const counts = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(`${date.getMonth() + 1}-${date.getDate()}`);
      counts.push(Math.floor(Math.random() * 15) + 5);
    }
    return { dates, counts };
  };

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      const { dates, counts } = generateTrendData();
      
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: dates,
          axisLine: { lineStyle: { color: "#e5e7eb" } },
          axisLabel: { color: "#6b7280" },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "#f3f4f6" } },
          axisLabel: { color: "#6b7280" },
        },
        series: [
          {
            name: "日志数量",
            type: "bar",
            data: counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#6366f1" },
                { offset: 1, color: "#818cf8" },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            barWidth: "40%",
          },
        ],
      };

      chartInstance.current.setOption(option);

      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog: BlockchainLog = {
          id: `LOG-${Date.now()}`,
          time: new Date().toISOString().slice(0, 19).replace("T", " "),
          logType: "心跳连接检查日志",
          rawLog: `{"node":"区块链节点${Math.floor(Math.random() * 5) + 1}","status":"online","latency":"${Math.floor(Math.random() * 20) + 5}ms","checkTime":"${new Date().toISOString()}"}`,
          blockNumber: "—",
          chainStatus: "pending",
        };
        return [newLog, ...prev.slice(0, 49)];
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLogs = logs.filter((log) => {
    const matchSearch = log.rawLog.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter.length === 0 || typeFilter.includes(log.logType);
    return matchSearch && matchType;
  });

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const toggleJsonMode = (id: string) => {
    const newSet = new Set(jsonMode);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setJsonMode(newSet);
  };

  const [verifyingLogs, setVerifyingLogs] = useState<Set<string>>(new Set());
  const [verifiedLogs, setVerifiedLogs] = useState<Set<string>>(new Set());

  const handleVerify = (id: string) => {
    setVerifyingLogs(new Set(verifyingLogs).add(id));
    
    setTimeout(() => {
      setVerifyingLogs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      const log = logs.find((l) => l.id === id);
      if (log?.chainStatus === "chained") {
        setVerifiedLogs(new Set(verifiedLogs).add(id));
        toast.success(`日志校验通过\n区块哈希: 0x${Math.random().toString(16).slice(2, 10)}...\n校验时间: ${new Date().toLocaleTimeString()}\n链上数据完整无误`);
      } else {
        toast.error("日志校验失败：该日志尚未上链");
      }
    }, 1500);
  };

  const renderExpandedContent = (row: BlockchainLog) => {
    const isJsonMode = jsonMode.has(row.id);
    let parsedLog: Record<string, unknown> = {};
    try {
      parsedLog = JSON.parse(row.rawLog);
    } catch {
      parsedLog = { raw: row.rawLog };
    }

    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">日志详情</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 text-xs", !isJsonMode && "bg-white shadow-sm")}
              onClick={() => toggleJsonMode(row.id)}
            >
              普通模式
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 text-xs", isJsonMode && "bg-white shadow-sm")}
              onClick={() => toggleJsonMode(row.id)}
            >
              <FileJson className="w-3 h-3 mr-1" />
              Json模式
            </Button>
          </div>
        </div>
        {isJsonMode ? (
          <pre className="bg-white p-3 rounded border text-xs font-mono overflow-auto max-h-60">
            {JSON.stringify(parsedLog, null, 2)}
          </pre>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(parsedLog).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-500 mb-1">{key}</div>
                <div className="text-sm text-gray-800 break-all">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      key: "expand",
      title: "",
      width: "w-10",
      render: (row: BlockchainLog) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => toggleExpand(row.id)}
        >
          {expandedRows.has(row.id) ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      ),
    },
    {
      key: "time",
      title: "时间",
      render: (row: BlockchainLog) => <span className="text-sm text-gray-600">{row.time}</span>,
    },
    {
      key: "logType",
      title: "日志类型",
      render: (row: BlockchainLog) => (
        <Badge variant={row.logType.includes("已上链") ? "default" : "secondary"}>
          {row.logType}
        </Badge>
      ),
    },
    {
      key: "rawLog",
      title: "原始日志",
      render: (row: BlockchainLog) => (
        <div className="max-w-md truncate text-sm text-gray-600">
          {row.rawLog}
        </div>
      ),
    },
    {
      key: "blockNumber",
      title: "上链区块",
      render: (row: BlockchainLog) => (
        <span className="text-sm font-mono">{row.blockNumber}</span>
      ),
    },
    {
      key: "chainStatus",
      title: "上链状态",
      render: (row: BlockchainLog) => (
        <div className="flex items-center gap-1.5">
          {row.chainStatus === "chained" ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">已上链</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">未上链</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      width: "w-32",
      render: (row: BlockchainLog) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVerify(row.id)}
          disabled={verifyingLogs.has(row.id)}
        >
          {verifyingLogs.has(row.id) ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              校验中...
            </span>
          ) : verifiedLogs.has(row.id) ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-green-600">已校验</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-1" />
              校验
            </>
          )}
        </Button>
      ),
    },
  ];

  const chainedCount = logs.filter((l) => l.chainStatus === "chained").length;
  const pendingCount = logs.filter((l) => l.chainStatus === "pending").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="区块链审计日志"
        badge={`${logs.length} 条`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">自动刷新</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                autoRefresh ? "bg-indigo-600" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  autoRefresh ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总日志数</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Database className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已上链</p>
                <p className="text-2xl font-bold text-green-600">{chainedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待上链</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">上链率</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {logs.length > 0 ? Math.round((chainedCount / logs.length) * 100) : 0}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <PageSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="搜索关键字..."
          onReset={() => setSearchTerm("")}
          extraFilters={
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input type="date" className="w-40" />
              <span>至</span>
              <Input type="date" className="w-40" />
            </div>
          }
          className="border-0 p-0"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">日志类型：</span>
          {logTypes.map((type) => (
            <Badge
              key={type}
              variant={typeFilter.includes(type) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (typeFilter.includes(type)) {
                  setTypeFilter(typeFilter.filter((t) => t !== type));
                } else {
                  setTypeFilter([...typeFilter, type]);
                }
              }}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">日志发展趋势（近7天）</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="h-64" />
        </CardContent>
      </Card>

      {/* Quick Analysis */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium mb-4">快速分析</h3>
        <div className="grid grid-cols-7 gap-3">
          {logTypeStats.map((stat) => (
            <div key={stat.type} className={cn("p-3 rounded-lg border", stat.color)}>
              <stat.icon className="w-5 h-5 mb-2" />
              <div className="text-lg font-bold">{stat.count}</div>
              <div className="text-xs opacity-80">{stat.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium">日志详情</h3>
        </div>
        <div className="p-4">
          <DataTable
            data={filteredLogs}
            columns={columns}
            rowKey={(row) => row.id}
          />
          {filteredLogs.map((row) =>
            expandedRows.has(row.id) ? (
              <div key={`expanded-${row.id}`} className="mt-2">
                {renderExpandedContent(row)}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
