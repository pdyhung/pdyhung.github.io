/* ch03_ccg.js — Bài 2: thí nghiệm c.c.g (SSA) không phải trường hợp bằng nhau. */
(function () {
  'use strict';
  GeoWidget.register('ch03_ccg', function (ui, el) {
    var H = CH03, f = H.f, D = H.D;
    var A0 = [-5, -2.5];
    var st = { al: 35, c: 6, a: 4, psi: -100, sols: [] };

    function ptB() { return H.polar(A0, st.c, st.al * D); }
    function ptP() { return H.polar(ptB(), st.a, st.psi * D); }
    function solve() {   // giao của đường tròn (B, a) với tia Ax
      var B = ptB(), h = B[1] - A0[1], s = [];
      if (st.a < h - 1e-9) return s;
      var dx = Math.sqrt(Math.max(0, st.a * st.a - h * h));
      [B[0] + dx, B[0] - dx].forEach(function (x, i) {
        if (x > A0[0] + 1e-6 && !(i === 1 && dx < 1e-6)) s.push([x, A0[1]]);
      });
      return s;
    }
    var g = ui.group('Dữ kiện c.c.g (nhập số)');
    var inAl = ui.number({ label: 'Góc A (°)', value: st.al, min: 1, max: 179, onChange: function (v) { st.al = v; sync(); } }, g);
    var inC = ui.number({ label: 'Cạnh kề AB = c', value: st.c, min: 0.5, max: 10, onChange: function (v) { st.c = v; sync(); } }, g);
    var inA = ui.number({ label: 'Cạnh đối BC = a', value: st.a, min: 0.5, max: 12, onChange: function (v) { st.a = v; sync(); } }, g);
    var inP = ui.number({ label: 'Hướng của cạnh BC (°)', value: st.psi, min: -360, max: 360, onChange: function (v) { st.psi = v; sync(); } }, g);
    var row = ui.row();
    ui.button(row, '→ C₁', function () { aim(0); }, 'chip');
    ui.button(row, '→ C₂', function () { aim(1); }, 'chip');
    ui.button(row, '↺ Đặt lại', function () { st.al = 35; st.c = 6; st.a = 4; st.psi = -100; sync(); }, 'btn secondary');
    var out = ui.readout([['h', 'h = c·sin A'], ['n', 'Số tam giác'], ['t1', 'AC₁; ∠ABC₁; ∠C₁'], ['t2', 'AC₂; ∠ABC₂; ∠C₂']]);
    var note = H.note(ui);

    var BD = GeoWidget.board2d(ui, { bbox: [-6.5, 4.5, 7.5, -4.5], grid: true, aria: 'Hai tam giác khác nhau cùng có góc A, cạnh AB và cạnh BC cho trước',
      hint: 'Kéo B dọc tia AB · kéo đầu mút P của cạnh BC (quay quanh B) · Cuộn để phóng to' });
    var Pb = null, Pp = null;
    function aim(i) { var s = solve(); if (!s[i]) return; var B = ptB(); st.psi = Math.atan2(s[i][1] - B[1], s[i][0] - B[0]) / D; sync(); }
    function sync() {
      H.put(inAl, st.al, 1); H.put(inC, st.c); H.put(inA, st.a); H.put(inP, st.psi, 1);
      if (Pb) { Pb.moveTo(ptB()); Pp.moveTo(ptP()); }
      refresh(); if (BD && BD.board) BD.board.update();
    }
    function tri(Cp) { var B = ptB(); return f(H.dist(A0, Cp)) + '; ' + H.fd(H.ang(A0, B, Cp)) + '; ' + H.fd(H.ang(A0, Cp, B)); }
    function refresh() {
      var s = st.sols = solve(), B = ptB(), h = B[1] - A0[1];
      out('h', f(h));
      out('n', String(s.length));
      out('t1', s[0] ? tri(s[0]) : '–'); out('t2', s[1] ? tri(s[1]) : '–');
      var P = ptP(), hit = s.map(function (q) { return H.dist(P, q) < 0.05; });
      note((s.length === 2 ? '<b>Hai tam giác ABC₁ và ABC₂</b> cùng có ∠A, AB và BC như nhau, nhưng AC₁ ≠ AC₂ nên chúng <b>không bằng nhau</b> (xảy ra khi h < a < c).'
        : s.length === 1 ? 'Chỉ có <b>một</b> tam giác thỏa mãn (khi a ≥ c hoặc a = h).' : 'Không có tam giác nào: a < h, cạnh BC quá ngắn để chạm tia Ax.') +
        (hit[0] ? '<br>Đầu mút P đang trùng C₁.' : hit[1] ? '<br>Đầu mút P đang trùng C₂.' : '<br>Kéo P (hoặc bấm → C₁, → C₂) để cạnh BC chạm tia Ax.'));
    }
    function draw(board, C) {
      var A = board.create('point', A0, { name: 'A', fixed: true, size: 3, color: C.text, label: { offset: [-16, -10] } });
      board.create('arrow', [A0, [A0[0] + 12.5, A0[1]]], { strokeColor: C.muted, strokeWidth: 1.5, fixed: true, highlight: false });
      H.label(board, function () { return [A0[0] + 12.2, A0[1] - 0.4]; }, 'x', { strokeColor: C.muted });
      H.path(board, function () { return [A0, H.polar(A0, 14, st.al * D)]; }, { strokeColor: C.muted, strokeWidth: 1, dash: 2 });
      Pb = board.create('point', ptB(), { name: 'B', size: 5, color: C.blue, label: { offset: [-6, 14] } });
      H.path(board, function () { return H.arcPts(ptB(), st.a, 0, 2 * Math.PI, 120); }, { strokeColor: C.purple, strokeWidth: 1, dash: 2 });
      var sol = [0, 1].map(function (i) { return function () { return st.sols[i] || [NaN, NaN]; }; });
      var fills = [[C.fillBlue, C.blue], [C.fillOrange, C.orange]];
      [0, 1].forEach(function (i) {
        H.path(board, function () { var s = st.sols[i]; return s ? [A0, ptB(), s, A0] : null; }, { strokeColor: fills[i][1], strokeWidth: 2.5, fillColor: fills[i][0], fillOpacity: 1 });
        H.dep(board, sol[i], { name: i ? 'C₂' : 'C₁', color: fills[i][1], size: 4, label: { offset: [-4, -16] }, visible: function () { return !!st.sols[i]; } });
      });
      H.path(board, function () { var w = [0, st.al * D]; return H.sectorPts(A0, 0.9, w[0], w[1]); }, { strokeColor: C.green, fillColor: C.fillGreen, fillOpacity: 1 });
      Pp = board.create('point', ptP(), { name: 'P', size: 5, color: C.purple, label: { offset: [8, -10] } });
      H.path(board, function () { return [ptB(), ptP()]; }, { strokeColor: C.purple, strokeWidth: 3 });
      H.label(board, function () { return H.add(H.mid(ptB(), ptP()), [0.35, 0.25]); }, function () { return 'a = ' + f(st.a); }, { strokeColor: C.purple, fontSize: 14 });
      H.label(board, function () { return H.add(H.mid(A0, ptB()), [-0.45, 0.35]); }, function () { return 'c = ' + f(st.c); }, { fontSize: 14 });
      Pb.on('drag', function () { var u = [Math.cos(st.al * D), Math.sin(st.al * D)], P = H.sub(H.xy(Pb), A0); st.c = Math.min(10, Math.max(0.5, P[0] * u[0] + P[1] * u[1])); Pb.moveTo(ptB()); Pp.moveTo(ptP()); H.put(inC, st.c); refresh(); });
      Pp.on('drag', function () {
        var B = ptB(), P = H.xy(Pp); st.psi = Math.atan2(P[1] - B[1], P[0] - B[0]) / D;
        st.sols = solve(); st.sols.forEach(function (q) { if (H.dist(P, q) < 0.35) st.psi = Math.atan2(q[1] - B[1], q[0] - B[0]) / D; });
        H.put(inP, st.psi, 1); refresh();
      });
      Pp.on('up', function () { Pp.moveTo(ptP()); });
      refresh();
    }
    if (BD) BD.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
