/* W10 – Bu lông liên kết mặt bích kèo – cột: lực kéo hàng ngoài cùng, kiểm tra (188), (186), (187), (190), so với TCXDVN 338:2005 – Bài 7.4 */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W10'] = function (el) {
  const F = WC.frame(el, { title: 'W10 · Bu lông mặt bích: $N_{t,\\max} = M h_1/(m\\sum h_i^2) - N/n$',
    tryText: 'với M24 cấp 8.8 tỷ số kéo là 1,22. Đổi sang M27 rồi chuyển sang số liệu TCXDVN 338: tỷ số vượt 1. Thử thêm hàng thứ 5 ($h_5$ = 75 mm): lực bu lông giảm được bao nhiêu?' });
  // Bảng C.6: d -> [A_b, A_bn]
  const AB = { 16: [201, 157], 20: [314, 245], 22: [380, 303], 24: [452, 353], 27: [572, 459], 30: [706, 561] };
  // Bảng C.4: cấp -> [f_vb, f_tb] mới; [f_vb, f_tb] TCXDVN 338:2005 (null: không có trong bảng tính cũ)
  const CAP = { '5.6': [210, 225, 190, 210], '8.8': [332, 448, 320, 400], '10.9': [416, 728, null, null] };
  const v = { M: 420.4, V: 81, N: 40.5, kN: false, rows: 4, m: 2, d: 24, cap: '8.8', tp: 20, fcb: 620, gb: 0.9, h: [548, 428, 300, 150, 75, 40] };
  const sl = {}, hrow = [];
  WC.select(F.ctrl, { label: 'Đường kính bu lông', options: Object.keys(AB).map(k => [k, 'M' + k]), value: '24', onChange: x => { v.d = +x; upd(); } });
  WC.select(F.ctrl, { label: 'Cấp độ bền', options: Object.keys(CAP).map(k => [k, k]), value: '8.8', onChange: x => { v.cap = x; upd(); } });
  WC.select(F.ctrl, { label: 'Cấp chính xác', options: [['0.9', 'B: γb = 0,9'], ['1', 'A: γb = 1,0']], value: '0.9', onChange: x => { v.gb = +x; v.fcb = v.gb === 1 ? 735 : 620; upd(); } });
  [['M', 'Mô men $M$', 0, 1000, 0.1, 'kNm'], ['V', 'Lực cắt $V$', 0, 500, 0.5, 'kN'], ['N', 'Lực dọc nén $N$', 0, 500, 0.5, 'kN'],
   ['rows', 'Số hàng bu lông', 2, 6, 1, ''], ['tp', 'Dày bản mã $t_p$', 10, 40, 1, 'mm']].forEach(([k, l, a, b, st, u]) =>
    sl[k] = WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } }));
  WC.check(F.ctrl, { label: ' Kể đến lực dọc nén N (sách bỏ qua, thiên về an toàn)', checked: false, onChange: x => { v.kN = x; upd(); } });
  for (let i = 0; i < 6; i++) {
    WC.slider(F.ctrl, { label: '$h_' + (i + 1) + '$', min: 20, max: 1200, step: 1, value: v.h[i], unit: 'mm', onInput: x => { v.h[i] = x; upd(); } });
    hrow.push(F.ctrl.lastElementChild);
  }
  function draw(Ni, Nbt) {
    const W = 320, H = 260, n = v.rows, hs = v.h.slice(0, n), hm = Math.max.apply(null, hs.concat([100])), y0 = 235, s = 200 / hm, c = 'var(--acc)';
    const fm = Math.max.apply(null, Ni.map(Math.abs).concat([Nbt, 1])), k = 150 / fm;
    let g = '<line x1="60" y1="15" x2="60" y2="' + (y0 + 8) + '" stroke="currentColor" stroke-width="5"/>' +
      '<line x1="40" y1="' + y0 + '" x2="' + (W - 10) + '" y2="' + y0 + '" stroke="currentColor" stroke-dasharray="4 3"/>' +
      '<text x="64" y="' + (y0 + 18) + '">trục quay: tâm cánh nén</text>' +
      '<line x1="' + (70 + Nbt * k) + '" y1="10" x2="' + (70 + Nbt * k) + '" y2="' + y0 + '" stroke="#d33" stroke-dasharray="5 3"/>' +
      '<text x="' + (72 + Nbt * k) + '" y="20" fill="#d33">N_bt</text>';
    hs.forEach((h, i) => {
      const y = y0 - h * s, w = Math.max(0, Ni[i]) * k;
      g += '<circle cx="60" cy="' + y + '" r="5" fill="' + c + '"/><rect x="70" y="' + (y - 5) + '" width="' + w + '" height="10" fill="' + (Ni[i] > Nbt ? '#d33' : c) + '" fill-opacity=".6"/>' +
        '<text x="' + (74 + w) + '" y="' + (y + 4) + '">' + WC.f(Ni[i], 1) + ' kN</text><text x="8" y="' + (y + 4) + '">h' + (i + 1) + '=' + h + '</text>';
    });
    F.view.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:280px"><g font-size="11" fill="currentColor" font-family="sans-serif">' + g + '</g></svg>';
  }
  function upd() {
    hrow.forEach((r, i) => { r.style.display = i < v.rows ? '' : 'none'; });
    const n = v.rows * v.m, hs = v.h.slice(0, v.rows), S = hs.reduce((a, h) => a + h * h, 0), h1 = Math.max.apply(null, hs);
    const Nn = v.kN ? v.N / n : 0, Ni = hs.map(h => v.M * 1e6 * h / (v.m * S) / 1000 - Nn), Nt = v.M * 1e6 * h1 / (v.m * S) / 1000 - Nn;
    const [Ab, Abn] = AB[v.d], C = CAP[v.cap];
    const Nbt = C[1] * Abn / 1000, Nbv = C[0] * Ab * v.gb / 1000, Nbp = v.fcb * v.d * v.tp * v.gb / 1000, Ns = v.V / n;
    const rt = Nt / Nbt, i190 = Math.pow(Ns / Nbv, 2) + Math.pow(Math.max(Nt, 0) / Nbt, 2), rp = Ns / Math.min(Nbv, Nbp);
    const f = (x, k) => WC.f(x, k === undefined ? 1 : k);
    const rowsT = [
      ['$\\sum h_i^2$ (' + v.rows + ' hàng × ' + v.m + ')', f(S, 0) + ' mm²', ''],
      ['$N_{t,\\max}$ hàng $h_1$ = ' + h1 + ' mm', f(Nt) + ' kN', v.kN ? 'đã trừ $N/n$ = ' + f(Nn, 2) + ' kN' : 'bỏ qua $N$ nén'],
      ['$N_{bt} = f_{tb}A_{bn}$ (188), $f_{tb}$ = ' + C[1], f(Nbt) + ' kN', ''],
      ['Tỷ số kéo $N_t/N_{bt}$', f(rt, 2), WC.ok(rt <= 1)],
      ['$N_{bv} = f_{vb}A_b\\gamma_b$ (186), $f_{vb}$ = ' + C[0], f(Nbv) + ' kN', ''],
      ['$N_{bp} = f_{cb}d_b t_p\\gamma_b$ (187), $f_{cb}$ = ' + v.fcb, f(Nbp) + ' kN', ''],
      ['$N_s = V/n$', f(Ns, 2) + ' kN', 'tỷ số cắt/ép mặt ' + f(rp, 3)],
      ['Tương tác (190)', f(i190, 2), WC.ok(i190 <= 1 && rp <= 1)]
    ];
    if (C[2]) {
      const Nbt0 = C[3] * Abn / 1000, Nbv0 = C[2] * Ab * v.gb / 1000;
      rowsT.push(['TCXDVN 338: $N_{bt}$ ($f_{tb}$ = ' + C[3] + ')', f(Nbt0) + ' kN', { v: 'tỷ số ' + f(Nt / Nbt0, 2), cls: Nt / Nbt0 <= 1 ? 'pass' : 'fail' }]);
      rowsT.push(['TCXDVN 338: $N_{bv}$ ($f_{vb}$ = ' + C[2] + ')', f(Nbv0) + ' kN', 'bảng tính cũ không kiểm tra (190)']);
    } else rowsT.push(['TCXDVN 338', '–', 'bảng tính cũ không có cấp 10.9']);
    WC.table(F.out, rowsT, ['Đại lượng', 'Giá trị', 'Ghi chú']);
    draw(Ni, Nbt);
  }
  upd();
};
