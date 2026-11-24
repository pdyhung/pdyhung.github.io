/* ch08_da_dien.js — Bài 1: Thuật ngữ hình học không gian.
   Khối đa diện: đánh dấu đỉnh, cạnh, mặt; đếm Đ, C, M và kiểm tra Đ − C + M = 2; trải hình (net) động.
   Khối tròn xoay: chú thích các bộ phận. */
(function () {
  'use strict';
  var PALETTE = [0x4f8cff, 0xff7a1a, 0x3fb950, 0xb392f0, 0xf2cc60, 0xe5534b, 0x39c5cf, 0xdb61a2, 0x7ee787, 0xffa657, 0x79c0ff, 0xd2a8ff, 0xffd33d, 0x8b949e];

  function v3(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
  /* Đa giác đều n đỉnh, cạnh a, ở độ cao y; một cạnh quay về phía +z (phía người xem) */
  function ring(n, a, y) {
    var R = a / (2 * Math.sin(Math.PI / n)), ph = Math.PI / 2 - Math.PI / n, out = [];
    for (var k = 0; k < n; k++) { var t = ph + 2 * Math.PI * k / n; out.push([R * Math.cos(t), y, R * Math.sin(t)]); }
    return out;
  }
  function orient(V, F) {
    // Đảm bảo thứ tự đỉnh của mỗi mặt cho pháp tuyến hướng ra ngoài
    var c = [0, 0, 0]; V.forEach(function (p) { c[0] += p[0] / V.length; c[1] += p[1] / V.length; c[2] += p[2] / V.length; });
    return F.map(function (f) {
      var n = faceNormal(V, f), fc = faceCenter(V, f);
      return (n.dot(fc.clone().sub(v3(c))) < 0) ? f.slice().reverse() : f;
    });
  }
  function faceNormal(V, f) {
    var n = new THREE.Vector3();
    for (var i = 0; i < f.length; i++) {
      var p = V[f[i]], q = V[f[(i + 1) % f.length]];
      n.x += (p[1] - q[1]) * (p[2] + q[2]); n.y += (p[2] - q[2]) * (p[0] + q[0]); n.z += (p[0] - q[0]) * (p[1] + q[1]);
    }
    return n.normalize();
  }
  function faceCenter(V, f) { var c = new THREE.Vector3(); f.forEach(function (k) { c.add(v3(V[k])); }); return c.multiplyScalar(1 / f.length); }
  function box(a, b, c) {
    var x = a / 2, y = c / 2, z = b / 2;
    var V = [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]];
    return { V: V, F: orient(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 4, 7, 3], [1, 5, 6, 2]]) };
  }
  function prism(n, a, h) {
    var V = ring(n, a, -h / 2).concat(ring(n, a, h / 2)), F = [], b = [], t = [], i;
    for (i = 0; i < n; i++) { b.push(i); t.push(n + i); F.push([i, (i + 1) % n, n + (i + 1) % n, n + i]); }
    F.push(b); F.push(t);
    return { V: V, F: orient(V, F) };
  }
  function pyramid(n, a, h) {
    var V = ring(n, a, -h / 2), F = [], b = [], i; V.push([0, h / 2, 0]);
    for (i = 0; i < n; i++) { b.push(i); F.push([i, (i + 1) % n, n]); }
    F.push(b);
    return { V: V, F: orient(V, F) };
  }
  function edgesOf(F) {
    var seen = {}, E = [];
    F.forEach(function (f, fi) {
      for (var i = 0; i < f.length; i++) {
        var p = f[i], q = f[(i + 1) % f.length], k = Math.min(p, q) + '-' + Math.max(p, q);
        if (!seen[k]) { seen[k] = { e: [p, q], faces: [fi] }; E.push(seen[k]); } else seen[k].faces.push(fi);
      }
    });
    return E;
  }

  /* Cây trải hình: mỗi mặt (trừ mặt đáy) gắn vào một mặt cha qua một cạnh chung (bản lề). */
  function unfoldTree(V, F) {
    var E = edgesOf(F), normals = F.map(function (f) { return faceNormal(V, f); });
    var base = 0; normals.forEach(function (n, i) { if (n.y < normals[base].y) base = i; });
    var parent = {}, hinge = {}, order = [base], seen = {}; seen[base] = 1;
    for (var qi = 0; qi < order.length; qi++) {
      var fi = order[qi];
      E.forEach(function (e) {
        if (e.faces.indexOf(fi) < 0) return;
        e.faces.forEach(function (g) {
          if (seen[g]) return; seen[g] = 1; parent[g] = fi; hinge[g] = e.e; order.push(g);
        });
      });
    }
    var info = {};
    order.forEach(function (g) {
      if (g === base) return;
      var A = v3(V[hinge[g][0]]), B = v3(V[hinge[g][1]]), d = B.clone().sub(A).normalize();
      var nF = normals[g], nP = normals[parent[g]];
      var th = Math.acos(Math.max(-1, Math.min(1, nF.dot(nP))));
      var test = nF.clone().applyAxisAngle(d, th);
      info[g] = { A: A, d: d, ang: test.dot(nP) > 0.999 ? th : -th };
    });
    return { base: base, order: order, parent: parent, info: info };
  }
  function netMatrices(tree, nF, t) {
    var M = []; M[tree.base] = new THREE.Matrix4();
    tree.order.forEach(function (g) {
      if (g === tree.base) return;
      var I = tree.info[g];
      var R = new THREE.Matrix4().makeTranslation(I.A.x, I.A.y, I.A.z)
        .multiply(new THREE.Matrix4().makeRotationAxis(I.d, I.ang * t))
        .multiply(new THREE.Matrix4().makeTranslation(-I.A.x, -I.A.y, -I.A.z));
      M[g] = M[tree.parent[g]].clone().multiply(R);
    });
    return M;
  }

  var KINDS = {
    lap_phuong: { name: 'Hình lập phương', make: function () { return box(2, 2, 2); } },
    hop: { name: 'Hình hộp chữ nhật', make: function () { return box(3, 2, 1.6); } },
    lang_tru: { name: 'Hình lăng trụ đều n-giác', n: true, make: function (n) { return prism(n, Math.min(1.6, 5 / n), 2); } },
    chop: { name: 'Hình chóp đều n-giác', n: true, make: function (n) { return pyramid(n, Math.min(1.9, 6 / n), 2); } },
    tru: { name: 'Hình trụ', curved: true }, non: { name: 'Hình nón', curved: true }, cau: { name: 'Hình cầu', curved: true }
  };

  GeoWidget.register('ch08_da_dien', function (ui, el) {
    var st = { kind: el.getAttribute('data-kind') || 'lap_phuong', n: 5, t: 0, playing: false, dir: 1,
               showV: true, showE: true, colorF: true };
    ui.select({ label: 'Khối', value: st.kind, options: Object.keys(KINDS).map(function (k) { return [k, KINDS[k].name]; }),
      onChange: function (v) { st.kind = v; st.t = 0; sT.set(0); stop(); build(true); } });
    var nBox = ui.group('Đáy là đa giác đều');
    ui.number({ label: 'Số cạnh đáy n (3 – 12)', value: st.n, min: 3, max: 12, step: 1, onChange: function (v) { st.n = Math.round(v); build(false); } }, nBox);
    var sT = ui.slider({ label: 'Trải hình', min: 0, max: 1, value: 0, scale: 100, decimals: 0, unit: '%',
      onInput: function (v) { st.t = v; stop(); applyNet(); } });
    var row = ui.row();
    var playBtn = ui.button(row, '▶ Mở ra / Gấp lại', function () { st.playing ? stop() : play(); });
    var opts = ui.row('Đánh dấu');
    ui.checkbox('Đỉnh', true, function (v) { st.showV = v; style(); }, opts);
    ui.checkbox('Cạnh', true, function (v) { st.showE = v; style(); }, opts);
    ui.checkbox('Tô màu từng mặt', true, function (v) { st.colorF = v; style(); }, opts);
    var setOut = ui.readout([['V', 'Số đỉnh Đ'], ['E', 'Số cạnh C'], ['F', 'Số mặt M'], ['eu', 'Đ − C + M']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    var S = GeoWidget.scene3d(ui, { aria: 'Mô hình khối không gian và hình trải của nó' });
    var group = null, faces = [], outlines = [], dots = [], tree = null, data = null, labels = null, extSolid = 2, extNet = 2;
    function stop() { st.playing = false; playBtn.textContent = '▶ Mở ra / Gấp lại'; }
    function play() { st.playing = true; st.dir = st.t >= 0.999 ? -1 : 1; playBtn.textContent = '⏸ Tạm dừng'; }

    function build(reset) {
      var K = KINDS[st.kind];
      nBox.style.display = K.n ? '' : 'none';
      sT.input.disabled = !!K.curved; playBtn.disabled = !!K.curved;
      if (K.curved) {
        setOut('V', '—'); setOut('E', '—'); setOut('F', '—'); setOut('eu', '—');
        note.textContent = K.name + ' có mặt cong nên không phải khối đa diện: không đếm đỉnh, cạnh, mặt như khối đa diện, và không trải phẳng bằng cách gập các mặt.';
      } else {
        data = K.make(st.n);
        var E = edgesOf(data.F);
        setOut('V', data.V.length); setOut('E', E.length); setOut('F', data.F.length); setOut('eu', String(data.V.length - E.length + data.F.length));
        note.textContent = 'Kéo thanh “Trải hình” để mở khối thành hình phẳng (hình trải). Mỗi mặt quay quanh một cạnh chung với mặt bên cạnh.';
      }
      if (!S) return;
      S.dispose(group); S.dispose(labels); faces = []; outlines = []; dots = [];
      group = new THREE.Group(); S.scene.add(group);
      labels = new THREE.Group(); S.scene.add(labels);
      if (K.curved) { buildCurved(st.kind); S.setView(1.7, -1, { reset: reset }); return; }
      tree = unfoldTree(data.V, data.F);
      data.F.forEach(function (f, i) {
        var pos = [];
        for (var k = 1; k < f.length - 1; k++) [f[0], f[k], f[k + 1]].forEach(function (j) { pos.push.apply(pos, data.V[j]); });
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
        var m = new THREE.Mesh(g, S.mat(PALETTE[i % PALETTE.length], 0.88, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
        m.matrixAutoUpdate = false; group.add(m); faces.push(m);
        var lg = new THREE.BufferGeometry().setFromPoints(f.map(function (j) { return v3(data.V[j]); }));
        var l = new THREE.LineLoop(lg, new THREE.LineBasicMaterial({ color: 0x1f2328 })); l.matrixAutoUpdate = false; group.add(l); outlines.push(l);
      });
      data.V.forEach(function (p) { var d = S.dot(p, 0xcf222e, 0.06); group.add(d); dots.push(d); });
      var minY = Math.min.apply(null, data.V.map(function (p) { return p[1]; }));
      // bán kính bao của khối và của hình trải (khi mở hết) để camera lùi dần khi trải
      extSolid = Math.max.apply(null, data.V.map(function (p) { return Math.hypot(p[0], p[1], p[2]); }));
      var M1 = netMatrices(tree, data.F.length, 1), cx = 0, cz = 0, cnt = 0, pts = [];
      data.F.forEach(function (f, i) { f.forEach(function (j) { var v = v3(data.V[j]).applyMatrix4(M1[i]); pts.push(v); cx += v.x; cz += v.z; cnt++; }); });
      cx /= cnt; cz /= cnt;
      extNet = Math.max.apply(null, pts.map(function (v) { return Math.hypot(v.x, v.z); }));
      S.setView(Math.max(extSolid, extNet * 0.9), minY, { reset: reset });
      S.zoomTo(extSolid * 1.1);
      style(); applyNet();
    }
    function style() {
      faces.forEach(function (m, i) { m.material.color.setHex(st.colorF ? PALETTE[i % PALETTE.length] : 0x9db4d6); });
      outlines.forEach(function (l) { l.material.color.setHex(st.showE ? 0xff7a1a : 0x1f2328); });
      dots.forEach(function (d) { d.visible = st.showV && st.t < 0.001; });
    }
    function applyNet() {
      if (!S || !tree) return;
      var M = netMatrices(tree, data.F.length, st.t);
      faces.forEach(function (m, i) { m.matrix.copy(M[i]); m.matrixWorldNeedsUpdate = true; });
      outlines.forEach(function (l, i) { l.matrix.copy(M[i]); l.matrixWorldNeedsUpdate = true; });
      dots.forEach(function (d) { d.visible = st.showV && st.t < 0.001; });
      S.zoomTo(extSolid * 1.1 + (extNet * 0.95 - extSolid * 1.1) * Math.max(0, st.t));
    }
    el.__debug = function () { return { data: data, M: tree ? netMatrices(tree, data.F.length, st.t) : null }; };

    function buildCurved(kind) {
      var T = THREE, mat = S.mat(0x9db4d6, 0.45), r = 1, h = 2, lab = function (t, p) { labels.add(S.label(t, p)); };
      var line = function (p, q, dashed) { labels.add(S.line(p, q, { dashed: dashed })); };
      var c = Math.SQRT1_2;
      if (kind === 'tru') {
        group.add(new T.Mesh(new T.CylinderGeometry(r, r, h, 96, 1), mat));
        group.add(new T.LineSegments(new T.EdgesGeometry(new T.CylinderGeometry(r, r, h, 96, 1), 30), new T.LineBasicMaterial({ color: 0x2b3a55 })));
        line([0, -1.3, 0], [0, 1.3, 0], true); lab('trục', [0, 1.45, 0]);
        line([0, -1, 0], [r * c, -1, r * c]); lab('bán kính r', [r * c * 0.5 + 0.35, -1.25, r * c * 0.5 + 0.35]);
        line([r * c, -1, r * c], [r * c, 1, r * c]); lab('đường sinh (= chiều cao h)', [r * c + 0.9, 0.1, r * c + 0.2]);
        lab('mặt đáy', [-0.9, -1.2, 0.4]); lab('mặt đáy', [-0.9, 1.2, 0.4]); lab('mặt xung quanh', [-1.4, 0.2, 0]);
      } else if (kind === 'non') {
        group.add(new T.Mesh(new T.ConeGeometry(r, h, 96, 1), mat));
        group.add(new T.LineSegments(new T.EdgesGeometry(new T.ConeGeometry(r, h, 96, 1), 30), new T.LineBasicMaterial({ color: 0x2b3a55 })));
        group.add(S.dot([0, 1, 0], 0xcf222e, 0.06)); lab('đỉnh', [0, 1.3, 0]);
        line([0, -1, 0], [0, 1, 0], true); lab('chiều cao h', [-0.55, 0, 0]);
        line([0, -1, 0], [r * c, -1, r * c]); lab('bán kính r', [r * c * 0.5 + 0.3, -1.25, r * c * 0.5 + 0.3]);
        line([0, 1, 0], [r * c, -1, r * c]); lab('đường sinh l', [r * c * 0.5 + 0.55, 0.05, r * c * 0.5 + 0.2]);
        lab('mặt đáy', [-0.9, -1.2, 0.4]);
      } else {
        var R = 1.3;
        group.add(new T.Mesh(new T.SphereGeometry(R, 64, 32), mat));
        var circ = []; for (var i = 0; i <= 128; i++) { var a = 2 * Math.PI * i / 128; circ.push(new T.Vector3(R * Math.cos(a), 0, R * Math.sin(a))); }
        group.add(new T.Line(new T.BufferGeometry().setFromPoints(circ), new T.LineBasicMaterial({ color: 0xff7a1a })));
        group.add(S.dot([0, 0, 0], 0xcf222e, 0.06)); lab('tâm O', [-0.35, 0.22, 0]);
        line([0, 0, 0], [R * c, R * 0.0, R * c]); lab('bán kính R', [R * c * 0.5 + 0.2, 0.25, R * c * 0.5 + 0.2]);
        line([0, -R, 0], [0, R, 0], true); lab('đường kính = 2R', [0.75, R + 0.1, 0]);
        lab('đường tròn lớn', [-R - 0.2, -0.25, 0.6]);
      }
    }

    if (S) {
      S.onTheme(function () { build(false); });
      S.frame.push(function () {
        if (!st.playing) return;
        st.t = Math.max(0, Math.min(1, st.t + st.dir * 0.008));
        sT.set(st.t); applyNet();
        if (st.t <= 0 || st.t >= 1) stop();
      });
    }
    build(true);
  });
})();
