import React from "react";
import { useAppContext } from "../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export default function Dashboard() {
  const { orders, products, settings } = useAppContext();

  const totalSales = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;
  const totalProducts = products.length;
  const inventoryValue = products
    .filter((p) => p.trackInventory !== false)
    .reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  // Generate real data for the chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = last7Days.map((date) => {
    const dateString = date.toISOString().split("T")[0];
    const dailySales = orders
      .filter((o) => o.status === "completed" && o.date.startsWith(dateString))
      .reduce((sum, o) => sum + o.total, 0);

    const dayName = date.toLocaleDateString("ar-SA", { weekday: "long" });
    // Remove "يوم " prefix if present in some locales, keep it clean
    return { name: dayName.replace("يوم ", ""), sales: dailySales };
  });

  const stats = [
    {
      title: "إجمالي المبيعات",
      value: `${totalSales.toFixed(2)} ${settings.currency}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "المنتجات المتاحة",
      value: totalProducts,
      icon: Package,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "قيمة المخزون",
      value: `${inventoryValue.toFixed(2)} ${settings.currency}`,
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          نظرة عامة
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="fluid-grid">
        {stats.map((stat, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            key={index}
            className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 cursor-pointer"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
            المبيعات الأسبوعية
          </h3>
          <div className="w-full" style={{ height: 320, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a" }}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
            أحدث الطلبات
          </h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {order.id}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {new Date(order.date).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">
                    {order.total.toFixed(2)} {settings.currency}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === "completed"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : order.status === "pending"
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}
                  >
                    {order.status === "completed"
                      ? "مكتمل"
                      : order.status === "pending"
                        ? "قيد الانتظار"
                        : "مشحون"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
