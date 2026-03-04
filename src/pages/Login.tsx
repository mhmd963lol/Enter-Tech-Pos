import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Store,
  UserCircle,
  ShieldCheck,
  ArrowRight,
  Upload,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Login() {
  const { login, settings, updateSettings } = useAppContext();
  const [role, setRole] = useState<"admin" | "cashier">("admin");
  const [isSetup, setIsSetup] = useState(settings.storeName === "متجري");

  const [setupData, setSetupData] = useState({
    storeName: "",
    currency: "ر.س",
    adminName: "",
    adminPassword: "",
    adminPin: "0000",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: setupData.storeName,
      currency: setupData.currency,
      adminPin: setupData.adminPin,
    });
    // In a real app, save admin credentials securely
    login({
      id: "admin-1",
      name: setupData.adminName || "مدير النظام",
      role: "admin",
      pin: setupData.adminPin,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, verify credentials
    login({
      id: Math.random().toString(36).substring(7),
      name: role === "admin" ? "مدير النظام" : "كاشير 1",
      role: role,
      pin: role === "admin" ? settings.adminPin : undefined,
    });
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4 transition-colors duration-300"
      dir="rtl"
    >
      <div className="absolute top-4 left-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-zinc-600 dark:text-zinc-300"
        >
          {settings.theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isSetup ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <div className="p-8 text-center bg-indigo-600 dark:bg-indigo-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10"
              >
                <Store className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2 relative z-10">
                إعداد المتجر الجديد
              </h1>
              <p className="text-indigo-100 relative z-10">
                أهلاً بك! لنقم بإعداد نظامك
              </p>
            </div>

            <form onSubmit={handleSetup} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  اسم المتجر / الشركة
                </label>
                <input
                  required
                  type="text"
                  placeholder="مثال: سوبر ماركت الأمل"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  value={setupData.storeName}
                  onChange={(e) =>
                    setSetupData({ ...setupData, storeName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  العملة المحلية
                </label>
                <select
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  value={setupData.currency}
                  onChange={(e) =>
                    setSetupData({ ...setupData, currency: e.target.value })
                  }
                >
                  <option value="ر.س">ريال سعودي (ر.س)</option>
                  <option value="د.إ">درهم إماراتي (د.إ)</option>
                  <option value="د.ك">دينار كويتي (د.ك)</option>
                  <option value="ر.ق">ريال قطري (ر.ق)</option>
                  <option value="ر.ع">ريال عماني (ر.ع)</option>
                  <option value="د.ب">دينار بحريني (د.ب)</option>
                  <option value="ج.م">جنيه مصري (ج.م)</option>
                  <option value="د.أ">دينار أردني (د.أ)</option>
                  <option value="ل.س">ليرة سورية (ل.س)</option>
                  <option value="ل.ت">ليرة تركية (ل.ت)</option>
                  <option value="$">دولار أمريكي ($)</option>
                  <option value="€">يورو (€)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">
                  بيانات مدير النظام
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      اسم المدير
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      value={setupData.adminName}
                      onChange={(e) =>
                        setSetupData({
                          ...setupData,
                          adminName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      رمز PIN (4 أرقام للصلاحيات)
                    </label>
                    <input
                      required
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      placeholder="0000"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-center tracking-widest text-lg"
                      value={setupData.adminPin}
                      onChange={(e) =>
                        setSetupData({ ...setupData, adminPin: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                البدء باستخدام النظام
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSetup(false)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  لدي حساب بالفعل؟ تسجيل الدخول
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <div className="p-8 text-center bg-indigo-600 dark:bg-indigo-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10"
              >
                {settings.storeLogo ? (
                  <img
                    src={settings.storeLogo}
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Store className="w-8 h-8 text-white" />
                )}
              </motion.div>
              <h1 className="text-2xl font-bold mb-2 relative z-10">
                {settings.storeName}
              </h1>
              <p className="text-indigo-100 relative z-10">
                تسجيل الدخول للنظام
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  اختر نوع الحساب
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      role === "admin"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <ShieldCheck className="w-8 h-8" />
                    <span className="font-medium">مدير النظام</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setRole("cashier")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      role === "cashier"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <UserCircle className="w-8 h-8" />
                    <span className="font-medium">كاشير</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    placeholder={role === "admin" ? "admin" : "cashier"}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                دخول
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-8 text-zinc-400 dark:text-zinc-500 text-sm">
        برمجة محمد عرجون © {new Date().getFullYear()}
      </p>
    </div>
  );
}
