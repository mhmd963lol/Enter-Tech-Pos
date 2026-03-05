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
  Mail,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import toast from "react-hot-toast";

export default function Login() {
  const { settings, updateSettings } = useAppContext();
  const [isSetup, setIsSetup] = useState(settings.storeName === "متجري");
  const [view, setView] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  const [setupData, setSetupData] = useState({
    storeName: "",
    currency: "ر.س",
    adminPin: "0000",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: setupData.storeName,
      currency: setupData.currency,
      adminPin: setupData.adminPin,
    });
    setIsSetup(false);
    setView("register"); // Automatically go to register the first admin
    toast.success("تم إعداد المتجر بنجاح! يرجى إنشاء حساب المدير الأول.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      // Update profile with name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: registerData.name
        });
      }

      toast.success("تم إنشاء الحساب وتسجيل الدخول بنجاح");
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("البريد الإلكتروني مستخدم بالفعل");
      } else if (error.code === 'auth/weak-password') {
        toast.error("كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)");
      } else {
        toast.error("حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setIsLoading(false);
    }
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
                  إعدادات الحماية الأساسية
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      رمز PIN الموحد للمدير (4 أرقام)
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
                    <p className="text-xs text-zinc-500 mt-2 text-center">
                      يُستخدم رمز الـ PIN للسماح بالعمليات الحساسة (مثل البيع بأقل من التكلفة) داخل التطبيق.
                    </p>
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
                  تخطي الإعداد (مُعد مسبقاً)
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
                {view === "login" ? "تسجيل الدخول للنظام" : "إنشاء حساب جديد"}
              </p>
            </div>

            <div className="px-8 pt-6">
              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                <button
                  onClick={() => setView("login")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${view === "login"
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => setView("register")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${view === "register"
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                >
                  إنشاء حساب
                </button>
              </div>
            </div>

            {view === "login" ? (
              <form onSubmit={handleLogin} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-lg transition-colors shadow-sm flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "دخول"
                  )}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="p-8 space-y-4 pt-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    الاسم بالكامل
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, name: e.target.value })
                      }
                      placeholder="مثال: أحمد محمد"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, confirmPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-lg transition-colors shadow-sm flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "إنشاء حساب"
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-8 text-zinc-400 dark:text-zinc-500 text-sm">
        برمجة محمد عرجون © {new Date().getFullYear()}
      </p>
    </div>
  );
}
