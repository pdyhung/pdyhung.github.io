/* W14 – P-Δ và Direct Analysis cho khung cổng hai cột (Bài 11.2).
   Mô hình: hai cột ngàm chân, nối đỉnh bằng kèo cứng tuyệt đối (như Ví dụ Chương 14: Δ = PH³/6EI).
   DM: EI* = 0,8τb·EI; Ni = 0,002α·ΣY; phân tích ở mức α×tải; Δ2 = V/(K* − αΣP/H); M chân cột chia α. */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W14'] = function (el) {
  const F = WC.frame(el, { title: 'W14 · P-Δ và Direct Analysis của khung cổng',
    tryText: 'mặc định là cột nhà mái nhẹ ($P_r$ = 79,85 kN): $M_2$ chỉ lớn hơn $M_1$ vài phần trăm. Tăng $P_r$ dần tới 1400 kN: từ khoảng bao nhiêu kN thì $\\tau_b < 1$, và $\\Delta_2/\\Delta_1$ vượt 1,5 rồi 1,7? Giữ $P_r$ = 800 kN và chuyển sang ASD: vì sao khuếch đại lớn hơn?' });
  const E = 200000;
  const v = { a: 1, H: 7, I: 42919, Hw: 20, P: 79.85, A: 7780, Fy: 235 };
  WC.select(F.ctrl, { label: 'Phương pháp', options: [['1', 'LRFD (α = 1,0)'], ['1.6', 'ASD (α = 1,6)']], value: '1',
    onChange: x => { v.a = +x; upd(); } });
  [['H', 'Chiều cao cột $H$', 4, 15, 0.01, 'm'], ['I', '$I_x$ một cột', 5000, 200000, 1, '×10⁴ mm⁴'],
   ['Hw', 'Tải ngang tổng $W$', 0, 100, 0.5, 'kN'], ['P', 'Lực dọc mỗi cột $P_r$', 0, 2000, 0.05, 'kN'],
   ['A', 'Diện tích cột $A$', 2000, 30000, 10, 'mm²'], ['Fy', '$F_y$', 235, 450, 5, 'MPa']].forEach(([k, l, a, b, st, u]) =>
    WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } }));

  function calc() {
    const a = v.a, H = v.H * 1000, I = v.I * 1e4, Py = v.Fy * v.A / 1000, rr = a * v.P / Py;
    const tb = rr <= 0.5 ? 1 : Math.max(0, 4 * rr * (1 - rr));
    const Kn = 6 * E * I / Math.pow(H, 3) / 1000;          // kN/mm, hai cột
    const Kd = 0.8 * tb * Kn, Y = 2 * v.P, Ni = 0.002 * a * Y, kg = a * Y / H;  // kg: độ cứng hình học αΣP/H
    const Va = a * v.Hw + Ni;                                // lực ngang ở mức α×tải
    const D1 = v.Hw / Kn;                                    // bậc nhất, EI danh nghĩa, không Ni
    const D1d = Va / Kd / a;                                 // bậc nhất, mô hình DM
    const st = Kd - kg > 0;
    const B2 = st ? 1 / (1 - kg / Kd) : Infinity;
    const D2 = st ? Va / (Kd - kg) / a : Infinity;
    const M1 = v.Hw * H / 2 / 1000;                          // kNm, mỗi cột
    const M2 = st ? Va * H / 2 / 1000 * B2 / a : Infinity;
    return { Py, rr, tb, Kn, Kd, Ni, D1, D1d, D2, B2, M1, M2, st };
  }
  function draw(r) {
    const W = 320, Hh = 230, x0 = 70, x1 = 250, yb = 200, yt = 60;
    const d = r.st ? Math.min(45, 6 + 1.2 * r.D2) : 45;
    const col = x => 'M' + x + ' ' + yb + ' C' + x + ' ' + (yb - 60) + ' ' + (x + d * 0.4) + ' ' + (yt + 30) + ' ' + (x + d) + ' ' + yt;
    const acc = 'var(--acc)';
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:100%;max-height:260px" font-family="sans-serif" font-size="12">' +
      '<defs><marker id="w14a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>' +
      '<g stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 3" fill="none"><path d="M' + x0 + ' ' + yb + 'V' + yt + 'H' + x1 + 'V' + yb + '"/></g>' +
      '<g stroke="' + acc + '" stroke-width="3" fill="none"><path d="' + col(x0) + '"/><path d="' + col(x1) + '"/><path d="M' + (x0 + d) + ' ' + yt + 'H' + (x1 + d) + '"/></g>' +
      '<g stroke="currentColor" stroke-width="2"><path d="M' + (x0 - 14) + ' ' + yb + 'h28M' + (x1 - 14) + ' ' + yb + 'h28"/></g>' +
      '<g stroke="currentColor" stroke-width="1.5" marker-end="url(#w14a)"><path d="M' + (x0 + d - 55) + ' ' + yt + 'h48"/>' +
      '<path d="M' + (x0 + d) + ' ' + (yt - 40) + 'v34"/><path d="M' + (x1 + d) + ' ' + (yt - 40) + 'v34"/></g>' +
      '<g fill="currentColor"><text x="' + (x0 + d - 62) + '" y="' + (yt - 6) + '">W + Nᵢ</text>' +
      '<text x="' + (x0 + d + 4) + '" y="' + (yt - 30) + '">P</text><text x="' + (x1 + d + 4) + '" y="' + (yt - 30) + '">P</text>' +
      '<text x="' + (x1 + d + 6) + '" y="' + (yt + 18) + '">Δ₂ = ' + (r.st ? WC.f(r.D2, 1) + ' mm' : '∞') + '</text>' +
      '<text x="' + (x0 + 6) + '" y="' + (yb - 70) + '">0,8τb·EI</text>' +
      '<text x="' + (x0 - 30) + '" y="' + (yb + 22) + '">M₂ = ' + (r.st ? WC.f(r.M2, 1) + ' kNm' : '∞') + '</text></g></svg>';
  }
  function upd() {
    const r = calc(), f = (x, n) => WC.f(x, n), lim = r.B2;
    const rows = [
      ['$P_y = F_yA$', f(r.Py, 1) + ' kN'],
      ['$\\alpha P_r/P_y$', f(r.rr, 3) + (r.rr <= 0.5 ? ' ≤ 0,5' : ' > 0,5')],
      ['$\\tau_b$ (C2-2a/b)', f(r.tb, 3)],
      ['Hệ số độ cứng $0{,}8\\tau_b$', f(0.8 * r.tb, 3)],
      ['$N_i = 0{,}002\\alpha\\Sigma Y_i$', f(r.Ni, 3) + ' kN'],
      ['$\\Delta_1$ bậc nhất (EI danh nghĩa, không $N_i$)', f(r.D1, 2) + ' mm'],
      ['$\\Delta_1$ bậc nhất – mô hình DM', f(r.D1d, 2) + ' mm'],
      ['$\\Delta_2$ bậc hai – mô hình DM', r.st ? f(r.D2, 2) + ' mm' : { v: 'Mất ổn định ($\\alpha\\Sigma P/H \\ge K^*$)', cls: 'fail' }],
      ['$\\Delta_2/\\Delta_1$ (= $B_2$)', r.st ? { v: f(lim, 3) + (lim <= 1.5 ? ' ≤ 1,5: được dùng ELM' : lim <= 1.7 ? ' ≤ 1,7: chỉ cần $N_i$ ở tổ hợp tải đứng' : ' > 1,7: $N_i$ ở mọi tổ hợp'), cls: lim <= 1.5 ? 'pass' : lim <= 1.7 ? 'warn' : 'fail' } : '–'],
      ['$M_1$ chân cột, bậc nhất (mỗi cột)', f(r.M1, 2) + ' kNm'],
      ['$M_2$ chân cột, DM bậc hai (mỗi cột)', r.st ? '<b>' + f(r.M2, 2) + ' kNm</b> (+' + f((r.M2 / r.M1 - 1) * 100, 1) + ' %)' : '∞']];
    WC.table(F.out, rows, ['Đại lượng', 'Giá trị']);
    draw(r);
  }
  upd();
};
