import React, { useState, useEffect } from "react";
import { Clock, Calendar, DollarSign, TrendingUp, ShoppingCart, LogOut } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function StatusBar() {
    const { settings, orders, isPrivacyMode, playSound, user, logout, exchangeRate } = useAppContext();
    const [time, setTime] = useState(new Date());
    const [isRateReversed, setIsRateReversed] = useState(false);
    const navigate = useNavigate();

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
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-indigo-950 text-indigo-50 text-xs sm:text-sm py-1.5 px-4 flex flex-wrap items-center justify-between shrink-0 shadow-inner z-10 w-full relative">

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

                {/* Cart Shortcut Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/pos")}
                    className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 px-2.5 py-0.5 rounded-md border border-indigo-500/30 transition-colors cursor-pointer"
                    title="الذهاب لشاشة البيع"
                >
                    <ShoppingCart size={14} className="text-indigo-200" />
                    <span className="font-bold text-white">السلة</span>
                </motion.button>

                <div className="w-px h-4 bg-indigo-700/50 mx-1 hidden sm:block"></div>

                {/* User Info and Logout */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end text-[10px] leading-tight text-indigo-200">
                        <span className="font-bold text-white uppercase">{user?.name}</span>
                        <span>{user?.role === "admin" ? "مدير" : "كاشير"}</span>
                    </div>
                    <button
                        onClick={() => {
                            if (playSound) playSound("click");
                            logout();
                        }}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-md border border-red-500/30 transition-colors"
                        title="تسجيل الخروج"
                    >
                        <LogOut size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}
