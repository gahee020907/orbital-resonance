/**
 * ScaleTheory.js
 * Music theory utilities for mapping data to musical parameters
 */

class ScaleTheory {
    constructor() {
        // Musical scales (semitone intervals from root)
        this.scales = {
            // Peaceful, ambient scales
            pentatonic: [0, 2, 4, 7, 9],           // Major pentatonic
            minorPentatonic: [0, 3, 5, 7, 10],     // Minor pentatonic

            // Full diatonic scales
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],         // Natural minor

            // Atmospheric/ambient scales
            wholeTone: [0, 2, 4, 6, 8, 10],        // Dreamy, floaty
            harmonicMinor: [0, 2, 3, 5, 7, 8, 11], // Exotic

            // Space-like scales
            lydian: [0, 2, 4, 6, 7, 9, 11],        // Bright, floating
            dorian: [0, 2, 3, 5, 7, 9, 10],        // Neutral, spacey

            // CUSTOM COSMIC SCALES (Ethereal)
            // Lydian #2 (#9) = [0, 3, 4, 6, 7, 11] ? No, let's do:
            // C, D, E, F#, G, A, B (Lydian)
            // Add D# (#9) for mystery? -> C, D, D#, E, F#, G, A, B
            // Let's use a "Pelog-like" or "Messiaen" subset for maximum space vide

            cosmic: [0, 2, 4, 6, 7, 9, 11], // Standard Lydian is best for "Sublime"
            deep_space: [0, 2, 3, 7, 8, 11], // Hexatonic Minor
            prototype: [0, 2, 4, 6, 8, 10]   // Whole Tone (Floating)
        };

        // Note names
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // Octave ranges by satellite category
        this.octaveRanges = {
            STATION: [1, 2],      // Deep bass
            COMMUNICATION: [4, 5], // Shimmer
            NAVIGATION: [4, 6],    // High
            WEATHER: [3, 5],       // Mid
            SCIENCE: [5, 6],       // Sparkles
            DEBRIS: [6, 7]         // Glitch
        };

        // Current scale and key
        this.currentScale = 'cosmic'; // Lydian default
        this.currentKey = 2; // D (D Lydian = Bright but deep)

        // Consonance values for intervals
        this.consonance = {
            0: 1.0,   // Unison
            1: 0.1,   // Minor 2nd (dissonant)
            2: 0.4,   // Major 2nd
            3: 0.8,   // Minor 3rd
            4: 0.8,   // Major 3rd
            5: 0.9,   // Perfect 4th
            6: 0.2,   // Tritone (most dissonant)
            7: 1.0,   // Perfect 5th
            8: 0.7,   // Minor 6th
            9: 0.7,   // Major 6th
            10: 0.5,  // Minor 7th
            11: 0.3   // Major 7th
        };
    }

    /**
     * Set the current scale and key
     */
    setScale(scaleName, keyNote = 'C') {
        if (this.scales[scaleName]) {
            this.currentScale = scaleName;
        }

        const keyIndex = this.noteNames.indexOf(keyNote);
        if (keyIndex !== -1) {
            this.currentKey = keyIndex;
        }
    }

    /**
     * Set key only (for UI callback)
     */
    setKey(keyNote) {
        const keyIndex = this.noteNames.indexOf(keyNote);
        if (keyIndex !== -1) {
            this.currentKey = keyIndex;
        }
    }

    /**
     * Set mode/scale only (for UI callback)
     */
    setMode(modeName) {
        if (this.scales[modeName]) {
            this.currentScale = modeName;
        }
    }

    /**
     * Map orbital phase (0-360 degrees) to a note in the scale
     * This creates a melody based on position in orbit, not just speed.
     */
    phaseToNote(phase, category) {
        const scale = this.scales[this.currentScale];
        // Quantize phase to scale steps
        // 360 degrees / scale length = degrees per note
        const scaleLength = scale.length;
        const noteIndex = Math.floor((phase / 360) * scaleLength) % scaleLength;

        // Get the actual note semitone based on current key and scale interval
        const semitone = (this.currentKey + scale[noteIndex]) % 12;
        const noteName = this.noteNames[semitone];

        // Octave shift based on category (Nature's Hierarchy)
        let octave = 4; // Default octave
        if (category === 'STATION') octave = 3; // Bass
        if (category === 'COMMUNICATION') octave = 5; // Mid
        if (category === 'SCIENCE') octave = 6; // High
        if (category === 'DEBRIS') octave = 7; // Sparkles

        return noteName + octave;
    }

    /**
     * Map orbital period (minutes) to octave offset
     * Kepler's Harmony: Longer period = Lower pitch
     */
    periodToOctave(period) {
        // LEO (~90min) -> 0 offset
        // GEO (~1440min) -> -2 offset
        if (period > 1000) return -2;
        if (period > 200) return -1;
        return 0;
    }

    /**
     * Map a normalized value (0-1) to a scale degree
     * @param {number} value - Normalized value between 0 and 1
     * @param {string} category - Satellite category for octave range
     * @returns {string} Note name with octave (e.g., "C4")
     */
    valueToNote(value, category = 'COMMUNICATION') {
        const scale = this.scales[this.currentScale];
        const octaves = this.octaveRanges[category] || [3, 4];

        // Calculate which octave
        const octaveRange = octaves[1] - octaves[0] + 1;
        const totalNotes = scale.length * octaveRange;

        // Map value to note index
        const noteIndex = Math.floor(value * totalNotes);
        const scaleIndex = noteIndex % scale.length;
        const octave = octaves[0] + Math.floor(noteIndex / scale.length);

        // Get the actual note
        const semitone = (this.currentKey + scale[scaleIndex]) % 12;
        const noteName = this.noteNames[semitone];

        return `${noteName}${Math.min(octave, octaves[1])}`;
    }

    /**
     * Get MIDI note number from note name
     */
    noteToMidi(noteName) {
        const match = noteName.match(/([A-G]#?)(\d)/);
        if (!match) return 60; // Default to middle C

        const note = match[1];
        const octave = parseInt(match[2]);
        const noteIndex = this.noteNames.indexOf(note);

        return (octave + 1) * 12 + noteIndex;
    }

    /**
     * Get frequency from note name
     */
    noteToFrequency(noteName) {
        const midi = this.noteToMidi(noteName);
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * Calculate dissonance score for a set of notes
     * @param {Array} notes - Array of note names
     * @returns {number} Dissonance score (0 = consonant, 1 = dissonant)
     */
    calculateDissonance(notes) {
        if (notes.length < 2) return 0;

        let totalDissonance = 0;
        let pairs = 0;

        for (let i = 0; i < notes.length; i++) {
            for (let j = i + 1; j < notes.length; j++) {
                const midi1 = this.noteToMidi(notes[i]);
                const midi2 = this.noteToMidi(notes[j]);
                const interval = Math.abs(midi1 - midi2) % 12;

                totalDissonance += 1 - this.consonance[interval];
                pairs++;
            }
        }

        return pairs > 0 ? totalDissonance / pairs : 0;
    }

    /**
     * Get notes for a chord degree (Roman Numeral)
     * e.g., 'i' in D Dorian -> [D, F, A]
     */
    getChordNotes(degreeStr) {
        const scale = this.scales[this.currentScale]; // [0, 2, 3, 5, 7, 9, 10] for Dorian
        const rootKey = this.currentKey; // D = 2

        // Parse Roman Numeral
        // i, ii, iii, iv, v, vi, vii (lower = minor, Upper = Major, 'dim' = diminished?)
        // Simple mapping: 1-based index
        const romeToNum = {
            'i': 0, 'I': 0,
            'ii': 1, 'II': 1,
            'iii': 2, 'III': 2,
            'iv': 3, 'IV': 3,
            'v': 4, 'V': 4,
            'vi': 5, 'VI': 5,
            'vii': 6, 'VII': 6
        };

        let degreeIndex = romeToNum[degreeStr] || 0;

        // Build a triad (1, 3, 5) relative to the scale degree
        // We use modular arithmetic on the scale array
        const indices = [
            degreeIndex,
            (degreeIndex + 2) % scale.length,
            (degreeIndex + 4) % scale.length
        ];

        // Convert to absolute semitones (Note Names)
        const notes = indices.map(i => {
            const interval = scale[i];
            const semitone = (rootKey + interval) % 12;
            return this.noteNames[semitone];
        });

        return notes;
    }

    /**
     * Get chord quality from a set of notes
     */
    identifyChord(notes) {
        if (notes.length < 3) return 'Unknown';

        const midis = notes.map(n => this.noteToMidi(n)).sort((a, b) => a - b);
        const rootMidi = midis[0];
        const intervals = midis.slice(1).map(m => (m - rootMidi) % 12).sort((a, b) => a - b);

        const root = this.noteNames[rootMidi % 12];

        // Check for common chord patterns
        const intervalStr = intervals.join(',');

        const chordPatterns = {
            '4,7': 'Major',
            '3,7': 'Minor',
            '4,7,11': 'Major 7',
            '3,7,10': 'Minor 7',
            '4,7,10': 'Dominant 7',
            '3,6': 'Diminished',
            '4,8': 'Augmented',
            '5,7': 'sus4',
            '2,7': 'sus2'
        };

        const quality = chordPatterns[intervalStr] || 'Cluster';
        return `${root} ${quality}`;
    }

    /**
     * Suggest octave shifts to reduce dissonance
     */
    suggestOctaveShifts(notes, maxDissonance = 0.4) {
        const currentDissonance = this.calculateDissonance(notes);

        if (currentDissonance <= maxDissonance) {
            return notes; // Already consonant enough
        }

        // Try shifting individual notes by octave
        const adjusted = [...notes];

        for (let i = 0; i < adjusted.length; i++) {
            const match = adjusted[i].match(/([A-G]#?)(\d)/);
            if (!match) continue;

            const note = match[1];
            const octave = parseInt(match[2]);

            // Try shifting up or down
            const options = [
                `${note}${octave - 1}`,
                `${note}${octave}`,
                `${note}${octave + 1}`
            ];

            let bestOption = adjusted[i];
            let bestDissonance = this.calculateDissonance(adjusted);

            for (const opt of options) {
                const test = [...adjusted];
                test[i] = opt;
                const testDissonance = this.calculateDissonance(test);

                if (testDissonance < bestDissonance) {
                    bestOption = opt;
                    bestDissonance = testDissonance;
                }
            }

            adjusted[i] = bestOption;
        }

        return adjusted;
    }

    /**
     * Get notes in the current scale
     */
    getScaleNotes(octave = 4) {
        const scale = this.scales[this.currentScale];
        return scale.map(interval => {
            const semitone = (this.currentKey + interval) % 12;
            return `${this.noteNames[semitone]}${octave}`;
        });
    }

    /**
     * Get a random note from current scale
     */
    getRandomNote(category = 'COMMUNICATION') {
        const scale = this.scales[this.currentScale];
        const octaves = this.octaveRanges[category];

        const scaleIndex = Math.floor(Math.random() * scale.length);
        const octave = octaves[0] + Math.floor(Math.random() * (octaves[1] - octaves[0] + 1));

        const semitone = (this.currentKey + scale[scaleIndex]) % 12;
        return `${this.noteNames[semitone]}${octave}`;
    }

    /**
     * Map harmony mode to scale
     */
    setHarmonyMode(mode) {
        const modeToScale = {
            'consonant': 'pentatonic',
            'pentatonic': 'minorPentatonic',
            'chaotic': 'chromatic',
            'ambient': 'wholeTone'
        };

        this.currentScale = modeToScale[mode] || 'pentatonic';
    }

    /**
     * Snap a potentially random note to the nearest note in the allowed list (Chord)
     */
    constrainToChord(note, allowedNotes) {
        if (!allowedNotes || allowedNotes.length === 0) return note;

        // Parse input note
        const match = note.match(/([A-G]#?)(\d)/);
        if (!match) return note;
        const noteName = match[1];
        const octave = parseInt(match[2]);
        const inputMidi = this.noteToMidi(note);

        // Find closest midi in allowedNotes across octaves
        let closestMidi = -1;
        let minDist = 999;

        // Check allowed notes in current octave, +/- 1 octave
        for (const allowedName of allowedNotes) {
            for (let o = octave - 1; o <= octave + 1; o++) {
                const targetMidi = this.noteToMidi(allowedName + o);
                const dist = Math.abs(targetMidi - inputMidi);
                if (dist < minDist) {
                    minDist = dist;
                    closestMidi = targetMidi;
                }
            }
        }

        // Convert back to note name
        const semitone = closestMidi % 12;
        const outNote = this.noteNames[semitone];
        const outOctave = Math.floor(closestMidi / 12) - 1;
        return `${outNote}${outOctave}`;
    }
}

// Global instance
window.ScaleTheory = ScaleTheory;
