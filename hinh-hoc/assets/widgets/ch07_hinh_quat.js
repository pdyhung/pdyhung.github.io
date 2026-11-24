/* ch07_hinh_quat.js — Bài 5: Hình quạt tròn: diện tích S = πr²·n/360, độ dài cung l = πr·n/180. */
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

  GeoWidget.register('ch07_hinh_quat', function (ui, el) {
    var D0 = { r: 3, deg: 120, rot: 20 };
    var st = { r: D0.r, deg: D0.deg, rot: D0.rot };
    var sR = ui.slider({ label: 'Bán kính r', min: 0.5, max: 6, step: 0, value: st.r, decimals: 2, onInput: function (v) { st.r = v; place(); } });
    var sN = ui.slider({ label: 'Số đo cung n (°)', min: 0, max: 360, step: 0, value: st.deg, decimals: 1, unit: '°', onInput: function (v) { st.deg = v; place(); } });
    var row = ui.row('Chọn nhanh');
    [30, 45, 60, 90, 120, 180, 270, 360].forEach(function (n) { ui.button(row, n + '°', function () { st.deg = n; sN.set(n); place(); }, 'chip'); });
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () { st.r = D0.r; st.deg = D0.deg; st.rot = D0.rot; sR.set(st.r); sN.set(st.deg); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['n', 'Số đo cung n'], ['r', 'Bán kính r'], ['frac', 'Phần của hình tròn n/360'], ['Sc', 'Diện tích hình tròn πr²'],
      ['S', 'Diện tích hình quạt'], ['l', 'Độ dài cung l'], ['lr2', 'Kiểm tra l·r/2'], ['P', 'Chu vi hình quạt 2r + l']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7.5, 7.5, 7.5, -7.5], ratio: 0.95, maxH: 600, aria: 'Hình quạt tròn tâm O bán kính r, số đo cung n độ', hint: 'Kéo A để xoay, kéo B để đổi số đo cung, kéo R để đổi bán kính' });
    var A, P, Rr;
    function pol(a, rr) { rr = rr == null ? st.r : rr; return [rr * Math.cos(a * D2R), rr * Math.sin(a * D2R)]; }
    function S() { return Math.PI * st.r * st.r * st.deg / 360; }
    function L() { return Math.PI * st.r * st.deg / 180; }
    function place() { if (!B || !B.board) { refresh(); return; } B.board.update(); A.moveTo(pol(st.rot)); P.moveTo(pol(st.rot + st.deg)); Rr.moveTo(pol(st.rot + st.deg + (360 - st.deg) / 2)); B.board.update(); refresh(); }
    function refresh() {
      out('n', fm(st.deg, 1) + '°'); out('r', fm(st.r)); out('frac', fm(st.deg / 360, 4));
      out('Sc', fm(Math.PI * st.r * st.r)); out('S', fm(S())); out('l', fm(L())); out('lr2', fm(L() * st.r / 2)); out('P', fm(2 * st.r + L()));
    }
    function draw(board, C) {
      var O = board.create('point', [0, 0], { name: 'O', size: 3, color: C.text, fixed: true, label: { offset: [-16, -12] } });
      var circ = board.create('circle', [O, function () { return st.r; }], { strokeColor: C.muted, strokeWidth: 1.5, dash: 2, fixed: true, highlight: false });
      shape(board, function () { return [[0, 0]].concat(arcPts(0, 0, st.r, st.rot, st.rot + st.deg)).concat([[0, 0]]); }, { strokeColor: C.blue, fillColor: C.fillBlue, strokeWidth: 2.5 });
      shape(board, function () { return arcPts(0, 0, st.r, st.rot, st.rot + st.deg); }, { strokeColor: C.orange, strokeWidth: 5, layer: 6 });
      shape(board, function () { var q = Math.min(0.8, st.r * 0.3); return arcPts(0, 0, q, st.rot, st.rot + st.deg); }, { strokeColor: C.blue, strokeWidth: 1.5 });
      label(board, function () { return pol(st.rot + st.deg / 2, Math.min(0.8, st.r * 0.3) + 0.5)[0]; }, function () { return pol(st.rot + st.deg / 2, Math.min(0.8, st.r * 0.3) + 0.5)[1]; },
        function () { return fm(st.deg, 1) + '°'; }, { strokeColor: C.blue });
      label(board, function () { return pol(st.rot + st.deg / 2, st.r * 0.62)[0]; }, function () { return pol(st.rot + st.deg / 2, st.r * 0.62)[1]; },
        function () { return st.deg > 25 ? 'S = ' + fm(S()) : ''; }, { strokeColor: C.blue, fontSize: 15, cssStyle: 'font-weight:700' });
      label(board, function () { return pol(st.rot + st.deg / 2, st.r + 0.6)[0]; }, function () { return pol(st.rot + st.deg / 2, st.r + 0.6)[1]; },
        function () { return 'l = ' + fm(L()); }, { strokeColor: C.orange });
      A = board.create('glider', pol(st.rot).concat([circ]), { name: 'A', size: 4, color: C.blue });
      P = board.create('glider', pol(st.rot + st.deg).concat([circ]), { name: 'B', size: 4, color: C.orange });
      Rr = board.create('point', pol(st.rot + st.deg + (360 - st.deg) / 2), { name: 'R', size: 3, color: C.purple });
      board.create('segment', [O, Rr], { strokeColor: C.purple, strokeWidth: 1, dash: 1, fixed: true, highlight: false });
      A.on('drag', function () { st.rot = n360(Math.atan2(A.Y(), A.X()) / D2R); B.board.update(); P.moveTo(pol(st.rot + st.deg)); Rr.moveTo(pol(st.rot + st.deg + (360 - st.deg) / 2)); refresh(); });
      P.on('drag', function () { st.deg = n360(Math.atan2(P.Y(), P.X()) / D2R - st.rot); if (st.deg < 0.5 && st.deg > 0) st.deg = 0; sN.set(st.deg); Rr.moveTo(pol(st.rot + st.deg + (360 - st.deg) / 2)); refresh(); });
      Rr.on('drag', function () {
        st.r = clamp(Math.hypot(Rr.X(), Rr.Y()), 0.5, 6); sR.set(st.r);
        B.board.update(); A.moveTo(pol(st.rot)); P.moveTo(pol(st.rot + st.deg)); refresh();
      });
      Rr.on('up', function () { Rr.moveTo(pol(st.rot + st.deg + (360 - st.deg) / 2)); });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
