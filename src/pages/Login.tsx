import React, { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Login() {
  const { login, settings, updateSettings } = useAppContext();

  // mode can be "login", "register", or "setup"
  const [mode, setMode] = useState<"login" | "register" | "setup">(
    settings.storeName === "متجري" ? "setup" : "login"
  );

  const [loading, setLoading] = useState(false);

  const [setupData, setSetupData] = useState({
    storeName: "",
    currency: "ر.س",
    adminName: "",
    email: "",
    password: "",
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
  });

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  const syncDefaultDataToFirestore = async (uid: string, initialSettings: any, name: string) => {
    await setDoc(doc(db, "users", uid), {
      settings: initialSettings,
      profile: { name, role: "admin", pin: initialSettings.adminPin },
      createdAt: new Date().toISOString()
    });
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, setupData.email, setupData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: setupData.adminName });

      const newSettings = {
        storeName: setupData.storeName,
        currency: setupData.currency,
        adminPin: setupData.adminPin,
      };

      await syncDefaultDataToFirestore(user.uid, newSettings, setupData.adminName);

      updateSettings(newSettings);

      login({
        id: user.uid,
        name: setupData.adminName || "مدير النظام",
        role: "admin",
        pin: setupData.adminPin,
      });
      toast.success("تم الانتهاء من الإعداد بنجاح!");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإعداد");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: registerData.name });

      const defaultUserSettings = { ...settings };
      await syncDefaultDataToFirestore(user.uid, defaultUserSettings, registerData.name);

      login({
        id: user.uid,
        name: registerData.name,
        role: "admin", // New users default to admin of their own store
        pin: settings.adminPin,
      });
      toast.success("تم إنشاء الحساب بنجاح!");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const user = userCredential.user;

      // Fetch user specific data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let role = "admin";
      let pin = "0000";

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.settings) updateSettings(data.settings);
        if (data.profile) {
          role = data.profile.role || "admin";
          pin = data.profile.pin || data.settings?.adminPin || "0000";
        }
      }

      login({
        id: user.uid,
        name: user.displayName || "مستخدم",
        role: role as "admin" | "cashier",
        pin: pin,
      });
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error: any) {
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
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
        {mode === "setup" && (
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
              <h1 className="text-2xl font-bold mb-2 relative z-10">إعداد المتجر الجديد</h1>
              <p className="text-indigo-100 relative z-10">أهلاً بك! لنقم بإعداد نظامك</p>
            </div>

            <form onSubmit={handleSetup} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">اسم المتجر / الشركة</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: سوبر ماركت الأمل"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  value={setupData.storeName}
                  onChange={(e) => setSetupData({ ...setupData, storeName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">العملة المحلية</label>
                <select
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  value={setupData.currency}
                  onChange={(e) => setSetupData({ ...setupData, currency: e.target.value })}
                >
                  <option value="ر.س">ريال سعودي (ر.س)</option>
                  <option value="د.إ">درهم إماراتي (د.إ)</option>
                  <option value="$">دولار أمريكي ($)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">بيانات مدير النظام</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">البريد الإلكتروني</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left"
                      dir="ltr"
                      value={setupData.email}
                      onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">كلمة المرور</label>
                    <input
                      required
                      type="password"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left"
                      dir="ltr"
                      value={setupData.password}
                      onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">اسم المدير</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      value={setupData.adminName}
                      onChange={(e) => setSetupData({ ...setupData, adminName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">رمز PIN للتأكيد (4 أرقام)</label>
                    <input
                      required
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      placeholder="0000"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-center tracking-widest text-lg"
                      value={setupData.adminPin}
                      onChange={(e) => setSetupData({ ...setupData, adminPin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "جاري الإعداد..." : "البدء باستخدام النظام"}
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  لدي حساب بالفعل؟ تسجيل الدخول
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {mode === "login" && (
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
                  <img src={settings.storeLogo} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <Store className="w-8 h-8 text-white" />
                )}
              </motion.div>
              <h1 className="text-2xl font-bold mb-2 relative z-10">{settings.storeName}</h1>
              <p className="text-indigo-100 relative z-10">تسجيل الدخول للنظام</p>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="admin@example.com"
                      dir="ltr"
                      className="w-full pr-10 pl-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full pr-10 pl-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-left"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </motion.button>

              <div className="text-center mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  ليس لديك حساب؟ <span className="font-bold underline">تسجيل مستخدم جديد</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {mode === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <div className="p-8 text-center bg-emerald-600 dark:bg-emerald-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10"
              >
                <UserCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2 relative z-10">تسجيل حساب جديد</h1>
              <p className="text-emerald-100 relative z-10">أنشئ حسابك للبدء في إدارة أعمالك</p>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="الاسم الأول والأخير"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all text-left"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all text-left"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </motion.button>

              <div className="text-center mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  لدي حساب بالفعل؟ <span className="font-bold underline">تسجيل الدخول</span>
                </button>
              </div>
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
