import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  FileText,
  Globe,
  Save,
  Moon,
  Volume2,
  Check,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NumberInput from "../components/NumberInput";

export default function SettingsPage() {
  const { settings, updateSettings, isPro, resetApp, logout } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          الإعدادات العامة
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm ${showSuccess
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                تم الحفظ
              </motion.div>
            ) : isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الحفظ...
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                حفظ التغييرات
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        {/* General Settings */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
            <Store className="w-5 h-5 text-zinc-400" />
            معلومات المتجر
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                اسم المتجر
              </label>
              <input
                type="text"
                name="storeName"
                value={localSettings.storeName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                رابط شعار المتجر (اختياري)
              </label>
              <input
                type="text"
                name="storeLogo"
                value={localSettings.storeLogo || ""}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                اللغة
              </label>
              <select
                name="language"
                value={localSettings.language}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              >
                <option value="ar">العربية</option>
                <option value="en">English (قريباً)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Limits */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 text-zinc-400" />
            الأمان والصلاحيات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  منع البيع بخسارة
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  منع الكاشير من البيع تحت سعر التكلفة إلا برمز PIN
                </p>
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                رمز PIN للمدير (لتجاوز الصلاحيات)
              </label>
              <input
                type="password"
                name="adminPin"
                maxLength={4}
                value={localSettings.adminPin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-center tracking-widest"
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-zinc-400" />
            المالية والضرائب
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                العملة
              </label>
              <select
                name="currency"
                value={localSettings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                نسبة الضريبة (%)
              </label>
              <div className="flex items-center gap-4">
                <NumberInput
                  value={localSettings.taxRate}
                  onChange={(val) =>
                    setLocalSettings({ ...localSettings, taxRate: Number(val) })
                  }
                  disabled={!localSettings.enableTax}
                  className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:text-white"
                  allowDecimal
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableTax"
                    checked={localSettings.enableTax}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    تفعيل الضريبة
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance & Sounds */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
            <Moon className="w-5 h-5 text-zinc-400" />
            المظهر والأصوات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  الوضع الداكن
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  تفعيل المظهر الداكن للتطبيق
                </p>
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

            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    الأصوات التفاعلية
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    تشغيل أصوات عند الإضافة للسلة أو الدفع
                  </p>
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

            {/* Theme Colors */}
            <div className="col-span-1 md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                اللون الأساسي للواجهة
              </label>
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { id: "indigo", color: "bg-indigo-500", name: "نيلي" },
                  { id: "emerald", color: "bg-emerald-500", name: "زمردي" },
                  { id: "rose", color: "bg-rose-500", name: "وردي" },
                  { id: "amber", color: "bg-amber-500", name: "كهرماني" },
                  { id: "cyan", color: "bg-cyan-500", name: "سماوي" },
                  { id: "violet", color: "bg-violet-500", name: "بنفسجي" },
                  { id: "gaming", color: "bg-fuchsia-500", name: "جيمنج (Gaming)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        activeTheme: t.id as any,
                      })
                    }
                    className={`w-12 h-12 rounded-full ${t.color
                      } flex items-center justify-center transition-all duration-300 shadow-sm ${(localSettings.activeTheme || "indigo") === t.id
                        ? "ring-4 ring-offset-2 ring-indigo-500/50 dark:ring-indigo-500/50 dark:ring-offset-zinc-900 scale-110"
                        : "hover:scale-110"
                      }`}
                    title={t.name}
                  >
                    {(localSettings.activeTheme || "indigo") === t.id && (
                      <Check className="w-6 h-6 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Settings */}
            <div className="col-span-1 md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                شكل الواجهة (زوايا العناصر)
              </label>
              <div className="flex gap-4 mt-4">
                {[
                  { id: "none", name: "مسطح (حواف حادة)", class: "rounded-none", icon: <div className="w-6 h-6 border-2 border-current rounded-none" /> },
                  { id: "default", name: "طبيعي (انحناء متوسط)", class: "rounded-xl", icon: <div className="w-6 h-6 border-2 border-current rounded-xl" /> },
                  { id: "full", name: "دائري (انحناء كامل)", class: "rounded-full", icon: <div className="w-6 h-6 border-2 border-current rounded-full" /> },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        borderRadius: s.id as any,
                      })
                    }
                    className={`flex-1 py-4 px-4 border-2 transition-all flex flex-col items-center justify-center gap-3 font-medium ${s.class} ${(localSettings.borderRadius || "default") === s.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                  >
                    {s.icon}
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-zinc-400" />
            إعدادات الفاتورة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                ترويسة الفاتورة (أعلى)
              </label>
              <input
                type="text"
                name="receiptHeader"
                value={localSettings.receiptHeader}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                تذييل الفاتورة (أسفل)
              </label>
              <input
                type="text"
                name="receiptFooter"
                value={localSettings.receiptFooter}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 bg-red-50/50 dark:bg-red-900/10">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5" />
            منطقة الخطر
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">
                مسح جميع البيانات
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                سيتم مسح جميع المنتجات، الطلبات، والبيانات الأخرى. لا يمكن
                التراجع عن هذا الإجراء.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl font-medium transition-colors"
            >
              مسح البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-100 dark:border-zinc-800 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                تأكيد مسح البيانات
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع
                عنه وسيتم تسجيل خروجك.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  مسح البيانات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Save Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">تم حفظ الإعدادات بنجاح</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
