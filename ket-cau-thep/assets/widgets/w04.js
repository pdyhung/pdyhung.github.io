/* W4 – Giằng chữ X chỉ chịu kéo (Tension Only) – đổi chiều lực, thanh làm việc, nội lực (Bài 3.3) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W4'] = function (el) {
  const F = WC.frame(el, { title: 'W4 · Giằng chữ X chỉ chịu kéo',
    tryText: 'đổi chiều lực $H$: thanh làm việc chuyển từ "/" sang "\\". Sau đó chọn Linear Static để thấy một thanh bị tính là chịu nén – điều thanh tròn mảnh không làm được.' });
  const v = { b: 8, h: 7.07, H: 20, d: 20, dir: 'R', mode: 'nl' };
  [['b', 'Bước khung $b$', 3, 12, 0.5, 'm'], ['h', 'Chiều cao ô giằng $h$', 3, 12, 0.01, 'm'],
   ['H', 'Lực ngang $H$ (gió dọc nhà)', 0, 100, 1, 'kN'], ['d', 'Đường kính giằng $d$', 12, 30, 2, 'mm']]
    .forEach(([k, l, a, b, st, u]) => WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } }));
  WC.select(F.ctrl, { label: 'Chiều lực', options: [['R', '→ đặt tại đỉnh trái'], ['L', '← đặt tại đỉnh phải']], value: 'R', onChange: x => { v.dir = x; upd(); } });
  WC.select(F.ctrl, { label: 'Phân tích', options: [['nl', 'Nonlinear Static + Tension Only'], ['lin', 'Linear Static (giới hạn nén bị bỏ qua)']], value: 'nl', onChange: x => { v.mode = x; upd(); } });
  function forces() {
    const L = Math.hypot(v.b, v.h), cos = v.b / L, A = Math.PI * v.d * v.d / 4;
    // thanh "/" (chân trái – đỉnh phải) chịu kéo khi H hướng sang phải; thanh "\" khi H hướng sang trái
    const k = v.mode === 'nl' ? 1 : 0.5, T = k * v.H / cos;
    const NS = v.dir === 'R' ? T : (v.mode === 'nl' ? 0 : -T), NB = v.dir === 'L' ? T : (v.mode === 'nl' ? 0 : -T);
    return { L, cos, A, NS, NB, strut: -k * v.H, V: v.H * v.h / v.b, th: Math.atan2(v.h, v.b) * 180 / Math.PI };
  }
  function draw(r) {
    const W = 460, Hh = 300, s = Math.min(300 / v.b, 220 / v.h), x0 = (W - v.b * s) / 2, x1 = x0 + v.b * s, yb = 265, yt = yb - v.h * s;
    const col = n => n > 1e-9 ? 'var(--acc)' : n < -1e-9 ? '#d9534f' : 'currentColor';
    const bar = (xa, ya, xb, yb2, n) => '<line x1="' + xa + '" y1="' + ya + '" x2="' + xb + '" y2="' + yb2 + '" stroke="' + col(n) + '" stroke-width="' + (Math.abs(n) > 1e-9 ? 4 : 1.5) + '"' + (Math.abs(n) > 1e-9 ? '' : ' stroke-dasharray="6 5" stroke-opacity=".5"') + '/>';
    const lab = (x, y, n) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" fill="' + col(n) + '">' + (Math.abs(n) > 1e-9 ? (n > 0 ? 'kéo ' : 'nén ') + WC.f(Math.abs(n), 2) + ' kN' : '0 (chùng)') + '</text>';
    let g = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:100%;max-height:320px" font-family="sans-serif" font-size="12">' +
      '<defs><marker id="w4a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor"/></marker></defs>';
    g += '<g stroke="currentColor" stroke-width="3"><line x1="' + x0 + '" y1="' + yb + '" x2="' + x0 + '" y2="' + yt + '"/><line x1="' + x1 + '" y1="' + yb + '" x2="' + x1 + '" y2="' + yt + '"/></g>';
    g += bar(x0, yt, x1, yt, r.strut) + bar(x0, yb, x1, yt, r.NS) + bar(x1, yb, x0, yt, r.NB);
    g += '<g fill="currentColor"><path d="M' + (x0 - 8) + ',' + (yb + 12) + ' L' + x0 + ',' + yb + ' L' + (x0 + 8) + ',' + (yb + 12) + ' z"/><path d="M' + (x1 - 8) + ',' + (yb + 12) + ' L' + x1 + ',' + yb + ' L' + (x1 + 8) + ',' + (yb + 12) + ' z"/></g>';
    const ax = v.dir === 'R' ? x0 : x1, sg = v.dir === 'R' ? 1 : -1;
    g += '<line x1="' + (ax - sg * 55) + '" y1="' + yt + '" x2="' + (ax - sg * 6) + '" y2="' + yt + '" stroke="currentColor" stroke-width="2" marker-end="url(#w4a)"/>' +
      '<text x="' + (ax - sg * 32) + '" y="' + (yt - 8) + '" text-anchor="middle" fill="currentColor">H = ' + WC.f(v.H, 0) + ' kN</text>';
    const mx = (x0 + x1) / 2, my = (yb + yt) / 2;
    g += lab(mx, yt - 8, r.strut) + lab(mx - 70, my - 16, r.NS) + lab(mx + 70, my - 16, r.NB);
    g += '<g fill="currentColor"><text x="' + x0 + '" y="' + (yb + 28) + '" text-anchor="middle">' + (v.dir === 'R' ? 'nhổ ' : 'nén ') + WC.f(r.V, 2) + ' kN</text>' +
      '<text x="' + x1 + '" y="' + (yb + 28) + '" text-anchor="middle">' + (v.dir === 'R' ? 'nén ' : 'nhổ ') + WC.f(r.V, 2) + ' kN</text>' +
      '<text x="' + mx + '" y="' + (yb + 28) + '" text-anchor="middle">b = ' + WC.f(v.b, 2) + ' m</text></g></svg>';
    F.view.innerHTML = g;
  }
  function upd() {
    const r = forces(), Tmax = Math.max(r.NS, r.NB), C = Math.min(r.NS, r.NB), lam = r.L * 1000 / (v.d / 4);
    WC.table(F.out, [
      ['Góc nghiêng giằng $\\theta$', WC.f(r.th, 2) + '°', 'Chiều dài $L$ = ' + WC.f(r.L, 3) + ' m'],
      ['Thanh "/" (chân trái – đỉnh phải)', WC.f(r.NS, 2) + ' kN', r.NS > 0 ? { v: 'Kéo – làm việc', cls: 'pass' } : r.NS < 0 ? { v: 'Nén – thanh tròn không chịu được', cls: 'fail' } : 'Chùng, N = 0'],
      ['Thanh "\\" (chân phải – đỉnh trái)', WC.f(r.NB, 2) + ' kN', r.NB > 0 ? { v: 'Kéo – làm việc', cls: 'pass' } : r.NB < 0 ? { v: 'Nén – thanh tròn không chịu được', cls: 'fail' } : 'Chùng, N = 0'],
      ['Thanh chống đỉnh', WC.f(r.strut, 2) + ' kN', 'Nén'],
      ['Ứng suất kéo $\\sigma = N/A$', WC.f(Tmax * 1000 / r.A, 1) + ' MPa', '$A$ = ' + WC.f(r.A, 1) + ' mm²'],
      ['Độ mảnh giằng $L/r$', WC.f(lam, 0), { v: 'Rất mảnh: coi như không chịu nén', cls: 'warn' }],
      ['Phản lực đứng chân cột $Hh/b$', '±' + WC.f(r.V, 2) + ' kN', 'Như nhau ở hai mô hình'],
      ['Kết luận', { v: v.mode === 'nl' ? 'Một thanh kéo $H/\\cos\\theta$, thanh kia chùng' : 'Mỗi thanh $H/(2\\cos\\theta)$, một kéo một nén: sai với thanh tròn', cls: v.mode === 'nl' ? 'pass' : 'fail' }, C < 0 ? 'Nén ' + WC.f(-C, 2) + ' kN' : '']
    ], ['Đại lượng', 'Giá trị', 'Ghi chú']);
    draw(r);
  }
  upd();
};
