import React from "react";
import { Construction } from "lucide-react";
import { motion } from "motion/react";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center space-y-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400"
      >
        <Construction className="w-12 h-12" />
      </motion.div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
        {title}
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
        هذه الميزة قيد التطوير حالياً وسيتم توفيرها في التحديثات القادمة.
      </p>
    </div>
  );
}
