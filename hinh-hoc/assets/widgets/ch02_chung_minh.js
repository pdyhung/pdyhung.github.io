/* ch02_chung_minh.js — Minh họa chứng minh bằng phép biến hình: tam giác cân, góc đối đỉnh, hình bình hành (Bài 6, Chương 2). */
(function () {
  'use strict';
  var STEPS = {
    can: ['Cho tam giác ABC cân tại A (AB = AC). Gọi d là đường phân giác của góc BAC; xét phép đối xứng trục d.',
      'Phép đối xứng trục d giữ nguyên A (A nằm trên d) và biến tia AB thành tia AC (d là phân giác).',
      'Phép đối xứng bảo toàn độ dài và AB = AC nên ảnh của B là điểm C; tương tự ảnh của C là B.',
      'Vậy tam giác ABC biến thành tam giác ACB, góc ABC biến thành góc ACB. Phép dời hình bảo toàn góc ⇒ góc B = góc C.'],
    doidinh: ['Hai đường thẳng AA′ và BB′ cắt nhau tại O; góc AOB và góc A′OB′ là hai góc đối đỉnh.',
      'Xét phép quay tâm O góc 180° (chính là phép đối xứng tâm O).',
      'Phép quay này biến tia OA thành tia đối của nó là OA′, biến tia OB thành tia OB′.',
      'Do đó nó biến góc AOB thành góc A′OB′. Phép quay bảo toàn góc ⇒ góc AOB = góc A′OB′.'],
    hbh: ['Cho hình bình hành ABCD. Gọi O là trung điểm của AC; xét phép đối xứng tâm O, nó biến A thành C và C thành A.',
      'Phép đối xứng tâm biến một đường thẳng thành đường thẳng song song (hoặc trùng) với nó. Nên đường thẳng AB biến thành đường thẳng qua C song song với AB, đó là CD; đường thẳng BC (qua C) biến thành đường thẳng qua A song song với BC, đó là AD.',
      'B là giao của AB và BC nên ảnh của B là giao của CD và AD, tức là D. Vậy O cũng là trung điểm của BD.',
      'Hình bình hành ABCD biến thành CDAB, do đó AB = CD, AD = CB và góc A = góc C.']
  };
  GeoWidget.register('ch02_chung_minh', function (ui, el) {
    var X = CH02, f = X.f;
    var st = { sc: el.getAttribute('data-scene') || 'can', l: 5, b: 6, th: 20, beta: 60, Bp: [3, -2], Dp: [-1, 2], A0: [-3, -2], t: 0, step: 0, playing: false, t0: 0 };

    ui.select({ label: 'Định lý cần chứng minh', value: st.sc, options: [['can', 'Tam giác cân có hai góc ở đáy bằng nhau'], ['doidinh', 'Hai góc đối đỉnh thì bằng nhau'], ['hbh', 'Hình bình hành: cạnh đối bằng nhau']],
      onChange: function (v) { st.sc = v; st.t = 0; st.step = 0; st.playing = false; show(); B.build(draw); } });
    var gCan = ui.group('Tam giác cân (nhập số; kéo A)');
    var inL = ui.number({ label: 'Cạnh bên AB = AC', value: st.l, min: 0.5, max: 9, onChange: function (v) { if (v <= st.b / 2 + 0.05) { inL.classList.add('invalid'); inL.title = 'Cần AB > BC : 2'; return; } st.l = v; B.build(draw); } }, gCan);
    var inB = ui.number({ label: 'Đáy BC', value: st.b, min: 0.5, max: 12, onChange: function (v) { if (v >= 2 * st.l - 0.1) { inB.classList.add('invalid'); inB.title = 'Cần BC < 2·AB'; return; } st.b = v; B.build(draw); } }, gCan);
    var gDd = ui.group('Hai đường thẳng (nhập số; kéo A, B)');
    var inTh = ui.number({ label: 'Hướng tia OA (°)', value: st.th, min: -360, max: 360, onChange: function (v) { st.th = v; B.build(draw); } }, gDd);
    var inBe = ui.number({ label: 'Góc AOB (°)', value: st.beta, min: 1, max: 179, onChange: function (v) { st.beta = v; B.build(draw); } }, gDd);
    var gH = ui.group('Hình bình hành, A(−3; −2) (nhập số; kéo B, D)');
    var inH = [['Bp', 0, 'B: hoành độ'], ['Bp', 1, 'B: tung độ'], ['Dp', 0, 'D: hoành độ'], ['Dp', 1, 'D: tung độ']].map(function (q) {
      return ui.number({ label: q[2], value: st[q[0]][q[1]], min: -20, max: 20, onChange: function (v) { st[q[0]][q[1]] = v; B.build(draw); } }, gH);
    });
    var sl = ui.slider({ label: 'Tiến trình phép biến hình', min: 0, max: 1, step: 0.01, value: 0, scale: 100, decimals: 0, unit: '%', onInput: function (v) { st.t = v; st.playing = false; upd(); } });
    var r = ui.row();
    ui.button(r, '▶ Thực hiện phép biến hình', function () { st.t = 0; st.t0 = 0; st.playing = true; });
    ui.button(r, '↺', function () { st.playing = false; st.t = 0; upd(); }, 'btn secondary').title = 'Đặt lại';
    var r2 = ui.row('Các bước chứng minh');
    ui.button(r2, '◀ Lùi', function () { if (st.step > 0) st.step--; upd(); }, 'btn secondary');
    ui.button(r2, 'Bước tiếp ▶', function () { if (st.step < 4) st.step++; if (st.step >= 2 && st.t < 1) { st.t0 = 0; st.playing = true; } upd(); });
    var ol = document.createElement('ol'); ol.className = 'ctl-note'; ol.style.margin = '0'; ol.style.paddingLeft = '20px'; ui.side.appendChild(ol);
    var out = ui.readout([['r0', '·'], ['r1', '·'], ['r2', '·'], ['r3', '·']]);
    var dts = ui.side.querySelectorAll('dl.readout dt');
    var LBL = { can: ['AB ; AC', 'Góc B ; góc C', 'MB ; MC (M trên BC)', 'Góc AMB'], doidinh: ['Góc AOB', 'Góc A′OB′', 'Góc BOA′', 'AOB + BOA′'], hbh: ['AB ; CD', 'AD ; BC', 'Góc A ; góc C', 'OB ; OD'] };

    var B = GeoWidget.board2d(ui, { bbox: [-7, 6.5, 7, -5.5], ratio: 1.1, maxH: 700, axis: false, grid: true, aria: 'Hình minh họa chứng minh bằng phép biến hình' });

    function T() {
      if (st.sc === 'can') return { type: 'dxt', x0: 0, y0: 0, phi: 90 };
      if (st.sc === 'doidinh') return { type: 'quay', x0: 0, y0: 0, alpha: 180 };
      var c = P().C; return { type: 'dxtam', x0: (st.A0[0] + c[0]) / 2, y0: (st.A0[1] + c[1]) / 2 };
    }
    function P() {
      if (st.sc === 'can') { var h = Math.sqrt(Math.max(0.01, st.l * st.l - st.b * st.b / 4)); return { A: [0, -2 + h], B: [-st.b / 2, -2], C: [st.b / 2, -2], M: [0, -2] }; }
      if (st.sc === 'doidinh') { var a = st.th * X.D, b = (st.th + st.beta) * X.D; return { A: [4 * Math.cos(a), 4 * Math.sin(a)], B: [4 * Math.cos(b), 4 * Math.sin(b)], O: [0, 0], A1: [-4 * Math.cos(a), -4 * Math.sin(a)], B1: [-4 * Math.cos(b), -4 * Math.sin(b)] }; }
      var A = st.A0, Bq = st.Bp, D = st.Dp, Cc = [Bq[0] + D[0] - A[0], Bq[1] + D[1] - A[1]];
      return { A: A, B: Bq, C: Cc, D: D, O: [(A[0] + Cc[0]) / 2, (A[1] + Cc[1]) / 2] };
    }
    function fig() { var p = P(); return st.sc === 'can' ? [p.A, p.B, p.C] : st.sc === 'doidinh' ? [p.A, p.O, p.B] : [p.A, p.B, p.C, p.D]; }
    function moving() { if (st.t <= 0) return []; var tr = T(); return fig().map(function (q) { return X.apply(tr, q, st.t); }); }
    function show() {
      gCan.style.display = st.sc === 'can' ? '' : 'none'; gDd.style.display = st.sc === 'doidinh' ? '' : 'none'; gH.style.display = st.sc === 'hbh' ? '' : 'none';
      LBL[st.sc].forEach(function (s, i) { dts[i].textContent = s; });
    }
    function upd() {
      var p = P(), A = X.angleAt, d = X.dist;
      sl.set(st.t);
      ol.innerHTML = STEPS[st.sc].map(function (s, i) { return '<li style="' + (i < st.step ? '' : 'opacity:.5') + (i === st.step - 1 ? ';font-weight:700' : '') + '">' + s + '</li>'; }).join('');
      var v;
      if (st.sc === 'can') v = [f(d(p.A, p.B)) + ' ; ' + f(d(p.A, p.C)), f(A(p.A, p.B, p.C), 1) + '° ; ' + f(A(p.A, p.C, p.B), 1) + '°', f(d(p.M, p.B)) + ' ; ' + f(d(p.M, p.C)), f(A(p.A, p.M, p.B), 1) + '°'];
      else if (st.sc === 'doidinh') { var g1 = A(p.A, p.O, p.B), g3 = A(p.B, p.O, p.A1); v = [f(g1, 1) + '°', f(A(p.A1, p.O, p.B1), 1) + '°', f(g3, 1) + '°', f(g1 + g3, 1) + '°']; }
      else v = [f(d(p.A, p.B)) + ' ; ' + f(d(p.C, p.D)), f(d(p.A, p.D)) + ' ; ' + f(d(p.B, p.C)), f(A(p.B, p.A, p.D), 1) + '° ; ' + f(A(p.B, p.C, p.D), 1) + '°', f(d(p.O, p.B)) + ' ; ' + f(d(p.O, p.D))];
      v.forEach(function (s, i) { out('r' + i, s); });
      if (document.activeElement !== inL) inL.value = +st.l.toFixed(2);
      if (document.activeElement !== inB) inB.value = +st.b.toFixed(2);
      if (document.activeElement !== inTh) inTh.value = +st.th.toFixed(1);
      if (document.activeElement !== inBe) inBe.value = +st.beta.toFixed(1);
      [st.Bp[0], st.Bp[1], st.Dp[0], st.Dp[1]].forEach(function (x, i) { if (document.activeElement !== inH[i]) inH[i].value = +x.toFixed(2); });
      if (B && B.board) B.board.update();
    }
    function fp(fn, i) { return [function () { return fn()[i][0]; }, function () { return fn()[i][1]; }]; }
    function draw(board, C) {
      var sc = st.sc;
      var mv = { strokeColor: C.orange, strokeWidth: 2.5, fillColor: C.fillOrange, fillOpacity: 1, fixed: true, highlight: false };
      if (sc === 'can') {
        var dl = board.create('line', [[0, 0], [0, 1]], { strokeColor: C.purple, dash: 2, strokeWidth: 2, fixed: true, name: 'd', withLabel: true, label: { strokeColor: C.purple, position: 'top', offset: [8, -10] } });
        var pA = board.create('glider', [0, P().A[1], dl], { name: 'A', size: 4, color: C.blue });
        var pB = board.create('point', fp(function () { return [P().B]; }, 0), { name: 'B', size: 3, color: C.blue, fixed: true, label: { offset: [-16, -10] } });
        var pC = board.create('point', fp(function () { return [P().C]; }, 0), { name: 'C', size: 3, color: C.blue, fixed: true, label: { offset: [8, -10] } });
        var pM = board.create('point', [0, -2], { name: 'M', size: 2, color: C.muted, fixed: true, label: { offset: [4, -12] } });
        board.create('polygon', [pA, pB, pC], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2, fixed: true }, vertices: { visible: false }, fixed: true });
        board.create('angle', [pC, pB, pA], { radius: 0.8, name: '', fillColor: C.fillGreen, strokeColor: C.green });
        board.create('angle', [pA, pC, pB], { radius: 0.8, name: '', fillColor: C.fillGreen, strokeColor: C.green });
        pA.on('drag', function () { var y = Math.max(-1.6, Math.min(6.2, pA.Y())); st.l = Math.sqrt((y + 2) * (y + 2) + st.b * st.b / 4); upd(); });
        pA.on('up', function () { B.build(draw); });
        X.shape(board, moving, mv);
        board.create('text', [function () { return (moving()[1] || [0, 0])[0] - 0.2; }, function () { return (moving()[1] || [0, 0])[1] - 0.55; }, 'B*'], { strokeColor: C.orange, fixed: true, fontSize: 14, visible: function () { return st.t > 0; } });
      } else if (sc === 'doidinh') {
        var O = board.create('point', [0, 0], { name: 'O', size: 3, color: C.text, fixed: true, label: { offset: [6, -12] } });
        var qA = board.create('point', P().A, { name: 'A', size: 4, color: C.blue });
        var qB = board.create('point', P().B, { name: 'B', size: 4, color: C.blue });
        var qA1 = board.create('point', fp(function () { return [P().A1]; }, 0), { name: 'A′', size: 3, color: C.blue, fixed: true });
        var qB1 = board.create('point', fp(function () { return [P().B1]; }, 0), { name: 'B′', size: 3, color: C.blue, fixed: true });
        board.create('line', [qA, qA1], { strokeColor: C.blue, strokeWidth: 2, fixed: true });
        board.create('line', [qB, qB1], { strokeColor: C.blue, strokeWidth: 2, fixed: true });
        board.create('angle', [qA, O, qB], { radius: 1.1, name: '', fillColor: C.fillBlue, strokeColor: C.blue });
        board.create('angle', [qA1, O, qB1], { radius: 1.1, name: '', fillColor: C.fillGreen, strokeColor: C.green });
        function lock() { qA.moveTo(P().A); qB.moveTo(P().B); }
        qA.on('drag', function () { var a = Math.atan2(qA.Y(), qA.X()) / X.D; st.th = a; upd(); });
        qB.on('drag', function () { var b = Math.atan2(qB.Y(), qB.X()) / X.D - st.th; b = ((b % 360) + 360) % 360; st.beta = Math.max(1, Math.min(179, b)); upd(); });
        qA.on('up', lock); qB.on('up', lock);
        X.shape(board, moving, { strokeColor: C.orange, strokeWidth: 3, fillColor: 'none', closed: false, fixed: true, highlight: false });
      } else {
        var hA = board.create('point', st.A0, { name: 'A', size: 3, color: C.blue, fixed: true, label: { offset: [-16, -10] } });
        var hB = board.create('point', st.Bp, { name: 'B', size: 4, color: C.blue });
        var hD = board.create('point', st.Dp, { name: 'D', size: 4, color: C.blue });
        var hC = board.create('point', fp(function () { return [P().C]; }, 0), { name: 'C', size: 3, color: C.blue, fixed: true });
        board.create('point', fp(function () { return [P().O]; }, 0), { name: 'O', size: 3, color: C.purple, fixed: true, label: { strokeColor: C.purple } });
        board.create('polygon', [hA, hB, hC, hD], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2, fixed: true }, vertices: { visible: false }, fixed: true });
        board.create('segment', [hA, hC], { strokeColor: C.muted, dash: 2, fixed: true }); board.create('segment', [hB, hD], { strokeColor: C.muted, dash: 2, fixed: true });
        board.create('angle', [hB, hA, hD], { radius: 0.7, name: '', fillColor: C.fillGreen, strokeColor: C.green });
        board.create('angle', [hD, hC, hB], { radius: 0.7, name: '', fillColor: C.fillGreen, strokeColor: C.green });
        hB.on('drag', function () { st.Bp = [hB.X(), hB.Y()]; upd(); });
        hD.on('drag', function () { st.Dp = [hD.X(), hD.Y()]; upd(); });
        X.shape(board, moving, mv);
        board.create('text', [function () { return (moving()[0] || [0, 0])[0] + 0.15; }, function () { return (moving()[0] || [0, 0])[1] + 0.35; }, 'A*'], { strokeColor: C.orange, fixed: true, fontSize: 14, visible: function () { return st.t > 0; } });
      }
      upd();
    }
    show();
    if (B) {
      B.build(draw);
      ui.loop(function (now) {
        if (!st.playing) return;
        if (!st.t0) st.t0 = now - st.t * 2200;
        st.t = Math.min(1, (now - st.t0) / 2200);
        if (st.t >= 1) st.playing = false;
        upd();
      });
    }
    el.__debug = function () { return st; };
  });
})();
