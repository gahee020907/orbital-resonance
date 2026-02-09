/**
 * DataFetcher.js
 * Fetches TLE (Two-Line Element) data from CelesTrak API
 * Handles caching and parsing of satellite data
 */

class DataFetcher {
  constructor() {
    this.baseUrl = 'https://celestrak.org/NORAD/elements/gp.php';
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 60; // 1 hour
  }

  /**
   * Fetch TLE data for a specific satellite group
   * @param {string} group - Satellite group name (e.g., 'starlink', 'stations', 'gps-ops')
   * @returns {Promise<Array>} Array of satellite objects
   */
  async fetchGroup(group) {
    const cacheKey = group;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`📦 Using cached data for: ${group}`);
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}?GROUP=${group}&FORMAT=tle`;
      console.log(`🛰️ Fetching TLE data: ${group}`);

      // Robustness: 5s Timeout for Network Fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const satellites = this.parseTLE(text, group);

      this.cache.set(cacheKey, {
        data: satellites,
        timestamp: Date.now()
      });

      console.log(`✅ Loaded ${satellites.length} satellites from ${group}`);
      return satellites;

    } catch (error) {
      console.warn(`⚠️ Network/Timeout for ${group}:`, error);
      console.log(`🔄 Switching to FALLBACK DATA for ${group}`);
      return this.getFallbackData(group);
    }
  }

  /**
   * Parse TLE text format into satellite objects
   * @param {string} tleText - Raw TLE data
   * @param {string} group - Group name for categorization
   * @returns {Array} Parsed satellite objects
   */
  parseTLE(tleText, group) {
    const lines = tleText.trim().split('\n');
    const satellites = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 >= lines.length) break;

      const name = lines[i].trim();
      const line1 = lines[i + 1].trim();
      const line2 = lines[i + 2].trim();

      if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) {
        continue;
      }

      try {
        const satrec = satellite.twoline2satrec(line1, line2);

        if (satrec.error !== 0) {
          continue;
        }

        satellites.push({
          name: name,
          noradId: parseInt(line1.substring(2, 7)),
          line1: line1,
          line2: line2,
          satrec: satrec,
          group: group,
          category: this.categorize(name, group)
        });

      } catch (e) {
        // Skip invalid TLE entries
      }
    }

    return satellites;
  }

  /**
   * Categorize satellite for instrument assignment
   */
  categorize(name, group) {
    const nameLower = name.toLowerCase();

    if (group === 'stations' || nameLower.includes('iss')) {
      return 'STATION';
    }
    if (group === 'starlink' || nameLower.includes('starlink')) {
      return 'COMMUNICATION';
    }
    if (group === 'gps-ops' || nameLower.includes('gps') || nameLower.includes('navstar')) {
      return 'NAVIGATION';
    }
    if (group === 'weather' || nameLower.includes('noaa') || nameLower.includes('meteo')) {
      return 'WEATHER';
    }
    if (nameLower.includes('hubble') || nameLower.includes('webb') ||
      nameLower.includes('telescope') || nameLower.includes('science')) {
      return 'SCIENCE';
    }
    if (nameLower.includes('debris') || nameLower.includes('deb') ||
      nameLower.includes('r/b')) {
      return 'DEBRIS';
    }

    return 'COMMUNICATION'; // Default
  }

  /**
   * Fetch all satellite groups
   * @returns {Promise<Array>} All satellites combined
   */
  async fetchAllGroups() {
    const groups = [
      { name: 'stations', limit: 5 },      // ISS
      { name: 'starlink', limit: 3000 },   // MASSIVE CLOUD (Art Mode)
      { name: 'gps-ops', limit: 30 },      // GPS
      { name: 'weather', limit: 20 },      // NOAA
      { name: 'science', limit: 10 },      // Hubble etc
    ];

    const allSatellites = [];

    for (const group of groups) {
      try {
        let satellites;

        // REAL DATA MODE (User Request):
        // Fetch actual Celestrak data for Starlink, then slice to limit.
        // Removed "Art Mode" generic generator.
        satellites = await this.fetchGroup(group.name);

        // Shuffle to avoid clustering from specific launches
        for (let i = satellites.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [satellites[i], satellites[j]] = [satellites[j], satellites[i]];
        }

        // Apply limit
        if (group.limit && satellites.length > group.limit) {
          satellites = satellites.slice(0, group.limit);
        }

        allSatellites.push(...satellites);

      } catch (error) {
        console.warn(`Skipping group ${group.name}:`, error);
      }
    }

    console.log(`🌍 Total satellites loaded: ${allSatellites.length}`);
    return allSatellites;
  }

  /**
   * Fallback data for demo when API is unavailable
   */
  getFallbackData(group) {
    console.log(`📂 Using fallback demo data for: ${group}`);

    // Demo TLE data for ISS and a few satellites
    const demoData = {
      'stations': [
        {
          name: 'ISS (ZARYA)',
          line1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025',
          line2: '2 25544  51.6400 208.9163 0006703  35.2578 324.8853 15.49815955 38214'
        }
      ],
      'starlink': this.generateDemoStarlink(3000), // FORCE MASSIVE CLOUD IN DEMO
      'gps-ops': this.generateDemoGPS(10),
      'weather': this.generateDemoWeather(10),
      'science': [
        {
          name: 'HST (HUBBLE)',
          line1: '1 20580U 90037B   24001.50000000  .00001268  00000-0  63089-4 0  9997',
          line2: '2 20580  28.4700 130.9000 0002508 280.6900  79.3400 15.09425367 30340'
        }
      ]
    };

    const data = demoData[group] || [];
    return data.map((sat, idx) => {
      // Reuse Parse TLE logic or just return if already good?
      // But getFallbackData structure above has line1/line2.
      // Needs parsing.
      try {
        const satrec = satellite.twoline2satrec(sat.line1, sat.line2);
        return {
          name: sat.name,
          noradId: 10000 + idx,
          line1: sat.line1,
          line2: sat.line2,
          satrec: satrec,
          group: group,
          category: this.categorize(sat.name, group)
        };
      } catch (e) {
        return null;
      }
    }).filter(s => s !== null);
  }

  /**
   * Generate demo Starlink satellites with STRICT TLE FORMATTING (Padding)
   */
  generateDemoStarlink(count) {
    const satellites = [];

    // Helper to pad numbers for TLE fixed width (vital for parser)
    const pad = (num, len) => {
      let str = typeof num === 'number' ? num.toFixed(4) : num;
      while (str.length < len) str = ' ' + str;
      return str;
    };

    for (let i = 0; i < count; i++) {
      const inclination = 53 + Math.random() * 4;
      const raan = Math.random() * 360; // 0-360 distribution
      const meanAnomaly = Math.random() * 360; // 0-360 distribution

      const line1 = '1 99999U 24001A   24001.50000000  .00000000  00000-0  00000-0 0  9999';
      // Strict fixed-width formatting for TLE parser
      const line2 = `2 99999 ${pad(inclination, 8)} ${pad(raan, 8)} 0001000 ${pad(0, 8)} ${pad(meanAnomaly, 8)} 15.05000000    10`;

      // Verify parse
      let satrec = null;
      try {
        satrec = satellite.twoline2satrec(line1, line2);
      } catch (e) { }

      if (satrec) {
        satellites.push({
          name: `STARLINK-${1000 + i}`,
          line1: line1,
          line2: line2,
          satrec: satrec,
          group: 'starlink',
          category: 'COMMUNICATION'
        });
      }
    }
    return satellites;
  }

  /**
   * Generate demo GPS satellites
   */
  generateDemoGPS(count) {
    const satellites = [];
    for (let i = 0; i < count; i++) {
      const raan = (i * 60 + Math.random() * 30) % 360;
      const meanAnomaly = Math.random() * 360;

      satellites.push({
        name: `GPS BIIR-${i + 1}`,
        line1: '1 99998U 24001A   24001.50000000  .00000000  00000-0  00000-0 0  9999',
        line2: `2 99998  55.0000 ${raan.toFixed(4)} 0100000   0.0000 ${meanAnomaly.toFixed(4)} 02.00566000    10`
      });
    }
    return satellites;
  }

  /**
   * Generate demo weather satellites
   */
  generateDemoWeather(count) {
    const satellites = [];
    for (let i = 0; i < count; i++) {
      const raan = Math.random() * 360;

      satellites.push({
        name: `NOAA-${15 + i}`,
        line1: '1 99997U 24001A   24001.50000000  .00000000  00000-0  00000-0 0  9999',
        line2: `2 99997  98.7000 ${raan.toFixed(4)} 0014000   0.0000 ${(i * 36).toFixed(4)} 14.12400000    10`
      });
    }
    return satellites;
  }
}

window.DataFetcher = DataFetcher;
