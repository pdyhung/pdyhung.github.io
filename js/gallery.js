/* =========================================================
   Album ca đoàn – dữ liệu + hiển thị
   Thêm ảnh mới: đặt file vào assets/choir/<prefix>-NN.jpg
   (bản nhỏ vào assets/choir/thumb/) rồi tăng "count".
   ========================================================= */
(function () {
	'use strict';

	var ALBUMS = [
		{
			id: 'bon-mang', prefix: 'bon-mang', count: 20, latest: true,
			vi: { title: 'Lễ bổn mạng 2026', desc: 'Thánh lễ mừng kính các Thánh Tử Đạo Việt Nam – Giáo xứ Vũng Tàu · 15/11/2026' },
			en: { title: 'Patronal feast 2026', desc: 'Mass of the Vietnamese Martyrs – Vung Tau Parish · Nov 15, 2026' }
		},
		{
			id: 'bai-dau', prefix: 'bai-dau', count: 12,
			vi: { title: 'Chầu lượt tại nhà thờ Bãi Dâu', desc: 'Ca đoàn đại diện giáo xứ phục vụ chầu lượt đầu tháng – Giáo phận Bà Rịa' },
			en: { title: 'Adoration at Bai Dau Church', desc: 'Representing the parish at the monthly Eucharistic adoration – Diocese of Ba Ria' },
			captions: { 11: ['Chụp chung với Đức cha giáo phận', 'Dịp phục vụ chầu lượt đại diện giáo xứ'],
			            12: ['Chụp chung với Đức cha giáo phận', 'Dịp phục vụ chầu lượt đại diện giáo xứ'] }
		},
		{
			id: 'lien-hoan', prefix: 'lien-hoan', count: 8,
			videos: ['video/lien-hoan-01', 'video/lien-hoan-02'],
			vi: { title: 'Liên hoan ca đoàn', desc: 'Những phút vui vẻ bên nhau' },
			en: { title: 'Choir gathering', desc: 'Good times together' }
		},
		{
			id: 'dam-cuoi', prefix: 'dam-cuoi', count: 1,
			vi: { title: 'Đám cưới em Khánh', desc: 'Mừng ngày vui của Khánh – thành viên ca đoàn' },
			en: { title: "Khanh's wedding", desc: 'Celebrating the wedding of Khanh, a choir member' }
		},
		{
			id: 'ky-niem', prefix: 'ky-niem-2022', count: 7,
			vi: { title: 'Kỷ niệm 2022', desc: 'Những tấm ảnh đầu tiên' },
			en: { title: 'Memories 2022', desc: 'Our earliest photos' },
			captions: {
				1: ['Thôi Lôi ca đoàn năm 2022', 'Được chụp cùng cha Tuấn :)'],
				2: ['Kỷ niệm 5 năm chịu chức Linh mục cha Trần Tuấn', 'Hình ảnh sau thánh lễ :3'],
				3: ['Kỷ niệm 5 năm chịu chức Linh mục cha Trần Tuấn', 'Cha đâu mất rồi!!! :v'],
				4: ['Kỷ niệm 5 năm chịu chức Linh mục cha Trần Tuấn', 'Bắn tim cho cha!!!'],
				5: ['Chị em lên đồ mới!!!', 'Chị em đẹp quá!!!'],
				6: ['Sinh nhật chị Ny', 'Quà của chị đâu? :v'],
				7: ['Liên hoan chia tay em Hương!', 'Em đi sao không khóc :v']
			}
		}
	];

	var BASE = 'assets/choir/';
	var PAGE = 12;                       // số ảnh hiện trước khi bấm "Xem thêm"
	var root = document.documentElement;
	var tabsEl = document.getElementById('albumTabs');
	var gridEl = document.getElementById('albumGrid');
	var headEl = document.getElementById('albumHead');
	var moreBtn = document.getElementById('albumMore');
	if (!tabsEl || !gridEl) return;

	function pad(n) { return n < 10 ? '0' + n : '' + n; }
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function bi(a, key) { return '<span class="vi">' + esc(a.vi[key]) + '</span><span class="en">' + esc(a.en[key]) + '</span>'; }
	function lang() { return root.dataset.lang === 'en' ? 'en' : 'vi'; }

	/* Danh sách mục (ảnh + video) của một album */
	function itemsOf(a) {
		var list = [];
		(a.videos || []).forEach(function (v) { list.push({ type: 'video', src: BASE + v + '.mp4', thumb: BASE + v + '.jpg' }); });
		for (var i = 1; i <= a.count; i++) {
			var name = a.prefix + '-' + pad(i) + '.jpg';
			list.push({ type: 'img', src: BASE + name, thumb: BASE + 'thumb/' + name, cap: (a.captions && a.captions[i]) || null });
		}
		return list;
	}

	/* ---------- Thẻ chọn album ---------- */
	tabsEl.innerHTML = ALBUMS.map(function (a) {
		var cover = a.cover ? BASE + a.cover : BASE + 'thumb/' + a.prefix + '-01.jpg';
		var n = a.count + (a.videos ? a.videos.length : 0);
		return '<button type="button" class="album-tab" data-id="' + a.id + '">' +
			'<img src="' + cover + '" alt="" loading="lazy">' +
			'<span class="album-tab-body">' +
				(a.latest ? '<span class="album-new"><span class="vi">Mới nhất</span><span class="en">Latest</span></span>' : '') +
				'<strong>' + bi(a, 'title') + '</strong>' +
				'<small>' + n + ' <span class="vi">ảnh / video</span><span class="en">photos / videos</span></small>' +
			'</span></button>';
	}).join('');

	var current = null, items = [], shown = 0;

	function renderMore() {
		var html = '';
		var end = Math.min(items.length, shown + PAGE);
		for (var i = shown; i < end; i++) {
			var it = items[i];
			html += '<button type="button" class="tile' + (it.type === 'video' ? ' tile-video' : '') + '" data-i="' + i + '">' +
				'<img src="' + it.thumb + '" alt="' + esc(it.cap ? it.cap[0] : current.vi.title) + '" loading="lazy">' +
				(it.type === 'video' ? '<span class="play" aria-hidden="true">▶</span>' : '') +
				(it.cap ? '<span class="tile-cap">' + esc(it.cap[0]) + '</span>' : '') +
				'</button>';
		}
		gridEl.insertAdjacentHTML('beforeend', html);
		shown = end;
		moreBtn.hidden = shown >= items.length;
	}

	function select(id) {
		current = ALBUMS.filter(function (a) { return a.id === id; })[0] || ALBUMS[0];
		items = itemsOf(current);
		shown = 0;
		gridEl.innerHTML = '';
		headEl.innerHTML = '<h3>' + bi(current, 'title') + '</h3><p>' + bi(current, 'desc') + '</p>';
		tabsEl.querySelectorAll('.album-tab').forEach(function (t) { t.classList.toggle('is-active', t.dataset.id === current.id); });
		renderMore();
	}

	tabsEl.addEventListener('click', function (e) { var t = e.target.closest('.album-tab'); if (t) select(t.dataset.id); });
	moreBtn.addEventListener('click', renderMore);
	select(ALBUMS[0].id);

	/* ---------- Lightbox ---------- */
	var lb = document.getElementById('lightbox');
	var stage = document.getElementById('lbStage');
	var capEl = document.getElementById('lbCap');
	var pos = 0, lbList = [], lbInfo = null;   // lbInfo: { vi: {title, desc}, en: {title, desc} }

	function show(i) {
		pos = (i + lbList.length) % lbList.length;
		var it = lbList[pos];
		var a = lbInfo[lang()];
		stage.innerHTML = it.type === 'video'
			? '<video src="' + it.src + '" poster="' + it.thumb + '" controls autoplay playsinline></video>'
			: '<img src="' + it.src + '" alt="' + esc(it.cap ? it.cap[0] : a.title) + '">';
		capEl.innerHTML = it.cap
			? '<strong>' + esc(it.cap[0]) + '</strong><span>' + esc(it.cap[1]) + '</span>'
			: '<strong>' + esc(a.title) + '</strong><span>' + esc(a.desc) + '</span>';
		capEl.insertAdjacentHTML('beforeend', '<em>' + (pos + 1) + ' / ' + lbList.length + '</em>');
	}
	function open(list, info, i) { lbList = list; lbInfo = info; show(i || 0); if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', ''); }
	function close() { stage.innerHTML = ''; if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); }

	gridEl.addEventListener('click', function (e) { var t = e.target.closest('.tile'); if (t) open(items, current, +t.dataset.i); });
	/* Cho phép script khác (vd. bản nhạc) dùng chung khung xem ảnh */
	window.choirViewer = open;
	document.getElementById('lbPrev').addEventListener('click', function () { show(pos - 1); });
	document.getElementById('lbNext').addEventListener('click', function () { show(pos + 1); });
	document.getElementById('lbClose').addEventListener('click', close);
	lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
	lb.addEventListener('close', function () { stage.innerHTML = ''; });
	document.addEventListener('keydown', function (e) {
		if (!lb.open) return;
		if (e.key === 'ArrowLeft') show(pos - 1);
		if (e.key === 'ArrowRight') show(pos + 1);
	});
	/* Vuốt trái / phải trên điện thoại */
	var x0 = null;
	lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
	lb.addEventListener('touchend', function (e) {
		if (x0 === null) return;
		var dx = e.changedTouches[0].clientX - x0; x0 = null;
		if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1));
	});
})();
