/* ch07_tiep_tuyen.js — Bài 4: Tiếp tuyến vuông góc với bán kính; hai tiếp tuyến kẻ từ một điểm ở ngoài đường tròn. */
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

  GeoWidget.register('ch07_tiep_tuyen', function (ui, el) {
    var D0 = { r: 2.5, d: 6.5, phi: 15 };
    var st = { r: D0.r, d: D0.d, phi: D0.phi };
    var sR = ui.slider({ label: 'Bán kính r', min: 0.5, max: 5, step: 0, value: st.r, decimals: 2, onInput: function (v) { st.r = v; place(); } });
    var sD = ui.slider({ label: 'Khoảng cách OM', min: 0, max: 10, step: 0, value: st.d, decimals: 2, onInput: function (v) { st.d = v; place(); } });
    var sP = ui.slider({ label: 'Hướng của tia OM (°)', min: 0, max: 360, step: 0, value: st.phi, decimals: 1, unit: '°', onInput: function (v) { st.phi = v; place(); } });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { st.r = D0.r; st.d = D0.d; st.phi = D0.phi; sR.set(st.r); sD.set(st.d); sP.set(st.phi); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['pos', 'Vị trí của M'], ['n', 'Số tiếp tuyến qua M'], ['d', 'OM'], ['r', 'Bán kính r'], ['t1', 'Độ dài MT'], ['t2', 'Độ dài MT′'], ['f', '√(OM² − r²)'],
      ['a1', 'Góc OTM = góc OT′M'], ['ang', 'Góc TMT′'], ['ctr', 'Góc TOT′']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6, 7, 10, -7], ratio: 0.85, maxH: 580, aria: 'Đường tròn tâm O, điểm M và hai tiếp tuyến MT, MT′', hint: 'Kéo điểm M · Cuộn để phóng to' });
    var M;
    var EPS = 1e-9;
    function pos() { return st.d > st.r + EPS ? 'out' : (st.d > st.r - EPS ? 'on' : 'in'); }
    function Mc() { return [st.d * Math.cos(st.phi * D2R), st.d * Math.sin(st.phi * D2R)]; }
    function T(sg) {
      if (pos() === 'in') return [NaN, NaN];
      var al = pos() === 'on' ? 0 : Math.acos(st.r / st.d), t = st.phi * D2R + sg * al;
      return [st.r * Math.cos(t), st.r * Math.sin(t)];
    }
    function place() { if (!B || !B.board) { refresh(); return; } M.moveTo(Mc()); B.board.update(); refresh(); }
    function refresh() {
      var p = pos();
      out('pos', p === 'out' ? 'ngoài (OM > r)' : p === 'on' ? 'trên (OM = r)' : 'trong (OM < r)'); out('n', p === 'out' ? '2' : p === 'on' ? '1' : '0');
      out('d', fm(st.d)); out('r', fm(st.r));
      var t = p === 'in' ? NaN : Math.sqrt(Math.max(0, st.d * st.d - st.r * st.r));
      out('t1', p === 'in' ? '—' : fm(t)); out('t2', p === 'in' ? '—' : fm(t));
      out('f', p === 'in' ? '—' : fm(t));
      out('a1', p === 'out' ? '90°' : '—');
      var al = p === 'out' ? Math.asin(st.r / st.d) / D2R : NaN;
      out('ang', p === 'out' ? fm(2 * al, 1) + '°' : '—');
      out('ctr', p === 'out' ? fm(180 - 2 * al, 1) + '°' : '—');
    }
    function draw(board, C) {
      var O = board.create('point', [0, 0], { name: 'O', size: 3, color: C.blue, fixed: true, label: { offset: [-16, -12] } });
      board.create('circle', [O, function () { return st.r; }], { strokeColor: C.blue, strokeWidth: 2.5, fixed: true, highlight: false });
      M = board.create('point', Mc(), { name: 'M', size: 4, color: C.orange });
      board.create('segment', [O, M], { strokeColor: C.muted, strokeWidth: 1.5, dash: 2, fixed: true, highlight: false });
      var cols = [C.green, C.purple], names = ['T', 'T′'];
      [1, -1].forEach(function (sg, i) {
        var Tp = board.create('point', [function () { return T(sg)[0]; }, function () { return T(sg)[1]; }],
          { name: names[i], size: 3, color: cols[i], fixed: true, visible: function () { return pos() === 'out' || (pos() === 'on' && sg === 1); } });
        // tiếp tuyến: đường thẳng qua T vuông góc với OT
        shape(board, function () {
          var p = pos(); if (p === 'in' || (p === 'on' && sg === -1)) return [];
          var t = T(sg), L = 14 / st.r; return [[t[0] - L * t[1], t[1] + L * t[0]], [t[0] + L * t[1], t[1] - L * t[0]]];
        }, { strokeColor: cols[i], strokeWidth: 1.2, dash: 1 });
        shape(board, function () { return pos() === 'out' ? [Mc(), T(sg)] : []; }, { strokeColor: cols[i], strokeWidth: 3.5, layer: 7 });
        shape(board, function () { return pos() !== 'in' && (pos() === 'out' || sg === 1) ? [[0, 0], T(sg)] : []; }, { strokeColor: C.blue, strokeWidth: 2, layer: 7 });
        shape(board, function () { return pos() === 'out' ? rightMark(T(sg), [0, 0], Mc(), 0.3) : []; }, { strokeColor: C.red, strokeWidth: 1.5, layer: 7 });
        label(board, function () { var t = T(sg), m = Mc(); return (t[0] + m[0]) / 2 + 0.35 * sg * -Math.sin(st.phi * D2R); },
          function () { var t = T(sg), m = Mc(); return (t[1] + m[1]) / 2 + 0.35 * sg * Math.cos(st.phi * D2R); },
          function () { return pos() === 'out' ? fm(Math.sqrt(st.d * st.d - st.r * st.r)) : ''; }, { strokeColor: cols[i], fontSize: 14 });
        void Tp;
      });
      M.on('drag', function () {
        st.d = Math.hypot(M.X(), M.Y()); st.phi = n360(Math.atan2(M.Y(), M.X()) / D2R);
        if (st.d > 10) { st.d = 10; M.moveTo(Mc()); }
        sD.set(st.d); sP.set(st.phi); refresh();
      });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
