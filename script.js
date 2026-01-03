// Graph-based Portfolio Visualization
class GraphPortfolio {
    constructor() {
        this.initNavigation();
        this.initScrollAnimations();
        this.initContactForm();
        this.initThreeJS();
        this.initMiniGraphs();
    }

    // Navigation and Scroll Handling
    initNavigation() {
        const navbar = document.querySelector('.navbar');
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        // Mobile menu toggle
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Scroll effect on navbar
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            } else {
                navbar.style.background = 'rgba(15, 23, 42, 0.8)';
            }
        });
    }

    // Scroll animations for sections
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.research-card, .project-card, .skill-category, .timeline-item').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    // Contact form handling
    initContactForm() {
        const form = document.getElementById('contactForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Create a graph node for the contact
            this.createContactNode({ name, email, message });
            
            // Show success message
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
                form.reset();
            }, 2000);
        });
    }

    // Three.js 3D Graph Visualization
    initThreeJS() {
        const canvas = document.getElementById('graph-canvas');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505); // Cyberpunk black
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Cyberpunk Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);
        
        const hackerLight = new THREE.PointLight(0x00ff41, 2, 100); // Hacker green
        hackerLight.position.set(10, 10, 10);
        scene.add(hackerLight);
        
        const cyberLight = new THREE.PointLight(0x0ff0ff, 1.5, 100); // Cyber cyan
        cyberLight.position.set(-10, -10, -10);
        scene.add(cyberLight);
        
        const glitchLight = new THREE.PointLight(0xff0055, 1, 50); // Cyber pink
        glitchLight.position.set(0, 0, 10);
        scene.add(glitchLight);

        // Graph data structure
        const nodes = [];
        const links = [];
        const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        
        // Create nodes (representing skills and technologies)
        const skills = [
            { name: 'GNN', pos: new THREE.Vector3(0, 2, 0) },
            { name: 'ML', pos: new THREE.Vector3(2, 1, 0) },
            { name: 'CV', pos: new THREE.Vector3(-2, 1, 0) },
            { name: 'Python', pos: new THREE.Vector3(1, -1, 0) },
            { name: 'C++', pos: new THREE.Vector3(-1, -1, 0) },
            { name: '3D', pos: new THREE.Vector3(0, 0, 2) },
            { name: 'ROS', pos: new THREE.Vector3(0, 0, -2) }
        ];

        skills.forEach(skill => {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.copy(skill.pos);
            node.userData = { name: skill.name };
            scene.add(node);
            nodes.push(node);
        });

        // Create links between related skills
        const linkGeometry = new THREE.BufferGeometry();
        const linkMaterial = new THREE.LineBasicMaterial({ 
            color: 0x94a3b8, 
            transparent: true, 
            opacity: 0.3 
        });
        
        // Define connections
        const connections = [
            [0, 1], [0, 2], [0, 5], [0, 6], // GNN connections
            [1, 3], [1, 4], [2, 3], [2, 4], // ML/CV connections
            [3, 5], [4, 5], [5, 6] // 3D/ROS connections
        ];

        connections.forEach(conn => {
            const start = nodes[conn[0]].position;
            const end = nodes[conn[1]].position;
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, linkMaterial);
            scene.add(line);
            links.push(line);
        });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate nodes
            nodes.forEach((node, index) => {
                node.rotation.x += 0.01;
                node.rotation.y += 0.01;
                
                // Pulse effect
                const scale = 1 + Math.sin(Date.now() * 0.005 + index) * 0.1;
                node.scale.set(scale, scale, scale);
            });

            // Rotate entire graph
            scene.rotation.y += 0.002;
            scene.rotation.x += 0.001;

            renderer.render(scene, camera);
        };

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        animate();
    }

    // Mini graph visualizations for projects
    initMiniGraphs() {
        // Mesh Visualization
        this.createMiniGraph('mesh-visualization', {
            nodes: 8,
            connections: 12,
            color: '#00f0ff'
        });

        // Currency Detection
        this.createMiniGraph('currency-detection', {
            nodes: 6,
            connections: 8,
            color: '#7c3aed'
        });

        // Video Captioning
        this.createMiniGraph('video-captioning', {
            nodes: 10,
            connections: 15,
            color: '#22d3ee'
        });
    }

    createMiniGraph(containerId, config) {
        const container = document.getElementById(containerId);
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const nodes = [];
        const links = [];

        // Create nodes
        for (let i = 0; i < config.nodes; i++) {
            nodes.push({
                id: i,
                x: Math.random() * width,
                y: Math.random() * height
            });
        }

        // Create links
        for (let i = 0; i < config.connections; i++) {
            const source = Math.floor(Math.random() * config.nodes);
            const target = Math.floor(Math.random() * config.nodes);
            if (source !== target) {
                links.push({ source, target });
            }
        }

        // Create links
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', config.color)
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1);

        // Create nodes
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 4)
            .attr('fill', config.color)
            .attr('opacity', 0.8);

        // Animation
        setInterval(() => {
            nodes.forEach(d => {
                d.x += (Math.random() - 0.5) * 2;
                d.y += (Math.random() - 0.5) * 2;
                
                // Keep nodes within bounds
                if (d.x < 0) d.x = 0;
                if (d.x > width) d.x = width;
                if (d.y < 0) d.y = 0;
                if (d.y > height) d.y = height;
            });

            link.attr('x1', d => nodes[d.source].x)
                .attr('y1', d => nodes[d.source].y)
                .attr('x2', d => nodes[d.target].x)
                .attr('y2', d => nodes[d.target].y);

            node.attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }, 100);
    }

    // Create contact node visualization
    createContactNode(data) {
        const container = document.querySelector('.hero-visual');
        const canvas = document.getElementById('graph-canvas');
        
        // Create a new node in the 3D scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const node = new THREE.Mesh(geometry, material);
        
        node.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        );
        
        scene.add(node);
        
        // Animate the new node
        const animate = () => {
            requestAnimationFrame(animate);
            node.rotation.x += 0.02;
            node.rotation.y += 0.02;
            renderer.render(scene, camera);
        };
        
        animate();
    }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load D3.js for mini graphs and research visualizations
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = () => {
        new GraphPortfolio();
        
        // Initialize research visualizations
        const researchScript = document.createElement('script');
        researchScript.src = 'research-visualizations.js';
        document.head.appendChild(researchScript);
    };
    document.head.appendChild(script);
});