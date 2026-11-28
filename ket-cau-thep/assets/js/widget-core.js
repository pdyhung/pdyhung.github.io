/* widget-core.js – khung minh họa động: thanh trượt + ô số, bảng kết quả, ô "Hãy thử". */
(function(){
  const WC = window.WC = {};
  window.WIDGETS = window.WIDGETS || {};
  WC.f = (x,n=2)=> (x==null||!isFinite(x)) ? '–' : (Math.round(x*10**n)/10**n).toLocaleString('vi-VN',{maximumFractionDigits:n});
  WC.el = (tag, attrs={}, html='')=>{ const e=document.createElement(tag); for(const k in attrs) e.setAttribute(k,attrs[k]); if(html) e.innerHTML=html; return e; };
  // khung chung: tiêu đề, ô Hãy thử, vùng điều khiển, vùng hình, vùng bảng
  WC.frame = function(root, {title, tryText}){
    root.classList.add('widget');
    root.innerHTML = '';
    const head = WC.el('div',{class:'w-title'}, '🧪 ' + title);
    const tr = tryText ? WC.el('div',{class:'w-try'}, '<b>Hãy thử:</b> ' + tryText) : null;
    const body = WC.el('div',{class:'w-body'});
    const ctrl = WC.el('div',{class:'w-ctrl'});
    const view = WC.el('div',{class:'w-view'});
    const out = WC.el('div',{class:'w-out'});
    body.append(ctrl, view);
    root.append(head); if(tr) root.append(tr); root.append(body, out);
    return {root, ctrl, view, out};
  };
  // thanh trượt kèm ô nhập số, đồng bộ hai chiều
  WC.slider = function(parent, {label, min, max, step=1, value, unit='', onInput}){
    const row = WC.el('label',{class:'w-row'});
    row.innerHTML = '<span class="w-lab">'+label+'</span>';
    const r = WC.el('input',{type:'range',min,max,step,value});
    const n = WC.el('input',{type:'number',min,max,step,value,class:'w-num'});
    const u = WC.el('span',{class:'w-unit'}, unit);
    row.append(r,n,u); parent.append(row);
    const api = {get value(){return +r.value;}, set(v){ r.value=v; n.value=v; }};
    r.addEventListener('input',()=>{ n.value=r.value; onInput&&onInput(+r.value); });
    n.addEventListener('input',()=>{ const v=parseFloat(String(n.value).replace(',','.')); if(isFinite(v)){ r.value=v; onInput&&onInput(v);} });
    return api;
  };
  WC.select = function(parent, {label, options, value, onChange}){
    const row = WC.el('label',{class:'w-row'}); row.innerHTML='<span class="w-lab">'+label+'</span>';
    const s = WC.el('select'); options.forEach(([v,t])=>{ const o=WC.el('option',{value:v},t); if(v==value) o.selected=true; s.append(o); });
    s.addEventListener('change',()=>onChange&&onChange(s.value)); row.append(s); parent.append(row); return s;
  };
  WC.check = function(parent, {label, checked=true, color, onChange}){
    const row = WC.el('label',{class:'w-chk'});
    const c = WC.el('input',{type:'checkbox'}); c.checked = checked;
    row.append(c); row.insertAdjacentHTML('beforeend', (color?'<i style="background:'+color+'"></i>':'')+label);
    c.addEventListener('change',()=>onChange&&onChange(c.checked)); parent.append(row); return c;
  };
  // bảng kết quả: rows = [[tên, giá trị, ghi chú/class]]
  WC.table = function(el, rows, head){
    let h = '<table class="w-tab">' + (head?'<thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead>':'') + '<tbody>';
    rows.forEach(r=>{ h += '<tr>' + r.map(c=> typeof c==='object'&&c ? '<td class="'+(c.cls||'')+'">'+c.v+'</td>' : '<td>'+c+'</td>').join('') + '</tr>'; });
    el.innerHTML = h + '</tbody></table>';
    if (window.renderMathInElement) renderMathInElement(el, window.KATEX_OPTS);
  };
  WC.ok = (pass)=> pass ? {v:'Đạt',cls:'pass'} : {v:'Không đạt',cls:'fail'};
  WC.isDark = ()=> document.documentElement.dataset.theme==='dark';
  WC.init = function(scope){
    (scope||document).querySelectorAll('[data-widget]').forEach(el=>{
      const id = el.dataset.widget, fn = window.WIDGETS[id];
      if (fn && !el.dataset.ready){ el.dataset.ready='1'; try{ fn(el); if (window.renderMathInElement) renderMathInElement(el, window.KATEX_OPTS); }catch(e){ el.innerHTML='<p class="w-err">Lỗi widget '+id+': '+e.message+'</p>'; console.error(e);} }
    });
  };
})();
