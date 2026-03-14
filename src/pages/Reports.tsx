import React, { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Wrench, Package, CreditCard, Calendar, Filter, Download,
} from "lucide-react";
import { motion } from "motion/react";
import { roundMoney } from "../lib/moneyUtils";

type Period = "today" | "week" | "month" | "year" | "custom";

function getDateRange(period: Period, customStart?: string, customEnd?: string) {
  const now = new Date();
  switch (period) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case "week": {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return { start, end: now };
    }
    case "month": {
      const start = new Date(now);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: now };
    }
    case "custom":
      return {
        start: customStart ? new Date(customStart) : new Date(now.getFullYear(), 0, 1),
        end: customEnd ? new Date(customEnd + "T23:59:59") : now,
      };
  }
}

function isInRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

export default function Reports() {
  const { orders, purchases, expenses, incomes, maintenanceJobs, transactions, settings } =
    useAppContext();

  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const currency = settings.currency || "ر.س";

  const { start, end } = getDateRange(period, customStart, customEnd);

  // ── Filtered Data ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(
    () => orders.filter(
      (o) => o.status === "completed" && isInRange(o.date, start, end)
    ),
    [orders, start, end]
  );

  const filteredPurchases = useMemo(
    () => purchases.filter(
      (p) => p.status === "completed" && isInRange(p.date, start, end)
    ),
    [purchases, start, end]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => isInRange(e.date, start, end)),
    [expenses, start, end]
  );

  const filteredIncomes = useMemo(
    () => incomes.filter((i) => isInRange(i.date, start, end)),
    [incomes, start, end]
  );

  const filteredMaintenance = useMemo(
    () => maintenanceJobs.filter(
      (m) => m.status === "paid" && isInRange(m.date, start, end)
    ),
    [maintenanceJobs, start, end]
  );

  // ── Summary Calculations ─────────────────────────────────────────────────
  const totalSalesIncome = useMemo(
    () => roundMoney(filteredOrders.reduce((s, o) => s + o.amountPaid, 0)),
    [filteredOrders]
  );

  const totalPurchasesCost = useMemo(
    () => roundMoney(filteredPurchases.reduce((s, p) => s + p.total, 0)),
    [filteredPurchases]
  );

  const totalExpenses = useMemo(
    () => roundMoney(filteredExpenses.reduce((s, e) => s + e.amount, 0)),
    [filteredExpenses]
  );

  const totalOtherIncomes = useMemo(
    () => roundMoney(filteredIncomes.reduce((s, i) => s + i.amount, 0)),
    [filteredIncomes]
  );

  const totalMaintenanceRevenue = useMemo(
    () => roundMoney(filteredMaintenance.reduce((s, m) => s + m.cost, 0)),
    [filteredMaintenance]
  );

  const totalRevenue = roundMoney(totalSalesIncome + totalOtherIncomes + totalMaintenanceRevenue);
  const totalCosts = roundMoney(totalPurchasesCost + totalExpenses);
  const netProfit = roundMoney(totalRevenue - totalCosts);
  const totalProfit = useMemo(
    () => roundMoney(filteredOrders.reduce((s, o) => s + (o.profit ?? 0), 0)),
    [filteredOrders]
  );

  // ── Daily Chart Data (last 30 days or period) ─────────────────────────────
  const chartData = useMemo(() => {
    const days: { date: string; income: number; expenses: number; profit: number }[] = [];
    const startCopy = new Date(start);
    while (startCopy <= end) {
      const dayStr = startCopy.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
      const dayISO = startCopy.toISOString().slice(0, 10);

      const dailySales = orders
        .filter((o) => o.status === "completed" && o.date.startsWith(dayISO))
        .reduce((s, o) => s + o.amountPaid, 0);
      const dailyExpenses = expenses
        .filter((e) => e.date.startsWith(dayISO))
        .reduce((s, e) => s + e.amount, 0);
      const dailyPurchases = purchases
        .filter((p) => p.status === "completed" && p.date.startsWith(dayISO))
        .reduce((s, p) => s + p.total, 0);

      days.push({
        date: dayStr,
        income: roundMoney(dailySales),
        expenses: roundMoney(dailyExpenses + dailyPurchases),
        profit: roundMoney(dailySales - dailyExpenses - dailyPurchases),
      });

      startCopy.setDate(startCopy.getDate() + 1);
    }
    // Only show if 60 days or less to avoid overcrowding
    return days.length <= 60 ? days : days.filter((_, i) => i % Math.ceil(days.length / 30) === 0);
  }, [orders, expenses, purchases, start, end]);

  // ── Stats Cards ───────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "إجمالي الوارد (مبيعات + أخرى)",
      value: totalRevenue,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "إجمالي الصادر (مشتريات + مصاريف)",
      value: totalCosts,
      icon: TrendingDown,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      label: "صافي الحركة",
      value: netProfit,
      icon: DollarSign,
      color: netProfit >= 0 ? "text-emerald-500" : "text-rose-500",
      bg: netProfit >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      label: "أرباح المبيعات الصافية",
      value: totalProfit,
      icon: Package,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      label: "إيراد المبيعات",
      value: totalSalesIncome,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "تكلفة المشتريات",
      value: totalPurchasesCost,
      icon: CreditCard,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "مجموع المصاريف",
      value: totalExpenses,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "إيراد الصيانة",
      value: totalMaintenanceRevenue,
      icon: Wrench,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
  ];

  const periodOptions: { value: Period; label: string }[] = [
    { value: "today", label: "اليوم" },
    { value: "week", label: "آخر 7 أيام" },
    { value: "month", label: "هذا الشهر" },
    { value: "year", label: "هذا العام" },
    { value: "custom", label: "مخصص" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            التقارير والتحليلات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            تقارير الصادر والوارد وصافي الحركة
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600 dark:text-gray-400">من:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600 dark:text-gray-400">إلى:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>
              {card.value.toLocaleString("ar-SA")} {currency}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            مقارنة الوارد والصادر يومياً
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString("ar-SA")} ${currency}`, ""]}
              />
              <Legend />
              <Bar dataKey="income" name="الوارد" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="الصادر" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Net Profit Trend */}
      {chartData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            اتجاه صافي الحركة
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString("ar-SA")} ${currency}`, ""]}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="صافي الحركة"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            تفاصيل الوارد والصادر
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50">
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">البند</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">الاتجاه</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {[
              { label: "مبيعات", direction: "وارد ↑", amount: totalSalesIncome, up: true },
              { label: "إيراد الصيانة", direction: "وارد ↑", amount: totalMaintenanceRevenue, up: true },
              { label: "دخل آخر", direction: "وارد ↑", amount: totalOtherIncomes, up: true },
              { label: "تكلفة مشتريات", direction: "صادر ↓", amount: totalPurchasesCost, up: false },
              { label: "مصاريف", direction: "صادر ↓", amount: totalExpenses, up: false },
            ].map((row) => (
              <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{row.label}</td>
                <td className={`px-4 py-3 font-medium ${row.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {row.direction}
                </td>
                <td className={`px-4 py-3 font-bold ${row.up ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
                  {row.amount.toLocaleString("ar-SA")} {currency}
                </td>
              </tr>
            ))}
            <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-bold">
              <td className="px-4 py-3 text-indigo-700 dark:text-indigo-300" colSpan={2}>صافي الحركة الكلي</td>
              <td className={`px-4 py-3 font-bold text-lg ${netProfit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
                {netProfit.toLocaleString("ar-SA")} {currency}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
