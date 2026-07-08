/* BioHelix Application Frontend Logic */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // Intro Scroll Zoom Sequences Configuration
    // ----------------------------------------------------
    const introSection = document.getElementById("intro-sec");
    const scaleVal = document.getElementById("scale-val");
    const introTitle = document.getElementById("intro-title");
    const introDesc = document.getElementById("intro-description");
    const btnNextIntro = document.getElementById("btn-next-intro");
    const btnSkipIntro = document.getElementById("btn-skip");
    const timelineSteps = document.querySelectorAll(".zoom-timeline .timeline-step");

    const introData = {
        body: {
            scale: "1.0 x 10^0 m",
            title: "Human Organism",
            desc: "The biological macroscopic organism. Deep within lies a cellular complex containing instructions that define life itself.",
            nextBtn: "Dive into Organism"
        },
        cell: {
            scale: "1.0 x 10^-5 m",
            title: "Phase 2: The Cell",
            desc: "Drifting through extracellular space. Entering cellular membrane bound by lipid bilayers, accessing metabolic cytoplasm organelles...",
            nextBtn: "Locate Nucleus"
        },
        nucleus: {
            scale: "1.0 x 10^-6 m",
            title: "Phase 3: The Nucleus",
            desc: "Passing through nuclear pore envelopes. Entering genetic storage chromatin nucleosome strands...",
            nextBtn: "Access Chromatin"
        },
        dna: {
            scale: "2.0 x 10^-9 m",
            title: "Phase 4: Double Helix (DNA)",
            desc: "Accessing double-stranded chromatin DNA nucleotides: Adenine, Thymine, Cytosine, and Guanine structure.",
            nextBtn: "Transcribe DNA"
        },
        mrna: {
            scale: "1.2 x 10^-9 m",
            title: "Phase 5: Single-stranded RNA",
            desc: "Initiating transcription. Synthesizing complementary single strand messenger RNA (mRNA) replacing Thymine with Uracil.",
            nextBtn: "Follow mRNA"
        },
        ribosome: {
            scale: "2.5 x 10^-8 m",
            title: "Phase 6: Ribosome Assembly",
            desc: "mRNA exits the nuclear pore, binding to ribosomal complex subunits (60S/40S) to commence ribosomal translation.",
            nextBtn: "Translate Chain"
        },
        protein: {
            scale: "5.0 x 10^-9 m",
            title: "Phase 7: Polypeptide Folding",
            desc: "Peptide linkages build amino acids, collapsing chemically into functional 3D macromolecular protein engines.",
            nextBtn: "Launch DNA Analyzer →"
        }
    };

    const zoomPhases = ["body", "cell", "nucleus", "dna", "mrna", "ribosome", "protein"];
    let currentPhaseIndex = 0;

    function updateIntroPhase(index) {
        if (index < 0 || index >= zoomPhases.length) return;
        currentPhaseIndex = index;
        const phase = zoomPhases[index];
        const data = introData[phase];

        // Update Text
        scaleVal.innerHTML = data.scale;
        introTitle.innerText = data.title;
        introDesc.innerText = data.desc;
        btnNextIntro.innerHTML = index === zoomPhases.length - 1 
            ? `${data.nextBtn} <i class="fa-solid fa-play"></i>` 
            : `${data.nextBtn} <i class="fa-solid fa-chevron-down"></i>`;

        // Update graphics active class
        document.querySelectorAll(".zoom-graphics-container .zoom-layer").forEach(layer => {
            layer.classList.remove("layer-active", "layer-exit");
        });

        // Set previous layers to exit state, and current to active
        for (let i = 0; i < index; i++) {
            const prevPhase = zoomPhases[i];
            const prevLayer = document.getElementById(`layer-${prevPhase}`);
            if (prevLayer) prevLayer.classList.add("layer-exit");
        }

        const activeLayer = document.getElementById(`layer-${phase}`);
        if (activeLayer) activeLayer.classList.add("layer-active");

        // Update Timeline step highlighting
        timelineSteps.forEach(step => {
            step.classList.remove("active");
            if (step.getAttribute("data-level") === phase) {
                step.classList.add("active");
            }
        });
    }

    // Next Phase Trigger
    btnNextIntro.addEventListener("click", () => {
        if (currentPhaseIndex === zoomPhases.length - 1) {
            skipIntro();
        } else {
            updateIntroPhase(currentPhaseIndex + 1);
        }
    });

    // Timeline Dot Clicks
    timelineSteps.forEach((step, idx) => {
        step.addEventListener("click", () => {
            updateIntroPhase(idx);
        });
    });

    // Skip Intro Transition
    function skipIntro() {
        introSection.classList.add("fade-out");
        setTimeout(() => {
            introSection.style.display = "none";
            document.getElementById("app-nav").scrollIntoView({ behavior: "smooth" });
        }, 1000);
    }

    btnSkipIntro.addEventListener("click", skipIntro);

    // ----------------------------------------------------
    // Presets and API Interactions
    // ----------------------------------------------------
    const presetsGrid = document.getElementById("presets-grid");
    const dnaInput = document.getElementById("dna-sequence");
    const baseCountLabel = document.getElementById("base-count");
    const btnClearInput = document.getElementById("btn-clear-input");
    const btnStartTranslation = document.getElementById("btn-start-translation");
    const btnStepSim = document.getElementById("btn-step-sim");
    const btnResetSim = document.getElementById("btn-reset-sim");
    const consoleOutput = document.getElementById("console-output");
    const simSpeedSelect = document.getElementById("sim-speed");

    const statDna = document.getElementById("stat-dna-seq");
    const statMrna = document.getElementById("stat-mrna-seq");
    const statPeptide = document.getElementById("stat-peptide-chain");
    const translationOverlay = document.getElementById("translation-stats");
    
    // Preset DNA Database local fallback
    const presetSequences = {
        insulin: "ATGGCCTGTGGATGCGCCTCCTGCCCCTGCTGCGGCGGCCTCCTCTAA",
        hemoglobin: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGTTGTAG",
        collagen: "ATGGCTTTTGTGGGTGACAAAGGCCCCTCTGGAGAGCCCGGTTCTCCTGGCGAGCCCGGTGAAGCTGGTCCTGTTGGTCCTGCTGGACAAAGATAG",
        keratin: "ATGTCCTCCTCTGTTAAGTCTTCCTCTGGCTCTTCCGTTACTCGTTCTTCCAACTCTTCCCGTGGCTCTTGTAGCCTTGGTGGAGGCTCTAGATAG"
    };

    // Load active preset
    dnaInput.value = presetSequences.insulin;
    baseCountLabel.innerText = `${presetSequences.insulin.length} Bases`;

    // Presets Grid Interaction
    document.querySelectorAll(".preset-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            const presetKey = card.getAttribute("data-preset");
            const seq = presetSequences[presetKey];
            dnaInput.value = seq;
            baseCountLabel.innerText = `${seq.length} Bases`;
            resetSimulation();
            
            // Re-create helix structure based on new preset length
            if (threeApp) {
                threeApp.createHelix(seq);
            }
        });
    });

    // Character filter and base count updating
    dnaInput.addEventListener("input", () => {
        // Remove preset selection active class since user is typing custom sequence
        document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
        
        let val = dnaInput.value.toUpperCase().replace(/[^ATCG]/g, "");
        dnaInput.value = val;
        baseCountLabel.innerText = `${val.length} Bases`;
    });

    btnClearInput.addEventListener("click", () => {
        dnaInput.value = "";
        baseCountLabel.innerText = "0 Bases";
        document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
        resetSimulation();
        if (threeApp) threeApp.createHelix("");
    });

    // Console Logging Helper
    function logToConsole(message, type = "info") {
        const line = document.createElement("div");
        line.className = `console-line ${type}-line`;
        line.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // ----------------------------------------------------
    // Three.js Interactive 3D Canvas Engine
    // ----------------------------------------------------
    class ThreeHelixEngine {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.helixGroup = null;
            this.proteinGroup = null;
            this.particles = null;
            this.loader = document.getElementById("canvas-loader");

            // Interaction state
            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };
            this.targetRotation = { x: 0, y: 0 };
            
            // Current displayed view tab: "dna" or "protein"
            this.activeView = "dna";

            this.init();
        }

        init() {
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2(0x03040b, 0.015);

            // Camera setup
            this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
            this.camera.position.z = 45;

            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            
            // Clear container and inject canvas
            this.container.innerHTML = "";
            this.container.appendChild(this.renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            this.scene.add(ambientLight);

            const pointLight1 = new THREE.PointLight(0x00f2fe, 1.2, 100);
            pointLight1.position.set(10, 20, 20);
            this.scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0xf012be, 0.8, 100);
            pointLight2.position.set(-10, -20, 20);
            this.scene.add(pointLight2);

            // Groups
            this.helixGroup = new THREE.Group();
            this.scene.add(this.helixGroup);

            this.proteinGroup = new THREE.Group();
            this.scene.add(this.proteinGroup);
            this.proteinGroup.visible = false;

            // Ambient floating particles
            this.createFloatingParticles();

            // Create initial default helix
            this.createHelix(presetSequences.insulin);

            // Mouse Drag Interaction Event Listeners
            this.container.addEventListener("mousedown", (e) => {
                this.isDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            this.container.addEventListener("mousemove", (e) => {
                if (!this.isDragging) {
                    // Hover subtle tilt
                    const rect = this.container.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
                    const y = -((e.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
                    
                    if (this.activeView === "dna") {
                        this.helixGroup.rotation.y = x * 0.4;
                        this.helixGroup.rotation.x = y * 0.4;
                    } else {
                        this.proteinGroup.rotation.y = x * 0.4;
                        this.proteinGroup.rotation.x = y * 0.4;
                    }
                    return;
                }

                const deltaMove = {
                    x: e.clientX - this.previousMousePosition.x,
                    y: e.clientY - this.previousMousePosition.y
                };

                this.targetRotation.y += deltaMove.x * 0.008;
                this.targetRotation.x += deltaMove.y * 0.008;

                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            window.addEventListener("mouseup", () => {
                this.isDragging = false;
            });

            // Handle Resize
            window.addEventListener("resize", () => {
                if (!this.container || !this.camera || !this.renderer) return;
                this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            });

            // Start loop
            this.animate();
        }

        createFloatingParticles() {
            const particleCount = 120;
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];

            const colorPalette = [
                new THREE.Color(0x0070f3), // A (blue)
                new THREE.Color(0x00f2fe), // T (cyan)
                new THREE.Color(0xff5e00), // C (orange)
                new THREE.Color(0xf012be), // G (magenta)
                new THREE.Color(0xffeb3b)  // U (yellow)
            ];

            for (let i = 0; i < particleCount; i++) {
                // Position within bounding cylinder
                const theta = Math.random() * Math.PI * 2;
                const r = 8 + Math.random() * 20;
                positions.push(
                    Math.cos(theta) * r,
                    (Math.random() - 0.5) * 45,
                    Math.sin(theta) * r
                );

                const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                colors.push(col.r, col.g, col.b);
            }

            geometry.setAttribute('position', new THREE.Float32BufferGeometry(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferGeometry(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });

            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);
        }

        createHelix(sequence = "") {
            // Clear existing helix
            while(this.helixGroup.children.length > 0){ 
                this.helixGroup.remove(this.helixGroup.children[0]); 
            }

            const length = sequence.length || 30;
            const rungsSpacing = 1.0;
            const totalHeight = length * rungsSpacing;
            const helixRadius = 5;

            // Geometry and Materials
            const backboneMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x8b5cf6, 
                roughness: 0.2, 
                metalness: 0.8,
                emissive: 0x221144
            });

            const sphereGeom = new THREE.SphereGeometry(0.4, 16, 16);
            const cylGeom = new THREE.CylinderGeometry(0.12, 0.12, 1, 8);

            const baseColors = {
                'A': 0x0070f3,
                'T': 0x00f2fe,
                'C': 0xff5e00,
                'G': 0xf012be,
                'U': 0xffeb3b
            };

            const complementaryMap = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C', 'U': 'A' };

            // Store references to nucleotides for animation highlighting
            this.rungMeshes = [];

            // Draw Helix Strands
            for (let i = 0; i < length; i++) {
                const angle = i * 0.45;
                const y = (i * rungsSpacing) - (totalHeight / 2);

                // Strand 1 Position
                const x1 = Math.cos(angle) * helixRadius;
                const z1 = Math.sin(angle) * helixRadius;

                // Strand 2 Position (180 deg shifted)
                const x2 = Math.cos(angle + Math.PI) * helixRadius;
                const z2 = Math.sin(angle + Math.PI) * helixRadius;

                // Create Backbone spheres
                const node1 = new THREE.Mesh(sphereGeom, backboneMaterial);
                node1.position.set(x1, y, z1);
                this.helixGroup.add(node1);

                const node2 = new THREE.Mesh(sphereGeom, backboneMaterial);
                node2.position.set(x2, y, z2);
                this.helixGroup.add(node2);

                // Base assignment (sequence letter, or random)
                let base1 = 'A';
                if (sequence && sequence[i]) {
                    base1 = sequence[i];
                } else {
                    const bases = ['A', 'T', 'C', 'G'];
                    base1 = bases[Math.floor(Math.random() * bases.length)];
                }
                const base2 = complementaryMap[base1] || 'T';

                // Create Rung representing base pairing
                // A cylinder connecting Strand 1 and Strand 2, split in half (two colors)
                const rungGroup = new THREE.Group();
                rungGroup.position.set(0, y, 0);

                // Half-rung 1 (from center to Strand 1)
                const mat1 = new THREE.MeshStandardMaterial({ 
                    color: baseColors[base1], 
                    roughness: 0.3,
                    metalness: 0.5,
                    emissive: baseColors[base1],
                    emissiveIntensity: 0.2
                });
                const hr1 = new THREE.Mesh(cylGeom, mat1);
                hr1.scale.set(1, helixRadius * 0.5, 1);
                hr1.rotation.z = Math.PI / 2;
                hr1.rotation.y = angle;
                // Offset position to lie between center and strand point
                hr1.position.set(x1 / 2, 0, z1 / 2);
                rungGroup.add(hr1);

                // Half-rung 2 (from center to Strand 2)
                const mat2 = new THREE.MeshStandardMaterial({ 
                    color: baseColors[base2], 
                    roughness: 0.3,
                    metalness: 0.5,
                    emissive: baseColors[base2],
                    emissiveIntensity: 0.2
                });
                const hr2 = new THREE.Mesh(cylGeom, mat2);
                hr2.scale.set(1, helixRadius * 0.5, 1);
                hr2.rotation.z = Math.PI / 2;
                hr2.rotation.y = angle + Math.PI;
                hr2.position.set(x2 / 2, 0, z2 / 2);
                rungGroup.add(hr2);

                this.helixGroup.add(rungGroup);

                // Save references to scale/highlight during simulation
                this.rungMeshes.push({
                    rung: rungGroup,
                    materials: [mat1, mat2],
                    base1: base1,
                    base2: base2
                });
            }

            // Adjust camera according to helix length
            this.camera.position.z = Math.max(35, length * 0.8 + 15);
            this.helixGroup.rotation.set(0, 0, 0);
            this.targetRotation.set(0, 0, 0);
        }

        // Highlights specific base rungs during translation steps
        highlightRung(index, isActive = true) {
            if (index < 0 || index >= this.rungMeshes.length) return;
            const data = this.rungMeshes[index];
            if (!data) return;

            data.materials.forEach(mat => {
                if (isActive) {
                    mat.emissiveIntensity = 2.0; // bright glow
                } else {
                    mat.emissiveIntensity = 0.2; // dim normal
                }
            });

            // Adjust scale of active rung to stand out
            if (isActive) {
                data.rung.scale.set(1.3, 1.3, 1.3);
            } else {
                data.rung.scale.set(1, 1, 1);
            }
        }

        // Animate the amino acid peptide chain building
        buildProteinPeptideChain(aminoAcids) {
            // Clear existing protein visualization
            while(this.proteinGroup.children.length > 0){ 
                this.proteinGroup.remove(this.proteinGroup.children[0]); 
            }

            if (!aminoAcids || aminoAcids.length === 0) return;

            const sphereGeom = new THREE.SphereGeometry(0.8, 32, 32);
            const cylinderGeom = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
            const lineMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });

            // Plot amino acid beads along a random winding spline curve (simulating folded folding protein)
            const points = [];
            for (let i = 0; i < aminoAcids.length; i++) {
                // Generates winding helical coil structure
                const theta = i * 0.9;
                const r = 3 + Math.sin(i * 0.3) * 2;
                points.push(new THREE.Vector3(
                    Math.cos(theta) * r,
                    (i * 1.5) - (aminoAcids.length * 0.75),
                    Math.sin(theta) * r
                ));
            }

            // Create spheres at spline nodes
            this.peptideBeads = [];
            for (let i = 0; i < aminoAcids.length; i++) {
                const aa = aminoAcids[i];
                const col = new THREE.Color(aa.color || 0x1dd1a1);
                
                const material = new THREE.MeshStandardMaterial({
                    color: col,
                    roughness: 0.1,
                    metalness: 0.2,
                    emissive: col,
                    emissiveIntensity: 0.3
                });

                const bead = new THREE.Mesh(sphereGeom, material);
                bead.position.copy(points[i]);
                bead.scale.set(0.1, 0.1, 0.1); // start small, animation scales it up
                
                this.proteinGroup.add(bead);
                this.peptideBeads.push({ mesh: bead, targetScale: 1.0 });

                // Connect with rod to previous bead
                if (i > 0) {
                    const prevPt = points[i-1];
                    const currPt = points[i];
                    
                    const distance = prevPt.distanceTo(currPt);
                    const rod = new THREE.Mesh(cylinderGeom, lineMat);
                    rod.scale.set(1, distance, 1);
                    
                    // Position and point cylinder along segment
                    const direction = new THREE.Vector3().subVectors(currPt, prevPt).normalize();
                    const position = new THREE.Vector3().addVectors(prevPt, currPt).multiplyScalar(0.5);
                    
                    rod.position.copy(position);
                    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
                    this.proteinGroup.add(rod);
                }
            }
        }

        // Toggle active visual views (DNA vs Protein)
        setView(viewType) {
            this.activeView = viewType;
            if (viewType === "dna") {
                this.helixGroup.visible = true;
                this.proteinGroup.visible = false;
            } else {
                this.helixGroup.visible = false;
                this.proteinGroup.visible = true;
            }
        }

        animate() {
            requestAnimationFrame(() => this.animate());

            // Auto-rotation of the helix
            if (!this.isDragging) {
                if (this.activeView === "dna") {
                    this.helixGroup.rotation.y += 0.005;
                } else {
                    this.proteinGroup.rotation.y += 0.004;
                    this.proteinGroup.rotation.z += 0.001;
                }
            } else {
                // Apply manual drag rotations smoothly
                if (this.activeView === "dna") {
                    this.helixGroup.rotation.y += (this.targetRotation.y - this.helixGroup.rotation.y) * 0.1;
                    this.helixGroup.rotation.x += (this.targetRotation.x - this.helixGroup.rotation.x) * 0.1;
                } else {
                    this.proteinGroup.rotation.y += (this.targetRotation.y - this.proteinGroup.rotation.y) * 0.1;
                    this.proteinGroup.rotation.x += (this.targetRotation.x - this.proteinGroup.rotation.x) * 0.1;
                }
            }

            // Animate ambient particles gently
            if (this.particles) {
                this.particles.rotation.y += 0.0008;
                this.particles.rotation.x += 0.0003;
            }

            // Animate peptide bead scale growth
            if (this.peptideBeads) {
                this.peptideBeads.forEach(bead => {
                    if (bead.mesh.scale.x < bead.targetScale) {
                        bead.mesh.scale.addScalar(0.05);
                        if (bead.mesh.scale.x > bead.targetScale) {
                            bead.mesh.scale.set(bead.targetScale, bead.targetScale, bead.targetScale);
                        }
                    }
                });
            }

            this.renderer.render(this.scene, this.camera);
        }
    }

    // Initialize 3D Engine
    const threeApp = new ThreeHelixEngine("canvas-container");

    // Tab toggling DNA vs Protein Views
    const tabDNA = document.getElementById("tab-3d-dna");
    const tabProtein = document.getElementById("tab-3d-protein");

    tabDNA.addEventListener("click", () => {
        tabDNA.classList.add("active");
        tabProtein.classList.remove("active");
        threeApp.setView("dna");
        document.querySelector(".mrna-legend-dot").style.display = "none";
    });

    tabProtein.addEventListener("click", () => {
        tabProtein.classList.add("active");
        tabDNA.classList.remove("active");
        threeApp.setView("protein");
        document.querySelector(".mrna-legend-dot").style.display = "inline-flex";
    });

    // ----------------------------------------------------
    // Simulation Engine Logic
    // ----------------------------------------------------
    let simulationSteps = [];
    let currentStepIndex = 0;
    let simulationTimer = null;
    let computedResult = null;
    let translatedAminoAcids = [];

    // Trigger API call to fetch transcription details
    btnStartTranslation.addEventListener("click", () => {
        const sequence = dnaInput.value.trim();
        if (!sequence) {
            logToConsole("DNA Sequence input is empty. Load a preset or input A, T, C, G bases first.", "error");
            return;
        }

        logToConsole("Connecting to BioHelix Molecular Engine API...", "info");
        btnStartTranslation.disabled = true;

        fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sequence: sequence })
        })
        .then(response => response.json())
        .then(data => {
            btnStartTranslation.disabled = false;
            if (!data.success) {
                logToConsole(`Biological calculation failed: ${data.error}`, "error");
                return;
            }

            // Prep simulation sequence
            computedResult = data;
            simulationSteps = data.steps;
            translatedAminoAcids = data.amino_acids;
            currentStepIndex = 0;

            logToConsole("Sequence verification completed successfully.", "success");
            logToConsole(`Transcribed mRNA strand: ${data.mrna}`, "success");
            
            // Set stats overlay
            statDna.innerText = data.dna;
            statMrna.innerText = data.mrna;
            statPeptide.innerText = "Initiating...";
            translationOverlay.style.display = "flex";

            // Prepare 3D engine protein array
            threeApp.buildProteinPeptideChain(data.amino_acids);
            
            // Reset active bead indicators
            if (threeApp.peptideBeads) {
                threeApp.peptideBeads.forEach(b => b.targetScale = 0.0);
            }

            // Enable simulator stepping
            btnStepSim.disabled = false;
            btnResetSim.disabled = false;

            // Start simulation walkthrough
            logToConsole("Press 'Next Step' or set Auto-Run to play molecular process step-by-step.", "info");
            
            // Clean console lines and run
            autoRunSimulation();
        })
        .catch(err => {
            btnStartTranslation.disabled = false;
            logToConsole(`Connection to molecular server failed: ${err}`, "error");
        });
    });

    // Run simulator loop automatically
    function autoRunSimulation() {
        clearInterval(simulationTimer);
        const intervalTime = parseInt(simSpeedSelect.value) || 800;

        simulationTimer = setInterval(() => {
            if (currentStepIndex >= simulationSteps.length) {
                clearInterval(simulationTimer);
                logToConsole("Simulation sequence ended. Translation process complete.", "success");
                btnStepSim.disabled = true;
                return;
            }
            executeSimulationStep();
        }, intervalTime);
    }

    // Step Simulator Manual Control
    btnStepSim.addEventListener("click", () => {
        clearInterval(simulationTimer);
        if (currentStepIndex < simulationSteps.length) {
            executeSimulationStep();
        } else {
            logToConsole("Simulation sequence complete.", "success");
            btnStepSim.disabled = true;
        }
    });

    // Reset simulator control
    btnResetSim.addEventListener("click", resetSimulation);

    // Speed Selector change update timer
    simSpeedSelect.addEventListener("change", () => {
        if (simulationTimer) {
            autoRunSimulation();
        }
    });

    // Execute single step in translation flow
    function executeSimulationStep() {
        const step = simulationSteps[currentStepIndex];
        if (!step) return;

        // Visual code types logic mapping
        let type = "info";
        if (step.type === "start") type = "success";
        else if (step.type === "stop") type = "success";
        else if (step.type === "warning") type = "warning";
        else if (step.type === "error") type = "error";
        else if (step.type === "elongation") type = "success";

        logToConsole(`[${step.phase}] ${step.message}`, type);

        // Highlight matching base in 3D Helix if index is passed
        if (step.index !== undefined && threeApp && threeApp.rungMeshes) {
            // Reset all highlights first
            for (let i = 0; i < threeApp.rungMeshes.length; i++) {
                threeApp.highlightRung(i, false);
            }
            // Highlight the active transcription bubble rung index
            const baseIndex = Math.floor(step.index / 3);
            threeApp.highlightRung(baseIndex, true);
        }

        // If it is an elongation step, grow corresponding amino acid bead in Protein View
        if (step.type === "elongation" && threeApp.peptideBeads) {
            // Find which amino acid index this codon matches
            const aaIdx = computedResult.amino_acids.findIndex(aa => aa.index === step.index);
            if (aaIdx !== -1 && threeApp.peptideBeads[aaIdx]) {
                threeApp.peptideBeads[aaIdx].targetScale = 1.0;
                
                // Show peptide progression text list
                const chainNames = computedResult.amino_acids
                    .slice(0, aaIdx + 1)
                    .map(aa => aa.symbol)
                    .join(" - ");
                statPeptide.innerText = chainNames;
            }
        }

        // On Stop Termination codon
        if (step.type === "stop") {
            statPeptide.innerText += " - [STOP]";
            // Automatically trigger the folding tab display to show the folded peptide
            setTimeout(() => {
                tabProtein.click();
            }, 800);
        }

        currentStepIndex++;
    }

    function resetSimulation() {
        clearInterval(simulationTimer);
        simulationTimer = null;
        currentStepIndex = 0;
        simulationSteps = [];
        computedResult = null;

        btnStepSim.disabled = true;
        btnResetSim.disabled = true;
        
        statDna.innerText = "-";
        statMrna.innerText = "-";
        statPeptide.innerText = "-";
        translationOverlay.style.display = "none";

        // Reset highlights
        if (threeApp && threeApp.rungMeshes) {
            for (let i = 0; i < threeApp.rungMeshes.length; i++) {
                threeApp.highlightRung(i, false);
            }
        }

        // Return to DNA view tab
        tabDNA.click();

        logToConsole("Simulator workspace reset. Standing by for sequence entry.", "info");
    }
});
