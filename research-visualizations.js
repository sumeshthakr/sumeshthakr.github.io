// Research-Based Interactive Visualizations
// Based on Sumesh Thakur's publications and research areas

class ResearchVisualizations {
    constructor() {
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

        // Research areas and connections based on actual publications
        const nodes = [
            { id: 'GAGAT', name: 'GAGAT\nGlobal Aware\nGraph Attention', area: 'GNN', year: 2023, impact: 15, citations: 45 },
            { id: 'LiDAR_GNN', name: 'LiDAR Object\nDetection\nGNN', area: '3D Vision', year: 2022, impact: 12, citations: 38 },
            { id: 'Dynamic_Weights', name: 'Dynamic Edge\nWeights', area: 'Optimization', year: 2020, impact: 8, citations: 25 },
            { id: 'Video_Analysis', name: 'Video Motion\nAnalysis', area: 'Computer Vision', year: 2020, impact: 6, citations: 18 },
            { id: 'Point_Clouds', name: '3D Point\nClouds', area: '3D Processing', year: 2023, impact: 14, citations: 42 },
            { id: 'Graph_Attention', name: 'Graph\nAttention\nMechanisms', area: 'ML', year: 2023, impact: 16, citations: 50 },
            { id: 'Autonomous_Driving', name: 'Autonomous\nDriving', area: 'Applications', year: 2022, impact: 10, citations: 32 },
            { id: 'Shape_Tracking', name: 'Shape\nTracking', area: 'Computer Vision', year: 2020, impact: 5, citations: 15 }
        ];

        const links = [
            { source: 'GAGAT', target: 'Graph_Attention', strength: 0.9, type: 'methodology' },
            { source: 'GAGAT', target: 'Point_Clouds', strength: 0.8, type: 'application' },
            { source: 'LiDAR_GNN', target: 'Autonomous_Driving', strength: 0.9, type: 'application' },
            { source: 'LiDAR_GNN', target: 'Graph_Attention', strength: 0.7, type: 'methodology' },
            { source: 'Dynamic_Weights', target: 'Graph_Attention', strength: 0.8, type: 'optimization' },
            { source: 'Video_Analysis', target: 'Shape_Tracking', strength: 0.9, type: 'technique' },
            { source: 'Point_Clouds', target: '3D Vision', strength: 1.0, type: 'domain' },
            { source: 'Graph_Attention', target: 'ML', strength: 1.0, type: 'foundation' }
        ];

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).strength(0.1))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(40));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#00ff41')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => d.strength * 3);

        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        node.append('circle')
            .attr('r', d => 15 + (d.citations / 10))
            .attr('fill', d => this.getAreaColor(d.area))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

        node.append('text')
            .attr('dy', -25)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '10px')
            .text(d => d.name);

        node.append('text')
            .attr('dy', 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#0ff0ff')
            .attr('font-size', '8px')
            .text(d => `Citations: ${d.citations}`);

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // Add interactivity
        node.on('mouseover', function(event, d) {
            d3.select(this).select('circle').attr('r', 25).attr('opacity', 1);
            d3.select(this).select('text').attr('font-size', '12px');
        })
        .on('mouseout', function(event, d) {
            d3.select(this).select('circle').attr('r', 15 + (d.citations / 10)).attr('opacity', 0.8);
            d3.select(this).select('text').attr('font-size', '10px');
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
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

        // Simulate point cloud data
        const points = [];
        for (let i = 0; i < 1000; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 100,
                intensity: Math.random(),
                cluster: Math.floor(Math.random() * 5)
            });
        }

        const g = svg.append('g');
        
        // Create clusters
        const clusters = d3.groups(points, d => d.cluster);
        
        clusters.forEach((cluster, index) => {
            const color = d3.interpolateViridis(index / clusters.length);
            
            g.selectAll(`.cluster-${index}`)
                .data(cluster[1])
                .enter().append('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', d => 1 + (d.intensity * 3))
                .attr('fill', color)
                .attr('opacity', 0.6)
                .attr('class', `cluster-${index}`);
        });

        // Add clustering animation
        setInterval(() => {
            points.forEach(d => {
                d.x += (Math.random() - 0.5) * 2;
                d.y += (Math.random() - 0.5) * 2;
                
                if (d.x < 0) d.x = 0;
                if (d.x > width) d.x = width;
                if (d.y < 0) d.y = 0;
                if (d.y > height) d.y = height;
            });

            g.selectAll('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }, 100);
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

        // GNN layers visualization
        const layers = [
            { name: 'Input Layer\n(Point Cloud)', nodes: 50, color: '#00ff41' },
            { name: 'Graph\nConstruction', nodes: 40, color: '#0ff0ff' },
            { name: 'Attention\nMechanism', nodes: 30, color: '#ff0055' },
            { name: 'Feature\nExtraction', nodes: 25, color: '#22d3ee' },
            { name: 'Classification\nHead', nodes: 10, color: '#7c3aed' }
        ];

        const layerWidth = width / layers.length;
        
        layers.forEach((layer, index) => {
            const x = index * layerWidth + layerWidth / 2;
            const y = height / 2;

            // Draw layer nodes
            for (let i = 0; i < layer.nodes; i++) {
                const angle = (i / layer.nodes) * Math.PI * 2;
                const radius = 80 + (index * 20);
                const nodeX = x + Math.cos(angle) * radius;
                const nodeY = y + Math.sin(angle) * radius;

                svg.append('circle')
                    .attr('cx', nodeX)
                    .attr('cy', nodeY)
                    .attr('r', 3)
                    .attr('fill', layer.color)
                    .attr('opacity', 0.7);

                // Connect to next layer
                if (index < layers.length - 1) {
                    const nextLayer = layers[index + 1];
                    const nextX = (index + 1) * layerWidth + layerWidth / 2;
                    const nextY = height / 2;
                    const nextAngle = (i / nextLayer.nodes) * Math.PI * 2;
                    const nextRadius = 80 + ((index + 1) * 20);
                    const nextNodeX = nextX + Math.cos(nextAngle) * nextRadius;
                    const nextNodeY = nextY + Math.sin(nextAngle) * nextRadius;

                    svg.append('line')
                        .attr('x1', nodeX)
                        .attr('y1', nodeY)
                        .attr('x2', nextNodeX)
                        .attr('y2', nextNodeY)
                        .attr('stroke', layer.color)
                        .attr('stroke-opacity', 0.1)
                        .attr('stroke-width', 1);
                }
            }

            // Layer label
            svg.append('text')
                .attr('x', x)
                .attr('y', height - 20)
                .attr('text-anchor', 'middle')
                .attr('fill', layer.color)
                .attr('font-size', '12px')
                .text(layer.name);
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

        // Create LiDAR scan visualization
        const scanLines = [];
        for (let angle = 0; angle < 360; angle += 5) {
            scanLines.push({
                angle: angle,
                distance: Math.random() * 200 + 50,
                intensity: Math.random()
            });
        }

        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        // Draw scan lines
        g.selectAll('line')
            .data(scanLines)
            .enter().append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', d => Math.cos(d.angle * Math.PI / 180) * d.distance)
            .attr('y2', d => Math.sin(d.angle * Math.PI / 180) * d.distance)
            .attr('stroke', d => d3.interpolateViridis(d.intensity))
            .attr('stroke-width', 1)
            .attr('opacity', 0.6);

        // Add detected objects
        const objects = [
            { x: 100, y: 50, width: 30, height: 20, label: 'Car', confidence: 0.95 },
            { x: -80, y: -30, width: 20, height: 15, label: 'Pedestrian', confidence: 0.88 },
            { x: 150, y: -80, width: 40, height: 25, label: 'Truck', confidence: 0.92 }
        ];

        objects.forEach(obj => {
            // Draw bounding box
            g.append('rect')
                .attr('x', obj.x)
                .attr('y', obj.y)
                .attr('width', obj.width)
                .attr('height', obj.height)
                .attr('fill', 'none')
                .attr('stroke', '#ff0055')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0.8);

            // Draw confidence indicator
            g.append('circle')
                .attr('cx', obj.x + obj.width/2)
                .attr('cy', obj.y - 10)
                .attr('r', obj.confidence * 10)
                .attr('fill', '#00ff41')
                .attr('opacity', 0.7);

            // Label
            g.append('text')
                .attr('x', obj.x + obj.width/2)
                .attr('y', obj.y - 20)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '10px')
                .text(`${obj.label} (${Math.round(obj.confidence * 100)}%)`);
        });

        // Animation for scanning effect
        let scanAngle = 0;
        setInterval(() => {
            scanAngle += 2;
            if (scanAngle > 360) scanAngle = 0;

            g.selectAll('line')
                .attr('opacity', d => {
                    const diff = Math.abs(d.angle - scanAngle);
                    return diff < 10 ? 1 : 0.1;
                })
                .attr('stroke-width', d => {
                    const diff = Math.abs(d.angle - scanAngle);
                    return diff < 10 ? 3 : 1;
                });
        }, 50);
    }

    getAreaColor(area) {
        const colors = {
            'GNN': '#00ff41',
            '3D Vision': '#0ff0ff',
            'Optimization': '#ff0055',
            'Computer Vision': '#22d3ee',
            '3D Processing': '#7c3aed',
            'ML': '#f59e0b',
            'Applications': '#10b981'
        };
        return colors[area] || '#888888';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load D3.js
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = () => {
        new ResearchVisualizations();
    };
    document.head.appendChild(script);
});