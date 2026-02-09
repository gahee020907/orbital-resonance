/**
 * SpatialAudio.js
 * Handles 3D spatial audio positioning
 * Places satellite sounds in stereo field based on their position
 */

class SpatialAudio {
    constructor() {
        this.panners = new Map(); // satellite ID -> Panner
        this.isInitialized = false;
    }

    /**
     * Initialize spatial audio system
     */
    initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('🔊 Spatial Audio initialized');
    }

    /**
     * Create or get panner for a satellite
     * @param {string} satId - Satellite identifier
     * @returns {Tone.Panner} Stereo panner
     */
    getPanner(satId) {
        if (!this.panners.has(satId)) {
            const panner = new Tone.Panner(0);
            this.panners.set(satId, panner);
        }
        return this.panners.get(satId);
    }

    /**
     * Update panner position based on satellite position
     * @param {string} satId - Satellite identifier
     * @param {number} longitude - Longitude (-180 to 180)
     */
    updatePosition(satId, longitude) {
        const panner = this.getPanner(satId);

        // Map longitude to pan (-1 to 1)
        const pan = Math.max(-1, Math.min(1, longitude / 180));
        panner.pan.value = pan;
    }

    /**
     * Set all panners based on satellite positions
     * @param {Array} satellites - Array of satellites with positions
     */
    updateAllPositions(satellites) {
        for (const sat of satellites) {
            if (sat.position && sat.position.longitude !== undefined) {
                this.updatePosition(sat.noradId || sat.name, sat.position.longitude);
            }
        }
    }

    /**
     * Get pan value for a longitude
     * @param {number} longitude - Longitude (-180 to 180)
     * @returns {number} Pan value (-1 to 1)
     */
    longitudeToPan(longitude) {
        return Math.max(-1, Math.min(1, longitude / 180));
    }

    /**
     * Cleanup unused panners
     * @param {Set} activeIds - Set of currently active satellite IDs
     */
    cleanupPanners(activeIds) {
        for (const [id, panner] of this.panners) {
            if (!activeIds.has(id)) {
                panner.dispose();
                this.panners.delete(id);
            }
        }
    }

    /**
     * Dispose all panners
     */
    dispose() {
        for (const panner of this.panners.values()) {
            panner.dispose();
        }
        this.panners.clear();
        this.isInitialized = false;
    }
}

// Global instance
window.SpatialAudio = SpatialAudio;
