/* ch07_cat_hinh_tron.js — Bài 5: Cắt hình tròn thành n hình quạt bằng nhau rồi xếp xen kẽ thành hình gần chữ nhật
   có chiều dài ≈ πr (nửa chu vi) và chiều rộng ≈ r, nên diện tích hình tròn S = πr·r = πr². */
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

  function ease(t) { return t * t * (3 - 2 * t); }
  GeoWidget.register('ch07_cat_hinh_tron', function (ui, el) {
    var st = { n: 8, r: 2, t: 0, playing: false, dir: 1, t0: 0, from: 0 };
    var sN = ui.slider({ label: 'Số hình quạt n (số chẵn)', min: 4, max: 60, step: 2, value: st.n, decimals: 0, onInput: function (v) { st.n = Math.max(4, 2 * Math.round(v / 2)); sN && sN.set(st.n); upd(); } });
    var sR = ui.slider({ label: 'Bán kính r', min: 1, max: 2.5, step: 0.1, value: st.r, decimals: 2, onInput: function (v) { st.r = v; upd(); } });
    var sT = ui.slider({ label: 'Tiến độ xếp hình', min: 0, max: 1, step: 0.01, value: st.t, scale: 100, decimals: 0, unit: '%', onInput: function (v) { st.playing = false; st.t = v; upd(); } });
    var row = ui.row();
    ui.button(row, '▶ Xếp lại', function () { st.from = st.t; st.dir = 1; st.playing = true; st.t0 = performance.now(); });
    ui.button(row, '◀ Ghép về hình tròn', function () { st.from = st.t; st.dir = -1; st.playing = true; st.t0 = performance.now(); }, 'btn secondary');
    ui.button(row, '↺ Đặt lại', function () { st.playing = false; st.n = 8; st.r = 2; st.t = 0; sN.set(8); sR.set(2); sT.set(0); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['n', 'Số hình quạt n'], ['ang', 'Góc mỗi hình quạt'], ['base', 'Chiều dài hình xếp'], ['pr', 'Nửa chu vi πr'],
      ['h', 'Chiều rộng hình xếp'], ['Sx', 'Chiều dài × chiều rộng'], ['S', 'Diện tích hình tròn πr²']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6, 5.2, 6, -4.6], ratio: 0.85, maxH: 560, aria: 'Hình tròn được cắt thành các hình quạt và xếp thành hình gần chữ nhật', hint: 'Bấm “Xếp lại” hoặc kéo thanh tiến độ · Cuộn để phóng to' });
    var CY = 2.45, TOP = -0.55;
    function geo() {
      var n = st.n, r = st.r, dl = 2 * Math.PI / n, c = 2 * r * Math.sin(dl / 2), h = r * Math.cos(dl / 2);
      return { n: n, r: r, dl: dl, c: c, h: h, x0: -((n / 2) * c + c / 2) / 2 };
    }
    function piece(i, g) {
      var phi = (i + 0.5) * g.dl, even = i % 2 === 0, k = Math.floor(i / 2);
      var apex = even ? [g.x0 + k * g.c + g.c / 2, TOP] : [g.x0 + (k + 1) * g.c, TOP - g.h];
      var tau = even ? -Math.PI / 2 : Math.PI / 2, psi = tau - phi;
      while (psi > Math.PI) psi -= 2 * Math.PI; while (psi <= -Math.PI) psi += 2 * Math.PI;
      var e = ease(st.t), ax = e * apex[0], ay = CY + e * (apex[1] - CY), b = phi + e * psi;
      var pts = [[ax, ay]], m = Math.max(2, Math.ceil(g.dl / D2R / 3));
      for (var j = 0; j <= m; j++) { var a = b - g.dl / 2 + g.dl * j / m; pts.push([ax + g.r * Math.cos(a), ay + g.r * Math.sin(a)]); }
      pts.push([ax, ay]); return pts;
    }
    function upd() { if (B && B.board) { B.build(draw); } refresh(); }
    function refresh() {
      var g = geo();
      out('n', String(g.n)); out('ang', fm(360 / g.n, 2) + '°');
      out('base', fm(g.n / 2 * g.c, 3)); out('pr', fm(Math.PI * g.r, 3)); out('h', fm(g.h, 3)); out('Sx', fm(g.n / 2 * g.c * g.h, 3)); out('S', fm(Math.PI * g.r * g.r, 3));
    }
    function draw(board, C) {
      var g = geo();
      shape(board, function () { return st.t > 0.02 ? arcPts(0, CY, g.r, 0, 360) : []; }, { strokeColor: C.muted, strokeWidth: 1, dash: 2 });
      for (var i = 0; i < g.n; i++) (function (i) {
        var even = i % 2 === 0;
        shape(board, function () { return piece(i, g); }, { strokeColor: even ? C.blue : C.orange, fillColor: even ? C.fillBlue : C.fillOrange, strokeWidth: 1.5 });
      })(i);
      var done = function () { return st.t > 0.97; };
      var yb = TOP - g.h - 0.35;
      shape(board, function () { return done() ? [[g.x0, yb], [g.x0 + g.n / 2 * g.c, yb]] : []; }, { strokeColor: C.green, strokeWidth: 2, lastArrow: true, firstArrow: true });
      label(board, g.x0 + g.n / 4 * g.c, yb - 0.35, function () { return done() ? 'chiều dài ≈ πr (nửa chu vi)' : ''; }, { strokeColor: C.green, fontSize: 14 });
      var xr = g.x0 + g.n / 2 * g.c + g.c / 2 + 0.35;
      shape(board, function () { return done() ? [[xr, TOP], [xr, TOP - g.h]] : []; }, { strokeColor: C.purple, strokeWidth: 2, lastArrow: true, firstArrow: true });
      label(board, xr + 0.3, TOP - g.h / 2, function () { return done() ? 'r' : ''; }, { strokeColor: C.purple, fontSize: 15 });
      label(board, 0, CY + g.r + 0.35, function () { return st.t < 0.03 ? 'Hình tròn bán kính r, cắt thành ' + g.n + ' hình quạt' : ''; }, { strokeColor: C.text, fontSize: 14 });
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        var dur = 2600, p = (t - st.t0) / dur;
        st.t = clamp(st.from + st.dir * p, 0, 1);
        if ((st.dir > 0 && st.t >= 1) || (st.dir < 0 && st.t <= 0)) st.playing = false;
        sT.set(st.t); B.board.update();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
