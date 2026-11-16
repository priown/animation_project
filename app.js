/**
 * Master Application Controller
 * Orchestrates Scene 1 (Cat & Mouse), Scene 2 (3D Car), and Scene 3 (Dramatic Dialogue),
 * manages Split View vs Focused Tab UI switching, FPS monitoring, and audio toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check Three.js availability
  if (typeof THREE === 'undefined') {
    showFatalError("Three.js library failed to load from CDN. Please check your internet connection.");
    return;
  }

  // Instantiate Scenes
  let sceneCat, sceneCar, sceneDialogue;
  try {
    sceneCat = new SceneCat('canvas-cat');
    sceneCar = new SceneCar('canvas-car');
    sceneDialogue = new SceneDialogue('canvas-dialogue');
  } catch (err) {
    console.error("Initialization error:", err);
  }

  // Setup UI Layout Controller
  const panesContainer = document.getElementById('panes-container');
  const modeButtons = document.querySelectorAll('#view-mode-selector .mode-btn');

  function setLayoutMode(mode) {
    // Remove all mode classes
    panesContainer.className = `panes-container mode-${mode}`;

    // Update active tab button
    modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Notify all scenes to resize to their new viewport dimensions
    setTimeout(() => {
      if (sceneCat) sceneCat.resize();
      if (sceneCar) sceneCar.resize();
      if (sceneDialogue) sceneDialogue.resize();
    }, 50);
  }

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setLayoutMode(btn.dataset.mode);
    });
  });

  // Pane expand buttons (click to maximize individual panel)
  document.querySelectorAll('.pane-expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetMode = btn.dataset.target;
      setLayoutMode(targetMode);
    });
  });

  // Reset Camera Views
  const resetBtn = document.getElementById('reset-views');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (sceneCat) sceneCat.resetCamera();
      if (sceneCar) sceneCar.resetCamera();
      if (sceneDialogue) sceneDialogue.resetCamera();
    });
  }

  // Audio Toggle
  const audioToggle = document.getElementById('audio-toggle');
  if (audioToggle && window.soundFX) {
    audioToggle.addEventListener('click', () => {
      const isEnabled = window.soundFX.toggle();
      audioToggle.classList.toggle('active', isEnabled);
      const icon = audioToggle.querySelector('.audio-icon');
      const text = audioToggle.querySelector('.audio-text');
      if (icon) icon.textContent = isEnabled ? '🔊' : '🔇';
      if (text) text.textContent = isEnabled ? 'FX Audio: On' : 'FX Audio: Off';
    });
  }

  // Window Resize Observer
  const resizeObserver = new ResizeObserver(() => {
    if (sceneCat) sceneCat.resize();
    if (sceneCar) sceneCar.resize();
    if (sceneDialogue) sceneDialogue.resize();
  });
  resizeObserver.observe(panesContainer);
  window.addEventListener('resize', () => {
    if (sceneCat) sceneCat.resize();
    if (sceneCar) sceneCar.resize();
    if (sceneDialogue) sceneDialogue.resize();
  });

  // Main Render Loop & FPS calculation
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = 0;
  const fpsDisplay = document.getElementById('fps-counter');

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // FPS Counter
    frameCount++;
    fpsTimer += delta;
    if (fpsTimer >= 0.5) {
      const currentFps = Math.round(frameCount / fpsTimer);
      if (fpsDisplay) fpsDisplay.textContent = `${currentFps} FPS`;
      frameCount = 0;
      fpsTimer = 0;
    }

    // Render all active scenes
    if (sceneCat) sceneCat.update(delta);
    if (sceneCar) sceneCar.update(delta);
    if (sceneDialogue) sceneDialogue.update(delta);
  }

  requestAnimationFrame(animate);
});

function showFatalError(msg) {
  const banner = document.createElement('div');
  banner.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.5);";
  banner.textContent = msg;
  document.body.appendChild(banner);
}
