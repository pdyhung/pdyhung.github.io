/* scene3d.js — Khung cảnh 3D dùng chung cho các minh họa (Three.js r147).
   const S = GeoWidget.scene3d(ui, { cam: [x,y,z], aria: '…' });  // null nếu không có WebGL
   S.setView(bán kính bao, yThấpNhất, { reset: true })  — đặt camera, lưới nền
   S.label('a = 3', [x,y,z])  · S.line(p, q, { dashed, color })  · S.frame.push(fn)  · S.onTheme(fn) */
(function () {
  'use strict';
  function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  GeoWidget.scene3d = function (ui, opts) {
    opts = opts || {};
    if (!ui.hasWebGL() || !window.THREE) {
      ui.stage.innerHTML = '<div class="nowebgl">Trình duyệt của bạn không hỗ trợ WebGL nên không hiện được mô hình 3D. ' +
        'Các ô nhập số và bảng số đo bên cạnh vẫn dùng được.</div>';
      ui.stage.style.minHeight = '0';
      return null;
    }
    var T = THREE;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.localClippingEnabled = true;
    ui.stage.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', opts.aria || 'Mô hình 3D. Kéo để xoay, cuộn để phóng to.');
    var hint = document.createElement('div'); hint.className = 'hint';
    hint.textContent = 'Kéo để xoay · Cuộn/chụm hai ngón để phóng to · Chuột phải để dời';
    ui.stage.appendChild(hint);
    var gridLabel = document.createElement('div'); gridLabel.className = 'hint hint-right'; ui.stage.appendChild(gridLabel);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(38, 4 / 3, 0.02, 500);
    var camDir = new T.Vector3().fromArray(opts.cam || [4.6, 3.4, 5.6]);
    var controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new T.HemisphereLight(0xffffff, 0x8899aa, 0.85));
    var dl = new T.DirectionalLight(0xffffff, 0.7); dl.position.set(5, 8, 6); scene.add(dl);

    var api = { T: T, scene: scene, camera: camera, controls: controls, renderer: renderer, K: 1, frame: [], themeFns: [], grid: null };
    var inited = false;

    function niceStep(x) { var s = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200]; for (var i = 0; i < s.length; i++) if (s[i] >= x) return s[i]; return 500; }

    /* ext: bán kính hình cầu bao nội dung; minY: đáy để đặt lưới; o.reset: đặt lại hướng nhìn; o.targetY */
    api.setView = function (ext, minY, o) {
      o = o || {};
      var newK = Math.max(ext / 2.2, Math.min(1, ext / 0.6));
      var ty = o.targetY || 0;
      if (!inited || o.reset) {
        controls.target.set(0, ty, 0);
        camera.position.copy(camDir).multiplyScalar(newK).add(controls.target);
        inited = true;
      } else {
        camera.position.sub(controls.target).multiplyScalar(newK / api.K).add(controls.target);
      }
      controls.minDistance = 1.5 * newK; controls.maxDistance = 25 * newK;
      camera.near = 0.02 * newK; camera.far = 300 * newK; camera.updateProjectionMatrix();
      if (api.grid) { scene.remove(api.grid); api.grid.geometry.dispose(); }
      if (o.noGrid) { api.grid = null; gridLabel.textContent = ''; }
      else {
        var cell = o.cell || niceStep(0.45 * newK), half = Math.max(4, Math.round(4 * newK / cell) * (o.gridScale || 1));
        api.grid = new T.GridHelper(cell * half * 2, half * 2, 0x8899aa, 0x8899aa);
        api.grid.material.transparent = true; api.grid.material.opacity = 0.25;
        api.grid.position.y = (minY == null ? -1 : minY) - 0.01 * newK;
        scene.add(api.grid);
        gridLabel.textContent = 'Ô lưới nền = ' + String(cell).replace('.', ',') + ' đv';
      }
      api.K = newK;
    };

    /* Chỉ đổi khoảng cách camera (không dựng lại lưới) — dùng khi nội dung to dần, ví dụ lúc trải hình */
    api.zoomTo = function (ext) {
      var k = Math.max(ext / 2.2, Math.min(1, ext / 0.6));
      var d = camera.position.clone().sub(controls.target);
      camera.position.copy(controls.target).add(d.setLength(camDir.length() * k));
    };

    api.mat = function (color, opacity, extra) {
      var m = new T.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.6, metalness: 0.05, side: T.DoubleSide,
        transparent: opacity < 1, opacity: opacity == null ? 1 : opacity, depthWrite: !(opacity < 1) }, extra || {}));
      return m;
    };

    api.label = function (text, pos, size) {
      var c = document.createElement('canvas'), ctx = c.getContext('2d'), fs = 44;
      ctx.font = '600 ' + fs + 'px "Segoe UI", sans-serif';
      var wpx = Math.ceil(ctx.measureText(text).width) + 28; c.width = wpx; c.height = fs + 22;
      ctx.font = '600 ' + fs + 'px "Segoe UI", sans-serif';
      ctx.fillStyle = cssv('--surface') || '#fff'; ctx.strokeStyle = cssv('--border') || '#ccc'; ctx.lineWidth = 3;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(2, 2, wpx - 4, c.height - 4, 14); else ctx.rect(2, 2, wpx - 4, c.height - 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = cssv('--text') || '#000'; ctx.textBaseline = 'middle'; ctx.fillText(text, 14, c.height / 2 + 2);
      var tex = new T.CanvasTexture(c); tex.minFilter = T.LinearFilter;
      var sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
      var hgt = (size || 0.3) * api.K; sp.scale.set(hgt * c.width / c.height, hgt, 1); sp.renderOrder = 20;
      if (pos) sp.position.fromArray(pos);
      return sp;
    };

    api.line = function (p, q, o) {
      o = o || {};
      var g = new T.BufferGeometry().setFromPoints([new T.Vector3().fromArray(p), new T.Vector3().fromArray(q)]);
      var m = o.dashed ? new T.LineDashedMaterial({ color: o.color || 0x8250df, dashSize: 0.08 * api.K, gapSize: 0.06 * api.K, depthTest: !!o.depthTest })
                       : new T.LineBasicMaterial({ color: o.color || 0x8250df, depthTest: !!o.depthTest });
      var l = new T.Line(g, m); if (o.dashed) l.computeLineDistances(); l.renderOrder = 19; return l;
    };

    api.dot = function (pos, color, r) {
      var m = new T.Mesh(new T.SphereGeometry((r || 0.05) * api.K, 16, 12), new T.MeshBasicMaterial({ color: color || 0xc2410c }));
      m.position.fromArray(pos); return m;
    };

    /* Giải phóng bộ nhớ GPU của một nhóm đối tượng */
    api.dispose = function (obj) {
      if (!obj) return;
      if (obj.parent) obj.parent.remove(obj);
      obj.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); }
      });
    };

    api.onTheme = function (fn) { api.themeFns.push(fn); };
    window.addEventListener('themechange', function () { api.themeFns.forEach(function (f) { f(); }); });

    function resize() {
      var w = ui.stage.clientWidth, h = Math.max(320, Math.min(opts.maxH || 520, Math.round(w * (opts.ratio || 0.72))));
      ui.stage.style.height = h + 'px';
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(ui.stage); resize();

    ui.loop(function (t) {
      for (var i = 0; i < api.frame.length; i++) api.frame[i](t);
      controls.update(); renderer.render(scene, camera);
    });
    return api;
  };
})();
