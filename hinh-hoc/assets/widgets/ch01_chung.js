/* ch01_chung.js — Tiện ích dùng chung cho các minh họa Chương 1 (không đăng ký widget).
   GeoWidget.ch01.pointRow(...)  : một dòng "A ( x ; y )" gồm hai ô nhập số.
   GeoWidget.ch01.rot/refl/dil   : các phép biến hình trên tọa độ. */
(function () {
  'use strict';
  function f(x, d) { return GeoWidget.fmt(x, d == null ? 2 : d).replace('-', '−'); }
  function pt(p, d) { return '(' + f(p[0], d) + '; ' + f(p[1], d) + ')'; }
  var RAD = Math.PI / 180;

  /* Một dòng nhập tọa độ điểm. onSet([x, y]) được gọi khi người dùng nhập xong (Enter hoặc rời ô). */
  function pointRow(ui, parent, label, p, onSet, lim) {
    lim = lim || 50;
    var box = document.createElement('div'); box.className = 'ctl ctl-inline';
    var lab = document.createElement('label'); lab.textContent = label; box.appendChild(lab);
    var wrap = document.createElement('span'); wrap.className = 'num-wrap';
    function mk(v, name) {
      var i = document.createElement('input'); i.type = 'number'; i.className = 'num'; i.step = 'any';
      i.min = -lim; i.max = lim; i.value = +(+v).toFixed(2); i.style.width = '64px';
      i.setAttribute('aria-label', name + ' của ' + label);
      return i;
    }
    var ix = mk(p[0], 'Hoành độ'), iy = mk(p[1], 'Tung độ');
    var s1 = document.createElement('span'); s1.textContent = '(';
    var s2 = document.createElement('span'); s2.textContent = ';';
    var s3 = document.createElement('span'); s3.textContent = ')';
    [s1, ix, s2, iy, s3].forEach(function (e) { wrap.appendChild(e); });
    box.appendChild(wrap); (parent || ui.side).appendChild(box);
    function read(i) {
      var v = parseFloat(String(i.value).replace(',', '.'));
      if (isNaN(v) || v < -lim || v > lim) { i.classList.add('invalid'); i.title = 'Nhập số từ ' + (-lim) + ' đến ' + lim; return null; }
      i.classList.remove('invalid'); i.title = ''; return v;
    }
    function commit() { var x = read(ix), y = read(iy); if (x === null || y === null) return; onSet([x, y]); }
    [ix, iy].forEach(function (i) {
      i.addEventListener('change', commit);
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter') commit(); });
    });
    return {
      box: box, x: ix, y: iy,
      set: function (q) {
        if (document.activeElement !== ix) ix.value = +q[0].toFixed(2);
        if (document.activeElement !== iy) iy.value = +q[1].toFixed(2);
        ix.classList.remove('invalid'); iy.classList.remove('invalid');
      }
    };
  }

  function setNum(input, v) { if (input && document.activeElement !== input) { input.value = +(+v).toFixed(2); input.classList.remove('invalid'); } }
  function rot(p, c, deg) {
    var a = deg * RAD, ca = Math.cos(a), sa = Math.sin(a), x = p[0] - c[0], y = p[1] - c[1];
    return [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca];
  }
  /* đối xứng qua đường thẳng đi qua P, Q */
  function refl(p, P, Q) {
    var dx = Q[0] - P[0], dy = Q[1] - P[1], L = dx * dx + dy * dy;
    if (L < 1e-12) return [2 * P[0] - p[0], 2 * P[1] - p[1]];
    var t = ((p[0] - P[0]) * dx + (p[1] - P[1]) * dy) / L, h = [P[0] + t * dx, P[1] + t * dy];
    return [2 * h[0] - p[0], 2 * h[1] - p[1]];
  }
  function foot(p, P, Q) {
    var dx = Q[0] - P[0], dy = Q[1] - P[1], L = dx * dx + dy * dy;
    if (L < 1e-12) return P.slice();
    var t = ((p[0] - P[0]) * dx + (p[1] - P[1]) * dy) / L; return [P[0] + t * dx, P[1] + t * dy];
  }
  function dil(p, c, k) { return [c[0] + k * (p[0] - c[0]), c[1] + k * (p[1] - c[1])]; }
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  /* diện tích có dấu: > 0 nếu A → B → C ngược chiều kim đồng hồ */
  function sarea(A, B, C) { return ((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2; }
  /* góc (độ, từ 0 đến 180) tại đỉnh O của góc AOB */
  function angle(A, O, B) {
    var u = [A[0] - O[0], A[1] - O[1]], v = [B[0] - O[0], B[1] - O[1]];
    var nu = Math.hypot(u[0], u[1]), nv = Math.hypot(v[0], v[1]);
    if (nu < 1e-12 || nv < 1e-12) return NaN;
    var c = (u[0] * v[0] + u[1] * v[1]) / (nu * nv); return Math.acos(Math.max(-1, Math.min(1, c))) / RAD;
  }
  /* chuỗi số có dấu cho công thức: sgn(3) = "+ 3", sgn(-2) = "− 2" */
  function sgn(v) { return (v < 0 ? '− ' : '+ ') + f(Math.abs(v)); }
  function minus(s) { return String(s).replace(/^-/, '−'); }
  /* nhãn chiều của tam giác */
  function orient(s) { return Math.abs(s) < 1e-9 ? 'thẳng hàng' : (s > 0 ? 'ngược chiều kim đồng hồ' : 'cùng chiều kim đồng hồ'); }

  /* Tô lại màu nhãn của các điểm theo màu chữ của giao diện (ở giao diện tối, nhãn mặc định bị mờ). */
  function labels(board, C) {
    // jsxgraph.css (nạp sau book.css) đặt nền trắng cho .jxgbox; giữ nền trong suốt để hợp giao diện tối
    if (board.containerObj) board.containerObj.style.background = 'transparent';
    board.objectsList.forEach(function (o) { if (o.elType === 'point' && o.label) o.label.setAttribute({ strokeColor: C.text, highlightStrokeColor: C.text }); });
  }

  GeoWidget.ch01 = { labels: labels, f: f, pt: pt, pointRow: pointRow, setNum: setNum,
    rot: rot, refl: refl, foot: foot, dil: dil, dist: dist, sarea: sarea, angle: angle, sgn: sgn, minus: minus, orient: orient, RAD: RAD };
})();
