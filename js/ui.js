import { countryList } from './countries.js';

const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });

// Logic for Custom Dropdowns
export function setupCustomDropdown(containerId, defaultValue, onChangeCallback) {
    const container = document.getElementById(containerId);
    const selectedItem = container.querySelector('.selected-item');
    const selectedImg = selectedItem.querySelector('img');
    const selectedText = selectedItem.querySelector('span');
    const optionsList = container.querySelector('.options-list');
    const searchInput = container.querySelector('.search-box input');
    
    // Store the value in the DOM element
    container.dataset.value = defaultValue;

    // Build the list
    let optionsHtml = '';
    for (let code in countryList) {
        let fullName = code;
        try { fullName = currencyNames.of(code); } catch (e) {}
        const flagUrl = `https://flagcdn.com/48x36/${countryList[code].toLowerCase()}.png`;
        const isSelected = code === defaultValue ? 'selected' : '';
        optionsHtml += `<li data-code="${code}" class="${isSelected}">
                            <img src="${flagUrl}" alt="">
                            <span>${code} - ${fullName}</span>
                        </li>`;
    }
    optionsList.innerHTML = optionsHtml;

    // Set initial display
    updateDropdownUI(containerId, defaultValue);

    // Toggle dropdown open/close
    selectedItem.addEventListener('click', () => {
        // Close others first
        document.querySelectorAll('.custom-select').forEach(el => {
            if (el !== container) el.classList.remove('active');
        });
        container.classList.toggle('active');
        if(container.classList.contains('active')) searchInput.focus();
    });

    // Handle selection
    optionsList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        
        const code = li.dataset.code;
        container.dataset.value = code;
        updateDropdownUI(containerId, code);
        
        container.classList.remove('active');
        onChangeCallback(code);
    });

    // Search filter
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = optionsList.querySelectorAll('li');
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            container.classList.remove('active');
            searchInput.value = ''; // Reset search
            optionsList.querySelectorAll('li').forEach(li => li.style.display = 'flex');
        }
    });
}

export function updateDropdownUI(containerId, code) {
    const container = document.getElementById(containerId);
    container.dataset.value = code; // Sync state
    
    const selectedImg = container.querySelector('.selected-content img');
    const selectedText = container.querySelector('.selected-content span');
    const listItems = container.querySelectorAll('.options-list li');
    
    let fullName = code;
    try { fullName = currencyNames.of(code); } catch (e) {}
    
    // Smooth image fade
    selectedImg.style.transition = "opacity 0.2s ease";
    selectedImg.style.opacity = '0';
    setTimeout(() => {
        selectedImg.src = `https://flagcdn.com/48x36/${countryList[code].toLowerCase()}.png`;
        selectedImg.style.opacity = '1';
    }, 200);
    
    selectedText.innerText = `${code} - ${fullName}`;

    // Update active class in list
    listItems.forEach(li => {
        li.classList.toggle('selected', li.dataset.code === code);
    });
}

export function updateDisplay(element, text) { element.innerText = text; }

export function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-check-circle"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function toggleSkeleton(elements, isLoading) {
    elements.forEach(el => {
        if (isLoading) el.classList.add('skeleton');
        else el.classList.remove('skeleton');
    });
}

export function renderQuickCompare(rates, amount, baseCurrency) {
    const strip = document.getElementById('quick-compare');
    strip.innerHTML = ''; 
    const targets = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].filter(c => c !== baseCurrency).slice(0, 4);
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    targets.forEach(currency => {
        if (rates[currency]) {
            const val = formatter.format(amount * rates[currency]);
            strip.insertAdjacentHTML('beforeend', `
                <div class="quick-card">
                    <span class="currency">${currency}</span>
                    <span class="value">${val}</span>
                </div>
            `);
        }
    });
}