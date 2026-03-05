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

    // Optimized transitions: GPU-friendly, no blur, no layout-thrashing transforms
    let variants = {};
    let transition = {};

    if (master === 'gaming') {
        // Cyberpunk: fast opacity + translateY only (no scaleX/skewX for performance)
        variants = {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -15 },
        };
        transition = { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

    } else if (master === 'luxury') {
        // Luxury: elegant fade with subtle lift (removed blur for performance)
        variants = {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
        };
        transition = { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] };

    } else if (master === 'carbon') {
        // Carbon: fast mechanical slide
        variants = {
            initial: { opacity: 0, x: 30 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -30 },
        };
        transition = { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

    } else {
        // Default: clean quick fade-up
        variants = {
            initial: { opacity: 0, y: 6 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -6 },
        };
        transition = { duration: 0.12, ease: 'easeOut' };
    }

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={transition}
                style={{ willChange: 'transform, opacity' }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
