import React from "react";
import { Mail, Bell } from "lucide-react";

export default function Inbox() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          صندوق الوارد والتنبيهات
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          إشعارات النظام ورسائل الفريق.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-12 flex flex-col items-center justify-center text-center">
        <Mail className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          لا توجد رسائل جديدة
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
          صندوق الوارد الخاص بك فارغ حالياً. ستظهر هنا أي تنبيهات تخص نواقص
          المخزون أو رسائل من الإدارة.
        </p>
      </div>
    </div>
  );
}
