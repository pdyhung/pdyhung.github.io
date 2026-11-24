/* ch03_common.js — Tiện ích dùng chung cho các minh họa Chương 3 (Sự bằng nhau).
   Không đăng ký widget nào; chỉ khai báo window.CH03. */
(function () {
  'use strict';
  var D = Math.PI / 180;
  function norm(a) { while (a <= -Math.PI) a += 2 * Math.PI; while (a > Math.PI) a -= 2 * Math.PI; return a; }
  var H = window.CH03 = {
    D: D,
    norm: norm,
    f: function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); },
    fd: function (x, d) { return isFinite(x) ? GeoWidget.fmt(x, d == null ? 1 : d) + '°' : '—'; },
    dist: function (P, Q) { return Math.hypot(Q[0] - P[0], Q[1] - P[1]); },
    dir: function (P, Q) { return Math.atan2(Q[1] - P[1], Q[0] - P[0]); },
    /* góc PQR tại đỉnh Q, đơn vị độ, trong [0; 180] */
    ang: function (P, Q, R) { return Math.abs(norm(H.dir(Q, R) - H.dir(Q, P))) / D; },
    add: function (P, Q) { return [P[0] + Q[0], P[1] + Q[1]]; },
    sub: function (P, Q) { return [P[0] - Q[0], P[1] - Q[1]]; },
    mul: function (P, k) { return [P[0] * k, P[1] * k]; },
    mid: function (P, Q) { return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; },
    lerp: function (P, Q, t) { return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]; },
    polar: function (P, r, a) { return [P[0] + r * Math.cos(a), P[1] + r * Math.sin(a)]; },
    /* quay điểm P quanh O một góc a (radian) */
    rot: function (P, a, O) { O = O || [0, 0]; var x = P[0] - O[0], y = P[1] - O[1], c = Math.cos(a), s = Math.sin(a); return [O[0] + x * c - y * s, O[1] + x * s + y * c]; },
    /* đối xứng P qua đường thẳng đi qua A, B */
    reflect: function (P, A, B) {
      var dx = B[0] - A[0], dy = B[1] - A[1], L = dx * dx + dy * dy, t = ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / L;
      var F = [A[0] + t * dx, A[1] + t * dy]; return [2 * F[0] - P[0], 2 * F[1] - P[1]];
    },
    /* giao của hai đường tròn (tâm P bán kính r, tâm Q bán kính s): mảng 0–2 điểm; điểm thứ nhất nằm bên trái vectơ PQ */
    circles: function (P, r, Q, s) {
      var d = H.dist(P, Q); if (d < 1e-9 || d > r + s + 1e-9 || d < Math.abs(r - s) - 1e-9) return [];
      var a = (r * r - s * s + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r * r - a * a));
      var ux = (Q[0] - P[0]) / d, uy = (Q[1] - P[1]) / d, M = [P[0] + a * ux, P[1] + a * uy];
      return [[M[0] - h * uy, M[1] + h * ux], [M[0] + h * uy, M[1] - h * ux]];
    },
    /* chiều quay của tam giác: >0 ngược chiều kim đồng hồ */
    orient: function (A, B, C) { return (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]); },
    /* góc không tù-phản (≤180°) PQR: trả về [góc đầu, góc cuối] (radian, tăng dần) để vẽ cung */
    wedge: function (P, Q, R) {
      var a = H.dir(Q, P), d = norm(H.dir(Q, R) - a);
      return d >= 0 ? [a, a + d] : [a + d, a];
    },
    arcPts: function (c, r, a0, a1, n) {
      n = n || Math.max(8, Math.ceil(Math.abs(a1 - a0) / 0.05)); var out = [];
      for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
      return out;
    },
    sectorPts: function (c, r, a0, a1) { return [c].concat(H.arcPts(c, r, a0, a1)).concat([c]); },
    /* đường cong có dữ liệu tính lại mỗi lần cập nhật: fn() trả về mảng điểm [[x,y],…] hoặc null (ẩn) */
    path: function (board, fn, attrs) {
      var c = board.create('curve', [[0], [0]], Object.assign({ highlight: false, fixed: true }, attrs || {}));
      c.updateDataArray = function () {
        var p = fn() || []; this.dataX = p.map(function (q) { return q[0]; }); this.dataY = p.map(function (q) { return q[1]; });
      };
      return c;
    },
    /* chữ đặt tại vị trí động: pos() → [x,y]; txt là chuỗi hoặc hàm */
    label: function (board, pos, txt, attrs) {
      return board.create('text', [function () { return pos()[0]; }, function () { return pos()[1]; }, txt],
        Object.assign({ anchorX: 'middle', anchorY: 'middle', fixed: true, highlight: false }, attrs || {}));
    },
    /* điểm phụ thuộc (không kéo được) */
    dep: function (board, fn, attrs) {
      return board.create('point', [function () { return fn()[0]; }, function () { return fn()[1]; }], Object.assign({ fixed: true, size: 3, highlight: false }, attrs || {}));
    },
    /* ghi giá trị vào ô số, trừ khi người dùng đang gõ trong ô đó */
    put: function (input, v, d) { if (document.activeElement !== input) input.value = +(+v).toFixed(d == null ? 2 : d); },
    /* giao điểm của đường thẳng P1P2 và Q1Q2 */
    inter: function (P1, P2, Q1, Q2) {
      var d1 = H.sub(P2, P1), d2 = H.sub(Q2, Q1), det = d1[0] * d2[1] - d1[1] * d2[0];
      if (Math.abs(det) < 1e-12) return [NaN, NaN];
      var t = ((Q1[0] - P1[0]) * d2[1] - (Q1[1] - P1[1]) * d2[0]) / det; return H.add(P1, H.mul(d1, t));
    },
    /* góc giữa hai đường thẳng PQ và RS, đơn vị độ, trong [0; 90] */
    lineAng: function (P, Q, R, S) { var a = Math.abs(H.norm(H.dir(P, Q) - H.dir(R, S))) / D; return a > 90 ? 180 - a : a; },
    /* khoảng cách từ P đến đường thẳng AB */
    distLine: function (P, A, B) { return Math.abs(H.orient(A, B, P)) / H.dist(A, B); },
    /* khung chữ giải thích bên dưới bảng số đo; trả về hàm set(html) */
    note: function (ui) {
      var d = document.createElement('div'); d.className = 'ch03-note'; d.setAttribute('aria-live', 'polite');
      d.style.cssText = 'font-size:14px;line-height:1.5;padding:8px 10px;border-left:3px solid var(--accent);background:var(--surface-2);border-radius:6px';
      ui.side.appendChild(d); return function (html) { d.innerHTML = html; };
    },
    xy: function (P) { return [P.X(), P.Y()]; },
    ease: function (u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; },
    pt: function (P) { return '(' + H.f(P[0]) + '; ' + H.f(P[1]) + ')'; },
    ok: function (b) { return b ? ' ✓' : ' ✗'; }
  };
})();
