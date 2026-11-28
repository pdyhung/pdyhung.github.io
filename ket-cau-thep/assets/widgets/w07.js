/* W7 – Đường cong φ – λ̄ cho tiết diện loại a, b, c (TCVN 5575:2024, Bảng 7, công thức 6-2) – Bài 6.2 */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W7'] = function (el) {
  const F = WC.frame(el, { title: 'W7 · Hệ số ổn định $\\varphi$ theo độ mảnh quy ước $\\bar\\lambda$ (Bảng 7)',
    tryText: 'thanh chống D90×3 dài 8 m có $\\bar\\lambda = 8{,}56$ và $\\varphi = 0{,}104$. Đổi sang D141×4: $\\lambda$ còn bao nhiêu và có đạt $\\lambda_u = 200$ không? Kéo $\\bar\\lambda$ về 2,0 rồi so sánh $\\varphi$ của ba loại a, b, c.' });
  if (!window.JXG) { F.view.innerHTML = '<p class="w-err">Không tải được JSXGraph.</p>'; return; }
  const E = 206000;
  const AB = { a: { al: 0.03, be: 0.06, lim: 3.8, col: '#1f6feb' }, b: { al: 0.04, be: 0.09, lim: 4.4, col: '#2da44e' }, c: { al: 0.04, be: 0.14, lim: 5.8, col: '#e16f24' } };
  // công thức (6-2); φ = 1 khi λ̄ < 0,6 (loại a, b); φ ≤ 1; φ ≤ 7,6/λ̄² khi λ̄ vượt 3,8 / 4,4 / 5,8
  function phi(lb, k) {
    const p = AB[k];
    if (lb < 0.6 && k !== 'c') return 1;
    if (lb <= 1e-6) return 1;
    const d = 9.87 * (1 - p.al + p.be * lb) + lb * lb;
    let f = 0.5 * (d - Math.sqrt(d * d - 39.48 * lb * lb)) / (lb * lb);
    if (f > 1) f = 1;
    if (lb > p.lim) f = Math.min(f, 7.6 / (lb * lb));
    return f;
  }
  const SEC = { d90: { t: 'Ống D90×3 (A = 8,20 cm²; i = 3,08 cm)', A: 8.20, i: 3.08, k: 'a' },
                d114: { t: 'Ống D114×4 (A = 13,82 cm²; i = 3,89 cm)', A: 13.82, i: 3.89, k: 'a' },
                d141: { t: 'Ống D141×4 (A = 17,22 cm²; i = 4,85 cm)', A: 17.22, i: 4.85, k: 'a' },
                d1415: { t: 'Ống D141×5 (A = 21,36 cm²; i = 4,81 cm)', A: 21.36, i: 4.81, k: 'a' } };
  let S = SEC.d90, k = 'a', fy = 235, gm = 1.05, L = 8;
  const fyd = () => fy / gm, s = () => Math.sqrt(fyd() / E);
  let lb = L * 100 / S.i * s();
  const id = 'jxg-w7-' + Math.random().toString(36).slice(2, 8);
  F.view.innerHTML = '<div id="' + id + '" class="jxgbox"></div>';
  const brd = JXG.JSXGraph.initBoard(id, { boundingbox: [-0.5, 1.12, 10.4, -0.1], axis: true, showCopyright: false, showNavigation: false,
    defaultAxes: { x: { name: 'λ̄', withLabel: true, label: { position: 'rt', offset: [-20, 14] } }, y: { name: 'φ', withLabel: true, label: { position: 'rt', offset: [8, -6] } } } });
  const CUR = {};
  Object.keys(AB).forEach(c => {
    CUR[c] = brd.create('functiongraph', [x => phi(x, c), 0.001, 10.4], { strokeColor: AB[c].col, strokeWidth: c === k ? 3 : 1.5, dash: c === k ? 0 : 2, highlight: false });
  });
  brd.create('text', [7.6, 0.55, 'a (xanh), b (lục), c (cam)'], { fontSize: 12 });
  brd.create('segment', [[() => lb, 0], [() => lb, () => phi(lb, k)]], { strokeColor: '#d1242f', dash: 1, highlight: false });
  brd.create('point', [() => lb, () => phi(lb, k)], { name: '', size: 5, fixed: true, color: '#d1242f' });
  WC.select(F.ctrl, { label: 'Tiết diện', options: Object.keys(SEC).map(x => [x, SEC[x].t]), value: 'd90',
    onChange: x => { S = SEC[x]; fromL(); } });
  WC.select(F.ctrl, { label: 'Loại tiết diện', options: [['a', 'a – ống, hộp cán nóng'], ['b', 'b – I hàn, I cán, hộp hàn, góc'], ['c', 'c – U, T, I cánh mỏng ghép']], value: 'a',
    onChange: x => { k = x; upd(); } });
  WC.select(F.ctrl, { label: '$\\gamma_m$', options: [['1.05', '1,05 – thép theo tiêu chuẩn này'], ['1.10', '1,10 – thép theo tiêu chuẩn nước ngoài']], value: '1.05',
    onChange: x => { gm = +x; fromL(); } });
  const sF = WC.slider(F.ctrl, { label: '$f_y$', min: 235, max: 355, step: 5, value: fy, unit: 'MPa', onInput: x => { fy = x; fromL(); } });
  const sL = WC.slider(F.ctrl, { label: 'Chiều dài tính toán $L$', min: 0.5, max: 15, step: 0.1, value: L, unit: 'm', onInput: x => { L = x; fromL(); } });
  const sB = WC.slider(F.ctrl, { label: '$\\bar\\lambda$ (kéo trực tiếp)', min: 0.1, max: 10, step: 0.01, value: +lb.toFixed(2), unit: '', onInput: x => { lb = x; L = lb / s() * S.i / 100; sL.set(+L.toFixed(2)); upd(); } });
  function fromL() { lb = L * 100 / S.i * s(); sB.set(+lb.toFixed(2)); upd(); }
  function upd() {
    const lam = L * 100 / S.i, f = phi(lb, k), Nc = f * S.A * 100 * fyd() / 1000, p = AB[k];
    WC.table(F.out, [
      ['$f_{yd} = f_y/\\gamma_m$', WC.f(fyd(), 1) + ' MPa'],
      ['$\\lambda = L/i$', WC.f(lam, 1)],
      ['$\\bar\\lambda = \\lambda\\sqrt{f_{yd}/E}$', WC.f(lb, 2)],
      ['$\\alpha$ / $\\beta$ (loại ' + k + ')', WC.f(p.al, 2) + ' / ' + WC.f(p.be, 2)],
      ['$\\varphi$', '<b>' + WC.f(f, 3) + '</b>' + (lb > p.lim ? ' (giới hạn $7{,}6/\\bar\\lambda^2$ vì $\\bar\\lambda > ' + WC.f(p.lim, 1) + '$)' : lb < 0.6 && k !== 'c' ? ' ($\\bar\\lambda < 0{,}6$)' : '')],
      ['$N_c = \\varphi A f_{yd}$ ($\\gamma_c = 1$)', WC.f(Nc, 1) + ' kN'],
      ['Độ mảnh thanh chống ($\\lambda_u = 200$)', lam <= 200 ? { v: 'Đạt: ' + WC.f(lam, 0) + ' ≤ 200', cls: 'pass' } : { v: 'Không đạt: ' + WC.f(lam, 0) + ' > 200', cls: 'fail' }]
    ]);
    Object.keys(CUR).forEach(c => CUR[c].setAttribute({ strokeWidth: c === k ? 3 : 1.5, dash: c === k ? 0 : 2 }));
    brd.update();
  }
  upd();
};
