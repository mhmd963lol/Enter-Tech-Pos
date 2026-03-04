import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Package,
  Truck,
  Save,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import NumberInput from "../components/NumberInput";
import { Product, PurchaseItem } from "../types";
import toast from "react-hot-toast";

export default function NewPurchase() {
  const { products, categories, suppliers, addPurchaseInvoice, settings } =
    useAppContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");

  const filteredProducts = products.filter((p) => {
    const category =
      categories.find((c) => c.id === p.categoryId) ||
      categories.find((c) => c.name === p.category);
    const isCategoryActive = category ? category.isActive : true;
    return (
      (p.isActive ?? true) &&
      isCategoryActive &&
      p.trackInventory !== false &&
      (p.name.includes(searchTerm) || p.barcode.includes(searchTerm))
    );
  });

  const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
  const tax = settings.enableTax ? subtotal * (settings.taxRate / 100) : 0;
  const grandTotal = subtotal + tax;

  const handleAddItem = (product: Product) => {
    setPurchaseItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.costPrice,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: `pi-${Math.random().toString(36).substring(7)}`,
          productId: product.id,
          name: product.name,
          quantity: 1,
          costPrice: product.costPrice,
          total: product.costPrice,
        },
      ];
    });
  };

  const handleRemoveItem = (id: string) => {
    setPurchaseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: "quantity" | "costPrice",
    value: number,
  ) => {
    if (value < 0) return;
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          newItem.total = newItem.quantity * newItem.costPrice;
          return newItem;
        }
        return item;
      }),
    );
  };

  const handleSubmit = (status: "pending" | "completed") => {
    if (!selectedSupplierId) {
      toast.error("الرجاء اختيار المورد");
      return;
    }
    if (purchaseItems.length === 0) {
      toast.error("الرجاء إضافة منتجات للفاتورة");
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);

    addPurchaseInvoice({
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || "مورد غير معروف",
      date: new Date().toISOString(),
      items: purchaseItems,
      subtotal,
      tax,
      total: grandTotal,
      amountPaid: amountPaid ? Number(amountPaid) : 0,
      status,
      notes,
    });

    toast.success("تم حفظ فاتورة المشتريات بنجاح");
    navigate("/purchases");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/purchases")}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              إنشاء فاتورة مشتريات
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              إضافة بضاعة جديدة للمخزون.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit("pending")}
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold transition-all"
          >
            حفظ كمسودة
          </button>
          <button
            onClick={() => handleSubmit("completed")}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Save className="w-5 h-5" />
            اعتماد الفاتورة
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden px-4 md:px-8">
        {/* Products Search & List */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث باسم المنتج أو الباركود..."
                className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex flex-col items-center text-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md bg-white dark:bg-zinc-950 cursor-pointer transition-all"
                  onClick={() => handleAddItem(product)}
                >
                  <div className="w-20 h-20 mb-3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-auto">
                    التكلفة الحالية: {product.costPrice} {settings.currency}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    المخزون المتوفر: {product.stock}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Details Panel */}
        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden shrink-0">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                <Truck className="w-4 h-4" /> المورد
              </label>
              <select
                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                <option value="">اختر المورد...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (
                    {s.balance > 0
                      ? `مستحقات: ${s.balance}`
                      : `رصيدنا: ${Math.abs(s.balance)}`}
                    )
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {purchaseItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 space-y-2">
                <Package className="w-12 h-12 opacity-20" />
                <p>لم يتم إضافة منتجات للفاتورة</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {purchaseItems.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ duration: 0.2 }}
                    key={item.id}
                    className="flex flex-col gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-zinc-500">
                          الكمية المستلمة
                        </label>
                        <div className="flex items-center mt-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                          <button
                            onClick={() =>
                              handleUpdateItem(
                                item.id,
                                "quantity",
                                item.quantity - 1,
                              )
                            }
                            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            className="w-full text-center bg-transparent border-none focus:ring-0 text-sm py-1 md:py-1 outline-none dark:text-white"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              handleUpdateItem(
                                item.id,
                                "quantity",
                                item.quantity + 1,
                              )
                            }
                            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">
                          سعر التكلفة للوحدة
                        </label>
                        <NumberInput
                          value={item.costPrice}
                          onChange={(val) =>
                            handleUpdateItem(item.id, "costPrice", Number(val))
                          }
                          className="w-full mt-1 px-2 py-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-indigo-500 dark:text-white"
                          min="0"
                          step="0.01"
                          allowDecimal
                          hideControls
                        />
                      </div>
                    </div>
                    <div className="text-left font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      الإجمالي: {item.total.toFixed(2)} {settings.currency}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Totals Panel */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>المجموع الفرعي</span>
                <span>
                  {subtotal.toFixed(2)} {settings.currency}
                </span>
              </div>
              {settings.enableTax && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>الضريبة ({settings.taxRate}%)</span>
                  <span>
                    {tax.toFixed(2)} {settings.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>المبلغ الإجمالي</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {grandTotal.toFixed(2)} {settings.currency}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                المبلغ المدفوع للمورد (حتى الآن)
              </label>
              <NumberInput
                value={amountPaid}
                onChange={(val) => setAmountPaid(val)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="0.00"
                min="0"
                step="0.01"
                allowDecimal
              />
              <p className="text-xs text-zinc-500 mt-1">
                الباقي سيتم تسجيله كمديونية للمورد:{" "}
                <span className="font-bold text-amber-600">
                  {(grandTotal - (Number(amountPaid) || 0)).toFixed(2)}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <input
                type="text"
                placeholder="ملاحظات على الفاتورة (اختياري)"
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
