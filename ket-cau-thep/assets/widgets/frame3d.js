/* frame3d.js – mô hình 3D dùng chung (three.js r147) cho W1, W2: nhà xưởng Hòa Bình
   nhịp 50 m, dài 72 m = 9 × 8 m, đỉnh cột 7,07 m, đỉnh mái 8,82 m (dốc 7 %). Trục: x ngang nhà, y đứng, z dọc nhà. */
window.FRAME3D = function (view) {
  const T = window.THREE, W = 50, L = 72, B = 8, H = 7.07, R = 8.82, I = 0.07;
  const yR = x => H + (W / 2 - Math.abs(x)) * I;
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(38, 1.6, 0.5, 800);
  cam.position.set(52, 30, -14);
  const ren = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  view.append(ren.domElement);
  const ctl = new T.OrbitControls(cam, ren.domElement);
  ctl.target.set(0, 4, L / 2); ctl.update();
  const groups = {}, COL = {
    khung: '#1f6feb', hoi: '#0a7ea4', xago: '#2da44e', damtuong: '#8957e5', giangmai: '#d1242f',
    giangcot: '#e16f24', thanhchong: '#bf8700', chongxien: '#e85aad', mong: '#7d8590',
    tonmai: '#6e7781', tonvach: '#6e7781', tonhoi: '#6e7781' };
  const line = (key, segs) => {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(segs.flat(), 3));
    const o = new T.LineSegments(g, new T.LineBasicMaterial({ color: COL[key], transparent: true, opacity: 1 }));
    let len = 0; segs.forEach(s => { len += Math.hypot(s[3] - s[0], s[4] - s[1], s[5] - s[2]); });
    o.userData = { n: segs.length, len }; scene.add(o); groups[key] = o; return o;
  };
  const sheet = (key, quads) => {
    const p = []; quads.forEach(q => { const [a, b, c, d] = q; p.push(...a, ...b, ...c, ...a, ...c, ...d); });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3));
    const o = new T.Mesh(g, new T.MeshBasicMaterial({ color: COL[key], transparent: true, opacity: 0.12, side: T.DoubleSide, depthWrite: false }));
    o.visible = false; scene.add(o); groups[key] = o; return o;
  };
  const zs = []; for (let z = 0; z <= L; z += B) zs.push(z);
  const xs = []; for (let k = 0; k <= 8; k++) xs.push(-W / 2 + k * W / 8);      // nút kèo, cột sườn tường
  const S = [];
  zs.forEach(z => S.push([-25, 0, z, -25, H, z], [25, 0, z, 25, H, z], [-25, H, z, 0, R, z], [25, H, z, 0, R, z]));
  line('khung', S.splice(0));
  [0, L].forEach(z => xs.slice(1, -1).forEach(x => S.push([x, 0, z, x, yR(x), z])));
  line('hoi', S.splice(0));
  for (let k = 1; k < 32; k++) { const x = -W / 2 + k * W / 32; S.push([x, yR(x), 0, x, yR(x), L]); }
  line('xago', S.splice(0));
  [1.5, 3, 4.5, 6].forEach(y => { [-25, 25].forEach(x => S.push([x, y, 0, x, y, L])); [0, L].forEach(z => S.push([-25, y, z, 25, y, z])); });
  line('damtuong', S.splice(0));
  const bays = [[0, B], [L - B, L]];
  bays.forEach(([z0, z1]) => xs.slice(0, -1).forEach((a, k) => { const b = xs[k + 1];
    S.push([a, yR(a), z0, b, yR(b), z1], [a, yR(a), z1, b, yR(b), z0]); }));
  line('giangmai', S.splice(0));
  bays.forEach(([z0, z1]) => [-25, 25].forEach(x => S.push([x, 0, z0, x, H, z1], [x, 0, z1, x, H, z0])));
  line('giangcot', S.splice(0));
  S.push([-25, H, 0, -25, H, L], [25, H, 0, 25, H, L], [0, R, 0, 0, R, L]);
  line('thanhchong', S.splice(0));
  zs.slice(1, -1).forEach(z => {
    [-20, -12, -5, 5, 12, 20].forEach(x => { const y = yR(x); S.push([x, y - 0.7, z, x, y, z + 1.4], [x, y - 0.7, z, x, y, z - 1.4]); });
    [-1, 1].forEach(s => S.push([s * 24.4, 4.5, z, s * 25, 4.5, z + 1.4], [s * 24.4, 4.5, z, s * 25, 4.5, z - 1.4]));
  });
  line('chongxien', S.splice(0));
  const base = (x, z) => S.push([x - 0.6, 0, z, x + 0.6, 0, z], [x, 0, z - 0.6, x, 0, z + 0.6], [x - 0.6, 0, z - 0.6, x + 0.6, 0, z + 0.6]);
  zs.forEach(z => [-25, 25].forEach(x => base(x, z))); [0, L].forEach(z => xs.slice(1, -1).forEach(x => base(x, z)));
  line('mong', S.splice(0));
  sheet('tonmai', [[[-25, H, 0], [0, R, 0], [0, R, L], [-25, H, L]], [[25, H, 0], [0, R, 0], [0, R, L], [25, H, L]]]);
  sheet('tonvach', [[[-25, 0, 0], [-25, H, 0], [-25, H, L], [-25, 0, L]]]);
  sheet('tonhoi', [[[-25, 0, 0], [-25, H, 0], [0, R, 0], [25, H, 0]], [[-25, 0, 0], [25, H, 0], [25, 0, 0], [-25, 0, 0]]]);
  const grid = new T.GridHelper(120, 24, 0x888888, 0x888888); grid.position.set(0, -0.02, L / 2);
  grid.material.transparent = true; grid.material.opacity = 0.15; scene.add(grid);
  const arrows = new T.Group(); scene.add(arrows);
  const api = { T, scene, cam, ren, groups, yR, dims: { W, L, B, H, R }, COL };
  api.render = () => ren.render(scene, cam);
  api.arrow = (from, dir, len, color) => arrows.add(new T.ArrowHelper(new T.Vector3(...dir).normalize(), new T.Vector3(...from), len, color, len * 0.3, len * 0.18));
  api.clearArrows = () => { while (arrows.children.length) arrows.remove(arrows.children[0]); };
  const bg = () => { scene.background = new T.Color(window.WC && WC.isDark() ? '#0d1117' : '#ffffff'); api.render(); };
  const size = () => { const w = view.clientWidth || 640, h = Math.round(Math.min(w * 0.62, 520)); ren.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); api.render(); };
  ctl.addEventListener('change', api.render);
  document.addEventListener('themechange', bg);
  if (window.ResizeObserver) new ResizeObserver(size).observe(view); else window.addEventListener('resize', size);
  bg(); size();
  return api;
};
