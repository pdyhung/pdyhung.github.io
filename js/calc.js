/* =========================================================
   Máy tính khoa học – giao diện, phím, các chế độ
   ========================================================= */
(function () {
	'use strict';
	var C = window.CalcEngine, root = document.documentElement;
	function $(id) { return document.getElementById(id); }
	function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
	function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function T(vi, en) { return root.dataset.lang === 'en' ? en : vi; }
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

	$('langBtn').addEventListener('click', function () { var n = root.dataset.lang === 'en' ? 'vi' : 'en'; root.dataset.lang = n; root.lang = n; save('lang', n); renderAll(); });
	$('themeBtn').addEventListener('click', function () { var n = root.dataset.theme === 'light' ? 'dark' : 'light'; root.dataset.theme = n; save('theme', n); });
	$('year').textContent = new Date().getFullYear();

	/* ---------- Trạng thái ---------- */
	var S = { tokens: [], cur: 0, shift: false, hyp: false, ang: 'deg', fmt: 'norm', ans: 0, done: false, err: null, result: null, sto: '' };
	var VARS = { A: 0, B: 0, C: 0, D: 0, X: 0, Y: 0, M: 0 };
	var HIST = [];
	try {
		var sv = JSON.parse(load('calc.state') || '{}');
		if (sv.vars) Object.keys(VARS).forEach(function (k) { if (typeof sv.vars[k] === 'number') VARS[k] = sv.vars[k]; });
		if (sv.ang) S.ang = sv.ang;
		if (typeof sv.ans === 'number') S.ans = sv.ans;
		if (Array.isArray(sv.hist)) HIST = sv.hist.slice(0, 50);
	} catch (e) {}
	function persist() { save('calc.state', JSON.stringify({ vars: VARS, ang: S.ang, ans: S.ans, hist: HIST })); }
	function ctx() { return { angle: S.ang, ans: S.ans, vars: VARS }; }

	/* ---------- Bàn phím ---------- */
	// [nhãn, thao tác, nhãn SHIFT, thao tác SHIFT, class]   – thao tác: 'i:<chuỗi>' chèn, 'a:<lệnh>' hành động
	var FN = [
		['SHIFT', 'a:shift', '', '', 'shift'], ['hyp', 'a:hyp', '', '', 'hyp'], ['DRG', 'a:ang', '', '', 'mode-fn'],
		['◀', 'a:left', '', '', ''], ['▶', 'a:right', '', '', ''], ['S⇔D', 'a:sd', 'ENG', 'a:eng', 'mode-fn'],
		['x⁻¹', 'i:⁻¹', 'x!', 'i:!', ''], ['√', 'i:√(', '∛', 'i:∛(', ''], ['x²', 'i:²', 'x³', 'i:³', ''],
		['xʸ', 'i:^(', 'ˣ√', 'i:ˣ√(', ''], ['log', 'i:log(', '10ˣ', 'i:10^(', ''], ['ln', 'i:ln(', 'eˣ', 'i:e^(', ''],
		['(−)', 'i:−', 'Abs', 'i:Abs(', ''], ['sin', 'a:trig:sin', 'sin⁻¹', 'a:trig:sin⁻¹', ''], ['cos', 'a:trig:cos', 'cos⁻¹', 'a:trig:cos⁻¹', ''],
		['tan', 'a:trig:tan', 'tan⁻¹', 'a:trig:tan⁻¹', ''], ['(', 'i:(', '%', 'i:%', ''], [')', 'i:)', ',', 'i:,', ''],
		['A', 'i:A', 'STO', 'a:sto:A', ''], ['B', 'i:B', 'STO', 'a:sto:B', ''], ['C', 'i:C', 'STO', 'a:sto:C', ''],
		['D', 'i:D', 'STO', 'a:sto:D', ''], ['X', 'i:X', 'STO', 'a:sto:X', ''], ['Y', 'i:Y', 'STO', 'a:sto:Y', ''],
		['π', 'i:π', 'e', 'i:e', ''], ['nPr', 'i:ℙ', 'nCr', 'i:ℂ', 'mode-fn'], ['M+', 'a:mplus', 'M−', 'a:mminus', 'mode-fn'],
		['M', 'i:M', 'MC', 'a:mc', ''], ['Ran#', 'i:Ran#', 'logₐb', 'i:log(', 'mode-fn'], ['CLR', 'a:clr', '', '', 'mode-fn']
	];
	var NUM = [
		['7', 'i:7', '', '', 'num'], ['8', 'i:8', '', '', 'num'], ['9', 'i:9', '', '', 'num'], ['DEL', 'a:del', '', '', 'del'], ['AC', 'a:ac', '', '', 'ac'],
		['4', 'i:4', '', '', 'num'], ['5', 'i:5', '', '', 'num'], ['6', 'i:6', '', '', 'num'], ['×', 'i:×', '', '', ''], ['÷', 'i:÷', '', '', ''],
		['1', 'i:1', '', '', 'num'], ['2', 'i:2', '', '', 'num'], ['3', 'i:3', '', '', 'num'], ['+', 'i:+', '', '', ''], ['−', 'i:−', '', '', ''],
		['0', 'i:0', '', '', 'num'], ['.', 'i:.', '', '', 'num'], ['×10ˣ', 'i:ᴇ', '', '', 'mode-fn'], ['Ans', 'i:Ans', '', '', ''], ['=', 'a:eq', '', '', 'eq']
	];
	function keyHtml(k, i, set) {
		return '<button type="button" class="k ' + k[4] + '" data-set="' + set + '" data-i="' + i + '">' +
			(k[2] ? '<span class="s2">' + esc(k[2]) + '</span>' : '') + '<span>' + esc(k[0]) + '</span></button>';
	}
	$('keysFn').innerHTML = FN.map(function (k, i) { return keyHtml(k, i, 'fn'); }).join('');
	$('keysNum').innerHTML = NUM.map(function (k, i) { return keyHtml(k, i, 'num'); }).join('');
	function onKey(e) {
		var b = e.target.closest('.k'); if (!b) return;
		var k = (b.dataset.set === 'fn' ? FN : NUM)[+b.dataset.i];
		var act = S.shift && k[3] ? k[3] : k[1];
		if (act !== 'a:shift' && act !== 'a:hyp') S.shift = false;
		run(act);
	}
	$('keysFn').addEventListener('click', onKey);
	$('keysNum').addEventListener('click', onKey);

	/* ---------- Xử lý ---------- */
	var POSTOPS = /^(\+|−|×|÷|\^\(|²|³|⁻¹|!|%|ℙ|ℂ|ˣ√\(|ᴇ)$/;
	function insert(t) {
		if (S.done) {
			if (POSTOPS.test(t)) { S.tokens = ['Ans']; S.cur = 1; } else { S.tokens = []; S.cur = 0; }
			S.done = false; S.err = null;
		}
		if (S.err) { S.err = null; }
		S.tokens.splice(S.cur, 0, t); S.cur++;
	}
	function run(act) {
		S.sto = '';
		if (act.indexOf('i:') === 0) { insert(act.slice(2)); S.hyp = false; return render(); }
		var a = act.slice(2);
		if (a.indexOf('trig:') === 0) {
			var f = a.slice(5);
			if (S.hyp) f = f.replace(/^(sin|cos|tan)/, '$1h');
			insert(f + '('); S.hyp = false; return render();
		}
		if (a.indexOf('sto:') === 0) {
			var v = a.slice(4); VARS[v] = S.ans; persist();
			S.sto = 'Ans→' + v; S.done = true; S.result = S.ans; render(); renderVars();
			setTimeout(function () { if (S.sto) { S.sto = ''; render(); } }, 1500);
			return;
		}
		switch (a) {
			case 'shift': S.shift = !S.shift; break;
			case 'hyp': S.hyp = !S.hyp; break;
			case 'ang': S.ang = S.ang === 'deg' ? 'rad' : S.ang === 'rad' ? 'gra' : 'deg'; persist(); break;
			case 'left': if (S.done) S.done = false; S.cur = Math.max(0, S.cur - 1); break;
			case 'right': if (S.done) S.done = false; S.cur = Math.min(S.tokens.length, S.cur + 1); break;
			case 'del':
				if (S.done || S.err) { S.done = false; S.err = null; S.cur = S.tokens.length; break; }
				if (S.cur > 0) { S.tokens.splice(S.cur - 1, 1); S.cur--; }
				break;
			case 'ac': S.tokens = []; S.cur = 0; S.done = false; S.err = null; S.result = null; S.fmt = 'norm'; S.hyp = false; break;
			case 'eq': evaluate(); break;
			case 'sd': if (S.result !== null) S.fmt = S.fmt === 'frac' ? 'norm' : 'frac'; break;
			case 'eng': if (S.result !== null) S.fmt = S.fmt === 'eng' ? 'norm' : 'eng'; break;
			case 'mplus': case 'mminus': {
				var val = S.done || !S.tokens.length ? S.ans : evalQuiet();
				if (val === null) break;
				VARS.M += a === 'mplus' ? val : -val; S.ans = val; S.result = val; S.done = true; S.fmt = 'norm';
				persist(); renderVars(); break;
			}
			case 'mc': VARS.M = 0; persist(); renderVars(); break;
			case 'clr': Object.keys(VARS).forEach(function (k) { VARS[k] = 0; }); S.ans = 0; persist(); renderVars(); break;
		}
		render();
	}
	function evalQuiet() {
		try { return C.evaluate(S.tokens.join(''), ctx()); } catch (e) { S.err = e.calc || 'Syntax'; S.done = false; return null; }
	}
	function evaluate() {
		if (!S.tokens.length) return;
		var src = S.tokens.join('');
		try {
			var v = C.evaluate(src, ctx());
			S.ans = v; S.result = v; S.done = true; S.err = null; S.fmt = 'norm';
			HIST.unshift({ e: src, v: v }); HIST = HIST.slice(0, 50);
			persist(); renderHist();
		} catch (e) {
			S.err = e.calc || 'Syntax'; S.done = false;
		}
	}

	/* ---------- Hiển thị ---------- */
	function fmtHtml(v, mode) {
		var f = C.format(v, mode);
		if (f.text !== undefined) return esc(f.text.replace(/^-/, '−'));
		return esc(f.mant.replace(/^-/, '−')) + '×10<sup>' + f.exp + '</sup>';
	}
	function fmtText(v) {
		var f = C.format(v);
		return (f.text !== undefined ? f.text : f.mant + '×10^' + f.exp).replace(/^-/, '−');
	}
	function render() {
		var html = '';
		S.tokens.forEach(function (t, i) { if (i === S.cur && !S.done) html += '<span class="cur"></span>'; html += esc(t); });
		if (S.cur === S.tokens.length && !S.done) html += '<span class="cur"></span>';
		$('expr').innerHTML = html;
		var r = $('res');
		r.classList.toggle('err', !!S.err);
		if (S.err) r.textContent = S.err === 'Math' ? 'Math ERROR' : 'Syntax ERROR';
		else if (S.sto) r.textContent = S.sto;
		else if (S.result !== null && S.done) r.innerHTML = fmtHtml(S.result, S.fmt);
		else if (!S.tokens.length) r.textContent = '0';
		else r.innerHTML = '&nbsp;';
		$('iShift').classList.toggle('on', S.shift);
		$('iHyp').classList.toggle('on', S.hyp);
		$('iSto').classList.toggle('on', !!S.sto);
		$('iM').classList.toggle('on', VARS.M !== 0);
		$('iAng').textContent = S.ang.toUpperCase();
		$('iFmt').textContent = S.fmt === 'frac' ? 'a⁄b' : S.fmt === 'eng' ? 'ENG' : '';
		document.querySelector('.k.shift').classList.toggle('on', S.shift);
		document.querySelector('.k.hyp').classList.toggle('on', S.hyp);
		document.body.classList.toggle('shift-on', S.shift);
	}
	function renderHist() {
		$('hist').innerHTML = HIST.length ? HIST.map(function (h, i) {
			return '<li data-i="' + i + '"><span class="h-e">' + esc(h.e) + '</span><span class="h-r">= ' + esc(fmtText(h.v)) + '</span></li>';
		}).join('') : '<li class="empty">' + T('Chưa có phép tính nào', 'No calculations yet') + '</li>';
	}
	$('hist').addEventListener('click', function (e) {
		var li = e.target.closest('li[data-i]'); if (!li) return;
		var h = HIST[+li.dataset.i];
		S.tokens = splitTokens(h.e); S.cur = S.tokens.length; S.done = false; S.err = null; render();
	});
	$('histClear').addEventListener('click', function () { HIST = []; persist(); renderHist(); });
	function splitTokens(s) {                   // tách chuỗi lịch sử thành các ký tự/cụm để DEL hoạt động hợp lý
		return s.match(/sinh⁻¹\(|cosh⁻¹\(|tanh⁻¹\(|sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|sinh\(|cosh\(|tanh\(|sin\(|cos\(|tan\(|log\(|ln\(|Abs\(|10\^\(|e\^\(|√\(|∛\(|ˣ√\(|\^\(|Ran#|Ans|⁻¹|[\s\S]/g) || [];
	}
	function renderVars() {
		$('vars').innerHTML = Object.keys(VARS).map(function (k) { return '<div><b>' + k + '</b>' + esc(fmtText(VARS[k])) + '</div>'; }).join('');
		$('iM').classList.toggle('on', VARS.M !== 0);
	}

	/* ---------- Bàn phím máy tính ---------- */
	var KB = { '0': 'i:0', '1': 'i:1', '2': 'i:2', '3': 'i:3', '4': 'i:4', '5': 'i:5', '6': 'i:6', '7': 'i:7', '8': 'i:8', '9': 'i:9',
		'.': 'i:.', ',': 'i:.', '+': 'i:+', '-': 'i:−', '*': 'i:×', 'x': 'i:×', '/': 'i:÷', '^': 'i:^(', '(': 'i:(', ')': 'i:)', '!': 'i:!', '%': 'i:%',
		'Enter': 'a:eq', '=': 'a:eq', 'Backspace': 'a:del', 'Escape': 'a:ac', 'Delete': 'a:ac', 'ArrowLeft': 'a:left', 'ArrowRight': 'a:right' };
	document.addEventListener('keydown', function (e) {
		if (curMode !== 'comp') return;
		var tag = (e.target.tagName || '').toLowerCase();
		if (tag === 'input' || tag === 'textarea' || e.ctrlKey || e.metaKey || e.altKey) return;
		if (e.key === 'ArrowUp' && HIST.length) { e.preventDefault(); S.tokens = splitTokens(HIST[0].e); S.cur = S.tokens.length; S.done = false; S.err = null; return render(); }
		var act = KB[e.key]; if (!act) return;
		e.preventDefault(); S.shift = false; run(act);
		var lab = { 'i:−': '−', 'i:×': '×', 'i:÷': '÷', 'a:eq': '=', 'a:del': 'DEL', 'a:ac': 'AC', 'i:^(': 'xʸ' }[act] || e.key;
		document.querySelectorAll('.k').forEach(function (b) {
			if (b.lastChild.textContent === lab) { b.classList.add('press'); setTimeout(function () { b.classList.remove('press'); }, 110); }
		});
	});

	/* ---------- Chế độ ---------- */
	var curMode = 'comp';
	$('modes').addEventListener('click', function (e) {
		var b = e.target.closest('button'); if (!b) return;
		curMode = b.dataset.m;
		this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
		document.querySelectorAll('.pane').forEach(function (p) { p.hidden = p.dataset.pane !== curMode; });
	});
	function num(s, label) {
		if (String(s).trim() === '') return 0;
		try { return C.evaluate(String(s).replace(/,/g, '.'), ctx()); }
		catch (e) { throw new Error(T('Giá trị không hợp lệ: ', 'Invalid value: ') + label); }
	}
	function show(v) {
		var t = fmtText(v), fr = Math.abs(v) < 1e6 ? C.toFraction(+v.toPrecision(12), 1000) : null;
		return fr ? fr + ' <small>(' + t + ')</small>' : t;
	}
	function cell(label, val, hl) { return '<div' + (hl ? ' class="hl"' : '') + '><small>' + label + '</small><b>' + val + '</b></div>'; }
	function segBind(id, cb) {
		$(id).addEventListener('click', function (e) {
			var b = e.target.closest('button'); if (!b) return;
			this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
			cb(b.dataset.v);
		});
	}

	/* ===== Phương trình ===== */
	var eqType = 'q2';
	var EQ_FORMS = {
		q2: [['a', 'x² +'], ['b', 'x +'], ['c', '= 0']],
		q3: [['a', 'x³ +'], ['b', 'x² +'], ['c', 'x +'], ['d', '= 0']],
		s2: [['a₁', 'x +', 'b₁', 'y =', 'c₁'], ['a₂', 'x +', 'b₂', 'y =', 'c₂']],
		s3: [['a₁', 'x +', 'b₁', 'y +', 'c₁', 'z =', 'd₁'], ['a₂', 'x +', 'b₂', 'y +', 'c₂', 'z =', 'd₂'], ['a₃', 'x +', 'b₃', 'y +', 'c₃', 'z =', 'd₃']]
	};
	var EQ_DEF = { q2: ['1', '-3', '2'], q3: ['1', '-6', '11', '-6'], s2: ['2', '3', '8', '1', '-1', '-1'], s3: ['1', '1', '1', '6', '2', '-1', '1', '3', '1', '2', '-1', '2'] };
	function eqRender() {
		var f = EQ_FORMS[eqType], d = EQ_DEF[eqType], n = 0, h = '';
		if (eqType === 'q2' || eqType === 'q3') {
			h = '<div class="eq-line">' + f.map(function (p) { return '<input type="text" data-k="' + n + '" value="' + d[n++] + '" aria-label="' + p[0] + '">' + p[1]; }).join(' ') + '</div>';
		} else {
			h = f.map(function (row) {
				return '<div class="eq-line">' + row.map(function (p, j) { return j % 2 === 0 ? '<input type="text" data-k="' + n + '" value="' + d[n++] + '" aria-label="' + p + '">' : p; }).join(' ') + '</div>';
			}).join('');
		}
		$('eqForm').innerHTML = h; $('eqOut').innerHTML = '';
	}
	segBind('eqType', function (v) { eqType = v; eqRender(); });
	function cplx(re, im) {
		re = Math.abs(re) < 1e-12 ? 0 : re;
		return fmtText(re) + (im < 0 ? ' − ' : ' + ') + fmtText(Math.abs(im)) + 'i';
	}
	function quad(a, b, c) {
		if (a === 0) { if (b === 0) return null; return [{ re: -c / b }]; }
		var D = b * b - 4 * a * c;
		if (Math.abs(D) < 1e-14 * Math.max(1, b * b)) return [{ re: -b / (2 * a) }, { re: -b / (2 * a) }];
		if (D > 0) { var q = -(b + Math.sign(b || 1) * Math.sqrt(D)) / 2; return [{ re: q / a }, { re: c / q }].sort(function (x, y) { return y.re - x.re; }); }
		return [{ re: -b / (2 * a), im: Math.sqrt(-D) / (2 * a) }, { re: -b / (2 * a), im: -Math.sqrt(-D) / (2 * a) }];
	}
	function cubic(a, b, c, d) {
		if (a === 0) return quad(b, c, d);
		b /= a; c /= a; d /= a;
		var p = c - b * b / 3, q = 2 * b * b * b / 27 - b * c / 3 + d, D = q * q / 4 + p * p * p / 27, off = -b / 3, r;
		function polish(x) { for (var k = 0; k < 6; k++) { var f = ((x + b) * x + c) * x + d, df = (3 * x + 2 * b) * x + c; if (df === 0) break; x -= f / df; } return x; }
		if (Math.abs(D) < 1e-12) { var u = Math.cbrt(-q / 2); r = [2 * u + off, -u + off, -u + off].map(polish); return r.sort(function (x, y) { return y - x; }).map(function (x) { return { re: x }; }); }
		if (D > 0) {
			var s = Math.sqrt(D), u1 = Math.cbrt(-q / 2 + s), v1 = Math.cbrt(-q / 2 - s), x1 = polish(u1 + v1 + off);
			var bb = b + x1, cc = c + bb * x1, rest = quad(1, bb, cc);
			return [{ re: x1 }].concat(rest);
		}
		var m = 2 * Math.sqrt(-p / 3), phi = Math.acos(Math.max(-1, Math.min(1, 3 * q / (p * m))));
		r = [0, 1, 2].map(function (k) { return polish(m * Math.cos(phi / 3 - 2 * Math.PI * k / 3) + off); });
		return r.sort(function (x, y) { return y - x; }).map(function (x) { return { re: x }; });
	}
	function gauss(M) {
		var n = M.length;
		for (var i = 0; i < n; i++) {
			var piv = i;
			for (var r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
			if (Math.abs(M[piv][i]) < 1e-12) return null;
			var tmp = M[i]; M[i] = M[piv]; M[piv] = tmp;
			for (r = 0; r < n; r++) if (r !== i) {
				var f = M[r][i] / M[i][i];
				for (var c2 = i; c2 <= n; c2++) M[r][c2] -= f * M[i][c2];
			}
		}
		return M.map(function (row, i) { return row[n] / row[i]; });
	}
	$('eqSolve').addEventListener('click', function () {
		var out = $('eqOut');
		try {
			var v = Array.prototype.map.call($('eqForm').querySelectorAll('input'), function (i) { return num(i.value, i.getAttribute('aria-label')); });
			var h = '';
			if (eqType === 'q2' || eqType === 'q3') {
				var roots = eqType === 'q2' ? quad(v[0], v[1], v[2]) : cubic(v[0], v[1], v[2], v[3]);
				if (!roots) throw new Error(T('Phương trình suy biến (vô nghiệm hoặc vô số nghiệm).', 'Degenerate equation (no or infinitely many solutions).'));
				h = '<div class="res-grid">' + roots.map(function (r, i) {
					return cell('x' + (i + 1), r.im ? cplx(r.re, r.im) : show(r.re), true);
				}).join('');
				if (eqType === 'q2' && v[0] !== 0) {
					var xv = -v[1] / (2 * v[0]), yv = v[2] - v[1] * v[1] / (4 * v[0]);
					h += cell((v[0] > 0 ? T('Cực tiểu', 'Minimum') : T('Cực đại', 'Maximum')) + ' (x; y)', show(xv) + ' ; ' + show(yv));
					h += cell('Δ = b² − 4ac', show(v[1] * v[1] - 4 * v[0] * v[2]));
				}
				h += '</div>';
				if (roots.some(function (r) { return r.im; })) h += '<p class="note">' + T('Có nghiệm phức (i là đơn vị ảo).', 'Includes complex roots (i is the imaginary unit).') + '</p>';
			} else {
				var n = eqType === 's2' ? 2 : 3, M = [];
				for (var r = 0; r < n; r++) M.push(v.slice(r * (n + 1), r * (n + 1) + n + 1));
				var sol = gauss(M);
				if (!sol) throw new Error(T('Hệ suy biến: vô nghiệm hoặc vô số nghiệm.', 'Singular system: no unique solution.'));
				h = '<div class="res-grid">' + sol.map(function (x, i) { return cell('xyz'[i], show(x), true); }).join('') + '</div>';
			}
			out.innerHTML = h;
		} catch (e) { out.innerHTML = '<p class="msg">' + esc(e.message) + '</p>'; }
	});

	/* ===== Thống kê ===== */
	var stType = '1';
	$('stData').value = '12\n15\n15\n18\n20\n22\n25';
	segBind('stType', function (v) {
		stType = v; $('stOut').innerHTML = '';
		$('stData').value = v === '1' ? '12\n15\n15\n18\n20\n22\n25' : '1, 2.1\n2, 3.9\n3, 6.2\n4, 7.8\n5, 10.1';
	});
	function median(a) { var n = a.length, m = Math.floor(n / 2); return n % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
	$('stRun').addEventListener('click', function () {
		var out = $('stOut');
		try {
			var rows = $('stData').value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l, i) {
				return l.split(/[\t;,]+|\s+/).filter(Boolean).map(function (c) { return num(c, T('dòng ', 'line ') + (i + 1)); });
			});
			if (!rows.length) throw new Error(T('Chưa có dữ liệu.', 'No data.'));
			var h = '<div class="res-grid">';
			if (stType === '1') {
				var xs = [];
				rows.forEach(function (r) { var f = r.length > 1 ? Math.round(r[1]) : 1; if (f < 0 || f > 100000) throw new Error('freq'); for (var k = 0; k < f; k++) xs.push(r[0]); });
				var n = xs.length, sx = 0, sx2 = 0; xs.forEach(function (x) { sx += x; sx2 += x * x; });
				var mean = sx / n, varp = Math.max(0, sx2 / n - mean * mean);
				var s = xs.slice().sort(function (a, b) { return a - b; }), half = Math.floor(n / 2);
				var q1 = n > 1 ? median(s.slice(0, half)) : s[0], q3 = n > 1 ? median(s.slice(n % 2 ? half + 1 : half)) : s[0];
				h += cell('n', n) + cell('x̄', show(mean), true) + cell('Σx', show(sx)) + cell('Σx²', show(sx2)) +
					cell('σx', show(Math.sqrt(varp)), true) + cell('sx', n > 1 ? show(Math.sqrt(varp * n / (n - 1))) : '—') +
					cell('minX', show(s[0])) + cell('Q1', show(q1)) + cell('Med', show(median(s)), true) + cell('Q3', show(q3)) + cell('maxX', show(s[n - 1]));
				if (rows.some(function (r) { return r.length > 1; })) h += '</div><p class="note">' + T('Cột thứ 2 được hiểu là tần số.', 'The 2nd column is read as frequency.') + '</p><div>';
			} else {
				if (rows.some(function (r) { return r.length < 2; })) throw new Error(T('Mỗi dòng cần 2 giá trị: x, y', 'Each line needs two values: x, y'));
				var N = rows.length, Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0;
				rows.forEach(function (r) { Sx += r[0]; Sy += r[1]; Sxx += r[0] * r[0]; Syy += r[1] * r[1]; Sxy += r[0] * r[1]; });
				var mx = Sx / N, my = Sy / N, vx = Sxx / N - mx * mx, vy = Syy / N - my * my, cov = Sxy / N - mx * my;
				if (vx <= 0) throw new Error(T('Các giá trị x phải khác nhau.', 'x values must differ.'));
				var B = cov / vx, A = my - B * mx, R = vy > 0 ? cov / Math.sqrt(vx * vy) : 1;
				h += cell('n', N) + cell('x̄', show(mx)) + cell('ȳ', show(my)) + cell('Σx', show(Sx)) + cell('Σy', show(Sy)) +
					cell('Σx²', show(Sxx)) + cell('Σy²', show(Syy)) + cell('Σxy', show(Sxy)) +
					cell('σx', show(Math.sqrt(vx))) + cell('σy', show(Math.sqrt(Math.max(0, vy)))) +
					cell('a', show(A), true) + cell('b', show(B), true) + cell('r', show(R), true) + cell('r²', show(R * R));
				h += '</div><p class="note">' + T('Hồi quy tuyến tính: y = a + b·x', 'Linear regression: y = a + b·x') + '</p><div>';
			}
			out.innerHTML = h + '</div>';
		} catch (e) { out.innerHTML = '<p class="msg">' + esc(e.message === 'freq' ? T('Tần số không hợp lệ.', 'Invalid frequency.') : e.message) + '</p>'; }
	});

	/* ===== Hệ cơ số ===== */
	var bnFrom = 10;
	segBind('bnFrom', function (v) {
		var old = bnParse(); bnFrom = +v;
		if (old !== null) $('bnIn').value = bnFrom === 10 ? String(old) : ((old >>> 0).toString(bnFrom)).toUpperCase();
		bnRun();
	});
	function bnParse() {
		var s = $('bnIn').value.trim().replace(/\s+/g, '').toLowerCase();
		if (!s) return null;
		var re = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[−-]?\d+$/, 16: /^[0-9a-f]+$/ }[bnFrom];
		if (!re.test(s)) return NaN;
		if (bnFrom === 10) { var d = parseInt(s.replace('−', '-'), 10); return d < -2147483648 || d > 2147483647 ? NaN : d; }
		var u = parseInt(s, bnFrom); if (u > 4294967295) return NaN;
		return u | 0;
	}
	function grp(s, n) { var o = ''; while (s.length > n) { o = ' ' + s.slice(-n) + o; s = s.slice(0, -n); } return s + o; }
	function bnRun() {
		var v = bnParse(), out = $('bnOut');
		if (v === null) { out.innerHTML = ''; return; }
		if (isNaN(v)) { out.innerHTML = '<p class="msg">' + T('Số không hợp lệ hoặc vượt quá 32 bit.', 'Invalid number or out of 32-bit range.') + '</p>'; return; }
		var u = v >>> 0;
		out.innerHTML = '<div class="res-grid">' + cell('DEC', String(v), bnFrom !== 10) + cell('HEX', u.toString(16).toUpperCase(), bnFrom !== 16) +
			cell('BIN', grp(u.toString(2), 4), bnFrom !== 2) + cell('OCT', u.toString(8), bnFrom !== 8) + '</div>';
	}
	$('bnIn').addEventListener('input', bnRun);

	/* ===== Bảng giá trị ===== */
	$('tbRun').addEventListener('click', function () {
		var out = $('tbOut');
		try {
			var a = num($('tbA').value, T('Bắt đầu', 'Start')), b = num($('tbB').value, T('Kết thúc', 'End')), st = num($('tbS').value, T('Bước', 'Step'));
			if (st <= 0 || b < a) throw new Error(T('Cần Bắt đầu ≤ Kết thúc và Bước > 0.', 'Need Start ≤ End and Step > 0.'));
			var n = Math.floor((b - a) / st + 1e-9) + 1;
			if (n > 200) throw new Error(T('Tối đa 200 dòng – hãy tăng Bước.', 'At most 200 rows – increase the step.'));
			var f = $('tbF').value, rows = '';
			for (var i = 0; i < n; i++) {
				var x = +(a + i * st).toPrecision(12), y;
				try { var c2 = ctx(); c2.vars = Object.assign({}, VARS, { X: x }); y = fmtText(C.evaluate(f, c2)); } catch (e) { y = 'ERROR'; }
				rows += '<tr><td>' + (i + 1) + '</td><td>' + esc(fmtText(x)) + '</td><td>' + esc(y) + '</td></tr>';
			}
			out.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>X</th><th>f(X)</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
		} catch (e) { out.innerHTML = '<p class="msg">' + esc(e.message) + '</p>'; }
	});

	function renderAll() { render(); renderHist(); renderVars(); }
	eqRender(); bnRun(); renderAll();
})();
