# ORBITAL RESONANCE
## Live Satellite Sonification

This project visualizes and sonifies real-time satellite data using SGP4 propagation and Web Audio (Tone.js).

### 🚀 How to Run

1.  **Open Terminal** in this folder.
2.  Run the local server command:
    ```bash
    python3 -m http.server 8080
    ```
3.  Open your browser to:
    [http://localhost:8080](http://localhost:8080)

### 🎵 Important Audio Note
-   The application loads high-quality audio samples (Cello, Violin, Piano) from GitHub.
-   **Wait 5-10 seconds** after loading for "✅ Samples Loaded!" message in console.
-   You MUST click **"ENTER EXPERIENCE"** to enable audio (Browser Security Policy).

### 🎹 Controls
-   **Presets**: Switch between AMBIENT, STRINGS, GUGAK, CHIME, REALISM.
-   **Scale**: Change the musical key and mode (Lydian, Major, etc.).
-   **Click Satellite**: Select a satellite to hear its specific data.
