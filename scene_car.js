/**
 * Scene 2: 3D Car Rotating About the Same Axis — Enhanced v2
 * Showroom with volumetric beams, sparkle particles, reflective floor,
 * richer car geometry with side mirrors, air intakes, rocker panels,
 * animated exhaust glow, and improved metallic paint shading.
 */

class SceneCar {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);

    this.rotationAxis = 'y';
    this.spinSpeed = 1.0;
    this.angle = 0;
    this.isWireframe = false;
    this.headlightsOn = true;
    this.underglowOn = true;
    this.bodyColor = 0x00f2fe;

    this.clock = new THREE.Clock();

    this.initThree();
    this.buildShowroom();
    this.buildCar();
    this.buildSparkleParticles();
    this.setupInteractions();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090f);
    this.scene.fog = new THREE.FogExp2(0x07090f, 0.028);

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const aspect = (rect.width || 400) / (rect.height || 300);

    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(5.5, 3.2, 6.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(rect.width || 400, rect.height || 300);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Dark showroom ambient
    const ambient = new THREE.AmbientLight(0xc0d0ff, 0.3);
    this.scene.add(ambient);

    // Hemisphere sky-to-ground
    const hemi = new THREE.HemisphereLight(0x1e3a5f, 0x0a0a0a, 0.4);
    this.scene.add(hemi);

    // Key light — dramatic overhead narrow beam
    this.overheadSpot = new THREE.SpotLight(0xf0f4ff, 2.5);
    this.overheadSpot.position.set(0, 12, 2);
    this.overheadSpot.angle = Math.PI / 5;
    this.overheadSpot.penumbra = 0.85;
    this.overheadSpot.decay = 1.2;
    this.overheadSpot.castShadow = true;
    this.overheadSpot.shadow.mapSize.width = 1024;
    this.overheadSpot.shadow.mapSize.height = 1024;
    this.overheadSpot.shadow.radius = 4;
    this.scene.add(this.overheadSpot);

    // Blue dramatic rim from rear-left
    const blueRim = new THREE.SpotLight(0x38bdf8, 1.8);
    blueRim.position.set(-9, 5, -7);
    blueRim.angle = Math.PI / 3.5;
    blueRim.penumbra = 0.9;
    this.scene.add(blueRim);

    // Warm accent from rear-right
    const warmRim = new THREE.SpotLight(0xfbbf24, 0.8);
    warmRim.position.set(9, 4, -5);
    warmRim.angle = Math.PI / 3;
    warmRim.penumbra = 0.9;
    this.scene.add(warmRim);

    // Front low fill
    const frontFill = new THREE.PointLight(0xdbeafe, 0.4, 10);
    frontFill.position.set(0, 1, 8);
    this.scene.add(frontFill);

    // Orbit Controls
    this.controls = new THREE.SimpleOrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0.9, 0);
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 16;
  }

  buildShowroom() {
    // Mirror-like floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.12,
      metalness: 0.92
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Circular turntable platform
    this.turntableGroup = new THREE.Group();

    // Multi-layered turntable
    const platterGeo = new THREE.CylinderGeometry(4.5, 4.7, 0.18, 72);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0x141a28,
      roughness: 0.3,
      metalness: 0.75
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.y = 0.04;
    platter.receiveShadow = true;
    this.turntableGroup.add(platter);

    // Inner beveled platform
    const innerPlat = new THREE.Mesh(
      new THREE.CylinderGeometry(4.0, 4.2, 0.06, 64),
      new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.25, metalness: 0.8 })
    );
    innerPlat.position.y = 0.14;
    this.turntableGroup.add(innerPlat);

    // Outer neon rim
    const rimTorusGeo = new THREE.TorusGeometry(4.52, 0.035, 16, 80);
    this.rimTorusMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const rimTorus = new THREE.Mesh(rimTorusGeo, this.rimTorusMat);
    rimTorus.rotation.x = Math.PI / 2;
    rimTorus.position.y = 0.13;
    this.turntableGroup.add(rimTorus);

    // Inner accent rim
    const innerRimGeo = new THREE.TorusGeometry(4.05, 0.02, 12, 64);
    this.innerRimMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.4 });
    const innerRim = new THREE.Mesh(innerRimGeo, this.innerRimMat);
    innerRim.rotation.x = Math.PI / 2;
    innerRim.position.y = 0.15;
    this.turntableGroup.add(innerRim);

    // Subtle grid
    const gridHelper = new THREE.PolarGridHelper(4.0, 24, 6, 48, 0x1e2a40, 0x141c2c);
    gridHelper.position.y = 0.16;
    this.turntableGroup.add(gridHelper);

    // Floor radial light beams (implied via positioned lights)
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(angle => {
      const x = Math.cos(angle) * 6;
      const z = Math.sin(angle) * 6;
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 })
      );
      marker.position.set(x, 0.07, z);
      this.scene.add(marker);
    });

    this.scene.add(this.turntableGroup);
  }

  buildCar() {
    this.carPivot = new THREE.Group();
    this.carPivot.position.set(0, 0.85, 0);

    // Premium car body material
    this.carBodyMat = new THREE.MeshStandardMaterial({
      color: this.bodyColor,
      roughness: 0.12,
      metalness: 0.95,
      wireframe: false,
      envMapIntensity: 1.5
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.55,
      metalness: 0.35
    });

    const glassMat = new THREE.MeshPhysicalMaterial ? new THREE.MeshPhysicalMaterial({
      color: 0x0c1520,
      roughness: 0.02,
      metalness: 0.05,
      transmission: 0.75,
      transparent: true,
      opacity: 0.88,
      thickness: 0.3
    }) : new THREE.MeshStandardMaterial({
      color: 0x0c1520,
      roughness: 0.05,
      metalness: 0.85,
      opacity: 0.88,
      transparent: true
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      roughness: 0.05,
      metalness: 1.0
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x141618,
      roughness: 0.92,
      metalness: 0.03
    });

    const brakeCaliperMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.25,
      metalness: 0.5,
      emissive: 0x440000,
      emissiveIntensity: 0.15
    });

    // 1. Chassis
    const lowerBodyGeo = new THREE.BoxGeometry(2.15, 0.48, 4.5);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, this.carBodyMat);
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.carPivot.add(lowerBody);

    // Side rocker panels (sculpted lower body trim)
    [-1.08, 1.08].forEach(x => {
      const rockerGeo = new THREE.BoxGeometry(0.08, 0.15, 3.6);
      const rocker = new THREE.Mesh(rockerGeo, carbonMat);
      rocker.position.set(x, -0.18, 0);
      this.carPivot.add(rocker);
    });

    // 2. Hood with power bulge
    const hoodGeo = new THREE.BoxGeometry(1.95, 0.3, 1.65);
    const hood = new THREE.Mesh(hoodGeo, this.carBodyMat);
    hood.position.set(0, 0.14, 1.28);
    hood.rotation.x = -0.06;
    hood.castShadow = true;
    this.carPivot.add(hood);

    // Hood vent / scoop
    const scoopGeo = new THREE.BoxGeometry(0.55, 0.08, 0.6);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(0, 0.32, 1.1);
    this.carPivot.add(scoop);

    // Side air intakes
    [-0.92, 0.92].forEach(x => {
      const intakeGeo = new THREE.BoxGeometry(0.12, 0.18, 0.45);
      const intake = new THREE.Mesh(intakeGeo, carbonMat);
      intake.position.set(x, 0.05, 0.5);
      this.carPivot.add(intake);
    });

    // Front splitter
    const splitterGeo = new THREE.BoxGeometry(2.2, 0.05, 0.55);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, -0.22, 2.22);
    splitter.castShadow = true;
    this.carPivot.add(splitter);

    // Front grille
    const grilleGeo = new THREE.BoxGeometry(1.45, 0.2, 0.08);
    const grille = new THREE.Mesh(grilleGeo, carbonMat);
    grille.position.set(0, -0.04, 2.24);
    this.carPivot.add(grille);

    // Grille accent bar
    const grilleBarGeo = new THREE.BoxGeometry(1.5, 0.03, 0.04);
    const grilleBar = new THREE.Mesh(grilleBarGeo, chromeMat);
    grilleBar.position.set(0, 0.06, 2.24);
    this.carPivot.add(grilleBar);

    // 3. Cabin
    const cabinGeo = new THREE.BoxGeometry(1.68, 0.55, 2.15);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.44, -0.15);
    cabin.castShadow = true;
    this.carPivot.add(cabin);

    // A-pillar trim
    [-0.84, 0.84].forEach(x => {
      const pillarGeo = new THREE.BoxGeometry(0.06, 0.5, 0.08);
      const pillar = new THREE.Mesh(pillarGeo, carbonMat);
      pillar.position.set(x, 0.42, 0.8);
      pillar.rotation.z = x > 0 ? -0.08 : 0.08;
      this.carPivot.add(pillar);
    });

    // Roof
    const roofGeo = new THREE.BoxGeometry(1.52, 0.05, 1.55);
    const roof = new THREE.Mesh(roofGeo, carbonMat);
    roof.position.set(0, 0.72, -0.2);
    roof.castShadow = true;
    this.carPivot.add(roof);

    // Side mirrors
    [-1.1, 1.1].forEach(x => {
      const mirrorArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.05, 0.18),
        carbonMat
      );
      mirrorArm.position.set(x, 0.35, 0.6);
      this.carPivot.add(mirrorArm);

      const mirrorFace = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.12, 0.14),
        glassMat
      );
      mirrorFace.position.set(x + (x > 0 ? 0.04 : -0.04), 0.35, 0.6);
      this.carPivot.add(mirrorFace);
    });

    // Rear spoiler
    const wingGeo = new THREE.BoxGeometry(2.25, 0.04, 0.42);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 0.58, -2.08);
    wing.castShadow = true;
    this.carPivot.add(wing);

    // Wing uprights
    [-0.72, 0.72].forEach(x => {
      const strutGeo = new THREE.BoxGeometry(0.05, 0.32, 0.12);
      const strut = new THREE.Mesh(strutGeo, carbonMat);
      strut.position.set(x, 0.4, -2.08);
      this.carPivot.add(strut);
    });

    // Rear diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.95, 0.18, 0.38);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, -0.16, -2.18);
    this.carPivot.add(diffuser);

    // Exhaust tips (chrome)
    this.exhaustGlows = [];
    [-0.48, 0.48].forEach(x => {
      const exhaustGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.3, 20);
      const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, -0.1, -2.3);
      this.carPivot.add(exhaust);

      // Inner exhaust glow
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.5 });
      const glow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16),
        glowMat
      );
      glow.rotation.x = Math.PI / 2;
      glow.position.set(x, -0.1, -2.42);
      this.carPivot.add(glow);
      this.exhaustGlows.push(glowMat);
    });

    // 4. Wheels with torus tires
    const wheelPositions = [
      { x: -1.05, y: -0.35, z: 1.4 },
      { x:  1.05, y: -0.35, z: 1.4 },
      { x: -1.05, y: -0.35, z: -1.4 },
      { x:  1.05, y: -0.35, z: -1.4 }
    ];

    this.wheels = [];
    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      // Rubber tire (torus for rounder look)
      const tireGeo = new THREE.TorusGeometry(0.38, 0.14, 16, 32);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.y = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Alloy rim face
      const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 20);
      const rim = new THREE.Mesh(rimGeo, chromeMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Rim spokes
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, 0.58, 0.03);
        const spoke = new THREE.Mesh(spokeGeo, chromeMat);
        spoke.rotation.z = (s / 5) * Math.PI;
        spoke.position.x = pos.x > 0 ? 0.02 : -0.02;
        wheelGroup.add(spoke);
      }

      // Brake caliper
      const caliperGeo = new THREE.BoxGeometry(0.1, 0.2, 0.14);
      const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
      caliper.position.set(pos.x > 0 ? -0.1 : 0.1, 0.18, 0);
      wheelGroup.add(caliper);

      this.carPivot.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });

    // 5. Headlights (LED DRLs)
    this.headlights = [];
    [-0.78, 0.78].forEach(x => {
      // DRL strip
      const drlGeo = new THREE.BoxGeometry(0.4, 0.04, 0.12);
      const drlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const drl = new THREE.Mesh(drlGeo, drlMat);
      drl.position.set(x, 0.12, 2.2);
      this.carPivot.add(drl);

      // Main projector
      const lightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
      );
      lightMesh.position.set(x, 0.06, 2.22);
      this.carPivot.add(lightMesh);

      const spot = new THREE.SpotLight(0xe0f2fe, 3.0, 15, Math.PI / 7, 0.6, 1.2);
      spot.position.set(x, 0.06, 2.28);
      spot.target.position.set(x, -0.5, 10);
      this.carPivot.add(spot);
      this.carPivot.add(spot.target);
      this.headlights.push(spot);
    });

    // Full-width cyber rear lightbar
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const tailMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.06, 0.1),
      tailMat
    );
    tailMesh.position.set(0, 0.14, -2.2);
    this.carPivot.add(tailMesh);
    this.tailLightMat = tailMat;

    // Underglow
    this.underglowLight = new THREE.PointLight(this.bodyColor, 3.0, 5.0, 1.5);
    this.underglowLight.position.set(0, -0.45, 0);
    this.carPivot.add(this.underglowLight);

    this.scene.add(this.carPivot);
  }

  buildSparkleParticles() {
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3.5 + Math.random() * 2.5;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const sparkleMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparkleParticles = new THREE.Points(geo, sparkleMat);
    this.scene.add(this.sparkleParticles);
  }

  setupInteractions() {
    const speedSlider = document.getElementById('car-speed');
    const speedVal = document.getElementById('car-speed-val');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.spinSpeed = parseFloat(e.target.value);
        if (speedVal) speedVal.textContent = `${this.spinSpeed.toFixed(1)}x`;
      });
    }

    const swatches = document.querySelectorAll('#car-colors .color-dot');
    swatches.forEach(dot => {
      dot.addEventListener('click', () => {
        swatches.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const hex = parseInt(dot.dataset.color.replace('#', '0x'), 16);
        this.setColor(hex);
        if (window.soundFX) window.soundFX.playCarEngineRev();
      });
    });
  }

  setAxis(axis) {
    this.rotationAxis = axis;
    this.carPivot.rotation.set(0, 0, 0);

    const axisLabel = document.getElementById('car-axis-val');
    if (axisLabel) {
      const names = {
        'y': 'Y-Axis (Turntable)',
        'x': 'X-Axis (Pitch)',
        'z': 'Z-Axis (Roll)',
        'gyro': 'Gimbal (Multi)'
      };
      axisLabel.textContent = names[axis] || axis.toUpperCase();
    }
  }

  setColor(colorHex) {
    this.bodyColor = colorHex;
    this.carBodyMat.color.setHex(colorHex);
    this.rimTorusMat.color.setHex(colorHex);
    this.innerRimMat.color.setHex(colorHex);
    this.underglowLight.color.setHex(colorHex);
    this.sparkleParticles.material.color.setHex(colorHex);
  }

  update(delta) {
    const elapsed = this.clock.getElapsedTime();

    const step = this.spinSpeed * delta * 1.6;
    this.angle += step;

    switch (this.rotationAxis) {
      case 'y':
        this.carPivot.rotation.y = this.angle;
        this.carPivot.rotation.x = 0;
        this.carPivot.rotation.z = 0;
        this.turntableGroup.rotation.y = this.angle;
        break;
      case 'x':
        this.carPivot.rotation.x = this.angle;
        this.carPivot.rotation.y = 0;
        this.carPivot.rotation.z = 0;
        this.turntableGroup.rotation.y = 0;
        break;
      case 'z':
        this.carPivot.rotation.z = this.angle;
        this.carPivot.rotation.x = 0;
        this.carPivot.rotation.y = 0;
        this.turntableGroup.rotation.y = 0;
        break;
      case 'gyro':
        this.carPivot.rotation.y = this.angle;
        this.carPivot.rotation.x = Math.sin(this.angle * 0.7) * 0.45;
        this.carPivot.rotation.z = Math.cos(this.angle * 0.5) * 0.35;
        this.turntableGroup.rotation.y = this.angle * 0.5;
        break;
    }

    // Wheel spin
    if (this.wheels) {
      this.wheels.forEach(w => {
        w.children[1].rotation.x += this.spinSpeed * delta * 5;
      });
    }

    // Exhaust glow flicker
    if (this.exhaustGlows) {
      this.exhaustGlows.forEach(mat => {
        mat.opacity = 0.3 + Math.sin(elapsed * 12) * 0.15 + Math.random() * 0.1;
      });
    }

    // Tail light pulse
    if (this.tailLightMat) {
      this.tailLightMat.color.setHex(
        elapsed % 0.1 < 0.005 ? 0xff3344 : 0xff0033
      );
    }

    // Sparkle particle drift
    if (this.sparkleParticles) {
      const posAttr = this.sparkleParticles.geometry.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += delta * 0.3;
        if (arr[i + 1] > 3) arr[i + 1] = 0;
      }
      posAttr.needsUpdate = true;
      this.sparkleParticles.material.opacity = 0.3 + Math.sin(elapsed * 2) * 0.15;
    }

    // RPM display
    const rpmVal = document.getElementById('car-rpm-val');
    if (rpmVal) {
      rpmVal.textContent = Math.abs(this.spinSpeed * 15).toFixed(1);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  resetCamera() {
    this.controls.reset(new THREE.Vector3(5.5, 3.2, 6.8), new THREE.Vector3(0, 0.9, 0));
  }
}

window.SceneCar = SceneCar;
