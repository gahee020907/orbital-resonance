/**
 * VisualEngine.js
 * CINEMATIC MINIMALISM / ART MODE
 * Combines technical precision with artistic subtlety.
 */

class VisualEngine {
    constructor() {
        this.p5Instance = null;
        this.earthRenderer = new EarthRenderer();
        this.orbitalMechanics = new OrbitalMechanics();
        this.parameterMapper = new ParameterMapper();

        // Smart Trail System - ENABLED (Ghost Mode)
        this.trailEffect = new TrailEffect({
            maxLength: 50, // Shorter history for performance
            fadeMode: 'exponential',
            glowEnabled: false, // Performance
            trailWidth: 1
        });

        this.zoom = 1.0;
        this.rotation = 0;
        this.colors = { bg: [0, 0, 0] };
        this.stars = [];
        this.cachedSatellites = []; // Buffer for rendering

        this.selectedSat = null;
        this.onSatelliteClick = null;
    }

    initialize(containerId) {
        const sketch = (p) => {
            p.setup = () => this.setup(p, containerId);
            p.draw = () => this.draw(p);
            p.windowResized = () => this.windowResized(p);
            p.mousePressed = () => this.mousePressed(p);
        };
        this.p5Instance = new p5(sketch, document.getElementById(containerId));
    }

    setup(p, containerId) {
        const container = document.getElementById(containerId);
        p.createCanvas(container.clientWidth, container.clientHeight, p.WEBGL); // WEBGL MODE
        p.smooth();
        p.setAttributes('antialias', true);
        p.frameRate(60);

        // Generate subtle starfield (3D)
        for (let i = 0; i < 400; i++) {
            this.stars.push({
                x: p.random(-2000, 2000),
                y: p.random(-2000, 2000),
                z: p.random(-2000, -1000), // Background
                size: p.random(0.5, 2),
                alpha: p.random(50, 150)
            });
        }
    }

    // Called by main.js to update data
    renderSatellites(satellites) {
        this.cachedSatellites = satellites;
        return satellites.length;
    }

    // Main Render Loop (p5 driven)
    draw(p) {
        p.background(this.colors.bg);

        // 3D INTERACTION
        p.orbitControl(2, 2, 0.1); // Sensitivity

        // Lighting (Sublime Void)
        p.noLights(); // Self-illuminated aesthetics mostly
        // Add a subtle directional light to show Earth form if needed, but silhouette is goal.
        // Let's add a rim light from behind/side
        p.directionalLight(50, 60, 80, 1, 0.5, -0.5);
        p.ambientLight(10, 10, 15); // Very dark ambient

        const earthR = 150; // Fixed 3D Radius

        // 1. Stars (Background)
        p.push();
        // Check if we need to rotate stars or keep static? Static is fine for now.
        p.noStroke();
        for (const s of this.stars) {
            p.push();
            p.translate(s.x, s.y, s.z);
            p.fill(255, 255, 255, s.alpha);
            p.plane(s.size, s.size); // Billboarding roughly
            p.pop();
        }
        p.pop();

        // 2. Holographic Earth (3D)
        this.earthRenderer.render(p, 0, 0, earthR);

        // 3. Satellites & Trails
        // Batch Rendering Groups
        const batches = {
            STATION: [],
            NAVIGATION: [],
            SCIENCE: [],
            WEATHER: [],
            COMMUNICATION: [],
            DEBRIS: [],
            OTHER: []
        };

        // Pre-calc positions (3D)
        for (const sat of this.cachedSatellites) {
            if (!sat.position) continue;

            const r = (6371 + sat.position.altitude) * (earthR / 6371);
            const theta = (90 - sat.position.latitude) * (Math.PI / 180);
            const phi = (sat.position.longitude + 180) * (Math.PI / 180);

            const x = -(r * Math.sin(theta) * Math.cos(phi));
            const z = (r * Math.sin(theta) * Math.sin(phi));
            const y = -(r * Math.cos(theta));

            const pos = { x, y, z, sat };

            // Categorize
            let cat = sat.category;
            if (!batches[cat]) cat = 'OTHER';
            batches[cat].push(pos);

            // Check selection or high-velocity highlight
            if (this.selectedSat && this.selectedSat === sat) {
                // Draw selected immediately/later
            }
        }

        // DRAW BATCHES (Points)
        p.strokeWeight(2);

        // STATION (White)
        if (batches.STATION.length > 0) {
            p.stroke(255);
            p.beginShape(p.POINTS);
            for (const s of batches.STATION) p.vertex(s.x, s.y, s.z);
            p.endShape();
        }

        // NAVIGATION (Gold)
        if (batches.NAVIGATION.length > 0) {
            p.stroke(255, 200, 50);
            p.beginShape(p.POINTS);
            for (const s of batches.NAVIGATION) p.vertex(s.x, s.y, s.z);
            p.endShape();
        }

        // SCIENCE (Magenta)
        if (batches.SCIENCE.length > 0) {
            p.stroke(255, 100, 255);
            p.beginShape(p.POINTS);
            for (const s of batches.SCIENCE) p.vertex(s.x, s.y, s.z);
            p.endShape();
        }

        // WEATHER (Green)
        if (batches.WEATHER.length > 0) {
            p.stroke(100, 255, 150);
            p.beginShape(p.POINTS);
            for (const s of batches.WEATHER) p.vertex(s.x, s.y, s.z);
            p.endShape();
        }

        // COMMUNICATION (Cyan)
        if (batches.COMMUNICATION.length > 0) {
            p.stroke(100, 200, 255);
            p.beginShape(p.POINTS);
            for (const s of batches.COMMUNICATION) p.vertex(s.x, s.y, s.z);
            p.endShape();
        }

        // DEBRIS (Red/Grey)
        if (batches.DEBRIS.length > 0) {
            p.stroke(150, 50, 50); // Dim Red
            p.beginShape(p.POINTS);
            for (const s of batches.DEBRIS) p.vertex(s.x, s.y, s.z);
            p.endShape();
        }

        // Highlighting Selected
        // Highlighting Selected
        // Highlighting Selected
        if (this.selectedSat) {
            const pos = this.getSatelliteWorldPosition(this.selectedSat);
            if (pos) {
                p.push();
                p.translate(pos.x, pos.y, pos.z);

                // Reticle Design (Target Lock)
                const time = p.millis() * 0.005;
                const size = 12 + Math.sin(time) * 2; // Breathing effect

                p.stroke(0, 255, 255); // Cyan HUD color
                p.strokeWeight(2);
                p.noFill();

                // Ring
                p.rotateZ(time * 0.5);
                p.torus(size, 0.5, 3, 24); // Thin ring

                // Corners
                p.stroke(255);
                p.strokeWeight(1);
                const s = size * 1.5;
                p.line(-s, 0, -s * 0.2, 0);
                p.line(s, 0, s * 0.2, 0);
                p.line(0, -s, 0, -s * 0.2);
                p.line(0, s, 0, s * 0.2);

                p.pop();
            }
        }
    }

    /**
     * Get the exact 3D world position of a satellite for consistency
     */
    getSatelliteWorldPosition(sat) {
        if (!sat || !sat.position) return null;

        // Match the math in the batch loop exactly
        const R = 150; // This should match the earthR constant in draw()

        const r = (6371 + sat.position.altitude) * (R / 6371);
        const theta = (90 - sat.position.latitude) * (Math.PI / 180);
        const phi = (sat.position.longitude + 180) * (Math.PI / 180);

        const x = -(r * Math.sin(theta) * Math.cos(phi));
        const z = (r * Math.sin(theta) * Math.sin(phi));
        const y = -(r * Math.cos(theta));

        return { x, y, z };
    }

    mousePressed(p) {
        // Interaction: Trigger selection logic in main.js
        if (this.onSatelliteClick) {
            this.onSatelliteClick(p.mouseX, p.mouseY);
        }
    }

    windowResized(p) {
        const container = document.getElementById('canvas-container');
        if (container) {
            p.resizeCanvas(container.clientWidth, container.clientHeight);
        }
    }

    /**
     * Convert World Position to Screen Position (Manual 3D Projection)
     * Polyfill for missing p.screenPosition
     */
    getScreenPosition(x, y, z) {
        const p = this.p5Instance;
        if (!p || !p._renderer) return null;

        // Get Render Context
        const renderer = p._renderer;

        // 1. Get Matrices
        // p5.js 1.4.0 stores matrices in uMVMatrix (not uModelViewMatrix) and uPMatrix
        const modelView = renderer.uMVMatrix;
        const projection = renderer.uPMatrix;

        // 2. Project Point
        // pos = P * V * M * point
        // In p5, ModelView is combined.

        // Transform to Camera Space
        // We need to use p5.Matrix helper or manual math.
        // Let's use manual math to be safe and dependency-free.

        // Simplified approach: use p5's internal methods if available, 
        // or just calculate assuming standard camera.

        // BETTER: Use p5's built-in vector projection if possible, 
        // but since screenPosition failed, manual matrix mult is safest.

        // Helper to multiply 4x4 matrix by vec4
        function multMatVec(m, v) {
            const out = [0, 0, 0, 0];
            for (let i = 0; i < 4; i++) {
                out[i] = m.mat4[0 + i] * v[0] +
                    m.mat4[4 + i] * v[1] +
                    m.mat4[8 + i] * v[2] +
                    m.mat4[12 + i] * v[3];
            }
            return out;
        }

        // Combine Matrices: P * MV
        // Assuming p5.Matrix has valid .mat4 array (Float32Array)

        // Actually, p5 1.4+ might handle this internally?
        // Let's try to access the underlying webgl context? No, too complex.

        // FALLBACK: Simple Perspective Projection approximation
        // If we assume camera is at (0,0,height/2 / tan(PI/6)) looking at (0,0,0)
        // correct rotation is key.

        // WAIT! p5.js DOES have screenPosition, but maybe it needs to be imported or enabled?
        // No, it's likely the renderer context wasn't ready or it's named differently.

        // Let's use the RELIABLE method:
        // Project using the camera's view matrix.

        // FAST FIX: Use the 'screenPosition' add-on code directly inline here.
        // Source: https://github.com/processing/p5.js/blob/main/src/webgl/p5.RendererGL.js#L1250

        const v = p.createVector(x, y, z);

        // 1. Project to Normalized Device Coordinates (NDC)
        // This requires accessing internal matrices which is risky if versions change.

        // ALTERNATIVE:
        // Since we controls the camera (p.orbitControl or easyCam?), 
        // We can just query the camera.
        // p.camera() ...?

        // Let's try the p5 generic solution:
        const uMV = renderer.uModelViewMatrix.copy();
        const uP = renderer.uPMatrix.copy();

        // Multiply: P * MV * v
        // p5 matrix multiplication is m.mult(v) or similar? 
        // Warning: p5.Matrix API changes.

        // Safest: Use a known working snippet for p5 1.x
        // We will return relative coordinates (-width/2 to width/2)

        // Calculate manually
        const mv = uMV.mat4;
        const pm = uP.mat4;

        // 1. View Transform (ModelView)
        const vView = [
            mv[0] * x + mv[4] * y + mv[8] * z + mv[12],
            mv[1] * x + mv[5] * y + mv[9] * z + mv[13],
            mv[2] * x + mv[6] * y + mv[10] * z + mv[14],
            mv[3] * x + mv[7] * y + mv[11] * z + mv[15]
        ];

        // 2. Project Transform (Projection)
        const vClip = [
            pm[0] * vView[0] + pm[4] * vView[1] + pm[8] * vView[2] + pm[12] * vView[3],
            pm[1] * vView[0] + pm[5] * vView[1] + pm[9] * vView[2] + pm[13] * vView[3],
            pm[2] * vView[0] + pm[6] * vView[1] + pm[10] * vView[2] + pm[14] * vView[3],
            pm[3] * vView[0] + pm[7] * vView[1] + pm[11] * vView[2] + pm[15] * vView[3]
        ];

        // 3. Perspective Divide
        const w = vClip[3];
        if (w === 0) return null; // Singularity

        const ndcX = vClip[0] / w;
        const ndcY = vClip[1] / w;

        // 4. Viewport Transform
        // NDC is -1 to 1. Screen is 0 to width (or centered)
        // In p5 WEBGL, (0,0) is center.
        // So x: ndcX * width/2
        //    y: -ndcY * height/2 (Y is flipped in WebGL)

        return {
            x: ndcX * p.width / 2,
            y: -ndcY * p.height / 2
        };
    }

    getFPS() { return this.p5Instance ? Math.round(this.p5Instance.frameRate()) : 0; }
    dispose() { if (this.p5Instance) this.p5Instance.remove(); }
}

window.VisualEngine = VisualEngine;
