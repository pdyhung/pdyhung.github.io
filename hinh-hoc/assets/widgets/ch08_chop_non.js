/* ch08_chop_non.js — Bài 5: Thể tích hình chóp và hình nón.
   (1) Ba hình chóp bằng nhau ghép thành một hình lập phương → V(chóp) = ⅓·a³ = ⅓·B·h.
   (2) Đổ nước từ hình nón sang hình trụ cùng đáy, cùng chiều cao: 3 lần thì đầy. */
(function () {
  'use strict';
  var PI = Math.PI;
  function fmt(x) { return (Math.abs(x) >= 1000 ? x.toFixed(0) : x.toFixed(2)).replace('.', ','); }

  GeoWidget.register('ch08_chop_non', function (ui, el) {
    var st = { mode: el.getAttribute('data-mode') || 'ghep', a: 2, r: 1, h: 2.4, ex: 0.6, pours: 0, p: 0, pouring: false, t0: 0, playing: false, dir: 1 };
    ui.select({ label: 'Thí nghiệm', value: st.mode, options: [['ghep', 'Ghép 3 hình chóp thành hình lập phương'], ['do_nuoc', 'Đổ nước từ hình nón sang hình trụ']],
      onChange: function (v) { st.mode = v; show(); build(true); } });
    var gA = ui.group('Kích thước (nhập số)');
    ui.number({ label: 'Cạnh hình lập phương a', value: st.a, min: 0.1, max: 100, onChange: function (v) { st.a = v; build(false); } }, gA);
    var sEx = ui.slider({ label: 'Tách các hình chóp', min: 0, max: 1, value: st.ex, scale: 100, decimals: 0, unit: '%',
      onInput: function (v) { st.ex = v; stopPlay(); place(); } });
    var rowA = ui.row();
    var playBtn = ui.button(rowA, '▶ Ghép / Tách', function () { st.playing ? stopPlay() : startPlay(); });
    var gB = ui.group('Kích thước (nhập số)');
    ui.number({ label: 'Bán kính đáy r (chung)', value: st.r, min: 0.1, max: 100, onChange: function (v) { st.r = v; resetPour(); build(false); } }, gB);
    ui.number({ label: 'Chiều cao h (chung)', value: st.h, min: 0.1, max: 100, onChange: function (v) { st.h = v; resetPour(); build(false); } }, gB);
    var rowB = ui.row();
    var pourBtn = ui.button(rowB, '🫗 Đổ một nón nước', function () { if (!st.pouring && st.pours < 3) { st.pouring = true; st.t0 = performance.now(); } });
    ui.button(rowB, '↺ Làm lại', function () { resetPour(); levels(); }, 'btn secondary');
    var setOut = ui.readout([['l1', '—'], ['l2', '—'], ['l3', '—']]);
    var dts = ui.side.querySelectorAll('.readout dt');
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    function show() {
      var g = st.mode === 'ghep';
      gA.style.display = sEx.input.parentNode.style.display = rowA.parentNode.style.display = g ? '' : 'none';
      gB.style.display = rowB.parentNode.style.display = g ? 'none' : '';
    }
    function startPlay() { st.playing = true; st.dir = st.ex > 0.5 ? -1 : 1; playBtn.textContent = '⏸ Tạm dừng'; }
    function stopPlay() { st.playing = false; playBtn.textContent = '▶ Ghép / Tách'; }
    function resetPour() { st.pours = 0; st.p = 0; st.pouring = false; }

    var S = GeoWidget.scene3d(ui, { cam: [5, 3.6, 5.4], aria: 'Thí nghiệm về thể tích hình chóp và hình nón' });
    var world = null, pyrs = [], coneWater = null, cylWater = null;

    function readouts() {
      if (st.mode === 'ghep') {
        var a = st.a;
        dts[0].textContent = 'Thể tích hình lập phương'; dts[1].textContent = 'Mỗi hình chóp'; dts[2].textContent = 'Ba hình chóp';
        setOut('l1', 'a³ = ' + fmt(a * a * a)); setOut('l2', '⅓·a²·a = ' + fmt(a * a * a / 3)); setOut('l3', '3 × ' + fmt(a * a * a / 3) + ' = ' + fmt(a * a * a));
        note.textContent = 'Ba hình chóp chung đỉnh (chấm đỏ) là một đỉnh của hình lập phương; đáy của chúng là ba mặt không chứa đỉnh đó. Mỗi hình chóp có đáy B = a², chiều cao h = a. Ba hình chóp bằng nhau ghép vừa khít hình lập phương, nên V = ⅓·B·h.';
      } else {
        var vc = PI * st.r * st.r * st.h / 3, vt = 3 * vc, done = st.pours + st.p;
        dts[0].textContent = 'Thể tích hình nón'; dts[1].textContent = 'Thể tích hình trụ'; dts[2].textContent = 'Nước trong trụ';
        setOut('l1', '⅓·π·r²·h = ' + fmt(vc)); setOut('l2', 'π·r²·h = ' + fmt(vt));
        setOut('l3', fmt(done * vc) + ' = ' + (Math.round(done * 100) / 100).toString().replace('.', ',') + ' nón' + (st.pours >= 3 ? ' → đầy!' : ''));
        note.textContent = 'Hình nón và hình trụ có cùng bán kính đáy, cùng chiều cao. Bấm “Đổ một nón nước” nhiều lần: sau đúng 3 lần thì hình trụ đầy.';
        pourBtn.disabled = st.pours >= 3;
      }
    }

    function build(reset) {
      readouts();
      if (!S) return;
      S.dispose(world); world = new THREE.Group(); S.scene.add(world); pyrs = [];
      var T = THREE;
      if (st.mode === 'ghep') {
        var a = st.a, h = a / 2;
        S.setView(a * 1.6, -h, { reset: reset });
        var A = [h, h, h];                         // đỉnh chung
        var bases = [
          { q: [[-h, -h, -h], [-h, h, -h], [-h, h, h], [-h, -h, h]], dir: [-1, 0, 0], color: 0x4f8cff },
          { q: [[-h, -h, -h], [h, -h, -h], [h, -h, h], [-h, -h, h]], dir: [0, -1, 0], color: 0x3fb950 },
          { q: [[-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h]], dir: [0, 0, -1], color: 0xff7a1a }];
        bases.forEach(function (b) {
          var q = b.q, tris = [q[0], q[1], q[2], q[0], q[2], q[3]];
          for (var i = 0; i < 4; i++) tris.push(q[i], q[(i + 1) % 4], A);
          var pos = []; tris.forEach(function (p) { pos.push(p[0], p[1], p[2]); });
          var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
          var m = new T.Mesh(g, S.mat(b.color, 0.78, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
          m.add(new T.LineSegments(new T.EdgesGeometry(g, 1), new T.LineBasicMaterial({ color: 0x1f2328 })));
          m.add(S.dot(A, 0xcf222e, 0.06));
          m.userData.dir = b.dir; world.add(m); pyrs.push(m);
        });
        world.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(a, a, a)), new T.LineDashedMaterial({ color: 0x8b949e, dashSize: 0.08 * S.K, gapSize: 0.06 * S.K })).computeLineDistances());
        world.add(S.label('a = ' + fmt(a).replace(/,00$/, ''), [0, -h - 0.25 * S.K, h + 0.25 * S.K]));
        place();
      } else {
        var r = st.r, H = st.h, gap = 1.35 * r + 0.25;
        S.setView(Math.hypot(gap + r, H / 2) * 1.05, 0, { reset: reset, targetY: H / 2 });
        var glass = S.mat(0xb8c7dd, 0.25);
        var cone = new T.Mesh(new T.ConeGeometry(r, H, 64, 1, true), glass); cone.rotation.x = PI; cone.position.set(-gap, H / 2, 0); world.add(cone);
        var rim = function (x, y) { var pts = []; for (var i = 0; i <= 96; i++) { var t = 2 * PI * i / 96; pts.push(new T.Vector3(x + r * Math.cos(t), y, r * Math.sin(t))); } return new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x2b3a55 })); };
        world.add(rim(-gap, H)); world.add(rim(gap, H)); world.add(rim(gap, 0));
        var cyl = new T.Mesh(new T.CylinderGeometry(r, r, H, 64, 1, true), glass); cyl.position.set(gap, H / 2, 0); world.add(cyl);
        var bottom = new T.Mesh(new T.CircleGeometry(r, 64), glass); bottom.rotation.x = -PI / 2; bottom.position.set(gap, 0, 0); world.add(bottom);
        var water = new T.MeshStandardMaterial({ color: 0x2f81f7, transparent: true, opacity: 0.6, roughness: 0.2 });
        var cg = new T.ConeGeometry(1, 1, 64); cg.rotateX(PI); cg.translate(0, 0.5, 0);
        coneWater = new T.Mesh(cg, water); coneWater.position.set(-gap, 0, 0); world.add(coneWater);
        var yg = new T.CylinderGeometry(1, 1, 1, 64); yg.translate(0, 0.5, 0);
        cylWater = new T.Mesh(yg, water); cylWater.position.set(gap, 0, 0); world.add(cylWater);
        for (var k = 1; k <= 2; k++) world.add(S.line([gap + r, H * k / 3, 0], [gap + r + 0.25 * S.K, H * k / 3, 0], { color: 0x8250df, depthTest: true }));
        world.add(S.label('nón', [-gap, H + 0.3 * S.K, 0])); world.add(S.label('trụ', [gap, H + 0.3 * S.K, 0]));
        levels();
      }
    }
    function place() {
      var d = st.ex * st.a * 0.7;
      pyrs.forEach(function (m) { var v = m.userData.dir; m.position.set(v[0] * d, v[1] * d, v[2] * d); });
    }
    function levels() {
      readouts();
      if (!S || !coneWater) return;
      var c = st.pours >= 3 ? 0 : 1 - st.p;               // phần nước còn trong nón
      var L = st.h * Math.cbrt(Math.max(c, 0));
      var rr = st.r * L / st.h;
      coneWater.visible = L > 1e-6; coneWater.scale.set(Math.max(rr, 1e-6), Math.max(L, 1e-6), Math.max(rr, 1e-6));
      var lev = st.h * (st.pours + st.p) / 3;
      cylWater.visible = lev > 1e-6; cylWater.scale.set(st.r * 0.995, Math.max(lev, 1e-6), st.r * 0.995);
    }
    el.__debug = function () { return st; };

    if (S) {
      S.onTheme(function () { build(false); });
      S.frame.push(function (t) {
        if (st.playing) { st.ex = Math.max(0, Math.min(1, st.ex + st.dir * 0.01)); sEx.set(st.ex); place(); if (st.ex <= 0 || st.ex >= 1) stopPlay(); }
        if (st.pouring) {
          st.p = Math.min(1, (t - st.t0) / 1600);
          if (st.p >= 1) { st.pours++; st.p = 0; st.pouring = false; }
          levels();
        }
      });
    }
    show(); build(true);
  });
})();
