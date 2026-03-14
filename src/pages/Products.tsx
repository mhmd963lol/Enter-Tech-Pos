import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "../context/AppContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Download,
  X,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ArrowRightLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Category } from "../types";
import NumberInput from "../components/NumberInput";

export default function Products() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    settings,
    isPro,
    upgradeToPro,
    addNotification,
    addLog,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showExportAlert, setShowExportAlert] = useState(false);

  // Batch actions state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isBatchMoveModalOpen, setIsBatchMoveModalOpen] = useState(false);
  const [batchTargetCategoryId, setBatchTargetCategoryId] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    costPrice: "",
    stock: "",
    category: "",
    categoryId: "",
    barcode: "",
    image: "https://picsum.photos/seed/product/200/200",
    isActive: true,
    trackInventory: true,
    minStockAlert: "5",
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.includes(searchTerm) ||
      p.barcode.includes(searchTerm) ||
      p.category.includes(searchTerm),
  );

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = categories.find(
      (c) => c.id === newProduct.categoryId,
    );
    const categoryName = selectedCategory
      ? selectedCategory.name
      : newProduct.category;

    // Check for duplicates
    if (!editingProduct) {
      const isDuplicate = products.some(
        (p) =>
          p.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase(),
      );
      if (isDuplicate) {
        addNotification({
          title: "تنبيه: صنف مكرر",
          message: `الصنف "${newProduct.name}" موجود مسبقاً في المخزون.`,
          type: "error",
        });
        return;
      }
    }

    if (
      newProduct.trackInventory &&
      (!newProduct.stock || Number(newProduct.stock) === 0)
    ) {
      addNotification({
        title: "تنبيه: كمية فارغة",
        message: `تم إضافة الصنف "${newProduct.name}" بكمية صفر.`,
        type: "warning",
      });
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: newProduct.name,
        price: Number(newProduct.price),
        costPrice: Number(newProduct.costPrice),
        stock: newProduct.trackInventory ? Number(newProduct.stock) : 999999,
        category: categoryName,
        categoryId: newProduct.categoryId,
        barcode:
          newProduct.barcode || Math.floor(Math.random() * 100000).toString(),
        image: newProduct.image,
        isActive: newProduct.isActive,
        trackInventory: newProduct.trackInventory,
        minStockAlert: Number(newProduct.minStockAlert),
      });
    } else {
      addProduct({
        name: newProduct.name,
        price: Number(newProduct.price),
        costPrice: Number(newProduct.costPrice),
        stock: newProduct.trackInventory ? Number(newProduct.stock) : 999999,
        category: categoryName,
        categoryId: newProduct.categoryId,
        barcode:
          newProduct.barcode || Math.floor(Math.random() * 100000).toString(),
        image: newProduct.image,
        isActive: newProduct.isActive,
        trackInventory: newProduct.trackInventory,
        minStockAlert: Number(newProduct.minStockAlert),
      });
    }
    closeModal();
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || "0",
      stock: product.trackInventory === false ? "" : product.stock.toString(),
      category: product.category,
      categoryId: product.categoryId || "",
      barcode: product.barcode,
      image: product.image || "https://picsum.photos/seed/product/200/200",
      isActive: product.isActive ?? true,
      trackInventory: product.trackInventory ?? true,
      minStockAlert: product.minStockAlert?.toString() || "5",
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      costPrice: "",
      stock: "",
      category: "",
      categoryId: "",
      barcode: "",
      image: "https://picsum.photos/seed/product/200/200",
      isActive: true,
      trackInventory: true,
      minStockAlert: "5",
    });
  };

  const toggleStatus = (product: Product) => {
    updateProduct(product.id, { isActive: !(product.isActive ?? true) });
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const handleExport = () => {
    if (!isPro) {
      upgradeToPro();
      return;
    }
    setShowExportAlert(true);
    setTimeout(() => setShowExportAlert(false), 3000);
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSet = new Set(selectedProductIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedProductIds(newSet);
  };

  const handleBatchMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.size === 0 || !batchTargetCategoryId) return;

    const targetCategory = categories.find((c) => c.id === batchTargetCategoryId);
    if (!targetCategory) return;

    selectedProductIds.forEach((id) => {
      updateProduct(id, {
        categoryId: targetCategory.id,
        category: targetCategory.name,
      });
    });

    addLog({
      action: "نقل أصناف",
      details: `تم نقل ${selectedProductIds.size} أصناف إلى قسم ${targetCategory.name}`,
      type: "inventory",
    });

    addNotification({
      title: "تم النقل بنجاح",
      message: `تم نقل ${selectedProductIds.size} أصناف بنجاح.`,
      type: "success",
    });

    setSelectedProductIds(new Set());
    setIsBatchMoveModalOpen(false);
    setBatchTargetCategoryId("");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          المنتجات والمخزون
        </h2>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            تصدير Excel
            {!isPro && (
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded ml-1">
                PRO
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({
                name: "",
                price: "",
                costPrice: "",
                stock: "",
                category: "",
                barcode: "",
                image: "https://picsum.photos/seed/product/200/200",
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة منتج جديد
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم المنتج، الباركود، أو القسم..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {selectedProductIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mt-4 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800"
              >
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  تم تحديد {selectedProductIds.size} أصناف
                </div>
                <button
                  onClick={() => setIsBatchMoveModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                  <ArrowRightLeft className="w-4 h-4 cursor-pointer" />
                  نقل للأقسام المحددة
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-6 py-4 font-medium">الباركود</th>
                <th className="px-6 py-4 font-medium">القسم</th>
                <th className="px-6 py-4 font-medium">سعر التكلفة</th>
                <th className="px-6 py-4 font-medium">سعر البيع</th>
                <th className="px-6 py-4 font-medium">المخزون</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {Array.from(
                  new Map(filteredProducts.map((p) => [p.id, p])).values(),
                ).map((product: Product) => {
                  const category =
                    categories.find((c) => c.id === product.categoryId) ||
                    categories.find((c) => c.name === product.category);
                  const categoryName = category
                    ? category.name
                    : product.category;

                  // Custom animations per master theme
                  let masterVariants = {};
                  const master = settings.masterTheme || "default";
                  if (master === "gaming") {
                    // Shatter / Zoom out fast
                    masterVariants = {
                      initial: { opacity: 0, scale: 0.8, x: -20 },
                      animate: { opacity: 1, scale: 1, x: 0 },
                      exit: { opacity: 0, scale: 0.5, y: -50, rotate: 10, transition: { duration: 0.2 } },
                    };
                  } else if (master === "luxury") {
                    // Smooth slide down
                    masterVariants = {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: 50, transition: { duration: 0.4, ease: "easeIn" } },
                    };
                  } else if (master === "carbon") {
                    // Slide out right fast
                    masterVariants = {
                      initial: { opacity: 0, x: 30 },
                      animate: { opacity: 1, x: 0 },
                      exit: { opacity: 0, x: -100, transition: { duration: 0.25 } },
                    };
                  } else {
                    // Default
                    masterVariants = {
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, scale: 0.95 },
                    };
                  }

                  return (
                    <motion.tr
                      layout
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={masterVariants}
                      key={product.id}
                      className={
                        selectedProductIds.has(product.id)
                          ? "bg-indigo-50/50 dark:bg-indigo-900/20 transition-colors"
                          : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                      }
                    >
                      <td className="px-6 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedProductIds.has(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-900 dark:text-white">
                              {product.name}
                            </span>
                            {product.trackInventory !== false &&
                              product.stock === 0 && (
                                <XCircle
                                  className="w-4 h-4 text-red-500"
                                  title="نفاد الكمية"
                                />
                              )}
                            {product.trackInventory !== false &&
                              product.stock > 0 &&
                              product.stock <= (product.minStockAlert || 5) && (
                                <AlertTriangle
                                  className="w-4 h-4 text-amber-500"
                                  title="كمية منخفضة"
                                />
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">
                        {product.barcode}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-medium">
                          {categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-400">
                        {product.costPrice || 0} {settings.currency}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {product.price} {settings.currency}
                      </td>
                      <td className="px-6 py-4">
                        {product.trackInventory === false ? (
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                            ∞
                          </span>
                        ) : (
                          <span
                            className={`font-medium ${product.stock === 0 ? "text-red-500 dark:text-red-400" : product.stock <= (product.minStockAlert || 5) ? "text-amber-500 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={product.isActive ?? true}
                            onChange={() => toggleStatus(product)}
                          />
                          <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {createPortal(
        <AnimatePresence>
          {isAddModalOpen && (
          <div
            key="add-modal"
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم المنتج
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      سعر التكلفة ({settings.currency})
                    </label>
                    <NumberInput
                      required
                      min="0"
                      step="0.01"
                      dir="ltr"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left"
                      value={newProduct.costPrice}
                      onChange={(val) =>
                        setNewProduct({ ...newProduct, costPrice: val })
                      }
                      allowDecimal
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      سعر البيع ({settings.currency})
                    </label>
                    <NumberInput
                      required
                      min="0"
                      step="0.01"
                      dir="ltr"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left"
                      value={newProduct.price}
                      onChange={(val) =>
                        setNewProduct({ ...newProduct, price: val })
                      }
                      allowDecimal
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      المخزون
                    </label>
                    <NumberInput
                      required={newProduct.trackInventory}
                      disabled={!newProduct.trackInventory}
                      min="0"
                      dir="ltr"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left disabled:opacity-50"
                      value={newProduct.stock}
                      onChange={(val) =>
                        setNewProduct({ ...newProduct, stock: val })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      القسم
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      value={newProduct.categoryId || newProduct.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cat = categories.find((c) => c.id === val);
                        if (cat) {
                          setNewProduct({
                            ...newProduct,
                            categoryId: cat.id,
                            category: cat.name,
                          });
                        } else {
                          setNewProduct({
                            ...newProduct,
                            categoryId: "",
                            category: val,
                          });
                        }
                      }}
                    >
                      <option value="">اختر القسم...</option>
                      {Array.from(
                        new Map(categories.map((c) => [c.id, c])).values(),
                      ).map((c: Category) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={newProduct.isActive}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {newProduct.isActive
                        ? "نشط (متاح للبيع)"
                        : "غير نشط (معطل)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={newProduct.trackInventory}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            trackInventory: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      تتبع المخزون
                    </span>
                  </div>
                </div>
                {newProduct.trackInventory && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      الحد الأدنى للتنبيه
                    </label>
                    <NumberInput
                      min="0"
                      dir="ltr"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left"
                      value={newProduct.minStockAlert || ""}
                      onChange={(val) =>
                        setNewProduct({ ...newProduct, minStockAlert: val })
                      }
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    الباركود (اختياري)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left"
                    dir="ltr"
                    value={newProduct.barcode}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, barcode: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-left"
                    dir="ltr"
                    value={newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    {editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {productToDelete && (
          <div
            key="delete-modal"
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setProductToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-100 dark:border-zinc-800 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                تأكيد الحذف
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Export Alert Toast */}
      <AnimatePresence>
        {showExportAlert && (
          <motion.div
            key="export-alert"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">
              جاري تصدير المنتجات إلى ملف Excel...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
