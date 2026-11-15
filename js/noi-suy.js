/* =========================================================
   Nội suy tuyến tính 2 chiều (bilinear)
   Bảng: xs = tiêu đề cột, ys = tiêu đề hàng, v[r][c] = giá trị
   ========================================================= */
(function () {
	'use strict';
	var root = document.documentElement;
	function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
	function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function $(id) { return document.getElementById(id); }
	function isEn() { return root.dataset.lang === 'en'; }
	function T(vi, en) { return isEn() ? en : vi; }

	/* ---------- Ngôn ngữ, giao diện ---------- */
	$('langBtn').addEventListener('click', function () {
		var n = root.dataset.lang === 'en' ? 'vi' : 'en';
		root.dataset.lang = n; root.lang = n; save('lang', n); compute();
	});
	$('themeBtn').addEventListener('click', function () {
		var n = root.dataset.theme === 'light' ? 'dark' : 'light';
		root.dataset.theme = n; save('theme', n);
	});
	$('year').textContent = new Date().getFullYear();

	/* ---------- Đọc số: chấp nhận "0,5" "0.5" "1.234,5" "1,234.5" ---------- */
	function num(s) {
		if (s === null || s === undefined) return NaN;
		s = String(s).trim().replace(/\s+/g, '');
		if (!s) return NaN;
		var c = s.lastIndexOf(','), d = s.lastIndexOf('.');
		if (c > -1 && d > -1) s = c > d ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
		else if (c > -1) s = s.replace(',', '.');
		return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? parseFloat(s) : NaN;
	}

	/* ---------- Dữ liệu ---------- */
	var EXAMPLE = {
		name: 'Bảng ví dụ (số liệu minh hoạ)', xn: 'B/H', yn: 'L/B',
		xs: ['0.5', '1', '1.5', '2', '3'],
		ys: ['1', '2', '3', '4'],
		v: [['0.62', '0.70', '0.76', '0.80', '0.85'],
			['0.55', '0.64', '0.71', '0.76', '0.82'],
			['0.50', '0.60', '0.68', '0.73', '0.80'],
			['0.47', '0.57', '0.65', '0.71', '0.78']]
	};
	var S;
	try { S = JSON.parse(load('noisuy') || 'null'); } catch (e) { S = null; }
	if (!S || !S.xs || !S.ys || !S.v) S = JSON.parse(JSON.stringify(EXAMPLE));
	S.qx = S.qx || ''; S.qy = S.qy || ''; S.dec = S.dec === undefined ? 4 : S.dec;

	function persist() { save('noisuy', JSON.stringify(S)); }

	/* ---------- Vẽ bảng ---------- */
	var grid = $('grid');
	function render() {
		var h = '<thead><tr><th class="corner">' + esc(S.yn || 'y') + ' \\ ' + esc(S.xn || 'x') + '</th>';
		S.xs.forEach(function (x, c) { h += '<th class="h" data-c="' + c + '"><input data-k="x" data-c="' + c + '" value="' + esc(x) + '"></th>'; });
		h += '</tr></thead><tbody>';
		S.ys.forEach(function (y, r) {
			h += '<tr><th class="h" data-r="' + r + '"><input data-k="y" data-r="' + r + '" value="' + esc(y) + '"></th>';
			S.xs.forEach(function (_, c) { h += '<td data-r="' + r + '" data-c="' + c + '"><input data-k="v" data-r="' + r + '" data-c="' + c + '" value="' + esc((S.v[r] || [])[c] || '') + '"></td>'; });
			h += '</tr>';
		});
		grid.innerHTML = h + '</tbody>';
		$('tName').value = S.name || ''; $('xName').value = S.xn || 'x'; $('yName').value = S.yn || 'y';
		$('qx').value = S.qx; $('qy').value = S.qy; $('dec').value = S.dec;
		labels();
		compute();
	}
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function labels() {
		$('xLabel').textContent = S.xn || 'x'; $('yLabel').textContent = S.yn || 'y';
		var corner = grid.querySelector('.corner'); if (corner) corner.textContent = (S.yn || 'y') + ' \\ ' + (S.xn || 'x');
	}

	grid.addEventListener('input', function (e) {
		var i = e.target, k = i.dataset.k;
		if (k === 'x') S.xs[+i.dataset.c] = i.value;
		else if (k === 'y') S.ys[+i.dataset.r] = i.value;
		else if (k === 'v') { S.v[+i.dataset.r] = S.v[+i.dataset.r] || []; S.v[+i.dataset.r][+i.dataset.c] = i.value; }
		i.classList.toggle('bad', i.value.trim() !== '' && isNaN(num(i.value)));
		persist(); compute();
	});
	/* Dán nhiều ô vào bảng từ một ô bất kỳ */
	grid.addEventListener('paste', function (e) {
		var txt = (e.clipboardData || window.clipboardData).getData('text');
		if (!/[\t\n]/.test(txt.trim())) return;
		e.preventDefault();
		var i = e.target, rows = splitRows(txt);
		var r0 = i.dataset.k === 'x' ? -1 : +i.dataset.r, c0 = i.dataset.k === 'y' ? -1 : +i.dataset.c;
		rows.forEach(function (row, dr) {
			row.forEach(function (val, dc) {
				var r = r0 + dr, c = c0 + dc;
				while (c >= S.xs.length) addCol();
				while (r >= S.ys.length) addRow();
				if (r === -1 && c >= 0) S.xs[c] = val;
				else if (c === -1 && r >= 0) S.ys[r] = val;
				else if (r >= 0 && c >= 0) S.v[r][c] = val;
			});
		});
		persist(); render();
	});

	['tName', 'xName', 'yName'].forEach(function (id) {
		$(id).addEventListener('input', function () {
			S.name = $('tName').value; S.xn = $('xName').value; S.yn = $('yName').value; labels(); persist(); compute();
		});
	});
	['qx', 'qy', 'dec'].forEach(function (id) {
		$(id).addEventListener('input', function () { S.qx = $('qx').value; S.qy = $('qy').value; S.dec = +$('dec').value; persist(); compute(); });
	});

	function addCol() { S.xs.push(''); S.v.forEach(function (row) { row.push(''); }); }
	function addRow() { S.ys.push(''); S.v.push(S.xs.map(function () { return ''; })); }
	$('addCol').addEventListener('click', function () { addCol(); persist(); render(); });
	$('addRow').addEventListener('click', function () { addRow(); persist(); render(); });
	$('delCol').addEventListener('click', function () { if (S.xs.length > 1) { S.xs.pop(); S.v.forEach(function (r) { r.pop(); }); persist(); render(); } });
	$('delRow').addEventListener('click', function () { if (S.ys.length > 1) { S.ys.pop(); S.v.pop(); persist(); render(); } });

	/* ---------- Dán từ Excel ---------- */
	function splitRows(txt) {
		return txt.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim() !== ''; }).map(function (l) {
			return (l.indexOf('\t') > -1 ? l.split('\t') : l.indexOf(';') > -1 ? l.split(';') : l.trim().split(/\s{2,}|\s(?=[-+]?\d)/)).map(function (c) { return c.trim(); });
		});
	}
	$('btnPaste').addEventListener('click', function () { $('pasteBox').hidden = false; $('pasteArea').focus(); });
	$('btnCancel').addEventListener('click', function () { $('pasteBox').hidden = true; });
	$('btnApply').addEventListener('click', function () {
		var rows = splitRows($('pasteArea').value);
		if (rows.length < 2 || rows[0].length < 2) { msg(T('Cần ít nhất 1 hàng tiêu đề x và 1 hàng dữ liệu.', 'Need at least an x header row and one data row.'), true); return; }
		var head = rows[0];
		var corner = head.length > rows[1].length - 1 || isNaN(num(head[0])) ? head[0] : null;
		var xs = corner !== null ? head.slice(1) : head;
		var ys = [], v = [];
		rows.slice(1).forEach(function (r) { ys.push(r[0] || ''); v.push(xs.map(function (_, c) { return r[c + 1] || ''; })); });
		S.xs = xs; S.ys = ys; S.v = v;
		$('pasteBox').hidden = true; $('pasteArea').value = '';
		persist(); render();
		msg(T('Đã nhập bảng ' + ys.length + ' hàng × ' + xs.length + ' cột.', 'Imported ' + ys.length + ' rows × ' + xs.length + ' columns.'));
	});
	$('btnExample').addEventListener('click', function () { var q = { qx: '1.2', qy: '2.5', dec: S.dec }; S = JSON.parse(JSON.stringify(EXAMPLE)); S.qx = q.qx; S.qy = q.qy; S.dec = q.dec; persist(); render(); });
	$('btnClear').addEventListener('click', function () {
		S = { name: '', xn: 'x', yn: 'y', xs: ['', '', ''], ys: ['', '', ''], v: [['', '', ''], ['', '', ''], ['', '', '']], qx: '', qy: '', dec: S.dec };
		persist(); render();
	});
	function msg(t, err) { var m = $('gridMsg'); m.textContent = t; m.classList.toggle('err', !!err); }

	/* ---------- Nội suy ---------- */
	function fmt(v) {
		var d = Math.max(0, Math.min(10, isNaN(S.dec) ? 4 : S.dec));
		var s = (+v).toFixed(d);
		return isEn() ? s : s.replace('.', ',');
	}
	function f(v) {                                   // dạng gọn cho các bước tính (bỏ số 0 thừa)
		var s = fmt(v);
		return /[.,]/.test(s) ? s.replace(/0+$/, '').replace(/[.,]$/, '') : s;
	}

	/* Tìm cặp chỉ số kẹp giá trq t trên trục (đã có giá trị số), trả về {i, j, ext} */
	function bracket(axis, t) {
		var idx = axis.map(function (a, k) { return { a: a, k: k }; }).filter(function (o) { return !isNaN(o.a); });
		idx.sort(function (p, q) { return p.a - q.a; });
		if (idx.length === 1) return { i: idx[0].k, j: idx[0].k, single: true, ext: t !== idx[0].a };
		for (var n = 0; n < idx.length - 1; n++) {
			if (t >= idx[n].a && t <= idx[n + 1].a) {
				if (t === idx[n].a) return { i: idx[n].k, j: idx[n].k, exact: true };
				if (t === idx[n + 1].a) return { i: idx[n + 1].k, j: idx[n + 1].k, exact: true };
				return { i: idx[n].k, j: idx[n + 1].k };
			}
		}
		var lo = t < idx[0].a;
		return lo ? { i: idx[0].k, j: idx[1].k, ext: 'low' } : { i: idx[idx.length - 2].k, j: idx[idx.length - 1].k, ext: 'high' };
	}
	function dupCheck(axis) {
		var seen = {};
		for (var k = 0; k < axis.length; k++) { if (isNaN(axis[k])) continue; if (seen[axis[k]]) return true; seen[axis[k]] = 1; }
		return false;
	}
	function lerp(a, b, ta, tb, t) { return ta === tb ? a : a + (b - a) * (t - ta) / (tb - ta); }

	function clearMarks() { grid.querySelectorAll('.used,.hl').forEach(function (el) { el.classList.remove('used', 'hl'); }); }
	function mark(r, c) {
		var td = grid.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]'); if (td) td.classList.add('used');
		var hx = grid.querySelector('thead th[data-c="' + c + '"]'); if (hx) hx.classList.add('hl');
		var hy = grid.querySelector('tbody th[data-r="' + r + '"]'); if (hy) hy.classList.add('hl');
	}

	function out(val, steps, warn) {
		$('result').textContent = val === null ? '—' : fmt(val);
		$('btnCopy').disabled = val === null;
		$('btnCopy').dataset.v = val === null ? '' : fmt(val);
		$('steps').innerHTML = steps;
		$('warn').hidden = !warn; $('warn').textContent = warn || '';
	}

	function compute() {
		clearMarks();
		var X = S.xs.map(num), Y = S.ys.map(num);
		var x = num(S.qx), y = num(S.qy);
		var nx = X.filter(function (a) { return !isNaN(a); }).length, ny = Y.filter(function (a) { return !isNaN(a); }).length;
		var hint = '<p class="hint">' + T('Nhập x và y để xem các bước.', 'Enter x and y to see the steps.') + '</p>';
		if (!nx || !ny) { out(null, '<p class="hint">' + T('Bảng chưa có tiêu đề x / y hợp lệ.', 'The table has no valid x / y headers yet.') + '</p>'); return; }
		if (dupCheck(X) || dupCheck(Y)) { out(null, '<p class="hint">' + T('Tiêu đề x hoặc y bị trùng giá trị — hãy kiểm tra lại bảng.', 'Duplicate x or y header values — please check the table.') + '</p>'); return; }
		var needX = nx > 1, needY = ny > 1;
		if ((needX && isNaN(x)) || (needY && isNaN(y))) { out(null, hint); return; }
		if (!needX) x = X.filter(function (a) { return !isNaN(a); })[0];
		if (!needY) y = Y.filter(function (a) { return !isNaN(a); })[0];

		var bx = bracket(X, x), by = bracket(Y, y);
		var x1 = X[bx.i], x2 = X[bx.j], y1 = Y[by.i], y2 = Y[by.j];
		function V(r, c) { return num((S.v[r] || [])[c]); }
		var Q11 = V(by.i, bx.i), Q21 = V(by.i, bx.j), Q12 = V(by.j, bx.i), Q22 = V(by.j, bx.j);
		var miss = [];
		[[by.i, bx.i, Q11], [by.i, bx.j, Q21], [by.j, bx.i, Q12], [by.j, bx.j, Q22]].forEach(function (q) { if (isNaN(q[2])) miss.push(S.ys[q[0]] + ' / ' + S.xs[q[1]]); else mark(q[0], q[1]); });
		if (miss.length) { out(null, '<p class="hint">' + T('Thiếu giá trị tại ô (y / x): ', 'Missing value at cell (y / x): ') + esc(miss.join('; ')) + '</p>'); return; }

		var xn = esc(S.xn || 'x'), yn = esc(S.yn || 'y');
		var R1 = lerp(Q11, Q21, x1, x2, x), R2 = lerp(Q12, Q22, x1, x2, x), P = lerp(R1, R2, y1, y2, y);
		var st = '';
		st += '<div class="st"><b>' + T('Bước 1 – Xác định ô kẹp', 'Step 1 – Bracketing cells') + '</b>' +
			'<span class="eq mono">' + xn + ' = ' + f(x) + (x1 === x2 ? '  (= ' + f(x1) + ')' : '  ∈ [' + f(x1) + ' ; ' + f(x2) + ']') + '</span>' +
			'<span class="eq mono">' + yn + ' = ' + f(y) + (y1 === y2 ? '  (= ' + f(y1) + ')' : '  ∈ [' + f(y1) + ' ; ' + f(y2) + ']') + '</span>' +
			'<span class="eq mono">Q₁₁ = ' + f(Q11) + ', Q₂₁ = ' + f(Q21) + ', Q₁₂ = ' + f(Q12) + ', Q₂₂ = ' + f(Q22) + '</span></div>';
		if (x1 !== x2) {
			st += '<div class="st"><b>' + T('Bước 2 – Nội suy theo ', 'Step 2 – Interpolate along ') + xn + '</b>' +
				'<span class="eq mono">R₁ = ' + f(Q11) + ' + (' + f(Q21) + ' − ' + f(Q11) + ')·(' + f(x) + ' − ' + f(x1) + ')/(' + f(x2) + ' − ' + f(x1) + ') = <b>' + f(R1) + '</b></span>' +
				(y1 !== y2 ? '<span class="eq mono">R₂ = ' + f(Q12) + ' + (' + f(Q22) + ' − ' + f(Q12) + ')·(' + f(x) + ' − ' + f(x1) + ')/(' + f(x2) + ' − ' + f(x1) + ') = <b>' + f(R2) + '</b></span>' : '') + '</div>';
		} else {
			st += '<div class="st"><b>' + T('Bước 2 – ', 'Step 2 – ') + xn + T(' trùng tiêu đề cột, không cần nội suy', ' matches a column header, no interpolation needed') + '</b>' +
				'<span class="eq mono">R₁ = ' + f(R1) + (y1 !== y2 ? ', R₂ = ' + f(R2) : '') + '</span></div>';
		}
		if (y1 !== y2) {
			st += '<div class="st"><b>' + T('Bước 3 – Nội suy theo ', 'Step 3 – Interpolate along ') + yn + '</b>' +
				'<span class="eq mono">P = ' + f(R1) + ' + (' + f(R2) + ' − ' + f(R1) + ')·(' + f(y) + ' − ' + f(y1) + ')/(' + f(y2) + ' − ' + f(y1) + ') = <b>' + f(P) + '</b></span></div>';
		} else {
			st += '<div class="st"><b>' + T('Bước 3 – ', 'Step 3 – ') + yn + T(' trùng tiêu đề hàng', ' matches a row header') + '</b><span class="eq mono">P = R₁ = <b>' + f(P) + '</b></span></div>';
		}
		var warn = '';
		if (bx.ext || by.ext) warn = '⚠ ' + T('Giá trị nằm ngoài phạm vi bảng — kết quả là ngoại suy, cần kiểm tra theo tiêu chuẩn.', 'Value is outside the table range — result is extrapolated, check against the standard.');
		if (!needX || !needY) st = '<p class="hint">' + T('Bảng chỉ có 1 ', 'Table has a single ') + (!needX ? T('cột', 'column') : T('hàng', 'row')) + T(' → nội suy 1 chiều.', ' → 1D interpolation.') + '</p>' + st;
		out(P, st, warn);
	}

	$('btnCopy').addEventListener('click', function () {
		var v = this.dataset.v, btn = this;
		function done() { var o = btn.innerHTML; btn.textContent = T('Đã sao chép ✓', 'Copied ✓'); setTimeout(function () { btn.innerHTML = o; }, 1200); }
		if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, done);
		else { var t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
	});

	render();
})();
