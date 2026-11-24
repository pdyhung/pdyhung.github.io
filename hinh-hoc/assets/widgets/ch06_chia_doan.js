/* ch06_chia_doan.js — Điểm chia đoạn thẳng AB theo tỉ số m : n (Chương 6, Bài 2).
   P nằm trên AB với AP : PB = m : n; x_P = (n·x_A + m·x_B)/(m + n), tương tự cho y. */
(function () {
  'use strict';
  GeoWidget.register('ch06_chia_doan', function (ui, el) {
    var ch = GeoWidget.ch06, f = ch.f;
    var init = { A: [-4, -2], B: [5, 4], m: 1, n: 2 };
    var st = { A: init.A.slice(), B: init.B.slice(), m: init.m, n: init.n, snap: true, ticks: true, playing: false, t0: 0, save: null };

    var co = ch.coords(ui, 'Tọa độ hai đầu mút (nhập số)', ['A', 'B'], st, function (k) { P[k] && P[k].moveTo(st[k]); refresh(); });
    var sm = ui.slider({ label: 'm (phần AP)', min: 0, max: 10, step: 0.1, value: st.m, decimals: 1, onInput: function () { st.m = sm.get(); refresh(); } });
    var sn = ui.slider({ label: 'n (phần PB)', min: 0, max: 10, step: 0.1, value: st.n, decimals: 1, onInput: function () { st.n = sn.get(); refresh(); } });
    var row = ui.row();
    ui.checkbox('Bắt điểm vào lưới', true, function (v) { st.snap = v; }, row);
    ui.checkbox('Vạch chia đều', true, function (v) { st.ticks = v; B.build(draw); }, row);
    var row2 = ui.row();
    var play = ui.button(row2, '▶ Cho P chạy từ A đến B', function () {
      if (st.playing) return;
      st.save = [st.m, st.n]; st.playing = true; st.t0 = performance.now();
    });
    ui.button(row2, '↺ Đặt lại', function () {
      st.playing = false; st.A = init.A.slice(); st.B = init.B.slice(); st.m = init.m; st.n = init.n;
      sm.set(st.m); sn.set(st.n); co.sync(); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var out = ui.readout([['k', 'AP/AB = m/(m + n)'], ['x', 'x_P = (n·x_A + m·x_B)/(m + n)'], ['y', 'y_P = (n·y_A + m·y_B)/(m + n)'], ['P', 'Điểm chia P'],
      ['AP', 'AP'], ['PB', 'PB'], ['r', 'AP : PB']]);
    ch.wide(ui, [0, 1, 2]);

    var B = GeoWidget.board2d(ui, { ratio: 0.92, maxH: 560, bbox: [-7, 6, 7, -6], axis: true, grid: true, aria: 'Đoạn thẳng AB và điểm P chia AB theo tỉ số m : n' });
    var P = {};

    function k() { var s = st.m + st.n; return s > 0 ? st.m / s : NaN; }
    function Pc() { var t = k(); return [st.A[0] + t * (st.B[0] - st.A[0]), st.A[1] + t * (st.B[1] - st.A[1])]; }

    function refresh() {
      var s = st.m + st.n, t = k(), p = Pc(), A = st.A, Bp = st.B;
      if (!(s > 0)) { ['k', 'x', 'y', 'P', 'AP', 'PB', 'r'].forEach(function (q) { out(q, '— (m + n phải khác 0)'); }); }
      else {
        out('k', f(st.m, 1) + '/(' + f(st.m, 1) + ' + ' + f(st.n, 1) + ') = ' + ch.frac(t));
        out('x', '(' + f(st.n, 1) + '·' + ch.par(A[0]) + ' + ' + f(st.m, 1) + '·' + ch.par(Bp[0]) + ')/' + f(s, 1) + ' = ' + f(p[0]));
        out('y', '(' + f(st.n, 1) + '·' + ch.par(A[1]) + ' + ' + f(st.m, 1) + '·' + ch.par(Bp[1]) + ')/' + f(s, 1) + ' = ' + f(p[1]));
        out('P', ch.pt(p));
        var ap = ch.dist(A, p), pb = ch.dist(p, Bp);
        out('AP', f(ap)); out('PB', f(pb));
        out('r', pb > 1e-9 ? f(ap) + ' : ' + f(pb) + ' = ' + ch.frac(st.m / st.n) : 'P trùng B');
      }
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var snap = function () { return st.snap; };
      P.A = ch.point(board, 'A', st.A, C.blue, snap, function (p) { st.A = p; co.sync('A'); refresh(); });
      P.B = ch.point(board, 'B', st.B, C.blue, snap, function (p) { st.B = p; co.sync('B'); refresh(); });
      var Pt = function (i) { return function () { var t = k(); if (!isFinite(t)) t = 0; return [P.A.X(), P.A.Y()][i] + t * ([P.B.X(), P.B.Y()][i] - [P.A.X(), P.A.Y()][i]); }; };
      var Pp = ch.fpt(board, Pt(0), Pt(1));
      board.create('segment', [P.A, P.B], { strokeColor: C.muted, strokeWidth: 2, fixed: true, highlight: false });
      board.create('segment', [P.A, Pp], { strokeColor: C.green, strokeWidth: 5, fixed: true, highlight: false, visible: function () { return st.m + st.n > 0; } });
      board.create('segment', [Pp, P.B], { strokeColor: C.orange, strokeWidth: 5, fixed: true, highlight: false, visible: function () { return st.m + st.n > 0; } });
      if (st.ticks) {
        for (var i = 1; i < 20; i++) (function (i) {
          var on = function () { var s = st.m + st.n; return Number.isInteger(st.m) && Number.isInteger(st.n) && s <= 20 && i < s; };
          var c = function (j) { return function () { var s = st.m + st.n, a = [P.A.X(), P.A.Y()][j], b = [P.B.X(), P.B.Y()][j]; return s > 0 ? a + i / s * (b - a) : a; }; };
          board.create('point', [c(0), c(1)], { name: '', size: 2, fixed: true, color: C.text, strokeColor: C.text, fillColor: C.bg, withLabel: false, highlight: false, visible: on });
        })(i);
      }
      // hình chiếu của P xuống các trục
      board.create('segment', [Pp, ch.fpt(board, Pt(0), function () { return 0; })], { strokeColor: C.red, dash: 2, strokeWidth: 1.2, fixed: true, highlight: false });
      board.create('segment', [Pp, ch.fpt(board, function () { return 0; }, Pt(1))], { strokeColor: C.red, dash: 2, strokeWidth: 1.2, fixed: true, highlight: false });
      board.create('point', [Pt(0), Pt(1)], { name: 'P', fixed: true, size: 4.5, color: C.red, strokeColor: C.red, fillColor: C.red, label: { offset: [8, -12] }, visible: function () { return st.m + st.n > 0; } });
      var midT = function (a, b, j, off) { return function () { var t = k(); if (!isFinite(t)) t = 0; var A = [P.A.X(), P.A.Y()], Bq = [P.B.X(), P.B.Y()];
        var u = a + (b - a) * 0.5, tt = (a === 0 ? t * 0.5 : t + (1 - t) * 0.5), v = A[j] + tt * (Bq[j] - A[j]);
        var dx = Bq[0] - A[0], dy = Bq[1] - A[1], L = Math.hypot(dx, dy) || 1; return v + (j === 0 ? -dy / L : dx / L) * off; }; };
      ch.text(board, midT(0, 0, 0, 0.55), midT(0, 0, 1, 0.55), function () { return 'm = ' + f(st.m, 1); }, C.green, { visible: function () { return st.m > 0; } });
      ch.text(board, midT(1, 1, 0, 0.55), midT(1, 1, 1, 0.55), function () { return 'n = ' + f(st.n, 1); }, C.orange, { visible: function () { return st.n > 0; } });
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        var s = st.save[0] + st.save[1]; if (!(s > 0)) s = 10;
        var u = Math.min(1, (t - st.t0) / 3500);
        st.m = Math.round(u * s * 10) / 10; st.n = Math.round((s - st.m) * 10) / 10;
        sm.set(st.m); sn.set(st.n); refresh();
        if (u >= 1) { st.playing = false; st.m = st.save[0]; st.n = st.save[1]; sm.set(st.m); sn.set(st.n); refresh(); }
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
