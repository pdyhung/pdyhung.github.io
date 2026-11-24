/* ch07_yeu_to.js — Bài 1: Các yếu tố của đường tròn (tâm, bán kính, dây, đường kính, cung nhỏ, cung lớn). */
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

  GeoWidget.register('ch07_yeu_to', function (ui, el) {
    var D0 = { O: [0, 0], r: 3, a: 35, b: 150 };
    var st = { O: D0.O.slice(), r: D0.r, a: D0.a, b: D0.b, diam: true, dist: true };
    var sR = ui.slider({ label: 'Bán kính r', min: 0.5, max: 5, step: 0, value: st.r, decimals: 2, onInput: function (v) { st.r = v; place(); } });
    var sA = ui.slider({ label: 'Vị trí điểm P (°)', min: 0, max: 360, step: 0, value: st.a, decimals: 1, onInput: function (v) { st.a = v; place(); } });
    var sB = ui.slider({ label: 'Vị trí điểm Q (°)', min: 0, max: 360, step: 0, value: st.b, decimals: 1, onInput: function (v) { st.b = v; place(); } });
    var row = ui.row();
    ui.checkbox('Đường kính PP′', true, function (v) { st.diam = v; B.board.update(); }, row);
    ui.checkbox('Khoảng cách OH', true, function (v) { st.dist = v; B.board.update(); }, row);
    var row2 = ui.row();
    ui.button(row2, 'Biến PQ thành đường kính', function () { st.b = n360(st.a + 180); sB.set(st.b); place(); }, 'btn secondary');
    ui.button(row2, '↺ Đặt lại', function () {
      st.O = D0.O.slice(); st.r = D0.r; st.a = D0.a; st.b = D0.b; sR.set(st.r); sA.set(st.a); sB.set(st.b);
      B.resetView(); B.build(draw);
    }, 'btn secondary');
    var out = ui.readout([['r', 'Bán kính r'], ['d', 'Đường kính 2r'], ['C', 'Chu vi 2πr'], ['ch', 'Dây PQ'], ['h', 'Khoảng cách OH'],
      ['th', 'Góc ở tâm POQ'], ['mi', 'Số đo cung nhỏ PQ'], ['ma', 'Số đo cung lớn PQ']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6.5, 6.5, 6.5, -6.5], ratio: 0.95, maxH: 600, aria: 'Đường tròn tâm O với bán kính, dây PQ, đường kính và hai cung', hint: 'Kéo O, P, Q · Cuộn để phóng to · Shift + kéo để dời' });
    var O, P, Q;
    function pol(a) { return [st.O[0] + st.r * Math.cos(a * D2R), st.O[1] + st.r * Math.sin(a * D2R)]; }
    function central() { var d = n360(st.b - st.a); return d <= 180 ? d : 360 - d; }
    /* cung nhỏ: [bắt đầu, kết thúc] theo chiều dương */
    function minorArc() { var d = n360(st.b - st.a); return d <= 180 ? [st.a, st.a + d] : [st.b, st.b + 360 - d]; }
    function place() {
      if (!B || !B.board) return;
      B.board.update(); P.moveTo(pol(st.a)); Q.moveTo(pol(st.b)); B.board.update(); refresh();
    }
    function refresh() {
      var th = central();
      out('r', fm(st.r)); out('d', fm(2 * st.r)); out('C', fm(2 * Math.PI * st.r));
      out('ch', fm(2 * st.r * Math.sin(th / 2 * D2R)) + (Math.abs(th - 180) < 1e-9 ? ' (là đường kính)' : ''));
      out('h', fm(st.r * Math.cos(th / 2 * D2R)));
      out('th', fm(th, 1) + '°'); out('mi', fm(th, 1) + '°'); out('ma', fm(360 - th, 1) + '°');
    }
    function draw(board, C) {
      O = board.create('point', st.O, { name: 'O', size: 4, color: C.purple, label: { offset: [-16, -12] } });
      var circ = board.create('circle', [O, function () { return st.r; }], { strokeColor: C.blue, strokeWidth: 2.5, fixed: true, highlight: false });
      // tia mốc 0°
      shape(board, function () { return [st.O, [st.O[0] + st.r + 0.8, st.O[1]]]; }, { strokeColor: C.muted, strokeWidth: 1, dash: 2 });
      label(board, function () { return st.O[0] + st.r + 1.1; }, function () { return st.O[1]; }, '0°', { fontSize: 12, strokeColor: C.muted });
      // cung nhỏ (tô xanh lá), cung lớn (đường tròn xanh dương)
      shape(board, function () { var m = minorArc(); return arcPts(st.O[0], st.O[1], st.r, m[0], m[1]); }, { strokeColor: C.green, strokeWidth: 6, layer: 6 });
      label(board, function () { var m = minorArc(); return st.O[0] + (st.r + 0.7) * Math.cos((m[0] + m[1]) / 2 * D2R); },
        function () { var m = minorArc(); return st.O[1] + (st.r + 0.7) * Math.sin((m[0] + m[1]) / 2 * D2R); }, 'cung nhỏ', { strokeColor: C.green, fontSize: 13 });
      label(board, function () { var m = minorArc(); return st.O[0] + (st.r + 0.7) * Math.cos(((m[0] + m[1]) / 2 + 180) * D2R); },
        function () { var m = minorArc(); return st.O[1] + (st.r + 0.7) * Math.sin(((m[0] + m[1]) / 2 + 180) * D2R); }, 'cung lớn', { strokeColor: C.blue, fontSize: 13 });
      P = board.create('glider', pol(st.a).concat([circ]), { name: 'P', size: 4, color: C.orange });
      Q = board.create('glider', pol(st.b).concat([circ]), { name: 'Q', size: 4, color: C.orange });
      // đường kính PP'
      var P2 = board.create('point', [function () { return 2 * st.O[0] - P.X(); }, function () { return 2 * st.O[1] - P.Y(); }],
        { name: 'P′', size: 2, color: C.purple, fixed: true, visible: function () { return st.diam; } });
      board.create('segment', [P, P2], { strokeColor: C.purple, strokeWidth: 2, dash: 3, fixed: true, highlight: false, visible: function () { return st.diam; } });
      board.create('segment', [O, Q], { strokeColor: C.muted, strokeWidth: 1.5, fixed: true, highlight: false });
      board.create('segment', [P, Q], { strokeColor: C.orange, strokeWidth: 3.5, fixed: true, highlight: false });
      var H = board.create('point', [function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }],
        { name: 'H', size: 2, color: C.red, fixed: true, visible: function () { return st.dist && central() < 179.5; } });
      board.create('segment', [O, H], { strokeColor: C.red, strokeWidth: 1.5, dash: 2, fixed: true, highlight: false, visible: function () { return st.dist && central() < 179.5; } });
      shape(board, function () { return st.dist && central() < 179.5 ? rightMark([H.X(), H.Y()], st.O, [P.X(), P.Y()], 0.25) : []; }, { strokeColor: C.red, strokeWidth: 1.2 });
      label(board, function () { return (st.O[0] + st.r * Math.cos(st.a * D2R) / 2) + 0.25; }, function () { return st.O[1] + st.r * Math.sin(st.a * D2R) / 2 + 0.25; },
        function () { return st.diam ? 'r' : ''; }, { strokeColor: C.purple });
      O.on('drag', function () { st.O = [O.X(), O.Y()]; place(); });
      P.on('drag', function () { st.a = n360(Math.atan2(P.Y() - st.O[1], P.X() - st.O[0]) / D2R); sA.set(st.a); refresh(); });
      Q.on('drag', function () { st.b = n360(Math.atan2(Q.Y() - st.O[1], Q.X() - st.O[0]) / D2R); sB.set(st.b); refresh(); });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
