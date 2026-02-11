document.addEventListener('DOMContentLoaded', () => {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');

    if (navMenu && hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            const expanded = hamburger.classList.contains('active');
            hamburger.setAttribute('aria-expanded', String(expanded));
        });

        navMenu.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            const navOffset = 82;
            const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    const revealElements = Array.from(document.querySelectorAll('.reveal'));
    revealElements.forEach((el) => {
        const delay = Number(el.dataset.delay || 0);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    if ('IntersectionObserver' in window && revealElements.length) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14
        });

        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add('is-visible'));
    }

    const sectionLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const sections = Array.from(document.querySelectorAll('section[id]'));

    if (sectionLinks.length && sections.length) {
        const updateActiveSection = () => {
            const marker = window.scrollY + 120;
            let activeId = sections[0].id;

            for (const section of sections) {
                if (section.offsetTop <= marker) {
                    activeId = section.id;
                }
            }

            sectionLinks.forEach((link) => {
                const target = link.getAttribute('href');
                link.classList.toggle('active', target === `#${activeId}`);
            });
        };

        window.addEventListener('scroll', updateActiveSection, { passive: true });
        updateActiveSection();
    }

    const counters = Array.from(document.querySelectorAll('[data-counter]'));
    if (counters.length && 'IntersectionObserver' in window) {
        const animateCounter = (el) => {
            const target = Number(el.dataset.counter || 0);
            const suffix = el.dataset.suffix || '';
            const duration = 1100;
            const startTime = performance.now();

            const tick = (time) => {
                const progress = Math.min((time - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = `${Math.round(target * eased)}${suffix}`;
                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach((counter) => {
            counter.textContent = `${counter.dataset.counter || '0'}${counter.dataset.suffix || ''}`;
        });
    }

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
});
