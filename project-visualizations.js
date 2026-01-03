// Project-Based Interactive Visualizations
// Based on Sumesh Thakur's GitHub projects and actual work

class ProjectVisualizations {
    constructor() {
        this.initProjectGraphs();
        this.initMeshPipelineVisualization();
        this.initCurrencyDetectionVisualization();
        this.initVideoCaptioningVisualization();
    }

    // 1. Project Network Visualization
    initProjectGraphs() {
        const container = document.getElementById('mesh-visualization');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Project data based on actual work
        const nodes = [
            { id: 'mesh-pipeline', name: '3D Mesh\nPipeline', type: 'Backend', tech: 'Python, MongoDB', connections: 8 },
            { id: 'mongo-db', name: 'MongoDB\nDatabase', type: 'Database', tech: 'NoSQL', connections: 6 },
            { id: 'etl-process', name: 'ETL\nProcessing', type: 'Data', tech: 'Python', connections: 5 },
            { id: '3d-visual', name: '3D\nVisualization', type: 'Frontend', tech: 'Three.js', connections: 4 },
            { id: 'texture-map', name: 'Texture\nMapping', type: 'Graphics', tech: 'OpenGL', connections: 3 }
        ];

        const links = [
            { source: 'mesh-pipeline', target: 'mongo-db', weight: 0.9 },
            { source: 'mesh-pipeline', target: 'etl-process', weight: 0.8 },
            { source: 'mesh-pipeline', target: '3d-visual', weight: 0.7 },
            { source: 'etl-process', target: 'mongo-db', weight: 0.6 },
            { source: '3d-visual', target: 'texture-map', weight: 0.8 },
            { source: 'etl-process', target: 'texture-map', weight: 0.5 }
        ];

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).strength(0.2))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#ff0055') // Cyber pink
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => d.weight * 4);

        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        node.append('circle')
            .attr('r', d => 12 + (d.connections / 2))
            .attr('fill', '#ff0055') // Cyber pink
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

        node.append('text')
            .attr('dy', -15)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '10px')
            .text(d => d.name);

        node.append('text')
            .attr('dy', 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#0ff0ff')
            .attr('font-size', '8px')
            .text(d => d.tech);

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
            d3.select(this).select('circle').attr('r', 20).attr('opacity', 1);
            d3.select(this).select('text').attr('font-size', '12px');
        })
        .on('mouseout', function(event, d) {
            d3.select(this).select('circle').attr('r', 12 + (d.connections / 2)).attr('opacity', 0.8);
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

    // 2. Currency Detection Visualization
    initCurrencyDetectionVisualization() {
        const container = document.getElementById('currency-detection');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create currency detection simulation
        const currencies = [
            { value: '20', color: '#FFD700', x: 100, y: 150 },
            { value: '50', color: '#FF6B6B', x: 200, y: 120 },
            { value: '100', color: '#4ECDC4', x: 300, y: 180 },
            { value: '500', color: '#45B7D1', x: 150, y: 220 },
            { value: '2000', color: '#96CEB4', x: 250, y: 200 }
        ];

        // Draw currency notes
        const notes = svg.selectAll('.currency-note')
            .data(currencies)
            .enter().append('g')
            .attr('class', 'currency-note');

        notes.append('rect')
            .attr('width', 60)
            .attr('height', 35)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('transform', d => `translate(${d.x - 30}, ${d.y - 17.5})`);

        notes.append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', '#000')
            .attr('font-weight', 'bold')
            .attr('font-size', '14px')
            .text(d => `₹${d.value}`);

        // Draw detection bounding boxes
        const boxes = svg.selectAll('.detection-box')
            .data(currencies)
            .enter().append('rect')
            .attr('class', 'detection-box')
            .attr('width', 70)
            .attr('height', 45)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', 'none')
            .attr('stroke', '#ff0055')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.7)
            .attr('transform', d => `translate(${d.x - 35}, ${d.y - 22.5})`);

        // Add detection confidence indicators
        const confidences = svg.selectAll('.confidence')
            .data(currencies)
            .enter().append('circle')
            .attr('class', 'confidence')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y - 30)
            .attr('r', 8)
            .attr('fill', '#00ff41')
            .attr('opacity', 0.8);

        // Confidence text
        const confidenceText = svg.selectAll('.confidence-text')
            .data(currencies)
            .enter().append('text')
            .attr('class', 'confidence-text')
            .attr('x', d => d.x)
            .attr('y', d => d.y - 40)
            .attr('text-anchor', 'middle')
            .attr('fill', '#00ff41')
            .attr('font-size', '10px')
            .text('95%');

        // Animation for scanning effect
        setInterval(() => {
            currencies.forEach((currency, index) => {
                // Pulse effect
                d3.select(confidenceText.nodes()[index])
                    .transition()
                    .duration(1000)
                    .attr('fill', Math.random() > 0.5 ? '#00ff41' : '#ff0055')
                    .text(`${Math.floor(90 + Math.random() * 10)}%`);
            });
        }, 2000);
    }

    // 3. Video Captioning Visualization
    initVideoCaptioningVisualization() {
        const container = document.getElementById('video-captioning');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // CNN-LSTM architecture visualization
        const layers = [
            { name: 'Input\nVideo', type: 'CNN', nodes: 20, color: '#ff0055', x: 50 },
            { name: 'Feature\nExtraction', type: 'CNN', nodes: 15, color: '#0ff0ff', x: 150 },
            { name: 'Temporal\nFeatures', type: 'LSTM', nodes: 12, color: '#00ff41', x: 250 },
            { name: 'Sequence\nGeneration', type: 'LSTM', nodes: 10, color: '#7c3aed', x: 350 },
            { name: 'Caption\nOutput', type: 'Output', nodes: 8, color: '#f59e0b', x: 450 }
        ];

        // Draw layers
        layers.forEach((layer, index) => {
            // Draw nodes
            for (let i = 0; i < layer.nodes; i++) {
                const y = 50 + (i * 15);
                
                svg.append('circle')
                    .attr('cx', layer.x)
                    .attr('cy', y)
                    .attr('r', 4)
                    .attr('fill', layer.color)
                    .attr('opacity', 0.8);

                // Connect to next layer
                if (index < layers.length - 1) {
                    const nextLayer = layers[index + 1];
                    const nextY = 50 + (i * 15);
                    
                    svg.append('line')
                        .attr('x1', layer.x)
                        .attr('y1', y)
                        .attr('x2', nextLayer.x)
                        .attr('y2', nextY)
                        .attr('stroke', layer.color)
                        .attr('stroke-opacity', 0.3)
                        .attr('stroke-width', 1);
                }
            }

            // Layer labels
            svg.append('text')
                .attr('x', layer.x)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('fill', layer.color)
                .attr('font-size', '10px')
                .text(layer.name);

            // Layer type
            svg.append('text')
                .attr('x', layer.x)
                .attr('y', 230)
                .attr('text-anchor', 'middle')
                .attr('fill', '#888888')
                .attr('font-size', '8px')
                .text(layer.type);
        });

        // Add caption generation animation
        const captions = [
            "A person is walking in the park",
            "A car is driving on the road",
            "A dog is playing with a ball",
            "People are talking in a cafe"
        ];

        let captionIndex = 0;
        
        const captionText = svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#00ff41')
            .attr('font-size', '12px')
            .text('Generating caption...');

        setInterval(() => {
            captionText
                .transition()
                .duration(1000)
                .text(captions[captionIndex % captions.length]);
            captionIndex++;
        }, 3000);

        // Add processing indicators
        const processors = svg.selectAll('.processor')
            .data(layers)
            .enter().append('rect')
            .attr('class', 'processor')
            .attr('width', 20)
            .attr('height', 20)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', d => d.color)
            .attr('opacity', 0.5)
            .attr('x', d => d.x - 10)
            .attr('y', 180);

        // Animation for data flow
        setInterval(() => {
            processors
                .transition()
                .duration(500)
                .attr('opacity', 0.2)
                .transition()
                .duration(500)
                .attr('opacity', 0.8);
        }, 1000);
    }

    // 4. Enhanced 3D Mesh Pipeline Visualization
    initMeshPipelineVisualization() {
        const container = document.getElementById('mesh-visualization');
        if (!container) return;

        // Add 3D mesh visualization elements
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create 3D mesh wireframe
        const meshPoints = [];
        for (let i = 0; i < 50; i++) {
            meshPoints.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 100
            });
        }

        // Draw mesh connections
        const connections = [];
        for (let i = 0; i < meshPoints.length; i++) {
            for (let j = i + 1; j < meshPoints.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(meshPoints[i].x - meshPoints[j].x, 2) +
                    Math.pow(meshPoints[i].y - meshPoints[j].y, 2)
                );
                if (distance < 40) {
                    connections.push({
                        source: i,
                        target: j,
                        distance: distance
                    });
                }
            }
        }

        // Draw mesh edges
        svg.selectAll('line')
            .data(connections)
            .enter().append('line')
            .attr('x1', d => meshPoints[d.source].x)
            .attr('y1', d => meshPoints[d.source].y)
            .attr('x2', d => meshPoints[d.target].x)
            .attr('y2', d => meshPoints[d.target].y)
            .attr('stroke', '#ff0055') // Cyber pink
            .attr('stroke-opacity', d => 0.1 + (d.distance / 400))
            .attr('stroke-width', 1);

        // Draw mesh vertices
        svg.selectAll('circle')
            .data(meshPoints)
            .enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 2)
            .attr('fill', '#00ff41')
            .attr('opacity', 0.8);

        // Animation for mesh processing
        setInterval(() => {
            meshPoints.forEach(d => {
                d.x += (Math.random() - 0.5) * 2;
                d.y += (Math.random() - 0.5) * 2;
                
                if (d.x < 0) d.x = 0;
                if (d.x > width) d.x = width;
                if (d.y < 0) d.y = 0;
                if (d.y > height) d.y = height;
            });

            svg.selectAll('line')
                .attr('x1', d => meshPoints[d.source].x)
                .attr('y1', d => meshPoints[d.source].y)
                .attr('x2', d => meshPoints[d.target].x)
                .attr('y2', d => meshPoints[d.target].y);

            svg.selectAll('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }, 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load D3.js
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = () => {
        new ProjectVisualizations();
    };
    document.head.appendChild(script);
});