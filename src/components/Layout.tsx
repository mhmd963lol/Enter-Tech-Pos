import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Settings,
  Menu,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  Store,
  LogOut,
  Moon,
  Sun,
  Bell,
  Maximize,
  Wallet,
  Mail,
  Wrench,
  HelpCircle,
  FileText,
  TrendingUp,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import CashierTechLogo from "./CashierTechLogo";
import { useAppContext } from "../context/AppContext";
import NotificationPanel from "./NotificationPanel";
import ThemePageTransition from "./ThemePageTransition";
import StatusBar from "./StatusBar";

interface NavItem {
  icon: React.ElementType;
  label: string;
  to?: string;
  subItems?: { label: string; to: string }[];
  roles?: ("admin" | "cashier")[];
}

const navItems: NavItem[] = [
  { icon: ShoppingCart, label: "شاشة البيع", to: "/pos" },
  { icon: LayoutDashboard, label: "لوحة التحكم", to: "/" },
  {
    icon: Package,
    label: "الأصناف والمخزون",
    subItems: [
      { label: "الأصناف", to: "/products" },
      { label: "الأقسام", to: "/categories" },
    ],
  },
  {
    icon: Receipt,
    label: "إدارة المبيعات",
    subItems: [{ label: "سجل الطلبات", to: "/orders" }],
  },
  {
    icon: ShoppingCart,
    label: "إدارة المشتريات",
    roles: ["admin"],
    subItems: [
      { label: "إنشاء فاتورة مشتريات", to: "/purchases/new" },
      { label: "فواتير المشتريات", to: "/purchases" },
      { label: "إدارة الموردين", to: "/suppliers" },
    ],
  },
  {
    icon: Users,
    label: "إدارة العملاء",
    subItems: [
      { label: "حسابات العملاء", to: "/customers" },
      { label: "العملاء المدينين", to: "/customers/debtors" },
      { label: "العملاء الدائنين", to: "/customers/creditors" },
      { label: "استخراج العملاء", to: "/customers/export" },
    ],
  },
  { icon: Users, label: "حسابات الموظفين", to: "/employees", roles: ["admin"] },
  {
    icon: Wallet,
    label: "الإدارة المالية",
    roles: ["admin"],
    subItems: [
      { label: "المصروفات", to: "/finance/expenses" },
      { label: "الدخل", to: "/finance/income" },
    ],
  },
  { icon: Wallet, label: "مركز المدفوعات", to: "/payments", roles: ["admin"] },
  { icon: Mail, label: "البريد الوارد", to: "/inbox" },
  { icon: Wrench, label: "استلام أعطال الصيانة", to: "/maintenance" },
  {
    icon: Wrench,
    label: "الأدوات",
    subItems: [{ label: "منشئ ملصقات الباركود", to: "/tools/barcode" }],
  },
  {
    icon: Settings,
    label: "الإعدادات",
    roles: ["admin"],
    subItems: [
      { label: "جميع الإعدادات", to: "/settings" },
    ],
  },
  {
    icon: HelpCircle,
    label: "الدعم والمزيد",
    subItems: [
      { label: "تواصل معنا", to: "/support" },
      { label: "شروط الإستخدام", to: "/terms" },
      { label: "سياسة الخصوصية", to: "/privacy" },
    ],
  },
];

const SidebarItem: React.FC<{
  item: NavItem;
  isMobile: boolean;
  isCollapsed: boolean;
  closeMobile: () => void;
}> = ({ item, isMobile, isCollapsed, closeMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const { user, settings } = useAppContext();

  if (item.roles && user && !item.roles.includes(user.role)) {
    return null;
  }

  const isActive = item.to
    ? location.pathname === item.to
    : item.subItems?.some((sub) => location.pathname === sub.to);

  // If handle sub-items
  if (item.subItems) {
    return (
      <div
        className="mb-1 relative group/item"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isCollapsed) setIsOpen(false);
        }}
      >
        <button
          onClick={() => !isCollapsed && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isActive || isOpen
            ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            } ${isCollapsed ? "justify-center px-0 h-12 w-12 mx-auto relative group" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={`relative ${isActive || isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}>
              <item.icon
                className={`w-5 h-5 transition-all duration-300 ${isCollapsed ? "scale-110" : ""}`}
              />
              {isActive && isCollapsed && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute -right-1 -top-1 w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"
                />
              )}
            </div>
            {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
          </div>
          {!isCollapsed && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </button>

        {/* Tooltip الاحترافي - اسم القسم */}
        {isCollapsed && (
          <div className="premium-tooltip group-hover/item:opacity-100 group-hover/item:translate-x-0 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{item.label}</span>
            <div className="premium-tooltip-arrow" />
          </div>
        )}

        {/* Sub Items - Collapsed Mode (under icon variant) or Expanded Mode */}
        <AnimatePresence>
          {(isOpen || (isCollapsed && isHovered)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`overflow-hidden ${isCollapsed
                ? "flex flex-col items-center gap-1.5 py-1.5"
                : "mt-1 ml-4 pr-6 space-y-1 border-r-2 border-dashed border-zinc-200 dark:border-zinc-800"
                }`}
            >
              {item.subItems.map((subItem) => (
                <NavLink
                  key={subItem.label}
                  to={subItem.to}
                  onClick={isMobile ? closeMobile : undefined}
                  className={({ isActive }) =>
                    `flex items-center transition-all duration-300 group/sub ${isCollapsed
                      ? `h-10 w-10 justify-center rounded-lg ${isActive ? "bg-indigo-600 text-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"}`
                      : `gap-3 px-4 py-2.5 rounded-xl ${isActive ? "text-indigo-600 dark:bg-indigo-50/50 dark:bg-indigo-900/10 font-medium" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`
                    }`
                  }
                >
                  <FileText className={`w-4 h-4 transition-transform group-hover/sub:scale-110 ${isCollapsed ? "" : "opacity-50"}`} />
                  {!isCollapsed && <span className="text-sm">{subItem.label}</span>}

                  {isCollapsed && (
                    <div className="premium-tooltip group-hover/sub:opacity-100 group-hover/sub:translate-x-0 mr-2 text-[10px] py-1">
                      {subItem.label}
                      <div className="premium-tooltip-arrow" />
                    </div>
                  )}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative group/item">
      <NavLink
        to={item.to!}
        onClick={isMobile ? closeMobile : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${isActive
            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold border-r-4 border-indigo-600 dark:border-indigo-400 shadow-sm"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
          } ${isCollapsed ? "justify-center px-0 h-12 w-12 mx-auto" : ""}`
        }
      >
        <div className="relative">
          <item.icon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "scale-110" : "group-hover/item:scale-110"}`} />
          {location.pathname === item.to && isCollapsed && (
            <motion.div
              layoutId="active-dot"
              className="absolute -right-1 -top-1 w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"
            />
          )}
        </div>
        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
      </NavLink>
      {isCollapsed && (
        <div className="premium-tooltip group-hover/item:opacity-100 group-hover/item:translate-x-0 mr-2">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{item.label}</span>
          <div className="premium-tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const {
    settings,
    updateSettings,
    user,
    logout,
    notifications,
    orders,
    isPrivacyMode,
    togglePrivacyMode,
    playSound,
    deferredPrompt,
    setDeferredPrompt,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useAppContext();

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Click outside listener for user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    }
  };

  // Calculate today's stats
  const today = new Date().toISOString().split("T")[0];
  const todaysOrders = orders.filter((o) => o.date.startsWith(today));
  const todaysSales = todaysOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div
      className={`flex h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors theme-master-${settings.masterTheme} ${isPrivacyMode ? "privacy-mode" : ""}`}
      dir="rtl"
    >
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col overflow-hidden shadow-2xl lg:shadow-none ${settings.masterTheme === "ios-glass" ? "glass-panel" : ""
          } ${isSidebarCollapsed ? "w-20 sidebar-glow" : "w-72"} ${isMobileMenuOpen ? "translate-x-0 w-72" : "translate-x-full lg:translate-x-0"
          } ${settings.masterTheme === "carbon" ? "carbon-texture" : ""} ${settings.masterTheme === "gaming" ? "scanning-line" : ""}`}
        style={{ willChange: "width, transform" }}
      >
        <div className={`p-4 flex items-center transition-all duration-300 border-b border-zinc-100 dark:border-zinc-800 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <CashierTechLogo showText={false} className="w-10 h-10 shrink-0" />
            </motion.div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="whitespace-nowrap"
                >
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                    {settings.storeName}
                  </h1>
                  <p className="text-[10px] text-zinc-500 truncate">نظام إدارة المبيعات الذكي</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isSidebarCollapsed && (
            <button
              className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isMobile={false}
              isCollapsed={isSidebarCollapsed}
              closeMobile={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          {deferredPrompt && (
            <button
              onClick={handleInstallApp}
              className={`w-full flex items-center gap-3 p-3 mb-4 rounded-xl transition-all font-bold group shadow-sm bg-gradient-to-r from-[#00E676] to-[#00C853] text-indigo-950 hover:shadow-[#00E676]/20 bg-[length:200%_auto] hover:bg-right ${isSidebarCollapsed ? "justify-center px-0 h-12 w-12 mx-auto" : ""
                }`}
            >
              <Download className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>تثبيت النظام</span>}
            </button>
          )}
          <p className={`text-[10px] text-zinc-400 font-medium ${isSidebarCollapsed ? "opacity-0" : "opacity-100"}`}>
            برمجة محمد عرجون © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <StatusBar />
        {/* Top Header */}
        <header className={`h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0 ${settings.masterTheme === "ios-glass" ? "glass-panel" : ""}`}>
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors shadow-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              onClick={() => {
                playSound("click");
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            {/* Hidden original username text */}
            <div className="hidden items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-white">
                {user?.name}
              </span>
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">
                {user?.role === "admin" ? "مدير" : "كاشير"}
              </span>
            </div>

          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={togglePrivacyMode}
              className={`p-2 rounded-full transition-colors ${isPrivacyMode ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              title={isPrivacyMode ? "إظهار الأرقام" : "إخفاء الأرقام"}
            >
              {isPrivacyMode ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title="ملء الشاشة"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsNotificationPanelOpen(true)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              {settings.theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 min-h-0">
          <div className="mx-auto h-full">
            <ThemePageTransition>
              <Outlet />
            </ThemePageTransition>
          </div>
        </div>
      </main>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div >
  );
}
