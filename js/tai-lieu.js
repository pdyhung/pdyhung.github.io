(function () {
	'use strict';
	var root = document.documentElement;
	function $(id) { return document.getElementById(id); }
	function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
	function isEn() { return root.dataset.lang === 'en'; }

	$('langBtn').addEventListener('click', function () {
		var n = isEn() ? 'vi' : 'en'; root.dataset.lang = n; root.lang = n; save('lang', n);
		$('q').placeholder = isEn() ? 'Search: steel bridge exam, RC project, midas…' : 'Tìm: đề thi cầu thép, đồ án BTCT, midas…';
		render();
	});
	$('themeBtn').addEventListener('click', function () {
		var n = root.dataset.theme === 'light' ? 'dark' : 'light'; root.dataset.theme = n; save('theme', n);
	});
	$('year').textContent = new Date().getFullYear();
	if (isEn()) $('q').placeholder = 'Search: steel bridge exam, RC project, midas…';

	var TYPES = {
		'de-thi': ['Đề thi', 'Exams'], 'de-cuong': ['Đề cương ôn tập', 'Review notes'], 'do-an': ['Đồ án', 'Design projects'],
		'bai-tap': ['Bài tập & lời giải', 'Exercises'], 'huong-dan': ['Hướng dẫn', 'Guides']
	};
	var FIELDS = {
		'cau-duong': ['Cầu đường', 'Bridges & roads'], 'ket-cau': ['Kết cấu – DD&CN', 'Structures'], 'thuy-bien': ['Thuỷ – Biển', 'Hydraulic & marine'],
		'kien-truc': ['Kiến trúc', 'Architecture'], 'co-khi': ['Cơ khí XD', 'Construction machinery'], 'dai-cuong': ['Đại cương', 'General'], 'phan-mem': ['Phần mềm', 'Software']
	};
	function L(pair) { return isEn() ? pair[1] : pair[0]; }

	/* bỏ dấu tiếng Việt để tìm không cần gõ dấu */
	function fold(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
	var DATA = (window.TL_DATA || []).map(function (r) {
		return { title: r[0], url: window.TL_SOURCE + r[1] + '.html', type: r[2], field: r[3], year: r[4], key: fold(r[0] + ' ' + TYPES[r[2]][0] + ' ' + FIELDS[r[3]][0]), raw: (r[0] + ' ' + TYPES[r[2]][0] + ' ' + FIELDS[r[3]][0]).toLowerCase() };
	});

	var st = { type: 'all', field: 'all', q: '' };
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

	function chips(el, dict, key) {
		var counts = {};
		DATA.forEach(function (d) {
			if (key === 'type' ? (st.field === 'all' || d.field === st.field) : (st.type === 'all' || d.type === st.type)) counts[d[key]] = (counts[d[key]] || 0) + 1;
		});
		var total = Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0);
		var h = '<button type="button" class="filter' + (st[key] === 'all' ? ' is-active' : '') + '" data-v="all">' + (isEn() ? 'All' : 'Tất cả') + '<small>' + total + '</small></button>';
		Object.keys(dict).forEach(function (k) {
			if (!counts[k]) return;
			h += '<button type="button" class="filter' + (st[key] === k ? ' is-active' : '') + '" data-v="' + k + '">' + L(dict[k]) + '<small>' + counts[k] + '</small></button>';
		});
		el.innerHTML = h;
	}
	function hl(title, words) {
		if (!words.length) return esc(title);
		var f = fold(title), marks = new Array(title.length).fill(false);
		words.forEach(function (w) { var i = f.indexOf(w); while (i > -1) { for (var k = i; k < i + w.length; k++) marks[k] = true; i = f.indexOf(w, i + 1); } });
		var out = '', open = false;
		for (var i = 0; i < title.length; i++) {
			if (marks[i] && !open) { out += '<mark>'; open = true; }
			if (!marks[i] && open) { out += '</mark>'; open = false; }
			out += esc(title[i]);
		}
		return out + (open ? '</mark>' : '');
	}
	function render() {
		chips($('fType'), TYPES, 'type');
		chips($('fField'), FIELDS, 'field');
		/* gõ có dấu → khớp đúng dấu; gõ không dấu → khớp bỏ dấu */
		var terms = st.q.toLowerCase().split(/\s+/).filter(Boolean).map(function (w) { return { w: w, plain: fold(w) === w }; });
		var words = terms.map(function (t) { return fold(t.w); });
		var list = DATA.filter(function (d) {
			return (st.type === 'all' || d.type === st.type) && (st.field === 'all' || d.field === st.field) &&
				terms.every(function (t) { return t.plain ? d.key.indexOf(t.w) > -1 : d.raw.indexOf(t.w) > -1; });
		});
		$('list').innerHTML = list.map(function (d) {
			return '<li><a class="doc" href="' + d.url + '" target="_blank" rel="noopener">' +
				'<span class="doc-tags"><span class="book-tag t-' + d.type + '">' + L(TYPES[d.type]) + '</span><span class="tag-f">' + L(FIELDS[d.field]) + '</span><span class="doc-year">' + d.year + '</span></span>' +
				'<h3>' + hl(d.title, words) + '</h3>' +
				'<span class="doc-foot"><span>svxaydung.blogspot.com</span><span>' + (isEn() ? 'Open post' : 'Mở bài viết') + ' ↗</span></span></a></li>';
		}).join('');
		$('count').innerHTML = '<b>' + list.length + '</b> / ' + DATA.length + (isEn() ? ' documents' : ' tài liệu');
		$('empty').hidden = list.length > 0;
	}
	$('fType').addEventListener('click', function (e) { var b = e.target.closest('.filter'); if (b) { st.type = b.dataset.v; render(); } });
	$('fField').addEventListener('click', function (e) { var b = e.target.closest('.filter'); if (b) { st.field = b.dataset.v; render(); } });
	$('q').addEventListener('input', function () { st.q = this.value; render(); });
	render();
})();
