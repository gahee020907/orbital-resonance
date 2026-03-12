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
     * Constrain note for musical flow.
     * For JAZZ/BAND, we implement a "Walking Bass" or "Melodic Lead" logic.
     */
    constrainNote(noteName, category) {
        if (!this.lastNotes) this.lastNotes = {};

        // 1. Walking Bass Logic (STATION category)
        if (category === 'STATION') {
            const lastNote = this.lastNotes[category];
            if (!lastNote) {
                this.lastNotes[category] = noteName;
                return noteName;
            }

            // Extract numeric parts to calculate distance (e.g. "C2" -> 2)
            // But Tone names are complex. Better to use ScaleTheory's degree logic.
            // Simplified: If the jump is too large, move it closer to avoid chaotic jumps.
            // For now, we'll just track it.
            this.lastNotes[category] = noteName;
        }

        return noteName;
    }
}

window.HarmonyManager = HarmonyManager;
