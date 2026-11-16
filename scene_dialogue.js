/**
 * Scene 3: The Dramatic Conversation — Enhanced v2
 * Cinematic noir stage with volumetric fog particles, rain streak lines,
 * multiple colored spotlights, wet-floor reflections, improved character detail,
 * scar/battle marks, medal, glowing prosthetic sockets, and richer animation.
 */

class SceneDialogue {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);

    this.dialogueLines = [
      {
        speaker: "COMMANDER VANE",
        text: '"They think the ground defines a man..."',
        subtext: "[A low, deliberate whisper. The gaze rises slowly from the shadows.]",
        cameraShot: "hero",
        pose: "calm_intense",
        spotlightIntensity: 2.5,
        lightColor: 0x93c5fd
      },
      {
        speaker: "COMMANDER VANE",
        text: '"They said: \'Without legs, you will never move an empire.\'"',
        subtext: "[A cold, defiant smirk. Fingers grip the steel rim of the drive wheel.]",
        cameraShot: "profile",
        pose: "accuse_point",
        spotlightIntensity: 3.2,
        lightColor: 0xc084fc
      },
      {
        speaker: "COMMANDER VANE",
        text: '"I told them... wheels don\'t tire. Iron doesn\'t bleed. And conviction has no need for footsteps."',
        subtext: "[Leaning forward with piercing conviction. The chest heaves.]",
        cameraShot: "hero",
        pose: "lean_forward",
        spotlightIntensity: 3.8,
        lightColor: 0x22d3ee
      },
      {
        speaker: "COMMANDER VANE",
        text: '"Look at me. Look into my eyes. Do I look like someone who is standing down?"',
        subtext: "[A clenched fist strikes the steel armrest. The spotlight tightens.]",
        cameraShot: "close",
        pose: "clenched_fist",
        spotlightIntensity: 4.5,
        lightColor: 0xfb7185
      },
      {
        speaker: "COMMANDER VANE",
        text: '"I don\'t need legs to make this world tremble."',
        subtext: "[Head held high with absolute authority. Stage lights flare into the mist.]",
        cameraShot: "wide",
        pose: "triumph_command",
        spotlightIntensity: 5.2,
        lightColor: 0x22d3ee
      }
    ];

    this.currentLineIdx = 0;
    this.isAutoPlaying = true;
    this.autoPlayTimer = null;
    this.rainEnabled = true;

    this.shotPresets = {
      'hero': { pos: new THREE.Vector3(0, 1.4, 3.8), target: new THREE.Vector3(0, 1.6, 0) },
      'close': { pos: new THREE.Vector3(0, 2.1, 1.9), target: new THREE.Vector3(0, 2.15, 0) },
      'profile': { pos: new THREE.Vector3(3.0, 1.7, 2.0), target: new THREE.Vector3(0, 1.75, 0) },
      'wide': { pos: new THREE.Vector3(0.5, 2.5, 6.0), target: new THREE.Vector3(0, 1.3, 0) }
    };

    this.activeShot = 'hero';
    this.cameraLerpSpeed = 0.045;
    this.targetCameraPos = this.shotPresets['hero'].pos.clone();
    this.targetCameraLook = this.shotPresets['hero'].target.clone();

    this.clock = new THREE.Clock();

    this.initThree();
    this.buildStage();
    this.buildCharacter();
    this.buildRainParticles();
    this.buildFogParticles();
    this.setupInteractions();
    this.displayCurrentLine(false);

    // Start auto-play by default
    this.autoPlayTimer = setInterval(() => this.advanceLine(1), 5200);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040508);
    this.scene.fog = new THREE.FogExp2(0x040508, 0.06);

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const aspect = (rect.width || 400) / (rect.height || 300);

    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.copy(this.targetCameraPos);

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
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Minimal ambient — let spotlights dominate
    const ambient = new THREE.AmbientLight(0x0a1020, 0.2);
    this.scene.add(ambient);

    // Main overhead hero spotlight
    this.stageSpotlight = new THREE.SpotLight(0xa5f3fc, 2.8);
    this.stageSpotlight.position.set(0.3, 8, 1.5);
    this.stageSpotlight.angle = Math.PI / 5.5;
    this.stageSpotlight.penumbra = 0.7;
    this.stageSpotlight.decay = 1.3;
    this.stageSpotlight.castShadow = true;
    this.stageSpotlight.shadow.mapSize.width = 1024;
    this.stageSpotlight.shadow.mapSize.height = 1024;
    this.stageSpotlight.shadow.bias = -0.001;
    this.stageSpotlight.shadow.radius = 4;
    this.scene.add(this.stageSpotlight);

    // Purple dramatic kicker from rear-left
    this.kickerLight = new THREE.SpotLight(0xc084fc, 1.5);
    this.kickerLight.position.set(-4, 5, -5);
    this.kickerLight.angle = Math.PI / 3;
    this.kickerLight.penumbra = 0.9;
    this.scene.add(this.kickerLight);

    // Red accent from right
    this.accentLight = new THREE.PointLight(0xfb7185, 0.3, 6);
    this.accentLight.position.set(4, 2, 2);
    this.scene.add(this.accentLight);

    // Warm under-fill
    this.underFill = new THREE.PointLight(0xff8c5a, 0.25, 4);
    this.underFill.position.set(0, 0.3, 1.5);
    this.scene.add(this.underFill);

    // Controls
    this.controls = new THREE.SimpleOrbitControls(this.camera, this.canvas);
    this.controls.target.copy(this.targetCameraLook);
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 14;
  }

  buildStage() {
    // Wet theatrical floor
    const stageGeo = new THREE.CylinderGeometry(6.5, 7.0, 0.25, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0c1018,
      roughness: 0.15,
      metalness: 0.85
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.13;
    stage.receiveShadow = true;
    this.scene.add(stage);

    // Concentric focus rings
    [1.5, 1.55, 2.5, 2.55, 4.0, 4.05].forEach((r, i) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i < 2 ? 0xc084fc : (i < 4 ? 0x22d3ee : 0x3b82f6),
        transparent: true,
        opacity: i % 2 === 0 ? 0.2 : 0.08,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.005;
      this.scene.add(ring);
    });

    // Stage edge columns (distant)
    [-5, 5].forEach(x => {
      const colGeo = new THREE.CylinderGeometry(0.15, 0.15, 6, 12);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.5, metalness: 0.6 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(x, 3, -4);
      col.castShadow = true;
      this.scene.add(col);
    });
  }

  buildCharacter() {
    this.actorGroup = new THREE.Group();
    this.actorGroup.position.set(0, 0, 0);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.25,
      metalness: 0.88
    });
    const chromeSpokeMat = new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      roughness: 0.12,
      metalness: 0.98
    });
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x1a1714,
      roughness: 0.65,
      metalness: 0.08
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc9956a,
      roughness: 0.6,
      metalness: 0.04
    });
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x151d2e,
      roughness: 0.75,
      metalness: 0.18
    });
    const coatDetailMat = new THREE.MeshStandardMaterial({
      color: 0x1a2540,
      roughness: 0.7,
      metalness: 0.2
    });
    const brassSocketMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.3,
      metalness: 0.85,
      emissive: 0x442200,
      emissiveIntensity: 0.1
    });
    const glowTelemetryMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const goldMedalMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x553300,
      emissiveIntensity: 0.15
    });

    // ==========================================
    // 1. Wheelchair
    // ==========================================
    this.wheelchair = new THREE.Group();

    this.driveWheels = [];
    [-0.72, 0.72].forEach((x, idx) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(x, 0.65, -0.15);

      // Tire
      const tireGeo = new THREE.TorusGeometry(0.65, 0.045, 16, 56);
      const tire = new THREE.Mesh(tireGeo, metalMat);
      wheelAssembly.add(tire);

      // Push rim
      const pushRimGeo = new THREE.TorusGeometry(0.57, 0.022, 12, 56);
      const pushRim = new THREE.Mesh(pushRimGeo, chromeSpokeMat);
      pushRim.position.z = idx === 0 ? -0.055 : 0.055;
      wheelAssembly.add(pushRim);

      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.1, 16);
      const hub = new THREE.Mesh(hubGeo, chromeSpokeMat);
      hub.rotation.z = Math.PI / 2;
      wheelAssembly.add(hub);

      // Spokes
      for (let s = 0; s < 10; s++) {
        const spokeGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.25, 6);
        const spoke = new THREE.Mesh(spokeGeo, chromeSpokeMat);
        spoke.rotation.z = (s / 10) * Math.PI;
        wheelAssembly.add(spoke);
      }

      this.wheelchair.add(wheelAssembly);
      this.driveWheels.push(wheelAssembly);
    });

    // Front castors
    [-0.5, 0.5].forEach(x => {
      const castorWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.035, 12, 20),
        metalMat
      );
      castorWheel.position.set(x, 0.12, 0.65);
      castorWheel.castShadow = true;
      this.wheelchair.add(castorWheel);

      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8),
        metalMat
      );
      strut.position.set(x, 0.32, 0.65);
      this.wheelchair.add(strut);
    });

    // Frame tubes
    const framePts = [
      [-0.5, 0.5, 0.6], [0.5, 0.5, 0.6],
      [-0.5, 0.5, -0.4], [0.5, 0.5, -0.4]
    ];
    // Cross members
    [[-0.5, 0.5], [0.5, 0.5]].forEach(([x, y]) => {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.05, 8),
        metalMat
      );
      tube.rotation.x = Math.PI / 2;
      tube.position.set(x, y, 0.1);
      this.wheelchair.add(tube);
    });
    // Side rails
    [-0.5, 0.5].forEach(x => {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8),
        metalMat
      );
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.5, x > 0 ? 0.6 : -0.4);
      this.wheelchair.add(rail);
    });

    // Seat cushion
    const seatGeo = new THREE.BoxGeometry(1.1, 0.12, 1.05);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.56, 0.1);
    seat.castShadow = true;
    this.wheelchair.add(seat);

    // High backrest
    const backGeo = new THREE.BoxGeometry(1.05, 1.15, 0.1);
    const back = new THREE.Mesh(backGeo, leatherMat);
    back.position.set(0, 1.22, -0.4);
    back.rotation.x = -0.06;
    back.castShadow = true;
    this.wheelchair.add(back);

    // Backrest pillars
    [-0.5, 0.5].forEach(x => {
      const pillarGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.35, 8);
      const pillar = new THREE.Mesh(pillarGeo, metalMat);
      pillar.position.set(x, 1.18, -0.43);
      this.wheelchair.add(pillar);
    });

    // Armrests
    [-0.58, 0.58].forEach(x => {
      const armrestGeo = new THREE.BoxGeometry(0.12, 0.055, 0.82);
      const armrest = new THREE.Mesh(armrestGeo, leatherMat);
      armrest.position.set(x, 1.04, 0.15);
      this.wheelchair.add(armrest);

      const supportGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.48, 8);
      const support = new THREE.Mesh(supportGeo, metalMat);
      support.position.set(x, 0.78, 0.2);
      this.wheelchair.add(support);
    });

    this.actorGroup.add(this.wheelchair);

    // ==========================================
    // 2. The Person
    // ==========================================
    this.personGroup = new THREE.Group();
    this.personGroup.position.set(0, 0.62, 0);

    // Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.85, 0.33, 0.68);
    const pelvis = new THREE.Mesh(pelvisGeo, coatMat);
    pelvis.position.set(0, 0.17, 0.05);
    pelvis.castShadow = true;
    this.personGroup.add(pelvis);

    // Residual limbs with prosthetic sockets
    this.socketRings = [];
    [-0.26, 0.26].forEach(x => {
      const thighGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.42, 16);
      const thigh = new THREE.Mesh(thighGeo, coatMat);
      thigh.rotation.x = Math.PI / 2.3;
      thigh.position.set(x, 0.15, 0.3);
      thigh.castShadow = true;
      this.personGroup.add(thigh);

      // Socket cap
      const socketCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 12),
        brassSocketMat
      );
      socketCap.scale.set(1, 0.75, 1);
      socketCap.position.set(x, 0.1, 0.52);
      socketCap.castShadow = true;
      this.personGroup.add(socketCap);

      // Glowing telemetry ring
      const socketRingGeo = new THREE.TorusGeometry(0.155, 0.012, 8, 28);
      const socketRing = new THREE.Mesh(socketRingGeo, glowTelemetryMat);
      socketRing.position.set(x, 0.1, 0.52);
      this.personGroup.add(socketRing);
      this.socketRings.push(socketRing);

      // Secondary thin ring
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.008, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 })
      );
      ring2.position.set(x, 0.1, 0.56);
      this.personGroup.add(ring2);
      this.socketRings.push(ring2);
    });

    // --- Torso ---
    this.torsoPivot = new THREE.Group();
    this.torsoPivot.position.set(0, 0.32, 0.02);

    // Upper torso
    const torsoGeo = new THREE.CylinderGeometry(0.46, 0.4, 0.82, 18);
    this.torsoMesh = new THREE.Mesh(torsoGeo, coatMat);
    this.torsoMesh.position.y = 0.44;
    this.torsoMesh.castShadow = true;
    this.torsoPivot.add(this.torsoMesh);

    // Coat shoulder epaulettes
    [-0.42, 0.42].forEach(x => {
      const ep = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.04, 0.22),
        coatDetailMat
      );
      ep.position.set(x, 0.82, 0.05);
      this.torsoPivot.add(ep);
    });

    // Collar
    const collarGeo = new THREE.BoxGeometry(0.62, 0.2, 0.4);
    const collar = new THREE.Mesh(collarGeo, coatDetailMat);
    collar.position.set(0, 0.87, 0.05);
    this.torsoPivot.add(collar);

    // Medal of valor
    const medalGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
    const medal = new THREE.Mesh(medalGeo, goldMedalMat);
    medal.rotation.x = Math.PI / 2;
    medal.position.set(-0.2, 0.72, 0.42);
    this.torsoPivot.add(medal);
    // Medal ribbon
    const ribbonGeo = new THREE.BoxGeometry(0.05, 0.08, 0.01);
    const ribbon = new THREE.Mesh(ribbonGeo, new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    ribbon.position.set(-0.2, 0.78, 0.42);
    this.torsoPivot.add(ribbon);

    // --- Head ---
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 1.04, 0.05);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.22, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.08;
    this.headPivot.add(neck);

    // Head (rounder)
    const skullGeo = new THREE.SphereGeometry(0.35, 20, 20);
    const skull = new THREE.Mesh(skullGeo, skinMat);
    skull.scale.set(0.72, 0.82, 0.72);
    skull.position.set(0, 0.42, 0.05);
    skull.castShadow = true;
    this.headPivot.add(skull);

    // Jaw
    const jawGeo = new THREE.BoxGeometry(0.42, 0.18, 0.38);
    const jaw = new THREE.Mesh(jawGeo, skinMat);
    jaw.position.set(0, 0.28, 0.08);
    this.headPivot.add(jaw);

    // Brow
    const browGeo = new THREE.BoxGeometry(0.42, 0.08, 0.14);
    const brow = new THREE.Mesh(browGeo, skinMat);
    brow.position.set(0, 0.54, 0.3);
    this.headPivot.add(brow);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.06, 0.2, 4);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = -Math.PI / 6;
    nose.position.set(0, 0.4, 0.35);
    this.headPivot.add(nose);

    // Scar across left cheek (battle-worn commander)
    const scarGeo = new THREE.BoxGeometry(0.005, 0.15, 0.02);
    const scarMat = new THREE.MeshStandardMaterial({ color: 0xa0785a, roughness: 0.5 });
    const scar = new THREE.Mesh(scarGeo, scarMat);
    scar.position.set(-0.18, 0.38, 0.28);
    scar.rotation.z = 0.3;
    this.headPivot.add(scar);

    // Eyes
    this.eyes = [];
    [-0.12, 0.12].forEach(x => {
      // Glowing eye
      const eyeGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const eye = new THREE.Mesh(
        eyeGeo,
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      eye.position.set(x, 0.46, 0.3);
      this.headPivot.add(eye);
      this.eyes.push(eye);

      // Eye glow halo
      const haloGeo = new THREE.SphereGeometry(0.065, 10, 10);
      const halo = new THREE.Mesh(
        haloGeo,
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.15 })
      );
      halo.position.set(x, 0.46, 0.3);
      this.headPivot.add(halo);
    });

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.36, 16, 16);
    const hair = new THREE.Mesh(
      hairGeo,
      new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.92, metalness: 0.05 })
    );
    hair.scale.set(0.72, 0.5, 0.72);
    hair.position.set(0, 0.62, -0.02);
    this.headPivot.add(hair);

    this.torsoPivot.add(this.headPivot);

    // --- Arms ---
    // Right Arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.52, 0.78, 0.05);

    const rUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.095, 0.52, 14),
      coatMat
    );
    rUpperArm.position.y = -0.26;
    rUpperArm.castShadow = true;
    this.rightArmPivot.add(rUpperArm);

    this.rightForearmPivot = new THREE.Group();
    this.rightForearmPivot.position.set(0, -0.52, 0);

    const rForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.08, 0.48, 14),
      skinMat
    );
    rForearm.position.y = -0.24;
    rForearm.castShadow = true;
    this.rightForearmPivot.add(rForearm);

    // Fist
    this.rightHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      skinMat
    );
    this.rightHand.scale.set(0.8, 1.0, 0.7);
    this.rightHand.position.set(0, -0.52, 0.02);
    this.rightForearmPivot.add(this.rightHand);

    this.rightArmPivot.add(this.rightForearmPivot);
    this.torsoPivot.add(this.rightArmPivot);

    // Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.52, 0.78, 0.05);

    const lUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.095, 0.52, 14),
      coatMat
    );
    lUpperArm.position.y = -0.26;
    lUpperArm.castShadow = true;
    this.leftArmPivot.add(lUpperArm);

    this.leftForearmPivot = new THREE.Group();
    this.leftForearmPivot.position.set(0, -0.52, 0);

    const lForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.08, 0.48, 14),
      skinMat
    );
    lForearm.position.y = -0.24;
    lForearm.castShadow = true;
    this.leftForearmPivot.add(lForearm);

    this.leftHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      skinMat
    );
    this.leftHand.scale.set(0.8, 1.0, 0.7);
    this.leftHand.position.set(0, -0.52, 0.02);
    this.leftForearmPivot.add(this.leftHand);

    this.leftArmPivot.add(this.leftForearmPivot);
    this.torsoPivot.add(this.leftArmPivot);

    this.personGroup.add(this.torsoPivot);
    this.actorGroup.add(this.personGroup);
    this.scene.add(this.actorGroup);
  }

  buildRainParticles() {
    // Rain as stretched line segments for realistic streaks
    const rainCount = 800;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 6); // 2 vertices per line

    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = Math.random() * 14;
      const z = (Math.random() - 0.5) * 16;
      // Start point
      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      // End point (streak below)
      positions[i * 6 + 3] = x + 0.02;
      positions[i * 6 + 4] = y - 0.35;
      positions[i * 6 + 5] = z + 0.02;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.LineBasicMaterial({
      color: 0x8bb8d6,
      transparent: true,
      opacity: 0.3
    });

    this.rainParticles = new THREE.LineSegments(rainGeo, rainMat);
    this.scene.add(this.rainParticles);
  }

  buildFogParticles() {
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 5;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.random() * 2.5;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const fogMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.25,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fogParticles = new THREE.Points(geo, fogMat);
    this.scene.add(this.fogParticles);
  }

  setupInteractions() {
    const nextBtn = document.getElementById('dialogue-next-btn');
    if (nextBtn) nextBtn.addEventListener('click', () => this.advanceLine(1));

    const prevBtn = document.getElementById('dialogue-prev-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.advanceLine(-1));

    const autoBtn = document.getElementById('dialogue-autoplay-btn');
    if (autoBtn) autoBtn.addEventListener('click', () => this.toggleAutoPlay());

    const shotBtns = document.querySelectorAll('#camera-shot-selector .seg-btn');
    shotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        shotBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCameraShot(btn.dataset.shot);
      });
    });
  }

  advanceLine(dir) {
    this.currentLineIdx = (this.currentLineIdx + dir + this.dialogueLines.length) % this.dialogueLines.length;
    this.displayCurrentLine(true);
  }

  displayCurrentLine(playSound = true) {
    const line = this.dialogueLines[this.currentLineIdx];
    const textElem = document.getElementById('dialogue-speech-text');
    const moodElem = document.getElementById('dialogue-mood-text');

    if (textElem) {
      textElem.style.opacity = '0';
      textElem.style.transform = 'translateY(8px)';
      setTimeout(() => {
        textElem.textContent = line.text;
        textElem.style.opacity = '1';
        textElem.style.transform = 'translateY(0)';
      }, 150);
    }

    if (moodElem) moodElem.textContent = line.subtext;

    this.stageSpotlight.intensity = line.spotlightIntensity;
    this.stageSpotlight.color.setHex(line.lightColor);

    // Change kicker color to complement
    this.kickerLight.color.setHex(line.lightColor === 0xfb7185 ? 0x3b82f6 : 0xc084fc);

    this.setCameraShot(line.cameraShot);
    const activeShotBtn = document.querySelector(`#camera-shot-selector [data-shot="${line.cameraShot}"]`);
    if (activeShotBtn) {
      document.querySelectorAll('#camera-shot-selector .seg-btn').forEach(b => b.classList.remove('active'));
      activeShotBtn.classList.add('active');
    }

    if (playSound && window.soundFX) {
      window.soundFX.playDramaticChord();
      window.soundFX.playHeartbeat();
    }

    this.triggerFlarePulse();
  }

  setCameraShot(shotKey) {
    if (!this.shotPresets[shotKey]) return;
    this.activeShot = shotKey;
    const preset = this.shotPresets[shotKey];
    this.targetCameraPos.copy(preset.pos);
    this.targetCameraLook.copy(preset.target);
  }

  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    const btn = document.getElementById('dialogue-autoplay-btn');
    if (this.isAutoPlaying) {
      if (btn) {
        btn.textContent = "⏸ Pause Auto-Play";
        btn.classList.add('active');
      }
      this.autoPlayTimer = setInterval(() => this.advanceLine(1), 5200);
    } else {
      if (btn) {
        btn.textContent = "▶ Auto-Play Drama";
        btn.classList.remove('active');
      }
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  triggerFlarePulse() {
    const flare = document.getElementById('dramatic-flare');
    if (!flare) return;
    flare.classList.remove('active');
    void flare.offsetWidth;
    flare.classList.add('active');
  }

  triggerSpotlightBurst() {
    this.stageSpotlight.intensity = 9.0;
    this.triggerFlarePulse();
    if (window.soundFX) window.soundFX.playDramaticChord();
    setTimeout(() => {
      const line = this.dialogueLines[this.currentLineIdx];
      this.stageSpotlight.intensity = line ? line.spotlightIntensity : 2.8;
    }, 500);
  }

  triggerDefiantGesture() {
    this.isGesturing = true;
    this.gestureProgress = 0;
    this.triggerFlarePulse();
    if (window.soundFX) {
      window.soundFX.playDramaticChord();
      window.soundFX.playHeartbeat();
    }
  }

  update(delta) {
    const elapsed = this.clock.getElapsedTime();
    const line = this.dialogueLines[this.currentLineIdx];

    // 1. Breathing
    const breath = Math.sin(elapsed * 2.5) * 0.04;
    this.torsoMesh.scale.set(1.0 + breath * 0.4, 1.0 + breath * 0.25, 1.0 + breath * 0.7);

    // Socket ring glow pulse
    if (this.socketRings) {
      this.socketRings.forEach((ring, i) => {
        if (ring.material.opacity !== undefined) {
          ring.material.opacity = 0.3 + Math.sin(elapsed * 3 + i * 0.5) * 0.15;
        }
      });
    }

    // Eye glow pulse
    if (this.eyes) {
      this.eyes.forEach(eye => {
        eye.material.color.setHex(
          elapsed % 2 < 1 ? 0x67e8f9 : 0x7dd3fc
        );
      });
    }

    // 2. Pose
    let targetTorsoPitch = -0.05;
    let targetHeadPitch = 0.02;
    let targetHeadYaw = Math.sin(elapsed * 0.7) * 0.05;
    let targetRightArmX = 0.35;
    let targetRightArmZ = 0.15;
    let targetRightForearmX = -0.7;
    let targetLeftArmX = 0.2;
    let targetLeftForearmX = -0.85;

    if (line.pose === 'lean_forward') {
      targetTorsoPitch = -0.28;
      targetHeadPitch = 0.25;
      targetRightArmX = 0.8;
      targetRightForearmX = -1.2;
      targetLeftArmX = 0.5;
      targetLeftForearmX = -1.1;
    } else if (line.pose === 'accuse_point') {
      targetTorsoPitch = -0.08;
      targetHeadYaw = 0.18;
      targetRightArmX = 1.35;
      targetRightForearmX = -0.3;
      targetLeftArmX = 0.1;
      targetLeftForearmX = -0.9;
    } else if (line.pose === 'clenched_fist') {
      targetTorsoPitch = -0.15;
      targetHeadPitch = -0.12;
      targetRightArmX = 0.6;
      targetRightForearmX = -1.5;
    } else if (line.pose === 'triumph_command') {
      targetTorsoPitch = 0.15;
      targetHeadPitch = 0.25;
      targetRightArmX = 0.9;
      targetLeftArmX = 0.9;
      targetRightArmZ = 0.6;
    }

    if (this.isGesturing) {
      this.gestureProgress += delta * 3.5;
      if (this.gestureProgress < 1.0) {
        const slam = Math.sin(this.gestureProgress * Math.PI);
        targetRightArmX += slam * 0.9;
        targetTorsoPitch -= slam * 0.2;
      } else {
        this.isGesturing = false;
      }
    }

    const lerp = 0.08;
    this.torsoPivot.rotation.x += (targetTorsoPitch - this.torsoPivot.rotation.x) * lerp;
    this.headPivot.rotation.x += (targetHeadPitch - this.headPivot.rotation.x) * lerp;
    this.headPivot.rotation.y += (targetHeadYaw - this.headPivot.rotation.y) * lerp;
    this.rightArmPivot.rotation.x += (targetRightArmX - this.rightArmPivot.rotation.x) * lerp;
    this.rightArmPivot.rotation.z += (targetRightArmZ - this.rightArmPivot.rotation.z) * lerp;
    this.rightForearmPivot.rotation.x += (targetRightForearmX - this.rightForearmPivot.rotation.x) * lerp;
    this.leftArmPivot.rotation.x += (targetLeftArmX - this.leftArmPivot.rotation.x) * lerp;
    this.leftForearmPivot.rotation.x += (targetLeftForearmX - this.leftForearmPivot.rotation.x) * lerp;

    // Wheelchair micro-movement
    this.wheelchair.rotation.y = Math.sin(elapsed * 0.4) * 0.03;
    this.wheelchair.rotation.z = Math.sin(elapsed * 1.0) * 0.008;

    // 3. Rain
    if (this.rainEnabled && this.rainParticles) {
      const posAttr = this.rainParticles.geometry.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 6) {
        const fallSpeed = delta * 16;
        arr[i + 1] -= fallSpeed;
        arr[i + 4] -= fallSpeed;
        if (arr[i + 4] < -0.5) {
          const resetY = 14;
          arr[i + 1] = resetY;
          arr[i + 4] = resetY - 0.35;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Fog drift
    if (this.fogParticles) {
      const posAttr = this.fogParticles.geometry.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += Math.sin(elapsed * 0.2 + i) * delta * 0.12;
        arr[i + 1] += Math.sin(elapsed * 0.3 + i * 0.5) * delta * 0.04;
      }
      posAttr.needsUpdate = true;
    }

    // 4. Camera
    this.camera.position.lerp(this.targetCameraPos, this.cameraLerpSpeed);
    this.controls.target.lerp(this.targetCameraLook, this.cameraLerpSpeed);

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
    this.setCameraShot(this.activeShot || 'hero');
  }
}

window.SceneDialogue = SceneDialogue;
