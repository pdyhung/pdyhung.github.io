/* W1 – Khung 3D nhà xưởng Hòa Bình: bật/tắt nhóm cấu kiện (Bài 1.1) */
window.WIDGETS = window.WIDGETS || {};
window.WIDGETS['W1'] = function (el) {
  const F = WC.frame(el, { title: 'W1 · Khung thép 3D – nhà xưởng Hòa Bình (50 × 72 m)',
    tryText: 'tắt "Xà gồ", "Dầm tường" và "Khung ngang" để chỉ còn hệ giằng và thanh chống: đó là hệ giữ nhà theo phương dọc. Kéo chuột để xoay, cuộn để phóng to.' });
  if (!window.THREE) { F.view.innerHTML = '<p class="w-err">Không tải được three.js.</p>'; return; }
  let M; try { M = FRAME3D(F.view); } catch (e) { F.view.innerHTML = '<p class="w-err">Trình duyệt không hỗ trợ WebGL.</p>'; return; }
  const N = { khung: 'Khung ngang (cột, kèo)', hoi: 'Cột sườn tường đầu hồi', xago: 'Xà gồ mái', damtuong: 'Dầm tường',
    giangmai: 'Giằng mái', giangcot: 'Giằng cột', thanhchong: 'Thanh chống', chongxien: 'Chống xiên (fly brace)' };
  const upd = () => {
    let n = 0, l = 0; const rows = [];
    Object.keys(N).forEach(k => { const g = M.groups[k]; if (!g.visible) return; n += g.userData.n; l += g.userData.len;
      rows.push(['<i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + M.COL[k] + '"></i> ' + N[k], g.userData.n, WC.f(g.userData.len, 0)]); });
    rows.push(['<b>Tổng đang hiện</b>', '<b>' + n + '</b>', '<b>' + WC.f(l, 0) + '</b>']);
    WC.table(F.out, rows, ['Nhóm cấu kiện', 'Số thanh', 'Tổng dài (m)']);
  };
  Object.keys(N).forEach(k => WC.check(F.ctrl, { label: N[k], color: M.COL[k], checked: true,
    onChange: v => { M.groups[k].visible = v; M.render(); upd(); } }));
  const b = WC.el('div', { class: 'w-btns' }); const r = WC.el('button', {}, '↺ Góc nhìn ban đầu');
  r.onclick = () => { M.cam.position.set(52, 30, -14); M.render(); }; b.append(r); F.ctrl.append(b);
  upd(); M.render();
};
