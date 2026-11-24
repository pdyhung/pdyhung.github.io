/* ch01_bien_hinh.js — So sánh các phép biến hình: tịnh tiến, quay, đối xứng trục, vị tự, co giãn, kéo xiên.
   Bảng số đo cho biết phép biến hình có bảo toàn độ dài, góc, chiều hay không, và có phải phép dời hình không. */
(function () {
  'use strict';
  var U = GeoWidget.ch01, f = U.f;
  var TYPES = {
    tinh_tien: { name: 'Phép tịnh tiến', p: [2, -4], labels: ['Hoành độ vectơ v', 'Tung độ vectơ v'] },
    quay: { name: 'Phép quay tâm O', p: [90, 0], labels: ['Góc quay α (°)'] },
    doi_xung: { name: 'Phép đối xứng trục', p: [90, 0], labels: ['Góc của trục d với Ox (°)'] },
    vi_tu: { name: 'Phép vị tự tâm O', p: [2, 0], labels: ['Tỉ số k'] },
    co_gian: { name: 'Co giãn theo trục Ox', p: [2, 0], labels: ['Hệ số co giãn k'] },
    keo_xien: { name: 'Phép kéo xiên', p: [1, 0], labels: ['Hệ số kéo xiên k'] }
  };

  GeoWidget.register('ch01_bien_hinh', function (ui, el) {
    var DEF = { A: [1, 1], B: [4, 1], C: [2, 3] };
    var st = { type: el.getAttribute('data-type') || 'tinh_tien', A: DEF.A.slice(), B: DEF.B.slice(), C: DEF.C.slice(), p: {} };
    Object.keys(TYPES).forEach(function (k) { st.p[k] = TYPES[k].p.slice(); });

    var sel = ui.select({ label: 'Chọn phép biến hình', value: st.type, options: Object.keys(TYPES).map(function (k) { return [k, TYPES[k].name]; }),
      onChange: function (v) { st.type = v; layout(); B.build(draw); } });
    var g = ui.group('Tham số (nhập số)');
    var in1 = ui.number({ label: 'p1', value: 0, min: -360, max: 360, onChange: function (v) { st.p[st.type][0] = v; refresh(); } }, g);
    var in2 = ui.number({ label: 'p2', value: 0, min: -360, max: 360, onChange: function (v) { st.p[st.type][1] = v; refresh(); } }, g);
    var gT = ui.group('Tọa độ tam giác ABC');
    var rows = {};
    ['A', 'B', 'C'].forEach(function (k) { rows[k] = U.pointRow(ui, gT, k, st[k], function (p) { st[k] = p; P[k] && P[k].moveTo(p); refresh(); }); });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () {
      ['A', 'B', 'C'].forEach(function (k) { st[k] = DEF[k].slice(); rows[k].set(st[k]); });
      st.p[st.type] = TYPES[st.type].p.slice(); layout(); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var setOut = ui.readout([['ct', 'Quy tắc'], ['AB', 'AB → A′B′'], ['BC', 'BC → B′C′'], ['gA', '∠A → ∠A′'], ['S', 'Diện tích'], ['dd', 'Bảo toàn độ dài?'], ['gg', 'Bảo toàn góc?'],
      ['ch', 'Chiều của tam giác'], ['dh', 'Phép dời hình?']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7, 7, 7, -7], axis: true, grid: true, ratio: 1.15, maxH: 640, aria: 'Tam giác ABC và ảnh A′B′C′ qua phép biến hình được chọn' });
    var P = {};

    function label(input) { return input.parentNode.querySelector('label'); }
    function layout() {
      var T = TYPES[st.type], p = st.p[st.type];
      sel.value = st.type;
      label(in1).textContent = T.labels[0]; in1.value = p[0];
      in2.parentNode.style.display = T.labels[1] ? '' : 'none';
      if (T.labels[1]) { label(in2).textContent = T.labels[1]; in2.value = p[1]; }
    }
    /* phần tuyến tính M = [[a, b], [c, d]] và phần dời e = [e1, e2]: T(x; y) = M(x; y) + e */
    function affine() {
      var p = st.p[st.type], t, c, s;
      switch (st.type) {
        case 'tinh_tien': return { M: [1, 0, 0, 1], e: [p[0], p[1]] };
        case 'quay': t = p[0] * U.RAD; c = Math.cos(t); s = Math.sin(t); return { M: [c, -s, s, c], e: [0, 0] };
        case 'doi_xung': t = 2 * p[0] * U.RAD; c = Math.cos(t); s = Math.sin(t); return { M: [c, s, s, -c], e: [0, 0] };
        case 'vi_tu': return { M: [p[0], 0, 0, p[0]], e: [0, 0] };
        case 'co_gian': return { M: [p[0], 0, 0, 1], e: [0, 0] };
        default: return { M: [1, p[0], 0, 1], e: [0, 0] };
      }
    }
    function T(q) { var a = affine(), M = a.M; return [M[0] * q[0] + M[1] * q[1] + a.e[0], M[2] * q[0] + M[3] * q[1] + a.e[1]]; }
    function rule() {
      var p = st.p[st.type];
      switch (st.type) {
        case 'tinh_tien': return '(x; y) → (x ' + U.sgn(p[0]) + '; y ' + U.sgn(p[1]) + ')';
        case 'quay': return 'quay quanh O một góc ' + f(p[0], 1) + '°';
        case 'doi_xung': return 'lấy đối xứng qua đường thẳng d đi qua O, hợp với Ox góc ' + f(p[0], 1) + '°';
        case 'vi_tu': return '(x; y) → (' + f(p[0]) + 'x; ' + f(p[0]) + 'y)';
        case 'co_gian': return '(x; y) → (' + f(p[0]) + 'x; y)';
        default: return '(x; y) → (x ' + U.sgn(p[0]) + 'y; y)';
      }
    }
    function refresh() {
      var A = st.A, Bp = st.B, Cp = st.C, A1 = T(A), B1 = T(Bp), C1 = T(Cp);
      var M = affine().M;
      // M^T M = [[p, q], [q, r]]
      var pp = M[0] * M[0] + M[2] * M[2], qq = M[0] * M[1] + M[2] * M[3], rr = M[1] * M[1] + M[3] * M[3], det = M[0] * M[3] - M[1] * M[2];
      var conf = Math.abs(qq) < 1e-9 && Math.abs(pp - rr) < 1e-9 && pp > 1e-12;
      var iso = conf && Math.abs(pp - 1) < 1e-9;
      setOut('ct', rule());
      setOut('AB', f(U.dist(A, Bp)) + ' → ' + f(U.dist(A1, B1)));
      setOut('BC', f(U.dist(Bp, Cp)) + ' → ' + f(U.dist(B1, C1)));
      setOut('gA', f(U.angle(Bp, A, Cp), 1) + '° → ' + f(U.angle(B1, A1, C1), 1) + '°');
      setOut('S', f(Math.abs(U.sarea(A, Bp, Cp))) + ' → ' + f(Math.abs(U.sarea(A1, B1, C1))));
      setOut('dd', iso ? 'Có' : 'Không');
      setOut('gg', conf ? 'Có' : 'Không');
      setOut('ch', Math.abs(det) < 1e-12 ? 'ảnh suy biến' : (det > 0 ? 'giữ nguyên chiều' : 'đổi chiều (lật hình)'));
      setOut('dh', iso ? 'Có: hình và ảnh bằng nhau' : 'Không');
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var t = st.type;
      if (t === 'quay' || t === 'vi_tu' || t === 'doi_xung' || t === 'co_gian' || t === 'keo_xien')
        board.create('point', [0, 0], { name: 'O', fixed: true, size: 3, color: C.red, label: { offset: [-14, -12] } });
      if (t === 'tinh_tien') {
        board.create('arrow', [[0, 0], [function () { return st.p.tinh_tien[0]; }, function () { return st.p.tinh_tien[1]; }]], { strokeColor: C.purple, strokeWidth: 3 });
        board.create('text', [function () { return st.p.tinh_tien[0] / 2 + 0.2; }, function () { return st.p.tinh_tien[1] / 2 + 0.4; }, 'v'], { strokeColor: C.purple, fontSize: 17, fixed: true });
      }
      if (t === 'doi_xung') {
        board.create('line', [[0, 0], [function () { return Math.cos(st.p.doi_xung[0] * U.RAD); }, function () { return Math.sin(st.p.doi_xung[0] * U.RAD); }]],
          { strokeColor: C.green, strokeWidth: 2.5, dash: 3, fixed: true });
      }
      ['A', 'B', 'C'].forEach(function (k) {
        P[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; rows[k].set(st[k]); refresh(); });
      });
      board.create('polygon', [P.A, P.B, P.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        Q[k] = board.create('point', [function () { return T([P[k].X(), P[k].Y()])[0]; }, function () { return T([P[k].X(), P[k].Y()])[1]; }],
          { name: k + '′', size: 3, color: C.orange, fixed: true });
      });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      U.labels(board, C);
      refresh();
    }
    layout();
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
