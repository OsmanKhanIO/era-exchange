import { fetchExchangeRates, generateMockHistory } from './api.js';
import { setupCustomDropdown, updateDropdownUI, updateDisplay, showToast, toggleSkeleton, renderQuickCompare } from './ui.js';

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(err => console.log("SW Registration failed:", err));
    });
}

// DOM References
const amountInput = document.getElementById("amount-input");
const fromContainer = document.getElementById("from-currency");
const toContainer = document.getElementById("to-currency");
const swapIcon = document.getElementById("swap-icon");
const rateDisplay = document.getElementById("exchange-rate-display");
const chartTitle = document.getElementById("chart-title");
const quickStrip = document.getElementById("quick-compare");
const pulseIndicator = document.querySelector(".live-indicator");

// Global State
let chartInstance = null; 
let liveUpdateInterval = null; 
const NUM_FORMATTER = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const HEARTBEAT_INTERVAL = 30000; // 30 seconds for live updates

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const savedFrom = localStorage.getItem("fromCurrency") || "USD";
    const savedTo = localStorage.getItem("toCurrency") || "EUR";

    // Initialize custom searchable dropdown components
    setupCustomDropdown("from-currency", savedFrom, handleCurrencyChange);
    setupCustomDropdown("to-currency", savedTo, handleCurrencyChange);
    
    // Initial display hydration
    calculateAndDisplay(false); // false means isStandardFetch
    
    // Establish Real-Time "Heartbeat" Update Loop
    startHeartbeatLoop();
});


// --- CORE APPLICATION LOGIC ---

/**
 * Main application orchestration engine. Handles state changes.
 * @param {boolean} isHeartbeatSync True if triggered by automated loop
 */
async function calculateAndDisplay(isHeartbeatSync = false) {
    // Input validation
    let amountVal = amountInput.value;
    if (amountVal === "" || amountVal <= 0) {
        amountVal = 1;
        amountInput.value = "1";
    }

    const fromCode = fromContainer.dataset.value;
    const toCode = toContainer.dataset.value;

    // Performance Optimization: Prevent full layout skeleton during heartbeat loops.
    if (!isHeartbeatSync) {
        toggleSkeleton([rateDisplay, quickStrip], true);
    } else {
        // Subtle visual indicator that a heartbeat fetch is happening
        pulseIndicator.style.opacity = '0.5';
    }

    // Network Request: Use appropriate cache based on fetch source
    const rates = await fetchExchangeRates(fromCode, isHeartbeatSync);
    
    if (isHeartbeatSync) {
        pulseIndicator.style.opacity = '1';
    } else {
        toggleSkeleton([rateDisplay, quickStrip], false);
    }

    // Process State Changes
    if (rates && rates[toCode]) {
        const targetRate = rates[toCode];
        const totalExRate = amountVal * targetRate;
        
        const formattedAmount = NUM_FORMATTER.format(amountVal);
        const formattedTotal = NUM_FORMATTER.format(totalExRate);
        
        // Update Asynchronous Displays
        updateDisplay(rateDisplay, `${formattedAmount} ${fromCode} = ${formattedTotal} ${toCode}`);
        renderQuickCompare(rates, amountVal, fromCode);
        
        // Data Visualization: Sync trend data to current rate
        const historyData = generateMockHistory(targetRate);
        renderHistoryChart(historyData.dates, historyData.rates, fromCode, toCode, isHeartbeatSync);
        
    } else {
        // Fallback state
        if(!isHeartbeatSync) {
             updateDisplay(rateDisplay, "Unable to fetch data.");
             showToast("Network Error: Market Engine Initializing...", "error");
        }
    }
}

// --- UTILITIES & STATE LOOPS ---

/**
 * Sets up a debounced input listener.
 * Prevents API rate-limiting during rapid user typing.
 */
function debounce(func, timeout = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

/**
 * Establishes the automated heartbeat loop for real-time synchronization.
 */
function startHeartbeatLoop() {
    // Clear any existing intervals to prevent memory leaks
    if(liveUpdateInterval) clearInterval(liveUpdateInterval);
    
    // Set up loop
    liveUpdateInterval = setInterval(() => {
        // Only run heartbeat sync if the amount input has value and is visible
        if (amountInput.value > 0) {
            calculateAndDisplay(true); // true means isHeartbeatSync
        }
    }, HEARTBEAT_INTERVAL);
}

function handleCurrencyChange() {
    localStorage.setItem("fromCurrency", fromContainer.dataset.value);
    localStorage.setItem("toCurrency", toContainer.dataset.value);
    // On explicit change, always force a standard full-refresh
    calculateAndDisplay(false);
    // Restart loop to ensure timing is correct from the change
    startHeartbeatLoop();
}


// --- DATA VISUALIZATION ENGINE ---

/**
 * Renders or updates the historical trend chart.
 * Uses Position: Relative constraint architecture for dynamic resizing.
 */
function renderHistoryChart(dates, rates, from, to, isUpdate = false) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    chartTitle.innerText = `30-Day Market Trend: ${from} to ${to}`;

    // Performance Optimization: Prevent full chart destruction during heartbeat sync.
    // Instead, update data dynamically for a smoother render.
    if (chartInstance && isUpdate) {
        chartInstance.data.labels = dates;
        chartInstance.data.datasets[0].data = rates;
        chartInstance.update('none'); // Update without animation for premium feel
        return;
    }

    // Full render if first time or explicit currency change
    if (chartInstance) chartInstance.destroy(); 

    // Gradient initialization
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(99, 102, 241, 0.25)'); 
    gradientFill.addColorStop(1, 'rgba(99, 102, 241, 0)');

    // Chart Configuration
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `Exchange Rate`,
                data: rates,
                borderColor: '#6366f1', 
                backgroundColor: gradientFill,
                borderWidth: 3,
                pointRadius: 0, // Performance optimization
                pointHoverRadius: 6,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                fill: true,
                tension: 0.4 // Smoothes the line significantly
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Required for Position:Relative constraint
            plugins: { 
                legend: { display: false }, 
                tooltip: { 
                    backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                    titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 14, weight: 'bold' },
                    titleColor: '#a1a1aa',
                    bodyColor: '#ffffff',
                    padding: 12, 
                    displayColors: false,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8
                } 
            },
            scales: { 
                x: { display: false }, // Hides grid for ultra-premium look
                y: { 
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#a1a1aa', font: { family: 'Plus Jakarta Sans', size: 12 } }
                } 
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}


// --- DOM EVENT LISTENERS ---

const debouncedCalculate = debounce(() => calculateAndDisplay(false));

amountInput.addEventListener("input", (e) => {
    // Prevent exceedingly long inputs from breaking layout spacing
    if (e.target.value.length > 12) e.target.value = e.target.value.slice(0, 12);
    debouncedCalculate();
});

swapIcon.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") swapIcon.click();
});

swapIcon.addEventListener("click", () => {
    const tempCode = fromContainer.dataset.value;
    const newFrom = toContainer.dataset.value;
    const newTo = tempCode;
    
    updateDropdownUI("from-currency", newFrom);
    updateDropdownUI("to-currency", newTo);
    
    localStorage.setItem("fromCurrency", newFrom);
    localStorage.setItem("toCurrency", newTo);
    
    swapIcon.style.transform = "rotate(180deg) scale(1.1)";
    setTimeout(() => swapIcon.style.transform = "", 300);
    
    // Immediate calculation + restart loop
    calculateAndDisplay(false);
    startHeartbeatLoop();
});