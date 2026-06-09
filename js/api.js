import { API_KEY, BASE_URL } from './config.js';

// Cache for standard fetches (1 hour)
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Heartbeat Cache for real-time loops (15 seconds)
let heartbeatCache = null;
let lastHeartbeatTime = 0;
const HEARTBEAT_DURATION = 1000 * 15; // 15 seconds

/**
 * Optimized network fetcher supporting standard and heartbeat duration caching.
 * @param {string} baseCurrency 
 * @param {boolean} isHeartbeatFetch Bypasses standard hour cache for shorter loop
 */
export async function fetchExchangeRates(baseCurrency, isHeartbeatFetch = false) {
    const now = Date.now();

    // 1. Handle Standard Fetch Cache (1 hour)
    if (!isHeartbeatFetch && cachedRates && cachedRates.base === baseCurrency && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedRates.rates;
    }

    // 2. Handle Heartbeat Fetch Cache (15 seconds) to prevent API abuse
    if (isHeartbeatFetch && heartbeatCache && heartbeatCache.base === baseCurrency && (now - lastHeartbeatTime < HEARTBEAT_DURATION)) {
        return heartbeatCache.rates;
    }

    try {
        // Combines BASE_URL + API_KEY + /latest/ + baseCurrency
        const response = await fetch(`${BASE_URL}${API_KEY}/latest/${baseCurrency}`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        
        if (data.result === "success") {
            const currentRates = data.conversion_rates;
            
            if (isHeartbeatFetch) {
                // Update heartbeat specific cache
                heartbeatCache = { base: baseCurrency, rates: currentRates };
                lastHeartbeatTime = now;
            } else {
                // Standard fetch update
                cachedRates = { base: baseCurrency, rates: currentRates };
                lastFetchTime = now;
            }
            
            return currentRates;
        } else {
            throw new Error(data['error-type'] || "API Error");
        }
    } catch (error) {
        console.error("Error fetching rates:", error);
        return null;
    }
}

/**
 * Generates an optimized, coherent historical dataset.
 * Synthesizes dynamic daily volatility while ensuring data integrity.
 */
export function generateMockHistory(currentRate) {
    const dates = [];
    const rates = [];
    const today = new Date();
    
    // We start 10% lower 30 days ago to show an upward trend line
    let rate = currentRate * 0.90; 
    
    for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Dynamic daily volatility between -1.5% and +2.5%
        const volatility = 1 + (Math.random() * 0.04 - 0.015);
        rate = rate * volatility;
        
        // CRITICAL SYNC: Last day is strictly bound to the real current network rate
        if (i === 0) rate = currentRate;
        
        rates.push(rate.toFixed(4));
    }
    
    return { dates, rates };
}