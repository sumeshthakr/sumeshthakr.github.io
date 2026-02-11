/**
 * Mass Effect-Inspired Portfolio
 * Starfield animation, navigation, and interactions
 */

// ============================================
// Configuration
// ============================================

const CONFIG = {
    starCount: 300,
    starSpeed: 0.05,
    warpSpeed: 2,
    warpDuration: 800,
    audioEnabled: false,
    audioVolume: 0.2
};

// ============================================
// Starfield Animation
// ============================================

class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.isWarping = false;
        this.resize();
        this.initStars();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < CONFIG.starCount; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        return {
            x: Math.random() * this.canvas.width - this.centerX,
            y: Math.random() * this.canvas.height - this.centerY,
            z: Math.random() * 1000,
            size: Math.random() * 1.5 + 0.5
        };
    }

    update(speed = CONFIG.starSpeed) {
        this.stars.forEach(star => {
            star.z -= speed * 10;

            if (star.z <= 0) {
                Object.assign(star, this.createStar());
                star.z = 1000;
            }
        });
    }

    draw() {
        this.ctx.fillStyle = '#0a0e1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw subtle nebula effect
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, 'rgba(10, 14, 26, 0)');
        gradient.addColorStop(0.5, 'rgba(15, 20, 31, 0.3)');
        gradient.addColorStop(1, 'rgba(10, 14, 26, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars
        this.stars.forEach(star => {
            const scale = 1000 / star.z;
            const x = star.x * scale + this.centerX;
            const y = star.y * scale + this.centerY;
            const size = star.size * scale;
            const opacity = Math.min(1, (1000 - star.z) / 500);

            if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
                return;
            }

            this.ctx.beginPath();

            if (this.isWarping) {
                // Draw star streak during warp
                const prevScale = 1000 / (star.z + 50);
                const prevX = star.x * prevScale + this.centerX;
                const prevY = star.y * prevScale + this.centerY;

                this.ctx.strokeStyle = `rgba(234, 244, 255, ${opacity * 0.8})`;
                this.ctx.lineWidth = size * 0.5;
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            } else {
                // Draw normal star
                this.ctx.fillStyle = `rgba(234, 244, 255, ${opacity})`;
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    animate() {
        this.update(this.isWarping ? CONFIG.warpSpeed : CONFIG.starSpeed);
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    warp() {
        if (this.isWarping) return;
        this.isWarping = true;
        setTimeout(() => {
            this.isWarping = false;
        }, CONFIG.warpDuration);
    }
}

// ============================================
// Navigation & Scroll
// ============================================

class Navigation {
    constructor() {
        this.clusters = document.querySelectorAll('.nav-cluster');
        this.sections = document.querySelectorAll('.section[data-cluster]');
        this.transition = document.querySelector('.cluster-transition');
        this.currentCluster = 'Command';
        this.lastScrollTop = 0;
        this.scrollTimeout = null;
        this.init();
    }

    init() {
        // Smooth scroll to sections
        this.clusters.forEach(cluster => {
            cluster.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = cluster.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Scroll-based navigation update
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Clear previous timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        // Debounce scroll detection
        this.scrollTimeout = setTimeout(() => {
            this.updateActiveSection(scrollTop);
            this.detectScrollDirection(scrollTop);
        }, 50);

        this.lastScrollTop = scrollTop;
    }

    detectScrollDirection(scrollTop) {
        const direction = scrollTop > this.lastScrollTop ? 'down' : 'up';
        // Could be used for directional effects
    }

    updateActiveSection(scrollTop) {
        let activeSection = null;
        let minDistance = Infinity;

        this.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const distance = Math.abs(scrollTop - sectionTop);

            if (distance < minDistance) {
                minDistance = distance;
                activeSection = section;
            }
        });

        if (activeSection) {
            const clusterName = activeSection.getAttribute('data-cluster');
            if (clusterName && clusterName !== this.currentCluster) {
                this.showTransition(this.currentCluster, clusterName);
                this.currentCluster = clusterName;
            }

            this.updateNavClusters(clusterName);
        }
    }

    updateNavClusters(activeCluster) {
        this.clusters.forEach(cluster => {
            const clusterName = cluster.getAttribute('data-cluster');
            if (clusterName === activeCluster) {
                cluster.classList.add('active');
            } else {
                cluster.classList.remove('active');
            }
        });
    }

    showTransition(from, to) {
        if (!this.transition) return;

        const fromEl = this.transition.querySelector('.transition-from');
        const toEl = this.transition.querySelector('.transition-to');

        fromEl.textContent = `${from.toUpperCase()} CLUSTER`;
        toEl.textContent = `${to.toUpperCase()} CLUSTER`;

        this.transition.classList.add('visible');

        setTimeout(() => {
            this.transition.classList.remove('visible');
        }, 1500);
    }
}

// ============================================
// Reveal Animations
// ============================================

class RevealAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.reveal');
        this.init();
    }

    init() {
        // Set reveal delays
        this.elements.forEach(el => {
            const delay = Number(el.dataset.delay || 0);
            el.style.setProperty('--reveal-delay', `${delay}ms`);
        });

        // Observe scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ============================================
// Audio Manager (Optional ME2 Theme)
// ============================================

class AudioManager {
    constructor(toggleButton) {
        this.toggle = toggleButton;
        this.enabled = false;
        this.audio = null;
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', () => this.toggleAudio());

        // Check for user preference
        const saved = localStorage.getItem('audioEnabled');
        if (saved === 'true') {
            this.enable();
        }
    }

    toggleAudio() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    enable() {
        this.enabled = true;
        this.toggle.setAttribute('aria-pressed', 'true');
        this.toggle.querySelector('.audio-on').style.display = 'block';
        this.toggle.querySelector('.audio-off').style.display = 'none';
        localStorage.setItem('audioEnabled', 'true');
    }

    disable() {
        this.enabled = false;
        this.toggle.setAttribute('aria-pressed', 'false');
        this.toggle.querySelector('.audio-on').style.display = 'none';
        this.toggle.querySelector('.audio-off').style.display = 'block';
        localStorage.setItem('audioEnabled', 'false');
    }

    playTransitionSound() {
        if (!this.enabled) return;

        // Create a simple transition sound using Web Audio API
        // This is a placeholder - for ME2 theme, you'd use an actual audio file
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

        gainNode.gain.setValueAtTime(CONFIG.audioVolume * 0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
    }
}

// ============================================
// Initialize Everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize starfield
    const starfieldCanvas = document.getElementById('starfield');
    const starfield = new Starfield(starfieldCanvas);

    // Initialize navigation
    const nav = new Navigation();

    // Initialize reveal animations
    const reveals = new RevealAnimations();

    // Initialize audio (optional)
    const audioToggle = document.getElementById('audioToggle');
    if (audioToggle) {
        const audioManager = new AudioManager(audioToggle);

        // Warp effect on section transitions
        const sections = document.querySelectorAll('.section[data-cluster]');
        let currentSectionIndex = -1;

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const newIndex = Array.from(sections).indexOf(entry.target);
                    if (newIndex !== currentSectionIndex && currentSectionIndex !== -1) {
                        starfield.warp();
                        audioManager.playTransitionSound();
                    }
                    currentSectionIndex = newIndex;
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Update copyright year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Preload critical fonts
    if (document.fonts) {
        document.fonts.load('16px Manrope');
        document.fonts.load('700 48px "Exo 2"');
        document.fonts.load('400 14px "JetBrains Mono"');
    }
});

// ============================================
// Performance: Reduce motion for low-end devices
// ============================================

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    CONFIG.starSpeed = 0.02;
    CONFIG.warpDuration = 400;
}

// Detect low-end devices and reduce star count
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    CONFIG.starCount = 150;
}
