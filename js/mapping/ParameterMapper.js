/**
 * ParameterMapper.js
 * RULE-BASED TRIGGER SYSTEM
 * Clear, predictable rules for when sounds play
 */

class ParameterMapper {
    constructor(scaleTheory) {
        this.scaleTheory = scaleTheory || new ScaleTheory();

        // Track previous states for detecting crossings
        this.previousStates = new Map();

        // TRIGGER RULES - Clear and observable
        this.triggerRules = {
            // Rule 1: Grid Crossing (Major 10-degree lines) - Frequent/Rhythmic
            gridCrossing: {
                enabled: true,
                spacing: 10,
                name: "GRID CROSSING"
            },
            // Rule 2: Entering/exiting screen (Visual correlation)
            screenBoundary: {
                enabled: true,
                name: "ENTERED SCREEN"
            },
            // Rule 3: Zone Change (Rare, significant)
            zoneChange: {
                enabled: true,
                zones: [
                    { name: "LEO", min: 0, max: 2000 },
                    { name: "MEO", min: 2000, max: 20000 },
                    { name: "GEO", min: 20000, max: 50000 }
                ],
                name: "ZONE CHANGE"
            },
            // Rule 4: Periodic Signal (Keep alive if quiet)
            periodic: {
                enabled: true,
                interval: 1000, // Frequent Beacons (was 2000)
                name: "BEACON SIGNAL"
            }
        };

        // Category configurations
        this.categoryConfig = {
            STATION: { baseVolume: -3, priority: 1 },
            COMMUNICATION: { baseVolume: -12, priority: 5 },
            NAVIGATION: { baseVolume: -8, priority: 3 },
            WEATHER: { baseVolume: -10, priority: 4 },
            SCIENCE: { baseVolume: -6, priority: 2 },
            DEBRIS: { baseVolume: -18, priority: 6 }
        };
    }

    /**
     * Check all trigger rules for a satellite
     */
    checkTriggerRules(satellite) {
        const satId = satellite.noradId || satellite.name;
        const pos = satellite.position;
        if (!pos) return { shouldTrigger: false, rule: null };

        const prevState = this.previousStates.get(satId) || {
            longitude: pos.longitude,
            latitude: pos.latitude,
            altitude: pos.altitude,
            wasOnScreen: false,
            lastBeacon: 0
        };

        let triggered = false;
        let ruleName = null;
        let ruleDetail = null;

        // Rule 1: Grid Crossing (Lat/Lon grid lines)
        if (this.triggerRules.gridCrossing.enabled) {
            const spacing = this.triggerRules.gridCrossing.spacing;

            // Check Longitude Grid
            const prevLonGrid = Math.floor(prevState.longitude / spacing);
            const currLonGrid = Math.floor(pos.longitude / spacing);

            // Check Latitude Grid
            const prevLatGrid = Math.floor(prevState.latitude / spacing);
            const currLatGrid = Math.floor(pos.latitude / spacing);

            if (prevLonGrid !== currLonGrid) {
                triggered = true;
                ruleName = "GRID LINE (LON)";
                ruleDetail = `${currLonGrid * spacing}° E`;
            } else if (prevLatGrid !== currLatGrid) {
                triggered = true;
                ruleName = "GRID LINE (LAT)";
                ruleDetail = `${currLatGrid * spacing}° N`;
            }
        }

        // Rule 2: Screen Entry
        if (this.triggerRules.screenBoundary.enabled && !triggered) {
            const isOnScreen = Math.abs(pos.longitude) < 170 && Math.abs(pos.latitude) < 85;
            if (!prevState.wasOnScreen && isOnScreen) {
                triggered = true;
                ruleName = this.triggerRules.screenBoundary.name;
                ruleDetail = `Visual Contact`;
            }
            prevState.wasOnScreen = isOnScreen;
        }

        // Rule 3: Zone Change
        if (this.triggerRules.zoneChange.enabled && !triggered) {
            const zones = this.triggerRules.zoneChange.zones;
            const prevZone = this.getZone(prevState.altitude, zones);
            const currZone = this.getZone(pos.altitude, zones);
            if (prevZone !== currZone) {
                triggered = true;
                ruleName = this.triggerRules.zoneChange.name;
                ruleDetail = `${prevZone} → ${currZone}`;
            }
        }

        // Rule 4: Periodic Beacon (for consistent ambient activity)
        if (!triggered && this.triggerRules.periodic.enabled) {
            const lastBeacon = prevState.lastBeacon || 0;
            const now = Date.now();
            // Random jitter to prevent synchronized robotic pulsing
            const interval = this.triggerRules.periodic.interval + (Math.random() * 1000);

            if (now - lastBeacon > interval && Math.random() < 0.1) { // 10% chance per tick if interval passed
                triggered = true;
                ruleName = this.triggerRules.periodic.name;
                ruleDetail = "Keep-alive Signal";
                prevState.lastBeacon = now;
            } else if (!prevState.lastBeacon) {
                prevState.lastBeacon = now;
            }
        } else if (triggered) {
            // Reset beacon timer on actual trigger
            prevState.lastBeacon = Date.now();
        }

        // Update previous state
        this.previousStates.set(satId, {
            longitude: pos.longitude,
            latitude: pos.latitude,
            altitude: pos.altitude,
            wasOnScreen: prevState.wasOnScreen,
            lastBeacon: prevState.lastBeacon
        });

        return {
            shouldTrigger: triggered,
            rule: ruleName,
            detail: ruleDetail
        };
    }

    getZone(altitude, zones) {
        for (const z of zones) {
            if (altitude >= z.min && altitude < z.max) return z.name;
        }
        return "DEEP";
    }

    /**
     * Map satellite data to complete audio parameters
     */
    /**
     * Map satellite data to complete audio parameters
     * HUMAN + NATURE + HARMONY ALGORITHM
     */
    mapToAudio(satellite) {
        const { position, category, normalizedVelocity, normalizedAltitude, period, gmst } = satellite;
        const config = this.categoryConfig[category] || this.categoryConfig.COMMUNICATION;

        // Check trigger rules
        const triggerResult = this.checkTriggerRules(satellite);

        // 1. HARMONY (The Note)
        // Calculate orbital phase (0-360) relative to Earth's rotation (GMST)
        // This makes the melody evolve as the Earth rotates
        let orbitalPhase = 0;
        if (position) {
            // Simple phase approximation from longitude + anomaly
            orbitalPhase = (position.longitude + 180) % 360;
        }

        // Get base note from phase (melody)
        let note = this.scaleTheory.phaseToNote(orbitalPhase, category);

        // Apply Kepler Octave Shift (period based)
        if (period) {
            // We can parse the note string to shift octave if needed, 
            // but phaseToNote already handles category-based octaves.
            // Let's rely on that for now to keep it clean, or modify phaseToNote to take period.
        }

        // 2. NATURE (The Texture)
        // Map altitude to Reverb (Space)
        const reverbMix = 0.1 + normalizedAltitude * 0.85;

        // Map velocity to Volume (Energy)
        const volumeDb = config.baseVolume - (normalizedAltitude * 10);

        // 3. HUMAN ( The Space)
        // Stereo Panning from Longitude
        let pan = 0;
        if (position) {
            pan = position.longitude / 180;
            pan = Math.max(-1, Math.min(1, pan));
        }

        return {
            note: note,
            frequency: this.scaleTheory.noteToFrequency(note),
            volume: volumeDb,
            pan: pan,
            reverbMix: reverbMix,

            // Rule-based trigger
            shouldTrigger: triggerResult.shouldTrigger,
            triggerRule: triggerResult.rule,
            triggerDetail: triggerResult.detail,

            // Metadata
            category: category,
            satelliteName: satellite.name
        };
    }

    /**
     * Map satellite data to visual parameters
     */
    mapToVisual(satellite) {
        const { position, category, normalizedVelocity, normalizedAltitude } = satellite;

        const categoryColors = {
            STATION: { r: 255, g: 255, b: 255 },
            COMMUNICATION: { r: 245, g: 166, b: 35 },
            NAVIGATION: { r: 78, g: 205, b: 196 },
            WEATHER: { r: 168, g: 230, b: 207 },
            SCIENCE: { r: 0, g: 212, b: 255 },
            DEBRIS: { r: 230, g: 57, b: 70 }
        };

        const color = categoryColors[category] || categoryColors.COMMUNICATION;

        // Map altitude to size
        let size = 2 + (1 - normalizedAltitude) * 6;
        if (category === 'STATION') size = 12;

        return {
            x: position ? position.longitude : 0,
            y: position ? position.latitude : 0,
            altitude: position ? position.altitude : 400,
            color: color,
            size: size,
            glowIntensity: 0.3 + normalizedVelocity * 0.7,
            trailOpacity: 0.8,
            pulseRate: 0.5 + normalizedVelocity * 2,
            eciPosition: position ? position.eciPosition : { x: 0, y: 0, z: 0 },
            category: category,
            satelliteName: satellite.name
        };
    }

    /**
     * Map multiple satellites for collective analysis
     */
    mapCollective(satellites) {
        const audioParams = satellites.map(sat => this.mapToAudio(sat));
        const activeNotes = audioParams.filter(p => p.shouldTrigger).map(p => p.note);
        const dissonance = this.scaleTheory.calculateDissonance(activeNotes);

        return {
            activeNotes: activeNotes,
            dissonance: dissonance,
            chord: this.scaleTheory.identifyChord(activeNotes),
            avgVelocity: satellites.reduce((sum, s) => sum + s.normalizedVelocity, 0) / satellites.length,
            avgAltitude: satellites.reduce((sum, s) => sum + s.normalizedAltitude, 0) / satellites.length,
            density: satellites.length,
            intensity: 0.5
        };
    }

    lerp(min, max, t) {
        return min + (max - min) * Math.max(0, Math.min(1, t));
    }
}

window.ParameterMapper = ParameterMapper;
