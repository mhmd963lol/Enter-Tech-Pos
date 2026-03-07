import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  TrendingDown,
  Calendar,
  Tag,
  Trash2,
  Home,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NumberInput from "../components/NumberInput";
import toast from "react-hot-toast";
import { Expense } from "../types";

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, addTransaction, settings } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "رواتب", // default
    description: "",
    type: "general" as "general" | "maintenance_parts",
  });

  const categories = ["رواتب", "إيجار", "فواتير", "صيانة", "نثريات", "أخرى"];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.includes(searchTerm) || e.category.includes(searchTerm);
    const matchesCategory =
      categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpensesAmount = expenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }

    const expenseObj: Omit<Expense, "id"> = {
      amount: Number(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString(),
      type: newExpense.type,
    };

    addExpense(expenseObj);

    // Also add to transactions
    addTransaction({
      type: "expense",
      amount: Number(newExpense.amount),
      date: new Date().toISOString(),
      description: `مصروف (${newExpense.category}) - ${newExpense.description}`,
    });

    toast.success("تمت إضافة المصروف بنجاح");
    setIsModalOpen(false);
    setNewExpense({
      amount: "",
      category: "رواتب",
      description: "",
      type: "general",
    });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("تم الحذف");
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            المصروفات
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            إدارة المصاريف التشغيلية للمتجر وتصنيفها.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          تسجيل مصروف جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي المصروفات
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalExpensesAmount.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                عدد العمليات
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {expenses.length}
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
              placeholder="ابحث في المصروفات..."
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">التصنيف: الكل</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">التصنيف</th>
                <th className="px-6 py-4 font-medium">النوع</th>
                <th className="px-6 py-4 font-medium">الوصف</th>
                <th className="px-6 py-4 font-medium">المبلغ</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredExpenses.map((expense) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={expense.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                      {new Date(expense.date).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {expense.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {expense.type === "maintenance_parts" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <Wrench className="w-3 h-3" /> قطع صيانة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          <Home className="w-3 h-3" /> تشغيلي عام
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 text-zinc-600 dark:text-zinc-300 max-w-xs truncate"
                      title={expense.description}
                    >
                      {expense.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">
                      {expense.amount.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم العثور على مصروفات</p>
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
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  تسجيل مصروف جديد
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    المبلغ <span className="text-red-500">*</span>
                  </label>
                  <NumberInput
                    value={newExpense.amount}
                    onChange={(val) =>
                      setNewExpense({ ...newExpense, amount: val })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    allowDecimal
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      التصنيف <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        className="w-full pl-4 pr-10 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white appearance-none"
                        value={newExpense.category}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      النوع
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                      value={newExpense.type}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="general">عام / تشغيلي</option>
                      <option value="maintenance_parts">تكلفة قطع صيانة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white resize-none"
                    rows={3}
                    placeholder="تفاصيل إضافية عن المصروف..."
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                  >
                    اعتماد المصروف
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
