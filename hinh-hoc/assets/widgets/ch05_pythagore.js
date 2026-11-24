/* ch05_pythagore.js — Bài 1: Định lý Pythagore.
   Chế độ "Ba hình vuông": tam giác vuông tại C, kéo A, B (hoặc nhập a, b) → c, diện tích ba hình vuông.
   Chế độ "Ghép hình": hình vuông cạnh a + b chứa 4 tam giác bằng nhau; bấm Phát để 4 tam giác trượt,
   phần trống đổi từ một hình vuông c² thành hai hình vuông a² và b². */
(function () {
  'use strict';

  /* đặt khung nhìn [x0, y1, x1, y0] giữ tỉ lệ 1:1, mở rộng chiều thiếu (không cắt nội dung) */
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };

  GeoWidget.register('ch05_pythagore', function (ui, el) {
    var A0 = +(el.getAttribute('data-a') || 3), B0 = +(el.getAttribute('data-b') || 4);
    var st = { a: A0, b: B0, mode: el.getAttribute('data-mode') || 'sq', t: 0, playing: false, dir: 1, t0: 0 };

    var selMode = ui.select({ label: 'Chế độ', value: st.mode, options: [['sq', 'Ba hình vuông trên ba cạnh'], ['ghep', 'Chứng minh bằng ghép hình']],
      onChange: function (v) { st.mode = v; st.t = 0; st.playing = false; B.build(draw); fit(); } });
    var sa = ui.slider({ label: 'Cạnh góc vuông a', min: 0.5, max: 12, step: 0.1, value: st.a, decimals: 2, onInput: function (v) { st.a = v; refresh(); fit(); } });
    var sb = ui.slider({ label: 'Cạnh góc vuông b', min: 0.5, max: 12, step: 0.1, value: st.b, decimals: 2, onInput: function (v) { st.b = v; refresh(); fit(); } });
    var row = ui.row();
    var playBtn = ui.button(row, '▶ Ghép hình', function () {
      if (st.mode !== 'ghep') { st.mode = 'ghep'; selMode.value = 'ghep'; st.t = 0; B.build(draw); fit(); }
      st.dir = st.t >= 0.5 ? -1 : 1; st.playing = true; st.t0 = performance.now(); st.tStart = st.t;
    });
    ui.button(row, '↺ Đặt lại', function () {
      st.a = A0; st.b = B0; st.t = 0; st.playing = false; sa.set(st.a); sb.set(st.b); B.resetView(); B.build(draw); fit();
    }, 'btn secondary');
    var chips = ui.row('Bộ ba Pythagore');
    [[3, 4], [5, 12], [8, 15], [7, 24], [6, 8]].forEach(function (p) {
      ui.button(chips, p[0] + ', ' + p[1], function () { st.a = p[0]; st.b = p[1]; sa.set(st.a); sb.set(st.b); refresh(); fit(); }, 'chip');
    });
    var setOut = ui.readout([['a', 'a = BC'], ['b', 'b = AC'], ['c', 'c = AB = √(a² + b²)'], ['a2', 'a²'], ['b2', 'b²'], ['sum', 'a² + b²'], ['c2', 'c²']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    var B = GeoWidget.board2d(ui, { ratio: 0.85, bbox: [-6, 9, 9, -5], axis: false, grid: false,
      aria: 'Tam giác vuông với ba hình vuông dựng trên ba cạnh, hoặc hình vuông ghép từ bốn tam giác',
      hint: 'Kéo các điểm tô màu · Cuộn để phóng to · Shift + kéo để dời' });

    function refresh() {
      var c = Math.hypot(st.a, st.b);
      setOut('a', f(st.a)); setOut('b', f(st.b)); setOut('c', f(c));
      setOut('a2', f(st.a * st.a)); setOut('b2', f(st.b * st.b)); setOut('sum', f(st.a * st.a + st.b * st.b)); setOut('c2', f(c * c));
      playBtn.textContent = st.mode === 'ghep' && st.t >= 0.5 ? '◀ Ghép lại' : '▶ Ghép hình';
      note.textContent = st.mode === 'sq'
        ? 'Diện tích hình vuông trên cạnh huyền bằng tổng diện tích hai hình vuông trên hai cạnh góc vuông.'
        : (st.t < 0.02 ? 'Phần trống (màu xanh) là một hình vuông cạnh c: diện tích c².'
          : st.t > 0.98 ? 'Phần trống là hai hình vuông cạnh a và b: diện tích a² + b². Bốn tam giác không đổi nên c² = a² + b².'
          : 'Bốn tam giác đang trượt (chỉ tịnh tiến, không đổi hình dạng)…');
      if (B && B.board) B.board.update();
    }
    function fit() {
      if (!B || !B.board) return;
      var a = st.a, b = st.b, s = a + b, bb;
      if (st.mode === 'sq') bb = [-b, a + b, -a, a + b]; else bb = [0, s, 0, s];
      var p = 0.12 * Math.max(bb[1] - bb[0], bb[3] - bb[2]);
      setBB(B, [bb[0] - p, bb[3] + p, bb[1] + p, bb[2] - 1.8 * p]);
    }
    function poly(board, pts, fill, stroke, extra) {
      var P = pts.map(function (q) { return board.create('point', q, { visible: false, fixed: true, withLabel: false }); });
      return board.create('polygon', P, Object.assign({ fillColor: fill, fillOpacity: 1, borders: { strokeColor: stroke, strokeWidth: 2, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false }, extra || {}));
    }
    function txt(board, xy, s, color, extra) {
      return board.create('text', [xy[0], xy[1], s], Object.assign({ anchorX: 'middle', anchorY: 'middle', strokeColor: color, fixed: true, fontSize: 16, highlight: false }, extra || {}));
    }

    function draw(board, C) {
      var a = function () { return st.a; }, b = function () { return st.b; };
      if (st.mode === 'sq') {
        // tam giác vuông tại C(0;0), B(a;0), A(0;b)
        poly(board, [[0, 0], [function () { return st.a; }, 0], [function () { return st.a; }, function () { return -st.a; }], [0, function () { return -st.a; }]], C.fillBlue, C.blue);
        poly(board, [[0, 0], [0, function () { return st.b; }], [function () { return -st.b; }, function () { return st.b; }], [function () { return -st.b; }, 0]], C.fillGreen, C.green);
        poly(board, [[function () { return st.a; }, 0], [0, function () { return st.b; }], [function () { return st.b; }, function () { return st.a + st.b; }], [function () { return st.a + st.b; }, function () { return st.a; }]], C.fillPurple, C.purple);
        poly(board, [[0, 0], [function () { return st.a; }, 0], [0, function () { return st.b; }]], C.fillOrange, C.orange);
        var m = function () { return Math.min(0.5, 0.15 * Math.min(st.a, st.b)); };
        poly(board, [[0, 0], [m, 0], [m, m], [0, m]], 'none', C.text, { borders: { strokeColor: C.text, strokeWidth: 1.2, fixed: true } });
        board.create('point', [0, 0], { name: 'C', fixed: true, size: 2, color: C.muted, label: { offset: [-16, -12] } });
        var PB = board.create('point', [st.a, 0], { name: 'B', size: 5, color: C.blue, label: { offset: [6, -14] } });
        var PA = board.create('point', [0, st.b], { name: 'A', size: 5, color: C.green, label: { offset: [-18, 8] } });
        PB.on('drag', function () { st.a = Math.round(10 * Math.max(0.5, Math.min(12, PB.X()))) / 10; PB.moveTo([st.a, 0]); sa.set(st.a); refresh(); });
        PA.on('drag', function () { st.b = Math.round(10 * Math.max(0.5, Math.min(12, PA.Y()))) / 10; PA.moveTo([0, st.b]); sb.set(st.b); refresh(); });
        PB.on('up', fit); PA.on('up', fit);
        txt(board, [function () { return st.a / 2; }, function () { return -st.a / 2; }], function () { return 'a² = ' + f(st.a * st.a); }, C.blue);
        txt(board, [function () { return -st.b / 2; }, function () { return st.b / 2; }], function () { return 'b² = ' + f(st.b * st.b); }, C.green);
        txt(board, [function () { return (st.a + st.b) / 2; }, function () { return (st.a + st.b) / 2; }], function () { return 'c² = ' + f(st.a * st.a + st.b * st.b); }, C.purple);
        txt(board, [function () { return st.a / 2; }, 0.35], 'a', C.text, { fontSize: 15 });
        txt(board, [0.35, function () { return st.b / 2; }], 'b', C.text, { fontSize: 15 });
        txt(board, [function () { return st.a / 2 - 0.3; }, function () { return st.b / 2 - 0.3; }], 'c', C.text, { fontSize: 15 });
      } else {
        // hình vuông cạnh s = a + b; 4 tam giác chỉ tịnh tiến theo t
        var s = function () { return st.a + st.b; };
        poly(board, [[0, 0], [s, 0], [s, s], [0, s]], C.fillBlue, C.text);
        // [đỉnh góc vuông, hai đỉnh còn lại (theo t = 0)], vectơ tịnh tiến khi t = 1
        var tris = [
          { v: function () { return [[0, 0], [st.a, 0], [0, st.b]]; }, d: function () { return [0, st.a]; } },
          { v: function () { return [[0, s()], [0, st.b], [st.b, s()]]; }, d: function () { return [st.a, -st.b]; } },
          { v: function () { return [[s(), s()], [st.b, s()], [s(), st.a]]; }, d: function () { return [-st.b, 0]; } },
          { v: function () { return [[s(), 0], [s(), st.a], [st.a, 0]]; }, d: function () { return [0, 0]; } }
        ];
        tris.forEach(function (T) {
          var pts = [0, 1, 2].map(function (i) {
            return [function () { return T.v()[i][0] + st.t * T.d()[0]; }, function () { return T.v()[i][1] + st.t * T.d()[1]; }];
          });
          poly(board, pts, C.bg, C.orange);
          poly(board, pts, C.fillOrange, C.orange);
        });
        var vis0 = function () { return st.t < 0.02; }, vis1 = function () { return st.t > 0.98; };
        txt(board, [function () { return s() / 2; }, function () { return s() / 2; }], 'c²', C.blue, { fontSize: 22, visible: vis0 });
        txt(board, [function () { return st.a / 2; }, function () { return st.a / 2; }], 'a²', C.blue, { fontSize: 22, visible: vis1 });
        txt(board, [function () { return st.a + st.b / 2; }, function () { return st.a + st.b / 2; }], 'b²', C.blue, { fontSize: 22, visible: vis1 });
        txt(board, [function () { return st.a / 2; }, function () { return -0.45; }], 'a', C.text, { fontSize: 15, visible: vis0 });
        txt(board, [function () { return st.a + st.b / 2; }, function () { return -0.45; }], 'b', C.text, { fontSize: 15, visible: vis0 });
        var H = board.create('point', [st.a, 0], { name: '', withLabel: false, size: 5, color: C.blue });
        H.on('drag', function () { st.a = Math.round(10 * Math.max(0.5, Math.min(12, H.X()))) / 10; H.moveTo([st.a, 0]); sa.set(st.a); refresh(); });
        H.on('up', fit);
      }
      refresh();
    }
    if (B) {
      B.build(draw); fit();
      ui.loop(function (t) {
        if (!st.playing) return;
        var u = Math.min(1, (t - st.t0) / 2200);
        u = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        st.t = st.dir > 0 ? st.tStart + (1 - st.tStart) * u : st.tStart * (1 - u);
        if ((t - st.t0) >= 2200) { st.playing = false; st.t = st.dir > 0 ? 1 : 0; }
        refresh();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
