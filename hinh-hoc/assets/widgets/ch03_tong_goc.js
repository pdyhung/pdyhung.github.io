/* ch03_tong_goc.js — Bài 5: "xé" ba góc của tam giác và ghép lại thành góc bẹt; góc ngoài. */
(function () {
  'use strict';
  GeoWidget.register('ch03_tong_goc', function (ui, el) {
    var H = CH03, f = H.f, D = H.D;
    var INIT = { A: [-4, -1], B: [3, -1], C: [-1.5, 3.5] };
    var st = { A: INIT.A.slice(), B: INIT.B.slice(), C: INIT.C.slice(), u: 0, target: 0, ext: false };
    var KS = ['A', 'B', 'C'];

    function wedges() {   // cung góc tại đỉnh và vị trí ghép trên đường thẳng song song với AB
      var A = st.A, B = st.B, C = st.C, o = H.orient(A, B, C) >= 0 ? 1 : -1, th = H.dir(A, B);
      var gA = H.ang(B, A, C) * D, gB = H.ang(A, B, C) * D, gC = Math.PI - gA - gB;
      var r = Math.min(1.1, 0.3 * Math.min(H.dist(A, B), H.dist(B, C), H.dist(C, A)));
      var AB = H.sub(B, A), L = Math.hypot(AB[0], AB[1]), t = ((C[0] - A[0]) * AB[0] + (C[1] - A[1]) * AB[1]) / (L * L);
      t = Math.max(0.3, Math.min(0.7, t));
      var n = [-AB[1] / L * o, AB[0] / L * o];                // pháp tuyến hướng về phía C
      var T = H.add(H.lerp(A, B, t), H.mul(n, -(r + 0.9)));   // điểm ghép, phía dưới cạnh AB
      var w = {}, s = {};
      KS.forEach(function (k, i) { var P = st[KS[(i + 1) % 3]], Q = st[KS[(i + 2) % 3]]; w[k] = H.wedge(P, st[k], Q); });
      if (o > 0) { s.A = [th, th + gA]; s.C = [th + gA, th + gA + gC]; s.B = [th + gA + gC, th + Math.PI]; }
      else { s.A = [th - gA, th]; s.C = [th - gA - gC, th - gA]; s.B = [th - Math.PI, th - gA - gC]; }
      return { w: w, s: s, T: T, r: r, th: th, g: { A: gA / D, B: gB / D, C: gC / D } };
    }
    function wedgeAt(k, u, W) {   // hình quạt của góc k tại thời điểm u
      W = W || wedges();
      var w = W.w[k], s = W.s[k], d = H.norm(s[0] - w[0]);
      if (Math.abs(Math.abs(d) - Math.PI) < 1e-6) d = Math.PI;   // nửa vòng: luôn quay ngược chiều kim đồng hồ
      var c = H.lerp(st[k], W.T, u), a0 = w[0] + d * u;
      return H.sectorPts(c, W.r, a0, a0 + (w[1] - w[0]));
    }

    var g = ui.group('Tọa độ các đỉnh (nhập số)');
    var ins = {};
    KS.forEach(function (k) {
      [0, 1].forEach(function (j) {
        ins[k + j] = ui.number({ label: k + ': ' + (j ? 'tung độ' : 'hoành độ'), value: st[k][j], min: -20, max: 20, onChange: function (v) { st[k][j] = v; sync(); } }, g);
      });
    });
    var row = ui.row();
    ui.button(row, '▶ Xé và ghép ba góc', function () { st.target = 1; });
    ui.button(row, '↺ Trả về', function () { st.target = 0; }, 'btn secondary');
    var row2 = ui.row();
    ui.checkbox('Hiện góc ngoài tại đỉnh C', st.ext, function (v) { st.ext = v; refresh(); BD.board.update(); }, row2);
    var out = ui.readout([['abc', '∠A; ∠B; ∠C'], ['sum', '∠A + ∠B + ∠C'], ['ext', 'Góc ngoài tại C (∠ACx)'], ['ab', '∠A + ∠B'], ['kind', 'Loại tam giác']]);

    var BD = GeoWidget.board2d(ui, { bbox: [-7, 5.5, 7, -5], grid: true, aria: 'Ba góc của tam giác được ghép lại thành một góc bẹt',
      hint: 'Kéo các đỉnh A, B, C · Cuộn để phóng to' });
    var P = {};
    function sync() { KS.forEach(function (k) { H.put(ins[k + 0], st[k][0]); H.put(ins[k + 1], st[k][1]); if (P[k]) P[k].moveTo(st[k]); }); refresh(); if (BD && BD.board) BD.board.update(); }
    function refresh() {
      var W = wedges(), a = W.g;
      out('abc', H.fd(a.A) + '; ' + H.fd(a.B) + '; ' + H.fd(a.C));
      out('sum', H.fd(a.A + a.B + a.C));
      out('ext', H.fd(180 - a.C)); out('ab', H.fd(a.A + a.B));
      var mx = Math.max(a.A, a.B, a.C);
      out('kind', mx > 90 + 1e-6 ? 'tam giác tù' : mx > 90 - 1e-6 ? 'tam giác vuông' : 'tam giác nhọn');
    }
    function draw(board, C) {
      KS.forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue, label: { offset: k === 'C' ? [6, 14] : [-14, -12] } });
        P[k].on('drag', function () { st[k] = H.xy(P[k]); H.put(ins[k + 0], st[k][0]); H.put(ins[k + 1], st[k][1]); refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 0.6, borders: { strokeColor: C.blue, strokeWidth: 2 }, highlight: false });
      var col = { A: [C.red, 'rgba(207,34,46,0.25)'], B: [C.green, C.fillGreen], C: [C.orange, C.fillOrange] };
      // chỗ trống để lại ở đỉnh khi góc đã bị "xé"
      KS.forEach(function (k) {
        H.path(board, function () { if (st.u <= 0) return null; var W = wedges(); return H.sectorPts(st[k], W.r, W.w[k][0], W.w[k][1]); }, { strokeColor: col[k][0], dash: 2, strokeWidth: 1 });
      });
      // đường thẳng chứa góc bẹt
      H.path(board, function () { if (st.u <= 0) return null; var W = wedges(), d = [Math.cos(W.th), Math.sin(W.th)]; return [H.add(W.T, H.mul(d, -(W.r + 1.2))), H.add(W.T, H.mul(d, W.r + 1.2))]; },
        { strokeColor: C.text, strokeWidth: 1.5, dash: 2, strokeOpacity: 0.8 });
      KS.forEach(function (k) {
        H.path(board, function () { return wedgeAt(k, st.u); }, { strokeColor: col[k][0], strokeWidth: 2, fillColor: col[k][1], fillOpacity: 1 });
        H.label(board, function () {
          var W = wedges(), w = W.w[k], s = W.s[k], d = H.norm(s[0] - w[0]); if (Math.abs(Math.abs(d) - Math.PI) < 1e-6) d = Math.PI;
          var c = H.lerp(st[k], W.T, st.u), m = (w[0] + w[1]) / 2 + d * st.u; return H.polar(c, W.r * 0.62, m);
        }, function () { return H.fd(wedges().g[k], 0); }, { fontSize: 12, strokeColor: col[k][0] });
      });
      H.label(board, function () { var W = wedges(); return H.add(W.T, H.mul([Math.cos(W.th + Math.PI / 2), Math.sin(W.th + Math.PI / 2)], -0.45 * (H.orient(st.A, st.B, st.C) >= 0 ? 1 : -1))); },
        '180°', { fontSize: 14, visible: function () { return st.u > 0.999; } });
      // góc ngoài tại C: tia Cx là phần kéo dài của BC
      H.path(board, function () { if (!st.ext) return null; var x = H.add(st.C, H.mul(H.sub(st.C, st.B), 2.2 / H.dist(st.B, st.C))); return [st.C, x]; }, { strokeColor: C.purple, strokeWidth: 2, dash: 1 });
      H.path(board, function () { if (!st.ext) return null; var x = H.add(st.C, H.sub(st.C, st.B)), w = H.wedge(st.A, st.C, x); return H.sectorPts(st.C, 0.65, w[0], w[1]); }, { strokeColor: C.purple, fillColor: C.fillPurple, fillOpacity: 1, strokeWidth: 1.5 });
      H.label(board, function () { return H.add(st.C, H.mul(H.sub(st.C, st.B), 2.5 / H.dist(st.B, st.C))); }, 'x', { strokeColor: C.purple, visible: function () { return st.ext; } });
      refresh();
    }
    if (BD) {
      BD.build(draw);
      var last = 0;
      ui.loop(function (t) {
        var dt = last ? Math.min(60, t - last) : 16; last = t;
        if (st.u === st.target) return;
        st.u = st.u < st.target ? Math.min(st.target, st.u + dt / 1800) : Math.max(st.target, st.u - dt / 1200);
        BD.board.update();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
