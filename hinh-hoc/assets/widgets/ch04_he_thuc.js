/* ch04_he_thuc.js — Bài 3: Tam giác vuông ABC (vuông tại A) với đường cao AH: ba tam giác đồng dạng và các hệ thức lượng.
   A chạy trên nửa đường tròn đường kính BC. Chọn hai đại lượng đã biết, nhập số, bảng hiện các cạnh còn lại. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var KNOWN = {
    bh_hc: { name: 'Biết BH và HC', lab: ['BH', 'HC'] },
    ab_ac: { name: 'Biết AB và AC', lab: ['AB', 'AC'] },
    bc_ab: { name: 'Biết BC và AB', lab: ['BC', 'AB'] },
    ah_bh: { name: 'Biết AH và BH', lab: ['AH', 'BH'] }
  };
  /* Trạng thái gốc: a = BC, x = BH (0 < x < a) */
  function all(a, x) {
    var y = a - x, h = Math.sqrt(x * y);
    return { BC: a, BH: x, HC: y, AH: h, AB: Math.sqrt(a * x), AC: Math.sqrt(a * y) };
  }
  function fromKnown(k, p, q) {
    if (!(p > 0 && q > 0)) return null;
    if (k === 'bh_hc') return [p + q, p];
    if (k === 'ab_ac') { var a = Math.hypot(p, q); return [a, p * p / a]; }
    if (k === 'bc_ab') return q < p ? [p, q * q / p] : null;
    return [q + p * p / q, q];                    /* ah_bh: HC = AH²/BH */
  }

  GeoWidget.register('ch04_he_thuc', function (ui, el) {
    function init() { return { a: 10, x: 3.6, known: el.getAttribute('data-known') || 'bh_hc' }; }
    var st = init();
    ui.select({ label: 'Dữ kiện', value: st.known, options: Object.keys(KNOWN).map(function (k) { return [k, KNOWN[k].name]; }),
      onChange: function (v) { st.known = v; labels(); refresh(); } });
    var g = ui.group('Nhập hai số đã biết');
    var IN = [0, 1].map(function (j) {
      return ui.number({ label: 'x', value: 1, min: 0.1, max: 30, onChange: function (v) {
        var V = all(st.a, st.x), L = KNOWN[st.known].lab, p = [V[L[0]], V[L[1]]]; p[j] = v;
        var r = fromKnown(st.known, p[0], p[1]);
        if (!r || r[0] > 40 || r[1] <= 0 || r[1] >= r[0]) { IN[j].classList.add('invalid'); IN[j].title = 'Không dựng được (cạnh huyền phải dài nhất, BC ≤ 40)'; return; }
        st.a = r[0]; st.x = r[1]; B.build(draw); fit();
      } }, g);
    });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { var k = st.known; st = init(); st.known = k; B.resetView(); B.build(draw); fit(); }, 'btn secondary');
    var out = ui.readout([['bc', 'BC'], ['bh', 'BH ; HC'], ['ab', 'AB ; AC'], ['ah', 'AH'], ['h1', 'AH² = BH·HC'], ['h2', 'AB² = BC·BH'], ['h3', 'AC² = BC·HC'], ['h4', 'AB·AC = BC·AH']]);

    /* Khung nhìn vừa với cạnh huyền BC = a */
    function fit() {
      if (!B || !B.board) return;
      var w = B.board.canvasWidth || 600, h = B.board.canvasHeight || 400, m = Math.max(7.5, st.a / 2 + 1);
      var bot = 2 + 0.1 * st.a, need = st.a / 2 + 1 + bot, H = 2 * m * h / w;
      if (H < need) { H = need; m = H * w / h / 2; }
      B.board.setBoundingBox([-m, H - bot, m, -bot], false);
    }
    function labels() { var L = KNOWN[st.known].lab; IN.forEach(function (n, j) { n.parentNode.querySelector('label').textContent = L[j]; }); }
    function refresh() {
      var V = all(st.a, st.x), L = KNOWN[st.known].lab;
      IN.forEach(function (n, j) { if (document.activeElement !== n) { n.value = +V[L[j]].toFixed(2); n.classList.remove('invalid'); } });
      out('bc', f(V.BC)); out('bh', f(V.BH) + ' ; ' + f(V.HC)); out('ab', f(V.AB) + ' ; ' + f(V.AC)); out('ah', f(V.AH));
      out('h1', f(V.AH * V.AH) + ' = ' + f(V.BH * V.HC)); out('h2', f(V.AB * V.AB) + ' = ' + f(V.BC * V.BH));
      out('h3', f(V.AC * V.AC) + ' = ' + f(V.BC * V.HC)); out('h4', f(V.AB * V.AC) + ' = ' + f(V.BC * V.AH));
    }

    var B = GeoWidget.board2d(ui, { bbox: [-7.5, 7.5, 7.5, -2], axis: false, grid: true, aria: 'Tam giác ABC vuông tại A với đường cao AH' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';
    function draw(board, C) {
      var a = st.a, y0 = -0.5;
      var Bp = board.create('point', [-a / 2, y0], { name: 'B', fixed: true, size: 3, color: C.blue, label: { offset: [-16, -10] } });
      var Cp = board.create('point', [a / 2, y0], { name: 'C', fixed: true, size: 3, color: C.blue, label: { offset: [6, -10] } });
      var O = [0, y0];
      board.create('arc', [board.create('point', O, { visible: false, fixed: true }), Cp, Bp], { strokeColor: C.muted, dash: 2, strokeWidth: 1, fixed: true });
      var V0 = all(a, st.x);
      var A = board.create('point', [-a / 2 + st.x, y0 + V0.AH], { name: 'A', size: 4, color: C.orange, label: { offset: [-6, 14] } });
      A.on('drag', function () {
        var ang = Math.atan2(A.Y() - y0, A.X()); if (ang < 0) ang = A.X() > 0 ? 0.05 : Math.PI - 0.05;
        ang = Math.max(0.05, Math.min(Math.PI - 0.05, ang));
        var X = a / 2 * Math.cos(ang), Y = a / 2 * Math.sin(ang);
        A.moveTo([X, y0 + Y]); st.x = X + a / 2; refresh();
      });
      var H = board.create('point', [function () { return A.X(); }, y0], { name: 'H', size: 2, color: C.text, fixed: true, label: { offset: [-4, -14] } });
      board.create('polygon', [Bp, H, A], { fillColor: C.fillGreen, fillOpacity: 1, borders: { strokeColor: C.green, strokeWidth: 1.5 }, vertices: { visible: false } });
      board.create('polygon', [H, Cp, A], { fillColor: C.fillPurple, fillOpacity: 1, borders: { strokeColor: C.purple, strokeWidth: 1.5 }, vertices: { visible: false } });
      board.create('polygon', [Bp, Cp, A], { fillOpacity: 0, borders: { strokeColor: C.blue, strokeWidth: 2.5 }, vertices: { visible: false } });
      board.create('segment', [A, H], { strokeColor: C.orange, strokeWidth: 2, dash: 2 });
      board.create('angle', [Cp, H, A], { type: 'square', radius: 0.4, name: '', strokeColor: C.text, fillOpacity: 0 });
      board.create('angle', [Bp, A, Cp], { type: 'square', radius: 0.4, name: '', strokeColor: C.text, fillOpacity: 0, visible: function () { return true; } });
      refresh();
    }
    labels();
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return { st: st, v: all(st.a, st.x) }; };
  });
})();
