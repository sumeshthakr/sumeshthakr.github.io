// Research-Based Interactive Visualizations
// Based on Sumesh Thakur's publications and research areas

class ResearchVisualizations {
    constructor() {
        this.theme = this.getTheme();
        this.initResearchGraphs();
        this.initPointCloudVisualization();
        this.initGNNArchitecture();
        this.initLiDARVisualization();
    }

    // 1. Research Collaboration Network
    initResearchGraphs() {
        const container = document.getElementById('research-network');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const gridCols = 6;
        const gridRows = 4;
        const spacingX = width / (gridCols + 1);
        const spacingY = height / (gridRows + 1);

        const nodes = [];
        for (let row = 0; row < gridRows; row += 1) {
            for (let col = 0; col < gridCols; col += 1) {
                const weight = Math.random() * 0.8 + 0.2;
                nodes.push({
                    id: `${row}-${col}`,
                    x: spacingX * (col + 1),
                    y: spacingY * (row + 1),
                    weight
                });
            }
        }

        const center = { x: width * 0.5, y: height * 0.5 };
        const links = nodes.map(node => ({
            source: center,
            target: node,
            weight: node.weight
        }));

        svg.append('circle')
            .attr('cx', center.x)
            .attr('cy', center.y)
            .attr('r', 18)
            .attr('fill', this.theme.primary)
            .attr('opacity', 0.9);

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', this.theme.secondary)
            .attr('stroke-opacity', d => 0.2 + d.weight * 0.6)
            .attr('stroke-width', d => 1 + d.weight * 4);

        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => 6 + d.weight * 8)
            .attr('fill', d => d3.interpolateRgb(this.theme.secondary, this.theme.primary)(d.weight))
            .attr('opacity', 0.9);

        node.on('mouseover', function(event, d) {
            d3.select(this)
                .attr('r', 18)
                .attr('opacity', 1);
        }).on('mouseout', function(event, d) {
            d3.select(this)
                .attr('r', 6 + d.weight * 8)
                .attr('opacity', 0.9);
        });

        const label = svg.append('text')
            .attr('x', width - 12)
            .attr('y', 20)
            .attr('text-anchor', 'end')
            .attr('fill', this.theme.secondary)
            .attr('font-size', '10px')
            .text('Attention weights');

        d3.timer(() => {
            nodes.forEach(nodeData => {
                nodeData.weight = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + nodeData.x)) * 0.7;
            });
            link
                .attr('stroke-opacity', d => 0.2 + d.target.weight * 0.6)
                .attr('stroke-width', d => 1 + d.target.weight * 4);
            node
                .attr('r', d => 6 + d.weight * 8)
                .attr('fill', d => d3.interpolateRgb(this.theme.secondary, this.theme.primary)(d.weight));
            label.attr('opacity', 0.8 + Math.sin(Date.now() * 0.002) * 0.2);
        });
    }

    // 2. Point Cloud Processing Visualization
    initPointCloudVisualization() {
        const container = document.getElementById('point-cloud-viz');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        svg.append('rect')
            .attr('x', 20)
            .attr('y', 20)
            .attr('width', width - 40)
            .attr('height', height - 40)
            .attr('rx', 12)
            .attr('fill', 'rgba(15, 23, 42, 0.35)')
            .attr('stroke', 'rgba(255,255,255,0.1)');

        // Simulate point cloud data
        const clusters = [
            { centerX: width * 0.3, centerY: height * 0.4, color: this.theme.primary },
            { centerX: width * 0.6, centerY: height * 0.35, color: this.theme.secondary },
            { centerX: width * 0.5, centerY: height * 0.7, color: this.theme.accent }
        ];

        const points = [];
        clusters.forEach((cluster, clusterIndex) => {
            for (let i = 0; i < 220; i += 1) {
                points.push({
                    x: cluster.centerX + (Math.random() - 0.5) * 160,
                    y: cluster.centerY + (Math.random() - 0.5) * 120,
                    intensity: Math.random(),
                    cluster: clusterIndex
                });
            }
        });

        const g = svg.append('g');

        g.selectAll('circle')
            .data(points)
            .enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => 1.5 + d.intensity * 2.5)
            .attr('fill', d => clusters[d.cluster].color)
            .attr('opacity', 0.65);

        svg.append('text')
            .attr('x', 24)
            .attr('y', height - 14)
            .attr('fill', this.theme.secondary)
            .attr('font-size', '10px')
            .text('Semantic clusters');

        // Subtle motion drift
        d3.timer(() => {
            points.forEach(point => {
                point.x += (Math.random() - 0.5) * 0.6;
                point.y += (Math.random() - 0.5) * 0.6;
                point.x = Math.min(width - 30, Math.max(30, point.x));
                point.y = Math.min(height - 30, Math.max(30, point.y));
            });

            g.selectAll('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });
    }

    // 3. GNN Architecture Visualization
    initGNNArchitecture() {
        const container = document.getElementById('gnn-architecture');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const nodes = [
            { id: 0, x: width * 0.25, y: height * 0.35 },
            { id: 1, x: width * 0.5, y: height * 0.25 },
            { id: 2, x: width * 0.75, y: height * 0.35 },
            { id: 3, x: width * 0.35, y: height * 0.7 },
            { id: 4, x: width * 0.65, y: height * 0.7 }
        ];

        const edges = [
            { source: 0, target: 1, weight: 0.4 },
            { source: 1, target: 2, weight: 0.7 },
            { source: 0, target: 3, weight: 0.3 },
            { source: 2, target: 4, weight: 0.6 },
            { source: 3, target: 4, weight: 0.5 },
            { source: 1, target: 3, weight: 0.8 }
        ];

        const edgeGroup = svg.append('g');
        const nodeGroup = svg.append('g');

        const edgeLines = edgeGroup.selectAll('line')
            .data(edges)
            .enter().append('line')
            .attr('x1', d => nodes[d.source].x)
            .attr('y1', d => nodes[d.source].y)
            .attr('x2', d => nodes[d.target].x)
            .attr('y2', d => nodes[d.target].y)
            .attr('stroke', this.theme.secondary)
            .attr('stroke-opacity', d => 0.3 + d.weight * 0.5)
            .attr('stroke-width', d => 2 + d.weight * 4);

        const nodeCircles = nodeGroup.selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 10)
            .attr('fill', this.theme.primary)
            .attr('opacity', 0.9);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 18)
            .attr('text-anchor', 'middle')
            .attr('fill', this.theme.secondary)
            .attr('font-size', '11px')
            .text('Dynamic edge weighting over aggregation steps');

        d3.timer(() => {
            edges.forEach(edge => {
                edge.weight = 0.2 + Math.abs(Math.sin(Date.now() * 0.001 + edge.source)) * 0.8;
            });
            edgeLines
                .attr('stroke-width', d => 2 + d.weight * 4)
                .attr('stroke-opacity', d => 0.3 + d.weight * 0.5);
            nodeCircles
                .attr('fill', d => d3.interpolateRgb(this.theme.secondary, this.theme.primary)(Math.abs(Math.sin(Date.now() * 0.001 + d.id))))
                .attr('r', d => 9 + Math.abs(Math.sin(Date.now() * 0.001 + d.id)) * 5);
        });
    }

    // 4. LiDAR Object Detection Visualization
    initLiDARVisualization() {
        const container = document.getElementById('lidar-viz');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g');

        const agents = Array.from({ length: 6 }, (_, index) => ({
            id: index,
            x: width * (0.2 + Math.random() * 0.6),
            y: height * (0.2 + Math.random() * 0.6),
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            trail: []
        }));

        const trailGroup = g.append('g');
        const nodeGroup = g.append('g');

        const drawTrails = () => {
            const trails = trailGroup.selectAll('path')
                .data(agents, d => d.id);

            trails.enter()
                .append('path')
                .merge(trails)
                .attr('d', d => {
                    const path = d.trail.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`);
                    return path.join(' ');
                })
                .attr('fill', 'none')
                .attr('stroke', this.theme.secondary)
                .attr('stroke-width', 2)
                .attr('stroke-opacity', 0.4);

            trails.exit().remove();
        };

        const nodes = nodeGroup.selectAll('circle')
            .data(agents)
            .enter().append('circle')
            .attr('r', 8)
            .attr('fill', this.theme.primary)
            .attr('opacity', 0.9);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', this.theme.secondary)
            .attr('font-size', '11px')
            .text('Motion trajectories');

        d3.timer(() => {
            agents.forEach(agent => {
                agent.x += agent.vx;
                agent.y += agent.vy;

                if (agent.x < 20 || agent.x > width - 20) agent.vx *= -1;
                if (agent.y < 20 || agent.y > height - 20) agent.vy *= -1;

                agent.trail.push({ x: agent.x, y: agent.y });
                if (agent.trail.length > 18) agent.trail.shift();
            });

            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            drawTrails();
        });
    }

    getAreaColor(area) {
        const colors = {
            'GNN': this.theme.primary,
            '3D Vision': this.theme.secondary,
            'Optimization': this.theme.accent,
            'Computer Vision': this.theme.secondarySoft,
            '3D Processing': this.theme.primarySoft,
            'ML': '#f59e0b',
            'Applications': '#22c55e'
        };
        return colors[area] || '#888888';
    }

    getTheme() {
        const styles = getComputedStyle(document.documentElement);
        return {
            primary: styles.getPropertyValue('--primary-color').trim(),
            secondary: styles.getPropertyValue('--secondary-color').trim(),
            accent: styles.getPropertyValue('--accent-color').trim(),
            secondarySoft: '#a5b4fc',
            primarySoft: '#93c5fd'
        };
    }
}

// Initialize when DOM is ready
const initResearchVisualizations = () => {
    if (window.__researchVisualizationsInitialized) return;
    window.__researchVisualizationsInitialized = true;
    new ResearchVisualizations();
};

const loadResearchD3 = () => {
    if (window.d3) {
        initResearchVisualizations();
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = initResearchVisualizations;
    document.head.appendChild(script);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadResearchD3);
} else {
    loadResearchD3();
}
