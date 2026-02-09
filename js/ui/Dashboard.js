/**
 * Dashboard.js
 * UI Controller - Extended Options & Sound Explanation
 */

class Dashboard {
    constructor() {
        this.isInitialized = false;
        this.callbacks = {};
        this.soundLogEntries = [];
    }

    initialize() {
        if (this.isInitialized) return;
        this.bindEvents();
        this.isInitialized = true;
    }

    bindEvents() {
        // Start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                // FORCE AUDIO START ON USER INTERACTION
                // This is the critical fix for "No Sound"
                if (window.Tone) {
                    await Tone.start();
                    console.log('👆 User Clicked Start - Audio Context Resumed');
                }

                // Fade out Landing Page
                document.getElementById('start-overlay').classList.add('hidden');

                // Fade in HUD (Cinematic Sequence)
                const header = document.querySelector('header');
                if (header) header.classList.add('visible');

                const controls = document.getElementById('control-panel');
                if (controls) {
                    controls.classList.remove('hidden');
                    setTimeout(() => controls.classList.add('visible'), 50);
                }

                const soundPanel = document.getElementById('sound-explanation-panel');
                if (soundPanel) {
                    soundPanel.classList.remove('hidden');
                    setTimeout(() => soundPanel.classList.add('visible'), 50);
                }

                document.dispatchEvent(new CustomEvent('orbital-start'));
            });
        }

        // UI Toggle
        document.getElementById('toggle-ui-btn')?.addEventListener('click', () => {
            document.body.classList.toggle('ui-hidden');
        });

        // Sliders
        this.bindSlider('master-volume', (val) => this.callbacks.onMasterVolumeChange?.(val));
        this.bindSlider('reverb-depth', (val) => this.callbacks.onReverbChange?.(val));
        this.bindSlider('delay-depth', (val) => this.callbacks.onDelayChange?.(val));

        // Preset Buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const preset = e.target.dataset.preset;
                this.updatePresetDescription(preset);
                this.callbacks.onPresetChange?.(preset);
            });
        });

        // Scale/Key Selectors
        document.getElementById('scale-key')?.addEventListener('change', (e) => {
            this.callbacks.onScaleChange?.(e.target.value, document.getElementById('scale-mode')?.value);
        });

        document.getElementById('scale-mode')?.addEventListener('change', (e) => {
            this.callbacks.onScaleChange?.(document.getElementById('scale-key')?.value, e.target.value);
        });

        // Buttons
        document.getElementById('play-pause-btn')?.addEventListener('click', (e) => {
            const isPlaying = e.target.textContent === 'PLAY';
            e.target.textContent = isPlaying ? 'PAUSE' : 'PLAY';
            e.target.classList.toggle('active', isPlaying);
            this.callbacks.onPlayPause?.(isPlaying);
        });

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.callbacks.onReset?.();
        });
    }

    bindSlider(id, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', (e) => callback(parseInt(e.target.value)));
    }

    updatePresetDescription(preset) {
        const descriptions = {
            cosmic: "Sparkling starlight. Crystalline bells and magical glissandos.",
            realism: "Raw Data Sonification. Telemetry signals and radio static."
        };
        const el = document.getElementById('preset-description');
        if (el) el.textContent = descriptions[preset] || "";
    }

    // Stats
    updateSatelliteCount(count) {
        const el = document.getElementById('satellite-count');
        if (el) el.textContent = count;
    }

    updateFPS(fps) {
        const el = document.getElementById('fps-counter');
        if (el) el.textContent = fps;
    }

    updateActiveVoices(count) {
        const el = document.getElementById('active-voices');
        if (el) el.textContent = count;
    }

    // Satellite Info
    updateSatelliteInfo(sat) {
        if (!this.infoPanel) return; // Ensure infoPanel is initialized

        if (!sat) {
            this.infoPanel.classList.add('hidden');
            return;
        }

        // Safety check for position
        if (!sat.position) {
            document.getElementById('info-altitude').textContent = "CALCULATING...";
            document.getElementById('info-velocity').textContent = "---";
            document.getElementById('info-instrument').textContent = sat.category || 'UNKNOWN';
            document.getElementById('selected-satellite-name').textContent = sat.name;
            this.infoPanel.classList.remove('hidden');
            return;
        }

        document.getElementById('selected-satellite-name').textContent = sat.name;
        document.getElementById('info-altitude').textContent = sat.position.altitude.toFixed(2) + ' KM';
        document.getElementById('info-velocity').textContent = sat.position.velocity.toFixed(2) + ' KM/S';
        document.getElementById('info-instrument').textContent = sat.category;

        this.infoPanel.classList.remove('hidden');

        // Add description (dynamic based on type)
        let desc = "";
        if (sat.category === 'STATION') desc = "Orbital Laboratory & Human Habitat";
        else if (sat.category === 'COMMUNICATION') desc = "Global Internet & Data Relay";
        else if (sat.category === 'NAVIGATION') desc = "GPS/GNSS Positioning Network";
        else if (sat.category === 'WEATHER') desc = "Meteorological Monitoring";
        else if (sat.category === 'SCIENCE') desc = "Earth Observation & Astronomy";
        else if (sat.category === 'DEBRIS') desc = "Space Junk / Rocket Body";

        // Specific overrides
        if (sat.name.includes("STARLINK")) desc = "SpaceX Low Latency Internet Constellation";
        if (sat.name.includes("ISS")) desc = "International Space Station (Humans on board!)";
        if (sat.name.includes("HUBBLE")) desc = "Deep Space Telescope";
        if (sat.name.includes("NOAA")) desc = "Weather Forecasting Satellite";
        if (sat.name.includes("GPS")) desc = "Global Positioning System (US)";
        if (sat.name.includes("GALILEO")) desc = "Global Navigation Satellite (EU)";

        // Inject description line if not exists
        let descEl = document.getElementById('info-description');
        if (!descEl) {
            const row = document.createElement('div');
            row.className = 'info-row';
            row.style.marginTop = '10px';
            row.style.borderTop = '1px solid rgba(255,255,255,0.1)';
            row.style.paddingTop = '8px';
            row.innerHTML = `<span class="info-value" id="info-description" style="font-size:0.7rem; color:rgba(255,255,255,0.5); line-height:1.4; font-weight:300;">${desc}</span>`;
            document.querySelector('.info-content').appendChild(row);
        } else {
            descEl.textContent = desc;
        }
    }

    // Sound Explanation (NEW)
    updateSoundExplanation(data) {
        // data: { note, satellite, reason }
        if (!data) return;

        document.getElementById('exp-note').textContent = data.note || '--';
        document.getElementById('exp-satellite').textContent = data.satellite || '--';
        document.getElementById('exp-reason').textContent = data.reason || '--';

        // Add to log
        this.addSoundLogEntry(data);
    }

    addSoundLogEntry(data) {
        const log = document.getElementById('exp-log');
        if (!log) return;

        // Keep only last 10 entries
        if (this.soundLogEntries.length > 10) {
            this.soundLogEntries.shift();
        }

        this.soundLogEntries.push(data);

        // Render
        log.innerHTML = this.soundLogEntries.map(entry =>
            `<div class="log-entry"><span class="sat">${entry.satellite}</span> → <span class="note">${entry.note}</span></div>`
        ).join('');

        // Scroll to bottom
        log.scrollTop = log.scrollHeight;
    }

    // Loading
    updateLoadingStatus(text) {
        const el = document.querySelector('.loading-status');
        if (el) el.textContent = text;
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen')?.classList.add('hidden');
    }

    setCallbacks(c) { this.callbacks = c; }
}

window.Dashboard = Dashboard;
