/* ch07_radian.js — Bài 2: Số đo cung, độ dài cung, radian.
   Hoạt ảnh "cuộn bán kính": một đoạn thẳng dài đúng bằng bán kính được uốn quanh đường tròn; cung nhận được chắn góc 1 radian. */
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

  GeoWidget.register('ch07_radian', function (ui, el) {
    var st = { r: 3, th: 60, L: 0, Lmax: 1, playing: false, t0: 0 };
    var lock = false;
    var sR = ui.slider({ label: 'Bán kính r', min: 1, max: 5, step: 0, value: st.r, decimals: 2, onInput: function (v) { st.r = v; place(); } });
    var sD = ui.slider({ label: 'Góc ở tâm θ (độ)', min: 0, max: 360, step: 0, value: st.th, decimals: 2, unit: '°', onInput: function (v) { st.th = v; syncAngle('d'); } });
    var sRad = ui.slider({ label: 'Góc ở tâm θ (radian)', min: 0, max: 2 * Math.PI, step: 0, value: st.th * D2R, decimals: 4, unit: 'rad', onInput: function (v) { st.th = v / D2R; syncAngle('r'); } });
    var row = ui.row('Cuộn bán kính quanh đường tròn');
    ui.button(row, '▶ Cuộn 1 bán kính', function () { play(1); });
    ui.button(row, '▶ Cuộn cả vòng', function () { play(2 * Math.PI); });
    ui.button(row, '↺ Đặt lại', function () { st.playing = false; st.L = 0; st.r = 3; st.th = 60; sR.set(3); syncAngle(); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['deg', 'θ (độ)'], ['rad', 'θ (radian)'], ['r', 'Bán kính r'], ['l', 'Độ dài cung l = r·θ'], ['lr', 'Tỉ số l : r'], ['C', 'Chu vi 2πr'], ['roll', 'Số bán kính đã cuộn']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6.5, 6.5, 6.5, -6.5], ratio: 0.95, maxH: 600, aria: 'Đường tròn, góc ở tâm θ và cung bị chắn; hoạt ảnh cuộn bán kính quanh đường tròn', hint: 'Kéo điểm P · Cuộn để phóng to' });
    var P;
    function pol(a, rr) { rr = rr == null ? st.r : rr; return [rr * Math.cos(a * D2R), rr * Math.sin(a * D2R)]; }
    function play(m) { st.Lmax = m; st.L = 0; st.playing = true; st.t0 = performance.now(); }
    function syncAngle(src) {
      if (src !== 'd') sD.set(st.th);
      if (src !== 'r') sRad.set(st.th * D2R);
      place();
    }
    function place() { if (!B || !B.board) { refresh(); return; } B.board.update(); P.moveTo(pol(st.th)); B.board.update(); refresh(); }
    function refresh() {
      var t = st.th * D2R;
      out('deg', fm(st.th, 2) + '°'); out('rad', fm(t, 4) + ' rad'); out('r', fm(st.r));
      out('l', fm(st.r * t)); out('lr', fm(t, 4)); out('C', fm(2 * Math.PI * st.r));
      out('roll', st.L > 0 ? fm(st.L, 2) + ' bán kính (cung chắn ' + fm(st.L / D2R, 1) + '°)' : '—');
    }
    function draw(board, C) {
      var O = board.create('point', [0, 0], { name: 'O', size: 3, color: C.text, fixed: true, label: { offset: [-16, -12] } });
      var circ = board.create('circle', [O, function () { return st.r; }], { strokeColor: C.blue, strokeWidth: 2, fixed: true, highlight: false });
      var A = board.create('point', [function () { return st.r; }, 0], { name: 'A', size: 3, color: C.blue, fixed: true, label: { offset: [8, -12] } });
      // hình quạt và cung bị chắn bởi góc θ
      shape(board, function () { return [[0, 0]].concat(arcPts(0, 0, st.r, 0, st.th)).concat([[0, 0]]); }, { strokeColor: 'none', fillColor: C.fillOrange, strokeWidth: 0 });
      shape(board, function () { return arcPts(0, 0, st.r, 0, st.th); }, { strokeColor: C.orange, strokeWidth: 5, layer: 6 });
      shape(board, function () { return arcPts(0, 0, Math.min(0.8, st.r * 0.35), 0, st.th); }, { strokeColor: C.orange, strokeWidth: 1.5 });
      label(board, function () { return pol(st.th / 2, Math.min(0.8, st.r * 0.35) + 0.4)[0]; }, function () { return pol(st.th / 2, Math.min(0.8, st.r * 0.35) + 0.4)[1]; }, 'θ', { strokeColor: C.orange });
      label(board, function () { return pol(st.th / 2, st.r + 0.95)[0]; }, function () { return pol(st.th / 2, st.r + 0.95)[1]; },
        function () { return st.L > 0 && !st.playing ? '' : 'l = ' + fm(st.r * st.th * D2R); }, { strokeColor: C.orange });
      board.create('segment', [O, A], { strokeColor: C.text, strokeWidth: 1.5, fixed: true, highlight: false });
      P = board.create('glider', pol(st.th).concat([circ]), { name: 'P', size: 4, color: C.orange });
      board.create('segment', [O, P], { strokeColor: C.text, strokeWidth: 1.5, fixed: true, highlight: false });
      label(board, function () { return st.r / 2; }, -0.35, 'r', { strokeColor: C.text });
      // các bán kính đã cuộn (xen kẽ hai màu) và đoạn đang cuộn
      var cols = [C.green, C.purple];
      for (var k = 0; k < 7; k++) (function (k) {
        shape(board, function () {
          if (st.L <= k) return [];
          var e = Math.min(st.L, k + 1), pts = arcPts(0, 0, st.r * 1.035, k / D2R, e / D2R);
          if (e < k + 1 && (st.playing || st.L < k + 1)) { // phần thẳng chưa cuộn, nằm trên tiếp tuyến
            var q = pol(e / D2R, st.r * 1.035), rest = (k + 1 - e) * st.r;
            pts.push([q[0] - rest * Math.sin(e), q[1] + rest * Math.cos(e)]);
          }
          return pts;
        }, { strokeColor: cols[k % 2], strokeWidth: 5, layer: 7 });
        // vạch chia tại k + 1 radian
        shape(board, function () { return st.L >= k + 1 ? [pol((k + 1) / D2R, st.r * 0.9), pol((k + 1) / D2R, st.r * 1.12)] : []; }, { strokeColor: C.text, strokeWidth: 2, layer: 7 });
        label(board, function () { return pol((k + 1) / D2R, st.r + 0.5)[0]; }, function () { return pol((k + 1) / D2R, st.r + 0.5)[1]; },
          function () { return st.L >= k + 1 ? String(k + 1) : ''; }, { strokeColor: C.text, fontSize: 15 });
      })(k);
      // góc 1 radian
      shape(board, function () { return st.L >= 1 ? [pol(1 / D2R, st.r)].concat([[0, 0]]) : []; }, { strokeColor: C.green, strokeWidth: 1.5, dash: 2 });
      label(board, function () { return pol(0.5 / D2R, st.r * 0.62)[0]; }, function () { return pol(0.5 / D2R, st.r * 0.62)[1]; },
        function () { return st.L >= 1 ? '1 rad' : ''; }, { strokeColor: C.green, fontSize: 14 });
      P.on('drag', function () { st.th = n360(Math.atan2(P.Y(), P.X()) / D2R); sD.set(st.th); sRad.set(st.th * D2R); refresh(); });
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        st.L = Math.min(st.Lmax, (t - st.t0) / 1100);
        if (st.L >= st.Lmax) {
          st.playing = false; st.L = st.Lmax; st.th = st.Lmax >= 6 ? 360 : st.Lmax / D2R;
          sD.set(st.th); sRad.set(st.th * D2R); place(); return;
        }
        B.board.update(); refresh();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
