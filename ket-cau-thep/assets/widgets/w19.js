/* W19 – Mặt bích kèo – cột dạng 4E (AISC DG16): đứt bu lông và chảy bản mã Yp (Bài 15.3) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W19'] = function (el) {
  const F = WC.frame(el, { title: 'W19 · Mặt bích 4E: bu lông và chiều dày bản mã',
    tryText: 'tăng gage $g$ từ 120 lên 140 mm: $Y_p$ giảm và $t_{p,req}$ tăng bao nhiêu? Giảm $t_p$ xuống 18 mm, rồi đổi bu lông sang M24 – trạng thái nào không đạt trước?' });
  // Kèo H500×250×8×12 của Ví dụ 15.1 (giữ cố định); A_b lấy tròn như sách
  const d = 500, tf = 12, bf = 250, AB = { 20: 314, 22: 380, 24: 452, 27: 572, 30: 707 };
  const v = { Mu: 420.4, pf: 54, g: 120, bp: 250, tp: 20, Fpy: 345, db: 27, Fnt: 620 };
  WC.slider(F.ctrl, { label: '$M_u$', min: 50, max: 700, step: 0.1, value: v.Mu, unit: 'kNm', onInput: x => { v.Mu = x; upd(); } });
  WC.slider(F.ctrl, { label: '$p_f$ (mép cánh → tâm bu lông)', min: 35, max: 90, step: 1, value: v.pf, unit: 'mm', onInput: x => { v.pf = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Gage $g$', min: 80, max: 180, step: 5, value: v.g, unit: 'mm', onInput: x => { v.g = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Bề rộng bản mã $b_p$', min: 180, max: 320, step: 5, value: v.bp, unit: 'mm', onInput: x => { v.bp = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Dày bản mã $t_p$', min: 10, max: 40, step: 1, value: v.tp, unit: 'mm', onInput: x => { v.tp = x; upd(); } });
  WC.select(F.ctrl, { label: 'Bu lông A325M', options: Object.keys(AB).map(k => [k, 'M' + k + ' ($A_b$ = ' + AB[k] + ' mm²)']), value: '27', onChange: x => { v.db = +x; upd(); } });
  const f1 = x => WC.f(x, 1);
  function draw(h0, h1) {
    const W = 360, Hh = 250, s = 0.36, cx = 150, yT = 30, c = 'var(--acc)';
    const bp = v.bp * s, plH = (d + 2 * v.pf + 60) * s, y0 = yT, yF = y0 + (v.pf + 30) * s; // yF: mặt ngoài cánh kéo
    const yB1 = yF - v.pf * s, yB2 = yF + (tf + v.pf) * s, yC = yF + (d - tf / 2) * s;
    let g = '<rect x="' + (cx - bp / 2) + '" y="' + y0 + '" width="' + bp + '" height="' + plH + '" fill="' + c + '" fill-opacity=".12" stroke="' + c + '"/>' +
      '<rect x="' + (cx - bf * s / 2) + '" y="' + yF + '" width="' + bf * s + '" height="' + tf * s + '" fill="currentColor" fill-opacity=".35"/>' +
      '<rect x="' + (cx - bf * s / 2) + '" y="' + (yF + (d - tf) * s) + '" width="' + bf * s + '" height="' + tf * s + '" fill="currentColor" fill-opacity=".35"/>' +
      '<rect x="' + (cx - 1.5) + '" y="' + (yF + tf * s) + '" width="3" height="' + (d - 2 * tf) * s + '" fill="currentColor" fill-opacity=".35"/>';
    [yB1, yB2].forEach(y => [-1, 1].forEach(k => { g += '<circle cx="' + (cx + k * v.g * s / 2) + '" cy="' + y + '" r="' + Math.max(3, v.db * s / 2) + '" fill="#d1242f"/>'; }));
    g += '<line x1="' + (cx - v.g * s / 2) + '" y1="' + (y0 - 8) + '" x2="' + (cx + v.g * s / 2) + '" y2="' + (y0 - 8) + '" stroke="currentColor"/><text x="' + cx + '" y="' + (y0 - 12) + '" font-size="11" text-anchor="middle" fill="currentColor">g = ' + v.g + '</text>';
    const xa = cx + bp / 2 + 14;
    [[yB1, 'h₀ = ' + f1(h0)], [yB2, 'h₁ = ' + f1(h1)]].forEach(([y, t], i) => {
      const xx = xa + i * 70; g += '<line x1="' + xx + '" y1="' + y + '" x2="' + xx + '" y2="' + yC + '" stroke="currentColor"/><line x1="' + (xx - 4) + '" y1="' + y + '" x2="' + (xx + 4) + '" y2="' + y + '" stroke="currentColor"/>' +
        '<text x="' + (xx + 4) + '" y="' + (y + yC) / 2 + '" font-size="11" fill="currentColor">' + t + '</text>'; });
    g += '<line x1="' + (xa - 4) + '" y1="' + yC + '" x2="' + (xa + 74) + '" y2="' + yC + '" stroke="currentColor" stroke-dasharray="3 2"/><text x="' + (xa + 76) + '" y="' + (yC + 4) + '" font-size="10" fill="currentColor">tâm cánh nén</text>';
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:100%;max-height:280px">' + g + '</svg>';
  }
  function upd() {
    const h0 = d - tf / 2 + v.pf, h1 = d - 1.5 * tf - v.pf, s = 0.5 * Math.sqrt(v.bp * v.g), pfi = Math.min(v.pf, s);
    const Yp = v.bp / 2 * (h1 * (1 / pfi + 1 / s) + h0 / v.pf - 0.5) + 2 / v.g * h1 * (pfi + s);
    const Pt = v.Fnt * AB[v.db] / 1000, phiMnp = 0.75 * 2 * Pt * (h0 + h1) / 1000;
    const tReq = Math.sqrt(v.Mu * 1e6 / (0.9 * v.Fpy * Yp)), tReq2 = Math.sqrt(1.11 * v.Mu * 1e6 / (0.9 * v.Fpy * Yp)), phiMpl = 0.9 * v.Fpy * v.tp * v.tp * Yp / 1e6;
    const r = (a, b) => ({ v: WC.f(a / b, 2) + (a <= b ? ' – Đạt' : ' – Không đạt'), cls: a <= b ? 'pass' : 'fail' });
    WC.table(F.out, [
      ['$h_0$; $h_1$', f1(h0) + '; ' + f1(h1) + ' mm', ''],
      ['$P_t = F_{nt}A_b$', f1(Pt) + ' kN', ''],
      ['Đứt bu lông: $\\phi M_{np} = 0{,}75 \\cdot 2P_t(h_0 + h_1)$', f1(phiMnp) + ' kNm', r(v.Mu, phiMnp)],
      ['$s = \\tfrac12\\sqrt{b_pg}$', f1(s) + ' mm' + (v.pf > s ? ' (lấy $p_{fi} = s$)' : ''), ''],
      ['$Y_p$', WC.f(Yp, 0) + ' mm', ''],
      ['$t_{p,req} = \\sqrt{M_u/(\\phi_bF_{py}Y_p)}$', f1(tReq) + ' mm', r(tReq, v.tp)],
      ['$t_{p,req}$ có hệ số 1,11 (AISC 358)', f1(tReq2) + ' mm', r(tReq2, v.tp)],
      ['Chảy bản mã: $\\phi M_{pl} = 0{,}9F_{py}t_p^2Y_p$', f1(phiMpl) + ' kNm', r(v.Mu, phiMpl)],
      ['$b_p \\le b_f + 25$ mm', v.bp + ' mm', v.bp <= bf + 25 ? { v: 'Đạt', cls: 'pass' } : { v: 'Vượt giới hạn', cls: 'warn' }]
    ], ['Đại lượng', 'Giá trị', 'Kiểm tra']);
    draw(h0, h1);
  }
  upd();
};
