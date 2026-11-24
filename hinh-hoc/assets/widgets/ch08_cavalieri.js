/* ch08_cavalieri.js — Bài 4: Nguyên lý Cavalieri.
   Ba tình huống: chồng đồng xu (thẳng và xô lệch); hình chóp và hình nón cùng diện tích đáy, cùng chiều cao;
   nửa hình cầu và hình trụ bị khoét hình nón (Archimedes). Mặt phẳng cắt ở độ cao y cho hai thiết diện có diện tích bằng nhau. */
(function () {
  'use strict';
  var PI = Math.PI;
  function fmt(x) { return (Math.abs(x) >= 1000 ? x.toFixed(0) : x.toFixed(2)).replace('.', ','); }

  var MODES = {
    xu: { name: 'Chồng đồng xu: thẳng và xô lệch', params: [['n', 'Số đồng xu', 12, 2, 60, 1], ['r', 'Bán kính đồng xu', 1, 0.1, 50], ['H', 'Chiều cao chồng xu', 2.4, 0.1, 100], ['s', 'Độ xô lệch (đỉnh lệch so với đáy)', 1.2, 0, 100]] },
    chop_non: { name: 'Hình chóp và hình nón cùng đáy, cùng chiều cao', params: [['r', 'Bán kính đáy hình nón r', 1, 0.1, 50], ['H', 'Chiều cao chung h', 2.4, 0.1, 100]] },
    archimedes: { name: 'Nửa hình cầu và hình trụ khoét hình nón', params: [['R', 'Bán kính R', 1.2, 0.1, 50]] }
  };

  GeoWidget.register('ch08_cavalieri', function (ui, el) {
    var st = { mode: el.getAttribute('data-mode') || 'xu', y: 0.5, wave: false, playing: false, t0: 0 };
    var P = {}; Object.keys(MODES).forEach(function (k) { P[k] = {}; MODES[k].params.forEach(function (x) { P[k][x[0]] = x[2]; }); });

    ui.select({ label: 'Tình huống', value: st.mode, options: Object.keys(MODES).map(function (k) { return [k, MODES[k].name]; }),
      onChange: function (v) { st.mode = v; buildInputs(); build(true); } });
    var pBox = ui.group('Kích thước (nhập số)');
    var waveRow = ui.row();
    var waveChk = ui.checkbox('Xô lệch kiểu uốn lượn', false, function (v) { st.wave = v; build(false); }, waveRow);
    var sY = ui.slider({ label: 'Độ cao mặt cắt', min: 0, max: 1, value: 0.5, scale: 100, decimals: 0, unit: '% chiều cao',
      onInput: function (v) { st.y = v; stop(); cut(); } });
    var row = ui.row();
    var playBtn = ui.button(row, '▶ Quét mặt cắt', function () { st.playing ? stop() : play(); });
    var setOut = ui.readout([['s1', 'Thiết diện khối trái'], ['s2', 'Thiết diện khối phải'], ['v1', 'Thể tích khối trái'], ['v2', 'Thể tích khối phải']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    function buildInputs() {
      [].slice.call(pBox.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); });
      MODES[st.mode].params.forEach(function (x) {
        ui.number({ label: x[1], value: P[st.mode][x[0]], min: x[3], max: x[4], step: x[5] || 'any', onChange: function (v) { P[st.mode][x[0]] = x[5] ? Math.round(v) : v; build(false); } }, pBox);
      });
      waveRow.parentNode.style.display = st.mode === 'xu' ? '' : 'none';
    }
    function stop() { st.playing = false; playBtn.textContent = '▶ Quét mặt cắt'; }
    function play() { st.playing = true; st.t0 = performance.now(); playBtn.textContent = '⏸ Tạm dừng'; }

    var S = GeoWidget.scene3d(ui, { cam: [0.6, 3.2, 7.4], aria: 'Hai khối có thiết diện bằng nhau ở mọi độ cao' });
    var world = null, cutGroup = null, H = 1, gap = 1.6;

    function height() { var p = P[st.mode]; return st.mode === 'archimedes' ? p.R : p.H; }
    /* độ lệch ngang của chồng xu tại độ cao y (0…H) */
    function shift(y) { var p = P.xu; return st.wave ? p.s * Math.sin(PI * y / p.H) : p.s * y / p.H; }

    function build(reset) {
      var p = P[st.mode], T = THREE;
      H = height();
      var v1, v2;
      if (st.mode === 'xu') { v1 = v2 = PI * p.r * p.r * p.H; note.textContent = 'Hai chồng xu có cùng số xu, cùng chiều cao. Ở mọi độ cao, mặt cắt đều là một hình tròn bán kính r. Vậy hai chồng có cùng thể tích V = π·r²·h.'; }
      else if (st.mode === 'chop_non') { v1 = v2 = PI * p.r * p.r * p.H / 3; note.textContent = 'Đáy hình chóp là hình vuông cạnh a = r·√π, nên có diện tích bằng đáy hình nón (π·r²). Ở độ cao y, cả hai thiết diện đều thu nhỏ theo tỉ số (1 − y/h)², nên luôn có diện tích bằng nhau.'; }
      else { v1 = v2 = 2 / 3 * PI * Math.pow(p.R, 3); note.textContent = 'Ở độ cao y: nửa hình cầu cho hình tròn bán kính √(R² − y²); hình trụ khoét nón cho hình vành khăn, bán kính ngoài R, bán kính trong y. Cả hai có diện tích π(R² − y²). Vậy V(nửa cầu) = V(trụ) − V(nón) = πR³ − ⅓πR³ = ⅔πR³.'; }
      setOut('v1', fmt(v1) + ' (đvtt)'); setOut('v2', fmt(v2) + ' (đvtt)');
      cut();
      if (!S) return;
      S.dispose(world); world = new T.Group(); S.scene.add(world);
      var w = st.mode === 'xu' ? Math.max(p.r, p.r + p.s / 2) : (st.mode === 'chop_non' ? p.r : p.R);
      gap = 1.35 * w + 0.6 * (st.mode === 'xu' ? Math.abs(p.s) / 2 : 0) + 0.2;
      var ext = Math.hypot(gap + w, H / 2) * 1.05;
      S.setView(ext, 0, { reset: reset, targetY: H / 2 });
      var matL = S.mat(0x4f8cff, 0.55), matR = S.mat(0x3fb950, 0.55);
      if (st.mode === 'xu') {
        var t = p.H / p.n, coin = new T.CylinderGeometry(p.r, p.r, t * 0.92, 48, 1);
        for (var i = 0; i < p.n; i++) {
          var yc = (i + 0.5) * t;
          var a = new T.Mesh(coin, S.mat(0xf2cc60, 1)); a.position.set(-gap, yc, 0); world.add(a);
          var b = new T.Mesh(coin, S.mat(0xf2cc60, 1)); b.position.set(gap + shift(yc) - p.s / 2, yc, 0); world.add(b);
          [a, b].forEach(function (m) { m.add(new T.LineSegments(new T.EdgesGeometry(coin, 30), new T.LineBasicMaterial({ color: 0x9a6700 }))); });
        }
        world.add(S.label('chồng thẳng', [-gap, H + 0.35 * S.K, 0])); world.add(S.label('chồng xô lệch', [gap, H + 0.35 * S.K, 0]));
      } else if (st.mode === 'chop_non') {
        var a2 = p.r * Math.sqrt(PI);
        var pyr = new T.Mesh(new T.ConeGeometry(a2 / Math.SQRT2, p.H, 4, 1), matL); pyr.rotation.y = PI / 4; pyr.position.set(-gap, p.H / 2, 0);
        var cone = new T.Mesh(new T.ConeGeometry(p.r, p.H, 96, 1), matR); cone.position.set(gap, p.H / 2, 0);
        [pyr, cone].forEach(function (m) { world.add(m); m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry, 30), new T.LineBasicMaterial({ color: 0x2b3a55 }))); });
        world.add(S.label('chóp: đáy vuông cạnh ' + fmt(a2), [-gap, H + 0.35 * S.K, 0])); world.add(S.label('nón: bán kính ' + fmt(p.r), [gap, H + 0.35 * S.K, 0]));
      } else {
        var R = p.R;
        var hemi = new T.Mesh(new T.SphereGeometry(R, 64, 32, 0, 2 * PI, 0, PI / 2), matL);
        hemi.position.set(-gap, 0, 0);   // mặt phẳng (đáy) ở y = 0, đỉnh cầu ở y = R
        var disc = new T.Mesh(new T.CircleGeometry(R, 64), matL); disc.rotation.x = -PI / 2; disc.position.set(-gap, 0, 0);
        world.add(hemi); world.add(disc);
        var cyl = new T.Mesh(new T.CylinderGeometry(R, R, R, 64, 1, true), matR); cyl.position.set(gap, R / 2, 0);
        var bottom = new T.Mesh(new T.CircleGeometry(R, 64), matR); bottom.rotation.x = -PI / 2; bottom.position.set(gap, 0, 0);
        var hole = new T.Mesh(new T.ConeGeometry(R, R, 64, 1, true), S.mat(0xe5534b, 0.35));
        hole.rotation.x = PI; hole.position.set(gap, R / 2, 0);   // nón úp ngược: đỉnh ở tâm đáy (y = 0), đáy nón trùng mặt trên trụ
        var topRing = new T.Mesh(new T.RingGeometry(R * 0.999, R, 64), matR); topRing.rotation.x = -PI / 2; topRing.position.set(gap, R, 0);
        [cyl, bottom, hole, topRing].forEach(function (m) { world.add(m); });
        world.add(new T.LineSegments(new T.EdgesGeometry(new T.CylinderGeometry(R, R, R, 64, 1), 30), new T.LineBasicMaterial({ color: 0x2b3a55 })).translateX(gap).translateY(R / 2));
        world.add(S.label('nửa hình cầu', [-gap, R + 0.4 * S.K, 0])); world.add(S.label('trụ khoét nón (màu đỏ)', [gap, R + 0.4 * S.K, 0]));
      }
      cutGroup = new T.Group(); world.add(cutGroup);
      cut();
    }

    function cut() {
      var p = P[st.mode], y = st.y * H, s1, s2, T = THREE;
      if (st.mode === 'xu') { s1 = s2 = PI * p.r * p.r; }
      else if (st.mode === 'chop_non') { var k = 1 - y / p.H; s1 = s2 = PI * p.r * p.r * k * k; }
      else { s1 = s2 = PI * (p.R * p.R - y * y); }
      setOut('s1', fmt(s1) + ' (đvdt)'); setOut('s2', fmt(s2) + ' (đvdt)');
      if (!S || !cutGroup) return;
      while (cutGroup.children.length) { var c = cutGroup.children.pop(); c.geometry && c.geometry.dispose(); }
      var mat = new T.MeshBasicMaterial({ color: 0xff7a1a, side: T.DoubleSide, transparent: true, opacity: 0.9, depthTest: false });
      function flat(g, x) { var m = new T.Mesh(g, mat); m.rotation.x = -PI / 2; m.position.set(x, y, 0); m.renderOrder = 5; cutGroup.add(m); }
      if (st.mode === 'xu') { flat(new T.CircleGeometry(p.r, 64), -gap); flat(new T.CircleGeometry(p.r, 64), gap + shift(y) - p.s / 2); }
      else if (st.mode === 'chop_non') {
        var k2 = 1 - y / p.H, a2 = p.r * Math.sqrt(PI) * k2;
        if (k2 > 1e-4) { flat(new T.PlaneGeometry(a2, a2), -gap); flat(new T.CircleGeometry(p.r * k2, 64), gap); }
      } else {
        var rc = Math.sqrt(Math.max(0, p.R * p.R - y * y));
        if (rc > 1e-4) flat(new T.CircleGeometry(rc, 64), -gap);
        flat(new T.RingGeometry(Math.max(y, 1e-4), p.R, 64), gap);
      }
      // khung mặt phẳng cắt
      var span = gap * 2 + 2.6 * Math.max(p.r || 0, p.R || 0, 0.5);
      var plane = new T.Mesh(new T.PlaneGeometry(span + 1, 2.2 * Math.max(p.r || 0, p.R || 0, 0.5) + 1),
        new T.MeshBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.1, side: T.DoubleSide, depthWrite: false }));
      plane.rotation.x = -PI / 2; plane.position.set(0, y, 0); cutGroup.add(plane);
    }
    el.__debug = function () { return { mode: st.mode, P: P }; };

    if (S) {
      S.onTheme(function () { build(false); });
      S.frame.push(function (t) {
        if (!st.playing) return;
        st.y = 0.5 - 0.5 * Math.cos((t - st.t0) / 1800); sY.set(st.y); cut();
      });
    }
    buildInputs(); build(true);
  });
})();
