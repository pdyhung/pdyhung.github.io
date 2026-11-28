/* W12 – Hệ số Kz theo dạng địa hình B/C/D (ASCE 7-10 Bảng 28.3-1), quy tắc z ≥ 30 ft cho B (Bài 9.3) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W12'] = function (el) {
  const F = WC.frame(el, { title: 'W12 · Hệ số $K_z$ theo độ cao và dạng địa hình',
    tryText: 'với dạng B, kéo $z$ xuống 4,6 m: công thức cho 0,58 nhưng Chương 28 vẫn lấy 0,70. Bỏ chọn quy tắc 30 ft để thấy chênh lệch. Đổi sang dạng C: $q_h$ của nhà DNP tăng bao nhiêu?' });
  if (!window.JXG) { F.view.innerHTML = '<p class="w-err">Không tải được JSXGraph.</p>'; return; }
  const EXP = { B: { a: 7.0, zg: 366, col: '#1f6feb' }, C: { a: 9.5, zg: 274, col: '#2da44e' }, D: { a: 11.5, zg: 213, col: '#e16f24' } };
  // Bảng 28.3-1 (Case 1/2 cho Chương 28): z = 15, 20, 25, 30, 40, 50, 60 ft
  const ZT = [4.6, 6.1, 7.6, 9.1, 12.2, 15.2, 18.3];
  const KT = { B: [0.70, 0.70, 0.70, 0.70, 0.76, 0.81, 0.85], C: [0.85, 0.90, 0.94, 0.98, 1.04, 1.09, 1.13], D: [1.03, 1.08, 1.12, 1.16, 1.22, 1.27, 1.31] };
  let ex = 'B', z = 10.35, rule = true, V = 54.51, Kd = 0.85, Kzt = 1.0;
  const zmin = e => (e === 'B' && rule) ? 9.1 : 4.6;
  const Kf = (e, zz) => { const p = EXP[e]; return 2.01 * Math.pow(Math.max(zz, zmin(e)) / p.zg, 2 / p.a); };
  const Kraw = (e, zz) => { const p = EXP[e]; return 2.01 * Math.pow(Math.max(zz, 4.6) / p.zg, 2 / p.a); };
  const Ktab = (e, zz) => { const k = KT[e]; if (!rule && e === 'B' && zz < 9.1) return Kraw(e, zz);
    if (zz <= ZT[0]) return k[0];
    for (let i = 1; i < ZT.length; i++) if (zz <= ZT[i]) return k[i - 1] + (k[i] - k[i - 1]) * (zz - ZT[i - 1]) / (ZT[i] - ZT[i - 1]);
    return Kf(e, zz); };
  const id = 'jxg-w12-' + Math.random().toString(36).slice(2, 8);
  F.view.innerHTML = '<div id="' + id + '" class="jxgbox"></div>';
  const brd = JXG.JSXGraph.initBoard(id, { boundingbox: [0.4, 19.5, 1.45, -1.2], axis: true, showCopyright: false, showNavigation: false,
    defaultAxes: { x: { name: 'Kz', withLabel: true, label: { position: 'rt', offset: [-25, 14] } }, y: { name: 'z (m)', withLabel: true, label: { position: 'rt', offset: [8, -6] } } } });
  ['B', 'C', 'D'].forEach(e => {
    brd.create('curve', [t => Kf(e, t), t => t, 0, 18.3], { strokeColor: EXP[e].col, strokeWidth: () => e === ex ? 3.5 : 1.5, highlight: false });
    brd.create('text', [() => Kf(e, 18.3) - 0.03, 18.9, e], { fontSize: 14, strokeColor: EXP[e].col });
  });
  brd.create('curve', [t => Kraw('B', t), t => t, 0, 9.1], { strokeColor: '#1f6feb', dash: 2, strokeWidth: 1.5, highlight: false, visible: () => ex === 'B' });
  brd.create('segment', [[0.4, () => z], [() => Ktab(ex, z), () => z]], { strokeColor: '#8c959f', dash: 1, highlight: false });
  brd.create('point', [() => Ktab(ex, z), () => z], { name: '', size: 5, fixed: true, color: '#d1242f' });
  brd.create('text', [0.45, 9.6, () => (ex === 'B' && rule) ? 'z ≥ 9,1 m (30 ft)' : ''], { fontSize: 12, strokeColor: '#1f6feb' });
  brd.create('segment', [[0.4, 9.1], [1.45, 9.1]], { strokeColor: '#1f6feb', dash: 3, strokeOpacity: 0.4, highlight: false, visible: () => ex === 'B' && rule });
  WC.select(F.ctrl, { label: 'Dạng địa hình', options: [['B', 'B – đô thị, ngoại ô'], ['C', 'C – trống trải'], ['D', 'D – mặt nước rộng']], value: 'B', onChange: v => { ex = v; upd(); } });
  WC.slider(F.ctrl, { label: '$z$', min: 0, max: 18, step: 0.05, value: z, unit: 'm', onInput: v => { z = v; upd(); } });
  WC.check(F.ctrl, { label: ' Quy tắc Chương 28: dạng B lấy $z \\ge 9{,}1$ m', checked: true, onChange: c => { rule = c; upd(); } });
  WC.slider(F.ctrl, { label: '$V$', min: 30, max: 80, step: 0.01, value: V, unit: 'm/s', onInput: v => { V = v; upd(); } });
  WC.slider(F.ctrl, { label: '$K_d$', min: 0.85, max: 1, step: 0.01, value: Kd, unit: '', onInput: v => { Kd = v; upd(); } });
  WC.slider(F.ctrl, { label: '$K_{zt}$', min: 1, max: 1.5, step: 0.01, value: Kzt, unit: '', onInput: v => { Kzt = v; upd(); } });
  function upd() {
    const p = EXP[ex], kt = Ktab(ex, z), kf = Kf(ex, z), q = 0.0613 * kt * Kzt * Kd * V * V;
    WC.table(F.out, [
      ['Thông số (Bảng 26.9-1)', '$\\alpha$ = ' + WC.f(p.a, 1) + '; $z_g$ = ' + p.zg + ' m'],
      ['$z$ dùng để tính', WC.f(Math.max(z, zmin(ex)), 2) + ' m' + (z < zmin(ex) ? ' (lấy theo giới hạn dưới)' : '')],
      ['$K_z$ theo công thức (9-4)', WC.f(kf, 3) + (ex === 'B' && z < 9.1 ? ' (không áp quy tắc: ' + WC.f(Kraw('B', z), 3) + ')' : '')],
      ['$K_z$ nội suy Bảng 28.3-1', '<b>' + WC.f(kt, 3) + '</b>'],
      ['$q_z = 0{,}0613\\,K_z K_{zt} K_d V^2$', { v: '<b>' + WC.f(q, 1) + ' daN/m²</b> (≈ kG/m²)', cls: 'pass' }]
    ], ['Đại lượng', 'Giá trị']);
    brd.update();
  }
  upd();
};
