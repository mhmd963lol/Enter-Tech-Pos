import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { User, Shield, Key, Save, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

export default function AccountSettings() {
  const { user, dbInfo } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      toast.success("تم تحديث البيانات بنجاح");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setTimeout(() => setShowSuccess(false), 2000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          إعدادات الحساب
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          إدارة ملفك الشخصي وبيانات الدخول.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
              <User className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {user?.name}
            </h3>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Shield className="w-4 h-4" />
              {user?.role === "admin" ? "مدير نظام" : "كاشير"}
            </span>

            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                نوع قاعدة البيانات:
              </p>
              <p
                className="font-medium text-zinc-900 dark:text-white text-sm"
                dir="ltr"
              >
                {dbInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  المعلومات الشخصية
                </h3>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                  <Key className="w-5 h-5 text-zinc-400" />
                  تغيير كلمة المرور
                </h3>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-colors shadow-sm ${
                    showSuccess
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
                        حفظ التعديلات
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
