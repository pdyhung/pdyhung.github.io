/* ch07_phuong_trinh.js — Bài 7: Phương trình đường tròn (x − a)² + (y − b)² = r² và dạng khai triển x² + y² + Dx + Ey + F = 0. */
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

  /* Viết số trong phương trình: bỏ số 0 thừa, dùng dấu phẩy */
  function nn(x) { return fm(x, 2); }
  function sq(v, s) { return Math.abs(v) < 1e-12 ? s + '²' : '(' + s + (v > 0 ? ' − ' : ' + ') + nn(Math.abs(v)) + ')²'; }
  function lin(c, s, first) {
    if (Math.abs(c) < 1e-12) return '';
    var a = Math.abs(c), t = (Math.abs(a - 1) < 1e-12 && s ? '' : nn(a)) + s;
    return (c < 0 ? ' − ' : (first ? '' : ' + ')) + t;
  }
  GeoWidget.register('ch07_phuong_trinh', function (ui, el) {
    var D0 = { a: 2, b: 1, r: 3, psi: 0, M: [-3, -2] };
    var st = { a: D0.a, b: D0.b, r: D0.r, psi: D0.psi, M: D0.M.slice(), bad: false };
    var g1 = ui.group('Tâm I(a; b) và bán kính r');
    var sA = ui.slider({ label: 'a (hoành độ tâm)', min: -6, max: 6, step: 0, value: st.a, decimals: 2, onInput: function (v) { st.a = v; st.bad = false; place(true); } });
    var sB = ui.slider({ label: 'b (tung độ tâm)', min: -6, max: 6, step: 0, value: st.b, decimals: 2, onInput: function (v) { st.b = v; st.bad = false; place(true); } });
    var sR = ui.slider({ label: 'r (bán kính)', min: 0.5, max: 7, step: 0, value: st.r, decimals: 2, onInput: function (v) { st.r = v; st.bad = false; place(true); } });
    [sA, sB, sR].forEach(function (s) { g1.appendChild(s.input.parentNode); });
    var g2 = ui.group('x² + y² + Dx + Ey + F = 0');
    function fromDEF() {
      var D = +inD.value, E = +inE.value, F = +inF.value, r2 = D * D / 4 + E * E / 4 - F;
      if (!(r2 > 0)) { st.bad = true; st.r2 = r2; B && B.board && B.board.update(); refresh(); return; }
      st.bad = false; st.a = -D / 2; st.b = -E / 2; st.r = Math.sqrt(r2);
      sA.set(st.a); sB.set(st.b); sR.set(st.r); place(false);
    }
    var inD = ui.number({ label: 'D', value: -2 * st.a, min: -30, max: 30, onChange: fromDEF }, g2);
    var inE = ui.number({ label: 'E', value: -2 * st.b, min: -30, max: 30, onChange: fromDEF }, g2);
    var inF = ui.number({ label: 'F', value: st.a * st.a + st.b * st.b - st.r * st.r, min: -200, max: 200, onChange: fromDEF }, g2);
    var g3 = ui.group('Điểm M cần xét');
    var inMx = ui.number({ label: 'Hoành độ M', value: st.M[0], min: -20, max: 20, onChange: function (v) { st.M[0] = v; Mp && Mp.moveTo(st.M); refresh(); } }, g3);
    var inMy = ui.number({ label: 'Tung độ M', value: st.M[1], min: -20, max: 20, onChange: function (v) { st.M[1] = v; Mp && Mp.moveTo(st.M); refresh(); } }, g3);
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () {
      st.a = D0.a; st.b = D0.b; st.r = D0.r; st.psi = 0; st.M = D0.M.slice(); st.bad = false;
      sA.set(st.a); sB.set(st.b); sR.set(st.r); inMx.value = st.M[0]; inMy.value = st.M[1]; B.resetView(); B.build(draw); syncDEF(); refresh();
    }, 'btn secondary');
    var out = ui.readout([['I', 'Tâm I'], ['r', 'Bán kính r'], ['eq', 'Phương trình'], ['ex', 'Dạng khai triển'], ['MI', 'MI²'], ['pos', 'Vị trí của M']]);

    var B = GeoWidget.board2d(ui, { bbox: [-8, 8, 8, -8], axis: true, grid: true, ratio: 0.95, maxH: 620, aria: 'Đường tròn trên mặt phẳng tọa độ với tâm I và bán kính r', hint: 'Kéo tâm I, điểm R trên đường tròn, điểm M · Cuộn để phóng to' });
    var I, Rp, Mp;
    function syncDEF() {
      inD.value = +(-2 * st.a).toFixed(4); inE.value = +(-2 * st.b).toFixed(4); inF.value = +(st.a * st.a + st.b * st.b - st.r * st.r).toFixed(4);
      [inD, inE, inF].forEach(function (x) { x.classList.remove('invalid'); });
    }
    function rpos() { return [st.a + st.r * Math.cos(st.psi), st.b + st.r * Math.sin(st.psi)]; }
    function place(def) {
      if (def) syncDEF();
      if (B && B.board) { I.moveTo([st.a, st.b]); Rp.moveTo(rpos()); B.board.update(); }
      refresh();
    }
    function eqText() { return sq(st.a, 'x') + ' + ' + sq(st.b, 'y') + ' = ' + nn(st.r * st.r); }
    function exText() {
      var D = -2 * st.a, E = -2 * st.b, F = st.a * st.a + st.b * st.b - st.r * st.r;
      return 'x² + y²' + lin(D, 'x') + lin(E, 'y') + lin(F, '') + ' = 0';
    }
    function refresh() {
      if (st.bad) {
        ['I', 'r', 'eq', 'MI', 'pos'].forEach(function (k) { out(k, '—'); });
        out('ex', 'Không phải đường tròn: D²/4 + E²/4 − F = ' + nn(st.r2) + ' ≤ 0');
        return;
      }
      out('I', '(' + nn(st.a) + '; ' + nn(st.b) + ')'); out('r', nn(st.r) + '   (r² = ' + nn(st.r * st.r) + ')');
      out('eq', eqText()); out('ex', exText());
      var d2 = Math.pow(st.M[0] - st.a, 2) + Math.pow(st.M[1] - st.b, 2), r2 = st.r * st.r;
      out('MI', nn(d2));
      out('pos', Math.abs(d2 - r2) < 1e-6 ? 'trên đường tròn (MI² = r²)' : d2 < r2 ? 'trong (MI² < r²)' : 'ngoài (MI² > r²)');
    }
    function draw(board, C) {
      var vis = function () { return !st.bad; };
      I = board.create('point', [st.a, st.b], { name: 'I', size: 4, color: C.purple, snapToGrid: true, snapSizeX: 0.5, snapSizeY: 0.5, visible: vis });
      Rp = board.create('point', rpos(), { name: 'R', size: 3, color: C.orange, visible: vis });
      board.create('circle', [I, Rp], { strokeColor: C.blue, strokeWidth: 2.5, fixed: true, highlight: false, visible: vis });
      board.create('segment', [I, Rp], { strokeColor: C.orange, strokeWidth: 1.5, dash: 2, fixed: true, highlight: false, visible: vis });
      // hình chiếu tâm lên hai trục
      shape(board, function () { return st.bad ? [] : [[st.a, 0], [st.a, st.b], [0, st.b]]; }, { strokeColor: C.purple, strokeWidth: 1, dash: 1 });
      Mp = board.create('point', st.M, { name: 'M', size: 3, color: C.green });
      shape(board, function () { return st.bad ? [] : [[st.a, st.b], st.M]; }, { strokeColor: C.green, strokeWidth: 1, dash: 2 });
      label(board, function () { return st.a; }, function () { return st.b + st.r + 0.6; }, function () { return st.bad ? '' : eqText(); },
        { strokeColor: C.blue, fontSize: 15, cssStyle: 'font-weight:700; white-space:nowrap' });
      label(board, function () { return (st.a + Rp.X()) / 2; }, function () { return (st.b + Rp.Y()) / 2 + 0.35; }, function () { return st.bad ? '' : 'r'; }, { strokeColor: C.orange });
      I.on('drag', function () {
        st.a = I.X(); st.b = I.Y(); st.bad = false; sA.set(st.a); sB.set(st.b);
        Rp.moveTo(rpos()); syncDEF(); refresh();
      });
      Rp.on('drag', function () {
        var dx = Rp.X() - st.a, dy = Rp.Y() - st.b;
        st.r = clamp(Math.hypot(dx, dy), 0.5, 7); st.psi = Math.atan2(dy, dx); sR.set(st.r);
        if (Math.abs(Math.hypot(dx, dy) - st.r) > 1e-9) Rp.moveTo(rpos());
        syncDEF(); refresh();
      });
      Mp.on('drag', function () { st.M = [Mp.X(), Mp.Y()]; inMx.value = +st.M[0].toFixed(2); inMy.value = +st.M[1].toFixed(2); refresh(); });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
