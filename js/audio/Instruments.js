/**
 * Instruments.js - REAL SAMPLING VERSION
 * Uses high-quality samples from open-source libraries
 */

class Instruments {
    constructor() {
        this.instruments = {};
        this.presets = {};
        this.currentPreset = 'ambient';

        this.masterOut = null;
        this.reverb = null;
        this.delay = null;
        this.chorus = null;
        this.limiter = null;

        // Sample Libraries
        this.samples = {};
        this.isLoaded = false;
    }

    async initialize() {
        // Master Effects Chain
        this.limiter = new Tone.Limiter(-2).toDestination();

        this.reverb = new Tone.Reverb({
            decay: 6,
            preDelay: 0.1,
            wet: 0.5
        }).connect(this.limiter);
        await this.reverb.generate();

        this.delay = new Tone.PingPongDelay({
            delayTime: "8n",
            feedback: 0.3,
            wet: 0.2
        }).connect(this.reverb);

        this.chorus = new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.3
        }).connect(this.delay);

        // Start chorus LFO
        this.chorus.start();

        this.masterOut = this.chorus;

        // Load Samples
        console.log("🎻 Loading Instrument Samples...");
        await this.loadSamples();
        console.log("✅ Samples Loaded!");

        this.createPresets();
        this.setPreset('cosmic'); // DEFAULT
    }

    async loadSamples() {
        // No heavy samples needed for Synths! 
        // This makes startup instant.
        this.isLoaded = true;
        return Promise.resolve();
    }

    createPresets() {
        // PRESET 1: COSMIC (Pure Synths - formerly Chime)
        // FM Synth for Bell-like tones (Glassy)
        const crystalSynth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 2, sustain: 0, release: 2 },
            modulation: { type: "sine" },
            volume: -12
        }).connect(this.masterOut);

        // AM Synth for Soft Pulses (Warm)
        const bellSynth = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 4,
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 1, sustain: 0, release: 2 },
            modulation: { type: "sine" },
            volume: -12
        }).connect(this.masterOut);

        // High Sparkles
        const sparkleSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
            volume: -15
        }).connect(this.masterOut);

        this.presets.cosmic = {
            STATION: bellSynth,
            COMMUNICATION: crystalSynth,
            NAVIGATION: bellSynth,
            WEATHER: crystalSynth,
            SCIENCE: sparkleSynth,
            DEBRIS: sparkleSynth
        };

        // PRESET 2: REALISM (Telemetry)
        const telem1 = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 0.5, modulationIndex: 2, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }, volume: -6
        }).connect(this.masterOut);
        const telem2 = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 10, modulationIndex: 10, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.05 }, volume: -10
        }).connect(this.masterOut);
        const staticNoise = new Tone.NoiseSynth({ volume: -12 }).connect(this.masterOut);

        this.presets.realism = {
            STATION: telem1,
            COMMUNICATION: telem2,
            NAVIGATION: staticNoise,
            WEATHER: telem1,
            SCIENCE: telem2,
            DEBRIS: staticNoise
        };

        this.customSynths = [crystalSynth, bellSynth, sparkleSynth, telem1, telem2, staticNoise];
    }

    setPreset(presetName) {
        if (!this.presets[presetName]) return;
        this.currentPreset = presetName;
        console.log(`🎵 Preset changed to: ${presetName}`);

        // MUSICAL BEAUTY FIX: Adjust Params per Preset
        if (presetName === 'ambient') {
            this.setReverbMix(0.8); // Lush Reverb (Was 0.6)
            if (this.samples.piano) this.samples.piano.release = 6; // Long Sustain (Was 3)
            if (this.samples.cello) this.samples.cello.release = 5; // Long Bow
            if (this.samples.flute) this.samples.flute.release = 4;
        } else if (presetName === 'strings') {
            this.setReverbMix(0.6); // Concert Hall
            if (this.samples.violin) this.samples.violin.release = 3;
            if (this.samples.cello) this.samples.cello.release = 3;
            if (this.samples.guitar) this.samples.guitar.release = 3;
        } else if (presetName === 'gugak') {
            this.setReverbMix(0.3);
            if (this.samples.guitar) this.samples.guitar.release = 1.0; // Snappy
            if (this.samples.flute) this.samples.flute.release = 2;
        } else if (presetName === 'chime') {
            this.setReverbMix(0.5);
            // Synths handle their own envelopes
        }
    }

    play(category, note, duration, options = {}) {
        if (!this.presets[this.currentPreset]) return;

        const source = this.presets[this.currentPreset][category];
        if (!source) return;

        // Velocity Dynamics
        let velocity = (options.volume || 1);
        velocity = Math.pow(velocity, 0.7); // Less extreme curve
        if (velocity > 1) velocity = 1;

        // CLEAN FIX: Standard Durations
        // 4s was too long and caused mud.
        let effectiveDuration = duration;
        if (this.currentPreset === 'ambient') {
            effectiveDuration = 2.5; // Moderate sustain
        } else if (this.currentPreset === 'strings') {
            effectiveDuration = 1.5; // Defined bow strokes
        }

        try {
            // Check for both Sampler and Synth
            if (source.triggerAttackRelease) {
                source.triggerAttackRelease(note, effectiveDuration, options.time, velocity);
            }
        } catch (e) { }
    }

    setMasterVolume(db) {
        if (this.limiter) Tone.Destination.volume.value = db;
    }
    setReverbMix(mix) { if (this.reverb) this.reverb.wet.value = mix; }
    setDelayMix(mix) { if (this.delay) this.delay.wet.value = mix; }
    getVoiceCount() { return 0; }
    release(category) {
        const source = this.presets[this.currentPreset][category];
        if (source && source.releaseAll) source.releaseAll();
    }

    dispose() {
        // Dispose samples
        Object.values(this.samples).forEach(s => s.dispose());
        // Dispose synths
        this.customSynths?.forEach(s => s.dispose());

        this.reverb?.dispose();
        this.delay?.dispose();
        this.chorus?.dispose();
        this.limiter?.dispose();
    }
}

window.Instruments = Instruments;
