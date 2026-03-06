import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Login() {
  const { login, settings, updateSettings } = useAppContext();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState({ name: "", email: "", phone: "", password: "", countryCode: "+90" });

  const syncDefaultDataToFirestore = async (uid: string, name: string) => {
    await setDoc(doc(db, "users", uid), {
      settings: settings,
      profile: { name, role: "admin", pin: "0000" },
      createdAt: new Date().toISOString()
    });
  };

  const handleAuthResult = async (user: any) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    let role = "admin";
    let pin = "0000";

    if (!userDoc.exists()) {
      await syncDefaultDataToFirestore(user.uid, user.displayName || "مستخدم جديد");
    } else {
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
  };

  const handleProviderLogin = async (providerName: "google" | "facebook" | "apple") => {
    setLoading(true);
    let provider;
    if (providerName === "google") provider = new GoogleAuthProvider();
    else if (providerName === "facebook") provider = new FacebookAuthProvider();
    else provider = new OAuthProvider('apple.com');

    try {
      const result = await signInWithPopup(auth, provider);
      await handleAuthResult(result.user);
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      await updateProfile(userCredential.user, { displayName: registerData.name });
      await syncDefaultDataToFirestore(userCredential.user.uid, registerData.name);
      await handleAuthResult(userCredential.user);
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
      await handleAuthResult(userCredential.user);
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error: any) {
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  const AppleIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.61.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.55 4.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      {/* Top Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-[#3b9c8b] font-bold text-3xl">فاتورة</span>
        <div className="bg-[#48b09d] text-white p-1 rounded-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="absolute -left-16 text-gray-500 font-bold border rounded-full px-2 text-sm">EN</div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "register" ? (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-100 p-8 mt-12"
          >
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-[#1a2b3c] mb-3">أدوات متكاملة تساعدك على البيع وتحصيل دفعاتك</h1>
              <p className="text-gray-500 text-sm">حصل أموالك في أي وقت ومن أي مكان بسهولة وأمان مع فاتورة</p>
            </div>

            <div className="text-center mb-6">
              <p className="text-[#1a2b3c] font-bold text-sm mb-4">سجل بسهولة من خلال حسابك في:</p>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => handleProviderLogin("facebook")} className="flex items-center justify-center gap-2 bg-[#f4f6f8] hover:bg-gray-200 py-3 rounded-md transition-colors font-medium text-sm text-gray-700">
                  <FacebookIcon /> Facebook
                </button>
                <button type="button" onClick={() => handleProviderLogin("apple")} className="flex items-center justify-center gap-2 bg-[#f4f6f8] hover:bg-gray-200 py-3 rounded-md transition-colors font-medium text-sm text-gray-700">
                  <AppleIcon /> Apple
                </button>
                <button type="button" onClick={() => handleProviderLogin("google")} className="flex items-center justify-center gap-2 bg-[#f4f6f8] hover:bg-gray-200 py-3 rounded-md transition-colors font-medium text-sm text-gray-700">
                  <GoogleIcon /> Google
                </button>
              </div>
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-gray-200 text-transparent">.</div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm bg-white px-2 border border-gray-200 rounded-full">أو</span>
              <div className="flex-grow border-t border-gray-200 text-transparent">.</div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1a2b3c] mb-2 text-right">الاسم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#48b09d] text-gray-700 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a2b3c] mb-2 text-right">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="example@mail.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#48b09d] text-gray-700 transition-colors text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a2b3c] mb-2 text-right">رقم الجوال</label>
                <div className="flex border border-gray-300 rounded-md overflow-hidden focus-within:border-[#48b09d] transition-colors relative">
                  <div className="flex items-center bg-transparent px-3 py-3 border-l border-gray-300 w-24 gap-1 dir-ltr text-left">
                    <span>🇹🇷</span>
                    <select
                      className="bg-transparent text-gray-700 outline-none text-sm appearance-none flex-1 pr-1"
                      value={registerData.countryCode}
                      onChange={(e) => setRegisterData({ ...registerData, countryCode: e.target.value })}
                      dir="ltr"
                    >
                      <option value="+90">+90</option>
                      <option value="+966">+966</option>
                      <option value="+20">+20</option>
                      <option value="+971">+971</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    required
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full pl-4 pr-3 py-3 focus:outline-none text-gray-700 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a2b3c] mb-2 text-right">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#48b09d] text-gray-700 transition-colors text-left"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-[#48b09d] hover:bg-[#3d9887] text-white px-12 py-3 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
                >
                  {loading ? "جاري الإنشاء..." : (
                    <>
                      <Check className="w-5 h-5" /> إبدأ الان
                    </>
                  )}
                </motion.button>
              </div>

              <div className="text-center mt-6">
                <p className="text-xs text-gray-500 mb-4">بالضغط على زر " إبدأ الان " أنت توافق على <a href="#" className="text-[#48b09d] hover:underline">الأحكام والشروط</a></p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#3b9c8b] font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Lock className="w-4 h-4" /> سجل الدخول
                  <span className="text-gray-500 font-normal mr-1">لديك حساب بالفعل؟</span>
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 mt-12"
          >
            <div className="flex flex-col items-center mb-8 relative">
              <div className="bg-gray-50/50 w-48 h-48 rounded-full absolute -top-8 -z-10"></div>
              <div className="bg-[#48b09d] text-white p-3 rounded-xl mb-4 shadow-sm z-10 w-16 h-16 flex items-center justify-center mt-4">
                <Lock className="w-8 h-8" />
              </div>
              {/* Background art mock */}
              <div className="absolute left-10 top-16 z-0 hidden sm:block opacity-70">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d5a133" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
              </div>
              <div className="absolute right-12 top-10 z-0 hidden sm:block">
                <div className="bg-[#48b09d] w-24 h-3 rounded-full mb-2"></div>
                <div className="bg-[#48b09d] w-32 h-3 rounded-full opacity-80 mb-2"></div>
                <div className="bg-[#48b09d] w-28 h-3 rounded-full opacity-60"></div>
              </div>

              <h1 className="text-2xl font-bold text-[#1a2b3c] z-10 mt-6 pt-2">تسجيل الدخول</h1>
              <p className="text-gray-500 text-sm mt-1 z-10">مرحبا بعودتك</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <button type="button" onClick={() => handleProviderLogin("facebook")} className="flex items-center justify-center gap-2 bg-[#f4f6f8] hover:bg-gray-200 py-3 rounded-md transition-colors font-medium text-sm text-gray-700">
                <FacebookIcon /> Facebook
              </button>
              <button type="button" onClick={() => handleProviderLogin("google")} className="flex items-center justify-center gap-2 bg-[#f4f6f8] hover:bg-gray-200 py-3 rounded-md transition-colors font-medium text-sm text-gray-700">
                <GoogleIcon /> Google
              </button>
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-gray-200 text-transparent">.</div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm bg-white px-2 border border-gray-200 rounded-full">أو</span>
              <div className="flex-grow border-t border-gray-200 text-transparent">.</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1a2b3c] mb-2 text-right">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="example@mail.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#48b09d] text-gray-700 transition-colors text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a2b3c] mb-2 text-right">كلمه المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="* * * *"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#48b09d] text-gray-700 transition-colors tracking-widest text-left"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a href="#" className="text-[#3b9c8b] text-sm font-bold hover:underline">هل نسيت كلمة المرور؟</a>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <span>تذكرني</span>
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                    className="w-4 h-4 text-[#48b09d] border-gray-300 rounded focus:ring-[#48b09d]"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-[#48b09d] hover:bg-[#3d9887] text-white px-10 py-3 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md w-full sm:w-auto"
                >
                  {loading ? "جاري الدخول..." : (
                    <>
                      <Check className="w-5 h-5" /> تسجيل الدخول
                    </>
                  )}
                </motion.button>
              </div>

              <div className="text-center mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-[#3b9c8b] font-bold text-sm hover:underline"
                >
                  <span className="text-gray-500 font-normal ml-1">ليس لديك حساب؟</span>
                  سجل الان
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
