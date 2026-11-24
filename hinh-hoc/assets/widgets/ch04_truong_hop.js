/* ch04_truong_hop.js — Bài 2: Ba trường hợp đồng dạng của tam giác (c.c.c, c.g.c, g.g).
   Mỗi tam giác giữ đỉnh A cố định, B trượt trên đường nằm ngang qua A, C kéo tự do.
   Trạng thái: st.T[i] = { c: độ dài AB, C: [dx, dy] tọa độ C so với A }. Ô số theo trường hợp đang chọn. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;
  var MODES = {
    ccc: { name: 'Cạnh – cạnh – cạnh (c.c.c)', lab: [['AB', 'A′B′'], ['AC', 'A′C′'], ['BC', 'B′C′']] },
    cgc: { name: 'Cạnh – góc – cạnh (c.g.c)', lab: [['AB', 'A′B′'], ['AC', 'A′C′'], ['Góc A (°)', 'Góc A′ (°)']] },
    gg: { name: 'Góc – góc (g.g)', lab: [['Góc A (°)', 'Góc A′ (°)'], ['Góc B (°)', 'Góc B′ (°)'], ['AB', 'A′B′']] }
  };
  function meas(T) {
    var dx = T.C[0], dy = T.C[1], c = T.c;
    var b = Math.hypot(dx, dy), a = Math.hypot(dx - c, dy);
    var A = Math.atan2(dy, dx) / RAD, Bn = Math.atan2(dy, c - dx) / RAD;
    return { a: a, b: b, c: c, A: A, B: Bn, C: 180 - A - Bn };
  }
  function params(mode, T) {
    var m = meas(T);
    return mode === 'ccc' ? [m.c, m.b, m.a] : mode === 'cgc' ? [m.c, m.b, m.A] : [m.A, m.B, m.c];
  }
  /* Dựng tam giác từ 3 số; trả về null nếu không dựng được */
  function build(mode, p) {
    var c, b, A;
    if (mode === 'ccc') {
      c = p[0]; b = p[1]; var a = p[2];
      if (!(a > 0 && b > 0 && c > 0) || a >= b + c || b >= a + c || c >= a + b) return null;
      var dx = (b * b + c * c - a * a) / (2 * c);
      return { c: c, C: [dx, Math.sqrt(Math.max(0, b * b - dx * dx))] };
    }
    if (mode === 'cgc') { c = p[0]; b = p[1]; A = p[2]; if (!(c > 0 && b > 0 && A > 0 && A < 180)) return null; }
    else {
      A = p[0]; var Bn = p[1]; c = p[2];
      if (!(A > 0 && Bn > 0 && A + Bn < 180 && c > 0)) return null;
      b = c * Math.sin(Bn * RAD) / Math.sin((180 - A - Bn) * RAD);
    }
    return { c: c, C: [b * Math.cos(A * RAD), b * Math.sin(A * RAD)] };
  }

  GeoWidget.register('ch04_truong_hop', function (ui, el) {
    var ORG = [[0, 0], [6, 0]];
    function init() {
      return { mode: el.getAttribute('data-mode') || 'ccc', kk: 1.5,
        T: [{ c: 4, C: [1.5, 2.6] }, { c: 6, C: [2.25, 3.9] }] };
    }
    var st = init();
    var sel = ui.select({ label: 'Trường hợp', value: st.mode, options: Object.keys(MODES).map(function (k) { return [k, MODES[k].name]; }),
      onChange: function (v) { st.mode = v; labels(); sync(); B.build(draw); } });
    var IN = [[], []], OPT = [[], []];
    ['Tam giác ABC (nhập số)', 'Tam giác A′B′C′ (nhập số)'].forEach(function (title, i) {
      var g = ui.group(title);
      for (var j = 0; j < 3; j++) (function (j) {
        var o = { label: 'x', value: 1, min: 0.01, max: 179.99, onChange: function (v) {
          var p = params(st.mode, st.T[i]); p[j] = v;
          var T = build(st.mode, p);
          if (!T || T.c > 12 || Math.hypot(T.C[0], T.C[1]) > 12) { IN[i][j].classList.add('invalid'); IN[i][j].title = 'Không dựng được tam giác với các số này'; return; }
          IN[i][j].title = ''; st.T[i] = T; sync(); B.build(draw);
        } };
        OPT[i][j] = o; IN[i][j] = ui.number(o, g);
      })(j);
    });
    var gk = ui.group('Dựng nhanh A′B′C′ đồng dạng với ABC');
    ui.number({ label: 'Tỉ số k', value: st.kk, min: 0.2, max: 2.5, onChange: function (v) { st.kk = v; } }, gk);
    var row = ui.row();
    ui.button(row, '∽ Tạo A′B′C′ = k·ABC', function () {
      var T = st.T[0]; st.T[1] = { c: T.c * st.kk, C: [T.C[0] * st.kk, T.C[1] * st.kk] }; sync(); B.build(draw);
    });
    ui.button(row, '↺ Đặt lại', function () { var m = st.mode; st = init(); st.mode = m; sync(); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['r1', 'A′B′ : AB'], ['r2', 'A′C′ : AC'], ['r3', 'B′C′ : BC'], ['gA', 'Â ; Â′'], ['gB', 'B̂ ; B̂′'], ['gC', 'Ĉ ; Ĉ′'], ['kl', 'Kết luận']]);

    function labels() {
      var L = MODES[st.mode].lab;
      for (var i = 0; i < 2; i++) for (var j = 0; j < 3; j++) {
        IN[i][j].parentNode.querySelector('label').textContent = L[j][i];
        var ang = L[j][0].indexOf('Góc') === 0;
        OPT[i][j].min = ang ? 1 : 0.1; OPT[i][j].max = ang ? 178 : 12;
      }
    }
    function sync() {
      for (var i = 0; i < 2; i++) {
        var p = params(st.mode, st.T[i]);
        for (var j = 0; j < 3; j++) if (document.activeElement !== IN[i][j]) { IN[i][j].value = +p[j].toFixed(2); IN[i][j].classList.remove('invalid'); }
      }
      refresh();
    }
    function near(x, y) { return Math.abs(x - y) <= 0.005 * Math.max(x, y); }
    function refresh() {
      var m = meas(st.T[0]), n = meas(st.T[1]);
      var r1 = n.c / m.c, r2 = n.b / m.b, r3 = n.a / m.a;
      out('r1', f(n.c) + ' : ' + f(m.c) + ' = ' + f(r1, 3)); out('r2', f(n.b) + ' : ' + f(m.b) + ' = ' + f(r2, 3)); out('r3', f(n.a) + ' : ' + f(m.a) + ' = ' + f(r3, 3));
      out('gA', f(m.A, 1) + '° ; ' + f(n.A, 1) + '°'); out('gB', f(m.B, 1) + '° ; ' + f(n.B, 1) + '°'); out('gC', f(m.C, 1) + '° ; ' + f(n.C, 1) + '°');
      var eqA = Math.abs(m.A - n.A) < 0.3, eqB = Math.abs(m.B - n.B) < 0.3, k;
      if (st.mode === 'ccc') {
        k = near(r1, r2) && near(r2, r3) ? 'ΔA′B′C′ ∽ ΔABC (c.c.c), k = ' + f(r1) : 'Ba tỉ số chưa bằng nhau → chưa đồng dạng theo c.c.c';
      } else if (st.mode === 'cgc') {
        k = near(r1, r2) && eqA ? 'ΔA′B′C′ ∽ ΔABC (c.g.c), k = ' + f(r1) :
          (!near(r1, r2) ? 'A′B′ : AB ≠ A′C′ : AC' : 'Â ≠ Â′') + ' → chưa đồng dạng theo c.g.c';
      } else {
        k = eqA && eqB ? 'ΔA′B′C′ ∽ ΔABC (g.g), k = ' + f(r1) : (!eqA ? 'Â ≠ Â′' : 'B̂ ≠ B̂′') + ' → chưa đồng dạng theo g.g';
      }
      out('kl', k);
    }

    var B = GeoWidget.board2d(ui, { bbox: [-1, 8, 14, -1.5], axis: false, grid: true, aria: 'Hai tam giác ABC và A′B′C′ để so sánh các tỉ số cạnh và các góc' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';

    function draw(board, C) {
      var cols = [[C.blue, C.fillBlue], [C.orange, C.fillOrange]];
      for (var i = 0; i < 2; i++) (function (i) {
        var o = ORG[i], T = st.T[i], s = i ? '′' : '', col = cols[i][0];
        var A = board.create('point', o, { name: 'A' + s, fixed: true, size: 3, color: col, label: { offset: [-16, -10] } });
        var Bp = board.create('point', [o[0] + T.c, o[1]], { name: 'B' + s, size: 4, color: col, label: { offset: [6, -10] } });
        var Cp = board.create('point', [o[0] + T.C[0], o[1] + T.C[1]], { name: 'C' + s, size: 4, color: col });
        Bp.on('drag', function () {
          var x = Math.max(o[0] + 0.3, Bp.X()); Bp.moveTo([x, o[1]]);
          st.T[i].c = x - o[0]; sync();
        });
        Cp.on('drag', function () {
          var y = Math.max(o[1] + 0.2, Cp.Y()); if (y !== Cp.Y()) Cp.moveTo([Cp.X(), y]);
          st.T[i].C = [Cp.X() - o[0], y - o[1]]; sync();
        });
        board.create('polygon', [A, Bp, Cp], { fillColor: cols[i][1], fillOpacity: 1, borders: { strokeColor: col, strokeWidth: 2 }, vertices: { visible: false } });
        var ang = { radius: 0.6, fillColor: col, fillOpacity: 0.25, strokeColor: col, name: '' };
        if (st.mode !== 'ccc') board.create('nonreflexangle', [Bp, A, Cp], ang);
        if (st.mode === 'gg') board.create('nonreflexangle', [Cp, Bp, A], ang);
        function lab(P, Q, show) {
          board.create('text', [function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; },
            function () { return show() ? f(Math.hypot(P.X() - Q.X(), P.Y() - Q.Y())) : ''; }],
            { fontSize: 13, strokeColor: C.muted, anchorX: 'middle', anchorY: 'middle', cssStyle: 'font-weight:600', fixed: true });
        }
        lab(A, Bp, function () { return true; }); lab(A, Cp, function () { return st.mode !== 'gg'; }); lab(Bp, Cp, function () { return st.mode === 'ccc'; });
      })(i);
      refresh();
    }
    labels(); sync();
    if (B) B.build(draw);
    el.__debug = function () { return { st: st, m: [meas(st.T[0]), meas(st.T[1])] }; };
  });
})();
