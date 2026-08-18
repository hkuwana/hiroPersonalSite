## Design Context

## Validation

- Run `pnpm test` for normal changes. It performs type checking and cached source linting sequentially to keep peak memory bounded.
- Run `pnpm test:release` only before publishing or when production-build behavior changed. Do not run the production build after every edit.
- Do not run validation commands in parallel; `svelte-check`, ESLint, and Vite each construct a full program/module graph.
- This repository has no Playwright suite. Do not start browsers for routine validation.

### Users

The primary audience is solo founders and hands-on operators using AI to build and run real products. They arrive looking for grounded judgment, reusable workflows, and honest evidence from someone doing the work—not generic AI commentary. A secondary audience follows Hiro's ongoing founder journey and wants a thoughtful place to return for product decisions, experiments, failures, and lessons. The main job of the site is to make Hiro's work and point of view legible, then earn an email subscription from readers who want to follow and apply what he learns.

### Brand Personality

Calm, rigorous, and quietly contrarian. The voice should be intellectually serious without becoming academic, personal without becoming confessional, and confident without adopting guru language. Readers should feel that they have found a thoughtful builder with taste: someone who shows the work, distinguishes evidence from opinion, and is willing to disagree when experience supports it.

### Aesthetic Direction

An editorial Japanese-American sensibility: warm paper-like surfaces, restrained shu-red accents, expressive serif typography, precise mono details, generous space, and small bilingual touches. Support both light and dark themes. Preserve the existing literary, crafted quality while making the practical founder value easier to scan. Avoid loud growth-marketing conventions, generic SaaS gradients, AI-generated futurism, social-media-guru aesthetics, and conversion pressure that would undermine trust. Maintain WCAG AA contrast, visible focus states, reduced-motion support, and comfortable long-form reading on mobile and desktop.

### Design Principles

1. Lead with the reader and the useful outcome: explain quickly what founders and operators can learn here and why Hiro has earned the right to teach it.
2. Show evidence before authority claims: use shipped work, decisions, experiments, numbers, and artifacts instead of calling Hiro a thought leader or expert.
3. Let the startup generate the content: frame writing as field notes from ongoing work, not as a separate creator business competing for attention.
4. Keep one quiet conversion path: make following the journey by email the primary action, with direct contact and future paid learning as secondary paths.
5. Preserve depth and personality: make practical material easy to find without flattening the essays, cultural perspective, Japanese details, or slower questions that make the site distinctive.
