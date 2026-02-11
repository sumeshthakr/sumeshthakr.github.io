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
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach((el) => {
        const delay = Number(el.dataset.delay || 0);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    if ('IntersectionObserver' in window && revealEls.length) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));

    if (sections.length && navLinks.length) {
        const updateActiveNav = () => {
            const y = window.scrollY + 110;
            let active = sections[0].id;

            for (const section of sections) {
                if (section.offsetTop <= y) {
                    active = section.id;
                }
            }

            navLinks.forEach((link) => {
                const isActive = link.getAttribute('href') === `#${active}`;
                link.classList.toggle('active', isActive);
            });
        };

        window.addEventListener('scroll', updateActiveNav, { passive: true });
        updateActiveNav();
    }

    const counters = Array.from(document.querySelectorAll('[data-counter]'));
    if (counters.length && 'IntersectionObserver' in window) {
        const animateCount = (el) => {
            const target = Number(el.dataset.counter || 0);
            const suffix = el.dataset.suffix || '';
            const durationMs = 1200;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / durationMs, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = `${Math.round(target * eased)}${suffix}`;
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };

            requestAnimationFrame(step);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach((counter) => {
            counter.textContent = `${counter.dataset.counter || '0'}${counter.dataset.suffix || ''}`;
        });
    }

    const year = document.getElementById('year');
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }
});
