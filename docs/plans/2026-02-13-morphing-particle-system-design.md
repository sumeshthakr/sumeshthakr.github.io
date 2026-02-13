# Morphing Particle System Design

**Date:** 2026-02-13
**Author:** Claude Code
**Status:** Approved

## Overview

Replace the existing Canvas 2D starfield with a Three.js-powered particle system that continuously morphs between celestial and sci-fi formations. Particles flow like cohesive swarms (boids behavior) and respond to mouse interaction with randomized repel/attract effects.

## Architecture

### Core Components

1. **MorphingParticleEngine** class
   - Manages Three.js scene, camera, WebGL renderer
   - Handles window resize and canvas lifecycle
   - Coordinates formation transitions and timing

2. **ParticleSystem** class
   - Creates and manages 2000+ Three.js Point objects
   - Stores current position, target position, velocity per particle
   - Updates particle positions via GPU shader for performance

3. **FormationController** class
   - Defines all 8 formations with target positions
   - Manages color palette transitions
   - Returns pre-calculated positions for any formation type

4. **BoidsFlocking** class
   - Implements separation, alignment, cohesion rules
   - Applied during morphing transitions for "swarm" effect
   - Spatial hashing for O(n) neighbor lookup

### Data Flow
```
Formation cycle timer → FormationController selects next formation →
Calculates new target positions → BoidsFlocking applies swarm physics →
ParticleSystem updates shader uniforms → GPU renders morphing particles
```

## Particle Morphing System

### Shader Attributes (per vertex)
- `attribute vec3 targetPosition` - Where particle is going
- `attribute vec3 velocity` - Current velocity
- `attribute float morphProgress` - 0.0 to 1.0 transition value
- `attribute vec3 color` - Particle color

### Morphing Behavior
- **Formation display:** 4-5 seconds per formation
- **Transition duration:** 1.5 seconds
- **Easing function:** easeInOutCubic
- **Velocity preservation:** Particles maintain momentum between formations

### Color Transition
- Colors interpolate over 1.5s transition
- GLSL mix() function between palettes
- Smooth gradient transitions

## Formations & Color Palettes

All formations centered in viewport. Cycle order: Galaxy → Ringed Planet → Nebula → Sphere → Grid → DNA → Wormhole → Constellation → repeat.

### 1. Spiral Galaxy
- Logarithmic spiral with 2-3 arms
- Dense center, sparse edges
- Colors: `#9D4EDD`, `#7B2CBF`, `#E0AAFF`, `#C77DFF` (purple/blue)

### 2. Ringed Planet
- Central sphere + 2-3 orbital rings
- Rings have gaps/irregularities
- Colors: `#FF9500`, `#FF6D00`, `#FFB347`, `#FFCC80` (orange/amber)

### 3. Nebula Cloud
- Perlin noise-based distribution
- Multiple clumps with wispy connections
- High z-variation for volume
- Colors: `#00D4FF`, `#4A90E2`, `#E0E7FF`, `#B5C8D8` (cyan/blue)

### 4. Orbital Sphere
- Fibonacci lattice distribution
- Uniform density, slow rotation
- Colors: `#FFFFFF`, `#EAF4FF`, `#B5C8D8`, `#5C748A` (white/gray)

### 5. Geometric Grid
- 3D grid/matrix pattern (20×20×5)
- Sharp edges, regular spacing
- Colors: `#00D4FF`, `#4A90E2`, `#00FFFF`, `#008B8B` (cyan/teal)

### 6. DNA Helix
- Double helix, 2 intertwining strands
- Cross-bridges between strands
- Vertical orientation
- Colors: `#00D4FF`, `#4A90E2`, `#E0E7FF`, `#FFFFFF` (blue/white)

### 7. Wormhole Tunnel
- Cylindrical tunnel surface
- Spiral motion, high density at "mouth"
- Colors: `#9D4EDD`, `#E0AAFF`, `#00D4FF`, `#4A90E2` (purple/cyan)

### 8. Constellation Pattern
- Random stars with visible connection lines
- Irregular organic distribution
- Colors: `#EAF4FF`, `#FFFFFF`, `#B5C8D8`, `#5C748A` (white tones)

## Mouse/Touch Interaction

### Repel/Attract System
- **Randomized:** 50% particles repel, 50% attract (assigned on load)
- **Influence radius:** 200px around cursor
- **Force falloff:** Inverse square law
- **Repellers:** Push away, max 150px displacement
- **Attractors:** Pull toward, max 100px displacement

### GPU Implementation
- Influence calculated in vertex shader
- Cursor position as uniform (`uMousePosition`)
- Smooth return to formation when cursor leaves zone

### Visual Feedback
- Repelled particles: Brighten when moving away
- Attracted particles: Dim when moving toward cursor

## Performance Optimizations

### GPU Rendering
- Single `THREE.Points` object with 2000+ vertices
- Custom `ShaderMaterial`
- `BufferGeometry` for efficient memory layout

### Attribute Caching
- Pre-calculate all formation positions on init
- Store in Float32Arrays as buffer attributes
- Morphing swaps active target attribute

### Boids Optimization
- Only active during transitions (1.5s every 4-5s)
- Spatial hashing for O(n) neighbor lookup
- Skip if particles already near target

### Mobile Handling
- Detect capability via `navigator.hardwareConcurrency`
- Reduce to 1000 particles on mobile
- Disable boids on low-end devices

## Implementation Files

### New Files
- `particle-system.js` (~600-800 lines)
  - Contains all classes: MorphingParticleEngine, ParticleSystem, FormationController, BoidsFlocking

### Modified Files
- `script.js` - Remove Starfield class, initialize new system
- `styles.css` - Minor canvas positioning updates

## Dependencies

- **Three.js** - Already loaded via CDN for existing demos
- No additional dependencies required

## Browser Compatibility

- Requires WebGL 1.0+ (all modern browsers)
- Fallback: Disable particles, show solid background if unavailable

## Success Criteria

1. Particles smoothly morph between 8 different formations
2. "Flocking" behavior visible during transitions
3. Mouse interaction creates noticeable repel/attract effects
4. Performance remains 60fps on desktop, 30fps+ on mobile
5. Visual quality matches or exceeds existing starfield
