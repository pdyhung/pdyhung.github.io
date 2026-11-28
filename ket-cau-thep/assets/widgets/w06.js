/* W6 – Phân vùng gió A–I và tải gió lên khung, TCVN 2737:2023 Phụ lục F (Bài 4.4) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W6'] = function (el) {
  const F = WC.frame(el, { title: 'W6 · Phân vùng gió và tải trên khung (Phụ lục F)',
    tryText: 'giảm chiều dài $b$ xuống 15 m: $e$ còn bằng $2h$ không? Tăng độ dốc lên 10 %: mái còn được coi là mái bằng không? Chọn "khung biên" và so tải kèo vùng F với vùng G của khung giữa.' });
  const v = { d: 50, b: 72, h: 8.82, i: 7, B: 8, W: 140.05, pos: 'giua' };
  const sl = (k, label, a, b, st, u) => WC.slider(F.ctrl, { label: label, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } });
  sl('d', 'Nhịp $d$ (song song hướng gió)', 10, 100, 1, 'm');
  sl('b', 'Chiều dài $b$ (vuông góc hướng gió)', 10, 150, 1, 'm');
  sl('h', 'Cao đỉnh mái $h$', 3, 30, 0.01, 'm');
  sl('i', 'Độ dốc mái', 0, 30, 0.5, '%');
  sl('B', 'Bước khung $B$', 3, 12, 0.5, 'm');
  sl('W', '$W/c$ (từ W5)', 30, 400, 0.01, 'daN/m²');
  WC.select(F.ctrl, { label: 'Khung xét', value: 'giua', options: [['giua', 'Khung giữa – vùng G, cả tải'], ['F', 'Khung trong phạm vi e/4 – vùng F, cả tải'], ['bien', 'Khung biên (đầu hồi) – vùng F, ½ tải']],
    onChange: p => { v.pos = p; upd(); } });
  const lerp = (x, x1, x2, y1, y2) => y1 + (y2 - y1) * (x - x1) / (x2 - x1);
  function ceWall(hd) {   // Bảng F.4: D, E theo h/d
    if (hd <= 0.25) return [0.7, -0.3];
    if (hd <= 1) return [lerp(hd, 0.25, 1, 0.7, 0.8), lerp(hd, 0.25, 1, -0.3, -0.5)];
    if (hd <= 5) return [0.8, lerp(hd, 1, 5, -0.5, -0.7)];
    return [0.8, -0.7];
  }
  function draw(g) {
    const W = 340, H = 270, m = 34, s = Math.min((W - 2 * m) / v.b, (H - 2 * m - 10) / v.d);
    const bw = v.b * s, dh = v.d * s, x0 = (W - bw) / 2, y0 = m, yW = y0 + dh;   // tường đón gió ở dưới (y = yW)
    const R = (x, y, w, h, op, lab) => '<rect x="' + x + '" y="' + y + '" width="' + Math.max(0, w) + '" height="' + Math.max(0, h) + '" fill="var(--acc)" fill-opacity="' + op + '" stroke="currentColor" stroke-opacity=".5"/>' +
      (lab && w > 9 && h > 9 ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 4) + '" text-anchor="middle" fill="currentColor">' + lab + '</text>' : '');
    let t = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:300px" font-family="sans-serif" font-size="11">';
    const e10 = Math.min(g.e / 10, v.d) * s, e2 = Math.min(g.e / 2, v.d) * s, e4 = Math.min(g.e / 4, v.b / 2) * s;
    t += R(x0, y0, bw, dh - e2, 0.05, 'I');
    t += R(x0, yW - e2, bw, e2 - e10, 0.2, 'H');
    t += R(x0 + e4, yW - e10, bw - 2 * e4, e10, 0.4, 'G');
    t += R(x0, yW - e10, e4, e10, 0.6, '') + R(x0 + bw - e4, yW - e10, e4, e10, 0.6, '');
    t += '<text x="' + (x0 + e4 / 2) + '" y="' + (yW - e10 - 4) + '" text-anchor="middle" fill="currentColor">F</text>';
    t += '<text x="' + (x0 + bw - e4 / 2) + '" y="' + (yW - e10 - 4) + '" text-anchor="middle" fill="currentColor">F</text>';
    // khung ngang (đường song song phương gió)
    t += '<g stroke="currentColor" stroke-opacity=".35" stroke-dasharray="2 3">';
    for (let x = 0; x <= v.b + 1e-6; x += v.B) t += '<line x1="' + (x0 + x * s) + '" y1="' + y0 + '" x2="' + (x0 + x * s) + '" y2="' + yW + '"/>';
    t += '</g>';
    const xf = g.pos === 'bien' ? 0 : g.pos === 'F' ? Math.min(g.e / 4, v.b / 2) * 0.5 : Math.round(v.b / 2 / v.B) * v.B;
    t += '<line x1="' + (x0 + xf * s) + '" y1="' + y0 + '" x2="' + (x0 + xf * s) + '" y2="' + yW + '" stroke="#d33" stroke-width="2.5"/>';
    // tường đầu hồi A, B, C (bên trái), D/E
    const zA = Math.min(g.e / 5, v.d) * s, zB = Math.min(g.e, v.d) * s;
    const seg = (a, b, lab) => b > a ? '<line x1="' + (x0 - 8) + '" y1="' + (yW - a) + '" x2="' + (x0 - 8) + '" y2="' + (yW - b) + '" stroke="currentColor" stroke-width="3" stroke-opacity="' + (lab === 'A' ? 1 : lab === 'B' ? 0.6 : 0.3) + '"/><text x="' + (x0 - 14) + '" y="' + (yW - (a + b) / 2 + 4) + '" text-anchor="end" fill="currentColor">' + lab + '</text>' : '';
    t += seg(0, zA, 'A') + seg(zA, zB, 'B') + seg(zB, dh, 'C');
    t += '<text x="' + (W / 2) + '" y="' + (yW + 14) + '" text-anchor="middle" fill="currentColor">D – tường đón gió (b = ' + WC.f(v.b, 1) + ' m)</text>';
    t += '<text x="' + (W / 2) + '" y="' + (y0 - 6) + '" text-anchor="middle" fill="currentColor">E – tường khuất gió</text>';
    t += '<g stroke="var(--acc)" stroke-width="2" fill="var(--acc)"><line x1="' + (W - 22) + '" y1="' + (H - 4) + '" x2="' + (W - 22) + '" y2="' + (H - 30) + '"/><path d="M' + (W - 27) + ' ' + (H - 26) + ' L' + (W - 22) + ' ' + (H - 34) + ' L' + (W - 17) + ' ' + (H - 26) + 'Z"/></g>';
    t += '<text x="' + (W - 30) + '" y="' + (H - 6) + '" text-anchor="end" fill="currentColor">gió</text></svg>';
    F.view.innerHTML = t;
  }
  function upd() {
    const e = Math.min(v.b, 2 * v.h), hd = v.h / v.d, alpha = Math.atan(v.i / 100) * 180 / Math.PI, flat = alpha < 5;
    const ce = ceWall(hd), roofLead = v.pos === 'giua' ? ['G', -1.2] : ['F', -1.8], fac = v.pos === 'bien' ? 0.5 : 1;
    const q = v.W * v.B * fac, r1 = x => Math.min(x, v.d);
    const f = (x, n) => WC.f(x, n == null ? 2 : n), fs = x => (x > 0 ? '+' : '') + WC.f(x, 2);
    const rows = [
      ['D – cột đón gió', 'toàn cao', ce[0]], ['E – cột khuất gió', 'toàn cao', ce[1]],
      [roofLead[0] + ' – kèo', '0 – ' + f(r1(e / 10)) + ' m', roofLead[1]],
      ['H – kèo', f(r1(e / 10)) + ' – ' + f(r1(e / 2)) + ' m', -0.7],
      ['I – kèo (âm)', f(r1(e / 2)) + ' – ' + f(v.d) + ' m', -0.2],
      ['I – kèo (dương)', f(r1(e / 2)) + ' – ' + f(v.d) + ' m', 0.2]
    ].map(([z, rg, c]) => { const a = c - 0.2, b = c + 0.2;
      return [z, rg, fs(c), fs(a), { v: f(a * q, 0), cls: a < 0 ? 'warn' : '' }, fs(b), { v: f(b * q, 0), cls: b < 0 ? 'warn' : '' }]; });
    const geo = [
      ['$e = \\min(b;\\,2h)$', f(e) + ' m', e === v.b ? '$e = b$' : '$e = 2h$'],
      ['Tường đầu hồi: A / B / C', f(r1(e / 5)) + ' / ' + f(Math.max(0, r1(e) - r1(e / 5))) + ' / ' + f(Math.max(0, v.d - e)) + ' m', 'A −1,2; B −0,8; C −0,5'],
      ['Mái: F, G sâu $e/10$; H đến $e/2$; F rộng $e/4$', f(e / 10) + '; ' + f(e / 2) + '; ' + f(e / 4) + ' m', ''],
      ['$h/d$ → $c_e$ tường D / E', f(hd, 3), fs(ce[0]) + ' / ' + fs(ce[1])],
      ['Góc dốc $\\alpha$', f(alpha, 1) + '°', flat ? { v: 'Mái bằng (Bảng F.2)', cls: 'pass' } : { v: 'α ≥ 5°: tra Bảng F.5a/F.5b; số liệu mái dưới đây chỉ để tham khảo', cls: 'fail' }],
      ['$q/c = W/c \\times B$' + (fac < 1 ? ' × ½' : ''), f(q, 0) + ' daN/m', v.pos === 'F' && v.B >= e / 4 ? { v: 'Bước khung ≥ e/4: không có khung trong nào nằm trong vùng F', cls: 'warn' } : '']
    ];
    F.out.innerHTML = '';
    const d1 = WC.el('div'), d2 = WC.el('div'); F.out.append(d1, d2);
    WC.table(d1, geo, ['Đại lượng', 'Giá trị', 'Ghi chú']);
    WC.table(d2, rows, ['Vùng', 'Phạm vi (từ mép đón gió)', '$c_e$', '$c_p$ ($c_i$ = +0,2)', '$q$ (daN/m)', '$c_p$ ($c_i$ = −0,2)', '$q$ (daN/m)']);
    draw({ e: e, pos: v.pos });
  }
  upd();
};
