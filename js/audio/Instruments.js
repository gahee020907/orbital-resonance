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
            decay: 2.5,
            preDelay: 0.1,
            wet: 0.35
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

        // PRESET 2: DEEP SPACE (Ambience & Mystery)
        // Replaces "Realism" with a high-end cinematic soundscape

        // 1. Foundation: Deep Drone (AM Synth)
        const drone = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 2.5,
            oscillator: { type: "sine" },
            envelope: { attack: 2, decay: 3, sustain: 0.5, release: 8 }, // Long fade out
            modulation: { type: "square", volume: -10 },
            volume: -10
        }).connect(this.masterOut);

        // 2. Signals: Glassy Chimes (FM Synth)
        const chime = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3.01, // Non-integer for metallic sound
            modulationIndex: 10,
            oscillator: { type: "sine" },
            envelope: { attack: 0.05, decay: 0.5, sustain: 0, release: 3 }, // Echoes
            modulation: { type: "triangle" },
            volume: -14
        }).connect(this.masterOut);

        // 3. Texture: Cosmic Wind (Noise with Filter)
        const wind = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 1, decay: 2, sustain: 0 },
            volume: -20
        }).connect(new Tone.Filter(400, "lowpass").connect(this.masterOut));

        this.presets.realism = {
            STATION: drone,      // Deep hum for heavy stations
            COMMUNICATION: chime,// Clear signals for comms
            NAVIGATION: chime,   // Clear signals for GPS
            WEATHER: drone,     // Deep hum for weather
            SCIENCE: wind,       // Mysterious wind for science
            DEBRIS: wind         // Wind for debris
        };

        // PRESET 3: JAZZ (Real Samples - Piano, Bass, Saxophone, Xylophone)
        const sampleBase = "https://nbrosowsky.github.io/tonejs-instruments/samples/";

        // Jazz Piano (Real Samples)
        const jazzPiano = new Tone.Sampler({
            urls: { C3: "C3.mp3", C4: "C4.mp3", C5: "C5.mp3", A3: "A3.mp3", A4: "A4.mp3" },
            baseUrl: sampleBase + "piano/",
            release: 1.5,
            volume: -8,
            onload: () => console.log("🎹 Jazz Piano samples loaded")
        }).connect(this.masterOut);

        // Contrabass (Walking Bass)
        const contrabass = new Tone.Sampler({
            urls: { A1: "A1.mp3", C2: "C2.mp3", E2: "E2.mp3", A2: "A2.mp3", C3: "C3.mp3" },
            baseUrl: sampleBase + "contrabass/",
            release: 0.8,
            volume: -6,
            onload: () => console.log("🎸 Contrabass samples loaded")
        }).connect(this.masterOut);

        // Saxophone
        const saxophone = new Tone.Sampler({
            urls: { C3: "C3.mp3", E3: "E3.mp3", A3: "A3.mp3", C4: "C4.mp3", E4: "E4.mp3", A4: "A4.mp3" },
            baseUrl: sampleBase + "saxophone/",
            release: 1,
            volume: -10,
            onload: () => console.log("🎷 Saxophone samples loaded")
        }).connect(this.masterOut);

        // Xylophone (Percussion melody)
        const xylophone = new Tone.Sampler({
            urls: { C4: "C4.mp3", E4: "E4.mp3", G4: "G4.mp3", C5: "C5.mp3", E5: "E5.mp3" },
            baseUrl: sampleBase + "xylophone/",
            release: 0.5,
            volume: -12,
            onload: () => console.log("🔔 Xylophone samples loaded")
        }).connect(this.masterOut);

        // Brush hit (keep synth - no good sample for this)
        const brushHit = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.002, decay: 0.15, sustain: 0 },
            volume: -22
        }).connect(new Tone.Filter(6000, "highpass").connect(this.masterOut));

        this.presets.jazz = {
            STATION: contrabass,       // Walking bass
            COMMUNICATION: jazzPiano,  // Piano comping
            NAVIGATION: saxophone,     // Sax melody
            WEATHER: jazzPiano,        // Piano fill
            SCIENCE: xylophone,        // Xylophone sparkle
            DEBRIS: brushHit           // Brush texture
        };

        // PRESET 4: BAND (Real Samples - Electric Guitar, Bass, Trumpet)

        // Electric Guitar
        const electricGuitar = new Tone.Sampler({
            urls: { A2: "A2.mp3", C3: "C3.mp3", E3: "E3.mp3", A3: "A3.mp3", C4: "C4.mp3", E4: "E4.mp3" },
            baseUrl: sampleBase + "guitar-electric/",
            release: 0.8,
            volume: -8,
            onload: () => console.log("🎸 Electric Guitar samples loaded")
        }).connect(new Tone.Distortion(0.3).connect(this.masterOut));

        // Electric Bass
        const electricBass = new Tone.Sampler({
            urls: { A1: "A1.mp3", C2: "C2.mp3", E2: "E2.mp3", A2: "A2.mp3", C3: "C3.mp3" },
            baseUrl: sampleBase + "bass-electric/",
            release: 0.5,
            volume: -6,
            onload: () => console.log("🎸 Electric Bass samples loaded")
        }).connect(this.masterOut);

        // Trumpet (Lead)
        const trumpet = new Tone.Sampler({
            urls: { C3: "C3.mp3", E3: "E3.mp3", A3: "A3.mp3", C4: "C4.mp3", E4: "E4.mp3", A4: "A4.mp3" },
            baseUrl: sampleBase + "trumpet/",
            release: 1,
            volume: -10,
            onload: () => console.log("🎺 Trumpet samples loaded")
        }).connect(this.masterOut);

        // Snare (keep synth)
        const snareHit = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
            volume: -18
        }).connect(new Tone.Filter(3000, "bandpass").connect(this.masterOut));

        this.presets.band = {
            STATION: electricBass,      // Heavy bass
            COMMUNICATION: electricGuitar, // Distorted guitar
            NAVIGATION: trumpet,        // Trumpet lead
            WEATHER: electricGuitar,    // Guitar riff
            SCIENCE: trumpet,           // Trumpet solo
            DEBRIS: snareHit            // Snare hit
        };

        this.customSynths = [
            crystalSynth, bellSynth, sparkleSynth,   // Cosmic
            drone, chime, wind,                        // Realism
            jazzPiano, contrabass, saxophone, xylophone, brushHit, // Jazz
            electricGuitar, electricBass, trumpet, snareHit  // Band
        ];
    }

    setPreset(presetName) {
        if (!this.presets[presetName]) return;
        this.currentPreset = presetName;
        console.log(`🎵 Preset changed to: ${presetName}`);

        // DRAMATICALLY different effects per preset
        if (presetName === 'cosmic') {
            this.setReverbMix(0.5);
            this.setDelayMix(0.2);
            if (this.chorus) this.chorus.wet.value = 0.3;
            if (this.reverb) this.reverb.decay = 2.5;
        } else if (presetName === 'realism') {
            this.setReverbMix(0.7);
            this.setDelayMix(0.1);
            if (this.chorus) this.chorus.wet.value = 0.1;
            if (this.reverb) this.reverb.decay = 4;
        } else if (presetName === 'jazz') {
            this.setReverbMix(0.3);
            this.setDelayMix(0.35);  // Swing-like delay
            if (this.chorus) this.chorus.wet.value = 0.4;
            if (this.delay) this.delay.delayTime.value = 0.3; // Dotted feel
            if (this.reverb) this.reverb.decay = 1.5; // Tight room
        } else if (presetName === 'band') {
            this.setReverbMix(0.1);   // Very dry
            this.setDelayMix(0.05);   // Almost no delay
            if (this.chorus) this.chorus.wet.value = 0.05;
            if (this.reverb) this.reverb.decay = 0.8; // Tiny room
        }
    }

    play(category, note, duration, options = {}) {
        if (!this.presets[this.currentPreset]) return;

        const source = this.presets[this.currentPreset][category];
        if (!source) return;

        // Velocity Dynamics
        let velocity = (options.volume || 1);
        velocity = Math.pow(velocity, 0.7);
        if (velocity > 1) velocity = 1;

        // Duration per preset - each feels different
        let effectiveDuration = duration;
        if (this.currentPreset === 'cosmic') {
            effectiveDuration = 2.5; // Long, ethereal
        } else if (this.currentPreset === 'realism') {
            effectiveDuration = 1.5; // Medium drone
        } else if (this.currentPreset === 'jazz') {
            effectiveDuration = 0.6; // Short, staccato like comping
        } else if (this.currentPreset === 'band') {
            effectiveDuration = 0.3; // Punchy, tight hits
        }

        try {
            // NoiseSynth does NOT accept a note parameter
            if (source instanceof Tone.NoiseSynth) {
                source.triggerAttackRelease(effectiveDuration, options.time, velocity);
            } else if (source.triggerAttackRelease) {
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
        if (this.customSynths) this.customSynths.forEach(s => s.dispose());

        if (this.reverb) this.reverb.dispose();
        if (this.delay) this.delay.dispose();
        if (this.chorus) this.chorus.dispose();
        if (this.limiter) this.limiter.dispose();
    }
}

window.Instruments = Instruments;
