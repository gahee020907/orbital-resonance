/**
 * TrailEffect.js
 * Creates sophisticated trailing effects for satellites
 * HIGH-END ART VERSION with gradient trails and particle dispersion
 */

class TrailEffect {
    constructor(config = {}) {
        this.maxLength = config.maxLength || 150;
        this.fadeMode = config.fadeMode || 'exponential';
        this.glowEnabled = config.glowEnabled !== false;
        this.trailWidth = config.trailWidth || 2;

        // Trail storage
        this.trails = new Map();

        // Trail style
        this.style = 'smooth'; // Force smooth for Ghost Mode
    }

    /**
     * Update trail for a satellite
     */
    update(satId, position) {
        if (!this.trails.has(satId)) {
            this.trails.set(satId, []);
        }

        const trail = this.trails.get(satId);

        // Calculate velocity for dynamic effects
        let velocity = { x: 0, y: 0 };
        if (trail.length > 0) {
            velocity.x = position.x - trail[0].x;
            velocity.y = position.y - trail[0].y;
        }

        // Add new position
        trail.unshift({
            x: position.x,
            y: position.y,
            z: position.z || 0, // Store Z
            timestamp: Date.now(),
            vx: velocity.x,
            vy: velocity.y
        });

        // Trim to max length
        if (trail.length > this.maxLength) {
            trail.pop();
        }
    }

    /**
     * Draw trail with sophisticated effects
     */
    draw(p, satId, color, intensity = 1) {
        const trail = this.trails.get(satId);
        if (!trail || trail.length < 2) return;

        switch (this.style) {
            case 'comet':
                this.drawCometTrail(p, trail, color, intensity);
                break;
            case 'ribbon':
                this.drawRibbonTrail(p, trail, color, intensity);
                break;
            case 'particles':
                this.drawParticleTrail(p, trail, color, intensity);
                break;
            default:
                this.drawSmoothTrail(p, trail, color, intensity);
        }
    }

    /**
     * Draw comet-style trail with gradient
     */
    drawCometTrail(p, trail, color, intensity) {
        const ctx = p.drawingContext;

        if (trail.length < 3) return;

        // Create gradient along path
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw multiple layers for glow effect
        const layers = this.glowEnabled ? 3 : 1;

        for (let layer = layers; layer > 0; layer--) {
            const layerWidth = this.trailWidth * layer * 1.5;
            const layerAlpha = (1 / layer) * 0.4 * intensity;

            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);

            // Smooth curve through points
            for (let i = 1; i < trail.length - 1; i++) {
                const xc = (trail[i].x + trail[i + 1].x) / 2;
                const yc = (trail[i].y + trail[i + 1].y) / 2;
                ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
            }

            // Create gradient
            if (trail.length >= 2) {
                const gradient = ctx.createLinearGradient(
                    trail[0].x, trail[0].y,
                    trail[trail.length - 1].x, trail[trail.length - 1].y
                );

                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerAlpha})`);
                gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerAlpha * 0.6})`);
                gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = layerWidth;
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    /**
     * Draw ribbon-style flowing trail
     */
    drawRibbonTrail(p, trail, color, intensity) {
        if (trail.length < 3) return;

        p.push();
        p.noStroke();

        // Create ribbon shape
        p.beginShape(p.TRIANGLE_STRIP);

        for (let i = 0; i < trail.length - 1; i++) {
            const t = i / trail.length;
            const alpha = this.calculateFade(t) * intensity * 200;
            const width = (1 - t) * 4;

            // Calculate perpendicular
            const dx = trail[i + 1].x - trail[i].x;
            const dy = trail[i + 1].y - trail[i].y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len * width;
            const ny = dx / len * width;

            p.fill(color.r, color.g, color.b, alpha);
            p.vertex(trail[i].x + nx, trail[i].y + ny);
            p.vertex(trail[i].x - nx, trail[i].y - ny);
        }

        p.endShape();
        p.pop();
    }

    /**
     * Draw particle dispersion trail
     */
    drawParticleTrail(p, trail, color, intensity) {
        p.push();
        p.noStroke();

        for (let i = 0; i < trail.length; i += 2) {
            const t = i / trail.length;
            const alpha = this.calculateFade(t) * intensity * 150;
            const size = (1 - t) * 3 + 1;

            // Add some noise to position
            const noiseX = (p.noise(i * 0.1 + Date.now() * 0.001) - 0.5) * 10 * t;
            const noiseY = (p.noise(i * 0.1 + 100 + Date.now() * 0.001) - 0.5) * 10 * t;

            p.fill(color.r, color.g, color.b, alpha);
            p.ellipse(
                trail[i].x + noiseX,
                trail[i].y + noiseY,
                size,
                size
            );
        }

        p.pop();
    }

    /**
     * Draw smooth bezier trail
     */
    drawSmoothTrail(p, trail, color, intensity) {
        if (trail.length < 2) return;

        p.push();
        p.noFill();

        // Draw with varying opacity
        p.beginShape();
        for (let i = 0; i < trail.length - 1; i++) {
            const t = i / trail.length;
            const alpha = this.calculateFade(t) * intensity * 255;
            // WebGL strokes are consistent width usually

            p.stroke(color.r, color.g, color.b, alpha);
            p.strokeWeight(1); // Keep thin

            // Segment
            p.vertex(trail[i].x, trail[i].y, trail[i].z || 0);
            p.vertex(trail[i + 1].x, trail[i + 1].y, trail[i + 1].z || 0);
        }
        p.endShape();

        p.pop();
    }

    /**
     * Draw glow at head of trail
     */
    drawGlow(p, position, color, intensity) {
        p.push();
        p.noStroke();

        // Multiple layers for soft glow
        const layers = 5;
        for (let i = layers; i > 0; i--) {
            const size = i * 10 * intensity;
            const alpha = (1 - i / layers) * 80 * intensity;

            p.fill(color.r, color.g, color.b, alpha);
            p.ellipse(position.x, position.y, size, size);
        }

        p.pop();
    }

    /**
     * Calculate fade value
     */
    calculateFade(t) {
        switch (this.fadeMode) {
            case 'linear':
                return 1 - t;
            case 'exponential':
                return Math.pow(1 - t, 2.5);
            case 'smooth':
                return Math.cos(t * Math.PI / 2);
            default:
                return 1 - t;
        }
    }

    /**
     * Set trail style
     */
    setStyle(style) {
        if (['comet', 'ribbon', 'particles', 'smooth'].includes(style)) {
            this.style = style;
        }
    }

    /**
     * Set length multiplier
     */
    setLengthMultiplier(multiplier) {
        this.maxLength = Math.floor(150 * multiplier);
    }

    /**
     * Clear specific trail
     */
    clearTrail(satId) {
        this.trails.delete(satId);
    }

    /**
     * Clear all trails
     */
    clearAll() {
        this.trails.clear();
    }

    /**
     * Get trail data
     */
    getTrail(satId) {
        return this.trails.get(satId) || [];
    }
}

window.TrailEffect = TrailEffect;
