# Copilot Instructions — hirokuwana.com

## Design Context

### Users

**Primary**: Educators and non-technical professionals exploring AI adoption. They arrive curious but potentially skeptical, looking for practical guidance from someone who bridges the technical/non-technical divide. They need to feel safe and respected, not lectured.

**Secondary**: Technical solopreneurs and founders interested in automation strategies and building alone. They appreciate craft and brevity.

**Tertiary**: Potential AI consulting clients evaluating Hiro's expertise. They need to quickly understand his credibility and feel confident booking a call.

**Context**: Visitors arrive from essays shared on Twitter/LinkedIn, Quora answers, or direct search. They're often on mobile, scanning quickly. The site must earn trust in seconds and reward exploration.

### Brand Personality

**Three words**: Curious, Grounded, Sharp

**Voice & Tone**:
- Intellectually rigorous but never academic or stuffy
- Contrarian but always backed by real experience
- Playful — genuine curiosity and joy in learning (Feynman energy)
- Accessible through storytelling, not dumbing down
- Principled — clear stances, willing to disagree

**Emotional goals**: The site should make visitors feel like they've found a smart, trustworthy friend who happens to know a lot about AI. Playful curiosity first, calm professionalism second. Never salesy, never preachy.

**Brand archetype**: "The Reluctant Technologist" — a self-taught developer who automates what corporations need teams for, bridging Japanese and American cultures, non-technical to technical worlds.

### Aesthetic Direction

**Visual tone**: Warm minimalism with moments of delight. Clean but not sterile. Restrained but not boring.

**References**:
- **Paco Coursey** — Minimal personal site, great taste, subtle animations, everything feels intentional
- **Linear.app** — Sharp, confident, technical but beautiful, excellent typography

**Anti-references** (explicitly avoid):
- Generic SaaS templates (cookie-cutter hero + features + pricing, no personality)
- Overly corporate sites (stock photos, buzzwords, 'synergy' — the /corporate page already parodies this)
- Dev portfolio cliches (dark terminal theme, 'Hello World' hero, GitHub contribution graphs)
- Cluttered blogs (too many widgets, sidebars, popups, newsletter modals)

**Theme**: Dual-mode — caramellatte (warm cream/brown) for light, dim for dark. Both via DaisyUI 5.

### Tech Stack

- **Framework**: SvelteKit 2 + Vite 6 + Svelte 5
- **Styling**: Tailwind CSS 4 + DaisyUI 5 (caramellatte light / dim dark themes)
- **Typography**: Inter (Google Fonts), fluid sizing via `clamp()`
- **Icons**: Iconify (MDI, circle-flags)
- **i18n**: Paraglide.js (English + Japanese)
- **Content**: Markdown essays via mdsvex
- **Deployment**: Vercel (static adapter)
- **Colors**: DaisyUI oklch-based semantic tokens (`--p`, `--s`, `--a`, `--b1`, `--b2`, `--bc`, etc.)

### Design Principles

1. **Intentional minimalism** — Every element must earn its place. If it doesn't serve the visitor's goal or reinforce the brand, remove it.
2. **Warmth over polish** — The site should feel handcrafted and personal, not templated. The caramellatte palette exists for a reason.
3. **Motion with purpose** — Animations should guide attention and create delight, never distract. Always respect `prefers-reduced-motion`.
4. **Content-first hierarchy** — Projects and essays are the stars. Typography does the heavy lifting.
5. **Bilingual by design** — Japanese isn't an afterthought. UI and content should work naturally in both languages.

### Typography Rules

- **Headings**: Inter 600–700, tight tracking (`-0.025em` to `-0.035em`), tight leading (1.15)
- **Body**: Inter 400, slight negative tracking (`-0.011em`), generous leading (1.65–1.7)
- **Fluid sizing**: Always use `clamp()` for responsive headings
- **Base size**: 16px, never smaller than 14px for readable text
- **Japanese text**: Ensure sufficient line-height (1.7+) for CJK characters

### Color Usage

- Use semantic DaisyUI tokens exclusively (`--p`, `--s`, `--a`, `--b1`, `--bc`, etc.)
- Never hardcode hex/rgb values — always use `oklch(var(--token) / opacity)`
- Primary color for headings, CTAs, and interactive elements
- Gradients: subtle, using primary → secondary, never flashy
