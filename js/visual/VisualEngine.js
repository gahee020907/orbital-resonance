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
        if (this.selectedSat) {
            // Simple highlight for selection
            const sat = this.selectedSat;
            if (sat.position) {
                const r = (6371 + sat.position.altitude) * (earthR / 6371);
                const theta = (90 - sat.position.latitude) * (Math.PI / 180);
                const phi = (sat.position.longitude + 180) * (Math.PI / 180);
                const x = -(r * Math.sin(theta) * Math.cos(phi));
                const z = (r * Math.sin(theta) * Math.sin(phi));
                const y = -(r * Math.cos(theta));

                p.push();
                p.translate(x, y, z);
                p.stroke(255, 255, 0);
                p.noFill();
                p.box(10);
                p.pop();
            }
        }
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

    getFPS() { return this.p5Instance ? Math.round(this.p5Instance.frameRate()) : 0; }
    dispose() { if (this.p5Instance) this.p5Instance.remove(); }
}

window.VisualEngine = VisualEngine;
