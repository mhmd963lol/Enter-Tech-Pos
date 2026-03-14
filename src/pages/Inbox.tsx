import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Bell, BellOff, CheckCheck, Trash2, Package, AlertTriangle,
  Info, CheckCircle2, XCircle, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    label: "تحذير",
  },
  error: {
    icon: XCircle,
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    iconColor: "text-rose-500",
    badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
    label: "خطأ",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-500",
    badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    label: "نجاح",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    label: "معلومة",
  },
};

export default function Inbox() {
  const {
    notifications,
    markNotificationAsRead,
    deleteNotification,
    clearNotifications,
  } = useAppContext();
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [notifications]
  );

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationAsRead(n.id);
    });
    toast.success("تم تعليم جميع الإشعارات كمقروءة");
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    clearNotifications();
    toast.success("تم مسح جميع الإشعارات");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "الآن";
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString("ar-SA");
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">البريد الوارد</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} إشعار غير مقروء`
                : "جميع الإشعارات مقروءة"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden md:inline">تعليم الكل كمقروء</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">مسح الكل</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {sortedNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <BellOff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            لا توجد إشعارات
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            ستظهر الإشعارات هنا عند وجود تنبيهات مهمة
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedNotifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              const isUnread = !notification.read;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className={`relative group rounded-xl border p-4 transition-all ${
                    isUnread
                      ? `${config.bg} ${config.border} shadow-sm`
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-70"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification.id, notification.link)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                              {config.label}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                            {formatDate(notification.date)}
                          </p>
                        </div>

                        {notification.link && (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-indigo-500 transition-colors" />
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                        toast.success("تم حذف الإشعار");
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      title="حذف الإشعار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
