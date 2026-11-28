/* W18 – Giới hạn chuyển vị, độ võng: TCVN 2737:2023 Phụ lục G và AISC DG3, IBC (Bài 14.2) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W18'] = function (el) {
  const F = WC.frame(el, { title: 'W18 · Giới hạn chuyển vị: TCVN 2737:2023 và DG3, IBC',
    tryText: 'với nhà Hòa Bình ($H$ = 7,07 m, $L$ = 50 m), giới hạn DG3 rộng hơn TCVN bao nhiêu lần? Chọn cầu trục điều khiển từ cabin, kéo cao trình ray lên 13 m: giới hạn 50 mm bắt đầu khống chế từ đâu?' });
  const v = { H: 7.07, L: 50, bc: 'ton', ct: 'none', Hr: 6.5 };
  WC.slider(F.ctrl, { label: 'Chiều cao đỉnh cột $H$', min: 4, max: 15, step: 0.01, value: v.H, unit: 'm', onInput: x => { v.H = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Nhịp kèo $L$', min: 12, max: 72, step: 1, value: v.L, unit: 'm', onInput: x => { v.L = x; upd(); } });
  WC.select(F.ctrl, { label: 'Bao che', options: [['ton', 'Tôn (DG3: H/60 – H/100)'], ['gach', 'Tường gạch có cốt thép (DG3: H/100)']], value: v.bc, onChange: x => { v.bc = x; upd(); } });
  WC.select(F.ctrl, { label: 'Cầu trục', options: [['none', 'Không có'], ['cabin', 'Điều khiển từ cabin (H/240 ≤ 50 mm)'], ['pendant', 'Điều khiển dưới nền (H/100)']], value: v.ct, onChange: x => { v.ct = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Cao trình ray $H_r$', min: 3, max: 14, step: 0.1, value: v.Hr, unit: 'm', onInput: x => { v.Hr = x; upd(); } });
  const f1 = x => WC.f(x, 1);
  function draw(H, Hr) {
    const W = 360, Hh = 230, x1 = 60, x2 = 300, yb = 200, s = 150 / Math.max(H, 4), yt = yb - H * s, dx = 22, ridge = yt - 28, c = 'var(--acc)';
    let g = '<line x1="30" y1="' + yb + '" x2="330" y2="' + yb + '" stroke="currentColor"/>' +
      '<polyline points="' + x1 + ',' + yb + ' ' + x1 + ',' + yt + ' ' + (x1 + x2) / 2 + ',' + ridge + ' ' + x2 + ',' + yt + ' ' + x2 + ',' + yb + '" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 3"/>' +
      '<polyline points="' + x1 + ',' + yb + ' ' + (x1 + dx) + ',' + yt + ' ' + ((x1 + x2) / 2 + dx) + ',' + (ridge + 6) + ' ' + (x2 + dx) + ',' + yt + ' ' + x2 + ',' + yb + '" fill="none" stroke="' + c + '" stroke-width="2.5"/>' +
      '<line x1="' + x1 + '" y1="' + (yt - 14) + '" x2="' + (x1 + dx) + '" y2="' + (yt - 14) + '" stroke="' + c + '" marker-end="url(#w18a)"/>' +
      '<text x="' + (x1 + dx + 4) + '" y="' + (yt - 10) + '" font-size="12" fill="currentColor">Δ</text>' +
      '<line x1="22" y1="' + yb + '" x2="22" y2="' + yt + '" stroke="currentColor"/><text x="8" y="' + (yb + yt) / 2 + '" font-size="12" fill="currentColor">H</text>' +
      '<text x="' + (x1 + x2) / 2 + '" y="' + (yb + 18) + '" font-size="12" text-anchor="middle" fill="currentColor">L = ' + f1(v.L) + ' m</text>';
    if (v.ct !== 'none') { const yr = yb - Math.min(Hr, H) * s;
      g += '<line x1="' + x1 + '" y1="' + yr + '" x2="' + x2 + '" y2="' + yr + '" stroke="#d1242f" stroke-dasharray="6 3"/><text x="' + (x2 - 4) + '" y="' + (yr - 4) + '" font-size="11" text-anchor="end" fill="#d1242f">ray, H_r = ' + f1(Hr) + ' m</text>'; }
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:100%;max-height:260px"><defs><marker id="w18a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="' + c + '"/></marker></defs>' + g + '</svg>';
  }
  function upd() {
    const H = v.H * 1000, L = v.L * 1000, Hr = v.Hr * 1000;
    const tc = Math.min(1.3 * H / 300, H / 150), lo = v.bc === 'ton' ? H / 100 : H / 100, hi = v.bc === 'ton' ? H / 60 : H / 100;
    const rows = [
      ['Chuyển vị ngang đỉnh cột', 'TCVN: $\\min(1{,}3h_s/300;\\ h_s/150)$', { v: f1(tc) + ' mm', cls: 'warn' }],
      ['', v.bc === 'ton' ? 'DG3: $H/100$ … $H/60$ (gió 10 năm)' : 'DG3: $H/100$ (gió 10 năm)', v.bc === 'ton' ? f1(lo) + ' … ' + f1(hi) + ' mm' : f1(lo) + ' mm'],
      ['', 'DG3 / TCVN', v.bc === 'ton' ? WC.f(lo / tc, 2) + ' … ' + WC.f(hi / tc, 2) + ' lần' : WC.f(lo / tc, 2) + ' lần'],
      ['Võng kèo', 'TCVN: $L/300$', { v: f1(L / 300) + ' mm', cls: 'warn' }],
      ['', 'IBC: $L/180$ ($L_r$); $L/120$ (D + $L_r$)', f1(L / 180) + ' mm; ' + f1(L / 120) + ' mm']];
    if (v.ct === 'cabin') { const a = Hr / 240; rows.push(['Tại cao trình ray', 'DG3: $H_r/240 \\le 50$ mm', { v: f1(Math.min(a, 50)) + ' mm' + (a > 50 ? ' (50 mm khống chế)' : ''), cls: a > 50 ? 'warn' : '' }]); }
    if (v.ct === 'pendant') rows.push(['Tại cao trình ray', 'DG3: $H_r/100$', f1(Hr / 100) + ' mm']);
    WC.table(F.out, rows, ['Hạng mục', 'Tiêu chuẩn', 'Giới hạn']);
    draw(v.H, v.Hr);
  }
  upd();
};
