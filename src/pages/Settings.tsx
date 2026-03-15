import React, { useState, useRef, useEffect } from "react";
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
  Layers,
  Zap,
  User, Shield, Key, Mail, Phone, Link, Unlink,
  Eye, EyeOff, ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react";
import { auth } from "../lib/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  verifyBeforeUpdateEmail,
  GoogleAuthProvider,
  linkWithPopup,
  unlink,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  reload,
} from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import NumberInput from "../components/NumberInput";
import toast from "react-hot-toast";

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
const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-4">
      <div className="w-full flex items-center justify-between p-5 text-right border-b border-zinc-50 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
          <h3 className="font-bold text-zinc-900 dark:text-white">{title}</h3>
        </div>
      </div>
      <div className="p-5 dark:bg-zinc-950/50">
        {children}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const { user, settings, updateSettings, isPro, resetApp, logout, exportData, importData } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account States
  const [providers, setProviders] = useState<string[]>([]);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<any>(null);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPw: "" });
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [phoneForm, setPhoneForm] = useState({ newPhone: "", countryCode: "+966", otp: "" });
  const [phoneConfirmResult, setPhoneConfirmResult] = useState<any>(null);
  const [name, setName] = useState(user?.name || "");

  // PIN Recovery & Protection
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinVerifyModal, setShowPinVerifyModal] = useState(false);
  const [pinVerifyMethod, setPinVerifyMethod] = useState<"email" | "phone" | "google" | null>(null);
  const [verificationError, setVerificationError] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cu = auth.currentUser;
    if (!cu) return;
    if (pwForm.newPw !== pwForm.confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    if (pwForm.newPw.length < 6) { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true);
    try {
      if (pwForm.current) {
        if (!cu.email) { toast.error("يجب تسجيل الدخول بالبريد الإلكتروني لتأكيد كلمة المرور الحالية"); return; }
        const cred = EmailAuthProvider.credential(cu.email, pwForm.current);
        await reauthenticateWithCredential(cu, cred);
      }
      await updatePassword(cu, pwForm.newPw);
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast.success("تم حفظ كلمة المرور بنجاح");
      await refreshProviders();
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") toast.error("كلمة المرور الحالية غير صحيحة");
      else if (err.code === "auth/requires-recent-login") toast.error("يرجى تسجيل الخروج والدخول مجدداً لتأكيد هويتك قبل تغيير كلمة المرور");
      else if (err.code === "auth/weak-password") toast.error("كلمة المرور الجديدة ضعيفة جداً");
      else toast.error("حدث خطأ، حاول مجدداً");
    } finally { setLoading(false); }
  };

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

  const handleStartPinVerification = () => {
    const provs = getProviders();
    if (provs.includes("google.com")) setPinVerifyMethod("google");
    else if (provs.includes("phone")) setPinVerifyMethod("phone");
    else if (provs.includes("password")) setPinVerifyMethod("email");
    setShowPinVerifyModal(true);
    setVerificationError("");
  };

  const handleVerifyForPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cu = auth.currentUser;
    if (!cu) return;
    setIsVerifying(true);
    setVerificationError("");

    try {
      if (pinVerifyMethod === "google") {
        await reauthenticateWithCredential(cu, GoogleAuthProvider.credentialFromResult(await linkWithPopup(cu, new GoogleAuthProvider())) as any);
        setIsPinVerified(true);
        setShowPinVerifyModal(false);
        toast.success("تم التحقق بنجاح");
      } else if (pinVerifyMethod === "email") {
        const cred = EmailAuthProvider.credential(cu.email!, verifyPassword);
        await reauthenticateWithCredential(cu, cred);
        setIsPinVerified(true);
        setShowPinVerifyModal(false);
        toast.success("تم التحقق بنجاح");
      } else if (pinVerifyMethod === "phone") {
        // For simplicity, we'll assume they need to do the phone flow if they only have phone
        // But since they are logged in, we might just use the phoneForm logic
        toast.error("التحقق عبر الهاتف يتطلب إعادة إرسال رمز - يرجى استخدام البريد أو جوجل إذا أمكن");
      }
    } catch (err: any) {
      setVerificationError("التحقق فشل. تأكد من البيانات وحاول مجدداً.");
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

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

  // Auto-save logic
  useEffect(() => {
    if (JSON.stringify(localSettings) === JSON.stringify(settings)) return;

    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      updateSettings(localSettings);
      setTimeout(() => {
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }, 300);
    }, 1000); // 1s debounce for auto-save

    return () => clearTimeout(timeoutId);
  }, [localSettings, updateSettings, settings]);

  const handleSave = () => {
    // Explicit manual save (optional bridge if needed, but the useEffect handles it)
    updateSettings(localSettings);
    toast.success("تم حفظ الإعدادات يدوياً");
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    if (resetConfirmationText !== "مسح") return;
    setIsSaving(true);
    await resetApp();
    logout();
    setShowResetConfirm(false);
    setResetConfirmationText("");
    setIsSaving(false);
  };

  const handleExportBackup = () => {
    const backupData = exportData();
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
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.settings) {
          setIsSaving(true);
          await importData(json);
          setLocalSettings(json.settings);
          toast.success("تم تحميل البيانات من النسخة الاحتياطية بنجاح.");
          setIsSaving(false);
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
    { id: "account", label: "حسابي والأمان", icon: User },
    { id: "appearance", label: "المظهر والأصوات", icon: Moon },
    { id: "finance", label: "المالية والضرائب", icon: DollarSign },
    { id: "advanced", label: "بيانات متقدمة", icon: ShieldAlert },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center shadow-inner">
            <SettingsIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">الإعدادات الشاملة</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">تحكم بجميع تفاصيل خيارات النظام والمظهر</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${showSuccess
            ? "bg-emerald-500 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
            }`}
        >
          {showSuccess ? (
            <><Check className="w-5 h-5" /> <span className="hidden sm:inline">تم الحفظ</span></>
          ) : isSaving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> <span className="hidden sm:inline">جاري...</span></>
          ) : (
            <><Save className="w-5 h-5" /> <span className="hidden sm:inline">حفظ يدوي</span></>
          )}
        </motion.button>
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
        <div id="recaptcha-settings" />
        <AnimatePresence mode="wait">
          {/* Account Tab */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center gap-4 mb-2 p-4 bg-indigo-50 dark:bg-zinc-900 rounded-2xl border border-indigo-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
                  {name.charAt(0) || user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{name || user?.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{auth.currentUser?.email || auth.currentUser?.phoneNumber || "لا يوجد بريد مرتبط"}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {user?.role === "admin" ? "مدير النظام" : "كاشير"}
                  </span>
                </div>
              </div>

              {/* Name */}
              <Section title="تعديل الاسم الشخصي" icon={<User className="w-5 h-5" />}>
                <form onSubmit={handleUpdateName} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="الاسم الكامل" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm" />
                  </div>
                  <button type="submit" disabled={loading || name === user?.name} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-60">
                    <Save className="w-4 h-4" /> حفظ
                  </button>
                </form>
              </Section>

              {/* Password */}
              <Section title="تغيير كلمة المرور" icon={<Key className="w-5 h-5" />}>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  {providers.includes("password") && (
                    <div className="relative">
                      <input type={showCurrentPw ? "text" : "password"} placeholder="كلمة المرور الحالية (اتركها فارغة إذا سجلت الدخول للتو بـ SMS)"
                        value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm pl-10" dir="ltr" />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  {!providers.includes("password") && (
                     <div className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 p-3 rounded-lg text-xs leading-relaxed border border-indigo-100 dark:border-indigo-800">
                        حسابك لا يمتلك كلمة مرور. قم بإنشاء واحدة الآن لتتمكن من الدخول بسهولة في المستقبل.
                     </div>
                  )}
                  <div className="relative">
                    <input type={showNewPw ? "text" : "password"} required placeholder="كلمة المرور الجديدة (6+ أحرف)"
                      value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm pl-10" dir="ltr" />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <input type="password" required placeholder="تأكيد كلمة المرور الجديدة"
                    value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm" dir="ltr" />
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors text-sm">
                      {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> حفظ كلمة المرور</>}
                    </button>
                  </div>
                </form>
              </Section>

              {/* Email */}
              <Section title="تغيير البريد الإلكتروني" icon={<Mail className="w-5 h-5" />}>
                {!providers.includes("password") ? (
                  <p className="text-xs text-zinc-500 pt-2">حسابك لا يستخدم بريداً إلكترونياً مباشراً.</p>
                ) : (
                  <form onSubmit={handleChangeEmail} className="space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">سنرسل لك رابط تأكيد إلى بريدك الإلكتروني الجديد. يجب النقر عليه لتفعيل التغيير.</p>
                    </div>
                    <input type="email" required placeholder="البريد الإلكتروني الجديد"
                      value={emailForm.newEmail} onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm" dir="ltr" />
                    <input type="password" required placeholder="كلمة المرور الحالية للأمان"
                      value={emailForm.currentPw} onChange={(e) => setEmailForm({ ...emailForm, currentPw: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm" dir="ltr" />
                    <div className="flex justify-end">
                      <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors text-sm">
                        {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> إرسال رابط التأكيد</>}
                      </button>
                    </div>
                  </form>
                )}
              </Section>

              {/* Linked Accounts */}
              <Section title="الحسابات المرتبطة" icon={<Link className="w-5 h-5" />}>
                <div className="space-y-3">
                  {providers.map((pId) => {
                    const info = PROVIDER_LABELS[pId];
                    if (!info) return null;
                    return (
                      <div key={pId} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${info.color}`}>
                        <div className="flex items-center gap-3 font-bold text-sm">
                          {info.icon} {info.label}
                          <span className="text-[10px] bg-green-500/10 text-green-600 rounded-lg px-2 py-0.5 mr-1 border border-green-500/20">نشط</span>
                        </div>
                        <button type="button" onClick={() => handleUnlink(pId)} disabled={loading || providers.length <= 1}
                          className="flex items-center gap-1 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-2 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 transition-all font-bold">
                          <Unlink className="w-3 h-3" /> فك الارتباط
                        </button>
                      </div>
                    );
                  })}
                  {!providers.includes("google.com") && (
                    <button type="button" onClick={handleLinkGoogle} disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 py-3 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-200 shadow-sm transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                      ربط حساب Google
                    </button>
                  )}
                </div>
              </Section>
            </motion.div>
          )}

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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { id: "default", name: "الأساسي", desc: "نظيف وعملي", bg: "bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-800 dark:to-zinc-900", border: "border-indigo-200 dark:border-zinc-700", text: "text-zinc-900 dark:text-white" },
                        { id: "cashier-tech", name: "كاشير تك 💚", desc: "ذكي واحترافي", bg: "bg-gradient-to-br from-[#0d1117] to-[#111820]", border: "border-[#00E676]/50", text: "text-[#e0f0e8]" },
                        { id: "ios-glass", name: "آي أو إس زجاجي 🍏", desc: "عصري وشفاف", bg: "bg-gradient-to-br from-blue-400 via-indigo-400 to-rose-400", border: "border-white/30", text: "text-white shadow-sm" },
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

                  {/* Harmony & Custom Colors */}
                  <div className="col-span-1 md:col-span-2 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left: Presets & Primary */}
                      <div className="flex-1 space-y-6">
                        <div>
                          <label className="block text-lg font-black text-zinc-900 dark:text-white mb-2">تدرجات ألوان الواجهة</label>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">اختر الطابع العام أو خصص كل جزء على حدة.</p>

                          <div className="flex flex-wrap gap-3 mb-6">
                            {[
                              { id: "indigo", color: "#4f46e5", name: "نيلي" },
                              { id: "emerald", color: "#10b981", name: "زمردي" },
                              { id: "rose", color: "#f43f5e", name: "وردي" },
                              { id: "amber", color: "#f59e0b", name: "كهرماني" },
                              { id: "cyan", color: "#06b6d4", name: "سماوي" },
                              { id: "violet", color: "#8b5cf6", name: "بنفسجي" },
                              { id: "gaming", color: "#d946ef", name: "جيمنج" },
                            ].map((t) => (
                              <button
                                key={t.id}
                                onClick={() =>
                                  setLocalSettings({
                                    ...localSettings,
                                    activeTheme: t.id as any,
                                    primaryColor: t.color,
                                    sidebarColor: t.color,
                                    navbarColor: t.color,
                                    backgroundColor: t.id === "gaming" ? "#050110" : t.id === "carbon" ? "#0d0d0d" : t.id === "luxury" ? "#0a0a0a" : "#f9fafb"
                                  })
                                }
                                className={`w-10 h-10 rounded-xl transition-all shadow-sm ${localSettings.primaryColor === t.color ? "ring-4 ring-indigo-500/30 scale-110" : "hover:scale-105"}`}
                                style={{ backgroundColor: t.color }}
                                title={t.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Granular Color Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "اللون الأساسي", key: "primaryColor" },
                            { label: "لون القائمة الجانبية", key: "sidebarColor" },
                            { label: "لون الشريط العلوي", key: "navbarColor" },
                            { label: "لون الخلفية العامة", key: "backgroundColor" },
                          ].map((item) => (
                            <div key={item.key} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-400">{(localSettings as any)[item.key]}</span>
                                <input
                                  type="color"
                                  value={(localSettings as any)[item.key] || "#4f46e5"}
                                  onChange={(e) => setLocalSettings({ ...localSettings, [item.key]: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Glass & Speed */}
                      <div className="w-full lg:w-72 space-y-6 pt-6 lg:pt-0 lg:border-r lg:pr-8 border-zinc-200 dark:border-zinc-800">
                        <div>
                          <label className="block text-sm font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            شفافية الزجاج (Glass)
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={localSettings.glassOpacity || 0.8}
                            onChange={(e) => setLocalSettings({ ...localSettings, glassOpacity: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <div className="flex justify-between text-[10px] text-zinc-400 mt-2">
                            <span>شفاف جداً</span>
                            <span>{Math.round((localSettings.glassOpacity || 0.8) * 100)}%</span>
                            <span>معتم</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-black text-zinc-900 dark:text-white mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-500" />
                              سرعة الحركات (Animations)
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocalSettings({ ...localSettings, disableAnimations: !localSettings.disableAnimations })}>
                              <span className="text-[10px] text-zinc-500 font-bold">{localSettings.disableAnimations ? "موقفة" : "تعمل"}</span>
                              <div className={`w-8 h-4 rounded-full relative transition-colors ${localSettings.disableAnimations ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-indigo-500'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${localSettings.disableAnimations ? 'left-0.5' : 'left-4.5'}`} />
                              </div>
                            </div>
                          </label>
                          <div className={`grid grid-cols-3 gap-2 ${localSettings.disableAnimations ? 'opacity-40 pointer-events-none' : ''}`}>
                            {["slow", "normal", "fast"].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => setLocalSettings({ ...localSettings, animationSpeed: speed as any })}
                                className={`py-2 text-xs font-bold rounded-lg border transition-all ${localSettings.animationSpeed === speed
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-indigo-300"
                                  }`}
                              >
                                {speed === "slow" ? "هادئ" : speed === "normal" ? "عادي" : "سريع"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div className="col-span-1 md:col-span-2 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <label className="block text-lg font-bold text-zinc-900 dark:text-white mb-2">لوحة التحكم المخصصة (Dashboard)</label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">تحكم في العناصر التي تظهر في الشاشة الرئيسية لمتجرك</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: "showSales", label: "إجمالي المبيعات" },
                        { id: "showOrders", label: "إجمالي الطلبات" },
                        { id: "showProducts", label: "المنتجات المتاحة" },
                        { id: "showInventoryValue", label: "قيمة المخزون" },
                        { id: "showChart", label: "المبيعات الأسبوعية (رسم بياني)" },
                        { id: "showRecentOrders", label: "أحدث الطلبات والنشاطات" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={localSettings.dashboardLayout?.[item.id as keyof typeof localSettings.dashboardLayout] !== false}
                              onChange={(e) =>
                                setLocalSettings({
                                  ...localSettings,
                                  dashboardLayout: {
                                    ...(localSettings.dashboardLayout || {}),
                                    [item.id]: e.target.checked,
                                  },
                                })
                              }
                            />
                            <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                    <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">آلية الترحيل للصندوق الرئيسي</label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">اختر كيف تنتقل الأموال من المبيعات إلى الخزينة الرئيسية.</p>
                    <select
                      value={localSettings.cashTransferMode || "daily"}
                      onChange={(e) => setLocalSettings({ ...localSettings, cashTransferMode: e.target.value as "auto" | "manual" })}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white transition-all cursor-pointer"
                    >
                      <option value="daily">يدوي (ترحيل للمبيعات اليومية أولاً)</option>
                      <option value="auto">تلقائي (ترحيل للخزينة الرئيسية مباشرة)</option>
                    </select>
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">رمز PIN للمدير (لتجاوز الصلاحيات)</label>
                      <button
                        type="button"
                        onClick={handleStartPinVerification}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {isPinVerified ? "تم التحقق (يمكنك التعديل)" : "تحقق لتغيير الرمز / نسيت الرمز؟"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={isPinVerified ? "text" : "password"}
                        name="adminPin"
                        maxLength={4}
                        value={localSettings.adminPin}
                        onChange={handleChange}
                        disabled={!isPinVerified}
                        placeholder="****"
                        className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-center tracking-widest text-xl transition-all ${!isPinVerified ? "opacity-50 cursor-not-allowed" : ""}`}
                      />
                      {!isPinVerified && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Key className="w-5 h-5 text-zinc-400" />
                        </div>
                      )}
                    </div>
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
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                هل أنت متأكد من مسح جميع بيانات التطبيق من هذا الجهاز؟ سيتم إرجاعك لصفحة تسجيل الدخول.
              </p>

              <div className="mb-6">
                <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">للعملية التي لا رجعة فيها، اكتب "مسح" بالأسفل</p>
                <input
                  type="text"
                  placeholder="مسح"
                  value={resetConfirmationText}
                  onChange={(e) => setResetConfirmationText(e.target.value)}
                  className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/50 rounded-xl text-center focus:outline-none focus:border-red-500 text-red-600 dark:text-red-400 font-bold dark:placeholder-red-800 transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmationText("");
                  }}
                  className="flex-1 px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold transition-colors"
                >
                  تراجع
                </button>
                <button
                  onClick={confirmReset}
                  disabled={resetConfirmationText !== "مسح"}
                  className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/30"
                >
                  نعم، امسح كل شيء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN Verification Modal */}
      <AnimatePresence>
        {showPinVerifyModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 dark:border-zinc-800 p-8"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 text-center">تحقق من الهوية</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-center text-sm">
                لتغيير رمز PIN أو استعادته، يجب التحقق من ملكيتك للحساب عبر {pinVerifyMethod === "google" ? "Google" : pinVerifyMethod === "phone" ? "رقم الهاتف" : "البريد الإلكتروني"}.
              </p>

              {pinVerifyMethod === "email" && (
                <form onSubmit={handleVerifyForPin} className="space-y-4">
                  <input
                    type="password"
                    required
                    placeholder="كلمة مرور الحساب"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                  {verificationError && <p className="text-red-500 text-xs text-center">{verificationError}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPinVerifyModal(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold">إلغاء</button>
                    <button type="submit" disabled={isVerifying} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      {isVerifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "تحقق الآن"}
                    </button>
                  </div>
                </form>
              )}

              {pinVerifyMethod === "google" && (
                <div className="space-y-4">
                  <button onClick={() => handleVerifyForPin()} disabled={isVerifying} className="w-full py-3 bg-white dark:bg-zinc-900 border-2 border-indigo-500 text-indigo-600 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10">
                    {isVerifying ? <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /> : <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/component/google.svg" className="w-5 h-5" /> التحقق عبر Google</>}
                  </button>
                  <button onClick={() => setShowPinVerifyModal(false)} className="w-full py-2 text-zinc-500 text-sm">إلغاء</button>
                </div>
              )}

              {pinVerifyMethod === "phone" && (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">التحقق التلقائي عبر الهاتف مخصص حالياً لتسجيل الدخول. سيتم العمل عليه لاحقاً.</p>
                  <button onClick={() => setShowPinVerifyModal(false)} className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold">حسناً</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}
