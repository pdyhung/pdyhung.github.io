/* ch05_do_thi.js — Bài 6: Đồ thị sin và cos trên [0°; 90°].
   Hai đường cong đối xứng nhau qua đường thẳng x = 45°: chiều cao của sin tại α bằng chiều cao của cos tại 90° − α. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;

  GeoWidget.register('ch05_do_thi', function (ui, el) {
    var A0 = +(el.getAttribute('data-alpha') || 25);
    var st = { al: A0 };
    var sA = ui.slider({ label: 'Góc α', min: 0, max: 90, step: 0.1, value: st.al, decimals: 1, unit: '°', onInput: function (v) { st.al = v; refresh(); } });
    var setOut = ui.readout([['al', 'α'], ['be', '90° − α'], ['s', 'sin α (đoạn đỏ)'], ['c', 'cos(90° − α) (đoạn xanh)'], ['d', 'Chênh lệch']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Lật đồ thị sin qua đường nét đứt x = 45° thì được đồ thị cos. Khi α tăng từ 0° đến 90°, sin α tăng từ 0 đến 1 còn cos α giảm từ 1 về 0.';
    var P = null;
    var B = GeoWidget.board2d(ui, { bbox: [-9, 1.3, 99, -0.42], keepAspect: false, ratio: 0.7, aria: 'Đồ thị sin và cos trên đoạn từ 0 đến 90 độ',
      hint: 'Kéo điểm α trên trục hoành · Cuộn để phóng to · Shift + kéo để dời' });
    function refresh() {
      var b = 90 - st.al, s = Math.sin(st.al * RAD), c = Math.cos(b * RAD);
      setOut('al', f(st.al, 1) + '°'); setOut('be', f(b, 1) + '°'); setOut('s', f(s, 4)); setOut('c', f(c, 4)); setOut('d', f(Math.abs(s - c), 4));
      if (P && (Math.abs(P.X() - st.al) > 1e-9 || Math.abs(P.Y()) > 1e-9)) P.setPositionDirectly(JXG.COORDS_BY_USER, [st.al, 0]);
      if (B && B.board) B.board.update();
    }
    function draw(board, C) {
      board.create('line', [[0, 0], [1, 0]], { strokeColor: C.muted, strokeWidth: 1, fixed: true, highlight: false });
      board.create('line', [[0, 0], [0, 1]], { strokeColor: C.muted, strokeWidth: 1, fixed: true, highlight: false });
      [15, 30, 45, 60, 75, 90].forEach(function (x) {
        board.create('segment', [[x, 0], [x, 1.05]], { strokeColor: C.border, strokeWidth: 1, fixed: true, highlight: false });
        board.create('text', [x, -0.03, x + '°'], { strokeColor: C.muted, fixed: true, fontSize: 12, anchorX: 'middle', anchorY: 'top' });
      });
      [0.5, 1].forEach(function (y) {
        board.create('segment', [[0, y], [92, y]], { strokeColor: C.border, strokeWidth: 1, fixed: true, highlight: false });
        board.create('text', [-1.5, y, f(y, 1)], { strokeColor: C.muted, fixed: true, fontSize: 12, anchorX: 'right' });
      });
      board.create('segment', [[45, -0.05], [45, 1.2]], { strokeColor: C.purple, dash: 2, strokeWidth: 1.5, fixed: true, highlight: false });
      board.create('text', [45.8, 1.18, 'x = 45°'], { strokeColor: C.purple, fixed: true, fontSize: 13 });
      board.create('functiongraph', [function (x) { return Math.sin(x * RAD); }, 0, 90], { strokeColor: C.red, strokeWidth: 2.5, fixed: true, highlight: false });
      board.create('functiongraph', [function (x) { return Math.cos(x * RAD); }, 0, 90], { strokeColor: C.blue, strokeWidth: 2.5, fixed: true, highlight: false });
      board.create('text', [12, 1.1, 'y = cos x'], { strokeColor: C.blue, fixed: true, fontSize: 14 });
      board.create('text', [70, 0.8, 'y = sin x'], { strokeColor: C.red, fixed: true, fontSize: 14, anchorX: 'right' });
      var al = function () { return st.al; }, be = function () { return 90 - st.al; };
      var S1 = board.create('point', [al, function () { return Math.sin(al() * RAD); }], { name: '', withLabel: false, size: 3, color: C.red, fixed: true });
      var C1 = board.create('point', [be, function () { return Math.cos(be() * RAD); }], { name: '', withLabel: false, size: 3, color: C.blue, fixed: true });
      board.create('segment', [[al, 0], S1], { strokeColor: C.red, strokeWidth: 5, fixed: true, highlight: false });
      board.create('segment', [[be, 0], C1], { strokeColor: C.blue, strokeWidth: 5, fixed: true, highlight: false });
      board.create('segment', [S1, C1], { strokeColor: C.muted, dash: 2, strokeWidth: 1.2, fixed: true, highlight: false });
      board.create('point', [be, 0], { name: '90° − α', size: 3, color: C.blue, fixed: true, label: { offset: [-22, -40], strokeColor: C.blue } });
      P = board.create('point', [st.al, 0], { name: 'α', size: 5, color: C.orange, label: { offset: [-4, -40], strokeColor: C.orange } });
      P.on('drag', function () { st.al = Math.round(10 * Math.max(0, Math.min(90, P.X()))) / 10; P.moveTo([st.al, 0]); sA.set(st.al); refresh(); });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
