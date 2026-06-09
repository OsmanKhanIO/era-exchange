import { fetchExchangeRates, generateMockHistory } from './api.js';
import { setupCustomDropdown, updateDropdownUI, updateDisplay, showToast, toggleSkeleton, renderQuickCompare } from './ui.js';

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(err => console.log("SW Registration failed:", err));
    });
}

const amountInput = document.getElementById("amount-input");
const fromContainer = document.getElementById("from-currency");
const toContainer = document.getElementById("to-currency");
const swapIcon = document.getElementById("swap-icon");
const rateDisplay = document.getElementById("exchange-rate-display");
const chartTitle = document.getElementById("chart-title");
const quickStrip = document.getElementById("quick-compare");

let chartInstance = null; 
const numFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

document.addEventListener("DOMContentLoaded", () => {
    const savedFrom = localStorage.getItem("fromCurrency") || "USD";
    const savedTo = localStorage.getItem("toCurrency") || "EUR";

    // Initialize custom dropdowns
    setupCustomDropdown("from-currency", savedFrom, handleCurrencyChange);
    setupCustomDropdown("to-currency", savedTo, handleCurrencyChange);
    
    calculateAndDisplay();
});

function handleCurrencyChange() {
    // Save to local storage using the new custom dataset values
    localStorage.setItem("fromCurrency", fromContainer.dataset.value);
    localStorage.setItem("toCurrency", toContainer.dataset.value);
    calculateAndDisplay();
}

function debounce(func, timeout = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function renderChart(dates, rates, from, to) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    chartTitle.innerText = `30-Day Market Trend: ${from} to ${to}`;

    if (chartInstance) chartInstance.destroy(); 

    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(99, 102, 241, 0.25)'); 
    gradientFill.addColorStop(1, 'rgba(99, 102, 241, 0)');

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
                pointRadius: 0, 
                pointHoverRadius: 6,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                fill: true,
                tension: 0.4 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    borderWidth: 1
                } 
            },
            scales: { 
                x: { display: false }, 
                y: { 
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#a1a1aa', font: { family: 'Plus Jakarta Sans', size: 12 } }
                } 
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}

async function calculateAndDisplay() {
    let amountVal = amountInput.value;
    if (amountVal === "" || amountVal <= 0) {
        amountVal = 1;
        amountInput.value = "1";
    }

    const fromCode = fromContainer.dataset.value;
    const toCode = toContainer.dataset.value;

    toggleSkeleton([rateDisplay, quickStrip], true);
    const rates = await fetchExchangeRates(fromCode);
    toggleSkeleton([rateDisplay, quickStrip], false);

    if (rates && rates[toCode]) {
        const targetRate = rates[toCode];
        const totalExRate = amountVal * targetRate;
        
        const formattedAmount = numFormatter.format(amountVal);
        const formattedTotal = numFormatter.format(totalExRate);
        
        updateDisplay(rateDisplay, `${formattedAmount} ${fromCode} = ${formattedTotal} ${toCode}`);
        renderQuickCompare(rates, amountVal, fromCode);
        
        const historyData = generateMockHistory(targetRate);
        renderChart(historyData.dates, historyData.rates, fromCode, toCode);
        
    } else {
        updateDisplay(rateDisplay, "Unable to fetch data.");
        showToast("Network Error: Using cached data if available.", "error");
    }
}

const debouncedCalculate = debounce(calculateAndDisplay);

amountInput.addEventListener("input", (e) => {
    if (e.target.value.length > 12) e.target.value = e.target.value.slice(0, 12);
    debouncedCalculate();
});

swapIcon.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") swapIcon.click();
});

swapIcon.addEventListener("click", () => {
    // Read from the dataset
    const tempCode = fromContainer.dataset.value;
    const newFrom = toContainer.dataset.value;
    const newTo = tempCode;
    
    // Update the UI
    updateDropdownUI("from-currency", newFrom);
    updateDropdownUI("to-currency", newTo);
    
    // Save to storage
    localStorage.setItem("fromCurrency", newFrom);
    localStorage.setItem("toCurrency", newTo);
    
    // Animation
    swapIcon.style.transform = "rotate(180deg) scale(1.1)";
    setTimeout(() => swapIcon.style.transform = "", 300);
    
    calculateAndDisplay();
});