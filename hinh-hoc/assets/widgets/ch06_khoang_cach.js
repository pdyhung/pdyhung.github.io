/* ch06_khoang_cach.js — Khoảng cách giữa hai điểm và trung điểm đoạn thẳng (Chương 6, Bài 1).
   Kéo A, B (hoặc nhập tọa độ); hiện tam giác vuông với hai cạnh |Δx|, |Δy|, độ dài AB và trung điểm M. */
(function () {
  'use strict';
  GeoWidget.register('ch06_khoang_cach', function (ui, el) {
    var ch = GeoWidget.ch06, f = ch.f;
    var D0 = { A: [-2, -1], B: [2, 2] };
    var st = { A: D0.A.slice(), B: D0.B.slice(), snap: true, tri: true, mid: true };
    var ax = el.getAttribute('data-a'), bx = el.getAttribute('data-b');
    if (ax) st.A = ax.split(',').map(Number);
    if (bx) st.B = bx.split(',').map(Number);
    var init = { A: st.A.slice(), B: st.B.slice() };

    var co = ch.coords(ui, 'Tọa độ hai điểm (nhập số)', ['A', 'B'], st, function (k) { P[k] && P[k].moveTo(st[k]); refresh(); });
    var row = ui.row();
    ui.checkbox('Bắt điểm vào lưới', true, function (v) { st.snap = v; }, row);
    ui.checkbox('Tam giác vuông', true, function (v) { st.tri = v; refresh(); }, row);
    ui.checkbox('Trung điểm M', true, function (v) { st.mid = v; refresh(); }, row);
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () { st.A = init.A.slice(); st.B = init.B.slice(); co.sync(); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['A', 'A'], ['B', 'B'], ['dx', 'Δx = x_B − x_A'], ['dy', 'Δy = y_B − y_A'], ['AB', 'AB = √(Δx² + Δy²)'], ['M', 'Trung điểm M = ((x_A + x_B)/2; (y_A + y_B)/2)']]);
    ch.wide(ui, [4, 5]);

    var B = GeoWidget.board2d(ui, { ratio: 0.92, maxH: 560, bbox: [-7, 6, 7, -6], axis: true, grid: true, aria: 'Hai điểm A, B trên mặt phẳng tọa độ, tam giác vuông và trung điểm M' });
    var P = {};

    function refresh() {
      var A = st.A, Bp = st.B, dx = Bp[0] - A[0], dy = Bp[1] - A[1], s = dx * dx + dy * dy, M = ch.mid(A, Bp);
      out('A', ch.pt(A)); out('B', ch.pt(Bp));
      out('dx', f(Bp[0]) + ' − ' + ch.par(A[0]) + ' = ' + f(dx));
      out('dy', f(Bp[1]) + ' − ' + ch.par(A[1]) + ' = ' + f(dy));
      out('AB', '√(' + f(dx * dx) + ' + ' + f(dy * dy) + ') = ' + ch.sqrtStr(s));
      out('M', '((' + f(A[0]) + ' + ' + ch.par(Bp[0]) + ')/2; (' + f(A[1]) + ' + ' + ch.par(Bp[1]) + ')/2) = ' + ch.pt(M));
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var snap = function () { return st.snap; };
      P.A = ch.point(board, 'A', st.A, C.blue, snap, function (p) { st.A = p; co.sync('A'); refresh(); });
      P.B = ch.point(board, 'B', st.B, C.blue, snap, function (p) { st.B = p; co.sync('B'); refresh(); });
      var X = function (k) { return function () { return P[k].X(); }; }, Y = function (k) { return function () { return P[k].Y(); }; };
      var triOn = function () { return st.tri; };
      var Cv = ch.fpt(board, X('B'), Y('A'));
      // hai cạnh góc vuông
      board.create('segment', [P.A, Cv], { strokeColor: C.green, strokeWidth: 3, dash: 2, fixed: true, highlight: false, visible: triOn });
      board.create('segment', [Cv, P.B], { strokeColor: C.orange, strokeWidth: 3, dash: 2, fixed: true, highlight: false, visible: triOn });
      // dấu góc vuông
      var sq = 0.35, sx = function () { return P.A.X() < P.B.X() ? -1 : 1; }, sy = function () { return P.B.Y() > P.A.Y() ? 1 : -1; };
      var q1 = ch.fpt(board, function () { return P.B.X() + sx() * sq; }, Y('A'));
      var q2 = ch.fpt(board, function () { return P.B.X() + sx() * sq; }, function () { return P.A.Y() + sy() * sq; });
      var q3 = ch.fpt(board, X('B'), function () { return P.A.Y() + sy() * sq; });
      board.create('polygon', [Cv, q1, q2, q3], { fillOpacity: 0, borders: { strokeColor: C.muted, strokeWidth: 1.5, highlight: false }, vertices: { visible: false }, highlight: false,
        visible: function () { return st.tri && Math.abs(P.A.X() - P.B.X()) > 0.5 && Math.abs(P.A.Y() - P.B.Y()) > 0.5; } });
      board.create('segment', [P.A, P.B], { strokeColor: C.blue, strokeWidth: 3.5, fixed: true, highlight: false });
      ch.text(board, function () { return (P.A.X() + P.B.X()) / 2; }, function () { return P.A.Y() - sy() * 0.45; },
        function () { return '|Δx| = ' + f(Math.abs(P.B.X() - P.A.X())); }, C.green, { visible: function () { return st.tri && Math.abs(P.A.X() - P.B.X()) > 1e-9; } });
      ch.text(board, function () { return P.B.X() - sx() * 0.25; }, function () { return (P.A.Y() + P.B.Y()) / 2; },
        function () { return '|Δy| = ' + f(Math.abs(P.B.Y() - P.A.Y())); }, C.orange,
        { anchorX: function () { return sx() < 0 ? 'left' : 'right'; }, visible: function () { return st.tri && Math.abs(P.A.Y() - P.B.Y()) > 1e-9; } });
      board.create('point', [function () { return (P.A.X() + P.B.X()) / 2; }, function () { return (P.A.Y() + P.B.Y()) / 2; }],
        { name: 'M', fixed: true, size: 3.5, color: C.purple, strokeColor: C.purple, fillColor: C.purple, label: { offset: [-16, 12] }, visible: function () { return st.mid; } });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
