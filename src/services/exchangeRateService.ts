/**
 * Exchange Rate Service – USD/TRY
 * 
 * Priority order of data sources:
 *  1. TCMB (Turkish Central Bank XML via CORS proxy)
 *  2. ExchangeRate-API (open.er-api.com – free, no key needed)
 *  3. Frankfurter API (api.frankfurter.app – free, open source)
 *
 * On total failure → returns last cached value from localStorage.
 */

const CACHE_KEY = "cashiertech_exchange_rate_cache";

export interface ExchangeRateResult {
    rate: number;         // USD → TRY rate
    isLive: boolean;      // false when using cached/stale value
    source: string;       // which source succeeded (or "cache")
    timestamp: number;    // unix ms when rate was fetched
}

interface CacheEntry {
    rate: number;
    timestamp: number;
}

// ─── Cache helpers ───────────────────────────────────────────────────
function saveToCache(rate: number): void {
    const entry: CacheEntry = { rate, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

function loadFromCache(): CacheEntry | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CacheEntry;
    } catch {
        return null;
    }
}

// ─── Source 1: TCMB (Turkish Central Bank) ───────────────────────────
async function fetchFromTCMB(): Promise<number> {
    // TCMB blocks direct browser requests, so we use a public CORS proxy.
    const url =
        "https://api.allorigins.win/raw?url=" +
        encodeURIComponent("https://www.tcmb.gov.tr/kurlar/today.xml");

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`TCMB HTTP ${res.status}`);

    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");

    // Find <Currency CurrencyCode="USD"><ForexSelling>...</ForexSelling></Currency>
    const currencies = xml.querySelectorAll("Currency");
    for (const el of currencies) {
        if (el.getAttribute("CurrencyCode") === "USD") {
            const selling = el.querySelector("ForexSelling")?.textContent?.trim();
            const rate = parseFloat(selling ?? "");
            if (!isNaN(rate) && rate > 0) return rate;
        }
    }
    throw new Error("USD not found in TCMB XML");
}

// ─── Source 2: ExchangeRate-API (open.er-api.com) ────────────────────
async function fetchFromExchangeRateAPI(): Promise<number> {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
        signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`ExchangeRate-API HTTP ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.TRY;
    if (!rate || isNaN(rate)) throw new Error("TRY not found in ExchangeRate-API response");
    return rate;
}

// ─── Source 3: Frankfurter API ───────────────────────────────────────
async function fetchFromFrankfurter(): Promise<number> {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=TRY", {
        signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.TRY;
    if (!rate || isNaN(rate)) throw new Error("TRY not found in Frankfurter response");
    return rate;
}

// ─── Main exported function ───────────────────────────────────────────
/**
 * Fetches the latest USD/TRY exchange rate using a 3-source fallback chain.
 * Always resolves (never rejects). Returns `isLive: false` on total failure.
 */
export async function getUsdTryRate(): Promise<ExchangeRateResult> {
    const sources: Array<{ name: string; fn: () => Promise<number> }> = [
        { name: "ExchangeRate-API", fn: fetchFromExchangeRateAPI },
        { name: "TCMB", fn: fetchFromTCMB },
        { name: "Frankfurter", fn: fetchFromFrankfurter },
    ];

    for (const source of sources) {
        try {
            const rate = await source.fn();
            if (rate && !isNaN(rate) && rate > 0) {
                saveToCache(rate);
                return { rate, isLive: true, source: source.name, timestamp: Date.now() };
            }
        } catch (err) {
            console.error(`[ExchangeRate] ${source.name} critical failure:`, err instanceof Error ? err.message : err);
        }
    }

    // All sources failed → fall back to cache
    const cached = loadFromCache();
    if (cached) {
        console.warn("[ExchangeRate] All sources failed. Using cached rate:", cached.rate);
        return {
            rate: cached.rate,
            isLive: false,
            source: "cache",
            timestamp: cached.timestamp,
        };
    }

    // Absolute last resort (no cache either) – return a neutral rate of 0
    return { rate: 0, isLive: false, source: "none", timestamp: Date.now() };
}
