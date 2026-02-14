# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal portfolio website for Sumesh Thakur (Applied ML & 3D Perception Engineer) with a Mass Effect-inspired space/sci-fi theme. The site is built with vanilla HTML, CSS, and JavaScript—no build tools, frameworks, or package managers.

**Repository:** https://github.com/sumeshthakr/sumeshthakr.github.io
**Deployment:** GitHub Pages (static site)

## Development Commands

### Local Development
```bash
# Serve the site locally (any of these)
python -m http.server 8000
npx serve .
# Then open http://localhost:8000
```

No build, lint, or test commands—this is a static site with direct file editing.

## Architecture & Structure

### Core Files
- `index.html` - Main portfolio page with sections: Hero, Systems, Research, Lab, Contact
- `styles.css` - Main stylesheet with CSS custom properties design system
- `script.js` - Starfield animation, navigation, reveal animations, audio toggle

### Interactive Demos (Self-Contained Pages)
Each demo is a standalone HTML page with its own CSS and JS:
- `cornell-box.html/css/js` - Monte Carlo path tracing renderer
- `pointcloud.html/css/js` - 3D point cloud processing (downsampling, segmentation, clustering)
- `terrain-gen.html/css/js` - Procedural terrain generation with Perlin noise

### Design System
CSS custom properties in `styles.css` define the Mass Effect-inspired theme:
```css
:root {
    --deep-space: #0a0e1a;      /* Primary background */
    --hologram-cyan: #00d4ff;    /* Accent color */
    --hologram-blue: #4a90e2;    /* Secondary accent */
    --signal-amber: #ff9500;     /* Warning/highlight */
    /* ... spacing, typography, transitions */
}
```

### Key Architecture Patterns

**1. Starfield Animation (script.js)**
- `Starfield` class manages Canvas 2D star animation
- "Warp speed" effect triggered on section navigation
- Configured via `CONFIG` object at top of file

**2. Galaxy Navigation (script.js)**
- `Navigation` class handles scroll-based section tracking
- Each section has `data-cluster` attribute linking to nav items
- Active state updates based on scroll position using IntersectionObserver

**3. Reveal Animations (script.js)**
- `RevealAnimations` class triggers fade-in effects
- Elements with `.reveal` class animate when entering viewport
- `data-delay` attribute supports staggered timing

**4. Morphing Particle System (particle-system.js)**
- Replaces Starfield class with Three.js-powered particle morphing
- 8 formations: spiral galaxy, ringed planet, nebula, orbital sphere, geometric grid, DNA helix, wormhole, constellation
- Boids flocking behavior during transitions
- Mouse repel/attract interaction (randomized per particle)
- Per-formation color palettes
- 4-5 second display per formation, 1.5 second morph transitions

**5. Audio System (script.js)**
- Optional audio toggle for UI sound effects
- Uses Web Audio API; disabled by default (`CONFIG.audioEnabled: false`)

### Demo Page Patterns

Each demo follows a consistent pattern:
1. **Vec3 class** - Custom 3D vector math library (no external dependencies)
2. **State management** - Simple config objects, no framework
3. **Canvas rendering** - All demos use Canvas 2D or WebGL via Three.js
4. **Controls UI** - Sidebar with sliders/inputs mapped to simulation parameters

### Assets
- `assets/Sumesh_Thakur_CV.pdf` - Resume PDF

## Theme: Mass Effect-Inspired Design

The site uses "galaxy cluster" navigation terminology with live particle backgrounds:
- Sections = "Clusters" (Command, Systems, Research, Lab, Comms)
- Navigation uses sci-fi audio/visual cues (warp speed transitions)
- Holographic UI elements (cyan/blue glow effects)
- **NEW:** Background particles morph through 8 celestial/sci-fi formations
- "Systems nominal" footer status

## Typography
- **Body:** Manrope
- **Headings:** Exo 2
- **Mono:** JetBrains Mono
- All loaded via Google Fonts in `<head>`

## Browser Compatibility
- Modern browsers only (ES6+, CSS Grid, WebGL required)
- No polyfills or fallbacks
