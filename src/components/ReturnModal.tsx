import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, RotateCcw, Package } from "lucide-react";
import { Order, CartItem } from "../types";
import { useAppContext } from "../context/AppContext";
import NumberInput from "./NumberInput";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function ReturnModal({
  isOpen,
  onClose,
  order,
}: ReturnModalProps) {
  const { addReturn, updateOrderStatus, addNotification } = useAppContext();
  const [returnItems, setReturnItems] = useState<
    { id: string; quantity: number }[]
  >([]);
  const [returnType, setReturnType] = useState<"inventory" | "defective">(
    "inventory",
  );

  // Reset state when opening a new order
  React.useEffect(() => {
    if (isOpen && order) {
      setReturnItems(order.items.map((i) => ({ id: i.id, quantity: 0 })));
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleUpdateQuantity = (
    itemId: string,
    qty: number,
    maxQty: number,
  ) => {
    const validQty = Math.min(Math.max(0, qty), maxQty);
    setReturnItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: validQty } : item,
      ),
    );
  };

  const handleReturnAmount = () => {
    return returnItems.reduce((total, retItem) => {
      const originalItem = order.items.find((i) => i.id === retItem.id);
      if (!originalItem) return total;
      return (
        total +
        (originalItem.customPrice ?? originalItem.price) * retItem.quantity
      );
    }, 0);
  };

  const isFullReturn = () => {
    return returnItems.every((retItem) => {
      const originalItem = order.items.find((i) => i.id === retItem.id);
      return originalItem && retItem.quantity === originalItem.quantity;
    });
  };

  const totalReturnAmount = handleReturnAmount();

  const submitReturn = () => {
    const itemsToReturn = returnItems.filter((i) => i.quantity > 0);

    if (itemsToReturn.length === 0) {
      addNotification({
        title: "تنبيه",
        message: "الرجاء تحديد كمية المنتجات المراد استرجاعها",
        type: "warning",
      });
      return;
    }

    if (isFullReturn()) {
      // Full return - update status to returned
      updateOrderStatus(order.id, "returned");
    } else {
      // Process individual returns
      itemsToReturn.forEach((retItem) => {
        const originalItem = order.items.find((i) => i.id === retItem.id);
        if (originalItem) {
          addReturn({
            orderId: order.id,
            productId: originalItem.id,
            quantity: retItem.quantity,
            date: new Date().toISOString(),
            type: returnType,
            status:
              returnType === "inventory" ? "returned" : "pending_replacement",
            refundAmount:
              (originalItem.customPrice ?? originalItem.price) *
              retItem.quantity,
          });
        }
      });

      // We don't change the order status for partial returns, but ideally we'd mark it "partially_returned".
      // For now, we add notification.
      addNotification({
        title: "تم الاسترجاع",
        message: `تم استرجاع جزئي للفاتورة رقم ${order.id}`,
        type: "success",
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              استرجاع منتجات (فاتورة #{order.id})
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl flex items-start gap-3 border border-amber-100 dark:border-amber-800/50">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                  المرتجعات الجزئية
                </p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                  حدد المنتج والكمية التي تريد إرجاعها. سيتم حساب المتبقي
                  تلقائياً. إذا أرجعت كل المنتجات، ستتغير حالة الفاتورة لـ
                  "مسترجع".
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => {
                const retItem = returnItems.find((r) => r.id === item.id);
                const currentQty = retItem ? retItem.quantity : 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50"
                  >
                    <div className="flex-1 w-full">
                      <p className="font-medium text-zinc-900 dark:text-white line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        الكمية الأصلية: {item.quantity} | السعر:{" "}
                        {item.customPrice ?? item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        كمية الاسترجاع:
                      </span>
                      <div className="w-24">
                        <NumberInput
                          value={currentQty}
                          onChange={(val) =>
                            handleUpdateQuantity(
                              item.id,
                              parseInt(val) || 0,
                              item.quantity,
                            )
                          }
                          min="0"
                          max={item.quantity.toString()}
                          className="w-full text-center py-1.5 focus:ring-1 focus:ring-indigo-500 text-sm"
                          hideControls
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              <p className="font-medium text-zinc-900 dark:text-white">
                خيارات الإسترجاع:
              </p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="returnType"
                    checked={returnType === "inventory"}
                    onChange={() => setReturnType("inventory")}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    إرجاع للمخزون (المنتج سليم)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="returnType"
                    checked={returnType === "defective"}
                    onChange={() => setReturnType("defective")}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    تالِف (لن يُعاد للمخزون)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl text-lg font-bold w-full text-center">
                إجمالي المرتجع: {totalReturnAmount.toFixed(2)}
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={submitReturn}
                disabled={totalReturnAmount === 0}
                className="flex-1 sm:flex-none px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors"
              >
                تأكيد الاسترجاع
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
