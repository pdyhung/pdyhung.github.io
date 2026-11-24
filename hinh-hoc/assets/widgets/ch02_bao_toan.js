/* ch02_bao_toan.js — Đo khoảng cách, góc, diện tích trước và sau phép biến hình (Bài 1, Chương 2). */
(function () {
  'use strict';
  GeoWidget.register('ch02_bao_toan', function (ui, el) {
    var X = CH02, f = X.f;
    var init = (el.getAttribute('data-type') || 'quay');
    var st = { A: [-5, 1], B: [-2, 1], C: [-4, 4], type: init, params: {} };
    Object.keys(X.TYPES).forEach(function (k) { st.params[k] = X.make(k); });
    st.params.tt.a = 6; st.params.tt.b = -4; st.params.quay.alpha = 90; st.params.dxt.phi = 90; st.params.vitu.k = 1.5; st.params.co.k = 1.5;
    st.params.dxt.x0 = 0; st.params.vitu.x0 = -1; st.params.vitu.y0 = 0;
    function T() { return st.params[st.type]; }
    function img(p) { return X.apply(T(), p); }

    ui.select({ label: 'Phép biến hình', value: st.type, options: [['tt', 'Phép tịnh tiến (dời hình)'], ['quay', 'Phép quay (dời hình)'], ['dxt', 'Phép đối xứng trục (dời hình)'],
      ['dxtam', 'Phép đối xứng tâm (dời hình)'], ['vitu', 'Phép vị tự (không phải dời hình)'], ['co', 'Phép co giãn theo Ox (không phải dời hình)']],
      onChange: function (v) { st.type = v; pp.show(T()); B.build(draw); } });
    var g = ui.group('Tham số (nhập số)');
    var pp = X.paramPanel(ui, g, 3, function (i, v) { T()[pp.key(T(), i)] = v; B.build(draw); });
    var gv = ui.group('Tọa độ các đỉnh (nhập số hoặc kéo)');
    var vin = {};
    ['A', 'B', 'C'].forEach(function (k) {
      vin[k] = [0, 1].map(function (j) {
        return ui.number({ label: k + (j ? ': tung độ' : ': hoành độ'), value: st[k][j], min: -50, max: 50, onChange: function (v) { st[k][j] = v; B.build(draw); } }, gv);
      });
    });
    var row = ui.row();
    ui.button(row, '↺ Đặt lại', function () { st.A = [-5, 1]; st.B = [-2, 1]; st.C = [-4, 4]; syncIn(); B.resetView(); B.build(draw); }, 'btn secondary');
    var out = ui.readout([['AB', 'AB → A′B′'], ['BC', 'BC → B′C′'], ['CA', 'CA → C′A′'], ['gA', 'Góc A → A′'], ['gB', 'Góc B → B′'], ['S', 'Diện tích'],
      ['dir', 'Chiều A→B→C'], ['kl', 'Kết luận']]);

    var B = GeoWidget.board2d(ui, { bbox: [-8, 7, 8, -7], ratio: 1.05, maxH: 640, axis: true, grid: true, aria: 'Tam giác ABC và ảnh A′B′C′; bảng bên cạnh so sánh độ dài, góc trước và sau phép biến hình' });
    var Pt = {};
    function syncIn() { ['A', 'B', 'C'].forEach(function (k) { [0, 1].forEach(function (j) { if (document.activeElement !== vin[k][j]) vin[k][j].value = +st[k][j].toFixed(2); }); }); pp.show(T()); }
    function cmp(a, b, unit) { var same = Math.abs(a - b) < 0.005; return f(a) + unit + ' → ' + f(b) + unit + (same ? '  ✓ bằng' : '  ✗ khác'); }
    function refresh() {
      var P0 = [st.A, st.B, st.C], Q = P0.map(img);
      var l0 = [X.dist(P0[0], P0[1]), X.dist(P0[1], P0[2]), X.dist(P0[2], P0[0])], l1 = [X.dist(Q[0], Q[1]), X.dist(Q[1], Q[2]), X.dist(Q[2], Q[0])];
      out('AB', cmp(l0[0], l1[0], '')); out('BC', cmp(l0[1], l1[1], '')); out('CA', cmp(l0[2], l1[2], ''));
      var gA = X.angleAt(P0[1], P0[0], P0[2]), gA1 = X.angleAt(Q[1], Q[0], Q[2]), gB = X.angleAt(P0[0], P0[1], P0[2]), gB1 = X.angleAt(Q[0], Q[1], Q[2]);
      out('gA', cmp(gA, gA1, '°')); out('gB', cmp(gB, gB1, '°'));
      var s0 = X.area(P0), s1 = X.area(Q);
      out('S', cmp(Math.abs(s0), Math.abs(s1), ''));
      var o0 = s0 > 0 ? 'ngược kim đồng hồ' : 'cùng kim đồng hồ', o1 = s1 > 0 ? 'ngược kim đồng hồ' : 'cùng kim đồng hồ';
      out('dir', s0 * s1 > 0 ? 'giữ nguyên (' + o1 + ')' : 'đảo ngược: ' + o0 + ' → ' + o1);
      var keepLen = l0.every(function (v, i) { return Math.abs(v - l1[i]) < 0.005; }), keepAng = Math.abs(gA - gA1) < 0.05 && Math.abs(gB - gB1) < 0.05;
      out('kl', keepLen ? 'Bảo toàn độ dài và góc → phép dời hình' : keepAng ? 'Bảo toàn góc, độ dài nhân ' + f(l1[0] / l0[0]) + ' → không là phép dời hình' : 'Không bảo toàn độ dài, cũng không bảo toàn góc');
      syncIn();
    }
    function draw(board, C) {
      var t = T(), ty = st.type;
      ['A', 'B', 'C'].forEach(function (k) {
        Pt[k] = board.create('point', st[k], { name: k, size: 4, color: C.blue });
        Pt[k].on('drag', function () { st[k] = [Pt[k].X(), Pt[k].Y()]; refresh(); board.update(); });
      });
      board.create('polygon', [Pt.A, Pt.B, Pt.C], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2 }, vertices: { visible: false } });
      var Q = {};
      ['A', 'B', 'C'].forEach(function (k) {
        Q[k] = board.create('point', [function () { return img(st[k])[0]; }, function () { return img(st[k])[1]; }], { name: k + '′', size: 3, color: C.orange, fixed: true });
      });
      board.create('polygon', [Q.A, Q.B, Q.C], { fillColor: C.fillOrange, fillOpacity: 1, borders: { strokeColor: C.orange, strokeWidth: 2 }, vertices: { visible: false } });
      board.create('nonreflexangle', [Pt.B, Pt.A, Pt.C], { radius: 0.7, name: '', fillColor: C.fillGreen, strokeColor: C.green });
      board.create('nonreflexangle', [Q.B, Q.A, Q.C], { radius: 0.7, name: '', fillColor: C.fillGreen, strokeColor: C.green });
      if (ty === 'tt') {
        var O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 2, color: C.muted });
        var V = board.create('point', [t.a, t.b], { name: 'v', size: 4, color: C.purple });
        board.create('arrow', [O, V], { strokeColor: C.purple, strokeWidth: 3 });
        V.on('drag', function () { t.a = V.X(); t.b = V.Y(); refresh(); board.update(); });
      } else if (ty !== 'co') {
        var Ctr = board.create('point', [t.x0, t.y0], { name: ty === 'dxt' ? 'I' : 'O', size: 4, color: C.purple });
        Ctr.on('drag', function () { t.x0 = Ctr.X(); t.y0 = Ctr.Y(); refresh(); board.update(); });
        if (ty === 'dxt') board.create('line', [Ctr, [function () { return t.x0 + Math.cos(t.phi * X.D); }, function () { return t.y0 + Math.sin(t.phi * X.D); }]],
          { strokeColor: C.purple, strokeWidth: 2, dash: 2, name: 'd', withLabel: true, fixed: true, label: { strokeColor: C.purple } });
        else ['A', 'B', 'C'].forEach(function (k) { board.create('segment', [Ctr, Q[k]], { strokeColor: C.muted, dash: 2, strokeWidth: 1 }); board.create('segment', [Ctr, Pt[k]], { strokeColor: C.muted, dash: 2, strokeWidth: 1 }); });
      } else {
        ['A', 'B', 'C'].forEach(function (k) { board.create('segment', [Pt[k], Q[k]], { strokeColor: C.muted, dash: 2, strokeWidth: 1 }); });
      }
      refresh();
    }
    pp.show(T());
    if (B) B.build(draw);
    el.__debug = function () { return st; };
  });
})();
