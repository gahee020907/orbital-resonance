# ORBITAL RESONANCE (v1.0.3)
## Live Satellite Sonification

**🔗 [LIVE DEMO: Enter Experience](https://gahee020907.github.io/orbital-resonance/)**

This project visualizes and sonifies real-time satellite data using SGP4 propagation and Web Audio (Tone.js).

### 🚀 Running Locally (For Developers)

1.  **Open Terminal** in this folder.
2.  Run the local server command:
    ```bash
    python3 -m http.server 8080
    ```
3.  Open your browser to:
    [http://localhost:8080](http://localhost:8080)

### 🎵 Key Features

-   **Live Data**: Real-time tracking of ~2500 active satellites.
-   **AI Conductor**: Automatically adjusts musical mood based on satellite density and activity.
-   **Manual Override**: Users can take control of the Scale and Key to shape the harmony.
-   **Sound Explanation**: Real-time log showing why each sound was triggered (e.g., Grid Crossing, Zone Change).

### 🎹 Controls

-   **Presets**: Switch between COSMIC and REALISM modes.
-   **Scale / Key**: Change the musical key and mode (e.g., F# Minor). *Note: Using this disables the AI Conductor's automatic scale changes.*
-   **Audio Effects**: Adjust Master Volume, Reverb, and Delay.
-   **Click Satellite**: Select a satellite to see detailed info and hear a specific "Selection" ping.

### ⚠️ Important Audio Note
-   The application loads high-quality audio samples (Cello, Violin, Piano) from GitHub.
-   **Wait 5-10 seconds** after loading for "✅ Samples Loaded!" message in console.
-   You MUST click **"ENTER EXPERIENCE"** to enable audio (Browser Security Policy).
