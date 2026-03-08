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
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import NumberInput from "../components/NumberInput";
import toast from "react-hot-toast";
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
    refreshExchangeRate,
    isCartOpen,
    setIsCartOpen,
    addNotification,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
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

  // Maintenance panel collapse state
  const [isMaintenanceExpanded, setIsMaintenanceExpanded] = useState(false);

  // POS Display States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<"large" | "small" | "tiny">("small");
  const [categoryGridSize, setCategoryGridSize] = useState<"large" | "small">("small");
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
  const [pendingPriceUpdate, setPendingPriceUpdate] = useState<{
    productId: string;
    newPrice: number;
  } | null>(null);

  // Auto-open cart on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCartOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [setIsCartOpen]);

  // Alert for pending cart on leave (simplified logic)
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

    const checkoutData = {
      paymentMethod,
      customerName,
      customerId: selectedCustomerId,
      amountPaid: finalAmountPaid,
      splitDetails,
    };

    // Global Sell-at-Loss validation: check all items in cart against cost
    if (settings.preventBelowCost) {
      const hasLoss = cart.some(item => (item.customPrice ?? item.price) < item.costPrice);
      if (hasLoss) {
        setPendingCheckout(checkoutData);
        setShowPinModal(true);
        setPinInput("");
        setPinError("");
        if (playSound) playSound("error");
        return;
      }
    }

    executeCheckout(checkoutData);
  };

  const executeCheckout = (data: {
    paymentMethod: "cash" | "card" | "debt" | "split";
    customerName?: string;
    customerId?: string;
    amountPaid?: number;
    splitDetails?: { cash: number; card: number };
  }) => {
    checkout(
      data.paymentMethod,
      data.customerName,
      data.customerId,
      data.amountPaid,
      data.splitDetails,
    );
    setCustomerName("");
    setSelectedCustomerId("");
    setAmountPaid("");
    setSplitCash("");
    setSplitCard("");
    setPaymentMethod("cash");
    setPendingCheckout(null);
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (
      settings.preventBelowCost &&
      newPrice < item.costPrice &&
      user?.role !== "admin"
    ) {
      setPendingPriceUpdate({ productId: id, newPrice: newPrice });
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
        updateCartItemPrice(
          pendingPriceUpdate.productId,
          pendingPriceUpdate.newPrice,
        );
        addNotification({
          title: "تمت الموافقة",
          message: "تم تحديث السعر بصلاحية المدير",
          type: "success",
        });
        setPendingPriceUpdate(null);
      } else if (pendingCheckout) {
        executeCheckout(pendingCheckout);
        addNotification({
          title: "تمت الموافقة",
          message: "تم إتمام عملية البيع بخسارة بصلاحية المدير",
          type: "success",
        });
      }
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
      if (playSound) playSound("success");
    } else {
      setPinError("رمز PIN غير صحيح");
      if (playSound) playSound("error");
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
        <motion.div
          layout
          className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${settings.masterTheme === "ios-glass" ? "glass-panel" : ""}`}
        >
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
              <div className="flex items-center gap-2 shrink-0">
                {/* Product Grid Controls */}
                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                  <button
                    onClick={() => setGridSize("tiny")}
                    className={`p-2 rounded-md transition-colors ${gridSize === "tiny" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:text-zinc-900"}`}
                    title="عرض مكثف جداً"
                  >
                    <LayoutTemplate className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridSize("small")}
                    className={`p-2 rounded-md transition-colors ${gridSize === "small" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:text-zinc-900"}`}
                    title="تصغير العناصر"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridSize("large")}
                    className={`p-2 rounded-md transition-colors ${gridSize === "large" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:text-zinc-900"}`}
                    title="تكبير العناصر"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Grid Size Controls */}
                {!selectedCategoryId && (
                  <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border-r border-zinc-200 dark:border-zinc-800 pr-2 ml-1">
                    <button
                      onClick={() => setCategoryGridSize("small")}
                      className={`p-2 rounded-md transition-colors ${categoryGridSize === "small" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:text-zinc-900"}`}
                      title="أقسام صغيرة"
                    >
                      <Folder className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCategoryGridSize("large")}
                      className={`p-2 rounded-md transition-colors ${categoryGridSize === "large" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:text-zinc-900"}`}
                      title="أقسام كبيرة"
                    >
                      <FolderOpen className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Maintenance Quick Search Shortcut */}
                <button
                  onClick={() => setIsMaintenanceExpanded(!isMaintenanceExpanded)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isMaintenanceExpanded ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"}`}
                  title="استعلام الصيانة السريع"
                >
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">الصيانة</span>
                  {maintenanceJobs.length > 0 && !isMaintenanceExpanded && (
                    <span className="bg-indigo-600 dark:bg-white dark:text-indigo-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                      {maintenanceJobs.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Maintenance Quick View - Overlays above products when expanded */}
            <AnimatePresence>
              {isMaintenanceExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute inset-x-4 top-4 z-40 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 px-4 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-sm">استعلام الصيانة السريع</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate("/maintenance")}
                        className="px-3 py-1.5 text-[10px] bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 rounded-lg font-bold border border-zinc-100 dark:border-zinc-700 transition-colors"
                      >
                        إدارة الصيانة
                      </button>
                      <button
                        onClick={() => setIsMaintenanceExpanded(false)}
                        className="p-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:text-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-auto custom-scrollbar">
                    <table className="w-full text-right text-sm">
                      <thead className="sticky top-0 bg-white dark:bg-zinc-950">
                        <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                          <th className="pb-2 font-medium">العميل</th>
                          <th className="pb-2 font-medium">الجهاز</th>
                          <th className="pb-2 font-medium">الحالة</th>
                          <th className="pb-2 font-medium text-left">التكلفة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {maintenanceJobs.slice(0, 10).map((job) => (
                          <tr key={job.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                            <td className="py-2.5">{job.customerName}</td>
                            <td className="py-2.5">{job.device}</td>
                            <td className="py-2.5 text-xs">
                              {job.status === "pending" && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full font-bold">قيد الانتظار</span>}
                              {job.status === "in_progress" && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full font-bold">جاري العمل</span>}
                              {job.status === "ready" && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full font-bold">جاهز</span>}
                              {job.status === "paid" && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full font-bold">تم التسليم</span>}
                            </td>
                            <td className="py-2.5 font-bold text-left">{job.cost} {settings.currency}</td>
                          </tr>
                        ))}
                        {maintenanceJobs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-zinc-400">
                              <Wrench className="w-12 h-12 mx-auto opacity-10 mb-2" />
                              <p className="font-bold opacity-30">لا توجد طلبات صيانة حالياً</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-auto p-4 pb-24 lg:pb-4 custom-scrollbar">

              {!searchTerm && !selectedCategoryId && (
                <div className={`grid gap-4 ${categoryGridSize === "small"
                  ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"}`}>
                  {categories.filter(c => c.isActive).map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                </div>
              )}

              {/* Category Breadcrumb/Back button if selected */}
              {(selectedCategoryId || searchTerm) && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-800/20">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSearchTerm("");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-all border border-indigo-100 dark:border-zinc-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                    كل الأقسام
                  </button>
                  {selectedCategoryId && (
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-600/20">
                        <FolderOpen className="w-4 h-4" />
                        {categories.find(c => c.id === selectedCategoryId)?.name}
                      </div>
                    </div>
                  )}
                  {searchTerm && (
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg">
                        <Search className="w-4 h-4" />
                        "{searchTerm}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(searchTerm || selectedCategoryId) && (
                <div className={`grid gap-2 sm:gap-3 ${gridSize === "large"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : gridSize === "small"
                    ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7"
                    : "grid-cols-2 xs:grid-cols-4 md:grid-cols-6 xl:grid-cols-9"
                  }`}>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                      relative flex flex-col items-center text-center p-3 rounded-2xl border transition-all cursor-pointer group product-card-hover
                      ${settings.masterTheme === "ios-glass" ? "glass-card hover:bg-white/40 dark:hover:bg-zinc-900/40" : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"}
                      border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xl hover:shadow-indigo-500/5
                      ${gridSize === "tiny" ? "p-2" : "p-3"}
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
          </div>
        </motion.div>

        {/* Mobile Cart Overlay */}
        {
          isCartOpen && window.innerWidth < 1024 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
          )
        }

        {/* Cart Section */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              initial={{ y: -600, x: 200, scale: 0.5, opacity: 0, rotate: 10 }}
              animate={{ y: 0, x: 0, scale: 1, opacity: 1, rotate: 0 }}
              exit={{ y: -600, x: 200, scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`
                w-full lg:w-[420px] flex flex-col bg-white dark:bg-zinc-950 shadow-2xl border-r lg:border-r-0 lg:border-l border-zinc-200 dark:border-zinc-800 shrink-0
                fixed lg:relative lg:flex lg:rounded-2xl min-h-0 lg:max-h-full
                bottom-0 left-0 right-0 z-50 lg:z-auto rounded-t-3xl lg:rounded-b-2xl origin-bottom
                ${settings.masterTheme === "ios-glass" ? "glass-panel" : ""}
                h-[90vh] lg:h-auto
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
                    onClick={() => {
                      if (playSound) playSound("click");
                      setIsCartOpen(false);
                    }}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all active:scale-90"
                    title="طي سلة المبيعات"
                  >
                    <ChevronLeft className="w-5 h-5" />
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


              {/* Checkout Panel */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
                <div className="space-y-2 text-sm pb-2 border-b border-zinc-200 dark:border-zinc-800">
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
                    className="w-full flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-dashed border-zinc-300 dark:border-zinc-700"
                  >
                    <span className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      خيارات الدفع والعميل
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
                      className="space-y-3 overflow-hidden pt-2"
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
      </div >



      {/* Mobile Cart Toggle Floating Button */}
      {
        !isCartOpen && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30 pointer-events-none">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (playSound) playSound("click");
                setIsCartOpen(true);
              }}
              className={`w-full py-4 bg-indigo-600 shadow-xl rounded-2xl text-white font-bold flex items-center justify-between px-6 pointer-events-auto shadow-indigo-500/30 ${settings.masterTheme === "ios-glass" ? "liquid-morph" : ""}`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                <span>عرض السلة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                  {cart.length}  أصناف
                </div>
                <span className="text-lg">
                  {grandTotal.toFixed(2)} {settings.currency}
                </span>
              </div>
            </motion.button>
          </div>
        )
      }

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
                  السعر المدخل أقل من سعر التكلفة. لفة. يرجى إدخال رمز PIN  رمز PIN للمدير
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


      <AddMaintenanceJobModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
      />

      <QuickAddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={(id, name) => {
          setCustomerName(name);
          setSelectedCustomerId(id); // Assign the generated ID to track debts!
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
    </div >
  );
}