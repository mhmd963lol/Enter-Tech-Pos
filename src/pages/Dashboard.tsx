import React, { useState, useMemo } from "react";
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
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  CreditCard,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  ShieldAlert,
  Crown,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

type TimeFilter = 'day' | 'week' | 'month';

const Dashboard = () => {
  const { orders, products, settings, logs, transactions } = useAppContext();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const totalSales = useMemo(() => {
    const salesInOrders = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.amountPaid, 0);

    const collections = transactions
      .filter(t => t.type === "payment_in")
      .reduce((sum, t) => sum + t.amount, 0);

    return salesInOrders + collections;
  }, [orders, transactions]);

  const totalOrders = useMemo(() => orders.filter(
    (order) => order.status === "completed",
  ).length, [orders]);
  const totalProducts = products.length;
  const inventoryValue = useMemo(() => products
    .filter((p) => p.trackInventory !== false)
    .reduce((sum, p) => sum + p.costPrice * p.stock, 0), [products]);

  // Get date range based on filter
  const getFilterRange = (filter: TimeFilter) => {
    const now = new Date();
    const start = new Date();
    if (filter === 'day') {
      start.setHours(0, 0, 0, 0);
    } else if (filter === 'week') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setDate(now.getDate() - 30);
    }
    return { start, end: now };
  };

  // Generate chart data based on selected filter
  const chartData = useMemo(() => {
    const { start } = getFilterRange(timeFilter);
    const dayCount = timeFilter === 'day' ? 24 : timeFilter === 'week' ? 7 : 30;

    if (timeFilter === 'day') {
      // Hourly breakdown for today
      return Array.from({ length: 24 }, (_, i) => {
        const hourStart = new Date();
        hourStart.setHours(i, 0, 0, 0);
        const hourEnd = new Date();
        hourEnd.setHours(i + 1, 0, 0, 0);

        const sales = orders
          .filter(o => o.status === "completed" && new Date(o.date) >= hourStart && new Date(o.date) < hourEnd)
          .reduce((sum, o) => sum + o.amountPaid, 0);

        return { name: `${String(i).padStart(2, '0')}:00`, sales };
      }).filter((_, i) => i >= 6 && i <= 23); // Show only 6AM-11PM
    }

    const days = Array.from({ length: dayCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (dayCount - 1 - i));
      return d;
    });

    return days.map((date) => {
      const dateString = date.toISOString().split("T")[0];
      const dailySales = orders
        .filter((o) => o.status === "completed" && o.date.startsWith(dateString))
        .reduce((sum, o) => sum + o.amountPaid, 0);

      const collections = transactions
        .filter(t => t.type === "payment_in" && t.date.startsWith(dateString))
        .reduce((sum, t) => sum + t.amount, 0);

      const label = timeFilter === 'week'
        ? date.toLocaleDateString("ar-SA", { weekday: "short" })
        : `${date.getDate()}/${date.getMonth() + 1}`;

      return { name: label, sales: dailySales + collections };
    });
  }, [orders, transactions, timeFilter]);

  // Top selling products based on filter
  const topProducts = useMemo(() => {
    const { start } = getFilterRange(timeFilter);
    const filteredOrders = orders.filter(
      o => o.status === "completed" && new Date(o.date) >= start
    );

    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.id) || { name: item.name, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += (item.customPrice ?? item.price) * item.quantity;
        productMap.set(item.id, existing);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders, timeFilter]);

  const layout = settings.dashboardLayout || {};

  const stats = [
    ...(layout.showSales !== false
      ? [
          {
            title: "إجمالي المبيعات",
            value: `${totalSales.toFixed(2)} ${settings.currency}`,
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            link: "/orders",
          },
        ]
      : []),
    ...(layout.showOrders !== false
      ? [
          {
            title: "إجمالي الطلبات",
            value: totalOrders,
            icon: ShoppingBag,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30",
            link: "/orders",
          },
        ]
      : []),
    ...(layout.showProducts !== false
      ? [
          {
            title: "المنتجات المتاحة",
            value: totalProducts,
            icon: Package,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
            link: "/products",
          },
        ]
      : []),
    ...(layout.showInventoryValue !== false
      ? [
          {
            title: "قيمة المخزون",
            value: `${inventoryValue.toFixed(2)} ${settings.currency}`,
            icon: TrendingUp,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/30",
            link: "/products",
            sensitive: true,
          },
        ]
      : []),
  ];

  const filterLabels: Record<TimeFilter, string> = {
    day: 'اليوم',
    week: 'أسبوع',
    month: 'شهر',
  };

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
            onClick={() => navigate(stat.link)}
            className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 cursor-pointer"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </p>
              <h3 className={`text-2xl font-bold text-zinc-900 dark:text-white mt-1 ${stat.sensitive ? 'sensitive' : ''}`}>
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sales Analysis + Recent Orders */}
      <div className={`grid grid-cols-1 ${layout.showChart !== false && layout.showRecentOrders !== false ? 'lg:grid-cols-4' : layout.showChart !== false || layout.showRecentOrders !== false ? 'lg:grid-cols-2' : ''} gap-6`}>
        {layout.showChart !== false && (
          <div className={`${layout.showRecentOrders !== false ? 'lg:col-span-2' : 'lg:col-span-full'} bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                تحليل المبيعات
              </h3>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
                {(Object.keys(filterLabels) as TimeFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === f
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                  >
                    {filterLabels[f]}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full" style={{ height: 300, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e4e4e7"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
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

            {/* Top Selling Products */}
            {topProducts.length > 0 && (
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  أكثر المنتجات مبيعاً ({filterLabels[timeFilter]})
                </h4>
                <div className="space-y-2">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">{p.qty} قطعة</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.revenue.toFixed(2)} {settings.currency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Orders */}
        {layout.showRecentOrders !== false && (
          <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
              أحدث الطلبات
            </h3>
            <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-sm text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="pb-4 font-medium">المنتجات</th>
                  <th className="pb-4 font-medium">العميل</th>
                  <th className="pb-4 font-medium text-left">الإجمالي</th>
                  <th className="pb-4 font-medium text-left">الربح</th>
                  <th className="pb-4 font-medium text-center">الحالة</th>
                  <th className="pb-4 font-medium text-left">الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {orders.slice(0, 10).map((order) => {
                  const profit = order.profit ?? order.items.reduce((sum, item) => sum + ((item.customPrice ?? item.price) - item.costPrice) * item.quantity, 0);
                  const itemsSummary = order.items.map(i => i.name).join('، ');

                  const profitColor = profit > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : profit < 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400";

                  return (
                    <tr key={order.id} className="text-sm group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-4">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[250px] leading-relaxed break-words" title={itemsSummary}>
                          {itemsSummary}
                        </p>
                      </td>
                      <td className="py-4">
                        <p className="text-zinc-600 dark:text-zinc-400">{order.cashierName || "غير معروف"}</p>
                      </td>
                      <td className="py-4 text-left font-bold text-zinc-900 dark:text-white">
                        {order.total.toFixed(2)}
                      </td>
                      <td className={`py-4 text-left font-bold sensitive ${profitColor}`}>
                        {profit.toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-sm border ${order.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" :
                            order.status === "cancelled" ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800" :
                              "bg-zinc-50 text-zinc-700 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                            }`}>
                            {order.status === "completed" ? <CheckCircle2 size={12} className="shrink-0" /> :
                              order.status === "cancelled" ? <XCircle size={12} className="shrink-0" /> :
                                order.status === "shipped" ? <Truck size={12} className="shrink-0" /> :
                                  order.status === "returned" ? <RotateCcw size={12} className="shrink-0" /> :
                                    <Clock size={12} className="shrink-0" />}
                            <span>
                              {order.status === "completed" ? "مكتمل" :
                                order.status === "cancelled" ? "ملغي" :
                                  order.status === "pending" ? "انتظار" :
                                    order.status === "processing" ? "تجهيز" :
                                      order.status === "shipped" ? "شحن" :
                                        order.status === "returned" ? "مرجع" : order.status}
                            </span>
                          </span>

                          <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 uppercase">
                            {order.paymentMethod === 'cash' ? <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900"><Wallet size={10} className="text-emerald-500" /> كاش</div> :
                              order.paymentMethod === 'card' ? <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900"><CreditCard size={10} className="text-blue-500" /> بطاقة</div> :
                                order.paymentMethod === 'debt' ? <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900"><Users size={10} className="text-rose-500" /> آجل</div> :
                                  <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800"> {order.paymentMethod}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-left">
                        <p className="font-bold text-zinc-900 dark:text-white text-xs">#{order.dailyNumber || order.id.slice(-4)}</p>
                        <p className="text-[10px] text-zinc-500">{new Date(order.date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* System Logs (History) */}
      {layout.showRecentOrders !== false && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 mt-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
            سجل النشاطات (History)
          </h3>
          <div className="space-y-4">
            {(logs || []).slice(0, 8).map((log) => (
              <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 group hover:shadow-md transition-all">
                <div className={`p-2 rounded-lg h-fit ${log.type === 'sale' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                  log.type === 'inventory' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                  log.type === 'security' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' :
                    'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                  }`}>
                  {log.type === 'sale' ? <ShoppingBag size={18} /> : 
                   log.type === 'security' ? <ShieldAlert size={18} /> :
                   <Package size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white">{log.action}</h4>
                    <span className="text-xs text-zinc-500 font-mono" dir="ltr">{log.date}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{log.details}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      {log.userName.charAt(0)}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">{log.userName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
