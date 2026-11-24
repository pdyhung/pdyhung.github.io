/* ch05_dac_biet.js — Bài 2: Tam giác vuông đặc biệt 45°–45°–90° và 30°–60°–90°.
   Chọn loại tam giác và cạnh đã biết, nhập độ dài (hoặc kéo đỉnh B) → các cạnh còn lại, dạng căn và thập phân.
   Hình mờ nét đứt: nửa hình vuông (45°) hoặc nửa tam giác đều (30°–60°). */
(function () {
  'use strict';

  /* đặt khung nhìn [x0, y1, x1, y0] giữ tỉ lệ 1:1, mở rộng chiều thiếu (không cắt nội dung) */
  function setBB(B, bb) {
    var bd = B.board, w = bd.canvasWidth || 500, h = bd.canvasHeight || 360;
    var x0 = bb[0], y1 = bb[1], x1 = bb[2], y0 = bb[3], sx = (x1 - x0) / w, sy = (y1 - y0) / h, e;
    if (sx > sy) { e = (sx * h - (y1 - y0)) / 2; y0 -= e; y1 += e; } else { e = (sy * w - (x1 - x0)) / 2; x0 -= e; x1 += e; }
    bd.setBoundingBox([x0, y1, x1, y0], false);
  }
  var f = function (x, d) { return GeoWidget.fmt(x, d == null ? 2 : d); };
  var S2 = Math.SQRT2, S3 = Math.sqrt(3);
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  /* biểu diễn val·p/q·√r ở dạng chính xác (nếu val là số nguyên) */
  function exact(val, p, q, r) {
    var root = r === 1 ? '' : '√' + r, isInt = Math.abs(val - Math.round(val)) < 1e-9;
    if (!isInt) { var v = val * p / q; return (Math.abs(v - 1) < 1e-12 && r !== 1 ? '' : f(v, 3)) + root; }
    var n = Math.round(val) * p, d = q, g = gcd(n, d); n /= g; d /= g;
    var num = (n === 1 && r !== 1 ? '' : String(n)) + root;
    return d === 1 ? num : num + '/' + d;
  }
  /* loại → các cạnh theo đơn vị k, và cách suy k từ cạnh đã biết */
  var TYPES = {
    t45: { name: '45° – 45° – 90°', known: [['leg', 'Cạnh góc vuông'], ['hyp', 'Cạnh huyền']] },
    t30: { name: '30° – 60° – 90°', known: [['short', 'Cạnh đối diện góc 30°'], ['long', 'Cạnh đối diện góc 60°'], ['hyp', 'Cạnh huyền']] }
  };

  GeoWidget.register('ch05_dac_biet', function (ui, el) {
    var st = { type: el.getAttribute('data-type') || 't45', known: null, val: +(el.getAttribute('data-val') || 4) };
    st.known = el.getAttribute('data-known') || TYPES[st.type].known[0][0];

    var selT = ui.select({ label: 'Loại tam giác', value: st.type, options: [['t45', 'Vuông cân: 45° – 45° – 90°'], ['t30', 'Nửa tam giác đều: 30° – 60° – 90°']],
      onChange: function (v) { st.type = v; st.known = TYPES[v].known[0][0]; fillKnown(); B.build(draw); fit(); } });
    var selK = ui.select({ label: 'Cạnh đã biết', value: st.known, options: TYPES[st.type].known, onChange: function (v) { st.known = v; st.val = fromK(st.k); inV.value = +st.val.toFixed(3); refresh(); } });
    var g = ui.group('Độ dài cạnh đã biết (nhập số)');
    var inV = ui.number({ label: 'Độ dài', value: st.val, min: 0.1, max: 1000, onChange: function (v) { st.val = v; st.k = toK(); B.build(draw); fit(); } }, g);
    var setOut = ui.readout([['ratio', 'Tỉ lệ ba cạnh'], ['s1', 'BC'], ['s2', 'AC'], ['s3', 'AB (cạnh huyền)'], ['chk', 'Kiểm tra: BC² + AC²'], ['hyp2', 'AB²']]);
    var note = document.createElement('div'); note.className = 'ctl-note'; ui.side.appendChild(note);

    function fillKnown() {
      selK.innerHTML = '';
      TYPES[st.type].known.forEach(function (o) { var x = document.createElement('option'); x.value = o[0]; x.textContent = o[1]; selK.appendChild(x); });
      selK.value = st.known; st.k = toK();
    }
    /* k = cạnh ngắn nhất (45°: cạnh góc vuông; 30°: cạnh đối diện góc 30°) */
    function toK() {
      if (st.type === 't45') return st.known === 'leg' ? st.val : st.val / S2;
      return st.known === 'short' ? st.val : st.known === 'long' ? st.val / S3 : st.val / 2;
    }
    function fromK(k) {
      if (st.type === 't45') return st.known === 'leg' ? k : k * S2;
      return st.known === 'short' ? k : st.known === 'long' ? k * S3 : 2 * k;
    }
    /* độ dài cạnh: [BC (nằm ngang), AC (thẳng đứng), AB huyền], mỗi cạnh {v, ex} */
    function sides() {
      var k = st.k, v = st.val, K = st.known;
      if (st.type === 't45') {
        var leg = K === 'leg' ? exact(v, 1, 1, 1) : exact(v, 1, 2, 2), hyp = K === 'leg' ? exact(v, 1, 1, 2) : exact(v, 1, 1, 1);
        return [{ v: k, ex: leg }, { v: k, ex: leg }, { v: k * S2, ex: hyp }];
      }
      var sh, lo, hy;
      if (K === 'short') { sh = exact(v, 1, 1, 1); lo = exact(v, 1, 1, 3); hy = exact(v, 2, 1, 1); }
      else if (K === 'long') { sh = exact(v, 1, 3, 3); lo = exact(v, 1, 1, 1); hy = exact(v, 2, 3, 3); }
      else { sh = exact(v, 1, 2, 1); lo = exact(v, 1, 2, 3); hy = exact(v, 1, 1, 1); }
      return [{ v: k * S3, ex: lo }, { v: k, ex: sh }, { v: 2 * k, ex: hy }];
    }
    st.k = toK();

    var B = GeoWidget.board2d(ui, { ratio: 0.85, bbox: [-2, 6, 8, -3], aria: 'Tam giác vuông đặc biệt và các cạnh của nó' });

    function refresh() {
      var s = sides();
      setOut('ratio', st.type === 't45' ? '1 : 1 : √2' : '1 : √3 : 2 (đối 30° : đối 60° : huyền)');
      setOut('s1', s[0].ex + (s[0].ex.indexOf('√') >= 0 || s[0].ex.indexOf('/') >= 0 ? ' ≈ ' + f(s[0].v) : ''));
      setOut('s2', s[1].ex + (s[1].ex.indexOf('√') >= 0 || s[1].ex.indexOf('/') >= 0 ? ' ≈ ' + f(s[1].v) : ''));
      setOut('s3', s[2].ex + (s[2].ex.indexOf('√') >= 0 || s[2].ex.indexOf('/') >= 0 ? ' ≈ ' + f(s[2].v) : ''));
      setOut('chk', f(s[0].v * s[0].v + s[1].v * s[1].v, 3)); setOut('hyp2', f(s[2].v * s[2].v, 3));
      note.textContent = st.type === 't45'
        ? 'Đường chéo chia hình vuông (nét đứt) thành hai tam giác vuông cân: cạnh huyền = cạnh góc vuông × √2.'
        : 'Đường cao chia tam giác đều ABA′ (nét đứt) làm đôi: cạnh đối diện góc 30° bằng nửa cạnh huyền.';
      if (B && B.board) B.board.update();
    }
    function fit() {
      if (!B || !B.board) return;
      var k = st.k, w = st.type === 't45' ? k : k * S3, h = k;
      var y0 = st.type === 't45' ? 0 : -k, pad = 0.18 * Math.max(w, h - y0);
      setBB(B, [-pad * 1.4, (st.type === 't45' ? k : k) + pad, w + (st.type === 't45' ? 0 : 0) + pad * 1.4, y0 - pad * 2.2]);
    }

    function draw(board, C) {
      var w = function () { return st.type === 't45' ? st.k : st.k * S3; }, h = function () { return st.k; };
      var PC = board.create('point', [0, 0], { name: 'C', fixed: true, size: 2, color: C.muted, label: { offset: [-16, -12] } });
      var PB = board.create('point', [w(), 0], { name: 'B', size: 5, color: C.blue, label: { offset: [6, -14] } });
      var PA = board.create('point', [0, h], { name: 'A', fixed: true, size: 3, color: C.orange, label: { offset: [-16, 8] } });
      // hình mờ: hình vuông hoặc tam giác đều
      var ghostOpt = { fillColor: 'none', borders: { strokeColor: C.muted, dash: 2, strokeWidth: 1.5, fixed: true }, vertices: { visible: false }, fixed: true, highlight: false };
      if (st.type === 't45') {
        var D = board.create('point', [function () { return PB.X(); }, h], { visible: false });
        board.create('polygon', [PB, D, PA], ghostOpt);
      } else {
        var A2 = board.create('point', [0, function () { return -st.k; }], { name: 'A′', fixed: true, size: 2, color: C.muted, label: { offset: [-18, -6] } });
        board.create('polygon', [PB, A2, PC], ghostOpt);
      }
      board.create('polygon', [PC, PB, PA], { fillColor: C.fillBlue, fillOpacity: 1, borders: { strokeColor: C.blue, strokeWidth: 2.5, fixed: true }, vertices: { visible: false }, highlight: false, fixed: true });
      board.create('angle', [PB, PC, PA], { radius: function () { return 0.14 * st.k; }, orthoType: 'square', name: '', withLabel: false, fillColor: 'none', strokeColor: C.text, fixed: true });
      var angB = st.type === 't45' ? '45°' : '30°', angA = st.type === 't45' ? '45°' : '60°';
      board.create('nonreflexangle', [PA, PB, PC], { radius: function () { return 0.28 * st.k; }, name: angB, fillColor: C.fillOrange, strokeColor: C.orange, fixed: true, label: { strokeColor: C.orange } });
      board.create('nonreflexangle', [PC, PA, PB], { radius: function () { return 0.24 * st.k; }, name: angA, fillColor: C.fillGreen, strokeColor: C.green, fixed: true, label: { strokeColor: C.green } });
      var lab = function (xy, i, opt) { return board.create('text', [xy[0], xy[1], function () { return sides()[i].ex; }], Object.assign({ strokeColor: C.text, fixed: true, fontSize: 16 }, opt)); };
      lab([function () { return w() / 2; }, function () { return -0.08 * st.k; }], 0, { anchorX: 'middle', anchorY: 'top' });
      lab([function () { return -0.06 * st.k; }, function () { return st.k * 0.55; }], 1, { anchorX: 'right' });
      lab([function () { return w() / 2 + 0.06 * st.k; }, function () { return st.k / 2 + 0.06 * st.k; }], 2, { anchorX: 'left', anchorY: 'bottom', strokeColor: C.purple });
      PB.on('drag', function () {
        var x = Math.max(0.1, PB.X()); PB.moveTo([x, 0]);
        st.k = st.type === 't45' ? x : x / S3; st.val = fromK(st.k); inV.value = +st.val.toFixed(3); refresh();
      });
      PB.on('up', fit);
      refresh();
    }
    if (B) { B.build(draw); fit(); }
    refresh();
    el.__debug = function () { return { st: st, sides: sides() }; };
  });
})();
