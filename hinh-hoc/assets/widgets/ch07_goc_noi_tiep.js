/* ch07_goc_noi_tiep.js — Bài 3: Góc nội tiếp bằng nửa số đo cung bị chắn (bằng nửa góc ở tâm cùng chắn cung đó). */
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

  GeoWidget.register('ch07_goc_noi_tiep', function (ui, el) {
    var D0 = { r: 4, a: 210, b: 330, m: 105 };
    var st = { r: D0.r, a: D0.a, b: D0.b, m: D0.m };
    var sR = ui.slider({ label: 'Bán kính r', min: 1.5, max: 5, step: 0, value: st.r, decimals: 2, onInput: function (v) { st.r = v; place(); } });
    var g = ui.group('Vị trí các điểm trên đường tròn (°)');
    var sA = ui.slider({ label: 'Điểm A', min: 0, max: 360, step: 0, value: st.a, decimals: 1, unit: '°', onInput: function (v) { st.a = v; place(); } });
    var sB = ui.slider({ label: 'Điểm B', min: 0, max: 360, step: 0, value: st.b, decimals: 1, unit: '°', onInput: function (v) { st.b = v; place(); } });
    var sM = ui.slider({ label: 'Điểm M (đỉnh góc nội tiếp)', min: 0, max: 360, step: 0, value: st.m, decimals: 1, unit: '°', onInput: function (v) { st.m = v; place(); } });
    [sA, sB, sM].forEach(function (s) { g.appendChild(s.input.parentNode); });
    var row = ui.row();
    ui.button(row, 'AB là đường kính', function () { st.b = n360(st.a + 180); if (Math.abs(n360(st.m - st.a)) < 5 || Math.abs(n360(st.m - st.b)) < 5) st.m = n360(st.a + 90); sB.set(st.b); sM.set(st.m); place(); }, 'btn secondary');
    ui.button(row, '↺ Đặt lại', function () { st.r = D0.r; st.a = D0.a; st.b = D0.b; st.m = D0.m; sR.set(st.r); sA.set(st.a); sB.set(st.b); sM.set(st.m); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['arc', 'Cung AB bị chắn'], ['ctr', 'Góc ở tâm AOB'], ['ins', 'Góc nội tiếp AMB'], ['ratio', 'Tỉ số AMB : AOB'], ['kind', 'Loại góc AMB']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6, 6, 6, -6], ratio: 0.95, maxH: 600, aria: 'Đường tròn tâm O, góc nội tiếp AMB và góc ở tâm AOB cùng chắn cung AB', hint: 'Kéo A, B, M trên đường tròn · Cuộn để phóng to' });
    var A, Bp, M;
    function pol(a, rr, c) { rr = rr == null ? st.r : rr; c = c || [0, 0]; return [c[0] + rr * Math.cos(a * D2R), c[1] + rr * Math.sin(a * D2R)]; }
    /* cung AB không chứa M: [bắt đầu, kết thúc] theo chiều dương */
    function arcAB() {
      var dAB = n360(st.b - st.a), dAM = n360(st.m - st.a);
      return dAM < dAB ? [st.b, st.b + 360 - dAB] : [st.a, st.a + dAB];
    }
    function inscribed() {
      var M0 = pol(st.m), A0 = pol(st.a), B0 = pol(st.b);
      var u = [A0[0] - M0[0], A0[1] - M0[1]], v = [B0[0] - M0[0], B0[1] - M0[1]];
      var lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
      if (lu < 1e-9 || lv < 1e-9) return NaN;
      return Math.acos(clamp((u[0] * v[0] + u[1] * v[1]) / (lu * lv), -1, 1)) / D2R;
    }
    function place() { if (!B || !B.board) { refresh(); return; } B.board.update(); A.moveTo(pol(st.a)); Bp.moveTo(pol(st.b)); M.moveTo(pol(st.m)); B.board.update(); refresh(); }
    function refresh() {
      var c = arcAB(), arc = c[1] - c[0], ins = inscribed();
      out('arc', fm(arc, 1) + '°');
      out('ctr', fm(arc, 1) + '°' + (arc > 180.05 ? ' (lớn hơn 180°)' : ''));
      out('ins', fm(ins, 1) + '°');
      out('ratio', isFinite(ins) && arc > 0.01 ? fm(ins / arc, 3) : '—');
      out('kind', !isFinite(ins) ? '— (M trùng A hoặc B)' : Math.abs(arc - 180) < 0.05 ? 'vuông' : arc < 180 ? 'nhọn' : 'tù');
    }
    function draw(board, C) {
      var O = board.create('point', [0, 0], { name: 'O', size: 3, color: C.blue, fixed: true, label: { offset: [-18, 2] } });
      var circ = board.create('circle', [O, function () { return st.r; }], { strokeColor: C.text, strokeWidth: 2, fixed: true, highlight: false });
      // góc ở tâm: hình quạt chắn cung AB không chứa M
      shape(board, function () { var c = arcAB(); return [[0, 0]].concat(arcPts(0, 0, st.r, c[0], c[1])).concat([[0, 0]]); }, { strokeColor: 'none', fillColor: C.fillBlue, strokeWidth: 0 });
      shape(board, function () { var c = arcAB(); return arcPts(0, 0, st.r, c[0], c[1]); }, { strokeColor: C.green, strokeWidth: 6, layer: 6 });
      shape(board, function () { var c = arcAB(); return arcPts(0, 0, 0.7, c[0], c[1]); }, { strokeColor: C.blue, strokeWidth: 2 });
      label(board, function () { var c = arcAB(); return pol((c[0] + c[1]) / 2, 1.25)[0]; }, function () { var c = arcAB(); return pol((c[0] + c[1]) / 2, 1.25)[1]; },
        function () { var c = arcAB(); return fm(c[1] - c[0], 1) + '°'; }, { strokeColor: C.blue, fontSize: 15 });
      A = board.create('glider', pol(st.a).concat([circ]), { name: 'A', size: 4, color: C.green });
      Bp = board.create('glider', pol(st.b).concat([circ]), { name: 'B', size: 4, color: C.green });
      M = board.create('glider', pol(st.m).concat([circ]), { name: 'M', size: 4, color: C.orange });
      board.create('segment', [O, A], { strokeColor: C.blue, strokeWidth: 2, fixed: true, highlight: false });
      board.create('segment', [O, Bp], { strokeColor: C.blue, strokeWidth: 2, fixed: true, highlight: false });
      board.create('segment', [M, A], { strokeColor: C.orange, strokeWidth: 2.5, fixed: true, highlight: false });
      board.create('segment', [M, Bp], { strokeColor: C.orange, strokeWidth: 2.5, fixed: true, highlight: false });
      // góc nội tiếp tại M
      function mArc() {
        var a1 = Math.atan2(A.Y() - M.Y(), A.X() - M.X()) / D2R, a2 = Math.atan2(Bp.Y() - M.Y(), Bp.X() - M.X()) / D2R;
        var d = n360(a2 - a1); return d <= 180 ? [a1, a1 + d] : [a2, a2 + 360 - d];
      }
      shape(board, function () { var c = mArc(), Mc = [M.X(), M.Y()]; return [Mc].concat(arcPts(Mc[0], Mc[1], 0.8, c[0], c[1])).concat([Mc]); }, { strokeColor: C.orange, fillColor: C.fillOrange, strokeWidth: 1.5 });
      label(board, function () { var c = mArc(); return pol((c[0] + c[1]) / 2, 1.35, [M.X(), M.Y()])[0]; }, function () { var c = mArc(); return pol((c[0] + c[1]) / 2, 1.35, [M.X(), M.Y()])[1]; },
        function () { return fm(inscribed(), 1) + '°'; }, { strokeColor: C.orange, fontSize: 15 });
      A.on('drag', function () { st.a = n360(Math.atan2(A.Y(), A.X()) / D2R); sA.set(st.a); refresh(); });
      Bp.on('drag', function () { st.b = n360(Math.atan2(Bp.Y(), Bp.X()) / D2R); sB.set(st.b); refresh(); });
      M.on('drag', function () { st.m = n360(Math.atan2(M.Y(), M.X()) / D2R); sM.set(st.m); refresh(); });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
