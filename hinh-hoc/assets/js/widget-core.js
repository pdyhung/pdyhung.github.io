/* widget-core.js — Khung chung cho các minh họa động.
   Dùng: <div data-widget="ten_widget" data-title="…" data-try="…"></div>
   Mỗi widget đăng ký bằng GeoWidget.register('ten_widget', function (ui, el) { … }). */
(function () {
  'use strict';
  var registry = {};
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function hasWebGL() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
    catch (e) { return false; }
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function buildFrame(el) {
    el.classList.add('widget');
    var head = h('div', 'widget-head');
    head.appendChild(h('div', 'w-title', '🎬 ' + (el.getAttribute('data-title') || 'Minh họa động')));
    if (el.getAttribute('data-try')) head.appendChild(h('div', 'w-try', '<b>Hãy thử:</b> ' + el.getAttribute('data-try')));
    var body = h('div', 'widget-body');
    var stage = h('div', 'widget-stage'), side = h('div', 'widget-side');
    body.appendChild(stage); body.appendChild(side);
    el.appendChild(head); el.appendChild(body);

    var ui = {
      el: el, stage: stage, side: side, hasWebGL: hasWebGL, css: css,
      /* Thanh trượt kèm ô nhập số. o.scale: hệ số hiển thị (vd 100 để hiện %), o.decimals, o.unit. */
      slider: function (o) {
        var box = h('div', 'ctl'), id = 'w' + Math.random().toString(36).slice(2);
        var scale = o.scale || 1, dec = o.decimals != null ? o.decimals : 0;
        box.innerHTML = '<div class="ctl-head"><label for="' + id + '">' + o.label + '</label>' +
          '<span class="num-wrap"><input type="number" class="num" aria-label="' + o.label + ' (nhập số)"><span class="unit">' + (o.unit || '') + '</span></span></div>';
        var r = document.createElement('input');
        r.type = 'range'; r.id = id; r.min = o.min; r.max = o.max; r.step = o.step || 'any'; r.value = o.value;
        box.appendChild(r); side.appendChild(box);
        var num = box.querySelector('input.num');
        num.min = o.min * scale; num.max = o.max * scale; num.step = 'any';
        var shown = '';
        function show() { shown = num.value = (+r.value * scale).toFixed(dec); num.classList.remove('invalid'); }
        r.addEventListener('input', function () { show(); o.onInput && o.onInput(+r.value); });
        function commit() {
          if (num.value === shown) return;            // chưa sửa gì: giữ nguyên giá trị chính xác (vd. góc mẫu 35,2644…°)
          var v = parseFloat(String(num.value).replace(',', '.'));
          if (isNaN(v)) { num.classList.add('invalid'); return; }
          v = Math.max(o.min, Math.min(o.max, v / scale));
          r.value = v; v = +r.value;      // dùng đúng giá trị thanh trượt nhận (đã khớp bước), để ô số và hình luôn trùng nhau
          show(); o.onInput && o.onInput(v);
        }
        num.addEventListener('change', commit);
        num.addEventListener('keydown', function (e) { if (e.key === 'Enter') { commit(); num.select(); } });
        show();
        return { input: r, get: function () { return +r.value; }, set: function (v) { r.value = v; if (document.activeElement !== num) show(); } };
      },
      /* Ô nhập số độc lập (không có thanh trượt), dùng cho kích thước khối. */
      number: function (o, parent) {
        var box = h('div', 'ctl ctl-inline'), id = 'w' + Math.random().toString(36).slice(2);
        box.innerHTML = '<label for="' + id + '">' + o.label + '</label>';
        var num = document.createElement('input'); num.type = 'number'; num.id = id; num.className = 'num';
        num.min = o.min; num.max = o.max; num.step = o.step || 'any'; num.value = o.value;
        box.appendChild(num); (parent || side).appendChild(box);
        function commit() {
          var v = parseFloat(String(num.value).replace(',', '.'));
          if (isNaN(v) || v < o.min || v > o.max) { num.classList.add('invalid'); num.title = 'Nhập số từ ' + o.min + ' đến ' + o.max; return; }
          num.classList.remove('invalid'); num.title = ''; o.onChange(v);
        }
        num.addEventListener('change', commit);
        num.addEventListener('keydown', function (e) { if (e.key === 'Enter') commit(); });
        return num;
      },
      group: function (title) {
        var f = h('fieldset', 'ctl-group'); if (title) f.appendChild(h('legend', null, title)); side.appendChild(f); return f;
      },
      select: function (o) {
        var box = h('div', 'ctl'), id = 'w' + Math.random().toString(36).slice(2);
        box.innerHTML = '<label for="' + id + '">' + o.label + '</label>';
        var s = document.createElement('select'); s.id = id;
        o.options.forEach(function (op) { var x = document.createElement('option'); x.value = op[0]; x.textContent = op[1]; s.appendChild(x); });
        s.value = o.value; s.addEventListener('change', function () { o.onChange(s.value); });
        box.appendChild(s); side.appendChild(box);
        return s;
      },
      checkbox: function (label, value, onChange, parent) {
        var l = h('label', 'check'); var c = document.createElement('input'); c.type = 'checkbox'; c.checked = value;
        c.addEventListener('change', function () { onChange(c.checked); });
        l.appendChild(c); l.appendChild(document.createTextNode(label));
        (parent || side).appendChild(l); return c;
      },
      row: function (label) {
        var box = h('div', 'ctl'); if (label) box.appendChild(h('label', null, label));
        var r = h('div', 'ctl-row'); box.appendChild(r); side.appendChild(box); return r;
      },
      button: function (parent, text, onClick, cls) {
        var b = h('button', cls || 'btn', text); b.type = 'button'; b.addEventListener('click', onClick); parent.appendChild(b); return b;
      },
      readout: function (rows) {
        var dl = h('dl', 'readout'); dl.setAttribute('aria-live', 'polite'); var map = {};
        rows.forEach(function (r) { dl.appendChild(h('dt', null, r[1])); map[r[0]] = dl.appendChild(h('dd', null, '–')); });
        side.appendChild(dl);
        return function (key, text) { map[key].textContent = text; };
      },
      /* Chạy hàm vẽ liên tục chỉ khi widget đang hiện trên màn hình (tiết kiệm pin). */
      loop: function (fn) {
        var visible = true, raf = 0;
        function tick(t) { raf = 0; if (!visible) return; fn(t); raf = requestAnimationFrame(tick); }
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }).observe(el);
        }
        raf = requestAnimationFrame(tick);
      }
    };
    return ui;
  }

  window.GeoWidget = {
    register: function (name, factory) { registry[name] = factory; },
    mountAll: function () {
      [].forEach.call(document.querySelectorAll('[data-widget]'), function (el) {
        var f = registry[el.getAttribute('data-widget')];
        if (!f || el.getAttribute('data-mounted')) return;
        el.setAttribute('data-mounted', '1');
        try { f(buildFrame(el), el); }
        catch (e) { el.appendChild(h('div', 'nowebgl', 'Không tải được minh họa: ' + e.message)); console.error(e); }
      });
    }
  };
  document.addEventListener('DOMContentLoaded', function () { window.GeoWidget.mountAll(); });
})();
