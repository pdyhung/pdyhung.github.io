/* ch05_dao.js — Bài 1: Định lý Pythagore đảo.
   Nhập ba độ dài a = BC, b = CA, c = AB (hoặc kéo đỉnh C, đỉnh B); so sánh bình phương cạnh lớn nhất
   với tổng bình phương hai cạnh kia → tam giác vuông, nhọn hay tù. */
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
  var DEG = 180 / Math.PI;

  GeoWidget.register('ch05_dao', function (ui, el) {
    var init = (el.getAttribute('data-sides') || '5,12,13').split(',').map(Number);
    var st = { a: init[0], b: init[1], c: init[2] };

    var g = ui.group('Ba cạnh (nhập số)');
    var inA = ui.number({ label: 'a = BC', value: st.a, min: 0.1, max: 100, onChange: function (v) { st.a = v; redraw(); } }, g);
    var inB = ui.number({ label: 'b = CA', value: st.b, min: 0.1, max: 100, onChange: function (v) { st.b = v; redraw(); } }, g);
    var inC = ui.number({ label: 'c = AB', value: st.c, min: 0.1, max: 100, onChange: function (v) { st.c = v; redraw(); } }, g);
    var chips = ui.row('Thử nhanh');
    [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [4, 5, 6], [2, 3, 4]].forEach(function (p) {
      ui.button(chips, p.join('; '), function () { st.a = p[0]; st.b = p[1]; st.c = p[2]; sync(); redraw(); }, 'chip');
    });
    var setOut = ui.readout([['max', 'Cạnh lớn nhất'], ['sq', 'Bình phương của nó'], ['sum', 'Tổng bình phương hai cạnh kia'], ['ang', 'Góc lớn nhất']]);
    var kl = document.createElement('div'); kl.className = 'ctl-note'; kl.style.cssText = 'font-size:15px;font-weight:600;color:var(--text)'; ui.side.appendChild(kl);

    var B = GeoWidget.board2d(ui, { ratio: 0.85, bbox: [-2, 14, 15, -3], aria: 'Tam giác ABC dựng từ ba cạnh đã nhập' });

    function sync() { inA.value = +st.a.toFixed(2); inB.value = +st.b.toFixed(2); inC.value = +st.c.toFixed(2); [inA, inB, inC].forEach(function (i) { i.classList.remove('invalid'); }); }
    function valid() { var a = st.a, b = st.b, c = st.c; return a + b > c + 1e-12 && b + c > a + 1e-12 && c + a > b + 1e-12; }
    // C theo định lý côsin: A(0;0), B(c;0)
    function posC() { var x = (st.b * st.b + st.c * st.c - st.a * st.a) / (2 * st.c); return [x, Math.sqrt(Math.max(0, st.b * st.b - x * x))]; }
    function analyse() {
      var s = [['a', st.a, 'A'], ['b', st.b, 'B'], ['c', st.c, 'C']].sort(function (p, q) { return q[1] - p[1]; });
      var M = s[0], big = M[1] * M[1], sum = s[1][1] * s[1][1] + s[2][1] * s[2][1];
      var eq = Math.abs(big - sum) <= 1e-9 * Math.max(1, big);
      var cosv = (sum - big) / (2 * s[1][1] * s[2][1]);
      return { M: M, big: big, sum: sum, eq: eq, ang: Math.acos(Math.max(-1, Math.min(1, cosv))) * DEG, kind: eq ? 'vuông' : (big < sum ? 'nhọn' : 'tù') };
    }
    function refresh() {
      if (!valid()) {
        ['max', 'sq', 'sum', 'ang'].forEach(function (k) { setOut(k, '—'); });
        kl.textContent = 'Không có tam giác: cạnh lớn nhất phải nhỏ hơn tổng hai cạnh kia.'; return;
      }
      var r = analyse();
      setOut('max', r.M[0] + ' = ' + f(r.M[1]));
      setOut('sq', f(r.M[1] * r.M[1], 4)); setOut('sum', f(r.sum, 4));
      var o = ['a', 'b', 'c'].filter(function (k) { return k !== r.M[0]; }), rel = r.eq ? ' = ' : (r.kind === 'nhọn' ? ' < ' : ' > ');
      kl.textContent = r.M[0] + '²' + rel + o[0] + '² + ' + o[1] + '² → ' + (r.eq ? 'tam giác vuông tại ' + r.M[2] : r.kind === 'nhọn' ? 'tam giác nhọn (không vuông)' : 'tam giác tù tại ' + r.M[2]) + '.';
      setOut('ang', r.M[2] + '̂ ≈ ' + f(r.ang, 2) + '°');
    }
    function fit() {
      if (!B || !B.board || !valid()) return;
      var p = posC(), xs = [0, st.c, p[0]], ys = [0, p[1]];
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y1 = Math.max.apply(null, ys), pad = 0.15 * Math.max(x1 - x0, y1);
      setBB(B, [x0 - pad, y1 + pad, x1 + pad, -1.6 * pad]);
    }
    function redraw() { B && B.build(draw); fit(); refresh(); }

    function draw(board, C) {
      if (!valid()) { board.create('text', [0, 0, 'Ba độ dài này không tạo thành tam giác.'], { strokeColor: C.red, fixed: true }); return; }
      var p = posC();
      var PA = board.create('point', [0, 0], { name: 'A', fixed: true, size: 3, color: C.muted, label: { offset: [-16, -12] } });
      var PB = board.create('point', [st.c, 0], { name: 'B', size: 5, color: C.blue, label: { offset: [6, -14] } });
      var PC = board.create('point', p, { name: 'C', size: 5, color: C.orange, label: { offset: [6, 10] } });
      board.create('polygon', [PA, PB, PC], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false }, highlight: false });
      var mid = function (P, Q, k) { return [function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }, k]; };
      board.create('text', mid(PB, PC, function () { return 'a = ' + f(st.a); }), { strokeColor: C.text, fixed: true, anchorX: 'left' });
      board.create('text', mid(PA, PC, function () { return 'b = ' + f(st.b); }), { strokeColor: C.text, fixed: true, anchorX: 'right' });
      board.create('text', mid(PA, PB, function () { return 'c = ' + f(st.c); }), { strokeColor: C.text, fixed: true, anchorX: 'middle', anchorY: 'top' });
      // đánh dấu góc vuông nếu có
      var verts = { A: PA, B: PB, C: PC };
      var r = analyse();
      if (r.eq) {
        var V = verts[r.M[2]], others = ['A', 'B', 'C'].filter(function (k) { return k !== r.M[2]; }).map(function (k) { return verts[k]; });
        board.create('nonreflexangle', [others[0], V, others[1]], { radius: 0.12 * Math.min(st.a, st.b, st.c), orthoType: 'square', fillColor: C.fillGreen, strokeColor: C.green, name: '', withLabel: false, fixed: true });
      }
      PC.on('drag', function () {
        if (PC.Y() < 0.05) PC.moveTo([PC.X(), 0.05]);
        st.b = Math.hypot(PC.X(), PC.Y()); st.a = Math.hypot(PC.X() - st.c, PC.Y()); sync(); refresh();
      });
      PB.on('drag', function () {
        var x = Math.max(0.1, PB.X()); PB.moveTo([x, 0]); st.c = x; st.a = Math.hypot(PC.X() - st.c, PC.Y()); sync(); refresh();
      });
      var up = function () { B.build(draw); refresh(); };
      PC.on('up', up); PB.on('up', up);
    }
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return st; };
  });
})();
