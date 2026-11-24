/* ch04_phan_giac.js — Bài 4: Đường phân giác AD của tam giác chia cạnh đối diện theo tỉ số DB/DC = AB/AC.
   Kéo A, B, C hoặc nhập AB, AC, góc A. Tùy chọn: phân giác ngoài cắt đường thẳng BC tại E (khi AB ≠ AC). */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  function angAt(P, Q, R) { /* góc tại Q */
    var u = [P[0] - Q[0], P[1] - Q[1]], v = [R[0] - Q[0], R[1] - Q[1]];
    return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))))) / RAD;
  }
  function Dpt(st) { var c = dist(st.A, st.B), b = dist(st.A, st.C); return [(b * st.B[0] + c * st.C[0]) / (b + c), (b * st.B[1] + c * st.C[1]) / (b + c)]; }
  function Ept(st) { var c = dist(st.A, st.B), b = dist(st.A, st.C); if (Math.abs(b - c) < 1e-6) return null; return [(b * st.B[0] - c * st.C[0]) / (b - c), (b * st.B[1] - c * st.C[1]) / (b - c)]; }

  GeoWidget.register('ch04_phan_giac', function (ui, el) {
    function init() { return { A: [-1.5, 4], B: [-4, -2], C: [5, -2], ext: false }; }
    var st = init();
    var g = ui.group('Tam giác ABC (nhập số)');
    var IN = {};
    [['c', 'AB', 0.5, 14], ['b', 'AC', 0.5, 14], ['A', 'Góc A (°)', 1, 179]].forEach(function (r) {
      IN[r[0]] = ui.number({ label: r[1], value: 1, min: r[2], max: r[3], onChange: function (v) {
        var p = { c: dist(st.A, st.B), b: dist(st.A, st.C), A: angAt(st.B, st.A, st.C) }; p[r[0]] = v;
        /* giữ A và hướng AB, dựng lại B, C (giữ chiều quay hiện tại) */
        var u = Math.atan2(st.B[1] - st.A[1], st.B[0] - st.A[0]);
        var cr = (st.B[0] - st.A[0]) * (st.C[1] - st.A[1]) - (st.B[1] - st.A[1]) * (st.C[0] - st.A[0]);
        var w = u + (cr >= 0 ? 1 : -1) * p.A * RAD;
        st.B = [st.A[0] + p.c * Math.cos(u), st.A[1] + p.c * Math.sin(u)];
        st.C = [st.A[0] + p.b * Math.cos(w), st.A[1] + p.b * Math.sin(w)];
        B.build(draw);
      } }, g);
    });
    var row = ui.row();
    ui.checkbox('Phân giác ngoài (điểm E)', false, function (v) { st.ext = v; upd(); }, row);
    var row2 = ui.row();
    ui.button(row2, '⚖ AB = AC', function () {
      var c = dist(st.A, st.B), b = dist(st.A, st.C); st.C = [st.A[0] + (st.C[0] - st.A[0]) * c / b, st.A[1] + (st.C[1] - st.A[1]) * c / b]; B.build(draw);
    }, 'btn secondary');
    ui.button(row2, '↺ Đặt lại', function () { st = init(); ui.side.querySelector('input[type=checkbox]').checked = false; B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['ab', 'AB : AC'], ['db', 'DB : DC'], ['ang', 'BAD ; DAC'], ['ad', 'AD'], ['e', 'EB : EC']]);

    function refresh() {
      var c = dist(st.A, st.B), b = dist(st.A, st.C), A = angAt(st.B, st.A, st.C), D = Dpt(st), E = Ept(st);
      var p = { c: c, b: b, A: A };
      Object.keys(IN).forEach(function (k) { if (document.activeElement !== IN[k]) { IN[k].value = +p[k].toFixed(2); IN[k].classList.remove('invalid'); } });
      out('ab', f(c) + ' : ' + f(b) + ' = ' + f(c / b, 3));
      var db = dist(D, st.B), dc = dist(D, st.C);
      out('db', f(db) + ' : ' + f(dc) + ' = ' + f(db / dc, 3));
      out('ang', f(angAt(st.B, st.A, D), 1) + '° ; ' + f(angAt(D, st.A, st.C), 1) + '°');
      out('ad', f(dist(st.A, D)));
      out('e', !st.ext ? '(bật phân giác ngoài)' : E ? f(dist(E, st.B)) + ' : ' + f(dist(E, st.C)) + ' = ' + f(dist(E, st.B) / dist(E, st.C), 3) : 'AB = AC: phân giác ngoài ∥ BC');
    }
    function upd() { refresh(); if (B && B.board) B.board.update(); }

    var B = GeoWidget.board2d(ui, { bbox: [-7, 6.5, 7, -4], axis: false, grid: true, aria: 'Tam giác ABC với đường phân giác AD' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';
    function draw(board, C) {
      var P = {};
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue, label: k === 'A' ? { offset: [-6, 14] } : { offset: k === 'B' ? [-16, -12] : [8, -12] } });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var D = board.create('point', [function () { return Dpt(st)[0]; }, function () { return Dpt(st)[1]; }], { name: 'D', size: 3, color: C.orange, fixed: true, label: { offset: [-4, -16] } });
      board.create('segment', [P.A, D], { strokeColor: C.orange, strokeWidth: 2.5 });
      var ao = { radius: 0.9, name: '', fillColor: C.orange, fillOpacity: 0.25, strokeColor: C.orange };
      board.create('nonreflexangle', [P.B, P.A, D], ao);
      board.create('nonreflexangle', [D, P.A, P.C], Object.assign({}, ao, { radius: 1.1 }));
      board.create('segment', [P.B, D], { strokeColor: C.green, strokeWidth: 4, strokeOpacity: 0.6 });
      board.create('segment', [D, P.C], { strokeColor: C.purple, strokeWidth: 4, strokeOpacity: 0.6 });
      var showE = function () { return st.ext && !!Ept(st); };
      var E = board.create('point', [function () { var e = Ept(st); return e ? e[0] : 0; }, function () { var e = Ept(st); return e ? e[1] : 0; }],
        { name: 'E', size: 3, color: C.red, fixed: true, visible: showE, label: { visible: showE } });
      board.create('segment', [P.A, E], { strokeColor: C.red, strokeWidth: 1.5, dash: 2, visible: showE });
      board.create('line', [P.B, P.C], { strokeColor: C.muted, strokeWidth: 1, dash: 1, visible: showE, fixed: true });
      refresh();
    }
    if (B) B.build(draw);
    el.__debug = function () { return { st: st, D: Dpt(st), E: Ept(st) }; };
  });
})();
