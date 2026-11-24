/* ch04_bong_nang.js — Bài 5: Đo chiều cao cây gián tiếp bằng tam giác đồng dạng.
   Cách 1 "Bóng nắng": tia nắng song song ⇒ (cọc, bóng cọc) và (cây, bóng cây) là hai tam giác vuông đồng dạng: H = S·h/s.
   Cách 2 "Gương phẳng": góc tới = góc phản xạ ⇒ H/d₁ = e/d₂: H = e·d₁/d₂. Đơn vị: mét. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var LIM = { h: [0.3, 4], s: [0.3, 5], S: [1, 12], e: [0.5, 2.2], d1: [1, 9], d2: [0.5, 3.5] };
  function clamp(k, v) { return Math.max(LIM[k][0], Math.min(LIM[k][1], v)); }

  GeoWidget.register('ch04_bong_nang', function (ui, el) {
    function init() { return { mode: el.getAttribute('data-mode') || 'bong', h: 1.5, s: 2, S: 8, e: 1.6, d1: 10, d2: 2 }; }
    var st = init();
    var gB, gG;
    ui.select({ label: 'Cách đo', value: st.mode, options: [['bong', 'Bóng nắng'], ['guong', 'Gương phẳng đặt trên mặt đất']],
      onChange: function (v) { st.mode = v; show(); B.build(draw); } });
    gB = ui.group('Số đo bóng nắng (m)');
    gG = ui.group('Số đo với gương (m)');
    var IN = {};
    [['h', 'Chiều cao cọc h', gB], ['s', 'Bóng của cọc s', gB], ['S', 'Bóng của cây S', gB],
      ['e', 'Tầm mắt người e', gG], ['d1', 'Gốc cây → gương d₁', gG], ['d2', 'Người → gương d₂', gG]].forEach(function (r) {
      IN[r[0]] = ui.number({ label: r[1], value: st[r[0]], min: LIM[r[0]][0], max: LIM[r[0]][1], onChange: function (v) { st[r[0]] = v; B.build(draw); } }, r[2]);
    });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { var m = st.mode; st = init(); st.mode = m; B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['r', 'Tỉ số'], ['g', 'Góc'], ['H', 'Chiều cao cây H'], ['ct', 'Cách tính']]);
    function show() { gB.style.display = st.mode === 'bong' ? '' : 'none'; gG.style.display = st.mode === 'guong' ? '' : 'none'; }
    function H() { return st.mode === 'bong' ? st.S * st.h / st.s : st.e * st.d1 / st.d2; }
    function refresh() {
      Object.keys(IN).forEach(function (k) { if (document.activeElement !== IN[k]) IN[k].value = +st[k].toFixed(2); });
      if (st.mode === 'bong') {
        out('r', 'h : s = ' + f(st.h) + ' : ' + f(st.s) + ' = ' + f(st.h / st.s, 3));
        out('g', 'Góc nắng ≈ ' + f(Math.atan(st.h / st.s) * 180 / Math.PI, 1) + '°');
        out('H', f(H()) + ' m');
        out('ct', 'H = S·h : s = ' + f(st.S) + '·' + f(st.h) + ' : ' + f(st.s));
      } else {
        out('r', 'e : d₂ = ' + f(st.e) + ' : ' + f(st.d2) + ' = ' + f(st.e / st.d2, 3));
        out('g', 'Góc tới = góc phản xạ ≈ ' + f(Math.atan(st.e / st.d2) * 180 / Math.PI, 1) + '°');
        out('H', f(H()) + ' m');
        out('ct', 'H = e·d₁ : d₂ = ' + f(st.e) + '·' + f(st.d1) + ' : ' + f(st.d2));
      }
    }

    var B = GeoWidget.board2d(ui, { bbox: [-8, 11, 14, -2.5], ratio: 0.6, axis: false, grid: true, aria: 'Đo chiều cao cây bằng bóng nắng hoặc bằng gương' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';
    function hid(board, x, y) { return board.create('point', [x, y], { visible: false, fixed: true, withLabel: false }); }
    function tree(board, C, x, Hf) {
      board.create('segment', [hid(board, x, 0), hid(board, x, function () { return Hf(); })], { strokeColor: C.yellow, strokeWidth: 6, fixed: true, highlight: false });
      board.create('circle', [hid(board, x, function () { return Hf() * 0.78; }), function () { return Hf() * 0.22; }],
        { strokeColor: C.green, fillColor: C.fillGreen, fillOpacity: 1, fixed: true, highlight: false });
      return board.create('point', [x, function () { return Hf(); }], { name: 'Ngọn', size: 3, color: C.green, fixed: true, label: { offset: [-46, 4] } });
    }
    function draw(board, C) {
      var O0 = hid(board, 0, 0), O1 = hid(board, 1, 0);
      board.create('line', [O0, O1], { strokeColor: C.muted, strokeWidth: 2, fixed: true, highlight: false });
      var top = tree(board, C, 0, H);
      if (st.mode === 'bong') {
        var px = -6.5, Pb = hid(board, px, 0), Pb1 = hid(board, px + 1, 0);
        var Pt = board.create('point', [px, st.h], { name: 'Đầu cọc', size: 4, color: C.blue, label: { offset: [-30, 14] } });
        var Ps = board.create('point', [px + st.s, 0], { name: 's', size: 4, color: C.blue, label: { offset: [0, -16] } });
        var Ts = board.create('point', [st.S, 0], { name: 'S', size: 4, color: C.orange, label: { offset: [0, -16] } });
        Pt.on('drag', function () { st.h = clamp('h', Pt.Y()); Pt.moveTo([px, st.h]); refresh(); board.update(); });
        Ps.on('drag', function () { st.s = clamp('s', Ps.X() - px); Ps.moveTo([px + st.s, 0]); refresh(); board.update(); });
        Ts.on('drag', function () { st.S = clamp('S', Ts.X()); Ts.moveTo([st.S, 0]); refresh(); board.update(); });
        board.create('segment', [Pb, Pt], { strokeColor: C.blue, strokeWidth: 4 });
        board.create('polygon', [Pb, Pt, Ps], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 1.5 }, vertices: { visible: false }, fixed: true });
        board.create('polygon', [O0, top, Ts], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 1.5 }, vertices: { visible: false }, fixed: true });
        /* tia nắng kéo dài lên trên */
        [[Pt, Ps], [top, Ts]].forEach(function (pq) {
          board.create('line', pq, { straightFirst: true, straightLast: false, strokeColor: C.yellow, dash: 2, strokeWidth: 1.5, fixed: true, highlight: false });
        });
        board.create('angle', [Pb1, Pb, Pt], { type: 'square', radius: 0.4, name: '', strokeColor: C.text, fillOpacity: 0, fixed: true });
        board.create('angle', [O1, O0, top], { type: 'square', radius: 0.4, name: '', strokeColor: C.text, fillOpacity: 0, fixed: true });
        board.create('text', [-7.2, 10.2, '☀ Tia nắng song song'], { fontSize: 14, strokeColor: C.yellow, fixed: true });
      } else {
        var Mx = function () { return st.d1; };
        var M = board.create('point', [Mx, 0], { name: 'Gương', size: 3, color: C.purple, fixed: true, label: { offset: [-20, -16] } });
        var Gm = board.create('point', [st.d1, 0], { name: '', size: 6, color: C.purple, face: '[]' });
        Gm.on('drag', function () { st.d1 = clamp('d1', Gm.X()); Gm.moveTo([st.d1, 0]); Ey.moveTo([st.d1 + st.d2, st.e]); refresh(); board.update(); });
        var Ey = board.create('point', [st.d1 + st.d2, st.e], { name: 'Mắt', size: 4, color: C.blue, label: { offset: [8, 6] } });
        Ey.on('drag', function () { st.e = clamp('e', Ey.Y()); st.d2 = clamp('d2', Ey.X() - st.d1); Ey.moveTo([st.d1 + st.d2, st.e]); refresh(); board.update(); });
        var Ef = hid(board, function () { return st.d1 + st.d2; }, 0);
        board.create('segment', [Ef, Ey], { strokeColor: C.blue, strokeWidth: 4 });
        board.create('polygon', [O0, top, M], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 1.5 }, vertices: { visible: false }, fixed: true });
        board.create('polygon', [M, Ey, Ef], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 1.5 }, vertices: { visible: false }, fixed: true });
        board.create('arrow', [top, M], { strokeColor: C.yellow, strokeWidth: 2, fixed: true });
        board.create('arrow', [M, Ey], { strokeColor: C.yellow, strokeWidth: 2, fixed: true });
        board.create('angle', [O1, O0, top], { type: 'square', radius: 0.4, name: '', strokeColor: C.text, fillOpacity: 0, fixed: true });
      }
      refresh();
    }
    show();
    if (B) B.build(draw);
    el.__debug = function () { return { st: st, H: H() }; };
  });
})();
