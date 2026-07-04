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
  Wallet,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
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
      (order.customerName && order.customerName.includes(searchTerm)) ||
      order.items.some(item => item.name?.includes(searchTerm) || (Array.isArray(item.aliases) && item.aliases.some(a => a.includes(searchTerm))));
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      completed: { label: "مكتمل", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800", icon: <CheckCircle2 size={12} /> },
      pending: { label: "قيد الانتظار", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800", icon: <Clock size={12} /> },
      processing: { label: "قيد التجهيز", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800", icon: <Clock size={12} /> },
      shipped: { label: "مشحون", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800", icon: <Truck size={12} /> },
      cancelled: { label: "ملغي", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800", icon: <XCircle size={12} /> },
      returned: { label: "مسترجع", color: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700", icon: <RotateCcw size={12} /> },
    };
    const info = map[status];
    if (!info) return null;
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${info.color}`}>
        {info.icon}
        {info.label}
      </span>
    );
  };

  const getPaymentIcon = (method: string) => {
    if (method === 'cash') return <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900 text-[9px] font-black"><Wallet size={10} className="text-emerald-500" /> كاش</div>;
    if (method === 'card') return <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900 text-[9px] font-black"><CreditCard size={10} className="text-blue-500" /> بطاقة</div>;
    if (method === 'debt') return <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900 text-[9px] font-black"><Users size={10} className="text-rose-500" /> آجل</div>;
    return <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800 text-[9px] font-black">{method}</div>;
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
              placeholder="ابحث برقم الطلب أو اسم العميل أو المنتج..."
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
                <th className="px-4 py-4 font-medium">المنتجات</th>
                <th className="px-4 py-4 font-medium">الكمية</th>
                <th className="px-4 py-4 font-medium">العميل</th>
                <th className="px-4 py-4 font-medium">الإجمالي</th>
                <th className="px-4 py-4 font-medium text-center">الحالة</th>
                <th className="px-4 py-4 font-medium text-center">الإجراءات</th>
                <th className="px-4 py-4 font-medium">رقم الطلب</th>
                <th className="px-4 py-4 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredOrders.map((order) => {
                  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      {/* Products */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                              <Package className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]" title={item.name}>{item.name}</span>
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-[10px] text-zinc-400">+{order.items.length - 3} أخرى</span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-4 font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                        {totalQty}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4 text-zinc-700 dark:text-zinc-300 text-sm">
                        {order.customerName || "عميل نقدي"}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {order.total.toFixed(2)} {settings.currency}
                      </td>

                      {/* Status + Payment */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1.5">
                          {getStatusBadge(order.status)}
                          {getPaymentIcon(order.paymentMethod)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {order.status !== "cancelled" && order.status !== "returned" && (
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
                          <select
                            className="text-[10px] bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-1 py-0.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer dark:text-white dark:bg-zinc-900"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          >
                            <option value="pending">انتظار</option>
                            <option value="processing">تجهيز</option>
                            <option value="shipped">شحن</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </div>
                      </td>

                      {/* Order Number */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                          {order.id}
                        </span>
                      </td>

                      {/* Date + Time */}
                      <td className="px-4 py-4 text-sm">
                        <p className="font-medium text-zinc-700 dark:text-zinc-300">
                          {new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(order.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
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
