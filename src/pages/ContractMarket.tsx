import { useState } from "react";
import {
  ShoppingCart, Search, Star, Download, FileCode, ShieldCheck,
  Users, Clock, ChevronRight, Tag, Eye, Heart, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Contract Market ─── */
const marketContracts = [
  { id: "MK-001", name: "标准存证合约", desc: "通用数据哈希上链存证，支持完整性校验", category: "存证", author: "InsightOne官方", rating: 4.8, downloads: 12560, license: "MIT", version: "v2.0.0", size: "12.5KB", audit: "已通过", tags: ["存证", "通用", "推荐"] },
  { id: "MK-002", name: "ERC20代币合约", desc: "标准代币发行与管理，支持转账/授权/冻结", category: "金融", author: "OpenZeppelin", rating: 4.9, downloads: 89320, license: "MIT", version: "v4.9.0", size: "8.2KB", audit: "已通过", tags: ["代币", "金融"] },
  { id: "MK-003", name: "数据授权合约", desc: "支持多级授权与期限管理的数据访问控制", category: "权限", author: "InsightOne官方", rating: 4.7, downloads: 6780, license: "Apache-2.0", version: "v1.1.0", size: "15.3KB", audit: "已通过", tags: ["授权", "权限"] },
  { id: "MK-004", name: "供应链金融合约", desc: "应收账款确权与流转，支持多方背书", category: "金融", author: "某银行技术团队", rating: 4.5, downloads: 3420, license: "商业", version: "v1.0.0", size: "22.1KB", audit: "已通过", tags: ["供应链", "金融"] },
  { id: "MK-005", name: "医疗数据共享合约", desc: "符合HIPAA标准的医疗数据授权共享", category: "医疗", author: "健康联盟", rating: 4.6, downloads: 2100, license: "Apache-2.0", version: "v1.0.0", size: "18.7KB", audit: "已通过", tags: ["医疗", "隐私"] },
  { id: "MK-006", name: "跨链资产桥合约", desc: "支持HTLC协议的跨链资产锁定与释放", category: "跨链", author: "InsightOne官方", rating: 4.4, downloads: 4560, license: "MIT", version: "v1.2.0", size: "25.4KB", audit: "已通过", tags: ["跨链", "资产桥"] },
];

const myContracts = [
  { name: "数据资产存证合约", version: "v2.0.0", installTime: "2025-04-15", network: "金融联盟链", status: "installed" },
  { name: "数据授权合约", version: "v1.1.0", installTime: "2025-03-20", network: "政务数据链", status: "installed" },
];

export default function ContractMarket() {
  const [search, setSearch] = useState("");
  const [detailContract, setDetailContract] = useState<typeof marketContracts[0] | null>(null);

  const filtered = marketContracts.filter(c => c.name.includes(search) || c.category.includes(search) || c.tags.some(t => t.includes(search)));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">智能合约市场</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">浏览、下载与安装经过审计的智能合约模板</p>
        </div>
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
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{c.name}</h3>
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
                  <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-1"><Download className="w-3 h-3" /> 安装</Button>
                  <Button size="sm" variant="outline" onClick={() => setDetailContract(c)}><Eye className="w-3 h-3" /></Button>
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
                {myContracts.map((c, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
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

      <Dialog open={!!detailContract} onOpenChange={() => setDetailContract(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileCode className="w-5 h-5 text-indigo-500" />{detailContract?.name}</DialogTitle>
          </DialogHeader>
          {detailContract && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">{detailContract.desc}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "合约ID", value: detailContract.id },
                  { label: "版本", value: detailContract.version },
                  { label: "作者", value: detailContract.author },
                  { label: "分类", value: detailContract.category },
                  { label: "许可证", value: detailContract.license },
                  { label: "大小", value: detailContract.size },
                  { label: "评分", value: `${detailContract.rating}/5.0` },
                  { label: "下载量", value: detailContract.downloads.toLocaleString() },
                  { label: "审计状态", value: detailContract.audit },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Download className="w-4 h-4" /> 安装合约</Button>
                <Button variant="outline" className="gap-2"><FileCode className="w-4 h-4" /> 查看源码</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
