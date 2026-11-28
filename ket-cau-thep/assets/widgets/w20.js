/* W20 – Chân cột khớp theo AISC J8, DG1 và ma sát chân cột (Bài 15.4) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W20'] = function (el) {
  const F = WC.frame(el, { title: 'W20 · Chân cột khớp: bản đế (DG1) và ma sát',
    tryText: 'trường hợp nào quyết định chiều dày bản đế: nén hay nhổ? Tăng $V_u$ lên 30 kN: ma sát theo DG1 ($\\mu$ = 0,55) còn đủ không, và theo TCVN ($\\mu$ = 0,25) thiếu bao nhiêu?' });
  // Cột H(300)×200×6×10, bản đế Q235, bê tông f'c = 27,6 MPa, √(A2/A1) = 2; 4 bu lông neo cách nhau 120 mm qua bụng, đường hàn 6 mm
  const d = 300, bf = 200, tw = 6, Fy = 235, fc = 27.6, gx = 120, wld = 6;
  const v = { N: 350, B: 240, t: 16, Pu: 65.02, Tu: 46.73, Vu: 26.21 };
  WC.slider(F.ctrl, { label: 'Chiều dài bản đế $N$', min: 300, max: 600, step: 5, value: v.N, unit: 'mm', onInput: x => { v.N = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Bề rộng bản đế $B$', min: 200, max: 450, step: 5, value: v.B, unit: 'mm', onInput: x => { v.B = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Dày bản đế $t$', min: 8, max: 40, step: 1, value: v.t, unit: 'mm', onInput: x => { v.t = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Nén $P_u$', min: 0, max: 1500, step: 0.01, value: v.Pu, unit: 'kN', onInput: x => { v.Pu = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Nhổ $T_u$', min: 0, max: 200, step: 0.01, value: v.Tu, unit: 'kN', onInput: x => { v.Tu = x; upd(); } });
  WC.slider(F.ctrl, { label: 'Cắt $V_u$ (đi kèm $P_u$)', min: 0, max: 100, step: 0.01, value: v.Vu, unit: 'kN', onInput: x => { v.Vu = x; upd(); } });
  const f1 = x => WC.f(x, 1), f2 = x => WC.f(x, 2);
  function draw(m, n) {
    const W = 360, Hh = 250, s = Math.min(300 / v.B, 210 / v.N), cx = 180, cy = 125, c = 'var(--acc)', Bw = v.B * s, Nh = v.N * s;
    let g = '<rect x="' + (cx - Bw / 2) + '" y="' + (cy - Nh / 2) + '" width="' + Bw + '" height="' + Nh + '" fill="' + c + '" fill-opacity=".12" stroke="' + c + '"/>';
    const fw = bf * s, dd = d * s, tf = 10 * s;
    g += '<g fill="currentColor" fill-opacity=".4"><rect x="' + (cx - fw / 2) + '" y="' + (cy - dd / 2) + '" width="' + fw + '" height="' + tf + '"/><rect x="' + (cx - fw / 2) + '" y="' + (cy + dd / 2 - tf) + '" width="' + fw + '" height="' + tf + '"/><rect x="' + (cx - tw * s / 2) + '" y="' + (cy - dd / 2) + '" width="' + Math.max(2, tw * s) + '" height="' + dd + '"/></g>';
    [-1, 1].forEach(i => [-1, 1].forEach(k => { g += '<circle cx="' + (cx + k * gx * s / 2) + '" cy="' + (cy + i * 80 * s) + '" r="' + 12 * s + '" fill="#d1242f"/>'; }));
    g += '<rect x="' + (cx - 0.4 * bf * s) + '" y="' + (cy - 0.475 * dd) + '" width="' + 0.8 * fw + '" height="' + 0.95 * dd + '" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>';
    g += '<text x="' + cx + '" y="' + (cy - Nh / 2 - 6) + '" font-size="11" text-anchor="middle" fill="currentColor">m = ' + f1(m) + ' (theo N)</text>' +
      '<text x="' + (cx + Bw / 2 + 4) + '" y="' + (cy + 4) + '" font-size="11" fill="currentColor">n = ' + f1(n) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + Nh / 2 + 14) + '" font-size="11" text-anchor="middle" fill="currentColor">N × B = ' + v.N + ' × ' + v.B + ' mm</text>';
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:100%;max-height:270px">' + g + '</svg>';
  }
  function upd() {
    const A1 = v.N * v.B, phiPp = 0.65 * 1.7 * fc * A1 / 1000;
    const m = (v.N - 0.95 * d) / 2, n = (v.B - 0.8 * bf) / 2;
    const X = 4 * d * bf / Math.pow(d + bf, 2) * v.Pu / phiPp, lam = Math.min(1, 2 * Math.sqrt(X) / (1 + Math.sqrt(Math.max(0, 1 - X))));
    const ln = lam * Math.sqrt(d * bf) / 4, l = Math.max(m, n, ln), tc = l * Math.sqrt(2 * v.Pu * 1000 / (0.9 * Fy * v.B * v.N));
    const a = gx / 2 - tw / 2 - wld, Mt = v.Tu / 4 * a / 1000, tt = Math.sqrt(4 * Mt * 1e6 / (0.9 * Fy * 2 * a));
    const frA = 0.75 * 0.55 * v.Pu, frT = 0.25 * v.Pu;
    const r = (q, c) => ({ v: f2(c > 0 ? q / c : Infinity) + (q <= c ? ' – Đạt' : ' – Không đạt'), cls: q <= c ? 'pass' : 'fail' });
    WC.table(F.out, [
      ['Ép mặt bê tông $\\phi_cP_p = 0{,}65 \\cdot 1{,}7f\'_cA_1$', f1(phiPp) + ' kN', r(v.Pu, phiPp)],
      ['$m$; $n$; $\\lambda n\'$', f1(m) + '; ' + f1(n) + '; ' + f1(ln) + ' mm', '$l$ = ' + f1(l) + ' mm'],
      ['Bản đế khi nén $t_{\\min} = l\\sqrt{2P_u/(0{,}9F_yBN)}$', f1(tc) + ' mm', r(tc, v.t)],
      ['Nhổ: $T_u/4$; $a$; $M_u$', f1(v.Tu / 4) + ' kN; ' + a + ' mm; ' + f2(Mt) + ' kNm', ''],
      ['Bản đế khi nhổ $t_{req} = \\sqrt{4M_u/(0{,}9F_y\\,2a)}$', f1(tt) + ' mm', r(tt, v.t)],
      ['Ma sát DG1: $\\phi\\mu P_u$, $\\mu$ = 0,55, $\\phi$ = 0,75', f1(frA) + ' kN', r(v.Vu, frA)],
      ['Ma sát TCVN: $\\mu P_u$, $\\mu$ = 0,25', f1(frT) + ' kN', r(v.Vu, frT)]
    ], ['Kiểm tra', 'Giá trị', 'Tỷ số']);
    draw(m, n);
  }
  upd();
};
