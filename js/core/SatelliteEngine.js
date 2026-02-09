/**
 * SatelliteEngine.js
 * Manages satellite data and real-time position calculations
 * Uses SGP4 propagator from satellite.js library
 */

class SatelliteEngine {
    constructor() {
        this.satellites = [];
        this.activeSatellites = [];
        this.dataFetcher = new DataFetcher();
        this.timeScale = 30; // Time acceleration factor
        this.baseTime = Date.now();
        this.simulatedTime = Date.now();
        this.isRunning = true;

        // Filters
        this.filters = {
            starlink: true,
            gps: true,
            iss: true,
            weather: true,
            science: true, // Enabled for visuals
            debris: true   // Enabled for visuals
        };

        // Statistics
        this.stats = {
            total: 0,
            visible: 0,
            byCategory: {}
        };
    }

    /**
     * Initialize the engine and load satellite data
     */
    async initialize() {
        console.log('🚀 Initializing Satellite Engine...');

        try {
            this.satellites = await this.dataFetcher.fetchAllGroups();
            this.updateStats();
            this.applyFilters();

            console.log(`✅ Satellite Engine initialized with ${this.satellites.length} satellites`);
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize Satellite Engine:', error);
            return false;
        }
    }

    /**
     * Update simulation time
     */
    update(deltaTime) {
        if (!this.isRunning) return;

        // Advance simulated time based on timeScale
        this.simulatedTime += deltaTime * this.timeScale;
    }

    /**
     * Get current simulated time as Date object
     */
    getCurrentTime() {
        return new Date(this.simulatedTime);
    }

    /**
     * Calculate position of a satellite at current simulated time
     * @param {Object} sat - Satellite object with satrec
     * @returns {Object} Position data or null if invalid
     */
    calculatePosition(sat) {
        if (!sat.satrec) return null;

        const now = this.getCurrentTime();

        try {
            // Get position and velocity in ECI coordinates
            const positionAndVelocity = satellite.propagate(sat.satrec, now);

            if (!positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
                return null;
            }

            const positionEci = positionAndVelocity.position;
            const velocityEci = positionAndVelocity.velocity;

            // Calculate GMST for coordinate conversion
            const gmst = satellite.gstime(now);

            // Convert ECI to geodetic (lat/lon/alt)
            const positionGd = satellite.eciToGeodetic(positionEci, gmst);

            // Convert to degrees
            const latitude = satellite.degreesLat(positionGd.latitude);
            const longitude = satellite.degreesLong(positionGd.longitude);
            const altitude = positionGd.height; // km

            // Calculate velocity magnitude
            const velocity = Math.sqrt(
                velocityEci.x ** 2 +
                velocityEci.y ** 2 +
                velocityEci.z ** 2
            ); // km/s

            // Calculate orbital period (minutes)
            const meanMotion = sat.satrec.no * 1440 / (2 * Math.PI); // rev/day
            const period = 1440 / meanMotion; // minutes

            return {
                latitude,
                longitude,
                altitude,
                velocity,
                period,
                eciPosition: positionEci,
                eciVelocity: velocityEci,
                gmst
            };

        } catch (error) {
            return null;
        }
    }

    /**
     * Get all active satellites with their current positions
     * @returns {Array} Satellites with position data
     */
    getActiveSatellitesWithPositions() {
        const result = [];

        for (const sat of this.activeSatellites) {
            const position = this.calculatePosition(sat);

            if (position) {
                result.push({
                    ...sat,
                    position: position,
                    // Pre-calculated mapping values
                    normalizedAltitude: this.normalizeAltitude(position.altitude),
                    normalizedVelocity: this.normalizeVelocity(position.velocity)
                });
            }
        }

        return result;
    }

    /**
     * Normalize altitude to 0-1 range
     * LEO: ~160-2000 km, MEO: ~2000-35786 km, GEO: ~35786 km
     */
    normalizeAltitude(altitude) {
        const minAlt = 150;  // km
        const maxAlt = 40000; // km
        return Math.max(0, Math.min(1, (altitude - minAlt) / (maxAlt - minAlt)));
    }

    /**
     * Normalize velocity to 0-1 range
     * LEO: ~7.8 km/s, GEO: ~3 km/s
     */
    normalizeVelocity(velocity) {
        const minVel = 2;  // km/s
        const maxVel = 8;  // km/s
        return Math.max(0, Math.min(1, (velocity - minVel) / (maxVel - minVel)));
    }

    /**
     * Apply category filters to satellite list
     */
    applyFilters() {
        this.activeSatellites = this.satellites.filter(sat => {
            switch (sat.category) {
                case 'COMMUNICATION': return this.filters.starlink;
                case 'NAVIGATION': return this.filters.gps;
                case 'STATION': return this.filters.iss;
                case 'WEATHER': return this.filters.weather;
                case 'SCIENCE': return this.filters.science;
                case 'DEBRIS': return this.filters.debris;
                default: return true;
            }
        });

        this.stats.visible = this.activeSatellites.length;
        console.log(`🎯 Active satellites: ${this.stats.visible}`);
    }

    /**
     * Set filter state
     */
    setFilter(category, enabled) {
        this.filters[category] = enabled;
        this.applyFilters();
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(1, Math.min(100, scale));
    }

    /**
     * Toggle simulation running state
     */
    toggleRunning() {
        this.isRunning = !this.isRunning;
        return this.isRunning;
    }

    /**
     * Reset simulation to current real time
     */
    reset() {
        this.simulatedTime = Date.now();
        this.baseTime = Date.now();
    }

    /**
     * Update statistics
     */
    updateStats() {
        this.stats.total = this.satellites.length;
        this.stats.byCategory = {};

        for (const sat of this.satellites) {
            const cat = sat.category;
            this.stats.byCategory[cat] = (this.stats.byCategory[cat] || 0) + 1;
        }
    }

    /**
     * Get statistics for UI display
     */
    getStats() {
        return {
            total: this.stats.total,
            visible: this.stats.visible,
            starlink: this.stats.byCategory.COMMUNICATION || 0,
            gps: this.stats.byCategory.NAVIGATION || 0,
            iss: this.stats.byCategory.STATION || 0,
            weather: this.stats.byCategory.WEATHER || 0,
            science: this.stats.byCategory.SCIENCE || 0,
            debris: this.stats.byCategory.DEBRIS || 0
        };
    }

    /**
     * Find satellite by NORAD ID
     */
    findById(noradId) {
        return this.satellites.find(sat => sat.noradId === noradId);
    }

    /**
     * Find satellites near a specific lat/lon
     */
    findNearPosition(lat, lon, radiusDegrees = 5) {
        return this.activeSatellites.filter(sat => {
            const pos = this.calculatePosition(sat);
            if (!pos) return false;

            const dLat = Math.abs(pos.latitude - lat);
            const dLon = Math.abs(pos.longitude - lon);

            return dLat < radiusDegrees && dLon < radiusDegrees;
        });
    }
}

// Global instance
window.SatelliteEngine = SatelliteEngine;
