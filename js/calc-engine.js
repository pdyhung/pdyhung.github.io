/* =========================================================
   Bộ tính toán biểu thức (không dùng eval)
   Thứ tự ưu tiên giống máy tính khoa học cầm tay:
     + −  <  × ÷  <  nhân ngầm (2π, 3sin(…))  <  nPr nCr  <  dấu âm  <  ^ ˣ√  <  ! ² ³ ⁻¹ %
   ========================================================= */
(function (G) {
	'use strict';

	function E(type) { var e = new Error(type); e.calc = type; return e; }   // 'Syntax' | 'Math'

	var FUNCS = {
		'sin⁻¹': 'asin', 'cos⁻¹': 'acos', 'tan⁻¹': 'atan', 'sinh⁻¹': 'asinh', 'cosh⁻¹': 'acosh', 'tanh⁻¹': 'atanh',
		'asinh': 'asinh', 'acosh': 'acosh', 'atanh': 'atanh', 'asin': 'asin', 'acos': 'acos', 'atan': 'atan',
		'sinh': 'sinh', 'cosh': 'cosh', 'tanh': 'tanh', 'sin': 'sin', 'cos': 'cos', 'tan': 'tan',
		'log': 'log', 'ln': 'ln', 'sqrt': 'sqrt', 'cbrt': 'cbrt', 'Abs': 'abs', 'abs': 'abs', 'exp': 'exp',
		'√': 'sqrt', '∛': 'cbrt'
	};
	var FNAMES = Object.keys(FUNCS).sort(function (a, b) { return b.length - a.length; });
	var CONSTS = { 'π': 'pi', 'pi': 'pi', 'Ans': 'ans', 'Ran#': 'ran' };
	var VARS = 'ABCDXYM';
	var OPS = { '+': '+', '-': '-', '−': '-', '×': '*', '*': '*', '÷': '/', '/': '/', '^': '^', '(': '(', ')': ')', ',': ',',
		'!': '!', '²': 'sq', '³': 'cube', '%': '%', 'ℙ': 'P', 'ℂ': 'C' };

	/* ---------- Tách từ ---------- */
	function lex(s) {
		var t = [], i = 0, m;
		while (i < s.length) {
			var r = s.slice(i);
			if (/^\s/.test(r)) { i++; continue; }
			if ((m = r.match(/^(\d+\.?\d*|\.\d+)(ᴇ[−-]?\d+)?/))) {
				t.push({ k: 'num', v: parseFloat(m[1] + (m[2] ? 'e' + m[2].slice(1).replace('−', '-') : '')) }); i += m[0].length; continue;
			}
			if ((m = r.match(/^ᴇ([−-]?\d+)/))) {      // ")ᴇ3" → × 10 ^ 3
				t.push({ k: 'op', v: '*' }, { k: 'num', v: 10 }, { k: 'op', v: '^' }, { k: 'num', v: parseFloat(m[1].replace('−', '-')) }); i += m[0].length; continue;
			}
			if (r.indexOf('⁻¹') === 0 && !/^⁻¹\(/.test(r)) { t.push({ k: 'op', v: 'inv' }); i += 2; continue; }
			if (r.indexOf('ˣ√') === 0) { t.push({ k: 'op', v: 'root' }); i += 2; continue; }
			var fn = null;
			for (var f = 0; f < FNAMES.length; f++) if (r.indexOf(FNAMES[f]) === 0) { fn = FNAMES[f]; break; }
			if (fn) { t.push({ k: 'fn', v: FUNCS[fn] }); i += fn.length; continue; }
			var c = null;
			for (var key in CONSTS) if (r.indexOf(key) === 0) { c = key; break; }
			if (c) { t.push({ k: 'const', v: CONSTS[c] }); i += c.length; continue; }
			if (r[0] === 'e') { t.push({ k: 'const', v: 'e' }); i++; continue; }
			if (VARS.indexOf(r[0]) > -1) { t.push({ k: 'var', v: r[0] }); i++; continue; }
			if (OPS[r[0]]) { t.push({ k: 'op', v: OPS[r[0]] }); i++; continue; }
			throw E('Syntax');
		}
		return t;
	}

	/* ---------- Hàm toán ---------- */
	function fact(n) {
		if (n < 0 || n !== Math.floor(n) || n > 170) throw E('Math');
		var r = 1; for (var k = 2; k <= n; k++) r *= k; return r;
	}
	function perm(n, r) { if (r > n || n !== Math.floor(n) || r !== Math.floor(r) || r < 0) throw E('Math'); var v = 1; for (var k = 0; k < r; k++) v *= (n - k); return v; }
	function comb(n, r) { if (r > n || n !== Math.floor(n) || r !== Math.floor(r) || r < 0) throw E('Math'); r = Math.min(r, n - r); var v = 1; for (var k = 1; k <= r; k++) v = v * (n - r + k) / k; return Math.round(v); }
	function root(n, x) {
		if (n === 0) throw E('Math');
		if (x < 0) { if (Math.abs(n % 2) === 1) return -Math.pow(-x, 1 / n); throw E('Math'); }
		return Math.pow(x, 1 / n);
	}

	/* ---------- Phân tích & tính ---------- */
	function evaluate(src, ctx) {
		ctx = ctx || {};
		var ang = ctx.angle || 'deg';
		var vars = ctx.vars || {};
		var toR = ang === 'deg' ? Math.PI / 180 : ang === 'gra' ? Math.PI / 200 : 1;
		var tk = lex(src), p = 0;
		if (!tk.length) throw E('Syntax');
		function peek() { return tk[p]; }
		function isOp(v) { var x = tk[p]; return x && x.k === 'op' && x.v === v; }
		function next() { return tk[p++]; }
		function implicitStart() {
			var x = tk[p]; if (!x) return false;
			return x.k === 'num' || x.k === 'const' || x.k === 'var' || x.k === 'fn' || (x.k === 'op' && x.v === '(');
		}
		function expr() {
			var v = term();
			while (isOp('+') || isOp('-')) { var o = next().v, r = term(); v = o === '+' ? v + r : v - r; }
			return v;
		}
		function term() {
			var v = implicitMul();
			while (isOp('*') || isOp('/')) {
				var o = next().v, r = implicitMul();
				if (o === '/' && r === 0) throw E('Math');
				v = o === '*' ? v * r : v / r;
			}
			return v;
		}
		function implicitMul() {
			var v = combi();
			while (implicitStart()) v *= combi();
			return v;
		}
		function combi() {
			var v = unary();
			while (isOp('P') || isOp('C')) { var o = next().v, r = unary(); v = o === 'P' ? perm(v, r) : comb(v, r); }
			return v;
		}
		function unary() {
			if (isOp('-')) { next(); return -unary(); }
			if (isOp('+')) { next(); return unary(); }
			return power();
		}
		function power() {
			var b = postfix();
			if (isOp('^')) { next(); var e = unary(); var r = Math.pow(b, e); if (isNaN(r)) { if (b < 0 && Math.abs(1 / e % 2) === 1) return -Math.pow(-b, e); throw E('Math'); } return r; }
			if (isOp('root')) { next(); return root(b, unaryPow()); }
			return b;
		}
		function unaryPow() { if (isOp('-')) { next(); return -unaryPow(); } return postfix(); }
		function postfix() {
			var v = primary();
			for (;;) {
				if (isOp('!')) { next(); v = fact(v); }
				else if (isOp('sq')) { next(); v = v * v; }
				else if (isOp('cube')) { next(); v = v * v * v; }
				else if (isOp('inv')) { next(); if (v === 0) throw E('Math'); v = 1 / v; }
				else if (isOp('%')) { next(); v = v / 100; }
				else break;
			}
			return v;
		}
		function group() {                       // ( expr ) – cho phép thiếu ")" ở cuối
			if (!isOp('(')) throw E('Syntax');
			next();
			var v = expr();
			if (isOp(')')) next(); else if (p < tk.length) throw E('Syntax');
			return v;
		}
		function args() {
			if (!isOp('(')) throw E('Syntax');
			next();
			var a = [expr()];
			while (isOp(',')) { next(); a.push(expr()); }
			if (isOp(')')) next(); else if (p < tk.length) throw E('Syntax');
			return a;
		}
		function primary() {
			var x = peek();
			if (!x) throw E('Syntax');
			if (x.k === 'num') { next(); return x.v; }
			if (x.k === 'const') {
				next();
				if (x.v === 'pi') return Math.PI;
				if (x.v === 'e') return Math.E;
				if (x.v === 'ran') return Math.round(Math.random() * 1000) / 1000;
				return ctx.ans || 0;
			}
			if (x.k === 'var') { next(); return +vars[x.v] || 0; }
			if (x.k === 'op' && x.v === '(') return group();
			if (x.k === 'fn') {
				next();
				var a, v;
				if ((x.v === 'sqrt' || x.v === 'cbrt') && !isOp('(')) a = [power()]; else a = args();
				v = a[0];
				switch (x.v) {
					case 'sin': return trigClean(Math.sin(v * toR));
					case 'cos': return trigClean(Math.cos(v * toR));
					case 'tan':
						if (Math.abs(Math.cos(v * toR)) < 1e-15) throw E('Math');
						return trigClean(Math.tan(v * toR));
					case 'asin': if (v < -1 || v > 1) throw E('Math'); return Math.asin(v) / toR;
					case 'acos': if (v < -1 || v > 1) throw E('Math'); return Math.acos(v) / toR;
					case 'atan': return Math.atan(v) / toR;
					case 'sinh': return Math.sinh(v);
					case 'cosh': return Math.cosh(v);
					case 'tanh': return Math.tanh(v);
					case 'asinh': return Math.asinh(v);
					case 'acosh': if (v < 1) throw E('Math'); return Math.acosh(v);
					case 'atanh': if (v <= -1 || v >= 1) throw E('Math'); return Math.atanh(v);
					case 'log':
						if (a.length === 2) { if (v <= 0 || v === 1 || a[1] <= 0) throw E('Math'); return Math.log(a[1]) / Math.log(v); }
						if (v <= 0) throw E('Math'); return Math.log10(v);
					case 'ln': if (v <= 0) throw E('Math'); return Math.log(v);
					case 'sqrt': if (v < 0) throw E('Math'); return Math.sqrt(v);
					case 'cbrt': return Math.cbrt(v);
					case 'abs': return Math.abs(v);
					case 'exp': return Math.exp(v);
				}
			}
			throw E('Syntax');
		}
		function trigClean(v) { return Math.abs(v) < 1e-15 ? 0 : v; }
		var result = expr();
		if (p < tk.length) throw E('Syntax');
		if (!isFinite(result)) throw E('Math');
		return result;
	}

	/* ---------- Hiển thị kết quả ---------- */
	function sig(x, n) { return parseFloat(x.toPrecision(n)); }
	function plain(x) { return x.toLocaleString('en-US', { maximumSignificantDigits: 10, useGrouping: false }); }
	function format(x, mode) {
		if (x === 0 || Object.is(x, -0)) return { text: '0' };
		x = sig(x, 12);
		var ax = Math.abs(x);
		if (mode === 'eng') {
			var e3 = Math.floor(Math.log10(ax) / 3) * 3, m3 = sig(x / Math.pow(10, e3), 10);
			if (Math.abs(m3) >= 1000) { e3 += 3; m3 = sig(m3 / 1000, 10); }
			return { mant: plain(m3), exp: e3 };
		}
		if (mode === 'frac') {
			var fr = toFraction(x);
			if (fr) return { text: fr };
		}
		if (ax >= 1e10 || ax < 1e-9) {
			var e = Math.floor(Math.log10(ax)), m = sig(x / Math.pow(10, e), 10);
			if (Math.abs(m) >= 10) { m = sig(m / 10, 10); e++; }
			return { mant: plain(m), exp: e };
		}
		return { text: plain(sig(x, 10)) };
	}
	function toFraction(x, maxDen) {
		maxDen = maxDen || 10000;
		if (x === Math.floor(x)) return null;
		var sign = x < 0 ? '−' : '', a = Math.abs(x);
		var h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = a;
		for (var i = 0; i < 40; i++) {
			var ai = Math.floor(b), h2 = ai * h1 + h0, k2 = ai * k1 + k0;
			if (k2 > maxDen) break;
			h0 = h1; h1 = h2; k0 = k1; k1 = k2;
			if (Math.abs(a - h1 / k1) < 5e-12 * Math.max(1, a)) return sign + h1 + '⁄' + k1;
			b = 1 / (b - ai);
			if (!isFinite(b)) break;
		}
		return null;
	}

	G.CalcEngine = { evaluate: evaluate, format: format, toFraction: toFraction };
})(window);
