import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

const routeNameMap: Record<string, string> = {
  "/": "数据资产概览",
  "/cockpit": "数据资产驾驶舱",
  "/portal": "服务门户",
  "/resources": "数据资源目录",
  "/lineage": "血缘图谱",
  "/products": "数据产品管理",
  "/accounts": "资产账户管理",
  "/sampling/rules": "抽样规则配置",
  "/sampling/tasks": "抽样任务管理",
  "/sampling/audit": "抽样审核管理",
  "/sampling/datasources": "数据源管理",
  "/reports": "统计报表中心",
  "/sandbox": "数据沙箱工作台",
  "/sandbox/components": "建模组件库",
  "/sandbox/masking": "脱敏环境",
  "/privacy": "隐私计算平台",
  "/privacy/monitor": "监控告警",
  "/privacy/audit": "审计日志",
  "/privacy/parties": "参与方管理",
  "/privacy/models": "模型管理",
  "/privacy/resources": "资源管理",
  "/privacy/api": "接口管理",
  "/privacy/services": "数据服务",
  "/secret/projects": "密态项目",
  "/secret/tasks": "密态任务",
  "/secret/psi": "隐私求交",
  "/secret/pir": "隐匿查询",
  "/secret/joint-stats": "联合统计",
  "/secret/federated": "联邦学习",
  "/secret/parties": "参与方管理",
  "/secret/keys": "密钥证书",
  "/secret/audit": "审计存证",
  "/secret/monitor": "监控告警",
  "/secret/resources": "资源管理",
  "/secret/data-governance": "数据治理",
  "/secret/services": "服务管理",
  "/secret/mpc-engine": "密码协议引擎",
  "/secret/tee": "可信执行环境",
  "/secret/he-engine": "同态加密引擎",
  "/secret/network": "网络通信",
  "/business-flow": "业务流程验证",
  "/blockchain": "运维监控",
  "/blockchain/nodes": "联盟和节点管理",
  "/blockchain/explorer": "区块链浏览器",
  "/blockchain/core": "链核心管理",
  "/blockchain/contracts": "智能合约管理",
  "/blockchain/subchains": "应用子链管理",
  "/blockchain/system": "系统管理",
  "/blockchain/ops": "运维与监控",
};

const parentMap: Record<string, { label: string; path: string }[]> = {
  "/sampling/rules": [{ label: "抽样管理", path: "#" }],
  "/sampling/tasks": [{ label: "抽样管理", path: "#" }],
  "/sampling/audit": [{ label: "抽样管理", path: "#" }],
  "/sampling/datasources": [{ label: "抽样管理", path: "#" }],
  "/sandbox/components": [{ label: "数据沙箱管理", path: "#" }],
  "/sandbox/masking": [{ label: "数据沙箱管理", path: "#" }],
  "/privacy/monitor": [{ label: "隐私计算平台", path: "#" }],
  "/privacy/audit": [{ label: "隐私计算平台", path: "#" }],
  "/privacy/parties": [{ label: "隐私计算平台", path: "#" }],
  "/privacy/models": [{ label: "隐私计算平台", path: "#" }],
  "/privacy/resources": [{ label: "隐私计算平台", path: "#" }],
  "/privacy/api": [{ label: "隐私计算平台", path: "#" }],
  "/privacy/services": [{ label: "隐私计算平台", path: "#" }],
  "/secret/projects": [{ label: "密态计算", path: "#" }],
  "/secret/tasks": [{ label: "密态计算", path: "#" }],
  "/secret/psi": [{ label: "密态计算", path: "#" }],
  "/secret/pir": [{ label: "密态计算", path: "#" }],
  "/secret/joint-stats": [{ label: "密态计算", path: "#" }],
  "/secret/federated": [{ label: "密态计算", path: "#" }],
  "/secret/parties": [{ label: "密态计算", path: "#" }],
  "/secret/keys": [{ label: "密态计算", path: "#" }],
  "/secret/audit": [{ label: "密态计算", path: "#" }],
  "/secret/monitor": [{ label: "密态计算", path: "#" }],
  "/secret/resources": [{ label: "密态计算", path: "#" }],
  "/secret/data-governance": [{ label: "密态计算", path: "#" }],
  "/secret/services": [{ label: "密态计算", path: "#" }],
  "/secret/mpc-engine": [{ label: "密态计算", path: "#" }],
  "/secret/tee": [{ label: "密态计算", path: "#" }],
  "/secret/he-engine": [{ label: "密态计算", path: "#" }],
  "/secret/network": [{ label: "密态计算", path: "#" }],
  "/business-flow": [{ label: "平台工具", path: "#" }],
  "/blockchain/nodes": [{ label: "区块链可信存证", path: "#" }],
  "/blockchain/explorer": [{ label: "区块链可信存证", path: "#" }],
  "/blockchain/core": [{ label: "区块链可信存证", path: "#" }],
  "/blockchain/contracts": [{ label: "区块链可信存证", path: "#" }],
  "/blockchain/subchains": [{ label: "区块链可信存证", path: "#" }],
  "/blockchain/system": [{ label: "区块链可信存证", path: "#" }],
  "/blockchain/ops": [{ label: "区块链可信存证", path: "#" }],
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setSidebarCollapsed(detail.collapsed);
    };
    window.addEventListener("toggle-sidebar" as never, handler);
    return () => window.removeEventListener("toggle-sidebar" as never, handler);
  }, []);

  const currentPath = location.pathname;
  const currentName = routeNameMap[currentPath] || "页面";
  const parents = parentMap[currentPath] || [];

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0B1120]">
      <Navbar />
      <Sidebar />
      <main
        className={cn(
          "pt-14 transition-all duration-300 min-h-[100dvh]",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Breadcrumb */}
        <div className="h-10 flex items-center px-6 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-[#334155]">
          <nav className="flex items-center gap-1 text-[13px]">
            <Link
              to="/"
              className="flex items-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              首页
            </Link>
            {parents.map((parent) => (
              <span key={parent.label} className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">{parent.label}</span>
              </span>
            ))}
            <span className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                {currentName}
              </span>
            </span>
          </nav>
        </div>

        {/* Page Content */}
        <div className="p-6 min-w-[1024px]">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
