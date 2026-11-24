/* ch04_bi_a.js — Bài 5: Đường đi của bi trên bàn bi-a (một lần chạm băng).
   Lấy Q′ đối xứng với Q qua băng; điểm chạm I là giao của PQ′ với băng. Hai tam giác vuông tạo bởi P, I, Q với băng đồng dạng (g.g),
   nên PI : IQ = d(P) : d(Q). Kéo bi P, Q hoặc nhập tọa độ; bấm Đánh bi để xem hoạt ảnh. Bàn 10 × 5 (đơn vị dm). */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var W = 10, Ht = 5;
  var CUSH = { bottom: 'Băng dưới', top: 'Băng trên', left: 'Băng trái', right: 'Băng phải' };
  function refl(q, c) { return c === 'bottom' ? [q[0], -q[1]] : c === 'top' ? [q[0], 2 * Ht - q[1]] : c === 'left' ? [-q[0], q[1]] : [2 * W - q[0], q[1]]; }
  function dCush(p, c) { return c === 'bottom' ? p[1] : c === 'top' ? Ht - p[1] : c === 'left' ? p[0] : W - p[0]; }
  function hit(P, Q, c) { var Q2 = refl(Q, c), dp = dCush(P, c), dq = dCush(Q, c), t = dp / (dp + dq); return [P[0] + t * (Q2[0] - P[0]), P[1] + t * (Q2[1] - P[1])]; }
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }

  GeoWidget.register('ch04_bi_a', function (ui, el) {
    function init() { return { P: [2, 1.5], Q: [7, 3.5], c: el.getAttribute('data-cushion') || 'bottom', mirror: true, anim: 0, playing: false, t0: 0 }; }
    var st = init();
    var sel = ui.select({ label: 'Bi chạm vào', value: st.c, options: Object.keys(CUSH).map(function (k) { return [k, CUSH[k]]; }), onChange: function (v) { st.c = v; st.anim = 0; upd(); } });
    var g = ui.group('Vị trí hai bi (nhập tọa độ, dm)');
    var IN = {};
    [['Px', 'Bi cái P: x', 'P', 0, W], ['Py', 'Bi cái P: y', 'P', 1, Ht], ['Qx', 'Bi mục tiêu Q: x', 'Q', 0, W], ['Qy', 'Bi mục tiêu Q: y', 'Q', 1, Ht]].forEach(function (r) {
      IN[r[0]] = ui.number({ label: r[1], value: st[r[2]][r[3]], min: 0.2, max: r[4] - 0.2, onChange: function (v) { st[r[2]][r[3]] = v; st.anim = 0; B.build(draw); } }, g);
    });
    var row = ui.row();
    ui.checkbox('Hiện điểm đối xứng Q′', true, function (v) { st.mirror = v; upd(); }, row);
    var row2 = ui.row();
    ui.button(row2, '▶ Đánh bi', function () { st.playing = true; st.t0 = performance.now(); });
    ui.button(row2, '↺ Đặt lại', function () { var c = st.c; st = init(); st.c = c; ui.side.querySelector('input[type=checkbox]').checked = true; B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['q2', 'Q′ (đối xứng Q)'], ['i', 'Điểm chạm I'], ['d', 'd(P) : d(Q)'], ['pi', 'PI : IQ'], ['g', 'Góc tới ; góc phản xạ'], ['len', 'Quãng đường PI + IQ = PQ′']]);

    function refresh() {
      ['Px', 'Py', 'Qx', 'Qy'].forEach(function (k) { if (document.activeElement !== IN[k]) IN[k].value = +st[k[0]][k[1] === 'x' ? 0 : 1].toFixed(2); });
      var Q2 = refl(st.Q, st.c), I = hit(st.P, st.Q, st.c), dp = dCush(st.P, st.c), dq = dCush(st.Q, st.c);
      out('q2', '(' + f(Q2[0]) + '; ' + f(Q2[1]) + ')');
      out('i', '(' + f(I[0]) + '; ' + f(I[1]) + ')');
      out('d', f(dp) + ' : ' + f(dq) + ' = ' + f(dp / dq, 3));
      out('pi', f(dist(st.P, I)) + ' : ' + f(dist(I, st.Q)) + ' = ' + f(dist(st.P, I) / dist(I, st.Q), 3));
      /* góc giữa đường đi và băng */
      var a1 = Math.asin(dp / dist(st.P, I)) * 180 / Math.PI, a2 = Math.asin(dq / dist(I, st.Q)) * 180 / Math.PI;
      out('g', f(a1, 1) + '° ; ' + f(a2, 1) + '°');
      out('len', f(dist(st.P, I)) + ' + ' + f(dist(I, st.Q)) + ' = ' + f(dist(st.P, Q2)));
    }
    function upd() { refresh(); if (B && B.board) B.board.update(); }
    function ballAt(t) {
      var I = hit(st.P, st.Q, st.c), l1 = dist(st.P, I), l2 = dist(I, st.Q), s = t * (l1 + l2);
      if (s <= l1) return [st.P[0] + (I[0] - st.P[0]) * s / l1, st.P[1] + (I[1] - st.P[1]) * s / l1];
      s -= l1; return [I[0] + (st.Q[0] - I[0]) * s / l2, I[1] + (st.Q[1] - I[1]) * s / l2];
    }

    var B = GeoWidget.board2d(ui, { bbox: [-1.5, 7, 11.5, -5.5], axis: false, grid: false, aria: 'Bàn bi-a, đường đi của bi khi chạm một băng' });

    /* jsxgraph.css (nạp sau book.css) tô nền .jxgbox màu trắng: đặt nền trong suốt để hợp giao diện tối */

    if (B) ui.stage.querySelector('.board2d').style.background = 'transparent';
    function draw(board, C) {
      var hid = function (x, y) { return board.create('point', [x, y], { visible: false, fixed: true }); };
      board.create('polygon', [[0, 0], [W, 0], [W, Ht], [0, Ht]], { fillColor: C.fillGreen, fillOpacity: 1, borders: { strokeColor: C.green, strokeWidth: 6, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false });
      var P = board.create('point', st.P, { name: 'P', size: 7, strokeColor: C.text, fillColor: C.bg, label: { offset: [-18, 10] } });
      var Q = board.create('point', st.Q, { name: 'Q', size: 7, color: C.orange, label: { offset: [10, 10] } });
      function clampP(pt, k) {
        var x = Math.max(0.2, Math.min(W - 0.2, pt.X())), y = Math.max(0.2, Math.min(Ht - 0.2, pt.Y()));
        if (x !== pt.X() || y !== pt.Y()) pt.moveTo([x, y]);
        st[k] = [x, y]; st.anim = 0; refresh();
      }
      P.on('drag', function () { clampP(P, 'P'); }); Q.on('drag', function () { clampP(Q, 'Q'); });
      var Q2 = board.create('point', [function () { return refl(st.Q, st.c)[0]; }, function () { return refl(st.Q, st.c)[1]; }],
        { name: 'Q′', size: 4, color: C.purple, fixed: true, visible: function () { return st.mirror; }, label: { visible: function () { return st.mirror; } } });
      var I = board.create('point', [function () { return hit(st.P, st.Q, st.c)[0]; }, function () { return hit(st.P, st.Q, st.c)[1]; }], { name: 'I', size: 3, color: C.red, fixed: true, label: { offset: [6, 12] } });
      board.create('arrow', [P, I], { strokeColor: C.blue, strokeWidth: 2.5, fixed: true });
      board.create('arrow', [I, Q], { strokeColor: C.blue, strokeWidth: 2.5, fixed: true });
      board.create('segment', [I, Q2], { strokeColor: C.purple, dash: 2, strokeWidth: 1.5, visible: function () { return st.mirror; } });
      board.create('segment', [Q, Q2], { strokeColor: C.muted, dash: 1, strokeWidth: 1, visible: function () { return st.mirror; } });
      /* chân đường vuông góc từ P, Q xuống băng */
      function foot(k) { return function () { var p = st[k], c = st.c; return c === 'bottom' ? [p[0], 0] : c === 'top' ? [p[0], Ht] : c === 'left' ? [0, p[1]] : [W, p[1]]; }; }
      ['P', 'Q'].forEach(function (k) {
        var Fk = hid(function () { return foot(k)()[0]; }, function () { return foot(k)()[1]; });
        board.create('segment', [k === 'P' ? P : Q, Fk], { strokeColor: C.muted, dash: 2, strokeWidth: 1 });
        board.create('polygon', [k === 'P' ? P : Q, Fk, I], { fillColor: k === 'P' ? C.fillBlue : C.fillOrange, fillOpacity: 1, borders: { visible: false }, vertices: { visible: false }, fixed: true, highlight: false });
      });
      board.create('point', [function () { return ballAt(st.anim)[0]; }, function () { return ballAt(st.anim)[1]; }],
        { name: '', size: 7, strokeColor: C.text, fillColor: C.text, fixed: true, visible: function () { return st.playing || (st.anim > 0 && st.anim < 1); } });
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        st.anim = Math.min(1, (t - st.t0) / 1800); B.board.update();
        if (st.anim >= 1) { st.playing = false; B.board.update(); }
      });
    }
    el.__debug = function () { return { st: st, I: hit(st.P, st.Q, st.c), Q2: refl(st.Q, st.c) }; };
  });
})();
