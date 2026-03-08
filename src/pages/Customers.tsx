import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit2,
  X,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Customer } from "../types";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, settings, collectDebt, addNotification } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<
    Omit<Customer, "id" | "balance">
  >({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  const totalDebt = customers.reduce(
    (sum, c) => sum + (c.balance > 0 ? c.balance : 0),
    0,
  );
  const totalCredit = customers.reduce(
    (sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0),
    0,
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setNewCustomer({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address || "",
      });
    } else {
      setEditingCustomer(null);
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, newCustomer);
    } else {
      addCustomer(newCustomer);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            إدارة العملاء
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            تتبع حسابات العملاء، الديون، والمدفوعات الآجلة.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الديون (لنا)
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalDebt.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الأرصدة (علينا)
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalCredit.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                عدد العملاء
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {customers.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم العميل أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">التواصل</th>
                <th className="px-6 py-4 font-medium">الرصيد / الدين</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredCustomers.map((customer) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={customer.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {customer.address || "لا يوجد عنوان"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-zinc-400" />
                          {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-zinc-500 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-zinc-400" />
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${customer.balance > 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : customer.balance < 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        {Math.abs(customer.balance).toFixed(2)}{" "}
                        {settings.currency}
                        <span className="text-[10px] font-normal opacity-70 mr-1">
                          {customer.balance > 0
                            ? "(دين)"
                            : customer.balance < 0
                              ? "(رصيد)"
                              : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {customer.balance > 0 && (
                          <>
                            <button
                              onClick={() => {
                                const amount = window.prompt(`أدخل المبلغ المحصل من ${customer.name}:`, customer.balance.toString());
                                if (amount && !isNaN(parseFloat(amount))) {
                                  collectDebt(customer.id, parseFloat(amount), "cash");
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors"
                            >
                              <DollarSign className="w-3 h-3" />
                              تحصيل
                            </button>
                            <button
                              onClick={() => {
                                const date = window.prompt(`تحديد موعد تذكير لـ ${customer.name} (Y-M-D):`, new Date().toISOString().split('T')[0]);
                                if (date) {
                                  updateCustomer(customer.id, { nextReminderDate: new Date(date).toISOString() });
                                  addNotification({
                                    title: "تم تحديد موعد",
                                    message: `سيتم تذكيرك بمطالبة ${customer.name} بتاريخ ${date}`,
                                    type: "info"
                                  });
                                }
                              }}
                              className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                              title="تحديد موعد تذكير"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenModal(customer)}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم العثور على عملاء</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingCustomer ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم العميل
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    العنوان (اختياري)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    rows={3}
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                  >
                    {editingCustomer ? "حفظ التعديلات" : "إضافة العميل"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
