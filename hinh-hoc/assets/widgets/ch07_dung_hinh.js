/* ch07_dung_hinh.js — Bài 6: Dựng lục giác đều, tam giác đều, hình vuông nội tiếp bằng thước và compa, từng bước. */
(function () {
  'use strict';
  var fm = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var D2R = Math.PI / 180;
  function n360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* Đường cong/đa giác tô màu vẽ theo dữ liệu tính lại ở mỗi lần cập nhật bảng vẽ */
  function shape(board, fn, attr) {
    var o = { fixed: true, highlight: false, strokeWidth: 2, fillOpacity: 1 };
    for (var k in attr) o[k] = attr[k];
    var c = board.create('curve', [[0], [0]], o);
    c.updateDataArray = function () {
      var p = fn() || [];
      this.dataX = p.map(function (q) { return q[0]; }); this.dataY = p.map(function (q) { return q[1]; });
    };
    return c;
  }
  /* Các điểm trên cung tròn tâm (cx; cy), bán kính r, từ góc a0 đến a1 (độ, đi ngược chiều kim đồng hồ khi a1 > a0) */
  function arcPts(cx, cy, r, a0, a1) {
    var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 2)), p = [];
    for (var i = 0; i <= n; i++) { var t = (a0 + (a1 - a0) * i / n) * D2R; p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
    return p;
  }
  function label(board, fx, fy, fs, attr) {
    var o = { fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle', fontSize: 14 };
    for (var k in attr) o[k] = attr[k];
    return board.create('text', [fx, fy, fs], o);
  }
  /* Dấu góc vuông tại T, hai cạnh hướng về U và V */
  function rightMark(T, U, V, s) {
    var u = [U[0] - T[0], U[1] - T[1]], v = [V[0] - T[0], V[1] - T[1]];
    var lu = Math.hypot(u[0], u[1]) || 1, lv = Math.hypot(v[0], v[1]) || 1;
    u = [u[0] / lu * s, u[1] / lu * s]; v = [v[0] / lv * s, v[1] / lv * s];
    return [[T[0] + u[0], T[1] + u[1]], [T[0] + u[0] + v[0], T[1] + u[1] + v[1]], [T[0] + v[0], T[1] + v[1]]];
  }

  var STEPS = {
    hex: [
      'Bước 1. Vẽ đường tròn (O; R). Lấy một điểm A bất kỳ trên đường tròn.',
      'Bước 2. Giữ nguyên khẩu độ compa bằng R. Đặt mũi nhọn tại A, vẽ một cung cắt đường tròn tại B. Tam giác OAB có ba cạnh bằng R nên là tam giác đều.',
      'Bước 3. Đặt mũi nhọn tại B, vẽ cung cắt đường tròn tại C.',
      'Bước 4. Làm tiếp như vậy từ C, D, E, ta được D, E, F. Cung vẽ từ F đi đúng qua A: đường tròn được chia thành 6 cung bằng nhau, mỗi cung 60°.',
      'Bước 5. Nối A, B, C, D, E, F theo thứ tự: được lục giác đều nội tiếp, cạnh bằng R.'
    ],
    tri: [
      'Bước 1. Vẽ đường tròn (O; R). Lấy một điểm A bất kỳ trên đường tròn.',
      'Bước 2. Giữ khẩu độ compa bằng R, đặt liên tiếp từ A để chia đường tròn thành 6 cung bằng nhau tại A, B, C, D, E, F.',
      'Bước 3. Chọn cách một điểm lấy một điểm: A, C, E. Mỗi cung AC, CE, EA bằng 120°.',
      'Bước 4. Nối A, C, E: được tam giác đều nội tiếp, cạnh bằng R√3.'
    ],
    sq: [
      'Bước 1. Vẽ đường tròn (O; R). Kẻ một đường kính AC đi qua O.',
      'Bước 2. Mở compa rộng hơn R. Vẽ hai cung tâm A và tâm C cùng bán kính, chúng cắt nhau tại M và N.',
      'Bước 3. Kẻ đường thẳng MN: đó là đường trung trực của AC, đi qua O và vuông góc với AC. MN cắt đường tròn tại B và D.',
      'Bước 4. Nối A, B, C, D: được hình vuông nội tiếp, cạnh bằng R√2 (hai đường chéo AC, BD bằng nhau, vuông góc và cắt nhau tại trung điểm).'
    ]
  };
  var NAMES = { hex: 'Lục giác đều', tri: 'Tam giác đều', sq: 'Hình vuông' };
  GeoWidget.register('ch07_dung_hinh', function (ui, el) {
    var st = { shape: el.getAttribute('data-shape') || 'hex', step: 0, R: 3 };
    ui.select({ label: 'Đa giác cần dựng', value: st.shape, options: [['hex', 'Lục giác đều'], ['tri', 'Tam giác đều'], ['sq', 'Hình vuông']],
      onChange: function (v) { st.shape = v; st.step = 0; upd(); } });
    var sR = ui.slider({ label: 'Bán kính R', min: 1.5, max: 4.5, step: 0, value: st.R, decimals: 2, onInput: function (v) { st.R = v; upd(); } });
    var row = ui.row();
    var bPrev = ui.button(row, '◀ Bước trước', function () { if (st.step > 0) { st.step--; upd(); } }, 'btn secondary');
    var bNext = ui.button(row, 'Bước sau ▶', function () { if (st.step < STEPS[st.shape].length - 1) { st.step++; upd(); } });
    ui.button(row, '↺', function () { st.step = 0; st.R = 3; sR.set(3); B.resetView(); upd(); }, 'btn secondary');
    var desc = document.createElement('div'); desc.className = 'ctl-note'; desc.style.fontSize = '14.5px'; desc.style.color = 'inherit';
    desc.setAttribute('aria-live', 'polite'); ui.side.appendChild(desc);
    var out = ui.readout([['step', 'Bước'], ['side', 'Cạnh (theo R)'], ['a', 'Cạnh (số)'], ['P', 'Chu vi'], ['S', 'Diện tích']]);

    var B = GeoWidget.board2d(ui, { bbox: [-6.5, 6.5, 6.5, -6.5], ratio: 0.95, maxH: 600, aria: 'Các bước dựng đa giác đều nội tiếp đường tròn bằng thước và compa', hint: 'Bấm “Bước sau” để xem từng bước dựng · Cuộn để phóng to' });
    function pol(a, rr, c) { c = c || [0, 0]; return [c[0] + rr * Math.cos(a * D2R), c[1] + rr * Math.sin(a * D2R)]; }
    function upd() { if (B && B.board) B.build(draw); refresh(); }
    function info() {
      var R = st.R;
      if (st.shape === 'hex') return { s: 'R', a: R, P: 6 * R, S: 3 * Math.sqrt(3) / 2 * R * R };
      if (st.shape === 'tri') return { s: 'R√3', a: R * Math.sqrt(3), P: 3 * R * Math.sqrt(3), S: 3 * Math.sqrt(3) / 4 * R * R };
      return { s: 'R√2', a: R * Math.sqrt(2), P: 4 * R * Math.sqrt(2), S: 2 * R * R };
    }
    function refresh() {
      var n = STEPS[st.shape].length, i = info(), last = st.step === n - 1;
      desc.textContent = STEPS[st.shape][st.step];
      bPrev.disabled = st.step === 0; bNext.disabled = last;
      out('step', (st.step + 1) + ' / ' + n + ' · ' + NAMES[st.shape]);
      out('side', i.s); out('a', fm(i.a)); out('P', fm(i.P)); out('S', fm(i.S));
    }
    function draw(board, C) {
      var R = st.R, k = st.step, s = st.shape;
      var seg = function (p, q, col, w, dash) { board.create('segment', [p, q], { strokeColor: col, strokeWidth: w || 2, dash: dash || 0, fixed: true, highlight: false }); };
      var pt = function (p, name, col, off) { board.create('point', p, { name: name, size: 3, color: col, fixed: true, label: { offset: off || [8, 8] } }); };
      var compass = function (c, rr, a0, a1, col) { shape(board, function () { return arcPts(c[0], c[1], rr, a0, a1); }, { strokeColor: col, strokeWidth: 1.5 }); };
      board.create('point', [0, 0], { name: 'O', size: 3, color: C.text, fixed: true, label: { offset: [-16, -12] } });
      shape(board, function () { return arcPts(0, 0, R, 0, 360); }, { strokeColor: C.blue, strokeWidth: 2 });
      var lab = 'ABCDEF';
      if (s === 'hex' || s === 'tri') {
        var P = []; for (var i = 0; i < 6; i++) P.push(pol(60 * i, R));
        var off = function (i) { var q = pol(60 * i, 18); return [q[0] - 4, q[1] - 4]; };
        // số điểm chia đã có
        var have = s === 'hex' ? (k === 0 ? 1 : k === 1 ? 2 : k === 2 ? 3 : 6) : (k === 0 ? 1 : 6);
        var arcsFrom = s === 'hex' ? (k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : 6) : (k === 0 ? 0 : 6);
        for (i = 0; i < arcsFrom; i++) {
          var c = P[i], dir = 60 * i + 120; // hướng từ điểm thứ i tới điểm thứ i+1 là 60i + 120°
          compass(c, R, dir - 18, dir + 18, i === arcsFrom - 1 && k < 3 ? C.orange : C.muted);
          if (i === arcsFrom - 1 && k > 0 && k < 3 && s === 'hex') shape(board, function () { return [c, P[(arcsFrom) % 6]]; }, { strokeColor: C.orange, strokeWidth: 1, dash: 2 });
        }
        if (s === 'hex' && k === 1) { seg([0, 0], P[0], C.green, 1.5, 2); seg([0, 0], P[1], C.green, 1.5, 2); seg(P[0], P[1], C.green, 1.5, 2); }
        var hiTri = s === 'tri' && k >= 2;
        for (i = 0; i < have; i++) pt(P[i], lab[i], hiTri && i % 2 === 0 ? C.orange : (hiTri ? C.muted : C.orange), off(i));
        if (s === 'hex' && k === 4) for (i = 0; i < 6; i++) seg(P[i], P[(i + 1) % 6], C.orange, 3);
        if (s === 'hex' && k === 4) shape(board, function () { return P.concat([P[0]]); }, { strokeColor: 'none', fillColor: C.fillOrange, strokeWidth: 0 });
        if (s === 'tri' && k === 3) {
          seg(P[0], P[2], C.orange, 3); seg(P[2], P[4], C.orange, 3); seg(P[4], P[0], C.orange, 3);
          shape(board, function () { return [P[0], P[2], P[4], P[0]]; }, { strokeColor: 'none', fillColor: C.fillOrange, strokeWidth: 0 });
        }
        if (s === 'tri' && k >= 2) { shape(board, function () { return arcPts(0, 0, R * 1.04, 0, 120); }, { strokeColor: C.green, strokeWidth: 3 }); label(board, pol(100, R + 0.5)[0], pol(100, R + 0.5)[1], '120°', { strokeColor: C.green }); }
      } else {
        var A = [-R, 0], Cc = [R, 0], Bq = [0, -R], Dq = [0, R], rho = 1.6 * R, my = Math.sqrt(rho * rho - R * R);
        seg(A, Cc, C.text, 1.5); pt(A, 'A', C.orange, [-18, 6]); pt(Cc, 'C', C.orange, [8, 6]);
        if (k >= 1) {
          compass(A, rho, -50, 50, k === 1 ? C.orange : C.muted); compass(Cc, rho, 130, 230, k === 1 ? C.orange : C.muted);
          pt([0, my], 'M', C.purple, [8, 4]); pt([0, -my], 'N', C.purple, [8, -6]);
        }
        if (k >= 2) {
          shape(board, function () { return [[0, my + 0.6], [0, -my - 0.6]]; }, { strokeColor: C.purple, strokeWidth: 1.5 });
          pt(Bq, 'B', C.orange, [8, -14]); pt(Dq, 'D', C.orange, [8, 8]);
          shape(board, function () { return rightMark([0, 0], [R, 0], [0, R], 0.3); }, { strokeColor: C.red, strokeWidth: 1.5 });
        }
        if (k >= 3) {
          seg(A, Bq, C.orange, 3); seg(Bq, Cc, C.orange, 3); seg(Cc, Dq, C.orange, 3); seg(Dq, A, C.orange, 3);
          shape(board, function () { return [A, Bq, Cc, Dq, A]; }, { strokeColor: 'none', fillColor: C.fillOrange, strokeWidth: 0 });
        }
      }
      label(board, function () { return pol(-35, R / 2)[0]; }, function () { return pol(-35, R / 2)[1]; }, 'R', { strokeColor: C.blue });
      shape(board, function () { return [[0, 0], pol(-55, R)]; }, { strokeColor: C.blue, strokeWidth: 1, dash: 1 });
      refresh();
    }
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
