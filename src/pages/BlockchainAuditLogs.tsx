import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import {
  Search, Filter, CheckCircle, Calendar,
  ChevronDown, ChevronUp, FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    logType: "数据开发业务(已上链)",
    rawLog: '{"connectorName":"苏州睿影信息科技有限公司互联网区连接器","identityId":"","operation":"连接器注册","param":"..."}',
    blockNumber: "131501",
    chainStatus: "chained",
  },
  {
    id: "LOG-002",
    time: "2026-04-28 10:15:32",
    logType: "数据产品(已上链)",
    rawLog: '{"productId":"PROD-424","operation":"产品发布","status":"published","publisher":"济南大数据集团"}',
    blockNumber: "131502",
    chainStatus: "chained",
  },
  {
    id: "LOG-003",
    time: "2026-04-28 11:22:18",
    logType: "审批操作日志(已上链)",
    rawLog: '{"approvalId":"APP-001","operation":"审批通过","approver":"管理员","target":"乳腺癌筛查模型"}',
    blockNumber: "131503",
    chainStatus: "chained",
  },
  {
    id: "LOG-004",
    time: "2026-04-28 12:05:44",
    logType: "子空间业务(已上链)",
    rawLog: '{"sceneId":"SCENE-001","operation":"场景启用","operator":"中电云计算","timestamp":"2026-04-28T12:05:44"}',
    blockNumber: "131504",
    chainStatus: "chained",
  },
  {
    id: "LOG-005",
    time: "2026-04-28 13:30:12",
    logType: "数据产品交易业务(已上链)",
    rawLog: '{"tradeId":"TRADE-001","buyer":"山东轨道集团","seller":"济南大数据集团","product":"气象数据服务"}',
    blockNumber: "131505",
    chainStatus: "chained",
  },
  {
    id: "LOG-006",
    time: "2026-04-28 14:18:56",
    logType: "心跳连接检查日志",
    rawLog: '{"node":"山东区块链研究院","status":"online","latency":"12ms","checkTime":"2026-04-28T14:18:56"}',
    blockNumber: "—",
    chainStatus: "pending",
  },
];

const logTypes = [
  "数据产品(已上链)",
  "数据开发业务(已上链)",
  "子空间业务(已上链)",
  "数据产品交易业务(已上链)",
  "审批操作日志(已上链)",
  "心跳连接检查日志",
];

export default function BlockchainAuditLogs() {
  const [logs, setLogs] = useState<BlockchainLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [jsonMode, setJsonMode] = useState<Set<string>>(new Set());

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

  const handleVerify = (id: string) => {
    toast.success("日志校验通过，链上数据完整");
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
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
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
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          校验
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">区块链审计日志</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索关键字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <Input type="date" className="w-40" />
            <span>至</span>
            <Input type="date" className="w-40" />
          </div>
          <Button variant="outline" size="sm">查询</Button>
          <Button variant="ghost" size="sm">重置</Button>
        </div>

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

      {/* Trend Chart Placeholder */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium mb-4">日志发展趋势</h3>
        <div className="h-40 flex items-end gap-8 px-8">
          {[
            { date: "04-25", count: 1 },
            { date: "04-26", count: 2 },
            { date: "04-27", count: 4 },
            { date: "04-28", count: 6 },
          ].map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-indigo-500 rounded-t-md transition-all"
                style={{ height: `${item.count * 40}px` }}
              />
              <span className="text-xs text-gray-500">{item.date}</span>
              <span className="text-xs text-gray-400">{item.count}条</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
