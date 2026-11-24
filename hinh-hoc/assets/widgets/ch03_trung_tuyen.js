/* ch03_trung_tuyen.js — Bài 5: ba đường trung tuyến đồng quy tại trọng tâm; tam giác cân. */
(function () {
  'use strict';
  GeoWidget.register('ch03_trung_tuyen', function (ui, el) {
    var H = CH03, f = H.f;
    var INIT = { A: [-1, 4], B: [-4.5, -2], C: [4, -2] };
    var st = { A: INIT.A.slice(), B: INIT.B.slice(), C: INIT.C.slice(), iso: el.getAttribute('data-iso') === '1' };
    var KS = ['A', 'B', 'C'];
    function G() { return [(st.A[0] + st.B[0] + st.C[0]) / 3, (st.A[1] + st.B[1] + st.C[1]) / 3]; }
    function Ms() { return { A: H.mid(st.B, st.C), B: H.mid(st.C, st.A), C: H.mid(st.A, st.B) }; }
    function makeIso() {   // chiếu A lên đường trung trực của BC
      var M = H.mid(st.B, st.C), d = H.sub(st.C, st.B), L = Math.hypot(d[0], d[1]), n = [-d[1] / L, d[0] / L];
      var t = (st.A[0] - M[0]) * n[0] + (st.A[1] - M[1]) * n[1]; if (Math.abs(t) < 0.3) t = t < 0 ? -0.3 : 0.3;
      st.A = H.add(M, H.mul(n, t));
    }
    if (st.iso) makeIso();

    var g = ui.group('Tọa độ các đỉnh (nhập số)');
    var ins = {};
    KS.forEach(function (k) {
      [0, 1].forEach(function (j) {
        ins[k + j] = ui.number({ label: k + ': ' + (j ? 'tung độ' : 'hoành độ'), value: st[k][j], min: -20, max: 20, onChange: function (v) { st[k][j] = v; if (st.iso) makeIso(); sync(); } }, g);
      });
    });
    var row = ui.row();
    ui.checkbox('Giữ tam giác cân tại A (AB = AC)', st.iso, function (v) { st.iso = v; if (v) makeIso(); sync(); }, row);
    var out = ui.readout([['G', 'Trọng tâm G'], ['r1', 'AG; GM₁; AG : GM₁'], ['r2', 'BG; GM₂; BG : GM₂'], ['r3', 'CG; GM₃; CG : GM₃'],
      ['iso', 'AB; AC'], ['bc', '∠B; ∠C'], ['perp', '∠AM₁C']]);

    var BD = GeoWidget.board2d(ui, { bbox: [-7, 5.5, 7, -4.5], grid: true, aria: 'Ba đường trung tuyến của tam giác cắt nhau tại trọng tâm G' });
    var P = {};
    function sync() { KS.forEach(function (k) { H.put(ins[k + 0], st[k][0]); H.put(ins[k + 1], st[k][1]); if (P[k]) P[k].moveTo(st[k]); }); refresh(); if (BD && BD.board) BD.board.update(); }
    function refresh() {
      var g = G(), M = Ms();
      out('G', H.pt(g));
      [['A', 'r1'], ['B', 'r2'], ['C', 'r3']].forEach(function (p) {
        var a = H.dist(st[p[0]], g), b = H.dist(g, M[p[0]]);
        out(p[1], f(a) + '; ' + f(b) + '; ' + f(a / b) + ' : 1');
      });
      var ab = H.dist(st.A, st.B), ac = H.dist(st.A, st.C);
      out('iso', f(ab) + '; ' + f(ac) + (Math.abs(ab - ac) < 1e-6 ? ' (bằng nhau)' : ''));
      out('bc', H.fd(H.ang(st.A, st.B, st.C)) + '; ' + H.fd(H.ang(st.A, st.C, st.B)));
      out('perp', H.fd(H.ang(st.A, M.A, st.C)));
    }
    function draw(board, C) {
      KS.forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue, label: { offset: k === 'A' ? [6, 14] : [-14, -12] } });
        P[k].on('drag', function () {
          st[k] = H.xy(P[k]);
          if (st.iso) { makeIso(); P.A.moveTo(st.A); }
          KS.forEach(function (q) { H.put(ins[q + 0], st[q][0]); H.put(ins[q + 1], st[q][1]); });
          refresh();
        });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, highlight: false });
      var cols = [C.orange, C.green, C.purple], names = ['M₁', 'M₂', 'M₃'];
      KS.forEach(function (k, i) {
        var m = H.dep(board, function () { return Ms()[k]; }, { name: names[i], color: cols[i], size: 3, label: { offset: [6, -12] } });
        board.create('segment', [P[k], m], { strokeColor: cols[i], strokeWidth: 2, highlight: false, fixed: true });
      });
      // ký hiệu: hai nửa của mỗi cạnh bằng nhau (cạnh thứ i có i + 1 vạch)
      KS.forEach(function (k, i) {
        H.path(board, function () {
          var P1 = st[KS[(i + 1) % 3]], P2 = st[KS[(i + 2) % 3]], d = H.sub(P2, P1), L = Math.hypot(d[0], d[1]);
          var u = H.mul(d, 1 / L), n = [-u[1] * 0.17, u[0] * 0.17], pts = [];
          [0.25, 0.75].forEach(function (t) {
            for (var j = 0; j <= i; j++) {
              var p = H.add(H.lerp(P1, P2, t), H.mul(u, (j - i / 2) * 0.12));
              pts.push(H.add(p, n), H.sub(p, n), [NaN, NaN]);
            }
          });
          return pts;
        }, { strokeColor: cols[i], strokeWidth: 2 });
      });
      H.dep(board, G, { name: 'G', color: C.red, size: 5, label: { offset: [8, 10] } });
      // góc vuông tại M₁ khi tam giác cân
      H.path(board, function () {
        var M = Ms().A; if (Math.abs(H.ang(st.A, M, st.C) - 90) > 1e-6) return null;
        var u = H.sub(st.C, M), v = H.sub(st.A, M), lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]), s = 0.35;
        var p1 = H.add(M, H.mul(u, s / lu)), p3 = H.add(M, H.mul(v, s / lv)); return [p1, H.add(p1, H.mul(v, s / lv)), p3];
      }, { strokeColor: C.orange, strokeWidth: 1.5 });
      refresh();
    }
    if (BD) BD.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
