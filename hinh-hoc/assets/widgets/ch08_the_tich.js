/* ch08_the_tich.js — Bài 6: Thể tích lăng trụ, hình trụ, hình cầu và khối ghép.
   Hình hộp, hình lập phương có kích thước nguyên: xếp các khối lập phương đơn vị theo từng lớp. */
(function () {
  'use strict';
  var PI = Math.PI;
  function f2(x) { return (Math.abs(x) >= 1000 ? x.toFixed(1) : (+x.toFixed(2)).toString()).replace('.', ','); }
  function n(x) { return String(+(+x).toFixed(3)).replace('.', ','); }

  var SHAPES = {
    hop: { name: 'Hình hộp chữ nhật', ps: [['a', 'Chiều dài a', 4], ['b', 'Chiều rộng b', 3], ['c', 'Chiều cao c', 2]],
      vol: function (p) { return { v: p.a * p.b * p.c, f: 'V = a·b·c', s: n(p.a) + '·' + n(p.b) + '·' + n(p.c) }; }, units: function (p) { return [p.a, p.b, p.c]; } },
    lap_phuong: { name: 'Hình lập phương', ps: [['a', 'Cạnh a', 3]],
      vol: function (p) { return { v: Math.pow(p.a, 3), f: 'V = a³', s: n(p.a) + '³' }; }, units: function (p) { return [p.a, p.a, p.a]; } },
    lang_tru: { name: 'Lăng trụ đứng, đáy tam giác vuông', ps: [['p', 'Cạnh góc vuông p', 3], ['q', 'Cạnh góc vuông q', 2], ['h', 'Chiều cao h', 3]],
      vol: function (p) { return { v: p.p * p.q / 2 * p.h, f: 'V = B·h = ½·p·q·h', s: '½·' + n(p.p) + '·' + n(p.q) + '·' + n(p.h) }; } },
    tru: { name: 'Hình trụ', ps: [['r', 'Bán kính đáy r', 1.5], ['h', 'Chiều cao h', 3]],
      vol: function (p) { return { v: PI * p.r * p.r * p.h, f: 'V = π·r²·h', s: 'π·' + n(p.r) + '²·' + n(p.h) }; } },
    cau: { name: 'Hình cầu', ps: [['R', 'Bán kính R', 1.5]],
      vol: function (p) { return { v: 4 / 3 * PI * Math.pow(p.R, 3), f: 'V = 4/3·π·R³', s: '4/3·π·' + n(p.R) + '³' }; } },
    ban_cau: { name: 'Nửa hình cầu', ps: [['R', 'Bán kính R', 1.5]],
      vol: function (p) { return { v: 2 / 3 * PI * Math.pow(p.R, 3), f: 'V = 2/3·π·R³', s: '2/3·π·' + n(p.R) + '³' }; } },
    vien_thuoc: { name: 'Khối ghép: trụ + 2 nửa cầu (viên thuốc)', ps: [['r', 'Bán kính r', 0.8], ['h', 'Chiều dài phần trụ h', 2.4]],
      vol: function (p) { var a = PI * p.r * p.r * p.h, b = 4 / 3 * PI * Math.pow(p.r, 3); return { v: a + b, f: 'V = π·r²·h + 4/3·π·r³', s: f2(a) + ' + ' + f2(b) }; } },
    ten_lua: { name: 'Khối ghép: trụ + nón (tên lửa)', ps: [['r', 'Bán kính r', 0.8], ['h1', 'Chiều cao phần trụ h₁', 2.4], ['h2', 'Chiều cao phần nón h₂', 1.2]],
      vol: function (p) { var a = PI * p.r * p.r * p.h1, b = PI * p.r * p.r * p.h2 / 3; return { v: a + b, f: 'V = π·r²·h₁ + ⅓·π·r²·h₂', s: f2(a) + ' + ' + f2(b) }; } },
    khoet: { name: 'Khối ghép: lập phương khoét lỗ trụ', ps: [['a', 'Cạnh lập phương a', 3], ['r', 'Bán kính lỗ r', 0.8]],
      vol: function (p) { var a = Math.pow(p.a, 3), b = PI * p.r * p.r * p.a; return { v: a - b, f: 'V = a³ − π·r²·a', s: f2(a) + ' − ' + f2(b) }; },
      check: function (p) { return 2 * p.r < p.a ? '' : 'Cần 2r < a để lỗ nằm gọn trong khối.'; } }
  };

  GeoWidget.register('ch08_the_tich', function (ui, el) {
    var st = { shape: el.getAttribute('data-shape') || 'hop', layers: 0, filling: false, t0: 0 };
    var P = {}; Object.keys(SHAPES).forEach(function (k) { P[k] = {}; SHAPES[k].ps.forEach(function (x) { P[k][x[0]] = x[2]; }); });
    ui.select({ label: 'Khối', value: st.shape, options: Object.keys(SHAPES).map(function (k) { return [k, SHAPES[k].name]; }),
      onChange: function (v) { st.shape = v; inputs(); build(true); } });
    var box = ui.group('Kích thước (nhập số)');
    var uBox = ui.group('Xếp khối lập phương đơn vị');
    var sL = ui.slider({ label: 'Số lớp đã xếp', min: 0, max: 1, value: 0, decimals: 0, onInput: function (v) { st.filling = false; st.layers = Math.round(v); units(); } });
    uBox.appendChild(sL.input.parentNode);
    var uRow = document.createElement('div'); uRow.className = 'ctl-row'; uBox.appendChild(uRow);
    var fillBtn = ui.button(uRow, '▶ Xếp từng lớp', function () { st.filling = true; st.layers = 0; st.t0 = performance.now(); });
    var setOut = ui.readout([['f', 'Công thức'], ['s', 'Thay số'], ['v', 'Thể tích'], ['u', 'Đếm khối đơn vị']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    function inputs() {
      [].slice.call(box.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); });
      SHAPES[st.shape].ps.forEach(function (x) {
        ui.number({ label: x[1], value: P[st.shape][x[0]], min: 0.05, max: 100, onChange: function (v) { P[st.shape][x[0]] = v; build(false); } }, box);
      });
    }
    function unitDims() {
      var sh = SHAPES[st.shape]; if (!sh.units) return null;
      var d = sh.units(P[st.shape]);
      return d.every(function (x) { return Math.abs(x - Math.round(x)) < 1e-9 && x >= 1 && x <= 12; }) ? d.map(Math.round) : null;
    }

    var S = GeoWidget.scene3d(ui, { aria: 'Khối hình học và thể tích của nó' });
    var world = null, inst = null;

    function build(reset) {
      var sh = SHAPES[st.shape], p = P[st.shape], T = THREE;
      var err = sh.check ? sh.check(p) : '', V = sh.vol(p);
      setOut('f', V.f); setOut('s', err ? '—' : V.s); setOut('v', err ? '—' : f2(V.v) + ' (đvtt)');
      var ud = unitDims();
      uBox.style.display = ud ? '' : 'none';
      if (ud) { sL.input.max = ud[2]; st.layers = Math.min(st.layers, ud[2]); sL.set(st.layers); }
      note.textContent = err || (sh.units ? (ud ? 'Kích thước là số nguyên nên có thể xếp các khối lập phương cạnh 1: mỗi lớp có a·b khối, có c lớp.' : 'Nhập các kích thước nguyên từ 1 đến 12 để xếp khối lập phương đơn vị.') :
        (st.shape === 'khoet' ? 'Thể tích khối ghép = thể tích khối lớn − thể tích phần bị khoét.' : (/^vien|^ten/.test(st.shape) ? 'Thể tích khối ghép = tổng thể tích các phần.' : '')));
      if (!S) { units(); return; }
      S.dispose(world); world = new T.Group(); S.scene.add(world); inst = null;
      var main = S.mat(0x4f8cff, 0.4), second = S.mat(0x3fb950, 0.55), ext, minY = 0, edges = function (g, m) { m.add(new T.LineSegments(new T.EdgesGeometry(g, 25), new T.LineBasicMaterial({ color: 0x2b3a55 }))); };
      var add = function (g, mat, x, y, z) { var m = new T.Mesh(g, mat); m.position.set(x || 0, y || 0, z || 0); edges(g, m); world.add(m); return m; };
      var lab = function (t, pos) { world.add(S.label(t, pos)); };
      if (st.shape === 'hop' || st.shape === 'lap_phuong') {
        var d = sh.units(p); ext = Math.hypot(d[0], d[1], d[2]) / 2;
        S.setView(ext, 0, { reset: reset, targetY: d[2] / 2 });
        add(new T.BoxGeometry(d[0], d[2], d[1]), S.mat(0x4f8cff, ud ? 0.12 : 0.4), 0, d[2] / 2, 0);
        lab('a = ' + n(d[0]), [0, -0.25 * S.K, d[1] / 2 + 0.25 * S.K]);
        if (st.shape === 'hop') { lab('b = ' + n(d[1]), [d[0] / 2 + 0.3 * S.K, -0.25 * S.K, 0]); lab('c = ' + n(d[2]), [d[0] / 2 + 0.3 * S.K, d[2] / 2, d[1] / 2]); }
        if (ud) {
          var cnt = ud[0] * ud[1] * ud[2], g = new T.BoxGeometry(0.94, 0.94, 0.94);
          inst = new T.InstancedMesh(g, new T.MeshStandardMaterial({ color: 0xf2cc60, roughness: 0.5 }), cnt);
          var M = new T.Matrix4(), k = 0;
          for (var y = 0; y < ud[2]; y++) for (var z = 0; z < ud[1]; z++) for (var x = 0; x < ud[0]; x++) {
            M.makeTranslation(x + 0.5 - ud[0] / 2, y + 0.5, z + 0.5 - ud[1] / 2); inst.setMatrixAt(k++, M);
          }
          world.add(inst);
        }
      } else if (st.shape === 'lang_tru') {
        var sp = new T.Shape([new T.Vector2(0, 0), new T.Vector2(p.p, 0), new T.Vector2(0, p.q)]);
        var g2 = new T.ExtrudeGeometry(sp, { depth: p.h, bevelEnabled: false }); g2.rotateX(-PI / 2); g2.translate(-p.p / 3, 0, p.q / 3);
        ext = Math.hypot(p.p, p.q, p.h) / 2; S.setView(ext, 0, { reset: reset, targetY: p.h / 2 });
        add(g2, main);
        lab('p = ' + n(p.p), [p.p / 6, -0.25 * S.K, p.q / 3 + 0.3 * S.K]); lab('q = ' + n(p.q), [-p.p / 3 - 0.35 * S.K, -0.25 * S.K, -p.q / 6]); lab('h = ' + n(p.h), [-p.p / 3 - 0.3 * S.K, p.h / 2, p.q / 3]);
      } else if (st.shape === 'tru') {
        ext = Math.hypot(p.r, p.h / 2); S.setView(ext, 0, { reset: reset, targetY: p.h / 2 });
        add(new T.CylinderGeometry(p.r, p.r, p.h, 96, 1), main, 0, p.h / 2, 0);
        world.add(S.line([0, 0, 0], [p.r, 0, 0])); lab('r = ' + n(p.r), [p.r / 2, -0.25 * S.K, 0.1]); lab('h = ' + n(p.h), [p.r + 0.35 * S.K, p.h / 2, 0]);
      } else if (st.shape === 'cau' || st.shape === 'ban_cau') {
        var half = st.shape === 'ban_cau';
        ext = p.R; S.setView(ext, half ? 0 : -p.R, { reset: reset, targetY: half ? p.R / 2 : 0 });
        add(new T.SphereGeometry(p.R, 64, 32, 0, 2 * PI, 0, half ? PI / 2 : PI), main);
        if (half) { var dc = new T.Mesh(new T.CircleGeometry(p.R, 64), main); dc.rotation.x = -PI / 2; world.add(dc); }
        world.add(S.dot([0, 0, 0], 0xcf222e, 0.05)); world.add(S.line([0, 0, 0], [p.R * 0.707, 0, p.R * 0.707])); lab('R = ' + n(p.R), [p.R * 0.4, 0.2 * S.K, p.R * 0.4]);
      } else if (st.shape === 'vien_thuoc') {
        var L = p.h + 2 * p.r; ext = L / 2; S.setView(ext, -p.r, { reset: reset });
        var gc = new T.CylinderGeometry(p.r, p.r, p.h, 64, 1, true); gc.rotateZ(PI / 2); add(gc, main);
        var hs1 = new T.SphereGeometry(p.r, 48, 24, 0, PI); hs1.rotateY(PI / 2); add(hs1, second, p.h / 2, 0, 0);
        var hs2 = new T.SphereGeometry(p.r, 48, 24, 0, PI); hs2.rotateY(-PI / 2); add(hs2, second, -p.h / 2, 0, 0);
        lab('h = ' + n(p.h), [0, p.r + 0.3 * S.K, 0]); lab('r = ' + n(p.r), [p.h / 2 + p.r / 2, -p.r - 0.3 * S.K, 0]);
      } else if (st.shape === 'ten_lua') {
        var Ht = p.h1 + p.h2; ext = Math.hypot(p.r, Ht / 2); S.setView(ext, 0, { reset: reset, targetY: Ht / 2 });
        add(new T.CylinderGeometry(p.r, p.r, p.h1, 64, 1), main, 0, p.h1 / 2, 0);
        add(new T.ConeGeometry(p.r, p.h2, 64, 1), second, 0, p.h1 + p.h2 / 2, 0);
        lab('h₁ = ' + n(p.h1), [p.r + 0.4 * S.K, p.h1 / 2, 0]); lab('h₂ = ' + n(p.h2), [p.r + 0.4 * S.K, p.h1 + p.h2 / 2, 0]); lab('r = ' + n(p.r), [p.r / 2, -0.25 * S.K, 0]);
        world.add(S.line([0, 0, 0], [p.r, 0, 0]));
      } else {
        ext = p.a * 0.87; S.setView(ext, 0, { reset: reset, targetY: p.a / 2 });
        add(new T.BoxGeometry(p.a, p.a, p.a), S.mat(0x4f8cff, 0.3), 0, p.a / 2, 0);
        if (!err) add(new T.CylinderGeometry(p.r, p.r, p.a * 1.001, 64, 1), S.mat(0xe5534b, 0.55), 0, p.a / 2, 0);
        lab('a = ' + n(p.a), [0, -0.25 * S.K, p.a / 2 + 0.25 * S.K]); lab('lỗ: r = ' + n(p.r), [0, p.a + 0.3 * S.K, 0]);
      }
      units();
    }
    function units() {
      var ud = unitDims();
      var dts = ui.side.querySelectorAll('.readout dt'), dds = ui.side.querySelectorAll('.readout dd');
      dts[3].style.display = dds[3].style.display = ud ? '' : 'none';
      if (!ud) { setOut('u', '—'); return; }
      var per = ud[0] * ud[1];
      setOut('u', st.layers + ' lớp × ' + per + ' = ' + st.layers * per + ' khối' + (st.layers === ud[2] ? ' (đầy)' : ''));
      if (inst) { inst.count = st.layers * per; inst.instanceMatrix.needsUpdate = true; }
    }
    el.__debug = function () { return { st: st, P: P }; };

    if (S) {
      S.onTheme(function () { build(false); });
      S.frame.push(function (t) {
        if (!st.filling) return;
        var ud = unitDims(); if (!ud) { st.filling = false; return; }
        var L = Math.min(ud[2], Math.floor((t - st.t0) / 600) + 1);
        if (L !== st.layers) { st.layers = L; sL.set(L); units(); }
        if (L >= ud[2]) st.filling = false;
      });
    }
    inputs(); build(true);
  });
})();
