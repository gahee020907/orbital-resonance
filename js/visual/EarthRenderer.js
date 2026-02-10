/**
 * EarthRenderer.js - REDESIGNED
 * Holographic / Wireframe technical style
 */

class EarthRenderer {
    constructor() {
        this.baseRadius = 120;
        this.zoom = 1;
        this.rotation = 0;
    }

    update(deltaTime) {
        this.rotation += 0.0001 * deltaTime;
    }

    render(p, cx, cy, r) { // cx, cy ignored in 3D (0,0,0 is center)
        p.push();
        // Earth Rotation (visual only)
        // p.rotateY(p.millis() * 0.0001); 

        // 1. Core Sphere (Vanta Black)
        p.noStroke();
        p.fill(5, 10, 25);
        p.sphere(r);

        // 2. Atmospheric Glow (Simple 3D approach)
        // Draw a slightly larger wireframe or transparent sphere
        p.fill(30, 60, 120, 50); // Transparent Blue
        p.sphere(r * 1.05);

        // 3. Rim Highlight (Simulate with another shell or rely on rim lighting if shader used)
        // For p5 default, let's add a very faint wireframe to give volume hint
        // p.stroke(50, 80, 150, 10);
        // p.noFill();
        // p.sphere(r * 1.1);

        p.pop();
    }

    getRadius() {
        return this.baseRadius * this.zoom;
    }

    setZoom(z) { this.zoom = z; }
    isInsideEarth(x, y, cx, cy) {
        return Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) < this.getRadius();
    }
}

window.EarthRenderer = EarthRenderer;
