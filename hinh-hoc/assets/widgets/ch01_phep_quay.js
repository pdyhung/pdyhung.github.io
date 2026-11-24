/* ch01_phep_quay.js — Phép quay tâm I, góc α: tâm kéo được, góc nhập số, hoạt ảnh quay, công thức khi tâm là gốc O. */
(function () {
  'use strict';
  var U = GeoWidget.ch01, f = U.f;

  GeoWidget.register('ch01_phep_quay', function (ui, el) {
    var DEF = { I: [0, 0], A: [2, 1], B: [5, 1], C: [3, 3], alpha: 90 };
    var st = { I: DEF.I.slice(), A: DEF.A.slice(), B: DEF.B.slice(), C: DEF.C.slice(), alpha: +(el.getAttribute('data-alpha') || DEF.alpha),
      arc: true, anim: 1, playing: false, t0: 0 };

    var gI = ui.group('Tâm quay I (nhập số)');
    var rI = U.pointRow(ui, gI, 'I', st.I, function (p) { st.I = p; P.I && P.I.moveTo(p); refresh(); });
    var sl = ui.slider({ label: 'Góc quay α', min: -360, max: 360, step: 1, value: st.alpha, decimals: 1, unit: '°',
      onInput: function (v) { st.alpha = v; refresh(); } });
    var chips = ui.row('Chọn nhanh');
    [90, 180, 270, -90, 60, -45].forEach(function (a) {
      ui.button(chips, (a > 0 ? '' : '−') + Math.abs(a) + '°', function () { st.alpha = a; sl.set(a); refresh(); }, 'chip');
    });
    ui.button(chips, 'Tâm về O', function () { st.I = [0, 0]; rI.set(st.I); P.I && P.I.moveTo(st.I); refresh(); }, 'chip');
    var gT = ui.group('Tọa độ tam giác ABC');
    var rows = {};
    ['A', 'B', 'C'].forEach(function (k) { rows[k] = U.pointRow(ui, gT, k, st[k], function (p) { st[k] = p; P[k] && P[k].moveTo(p); refresh(); }); });
    var row = ui.row();
    ui.checkbox('Hiện cung quay của A và đoạn IA, IA′', true, function (v) { st.arc = v; B.build(draw); }, row);
    var row2 = ui.row();
    ui.button(row2, '▶ Quay', function () { st.playing = true; st.t0 = performance.now(); st.anim = 0; });
    ui.button(row2, '↺ Đặt lại', function () {
      st.I = DEF.I.slice(); st.A = DEF.A.slice(); st.B = DEF.B.slice(); st.C = DEF.C.slice(); st.alpha = DEF.alpha; st.playing = false; st.anim = 1;
      sl.set(st.alpha); rI.set(st.I); ['A', 'B', 'C'].forEach(function (k) { rows[k].set(st[k]); }); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var setOut = ui.readout([['al', 'Góc quay'], ['A', 'A → A′'], ['B', 'B → B′'], ['C', 'C → C′'], ['IA', 'IA = IA′'], ['ct', 'Công thức']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -7], axis: true, grid: true, ratio: 1.15, maxH: 640, aria: 'Tam giác ABC và ảnh A′B′C′ qua phép quay tâm I góc α' });
    var P = {};

    function img(p, a) { return U.rot(p, st.I, a == null ? st.alpha : a); }
    function formula() {
      var a = ((st.alpha % 360) + 360) % 360, atO = Math.abs(st.I[0]) < 1e-9 && Math.abs(st.I[1]) < 1e-9;
      if (!atO) return 'Tâm I khác O: dùng IA = IA′ và góc (IA, IA′) = α';
      if (Math.abs(a - 90) < 1e-9) return 'Q(O, 90°): (x; y) → (−y; x)';
      if (Math.abs(a - 180) < 1e-9) return 'Q(O, 180°): (x; y) → (−x; −y)';
      if (Math.abs(a - 270) < 1e-9) return 'Q(O, 270°) = Q(O, −90°): (x; y) → (y; −x)';
      if (a < 1e-9) return 'Góc 0° hoặc 360°: mọi điểm giữ nguyên';
      return 'x′ = x·cos α − y·sin α; y′ = x·sin α + y·cos α';
    }
    function refresh() {
      var a = st.alpha;
      setOut('al', 'α = ' + f(a, 1) + '° (' + (a > 0 ? 'ngược chiều kim đồng hồ' : a < 0 ? 'cùng chiều kim đồng hồ' : 'không quay') + ')');
      ['A', 'B', 'C'].forEach(function (k) { setOut(k, U.pt(st[k]) + ' → ' + U.pt(img(st[k]))); });
      setOut('IA', f(U.dist(st.I, st.A)));
      setOut('ct', formula());
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      P.I = board.create('point', st.I, { name: 'I', size: 4, color: C.red, label: { offset: [-16, -12] } });
      P.I.on('drag', function () { st.I = [P.I.X(), P.I.Y()]; rI.set(st.I); refresh(); });
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; rows[k].set(st[k]); refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        Q[k] = board.create('point', [function () { return img([P[k].X(), P[k].Y()])[0]; }, function () { return img([P[k].X(), P[k].Y()])[1]; }],
          { name: k + '′', size: 3, color: C.orange, fixed: true });
      });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      if (st.arc) {
        board.create('segment', [P.I, P.A], { strokeColor: C.muted, dash: 2, strokeWidth: 1.5 });
        board.create('segment', [P.I, Q.A], { strokeColor: C.muted, dash: 2, strokeWidth: 1.5 });
        board.create('curve', [function (t) {
          var r = Math.hypot(P.A.X() - P.I.X(), P.A.Y() - P.I.Y()), a0 = Math.atan2(P.A.Y() - P.I.Y(), P.A.X() - P.I.X());
          return P.I.X() + r * Math.cos(a0 + t * st.alpha * U.RAD);
        }, function (t) {
          var r = Math.hypot(P.A.X() - P.I.X(), P.A.Y() - P.I.Y()), a0 = Math.atan2(P.A.Y() - P.I.Y(), P.A.X() - P.I.X());
          return P.I.Y() + r * Math.sin(a0 + t * st.alpha * U.RAD);
        }, 0, 1], { strokeColor: C.purple, strokeWidth: 2, lastArrow: { type: 2, size: 5 } });
      }
      // tam giác "đang quay" khi bấm nút
      var G = ['A', 'B', 'C'].map(function (k) {
        return board.create('point', [function () { return img([P[k].X(), P[k].Y()], st.alpha * st.anim)[0]; },
          function () { return img([P[k].X(), P[k].Y()], st.alpha * st.anim)[1]; }], { visible: false });
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
