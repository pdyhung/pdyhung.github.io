/* ch04_ti_le_vang.js — Bài 5: Hình chữ nhật vàng. Cắt đi một hình vuông, phần còn lại đồng dạng với hình ban đầu
   khi và chỉ khi tỉ số dài : rộng = φ = (1 + √5)/2. Lặp lại việc cắt, nối các cung phần tư thành đường xoắn ốc vàng. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var PHI = (1 + Math.sqrt(5)) / 2;

  /* Cắt lần lượt các hình vuông theo thứ tự trái, trên, phải, dưới. Trả về danh sách hình vuông và cung. */
  function cut(w, h, n) {
    var x = 0, y = 0, res = [];
    for (var i = 0; i < n; i++) {
      var d = i % 4, s;
      if (w < 1e-3 || h < 1e-3) break;
      if ((d === 0 || d === 2) && w < h - 1e-9) break;
      if ((d === 1 || d === 3) && h < w - 1e-9) break;
      if (d === 0) { s = h; res.push({ sq: [x, y, s], c: [x + s, y], p0: [x, y], p1: [x + s, y + s] }); x += s; w -= s; }
      else if (d === 1) { s = w; res.push({ sq: [x, y + h - s, s], c: [x, y + h - s], p0: [x, y + h], p1: [x + s, y + h - s] }); h -= s; }
      else if (d === 2) { s = h; res.push({ sq: [x + w - s, y, s], c: [x + w - s, y + h], p0: [x + w, y + h], p1: [x + w - s, y] }); w -= s; }
      else { s = w; res.push({ sq: [x, y, s], c: [x + s, y + s], p0: [x + s, y], p1: [x, y + s] }); y += s; h -= s; }
    }
    return { list: res, rest: [x, y, w, h] };
  }

  GeoWidget.register('ch04_ti_le_vang', function (ui, el) {
    function init() { return { a: 9, r: PHI, n: 6 }; }
    var st = init();
    var sR = ui.slider({ label: 'Tỉ số dài : rộng (r)', min: 1.1, max: 2.5, step: 0.001, value: st.r, decimals: 3, onInput: function (v) { st.r = v; B.build(draw); } });
    var sN = ui.slider({ label: 'Số hình vuông cắt đi', min: 0, max: 10, step: 1, value: st.n, decimals: 0, onInput: function (v) { st.n = Math.round(v); B.build(draw); } });
    var g = ui.group('Kích thước (nhập số)');
    var inA = ui.number({ label: 'Chiều dài a', value: st.a, min: 1, max: 10, onChange: function (v) { st.a = v; B.build(draw); } }, g);
    var row = ui.row();
    ui.button(row, 'r = φ', function () { st.r = PHI; sR.set(PHI); B.build(draw); });
    ui.button(row, 'Khổ A4 (r = √2)', function () { st.r = Math.SQRT2; sR.set(st.r); B.build(draw); }, 'btn secondary');
    ui.button(row, '↺ Đặt lại', function () { st = init(); sR.set(st.r); sN.set(st.n); inA.value = st.a; B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['ab', 'Dài × rộng'], ['r', 'Tỉ số a : b'], ['rest', 'Phần còn lại'], ['r1', 'Tỉ số phần còn lại'], ['kl', 'Đồng dạng?'], ['phi', 'φ = (1 + √5) : 2']]);

    function refresh() {
      var a = st.a, b = a / st.r, w2 = a - b;
      if (document.activeElement !== inA) inA.value = +a.toFixed(2);
      out('ab', f(a) + ' × ' + f(b));
      out('r', f(st.r, 3));
      out('rest', f(b) + ' × ' + f(w2));
      var r1 = Math.max(b, w2) / Math.min(b, w2);
      out('r1', f(r1, 3));
      out('kl', Math.abs(r1 - st.r) < 0.002 ? 'Có (r = φ): hình chữ nhật vàng' : 'Không (' + f(r1, 3) + ' ≠ ' + f(st.r, 3) + ')');
      out('phi', f(PHI, 4));
    }

    var B = GeoWidget.board2d(ui, { bbox: [-0.9, 7.6, 10.8, -1.4], axis: false, grid: false, aria: 'Hình chữ nhật vàng và đường xoắn ốc' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';
    function draw(board, C) {
      var a = st.a, b = a / st.r;
      board.create('polygon', [[0, 0], [a, 0], [a, b], [0, b]], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2.5, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
      var K = cut(a, b, st.n), cols = [C.fillOrange, C.fillGreen, C.fillPurple, C.fillBlue];
      K.list.forEach(function (q, i) {
        var x = q.sq[0], y = q.sq[1], s = q.sq[2];
        board.create('polygon', [[x, y], [x + s, y], [x + s, y + s], [x, y + s]], { fillColor: cols[i % 4], fillOpacity: 1, borders: { strokeColor: C.muted, strokeWidth: 1, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
        var a0 = Math.atan2(q.p0[1] - q.c[1], q.p0[0] - q.c[0]), a1 = Math.atan2(q.p1[1] - q.c[1], q.p1[0] - q.c[0]), da = a1 - a0;
        while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        var xs = [], ys = [];
        for (var j = 0; j <= 24; j++) { var t = a0 + da * j / 24; xs.push(q.c[0] + s * Math.cos(t)); ys.push(q.c[1] + s * Math.sin(t)); }
        board.create('curve', [xs, ys], { strokeColor: C.orange, strokeWidth: 2.5, fixed: true, highlight: false });
        if (s > 0.6) board.create('text', [x + s / 2, y + s / 2, f(s)], { anchorX: 'middle', anchorY: 'middle', fontSize: Math.max(10, Math.min(15, s * 4)), strokeColor: C.muted, fixed: true });
      });
      var Hd = board.create('point', [a, b], { name: '', size: 5, color: C.blue });
      Hd.on('drag', function () {
        var na = Math.max(1, Math.min(10, Hd.X())), nb = Math.max(0.4, Hd.Y()), nr = Math.max(1.1, Math.min(2.5, na / nb));
        st.a = na; st.r = nr; sR.set(nr); refresh();
      });
      Hd.on('up', function () { B.build(draw); });
      var c0 = board.create('point', [0, 0], { visible: false, fixed: true });
      var cx = board.create('point', [function () { return Hd.X(); }, 0], { visible: false, fixed: true });
      var cy = board.create('point', [0, function () { return Hd.Y(); }], { visible: false, fixed: true });
      board.create('polygon', [c0, cx, Hd, cy], { fillOpacity: 0, borders: { strokeColor: C.blue, dash: 2, strokeWidth: 1, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
      board.create('text', [a / 2, -0.4, 'a'], { anchorX: 'middle', fixed: true, strokeColor: C.blue });
      board.create('text', [-0.4, b / 2, 'b'], { anchorY: 'middle', fixed: true, strokeColor: C.blue });
      refresh();
    }
    if (B) B.build(draw);
    el.__debug = function () { return { st: st, b: st.a / st.r }; };
  });
})();
