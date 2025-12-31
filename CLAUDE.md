# hickup.xyz

## What This Is
hickup.xyz is a single-page marketing site for an MCP tools startup. We build custom agent orchestration tools for businesses. The site sells that.

## Stack
Next.js 14 with App Router. Bun for package management. Tailwind for styles. Framer Motion for animations. TypeScript throughout.

## Commands
Run dev server: bun run dev
Build production: bun run build
Start production: bun run start

## File Structure
All page content lives in app/page.tsx. Layout and metadata in app/layout.tsx. Global styles in app/globals.css. Config files in root.

## Design System
Dark theme only. Background is #08080c. Primary accent is cyan #00f5d4. Secondary is violet #8b5cf6. Tertiary is pink #ec4899.
All cards use glassmorphism: backdrop-blur-xl, bg-white/[0.03], border border-white/[0.08]. No solid backgrounds on components.
Typography uses Inter from Google Fonts. No other fonts.

## Approved Dependencies
The following packages are approved for use:
- @tsparticles/react - Production particle effects
- @tsparticles/slim - Lightweight particle engine

## Constraints
Do not add new dependencies without explicit approval.
Do not change the color scheme. The cyan/violet gradient is brand identity.
Do not remove animations. They differentiate us from generic landing pages.
Do not add a light mode. Dark only.
Do not break mobile responsiveness. Test at 375px minimum.
Do not use bullet points or numbered lists in marketing copy. Write in prose.
Do not add stock photos or placeholder images. Use SVG icons and CSS effects only.

## Content Rules
The core message: AI agents answer how does AI do something. MCP tools answer how do we get AI agents to do what we want. This distinction must remain prominent.
Three pillars never change: RAG Knowledge System, Multi-Agent Database, Agent Email Protocol.
Keep copy concise. No corporate fluff. Speak to technical decision makers who understand agents already.

## When Adding Sections
Match existing GlassCard component pattern. Use TextReveal for headings. Stagger animation delays by 0.1s increments. Keep section padding at py-32 px-6.

## When Editing Copy
Maintain technical credibility. We build infrastructure, not wrappers. Avoid buzzwords like synergy, leverage, unlock. Say what things actually do.

## Deployment
Vercel. Push to main triggers deploy. No staging environment currently.

## Contact
clarkkitchen22@gmail.com routes to founder inbox. Do not change this without approval.
