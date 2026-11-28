/* W21 – Đường ảnh hưởng phản lực gối dầm cầu trục: Σy, Dmax, Dmin, T theo TCVN 2737:1995, 2737:2023 và ASCE 7-10 (Bài 18.1) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W21'] = function (el) {
  const F = WC.frame(el, { title: 'W21 · Đường ảnh hưởng cầu trục → $D_{\\max}$, $D_{\\min}$, $T$',
    tryText: 'tăng bước cột $B$ từ 6,8 lên 8,5 m: $\\sum y$ và $D_{\\max}$ tăng bao nhiêu? Chuyển sang hai cầu trục, khe hở 1,2 m: hệ số $\\psi_t$ giảm còn 0,85 nhưng $D_{\\max}$ vẫn tăng, vì sao?' });
  const v = { Pmax: 108, Pmin: 27.9, Q: 150, G: 11.85, n0: 2, K: 2.115, B: 6.8, nc: 1, c: 1.2, reg: 'a16', hook: 0.05 };
  const S = (k, l, a, b, st, u) => WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } });
  S('Pmax', '$P^c_{\\max}$', 10, 400, 0.1, 'kN'); S('Pmin', '$P^c_{\\min}$', 5, 200, 0.1, 'kN');
  S('Q', 'Sức nâng $Q$', 30, 1000, 5, 'kN'); S('G', 'Xe con $G_{xc}$', 5, 200, 0.05, 'kN');
  S('K', 'Đế bánh $K$', 0.5, 6, 0.005, 'm'); S('B', 'Bước cột $B$', 4, 12, 0.1, 'm');
  WC.select(F.ctrl, { label: 'Số cầu trục', options: [['1', 'Một cầu trục'], ['2', 'Hai cầu trục giống nhau']], value: '1', onChange: x => { v.nc = +x; upd(); } });
  S('c', 'Khe giữa 2 cầu trục $c$', 0.3, 6, 0.05, 'm');
  WC.select(F.ctrl, { label: 'Chế độ làm việc', options: [['a16', 'A1–A6'], ['a78', 'A7–A8']], value: 'a16', onChange: x => { v.reg = x; upd(); } });
  WC.select(F.ctrl, { label: 'Móc (TCVN 9.4)', options: ['0.05', '0.1'].map(x => [x, x === '0.05' ? 'Móc mềm: 0,05(Q+G)' : 'Móc cứng: 0,1(Q+G)']), value: '0.05', onChange: x => { v.hook = +x; upd(); } });
  // tọa độ bánh xe (m) của đoàn bánh, bánh đầu tại 0
  function wheels() { return v.nc === 1 ? [0, v.K] : [0, v.K, v.K + v.c, 2 * v.K + v.c]; }
  const yIL = x => Math.max(0, 1 - Math.abs(x) / v.B);
  // đặt lần lượt từng bánh lên gối (cột), chọn vị trí cho Σy lớn nhất
  function best() {
    const w = wheels(); let bs = -1, bp = null;
    w.forEach(wi => { const p = w.map(x => x - wi), s = p.reduce((a, x) => a + yIL(x), 0); if (s > bs + 1e-12) { bs = s; bp = p; } });
    return { sy: bs, pos: bp };
  }
  function draw(pos) {
    const W = 600, H = 210, ext = Math.max(v.B, ...pos.map(Math.abs)) + 0.4, sx = 270 / ext, X = x => 300 + x * sx;
    const yb = 70, yp = 175, Y = y => yb + (yp - yb) * y, c = 'var(--acc)';
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:260px" font-family="sans-serif" font-size="11">';
    // dầm cầu trục hai nhịp và gối
    s += '<line x1="' + X(-v.B) + '" y1="' + yb + '" x2="' + X(v.B) + '" y2="' + yb + '" stroke="currentColor" stroke-width="3"/>';
    [-v.B, 0, v.B].forEach(x => s += '<path d="M' + X(x) + ' ' + yb + 'l-7 12h14z" fill="none" stroke="currentColor"/>');
    s += '<text x="' + X(-v.B / 2) + '" y="' + (yb + 18) + '" text-anchor="middle" fill="currentColor">B = ' + WC.f(v.B, 2) + ' m</text>';
    s += '<text x="' + X(v.B / 2) + '" y="' + (yb + 18) + '" text-anchor="middle" fill="currentColor">B = ' + WC.f(v.B, 2) + ' m</text>';
    s += '<text x="' + X(0) + '" y="' + (H - 4) + '" text-anchor="middle" fill="currentColor">cột đang xét (y = 1)</text>';
    // đường ảnh hưởng
    s += '<path d="M' + X(-v.B) + ' ' + yb + 'L' + X(0) + ' ' + Y(1) + 'L' + X(v.B) + ' ' + yb + 'z" fill="' + c + '" fill-opacity=".15" stroke="' + c + '"/>';
    pos.forEach((x, i) => {
      const y = yIL(x), xx = X(x);
      s += '<line x1="' + xx + '" y1="14" x2="' + xx + '" y2="' + (yb - 4) + '" stroke="#d33" stroke-width="2"/><path d="M' + xx + ' ' + (yb - 2) + 'l-5 -9h10z" fill="#d33"/>';
      s += '<text x="' + xx + '" y="11" text-anchor="middle" fill="#d33">P' + (i + 1) + '</text>';
      if (y > 0) s += '<line x1="' + xx + '" y1="' + yb + '" x2="' + xx + '" y2="' + Y(y) + '" stroke="' + c + '" stroke-dasharray="3 2"/>' +
        '<text x="' + (xx + 3) + '" y="' + (Y(y) - 4 > yb + 24 ? Y(y) - 4 : Y(y) + 12) + '" fill="currentColor">' + WC.f(y, 3) + '</text>';
    });
    F.view.innerHTML = s + '</svg>';
  }
  function upd() {
    const b = best(), sy = b.sy, f = (x, n) => WC.f(x, n == null ? 1 : n);
    const psi = v.nc === 1 ? 1.0 : (v.reg === 'a16' ? 0.85 : 0.95);
    const k95 = 1.1 * (v.reg === 'a16' ? 0.85 : 0.95), k23 = 1.2 * psi, kUS = 1.6;
    const T1 = v.hook * (v.Q + v.G) / v.n0, T1us = 0.2 * (v.Q + v.G) / 2 / v.n0;
    const D = { 95: k95 * v.Pmax * sy, 23: k23 * v.Pmax * sy, us: kUS * v.Pmax * sy };
    const d = { 95: k95 * v.Pmin * sy, 23: k23 * v.Pmin * sy, us: kUS * v.Pmin * sy };
    const T = { 95: k95 * T1 * sy, 23: k23 * T1 * sy, us: kUS * T1us * sy };
    WC.table(F.out, [
      ['$\\sum y_i$', f(sy, 3), f(sy, 3), f(sy, 3)],
      ['Hệ số tải', '$n\\,n_c$ = ' + f(k95, 3), '$\\gamma_f\\psi_t$ = ' + f(k23, 3), '1,6 (DG7)'],
      ['Lực ngang 1 bánh $T^c_1$ (kN)', f(T1, 3), f(T1, 3), f(T1us, 3) + ' (20 %, chia 2 ray)'],
      ['$D_{\\max}$ (kN)', f(D[95]), { v: '<b>' + f(D[23]) + '</b>', cls: 'pass' }, f(D.us)],
      ['$D_{\\min}$ (kN)', f(d[95]), f(d[23]), f(d.us)],
      ['$T$ (kN)', f(T[95], 2), f(T[23], 2), f(T.us, 2)],
      ['So với 1995 ($D_{\\max}$)', '1,00', f(D[23] / D[95], 2), f(D.us / D[95], 2)]
    ], ['Đại lượng', 'TCVN 2737:1995', 'TCVN 2737:2023', 'ASCE 7-10 / DG7']);
    F.out.insertAdjacentHTML('beforeend', '<p class="w-note">Một bánh đặt đúng trên cột; ' + (v.nc === 2 ? 'hai cầu trục: thử đặt từng bánh lên gối, lấy vị trí cho $\\sum y$ lớn nhất. ' : '') +
      'Cột 1995 giữ cách làm của bảng tính khóa ($n_c$ = 0,85 cả khi một cầu trục). ASCE: không có xung kích khi tính khung.</p>');
    if (window.renderMathInElement) renderMathInElement(F.out, window.KATEX_OPTS);
    draw(b.pos);
  }
  upd();
};
