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

    // Define different animation variants based on the master theme
    let variants = {};
    let transition = {};

    if (master === 'gaming') {
        // Fast, springy, scaling effect
        variants = {
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 1.1, y: -20 },
        };
        transition = { type: 'spring', stiffness: 300, damping: 20 };
    } else if (master === 'luxury') {
        // Slow, smooth fade
        variants = {
            initial: { opacity: 0, filter: 'blur(10px)' },
            animate: { opacity: 1, filter: 'blur(0px)' },
            exit: { opacity: 0, filter: 'blur(10px)' },
        };
        transition = { duration: 0.5, ease: 'easeInOut' };
    } else if (master === 'carbon') {
        // Sharp slide from side
        variants = {
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 50 },
        };
        transition = { duration: 0.3, ease: 'easeOut' };
    } else {
        // Default subtle fade and slide content up
        variants = {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
        };
        transition = { duration: 0.2 };
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
