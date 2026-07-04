import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  MessageSquare,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MaintenanceJob } from "../types";
import AddMaintenanceJobModal from "../components/AddMaintenanceJobModal";

export default function Maintenance() {
  const { settings, maintenanceJobs, updateMaintenanceJob, user } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<MaintenanceJob | null>(null);

  const filteredJobs = maintenanceJobs.filter(
    (j) => j.customerName.includes(searchTerm) || j.device.includes(searchTerm),
  );

  const openEditModal = (job: MaintenanceJob) => {
    setEditingJob(job);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingJob(null);
  };

  const updateStatus = (id: string, status: MaintenanceJob["status"]) => {
    updateMaintenanceJob(id, { status });
  };

  const getStatusBadge = (status: MaintenanceJob["status"]) => {
    switch (status) {
      case "in_progress":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="w-3 h-3" /> جاري العمل
          </span>
        );
      case "ready":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" /> جاهز للتسليم
          </span>
        );
      case "paid":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" /> تم الدفع والتسليم
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          استلام أعطال الصيانة
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          استلام جهاز جديد
        </motion.button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم العميل أو الجهاز..."
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="hidden md:table-header-group">
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">الجهاز</th>
                <th className="px-6 py-4 font-medium">العطل</th>
                <th className="px-6 py-4 font-medium">التكلفة المتوقعة</th>
                <th className="px-6 py-4 font-medium">تكلفة القطع</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">المستلم</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4 p-4 md:p-0 md:divide-y md:divide-zinc-100 dark:md:divide-zinc-800">
              <AnimatePresence>
                {filteredJobs.map((job) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={job.id}
                    className="flex flex-col md:table-row bg-white dark:bg-zinc-950 md:bg-transparent border border-zinc-200 dark:border-zinc-800 md:border-none rounded-xl md:rounded-none overflow-hidden hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none font-medium text-zinc-900 dark:text-white">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">العميل</span>
                      <span>{job.customerName}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none text-zinc-600 dark:text-zinc-300">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">الجهاز</span>
                      <span>{job.device}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none text-zinc-600 dark:text-zinc-300">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">العطل</span>
                      <span>{job.issue}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none text-indigo-600 dark:text-indigo-400 font-medium">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">التكلفة المتوقعة</span>
                      <span>{job.cost} {settings.currency}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">تكلفة القطع</span>
                      <span>{job.partsCost} {settings.currency}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none text-zinc-500 dark:text-zinc-400 text-sm">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">التاريخ</span>
                      <span>{new Date(job.date).toLocaleDateString("en-US")}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none text-zinc-500 dark:text-zinc-400 text-sm">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">المستلم</span>
                      <span>{job.receivedBy || "-"}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-zinc-100 dark:border-zinc-800 md:border-none">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">الحالة</span>
                      <span>{getStatusBadge(job.status)}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row justify-between sm:items-center md:table-cell gap-3 sm:gap-0">
                      <span className="md:hidden font-medium text-zinc-500 text-sm">الإجراءات</span>
                      <div className="flex items-center justify-end md:justify-center gap-2">
                        {job.status === "in_progress" && (
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 md:p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-zinc-50 md:bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-zinc-200 md:border-none dark:border-zinc-700"
                            title="تعديل التكلفة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === "ready" && (
                          <button
                            onClick={() => {
                              const message = `مرحباً بك عميلنا العزيز ${job.customerName}، نفيدك بأن جهازك (${job.device}) جاهز للتسليم. التكلفة المتوقعة: ${job.cost} ${settings.currency}`;
                              window.open(
                                `https://wa.me/?text=${encodeURIComponent(message)}`,
                                "_blank",
                              );
                            }}
                            className="p-2 md:p-1.5 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 bg-zinc-50 md:bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-zinc-200 md:border-none dark:border-zinc-700"
                            title="إرسال رسالة واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setTimeout(() => window.print(), 500);
                          }}
                          className="p-2 md:p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-50 md:bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-zinc-200 md:border-none dark:border-zinc-700"
                          title="طباعة إيصال"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <select
                          value={job.status}
                          onChange={(e) =>
                            updateStatus(
                              job.id,
                              e.target.value as MaintenanceJob["status"],
                            )
                          }
                          className="text-xs md:text-sm bg-zinc-50 md:bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 md:p-2 focus:ring-2 md:focus:ring-1 focus:ring-indigo-500 cursor-pointer dark:text-white dark:bg-zinc-900 w-full sm:w-auto"
                        >
                          <option value="in_progress">جاري العمل</option>
                          <option value="ready">جاهز للتسليم</option>
                          <option value="paid">تم الدفع والتسليم</option>
                        </select>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AddMaintenanceJobModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        editingJob={editingJob}
      />
    </div>
  );
}
