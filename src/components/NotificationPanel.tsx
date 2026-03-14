import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { AppNotification } from "../types";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
}: NotificationPanelProps) {
  const { notifications, markNotificationAsRead, clearNotifications, deleteNotification } =
    useAppContext();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };


  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: AppNotification["type"], read: boolean) => {
    if (read) return "bg-white dark:bg-zinc-950";
    switch (type) {
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/10";
      case "error":
        return "bg-red-50 dark:bg-red-900/10";
      case "success":
        return "bg-emerald-50 dark:bg-emerald-900/10";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/10";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-zinc-950 shadow-2xl z-50 flex flex-col border-r border-zinc-200 dark:border-zinc-800"
            dir="rtl"
          >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="font-bold text-zinc-900 dark:text-white">
                  الإشعارات
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="مسح الكل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                  <Bell className="w-12 h-12 opacity-20" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors relative group ${getBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex justify-between items-start">
                          <h4
                            className={`text-sm font-bold pl-8 ${notification.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-white"}`}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="absolute left-2 top-2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm group-hover:shadow"
                            title="حذف الإشعار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${notification.read ? "text-zinc-500 dark:text-zinc-500" : "text-zinc-600 dark:text-zinc-400"}`}
                        >
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-zinc-400 mt-2 block font-medium">
                          {new Date(notification.date).toLocaleString("ar-SA", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
