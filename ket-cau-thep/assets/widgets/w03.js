/* W3 – Tiết diện thay đổi (Nonprismatic) H(300–650)x200x6x10: I33 dọc thanh, quy luật Linear/Parabolic/Cubic, chiều I→J (Bài 2.4) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W3'] = function (el) {
  const F = WC.frame(el, { title: 'W3 · Tiết diện thay đổi H(300–650)x200x6x10',
    tryText: 'so sánh sai số của ba quy luật EI33 tại giữa thanh; rồi bật "Vẽ cột từ đỉnh xuống chân" để thấy đầu lớn rơi xuống chân cột.' });
  const v = { h1: 300, h2: 650, bf: 200, tw: 6, tf: 10, law: 'par', rev: false };
  [['h1', 'Chiều cao đầu Start $h_I$', 200, 1000, 10, 'mm'], ['h2', 'Chiều cao đầu End $h_J$', 200, 1000, 10, 'mm'],
   ['bf', 'Bề rộng cánh $b_f$', 100, 400, 10, 'mm'], ['tw', 'Dày bụng $t_w$', 4, 16, 1, 'mm'], ['tf', 'Dày cánh $t_f$', 6, 30, 1, 'mm']]
    .forEach(([k, l, a, b, st, u]) => WC.slider(F.ctrl, { label: l, min: a, max: b, step: st, value: v[k], unit: u, onInput: x => { v[k] = x; upd(); } }));
  WC.select(F.ctrl, { label: 'EI33 Variation', options: [['lin', 'Linear'], ['par', 'Parabolic'], ['cub', 'Cubic']], value: 'par', onChange: x => { v.law = x; upd(); } });
  WC.check(F.ctrl, { label: 'Vẽ cột từ đỉnh xuống chân (I ở đỉnh)', checked: false, onChange: x => { v.rev = x; upd(); } });
  const LAW = { lin: 1, par: 2, cub: 3 }, COL = { exact: 'currentColor', lin: '#d9534f', par: '#2a9d8f', cub: '#e09b2d' };
  const I33 = h => (v.bf * h ** 3 - (v.bf - v.tw) * Math.max(0, h - 2 * v.tf) ** 3) / 12;      // mm4
  const interp = (law, x) => { const n = LAW[law], a = I33(v.h1) ** (1 / n), b = I33(v.h2) ** (1 / n); return (a + (b - a) * x) ** n; };
  const exact = x => I33(v.h1 + (v.h2 - v.h1) * x);
  function draw() {
    const W = 520, H = 300, top = 30, bot = 270, len = bot - top, s = 60 / Math.max(v.h1, v.h2, 1);
    // cột: chân ở dưới (y = bot), đỉnh ở trên. Không đảo: I ở chân; đảo: I ở đỉnh.
    const yI = v.rev ? top : bot, yJ = v.rev ? bot : top, wI = v.h1 * s, wJ = v.h2 * s, cx = 90;
    const wTop = v.rev ? wI : wJ, wBot = v.rev ? wJ : wI, c = 'var(--acc)';
    let g = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:320px" font-family="sans-serif" font-size="12">';
    g += '<polygon points="' + [cx - wBot / 2, bot, cx + wBot / 2, bot, cx + wTop / 2, top, cx - wTop / 2, top].join(' ') + '" fill="' + c + '" fill-opacity=".2" stroke="' + c + '"/>';
    g += '<line x1="' + (cx - 45) + '" y1="' + (bot + 6) + '" x2="' + (cx + 45) + '" y2="' + (bot + 6) + '" stroke="currentColor" stroke-width="2"/>';
    g += '<g fill="currentColor"><circle cx="' + cx + '" cy="' + yI + '" r="4"/><circle cx="' + cx + '" cy="' + yJ + '" r="4"/>' +
      '<text x="' + (cx + 8) + '" y="' + (yI + (v.rev ? 14 : -6)) + '">I</text><text x="' + (cx + 8) + '" y="' + (yJ + (v.rev ? -6 : 14)) + '">J</text>' +
      '<text x="' + (cx + Math.max(wTop, wBot) / 2 + 6) + '" y="' + (top + 4) + '">đỉnh h = ' + (v.rev ? v.h1 : v.h2) + '</text>' +
      '<text x="' + (cx + Math.max(wTop, wBot) / 2 + 6) + '" y="' + (bot - 2) + '">chân h = ' + (v.rev ? v.h2 : v.h1) + '</text></g>';
    g += '<line x1="' + (cx - 60) + '" y1="' + (yI + (v.rev ? 12 : -12)) + '" x2="' + (cx - 60) + '" y2="' + (yJ + (v.rev ? -12 : 12)) + '" stroke="currentColor" marker-end="url(#w3a)"/>' +
      '<defs><marker id="w3a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor"/></marker></defs>' +
      '<text x="' + (cx - 75) + '" y="' + (H / 2) + '" fill="currentColor" transform="rotate(-90 ' + (cx - 75) + ' ' + (H / 2) + ')" text-anchor="middle">trục 1 (I → J)</text>';
    // đồ thị I33(x)
    const px = 250, pw = 250, pt = top, ph = len, Imax = Math.max(I33(v.h1), I33(v.h2)) * 1.05;
    const X = x => px + x * pw, Y = I => pt + ph - I / Imax * ph;
    g += '<g stroke="currentColor" stroke-opacity=".5"><line x1="' + px + '" y1="' + (pt + ph) + '" x2="' + (px + pw) + '" y2="' + (pt + ph) + '"/><line x1="' + px + '" y1="' + pt + '" x2="' + px + '" y2="' + (pt + ph) + '"/></g>';
    g += '<g fill="currentColor"><text x="' + (px + pw) + '" y="' + (pt + ph + 16) + '" text-anchor="end">x/L từ I →</text><text x="' + px + '" y="' + (pt - 8) + '">I33 (cm4)</text>' +
      '<text x="' + (px - 4) + '" y="' + (Y(Imax / 1.05) + 4) + '" text-anchor="end">' + WC.f(Imax / 1.05 / 1e4, 0) + '</text></g>';
    const path = f => { let d = ''; for (let i = 0; i <= 40; i++) { const x = i / 40; d += (i ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(f(x)).toFixed(1); } return d; };
    g += '<path d="' + path(exact) + '" fill="none" stroke="currentColor" stroke-width="2.5"/>';
    ['lin', 'par', 'cub'].forEach((k, i) => {
      g += '<path d="' + path(x => interp(k, x)) + '" fill="none" stroke="' + COL[k] + '" stroke-width="' + (k === v.law ? 2.5 : 1.2) + '" stroke-dasharray="6 4"/>' +
        '<text x="' + (px + 8) + '" y="' + (pt + 14 + 15 * i) + '" fill="' + COL[k] + '">- - ' + { lin: 'Linear', par: 'Parabolic', cub: 'Cubic' }[k] + '</text>';
    });
    g += '<text x="' + (px + 8) + '" y="' + (pt + 59) + '" fill="currentColor">—— chính xác</text></svg>';
    F.view.innerHTML = g;
  }
  function upd() {
    const rows = [0, 0.25, 0.5, 0.75, 1].map(x => {
      const h = v.h1 + (v.h2 - v.h1) * x, Ie = exact(x), Ii = interp(v.law, x), e = (Ii / Ie - 1) * 100;
      return [WC.f(x, 2), WC.f(h, 1), WC.f(Ie / 1e4, 0), WC.f(Ii / 1e4, 0), { v: (e >= 0 ? '+' : '') + WC.f(e, 1) + ' %', cls: Math.abs(e) <= 5 ? 'pass' : 'warn' }];
    });
    const err = k => { let m = 0; for (let i = 1; i < 40; i++) { const x = i / 40, e = interp(k, x) / exact(x) - 1; if (Math.abs(e) > Math.abs(m)) m = e; } return (m >= 0 ? '+' : '') + WC.f(m * 100, 1) + ' %'; };
    const ok = !v.rev === (v.h2 >= v.h1);
    rows.push(['Sai số lớn nhất', 'Linear ' + err('lin'), 'Parabolic ' + err('par'), 'Cubic ' + err('cub'), '']);
    rows.push(['Chân cột', { v: 'h = ' + (v.rev ? v.h2 : v.h1) + ' mm', cls: ok ? 'pass' : 'fail' }, { v: ok ? 'Đầu nhỏ ở chân – đúng' : 'Đầu lớn ở chân – sai chiều, dùng Reverse Connectivity', cls: ok ? 'pass' : 'fail' }, '', '']);
    WC.table(F.out, rows, ['$x/L$ (từ I)', '$h$ (mm)', '$I_{33}$ chính xác (cm⁴)', '$I_{33}$ SAP (cm⁴)', 'Sai số']);
    draw();
  }
  upd();
};
