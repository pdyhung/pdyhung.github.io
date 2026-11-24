/* ch02_common.js — Tiện ích dùng chung cho các minh họa Chương 2 (không đăng ký widget).
   Phép biến hình được mô tả bằng đối tượng T = { type, ...tham số }:
     tt    : tịnh tiến theo vectơ (a; b)
     quay  : quay tâm (x0; y0) góc alpha (độ, dương = ngược chiều kim đồng hồ)
     dxt   : đối xứng trục d đi qua (x0; y0), góc nghiêng phi (độ) so với Ox
     dxtam : đối xứng tâm (x0; y0)
     vitu  : vị tự tâm (x0; y0) tỉ số k
     co    : co giãn theo phương Ox: (x; y) → (k·x; y) */
(function () {
  'use strict';
  var D = Math.PI / 180;
  function f(x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); }
  function P(p, d) { return '(' + f(p[0], d) + '; ' + f(p[1], d) + ')'; }
  function rot(p, c, deg) {
    var a = deg * D, x = p[0] - c[0], y = p[1] - c[1];
    return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];
  }
  function refl(p, c, phi) {
    var a = 2 * phi * D, x = p[0] - c[0], y = p[1] - c[1];
    return [c[0] + x * Math.cos(a) + y * Math.sin(a), c[1] + x * Math.sin(a) - y * Math.cos(a)];
  }
  function foot(p, c, phi) {
    var u = [Math.cos(phi * D), Math.sin(phi * D)], s = (p[0] - c[0]) * u[0] + (p[1] - c[1]) * u[1];
    return [c[0] + s * u[0], c[1] + s * u[1]];
  }
  /* Ảnh của p qua T; t ∈ [0; 1] cho hoạt ảnh (t = 1: ảnh thật). */
  function apply(T, p, t) {
    if (t == null) t = 1;
    var s;
    switch (T.type) {
      case 'tt': return [p[0] + t * T.a, p[1] + t * T.b];
      case 'quay': return rot(p, [T.x0, T.y0], t * T.alpha);
      case 'dxtam': return rot(p, [T.x0, T.y0], t * 180);
      case 'dxt':
        if (t >= 1) return refl(p, [T.x0, T.y0], T.phi);
        var H = foot(p, [T.x0, T.y0], T.phi); s = 1 - 2 * t;
        return [H[0] + s * (p[0] - H[0]), H[1] + s * (p[1] - H[1])];
      case 'vitu': s = 1 + t * (T.k - 1); return [T.x0 + s * (p[0] - T.x0), T.y0 + s * (p[1] - T.y0)];
      case 'co': s = 1 + t * (T.k - 1); return [p[0] * s, p[1]];
    }
    return p.slice();
  }
  var TYPES = {
    tt: { name: 'Phép tịnh tiến', keys: ['a', 'b'], labels: ['Vectơ v: hoành độ a', 'Vectơ v: tung độ b'], def: { a: 4, b: 1 } },
    quay: { name: 'Phép quay', keys: ['x0', 'y0', 'alpha'], labels: ['Tâm O: hoành độ', 'Tâm O: tung độ', 'Góc quay α (°)'], def: { x0: 0, y0: 0, alpha: 90 } },
    dxt: { name: 'Phép đối xứng trục', keys: ['x0', 'y0', 'phi'], labels: ['Trục d qua điểm: hoành độ', 'Trục d qua điểm: tung độ', 'Góc nghiêng φ của d (°)'], def: { x0: 0, y0: 0, phi: 90 } },
    dxtam: { name: 'Phép đối xứng tâm', keys: ['x0', 'y0'], labels: ['Tâm O: hoành độ', 'Tâm O: tung độ'], def: { x0: 0, y0: 0 } },
    vitu: { name: 'Phép vị tự', keys: ['x0', 'y0', 'k'], labels: ['Tâm O: hoành độ', 'Tâm O: tung độ', 'Tỉ số k'], def: { x0: 0, y0: 0, k: 2 } },
    co: { name: 'Phép co giãn theo Ox', keys: ['k'], labels: ['Hệ số co giãn k'], def: { k: 2 } }
  };
  function make(type, src) {
    var T = { type: type }, d = TYPES[type].def;
    TYPES[type].keys.forEach(function (k) { T[k] = src && src[k] != null ? src[k] : d[k]; });
    return T;
  }
  /* Phương trình đường thẳng qua c, góc nghiêng phi */
  function lineEq(c, phi) {
    phi = ((phi % 180) + 180) % 180;
    if (Math.abs(phi - 90) < 1e-6) return 'x = ' + f(c[0]);
    if (Math.abs(phi) < 1e-6 || Math.abs(phi - 180) < 1e-6) return 'y = ' + f(c[1]);
    var m = Math.tan(phi * D), q = c[1] - m * c[0];
    var ms = Math.abs(m - 1) < 1e-9 ? 'x' : Math.abs(m + 1) < 1e-9 ? '−x' : f(m) + 'x';
    if (Math.abs(q) < 1e-9) return 'y = ' + ms;
    return 'y = ' + ms + (q > 0 ? ' + ' : ' − ') + f(Math.abs(q));
  }
  function norm180(a) { a = ((a % 360) + 360) % 360; if (a > 180 + 1e-9) a -= 360; return a; }
  function name(T) {
    switch (T.type) {
      case 'tt': return 'Tịnh tiến theo v = ' + P([T.a, T.b]);
      case 'quay': return 'Quay tâm ' + P([T.x0, T.y0]) + ', góc ' + f(T.alpha, 1) + '°';
      case 'dxt': return 'Đối xứng trục d: ' + lineEq([T.x0, T.y0], T.phi);
      case 'dxtam': return 'Đối xứng tâm ' + P([T.x0, T.y0]);
      case 'vitu': return 'Vị tự tâm ' + P([T.x0, T.y0]) + ', tỉ số ' + f(T.k);
      case 'co': return 'Co giãn theo Ox, hệ số ' + f(T.k);
    }
    return '';
  }
  /* Phân loại một phép biến hình affine cho bởi hàm map(p) → p′ */
  function classify(map) {
    var o = map([0, 0]), ex = map([1, 0]), ey = map([0, 1]);
    var a = ex[0] - o[0], c = ex[1] - o[1], b = ey[0] - o[0], d = ey[1] - o[1], e = o[0], g = o[1];
    var eps = 1e-6, det = a * d - b * c;
    var ortho = Math.abs(a * a + c * c - 1) < eps && Math.abs(b * b + d * d - 1) < eps && Math.abs(a * b + c * d) < eps;
    if (!ortho) {
      if (Math.abs(a - d) < eps && Math.abs(b) < eps && Math.abs(c) < eps) {
        var k = a, cx = e / (1 - k), cy = g / (1 - k);
        return { kind: 'vitu', text: 'Phép vị tự tâm ' + P([cx, cy]) + ', tỉ số ' + f(k) };
      }
      return { kind: 'khac', text: 'Không phải phép dời hình (độ dài thay đổi)' };
    }
    if (det > 0) {
      var th = norm180(Math.atan2(c, a) / D);
      if (Math.abs(th) < 1e-4) {
        if (Math.hypot(e, g) < 1e-6) return { kind: 'dongnhat', text: 'Phép đồng nhất (mọi điểm đứng yên)' };
        return { kind: 'tt', text: 'Phép tịnh tiến theo vectơ ' + P([e, g]), v: [e, g] };
      }
      var m11 = 1 - a, m12 = -b, m21 = -c, m22 = 1 - d, dt = m11 * m22 - m12 * m21;
      var X = (e * m22 - m12 * g) / dt, Y = (m11 * g - m21 * e) / dt;
      if (Math.abs(Math.abs(th) - 180) < 1e-4) return { kind: 'dxtam', text: 'Phép đối xứng tâm ' + P([X, Y]) + ' (quay 180°)', c: [X, Y] };
      return { kind: 'quay', text: 'Phép quay tâm ' + P([X, Y]) + ', góc ' + f(th, 1) + '°', c: [X, Y], angle: th };
    }
    var phi = Math.atan2(c, a) / D / 2; phi = ((phi % 180) + 180) % 180;
    var u = [Math.cos(phi * D), Math.sin(phi * D)], gl = e * u[0] + g * u[1];
    var pp = [(e - gl * u[0]) / 2, (g - gl * u[1]) / 2];
    if (Math.abs(gl) < 1e-6) return { kind: 'dxt', text: 'Phép đối xứng trục: ' + lineEq(pp, phi), c: pp, phi: phi };
    return { kind: 'truot', text: 'Phép đối xứng trượt: trục ' + lineEq(pp, phi) + ', trượt ' + f(gl) + ' đơn vị dọc trục', c: pp, phi: phi };
  }
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  function angleAt(p, q, r) { /* góc tại q, độ */
    var a = [p[0] - q[0], p[1] - q[1]], b = [r[0] - q[0], r[1] - q[1]];
    var cs = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]) || 1);
    return Math.acos(Math.max(-1, Math.min(1, cs))) / D;
  }
  function area(pts) { /* diện tích có dấu (dương: ngược chiều kim đồng hồ) */
    var s = 0; for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; }
    return s / 2;
  }
  /* Ô nhập tham số dùng chung: n ô số, đổi nhãn theo loại phép biến hình. */
  function paramPanel(ui, parent, n, onChange) {
    var ins = [];
    for (var i = 0; i < n; i++) (function (i) {
      ins.push(ui.number({ label: 'Tham số ' + (i + 1), value: 0, min: -1000, max: 1000, onChange: function (v) { onChange(i, v); } }, parent));
    })(i);
    return {
      inputs: ins,
      show: function (T) {
        var ty = TYPES[T.type];
        ins.forEach(function (inp, i) {
          var box = inp.parentNode;
          if (i >= ty.keys.length) { box.style.display = 'none'; return; }
          box.style.display = ''; box.querySelector('label').textContent = ty.labels[i];
          if (document.activeElement !== inp) inp.value = +(+T[ty.keys[i]]).toFixed(3);
          inp.classList.remove('invalid');
        });
      },
      key: function (T, i) { return TYPES[T.type].keys[i]; }
    };
  }
  /* Đường cong kín tô màu theo danh sách điểm do hàm getPts() trả về (số đỉnh có thể thay đổi). */
  function shape(board, getPts, attr) {
    var cu = board.create('curve', [[0], [0]], attr);
    cu.updateDataArray = function () {
      var pts = getPts() || [];
      this.dataX = pts.map(function (p) { return p[0]; });
      this.dataY = pts.map(function (p) { return p[1]; });
      if (pts.length && attr.closed !== false) { this.dataX.push(pts[0][0]); this.dataY.push(pts[0][1]); }
    };
    board.update();
    return cu;
  }
  /* Ghi chú trạng thái màu (đúng / sai) */
  function note(ui, parent) {
    var d = document.createElement('div'); d.className = 'ctl-note'; d.setAttribute('aria-live', 'polite');
    (parent || ui.side).appendChild(d);
    return function (html, kind) {
      d.innerHTML = html || '';
      d.style.color = kind === 'ok' ? 'var(--ok)' : kind === 'bad' ? 'var(--bad)' : '';
      d.style.fontWeight = kind ? '600' : '';
    };
  }
  window.CH02 = { D: D, f: f, P: P, rot: rot, refl: refl, foot: foot, apply: apply, TYPES: TYPES, make: make, name: name, lineEq: lineEq,
    classify: classify, dist: dist, angleAt: angleAt, area: area, paramPanel: paramPanel, shape: shape, note: note, norm180: norm180 };
})();
