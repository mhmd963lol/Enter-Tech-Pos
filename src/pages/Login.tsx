import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Store,
  UserCircle,
  ShieldCheck,
  ArrowRight,
  Moon,
  Sun,
  Mail,
  Lock,
  Phone,
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
    phone: "",
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
            <div className="p-8 text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-indigo-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100 dark:border-zinc-800"
              >
                <Store className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
                إعداد المتجر الجديد
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
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
                className="w-full py-3.5 mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
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
            <div className="p-8 pb-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-teal-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-teal-100 dark:border-zinc-800"
              >
                {settings.storeLogo ? (
                  <img
                    src={settings.storeLogo}
                    alt="Logo"
                    className="w-14 h-14 object-contain rounded-2xl"
                  />
                ) : (
                  <Store className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                )}
              </motion.div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
                {settings.storeName}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                {view === "login" ? "سجل دخولك لمتابعة أعمالك" : "أنشئ حسابك الجديد وابدأ فوراً"}
              </p>
            </div>

            <div className="px-8 pt-4">
              <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl">
                <button
                  onClick={() => setView("login")}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${view === "login"
                    ? "bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => setView("register")}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${view === "register"
                    ? "bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                  إنشاء حساب
                </button>
              </div>
            </div>

            <div className="px-8 pt-6">
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-bold text-zinc-700 dark:text-zinc-300 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                المتابعة باستخدام Google
              </button>

              <div className="relative flex items-center mt-6">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-400 text-sm font-medium">أو بالبريد الإلكتروني</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>
            </div>

            {view === "login" ? (
              <form onSubmit={handleLogin} className="px-8 pb-8 pt-6 space-y-5">
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
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-left"
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
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-left tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-70 text-white rounded-xl font-bold text-lg transition-all shadow-md flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "دخول"
                  )}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="px-8 pb-8 pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم الشركة / العميل
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
                      placeholder="مثال: شركة الأمل"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    رقم الجوال
                  </label>
                  <div className="flex relative">
                    <div className="flex items-center px-3 bg-zinc-100 dark:bg-zinc-800 border border-l-0 border-zinc-200 dark:border-zinc-700 rounded-r-xl text-zinc-600 dark:text-zinc-400 font-medium" dir="ltr">
                      +966
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, phone: e.target.value })
                        }
                        placeholder="5XXXXXXXX"
                        className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-left tracking-wider"
                        dir="ltr"
                      />
                    </div>
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
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-left"
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
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-left tracking-widest"
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
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-left tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-70 text-white rounded-xl font-bold text-lg transition-all shadow-md flex justify-center items-center"
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
