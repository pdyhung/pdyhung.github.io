/* board2d.js — Bảng vẽ hình phẳng tương tác dùng chung (JSXGraph 1.10).
   const B = GeoWidget.board2d(ui, { bbox: [-6, 6, 6, -6], axis: true, grid: true });
   B.build(function (board, C) { … vẽ bằng board.create(…), màu lấy từ C … });
   B.build được gọi lại khi đổi giao diện sáng/tối, nên hàm vẽ phải đọc trạng thái từ biến của widget
   (không giữ đối tượng JSXGraph cũ). B.board là bảng hiện tại. */
(function () {
  'use strict';
  function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function palette() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      dark: dark,
      text: cssv('--text') || '#1f2328', muted: cssv('--muted') || '#5d6670', border: cssv('--border') || '#dedad0',
      bg: cssv('--surface-2') || '#f2f0ea',
      blue: dark ? '#5b9dff' : '#1f6feb', orange: dark ? '#ff9b4a' : '#e8590c', green: dark ? '#3fb950' : '#1a7f37',
      purple: dark ? '#b392f0' : '#8250df', red: dark ? '#ff6b6b' : '#cf222e', yellow: dark ? '#e3b341' : '#bf8700',
      fillBlue: dark ? 'rgba(91,157,255,0.22)' : 'rgba(31,111,235,0.15)', fillOrange: dark ? 'rgba(255,155,74,0.25)' : 'rgba(232,89,12,0.15)',
      fillGreen: dark ? 'rgba(63,185,80,0.22)' : 'rgba(26,127,55,0.13)', fillPurple: dark ? 'rgba(179,146,240,0.22)' : 'rgba(130,80,223,0.13)'
    };
  }

  GeoWidget.board2d = function (ui, opts) {
    opts = opts || {};
    if (!window.JXG) {
      ui.stage.innerHTML = '<div class="nowebgl">Không tải được thư viện vẽ hình (JSXGraph).</div>';
      return null;
    }
    var div = document.createElement('div');
    div.id = 'jxg' + Math.random().toString(36).slice(2);
    div.className = 'jxgbox board2d';
    div.setAttribute('role', 'img');
    div.setAttribute('aria-label', opts.aria || 'Hình vẽ tương tác: kéo các điểm để thay đổi hình');
    ui.stage.appendChild(div);
    var hint = document.createElement('div'); hint.className = 'hint';
    hint.textContent = opts.hint || 'Kéo các điểm tô màu để thay đổi hình · Cuộn để phóng to · Shift + kéo để dời';
    ui.stage.appendChild(hint);
    var api = { JXG: JXG, board: null, C: palette(), draw: null, bbox: opts.bbox || [-6, 6, 6, -6] };

    function size() {
      var w = ui.stage.clientWidth || 600, h = Math.max(320, Math.min(opts.maxH || 520, Math.round(w * (opts.ratio || 0.72))));
      ui.stage.style.height = h + 'px'; div.style.width = w + 'px'; div.style.height = h + 'px';
      return [w, h];
    }
    function rebuild() {
      if (!api.draw) return;
      if (api.board) { api.bbox = api.board.getBoundingBox(); JXG.JSXGraph.freeBoard(api.board); }
      size();
      var C = api.C = palette();
      JXG.Options.text.strokeColor = C.text;
      JXG.Options.text.fontSize = 15;
      JXG.Options.point.strokeColor = C.blue; JXG.Options.point.fillColor = C.blue;
      JXG.Options.point.highlightStrokeColor = C.orange; JXG.Options.point.highlightFillColor = C.orange;
      JXG.Options.label.strokeColor = C.text;
      JXG.Options.label.fontSize = 15;
      api.board = JXG.JSXGraph.initBoard(div.id, {
        boundingbox: api.bbox, keepaspectratio: opts.keepAspect !== false,
        axis: !!opts.axis, grid: !!opts.grid, showCopyright: false, showNavigation: false,
        pan: { enabled: true, needShift: true, needTwoFingers: true }, zoom: { wheel: true, needShift: false, pinch: true },
        defaultAxes: {
          x: { strokeColor: C.muted, highlightStrokeColor: C.muted, ticks: { strokeColor: C.border, label: { strokeColor: C.muted, fontSize: 12 } } },
          y: { strokeColor: C.muted, highlightStrokeColor: C.muted, ticks: { strokeColor: C.border, label: { strokeColor: C.muted, fontSize: 12 } } }
        },
        grid: opts.grid ? { majorStep: opts.gridStep || 1, strokeColor: C.border, strokeOpacity: 0.7 } : false
      });
      api.board.suspendUpdate();
      api.draw(api.board, C);
      api.board.unsuspendUpdate();
    }
    api.build = function (draw) { api.draw = draw; rebuild(); };
    api.rebuild = rebuild;
    /* Đặt lại khung nhìn ban đầu */
    api.resetView = function () { api.bbox = opts.bbox || [-6, 6, 6, -6]; if (api.board) api.board.setBoundingBox(api.bbox, opts.keepAspect !== false); };
    new ResizeObserver(function () {
      if (!api.board) return;
      var s = size(); api.board.resizeContainer(s[0], s[1], false, true);
      api.board.setBoundingBox(api.board.getBoundingBox(), opts.keepAspect !== false); api.board.fullUpdate();
    }).observe(ui.stage);
    window.addEventListener('themechange', rebuild);
    return api;
  };

  /* Tiện ích: làm tròn và định dạng số kiểu Việt Nam (dấu phẩy thập phân) */
  GeoWidget.fmt = function (x, d) {
    if (!isFinite(x)) return '—';
    d = d == null ? 2 : d;
    var s = (+x.toFixed(d)).toString();
    if (s === '-0') s = '0';
    return s.replace('.', ',').replace(/^-/, '−');   // dấu trừ chuẩn (U+2212)
  };
})();
