/* W11 – Quy đổi áp lực gió W0 (QCVN 02:2022) sang vận tốc gió cơ sở V của ASCE 7-10 (Bài 9.2) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W11'] = function (el) {
  const F = WC.frame(el, { title: 'W11 · Quy đổi $W_0$ → $V_{20}$ → $V_{50}$ → $V_{700}$',
    tryText: 'chọn lần lượt vùng I đến V và đối chiếu với Bảng 9.2. Với vùng II, $V_{700}$ lớn hơn $V_{20}$ bao nhiêu phần trăm? Áp lực vận tốc tăng theo tỷ lệ nào?' });
  const ZONES = [['I', 65], ['II', 95], ['III', 125], ['IV', 155], ['V', 185]];
  let W0 = 95, Ks = 0.91;
  const out1 = WC.el('div'), out2 = WC.el('div');
  F.out.append(out1, out2);
  WC.select(F.ctrl, { label: 'Vùng gió (QCVN 02)', options: ZONES.map(z => [z[1], 'Vùng ' + z[0] + ' – ' + z[1] + ' daN/m²']).concat([['x', 'Tự nhập']]), value: 95,
    onChange: v => { if (v !== 'x') { W0 = +v; sW.set(W0); upd(); } } });
  const sW = WC.slider(F.ctrl, { label: '$W_0$', min: 40, max: 220, step: 1, value: W0, unit: 'daN/m²', onInput: v => { W0 = v; upd(); } });
  WC.slider(F.ctrl, { label: '$K_{s,20}$ (Bảng 5.2)', min: 0.85, max: 0.95, step: 0.01, value: Ks, unit: '', onInput: v => { Ks = v; upd(); } });
  const calc = w => { const v20 = Math.sqrt(w / 0.0613), v50 = v20 / Ks; return { v20, v50, v700: 1.26 * v50 }; };
  function draw(r) {
    const W = 340, H = 170, x0 = 70, sc = (W - x0 - 20) / 90, bars = [['V₂₀', r.v20, '#8c959f'], ['V₅₀', r.v50, '#e16f24'], ['V₇₀₀', r.v700, '#1f6feb']];
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:220px" font-family="sans-serif" font-size="12">';
    for (let t = 0; t <= 90; t += 15) s += '<line x1="' + (x0 + t * sc) + '" y1="18" x2="' + (x0 + t * sc) + '" y2="140" stroke="currentColor" stroke-opacity=".15"/>' +
      '<text x="' + (x0 + t * sc) + '" y="156" text-anchor="middle" fill="currentColor">' + t + '</text>';
    bars.forEach((b, i) => { const y = 26 + i * 38;
      s += '<rect x="' + x0 + '" y="' + y + '" width="' + (b[1] * sc) + '" height="24" fill="' + b[2] + '" fill-opacity=".8"/>' +
        '<text x="' + (x0 - 8) + '" y="' + (y + 16) + '" text-anchor="end" fill="currentColor">' + b[0] + '</text>' +
        '<text x="' + (x0 + b[1] * sc + 4) + '" y="' + (y + 16) + '" fill="currentColor">' + WC.f(b[1], 2) + '</text>'; });
    s += '<text x="' + (W - 20) + '" y="168" text-anchor="end" fill="currentColor">m/s</text></svg>';
    F.view.innerHTML = s;
  }
  function upd() {
    const r = calc(W0);
    WC.table(out1, [
      ['Bước 1: $V_{20} = \\sqrt{W_0/0{,}0613}$', WC.f(r.v20, 2) + ' m/s', 'gió giật 3 s, 20 năm, 10 m, địa hình B (QCVN)'],
      ['Bước 2: $V_{50} = V_{20}/K_{s,20}$', WC.f(r.v50, 2) + ' m/s', 'hệ số ' + WC.f(1 / Ks, 3) + '; ASCE C26.5-4 cho $V_{20}/V_{50}$ = 0,908'],
      ['Bước 3: $V = V_{700} = 1{,}26\\,V_{50}$', '<b>' + WC.f(r.v700, 2) + ' m/s</b>', WC.f(r.v700 / 0.44704, 0) + ' mph; $1{,}26 \\approx \\sqrt{1{,}6}$'],
      ['$V_{700}/V_{20}$', WC.f(r.v700 / r.v20, 3), 'áp lực vận tốc tăng ' + WC.f((r.v700 / r.v20) ** 2, 2) + ' lần'],
      ['$0{,}0613\\,V_{700}^2$', WC.f(0.0613 * r.v700 ** 2, 1) + ' daN/m²', 'chưa nhân $K_z K_{zt} K_d$']
    ], ['Bước', 'Kết quả', 'Ghi chú']);
    WC.table(out2, ZONES.map(z => { const q = calc(z[1]); const cur = Math.abs(z[1] - W0) < 1e-9;
      return [cur ? '<b>' + z[0] + '</b>' : z[0], z[1], WC.f(q.v20, 2), WC.f(q.v50, 2), cur ? { v: '<b>' + WC.f(q.v700, 2) + '</b>', cls: 'pass' } : WC.f(q.v700, 2)]; }),
      ['Vùng', '$W_0$ (daN/m²)', '$V_{20}$ (m/s)', '$V_{50}$ (m/s)', '$V_{700}$ (m/s)']);
    draw(r);
  }
  upd();
};
