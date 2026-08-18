---
name: theme-color-palette
description: >-
  Enforces the official 4-tier brand color palette:
  Primary (Black), Secondary (Green), Tertiary (White), and Quaternary (Orange).
  Mandates SOLID colors (NO GRADIENTS) and MINIMAL ICONS for a clean luxury aesthetic.
  Use this skill when modifying themes, CSS variables, website styling, Ant Design tokens,
  button styles, or designing new UI components.
---

# Official Brand Theme Color Palette Guidelines

This skill defines the official 4-color palette specification and design constraints for the **My Style** system and customer e-commerce website.

---

## 🎨 Official 4-Color Palette Hierarchy

| Priority | Color Role | HEX Code | Tailwind Token | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **1. Primary** | **Black** | `#09090b` / `#000000` | `bg-zinc-950` / `text-zinc-950` / `#09090b` | Main brand color, primary headers, dark sections, primary action buttons, high-contrast text |
| **2. Secondary** | **Green** | `#16a34a` / `#15803d` | `bg-emerald-600` / `text-emerald-600` / `green-600` | Secondary buttons (Add to Bag, Confirm), success states, active navigation indicators, free shipping bar |
| **3. Tertiary** | **White** | `#ffffff` / `#fafafa` | `bg-white` / `text-white` / `zinc-50` | Card containers, surface backgrounds, text on dark surfaces, clean borders |
| **4. Quaternary** | **Orange** | `#f97316` / `#ea580c` | `bg-orange-500` / `text-orange-500` | Badges, promo discount tags, special offers, low-stock warnings, star ratings |

---

## 🚫 Strict Design Constraints

1. **NO GRADIENT COLORS (Solid Colors Only)**:
   - ❌ **Do NOT use**: `bg-gradient-to-r`, `bg-gradient-to-tr`, `bg-clip-text text-transparent`, multi-color blended backgrounds.
   - ✅ **Use**: Clean, solid, high-contrast colors (e.g., solid `#09090b` black, solid `#16a34a` green, solid `#ffffff` white, solid `#f97316` orange).

2. **MINIMAL ICONS (Clean & Uncluttered Luxury Design)**:
   - ❌ **Do NOT place**: Redundant icons on every title, badge, subheader, and button.
   - ✅ **Keep icons minimal**: Essential functional icons only (Search, Shopping Bag, Close, Quantity Stepper). Let clean typography, whitespace, and sharp contrast lead the visual hierarchy.

---

## 🛠️ Implementation Reference

### 1. Website CSS Variables (`website/src/app/globals.css`)
```css
:root {
  --color-primary: #09090b;       /* 1st: Black */
  --color-secondary: #16a34a;     /* 2nd: Green */
  --color-tertiary: #ffffff;      /* 3rd: White */
  --color-quaternary: #f97316;    /* 4th: Orange */
  --color-border: #e4e4e7;
  --color-surface: #fafafa;
}
```

### 2. Standard Component Color Rules

- **Primary Action (Buy Now / Main Action)**: Solid Black (`bg-zinc-950 text-white hover:bg-zinc-800`).
- **Secondary Action (Add to Bag / Confirm)**: Solid Green (`bg-emerald-600 text-white hover:bg-emerald-700` or `border-zinc-950 text-zinc-950 hover:bg-emerald-600 hover:text-white`).
- **Promo Badges / Special Highlights**: Solid Orange (`bg-orange-500 text-white` or `bg-orange-50 text-orange-700 border-orange-200`).
- **Active Navigation Indicator**: Solid Green / Black border underline (`bg-emerald-600` or `bg-zinc-950`).
- **Surface & Cards**: Solid White (`bg-white border-zinc-200`).
