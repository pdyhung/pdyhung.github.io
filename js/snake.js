/* =========================================================
   Rắn săn mồi – canvas, bàn phím / vuốt / nút bấm
   ========================================================= */
(function () {
	'use strict';
	var root = document.documentElement;
	function $(id) { return document.getElementById(id); }
	function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
	function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function T(vi, en) { return root.dataset.lang === 'en' ? en : vi; }

	/* ---------- Ngôn ngữ, giao diện ---------- */
	$('langBtn').addEventListener('click', function () {
		var n = root.dataset.lang === 'en' ? 'vi' : 'en'; root.dataset.lang = n; root.lang = n; save('lang', n); overlay();
	});
	$('themeBtn').addEventListener('click', function () {
		var n = root.dataset.theme === 'light' ? 'dark' : 'light'; root.dataset.theme = n; save('theme', n); readColors(); draw();
	});
	$('year').textContent = new Date().getFullYear();

	/* ---------- Cấu hình ---------- */
	var N = 20;                                                    // lưới 20 × 20
	var SPEED = { easy: 150, normal: 105, hard: 70 };              // ms mỗi bước
	var opt = { level: load('snake.level') || 'normal', walls: load('snake.walls') || 'wrap' };
	if (!SPEED[opt.level]) opt.level = 'normal';
	if (opt.walls !== 'wrap' && opt.walls !== 'solid') opt.walls = 'wrap';
	function bestKey() { return 'snake.best.' + opt.level + '.' + opt.walls; }

	var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
	var canvas = $('board'), ctx = canvas.getContext('2d'), wrap = $('boardWrap');
	var snake, dir, queue, food, bonus, score, eaten, state, step, acc, last, flash;

	/* ---------- Màu từ biến CSS ---------- */
	var C = {};
	function readColors() {
		var cs = getComputedStyle(root);
		C.bg = cs.getPropertyValue('--bg-2').trim() || '#111119';
		C.dot = cs.getPropertyValue('--border-md').trim() || 'rgba(255,255,255,.12)';
		C.light = root.dataset.theme === 'light';
	}

	/* ---------- Kích thước canvas theo màn hình (sắc nét trên màn retina) ---------- */
	var px = 600, cell = 30;
	function resize() {
		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		px = Math.round(wrap.clientWidth * dpr);
		canvas.width = canvas.height = px;
		cell = px / N;
		draw();
	}
	window.addEventListener('resize', resize);

	/* ---------- Trò chơi ---------- */
	function reset() {
		var m = Math.floor(N / 2);
		snake = [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }];
		dir = 'right'; queue = []; score = 0; eaten = 0; bonus = null; flash = 0;
		step = SPEED[opt.level]; acc = 0;
		food = freeCell();
		hud();
	}
	function freeCell() {
		var free = [];
		for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
			if (!snake.some(function (s) { return s.x === x && s.y === y; }) &&
				!(food && food.x === x && food.y === y) && !(bonus && bonus.x === x && bonus.y === y)) free.push({ x: x, y: y });
		}
		return free.length ? free[Math.floor(Math.random() * free.length)] : null;
	}
	function turn(d) {
		if (state === 'ready' || state === 'over') { start(); }
		if (state !== 'run') return;
		var lastDir = queue.length ? queue[queue.length - 1] : dir;
		var a = DIRS[d], b = DIRS[lastDir];
		if (d === lastDir || (a[0] === -b[0] && a[1] === -b[1])) return;   // không quay đầu 180°
		if (queue.length < 3) queue.push(d);
	}
	function tick() {
		if (queue.length) dir = queue.shift();
		var h = snake[0], v = DIRS[dir], nx = h.x + v[0], ny = h.y + v[1];
		if (opt.walls === 'wrap') { nx = (nx + N) % N; ny = (ny + N) % N; }
		else if (nx < 0 || ny < 0 || nx >= N || ny >= N) return over();
		var grow = food && nx === food.x && ny === food.y;
		var gold = bonus && nx === bonus.x && ny === bonus.y;
		var body = grow ? snake : snake.slice(0, -1);              // đuôi sẽ dời đi nếu không ăn
		if (body.some(function (s) { return s.x === nx && s.y === ny; })) return over();
		snake.unshift({ x: nx, y: ny });
		if (grow) {
			score += 1; eaten += 1; flash = 1;
			step = Math.max(45, step - 2);                       // nhanh dần
			food = freeCell();
			if (!bonus && eaten % 5 === 0) { bonus = freeCell(); if (bonus) bonus.until = performance.now() + 6000; }
		} else if (gold) {
			score += 5; flash = 1; bonus = null;
			snake.push(Object.assign({}, snake[snake.length - 1]));  // dài thêm 1
		} else {
			snake.pop();
		}
		if (bonus && performance.now() > bonus.until) bonus = null;
		if (!food) return over(true);
		hud();
	}
	function over(win) {
		state = 'over';
		var best = +(load(bestKey()) || 0);
		var record = score > best;
		if (record) save(bestKey(), score);
		hud();
		overlay(win ? T('Bạn đã lấp kín màn chơi! 🎉', 'You filled the board! 🎉') : record && score > 0 ? T('Kỷ lục mới! 🏆', 'New record! 🏆') : T('Kết thúc', 'Game over'));
	}
	function start() {
		reset(); state = 'run'; last = performance.now(); overlay();
	}
	function pause() {
		if (state === 'run') { state = 'pause'; overlay(); }
		else if (state === 'pause') { state = 'run'; last = performance.now(); overlay(); }
	}

	/* ---------- Vòng lặp ---------- */
	function loop(now) {
		if (state === 'run') {
			acc += now - last;
			while (acc >= step && state === 'run') { acc -= step; tick(); }
		}
		last = now;
		if (flash > 0) flash = Math.max(0, flash - 0.06);
		draw(now);
		requestAnimationFrame(loop);
	}

	/* ---------- Vẽ ---------- */
	function rr(x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
	}
	function mix(a, b, t) { return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(',') + ')'; }
	var ORANGE = [249, 115, 22], TEAL = [20, 184, 166];
	function draw(now) {
		if (!snake) return;
		now = now || performance.now();
		ctx.fillStyle = C.bg; ctx.fillRect(0, 0, px, px);
		/* lưới chấm */
		ctx.fillStyle = C.dot;
		for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) ctx.fillRect((x + .5) * cell - 1, (y + .5) * cell - 1, 2, 2);
		/* mồi thường – nhịp đập */
		if (food) {
			var p = 1 + Math.sin(now / 180) * .08;
			ctx.save(); ctx.shadowColor = 'rgba(249,115,22,.7)'; ctx.shadowBlur = cell * .6;
			ctx.fillStyle = '#f97316'; ctx.beginPath();
			ctx.arc((food.x + .5) * cell, (food.y + .5) * cell, cell * .32 * p, 0, Math.PI * 2); ctx.fill(); ctx.restore();
		}
		/* mồi vàng – nhấp nháy khi sắp hết giờ */
		if (bonus) {
			var left = bonus.until - now;
			if (left <= 0 && state === 'run') bonus = null;
			else if (left > 1500 || Math.floor(now / 120) % 2) {
				ctx.save(); ctx.shadowColor = 'rgba(250,204,21,.9)'; ctx.shadowBlur = cell * .8;
				ctx.fillStyle = '#facc15'; ctx.translate((bonus.x + .5) * cell, (bonus.y + .5) * cell); ctx.rotate(now / 600);
				ctx.beginPath();
				for (var k = 0; k < 10; k++) { var r = k % 2 ? cell * .18 : cell * .4, a = k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
				ctx.closePath(); ctx.fill(); ctx.restore();
			}
		}
		/* thân rắn: chuyển màu cam → xanh ngọc */
		var n = snake.length;
		for (var i = n - 1; i >= 0; i--) {
			var s = snake[i], t = n > 1 ? i / (n - 1) : 0, pad = cell * (i === 0 ? .04 : .07);
			ctx.fillStyle = mix(ORANGE, TEAL, t);
			rr(s.x * cell + pad, s.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * .28); ctx.fill();
		}
		/* mắt */
		var h = snake[0], v = DIRS[dir], cx = (h.x + .5) * cell, cy = (h.y + .5) * cell;
		var ox = v[1] !== 0 ? cell * .18 : 0, oy = v[0] !== 0 ? cell * .18 : 0, fx = v[0] * cell * .14, fy = v[1] * cell * .14;
		[[1], [-1]].forEach(function (sgn) {
			var ex = cx + ox * sgn[0] + fx, ey = cy + oy * sgn[0] + fy;
			ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, cell * .11, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = '#0b0b10'; ctx.beginPath(); ctx.arc(ex + v[0] * cell * .03, ey + v[1] * cell * .03, cell * .055, 0, Math.PI * 2); ctx.fill();
		});
		/* chớp sáng khi ăn */
		if (flash > 0) { ctx.fillStyle = 'rgba(249,115,22,' + flash * .12 + ')'; ctx.fillRect(0, 0, px, px); }
	}

	/* ---------- Bảng điểm, lớp phủ ---------- */
	function hud() {
		$('score').textContent = score;
		$('len').textContent = snake.length;
		$('best').textContent = Math.max(score, +(load(bestKey()) || 0));
	}
	var ov = $('overlay');
	var ovMsg = '';
	function overlay(msg) {
		if (msg !== undefined) ovMsg = msg;
		if (state === 'run') { ov.hidden = true; return; }
		ov.hidden = false;
		var touch = window.matchMedia('(hover: none)').matches;
		if (state === 'ready') {
			$('ovTitle').textContent = T('Sẵn sàng?', 'Ready?');
			$('ovSub').innerHTML = touch ? T('Vuốt hoặc bấm nút để bắt đầu', 'Swipe or tap a button to start') : T('Nhấn phím mũi tên hoặc Enter để bắt đầu', 'Press an arrow key or Enter to start');
			$('ovBtn').textContent = T('Bắt đầu', 'Start');
		} else if (state === 'pause') {
			$('ovTitle').textContent = T('Tạm dừng', 'Paused');
			$('ovSub').textContent = T('Điểm hiện tại: ', 'Current score: ') + score;
			$('ovBtn').textContent = T('Chơi tiếp', 'Resume');
		} else {
			$('ovTitle').textContent = ovMsg || T('Kết thúc', 'Game over');
			$('ovSub').innerHTML = T('Điểm: ', 'Score: ') + '<b>' + score + '</b> · ' + T('Độ dài: ', 'Length: ') + snake.length;
			$('ovBtn').textContent = T('Chơi lại', 'Play again');
		}
	}
	$('ovBtn').addEventListener('click', function () { if (state === 'pause') pause(); else start(); });

	/* ---------- Tuỳ chọn ---------- */
	function seg(id, key) {
		var box = $(id);
		function paint() { box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-active', b.dataset.v === opt[key]); }); }
		box.addEventListener('click', function (e) {
			var b = e.target.closest('button'); if (!b) return;
			opt[key] = b.dataset.v; save('snake.' + key, opt[key]); paint();
			wrap.classList.toggle('solid', opt.walls === 'solid');
			state = 'ready'; reset(); overlay(); draw(); b.blur();
		});
		paint();
	}
	seg('level', 'level'); seg('walls', 'walls');
	wrap.classList.toggle('solid', opt.walls === 'solid');

	/* ---------- Điều khiển ---------- */
	var KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
	document.addEventListener('keydown', function (e) {
		var tag = (e.target.tagName || '').toLowerCase();
		if (tag === 'input' || tag === 'textarea') return;
		if (KEYS[e.key]) { e.preventDefault(); turn(KEYS[e.key]); }
		else if (e.key === ' ' || e.key === 'p' || e.key === 'P') { e.preventDefault(); if (state === 'ready' || state === 'over') start(); else pause(); }
		else if (e.key === 'Enter') { e.preventDefault(); if (state === 'pause') pause(); else if (state !== 'run') start(); }
	});
	/* vuốt */
	var t0 = null;
	wrap.addEventListener('touchstart', function (e) { var t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY }; }, { passive: true });
	wrap.addEventListener('touchmove', function (e) {
		if (!t0) return;
		var t = e.touches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
		turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
		t0 = { x: t.clientX, y: t.clientY };
	}, { passive: true });
	wrap.addEventListener('touchend', function () { t0 = null; });
	/* nút bấm */
	$('pad').addEventListener('pointerdown', function (e) {
		var b = e.target.closest('button'); if (!b) return;
		e.preventDefault();
		if (b.dataset.d === 'pause') { if (state === 'ready' || state === 'over') start(); else pause(); }
		else turn(b.dataset.d);
	});
	/* rời tab thì tự tạm dừng */
	document.addEventListener('visibilitychange', function () { if (document.hidden && state === 'run') pause(); });

	/* ---------- Khởi động ---------- */
	readColors();
	state = 'ready'; reset();
	resize(); overlay();
	last = performance.now();
	requestAnimationFrame(loop);
})();
