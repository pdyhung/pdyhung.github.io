/* ch06_song_song.js — Hệ số góc; đường thẳng song song và vuông góc (Chương 6, Bài 4).
   Xoay đường thẳng d quanh P; d′ qua Q song song với d, d⊥ qua P vuông góc với d. Tích hai hệ số góc vuông góc bằng −1. */
(function () {
  'use strict';
  var RAD = Math.PI / 180;
  GeoWidget.register('ch06_song_song', function (ui, el) {
    var ch = GeoWidget.ch06, f = ch.f;
    var init = { P: [-1, 1], Q: [2, -3], ang: Math.atan(2) / RAD };
    var st = { P: init.P.slice(), Q: init.Q.slice(), ang: init.ang, snap: true, tri: true, playing: false, last: 0 };

    var sa = ui.slider({ label: 'Góc α giữa d và tia Ox', min: 0, max: 179.9, step: 'any', value: st.ang, decimals: 1, unit: '°',
      onInput: function (v) { st.ang = v; syncSlope(); refresh(); } });
    var g = ui.group('Hệ số góc (nhập số)');
    var inA = ui.number({ label: 'Hệ số góc a của d', value: 2, min: -1000, max: 1000, onChange: function (a) { st.ang = Math.atan(a) / RAD; if (st.ang < 0) st.ang += 180; sa.set(st.ang); refresh(); } }, g);
    function syncSlope() { var a = slope(); inA.value = isFinite(a) ? ch.r2(a) : ''; inA.classList.remove('invalid'); }
    var co = ch.coords(ui, 'Tâm quay P và điểm Q', ['P', 'Q'], st, function (k) { Pt[k] && Pt[k].moveTo(st[k]); refresh(); });
    var row = ui.row();
    ui.checkbox('Bắt điểm vào lưới', true, function (v) { st.snap = v; }, row);
    ui.checkbox('Tam giác hệ số góc', true, function (v) { st.tri = v; refresh(); }, row);
    var row2 = ui.row();
    var playBtn = ui.button(row2, '▶ Xoay d', function () { st.playing = !st.playing; st.last = 0; playBtn.textContent = st.playing ? '⏸ Dừng' : '▶ Xoay d'; });
    ui.button(row2, '↺ Đặt lại', function () {
      st.playing = false; playBtn.textContent = '▶ Xoay d';
      st.P = init.P.slice(); st.Q = init.Q.slice(); st.ang = init.ang; sa.set(st.ang); syncSlope(); co.sync(); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var out = ui.readout([['ang', 'Góc α'], ['a', 'd: a = tan α'], ['a1', 'd′ ∥ d (qua Q)'], ['a2', 'd⊥: a⊥ = −1/a'], ['prod', 'Tích a · a⊥'], ['chk', 'Góc (d, d⊥)']]);

    var B = GeoWidget.board2d(ui, { ratio: 0.92, maxH: 560, bbox: [-7, 6, 7, -6], axis: true, grid: true, aria: 'Đường thẳng d quay quanh P, đường song song d′ và đường vuông góc' });
    var Pt = {};

    function vertical() { return Math.abs(st.ang - 90) < 1e-9; }
    function slope() { return vertical() ? Infinity : Math.tan(st.ang * RAD); }
    function refresh() {
      var a = slope();
      out('ang', f(st.ang, 1) + '°');
      out('a', isFinite(a) ? f(a) : 'không có (d thẳng đứng)');
      out('a1', isFinite(a) ? 'a′ = ' + f(a) + ' = a' : 'd′ cũng thẳng đứng');
      if (!isFinite(a)) { out('a2', 'a⊥ = 0 (d⊥ nằm ngang)'); out('prod', 'không xét (d không có hệ số góc)'); }
      else if (Math.abs(a) < 1e-9) { out('a2', 'không có (d⊥ thẳng đứng)'); out('prod', 'không xét (d⊥ không có hệ số góc)'); }
      else { out('a2', '−1/' + ch.par(a) + ' = ' + f(-1 / a)); out('prod', f(a) + ' · ' + ch.par(-1 / a) + ' = ' + f(a * (-1 / a))); }
      out('chk', '90°');
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var snap = function () { return st.snap; };
      Pt.P = ch.point(board, 'P', st.P, C.blue, snap, function (p) { st.P = p; co.sync('P'); refresh(); });
      Pt.Q = ch.point(board, 'Q', st.Q, C.green, snap, function (p) { st.Q = p; co.sync('Q'); refresh(); });
      var ux = function () { return Math.cos(st.ang * RAD); }, uy = function () { return Math.sin(st.ang * RAD); };
      var P2 = ch.fpt(board, function () { return Pt.P.X() + ux(); }, function () { return Pt.P.Y() + uy(); });
      var Q2 = ch.fpt(board, function () { return Pt.Q.X() + ux(); }, function () { return Pt.Q.Y() + uy(); });
      var P3 = ch.fpt(board, function () { return Pt.P.X() - uy(); }, function () { return Pt.P.Y() + ux(); });
      board.create('line', [Pt.P, P2], { strokeColor: C.blue, strokeWidth: 3, fixed: true, highlight: false, name: 'd', withLabel: true, label: { strokeColor: C.blue, position: 'rt', offset: [-14, 14] } });
      board.create('line', [Pt.Q, Q2], { strokeColor: C.green, strokeWidth: 2.5, fixed: true, highlight: false, name: 'd′', withLabel: true, label: { strokeColor: C.green, position: 'rt', offset: [-14, 14] } });
      board.create('line', [Pt.P, P3], { strokeColor: C.orange, strokeWidth: 2.5, fixed: true, highlight: false, name: 'd⊥', withLabel: true, label: { strokeColor: C.orange, position: 'rt', offset: [-20, 14] } });
      // dấu góc vuông tại P
      var s = 0.4;
      var c1 = ch.fpt(board, function () { return Pt.P.X() + s * ux(); }, function () { return Pt.P.Y() + s * uy(); });
      var c2 = ch.fpt(board, function () { return Pt.P.X() + s * (ux() - uy()); }, function () { return Pt.P.Y() + s * (uy() + ux()); });
      var c3 = ch.fpt(board, function () { return Pt.P.X() - s * uy(); }, function () { return Pt.P.Y() + s * ux(); });
      board.create('polygon', [Pt.P, c1, c2, c3], { fillColor: C.fillOrange, fillOpacity: 1, highlight: false, vertices: { visible: false }, borders: { strokeColor: C.orange, strokeWidth: 1.2, highlight: false } });
      // tam giác hệ số góc: đi ngang 1 đơn vị, đi lên a đơn vị (trên d, tại P) và a⊥ đơn vị (trên d⊥, tại P)
      function slopeTri(kf, col, side) {
        var on = function () { var k = kf(); return st.tri && isFinite(k) && Math.abs(k) <= 5; };
        var A0 = ch.fpt(board, function () { return Pt.P.X(); }, function () { return Pt.P.Y(); });
        var A1 = ch.fpt(board, function () { return Pt.P.X() + side; }, function () { return Pt.P.Y(); });
        var A2 = ch.fpt(board, function () { return Pt.P.X() + side; }, function () { return Pt.P.Y() + side * kf(); });
        board.create('segment', [A0, A1], { strokeColor: col, dash: 2, strokeWidth: 2, fixed: true, highlight: false, visible: on });
        board.create('segment', [A1, A2], { strokeColor: col, dash: 2, strokeWidth: 2, fixed: true, highlight: false, visible: on });
        ch.text(board, function () { return Pt.P.X() + side / 2; }, function () { return Pt.P.Y() + (kf() * side > 0 ? -0.35 : 0.35); }, function () { return '1'; }, col, { visible: on, fontSize: 13 });
        ch.text(board, function () { return Pt.P.X() + side * 1.12; }, function () { return Pt.P.Y() + side * kf() / 2; },
          function () { return f(kf()); }, col, { visible: on, fontSize: 13, anchorX: side > 0 ? 'left' : 'right' });
      }
      slopeTri(slope, C.blue, 1);
      slopeTri(function () { var a = slope(); return isFinite(a) && Math.abs(a) > 1e-9 ? -1 / a : NaN; }, C.orange, -1);
      refresh();
    }
    if (B) {
      B.build(draw);
      ui.loop(function (t) {
        if (!st.playing) return;
        if (st.last) { st.ang = (st.ang + (t - st.last) * 0.02) % 180; sa.set(st.ang); syncSlope(); refresh(); }
        st.last = t;
      });
    }
    syncSlope();
    refresh();
    el.__debug = function () { return st; };
  });
})();
