// Fun Section Visualizations
class FunVisualizations {
    constructor() {
        this.animations = [];
        this.initGraphQuest();
        this.initRayTracer();
        this.initPingPong();
        this.initSignalSprint();
        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    handleResize() {
        this.animations.forEach(animation => animation.resize());
    }

    setupCanvas(id) {
        const canvas = document.getElementById(id);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const resize = () => {
            const { clientWidth, clientHeight } = canvas;
            const ratio = window.devicePixelRatio || 1;
            canvas.width = clientWidth * ratio;
            canvas.height = clientHeight * ratio;
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        };
        resize();
        return { canvas, ctx, resize };
    }

    initGraphQuest() {
        const scene = this.setupCanvas('fun-graph-game');
        if (!scene) return;

        const nodes = Array.from({ length: 12 }, () => ({
            x: Math.random(),
            y: Math.random(),
            speed: 0.002 + Math.random() * 0.002
        }));

        const edges = [];
        for (let i = 0; i < nodes.length; i += 1) {
            for (let j = i + 1; j < nodes.length; j += 1) {
                if (Math.random() > 0.7) edges.push([i, j]);
            }
        }

        const state = {
            scene,
            nodes,
            edges,
            glowPhase: 0,
            resize: () => scene.resize(),
            draw: () => {
                const { ctx, canvas } = scene;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = 'rgba(11, 15, 20, 0.9)';
                ctx.fillRect(0, 0, width, height);

                ctx.strokeStyle = 'rgba(130, 199, 196, 0.35)';
                ctx.lineWidth = 1;
                edges.forEach(([a, b]) => {
                    ctx.beginPath();
                    ctx.moveTo(nodes[a].x * width, nodes[a].y * height);
                    ctx.lineTo(nodes[b].x * width, nodes[b].y * height);
                    ctx.stroke();
                });

                nodes.forEach((node, index) => {
                    const glow = index === 0 ? 0.6 + Math.sin(state.glowPhase) * 0.4 : 0.4;
                    ctx.beginPath();
                    ctx.fillStyle = index === 0 ? `rgba(246, 193, 119, ${glow})` : 'rgba(130, 199, 196, 0.6)';
                    ctx.arc(node.x * width, node.y * height, index === 0 ? 6 : 4, 0, Math.PI * 2);
                    ctx.fill();
                });
            },
            update: () => {
                state.glowPhase += 0.05;
                nodes.forEach(node => {
                    node.x += (Math.random() - 0.5) * node.speed;
                    node.y += (Math.random() - 0.5) * node.speed;
                    node.x = Math.min(0.95, Math.max(0.05, node.x));
                    node.y = Math.min(0.95, Math.max(0.05, node.y));
                });
            }
        };

        this.animations.push(state);
    }

    initRayTracer() {
        const scene = this.setupCanvas('fun-raytracer');
        if (!scene) return;

        const state = {
            scene,
            time: 0,
            resize: () => scene.resize(),
            draw: () => {
                const { ctx, canvas } = scene;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                ctx.clearRect(0, 0, width, height);

                const gradient = ctx.createRadialGradient(
                    width * 0.4,
                    height * 0.35,
                    30,
                    width * 0.5,
                    height * 0.5,
                    width * 0.8
                );
                gradient.addColorStop(0, 'rgba(246, 193, 119, 0.6)');
                gradient.addColorStop(0.4, 'rgba(130, 199, 196, 0.3)');
                gradient.addColorStop(1, 'rgba(11, 15, 20, 0.9)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);

                for (let i = 0; i < 7; i += 1) {
                    const radius = 40 + i * 18 + Math.sin(state.time * 0.02 + i) * 6;
                    const x = width * 0.2 + Math.sin(state.time * 0.01 + i) * width * 0.2;
                    const y = height * 0.5 + Math.cos(state.time * 0.015 + i) * height * 0.2;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(242, 132, 130, ${0.15 + i * 0.05})`;
                    ctx.lineWidth = 2;
                    ctx.arc(x + i * 30, y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            },
            update: () => {
                state.time += 1;
            }
        };

        this.animations.push(state);
    }

    initPingPong() {
        const scene = this.setupCanvas('fun-pingpong');
        if (!scene) return;

        const state = {
            scene,
            paddleOffset: 0,
            ball: { x: 0.5, y: 0.5, vx: 0.004, vy: 0.003 },
            resize: () => scene.resize(),
            draw: () => {
                const { ctx, canvas } = scene;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = 'rgba(11, 15, 20, 0.95)';
                ctx.fillRect(0, 0, width, height);

                ctx.strokeStyle = 'rgba(130, 199, 196, 0.4)';
                ctx.setLineDash([6, 8]);
                ctx.beginPath();
                ctx.moveTo(width / 2, 20);
                ctx.lineTo(width / 2, height - 20);
                ctx.stroke();
                ctx.setLineDash([]);

                const paddleHeight = 50;
                ctx.fillStyle = 'rgba(246, 193, 119, 0.8)';
                ctx.fillRect(20, height * 0.5 - paddleHeight / 2 + Math.sin(state.paddleOffset) * 20, 10, paddleHeight);
                ctx.fillRect(width - 30, height * 0.5 - paddleHeight / 2 - Math.sin(state.paddleOffset) * 20, 10, paddleHeight);

                ctx.beginPath();
                ctx.fillStyle = 'rgba(242, 132, 130, 0.9)';
                ctx.arc(state.ball.x * width, state.ball.y * height, 6, 0, Math.PI * 2);
                ctx.fill();
            },
            update: () => {
                state.paddleOffset += 0.03;
                state.ball.x += state.ball.vx;
                state.ball.y += state.ball.vy;

                if (state.ball.y < 0.1 || state.ball.y > 0.9) {
                    state.ball.vy *= -1;
                }
                if (state.ball.x < 0.1 || state.ball.x > 0.9) {
                    state.ball.vx *= -1;
                }
            }
        };

        this.animations.push(state);
    }

    initSignalSprint() {
        const scene = this.setupCanvas('fun-arcade');
        if (!scene) return;

        const particles = Array.from({ length: 35 }, () => ({
            x: Math.random(),
            y: Math.random(),
            speed: 0.002 + Math.random() * 0.003,
            radius: 2 + Math.random() * 2
        }));

        const state = {
            scene,
            beat: 0,
            resize: () => scene.resize(),
            draw: () => {
                const { ctx, canvas } = scene;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = 'rgba(11, 15, 20, 0.92)';
                ctx.fillRect(0, 0, width, height);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(130, 199, 196, ${0.3 + Math.sin(state.beat) * 0.2})`;
                ctx.lineWidth = 2;
                ctx.arc(width / 2, height / 2, 40 + Math.sin(state.beat) * 6, 0, Math.PI * 2);
                ctx.stroke();

                particles.forEach(particle => {
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(246, 193, 119, 0.7)';
                    ctx.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2);
                    ctx.fill();
                });
            },
            update: () => {
                state.beat += 0.04;
                particles.forEach(particle => {
                    particle.x += (Math.random() - 0.5) * particle.speed;
                    particle.y += (Math.random() - 0.5) * particle.speed;
                    if (particle.x < 0.05) particle.x = 0.95;
                    if (particle.x > 0.95) particle.x = 0.05;
                    if (particle.y < 0.05) particle.y = 0.95;
                    if (particle.y > 0.95) particle.y = 0.05;
                });
            }
        };

        this.animations.push(state);
    }

    animate() {
        this.animations.forEach(animation => {
            animation.update();
            animation.draw();
        });
        requestAnimationFrame(() => this.animate());
    }
}

new FunVisualizations();
