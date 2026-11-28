/* W9 – Đường hàn góc theo TCVN 5575:2024 (14.1.7, 14.1.16, Bảng 41, Bảng 42) – Bài 7.2 */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W9'] = function (el) {
  const F = WC.frame(el, { title: 'W9 · Đường hàn góc: que hàn, $\\beta_f$, $h_f$, $L_w$',
    tryText: 'chọn mẫu "Cánh kèo" rồi tăng $h_f$: tới đâu thì đường hàn đủ bền và tới đâu thì vượt $1{,}2t$? Với mẫu "Bụng kèo", giảm $T$ xuống 12 mm để thấy Bảng 41 được áp dụng trở lại.' });
  const QUE = { E43: 180, E51: 225 };
  const PP = { tay: { t: 'Hàn tay / CO2 dây < 1,4 mm', bf: 0.7, bs: 1.0 }, td: { t: 'Tự động, d = 3–5 mm', bf: 1.1, bs: 1.15 }, cg: { t: 'Tự động, cơ giới d = 1,4–2 mm', bf: 0.9, bs: 1.05 } };
  const PRE = { bung: { ten: 'Bụng kèo – Ví dụ 7.1', N: 81, hf: 6, Lw: 932, ns: 2, t: 8, T: 20, pb: true },
                canh: { ten: 'Cánh kèo – Ví dụ 7.1', N: 861.5, hf: 14, Lw: 462, ns: 3, t: 12, T: 20, pb: true } };
  const v = Object.assign({ que: 'E43', pp: 'tay', fu: 470, lk: 2 }, PRE.bung); const sl = {};
  WC.select(F.ctrl, { label: 'Mẫu', options: Object.keys(PRE).map(k => [k, PRE[k].ten]), value: 'bung',
    onChange: k => { Object.assign(v, PRE[k]); ['N', 'hf', 'Lw', 'ns', 't', 'T'].forEach(x => sl[x].set(v[x])); pb.checked = v.pb; upd(); } });
  WC.select(F.ctrl, { label: 'Que hàn (Bảng C.1)', options: [['E43', 'E43 – f_wf = 180 MPa'], ['E51', 'E51 – f_wf = 225 MPa']], value: 'E43', onChange: x => { v.que = x; upd(); } });
  WC.select(F.ctrl, { label: 'Phương pháp hàn (Bảng 42)', options: Object.keys(PP).map(k => [k, PP[k].t]), value: 'tay', onChange: x => { v.pp = x; upd(); } });
  WC.select(F.ctrl, { label: 'Thép cơ bản', options: [['470', 'Q345: f_u = 470 MPa'], ['370', 'CCT34/S235: f_u = 370 MPa']], value: '470', onChange: x => { v.fu = +x; upd(); } });
  WC.select(F.ctrl, { label: 'Dạng liên kết (Bảng 41)', options: [['2', 'Chữ T hàn hai bên, ghép chồng'], ['1', 'Chữ T hàn một bên']], value: '2', onChange: x => { v.lk = +x; upd(); } });
  [['N', 'Lực $N$ (hoặc $V$)', 1, 1500, 0.5, 'kN'], ['hf', 'Chiều cao $h_f$', 3, 20, 1, 'mm'], ['Lw', 'Tổng $L_w$ tính toán', 40, 2000, 1, 'mm'],
   ['ns', 'Số đoạn hàn', 1, 6, 1, ''], ['t', 'Dày mỏng nhất $t$', 4, 40, 1, 'mm'], ['T', 'Dày lớn nhất $T$', 4, 40, 1, 'mm']].forEach(([k, l, a, b, st, u]) =>
    sl[k] = WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } }));
  const pb = WC.check(F.ctrl, { label: ' Lực phân bố suốt chiều dài đường hàn', checked: true, onChange: x => { v.pb = x; upd(); } });
  // Bảng 41: h_f,min theo T (mm); hàng 0: hai bên/ghép chồng, hàng 1: một bên
  function hfmin41(T, lk) {
    const lim = [5, 10, 16, 22, 32, 40], tab = lk === 2 ? [3, 4, 6, 10, 12, 16] : [3, 5, 8, 12, 16, 22];
    for (let i = 0; i < lim.length; i++) if (T <= lim[i]) return tab[i];
    return tab[tab.length - 1];
  }
  function draw(gov) {
    const W = 300, H = 220, k = Math.min(4, 45 / Math.max(v.T, v.t)), T = v.T * k, t = Math.max(3, v.t * k), hf = v.hf * k;
    const xc = W / 2, yb = 160, c = 'var(--acc)';
    let tri = '<polygon points="' + (xc - t / 2) + ',' + yb + ' ' + (xc - t / 2 - hf) + ',' + yb + ' ' + (xc - t / 2) + ',' + (yb - hf) + '"/>';
    if (v.lk === 2) tri += '<polygon points="' + (xc + t / 2) + ',' + yb + ' ' + (xc + t / 2 + hf) + ',' + yb + ' ' + (xc + t / 2) + ',' + (yb - hf) + '"/>';
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:240px">' +
      '<g fill="' + c + '" fill-opacity=".2" stroke="' + c + '"><rect x="30" y="' + yb + '" width="' + (W - 60) + '" height="' + T + '"/>' +
      '<rect x="' + (xc - t / 2) + '" y="20" width="' + t + '" height="' + (yb - 20) + '"/></g>' +
      '<g fill="' + (gov.ok ? '#2e9d57' : '#d33') + '" fill-opacity=".8">' + tri + '</g>' +
      '<g font-size="12" fill="currentColor" font-family="sans-serif"><text x="' + (xc + t / 2 + 6) + '" y="40">t = ' + v.t + '</text>' +
      '<text x="36" y="' + (yb + T + 14 > H - 4 ? H - 4 : yb + T + 14) + '">T = ' + v.T + ' mm</text>' +
      '<text x="' + (xc - t / 2 - hf - 4) + '" y="' + (yb - hf / 2) + '" text-anchor="end">h_f = ' + v.hf + '</text></g></svg>';
  }
  function upd() {
    const fwf = QUE[v.que], fws = 0.45 * v.fu, p = PP[v.pp], A = p.bf * fwf, B = p.bs * fws;
    const kim = A < B, beta = kim ? p.bf : p.bs, fw = kim ? fwf : fws;   // (176) hoặc (177), gamma_c = 1
    const tau = v.N * 1000 / (beta * v.hf * v.Lw), r = tau / fw, hreq = v.N * 1000 / (beta * fw * v.Lw);
    const T = Math.max(v.T, v.t), cu3 = v.t < 0.6 * T, hmin = cu3 ? null : hfmin41(T, v.lk), hmax = 1.2 * v.t;
    const L1 = v.Lw / v.ns, Lmin = Math.max(4 * v.hf, 40), Lmax = 85 * p.bf * v.hf;
    const okMin = cu3 ? true : v.hf >= hmin, okMax = v.hf <= hmax + 1e-9, okL = L1 >= Lmin, okL2 = v.pb || L1 <= Lmax;
    const allOk = r <= 1 && okMin && okMax && okL && okL2;
    const f = (x, n) => WC.f(x, n === undefined ? 1 : n);
    WC.table(F.out, [
      ['$\\beta_f f_{wf}$ / $\\beta_s f_{ws}$', f(A) + ' / ' + f(B) + ' MPa', kim ? 'Kim loại đường hàn quyết định → (176)' : 'Biên nóng chảy quyết định → (177)'],
      ['Ứng suất $\\tau = N/(\\beta h_f L_w)$', f(tau) + ' MPa', 'so với ' + (kim ? '$f_{wf}$' : '$f_{ws}$') + ' = ' + f(fw) + ' MPa'],
      ['Tỷ số (' + (kim ? '176' : '177') + ')', f(r, 3), WC.ok(r <= 1)],
      ['$h_f$ cần thiết theo bền', f(hreq, 2) + ' mm', ''],
      ['$h_f \\le 1{,}2t$', f(hmax) + ' mm', WC.ok(okMax)],
      ['$h_{f,\\min}$', cu3 ? 'Chú thích 3: $t < 0{,}6T$ = ' + f(0.6 * T) + ' mm' : 'Bảng 41: ' + hmin + ' mm',
        cu3 ? { v: 'Lấy theo tính toán, ≤ 1,2t', cls: 'warn' } : WC.ok(okMin)],
      ['$L_w$ mỗi đoạn ≥ max(4$h_f$; 40)', f(L1) + ' ≥ ' + f(Lmin) + ' mm', WC.ok(okL)],
      ['$L_w$ mỗi đoạn ≤ $85\\beta_f h_f$', f(Lmax) + ' mm', v.pb ? { v: 'Không áp dụng (lực phân bố)', cls: '' } : WC.ok(okL2)],
      ['Kết luận', allOk ? { v: 'Đường hàn góc đạt', cls: 'pass' } : { v: hreq > hmax ? 'Hàn góc không đủ: $h_f$ cần > $1{,}2t$ → hàn đối đầu thấu' : 'Chưa đạt – xem các dòng đỏ', cls: 'fail' }, '']
    ], ['Đại lượng', 'Giá trị', 'Kiểm tra']);
    draw({ ok: allOk });
  }
  upd();
};
