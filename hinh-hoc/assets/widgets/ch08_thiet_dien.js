/* ch08_thiet_dien.js — Minh họa 3D: thiết diện của hình khối khi cắt bởi một mặt phẳng.
   Cần: three.min.js, OrbitControls.js, section-math.js, widget-core.js */
(function () {
  'use strict';
  var M = window.SectionMath;

  /* Thiết diện mẫu: [nhãn, góc Ox, góc Oz, vị trí 0…1]. Khi đổi kích thước khối, nếu mẫu không còn cho
     đúng hình như nhãn, widget tự dò vị trí/góc gần nhất cho ra hình đó (xem findPreset). */
  var A1 = Math.atan(1 / Math.SQRT2) * 180 / Math.PI;   // 35,26…°: pháp tuyến song song đường chéo khối
  var A2 = Math.atan(Math.SQRT2) * 180 / Math.PI;       // 54,73…°
  var SOLID_INFO = {
    cube:     { name: 'Hình lập phương', presets: function () { return [
      ['Hình vuông', 0, 0, 0.7], ['Hình chữ nhật', 0, 30, 0.5], ['Tam giác đều', A1, -45, 0.8], ['Hình thang', 25, -40, 0.25],
      ['Hình thoi', -A2, -45, 0.5], ['Ngũ giác', 20, -30, 0.3], ['Lục giác đều', A1, -45, 0.5]]; } },
    pyramid:  { name: 'Hình chóp tứ giác đều', presets: function () { return [
      ['Hình vuông', 0, 0, 0.4], ['Tam giác cân', 0, -90, 0.5], ['Hình thang cân', 0, -90, 0.7], ['Ngũ giác', 20, -20, 0.4]]; } },
    prism:    { name: 'Hình lăng trụ tam giác đều', presets: function () { return [
      ['Tam giác đều', 0, 0, 0.5], ['Hình chữ nhật', 0, -90, 0.5], ['Tam giác cân', 40, 0, 0.5], ['Hình thang cân', -60, 0, 0.45], ['Ngũ giác', 0, -60, 0.6]]; } },
    cylinder: { name: 'Hình trụ', presets: function () { return [
      ['Hình tròn', 0, 0, 0.5], ['Hình chữ nhật', 90, 0, 0.5], ['Hình elip', 30, 0, 0.5], ['Một phần hình elip', 60, 0, 0.5]]; } },
    cone:     { name: 'Hình nón', presets: function (d) {
      var p = 90 - M.coneHalfAngle(d);            // góc nghiêng cho parabol
      return [['Hình tròn', 0, 0, 0.5], ['Tam giác cân', 90, 0, 0.5], ['Hình elip', p * 0.5, 0, 0.5],
              ['Parabol', p, 0, 0.5], ['Hyperbol', p + (90 - p) * 0.6, 0, 0.6]]; } }
  };

  GeoWidget.register('ch08_thiet_dien', function (ui, el) {
    var state = { solid: el.getAttribute('data-solid') || 'cube', a: 0, b: 0, f: 0.5, showPlane: true, split: false, playing: false };
    var dims = {}; Object.keys(SOLID_INFO).forEach(function (k) { dims[k] = M.defaults(k); });
    var solidData, sec, n, h, lo, hi, K = 1;     // K: tỉ lệ khung nhìn (1 = vừa hình lập phương cạnh 2)
    var showDims = true;
    var presets = [];

    /* ---------- Bảng điều khiển ---------- */
    ui.select({ label: 'Khối', value: state.solid,
      options: Object.keys(SOLID_INFO).map(function (k) { return [k, SOLID_INFO[k].name]; }),
      onChange: function (v) { state.solid = v; buildDims(); buildSolid(true); buildPresets(); applyPreset(presets[0]); } });
    var dimBox = ui.group('Kích thước khối (nhập số)');
    function buildDims() {
      [].slice.call(dimBox.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); });
      M.DIMS[state.solid].forEach(function (x) {
        ui.number({ label: x[1], value: dims[state.solid][x[0]], min: 0.1, max: 100, onChange: function (v) {
          dims[state.solid][x[0]] = v; stopPlay(); buildSolid(true); buildPresets(); update();
        } }, dimBox);
      });
    }
    var presetRow = ui.row('Thiết diện mẫu');
    var sF = ui.slider({ label: 'Vị trí mặt phẳng', min: 0, max: 1, step: 'any', value: state.f, scale: 100, decimals: 1, unit: '%',
      onInput: function (v) { state.f = v; stopPlay(); clearActive(); update(); } });
    var sA = ui.slider({ label: 'Nghiêng quanh Ox', min: -90, max: 90, step: 'any', value: 0, decimals: 2, unit: '°',
      onInput: function (v) { state.a = v; clearActive(); update(); } });
    var sB = ui.slider({ label: 'Nghiêng quanh Oz', min: -90, max: 90, step: 'any', value: 0, decimals: 2, unit: '°',
      onInput: function (v) { state.b = v; clearActive(); update(); } });
    var note = document.createElement('div'); note.className = 'ctl-note';
    note.textContent = 'Có thể gõ số trực tiếp vào các ô rồi nhấn Enter. Vị trí 0% là mặt phẳng vừa chạm khối ở một phía, 100% là chạm ở phía bên kia.';
    ui.side.appendChild(note);
    var opts = ui.row();
    ui.checkbox('Hiện mặt phẳng cắt', true, function (v) { state.showPlane = v; update(); }, opts);
    ui.checkbox('Tách hai phần', false, function (v) { state.split = v; update(); }, opts);
    ui.checkbox('Hiện kích thước', true, function (v) { showDims = v; if (dimGroup) dimGroup.visible = v; }, opts);
    var btns = ui.row();
    var playBtn = ui.button(btns, '▶ Quét mặt phẳng', function () { state.playing ? stopPlay() : startPlay(); });
    ui.button(btns, '↺ Đặt lại', function () {
      stopPlay(); dims[state.solid] = M.defaults(state.solid); buildDims(); buildSolid(true); buildPresets(); applyPreset(presets[0]);
      if (webgl) { controls.target.set(0, 0, 0); camera.position.set(4.6, 3.4, 5.6).multiplyScalar(K); }
    }, 'btn secondary');

    var p2 = document.createElement('div'); p2.className = 'panel2d';
    p2.innerHTML = '<div class="panel2d-title">Hình dạng thật của thiết diện (nhìn thẳng)</div>';
    var c2 = document.createElement('canvas'); c2.width = 540; c2.height = 340; c2.style.width = '100%';
    c2.setAttribute('role', 'img'); p2.appendChild(c2); ui.side.appendChild(p2);
    var setOut = ui.readout([['name', 'Thiết diện'], ['sides', 'Số cạnh'], ['perim', 'Chu vi'], ['area', 'Diện tích']]);

    var badge = document.createElement('div'); badge.className = 'badge'; ui.stage.appendChild(badge);

    function buildPresets() {
      presets = SOLID_INFO[state.solid].presets(dims[state.solid]);
      presetRow.innerHTML = '';
      presets.forEach(function (p) {
        ui.button(presetRow, p[0], function () { stopPlay(); applyPreset(p); }, 'chip');
      });
    }
    /* Gọi tên thiết diện tại (a, b, f) và đo độ "đẹp" = cạnh ngắn nhất / cạnh dài nhất. */
    function probe(a, b, f) {
      var nn = M.normalFromTilt(a, b), ds = solidData.vertices.map(function (v) { return M.dot(nn, v); });
      var l = Math.min.apply(null, ds), hh = l + (Math.max.apply(null, ds) - l) * f, s = M.section(solidData, nn, hh);
      if (s.polygon.length < 3) return { name: '', q: 0 };
      if (solidData.curved) return { name: M.classifyCurved(state.solid, nn, hh, s, solidData), q: 1 };
      var c = M.classifyPolygon(s.uv);
      return { name: c.name, q: Math.min.apply(null, c.sides) / Math.max.apply(null, c.sides) };
    }
    /* Dò tham số cho ra đúng hình như nhãn mẫu (khi kích thước khối thay đổi), ưu tiên hình cân đối,
       không có cạnh quá ngắn, và gần với tham số gốc của mẫu. */
    function findPreset(p) {
      var want = p[0], ok = function (nm) { return nm.indexOf(want) === 0; };
      var r0 = probe(p[1], p[2], p[3]);
      if (ok(r0.name) && r0.q >= 0.25) return p;
      var best = ok(r0.name) ? { p: p, s: r0.q } : null, f, a, b;
      function consider(a, b, f, dist) {
        var r = probe(a, b, f); if (!ok(r.name)) return;
        var score = Math.min(r.q, 0.6) - 0.002 * dist;       // cân đối trước, gần mẫu sau
        if (!best || score > best.s) best = { p: [want, a, b, f], s: score };
      }
      for (f = 0.02; f < 0.99; f += 0.02) consider(p[1], p[2], f, 50 * Math.abs(f - p[3]));
      if (solidData.curved && !best) {                  // khối tròn: dò thêm theo góc nghiêng quanh Ox
        var angs = [0.05, 0.1, 0.2, 0.3, 0.5, 0.75]; for (a = 1; a <= 90; a += 1) angs.push(a);   // cả góc rất nhỏ cho khối rất dẹt
        angs.forEach(function (aa) { for (f = 0.04; f < 0.97; f += 0.04) consider(aa, p[2], f, Math.abs(aa - p[1]) + 50 * Math.abs(f - p[3])); });
      }
      if (!solidData.curved && (!best || best.s < 0.25)) {
        for (a = -85; a <= 85; a += 5) for (b = -85; b <= 85; b += 5) for (f = 0.05; f < 0.96; f += 0.05)
          consider(a, b, f, Math.abs(a - p[1]) + Math.abs(b - p[2]) + 50 * Math.abs(f - p[3]));
      }
      return best ? best.p : p;
    }
    function applyPreset(p) {
      var q = findPreset(p);
      state.a = q[1]; state.b = q[2]; state.f = q[3];
      sA.set(q[1]); sB.set(q[2]); sF.set(q[3]); update();
      [].forEach.call(presetRow.children, function (c) { c.classList.toggle('active', c.textContent === p[0]); });
    }
    function clearActive() { [].forEach.call(presetRow.children, function (c) { c.classList.remove('active'); }); }
    var playT0 = 0;
    function startPlay() { state.playing = true; playT0 = performance.now(); playBtn.textContent = '⏸ Tạm dừng'; }
    function stopPlay() { state.playing = false; playBtn.textContent = '▶ Quét mặt phẳng'; }

    /* ---------- Cảnh 3D ---------- */
    var webgl = ui.hasWebGL() && window.THREE;
    var dimGroup, gridLabel, grid, axes, renderer, scene, camera, controls, groupLow, groupHigh, solidMeshes = [], planeMesh, planeEdge, secLow, secHigh, secLineLow, secLineHigh, clipLow, clipHigh, vertexDots;
    if (webgl) {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.localClippingEnabled = true;
      ui.stage.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-label', 'Mô hình 3D: khối và mặt phẳng cắt. Kéo để xoay, cuộn để phóng to.');
      var hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = 'Kéo để xoay · Cuộn/chụm hai ngón để phóng to · Chuột phải để dời';
      ui.stage.appendChild(hint);
      gridLabel = document.createElement('div'); gridLabel.className = 'hint hint-right'; ui.stage.appendChild(gridLabel);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, 4 / 3, 0.1, 100);
      camera.position.set(4.6, 3.4, 5.6);
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.minDistance = 3.5; controls.maxDistance = 16; controls.saveState();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85));
      var dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(5, 8, 6); scene.add(dl);
      addAxes();
      clipLow = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
      clipHigh = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      groupLow = new THREE.Group(); groupHigh = new THREE.Group(); scene.add(groupLow); scene.add(groupHigh);

      planeMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4),
        new THREE.MeshBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
      planeMesh.renderOrder = 2;
      planeEdge = new THREE.LineSegments(new THREE.EdgesGeometry(planeMesh.geometry), new THREE.LineBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.6 }));
      planeMesh.add(planeEdge); scene.add(planeMesh);

      var secMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a, side: THREE.DoubleSide, transparent: true, opacity: 0.92,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      secLow = new THREE.Mesh(new THREE.BufferGeometry(), secMat); secLow.renderOrder = 3; groupLow.add(secLow);
      secHigh = new THREE.Mesh(new THREE.BufferGeometry(), secMat); secHigh.renderOrder = 3; groupHigh.add(secHigh);
      var lineMat = new THREE.LineBasicMaterial({ color: 0xc2410c });
      secLineLow = new THREE.LineLoop(new THREE.BufferGeometry(), lineMat); groupLow.add(secLineLow);
      secLineHigh = new THREE.LineLoop(new THREE.BufferGeometry(), lineMat); groupHigh.add(secLineHigh);
      vertexDots = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xc2410c, size: 0.09 }));
      groupLow.add(vertexDots);

      new ResizeObserver(resize).observe(ui.stage); resize();
      window.addEventListener('themechange', function () { buildDimLabels(); update(); });
    } else {
      ui.stage.innerHTML = '<div class="nowebgl">Trình duyệt của bạn không hỗ trợ WebGL nên không hiện được mô hình 3D. ' +
        'Bạn vẫn dùng được các thanh trượt: hình dạng thật của thiết diện hiện ở khung bên phải.</div>';
      ui.stage.style.minHeight = '0';
    }

    /* Tỉ lệ khung nhìn. Không phóng theo đúng cỡ khối (như vậy khối luôn trông như cũ),
       mà chỉ lùi camera khi khối quá to, phóng gần khi khối quá nhỏ — nên khi nhập cạnh lớn hơn,
       khối trông to lên thấy rõ. Lưới nền giữ đơn vị cố định để so sánh. */
    function viewScale(ext) { return Math.max(ext / 2.2, Math.min(1, ext / 0.6)); }
    function niceStep(x) { var s = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]; for (var i = 0; i < s.length; i++) if (s[i] >= x) return s[i]; return 100; }
    function fit(newK) {
      var ratio = newK / K;
      camera.position.sub(controls.target).multiplyScalar(ratio).add(controls.target);
      controls.minDistance = 2 * newK; controls.maxDistance = 20 * newK;
      camera.near = 0.02 * newK; camera.far = 200 * newK; camera.updateProjectionMatrix();
      var minY = Math.min.apply(null, solidData.vertices.map(function (v) { return v[1]; }));
      // lưới: ô có độ dài "đẹp" (0,5; 1; 2…), phủ khoảng 8K
      var cell = niceStep(0.45 * newK), divs = Math.max(4, Math.round(8 * newK / cell / 2) * 2);
      if (grid) { scene.remove(grid); grid.geometry.dispose(); }
      grid = new THREE.GridHelper(cell * divs, divs, 0x8899aa, 0x8899aa);
      grid.material.transparent = true; grid.material.opacity = 0.25; grid.position.y = minY - 0.05 * newK; scene.add(grid);
      if (gridLabel) gridLabel.textContent = 'Ô lưới nền = ' + String(cell).replace('.', ',') + ' đv';
      axes.scale.setScalar(newK); axes.position.set(-2.6 * newK, minY - 0.05 * newK, -2.6 * newK);
      planeMesh.scale.setScalar(Math.max(M.extent(solidData) / Math.sqrt(3), 0.25 * newK));
      vertexDots.material.size = 0.09 * newK;
    }

    /* Nhãn kích thước trên mô hình 3D (a, h, r) */
    function labelSprite(text) {
      var c = document.createElement('canvas'), ctx = c.getContext('2d'), fs = 44;
      ctx.font = '600 ' + fs + 'px "Segoe UI", sans-serif';
      var wpx = Math.ceil(ctx.measureText(text).width) + 28; c.width = wpx; c.height = fs + 22;
      ctx.font = '600 ' + fs + 'px "Segoe UI", sans-serif';
      ctx.fillStyle = ui.css('--surface') || '#fff'; ctx.strokeStyle = ui.css('--border') || '#ccc'; ctx.lineWidth = 3;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(2, 2, wpx - 4, c.height - 4, 14); else ctx.rect(2, 2, wpx - 4, c.height - 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = ui.css('--text') || '#000'; ctx.textBaseline = 'middle'; ctx.fillText(text, 14, c.height / 2 + 2);
      var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
      var hgt = 0.32 * K; sp.scale.set(hgt * c.width / c.height, hgt, 1); sp.renderOrder = 10;
      return sp;
    }
    function dimLine(p, q, dashed) {
      var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3().fromArray(p), new THREE.Vector3().fromArray(q)]);
      var m = dashed ? new THREE.LineDashedMaterial({ color: 0x8250df, dashSize: 0.08 * K, gapSize: 0.06 * K, depthTest: false })
                     : new THREE.LineBasicMaterial({ color: 0x8250df, depthTest: false });
      var l = new THREE.Line(g, m); if (dashed) l.computeLineDistances(); l.renderOrder = 9; return l;
    }
    function fmtDim(x) { return String(+x.toFixed(3)).replace('.', ','); }
    function buildDimLabels() {
      if (dimGroup) { scene.remove(dimGroup); dimGroup.traverse(function (o) { if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } if (o.geometry) o.geometry.dispose(); }); }
      dimGroup = new THREE.Group(); dimGroup.visible = showDims; scene.add(dimGroup);
      var d = solidData.dims, H = d.h, items = [], off = 0.32 * K;
      function add(text, p, q, dashed, dir) {
        dimGroup.add(dimLine(p, q, dashed));
        var s = labelSprite(text), m = [(p[0] + q[0]) / 2 + dir[0] * off, (p[1] + q[1]) / 2 + dir[1] * off, (p[2] + q[2]) / 2 + dir[2] * off];
        s.position.fromArray(m); dimGroup.add(s);
      }
      if (state.solid === 'cube') {
        var s = d.a / 2;
        add('a = ' + fmtDim(d.a), [-s, -s, s], [s, -s, s], false, [0, -0.7, 0.7]);
      } else if (state.solid === 'pyramid') {
        add('a = ' + fmtDim(d.a), [-d.a / 2, -H / 2, d.a / 2], [d.a / 2, -H / 2, d.a / 2], false, [0, -0.7, 0.7]);
        add('h = ' + fmtDim(H), [0, -H / 2, 0], [0, H / 2, 0], true, [1, 0, 0]);
      } else if (state.solid === 'prism') {
        var R = d.a / Math.sqrt(3), P1 = [R * Math.cos(-Math.PI / 6), -H / 2, R * Math.sin(-Math.PI / 6)], P2 = [0, -H / 2, R];
        add('a = ' + fmtDim(d.a), P1, P2, false, [0.6, -0.6, 0.6]);
        add('h = ' + fmtDim(H), [0, -H / 2, R], [0, H / 2, R], false, [-0.8, 0, 0.6]);
      } else {
        var c45 = Math.SQRT1_2 * d.r;
        add('r = ' + fmtDim(d.r), [0, -H / 2, 0], [c45, -H / 2, c45], true, [0.5, -0.8, -0.5]);
        add('h = ' + fmtDim(H), [0, -H / 2, 0], [0, H / 2, 0], true, [-0.8, 0, 0.6]);
      }
    }
    function addAxes() {
      var mk = function (to, color) {
        var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), to]);
        return new THREE.Line(g, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 }));
      };
      var ax = axes = new THREE.Group(); ax.position.set(-2.6, -1.6, -2.6);
      ax.add(mk(new THREE.Vector3(0.9, 0, 0), 0xe5534b)); ax.add(mk(new THREE.Vector3(0, 0.9, 0), 0x3fb950)); ax.add(mk(new THREE.Vector3(0, 0, 0.9), 0x4f8cff));
      scene.add(ax);
    }
    function resize() {
      var w = ui.stage.clientWidth, hgt = Math.max(320, Math.min(520, Math.round(w * 0.72)));
      ui.stage.style.height = hgt + 'px';
      renderer.setSize(w, hgt); camera.aspect = w / hgt; camera.updateProjectionMatrix();
    }

    function solidGeometry(kind, data) {
      var d = data.dims;
      if (kind === 'cylinder') return new THREE.CylinderGeometry(d.r, d.r, d.h, 128, 1);
      if (kind === 'cone') return new THREE.ConeGeometry(d.r, d.h, 128, 1);
      var pos = [];
      data.faces.forEach(function (f) {
        for (var i = 1; i < f.length - 1; i++) [f[0], f[i], f[i + 1]].forEach(function (k) { pos.push.apply(pos, data.vertices[k]); });
      });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      return g;
    }
    function buildSolid(refit) {
      solidData = M.SOLIDS[state.solid](dims[state.solid]);
      var newK = viewScale(M.extent(solidData));
      if (webgl && refit) fit(newK);
      K = newK;
      if (!webgl) return;
      buildDimLabels();
      solidMeshes.forEach(function (m) { m.parent.remove(m); m.geometry.dispose(); });
      solidMeshes = [];
      var g = solidGeometry(state.solid, solidData);
      var eg = new THREE.EdgesGeometry(g, 25);
      [[groupLow, clipLow], [groupHigh, clipHigh]].forEach(function (pair) {
        var mat = new THREE.MeshStandardMaterial({ color: 0x9db4d6, roughness: 0.6, metalness: 0.05, transparent: true, opacity: 0.38,
          side: THREE.DoubleSide, depthWrite: false, clippingPlanes: [pair[1]] });
        var mesh = new THREE.Mesh(g, mat); mesh.renderOrder = 1;
        var edges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0x2b3a55, clippingPlanes: [pair[1]] }));
        pair[0].add(mesh); pair[0].add(edges); solidMeshes.push(mesh, edges);
      });
    }

    function fmt(x) { return (Math.abs(x) >= 100 ? x.toFixed(1) : x.toFixed(2)).replace('.', ','); }

    /* ---------- Cập nhật ---------- */
    function update() {
      n = M.normalFromTilt(state.a, state.b);
      var ds = solidData.vertices.map(function (v) { return M.dot(n, v); });
      lo = Math.min.apply(null, ds); hi = Math.max.apply(null, ds);
      h = lo + (hi - lo) * state.f;
      sec = M.section(solidData, n, h);
      var name = '—', sides = '—', area = '—', perim = '—';
      if (sec.polygon.length >= 3) {
        name = solidData.curved ? M.classifyCurved(state.solid, n, h, sec, solidData) : M.classifyPolygon(sec.uv).name;
        sides = solidData.curved && sec.polygon.length > 8 ? 'biên cong' : String(sec.polygon.length);
        area = fmt(sec.area) + ' (đvdt)';
        var per = 0; sec.uv.forEach(function (p, i) { var q = sec.uv[(i + 1) % sec.uv.length]; per += Math.hypot(q[0] - p[0], q[1] - p[1]); });
        perim = fmt(per) + ' (đv)';
      } else if (sec.points.length) { name = sec.points.length === 1 ? 'Một điểm' : 'Một đoạn thẳng'; }
      else name = 'Không cắt';
      setOut('name', name); setOut('sides', sides); setOut('area', area); setOut('perim', perim);
      badge.textContent = name;
      c2.setAttribute('aria-label', 'Thiết diện: ' + name + ', diện tích ' + area);
      draw2D(name);
      if (webgl) update3D();
    }

    function update3D() {
      var N = new THREE.Vector3(n[0], n[1], n[2]);
      var half = state.split ? 0.5 * K : 0;             // mỗi phần dời ra 0,5 đơn vị theo pháp tuyến
      groupLow.position.copy(N.clone().multiplyScalar(-half));
      groupHigh.position.copy(N.clone().multiplyScalar(half));
      clipLow.set(N.clone().negate(), h - half);    // giữ phần n·p ≤ h (sau khi dời)
      clipHigh.set(N.clone(), -(h + half));         // giữ phần n·p ≥ h (sau khi dời)
      groupHigh.visible = true;
      solidMeshes.forEach(function (m) { if (m.material.opacity !== undefined && m.isMesh) m.material.opacity = state.split ? 0.75 : 0.38; });
      planeMesh.visible = state.showPlane && !state.split;
      planeMesh.position.copy(N.clone().multiplyScalar(h));
      planeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
      var poly = sec.polygon;
      var tri = [], line = [], dots = [];
      if (poly.length >= 3) {
        var c = sec.center;
        for (var i = 0; i < poly.length; i++) {
          var p = poly[i], q = poly[(i + 1) % poly.length];
          tri.push(c[0], c[1], c[2], p[0], p[1], p[2], q[0], q[1], q[2]);
          line.push(p[0], p[1], p[2]);
          if (!solidData.curved) dots.push(p[0], p[1], p[2]);
        }
      }
      [secLow, secHigh].forEach(function (m) { m.geometry.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3)); m.geometry.computeBoundingSphere(); });
      [secLineLow, secLineHigh].forEach(function (m) { m.geometry.setAttribute('position', new THREE.Float32BufferAttribute(line, 3)); m.geometry.computeBoundingSphere(); });
      vertexDots.geometry.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
      secHigh.visible = secLineHigh.visible = state.split;
    }

    /* ---------- Khung 2D: hình dạng thật ---------- */
    function draw2D(name) {
      var ctx = c2.getContext('2d'), W = c2.width, H = c2.height;
      ctx.clearRect(0, 0, W, H);
      var uv = sec.uv || [];
      if (uv.length < 3) { ctx.fillStyle = ui.css('--muted'); ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(name, W / 2, H / 2); return; }
      // Hướng vẽ: đa giác → cạnh dài nhất nằm ngang; đường cong → giữ "phía trên của khối" ở phía trên.
      var i, ang = 0;
      var upU = sec.u[1], upV = sec.v[1];             // hình chiếu trục Oy lên mặt phẳng cắt
      if (solidData.curved) {
        if (Math.hypot(upU, upV) > 1e-6) ang = Math.PI / 2 - Math.atan2(upV, upU);
      } else {
        var best = 0, bl = 0;
        for (i = 0; i < uv.length; i++) { var a = uv[i], b = uv[(i + 1) % uv.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > bl + 1e-9) { bl = l; best = i; } }
        var A = uv[best], B = uv[(best + 1) % uv.length];
        ang = -Math.atan2(B[1] - A[1], B[0] - A[0]);
        // đặt cạnh dài nhất ở dưới
        var cy0 = 0; uv.forEach(function (p) { cy0 += p[0] * Math.sin(ang) + p[1] * Math.cos(ang); }); cy0 /= uv.length;
        if (A[0] * Math.sin(ang) + A[1] * Math.cos(ang) > cy0) ang += Math.PI;
      }
      var pts = uv.map(function (p) { return [p[0] * Math.cos(ang) - p[1] * Math.sin(ang), p[0] * Math.sin(ang) + p[1] * Math.cos(ang)]; });
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
      var s = Math.min((W - 130) / (maxX - minX || 1), (H - 90) / (maxY - minY || 1), 75 / K);
      var ox = W / 2 - s * (minX + maxX) / 2, oy = H / 2 + s * (minY + maxY) / 2;
      var P = pts.map(function (p) { return [ox + s * p[0], oy - s * p[1]]; });
      // lưới: bước 1, 2, 5, 10… đơn vị sao cho ô lưới không quá dày
      var step = 1, steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
      for (var si = 0; si < steps.length; si++) { step = steps[si]; if (step * s >= 28) break; }
      var gs = step * s;
      ctx.strokeStyle = ui.css('--border'); ctx.lineWidth = 1;
      for (var gx = ((ox % gs) + gs) % gs; gx < W; gx += gs) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = ((oy % gs) + gs) % gs; gy < H; gy += gs) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.fillStyle = ui.css('--muted'); ctx.font = '18px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('ô lưới = ' + String(step).replace('.', ',') + ' đv', W - 8, H - 6);
      ctx.beginPath(); P.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      ctx.fillStyle = 'rgba(255,122,26,0.35)'; ctx.fill(); ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 4; ctx.stroke();
      if (!solidData.curved || uv.length <= 8) {
        ctx.font = '600 24px "Segoe UI", sans-serif'; ctx.fillStyle = ui.css('--text'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var cx = P.reduce(function (t, p) { return t + p[0]; }, 0) / P.length, cy = P.reduce(function (t, p) { return t + p[1]; }, 0) / P.length;
        for (i = 0; i < P.length; i++) {
          var p1 = P[i], p2 = P[(i + 1) % P.length], mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
          var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
          var len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / s;
          ctx.fillText(fmt(len), mx + dx / d * 30, my + dy / d * 20);
        }
        ctx.fillStyle = '#ff7a1a';
        P.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.fill(); });
      }
    }

    /* ---------- Khởi động ---------- */
    buildDims(); buildSolid(false); if (webgl) { camera.position.multiplyScalar(K); fit(K); } buildPresets();
    var initial = presets.filter(function (p) { return p[0] === el.getAttribute('data-preset'); })[0] || presets[0];
    applyPreset(initial);
    ui.loop(function (t) {
      if (state.playing) {
        var f = 0.5 - 0.48 * Math.cos((t - playT0) / 2200);
        state.f = f; sF.set(f); update();
      }
      if (webgl) { controls.update(); renderer.render(scene, camera); }
    });
  });
})();
