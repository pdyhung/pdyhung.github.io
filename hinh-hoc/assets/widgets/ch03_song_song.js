/* ch03_song_song.js — Bài 4: hai đường thẳng bị cắt bởi một cát tuyến; các cặp góc đặc biệt. */
(function () {
  'use strict';
  var PAIRS = [
    ['1,3', 'đối đỉnh', 'eq'], ['2,4', 'đối đỉnh', 'eq'], ['1,2', 'kề bù', 'sup'],
    ['1,5', 'đồng vị', 'eq'], ['2,6', 'đồng vị', 'eq'], ['3,7', 'đồng vị', 'eq'], ['4,8', 'đồng vị', 'eq'],
    ['3,5', 'so le trong', 'eq'], ['4,6', 'so le trong', 'eq'],
    ['1,7', 'so le ngoài', 'eq'], ['2,8', 'so le ngoài', 'eq'],
    ['3,6', 'trong cùng phía', 'sup'], ['4,5', 'trong cùng phía', 'sup']
  ];
  GeoWidget.register('ch03_song_song', function (ui, el) {
    var H = CH03, f = H.f, D = H.D;
    var st = { al: 62, be: 0, gap: 3, pair: +(el.getAttribute('data-pair') || 7) };
    function M() { return [0, st.gap / 2]; }
    function Q0() { return [0, -st.gap / 2]; }
    function N() {   // giao của cát tuyến với đường b
      var m = M(), q = Q0(), u = [Math.cos(st.al * D), Math.sin(st.al * D)], w = [Math.cos(st.be * D), Math.sin(st.be * D)];
      var det = u[0] * -w[1] + w[0] * u[1];                  // giải m + t u = q + s w
      var t = ((q[0] - m[0]) * -w[1] + w[0] * (q[1] - m[1])) / det;
      return H.add(m, H.mul(u, t));
    }
    function angs() {   // [∠1..∠8] (độ)
      var a = st.al, b = a - st.be;
      return [a, 180 - a, a, 180 - a, b, 180 - b, b, 180 - b];
    }
    function sector(k) {   // [tâm, góc đầu, góc cuối] (radian) của góc thứ k (1..8)
      var a = st.al * D, b = st.be * D, P = Math.PI;
      var S = [[M(), 0, a], [M(), a, P], [M(), P, P + a], [M(), P + a, 2 * P], [N(), b, a], [N(), a, b + P], [N(), b + P, a + P], [N(), a + P, b + 2 * P]];
      return S[k - 1];
    }
    function clampBe() { st.be = Math.max(-35, Math.min(35, st.be, st.al - 12)); st.be = Math.max(st.be, st.al - 168); }

    var sel = ui.select({ label: 'Cặp góc cần xét', value: String(st.pair), options: PAIRS.map(function (p, i) { var k = p[0].split(','); return [String(i), '∠' + k[0] + ' và ∠' + k[1] + ' (' + p[1] + ')']; }),
      onChange: function (v) { st.pair = +v; refresh(); BD.board.update(); } });
    var g = ui.group('Thông số (nhập số)');
    var inA = ui.number({ label: 'Góc giữa cát tuyến c và đường a (°)', value: st.al, min: 10, max: 170, onChange: function (v) { st.al = v; clampBe(); sync(); } }, g);
    var inB = ui.number({ label: 'Độ lệch của đường b so với a (°)', value: st.be, min: -35, max: 35, onChange: function (v) { st.be = v; clampBe(); sync(); } }, g);
    var inG = ui.number({ label: 'Khoảng cách giữa a và b', value: st.gap, min: 1, max: 6, onChange: function (v) { st.gap = v; sync(); } }, g);
    var row = ui.row();
    ui.button(row, '∥ Cho a ∥ b', function () { st.be = 0; sync(); }, 'chip');
    var out = ui.readout([['g1', '∠1; ∠2; ∠3; ∠4'], ['g2', '∠5; ∠6; ∠7; ∠8'], ['par', 'a và b'], ['pair', 'Cặp góc'], ['rel', 'Quan hệ']]);

    var BD = GeoWidget.board2d(ui, { bbox: [-7, 5, 7, -5], aria: 'Hai đường thẳng a, b bị cắt bởi cát tuyến c tạo ra tám góc',
      hint: 'Kéo điểm tím: xoay c · điểm cam: nghiêng b · điểm xanh: dời b' });
    var Tc = null, Tb = null, Pq = null;
    function hT() { return H.polar(M(), 3.4, st.al * D); }
    function hB() { return H.polar(Q0(), 5, st.be * D); }
    function sync() {
      H.put(inA, st.al, 1); H.put(inB, st.be, 1); H.put(inG, st.gap);
      if (Tc) { Tc.moveTo(hT()); Tb.moveTo(hB()); Pq.moveTo(Q0()); }
      refresh(); if (BD && BD.board) BD.board.update();
    }
    function refresh() {
      var g = angs(), p = PAIRS[st.pair], k = p[0].split(',').map(Number);
      out('g1', g.slice(0, 4).map(function (x) { return H.fd(x); }).join('; '));
      out('g2', g.slice(4).map(function (x) { return H.fd(x); }).join('; '));
      out('par', Math.abs(st.be) < 1e-9 ? 'a ∥ b' : 'a cắt b (lệch ' + H.fd(Math.abs(st.be)) + ')');
      out('pair', p[1]);
      var eq = Math.abs(g[k[0] - 1] - g[k[1] - 1]) < 1e-6, sum = g[k[0] - 1] + g[k[1] - 1];
      out('rel', p[2] === 'eq' ? (eq ? '∠' + k[0] + ' = ∠' + k[1] + ' = ' + H.fd(g[k[0] - 1]) + ' ✓' : '∠' + k[0] + ' ≠ ∠' + k[1] + ' (' + H.fd(g[k[0] - 1]) + ' và ' + H.fd(g[k[1] - 1]) + ')')
        : ('∠' + k[0] + ' + ∠' + k[1] + ' = ' + H.fd(sum) + (Math.abs(sum - 180) < 1e-6 ? ' ✓ (bù nhau)' : ' ≠ 180°')));
    }
    function draw(board, C) {
      H.path(board, function () { return [[-20, st.gap / 2], [20, st.gap / 2]]; }, { strokeColor: C.blue, strokeWidth: 2.5 });
      H.path(board, function () { var q = Q0(), w = [Math.cos(st.be * D), Math.sin(st.be * D)]; return [H.add(q, H.mul(w, -25)), H.add(q, H.mul(w, 25))]; }, { strokeColor: C.green, strokeWidth: 2.5 });
      H.path(board, function () { var m = M(), u = [Math.cos(st.al * D), Math.sin(st.al * D)]; return [H.add(m, H.mul(u, -25)), H.add(m, H.mul(u, 25))]; }, { strokeColor: C.purple, strokeWidth: 2.5 });
      H.label(board, function () { return [-6.4, st.gap / 2 + 0.35]; }, 'a', { strokeColor: C.blue, fontSize: 17 });
      H.label(board, function () { return H.add(Q0(), H.mul([Math.cos(st.be * D), Math.sin(st.be * D)], -6.4)).map(function (v, i) { return v + (i ? 0.4 : 0); }); }, 'b', { strokeColor: C.green, fontSize: 17 });
      H.label(board, function () { return H.add(hT(), [0.45, 0]); }, 'c', { strokeColor: C.purple, fontSize: 17 });
      for (var k = 1; k <= 8; k++) (function (k) {
        var hl = function () { return PAIRS[st.pair][0].split(',').map(Number).indexOf(k); };
        H.path(board, function () { var s = sector(k); return H.sectorPts(s[0], 0.75, s[1], s[2]); },
          { strokeColor: function () { var i = hl(); return i < 0 ? C.muted : i ? C.orange : C.red; }, strokeWidth: function () { return hl() < 0 ? 1 : 2; },
            fillColor: function () { var i = hl(); return i < 0 ? 'none' : i ? C.fillOrange : 'rgba(207,34,46,0.18)'; }, fillOpacity: 1 });
        H.label(board, function () { var s = sector(k); return H.polar(s[0], 1.15, (s[1] + s[2]) / 2); }, String(k),
          { fontSize: 14, strokeColor: function () { var i = hl(); return i < 0 ? C.muted : i ? C.orange : C.red; } });
      })(k);
      Tc = board.create('point', hT(), { name: '', size: 5, color: C.purple });
      Tb = board.create('point', hB(), { name: '', size: 5, color: C.orange });
      Pq = board.create('point', Q0(), { name: '', size: 4, color: C.green });
      Tc.on('drag', function () { var a = H.dir(M(), H.xy(Tc)) / D; if (a < 0) a += 180; st.al = Math.max(10, Math.min(170, a)); clampBe(); H.put(inA, st.al, 1); H.put(inB, st.be, 1); Tb.moveTo(hB()); refresh(); });
      Tc.on('up', function () { Tc.moveTo(hT()); });
      Tb.on('drag', function () { var a = H.dir(Q0(), H.xy(Tb)) / D; if (a > 90) a -= 180; if (a < -90) a += 180; st.be = Math.abs(a) < 1.5 ? 0 : a; clampBe(); H.put(inB, st.be, 1); refresh(); });
      Tb.on('up', function () { Tb.moveTo(hB()); });
      Pq.on('drag', function () { st.gap = Math.max(1, Math.min(6, -2 * Pq.Y())); Pq.moveTo(Q0()); Tb.moveTo(hB()); H.put(inG, st.gap); refresh(); });
      refresh();
    }
    if (BD) BD.build(draw);
    refresh();
    el.__debug = function () { return { al: st.al, be: st.be, gap: st.gap, pair: st.pair, angs: angs() }; };
  });
})();
