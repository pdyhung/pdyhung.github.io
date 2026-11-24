/* ch08_mat_do.js — Bài 7: Mật độ.
   ch08_mat_do_dien_tich: so sánh mật độ dân số hai vùng (người/km²), vẽ chấm.
   ch08_mat_do_noi: khối lượng riêng; thả vật vào bể nước → nổi hay chìm, phần chìm bao nhiêu. */
(function () {
  'use strict';
  var PI = Math.PI;
  function fmt(x, d) { d = d == null ? 2 : d; var s = Math.abs(x) >= 1e6 ? x.toFixed(0) : x.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, ''); var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return parts.join(','); }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  /* ---------------- Mật độ theo diện tích ---------------- */
  GeoWidget.register('ch08_mat_do_dien_tich', function (ui) {
    var R = { A: { area: 4, pop: 6000 }, B: { area: 9, pop: 9000 } };
    ['A', 'B'].forEach(function (k) {
      var g = ui.group('Vùng ' + k);
      ui.number({ label: 'Diện tích (km²)', value: R[k].area, min: 0.01, max: 1e6, onChange: function (v) { R[k].area = v; draw(); } }, g);
      ui.number({ label: 'Dân số (người)', value: R[k].pop, min: 0, max: 1e9, onChange: function (v) { R[k].pop = Math.round(v); draw(); } }, g);
    });
    var setOut = ui.readout([['dA', 'Mật độ vùng A'], ['dB', 'Mật độ vùng B'], ['cmp', 'So sánh'], ['dot', 'Mỗi chấm']]);
    var c = document.createElement('canvas'); c.setAttribute('role', 'img'); ui.stage.appendChild(c);
    var hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = 'Diện tích hình vuông tỉ lệ với diện tích mỗi vùng; số chấm tỉ lệ với dân số.'; ui.stage.appendChild(hint);
    function nice(x) { var p = Math.pow(10, Math.floor(Math.log10(Math.max(x, 1)))); var m = x / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
    function draw() {
      var dA = R.A.pop / R.A.area, dB = R.B.pop / R.B.area;
      setOut('dA', fmt(dA) + ' người/km²'); setOut('dB', fmt(dB) + ' người/km²');
      setOut('cmp', Math.abs(dA - dB) < 1e-9 * Math.max(dA, dB, 1) ? 'Hai vùng đông như nhau' : (dA > dB ? 'Vùng A đông đúc hơn (gấp ' + fmt(dA / Math.max(dB, 1e-12)) + ' lần)' : 'Vùng B đông đúc hơn (gấp ' + fmt(dB / Math.max(dA, 1e-12)) + ' lần)'));
      var per = nice(Math.max(R.A.pop, R.B.pop) / 700); setOut('dot', fmt(per, 0) + ' người');
      var W = ui.stage.clientWidth, H = Math.max(320, Math.min(460, Math.round(W * 0.62)));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; ui.stage.style.height = H + 'px';
      var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var maxSide = Math.min((W - 60) / 2, H - 90), sA = Math.sqrt(R.A.area), sB = Math.sqrt(R.B.area), k = maxSide / Math.max(sA, sB);
      var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
      [['A', sA, 20, 0x4f8cff], ['B', sB, 40 + maxSide, 0x3fb950]].forEach(function (z, idx) {
        var side = z[1] * k, x0 = z[2] + (maxSide - side) / 2, y0 = 40 + (maxSide - side) / 2;
        ctx.fillStyle = idx ? 'rgba(63,185,80,0.12)' : 'rgba(79,140,255,0.12)'; ctx.strokeStyle = idx ? '#3fb950' : '#4f8cff'; ctx.lineWidth = 2;
        ctx.fillRect(x0, y0, side, side); ctx.strokeRect(x0, y0, side, side);
        ctx.fillStyle = css('--text'); ctx.font = '600 15px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Vùng ' + z[0] + ': ' + fmt(R[z[0]].area) + ' km²', z[2] + maxSide / 2, 26);
        var dots = Math.min(3000, Math.round(R[z[0]].pop / per)), rand = rng(idx ? 777 : 12345);
        ctx.fillStyle = idx ? '#1a7f37' : '#1f6feb';
        var rad = Math.max(1.2, Math.min(3, side / 60));
        for (var i = 0; i < dots; i++) { ctx.beginPath(); ctx.arc(x0 + rad + rand() * (side - 2 * rad), y0 + rad + rand() * (side - 2 * rad), rad, 0, 7); ctx.fill(); }
      });
      c.setAttribute('aria-label', 'Vùng A mật độ ' + fmt(dA) + ' người trên km vuông; vùng B ' + fmt(dB));
    }
    new ResizeObserver(draw).observe(ui.stage);
    window.addEventListener('themechange', draw);
    draw();
  });

  /* ---------------- Khối lượng riêng: nổi hay chìm ---------------- */
  var MATS = [['go_thong', 'Gỗ thông', 0.5, 0xc8a165], ['go_soi', 'Gỗ sồi', 0.75, 0x9c6b30], ['da', 'Nước đá', 0.92, 0xe6f3ff],
              ['nuoc', 'Nước (cùng khối lượng riêng)', 1, 0x6cb6ff], ['pvc', 'Nhựa PVC', 1.38, 0xd0d7de], ['nhom', 'Nhôm', 2.7, 0xb1bac4],
              ['sat', 'Sắt', 7.87, 0x57606a], ['vang', 'Vàng', 19.3, 0xf2cc60], ['tu_chon', 'Tự nhập…', 1.2, 0xdb61a2]];
  var SH = { lp: { name: 'Hình lập phương', ps: [['a', 'Cạnh a (cm)', 10]] }, cau: { name: 'Quả cầu', ps: [['R', 'Bán kính R (cm)', 5]] },
             tru: { name: 'Hình trụ đứng', ps: [['r', 'Bán kính r (cm)', 5], ['h', 'Chiều cao h (cm)', 10]] } };
  function volume(s, p) { return s === 'lp' ? Math.pow(p.a, 3) : s === 'cau' ? 4 / 3 * PI * Math.pow(p.R, 3) : PI * p.r * p.r * p.h; }
  function heightOf(s, p) { return s === 'lp' ? p.a : s === 'cau' ? 2 * p.R : p.h; }
  function widthOf(s, p) { return s === 'lp' ? p.a : s === 'cau' ? 2 * p.R : 2 * p.r; }
  /* thể tích phần chìm khi mực nước cao hơn đáy vật một đoạn x */
  function subVol(s, p, x) {
    var H = heightOf(s, p); x = Math.max(0, Math.min(H, x));
    if (s === 'lp') return p.a * p.a * x;
    if (s === 'tru') return PI * p.r * p.r * x;
    return PI * x * x * (3 * p.R - x) / 3;
  }
  /* độ sâu chìm x sao cho V_chìm = D · V (D < 1) — chia đôi */
  function depthFor(s, p, D) {
    var V = volume(s, p), lo = 0, hi = heightOf(s, p);
    for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (subVol(s, p, m) < D * V) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }

  GeoWidget.register('ch08_mat_do_noi', function (ui, el) {
    var st = { mat: 'go_thong', D: 0.5, shape: 'lp', y: 0, vy: 0, dropping: false, t0: 0 };
    var P = {}; Object.keys(SH).forEach(function (k) { P[k] = {}; SH[k].ps.forEach(function (x) { P[k][x[0]] = x[2]; }); });
    ui.select({ label: 'Chất liệu', value: st.mat, options: MATS.map(function (m) { return [m[0], m[1] + (m[0] === 'tu_chon' ? '' : ' (' + String(m[2]).replace('.', ',') + ' g/cm³)')]; }),
      onChange: function (v) { st.mat = v; var m = MATS.filter(function (x) { return x[0] === v; })[0]; if (v !== 'tu_chon') { st.D = m[2]; dIn.value = m[2]; } dBox.style.display = v === 'tu_chon' ? '' : 'none'; build(false); } });
    var dBox = ui.group('Khối lượng riêng tự chọn');
    var dIn = ui.number({ label: 'D (g/cm³)', value: 1.2, min: 0.01, max: 30, onChange: function (v) { st.D = v; build(false); } }, dBox);
    dBox.style.display = 'none';
    ui.select({ label: 'Hình dạng vật', value: st.shape, options: Object.keys(SH).map(function (k) { return [k, SH[k].name]; }), onChange: function (v) { st.shape = v; inputs(); build(true); } });
    var pBox = ui.group('Kích thước (nhập số)');
    var row = ui.row();
    ui.button(row, '⬇ Thả vào nước', function () { drop(); });
    var setOut = ui.readout([['V', 'Thể tích V'], ['m', 'Khối lượng m = D·V'], ['state', 'Trong nước'], ['sub', 'Phần chìm']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);
    note.textContent = 'Khối lượng riêng của nước là 1 g/cm³. Vật có D < 1 nổi, với phần chìm chiếm D/1 thể tích. Vật có D > 1 chìm xuống đáy. Vật có D = 1 lơ lửng.';

    function inputs() {
      [].slice.call(pBox.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); });
      SH[st.shape].ps.forEach(function (x) { ui.number({ label: x[1], value: P[st.shape][x[0]], min: 0.1, max: 1000, onChange: function (v) { P[st.shape][x[0]] = v; build(true); } }, pBox); });
    }

    var S = GeoWidget.scene3d(ui, { cam: [4.4, 3.6, 6], aria: 'Bể nước và vật được thả vào' });
    var world = null, obj = null, water = null, tank = {}, final = {};
    function color() { return MATS.filter(function (x) { return x[0] === st.mat; })[0][3]; }

    function compute() {
      var p = P[st.shape], V = volume(st.shape, p), H = heightOf(st.shape, p), w = widthOf(st.shape, p);
      tank.W = 3 * Math.max(w, H * 0.6); tank.h0 = 1.4 * H; tank.H = 2.6 * H;
      var floating = st.D < 1 - 1e-9, neutral = Math.abs(st.D - 1) < 1e-9;
      var sub = floating ? st.D * V : V;
      final.level = tank.h0 + sub / (tank.W * tank.W);
      if (floating) final.y = final.level - depthFor(st.shape, p, st.D);
      else if (neutral) final.y = (final.level - H) / 2;
      else final.y = 0;
      setOut('V', fmt(V) + ' cm³');
      var m = st.D * V; setOut('m', fmt(m) + ' g' + (m >= 1000 ? ' = ' + fmt(m / 1000) + ' kg' : ''));
      setOut('state', floating ? 'Nổi' : neutral ? 'Lơ lửng' : 'Chìm xuống đáy');
      setOut('sub', floating ? fmt(st.D * 100, 1) + '% thể tích (' + fmt(st.D * V) + ' cm³)' : '100%');
      return { V: V, H: H };
    }
    function build(reset) {
      var info = compute();
      if (!S) return;
      var T = THREE; S.dispose(world); world = new T.Group(); S.scene.add(world);
      var sc = 1 / info.H;                                   // vẽ theo tỉ lệ: vật cao 1 đơn vị cảnh
      world.scale.setScalar(sc * 1.4);
      var Wt = tank.W, Ht = tank.H;
      S.setView(Math.hypot(Wt / 2, Ht / 2) * sc * 1.4, 0, { reset: reset, targetY: Ht / 2 * sc * 1.4, noGrid: true });
      var glass = new T.Mesh(new T.BoxGeometry(Wt, Ht, Wt), S.mat(0xb8c7dd, 0.12)); glass.position.y = Ht / 2; world.add(glass);
      world.add(new T.LineSegments(new T.EdgesGeometry(glass.geometry), new T.LineBasicMaterial({ color: 0x57606a })).translateY(Ht / 2));
      var wg = new T.BoxGeometry(1, 1, 1); wg.translate(0, 0.5, 0);
      water = new T.Mesh(wg, new T.MeshStandardMaterial({ color: 0x2f81f7, transparent: true, opacity: 0.35, depthWrite: false, roughness: 0.2 }));
      water.renderOrder = 3; world.add(water);
      var p = P[st.shape], g;
      if (st.shape === 'lp') { g = new T.BoxGeometry(p.a, p.a, p.a); g.translate(0, p.a / 2, 0); }
      else if (st.shape === 'cau') { g = new T.SphereGeometry(p.R, 48, 24); g.translate(0, p.R, 0); }
      else { g = new T.CylinderGeometry(p.r, p.r, p.h, 48, 1); g.translate(0, p.h / 2, 0); }
      obj = new T.Mesh(g, new T.MeshStandardMaterial({ color: color(), roughness: st.mat === 'vang' || st.mat === 'nhom' || st.mat === 'sat' ? 0.3 : 0.7, metalness: /vang|nhom|sat/.test(st.mat) ? 0.6 : 0.05 }));
      obj.add(new T.LineSegments(new T.EdgesGeometry(g, 30), new T.LineBasicMaterial({ color: 0x1f2328 })));
      world.add(obj);
      st.dropping = false; st.y = final.y; place(final.level);
    }
    function place(level) {
      if (!obj) return;
      obj.position.y = st.y;
      water.scale.set(tank.W * 0.998, level, tank.W * 0.998);
    }
    function drop() {
      compute(); if (!S) return;
      st.y = tank.H * 1.05; st.vy = 0; st.dropping = true; st.t0 = performance.now();
    }
    el.__debug = function () { return { final: final, tank: tank, st: st }; };

    if (S) {
      S.onTheme(function () { build(false); });
      S.frame.push(function (t) {
        if (!st.dropping) return;
        // Hoạt ảnh minh họa (không phải mô phỏng vật lý chính xác): rơi nhanh dần, chạm nước rồi nhấp nhô tắt dần quanh vị trí cân bằng.
        var tau = (t - st.t0) / 1000, y0 = tank.H * 1.05, p = P[st.shape], H0 = heightOf(st.shape, p);
        var Tf = st.D > 1 + 1e-9 ? 1.5 : 0.9;
        if (tau < Tf) st.y = y0 - (y0 - final.y) * (tau / Tf) * (tau / Tf);
        else if (st.D > 1 + 1e-9) st.y = final.y;
        else { var s = tau - Tf; st.y = final.y - 0.3 * H0 * Math.exp(-1.8 * s) * Math.sin(5 * s); }
        var level = tank.h0 + subVol(st.shape, p, final.level - st.y) / (tank.W * tank.W);
        place(level);
        if (tau > Tf + 3.5) { st.dropping = false; st.y = final.y; place(final.level); }
      });
    }
    inputs(); build(true);
  });
})();
