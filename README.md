# Tri-Scene Interactive 3D & CSS Motion Synthesis Studio

An interactive, single-tab multi-pane 3D & CSS animation application built with Three.js, WebGL, and modern CSS glassmorphism styling.

## 🚀 How to Open
- **Direct File**: Open [index.html](file:///home/priown/CODING/animation_project/index.html) in any modern browser (Chrome, Firefox, Safari, Edge).
- **Local Dev Server**: The local HTTP server is active at `http://localhost:8000/`

---

## 🎨 The Three Scenes

### 1. 🐱 Predator Gaze — Cat & Orbiting Mouse
- **Cat Model**: Seated feline with articulated contoured torso, paws, folded haunches, and multi-segment sinusoidal swishing tail.
- **Procedural Head & Eye Tracking**:
  - The cat's head continuously calculates the yaw and pitch angle to face the orbiting mouse with realistic physical neck rotation damping.
  - When the mouse orbits behind the cat (blind spot), the cat executes a quick, lifelike head whip-turn to catch the mouse emerging on the other side.
  - Cat ears twitch toward mouse sound vibrations.
- **Orbiting Mouse**:
  - Scurries in real-time along an elliptical or circular orbit around the cat.
  - Features scampering cadence, centrifugal banking/lean into turns, and twitching tail.
- **Controls**:
  - Orbit Speed & Radius sliders.
  - *⚡ Pounce Flinch* trigger.
  - *🐾 Mouse Pause* (nervous freeze state).
  - *⇄ Reverse Orbit* direction.

---

### 2. 🏎️ Studio Turntable — Multi-Axis 3D Car
- **Cyber-Coupe Model**:
  - Sculpted aerodynamic chassis, hood vents, low-slung front splitter, and tinted greenhouse cockpit.
  - Active aero rear spoiler wing and dual chrome exhaust tips.
  - Quad alloy rims with red performance brake calipers and rubber tires.
  - Dual projector beam LED headlights and full-width cyber taillight bar.
  - Ground underglow lighting system with real-time floor reflections.
- **Rotation Mechanics**:
  - Continuous rotation around its center axis on a studio showroom turntable.
  - **Axis Modes**:
    - **Y-Axis (Turntable Yaw)**: Continuous showroom 360° spin.
    - **X-Axis (Pitch Tumble)**: Dynamic pitch rotation around the transverse axis.
    - **Z-Axis (Roll Barrel)**: Barrel roll rotation around the longitudinal axis.
    - **Gimbal**: Multi-axis continuous compound rotation.
- **Controls**:
  - Rotation speed & RPM monitor.
  - 5 High-gloss paint swatches (Neon Cyan, Inferno Red, Obsidian Black, Solar Gold, Cyber Violet).
  - High Beams & Underglow neon toggles.
  - Wireframe inspection mode.

---

### 3. 🎭 Defiance — The Unbroken Dramatic Conversation
- **The Concept & Drama**:
  - A theatrical, cinematic film-noir stage bathed in a solitary, piercing volumetric spotlight cutting through falling rain and atmospheric mist.
  - An imposing bilateral amputee (no legs), seated with commanding authority in a heavy-duty industrial wheelchair.
- **Character Model & Wheelchair**:
  - Prominently sculpted bilateral residual limbs ending cleanly at mid-thigh, capped with armored brass/titanium prosthetic sockets featuring glowing cyan telemetry rings.
  - Articulated wheelchair: large drive wheels with chrome hand push-rims, steel spokes, front castors, and cushioned backrest.
  - Expressive upper body: chest heaves with emotional breathing, head tilts and turns with dramatic speech cadence, articulated arms and hands (pointing, gesturing, clenched fist).
- **The Theatrical Script & Director's Cuts**:
  - Line 1: *"They think the ground defines a man..."* (Heroic low angle, whisper).
  - Line 2: *"They said: 'Without legs, you will never move an empire.'"* (Noir profile, accusatory point).
  - Line 3: *"I told them... wheels don't tire. Iron doesn't bleed. And conviction has no need for footsteps."* (Heroic angle, passionate lean forward).
  - Line 4: *"Look at me. Look into my eyes. Do I look like someone who is standing down?"* (Intense close-up, defiant fist slam).
  - Line 5: *"I don't need legs to make this world tremble."* (Wide stage, triumphant command).
- **Controls**:
  - Step through dialogue lines (Previous / Next / Auto-Play).
  - 4 Camera Shot Presets (Heroic Low, Close-Up, Noir Profile, Wide Stage).
  - *✊ Defiant Fist* gesture trigger.
  - *🌧️ Noir Rain* toggle.
  - *🔦 Spotlight Burst* flash effect.
  - Procedural sound effects (synthesized dramatic minor chords & tension heartbeats via Web Audio API).

---

## 🖥️ Layout Modes (All in 1 Browser Tab)
- **Split View (1 Tab)**: All 3 scenes render simultaneously in synchronized 3-column side-by-side viewports.
- **2x1 Grid**: Dynamic focus grid layout.
- **Single Tab Focus**: Maximize Scene 1, Scene 2, or Scene 3 to full viewport with instant tab switching.
