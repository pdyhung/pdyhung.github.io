/* book.js — Điều hướng, mục lục, tìm kiếm, giao diện sáng/tối, bài tập tự chấm, KaTeX. */
(function () {
  'use strict';

  /* ===== MỤC LỤC TOÀN SÁCH (href tính từ thư mục gốc book/; null = chưa viết) ===== */
  var TOC = [
    { n: 1, t: 'Thực hiện phép biến hình', en: 'Performing transformations', dir: '01_phep_bien_hinh', lessons: [
      ['Nhập môn hình học Euclid', '01_phep_bien_hinh/b1_nhap_mon_euclid.html'], ['Giới thiệu phép biến hình', '01_phep_bien_hinh/b2_gioi_thieu_bien_hinh.html'], ['Phép tịnh tiến', '01_phep_bien_hinh/b3_tinh_tien.html'],
      ['Phép quay', '01_phep_bien_hinh/b4_phep_quay.html'], ['Phép đối xứng trục', '01_phep_bien_hinh/b5_doi_xung_truc.html'], ['Phép vị tự', '01_phep_bien_hinh/b6_vi_tu.html'], ['Kiểm tra chương 1', '01_phep_bien_hinh/kiem_tra_chuong.html']] },
    { n: 2, t: 'Tính chất phép biến hình và chứng minh', en: 'Transformation properties and proofs', dir: '02_tinh_chat_bien_hinh', lessons: [
      ['Phép dời hình và tính bảo toàn', '02_tinh_chat_bien_hinh/b1_doi_hinh_bao_toan.html'], ['Định nghĩa chính xác các phép biến hình', '02_tinh_chat_bien_hinh/b2_dinh_nghia_chinh_xac.html'], ['Hợp các phép biến hình', '02_tinh_chat_bien_hinh/b3_hop_bien_hinh.html'],
      ['Nhận dạng phép biến hình', '02_tinh_chat_bien_hinh/b4_nhan_dang.html'], ['Tính đối xứng của hình phẳng', '02_tinh_chat_bien_hinh/b5_doi_xung_hinh_phang.html'], ['Chứng minh bằng phép biến hình', '02_tinh_chat_bien_hinh/b6_chung_minh_bien_hinh.html'], ['Kiểm tra chương 2', '02_tinh_chat_bien_hinh/kiem_tra_chuong.html']] },
    { n: 3, t: 'Sự bằng nhau', en: 'Congruence', dir: '03_bang_nhau', lessons: [
      ['Hai hình bằng nhau', '03_bang_nhau/b1_hai_hinh_bang_nhau.html'], ['Các trường hợp bằng nhau của tam giác', '03_bang_nhau/b2_truong_hop_bang_nhau.html'], ['Chứng minh các trường hợp bằng nhau', '03_bang_nhau/b3_chung_minh_bang_nhau.html'],
      ['Định lý về đường thẳng và góc', '03_bang_nhau/b4_duong_thang_goc.html'], ['Định lý về tam giác', '03_bang_nhau/b5_dinh_ly_tam_giac.html'], ['Định lý về tứ giác', '03_bang_nhau/b6_dinh_ly_tu_giac.html'], ['Dựng hình bằng thước và compa', '03_bang_nhau/b7_dung_hinh.html'], ['Kiểm tra chương 3', '03_bang_nhau/kiem_tra_chuong.html']] },
    { n: 4, t: 'Sự đồng dạng', en: 'Similarity', dir: '04_dong_dang', lessons: [
      ['Định nghĩa hai hình đồng dạng', '04_dong_dang/b1_dinh_nghia_dong_dang.html'], ['Các trường hợp đồng dạng của tam giác', '04_dong_dang/b2_truong_hop_dong_dang.html'], ['Xác định tam giác đồng dạng', '04_dong_dang/b3_xac_dinh_dong_dang.html'],
      ['Định lý đường phân giác', '04_dong_dang/b4_duong_phan_giac.html'], ['Ứng dụng thực tế của đồng dạng', '04_dong_dang/b5_ung_dung_dong_dang.html'], ['Kiểm tra chương 4', '04_dong_dang/kiem_tra_chuong.html']] },
    { n: 5, t: 'Tam giác vuông và lượng giác', en: 'Right triangles & trigonometry', dir: '05_tam_giac_vuong_luong_giac', lessons: [
      ['Định lý Pythagore', '05_tam_giac_vuong_luong_giac/b1_pythagore.html'], ['Tam giác vuông đặc biệt', '05_tam_giac_vuong_luong_giac/b2_tam_giac_vuong_dac_biet.html'], ['Tỉ số trong tam giác vuông đồng dạng', '05_tam_giac_vuong_luong_giac/b3_ti_so_dong_dang.html'],
      ['Tỉ số lượng giác', '05_tam_giac_vuong_luong_giac/b4_ti_so_luong_giac.html'], ['Giải tam giác vuông', '05_tam_giac_vuong_luong_giac/b5_giai_tam_giac_vuong.html'], ['Sin và cos của hai góc phụ nhau', '05_tam_giac_vuong_luong_giac/b6_goc_phu_nhau.html'], ['Bài toán thực tế', '05_tam_giac_vuong_luong_giac/b7_bai_toan_thuc_te.html'], ['Kiểm tra chương 5', '05_tam_giac_vuong_luong_giac/kiem_tra_chuong.html']] },
    { n: 6, t: 'Hình học giải tích', en: 'Analytic geometry', dir: '06_hinh_hoc_giai_tich', lessons: [
      ['Khoảng cách và trung điểm', '06_hinh_hoc_giai_tich/b1_khoang_cach_trung_diem.html'], ['Chia đoạn thẳng theo tỉ số', '06_hinh_hoc_giai_tich/b2_chia_doan_thang.html'], ['Chu vi, diện tích trên mặt phẳng tọa độ', '06_hinh_hoc_giai_tich/b3_chu_vi_dien_tich_toa_do.html'],
      ['Đường thẳng song song và vuông góc', '06_hinh_hoc_giai_tich/b4_song_song_vuong_goc.html'], ['Phương trình đường thẳng song song, vuông góc', '06_hinh_hoc_giai_tich/b5_phuong_trinh_duong_thang.html'], ['Chứng minh bằng tọa độ', '06_hinh_hoc_giai_tich/b6_chung_minh_toa_do.html'], ['Kiểm tra chương 6', '06_hinh_hoc_giai_tich/kiem_tra_chuong.html']] },
    { n: 7, t: 'Đường tròn', en: 'Circles', dir: '07_duong_tron', lessons: [
      ['Các yếu tố của đường tròn', '07_duong_tron/b1_yeu_to_duong_tron.html'], ['Số đo cung, độ dài cung, radian', '07_duong_tron/b2_cung_radian.html'], ['Góc nội tiếp và góc ở tâm', '07_duong_tron/b3_goc_noi_tiep.html'],
      ['Tiếp tuyến', '07_duong_tron/b4_tiep_tuyen.html'], ['Diện tích hình quạt', '07_duong_tron/b5_hinh_quat.html'], ['Dựng đa giác đều nội tiếp', '07_duong_tron/b6_da_giac_deu_noi_tiep.html'], ['Phương trình đường tròn', '07_duong_tron/b7_phuong_trinh_duong_tron.html'], ['Kiểm tra chương 7', '07_duong_tron/kiem_tra_chuong.html']] },
    { n: 8, t: 'Hình học không gian', en: 'Solid geometry', dir: '08_hinh_hoc_khong_gian', lessons: [
      ['Thuật ngữ hình học không gian', '08_hinh_hoc_khong_gian/b1_thuat_ngu.html'], ['Thiết diện của hình khối', '08_hinh_hoc_khong_gian/b2_thiet_dien.html'],
      ['Quay hình phẳng tạo khối tròn xoay', '08_hinh_hoc_khong_gian/b3_tron_xoay.html'], ['Nguyên lý Cavalieri', '08_hinh_hoc_khong_gian/b4_cavalieri.html'],
      ['Thể tích hình chóp và hình nón', '08_hinh_hoc_khong_gian/b5_the_tich_chop_non.html'],
      ['Thể tích lăng trụ, hình trụ, hình cầu', '08_hinh_hoc_khong_gian/b6_the_tich.html'], ['Mật độ', '08_hinh_hoc_khong_gian/b7_mat_do.html'],
      ['Kiểm tra chương 8', '08_hinh_hoc_khong_gian/kiem_tra_chuong.html']] }
  ];
  var EXTRA = [ ['Phụ lục A. Bảng công thức', 'phu_luc/cong_thuc.html'], ['Phụ lục B. Thuật ngữ Anh – Việt', 'phu_luc/thuat_ngu.html'], ['Phụ lục C. Đáp án', 'phu_luc/dap_an.html'] ];
  window.BOOK_TOC = TOC;

  var root = document.body.getAttribute('data-root') || './';
  var here = location.pathname.replace(/\\/g, '/');
  function isCurrent(href) { return href && here.slice(-href.length) === href; }

  /* ===== Giao diện sáng/tối ===== */
  var saved = null; try { saved = localStorage.getItem('book-theme'); } catch (e) {}
  if (!saved && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) saved = 'dark';
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  function toggleTheme() {
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('book-theme', t); } catch (e) {}
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }

  /* ===== Thanh trên + mục lục bên ===== */
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function buildChrome() {
    var top = el('header', { class: 'topbar' });
    top.innerHTML = '<button class="icon-btn" id="menu-btn" aria-label="Mở mục lục">☰</button>' +
      '<a class="brand" href="' + root + 'index.html">📐 Hình học cơ bản</a><span class="spacer"></span>' +
      '<a class="home-site" href="https://pdyhung.github.io/" title="Về trang chủ pdyhung.github.io">← pdyhung.github.io</a>' +
      '<input type="search" id="search" placeholder="Tìm bài học…" aria-label="Tìm bài học">' +
      '<button class="icon-btn" id="theme-btn" title="Đổi giao diện sáng/tối" aria-label="Đổi giao diện sáng/tối">◐</button>' +
      '<div class="search-results" id="search-results"></div>';
    var side = el('nav', { class: 'sidebar', 'aria-label': 'Mục lục' });
    var html = '<a class="home-link" href="' + root + 'index.html">🏠 Trang chủ</a>';
    TOC.forEach(function (ch) {
      var open = ch.lessons.some(function (l) { return isCurrent(l[1]); });
      html += '<details' + (open ? ' open' : '') + '><summary>Chương ' + ch.n + '. ' + ch.t + '</summary><ol>';
      ch.lessons.forEach(function (l) {
        html += '<li>' + (l[1] ? '<a href="' + root + l[1] + '"' + (isCurrent(l[1]) ? ' class="current" aria-current="page"' : '') + '>' + l[0] + '</a>'
                              : '<span class="soon">' + l[0] + '</span>') + '</li>';
      });
      html += '</ol></details>';
    });
    var exOpen = EXTRA.some(function (l) { return isCurrent(l[1]); });
    html += '<details' + (exOpen ? ' open' : '') + '><summary>Phụ lục</summary><ol>' + EXTRA.map(function (l) { return '<li>' + (l[1] ? '<a href="' + root + l[1] + '"' + (isCurrent(l[1]) ? ' class="current" aria-current="page"' : '') + '>' + l[0] + '</a>' : '<span class="soon">' + l[0] + '</span>') + '</li>'; }).join('') + '</ol></details>';
    side.innerHTML = html;
    var main = document.querySelector('main');
    var layout = el('div', { class: 'layout' });
    main.parentNode.insertBefore(layout, main);
    layout.appendChild(side); layout.appendChild(main);
    document.body.insertBefore(top, layout);
    document.getElementById('theme-btn').onclick = toggleTheme;
    document.getElementById('menu-btn').onclick = function () { document.body.classList.toggle('menu-open'); };
    main.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    setupSearch();
  }

  /* ===== Tìm kiếm (theo tên bài, không phân biệt dấu) ===== */
  function plain(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function setupSearch() {
    var input = document.getElementById('search'), box = document.getElementById('search-results');
    var items = [];
    TOC.forEach(function (ch) { ch.lessons.forEach(function (l) { items.push({ t: l[0], ch: 'Chương ' + ch.n + '. ' + ch.t, href: l[1] }); }); });
    input.addEventListener('input', function () {
      var q = plain(input.value.trim());
      if (!q) { box.style.display = 'none'; return; }
      var hits = items.filter(function (it) { return plain(it.t + ' ' + it.ch).indexOf(q) >= 0; }).slice(0, 12);
      box.innerHTML = hits.length ? hits.map(function (it) {
        return it.href ? '<a href="' + root + it.href + '">' + it.t + '<br><small>' + it.ch + '</small></a>'
                       : '<a aria-disabled="true">' + it.t + ' <small>(sắp có)</small><br><small>' + it.ch + '</small></a>';
      }).join('') : '<a>Không tìm thấy.</a>';
      box.style.display = 'block';
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target) && e.target !== input) box.style.display = 'none'; });
  }

  /* ===== Nút Bài trước / Bài sau ===== */
  function buildPager() {
    var holder = document.querySelector('.pager[data-auto]'); if (!holder) return;
    var flat = []; TOC.forEach(function (ch) { ch.lessons.forEach(function (l) { if (l[1]) flat.push(l); }); });
    EXTRA.forEach(function (l) { if (l[1]) flat.push(l); });
    var i = -1; flat.forEach(function (l, k) { if (isCurrent(l[1])) i = k; });
    var prev = i > 0 ? flat[i - 1] : null, next = i >= 0 && i < flat.length - 1 ? flat[i + 1] : null;
    holder.innerHTML =
      (prev ? '<a href="' + root + prev[1] + '"><span class="dir">← Bài trước</span>' + prev[0] + '</a>' : '<a href="' + root + 'index.html"><span class="dir">← Về</span>Trang chủ</a>') +
      (next ? '<a class="next" href="' + root + next[1] + '"><span class="dir">Bài sau →</span>' + next[0] + '</a>' : '<span></span>');
  }

  /* ===== Danh sách chương trên trang chủ ===== */
  function buildHomeCards() {
    var holder = document.getElementById('toc-cards'); if (!holder) return;
    holder.innerHTML = TOC.map(function (ch) {
      return '<div class="card"><div class="num">CHƯƠNG ' + ch.n + '</div><h3>' + ch.t + '</h3><div class="en" style="font-size:13px;margin-bottom:6px">' + ch.en + '</div><ol>' +
        ch.lessons.map(function (l) { return '<li>' + (l[1] ? '<a href="' + root + l[1] + '">' + l[0] + '</a>' : '<span class="soon">' + l[0] + '</span>') + '</li>'; }).join('') +
        '</ol></div>';
    }).join('');
  }

  /* ===== Bài tập tự chấm =====
     <div class="quiz" data-type="mc" data-answer="c"> … <input type=radio value="a"> …
     <div class="quiz" data-type="num" data-answer="22.63" data-tol="0.05"> … <input type=text> … */
  function parseNum(s) {
    s = String(s).trim().replace(/\s/g, '').replace(',', '.');
    if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(s)) { var p = s.split('/'); return parseFloat(p[0]) / parseFloat(p[1]); }
    return s === '' ? NaN : Number(s);
  }
  function setupQuizzes() {
    var quizzes = [].slice.call(document.querySelectorAll('.quiz'));
    if (!quizzes.length) return;
    var state = quizzes.map(function () { return false; });
    var score = document.getElementById('score');
    function updateScore() {
      if (score) score.textContent = '✔ Đã làm đúng ' + state.filter(Boolean).length + ' / ' + quizzes.length + ' câu';
    }
    quizzes.forEach(function (q, idx) {
      var btn = q.querySelector('.check-btn'), fb = q.querySelector('.feedback');
      function check() {
        var ok, type = q.getAttribute('data-type'), ans = q.getAttribute('data-answer');
        if (type === 'mc') {
          var c = q.querySelector('input[type=radio]:checked');
          if (!c) { fb.className = 'feedback bad'; fb.textContent = 'Hãy chọn một đáp án.'; return; }
          ok = c.value === ans;
        } else {
          var v = parseNum(q.querySelector('input[type=text]').value);
          if (isNaN(v)) { fb.className = 'feedback bad'; fb.textContent = 'Hãy nhập một số (ví dụ 3,46).'; return; }
          ok = Math.abs(v - parseFloat(ans)) <= parseFloat(q.getAttribute('data-tol') || '0.01');
        }
        fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
        fb.textContent = ok ? '✔ Chính xác!' : '✘ Chưa đúng, hãy thử lại hoặc xem gợi ý.';
        if (ok) { state[idx] = true; updateScore(); }
      }
      if (btn) btn.addEventListener('click', check);
      var t = q.querySelector('input[type=text]');
      if (t) t.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    });
    updateScore();
  }

  /* ===== KaTeX ===== */
  function renderMath() {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildChrome(); buildPager(); buildHomeCards(); setupQuizzes(); renderMath();
  });
})();
