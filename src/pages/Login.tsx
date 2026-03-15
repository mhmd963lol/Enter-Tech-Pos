import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { Eye, EyeOff, Mail, Lock, Phone, Check, ArrowRight, RefreshCw, LogIn, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CashierTechLogo from "../components/CashierTechLogo";
import { APP_VERSION } from "../version";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updatePassword,
  updateEmail,
  signOut,
  reload,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

// Removed SVG Logo to use the new professional PNG logo
// ─────────────────────────────────────────────
// Provider Icons
// ─────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ─────────────────────────────────────────────
// Stable ForgotPasswordPanel (defined OUTSIDE Login to prevent re-mount on every keystroke)
// ─────────────────────────────────────────────
function ForgotPasswordPanel({
  forgotEmail,
  setForgotEmail,
  loading,
  onSubmit,
  onBack,
}: {
  forgotEmail: string;
  setForgotEmail: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">

      {/* Back button */}
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 dark:text-zinc-500 hover:text-[#00E676] transition-colors mb-4">
        <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#00E676]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-[#00E676]" />
        </div>
        <h1 className="text-xl font-bold text-[#2C3A47] dark:text-white">استعادة كلمة المرور</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">أدخل بريدك الإلكتروني أو رقم هاتفك</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-[#2C3A47] dark:text-zinc-200 mb-2">البريد الإلكتروني / رقم الهاتف</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5" />
            <input type="text" inputMode="email" required placeholder="example@mail.com أو 05..." value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
          className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" /> إرسال</>}
        </motion.button>
        <button type="button" onClick={onBack} className="w-full text-center text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 mt-2">
          العودة لتسجيل الدخول
        </button>
      </form>
    </motion.div>
  );
}

export default function Login() {
  const { login, settings, updateSettings, playSound, deferredPrompt, setDeferredPrompt, addLog } = useAppContext();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCheckLoading, setVerificationCheckLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"number" | "otp" | "password">("number");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const recaptchaRef = useRef<any>(null);

  const getCleanPhone = (countryCode: string, phone: string) => {
    let rawPhone = phone.replace(/\s+/g, '');
    if (rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);
    return `${countryCode}${rawPhone}`;
  };

  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);
  const [googlePassword, setGooglePassword] = useState("");
  const [pendingPhoneUser, setPendingPhoneUser] = useState<any>(null);
  const [phonePassword, setPhonePassword] = useState("");

  const [loginData, setLoginData] = useState({ email: "", phone: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState<{
    name: string; email: string; phone: string; password: string; countryCode: string;
    userType: "manager" | "cashier"; ownerPhone: string;
  }>({ name: "", email: "", phone: "", password: "", countryCode: "+966", userType: "manager", ownerPhone: "" });
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const cooldownTimer = useRef<any>(null);

  useEffect(() => {
    if (otpCooldown > 0) {
      cooldownTimer.current = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    }
    return () => { if (cooldownTimer.current) clearInterval(cooldownTimer.current); };
  }, [otpCooldown]);

  // Handle Google Redirect result on mount
  useEffect(() => {
    setLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          // Only prompt for password if this is a BRAND NEW account (no Firestore doc yet)
          const hasPassword = result.user.providerData.some(p => p.providerId === 'password');
          const userDocRef = doc(db, "users", result.user.uid);
          const existingDoc = await getDoc(userDocRef);
          const isExistingEmployee = await (async () => {
            const snap = await getDocs(query(collection(db, "employee_access"), where("authUid", "==", result.user.uid)));
            return !snap.empty;
          })();

          if (!hasPassword && !existingDoc.exists() && !isExistingEmployee) {
            // New Google user - ask them to set a password
            setPendingGoogleUser(result.user);
            setLoading(false);
            return;
          }

          // Existing user - log them in directly
          await handleAuthResult(result.user);
          playSound("login_success");
          toast.success("تم تسجيل الدخول بـ Google بنجاح!");
        }
      })
      .catch((err) => {
        console.error("Google Auth Error:", err);
        if (err.code && err.code !== "auth/no-current-user") {
          playSound("error");
          if (err.code === "auth/unauthorized-domain") {
            toast.error("هذا النطاق غير مصرح به في Firebase. يرجى إضافته في الإعدادات.");
          } else {
            toast.error("خطأ في تسجيل الدخول بـ Google: " + (err.message || "حدث خطأ غير معروف"));
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const clearForms = () => {
    setLoginData({ email: "", phone: "", password: "", rememberMe: false });
    setRegisterData({ name: "", email: "", phone: "", password: "", countryCode: "+966", userType: "manager", ownerPhone: "" });
    setOtpCode("");
    setPendingGoogleUser(null);
    setGooglePassword("");
    setPhoneStep("number");
    setConfirmationResult(null);
    setShowForgotPassword(false);
    setForgotEmail("");
    setShowPassword(false);
    setAwaitingVerification(false);
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch { }
      recaptchaRef.current = null;
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    clearForms();
    setMode(newMode);
    setAuthMethod("email");
  };

  // ── Helpers ────────────────────────────────
  const requestCashierAccess = async (uid: string, name: string, email: string, phone: string, ownerPhone: string) => {
    let targetStoreId = ownerPhone;
    const queryOwner = query(collection(db, "phone_mappings"), where("__name__", "==", ownerPhone));
    const ownerSnap = await getDocs(queryOwner);
    if (!ownerSnap.empty) {
      targetStoreId = ownerSnap.docs[0].data().uid;
    } else {
      const queryOwnerUsers = query(collection(db, "users"), where("phone", "==", ownerPhone));
      const ownerUsersSnap = await getDocs(queryOwnerUsers);
      if (!ownerUsersSnap.empty) {
        targetStoreId = ownerUsersSnap.docs[0].id;
      }
    }

    await setDoc(doc(db, "pending_employees", uid), {
      authUid: uid,
      name,
      email,
      phone,
      targetStoreId,
      requestedOwnerPhone: ownerPhone,
      status: "pending",
      createdAt: new Date().toISOString()
    });
  };

  const syncNewUserToFirestore = async (uid: string, name: string, phone?: string, role: "admin" | "cashier" = "admin") => {
    const userEmail = registerData.email?.trim() || (phone ? `${phone.replace('+', '')}@cashier-tech.com` : "");
    await setDoc(doc(db, "users", uid), {
      settings: settings,
      profile: { name, role, pin: "", phone: phone || "" },
      email: userEmail,
      phone: phone || "",
      createdAt: new Date().toISOString(),
    });
    if (phone) {
      await setDoc(doc(db, "phone_mappings", phone), {
        uid,
        email: userEmail
      });
    }
  };



  const handleAuthResult = async (firebaseUser: any) => {
    let employeeAccessData = null;
    let accessDocId = null;

    // 1. Check if user is an approved employee
    const accessByAuthUid = query(collection(db, "employee_access"), where("authUid", "==", firebaseUser.uid));
    const accessSnap = await getDocs(accessByAuthUid);

    if (!accessSnap.empty) {
      employeeAccessData = accessSnap.docs[0].data();
      accessDocId = accessSnap.docs[0].id;
    } else {
      // Check if pre-invited by email/phone
      if (firebaseUser.email) {
        const accessByEmail = query(collection(db, "employee_access"), where("email", "==", firebaseUser.email));
        const emailSnap = await getDocs(accessByEmail);
        if (!emailSnap.empty) {
          employeeAccessData = emailSnap.docs[0].data();
          accessDocId = emailSnap.docs[0].id;
        }
      }
      if (!employeeAccessData && firebaseUser.phoneNumber) {
        const accessByPhone = query(collection(db, "employee_access"), where("phone", "==", firebaseUser.phoneNumber));
        const phoneSnap = await getDocs(accessByPhone);
        if (!phoneSnap.empty) {
          employeeAccessData = phoneSnap.docs[0].data();
          accessDocId = phoneSnap.docs[0].id;
        }
      }
    }

    if (employeeAccessData) {
      if (accessDocId && !employeeAccessData.authUid) {
        // Link them for future usage
        await setDoc(doc(db, "employee_access", accessDocId), { authUid: firebaseUser.uid }, { merge: true });
      }
      const displayName = firebaseUser.displayName || employeeAccessData.name || "موظف";
      login({
        id: employeeAccessData.storeId,
        authUid: firebaseUser.uid,
        name: displayName,
        role: employeeAccessData.role || "cashier",
        permissions: employeeAccessData.permissions,
      });

      // We cannot easily execute addLog inside Login since AppContext's store state hasn't synced to this storeId yet.
      // But we will write the specific DB entry.
      try {
        const logId = `LOG-${crypto.randomUUID().slice(0,8)}`;
        await setDoc(doc(db, `users/${employeeAccessData.storeId}/logs`, logId), {
           id: logId,
           action: "تسجيل دخول النظام",
           details: `تسجيل دخول الكاشير: ${displayName}`,
           type: "security",
           date: new Date().toISOString(),
           userId: firebaseUser.uid,
           userName: displayName
        });
      } catch(e) {}
      return;
    }

    // 2. Check if they are Pending
    const pendingDoc = await getDoc(doc(db, "pending_employees", firebaseUser.uid));
    if (pendingDoc.exists()) {
      toast.error("حسابك قيد المراجعة من مدير النظام. يرجى الانتظار لحين الموافقة.", { duration: 6000 });
      await signOut(auth);
      return;
    }

    // 3. User is a Store Owner (Manager)
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    let displayName = firebaseUser.displayName || "مدير النظام";

    if (!userDoc.exists()) {
      // It's a new account
      if (registerData.userType === "cashier") {
        // Just created account as cashier now, send to pending
        const cleanPhone = registerData.countryCode + registerData.phone;
        await requestCashierAccess(firebaseUser.uid, registerData.name || displayName, firebaseUser.email || registerData.email, cleanPhone, registerData.ownerPhone);
        toast.success("تم إرسال طلب الانضمام. يرجى انتظار موافقة المدير.", { duration: 6000 });
        await signOut(auth);
        return;
      } else {
        // Create new store as Manager
        await syncNewUserToFirestore(firebaseUser.uid, displayName, firebaseUser.phoneNumber || undefined, "admin");
      }
    } else {
      const data = userDoc.data();
      if (data.settings) updateSettings(data.settings);
      if (data.profile?.name) displayName = data.profile.name;
    }

    // Log the Manager in
    login({ id: firebaseUser.uid, authUid: firebaseUser.uid, name: displayName, role: "admin" });
    
    try {
      const logId = `LOG-${crypto.randomUUID().slice(0,8)}`;
      await setDoc(doc(db, `users/${firebaseUser.uid}/logs`, logId), {
          id: logId,
          action: "تسجيل دخول النظام",
          details: `تسجيل دخول المدير: ${displayName}`,
          type: "security",
          date: new Date().toISOString(),
          userId: firebaseUser.uid,
          userName: displayName
      });
    } catch(e) {}
  };

  // ── Google ──────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // Result is handled in useEffect above after redirect
    } catch (err: any) {
      toast.error("حدث خطأ أثناء تسجيل الدخول بـ Google");
      setLoading(false);
    }
  };

  // ── Email Login ─────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      // Only block on unverified email for pure email/password accounts (Google-linked accounts bypass this)
      const hasGoogleProvider = cred.user.providerData.some(p => p.providerId === 'google.com');
      if (!cred.user.emailVerified && !hasGoogleProvider) {
        playSound("error");
        toast.error("يجب تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.");
        await sendEmailVerification(cred.user);
        setLoading(false);
        return;
      }
      await handleAuthResult(cred.user);
      playSound("login_success");
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (err: any) {
      playSound("error");
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        toast.error("حدث خطأ. تأكد من بياناتك وأعد المحاولة.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email Register ──────────────────────────
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      await updateProfile(cred.user, { displayName: registerData.name });

      // Handle cashier registration: send access request instead of creating store doc
      if (registerData.userType === "cashier") {
        await requestCashierAccess(
          cred.user.uid,
          registerData.name,
          registerData.email,
          "",
          registerData.ownerPhone
        );
        await sendEmailVerification(cred.user);
        toast.success("تم إنشاء الحساب وإرسال طلب الانضمام. يرجى تأكيد بريدك وانتظار موافقة المدير.", { duration: 6000 });
        await signOut(auth);
        switchMode("login");
        return;
      }

      // Manager registration: create store document
      await syncNewUserToFirestore(cred.user.uid, registerData.name);
      await sendEmailVerification(cred.user);
      setAwaitingVerification(true);
      toast.success("تم إرسال رابط التحقق إلى بريدك الإلكتروني!");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("لديك حساب بالفعل، الرجاء تسجيل الدخول.");
        setMode("login");
      } else if (err.code === "auth/weak-password") {
        toast.error("كلمة المرور ضعيفة جداً (6 أحرف على الأقل)");
      } else {
        toast.error(err.message || "حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setVerificationCheckLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await reload(currentUser);
      if (currentUser.emailVerified) {
        await handleAuthResult(currentUser);
        playSound("login_success");
        toast.success("تم التحقق بنجاح! مرحباً بك.");
      } else {
        playSound("error");
        toast.error("لم يتم التحقق بعد. تحقق من بريدك وأعد المحاولة.");
      }
    } catch {
      toast.error("حدث خطأ، أعد المحاولة.");
    } finally {
      setVerificationCheckLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        toast.success("تم إعادة إرسال رابط التحقق!");
      }
    } catch {
      toast.error("حدث خطأ أثناء إعادة الإرسال");
    }
  };

  // ── Phone ───────────────────────────────────
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => { },
      });
    }
    return recaptchaRef.current;
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCooldown > 0) {
      toast.error(`يرجى الانتظار ${otpCooldown} ثانية قبل إعادة المحاولة`);
      return;
    }

    setLoading(true);

    const rawInputPhone = mode === "login" ? loginData.phone : registerData.phone;
    const phoneNum = getCleanPhone(registerData.countryCode, rawInputPhone);

    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phoneNum, appVerifier);
      setConfirmationResult(result);
      setPhoneStep("otp");
      setOtpCooldown(60); // 60 seconds rate limiting
      toast.success("تم إرسال رمز التحقق عبر الرسائل القصيرة");
    } catch (err: any) {
      console.error("SMS Error:", err);
      let errorMsg = "حدث خطأ في إرسال الرمز";
      if (err.code === "auth/invalid-phone-number") errorMsg = "رقم الهاتف غير صالح";
      if (err.code === "auth/too-many-requests") errorMsg = "تم إرسال طلبات كثيرة جداً. حاول لاحقاً.";
      if (err.code === "auth/captcha-check-failed") errorMsg = "فشل التحقق من الكابتشا";

      toast.error(errorMsg);
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear(); } catch { }
        recaptchaRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const phoneNum = getCleanPhone(registerData.countryCode, loginData.phone);

    try {
      // Find the associated email for this phone directly from the mappings document
      const docRef = doc(db, "phone_mappings", phoneNum);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast.error("لا يوجد حساب مرتبط بهذا الرقم. يرجى التأكد من الرقم أو الدخول عبر OTP.");
        setLoading(false);
        return;
      }
      
      const mapping = docSnap.data();
      const cred = await signInWithEmailAndPassword(auth, mapping.email, loginData.password);
      await handleAuthResult(cred.user);

      playSound("login_success");
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (err: any) {
      console.error("Phone Password Login Error:", err);
      playSound("error");
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        toast.error("كلمة المرور غير صحيحة أو البيانات غير متطابقة");
      } else {
        toast.error("حدث خطأ أثناء تسجيل الدخول. تأكد من بياناتك.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    try {
      const cred = await confirmationResult.confirm(otpCode);
      
      const userDocRef = doc(db, "users", cred.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        if (mode === "register") {
          const phoneNum = getCleanPhone(registerData.countryCode, registerData.phone);
          await updateProfile(cred.user, { displayName: registerData.name });
          await syncNewUserToFirestore(cred.user.uid, registerData.name, phoneNum);
          // Ask them to set a password so they can log in without OTP in the future
          setPendingPhoneUser(cred.user);
          toast.success("تم إنشاء الحساب! يرجى إنشاء كلمة مرور لتسجيل دخولك بسهولة في المرة القادمة.", { duration: 5000 });
          setLoading(false);
          return;
        } else {
          // If login via phone and first time (no profile), create a basic one so app doesn't crash
          const phoneNum = getCleanPhone(registerData.countryCode, loginData.phone);
          await syncNewUserToFirestore(cred.user.uid, "Customer", phoneNum);
        }
      }

      await handleAuthResult(cred.user);
      playSound("login_success");
      toast.success("تم التحقق وتسجيل الدخول بنجاح!");
    } catch {
      playSound("error");
      toast.error("رمز التحقق غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error("أدخل بريدك الإلكتروني أو رقم الهاتف"); return; }
    setLoading(true);
    try {
      // If user typed a phone number, tell them to use OTP
      if (!forgotEmail.includes('@') && /[0-9]/.test(forgotEmail)) {
        toast("لإعادة تعيين كلمة مرور رقم الهاتف، يرجى تسجيل الدخول عبر (تأكيد عبر SMS) ثم تغيير كلمة المرور من الإعدادات.", { icon: '📱', duration: 6000 });
        setShowForgotPassword(false);
        setMode("login");
        setAuthMethod("phone");
        setPhoneStep("number");
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, forgotEmail);
      playSound("success");
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (err: any) {
      playSound("error");
      if (err.code === "auth/user-not-found") {
        toast.error("لا يوجد حساب مسجّل بهذا البريد.");
      } else {
        toast.error("تعذّر إرسال رابط الاستعادة. تحقق من البريد وأعد المحاولة.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER: Awaiting Email Verification Screen
  // ─────────────────────────────────────────────
  if (awaitingVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4 transition-colors duration-300" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-10 text-center">

          {/* Back button */}
          <button onClick={() => switchMode("login")} className="flex items-center gap-1 text-sm text-gray-400 dark:text-zinc-500 hover:text-[#00E676] transition-colors mb-6">
            <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
          </button>

          <div className="w-20 h-20 bg-[#00E676]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-[#00E676]" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-3">تحقق من بريدك الإلكتروني</h1>
          <p className="text-gray-500 dark:text-zinc-400 mb-2">أرسلنا رابط التحقق إلى:</p>
          <p className="font-bold text-zinc-800 dark:text-white mb-6 dir-ltr">{registerData.email}</p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-8">افتح الرابط من بريدك ثم اضغط الزر أدناه للمتابعة</p>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckVerification} disabled={verificationCheckLoading}
            className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] py-3.5 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 mb-4 disabled:opacity-70">
            {verificationCheckLoading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> لقد تحققت، ادخل الآن</>}
          </motion.button>

          <button onClick={handleResendVerification} className="text-sm text-[#00E676] hover:underline flex items-center gap-1 mx-auto">
            <RefreshCw className="w-4 h-4" /> إعادة إرسال رابط التحقق
          </button>
        </motion.div>
      </div>
    );
  }

  // ForgotPasswordPanel is now a stable component (see below) to prevent re-mount on keystroke

  // ─────────────────────────────────────────────
  // RENDER: Main Page
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] dark:from-zinc-950 dark:to-zinc-900 flex flex-col items-center justify-center p-4 transition-colors duration-300" dir="rtl">
      <header className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
        {/* Controls: Theme & Install App */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {deferredPrompt && (
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-2 px-4 py-2 bg-[#00E676]/10 text-[#00C853] hover:bg-[#00E676]/20 transition-colors rounded-full font-bold shadow-sm"
              title="تثبيت التطبيق على جهازك"
            >
              <ArrowRight className="w-4 h-4" />
              تثبيت التطبيق
            </button>
          )}
          <button
            onClick={() => updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
            className="p-3 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-sm transition-all rounded-full text-indigo-900 dark:text-white shadow-sm"
            title={settings.theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {settings.theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>
      {/* Invisible recaptcha anchor */}
      <div id="recaptcha-container"></div>

      {/* Logo / Header */}
      <div className="flex flex-col items-center mb-8">
        <CashierTechLogo className="w-28 h-28 md:w-36 md:h-36" textClassName="text-3xl md:text-5xl" />
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Forgot Password ─── */}
        {showForgotPassword && (
          <ForgotPasswordPanel
            forgotEmail={forgotEmail}
            setForgotEmail={setForgotEmail}
            loading={loading}
            onSubmit={handleForgotPassword}
            onBack={() => setShowForgotPassword(false)}
          />
        )}

        {/* ─── Set Google Password ─── */}
        {pendingGoogleUser && (
          <motion.div key="googlePassword" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">
            <h2 className="text-xl font-bold text-[#2C3A47] dark:text-white text-center mb-6">إنشاء كلمة مرور للحساب</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-center mb-6 text-sm leading-relaxed">
              لقد سجلت الدخول باستخدام Google لأول مرة. يرجى إنشاء كلمة مرور لتتمكن من تسجيل الدخول يدوياً في المستقبل.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await updatePassword(pendingGoogleUser, googlePassword);
                await handleAuthResult(pendingGoogleUser);
                playSound("login_success");
                toast.success("تم تحديد كلمة المرور وتسجيل الدخول بنجاح!");
                setPendingGoogleUser(null);
                setGooglePassword("");
              } catch (err: any) {
                if (err.code === "auth/requires-recent-login") {
                   toast.error("يرجى الضغط على زر تخطي أو تسجيل الدخول مرة أخرى.");
                } else {
                   toast.error("حدث خطأ أثناء حفظ كلمة المرور: " + (err.message || ""));
                }
              } finally {
                setLoading(false);
              }
            }} className="space-y-4">
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5 pointer-events-none" />
                <input type={showPassword ? "text" : "password"} required placeholder="كلمة المرور الجديدة" minLength={6} value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || googlePassword.length < 6}
                className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> حفظ ومتابعة</>}
              </motion.button>
              <button type="button" onClick={() => {
                handleAuthResult(pendingGoogleUser).then(() => {
                  playSound("login_success");
                  toast.success("تم تسجيل الدخول بـ Google بنجاح!");
                  setPendingGoogleUser(null);
                  setGooglePassword("");
                });
              }} className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 mt-4 transition-colors">
                تخطي في الوقت الحالي
              </button>
            </form>
          </motion.div>
        )}

        {/* ─── Set Phone Password ─── */}
        {pendingPhoneUser && (
          <motion.div key="phonePassword" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#00E676]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[#00E676]" />
              </div>
              <h2 className="text-xl font-bold text-[#2C3A47] dark:text-white">إنشاء كلمة مرور</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-2 leading-relaxed">
                تم التحقق من رقمك بنجاح! أنشئ كلمة مرور لتسجيل الدخول بدون SMS في المرة القادمة.
              </p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                // To allow signInWithEmailAndPassword later, we must associate an email
                // with this phone-based auth account and then set the password.
                const phoneNum = pendingPhoneUser.phoneNumber || "";
                const phoneEmail = `${phoneNum.replace('+', '')}@cashier-tech.com`;
                
                // Use the email stored in phone_mappings if available
                const mappingSnap = await getDoc(doc(db, "phone_mappings", phoneNum));
                let linkEmail = mappingSnap.exists() ? mappingSnap.data().email : phoneEmail;
                
                // Fix leading '+' in email if it was generated by older buggy code
                if (linkEmail.startsWith('+')) {
                  linkEmail = linkEmail.replace('+', '');
                  if (mappingSnap.exists()) {
                    try {
                      await setDoc(doc(db, "phone_mappings", phoneNum), { uid: mappingSnap.data().uid, email: linkEmail }, { merge: true });
                      await setDoc(doc(db, "users", mappingSnap.data().uid), { email: linkEmail }, { merge: true });
                    } catch (e) {
                      console.warn("Failed to patch old email format:", e);
                    }
                  }
                }
                
                // 1. Set the email on the Auth user
                await updateEmail(pendingPhoneUser, linkEmail);
                // 2. Set the password
                await updatePassword(pendingPhoneUser, phonePassword);
                
                await handleAuthResult(pendingPhoneUser);
                playSound("login_success");
                toast.success("تم تعيين كلمة المرور وتسجيل الدخول بنجاح!");
                setPendingPhoneUser(null);
                setPhonePassword("");
              } catch (err: any) {
                if (err.code === "auth/requires-recent-login") {
                  toast.error("يرجى الضغط على زر تخطي أو تسجيل الدخول مرة أخرى.");
                } else if (err.code === "auth/email-already-in-use") {
                  // Email is already used by another account, just skip the email update and login
                  await handleAuthResult(pendingPhoneUser);
                  setPendingPhoneUser(null);
                  setPhonePassword("");
                } else {
                  console.error("Set password error:", err);
                  toast.error("حدث خطأ أثناء حفظ كلمة المرور: " + (err.message || ""));
                }
              } finally {
                setLoading(false);
              }
            }} className="space-y-4">
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5 pointer-events-none" />
                <input type={showPassword ? "text" : "password"} required placeholder="كلمة مرور جديدة (6 أحرف على الأقل)" minLength={6} value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || phonePassword.length < 6}
                className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> حفظ ومتابعة</>}
              </motion.button>
              <button type="button" onClick={() => {
                handleAuthResult(pendingPhoneUser).then(() => {
                  playSound("login_success");
                  toast.success("مرحباً! يمكنك إعداد كلمة المرور لاحقاً من الإعدادات.");
                  setPendingPhoneUser(null);
                  setPhonePassword("");
                });
              }} className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 mt-4 transition-colors">
                تخطي في الوقت الحالي
              </button>
            </form>
          </motion.div>
        )}

        {/* ─── LOGIN ─── */}
        {!showForgotPassword && mode === "login" && !pendingGoogleUser && !pendingPhoneUser && (
          <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">

            <h2 className="text-xl font-bold text-[#2C3A47] dark:text-white text-center mb-6">تسجيل الدخول</h2>

            {/* Google */}
            <button type="button" onClick={handleGoogleLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-3 rounded-xl transition-colors font-medium text-gray-700 mb-4 disabled:opacity-60">
              <GoogleIcon /> تسجيل الدخول بـ Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center my-5">
              <div className="flex-grow border-t border-gray-200 dark:border-zinc-700" />
              <span className="mx-4 text-gray-400 dark:text-zinc-500 text-sm bg-white dark:bg-zinc-900 px-2 rounded-full border border-gray-200 dark:border-zinc-700">أو</span>
              <div className="flex-grow border-t border-gray-200 dark:border-zinc-700" />
            </div>

            {/* Method Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 mb-5">
              <button type="button" onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${authMethod === "email" ? "bg-[#00E676] text-[#2C3A47] dark:text-white" : "bg-white text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:bg-zinc-800"}`}>
                <Mail className="w-4 h-4" /> البريد الإلكتروني
              </button>
              <button type="button" onClick={() => { setAuthMethod("phone"); setPhoneStep("number"); }}
                className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${authMethod === "phone" ? "bg-[#00E676] text-[#2C3A47] dark:text-white" : "bg-white text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:bg-zinc-800"}`}>
                <Phone className="w-4 h-4" /> رقم الهاتف
              </button>
            </div>

            {/* Email Login Form */}
            {authMethod === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5 pointer-events-none" />
                  <input type="email" required placeholder="example@mail.com" value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5 pointer-events-none" />
                  <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pr-10 pl-10 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-[#2C3A47] dark:text-white hover:text-[#00E676] font-semibold hover:underline">نسيت كلمة المرور؟</button>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 font-semibold">
                    <input type="checkbox" checked={loginData.rememberMe} onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })} className="w-4 h-4 accent-[#00E676]" />
                    تذكرني
                  </label>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                  className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> تسجيل الدخول</>}
                </motion.button>
              </form>
            )}

            {/* Phone Login Form */}
            {authMethod === "phone" && (
              <>
                {phoneStep === "number" && (
                  /* Step 1: Enter phone number → choose password or OTP */
                  <div className="space-y-4">
                    <div className="flex border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl overflow-hidden focus-within:border-[#00E676] transition-colors" dir="ltr">
                      <select value={registerData.countryCode} onChange={(e) => setRegisterData({ ...registerData, countryCode: e.target.value })}
                        className="bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-white px-3 py-3 text-sm font-bold outline-none border-r border-gray-300" dir="ltr">
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input type="tel" required placeholder="5XXXXXXXX" value={loginData.phone}
                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                        className="flex-1 pl-4 pr-3 py-3 font-bold text-gray-700 dark:text-white outline-none text-left" dir="ltr" />
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} type="button" disabled={loading || !loginData.phone.trim()}
                      onClick={() => setPhoneStep("password")}
                      className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                      <LogIn className="w-5 h-5" /> دخول بكلمة المرور
                    </motion.button>
                    <form onSubmit={handleSendOtp}>
                      <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || otpCooldown > 0 || !loginData.phone.trim()}
                        className="w-full bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 py-3 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                        {loading ? <div className="w-5 h-5 border-2 border-gray-400/40 border-t-gray-600 rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" /> {otpCooldown > 0 ? `إعادة الإرسال بعد (${otpCooldown}ث)` : "أو دخول عبر رمز التحقق (OTP)"}</>}
                      </motion.button>
                    </form>
                  </div>
                )}

                {phoneStep === "password" && (
                  /* Step 2a: Password login */
                  <form onSubmit={handlePhonePasswordLogin} className="space-y-4">
                    <div className="flex border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl overflow-hidden focus-within:border-[#00E676] transition-colors" dir="ltr">
                      <select value={registerData.countryCode} onChange={(e) => setRegisterData({ ...registerData, countryCode: e.target.value })}
                        className="bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-white px-3 py-3 text-sm font-bold outline-none border-r border-gray-300" dir="ltr">
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input type="tel" required placeholder="5XXXXXXXX" value={loginData.phone}
                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                        className="flex-1 pl-4 pr-3 py-3 font-bold text-gray-700 dark:text-white outline-none text-left" dir="ltr" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5 pointer-events-none" />
                      <input type={showPassword ? "text" : "password"} required placeholder="كلمة المرور" value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pr-10 pl-10 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                      className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                      {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> دخول بكلمة المرور</>}
                    </motion.button>
                    <div className="flex items-center justify-between text-sm font-bold mt-1">
                      <button type="button" onClick={() => setPhoneStep("number")} className="text-gray-400 dark:text-zinc-500 hover:text-[#00E676] transition-colors">العودة</button>
                      <button type="button" onClick={async () => {
                        setPhoneStep("number");
                        toast("أرسل رمز OTP لإعادة تعيين كلمة المرور", { icon: '📱' });
                      }} className="text-[#00E676] hover:underline">نسيت كلمة المرور؟‏</button>
                    </div>
                  </form>
                )}

                {phoneStep === "otp" && (
                  /* Step 2b: OTP verification (after SMS sent) */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-zinc-400 font-bold text-center">أدخل رمز التحقق المرسل إلى هاتفك</p>
                    <input type="text" required placeholder="_ _ _ _ _ _" maxLength={6} value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-center text-2xl tracking-[0.5em] font-bold" dir="ltr" />
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || !otpCode.trim()}
                      className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                      {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> تأكيد الرمز</>}
                    </motion.button>
                    <button type="button" onClick={() => { setPhoneStep("number"); setOtpCode(""); }} className="w-full text-center text-sm font-bold text-gray-400 dark:text-zinc-500 hover:text-[#00E676] transition-colors">تغيير رقم الهاتف</button>
                  </form>
                )}
              </>
            )}

            <p className="text-center text-sm font-bold text-gray-500 dark:text-zinc-400 mt-6">
              ليس لديك حساب؟{" "}
              <button onClick={() => switchMode("register")} className="text-[#2C3A47] dark:text-white hover:text-[#00E676] font-bold hover:underline">سجل الآن</button>
            </p>
          </motion.div>
        )}

        {/* ─── REGISTER ─── */}
        {!showForgotPassword && mode === "register" && !pendingGoogleUser && (
          <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">

            {/* Back button */}
            <button onClick={() => switchMode("login")} className="flex items-center gap-1 text-sm text-gray-400 dark:text-zinc-500 hover:text-[#00E676] transition-colors mb-4">
              <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
            </button>

            <h2 className="text-xl font-bold text-[#2C3A47] dark:text-white text-center mb-2">إنشاء حساب جديد</h2>
            <p className="text-gray-400 dark:text-zinc-500 font-bold text-sm text-center mb-6">اختر طريقة التسجيل</p>

            {/* Method Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button type="button" onClick={handleGoogleLogin} disabled={loading}
                className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 border border-gray-200 dark:border-zinc-700 py-4 rounded-xl transition-colors disabled:opacity-60">
                <GoogleIcon />
                <span className="text-xs text-gray-600 font-bold">Google</span>
              </button>
              <button type="button" onClick={() => setAuthMethod("email")}
                className={`flex flex-col items-center gap-2 border py-4 rounded-xl transition-colors ${authMethod === "email" ? "bg-[#00E676]/10 border-[#00E676]" : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"}`}>
                <Mail className={`w-5 h-5 ${authMethod === "email" ? "text-[#00C853]" : "text-gray-500 dark:text-zinc-400"}`} />
                <span className="text-xs font-bold text-gray-600">البريد</span>
              </button>
              <button type="button" onClick={() => { setAuthMethod("phone"); setPhoneStep("number"); }}
                className={`flex flex-col items-center gap-2 border py-4 rounded-xl transition-colors ${authMethod === "phone" ? "bg-[#00E676]/10 border-[#00E676]" : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"}`}>
                <Phone className={`w-5 h-5 ${authMethod === "phone" ? "text-[#00C853]" : "text-gray-500 dark:text-zinc-400"}`} />
                <span className="text-xs font-bold text-gray-600">الهاتف</span>
              </button>
            </div>

            {/* Email Register */}
            {authMethod === "email" && (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                
                {/* Manager / Cashier Toggle */}
                <div className="flex bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl">
                  <button type="button" onClick={() => setRegisterData({ ...registerData, userType: "manager" })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${registerData.userType === "manager" ? "bg-white dark:bg-zinc-700 shadow-sm text-[#2C3A47] dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
                    مدير نشاط
                  </button>
                  <button type="button" onClick={() => setRegisterData({ ...registerData, userType: "cashier" })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${registerData.userType === "cashier" ? "bg-white dark:bg-zinc-700 shadow-sm text-[#2C3A47] dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
                    موظف / كاشير
                  </button>
                </div>

                {registerData.userType === "cashier" && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-2">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-2">طلب انضمام لنشاط قائم</p>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/70 w-5 h-5 pointer-events-none" />
                      <input type="text" required placeholder="رقم الموبايل الخاص بالمدير" value={registerData.ownerPhone}
                        onChange={(e) => setRegisterData({ ...registerData, ownerPhone: e.target.value })}
                        className="w-full pr-10 pl-4 py-3 border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-amber-500 text-gray-700 dark:text-white font-bold text-left" dir="ltr" />
                    </div>
                  </div>
                )}

                <input type="text" required placeholder="الاسم الكامل" value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white font-bold" />
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5" />
                  <input type="email" required placeholder="example@mail.com" value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 w-5 h-5" />
                  <input type={showPassword ? "text" : "password"} required placeholder="كلمة المرور (6 أحرف على الأقل)" value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pr-10 pl-10 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white text-left" dir="ltr" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                  className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                  {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> إنشاء الحساب</>}
                </motion.button>
              </form>
            )}

            {/* Phone Register */}
            {authMethod === "phone" && (
              <>
                {phoneStep === "number" ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {/* Manager / Cashier Toggle */}
                    <div className="flex bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl">
                      <button type="button" onClick={() => setRegisterData({ ...registerData, userType: "manager" })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${registerData.userType === "manager" ? "bg-white dark:bg-zinc-700 shadow-sm text-[#2C3A47] dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
                        مدير نشاط
                      </button>
                      <button type="button" onClick={() => setRegisterData({ ...registerData, userType: "cashier" })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${registerData.userType === "cashier" ? "bg-white dark:bg-zinc-700 shadow-sm text-[#2C3A47] dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
                        موظف / كاشير
                      </button>
                    </div>

                    {registerData.userType === "cashier" && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-2 mb-2">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-2">طلب انضمام لنشاط قائم</p>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/70 w-5 h-5 pointer-events-none" />
                          <input type="text" required placeholder="رقم الموبايل الخاص بالمدير" value={registerData.ownerPhone}
                            onChange={(e) => setRegisterData({ ...registerData, ownerPhone: e.target.value })}
                            className="w-full pr-10 pl-4 py-3 border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-amber-500 text-gray-700 dark:text-white font-bold text-left" dir="ltr" />
                        </div>
                      </div>
                    )}

                    <input type="text" required placeholder="الاسم الكامل" value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-gray-700 dark:text-white font-bold" />
                    <div className="flex border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl overflow-hidden focus-within:border-[#00E676] transition-colors" dir="ltr">
                      <select value={registerData.countryCode} onChange={(e) => setRegisterData({ ...registerData, countryCode: e.target.value })}
                        className="bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-white px-3 py-3 text-sm font-bold outline-none border-r border-gray-300" dir="ltr">
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input type="tel" required placeholder="5XXXXXXXX" value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="flex-1 pl-4 pr-3 py-3 font-bold text-gray-700 dark:text-white outline-none text-left" dir="ltr" />
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                      className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                      {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" /> إرسال رمز التحقق</>}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-zinc-400 font-bold text-center">أدخل رمز التحقق المرسل إلى هاتفك</p>
                    <input type="text" required placeholder="_ _ _ _ _ _" maxLength={6} value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/50 rounded-xl focus:outline-none focus:border-[#00E676] text-center text-2xl tracking-[0.5em] font-bold" dir="ltr" />
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                      className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#2C3A47] dark:text-white py-3.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                      {loading ? <div className="w-5 h-5 border-2 border-[#2C3A47]/40 border-t-[#2C3A47] rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> تأكيد الرمز وإنشاء الحساب</>}
                    </motion.button>
                    <button type="button" onClick={() => setPhoneStep("number")} className="w-full text-center text-sm font-bold text-gray-400 dark:text-zinc-500 hover:text-[#2C3A47] dark:text-white">تغيير رقم الهاتف</button>
                  </form>
                )}
              </>
            )}

            <p className="text-center text-sm font-bold text-gray-500 dark:text-zinc-400 mt-6">
              لديك حساب بالفعل؟{" "}
              <button onClick={() => switchMode("login")} className="text-[#2C3A47] dark:text-white hover:text-[#00E676] font-bold hover:underline">سجل الدخول</button>
            </p>
            <p className="text-center text-xs font-bold text-gray-400 dark:text-zinc-500 mt-3">
              بالتسجيل أنت توافق على <a href="/terms" className="text-[#00C853] hover:underline">الشروط والأحكام</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version display */}
      <div className="absolute bottom-6 right-6 text-gray-400 dark:text-zinc-600 text-xs font-bold bg-white/50 dark:bg-zinc-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-100 dark:border-zinc-800">
        {APP_VERSION}
      </div>
    </div>
  );
}
