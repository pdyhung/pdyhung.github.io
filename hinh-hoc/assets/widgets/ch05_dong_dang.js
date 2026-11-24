/* ch05_dong_dang.js — Bài 3: Tỉ số trong tam giác vuông đồng dạng.
   Hai tam giác vuông AB₁C₁, AB₂C₂ (vuông tại B₁, B₂) có chung góc nhọn α tại A.
   Kéo B₁, B₂ (đổi độ lớn) → các tỉ số không đổi; kéo C₂ (đổi góc α) → các tỉ số đổi. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }

  GeoWidget.register('ch05_dong_dang', function (ui, el) {
    var D0 = { alpha: +(el.getAttribute('data-alpha') || 35), k1: 3, k2: 7 };
    var st = { alpha: D0.alpha, k1: D0.k1, k2: D0.k2 };

    var sA = ui.slider({ label: 'Góc nhọn α tại A', min: 5, max: 75, step: 0.1, value: st.alpha, decimals: 1, unit: '°', onInput: function (v) { st.alpha = v; refresh(); fit(); } });
    var g = ui.group('Độ dài cạnh kề (nhập số)');
    var in1 = ui.number({ label: 'AB₁ (tam giác nhỏ)', value: st.k1, min: 0.2, max: 50, onChange: function (v) { st.k1 = v; refresh(); fit(); } }, g);
    var in2 = ui.number({ label: 'AB₂ (tam giác lớn)', value: st.k2, min: 0.2, max: 50, onChange: function (v) { st.k2 = v; refresh(); fit(); } }, g);
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { st.alpha = D0.alpha; st.k1 = D0.k1; st.k2 = D0.k2; sA.set(st.alpha); in1.value = st.k1; in2.value = st.k2; refresh(); fit(); }, 'btn secondary');
    var setOut = ui.readout([['al', 'Góc α'], ['k', 'Tỉ số đồng dạng AB₂ : AB₁']]);
    var tb = document.createElement('table'); tb.className = 'ch05-tb'; tb.style.cssText = 'margin:0;font-size:14px;width:100%';
    var ROWS = [['adj', 'Cạnh kề AB'], ['opp', 'Cạnh đối BC'], ['hyp', 'Cạnh huyền AC'], ['r1', 'đối : huyền'], ['r2', 'kề : huyền'], ['r3', 'đối : kề']], cell = {};
    tb.innerHTML = '<tr><th></th><th>Nhỏ</th><th>Lớn</th></tr>';
    ROWS.forEach(function (r) { var tr = document.createElement('tr'); tr.innerHTML = '<td>' + r[1] + '</td><td class="v1"></td><td class="v2"></td>'; tb.appendChild(tr); cell[r[0]] = [tr.children[1], tr.children[2]]; if (r[0] === 'r1') tr.style.borderTop = '2px solid var(--border)'; });
    [].forEach.call(tb.querySelectorAll('td,th'), function (c) { c.style.padding = '3px 8px'; });
    ui.side.appendChild(tb);
    function setRow(k, a, b) { cell[k][0].textContent = a; cell[k][1].textContent = b; }
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Kéo B₁ hoặc B₂: hai tam giác to nhỏ khác nhau nhưng ba tỉ số giữ nguyên. Kéo C₂ lên xuống: góc α đổi, các tỉ số mới đổi theo.';

    var pts = null;
    var B = GeoWidget.board2d(ui, { bbox: [-1, 6, 9, -2], ratio: 0.8, aria: 'Hai tam giác vuông đồng dạng có chung góc nhọn tại A' });

    function tri(k) { var t = Math.tan(st.alpha * RAD); return { adj: k, opp: k * t, hyp: k / Math.cos(st.alpha * RAD) }; }
    function refresh() {
      var a = tri(st.k1), b = tri(st.k2);
      setOut('al', f(st.alpha, 1) + '°'); setOut('k', f(st.k2 / st.k1, 3));
      setRow('adj', f(a.adj), f(b.adj)); setRow('opp', f(a.opp), f(b.opp)); setRow('hyp', f(a.hyp), f(b.hyp));
      setRow('r1', f(a.opp / a.hyp, 4), f(b.opp / b.hyp, 4)); setRow('r2', f(a.adj / a.hyp, 4), f(b.adj / b.hyp, 4)); setRow('r3', f(a.opp / a.adj, 4), f(b.opp / b.adj, 4));
      if (pts) {
        var t = Math.tan(st.alpha * RAD), sp = function (P, x, y) { if (Math.abs(P.X() - x) > 1e-9 || Math.abs(P.Y() - y) > 1e-9) P.setPositionDirectly(JXG.COORDS_BY_USER, [x, y]); };
        sp(pts.B1, st.k1, 0); sp(pts.B2, st.k2, 0); sp(pts.C2, st.k2, st.k2 * t);
      }
      if (B && B.board) B.board.update();
    }
    function fit() {
      if (!B || !B.board) return;
      var m = Math.max(st.k1, st.k2), h = m * Math.tan(st.alpha * RAD), p = 0.14 * Math.max(m, h);
      setBB(B, [-p, h + p, m + 1.6 * p, -1.6 * p]);
    }

    function draw(board, C) {
      var tn = function () { return Math.tan(st.alpha * RAD); };
      var A = board.create('point', [0, 0], { name: 'A', fixed: true, size: 3, color: C.muted, label: { offset: [-16, -12] } });
      var B2 = board.create('point', [st.k2, 0], { name: 'B₂', size: 5, color: C.orange, label: { offset: [4, -16] } });
      var C2 = board.create('point', [st.k2, st.k2 * tn()], { name: 'C₂', size: 5, color: C.purple, label: { offset: [6, 6] } });
      var B1 = board.create('point', [st.k1, 0], { name: 'B₁', size: 5, color: C.blue, label: { offset: [4, -16] } });
      var C1 = board.create('point', [function () { return st.k1; }, function () { return st.k1 * tn(); }], { name: 'C₁', size: 3, color: C.blue, fixed: true, label: { offset: [-22, 8] } });
      var P2 = board.create('polygon', [A, B2, C2], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
      board.create('polygon', [A, B1, C1], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
      var rs = function (k) { return function () { return Math.min(0.5, 0.12 * Math.min(st.k1, st.k2)) ; }; };
      board.create('angle', [C2, B2, A], { radius: rs(), orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
      board.create('angle', [C1, B1, A], { radius: rs(), orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
      board.create('nonreflexangle', [B2, A, C2], { radius: function () { return 0.35 * Math.min(st.k1, st.k2); }, name: 'α', fillColor: C.fillGreen, strokeColor: C.green, fixed: true, label: { strokeColor: C.green } });
      board.create('text', [function () { return st.k2 + 0.15; }, function () { return st.k2 * tn() / 2; }, function () { return f(st.k2 * tn()); }], { strokeColor: C.orange, fixed: true });
      board.create('text', [function () { return (st.k2 + st.k1) / 2; }, function () { return -0.05 * st.k2; }, function () { return 'AB₂ = ' + f(st.k2); }], { strokeColor: C.orange, fixed: true, anchorX: 'middle', anchorY: 'top' });
      B1.on('drag', function () { st.k1 = Math.max(0.2, B1.X()); B1.moveTo([st.k1, 0]); in1.value = +st.k1.toFixed(2); refresh(); });
      B2.on('drag', function () { st.k2 = Math.max(0.2, B2.X()); B2.moveTo([st.k2, 0]); C2.moveTo([st.k2, st.k2 * tn()]); in2.value = +st.k2.toFixed(2); refresh(); });
      C2.on('drag', function () {
        var a = Math.atan2(C2.Y(), st.k2) / RAD; st.alpha = Math.round(10 * Math.max(5, Math.min(75, a))) / 10;
        C2.moveTo([st.k2, st.k2 * tn()]); sA.set(st.alpha); refresh();
      });
      pts = { B1: B1, B2: B2, C2: C2 };
      [B1, B2, C2].forEach(function (p) { p.on('up', fit); });
      refresh();
    }
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return st; };
  });
})();
