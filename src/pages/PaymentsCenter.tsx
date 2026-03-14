import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  FileText,
  Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction } from "../types";
import toast from "react-hot-toast";

/** Modal for confirming transaction void with reason */
function VoidTransactionModal({
  transaction,
  currency,
  onConfirm,
  onCancel,
}: {
  transaction: Transaction;
  currency: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-100 dark:border-zinc-800"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">إلغاء حركة مالية</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{transaction.id}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
            سيتم عكس التأثير المالي لهذه الحركة. المبلغ: <strong>{transaction.amount.toFixed(2)} {currency}</strong>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
            <p><strong>الوصف:</strong> {transaction.description || "-"}</p>
            {transaction.entityName && <p><strong>الجهة:</strong> {transaction.entityName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              سبب الإلغاء <span className="text-zinc-400 font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: تسجيل خاطئ، تكرار..."
              className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            />
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
          >
            تراجع
          </button>
          <button
            onClick={() => onConfirm(reason || "إلغاء حركة مالية")}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
          >
            تأكيد الإلغاء
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentsCenter() {
  const { transactions, settings, user, deleteTransaction, addLog } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<Transaction["type"] | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.includes(searchTerm) ||
      (t.entityName && t.entityName.includes(searchTerm));
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStartDate = startDate ? t.date >= startDate : true;
    const matchesEndDate = endDate ? t.date <= endDate + "T23:59:59.999Z" : true;
    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  const totalIn = filteredTransactions
    .filter((t) => ["sale", "income", "payment_in"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = filteredTransactions
    .filter((t) => ["purchase", "expense", "payment_out"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIn - totalOut;

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "sale":
      case "income":
      case "payment_in":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        );
      case "purchase":
      case "expense":
      case "payment_out":
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        );
    }
  };

  const getTransactionLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "sale":
        return { label: "مبيعات", color: "text-emerald-600 dark:text-emerald-400" };
      case "purchase":
        return { label: "مشتريات", color: "text-red-600 dark:text-red-400" };
      case "expense":
        return { label: "مصروف", color: "text-orange-600 dark:text-orange-400" };
      case "income":
        return { label: "دخل", color: "text-blue-600 dark:text-blue-400" };
      case "payment_in":
        return { label: "سداد عميل", color: "text-emerald-600 dark:text-emerald-400" };
      case "payment_out":
        return { label: "سداد مورد", color: "text-red-600 dark:text-red-400" };
    }
  };

  const handleVoidConfirm = (reason: string) => {
    if (!voidTarget) return;
    addLog({
      action: "إلغاء حركة مالية",
      details: `تم إلغاء الحركة ${voidTarget.id} (${voidTarget.type}) بمبلغ ${voidTarget.amount}. السبب: ${reason}. الوصف: ${voidTarget.description}`,
      type: "security",
    });
    deleteTransaction(voidTarget.id);
    toast.success(`تم إلغاء الحركة ${voidTarget.id}`);
    setVoidTarget(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            مركز المدفوعات والقيود
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            سجل شامل لجميع الحركات المالية الصادرة والواردة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">إجمالي المقبوضات</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalIn.toFixed(2)} {settings.currency}
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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">إجمالي المدفوعات</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalOut.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">صافي التدفق</p>
              <h3 className={`text-2xl font-bold ${netBalance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-600 dark:text-red-400"}`}>
                {netBalance > 0 ? "+" : ""}{netBalance.toFixed(2)} {settings.currency}
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
              placeholder="ابحث برقم المرجع أو الوصف أو الاسم..."
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <input type="date" className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={startDate} onChange={(e) => setStartDate(e.target.value)} title="من تاريخ" />
              <span className="text-zinc-500">-</span>
              <input type="date" className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={endDate} onChange={(e) => setEndDate(e.target.value)} title="إلى تاريخ" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-zinc-400" />
              <select
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as Transaction["type"] | "all")}
              >
                <option value="all">جميع الحركات</option>
                <option value="sale">مبيعات</option>
                <option value="purchase">مشتريات</option>
                <option value="expense">مصروفات</option>
                <option value="income">إيرادات</option>
                <option value="payment_in">سداد عملاء (مقبوضات)</option>
                <option value="payment_out">سداد موردين (مدفوعات)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">نوع الحركة</th>
                <th className="px-6 py-4 font-medium">البيان / الوصف</th>
                <th className="px-6 py-4 font-medium">الجهة</th>
                <th className="px-6 py-4 font-medium">المبلغ</th>
                {user?.role === "admin" && <th className="px-6 py-4 font-medium">إجراء</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredTransactions.map((transaction) => {
                  const typeInfo = getTransactionLabel(transaction.type);
                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={transaction.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(transaction.date).toLocaleString("ar-SA", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className={`font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-white font-medium truncate max-w-xs" title={transaction.description}>
                            {transaction.description || "-"}
                          </span>
                          {transaction.referenceId && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                              <FileText className="w-3 h-3" />
                              مرجع: {transaction.referenceId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {transaction.entityName || "-"}
                      </td>
                      <td className={`px-6 py-4 font-bold ${["sale", "income", "payment_in"].includes(transaction.type) ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {["sale", "income", "payment_in"].includes(transaction.type) ? "+" : "-"}
                        {transaction.amount.toFixed(2)} {settings.currency}
                      </td>
                      {user?.role === "admin" && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setVoidTarget(transaction)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold transition-colors"
                            title="إلغاء الحركة الماليّة"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            إلغاء
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم العثور على حركات مالية</p>
            </div>
          )}
        </div>
      </div>

      {/* Void Confirmation Modal */}
      <AnimatePresence>
        {voidTarget && (
          <VoidTransactionModal
            transaction={voidTarget}
            currency={settings.currency}
            onConfirm={handleVoidConfirm}
            onCancel={() => setVoidTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
