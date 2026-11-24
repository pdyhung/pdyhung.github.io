/* ch08_tron_xoay.js — Bài 3: Quay hình phẳng quanh một trục tạo khối tròn xoay.
   Mặt cắt (profile) cho dưới dạng đa giác trong hệ (r, y): r = khoảng cách tới trục, y = vị trí dọc trục. */
(function () {
  'use strict';
  var PI = Math.PI;
  function fmt(x) { return (Math.abs(x) >= 1000 ? x.toFixed(0) : x.toFixed(2)).replace('.', ','); }
  function semicircle(R, cx, cy, full) {
    var p = [], N = 96, i;
    if (full) { for (i = 0; i < N; i++) { var t = 2 * PI * i / N; p.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]); } return p; }
    for (i = 0; i <= N; i++) { var s = -PI / 2 + PI * i / N; p.push([R * Math.cos(s), cy + R * Math.sin(s)]); }
    return p;
  }

  /* Mỗi hình: tham số nhập, mặt cắt, tên khối, thể tích đúng (công thức) */
  var SHAPES = {
    chu_nhat: { name: 'Hình chữ nhật quay quanh một cạnh', solid: 'Hình trụ',
      params: [['a', 'Cạnh vuông góc với trục (a)', 1.5], ['b', 'Cạnh nằm trên trục (b)', 2.5]],
      profile: function (p) { return [[0, 0], [p.a, 0], [p.a, p.b], [0, p.b]]; },
      vol: function (p) { return [PI * p.a * p.a * p.b, 'V = π·a²·b = π·' + fmt(p.a) + '²·' + fmt(p.b)]; },
      note: 'Bán kính đáy r = a, chiều cao h = b.' },
    tam_giac: { name: 'Tam giác vuông quay quanh một cạnh góc vuông', solid: 'Hình nón',
      params: [['a', 'Cạnh góc vuông kia (a)', 1.5], ['b', 'Cạnh góc vuông nằm trên trục (b)', 2.5]],
      profile: function (p) { return [[0, 0], [p.a, 0], [0, p.b]]; },
      vol: function (p) { return [PI * p.a * p.a * p.b / 3, 'V = ⅓·π·a²·b = ⅓·π·' + fmt(p.a) + '²·' + fmt(p.b)]; },
      note: 'Bán kính đáy r = a, chiều cao h = b, đường sinh l = cạnh huyền.' },
    nua_tron: { name: 'Nửa hình tròn quay quanh đường kính', solid: 'Hình cầu',
      params: [['R', 'Bán kính (R)', 1.4]],
      profile: function (p) { return semicircle(p.R, 0, p.R); },
      vol: function (p) { return [4 / 3 * PI * Math.pow(p.R, 3), 'V = 4/3·π·R³ = 4/3·π·' + fmt(p.R) + '³']; },
      note: 'Tâm hình cầu là tâm nửa hình tròn.' },
    thang: { name: 'Hình thang vuông quay quanh cạnh góc vuông', solid: 'Hình nón cụt',
      params: [['a', 'Đáy lớn (a)', 1.6], ['c', 'Đáy nhỏ (c)', 0.8], ['b', 'Chiều cao, nằm trên trục (b)', 2]],
      profile: function (p) { return [[0, 0], [p.a, 0], [p.c, p.b], [0, p.b]]; },
      vol: function (p) { return [PI * p.b * (p.a * p.a + p.a * p.c + p.c * p.c) / 3, 'V = ⅓·π·h·(R² + R·r + r²) = ⅓·π·' + fmt(p.b) + '·(' + fmt(p.a) + '² + ' + fmt(p.a) + '·' + fmt(p.c) + ' + ' + fmt(p.c) + '²)']; },
      note: 'Bán kính hai đáy R = a, r = c; chiều cao h = b.' },
    ong: { name: 'Hình chữ nhật quay quanh trục song song, cách một khoảng', solid: 'Ống trụ (hình trụ rỗng)',
      params: [['d', 'Khoảng cách tới trục (d)', 0.8], ['a', 'Bề rộng (a)', 0.7], ['b', 'Chiều cao (b)', 2.2]],
      profile: function (p) { return [[p.d, 0], [p.d + p.a, 0], [p.d + p.a, p.b], [p.d, p.b]]; },
      vol: function (p) { return [PI * p.b * (Math.pow(p.d + p.a, 2) - p.d * p.d), 'V = π·b·((d + a)² − d²) = π·' + fmt(p.b) + '·(' + fmt(p.d + p.a) + '² − ' + fmt(p.d) + '²)']; },
      note: 'Thể tích = trụ lớn (bán kính d + a) trừ trụ nhỏ (bán kính d).' },
    xuyen: { name: 'Hình tròn quay quanh trục không cắt nó', solid: 'Hình xuyến (bánh donut)',
      params: [['a', 'Bán kính hình tròn (a)', 0.5], ['d', 'Khoảng cách từ tâm tới trục (d)', 1.3]],
      profile: function (p) { return semicircle(p.a, p.d, p.a, true); },
      vol: function (p) { return [2 * PI * PI * p.d * p.a * p.a, 'V = 2π²·d·a² = 2π²·' + fmt(p.d) + '·' + fmt(p.a) + '²']; },
      check: function (p) { return p.d > p.a ? '' : 'Cần d > a để trục không cắt hình tròn.'; },
      note: 'Định lý Pappus: V = (diện tích hình tròn) × (quãng đường tâm đi được) = πa² · 2πd.' },
    huyen: { name: 'Tam giác vuông quay quanh cạnh huyền', solid: 'Hai hình nón chung đáy',
      params: [['p', 'Cạnh góc vuông thứ nhất (p)', 1.6], ['q', 'Cạnh góc vuông thứ hai (q)', 2.2]],
      profile: function (p) { var c = Math.hypot(p.p, p.q), hc = p.p * p.q / c; return [[0, 0], [hc, p.p * p.p / c], [0, c]]; },
      vol: function (p) { var c = Math.hypot(p.p, p.q), hc = p.p * p.q / c; return [PI * hc * hc * c / 3, 'V = ⅓·π·r²·(h₁ + h₂) với r = p·q/c = ' + fmt(hc) + ', h₁ + h₂ = c = ' + fmt(c)]; },
      note: 'Đáy chung có bán kính bằng đường cao ứng với cạnh huyền.' }
  };

  /* Thể tích từ mặt cắt đa giác bằng định lý Pappus: V = 2π·x̄·A (dùng để đối chiếu công thức) */
  function pappus(poly) {
    var A = 0, Cx = 0;
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length], cr = p[0] * q[1] - q[0] * p[1];
      A += cr; Cx += (p[0] + q[0]) * cr;
    }
    A /= 2; Cx /= (6 * A);
    return Math.abs(2 * PI * Cx * A);
  }

  GeoWidget.register('ch08_tron_xoay', function (ui, el) {
    var st = { shape: el.getAttribute('data-shape') || 'chu_nhat', phi: 2 * PI, playing: false, t0: 0 };
    var params = {}; Object.keys(SHAPES).forEach(function (k) { params[k] = {}; SHAPES[k].params.forEach(function (x) { params[k][x[0]] = x[2]; }); });

    ui.select({ label: 'Hình phẳng', value: st.shape, options: Object.keys(SHAPES).map(function (k) { return [k, SHAPES[k].name]; }),
      onChange: function (v) { st.shape = v; buildInputs(); build(true); } });
    var pBox = ui.group('Kích thước (nhập số)');
    var sPhi = ui.slider({ label: 'Góc đã quay', min: 0, max: 360, value: 360, decimals: 0, unit: '°',
      onInput: function (v) { st.phi = v * PI / 180; stop(); sweep(); } });
    var row = ui.row();
    var playBtn = ui.button(row, '▶ Quay từ 0°', function () { st.playing ? stop() : play(); });
    var setOut = ui.readout([['solid', 'Khối tạo thành'], ['formula', 'Công thức'], ['vol', 'Thể tích'], ['part', 'Đã quét được']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    function buildInputs() {
      [].slice.call(pBox.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); });
      SHAPES[st.shape].params.forEach(function (x) {
        ui.number({ label: x[1], value: params[st.shape][x[0]], min: 0.05, max: 100, onChange: function (v) { params[st.shape][x[0]] = v; build(false); } }, pBox);
      });
    }
    function stop() { st.playing = false; playBtn.textContent = '▶ Quay từ 0°'; }
    function play() { st.playing = true; st.phi = 0; st.t0 = performance.now(); playBtn.textContent = '⏸ Tạm dừng'; }

    var S = GeoWidget.scene3d(ui, { cam: [5.2, 2.6, 4.2], aria: 'Hình phẳng quay quanh trục tạo thành khối tròn xoay' });
    var world = null, lathe = null, blade = null, poly = null, yOff = 0;

    function build(reset) {
      var sh = SHAPES[st.shape], p = params[st.shape];
      var err = sh.check ? sh.check(p) : '';
      poly = sh.profile(p);
      var V = sh.vol(p);
      setOut('solid', sh.solid);
      setOut('formula', V[1]);
      setOut('vol', err ? '—' : fmt(V[0]) + ' (đvtt)');
      note.textContent = err || sh.note;
      update();
      if (!S) return;
      S.dispose(world);
      world = new THREE.Group(); S.scene.add(world);
      var ys = poly.map(function (q) { return q[1]; }), rs = poly.map(function (q) { return q[0]; });
      var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), rMax = Math.max.apply(null, rs);
      yOff = -(y0 + y1) / 2;
      var ext = Math.hypot(rMax, (y1 - y0) / 2);
      S.setView(ext * 1.05, y0 + yOff, { reset: reset });
      // trục quay
      var axisLen = (y1 - y0) / 2 + 0.5 * S.K;
      world.add(S.line([0, -axisLen, 0], [0, axisLen, 0], { dashed: true, color: 0xcf222e }));
      world.add(S.label('trục quay', [0, axisLen + 0.2 * S.K, 0]));
      // hình phẳng ban đầu (ở góc 0) và "lưỡi" đang quay
      var shape = new THREE.Shape(poly.map(function (q) { return new THREE.Vector2(q[0], q[1] + yOff); }));
      var sg = new THREE.ShapeGeometry(shape);
      var start = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      start.rotation.y = -PI / 2; world.add(start);
      blade = new THREE.Group();
      blade.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: 0xff7a1a, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 })));
      var outline = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(poly.map(function (q) { return new THREE.Vector3(q[0], q[1] + yOff, 0); })),
        new THREE.LineBasicMaterial({ color: 0xc2410c }));
      blade.add(outline); world.add(blade);
      lathe = null; sweep();
    }
    function sweep() {
      update();
      if (!S || !poly) return;
      if (lathe) { world.remove(lathe); lathe.geometry.dispose(); }
      var phi = Math.max(1e-3, st.phi);
      var pts = poly.concat([poly[0]]).map(function (q) { return new THREE.Vector2(Math.max(q[0], 1e-6), q[1] + yOff); });
      var segs = Math.max(3, Math.round(128 * phi / (2 * PI)));
      lathe = new THREE.Mesh(new THREE.LatheGeometry(pts, segs, 0, phi), S.mat(0x4f8cff, 0.42));
      world.add(lathe);
      blade.rotation.y = phi - PI / 2;
    }
    function update() {
      var sh = SHAPES[st.shape], V = sh.vol(params[st.shape])[0], frac = st.phi / (2 * PI);
      setOut('part', Math.round(st.phi * 180 / PI) + '° → ' + fmt(V * frac) + ' (đvtt)');
    }
    el.__debug = function () { return { pappus: pappus(SHAPES[st.shape].profile(params[st.shape])), exact: SHAPES[st.shape].vol(params[st.shape])[0] }; };

    if (S) {
      S.onTheme(function () { build(false); });
      S.frame.push(function (t) {
        if (!st.playing) return;
        st.phi = Math.min(2 * PI, (t - st.t0) / 4000 * 2 * PI);
        sPhi.set(st.phi * 180 / PI); sweep();
        if (st.phi >= 2 * PI) stop();
      });
    }
    buildInputs(); build(true);
  });
})();
