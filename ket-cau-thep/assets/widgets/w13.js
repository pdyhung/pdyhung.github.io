/* W13 – Hệ số GCpf (ASCE 7-10 Hình 28.4-1) theo góc mái, ±GCpi → tải gió daN/m lên khung (Bài 9.4) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W13'] = function (el) {
  const F = WC.frame(el, { title: 'W13 · $GC_{pf}$ theo góc mái và tải gió lên khung (gió ngang nhà)',
    tryText: 'tăng góc mái từ 5,71° lên 30°: hệ số vùng 2 (mái đón gió) đổi dấu ở khoảng bao nhiêu độ? Đổi sang nhà kín một phần ($\\pm0{,}55$): tải hút lên mái đón gió tăng bao nhiêu?' });
  // Bảng 9.4: vùng 1, 2, 3, 4, 1E, 2E, 3E, 4E tại θ = 5°, 20°, 30°
  const R5 = [0.40, -0.69, -0.37, -0.29, 0.61, -1.07, -0.53, -0.43], R20 = [0.53, -0.69, -0.48, -0.43, 0.80, -1.07, -0.69, -0.64], R30 = [0.56, 0.21, -0.43, -0.37, 0.69, 0.27, -0.53, -0.48];
  const G = (t, i) => t <= 5 ? R5[i] : t <= 20 ? R5[i] + (R20[i] - R5[i]) * (t - 5) / 15 : t <= 30 ? R20[i] + (R30[i] - R20[i]) * (t - 20) / 10 : R30[i];
  const NAME = ['1 – tường đón gió', '2 – mái đón gió', '3 – mái khuất gió', '4 – tường khuất gió'];
  let th = 5.71, gpi = 0.18, qh = 112.1, s = 12, edge = false, show = 1;
  WC.slider(F.ctrl, { label: 'Góc mái $\\theta$', min: 0, max: 45, step: 0.01, value: th, unit: '°', onInput: v => { th = v; upd(); } });
  WC.select(F.ctrl, { label: 'Mức độ kín ($GC_{pi}$)', options: [['0.18', 'Nhà kín ±0,18'], ['0.55', 'Kín một phần ±0,55'], ['0', 'Nhà hở 0']], value: '0.18', onChange: v => { gpi = +v; upd(); } });
  WC.slider(F.ctrl, { label: '$q_h$', min: 40, max: 250, step: 0.1, value: qh, unit: 'daN/m²', onInput: v => { qh = v; upd(); } });
  WC.slider(F.ctrl, { label: 'Bước khung', min: 3, max: 15, step: 0.5, value: s, unit: 'm', onInput: v => { s = v; upd(); } });
  WC.check(F.ctrl, { label: ' Khung trong vùng biên $2a$ (1E–4E)', checked: false, onChange: c => { edge = c; upd(); } });
  WC.select(F.ctrl, { label: 'Hình vẽ', options: [['1', 'W1 (+GCpi)'], ['-1', 'W2 (−GCpi)']], value: '1', onChange: v => { show = +v; upd(); } });
  function draw(qs) {
    const W = 380, H = 240, xl = 80, xr = 300, yb = 205, yt = 120, xm = (xl + xr) / 2, rise = Math.min(110 * Math.tan(th * Math.PI / 180), 85), yr = yt - rise;
    const sc = 55 / Math.max(1, ...qs.map(Math.abs));
    const L1 = Math.hypot(xm - xl, rise) || 1;
    // [p1, p2, pháp tuyến hướng vào bề mặt]
    const surf = [[[xl, yb], [xl, yt], [1, 0]], [[xl, yt], [xm, yr], [rise / L1, (xm - xl) / L1]], [[xm, yr], [xr, yt], [-rise / L1, (xm - xl) / L1]], [[xr, yt], [xr, yb], [-1, 0]]];
    let o = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:300px" font-family="sans-serif" font-size="12">' +
      '<defs><marker id="w13a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker></defs>' +
      '<line x1="40" y1="' + yb + '" x2="340" y2="' + yb + '" stroke="currentColor" stroke-opacity=".4"/>' +
      '<polyline points="' + xl + ',' + yb + ' ' + xl + ',' + yt + ' ' + xm + ',' + yr + ' ' + xr + ',' + yt + ' ' + xr + ',' + yb + '" fill="none" stroke="currentColor" stroke-width="3"/>' +
      '<text x="12" y="30" fill="currentColor">Gió →</text>';
    surf.forEach((sf, i) => { const [a, b, n] = sf, p = qs[i], len = Math.abs(p) * sc, col = p >= 0 ? '#d1242f' : '#1f6feb';
      for (let k = 1; k <= 3; k++) { const t = k / 4, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
        const x0 = p >= 0 ? x - n[0] * len : x, y0 = p >= 0 ? y - n[1] * len : y, x1 = p >= 0 ? x : x - n[0] * len, y1 = p >= 0 ? y : y - n[1] * len;
        if (len > 2) o += '<line x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" stroke="' + col + '" stroke-width="2" marker-end="url(#w13a)"/>'; }
      const mx = (a[0] + b[0]) / 2 - n[0] * (len + 16), my = (a[1] + b[1]) / 2 - n[1] * (len + 12);
      o += '<text x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '" text-anchor="middle" fill="' + col + '">' + (i + 1) + (edge ? 'E' : '') + ': ' + WC.f(p, 0) + '</text>'; });
    o += '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" fill="currentColor">daN/m · đỏ: đẩy vào, xanh: hút ra · ' + (show > 0 ? '+' : '−') + 'GCpi</text></svg>';
    F.view.innerHTML = o;
  }
  function upd() {
    const t = Math.min(th, 45), rows = [], qs = [];
    for (let i = 0; i < 4; i++) { const g = G(t, i + (edge ? 4 : 0)), pp = qh * (g - gpi), pm = qh * (g + gpi);
      rows.push([NAME[i].replace(/^\d/, d => d + (edge ? 'E' : '')), WC.f(g, 3), WC.f(pp, 1), WC.f(pp * s, 0), WC.f(pm, 1), WC.f(pm * s, 0)]);
      qs.push((show > 0 ? pp : pm) * s); }
    WC.table(F.out, rows, ['Vùng', '$GC_{pf}$', '$+GC_{pi}$: $p$ (daN/m²)', '$q$ (daN/m)', '$-GC_{pi}$: $p$ (daN/m²)', '$q$ (daN/m)']);
    F.out.insertAdjacentHTML('beforeend', '<p style="font-size:.9em;margin:.4em 0 0">$p = q_h[(GC_{pf}) - (GC_{pi})]$; $q = p \\times$ bước khung. Góc ' + WC.f(t, 2) + '°' +
      (t > 5 && t < 30 ? ' – nội suy tuyến tính Bảng 9.4.' : ' – dùng hàng hằng số của Bảng 9.4.') + '</p>');
    if (window.renderMathInElement) renderMathInElement(F.out, window.KATEX_OPTS);
    draw(qs);
  }
  upd();
};
