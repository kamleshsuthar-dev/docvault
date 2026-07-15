# DESIGN.md — Clerk

## Overview
Clerk's design system bridges developer tooling and end-user polish. A deep purple accent on near-black surfaces creates a premium, security-focused feel. The auth components are designed to be both embeddable and beautiful out of the box.

## Colors

### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-brand` | `#6C47FF` | Primary purple |
| `color-bg` | `#131316` | App background |
| `color-surface` | `#1F0256` | Auth card surface only (purple-tinted) — see Neutral Palette for general card surfaces |
| `color-text` | `#FFFFFF` | Primary text on dark backgrounds |
| `color-text-inverse` | `#131316` | Primary text on light backgrounds (`color-light`, `color-gray-100`) |
| `color-light` | `#F4F0FF` | Light mode surfaces |

### Neutral Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-gray-950` | `#131316` | App background |
| `color-gray-800` | `#1E1E26` | Default card/panel surface (non-auth) |
| `color-gray-600` | `#3D3D50` | Borders |
| `color-gray-400` | `#7C7C99` | Muted text |
| `color-gray-100` | `#E8E8F0` | Light surfaces |

> **Surface rule:** `color-surface` (purple-tinted) is reserved for the sign-in/sign-up auth card only. Every other card, panel, or container uses `color-gray-800` (dark theme) or `color-gray-100` (light theme). Don't mix the two for the same component type.

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | `#16A34A` | Verified, authenticated states |
| `color-error` | `#DC2626` | Auth errors, invalid input |
| `color-warning` | `#D97706` | Session expiry warnings |

### Interactive States
| Token | Value | Usage |
|-------|-------|-------|
| `color-brand-hover` | `#7C5CFF` | Button/link hover |
| `color-brand-active` | `#5935E0` | Button/link pressed |
| `color-surface-hover` | `rgba(255,255,255,0.04)` | Row/card hover (dark theme) |
| `color-surface-hover-light` | `rgba(0,0,0,0.03)` | Row/card hover (light theme) |
| `color-disabled` | `#3D3D50` | Disabled backgrounds |
| `color-disabled-text` | `#7C7C99` | Disabled text |
| `color-focus-ring` | `rgba(108,71,255,0.5)` | Focus-visible outline, all interactive elements |
| `focus-ring-width` | `2px` | Focus outline width, `2px` offset |

## Typography

| Role | Family | Size | Weight | Line Height |
|------|--------|------|--------|-------------|
| Display | Inter, system-ui, -apple-system, sans-serif | 48px | 700 | 1.1 |
| Heading | Inter, system-ui, -apple-system, sans-serif | 32px | 600 | 1.2 |
| Body | Inter, system-ui, -apple-system, sans-serif | 16px | 400 | 1.6 |
| Label | Inter, system-ui, -apple-system, sans-serif | 13px | 500 | 1.4 |
| Caption | Inter, system-ui, -apple-system, sans-serif | 12px | 400 | 1.4 |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline gaps |
| `space-2` | 8px | Field gaps |
| `space-4` | 16px | Form spacing |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Modal padding |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Inputs, buttons |
| `radius-md` | 10px | Cards |
| `radius-lg` | 16px | Sign-in modal |
| `radius-full` | 9999px | Avatar, pill badges |

## Elevation

| Level | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.2)` | Input fields |
| `shadow-md` | `0 4px 16px rgba(108,71,255,0.15)` | Auth card |
| `shadow-lg` | `0 12px 40px rgba(0,0,0,0.4)` | Full modal |

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| `transition-fast` | `150ms ease` | Hover/active state changes (buttons, links, inputs) |
| `transition-base` | `200ms ease` | Modal/dropdown open-close, panel transitions |
| `transition-slow` | `300ms ease` | Page-level or theme (light/dark) transitions |

## Components

### Sign In Card
- Centered card, `color-surface` background, radius 16px
- Social providers (Google, GitHub, etc.)
- Email/password fields
- "Secured by Clerk" footer badge

### User Button
- Avatar circle, click for dropdown
- Shows name, email, sign out option
- Customizable theme

## Do's and Don'ts

### Do
- Use purple as the single accent color
- Make auth flows feel secure with dark backgrounds
- Support both light and dark theme variants
- Apply `color-focus-ring` to every focusable element (accessibility requirement, non-negotiable for an auth product)
- Use `color-surface` only for the auth card; use `color-gray-800`/`color-gray-100` for all other surfaces

### Don't
- Don't use bright colors for non-interactive elements
- Don't reduce auth form padding below 24px
- Don't hide the security branding
- Don't use `color-text` (`#FFFFFF`) on light backgrounds — use `color-text-inverse`
- Don't invent one-off hover/disabled/focus colors — use the Interactive States tokens