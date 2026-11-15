/* =========================================================
   Nghe lại thánh lễ – từng bài hát + cả thánh lễ
   Mỗi bài là một file riêng trong assets/choir/audio/ (cắt từ bản ghi âm).
   at = vị trí bài trong bản ghi âm đầy đủ (giây), dùng khi nghe cả lễ.
   ========================================================= */
(function () {
	'use strict';

	var DIR = 'assets/choir/audio/';
	var FULL = DIR + 'thanh-le-bon-mang-2026.m4a';
	var SHEET_DIR = 'assets/choir/sheet/';

	var TRACKS = [
		{ file: '01-khai-hoan-ca',         at: 285,  dur: 238, vi: 'Nhập lễ',          en: 'Entrance',           title: 'Khải Hoàn Ca',         author: 'Nhạc & lời: Hải Linh · Hoà âm: Ngô Duy Linh', sheet: ['khai-hoan-ca-1', 'khai-hoan-ca-2', 'khai-hoan-ca-3'] },
		{ file: '02-thanh-vinh-125',       at: 1090, dur: 280, vi: 'Đáp ca',           en: 'Responsorial Psalm', title: 'Thánh Vịnh 125',       author: 'Xuân Thảo',                                  sheet: ['thanh-vinh-125-1'] },
		{ file: '03-tung-ho-tin-mung',     at: 1529, dur: 53,  vi: 'Tung hô Tin Mừng', en: 'Gospel Acclamation', title: 'Tung Hô Tin Mừng',     author: 'Xuân Thảo',                                  sheet: ['tung-ho-tin-mung-1'] },
		{ file: '04-nguyen-dang-len-chua', at: 2450, dur: 164, vi: 'Dâng lễ',          en: 'Offertory',          title: 'Nguyện Dâng Lên Chúa', author: 'JB. Phạm Quốc Huấn',                         sheet: ['nguyen-dang-len-chua-1', 'nguyen-dang-len-chua-2'] },
		{ file: '05-bai-ca-ngan-trung',    at: 3263, dur: 185, vi: 'Hiệp lễ',          en: 'Communion',          title: 'Bài Ca Ngàn Trùng',    author: 'Lời: Hoàng Khánh · Nhạc: Lm. Kim Long',      sheet: ['bai-ca-ngan-trung-1', 'bai-ca-ngan-trung-2'] },
		{ file: '06-toi-tham-tin',         at: 3623, dur: 82,  vi: 'Kết lễ',           en: 'Recessional',        title: 'Tôi Thâm Tín',         author: 'Hoàng Đức',                                  sheet: ['toi-tham-tin-1'] }
	];

	var audio = document.getElementById('massAudio');
	var list = document.getElementById('massTracks');
	var nowEl = document.getElementById('massNow');
	var fullBtn = document.getElementById('massFull');
	if (!audio || !list) return;

	function fmt(t) { t = Math.floor(t); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
	function bi(vi, en) { return '<span class="vi">' + vi + '</span><span class="en">' + en + '</span>'; }

	list.innerHTML = TRACKS.map(function (t, i) {
		return '<li class="track-row"><button type="button" class="track" data-i="' + i + '">' +
			'<span class="track-no">' + ('0' + (i + 1)).slice(-2) + '</span>' +
			'<span class="track-main"><span class="track-role">' + bi(t.vi, t.en) + '</span>' +
			'<strong>' + t.title + '</strong><small>' + t.author + '</small></span>' +
			'<span class="track-time">' + fmt(t.dur) + '</span>' +
			'<span class="track-ico" aria-hidden="true"></span>' +
			'</button>' +
			'<button type="button" class="track-sheet" data-s="' + i + '" title="Bản nhạc / Sheet music" aria-label="Bản nhạc ' + t.title + '">🎼</button></li>';
	}).join('');

	var buttons = list.querySelectorAll('.track');
	var mode = 'none';   // 'track' | 'full'
	var cur = -1;        // bài đang chọn

	function load(src) {
		if (audio.getAttribute('src') !== src) { audio.setAttribute('src', src); audio.load(); }
	}
	function playTrack(i) {
		mode = 'track'; cur = i;
		load(DIR + TRACKS[i].file + '.m4a');
		audio.currentTime = 0;
		audio.play();
		paint();
	}
	function playFull() {
		mode = 'full'; cur = -1;
		load(FULL);
		audio.play();
		paint();
	}

	/* Khi nghe cả lễ: biết đang ở bài nào */
	function fullIndex() {
		var t = audio.currentTime;
		for (var i = 0; i < TRACKS.length; i++) if (t >= TRACKS[i].at && t < TRACKS[i].at + TRACKS[i].dur) return i;
		return -1;
	}
	function paint() {
		var c = mode === 'full' ? fullIndex() : cur;
		buttons.forEach(function (b, i) {
			b.classList.toggle('is-current', i === c);
			b.classList.toggle('is-playing', i === c && !audio.paused);
		});
		if (fullBtn) fullBtn.classList.toggle('is-active', mode === 'full');
		if (nowEl) {
			nowEl.innerHTML = mode === 'full'
				? bi('Đang nghe: cả thánh lễ', 'Now playing: full Mass') + (c >= 0 ? ' · ' + TRACKS[c].title : '')
				: (cur >= 0 ? bi('Đang nghe: ', 'Now playing: ') + TRACKS[cur].title : bi('Chọn một bài để nghe', 'Pick a song to listen'));
		}
	}

	list.addEventListener('click', function (e) {
		var sb = e.target.closest('.track-sheet'); if (sb) { openSheets(+sb.dataset.s); return; }
		var b = e.target.closest('.track'); if (!b) return;
		var i = +b.dataset.i;
		if (mode === 'track' && cur === i) { if (audio.paused) audio.play(); else audio.pause(); return; }
		playTrack(i);
	});
	if (fullBtn) fullBtn.addEventListener('click', function () {
		if (mode === 'full') { if (audio.paused) audio.play(); else audio.pause(); return; }
		playFull();
	});

	/* Hết bài → tự chuyển bài tiếp theo */
	audio.addEventListener('ended', function () {
		if (mode === 'track' && cur < TRACKS.length - 1) playTrack(cur + 1); else paint();
	});
	audio.addEventListener('timeupdate', function () { if (mode === 'full') paint(); });
	audio.addEventListener('play', paint);
	audio.addEventListener('pause', paint);

	/* ---------- Bản nhạc (dùng chung khung xem ảnh của album) ---------- */
	var SHEET_INFO = { vi: { title: 'Bản nhạc', desc: '' }, en: { title: 'Sheet music', desc: '' } };
	function sheetList() {
		var out = [];
		TRACKS.forEach(function (t) {
			t.sheet.forEach(function (n, k) {
				out.push({ type: 'img', src: SHEET_DIR + n + '.jpg', cap: [t.title + (t.sheet.length > 1 ? ' (' + (k + 1) + '/' + t.sheet.length + ')' : ''), t.author] });
			});
		});
		return out;
	}
	function openSheets(i) {
		if (!window.choirViewer) return;
		var start = 0;
		for (var k = 0; k < i; k++) start += TRACKS[k].sheet.length;
		window.choirViewer(sheetList(), SHEET_INFO, start);
	}
	var allSheetsBtn = document.getElementById('massSheets');
	if (allSheetsBtn) allSheetsBtn.addEventListener('click', function () { openSheets(0); });

	paint();
})();
