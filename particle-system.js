/**
 * Morphing Particle System
 * Three.js-based particle morphing with boids flocking and mouse interaction
 */

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
        this.clock = new THREE.Clock();
        this.particleSystems = [];
        this.currentFormation = 0;
        this.isTransitioning = false;

        // Initial sizing
        this.updateRendererSize();

        // Bind resize handler once
        this.resizeHandler = () => this.updateRendererSize();
        window.addEventListener('resize', this.resizeHandler);
    }

    updateRendererSize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    init() {
        this.particleSystem = new ParticleSystem(2000);
        this.scene.add(this.particleSystem.init());
    }

    animate() {
        // TODO: Animation loop
    }
}

const VERTEX_SHADER = `
precision mediump float;

attribute vec3 targetPosition;
attribute vec3 color;

varying vec3 vColor;
varying float vMorphProgress;

uniform float uTime;
uniform float uMorphProgress;
uniform vec3 uMousePosition;
uniform float uMouseInfluence;
uniform bool uIsRepel;

void main() {
    vColor = color;
    vMorphProgress = 0.0; // Not used in vertex shader, but passed to fragment

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
    gl_PointSize = max(1.0, 300.0 / max(-mvPosition.z, 0.1));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

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

        // Initialize colors to white
        for (let i = 0; i < this.particleCount * 3; i += 3) {
            this.colors[i] = 1.0;
            this.colors[i + 1] = 1.0;
            this.colors[i + 2] = 1.0;
        }

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
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
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
                uMouseInfluence: { value: 150 },
                uIsRepel: { value: false }
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
            const y = Math.sin(angle) * distance * 0.3;
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
        for (let i = 0; i < sphereCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 8;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            colors.push(...this.getRandomColor('ringedPlanet'));
        }
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
