/* W2 – Đường truyền tải 3D: tải đứng / gió ngang / gió dọc (Bài 1.2) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W2'] = function (el) {
  const F = WC.frame(el, { title: 'W2 · Đường truyền tải trọng',
    tryText: 'chọn "Gió dọc nhà" và để ý: khung ngang không tham gia, tải đi qua giằng mái → thanh chống → giằng cột.' });
  if (!window.THREE) { F.view.innerHTML = '<p class="w-err">Không tải được three.js.</p>'; return; }
  let M; try { M = FRAME3D(F.view); } catch (e) { F.view.innerHTML = '<p class="w-err">Trình duyệt không hỗ trợ WebGL.</p>'; return; }
  const P = {
    dung: { t: 'Tải đứng', steps: [['tonmai', 'Tôn mái'], ['xago', 'Xà gồ'], ['khung', 'Kèo → cột (khung ngang)'], ['mong', 'Móng']] },
    ngang: { t: 'Gió ngang nhà', steps: [['tonvach', 'Tôn vách'], ['damtuong', 'Dầm tường'], ['khung', 'Cột → khung ngang'], ['mong', 'Móng']] },
    doc: { t: 'Gió dọc nhà', steps: [['tonhoi', 'Tôn đầu hồi'], ['damtuong', 'Dầm tường đầu hồi'], ['hoi', 'Cột sườn tường'], ['giangmai', 'Giằng mái'], ['thanhchong', 'Thanh chống'], ['giangcot', 'Giằng cột'], ['mong', 'Móng']] } };
  let cur = 'dung', s = 0, run = true;
  const btns = WC.el('div', { class: 'w-btns' }); F.ctrl.append(btns);
  const bs = {}; Object.keys(P).forEach(k => { const b = WC.el('button', {}, P[k].t); b.onclick = () => { cur = k; s = 0; arrows(); paint(); }; btns.append(b); bs[k] = b; });
  const pb = WC.el('button', {}, '⏸ Dừng'); pb.onclick = () => { run = !run; pb.textContent = run ? '⏸ Dừng' : '▶ Chạy'; }; btns.append(pb);
  const nb = WC.el('button', {}, 'Bước tiếp →'); nb.onclick = () => { s = (s + 1) % P[cur].steps.length; paint(); }; btns.append(nb);
  const arrows = () => {
    M.clearArrows(); const red = 0xd1242f;
    if (cur === 'dung') [-20, -10, 10, 20].forEach(x => [12, 36, 60].forEach(z => M.arrow([x, M.yR(x) + 4, z], [0, -1, 0], 3.4, red)));
    if (cur === 'ngang') [2, 5].forEach(y => [12, 36, 60].forEach(z => M.arrow([-32, y, z], [1, 0, 0], 6, red)));
    if (cur === 'doc') [-15, 0, 15].forEach(x => [2, 5].forEach(y => M.arrow([x, y, -7], [0, 0, 1], 6, red)));
  };
  const paint = () => {
    const st = P[cur].steps, on = st.slice(0, s + 1).map(x => x[0]);
    Object.keys(M.groups).forEach(k => { const g = M.groups[k], isS = /^ton/.test(k);
      if (isS) { g.visible = st.some(x => x[0] === k); g.material.opacity = on.includes(k) ? 0.35 : 0.06; }
      else g.material.opacity = on.includes(k) ? 1 : 0.07; });
    Object.keys(bs).forEach(k => bs[k].classList.toggle('on', k === cur));
    F.out.innerHTML = '<ol class="w-steps">' + st.map((x, i) => '<li' + (i === s ? ' style="font-weight:700;color:var(--acc)"' : i < s ? '' : ' style="opacity:.5"') + '>' + x[1] + '</li>').join('') + '</ol>';
    M.render();
  };
  setInterval(() => { if (run) { s = (s + 1) % P[cur].steps.length; paint(); } }, 1300);
  arrows(); paint();
};
