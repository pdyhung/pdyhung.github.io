/* ch06_da_giac.js — Chu vi và diện tích đa giác trên mặt phẳng tọa độ (Chương 6, Bài 3).
   3–6 đỉnh kéo được / nhập tọa độ; chu vi, diện tích theo công thức Shoelace (công thức "dây giày");
   hình chữ nhật bao và (với tam giác) ba tam giác vuông bị trừ đi. */
(function () {
  'use strict';
  var NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];
  var PRESET = {
    3: [[-3, -2], [4, -1], [1, 4]],
    4: [[-4, -2], [3, -3], [4, 2], [-2, 4]],
    5: [[-4, -1], [-1, -4], [4, -2], [3, 3], [-2, 4]],
    6: [[-4, 0], [-2, -4], [2, -4], [5, 0], [2, 4], [-2, 4]]
  };
  function segX(p, q, r, s) { // hai đoạn pq, rs cắt nhau thật sự (không tính chung đầu mút)
    function o(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    var d1 = o(r, s, p), d2 = o(r, s, q), d3 = o(p, q, r), d4 = o(p, q, s);
    return ((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12));
  }

  GeoWidget.register('ch06_da_giac', function (ui, el) {
    var ch = GeoWidget.ch06, f = ch.f;
    var N0 = +(el.getAttribute('data-n') || 4);
    var st = { N: N0, snap: true, box: true, P: {} };
    function load(N, pts) { st.N = N; NAMES.forEach(function (k, i) { st.P[k] = (pts[i] || PRESET[6][i]).slice(); }); }
    var custom = el.getAttribute('data-pts');
    load(N0, custom ? custom.split(';').map(function (s) { return s.split(',').map(Number); }) : PRESET[N0]);
    var initPts = NAMES.map(function (k) { return st.P[k].slice(); });

    ui.select({ label: 'Số đỉnh', value: String(st.N), options: [['3', '3 (tam giác)'], ['4', '4 (tứ giác)'], ['5', '5 (ngũ giác)'], ['6', '6 (lục giác)']],
      onChange: function (v) { load(+v, PRESET[+v]); co.sync(); showInputs(); B.build(draw); } });
    var co = ch.coords(ui, 'Tọa độ các đỉnh (theo thứ tự đi vòng)', NAMES, st.P, function (k) { P[k] && P[k].moveTo(st.P[k]); refresh(); });
    function showInputs() { NAMES.forEach(function (k, i) { co.show(k, i < st.N); }); }
    showInputs();
    var row = ui.row();
    ui.checkbox('Bắt điểm vào lưới', true, function (v) { st.snap = v; }, row);
    ui.checkbox('Hình chữ nhật bao', true, function (v) { st.box = v; refresh(); }, row);
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () { load(N0, initPts); co.sync(); showInputs(); selReset(); B.resetView(); B.build(draw); }, 'btn secondary');
    function selReset() { var s = ui.side.querySelector('select'); if (s) s.value = String(N0); }
    var out = ui.readout([['sides', 'Các cạnh'], ['P', 'Chu vi'], ['sum', 'Σ(xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)'], ['S', 'Diện tích S = ½|Σ|'], ['box', 'Hình chữ nhật bao'], ['cut', 'S = S_HCN − phần ngoài'], ['note', 'Ghi chú']]);
    ch.wide(ui, [0, 5, 6]);

    var B = GeoWidget.board2d(ui, { ratio: 0.92, maxH: 560, bbox: [-7, 6, 7, -6], axis: true, grid: true, aria: 'Đa giác trên mặt phẳng tọa độ với hình chữ nhật bao' });
    var P = {};

    function pts() { return NAMES.slice(0, st.N).map(function (k) { return st.P[k]; }); }
    function geom() {
      var p = pts(), n = p.length, per = 0, sum = 0, sides = [];
      for (var i = 0; i < n; i++) {
        var a = p[i], b = p[(i + 1) % n], L = ch.dist(a, b);
        per += L; sum += a[0] * b[1] - b[0] * a[1]; sides.push(NAMES[i] + NAMES[(i + 1) % n] + ' = ' + f(L));
      }
      var xs = p.map(function (q) { return q[0]; }), ys = p.map(function (q) { return q[1]; });
      var bx = [Math.min.apply(0, xs), Math.max.apply(0, xs)], by = [Math.min.apply(0, ys), Math.max.apply(0, ys)];
      var self = false;
      for (i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        if (j === i + 1 || (i === 0 && j === n - 1)) continue;
        if (segX(p[i], p[(i + 1) % n], p[j], p[(j + 1) % n])) self = true;
      }
      return { p: p, per: per, sum: sum, S: Math.abs(sum) / 2, sides: sides, bx: bx, by: by, self: self };
    }
    /* Với tam giác: mỗi cạnh là cạnh huyền của một tam giác vuông có hai cạnh góc vuông song song với hai trục,
       nằm phía ngoài tam giác. Trả về danh sách [đỉnh1, đỉnh góc vuông, đỉnh2]. */
    function corners(p) {
      var res = [];
      for (var i = 0; i < 3; i++) {
        var a = p[i], b = p[(i + 1) % 3], c = p[(i + 2) % 3];
        var o = function (u, v, w) { return (v[0] - u[0]) * (w[1] - u[1]) - (v[1] - u[1]) * (w[0] - u[0]); };
        var q1 = [a[0], b[1]], q2 = [b[0], a[1]];
        var sc = o(a, b, c), q = (o(a, b, q1) * sc <= 0) ? q1 : q2;
        res.push([a, q, b]);
      }
      return res;
    }

    function refresh() {
      var g = geom(), w = g.bx[1] - g.bx[0], h = g.by[1] - g.by[0];
      out('sides', g.sides.join('; '));
      out('P', f(g.per));
      out('sum', f(g.sum));
      out('S', '½·|' + f(g.sum) + '| = ' + f(g.S));
      out('box', f(w) + ' × ' + f(h) + ' = ' + f(w * h));
      var note = '';
      if (g.self) note = 'Đa giác tự cắt: hãy đặt các đỉnh theo đúng thứ tự đi vòng quanh hình. Công thức Shoelace chỉ đúng cho đa giác không tự cắt.';
      else note = g.sum > 0 ? 'Các đỉnh xếp ngược chiều kim đồng hồ (Σ > 0).' : (g.sum < 0 ? 'Các đỉnh xếp cùng chiều kim đồng hồ (Σ < 0), lấy giá trị tuyệt đối.' : 'Các đỉnh thẳng hàng: S = 0.');
      if (st.N === 3) {
        var cs = corners(g.p), areas = cs.map(function (t) { return Math.abs((t[2][0] - t[0][0]) * (t[2][1] - t[0][1])) / 2; });
        var tot = areas[0] + areas[1] + areas[2];
        if (Math.abs(w * h - tot - g.S) < 1e-7) out('cut', f(w * h) + ' − (' + areas.map(function (a) { return f(a); }).join(' + ') + ') = ' + f(w * h - tot));
        else out('cut', 'Ba tam giác vuông chưa phủ hết phần ngoài (cần trừ thêm một hình chữ nhật): ' + f(w * h) + ' − ' + f(w * h - g.S) + ' = ' + f(g.S));
      } else out('cut', f(w * h) + ' − ' + f(w * h - g.S) + ' = ' + f(g.S));
      out('note', note);
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var snap = function () { return st.snap; };
      var V = NAMES.slice(0, st.N).map(function (k) {
        P[k] = ch.point(board, k, st.P[k], C.blue, snap, function (p) { st.P[k] = p; co.sync(k); refresh(); });
        return P[k];
      });
      var bb = function (j, m) { return function () { var v = V.map(function (q) { return j ? q.Y() : q.X(); }); return m ? Math.max.apply(0, v) : Math.min.apply(0, v); }; };
      var r1 = ch.fpt(board, bb(0, 0), bb(1, 0)), r2 = ch.fpt(board, bb(0, 1), bb(1, 0)), r3 = ch.fpt(board, bb(0, 1), bb(1, 1)), r4 = ch.fpt(board, bb(0, 0), bb(1, 1));
      board.create('polygon', [r1, r2, r3, r4], { fillColor: C.fillPurple, fillOpacity: 0.6, highlight: false, vertices: { visible: false },
        borders: { strokeColor: C.purple, dash: 2, strokeWidth: 1.5, highlight: false }, visible: function () { return st.box; } });
      if (st.N === 3) {
        for (var i = 0; i < 3; i++) (function (i) {
          var c = function (vi, j) { return function () { var p = V.map(function (q) { return [q.X(), q.Y()]; }); return corners(p)[i][vi][j]; }; };
          var T = [0, 1, 2].map(function (vi) { return ch.fpt(board, c(vi, 0), c(vi, 1)); });
          board.create('polygon', T, { fillColor: C.fillOrange, fillOpacity: 1, highlight: false, vertices: { visible: false },
            borders: { strokeColor: C.orange, strokeWidth: 1, highlight: false }, visible: function () { return st.box; } });
          ch.text(board, function () { return (T[0].X() + T[1].X() + T[2].X()) / 3; }, function () { return (T[0].Y() + T[1].Y() + T[2].Y()) / 3; },
            function () { return 'S' + '₁₂₃'[i]; }, C.orange, { fontSize: 13, visible: function () {
              return st.box && Math.abs((T[2].X() - T[0].X()) * (T[2].Y() - T[0].Y())) > 2; } });
        })(i);
      }
      board.create('polygon', V, { fillColor: C.fillBlue, fillOpacity: 1, highlight: false, vertices: { visible: false },
        borders: { strokeColor: C.blue, strokeWidth: 2.5, highlight: false } });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
