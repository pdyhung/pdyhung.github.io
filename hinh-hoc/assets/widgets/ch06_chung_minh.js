/* ch06_chung_minh.js — Chứng minh tính chất hình học bằng tọa độ (Chương 6, Bài 6).
   Bốn chế độ: hình bình hành (trung điểm hai đường chéo), đường trung bình tam giác,
   tam giác vuông (Pythagore đảo, trung tuyến ứng với cạnh huyền), tứ giác trung điểm (Varignon). */
(function () {
  'use strict';
  var MODES = {
    hbh: { t: 'Hình bình hành ABCD', pts: [[-4, -2], [2, -2], [4, 2], [-2, 2]], n: 4 },
    tb: { t: 'Đường trung bình của tam giác', pts: [[-1, 4], [-4, -2], [4, -2]], n: 3 },
    vuong: { t: 'Tam giác vuông và trung tuyến', pts: [[-2, -2], [4, -2], [-2, 6]], n: 3 },
    varignon: { t: 'Tứ giác nối trung điểm (Varignon)', pts: [[-5, -2], [1, -4], [5, 1], [-1, 5]], n: 4 }
  };
  var NAMES = ['A', 'B', 'C', 'D'];

  GeoWidget.register('ch06_chung_minh', function (ui, el) {
    var ch = GeoWidget.ch06, f = ch.f;
    var mode0 = el.getAttribute('data-mode') || 'hbh';
    var st = { mode: mode0, snap: true };
    function load(m) { st.mode = m; NAMES.forEach(function (k, i) { st[k] = (MODES[m].pts[i] || [0, 0]).slice(); }); }
    load(mode0);

    var sel = ui.select({ label: 'Bài toán', value: mode0, options: Object.keys(MODES).map(function (k) { return [k, MODES[k].t]; }),
      onChange: function (v) { load(v); co.sync(); showInputs(); setLabels(); updBtn(); B.build(draw); } });
    var co = ch.coords(ui, 'Tọa độ các điểm (nhập số)', NAMES, st, function (k) { P[k] && P[k].moveTo(st[k]); refresh(); });
    function showInputs() { co.show('D', MODES[st.mode].n === 4); }
    var row = ui.row();
    ui.checkbox('Bắt điểm vào lưới', true, function (v) { st.snap = v; }, row);
    var row2 = ui.row();
    var fixBtn = ui.button(row2, 'Đặt D để thành hình bình hành', function () {
      if (st.mode === 'hbh') { st.D = [st.A[0] + st.C[0] - st.B[0], st.A[1] + st.C[1] - st.B[1]]; P.D.moveTo(st.D); co.sync('D'); refresh(); }
      else if (st.mode === 'vuong') { // đặt C trên đường thẳng qua A vuông góc với AB, giữ độ dài AC
        var ux = st.B[0] - st.A[0], uy = st.B[1] - st.A[1], L = Math.hypot(ux, uy) || 1, l = ch.dist(st.A, st.C) || 4;
        var s = (ux * (st.C[1] - st.A[1]) - uy * (st.C[0] - st.A[0])) >= 0 ? 1 : -1;
        st.C = [st.A[0] - s * uy / L * l, st.A[1] + s * ux / L * l];
        var isInt = function (v) { return Math.abs(v - Math.round(v)) < 1e-9; };
        if (st.snap && [ux, uy, st.A[0], st.A[1]].every(isInt)) { // giữ tọa độ nguyên: đi theo vectơ (−Δy; Δx) rút gọn
          var g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(Math.abs(Math.round(ux)), Math.abs(Math.round(uy))) || 1;
          var vx = -uy / g, vy = ux / g, t = Math.max(1, Math.round(l / Math.hypot(vx, vy)));
          st.C = [st.A[0] + s * t * vx, st.A[1] + s * t * vy];
        }
        P.C.moveTo(st.C); co.sync('C'); refresh();
      }
    }, 'btn secondary');
    function updBtn() { fixBtn.style.display = (st.mode === 'hbh' || st.mode === 'vuong') ? '' : 'none'; fixBtn.textContent = st.mode === 'hbh' ? 'Đặt D để ABCD là hình bình hành' : 'Đặt C để tam giác vuông tại A'; }
    ui.button(row2, '↺ Đặt lại', function () { load(st.mode); co.sync(); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['r1', ''], ['r2', ''], ['r3', ''], ['r4', ''], ['r5', ''], ['r6', ''], ['ok', 'Kết luận']]);
    var dts = ui.side.querySelectorAll('.readout dt');
    ch.wide(ui, [6]);
    var LABELS = {
      hbh: ['Trung điểm AC', 'Trung điểm BD', 'Vectơ AB (Δx; Δy)', 'Vectơ DC (Δx; Δy)', 'AB và DC', 'Hệ số góc AD, BC'],
      tb: ['M: trung điểm AB', 'N: trung điểm AC', 'Hệ số góc MN, BC', 'MN', 'BC', 'MN : BC'],
      vuong: ['AB² + AC²', 'BC²', 'M: trung điểm BC', 'AM', 'BC/2', 'Hệ số góc AB, AC'],
      varignon: ['M, N: trung điểm AB, BC', 'P, Q: trung điểm CD, DA', 'Trung điểm MP', 'Trung điểm NQ', 'MN và QP', 'Hệ số góc MN, QP']
    };
    function setLabels() { LABELS[st.mode].forEach(function (t, i) { dts[i].textContent = t; }); }
    setLabels(); showInputs(); updBtn();

    var B = GeoWidget.board2d(ui, { ratio: 0.92, maxH: 560, bbox: [-7, 7, 7, -6], axis: true, grid: true, aria: 'Hình vẽ trên mặt phẳng tọa độ dùng để chứng minh bằng tọa độ' });
    var P = {};
    var E = 1e-7;
    function sl(p, q) { return ch.slopeStr(ch.slope(p, q)); }
    function eqv(a, b) { return Math.abs(a - b) < E; }
    function same(p, q) { return eqv(p[0], q[0]) && eqv(p[1], q[1]); }

    function refresh() {
      var A = st.A, Bq = st.B, C = st.C, D = st.D, m = st.mode, ok;
      if (m === 'hbh') {
        var I = ch.mid(A, C), J = ch.mid(Bq, D), u = [Bq[0] - A[0], Bq[1] - A[1]], v = [C[0] - D[0], C[1] - D[1]];
        out('r1', ch.pt(I)); out('r2', ch.pt(J)); out('r3', ch.pt(u)); out('r4', ch.pt(v));
        out('r5', f(ch.dist(A, Bq)) + ' và ' + f(ch.dist(D, C)));
        out('r6', sl(A, D) + ' và ' + sl(Bq, C));
        ok = same(I, J);
        out('ok', ok ? '✔ Hai đường chéo cắt nhau tại trung điểm mỗi đường ⇒ ABCD là hình bình hành.' : '✘ Trung điểm AC ≠ trung điểm BD ⇒ ABCD không phải hình bình hành.');
      } else if (m === 'tb') {
        var M = ch.mid(A, Bq), N = ch.mid(A, C), mn = ch.dist(M, N), bc = ch.dist(Bq, C);
        out('r1', ch.pt(M)); out('r2', ch.pt(N)); out('r3', sl(M, N) + ' và ' + sl(Bq, C));
        out('r4', f(mn)); out('r5', f(bc)); out('r6', bc > E ? ch.frac(mn / bc) : '—');
        out('ok', bc > E ? '✔ MN ∥ BC (cùng hệ số góc hoặc cùng thẳng đứng) và MN = BC/2 — luôn đúng, dù kéo A, B, C thế nào.' : 'B trùng C: không có tam giác.');
      } else if (m === 'vuong') {
        var ab2 = (Bq[0] - A[0]) ** 2 + (Bq[1] - A[1]) ** 2, ac2 = (C[0] - A[0]) ** 2 + (C[1] - A[1]) ** 2, bc2 = (C[0] - Bq[0]) ** 2 + (C[1] - Bq[1]) ** 2;
        var Mv = ch.mid(Bq, C), am = ch.dist(A, Mv);
        out('r1', f(ab2) + ' + ' + f(ac2) + ' = ' + f(ab2 + ac2)); out('r2', f(bc2)); out('r3', ch.pt(Mv)); out('r4', f(am)); out('r5', f(Math.sqrt(bc2) / 2));
        var k1 = ch.slope(A, Bq), k2 = ch.slope(A, C);
        out('r6', ch.slopeStr(k1) + ' và ' + ch.slopeStr(k2) + (isFinite(k1) && isFinite(k2) ? ' (tích = ' + f(k1 * k2) + ')' : ''));
        ok = Math.abs(ab2 + ac2 - bc2) < 1e-6 && ab2 > E && ac2 > E;
        out('ok', ok ? '✔ AB² + AC² = BC² ⇒ tam giác vuông tại A, và AM = BC/2.' : '✘ AB² + AC² ≠ BC² ⇒ không vuông tại A; AM ≠ BC/2.');
      } else {
        var M1 = ch.mid(A, Bq), N1 = ch.mid(Bq, C), P1 = ch.mid(C, D), Q1 = ch.mid(D, A), I1 = ch.mid(M1, P1), J1 = ch.mid(N1, Q1);
        out('r1', ch.pt(M1) + ', ' + ch.pt(N1)); out('r2', ch.pt(P1) + ', ' + ch.pt(Q1)); out('r3', ch.pt(I1)); out('r4', ch.pt(J1));
        out('r5', f(ch.dist(M1, N1)) + ' và ' + f(ch.dist(Q1, P1))); out('r6', sl(M1, N1) + ' và ' + sl(Q1, P1));
        out('ok', same(I1, J1) ? '✔ MP và NQ có cùng trung điểm ⇒ MNPQ là hình bình hành (với mọi tứ giác ABCD).' : '—');
      }
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var snap = function () { return st.snap; }, m = st.mode, n = MODES[m].n;
      var V = NAMES.slice(0, n).map(function (k) {
        P[k] = ch.point(board, k, st[k], C.blue, snap, function (p) { st[k] = p; co.sync(k); refresh(); });
        return P[k];
      });
      var mid = function (a, b, name, col, off) {
        return board.create('point', [function () { return (a.X() + b.X()) / 2; }, function () { return (a.Y() + b.Y()) / 2; }],
          { name: name, fixed: true, size: 3, color: col, strokeColor: col, fillColor: col, withLabel: !!name, label: { offset: off || [6, 10] }, highlight: false });
      };
      var seg = function (a, b, col, w, dash) { return board.create('segment', [a, b], { strokeColor: col, strokeWidth: w || 2, dash: dash || 0, fixed: true, highlight: false }); };
      board.create('polygon', V, { fillColor: C.fillBlue, fillOpacity: 1, highlight: false, vertices: { visible: false }, borders: { strokeColor: C.blue, strokeWidth: 2.5, highlight: false } });
      if (m === 'hbh') {
        seg(P.A, P.C, C.muted, 1.5, 2); seg(P.B, P.D, C.muted, 1.5, 2);
        mid(P.A, P.C, '', C.green); mid(P.B, P.D, '', C.orange);
        ch.text(board, function () { return (P.A.X() + P.C.X()) / 2; }, function () { return (P.A.Y() + P.C.Y()) / 2 - 0.5; },
          function () { return same([(P.A.X() + P.C.X()) / 2, (P.A.Y() + P.C.Y()) / 2], [(P.B.X() + P.D.X()) / 2, (P.B.Y() + P.D.Y()) / 2]) ? 'I' : ''; }, C.text);
      } else if (m === 'tb') {
        var M = mid(P.A, P.B, 'M', C.orange, [-20, 8]), N = mid(P.A, P.C, 'N', C.orange, [8, 8]);
        seg(M, N, C.orange, 3);
      } else if (m === 'vuong') {
        var Mv = mid(P.B, P.C, 'M', C.orange, [8, 8]);
        seg(P.A, Mv, C.orange, 3, 2);
        var s = 0.45;
        var u = function (Q, j) { var dx = Q.X() - P.A.X(), dy = Q.Y() - P.A.Y(), l = Math.hypot(dx, dy) || 1; return (j ? dy : dx) / l; };
        var c1 = ch.fpt(board, function () { return P.A.X() + s * u(P.B, 0); }, function () { return P.A.Y() + s * u(P.B, 1); });
        var c2 = ch.fpt(board, function () { return P.A.X() + s * (u(P.B, 0) + u(P.C, 0)); }, function () { return P.A.Y() + s * (u(P.B, 1) + u(P.C, 1)); });
        var c3 = ch.fpt(board, function () { return P.A.X() + s * u(P.C, 0); }, function () { return P.A.Y() + s * u(P.C, 1); });
        var isR = function () { var a = st.A, b = st.B, c = st.C; return Math.abs((b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1])) < 1e-6; };
        board.create('polygon', [P.A, c1, c2, c3], { fillColor: C.fillGreen, fillOpacity: 1, highlight: false, vertices: { visible: false },
          borders: { strokeColor: C.green, strokeWidth: 1.5, highlight: false, visible: isR }, visible: isR });
      } else {
        var Mm = mid(P.A, P.B, 'M', C.orange), Nn = mid(P.B, P.C, 'N', C.orange), Pp = mid(P.C, P.D, 'P', C.orange), Qq = mid(P.D, P.A, 'Q', C.orange);
        board.create('polygon', [Mm, Nn, Pp, Qq], { fillColor: C.fillOrange, fillOpacity: 1, highlight: false, vertices: { visible: false }, borders: { strokeColor: C.orange, strokeWidth: 2.5, highlight: false } });
        seg(Mm, Pp, C.muted, 1.2, 2); seg(Nn, Qq, C.muted, 1.2, 2);
      }
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
