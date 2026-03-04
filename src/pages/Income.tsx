import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  DollarSign,
  Calendar,
  Tag,
  Trash2,
  ArrowUpRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NumberInput from "../components/NumberInput";
import toast from "react-hot-toast";

export default function Income() {
  const { incomes, addTransaction, settings } = useAppContext();
  // Using a local state just to append incomes without changing the full context schema,
  // though we should ideally use addTransaction context to reflect in payments center
  const [localIncomes, setLocalIncomes] = useState(incomes);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: "",
    source: "",
    description: "",
  });

  const filteredIncomes = localIncomes.filter(
    (i) =>
      i.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.includes(searchTerm),
  );

  const totalIncomeAmount = localIncomes.reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.amount || !newIncome.source) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }

    const incomeObj = {
      id: `INC-${Math.random().toString(36).substring(7)}`,
      amount: Number(newIncome.amount),
      source: newIncome.source,
      description: newIncome.description,
      date: new Date().toISOString(),
    };

    setLocalIncomes([incomeObj, ...localIncomes]);

    // Also add to transactions
    addTransaction({
      type: "income",
      amount: Number(newIncome.amount),
      date: new Date().toISOString(),
      description: `${newIncome.source} - ${newIncome.description}`,
    });

    toast.success("تمت إضافة الدخل بنجاح");
    setIsModalOpen(false);
    setNewIncome({ amount: "", source: "", description: "" });
  };

  const deleteIncome = (id: string) => {
    setLocalIncomes(localIncomes.filter((i) => i.id !== id));
    toast.success("تم الحذف");
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            الدخل الإضافي
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            إدارة الإيرادات الإضافية خارج عمليات البيع النظامية.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          تسجيل دخل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الدخل الإضافي
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalIncomeAmount.toFixed(2)} {settings.currency}
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
                {localIncomes.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بمصدر الدخل أو الوصف..."
              className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">مصدر الدخل</th>
                <th className="px-6 py-4 font-medium">الوصف</th>
                <th className="px-6 py-4 font-medium">المبلغ</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredIncomes.map((income) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={income.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                      {new Date(income.date).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {income.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {income.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {income.amount.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteIncome(income.id)}
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
          {filteredIncomes.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <ArrowUpRight className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم تسجيل أي دخل إضافي</p>
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
                  تسجيل دخل جديد
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
                    المبلغ <span className="text-red-500">*</span>
                  </label>
                  <NumberInput
                    value={newIncome.amount}
                    onChange={(val) =>
                      setNewIncome({ ...newIncome, amount: val })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    allowDecimal
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    مصدر الدخل <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    placeholder="مثال: استثمار، إيجار..."
                    value={newIncome.source}
                    onChange={(e) =>
                      setNewIncome({ ...newIncome, source: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    rows={3}
                    value={newIncome.description}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                  >
                    حفظ الدخل
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
