const MAX_SEED = 9999;
const NOISE_OFFSET = 1.2;
const NOISE_FREQUENCY = 1.5;
const HEIGHT_BASE_OFFSET = 0.35;

class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) {
            this.seed += 2147483646;
        }
    }

    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}

class PerlinNoise {
    constructor(seed) {
        this.permutation = new Uint8Array(512);
        this.setSeed(seed);
    }

    setSeed(seed) {
        const rng = new SeededRandom(seed);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng.next() * (i + 1));
            const temp = p[i];
            p[i] = p[j];
            p[j] = temp;
        }
        for (let i = 0; i < 512; i++) {
            this.permutation[i] = p[i & 255];
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = this.fade(xf);
        const v = this.fade(yf);

        const aa = this.permutation[this.permutation[xi] + yi];
        const ab = this.permutation[this.permutation[xi] + yi + 1];
        const ba = this.permutation[this.permutation[xi + 1] + yi];
        const bb = this.permutation[this.permutation[xi + 1] + yi + 1];

        const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
        const x2 = this.lerp(u, this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1));

        return (this.lerp(v, x1, x2) + 1) / 2;
    }

    fbm(x, y, octaves) {
        let value = 0;
        let amplitude = 0.6;
        let frequency = 1;
        let max = 0;

        for (let i = 0; i < octaves; i++) {
            value += this.noise(x * frequency, y * frequency) * amplitude;
            max += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }

        return value / max;
    }
}

class TerrainRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.pixelRatio = window.devicePixelRatio || 1;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    project(point, camera) {
        const cosY = Math.cos(camera.yaw);
        const sinY = Math.sin(camera.yaw);
        const cosX = Math.cos(camera.pitch);
        const sinX = Math.sin(camera.pitch);

        let x = point.x * cosY - point.z * sinY;
        let z = point.x * sinY + point.z * cosY;
        let y = point.y * cosX - z * sinX;
        z = point.y * sinX + z * cosX;

        const scale = camera.zoom / (camera.zoom + z);
        return {
            x: x * scale + this.width / 2,
            y: y * scale + this.height / 2,
            z
        };
    }

    shade(height, slope, waterLevel) {
        if (height < waterLevel) {
            return `rgba(59, 130, 246, 0.85)`;
        }

        const grass = Math.min(1, Math.max(0, (height - waterLevel) * 2));
        const rock = Math.max(0, height - 0.6);
        const snow = Math.max(0, height - 0.8);

        const baseR = 46 + grass * 60 + rock * 50 + snow * 160;
        const baseG = 120 + grass * 80 + rock * 40 + snow * 120;
        const baseB = 70 + grass * 30 + rock * 40 + snow * 160;

        const shade = 0.75 + 0.25 * (1 - slope);
        const r = Math.min(255, baseR * shade);
        const g = Math.min(255, baseG * shade);
        const b = Math.min(255, baseB * shade);

        return `rgb(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)})`;
    }

    drawMesh(mesh, camera, waterLevel) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, this.width, this.height);

        const triangles = mesh.triangles.map(triangle => {
            const projected = triangle.points.map(point => this.project(point, camera));
            const avgZ = (projected[0].z + projected[1].z + projected[2].z) / 3;
            return { projected, triangle, avgZ };
        });

        triangles.sort((a, b) => b.avgZ - a.avgZ);

        triangles.forEach(({ projected, triangle }) => {
            ctx.beginPath();
            ctx.moveTo(projected[0].x, projected[0].y);
            ctx.lineTo(projected[1].x, projected[1].y);
            ctx.lineTo(projected[2].x, projected[2].y);
            ctx.closePath();

            ctx.fillStyle = this.shade(triangle.height, triangle.slope, waterLevel);
            ctx.fill();
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)';
            ctx.stroke();
        });
    }
}

class TerrainApp {
    constructor() {
        this.canvas = document.getElementById('terrain-canvas');
        this.renderer = new TerrainRenderer(this.canvas);
        this.seed = 42;
        this.perlin = new PerlinNoise(this.seed);

        this.settings = {
            gridSize: 70,
            noiseScale: 1.6,
            octaves: 4,
            heightScale: 6,
            terrainScale: 1.4,
            waterLevel: 0.32
        };

        this.camera = {
            yaw: 35 * Math.PI / 180,
            pitch: 35 * Math.PI / 180,
            zoom: 6
        };

        this.setupUI();
        this.resizeCanvas();
        this.generateTerrain();
    }

    setupUI() {
        const gridSize = document.getElementById('grid-size');
        const noiseScale = document.getElementById('noise-scale');
        const octaves = document.getElementById('octaves');
        const heightScale = document.getElementById('height-scale');
        const terrainScale = document.getElementById('terrain-scale');
        const waterLevel = document.getElementById('water-level');
        const yaw = document.getElementById('yaw');
        const pitch = document.getElementById('pitch');
        const seedInput = document.getElementById('seed');

        gridSize.addEventListener('input', () => this.updateSetting('gridSize', parseInt(gridSize.value)));
        noiseScale.addEventListener('input', () => this.updateSetting('noiseScale', parseFloat(noiseScale.value)));
        octaves.addEventListener('input', () => this.updateSetting('octaves', parseInt(octaves.value)));
        heightScale.addEventListener('input', () => this.updateSetting('heightScale', parseFloat(heightScale.value)));
        terrainScale.addEventListener('input', () => this.updateSetting('terrainScale', parseFloat(terrainScale.value)));
        waterLevel.addEventListener('input', () => this.updateSetting('waterLevel', parseFloat(waterLevel.value)));

        yaw.addEventListener('input', () => {
            this.camera.yaw = parseInt(yaw.value) * Math.PI / 180;
            document.getElementById('yaw-value').textContent = yaw.value;
            this.draw();
        });

        pitch.addEventListener('input', () => {
            this.camera.pitch = parseInt(pitch.value) * Math.PI / 180;
            document.getElementById('pitch-value').textContent = pitch.value;
            this.draw();
        });

        seedInput.addEventListener('change', () => {
            const value = parseInt(seedInput.value, 10);
            if (!Number.isNaN(value)) {
                this.seed = value;
                this.perlin.setSeed(this.seed);
                this.generateTerrain();
            }
        });

        document.getElementById('random-seed-btn').addEventListener('click', () => {
            this.seed = Math.floor(Math.random() * MAX_SEED);
            seedInput.value = this.seed;
            this.perlin.setSeed(this.seed);
            this.generateTerrain();
        });

        document.getElementById('regenerate-btn').addEventListener('click', () => {
            this.perlin.setSeed(this.seed);
            this.generateTerrain();
        });

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.draw();
        });
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        const id = `${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}-value`;
        const display = document.getElementById(id);
        if (display) {
            display.textContent = value;
        }
        this.generateTerrain();
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(rect.width * ratio);
        this.canvas.height = Math.round(rect.height * ratio);
        this.renderer.setSize(this.canvas.width, this.canvas.height);
    }

    generateTerrain() {
        const size = this.settings.gridSize;
        const scale = this.settings.noiseScale;
        const heights = [];

        for (let z = 0; z <= size; z++) {
            const row = [];
            for (let x = 0; x <= size; x++) {
                const nx = x / size - 0.5;
                const nz = z / size - 0.5;
                const elevation = this.perlin.fbm(
                    (nx * scale + NOISE_OFFSET) * NOISE_FREQUENCY,
                    (nz * scale + NOISE_OFFSET) * NOISE_FREQUENCY,
                    this.settings.octaves
                );
                row.push(elevation);
            }
            heights.push(row);
        }

        this.mesh = this.buildMesh(heights);
        this.updateStats(size);
        this.draw();
    }

    buildMesh(heights) {
        const size = this.settings.gridSize;
        const mesh = { triangles: [] };
        const scale = this.settings.terrainScale;
        const heightScale = this.settings.heightScale;

        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                const h00 = heights[z][x];
                const h10 = heights[z][x + 1];
                const h01 = heights[z + 1][x];
                const h11 = heights[z + 1][x + 1];

                const p00 = this.createPoint(x, z, h00, scale, heightScale, size);
                const p10 = this.createPoint(x + 1, z, h10, scale, heightScale, size);
                const p01 = this.createPoint(x, z + 1, h01, scale, heightScale, size);
                const p11 = this.createPoint(x + 1, z + 1, h11, scale, heightScale, size);

                mesh.triangles.push(this.createTriangle(p00, p10, p11));
                mesh.triangles.push(this.createTriangle(p00, p11, p01));
            }
        }

        return mesh;
    }

    createPoint(x, z, height, scale, heightScale, size) {
        return {
            x: (x - size / 2) * scale,
            y: (height - HEIGHT_BASE_OFFSET) * heightScale,
            z: (z - size / 2) * scale,
            height
        };
    }

    createTriangle(a, b, c) {
        const slope = this.estimateSlope(a, b, c);
        const height = (a.height + b.height + c.height) / 3;
        return {
            points: [a, b, c],
            slope,
            height
        };
    }

    estimateSlope(a, b, c) {
        const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
        const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
        const nx = ab.y * ac.z - ab.z * ac.y;
        const ny = ab.z * ac.x - ab.x * ac.z;
        const nz = ab.x * ac.y - ab.y * ac.x;
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        return Math.min(1, Math.abs(ny / length));
    }

    updateStats(size) {
        document.getElementById('grid-size-info').textContent = `${size} x ${size}`;
        document.getElementById('seed-info').textContent = this.seed;
        document.getElementById('triangle-info').textContent = (size * size * 2).toLocaleString();
    }

    draw() {
        if (!this.mesh) return;
        this.renderer.drawMesh(this.mesh, this.camera, this.settings.waterLevel);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.terrainApp = new TerrainApp();
});
