---
name: EscapePlan
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#464554'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#476800'
  on-secondary: '#ffffff'
  secondary-container: '#bcf063'
  on-secondary-container: '#4b6d00'
  tertiary: '#a53337'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64b4d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#bff365'
  secondary-fixed-dim: '#a4d64c'
  on-secondary-fixed: '#131f00'
  on-secondary-fixed-variant: '#354e00'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410006'
  on-tertiary-fixed-variant: '#881d24'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is built for a premium consumer fintech experience that balances financial rigor with the emotional aspiration of freedom. The brand personality is "The Sophisticated Navigator"—intelligent, composed, and quietly confident. It eschews the aggressive "hustle" culture of traditional fintech in favor of a serene, curiosity-driven atmosphere.

The visual style is **Modern Tactile Minimalism**. It utilizes heavy whitespace and a refined color palette to create a sense of breathing room, while employing subtle physical metaphors (soft shadows and layered cards) to ensure the interface feels grounded and trustworthy. The goal is to evoke an emotional response of clarity and optimism, making complex financial planning feel like an approachable journey rather than a chore.

## Colors

This design system utilizes a "Warm High-Fidelity" palette. The foundation is built on a soft, off-white background to reduce eye strain and provide a more organic feel than pure white.

- **Primary (Violet):** Used for primary actions, progress indicators, and active states. It represents intelligence and modern finance.
- **Secondary (Lime):** Reserved for "Value Add" moments—growth, success, and surplus. It provides a fresh, energetic contrast.
- **Tertiary (Coral):** Used sparingly for alerts, deletions, or "burn" rates, providing a soft but clear warning.
- **Neutral (Charcoal):** Applied to all primary text and iconography to maintain a high-contrast, professional legibility.
- **Surface:** A slightly cooler grey (#F3F4F6) is used for secondary containers to create subtle depth against the warm background.

## Typography

The typography uses **Plus Jakarta Sans** across all levels to maintain a friendly, contemporary, and geometric appearance. 

Visual hierarchy is established through dramatic scale shifts rather than excessive weight changes. Display styles use tighter letter spacing and bold weights to command attention, while body text maintains a generous line height for maximum readability. For mobile devices, display sizes scale down significantly to ensure headings do not wrap awkwardly, maintaining a "single-glance" information density.

## Layout & Spacing

This design system employs a **Fluid-Fixed Hybrid** grid. 

- **Mobile:** A 4-column fluid grid with 20px margins and 20px gutters. 
- **Desktop:** A 12-column grid with a maximum content width of 1280px, centered on the screen. 

The spacing rhythm is strictly based on a 4px baseline. Components should primarily use `lg` (24px) for internal padding and `xl` (40px) for section vertical spacing to reinforce the "premium/airy" feel. Containers should follow a "layered stack" approach where related items are grouped with `sm` or `md` spacing, and distinct conceptual blocks are separated by `xl`.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Ambient Diffusion**. 

- **Level 0 (Background):** #F9F9F8.
- **Level 1 (Cards/Containers):** Pure white (#FFFFFF) with a very soft, large-radius shadow (Blur: 30px, Y: 10px, Color: Neutral at 4% opacity).
- **Level 2 (Active/Floating):** Pure white with a more pronounced shadow (Blur: 40px, Y: 15px, Color: Primary at 8% opacity). This creates a "tinted lift" effect for interactive elements.

Avoid harsh black shadows or heavy borders. Instead, use 1px inner strokes in #F3F4F6 to define card edges against the background.

## Shapes

The shape language is "Generous & Refined." 

Standard components (buttons, small inputs) use a **12px (0.75rem)** radius. Large layout containers and primary dashboard cards use a **24px (1.5rem)** radius to create a soft, approachable frame for data. Progress bars and chips utilize a fully rounded "pill" shape to contrast against the more structured rectangular cards.

## Components

- **Buttons:** Primary buttons use a solid Indigo (#6366F1) background with white text. Secondary buttons use a subtle ghost style with a 1px #F3F4F6 border. All buttons have a height of 56px for a tactile, "premium" touch target.
- **Tactile Cards:** Use the Level 1 elevation. For "Plan" cards, incorporate a subtle linear gradient top-to-bottom (White to #F9F9F8) to add a slight 3D feel.
- **Progress Indicators:** Use thick, 8px rounded tracks. The track background is #F3F4F6, and the fill is the Primary Indigo or Secondary Lime.
- **Input Fields:** Large, 16px font size with 16px internal padding. Labels are always positioned above the field in `label-md` charcoal.
- **Chips:** Used for categories or status. High-radius (pill), using low-opacity versions of the accent colors (e.g., Lime at 15% opacity with Charcoal text) to remain readable but distinct.
- **Data Visuals:** Line charts should use a 3px stroke width with a soft gradient area fill beneath the line to provide a sense of volume.