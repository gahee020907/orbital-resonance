/**
 * AudioEngine.js
 * Extended with preset switching, scale control, and sound explanation
 */

class AudioEngine {
    constructor() {
        this.instruments = null;
        this.scaleTheory = null;
        this.parameterMapper = null;
        this.aiConductor = null;
        this.spatialAudio = null;

        this.isInitialized = false;
        this.isPlaying = true;

        // Audio state
        this.masterVolume = 85; // LOUDER (was 70)
        this.reverbDepth = 50;
        this.delayDepth = 20;

        // Active sounds tracking - PERFORMANCE FIX
        this.lastTriggerTime = new Map();
        this.minTriggerInterval = 1200; // SLOWER (Deep Space, User Request -20%)
        this.globalLastTrigger = 0;
        this.globalTriggerInterval = 600; // SPARSE

        // Sound explanation callback
        this.onSoundPlayed = null;

        // Stats
        this.stats = {
            voiceCount: 0,
            eventsPerSecond: 0
        };

        this.eventCounter = 0;
        this.lastStatsUpdate = Date.now();
    }

    async initialize() {
        if (this.isInitialized) return true;

        console.log('🔊 Initializing Audio Engine...');

        try {
            await Tone.start();
            console.log('✅ Tone.js context started');

            this.scaleTheory = new ScaleTheory();
            this.harmonyManager = new HarmonyManager(this.scaleTheory);
            this.parameterMapper = new ParameterMapper(this.scaleTheory);
            this.instruments = new Instruments();
            this.aiConductor = new AIConductor(this.scaleTheory);
            this.spatialAudio = new SpatialAudio();

            await this.instruments.initialize();
            this.harmonyManager.initialize();
            this.spatialAudio.initialize();

            // Start the Harmonic Walker
            this.aiConductor.startConducting();
            console.log('11. AIConductor Started');
            // Start Transport (REMOVED for Physics Flow)
            // Tone.Transport.start();

            this.setMasterVolume(this.masterVolume);
            this.setReverbDepth(this.reverbDepth);
            this.setDelayDepth(this.delayDepth);

            this.isInitialized = true;
            console.log('✅ Audio Engine initialized');

            return true;

        } catch (error) {
            console.error('❌ Audio Engine initialization failed:', error);
            return false;
        }
    }

    update(satellites) {
        if (!this.isInitialized || !this.isPlaying) return;

        // Audio Update Logic (Fixed)
        const collective = this.parameterMapper.mapCollective(satellites);
        const conductorResult = this.aiConductor.analyze(collective);

        // AUTO-CONDUCTOR: Apply Scale Changes
        if (conductorResult.mood) {
            const suggestedScale = this.aiConductor.getMoodScale();
            // Only change if different from current (optimization)
            if (this.scaleTheory.currentScale !== suggestedScale) {
                // Pass Key NAME not Index
                const currentKeyName = this.scaleTheory.noteNames[this.scaleTheory.currentKey];
                this.setScale(currentKeyName, suggestedScale);
            }
        }

        // OPTIMIZATION: Spatial Audio is redundant as Instruments.js doesn't use the panners.
        // Removing this loop saves massive CPU (3000+ panner updates per frame).
        // this.spatialAudio.updateAllPositions(satellites);

        // Process a subset to avoid CPU overload?
        // No, process all but rely on probability gates in processSatellite
        for (const sat of satellites) {
            this.processSatellite(sat, conductorResult);
        }

        this.updateStats();

        return {
            conductorState: this.aiConductor.getState(),
            collective: collective
        };
    }

    processSatellite(satellite, conductorResult) {
        // 0. GLOBAL POLYPHONY LIMIT (CRITICAL PERFORMANCE)
        // If we are already playing too many sounds, SKIP.
        // Tone.js can handle maybe 30-40, but for "Beauty" we want less overlap.
        const maxVoices = 15; // Strict limit
        if (this.eventCounter > maxVoices) return;

        // Also check if we just triggered something VERY recently (Global Throttle)
        const now = Date.now();
        if (now - this.globalLastTrigger < 100) return; // Max 10 sounds per second

        // 1. Check ParameterMapper Trigger Rules (Intelligence)
        const audioParams = this.parameterMapper.mapToAudio(satellite);
        const satId = satellite.noradId || satellite.name;
        const timeSinceLast = now - (this.lastTriggerTime.get(satId) || 0);

        let shouldPlay = false;

        // A. Rule-Based Trigger (Grid Crossing, Zone Change, Beacon)
        if (audioParams.shouldTrigger) {
            // Even if rule matches, limit probability to avoid "Wall of Sound"
            // Grid lines are crossed by ANY of 3000 sats.
            if (Math.random() < 0.15) {
                shouldPlay = true;
                this.globalLastTrigger = now;
            }
        }
        // B. Stochastic Ambient Gate (Ethereal Flow)
        else {
            // "Ethereal Flow" - random textures
            const altitude = satellite.position.altitude || 500;
            const speedFactor = 1 - Math.min(altitude / 30000, 1);
            // Increase interval to 15s-45s for sparser sound
            const minInterval = 15000 + (1 - speedFactor) * 30000;

            const density = this.harmonyManager ? this.harmonyManager.getDensity() : 0.1;

            // Only play if time passed AND chance met
            if (timeSinceLast > minInterval && Math.random() < density) {
                shouldPlay = true;
                this.globalLastTrigger = now;
                audioParams.triggerRule = "FLOW";
                audioParams.triggerDetail = "Ambient";
            }
        }

        if (!shouldPlay) return;

        // 3. Prepare Note (HARMONIC BEAUTY)
        let noteToPlay = audioParams.note;

        // Force to Chord Tones if available
        if (conductorResult && conductorResult.allowedNotes) {
            noteToPlay = this.scaleTheory.constrainToChord(noteToPlay, conductorResult.allowedNotes);
        }

        // 4. Humanized Timing
        const humanize = Math.random() * 0.1; // 0-100ms delay

        // Variable durations
        let duration = '8n';
        if (satellite.category === 'STATION') duration = '1m';
        if (satellite.category === 'DEBRIS') duration = '32n';

        // CRITICAL FIX: Convert dB to Gain (Velocity)
        // audioParams.volume is in dB (e.g. -10). Instruments expects 0-1.
        // Formula: gain = 10 ^ (db / 20)
        let velocity = Math.pow(10, audioParams.volume / 20);

        // Clamp just in case
        if (velocity > 1) velocity = 1;
        if (velocity < 0) velocity = 0;

        // Play
        this.instruments.play(
            audioParams.category,
            noteToPlay,
            duration,
            { volume: velocity, time: '+' + humanize }
        );

        // Logging
        if (this.onSoundPlayed) {
            this.onSoundPlayed({
                note: noteToPlay,
                satellite: satellite.name,
                reason: audioParams.triggerRule || `Flow: ${this.harmonyManager.currentMood}`
            });
        }

        this.lastTriggerTime.set(satId, now);
        this.eventCounter++;
    }

    generateExplanation(sat, params, note) {
        // Use the rule-based explanation
        const rule = params.triggerRule || "PERIODIC";
        const detail = params.triggerDetail || `ALT: ${sat.position.altitude.toFixed(0)}km`;
        return `${rule} | ${detail}`;
    }

    // Preset switching
    setPreset(presetName) {
        if (this.instruments) {
            this.instruments.setPreset(presetName);
        }
    }

    // Scale changing
    setScale(key, mode) {
        if (this.scaleTheory) {
            this.scaleTheory.setKey(key);
            this.scaleTheory.setMode(mode);
            // console.log(`🎼 Scale changed to: ${key} ${mode}`); // Too verbose
        }
    }

    updateStats() {
        const now = Date.now();
        const elapsed = now - this.lastStatsUpdate;

        if (elapsed >= 1000) {
            this.stats.eventsPerSecond = this.eventCounter;
            this.eventCounter = 0;
            this.lastStatsUpdate = now;
            this.stats.voiceCount = (this.instruments && this.instruments.getVoiceCount()) || this.stats.eventsPerSecond;
        }
    }

    setMasterVolume(value) {
        this.masterVolume = value;
        const db = (value / 100) * 60 - 60;
        if (this.instruments) this.instruments.setMasterVolume(db);
    }

    setReverbDepth(value) {
        this.reverbDepth = value;
        if (this.instruments) this.instruments.setReverbMix(value / 100);
    }

    setDelayDepth(value) {
        this.delayDepth = value;
        if (this.instruments) this.instruments.setDelayMix(value / 100);
    }

    playSelectionSound() {
        if (!this.instruments || !this.isPlaying) return;
        // Manual click volume is explicitly 0.8 (Gain), so it works.
        this.instruments.play('SCIENCE', 'C6', '32n', { volume: 0.8 });
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            isPlaying: this.isPlaying,
            masterVolume: this.masterVolume,
            reverbDepth: this.reverbDepth,
            delayDepth: this.delayDepth,
            stats: this.stats,
            conductorState: (this.aiConductor && this.aiConductor.getState()) || null
        };
    }

    getStats() {
        return this.stats;
    }

    pause() { this.isPlaying = false; }
    resume() { this.isPlaying = true; }

    stopAll() {
        if (this.instruments) {
            for (const category of ['STATION', 'COMMUNICATION', 'NAVIGATION', 'WEATHER', 'SCIENCE', 'DEBRIS']) {
                this.instruments.release(category);
            }
        }
    }

    dispose() {
        this.stopAll();
        if (this.instruments) this.instruments.dispose();
        if (this.spatialAudio) this.spatialAudio.dispose();
        this.isInitialized = false;
    }
}

window.AudioEngine = AudioEngine;
