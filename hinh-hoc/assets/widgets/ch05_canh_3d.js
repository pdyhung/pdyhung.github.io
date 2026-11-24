/* ch05_canh_3d.js — Bài 7: Cảnh 3D đo chiều cao tháp bằng góc nâng.
   Người quan sát đứng trên mặt đất (kéo vòng tròn màu cam dưới chân người, hoặc nhập khoảng cách d và hướng φ),
   mắt ở độ cao e. Tia nhìn tới đỉnh tháp tạo góc nâng α với phương nằm ngang: H = e + d·tan α. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;

  GeoWidget.register('ch05_canh_3d', function (ui, el) {
    var D0 = { H: 30, e: 1.6, d: 25, phi: 0 };
    var st = { H: D0.H, e: D0.e, d: D0.d, phi: D0.phi, dragging: false };
    var g = ui.group('Tháp và người quan sát (nhập số)');
    var inH = ui.number({ label: 'Chiều cao tháp H (m)', value: st.H, min: 2, max: 300, onChange: function (v) { st.H = v; build(false, true); } }, g);
    var inE = ui.number({ label: 'Chiều cao mắt e (m)', value: st.e, min: 0, max: 3, onChange: function (v) { st.e = v; build(false); } }, g);
    var sD = ui.slider({ label: 'Khoảng cách d', min: 3, max: 150, step: 0.1, value: st.d, decimals: 1, unit: 'm', onInput: function (v) { st.d = v; build(false); } });
    var sP = ui.slider({ label: 'Hướng đứng φ', min: -180, max: 180, step: 1, value: st.phi, decimals: 0, unit: '°', onInput: function (v) { st.phi = v; build(false); } });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { st.H = D0.H; st.e = D0.e; st.d = D0.d; st.phi = D0.phi; inH.value = st.H; inE.value = st.e; sD.set(st.d); sP.set(st.phi); build(true, true); }, 'btn secondary');
    var setOut = ui.readout([['d', 'Khoảng cách d'], ['al', 'Góc nâng α'], ['tan', 'tan α'], ['up', 'H − e = d·tan α'], ['H', 'H = e + d·tan α'], ['L', 'Độ dài tia nhìn'], ['e', 'Chiều cao mắt e']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Kéo vòng tròn màu cam dưới chân người để đi lại quanh tháp (kéo chỗ khác để xoay cảnh). Lại gần tháp thì góc nâng tăng; nhưng H tính lại từ d và α luôn bằng chiều cao thật.';

    function alpha() { return Math.atan2(st.H - st.e, st.d) / RAD; }
    function refresh() {
      var a = alpha(), t = Math.tan(a * RAD);
      setOut('d', f(st.d, 1) + ' m'); setOut('al', f(a) + '°'); setOut('tan', f(t, 4));
      setOut('up', f(st.d * t) + ' m'); setOut('H', f(st.e + st.d * t) + ' m'); setOut('L', f(Math.hypot(st.d, st.H - st.e)) + ' m'); setOut('e', f(st.e) + ' m');
    }

    var S = GeoWidget.scene3d(ui, { ratio: 0.85, cam: [1.6, 1.7, 6.3], aria: 'Cảnh 3D: tháp, người quan sát, tia nhìn và góc nâng' });
    var world = null, pick = null;
    function obsPos() { return [st.d * Math.cos(st.phi * RAD), st.d * Math.sin(st.phi * RAD)]; }

    function build(reset, view) {
      refresh();
      if (!S) return;
      var T = THREE;
      if (reset || view || !world) S.setView(Math.hypot(st.H, st.d) * 0.6, 0, { reset: reset || !world, targetY: st.H * 0.42, cell: niceCell() });
      S.dispose(world); world = new T.Group(); S.scene.add(world);
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var cOr = dark ? 0xff9b4a : 0xe8590c, cBl = dark ? 0x5b9dff : 0x1f6feb, cGr = dark ? 0x3fb950 : 0x1a7f37, cTx = dark ? 0xdddddd : 0x333333;
      var K = S.K, rr = Math.max(0.8, 0.045 * Math.max(st.H, st.d));
      // tháp
      var tw = new T.Mesh(new T.CylinderGeometry(1.2, 1.6, st.H, 24), S.mat(0x8aa4c8, 0.85));
      tw.position.y = st.H / 2; world.add(tw);
      var top = new T.Mesh(new T.SphereGeometry(0.9, 16, 12), new T.MeshBasicMaterial({ color: 0xcf222e })); top.position.y = st.H; world.add(top);
      // người quan sát
      var p = obsPos(), x = p[0], z = p[1], e = st.e;
      var hb = Math.max(e, 0.6);
      var body = new T.Mesh(new T.CylinderGeometry(0.25, 0.3, hb * 0.78, 12), S.mat(0x2b3a55, 1)); body.position.set(x, hb * 0.39, z); world.add(body);
      var head = new T.Mesh(new T.SphereGeometry(hb * 0.12, 12, 10), S.mat(0xf2cc60, 1)); head.position.set(x, hb * 0.9, z); world.add(head);
      var ring = new T.Mesh(new T.RingGeometry(0.65 * rr, rr, 32), new T.MeshBasicMaterial({ color: cOr, side: T.DoubleSide, transparent: true, opacity: 0.85 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.03, z); world.add(ring);
      pick = new T.Mesh(new T.CylinderGeometry(1.4 * rr, 1.4 * rr, Math.max(4, hb * 2), 12), new T.MeshBasicMaterial({ visible: false }));
      pick.position.set(x, Math.max(2, hb), z); world.add(pick);
      // tam giác vuông E–K–T
      var E = [x, e, z], Kp = [0, e, 0], Tp = [0, st.H, 0];
      var tri = new T.BufferGeometry(); tri.setAttribute('position', new T.Float32BufferAttribute([].concat(E, Kp, Tp), 3));
      world.add(new T.Mesh(tri, new T.MeshBasicMaterial({ color: cOr, transparent: true, opacity: 0.16, side: T.DoubleSide, depthWrite: false })));
      world.add(S.line(E, Tp, { color: cOr }));
      world.add(S.line(E, Kp, { color: cTx, dashed: true }));
      world.add(S.line(Kp, Tp, { color: cBl }));
      world.add(S.line([x, 0.05, z], [0, 0.05, 0], { color: cGr, dashed: true }));
      // cung góc α tại E
      var r = Math.min(st.d, Math.hypot(st.d, st.H - e)) * 0.25, a = alpha() * RAD, ux = -x / st.d, uz = -z / st.d, arc = [];
      for (var i = 0; i <= 24; i++) { var t = a * i / 24; arc.push(new T.Vector3(x + ux * r * Math.cos(t), e + r * Math.sin(t), z + uz * r * Math.cos(t))); }
      world.add(new T.Line(new T.BufferGeometry().setFromPoints(arc), new T.LineBasicMaterial({ color: cOr, depthTest: false })));
      var am = a / 2, lr = r * 1.35;
      world.add(S.label('α ≈ ' + f(alpha(), 1) + '°', [x + ux * lr * Math.cos(am), e + lr * Math.sin(am), z + uz * lr * Math.cos(am)], 0.26));
      var px = -Math.sin(st.phi * RAD), pz = Math.cos(st.phi * RAD);
      world.add(S.label('d = ' + f(st.d, 1) + ' m', [x / 2 + px * 3 * rr, 0.3, z / 2 + pz * 3 * rr], 0.26));
      world.add(S.label('H = ' + f(st.H, 1) + ' m', [-Math.cos(st.phi * RAD) * 4 * rr, st.H * 0.75, -Math.sin(st.phi * RAD) * 4 * rr], 0.26));
    }
    function niceCell() { var m = Math.max(st.H, st.d) / 8, s = [1, 2, 5, 10, 20, 25, 50, 100]; for (var i = 0; i < s.length; i++) if (s[i] >= m) return s[i]; return 100; }

    if (S) {
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
      var cv = S.renderer.domElement;
      var setRay = function (ev) { var r = cv.getBoundingClientRect(); ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, S.camera); };
      ui.stage.addEventListener('pointerdown', function (ev) {
        if (!pick || ev.button > 0) return;
        setRay(ev);
        if (ray.intersectObject(pick, false).length) {
          st.dragging = true; S.controls.enabled = false; ev.stopPropagation(); ev.preventDefault();
        }
      }, true);
      window.addEventListener('pointermove', function (ev) {
        if (!st.dragging) return;
        setRay(ev);
        if (ray.ray.intersectPlane(plane, hit)) {
          var d = Math.hypot(hit.x, hit.z);
          st.d = Math.round(10 * Math.max(3, Math.min(150, d))) / 10; st.phi = Math.round(Math.atan2(hit.z, hit.x) / RAD);
          sD.set(st.d); sP.set(st.phi); build(false);
        }
      });
      window.addEventListener('pointerup', function () { if (st.dragging) { st.dragging = false; S.controls.enabled = true; build(false, true); } });
      S.onTheme(function () { build(false); });
    }
    build(true, true);
    el.__debug = function () { return { st: st, alpha: alpha(), H: st.e + st.d * Math.tan(alpha() * RAD) }; };
  });
})();
