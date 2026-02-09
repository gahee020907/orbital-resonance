/**
 * main.js
 * Extended with Preset, Scale, and Sound Explanation wiring
 */

class OrbitalResonanceApp {
    constructor() {
        this.satelliteEngine = null;
        this.visualEngine = null;
        this.audioEngine = null;
        this.dashboard = null;
        this.isRunning = false;
    }

    async initialize() {
        console.log('🌌 Initializing Orbital Resonance...');
        try {
            this.dashboard = new Dashboard();
            this.dashboard.initialize();

            this.satelliteEngine = new SatelliteEngine();
            await this.satelliteEngine.initialize();

            this.visualEngine = new VisualEngine();
            this.visualEngine.initialize('canvas-container');

            this.audioEngine = new AudioEngine();

            this.setupInteractions();

            this.dashboard.hideLoadingScreen();

            document.addEventListener('orbital-start', () => {
                this.start();
            });
        } catch (e) {
            console.error("❌ CRITICAL INITIALIZATION ERROR:", e);
            document.querySelector('.loading-status').textContent = "ERROR: " + e.message;
        }
    }

    setupInteractions() {
        this.dashboard.setCallbacks({
            // Audio Controls
            onMasterVolumeChange: (v) => this.audioEngine.setMasterVolume(v),
            onReverbChange: (v) => this.audioEngine.setReverbDepth(v),
            onDelayChange: (v) => this.audioEngine.setDelayDepth(v),

            // Preset Change (NEW)
            onPresetChange: (preset) => {
                this.audioEngine.setPreset(preset);
            },

            // Scale/Key Change (NEW)
            onScaleChange: (key, mode) => {
                this.audioEngine.setScale(key, mode);
            },

            // Playback
            onPlayPause: (play) => play ? this.resume() : this.pause(),
            onReset: () => { window.location.reload(); }
        });

        // Sound Explanation Callback (NEW)
        this.audioEngine.onSoundPlayed = (data) => {
            this.dashboard.updateSoundExplanation(data);
        };

        // Click to Select
        this.visualEngine.onSatelliteClick = (mx, my) => {
            this.handleSatelliteClick(mx, my);
        };
    }

    handleSatelliteClick(mx, my) {
        if (!this.visualEngine.p5Instance) return;
        const p = this.visualEngine.p5Instance;

        let closest = null;
        let minDist = 25;

        const satellites = this.satelliteEngine.getActiveSatellitesWithPositions();
        const width = p.width;
        const height = p.height;
        const zoom = this.visualEngine.zoom;

        for (const sat of satellites) {
            // FIX: Use exact visual position from VisualEngine
            // This ensures we click exactly what we see (3D -> 2D projection)
            const worldPos = this.visualEngine.getSatelliteWorldPosition(sat);
            if (!worldPos) continue;

            // Use our custom Polyfill since p.screenPosition is missing
            const screenPos = this.visualEngine.getScreenPosition(worldPos.x, worldPos.y, worldPos.z);
            if (!screenPos) continue;

            // Screen Coordinates from VisualEngine are already p5-centered (-w/2 ... w/2)
            // But mouseX/Y (mx, my) provided by p5 events are usually 0..width?
            // Wait, VisualEngine.js onSatelliteClick(p.mouseX, p.mouseY).
            // p.mouseX in WEBGL is relative to canvas top-left (0..width).
            // VisualEngine.getScreenPosition returns centered (-width/2..width/2).
            // So we need to shift screenPos to match mouseX.

            const sx = screenPos.x + width / 2;
            const sy = screenPos.y + height / 2;

            const d = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
            if (d < minDist) {
                minDist = d;
                closest = sat;
            }
        }

        this.visualEngine.selectedSat = closest;
        this.dashboard.updateSatelliteInfo(closest);

        if (closest) {
            // this.audioEngine.playSelectionSound(); // User requested silence
            console.log("Selected:", closest.name);
        }
    }

    async start() {
        await this.audioEngine.initialize();
        this.isRunning = true;
        this.loop();
    }

    loop() {
        if (!this.isRunning) return;

        this.satelliteEngine.update(16);
        const satellites = this.satelliteEngine.getActiveSatellitesWithPositions();

        const count = this.visualEngine.renderSatellites(satellites);

        this.audioEngine.update(satellites);

        // Throttle UI updates
        if (Math.random() < 0.1) {
            this.dashboard.updateSatelliteCount(count);
            this.dashboard.updateFPS(this.visualEngine.getFPS());
            this.dashboard.updateActiveVoices(this.audioEngine.getStats().eventsPerSecond);
        }

        requestAnimationFrame(() => this.loop());
    }

    pause() { this.isRunning = false; this.audioEngine.pause(); }
    resume() { this.isRunning = true; this.audioEngine.resume(); this.loop(); }
    stop() { this.isRunning = false; }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new OrbitalResonanceApp();
    window.app.initialize();
});
