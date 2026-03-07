import React from "react";
import { useLocation } from "react-router-dom";
import { ShieldAlert, FileText, HeadphonesIcon } from "lucide-react";

export default function StaticPages() {
  const location = useLocation();
  const path = location.pathname;

  const getContent = () => {
    switch (path) {
      case "/support":
        return {
          title: "مركز المساعدة والدعم الفني",
          icon: <HeadphonesIcon className="w-8 h-8 text-indigo-600" />,
          content: (
            <div className="space-y-4">
              <p>
                نحن هنا لمساعدتك! إذا واجهت أي مشاكل أو كان لديك استفسارات حول
                النظام، يرجى التواصل معنا عبر القنوات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>البريد الإلكتروني: support@cashier-tech.com</li>
                <li>الهاتف: +966 50 000 0000</li>
                <li>ساعات العمل: 24/7 للمشتركين</li>
              </ul>
              <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <p className="font-bold">ملاحظة مستخدم Pro:</p>
                <p className="text-sm mt-1">
                  المشتركون في الباقة المتقدمة يحصلون على دعم فني على مدار
                  الساعة طوال أيام الأسبوع.
                </p>
              </div>
            </div>
          ),
        };
      case "/terms":
        return {
          title: "شروط الاستخدام",
          icon: <FileText className="w-8 h-8 text-indigo-600" />,
          content: (
            <div className="space-y-4 text-justify">
              <p>
                مرحباً بك في نظام كاشير تك (Cashier Tech). باستخدامك لهذا النظام، فإنك توافق
                على الشروط التالية:
              </p>
              <ol className="list-decimal list-inside space-y-4 text-zinc-600 dark:text-zinc-400 mt-4">
                <li>
                  الاستخدام المقبول: يُمنع استخدام النظام لأي أغراض غير قانونية
                  أو غير مصرح بها.
                </li>
                <li>
                  حماية البيانات: أنت مسؤول عن تخصيص الصلاحيات المناسبة لموظفيك
                  وحماية كلمات المرور.
                </li>
                <li>
                  التحديثات: نحتفظ بالحق في تحديث أو تعديل النظام في أي وقت
                  لتحسين الأداء والأمان.
                </li>
                <li>
                  النسخ الاحتياطي: يوصى بعمل نسخة احتياطية دورية لقاعدة البيانات
                  المحلية الخاصة بك (إذا كنت تستخدم نسخة الأوفلاين).
                </li>
              </ol>
            </div>
          ),
        };
      case "/privacy":
        return {
          title: "سياسة الخصوصية",
          icon: <ShieldAlert className="w-8 h-8 text-indigo-600" />,
          content: (
            <div className="space-y-4 text-justify">
              <p>
                نحن نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيف نتعامل مع
                بياناتك:
              </p>
              <ul className="list-disc list-inside space-y-4 text-zinc-600 dark:text-zinc-400 mt-4">
                <li>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    تخزين البيانات:
                  </span>{" "}
                  في هذه النسخة، يتم تخزين جميع بيانات العملاء، المنتجات،
                  والمبيعات محلياً على جهازك أو على الخادم المحلي الخاص بك ولن
                  يتم نقلها لأطراف خارجية دون موافقتك الصريحة.
                </li>
                <li>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    الوصول للبيانات:
                  </span>{" "}
                  يقتصر الوصول للمعلومات الحساسة على الإداريين فقط حسب الصلاحيات
                  المعطاة.
                </li>
                <li>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    الكوكيز (Cookies):
                  </span>{" "}
                  نستخدم ملفات تعريف الارتباط الأساسية فقط لتشغيل النظام (مثل
                  تذكر جلسة تسجيل الدخول).
                </li>
              </ul>
            </div>
          ),
        };
      default:
        return {
          title: "صفحة غير موجودة",
          icon: <FileText className="w-8 h-8 text-zinc-600" />,
          content: <p>عذراً، المحتوى الذي تبحث عنه غير متوفر.</p>,
        };
    }
  };

  const pageData = getContent();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-4">
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 transition-colors bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            العودة للرئيسية
          </button>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
              {pageData.icon}
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {pageData.title}
            </h1>
          </div>
          <div className="p-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {pageData.content}
          </div>
        </div>
        <footer className="text-center text-zinc-400 text-xs py-4">
          &copy; {new Date().getFullYear()} كاشير تك - نظام نقاط البيع الذكي
        </footer>
      </div>
    </div>
  );
}
