/* W8 – Ổn định tổng thể cánh nén cột C1 ngoài mặt phẳng khung (TCVN 5575:2024, 8.4.4b, công thức 72, Phụ lục F) – Bài 6.4 */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W8'] = function (el) {
  const F = WC.frame(el, { title: 'W8 · Cột C1: khoảng cách giữ cánh nén $L_{ef}$, $\\bar\\lambda_b$ và $\\varphi_b$',
    tryText: 'với $L_{ef} = 5{,}0$ m, $\\bar\\lambda_b = 0{,}824 > 0{,}693$ nên chưa được miễn. Giảm $L_{ef}$ tới khi ô kết luận chuyển sang "Được miễn" (khoảng 4,2 m). Đổi $\\gamma_m$ sang 1,10: ngưỡng $L_{ef}$ có thay đổi không? Vì sao?' });
  const E = 206000, b = 200, t = 10, h = 640, tw = 6, hw = 630, W = 1645.1e3;
  let Lef = 5.0, gm = 1.05, M = 278.08, gc = 1.0;
  const Iy = 2 * t * b * b * b / 12 + hw * tw * tw * tw / 12, Ix = tw * hw * hw * hw / 12 + 2 * b * t * (h / 2) * (h / 2);
  WC.select(F.ctrl, { label: '$\\gamma_m$', options: [['1.05', '1,05 (bảng tính của khóa)'], ['1.10', '1,10 (S235 – thép tiêu chuẩn nước ngoài)']], value: '1.05', onChange: x => { gm = +x; upd(); } });
  WC.slider(F.ctrl, { label: '$L_{ef}$', min: 1, max: 8, step: 0.1, value: Lef, unit: 'm', onInput: x => { Lef = x; upd(); } });
  WC.slider(F.ctrl, { label: '$M_x$', min: 50, max: 400, step: 0.01, value: M, unit: 'kNm', onInput: x => { M = x; upd(); } });
  function calc(L) {
    const fyd = 235 / gm, sig = M * 1e6 / (W * gc), bt = b / t;
    const lub0 = 0.41 + 0.0032 * bt + (0.73 - 0.016 * bt) * b / h;           // (72)
    const kf = Math.sqrt(fyd / sig), lub = lub0 * kf;                         // chú thích 3 Bảng 12
    const lbb = L * 1000 / b * Math.sqrt(fyd / E);
    const Lmax = lub * b / Math.sqrt(fyd / E) / 1000;
    // Phụ lục F (I hàn đối xứng kép, ≥ 2 điểm giữ chia đều): α, ψ = 2,25 + 0,07α, φ1, φb
    const al = 8 * Math.pow(L * 1000 * t / (h * b), 2) * (1 + 0.5 * h * tw * tw * tw / (b * t * t * t));
    const psi = 2.25 + 0.07 * al;
    const p1 = psi * Iy / Ix * Math.pow(h / (L * 1000), 2) * E / fyd;
    const pb = Math.min(1, p1 <= 0.85 ? p1 : 0.68 + 0.21 * p1);
    return { fyd, sig, lub0, kf, lub, lbb, Lmax, al, psi, p1, pb, r: M * 1e6 / (pb * W * fyd * gc) };
  }
  function draw(c) {
    const X0 = 40, X1 = 330, Y0 = 200, Y1 = 20, xm = 8, ym = 1.4;
    const X = x => X0 + (X1 - X0) * x / xm, Y = y => Y0 - (Y0 - Y1) * y / ym;
    const k = Math.sqrt(c.fyd / E) * 1000 / b;   // λ̄b = k·Lef
    let g = '<svg viewBox="0 0 350 235" style="width:100%;max-height:280px" font-family="sans-serif" font-size="11">';
    g += '<g stroke="currentColor" stroke-opacity=".5"><line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X1 + '" y2="' + Y0 + '"/><line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="' + Y1 + '"/></g>';
    for (let i = 0; i <= 8; i++) g += '<text x="' + X(i) + '" y="' + (Y0 + 14) + '" text-anchor="middle" fill="currentColor">' + i + '</text>';
    for (let j = 0; j <= 1.4001; j += 0.2) g += '<text x="' + (X0 - 4) + '" y="' + (Y(j) + 4) + '" text-anchor="end" fill="currentColor">' + WC.f(j, 1) + '</text>';
    g += '<text x="' + X1 + '" y="' + (Y0 + 28) + '" text-anchor="end" fill="currentColor">L_ef (m)</text>';
    g += '<rect x="' + X0 + '" y="' + Y(c.lub) + '" width="' + (X(Math.min(c.Lmax, xm)) - X0) + '" height="' + (Y0 - Y(c.lub)) + '" fill="#2da44e" fill-opacity=".15"/>';
    g += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(xm) + '" y2="' + Y(k * xm) + '" stroke="var(--acc)" stroke-width="2.5"/>';
    g += '<line x1="' + X0 + '" y1="' + Y(c.lub) + '" x2="' + X1 + '" y2="' + Y(c.lub) + '" stroke="#d1242f" stroke-dasharray="5 4"/>';
    g += '<text x="' + (X1 - 2) + '" y="' + (Y(c.lub) - 5) + '" text-anchor="end" fill="#d1242f">λ̄ub = ' + WC.f(c.lub, 3) + '</text>';
    if (c.Lmax <= xm) g += '<line x1="' + X(c.Lmax) + '" y1="' + Y0 + '" x2="' + X(c.Lmax) + '" y2="' + Y(c.lub) + '" stroke="#2da44e" stroke-dasharray="3 3"/><text x="' + X(c.Lmax) + '" y="' + (Y0 - 4) + '" text-anchor="middle" fill="#2da44e">' + WC.f(c.Lmax, 2) + ' m</text>';
    g += '<circle cx="' + X(Lef) + '" cy="' + Y(c.lbb) + '" r="5" fill="' + (c.lbb <= c.lub ? '#2da44e' : '#d1242f') + '"/>';
    g += '<text x="' + (X0 + 6) + '" y="' + (Y1 + 4) + '" fill="currentColor">λ̄b = (L_ef/b)·√(f_yd/E)</text></svg>';
    F.view.innerHTML = g;
  }
  function upd() {
    const c = calc(Lef), ok = c.lbb <= c.lub;
    WC.table(F.out, [
      ['$f_{yd}$; $\\sigma = M/(W_c\\gamma_c)$', WC.f(c.fyd, 1) + ' MPa; ' + WC.f(c.sig, 1) + ' MPa'],
      ['$\\bar\\lambda_{ub}$ theo (72), $b/t = 20$, $b/h = 200/640$', WC.f(c.lub0, 3)],
      ['$\\bar\\lambda_{ub}\\sqrt{f_{yd}/\\sigma}$', WC.f(c.lub0, 3) + ' × ' + WC.f(c.kf, 3) + ' = <b>' + WC.f(c.lub, 3) + '</b>'],
      ['$\\bar\\lambda_b = (L_{ef}/b)\\sqrt{f_{yd}/E}$', '<b>' + WC.f(c.lbb, 3) + '</b>'],
      ['Miễn kiểm tra ổn định tổng thể (8.4.4b)', ok ? { v: 'Được miễn: ' + WC.f(c.lbb, 3) + ' ≤ ' + WC.f(c.lub, 3), cls: 'pass' } : { v: 'Chưa được miễn: ' + WC.f(c.lbb, 3) + ' > ' + WC.f(c.lub, 3), cls: 'fail' }],
      ['Ngưỡng $L_{ef,\\max}$ để được miễn', WC.f(c.Lmax, 2) + ' m'],
      ['Phụ lục F: $\\alpha$; $\\psi = 2{,}25 + 0{,}07\\alpha$', WC.f(c.al, 3) + '; ' + WC.f(c.psi, 3)],
      ['$\\varphi_1$ → $\\varphi_b$', WC.f(c.p1, 3) + ' → <b>' + WC.f(c.pb, 3) + '</b>'],
      ['$M_x/(\\varphi_b W_c f_{yd}\\gamma_c)$ (68)', ok ? { v: 'không cần (được miễn)', cls: 'pass' } : { v: WC.f(c.r, 3), cls: c.r <= 1 ? 'warn' : 'fail' }]
    ]);
    draw(c);
  }
  upd();
};
