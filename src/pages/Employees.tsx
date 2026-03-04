import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  UserCircle,
  Phone,
  Calendar,
  Trash2,
  Edit2,
  X,
  Shield,
  ShieldAlert,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Employee, Role } from "../types";
import NumberInput from "../components/NumberInput";

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, settings } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({
    name: "",
    role: "cashier",
    phone: "",
    salary: 0,
    joinDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm),
  );

  const totalSalaries = employees
    .filter((e) => e.isActive)
    .reduce((sum, e) => sum + e.salary, 0);
  const activeCount = employees.filter((e) => e.isActive).length;

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setNewEmployee({
        name: employee.name,
        role: employee.role,
        phone: employee.phone,
        salary: employee.salary,
        joinDate: employee.joinDate.split("T")[0],
        isActive: employee.isActive,
      });
    } else {
      setEditingEmployee(null);
      setNewEmployee({
        name: "",
        role: "cashier",
        phone: "",
        salary: 0,
        joinDate: new Date().toISOString().split("T")[0],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        ...newEmployee,
        joinDate: new Date(newEmployee.joinDate).toISOString(),
      });
    } else {
      addEmployee({
        ...newEmployee,
        joinDate: new Date(newEmployee.joinDate).toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            الموارد البشرية
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            إدارة الموظفين، الصلاحيات، والرواتب.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          إضافة موظف
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الموظفين
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {employees.length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                على رأس العمل
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {activeCount}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                إجمالي الرواتب الشهرية
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalSalaries.toFixed(2)} {settings.currency}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم الموظف أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-sm border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-4 font-medium">الاسم</th>
                <th className="px-6 py-4 font-medium">الصلاحية</th>
                <th className="px-6 py-4 font-medium">التواصل</th>
                <th className="px-6 py-4 font-medium">الراتب</th>
                <th className="px-6 py-4 font-medium">تاريخ الانضمام</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filteredEmployees.map((employee) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={employee.id}
                    className={`transition-colors ${!employee.isActive ? "bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {employee.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          employee.role === "admin"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {employee.role === "admin" ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {employee.role === "admin" ? "مدير نظام" : "كاشير"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-zinc-400" />
                        {employee.phone || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {employee.salary.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(employee.joinDate).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4">
                      {employee.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" /> نشط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full w-fit">
                          <XCircle className="w-3 h-3" /> موقوف
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmployee(employee.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لم يتم العثور على موظفين</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-indigo-500" />
                  {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم الموظف <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      الدور والصلاحية
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      value={newEmployee.role}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          role: e.target.value as Role,
                        })
                      }
                    >
                      <option value="cashier">كاشير</option>
                      <option value="admin">مدير نظام</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-left"
                      dir="ltr"
                      value={newEmployee.phone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      الراتب الأساسي
                    </label>
                    <NumberInput
                      value={newEmployee.salary || ""}
                      onChange={(val) =>
                        setNewEmployee({ ...newEmployee, salary: Number(val) })
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      تاريخ الانضمام
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      value={newEmployee.joinDate}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          joinDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newEmployee.isActive}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    حالة الموظف (نشط / موقوف)
                  </span>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                  >
                    {editingEmployee ? "حفظ التعديلات" : "إضافة الموظف"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
