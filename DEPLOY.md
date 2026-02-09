# Deploying Orbital Resonance 🌍

You can easily host this project for free using **GitHub Pages** or **Vercel**.

## Option 1: Vercel (Recommended - Easiest)
Vercel is a platform for static sites. It's very fast and easy.

1.  **Create a Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up.
2.  **Install Vercel CLI** (Optional but fast):
    ```bash
    npm i -g vercel
    ```
3.  **Deploy**:
    run this command in your project folder:
    ```bash
    vercel
    ```
    - Follow the prompts (press Enter for defaults).
    - It will give you a URL (e.g., `https://orbital-resonance.vercel.app`).

**Alternatively**, if you use GitHub:
1.  Push this code to a GitHub repository.
2.  Go to Vercel Dashboard -> "Add New Project" -> Import from GitHub.
3.  Click "Deploy".

## Option 2: GitHub Pages
If you prefer GitHub:

1.  **Create a Repository**: Create a new public repository on GitHub (e.g., `orbital-resonance`).
2.  **Push Code**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/YOUR_USERNAME/orbital-resonance.git
    git push -u origin main
    ```
3.  **Enable Pages**:
    - Go to Repository Settings -> **Pages**.
    - under "Build and deployment", select **Source** as `Deploy from a branch`.
    - Select `main` branch and `/ (root)` folder.
    - Click **Save**.
4.  **Visit**: Your site will be at `https://YOUR_USERNAME.github.io/orbital-resonance/`.

## Notes
- This is a static client-side application. No backend server is required.
- All dependencies (`Tone.js`, `p5.js`) are loaded via CDN or included files.
