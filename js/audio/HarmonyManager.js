/**
 * HarmonyManager.js (Refactored for "Ethereal Flow")
 * Replaces the rigid chord sequencer with a "Mood Manager".
 * Controls Global Density, Tension, and Texture.
 */

class HarmonyManager {
    constructor(scaleTheory) {
        this.scaleTheory = scaleTheory;
        this.isInitialized = false;

        // "Moods" are probability weights, not chord progressions
        this.moods = {
            'void': { density: 0.1, tension: 0.1, scale: 'cosmic' },    // Empty, beautiful
            'cluster': { density: 0.4, tension: 0.3, scale: 'cosmic' }, // More activity
            'storm': { density: 0.8, tension: 0.8, scale: 'deep_space' } // Chaotic
        };

        this.currentMood = 'void';

        // Evolving Modulation
        // Slowly drift the "Center Pitch" to avoid static boredom
        this.centerPitchClass = 2; // D
        this.lastModulationTime = 0;
    }

    initialize() {
        if (this.isInitialized) return;

        // No more Tone.Transport loop.
        // We let the physics engine drive the rhythm.

        this.isInitialized = true;
        console.log("🌊 HarmonyManager (Flow Mode) Initialized");
    }

    /**
     * Get the current Probability that a satellite should play.
     * Replaces "Quantization Grid".
     */
    getDensity() {
        return this.moods[this.currentMood].density;
    }

    /**
     * Should we modulate to a new key?
     * Very slow drift (every ~30 seconds)
     */
    update(now) {
        if (now - this.lastModulationTime > 30000) {
            // cycle of fifths or random neighbor
            // logic here
            this.lastModulationTime = now;
            // console.log("Drifting harmony...");
        }
    }

    /**
     * Constrain note - but "Softly".
     * Instead of forcing it, we might shift it by an octave or slight detune
     * to create texture.
     */
    constrainNote(noteName) {
        // For "Ethereal Flow", we trust ScaleTheory's generic mapping
        // but maybe force high octaves for specific moods
        return noteName;
    }
}

window.HarmonyManager = HarmonyManager;
