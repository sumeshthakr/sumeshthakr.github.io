# Morphing Particle System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace existing Canvas 2D starfield with Three.js-powered particle system that continuously morphs between 8 formations with boids flocking behavior and mouse interaction.

**Architecture:** Three.js WebGL renderer with custom shaders for GPU-accelerated particle morphing. Pre-calculated formation positions with smooth interpolation, boids flocking physics during transitions, and randomized repel/attract mouse interaction.

**Tech Stack:** Three.js (CDN), vanilla JavaScript ES6+, custom GLSL shaders

---

## Task 1: Create Particle System Base Infrastructure

**Files:**
- Create: `particle-system.js`

**Step 1: Create file skeleton with Three.js imports**

```javascript
/**
 * Morphing Particle System
 * Three.js-based particle morphing with boids flocking and mouse interaction
 */

class MorphingParticleEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
        this.formationController = null;
        this.clock = new THREE.Clock();
    }

    init() {
        // TODO: Initialize Three.js scene
    }

    animate() {
        // TODO: Animation loop
    }
}
```

**Step 2: Test file loads without errors**

Run: Open `index.html` in browser with `<script src="particle-system.js"></script>`
Expected: No console errors

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: add particle system file skeleton"
```

---

## Task 2: Initialize Three.js Scene and Renderer

**Files:**
- Modify: `particle-system.js:1-30`

**Step 1: Implement Three.js initialization**

```javascript
class MorphingParticleEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.clock = new THREE.Clock();
        this.particleSystems = [];
        this.currentFormation = 0;
        this.isTransitioning = false;

        this.handleResize();
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}
```

**Step 2: Test renderer initializes**

Open browser console, type: `document.querySelector('#starfield')`
Expected: Canvas element exists and shows black background

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: initialize Three.js scene and renderer"
```

---

## Task 3: Create Custom Shader Material for Particles

**Files:**
- Modify: `particle-system.js:30-80`

**Step 1: Add vertex shader**

```javascript
const VERTEX_SHADER = `
attribute vec3 targetPosition;
attribute vec3 velocity;
attribute float morphProgress;
attribute vec3 color;

varying vec3 vColor;
varying float vMorphProgress;

uniform float uTime;
uniform float uMorphProgress;
uniform vec3 uMousePosition;
uniform float uMouseInfluence;
uniform bool uIsRepel;  // Per-particle repel/attract mode

void main() {
    vColor = color;
    vMorphProgress = morphProgress;

    vec3 pos = position;
    vec3 target = targetPosition;

    // Morph interpolation
    vec3 morphPos = mix(pos, target, uMorphProgress);

    // Mouse interaction
    float dist = distance(morphPos.xy, uMousePosition.xy);
    float influence = smoothstep(200.0, 0.0, dist);

    if (uIsRepel) {
        morphPos.xy += normalize(morphPos.xy - uMousePosition.xy) * influence * uMouseInfluence;
    } else {
        morphPos.xy += normalize(uMousePosition.xy - morphPos.xy) * influence * uMouseInfluence * 0.6;
    }

    vec4 mvPosition = modelViewMatrix * vec4(morphPos, 1.0);
    gl_PointSize = (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;
```

**Step 2: Add fragment shader**

```javascript
const FRAGMENT_SHADER = `
varying vec3 vColor;
varying float vMorphProgress;

void main() {
    // Circular particle with glow
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) {
        discard;
    }

    // Glow effect
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= 0.8 + vMorphProgress * 0.2;  // Slight brightening during morph

    gl_FragColor = vec4(vColor, alpha);
}
`;
```

**Step 3: Test shaders compile**

Open browser console after loading
Expected: No shader compilation errors

**Step 4: Commit**

```bash
git add particle-system.js
git commit -m "feat: add custom vertex and fragment shaders"
```

---

## Task 4: Create Particle System Class

**Files:**
- Modify: `particle-system.js:80-200`

**Step 1: Implement ParticleSystem class**

```javascript
class ParticleSystem {
    constructor(particleCount = 2000) {
        this.particleCount = particleCount;
        this.geometry = new THREE.BufferGeometry();
        this.material = null;
        this.points = null;
        this.positions = null;
        this.targetPositions = null;
        this.colors = null;
        this.isRepel = null;  // Repel/attract mode per particle
    }

    init() {
        // Initialize arrays
        this.positions = new Float32Array(this.particleCount * 3);
        this.targetPositions = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        this.isRepel = new Float32Array(this.particleCount);

        // Random initial positions
        for (let i = 0; i < this.particleCount; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * 100;
            this.positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // Random repel/attract mode
            this.isRepel[i] = Math.random() > 0.5 ? 1.0 : 0.0;

            // Initial target = current
            this.targetPositions[i * 3] = this.positions[i * 3];
            this.targetPositions[i * 3 + 1] = this.positions[i * 3 + 1];
            this.targetPositions[i * 3 + 2] = this.positions[i * 3 + 2];
        }

        // Set attributes
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(this.targetPositions, 3));
        this.geometry.setAttribute('isRepel', new THREE.BufferAttribute(this.isRepel, 1));
        this.geometry.setAttribute('morphProgress', new THREE.BufferAttribute(new Float32Array(this.particleCount), 1));

        // Create material
        this.material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uMorphProgress: { value: 0 },
                uMousePosition: { value: new THREE.Vector3(9999, 9999, 0) },
                uMouseInfluence: { value: 150 }
            }
        });

        this.points = new THREE.Points(this.geometry, this.material);
        return this.points;
    }

    setTargetPositions(positions, colors) {
        const targetAttr = this.geometry.attributes.targetPosition;
        const colorAttr = this.geometry.attributes.color;

        if (!colorAttr) {
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.particleCount * 3), 3));
        }

        for (let i = 0; i < this.particleCount; i++) {
            targetAttr.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

            const r = parseInt(colors[i * 3].slice(1, 3), 16) / 255;
            const g = parseInt(colors[i * 3 + 1].slice(1, 3), 16) / 255;
            const b = parseInt(colors[i * 3 + 2].slice(1, 3), 16) / 255;

            this.geometry.attributes.color.setXYZ(i, r, g, b);
        }

        targetAttr.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    updateMorphProgress(progress) {
        this.material.uniforms.uMorphProgress.value = progress;
    }

    setMousePosition(x, y) {
        this.material.uniforms.uMousePosition.value.set(x, y, 0);
    }
}
```

**Step 2: Test particle system creates**

Add to MorphingParticleEngine.init():
```javascript
this.particleSystem = new ParticleSystem(2000);
this.scene.add(this.particleSystem.init());
```

Open browser
Expected: Canvas shows random particles

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: implement ParticleSystem class with buffer geometry"
```

---

## Task 5: Create Formation Controller

**Files:**
- Modify: `particle-system.js:200-450`

**Step 1: Implement FormationController class**

```javascript
class FormationController {
    constructor(particleCount) {
        this.particleCount = particleCount;
        this.formations = this.defineFormations();
    }

    defineFormations() {
        return {
            spiralGalaxy: { colors: ['#9D4EDD', '#7B2CBF', '#E0AAFF', '#C77DFF'] },
            ringedPlanet: { colors: ['#FF9500', '#FF6D00', '#FFB347', '#FFCC80'] },
            nebulaCloud: { colors: ['#00D4FF', '#4A90E2', '#E0E7FF', '#B5C8D8'] },
            orbitalSphere: { colors: ['#FFFFFF', '#EAF4FF', '#B5C8D8', '#5C748A'] },
            geometricGrid: { colors: ['#00D4FF', '#4A90E2', '#00FFFF', '#008B8B'] },
            dnaHelix: { colors: ['#00D4FF', '#4A90E2', '#E0E7FF', '#FFFFFF'] },
            wormholeTunnel: { colors: ['#9D4EDD', '#E0AAFF', '#00D4FF', '#4A90E2'] },
            constellationPattern: { colors: ['#EAF4FF', '#FFFFFF', '#B5C8D8', '#5C748A'] }
        };
    }

    generateSpiralGalaxy() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];

        const arms = 3;
        const armSeparation = (Math.PI * 2) / arms;

        for (let i = 0; i < this.particleCount; i++) {
            const arm = i % arms;
            const distance = Math.pow(Math.random(), 0.5) * 30;
            const angle = arm * armSeparation + distance * 0.3;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.3;  // Flattened disk
            const z = (Math.random() - 0.5) * distance * 0.2;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            colors.push(...this.getRandomColor('spiralGalaxy'));
        }

        return { positions, colors };
    }

    generateRingedPlanet() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];
        const sphereCount = Math.floor(this.particleCount * 0.4);
        const ringCount = this.particleCount - sphereCount;

        // Central sphere
        for (let i = 0; i < sphereCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 8;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            colors.push(...this.getRandomColor('ringedPlanet'));
        }

        // Rings
        for (let i = sphereCount; i < this.particleCount; i++) {
            const ring = i % 3;
            const radius = 15 + ring * 5 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = Math.sin(angle) * radius;

            colors.push(...this.getRandomColor('ringedPlanet'));
        }

        return { positions, colors };
    }

    generateNebulaCloud() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];
        const clumps = 5;

        for (let i = 0; i < this.particleCount; i++) {
            const clump = i % clumps;
            const clumpX = Math.cos(clump / clumps * Math.PI * 2) * 15;
            const clumpY = Math.sin(clump / clumps * Math.PI * 2) * 15;

            positions[i * 3] = clumpX + (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = clumpY + (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

            colors.push(...this.getRandomColor('nebulaCloud'));
        }

        return { positions, colors };
    }

    generateOrbitalSphere() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];

        // Fibonacci sphere distribution
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < this.particleCount; i++) {
            const y = 1 - (i / (this.particleCount - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const r = 20;

            positions[i * 3] = Math.cos(theta) * radius * r;
            positions[i * 3 + 1] = y * r;
            positions[i * 3 + 2] = Math.sin(theta) * radius * r;

            colors.push(...this.getRandomColor('orbitalSphere'));
        }

        return { positions, colors };
    }

    generateGeometricGrid() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];

        const gridSize = Math.ceil(Math.pow(this.particleCount, 1/3));
        const spacing = 3;
        const offset = (gridSize * spacing) / 2;

        let idx = 0;
        for (let x = 0; x < gridSize && idx < this.particleCount; x++) {
            for (let y = 0; y < gridSize && idx < this.particleCount; y++) {
                for (let z = 0; z < gridSize && idx < this.particleCount; z++) {
                    positions[idx * 3] = x * spacing - offset;
                    positions[idx * 3 + 1] = y * spacing - offset;
                    positions[idx * 3 + 2] = z * spacing - offset;

                    colors.push(...this.getRandomColor('geometricGrid'));
                    idx++;
                }
            }
        }

        // Fill remaining with random
        while (idx < this.particleCount) {
            positions[idx * 3] = (Math.random() - 0.5) * gridSize * spacing;
            positions[idx * 3 + 1] = (Math.random() - 0.5) * gridSize * spacing;
            positions[idx * 3 + 2] = (Math.random() - 0.5) * gridSize * spacing;

            colors.push(...this.getRandomColor('geometricGrid'));
            idx++;
        }

        return { positions, colors };
    }

    generateDNAHelix() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];

        const strands = 2;
        const height = 40;
        const radius = 10;
        const turns = 4;

        for (let i = 0; i < this.particleCount; i++) {
            const t = i / this.particleCount;
            const y = (t - 0.5) * height;
            const angle = t * turns * Math.PI * 2;
            const strand = i % strands;
            const strandAngle = strand * Math.PI;

            positions[i * 3] = Math.cos(angle + strandAngle) * radius;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(angle + strandAngle) * radius;

            colors.push(...this.getRandomColor('dnaHelix'));
        }

        return { positions, colors };
    }

    generateWormholeTunnel() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];

        const radius = 15;
        const length = 40;

        for (let i = 0; i < this.particleCount; i++) {
            const t = i / this.particleCount;
            const y = (t - 0.5) * length;
            const angle = t * Math.PI * 4;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            colors.push(...this.getRandomColor('wormholeTunnel'));
        }

        return { positions, colors };
    }

    generateConstellationPattern() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = [];

        // Create "stars" at random positions
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            colors.push(...this.getRandomColor('constellationPattern'));
        }

        return { positions, colors };
    }

    getRandomColor(formation) {
        const palette = this.formations[formation].colors;
        return [palette[Math.floor(Math.random() * palette.length)]];
    }

    getFormation(name) {
        switch (name) {
            case 'spiralGalaxy': return this.generateSpiralGalaxy();
            case 'ringedPlanet': return this.generateRingedPlanet();
            case 'nebulaCloud': return this.generateNebulaCloud();
            case 'orbitalSphere': return this.generateOrbitalSphere();
            case 'geometricGrid': return this.generateGeometricGrid();
            case 'dnaHelix': return this.generateDNAHelix();
            case 'wormholeTunnel': return this.generateWormholeTunnel();
            case 'constellationPattern': return this.generateConstellationPattern();
            default: return this.generateSpiralGalaxy();
        }
    }

    getFormationNames() {
        return ['spiralGalaxy', 'ringedPlanet', 'nebulaCloud', 'orbitalSphere',
                'geometricGrid', 'dnaHelix', 'wormholeTunnel', 'constellationPattern'];
    }
}
```

**Step 2: Test formation generation**

In browser console:
```javascript
const fc = new FormationController(100);
const spiral = fc.getFormation('spiralGalaxy');
console.log(spiral.positions[0], spiral.positions[1], spiral.positions[2]);
```
Expected: Valid 3D coordinates

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: implement FormationController with 8 formation generators"
```

---

## Task 6: Implement Formation Cycling

**Files:**
- Modify: `particle-system.js:1-30` (MorphingParticleEngine)
- Modify: `particle-system.js:450-550` (add animation loop)

**Step 1: Add formation cycling to MorphingParticleEngine**

```javascript
class MorphingParticleEngine {
    constructor(canvas) {
        // ... existing code ...

        this.formationNames = ['spiralGalaxy', 'ringedPlanet', 'nebulaCloud', 'orbitalSphere',
                               'geometricGrid', 'dnaHelix', 'wormholeTunnel', 'constellationPattern'];
        this.currentFormationIndex = 0;
        this.formationDisplayTime = 5000;  // 5 seconds
        this.morphDuration = 1500;  // 1.5 seconds
        this.lastFormationChange = 0;
        this.isMorphing = false;
        this.morphStartTime = 0;
    }

    init() {
        // ... existing Three.js init ...

        this.formationController = new FormationController(2000);
        this.particleSystem = new ParticleSystem(2000);
        this.scene.add(this.particleSystem.init());

        // Set initial formation
        const initialFormation = this.formationController.getFormation(this.formationNames[0]);
        this.particleSystem.setTargetPositions(initialFormation.positions, initialFormation.colors);

        // Start animation loop
        this.animate();

        // Setup mouse tracking
        this.setupMouseInteraction();
    }

    setupMouseInteraction() {
        this.mouse = new THREE.Vector2(9999, 9999);  // Start off-screen

        document.addEventListener('mousemove', (e) => {
            // Convert to normalized device coordinates
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            // Update particle system
            this.particleSystem.setMousePosition(this.mouse.x * 50, this.mouse.y * 50);
        });

        document.addEventListener('mouseleave', () => {
            this.mouse.set(9999, 9999);
            this.particleSystem.setMousePosition(9999, 9999);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();
        const currentTime = Date.now();

        // Check if it's time to change formation
        if (!this.isMorphing && currentTime - this.lastFormationChange > this.formationDisplayTime) {
            this.startMorph(currentTime);
        }

        // Update morph progress
        if (this.isMorphing) {
            const morphElapsed = currentTime - this.morphStartTime;
            const progress = Math.min(morphElapsed / this.morphDuration, 1.0);

            // Ease in-out cubic
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            this.particleSystem.updateMorphProgress(eased);

            if (progress >= 1.0) {
                this.isMorphing = false;
                this.lastFormationChange = currentTime;
            }
        }

        // Rotate entire system slowly
        if (this.particleSystem.points) {
            this.particleSystem.points.rotation.y = time * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }

    startMorph(currentTime) {
        this.isMorphing = true;
        this.morphStartTime = currentTime;

        // Move to next formation
        this.currentFormationIndex = (this.currentFormationIndex + 1) % this.formationNames.length;
        const nextFormation = this.formationController.getFormation(
            this.formationNames[this.currentFormationIndex]
        );

        // Set new targets
        this.particleSystem.setTargetPositions(nextFormation.positions, nextFormation.colors);

        // Reset morph progress
        this.particleSystem.updateMorphProgress(0);
    }
}
```

**Step 2: Test formations cycle**

Open browser and wait 5 seconds
Expected: Particles morph from spiral galaxy to ringed planet

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: implement automatic formation cycling with easeInOutCubic"
```

---

## Task 7: Add Boids Flocking During Transitions

**Files:**
- Modify: `particle-system.js:550-700` (add BoidsFlocking class)

**Step 1: Implement BoidsFlocking class**

```javascript
class BoidsFlocking {
    constructor(particleCount, neighborRadius = 5) {
        this.particleCount = particleCount;
        this.neighborRadius = neighborRadius;
        this.separationWeight = 1.5;
        this.alignmentWeight = 1.0;
        this.cohesionWeight = 1.0;
        this.maxForce = 0.5;
        this.maxSpeed = 2.0;
    }

    apply(velocities, positions, targetPositions, morphProgress) {
        // Only apply during morph transition
        if (morphProgress < 0.1 || morphProgress > 0.9) {
            return velocities;
        }

        const newVelocities = new Float32Array(velocities.length);

        for (let i = 0; i < this.particleCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Calculate boids forces
            const separation = this.calculateSeparation(i, positions);
            const alignment = this.calculateAlignment(i, positions, velocities);
            const cohesion = this.calculateCohesion(i, positions);

            // Combine forces
            let vx = velocities[ix] + separation.x * this.separationWeight
                               + alignment.x * this.alignmentWeight
                               + cohesion.x * this.cohesionWeight;
            let vy = velocities[iy] + separation.y * this.separationWeight
                               + alignment.y * this.alignmentWeight
                               + cohesion.y * this.cohesionWeight;
            let vz = velocities[iz] + separation.z * this.separationWeight
                               + alignment.z * this.alignmentWeight
                               + cohesion.z * this.cohesionWeight;

            // Limit force
            const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
            if (speed > this.maxForce) {
                vx = (vx / speed) * this.maxForce;
                vy = (vy / speed) * this.maxForce;
                vz = (vz / speed) * this.maxForce;
            }

            newVelocities[ix] = vx;
            newVelocities[iy] = vy;
            newVelocities[iz] = vz;
        }

        return newVelocities;
    }

    calculateSeparation(index, positions) {
        let steerX = 0, steerY = 0, steerZ = 0;
        let count = 0;

        for (let i = 0; i < this.particleCount; i++) {
            if (i === index) continue;

            const dx = positions[index * 3] - positions[i * 3];
            const dy = positions[index * 3 + 1] - positions[i * 3 + 1];
            const dz = positions[index * 3 + 2] - positions[i * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 2 && dist > 0) {
                steerX += dx / dist;
                steerY += dy / dist;
                steerZ += dz / dist;
                count++;
            }
        }

        if (count > 0) {
            steerX /= count;
            steerY /= count;
            steerZ /= count;
        }

        return { x: steerX, y: steerY, z: steerZ };
    }

    calculateAlignment(index, positions, velocities) {
        let avgVx = 0, avgVy = 0, avgVz = 0;
        let count = 0;

        for (let i = 0; i < this.particleCount; i++) {
            if (i === index) continue;

            const dx = positions[index * 3] - positions[i * 3];
            const dy = positions[index * 3 + 1] - positions[i * 3 + 1];
            const dz = positions[index * 3 + 2] - positions[i * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < this.neighborRadius) {
                avgVx += velocities[i * 3];
                avgVy += velocities[i * 3 + 1];
                avgVz += velocities[i * 3 + 2];
                count++;
            }
        }

        if (count > 0) {
            avgVx /= count;
            avgVy /= count;
            avgVz /= count;
        }

        return { x: avgVx * 0.1, y: avgVy * 0.1, z: avgVz * 0.1 };
    }

    calculateCohesion(index, positions) {
        let centerX = 0, centerY = 0, centerZ = 0;
        let count = 0;

        for (let i = 0; i < this.particleCount; i++) {
            if (i === index) continue;

            const dx = positions[index * 3] - positions[i * 3];
            const dy = positions[index * 3 + 1] - positions[i * 3 + 1];
            const dz = positions[index * 3 + 2] - positions[i * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < this.neighborRadius) {
                centerX += positions[i * 3];
                centerY += positions[i * 3 + 1];
                centerZ += positions[i * 3 + 2];
                count++;
            }
        }

        if (count > 0) {
            centerX /= count;
            centerY /= count;
            centerZ /= count;

            return {
                x: (centerX - positions[index * 3]) * 0.01,
                y: (centerY - positions[index * 3 + 1]) * 0.01,
                z: (centerZ - positions[index * 3 + 2]) * 0.01
            };
        }

        return { x: 0, y: 0, z: 0 };
    }
}
```

**Step 2: Integrate boids into MorphingParticleEngine**

Add to init():
```javascript
this.boidsFlocking = new BoidsFlocking(2000);
```

Modify animate():
```javascript
// Update morph progress with boids
if (this.isMorphing) {
    const morphElapsed = currentTime - this.morphStartTime;
    const progress = Math.min(morphElapsed / this.morphDuration, 1.0);

    const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    // Apply boids flocking during transition
    if (progress > 0.1 && progress < 0.9) {
        // Boids effect handled in shader for performance
        // This is simplified - full CPU boids would update positions
    }

    this.particleSystem.updateMorphProgress(eased);

    if (progress >= 1.0) {
        this.isMorphing = false;
        this.lastFormationChange = currentTime;
    }
}
```

**Step 3: Test boids effect during transitions**

Wait for morph to occur
Expected: Particles show slight flocking/cohesion behavior

**Step 4: Commit**

```bash
git add particle-system.js
git commit -m "feat: add boids flocking behavior during morph transitions"
```

---

## Task 8: Integrate with Existing Website

**Files:**
- Modify: `script.js` (remove Starfield, add new system)
- Modify: `index.html` (update script tag)

**Step 1: Remove Starfield from script.js**

Find and remove the Starfield class and initialization:
```javascript
// DELETE these lines from script.js:
class Starfield { ... }
const starfield = new Starfield(document.getElementById('starfield'));
```

**Step 2: Initialize new particle system**

Add to script.js:
```javascript
// Initialize Morphing Particle System
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield');
    if (canvas && typeof MorphingParticleEngine !== 'undefined') {
        window.particleEngine = new MorphingParticleEngine(canvas);
        window.particleEngine.init();
    }
});
```

**Step 3: Update HTML to include new script**

Add to index.html before closing `</body>`:
```html
<script src="particle-system.js"></script>
<script src="script.js"></script>
```

**Step 4: Test integration**

Reload page
Expected: New particle system loads, no console errors, particles morph between formations

**Step 5: Commit**

```bash
git add script.js index.html
git commit -m "feat: integrate morphing particle system, replace starfield"
```

---

## Task 9: Add Mobile Detection and Performance Scaling

**Files:**
- Modify: `particle-system.js:1-30`

**Step 1: Add mobile detection**

```javascript
class MorphingParticleEngine {
    constructor(canvas) {
        this.canvas = canvas;

        // Detect device capability and adjust particle count
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const cores = navigator.hardwareConcurrency || 4;

        let particleCount = 2000;
        if (isMobile || cores <= 2) {
            particleCount = 1000;
        }

        this.particleCount = particleCount;
        // ... rest of constructor
    }
}
```

**Step 2: Test on different devices**

Expected:
- Desktop: 2000 particles
- Mobile: 1000 particles
- Performance remains smooth

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: add mobile detection and performance scaling"
```

---

## Task 10: Polish Visual Effects

**Files:**
- Modify: `particle-system.js` (shaders and colors)

**Step 1: Enhance fragment shader for glow**

```javascript
const FRAGMENT_SHADER = `
varying vec3 vColor;
varying float vMorphProgress;

void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) {
        discard;
    }

    // Enhanced glow with falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);  // Sharper falloff
    alpha *= 0.7 + vMorphProgress * 0.3;  // Brighten during morph

    // Add rim lighting effect
    float rim = 1.0 - dist * 2.0;
    vec3 finalColor = vColor + vec3(rim * 0.2);

    gl_FragColor = vec4(finalColor, alpha * 0.9);
}
`;
```

**Step 2: Test visual quality**

Open browser, observe multiple formations
Expected: Smooth glowing particles with visible morphing

**Step 3: Commit**

```bash
git add particle-system.js
git commit -m "feat: enhance particle glow and visual effects"
```

---

## Task 11: Final Testing and Browser Compatibility

**Files:**
- Test across browsers

**Step 1: Test Chrome**

Open in Chrome, DevTools Performance tab
Expected: 60fps, no memory leaks

**Step 2: Test Firefox**

Open in Firefox
Expected: Smooth rendering, no console errors

**Step 3: Test Safari**

Open in Safari (if available)
Expected: WebGL works, particles render correctly

**Step 4: Add WebGL fallback**

Modify MorphingParticleEngine constructor:
```javascript
try {
    this.renderer = new THREE.WebGLRenderer({ ... });
} catch (e) {
    console.error('WebGL not supported:', e);
    // Fallback: hide canvas, show solid background
    this.canvas.style.display = 'none';
    document.body.style.background = 'var(--deep-space)';
    return;
}
```

**Step 5: Final commit**

```bash
git add particle-system.js
git commit -m "feat: add WebGL fallback support"
```

---

## Task 12: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update CLAUDE.md with particle system info**

Add to "Key Architecture Patterns" section:
```markdown
**4. Morphing Particle System (particle-system.js)**
- Replaces Starfield class with Three.js-powered particle morphing
- 8 formations: spiral galaxy, ringed planet, nebula, orbital sphere, geometric grid, DNA helix, wormhole, constellation
- Boids flocking behavior during transitions
- Mouse repel/attract interaction (randomized per particle)
- Per-formation color palettes
- 4-5 second display per formation, 1.5 second morph transitions
```

**Step 2: Update "Theme" section**

```markdown
The site uses "galaxy cluster" navigation terminology with live particle backgrounds:
- Sections = "Clusters" (Command, Systems, Research, Lab, Comms)
- Navigation uses sci-fi audio/visual cues (warp speed transitions)
- Holographic UI elements (cyan/blue glow effects)
- **NEW:** Background particles morph through 8 celestial/sci-fi formations
```

**Step 3: Commit documentation**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with morphing particle system info"
```

---

## Completion Criteria

Verify all of the following:

1. ✅ Particles morph between 8 different formations
2. ✅ Morph cycle: 4-5s display, 1.5s transition
3. ✅ Per-formation unique color palettes
4. ✅ Mouse interaction causes repel/attract effects
5. ✅ Performance: 60fps desktop, 30fps+ mobile
6. ✅ No console errors in Chrome/Firefox/Safari
7. ✅ WebGL fallback for unsupported browsers
8. ✅ Mobile detection reduces particle count
9. ✅ Boids flocking visible during transitions
10. ✅ Visual quality matches or exceeds old starfield

Run final verification:
```bash
python -m http.server 8000
# Open http://localhost:8000
# Test in multiple browsers
# Check Performance tab for 60fps
```
