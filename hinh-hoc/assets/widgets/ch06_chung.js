/* ch06_chung.js — Tiện ích dùng chung cho các minh họa Chương 6 (Hình học giải tích).
   Không phải một widget; được nạp trước các widget ch06_* (khai báo trong danh sách widgets của bài). */
(function () {
  'use strict';
  var G = window.GeoWidget;
  var ch = G.ch06 = {};

  /* Số kiểu Việt Nam, dấu trừ chuẩn (−) */
  ch.f = function (x, d) { return G.fmt(x, d == null ? 2 : d).replace('-', '−'); };
  ch.pt = function (p, d) { return '(' + ch.f(p[0], d) + '; ' + ch.f(p[1], d) + ')'; };
  ch.r2 = function (x) { return +(+x).toFixed(2); };
  ch.near = function (a, b, eps) { return Math.abs(a - b) < (eps || 1e-9); };

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  /* Phân số gọn nếu mẫu ≤ 12 (vd 0,5 → 1/2; −0,333… → −1/3), ngược lại số thập phân */
  ch.frac = function (x) {
    if (!isFinite(x)) return '—';
    for (var q = 1; q <= 12; q++) {
      var p = Math.round(x * q);
      if (Math.abs(x * q - p) < 1e-7) {
        var g = gcd(p, q); p /= g; var qq = q / g;
        if (qq === 1) return ch.f(p, 0);
        return (p < 0 ? '−' : '') + Math.abs(p) + '/' + qq;
      }
    }
    return ch.f(x, 2);
  };
  /* Số đặt trong ngoặc nếu âm: dùng khi thay số vào công thức */
  ch.par = function (x, useFrac) { var s = useFrac ? ch.frac(x) : ch.f(x); return x < 0 ? '(' + s + ')' : s; };
  /* √s: "5" nếu là số chính phương, "√52 ≈ 7,21" nếu s nguyên, ngược lại "≈ 7,21" */
  ch.sqrtStr = function (s) {
    var r = Math.sqrt(s), n = Math.round(s);
    if (Math.abs(s - n) < 1e-7) {
      var k = Math.round(r);
      if (k * k === n) return ch.f(k, 0);
      return '√' + n + ' ≈ ' + ch.f(r);
    }
    return '√' + ch.f(s) + ' ≈ ' + ch.f(r);
  };
  /* Phương trình y = ax + b dạng đẹp */
  ch.eq = function (a, b) {
    var s = 'y = ';
    if (ch.near(a, 0, 1e-9)) return s + ch.frac(b);
    if (ch.near(a, 1)) s += 'x'; else if (ch.near(a, -1)) s += '−x';
    else { var fa = ch.frac(a); s += fa.indexOf('/') >= 0 ? (a < 0 ? '−(' + fa.slice(1) + ')' : '(' + fa + ')') + 'x' : fa + 'x'; }
    if (!ch.near(b, 0, 1e-9)) s += (b < 0 ? ' − ' : ' + ') + ch.frac(Math.abs(b));
    return s;
  };
  /* Cho các hàng của bảng số đo (theo thứ tự, từ 0) chiếm cả chiều ngang: nhãn ở trên, giá trị ở dưới */
  ch.wide = function (ui, idx) {
    var dts = ui.side.querySelectorAll('.readout dt'), dds = ui.side.querySelectorAll('.readout dd');
    idx.forEach(function (i) { if (dts[i]) dts[i].style.gridColumn = '1 / -1'; if (dds[i]) { dds[i].style.gridColumn = '1 / -1'; dds[i].style.marginBottom = '4px'; } });
  };
  /* Hệ số góc của đường qua P, Q (Infinity nếu thẳng đứng) */
  ch.slope = function (P, Q) { var dx = Q[0] - P[0]; return Math.abs(dx) < 1e-9 ? Infinity : (Q[1] - P[1]) / dx; };
  ch.slopeStr = function (k) { return isFinite(k) ? ch.frac(k) : 'không có (đường thẳng đứng)'; };
  ch.mid = function (P, Q) { return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
  ch.dist = function (P, Q) { return Math.hypot(Q[0] - P[0], Q[1] - P[1]); };

  /* Nhóm ô nhập tọa độ (2 cột x, y) cho các điểm names. st[k] = [x, y]. onSet(k) gọi khi người dùng nhập. */
  ch.coords = function (ui, title, names, st, onSet, lim) {
    lim = lim || 20;
    var g = ui.group(title);
    g.style.gridTemplateColumns = 'minmax(0,1fr) minmax(0,1fr)'; g.style.columnGap = '12px';
    var ins = {};
    names.forEach(function (k) {
      ins[k] = [0, 1].map(function (i) {
        return ui.number({ label: '<span>' + (i ? 'y' : 'x') + '<sub>' + k + '</sub></span>', value: st[k][i], min: -lim, max: lim,
          onChange: function (v) { st[k][i] = v; onSet(k); } }, g);
      });
    });
    return {
      group: g, ins: ins,
      sync: function (k) { (k ? [k] : names).forEach(function (n) { ins[n][0].value = ch.r2(st[n][0]); ins[n][1].value = ch.r2(st[n][1]); ins[n][0].classList.remove('invalid'); ins[n][1].classList.remove('invalid'); }); },
      show: function (k, on) { ins[k].forEach(function (inp) { inp.parentNode.style.display = on ? '' : 'none'; }); }
    };
  };

  /* Điểm kéo được; nếu snap() đúng thì làm tròn tọa độ về số nguyên khi kéo. onDrag([x, y]) */
  ch.point = function (board, name, p, color, snap, onDrag, extra) {
    var o = { name: name, size: 4, color: color, strokeColor: color, fillColor: color, label: { offset: [7, 10] } };
    if (extra) for (var k in extra) o[k] = extra[k];
    var P = board.create('point', p, o);
    P.on('drag', function () {
      var x = P.X(), y = P.Y();
      if (snap()) { x = Math.round(x); y = Math.round(y); if (x !== P.X() || y !== P.Y()) P.moveTo([x, y]); }
      onDrag([x, y]);
    });
    return P;
  };
  /* Điểm ẩn có tọa độ là hàm */
  ch.fpt = function (board, fx, fy) { return board.create('point', [fx, fy], { visible: false, fixed: true, withLabel: false }); };
  /* Chữ cố định (không kéo được) */
  ch.text = function (board, fx, fy, ft, color, attrs) {
    var o = { fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle', fontSize: 14, strokeColor: color, cssStyle: 'font-weight:600' };
    if (attrs) for (var k in attrs) o[k] = attrs[k];
    return board.create('text', [fx, fy, ft], o);
  };
})();
