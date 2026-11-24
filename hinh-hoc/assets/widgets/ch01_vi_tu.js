/* ch01_vi_tu.js — Phép vị tự tâm I tỉ số k: tâm kéo được, k nhập số (kể cả k âm, |k| < 1), tia nối tâm với các đỉnh,
   tỉ số độ dài |k| và tỉ số diện tích k²; chế độ "Tìm tâm vị tự" ẩn tâm để người học tự dựng. */
(function () {
  'use strict';
  var U = GeoWidget.ch01, f = U.f;

  GeoWidget.register('ch01_vi_tu', function (ui, el) {
    var DEF = { I: [-4, -2], A: [-2, -1], B: [0, -1], C: [-1, 1], k: 2 };
    var st = { I: DEF.I.slice(), A: DEF.A.slice(), B: DEF.B.slice(), C: DEF.C.slice(), k: +(el.getAttribute('data-k') || DEF.k),
      rays: true, hide: el.getAttribute('data-find') === '1', lines: false, anim: 1, playing: false, t0: 0 };

    var gI = ui.group('Tâm vị tự I (nhập số)');
    var rI = U.pointRow(ui, gI, 'I', st.I, function (p) { st.I = p; P.I && P.I.moveTo(p); refresh(); });
    var sl = ui.slider({ label: 'Tỉ số k', min: -3, max: 3, step: 0.05, value: st.k, decimals: 2, onInput: function (v) { st.k = v; refresh(); } });
    var chips = ui.row('Chọn nhanh');
    [2, 3, 0.5, -1, -2, -0.5].forEach(function (k) {
      ui.button(chips, 'k = ' + f(k), function () { st.k = k; sl.set(k); refresh(); }, 'chip');
    });
    var gT = ui.group('Tọa độ tam giác ABC');
    var rows = {};
    ['A', 'B', 'C'].forEach(function (k) { rows[k] = U.pointRow(ui, gT, k, st[k], function (p) { st[k] = p; P[k] && P[k].moveTo(p); refresh(); }); });
    var row = ui.row();
    ui.checkbox('Hiện các đường thẳng IA, IB, IC', true, function (v) { st.rays = v; B.build(draw); }, row);
    ui.checkbox('Tìm tâm: ẩn tâm I', st.hide, function (v) { st.hide = v; B.build(draw); }, row);
    ui.checkbox('Vẽ các đường AA′, BB′, CC′', false, function (v) { st.lines = v; B.build(draw); }, row);
    var row2 = ui.row();
    ui.button(row2, '▶ Phóng dần', function () { st.playing = true; st.t0 = performance.now(); st.anim = 0; });
    ui.button(row2, '↺ Đặt lại', function () {
      st.I = DEF.I.slice(); st.A = DEF.A.slice(); st.B = DEF.B.slice(); st.C = DEF.C.slice(); st.k = DEF.k; st.playing = false; st.anim = 1;
      sl.set(st.k); rI.set(st.I); ['A', 'B', 'C'].forEach(function (k) { rows[k].set(st[k]); }); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var setOut = ui.readout([['k', 'Tỉ số k'], ['I', 'Tâm I'], ['A', 'A → A′'], ['B', 'B → B′'], ['C', 'C → C′'], ['r1', 'IA′ : IA'], ['r2', 'A′B′ : AB'],
      ['S', 'S(ABC) → S(A′B′C′)'], ['r3', 'S′ : S (= k²)'], ['vt', 'Vị trí ảnh']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -7], axis: true, grid: true, ratio: 1.15, maxH: 640, aria: 'Tam giác ABC và ảnh A′B′C′ qua phép vị tự tâm I tỉ số k' });
    var P = {};

    function img(p, k) { return U.dil(p, st.I, k == null ? st.k : k); }
    function refresh() {
      var k = st.k, A1 = img(st.A), B1 = img(st.B), C1 = img(st.C);
      var S = Math.abs(U.sarea(st.A, st.B, st.C)), S1 = Math.abs(U.sarea(A1, B1, C1));
      setOut('k', f(k) + (Math.abs(k) < 1 && k !== 0 ? ' (|k| < 1: thu nhỏ)' : Math.abs(k) > 1 ? ' (|k| > 1: phóng to)' : ''));
      setOut('I', st.hide ? 'đang ẩn: hãy tìm!' : U.pt(st.I));
      ['A', 'B', 'C'].forEach(function (q) { setOut(q, U.pt(st[q]) + ' → ' + U.pt(img(st[q]))); });
      var dA = U.dist(st.I, st.A), dAB = U.dist(st.A, st.B);
      setOut('r1', dA < 1e-9 ? 'A trùng I' : f(U.dist(st.I, A1)) + ' : ' + f(dA) + ' = ' + f(U.dist(st.I, A1) / dA));
      setOut('r2', dAB < 1e-9 ? '—' : f(U.dist(A1, B1)) + ' : ' + f(dAB) + ' = ' + f(U.dist(A1, B1) / dAB));
      setOut('S', f(S) + ' → ' + f(S1));
      setOut('r3', S < 1e-9 ? '—' : f(S1 / S));
      setOut('vt', k > 0 ? 'A′ cùng phía với A so với I' : k < 0 ? 'A′ khác phía với A so với I (I nằm giữa A và A′)' : 'k = 0: mọi điểm biến thành I');
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      P.I = board.create('point', st.I, { name: 'I', size: 4, color: C.red, label: { offset: [-16, -12] }, visible: !st.hide });
      P.I.on('drag', function () { st.I = [P.I.X(), P.I.Y()]; rI.set(st.I); refresh(); });
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; rows[k].set(st[k]); refresh(); });
      });
      var Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        Q[k] = board.create('point', [function () { return img([P[k].X(), P[k].Y()])[0]; }, function () { return img([P[k].X(), P[k].Y()])[1]; }],
          { name: k + '′', size: 3, color: C.orange, fixed: true });
        if (st.rays && !st.hide) board.create('line', [P.I, P[k]], { strokeColor: C.muted, dash: 2, strokeWidth: 1.2 });
        if (st.lines) board.create('line', [P[k], Q[k]], { strokeColor: C.purple, strokeWidth: 1.5 });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      var G = ['A', 'B', 'C'].map(function (k) {
        function g() { return img([P[k].X(), P[k].Y()], 1 + (st.k - 1) * st.anim); }
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
