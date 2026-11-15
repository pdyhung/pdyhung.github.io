/* =========================================================
   Ký hiệu đặc biệt: xây dựng, toán học thông dụng
   Mỗi mục: [ký hiệu, tên VI, tên EN, công dụng VI, công dụng EN]
   ========================================================= */
(function () {
	'use strict';
	var root = document.documentElement;
	function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
	function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function $(id) { return document.getElementById(id); }
	function isEn() { return root.dataset.lang === 'en'; }
	function T(vi, en) { return isEn() ? en : vi; }

	var GROUPS = [
		{ id: 'xd', vi: 'Xây dựng – Kết cấu', en: 'Construction – Structural',
			dvi: 'Hay dùng trên bản vẽ, thống kê thép, thuyết minh tính toán.', den: 'Common on drawings, rebar schedules and design reports.', items: [
			['Ø', 'Đường kính (chữ O gạch)', 'Diameter (slashed O)', 'Thép Ø16, ống Ø300', 'Rebar Ø16, pipe Ø300'],
			['⌀', 'Ký hiệu đường kính chuẩn', 'Diameter sign', 'Ít font hỗ trợ hơn Ø', 'Fewer fonts support it than Ø'],
			['Φ', 'Phi hoa', 'Capital phi', 'Ký hiệu thép tròn trơn/gân', 'Round bar notation'],
			['°', 'Độ', 'Degree', 'Góc 45°, nhiệt độ 30°C', 'Angle 45°, temperature 30°C'],
			['±', 'Cộng trừ', 'Plus-minus', 'Cao độ ±0.000, dung sai ±5 mm', 'Level ±0.000, tolerance ±5 mm'],
			['′', 'Phút (góc), foot', 'Prime (arcminute, foot)', '30°15′', '30°15′'],
			['″', 'Giây (góc), inch', 'Double prime (arcsecond, inch)', '30°15′20″', '30°15′20″'],
			['∠', 'Góc', 'Angle', '∠ABC', '∠ABC'],
			['⊥', 'Vuông góc', 'Perpendicular', 'AB ⊥ CD', 'AB ⊥ CD'],
			['∥', 'Song song', 'Parallel', 'AB ∥ CD', 'AB ∥ CD'],
			['℄', 'Tim, đường trục', 'Centre line', 'Tim cọc, tim đường', 'Pile/road centre line'],
			['▽', 'Cao độ, mực nước', 'Level, water level', '▽ +12.50, MNTK', '▽ +12.50, design water level'],
			['▼', 'Cao độ (tô đặc)', 'Level mark (filled)', 'Cao độ hoàn thiện', 'Finished level'],
			['△', 'Mốc, tam giác', 'Benchmark, triangle', 'Mốc cao độ, điểm khống chế', 'Benchmark, control point'],
			['@', 'Khoảng cách (a)', 'Spacing (at)', 'Ø8@200 (≈ Ø8 a200)', 'Ø8@200'],
			['‰', 'Phần nghìn', 'Per mille', 'Độ dốc dọc i = 5‰', 'Longitudinal slope 5‰'],
			['%', 'Phần trăm', 'Percent', 'Độ dốc ngang 2%', 'Cross slope 2%'],
			['×', 'Nhân, kích thước', 'Times, dimensions', 'Tiết diện 220×500', 'Section 220×500'],
			['÷', 'Chia, khoảng', 'Division, range', 'Đá 1÷2, 4÷6', 'Aggregate 1÷2'],
			['≈', 'Xấp xỉ', 'Approximately', 'L ≈ 12 m', 'L ≈ 12 m'],
			['µ', 'Micro (µ), hàm lượng thép', 'Micro, reinforcement ratio', 'µm, µ = 1.2%', 'µm, µ = 1.2%'],
			['№', 'Số hiệu', 'Number sign', '№ 1', 'No. 1']
		]},
		{ id: 'dv', vi: 'Đơn vị & cụm hay gõ', en: 'Units & common strings', wide: true,
			dvi: 'Bấm để chép cả cụm.', den: 'Click to copy the whole string.', items: [
			['m²', 'Mét vuông', 'Square metre'], ['m³', 'Mét khối', 'Cubic metre'],
			['cm²', 'Centimet vuông', 'Square centimetre'], ['mm²', 'Milimet vuông', 'Square millimetre'],
			['kN/m²', 'Tải mặt', 'Area load'], ['kN/m³', 'Trọng lượng riêng', 'Unit weight'],
			['kG/cm²', 'Áp lực, cường độ (cũ)', 'Pressure, strength (old)'], ['T/m²', 'Tải mặt (tấn)', 'Area load (tf)'],
			['N/mm²', 'Ứng suất (= MPa)', 'Stress (= MPa)'], ['kN·m', 'Mô men', 'Moment'],
			['T·m', 'Mô men (tấn)', 'Moment (tf)'], ['m³/s', 'Lưu lượng', 'Flow rate'],
			['°C', 'Độ C', 'Degree Celsius'], ['Ø16 a200', 'Bố trí thép', 'Rebar layout'],
			['±0.000', 'Cao độ chuẩn', 'Datum level'], ['i = 2‰', 'Độ dốc', 'Slope']
		]},
		{ id: 'pt', vi: 'Toán tử & so sánh', en: 'Operators & relations', items: [
			['≤', 'Nhỏ hơn hoặc bằng', 'Less than or equal', 'σ ≤ R', 'σ ≤ R'],
			['≥', 'Lớn hơn hoặc bằng', 'Greater than or equal', 'K ≥ 1.2', 'K ≥ 1.2'],
			['≠', 'Khác', 'Not equal'], ['≡', 'Đồng nhất', 'Identical'],
			['≪', 'Nhỏ hơn nhiều', 'Much less than'], ['≫', 'Lớn hơn nhiều', 'Much greater than'],
			['∓', 'Trừ cộng', 'Minus-plus'], ['·', 'Nhân (chấm giữa)', 'Middle dot (times)', 'kN·m', 'kN·m'],
			['−', 'Dấu trừ (chuẩn)', 'Minus sign', 'Khác gạch nối -', 'Not the hyphen -'],
			['√', 'Căn bậc hai', 'Square root'], ['∛', 'Căn bậc ba', 'Cube root'], ['∜', 'Căn bậc bốn', 'Fourth root'],
			['∝', 'Tỉ lệ với', 'Proportional to'], ['∞', 'Vô cùng', 'Infinity'],
			['∑', 'Tổng', 'Summation', '∑M = 0', '∑M = 0'], ['∏', 'Tích', 'Product'],
			['∫', 'Tích phân', 'Integral'], ['∬', 'Tích phân kép', 'Double integral'], ['∮', 'Tích phân vòng', 'Contour integral'],
			['∂', 'Đạo hàm riêng', 'Partial derivative'], ['∇', 'Nabla', 'Nabla'],
			['∆', 'Số gia, chênh lệch', 'Increment', '∆h, ∆L', '∆h, ∆L'],
			['¬', 'Phủ định', 'Not'], ['|x|', 'Trị tuyệt đối', 'Absolute value']
		]},
		{ id: 'tl', vi: 'Tập hợp & logic', en: 'Sets & logic', items: [
			['∈', 'Thuộc', 'Element of'], ['∉', 'Không thuộc', 'Not an element of'],
			['⊂', 'Tập con', 'Subset'], ['⊆', 'Tập con hoặc bằng', 'Subset or equal'], ['⊃', 'Chứa', 'Superset'],
			['∪', 'Hợp', 'Union'], ['∩', 'Giao', 'Intersection'], ['∅', 'Tập rỗng', 'Empty set'],
			['∀', 'Với mọi', 'For all'], ['∃', 'Tồn tại', 'There exists'],
			['∧', 'Và', 'And'], ['∨', 'Hoặc', 'Or'],
			['⇒', 'Suy ra', 'Implies'], ['⇔', 'Tương đương', 'If and only if'],
			['∴', 'Vì vậy', 'Therefore'], ['∵', 'Bởi vì', 'Because'],
			['ℕ', 'Số tự nhiên', 'Natural numbers'], ['ℤ', 'Số nguyên', 'Integers'],
			['ℚ', 'Số hữu tỉ', 'Rationals'], ['ℝ', 'Số thực', 'Real numbers']
		]},
		{ id: 'hl', vi: 'Chữ Hy Lạp trong kết cấu', en: 'Greek letters in structural design',
			dvi: 'Ý nghĩa thường gặp theo TCVN (có thể khác tuỳ tiêu chuẩn).', den: 'Typical meanings (may vary by code).', items: [
			['α', 'alpha', 'alpha', 'Góc, hệ số, hệ số giãn nở nhiệt', 'Angle, coefficient, thermal expansion'],
			['β', 'beta', 'beta', 'Hệ số, góc', 'Coefficient, angle'],
			['γ', 'gamma', 'gamma', 'Trọng lượng riêng, hệ số độ tin cậy', 'Unit weight, partial safety factor'],
			['δ', 'delta', 'delta', 'Chuyển vị, độ võng', 'Displacement, deflection'],
			['Δ', 'Delta hoa', 'Capital delta', 'Độ lún, chênh lệch', 'Settlement, difference'],
			['ε', 'epsilon', 'epsilon', 'Biến dạng tương đối', 'Strain'],
			['ζ', 'zeta', 'zeta', 'Hệ số tổn thất cục bộ', 'Local loss coefficient'],
			['η', 'eta', 'eta', 'Hệ số uốn dọc, hiệu suất', 'Magnification factor, efficiency'],
			['θ', 'theta', 'theta', 'Góc xoay', 'Rotation angle'],
			['λ', 'lambda', 'lambda', 'Độ mảnh, hệ số ma sát', 'Slenderness, friction factor'],
			['μ', 'mu', 'mu', 'Hàm lượng cốt thép, hệ số ma sát', 'Reinforcement ratio, friction coefficient'],
			['ν', 'nu', 'nu', 'Hệ số Poisson, độ nhớt động học', 'Poisson ratio, kinematic viscosity'],
			['ξ', 'xi', 'xi', 'Chiều cao tương đối vùng nén', 'Relative compression zone depth'],
			['π', 'pi', 'pi', '3.14159…', '3.14159…'],
			['ρ', 'rho', 'rho', 'Khối lượng riêng, hàm lượng thép', 'Density, steel ratio'],
			['σ', 'sigma', 'sigma', 'Ứng suất pháp', 'Normal stress'],
			['Σ', 'Sigma hoa', 'Capital sigma', 'Tổng', 'Sum'],
			['τ', 'tau', 'tau', 'Ứng suất tiếp', 'Shear stress'],
			['φ', 'phi', 'phi', 'Góc ma sát trong, hệ số uốn dọc', 'Internal friction angle, buckling factor'],
			['χ', 'chi', 'chi', 'Hệ số', 'Coefficient'],
			['ψ', 'psi', 'psi', 'Hệ số tổ hợp', 'Combination factor'],
			['ω', 'omega', 'omega', 'Tần số góc, diện tích ướt', 'Angular frequency, wetted area'],
			['Ω', 'Omega hoa', 'Capital omega', 'Ohm, diện tích', 'Ohm, area'],
			['Γ', 'Gamma hoa', 'Capital gamma', 'Hàm Gamma', 'Gamma function'],
			['Λ', 'Lambda hoa', 'Capital lambda'], ['Ψ', 'Psi hoa', 'Capital psi']
		]},
		{ id: 'cs', vi: 'Chỉ số trên, dưới & phân số', en: 'Super/subscripts & fractions', items: [
			['²', 'Mũ 2', 'Superscript 2'], ['³', 'Mũ 3', 'Superscript 3'], ['¹', 'Mũ 1', 'Superscript 1'],
			['⁰', 'Mũ 0', 'Superscript 0'], ['⁴', 'Mũ 4', 'Superscript 4'], ['⁵', 'Mũ 5', 'Superscript 5'],
			['⁶', 'Mũ 6', 'Superscript 6'], ['⁷', 'Mũ 7', 'Superscript 7'], ['⁸', 'Mũ 8', 'Superscript 8'], ['⁹', 'Mũ 9', 'Superscript 9'],
			['⁻', 'Mũ âm', 'Superscript minus', '10⁻³', '10⁻³'], ['ⁿ', 'Mũ n', 'Superscript n'],
			['₀', 'Chỉ số 0', 'Subscript 0'], ['₁', 'Chỉ số 1', 'Subscript 1'], ['₂', 'Chỉ số 2', 'Subscript 2', 'h₂, CO₂', 'h₂, CO₂'],
			['₃', 'Chỉ số 3', 'Subscript 3'], ['₄', 'Chỉ số 4', 'Subscript 4'], ['ₓ', 'Chỉ số x', 'Subscript x'],
			['½', 'Một phần hai', 'One half'], ['⅓', 'Một phần ba', 'One third'], ['¼', 'Một phần tư', 'One quarter'],
			['¾', 'Ba phần tư', 'Three quarters'], ['⅛', 'Một phần tám', 'One eighth']
		]},
		{ id: 'mt', vi: 'Mũi tên, hình & ký hiệu khác', en: 'Arrows, shapes & misc.', items: [
			['→', 'Mũi tên phải', 'Right arrow'], ['←', 'Mũi tên trái', 'Left arrow'],
			['↑', 'Mũi tên lên', 'Up arrow'], ['↓', 'Mũi tên xuống', 'Down arrow'],
			['↔', 'Hai chiều', 'Left-right arrow'], ['⇄', 'Đổi chiều', 'Swap arrows'],
			['↗', 'Chéo lên', 'North-east arrow'], ['↘', 'Chéo xuống', 'South-east arrow'],
			['■', 'Ô vuông đặc', 'Black square'], ['□', 'Ô vuông rỗng', 'White square'],
			['●', 'Chấm tròn đặc', 'Black circle'], ['○', 'Vòng tròn rỗng', 'White circle'],
			['▲', 'Tam giác đặc', 'Black triangle'], ['◆', 'Thoi đặc', 'Black diamond'],
			['✓', 'Đánh dấu', 'Check mark'], ['✗', 'Gạch chéo', 'Cross mark'],
			['•', 'Gạch đầu dòng', 'Bullet'], ['–', 'Gạch ngang ngắn', 'En dash', 'Khoảng 3–5 m', 'Range 3–5 m'],
			['—', 'Gạch ngang dài', 'Em dash'], ['…', 'Ba chấm', 'Ellipsis'],
			['§', 'Điều, mục', 'Section'], ['※', 'Ghi chú', 'Reference mark'],
			['©', 'Bản quyền', 'Copyright'], ['®', 'Đã đăng ký', 'Registered'], ['™', 'Thương hiệu', 'Trademark']
		]}
	];

	/* Mã Alt (Windows, bàn phím số) cho ký tự có trong bảng mã 1252 */
	var ALT = { '°': '0176', '±': '0177', '²': '0178', '³': '0179', 'µ': '0181', '·': '0183', '¹': '0185', '¼': '0188', '½': '0189', '¾': '0190',
		'×': '0215', 'Ø': '0216', '÷': '0247', '‰': '0137', '•': '0149', '…': '0133', '–': '0150', '—': '0151', '§': '0167', '©': '0169',
		'®': '0174', '™': '0153', '¬': '0172' };
	var CAD_SPECIAL = { 'Ø': '%%c', '⌀': '%%c', '°': '%%d', '±': '%%p' };

	function hex(cp) { var h = cp.toString(16).toUpperCase(); while (h.length < 4) h = '0' + h; return h; }
	function chars(s) { return Array.from ? Array.from(s) : s.split(''); }
	function isAscii(ch) { return ch.codePointAt(0) < 128; }

	function toCad(s) { return chars(s).map(function (ch) { return isAscii(ch) ? ch : (CAD_SPECIAL[ch] || '\\U+' + hex(ch.codePointAt(0))); }).join(''); }
	function toHtml(s) { return chars(s).map(function (ch) { return isAscii(ch) ? ch.replace(/&/g, '&amp;').replace(/</g, '&lt;') : '&#x' + hex(ch.codePointAt(0)) + ';'; }).join(''); }
	function toXls(s) {
		var parts = [], buf = '';
		chars(s).forEach(function (ch) {
			if (isAscii(ch)) buf += ch;
			else { if (buf) { parts.push('"' + buf.replace(/"/g, '""') + '"'); buf = ''; } parts.push('UNICHAR(' + ch.codePointAt(0) + ')'); }
		});
		if (buf) parts.push('"' + buf.replace(/"/g, '""') + '"');
		return '=' + parts.join('&');
	}
	function asMode(s, m) { return m === 'cad' ? toCad(s) : m === 'xls' ? toXls(s) : m === 'html' ? toHtml(s) : s; }

	/* Bỏ dấu tiếng Việt để tìm kiếm */
	function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }

	var MODE = load('sym-mode'); if (['char', 'cad', 'xls', 'html'].indexOf(MODE) < 0) MODE = 'char';

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
	var toastTimer;
	function toast(msg) {
		var el = $('toast'); el.textContent = msg; el.classList.add('show');
		clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1400);
	}

	/* ---------- Vẽ ---------- */
	function render() {
		var q = fold($('q').value.trim()), host = $('groups'), jump = $('jump'), total = 0;
		host.innerHTML = ''; jump.innerHTML = '';
		GROUPS.forEach(function (g) {
			var items = g.items.filter(function (it) {
				if (!q) return true;
				return it[0].toLowerCase().indexOf($('q').value.trim().toLowerCase()) > -1 ||
					fold(it.slice(1).join(' ')).indexOf(q) > -1 || fold(g.vi + ' ' + g.en).indexOf(q) > -1;
			});
			if (!items.length) return;
			total += items.length;

			var a = document.createElement('a'); a.href = '#g-' + g.id; a.textContent = T(g.vi, g.en);
			jump.appendChild(a);

			var sec = document.createElement('section'); sec.className = 'sym-group'; sec.id = 'g-' + g.id;
			var h = document.createElement('h2'); h.textContent = T(g.vi, g.en); sec.appendChild(h);
			var desc = document.createElement('p'); desc.textContent = (g.dvi ? T(g.dvi, g.den) + ' ' : '') + '(' + items.length + ')'; sec.appendChild(desc);
			var grid = document.createElement('div'); grid.className = 'sym-grid' + (g.wide ? ' wide' : '');

			items.forEach(function (it) {
				var s = it[0], single = chars(s).length === 1;
				var b = document.createElement('button'); b.type = 'button'; b.className = 'sym';
				var html = '<span class="sym-ch' + (single ? '' : ' str') + '"></span><span class="sym-name"></span>';
				if (it[3]) html += '<span class="sym-use"></span>';
				html += '<span class="sym-codes"></span>';
				b.innerHTML = html;
				b.querySelector('.sym-ch').textContent = s;
				b.querySelector('.sym-name').textContent = T(it[1], it[2]);
				if (it[3]) b.querySelector('.sym-use').textContent = T(it[3], it[4] || it[3]);
				var codes = b.querySelector('.sym-codes');
				function addCode(txt, hot) { var c = document.createElement('code'); c.textContent = txt; if (hot) c.className = 'hot'; codes.appendChild(c); }
				if (single) {
					addCode('U+' + hex(s.codePointAt(0)));
					if (CAD_SPECIAL[s]) addCode('CAD ' + CAD_SPECIAL[s], true);
					if (ALT[s]) addCode('Alt+' + ALT[s]);
				} else {
					addCode('CAD ' + toCad(s));
				}
				b.title = T('Bấm để sao chép: ', 'Click to copy: ') + asMode(s, MODE);
				b.addEventListener('click', function () {
					var out = asMode(s, MODE);
					var tray = $('tray'); tray.value += s;
					copyText(out, function () {
						b.classList.add('done'); setTimeout(function () { b.classList.remove('done'); }, 900);
						toast(T('Đã chép: ', 'Copied: ') + out);
					});
				});
				grid.appendChild(b);
			});
			sec.appendChild(grid);
			host.appendChild(sec);
		});
		$('empty').hidden = total > 0;
	}

	function renderMode() {
		Array.prototype.forEach.call($('mode').children, function (b) { b.classList.toggle('is-active', b.dataset.m === MODE); });
	}

	/* ---------- Sự kiện ---------- */
	$('q').addEventListener('input', render);
	Array.prototype.forEach.call($('mode').children, function (b) {
		b.addEventListener('click', function () { MODE = b.dataset.m; save('sym-mode', MODE); renderMode(); render(); });
	});
	$('trayCopy').addEventListener('click', function () {
		var v = $('tray').value; if (!v) return;
		var out = asMode(v, MODE);
		copyText(out, function () { toast(T('Đã chép: ', 'Copied: ') + out); });
	});
	$('trayClear').addEventListener('click', function () { $('tray').value = ''; $('tray').focus(); });

	$('langBtn').addEventListener('click', function () {
		var n = root.dataset.lang === 'en' ? 'vi' : 'en';
		root.dataset.lang = n; root.lang = n; save('lang', n); render();
	});
	$('themeBtn').addEventListener('click', function () {
		var n = root.dataset.theme === 'light' ? 'dark' : 'light';
		root.dataset.theme = n; save('theme', n);
	});
	$('year').textContent = new Date().getFullYear();

	renderMode(); render();
})();
