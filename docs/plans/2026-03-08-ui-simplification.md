# UI Simplification Implementation Plan

> **For Claude:** Use this plan directly for implementation task-by-task.

**Goal:** Simplify the application UI by switching from dark to light theme, removing all motion animations (Framer Motion), and using only Roboto font to reduce bundle size and improve performance.

**Architecture:** Convert dark theme CSS variables to light theme colors, replace all Framer Motion components with regular React elements, update Tailwind config for light theme and Roboto font only.

**Tech Stack:** React 18, Vite, Tailwind CSS, Framer Motion (to be removed)

---

### Task 1: Update index.html - Change Google Fonts

**Files:**
- Modify: `index.html:11-13`

**Step 1: Replace Google Fonts import**

Replace the current Google Fonts import (JetBrains Mono + Playfair Display) with Roboto only.

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

**Step 2: Save and verify**

---

### Task 2: Update tailwind.config.js - Light theme colors and Roboto font

**Files:**
- Modify: `tailwind.config.js:1-79`

**Step 1: Replace entire tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Roboto', 'monospace'],
      },
      colors: {
        background: {
          primary: '#ffffff',
          secondary: '#f8f9fa',
          tertiary: '#e9ecef',
          elevated: '#ffffff',
        },
        foreground: {
          primary: '#1a1a1a',
          secondary: '#495057',
          muted: '#6c757d',
        },
        accent: {
          gold: '#b8935f',
          'gold-light': '#d4a574',
          'gold-dark': '#9a7b4f',
          coral: '#e07a5f',
          'coral-light': '#f0937a',
          sage: '#81b29a',
          'sage-light': '#9bc4b0',
        },
        border: {
          DEFAULT: '#dee2e6',
          subtle: '#e9ecef',
          accent: 'rgba(212, 165, 116, 0.3)',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'gold': '0 0 20px rgba(212, 165, 116, 0.1)',
      },
      borderRadius: {
        'card': '0.5rem',
        'button': '0.375rem',
      },
      animation: {},
    },
  },
  plugins: [],
}
```

**Step 2: Save**

---

### Task 3: Update globals.css - Light theme CSS variables and remove animations

**Files:**
- Modify: `src/globals.css:1-355`

**Step 1: Replace CSS with light theme**

Replace the entire globals.css file with the following light theme version:

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --bg-elevated: #ffffff;
    
    --text-primary: #1a1a1a;
    --text-secondary: #495057;
    --text-muted: #6c757d;
    
    --accent-gold: #b8935f;
    --accent-gold-light: #d4a574;
    --accent-gold-dark: #9a7b4f;
    
    --accent-coral: #e07a5f;
    --accent-coral-light: #f0937a;
    
    --accent-sage: #81b29a;
    --accent-sage-light: #9bc4b0;
    
    --border-subtle: #e9ecef;
    --border-default: #dee2e6;
    --border-accent: rgba(212, 165, 116, 0.3);
    
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.1);
    --shadow-gold: 0 0 20px rgba(212, 165, 116, 0.1);
  }

  * {
    @apply border-[var(--border-subtle)];
  }

  body {
    @apply bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased;
    font-family: 'Roboto', sans-serif;
  }
}

@layer components {
  .font-display {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
  }

  .font-mono {
    font-family: 'Roboto', sans-serif;
  }

  .glass-card {
    @apply relative overflow-hidden rounded bg-white border border-gray-200;
  }

  .border-accent-left {
    position: relative;
  }

  .border-accent-left::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--accent-gold);
  }

  .text-gradient-gold {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, var(--accent-gold-light) 0%, var(--accent-gold) 50%, var(--accent-gold-dark) 100%);
  }

  .status-positive {
    color: var(--accent-sage);
  }

  .status-negative {
    color: var(--accent-coral);
  }

  .data-table {
    @apply w-full border-collapse;
  }

  .data-table th {
    @apply text-left py-3 px-4 text-xs uppercase tracking-widest;
    color: var(--text-muted);
    font-weight: 500;
    border-bottom: 1px solid var(--border-default);
  }

  .data-table td {
    @apply py-4 px-4;
    border-bottom: 1px solid var(--border-subtle);
  }

  .data-table tr:last-child td {
    border-bottom: none;
  }

  .btn-primary {
    @apply px-6 py-3 rounded-md font-medium;
    background: var(--accent-gold);
    color: white;
    border: none;
  }

  .btn-secondary {
    @apply px-6 py-3 rounded-md font-medium;
    background: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
  }

  .input-elegant {
    @apply w-full px-4 py-3 rounded-md bg-white text-[var(--text-primary)];
    border: 1px solid var(--border-default);
    font-family: 'Roboto', sans-serif;
  }

  .input-elegant:focus {
    outline: none;
    border-color: var(--accent-gold);
  }

  .input-elegant::placeholder {
    color: var(--text-muted);
  }

  .section-header {
    @apply flex items-baseline gap-4 mb-6;
  }

  .section-header h2 {
    @apply text-2xl;
    color: var(--text-primary);
  }

  .section-header .line {
    @apply flex-1 h-px;
    background: var(--border-default);
  }

  .metric-value {
    @apply text-3xl font-semibold;
    color: var(--text-primary);
  }

  .metric-value.positive {
    color: var(--accent-sage);
  }

  .metric-value.negative {
    color: var(--accent-coral);
  }

  .currency-pkr {
    @apply font-normal;
  }

  .currency-pkr::before {
    content: 'Rs.';
    @apply text-sm mr-1 opacity-60;
  }

  .chart-container {
    @apply relative rounded p-6;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
  }

  .nav-active {
    position: relative;
    background: rgba(212, 165, 116, 0.1);
    color: var(--accent-gold) !important;
  }

  .nav-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--accent-gold);
  }

  .card-hover {
    @apply transition-colors duration-200;
  }

  .card-hover:hover {
    border-color: var(--border-accent);
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

**Step 2: Save**

---

### Task 4: Remove Framer Motion from all pages

**Files to modify (15 files):**
- `src/pages/stocks/Stocks.tsx`
- `src/pages/stocks/Wallet.tsx`
- `src/pages/stocks/Transactions.tsx`
- `src/pages/crypto/CryptoList.tsx`
- `src/pages/crypto/Purchases.tsx`
- `src/pages/crypto/Withdrawals.tsx`
- `src/pages/crypto/Transactions.tsx`
- `src/pages/mutualFunds/FundsList.tsx`
- `src/pages/mutualFunds/Purchases.tsx`
- `src/pages/mutualFunds/Withdrawals.tsx`
- `src/pages/mutualFunds/Transactions.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Reports.tsx`
- `src/pages/Settings.tsx`

**Step 1: Replace motion components with regular elements in each file**

For each file, remove the framer-motion import and replace:
- `motion.div` → `div`
- `motion.tr` → `tr`
- Remove `variants` props
- Remove `initial`, `animate`, `exit` props

Example pattern for `Stocks.tsx`:
```tsx
// Remove: import { motion } from 'framer-motion';
// Remove: import { itemVariants } from '@/components/ui/pageTransition';
// Replace <motion.div> with <div>
// Replace <motion.tr> with <tr>
// Remove variants={itemVariants}
```

**Step 2: Save each file**

---

### Task 5: Remove animate-pulse from components

**Files:**
- Modify: Various page files (12 files) - remove `animate-pulse` class from loading skeletons

**Step 1: Remove animate-pulse class**

Remove `animate-pulse` class from loading Card components, replace with static gray background:
- Find: `className="animate-pulse ..."`
- Replace with: `className="bg-gray-100 ..."`

Example:
```tsx
// Before
<Card className="animate-pulse">
// After  
<Card className="bg-gray-100">
```

---

### Task 6: Remove framer-motion dependency from package.json

**Files:**
- Modify: `package.json`

**Step 1: Remove framer-motion from dependencies**

```bash
pnpm remove framer-motion
```

Or manually remove from package.json and run `pnpm install`

---

### Task 7: Run lint and verify

**Step 1: Run lint**

```bash
pnpm lint
```

**Step 2: Fix any errors**

---

### Task 8: Test the application

**Step 1: Start dev server**

```bash
pnpm dev
```

**Step 2: Verify:**
- Light theme is applied everywhere
- No animations on page transitions
- All text uses Roboto font
- No dark backgrounds anywhere
