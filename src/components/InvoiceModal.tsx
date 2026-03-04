import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Printer } from "lucide-react";
import { Order, Settings } from "../types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  settings: Settings;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  order,
  settings,
}: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && order && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                تفاصيل الفاتورة #{order.id}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="طباعة"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" id="printable-invoice">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {settings.storeName}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {settings.receiptHeader}
                </p>
              </div>

              <div className="flex justify-between items-start mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    رقم الفاتورة
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {order.id}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    التاريخ
                  </p>
                  <p
                    className="font-medium text-zinc-900 dark:text-white"
                    dir="ltr"
                  >
                    {new Date(order.date).toLocaleString("ar-SA")}
                  </p>
                </div>
              </div>

              {order.customerName && (
                <div className="mb-8">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    العميل
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {order.customerName}
                  </p>
                </div>
              )}

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                    <th className="text-right py-2 font-medium">الصنف</th>
                    <th className="text-center py-2 font-medium">الكمية</th>
                    <th className="text-left py-2 font-medium">السعر</th>
                    <th className="text-left py-2 font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 text-zinc-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 text-center text-zinc-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td
                        className="py-3 text-left text-zinc-900 dark:text-white"
                        dir="ltr"
                      >
                        {(item.customPrice ?? item.price).toFixed(2)}
                      </td>
                      <td
                        className="py-3 text-left font-medium text-zinc-900 dark:text-white"
                        dir="ltr"
                      >
                        {(
                          (item.customPrice ?? item.price) * item.quantity
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="w-full max-w-xs mr-auto space-y-3">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>المجموع الفرعي</span>
                  <span dir="ltr">
                    {order.subtotal.toFixed(2)} {settings.currency}
                  </span>
                </div>
                {settings.enableTax && (
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>الضريبة ({settings.taxRate}%)</span>
                    <span dir="ltr">
                      {order.tax.toFixed(2)} {settings.currency}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span>الإجمالي</span>
                  <span dir="ltr">
                    {order.total.toFixed(2)} {settings.currency}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-500 dark:text-zinc-400 pt-2">
                  <span>المبلغ المدفوع</span>
                  <span dir="ltr">
                    {order.amountPaid.toFixed(2)} {settings.currency}
                  </span>
                </div>

                {order.total - order.amountPaid > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold pt-1">
                    <span>المبلغ المتبقي (دين)</span>
                    <span dir="ltr">
                      {(order.total - order.amountPaid).toFixed(2)}{" "}
                      {settings.currency}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-zinc-500 dark:text-zinc-400">
                  {settings.receiptFooter}
                </p>
              </div>
            </div>
          </motion.div>
          {/* Print-only styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible;
              }
              #printable-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                background: white;
                color: black;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
