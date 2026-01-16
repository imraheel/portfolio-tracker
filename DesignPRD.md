# Design PRD – UI & UX Specification

## Document Purpose

This document defines **how the user interface and experience should be designed and implemented** for the *Personal Stock 
Investment Tracker*. It focuses on layout, visual hierarchy, interaction patterns, and design consistency — **not code 
implementation**.

The goal is to create a **clean, minimal, data-first interface** suitable for daily personal use.

---

## Design Principles

1. **Clarity over decoration**
   Financial data must be readable at a glance.

2. **Minimal cognitive load**
   No unnecessary UI elements, animations, or distractions.

3. **Consistency**
   Same layout, spacing, and color logic across the app.

4. **Manual-first workflow**
   UI should encourage accurate manual data entry.

---

## Visual Style Guidelines

### Color System

**Base Theme**

* Background: Light (white / very light gray)
* Text: Dark gray / near black

**Semantic Colors**

* Profit / Positive values: Green
* Loss / Negative values: Red
* Neutral / Informational: Gray / Blue

**Rules**

* Colors must indicate **meaning**, not decoration
* Never rely on color alone (also use +/- signs)

---

### Typography

* Font: System default (clean sans-serif)
* Font Sizes:

  * Page Title: Large
  * Section Title: Medium
  * Table Text: Normal
  * Secondary Text: Small

**Rules**

* Numbers must align properly in tables
* Currency values should be visually emphasized

---

### Spacing & Layout

* Use consistent padding throughout
* Avoid dense UI — allow breathing space
* Cards should have subtle borders or shadows

---

## Application Layout

### Global Layout Structure

```
----------------------------------
| Top Header                      |
----------------------------------
| Sidebar | Main Content Area     |
----------------------------------
```

#### Header

* App name
* Optional current date

#### Sidebar Navigation

* Dashboard
* Deposits
* Buy Stocks
* Sell Stocks
* Dividends
* Prices
* Reports
* Import / Export

---

## Dashboard Design

### Dashboard Goals

* Instant snapshot of financial position
* No scrolling required for critical metrics

---

### Dashboard Sections

#### 1. Wallet Summary (Top Row Cards)

Cards:

* Total Deposits
* Available Balance
* Total Invested (Historical)

**Design Rules**

* Cards should be equal width
* Use bold numbers
* Currency clearly visible (Rs.)

---

#### 2. Portfolio Summary

Metrics:

* Current Portfolio Value
* Unrealized P/L
* Realized P/L
* Total Dividends

**Design Rules**

* Profit values green, loss values red
* Show both PKR and percentage where applicable

---

#### 3. Stock Holdings Table

Columns:

* Stock Symbol
* Remaining Qty
* Avg Buy Price
* Current Price
* Invested Amount
* Current Value
* Gain / Loss

**Design Rules**

* Numeric columns right-aligned
* Gain/Loss column color-coded
* Sticky table header recommended

---

## Data Entry Screens Design

### Deposit Screen

* Simple form
* Fields stacked vertically
* Submit button at bottom

**UX Rules**

* Amount field auto-focused
* Validation messages inline

---

### Buy Stock Screen

Fields:

* Stock Symbol (dropdown + add)
* Quantity
* Buy Rate
* Buy Date

**UX Rules**

* Auto-calculate total cost
* Show available balance in header

---

### Sell Stock Screen

Fields:

* Stock Symbol
* Available Quantity (read-only)
* Sell Quantity
* Sell Rate
* Sell Date

**UX Rules**

* Disable submit if quantity exceeds available
* Display estimated realized P/L before submit

---

### Dividend Screen

Fields:

* Stock Symbol
* Dividend Amount
* Dividend Date

**UX Rules**

* Clearly show that dividend adds to wallet

---

### Price Update Screen

Fields:

* Stock Symbol
* Current Price

**UX Rules**

* Highlight impact on unrealized P/L after save

---

## Reports & History Design

### Transaction History

* Tabbed layout:

  * Deposits
  * Buys
  * Sells
  * Dividends

**Design Rules**

* Sortable by date
* Clear transaction type labels

---

## Import / Export Screen Design

### Export Section

* Button per dataset
* Clear file naming convention

### Import Section

* File picker
* Warning message (overwrite existing data)
* Validation result preview

---

## Error & Validation UX

* Errors must be inline and human-readable
* Never show technical error messages
* Use modal or toast only for critical failures

---

## Accessibility Considerations

* Sufficient color contrast
* Keyboard navigable forms
* Clear focus states

---

## Design Do’s and Don’ts

### Do

* Use tables for financial data
* Emphasize totals
* Keep screens focused

### Don’t

* Overuse charts in Phase 1
* Hide important numbers
* Add unnecessary animations

---

## Design Success Criteria

* Dashboard readable in under 5 seconds
* Data entry possible with minimal clicks
* No confusion between realized vs unrealized values

---

**End of Design PRD**

