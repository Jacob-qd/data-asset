import { useState, useEffect, useRef } from "react";
import { useThemeStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

export default function Navbar() {
  const { isDark, toggleTheme } = useThemeStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar state
  useEffect(() => {
    const check = () => {
      setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (newState) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
    // Dispatch custom event for Sidebar component
    window.dispatchEvent(new CustomEvent("toggle-sidebar", { detail: { collapsed: newState } }));
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-[#334155] flex items-center px-4 transition-all duration-200">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors"
            type="button"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <img src="./logo.svg" alt="Logo" className="w-7 h-7" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
              数据资产管理平台
            </span>
          </div>
        </div>

        {/* Center - Global Search */}
        <div className="flex-1 flex justify-center max-w-xl mx-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-md flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-400 text-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors text-left"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1">搜索数据资产、任务、文档...</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-[#273548] border border-slate-200 dark:border-[#475569] rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors"
            type="button"
          >
            {isDark ? (
              <Moon className="w-5 h-5 text-slate-400" />
            ) : (
              <Sun className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors"
                type="button"
              >
                <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 dark:bg-[#1E293B] dark:border-[#334155]">
              <div className="px-3 py-2 border-b dark:border-[#334155]">
                <span className="text-sm font-semibold dark:text-slate-200">通知中心</span>
              </div>
              {[
                { title: "数据资产盘点完成", desc: "系统完成了每日资产自动盘点", time: "10分钟前", type: "系统" },
                { title: "抽样任务异常", desc: "金融风控数据集抽样任务失败", time: "1小时前", type: "任务" },
                { title: "新资产待审核", desc: "企业信用评价数据集待审批", time: "2小时前", type: "审批" },
              ].map((item, i) => (
                <div key={i} className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#273548] cursor-pointer border-b dark:border-[#334155] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                  <div className="text-sm font-medium mt-1 dark:text-slate-200">{item.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
              <DropdownMenuSeparator className="dark:border-[#334155]" />
              <DropdownMenuItem className="justify-center text-primary-500 cursor-pointer dark:text-primary-400">
                查看全部通知
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-1 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors"
                type="button"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-[#1E293B] dark:border-[#334155]">
              <div className="px-3 py-2 border-b dark:border-[#334155]">
                <div className="text-sm font-semibold dark:text-slate-200">管理员</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">admin@damp.com</div>
              </div>
              <DropdownMenuItem className="dark:text-slate-200 dark:focus:bg-[#273548]">
                <User className="w-4 h-4 mr-2" /> 个人中心
              </DropdownMenuItem>
              <DropdownMenuItem className="dark:text-slate-200 dark:focus:bg-[#273548]">
                <Settings className="w-4 h-4 mr-2" /> 系统设置
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:border-[#334155]" />
              <DropdownMenuItem className="dark:text-slate-200 dark:focus:bg-[#273548]">
                <LogOut className="w-4 h-4 mr-2" /> 退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-center pt-[15vh]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-slate-200 dark:border-[#334155] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b dark:border-[#334155]">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索数据资产、任务、文档..."
                className="flex-1 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent dark:text-slate-200"
              />
              <kbd className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-[#273548] rounded">ESC</kbd>
            </div>
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs text-slate-400 font-medium">最近搜索</div>
              {["金融风控数据", "血缘图谱", "抽样任务 #12847"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors"
                  onClick={() => {
                    setSearchQuery(item);
                    setSearchOpen(false);
                  }}
                >
                  <Search className="w-3.5 h-3.5 inline mr-2 text-slate-400" />
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
