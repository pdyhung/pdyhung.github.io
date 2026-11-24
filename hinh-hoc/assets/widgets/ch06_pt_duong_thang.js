/* ch06_pt_duong_thang.js — Viết phương trình đường thẳng song song, vuông góc với d: y = ax + b đi qua điểm M (Chương 6, Bài 5). */
(function () {
  'use strict';
  GeoWidget.register('ch06_pt_duong_thang', function (ui, el) {
    var ch = GeoWidget.ch06, f = ch.f;
    var init = { a: 2, b: -1, M: [-2, 3] };
    var st = { a: init.a, b: init.b, M: init.M.slice(), snap: true, par: true, perp: true, foot: true };

    var g = ui.group('Đường thẳng d: y = ax + b');
    g.style.gridTemplateColumns = 'minmax(0,1fr) minmax(0,1fr)'; g.style.columnGap = '12px';
    var inA = ui.number({ label: 'a', value: st.a, min: -50, max: 50, onChange: function (v) { st.a = v; moveHandles(); refresh(); } }, g);
    var inB = ui.number({ label: 'b', value: st.b, min: -50, max: 50, onChange: function (v) { st.b = v; moveHandles(); refresh(); } }, g);
    var co = ch.coords(ui, 'Điểm M', ['M'], st, function () { H.M && H.M.moveTo(st.M); refresh(); });
    var row = ui.row();
    ui.checkbox('Bắt vào lưới', true, function (v) { st.snap = v; }, row);
    ui.checkbox('d₁ ∥ d', true, function (v) { st.par = v; refresh(); }, row);
    ui.checkbox('d₂ ⊥ d', true, function (v) { st.perp = v; refresh(); }, row);
    ui.checkbox('Chân đường vuông góc H', true, function (v) { st.foot = v; refresh(); }, row);
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () { st.a = init.a; st.b = init.b; st.M = init.M.slice(); syncAB(); co.sync(); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['d', 'd'], ['M', 'M(x₀; y₀)'], ['d1', 'd₁ ∥ d, qua M'], ['d1w', 'b₁ = y₀ − a·x₀'], ['d2', 'd₂ ⊥ d, qua M'], ['d2w', 'a₂ = −1/a; b₂ = y₀ − a₂·x₀'], ['H', 'H = d ∩ d₂'], ['MH', 'Khoảng cách MH = |a·x₀ − y₀ + b|/√(a² + 1)']]);
    ch.wide(ui, [5, 7]);

    var B = GeoWidget.board2d(ui, { ratio: 0.92, maxH: 560, bbox: [-8, 8, 8, -8], axis: true, grid: true, aria: 'Đường thẳng d, điểm M, đường song song và đường vuông góc qua M' });
    var H = {};
    function syncAB() { inA.value = ch.r2(st.a); inB.value = ch.r2(st.b); inA.classList.remove('invalid'); inB.classList.remove('invalid'); }
    function moveHandles() { if (H.K0) { H.K0.moveTo([0, st.b]); H.K1.moveTo([2, 2 * st.a + st.b]); } }
    function foot() { var a = st.a, x0 = st.M[0], y0 = st.M[1], x = (x0 + a * (y0 - st.b)) / (1 + a * a); return [x, a * x + st.b]; }

    function refresh() {
      var a = st.a, b = st.b, x0 = st.M[0], y0 = st.M[1];
      out('d', ch.eq(a, b));
      out('M', ch.pt(st.M));
      var b1 = y0 - a * x0;
      out('d1', ch.eq(a, b1));
      out('d1w', f(y0) + ' − ' + ch.par(a, true) + '·' + ch.par(x0) + ' = ' + ch.frac(b1));
      if (Math.abs(a) < 1e-12) { out('d2', 'x = ' + ch.frac(x0)); out('d2w', 'd nằm ngang nên d₂ thẳng đứng: x = x₀'); }
      else {
        var a2 = -1 / a, b2 = y0 - a2 * x0;
        out('d2', ch.eq(a2, b2));
        var s1 = '−1/' + ch.par(a, true);
        out('d2w', 'a₂ = ' + (s1 === ch.frac(a2) ? s1 : s1 + ' = ' + ch.frac(a2)) + ';  b₂ = ' + f(y0) + ' − ' + ch.par(a2, true) + '·' + ch.par(x0) + ' = ' + ch.frac(b2));
      }
      var h = foot();
      out('H', ch.pt(h));
      var dd = Math.abs(a * x0 - y0 + b) / Math.sqrt(a * a + 1);
      out('MH', dd < 1e-9 ? '0 (M nằm trên d)' : f(Math.abs(a * x0 - y0 + b)) + '/√' + f(a * a + 1) + ' ≈ ' + f(dd));
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var snap = function () { return st.snap; };
      // hai tay cầm trên d: K0 = (0; b) chỉ trượt trên Oy, K1 = (2; 2a + b) chỉ trượt trên đường x = 2
      H.K0 = board.create('point', [0, st.b], { name: '', size: 3.5, color: C.purple, strokeColor: C.purple, fillColor: C.purple, withLabel: false });
      H.K1 = board.create('point', [2, 2 * st.a + st.b], { name: '', size: 3.5, color: C.purple, strokeColor: C.purple, fillColor: C.purple, withLabel: false });
      H.K0.on('drag', function () { var y = H.K0.Y(); if (st.snap) y = Math.round(y); H.K0.moveTo([0, y]); var y1 = 2 * st.a + st.b; st.b = y; st.a = (y1 - y) / 2; H.K1.moveTo([2, y1]); syncAB(); refresh(); });
      H.K1.on('drag', function () { var y = H.K1.Y(); if (st.snap) y = Math.round(y); H.K1.moveTo([2, y]); st.a = (y - st.b) / 2; syncAB(); refresh(); });
      H.M = ch.point(board, 'M', st.M, C.red, snap, function (p) { st.M = p; co.sync('M'); refresh(); });
      board.create('line', [H.K0, H.K1], { strokeColor: C.blue, strokeWidth: 3, fixed: true, highlight: false, name: 'd', withLabel: true, label: { strokeColor: C.blue, position: 'rt', offset: [-14, 14] } });
      var Mx = function () { return H.M.X(); }, My = function () { return H.M.Y(); };
      var M1 = ch.fpt(board, function () { return H.M.X() + 1; }, function () { return H.M.Y() + st.a; });
      board.create('line', [H.M, M1], { strokeColor: C.green, strokeWidth: 2.5, fixed: true, highlight: false, name: 'd₁', withLabel: true, label: { strokeColor: C.green, position: 'rt', offset: [-18, 14] }, visible: function () { return st.par; } });
      var M2 = ch.fpt(board, function () { return H.M.X() - st.a; }, function () { return H.M.Y() + 1; });
      board.create('line', [H.M, M2], { strokeColor: C.orange, strokeWidth: 2.5, fixed: true, highlight: false, name: 'd₂', withLabel: true, label: { strokeColor: C.orange, position: 'rt', offset: [-18, 14] }, visible: function () { return st.perp; } });
      var Hf = function (j) { return function () { return foot()[j]; }; };
      var Hp = board.create('point', [Hf(0), Hf(1)], { name: 'H', fixed: true, size: 3.5, color: C.orange, strokeColor: C.orange, fillColor: C.orange, label: { offset: [8, -12] }, visible: function () { return st.foot; } });
      board.create('segment', [H.M, Hp], { strokeColor: C.red, strokeWidth: 2, dash: 2, fixed: true, highlight: false, visible: function () { return st.foot; } });
      // dấu góc vuông tại H
      var s = 0.35, L = function () { return Math.sqrt(1 + st.a * st.a); };
      var u = function (j) { return j ? st.a / L() : 1 / L(); };           // hướng của d
      var v = function (j) { var h = foot(), dx = st.M[0] - h[0], dy = st.M[1] - h[1], l = Math.hypot(dx, dy) || 1; return j ? dy / l : dx / l; }; // hướng H→M
      var c1 = ch.fpt(board, function () { return foot()[0] + s * u(0); }, function () { return foot()[1] + s * u(1); });
      var c2 = ch.fpt(board, function () { return foot()[0] + s * (u(0) + v(0)); }, function () { return foot()[1] + s * (u(1) + v(1)); });
      var c3 = ch.fpt(board, function () { return foot()[0] + s * v(0); }, function () { return foot()[1] + s * v(1); });
      board.create('polygon', [Hp, c1, c2, c3], { fillOpacity: 0, highlight: false, vertices: { visible: false }, borders: { strokeColor: C.muted, strokeWidth: 1.2, highlight: false },
        visible: function () { return st.foot && ch.dist(st.M, foot()) > 0.6; } });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
