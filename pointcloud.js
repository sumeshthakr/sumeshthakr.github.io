// Point Cloud Processing Demo
// Interactive 3D point cloud processing with downsampling, segmentation, and clustering

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
        return new Vec3(this.x * t, this.y * t, this.z * t);
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
        const len = this.length();
        return len > 0 ? this.div(len) : new Vec3(0, 0, 0);
    }

    distanceTo(v) {
        return this.sub(v).length();
    }
}

// ========================================
// Point Class
// ========================================
class Point {
    constructor(position, color = null) {
        this.position = position; // Vec3
        this.color = color || new Vec3(1, 1, 1); // RGB [0, 1]
        this.cluster = -1; // For clustering
        this.segment = -1; // For segmentation
    }
}

// ========================================
// Synthetic Point Cloud Generator
// ========================================
class PointCloudGenerator {
    static generateIndoorScene() {
        const points = [];
        
        // Floor (large plane)
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            const y = -2 + (Math.random() - 0.5) * 0.1;
            const color = new Vec3(0.6, 0.5, 0.4); // Brown floor
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Walls
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 3 + 0.5;
            const z = -5 + (Math.random() - 0.5) * 0.1;
            const color = new Vec3(0.8, 0.8, 0.7); // Light wall
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Furniture - Table
        for (let i = 0; i < 1500; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = -1 + (Math.random() - 0.5) * 0.2;
            const z = (Math.random() - 0.5) * 2;
            const color = new Vec3(0.5, 0.3, 0.2); // Dark wood
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Furniture - Chair
        for (let i = 0; i < 1000; i++) {
            const x = 2 + (Math.random() - 0.5) * 0.8;
            const y = -1.5 + Math.random() * 1;
            const z = (Math.random() - 0.5) * 0.8;
            const color = new Vec3(0.3, 0.3, 0.4); // Gray chair
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        return points;
    }

    static generateOutdoorScene() {
        const points = [];
        
        // Ground
        for (let i = 0; i < 6000; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const y = -2 + (Math.random() - 0.5) * 0.3;
            const color = new Vec3(0.4, 0.5, 0.3); // Green ground
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Building wall
        for (let i = 0; i < 4000; i++) {
            const x = -8 + (Math.random() - 0.5) * 0.5;
            const y = (Math.random() - 0.5) * 6;
            const z = (Math.random() - 0.5) * 15;
            const color = new Vec3(0.6, 0.6, 0.65); // Gray building
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Tree
        for (let i = 0; i < 2000; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 1.5;
            const x = 5 + Math.cos(angle) * r;
            const z = 5 + Math.sin(angle) * r;
            const y = Math.random() * 4 - 1;
            const color = new Vec3(0.2, 0.6, 0.2); // Green tree
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Road marking
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 2;
            const y = -1.95;
            const color = new Vec3(0.9, 0.9, 0.9); // White line
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        return points;
    }

    static generateCarObject() {
        const points = [];
        
        // Car body
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 4;
            const y = (Math.random() - 0.5) * 1.5;
            const z = (Math.random() - 0.5) * 2;
            const color = new Vec3(0.8, 0.2, 0.2); // Red car
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Windshield
        for (let i = 0; i < 500; i++) {
            const x = (Math.random() - 0.5) * 1.5 + 0.5;
            const y = (Math.random() - 0.5) * 0.8 + 0.5;
            const z = (Math.random() - 0.5) * 1.8;
            const color = new Vec3(0.3, 0.5, 0.7); // Blue glass
            points.push(new Point(new Vec3(x, y, z), color));
        }
        
        // Wheels (4)
        const wheelPositions = [
            new Vec3(-1.5, -0.75, -0.8),
            new Vec3(-1.5, -0.75, 0.8),
            new Vec3(1.5, -0.75, -0.8),
            new Vec3(1.5, -0.75, 0.8)
        ];
        
        for (const center of wheelPositions) {
            for (let i = 0; i < 400; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * 0.4;
                const x = center.x + Math.cos(angle) * r;
                const y = center.y + (Math.random() - 0.5) * 0.3;
                const z = center.z + Math.sin(angle) * r;
                const color = new Vec3(0.1, 0.1, 0.1); // Black wheel
                points.push(new Point(new Vec3(x, y, z), color));
            }
        }
        
        return points;
    }
}

// ========================================
// Downsampling Algorithms
// ========================================
class DownsamplingAlgorithms {
    static uniformSampling(points, targetCount) {
        if (points.length <= targetCount) return [...points];
        
        const step = Math.floor(points.length / targetCount);
        const sampled = [];
        
        for (let i = 0; i < points.length; i += step) {
            if (sampled.length < targetCount) {
                sampled.push(points[i]);
            }
        }
        
        return sampled;
    }

    static randomSampling(points, targetCount) {
        if (points.length <= targetCount) return [...points];
        
        const indices = new Set();
        while (indices.size < targetCount) {
            indices.add(Math.floor(Math.random() * points.length));
        }
        
        return Array.from(indices).map(i => points[i]);
    }

    static voxelGridSampling(points, voxelSize) {
        const voxelMap = new Map();
        
        for (const point of points) {
            const vx = Math.floor(point.position.x / voxelSize);
            const vy = Math.floor(point.position.y / voxelSize);
            const vz = Math.floor(point.position.z / voxelSize);
            const key = `${vx},${vy},${vz}`;
            
            if (!voxelMap.has(key)) {
                voxelMap.set(key, []);
            }
            voxelMap.get(key).push(point);
        }
        
        // Average points in each voxel
        const sampled = [];
        for (const voxelPoints of voxelMap.values()) {
            let avgPos = new Vec3(0, 0, 0);
            let avgColor = new Vec3(0, 0, 0);
            
            for (const p of voxelPoints) {
                avgPos = avgPos.add(p.position);
                avgColor = avgColor.add(p.color);
            }
            
            avgPos = avgPos.div(voxelPoints.length);
            avgColor = avgColor.div(voxelPoints.length);
            
            sampled.push(new Point(avgPos, avgColor));
        }
        
        return sampled;
    }

    static distanceAwareSampling(points, threshold) {
        if (points.length === 0) return [];
        
        // Compute local curvature/density for each point
        const kNeighbors = 10;
        const curvatures = new Array(points.length).fill(0);
        
        for (let i = 0; i < points.length; i++) {
            // Find k nearest neighbors
            const distances = points.map((p, idx) => ({
                idx: idx,
                dist: points[i].position.distanceTo(p.position)
            }));
            
            distances.sort((a, b) => a.dist - b.dist);
            const neighbors = distances.slice(1, kNeighbors + 1);
            
            // Compute variance of distances (proxy for curvature)
            const avgDist = neighbors.reduce((sum, n) => sum + n.dist, 0) / neighbors.length;
            const variance = neighbors.reduce((sum, n) => sum + Math.pow(n.dist - avgDist, 2), 0) / neighbors.length;
            curvatures[i] = variance;
        }
        
        // Normalize curvatures
        const maxCurvature = Math.max(...curvatures);
        if (maxCurvature > 0) {
            for (let i = 0; i < curvatures.length; i++) {
                curvatures[i] /= maxCurvature;
            }
        }
        
        // Sample based on curvature - keep high curvature areas, downsample low curvature
        const sampled = [];
        for (let i = 0; i < points.length; i++) {
            // Probability of keeping point based on curvature
            const keepProb = 0.1 + curvatures[i] * 0.9; // 10% base + up to 90% more for high curvature
            
            if (Math.random() < keepProb) {
                sampled.push(points[i]);
            }
        }
        
        // Ensure we don't keep too many points
        if (sampled.length > points.length * 0.5) {
            return this.randomSampling(sampled, Math.floor(points.length * 0.5));
        }
        
        return sampled;
    }
}

// ========================================
// Segmentation Algorithms
// ========================================
class SegmentationAlgorithms {
    static ransacPlane(points, iterations, threshold) {
        let bestPlane = null;
        let bestInliers = [];
        
        for (let iter = 0; iter < iterations; iter++) {
            // Randomly select 3 points
            const indices = new Set();
            while (indices.size < 3) {
                indices.add(Math.floor(Math.random() * points.length));
            }
            const [i1, i2, i3] = Array.from(indices);
            
            const p1 = points[i1].position;
            const p2 = points[i2].position;
            const p3 = points[i3].position;
            
            // Compute plane normal
            const v1 = p2.sub(p1);
            const v2 = p3.sub(p1);
            const normal = v1.cross(v2).normalize();
            
            if (normal.length() === 0) continue;
            
            // Plane equation: ax + by + cz + d = 0
            const d = -normal.dot(p1);
            
            // Count inliers
            const inliers = [];
            for (let i = 0; i < points.length; i++) {
                const dist = Math.abs(normal.dot(points[i].position) + d);
                if (dist < threshold) {
                    inliers.push(i);
                }
            }
            
            // Keep best plane
            if (inliers.length > bestInliers.length) {
                bestPlane = { normal, d };
                bestInliers = inliers;
            }
        }
        
        // Mark inliers
        const result = points.map(p => new Point(p.position, p.color));
        for (const idx of bestInliers) {
            result[idx].segment = 0;
            result[idx].color = new Vec3(1, 0, 0); // Red for plane
        }
        
        return result;
    }

    static ransacMultiPlane(points, numPlanes, iterations, threshold) {
        let remainingPoints = points.map(p => new Point(p.position, p.color));
        const colors = [
            new Vec3(1, 0, 0),   // Red
            new Vec3(0, 1, 0),   // Green
            new Vec3(0, 0, 1),   // Blue
            new Vec3(1, 1, 0),   // Yellow
            new Vec3(1, 0, 1)    // Magenta
        ];
        
        for (let planeIdx = 0; planeIdx < numPlanes; planeIdx++) {
            if (remainingPoints.length < 10) break;
            
            let bestPlane = null;
            let bestInliers = [];
            
            for (let iter = 0; iter < iterations; iter++) {
                // Randomly select 3 points
                const indices = new Set();
                while (indices.size < 3 && indices.size < remainingPoints.length) {
                    indices.add(Math.floor(Math.random() * remainingPoints.length));
                }
                
                if (indices.size < 3) break;
                
                const [i1, i2, i3] = Array.from(indices);
                const p1 = remainingPoints[i1].position;
                const p2 = remainingPoints[i2].position;
                const p3 = remainingPoints[i3].position;
                
                // Compute plane normal
                const v1 = p2.sub(p1);
                const v2 = p3.sub(p1);
                const normal = v1.cross(v2).normalize();
                
                if (normal.length() === 0) continue;
                
                const d = -normal.dot(p1);
                
                // Count inliers
                const inliers = [];
                for (let i = 0; i < remainingPoints.length; i++) {
                    const dist = Math.abs(normal.dot(remainingPoints[i].position) + d);
                    if (dist < threshold) {
                        inliers.push(i);
                    }
                }
                
                if (inliers.length > bestInliers.length) {
                    bestPlane = { normal, d };
                    bestInliers = inliers;
                }
            }
            
            // Mark inliers and remove from remaining
            const newRemaining = [];
            for (let i = 0; i < remainingPoints.length; i++) {
                if (bestInliers.includes(i)) {
                    remainingPoints[i].segment = planeIdx;
                    remainingPoints[i].color = colors[planeIdx % colors.length];
                } else {
                    newRemaining.push(remainingPoints[i]);
                }
            }
            
            remainingPoints = newRemaining;
        }
        
        return points.map((p, i) => {
            const processed = points.find(pt => pt === p);
            return processed || p;
        });
    }
}

// ========================================
// Clustering Algorithms
// ========================================
class ClusteringAlgorithms {
    static kmeans(points, k, maxIterations = 50) {
        if (points.length === 0) return points;
        
        // Initialize centroids randomly
        const centroids = [];
        const usedIndices = new Set();
        while (centroids.length < k) {
            const idx = Math.floor(Math.random() * points.length);
            if (!usedIndices.has(idx)) {
                centroids.push(new Vec3(
                    points[idx].position.x,
                    points[idx].position.y,
                    points[idx].position.z
                ));
                usedIndices.add(idx);
            }
        }
        
        // Iterate
        for (let iter = 0; iter < maxIterations; iter++) {
            // Assign points to nearest centroid
            for (const point of points) {
                let minDist = Infinity;
                let bestCluster = 0;
                
                for (let c = 0; c < k; c++) {
                    const dist = point.position.distanceTo(centroids[c]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCluster = c;
                    }
                }
                
                point.cluster = bestCluster;
            }
            
            // Update centroids
            const newCentroids = new Array(k).fill(null).map(() => new Vec3(0, 0, 0));
            const counts = new Array(k).fill(0);
            
            for (const point of points) {
                newCentroids[point.cluster] = newCentroids[point.cluster].add(point.position);
                counts[point.cluster]++;
            }
            
            let converged = true;
            for (let c = 0; c < k; c++) {
                if (counts[c] > 0) {
                    newCentroids[c] = newCentroids[c].div(counts[c]);
                    if (centroids[c].distanceTo(newCentroids[c]) > 0.01) {
                        converged = false;
                    }
                    centroids[c] = newCentroids[c];
                }
            }
            
            if (converged) break;
        }
        
        // Color by cluster
        const colors = [
            new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1),
            new Vec3(1, 1, 0), new Vec3(1, 0, 1), new Vec3(0, 1, 1),
            new Vec3(1, 0.5, 0), new Vec3(0.5, 0, 1), new Vec3(0, 0.5, 1),
            new Vec3(0.5, 1, 0)
        ];
        
        for (const point of points) {
            point.color = colors[point.cluster % colors.length];
        }
        
        return points;
    }

    static dbscan(points, eps, minPts) {
        if (points.length === 0) return points;
        
        // Initialize all points as unvisited
        const visited = new Array(points.length).fill(false);
        const clusters = new Array(points.length).fill(-1); // -1 = noise
        let clusterIdx = 0;
        
        const getNeighbors = (pointIdx) => {
            const neighbors = [];
            for (let i = 0; i < points.length; i++) {
                if (i !== pointIdx && points[i].position.distanceTo(points[pointIdx].position) <= eps) {
                    neighbors.push(i);
                }
            }
            return neighbors;
        };
        
        const expandCluster = (pointIdx, neighbors, cluster) => {
            clusters[pointIdx] = cluster;
            
            for (let i = 0; i < neighbors.length; i++) {
                const neighborIdx = neighbors[i];
                
                if (!visited[neighborIdx]) {
                    visited[neighborIdx] = true;
                    const neighborNeighbors = getNeighbors(neighborIdx);
                    
                    if (neighborNeighbors.length >= minPts) {
                        neighbors.push(...neighborNeighbors);
                    }
                }
                
                if (clusters[neighborIdx] === -1) {
                    clusters[neighborIdx] = cluster;
                }
            }
        };
        
        // DBSCAN main loop
        for (let i = 0; i < points.length; i++) {
            if (visited[i]) continue;
            
            visited[i] = true;
            const neighbors = getNeighbors(i);
            
            if (neighbors.length < minPts) {
                clusters[i] = -1; // Noise
            } else {
                expandCluster(i, neighbors, clusterIdx);
                clusterIdx++;
            }
        }
        
        // Color by cluster
        const colors = [
            new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1),
            new Vec3(1, 1, 0), new Vec3(1, 0, 1), new Vec3(0, 1, 1),
            new Vec3(1, 0.5, 0), new Vec3(0.5, 0, 1), new Vec3(0, 0.5, 1),
            new Vec3(0.5, 1, 0)
        ];
        
        for (let i = 0; i < points.length; i++) {
            points[i].cluster = clusters[i];
            if (clusters[i] === -1) {
                points[i].color = new Vec3(0.3, 0.3, 0.3); // Gray for noise
            } else {
                points[i].color = colors[clusters[i] % colors.length];
            }
        }
        
        return points;
    }
}

// ========================================
// 3D Renderer
// ========================================
class PointCloudRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Camera settings
        this.camera = {
            pos: new Vec3(0, 0, 15),
            rotation: { x: 0, y: 0 },
            fov: 60,
            near: 0.1,
            far: 100
        };
        
        // Mouse interaction
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.pointSize = 2.0;
        this.showColors = true;
        
        this.setupEvents();
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouse.x;
                const dy = e.clientY - this.lastMouse.y;
                
                this.camera.rotation.y += dx * 0.01;
                this.camera.rotation.x += dy * 0.01;
                
                this.lastMouse = { x: e.clientX, y: e.clientY };
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.pos.z += e.deltaY * 0.01;
            this.camera.pos.z = Math.max(5, Math.min(30, this.camera.pos.z));
        });
    }

    resetView() {
        this.camera.pos = new Vec3(0, 0, 15);
        this.camera.rotation = { x: 0, y: 0 };
    }

    project(point) {
        // Apply rotation
        let p = new Vec3(point.x, point.y, point.z);
        
        // Rotate around Y axis
        let cosY = Math.cos(this.camera.rotation.y);
        let sinY = Math.sin(this.camera.rotation.y);
        let x = p.x * cosY - p.z * sinY;
        let z = p.x * sinY + p.z * cosY;
        p = new Vec3(x, p.y, z);
        
        // Rotate around X axis
        let cosX = Math.cos(this.camera.rotation.x);
        let sinX = Math.sin(this.camera.rotation.x);
        let y = p.y * cosX - p.z * sinX;
        z = p.y * sinX + p.z * cosX;
        p = new Vec3(p.x, y, z);
        
        // Translate by camera position
        p = p.sub(this.camera.pos);
        
        // Perspective projection
        if (p.z <= this.camera.near) return null;
        
        const fov = this.camera.fov * Math.PI / 180;
        const scale = (1 / Math.tan(fov / 2)) / p.z;
        
        const screenX = p.x * scale * this.height / 2 + this.width / 2;
        const screenY = -p.y * scale * this.height / 2 + this.height / 2;
        
        return { x: screenX, y: screenY, z: p.z };
    }

    render(points) {
        // Clear canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (!points || points.length === 0) return;
        
        // Project and sort by depth
        const projected = [];
        for (const point of points) {
            const screen = this.project(point.position);
            if (screen) {
                projected.push({ screen, point });
            }
        }
        
        // Sort by depth (far to near for painter's algorithm)
        projected.sort((a, b) => b.screen.z - a.screen.z);
        
        // Draw points
        for (const { screen, point } of projected) {
            if (this.showColors && point.color) {
                const r = Math.floor(point.color.x * 255);
                const g = Math.floor(point.color.y * 255);
                const b = Math.floor(point.color.z * 255);
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            } else {
                this.ctx.fillStyle = '#ffffff';
            }
            
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, this.pointSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// ========================================
// Performance Tracking
// ========================================
class PerformanceTracker {
    constructor() {
        this.metrics = [];
    }

    addMetric(method, time, originalPoints, processedPoints) {
        const reduction = ((1 - processedPoints / originalPoints) * 100).toFixed(1);
        this.metrics.push({
            method,
            time: time.toFixed(2),
            originalPoints,
            processedPoints,
            reduction
        });
    }

    getMetrics() {
        return this.metrics;
    }

    clear() {
        this.metrics = [];
    }
}

// ========================================
// Main Application
// ========================================
class PointCloudApp {
    constructor() {
        this.canvas = document.getElementById('pointcloud-canvas');
        this.renderer = new PointCloudRenderer(this.canvas);
        this.performanceTracker = new PerformanceTracker();
        
        this.originalPoints = [];
        this.processedPoints = [];
        
        this.setupUI();
        this.loadDefaultDataset();
    }

    setupUI() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
            });
        });

        // Dataset controls
        document.getElementById('load-dataset-btn').addEventListener('click', () => {
            this.loadDataset();
        });

        document.getElementById('show-colors').addEventListener('change', (e) => {
            this.renderer.showColors = e.target.checked;
            this.render();
        });

        document.getElementById('point-size').addEventListener('input', (e) => {
            this.renderer.pointSize = parseFloat(e.target.value);
            document.getElementById('point-size-value').textContent = e.target.value;
            this.render();
        });

        document.getElementById('reset-view-btn').addEventListener('click', () => {
            this.renderer.resetView();
            this.render();
        });

        // Downsampling controls
        document.getElementById('downsample-method').addEventListener('change', (e) => {
            const method = e.target.value;
            document.getElementById('target-points-group').style.display = 
                (method === 'uniform' || method === 'random') ? 'block' : 'none';
            document.getElementById('voxel-size-group').style.display = 
                method === 'voxel' ? 'block' : 'none';
            document.getElementById('distance-aware-group').style.display = 
                method === 'distance-aware' ? 'block' : 'none';
        });

        document.getElementById('target-points').addEventListener('input', (e) => {
            document.getElementById('target-points-value').textContent = e.target.value;
        });

        document.getElementById('voxel-size').addEventListener('input', (e) => {
            document.getElementById('voxel-size-value').textContent = e.target.value;
        });

        document.getElementById('distance-threshold').addEventListener('input', (e) => {
            document.getElementById('distance-threshold-value').textContent = e.target.value;
        });

        document.getElementById('apply-downsample-btn').addEventListener('click', () => {
            this.applyDownsampling();
        });

        // Segmentation controls
        document.getElementById('segment-method').addEventListener('change', (e) => {
            const method = e.target.value;
            document.getElementById('ransac-params').style.display = 
                method !== 'none' ? 'block' : 'none';
            document.getElementById('ransac-threshold-group').style.display = 
                method !== 'none' ? 'block' : 'none';
            document.getElementById('num-planes-group').style.display = 
                method === 'ransac-multi' ? 'block' : 'none';
        });

        document.getElementById('ransac-iterations').addEventListener('input', (e) => {
            document.getElementById('ransac-iterations-value').textContent = e.target.value;
        });

        document.getElementById('ransac-threshold').addEventListener('input', (e) => {
            document.getElementById('ransac-threshold-value').textContent = e.target.value;
        });

        document.getElementById('num-planes').addEventListener('input', (e) => {
            document.getElementById('num-planes-value').textContent = e.target.value;
        });

        document.getElementById('apply-segment-btn').addEventListener('click', () => {
            this.applySegmentation();
        });

        // Clustering controls
        document.getElementById('cluster-method').addEventListener('change', (e) => {
            const method = e.target.value;
            document.getElementById('kmeans-params').style.display = 
                method === 'kmeans' ? 'block' : 'none';
            document.getElementById('dbscan-params').style.display = 
                method === 'dbscan' ? 'block' : 'none';
            document.getElementById('dbscan-minpts-group').style.display = 
                method === 'dbscan' ? 'block' : 'none';
        });

        document.getElementById('num-clusters').addEventListener('input', (e) => {
            document.getElementById('num-clusters-value').textContent = e.target.value;
        });

        document.getElementById('dbscan-eps').addEventListener('input', (e) => {
            document.getElementById('dbscan-eps-value').textContent = e.target.value;
        });

        document.getElementById('dbscan-minpts').addEventListener('input', (e) => {
            document.getElementById('dbscan-minpts-value').textContent = e.target.value;
        });

        document.getElementById('apply-cluster-btn').addEventListener('click', () => {
            this.applyClustering();
        });

        // Performance controls
        document.getElementById('clear-metrics-btn').addEventListener('click', () => {
            this.performanceTracker.clear();
            this.updateMetricsTable();
            this.drawPerformanceChart();
        });
    }

    loadDefaultDataset() {
        this.originalPoints = PointCloudGenerator.generateIndoorScene();
        this.processedPoints = [...this.originalPoints];
        this.updateInfo();
        this.render();
    }

    loadDataset() {
        const dataset = document.getElementById('dataset-select').value;
        
        switch (dataset) {
            case 'indoor':
                this.originalPoints = PointCloudGenerator.generateIndoorScene();
                break;
            case 'outdoor':
                this.originalPoints = PointCloudGenerator.generateOutdoorScene();
                break;
            case 'object':
                this.originalPoints = PointCloudGenerator.generateCarObject();
                break;
        }
        
        this.processedPoints = [...this.originalPoints];
        this.updateInfo();
        this.render();
    }

    applyDownsampling() {
        const method = document.getElementById('downsample-method').value;
        
        if (method === 'none') {
            this.processedPoints = [...this.originalPoints];
            this.updateInfo();
            this.render();
            return;
        }
        
        const startTime = performance.now();
        
        switch (method) {
            case 'uniform':
                const targetPoints = parseInt(document.getElementById('target-points').value);
                this.processedPoints = DownsamplingAlgorithms.uniformSampling(this.originalPoints, targetPoints);
                break;
            case 'random':
                const targetRandom = parseInt(document.getElementById('target-points').value);
                this.processedPoints = DownsamplingAlgorithms.randomSampling(this.originalPoints, targetRandom);
                break;
            case 'voxel':
                const voxelSize = parseFloat(document.getElementById('voxel-size').value);
                this.processedPoints = DownsamplingAlgorithms.voxelGridSampling(this.originalPoints, voxelSize);
                break;
            case 'distance-aware':
                const threshold = parseFloat(document.getElementById('distance-threshold').value);
                this.processedPoints = DownsamplingAlgorithms.distanceAwareSampling(this.originalPoints, threshold);
                break;
        }
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        this.performanceTracker.addMetric(
            method,
            processingTime,
            this.originalPoints.length,
            this.processedPoints.length
        );
        
        this.updateInfo(processingTime);
        this.updateMetricsTable();
        this.drawPerformanceChart();
        this.render();
    }

    applySegmentation() {
        const method = document.getElementById('segment-method').value;
        
        if (method === 'none') {
            this.processedPoints = [...this.originalPoints];
            this.updateInfo();
            this.render();
            return;
        }
        
        const startTime = performance.now();
        const iterations = parseInt(document.getElementById('ransac-iterations').value);
        const threshold = parseFloat(document.getElementById('ransac-threshold').value);
        
        switch (method) {
            case 'ransac-plane':
                this.processedPoints = SegmentationAlgorithms.ransacPlane(
                    this.processedPoints,
                    iterations,
                    threshold
                );
                break;
            case 'ransac-multi':
                const numPlanes = parseInt(document.getElementById('num-planes').value);
                this.processedPoints = SegmentationAlgorithms.ransacMultiPlane(
                    this.processedPoints,
                    numPlanes,
                    iterations,
                    threshold
                );
                break;
        }
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        this.performanceTracker.addMetric(
            method,
            processingTime,
            this.originalPoints.length,
            this.processedPoints.length
        );
        
        this.updateInfo(processingTime);
        this.updateMetricsTable();
        this.drawPerformanceChart();
        this.render();
    }

    applyClustering() {
        const method = document.getElementById('cluster-method').value;
        
        if (method === 'none') {
            this.processedPoints = this.processedPoints.map(p => {
                const newPoint = new Point(p.position, p.color);
                return newPoint;
            });
            this.updateInfo();
            this.render();
            return;
        }
        
        const startTime = performance.now();
        
        switch (method) {
            case 'kmeans':
                const k = parseInt(document.getElementById('num-clusters').value);
                this.processedPoints = ClusteringAlgorithms.kmeans(this.processedPoints, k);
                break;
            case 'dbscan':
                const eps = parseFloat(document.getElementById('dbscan-eps').value);
                const minPts = parseInt(document.getElementById('dbscan-minpts').value);
                this.processedPoints = ClusteringAlgorithms.dbscan(this.processedPoints, eps, minPts);
                break;
        }
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        this.performanceTracker.addMetric(
            method,
            processingTime,
            this.originalPoints.length,
            this.processedPoints.length
        );
        
        this.updateInfo(processingTime);
        this.updateMetricsTable();
        this.drawPerformanceChart();
        this.render();
    }

    updateInfo(processingTime = 0) {
        document.getElementById('original-points').textContent = this.originalPoints.length.toLocaleString();
        document.getElementById('processed-points').textContent = this.processedPoints.length.toLocaleString();
        document.getElementById('processing-time').textContent = processingTime.toFixed(1) + 'ms';
        
        const reduction = ((1 - this.processedPoints.length / this.originalPoints.length) * 100).toFixed(1);
        document.getElementById('reduction-ratio').textContent = reduction + '%';
    }

    updateMetricsTable() {
        const tbody = document.getElementById('metrics-tbody');
        const metrics = this.performanceTracker.getMetrics();
        
        if (metrics.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">No performance data yet. Apply methods to see metrics.</td></tr>';
            return;
        }
        
        tbody.innerHTML = metrics.map(m => `
            <tr>
                <td>${m.method}</td>
                <td>${m.time}ms</td>
                <td>${m.processedPoints.toLocaleString()}</td>
                <td>${m.reduction}%</td>
            </tr>
        `).join('');
    }

    drawPerformanceChart() {
        const canvas = document.getElementById('perf-canvas');
        const ctx = canvas.getContext('2d');
        const metrics = this.performanceTracker.getMetrics();
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (metrics.length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const maxTime = Math.max(...metrics.map(m => parseFloat(m.time)));
        const barWidth = (canvas.width - 40) / metrics.length;
        const maxBarHeight = canvas.height - 60;
        
        metrics.forEach((m, i) => {
            const time = parseFloat(m.time);
            const barHeight = (time / maxTime) * maxBarHeight;
            const x = 20 + i * barWidth;
            const y = canvas.height - 40 - barHeight;
            
            // Draw bar
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
            
            // Draw label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(x + barWidth / 2, canvas.height - 10);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(m.method, 0, 0);
            ctx.restore();
            
            // Draw value
            ctx.fillStyle = '#fff';
            ctx.fillText(m.time + 'ms', x + barWidth / 2, y - 5);
        });
        
        // Draw title
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Processing Time Comparison', 10, 15);
    }

    render() {
        this.renderer.render(this.processedPoints);
    }
}

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    window.pointCloudApp = new PointCloudApp();
    
    // Animation loop for smooth rendering
    function animate() {
        if (window.pointCloudApp.renderer.isDragging) {
            window.pointCloudApp.render();
        }
        requestAnimationFrame(animate);
    }
    animate();
});
