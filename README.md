# Upright Smart Solution (vanilla HTML/CSS/JS)

A lightweight browser-based financial tracking app for rent & installment management. Built with plain HTML, CSS, and JavaScript with LocalStorage persistence.

## Features (starter)
- Renters list & cards
- Add renter modal form
- Add payments and basic pending/overdue detection
- Installment customer cards with payment entry
- Dashboard analytics (Chart.js)
- PDF export (jsPDF) placeholders for invoices & lists
- LocalStorage data persistence
- Demo sample data included

## Folder structure
- index.html — main UI
- styles.css — layout and UI styling (mobile-first)
- app.js — application logic (LocalStorage, UI, basic analytics)
- data/sample-data.js — demo data to bootstrap first run

## How to run
1. Download the files and open `index.html` in a modern browser.
2. The app seeds demo data on first load.
3. Use the "Add" button to create a renter. Use card actions to add payments or export invoice.

## Extend & Integrate
- Replace LocalStorage with backend APIs (REST) later — app exposes `window.uss` helpers for quick integration.
- Improve invoice/report templates & branding using jsPDF or server-side PDF generation.
- Add notifications (email/WhatsApp/SMS) via backend integrations (placeholders exist).
- Add user authentication & multi-user/team support.
- Add IndexedDB for larger datasets & improved search.

## Notes & suggestions
- This scaffold focuses on clear structure and incremental enhancement.
- Keep UI modular: extract components into separate JS modules when moving to build pipeline.
- Add tests around financial calculations (late fee rules, monthly boundaries).

License: MIT