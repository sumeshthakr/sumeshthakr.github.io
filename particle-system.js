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
