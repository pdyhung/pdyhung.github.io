/* ch01_doi_xung.js — Phép đối xứng trục: trục d đi qua hai điểm kéo được, chọn nhanh Ox, Oy, y = x, y = −x; hoạt ảnh "lật" hình. */
(function () {
  'use strict';
  var U = GeoWidget.ch01, f = U.f;
  var AXES = { ox: [[-4, 0], [4, 0]], oy: [[0, -4], [0, 4]], yx: [[-3, -3], [3, 3]], ymx: [[-3, 3], [3, -3]] };

  GeoWidget.register('ch01_doi_xung', function (ui, el) {
    var DEF = { P: [0, -4], Q: [0, 4], A: [-5, 1], B: [-2, 1], C: [-4, 4] };
    var st = { P: DEF.P.slice(), Q: DEF.Q.slice(), A: DEF.A.slice(), B: DEF.B.slice(), C: DEF.C.slice(), seg: true, anim: 1, playing: false, t0: 0 };

    var chips = ui.row('Chọn nhanh trục d');
    [['ox', 'Trục Ox'], ['oy', 'Trục Oy'], ['yx', 'y = x'], ['ymx', 'y = −x']].forEach(function (a) {
      ui.button(chips, a[1], function () { setAxis(AXES[a[0]][0], AXES[a[0]][1]); }, 'chip');
    });
    var gd = ui.group('Trục d đi qua P và Q (nhập số)');
    var rP = U.pointRow(ui, gd, 'P', st.P, function (p) { setAxis(p, st.Q); });
    var rQ = U.pointRow(ui, gd, 'Q', st.Q, function (p) { setAxis(st.P, p); });
    var gT = ui.group('Tọa độ tam giác ABC');
    var rows = {};
    ['A', 'B', 'C'].forEach(function (k) { rows[k] = U.pointRow(ui, gT, k, st[k], function (p) { st[k] = p; Pt[k] && Pt[k].moveTo(p); refresh(); }); });
    var row = ui.row();
    ui.checkbox('Hiện các đoạn AA′, BB′, CC′', true, function (v) { st.seg = v; B.build(draw); }, row);
    var row2 = ui.row();
    ui.button(row2, '▶ Lật hình', function () { st.playing = true; st.t0 = performance.now(); st.anim = 0; });
    ui.button(row2, '↺ Đặt lại', function () {
      ['P', 'Q', 'A', 'B', 'C'].forEach(function (k) { st[k] = DEF[k].slice(); });
      st.playing = false; st.anim = 1; rP.set(st.P); rQ.set(st.Q); ['A', 'B', 'C'].forEach(function (k) { rows[k].set(st[k]); }); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var setOut = ui.readout([['d', 'Trục d'], ['ct', 'Công thức'], ['A', 'A → A′'], ['B', 'B → B′'], ['C', 'C → C′'], ['kc', 'Khoảng cách tới d'], ['ch', 'Chiều']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -7], axis: true, grid: true, ratio: 1.15, maxH: 640, aria: 'Tam giác ABC và ảnh A′B′C′ qua phép đối xứng trục d' });
    var Pt = {};

    function setAxis(p, q) {
      st.P = p.slice(); st.Q = q.slice(); rP.set(st.P); rQ.set(st.Q);
      if (Pt.P) { Pt.P.moveTo(st.P); Pt.Q.moveTo(st.Q); }
      refresh();
    }
    function img(p) { return U.refl(p, st.P, st.Q); }
    function near(a, b) { return Math.abs(a - b) < 1e-9; }
    function lineEq() {
      var P = st.P, Q = st.Q, dx = Q[0] - P[0], dy = Q[1] - P[1];
      if (Math.hypot(dx, dy) < 1e-9) return 'P trùng Q: chưa xác định';
      if (Math.abs(dx) < 1e-9) return 'x = ' + f(P[0]) + (near(P[0], 0) ? ' (trục Oy)' : '');
      var m = dy / dx, n = P[1] - m * P[0], s;
      if (Math.abs(m) < 1e-9) return 'y = ' + f(n) + (near(n, 0) ? ' (trục Ox)' : '');
      s = (near(m, 1) ? '' : near(m, -1) ? '−' : f(m)) + 'x';
      return 'y = ' + s + (Math.abs(n) < 1e-9 ? '' : ' ' + U.sgn(n));
    }
    function formula() {
      var P = st.P, Q = st.Q, dx = Q[0] - P[0], dy = Q[1] - P[1];
      var thruO = Math.abs(P[0] * dy - P[1] * dx) < 1e-9;
      if (!thruO || Math.hypot(dx, dy) < 1e-9) return 'd không đi qua O: dùng "d là trung trực của AA′"';
      if (Math.abs(dy) < 1e-9) return '(x; y) → (x; −y)';
      if (Math.abs(dx) < 1e-9) return '(x; y) → (−x; y)';
      if (near(dy / dx, 1)) return '(x; y) → (y; x)';
      if (near(dy / dx, -1)) return '(x; y) → (−y; −x)';
      return 'd đi qua O nhưng không phải trường hợp đặc biệt';
    }
    function dline(p) {
      var P = st.P, Q = st.Q, dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy);
      return L < 1e-9 ? NaN : Math.abs((p[0] - P[0]) * dy - (p[1] - P[1]) * dx) / L;
    }
    function refresh() {
      setOut('d', lineEq());
      setOut('ct', formula());
      ['A', 'B', 'C'].forEach(function (k) { setOut(k, U.pt(st[k]) + ' → ' + U.pt(img(st[k]))); });
      setOut('kc', 'A và A′ cùng cách d: ' + f(dline(st.A)));
      var s = U.sarea(st.A, st.B, st.C);
      setOut('ch', 'ABC: ' + U.orient(s) + '; A′B′C′: ' + U.orient(-s));
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      Pt.P = board.create('point', st.P, { name: 'P', size: 4, color: C.green, label: { offset: [8, -10] } });
      Pt.Q = board.create('point', st.Q, { name: 'Q', size: 4, color: C.green, label: { offset: [8, -10] } });
      ['P', 'Q'].forEach(function (k) { Pt[k].on('drag', function () { st[k] = [Pt[k].X(), Pt[k].Y()]; (k === 'P' ? rP : rQ).set(st[k]); refresh(); }); });
      board.create('line', [Pt.P, Pt.Q], { strokeColor: C.green, strokeWidth: 2.5, dash: 3 });
      board.create('text', [function () { return Pt.Q.X() + 0.35; }, function () { return Pt.Q.Y() + 0.7; }, 'd'], { strokeColor: C.green, fontSize: 18, fixed: true });
      ['A', 'B', 'C'].forEach(function (k) {
        Pt[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        Pt[k].on('drag', function () { st[k] = [Pt[k].X(), Pt[k].Y()]; rows[k].set(st[k]); refresh(); });
      });
      board.create('polygon', [Pt.A, Pt.B, Pt.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        Q[k] = board.create('point', [function () { return img([Pt[k].X(), Pt[k].Y()])[0]; }, function () { return img([Pt[k].X(), Pt[k].Y()])[1]; }],
          { name: k + '′', size: 3, color: C.orange, fixed: true });
        if (st.seg) board.create('segment', [Pt[k], Q[k]], { strokeColor: C.muted, dash: 2, strokeWidth: 1.5 });
      });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      // hình "đang lật": thành phần vuông góc với trục nhân với cos(πt)
      var G = ['A', 'B', 'C'].map(function (k) {
        function g() {
          var p = [Pt[k].X(), Pt[k].Y()], h = U.foot(p, st.P, st.Q), c = Math.cos(Math.PI * st.anim);
          return [h[0] + c * (p[0] - h[0]), h[1] + c * (p[1] - h[1])];
        }
        return board.create('point', [function () { return g()[0]; }, function () { return g()[1]; }], { visible: false });
      });
      board.create('polygon', G, { fillColor: C.fillGreen, fillOpacity: 1, borders: { strokeColor: C.green, dash: 1, strokeWidth: 2 }, vertices: { visible: false },
        visible: function () { return st.playing; } });
      U.labels(board, C);
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        st.anim = Math.min(1, (t - st.t0) / 2000);
        B.board.update();
        if (st.anim >= 1) { st.playing = false; B.board.update(); }
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
