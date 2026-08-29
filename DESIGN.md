---
name: EscapePlan
description: A practical decision map that turns assessment signals into a clear, comparable route to a business test.
colors:
  route-indigo: "#4b4ee8"
  route-indigo-deep: "#3033bd"
  signal-lime: "#b9ec57"
  ink: "#202027"
  muted-ink: "#686774"
  divider: "#dedde7"
  paper: "#fffdfb"
  warm-canvas: "#f7f5f3"
  indigo-wash: "#ecebff"
  capital-indigo: "#292b63"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(34px, 9vw, 58px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(25px, 6vw, 38px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  masked: "5px"
  action: "14px"
  panel: "16px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
  section: "42px"
components:
  button-primary:
    backgroundColor: "{colors.route-indigo}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "0 24px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.route-indigo-deep}"
    textColor: "#ffffff"
  route-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
    padding: "13px 15px"
  question-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
    padding: "15px 16px"
  signal-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 9px"
---

# Design System: EscapePlan

## Overview

**Creative North Star: "The Decision Map"**

EscapePlan should feel like a clear route emerging from uncertainty. Warm-white space keeps the experience calm and human; crisp indigo branches, nodes, dividers, and checks make the reasoning visible. The visual system is practical rather than aspirational: it helps a founder compare constraints, recognize a fit, and decide what to test.

The post-assessment experience follows a durable progression: Reveal → Reward → New Mystery → Comparison → ₹199. Each screen answers one question and opens the next, using short direct copy and one purposeful visual change. Preview and payment language must remain truthful. Assessment and conversion screens do not expose marketing navigation; the paid report alone keeps its report-only navigation.

**Key Characteristics:**

- Warm, quiet canvas with high-contrast ink and a disciplined indigo accent.
- The Escape Route Map as the signature visual: crisp branches, circular origins, ranked route cards, and deliberately obscured alternatives.
- Qualitative Business DNA expressed as named traits and readable signals, never fabricated precision.
- Mobile-first single-column reading that expands into selective two-column comparisons.
- Brief, one-time motion that explains filtering, drawing, revealing, or unlocking.

## Colors

The palette pairs a practical indigo with warm paper neutrals; lime is reserved for unmistakable completion.

### Primary

- **Route Indigo:** The active route, primary actions, checks, progress fills, and origin nodes.
- **Deep Route Indigo:** Hover states, small labels, and stronger emphasis where the brighter accent would compete with content.

### Secondary

- **Signal Lime:** Success confirmation only, especially the unlocked check. It is not a general decorative accent.
- **Capital Indigo:** The dark comparison panel that frames the user's potential test capital against the ₹199 unlock.

### Neutral

- **Warm Canvas:** The page background; warmer than clinical white without becoming beige.
- **Paper:** Cards and raised route destinations.
- **Ink:** Headlines and primary copy.
- **Muted Ink:** Explanations, caveats, metadata, and secondary labels.
- **Divider:** Hairlines, card borders, and trait-track structure.
- **Indigo Wash:** A soft highlight for the partially revealed strongest-path panel.

### Named Rules

**The Route Owns Indigo Rule.** Reserve saturated indigo for decisions, route geometry, and interaction; its repetition should make the path legible.

**The Lime Means Done Rule.** Use lime only for a completed, successful unlock or equally definitive completion state.

## Typography

**Display Font:** Manrope (with sans-serif fallback)  
**Body Font:** Manrope (with sans-serif fallback)

**Character:** Manrope keeps the system direct, contemporary, and readable while its heavy weights give short statements conviction. Hierarchy comes from scale, weight, and tight display tracking rather than multiple typefaces.

### Hierarchy

- **Display:** Heavy, tightly tracked, and responsive. Use for one decisive statement per screen; balance wrapping and keep it near 12–16 characters wide where the composition permits.
- **Headline:** Heavy and compact for section turns such as the new mystery or unlock proposition.
- **Body:** Regular-weight explanatory copy with comfortable leading and a maximum readable measure around 58 characters.
- **Label:** Heavy, uppercase, and letter-spaced for stage names, eyebrow copy, statuses, and small comparison labels.

### Named Rules

**The Short Answer Rule.** Headlines state the conclusion or question directly; supporting copy explains the constraint in one compact paragraph.

**The Precision Without Scores Rule.** Business DNA labels may name qualitative strength and fit, but must not imply a measured probability or unsupported numeric score.

## Layout

The system begins at 320px and uses an 18px mobile gutter. Core reading surfaces cap at 760px; cinematic analysis and comparison surfaces expand to 1080px. Mobile remains a single vertical sequence with full-width actions. At 760px, only relationships that benefit from side-by-side reading change: analysis becomes a two-column reveal, the paywall becomes a question-and-price split, and locked questions form a two-column grid.

Headers are compact (64px mobile, 76px desktop), separated by a hairline. After assessment they identify the stage and brand but provide no marketing exit. The price panel may become sticky on desktop; the narrative remains linear on mobile. The checkout stays intentionally narrow at 460px.

**The One Earned Step Rule.** Give each screen one dominant message and one primary continuation. Do not collapse the five-stage post-quiz progression into a dashboard.

## Elevation & Depth

EscapePlan is flat by default. Depth appears where it clarifies action or destination: primary buttons have a diffuse indigo lift, origin nodes carry a compact glow, and route cards use a quiet neutral shadow. Borders and tonal changes do most structural work.

### Shadow Vocabulary

- **Action Lift** (`0 13px 30px rgba(75,78,232,.22)`): Primary action only.
- **Origin Glow** (`0 12px 28px rgba(75,78,232,.28)`): The YOU node on route diagrams.
- **Route Card Lift** (`0 8px 24px rgba(32,32,39,.08)`): Ranked destinations on the Escape Route Map.

### Named Rules

**The Flat Until Meaningful Rule.** Do not shadow every panel; lift only actions, origins, and destinations that need to read above the route field.

## Shapes

The form language mixes crisp one-pixel route lines with gently curved rectangular controls. Buttons and route/question cards use a consistent 14px corner; larger highlighted panels use 16px. Origin and endpoint nodes are true circles, while category labels and trait tracks are pills. Hidden names use small 5px masks so they read as redacted information rather than interactive chips.

**The Node-and-Branch Rule.** Route diagrams use circles for decisions or endpoints, one-pixel branches for relationships, and rounded rectangles for named destinations.

## Components

### Buttons

- **Shape:** Confident rounded rectangle with a 14px radius and a 56px minimum height.
- **Primary:** Route Indigo, white heavy text, 24px horizontal padding; use full width at the bottom of mobile stages.
- **Hover / Focus:** Shift to Deep Route Indigo and lift 2px over 180ms. Keyboard focus uses a visible 3px violet outline with 3px offset.
- **Behavior:** Labels name the next value—show, reveal, compare, preview, unlock, or open—rather than using generic “Continue.”

### Chips

- **Style:** Tiny paper pills with a one-pixel divider border, muted heavy text, and 6px by 9px padding.
- **State:** Category nodes may fade as analysis filters routes; they are information, not controls.

### Cards / Containers

- **Route Cards:** Paper destinations with 14px corners, restrained lift, rank, route name, and a short comparison basis.
- **Question Cards:** Flat paper cards with divider borders and 14px corners; locked information is shown as a neutral mask with an explicit “Locked” label.
- **Insight Panel:** Indigo Wash with 16px corners for the strongest-path teaser.
- **Capital Comparison:** Capital Indigo with white copy and pale indigo metadata; it is a deliberate contrast block, not a reusable dark theme.

### Navigation

- **Assessment and conversion:** Brand mark plus stage label only. The brand mark is non-interactive after assessment; no marketing navigation appears.
- **Paid report:** Keep the report-only destinations Overview, Matches, Money, Quit Plan, and 30 Days. Desktop uses a horizontal compact nav; mobile collapses it into the report menu.

### Escape Route Map

The Escape Route Map is the signature component. A circular YOU origin sends crisp indigo branches toward ranked paper destinations. The strongest route is named; alternatives may remain truthfully masked until unlock, with their comparison basis still visible. Poor-fit routes recede in muted gray. When routes reveal, branches draw once and destinations clarify once; unlocking may stagger the four routes briefly.

### Business DNA

Business DNA is qualitative. Pair uppercase trait names with plain-language values and horizontal indigo bars as visual emphasis. Bars support scanning but do not claim a calibrated score. A separate “What stood out” statement turns the traits into one actionable interpretation.

## Do's and Don'ts

### Do:

- **Do** preserve the Reveal → Reward → New Mystery → Comparison → ₹199 sequence across post-quiz surfaces.
- **Do** use stored assessment answers and deterministic logic for personalization.
- **Do** frame ₹199 as a one-time unlock and clearly identify prototype checkout as a no-charge preview.
- **Do** make every experience keyboard operable, readable at 320px, and quiet under `prefers-reduced-motion`.
- **Do** use animation once to explain filtering, drawing, revealing, or unlocking.

### Don't:

- **Don't** add marketing navigation after the assessment or remove the paid report's report-only navigation.
- **Don't** fabricate rankings, probabilities, success rates, testimonials, or precise Business DNA scores.
- **Don't** use blur as vague decorative mystique; use it only as an honest information mask, paired with clear locked framing.
- **Don't** turn the warm-white system into a generic white SaaS dashboard or introduce competing accent colors.
- **Don't** loop, bounce, or continuously animate route geometry after its state change is understood.
