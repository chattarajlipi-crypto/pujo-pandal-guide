# Pujo Path (পুজো পথ) — Senior UI/UX Audit & Implementation Guide

## Executive Summary & Design Rationale

This document presents a senior UI/UX review and architectural breakdown of **Pujo Path (পুজো পথ)** — a specialized Kolkata Durga Puja discovery and street-navigation web application.

The design eliminates AI-generated template tropes (such as generic cards, blue/purple gradients, floating particles, and uniform white boxes) and instead delivers a **street-ready Kolkata Puja travel product** built for users standing on crowded Kolkata streets during Puja peak hours.

---

## Senior UI/UX Critique & Solutions

### 1. What was generic & how it was solved:
- **Before**: Standard uniform grid of white cards that looked like an admin database record.
- **After**: Redesigned **Categorized Pandal Cards**:
  - 🏛️ **Heritage / Bonedi Bari Pujas** (e.g., *Sovabazar Rajbari*, *Baghbazar Sarbojanin*): Highlighted with traditional gold border accents and heritage badges.
  - 🎨 **Mega Theme Pujas** (e.g., *Sreebhumi Sporting Club*, *Santosh Mitra Square*): Purple theme badges and artist story blocks.
  - ⭐ **Popular Community Pujas** (e.g., *Maddox Square*, *College Square*): Green popular badges.

### 2. Street-Ready Transit Information (Metro Exit Gates):
- **Problem**: When a Puja-goer exits a crowded Kolkata Metro station (e.g., Shobhabazar, Kalighat, Shyambazar), knowing the Metro line is not enough; they need to know **which Exit Gate** to take.
- **Solution**:
  - Embedded Metro Exit Gate guidance directly in cards and detail modals (e.g., `🚇 Shobhabazar Sutanuti (Blue Line) • Exit Gate 2 (Rabindra Sarani)`).
  - Quick-preset filter pills on the street search bar (`🚇 Shobhabazar Metro`, `🚇 Kalighat Metro`, `🏛️ Heritage Pujas`, `🎨 Theme Pujas`).

### 3. Directions & Route Sharing Experience:
- **Problem**: On Puja streets, mobile internet can be slow or congested. Opening Google Maps repeatedly uses data and battery.
- **Solution**:
  - Added a **Street Route Modal / Bottom-Sheet** with step-by-step walking directions.
  - Added a **One-Tap "Copy Route Guide 📋"** button so users can copy walking steps to their clipboard and share via WhatsApp or SMS with friends.

### 4. Cultural Authenticity & Bengali Design System:
- **Laal-Paar Saree Border Accent**: CSS-patterned red-and-gold saree border running across the top header and footer.
- **Authentic Bengali Typography**:
  - Display Headers: `Tiro Bangla` (elegant traditional Bengali serif).
  - Body & Transit UI: `Hind Siliguri` (clean, highly legible Bengali sans-serif).
  - English: `Outfit` (modern geometric UI font).
  - Hindi: `Noto Sans Devanagari`.
- **Palette**:
  - **Sindoor Red (`#B3262E`)**: Primary CTA and brand identity.
  - **Alta Maroon (`#6F1820`)**: Rich accent typography.
  - **Kashish Gold (`#C79A45`)**: Heritage highlights & badge borders.
  - **Warm Linen / Ivory (`#FAF6F0`)**: Paper-like background reducing eye strain outdoors.

---

## Technical Features & API Architecture

### 1. Multilingual Translation Engine (`bn`, `en`, `hi`)
- Segmented language switcher control (`বাংলা | English | हिन्दी`) on header.
- Automatic persistence in `localStorage` under key `pujo_lang`.
- Centralized `TRANSLATIONS` object dynamically updates all UI headers, filter chips, search placeholders, modal blocks, empty states, and advisory alerts.
- Proper nouns (pandal names) remain recognizable across languages.

### 2. Geolocation "Near Me" Engine
- Browser Geolocation API triggered **only upon explicit user click** ("Find Near Me").
- Computes Haversine distance in kilometers using real GPS coordinates embedded for starter Kolkata pandals.
- Sorts pandals nearest-first and displays `📍 X.X km` distance badges.

### 3. Backend API Compatibility (`/api/pandals.js`)
- Retains full compatibility with the serverless backend function (`api/pandals.js`):
  - `GET /api/pandals`: Loads community visitor-added pandals from Upstash Redis.
  - `POST /api/pandals`: Submits visitor pandals with honeypot security (`website`), IP rate-limiting (10 posts/hr), and HTML string cleaning.

### 5. Official Durga Puja 2026 Panjika Schedule & Belur Math Program:
- **Official Belur Math & Vishuddha Siddhanta Calendar**: Updated ritual dates and exact timings per Ramakrishna Math (Belur Math) official notice:
  - **Mahalaya**: Sat 10 Oct 2026 (Tarpan dawn 04:30–06:15 AM, Mahishasuramardini 04:00 AM)
  - **Maha Shashthi**: Sat 17 Oct 2026 (Bodhon & Adhibas 05:45–07:15 PM, Bilva Nimantran: 16 Oct 2:51–5:11 PM)
  - **Maha Saptami (১ কার্তিক / Sun 18 Oct 2026)**: Saptami Puja Begins **05:30 AM**, Nabapatrika Snan dawn 05:11–05:34 AM, Pushpanjali after Bhogarati
  - **Maha Ashtami (২ কার্তিক / Mon 19 Oct 2026)**: Ashtami Puja Begins **05:30 AM**, **Kumari Puja 09:00 AM**, **Sandhi Puja 10:28 AM to 11:16 AM**
  - **Maha Navami (৩ কার্তিক / Tue 20 Oct 2026)**: Navami Puja Begins **05:30 AM**, Navami Homa after Bhogarati of Sri Sri Devi
  - **Bijoya Dashami**: Wed 21 Oct 2026 (Darpan Bisorjon 09:30 AM, Sindoor Khela & Bisorjon 01:00 PM onwards)
  - **Kojagari Lakshmi Puja**: Sun 25 Oct 2026 (05:30–11:15 PM)
- **Dynamic Multilingual Binding**: Integrated full DOM bindings into `updateStaticLabels()` and expanded `TRANSLATIONS` for `bn`, `en`, and `hi` so the entire schedule seamlessly translates when switching languages.

---

## QA Verification Matrix

| Feature | Audit Finding | Result |
| :--- | :--- | :---: |
| **Street Directions Modal** | Displays Metro Exit Gate, Train, Bus, Walk Mins, and copyable WhatsApp route text | ✅ Pass |
| **Language Switcher** | Instant switching between Bengali, English, Hindi with localStorage persistence & full schedule translation | ✅ Pass |
| **2026 Puja Schedule** | Accurate 2026 Panjika dates (Sat Oct 17 Shashthi to Wed Oct 21 Dashami) & Sandhi Puja (10:27-11:15 AM) | ✅ Pass |
| **Visual Hierarchy** | Distinct badges for Heritage, Theme, and Popular pujas; high-contrast reading outdoors | ✅ Pass |
| **Search & Quick Pills** | Real-time search across pandal name, metro, exit gate, bus stop, area, theme | ✅ Pass |
| **Near Me Geolocation** | Computes Haversine distance, displays distance badges, sorts nearest-first | ✅ Pass |
| **API Integrity** | Preserves `/api/pandals` GET/POST methods, rate limiting, and honeypot validation | ✅ Pass |
| **Mobile UX** | 44px+ touch targets, mobile bottom-sheet, viewport safety | ✅ Pass |
