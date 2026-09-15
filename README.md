# 🐉 Dragons of Ice & Fire

> **An interactive cartographic compendium and lore archive exploring the legendary dragons of House Targaryen, wild dragons of Dragonstone, and their riders across Westeros.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![A Song of Ice & Fire](https://img.shields.io/badge/Lore-ASOIAF%20%2F%20HOTD-red?style=for-the-badge)](https://awoiaf.westeros.org/)

---

## 📖 Overview

**Dragons of Ice & Fire** is a high-fantasy interactive web application bringing the draconic history of George R. R. Martin's *A Song of Ice and Fire* and *House of the Dragon* to life. Spanning from **Beyond the Wall** in the frozen north down to the red sands of **Dorne**, users can explore 29 dragons, compare scales and wingspans, trace historical timelines across Targaryen dynasties, and submit archival lore corrections.

---

## ✨ Features

### 🗺️ Interactive Westeros Cartographic Map
- **Full-Continent Vector Canvas**: High-performance SVG Westeros outline spanning over 5,000 pixels with regional awareness from Beyond the Wall down to Dorne.
- **Collision-Free Dragon Positioning**: Algorithmic separation ensuring zero overlap across all 29 dragons on both the eastern and western flanks.
- **Allegiance & Era Filtering**: Filter dragons instantaneously by house factions:
  - 🖤 **The Blacks** (Queen Rhaenyra Targaryen)
  - 💚 **The Greens** (King Aegon II Targaryen)
  - 🌋 **Wild Dragons** (Cannibal, Grey Ghost, Sheepstealer)
  - 👑 **Conquest & Old Royalty** (Balerion, Meraxes, Vhagar, Vermithor)
  - 🔥 **Rebirth Era** (Drogon, Rhaegal, Viserion)
- **Cinematic Smooth Scrolling**: Powered by [Lenis](https://github.com/darkroomengineering/lenis) with momentum easing, dynamic golden dragonfire reading progress bar, and cartographic milestone tracking.

### ⚡ 3-Second Valyrian Transition Screen
- **Cinematic Portal Transition**: When clicking any dragon from the map or compendium, a full-screen Valyrian loading screen activates for 3.0 seconds with:
  - Rising amber ember particles (`@keyframes emberRise`) against a dark molten radial vignette.
  - Dual rotating Valyrian astrolabe rings with coordinate pips and a pulsating heat core displaying the dragon's silhouette.
  - Dynamic Citadel scribe status messages cycling from record retrieval to kindling dragonfire.
  - Molten dragonfire progress gauge with a glowing flare tip.
- **Zero-Latency Image Preloading**: Eagerly caches destination assets (`/dragons/clean/[id].webp` and remote artwork) in browser memory during the transition, eliminating image pop-in.

### 📜 Comprehensive Dragon Lore Profiles (`/dragons/[id]`)
- Detailed specifications: Hatch dates, death locations, bonded riders, scale & flame colors, and dimensions.
- Expandable historical chronicles sourced from Citadel archives and Archmaester accounts.
- Previous / Next dragon navigation controls with seamless transition integration.
- Adaptive **`🐉 ↑ Back to Top`** ascend seal replacing the map's Wall indicator.

### ⏳ Historical Eras & Timeline (`/timeline`)
- Explore Westeros's draconic history segmented by canonical eras:
  - *Aegon's Conquest & Early Dynasty*
  - *The Golden Age of Jaehaerys I*
  - *The Dance of the Dragons*
  - *Extinction & The Dothraki Sea Rebirth*

### ⚔️ Dragon Comparator (`/compare`)
- Side-by-side visual and statistical comparator allowing users to contrast scale, riders, allegiances, and battle records between any two dragons.

### 🛡️ Citadel Archive Community Submissions & Admin Panel (`/admin`)
- **Authentication System**: User registration, login, and OTP verification backed by secure session cookies.
- **Lore Correction Submissions**: Authenticated readers can submit proposed corrections and historical annotations.
- **Curator Admin Dashboard**: Vault administrators can review, acknowledge, discard, or delete community submissions in real-time.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router, Turbopack)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS animations |
| **Typography** | [Cinzel (Google Fonts)](https://fonts.google.com/specimen/Cinzel) & Inter |
| **Smooth Scroll** | [Lenis Smooth Scroll](https://github.com/darkroomengineering/lenis) |
| **Asset Optimization** | [Sharp](https://sharp.pixelplumbing.com/) (image background removal & padding pipeline) |
| **State & Auth** | React Context (`AuthProvider`, `DragonTransitionContext`), JWT/Cookie authentication |

---

## 📂 Project Structure

```text
Dragons-of-Ice-and-Fire/
├── app/
│   ├── layout.tsx              # Root layout with Auth & DragonTransition providers
│   ├── page.tsx                # Main Interactive Westeros Map view
│   ├── globals.css             # Tailwind v4 directives, custom animations & scrollbars
│   ├── dragons/[id]/page.tsx   # Individual dragon lore page
│   ├── timeline/page.tsx       # Historical dynasty eras timeline
│   ├── compare/page.tsx        # Side-by-side dragon comparator
│   ├── admin/page.tsx          # Community submission review dashboard
│   └── api/                    # API route handlers (auth, OTP, submissions)
├── components/
│   ├── DragonTransition.tsx    # 3s cinematic loading screen & preloading system
│   ├── SmoothScroll.tsx        # Lenis smooth scroll & adaptive ascend buttons
│   ├── MapSection.tsx          # Westeros map with collision-free dragon markers
│   ├── WesterosOutlineMap.tsx  # Optimized SVG vector map background
│   ├── DragonImage.tsx         # Resilient image loader (local clean webp + remote fallback)
│   ├── Header.tsx              # Valyrian header with live search dropdown
│   └── AuthModal.tsx           # Citadel login & register modal
├── data/
│   ├── dragons.json            # Primary archive of 29 dragons and lore chronicles
│   ├── factions.ts             # Allegiance metadata, sigils, and color schemes
│   ├── timeline.ts             # Historical era classifications
│   └── submissions.json        # Community correction submissions storage
├── public/
│   └── dragons/clean/          # 29 transparent, pre-padded silhouette webp assets
└── types/                      # TypeScript definitions (dragon, faction, submission, user)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yashmishra11/Dragons-of-Ice-and-Fire.git
   cd Dragons-of-Ice-and-Fire
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the interactive map.

---

## 📦 Production Build

To test and compile the production bundle:

```bash
npm run build
npm run start
```

---

## 📜 Lore Credits & Disclaimer

- Dragon lore, histories, and quotes are based on George R. R. Martin's *A Song of Ice and Fire*, *Fire & Blood*, and the HBO adaptations *Game of Thrones* & *House of the Dragon*.
- Artwork and source illustrations belong to their respective artists and copyright holders.
- This is a non-commercial fan project celebrating the rich lore of Westeros.

---

## ⚔️ License

Distributed under the MIT License. See `LICENSE` for more information.
