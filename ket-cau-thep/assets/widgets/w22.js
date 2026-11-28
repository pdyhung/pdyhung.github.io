/* W22 – Mô men dầm cầu trục đơn giản dưới hai bánh xe, vị trí Winkler (Bài 18.4) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W22'] = function (el) {
  const F = WC.frame(el, { title: 'W22 · Mô men dầm cầu trục dưới hai bánh xe',
    tryText: 'kéo vị trí bánh $a$ qua lại: $M$ dưới bánh lớn nhất khi nào? Đổi $B$ sang 8,5 m, tiết diện H600×200×6×10 còn đạt không? Tăng $K$ vượt $0{,}586B$ và xem công thức Winkler hết đúng.' });
  const E = 2.06e5; // MPa
  const v = { Pc: 108, B: 6.8, K: 2.115, fac: 'tc23', Wx: 1486, Ix: 44566, fyd: 313.6, a: 0, win: true };
  const FAC = { tc23: [1.2 * 1.2 * 1.0, 'TCVN 2023: $\\gamma_f\\eta\\psi_t$ = 1,2 × 1,2 × 1,0'], cab: [1.6 * 1.25, 'ASCE LRFD, cabin: 1,6 × 1,25'], pen: [1.6 * 1.10, 'ASCE LRFD, pendant: 1,6 × 1,10'] };
  const S = (k, l, a, b, st, u) => WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } });
  S('Pc', '$P^c_{\\max}$ 1 bánh', 10, 400, 0.1, 'kN'); S('B', 'Nhịp dầm $B$', 3, 15, 0.1, 'm'); S('K', 'Đế bánh $K$', 0.5, 8, 0.005, 'm');
  WC.select(F.ctrl, { label: 'Hệ số tải bánh', options: [['tc23', 'TCVN 2737:2023 (×1,44)'], ['cab', 'ASCE LRFD, cabin (×2,00)'], ['pen', 'ASCE LRFD, pendant (×1,76)']], value: 'tc23', onChange: x => { v.fac = x; upd(); } });
  S('Wx', '$W_x$', 200, 6000, 1, 'cm³'); S('Ix', '$I_x$', 2000, 200000, 1, 'cm⁴'); S('fyd', '$f_{yd}$', 150, 400, 0.1, 'MPa');
  const sa = WC.slider(F.ctrl, { label: 'Vị trí bánh trái $a$', min: 0, max: 15, step: 0.005, value: 0, unit: 'm', onInput: x => { v.a = x; v.win = false; wchk.checked = false; upd(); } });
  const wchk = WC.check(F.ctrl, { label: 'Đặt theo Winkler', checked: true, onChange: c => { v.win = c; upd(); } });
  // mô men tại x do hai lực P tại a và a+K (bánh ngoài nhịp bỏ qua)
  function Mx(x, P, a) {
    let M = 0; [a, a + v.K].forEach(p => { if (p < 0 || p > v.B) return; M += x <= p ? P * x * (v.B - p) / v.B : P * p * (v.B - x) / v.B; }); return M;
  }
  function draw(P, a, Mlist) {
    const W = 600, H = 255, X = x => 40 + x * 520 / v.B, yb = 70, Mm = Math.max(1e-9, ...Mlist), Y = m => yb + 40 + 110 * m / Mm, c = 'var(--acc)';
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:270px" font-family="sans-serif" font-size="11">';
    s += '<line x1="' + X(0) + '" y1="' + yb + '" x2="' + X(v.B) + '" y2="' + yb + '" stroke="currentColor" stroke-width="3"/>';
    s += '<path d="M' + X(0) + ' ' + yb + 'l-7 12h14z M' + X(v.B) + ' ' + yb + 'l-7 12h14z" fill="none" stroke="currentColor"/>';
    s += '<line x1="' + X(v.B / 2) + '" y1="' + (yb - 50) + '" x2="' + X(v.B / 2) + '" y2="' + (H - 4) + '" stroke="currentColor" stroke-dasharray="2 4" opacity=".5"/>';
    s += '<text x="' + (X(v.B / 2) + 4) + '" y="' + (yb + 30) + '" fill="currentColor" font-size="10">giữa nhịp</text>';
    [a, a + v.K].forEach((p, i) => { if (p < 0 || p > v.B) return; const xx = X(p);
      s += '<line x1="' + xx + '" y1="' + (yb - 45) + '" x2="' + xx + '" y2="' + (yb - 4) + '" stroke="#d33" stroke-width="2"/><path d="M' + xx + ' ' + (yb - 2) + 'l-5 -9h10z" fill="#d33"/>' +
        '<text x="' + xx + '" y="' + (yb - 49) + '" text-anchor="middle" fill="#d33">P' + (i + 1) + '</text>'; });
    const r = a + v.K / 2; s += '<path d="M' + X(r) + ' ' + (yb - 30) + 'v22" stroke="currentColor" stroke-dasharray="3 2"/><text x="' + X(r) + '" y="' + (yb - 33) + '" text-anchor="middle" fill="currentColor" font-size="10">hợp lực</text>';
    let d = ''; for (let i = 0; i <= 200; i++) { const x = v.B * i / 200; d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(Mx(x, P, a)).toFixed(1); }
    s += '<path d="M' + X(0) + ' ' + Y(0) + d.replace(/^M/, 'L') + 'L' + X(v.B) + ' ' + Y(0) + 'z" fill="' + c + '" fill-opacity=".15" stroke="' + c + '"/>';
    [a, a + v.K].forEach(p => { if (p < 0 || p > v.B) return; const m = Mx(p, P, a);
      s += '<text x="' + X(p) + '" y="' + (Y(m) + 14) + '" text-anchor="middle" fill="currentColor">' + WC.f(m, 1) + '</text>'; });
    F.view.innerHTML = s + '</svg>';
  }
  function upd() {
    const k = FAC[v.fac][0], P = k * v.Pc, ok = v.K < 0.586 * v.B;
    const aW = ok ? v.B / 2 - 3 * v.K / 4 : v.B / 2 - v.K;   // Winkler; hoặc một bánh ở giữa nhịp
    if (v.win) { v.a = Math.max(0, aW); sa.set(+v.a.toFixed(3)); }
    const Mw = ok ? P * Math.pow(v.B - v.K / 2, 2) / (2 * v.B) : P * v.B / 4;
    const Mcur = [v.a, v.a + v.K].map(p => Mx(p, P, v.a)), Mc = Mw / k;
    const sig = Mw * 1e3 / v.Wx, f = Mc * 1e6 * Math.pow(v.B * 1e3, 2) / (10 * E * v.Ix * 1e4), tc = v.fac === 'tc23';
    WC.table(F.out, [
      ['Tải bánh tính toán $P$', WC.f(P, 1) + ' kN', FAC[v.fac][1]],
      ['$M$ dưới bánh 1 / bánh 2 (vị trí đang chọn)', WC.f(Mcur[0], 1) + ' / ' + WC.f(Mcur[1], 1) + ' kNm', '$a$ = ' + WC.f(v.a, 3) + ' m'],
      ['$M_{\\max}$ ' + (ok ? 'Winkler $P(B-K/2)^2/2B$' : '(một bánh giữa nhịp, $PB/4$)'), { v: '<b>' + WC.f(Mw, 1) + ' kNm</b>', cls: '' },
        ok ? '$K$ = ' + WC.f(v.K, 3) + ' < $0{,}586B$ = ' + WC.f(0.586 * v.B, 3) + ' m' : { v: '$K \\ge 0{,}586B$: hai bánh không lợi hơn một bánh', cls: 'warn' }],
      ['$\\sigma = M_{\\max}/W_x$', WC.f(sig, 1) + ' MPa', tc ? '' : 'tham khảo (LRFD so với $\\phi M_n$, Ch.13)'],
      ['$\\sigma/f_{yd}$', tc ? { v: WC.f(sig / v.fyd, 2), cls: sig <= v.fyd ? 'pass' : 'fail' } : '–', tc ? WC.ok(sig <= v.fyd) : ''],
      ['Võng do 1 cầu trục tiêu chuẩn $M^cB^2/10EI$', WC.f(f, 1) + ' mm = $L$/' + WC.f(v.B * 1e3 / f, 0), '$M^c$ = ' + WC.f(Mc, 1) + ' kNm'],
      ['Giới hạn cabin A1–A6 $L/400$', WC.f(v.B * 1e3 / 400, 1) + ' mm', WC.ok(f <= v.B * 1e3 / 400)],
      ['Giới hạn điều khiển dưới nền $L/250$', WC.f(v.B * 1e3 / 250, 1) + ' mm', WC.ok(f <= v.B * 1e3 / 250)]
    ], ['Đại lượng', 'Giá trị', 'Ghi chú']);
    draw(P, v.a, [Mw, ...Mcur]);
  }
  upd();
};
