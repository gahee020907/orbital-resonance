/**
 * OrbitalMechanics.js
 * Helper functions for orbital mechanics calculations
 * Used for advanced features like proximity detection and collision prediction
 */

class OrbitalMechanics {
    constructor() {
        // Constants
        this.EARTH_RADIUS = 6371; // km
        this.GM = 398600.4418; // km^3/s^2 (Earth's gravitational parameter)
        this.J2 = 0.00108263; // Earth's oblateness coefficient
    }

    /**
     * Calculate distance between two ECI positions
     */
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Calculate relative velocity between two satellites
     */
    calculateRelativeVelocity(vel1, vel2) {
        const dvx = vel1.x - vel2.x;
        const dvy = vel1.y - vel2.y;
        const dvz = vel1.z - vel2.z;
        return Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);
    }

    /**
     * Check for close approaches between satellites
     * @param {Array} satellites - Array of satellites with positions
     * @param {number} threshold - Distance threshold in km
     * @returns {Array} Close approach events
     */
    detectCloseApproaches(satellites, threshold = 10) {
        const approaches = [];

        for (let i = 0; i < satellites.length; i++) {
            for (let j = i + 1; j < satellites.length; j++) {
                const sat1 = satellites[i];
                const sat2 = satellites[j];

                if (!sat1.position || !sat1.position.eciPosition || !sat2.position || !sat2.position.eciPosition) continue;

                const distance = this.calculateDistance(
                    sat1.position.eciPosition,
                    sat2.position.eciPosition
                );

                if (distance < threshold) {
                    const relVel = this.calculateRelativeVelocity(
                        sat1.position.eciVelocity,
                        sat2.position.eciVelocity
                    );

                    approaches.push({
                        sat1: sat1.name,
                        sat2: sat2.name,
                        distance: distance,
                        relativeVelocity: relVel,
                        severity: this.calculateSeverity(distance, relVel)
                    });
                }
            }
        }

        return approaches.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Calculate collision severity score (0-1)
     */
    calculateSeverity(distance, relVel) {
        const distanceScore = Math.max(0, 1 - distance / 10); // 10km threshold
        const velScore = Math.min(1, relVel / 10); // Higher relative velocity = more dangerous
        return distanceScore * 0.6 + velScore * 0.4;
    }

    /**
     * Convert geodetic (lat/lon/alt) to screen coordinates
     * Uses equirectangular projection for 2D view
     */
    geoToScreen(lat, lon, width, height) {
        const x = (lon + 180) / 360 * width;
        const y = (90 - lat) / 180 * height;
        return { x, y };
    }

    /**
     * Convert geodetic to 3D coordinates (for future 3D mode)
     */
    geoTo3D(lat, lon, altitude, scale = 1) {
        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;
        const r = (this.EARTH_RADIUS + altitude) * scale;

        const x = r * Math.cos(latRad) * Math.cos(lonRad);
        const y = r * Math.sin(latRad);
        const z = r * Math.cos(latRad) * Math.sin(lonRad);

        return { x, y, z };
    }

    /**
     * Convert ECI to screen coordinates (orbital view)
     * Projects the 3D orbit onto 2D canvas
     */
    eciToScreen(eciPos, width, height, rotation = 0, zoom = 1) {
        // Simple projection: view from above (top-down)
        const scale = Math.min(width, height) / 50000 * zoom; // Adjust scale

        const x = eciPos.x * Math.cos(rotation) - eciPos.y * Math.sin(rotation);
        const y = eciPos.x * Math.sin(rotation) + eciPos.y * Math.cos(rotation);

        return {
            x: width / 2 + x * scale,
            y: height / 2 + y * scale,
            z: eciPos.z * scale // For depth-based rendering
        };
    }

    /**
     * Calculate orbital period from altitude
     */
    orbitalPeriod(altitude) {
        const a = this.EARTH_RADIUS + altitude; // Semi-major axis in km
        return 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / this.GM) / 60; // minutes
    }

    /**
     * Calculate orbital velocity from altitude
     */
    orbitalVelocity(altitude) {
        const r = this.EARTH_RADIUS + altitude;
        return Math.sqrt(this.GM / r); // km/s
    }

    /**
     * Calculate if satellite is in sunlight (simplified)
     */
    isInSunlight(eciPos, gmst) {
        // Simplified: satellite is in sunlight if it's on the sun-facing hemisphere
        // This is a very basic approximation
        const sunAngle = gmst * 15; // Rough approximation
        const satAngle = Math.atan2(eciPos.y, eciPos.x) * 180 / Math.PI;
        const angleDiff = Math.abs(sunAngle - satAngle);

        return angleDiff < 90 || angleDiff > 270;
    }

    /**
     * Get orbit type classification
     */
    getOrbitType(altitude) {
        if (altitude < 2000) return 'LEO'; // Low Earth Orbit
        if (altitude < 35786) return 'MEO'; // Medium Earth Orbit
        if (altitude < 36000) return 'GEO'; // Geosynchronous
        return 'HEO'; // High Earth Orbit
    }

    /**
     * Interpolate between two positions for smooth animation
     */
    interpolatePosition(pos1, pos2, t) {
        return {
            x: pos1.x + (pos2.x - pos1.x) * t,
            y: pos1.y + (pos2.y - pos1.y) * t,
            z: pos1.z + (pos2.z - pos1.z) * t
        };
    }

    /**
     * Calculate ground track (sub-satellite points)
     * Returns an array of lat/lon points for the orbit path
     */
    calculateGroundTrack(satrec, startTime, duration = 90, steps = 180) {
        const track = [];
        const interval = (duration * 60 * 1000) / steps; // ms between points

        for (let i = 0; i < steps; i++) {
            const time = new Date(startTime.getTime() + i * interval);

            try {
                const posVel = satellite.propagate(satrec, time);
                if (!posVel.position || typeof posVel.position === 'boolean') continue;

                const gmst = satellite.gstime(time);
                const gd = satellite.eciToGeodetic(posVel.position, gmst);

                track.push({
                    lat: satellite.degreesLat(gd.latitude),
                    lon: satellite.degreesLong(gd.longitude),
                    alt: gd.height,
                    time: time
                });

            } catch (e) {
                // Skip invalid points
            }
        }

        return track;
    }
}

// Global instance
window.OrbitalMechanics = OrbitalMechanics;
