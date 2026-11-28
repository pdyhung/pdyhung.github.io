/* W15 – Phân loại tiết diện I tổ hợp hàn theo AISC 360-10 Bảng B4.1 (Bài 13.1) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W15'] = function (el) {
  const F = WC.frame(el, { title: 'W15 · Phân loại tiết diện (Bảng B4.1)',
    tryText: 'chọn cột C1 rồi tăng $t_w$ từ 6 lên 16 mm: bụng hết mảnh khi nén ở khoảng bao nhiêu mm? Với kèo, giảm $t_f$ xuống 10 mm thì cánh chuyển sang loại nào?' });
  const PRE = { keo: { t: 'Kèo H500×250×8×12, Fy 345', bf: 250, tf: 12, h: 476, tw: 8, Fy: 345 },
                c1: { t: 'Cột C1 H650×200×6×10, Fy 235', bf: 200, tf: 10, h: 630, tw: 6, Fy: 235 } };
  const v = Object.assign({}, PRE.keo); const sl = {};
  WC.select(F.ctrl, { label: 'Tiết diện mẫu', options: Object.keys(PRE).map(k => [k, PRE[k].t]), value: 'keo',
    onChange: k => { Object.assign(v, PRE[k]); ['bf', 'tf', 'h', 'tw', 'Fy'].forEach(x => sl[x].set(v[x])); upd(); } });
  [['bf', 'Bề rộng cánh $b_f$', 120, 400, 5, 'mm'], ['tf', 'Dày cánh $t_f$', 6, 30, 1, 'mm'], ['h', 'Chiều cao bụng $h$', 200, 1000, 2, 'mm'],
   ['tw', 'Dày bụng $t_w$', 4, 20, 1, 'mm'], ['Fy', '$F_y$', 235, 450, 5, 'MPa']].forEach(([k, l, a, b, st, u]) =>
    sl[k] = WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } }));
  const tag = c => ({ compact: { v: 'Đặc chắc', cls: 'pass' }, noncompact: { v: 'Không đặc chắc', cls: 'warn' }, slender: { v: 'Mảnh', cls: 'fail' },
    nonslender: { v: 'Không mảnh', cls: 'pass' } })[c];
  function draw() {
    const W = 300, Hh = 240, s = Math.min(200 / v.bf, 200 / (v.h + 2 * v.tf)), bf = v.bf * s, tf = Math.max(2, v.tf * s), h = v.h * s, tw = Math.max(1.5, v.tw * s);
    const x0 = (W - bf) / 2, y0 = (Hh - h - 2 * tf) / 2, c = 'var(--acc)';
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:100%;max-height:260px"><g fill="' + c + '" fill-opacity=".25" stroke="' + c + '">' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + bf + '" height="' + tf + '"/>' +
      '<rect x="' + (W - tw) / 2 + '" y="' + (y0 + tf) + '" width="' + tw + '" height="' + h + '"/>' +
      '<rect x="' + x0 + '" y="' + (y0 + tf + h) + '" width="' + bf + '" height="' + tf + '"/></g>' +
      '<g font-size="12" fill="currentColor"><text x="' + W / 2 + '" y="' + (y0 - 6) + '" text-anchor="middle">b_f = ' + v.bf + '</text>' +
      '<text x="' + (W / 2 + tw / 2 + 6) + '" y="' + (Hh / 2) + '">h/t_w = ' + WC.f(v.h / v.tw, 1) + '</text></g></svg>';
  }
  function upd() {
    const c = SL.classify({ d: v.h + 2 * v.tf, bf: v.bf, tf: v.tf, tw: v.tw }, v.Fy), f = x => WC.f(x, 2);
    WC.table(F.out, [
      ['Cánh – nén (B4.1a)', f(c.fc.lam), '–', f(c.fc.lr), tag(c.fc.cls)],
      ['Bụng – nén (B4.1a)', f(c.wc.lam), '–', f(c.wc.lr), tag(c.wc.cls)],
      ['Cánh – uốn (B4.1b)', f(c.ff.lam), f(c.ff.lp), f(c.ff.lr), tag(c.ff.cls)],
      ['Bụng – uốn (B4.1b)', f(c.wf.lam), f(c.wf.lp), f(c.wf.lr), tag(c.wf.cls)],
      ['$k_c$ = ' + WC.f(c.kc, 3), '', '', '', ''],
      ['Kết luận', { v: (c.wc.cls === 'slender' ? 'Nén: bụng mảnh → E7, hệ số Q. ' : 'Nén: không có phần tử mảnh → E3. ') +
        (c.wf.cls !== 'compact' ? 'Uốn: bụng không đặc chắc/mảnh → F4/F5.' : c.ff.cls === 'compact' ? 'Uốn: F2.' : 'Uốn: F3 (thêm FLB).'), cls: '' }, '', '', '']
    ], ['Phần tử', '$\\lambda$', '$\\lambda_p$', '$\\lambda_r$', 'Phân loại']);
    draw();
  }
  upd();
};
