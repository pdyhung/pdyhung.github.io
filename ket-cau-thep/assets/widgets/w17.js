/* W17 – Biểu đồ tương tác H1-1 cho cột C1 (Bài 13.5) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W17'] = function (el) {
  const F = WC.frame(el, { title: 'W17 · Tương tác nén – uốn H1-1 (cột C1)',
    tryText: 'giảm $L_b$ (khoảng cách chống xiên cánh trong) từ 5 m xuống 4,2 m: điểm cột C1 đi vào trong đường bao. $P_c$ giữ theo $L_{cy}$ = 5 m.' });
  if (!window.JXG) { F.view.innerHTML = '<p class="w-err">Không tải được JSXGraph.</p>'; return; }
  const s = { d: 650, bf: 200, tf: 10, tw: 6 }, Fy = 235, Pc = SL.Pn(s, Fy, 7070, 5000).phiPn;
  let Pu = 79.85, Mu = 278.08, Lb = 5;
  const id = 'jxg-w17-' + Math.random().toString(36).slice(2, 8);
  F.view.innerHTML = '<div id="' + id + '" class="jxgbox"></div>';
  const brd = JXG.JSXGraph.initBoard(id, { boundingbox: [-0.08, 1.25, 1.4, -0.1], axis: true, showCopyright: false, showNavigation: false,
    defaultAxes: { x: { name: 'Mr/Mc', withLabel: true, label: { position: 'rt', offset: [-45, 14] } }, y: { name: 'Pr/Pc', withLabel: true, label: { position: 'rt', offset: [8, -6] } } } });
  brd.create('polygon', [[0, 0], [0, 1], [0.9, 0.2], [1, 0]], { fillColor: '#2da44e', fillOpacity: 0.12, borders: { strokeColor: '#2da44e', strokeWidth: 2 }, vertices: { visible: false }, highlight: false });
  brd.create('text', [0.47, 0.68, 'H1-1a'], { fontSize: 12 }); brd.create('text', [0.55, 0.12, 'H1-1b'], { fontSize: 12 }); brd.create('text', [0.62, 0.32, 'điểm xám: Lb = 5 m và 4,2 m'], { fontSize: 11, strokeColor: '#7d8590' });
  const ref = L => [Mu / SL.Mn(s, Fy, L * 1000).phiMn, Pu / Pc];
  brd.create('point', ref(5), { name: '', size: 3, fixed: true, color: '#7d8590' });
  brd.create('point', ref(4.2), { name: '', size: 3, fixed: true, color: '#7d8590' });
  const pt = brd.create('point', [() => Mu / SL.Mn(s, Fy, Lb * 1000).phiMn, () => Pu / Pc], { name: 'C1', size: 6, fixed: true, color: '#d1242f', label: { offset: [-6, 18], fontSize: 13 } });
  WC.slider(F.ctrl, { label: '$L_b$ (chống xiên)', min: 2, max: 7, step: 0.1, value: Lb, unit: 'm', onInput: x => { Lb = x; upd(); } });
  WC.slider(F.ctrl, { label: '$P_u$', min: 0, max: 700, step: 1, value: Pu, unit: 'kN', onInput: x => { Pu = x; upd(); } });
  WC.slider(F.ctrl, { label: '$M_u$', min: 0, max: 450, step: 1, value: Mu, unit: 'kNm', onInput: x => { Mu = x; upd(); } });
  function upd() {
    const Mc = SL.Mn(s, Fy, Lb * 1000).phiMn, h = SL.H1(Pu / Pc, Mu / Mc);
    WC.table(F.out, [['$P_c = \\phi P_n$ ($L_{cy}$ = 5 m)', WC.f(Pc, 1) + ' kN'], ['$M_c = \\phi M_n$', WC.f(Mc, 1) + ' kNm'],
      ['$P_r/P_c$', WC.f(Pu / Pc, 3)], ['Công thức', h.eq], ['Tỷ số tương tác', { v: WC.f(h.val, 3) + (h.val <= 1 ? ' – Đạt' : ' – Không đạt'), cls: h.val <= 1 ? 'pass' : 'fail' }]]);
    brd.update();
  }
  upd();
};
