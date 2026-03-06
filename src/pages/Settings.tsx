import React, { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  FileText,
  Save,
  Moon,
  Volume2,
  Check,
  ShieldAlert,
  Trash2,
  Download,
  Upload,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NumberInput from "../components/NumberInput";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { settings, updateSettings, isPro, resetApp, logout } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setLocalSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(localSettings);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetApp();
    logout();
    setShowResetConfirm(false);
  };

  const handleExportBackup = () => {
    const backupData = {
      settings: localSettings,
      version: "1.0",
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cashier_tech_backup_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("تم تصدير النسخة الاحتياطية بنجاح");
  };

  const handleImportBackupClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.settings) {
          setLocalSettings({ ...localSettings, ...json.settings });
          toast.success("تم تحميل الإعدادات من النسخة الاحتياطية، يرجى حفظ التغييرات.");
        } else {
          toast.error("ملف النسخة الاحتياطية غير صالح.");
        }
      } catch (error) {
        toast.error("تعذر قراءة ملف النسخة الاحتياطية.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const tabs = [
    { id: "general", label: "عام والفواتير", icon: Store },
    { id: "appearance", label: "المظهر والألوان", icon: Moon },
    { id: "finance", label: "المالية والأمان", icon: DollarSign },
    { id: "advanced", label: "بيانات متقدمة", icon: ShieldAlert },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">الإعدادات الشاملة</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">تحكم بجميع تفاصيل متجرك من مكان واحد</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
              }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">

          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-zinc-100 dark:divide-zinc-800"
            >
              {/* Store Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <Store className="w-5 h-5 text-indigo-500" />
                  معلومات المتجر الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">اسم المتجر</label>
                    <input
                      type="text"
                      name="storeName"
                      value={localSettings.storeName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">رابط شعار المتجر (اختياري)</label>
                    <input
                      type="text"
                      name="storeLogo"
                      value={localSettings.storeLogo || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-left transition-all"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">اللغة</label>
                    <select
                      name="language"
                      value={localSettings.language}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer transition-all"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">English (قريباً)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Invoice Settings */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  إعدادات الفاتورة والطباعة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">ترويسة الفاتورة (أعلى النص)</label>
                    <input
                      type="text"
                      name="receiptHeader"
                      value={localSettings.receiptHeader}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      placeholder="مثال: أهلاً بكم في متجرنا"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">تذييل الفاتورة (أسفل النص)</label>
                    <input
                      type="text"
                      name="receiptFooter"
                      value={localSettings.receiptFooter}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      placeholder="مثال: شكراً لزيارتكم!"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-zinc-100 dark:divide-zinc-800"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  المظهر والأصوات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Dark Mode */}
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">الوضع الداكن</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">تفعيل المظهر الليلي المريح للعين</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={localSettings.theme === "dark"}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            theme: e.target.checked ? "dark" : "light",
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Sounds */}
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-zinc-400" />
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">الأصوات التفاعلية</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">تشغيل أصوات عند البيع والنقر</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={localSettings.enableSounds}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            enableSounds: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Master Themes */}
                  <div className="col-span-1 md:col-span-2 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <label className="block text-lg font-bold text-zinc-900 dark:text-white mb-1">الثيم الشامل (Master Theme)</label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">يغير خلفيات التطبيق بالكامل والحركات.</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { id: "default", name: "الأساسي", desc: "نظيف وعملي", bg: "bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-800 dark:to-zinc-900", border: "border-indigo-200 dark:border-zinc-700", text: "text-zinc-900 dark:text-white" },
                        { id: "cashier-tech", name: "كاشير تك 💚", desc: "ذكي واحترافي", bg: "bg-gradient-to-br from-[#0d1117] to-[#111820]", border: "border-[#00E676]/50", text: "text-[#e0f0e8]" },
                        { id: "gaming", name: "جيمنج 🎮", desc: "ألوان نيون ساطعة", bg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDUwNTA1Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDU1IGFsdGgiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] bg-zinc-950", border: "border-fuchsia-500/50", text: "text-white" },
                        { id: "carbon", name: "كاربون فايبر 🏎️", desc: "نمط سيارات", bg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMTExIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMiIGZpbGw9IiMxYTFhMWEiPjwvcmVjdD4KPC9zdmc+')] bg-[#1a1a1a]", border: "border-zinc-700", text: "text-gray-200" },
                        { id: "luxury", name: "ڤي آي بي 💎", desc: "فخامة وهدوء", bg: "bg-gradient-to-br from-slate-800 to-slate-950", border: "border-amber-500/50", text: "text-amber-100" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setLocalSettings({ ...localSettings, masterTheme: t.id as any })}
                          className={`relative overflow-hidden group flex flex-col items-start p-4 border-2 transition-all rounded-xl text-right h-full ${t.bg} ${(localSettings.masterTheme || "default") === t.id
                            ? t.border + " ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-lg scale-105 z-10"
                            : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 opacity-90 hover:opacity-100"
                            }`}
                        >
                          {(localSettings.masterTheme || "default") === t.id && (
                            <div className="absolute inset-0 bg-white/5 dark:bg-white/10" />
                          )}
                          <div className="relative z-10">
                            <h4 className={`font-bold text-lg mb-1 ${t.text}`}>{t.name}</h4>
                            <p className={`text-xs ${t.text} opacity-70`}>{t.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="col-span-1 md:col-span-2 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-3">اللون الأساسي للواجهة</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "indigo", color: "bg-indigo-500", name: "نيلي" },
                        { id: "emerald", color: "bg-emerald-500", name: "زمردي" },
                        { id: "rose", color: "bg-rose-500", name: "وردي" },
                        { id: "amber", color: "bg-amber-500", name: "كهرماني" },
                        { id: "cyan", color: "bg-cyan-500", name: "سماوي" },
                        { id: "violet", color: "bg-violet-500", name: "بنفسجي" },
                        { id: "gaming", color: "bg-fuchsia-500", name: "جيمنج" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setLocalSettings({ ...localSettings, activeTheme: t.id as any })}
                          className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center transition-all duration-300 shadow-sm ${(localSettings.activeTheme || "indigo") === t.id
                            ? "ring-4 ring-offset-2 ring-indigo-500/50 dark:ring-indigo-500/50 dark:ring-offset-zinc-900 scale-110"
                            : "hover:scale-110"
                            }`}
                          title={t.name}
                        >
                          {(localSettings.activeTheme || "indigo") === t.id && <Check className="w-6 h-6 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fonts (With Preview Feature) */}
                  <div className="col-span-1 md:col-span-2 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-1">الخطوط Typography (معاينة)</label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">اختر خطاً مناسباً يعكس هوية متجرك</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: "", name: "تجوال (افتراضي)", fontFamily: "'Tajawal', sans-serif", preview: "أبجد هوز" },
                        { id: "Cairo", name: "القاهرة", fontFamily: "'Cairo', sans-serif", preview: "أبجد هوز" },
                        { id: "Almarai", name: "المراعي", fontFamily: "'Almarai', sans-serif", preview: "أبجد هوز" },
                        { id: "IBM Plex", name: "IBM عربي", fontFamily: "'IBM Plex Sans Arabic', sans-serif", preview: "أبجد هوز" },
                        { id: "Readex Pro", name: "ريدكس برو", fontFamily: "'Readex Pro', sans-serif", preview: "أبجد هوز" },
                        { id: "Outfit", name: "أوتفيت (EN)", fontFamily: "'Outfit', sans-serif", preview: "AaBbCc" },
                      ].map((f) => {
                        const isSelected = f.id === "" ? !localSettings.fontFamily : localSettings.fontFamily === f.fontFamily;
                        return (
                          <button
                            key={f.id || "default"}
                            onClick={() => setLocalSettings({ ...localSettings, fontFamily: f.id === "" ? undefined : f.fontFamily })}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${isSelected
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-300 dark:ring-indigo-800"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-600"
                              }`}
                          >
                            {/* The preview matches exactly the font family choosed */}
                            <span className="text-xl font-medium text-zinc-800 dark:text-zinc-200 leading-tight" style={{ fontFamily: f.fontFamily }}>
                              {f.preview}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">{f.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* FINANCE TAB */}
          {activeTab === "finance" && (
            <motion.div
              key="finance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-zinc-100 dark:divide-zinc-800"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-indigo-500" />
                  المالية والضرائب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">العملة الأساسية للمتجر</label>
                    <select
                      name="currency"
                      value={localSettings.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="ر.س">ريال سعودي (ر.س)</option>
                      <option value="د.إ">درهم إماراتي (د.إ)</option>
                      <option value="د.ك">دينار كويتي (د.ك)</option>
                      <option value="ج.م">جنيه مصري (ج.م)</option>
                      <option value="ل.س">ليرة سورية (ل.س)</option>
                      <option value="₺">ليرة تركية (₺)</option>
                      <option value="$">دولار أمريكي ($)</option>
                      <option value="€">يورو (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">نسبة الضريبة (%)</label>
                    <div className="flex items-center gap-4">
                      <NumberInput
                        value={localSettings.taxRate}
                        onChange={(val) => setLocalSettings({ ...localSettings, taxRate: Number(val) })}
                        disabled={!localSettings.enableTax}
                        className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:text-white transition-all"
                        allowDecimal
                      />
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="enableTax"
                          checked={localSettings.enableTax}
                          onChange={handleChange}
                          className="w-5 h-5 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">تفعيل الضريبة</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" />
                  الأمان والصلاحيات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">منع البيع بخسارة</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">منع الكاشير من البيع تحت سعر التكلفة</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        name="preventBelowCost"
                        checked={localSettings.preventBelowCost}
                        onChange={handleChange}
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">رمز PIN للمدير (لتجاوز الصلاحيات)</label>
                    <input
                      type="password"
                      name="adminPin"
                      maxLength={4}
                      value={localSettings.adminPin}
                      onChange={handleChange}
                      placeholder="****"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-center tracking-widest text-xl transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === "advanced" && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-zinc-100 dark:divide-zinc-800"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <Database className="w-5 h-5 text-indigo-500" />
                  النسخ الاحتياطي وإدارة البيانات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">
                      <Download className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">تصدير الإعدادات</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">حفظ نسخة احتياطية من الإعدادات كملف JSON آمن يمكنك الاحتفاظ به.</p>
                    <button
                      onClick={handleExportBackup}
                      className="w-full mt-auto py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      تصدير نسخة الآن
                    </button>
                  </div>

                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">استعادة الإعدادات</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">رفع ملف JSON لاستعادة إعداداتك ومظهر النظام المحفوظ سابقاً.</p>
                    <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                    <button
                      onClick={handleImportBackupClick}
                      className="w-full mt-auto py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      رفع ملف والاستعادة
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-b-2xl">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
                  <Trash2 className="w-5 h-5" />
                  منطقة الخطر والتفريغ الشامل
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">مسح وتصفير جميع بيانات المتجر</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">سيتم مسح المنتجات، الطلبات،، والإعدادات. لا يمكن التراجع أبداً. سيتم تسجيل خروجك فوراً.</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="shrink-0 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    مسح جميع البيانات
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Save Button Overlay */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-40 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-all">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-bold text-lg transition-all shadow-lg min-w-[300px] ${showSuccess
            ? "bg-emerald-500 hover:bg-emerald-600 text-white ring-4 ring-emerald-500/30"
            : "bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-500/20"
            }`}
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                <Check className="w-6 h-6" /> تم حفظ التغييرات بنجاح
              </motion.div>
            ) : isSaving ? (
              <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> جاري الحفظ...
              </motion.div>
            ) : (
              <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Save className="w-6 h-6" /> حفظ جميع الإعدادات
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Centered Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 dark:border-zinc-800 p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">تأكيد المسح النهائي</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                هل أنت متأكد من مسح جميع بيانات التطبيق من هذا الجهاز؟ سيتم إرجاعك لصفحة تسجيل الدخول.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold transition-colors"
                >
                  تراجع
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30"
                >
                  نعم، امسح كل شيء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
