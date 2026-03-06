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
      { label: "إعدادات عامة", to: "/settings" },
      { label: "إعدادات الحساب", to: "/settings/account" },
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
  closeMobile: () => void;
}> = ({ item, isMobile, closeMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAppContext();

  if (item.roles && user && !item.roles.includes(user.role)) {
    return null;
  }

  const isActive = item.to
    ? location.pathname === item.to
    : item.subItems?.some((sub) => location.pathname === sub.to);

  if (item.subItems) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${isActive || isOpen
            ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
        >
          <div className="flex items-center gap-3">
            <item.icon
              className={`w-5 h-5 ${isActive || isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}
            />
            <span className="font-medium">{item.label}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isOpen && (
          <div className="mt-1 ml-4 pr-8 space-y-1 border-r-2 border-zinc-100 dark:border-zinc-800">
            {item.subItems.map((subItem) => (
              <NavLink
                key={subItem.label}
                to={subItem.to}
                onClick={isMobile ? closeMobile : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 font-medium"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`
                }
              >
                <FileText className="w-4 h-4 opacity-50" />
                {subItem.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to!}
      onClick={isMobile ? closeMobile : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${isActive
          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
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
      className={`flex h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors ${isPrivacyMode ? "privacy-mode" : ""}`}
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
        className={`fixed lg:static inset-y-0 right-0 z-50 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out flex flex-col overflow-hidden ${isDesktopSidebarCollapsed ? "w-0 border-l-0 opacity-0 lg:opacity-100" : "w-72 opacity-100"} ${isMobileMenuOpen
          ? "translate-x-0 w-72"
          : "translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                {settings.storeName}
              </h1>
              <p className="text-xs text-zinc-500">نظام إدارة المبيعات</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isMobile={true}
              closeMobile={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          {deferredPrompt && (
            <button
              onClick={handleInstallApp}
              className={`w-full flex items-center gap-3 p-3 mb-4 rounded-xl transition-all font-bold group shadow-sm bg-gradient-to-r from-[#00E676] to-[#00C853] text-indigo-950 hover:shadow-[#00E676]/20 bg-[length:200%_auto] hover:bg-right ${isDesktopSidebarCollapsed ? "justify-center px-0" : ""
                }`}
            >
              <Download className="w-5 h-5 shrink-0" />
              {!isDesktopSidebarCollapsed && <span>تثبيت النظام</span>}
            </button>
          )}
          <p className="text-xs text-zinc-400 font-medium">
            برمجة محمد عرجون © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <StatusBar />
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="p-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              onClick={() => {
                playSound("click");
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
                }
              }}
            >
              <Menu className="w-6 h-6" />
            </button>

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
    </div>
  );
}
