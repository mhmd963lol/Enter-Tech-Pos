import React, { useState } from "react";
import { Wallet, ArrowLeftRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

export default function Vault() {
  const { orders, transactions, addTransaction, addLog, user, settings } = useAppContext();
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const formatCurrency = (amount: number, userSettings: any) => {
    return `${amount.toFixed(2)} ${userSettings.currency}`;
  };

  // Daily Cash Calculations
  const dailyCashOrders = orders.filter(o => o.vault === "daily" && o.status === "completed");
  const dailyCashSales = dailyCashOrders.reduce((sum, o) => sum + o.amountPaid, 0);

  const dailyTransactions = transactions.filter(t => t.vault === "daily");
  const dailyIncome = dailyTransactions.filter(t => ["income", "payment_in"].includes(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const dailyExpenses = dailyTransactions.filter(t => ["expense", "payment_out"].includes(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const dailyTransfersOut = dailyTransactions.filter(t => t.type === "transfer" && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const dailyTransfersIn = dailyTransactions.filter(t => t.type === "transfer" && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  const dailyBalance = dailyCashSales + dailyIncome + dailyTransfersIn - dailyExpenses - dailyTransfersOut;

  // Main Safe Calculations (Legacy transactions without vault are considered Main)
  const mainCashOrders = orders.filter(o => (o.vault === "main" || !o.vault) && o.status === "completed" && (o.paymentMethod === "cash" || o.paymentMethod === "split"));
  // Note: we're approximating cash sales that went to Main Safe. Wait, we should only sum amountPaid or splitDetails?.cash
  const mainCashSales = mainCashOrders.reduce((sum, o) => {
    if (o.paymentMethod === "cash") return sum + o.amountPaid;
    if (o.paymentMethod === "split") return sum + (o.splitDetails?.cash || 0);
    return sum;
  }, 0);

  const mainTransactions = transactions.filter(t => t.vault === "main" || !t.vault);
  const mainIncome = mainTransactions.filter(t => ["income", "payment_in"].includes(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const mainExpenses = mainTransactions.filter(t => ["expense", "payment_out"].includes(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const mainTransfersIn = mainTransactions.filter(t => t.type === "transfer" && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const mainTransfersOut = mainTransactions.filter(t => t.type === "transfer" && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const mainBalance = mainCashSales + mainIncome + mainTransfersIn - mainExpenses - mainTransfersOut;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(transferAmount);
    if (!amount || amount <= 0 || amount > dailyBalance) return;

    // Transaction to deduct from Daily Cash
    addTransaction({
      type: "transfer",
      amount: -amount,
      date: new Date().toISOString(),
      description: `ترحيل نقدية إلى الصندوق الرئيسي بواسطة ${user?.name || "النظام"}`,
      vault: "daily",
    });

    // Transaction to add to Main Safe
    addTransaction({
      type: "transfer",
      amount: amount,
      date: new Date().toISOString(),
      description: `استلام نقدية مرحلة من صندوق الكاشير بواسطة ${user?.name || "النظام"}`,
      vault: "main",
    });

    addLog({
      action: "ترحيل نقدية",
      details: `تم ترحيل مبلغ ${amount} من صندوق اليومية إلى الصندوق الرئيسي`,
      type: "system"
    });

    setTransferAmount("");
    setIsTransferModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-500" />
            إدارة الصندوق واليومية
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            متابعة دقيقة للأرصدة النقدية وعمليات الترحيل بين الصناديق.
            (آلية الترحيل الحالية: <span className="font-bold text-indigo-500">{settings.cashTransferMode === "auto" ? "تلقائي" : "يدوي"}</span>)
          </p>
        </div>
        <button
          onClick={() => setIsTransferModalOpen(true)}
          disabled={dailyBalance <= 0}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          <ArrowLeftRight className="w-5 h-5" />
          ترحيل نقدية
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Cash Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border-b-4 border-l border-r border-t border-zinc-200 border-b-sky-500 dark:border-zinc-800 dark:border-b-sky-500 shadow-sm relative overflow-hidden"
        >
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2 relative">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            صندوق الكاشير (كاش اليومية)
          </h2>
          <div className="text-4xl font-black text-sky-600 dark:text-sky-400 mb-8 relative">
            {formatCurrency(dailyBalance, settings)}
          </div>

          <div className="space-y-4 relative">
            <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-600 dark:text-zinc-400 text-sm">مبيعات نقدية</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {formatCurrency(dailyCashSales, settings)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-600 dark:text-zinc-400 text-sm">مقبوضات أخرى</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {formatCurrency(dailyIncome, settings)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-600 dark:text-zinc-400 text-sm">مدفوعات ومصروفات</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                {formatCurrency(dailyExpenses, settings)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-600 dark:text-zinc-400 text-sm">إجمالي المُرحل للصندوق</span>
              <span className="font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                <ArrowLeftRight className="w-4 h-4" />
                {formatCurrency(dailyTransfersOut, settings)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Safe Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-6 border-b-4 border-l border-r border-t border-zinc-800 border-b-indigo-500 dark:border-b-indigo-500 shadow-xl relative overflow-hidden"
        >
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl z-0" />
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Wallet className="w-5 h-5 text-indigo-400" />
            الصندوق الرئيسي (الخزينة)
          </h2>
          <div className="text-4xl font-black text-indigo-400 mb-8 relative z-10">
            {formatCurrency(mainBalance, settings)}
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <span className="text-zinc-400 text-sm">مستلم من اليومية</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {formatCurrency(mainTransfersIn, settings)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <span className="text-zinc-400 text-sm">مبيعات ومقبوضات مباشرة</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {formatCurrency(mainCashSales + mainIncome, settings)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <span className="text-zinc-400 text-sm">مدفوعات ومصروفات</span>
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                {formatCurrency(mainExpenses, settings)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            dir="rtl"
          >
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-indigo-500" />
              ترحيل النقدية
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              يتم ترحيل الأموال من صندوق الكاشير إلى الخزينة الرئيسية. 
              المبلغ المتاح: <strong className="text-emerald-500">{formatCurrency(dailyBalance, settings)}</strong>
            </p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">المبلغ المراد ترحيله</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max={dailyBalance}
                    step="0.01"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-lg font-bold"
                    placeholder="0.00"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                    {settings.currency}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!transferAmount || Number(transferAmount) <= 0 || Number(transferAmount) > dailyBalance}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  تأكيد الترحيل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setTransferAmount("");
                  }}
                  className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
