/* section-math.js — Tính thiết diện của khối lồi với mặt phẳng.
   Không phụ thuộc Three.js để có thể kiểm thử độc lập. */
(function (root) {
  'use strict';
  var EPS = 1e-9;   // (tương đối) điểm cách mặt phẳng < EPS·cỡ khối coi như nằm trên mặt phẳng
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; }
  var DEG = Math.PI / 180;

  /* Pháp tuyến từ hai góc nghiêng (độ): a quanh trục Ox, b quanh trục Oz.
     a = b = 0 → mặt phẳng nằm ngang (song song đáy). */
  function normalFromTilt(aDeg, bDeg) {
    var a = aDeg * DEG, b = bDeg * DEG;
    return [-Math.cos(a) * Math.sin(b), Math.cos(a) * Math.cos(b), Math.sin(a)];
  }

  /* ---------- Các khối (trục Oy hướng lên, tâm tại gốc, cao 2) ---------- */
  function edgesFromFaces(faces) {
    var seen = {}, edges = [];
    faces.forEach(function (f) {
      for (var i = 0; i < f.length; i++) {
        var p = f[i], q = f[(i + 1) % f.length];
        var k = p < q ? p + '-' + q : q + '-' + p;
        if (!seen[k]) { seen[k] = 1; edges.push([p, q]); }
      }
    });
    return edges;
  }
  function prismLike(n, rBottom, rTop, phase, H) {
    // Lăng trụ / chóp đều n cạnh, cao H, tâm tại gốc (rTop = 0 → chóp).
    var V = [], F = [], i, y0 = -H / 2, y1 = H / 2;
    for (i = 0; i < n; i++) {
      var t = phase + 2 * Math.PI * i / n;
      V.push([rBottom * Math.cos(t), y0, rBottom * Math.sin(t)]);
    }
    if (rTop === 0) {
      V.push([0, y1, 0]);
      for (i = 0; i < n; i++) F.push([i, (i + 1) % n, n]);
    } else {
      for (i = 0; i < n; i++) {
        var s = phase + 2 * Math.PI * i / n;
        V.push([rTop * Math.cos(s), y1, rTop * Math.sin(s)]);
      }
      for (i = 0; i < n; i++) F.push([i, (i + 1) % n, n + (i + 1) % n, n + i]);
      var top = []; for (i = 0; i < n; i++) top.push(n + i); F.push(top);
    }
    var bot = []; for (i = n - 1; i >= 0; i--) bot.push(i); F.push(bot);
    return { vertices: V, faces: F, edges: edgesFromFaces(F) };
  }
  function tag(s, kind, curved, d) { s.kind = kind; s.curved = curved; s.dims = d; return s; }

  /* Các khối, theo kích thước thật d (đơn vị độ dài tùy ý). Trục Oy hướng lên, tâm khối tại gốc.
     DIMS mô tả các kích thước nhập được của từng khối. */
  var DIMS = {
    cube:     [['a', 'Cạnh a', 2]],
    pyramid:  [['a', 'Cạnh đáy a', 2], ['h', 'Chiều cao h', 2]],
    prism:    [['a', 'Cạnh đáy a', 2], ['h', 'Chiều cao h', 2]],
    cylinder: [['r', 'Bán kính đáy r', 1], ['h', 'Chiều cao h', 2]],
    cone:     [['r', 'Bán kính đáy r', 1], ['h', 'Chiều cao h', 2]]
  };
  function defaults(kind) { var d = {}; DIMS[kind].forEach(function (x) { d[x[0]] = x[2]; }); return d; }
  var SOLIDS = {
    cube: function (d) {
      d = d || defaults('cube'); var s = d.a / 2;
      var V = [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]];
      var F = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [3, 7, 6, 2], [0, 4, 7, 3], [1, 2, 6, 5]];
      return tag({ vertices: V, faces: F, edges: edgesFromFaces(F) }, 'cube', false, d);
    },
    pyramid: function (d) { d = d || defaults('pyramid'); return tag(prismLike(4, d.a / Math.SQRT2, 0, Math.PI / 4, d.h), 'pyramid', false, d); },
    prism: function (d) { d = d || defaults('prism'); var R = d.a / Math.sqrt(3); return tag(prismLike(3, R, R, Math.PI / 2, d.h), 'prism', false, d); },
    cylinder: function (d) { d = d || defaults('cylinder'); return tag(prismLike(256, d.r, d.r, 0, d.h), 'cylinder', true, d); },
    cone: function (d) { d = d || defaults('cone'); return tag(prismLike(256, d.r, 0, 0, d.h), 'cone', true, d); }
  };
  /* Kích thước bao: dùng để đặt camera, lưới… */
  function extent(solid) {
    var m = 0; solid.vertices.forEach(function (v) { m = Math.max(m, len(v)); }); return m;
  }

  /* ---------- Thiết diện ---------- */
  function section(solid, n, h) {
    var V = solid.vertices, pts = [], scale = extent(solid), tol = 1e-4 * scale, eps = EPS * scale;
    function pushUnique(p) {
      for (var i = 0; i < pts.length; i++) if (len(sub(pts[i], p)) < tol) return;
      pts.push(p);
    }
    solid.edges.forEach(function (e) {
      var P = V[e[0]], Q = V[e[1]];
      var sp = dot(n, P) - h, sq = dot(n, Q) - h;
      if (Math.abs(sp) < eps) pushUnique(P);
      if (Math.abs(sq) < eps) pushUnique(Q);
      if ((sp < -eps && sq > eps) || (sp > eps && sq < -eps)) {
        var t = sp / (sp - sq);
        pushUnique(add(P, mul(sub(Q, P), t)));
      }
    });
    if (pts.length < 3) return { points: pts, polygon: [], uv: [], area: 0 };
    // Hệ trục (u, v) trong mặt phẳng
    var helper = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    var u = norm(cross(helper, n)), v = cross(n, u);
    var c = [0, 0, 0]; pts.forEach(function (p) { c = add(c, p); }); c = mul(c, 1 / pts.length);
    pts.sort(function (p, q) {
      var dp = sub(p, c), dq = sub(q, c);
      return Math.atan2(dot(dp, v), dot(dp, u)) - Math.atan2(dot(dq, v), dot(dq, u));
    });
    // Bỏ điểm nằm giữa hai cạnh thẳng hàng. Dùng sin của góc lệch (không phụ thuộc độ dài cạnh),
    // để không xóa nhầm các điểm dày đặc trên đường cong của hình trụ, hình nón.
    var poly = [], k;
    for (k = 0; k < pts.length; k++) {
      var A = pts[(k + pts.length - 1) % pts.length], B = pts[k], C = pts[(k + 1) % pts.length];
      var AB = sub(B, A), BC = sub(C, B);
      if (len(cross(AB, BC)) > 1e-7 * len(AB) * len(BC)) poly.push(B);
    }
    if (poly.length < 3) return { points: pts, polygon: [], uv: [], area: 0 };
    var uv = poly.map(function (p) { var d = sub(p, c); return [dot(d, u), dot(d, v)]; });
    var area = 0;
    for (k = 0; k < uv.length; k++) {
      var a = uv[k], b = uv[(k + 1) % uv.length];
      area += a[0] * b[1] - a[1] * b[0];
    }
    return { points: pts, polygon: poly, uv: uv, area: Math.abs(area) / 2, center: c, u: u, v: v };
  }

  /* ---------- Gọi tên thiết diện ---------- */
  function near(a, b, tol) { return Math.abs(a - b) < (tol || 1e-3); }
  function classifyPolygon(uv) {
    var m = uv.length, sides = [], vec = [], angles = [], i;
    for (i = 0; i < m; i++) {
      var a = uv[i], b = uv[(i + 1) % m];
      var e = [b[0] - a[0], b[1] - a[1]];
      vec.push(e); sides.push(Math.hypot(e[0], e[1]));
    }
    for (i = 0; i < m; i++) {
      var p = vec[(i + m - 1) % m], q = vec[i];
      var cosA = -(p[0] * q[0] + p[1] * q[1]) / (sides[(i + m - 1) % m] * sides[i]);
      angles.push(Math.acos(Math.max(-1, Math.min(1, cosA))) / DEG);
    }
    var allSidesEq = sides.every(function (s) { return near(s, sides[0], 1e-6 * sides[0]); });
    var allAngEq = angles.every(function (t) { return near(t, angles[0], 1e-4); });
    function parallel(p, q) { return Math.abs(p[0] * q[1] - p[1] * q[0]) < 1e-6 * Math.hypot(p[0], p[1]) * Math.hypot(q[0], q[1]); }
    var name;
    if (m === 3) {
      var maxA = Math.max.apply(null, angles);
      var kind = near(maxA, 90, 1e-4) ? 'vuông' : (maxA > 90 ? 'tù' : 'nhọn');
      if (allSidesEq) name = 'Tam giác đều';
      else if (near(sides[0], sides[1], 1e-6 * sides[0]) || near(sides[1], sides[2], 1e-6 * sides[1]) || near(sides[0], sides[2], 1e-6 * sides[0]))
        name = 'Tam giác cân' + (kind === 'nhọn' ? '' : ' ' + kind);
      else name = 'Tam giác ' + kind;
    } else if (m === 4) {
      var p02 = parallel(vec[0], vec[2]), p13 = parallel(vec[1], vec[3]);
      var right = angles.every(function (t) { return near(t, 90, 1e-4); });
      if (p02 && p13) {
        if (right) name = allSidesEq ? 'Hình vuông' : 'Hình chữ nhật';
        else name = allSidesEq ? 'Hình thoi' : 'Hình bình hành';
      } else if (p02 || p13) {
        var d1 = Math.hypot(uv[2][0] - uv[0][0], uv[2][1] - uv[0][1]);
        var d2 = Math.hypot(uv[3][0] - uv[1][0], uv[3][1] - uv[1][1]);
        name = near(d1, d2, 1e-6 * d1) ? 'Hình thang cân' : 'Hình thang';
      } else name = 'Tứ giác';
    } else if (m === 5) name = allSidesEq && allAngEq ? 'Ngũ giác đều' : 'Ngũ giác';
    else if (m === 6) name = allSidesEq && allAngEq ? 'Lục giác đều' : 'Lục giác';
    else name = 'Đa giác ' + m + ' cạnh';
    return { name: name, sides: sides, angles: angles };
  }

  /* Gọi tên cho hình trụ, hình nón (biên cong). */
  function classifyCurved(kind, n, h, sec, solid) {
    var d = solid.dims, H = d.h, ny = Math.abs(n[1]);
    var onBase = sec.polygon.filter(function (p) { return Math.abs(Math.abs(p[1]) - H / 2) < 1e-6 * H + 1e-9; }).length;
    if (kind === 'cylinder') {
      if (ny > 1 - 1e-12) return 'Hình tròn';
      if (ny < 1e-9) return 'Hình chữ nhật';
      var top = sec.polygon.filter(function (p) { return p[1] > H / 2 - 1e-6 * H; }).length;
      var bot = sec.polygon.filter(function (p) { return p[1] < -H / 2 + 1e-6 * H; }).length;
      if (top >= 2 && bot >= 2) return 'Một phần hình elip (bị hai đáy cắt cụt)';
      if (top >= 2 || bot >= 2) return 'Một phần hình elip (bị một đáy cắt cụt)';
      return 'Hình elip';
    }
    // Hình nón: đỉnh (0, H/2, 0), bán kính đáy r → nửa góc ở đỉnh α = arctan(r/H)
    var alpha = coneHalfAngle(d);
    var throughApex = Math.abs(n[1] * H / 2 - h) < 1e-6 * H;
    if (ny > 1 - 1e-12) return 'Hình tròn';
    if (throughApex) return 'Tam giác cân';
    var planeAxisAngle = 90 - Math.acos(ny) / DEG; // góc giữa mặt phẳng và trục
    // Mặt phẳng tạo với trục góc β: β > α → elip, β = α → parabol, β < α → hyperbol
    if (near(planeAxisAngle, alpha, 1e-6)) return 'Parabol (giới hạn bởi đáy)';
    var close = near(planeAxisAngle, alpha, 0.5) ? ' – gần parabol' : '';
    if (planeAxisAngle > alpha) return (onBase >= 2 ? 'Một phần hình elip (bị đáy cắt cụt)' : 'Hình elip') + close;
    return 'Hyperbol (một nhánh, giới hạn bởi đáy)' + close;
  }
  function coneHalfAngle(d) { return Math.atan(d.r / d.h) / DEG; }

  /* Vị trí (0…1) của mặt phẳng pháp tuyến n đi qua điểm P, so với khoảng quét của khối. */
  function fractionThrough(solid, n, P) {
    var ds = solid.vertices.map(function (v) { return dot(n, v); });
    var lo = Math.min.apply(null, ds), hi = Math.max.apply(null, ds);
    return (dot(n, P) - lo) / (hi - lo);
  }

  root.SectionMath = {
    SOLIDS: SOLIDS, section: section, normalFromTilt: normalFromTilt,
    classifyPolygon: classifyPolygon, classifyCurved: classifyCurved, dot: dot,
    DIMS: DIMS, defaults: defaults, extent: extent, coneHalfAngle: coneHalfAngle, fractionThrough: fractionThrough
  };
})(typeof window !== 'undefined' ? window : globalThis);
