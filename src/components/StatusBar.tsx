import React, { useState, useEffect } from "react";
import { Clock, Calendar, DollarSign, TrendingUp, ShoppingCart, LogOut, Users, Settings, Wifi, WifiOff, RefreshCcw, AlertCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";
import { APP_VERSION } from "../version";

export default function StatusBar() {
    const { settings, orders, isPrivacyMode, playSound, user, logout, exchangeRate, cart, isCartOpen, setIsCartOpen, isOnline, syncStatus } = useAppContext();
    const [time, setTime] = useState(new Date());
    const [isRateReversed, setIsRateReversed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Today's Sales Calculation
    const today = new Date().toISOString().split("T")[0];
    const todaysSales = orders
        .filter((o) => o.date.startsWith(today) && o.status === "completed")
        .reduce((sum, o) => sum + o.total, 0);

    // Format date in Arabic explicitly if language is AR
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const formattedDate = time.toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-US', dateOptions);

    // Format time (HH:MM:SS)
    const formattedTime = time.toLocaleTimeString(settings.language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const handleSalesClick = () => {
        if (playSound) playSound("success");
        navigate("/orders");
    };

    return (
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-indigo-950 text-indigo-50 text-xs sm:text-sm py-1.5 px-4 flex flex-wrap items-center justify-between shrink-0 shadow-inner z-[100] w-full relative">

            {/* Right side: Time and Date */}
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 font-semibold tracking-wider">
                    <Clock size={14} className="text-indigo-300" />
                    <span className="w-20 text-right font-mono">{formattedTime}</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-indigo-200">
                    <Calendar size={14} className="text-indigo-400" />
                    <span>{formattedDate}</span>
                </div>
            </div>

            {/* Left side: Exchange Rate, Sales Summary, Cart Shortcut, and User Menu */}
            <div className="flex items-center gap-3 sm:gap-4">

                {/* Live Exchange Rate (USD/TRY) with Toggle */}
                <div
                    className="hidden lg:flex items-center gap-1.5 bg-indigo-950/50 px-2.5 py-0.5 rounded-md border border-indigo-700/50 cursor-pointer hover:bg-indigo-900/50 transition-colors group"
                    title="سعر الصرف المباشر (USD/TRY) - انقر للعكس"
                    onClick={() => {
                        if (playSound) playSound("click");
                        setIsRateReversed(!isRateReversed);
                    }}
                >
                    <DollarSign size={14} className="text-emerald-400" />
                    <span className="text-emerald-300 font-bold whitespace-nowrap min-w-[110px]">
                        {isRateReversed
                            ? `1 TRY = ${(1 / (exchangeRate || 32)).toFixed(4)} USD`
                            : `1 USD = ${(exchangeRate || 32).toFixed(2)} TRY`
                        }
                    </span>
                    <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>

                {/* Daily Summary Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSalesClick}
                    className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 px-2.5 py-0.5 rounded-md border border-indigo-500/30 transition-colors cursor-pointer"
                    title="الذهاب لسجل المبيعات"
                >
                    <TrendingUp size={14} className="text-indigo-300" />
                    <span className="hidden sm:inline text-indigo-200">غلة اليوم:</span>
                    <span className={`font-bold text-white ${isPrivacyMode ? "filter blur-sm select-none transition-all duration-300" : ""}`}>
                        {todaysSales.toFixed(2)} {settings.currency}
                    </span>
                </motion.button>

                {/* Cart Toggle Button with Total Value */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        if (playSound) playSound("click");
                        if (location.pathname !== "/pos") {
                            navigate("/pos");
                            setTimeout(() => setIsCartOpen(true), 100);
                        } else {
                            setIsCartOpen(!isCartOpen);
                        }
                    }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all cursor-pointer relative ${isCartOpen
                        ? "bg-indigo-400 text-indigo-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                        : "bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-500/30 text-indigo-100"}`}
                    title={isCartOpen ? "إغلاق السلة" : "فتح السلة"}
                >
                    <div className="relative">
                        <ShoppingCart size={18} className={isCartOpen ? "text-indigo-100" : "text-indigo-200"} />
                        {cart.length > 0 && (
                            <span className="absolute -top-3 -right-3 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] items-center justify-center text-white font-black border-2 border-indigo-900 shadow-sm leading-none">
                                    {cart.length}
                                </span>
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className={`text-[10px] font-bold ${isCartOpen ? "text-indigo-900" : "text-indigo-300"}`}>
                            {isCartOpen ? "نشط الآن" : "سلة المبيعات"}
                        </span>
                        {cart.length > 0 && (
                            <span className={`text-xs font-black ${isCartOpen ? "text-indigo-950" : "text-white"} ${isPrivacyMode ? "blur-[3px]" : ""}`}>
                                {cart.reduce((sum, item) => sum + (item.customPrice ?? item.price) * item.quantity, 0).toFixed(2)} {settings.currency}
                            </span>
                        )}
                    </div>
                </motion.button>

                <div className="w-px h-4 bg-indigo-700/50 mx-1 hidden sm:block"></div>

                {/* User Info and Dropdown Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => {
                            if (playSound) playSound("click");
                            setIsUserMenuOpen(!isUserMenuOpen);
                        }}
                        className="flex items-center gap-3 hover:bg-white/10 px-2 py-1 rounded-md transition-colors"
                    >
                        <div className="flex flex-col items-end text-[10px] leading-tight text-indigo-200">
                            <span className="font-bold text-white uppercase">{user?.name}</span>
                            <span>{user?.role === "admin" ? "مدير" : "كاشير"}</span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-100 border border-indigo-400/30">
                            <Users size={14} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1b1e] border border-zinc-200 dark:border-zinc-800/50 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                            >
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                                        <Users size={20} />
                                    </div>
                                    <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-sm text-center">
                                        {user?.name}
                                    </span>
                                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                        {user?.role === "admin" ? "مدير النظام" : "كاشير"}
                                    </span>
                                </div>

                                <div className="p-2 flex flex-col">
                                    {user?.role === "admin" && (
                                        <NavLink
                                            to="/employees"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors text-zinc-700 dark:text-zinc-300 font-bold text-sm mb-1"
                                        >
                                            <Users size={16} className="text-indigo-500" />
                                            حسابات الموظفين
                                        </NavLink>
                                    )}

                                    <NavLink
                                        to="/settings"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-700 dark:text-zinc-300 font-bold text-sm mb-1"
                                    >
                                        <Settings size={16} className="text-zinc-400" />
                                        الإعدادات
                                    </NavLink>

                                    <div className="h-px bg-zinc-100 dark:border-zinc-800/50 my-1"></div>

                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            logout();
                                        }}
                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-600 dark:text-red-400 font-bold text-sm"
                                    >
                                        <LogOut size={16} />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-indigo-700/50 mx-1 hidden lg:block"></div>

                {/* Connection & Sync Status Indicator */}
                <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-md border transition-all duration-300 ${!isOnline ? "bg-red-500/20 border-red-500/30 text-red-200" :
                    syncStatus === 'syncing' ? "bg-amber-500/20 border-amber-500/30 text-amber-200" :
                        syncStatus === 'error' ? "bg-rose-500/30 border-rose-500/50 text-rose-100" :
                            "bg-emerald-500/20 border-emerald-500/30 text-emerald-200"
                    }`} title={
                        !isOnline ? "أنت تعمل بدون اتصال - سيتم الحفظ محلياً" :
                            syncStatus === 'syncing' ? "جاري مزامنة البيانات..." :
                                syncStatus === 'error' ? "فشلت المزامنة - تحقق من الاتصال" :
                                    "متصل ومزامن لحظياً"
                    }>
                    {syncStatus === 'syncing' ? (
                        <RefreshCcw size={14} className="animate-spin text-amber-400" />
                    ) : !isOnline ? (
                        <WifiOff size={14} className="text-red-400" />
                    ) : syncStatus === 'error' ? (
                        <AlertCircle size={14} className="text-rose-400" />
                    ) : (
                        <Wifi size={14} className="text-emerald-400" />
                    )}

                    <span className="text-[10px] font-bold hidden sm:inline whitespace-nowrap">
                        {!isOnline ? "أوفلاين" :
                            syncStatus === 'syncing' ? "مزامنة..." :
                                syncStatus === 'error' ? "خطأ مزامنة" :
                                    "متصل"}
                    </span>

                    {isOnline && syncStatus === 'synced' && (
                        <span className="relative flex h-1.5 w-1.5 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}
