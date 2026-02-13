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
