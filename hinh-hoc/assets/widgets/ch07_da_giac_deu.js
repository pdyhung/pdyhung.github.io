/* ch07_da_giac_deu.js — Bài 6: Đa giác đều n cạnh nội tiếp đường tròn (O; R): cạnh a = 2R·sin(180°/n). */
(function () {
  'use strict';
  var fm = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var D2R = Math.PI / 180;
  function n360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* Đường cong/đa giác tô màu vẽ theo dữ liệu tính lại ở mỗi lần cập nhật bảng vẽ */
  function shape(board, fn, attr) {
    var o = { fixed: true, highlight: false, strokeWidth: 2, fillOpacity: 1 };
    for (var k in attr) o[k] = attr[k];
    var c = board.create('curve', [[0], [0]], o);
    c.updateDataArray = function () {
      var p = fn() || [];
      this.dataX = p.map(function (q) { return q[0]; }); this.dataY = p.map(function (q) { return q[1]; });
    };
    return c;
  }
  /* Các điểm trên cung tròn tâm (cx; cy), bán kính r, từ góc a0 đến a1 (độ, đi ngược chiều kim đồng hồ khi a1 > a0) */
  function arcPts(cx, cy, r, a0, a1) {
    var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 2)), p = [];
    for (var i = 0; i <= n; i++) { var t = (a0 + (a1 - a0) * i / n) * D2R; p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
    return p;
  }
  function label(board, fx, fy, fs, attr) {
    var o = { fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle', fontSize: 14 };
    for (var k in attr) o[k] = attr[k];
    return board.create('text', [fx, fy, fs], o);
  }
  /* Dấu góc vuông tại T, hai cạnh hướng về U và V */
  function rightMark(T, U, V, s) {
    var u = [U[0] - T[0], U[1] - T[1]], v = [V[0] - T[0], V[1] - T[1]];
    var lu = Math.hypot(u[0], u[1]) || 1, lv = Math.hypot(v[0], v[1]) || 1;
    u = [u[0] / lu * s, u[1] / lu * s]; v = [v[0] / lv * s, v[1] / lv * s];
    return [[T[0] + u[0], T[1] + u[1]], [T[0] + u[0] + v[0], T[1] + u[1] + v[1]], [T[0] + v[0], T[1] + v[1]]];
  }

  GeoWidget.register('ch07_da_giac_deu', function (ui, el) {
    var D0 = { n: 6, R: 3, rot: 90 };
    var st = { n: D0.n, R: D0.R, rot: D0.rot, apo: true };
    var sN = ui.slider({ label: 'Số cạnh n', min: 3, max: 24, step: 1, value: st.n, decimals: 0, onInput: function (v) { st.n = Math.round(v); upd(); } });
    var sR = ui.slider({ label: 'Bán kính đường tròn ngoại tiếp R', min: 0.5, max: 5, step: 0, value: st.R, decimals: 2, onInput: function (v) { st.R = v; place(); } });
    var row = ui.row();
    ui.checkbox('Hiện trung đoạn và góc ở tâm', true, function (v) { st.apo = v; B.board.update(); }, row);
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () { st.n = D0.n; st.R = D0.R; st.rot = D0.rot; sN.set(st.n); sR.set(st.R); B.resetView(); upd(); }, 'btn secondary');
    var out = ui.readout([['ctr', 'Góc ở tâm 360°/n'], ['int', 'Mỗi góc trong'], ['a', 'Cạnh a = 2R·sin(180°/n)'], ['ap', 'Trung đoạn R·cos(180°/n)'],
      ['P', 'Chu vi n·a'], ['S', 'Diện tích'], ['k', 'Chu vi : 2R (dần tới π)']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6.5, 6.5, 6.5, -6.5], ratio: 0.95, maxH: 600, aria: 'Đa giác đều n cạnh nội tiếp đường tròn', hint: 'Kéo đỉnh A₁ để xoay hoặc đổi R · Cuộn để phóng to' });
    var A1;
    function V(i) { var t = (st.rot + 360 * i / st.n) * D2R; return [st.R * Math.cos(t), st.R * Math.sin(t)]; }
    function side() { return 2 * st.R * Math.sin(Math.PI / st.n); }
    function upd() { if (B && B.board) B.build(draw); refresh(); }
    function place() { if (!B || !B.board) { refresh(); return; } A1.moveTo(V(0)); B.board.update(); refresh(); }
    function refresh() {
      var n = st.n, a = side();
      out('ctr', fm(360 / n, 2) + '°'); out('int', fm((n - 2) * 180 / n, 2) + '°');
      out('a', fm(a)); out('ap', fm(st.R * Math.cos(Math.PI / n))); out('P', fm(n * a));
      out('S', fm(n / 2 * st.R * st.R * Math.sin(2 * Math.PI / n))); out('k', fm(n * a / (2 * st.R), 4));
    }
    function draw(board, C) {
      board.create('point', [0, 0], { name: 'O', size: 3, color: C.text, fixed: true, label: { offset: [-16, -12] } });
      shape(board, function () { return arcPts(0, 0, st.R, 0, 360); }, { strokeColor: C.blue, strokeWidth: 2 });
      shape(board, function () { var p = []; for (var i = 0; i <= st.n; i++) p.push(V(i)); return p; }, { strokeColor: C.orange, fillColor: C.fillOrange, strokeWidth: 2.5 });
      // góc ở tâm A1OA2 và trung đoạn OH
      shape(board, function () { return st.apo ? [V(0), [0, 0], V(1)] : []; }, { strokeColor: C.purple, strokeWidth: 1.5 });
      shape(board, function () { return st.apo ? arcPts(0, 0, Math.min(0.7, st.R * 0.3), st.rot, st.rot + 360 / st.n) : []; }, { strokeColor: C.purple, strokeWidth: 1.5 });
      shape(board, function () { var a = V(0), b = V(1); return st.apo ? [[0, 0], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]] : []; }, { strokeColor: C.green, strokeWidth: 1.5, dash: 2 });
      shape(board, function () { var a = V(0), b = V(1), h = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; return st.apo ? rightMark(h, [0, 0], a, 0.22) : []; }, { strokeColor: C.green, strokeWidth: 1.2 });
      for (var i = 1; i < st.n; i++) (function (i) {
        board.create('point', [function () { return V(i)[0]; }, function () { return V(i)[1]; }],
          { name: st.n <= 12 ? 'A' + toSub(i + 1) : '', size: 2, color: C.orange, fixed: true, label: { offset: [6, 6] } });
      })(i);
      A1 = board.create('point', V(0), { name: 'A₁', size: 4, color: C.red });
      label(board, function () { var t = (st.rot + 180 / st.n) * D2R, q = Math.min(0.7, st.R * 0.3) + 0.45; return q * Math.cos(t); },
        function () { var t = (st.rot + 180 / st.n) * D2R, q = Math.min(0.7, st.R * 0.3) + 0.45; return q * Math.sin(t); },
        function () { return st.apo && st.n <= 12 ? fm(360 / st.n, 1) + '°' : ''; }, { strokeColor: C.purple, fontSize: 13 });
      A1.on('drag', function () {
        st.rot = n360(Math.atan2(A1.Y(), A1.X()) / D2R);
        var R = Math.hypot(A1.X(), A1.Y()), Rc = clamp(R, 0.5, 5); st.R = Rc; sR.set(Rc);
        if (Rc !== R) A1.moveTo(V(0));
        refresh();
      });
      refresh();
    }
    function toSub(k) { return String(k).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join(''); }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
