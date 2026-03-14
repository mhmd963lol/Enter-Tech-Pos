import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Plus, Search, Edit, Trash2, FolderTree, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { Category } from "../types";
import { uploadImage, deleteImage } from "../lib/storageUtils";
import ImageCropperModal from "../components/ImageCropperModal";

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, addNotification } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState("");

  const [newCategory, setNewCategory] = useState({
    name: "",
    isActive: true,
    image: "",
  });

  const filteredCategories = categories.filter((c) =>
    c.name.includes(searchTerm),
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: newCategory.name,
        isActive: newCategory.isActive,
        image: newCategory.image,
      });
    } else {
      addCategory({
        name: newCategory.name,
        isActive: newCategory.isActive,
        image: newCategory.image,
      });
    }
    closeModal();
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      isActive: category.isActive,
      image: category.image || "",
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setNewCategory({ name: "", isActive: true, image: "" });
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  const toggleStatus = (category: Category) => {
    updateCategory(category.id, { isActive: !category.isActive });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          الأقسام
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          إضافة قسم جديد
        </motion.button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن قسم..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">اسم القسم</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredCategories.map((category) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={category.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={category.isActive}
                          onChange={() => toggleStatus(category)}
                        />
                        <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredCategories.length === 0 && (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              لا توجد أقسام مطابقة للبحث
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم القسم
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    صورة القسم (اختياري)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {isUploading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <img 
                          src={newCategory.image || "https://picsum.photos/seed/category/200/200"} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = () => {
                            setCropperImageSrc(reader.result as string);
                            setIsCropperOpen(true);
                          };
                          
                          // Reset file input so the same file can be selected again if canceled
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newCategory.isActive}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {newCategory.isActive ? "نشط" : "غير نشط"}
                  </span>
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
                    {editingCategory ? "حفظ التعديلات" : "إضافة القسم"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      {isCropperOpen && createPortal(
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropperImageSrc}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperImageSrc("");
          }}
          onCropComplete={async (croppedFile) => {
             try {
               setIsUploading(true);
               if (newCategory.image && newCategory.image.includes('firebasestorage')) {
                 deleteImage(newCategory.image).catch(() => {});
               }
               const url = await uploadImage(croppedFile, "categories");
               setNewCategory({ ...newCategory, image: url });
             } catch (error: any) {
               console.error("Image upload failed:", error);
               addNotification({
                 title: "خطأ",
                 message: "فشل رفع الصورة: " + (error?.message || "يرجى المحاولة مرة أخرى"),
                 type: "error"
               });
             } finally {
               setIsUploading(false);
               setIsCropperOpen(false);
               setCropperImageSrc("");
             }
          }}
        />,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-100 dark:border-zinc-800 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                تأكيد الحذف
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
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
      </AnimatePresence>
    </div>
  );
}
