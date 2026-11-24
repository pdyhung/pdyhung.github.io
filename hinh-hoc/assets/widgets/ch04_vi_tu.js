/* ch04_vi_tu.js — Bài 1: Hai hình đồng dạng = phép vị tự tỉ số k rồi một phép dời hình (ở đây: phép quay quanh O).
   Kéo O, A, B, C; nhập k và góc quay φ. Bảng số đo: tỉ số các cạnh, tỉ số chu vi (= k), tỉ số diện tích (= k²). */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  function area(a, b, c) { return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2; }

  GeoWidget.register('ch04_vi_tu', function (ui, el) {
    var D0 = { O: [-6, -5], A: [-4, -4], B: [-1, -4], C: [-3, -1], k: +(el.getAttribute('data-k') || 2), neg: false, phi: 0, mid: true };
    var st = JSON.parse(JSON.stringify(D0));

    var sK = ui.slider({ label: 'Tỉ số đồng dạng k', min: 0.25, max: 3, step: 0.05, value: st.k, decimals: 2, onInput: function (v) { st.k = v; upd(); } });
    var sPhi = ui.slider({ label: 'Góc quay φ (phép dời hình)', min: -180, max: 180, step: 1, value: st.phi, decimals: 0, unit: '°', onInput: function (v) { st.phi = v; upd(); } });
    var g = ui.group('Tâm vị tự O (nhập tọa độ)');
    var inOx = ui.number({ label: 'Hoành độ của O', value: st.O[0], min: -20, max: 20, onChange: function (x) { st.O[0] = x; B.build(draw); } }, g);
    var inOy = ui.number({ label: 'Tung độ của O', value: st.O[1], min: -20, max: 20, onChange: function (y) { st.O[1] = y; B.build(draw); } }, g);
    var row = ui.row();
    ui.checkbox('Vị tự tỉ số âm (−k)', false, function (v) { st.neg = v; upd(); }, row);
    ui.checkbox('Hiện ảnh vị tự A₁B₁C₁', true, function (v) { st.mid = v; upd(); }, row);
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () {
      st = JSON.parse(JSON.stringify(D0)); sK.set(st.k); sPhi.set(0); inOx.value = st.O[0]; inOy.value = st.O[1];
      [].forEach.call(ui.side.querySelectorAll('input[type=checkbox]'), function (c, i) { c.checked = i === 1; });
      B.resetView(); B.build(draw);
    }, 'btn secondary');
    var out = ui.readout([['k', 'Phép vị tự'], ['ab', 'AB → A′B′'], ['bc', 'BC → B′C′'], ['ca', 'CA → C′A′'],
      ['p', 'Chu vi'], ['pr', 'Tỉ số chu vi'], ['s', 'Diện tích'], ['sr', 'Tỉ số diện tích']]);

    var B = GeoWidget.board2d(ui, { bbox: [-10, 6.8, 9, -7], axis: false, grid: true, aria: 'Tam giác ABC, ảnh qua phép vị tự tâm O và ảnh sau khi quay thêm quanh O' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';

    function sgnk() { return st.neg ? -st.k : st.k; }
    function hom(p) { var k = sgnk(); return [st.O[0] + k * (p[0] - st.O[0]), st.O[1] + k * (p[1] - st.O[1])]; }
    function rot(p) {
      var a = st.phi * Math.PI / 180, x = p[0] - st.O[0], y = p[1] - st.O[1];
      return [st.O[0] + x * Math.cos(a) - y * Math.sin(a), st.O[1] + x * Math.sin(a) + y * Math.cos(a)];
    }
    function img(p) { return rot(hom(p)); }

    function refresh() {
      var I = { A: img(st.A), B: img(st.B), C: img(st.C) };
      out('k', 'tâm O, tỉ số ' + f(sgnk()) + (st.phi ? '; quay ' + f(st.phi, 0) + '°' : ''));
      [['ab', 'A', 'B'], ['bc', 'B', 'C'], ['ca', 'C', 'A']].forEach(function (r) {
        var d1 = dist(st[r[1]], st[r[2]]), d2 = dist(I[r[1]], I[r[2]]);
        out(r[0], f(d1) + ' → ' + f(d2) + '  (×' + f(d2 / d1) + ')');
      });
      var p1 = dist(st.A, st.B) + dist(st.B, st.C) + dist(st.C, st.A), p2 = dist(I.A, I.B) + dist(I.B, I.C) + dist(I.C, I.A);
      var s1 = area(st.A, st.B, st.C), s2 = area(I.A, I.B, I.C);
      out('p', f(p1) + ' → ' + f(p2)); out('pr', f(p2 / p1) + ' = k');
      out('s', f(s1) + ' → ' + f(s2)); out('sr', (s1 > 1e-9 ? f(s2 / s1) : '—') + ' = k² = ' + f(st.k * st.k));
    }
    function upd() { refresh(); if (B && B.board) B.board.update(); }

    function draw(board, C) {
      var O = board.create('point', st.O, { name: 'O', size: 4, color: C.purple, label: { offset: [-16, -12] } });
      O.on('drag', function () { st.O = [O.X(), O.Y()]; inOx.value = +O.X().toFixed(2); inOy.value = +O.Y().toFixed(2); refresh(); });
      var P = {};
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var showMid = function () { return st.mid && Math.abs(st.phi) > 0.01; };
      var H = {}, Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        H[k] = board.create('point', [function () { return hom(st[k])[0]; }, function () { return hom(st[k])[1]; }],
          { name: k + '₁', size: 2, color: C.green, fixed: true, visible: showMid, label: { visible: showMid } });
        Q[k] = board.create('point', [function () { return img(st[k])[0]; }, function () { return img(st[k])[1]; }],
          { name: k + '′', size: 3, color: C.orange, fixed: true });
        board.create('line', [O, H[k]], { straightFirst: false, straightLast: false, strokeColor: C.muted, dash: 2, strokeWidth: 1, fixed: true,
          visible: function () { return st.mid || Math.abs(st.phi) < 0.01; } });
        board.create('line', [O, P[k]], { straightFirst: false, straightLast: false, strokeColor: C.muted, dash: 1, strokeWidth: 1, fixed: true });
      });
      board.create('polygon', [H.A, H.B, H.C], { fillColor: C.fillGreen, fillOpacity: 1, borders: { strokeColor: C.green, dash: 2, strokeWidth: 1.5, visible: showMid }, vertices: { visible: false }, visible: showMid });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
