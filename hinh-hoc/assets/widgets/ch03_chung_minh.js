/* ch03_chung_minh.js — Bài 3: dãy phép dời hình (tịnh tiến → quay → lật) đưa ΔABC về ΔDEF. */
(function () {
  'use strict';
  var WHY = {
    ccc: 'Sau bước 2: C* cách D một khoảng CA = FD và cách E một khoảng CB = FE. Hai đường tròn (D; DF) và (E; EF) cắt nhau tại nhiều nhất hai điểm, đối xứng nhau qua DE. Vậy C* = F, hoặc C* là ảnh của F qua phép đối xứng trục DE.',
    cgc: 'Sau bước 2: ∠A = ∠D nên tia DC* trùng tia DF hoặc đối xứng với tia DF qua DE; lại có AC = DF nên C* = F hoặc C* đối xứng với F qua DE.',
    gcg: 'Sau bước 2: ∠A = ∠D và ∠B = ∠E nên tia DC* và tia EC* trùng tia DF, EF hoặc cùng đối xứng với chúng qua DE. Hai tia chỉ cắt nhau tại một điểm nên C* = F hoặc C* đối xứng với F qua DE.'
  };
  GeoWidget.register('ch03_chung_minh', function (ui, el) {
    var H = CH03, f = H.f, D = H.D;
    var INIT = { A: [-6, -1], B: [-2.5, -1.5], C: [-4.5, 2], Dp: [2, -3], th: 70, flip: true };
    var st = { A: INIT.A.slice(), B: INIT.B.slice(), C: INIT.C.slice(), Dp: INIT.Dp.slice(), th: INIT.th, flip: INIT.flip, s: 0, target: 0, mode: 'ccc', speed: 1 / 1300 };

    function T(p) {   // phép dời hình biến ABC thành DEF
      var q = H.sub(p, st.A); if (st.flip) q = [q[0], -q[1]];
      return H.add(st.Dp, H.rot(q, st.th * D));
    }
    function DEF() { return [T(st.A), T(st.B), T(st.C)]; }
    function plan() {   // các tham số của ba bước
      var E = DEF(), v = H.sub(E[0], st.A);
      var phi = H.norm(H.dir(E[0], E[1]) - H.dir(st.A, st.B));
      var C2 = H.rot(H.add(st.C, v), phi, E[0]);
      return { v: v, phi: phi, need: H.dist(C2, E[2]) > 1e-6, E: E };
    }
    function img(p, s, pl) {   // ảnh của điểm p tại thời điểm s ∈ [0; 3]
      pl = pl || plan();
      var u1 = Math.min(1, s), q = H.add(p, H.mul(pl.v, u1));
      if (s <= 1) return q;
      q = H.rot(q, pl.phi * Math.min(1, s - 1), pl.E[0]);
      if (s <= 2 || !pl.need) return q;
      var u = Math.min(1, s - 2), R = H.reflect(q, pl.E[0], pl.E[1]);
      return H.lerp(q, R, u);   // "gập" hình qua trục DE
    }

    var sel = ui.select({ label: 'Lập luận theo trường hợp', value: st.mode, options: [['ccc', 'c.c.c'], ['cgc', 'c.g.c'], ['gcg', 'g.c.g']], onChange: function (m) { st.mode = m; refresh(); } });
    var g = ui.group('Vị trí ΔDEF (nhập số)');
    var inDx = ui.number({ label: 'D: hoành độ', value: st.Dp[0], min: -20, max: 20, onChange: function (v) { st.Dp[0] = v; sync(); } }, g);
    var inDy = ui.number({ label: 'D: tung độ', value: st.Dp[1], min: -20, max: 20, onChange: function (v) { st.Dp[1] = v; sync(); } }, g);
    var inT = ui.number({ label: 'Góc lệch hướng (°)', value: st.th, min: -360, max: 360, onChange: function (v) { st.th = v; sync(); } }, g);
    var cbF = ui.checkbox('ΔDEF ngược hướng với ΔABC', st.flip, function (v) { st.flip = v; sync(); }, g);
    var row = ui.row('Các bước');
    ui.button(row, '◀ Lùi', function () { st.target = Math.max(0, Math.ceil(st.s - 1e-9) - 1); if (st.target < st.s - 1) st.s = st.target + 1; }, 'btn secondary');
    ui.button(row, 'Tiếp ▶', function () { st.target = Math.min(3, Math.floor(st.s + 1e-9) + 1); });
    var row2 = ui.row();
    ui.button(row2, '▶ Phát cả ba bước', function () { st.s = 0; st.target = 3; });
    ui.button(row2, '↺ Đặt lại', function () { st.s = 0; st.target = 0; Object.assign(st, { A: INIT.A.slice(), B: INIT.B.slice(), C: INIT.C.slice(), Dp: INIT.Dp.slice(), th: INIT.th, flip: INIT.flip }); cbF.checked = st.flip; sync(); BD && BD.build(draw); }, 'btn secondary');
    var out = ui.readout([['step', 'Bước'], ['v', '1. Vectơ AD'], ['phi', '2. Góc quay'], ['ref', '3. Lật qua DE'], ['d', 'A*D; B*E; C*F']]);
    var note = H.note(ui);

    var BD = GeoWidget.board2d(ui, { bbox: [-8, 5.5, 8, -6], grid: true, aria: 'Dãy phép dời hình đưa tam giác ABC trùng với tam giác DEF',
      hint: 'Kéo A, B, C để đổi tam giác · kéo D, E để đặt ΔDEF · Cuộn để phóng to' });
    var P = {}, Pd = null, Pe = null;

    var STEP = ['Chưa dời hình', 'Tịnh tiến: A → D', 'Quay quanh D: B → E', 'Đối xứng qua DE: C → F'];
    function refresh() {
      var pl = plan(), k = Math.round(st.s);
      out('step', (Math.abs(st.s - k) < 1e-9 ? k + '/3' : 'đang chạy…'));
      out('v', '(' + f(pl.v[0]) + '; ' + f(pl.v[1]) + ')');
      out('phi', H.fd(pl.phi / D));
      out('ref', pl.need ? 'cần' : 'không cần');
      var s = st.s, E = pl.E;
      out('d', f(H.dist(img(st.A, s, pl), E[0])) + '; ' + f(H.dist(img(st.B, s, pl), E[1])) + '; ' + f(H.dist(img(st.C, s, pl), E[2])));
      note('<b>' + (Math.abs(st.s - k) < 1e-9 ? STEP[k] + '.' : 'Đang dời hình…') + '</b> A*, B*, C* là ảnh của A, B, C.<br>' + WHY[st.mode] + (pl.need ? '' : ' Ở đây C* đã trùng F sau bước 2, không cần lật.'));
    }
    function sync() {
      H.put(inDx, st.Dp[0]); H.put(inDy, st.Dp[1]); H.put(inT, st.th, 1);
      if (Pd) { Pd.moveTo(st.Dp); Pe.moveTo(DEF()[1]); }
      refresh(); if (BD && BD.board) BD.board.update();
    }
    function draw(board, C) {
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue, label: { offset: [-14, 12] } });
        P[k].on('drag', function () { st[k] = H.xy(P[k]); Pe.moveTo(DEF()[1]); refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, highlight: false });
      Pd = board.create('point', st.Dp, { name: 'D', size: 4, color: C.orange, label: { offset: [-16, -10] } });
      Pe = board.create('point', DEF()[1], { name: 'E', size: 4, color: C.orange, label: { offset: [8, -10] } });
      var Pf = H.dep(board, function () { return DEF()[2]; }, { name: 'F', color: C.orange, size: 3, label: { offset: [8, 8] } });
      board.create('polygon', [Pd, Pe, Pf], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, highlight: false });
      board.create('line', [Pd, Pe], { strokeColor: C.purple, dash: 2, strokeWidth: 1, highlight: false, fixed: true, visible: function () { return st.s > 2 - 1e-9 && plan().need; } });
      Pd.on('drag', function () { st.Dp = H.xy(Pd); Pe.moveTo(DEF()[1]); H.put(inDx, st.Dp[0]); H.put(inDy, st.Dp[1]); refresh(); });
      Pe.on('drag', function () {
        var q = H.sub(st.B, st.A); if (st.flip) q = [q[0], -q[1]];
        st.th = (H.dir(st.Dp, H.xy(Pe)) - Math.atan2(q[1], q[0])) / D; H.put(inT, st.th, 1); refresh();
      });
      Pe.on('up', function () { Pe.moveTo(DEF()[1]); });
      // ảnh đang di chuyển
      H.path(board, function () { if (st.s <= 0) return null; var pl = plan(); return [st.A, st.B, st.C, st.A].map(function (p) { return img(p, st.s, pl); }); },
        { strokeColor: C.green, strokeWidth: 2.5, dash: 1, fillColor: C.fillGreen, fillOpacity: 1 });
      ['A', 'B', 'C'].forEach(function (k) {
        H.label(board, function () { var pl = plan(); return H.add(img(st[k], st.s, pl), [0.25, 0.35]); }, k + '*', { strokeColor: C.green, fontSize: 14, visible: function () { return st.s > 0; } });
      });
      // vectơ tịnh tiến và cung quay
      H.path(board, function () { return st.s > 0 && st.s <= 1.0001 ? [st.A, H.add(st.A, plan().v)] : null; }, { strokeColor: C.green, dash: 2, strokeWidth: 1.5, lastArrow: true });
      H.path(board, function () {
        if (st.s <= 1 || st.s > 2.0001) return null; var pl = plan(), a0 = H.dir(pl.E[0], H.add(st.B, pl.v));
        return H.arcPts(pl.E[0], 1.4, a0, a0 + pl.phi * Math.min(1, st.s - 1));
      }, { strokeColor: C.purple, strokeWidth: 2, lastArrow: true });
      refresh();
    }
    if (BD) {
      BD.build(draw);
      var last = 0;
      ui.loop(function (t) {
        var dt = last ? Math.min(60, t - last) : 16; last = t;
        if (Math.abs(st.s - st.target) < 1e-9) return;
        var step = dt * st.speed;
        st.s = st.s < st.target ? Math.min(st.target, st.s + step) : Math.max(st.target, st.s - step);
        if (st.s > 2 && st.s < 3 && !plan().need) st.s = st.target > st.s ? Math.min(st.target, 3) : 2;
        refresh(); BD.board.update();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
