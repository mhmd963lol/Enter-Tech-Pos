import React from "react";

interface Props {
    className?: string; // For the SVG wrapper
    textClassName?: string; // For the text
    showText?: boolean;
}

export default function CashierTechLogo({
    className = "w-32 h-32 md:w-40 md:h-40",
    textClassName = "text-3xl md:text-5xl",
    showText = true,
}: Props) {
    return (
        <div className={`flex flex-col items-center justify-center gap-4`}>
            {/* SVG Icon */}
            <div className={`${className} relative`}>
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-xl"
                >
                    {/* Base and Stand */}
                    <path d="M40 85 H60 L56 65 H44 Z" fill="currentColor" className="text-zinc-300 dark:text-zinc-700" />
                    <path d="M25 90 H75 A3 3 0 0 1 75 96 H25 A3 3 0 0 1 25 90 Z" fill="currentColor" className="text-zinc-400 dark:text-zinc-600" />

                    {/* Monitor Screen Frame */}
                    <rect x="15" y="20" width="70" height="50" rx="4" fill="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                    {/* Inner Screen */}
                    <rect x="20" y="25" width="60" height="40" rx="2" fill="currentColor" className="text-zinc-100 dark:text-zinc-900" />

                    {/* Chart Line (Upward Trend) representing smart tech/accounting */}
                    <path d="M25 55 L40 35 L55 45 L75 25" stroke="#00E676" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Chart Nodes */}
                    <circle cx="75" cy="25" r="4" fill="#00E676" />
                    <circle cx="55" cy="45" r="3" fill="#00E676" />
                    <circle cx="40" cy="35" r="3" fill="#00E676" />

                    {/* Receipt popping out of the top */}
                    <path d="M75 10 H85 V30 L80 25 L75 30 V10 Z" fill="currentColor" className="text-white dark:text-zinc-300" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <line x1="77" y1="15" x2="83" y2="15" stroke="currentColor" className="text-zinc-300 dark:text-zinc-500" strokeWidth="2" strokeLinecap="round" />
                    <line x1="77" y1="20" x2="83" y2="20" stroke="currentColor" className="text-zinc-300 dark:text-zinc-500" strokeWidth="2" strokeLinecap="round" />

                    {/* Barcode Scanner on the left */}
                    <path d="M10 50 Q18 45, 12 60 L8 75 A4 4 0 0 0 16 78 L25 55 Q20 48, 10 50 Z" fill="currentColor" className="text-zinc-700 dark:text-zinc-400" />
                    {/* Scanner Button */}
                    <rect x="6" y="44" width="14" height="8" rx="2" fill="#00E676" />
                    {/* Laser beam connecting scanner to screen */}
                    <line x1="13" y1="44" x2="25" y2="20" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <div className="text-center">
                    <h1 className={`font-extrabold tracking-tight text-zinc-900 dark:text-white ${textClassName}`} style={{ fontFamily: "Tajawal, sans-serif" }}>
                        كاشير <span className="text-[#00E676]">تك</span>
                    </h1>
                    <p className="text-sm md:text-lg font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase mt-1">
                        Cashier Tech
                    </p>
                </div>
            )}
        </div>
    );
}
