/* ch02_dinh_nghia.js — Dựng ảnh của một điểm theo đúng định nghĩa, từng bước (Bài 2, Chương 2). */
(function () {
  'use strict';
  var STEPS = {
    tt: ['Qua M kẻ đường thẳng song song (hoặc trùng) với giá của vectơ v.',
      'Trên đường thẳng đó lấy M′ sao cho vectơ MM′ cùng hướng với v và MM′ = |v|.',
      'Kiểm tra: OVM′M là hình bình hành, nên vectơ MM′ = vectơ v.'],
    quay: ['Nối tâm O với M.', 'Vẽ đường tròn tâm O, bán kính OM.',
      'Dựng tia Ot sao cho góc lượng giác (OM, Ot) = α (α > 0: ngược chiều kim đồng hồ).',
      'M′ là giao điểm của tia Ot với đường tròn: OM′ = OM và (OM, OM′) = α.'],
    dxt: ['Kẻ MH vuông góc với trục d tại H.', 'Trên tia đối của tia HM lấy M′ sao cho HM′ = HM.',
      'Kiểm tra: d vuông góc với MM′ tại trung điểm H, tức d là đường trung trực của MM′. Mọi điểm I trên d có IM = IM′.'],
    dxtam: ['Nối M với tâm O.', 'Trên tia đối của tia OM lấy M′ sao cho OM′ = OM.', 'Kiểm tra: O là trung điểm của MM′.']
  };
  var ROWS = {
    tt: [['|v|', 'MM′', 'Vectơ MM′', 'Tọa độ M′']],
    quay: [['OM', 'OM′', 'Góc MOM′ (lượng giác)', 'Tọa độ M′']],
    dxt: [['MH', 'HM′', 'Góc giữa MM′ và d', 'IM ; IM′']],
    dxtam: [['OM', 'OM′', 'Trung điểm MM′', 'Tọa độ M′']]
  };
  GeoWidget.register('ch02_dinh_nghia', function (ui, el) {
    var X = CH02, f = X.f;
    var st = { type: el.getAttribute('data-type') || 'quay', M: [4, 1], step: 0, params: {} };
    Object.keys(STEPS).forEach(function (k) { st.params[k] = X.make(k); });
    st.params.tt.a = 3; st.params.tt.b = 2; st.params.quay.alpha = 70; st.params.dxt.phi = 60; st.params.dxt.x0 = -1; st.params.dxt.y0 = 0;
    st.params.dxtam.x0 = 1; st.params.dxtam.y0 = -1;
    function T() { return st.params[st.type]; }

    ui.select({ label: 'Phép biến hình', value: st.type, options: [['tt', 'Phép tịnh tiến'], ['quay', 'Phép quay'], ['dxt', 'Phép đối xứng trục'], ['dxtam', 'Phép đối xứng tâm']],
      onChange: function (v) { st.type = v; st.step = 0; pp.show(T()); relabel(); B.build(draw); } });
    var g = ui.group('Tham số (nhập số)');
    var pp = X.paramPanel(ui, g, 3, function (i, v) { T()[pp.key(T(), i)] = v; B.build(draw); });
    var gm = ui.group('Điểm M (nhập số hoặc kéo)');
    var inM = [0, 1].map(function (j) { return ui.number({ label: j ? 'Tung độ' : 'Hoành độ', value: st.M[j], min: -50, max: 50, onChange: function (v) { st.M[j] = v; B.build(draw); } }, gm); });
    var row = ui.row('Các bước dựng');
    ui.button(row, '◀ Lùi', function () { if (st.step > 0) { st.step--; B.build(draw); } }, 'btn secondary');
    ui.button(row, 'Bước tiếp ▶', function () { if (st.step < STEPS[st.type].length) { st.step++; B.build(draw); } });
    ui.button(row, 'Hiện hết', function () { st.step = STEPS[st.type].length; B.build(draw); }, 'btn secondary');
    var ol = document.createElement('ol'); ol.className = 'ctl-note'; ol.style.margin = '0'; ol.style.paddingLeft = '20px'; ui.side.appendChild(ol);
    var out = ui.readout([['r0', '·'], ['r1', '·'], ['r2', '·'], ['r3', '·']]);
    var dts = ui.side.querySelectorAll('dl.readout dt');
    function relabel() { ROWS[st.type][0].forEach(function (s, i) { dts[i].textContent = s; }); }

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -7], ratio: 1, maxH: 600, axis: true, grid: true, aria: 'Dựng ảnh M′ của điểm M theo định nghĩa phép biến hình' });
    var badge = document.createElement('div'); badge.className = 'badge'; ui.stage.appendChild(badge);

    function Mp() { return X.apply(T(), st.M); }
    function refresh() {
      var t = T(), M = st.M, Q = Mp(), ty = st.type;
      if (document.activeElement !== inM[0]) inM[0].value = +M[0].toFixed(2);
      if (document.activeElement !== inM[1]) inM[1].value = +M[1].toFixed(2);
      pp.show(t);
      var steps = STEPS[ty];
      ol.innerHTML = steps.map(function (s, i) { return '<li style="' + (i < st.step ? 'color:var(--text)' : 'opacity:.55') + (i === st.step - 1 ? ';font-weight:700' : '') + '">' + s + '</li>'; }).join('');
      badge.textContent = 'Bước ' + st.step + '/' + steps.length;
      var r = [];
      if (ty === 'tt') r = [f(Math.hypot(t.a, t.b)), f(X.dist(M, Q)), X.P([Q[0] - M[0], Q[1] - M[1]]), X.P(Q)];
      else if (ty === 'quay') {
        var O = [t.x0, t.y0], a1 = Math.atan2(M[1] - O[1], M[0] - O[0]), a2 = Math.atan2(Q[1] - O[1], Q[0] - O[0]);
        r = [f(X.dist(O, M)), f(X.dist(O, Q)), f(X.norm180((a2 - a1) / X.D), 1) + '°', X.P(Q)];
      } else if (ty === 'dxt') {
        var H = X.foot(M, [t.x0, t.y0], t.phi), I = [t.x0, t.y0];
        var dM = [Q[0] - M[0], Q[1] - M[1]], u = [Math.cos(t.phi * X.D), Math.sin(t.phi * X.D)];
        var ang = Math.hypot(dM[0], dM[1]) < 1e-9 ? '— (M nằm trên d)' : f(Math.acos(Math.min(1, Math.abs(dM[0] * u[0] + dM[1] * u[1]) / Math.hypot(dM[0], dM[1]))) / X.D, 1) + '°';
        r = [f(X.dist(M, H)), f(X.dist(H, Q)), ang, f(X.dist(I, M)) + ' ; ' + f(X.dist(I, Q))];
      } else {
        var O2 = [t.x0, t.y0];
        r = [f(X.dist(O2, M)), f(X.dist(O2, Q)), X.P([(M[0] + Q[0]) / 2, (M[1] + Q[1]) / 2]), X.P(Q)];
      }
      r.forEach(function (s, i) { out('r' + i, s); });
    }
    function draw(board, C) {
      var t = T(), ty = st.type, s = st.step;
      var thin = { strokeColor: C.muted, dash: 2, strokeWidth: 1.5, fixed: true };
      var M = board.create('point', st.M, { name: 'M', size: 4, color: C.blue });
      M.on('drag', function () { st.M = [M.X(), M.Y()]; refresh(); board.update(); });
      var full = s >= STEPS[ty].length;
      var showImg = (ty === 'tt' && s >= 2) || (ty === 'quay' && s >= 4) || (ty === 'dxt' && s >= 2) || (ty === 'dxtam' && s >= 2);
      var Q = board.create('point', [function () { return Mp()[0]; }, function () { return Mp()[1]; }], { name: 'M′', size: 4, color: C.orange, fixed: true, visible: showImg });
      if (ty === 'tt') {
        var O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 2, color: C.muted });
        var V = board.create('point', [t.a, t.b], { name: 'V', size: 4, color: C.purple });
        board.create('arrow', [O, V], { strokeColor: C.purple, strokeWidth: 3, name: 'v', withLabel: true, label: { strokeColor: C.purple } });
        V.on('drag', function () { t.a = V.X(); t.b = V.Y(); refresh(); board.update(); });
        if (s >= 1) board.create('line', [M, [function () { return st.M[0] + t.a; }, function () { return st.M[1] + t.b; }]], thin);
        if (s >= 2) board.create('arrow', [M, Q], { strokeColor: C.orange, strokeWidth: 3 });
        if (s >= 3) { board.create('segment', [O, M], thin); board.create('segment', [V, Q], thin); }
      } else if (ty === 'quay') {
        var Oq = board.create('point', [t.x0, t.y0], { name: 'O', size: 4, color: C.purple });
        Oq.on('drag', function () { t.x0 = Oq.X(); t.y0 = Oq.Y(); refresh(); board.update(); });
        if (s >= 1) board.create('segment', [Oq, M], { strokeColor: C.blue, strokeWidth: 2 });
        if (s >= 2) board.create('circle', [Oq, M], { strokeColor: C.muted, dash: 2, strokeWidth: 1.5, fixed: true });
        if (s >= 3) {
          var Tt = board.create('point', [function () { var q = Mp(), r = X.dist(st.M, [t.x0, t.y0]) || 1; return t.x0 + (q[0] - t.x0) * 7 / r; },
            function () { var q = Mp(), r = X.dist(st.M, [t.x0, t.y0]) || 1; return t.y0 + (q[1] - t.y0) * 7 / r; }], { name: 't', size: 0, fixed: true, label: { strokeColor: C.muted } });
          board.create('segment', [Oq, Tt], { strokeColor: C.orange, dash: 1, strokeWidth: 1.5, fixed: true });
          var ang = t.alpha >= 0 ? [M, Oq, Q] : [Q, Oq, M];
          if (Math.abs(t.alpha) > 0.5 && Math.abs(t.alpha) < 359.5) board.create('angle', ang, { radius: 1, name: 'α', fillColor: C.fillGreen, strokeColor: C.green, label: { strokeColor: C.green } });
        }
        if (s >= 4) board.create('segment', [Oq, Q], { strokeColor: C.orange, strokeWidth: 2 });
      } else if (ty === 'dxt') {
        var I = board.create('point', [t.x0, t.y0], { name: 'I', size: 4, color: C.purple });
        I.on('drag', function () { t.x0 = I.X(); t.y0 = I.Y(); refresh(); board.update(); });
        var d = board.create('line', [I, [function () { return t.x0 + Math.cos(t.phi * X.D); }, function () { return t.y0 + Math.sin(t.phi * X.D); }]],
          { strokeColor: C.purple, strokeWidth: 2, name: 'd', withLabel: true, fixed: true, label: { strokeColor: C.purple, position: 'rt', offset: [-10, 10] } });
        if (s >= 1) {
          var H = board.create('point', [function () { return X.foot(st.M, [t.x0, t.y0], t.phi)[0]; }, function () { return X.foot(st.M, [t.x0, t.y0], t.phi)[1]; }], { name: 'H', size: 3, color: C.green, fixed: true });
          board.create('segment', [M, H], { strokeColor: C.blue, strokeWidth: 2 });
          board.create('angle', [M, H, I], { type: 'square', radius: 0.4, name: '', fillColor: C.fillGreen, strokeColor: C.green, visible: function () { return X.dist(st.M, X.foot(st.M, [t.x0, t.y0], t.phi)) > 0.3 && X.dist([t.x0, t.y0], X.foot(st.M, [t.x0, t.y0], t.phi)) > 0.3; } });
          if (s >= 2) board.create('segment', [H, Q], { strokeColor: C.orange, strokeWidth: 2 });
        }
        if (s >= 3) { board.create('segment', [I, M], thin); board.create('segment', [I, Q], thin); }
      } else {
        var Ot = board.create('point', [t.x0, t.y0], { name: 'O', size: 4, color: C.purple });
        Ot.on('drag', function () { t.x0 = Ot.X(); t.y0 = Ot.Y(); refresh(); board.update(); });
        if (s >= 1) board.create('segment', [M, Ot], { strokeColor: C.blue, strokeWidth: 2 });
        if (s >= 2) board.create('segment', [Ot, Q], { strokeColor: C.orange, strokeWidth: 2 });
        if (s >= 3) board.create('text', [function () { return t.x0 + 0.3; }, function () { return t.y0 - 0.5; }, 'O là trung điểm MM′'], { strokeColor: C.green, fontSize: 14, fixed: true });
      }
      refresh();
    }
    relabel(); pp.show(T());
    if (B) B.build(draw);
    el.__debug = function () { return st; };
  });
})();
