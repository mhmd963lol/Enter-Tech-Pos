/**
 * useExchangeRate hook
 * 
 * - Fetches USD/TRY rate on mount
 * - Refreshes every REFRESH_INTERVAL_MS (default: 1 hour)
 * - Exposes `isRateLive` so the UI can show ⚠️ when using stale data
 */

import { useState, useEffect, useRef } from "react";
import { getUsdTryRate, ExchangeRateResult } from "../services/exchangeRateService";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export interface UseExchangeRateReturn {
    rate: number;
    isRateLive: boolean;
    rateSource: string;
    rateTimestamp: number;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

export function useExchangeRate(): UseExchangeRateReturn {
    const [result, setResult] = useState<ExchangeRateResult>({
        rate: 0,
        isLive: false,
        source: "none",
        timestamp: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchRate = async () => {
        setIsLoading(true);
        try {
            const data = await getUsdTryRate();
            setResult(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch immediately on mount
        fetchRate();

        // Schedule hourly refresh
        intervalRef.current = setInterval(fetchRate, REFRESH_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return {
        rate: result.rate,
        isRateLive: result.isLive,
        rateSource: result.source,
        rateTimestamp: result.timestamp,
        isLoading,
        refresh: fetchRate,
    };
}
