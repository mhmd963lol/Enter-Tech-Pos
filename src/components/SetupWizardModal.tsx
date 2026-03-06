import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Changed to framer-motion as it's common or motion/react depending on project
import { useAppContext } from "../context/AppContext";
import { Store, DollarSign, Package, CheckCircle, Database } from "lucide-react";
import toast from "react-hot-toast";

export default function SetupWizardModal() {
    const { settings, updateSettings, resetApp, isAuthLoading, user } = useAppContext();
    const [step, setStep] = useState(1);
    const [storeName, setStoreName] = useState(settings.storeName || "كاشير تك");
    const [currency, setCurrency] = useState(settings.currency || "ر.س");
    const [importDemo, setImportDemo] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    // If already setup, don't show, or if not logged in
    if (settings.setupCompleted || isAuthLoading || !user) return null;

    const handleFinish = async () => {
        setIsFinishing(true);

        // If they chose starting from scratch instead of demo
        if (!importDemo) {
            resetApp();
        }

        // Save settings
        updateSettings({
            storeName,
            currency,
            setupCompleted: true,
        });

        toast.success("تم إعداد النظام بنجاح! مرحباً بك في " + storeName);
        setIsFinishing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800"
                    >
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                            <Store size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white mb-2">مرحباً بك في كاشير تك</h2>
                        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">دعنا نضبط إعدادات متجرك الأساسية للبدء</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">اسم المتجر</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
                                        <Store size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                                        placeholder="أدخل اسم متجرك"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">العملة الرئيسية</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
                                        <DollarSign size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                                        placeholder="مثال: ر.س، $، د.أ"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (!storeName) { toast.error("يرجى إدخال اسم المتجر"); return; }
                                if (!currency) { toast.error("يرجى إدخال العملة"); return; }
                                setStep(2);
                            }}
                            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
                        >
                            التالي
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800"
                    >
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                            <Database size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white mb-2">بيانات المتجر</h2>
                        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">هل تود استيراد بيانات تجريبية أم البدء بمتجر فارغ؟</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setImportDemo(true)}
                                className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${importDemo ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                            >
                                <div className={`mt-1 ${importDemo ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`}>
                                    <CheckCircle size={24} className={importDemo ? "" : "opacity-30"} />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${importDemo ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-800 dark:text-white'}`}>استيراد بيانات تجريبية</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">منتجات، أصناف، ومبيعات وهمية لتجربة النظام مباشرة.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setImportDemo(false)}
                                className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${!importDemo ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                            >
                                <div className={`mt-1 ${!importDemo ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`}>
                                    <Package size={24} className={!importDemo ? "" : "opacity-30"} />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${!importDemo ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-800 dark:text-white'}`}>البدء بمتجر فارغ تماماً</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">ابدأ من الصفر وقم بإضافة منتجاتك وأصنافك بنفسك.</p>
                                </div>
                            </button>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 py-3.5 rounded-xl font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                disabled={isFinishing}
                            >
                                رجوع
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={isFinishing}
                                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center"
                            >
                                {isFinishing ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "إنهاء وبدء الاستخدام"
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
