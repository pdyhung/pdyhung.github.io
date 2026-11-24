/* ch03_tu_giac.js — Bài 6: tính chất hình bình hành và các trường hợp đặc biệt. */
(function () {
  'use strict';
  var TYPES = [['tg', 'Tứ giác bất kỳ'], ['hbh', 'Hình bình hành'], ['hcn', 'Hình chữ nhật'], ['thoi', 'Hình thoi'], ['vuong', 'Hình vuông']];
  GeoWidget.register('ch03_tu_giac', function (ui, el) {
    var H = CH03, f = H.f, D = H.D;
    var st = { type: el.getAttribute('data-type') || 'hbh', A: [-4, -2], a: 6, phi: 0, b: 4, angA: 65, Cg: [3.2, 2.6] };
    function lockAng() { return st.type === 'hcn' || st.type === 'vuong'; }
    function lockB() { return st.type === 'thoi' || st.type === 'vuong'; }
    function constrain() {
      if (lockAng()) st.angA = 90;
      if (lockB()) st.b = st.a;
    }
    function pts() {
      var A = st.A, B = H.polar(A, st.a, st.phi * D), Dd = H.polar(A, st.b, (st.phi + st.angA) * D);
      var C = st.type === 'tg' ? st.Cg : H.sub(H.add(B, Dd), A);
      return { A: A, B: B, C: C, D: Dd };
    }
    constrain();

    var sel = ui.select({ label: 'Loại tứ giác', value: st.type, options: TYPES, onChange: function (v) {
      if (v === 'tg') { var p = pts(); st.Cg = p.C.slice(); }
      st.type = v; constrain(); lockInputs(); BD.build(draw); sync();
    } });
    var g = ui.group('Kích thước (nhập số)');
    var inA = ui.number({ label: 'Cạnh AB', value: st.a, min: 0.5, max: 12, onChange: function (v) { st.a = v; constrain(); sync(); } }, g);
    var inB = ui.number({ label: 'Cạnh AD', value: st.b, min: 0.5, max: 12, onChange: function (v) { st.b = v; constrain(); sync(); } }, g);
    var inG = ui.number({ label: 'Góc A (°)', value: st.angA, min: 5, max: 175, onChange: function (v) { st.angA = v; constrain(); sync(); } }, g);
    function lockInputs() { inB.disabled = lockB(); inG.disabled = lockAng(); }
    lockInputs();
    var out = ui.readout([['s', 'AB; BC; CD; DA'], ['g', '∠A; ∠B; ∠C; ∠D'], ['sum', 'Tổng bốn góc'], ['d', 'Đường chéo AC; BD'], ['o', 'OA; OC | OB; OD'], ['od', 'Góc giữa AC, BD']]);
    var note = H.note(ui);

    var BD = GeoWidget.board2d(ui, { bbox: [-7, 6, 7, -4.5], grid: true, aria: 'Tứ giác ABCD với hai đường chéo cắt nhau tại O',
      hint: 'Kéo các đỉnh tô màu · Cuộn để phóng to' });
    var P = {};
    function sync() {
      H.put(inA, st.a); H.put(inB, st.b); H.put(inG, st.angA, 1);
      var p = pts(); ['A', 'B', 'C', 'D'].forEach(function (k) { if (P[k]) P[k].moveTo(p[k]); });
      refresh(); if (BD && BD.board) BD.board.update();
    }
    function close(x, y) { return Math.abs(x - y) < 1e-6; }
    function refresh() {
      var p = pts(), A = p.A, B = p.B, C = p.C, Dd = p.D;
      var s = [H.dist(A, B), H.dist(B, C), H.dist(C, Dd), H.dist(Dd, A)];
      var a = [H.ang(Dd, A, B), H.ang(A, B, C), H.ang(B, C, Dd), H.ang(C, Dd, A)];
      var O = H.inter(A, C, B, Dd), dA = H.dist(A, C), dB = H.dist(B, Dd);
      out('s', s.map(function (x) { return f(x); }).join('; '));
      out('g', a.map(function (x) { return H.fd(x); }).join('; '));
      out('sum', H.fd(a[0] + a[1] + a[2] + a[3]));
      out('d', f(dA) + '; ' + f(dB));
      out('o', f(H.dist(O, A)) + '; ' + f(H.dist(O, C)) + ' | ' + f(H.dist(O, B)) + '; ' + f(H.dist(O, Dd)));
      out('od', H.fd(H.lineAng(A, C, B, Dd)));
      var pr = [
        ['cạnh đối bằng nhau', close(s[0], s[2]) && close(s[1], s[3])],
        ['góc đối bằng nhau', close(a[0], a[2]) && close(a[1], a[3])],
        ['chéo cắt nhau tại trung điểm mỗi đường', close(H.dist(O, A), H.dist(O, C)) && close(H.dist(O, B), H.dist(O, Dd))],
        ['hai đường chéo bằng nhau', close(dA, dB)],
        ['hai đường chéo vuông góc', close(H.lineAng(A, C, B, Dd), 90)],
        ['bốn góc vuông', a.every(function (x) { return close(x, 90); })],
        ['bốn cạnh bằng nhau', close(s[0], s[1]) && close(s[1], s[2]) && close(s[2], s[3])]
      ];
      note('<b>Kiểm tra tính chất</b> (✓ đúng, ✗ sai):<br>' + pr.map(function (q) { return (q[1] ? '✓ ' : '✗ ') + q[0]; }).join('<br>'));
      st.props = pr;
    }
    function draw(board, C) {
      var p = pts(), tg = st.type === 'tg';
      ['A', 'B', 'C', 'D'].forEach(function (k) {
        var free = k !== 'C' || tg;
        P[k] = board.create('point', p[k], { name: k, size: free ? 5 : 3, color: free ? C.blue : C.muted, fixed: !free,
          label: { offset: { A: [-16, -12], B: [8, -12], C: [8, 12], D: [-16, 12] }[k] } });
      });
      board.create('polygon', [P.A, P.B, P.C, P.D], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2.5 }, highlight: false });
      board.create('segment', [P.A, P.C], { strokeColor: C.orange, dash: 2, strokeWidth: 1.5, fixed: true, highlight: false });
      board.create('segment', [P.B, P.D], { strokeColor: C.green, dash: 2, strokeWidth: 1.5, fixed: true, highlight: false });
      H.dep(board, function () { var q = pts(); return H.inter(q.A, q.C, q.B, q.D); }, { name: 'O', color: C.red, size: 3, label: { offset: [6, 12] } });
      // nhãn góc và cạnh
      var K = ['A', 'B', 'C', 'D'];
      K.forEach(function (k, i) {
        H.label(board, function () {
          var q = pts(), V = q[k], pv = q[K[(i + 3) % 4]], nx = q[K[(i + 1) % 4]], w = H.wedge(pv, V, nx);
          return H.polar(V, 0.75, (w[0] + w[1]) / 2);
        }, function () { var q = pts(); return H.fd(H.ang(q[K[(i + 3) % 4]], q[k], q[K[(i + 1) % 4]]), 0); }, { fontSize: 12, strokeColor: C.muted });
        H.label(board, function () {
          var q = pts(), U = q[k], V = q[K[(i + 1) % 4]], M = H.mid(U, V), c = H.mul(H.add(H.add(q.A, q.B), H.add(q.C, q.D)), 0.25), n = H.sub(M, c), L = Math.hypot(n[0], n[1]) || 1;
          return H.add(M, H.mul(n, 0.4 / L));
        }, function () { var q = pts(); return f(H.dist(q[k], q[K[(i + 1) % 4]]), 1); }, { fontSize: 13, strokeColor: C.blue });
      });
      P.A.on('drag', function () { var d = H.sub(H.xy(P.A), st.A); st.A = H.xy(P.A); st.Cg = H.add(st.Cg, d); sync(); });
      P.B.on('drag', function () { var q = H.xy(P.B); st.a = Math.max(0.5, H.dist(st.A, q)); st.phi = H.dir(st.A, q) / D; constrain(); sync(); });
      P.D.on('drag', function () {
        var q = H.xy(P.D), ang = H.norm(H.dir(st.A, q) - st.phi * D) / D;
        if (st.type === 'vuong') { sync(); return; }
        if (st.type === 'hcn') st.b = Math.max(0.5, Math.abs(ang) < 180 ? H.dist(st.A, q) * Math.cos((ang - 90) * D) : 0.5);
        else { st.angA = Math.max(5, Math.min(175, ang)); if (!lockB()) st.b = Math.max(0.5, H.dist(st.A, q)); }
        constrain(); sync();
      });
      if (tg) P.C.on('drag', function () { st.Cg = H.xy(P.C); refresh(); board.update(); });
      refresh();
    }
    if (BD) BD.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
