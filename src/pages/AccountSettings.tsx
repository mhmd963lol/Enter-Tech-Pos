import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import {
  User, Shield, Key, Save, Check, Mail, Phone, Link, Unlink,
  Eye, EyeOff, ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth } from "../lib/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  verifyBeforeUpdateEmail,
  GoogleAuthProvider,
  linkWithPopup,
  linkWithPhoneNumber,
  unlink,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  reload,
} from "firebase/auth";

// Helper: get current providers
const getProviders = () => {
  const user = auth.currentUser;
  if (!user) return [];
  return user.providerData.map((p) => p.providerId);
};

const PROVIDER_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "google.com": {
    label: "Google", color: "bg-blue-50 text-blue-700 border-blue-200", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
    )
  },
  "password": { label: "البريد الإلكتروني", color: "bg-purple-50 text-purple-700 border-purple-200", icon: <Mail className="w-4 h-4" /> },
  "phone": { label: "رقم الهاتف", color: "bg-green-50 text-green-700 border-green-200", icon: <Phone className="w-4 h-4" /> },
};

// ── Section wrapper ──
const Section = ({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-right hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
        <div className="flex items-center gap-3">
          <div className="text-[#48b09d]">{icon}</div>
          <h3 className="font-bold text-zinc-900 dark:text-white">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AccountSettings() {
  const { user } = useAppContext();
  const [providers, setProviders] = useState<string[]>([]);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<any>(null);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  // Email change state
  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPw: "" });
  // Phone change state
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [phoneForm, setPhoneForm] = useState({ newPhone: "", countryCode: "+966", otp: "" });
  const [phoneConfirmResult, setPhoneConfirmResult] = useState<any>(null);
  // Name
  const [name, setName] = useState(user?.name || "");

  useEffect(() => {
    const load = async () => {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        setProviders(getProviders());
      }
    };
    load();
  }, []);

  const refreshProviders = async () => {
    if (auth.currentUser) { await reload(auth.currentUser); setProviders(getProviders()); }
  };

  // ── Update Name ──
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("الاسم لا يمكن أن يكون فارغاً"); return; }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: name });
      toast.success("تم تحديث الاسم بنجاح");
    } catch { toast.error("حدث خطأ أثناء تحديث الاسم"); }
    finally { setLoading(false); }
  };

  // ── Change Password ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cu = auth.currentUser;
    if (!cu || !cu.email) { toast.error("يجب تسجيل الدخول بالبريد الإلكتروني لتغيير كلمة المرور"); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    if (pwForm.newPw.length < 6) { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(cu.email, pwForm.current);
      await reauthenticateWithCredential(cu, cred);
      await updatePassword(cu, pwForm.newPw);
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast.success("تم تغيير كلمة المرور بنجاح");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") toast.error("كلمة المرور الحالية غير صحيحة");
      else if (err.code === "auth/weak-password") toast.error("كلمة المرور الجديدة ضعيفة جداً");
      else toast.error("حدث خطأ، حاول مجدداً");
    } finally { setLoading(false); }
  };

  // ── Change Email ──
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cu = auth.currentUser;
    if (!cu || !cu.email) { toast.error("هذا الحساب لا يستخدم البريد الإلكتروني"); return; }
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(cu.email, emailForm.currentPw);
      await reauthenticateWithCredential(cu, cred);
      await verifyBeforeUpdateEmail(cu, emailForm.newEmail);
      setEmailForm({ newEmail: "", currentPw: "" });
      toast.success("تم إرسال رابط تأكيد للبريد الجديد. تحقق منه للإتمام.");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") toast.error("كلمة المرور الحالية غير صحيحة");
      else if (err.code === "auth/email-already-in-use") toast.error("هذا البريد مستخدم بالفعل");
      else toast.error("حدث خطأ، تأكد من البريد الجديد وكلمة المرور");
    } finally { setLoading(false); }
  };

  // ── Change Phone ──
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-settings", { size: "invisible", callback: () => { } });
    }
    return recaptchaRef.current;
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fullPhone = `${phoneForm.countryCode}${phoneForm.newPhone}`;
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      setPhoneConfirmResult(result);
      setPhoneStep("otp");
      toast.success("تم إرسال رمز التحقق إلى رقمك الجديد");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في إرسال الرمز");
      recaptchaRef.current = null;
    } finally { setLoading(false); }
  };

  const handleConfirmPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneConfirmResult) return;
    setLoading(true);
    try {
      const phoneCredential = PhoneAuthProvider.credential(phoneConfirmResult.verificationId, phoneForm.otp);
      await linkWithCredential(auth.currentUser!, phoneCredential);
      await refreshProviders();
      setPhoneForm({ newPhone: "", countryCode: "+966", otp: "" });
      setPhoneStep("input");
      toast.success("تم ربط رقم الهاتف الجديد بنجاح");
    } catch (err: any) {
      if (err.code === "auth/provider-already-linked") toast.error("رقم الهاتف هذا مرتبط بحساب آخر");
      else toast.error("رمز التحقق غير صحيح");
    } finally { setLoading(false); }
  };

  // ── Link Google ──
  const handleLinkGoogle = async () => {
    setLoading(true);
    try {
      await linkWithPopup(auth.currentUser!, new GoogleAuthProvider());
      await refreshProviders();
      toast.success("تم ربط حساب Google بنجاح");
    } catch (err: any) {
      if (err.code === "auth/provider-already-linked") toast.error("Google مرتبط بالفعل");
      else if (err.code === "auth/credential-already-in-use") toast.error("هذا الحساب مرتبط بحساب آخر");
      else toast.error("حدث خطأ أثناء الربط");
    } finally { setLoading(false); }
  };

  // ── Unlink Provider ──
  const handleUnlink = async (providerId: string) => {
    if (providers.length <= 1) {
      toast.error("لا يمكنك فك ربط الطريقة الوحيدة لتسجيل الدخول — أضف طريقة أخرى أولاً");
      return;
    }
    setLoading(true);
    try {
      await unlink(auth.currentUser!, providerId);
      await refreshProviders();
      toast.success("تم فك الربط بنجاح");
    } catch { toast.error("حدث خطأ أثناء فك الربط"); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#48b09d] dark:text-white transition-colors text-sm";
  const btnPrimary = "flex items-center gap-2 px-6 py-2.5 bg-[#48b09d] hover:bg-[#3d9887] text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-60";

  return (
    <div className="max-w-2xl mx-auto space-y-5 p-4 md:p-6" dir="rtl">
      <div id="recaptcha-settings" />

      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#48b09d]" /> إعدادات الحساب
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">إدارة ملفك الشخصي وبيانات الأمان</p>
      </div>

      {/* ── Name ── */}
      <Section title="الاسم الشخصي" icon={<User className="w-5 h-5" />} defaultOpen={true}>
        <form onSubmit={handleUpdateName} className="pt-4 flex gap-3 items-end">
          <div className="flex-1">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل" className={inputClass} />
          </div>
          <button type="submit" disabled={loading || name === user?.name} className={btnPrimary}>
            <Save className="w-4 h-4" /> حفظ
          </button>
        </form>
      </Section>

      {/* ── Change Password ── */}
      <Section title="تغيير كلمة المرور" icon={<Key className="w-5 h-5" />}>
        {!providers.includes("password") ? (
          <p className="text-sm text-zinc-500 pt-4">حسابك لا يستخدم كلمة مرور. لربط البريد الإلكتروني، استخدم قسم الحسابات المرتبطة.</p>
        ) : (
          <form onSubmit={handleChangePassword} className="pt-4 space-y-3">
            <div className="relative">
              <input type={showCurrentPw ? "text" : "password"} required placeholder="كلمة المرور الحالية"
                value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className={inputClass + " pl-10"} dir="ltr" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <input type={showNewPw ? "text" : "password"} required placeholder="كلمة المرور الجديدة (6+ أحرف)"
                value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                className={inputClass + " pl-10"} dir="ltr" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input type="password" required placeholder="تأكيد كلمة المرور الجديدة"
              value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className={inputClass} dir="ltr" />
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> تغيير كلمة المرور</>}
              </button>
            </div>
          </form>
        )}
      </Section>

      {/* ── Change Email ── */}
      <Section title="تغيير البريد الإلكتروني" icon={<Mail className="w-5 h-5" />}>
        {!providers.includes("password") ? (
          <p className="text-sm text-zinc-500 pt-4">حسابك لا يستخدم بريداً إلكترونياً مباشراً.</p>
        ) : (
          <>
            <div className="pt-3 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">سيتم إرسال رابط تأكيد للبريد الجديد قبل التغيير لضمان الأمان.</p>
            </div>
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <input type="email" required placeholder="البريد الإلكتروني الجديد"
                value={emailForm.newEmail} onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                className={inputClass} dir="ltr" />
              <input type="password" required placeholder="كلمة المرور الحالية للتحقق"
                value={emailForm.currentPw} onChange={(e) => setEmailForm({ ...emailForm, currentPw: e.target.value })}
                className={inputClass} dir="ltr" />
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className={btnPrimary}>
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> إرسال رابط التأكيد</>}
                </button>
              </div>
            </form>
          </>
        )}
      </Section>

      {/* ── Change Phone ── */}
      <Section title="تغيير / ربط رقم الهاتف" icon={<Phone className="w-5 h-5" />}>
        {phoneStep === "input" ? (
          <form onSubmit={handleSendPhoneOtp} className="pt-4 space-y-3">
            <div className="flex border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#48b09d]">
              <select value={phoneForm.countryCode} onChange={(e) => setPhoneForm({ ...phoneForm, countryCode: e.target.value })}
                className="bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-white px-3 py-3 text-sm outline-none border-l border-zinc-200 dark:border-zinc-700" dir="ltr">
                <option value="+966">🇸🇦 +966</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+20">🇪🇬 +20</option>
                <option value="+90">🇹🇷 +90</option>
                <option value="+1">🇺🇸 +1</option>
              </select>
              <input type="tel" required placeholder="5XXXXXXXX" value={phoneForm.newPhone}
                onChange={(e) => setPhoneForm({ ...phoneForm, newPhone: e.target.value })}
                className="flex-1 pl-4 pr-3 py-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-white outline-none text-left text-sm" dir="ltr" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Phone className="w-4 h-4" /> إرسال رمز التحقق</>}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmPhoneOtp} className="pt-4 space-y-3">
            <p className="text-sm text-zinc-500">أدخل رمز التحقق المرسل للرقم الجديد</p>
            <input type="text" required maxLength={6} placeholder="_ _ _ _ _ _" value={phoneForm.otp}
              onChange={(e) => setPhoneForm({ ...phoneForm, otp: e.target.value })}
              className={inputClass + " text-center text-xl tracking-widest font-bold"} dir="ltr" />
            <div className="flex justify-between items-center pt-1">
              <button type="button" onClick={() => setPhoneStep("input")} className="text-sm text-zinc-400 hover:text-zinc-600">تغيير الرقم</button>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> تأكيد وربط الرقم</>}
              </button>
            </div>
          </form>
        )}
      </Section>

      {/* ── Linked Accounts ── */}
      <Section title="الحسابات المرتبطة" icon={<Link className="w-5 h-5" />}>
        <div className="pt-4 space-y-3">
          {providers.length === 0 && <p className="text-sm text-zinc-400">لا توجد حسابات مرتبطة حالياً</p>}
          {providers.map((pId) => {
            const info = PROVIDER_LABELS[pId];
            if (!info) return null;
            return (
              <div key={pId} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${info.color}`}>
                <div className="flex items-center gap-2 font-medium text-sm">
                  {info.icon} {info.label}
                  <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 mr-1">مربوط</span>
                </div>
                <button type="button" onClick={() => handleUnlink(pId)} disabled={loading || providers.length <= 1}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-red-200 rounded-lg px-2 py-1">
                  <Unlink className="w-3 h-3" /> فك الربط
                </button>
              </div>
            );
          })}

          {/* Add Google if not linked */}
          {!providers.includes("google.com") && (
            <button type="button" onClick={handleLinkGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-700 transition-colors disabled:opacity-60">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              ربط حساب Google
            </button>
          )}

          {providers.length <= 1 && (
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl mt-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">تحتاج على الأقل طريقة واحدة لتسجيل الدخول. أضف طريقة أخرى قبل فك الربط الحالي.</p>
            </div>
          )}
        </div>
      </Section>

      {/* Role Badge */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#48b09d]/10 rounded-full flex items-center justify-center shrink-0">
          <Shield className="w-7 h-7 text-[#48b09d]" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">الصلاحية الحالية</p>
          <p className="font-bold text-zinc-900 dark:text-white">{user?.role === "admin" ? "مدير النظام" : "كاشير"}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{auth.currentUser?.email || auth.currentUser?.phoneNumber || "—"}</p>
        </div>
      </div>
    </div>
  );
}
