/**
 * Mass Effect-Inspired Portfolio
 * Starfield animation, navigation, and interactions
 */

// ============================================
// Configuration
// ============================================

const CONFIG = {
    audioEnabled: false,
    audioVolume: 0.2
};

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
    // Initialize Morphing Particle System
    const canvas = document.getElementById('starfield');
    if (canvas && typeof MorphingParticleEngine !== 'undefined') {
        window.particleEngine = new MorphingParticleEngine(canvas);
        window.particleEngine.init();
    }

    // Initialize navigation
    const nav = new Navigation();

    // Initialize reveal animations
    const reveals = new RevealAnimations();

    // Initialize audio (optional)
    const audioToggle = document.getElementById('audioToggle');
    if (audioToggle) {
        const audioManager = new AudioManager(audioToggle);
        audioManager.playTransitionSound = audioManager.playTransitionSound.bind(audioManager);
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
    // Particle system will handle reduced motion
}
