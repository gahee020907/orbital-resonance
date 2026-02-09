/**
 * AIConductor.js
 * AI-driven harmony management and musical composition
 * Analyzes current sound state and adjusts for pleasing harmonics
 */

class AIConductor {
    constructor(scaleTheory) {
        this.scaleTheory = scaleTheory || new ScaleTheory();
        this.isEnabled = true;

        // Current state
        this.state = {
            activeNotes: [],
            dissonance: 0,
            currentChord: 'Unknown',
            mood: 'peaceful', // peaceful, building, climax, calm
            intensity: 0
        };

        // Thresholds
        this.config = {
            maxDissonance: 0.4,       // When to start adjusting notes
            targetDissonance: 0.25,   // Ideal dissonance level
            densityThreshold: 30,     // Number of active satellites for "climax"
            moodChangeDuration: 5000, // ms to transition between moods
        };

        // History for pattern detection
        this.history = {
            dissonance: [],
            density: [],
            notes: [],
            maxHistory: 100
        };

        // Scheduled adjustments
        this.adjustmentQueue = [];
    }

    /**
     * Main analysis function - call every frame
     * @param {Object} collective - Collective parameters from ParameterMapper
     * @returns {Object} Conductor recommendations
     */
    // Old analyze method removed to prevent duplication
    // Logic is now in the simplified analyze() at the bottom.

    /**
     * Update history buffers
     */
    updateHistory(dissonance, density, notes) {
        this.history.dissonance.push(dissonance);
        this.history.density.push(density);
        this.history.notes.push([...notes]);

        // Trim to max length
        if (this.history.dissonance.length > this.config.maxHistory) {
            this.history.dissonance.shift();
            this.history.density.shift();
            this.history.notes.shift();
        }
    }

    /**
     * Determine musical mood based on current state
     */
    determineMood(density, dissonance, intensity) {
        // Check for climax conditions
        if (density > this.config.densityThreshold && intensity > 0.7) {
            return 'climax';
        }

        // Check for building (increasing density/intensity)
        if (this.isBuilding()) {
            return 'building';
        }

        // Check for calm (decreasing intensity)
        if (this.isCalming()) {
            return 'calm';
        }

        // Default peaceful state
        if (dissonance < 0.3 && intensity < 0.4) {
            return 'peaceful';
        }

        return this.state.mood; // Maintain current mood
    }

    /**
     * Detect if intensity is building up
     */
    isBuilding() {
        if (this.history.density.length < 10) return false;

        const recent = this.history.density.slice(-10);
        const older = this.history.density.slice(-20, -10);

        if (older.length === 0) return false;

        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;

        return recentAvg > olderAvg * 1.2; // 20% increase
    }

    /**
     * Detect if intensity is calming down
     */
    isCalming() {
        if (this.history.density.length < 10) return false;

        const recent = this.history.density.slice(-10);
        const older = this.history.density.slice(-20, -10);

        if (older.length === 0) return false;

        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;

        return recentAvg < olderAvg * 0.8; // 20% decrease
    }

    /**
     * Detect special musical events
     */
    detectSpecialEvents() {
        const events = [];

        // Perfect fifth detection
        if (this.detectPerfectFifth()) {
            events.push({ type: 'perfect_fifth', message: '완전 5도 화성!' });
        }

        // Octave unison
        if (this.detectOctaveUnison()) {
            events.push({ type: 'octave_unison', message: '옥타브 유니즌!' });
        }

        // Low dissonance moment
        if (this.state.dissonance < 0.1 && this.state.activeNotes.length > 3) {
            events.push({ type: 'consonance', message: '순수한 화성' });
        }

        // High density event
        if (this.history.density[this.history.density.length - 1] >
            this.config.densityThreshold * 1.5) {
            events.push({ type: 'high_density', message: '위성 밀집!' });
        }

        return events;
    }

    /**
     * Detect perfect fifth interval in current notes
     */
    detectPerfectFifth() {
        const notes = this.state.activeNotes;
        if (notes.length < 2) return false;

        for (let i = 0; i < notes.length; i++) {
            for (let j = i + 1; j < notes.length; j++) {
                const midi1 = this.scaleTheory.noteToMidi(notes[i]);
                const midi2 = this.scaleTheory.noteToMidi(notes[j]);
                const interval = Math.abs(midi1 - midi2) % 12;

                if (interval === 7) return true; // Perfect fifth
            }
        }

        return false;
    }

    /**
     * Detect octave unison in current notes
     */
    detectOctaveUnison() {
        const notes = this.state.activeNotes;
        if (notes.length < 2) return false;

        for (let i = 0; i < notes.length; i++) {
            for (let j = i + 1; j < notes.length; j++) {
                const midi1 = this.scaleTheory.noteToMidi(notes[i]);
                const midi2 = this.scaleTheory.noteToMidi(notes[j]);
                const interval = Math.abs(midi1 - midi2);

                if (interval === 12) return true; // Octave
            }
        }

        return false;
    }

    /**
     * Get recommendations for UI display
     */
    getRecommendations() {
        const recs = [];

        if (this.state.dissonance > 0.6) {
            recs.push('더 평화로운 스케일로 전환 추천');
        }

        if (this.state.mood === 'climax') {
            recs.push('클라이맥스 도달 - 위성 필터 조정 추천');
        }

        if (this.state.activeNotes.length > 10) {
            recs.push('많은 음성 - 성능 최적화 모드 추천');
        }

        return recs;
    }

    /**
     * Get mood-specific scale recommendation
     * Orbital Harmony:
     * - Peaceful (Low density) -> Lydian (Space wonder)
     * - Building (Med density) -> Major (Hopeful)
     * - Climax (High density) -> Minor (Dramatic gravity)
     */
    getMoodScale() {
        const moodScales = {
            peaceful: 'lydian',
            building: 'major',
            climax: 'minor',
            calm: 'dorian'
        };

        return moodScales[this.state.mood] || 'major';
    }

    startConducting() {
        if (this.isConducting) return;
        this.isConducting = true;

        // CHORD PROGRESSION WALKER (Interstellar / Epic)
        // A slowly evolving sequence of chords to ground the random melody.
        // Scale: D Lydian (D, E, F#, G#, A, B, C#)
        // Chords: Dmaj7, E6, Bm7, F#m7
        const progression = [
            ['D', 'F#', 'A', 'C#'], // I (Dmaj7) - Home
            ['E', 'G#', 'B', 'D'],  // II (E7) - Lydian brightness
            ['B', 'D', 'F#', 'A'],  // vi (Bm7) - Melancholy
            ['F#', 'A', 'C#', 'E']  // iii (F#m7) - Deep
        ];

        // Change chord every 8 seconds (2 measures)
        this.chordIndex = 0;
        this.currentChordNotes = progression[0];

        setInterval(() => {
            this.chordIndex = (this.chordIndex + 1) % progression.length;
            this.currentChordNotes = progression[this.chordIndex];
            // console.log(`🎼 Harmony changed to: Chd ${this.chordIndex + 1}`);
        }, 8000);
    }

    analyze(collectiveAudioParams) {
        // Just return current state for now, logic moved to Walker
        return {
            mood: this.state.mood, // FIX: Use this.state.mood, not this.currentMood
            dissonance: 0,
            shiftRequired: false,
            allowedNotes: this.currentChordNotes
        };
    }
    /**
     * Get mood-specific tempo multiplier
     */
    getMoodTempo() {
        const moodTempos = {
            peaceful: 0.8,
            building: 1.2,
            climax: 1.5,
            calm: 0.6
        };

        return moodTempos[this.state.mood] || 1.0;
    }

    /**
     * Get mood-specific reverb recommendation
     */
    getMoodReverb() {
        const moodReverbs = {
            peaceful: 0.7,
            building: 0.5,
            climax: 0.3,
            calm: 0.9
        };

        return moodReverbs[this.state.mood] || 0.5;
    }

    /**
     * Enable/disable AI conductor
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    /**
     * Get current state for UI display
     */
    getState() {
        return {
            ...this.state,
            isEnabled: this.isEnabled,
            recommendations: this.getRecommendations(),
            suggestedScale: this.getMoodScale(),
            suggestedTempo: this.getMoodTempo(),
            suggestedReverb: this.getMoodReverb()
        };
    }

    /**
     * Reset conductor state
     */
    reset() {
        this.state = {
            activeNotes: [],
            dissonance: 0,
            currentChord: 'Unknown',
            mood: 'peaceful',
            intensity: 0
        };

        this.history = {
            dissonance: [],
            density: [],
            notes: [],
            maxHistory: 100
        };
    }
}

// Global instance
window.AIConductor = AIConductor;
