/* ch05_phu_nhau.js — Bài 6: Sin và cos của hai góc phụ nhau.
   Tam giác ABC vuông tại A, B̂ = α thì Ĉ = 90° − α. Cạnh AC vừa là cạnh đối của B vừa là cạnh kề của C,
   nên sin α = cos(90° − α), cos α = sin(90° − α), tan α · tan(90° − α) = 1. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;

  /* đặt khung nhìn [x0, y1, x1, y0] giữ tỉ lệ 1:1, mở rộng chiều thiếu (không cắt nội dung) */
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }

  GeoWidget.register('ch05_phu_nhau', function (ui, el) {
    var A0 = +(el.getAttribute('data-alpha') || 32);
    var st = { al: A0, c: 5 };   // c = AB (cố định khi đổi góc), b = AC = c·tan α
    var sA = ui.slider({ label: 'Góc B = α', min: 1, max: 89, step: 0.1, value: st.al, decimals: 1, unit: '°', onInput: function (v) { st.al = v; refresh(); fit(); } });
    var g = ui.group('Cạnh AB (nhập số)');
    var inC = ui.number({ label: 'AB', value: st.c, min: 0.1, max: 100, onChange: function (v) { st.c = v; refresh(); fit(); } }, g);
    var chips = ui.row('Thử nhanh');
    [20, 30, 45, 60, 70].forEach(function (a) { ui.button(chips, a + '°', function () { st.al = a; sA.set(a); refresh(); fit(); }, 'chip'); });
    var setOut = ui.readout([['ang', 'α và 90° − α'], ['s1', 'sin α'], ['c2', 'cos(90° − α)'], ['c1', 'cos α'], ['s2', 'sin(90° − α)'], ['t1', 'tan α'], ['t2', 'tan(90° − α)'], ['tt', 'tan α · tan(90° − α)']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Cạnh AC (đỏ) là cạnh đối của góc B nhưng là cạnh kề của góc C; cạnh AB (xanh) thì ngược lại. Vì vậy sin của góc này bằng cos của góc kia.';
    var pts = null;
    var B = GeoWidget.board2d(ui, { bbox: [-1, 5, 6, -1.5], ratio: 0.8, aria: 'Tam giác vuông với hai góc nhọn phụ nhau' });
    function bb() { return st.c * Math.tan(st.al * RAD); }
    function fit() { if (!B || !B.board) return; var b = bb(), m = Math.max(b, st.c), p = 0.2 * m; setBB(B, [-p * 1.4, b + p, st.c + p * 1.2, -1.6 * p]); }
    function refresh() {
      var a = st.al * RAD, b = 90 - st.al;
      setOut('ang', f(st.al, 1) + '° và ' + f(b, 1) + '°');
      setOut('s1', f(Math.sin(a), 4)); setOut('c2', f(Math.cos(b * RAD), 4));
      setOut('c1', f(Math.cos(a), 4)); setOut('s2', f(Math.sin(b * RAD), 4));
      setOut('t1', f(Math.tan(a), 4)); setOut('t2', f(Math.tan(b * RAD), 4)); setOut('tt', f(Math.tan(a) * Math.tan(b * RAD), 4));
      if (pts) {
        if (Math.abs(pts.B.X() - st.c) > 1e-9 || Math.abs(pts.B.Y()) > 1e-9) pts.B.setPositionDirectly(JXG.COORDS_BY_USER, [st.c, 0]);
        if (Math.abs(pts.C.Y() - bb()) > 1e-9 || Math.abs(pts.C.X()) > 1e-9) pts.C.setPositionDirectly(JXG.COORDS_BY_USER, [0, bb()]);
      }
      if (B && B.board) B.board.update();
    }
    function draw(board, C) {
      var A = board.create('point', [0, 0], { name: 'A', fixed: true, size: 3, color: C.muted, label: { offset: [-16, -12] } });
      var PB = board.create('point', [st.c, 0], { name: 'B', size: 5, color: C.blue, label: { offset: [6, -14] } });
      var PC = board.create('point', [0, bb()], { name: 'C', size: 5, color: C.red, label: { offset: [-18, 8] } });
      pts = { B: PB, C: PC };
      board.create('polygon', [A, PB, PC], { fillColor: C.bg, fillOpacity: 0.6, borders: { visible: false }, vertices: { visible: false }, fixed: true, highlight: false });
      board.create('segment', [A, PC], { strokeColor: C.red, strokeWidth: 5, fixed: true, highlight: false });
      board.create('segment', [A, PB], { strokeColor: C.blue, strokeWidth: 5, fixed: true, highlight: false });
      board.create('segment', [PB, PC], { strokeColor: C.purple, strokeWidth: 3, fixed: true, highlight: false });
      var m = function () { return Math.min(st.c, bb()); };
      board.create('angle', [PB, A, PC], { radius: function () { return 0.12 * m(); }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
      board.create('nonreflexangle', [PC, PB, A], { radius: function () { return 0.3 * m(); }, name: 'α', fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
      board.create('nonreflexangle', [A, PC, PB], { radius: function () { return 0.3 * m(); }, name: '90° − α', fillColor: C.fillGreen, strokeColor: C.green, fixed: true, label: { strokeColor: C.green } });
      var M = function () { return Math.max(st.c, bb()); };
      board.create('text', [function () { return -0.04 * M(); }, function () { return bb() / 2; }, function () { return 'AC = ' + f(bb()); }], { strokeColor: C.red, fixed: true, anchorX: 'right' });
      board.create('text', [function () { return st.c / 2; }, function () { return -0.05 * M(); }, function () { return 'AB = ' + f(st.c); }], { strokeColor: C.blue, fixed: true, anchorX: 'middle', anchorY: 'top' });
      board.create('text', [function () { return st.c / 2 + 0.03 * M(); }, function () { return bb() / 2 + 0.03 * M(); }, function () { return 'BC = ' + f(Math.hypot(st.c, bb())); }], { strokeColor: C.purple, fixed: true, anchorX: 'left', anchorY: 'bottom' });
      PB.on('drag', function () { st.c = Math.max(0.1, PB.X()); PB.moveTo([st.c, 0]); inC.value = +st.c.toFixed(2); PC.moveTo([0, bb()]); refresh(); });
      PC.on('drag', function () { var y = Math.max(0.01, PC.Y()); st.al = Math.round(10 * Math.max(1, Math.min(89, Math.atan2(y, st.c) / RAD))) / 10; PC.moveTo([0, bb()]); sA.set(st.al); refresh(); });
      PB.on('up', fit); PC.on('up', fit);
      refresh();
    }
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return st; };
  });
})();
