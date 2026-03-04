import React from "react";
import { useAppContext } from "../context/AppContext";
import { Lock, Star } from "lucide-react";

interface ProFeatureLockProps {
  children: React.ReactNode;
  featureName: string;
  description: string;
}

export default function ProFeatureLock({
  children,
  featureName,
  description,
}: ProFeatureLockProps) {
  const { isPro, upgradeToPro } = useAppContext();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-white border border-zinc-100 flex flex-col items-center justify-center p-8 text-center"
      dir="rtl"
    >
      {/* Blurred Background Content */}
      <div className="absolute inset-0 opacity-10 pointer-events-none filter blur-sm">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-indigo-600" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">
            ميزة {featureName}
          </h3>
          <p className="text-zinc-500">{description}</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-[1px] rounded-xl">
          <div className="bg-white rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-zinc-900 flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              الترقية للنسخة الاحترافية (Pro)
            </h4>
            <ul className="text-sm text-zinc-600 space-y-2 text-right">
              <li>✓ إدارة الفروع المتعددة</li>
              <li>✓ تقارير وتحليلات متقدمة</li>
              <li>✓ إدارة العملاء والموردين</li>
              <li>✓ تصدير واستيراد البيانات (Excel)</li>
              <li>✓ صلاحيات الموظفين</li>
            </ul>
            <button
              onClick={upgradeToPro}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              الترقية الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
