import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Package } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { MaintenanceJob } from "../types";
import NumberInput from "./NumberInput";

interface AddMaintenanceJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob?: MaintenanceJob | null;
}

export default function AddMaintenanceJobModal({
  isOpen,
  onClose,
  editingJob,
}: AddMaintenanceJobModalProps) {
  const { settings, addMaintenanceJob, updateMaintenanceJob, user, products } =
    useAppContext();

  const [newJob, setNewJob] = useState({
    customerName: editingJob?.customerName || "",
    device: editingJob?.device || "",
    issue: editingJob?.issue || "",
    cost: editingJob?.cost.toString() || "",
    partsCost: editingJob?.partsCost.toString() || "",
  });

  const [useInventoryPart, setUseInventoryPart] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setNewJob({
        customerName: editingJob?.customerName || "",
        device: editingJob?.device || "",
        issue: editingJob?.issue || "",
        cost: editingJob?.cost.toString() || "",
        partsCost: editingJob?.partsCost.toString() || "",
      });
      setUseInventoryPart(false);
      setSelectedPartId("");
    }
  }, [isOpen, editingJob]);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();

    const jobData = {
      customerName: newJob.customerName,
      device: newJob.device,
      issue: newJob.issue,
      cost: Number(newJob.cost),
      partsCost: useInventoryPart ? 0 : Number(newJob.partsCost),
      usedPartId:
        useInventoryPart && selectedPartId ? selectedPartId : undefined,
    };

    if (editingJob) {
      updateMaintenanceJob(editingJob.id, jobData);
    } else {
      addMaintenanceJob({
        ...jobData,
        status: "in_progress",
        date: new Date().toISOString().split("T")[0],
        receivedBy: user?.name || "غير معروف",
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-100 dark:border-zinc-800"
          dir="rtl"
        >
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              {editingJob ? "تعديل بيانات الصيانة" : "استلام جهاز جديد"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
            >
              <AlertCircle className="w-5 h-5 rotate-45" />
            </button>
          </div>

          <form
            onSubmit={handleAddJob}
            className="p-4 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                اسم العميل
              </label>
              <input
                required
                type="text"
                value={newJob.customerName}
                onChange={(e) =>
                  setNewJob({ ...newJob, customerName: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                الجهاز
              </label>
              <input
                required
                type="text"
                value={newJob.device}
                onChange={(e) =>
                  setNewJob({ ...newJob, device: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                وصف العطل
              </label>
              <textarea
                required
                value={newJob.issue}
                onChange={(e) =>
                  setNewJob({ ...newJob, issue: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                التكلفة المتوقعة ({settings.currency})
              </label>
              <NumberInput
                required
                min="0"
                step="0.01"
                dir="ltr"
                value={newJob.cost}
                onChange={(val) => setNewJob({ ...newJob, cost: val })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left"
                allowDecimal
              />
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useInventoryPart}
                  onChange={(e) => setUseInventoryPart(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  استخدام قطع غيار من المخزون
                </span>
              </label>

              {useInventoryPart ? (
                <div>
                  <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    اختر القطعة
                  </label>
                  <select
                    required={useInventoryPart}
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="">-- اختر --</option>
                    {products
                      .filter((p) => p.stock > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (المخزون: {p.stock})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    تكلفة القطع ({settings.currency})
                  </label>
                  <NumberInput
                    required={!useInventoryPart}
                    min="0"
                    step="0.01"
                    dir="ltr"
                    value={newJob.partsCost}
                    onChange={(val) => setNewJob({ ...newJob, partsCost: val })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-left"
                    allowDecimal
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                {editingJob ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
