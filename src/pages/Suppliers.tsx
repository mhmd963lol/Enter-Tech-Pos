import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  Truck,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit2,
  X,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Supplier } from "../types";

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, settings } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<
    Omit<Supplier, "id" | "balance">
  >({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm),
  );

  const totalDebt = suppliers.reduce(
    (sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 0),
    0,
  );
  const totalCredit = suppliers.reduce(
    (sum, s) => sum + (s.balance > 0 ? s.balance : 0),
    0,
  );

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setNewSupplier({
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email || "",
        address: supplier.address || "",
      });
    } else {
      setEditingSupplier(null);
      setNewSupplier({
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
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, newSupplier);
    } else {
      addSupplier(newSupplier);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            إدارة الموردين
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            تتبع حسابات الموردين، المستحقات، والمدفوعات الآجلة.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          إضافة مورد جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الديون (لهم)
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalCredit.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                أرصدة مدفوعة مقدمًا (لنا)
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalDebt.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                عدد الموردين
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {suppliers.length}
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
              placeholder="ابحث باسم المورد أو رقم الهاتف..."
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
                <th className="px-6 py-4 font-medium">المورد</th>
                <th className="px-6 py-4 font-medium">التواصل</th>
                <th className="px-6 py-4 font-medium">الرصيد / المستحقات</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredSuppliers.map((supplier) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={supplier.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            {supplier.name}
                          </p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {supplier.address || "لا يوجد عنوان"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-zinc-400" />
                          {supplier.phone}
                        </p>
                        {supplier.email && (
                          <p className="text-xs text-zinc-500 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-zinc-400" />
                            {supplier.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                          supplier.balance > 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : supplier.balance < 0
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        {Math.abs(supplier.balance).toFixed(2)}{" "}
                        {settings.currency}
                        <span className="text-[10px] font-normal opacity-70 mr-1">
                          {supplier.balance > 0
                            ? "(مستحقات)"
                            : supplier.balance < 0
                              ? "(رصيدنا)"
                              : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(supplier)}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSupplier(supplier.id)}
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
          {filteredSuppliers.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم العثور على موردين</p>
            </div>
          )}
        </div>
      </div>

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
                  {editingSupplier ? "تعديل بيانات المورد" : "إضافة مورد جديد"}
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
                    اسم المورد / الشركة
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newSupplier.name}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
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
                    value={newSupplier.phone}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, phone: e.target.value })
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
                    value={newSupplier.email}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, email: e.target.value })
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
                    value={newSupplier.address}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
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
                    {editingSupplier ? "حفظ التعديلات" : "إضافة المورد"}
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
