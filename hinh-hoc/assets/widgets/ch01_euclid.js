/* ch01_euclid.js — Điểm, đoạn thẳng, đường thẳng, tia, góc: kéo điểm, xem tên gọi, ký hiệu và số đo. */
(function () {
  'use strict';
  var U = GeoWidget.ch01, f = U.f;

  GeoWidget.register('ch01_euclid', function (ui, el) {
    var DEF = { A: [-4, -1], B: [3, 2], O: [-1, -3] };
    var st = { mode: el.getAttribute('data-mode') || 'doan', A: DEF.A.slice(), B: DEF.B.slice(), O: DEF.O.slice(), opp: false };

    var selMode = ui.select({ label: 'Đối tượng', value: st.mode, options: [['doan', 'Đoạn thẳng AB'], ['duong', 'Đường thẳng AB'], ['tia', 'Tia AB (gốc A)'], ['goc', 'Góc AOB']],
      onChange: function (v) { st.mode = v; layout(); B.build(draw); } });
    var g = ui.group('Tọa độ các điểm (nhập số)');
    var rA = U.pointRow(ui, g, 'A', st.A, function (p) { st.A = p; P.A && P.A.moveTo(p); refresh(); });
    var rB = U.pointRow(ui, g, 'B', st.B, function (p) { st.B = p; P.B && P.B.moveTo(p); refresh(); });
    var rO = U.pointRow(ui, g, 'O', st.O, function (p) { st.O = p; P.O && P.O.moveTo(p); refresh(); });
    var gA = ui.group('Đo góc');
    var inAng = ui.number({ label: 'Số đo góc AOB (°)', value: 90, min: 0, max: 180, onChange: function (v) { setAngle(v); } }, gA);
    var note = document.createElement('div'); note.className = 'ctl-note';
    note.textContent = 'Nhập số đo: tia OB quay quanh O (giữ nguyên độ dài OB) để góc AOB có số đo đó.'; gA.appendChild(note);
    var rowOpp = ui.row();
    var cbOpp = ui.checkbox('Hiện tia đối của tia AB', false, function (v) { st.opp = v; B.build(draw); }, rowOpp);
    var row2 = ui.row();
    ui.button(row2, '↺ Đặt lại', function () {
      st.A = DEF.A.slice(); st.B = DEF.B.slice(); st.O = DEF.O.slice(); rA.set(st.A); rB.set(st.B); rO.set(st.O); B.resetView(); B.build(draw);
    }, 'btn secondary');
    var setOut = ui.readout([['ten', 'Tên gọi'], ['kh', 'Ký hiệu'], ['do', 'Số đo'], ['loai', 'Nhận xét']]);

    var B = GeoWidget.board2d(ui, { bbox: [-7, 6, 7, -6], axis: true, grid: true, ratio: 1.15, maxH: 640, aria: 'Các đối tượng hình học cơ bản: điểm, đoạn thẳng, đường thẳng, tia và góc' });
    var P = {};

    function layout() {
      rO.box.style.display = st.mode === 'goc' ? '' : 'none';
      gA.style.display = st.mode === 'goc' ? '' : 'none';
      rowOpp.parentNode.style.display = st.mode === 'tia' ? '' : 'none';
      selMode.value = st.mode;
    }
    function setAngle(deg) {
      // đặt B sao cho góc AOB = deg, B nằm "ngược chiều kim đồng hồ" so với OA
      var r = U.dist(st.O, st.B) || 3;
      var a0 = Math.atan2(st.A[1] - st.O[1], st.A[0] - st.O[0]) + deg * U.RAD;
      st.B = [st.O[0] + r * Math.cos(a0), st.O[1] + r * Math.sin(a0)];
      if (P.B) P.B.moveTo(st.B);
      rB.set(st.B); refresh();
    }
    function kind(a) {
      if (!isFinite(a)) return 'chưa xác định (hai điểm trùng nhau)';
      if (Math.abs(a) < 0.05) return 'hai tia OA, OB trùng nhau (góc 0°)';
      if (Math.abs(a - 90) < 0.05) return 'góc vuông';
      if (Math.abs(a - 180) < 0.05) return 'góc bẹt';
      return a < 90 ? 'góc nhọn (nhỏ hơn 90°)' : 'góc tù (lớn hơn 90° và nhỏ hơn 180°)';
    }
    function refresh() {
      var same = U.dist(st.A, st.B) < 1e-9;
      if (st.mode === 'doan') {
        setOut('ten', 'Đoạn thẳng AB (cũng là đoạn BA)');
        setOut('kh', 'AB');
        setOut('do', 'AB = ' + f(U.dist(st.A, st.B)) + '; trung điểm M' + U.pt([(st.A[0] + st.B[0]) / 2, (st.A[1] + st.B[1]) / 2]));
        setOut('loai', same ? 'A trùng B: không có đoạn thẳng' : 'Có hai đầu mút A và B, độ dài hữu hạn.');
      } else if (st.mode === 'duong') {
        setOut('ten', 'Đường thẳng AB (cũng là đường thẳng BA)');
        setOut('kh', 'AB, hoặc một chữ thường như d');
        setOut('do', 'Không đo được độ dài (kéo dài vô hạn về hai phía)');
        setOut('loai', same ? 'A trùng B: có vô số đường thẳng qua A' : 'Qua hai điểm phân biệt A, B có đúng một đường thẳng.');
      } else if (st.mode === 'tia') {
        setOut('ten', 'Tia AB: gốc A, đi qua B');
        setOut('kh', 'tia AB (khác tia BA)');
        setOut('do', 'Không đo được độ dài (kéo dài vô hạn về một phía)');
        setOut('loai', st.opp ? 'Tia AB và tia đối của nó chung gốc A, tạo thành đường thẳng AB.' : 'Gốc A phải viết trước trong ký hiệu.');
      } else {
        var a = U.angle(st.A, st.O, st.B);
        setOut('ten', 'Góc AOB: đỉnh O, hai cạnh là tia OA (Ox) và tia OB (Oy)');
        setOut('kh', '∠AOB (= ∠BOA = ∠xOy = ∠O)');
        setOut('do', isFinite(a) ? '∠AOB = ' + f(a, 1) + '°' : '—');
        setOut('loai', kind(a));
        U.setNum(inAng, isFinite(a) ? a : 0);
      }
      if (B && B.board) B.board.update();
    }

    function draw(board, C) {
      var drag = function (k, row) {
        P[k].on('drag', function () { st[k] = [P[k].X(), P[k].Y()]; row.set(st[k]); refresh(); });
      };
      P.A = board.create('point', st.A, { name: 'A', size: 4, color: C.blue, label: { offset: [-16, 14] } });
      P.B = board.create('point', st.B, { name: 'B', size: 4, color: C.blue, label: { offset: [8, 14] } });
      drag('A', rA); drag('B', rB);
      P.O = null;
      if (st.mode === 'doan') {
        board.create('segment', [P.A, P.B], { strokeColor: C.blue, strokeWidth: 3 });
        board.create('point', [function () { return (P.A.X() + P.B.X()) / 2; }, function () { return (P.A.Y() + P.B.Y()) / 2; }],
          { name: 'M', size: 2, color: C.orange, fixed: true, label: { offset: [6, -12] } });
        board.create('text', [function () { return (P.A.X() + P.B.X()) / 2; }, function () { return (P.A.Y() + P.B.Y()) / 2 + 0.6; },
          function () { return 'AB = ' + f(Math.hypot(P.A.X() - P.B.X(), P.A.Y() - P.B.Y())); }], { strokeColor: C.blue, anchorX: 'middle', fixed: true });
      } else if (st.mode === 'duong') {
        board.create('line', [P.A, P.B], { strokeColor: C.blue, strokeWidth: 3 });
        board.create('text', [function () { return P.B.X() + 0.4; }, function () { return P.B.Y() - 0.6; }, 'd'], { strokeColor: C.blue, fontSize: 17, fixed: true });
      } else if (st.mode === 'tia') {
        board.create('line', [P.A, P.B], { strokeColor: C.blue, strokeWidth: 3, straightFirst: false, straightLast: true, lastArrow: false });
        if (st.opp) {
          var Bx = board.create('point', [function () { return 2 * P.A.X() - P.B.X(); }, function () { return 2 * P.A.Y() - P.B.Y(); }], { visible: false });
          board.create('line', [P.A, Bx], { strokeColor: C.orange, strokeWidth: 3, dash: 2, straightFirst: false, straightLast: true });
        }
        board.create('text', [function () { return P.A.X() - 0.2; }, function () { return P.A.Y() - 0.8; }, 'gốc'], { strokeColor: C.muted, fontSize: 13, fixed: true });
      } else {
        P.O = board.create('point', st.O, { name: 'O', size: 4, color: C.red, label: { offset: [-16, -12] } });
        drag('O', rO);
        board.create('line', [P.O, P.A], { strokeColor: C.blue, strokeWidth: 3, straightFirst: false });
        board.create('line', [P.O, P.B], { strokeColor: C.green, strokeWidth: 3, straightFirst: false });
        var tip = function (Q, d) {
          return [function () { var dx = Q.X() - P.O.X(), dy = Q.Y() - P.O.Y(), L = Math.hypot(dx, dy) || 1; return Q.X() + dx / L * d; },
            function () { var dx = Q.X() - P.O.X(), dy = Q.Y() - P.O.Y(), L = Math.hypot(dx, dy) || 1; return Q.Y() + dy / L * d + 0.3; }];
        };
        var tx = tip(P.A, 1.4), ty = tip(P.B, 1.4);
        board.create('text', [tx[0], tx[1], 'x'], { strokeColor: C.blue, fontSize: 17, fixed: true });
        board.create('text', [ty[0], ty[1], 'y'], { strokeColor: C.green, fontSize: 17, fixed: true });
        board.create('nonreflexangle', [P.A, P.O, P.B], { radius: 1, name: '', fillColor: C.orange, fillOpacity: 0.25, strokeColor: C.orange, withLabel: false });
        board.create('text', [function () {
          var u = Math.atan2(P.A.Y() - P.O.Y(), P.A.X() - P.O.X()), v = Math.atan2(P.B.Y() - P.O.Y(), P.B.X() - P.O.X());
          var d = v - u; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
          return P.O.X() + 1.7 * Math.cos(u + d / 2) - 0.4;
        }, function () {
          var u = Math.atan2(P.A.Y() - P.O.Y(), P.A.X() - P.O.X()), v = Math.atan2(P.B.Y() - P.O.Y(), P.B.X() - P.O.X());
          var d = v - u; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
          return P.O.Y() + 1.7 * Math.sin(u + d / 2);
        }, function () { return f(U.angle([P.A.X(), P.A.Y()], [P.O.X(), P.O.Y()], [P.B.X(), P.B.Y()]), 1) + '°'; }], { strokeColor: C.orange, fixed: true });
      }
      U.labels(board, C);
      refresh();
    }
    layout();
    if (B) B.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
