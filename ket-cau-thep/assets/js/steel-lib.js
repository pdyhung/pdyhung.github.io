/* steel-lib.js – thư viện tính toán dùng chung cho widget và bài tập.
   Đơn vị: mm, MPa, N → kết quả kN, kNm. Kiểm thử bằng số liệu Chương 13 (xem tools/html/README.md). */
window.SL = (function steelLib() {
    const E = 200000;
    const SL = { E };
    SL.props = function(s) {
      const { d, bf, tf, tw } = s, h = d - 2 * tf, ho = d - tf;
      const A = 2 * bf * tf + h * tw;
      const Ix = (bf * d ** 3 - (bf - tw) * h ** 3) / 12;
      const Iy = 2 * tf * bf ** 3 / 12 + h * tw ** 3 / 12;
      const Sx = Ix / (d / 2);
      const Zx = bf * tf * (d - tf) + tw * h * h / 4;
      const J = (2 * bf * tf ** 3 + h * tw ** 3) / 3;
      const Cw = Iy * ho * ho / 4;
      const rts = Math.sqrt(Math.sqrt(Iy * Cw) / Sx);
      return { d, bf, tf, tw, h, ho, A, Ix, Iy, Sx, Zx, J, Cw, rts, rx: Math.sqrt(Ix / A), ry: Math.sqrt(Iy / A) };
    };
    const cls = (l, lp, lr) => (l <= lp ? "compact" : l <= lr ? "noncompact" : "slender");
    SL.classify = function(s, Fy) {
      const p = SL.props(s), rt = Math.sqrt(E / Fy);
      const lf = s.bf / (2 * s.tf), lw = p.h / s.tw;
      const kc = Math.min(0.76, Math.max(0.35, 4 / Math.sqrt(lw)));
      const FL = 0.7 * Fy;
      const fc = { lam: lf, lr: 0.64 * Math.sqrt(kc * E / Fy) };
      fc.cls = lf <= fc.lr ? "nonslender" : "slender";
      const wc = { lam: lw, lr: 1.49 * rt };
      wc.cls = lw <= wc.lr ? "nonslender" : "slender";
      const ff = { lam: lf, lp: 0.38 * rt, lr: 0.95 * Math.sqrt(kc * E / FL) };
      ff.cls = cls(lf, ff.lp, ff.lr);
      const wf = { lam: lw, lp: 3.76 * rt, lr: 5.7 * rt };
      wf.cls = cls(lw, wf.lp, wf.lr);
      return { kc, FL, fc, wc, ff, wf, p };
    };
    SL.Mn = function(s, Fy, Lb, Cb = 1) {
      const c = SL.classify(s, Fy), p = c.p;
      const Mp = Fy * p.Zx, Mr = 0.7 * Fy * p.Sx;
      const Lp = 1.76 * p.ry * Math.sqrt(E / Fy);
      const jc = p.J / (p.Sx * p.ho);
      const Lr = 1.95 * p.rts * E / (0.7 * Fy) * Math.sqrt(jc + Math.sqrt(jc * jc + 6.76 * (0.7 * Fy / E) ** 2));
      let Mltb;
      if (Lb <= Lp)
        Mltb = Mp;
      else if (Lb <= Lr)
        Mltb = Math.min(Mp, Cb * (Mp - (Mp - Mr) * (Lb - Lp) / (Lr - Lp)));
      else {
        const q = Lb / p.rts;
        const Fcr = Cb * Math.PI ** 2 * E / q ** 2 * Math.sqrt(1 + 0.078 * jc * q * q);
        Mltb = Math.min(Mp, Fcr * p.Sx);
      }
      let Mflb = Mp, ff = c.ff;
      if (ff.cls === "noncompact")
        Mflb = Mp - (Mp - Mr) * (ff.lam - ff.lp) / (ff.lr - ff.lp);
      else if (ff.cls === "slender")
        Mflb = 0.9 * E * c.kc * p.Sx / ff.lam ** 2;
      const Mn = Math.min(Mltb, Mflb);
      return { Mp: Mp / 1e6, Mr: Mr / 1e6, Lp, Lr, Mltb: Mltb / 1e6, Mflb: Mflb / 1e6, Mn: Mn / 1e6, phiMn: 0.9 * Mn / 1e6, gov: Mltb <= Mflb ? "LTB" : "FLB", sec: ff.lam > ff.lp ? "F3" : "F2" };
    };
    SL.Pn = function(s, Fy, Lcx, Lcy) {
      const c = SL.classify(s, Fy), p = c.p;
      const sl = Math.max(Lcx / p.rx, Lcy / p.ry);
      const Fe = Math.PI ** 2 * E / sl ** 2;
      const fcr = (Q) => (sl <= 4.71 * Math.sqrt(E / (Q * Fy)) ? Q * Math.pow(0.658, Q * Fy / Fe) * Fy : 0.877 * Fe);
      let Q = 1, be = p.h;
      if (c.wc.cls === "slender") {
        const f = fcr(1), b = p.h, t = s.tw, r = Math.sqrt(E / f);
        be = Math.min(b, 1.92 * t * r * (1 - 0.34 / (b / t) * r));
        Q = (p.A - (b - be) * t) / p.A;
      }
      const Fcr = fcr(Q);
      return { sl, slx: Lcx / p.rx, sly: Lcy / p.ry, Fe, Q, be, Fcr, Pn: Fcr * p.A / 1000, phiPn: 0.9 * Fcr * p.A / 1000 };
    };
    SL.H1 = function(r_p, r_m) {
      return r_p >= 0.2 ? { eq: "H1-1a", val: r_p + 8 / 9 * r_m } : { eq: "H1-1b", val: r_p / 2 + r_m };
    };
    SL.Vn = function(s, Fy) {
      const p = SL.props(s), hw = p.h / s.tw, lim = 1.1 * Math.sqrt(5 * E / Fy);
      const Cv = hw <= lim ? 1 : lim / hw;
      const Vn = 0.6 * Fy * p.h * s.tw * Cv / 1000;
      return { hw, lim, Cv, Vn, phiVn: 0.9 * Vn };
    };
    SL.fmt = (x, n = 2) => ((Math.round(x * 10 ** n) / 10 ** n).toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: n }));
    return SL;
  })();
