<div align="center">
  <img src="logo.png" alt="ERA Exchange Logo" width="120" />
  
  # ERA Exchange
  **Studio-Grade Market Analytics & Currency Valuation Platform**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/Version-1.0.0-success.svg)]()
  [![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-indigo.svg)]()
  [![Deployment](https://img.shields.io/badge/Deployment-Cloudflare%20Pages-F38020.svg)]()
</div>

<br>

## 📌 Executive Summary
**ERA Exchange** is a high-performance, real-time financial utility designed to bridge the gap between institutional-grade data accuracy and modern, frictionless UI/UX design. Engineered from the ground up without heavy frontend frameworks, this application demonstrates a profound understanding of native Web APIs, progressive enhancement, and layout mathematics.

The platform processes live exchange rates via asynchronous data hydration, visualizes 30-day market volatility using Canvas-based rendering, and delivers a fully offline-capable experience through advanced Service Worker caching strategies.

---

## 🏗️ System Architecture & Tech Stack

This application relies strictly on native web technologies to minimize payload size, eliminate dependency bloat, and ensure maximum browser compatibility.

| Layer | Technology / Methodology | Purpose |
| :--- | :--- | :--- |
| **Core** | ES6+ JavaScript (Modules) | Component state management, API orchestration, DOM manipulation. |
| **Styling** | Native CSS3 & Custom Properties | Hardware-accelerated glassmorphism, dynamic viewport scaling (`clamp`). |
| **Network** | Web Fetch API & Service Workers | Asynchronous data fetching and offline-first PWA caching capabilities. |
| **Storage** | Web Storage API (Local Storage) | Persistent state management for cross-session continuity. |
| **Data Viz** | Chart.js (Canvas API) | Fluid, responsive, mathematical rendering of historical market trends. |

---

## 🚀 Core Engineering Features

### 1. Dynamic Viewport Flexboxing (Zero-Scroll Architecture)
Traditional web applications suffer from vertical overflow and scroll-fatigue across fragmented device sizes. ERA Exchange utilizes a **Viewport-Locked Layout Engine**. By combining CSS `clamp()` functions with mathematically calculated flex-grow and flex-shrink constraints, the UI dynamically absorbs available space and resizes internal components. The application flawlessly "hugs" the screen edges—from a 4-inch mobile display to a 4K ultrawide monitor—without ever generating a scrollbar.

### 2. Custom DOM Component Architecture (Searchable Select)
Native HTML `<select>` elements fail to provide a cohesive, cross-browser aesthetic. To solve this, ERA utilizes a custom-built, state-driven dropdown component featuring:
- Bi-directional DOM-to-Dataset state synchronization.
- Real-time client-side search filtering algorithm for traversing 150+ currencies.
- Custom aesthetic scrollbar mapping and intelligent z-index layering via backdrop filters.

### 3. Progressive Web App (PWA) & Caching Strategy
Engineered to meet strict PWA standards, ERA Exchange is fully installable as a standalone application on iOS, Android, and Desktop operating systems. 
- Utilizes an active `sw.js` Service Worker intercepting network requests.
- Implements a cache-first fallback strategy, ensuring the application UI loads instantly even in zero-connectivity environments.
- Automated cache invalidation triggers upon version bumping to prevent stale asset delivery.

### 4. Optimized State Management & Debouncing
To prevent rate-limiting and minimize unnecessary API calls during rapid user input, the application employs a custom **Debounce Utility**. Input events are intercepted and delayed by an optimal threshold (400ms), ensuring the network layer is only engaged once the user has completed their input cycle.

---

## ⚙️ Performance & Accessibility (A11y)
- **Hardware Acceleration:** All glassmorphic layers utilize `backdrop-filter` and `transform` composite layers to offload rendering to the GPU, preventing main-thread blocking.
- **Accessibility:** Fully ARIA-compliant structure. Features explicit `aria-label` attributes, keyboard navigability (Enter/Space to trigger swaps), and `aria-live="polite"` regions for screen-reader compatibility during asynchronous state changes.
- **Defensive Programming:** Implements strict input sanitization, preventing exponential notation blowouts (`e`) and infinite decimal loops via `Intl.NumberFormat`.

---

## 💻 Deployment Pipeline
The application is continuously deployed via a seamless CI/CD pipeline integrated with **Cloudflare Pages**. 
* The production environment serves assets from Cloudflare's edge network, ensuring sub-50ms Time to First Byte (TTFB) globally.

---

<div align="center">
  <p><i>Engineered with precision by <b>Osman Ahmed Khan</b></i></p>
  <a href="https://github.com/OsmanKhanIO">GitHub Profile</a> • 
  <a href="https://your-portfolio-link.com">Portfolio</a>
</div>