# Implementation Plan: BioHelix - Interactive DNA Transcription & Translation Visualizer

Build a highly immersive, interactive web application showcasing the Central Dogma of Molecular Biology (DNA → RNA → Protein). It features an interactive zooming intro, a real-time Three.js 3D double helix, biological gene presets, and a step-by-step biological transcription and translation simulation tool.

## User Review Required

> [!IMPORTANT]
> - **Stop Codons**: The genetic code translation will explicitly map `UAA`, `UAG`, and `AGA` as stop codons as per specifications, with the standard start codon being `AUG` (from DNA `ATG`).
> - **Visual Themes**: Using a ultra-premium dark scientific aesthetic (deep space blue, neon cyan, electric magenta, vibrant orange) with glassmorphism to look highly advanced and realistic, avoiding basic templates.
> - **Interactive 3D**: Three.js will run via CDN to construct a fully interactive double helix that responds to mouse moves and matches base color-coding.

## Proposed Changes

### Backend Component (Flask Server)

We will build a simple, robust Flask backend to serve the application and process DNA translation computations.

#### [NEW] [app.py](file:///c:/Users/Shanmukh/web site c1/app.py)
A Flask application containing:
- Static file routes for CSS, JS, and media assets.
- An API endpoint `/api/translate` that takes a DNA string, performs input validation (A, T, C, G only), and returns structured JSON detail of:
  - Transcription (DNA → mRNA, mapping T to U).
  - Codon analysis (splitting into triplets, detecting start codon `AUG` and stops `UAA`, `UAG`, `AGA`).
  - Translation progression (step-by-step amino acid mapping, showing tRNA anti-codons, amino acid names, and structure positions).

### Frontend Components (Static Web Assets)

The frontend will be built with HTML5, Vanilla CSS (using variable-based design system), GSAP for zoom-scroll animations, and Three.js for interactive 3D visualization.

#### [NEW] [index.html](file:///c:/Users/Shanmukh/web site c1/templates/index.html)
The core web page structure including:
- Immersive zooming landing experience: Human Body → Cell → Nucleus → DNA → Ribosome → Protein.
- Interactive DNA 3D View Container.
- Interactive Simulator UI (Inputs, presets, run buttons, and progress steps).
- Informational tabs/cards detailing RNA modules and Protein mechanisms.

#### [NEW] [style.css](file:///c:/Users/Shanmukh/web site c1/static/css/style.css)
A custom, premium styling stylesheet using:
- Modern font families (e.g. Google Fonts Outfit or Inter).
- CSS Variables for color palette (A = `#0055ff` Blue, T = `#00ffff` Cyan, C = `#ff6600` Orange, G = `#ff00aa` Magenta).
- Immersive background gradients, card layouts with `backdrop-filter: blur()`, and hover-state micro-animations.

#### [NEW] [app.js](file:///c:/Users/Shanmukh/web site c1/static/js/app.js)
Frontend JavaScript managing:
- Scroll-based cellular zoom animation (using GSAP scroll trigger or custom scroll offsets).
- Three.js 3D Double Helix rendering:
  - Custom geometric representation of Sugar-Phosphate backbones and Nucleotide base pairs.
  - Interactive rotation on mouse hover/drag.
  - Floating ambient nucleotide particle system.
- Simulated translation workspace (connecting input fields, presets, and updating 3D visualizations dynamically during translation steps).

## Verification Plan

### Automated Tests
- Create a test suite in [test_app.py](file:///c:/Users/Shanmukh/web site c1/test_app.py) to assert transcription and translation algorithms (handling edge cases like sequences without start codons, invalid base characters, and premature stop codons).
- Run using `python -m unittest test_app.py`.

### Manual Verification
- Run the local Flask server using `python app.py` and access it on `http://127.0.0.1:5000`.
- Verify scroll zooming intro is smooth and engaging.
- Verify 3D double helix interaction and hover actions work.
- Test presets (Insulin, Hemoglobin, Collagen, Keratin) and verify step-by-step animations.
