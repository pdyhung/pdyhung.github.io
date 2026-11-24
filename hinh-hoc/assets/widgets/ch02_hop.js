/* ch02_hop.js — Trình phát dãy phép biến hình: thêm bước, phát hoạt ảnh, tua lại, đổi thứ tự (Bài 3, Chương 2). */
(function () {
  'use strict';
  var F = [[0, 0], [0, 3], [2, 3], [2, 2.4], [0.6, 2.4], [0.6, 1.8], [1.5, 1.8], [1.5, 1.2], [0.6, 1.2], [0.6, 0]];
  var PRESETS = {
    song_song: { A: [-1, -1], steps: [{ type: 'dxt', x0: 0, y0: 0, phi: 90 }, { type: 'dxt', x0: 2, y0: 0, phi: 90 }] },
    cat_nhau: { A: [1, 1], steps: [{ type: 'dxt', x0: 0, y0: 0, phi: 0 }, { type: 'dxt', x0: 0, y0: 0, phi: 45 }] },
    quay_tt: { A: [1, 1], steps: [{ type: 'quay', x0: 0, y0: 0, alpha: 90 }, { type: 'tt', a: 3, b: 0 }] },
    tt_quay: { A: [1, 1], steps: [{ type: 'tt', a: 3, b: 0 }, { type: 'quay', x0: 0, y0: 0, alpha: 90 }] },
    truot: { A: [-5, 1], steps: [{ type: 'tt', a: 4, b: 0 }, { type: 'dxt', x0: 0, y0: 0, phi: 0 }] },
    hai_quay: { A: [1, 1], steps: [{ type: 'quay', x0: 0, y0: 0, alpha: 90 }, { type: 'quay', x0: 2, y0: 0, alpha: -90 }] }
  };
  var MAX = 6;
  GeoWidget.register('ch02_hop', function (ui, el) {
    var X = CH02, f = X.f;
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    var pre = PRESETS[el.getAttribute('data-preset') || 'song_song'];
    var st = { A: pre.A.slice(), steps: clone(pre.steps), cur: 0, t: 0, playing: false, mode: 'all', last: 0, sel: null, draft: X.make('tt', { a: 3, b: 0 }) };

    ui.select({ label: 'Ví dụ có sẵn', value: el.getAttribute('data-preset') || 'song_song', options: [['song_song', 'Hai đối xứng trục song song'], ['cat_nhau', 'Hai đối xứng trục cắt nhau'],
      ['quay_tt', 'Quay 90° rồi tịnh tiến'], ['tt_quay', 'Tịnh tiến rồi quay 90°'], ['truot', 'Tịnh tiến dọc trục rồi đối xứng trục'], ['hai_quay', 'Hai phép quay ngược chiều']],
      onChange: function (v) { var p = PRESETS[v]; st.A = p.A.slice(); st.steps = clone(p.steps); st.sel = null; rewind(); rebuildAll(); } });
    var g = ui.group('Soạn bước (nhập số)');
    var gsel = document.createElement('select'); gsel.setAttribute('aria-label', 'Loại phép biến hình');
    [['tt', 'Phép tịnh tiến'], ['quay', 'Phép quay'], ['dxt', 'Phép đối xứng trục'], ['dxtam', 'Phép đối xứng tâm']].forEach(function (o) { var x = document.createElement('option'); x.value = o[0]; x.textContent = o[1]; gsel.appendChild(x); });
    gsel.style.width = '100%'; var gbox = document.createElement('div'); gbox.className = 'ctl'; gbox.appendChild(gsel); g.appendChild(gbox);
    function editing() { return st.sel != null ? st.steps[st.sel] : st.draft; }
    gsel.addEventListener('change', function () {
      var T = X.make(gsel.value, editing());
      if (st.sel != null) { st.steps[st.sel] = T; rewind(); rebuildAll(); } else { st.draft = T; pp.show(T); }
    });
    var pp = X.paramPanel(ui, g, 3, function (i, v) { var T = editing(); T[pp.key(T, i)] = v; if (st.sel != null) { rewind(); rebuildAll(); } });
    var erow = document.createElement('div'); erow.className = 'ctl-row'; g.appendChild(erow);
    var addBtn = ui.button(erow, '+ Thêm bước', function () {
      if (st.steps.length >= MAX) return;
      st.steps.push(clone(editing())); st.sel = null; rewind(); rebuildAll();
    });
    var list = document.createElement('div'); list.className = 'ctl'; ui.side.appendChild(list);
    var r1 = ui.row();
    ui.button(r1, '▶ Phát', function () { if (st.cur >= st.steps.length) rewind(); st.mode = 'all'; st.playing = st.steps.length > 0; st.last = 0; });
    ui.button(r1, '⏭ Một bước', function () { if (st.cur >= st.steps.length) return; st.mode = 'one'; st.playing = true; st.last = 0; }, 'btn secondary');
    ui.button(r1, '⏮ Tua lại', function () { rewind(); upd(); }, 'btn secondary');
    var r2 = ui.row();
    ui.button(r2, '⇄ Đảo thứ tự', function () { st.steps.reverse(); st.sel = null; rewind(); rebuildAll(); }, 'chip');
    ui.button(r2, 'Xem kết quả', function () { st.playing = false; st.cur = st.steps.length; st.t = 0; upd(); }, 'chip');
    ui.button(r2, 'Xóa hết', function () { st.steps = []; st.sel = null; rewind(); rebuildAll(); }, 'chip');
    var ga = ui.group('Điểm A của hình (nhập số hoặc kéo)');
    var inA = [0, 1].map(function (j) { return ui.number({ label: j ? 'Tung độ' : 'Hoành độ', value: st.A[j], min: -20, max: 20, onChange: function (v) { st.A[j] = v; B.build(draw); } }, ga); });
    var out = ui.readout([['n', 'Số bước'], ['cur', 'Đang ở'], ['A', 'A → ảnh hiện tại'], ['Af', 'Ảnh cuối của A'], ['kq', 'Hợp các bước là']]);

    var B = GeoWidget.board2d(ui, { bbox: [-8, 7, 8, -7], ratio: 1.1, maxH: 680, axis: true, grid: true, aria: 'Hình chữ F và các ảnh của nó qua dãy phép biến hình' });
    var badge = document.createElement('div'); badge.className = 'badge'; ui.stage.appendChild(badge);

    function base() { return F.map(function (p) { return [p[0] + st.A[0], p[1] + st.A[1]]; }); }
    function mapUpTo(p, k, t) { var q = p; for (var i = 0; i < k; i++) q = X.apply(st.steps[i], q); if (t > 0 && k < st.steps.length) q = X.apply(st.steps[k], q, t); return q; }
    function curPts() { if (st.cur === 0 && st.t === 0) return []; return base().map(function (p) { return mapUpTo(p, st.cur, st.t); }); }
    function rewind() { st.playing = false; st.cur = 0; st.t = 0; }
    function renderList() {
      var h = '<label>Dãy phép biến hình (thực hiện từ trên xuống)</label>';
      if (!st.steps.length) h += '<div class="ctl-note">Chưa có bước nào. Soạn ở trên rồi bấm “+ Thêm bước”.</div>';
      list.innerHTML = h;
      st.steps.forEach(function (T, i) {
        var r = document.createElement('div'); r.className = 'ctl-row'; r.style.alignItems = 'center';
        var b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (st.sel === i ? ' active' : '');
        b.textContent = (i + 1) + '. ' + X.name(T); b.title = 'Bấm để sửa bước này'; b.style.textAlign = 'left'; b.style.flex = '1';
        if (i === st.cur - 1 || (st.t > 0 && i === st.cur)) b.style.fontWeight = '700';
        b.addEventListener('click', function () { st.sel = st.sel === i ? null : i; syncEditor(); renderList(); });
        r.appendChild(b);
        ui.button(r, '↑', function () { if (i > 0) { var t = st.steps[i]; st.steps[i] = st.steps[i - 1]; st.steps[i - 1] = t; st.sel = null; rewind(); rebuildAll(); } }, 'chip').title = 'Đưa lên trước';
        ui.button(r, '×', function () { st.steps.splice(i, 1); st.sel = null; rewind(); rebuildAll(); }, 'chip').title = 'Xóa bước';
        list.appendChild(r);
      });
      addBtn.disabled = st.steps.length >= MAX;
      addBtn.textContent = st.sel != null ? '+ Thêm bản sao' : '+ Thêm bước';
    }
    function syncEditor() { var T = editing(); gsel.value = T.type; pp.show(T); }
    function upd() {
      var n = st.steps.length, A0 = st.A, Ac = mapUpTo(A0, st.cur, st.t), Af = mapUpTo(A0, n, 0);
      out('n', String(n));
      out('cur', st.t > 0 ? 'đang thực hiện bước ' + (st.cur + 1) : st.cur === 0 ? 'hình ban đầu' : 'xong bước ' + st.cur + '/' + n);
      out('A', X.P(A0) + ' → ' + X.P(Ac)); out('Af', X.P(Af));
      out('kq', n ? X.classify(function (p) { return mapUpTo(p, n, 0); }).text : '—');
      badge.textContent = st.t > 0 ? 'Bước ' + (st.cur + 1) + '/' + n : st.cur + '/' + n + ' bước';
      [0, 1].forEach(function (j) { if (document.activeElement !== inA[j]) inA[j].value = +st.A[j].toFixed(2); });
      if (B && B.board) B.board.update();
    }
    function rebuildAll() { renderList(); syncEditor(); B.build(draw); }
    function draw(board, C) {
      var cols = [C.purple, C.green, C.red, C.yellow, C.blue, C.orange];
      st.steps.forEach(function (T, i) {
        var col = cols[i % cols.length], nm = String(i + 1);
        if (T.type === 'dxt') board.create('line', [[T.x0, T.y0], [T.x0 + Math.cos(T.phi * X.D), T.y0 + Math.sin(T.phi * X.D)]],
          { strokeColor: col, strokeWidth: 2, dash: 2, fixed: true, name: 'd' + nm, withLabel: true, label: { strokeColor: col, position: 'rt', offset: [-14, 12] } });
        else if (T.type === 'quay' || T.type === 'dxtam') board.create('point', [T.x0, T.y0], { name: 'O' + nm, fixed: true, size: 3, color: col, label: { strokeColor: col, offset: [6, -12] } });
        else board.create('arrow', [[0, 0], [T.a, T.b]], { strokeColor: col, strokeWidth: 2.5, fixed: true, name: 'v' + nm, withLabel: true, label: { strokeColor: col } });
        (function (i, col) {
          X.shape(board, function () { return i < st.cur ? base().map(function (p) { return mapUpTo(p, i + 1, 0); }) : []; },
            { strokeColor: col, strokeWidth: 1.5, dash: 2, fillColor: 'none', fixed: true, highlight: false });
          board.create('text', [function () { return i < st.cur ? mapUpTo(st.A, i + 1, 0)[0] + 0.15 : -100; }, function () { return mapUpTo(st.A, i + 1, 0)[1] + 0.3; }, '(' + (i + 1) + ')'],
            { strokeColor: col, fontSize: 13, fixed: true, highlight: false });
        })(i, col);
      });
      X.shape(board, base, { strokeColor: C.blue, strokeWidth: 2, fillColor: C.fillBlue, fillOpacity: 1, fixed: true, highlight: false });
      X.shape(board, curPts, { strokeColor: C.orange, strokeWidth: 2.5, fillColor: C.fillOrange, fillOpacity: 1, fixed: true, highlight: false });
      board.create('point', [function () { return mapUpTo(st.A, st.cur, st.t)[0]; }, function () { return mapUpTo(st.A, st.cur, st.t)[1]; }],
        { name: 'A′', size: 3, color: C.orange, fixed: true, visible: function () { return st.cur > 0 || st.t > 0; } });
      var PA = board.create('point', st.A, { name: 'A', size: 4, color: C.blue });
      PA.on('drag', function () { st.A = [PA.X(), PA.Y()]; upd(); });
      upd();
    }
    renderList(); syncEditor();
    if (B) {
      B.build(draw);
      ui.loop(function (now) {
        if (!st.playing) { st.last = 0; return; }
        var dt = st.last ? Math.min(100, now - st.last) : 16; st.last = now;
        st.t += dt / 1400;
        if (st.t >= 1) {
          st.t = 0; st.cur++;
          if (st.mode === 'one' || st.cur >= st.steps.length) st.playing = false;
          renderList();
        }
        upd();
      });
    }
    el.__debug = function () { return st; };
  });
})();
