/* ch01_tinh_tien.js — Phép tịnh tiến theo vectơ v (minh họa 2D MẪU cho cả sách).
   Khuôn chung của một widget 2D:
   1. Giữ toàn bộ trạng thái trong biến st (tọa độ điểm, tham số) — KHÔNG giữ đối tượng JSXGraph lâu dài,
      vì B.build() vẽ lại toàn bộ khi đổi giao diện sáng/tối.
   2. Điểm kéo được → sự kiện 'drag' cập nhật st, ô nhập số và bảng số đo.
   3. Ô nhập số → cập nhật st rồi moveTo() điểm tương ứng (hoặc gọi lại B.build).
   4. Bảng số đo (ui.readout) luôn hiển thị số liệu khớp với hình. */
(function () {
  'use strict';
  var f = function (x) { return GeoWidget.fmt(x, 2); };

  GeoWidget.register('ch01_tinh_tien', function (ui, el) {
    var st = { A: [-4, 1], B: [-1, 1], C: [-3, 4], v: [5, -3], trace: true, anim: 1, playing: false, t0: 0 };

    var g = ui.group('Vectơ tịnh tiến v (nhập số)');
    var inVx = ui.number({ label: 'Hoành độ của v', value: st.v[0], min: -20, max: 20, onChange: function (x) { st.v[0] = x; V && V.moveTo([x, st.v[1]]); refresh(); } }, g);
    var inVy = ui.number({ label: 'Tung độ của v', value: st.v[1], min: -20, max: 20, onChange: function (y) { st.v[1] = y; V && V.moveTo([st.v[0], y]); refresh(); } }, g);
    var row = ui.row();
    ui.checkbox('Hiện đường dịch chuyển', true, function (v) { st.trace = v; B.build(draw); }, row);
    var row2 = ui.row();
    var playBtn = ui.button(row2, '▶ Trượt hình', function () { st.playing = true; st.t0 = performance.now(); });
    ui.button(row2, '↺ Đặt lại', function () { st.A = [-4, 1]; st.B = [-1, 1]; st.C = [-3, 4]; st.v = [5, -3]; inVx.value = 5; inVy.value = -3; B.resetView(); B.build(draw); }, 'btn secondary');
    var setOut = ui.readout([['v', 'Vectơ v'], ['A', 'A → A′'], ['B', 'B → B′'], ['C', 'C → C′'], ['len', 'Độ dài AA′ = BB′ = CC′']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -7], axis: true, grid: true, aria: 'Tam giác ABC và ảnh A′B′C′ qua phép tịnh tiến theo vectơ v' });
    var V = null, P = {};

    function img(p) { return [p[0] + st.v[0], p[1] + st.v[1]]; }
    function refresh() {
      setOut('v', '(' + f(st.v[0]) + '; ' + f(st.v[1]) + ')');
      ['A', 'B', 'C'].forEach(function (k) { var q = img(st[k]); setOut(k, '(' + f(st[k][0]) + '; ' + f(st[k][1]) + ') → (' + f(q[0]) + '; ' + f(q[1]) + ')'); });
      setOut('len', f(Math.hypot(st.v[0], st.v[1])));
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 2, color: C.muted, label: { offset: [-14, -10] } });
      V = board.create('point', st.v, { name: 'v', size: 4, color: C.purple, snapToGrid: false });
      board.create('arrow', [O, V], { strokeColor: C.purple, strokeWidth: 3 });
      V.on('drag', function () { st.v = [V.X(), V.Y()]; inVx.value = +V.X().toFixed(2); inVy.value = +V.Y().toFixed(2); refresh(); });
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        Q[k] = board.create('point', [function () { return P[k].X() + V.X(); }, function () { return P[k].Y() + V.Y(); }],
          { name: k + '′', size: 3, color: C.orange, fixed: true });
        if (st.trace) board.create('arrow', [P[k], Q[k]], { strokeColor: C.muted, dash: 2, strokeWidth: 1.5 });
      });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      // hình "đang trượt" khi bấm nút
      var tt = function () { return st.anim; };
      var G = ['A', 'B', 'C'].map(function (k) { return board.create('point', [function () { return P[k].X() + tt() * V.X(); }, function () { return P[k].Y() + tt() * V.Y(); }], { visible: false }); });
      board.create('polygon', G, { fillColor: C.fillGreen, fillOpacity: 1, borders: { strokeColor: C.green, dash: 1 }, vertices: { visible: false }, visible: function () { return st.playing; } });
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        st.anim = Math.min(1, (t - st.t0) / 1800);
        B.board.update();
        if (st.anim >= 1) { st.playing = false; B.board.update(); }
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
