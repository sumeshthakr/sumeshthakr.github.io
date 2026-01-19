// Simple Portfolio JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
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
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            } else {
                navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }
        });
    }

    // Fade in animation on scroll (progressive enhancement)
    if ('IntersectionObserver' in window) {
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

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.impact-card, .timeline-item, .project-card, .publication-item, .skill-category, .pipeline-stage'
        );

        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    // ========================================
    // Reactive Point Cloud Background
    // ========================================
    const canvas = document.getElementById('pointcloud-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let scrollY = 0;
        let animationId;

        // Resize canvas to fill window
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        // Initialize particles
        function initParticles() {
            particles = [];
            const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
            
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: Math.random() * 100,
                    baseX: Math.random() * canvas.width,
                    baseY: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 2 + 1,
                    color: `hsla(${220 + Math.random() * 40}, 70%, 60%, ${0.3 + Math.random() * 0.4})`
                });
            }
        }

        // Draw particles and connections
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const scrollFactor = scrollY * 0.0005;
            const maxDist = 120;

            particles.forEach((p, i) => {
                // Update position based on scroll
                p.x = p.baseX + Math.sin(scrollFactor + p.z * 0.1) * 30;
                p.y = p.baseY + Math.cos(scrollFactor + p.z * 0.1) * 20 - scrollY * 0.05;

                // Wrap around
                if (p.y < -50) p.baseY = canvas.height + 50;
                if (p.y > canvas.height + 50) p.baseY = -50;

                // Draw particle
                const depth = (100 - p.z) / 100;
                const size = p.size * (0.5 + depth * 0.5);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw connections to nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        const opacity = (1 - dist / maxDist) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(draw);
        }

        // Track scroll position
        window.addEventListener('scroll', () => {
            scrollY = window.pageYOffset;
        });

        // Handle resize
        window.addEventListener('resize', resizeCanvas);

        // Initialize
        resizeCanvas();
        draw();
    }

    // ========================================
    // Scroll-Reactive Hero Graph
    // ========================================
    const heroGraph = document.getElementById('hero-graph');
    if (heroGraph) {
        const edges = heroGraph.querySelectorAll('.graph-edge');
        const nodes = heroGraph.querySelectorAll('.graph-node');
        
        function updateGraphOnScroll() {
            const scrollProgress = Math.min(window.pageYOffset / 500, 1);
            
            // Activate edges progressively
            edges.forEach((edge, i) => {
                const threshold = i / edges.length;
                if (scrollProgress > threshold) {
                    edge.classList.add('active');
                } else {
                    edge.classList.remove('active');
                }
            });

            // Scale nodes based on scroll
            nodes.forEach((node, i) => {
                const baseR = parseFloat(node.getAttribute('r')) || 10;
                const scale = 1 + scrollProgress * 0.3 * Math.sin(i * 0.5);
                node.style.transform = `scale(${scale})`;
                node.style.transformOrigin = 'center';
            });
        }

        window.addEventListener('scroll', updateGraphOnScroll);
        updateGraphOnScroll();
    }

    // ========================================
    // Pipeline Stage Interactions
    // ========================================
    const pipelineStages = document.querySelectorAll('.pipeline-stage');
    pipelineStages.forEach(stage => {
        stage.addEventListener('mouseenter', () => {
            // Remove active from all stages
            pipelineStages.forEach(s => s.classList.remove('active'));
            // Add active to current stage
            stage.classList.add('active');
        });
    });

    // Pipeline scroll animation
    const pipelineSection = document.querySelector('.pipeline-section');
    if (pipelineSection && 'IntersectionObserver' in window) {
        const pipelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate stages sequentially
                    pipelineStages.forEach((stage, i) => {
                        setTimeout(() => {
                            stage.classList.add('visible');
                            if (i === 2) { // Middle stage (attention)
                                stage.classList.add('active');
                            }
                        }, i * 150);
                    });
                }
            });
        }, { threshold: 0.2 });

        pipelineObserver.observe(pipelineSection);
    }
});
