/* =========================================================
   Đổi đơn vị xây dựng
   Mỗi đơn vị: hệ số quy về đơn vị SI cơ sở (số hoặc hàm theo g),
   hoặc cặp hàm to/from cho đại lượng phi tuyến (độ dốc, nhiệt độ).
   ========================================================= */
(function () {
	'use strict';
	var root = document.documentElement;
	function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
	function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function $(id) { return document.getElementById(id); }
	function isEn() { return root.dataset.lang === 'en'; }
	function T(vi, en) { return isEn() ? en : vi; }

	var G = 9.80665;
	function gf(k) { return function () { return k * G; }; }   // đơn vị phụ thuộc g (kgf, T…)
	var LBF = 4.4482216152605, FT = 0.3048, IN = 0.0254, LB = 0.45359237;
	var D2R = Math.PI / 180;

	/* [id, ký hiệu, tên VI, tên EN, hệ số | {to, from}] */
	var CATS = [
		{ id: 'len', vi: 'Chiều dài', en: 'Length', def: ['m', 'mm'], units: [
			['um', 'µm', 'micromet', 'micrometre', 1e-6],
			['mm', 'mm', 'milimet', 'millimetre', 1e-3],
			['cm', 'cm', 'centimet', 'centimetre', 1e-2],
			['dm', 'dm', 'decimet', 'decimetre', 0.1],
			['m', 'm', 'mét', 'metre', 1],
			['km', 'km', 'kilomet', 'kilometre', 1000],
			['in', 'in', 'inch', 'inch', IN],
			['ft', 'ft', 'foot', 'foot', FT],
			['yd', 'yd', 'yard', 'yard', 0.9144],
			['mi', 'mi', 'dặm Anh', 'mile', 1609.344]
		]},
		{ id: 'area', vi: 'Diện tích', en: 'Area', def: ['m2', 'ha'], units: [
			['mm2', 'mm²', 'milimet vuông', 'square millimetre', 1e-6],
			['cm2', 'cm²', 'centimet vuông', 'square centimetre', 1e-4],
			['dm2', 'dm²', 'decimet vuông', 'square decimetre', 1e-2],
			['m2', 'm²', 'mét vuông', 'square metre', 1],
			['sao', 'sào BB', 'sào Bắc Bộ (360 m²)', 'sao, Northern VN (360 m²)', 360],
			['saoT', 'sào TB', 'sào Trung Bộ (500 m²)', 'sao, Central VN (500 m²)', 500],
			['mau', 'mẫu BB', 'mẫu Bắc Bộ (3600 m²)', 'mau, Northern VN (3600 m²)', 3600],
			['ha', 'ha', 'hecta', 'hectare', 1e4],
			['km2', 'km²', 'kilomet vuông', 'square kilometre', 1e6],
			['in2', 'in²', 'inch vuông', 'square inch', IN * IN],
			['ft2', 'ft²', 'foot vuông', 'square foot', FT * FT],
			['yd2', 'yd²', 'yard vuông', 'square yard', 0.83612736],
			['acre', 'acre', 'mẫu Anh', 'acre', 4046.8564224]
		]},
		{ id: 'vol', vi: 'Thể tích', en: 'Volume', def: ['m3', 'l'], units: [
			['mm3', 'mm³', 'milimet khối', 'cubic millimetre', 1e-9],
			['cm3', 'cm³ (ml)', 'centimet khối, mililit', 'cubic centimetre, millilitre', 1e-6],
			['l', 'l (dm³)', 'lít', 'litre', 1e-3],
			['m3', 'm³', 'mét khối', 'cubic metre', 1],
			['in3', 'in³', 'inch khối', 'cubic inch', IN * IN * IN],
			['ft3', 'ft³', 'foot khối', 'cubic foot', FT * FT * FT],
			['yd3', 'yd³', 'yard khối', 'cubic yard', 0.764554857984],
			['galUS', 'gal (US)', 'gallon Mỹ', 'US gallon', 0.003785411784],
			['galUK', 'gal (UK)', 'gallon Anh', 'imperial gallon', 0.00454609]
		]},
		{ id: 'mass', vi: 'Khối lượng', en: 'Mass', def: ['t', 'kg'], units: [
			['g', 'g', 'gam', 'gram', 1e-3],
			['kg', 'kg', 'kilôgam', 'kilogram', 1],
			['yen', 'yến', 'yến (10 kg)', 'yen (10 kg)', 10],
			['ta', 'tạ', 'tạ (100 kg)', 'ta (100 kg)', 100],
			['t', 'tấn (t)', 'tấn', 'tonne', 1000],
			['oz', 'oz', 'ounce', 'ounce', 0.028349523125],
			['lb', 'lb', 'pound', 'pound', LB],
			['ston', 'short ton', 'tấn Mỹ', 'US short ton', 907.18474],
			['lton', 'long ton', 'tấn Anh', 'UK long ton', 1016.0469088]
		]},
		{ id: 'force', vi: 'Lực', en: 'Force', def: ['kN', 'T'], units: [
			['N', 'N', 'newton', 'newton', 1],
			['daN', 'daN', 'decanewton', 'decanewton', 10],
			['kN', 'kN', 'kilonewton', 'kilonewton', 1e3],
			['MN', 'MN', 'meganewton', 'meganewton', 1e6],
			['kgf', 'kgf (kG)', 'kilôgam lực', 'kilogram-force', gf(1)],
			['T', 'T (tf)', 'tấn lực', 'tonne-force', gf(1000)],
			['lbf', 'lbf', 'pound lực', 'pound-force', LBF],
			['kip', 'kip', 'kilopound lực', 'kip', LBF * 1000]
		]},
		{ id: 'line', vi: 'Tải phân bố đường', en: 'Line load', def: ['kNm', 'Tm'], units: [
			['Nm', 'N/m', 'newton trên mét', 'newton per metre', 1],
			['Nmm', 'N/mm', 'newton trên milimet', 'newton per millimetre', 1e3],
			['kNm', 'kN/m', 'kilonewton trên mét', 'kilonewton per metre', 1e3],
			['daNm', 'daN/m', 'decanewton trên mét', 'decanewton per metre', 10],
			['kgfm', 'kgf/m', 'kG trên mét', 'kgf per metre', gf(1)],
			['kgfcm', 'kgf/cm', 'kG trên centimet', 'kgf per centimetre', gf(100)],
			['Tm', 'T/m', 'tấn lực trên mét', 'tonne-force per metre', gf(1000)],
			['lbfft', 'lbf/ft', 'pound lực trên foot', 'pound-force per foot', LBF / FT],
			['kipft', 'kip/ft', 'kip trên foot', 'kip per foot', LBF * 1000 / FT]
		]},
		{ id: 'press', vi: 'Áp suất · Ứng suất · Tải mặt', en: 'Pressure · Stress · Area load', def: ['MPa', 'kgfcm2'], units: [
			['Pa', 'Pa (N/m²)', 'pascal', 'pascal', 1],
			['kPa', 'kPa (kN/m²)', 'kilopascal', 'kilopascal', 1e3],
			['MPa', 'MPa (N/mm²)', 'megapascal', 'megapascal', 1e6],
			['GPa', 'GPa', 'gigapascal', 'gigapascal', 1e9],
			['daNcm2', 'daN/cm²', 'decanewton trên cm²', 'decanewton per cm²', 1e5],
			['kgfm2', 'kgf/m²', 'kG trên mét vuông', 'kgf per square metre', gf(1)],
			['kgfcm2', 'kgf/cm² (at)', 'kG trên cm², atmotphe kỹ thuật', 'kgf per cm², technical atmosphere', gf(1e4)],
			['Tm2', 'T/m²', 'tấn lực trên mét vuông', 'tonne-force per square metre', gf(1000)],
			['bar', 'bar', 'bar', 'bar', 1e5],
			['atm', 'atm', 'atmotphe tiêu chuẩn', 'standard atmosphere', 101325],
			['mH2O', 'mH₂O', 'mét cột nước', 'metre of water', 9806.65],
			['mmHg', 'mmHg', 'milimet thuỷ ngân', 'millimetre of mercury', 133.322387415],
			['psf', 'psf', 'pound lực trên ft²', 'pound-force per ft²', LBF / (FT * FT)],
			['psi', 'psi', 'pound lực trên in²', 'pound-force per in²', LBF / (IN * IN)],
			['ksi', 'ksi', 'kip trên in²', 'kip per in²', LBF * 1000 / (IN * IN)]
		]},
		{ id: 'mom', vi: 'Mô men', en: 'Moment', def: ['kNm', 'Tm'], units: [
			['Nmm', 'N·mm', 'newton milimet', 'newton millimetre', 1e-3],
			['Nm', 'N·m', 'newton mét', 'newton metre', 1],
			['kNcm', 'kN·cm', 'kilonewton centimet', 'kilonewton centimetre', 10],
			['kNm', 'kN·m', 'kilonewton mét', 'kilonewton metre', 1e3],
			['MNm', 'MN·m', 'meganewton mét', 'meganewton metre', 1e6],
			['kgfcm', 'kgf·cm', 'kG centimet', 'kgf centimetre', gf(0.01)],
			['kgfm', 'kgf·m', 'kG mét', 'kgf metre', gf(1)],
			['Tm', 'T·m', 'tấn lực mét', 'tonne-force metre', gf(1000)],
			['lbfin', 'lbf·in', 'pound lực inch', 'pound-force inch', LBF * IN],
			['lbfft', 'lbf·ft', 'pound lực foot', 'pound-force foot', LBF * FT],
			['kipft', 'kip·ft', 'kip foot', 'kip foot', LBF * 1000 * FT]
		]},
		{ id: 'uw', vi: 'Trọng lượng riêng', en: 'Unit weight', def: ['kNm3', 'Tm3'], units: [
			['Nm3', 'N/m³', 'newton trên mét khối', 'newton per cubic metre', 1],
			['kNm3', 'kN/m³', 'kilonewton trên mét khối', 'kilonewton per cubic metre', 1e3],
			['kgfm3', 'kgf/m³', 'kG trên mét khối', 'kgf per cubic metre', gf(1)],
			['Tm3', 'T/m³', 'tấn lực trên mét khối', 'tonne-force per cubic metre', gf(1000)],
			['gfcm3', 'gf/cm³', 'gam lực trên cm³', 'gram-force per cm³', gf(1000)],
			['pcf', 'lbf/ft³ (pcf)', 'pound lực trên ft³', 'pound-force per ft³', LBF / (FT * FT * FT)]
		]},
		{ id: 'dens', vi: 'Khối lượng riêng', en: 'Density', def: ['tm3', 'kgm3'], units: [
			['kgm3', 'kg/m³', 'kilôgam trên mét khối', 'kilogram per cubic metre', 1],
			['tm3', 't/m³', 'tấn trên mét khối', 'tonne per cubic metre', 1000],
			['gcm3', 'g/cm³', 'gam trên cm³', 'gram per cm³', 1000],
			['kgl', 'kg/l', 'kilôgam trên lít', 'kilogram per litre', 1000],
			['lbft3', 'lb/ft³', 'pound trên ft³', 'pound per ft³', LB / (FT * FT * FT)]
		]},
		{ id: 'slope', vi: 'Độ dốc', en: 'Slope', def: ['pct', 'm'], units: [
			['pct', '%', 'phần trăm (i·100)', 'percent (i·100)', { to: function (v) { return v / 100; }, from: function (t) { return t * 100; } }],
			['pm', '‰', 'phần nghìn', 'per mille', { to: function (v) { return v / 1000; }, from: function (t) { return t * 1000; } }],
			['i', 'i', 'độ dốc thập phân (tanα)', 'decimal gradient (tanα)', { to: function (v) { return v; }, from: function (t) { return t; } }],
			['deg', '°', 'góc dốc (độ)', 'angle (degrees)', { to: function (v) { return Math.tan(v * D2R); }, from: function (t) { return Math.atan(t) / D2R; } }],
			['rad', 'rad', 'góc dốc (radian)', 'angle (radians)', { to: function (v) { return Math.tan(v); }, from: function (t) { return Math.atan(t); } }],
			['m', '1 : m', 'hệ số mái dốc m (taluy)', 'side slope ratio 1:m (V:H)', { to: function (v) { return 1 / v; }, from: function (t) { return 1 / t; } }]
		]},
		{ id: 'angle', vi: 'Góc', en: 'Angle', def: ['deg', 'rad'], units: [
			['deg', '°', 'độ', 'degree', D2R],
			['amin', '′', 'phút', 'arcminute', D2R / 60],
			['asec', '″', 'giây', 'arcsecond', D2R / 3600],
			['rad', 'rad', 'radian', 'radian', 1],
			['grad', 'gon', 'grad (gon)', 'gradian (gon)', Math.PI / 200],
			['rev', 'vòng', 'vòng', 'revolution', 2 * Math.PI]
		]},
		{ id: 'flow', vi: 'Lưu lượng', en: 'Flow rate', def: ['ls', 'm3h'], units: [
			['m3s', 'm³/s', 'mét khối trên giây', 'cubic metre per second', 1],
			['ls', 'l/s', 'lít trên giây', 'litre per second', 1e-3],
			['lmin', 'l/phút', 'lít trên phút', 'litre per minute', 1e-3 / 60],
			['m3h', 'm³/h', 'mét khối trên giờ', 'cubic metre per hour', 1 / 3600],
			['m3d', 'm³/ngđ', 'mét khối trên ngày đêm', 'cubic metre per day', 1 / 86400],
			['cfs', 'ft³/s', 'foot khối trên giây', 'cubic foot per second', FT * FT * FT],
			['gpm', 'gpm (US)', 'gallon Mỹ trên phút', 'US gallon per minute', 0.003785411784 / 60]
		]},
		{ id: 'vel', vi: 'Vận tốc', en: 'Velocity', def: ['ms', 'kmh'], units: [
			['mms', 'mm/s', 'milimet trên giây', 'millimetre per second', 1e-3],
			['cms', 'cm/s', 'centimet trên giây', 'centimetre per second', 1e-2],
			['ms', 'm/s', 'mét trên giây', 'metre per second', 1],
			['mmin', 'm/phút', 'mét trên phút', 'metre per minute', 1 / 60],
			['kmh', 'km/h', 'kilomet trên giờ', 'kilometre per hour', 1 / 3.6],
			['fts', 'ft/s', 'foot trên giây', 'foot per second', FT],
			['mph', 'mph', 'dặm trên giờ', 'mile per hour', 0.44704],
			['kn', 'knot', 'hải lý trên giờ', 'knot', 1852 / 3600]
		]},
		{ id: 'temp', vi: 'Nhiệt độ', en: 'Temperature', def: ['C', 'F'], units: [
			['C', '°C', 'độ C', 'degree Celsius', { to: function (v) { return v + 273.15; }, from: function (k) { return k - 273.15; } }],
			['F', '°F', 'độ F', 'degree Fahrenheit', { to: function (v) { return (v - 32) * 5 / 9 + 273.15; }, from: function (k) { return (k - 273.15) * 9 / 5 + 32; } }],
			['K', 'K', 'kelvin', 'kelvin', { to: function (v) { return v; }, from: function (k) { return k; } }]
		]}
	];

	/* ---------- Tiện ích ---------- */
	function findCat(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return CATS[0]; }
	function findUnit(cat, id) { for (var i = 0; i < cat.units.length; i++) if (cat.units[i][0] === id) return cat.units[i]; return null; }
	function factor(u) { var f = u[4]; return typeof f === 'function' ? f() : f; }
	function toBase(u, v) { var f = u[4]; return (f && typeof f === 'object') ? f.to(v) : v * factor(u); }
	function fromBase(u, b) { var f = u[4]; return (f && typeof f === 'object') ? f.from(b) : b / factor(u); }
	function convert(cat, fromU, toU, v) { return fromBase(toU, toBase(fromU, v)); }

	/* Đọc số: "0,5" "0.5" "1.234,5" "1,234.5" "1 200"; hoặc phép tính đơn giản + - * / ( ) ^ */
	function num(s) {
		if (s === null || s === undefined) return NaN;
		s = String(s).trim().replace(/\s+/g, '');
		if (!s) return NaN;
		var p = s, c = p.lastIndexOf(','), d = p.lastIndexOf('.');
		if (c > -1 && d > -1) p = c > d ? p.replace(/\./g, '').replace(',', '.') : p.replace(/,/g, '');
		else if (c > -1) p = p.replace(',', '.');
		if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(p)) return parseFloat(p);
		// phép tính: dấu phẩy coi là dấu thập phân
		var e = s.replace(/,/g, '.').replace(/[×x]/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
		if (!/^[\d.+\-*/()eE]+$/.test(e)) return NaN;
		try { var r = Function('"use strict";return (' + e + ');')(); return typeof r === 'number' ? r : NaN; }
		catch (err) { return NaN; }
	}

	var SIG = 6;
	function fmtRaw(x) {
		if (!isFinite(x)) return '';
		if (x === 0) return '0';
		var a = Math.abs(x);
		if (a >= 1e15 || a < 1e-9) return strip(x.toExponential(SIG - 1));
		return String(Number(x.toPrecision(SIG)));
	}
	function strip(s) { return s.replace(/\.?0+e/, 'e').replace('e+', 'e'); }
	function fmt(x) {
		if (!isFinite(x)) return '—';
		var s = fmtRaw(x);
		var m = s.match(/^(-?[\d.]+)e([-+]?\d+)$/);
		if (m) return m[1].replace('-', '−') + ' × 10' + sup(m[2].replace('+', ''));
		var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
		var parts = s.split('.');
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		return (neg ? '−' : '') + parts.join('.');
	}
	function sup(p) { var m = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }; return p.replace(/./g, function (ch) { return m[ch] || ch; }); }

	function copyText(t, done) {
		function fallback() {
			var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
			document.body.appendChild(ta); ta.select();
			try { document.execCommand('copy'); done && done(); } catch (e) {}
			document.body.removeChild(ta);
		}
		if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback);
		else fallback();
	}

	/* ---------- Trạng thái ---------- */
	var state = { cat: 'force', pairs: {} };
	try { var s0 = JSON.parse(load('conv-state') || 'null'); if (s0 && s0.cat) state = s0; if (!state.pairs) state.pairs = {}; } catch (e) {}
	var g0 = parseFloat(load('conv-g')); if (g0 === 9.80665 || g0 === 9.81 || g0 === 10) G = g0;
	var sg0 = parseInt(load('conv-sig'), 10); if (sg0 >= 2 && sg0 <= 15) SIG = sg0;
	function persist() { save('conv-state', JSON.stringify(state)); }

	function curCat() { return findCat(state.cat); }
	function curPair() {
		var cat = curCat(), p = state.pairs[cat.id];
		if (!p || !findUnit(cat, p[0]) || !findUnit(cat, p[1])) p = state.pairs[cat.id] = cat.def.slice();
		return p;
	}

	/* ---------- Giao diện ---------- */
	var elCats = $('cats'), elFrom = $('from'), elTo = $('to'), elVal = $('val');

	function renderCats() {
		elCats.innerHTML = '';
		CATS.forEach(function (c) {
			var b = document.createElement('button');
			b.type = 'button'; b.setAttribute('role', 'tab');
			b.textContent = T(c.vi, c.en);
			b.className = c.id === state.cat ? 'is-active' : '';
			b.setAttribute('aria-selected', c.id === state.cat ? 'true' : 'false');
			b.addEventListener('click', function () { state.cat = c.id; persist(); renderAll(); });
			elCats.appendChild(b);
		});
	}

	function unitLabel(u) { return u[1] + ' — ' + T(u[2], u[3]); }

	function renderSelects() {
		var cat = curCat(), p = curPair();
		[elFrom, elTo].forEach(function (sel, k) {
			sel.innerHTML = '';
			cat.units.forEach(function (u) {
				var o = document.createElement('option');
				o.value = u[0]; o.textContent = unitLabel(u);
				sel.appendChild(o);
			});
			sel.value = p[k];
		});
		$('catTitle').textContent = T(cat.vi, cat.en);
	}

	var lastRaw = '';
	function compute() {
		var cat = curCat(), p = curPair(), fu = findUnit(cat, p[0]), tu = findUnit(cat, p[1]);
		var v = num(elVal.value), warn = '';
		elVal.classList.toggle('bad', elVal.value.trim() !== '' && isNaN(v));

		var r = isNaN(v) ? NaN : convert(cat, fu, tu, v);
		if (cat.id === 'slope' && !isNaN(v)) {
			if (fu[0] === 'm' && v === 0) warn = T('m = 0 nghĩa là mái thẳng đứng (độ dốc vô cùng).', 'm = 0 means a vertical face (infinite slope).');
			else if (tu[0] === 'm' && toBase(fu, v) === 0) warn = T('Độ dốc bằng 0 → m vô cùng (mặt nằm ngang).', 'Zero slope → m is infinite (horizontal surface).');
		}
		if (cat.id === 'temp' && !isNaN(v) && toBase(fu, v) < 0) warn = T('Nhiệt độ thấp hơn độ không tuyệt đối.', 'Below absolute zero.');

		$('result').textContent = fmt(r);
		$('resultUnit').textContent = isFinite(r) ? tu[1] : '';
		lastRaw = isFinite(r) ? fmtRaw(r) : '';
		$('btnCopy').disabled = !lastRaw;
		$('warn').hidden = !warn; $('warn').textContent = warn;

		// Hệ số 1 đơn vị
		var eq = '';
		if (typeof fu[4] !== 'object') {
			eq = '1 ' + fu[1] + ' = ' + fmt(convert(cat, fu, tu, 1)) + ' ' + tu[1] +
				'  ·  1 ' + tu[1] + ' = ' + fmt(convert(cat, tu, fu, 1)) + ' ' + fu[1];
			if (typeof fu[4] === 'function' || typeof tu[4] === 'function') eq += '  (g = ' + G + ')';
		} else if (cat.id === 'slope') {
			eq = T('i = tanα = h / L;  m = L / h = 1 / i', 'i = tanα = rise / run;  m = run / rise = 1 / i');
		} else if (cat.id === 'temp') {
			eq = '°F = °C × 9/5 + 32  ·  K = °C + 273.15';
		}
		$('eq').textContent = eq;

		renderTable(cat, fu, tu, v);
	}

	function renderTable(cat, fu, tu, v) {
		var tb = $('allTable'); tb.innerHTML = '';
		var b = isNaN(v) ? NaN : toBase(fu, v);
		cat.units.forEach(function (u) {
			var val = isNaN(b) ? NaN : fromBase(u, b);
			var tr = document.createElement('tr');
			if (u[0] === fu[0]) tr.className = 'is-from';
			if (u[0] === tu[0]) tr.className = 'is-to';
			tr.innerHTML = '<td class="u-sym"></td><td class="u-name"></td><td class="u-val"></td>';
			tr.children[0].textContent = u[1];
			tr.children[1].textContent = T(u[2], u[3]);
			tr.children[2].textContent = fmt(val);
			tr.title = T('Bấm để sao chép', 'Click to copy');
			tr.addEventListener('click', function () {
				var raw = isFinite(val) ? fmtRaw(val) : ''; if (!raw) return;
				copyText(raw, function () { tr.classList.add('copied'); setTimeout(function () { tr.classList.remove('copied'); }, 1200); });
			});
			tb.appendChild(tr);
		});
	}

	function renderGSeg() {
		Array.prototype.forEach.call($('gSeg').children, function (b) { b.classList.toggle('is-active', parseFloat(b.dataset.g) === G); });
	}

	/* ---------- Thép tròn ---------- */
	function steel() {
		var d = num($('sd').value), L = num($('sl').value), n = num($('sn').value);
		var out = $('steelOut');
		if (!(d > 0)) { out.innerHTML = '<p class="hint">' + T('Nhập đường kính d > 0.', 'Enter a diameter d > 0.') + '</p>'; return; }
		var As = Math.PI * d * d / 4;            // mm²
		var kgm = As * 1e-6 * 7850;              // kg/m
		var tot = (L > 0 && n > 0) ? kgm * L * n : NaN;
		var cells = [
			[T('Diện tích tiết diện', 'Cross-section area'), fmt(As / 100) + ' cm²'],
			[T('Trọng lượng 1 m', 'Weight per metre'), fmt(kgm) + ' kg/m'],
			[T('Tổng chiều dài', 'Total length'), isFinite(tot) ? fmt(L * n) + ' m' : '—'],
			[T('Tổng (tấn)', 'Total (tonnes)'), isFinite(tot) ? fmt(tot / 1000) + ' t' : '—']
		];
		var html = '<div class="big"><span>' + T('Tổng trọng lượng', 'Total weight') + '</span><b>' + (isFinite(tot) ? fmt(tot) + ' kg' : '—') + '</b></div>';
		cells.forEach(function (c) { html += '<div><span>' + c[0] + '</span><b>' + c[1] + '</b></div>'; });
		out.innerHTML = html;
	}

	function renderAll() { renderCats(); renderSelects(); renderGSeg(); compute(); steel(); }

	/* ---------- Sự kiện ---------- */
	elVal.addEventListener('input', compute);
	elFrom.addEventListener('change', function () { curPair()[0] = elFrom.value; persist(); compute(); });
	elTo.addEventListener('change', function () { curPair()[1] = elTo.value; persist(); compute(); });
	$('swap').addEventListener('click', function () {
		var p = curPair(), t = p[0]; p[0] = p[1]; p[1] = t; persist();
		if (lastRaw) elVal.value = lastRaw;
		elFrom.value = p[0]; elTo.value = p[1]; compute();
	});
	$('btnCopy').addEventListener('click', function () {
		if (!lastRaw) return;
		var btn = this, old = btn.innerHTML;
		copyText(lastRaw, function () { btn.textContent = T('Đã chép ✓', 'Copied ✓'); setTimeout(function () { btn.innerHTML = old; }, 1200); });
	});
	$('sig').value = SIG;
	$('sig').addEventListener('input', function () {
		var n = parseInt(this.value, 10); if (n >= 2 && n <= 15) { SIG = n; save('conv-sig', n); compute(); steel(); }
	});
	Array.prototype.forEach.call($('gSeg').children, function (b) {
		b.addEventListener('click', function () { G = parseFloat(b.dataset.g); save('conv-g', G); renderGSeg(); compute(); });
	});
	['sd', 'sl', 'sn'].forEach(function (id) { $(id).addEventListener('input', steel); });

	/* ---------- Ngôn ngữ, giao diện ---------- */
	$('langBtn').addEventListener('click', function () {
		var n = root.dataset.lang === 'en' ? 'vi' : 'en';
		root.dataset.lang = n; root.lang = n; save('lang', n); renderAll();
	});
	$('themeBtn').addEventListener('click', function () {
		var n = root.dataset.theme === 'light' ? 'dark' : 'light';
		root.dataset.theme = n; save('theme', n);
	});
	$('year').textContent = new Date().getFullYear();

	renderAll();
})();
