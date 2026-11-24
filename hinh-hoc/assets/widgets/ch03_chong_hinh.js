/* ch03_chong_hinh.js — Bài 1: dời (tịnh tiến, quay, lật) hình cam để chồng khít lên hình xanh. */
(function () {
  'use strict';
  GeoWidget.register('ch03_chong_hinh', function (ui, el) {
    var H = CH03, f = H.f;
    var S = [[-2, -1], [2, -1], [-1, 2]];                 // tam giác gốc (hệ tọa độ riêng)
    var TGT = { x: -3, y: 0.8, th: 15, fl: 1 };           // vị trí của tam giác xanh ABC
    var INIT = { x: 3.2, y: -2, th: 120, fl: -1 };        // vị trí ban đầu của tam giác cam DEF (ngược chiều)
    var st = { x: INIT.x, y: INIT.y, th: INIT.th, fl: INIT.fl, links: true, anim: null };
    var L = 3.2;                                            // độ dài tay quay

    function tf(p, P) {
      var x = P.fl * p[0], y = p[1], t = P.th * H.D;
      return [P.x + x * Math.cos(t) - y * Math.sin(t), P.y + x * Math.sin(t) + y * Math.cos(t)];
    }
    function blue(i) { return tf(S[i], TGT); }
    function orng(i) { return tf(S[i], st); }
    function handle() { return H.polar([st.x, st.y], L, st.th * H.D); }

    var g = ui.group('Vị trí tam giác cam DEF (nhập số)');
    var inX = ui.number({ label: 'Tâm quay: hoành độ', value: st.x, min: -20, max: 20, onChange: function (v) { stop(); st.x = v; sync(); } }, g);
    var inY = ui.number({ label: 'Tâm quay: tung độ', value: st.y, min: -20, max: 20, onChange: function (v) { stop(); st.y = v; sync(); } }, g);
    var inT = ui.number({ label: 'Góc quay (°)', value: st.th, min: -720, max: 720, onChange: function (v) { stop(); st.th = v; sync(); } }, g);
    var cbF = ui.checkbox('Lật hình cam (đối xứng trục)', false, function (v) { animate({ fl: v ? 1 : -1 }, 700); }, g);
    var row = ui.row();
    ui.checkbox('Nối các đỉnh tương ứng', true, function (v) { st.links = v; BD.board.update(); }, row);
    var row2 = ui.row();
    ui.button(row2, '▶ Tự chồng khít', function () {
      var d = ((TGT.th - st.th) % 360 + 540) % 360 - 180;
      animate({ x: TGT.x, y: TGT.y, th: st.th + d, fl: 1 }, 2200); cbF.checked = true;
    });
    ui.button(row2, '↺ Đặt lại', function () { stop(); Object.assign(st, INIT); cbF.checked = false; sync(); }, 'btn secondary');
    var out = ui.readout([['s1', 'AB; BC; CA'], ['s2', 'DE; EF; FD'], ['a1', '∠A; ∠B; ∠C'], ['a2', '∠D; ∠E; ∠F'], ['ori', 'Hướng của DEF'], ['dev', 'Độ lệch đỉnh']]);
    var note = H.note(ui);

    var BD = GeoWidget.board2d(ui, { bbox: [-8, 6, 8, -6], grid: true, aria: 'Tam giác xanh ABC và tam giác cam DEF bằng nhau; dời hình cam để chồng lên hình xanh',
      hint: 'Kéo điểm cam (tâm) để tịnh tiến · kéo điểm tím để quay · Cuộn để phóng to' });
    var M = null, Rh = null;

    function dev() { var m = 0; for (var i = 0; i < 3; i++) m = Math.max(m, H.dist(blue(i), orng(i))); return m; }
    function stop() { st.anim = null; }
    function animate(to, dur) { var from = {}; for (var k in to) from[k] = st[k]; st.anim = { from: from, to: to, dur: dur, t0: 0 }; }
    function snap() {   // gần khớp thì hút vào đúng vị trí
      if (st.anim || st.fl !== 1) return;
      var d = ((TGT.th - st.th) % 360 + 540) % 360 - 180;
      if (Math.hypot(st.x - TGT.x, st.y - TGT.y) < 0.3 && Math.abs(d) < 5) { st.x = TGT.x; st.y = TGT.y; st.th = st.th + d; }
    }
    function refresh() {
      var b = [0, 1, 2].map(blue), o = [0, 1, 2].map(orng);
      out('s1', f(H.dist(b[0], b[1])) + '; ' + f(H.dist(b[1], b[2])) + '; ' + f(H.dist(b[2], b[0])));
      out('s2', f(H.dist(o[0], o[1])) + '; ' + f(H.dist(o[1], o[2])) + '; ' + f(H.dist(o[2], o[0])));
      out('a1', H.fd(H.ang(b[2], b[0], b[1])) + '; ' + H.fd(H.ang(b[0], b[1], b[2])) + '; ' + H.fd(H.ang(b[1], b[2], b[0])));
      out('a2', H.fd(H.ang(o[2], o[0], o[1])) + '; ' + H.fd(H.ang(o[0], o[1], o[2])) + '; ' + H.fd(H.ang(o[1], o[2], o[0])));
      var or = H.orient(o[0], o[1], o[2]);
      out('ori', Math.abs(st.fl) < 0.05 ? 'đang lật…' : (or > 0 ? 'cùng hướng ABC' : 'ngược hướng ABC'));
      var d = dev(); out('dev', f(d));
      note('Đỉnh tương ứng: A ↔ D, B ↔ E, C ↔ F. Độ lệch đỉnh là khoảng cách lớn nhất giữa hai đỉnh tương ứng.<br>' +
        (d < 1e-6 ? '<b>✓ Chồng khít: ΔDEF = ΔABC.</b>' : st.fl < 0 ? '<b>Chưa khớp.</b> Hai tam giác ngược hướng: cần lật hình cam.' : '<b>Chưa khớp.</b> Tiếp tục tịnh tiến và quay hình cam.'));
      st.dev = d;
    }
    function sync() {
      snap();
      H.put(inX, st.x); H.put(inY, st.y); H.put(inT, st.th, 1);
      if (M) { M.moveTo([st.x, st.y]); Rh.moveTo(handle()); }
      refresh(); if (BD && BD.board) BD.board.update();
    }

    function draw(board, C) {
      var Pb = [0, 1, 2].map(function (i) {
        return board.create('point', blue(i), { name: 'ABC'[i], fixed: true, size: 3, color: C.blue, label: { offset: [-16, 12] } });
      });
      board.create('polygon', Pb, { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2.5 }, highlight: false });
      var Po = [0, 1, 2].map(function (i) {
        return H.dep(board, function () { return orng(i); }, { name: 'DEF'[i], color: C.orange, label: { offset: [8, -12] } });
      });
      board.create('polygon', Po, { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2.5, dash: 0 }, highlight: false });
      for (var i = 0; i < 3; i++) board.create('segment', [Pb[i], Po[i]], { strokeColor: C.muted, dash: 2, strokeWidth: 1, highlight: false, visible: function () { return st.links && st.dev > 1e-6; } });
      M = board.create('point', [st.x, st.y], { name: '', size: 5, color: C.orange });
      Rh = board.create('point', handle(), { name: '↻', size: 5, color: C.purple, label: { offset: [8, 8] } });
      board.create('segment', [M, Rh], { strokeColor: C.purple, dash: 1, strokeWidth: 1.5, highlight: false });
      M.on('drag', function () { stop(); st.x = M.X(); st.y = M.Y(); var sx = st.x; snap(); if (st.x !== sx) M.moveTo([st.x, st.y]); Rh.moveTo(handle()); H.put(inX, st.x); H.put(inY, st.y); H.put(inT, st.th, 1); refresh(); });
      Rh.on('drag', function () {
        stop(); var a = Math.atan2(Rh.Y() - st.y, Rh.X() - st.x) / H.D;
        st.th = st.th + (((a - st.th) % 360 + 540) % 360 - 180); snap();
        H.put(inT, st.th, 1); H.put(inX, st.x); H.put(inY, st.y); refresh(); board.update();
      });
      Rh.on('up', function () { Rh.moveTo(handle()); M.moveTo([st.x, st.y]); });
      refresh();
    }
    if (BD) {
      BD.build(draw);
      ui.loop(function (t) {
        var a = st.anim; if (!a) return;
        if (!a.t0) a.t0 = t;
        var u = Math.min(1, (t - a.t0) / a.dur), e = H.ease(u);
        for (var k in a.to) st[k] = a.from[k] + (a.to[k] - a.from[k]) * e;
        if (u >= 1) st.anim = null;
        sync();
      });
    }
    refresh();
    el.__debug = function () { return st; };
  });
})();
