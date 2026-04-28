import { useState, useMemo, useRef, useEffect } from "react";
import {
  ShoppingCart, Search, Star, Download, FileCode, ShieldCheck,
  Users, Eye, Plus, Pencil, Trash2, Check,   ChevronRight, ChevronLeft,
  AlertTriangle, Package, BarChart3, Award, MessageSquare, Reply,
  Lock, Unlock, BookOpen, Clock, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import * as echarts from "echarts";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface MarketContract {
  id: string;
  name: string;
  desc: string;
  category: string;
  author: string;
  authorCertified: boolean;
  rating: number;
  downloads: number;
  license: string;
  version: string;
  size: string;
  audit: string;
  tags: string[];
  dependencies: { name: string; versionRange: string }[];
  compatibility: string[];
}

interface InstalledContract {
  id: string;
  name: string;
  version: string;
  installTime: string;
  network: string;
  status: string;
}

interface Review {
  id: string;
  contractId: string;
  rating: number;
  text: string;
  author: string;
  time: string;
  replies: { author: string; text: string; time: string }[];
}

interface PublisherStats {
  contractId: string;
  downloads: number;
  rating: number;
  revenue: number;
  reviewsCount: number;
}

const initialMarketContracts: MarketContract[] = [
  { id: "MK-001", name: "标准存证合约", desc: "通用数据哈希上链存证，支持完整性校验", category: "存证", author: "InsightOne官方", authorCertified: true, rating: 4.8, downloads: 12560, license: "MIT", version: "v2.0.0", size: "12.5KB", audit: "已通过", tags: ["存证", "通用", "推荐"], dependencies: [{ name: "OpenZeppelin", versionRange: "^4.9.0" }], compatibility: ["Solidity ^0.8.0", "EVM Shanghai"] },
  { id: "MK-002", name: "ERC20代币合约", desc: "标准代币发行与管理，支持转账/授权/冻结", category: "金融", author: "OpenZeppelin", authorCertified: true, rating: 4.9, downloads: 89320, license: "MIT", version: "v4.9.0", size: "8.2KB", audit: "已通过", tags: ["代币", "金融"], dependencies: [], compatibility: ["Solidity ^0.8.0", "EVM Shanghai"] },
  { id: "MK-003", name: "数据授权合约", desc: "支持多级授权与期限管理的数据访问控制", category: "权限", author: "InsightOne官方", authorCertified: true, rating: 4.7, downloads: 6780, license: "Apache-2.0", version: "v1.1.0", size: "15.3KB", audit: "已通过", tags: ["授权", "权限"], dependencies: [{ name: "标准存证合约", versionRange: "^2.0.0" }], compatibility: ["Solidity ^0.8.0"] },
  { id: "MK-004", name: "供应链金融合约", desc: "应收账款确权与流转，支持多方背书", category: "金融", author: "某银行技术团队", authorCertified: false, rating: 4.5, downloads: 3420, license: "商业", version: "v1.0.0", size: "22.1KB", audit: "已通过", tags: ["供应链", "金融"], dependencies: [{ name: "ERC20代币合约", versionRange: "^4.9.0" }], compatibility: ["Solidity ^0.8.0"] },
  { id: "MK-005", name: "医疗数据共享合约", desc: "符合HIPAA标准的医疗数据授权共享", category: "医疗", author: "健康联盟", authorCertified: false, rating: 4.6, downloads: 2100, license: "Apache-2.0", version: "v1.0.0", size: "18.7KB", audit: "已通过", tags: ["医疗", "隐私"], dependencies: [], compatibility: ["Solidity ^0.8.0", "HIPAA合规"] },
  { id: "MK-006", name: "跨链资产桥合约", desc: "支持HTLC协议的跨链资产锁定与释放", category: "跨链", author: "InsightOne官方", authorCertified: true, rating: 4.4, downloads: 4560, license: "MIT", version: "v1.2.0", size: "25.4KB", audit: "已通过", tags: ["跨链", "资产桥"], dependencies: [{ name: "标准存证合约", versionRange: "^2.0.0" }], compatibility: ["Solidity ^0.8.0"] },
];

const initialMyContracts: InstalledContract[] = [
  { id: "INST-001", name: "数据资产存证合约", version: "v2.0.0", installTime: "2025-04-15", network: "金融联盟链", status: "installed" },
  { id: "INST-002", name: "数据授权合约", version: "v1.1.0", installTime: "2025-03-20", network: "政务数据链", status: "installed" },
];

const initialReviews: Review[] = [
  { id: "REV-001", contractId: "MK-001", rating: 5, text: "非常好用的存证合约，gas消耗很低", author: "用户A", time: "2025-04-20", replies: [{ author: "InsightOne官方", text: "感谢您的评价！", time: "2025-04-21" }] },
  { id: "REV-002", contractId: "MK-001", rating: 4, text: "功能完善，文档可以再详细一些", author: "用户B", time: "2025-04-18", replies: [] },
  { id: "REV-003", contractId: "MK-001", rating: 5, text: "生产环境稳定运行3个月", author: "用户C", time: "2025-04-15", replies: [] },
  { id: "REV-004", contractId: "MK-001", rating: 4, text: "集成简单，推荐", author: "用户D", time: "2025-04-10", replies: [] },
  { id: "REV-005", contractId: "MK-001", rating: 3, text: "基本功能都有，但缺少批量接口", author: "用户E", time: "2025-04-05", replies: [{ author: "InsightOne官方", text: "v2.0.0已新增批量接口", time: "2025-04-06" }] },
];

const publisherStats: PublisherStats[] = [
  { contractId: "MK-001", downloads: 12560, rating: 4.8, revenue: 62800, reviewsCount: 45 },
  { contractId: "MK-003", downloads: 6780, rating: 4.7, revenue: 33900, reviewsCount: 23 },
  { contractId: "MK-006", downloads: 4560, rating: 4.4, revenue: 22800, reviewsCount: 18 },
];

const crudFields: FieldConfig[] = [
  { key: "name", label: "合约名称", type: "text", required: true, placeholder: "输入合约名称" },
  { key: "desc", label: "描述", type: "textarea", required: true, placeholder: "输入合约描述" },
  { key: "category", label: "分类", type: "text", required: true, placeholder: "输入分类" },
  { key: "author", label: "作者", type: "text", required: true, placeholder: "输入作者" },
  { key: "rating", label: "评分", type: "number", required: true, placeholder: "输入评分" },
  { key: "downloads", label: "下载量", type: "number", required: true, placeholder: "输入下载量" },
  { key: "license", label: "许可证", type: "text", required: true, placeholder: "输入许可证" },
  { key: "version", label: "版本", type: "text", required: true, placeholder: "输入版本号" },
  { key: "size", label: "大小", type: "text", required: true, placeholder: "输入合约大小" },
  { key: "audit", label: "审计状态", type: "text", required: true, placeholder: "输入审计状态" },
  { key: "tags", label: "标签", type: "text", required: true, placeholder: "用逗号分隔多个标签" },
];

const detailFields = [
  { key: "id", label: "合约ID" },
  { key: "name", label: "合约名称" },
  { key: "desc", label: "描述" },
  { key: "category", label: "分类", type: "badge" as const },
  { key: "author", label: "作者" },
  { key: "rating", label: "评分" },
  { key: "downloads", label: "下载量" },
  { key: "license", label: "许可证", type: "badge" as const },
  { key: "version", label: "版本", type: "badge" as const },
  { key: "size", label: "大小" },
  { key: "audit", label: "审计状态", type: "badge" as const },
  { key: "tags", label: "标签", type: "list" as const },
];

export default function ContractMarket() {
  const [marketContracts, setMarketContracts] = useState<MarketContract[]>(initialMarketContracts);
  const [myContracts, setMyContracts] = useState<InstalledContract[]>(initialMyContracts);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedContract, setSelectedContract] = useState<MarketContract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Install wizard
  const [installOpen, setInstallOpen] = useState(false);
  const [installContract, setInstallContract] = useState<MarketContract | null>(null);
  const [installStep, setInstallStep] = useState(0);
  const [installNetwork, setInstallNetwork] = useState("");
  const [installChannel, setInstallChannel] = useState("");
  const [installParams, setInstallParams] = useState<Record<string, string>>({});
  const [installProgress, setInstallProgress] = useState(0);
  const [installDepsResolved, setInstallDepsResolved] = useState(false);
  const [installDeps, setInstallDeps] = useState<{ name: string; status: "pending" | "resolved" | "conflict" }[]>([]);

  // Rating
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingContract, setRatingContract] = useState<MarketContract | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyReview, setReplyReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  // License
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [licenseContract, setLicenseContract] = useState<MarketContract | null>(null);
  const [licenseAgreed, setLicenseAgreed] = useState(false);

  // Constraints
  const [constraintsOpen, setConstraintsOpen] = useState(false);
  const [constraintsContract, setConstraintsContract] = useState<MarketContract | null>(null);

  // Publisher
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [publisherContract, setPublisherContract] = useState<MarketContract | null>(null);

  const filtered = marketContracts.filter(c =>
    c.name.includes(search) || c.category.includes(search) || c.tags.some(t => t.includes(search))
  );

  const openCreate = () => {
    setSelectedContract(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const openEdit = (contract: MarketContract) => {
    setSelectedContract(contract);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const openDelete = (contract: MarketContract) => {
    setSelectedContract(contract);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const openView = (contract: MarketContract) => {
    setSelectedContract(contract);
    setDrawerOpen(true);
  };

  const handleSubmit = (formData: Record<string, unknown>) => {
    const tags = String(formData.tags || "").split(",").map(t => t.trim()).filter(Boolean);
    const payload: MarketContract = {
      id: selectedContract?.id || `MK-${String(marketContracts.length + 1).padStart(3, "0")}`,
      name: String(formData.name || ""),
      desc: String(formData.desc || ""),
      category: String(formData.category || ""),
      author: String(formData.author || ""),
      authorCertified: false,
      rating: Number(formData.rating) || 0,
      downloads: Number(formData.downloads) || 0,
      license: String(formData.license || ""),
      version: String(formData.version || ""),
      size: String(formData.size || ""),
      audit: String(formData.audit || ""),
      tags,
      dependencies: [],
      compatibility: [],
    };

    if (dialogMode === "create") {
      setMarketContracts(prev => [...prev, payload]);
    } else if (dialogMode === "edit" && selectedContract) {
      setMarketContracts(prev => prev.map(c => (c.id === selectedContract.id ? payload : c)));
    }
  };

  const handleDelete = () => {
    if (selectedContract) {
      setMarketContracts(prev => prev.filter(c => c.id !== selectedContract.id));
    }
  };

  const openInstall = (contract: MarketContract) => {
    setInstallContract(contract);
    setInstallStep(0);
    setInstallNetwork("");
    setInstallChannel("");
    setInstallParams({});
    setInstallProgress(0);
    setInstallDepsResolved(false);
    setInstallDeps(contract.dependencies.map(d => ({ name: d.name, status: "pending" })));
    setLicenseAgreed(false);
    setLicenseContract(contract);
    setLicenseOpen(true);
  };

  const startInstall = () => {
    setLicenseOpen(false);
    setInstallOpen(true);
  };

  const resolveDeps = () => {
    setInstallDepsResolved(true);
    setInstallDeps(prev => prev.map(d => ({ ...d, status: Math.random() > 0.1 ? "resolved" : "conflict" })));
  };

  const runInstall = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setInstallProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        if (installContract) {
          setMyContracts(prev => [...prev, {
            id: Date.now().toString(36).toUpperCase(),
            name: installContract.name,
            version: installContract.version,
            installTime: new Date().toISOString().slice(0, 10),
            network: installNetwork || "默认网络",
            status: "installed",
          }]);
          setMarketContracts(prev => prev.map(c => c.id === installContract.id ? { ...c, downloads: c.downloads + 1 } : c));
        }
        setTimeout(() => setInstallOpen(false), 500);
      }
    }, 200);
  };

  const openRating = (contract: MarketContract) => {
    setRatingContract(contract);
    setRatingValue(0);
    setRatingText("");
    setRatingOpen(true);
  };

  const submitRating = () => {
    if (!ratingContract || ratingValue === 0) return;
    const newReview: Review = {
      id: Date.now().toString(36).toUpperCase(),
      contractId: ratingContract.id,
      rating: ratingValue,
      text: ratingText,
      author: "当前用户",
      time: new Date().toISOString().slice(0, 10),
      replies: [],
    };
    setReviews(prev => [...prev, newReview]);
    // Update average rating
    const contractReviews = reviews.filter(r => r.contractId === ratingContract.id);
    const allRatings = [...contractReviews.map(r => r.rating), ratingValue];
    const avg = Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1));
    setMarketContracts(prev => prev.map(c => c.id === ratingContract.id ? { ...c, rating: avg } : c));
    setRatingOpen(false);
  };

  const openReply = (review: Review) => {
    setReplyReview(review);
    setReplyText("");
    setReplyOpen(true);
  };

  const submitReply = () => {
    if (!replyReview || !replyText.trim()) return;
    setReviews(prev => prev.map(r => r.id === replyReview.id ? { ...r, replies: [...r.replies, { author: "当前用户", text: replyText, time: new Date().toISOString().slice(0, 10) }] } : r));
    setReplyOpen(false);
  };

  const openConstraints = (contract: MarketContract) => {
    setConstraintsContract(contract);
    setConstraintsOpen(true);
  };

  const openPublisher = (contract: MarketContract) => {
    setPublisherContract(contract);
    setPublisherOpen(true);
  };

  const dialogData = selectedContract
    ? { ...selectedContract, tags: selectedContract.tags.join(", ") }
    : undefined;

  // ECharts rating distribution
  const ratingChartRef = useRef<HTMLDivElement | null>(null);
  const contractReviews = ratingContract ? reviews.filter(r => r.contractId === ratingContract.id) : [];
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    contractReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [contractReviews]);

  useEffect(() => {
    if (!ratingOpen || !ratingChartRef.current) return;
    const chart = echarts.init(ratingChartRef.current);
    const option: echarts.EChartsOption = {
      grid: { left: "3%", right: "4%", bottom: "3%", top: "3%", containLabel: true },
      xAxis: { type: "value", minInterval: 1 },
      yAxis: { type: "category", data: ["5星", "4星", "3星", "2星", "1星"], inverse: true },
      series: [{
        type: "bar",
        data: ratingDist.slice().reverse(),
        itemStyle: { color: "#fbbf24", borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: "right" },
      }],
    };
    chart.setOption(option);
    return () => { chart.dispose(); };
  }, [ratingOpen, ratingDist]);

  const licenseText: Record<string, string> = {
    "MIT": "MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy...",
    "Apache-2.0": "Apache License 2.0\n\nLicensed under the Apache License, Version 2.0...",
    "GPL": "GNU General Public License\n\nThis program is free software: you can redistribute it and/or modify...",
    "商业": "商业许可证\n\n本合约受商业许可证保护，使用前需获得授权...",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">智能合约市场</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">浏览、下载与安装经过审计的智能合约模板</p>
        </div>
        <Button onClick={openCreate} className="gap-1">
          <Plus className="w-4 h-4" /> 新建合约
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "合约总数", value: marketContracts.length, icon: <FileCode className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "总下载量", value: marketContracts.reduce((s, c) => s + c.downloads, 0).toLocaleString(), icon: <Download className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "已安装", value: myContracts.length, icon: <ShoppingCart className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "审计通过", value: marketContracts.filter(c => c.audit === "已通过").length, icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="market">合约市场</TabsTrigger>
          <TabsTrigger value="installed">已安装</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索合约/分类/标签" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-[#1e293b] hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{c.category}</Badge>
                  <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /><span className="text-sm font-medium">{c.rating}</span></div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{c.name}</h3>
                  {c.authorCertified && <span title="认证发布者"><Award className="w-4 h-4 text-blue-500" /></span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{c.desc}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.author}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />{c.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={() => openInstall(c)}><Download className="w-3 h-3" /> 安装</Button>
                  <Button size="sm" variant="outline" onClick={() => openView(c)}><Eye className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => openRating(c)}><Star className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => openConstraints(c)}><Lock className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => openPublisher(c)}><BarChart3 className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => openDelete(c)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="pt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["合约名称", "版本", "安装时间", "所属网络", "状态", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myContracts.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{c.version}</Badge></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.installTime}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.network}</td>
                    <td className="px-4 py-3"><Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">已安装</Badge></td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" className="gap-1"><FileCode className="w-3 h-3" /> 查看</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedContract?.name || "合约"}
        fields={crudFields}
        data={dialogData}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedContract?.name || "合约详情"}
        data={selectedContract || {}}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedContract) openEdit(selectedContract);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedContract) openDelete(selectedContract);
        }}
      />

      {/* License Dialog */}
      <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> 许可协议
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 text-sm whitespace-pre-wrap">
            {licenseText[licenseContract?.license || "MIT"] || "请仔细阅读许可协议..."}
          </div>
          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="agree" checked={licenseAgreed} onChange={e => setLicenseAgreed(e.target.checked)} className="rounded" />
            <label htmlFor="agree" className="text-sm">我已阅读并同意上述许可协议</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLicenseOpen(false)}>取消</Button>
            <Button disabled={!licenseAgreed} className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={startInstall}>
              <Check className="w-4 h-4 mr-1" /> 同意并继续
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Install Wizard */}
      <Dialog open={installOpen} onOpenChange={setInstallOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" /> 安装向导 — {installContract?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            {["选择网络", "配置参数", "依赖解析", "预览", "安装"].map((s, i) => (
              <div key={i} className={cn("flex items-center gap-1 text-xs", i <= installStep ? "text-indigo-600" : "text-slate-400")}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", i <= installStep ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500")}>{i + 1}</div>
                <span>{s}</span>
                {i < 4 && <ChevronRight className="w-3 h-3" />}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto py-4">
            {installStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">选择网络</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={installNetwork} onChange={e => setInstallNetwork(e.target.value)}>
                    <option value="">请选择...</option>
                    <option>金融联盟链</option>
                    <option>政务数据链</option>
                    <option>医疗数据链</option>
                    <option>跨链网络</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">选择通道</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={installChannel} onChange={e => setInstallChannel(e.target.value)}>
                    <option value="">请选择...</option>
                    <option>channel-1</option>
                    <option>channel-2</option>
                    <option>channel-3</option>
                  </select>
                </div>
              </div>
            )}
            {installStep === 1 && (
              <div className="space-y-4">
                {["管理员地址", "Gas上限", "初始化参数"].map((param) => (
                  <div key={param} className="space-y-2">
                    <label className="text-sm font-medium">{param}</label>
                    <Input value={installParams[param] || ""} onChange={e => setInstallParams({ ...installParams, [param]: e.target.value })} placeholder={`输入${param}`} />
                  </div>
                ))}
              </div>
            )}
            {installStep === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">依赖解析</div>
                <div className="space-y-2">
                  {installDeps.map((dep) => (
                    <div key={dep.name} className={cn("flex items-center gap-2 p-3 rounded-lg border", dep.status === "resolved" ? "bg-emerald-50 border-emerald-200" : dep.status === "conflict" ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200")}>
                      {dep.status === "resolved" ? <Check className="w-4 h-4 text-emerald-600" /> : dep.status === "conflict" ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm">{dep.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">{dep.status === "resolved" ? "已解析" : dep.status === "conflict" ? "冲突" : "待解析"}</Badge>
                    </div>
                  ))}
                </div>
                {!installDepsResolved && (
                  <Button variant="outline" onClick={resolveDeps}><RefreshCw className="w-4 h-4 mr-1" /> 解析依赖</Button>
                )}
              </div>
            )}
            {installStep === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">安装预览</div>
                <div className="border rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">合约</span><span>{installContract?.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">版本</span><span>{installContract?.version}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">网络</span><span>{installNetwork || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">通道</span><span>{installChannel || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">许可证</span><Badge variant="outline">{installContract?.license}</Badge></div>
                </div>
              </div>
            )}
            {installStep === 4 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">安装进度</div>
                <Progress value={installProgress} />
                <div className="text-center text-sm text-slate-500">{installProgress}%</div>
                {installProgress >= 100 && <div className="text-center text-emerald-600 font-medium">安装完成！</div>}
              </div>
            )}
          </div>
          <DialogFooter>
            {installStep > 0 && installStep < 4 && <Button variant="outline" onClick={() => setInstallStep(installStep - 1)}><ChevronLeft className="w-4 h-4 mr-1" /> 上一步</Button>}
            {installStep < 3 && <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setInstallStep(installStep + 1)}>下一步 <ChevronRight className="w-4 h-4 ml-1" /></Button>}
            {installStep === 3 && <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { setInstallStep(4); runInstall(); }}>开始安装</Button>}
            {installStep === 4 && installProgress >= 100 && <Button onClick={() => setInstallOpen(false)}>完成</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" /> 评分与评论 — {ratingContract?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">评分分布</div>
                <div ref={ratingChartRef} style={{ width: "100%", height: 200 }} />
                <div className="text-center">
                  <div className="text-3xl font-bold">{ratingContract?.rating}</div>
                  <div className="text-sm text-slate-500">{contractReviews.length} 条评价</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium">发表评论</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRatingValue(s)} className="p-1">
                      <Star className={cn("w-6 h-6", s <= ratingValue ? "text-amber-400 fill-current" : "text-slate-300")} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border rounded-lg p-3 text-sm resize-none min-h-[80px]"
                  placeholder="写下您的评价..."
                  value={ratingText}
                  onChange={e => setRatingText(e.target.value)}
                />
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={submitRating} disabled={ratingValue === 0}>提交评价</Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-medium">评论列表</div>
              {contractReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.author}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-amber-400 fill-current" : "text-slate-300")} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{review.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{review.text}</p>
                  {review.replies.length > 0 && (
                    <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                      {review.replies.map((reply, i) => (
                        <div key={i}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{reply.author}</span>
                            <span className="text-xs text-slate-400">{reply.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => openReply(review)}><Reply className="w-3 h-3 mr-1" />回复</Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>回复评论</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full border rounded-lg p-3 text-sm resize-none min-h-[80px]"
            placeholder="写下您的回复..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={submitReply}>回复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Constraints Dialog */}
      <Dialog open={constraintsOpen} onOpenChange={setConstraintsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> 版本约束 — {constraintsContract?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">兼容性信息</div>
              <div className="flex flex-wrap gap-1">
                {constraintsContract?.compatibility.map((c, i) => (
                  <Badge key={i} variant="secondary">{c}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">依赖版本约束</div>
              <div className="space-y-2">
                {constraintsContract?.dependencies.length === 0 && <div className="text-sm text-slate-400">无依赖</div>}
                {constraintsContract?.dependencies.map((dep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">{dep.name}</span>
                    <Badge variant="outline">{dep.versionRange}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">冲突检测</div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">未检测到版本冲突</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setConstraintsOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publisher Portal Dialog */}
      <Dialog open={publisherOpen} onOpenChange={setPublisherOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> 发布者门户 — {publisherContract?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 py-2">
            {(() => {
              const stats = publisherStats.find(s => s.contractId === publisherContract?.id);
              if (!stats) return <div className="text-sm text-slate-400">暂无统计数据</div>;
              return (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">{stats.downloads.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">下载量</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">{stats.rating}</div>
                      <div className="text-xs text-slate-500">评分</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">¥{stats.revenue.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">预估收益</div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="text-sm font-medium">发布者认证</div>
                    <div className="flex items-center gap-2">
                      {publisherContract?.authorCertified ? (
                        <>
                          <Award className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-blue-700">已认证发布者</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <span className="text-sm text-amber-700">未认证</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="text-sm font-medium">合约更新</div>
                    <div className="flex items-center gap-2">
                      <Input placeholder="新版本号 (如 v2.1.0)" className="flex-1" />
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">发布更新</Button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button onClick={() => setPublisherOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
