import React, { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Printer,
  Search,
  Plus,
  Minus,
  Trash2,
  Settings,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import Barcode from "react-barcode";

interface BarcodeItem extends Product {
  printQuantity: number;
}

export default function BarcodeGenerator() {
  const { products, settings } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<BarcodeItem[]>([]);
  const [labelWidth, setLabelWidth] = useState(40); // mm
  const [labelHeight, setLabelHeight] = useState(20); // mm
  const [showPrice, setShowPrice] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showStoreName, setShowStoreName] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(
    (p) => p.name.includes(searchTerm) || p.barcode.includes(searchTerm),
  );

  const addItem = (product: Product) => {
    if (!selectedItems.find((item) => item.id === product.id)) {
      setSelectedItems([...selectedItems, { ...product, printQuantity: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.printQuantity + delta);
          return { ...item, printQuantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة الباركود</title>
          <style>
            @page {
              size: ${labelWidth}mm ${labelHeight}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .label-container {
              width: ${labelWidth}mm;
              height: ${labelHeight}mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              box-sizing: border-box;
              padding: 2mm;
              page-break-after: always;
              overflow: hidden;
            }
            .store-name {
              font-size: 8px;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            .product-name {
              font-size: 9px;
              font-weight: 600;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
              margin-bottom: 1mm;
            }
            .barcode-svg {
              width: 80%;
              height: 8mm;
              margin-bottom: 1mm;
            }
            .barcode-text {
              font-size: 8px;
              letter-spacing: 2px;
              font-family: monospace;
            }
            .price {
              font-size: 10px;
              font-weight: bold;
              margin-top: 1mm;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Printer className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          منشئ ملصقات الباركود
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Printer className="w-5 h-5" />
          طباعة الملصقات
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings & Selected Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Card */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-zinc-400" />
              إعدادات الملصق
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    أبعاد الملصق (العرض × الارتفاع) ملم
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={labelWidth}
                      onChange={(e) => setLabelWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                    <span className="text-zinc-400">×</span>
                    <input
                      type="number"
                      value={labelHeight}
                      onChange={(e) => setLabelHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStoreName}
                    onChange={(e) => setShowStoreName(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    إظهار اسم المتجر
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    إظهار اسم المنتج
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    إظهار السعر
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Selected Items Card */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
              <h3 className="font-bold text-zinc-900 dark:text-white">
                الأصناف المحددة للطباعة
              </h3>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {selectedItems.reduce(
                  (sum, item) => sum + item.printQuantity,
                  0,
                )}{" "}
                ملصق
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {selectedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                  <Package className="w-12 h-12 opacity-20 mb-2" />
                  <p>لم يتم تحديد أي أصناف للطباعة</p>
                </div>
              ) : (
                <AnimatePresence>
                  {selectedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-zinc-900 dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-500 font-mono">
                            {item.barcode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-sm dark:text-white">
                            {item.printQuantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Search & Add */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col h-[600px] lg:h-auto">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث لإضافة منتج..."
                className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition-colors text-right"
              >
                <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    {product.barcode}
                  </p>
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {product.price} {settings.currency}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Print Container */}
      <div className="hidden">
        <div ref={printRef}>
          {selectedItems.map((item) =>
            Array.from({ length: item.printQuantity }).map((_, idx) => (
              <div key={`${item.id}-${idx}`} className="label-container">
                {showStoreName && (
                  <div className="store-name">{settings.storeName}</div>
                )}
                {showName && <div className="product-name">{item.name}</div>}
                <Barcode
                  value={item.barcode}
                  displayValue={true}
                  width={1.5}
                  height={30}
                  fontSize={10}
                  margin={0}
                  background="transparent"
                />
                {showPrice && (
                  <div className="price">
                    {item.price} {settings.currency}
                  </div>
                )}
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
