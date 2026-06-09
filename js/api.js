import { API_KEY, BASE_URL } from './config.js';

export async function fetchExchangeRates(fromCurrency) {
    try {
        const url = `${BASE_URL}/${API_KEY}/latest/${fromCurrency}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response error");
        
        const data = await response.json();
        // Return ALL rates so we can do the Quick Compare strip
        return data.conversion_rates; 
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

export function generateMockHistory(liveRate) {
    const dates = [];
    const rates = [];
    let simulatedRate = liveRate * (1 + (Math.random() * 0.06 - 0.03)); 
    
    for (let i = 30; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const pullToCenter = (liveRate - simulatedRate) * 0.1;
        const randomVolatility = (Math.random() - 0.5) * (liveRate * 0.005);
        simulatedRate += pullToCenter + randomVolatility;
        
        if (i === 0) simulatedRate = liveRate;
        rates.push(parseFloat(simulatedRate.toFixed(4)));
    }
    return { dates, rates };
}