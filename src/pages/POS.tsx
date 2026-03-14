import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Users,
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
  LayoutTemplate,
  FolderOpen,
  ChevronRight,
  Check,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import NumberInput from "../components/NumberInput";
import toast from "react-hot-toast";
import AddMaintenanceJobModal from "../components/AddMaintenanceJobModal";
import QuickAddCustomerModal from "../components/QuickAddCustomerModal";
import CustomKeypad from "../components/CustomKeypad";
import { calcSubtotal, calcTax, roundMoney } from "../lib/moneyUtils";

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
    refreshExchangeRate,
    isCartOpen,
    setIsCartOpen,
    addNotification,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "debt" | "split">("cash");
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");
  const navigate = useNavigate();

  // Maintenance Modal State
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isMaintenanceExpanded, setIsMaintenanceExpanded] = useState(false);

  // POS Display States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<"large" | "small" | "tiny">("small");
  const [categoryGridSize, setCategoryGridSize] = useState<"large" | "small">("small");
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(true);
  const [isShowMoreOptions, setIsShowMoreOptions] = useState(false);

  // Keypad State
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [activeKeypadInput, setActiveKeypadInput] = useState<"amountPaid" | "splitCash" | "splitCard" | null>("amountPaid");

  // PIN states for Sell-at-Loss at checkout
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingCheckout, setPendingCheckout] = useState<{
    paymentMethod: "cash" | "card" | "debt" | "split";
    customerName?: string;
    customerId?: string;
    amountPaid?: number;
    splitDetails?: { cash: number; card: number };
  } | null>(null);
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);
  const [pendingPriceUpdate, setPendingPriceUpdate] = useState<{
    productId: string;
    newPrice: number;
  } | null>(null);

  // Auto-open cart on mount only on Desktop
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      const timer = setTimeout(() => {
        setIsCartOpen(true);
      }, 500);

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [setIsCartOpen]);

  // Alert for pending cart on leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cart.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cart]);

  // Precision-safe cart calculations with useMemo (only recalculates when cart/settings change)
  const { cartTotal, tax, grandTotal, change } = useMemo(() => {
    const total = calcSubtotal(cart);
    const t = calcTax(total, settings.taxRate, settings.enableTax);
    const grand = roundMoney(total + t);
    const ch = amountPaid ? Math.max(0, roundMoney(Number(amountPaid) - grand)) : 0;
    return { cartTotal: total, tax: t, grandTotal: grand, change: ch };
  }, [cart, settings.enableTax, settings.taxRate, amountPaid]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Check if any item is sold below cost
    const itemsBelowCost = cart.filter(item => {
      const product = products.find(p => p.id === item.id);
      return product && (item.customPrice ?? item.price) < (product.costPrice || 0);
    });

    if (itemsBelowCost.length > 0 && settings.preventBelowCost) {
      setPendingCheckout({
        paymentMethod,
        customerName,
        customerId: selectedCustomerId,
        amountPaid: Number(amountPaid) || undefined,
        splitDetails: paymentMethod === "split" ? { cash: Number(splitCash), card: Number(splitCard) } : undefined
      });
      setShowPinModal(true);
      setPinInput("");
      setPinError("");
      return;
    }

    performCheckout();
  };

  const performCheckout = () => {
    checkout(
      paymentMethod,
      customerName,
      selectedCustomerId,
      Number(amountPaid) || undefined,
      paymentMethod === "split" ? { cash: Number(splitCash), card: Number(splitCard) } : undefined
    );

    setShowSuccessCheck(true);
    if (playSound) playSound("success");

    setTimeout(() => {
      setShowSuccessCheck(false);
      setCustomerName("");
      setSelectedCustomerId("");
      setAmountPaid("");
      setSplitCash("");
      setSplitCard("");
      setIsShowMoreOptions(false);
    }, settings.disableAnimations ? 1000 : 2500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin) {
      setShowPinModal(false);
      if (pendingCheckout) {
        performCheckout();
        setPendingCheckout(null);
      } else if (pendingPriceUpdate) {
        updateCartItemPrice(pendingPriceUpdate.productId, pendingPriceUpdate.newPrice);
        setPendingPriceUpdate(null);
      }
    } else {
      setPinError("رمز PIN غير صحيح");
      if (playSound) playSound("error");
    }
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    const product = products.find(p => p.id === productId);
    if (product && newPrice < (product.costPrice || 0) && settings.preventBelowCost) {
      setPendingPriceUpdate({ productId, newPrice });
      setShowPinModal(true);
      setPinInput("");
      setPinError("");
    } else {
      updateCartItemPrice(productId, newPrice);
    }
  };

  // Global Keydown listener for focusing search input and ENTER for checkout
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleCheckout();
        return;
      }

      if (e.key === 'Enter' && !isKeypadOpen && !showPinModal && !isMaintenanceModalOpen && !isAddCustomerModalOpen && cart.length > 0) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          handleCheckout();
        }
      }

      if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [cart, handleCheckout, isKeypadOpen, showPinModal, isMaintenanceModalOpen, isAddCustomerModalOpen]);

  const handleKeypadPress = (key: string) => {
    if (!activeKeypadInput) return;
    const current = activeKeypadInput === 'amountPaid' ? amountPaid : activeKeypadInput === 'splitCash' ? splitCash : splitCard;
    const setter = activeKeypadInput === 'amountPaid' ? setAmountPaid : activeKeypadInput === 'splitCash' ? setSplitCash : setSplitCard;

    if (key === '.') {
      if (!current.includes('.')) setter(current + '.');
    } else {
      setter(current + key);
    }
  };

  const handleKeypadClear = () => {
    if (!activeKeypadInput) return;
    const setter = activeKeypadInput === 'amountPaid' ? setAmountPaid : activeKeypadInput === 'splitCash' ? setSplitCash : setSplitCard;
    setter("");
  };

  if (!user) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.isActive !== false &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategoryId || p.categoryId === selectedCategoryId || p.category === categories.find(c => c.id === selectedCategoryId)?.name),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-0" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Main Content Area */}
        <motion.div
          layout
          transition={{ duration: settings.disableAnimations ? 0.12 : 0.4 }}
          className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${settings.masterTheme === "ios-glass" ? "glass-panel" : ""} ${isCartOpen ? "lg:w-auto" : "lg:w-full"}`}
        >
          {/* Top Search & Filter Bar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="بحث عن منتج (Ctrl + /)..."
                className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                <button
                  onClick={() => setGridSize("large")}
                  className={`p-1.5 rounded-md transition-all ${gridSize === "large" ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  title="عرض كبير"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridSize("small")}
                  className={`p-1.5 rounded-md transition-all ${gridSize === "small" ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  title="عرض متوسط"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridSize("tiny")}
                  className={`p-1.5 rounded-md transition-all ${gridSize === "tiny" ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  title="عرض صغير"
                >
                  <LayoutTemplate className="w-4 h-4" />
                </button>
              </div>

              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border-r border-zinc-200 dark:border-zinc-800 pr-2 ml-1">
                <button
                  onClick={() => setIsCategorySidebarOpen(!isCategorySidebarOpen)}
                  className={`p-1.5 rounded-md transition-all ${isCategorySidebarOpen ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  title="عرض/إخفاء الأقسام"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCategoryGridSize(categoryGridSize === "large" ? "small" : "large")}
                  className="p-1.5 rounded-md transition-all text-zinc-500 hover:text-zinc-700"
                  title="تبديل حجم أيقونات الأقسام"
                >
                  {categoryGridSize === "large" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition-colors"
                title="طلب صيانة جديد"
              >
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-bold">صيانة</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Quick View Maintenance (Optional/Simplified) */}
            <AnimatePresence>
              {isMaintenanceExpanded && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  className="absolute top-0 left-0 right-0 z-20 bg-amber-50/95 dark:bg-amber-900/95 border-b border-amber-200 dark:border-amber-800 p-4 backdrop-blur-md"
                >
                  <p className="text-xs font-bold text-amber-700 mb-2">طلبات الصيانة النشطة</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {maintenanceJobs.filter(j => j.status !== "delivered").map(job => (
                      <div key={job.id} className="min-w-[180px] p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-amber-200">
                        <p className="text-xs font-bold truncate">{job.customerName}</p>
                        <p className="text-[10px] text-zinc-500">{job.deviceModel}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable Products & Categories Grid */}
            <div className="flex-1 overflow-auto p-4 pb-24 lg:pb-4 custom-scrollbar">
              <AnimatePresence>
                {!searchTerm && !selectedCategoryId && isCategorySidebarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`grid gap-4 mb-6 ${categoryGridSize === "small"
                      ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"}`}
                  >
                    {categories.filter(c => c.isActive).map((category) => (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`group flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl transition-all gap-2 category-item-hover ${categoryGridSize === "small" ? "p-3" : "p-6"} ${settings.masterTheme === "ios-glass" ? "glass-card liquid-morph" : ""}`}
                      >
                        <Folder className={`${categoryGridSize === "small" ? "w-8 h-8" : "w-12 h-12"} text-indigo-500 dark:text-indigo-400`} fill="currentColor" fillOpacity={0.2} />
                        <span className={`font-bold text-zinc-900 dark:text-white text-center line-clamp-1 ${categoryGridSize === "small" ? "text-xs" : "text-sm"}`}>
                          {category.name}
                        </span>
                        {categoryGridSize === "large" && (
                          <span className={`text-[10px] text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded-full shadow-sm ${settings.masterTheme === "ios-glass" ? "bg-white/50 backdrop-blur-md" : ""}`}>
                            {products.filter(p => (p.categoryId === category.id || p.category === category.name) && p.isActive !== false).length}  صنف
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category Breadcrumb/Back button if selected */}
              {(selectedCategoryId || searchTerm) && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-800/20">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSearchTerm("");
                    }}
                    className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    {selectedCategoryId && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-600/20">
                        <Folder className="w-4 h-4" />
                        <span className="text-sm font-bold">{categories.find(c => c.id === selectedCategoryId)?.name}</span>
                      </div>
                    )}
                    {searchTerm && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg">
                        <Search className="w-4 h-4" />
                        <span className="text-sm font-bold">نتائح البحث: {searchTerm}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
                  <Package className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-lg">لا توجد منتجات مطابقة</p>
                  <button onClick={() => { setSearchTerm(""); setSelectedCategoryId(null); }} className="mt-4 text-indigo-600 font-bold hover:underline">إعادة ضبط البحث</button>
                </div>
              ) : (
                <div className={`grid gap-[clamp(0.25rem,1vw,1rem)] h-fit ${gridSize === "large"
                  ? "grid-cols-[repeat(auto-fill,minmax(clamp(150px,25vw,350px),1fr))]"
                  : gridSize === "small"
                    ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7"
                    : "grid-cols-2 xs:grid-cols-4 md:grid-cols-6 xl:grid-cols-9"
                  }`}>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.1 }}
                      className={`
                      relative flex flex-col items-center text-center p-4 rounded-2xl border cursor-pointer group product-card-hover
                      ${settings.masterTheme === "ios-glass" ? "glass-panel hover:bg-white/40 dark:hover:bg-zinc-900/40" : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"}
                      border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xl hover:shadow-indigo-500/5
                      ${gridSize === "tiny" ? "p-2" : "p-4 sm:p-5"}
                      transition-colors duration-100 ease-out min-h-[140px]
                    `}
                      onClick={() => {
                        if (product.trackInventory !== false && product.stock === 0) {
                          toast.error("هذا المنتج غير متوفر في المخزون");
                        } else {
                          addToCart(product);
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/products");
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                        title="الذهاب للمخزون"
                      >
                        <Package className="w-4 h-4" />
                      </button>

                      {gridSize !== "tiny" && (
                        <div className="w-full aspect-square mb-3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {product.trackInventory !== false && product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white text-[10px] font-bold">
                              نفذت الكمية
                            </div>
                          )}
                        </div>
                      )}

                      <h3 className={`font-bold text-zinc-900 dark:text-white line-clamp-2 mb-1 ${gridSize === "tiny" ? "text-[11px]" : "text-sm"}`}>
                        {product.name}
                      </h3>

                      <div className="mt-auto flex flex-col items-center">
                        <p className={`text-indigo-600 dark:text-indigo-400 font-black ${gridSize === "tiny" ? "text-xs" : "text-base"}`}>
                          {product.price} <span className="text-[10px] font-normal">{settings.currency}</span>
                        </p>
                        {gridSize !== "tiny" && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                            {product.trackInventory === false ? "∞" : `مخزون: ${product.stock}`}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Cart Overlay Overlay */}
            <AnimatePresence>
              {isCartOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCartOpen(false)}
                  className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                />
              )}
            </AnimatePresence>

            {/* Cart Section */}
            <AnimatePresence mode="wait">
              {isCartOpen && (
                <motion.div
                  layout
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                    duration: settings.disableAnimations ? 0.12 : 0.4
                  }}
                  style={{ maxHeight: 'calc(100svh - 1rem)' }}
                  className={`
                 w-[calc(100%-1rem)] max-w-[480px] lg:w-[420px] flex flex-col bg-white dark:bg-zinc-950 shadow-2xl border-r lg:border-r-0 lg:border-l border-zinc-200 dark:border-zinc-800 shrink-0
                 fixed lg:sticky lg:top-0 lg:flex lg:rounded-2xl min-h-[50vh] h-auto lg:h-[calc(100svh-1rem)]
                 bottom-2 left-2 right-2 lg:bottom-0 lg:left-0 lg:right-0 z-[60] lg:z-auto rounded-3xl lg:rounded-b-2xl origin-right
                 ${settings.masterTheme === "ios-glass" ? "glass-panel" : ""}
               `}
                >
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-zinc-900 dark:text-white leading-tight">
                          سلة المشتريات
                        </h2>
                        <p className="text-[10px] text-zinc-500">{cart.length} أصناف مضافة</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsKeypadOpen(!isKeypadOpen)}
                        className={`p-2 rounded-xl transition-all ${isKeypadOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50"} `}
                        title="لوحة الأرقام السريعة"
                      >
                        <Calculator className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playSound) playSound("click");
                          setIsCartOpen(false);
                        }}
                        className="p-4 sm:p-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-2xl transition-all active:scale-95 border border-rose-100 dark:border-rose-800 shadow-md flex items-center justify-center min-w-[56px] min-h-[56px]"
                        title="إغلاق السلة"
                      >
                        <X className="w-7 h-7 sm:w-6 sm:h-6" />
                      </button>
                    </div>
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


                  {/* Fixed Checkout Panel */}
                  <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                    <div className="space-y-1 text-sm pb-1 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>المجموع الفرعي</span>
                        <span>{cartTotal.toFixed(2)} {settings.currency}</span>
                      </div>
                      {settings.enableTax && (
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                          <span>الضريبة ({settings.taxRate}%)</span>
                          <span>{tax.toFixed(2)} {settings.currency}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white pt-1">
                        <span>الإجمالي</span>
                        <span className="text-indigo-600 dark:text-indigo-400 privacy-blur">
                          {grandTotal.toFixed(2)} {settings.currency}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                       <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">المبلغ المستلم:</span>
                        <span className="text-[10px] text-zinc-400">انقر للإدخال السريع</span>
                      </div>
                      <div className="relative">
                        <NumberInput
                          value={amountPaid}
                          onChange={(val) => setAmountPaid(val)}
                          onFocus={() => setActiveKeypadInput("amountPaid")}
                          className={`w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border-2 rounded-2xl text-2xl font-black focus:outline-none transition-all ${activeKeypadInput === "amountPaid" && isKeypadOpen ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500"} dark:text-white mb-2`}
                          placeholder={paymentMethod === "debt" ? "اختياري..." : "0.00"}
                          min="0"
                          step="0.01"
                          allowDecimal
                        />
                        {amountPaid && (
                          <button
                            onClick={() => setAmountPaid("")}
                            className="absolute left-4 top-[24px] -translate-y-1/2 p-2 bg-white dark:bg-zinc-800 rounded-xl text-zinc-400 shadow-sm border border-zinc-100 dark:border-zinc-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setIsShowMoreOptions(!isShowMoreOptions)}
                        className="w-full flex items-center justify-between p-2 mt-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-dashed border-zinc-300 dark:border-zinc-700"
                      >
                        <span className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4" />
                          خيارات الدفع 
                        </span>
                        {isShowMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isShowMoreOptions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 flex-shrink-1 overflow-y-auto max-h-[25vh] custom-scrollbar pt-1"
                        >
                          <div className="grid grid-cols-4 gap-2">
                            {(["cash", "card", "debt", "split"] as const).map((method) => (
                              <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === method
                                  ? (method === "debt" ? "bg-amber-500 border-amber-500" : method === "split" ? "bg-purple-600 border-purple-600" : "bg-indigo-600 border-indigo-600") + " text-white shadow-md"
                                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                                  }`}
                              >
                                {method === "cash" && <Banknote className="w-4 h-4" />}
                                {method === "card" && <CreditCard className="w-4 h-4" />}
                                {method === "debt" && <Users className="w-4 h-4" />}
                                {method === "split" && <div className="flex -space-x-1"><Banknote className="w-3 h-3 z-10" /><CreditCard className="w-3 h-3" /></div>}
                                {method === "cash" ? "كاش" : method === "card" ? "شبكة" : method === "debt" ? "آجل" : "مقسم"}
                              </button>
                            ))}
                          </div>

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
                              >
                                <UserPlus className="w-5 h-5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="أو ادخل اسم عميل جديد..."
                              className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              disabled={!!selectedCustomerId}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {paymentMethod === "split" && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <NumberInput
                          value={splitCash}
                          onChange={(val) => setSplitCash(val)}
                          onFocus={() => setActiveKeypadInput("splitCash")}
                          className={`w-full px-4 py-2 bg-white dark:bg-zinc-950 border rounded-xl text-sm ${activeKeypadInput === "splitCash" && isKeypadOpen ? "border-purple-500 ring-2 ring-purple-500/20" : ""}`}
                          placeholder="الكاش"
                          allowDecimal
                        />
                        <NumberInput
                          value={splitCard}
                          onChange={(val) => setSplitCard(val)}
                          onFocus={() => setActiveKeypadInput("splitCard")}
                          className={`w-full px-4 py-2 bg-white dark:bg-zinc-950 border rounded-xl text-sm ${activeKeypadInput === "splitCard" && isKeypadOpen ? "border-purple-500 ring-2 ring-purple-500/20" : ""}`}
                          placeholder="الشبكة"
                          allowDecimal
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      {paymentMethod === "cash" && amountPaid && Number(amountPaid) >= grandTotal && (
                        <div className="flex justify-between text-sm p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
                          <span>الباقي:</span>
                          <span className="font-bold">{change.toFixed(2)} {settings.currency}</span>
                        </div>
                      )}
                      {paymentMethod === "debt" && (
                        <div className="flex justify-between text-sm p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg">
                          <span>المتبقي كدين:</span>
                          <span className="font-bold">{(grandTotal - (Number(amountPaid) || 0)).toFixed(2)} {settings.currency}</span>
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      disabled={
                        cart.length === 0 ||
                        (paymentMethod === "cash" && amountPaid !== "" && Number(amountPaid) < grandTotal) ||
                        (paymentMethod === "debt" && !selectedCustomerId) ||
                        (paymentMethod === "split" && Number(splitCash) + Number(splitCard) < grandTotal)
                      }
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${cart.length === 0 ||
                        (paymentMethod === "cash" && amountPaid !== "" && Number(amountPaid) < grandTotal) ||
                        (paymentMethod === "debt" && !selectedCustomerId) ||
                        (paymentMethod === "split" && Number(splitCash) + Number(splitCard) < grandTotal)
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                        } ${settings.masterTheme === "ios-glass" ? "liquid-morph" : ""}`}
                    >
                      {paymentMethod === "debt" ? "إتمام البيع الآجل" : paymentMethod === "split" ? "دفع مقسم وإصدار" : "دفع وإصدار الفاتورة"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Visual Overlay */}
            <AnimatePresence>
              {showSuccessCheck && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, y: 100 }}
                  animate={{ opacity: 1, scale: 1.5, y: 0 }}
                  exit={{ opacity: 0, scale: 2, rotate: 10 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-[200] pointer-events-none"
                >
                  <motion.div
                    initial={{ rotate: -20 }}
                    animate={{ rotate: 0 }}
                    className="bg-emerald-500 text-white p-12 rounded-full shadow-[0_40px_100px_rgba(16,185,129,0.6)] border-8 border-white mb-6 liquid-morph"
                  >
                    <Check size={120} strokeWidth={5} />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)] bg-white/80 dark:bg-zinc-900/80 px-8 py-4 rounded-3xl backdrop-blur-md"
                  >
                    تم البيع بنجاح
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Cart Toggle Floating Button */}
          {!isCartOpen && (
            <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30 pointer-events-none">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (playSound) playSound("click");
                  setIsCartOpen(true);
                }}
                className={`w-full min-h-[64px] bg-gradient-to-l from-indigo-700 to-indigo-600 dark:from-indigo-800 dark:to-indigo-700 shadow-2xl shadow-indigo-600/40 rounded-2xl text-white font-bold flex items-center justify-between px-5 pointer-events-auto active:shadow-indigo-600/20 border border-indigo-500/30 ${
                  settings.masterTheme === "ios-glass" ? "liquid-morph" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                      <motion.span
                        key={cart.length}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black flex items-center justify-center shadow-md"
                      >
                        {cart.length}
                      </motion.span>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold leading-tight">
                      {cart.length === 0 ? "السلة فارغة" : "عرض السلة"}
                    </span>
                    <span className="text-xs text-indigo-200 leading-tight">
                      {cart.length} {cart.length === 1 ? "صنف" : "أصناف"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black tabular-nums">
                    {grandTotal.toFixed(2)}
                  </span>
                  <span className="text-xs text-indigo-200">
                    {settings.currency}
                  </span>
                </div>
              </motion.button>
            </div>
          )}

          {/* PIN Modal */}
          <AnimatePresence>
            {showPinModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-center text-zinc-900 dark:text-white mb-2">صلاحية مدير مطلوبة</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
                      العملية الحالية تتضمن البيع بسعر أقل من التكلفة. يرجى إدخال رمز PIN للمتابعة.
                    </p>

                    <form onSubmit={handlePinSubmit} className="space-y-6">
                      <div className="flex justify-center gap-3">
                        <input
                          type="password"
                          maxLength={4}
                          value={pinInput}
                          onChange={(e) => {
                            setPinInput(e.target.value);
                            setPinError("");
                          }}
                          className={`w-48 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 rounded-xl text-center text-3xl tracking-[1em] focus:outline-none transition-all ${pinError ? "border-red-500 animate-shake" : "border-zinc-200 dark:border-zinc-700 focus:border-indigo-500"}`}
                          placeholder="••••"
                          autoFocus
                        />
                      </div>

                      {pinError && (
                        <p className="text-red-500 text-xs text-center font-bold">{pinError}</p>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPinModal(false);
                            setPendingCheckout(null);
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

          <AddMaintenanceJobModal
            isOpen={isMaintenanceModalOpen}
            onClose={() => setIsMaintenanceModalOpen(false)}
          />

          <QuickAddCustomerModal
            isOpen={isAddCustomerModalOpen}
            onClose={() => setIsAddCustomerModalOpen(false)}
            onSuccess={(id, name) => {
              setCustomerName(name);
              setSelectedCustomerId(id);
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
        </motion.div>
      </div>
    </div>
  );
}
