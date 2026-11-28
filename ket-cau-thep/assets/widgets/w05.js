/* W5 – Áp lực gió TCVN 2737:2023: W0 → W3s,10 → k(ze) → Gf → W (Bài 4.3) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W5'] = function (el) {
  const F = WC.frame(el, { title: 'W5 · Áp lực gió theo TCVN 2737:2023',
    tryText: 'giữ $z_e = 8{,}82$ m, đổi địa hình B sang C rồi sang A: $W/c$ thay đổi bao nhiêu phần trăm? Chọn vùng III và cấp hậu quả C3, đọc lại tải trên khung.' });
  const W0S = { I: 65, II: 95, III: 125, IV: 155, V: 185 };
  const Z = [5, 10, 15, 20, 30];
  const K = { A: [1.05, 1.18, 1.27, 1.33, 1.43], B: [0.87, 1.00, 1.09, 1.16, 1.26], C: [0.59, 0.72, 0.81, 0.88, 0.98] };
  const GN = { C1: 0.87, C2: 1.00, C3: 1.15 };
  const v = { W0: 95, ter: 'B', z: 8.82, Gf: 0.85, cc: 'C2', B: 8 };
  function kz(t, z) {
    z = Math.min(30, Math.max(5, z));
    for (let i = 0; i < Z.length - 1; i++) if (z <= Z[i + 1]) return K[t][i] + (K[t][i + 1] - K[t][i]) * (z - Z[i]) / (Z[i + 1] - Z[i]);
    return K[t][Z.length - 1];
  }
  let sW0;
  WC.select(F.ctrl, { label: 'Vùng gió (QCVN 02:2022)', value: 'II',
    options: Object.keys(W0S).map(k => [k, 'Vùng ' + k + ' – ' + W0S[k] + ' daN/m²']),
    onChange: k => { v.W0 = W0S[k]; sW0.set(v.W0); upd(); } });
  sW0 = WC.slider(F.ctrl, { label: '$W_0$', min: 40, max: 200, step: 1, value: v.W0, unit: 'daN/m²', onInput: x => { v.W0 = x; upd(); } });
  WC.select(F.ctrl, { label: 'Địa hình', value: 'B', options: [['A', 'A – trống trải'], ['B', 'B – tương đối trống trải'], ['C', 'C – bị che chắn mạnh']],
    onChange: t => { v.ter = t; upd(); } });
  WC.slider(F.ctrl, { label: 'Độ cao tương đương $z_e$', min: 5, max: 30, step: 0.01, value: v.z, unit: 'm', onInput: x => { v.z = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Hệ số giật $G_f$', min: 0.85, max: 1.3, step: 0.01, value: v.Gf, unit: '', onInput: x => { v.Gf = x; upd(); } });
  WC.select(F.ctrl, { label: 'Cấp hậu quả', value: 'C2', options: [['C1', 'C1 – γn = 0,87'], ['C2', 'C2 – γn = 1,00'], ['C3', 'C3 – γn = 1,15']],
    onChange: c => { v.cc = c; upd(); } });
  WC.slider(F.ctrl, { label: 'Bước khung $B$', min: 3, max: 12, step: 0.5, value: v.B, unit: 'm', onInput: x => { v.B = x; upd(); } });

  function draw(k) {
    const W = 320, H = 240, x0 = 44, y0 = 206, sx = (W - x0 - 14) / 1.0, sy = (y0 - 18) / 30;
    const X = kk => x0 + (kk - 0.5) * sx, Y = z => y0 - z * sy;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:270px" font-family="sans-serif" font-size="11">';
    s += '<g stroke="currentColor" stroke-opacity=".25">';
    [0, 5, 10, 15, 20, 25, 30].forEach(z => { s += '<line x1="' + x0 + '" y1="' + Y(z) + '" x2="' + (W - 14) + '" y2="' + Y(z) + '"/>'; });
    [0.5, 0.75, 1.0, 1.25, 1.5].forEach(q => { s += '<line x1="' + X(q) + '" y1="' + Y(0) + '" x2="' + X(q) + '" y2="' + Y(30) + '"/>'; });
    s += '</g><g fill="currentColor">';
    [0, 10, 20, 30].forEach(z => { s += '<text x="' + (x0 - 6) + '" y="' + (Y(z) + 4) + '" text-anchor="end">' + z + '</text>'; });
    [0.5, 0.75, 1.0, 1.25, 1.5].forEach(q => { s += '<text x="' + X(q) + '" y="' + (y0 + 14) + '" text-anchor="middle">' + WC.f(q, 2) + '</text>'; });
    s += '<text x="' + (x0 - 30) + '" y="' + (Y(30) - 4) + '">z (m)</text><text x="' + (W - 14) + '" y="' + (y0 + 28) + '" text-anchor="end">k(z)</text></g>';
    ['A', 'B', 'C'].forEach(t => {
      const on = t === v.ter, pts = Z.map((z, i) => X(K[t][i]) + ',' + Y(z)).join(' ');
      s += '<polyline points="' + pts + '" fill="none" stroke="' + (on ? 'var(--acc)' : 'currentColor') + '" stroke-opacity="' + (on ? 1 : 0.4) + '" stroke-width="' + (on ? 2.5 : 1.2) + '"/>';
      s += '<text x="' + (X(K[t][4]) + 4) + '" y="' + (Y(30) + 12) + '" fill="currentColor" fill-opacity="' + (on ? 1 : 0.6) + '">' + t + '</text>';
    });
    const zc = Math.min(30, Math.max(5, v.z));
    s += '<line x1="' + x0 + '" y1="' + Y(zc) + '" x2="' + X(k) + '" y2="' + Y(zc) + '" stroke="#d33" stroke-dasharray="4 3"/>';
    s += '<circle cx="' + X(k) + '" cy="' + Y(zc) + '" r="5" fill="#d33"/>';
    s += '<text x="' + (X(k) + 8) + '" y="' + (Y(zc) - 6) + '" fill="#d33">k = ' + WC.f(k, 3) + '</text></svg>';
    F.view.innerHTML = s;
  }
  function upd() {
    const w3 = 0.852 * v.W0, k = kz(v.ter, v.z), wk = w3 * k * v.Gf, gn = GN[v.cc], W = gn * 2.1 * wk, q = W * v.B;
    WC.table(F.out, [
      ['$W_{3s,10} = 0{,}852\\,W_0$', WC.f(w3, 2), 'daN/m²'],
      ['$k(z_e)$ – Bảng 9, địa hình ' + v.ter, WC.f(k, 3), ''],
      ['$W_k/c = W_{3s,10}\\,k\\,G_f$', WC.f(wk, 1), 'daN/m²'],
      ['$W/c = \\gamma_n \\times 2{,}1 \\times W_k/c$ ($\\gamma_n$ = ' + WC.f(gn, 2) + ')', { v: WC.f(W, 1), cls: 'pass' }, 'daN/m²'],
      ['$q/c = W/c \\times B$ (khung giữa)', { v: WC.f(q, 0), cls: 'pass' }, 'daN/m'],
      ['Nếu dùng hệ số 1,2 (TCVN 1995)', { v: WC.f(1.2 * wk, 1) + ' (thiếu ' + WC.f((1 - 1.2 / (2.1 * gn)) * 100, 0) + ' %)', cls: 'warn' }, 'daN/m²']
    ], ['Bước', 'Giá trị', 'Đơn vị']);
    draw(k);
  }
  upd();
};
