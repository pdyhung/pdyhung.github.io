/* ch04_thales.js — Bài 3: Đường thẳng song song với một cạnh của tam giác (định lý Thales) tạo tam giác đồng dạng.
   Kéo A, B, C và điểm M trên AB; đường thẳng qua M song song BC cắt AC tại N. Ô số: tỉ số AM/AB và ba cạnh. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  function lerp(p, q, t) { return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]; }

  GeoWidget.register('ch04_thales', function (ui, el) {
    function init() { return { A: [-2, 5], B: [-5, -2], C: [5, -2], t: 0.4 }; }
    var st = init();
    var sT = ui.slider({ label: 'Tỉ số AM : AB', min: 0.05, max: 0.95, step: 0.01, value: st.t, decimals: 2, onInput: function (v) { st.t = v; if (M) M.moveTo(lerp(st.A, st.B, v)); upd(); } });
    var g = ui.group('Ba cạnh của ΔABC (nhập số)');
    var IN = {};
    [['c', 'AB'], ['b', 'AC'], ['a', 'BC']].forEach(function (r) {
      IN[r[0]] = ui.number({ label: r[1], value: 1, min: 0.5, max: 14, onChange: function (v) {
        var s = sides(); s[r[0]] = v;
        if (s.a >= s.b + s.c || s.b >= s.a + s.c || s.c >= s.a + s.b) { IN[r[0]].classList.add('invalid'); IN[r[0]].title = 'Không thỏa bất đẳng thức tam giác'; return; }
        var x = (s.c * s.c + s.a * s.a - s.b * s.b) / (2 * s.a), y = Math.sqrt(Math.max(0, s.c * s.c - x * x));
        st.B = [-s.a / 2, -2]; st.C = [s.a / 2, -2]; st.A = [-s.a / 2 + x, -2 + y];
        B.build(draw); refresh();
      } }, g);
    });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { st = init(); sT.set(st.t); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['am', 'AM : AB'], ['an', 'AN : AC'], ['mn', 'MN : BC'], ['mb', 'AM : MB'], ['nc', 'AN : NC'], ['kl', 'Kết luận']]);

    function sides() { return { a: dist(st.B, st.C), b: dist(st.A, st.C), c: dist(st.A, st.B) }; }
    function refresh() {
      var s = sides(), t = st.t, M = lerp(st.A, st.B, t), N = lerp(st.A, st.C, t);
      ['a', 'b', 'c'].forEach(function (k) { if (document.activeElement !== IN[k]) { IN[k].value = +s[k].toFixed(2); IN[k].classList.remove('invalid'); } });
      var am = dist(st.A, M), an = dist(st.A, N), mn = dist(M, N);
      out('am', f(am) + ' : ' + f(s.c) + ' = ' + f(am / s.c, 3));
      out('an', f(an) + ' : ' + f(s.b) + ' = ' + f(an / s.b, 3));
      out('mn', f(mn) + ' : ' + f(s.a) + ' = ' + f(mn / s.a, 3));
      out('mb', f(am) + ' : ' + f(s.c - am) + ' = ' + f(am / (s.c - am), 3));
      out('nc', f(an) + ' : ' + f(s.b - an) + ' = ' + f(an / (s.b - an), 3));
      out('kl', 'MN ∥ BC ⇒ ΔAMN ∽ ΔABC, k = ' + f(t));
    }
    function upd() { refresh(); if (B && B.board) B.board.update(); }

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -4], axis: false, grid: true, aria: 'Tam giác ABC với đường thẳng MN song song BC' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';
    var M = null;
    function draw(board, C) {
      var P = {};
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue, label: k === 'A' ? { offset: [-6, 14] } : { offset: k === 'B' ? [-16, -12] : [8, -12] } });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; if (M && k !== 'C') M.moveTo(lerp(st.A, st.B, st.t)); refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var AB = board.create('segment', [P.A, P.B], { visible: false });
      var mp = lerp(st.A, st.B, st.t);
      M = board.create('glider', [mp[0], mp[1], AB], { name: 'M', size: 4, color: C.orange, label: { offset: [-20, 4] } });
      M.on('drag', function () {
        var t = dist([M.X(), M.Y()], st.A) / dist(st.A, st.B); t = Math.max(0.05, Math.min(0.95, t));
        st.t = t; sT.set(t); refresh();
      });
      var N = board.create('point', [function () { return P.A.X() + (P.C.X() - P.A.X()) * st.t; },
        function () { return P.A.Y() + (P.C.Y() - P.A.Y()) * st.t; }], { name: 'N', size: 3, color: C.orange, fixed: true, label: { offset: [8, 4] } });
      board.create('polygon', [P.A, M, N], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2.5 }, vertices: { visible: false } });
      board.create('line', [M, N], { strokeColor: C.orange, dash: 2, strokeWidth: 1, fixed: true });
      refresh();
    }
    if (B) B.build(draw);
    el.__debug = function () { return st; };
  });
})();
