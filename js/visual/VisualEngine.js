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
        const activeSats = [];

        // Pre-calc positions (3D)
        for (const sat of this.cachedSatellites) {
            if (!sat.position) continue;

            // Convert to 3D Scene Coordinates
            // sat.position.altitude + Earth Radius
            // We use OrbitalMechanics or just simple spherical conversion here for visualization
            const r = (6371 + sat.position.altitude) * (earthR / 6371);
            const theta = (90 - sat.position.latitude) * (Math.PI / 180);
            const phi = (sat.position.longitude + 180) * (Math.PI / 180); // Adjust to match texture if needed

            const x = -(r * Math.sin(theta) * Math.cos(phi));
            const z = (r * Math.sin(theta) * Math.sin(phi));
            const y = -(r * Math.cos(theta)); // p5 Y is down? p5 3D Y is Down. 

            // Correction for p5 coordinates
            // In p5 WEBGL: X right, Y down, Z towards viewer (but we can rotate)

            const pos = { x, y, z };

            // Update Trail
            if (this.trailEffect) {
                this.trailEffect.update(sat.noradId || sat.name, pos);
            }
            activeSats.push({ pos, sat });
        }

        // Draw Trails First
        if (this.trailEffect) {
            for (const s of activeSats) {
                const velocity = s.sat.position?.velocity || 7;
                const normVel = Math.min(Math.max((velocity - 0) / 8, 0), 1);

                const r = p.lerp(255, 0, normVel);
                const g = p.lerp(255, 200, normVel);
                const b = 255;

                this.trailEffect.draw(p, s.sat.noradId || s.sat.name, { r, g, b }, 0.2);
            }
        }

        // Draw Satellites
        for (const s of activeSats) {
            const { x, y, z } = s.pos;

            const velocity = s.sat.position?.velocity || 3;
            const t = p.constrain(p.map(velocity, 3, 7.5, 0, 1), 0, 1);

            let r = 255, g = 255, b = 255;
            if (t > 0.8) { r = 200; g = 255; b = 255; }
            else { r = 200; g = 200; b = 255; }

            p.push();
            p.translate(x, y, z);

            // CATEGORY-BASED VISUALS (User Request)
            const cat = s.sat.category;

            if (cat === 'STATION') {
                // STATION: White Cube (Large, Man-made)
                p.noStroke();
                // Pulse size
                const pulse = Math.sin(p.millis() * 0.002) * 2;
                p.fill(255);
                p.emissiveMaterial(255, 255, 255); // Glow
                p.box(6 + pulse);

                // Crosshair rings?
                p.noFill();
                p.stroke(255, 50);
                p.strokeWeight(1);
                p.box(15);
            }
            else if (cat === 'NAVIGATION') {
                // NAVIGATION: Gold Tetrahedron (Precision)
                p.noStroke();
                p.fill(255, 200, 50); // Gold
                p.emissiveMaterial(200, 150, 0);
                p.push();
                p.rotateX(p.millis() * 0.001);
                p.rotateY(p.millis() * 0.001);
                p.cone(3, 6); // Triangle-ish
                p.pop();
            }
            else if (cat === 'SCIENCE') {
                // SCIENCE: Magenta Sphere (Research, Perfect)
                p.noStroke();
                p.fill(255, 100, 255); // Magenta
                p.emissiveMaterial(200, 50, 200);
                p.sphere(3);
                // Orbit ring
                p.noFill();
                p.stroke(255, 100, 255, 100);
                p.ellipse(0, 0, 10, 10);
            }
            else if (cat === 'WEATHER') {
                // WEATHER: Green Box (Scanner)
                p.noStroke();
                p.fill(100, 255, 150);
                p.box(3);
            }
            else if (cat === 'DEBRIS') {
                // DEBRIS: Red Jagged Point (Trash)
                p.stroke(255, 50, 50);
                p.strokeWeight(2);
                p.point(0, 0, 0);
            }
            else {
                // COMMUNICATION / DEFAULT: Cyan Swarm (Points for Performance)
                // Thousands of these, keep strictly generic points
                p.stroke(100, 230, 255, t > 0.8 ? 255 : 200);
                p.strokeWeight(t > 0.8 ? 2 : 1.5);
                p.point(0, 0, 0);
            }

            p.pop();
        }

        // Interaction? Raycasting is hard in p5 WEBGL.
        // We might disable click selection for now or implement simple distance check to camera ray.
    }

    drawTargetLock(p, x, y, size, color, isActive) {
        // Unused but kept for reference if needed later
    }

    drawEarth(p, cx, cy, earthR) {
        // ETHEREAL SCALE - Reduced to 0.25 to de-cluster satellites
        // const baseR = Math.min(p.width, p.height) * 0.25; // Removed, now using earthR directly
        const r = earthR; // Use the passed earthR

        // ATMOSPHERIC VOID
        // No hard edges. Just a deep glow.
        p.drawingContext.shadowBlur = 80;
        p.drawingContext.shadowColor = 'rgba(50, 100, 255, 0.4)';

        // 1. The Void (Black Hole style)
        p.fill(0);
        p.noStroke();
        p.ellipse(cx, cy, r * 1.98);

        // 2. Subtle Rim (Atmosphere)
        p.noFill();
        p.strokeWeight(1);
        p.stroke(100, 150, 255, 30); // Very faint
        p.ellipse(cx, cy, r * 2);

        // 3. Inner Horizon Glow
        // Simulate volumetric atmosphere with multiple faint rings
        for (let i = 0; i < 5; i++) {
            p.stroke(100, 150, 255, 10 - i * 2);
            p.ellipse(cx, cy, r * (2 - i * 0.01));
        }

        p.drawingContext.shadowBlur = 0;
    }

    // Jewel-like Star Field Point Cloud
    drawMinimalPoint(p, category, x, y, size) {
        // Base Colors - SOFT PASTELS (lighter, less aggressive)
        let c;
        switch (category) {
            case 'STATION': c = p.color(255, 255, 255); break; // White
            case 'COMMUNICATION': c = p.color(100, 230, 255); break; // Soft Cyan
            case 'NAVIGATION': c = p.color(255, 230, 100); break; // Soft Gold
            case 'SCIENCE': c = p.color(255, 120, 220); break; // Soft Magenta
            case 'WEATHER': c = p.color(100, 255, 150); break; // Soft Green
            case 'DEBRIS': c = p.color(200, 100, 100); break; // Soft Red
            default: c = p.color(220, 220, 255); // Pale Blue
        }

        // Apply Glow based on Importance
        const time = p.millis() * 0.003;
        const pulse = Math.abs(Math.sin(time)); // 0 to 1

        if (category === 'STATION') {
            const glowSize = 25 + pulse * 15; // 25-40
            p.drawingContext.shadowBlur = glowSize;
            p.drawingContext.shadowColor = c.toString();
            p.fill(c); p.noStroke();
            p.circle(x, y, 15);
            // Crosshair for Station (Rotating slightly?)
            p.stroke(c); p.strokeWeight(2);
            p.line(x - 8, y, x + 8, y);
            p.line(x, y - 8, x, y + 8);
        } else if (category === 'DEBRIS') {
            p.fill(c); p.noStroke();
            p.drawingContext.shadowBlur = 0;
            p.circle(x, y, 4);
        } else {
            // Standard Satellites - Gemstones (BREATHING PULSE)
            const dynamicSize = 8 + (pulse * 3); // 8 to 11px
            const dynamicGlow = 15 + (pulse * 10); // 15 to 25px

            p.drawingContext.shadowBlur = dynamicGlow;
            p.drawingContext.shadowColor = c.toString();
            p.fill(c); p.noStroke();
            p.circle(x, y, dynamicSize);
        }

        p.drawingContext.shadowBlur = 0; // Reset
    }


    mousePressed(p) {
        const cx = p.width / 2;
        const cy = p.height / 2;
        if (this.onSatelliteClick) this.onSatelliteClick(p.mouseX, p.mouseY);
    }

    windowResized(p) { p.resizeCanvas(window.innerWidth, window.innerHeight); }
    setZoom(z) { this.zoom = z; }
    getFPS() { return this.p5Instance ? Math.round(this.p5Instance.frameRate()) : 0; }
    dispose() { if (this.p5Instance) this.p5Instance.remove(); }
}

window.VisualEngine = VisualEngine;
