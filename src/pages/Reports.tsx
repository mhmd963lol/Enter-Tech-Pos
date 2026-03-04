import React from "react";
import ProFeatureLock from "../components/ProFeatureLock";

export default function Reports() {
  return (
    <ProFeatureLock
      featureName="التقارير المتقدمة"
      description="تحليل الأرباح والخسائر، تقارير الضرائب، حركة الأصناف، وأداء الموظفين."
    >
      <div className="p-8">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">
          التقارير المتقدمة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-50 rounded-2xl h-64 border border-zinc-100 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-zinc-200 border-t-indigo-500"></div>
          </div>
          <div className="bg-zinc-50 rounded-2xl h-64 border border-zinc-100 p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-zinc-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </ProFeatureLock>
  );
}
