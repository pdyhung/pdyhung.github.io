/* ch03_dung_tam_giac.js — Bài 2: dựng tam giác từ ba yếu tố (c.c.c, c.g.c, g.c.g, g.g.c). */
(function () {
  'use strict';
  var MODES = {
    ccc: { name: 'c.c.c (ba cạnh)', keys: ['a', 'b', 'c'] },
    cgc: { name: 'c.g.c (hai cạnh và góc xen giữa)', keys: ['b', 'A', 'c'] },
    gcg: { name: 'g.c.g (một cạnh và hai góc kề)', keys: ['A', 'c', 'B'] },
    ggc: { name: 'g.g.c (hai góc và cạnh đối diện một góc)', keys: ['A', 'B', 'a'] }
  };
  var LBL = { a: 'Cạnh a = BC', b: 'Cạnh b = CA', c: 'Cạnh c = AB', A: 'Góc A (°)', B: 'Góc B (°)', C: 'Góc C (°)' };

  GeoWidget.register('ch03_dung_tam_giac', function (ui, el) {
    var H = CH03, f = H.f, D = H.D;
    var A0 = [-4, -2.5];
    var st = { mode: el.getAttribute('data-mode') || 'ccc', a: 5, b: 4, c: 6, A: 0, B: 0, C: 0, sgn: 1, msg: '' };
    // tính góc cho bộ mặc định
    function anglesFromSides(s) {
      s.A = Math.acos((s.b * s.b + s.c * s.c - s.a * s.a) / (2 * s.b * s.c)) / D;
      s.B = Math.acos((s.a * s.a + s.c * s.c - s.b * s.b) / (2 * s.a * s.c)) / D;
      s.C = 180 - s.A - s.B;
    }
    anglesFromSides(st);
    var val = { a: st.a, b: st.b, c: st.c, A: st.A, B: st.B };   // giá trị đang nhập

    function solve(m, v) {   // trả về {a,b,c,A,B,C} hoặc chuỗi lỗi
      var r = {};
      if (m === 'ccc') {
        var a = v.a, b = v.b, c = v.c;
        if (a + b <= c || b + c <= a || c + a <= b) return 'Không dựng được: mỗi cạnh phải nhỏ hơn tổng hai cạnh kia (bất đẳng thức tam giác).';
        r = { a: a, b: b, c: c }; anglesFromSides(r); return r;
      }
      if (m === 'cgc') {
        if (v.A <= 0 || v.A >= 180) return 'Góc A phải nằm giữa 0° và 180°.';
        r = { b: v.b, c: v.c, A: v.A };
        r.a = Math.sqrt(v.b * v.b + v.c * v.c - 2 * v.b * v.c * Math.cos(v.A * D));
        r.B = Math.acos((r.a * r.a + r.c * r.c - r.b * r.b) / (2 * r.a * r.c)) / D; r.C = 180 - r.A - r.B; return r;
      }
      if (m === 'gcg' || m === 'ggc') {
        if (v.A + v.B >= 180) return 'Không dựng được: tổng hai góc A + B phải nhỏ hơn 180°.';
        r = { A: v.A, B: v.B, C: 180 - v.A - v.B };
        if (m === 'gcg') { r.c = v.c; r.a = r.c * Math.sin(r.A * D) / Math.sin(r.C * D); r.b = r.c * Math.sin(r.B * D) / Math.sin(r.C * D); }
        else { r.a = v.a; r.b = r.a * Math.sin(r.B * D) / Math.sin(r.A * D); r.c = r.a * Math.sin(r.C * D) / Math.sin(r.A * D); }
        return r;
      }
    }
    function apply() {
      var r = solve(st.mode, val);
      if (typeof r === 'string') { st.msg = r; refresh(); return; }
      if (Math.max(r.a, r.b, r.c) > 12) { st.msg = 'Tam giác quá lớn để hiển thị (cạnh dài nhất phải ≤ 12).'; refresh(); return; }
      st.msg = ''; ['a', 'b', 'c', 'A', 'B', 'C'].forEach(function (k) { st[k] = r[k]; });
      if (Pb) { Pb.moveTo(ptB()); Pc.moveTo(ptC()); }
      fit(); refresh();
    }
    function ptB() { return [A0[0] + st.c, A0[1]]; }
    function ptC() { return H.polar(A0, st.b, st.sgn * st.A * D); }

    var sel = ui.select({ label: 'Trường hợp', value: st.mode, options: Object.keys(MODES).map(function (k) { return [k, MODES[k].name]; }),
      onChange: function (m) { st.mode = m; buildInputs(); BD.build(draw); } });
    var grp = ui.group('Ba yếu tố cho trước (nhập số)');
    var inputs = {};
    function buildInputs() {
      while (grp.children.length > 1) grp.removeChild(grp.lastChild);
      inputs = {};
      MODES[st.mode].keys.forEach(function (k) {
        val[k] = st[k];
        var isAng = k === k.toUpperCase();
        inputs[k] = ui.number({ label: LBL[k], value: +st[k].toFixed(2), min: isAng ? 1 : 0.5, max: isAng ? 179 : 12,
          onChange: function (v) { val[k] = v; apply(); } }, grp);
      });
    }
    buildInputs();
    var out = ui.readout([['sides', 'Cạnh a; b; c'], ['angs', 'Góc A; B; C'], ['sum', 'A + B + C'], ['area', 'Diện tích']]);
    var note = H.note(ui);

    var BD = GeoWidget.board2d(ui, { bbox: [-6, 6, 8, -4], grid: true, aria: 'Tam giác ABC dựng từ ba yếu tố cho trước',
      hint: 'Kéo B (trên đường nằm ngang) hoặc C · Cuộn để phóng to' });
    var Pa = null, Pb = null, Pc = null;

    function fit() {   // nới khung nhìn nếu tam giác ra ngoài
      if (!BD || !BD.board) return;
      var bb = BD.board.getBoundingBox(), C = ptC(), B = ptB();
      var xs = [A0[0], B[0], C[0]], ys = [A0[1], B[1], C[1]];
      var x0 = Math.min.apply(0, xs) - 1.5, x1 = Math.max.apply(0, xs) + 1.5, y0 = Math.min.apply(0, ys) - 1.5, y1 = Math.max.apply(0, ys) + 1.5;
      if (x0 < bb[0] || x1 > bb[2] || y1 > bb[1] || y0 < bb[3]) BD.board.setBoundingBox([Math.min(x0, bb[0]), Math.max(y1, bb[1]), Math.max(x1, bb[2]), Math.min(y0, bb[3])], true);
      BD.board.update();
    }
    function readFromBoard() {
      var A = A0, B = H.xy(Pb), C = H.xy(Pc);
      st.c = H.dist(A, B); st.b = H.dist(A, C); st.a = H.dist(B, C);
      st.A = H.ang(B, A, C); st.B = H.ang(A, B, C); st.C = H.ang(A, C, B);
      st.sgn = C[1] >= A[1] ? 1 : -1; st.msg = '';
      MODES[st.mode].keys.forEach(function (k) { val[k] = st[k]; H.put(inputs[k], st[k]); });
      refresh();
    }
    function refresh() {
      out('sides', f(st.a) + '; ' + f(st.b) + '; ' + f(st.c));
      out('angs', H.fd(st.A) + '; ' + H.fd(st.B) + '; ' + H.fd(st.C));
      out('sum', H.fd(st.A + st.B + st.C));
      out('area', f(0.5 * st.b * st.c * Math.sin(st.A * D)));
      var ks = MODES[st.mode].keys.map(function (k) { return k === k.toUpperCase() ? '∠' + k : k; });
      note(st.msg ? '⚠ ' + st.msg : ('Ba yếu tố ' + ks.join(', ') + ' xác định duy nhất tam giác (sai khác một phép dời hình).'));
    }

    function draw(board, C) {
      var keys = MODES[st.mode].keys;
      Pa = board.create('point', A0, { name: 'A', fixed: true, size: 3, color: C.muted, label: { offset: [-16, -10] } });
      var base = board.create('line', [A0, [A0[0] + 1, A0[1]]], { strokeColor: C.border, strokeWidth: 1, dash: 2, fixed: true, highlight: false });
      Pb = board.create('glider', ptB().concat([base]), { name: 'B', size: 5, color: C.blue, label: { offset: [8, -12] } });
      Pc = board.create('point', ptC(), { name: 'C', size: 5, color: C.blue, label: { offset: [6, 12] } });
      var V = { A: Pa, B: Pb, C: Pc };
      var sides = { a: ['B', 'C'], b: ['C', 'A'], c: ['A', 'B'] };
      Object.keys(sides).forEach(function (k) {
        var on = keys.indexOf(k) >= 0, s = sides[k];
        board.create('segment', [V[s[0]], V[s[1]]], { strokeColor: on ? C.orange : C.blue, strokeWidth: on ? 5 : 2, highlight: false, fixed: true });
        H.label(board, function () {   // nhãn tên cạnh, đặt lệch ra ngoài tam giác
          var P = H.xy(V[s[0]]), Q = H.xy(V[s[1]]), M = H.mid(P, Q), O = H.xy(V[k.toUpperCase()]);
          var n = H.sub(M, O), L = Math.hypot(n[0], n[1]) || 1; return H.add(M, H.mul(n, 0.45 / L));
        }, function () { return k + ' = ' + f(k === 'a' ? st.a : k === 'b' ? st.b : st.c); }, { strokeColor: on ? C.orange : C.text, fontSize: 14 });
      });
      board.create('polygon', [Pa, Pb, Pc], { fillColor: C.fillBlue, fillOpacity: 1, borders: { visible: false }, highlight: false });
      ['A', 'B', 'C'].forEach(function (k, i) {
        var on = keys.indexOf(k) >= 0, nb = ['B', 'C', 'A'][i], pv = ['C', 'A', 'B'][i];
        H.path(board, function () {
          var w = H.wedge(H.xy(V[nb]), H.xy(V[k]), H.xy(V[pv])); return H.sectorPts(H.xy(V[k]), 0.8, w[0], w[1]);
        }, { strokeColor: on ? C.orange : C.muted, strokeWidth: on ? 2 : 1, fillColor: on ? C.fillOrange : 'none', fillOpacity: 1 });
        H.label(board, function () {
          var w = H.wedge(H.xy(V[nb]), H.xy(V[k]), H.xy(V[pv])); return H.polar(H.xy(V[k]), 1.35, (w[0] + w[1]) / 2);
        }, function () { return H.fd(st[k], 0); }, { fontSize: 13, strokeColor: on ? C.orange : C.muted });
      });
      Pb.on('drag', function () { if (Pb.X() < A0[0] + 0.5) Pb.moveTo([A0[0] + 0.5, A0[1]]); readFromBoard(); });
      Pc.on('drag', function () { if (Math.abs(Pc.Y() - A0[1]) < 0.2) Pc.moveTo([Pc.X(), A0[1] + (Pc.Y() >= A0[1] ? 0.2 : -0.2)]); readFromBoard(); });
      refresh();
    }
    if (BD) BD.build(draw);
    refresh();
    el.__debug = function () { return st; };
  });
})();
