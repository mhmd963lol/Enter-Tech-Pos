import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Delete, X, Check } from 'lucide-react';

interface CustomKeypadProps {
    isOpen: boolean;
    onClose: () => void;
    onKeyPress: (key: string) => void;
    onEnter: () => void;
    title?: string;
    value?: string;
    onClear?: () => void;
}

export default function CustomKeypad({ isOpen, onClose, onKeyPress, onEnter, title, value, onClear }: CustomKeypadProps) {

    const handleKeyClick = (key: string) => {
        if (key === 'clear') {
            onClear?.();
        } else if (key === 'enter') {
            onEnter();
        } else {
            onKeyPress(key);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-24 left-6 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden w-72"
                    dir="ltr"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                            <Calculator className="w-5 h-5 text-indigo-500" />
                            <span className="font-bold text-sm tracking-wide">{title || "Numpad"}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Value Preview Screen */}
                    {value !== undefined && (
                        <div className="bg-zinc-900 dark:bg-black w-full p-4 h-16 flex items-center justify-end overflow-hidden">
                            <span className="text-3xl font-mono text-emerald-400 tracking-wider truncate">
                                {value || "0"}
                            </span>
                        </div>
                    )}

                    {/* Keys */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-zinc-950">
                        {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeyClick(key)}
                                className="aspect-square bg-white dark:bg-zinc-800 rounded-xl text-2xl font-bold text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 focus:outline-none select-none flex items-center justify-center font-mono"
                            >
                                {key}
                            </button>
                        ))}

                        <button
                            onClick={() => handleKeyClick('clear')}
                            className="aspect-square bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-red-300 flex items-center justify-center focus:outline-none select-none"
                        >
                            <Delete className="w-6 h-6" />
                        </button>

                        <button
                            onClick={() => handleKeyClick('0')}
                            className="aspect-square bg-white dark:bg-zinc-800 rounded-xl text-2xl font-bold text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 flex items-center justify-center focus:outline-none select-none font-mono"
                        >
                            0
                        </button>

                        <button
                            onClick={() => handleKeyClick('.')}
                            className="aspect-square bg-white dark:bg-zinc-800 rounded-xl text-2xl font-bold text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 flex items-center justify-center focus:outline-none select-none font-mono"
                        >
                            .
                        </button>

                        <button
                            onClick={() => handleKeyClick('enter')}
                            className="col-span-3 py-3 mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold text-lg active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none select-none"
                        >
                            <Check className="w-6 h-6" />
                            إدخال
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
