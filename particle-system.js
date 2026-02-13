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
        // TODO: Initialize Three.js scene
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
