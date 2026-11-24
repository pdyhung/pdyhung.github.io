/* ch05_ti_so.js — Bài 4: Tỉ số lượng giác của góc nhọn.
   Tam giác ABC vuông tại A. Chọn góc nhọn B hoặc C; cạnh đối (đỏ), cạnh kề (xanh), cạnh huyền (tím) đổi màu theo góc đã chọn.
   Kéo B, C hoặc nhập AB, AC → sin, cos, tan. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var DEG = 180 / Math.PI;

  /* đặt khung nhìn [x0, y1, x1, y0] giữ tỉ lệ 1:1, mở rộng chiều thiếu (không cắt nội dung) */
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }

  GeoWidget.register('ch05_ti_so', function (ui, el) {
    var st = { c: +(el.getAttribute('data-ab') || 4), b: +(el.getAttribute('data-ac') || 3), ref: el.getAttribute('data-ref') || 'B' };
    ui.select({ label: 'Góc nhọn đang xét', value: st.ref, options: [['B', 'Góc B'], ['C', 'Góc C']], onChange: function (v) { st.ref = v; B.build(draw); } });
    var g = ui.group('Hai cạnh góc vuông (nhập số)');
    var inC = ui.number({ label: 'AB', value: st.c, min: 0.1, max: 100, onChange: function (v) { st.c = v; refresh(); fit(); } }, g);
    var inB = ui.number({ label: 'AC', value: st.b, min: 0.1, max: 100, onChange: function (v) { st.b = v; refresh(); fit(); } }, g);
    var setOut = ui.readout([['ang', 'Số đo góc'], ['opp', 'Cạnh đối'], ['adj', 'Cạnh kề'], ['hyp', 'Cạnh huyền'], ['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Cạnh đối và cạnh kề phụ thuộc vào góc đang xét; cạnh huyền thì luôn là BC (đối diện góc vuông).';
    var pts = null;
    var B = GeoWidget.board2d(ui, { bbox: [-1, 5, 6, -1.5], ratio: 0.8, aria: 'Tam giác vuông với cạnh đối, cạnh kề, cạnh huyền tô màu' });
    function fit() { if (!B || !B.board) return; var m = Math.max(st.b, st.c), p = 0.2 * m; setBB(B, [-p * 1.3, st.b + p, st.c + p * 1.3, -1.7 * p]); }

    function names() { return st.ref === 'B' ? { opp: ['AC', st.b], adj: ['AB', st.c] } : { opp: ['AB', st.c], adj: ['AC', st.b] }; }
    function refresh() {
      var a = Math.hypot(st.b, st.c), n = names(), R = st.ref;
      var ang = (R === 'B' ? Math.atan2(st.b, st.c) : Math.atan2(st.c, st.b)) * DEG;
      setOut('ang', R + '̂ ≈ ' + f(ang, 2) + '°');
      setOut('opp', n.opp[0] + ' = ' + f(n.opp[1])); setOut('adj', n.adj[0] + ' = ' + f(n.adj[1])); setOut('hyp', 'BC = ' + f(a));
      setOut('sin', 'sin ' + R + ' = ' + n.opp[0] + '/BC ≈ ' + f(n.opp[1] / a, 4));
      setOut('cos', 'cos ' + R + ' = ' + n.adj[0] + '/BC ≈ ' + f(n.adj[1] / a, 4));
      setOut('tan', 'tan ' + R + ' = ' + n.opp[0] + '/' + n.adj[0] + ' ≈ ' + f(n.opp[1] / n.adj[1], 4));
      if (pts) {
        if (Math.abs(pts.B.X() - st.c) > 1e-9 || Math.abs(pts.B.Y()) > 1e-9) pts.B.setPositionDirectly(JXG.COORDS_BY_USER, [st.c, 0]);
        if (Math.abs(pts.C.Y() - st.b) > 1e-9 || Math.abs(pts.C.X()) > 1e-9) pts.C.setPositionDirectly(JXG.COORDS_BY_USER, [0, st.b]);
      }
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var A = board.create('point', [0, 0], { name: 'A', fixed: true, size: 3, color: C.muted, label: { offset: [-16, -12] } });
      var PB = board.create('point', [st.c, 0], { name: 'B', size: 5, color: C.blue, label: { offset: [6, -14] } });
      var PC = board.create('point', [0, st.b], { name: 'C', size: 5, color: C.blue, label: { offset: [-18, 8] } });
      pts = { B: PB, C: PC };
      board.create('polygon', [A, PB, PC], { fillColor: C.bg, fillOpacity: 0.6, borders: { visible: false }, vertices: { visible: false }, fixed: true, highlight: false });
      var isB = st.ref === 'B', oppS = isB ? [A, PC] : [A, PB], adjS = isB ? [A, PB] : [A, PC];
      board.create('segment', oppS, { strokeColor: C.red, strokeWidth: 5, fixed: true, highlight: false });
      board.create('segment', adjS, { strokeColor: C.blue, strokeWidth: 5, fixed: true, highlight: false });
      board.create('segment', [PB, PC], { strokeColor: C.purple, strokeWidth: 5, fixed: true, highlight: false });
      board.create('angle', [PB, A, PC], { radius: function () { return 0.12 * Math.min(st.b, st.c); }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
      if (isB) board.create('nonreflexangle', [PC, PB, A], { radius: function () { return 0.25 * Math.min(st.b, st.c); }, name: 'B̂', fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
      else board.create('nonreflexangle', [A, PC, PB], { radius: function () { return 0.25 * Math.min(st.b, st.c); }, name: 'Ĉ', fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
      var lab = function (x, y, s, col, o) { return board.create('text', [x, y, s], Object.assign({ strokeColor: col, fixed: true, fontSize: 15 }, o || {})); };
      lab(function () { return st.c / 2; }, function () { return -0.06 * Math.max(st.b, st.c); }, function () { return (isB ? 'cạnh kề ' : 'cạnh đối ') + f(st.c); }, isB ? C.blue : C.red, { anchorX: 'middle', anchorY: 'top' });
      lab(function () { return -0.05 * Math.max(st.b, st.c); }, function () { return st.b / 2; }, function () { return (isB ? 'cạnh đối ' : 'cạnh kề ') + f(st.b); }, isB ? C.red : C.blue, { anchorX: 'right' });
      lab(function () { return st.c / 2 + 0.04 * Math.max(st.b, st.c); }, function () { return st.b / 2 + 0.04 * Math.max(st.b, st.c); }, function () { return 'cạnh huyền ' + f(Math.hypot(st.b, st.c)); }, C.purple, { anchorX: 'left', anchorY: 'bottom' });
      PB.on('drag', function () { st.c = Math.max(0.1, PB.X()); PB.moveTo([st.c, 0]); inC.value = +st.c.toFixed(2); refresh(); });
      PC.on('drag', function () { st.b = Math.max(0.1, PC.Y()); PC.moveTo([0, st.b]); inB.value = +st.b.toFixed(2); refresh(); });
      PB.on('up', fit); PC.on('up', fit);
      refresh();
    }
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return st; };
  });
})();
