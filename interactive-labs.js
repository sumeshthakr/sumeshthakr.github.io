class InteractiveLabs {
    constructor() {
        this.labs = {
            cornell: { running: false, rafId: null },
            cnn: { running: false, rafId: null },
            graph: { running: false, rafId: null }
        };
        this.initButtons();
    }

    initButtons() {
        document.querySelectorAll('.lab-button').forEach(button => {
            button.addEventListener('click', () => {
                const labName = button.dataset.lab;
                if (labName === 'cornell') this.runCornell();
                if (labName === 'cnn') this.runCNN();
                if (labName === 'graph') this.runGraphAggregation();
            });
        });
    }

    setupCanvas(canvas) {
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            return { width, height };
        };
        return { canvas, ctx, resize };
    }

    runCornell() {
        const canvas = document.getElementById('cornell-lab');
        if (!canvas) return;
        const state = this.labs.cornell;

        if (!state.gl) {
            state.gl = canvas.getContext('webgl');
        }

        const gl = state.gl;
        if (!gl) return;

        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 resolution;
            uniform float time;

            float sdSphere(vec3 p, float s) {
                return length(p) - s;
            }

            float sdBox(vec3 p, vec3 b) {
                vec3 q = abs(p) - b;
                return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
            }

            vec2 map(vec3 p) {
                float room = sdBox(p, vec3(1.8, 1.2, 1.8));
                float sphereA = sdSphere(p - vec3(-0.5, -0.4, -0.2), 0.35);
                float sphereB = sdSphere(p - vec3(0.4, -0.6, 0.5), 0.45);
                float d = min(room, min(sphereA, sphereB));
                float id = room < min(sphereA, sphereB) ? 1.0 : (sphereA < sphereB ? 2.0 : 3.0);
                return vec2(d, id);
            }

            vec3 getNormal(vec3 p) {
                vec2 e = vec2(0.001, 0.0);
                float d = map(p).x;
                vec3 n = d - vec3(
                    map(p - e.xyy).x,
                    map(p - e.yxy).x,
                    map(p - e.yyx).x
                );
                return normalize(n);
            }

            vec3 lighting(vec3 p, vec3 rd) {
                vec3 lightPos = vec3(0.6 * sin(time * 0.4), 0.8, 0.6 * cos(time * 0.4));
                vec3 n = getNormal(p);
                vec3 l = normalize(lightPos - p);
                float diff = max(dot(n, l), 0.0);
                float spec = pow(max(dot(reflect(-l, n), -rd), 0.0), 32.0);
                return vec3(diff) + vec3(spec);
            }

            vec3 palette(float id, vec3 p) {
                if (id == 1.0) {
                    if (p.x > 1.7) return vec3(0.85, 0.35, 0.35);
                    if (p.x < -1.7) return vec3(0.35, 0.75, 0.55);
                    return vec3(0.95);
                }
                if (id == 2.0) return vec3(0.9, 0.65, 0.35);
                return vec3(0.55, 0.7, 0.9);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
                vec3 ro = vec3(0.0, 0.0, 3.5);
                vec3 rd = normalize(vec3(uv, -1.5));

                float t = 0.0;
                float id = 0.0;
                for (int i = 0; i < 80; i++) {
                    vec3 pos = ro + rd * t;
                    vec2 res = map(pos);
                    if (res.x < 0.001) {
                        id = res.y;
                        break;
                    }
                    t += res.x * 0.75;
                    if (t > 8.0) break;
                }

                vec3 col = vec3(0.02, 0.03, 0.05);
                if (t < 8.0) {
                    vec3 pos = ro + rd * t;
                    vec3 base = palette(id, pos);
                    vec3 light = lighting(pos, rd);
                    col = base * (0.35 + light);
                }

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        if (!state.program) {
            const compileShader = (type, source) => {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                return shader;
            };

            const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            state.program = program;
            state.positionLocation = gl.getAttribLocation(program, 'position');
            state.resolutionLocation = gl.getUniformLocation(program, 'resolution');
            state.timeLocation = gl.getUniformLocation(program, 'time');

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 3, -1, -1, 3]),
                gl.STATIC_DRAW
            );
            state.buffer = buffer;
        }

        const resizeGL = () => {
            const ratio = window.devicePixelRatio || 1;
            const width = canvas.clientWidth * ratio;
            const height = canvas.clientHeight * ratio;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
            return { width, height };
        };

        const render = () => {
            const { width, height } = resizeGL();
            gl.useProgram(state.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
            gl.enableVertexAttribArray(state.positionLocation);
            gl.vertexAttribPointer(state.positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.uniform2f(state.resolutionLocation, width, height);
            gl.uniform1f(state.timeLocation, (Date.now() - state.startTime) / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            state.rafId = requestAnimationFrame(render);
        };

        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.startTime = Date.now();
        state.running = true;
        render();
    }

    runCNN() {
        const inputCanvas = document.getElementById('cnn-input');
        const outputCanvas = document.getElementById('cnn-output');
        const resultEl = document.getElementById('cnn-result');
        if (!inputCanvas || !outputCanvas) return;

        const inputScene = this.setupCanvas(inputCanvas);
        const outputScene = this.setupCanvas(outputCanvas);
        if (!inputScene || !outputScene) return;

        const { width, height } = inputScene.resize();
        outputScene.resize();

        const patterns = {
            0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
            1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
            2: ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
            3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
            4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
            5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
            6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
            7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
            8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
            9: ['01110', '10001', '10001', '01111', '00001', '00010', '11100']
        };

        const digit = Math.floor(Math.random() * 10);
        const pattern = patterns[digit];

        const drawDigit = () => {
            const ctx = inputScene.ctx;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, 0, width, height);

            const cellSize = Math.min(width / 7, height / 9);
            const offsetX = (width - cellSize * 5) / 2;
            const offsetY = (height - cellSize * 7) / 2;

            ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
            pattern.forEach((row, rowIndex) => {
                row.split('').forEach((pixel, colIndex) => {
                    if (pixel === '1') {
                        ctx.fillRect(
                            offsetX + colIndex * cellSize,
                            offsetY + rowIndex * cellSize,
                            cellSize * 0.9,
                            cellSize * 0.9
                        );
                    }
                });
            });
        };

        const kernels = [
            [
                [-1, 0, 1],
                [-1, 0, 1],
                [-1, 0, 1]
            ],
            [
                [0, -1, 0],
                [-1, 5, -1],
                [0, -1, 0]
            ],
            [
                [1, 1, 1],
                [1, -8, 1],
                [1, 1, 1]
            ]
        ];

        const applyKernel = (kernel) => {
            const ctx = inputScene.ctx;
            const imageData = ctx.getImageData(0, 0, width, height);
            const output = outputScene.ctx.createImageData(width, height);

            for (let y = 1; y < height - 1; y += 1) {
                for (let x = 1; x < width - 1; x += 1) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky += 1) {
                        for (let kx = -1; kx <= 1; kx += 1) {
                            const idx = ((y + ky) * width + (x + kx)) * 4;
                            sum += imageData.data[idx] * kernel[ky + 1][kx + 1];
                        }
                    }
                    const outIndex = (y * width + x) * 4;
                    const value = Math.max(0, Math.min(255, sum + 128));
                    output.data[outIndex] = value;
                    output.data[outIndex + 1] = value;
                    output.data[outIndex + 2] = value;
                    output.data[outIndex + 3] = 255;
                }
            }
            outputScene.ctx.putImageData(output, 0, 0);
        };

        const predictDigit = () => {
            let bestScore = -Infinity;
            let bestDigit = digit;
            Object.entries(patterns).forEach(([key, value]) => {
                let score = 0;
                value.forEach((row, rowIndex) => {
                    row.split('').forEach((pixel, colIndex) => {
                        if (pixel === pattern[rowIndex][colIndex]) score += 1;
                    });
                });
                if (score > bestScore) {
                    bestScore = score;
                    bestDigit = Number(key);
                }
            });
            const confidence = Math.round((bestScore / 35) * 100);
            resultEl.textContent = `Prediction: ${bestDigit} (${confidence}%)`;
        };

        drawDigit();
        applyKernel(kernels[Math.floor(Math.random() * kernels.length)]);
        predictDigit();
    }

    runGraphAggregation() {
        const canvas = document.getElementById('graph-aggregation');
        const resultEl = document.getElementById('graph-result');
        if (!canvas) return;

        const scene = this.setupCanvas(canvas);
        if (!scene) return;
        const { width, height } = scene.resize();

        const nodes = Array.from({ length: 8 }, (_, index) => ({
            id: index,
            x: width * (0.2 + Math.random() * 0.6),
            y: height * (0.2 + Math.random() * 0.6),
            feature: Math.random()
        }));

        const edges = [];
        for (let i = 0; i < nodes.length; i += 1) {
            for (let j = i + 1; j < nodes.length; j += 1) {
                if (Math.random() > 0.6) edges.push([i, j]);
            }
        }

        let step = 0;
        const maxSteps = 8;

        const draw = () => {
            const ctx = scene.ctx;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(12, 18, 30, 0.8)';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = 'rgba(125, 211, 252, 0.3)';
            ctx.lineWidth = 1.5;
            edges.forEach(([a, b]) => {
                ctx.beginPath();
                ctx.moveTo(nodes[a].x, nodes[a].y);
                ctx.lineTo(nodes[b].x, nodes[b].y);
                ctx.stroke();
            });

            nodes.forEach(node => {
                const intensity = node.feature;
                ctx.beginPath();
                ctx.fillStyle = `rgba(125, 211, 252, ${0.3 + intensity * 0.7})`;
                ctx.arc(node.x, node.y, 8 + intensity * 6, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const aggregate = () => {
            nodes.forEach(node => {
                const neighborFeatures = edges
                    .filter(([a, b]) => a === node.id || b === node.id)
                    .map(([a, b]) => (a === node.id ? nodes[b].feature : nodes[a].feature));
                const sum = neighborFeatures.reduce((acc, value) => acc + value, node.feature);
                node.feature = Math.min(1, sum / (neighborFeatures.length + 1));
            });
            step += 1;
            resultEl.textContent = `Aggregation: step ${step} / ${maxSteps}`;
            draw();
        };

        if (this.labs.graph.intervalId) clearInterval(this.labs.graph.intervalId);
        draw();
        this.labs.graph.intervalId = setInterval(() => {
            if (step >= maxSteps) {
                clearInterval(this.labs.graph.intervalId);
                resultEl.textContent = 'Aggregation: converged';
                return;
            }
            aggregate();
        }, 600);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InteractiveLabs();
});
