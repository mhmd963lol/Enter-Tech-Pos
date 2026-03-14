import { useRef, useCallback } from "react";
import { Settings } from "../types";

type SoundType = "success" | "error" | "click" | "login_success" | "logout";

/**
 * Manages sound effects for the POS system.
 * Extracted from AppContext to keep audio logic isolated.
 */
export function useSoundSystem(settings: Pick<Settings, "enableSounds" | "masterTheme">) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: SoundType) => {
    if (!settings.enableSounds) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      const audioCtx = audioCtxRef.current;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const t = audioCtx.currentTime;
      const master = settings.masterTheme || "default";

      // System sounds
      if (type === "login_success") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, t);
        oscillator.frequency.exponentialRampToValueAtTime(880, t + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        oscillator.start(t);
        oscillator.stop(t + 0.6);
        return;
      }
      if (type === "logout") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, t);
        oscillator.frequency.exponentialRampToValueAtTime(400, t + 0.2);
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.1, t + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        oscillator.start(t);
        oscillator.stop(t + 0.3);
        return;
      }

      if (master === "gaming") {
        if (type === "success") {
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(440, t);
          oscillator.frequency.setValueAtTime(880, t + 0.1);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          oscillator.start(t);
          oscillator.stop(t + 0.2);
        } else if (type === "click") {
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(600, t);
          oscillator.frequency.exponentialRampToValueAtTime(800, t + 0.05);
          gainNode.gain.setValueAtTime(0.05, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          oscillator.start(t);
          oscillator.stop(t + 0.1);
        } else {
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(150, t);
          oscillator.frequency.linearRampToValueAtTime(100, t + 0.3);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.linearRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        }
      } else if (master === "cashier-tech") {
        if (type === "success") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523, t);
          oscillator.frequency.exponentialRampToValueAtTime(784, t + 0.08);
          oscillator.frequency.exponentialRampToValueAtTime(1047, t + 0.2);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.12, t + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
          oscillator.start(t);
          oscillator.stop(t + 0.35);
        } else if (type === "click") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(700, t);
          oscillator.frequency.exponentialRampToValueAtTime(900, t + 0.04);
          gainNode.gain.setValueAtTime(0.04, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          oscillator.start(t);
          oscillator.stop(t + 0.08);
        } else {
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(400, t);
          oscillator.frequency.exponentialRampToValueAtTime(200, t + 0.25);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        }
      } else if (master === "luxury") {
        if (type === "success") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(600, t);
          oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.1, t + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          oscillator.start(t);
          oscillator.stop(t + 0.8);
        } else if (type === "click") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, t);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.03, t + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        } else {
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(300, t);
          oscillator.frequency.exponentialRampToValueAtTime(250, t + 0.3);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.05, t + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          oscillator.start(t);
          oscillator.stop(t + 0.4);
        }
      } else {
        // Default theme sounds
        if (type === "success") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(440, t);
          oscillator.frequency.exponentialRampToValueAtTime(880, t + 0.15);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.1, t + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        } else if (type === "click") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(600, t);
          gainNode.gain.setValueAtTime(0.05, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          oscillator.start(t);
          oscillator.stop(t + 0.08);
        } else {
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(200, t);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        }
      }
    } catch (e) {
      // Audio API failures are non-critical
    }
  }, [settings.enableSounds, settings.masterTheme]);

  return { playSound };
}
