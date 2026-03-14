import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Receipt,
  Plus,
  Filter,
  Package,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function Purchases() {
  const { purchases, updatePurchaseInvoiceStatus, settings, user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.id.includes(searchTerm) ||
      (purchase.supplierName && purchase.supplierName.includes(searchTerm));
    const matchesStatus =
      statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
            مكتمل
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
            قيد الانتظار
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            ملغي
          </span>
        );
      default:
        return null;
    }
  };

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            فواتير المشتريات
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            إدارة مشتريات المخزون من الموردين.
          </p>
        </div>
        <Link
          to="/purchases/new"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          إنشاء فاتورة مشتريات
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الفواتير
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {purchases.length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                قيمة المشتريات
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalPurchasesAmount.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث برقم الفاتورة أو اسم المورد..."
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-400" />
            <select
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">رقم الفاتورة</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">المورد</th>
                <th className="px-6 py-4 font-medium">المنتجات (الكمية)</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">المدفوع</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredPurchases.map((purchase) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={purchase.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {purchase.id}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                      {new Date(purchase.date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-zinc-400" />
                        {purchase.supplierName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {purchase.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                          >
                            <Package className="w-3 h-3" />
                            <span
                              className="truncate max-w-[150px]"
                              title={item.name}
                            >
                              {item.name}
                            </span>
                            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">
                      {purchase.total.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {purchase.amountPaid.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm dark:text-white dark:bg-zinc-900 ${purchase.status === "completed" && user?.role !== "admin" ? "opacity-50 cursor-not-allowed" : ""}`}
                        value={purchase.status}
                        disabled={purchase.status === "completed" && user?.role !== "admin"}
                        onChange={(e) =>
                          updatePurchaseInvoiceStatus(
                            purchase.id,
                            e.target.value as any,
                          )
                        }
                        title={
                          purchase.status === "completed" && user?.role !== "admin"
                            ? "صلاحية الإلغاء/التعديل للمسؤولين فقط"
                            : ""
                        }
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="completed">مكتمل (يُضاف للمخزون)</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <div className="mt-2">
                        {getStatusBadge(purchase.status)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredPurchases.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم العثور على فواتير مشتريات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
