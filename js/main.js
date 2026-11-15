(function () {
	'use strict';
	var root = document.documentElement;
	function save(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

	/* ---------- Ngôn ngữ VI / EN ---------- */
	document.getElementById('langBtn').addEventListener('click', function () {
		var next = root.dataset.lang === 'en' ? 'vi' : 'en';
		root.dataset.lang = next;
		root.lang = next;
		save('lang', next);
	});

	/* ---------- Sáng / tối (mặc định tối) ---------- */
	document.getElementById('themeBtn').addEventListener('click', function () {
		var next = root.dataset.theme === 'light' ? 'dark' : 'light';
		root.dataset.theme = next;
		save('theme', next);
	});

	/* ---------- Menu điện thoại ---------- */
	var nav = document.getElementById('nav');
	var menuBtn = document.getElementById('menuBtn');
	function setMenu(open) { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); }
	menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
	nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

	/* ---------- Đánh dấu mục đang xem ---------- */
	var links = Array.prototype.slice.call(nav.querySelectorAll('a:not(.nav-cta)'));
	if ('IntersectionObserver' in window) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
	}

	/* ---------- Lọc sách theo năm ---------- */
	var filters = document.querySelectorAll('.filter');
	var books = document.querySelectorAll('.book');
	var count = document.getElementById('bookCount');
	count.textContent = books.length;
	filters.forEach(function (btn) {
		btn.addEventListener('click', function () {
			var f = btn.dataset.filter, n = 0;
			filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
			books.forEach(function (bk) {
				bk.hidden = !(f === 'all' || bk.dataset.year === f);
				if (!bk.hidden) n++;
			});
			count.textContent = n;
		});
	});

	document.getElementById('year').textContent = new Date().getFullYear();
})();
