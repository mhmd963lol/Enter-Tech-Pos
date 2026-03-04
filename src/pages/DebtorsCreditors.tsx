import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  type: "debtors" | "creditors";
}

export default function DebtorsCreditors({ type }: Props) {
  const { customers, suppliers, settings } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  // Debtors: Customers with positive balance (they owe us) + Suppliers with negative balance (they owe us)
  // Creditors: Customers with negative balance (we owe them) + Suppliers with positive balance (we owe them)

  const relevantEntities =
    type === "debtors"
      ? [
          ...customers
            .filter((c) => c.balance > 0)
            .map((c) => ({
              ...c,
              entityType: "customer",
              displayBalance: c.balance,
            })),
          ...suppliers
            .filter((s) => s.balance < 0)
            .map((s) => ({
              ...s,
              entityType: "supplier",
              displayBalance: Math.abs(s.balance),
            })),
        ]
      : [
          ...customers
            .filter((c) => c.balance < 0)
            .map((c) => ({
              ...c,
              entityType: "customer",
              displayBalance: Math.abs(c.balance),
            })),
          ...suppliers
            .filter((s) => s.balance > 0)
            .map((s) => ({
              ...s,
              entityType: "supplier",
              displayBalance: s.balance,
            })),
        ];

  const filteredEntities = relevantEntities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm),
  );

  const totalAmount = relevantEntities.reduce(
    (sum, e) => sum + e.displayBalance,
    0,
  );

  const title =
    type === "debtors" ? "المدينون (أموال لنا)" : "الدائنون (أموال علينا)";
  const description =
    type === "debtors"
      ? "قائمة بالعملاء والموردين الذين مدينون للمتجر بمبالغ مالية."
      : "قائمة بالعملاء والموردين الذين يطالبون المتجر بمبالغ مالية.";

  const Icon = type === "debtors" ? ArrowUpRight : ArrowDownLeft;
  const colorClass =
    type === "debtors"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";
  const bgClass =
    type === "debtors"
      ? "bg-emerald-100 dark:bg-emerald-900/30"
      : "bg-red-100 dark:bg-red-900/30";

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-2xl font-bold flex items-center gap-2 ${colorClass}`}
          >
            <Icon className="w-6 h-6" />
            {title}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}
            >
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                الإجمالي
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalAmount.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}
            >
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                عدد الجهات
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {relevantEntities.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-sm border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-4 font-medium">الاسم</th>
                <th className="px-6 py-4 font-medium">النوع</th>
                <th className="px-6 py-4 font-medium">التواصل</th>
                <th className="px-6 py-4 font-medium">المبلغ المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredEntities.map((entity, index) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`${entity.entityType}-${entity.id}-${index}`}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {entity.name}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {entity.address || "لا يوجد عنوان"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          entity.entityType === "customer"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {entity.entityType === "customer" ? "عميل" : "مورد"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-zinc-400" />
                        {entity.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1 font-bold ${colorClass}`}
                      >
                        {entity.displayBalance.toFixed(2)} {settings.currency}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredEntities.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لا يوجد سجلات مطابقة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
