import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Delete, Check, Calculator } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string | number;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  hideControls?: boolean;
}

export default function NumberInput({
  value,
  onChange,
  allowDecimal = false,
  hideControls = false,
  className,
  ...props
}: NumberInputProps) {
  const [showNumpad, setShowNumpad] = useState(false);
  const [numpadEnabled, setNumpadEnabled] = useLocalStorage(
    "app_numpad_enabled",
    true,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const numpadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        numpadRef.current &&
        !numpadRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowNumpad(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNumpadClick = (key: string) => {
    let newValue = value.toString();

    if (key === "backspace") {
      newValue = newValue.slice(0, -1);
    } else if (key === "clear") {
      newValue = "";
    } else if (key === "enter") {
      setShowNumpad(false);
      return;
    } else if (key === ".") {
      if (allowDecimal && !newValue.includes(".")) {
        newValue += newValue === "" ? "0." : ".";
      }
    } else {
      newValue += key;
    }

    onChange(newValue);
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="relative w-full flex items-center">
        <input
          ref={inputRef}
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (allowDecimal) {
              if (/^\d*\.?\d*$/.test(val)) onChange(val);
            } else {
              if (/^\d*$/.test(val)) onChange(val);
            }
          }}
          onFocus={() => numpadEnabled && setShowNumpad(true)}
          className={`w-full ${hideControls ? "px-2" : "pr-10 pl-2"} ${className}`}
          {...props}
        />

        {!hideControls && (
          <>
            {/* Numpad Toggle */}
            <button
              type="button"
              onClick={() => setNumpadEnabled(!numpadEnabled)}
              className={`absolute right-2 p-1.5 rounded-lg transition-colors ${numpadEnabled ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              title={
                numpadEnabled ? "تعطيل لوحة الأرقام" : "تفعيل لوحة الأرقام"
              }
            >
              <Calculator className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Virtual Numpad */}
      <AnimatePresence>
        {showNumpad && numpadEnabled && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] sm:hidden"
              onClick={() => setShowNumpad(false)}
            />

            <motion.div
              key="numpad"
              ref={numpadRef}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-0 left-0 right-0 sm:absolute sm:top-full sm:bottom-auto sm:mt-2 sm:left-auto sm:right-0 z-[100] p-4 sm:p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t sm:border border-zinc-200 dark:border-zinc-700/50 rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl w-full sm:w-64"
              dir="ltr"
            >
              <div className="grid grid-cols-3 gap-2">
                {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpadClick(num)}
                    className="h-10 sm:h-12 text-lg sm:text-xl font-medium text-zinc-800 dark:text-white bg-white/50 dark:bg-zinc-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl shadow-sm border border-white/40 dark:border-zinc-700/50 transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNumpadClick(allowDecimal ? "." : "0")}
                  className="h-10 sm:h-12 text-lg sm:text-xl font-medium text-zinc-800 dark:text-white bg-white/50 dark:bg-zinc-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl shadow-sm border border-white/40 dark:border-zinc-700/50 transition-all active:scale-95"
                >
                  {allowDecimal ? "." : "0"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleNumpadClick(allowDecimal ? "0" : "backspace")
                  }
                  className="h-10 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium text-zinc-800 dark:text-white bg-white/50 dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-xl shadow-sm border border-white/40 dark:border-zinc-700/50 transition-all active:scale-95"
                >
                  {allowDecimal ? (
                    "0"
                  ) : (
                    <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleNumpadClick(allowDecimal ? "backspace" : "enter")
                  }
                  className={`h-10 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium rounded-xl shadow-sm border transition-all active:scale-95 ${allowDecimal ? "text-zinc-800 dark:text-white bg-white/50 dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 border-white/40 dark:border-zinc-700/50" : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"}`}
                >
                  {allowDecimal ? (
                    <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
                {allowDecimal && (
                  <button
                    type="button"
                    onClick={() => handleNumpadClick("enter")}
                    className="col-span-3 h-10 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm border border-indigo-500 transition-all active:scale-95"
                  >
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
