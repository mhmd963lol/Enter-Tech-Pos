import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

interface ThemePageTransitionProps {
    children: React.ReactNode;
}

export default function ThemePageTransition({ children }: ThemePageTransitionProps) {
    const { settings } = useAppContext();
    const location = useLocation();
    const master = settings.masterTheme || 'default';

    // Fast, visually impactful transitions per-theme
    let variants = {};
    let transition = {};

    if (master === 'gaming') {
        // Cyberpunk: instant warp-in from bottom + glitch-like offset
        variants = {
            initial: { opacity: 0, y: 30, scaleX: 0.97, skewX: '0.5deg' },
            animate: { opacity: 1, y: 0, scaleX: 1, skewX: '0deg' },
            exit: { opacity: 0, y: -30, scaleX: 1.03, skewX: '-0.5deg' },
        };
        transition = { type: 'spring', stiffness: 500, damping: 28, mass: 0.6 };

    } else if (master === 'luxury') {
        // Luxury: silky fade with subtle lift-and-blur
        variants = {
            initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
            animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
            exit: { opacity: 0, y: -16, filter: 'blur(4px)' },
        };
        transition = { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] };

    } else if (master === 'carbon') {
        // Carbon: fast mechanical slide from side, sharp
        variants = {
            initial: { opacity: 0, x: 40, scale: 0.98 },
            animate: { opacity: 1, x: 0, scale: 1 },
            exit: { opacity: 0, x: -40, scale: 0.98 },
        };
        transition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

    } else {
        // Default: clean quick fade-up
        variants = {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
        };
        transition = { duration: 0.15, ease: 'easeOut' };
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={transition}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
