/* ch05_goc_nang.js — Bài 7: Góc nâng, góc hạ (2D).
   Chế độ "nang": đo chiều cao tòa nhà từ khoảng cách d và góc nâng α: H = e + d·tan α (e: chiều cao mắt).
   Chế độ "ha": từ đỉnh ngọn hải đăng cao h nhìn xuống thuyền với góc hạ β: d = h / tan β.
   Chế độ "hai": đo từ hai vị trí cách nhau m với góc nâng α₁ < α₂: H = m·tan α₁·tan α₂ / (tan α₂ − tan α₁). */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180, tan = function (x) { return Math.tan(x * RAD); };

  /* đặt khung nhìn [x0, y1, x1, y0] giữ tỉ lệ 1:1, mở rộng chiều thiếu (không cắt nội dung) */
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }

  var MODES = { nang: 'Góc nâng: đo chiều cao tòa nhà', ha: 'Góc hạ: khoảng cách tới thuyền', hai: 'Đo từ hai vị trí trên mặt đất' };

  GeoWidget.register('ch05_goc_nang', function (ui, el) {
    var st = { mode: el.getAttribute('data-mode') || 'nang',
      nang: { d: 30, al: 40, e: 1.6 }, ha: { h: 45, be: 12 }, hai: { a1: 30, a2: 45, m: 20 } };
    (el.getAttribute('data-known') || '').split(',').forEach(function (kv) { var p = kv.split('='); if (p.length === 2) st[st.mode][p[0].trim()] = +p[1]; });
    var PS = {
      nang: [['d', 'Khoảng cách d (m)', 0.5, 1000], ['al', 'Góc nâng α (°)', 0.5, 89], ['e', 'Chiều cao mắt e (m)', 0, 3]],
      ha: [['h', 'Chiều cao h (m)', 0.5, 2000], ['be', 'Góc hạ β (°)', 0.5, 89]],
      hai: [['a1', 'Góc nâng ở xa α₁ (°)', 0.5, 88], ['a2', 'Góc nâng ở gần α₂ (°)', 1, 89], ['m', 'Khoảng cách hai vị trí m (m)', 0.5, 1000]]
    };
    ui.select({ label: 'Tình huống', value: st.mode, options: Object.keys(MODES).map(function (k) { return [k, MODES[k]]; }), onChange: function (v) { st.mode = v; inputs(); B.build(draw); fit(); } });
    var box = ui.group('Số đo (nhập số)'), ins = {};
    var setOut = ui.readout([['r1', ''], ['r2', ''], ['r3', ''], ['r4', '']]);
    var dts = [].slice.call(ui.side.querySelectorAll('.readout dt')).slice(-4);
    var note = document.createElement('div'); note.className = 'ctl-note'; note.style.cssText = 'font-size:14px;color:var(--text)'; ui.side.appendChild(note);

    function inputs() {
      [].slice.call(box.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); }); ins = {};
      PS[st.mode].forEach(function (p) {
        ins[p[0]] = ui.number({ label: p[1], value: st[st.mode][p[0]], min: p[2], max: p[3], onChange: function (v) {
          st[st.mode][p[0]] = v; if (!ok()) ins[p[0]].classList.add('invalid'); refresh(); B.build(draw); fit(); } }, box);
      });
    }
    function sync() { Object.keys(ins).forEach(function (k) { ins[k].value = +st[st.mode][k].toFixed(2); ins[k].classList.remove('invalid'); }); }
    function ok() { return st.mode !== 'hai' || st.hai.a2 > st.hai.a1; }
    function geo() {   // các đại lượng suy ra
      var s = st[st.mode];
      if (st.mode === 'nang') return { H: s.e + s.d * tan(s.al), up: s.d * tan(s.al) };
      if (st.mode === 'ha') return { d: s.h / tan(s.be) };
      var H = s.m * tan(s.a1) * tan(s.a2) / (tan(s.a2) - tan(s.a1)); return { H: H, x2: H / tan(s.a2) };
    }
    function label(i, t) { dts[i].textContent = t; }
    function refresh() {
      var s = st[st.mode], g = geo();
      if (st.mode === 'nang') {
        label(0, 'H − e = d·tan α'); label(1, 'Chiều cao H = e + d·tan α'); label(2, 'Độ dài tia nhìn'); label(3, 'Góc nâng α');
        setOut('r1', f(g.up) + ' m'); setOut('r2', f(g.H) + ' m'); setOut('r3', f(Math.hypot(s.d, g.up)) + ' m'); setOut('r4', f(s.al) + '°');
        note.innerHTML = '<b>Cách tính.</b> Tam giác vuông EKT (vuông tại K): tan α = KT : EK = (H − e) : d, nên H = ' + f(s.e) + ' + ' + f(s.d) + '·tan ' + f(s.al) + '° ≈ ' + f(g.H) + ' m.';
      } else if (st.mode === 'ha') {
        label(0, 'Khoảng cách d = h : tan β'); label(1, 'Góc nâng từ thuyền (= β)'); label(2, 'Độ dài tia nhìn'); label(3, 'Góc hạ β');
        setOut('r1', f(g.d) + ' m'); setOut('r2', f(s.be) + '°'); setOut('r3', f(Math.hypot(s.h, g.d)) + ' m'); setOut('r4', f(s.be) + '°');
        note.innerHTML = '<b>Cách tính.</b> Góc hạ β ở đỉnh bằng góc nâng ở thuyền (hai góc so le trong). Trong tam giác vuông tại chân tháp: tan β = h : d, nên d = ' + f(s.h) + ' : tan ' + f(s.be) + '° ≈ ' + f(g.d) + ' m.';
      } else {
        label(0, 'Chiều cao H'); label(1, 'Từ vị trí gần tới chân tháp'); label(2, 'Từ vị trí xa tới chân tháp'); label(3, 'Hai góc nâng');
        if (!ok()) { ['r1', 'r2', 'r3'].forEach(function (k) { setOut(k, '—'); }); setOut('r4', '—'); note.textContent = 'Cần α₂ (ở gần) lớn hơn α₁ (ở xa): càng lại gần, góc nâng càng lớn.'; return; }
        setOut('r1', f(g.H) + ' m'); setOut('r2', f(g.x2) + ' m'); setOut('r3', f(g.x2 + s.m) + ' m'); setOut('r4', f(s.a1) + '° và ' + f(s.a2) + '°');
        note.innerHTML = '<b>Cách tính.</b> Gọi x là khoảng cách từ vị trí gần tới chân tháp: H = x·tan α₂ = (x + m)·tan α₁. Suy ra x = m·tan α₁ : (tan α₂ − tan α₁) ≈ ' + f(g.x2) + ' m và H ≈ ' + f(g.H) + ' m.';
      }
    }
    function fit() {
      if (!B || !B.board || !ok()) return;
      var s = st[st.mode], g = geo(), w, h, x0 = 0;
      if (st.mode === 'nang') { w = s.d * 1.2 + Math.max(3, 0.2 * s.d) + 0.35 * Math.max(s.d, g.H); h = g.H; }
      else if (st.mode === 'ha') { w = g.d; h = s.h; x0 = -0.15 * Math.max(g.d, s.h); }
      else { w = g.x2 + s.m; h = g.H; x0 = -0.15 * Math.max(w, h); }
      var p = 0.12 * Math.max(w - x0, h);
      setBB(B, [x0 - p, h + p, w + p, -2 * p]);
    }

    var B = GeoWidget.board2d(ui, { ratio: 0.85, bbox: [-5, 40, 45, -5], ratio: 0.8, aria: 'Hình vẽ bài toán góc nâng, góc hạ' });
    function txt(board, x, y, s, col, o) { return board.create('text', [x, y, s], Object.assign({ strokeColor: col, fixed: true, fontSize: 14, highlight: false, cssStyle: 'white-space:nowrap' }, o || {})); }
    function seg(board, p, q, col, o) { return board.create('segment', [p, q], Object.assign({ strokeColor: col, strokeWidth: 2, fixed: true, highlight: false }, o || {})); }
    function pt(board, xy, o) { return board.create('point', xy, Object.assign({ fixed: true, size: 2, withLabel: false, name: '' }, o || {})); }
    function person(board, x, e, C) {   // người đứng: thân và đầu, mắt ở độ cao e
      var k = function () { return Math.max(0.6, e()); };
      seg(board, [x, 0], [x, function () { return 0.75 * k(); }], C.text, { strokeWidth: 3 });
      board.create('circle', [[x, function () { return 0.88 * k(); }], function () { return 0.12 * k(); }], { strokeColor: C.text, fillColor: C.bg, fillOpacity: 1, fixed: true, highlight: false });
    }

    function draw(board, C) {
      if (!ok()) { txt(board, 0, 0, 'Cần α₂ > α₁.', C.red); return; }
      var s = st[st.mode];
      var gr = function () { var g = geo(); return st.mode === 'nang' ? s.d * 1.5 + 5 : st.mode === 'ha' ? g.d * 1.3 + 5 : (g.x2 + s.m) * 1.3 + 5; };
      seg(board, [function () { return -0.3 * gr(); }, 0], [gr, 0], C.muted, { strokeWidth: 1.5 });
      if (st.mode === 'nang') {
        var bw = function () { return Math.max(3, 0.2 * s.d); };
        var E = pt(board, [0, function () { return s.e; }], { name: 'E', withLabel: true, color: C.text, label: { offset: [-16, 10] } });
        person(board, 0, function () { return s.e; }, C);
        var F = board.create('point', [s.d, 0], { name: 'chân nhà', size: 5, color: C.blue, label: { offset: [4, -16] } });
        var T = board.create('point', [s.d, geo().H], { name: 'T', size: 5, color: C.orange, label: { offset: [-16, 8] } });
        var K = pt(board, [function () { return s.d; }, function () { return s.e; }], { name: 'K', withLabel: true, color: C.muted, label: { offset: [6, -10] } });
        var b4 = [[function () { return s.d; }, 0], [function () { return s.d + bw(); }, 0], [function () { return s.d + bw(); }, function () { return geo().H; }], [function () { return s.d; }, function () { return geo().H; }]].map(function (q) { return pt(board, q, { visible: false }); });
        board.create('polygon', b4, { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 1.5, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
        seg(board, E, K, C.muted, { dash: 2 });
        seg(board, E, T, C.orange, { strokeWidth: 2.5 });
        board.create('angle', [T, K, E], { radius: function () { return 0.05 * s.d; }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
        board.create('nonreflexangle', [K, E, T], { radius: function () { return 0.22 * s.d; }, name: 'α', fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
        txt(board, function () { return s.d / 2; }, function () { return -0.04 * s.d; }, function () { return 'd = ' + f(s.d) + ' m'; }, C.text, { anchorX: 'middle', anchorY: 'top' });
        txt(board, function () { return s.d + bw() + 0.03 * s.d; }, function () { return geo().H / 2; }, function () { return 'H ≈ ' + f(geo().H) + ' m'; }, C.blue);
        F.on('drag', function () { var H = geo().H; s.d = Math.max(0.5, F.X()); F.moveTo([s.d, 0]); s.al = Math.atan2(H - s.e, s.d) / RAD; sync(); refresh(); T.moveTo([s.d, H]); });
        T.on('drag', function () { var H = Math.max(s.e + 0.05, T.Y()); T.moveTo([s.d, H]); s.al = Math.atan2(H - s.e, s.d) / RAD; sync(); refresh(); });
        F.on('up', function () { B.build(draw); fit(); }); T.on('up', function () { B.build(draw); fit(); });
      } else if (st.mode === 'ha') {
        var tw = function () { return Math.max(2, 0.06 * Math.max(s.h, geo().d)); };
        var t4 = [[function () { return -tw(); }, 0], [0, 0], [0, function () { return s.h; }], [function () { return -tw(); }, function () { return s.h; }]].map(function (q) { return pt(board, q, { visible: false }); });
        board.create('polygon', t4, { fillColor: C.fillPurple, fillOpacity: 1, borders: { strokeColor: C.purple, strokeWidth: 1.5, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
        var Tp = board.create('point', [0, s.h], { name: 'Đỉnh', size: 5, color: C.purple, label: { offset: [-40, 10] } });
        var O = pt(board, [0, 0], { name: 'H', withLabel: true, color: C.muted, label: { offset: [-16, -14] } });
        var Bt = board.create('point', [geo().d, 0], { name: 'Thuyền', size: 5, color: C.blue, label: { offset: [-10, -18] } });
        var Hz = pt(board, [function () { return geo().d * 1.15; }, function () { return s.h; }], { visible: false });
        seg(board, Tp, Hz, C.muted, { dash: 2 });
        seg(board, Tp, Bt, C.orange, { strokeWidth: 2.5 });
        var Bx = pt(board, [function () { return geo().d * 1.3 + 5; }, 0], { visible: false });
        board.create('angle', [Bt, O, Tp], { radius: function () { return 0.05 * Math.max(s.h, geo().d); }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
        board.create('nonreflexangle', [Hz, Tp, Bt], { radius: function () { return 0.2 * Math.min(s.h, geo().d) + 0.04 * Math.max(s.h, geo().d); }, name: 'β', fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
        board.create('nonreflexangle', [Tp, Bt, O], { radius: function () { return 0.2 * Math.min(s.h, geo().d) + 0.04 * Math.max(s.h, geo().d); }, name: 'β', fillColor: C.fillGreen, strokeColor: C.green, fixed: true, label: { strokeColor: C.green } });
        txt(board, function () { return geo().d / 2; }, function () { return -0.04 * Math.max(s.h, geo().d); }, function () { return 'd ≈ ' + f(geo().d) + ' m'; }, C.text, { anchorX: 'middle', anchorY: 'top' });
        txt(board, function () { return -tw() - 0.02 * s.h; }, function () { return s.h / 2; }, function () { return 'h = ' + f(s.h) + ' m'; }, C.purple, { anchorX: 'right' });
        Bt.on('drag', function () { var d = Math.max(0.5, Bt.X()); Bt.moveTo([d, 0]); s.be = Math.atan2(s.h, d) / RAD; sync(); refresh(); });
        Tp.on('drag', function () { var d = geo().d; s.h = Math.max(0.5, Tp.Y()); Tp.moveTo([0, s.h]); s.be = Math.atan2(s.h, d) / RAD; sync(); refresh(); });
        Bt.on('up', function () { B.build(draw); fit(); }); Tp.on('up', function () { B.build(draw); fit(); });
        void Bx;
      } else {
        var g0 = geo();
        var x2 = function () { return geo().x2; }, x1 = function () { return geo().x2 + s.m; }, H = function () { return geo().H; };
        var tw2 = function () { return Math.max(1.5, 0.05 * x1()); };
        var q4 = [[function () { return -tw2(); }, 0], [0, 0], [0, H], [function () { return -tw2(); }, H]].map(function (q) { return pt(board, q, { visible: false }); });
        board.create('polygon', q4, { fillColor: C.fillPurple, fillOpacity: 1, borders: { strokeColor: C.purple, strokeWidth: 1.5, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
        var T2 = board.create('point', [0, g0.H], { name: 'T', size: 5, color: C.purple, label: { offset: [-20, 10] } });
        var O2 = pt(board, [0, 0], { name: 'H', withLabel: true, color: C.muted, label: { offset: [-16, -14] } });
        var P2 = board.create('point', [g0.x2, 0], { name: 'Q (gần)', size: 5, color: C.green, label: { offset: [-14, -18] } });
        var P1 = board.create('point', [g0.x2 + s.m, 0], { name: 'P (xa)', size: 5, color: C.blue, label: { offset: [-10, -18] } });
        seg(board, P1, T2, C.blue, { strokeWidth: 2 }); seg(board, P2, T2, C.green, { strokeWidth: 2 });
        var r = function () { return 0.12 * x1(); };
        board.create('nonreflexangle', [T2, P1, O2], { radius: r, name: 'α₁', fillColor: C.fillBlue, strokeColor: C.blue, fixed: true, label: { strokeColor: C.blue } });
        board.create('nonreflexangle', [T2, P2, O2], { radius: function () { return 0.08 * x1(); }, name: 'α₂', fillColor: C.fillGreen, strokeColor: C.green, fixed: true, label: { strokeColor: C.green } });
        board.create('angle', [P2, O2, T2], { radius: function () { return 0.04 * x1(); }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
        txt(board, function () { return (x1() + x2()) / 2; }, function () { return -0.06 * x1(); }, function () { return 'm = ' + f(s.m) + ' m'; }, C.text, { anchorX: 'middle', anchorY: 'top' });
        txt(board, function () { return x2() / 2; }, function () { return -0.06 * x1(); }, function () { return 'x ≈ ' + f(x2()) + ' m'; }, C.muted, { anchorX: 'middle', anchorY: 'top' });
        txt(board, function () { return -tw2() - 0.02 * x1(); }, function () { return H() / 2; }, function () { return 'H ≈ ' + f(H()) + ' m'; }, C.purple, { anchorX: 'right' });
        // kéo: giữ tháp (H) cố định, cập nhật góc
        var upd = function (Hh, xq, xp) { s.a2 = Math.atan2(Hh, xq) / RAD; s.a1 = Math.atan2(Hh, xp) / RAD; s.m = xp - xq; sync(); refresh(); };
        P2.on('drag', function () { var Hh = T2.Y(), xp = P1.X(), xq = Math.max(0.3, Math.min(xp - 0.5, P2.X())); P2.moveTo([xq, 0]); upd(Hh, xq, xp); });
        P1.on('drag', function () { var Hh = T2.Y(), xq = P2.X(), xp = Math.max(xq + 0.5, P1.X()); P1.moveTo([xp, 0]); upd(Hh, xq, xp); });
        T2.on('drag', function () { var Hh = Math.max(0.5, T2.Y()); T2.moveTo([0, Hh]); upd(Hh, P2.X(), P1.X()); });
        [P1, P2, T2].forEach(function (p) { p.on('up', function () { B.build(draw); fit(); }); });
      }
      refresh();
    }
    inputs();
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return { st: st, geo: geo() }; };
  });
})();
