/**
 * Self-contained Orbit Controls for Three.js
 * Enables smooth drag-to-rotate, pinch/wheel-to-zoom, and smooth damping
 */
(function() {
  if (typeof THREE === 'undefined') return;

  THREE.SimpleOrbitControls = function(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document;
    this.enabled = true;
    
    // Target position
    this.target = new THREE.Vector3(0, 0, 0);
    
    // Spherical coordinates
    var offset = new THREE.Vector3().subVectors(camera.position, this.target);
    var radius = offset.length();
    var theta = Math.atan2(offset.x, offset.z);
    var phi = Math.acos(Math.max(-1, Math.min(1, offset.y / (radius || 1))));

    this.minDistance = 1.0;
    this.maxDistance = 30.0;
    this.minPolarAngle = 0.05;
    this.maxPolarAngle = Math.PI * 0.95;
    this.damping = 0.08;

    var targetTheta = theta;
    var targetPhi = phi;
    var targetRadius = radius;

    var isPointerDown = false;
    var prevX = 0, prevY = 0;

    var self = this;

    function onPointerDown(e) {
      if (!self.enabled) return;
      isPointerDown = true;
      prevX = e.clientX || (e.touches && e.touches[0].clientX);
      prevY = e.clientY || (e.touches && e.touches[0].clientY);
    }

    function onPointerMove(e) {
      if (!self.enabled || !isPointerDown) return;
      var curX = e.clientX || (e.touches && e.touches[0].clientX);
      var curY = e.clientY || (e.touches && e.touches[0].clientY);
      if (curX === undefined || curY === undefined) return;

      var dx = curX - prevX;
      var dy = curY - prevY;
      prevX = curX;
      prevY = curY;

      var rotSpeed = 0.006;
      targetTheta -= dx * rotSpeed;
      targetPhi -= dy * rotSpeed;
      targetPhi = Math.max(self.minPolarAngle, Math.min(self.maxPolarAngle, targetPhi));
    }

    function onPointerUp() {
      isPointerDown = false;
    }

    function onWheel(e) {
      if (!self.enabled) return;
      e.preventDefault();
      var zoomSpeed = 0.0015;
      targetRadius += e.deltaY * zoomSpeed * targetRadius * 0.5;
      targetRadius = Math.max(self.minDistance, Math.min(self.maxDistance, targetRadius));
    }

    domElement.addEventListener('mousedown', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp, { passive: true });
    
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    domElement.addEventListener('wheel', onWheel, { passive: false });

    this.reset = function(pos, target) {
      if (target) this.target.copy(target);
      if (pos) {
        var off = new THREE.Vector3().subVectors(pos, this.target);
        targetRadius = off.length();
        targetTheta = Math.atan2(off.x, off.z);
        targetPhi = Math.acos(Math.max(-1, Math.min(1, off.y / (targetRadius || 1))));
      }
    };

    this.update = function() {
      if (!this.enabled) return;
      theta += (targetTheta - theta) * this.damping;
      phi += (targetPhi - phi) * this.damping;
      radius += (targetRadius - radius) * this.damping;

      var x = radius * Math.sin(phi) * Math.sin(theta);
      var y = radius * Math.cos(phi);
      var z = radius * Math.sin(phi) * Math.cos(theta);

      this.camera.position.set(this.target.x + x, this.target.y + y, this.target.z + z);
      this.camera.lookAt(this.target);
    };
  };
})();
