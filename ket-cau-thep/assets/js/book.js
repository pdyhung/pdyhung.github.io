/* book.js – mục lục, tìm kiếm, pager, chấm bài, KaTeX, sáng/tối, lộ trình */
(function(){
  const D = document, html = D.documentElement;
  const ROOT = html.dataset.root || '';
  const PAGE = html.dataset.page || 'index.html';
  const LS = { get(k,d){ try{ const v=localStorage.getItem('kcs-'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
               set(k,v){ try{ localStorage.setItem('kcs-'+k, JSON.stringify(v)); }catch(e){} },
               del(k){ try{ localStorage.removeItem('kcs-'+k); }catch(e){} } };
  window.KCS = { LS };
  window.KATEX_OPTS = { delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false };
  const B = window.BOOK || {parts:[],appendix:[]};

  const flat = [{f:'index.html', t:'Trang chủ'}];
  B.parts.forEach(p=>p.chapters.forEach(c=>{
    c.lessons.forEach((l,i)=>{ if(l.ok) flat.push({f:c.dir+'/'+l.f, t:'Bài '+c.n+'.'+(i+1)+'. '+l.t}); });
    if (c.test) flat.push({f:c.dir+'/kiem_tra_chuong.html', t:'Kiểm tra Chương '+c.n});
  }));
  (B.appendix||[]).forEach(a=>{ if(a.ok) flat.push({f:'phu_luc/'+a.f, t:'Phụ lục '+a.k+'. '+a.t}); });
  const route = LS.get('route','all');
  const inRoute = c => route==='all' || c.flags.includes(route);

  const scoreOf = f => LS.get('score:'+f, null);
  function chapScore(c){ let g=0,t=0; const add=f=>{ const s=scoreOf(f); if(s){g+=s.g;t+=s.n;} }; c.lessons.forEach(l=>add(c.dir+'/'+l.f)); add(c.dir+'/kiem_tra_chuong.html'); return t?g+'/'+t:''; }

  function buildSidebar(){
    const sb = D.getElementById('sidebar'); if(!sb) return;
    let h = '<div class="part"><a href="'+ROOT+'index.html">⌂ Trang chủ</a></div>';
    B.parts.forEach(p=>{
      h += '<div class="part">Phần '+p.n+' – '+p.t+'</div>';
      p.chapters.forEach(c=>{
        const open = PAGE.startsWith(c.dir+'/');
        const built = c.lessons.some(l=>l.ok);
        h += '<details'+(open?' open':'')+(inRoute(c)?'':' class="off"')+'><summary'+(built?'':' class="soon"')+'>'+c.n+'. '+c.t+'<span class="sc">'+chapScore(c)+'</span></summary><ul>';
        c.lessons.forEach((l,i)=>{
          const f = c.dir+'/'+l.f;
          h += l.ok ? '<li><a href="'+ROOT+f+'"'+(f===PAGE?' class="cur"':'')+'>'+(i+1)+'. '+l.t+'</a></li>' : '<li class="soon">'+(i+1)+'. '+l.t+'</li>';
        });
        const tf = c.dir+'/kiem_tra_chuong.html';
        if (c.test) h += '<li><a href="'+ROOT+tf+'"'+(tf===PAGE?' class="cur"':'')+'>✔ Kiểm tra chương</a></li>';
        h += '</ul></details>';
      });
    });
    if ((B.appendix||[]).length){
      h += '<div class="part">Phụ lục</div><ul style="padding-left:8px">';
      B.appendix.forEach(a=>{ const f='phu_luc/'+a.f; h += a.ok?'<li><a href="'+ROOT+f+'"'+(f===PAGE?' class="cur"':'')+'>'+a.k+'. '+a.t+'</a></li>':'<li class="soon">'+a.k+'. '+a.t+'</li>'; });
      h += '</ul>';
    }
    sb.innerHTML = h;
    const cur = sb.querySelector('.cur'); if(cur) cur.scrollIntoView({block:'center'});
  }

  function buildPager(){
    const pg = D.getElementById('pager'); if(!pg) return;
    const i = flat.findIndex(x=>x.f===PAGE); if(i<0) return;
    const a = flat[i-1], b = flat[i+1];
    pg.innerHTML = (a?'<a class="pv" href="'+ROOT+a.f+'"><small>← Trang trước</small>'+a.t+'</a>':'') + (b?'<a class="nx" href="'+ROOT+b.f+'"><small>Trang sau →</small>'+b.t+'</a>':'');
  }

  function setupSearch(){
    const box = D.querySelector('.search input'), res = D.querySelector('.search .res'); if(!box) return;
    let loaded = !!window.SEARCH_INDEX, sel = -1;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d');
    function load(cb){ if(loaded) return cb(); const s=D.createElement('script'); s.src=ROOT+'search-index.js'; s.onload=()=>{loaded=true;cb();}; D.head.append(s); }
    function run(){
      const q = norm(box.value.trim()); if(q.length<2){ res.style.display='none'; return; }
      const words = q.split(/\s+/), hits = [];
      (window.SEARCH_INDEX||[]).forEach(p=>{
        if(!p._x){ p._x = norm(p.x); p._t = norm(p.t); }
        if(words.every(w=>p._t.includes(w)||p._x.includes(w))){
          const sc = words.reduce((a,w)=>a+(p._t.includes(w)?5:0),0);
          const k = p._x.indexOf(words[0]);
          const snip = k>=0 ? '…'+p.x.substr(Math.max(0,k-40),120)+'…' : '';
          hits.push({p,sc,snip});
        }
      });
      hits.sort((a,b)=>b.sc-a.sc);
      res.innerHTML = hits.slice(0,20).map(h=>'<a href="'+ROOT+h.p.f+'">'+h.p.t+'<small>'+h.snip.replace(/</g,'&lt;')+'</small></a>').join('') || '<a><small>Không tìm thấy.</small></a>';
      res.style.display='block'; sel=-1;
    }
    box.addEventListener('input',()=>load(run));
    box.addEventListener('focus',()=>load(()=>{ if(box.value) run(); }));
    box.addEventListener('keydown',e=>{
      const items=[...res.querySelectorAll('a[href]')];
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(0,Math.min(items.length-1, sel+(e.key==='ArrowDown'?1:-1))); items.forEach((a,i)=>a.classList.toggle('sel',i===sel)); }
      if(e.key==='Enter'&&items.length){ location.href = items[Math.max(sel,0)].href; }
      if(e.key==='Escape'){ res.style.display='none'; box.blur(); }
    });
    D.addEventListener('click',e=>{ if(!e.target.closest('.search')) res.style.display='none'; });
  }

  function parseNum(s){ s=String(s).trim().replace(/\s/g,''); if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s=s.replace(/\./g,''); return parseFloat(s.replace(',','.')); }
  window.KCS.parseNum = parseNum;
  function setupQuiz(){
    const qs = [...D.querySelectorAll('.q')]; if(!qs.length) return;
    const state = LS.get('quiz:'+PAGE, {});
    const scoreEl = D.getElementById('score');
    function update(){
      const g = qs.filter((q,i)=>state[i]===true).length, done = Object.keys(state).length;
      if(scoreEl) scoreEl.querySelector('span').textContent = 'Điểm: '+g+' / '+qs.length+(done<qs.length?' · đã làm '+done+' câu':'');
      LS.set('quiz:'+PAGE, state); if(done) LS.set('score:'+PAGE, {g, n:qs.length}); else LS.del('score:'+PAGE);
    }
    qs.forEach((q,i)=>{
      const fb = q.querySelector('.fb');
      q.querySelector('.q-check').addEventListener('click',()=>{
        let ok=false;
        if(q.dataset.type==='mc'){
          const c = q.querySelector('input[type=radio]:checked'); if(!c){ fb.textContent='Chọn một phương án.'; fb.className='fb'; return; }
          ok = c.value === q.dataset.ans;
        } else {
          const v = parseNum(q.querySelector('.q-ans input').value), a = parseFloat(q.dataset.ans), tol = parseFloat(q.dataset.tol||'0.02');
          if(!isFinite(v)){ fb.textContent='Nhập một số (dấu phẩy hoặc dấu chấm thập phân).'; fb.className='fb'; return; }
          ok = Math.abs(v-a) <= tol*Math.abs(a) + 1e-9;
        }
        state[i]=ok; fb.textContent = ok ? '✔ Đúng' : '✘ Chưa đúng – xem Gợi ý rồi thử lại.'; fb.className = 'fb '+(ok?'ok':'no');
        update(); buildSidebar();
      });
      if(state[i]!==undefined){ fb.textContent = state[i]?'✔ Đã làm đúng':'✘ Lần trước chưa đúng'; fb.className='fb '+(state[i]?'ok':'no'); }
    });
    D.getElementById('reset-quiz')?.addEventListener('click',()=>{ for(const k in state) delete state[k]; qs.forEach(q=>{ q.querySelector('.fb').textContent=''; q.querySelectorAll('input').forEach(x=>{ if(x.type==='radio') x.checked=false; else x.value=''; }); }); update(); buildSidebar(); });
    update();
  }

  function setupSite(){
    // Liên kết về trang chủ pdyhung.github.io và favicon dùng chung
    const tb = D.querySelector('.topbar');
    if (tb && !D.getElementById('site-home')){
      const a = D.createElement('a');
      a.id = 'site-home'; a.className = 'icon-btn'; a.href = ROOT + '../index.html';
      a.title = 'Về trang chủ pdyhung.github.io'; a.textContent = '🏠';
      a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;text-decoration:none';
      const th = D.getElementById('theme-btn');
      th ? tb.insertBefore(a, th) : tb.append(a);
    }
    if (!D.querySelector('link[rel~="icon"]')){
      const l = D.createElement('link'); l.rel = 'icon'; l.href = ROOT + '../hung_pham.ico'; D.head.append(l);
    }
  }

  function setupUI(){
    D.getElementById('theme-btn')?.addEventListener('click',()=>{ const t = html.dataset.theme==='dark'?'light':'dark'; html.dataset.theme=t; LS.set('theme',t); D.dispatchEvent(new Event('themechange')); });
    D.getElementById('menu-btn')?.addEventListener('click',e=>{ e.stopPropagation(); if(innerWidth<=900) D.body.classList.toggle('side'); else D.body.classList.toggle('noside'); });
    D.querySelector('.main')?.addEventListener('click',()=>D.body.classList.remove('side'));
    D.querySelectorAll('img.zoom').forEach(img=>img.addEventListener('click',()=>{ const lb=D.createElement('div'); lb.className='lightbox'; lb.innerHTML='<img src="'+img.src+'" alt="">'; lb.onclick=()=>lb.remove(); D.body.append(lb); }));
    D.getElementById('print-btn')?.addEventListener('click',()=>{ D.querySelectorAll('.page details').forEach(d=>d.open=true); window.print(); });
    const r = D.querySelector('.route');
    if(r){
      r.querySelectorAll('button').forEach(b=>{ b.classList.toggle('on', b.dataset.r===route); b.addEventListener('click',()=>{ LS.set('route', b.dataset.r); location.reload(); }); });
      D.querySelectorAll('.toc-ch[data-flags]').forEach(el=>{ if(!(route==='all'||el.dataset.flags.includes(route))) el.style.opacity=.45; });
    }
  }

  D.addEventListener('DOMContentLoaded',()=>{
    buildSidebar(); buildPager(); setupSearch(); setupSite(); setupUI(); setupQuiz();
    if(window.renderMathInElement) renderMathInElement(D.querySelector('.page')||D.body, window.KATEX_OPTS);
    if(window.WC) WC.init();
  });
})();
