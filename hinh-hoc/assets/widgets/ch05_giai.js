/* ch05_giai.js — Bài 5: Giải tam giác vuông.
   Tam giác ABC vuông tại A: a = BC (cạnh huyền), b = AC, c = AB.
   Chọn hai yếu tố đã biết, nhập số (hoặc kéo B, C) → tính các yếu tố còn lại, hiện từng bước. */
(function () {
  'use strict';
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var RAD = Math.PI / 180;

  /* đặt khung nhìn [x0, y1, x1, y0] giữ tỉ lệ 1:1, mở rộng chiều thiếu (không cắt nội dung) */
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }

  var CASES = {
    cc: { name: 'Hai cạnh góc vuông (b, c)', ps: [['b', 'b = AC'], ['c', 'c = AB']] },
    hc: { name: 'Cạnh huyền và một cạnh góc vuông (a, c)', ps: [['a', 'a = BC'], ['c', 'c = AB']] },
    hg: { name: 'Cạnh huyền và góc nhọn (a, B̂)', ps: [['a', 'a = BC'], ['B', 'Góc B (°)']] },
    kg: { name: 'Cạnh góc vuông và góc nhọn kề (c, B̂)', ps: [['c', 'c = AB'], ['B', 'Góc B (°)']] },
    dg: { name: 'Cạnh góc vuông và góc nhọn đối (b, B̂)', ps: [['b', 'b = AC'], ['B', 'Góc B (°)']] }
  };

  GeoWidget.register('ch05_giai', function (ui, el) {
    var st = { mode: el.getAttribute('data-mode') || 'cc', b: 3, c: 4 };
    // giá trị nhập cho từng trường hợp
    var K = { cc: { b: 3, c: 4 }, hc: { a: 10, c: 6 }, hg: { a: 8, B: 35 }, kg: { c: 5, B: 40 }, dg: { b: 4, B: 28 } };
    (el.getAttribute('data-known') || '').split(',').forEach(function (kv) { var p = kv.split('='); if (p.length === 2) K[st.mode][p[0].trim()] = +p[1]; });

    ui.select({ label: 'Đã biết', value: st.mode, options: Object.keys(CASES).map(function (k) { return [k, CASES[k].name]; }), onChange: function (v) { st.mode = v; inputs(); solve(); B.build(draw); fit(); } });
    var box = ui.group('Hai yếu tố đã biết (nhập số)');
    var ins = {};
    var setOut = ui.readout([['a', 'a = BC'], ['b', 'b = AC'], ['c', 'c = AB'], ['B', 'Góc B'], ['C', 'Góc C'], ['S', 'Diện tích']]);
    var steps = document.createElement('div'); steps.className = 'ctl-note'; steps.style.cssText = 'font-size:14px;color:var(--text)'; ui.side.appendChild(steps);

    function inputs() {
      [].slice.call(box.querySelectorAll('.ctl')).forEach(function (c) { c.remove(); }); ins = {};
      CASES[st.mode].ps.forEach(function (p) {
        var ang = p[0] === 'B';
        ins[p[0]] = ui.number({ label: p[1], value: K[st.mode][p[0]], min: ang ? 0.5 : 0.01, max: ang ? 89.5 : 1000, onChange: function (v) { K[st.mode][p[0]] = v; solve(); B.build(draw); fit(); } }, box);
      });
    }
    /* từ dữ kiện → (b, c); trả về danh sách bước giải (chuỗi HTML) hoặc lỗi */
    function solve() {
      var k = K[st.mode], s = [], a, b, c, Bd;
      switch (st.mode) {
        case 'cc': b = k.b; c = k.c; a = Math.hypot(b, c); Bd = Math.atan2(b, c) / RAD;
          s.push('a = √(b² + c²) = √(' + f(b) + '² + ' + f(c) + '²) ≈ ' + f(a));
          s.push('tan B = b/c = ' + f(b) + '/' + f(c) + ' ≈ ' + f(b / c, 4) + ' ⇒ B̂ ≈ ' + f(Bd) + '°'); break;
        case 'hc': a = k.a; c = k.c;
          if (c >= a) { st.err = 'Cạnh huyền a phải lớn hơn cạnh góc vuông c.'; return; }
          b = Math.sqrt(a * a - c * c); Bd = Math.acos(c / a) / RAD;
          s.push('b = √(a² − c²) = √(' + f(a) + '² − ' + f(c) + '²) ≈ ' + f(b));
          s.push('cos B = c/a = ' + f(c) + '/' + f(a) + ' ≈ ' + f(c / a, 4) + ' ⇒ B̂ ≈ ' + f(Bd) + '°'); break;
        case 'hg': a = k.a; Bd = k.B; b = a * Math.sin(Bd * RAD); c = a * Math.cos(Bd * RAD);
          s.push('b = a·sin B = ' + f(a) + '·sin ' + f(Bd) + '° ≈ ' + f(b));
          s.push('c = a·cos B = ' + f(a) + '·cos ' + f(Bd) + '° ≈ ' + f(c)); break;
        case 'kg': c = k.c; Bd = k.B; b = c * Math.tan(Bd * RAD); a = c / Math.cos(Bd * RAD);
          s.push('b = c·tan B = ' + f(c) + '·tan ' + f(Bd) + '° ≈ ' + f(b));
          s.push('a = c / cos B = ' + f(c) + ' / cos ' + f(Bd) + '° ≈ ' + f(a)); break;
        case 'dg': b = k.b; Bd = k.B; c = b / Math.tan(Bd * RAD); a = b / Math.sin(Bd * RAD);
          s.push('c = b / tan B = ' + f(b) + ' / tan ' + f(Bd) + '° ≈ ' + f(c));
          s.push('a = b / sin B = ' + f(b) + ' / sin ' + f(Bd) + '° ≈ ' + f(a)); break;
      }
      s.push('Ĉ = 90° − B̂ ≈ 90° − ' + f(Bd) + '° = ' + f(90 - Bd) + '°');
      st.err = ''; st.b = b; st.c = c; st.steps = s;
    }
    /* sau khi kéo: suy lại các giá trị đã biết từ hình */
    function fromFigure() {
      var a = Math.hypot(st.b, st.c), Bd = Math.atan2(st.b, st.c) / RAD, k = K[st.mode];
      var all = { a: a, b: st.b, c: st.c, B: Bd };
      Object.keys(k).forEach(function (p) { k[p] = +all[p].toFixed(p === 'B' ? 2 : 3); if (ins[p]) { ins[p].value = k[p]; ins[p].classList.remove('invalid'); } });
      solve();
    }
    function refresh() {
      if (st.err) { ['a', 'b', 'c', 'B', 'C', 'S'].forEach(function (k) { setOut(k, '—'); }); steps.textContent = st.err; return; }
      var a = Math.hypot(st.b, st.c), Bd = Math.atan2(st.b, st.c) / RAD;
      setOut('a', f(a)); setOut('b', f(st.b)); setOut('c', f(st.c)); setOut('B', f(Bd) + '°'); setOut('C', f(90 - Bd) + '°'); setOut('S', f(st.b * st.c / 2));
      steps.innerHTML = '<b>Các bước giải</b><ol style="margin:4px 0 0;padding-left:1.3em">' + st.steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
    }
    function fit() { if (!B || !B.board || st.err) return; var m = Math.max(st.b, st.c), p = 0.18 * m; setBB(B, [-p * 1.2, st.b + p, st.c + p * 1.2, -1.8 * p]); }

    var B = GeoWidget.board2d(ui, { bbox: [-1, 5, 6, -1.5], ratio: 0.8, aria: 'Tam giác ABC vuông tại A cần giải' });
    function draw(board, C) {
      if (st.err) { board.create('text', [0, 0, st.err], { strokeColor: C.red, fixed: true }); refresh(); return; }
      var known = CASES[st.mode].ps.map(function (p) { return p[0]; });
      var col = function (k) { return known.indexOf(k) >= 0 ? C.orange : C.blue; };
      var A = board.create('point', [0, 0], { name: 'A', fixed: true, size: 3, color: C.muted, label: { offset: [-16, -12] } });
      var PB = board.create('point', [st.c, 0], { name: 'B', size: 5, color: C.blue, label: { offset: [6, -14] } });
      var PC = board.create('point', [0, st.b], { name: 'C', size: 5, color: C.blue, label: { offset: [-18, 8] } });
      board.create('polygon', [A, PB, PC], { fillColor: C.fillBlue, fillOpacity: 1, borders: { visible: false }, vertices: { visible: false }, fixed: true, highlight: false });
      board.create('segment', [PB, PC], { strokeColor: col('a'), strokeWidth: known.indexOf('a') >= 0 ? 4 : 2, fixed: true, highlight: false });
      board.create('segment', [A, PC], { strokeColor: col('b'), strokeWidth: known.indexOf('b') >= 0 ? 4 : 2, fixed: true, highlight: false });
      board.create('segment', [A, PB], { strokeColor: col('c'), strokeWidth: known.indexOf('c') >= 0 ? 4 : 2, fixed: true, highlight: false });
      var m = function () { return Math.min(st.b, st.c); };
      board.create('angle', [PB, A, PC], { radius: function () { return 0.12 * m(); }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
      board.create('nonreflexangle', [PC, PB, A], { radius: function () { return 0.3 * m(); }, name: function () { return f(Math.atan2(st.b, st.c) / RAD, 1) + '°'; }, fillColor: known.indexOf('B') >= 0 ? C.fillOrange : C.fillGreen, strokeColor: known.indexOf('B') >= 0 ? C.orange : C.green, fixed: true, label: { strokeColor: known.indexOf('B') >= 0 ? C.orange : C.green } });
      board.create('nonreflexangle', [A, PC, PB], { radius: function () { return 0.3 * m(); }, name: function () { return f(90 - Math.atan2(st.b, st.c) / RAD, 1) + '°'; }, fillColor: C.fillGreen, strokeColor: C.green, fixed: true, label: { strokeColor: C.green } });
      var M = function () { return Math.max(st.b, st.c); };
      board.create('text', [function () { return st.c / 2; }, function () { return -0.05 * M(); }, function () { return 'c = ' + f(st.c); }], { strokeColor: col('c'), fixed: true, anchorX: 'middle', anchorY: 'top' });
      board.create('text', [function () { return -0.04 * M(); }, function () { return st.b / 2; }, function () { return 'b = ' + f(st.b); }], { strokeColor: col('b'), fixed: true, anchorX: 'right' });
      board.create('text', [function () { return st.c / 2 + 0.03 * M(); }, function () { return st.b / 2 + 0.03 * M(); }, function () { return 'a = ' + f(Math.hypot(st.b, st.c)); }], { strokeColor: col('a'), fixed: true, anchorX: 'left', anchorY: 'bottom' });
      PB.on('drag', function () { st.c = Math.max(0.05, PB.X()); PB.moveTo([st.c, 0]); fromFigure(); refresh(); });
      PC.on('drag', function () { st.b = Math.max(0.05, PC.Y()); PC.moveTo([0, st.b]); fromFigure(); refresh(); });
      PB.on('up', fit); PC.on('up', fit);
      refresh();
    }
    inputs(); solve();
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return { st: st, K: K }; };
  });
})();
