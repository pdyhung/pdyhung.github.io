/* ch03_dung_hinh.js — Bài 7: dựng hình bằng thước và compa, từng bước có hoạt ảnh (Tiếp/Lùi). */
(function () {
  'use strict';
  var NaNP = [NaN, NaN];
  GeoWidget.register('ch03_dung_hinh', function (ui, el) {
    var H = CH03, f = H.f, D = H.D, PI = Math.PI;
    function arcAround(c, r, dirc, half) { return { k: 'arc', c: c, r: r, a0: dirc - half, a1: dirc + half }; }
    function T(o, txt) { o.txt = txt; return o; }

    var CONS = {
      trungtruc: {
        name: 'Đường trung trực của đoạn thẳng', handles: ['A', 'B'],
        init: function () { return { A: [-2.5, -1], B: [2.5, -1], r: 3.2 }; },
        inputs: [['len', 'Độ dài AB', 1, 12], ['r', 'Bán kính compa r', 0.5, 12]],
        get: function (g, k) { return k === 'len' ? H.dist(g.A, g.B) : g.r; },
        set: function (g, k, v) { if (k === 'len') g.B = H.polar(g.A, v, H.dir(g.A, g.B)); else g.r = v; },
        given: function (g) { return { segs: [[g.A, g.B]] }; },
        compute: function (g) {
          var A = g.A, B = g.B, r = g.r, d = H.dist(A, B), th = H.dir(A, B), ok = 2 * r > d + 1e-9;
          var h = ok ? Math.acos(d / (2 * r)) : 0.5, I = ok ? H.circles(A, r, B, r) : [NaNP, NaNP], P = I[0], Q = I[1];
          var M = ok ? H.inter(P, Q, A, B) : NaNP;
          return {
            err: ok ? '' : 'Bán kính r phải lớn hơn AB/2 = ' + f(d / 2) + ' thì hai cung mới cắt nhau.',
            steps: [
              T({ k: 'arc', c: A, r: r, a0: th - h - 0.35, a1: th + h + 0.35 }, 'Đặt mũi nhọn compa tại A, mở compa một khoảng r lớn hơn AB/2, vẽ cung tròn cắt ngang đoạn AB.'),
              T({ k: 'arc', c: B, r: r, a0: th + PI + h + 0.35, a1: th + PI - h - 0.35 }, 'Giữ nguyên độ mở compa, đặt mũi nhọn tại B, vẽ cung tròn cắt cung trước tại hai điểm.'),
              T({ k: 'pts', p: [P, Q], names: ['P', 'Q'] }, 'Đánh dấu hai giao điểm P và Q của hai cung.'),
              T({ k: 'line', p: P, q: Q, t0: -0.35, t1: 1.35, res: true }, 'Dùng thước kẻ đường thẳng PQ. PQ là đường trung trực của AB.'),
              T({ k: 'pts', p: [M], names: ['M'] }, 'PQ cắt AB tại M, là trung điểm của AB.')
            ],
            read: [['AB', f(d)], ['PA; PB', f(H.dist(P, A)) + '; ' + f(H.dist(P, B))], ['MA; MB', f(H.dist(M, A)) + '; ' + f(H.dist(M, B))], ['Góc giữa PQ và AB', H.fd(H.lineAng(P, Q, A, B))]]
          };
        }
      },
      phangiac: {
        name: 'Tia phân giác của một góc', handles: ['O', 'X', 'Y'],
        init: function () { return { O: [-4.5, -2.5], X: [3, -2.5], Y: H.polar([-4.5, -2.5], 6, 64 * D), r: 2.5 }; },
        inputs: [['ang', 'Số đo góc xOy (°)', 20, 160], ['r', 'Bán kính compa r', 0.5, 8]],
        get: function (g, k) { return k === 'ang' ? H.ang(g.X, g.O, g.Y) : g.r; },
        set: function (g, k, v) {
          if (k === 'r') { g.r = v; return; }
          var ax = H.dir(g.O, g.X), sg = H.norm(H.dir(g.O, g.Y) - ax) >= 0 ? 1 : -1; g.Y = H.polar(g.O, H.dist(g.O, g.Y), ax + sg * v * D);
        },
        given: function (g) { return { rays: [[g.O, g.X, 'x'], [g.O, g.Y, 'y']] }; },
        compute: function (g) {
          var O = g.O, r = g.r, ax = H.dir(O, g.X), ay = H.dir(O, g.Y), w = H.wedge(g.X, O, g.Y);
          var E = H.polar(O, r, ax), F = H.polar(O, r, ay), Tt = H.sub(H.add(E, F), O), L = Math.max(H.dist(O, g.X), H.dist(O, g.Y));
          return {
            err: '',
            steps: [
              T({ k: 'arc', c: O, r: r, a0: w[0] - 0.2, a1: w[1] + 0.2 }, 'Đặt compa tại đỉnh O, vẽ một cung tròn cắt hai cạnh Ox, Oy.'),
              T({ k: 'pts', p: [E, F], names: ['E', 'F'] }, 'Gọi E, F là giao điểm của cung với Ox và Oy (OE = OF).'),
              T(arcAround(E, r, H.dir(E, Tt), 0.45), 'Đặt compa tại E (giữ độ mở), vẽ một cung ở phía trong góc.'),
              T(arcAround(F, r, H.dir(F, Tt), 0.45), 'Đặt compa tại F với cùng độ mở, vẽ cung cắt cung trước tại T.'),
              T({ k: 'pts', p: [Tt], names: ['T'] }, 'Đánh dấu giao điểm T (TE = TF).'),
              T({ k: 'line', p: O, q: Tt, t0: 0, t1: 1.05 * L / H.dist(O, Tt), res: true }, 'Kẻ tia OT. ΔOET = ΔOFT (c.c.c) nên ∠EOT = ∠FOT: OT là tia phân giác.')
            ],
            read: [['∠xOy', H.fd(H.ang(g.X, O, g.Y))], ['∠xOT; ∠TOy', H.fd(H.ang(g.X, O, Tt)) + '; ' + H.fd(H.ang(Tt, O, g.Y))], ['OE; OF', f(H.dist(O, E)) + '; ' + f(H.dist(O, F))], ['TE; TF', f(H.dist(Tt, E)) + '; ' + f(H.dist(Tt, F))]]
          };
        }
      },
      gocbang: {
        name: 'Góc bằng góc cho trước', handles: ['O', 'X', 'Y', 'O′', 'X′'],
        init: function () { return { O: [-5.3, -2.5], X: [-1.8, -2.5], Y: H.polar([-5.3, -2.5], 3.8, 55 * D), O2: [0.8, -3], X2: H.polar([0.8, -3], 5.5, 12 * D), r: 2.2 }; },
        inputs: [['ang', 'Số đo góc xOy (°)', 10, 170], ['r', 'Bán kính compa r', 0.5, 6]],
        get: function (g, k) { return k === 'ang' ? H.ang(g.X, g.O, g.Y) : g.r; },
        set: function (g, k, v) {
          if (k === 'r') { g.r = v; return; }
          var ax = H.dir(g.O, g.X), sg = H.norm(H.dir(g.O, g.Y) - ax) >= 0 ? 1 : -1; g.Y = H.polar(g.O, H.dist(g.O, g.Y), ax + sg * v * D);
        },
        given: function (g) { return { rays: [[g.O, g.X, 'x'], [g.O, g.Y, 'y'], [g.O2, g.X2, 'x′']] }; },
        compute: function (g) {
          var O = g.O, r = g.r, ax = H.dir(O, g.X), dth = H.norm(H.dir(O, g.Y) - ax), sg = dth >= 0 ? 1 : -1, th = Math.abs(dth);
          var E = H.polar(O, r, ax), F = H.polar(O, r, ax + dth), d = H.dist(E, F), w = H.wedge(g.X, O, g.Y);
          var ax2 = H.dir(g.O2, g.X2), E2 = H.polar(g.O2, r, ax2);
          var I = H.circles(g.O2, r, E2, d), F2 = I.filter(function (q) { return H.orient(g.O2, E2, q) * sg > 0; })[0] || NaNP;
          var L = H.dist(g.O2, g.X2);
          return {
            err: '',
            steps: [
              T({ k: 'arc', c: O, r: r, a0: w[0] - 0.2, a1: w[1] + 0.2 }, 'Vẽ cung tròn tâm O bán kính r, cắt Ox tại E và Oy tại F.'),
              T({ k: 'pts', p: [E, F], names: ['E', 'F'] }, 'Đánh dấu E và F.'),
              T({ k: 'arc', c: g.O2, r: r, a0: ax2 - sg * 0.2, a1: ax2 + sg * (th + 0.4) }, 'Giữ nguyên độ mở r, vẽ cung tâm O′ cắt tia O′x′ tại E′.'),
              T({ k: 'pts', p: [E2], names: ['E′'] }, 'Đánh dấu E′.'),
              T(arcAround(E, d, H.dir(E, F), 0.3), 'Đo đoạn EF: đặt mũi nhọn compa tại E, mở tới F.'),
              T(arcAround(E2, d, H.dir(E2, F2), 0.4), 'Giữ độ mở EF, vẽ cung tâm E′ cắt cung trước tại F′.'),
              T({ k: 'pts', p: [F2], names: ['F′'] }, 'Đánh dấu giao điểm F′.'),
              T({ k: 'line', p: g.O2, q: F2, t0: 0, t1: L / r, res: true }, 'Kẻ tia O′F′. ΔO′E′F′ = ΔOEF (c.c.c) nên ∠E′O′F′ = ∠EOF.')
            ],
            read: [['∠xOy', H.fd(th / D)], ['∠x′O′F′', H.fd(H.ang(g.X2, g.O2, F2))], ['EF; E′F′', f(d) + '; ' + f(H.dist(E2, F2))], ['OE; O′E′', f(r) + '; ' + f(H.dist(g.O2, E2))]]
          };
        }
      },
      songsong: {
        name: 'Đường thẳng song song qua một điểm', handles: ['A', 'B', 'P'],
        init: function () { return { A: [-3, -2], B: [1, -2], P: [-1.5, 1.5] }; },
        inputs: [['h', 'Khoảng cách từ P đến d', 0.5, 8], ['len', 'Độ dài AB', 1, 8]],
        get: function (g, k) { return k === 'h' ? H.distLine(g.P, g.A, g.B) : H.dist(g.A, g.B); },
        set: function (g, k, v) {
          if (k === 'len') { g.B = H.polar(g.A, v, H.dir(g.A, g.B)); return; }
          var u = H.dir(g.A, g.B), s = H.orient(g.A, g.B, g.P) >= 0 ? 1 : -1, d = H.distLine(g.P, g.A, g.B);
          g.P = H.polar(g.P, (v - d) * s, u + PI / 2);
        },
        given: function (g) { return { lines: [[g.A, g.B, 'd']] }; },
        compute: function (g) {
          var A = g.A, B = g.B, P = g.P, ab = H.dist(A, B), ap = H.dist(A, P), Q = H.add(P, H.sub(B, A));
          var ok = H.distLine(P, A, B) > 0.05;
          return {
            err: ok ? '' : 'Điểm P phải nằm ngoài đường thẳng d.',
            steps: [
              T(arcAround(A, ab, H.dir(A, B), 0.25), 'Đo độ dài AB: đặt mũi nhọn compa tại A, mở tới B.'),
              T(arcAround(P, ab, H.dir(A, B), 0.4), 'Giữ độ mở AB, vẽ cung tròn tâm P (về phía cùng hướng với B).'),
              T(arcAround(A, ap, H.dir(A, P), 0.25), 'Đo độ dài AP: đặt compa tại A, mở tới P.'),
              T(arcAround(B, ap, H.dir(A, P), 0.4), 'Giữ độ mở AP, vẽ cung tròn tâm B cắt cung ở bước 2 tại Q.'),
              T({ k: 'pts', p: [Q], names: ['Q'] }, 'Đánh dấu giao điểm Q. Tứ giác ABQP có các cạnh đối bằng nhau nên là hình bình hành.'),
              T({ k: 'line', p: P, q: Q, t0: -1.2, t1: 2.2, res: true }, 'Kẻ đường thẳng PQ. Vì ABQP là hình bình hành nên PQ ∥ AB, tức là PQ ∥ d.')
            ],
            read: [['AB; PQ', f(ab) + '; ' + f(H.dist(P, Q))], ['AP; BQ', f(ap) + '; ' + f(H.dist(B, Q))], ['Góc giữa PQ và d', H.fd(H.lineAng(P, Q, A, B))], ['Khoảng cách từ P; Q đến d', f(H.distLine(P, A, B)) + '; ' + f(H.distLine(Q, A, B))]]
          };
        }
      },
      vuonggoc: {
        name: 'Đường thẳng vuông góc qua một điểm', handles: ['A', 'B', 'P'],
        init: function () { return { A: [-5, 0], B: [5, 0], P: [-0.5, 3.5], r: 4.2 }; },
        inputs: [['h', 'Khoảng cách từ P đến d', 0.5, 7], ['r', 'Bán kính compa r', 0.5, 10]],
        get: function (g, k) { return k === 'h' ? H.distLine(g.P, g.A, g.B) : g.r; },
        set: function (g, k, v) {
          if (k === 'r') { g.r = v; return; }
          var u = H.dir(g.A, g.B), s = H.orient(g.A, g.B, g.P) >= 0 ? 1 : -1, d = H.distLine(g.P, g.A, g.B);
          g.P = H.polar(g.P, (v - d) * s, u + PI / 2);
        },
        given: function (g) { return { lines: [[g.A, g.B, 'd']] }; },
        compute: function (g) {
          var A = g.A, B = g.B, P = g.P, r = g.r, u = H.sub(B, A), L = Math.hypot(u[0], u[1]); u = H.mul(u, 1 / L);
          var t = (P[0] - A[0]) * u[0] + (P[1] - A[1]) * u[1], K = H.add(A, H.mul(u, t)), h = H.dist(P, K), ok = r > h + 1e-9 && h > 0.05;
          var s = ok ? Math.sqrt(r * r - h * h) : 0, E = ok ? H.add(K, H.mul(u, -s)) : NaNP, F = ok ? H.add(K, H.mul(u, s)) : NaNP;
          var Q = ok ? H.sub(H.add(E, F), P) : NaNP, w = ok ? H.wedge(E, P, F) : [0, 0];
          return {
            err: h <= 0.05 ? 'Điểm P phải nằm ngoài đường thẳng d.' : ok ? '' : 'Bán kính r phải lớn hơn khoảng cách từ P đến d (' + f(h) + ') thì cung mới cắt d.',
            steps: [
              T({ k: 'arc', c: P, r: r, a0: w[0] - 0.25, a1: w[1] + 0.25 }, 'Đặt compa tại P, mở rộng hơn khoảng cách từ P đến d, vẽ cung cắt d tại hai điểm.'),
              T({ k: 'pts', p: [E, F], names: ['E', 'F'] }, 'Đánh dấu hai giao điểm E và F (PE = PF).'),
              T(arcAround(E, r, H.dir(E, Q), 0.4), 'Giữ độ mở, đặt compa tại E, vẽ cung ở phía bên kia của d.'),
              T(arcAround(F, r, H.dir(F, Q), 0.4), 'Đặt compa tại F, vẽ cung cắt cung trước tại Q.'),
              T({ k: 'pts', p: [Q], names: ['Q'] }, 'Đánh dấu Q. P và Q cùng cách đều E và F.'),
              T({ k: 'line', p: P, q: Q, t0: -0.3, t1: 1.3, res: true }, 'Kẻ đường thẳng PQ. PQ là trung trực của EF nên PQ ⊥ d.'),
              T({ k: 'pts', p: [K], names: ['K'] }, 'K là chân đường vuông góc kẻ từ P đến d.')
            ],
            read: [['PE; PF', f(H.dist(P, E)) + '; ' + f(H.dist(P, F))], ['QE; QF', f(H.dist(Q, E)) + '; ' + f(H.dist(Q, F))], ['Góc giữa PQ và d', H.fd(H.lineAng(P, Q, A, B))], ['Khoảng cách PK', f(h)]]
          };
        }
      }
    };

    var type = el.getAttribute('data-cons') || 'trungtruc';
    var st = { type: type, g: CONS[type].init(), pos: 0, target: 0, geo: null };
    function geo() { return st.geo || (st.geo = CONS[st.type].compute(st.g)); }
    function changed() { st.geo = null; }

    ui.select({ label: 'Bài toán dựng hình', value: type, options: Object.keys(CONS).map(function (k) { return [k, CONS[k].name]; }), onChange: function (v) {
      st.type = v; st.g = CONS[v].init(); st.pos = st.target = 0; changed(); buildInputs(); BD.build(draw); refresh();
    } });
    var grp = ui.group('Thông số (nhập số)'), ins = {};
    function buildInputs() {
      while (grp.children.length > 1) grp.removeChild(grp.lastChild);
      ins = {};
      CONS[st.type].inputs.forEach(function (d) {
        ins[d[0]] = ui.number({ label: d[1], value: +CONS[st.type].get(st.g, d[0]).toFixed(2), min: d[2], max: d[3], onChange: function (v) {
          CONS[st.type].set(st.g, d[0], v); changed(); sync();
        } }, grp);
      });
    }
    buildInputs();
    var row = ui.row('Các bước');
    ui.button(row, '◀ Lùi', function () { st.pos = st.target = Math.max(0, Math.ceil(st.pos - 1e-9) - 1); refresh(); BD.board.update(); }, 'btn secondary');
    ui.button(row, 'Tiếp ▶', function () { var n = geo().steps.length; st.pos = Math.floor(st.pos + 1e-9); st.target = Math.min(n, st.pos + 1); });
    var row2 = ui.row();
    ui.button(row2, '▶ Dựng tự động', function () { st.target = geo().steps.length; });
    ui.button(row2, '↺ Từ đầu', function () { st.pos = st.target = 0; refresh(); BD.board.update(); }, 'btn secondary');
    var out = ui.readout([['step', 'Tiến độ'], ['m1', '·'], ['m2', '·'], ['m3', '·'], ['m4', '·']]);
    var dts = ui.side.querySelectorAll('dl.readout dt');
    var note = H.note(ui);

    var BD = GeoWidget.board2d(ui, { bbox: [-7.5, 5, 7.5, -5], grid: false, aria: 'Các bước dựng hình bằng thước và compa',
      hint: 'Kéo các điểm cho trước để đổi hình · Cuộn để phóng to' });
    var HP = {};

    function sync() {
      CONS[st.type].inputs.forEach(function (d) { H.put(ins[d[0]], CONS[st.type].get(st.g, d[0])); });
      var hs = CONS[st.type].handles;
      hs.forEach(function (n) { var key = n === 'O′' ? 'O2' : n === 'X′' ? 'X2' : n; if (HP[n]) HP[n].moveTo(st.g[key]); });
      refresh(); if (BD && BD.board) BD.board.update();
    }
    function refresh() {
      var G = geo(), n = G.steps.length, k = Math.min(n, Math.floor(st.pos + 1e-9)), moving = Math.abs(st.pos - st.target) > 1e-9 && k < n;
      if (!moving) st.pos = Math.round(st.pos);
      out('step', (moving ? 'đang vẽ bước ' + (k + 1) : 'đã xong ' + k) + '/' + n);
      note(G.err ? '⚠ ' + G.err : moving ? (k + 1) + '. ' + G.steps[k].txt : k === 0 ? 'Bấm “Tiếp” để bắt đầu. Bước 1: ' + G.steps[0].txt : k + '. ' + G.steps[k - 1].txt + (k === n ? ' ✓ Hoàn thành.' : ''));
      ['m1', 'm2', 'm3', 'm4'].forEach(function (m, i) { var r = G.read[i]; dts[1 + i].textContent = r ? r[0] : ''; out(m, r ? (k === n || i < 1 ? r[1] : '…') : ''); });
    }
    function prog(i) { return Math.max(0, Math.min(1, st.pos - i)); }

    function draw(board, C) {
      var cons = CONS[st.type];
      // các đối tượng cho trước
      var gv = function () { return cons.given(st.g); };
      var gv0 = gv();
      (gv0.segs || []).forEach(function (s, i) { H.path(board, function () { var q = gv().segs[i]; return [q[0], q[1]]; }, { strokeColor: C.blue, strokeWidth: 3 }); });
      (gv0.rays || []).forEach(function (s, i) {
        H.path(board, function () { var q = gv().rays[i]; return [q[0], H.lerp(q[0], q[1], 1.15)]; }, { strokeColor: C.blue, strokeWidth: 2.5, lastArrow: true });
        H.label(board, function () { var q = gv().rays[i]; return H.add(H.lerp(q[0], q[1], 1.2), [0, 0.3]); }, s[2], { strokeColor: C.blue });
      });
      (gv0.lines || []).forEach(function (s, i) {
        H.path(board, function () { var q = gv().lines[i], u = H.sub(q[1], q[0]), L = Math.hypot(u[0], u[1]); u = H.mul(u, 30 / L); return [H.sub(q[0], u), H.add(q[0], u)]; }, { strokeColor: C.blue, strokeWidth: 2.5 });
        H.label(board, function () { var q = gv().lines[i]; return H.add(H.lerp(q[0], q[1], -0.6), [0, 0.35]); }, s[2], { strokeColor: C.blue, fontSize: 17 });
      });
      // các bước
      var steps0 = geo().steps;
      steps0.forEach(function (s0, i) {
        var S = function () { return geo().steps[i]; };
        if (s0.k === 'arc') {
          H.path(board, function () { var s = S(), p = prog(i); if (p <= 0 || !isFinite(s.r)) return null; return H.arcPts(s.c, s.r, s.a0, s.a0 + (s.a1 - s.a0) * p); }, { strokeColor: C.purple, strokeWidth: 2 });
        } else if (s0.k === 'line') {
          H.path(board, function () {
            var s = S(), p = prog(i); if (p <= 0) return null; var a = H.lerp(s.p, s.q, s.t0), b = H.lerp(s.p, s.q, s.t1);
            return [a, H.lerp(a, b, p)];
          }, { strokeColor: s0.res ? C.orange : C.purple, strokeWidth: s0.res ? 3 : 1.5 });
          // thước kẻ
          H.path(board, function () {
            var s = S(), p = prog(i); if (p <= 0 || p >= 1) return null; var a = H.lerp(s.p, s.q, s.t0), b = H.lerp(s.p, s.q, s.t1), u = H.sub(b, a), L = Math.hypot(u[0], u[1]);
            if (!(L > 0)) return null; u = H.mul(u, 1 / L); var n = [-u[1] * 0.45, u[0] * 0.45], a2 = H.sub(a, H.mul(u, 0.4)), b2 = H.add(b, H.mul(u, 0.4)), o = [-u[1] * 0.06, u[0] * 0.06];
            a2 = H.add(a2, o); b2 = H.add(b2, o); return [a2, b2, H.add(b2, n), H.add(a2, n), a2];
          }, { strokeColor: C.yellow, strokeWidth: 1.5, fillColor: C.yellow, fillOpacity: 0.25 });
        } else if (s0.k === 'pts') {
          s0.p.forEach(function (q, j) {
            H.dep(board, function () { return prog(i) >= 0.5 ? S().p[j] : NaNP; }, { name: s0.names[j], color: C.green, size: 3, label: { offset: [8, 10], strokeColor: C.green } });
          });
        }
      });
      // compa
      H.path(board, function () {
        var i = Math.floor(st.pos), s = geo().steps[i], p = st.pos - i;
        if (!s || s.k !== 'arc' || st.pos === st.target || p <= 0 || !isFinite(s.r)) return null;
        var a = s.a0 + (s.a1 - s.a0) * p, pen = H.polar(s.c, s.r, a), m = H.mid(s.c, pen), d = H.sub(pen, s.c), L = Math.hypot(d[0], d[1]);
        var n = [-d[1] / L, d[0] / L]; if (n[1] < 0) n = H.mul(n, -1);
        var hinge = H.add(m, H.mul(n, Math.max(0.9, 0.55 * s.r)));
        return [s.c, hinge, pen, [NaN, NaN], H.add(hinge, [0, 0.12]), H.add(hinge, [0, 0.55])];
      }, { strokeColor: C.text, strokeWidth: 3 });
      // điểm cho trước kéo được
      HP = {};
      cons.handles.forEach(function (n) {
        var key = n === 'O′' ? 'O2' : n === 'X′' ? 'X2' : n, ray = n === 'X' || n === 'Y' || n === 'X′';
        var p = board.create('point', st.g[key], { name: ray ? '' : n, size: 4, color: ray ? C.orange : C.blue, label: { offset: [-16, -12] } });
        p.on('drag', function () { st.g[key] = H.xy(p); changed(); CONS[st.type].inputs.forEach(function (d) { H.put(ins[d[0]], CONS[st.type].get(st.g, d[0])); }); refresh(); board.update(); });
        HP[n] = p;
      });
      refresh();
    }
    if (BD) {
      BD.build(draw);
      var last = 0;
      ui.loop(function (t) {
        var dt = last ? Math.min(60, t - last) : 16; last = t;
        if (st.pos === st.target) return;
        var s = geo().steps[Math.floor(st.pos)], sp = s && s.k === 'pts' ? 1 / 500 : 1 / 1400;
        var nx = st.pos + dt * sp, fl = Math.floor(st.pos) + 1;
        st.pos = Math.min(st.target, nx >= fl ? fl : nx);
        refresh(); BD.board.update();
      });
    }
    refresh();
    el.__debug = function () { return { type: st.type, g: st.g, pos: st.pos, target: st.target, read: geo().read, err: geo().err }; };
  });
})();
