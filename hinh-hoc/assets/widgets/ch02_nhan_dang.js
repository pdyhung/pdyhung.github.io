/* ch02_nhan_dang.js — Trò chơi nhận dạng phép biến hình: cho hình và ảnh, đoán loại và tham số (Bài 4, Chương 2). */
(function () {
  'use strict';
  var F = [[0, 0], [0, 3], [2, 3], [2, 2.4], [0.6, 2.4], [0.6, 1.8], [1.5, 1.8], [1.5, 1.2], [0.6, 1.2], [0.6, 0]];
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  GeoWidget.register('ch02_nhan_dang', function (ui, el) {
    var X = CH02, f = X.f;
    var st = { A: [1, 0], secret: null, guess: X.make('tt', { a: 0, b: 0 }), round: 0, score: 0, tries: 0, solved: false, showAns: false };
    var OPTS = [['tt', 'Phép tịnh tiến'], ['quay', 'Phép quay'], ['dxt', 'Phép đối xứng trục'], ['dxtam', 'Phép đối xứng tâm'], ['vitu', 'Phép vị tự']];

    function gen() {
      var kinds = ['tt', 'quay', 'dxt', 'dxtam', 'vitu'], T, A, ok = false, guard = 0;
      var want = pick(kinds);
      while (!ok && guard++ < 500) {
        A = [rnd(-4, 2), rnd(-3, 1)];
        if (want === 'tt') { T = { type: 'tt', a: rnd(-6, 6), b: rnd(-5, 5) }; if (Math.abs(T.a) + Math.abs(T.b) < 3) continue; }
        else if (want === 'quay') T = { type: 'quay', x0: rnd(-2, 2), y0: rnd(-2, 2), alpha: pick([90, -90, 90, -90, 180]) };
        else if (want === 'dxt') { var phi = pick([0, 90, 45, 135]), x0 = rnd(-2, 2); T = { type: 'dxt', x0: x0, y0: phi === 0 ? rnd(-2, 2) : 0, phi: phi }; }
        else if (want === 'dxtam') T = { type: 'dxtam', x0: rnd(-2, 2), y0: rnd(-2, 2) };
        else T = { type: 'vitu', x0: rnd(-2, 2), y0: rnd(-2, 2), k: pick([2, -2, 0.5, -0.5, 1.5, -1.5]) };
        var pts = F.map(function (p) { return [p[0] + A[0], p[1] + A[1]]; }), im = pts.map(function (p) { return X.apply(T, p); });
        ok = im.concat(pts).every(function (p) { return Math.abs(p[0]) <= 7.4 && Math.abs(p[1]) <= 6.4; });
        if (ok) { var c = [0, 0]; im.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; }); ok = X.dist(pts[0], im[0]) > 1.5 || T.type !== 'tt'; }
      }
      st.A = A; st.secret = T; st.round++; st.tries = 0; st.solved = false; st.showAns = false;
    }
    function base() { return F.map(function (p) { return [p[0] + st.A[0], p[1] + st.A[1]]; }); }
    function target() { return base().map(function (p) { return X.apply(st.secret, p); }); }
    function guessPts() { return base().map(function (p) { return X.apply(st.guess, p); }); }
    function err() { var a = target(), b = guessPts(), m = 0; a.forEach(function (p, i) { m = Math.max(m, X.dist(p, b[i])); }); return m; }

    var tsel = ui.select({ label: 'Bạn đoán: phép biến hình là', value: 'tt', options: OPTS, onChange: function (v) { st.guess = X.make(v, st.guess); pp.show(st.guess); B.build(draw); } });
    var g = ui.group('Tham số dự đoán (nhập số; kéo điểm tím)');
    var pp = X.paramPanel(ui, g, 3, function (i, v) { st.guess[pp.key(st.guess, i)] = v; B.build(draw); });
    var r = ui.row();
    ui.button(r, '✔ Kiểm tra', check);
    ui.button(r, 'Câu mới', function () { gen(); say(''); B.build(draw); }, 'btn secondary');
    var r2 = ui.row();
    ui.button(r2, 'Gợi ý', hint, 'chip');
    ui.button(r2, 'Xem đáp án', function () { st.showAns = true; say('Đáp án: ' + X.name(st.secret) + '.', ''); B.build(draw); }, 'chip');
    var say = X.note(ui);
    var out = ui.readout([['round', 'Câu / điểm'], ['len', 'Cạnh dài của F: trước → sau'], ['dir', 'Hướng của hình'], ['mine', 'Phép bạn chọn'], ['err', 'Lệch so với ảnh thật']]);

    var B = GeoWidget.board2d(ui, { bbox: [-8, 7, 8, -7], ratio: 0.9, maxH: 560, axis: true, grid: true, aria: 'Hình F màu xanh và ảnh màu cam; hình nét đứt xanh lá là ảnh theo dự đoán của bạn' });
    function check() {
      st.tries++;
      var e = err();
      if (e < 0.05) {
        if (!st.solved && !st.showAns) st.score++;
        st.solved = true;
        var same = st.guess.type === st.secret.type ? '' : ' (Phép của bạn khác tên nhưng cho cùng kết quả: ' + X.name(st.secret) + '.)';
        say('Đúng rồi! ' + X.name(st.guess) + '.' + same, 'ok');
      } else {
        var reason = st.guess.type === st.secret.type || (st.guess.type === 'quay' && st.secret.type === 'dxtam') ? 'Đúng loại, nhưng tham số chưa khớp.' : 'Chưa đúng loại phép biến hình.';
        say('Chưa đúng (lệch tối đa ' + f(e) + ' đơn vị). ' + reason, 'bad');
      }
      refresh();
    }
    function hint() {
      var s = st.secret, h;
      var d = X.area(base()) * X.area(target()) > 0;
      var l = X.dist(target()[0], target()[9]) / X.dist(base()[0], base()[9]);
      if (Math.abs(l - 1) > 1e-6) h = 'Độ dài thay đổi (nhân ' + f(l) + ') nên đây không là phép dời hình. Tâm nằm trên đường thẳng nối một điểm với ảnh của nó.';
      else if (!d) h = 'Hình bị lật (đổi hướng), độ dài giữ nguyên: nghĩ tới phép đối xứng trục. Trục là đường trung trực của đoạn nối A với ảnh của A.';
      else if (s.type === 'tt') h = 'Hình không xoay, không lật: mọi điểm dời cùng một vectơ. Lấy tọa độ ảnh của A trừ tọa độ A.';
      else h = 'Hình bị xoay nhưng không lật: phép quay (hoặc đối xứng tâm nếu xoay 180°). Tâm cách đều mỗi điểm và ảnh của nó.';
      say('Gợi ý: ' + h, '');
    }
    function refresh() {
      out('round', 'Câu ' + st.round + ' · ' + st.score + ' điểm');
      var b = base(), t = target();
      out('len', f(X.dist(b[0], b[1])) + ' → ' + f(X.dist(t[0], t[1])));
      out('dir', X.area(b) * X.area(t) > 0 ? 'giữ nguyên' : 'bị lật (đổi hướng)');
      out('mine', X.name(st.guess));
      out('err', f(err()));
      pp.show(st.guess);
    }
    function draw(board, C) {
      X.shape(board, base, { strokeColor: C.blue, strokeWidth: 2, fillColor: C.fillBlue, fillOpacity: 1, fixed: true, highlight: false });
      X.shape(board, target, { strokeColor: C.orange, strokeWidth: 2, fillColor: C.fillOrange, fillOpacity: 1, fixed: true, highlight: false });
      X.shape(board, guessPts, { strokeColor: C.green, strokeWidth: 2, dash: 2, fillColor: 'none', fixed: true, highlight: false });
      board.create('point', st.A, { name: 'A', fixed: true, size: 3, color: C.blue });
      board.create('point', [function () { return target()[0][0]; }, function () { return target()[0][1]; }], { name: 'A′', fixed: true, size: 3, color: C.orange });
      var G = st.guess;
      if (G.type === 'tt') {
        var V = board.create('point', [st.A[0] + G.a, st.A[1] + G.b], { name: '', size: 4, color: C.purple });
        board.create('arrow', [[st.A[0], st.A[1]], V], { strokeColor: C.purple, strokeWidth: 2.5 });
        V.on('drag', function () { G.a = V.X() - st.A[0]; G.b = V.Y() - st.A[1]; refresh(); board.update(); });
      } else {
        var Ctr = board.create('point', [G.x0, G.y0], { name: G.type === 'dxt' ? 'I' : 'O', size: 4, color: C.purple });
        Ctr.on('drag', function () { G.x0 = Ctr.X(); G.y0 = Ctr.Y(); refresh(); board.update(); });
        if (G.type === 'dxt') board.create('line', [Ctr, [function () { return G.x0 + Math.cos(G.phi * X.D); }, function () { return G.y0 + Math.sin(G.phi * X.D); }]], { strokeColor: C.purple, dash: 2, strokeWidth: 1.5, fixed: true });
      }
      if (st.showAns) {
        var S = st.secret;
        if (S.type === 'dxt') board.create('line', [[S.x0, S.y0], [S.x0 + Math.cos(S.phi * X.D), S.y0 + Math.sin(S.phi * X.D)]], { strokeColor: C.red, strokeWidth: 2, fixed: true });
        else if (S.type === 'tt') board.create('arrow', [st.A, target()[0]], { strokeColor: C.red, strokeWidth: 2, fixed: true });
        else board.create('point', [S.x0, S.y0], { name: 'tâm', fixed: true, size: 4, color: C.red });
      }
      refresh();
    }
    gen(); pp.show(st.guess);
    if (B) B.build(draw);
    tsel.value = st.guess.type;
    el.__debug = function () { return st; };
    el.__newRound = function (T, A) { st.secret = T; st.A = A || st.A; st.solved = false; st.showAns = false; B.build(draw); };
  });
})();
