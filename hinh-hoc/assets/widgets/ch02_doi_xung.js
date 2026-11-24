/* ch02_doi_xung.js — Đối xứng trục và đối xứng quay của hình phẳng: đa giác đều, chữ cái, tứ giác (Bài 5, Chương 2). */
(function () {
  'use strict';
  var SH = {
    cn: [[-3.5, -2], [3.5, -2], [3.5, 2], [-3.5, 2]],
    vuong: [[-2.5, -2.5], [2.5, -2.5], [2.5, 2.5], [-2.5, 2.5]],
    thoi: [[0, -3], [4.5, 0], [0, 3], [-4.5, 0]],
    hbh: [[-4, -2], [2, -2], [4, 2], [-2, 2]],
    can: [[-3, -2.5], [3, -2.5], [0, 3.5]],
    thang: [[-4, -2], [4, -2], [2, 2], [-2, 2]],
    H: [[-3, -3], [-1.5, -3], [-1.5, -0.6], [1.5, -0.6], [1.5, -3], [3, -3], [3, 3], [1.5, 3], [1.5, 0.6], [-1.5, 0.6], [-1.5, 3], [-3, 3]],
    Z: [[-3, 3], [3, 3], [3, 1.8], [-1.2, -1.8], [3, -1.8], [3, -3], [-3, -3], [-3, -1.8], [1.2, 1.8], [-3, 1.8]],
    T: [[-3, 3], [3, 3], [3, 1.8], [0.7, 1.8], [0.7, -3], [-0.7, -3], [-0.7, 1.8], [-3, 1.8]],
    E: [[-2.5, -3], [2.5, -3], [2.5, -1.8], [-1, -1.8], [-1, -0.6], [1.8, -0.6], [1.8, 0.6], [-1, 0.6], [-1, 1.8], [2.5, 1.8], [2.5, 3], [-2.5, 3]]
  };
  function regular(n, r) { var a = []; for (var i = 0; i < n; i++) { var t = Math.PI / 2 + 2 * Math.PI * i / n; a.push([r * Math.cos(t), r * Math.sin(t)]); } return a; }
  function star(n) { var a = []; for (var i = 0; i < 2 * n; i++) { var t = Math.PI / 2 + Math.PI * i / n, r = i % 2 ? 1.9 : 4.5; a.push([r * Math.cos(t), r * Math.sin(t)]); } return a; }
  function pinwheel() { var a = [], b = [[1, 0], [4.2, 0], [4.2, 1.7]]; for (var k = 0; k < 4; k++) b.forEach(function (p) { var t = k * Math.PI / 2; a.push([p[0] * Math.cos(t) - p[1] * Math.sin(t), p[0] * Math.sin(t) + p[1] * Math.cos(t)]); }); return a; }

  /* Tìm các phép đối xứng của đa giác (so khớp tập cạnh). */
  function symmetries(pts) {
    var n = pts.length, c = [0, 0];
    pts.forEach(function (p) { c[0] += p[0] / n; c[1] += p[1] / n; });
    function key(p) { return Math.round(p[0] * 1000) + ',' + Math.round(p[1] * 1000); }
    function ekey(p, q) { var a = key(p), b = key(q); return a < b ? a + '|' + b : b + '|' + a; }
    var edges = {}; for (var i = 0; i < n; i++) edges[ekey(pts[i], pts[(i + 1) % n])] = 1;
    function same(map) { var m = pts.map(map); for (var i = 0; i < n; i++) if (!edges[ekey(m[i], m[(i + 1) % n])]) return false; return true; }
    var rots = [];
    for (var j = 1; j <= n; j++) {
      var a = 2 * Math.PI * j / n;
      if (same(function (p) { var x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; })) rots.push(360 * j / n);
    }
    var cand = [];
    pts.forEach(function (w) {
      var v = pts[0], m = [(v[0] + w[0]) / 2 - c[0], (v[1] + w[1]) / 2 - c[1]], dir;
      if (Math.hypot(m[0], m[1]) > 1e-6) dir = Math.atan2(m[1], m[0]);
      else dir = Math.atan2(w[1] - v[1], w[0] - v[0]) + Math.PI / 2;
      var deg = ((dir * 180 / Math.PI) % 180 + 180) % 180; if (deg > 179.999) deg = 0;
      if (!cand.some(function (d) { return Math.abs(d - deg) < 1e-3; })) cand.push(deg);
    });
    var axes = cand.filter(function (deg) {
      var t = 2 * deg * Math.PI / 180;
      return same(function (p) { var x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(t) + y * Math.sin(t), c[1] + x * Math.sin(t) - y * Math.cos(t)]; });
    }).sort(function (a, b) { return a - b; });
    return { c: c, order: rots.length, minAngle: rots[0], axes: axes };
  }

  GeoWidget.register('ch02_doi_xung', function (ui, el) {
    var X = CH02, f = X.f;
    var st = { shape: el.getAttribute('data-shape') || 'deu', n: +(el.getAttribute('data-n') || 5), angle: 0, step: 72, axes: true, playing: false, from: 0, to: 0, t0: 0, seen: {}, sym: null };
    function pts() { return st.shape === 'deu' ? regular(st.n, 4) : st.shape === 'sao' ? star(st.n) : st.shape === 'chong' ? pinwheel() : SH[st.shape]; }
    function recompute() { st.sym = symmetries(pts()); st.step = +st.sym.minAngle.toFixed(4); st.seen = { 0: 1 }; st.angle = 0; }

    ui.select({ label: 'Hình', value: st.shape, options: [['deu', 'Đa giác đều n cạnh'], ['sao', 'Ngôi sao n cánh'], ['vuong', 'Hình vuông'], ['cn', 'Hình chữ nhật'], ['thoi', 'Hình thoi'],
      ['hbh', 'Hình bình hành'], ['thang', 'Hình thang cân'], ['can', 'Tam giác cân'], ['H', 'Chữ H'], ['E', 'Chữ E'], ['T', 'Chữ T'], ['Z', 'Chữ Z'], ['chong', 'Chong chóng 4 cánh']],
      onChange: function (v) { st.shape = v; st.playing = false; nIn.parentNode.style.display = (v === 'deu' || v === 'sao') ? '' : 'none'; recompute(); sync(); B.build(draw); } });
    var g = ui.group('Thông số (nhập số)');
    var nIn = ui.number({ label: 'Số cạnh / số cánh n', value: st.n, min: 3, max: 12, step: 1, onChange: function (v) { st.n = Math.round(v); nIn.value = st.n; recompute(); sync(); B.build(draw); } }, g);
    var stepIn = ui.number({ label: 'Góc quay mỗi lần bấm (°)', value: st.step, min: 1, max: 360, onChange: function (v) { st.step = v; } }, g);
    var sl = ui.slider({ label: 'Góc quay hiện tại', min: 0, max: 360, step: 1, value: 0, decimals: 1, unit: '°', onInput: function (v) { setAngle(v, true); } });
    var r = ui.row();
    ui.button(r, '↻ Quay thêm', function () { animate(st.angle + st.step); });
    ui.button(r, '⟳ Quay 1 vòng', function () { animate(st.angle + 360); }, 'btn secondary');
    ui.button(r, '↺ Về 0°', function () { st.playing = false; setAngle(0, true); }, 'btn secondary');
    ui.checkbox('Hiện các trục đối xứng', st.axes, function (v) { st.axes = v; B.build(draw); });
    var out = ui.readout([['ax', 'Số trục đối xứng'], ['ord', 'Số vị trí trùng trong 1 vòng'], ['min', 'Góc quay nhỏ nhất (≠ 0°)'], ['cur', 'Góc hiện tại'], ['hit', 'Trùng với hình ban đầu?'], ['seen', 'Số vị trí trùng đã gặp']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6.5, 6, 6.5, -6], ratio: 0.95, maxH: 580, axis: false, grid: false, aria: 'Hình phẳng có thể quay quanh tâm; các trục đối xứng vẽ nét đứt', hint: 'Kéo điểm tím để quay hình · Cuộn để phóng to' });
    var badge = document.createElement('div'); badge.className = 'badge'; ui.stage.appendChild(badge);

    function hitAt(a) { var m = st.sym.minAngle; var k = Math.round(a / m); return Math.abs(a - k * m) < 0.05; }
    function mark(prev, next) { /* ghi lại các vị trí trùng đi qua trong (prev; next] */
      var m = st.sym.minAngle, lo = Math.min(prev, next), hi = Math.max(prev, next);
      for (var k = Math.ceil((lo - 0.05) / m); k * m <= hi + 0.05; k++) {
        if (k * m < lo - 0.05) continue;
        var key = Math.round((((k * m) % 360) + 360) % 360 * 100) % 36000; st.seen[key] = 1;
      }
    }
    function setAngle(a, user) {
      var m = st.sym.minAngle, k = Math.round(a / m);
      if (user && Math.abs(a - k * m) < 1.5) a = k * m;            // hút vào vị trí trùng gần nhất
      mark(st.angle, a); st.angle = a; sync();
    }
    function animate(to) { st.from = st.angle; st.to = to; st.t0 = 0; st.playing = true; }
    function norm(a) { return ((a % 360) + 360) % 360; }
    function sync() {
      var s = st.sym, a = norm(st.angle);
      if (Math.abs(a - 360) < 1e-9) a = 0;
      sl.set(a);
      if (document.activeElement !== stepIn) stepIn.value = +st.step.toFixed(3);
      out('ax', String(s.axes.length));
      out('ord', String(s.order) + (s.order > 1 ? ' → có đối xứng quay' : ' → không có đối xứng quay'));
      out('min', s.order > 1 ? f(s.minAngle) + '° = 360° : ' + s.order : '360° (chỉ trùng khi quay đủ vòng)');
      out('cur', f(a, 1) + '°');
      var h = hitAt(st.angle);
      out('hit', h ? 'Có ✓' : 'Không');
      out('seen', Object.keys(st.seen).length + ' / ' + s.order);
      badge.textContent = h ? 'Trùng khớp ✓ (' + f(a, 1) + '°)' : f(a, 1) + '°';
      badge.style.color = h ? 'var(--ok)' : '';
      if (B && B.board) B.board.update();
    }
    function rotated() { var c = st.sym.c, a = st.angle * X.D; return pts().map(function (p) { return X.rot(p, c, st.angle); }); }
    function draw(board, C) {
      var c = st.sym.c;
      if (st.axes) st.sym.axes.forEach(function (deg) {
        board.create('line', [c, [c[0] + Math.cos(deg * X.D), c[1] + Math.sin(deg * X.D)]], { strokeColor: C.purple, strokeWidth: 1.5, dash: 2, fixed: true, highlight: false });
      });
      X.shape(board, pts, { strokeColor: C.muted, strokeWidth: 2, dash: 2, fillColor: C.fillBlue, fillOpacity: 1, fixed: true, highlight: false });
      X.shape(board, rotated, { strokeColor: C.orange, strokeWidth: 2.5, fillColor: C.fillOrange, fillOpacity: 1, fixed: true, highlight: false });
      board.create('point', [function () { return rotated()[0][0]; }, function () { return rotated()[0][1]; }], { name: '', size: 4, color: C.red, fixed: true });
      board.create('point', c, { name: 'O', size: 2, color: C.text, fixed: true });
      var R = 5.4, H = board.create('point', [c[0], c[1] + R], { name: 'kéo để quay', size: 5, color: C.purple, label: { strokeColor: C.purple, offset: [8, 6] } });
      board.create('circle', [c, R], { strokeColor: C.border, strokeWidth: 1, fixed: true, highlight: false });
      board.create('segment', [c, H], { strokeColor: C.purple, strokeWidth: 1, fixed: true, highlight: false });
      function place() { var a = (90 + st.angle) * X.D; H.moveTo([c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]); }
      H.on('drag', function () {
        st.playing = false;
        var a = Math.atan2(H.Y() - c[1], H.X() - c[0]) / X.D - 90, cur = norm(st.angle), d = norm(a) - cur;
        if (d > 180) d -= 360; if (d < -180) d += 360;
        setAngle(st.angle + Math.round(d), true); place();
      });
      H.on('up', place);
      st.place = place; place();
      sync();
    }
    recompute(); nIn.parentNode.style.display = (st.shape === 'deu' || st.shape === 'sao') ? '' : 'none'; st.n = Math.round(st.n);
    if (B) {
      B.build(draw);
      ui.loop(function (now) {
        if (!st.playing) return;
        if (!st.t0) st.t0 = now;
        var dur = Math.max(500, Math.abs(st.to - st.from) / 360 * 4000), u = Math.min(1, (now - st.t0) / dur);
        var a = st.from + (st.to - st.from) * u;
        mark(st.angle, a); st.angle = a;
        if (u >= 1) { st.playing = false; st.angle = norm(st.to); if (Math.abs(st.angle - 360) < 1e-6) st.angle = 0; }
        if (st.place) st.place();
        sync();
      });
    }
    el.__debug = function () { return st; };
  });
})();
