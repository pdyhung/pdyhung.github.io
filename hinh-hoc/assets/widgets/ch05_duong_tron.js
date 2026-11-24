/* ch05_duong_tron.js — Bài 4: Đường tròn đơn vị.
   Kéo điểm P trên đường tròn bán kính 1 (hoặc nhập góc θ): OP = 1 là cạnh huyền,
   đoạn PH (đỏ) = sin θ, đoạn OH (xanh) = cos θ, đoạn AT trên tiếp tuyến tại A (xanh lá) = tan θ. */
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

  GeoWidget.register('ch05_duong_tron', function (ui, el) {
    var T0 = +(el.getAttribute('data-theta') || 35);
    var st = { th: T0, playing: false, t0: 0, from: 0 };
    var sT = ui.slider({ label: 'Góc θ', min: 1, max: 89, step: 0.1, value: st.th, decimals: 1, unit: '°', onInput: function (v) { st.th = v; st.playing = false; refresh(); } });
    var row = ui.row();
    var playBtn = ui.button(row, '▶ Quét góc', function () { st.playing = !st.playing; st.t0 = performance.now(); st.from = st.th; refresh(); });
    ui.button(row, '↺ Đặt lại', function () { st.playing = false; st.th = T0; sT.set(st.th); B.resetView(); B.build(draw); fit(); }, 'btn secondary');
    var chips = ui.row('Góc đặc biệt');
    [30, 45, 60].forEach(function (a) { ui.button(chips, a + '°', function () { st.playing = false; st.th = a; sT.set(a); refresh(); }, 'chip'); });
    var setOut = ui.readout([['th', 'θ'], ['sin', 'sin θ = PH'], ['cos', 'cos θ = OH'], ['tan', 'tan θ = AT'], ['q', 'sin θ : cos θ'], ['pyt', 'sin²θ + cos²θ']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Tam giác OHP vuông tại H có cạnh huyền OP = 1, nên sin θ = PH : 1 = PH và cos θ = OH. Tam giác OAT đồng dạng với OHP, có OA = 1, nên tan θ = AT.';

    var P = null;
    var B = GeoWidget.board2d(ui, { bbox: [-0.35, 1.9, 1.75, -0.45], ratio: 0.85, aria: 'Đường tròn đơn vị với các đoạn sin, cos, tan của góc θ',
      hint: 'Kéo điểm P trên đường tròn · Cuộn để phóng to · Shift + kéo để dời' });
    function fit() { if (B && B.board) setBB(B, [-0.3, 1.85, 1.7, -0.42]); }

    function refresh() {
      var t = st.th * RAD, s = Math.sin(t), c = Math.cos(t);
      setOut('th', f(st.th, 1) + '°'); setOut('sin', f(s, 4)); setOut('cos', f(c, 4)); setOut('tan', f(Math.tan(t), 4) + (Math.tan(t) > 1.8 ? ' (T ra ngoài khung)' : ''));
      setOut('q', f(s / c, 4)); setOut('pyt', f(s * s + c * c, 4));
      playBtn.textContent = st.playing ? '⏸ Dừng' : '▶ Quét góc';
      if (P && (Math.abs(P.X() - c) > 1e-9 || Math.abs(P.Y() - s) > 1e-9)) P.setPositionDirectly(JXG.COORDS_BY_USER, [c, s]);
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var cs = function () { return Math.cos(st.th * RAD); }, sn = function () { return Math.sin(st.th * RAD); }, tn = function () { return Math.tan(st.th * RAD); };
      var O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 2, color: C.muted, label: { offset: [-16, -12] } });
      var A = board.create('point', [1, 0], { name: 'A', fixed: true, size: 2, color: C.muted, label: { offset: [6, -14] } });
      board.create('circle', [O, 1], { strokeColor: C.muted, strokeWidth: 1, dash: 2, fixed: true, highlight: false });
      var Y1 = board.create('point', [0, 1], { visible: false, fixed: true, withLabel: false });
      board.create('arc', [O, A, Y1], { strokeColor: C.text, strokeWidth: 1.5, fixed: true, highlight: false });
      board.create('line', [[1, 0], [1, 1]], { strokeColor: C.muted, dash: 2, strokeWidth: 1, fixed: true, highlight: false });
      board.create('line', [[-1, 0], [1, 0]], { strokeColor: C.border, strokeWidth: 1, fixed: true, highlight: false });
      board.create('line', [[0, -1], [0, 1]], { strokeColor: C.border, strokeWidth: 1, fixed: true, highlight: false });
      var H = board.create('point', [cs, 0], { name: 'H', fixed: true, size: 2, color: C.muted, label: { offset: [-4, -16] } });
      var T = board.create('point', [1, tn], { name: 'T', fixed: true, size: 3, color: C.green, label: { offset: [8, 0] } });
      board.create('segment', [O, T], { strokeColor: C.muted, dash: 2, strokeWidth: 1.2, fixed: true, highlight: false });
      P = board.create('point', [cs(), sn()], { name: 'P', size: 5, color: C.purple, label: { offset: [-10, 12] } });
      board.create('polygon', [O, H, P], { fillColor: C.fillPurple, fillOpacity: 1, borders: { visible: false }, vertices: { visible: false }, fixed: true, highlight: false });
      board.create('segment', [O, P], { strokeColor: C.purple, strokeWidth: 2.5, fixed: true, highlight: false });
      board.create('segment', [H, P], { strokeColor: C.red, strokeWidth: 4, fixed: true, highlight: false });
      board.create('segment', [O, H], { strokeColor: C.blue, strokeWidth: 4, fixed: true, highlight: false });
      board.create('segment', [A, T], { strokeColor: C.green, strokeWidth: 4, fixed: true, highlight: false });
      board.create('angle', [P, H, O], { radius: 0.07, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true, visible: function () { return st.th < 86; } });
      board.create('nonreflexangle', [A, O, P], { radius: 0.2, name: 'θ', fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
      board.create('text', [function () { return cs() - 0.02; }, function () { return Math.max(0.05, sn() * 0.3); }, 'sin θ'], { strokeColor: C.red, fixed: true, fontSize: 15, anchorX: 'right', anchorY: 'middle', cssStyle: 'white-space:nowrap' });
      board.create('text', [function () { return cs() / 2; }, -0.04, 'cos θ'], { strokeColor: C.blue, fixed: true, fontSize: 15, anchorX: 'middle', anchorY: 'top' });
      board.create('text', [1.04, function () { return Math.min(tn(), 1.75) / 2; }, 'tan θ'], { strokeColor: C.green, fixed: true, fontSize: 15 });
      board.create('text', [function () { return cs() / 2 - 0.05; }, function () { return sn() / 2 + 0.05; }, '1'], { strokeColor: C.purple, fixed: true, fontSize: 15, anchorX: 'right' });
      P.on('drag', function () {
        var a = Math.atan2(P.Y(), P.X()) / RAD; st.th = Math.round(10 * Math.max(1, Math.min(89, a))) / 10; st.playing = false;
        P.moveTo([Math.cos(st.th * RAD), Math.sin(st.th * RAD)]); sT.set(st.th); refresh();
      });
      refresh();
    }
    if (B) {
      B.build(draw); fit();
      ui.loop(function (t) {
        if (!st.playing) return;
        // đi từ góc hiện tại tới 89°, rồi quay về 1°, lặp lại (chu kỳ 8 giây)
        var ph = ((t - st.t0) / 8000 + (st.from - 1) / 176) % 1, a = ph < 0.5 ? 1 + 176 * ph : 1 + 176 * (1 - ph);
        st.th = Math.round(a * 10) / 10; sT.set(st.th); refresh();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
