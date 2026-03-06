import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  ShoppingCart,
  X,
  Package,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  XCircle,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Folder,
  ArrowRight,
  Settings2,
  LayoutGrid,
  Grid3X3,
  Calculator,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import NumberInput from "../components/NumberInput";
import AddMaintenanceJobModal from "../components/AddMaintenanceJobModal";
import QuickAddCustomerModal from "../components/QuickAddCustomerModal";
import CustomKeypad from "../components/CustomKeypad";

export default function POS() {
  const {
    products,
    categories,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    checkout,
    settings,
    updateCartItemPrice,
    user,
    maintenanceJobs,
    customers,
    playSound,
    exchangeRate,
    isRateLive,
    refreshExchangeRate,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "debt" | "split"
  >("cash");
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Maintenance Modal State
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Maintenance panel collapse state
  const [isMaintenanceExpanded, setIsMaintenanceExpanded] = useState(false);

  // POS Display States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<"large" | "small">("large");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Keypad State
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [activeKeypadInput, setActiveKeypadInput] = useState<"amountPaid" | "splitCash" | "splitCard" | null>("amountPaid");

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingPriceUpdate, setPendingPriceUpdate] = useState<{
    id: string;
    price: number;
  } | null>(null);

  const filteredProducts = products.filter((p) => {
    const category =
      categories.find((c) => c.id === p.categoryId) ||
      categories.find((c) => c.name === p.category);
    const isCategoryActive = category ? category.isActive : true;

    if (p.isActive === false || !isCategoryActive) return false;

    if (searchTerm) {
      return p.name.includes(searchTerm) || p.barcode.includes(searchTerm);
    }

    if (selectedCategoryId) {
      return category?.id === selectedCategoryId || p.categoryId === selectedCategoryId;
    }

    return false; // Show nothing if no search and no category is selected (we will render categories instead)
  });

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.customPrice ?? item.price) * item.quantity,
    0,
  );
  const tax = settings.enableTax ? cartTotal * (settings.taxRate / 100) : 0;
  const grandTotal = cartTotal + tax;
  const change = amountPaid ? Math.max(0, Number(amountPaid) - grandTotal) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let finalAmountPaid = grandTotal;
    let splitDetails = undefined;

    if (paymentMethod === "debt") {
      finalAmountPaid = amountPaid ? Number(amountPaid) : 0;
    } else if (paymentMethod === "cash") {
      finalAmountPaid = amountPaid ? Number(amountPaid) : grandTotal;
    } else if (paymentMethod === "card") {
      finalAmountPaid = grandTotal; // Usually exact amount for card
    } else if (paymentMethod === "split") {
      finalAmountPaid = Number(splitCash) + Number(splitCard);
      splitDetails = { cash: Number(splitCash), card: Number(splitCard) };
    }

    checkout(
      paymentMethod,
      customerName,
      selectedCustomerId,
      finalAmountPaid,
      splitDetails,
    );
    setCustomerName("");
    setSelectedCustomerId("");
    setAmountPaid("");
    setSplitCash("");
    setSplitCard("");
    setPaymentMethod("cash");
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (
      settings.preventBelowCost &&
      newPrice < item.costPrice &&
      user?.role !== "admin"
    ) {
      setPendingPriceUpdate({ id, price: newPrice });
      setShowPinModal(true);
      setPinError("");
      setPinInput("");
    } else {
      updateCartItemPrice(id, newPrice);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin) {
      if (pendingPriceUpdate) {
        updateCartItemPrice(pendingPriceUpdate.id, pendingPriceUpdate.price);
      }
      setShowPinModal(false);
      setPendingPriceUpdate(null);
    } else {
      setPinError("رمز PIN غير صحيح");
    }
  };

  const handleKeypadPress = (key: string) => {
    if (!activeKeypadInput) return;
    const setter = activeKeypadInput === "amountPaid" ? setAmountPaid : activeKeypadInput === "splitCash" ? setSplitCash : setSplitCard;
    const currentVal = activeKeypadInput === "amountPaid" ? amountPaid : activeKeypadInput === "splitCash" ? splitCash : splitCard;

    if (key === '.' && currentVal.includes('.')) return;
    setter(currentVal + key);
  };

  const handleKeypadClear = () => {
    if (!activeKeypadInput) return;
    const setter = activeKeypadInput === "amountPaid" ? setAmountPaid : activeKeypadInput === "splitCash" ? setSplitCash : setSplitCard;
    const currentVal = activeKeypadInput === "amountPaid" ? amountPaid : activeKeypadInput === "splitCash" ? splitCash : splitCard;
    setter(currentVal.slice(0, -1));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-0" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="relative flex-1">
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
            {!searchTerm && (
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 shrink-0">
                <button
                  onClick={() => setGridSize("small")}
                  className={`p - 2 rounded - md transition - colors ${gridSize === "small"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    } `}
                  title="تصغير العناصر"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridSize("large")}
                  className={`p - 2 rounded - md transition - colors ${gridSize === "large"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    } `}
                  title="تكبير العناصر"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {/* If NO search term, and NO category selected -> show Categories as Folders */}
            {!searchTerm && !selectedCategoryId && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.filter(c => c.isActive).map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="flex flex-col items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl transition-colors gap-3"
                  >
                    <Folder className="w-12 h-12 text-indigo-500 dark:text-indigo-400" fill="currentColor" fillOpacity={0.2} />
                    <span className="font-bold text-zinc-900 dark:text-white text-center line-clamp-2">
                      {category.name}
                    </span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-950 px-2 py-1 rounded-full shadow-sm">
                      {products.filter(p => (p.categoryId === category.id || p.category === category.name) && p.isActive !== false).length} صنف
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* If NO search term, but category IS selected -> show Back button + Products */}
            {!searchTerm && selectedCategoryId && (
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors font-medium text-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  رجوع للأقسام
                </button>
                <h3 className="font-bold text-zinc-900 dark:text-white mr-2">
                  {categories.find(c => c.id === selectedCategoryId)?.name}
                </h3>
              </div>
            )}

            {/* Render Products Grid */}
            {(searchTerm || selectedCategoryId) && (
              <div
                className={`grid gap - 4 ${gridSize === "large"
                  ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  } `}
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{
                      scale:
                        product.trackInventory === false || product.stock > 0
                          ? 1.02
                          : 1,
                    }}
                    whileTap={{
                      scale:
                        product.trackInventory === false || product.stock > 0
                          ? 0.98
                          : 1,
                    }}
                    className={`relative flex flex - col items - center text - center p - 4 rounded - 2xl border transition - all ${product.trackInventory !== false && product.stock === 0
                      ? "opacity-50 cursor-not-allowed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md bg-white dark:bg-zinc-950 cursor-pointer"
                      } `}
                    onClick={() => {
                      if (product.trackInventory === false || product.stock > 0)
                        addToCart(product);
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/products");
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors z-10"
                      title="الذهاب للمخزون"
                    >
                      <Package className="w-4 h-4" />
                    </button>
                    {product.trackInventory !== false && product.stock === 0 && (
                      <div
                        className="absolute top-2 left-2 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg z-10"
                        title="نفاد الكمية"
                      >
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                    {product.trackInventory !== false &&
                      product.stock > 0 &&
                      product.stock <= (product.minStockAlert || 5) && (
                        <div
                          className="absolute top-2 left-2 p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg z-10"
                          title="كمية منخفضة"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                    <div className="w-24 h-24 mb-3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-auto">
                      {product.price} {settings.currency}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      المخزون:{" "}
                      {product.trackInventory === false ? "∞" : product.stock}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Overlay */}
        <AnimatePresence>
          {isMobileCartOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Cart Section */}
        <div
          className={`
w - full lg: w - 96 flex flex - col bg - white dark: bg - zinc - 950 shadow - sm border border - zinc - 100 dark: border - zinc - 800 shrink - 0
            fixed lg:relative lg:flex lg: rounded - 2xl min - h - 0 lg: max - h - full
bottom - 0 left - 0 right - 0 z - 50 lg: z - auto rounded - t - 3xl lg: rounded - b - 2xl
transition - transform duration - 300 ease - [cubic - bezier(0.32, 0.72, 0, 1)]
            ${isMobileCartOpen ? 'translate-y-0 h-[85vh]' : 'translate-y-full lg:translate-y-0'}
`}
        >
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-zinc-900 dark:text-white">
                سلة المشتريات
              </h2>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 py-0.5 px-2 rounded-full text-xs font-bold mr-auto">
                {cart.length}
              </span>
              <button
                onClick={() => setIsKeypadOpen(!isKeypadOpen)}
                className={`p - 1.5 rounded - lg transition - colors ${isKeypadOpen ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"} `}
                title="لوحة الأرقام السريعة"
              >
                <Calculator className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 space-y-2">
                <ShoppingCart className="w-12 h-12 opacity-20" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      x: -20,
                      backgroundColor: "#fee2e2",
                    }}
                    transition={{ duration: 0.2 }}
                    key={item.id}
                    className="flex flex-col gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <NumberInput
                            value={item.customPrice ?? item.price}
                            onChange={(val) =>
                              handlePriceChange(item.id, Number(val))
                            }
                            className="w-24 px-2 py-1 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white text-left font-mono"
                            min="0"
                            step="0.01"
                            allowDecimal
                            hideControls
                          />
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {settings.currency}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {(
                          (item.customPrice ?? item.price) * item.quantity
                        ).toFixed(2)}{" "}
                        {settings.currency}
                      </p>
                      <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full p-1 border border-zinc-200/50 dark:border-zinc-700/50">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-full shadow-sm transition-all text-zinc-500 dark:text-zinc-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-10">
                          <NumberInput
                            value={item.quantity}
                            onChange={(val) => updateCartQuantity(item.id, parseInt(val) || 1)}
                            className="w-full text-center bg-transparent border-none focus:ring-0 dark:text-white font-bold p-0 text-sm"
                            min="1"
                            hideControls
                          />
                        </div>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full shadow-sm transition-all text-zinc-500 dark:text-zinc-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Checkout Panel */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>المجموع الفرعي</span>
                <span>
                  {cartTotal.toFixed(2)} {settings.currency}
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

              {/* Added mini Status Bar Info */}
              <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px]" dir="ltr">
                    {currentTime.toLocaleTimeString('ar-EG', { hour12: true, hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>{currentTime.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
                <button
                  onClick={() => !isRateLive && refreshExchangeRate()}
                  title={isRateLive ? `سعر مباشر` : `⚠️ سعر غير محدث – انقر للتحديث`}
                  className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] transition-colors ${isRateLive
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                      : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:bg-amber-100"
                    }`}
                  dir="ltr"
                >
                  {!isRateLive && <span title="سعر غير محدث">⚠️</span>}
                  <span>$</span>1.00 = <span>₺</span>
                  {exchangeRate > 0 ? exchangeRate.toFixed(2) : "–"}
                </button>
              </div>

              <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>الإجمالي</span>
                <span className="text-indigo-600 dark:text-indigo-400 privacy-blur">
                  {grandTotal.toFixed(2)} {settings.currency}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedCustomerId(id);
                      const customer = customers.find((c) => c.id === id);
                      if (customer) setCustomerName(customer.name);
                    }}
                  >
                    <option value="">اختر عميل مسجل...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.balance} {settings.currency})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors shrink-0 border border-indigo-100 dark:border-indigo-800"
                    title="إضافة عميل جديد"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="أو ادخل اسم عميل جديد..."
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={!!selectedCustomerId}
                  />
                  {customerName && !selectedCustomerId && (
                    <button
                      onClick={() => setCustomerName("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex flex - col items - center justify - center gap - 1 py - 2 rounded - xl border text - xs font - medium transition - colors ${paymentMethod === "cash"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    } `}
                >
                  <Banknote className="w-4 h-4" />
                  كاش
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex - col items - center justify - center gap - 1 py - 2 rounded - xl border text - xs font - medium transition - colors ${paymentMethod === "card"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    } `}
                >
                  <CreditCard className="w-4 h-4" />
                  شبكة
                </button>
                <button
                  onClick={() => setPaymentMethod("debt")}
                  className={`flex flex - col items - center justify - center gap - 1 py - 2 rounded - xl border text - xs font - medium transition - colors ${paymentMethod === "debt"
                    ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    } `}
                >
                  <ShieldAlert className="w-4 h-4" />
                  آجل
                </button>
                <button
                  onClick={() => setPaymentMethod("split")}
                  className={`flex flex - col items - center justify - center gap - 1 py - 2 rounded - xl border text - xs font - medium transition - colors ${paymentMethod === "split"
                    ? "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    } `}
                >
                  <div className="flex -space-x-2">
                    <Banknote className="w-4 h-4 z-10" />
                    <CreditCard className="w-4 h-4" />
                  </div>
                  مقسم
                </button>
              </div>

              {(paymentMethod === "cash" || paymentMethod === "debt") && (
                <div className="space-y-2">
                  <div className="relative">
                    <NumberInput
                      value={amountPaid}
                      onChange={(val) => setAmountPaid(val)}
                      onFocus={() => setActiveKeypadInput("amountPaid")}
                      className={`w - full px - 4 py - 2 bg - white dark: bg - zinc - 950 border rounded - xl text - sm focus: outline - none transition - colors ${activeKeypadInput === "amountPaid" && isKeypadOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500"} dark: text - white`}
                      placeholder={
                        paymentMethod === "debt"
                          ? "المبلغ المدفوع مقدماً (اختياري)"
                          : "المبلغ المستلم"
                      }
                      min="0"
                      step="0.01"
                      allowDecimal
                    />
                  </div>
                  {paymentMethod === "cash" &&
                    amountPaid &&
                    Number(amountPaid) >= grandTotal && (
                      <div className="flex justify-between text-sm p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
                        <span>الباقي للعميل:</span>
                        <span className="font-bold">
                          {change.toFixed(2)} {settings.currency}
                        </span>
                      </div>
                    )}
                  {paymentMethod === "debt" && (
                    <div className="flex justify-between text-sm p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg">
                      <span>المبلغ المتبقي كدين:</span>
                      <span className="font-bold">
                        {(grandTotal - (Number(amountPaid) || 0)).toFixed(2)}{" "}
                        {settings.currency}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "split" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      value={splitCash}
                      onChange={(val) => setSplitCash(val)}
                      onFocus={() => setActiveKeypadInput("splitCash")}
                      className={`w - full px - 4 py - 2 bg - white dark: bg - zinc - 950 border rounded - xl text - sm focus: outline - none transition - colors ${activeKeypadInput === "splitCash" && isKeypadOpen ? "border-purple-500 ring-2 ring-purple-500/20" : "border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500"} dark: text - white`}
                      placeholder="مبلغ الكاش"
                      min="0"
                      step="0.01"
                      allowDecimal
                    />
                    <NumberInput
                      value={splitCard}
                      onChange={(val) => setSplitCard(val)}
                      onFocus={() => setActiveKeypadInput("splitCard")}
                      className={`w - full px - 4 py - 2 bg - white dark: bg - zinc - 950 border rounded - xl text - sm focus: outline - none transition - colors ${activeKeypadInput === "splitCard" && isKeypadOpen ? "border-purple-500 ring-2 ring-purple-500/20" : "border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500"} dark: text - white`}
                      placeholder="مبلغ الشبكة"
                      min="0"
                      step="0.01"
                      allowDecimal
                    />
                  </div>
                  {Number(splitCash) + Number(splitCard) < grandTotal && (
                    <p className="text-xs text-red-500">
                      مجموع المبلغ أقل من الإجمالي (
                      {(
                        grandTotal -
                        (Number(splitCash) + Number(splitCard))
                      ).toFixed(2)}{" "}
                      متبقي)
                    </p>
                  )}
                  {Number(splitCash) + Number(splitCard) >= grandTotal && (
                    <div className="flex justify-between text-sm p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
                      <span>الباقي للعميل (كاش):</span>
                      <span className="font-bold">
                        {(
                          Number(splitCash) +
                          Number(splitCard) -
                          grandTotal
                        ).toFixed(2)}{" "}
                        {settings.currency}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={
                  cart.length === 0 ||
                  (paymentMethod === "cash" &&
                    amountPaid !== "" &&
                    Number(amountPaid) < grandTotal) ||
                  (paymentMethod === "debt" &&
                    !selectedCustomerId &&
                    !customerName) ||
                  (paymentMethod === "split" &&
                    Number(splitCash) + Number(splitCard) < grandTotal)
                }
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                {paymentMethod === "debt"
                  ? "إتمام البيع الآجل"
                  : paymentMethod === "split"
                    ? "دفع مقسم وإصدار"
                    : "دفع وإصدار الفاتورة"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Toggle Floating Button */}
      {!isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30 pointer-events-none">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (playSound) playSound("click");
              setIsMobileCartOpen(true);
            }}
            className="w-full py-4 bg-indigo-600 shadow-xl rounded-2xl text-white font-bold flex items-center justify-between px-6 pointer-events-auto shadow-indigo-500/30"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <span>عرض السلة</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {cart.length} أصناف
              </div>
              <span className="text-lg">
                {grandTotal.toFixed(2)} {settings.currency}
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-center text-zinc-900 dark:text-white mb-2">
                  صلاحية مدير مطلوبة
                </h3>
                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                  السعر المدخل أقل من سعر التكلفة. يرجى إدخال رمز PIN للمدير
                  للموافقة.
                </p>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      maxLength={4}
                      autoFocus
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-center tracking-widest text-2xl"
                      placeholder="••••"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                    />
                    {pinError && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {pinError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPinModal(false);
                        setPendingPriceUpdate(null);
                      }}
                      className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                    >
                      تأكيد
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Quick View - Collapsible */}
      <div className="mt-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 shrink-0">
        <button
          onClick={() => setIsMaintenanceExpanded(!isMaintenanceExpanded)}
          className="w-full flex items-center justify-between p-3 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors rounded-2xl"
        >
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            استعلام الصيانة السريع
            {maintenanceJobs.length > 0 && (
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 py-0.5 px-2 rounded-full text-xs font-bold">
                {maintenanceJobs.length}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {isMaintenanceExpanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {isMaintenanceExpanded && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => navigate("/maintenance")}
                className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-colors"
              >
                عرض الكل
              </button>
              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                استلام جهاز
              </button>
            </div>
            <div className="table-responsive-wrapper">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="pb-2 font-medium w-[28%]">العميل</th>
                    <th className="pb-2 font-medium w-[32%]">الجهاز</th>
                    <th className="pb-2 font-medium w-[22%]">الحالة</th>
                    <th className="pb-2 font-medium w-[18%]">التكلفة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {maintenanceJobs.slice(0, 3).map((job) => (
                    <tr key={job.id} className="text-zinc-700 dark:text-zinc-300">
                      <td className="py-2 whitespace-normal">{job.customerName}</td>
                      <td className="py-2 whitespace-normal">{job.device}</td>
                      <td className="py-2">
                        {job.status === "pending" && (
                          <span className="text-amber-600 dark:text-amber-400">
                            قيد الانتظار
                          </span>
                        )}
                        {job.status === "in_progress" && (
                          <span className="text-blue-600 dark:text-blue-400">
                            جاري العمل
                          </span>
                        )}
                        {job.status === "ready" && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            جاهز للتسليم
                          </span>
                        )}
                        {job.status === "paid" && (
                          <span className="text-purple-600 dark:text-purple-400">
                            تم الدفع والتسليم
                          </span>
                        )}
                      </td>
                      <td className="py-2 font-medium">
                        {job.cost} {settings.currency}
                      </td>
                    </tr>
                  ))}
                  {maintenanceJobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-zinc-500">
                        لا توجد أجهزة في الصيانة حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddMaintenanceJobModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
      />

      <QuickAddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={(id, name) => {
          setCustomerName(name);
          // If we had the actual object we could set selectedCustomerId(id)
          // but just setting the name for the invoice is enough for a quick sale.
        }}
      />

      <CustomKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onKeyPress={handleKeypadPress}
        onClear={handleKeypadClear}
        onEnter={handleCheckout}
        title={activeKeypadInput === 'amountPaid' ? 'المبلغ المستلم' : activeKeypadInput === 'splitCash' ? 'مبلغ الكاش' : 'مبلغ الشبكة'}
        value={activeKeypadInput === 'amountPaid' ? amountPaid : activeKeypadInput === 'splitCash' ? splitCash : splitCard}
      />
    </div>
  );
}
