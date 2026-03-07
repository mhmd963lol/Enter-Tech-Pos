import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Receipt,
  Eye,
  Printer,
  Filter,
  Package,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import InvoiceModal from "../components/InvoiceModal";
import ReturnModal from "../components/ReturnModal";
import { Order } from "../types";

export default function Orders() {
  const { orders, updateOrderStatus, settings } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<Order | null>(null);

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const handleReturn = (order: Order) => {
    setOrderToReturn(order);
    setIsReturnModalOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      (order.customerName && order.customerName.includes(searchTerm));
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
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
      case "processing":
        return (
          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            قيد التجهيز
          </span>
        );
      case "ready":
        return (
          <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
            جاهز
          </span>
        );
      case "shipped":
        return (
          <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium">
            مشحون
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            ملغي
          </span>
        );
      case "returned":
        return (
          <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 rounded-full text-xs font-medium">
            مسترجع
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">كاش</span>
        );
      case "card":
        return (
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">
            بطاقة ائتمان
          </span>
        );
      case "online":
        return (
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">
            دفع إلكتروني
          </span>
        );
      case "debt":
        return (
          <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
            آجل (دين)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          الطلبات والفواتير
        </h2>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب أو اسم العميل..."
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
              <option value="processing">قيد التجهيز</option>
              <option value="ready">جاهز</option>
              <option value="shipped">مشحون</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
              <option value="returned">مسترجع</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">المنتجات</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">طريقة الدفع</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={order.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                      {new Date(order.date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      {order.customerName || "عميل نقدي"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item, index) => (
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
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {order.total.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(order.paymentMethod)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm dark:text-white dark:bg-zinc-900"
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as any)
                        }
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="processing">قيد التجهيز</option>
                        <option value="ready">جاهز</option>
                        <option value="shipped">مشحون</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <div className="mt-2">{getStatusBadge(order.status)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.status !== "cancelled" &&
                          order.status !== "returned" && (
                            <button
                              onClick={() => handleReturn(order)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="استرجاع"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        <button
                          onClick={() => handleViewInvoice(order)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleViewInvoice(order);
                            setTimeout(() => window.print(), 500);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="طباعة الفاتورة"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedOrder}
        settings={settings}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        order={orderToReturn}
      />
    </div>
  );
}
