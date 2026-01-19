// Cornell Box Raytracer
// Inspired by "Ray Tracing: The Rest of Your Life" by Peter Shirley

// ========================================
// Vector3 Math Class
// ========================================
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    mul(t) {
        if (typeof t === 'number') {
            return new Vec3(this.x * t, this.y * t, this.z * t);
        }
        return new Vec3(this.x * t.x, this.y * t.y, this.z * t.z);
    }

    div(t) {
        return new Vec3(this.x / t, this.y / t, this.z / t);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        return this.div(this.length());
    }

    nearZero() {
        const s = 1e-8;
        return Math.abs(this.x) < s && Math.abs(this.y) < s && Math.abs(this.z) < s;
    }

    static random(min = 0, max = 1) {
        return new Vec3(
            Math.random() * (max - min) + min,
            Math.random() * (max - min) + min,
            Math.random() * (max - min) + min
        );
    }

    static randomInUnitSphere() {
        while (true) {
            const p = Vec3.random(-1, 1);
            if (p.lengthSquared() < 1) return p;
        }
    }

    static randomUnitVector() {
        return Vec3.randomInUnitSphere().normalize();
    }

    static randomInHemisphere(normal) {
        const inUnitSphere = Vec3.randomInUnitSphere();
        if (inUnitSphere.dot(normal) > 0.0) {
            return inUnitSphere;
        } else {
            return inUnitSphere.mul(-1);
        }
    }

    static reflect(v, n) {
        return v.sub(n.mul(2 * v.dot(n)));
    }

    static refract(uv, n, etaiOverEtat) {
        const cosTheta = Math.min(uv.mul(-1).dot(n), 1.0);
        const rOutPerp = uv.add(n.mul(cosTheta)).mul(etaiOverEtat);
        const rOutParallel = n.mul(-Math.sqrt(Math.abs(1.0 - rOutPerp.lengthSquared())));
        return rOutPerp.add(rOutParallel);
    }
}

// ========================================
// Ray Class
// ========================================
class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    at(t) {
        return this.origin.add(this.direction.mul(t));
    }
}

// ========================================
// Hit Record
// ========================================
class HitRecord {
    constructor() {
        this.p = null;
        this.normal = null;
        this.material = null;
        this.t = 0;
        this.frontFace = false;
    }

    setFaceNormal(ray, outwardNormal) {
        this.frontFace = ray.direction.dot(outwardNormal) < 0;
        this.normal = this.frontFace ? outwardNormal : outwardNormal.mul(-1);
    }
}

// ========================================
// Materials
// ========================================
class Lambertian {
    constructor(albedo) {
        this.albedo = albedo;
    }

    scatter(rayIn, rec) {
        let scatterDirection = rec.normal.add(Vec3.randomUnitVector());
        
        if (scatterDirection.nearZero()) {
            scatterDirection = rec.normal;
        }

        return {
            scattered: new Ray(rec.p, scatterDirection),
            attenuation: this.albedo
        };
    }
}

class Metal {
    constructor(albedo, fuzz = 0.0) {
        this.albedo = albedo;
        this.fuzz = fuzz < 1 ? fuzz : 1;
    }

    scatter(rayIn, rec) {
        const reflected = Vec3.reflect(rayIn.direction.normalize(), rec.normal);
        const scattered = new Ray(rec.p, reflected.add(Vec3.randomInUnitSphere().mul(this.fuzz)));
        
        if (scattered.direction.dot(rec.normal) > 0) {
            return {
                scattered: scattered,
                attenuation: this.albedo
            };
        }
        return null;
    }
}

class Dielectric {
    constructor(indexOfRefraction) {
        this.ir = indexOfRefraction;
    }

    scatter(rayIn, rec) {
        const attenuation = new Vec3(1.0, 1.0, 1.0);
        const refractionRatio = rec.frontFace ? (1.0 / this.ir) : this.ir;

        const unitDirection = rayIn.direction.normalize();
        const cosTheta = Math.min(unitDirection.mul(-1).dot(rec.normal), 1.0);
        const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);

        const cannotRefract = refractionRatio * sinTheta > 1.0;
        let direction;

        if (cannotRefract || this.reflectance(cosTheta, refractionRatio) > Math.random()) {
            direction = Vec3.reflect(unitDirection, rec.normal);
        } else {
            direction = Vec3.refract(unitDirection, rec.normal, refractionRatio);
        }

        return {
            scattered: new Ray(rec.p, direction),
            attenuation: attenuation
        };
    }

    reflectance(cosine, refIdx) {
        // Schlick's approximation
        let r0 = (1 - refIdx) / (1 + refIdx);
        r0 = r0 * r0;
        return r0 + (1 - r0) * Math.pow((1 - cosine), 5);
    }
}

class DiffuseLight {
    constructor(color, intensity = 1.0) {
        this.emit = color.mul(intensity);
    }

    scatter(rayIn, rec) {
        return null;
    }

    emitted() {
        return this.emit;
    }
}

// ========================================
// Hittable Objects
// ========================================
class Sphere {
    constructor(center, radius, material) {
        this.center = center;
        this.radius = radius;
        this.material = material;
    }

    hit(ray, tMin, tMax, rec) {
        const oc = ray.origin.sub(this.center);
        const a = ray.direction.lengthSquared();
        const halfB = oc.dot(ray.direction);
        const c = oc.lengthSquared() - this.radius * this.radius;
        const discriminant = halfB * halfB - a * c;

        if (discriminant < 0) return false;

        const sqrtd = Math.sqrt(discriminant);
        let root = (-halfB - sqrtd) / a;
        if (root < tMin || tMax < root) {
            root = (-halfB + sqrtd) / a;
            if (root < tMin || tMax < root) {
                return false;
            }
        }

        rec.t = root;
        rec.p = ray.at(rec.t);
        const outwardNormal = rec.p.sub(this.center).div(this.radius);
        rec.setFaceNormal(ray, outwardNormal);
        rec.material = this.material;

        return true;
    }
}

class AARect {
    constructor(x0, x1, y0, y1, k, axis, material) {
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.k = k;
        this.axis = axis; // 'xy', 'xz', or 'yz'
        this.material = material;
    }

    hit(ray, tMin, tMax, rec) {
        let t, x, y;

        if (this.axis === 'xy') {
            t = (this.k - ray.origin.z) / ray.direction.z;
            if (t < tMin || t > tMax) return false;
            x = ray.origin.x + t * ray.direction.x;
            y = ray.origin.y + t * ray.direction.y;
            if (x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1) return false;
            rec.setFaceNormal(ray, new Vec3(0, 0, 1));
        } else if (this.axis === 'xz') {
            t = (this.k - ray.origin.y) / ray.direction.y;
            if (t < tMin || t > tMax) return false;
            x = ray.origin.x + t * ray.direction.x;
            y = ray.origin.z + t * ray.direction.z;
            if (x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1) return false;
            rec.setFaceNormal(ray, new Vec3(0, 1, 0));
        } else { // 'yz'
            t = (this.k - ray.origin.x) / ray.direction.x;
            if (t < tMin || t > tMax) return false;
            x = ray.origin.y + t * ray.direction.y;
            y = ray.origin.z + t * ray.direction.z;
            if (x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1) return false;
            rec.setFaceNormal(ray, new Vec3(1, 0, 0));
        }

        rec.t = t;
        rec.p = ray.at(t);
        rec.material = this.material;
        return true;
    }
}

class Box {
    constructor(p0, p1, material) {
        this.boxMin = p0;
        this.boxMax = p1;
        this.sides = [];

        const mat = material;

        this.sides.push(new AARect(p0.x, p1.x, p0.y, p1.y, p1.z, 'xy', mat));
        this.sides.push(new AARect(p0.x, p1.x, p0.y, p1.y, p0.z, 'xy', mat));

        this.sides.push(new AARect(p0.x, p1.x, p0.z, p1.z, p1.y, 'xz', mat));
        this.sides.push(new AARect(p0.x, p1.x, p0.z, p1.z, p0.y, 'xz', mat));

        this.sides.push(new AARect(p0.y, p1.y, p0.z, p1.z, p1.x, 'yz', mat));
        this.sides.push(new AARect(p0.y, p1.y, p0.z, p1.z, p0.x, 'yz', mat));
    }

    hit(ray, tMin, tMax, rec) {
        let hitAnything = false;
        let closestSoFar = tMax;

        for (const side of this.sides) {
            if (side.hit(ray, tMin, closestSoFar, rec)) {
                hitAnything = true;
                closestSoFar = rec.t;
            }
        }

        return hitAnything;
    }
}

// ========================================
// World (Hittable List)
// ========================================
class HittableList {
    constructor() {
        this.objects = [];
    }

    add(object) {
        this.objects.push(object);
    }

    clear() {
        this.objects = [];
    }

    hit(ray, tMin, tMax, rec) {
        let hitAnything = false;
        let closestSoFar = tMax;

        for (const object of this.objects) {
            if (object.hit(ray, tMin, closestSoFar, rec)) {
                hitAnything = true;
                closestSoFar = rec.t;
            }
        }

        return hitAnything;
    }
}

// ========================================
// Camera
// ========================================
class Camera {
    constructor(lookFrom, lookAt, vup, vfov, aspectRatio) {
        const theta = vfov * Math.PI / 180;
        const h = Math.tan(theta / 2);
        const viewportHeight = 2.0 * h;
        const viewportWidth = aspectRatio * viewportHeight;

        this.w = lookFrom.sub(lookAt).normalize();
        this.u = vup.cross(this.w).normalize();
        this.v = this.w.cross(this.u);

        this.origin = lookFrom;
        this.horizontal = this.u.mul(viewportWidth);
        this.vertical = this.v.mul(viewportHeight);
        this.lowerLeftCorner = this.origin
            .sub(this.horizontal.div(2))
            .sub(this.vertical.div(2))
            .sub(this.w);
    }

    getRay(s, t) {
        return new Ray(
            this.origin,
            this.lowerLeftCorner
                .add(this.horizontal.mul(s))
                .add(this.vertical.mul(t))
                .sub(this.origin)
        );
    }
}

// ========================================
// Raytracer Engine
// ========================================
class Raytracer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.imageData = this.ctx.createImageData(this.width, this.height);
        
        this.samplesPerPixel = 10;
        this.maxDepth = 5;
        this.world = new HittableList();
        this.camera = null;
        
        this.isRendering = false;
        this.currentY = 0;
        this.startTime = 0;
        
        this.setupScene();
    }

    setupScene() {
        this.world.clear();

        // Materials for Cornell box walls
        const red = new Lambertian(new Vec3(0.65, 0.05, 0.05));
        const white = new Lambertian(new Vec3(0.73, 0.73, 0.73));
        const green = new Lambertian(new Vec3(0.12, 0.45, 0.15));
        
        // Light material
        const light = new DiffuseLight(new Vec3(1, 1, 1), window.raytracer?.lightIntensity || 15);

        // Cornell box walls
        // Left wall (red)
        this.world.add(new AARect(0, 555, 0, 555, 555, 'yz', green));
        // Right wall (green)
        this.world.add(new AARect(0, 555, 0, 555, 0, 'yz', red));
        // Light (top center)
        if (window.raytracer?.showLight !== false) {
            this.world.add(new AARect(213, 343, 227, 332, 554, 'xz', light));
        }
        // Bottom wall (white)
        this.world.add(new AARect(0, 555, 0, 555, 0, 'xz', white));
        // Top wall (white)
        this.world.add(new AARect(0, 555, 0, 555, 555, 'xz', white));
        // Back wall (white)
        this.world.add(new AARect(0, 555, 0, 555, 555, 'xy', white));

        // Boxes
        if (window.raytracer?.showBoxes !== false) {
            const leftMat = this.getBoxMaterial('left');
            const rightMat = this.getBoxMaterial('right');
            
            // Tall box (left)
            this.world.add(new Box(
                new Vec3(130, 0, 65),
                new Vec3(295, 330, 230),
                leftMat
            ));

            // Short box (right)
            this.world.add(new Box(
                new Vec3(265, 0, 295),
                new Vec3(430, 165, 460),
                rightMat
            ));
        }
    }

    getBoxMaterial(side) {
        const materialType = window.raytracer?.[`${side}BoxMaterial`] || 'lambertian';
        const white = new Vec3(0.73, 0.73, 0.73);

        switch (materialType) {
            case 'metal':
                return new Metal(white, 0.1);
            case 'glass':
                return new Dielectric(1.5);
            default:
                return new Lambertian(white);
        }
    }

    setupCamera(angle = 40, distance = 15) {
        const aspectRatio = this.width / this.height;
        const lookFrom = new Vec3(278, 278, -distance * 50);
        const lookAt = new Vec3(278, 278, 0);
        const vup = new Vec3(0, 1, 0);
        
        this.camera = new Camera(lookFrom, lookAt, vup, angle, aspectRatio);
    }

    rayColor(ray, depth) {
        if (depth <= 0) {
            return new Vec3(0, 0, 0);
        }

        const rec = new HitRecord();
        
        if (this.world.hit(ray, 0.001, Infinity, rec)) {
            // Check if material emits light
            if (rec.material.emitted) {
                return rec.material.emitted();
            }

            const scatterResult = rec.material.scatter(ray, rec);
            if (scatterResult) {
                const scattered = scatterResult.scattered;
                const attenuation = scatterResult.attenuation;
                return attenuation.mul(this.rayColor(scattered, depth - 1));
            }
            return new Vec3(0, 0, 0);
        }

        // Background (black for Cornell box)
        return new Vec3(0, 0, 0);
    }

    async render() {
        this.isRendering = true;
        this.currentY = 0;
        this.startTime = Date.now();

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const batchSize = 5; // Render 5 rows at a time

        while (this.currentY < this.height && this.isRendering) {
            const endY = Math.min(this.currentY + batchSize, this.height);
            
            for (let j = this.currentY; j < endY; j++) {
                for (let i = 0; i < this.width; i++) {
                    let pixelColor = new Vec3(0, 0, 0);

                    for (let s = 0; s < this.samplesPerPixel; s++) {
                        const u = (i + Math.random()) / (this.width - 1);
                        const v = (this.height - 1 - j + Math.random()) / (this.height - 1);
                        const ray = this.camera.getRay(u, v);
                        pixelColor = pixelColor.add(this.rayColor(ray, this.maxDepth));
                    }

                    this.writeColor(i, j, pixelColor);
                }
            }

            // Update display
            this.ctx.putImageData(this.imageData, 0, 0);
            
            this.currentY = endY;
            const progress = (this.currentY / this.height * 100).toFixed(1);
            const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
            
            this.updateProgress(progress, elapsed, 'Rendering...');

            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (this.isRendering) {
            const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
            this.updateProgress(100, totalTime, 'Complete');
        }

        this.isRendering = false;
    }

    writeColor(x, y, color) {
        const scale = 1.0 / this.samplesPerPixel;
        
        // Gamma correction (gamma = 2.0)
        let r = Math.sqrt(color.x * scale);
        let g = Math.sqrt(color.y * scale);
        let b = Math.sqrt(color.z * scale);

        // Clamp and convert to 0-255
        r = Math.min(255, Math.floor(256 * Math.max(0, Math.min(0.999, r))));
        g = Math.min(255, Math.floor(256 * Math.max(0, Math.min(0.999, g))));
        b = Math.min(255, Math.floor(256 * Math.max(0, Math.min(0.999, b))));

        const index = (y * this.width + x) * 4;
        this.imageData.data[index] = r;
        this.imageData.data[index + 1] = g;
        this.imageData.data[index + 2] = b;
        this.imageData.data[index + 3] = 255;
    }

    updateProgress(progress, time, status) {
        const progressText = document.getElementById('progress-text');
        const renderTime = document.getElementById('render-time');
        const statusText = document.getElementById('status-text');

        if (progressText) progressText.textContent = `${progress}%`;
        if (renderTime) renderTime.textContent = `${time}s`;
        if (statusText) {
            statusText.textContent = status;
            statusText.className = 'info-value';
            if (status === 'Rendering...') {
                statusText.classList.add('rendering');
            } else if (status === 'Complete') {
                statusText.classList.add('complete');
            }
        }
    }

    stop() {
        this.isRendering = false;
        this.updateProgress(
            (this.currentY / this.height * 100).toFixed(1),
            ((Date.now() - this.startTime) / 1000).toFixed(1),
            'Stopped'
        );
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.imageData = this.ctx.createImageData(width, height);
    }
}

// ========================================
// UI Controller
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('cornell-canvas');
    const renderBtn = document.getElementById('render-btn');
    const stopBtn = document.getElementById('stop-btn');
    const saveBtn = document.getElementById('save-btn');

    // Initialize raytracer
    window.raytracer = new Raytracer(canvas);
    window.raytracer.setupCamera();

    // Settings
    window.raytracer.showBoxes = true;
    window.raytracer.showLight = true;
    window.raytracer.lightIntensity = 15;
    window.raytracer.leftBoxMaterial = 'lambertian';
    window.raytracer.rightBoxMaterial = 'lambertian';

    // Control handlers
    document.getElementById('samples').addEventListener('input', (e) => {
        window.raytracer.samplesPerPixel = parseInt(e.target.value);
        document.getElementById('samples-value').textContent = e.target.value;
    });

    document.getElementById('max-depth').addEventListener('input', (e) => {
        window.raytracer.maxDepth = parseInt(e.target.value);
        document.getElementById('depth-value').textContent = e.target.value;
    });

    document.getElementById('resolution').addEventListener('change', (e) => {
        const size = parseInt(e.target.value);
        window.raytracer.resize(size, size);
        window.raytracer.setupCamera(
            parseInt(document.getElementById('camera-angle').value),
            parseFloat(document.getElementById('camera-distance').value)
        );
        document.getElementById('resolution-value').textContent = `${size}x${size}`;
    });

    document.getElementById('camera-angle').addEventListener('input', (e) => {
        const angle = parseInt(e.target.value);
        document.getElementById('angle-value').textContent = angle;
        window.raytracer.setupCamera(
            angle,
            parseFloat(document.getElementById('camera-distance').value)
        );
    });

    document.getElementById('camera-distance').addEventListener('input', (e) => {
        const distance = parseFloat(e.target.value);
        document.getElementById('distance-value').textContent = distance;
        window.raytracer.setupCamera(
            parseInt(document.getElementById('camera-angle').value),
            distance
        );
    });

    document.getElementById('show-boxes').addEventListener('change', (e) => {
        window.raytracer.showBoxes = e.target.checked;
        window.raytracer.setupScene();
    });

    document.getElementById('show-light').addEventListener('change', (e) => {
        window.raytracer.showLight = e.target.checked;
        window.raytracer.setupScene();
    });

    document.getElementById('light-intensity').addEventListener('input', (e) => {
        window.raytracer.lightIntensity = parseInt(e.target.value);
        document.getElementById('light-value').textContent = e.target.value;
        window.raytracer.setupScene();
    });

    document.getElementById('left-box-material').addEventListener('change', (e) => {
        window.raytracer.leftBoxMaterial = e.target.value;
        window.raytracer.setupScene();
    });

    document.getElementById('right-box-material').addEventListener('change', (e) => {
        window.raytracer.rightBoxMaterial = e.target.value;
        window.raytracer.setupScene();
    });

    // Render button
    renderBtn.addEventListener('click', () => {
        renderBtn.disabled = true;
        stopBtn.disabled = false;
        window.raytracer.setupScene();
        window.raytracer.render().then(() => {
            renderBtn.disabled = false;
            stopBtn.disabled = true;
        });
    });

    // Stop button
    stopBtn.addEventListener('click', () => {
        window.raytracer.stop();
        renderBtn.disabled = false;
        stopBtn.disabled = true;
    });

    // Save button
    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'cornell-box.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            
            if (preset === 'fast') {
                document.getElementById('samples').value = 5;
                document.getElementById('samples-value').textContent = '5';
                document.getElementById('max-depth').value = 3;
                document.getElementById('depth-value').textContent = '3';
                document.getElementById('resolution').value = '300';
                document.getElementById('resolution-value').textContent = '300x300';
                window.raytracer.samplesPerPixel = 5;
                window.raytracer.maxDepth = 3;
                window.raytracer.resize(300, 300);
            } else if (preset === 'balanced') {
                document.getElementById('samples').value = 10;
                document.getElementById('samples-value').textContent = '10';
                document.getElementById('max-depth').value = 5;
                document.getElementById('depth-value').textContent = '5';
                document.getElementById('resolution').value = '600';
                document.getElementById('resolution-value').textContent = '600x600';
                window.raytracer.samplesPerPixel = 10;
                window.raytracer.maxDepth = 5;
                window.raytracer.resize(600, 600);
            } else if (preset === 'quality') {
                document.getElementById('samples').value = 50;
                document.getElementById('samples-value').textContent = '50';
                document.getElementById('max-depth').value = 10;
                document.getElementById('depth-value').textContent = '10';
                document.getElementById('resolution').value = '800';
                document.getElementById('resolution-value').textContent = '800x800';
                window.raytracer.samplesPerPixel = 50;
                window.raytracer.maxDepth = 10;
                window.raytracer.resize(800, 800);
            }
            
            window.raytracer.setupCamera(
                parseInt(document.getElementById('camera-angle').value),
                parseFloat(document.getElementById('camera-distance').value)
            );
        });
    });
});
