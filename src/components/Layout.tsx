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
  ChevronRight,
  ChevronLeft,
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
import { APP_VERSION } from "../version";

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
        onMouseEnter={() => {
          setIsHovered(true);
          if (!isCollapsed) setIsOpen(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isCollapsed) setIsOpen(false);
          else setIsOpen(false); // Close on leave for expanded too as per user request "without clicking"
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
          <div className="premium-tooltip group-hover/item:opacity-100 group-hover/item:translate-x-0 !transition-none">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{item.label}</span>
            <div className="premium-tooltip-arrow" />
          </div>
        )}

        {/* Sub Items */}
        <AnimatePresence>
          {(isOpen || (isCollapsed && isHovered)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
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
                    `flex items-center transition-all duration-200 group/sub ${isCollapsed
                      ? `h-10 w-10 justify-center rounded-lg ${isActive ? "bg-indigo-600 text-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"}`
                      : `gap-3 px-4 py-2.5 rounded-xl ${isActive ? "text-indigo-600 dark:bg-indigo-50/50 dark:bg-indigo-900/10 font-medium" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`
                    }`
                  }
                >
                  <FileText className={`w-4 h-4 transition-transform group-hover/sub:scale-110 ${isCollapsed ? "" : "opacity-50"}`} />
                  {!isCollapsed && <span className="text-sm">{subItem.label}</span>}

                  {isCollapsed && (
                    <div className="absolute right-full mr-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg opacity-0 group-hover/sub:opacity-100 pointer-events-none transition-all duration-75 translate-x-1 group-hover/sub:translate-x-0 z-[60] shadow-xl whitespace-nowrap">
                      {subItem.label}
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] border-l-zinc-900 dark:border-l-white" />
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
        <div className="premium-tooltip group-hover/item:opacity-100 group-hover/item:translate-x-0 mr-2 !transition-none">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{item.label}</span>
          <div className="premium-tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default function Layout() {
  const {
    user,
    settings,
    logout,
    playSound,
    isPrivacyMode,
    updateSettings,
    notifications,
    orders,
    togglePrivacyMode,
    deferredPrompt,
    setDeferredPrompt
  } = useAppContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useAppContext();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Click outside listener for mobile sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  return (
    <div className={`flex h-screen bg-[#F8F9FA] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden theme-master-${settings.masterTheme} ${isPrivacyMode ? "privacy-mode" : ""}`} dir="rtl">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${isSidebarCollapsed ? "w-20" : "w-64"
          } bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out flex flex-col z-[51] fixed inset-y-0 right-0 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
          }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 h-16 shrink-0">
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 overflow-hidden">
              <CashierTechLogo className="w-8 h-8 shrink-0" showText={false} />
              <div className="flex flex-col">
                <span className="font-black text-lg text-zinc-900 dark:text-white truncate">كاشير تك</span>
                <span className="text-[10px] text-zinc-500 truncate -mt-1">{settings.storeName}</span>
                <span className="text-[8px] text-indigo-500/80 font-mono tracking-tighter -mt-0.5">{APP_VERSION}</span>
              </div>
            </motion.div>
          )}
          {isSidebarCollapsed && (
            <div className="flex flex-col items-center mx-auto gap-0.5">
              <CashierTechLogo className="w-8 h-8 shrink-0" showText={false} />
              <span className="text-[6px] text-indigo-500 font-mono tracking-tight">{APP_VERSION.replace('ver : ', '')}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2.5 bg-indigo-600 dark:bg-zinc-800 text-white dark:text-zinc-300 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 border border-white/10"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : isSidebarCollapsed ? (
              <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
            ) : (
              <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isMobile={window.innerWidth < 1024}
              isCollapsed={isSidebarCollapsed}
              closeMobile={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          {deferredPrompt && (
            <button
              onClick={handleInstallApp}
              className={`w-full flex items-center gap-3 p-3 mb-4 rounded-xl transition-all font-bold group shadow-sm bg-gradient-to-r from-emerald-400 to-emerald-600 text-white hover:shadow-emerald-500/20 ${isSidebarCollapsed ? "justify-center px-0 h-12 w-12 mx-auto" : ""
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
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        <StatusBar />

        {/* Mobile Header Toggle (Only visible and needed on mobile if StatusBar is not enough) */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-sm">لوحة التحكم</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationPanelOpen(true)}
              className="p-2 text-zinc-400 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
              )}
            </button>
            <button onClick={toggleTheme} className="p-2 text-zinc-400">
              {settings.theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Desktop Controls (Top Bar) */}
        <div className="hidden lg:flex h-14 items-center justify-end px-8 gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-full transition-colors ${isPrivacyMode ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            title={isPrivacyMode ? "إظهار الأرقام" : "إخفاء الأرقام"}
          >
            {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full" title="ملء الشاشة">
            <Maximize size={18} />
          </button>
          <button onClick={() => setIsNotificationPanelOpen(true)} className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full relative">
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
            )}
          </button>
          <button onClick={toggleTheme} className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            {settings.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-8 min-h-0 bg-transparent">
          <ThemePageTransition>
            <Outlet />
          </ThemePageTransition>
        </div>
      </main>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div>
  );
}
