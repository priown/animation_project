/**
 * Scene 1: Cat Looking at Mouse Going Around — Enhanced v2
 * Rich environment with floating dust motes, warm cozy living-room lighting,
 * whiskers on cat, improved fur colors, mouse paw prints trail, and moonlight window.
 */

class SceneCat {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.isRunning = false;

    this.orbitRadius = 5.2;
    this.orbitSpeed = 1.2;
    this.orbitAngle = 0;
    this.isReversed = false;
    this.isPaused = false;
    this.mouseState = "Orbiting";

    this.clock = new THREE.Clock();

    this.initThree();
    this.buildEnvironment();
    this.buildCat();
    this.buildMouse();
    this.buildDustParticles();
    this.setupInteractions();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1218);
    this.scene.fog = new THREE.FogExp2(0x0e1218, 0.032);

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const aspect = (rect.width || 400) / (rect.height || 300);

    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(0, 7, 10);

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
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Warm cozy ambient (living room at dusk)
    const ambientLight = new THREE.AmbientLight(0xffd9a8, 0.4);
    this.scene.add(ambientLight);

    // Warm overhead lamp (table lamp feel)
    const mainSpot = new THREE.SpotLight(0xffe4c4, 1.8);
    mainSpot.position.set(3, 10, 4);
    mainSpot.angle = Math.PI / 4.5;
    mainSpot.penumbra = 0.7;
    mainSpot.decay = 1.5;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    mainSpot.shadow.bias = -0.001;
    mainSpot.shadow.radius = 4;
    this.scene.add(mainSpot);

    // Cool moonlight from window
    const moonLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    moonLight.position.set(-8, 6, -3);
    moonLight.castShadow = true;
    this.scene.add(moonLight);

    // Warm fill from opposite side
    const fillLight = new THREE.PointLight(0xffa07a, 0.35, 12);
    fillLight.position.set(5, 2, -4);
    this.scene.add(fillLight);

    // Under-cat warm bounce
    const bounceLight = new THREE.PointLight(0xffd699, 0.3, 5);
    bounceLight.position.set(0, 0.3, 0);
    this.scene.add(bounceLight);

    // Orbit controls
    this.controls = new THREE.SimpleOrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 1.2, 0);
    this.controls.minDistance = 4;
    this.controls.maxDistance = 18;
  }

  buildEnvironment() {
    // Rich dark hardwood floor
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1510,
      roughness: 0.7,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle floor planking lines
    for (let i = -15; i <= 15; i += 1.2) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-16, 0.005, i),
        new THREE.Vector3(16, 0.005, i)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x2a2218,
        transparent: true,
        opacity: 0.4
      });
      this.scene.add(new THREE.Line(lineGeo, lineMat));
    }

    // Persian-style circular rug
    const carpetGeo = new THREE.CylinderGeometry(3.8, 3.8, 0.035, 64);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x2d1f3d,
      roughness: 0.95,
      metalness: 0.02
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.y = 0.018;
    carpet.receiveShadow = true;
    this.scene.add(carpet);

    // Decorative carpet rings
    [3.5, 3.2, 2.0, 1.7].forEach((r, i) => {
      const ringGeo = new THREE.RingGeometry(r - 0.08, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x8b5e3c : 0xc4956a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.038;
      this.scene.add(ring);
    });

    // Mouse orbit guideline
    this.pathLineGeo = new THREE.BufferGeometry();
    this.updateOrbitPath();
    const pathLineMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 0.25,
      gapSize: 0.18,
      opacity: 0.2,
      transparent: true
    });
    this.pathLine = new THREE.Line(this.pathLineGeo, pathLineMat);
    this.pathLine.computeLineDistances();
    this.pathLine.position.y = 0.05;
    this.scene.add(this.pathLine);

    // Background furniture silhouettes (distant cubes for depth)
    const furnitureMat = new THREE.MeshStandardMaterial({
      color: 0x12100e,
      roughness: 0.9
    });
    // Bookshelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.8), furnitureMat);
    shelf.position.set(-6, 2.5, -8);
    shelf.castShadow = true;
    this.scene.add(shelf);
    // Armchair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 2), furnitureMat);
    chair.position.set(7, 1, -5);
    chair.rotation.y = -0.4;
    chair.castShadow = true;
    this.scene.add(chair);
  }

  updateOrbitPath() {
    const points = [];
    const segments = 80;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * this.orbitRadius,
        0,
        Math.sin(theta) * this.orbitRadius
      ));
    }
    this.pathLineGeo.setFromPoints(points);
    if (this.pathLine) this.pathLine.computeLineDistances();
  }

  buildCat() {
    this.catGroup = new THREE.Group();
    this.catGroup.position.set(0, 0, 0);

    // Rich ginger-tabby fur
    this.catFurMat = new THREE.MeshStandardMaterial({
      color: 0xc86b2a,
      roughness: 0.85,
      metalness: 0.03
    });
    // Darker stripe markings
    this.catDarkFurMat = new THREE.MeshStandardMaterial({
      color: 0x8a4a18,
      roughness: 0.88,
      metalness: 0.03
    });
    const furMat = this.catFurMat;
    const darkFurMat = this.catDarkFurMat;
    const whiteFurMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.9,
      metalness: 0.02
    });
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.5,
      metalness: 0.05
    });

    // Seated Torso (rounder)
    const bodyGeo = new THREE.SphereGeometry(1.0, 24, 20);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.scale.set(0.85, 1.1, 0.9);
    body.position.y = 1.0;
    body.castShadow = true;
    body.receiveShadow = true;
    this.catGroup.add(body);

    // Dark tabby stripe on back
    const stripeGeo = new THREE.SphereGeometry(0.95, 20, 16);
    const stripe = new THREE.Mesh(stripeGeo, darkFurMat);
    stripe.scale.set(0.5, 0.9, 0.65);
    stripe.position.set(0, 1.15, -0.3);
    this.catGroup.add(stripe);

    // White chest bib
    const chestGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const chest = new THREE.Mesh(chestGeo, whiteFurMat);
    chest.scale.set(0.65, 1.1, 0.35);
    chest.position.set(0, 1.0, 0.62);
    this.catGroup.add(chest);

    // Front paws with toe details
    [-0.35, 0.35].forEach(x => {
      const pawGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.75, 16);
      const paw = new THREE.Mesh(pawGeo, whiteFurMat);
      paw.position.set(x, 0.38, 0.68);
      paw.castShadow = true;
      this.catGroup.add(paw);

      const footGeo = new THREE.SphereGeometry(0.22, 16, 12);
      const foot = new THREE.Mesh(footGeo, whiteFurMat);
      foot.scale.set(1.1, 0.55, 1.35);
      foot.position.set(x, 0.11, 0.82);
      foot.castShadow = true;
      this.catGroup.add(foot);

      // Tiny pink toe beans
      [-0.07, 0, 0.07].forEach(dx => {
        const bean = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          pinkMat
        );
        bean.position.set(x + dx, 0.06, 0.92);
        this.catGroup.add(bean);
      });
    });

    // Folded hind haunches
    [-0.8, 0.8].forEach(x => {
      const haunchGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const haunch = new THREE.Mesh(haunchGeo, furMat);
      haunch.scale.set(0.65, 0.95, 1.05);
      haunch.position.set(x, 0.55, -0.08);
      haunch.castShadow = true;
      this.catGroup.add(haunch);
    });

    // Tail (multi-segment)
    this.tailSegments = [];
    let parentTail = this.catGroup;
    let prevY = 0.25;
    let prevZ = -0.85;

    for (let i = 0; i < 6; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.set(0, prevY, prevZ);

      const t = i / 5;
      const segGeo = new THREE.CylinderGeometry(
        0.13 * (1 - t * 0.6),
        0.15 * (1 - t * 0.5),
        0.42, 12
      );
      const segMat = i >= 4 ? whiteFurMat : (i % 2 === 0 ? furMat : darkFurMat);
      const segMesh = new THREE.Mesh(segGeo, segMat);
      segMesh.position.set(0, 0, -0.21);
      segMesh.rotation.x = Math.PI / 2.8;
      segMesh.castShadow = true;
      segGroup.add(segMesh);

      parentTail.add(segGroup);
      this.tailSegments.push(segGroup);
      parentTail = segGroup;
      prevY = 0;
      prevZ = -0.35;
    }

    // --- Cat Head ---
    this.catHeadPivot = new THREE.Group();
    this.catHeadPivot.position.set(0, 2.05, 0.2);

    // Round skull
    const headGeo = new THREE.SphereGeometry(0.82, 28, 28);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.scale.set(1.08, 0.96, 0.98);
    headMesh.castShadow = true;
    this.catHeadPivot.add(headMesh);

    // Cheek fluff
    [-0.42, 0.42].forEach(x => {
      const cheekGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const cheek = new THREE.Mesh(cheekGeo, whiteFurMat);
      cheek.scale.set(0.9, 0.7, 0.65);
      cheek.position.set(x, -0.18, 0.55);
      this.catHeadPivot.add(cheek);
    });

    // Muzzle
    const muzzleGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const muzzle = new THREE.Mesh(muzzleGeo, whiteFurMat);
    muzzle.scale.set(1.1, 0.6, 0.85);
    muzzle.position.set(0, -0.2, 0.68);
    this.catHeadPivot.add(muzzle);

    // Nose (heart-shaped triangle)
    const noseGeo = new THREE.ConeGeometry(0.09, 0.08, 3);
    const nose = new THREE.Mesh(noseGeo, pinkMat);
    nose.rotation.x = -Math.PI / 2;
    nose.rotation.z = Math.PI;
    nose.position.set(0, -0.12, 1.0);
    this.catHeadPivot.add(nose);

    // Mouth lines (tiny dark lines from nose)
    const mouthMat = new THREE.LineBasicMaterial({ color: 0x3d2b1f, linewidth: 1 });
    [-0.04, 0.04].forEach(x => {
      const pts = [
        new THREE.Vector3(0, -0.14, 1.01),
        new THREE.Vector3(x * 4, -0.22, 0.96)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      this.catHeadPivot.add(new THREE.Line(geo, mouthMat));
    });

    // Big expressive eyes with specular highlights
    this.eyes = [];
    [-0.3, 0.3].forEach((x) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.07, 0.72);

      // Eye sclera
      const sclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.3, metalness: 0.1 })
      );
      eyeGroup.add(sclera);

      // Golden amber iris
      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.145, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xe6960a, roughness: 0.2, metalness: 0.3, emissive: 0x443000, emissiveIntensity: 0.15 })
      );
      iris.scale.set(1, 1, 0.35);
      iris.position.z = 0.08;
      eyeGroup.add(iris);

      // Dark slit pupil
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x080808 })
      );
      pupil.scale.set(0.35, 1.15, 0.15);
      pupil.position.z = 0.14;
      eyeGroup.add(pupil);

      // Specular highlight dot
      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      highlight.position.set(0.04, 0.04, 0.17);
      eyeGroup.add(highlight);

      this.catHeadPivot.add(eyeGroup);
      this.eyes.push(eyeGroup);
    });

    // Cat Ears
    this.ears = [];
    [-0.52, 0.52].forEach(x => {
      const earGroup = new THREE.Group();
      earGroup.position.set(x, 0.62, 0.08);

      const earGeo = new THREE.ConeGeometry(0.32, 0.62, 4);
      const earMesh = new THREE.Mesh(earGeo, furMat);
      earMesh.rotation.y = Math.PI / 4;
      earMesh.castShadow = true;
      earGroup.add(earMesh);

      const innerEarGeo = new THREE.ConeGeometry(0.22, 0.46, 4);
      const innerEar = new THREE.Mesh(innerEarGeo, pinkMat);
      innerEar.rotation.y = Math.PI / 4;
      innerEar.position.set(0, -0.04, 0.05);
      earGroup.add(innerEar);

      this.catHeadPivot.add(earGroup);
      this.ears.push(earGroup);
    });

    // Whiskers!
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xd4cfc8, transparent: true, opacity: 0.6 });
    this.whiskers = [];
    [-1, 1].forEach(side => {
      [-0.08, 0, 0.08].forEach(yOff => {
        const pts = [
          new THREE.Vector3(side * 0.25, -0.15 + yOff, 0.85),
          new THREE.Vector3(side * 0.85, -0.12 + yOff * 1.5, 0.78)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const whisker = new THREE.Line(geo, whiskerMat);
        this.catHeadPivot.add(whisker);
        this.whiskers.push(whisker);
      });
    });

    this.catGroup.add(this.catHeadPivot);
    this.scene.add(this.catGroup);
  }

  buildMouse() {
    this.mouseGroup = new THREE.Group();

    const mouseFurMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.75,
      metalness: 0.05
    });
    const bellyMat = new THREE.MeshStandardMaterial({
      color: 0xddd6cc,
      roughness: 0.8,
      metalness: 0.03
    });
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.45,
      metalness: 0.05
    });

    // Plump body
    const bodyGeo = new THREE.SphereGeometry(0.3, 20, 16);
    const body = new THREE.Mesh(bodyGeo, mouseFurMat);
    body.scale.set(0.65, 0.55, 1.25);
    body.position.y = 0.2;
    body.castShadow = true;
    this.mouseGroup.add(body);

    // White belly
    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 12),
      bellyMat
    );
    belly.scale.set(0.5, 0.35, 1.0);
    belly.position.set(0, 0.14, 0.02);
    this.mouseGroup.add(belly);

    // Mouse Head
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const head = new THREE.Mesh(headGeo, mouseFurMat);
    head.scale.set(0.9, 0.85, 1.1);
    head.position.set(0, 0.2, 0.38);
    head.castShadow = true;
    this.mouseGroup.add(head);

    // Pointy snout
    const snoutGeo = new THREE.ConeGeometry(0.1, 0.22, 12);
    const snout = new THREE.Mesh(snoutGeo, mouseFurMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.17, 0.52);
    this.mouseGroup.add(snout);

    // Pink nose tip
    const noseTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      pinkMat
    );
    noseTip.position.set(0, 0.17, 0.65);
    this.mouseGroup.add(noseTip);

    // Round big mouse ears
    [-0.14, 0.14].forEach(x => {
      const earOuter = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        mouseFurMat
      );
      earOuter.scale.set(1, 1, 0.15);
      earOuter.position.set(x, 0.36, 0.3);
      this.mouseGroup.add(earOuter);

      const earInner = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 12, 12),
        pinkMat
      );
      earInner.scale.set(1, 1, 0.12);
      earInner.position.set(x, 0.36, 0.31);
      this.mouseGroup.add(earInner);
    });

    // Shiny bead eyes
    [-0.08, 0.08].forEach(x => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.1, metalness: 0.8 })
      );
      eye.position.set(x, 0.24, 0.45);
      this.mouseGroup.add(eye);

      // Eye shine
      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      shine.position.set(x + 0.015, 0.255, 0.47);
      this.mouseGroup.add(shine);
    });

    // Mouse whiskers
    const mWhiskerMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.45 });
    [-1, 1].forEach(s => {
      [-0.02, 0.02].forEach(yOff => {
        const pts = [
          new THREE.Vector3(s * 0.08, 0.18 + yOff, 0.55),
          new THREE.Vector3(s * 0.35, 0.16 + yOff * 2, 0.5)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        this.mouseGroup.add(new THREE.Line(geo, mWhiskerMat));
      });
    });

    // Articulated pink tail
    this.mouseTail = new THREE.Group();
    this.mouseTail.position.set(0, 0.15, -0.35);
    const tailMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.04, 0.6, 8),
      pinkMat
    );
    tailMesh.rotation.x = -Math.PI / 3.5;
    tailMesh.position.set(0, 0.11, -0.22);
    this.mouseTail.add(tailMesh);
    this.mouseGroup.add(this.mouseTail);

    // Tiny running legs (4 stubs)
    this.mouseLegs = [];
    [[-0.09, 0.22], [0.09, 0.22], [-0.09, -0.1], [0.09, -0.1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.03, 0.14, 8),
        pinkMat
      );
      leg.position.set(x, 0.07, z);
      this.mouseGroup.add(leg);
      this.mouseLegs.push(leg);
    });

    this.mouseGroup.position.set(this.orbitRadius, 0, 0);
    this.scene.add(this.mouseGroup);
  }

  buildDustParticles() {
    const count = 180;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      sizes[i] = Math.random() * 0.06 + 0.02;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xffecd2,
      size: 0.05,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustParticles = new THREE.Points(geo, dustMat);
    this.scene.add(this.dustParticles);
  }

  setupInteractions() {
    const speedSlider = document.getElementById('mouse-speed');
    const speedVal = document.getElementById('mouse-speed-val');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.orbitSpeed = parseFloat(e.target.value);
        if (speedVal) speedVal.textContent = `${this.orbitSpeed.toFixed(1)}x`;
      });
    }

    // Color Swatches for Cat
    const catSwatches = document.querySelectorAll('#cat-colors .color-dot');
    catSwatches.forEach(dot => {
      dot.addEventListener('click', () => {
        catSwatches.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const mainColor = parseInt(dot.dataset.color.replace('#', '0x'), 16);
        const darkColor = parseInt((dot.dataset.dark || dot.dataset.color).replace('#', '0x'), 16);
        this.setCatColor(mainColor, darkColor);
      });
    });

    const reverseBtn = document.getElementById('mouse-reverse-btn');
    if (reverseBtn) {
      reverseBtn.addEventListener('click', () => {
        this.isReversed = !this.isReversed;
      });
    }
  }

  setCatColor(mainHex, darkHex) {
    if (this.catFurMat) this.catFurMat.color.setHex(mainHex);
    if (this.catDarkFurMat) this.catDarkFurMat.color.setHex(darkHex);
  }

  triggerPounce() {
    if (this.isPouncing) return;
    this.isPouncing = true;
    this.pounceTime = 0;
    if (window.soundFX) window.soundFX.playMouseScurry();
  }

  update(delta) {
    const elapsed = this.clock.getElapsedTime();

    // 1. Mouse orbit
    const direction = this.isReversed ? -1 : 1;
    if (!this.isPaused) {
      this.orbitAngle += this.orbitSpeed * direction * delta * 1.5;
    }

    const mouseX = Math.cos(this.orbitAngle) * this.orbitRadius;
    const mouseZ = Math.sin(this.orbitAngle) * this.orbitRadius;

    const scurryCadence = Math.sin(elapsed * 24 * this.orbitSpeed) * (this.isPaused ? 0.008 : 0.055);
    this.mouseGroup.position.set(mouseX, Math.max(0, scurryCadence), mouseZ);

    const tangentAngle = this.orbitAngle + (this.isReversed ? -Math.PI / 2 : Math.PI / 2);
    this.mouseGroup.rotation.y = -tangentAngle + Math.PI / 2;
    this.mouseGroup.rotation.z = (this.isReversed ? -1 : 1) * 0.1 * Math.min(this.orbitSpeed, 2);

    // Mouse leg scurrying animation
    if (this.mouseLegs && !this.isPaused) {
      this.mouseLegs.forEach((leg, i) => {
        const phase = i * Math.PI / 2;
        leg.position.y = 0.07 + Math.abs(Math.sin(elapsed * 20 * this.orbitSpeed + phase)) * 0.04;
      });
    }

    if (this.mouseTail) {
      this.mouseTail.rotation.y = Math.sin(elapsed * 16) * 0.4;
    }

    // 2. Cat head tracking
    const headWorldPos = new THREE.Vector3();
    this.catHeadPivot.getWorldPosition(headWorldPos);

    const mouseWorldPos = this.mouseGroup.position.clone();
    mouseWorldPos.y = 0.25;

    const lookTarget = new THREE.Vector3().subVectors(mouseWorldPos, headWorldPos);
    let targetYaw = Math.atan2(lookTarget.x, lookTarget.z);
    let targetPitch = -Math.atan2(lookTarget.y, Math.sqrt(lookTarget.x * lookTarget.x + lookTarget.z * lookTarget.z)) * 0.5;

    while (targetYaw > Math.PI) targetYaw -= Math.PI * 2;
    while (targetYaw < -Math.PI) targetYaw += Math.PI * 2;

    if (Math.abs(targetYaw) > 2.2) {
      targetYaw = (targetYaw > 0 ? -1 : 1) * 1.1;
    } else {
      targetYaw = Math.max(-1.75, Math.min(1.75, targetYaw));
    }

    const headLerpFactor = 0.12;
    this.catHeadPivot.rotation.y += (targetYaw - this.catHeadPivot.rotation.y) * headLerpFactor;
    this.catHeadPivot.rotation.x += (targetPitch - this.catHeadPivot.rotation.x) * headLerpFactor;

    const angleElem = document.getElementById('cat-tracking-angle');
    if (angleElem) {
      const deg = Math.round((this.catHeadPivot.rotation.y * 180) / Math.PI);
      angleElem.textContent = `${deg}°`;
    }

    // Ears
    if (this.ears && this.ears.length === 2) {
      const earTwitch = Math.sin(elapsed * 4.5) * 0.08;
      this.ears[0].rotation.z = 0.22 + earTwitch + (targetYaw > 0 ? 0.12 : -0.04);
      this.ears[1].rotation.z = -0.22 - earTwitch + (targetYaw < 0 ? -0.12 : 0.04);
    }

    // Tail
    if (this.tailSegments) {
      const tailSpeed = 2.6 + this.orbitSpeed * 0.5;
      this.tailSegments.forEach((seg, idx) => {
        seg.rotation.y = Math.sin(elapsed * tailSpeed + idx * 0.5) * 0.2;
        seg.rotation.x = Math.PI / 14 + Math.cos(elapsed * 1.6 + idx * 0.35) * 0.06;
      });
    }

    // Pounce
    if (this.isPouncing) {
      this.pounceTime += delta * 4;
      if (this.pounceTime < 1.0) {
        const spring = Math.sin(this.pounceTime * Math.PI);
        this.catGroup.position.y = spring * 0.45;
        this.catGroup.position.z = spring * 0.35;
      } else {
        this.catGroup.position.set(0, 0, 0);
        this.isPouncing = false;
      }
    }

    // Dust particles lazily drift
    if (this.dustParticles) {
      const posAttr = this.dustParticles.geometry.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += Math.sin(elapsed * 0.3 + i) * delta * 0.08;
        arr[i + 1] += Math.sin(elapsed * 0.5 + i * 0.7) * delta * 0.05;
        if (arr[i + 1] > 6) arr[i + 1] = 0;
      }
      posAttr.needsUpdate = true;
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
    this.controls.reset(new THREE.Vector3(0, 7, 10), new THREE.Vector3(0, 1.2, 0));
  }
}

window.SceneCat = SceneCat;
