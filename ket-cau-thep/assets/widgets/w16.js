/* W16 – Đường cong φMn – Lb (AISC F2/F3) bằng JSXGraph (Bài 13.3) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W16'] = function (el) {
  const F = WC.frame(el, { title: 'W16 · Khả năng chịu uốn $\\phi M_n$ theo chiều dài không giằng $L_b$',
    tryText: 'kéo $L_b$ từ 3 m lên 8 m: $\\phi M_n$ của kèo giảm từ 562 xuống khoảng 259 kNm. Tăng $C_b$ lên 1,3 thì vùng nào không đổi?' });
  if (!window.JXG) { F.view.innerHTML = '<p class="w-err">Không tải được JSXGraph.</p>'; return; }
  const PRE = { keo: { t: 'Kèo H500×250×8×12, Fy 345 (Mu = 420,4 kNm)', s: { d: 500, bf: 250, tf: 12, tw: 8 }, Fy: 345, Mu: 420.4, Lb: 3 },
                c1: { t: 'Cột C1 H650×200×6×10, Fy 235 (Mu = 278,08 kNm)', s: { d: 650, bf: 200, tf: 10, tw: 6 }, Fy: 235, Mu: 278.08, Lb: 5 } };
  let P = PRE.keo, Lb = P.Lb, Cb = 1;
  const id = 'jxg-w16-' + Math.random().toString(36).slice(2, 8);
  F.view.innerHTML = '<div id="' + id + '" class="jxgbox"></div>';
  let brd;
  const M = x => SL.Mn(P.s, P.Fy, Math.max(x, 0.01) * 1000, Cb);
  function board() {
    if (brd) JXG.JSXGraph.freeBoard(brd);
    const top = Math.ceil(M(0.1).Mp * 0.9 * 1.15 / 50) * 50;
    brd = JXG.JSXGraph.initBoard(id, { boundingbox: [-0.8, top, 12.5, -top * 0.08], axis: true, showCopyright: false, showNavigation: false,
      defaultAxes: { x: { name: 'Lb (m)', withLabel: true, label: { position: 'rt', offset: [-50, 14] } }, y: { name: 'φMn (kNm)', withLabel: true, label: { position: 'rt', offset: [8, -6] } } } });
    brd.create('functiongraph', [x => M(x).phiMn, 0.01, 12.5], { strokeColor: '#1f6feb', strokeWidth: 3, highlight: false });
    brd.create('functiongraph', [() => P.Mu, -1, 13], { strokeColor: '#d1242f', dash: 2, highlight: false });
    brd.create('segment', [[() => M(1).Lp / 1000, 0], [() => M(1).Lp / 1000, () => M(1).phiMn]], { strokeColor: '#2da44e', dash: 1, highlight: false });
    brd.create('segment', [[() => M(1).Lr / 1000, 0], [() => M(1).Lr / 1000, () => M(M(1).Lr / 1000).phiMn]], { strokeColor: '#e16f24', dash: 1, highlight: false });
    brd.create('text', [() => M(1).Lp / 1000 + 0.1, top * 0.06, 'Lp'], { fontSize: 13 });
    brd.create('text', [() => M(1).Lr / 1000 + 0.1, top * 0.06, 'Lr'], { fontSize: 13 });
    brd.create('text', [10.5, () => P.Mu + top * 0.04, 'Mu'], { fontSize: 13, strokeColor: '#d1242f' });
    brd.create('point', [() => Lb, () => M(Lb).phiMn], { name: '', size: 5, fixed: true, color: '#d1242f' });
  }
  WC.select(F.ctrl, { label: 'Cấu kiện', options: Object.keys(PRE).map(k => [k, PRE[k].t]), value: 'keo',
    onChange: k => { P = PRE[k]; Lb = P.Lb; sL.set(Lb); board(); upd(); } });
  const sL = WC.slider(F.ctrl, { label: '$L_b$', min: 0.5, max: 12, step: 0.1, value: Lb, unit: 'm', onInput: x => { Lb = x; upd(); } });
  WC.slider(F.ctrl, { label: '$C_b$', min: 1, max: 2.3, step: 0.05, value: 1, unit: '', onInput: x => { Cb = x; brd.update(); upd(); } });
  function upd() {
    const r = M(Lb), zone = Lb * 1000 <= r.Lp ? 'dẻo ($L_b \\le L_p$)' : Lb * 1000 <= r.Lr ? 'không đàn hồi (F2-2)' : 'đàn hồi (F2-3)', ratio = P.Mu / r.phiMn;
    WC.table(F.out, [['$M_p$', WC.f(r.Mp, 1) + ' kNm'], ['$L_p$ / $L_r$', WC.f(r.Lp / 1000, 2) + ' / ' + WC.f(r.Lr / 1000, 2) + ' m'],
      ['Vùng LTB', zone], ['$M_n$ theo LTB / FLB', WC.f(r.Mltb, 1) + ' / ' + WC.f(r.Mflb, 1) + ' kNm (' + r.sec + ')'],
      ['$\\phi M_n$', '<b>' + WC.f(r.phiMn, 1) + ' kNm</b> – khống chế: ' + r.gov],
      ['$M_u/\\phi M_n$', { v: WC.f(ratio, 3) + (ratio <= 1 ? ' – Đạt' : ' – Không đạt'), cls: ratio <= 1 ? 'pass' : 'fail' }]]);
    brd && brd.update();
  }
  board(); upd();
};
