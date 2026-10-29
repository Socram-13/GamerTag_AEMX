/* MictLAN · motor de audio y música de fondo (WebAudio, sin archivos) */
window.MictlanAudio = function (E) {
  return (function () {
    var ctx = null, master = null, noiseBuf = null, on = true, vol = 0.55, L = {}, hasPan = true, rainA = 0, rainB = 0, ghostPos = null;

    var RNG = {
      shot: [25, 350], hit: [30, 500], crash: [40, 900], explode: [60, 1800], moo: [20, 300],
      mfall: [80, 1500], mimp: [80, 2500], mhit: [30, 400], mburn: [25, 300], alspawn: [14, 160], alcry: [10, 140], alhit: [10, 140], aldie: [10, 140],
      glitch: [30, 600], chime: [30, 600], car: [25, 500], ufo: [40, 900], fire: [25, 500], ghost: [8, 55], wail: [10, 75], llorona: [14, 110], scare: [14, 90], drone: [10, 120], beep: [10, 90], ali: [8, 80], step: [7, 90], servo: [5, 60], bfly: [16, 260], talk: [6, 60]
    };
    try { on = localStorage.getItem('aemx-sound') !== '0'; } catch (e) {}

    function spat(pos, rng) {
      var c = E.camera.position, e = E.camera.matrixWorld.elements, dx, dy, dz, d, ref = rng[0], max = rng[1], g, t, f, s, pan;
      if (!pos) return { g: 1, f: 18000, pan: 0 };
      dx = pos.x - c.x; dy = pos.y - c.y; dz = pos.z - c.z;
      d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d >= max) return null;
      g = ref / Math.max(d, ref);
      s = Math.min(1, Math.max(0, (d - max * 0.6) / (max * 0.4)));
      g *= 1 - s * s * (3 - 2 * s);
      if (g < 0.003) return null;
      t = Math.min(1, d / max);
      f = 18000 * Math.pow(0.03, Math.sqrt(t));
      pan = d > 0.001 ? (dx * e[0] + dy * e[1] + dz * e[2]) / d * Math.min(1, d / 8) * 0.85 : 0;
      return { g: g, f: f, pan: Math.max(-1, Math.min(1, pan)) };
    }

    function mkBus(s) {
      var g = ctx.createGain(), lp = ctx.createBiquadFilter(), pn = null, out = lp;
      g.gain.value = s ? s.g : 0.0001;
      lp.type = 'lowpass'; lp.Q.value = 0.7; lp.frequency.value = s ? s.f : 18000;
      g.connect(lp);
      if (hasPan && ctx.createStereoPanner) {
        pn = ctx.createStereoPanner(); pn.pan.value = s ? s.pan : 0;
        lp.connect(pn); out = pn;
      }
      out.connect(master);
      return { g: g, lp: lp, pn: pn, input: g };
    }
    function setBus(b, s, tc, tau) {
      if (!s) { b.g.gain.setTargetAtTime(0.0001, tc, tau); return; }
      b.g.gain.setTargetAtTime(s.g, tc, tau);
      b.lp.frequency.setTargetAtTime(s.f, tc, tau);
      if (b.pn) b.pn.pan.setTargetAtTime(s.pan, tc, tau);
    }
    function osc(type, f, dest, v) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = v;
      o.connect(g); g.connect(dest); o.start();
      return { o: o, g: g };
    }
    function loopNoise(filterType, f, v, dest) {
      var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; s.loop = true; fl.type = filterType; fl.frequency.value = f; g.gain.value = v;
      s.connect(fl); fl.connect(g); g.connect(dest || master); s.start();
      return { f: fl, g: g };
    }
    function init() {
      var AC = window.AudioContext || window.webkitAudioContext, comp, d, i, fl, lfo;
      if (ctx) { if (on && ctx.state === 'suspended') ctx.resume(); return; }
      if (!AC) return;
      try { ctx = new AC(); } catch (e) { ctx = null; return; }
      comp = ctx.createDynamicsCompressor();
      master = ctx.createGain(); master.gain.value = on ? vol : 0;
      master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      d = noiseBuf.getChannelData(0);
      for (i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

      L.sea = loopNoise('lowpass', 420, 0.0001);

      L.rainHi = loopNoise('highpass', 2200, 0.0001);
      L.rainLo = loopNoise('lowpass', 900, 0.0001);

      L.ghostBus = mkBus(null);
      L.ghN = loopNoise('bandpass', 700, 0.07, L.ghostBus.input); L.ghN.f.Q.value = 5;
      osc('sine', 0.23, L.ghN.f.frequency, 320); osc('sine', 0.17, L.ghN.g.gain, 0.05);
      L.ghD = ctx.createGain(); L.ghD.gain.value = 0.02; L.ghD.connect(L.ghostBus.input);
      L.ghO = osc('sine', 98, L.ghD, 1); osc('sine', 4.5, L.ghO.o.frequency, 3); osc('sine', 147.5, L.ghD, 0.6);

      L.carBus = mkBus(null);
      fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 420;
      L.carG = ctx.createGain(); L.carG.gain.value = 0.0001; fl.connect(L.carG); L.carG.connect(L.carBus.input);
      L.carA = osc('sawtooth', 50, fl, 1); L.carB = osc('square', 25, fl, 0.5);

      L.ufoBus = mkBus(null);
      L.ufoG = ctx.createGain(); L.ufoG.gain.value = 0.0001; L.ufoG.connect(L.ufoBus.input);
      L.ufoA = osc('sine', 140, L.ufoG, 1); L.ufoB = osc('triangle', 143, L.ufoG, 0.8);
      lfo = osc('sine', 7, L.ufoG.gain, 0.006);
      L.absG = ctx.createGain(); L.absG.gain.value = 0.0001; L.absG.connect(L.ufoBus.input);
      L.absA = osc('sine', 220, L.absG, 1); L.absB = osc('triangle', 330, L.absG, 0.4);
      L.crk = loopNoise('highpass', 2600, 0.0001, L.ufoBus.input);
      L.alG = ctx.createGain(); L.alG.gain.value = 0.0001; L.alG.connect(L.ufoBus.input);
      L.alA = osc('square', 760, L.alG, 1);

      L.fireBus = mkBus(null);
      L.fireRoar = loopNoise('lowpass', 500, 0.0001, L.fireBus.input);
      L.fireCrk = loopNoise('highpass', 2000, 0.0001, L.fireBus.input);
    }
    function tone(type, f0, f1, dur, v, delay, dest) {
      var t0, o, g;
      if (!ctx || !on) return;
      v = Math.max(v, 0.0002);
      t0 = ctx.currentTime + (delay || 0);
      o = ctx.createOscillator(); g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t0);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.02, dur * 0.25));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.05);
    }
    function noise(dur, v, f0, f1, type, delay, dest) {
      var t0, s, fl, g;
      if (!ctx || !on) return;
      v = Math.max(v, 0.0002);
      t0 = ctx.currentTime + (delay || 0);
      s = ctx.createBufferSource(); s.buffer = noiseBuf;
      fl = ctx.createBiquadFilter(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f0, t0);
      if (f1) fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
      g = ctx.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.05);
    }

    function shotBus(pos, key) {
      var s;
      if (!ctx || !on) return null;
      s = spat(pos, RNG[key]);
      return s ? mkBus(s).input : null;
    }
    function arp(dest, delay) {
      tone('sine', 660, 0, 0.22, 0.16, delay, dest);
      tone('sine', 880, 0, 0.22, 0.16, delay + 0.1, dest);
      tone('sine', 1320, 0, 0.5, 0.16, delay + 0.2, dest);
      noise(0.6, 0.05, 7000, 3000, 'highpass', delay + 0.05, dest);
    }
    function glitch(dur, pow, pos, dest) {
      var tm = 0, n = 0, k, b = dest || shotBus(pos, 'glitch');
      if (!b) return;
      while (tm < dur && n < 90) {
        k = 1 - tm / dur;
        tone('square', 120 + Math.random() * 1900, Math.random() < 0.4 ? 60 + Math.random() * 400 : 0, 0.03 + Math.random() * 0.04, 0.05 * pow * (0.4 + 0.6 * k), tm, b);
        if (Math.random() < 0.3) noise(0.05, 0.12 * pow * k, 5000, 1500, 'bandpass', tm, b);
        tm += 0.04 + Math.random() * 0.06; n++;
      }
    }
    /* ===== Música de fondo por región (WebAudio, sin archivos) ===== */
    var MS = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10] };
    var MREG = {
      noroeste: { root: 45, sc: 'minor', bpm: 70, prog: [0, 5, 3, 4], arp: 'triangle', pad: 'sawtooth', lp: 900 },
      norte: { open: 0.6, lead: 0.45, root: 38, sc: 'minor', bpm: 90, prog: [0, 3, 5, 4], arp: 'square', pad: 'sawtooth', lp: 650 },
      occidente: { open: 1.3, lead: 0.7, root: 50, sc: 'major', bpm: 100, prog: [0, 4, 5, 3], arp: 'triangle', pad: 'triangle', lp: 2200 },
      centro: { hats: 1, lead: 0.75, root: 43, sc: 'dorian', bpm: 110, prog: [0, 3, 0, 4], arp: 'sawtooth', pad: 'sawtooth', lp: 1300, pulse: 1 },
      golfo: { root: 41, sc: 'mixo', bpm: 95, prog: [0, 6, 3, 4], arp: 'triangle', pad: 'triangle', lp: 1500, drops: 1 },
      sur: { open: 0.6, lead: 0.45, root: 36, sc: 'phryg', bpm: 80, prog: [0, 1, 0, 6], arp: 'sine', pad: 'sawtooth', lp: 700 },
      uvx: { open: 0.8, lead: 0.5, hats: 1, root: 48, sc: 'major', bpm: 84, prog: [0, 5, 3, 4], arp: 'triangle', pad: 'triangle', lp: 1900 }, /* ambiente de oficina: tranquilo y suave, solo durante la visita a UVXpress */
      niebla: { root: 34, sc: 'phryg', bpm: 48, prog: [0, 0, 1, 0], pad: 'sine', lp: 600, ghost: 1 },
      peninsula: { open: 1.4, lead: 0.7, root: 48, sc: 'lydian', bpm: 85, prog: [0, 1, 4, 0], arp: 'sine', pad: 'triangle', lp: 2600, bells: 1 }
    };
    var MSTATE = { 'Baja California': 'noroeste', 'Baja California Sur': 'noroeste', 'Sonora': 'noroeste', 'Sinaloa': 'noroeste',
      'Chihuahua': 'norte', 'Coahuila': 'norte', 'Nuevo León': 'norte', 'Tamaulipas': 'norte', 'Durango': 'norte',
      'Jalisco': 'occidente', 'Nayarit': 'occidente', 'Colima': 'occidente', 'Michoacán': 'occidente', 'Zacatecas': 'occidente', 'Aguascalientes': 'occidente', 'San Luis Potosí': 'occidente', 'Guanajuato': 'occidente',
      'Veracruz': 'golfo', 'Tabasco': 'golfo', 'Guerrero': 'sur', 'Oaxaca': 'sur', 'Chiapas': 'sur',
      'Yucatán': 'peninsula', 'Campeche': 'peninsula', 'Quintana Roo': 'peninsula' };
    var M = null, mSes = null, mKey = null, mNext = 0, mStep = 0, mCheck = -9;
    function mFreq(R, deg) { var sc = MS[R.sc], o = Math.floor(deg / 7); return 440 * Math.pow(2, (R.root + 12 * o + sc[((deg % 7) + 7) % 7] - 69) / 12); }
    function mNote(type, f, t0, dur, v, att, dest, lp) {
      var o = ctx.createOscillator(), g = ctx.createGain(), out = g, fl;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(v, t0 + att);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      if (lp) { fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; g.connect(fl); out = fl; }
      out.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
    }
    function mInit() {
      M = {};
      M.out = ctx.createGain(); M.out.gain.value = 0.03;
      M.lp = ctx.createBiquadFilter(); M.lp.type = 'lowpass'; M.lp.frequency.value = 14000;
      M.dly = ctx.createDelay(1); M.dly.delayTime.value = 0.36;
      M.fb = ctx.createGain(); M.fb.gain.value = 0.38; M.dg = ctx.createGain(); M.dg.gain.value = 0.3;
      M.out.connect(M.lp); M.lp.connect(master); M.lp.connect(M.dly); M.dly.connect(M.fb); M.fb.connect(M.dly); M.dly.connect(M.dg); M.dg.connect(master);
    }
    function mRegion() {
      var x = E.camera.position.x, z = E.camera.position.z, best = null, bd = 1e12, i, d, dd, st;
      for (i = 0; i < E.districts.length; i++) { d = E.districts[i]; dd = (d.cx - x) * (d.cx - x) + (d.cz - z) * (d.cz - z); if (dd < bd) { bd = dd; best = d; } }
      if (!best) return 'centro';
      st = E.CITY2STATE[best.name] || best.name;
      return MSTATE[st] || 'centro';
    }
    function mSched(R, tNow) {
      if (R.ghost) {
        var gs = 30 / R.bpm, gt = mNext, gn = !!(ghostPos && (ghostPos.x - E.camera.position.x) * (ghostPos.x - E.camera.position.x) + (ghostPos.z - E.camera.position.z) * (ghostPos.z - E.camera.position.z) < 6400), gf;
        if (mStep % 8 === 0) {
          gf = mFreq(R, 7);
          mNote('sine', gf, gt, gs * 10, 0.07, 2.5, mSes.g, 500); mNote('sine', gf * 1.4142, gt, gs * 10, 0.045, 3, mSes.g, 500); mNote('sine', gf * 1.4985, gt, gs * 10, 0.03, 3, mSes.g, 500); mNote('sine', gf * 1.006, gt, gs * 10, 0.04, 2.8, mSes.g, 500);
        }
        if (Math.random() < (gn ? 0.3 : 0.1)) mNote('sine', mFreq(R, [0, 2, 4, 6][Math.floor(Math.random() * 4)] + 21) * (1 + (Math.random() - 0.5) * 0.035) * (gn ? 1.06 : 1), gt, 3, gn ? 0.06 : 0.04, 0.01, mSes.g);
        mNext += gs; mStep++;
        return;
      }
      var sd = 30 / R.bpm, bar = Math.floor(mStep / 8), st = mStep % 8, base = R.prog[bar % R.prog.length], ch = [base, base + 2, base + 4], t0 = mNext, k, f, sw, bf, ns, nf, ng;
      if (st === 0) {
        for (k = 0; k < 3; k++) { f = mFreq(R, ch[k] + 7); mNote('sawtooth', f, t0, sd * 9, 0.03, 1.5, mSes.g, R.lp * 0.7); mNote('sawtooth', f * 1.006, t0, sd * 9, 0.02, 1.7, mSes.g, R.lp * 0.7); }
      }
      sw = 0.5 + 0.5 * Math.sin(mStep * 0.13);
      bf = mFreq(R, base) * [1, 1, 2, 1, 1, 2, 1, 1.5][st];
      mNote('sawtooth', bf, t0, sd * 0.9, 0.11, 0.008, mSes.g, 180 + 650 * sw * (R.open || 1));
      if (st % 2 === 0) { var ko = ctx.createOscillator(), kg = ctx.createGain(); ko.frequency.setValueAtTime(130, t0); ko.frequency.exponentialRampToValueAtTime(42, t0 + 0.16); kg.gain.setValueAtTime(0.26, t0); kg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24); ko.connect(kg); kg.connect(mSes.g); ko.start(t0); ko.stop(t0 + 0.3); }
      if (st % 2 === 1 || (R.hats && st === 6)) { ns = ctx.createBufferSource(); ns.buffer = noiseBuf; nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 7500; ng = ctx.createGain(); ng.gain.setValueAtTime(0.06, t0); ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06); ns.connect(nf); nf.connect(ng); ng.connect(mSes.g); ns.start(t0, Math.random() * 1.5); ns.stop(t0 + 0.08); }
      if (Math.random() < (R.lead || 0.6)) { f = mFreq(R, ch[[0, 1, 2, 1, 0, 2, 1, 2][st]] + 14); mNote('sawtooth', f, t0, sd * 1.5, 0.04, 0.01, mSes.g, R.lp * 2.2); }
      mNext += sd; mStep++;
    }
    function musicStep(t) {
      var now = ctx.currentTime, key, R, old, inJ;
      if (!on || ctx.state !== 'running') return;
      if (!M) mInit();
      if (t - mCheck > 0.6) {
        mCheck = t; key = window.__uvx ? 'uvx' : ((typeof E.WX !== "undefined" && E.WX && E.WX.fogAt && E.WX.fogAt(E.camera.position.x, E.camera.position.z)) && !(window.__junkIn && window.__junkIn(E.camera.position.x, E.camera.position.z))) ? 'niebla' : mRegion();
        if (key !== mKey || !mSes) {
          old = mSes; mKey = key;
          mSes = { g: ctx.createGain() }; mSes.g.gain.value = 0.0001; mSes.g.connect(M.out); mSes.g.gain.setTargetAtTime(1, now, 1.2);
          if (old) { old.g.gain.setTargetAtTime(0.0001, now, 1.2); setTimeout(function () { try { old.g.disconnect(); } catch (e) { } }, 9000); }
          if (key === 'niebla') { mSes.ns = ctx.createBufferSource(); mSes.ns.buffer = noiseBuf; mSes.ns.loop = true; var wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 3; var wg = ctx.createGain(); wg.gain.value = 0.05; mSes.ns.connect(wf); wf.connect(wg); wg.connect(mSes.g); mSes.ns.start(); }
          if (old && old.ns) setTimeout(function () { try { old.ns.stop(); } catch (e) { } }, 9000);
          mNext = now + 0.1; mStep = 0;
        }
        inJ = !!(window.__junkIn && window.__junkIn(E.camera.position.x, E.camera.position.z));
        M.lp.frequency.setTargetAtTime(inJ ? 380 : 14000, now, 0.8);
        M.fb.gain.setTargetAtTime(inJ ? 0.6 : 0.38, now, 0.8);
      }
      if (!mSes) return;
      R = MREG[mKey];
      if (mNext < now - 0.5) mNext = now + 0.05;
      while (mNext < now + 0.35) mSched(R, now);
    }
    function update(t) {
      var tc, u, s, r, act, p, g;
      if (!ctx) return;
      tc = ctx.currentTime;
      try { musicStep(t); } catch (eM) { }

      r = Math.min(1, Math.max(0, (E.camera.position.y - 150) / 1350));
      r = 1 - r * r * (3 - 2 * r);

      var cd = E.coastDist(E.camera.position.x, E.camera.position.z), cr = Math.min(1, Math.max(0, (cd - 20) / 100));
      r *= 1 - cr * cr * (3 - 2 * cr);
      L.sea.g.gain.setTargetAtTime(0.05 * (0.7 + 0.3 * Math.sin(t * 0.7)) * r, tc, 0.3);
      L.sea.f.frequency.setTargetAtTime((380 + 160 * Math.sin(t * 0.5)) * (0.45 + 0.55 * r), tc, 0.3);

      var rs = rainB / (rainA + rainB + 0.001);
      L.rainHi.g.gain.setTargetAtTime(0.0001 + 0.045 * rainA + 0.02 * rainB, tc, 0.5);
      L.rainHi.f.frequency.setTargetAtTime(2200 + 1800 * rs, tc, 0.5);
      L.rainLo.g.gain.setTargetAtTime(0.0001 + 0.035 * rainA + 0.006 * rainB, tc, 0.5);
      setBus(L.ghostBus, ghostPos ? spat(ghostPos, RNG.ghost) : null, tc, 0.4);
      if (E.car && E.car.g) {
        r = Math.min(1.4, E.car.v / E.CAR_SPEED);
        setBus(L.carBus, spat(E.car.g.position, RNG.car), tc, 0.1);
        L.carG.gain.setTargetAtTime(0.006 + 0.03 * Math.min(1, r * 1.5), tc, 0.1);
        L.carA.o.frequency.setTargetAtTime(46 + 60 * r, tc, 0.1);
        L.carB.o.frequency.setTargetAtTime(23 + 30 * r, tc, 0.1);
      } else L.carG.gain.setTargetAtTime(0.0001, tc, 0.1);
      u = E.ufo;
      act = !!u && u.g.visible && u.state !== 'crash' && u.state !== 'stuck' && u.state !== 'wreck' && u.state !== 'spawn';
      if (act) {
        s = spat(u.g.position, RNG.ufo); p = u.state === 'abduct' || (u.state === 'cook' && u.T > E.COOK_WAIT && u.T < E.COOK_R1);
        setBus(L.ufoBus, s, tc, 0.1);
        L.ufoG.gain.setTargetAtTime(0.028, tc, 0.15);
        L.ufoA.o.frequency.setTargetAtTime(140 + (p ? 25 : 0) + 6 * Math.sin(t * 3), tc, 0.1);
        L.ufoB.o.frequency.setTargetAtTime(143 + (p ? 26 : 0) + 6 * Math.sin(t * 3), tc, 0.1);
        L.absG.gain.setTargetAtTime(p ? 0.03 : 0.0001, tc, 0.1);
        if (p) {
          g = Math.max(0, Math.min(1, (u.state === 'cook' ? u.T - E.COOK_WAIT : u.T) / 3.6));
          L.absA.o.frequency.setTargetAtTime(220 + 900 * g, tc, 0.05);
          L.absB.o.frequency.setTargetAtTime(330 + 1350 * g, tc, 0.05);
        }
        L.crk.g.gain.setTargetAtTime(u.hits >= 5 && Math.random() < 0.18 + (u.hits - 5) * 0.03 ? 0.03 : 0.0001, tc, 0.02);
        L.alG.gain.setTargetAtTime(u.hits >= 10 && Math.sin(t * 9) > 0.3 ? 0.012 : 0.0001, tc, 0.01);
        L.alA.o.frequency.setTargetAtTime(Math.sin(t * 4.5) > 0 ? 880 : 760, tc, 0.01);
      } else {
        L.ufoG.gain.setTargetAtTime(0.0001, tc, 0.1); L.absG.gain.setTargetAtTime(0.0001, tc, 0.1);
        L.crk.g.gain.setTargetAtTime(0.0001, tc, 0.05); L.alG.gain.setTargetAtTime(0.0001, tc, 0.05);
      }

      if (u && (u.state === 'crash' || u.state === 'stuck' || (u.state === 'wreck' && !u.gone))) {
        s = spat({ x: u.x, y: u.state === 'wreck' ? (u.gy || 0) + 1 : u.y, z: u.z }, RNG.fire);
        setBus(L.fireBus, s, tc, 0.1);
        L.fireRoar.g.gain.setTargetAtTime(0.035 * (0.8 + 0.2 * Math.sin(t * 3.1)) * (u.state === 'crash' || u.state === 'stuck' ? 1.3 : 1), tc, 0.15);
        L.fireRoar.f.frequency.setTargetAtTime(420 + 140 * Math.sin(t * 1.7), tc, 0.1);
        L.fireCrk.g.gain.setTargetAtTime(Math.random() < 0.3 ? 0.03 : 0.0001, tc, 0.01);
      } else {
        L.fireRoar.g.gain.setTargetAtTime(0.0001, tc, 0.2); L.fireCrk.g.gain.setTargetAtTime(0.0001, tc, 0.05);
      }
    }
    return {
      init: init, update: update,
      setRain: function (a, b) { rainA = a; rainB = b; },
      setGhost: function (p) { ghostPos = p; },
      isOn: function () { return on; },
      toggle: function () {
        on = !on;
        try { localStorage.setItem('aemx-sound', on ? '1' : '0'); } catch (e) {}
        if (ctx) { master.gain.setTargetAtTime(on ? vol : 0, ctx.currentTime, 0.05); if (on && ctx.state === 'suspended') ctx.resume(); }
      },
      suspend: function () { if (ctx) ctx.suspend(); },
      resume: function () { if (ctx && on) ctx.resume(); },
      shot: function (pos) { var b = shotBus(pos, 'shot'); if (!b) return; noise(0.03, 0.6, 9000, 3000, 'highpass', 0, b); noise(0.15, 0.7, 4000, 700, 'bandpass', 0, b); noise(0.4, 0.15, 1200, 300, 'lowpass', 0.02, b); tone('sine', 140, 50, 0.05, 0.15, 0, b); },
      hit: function (pos) { var b = shotBus(pos, 'hit'); if (!b) return; tone('triangle', 420, 120, 0.2, 0.3, 0, b); noise(0.12, 0.25, 4000, 900, 'bandpass', 0, b); },
      crash: function (pos) { var b = shotBus(pos, 'crash'); if (!b) return; tone('sawtooth', 520, 60, 1.5, 0.14, 0, b); noise(1.5, 0.1, 1500, 200, 'lowpass', 0, b); },
      explode: function (pos) { var b = shotBus(pos, 'explode'); if (!b) return; noise(1.4, 0.9, 2200, 90, 'lowpass', 0, b); tone('sine', 110, 30, 0.9, 0.8, 0, b); noise(0.25, 0.4, 6000, 1000, 'bandpass', 0, b); },

      mFall: function (pos) { var b = shotBus(pos, 'mfall'); if (!b) return; noise(2.6, 0.5, 250, 3800, 'bandpass', 0, b); tone('sawtooth', 70, 460, 2.5, 0.13, 0, b); noise(2.4, 0.22, 1500, 6000, 'highpass', 0.1, b); },
      mImpact: function (pos) { var b = shotBus(pos, 'mimp'); if (!b) return; noise(2.2, 1.0, 2600, 50, 'lowpass', 0, b); tone('sine', 95, 24, 1.6, 0.95, 0, b); noise(0.4, 0.5, 7000, 800, 'bandpass', 0, b); tone('sine', 55, 20, 2.4, 0.6, 0.1, b); noise(1.3, 0.3, 900, 120, 'lowpass', 0.5, b); },
      mHit: function (pos) { var b = shotBus(pos, 'mhit'); if (!b) return; noise(0.08, 0.5, 3200, 600, 'bandpass', 0, b); tone('triangle', 190, 70, 0.12, 0.35, 0, b); noise(0.05, 0.3, 9000, 3000, 'highpass', 0.02, b); },
      mBurn: function (pos) { var b = shotBus(pos, 'mburn'), i; if (!b) return; noise(0.7, 0.16, 1600, 400, 'bandpass', 0, b); tone('sine', 62, 52, 0.7, 0.1, 0, b); for (i = 0; i < 4; i++) noise(0.03, 0.2 + Math.random() * 0.15, 4000 + Math.random() * 3000, 2000, 'highpass', Math.random() * 0.6, b); },
      mBreak: function (pos) { var b = shotBus(pos, 'mimp'); if (!b) return; noise(2.6, 1.0, 3000, 60, 'lowpass', 0, b); tone('sine', 120, 20, 1.9, 1.0, 0, b); noise(0.6, 0.6, 8000, 400, 'bandpass', 0, b); tone('sawtooth', 320, 40, 1.2, 0.18, 0, b); noise(1.4, 0.3, 1200, 100, 'lowpass', 0.6, b); },

      alSpawn: function (pos) { var b = shotBus(pos, 'alspawn'); if (!b) return; tone('sine', 180, 1500, 0.9, 0.16, 0, b); tone('square', 90, 700, 0.9, 0.04, 0, b); noise(0.9, 0.1, 4500, 1200, 'bandpass', 0, b); },
      alCry: function (pos) { var b = shotBus(pos, 'alcry'), f0 = 800 + Math.random() * 700, i; if (!b) return; for (i = 0; i < 3; i++) tone('square', f0 * (1 + 0.12 * i), f0 * 1.5, 0.07, 0.1, i * 0.09, b); tone('sawtooth', f0 * 1.2, f0 * 0.7, 0.28, 0.1, 0.28, b); },
      alHit: function (pos) { var b = shotBus(pos, 'alhit'); if (!b) return; tone('sawtooth', 1600 + Math.random() * 400, 500, 0.22, 0.2, 0, b); noise(0.1, 0.2, 5000, 1500, 'bandpass', 0, b); },
      alDie: function (pos) { var b = shotBus(pos, 'aldie'); if (!b) return; tone('sawtooth', 760, 80, 0.9, 0.2, 0, b); tone('square', 380, 60, 0.9, 0.06, 0, b); noise(0.8, 0.1, 2600, 300, 'lowpass', 0, b); noise(0.04, 0.3, 6000, 2000, 'highpass', 0.85, b); },
      moo: function (pos) {
        var t0, o, fl, g, b = shotBus(pos, 'moo');
        if (!b) return;
        t0 = ctx.currentTime + 0.25;
        o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, t0); o.frequency.linearRampToValueAtTime(105, t0 + 0.9);
        fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 4;
        fl.frequency.setValueAtTime(420, t0); fl.frequency.linearRampToValueAtTime(700, t0 + 0.5);
        g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.22, t0 + 0.12); g.gain.linearRampToValueAtTime(0.0001, t0 + 0.95);
        o.connect(fl); fl.connect(g); g.connect(b); o.start(t0); o.stop(t0 + 1.0);
      },
      wail: function (pos) {

        var t0, o, o2, lf, lg, fl, g, b = shotBus(pos, 'wail'), f0 = 300 + Math.random() * 140;
        if (!b) return;
        t0 = ctx.currentTime + 0.05;
        o = ctx.createOscillator(); o.type = 'sawtooth'; o2 = ctx.createOscillator(); o2.type = 'triangle';
        o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f0 * 1.18, t0 + 0.6); o.frequency.exponentialRampToValueAtTime(f0 * 0.5, t0 + 2.6);
        o2.frequency.setValueAtTime(f0 * 1.5, t0); o2.frequency.exponentialRampToValueAtTime(f0 * 0.76, t0 + 2.6);
        lf = ctx.createOscillator(); lf.frequency.value = 5.5; lg = ctx.createGain(); lg.gain.value = 9; lf.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
        fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(700, t0); fl.frequency.linearRampToValueAtTime(1100, t0 + 0.7); fl.frequency.linearRampToValueAtTime(520, t0 + 2.6);
        g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.2, t0 + 0.5); g.gain.linearRampToValueAtTime(0.12, t0 + 1.4); g.gain.linearRampToValueAtTime(0.0001, t0 + 2.7);
        o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(b);
        o.start(t0); o2.start(t0); lf.start(t0); o.stop(t0 + 2.8); o2.stop(t0 + 2.8); lf.stop(t0 + 2.8);
        noise(2.4, 0.07, 1800, 600, 'bandpass', 0.1, b);
      },
      llorona: function (pos) { /* "Aaaaaay, mis hijooooos": sierra con formantes de vocal (a, i, m, o), vibrato creciente y eco */
        var b = shotBus(pos, 'llorona'), t0, o, o2, vib, vg, mx, ev, dl, fb, dg, i, V, P, F, E, fl = [], Q = [7, 9, 11], G = [1, 0.5, 0.28];
        if (!b) return;
        t0 = ctx.currentTime + 0.05;
        V = { a: [850, 1220, 2810], i: [310, 2790, 3310], o: [500, 900, 2830], m: [270, 1100, 2500] };
        P = [[0, 300], [0.5, 335], [1.1, 560], [2.0, 520], [2.7, 390], [3.2, 340], [3.9, 410], [4.8, 365], [5.8, 450], [6.8, 580], [7.6, 430], [8.6, 250]];
        F = [[0, 'a'], [2.55, 'a'], [3.2, 'i'], [3.6, 'm'], [4.1, 'm'], [4.3, 'i'], [5.1, 'i'], [5.8, 'i'], [6.3, 'o'], [8.0, 'o'], [8.6, 'o']];
        E = [[0, 0.0001], [0.25, 0.5], [2.9, 0.45], [3.3, 0.25], [3.55, 0.02], [3.8, 0.22], [4.3, 0.42], [4.95, 0.35], [5.1, 0.02], [5.55, 0.02], [5.8, 0.4], [6.4, 0.5], [8.2, 0.38], [8.6, 0.0001]];
        o = ctx.createOscillator(); o.type = 'sawtooth'; o2 = ctx.createOscillator(); o2.type = 'triangle';
        o.frequency.setValueAtTime(P[0][1], t0); o2.frequency.setValueAtTime(P[0][1] * 1.006, t0);
        for (i = 1; i < P.length; i++) { o.frequency.linearRampToValueAtTime(P[i][1], t0 + P[i][0]); o2.frequency.linearRampToValueAtTime(P[i][1] * 1.006, t0 + P[i][0]); }
        vib = ctx.createOscillator(); vib.frequency.value = 5.3; vg = ctx.createGain(); vg.gain.setValueAtTime(1, t0); vg.gain.linearRampToValueAtTime(14, t0 + 2.2); vg.gain.linearRampToValueAtTime(5, t0 + 4); vg.gain.linearRampToValueAtTime(16, t0 + 7);
        vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
        mx = ctx.createGain(); mx.gain.value = 1; o.connect(mx); o2.connect(mx);
        ev = ctx.createGain(); ev.gain.setValueAtTime(E[0][1], t0); for (i = 1; i < E.length; i++) ev.gain.linearRampToValueAtTime(E[i][1] * 0.8, t0 + E[i][0]);
        for (i = 0; i < 3; i++) {
          fl[i] = ctx.createBiquadFilter(); fl[i].type = 'bandpass'; fl[i].Q.value = Q[i]; fl[i].frequency.setValueAtTime(V[F[0][1]][i], t0);
          for (var k = 1; k < F.length; k++) fl[i].frequency.linearRampToValueAtTime(V[F[k][1]][i], t0 + F[k][0]);
          var gg = ctx.createGain(); gg.gain.value = G[i]; mx.connect(fl[i]); fl[i].connect(gg); gg.connect(ev);
        }
        ev.connect(b);
        dl = ctx.createDelay(1); dl.delayTime.value = 0.32; fb = ctx.createGain(); fb.gain.value = 0.38; dg = ctx.createGain(); dg.gain.value = 0.45;
        ev.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(dg); dg.connect(b);
        o.start(t0); o2.start(t0); vib.start(t0); o.stop(t0 + 8.8); o2.stop(t0 + 8.8); vib.stop(t0 + 8.8);
        noise(0.9, 0.04, 1400, 900, 'bandpass', 0.05, b);
        noise(0.3, 0.1, 6500, 6500, 'highpass', 4.95, b); noise(0.22, 0.06, 2500, 2500, 'bandpass', 5.5, b); noise(0.45, 0.12, 6500, 6500, 'highpass', 8.3, b);
      },
      scare: function (pos) {

        var b = shotBus(pos, 'scare');
        if (!b) return;
        tone('sine', 85, 38, 0.7, 0.55, 0, b);
        tone('sawtooth', 880, 300, 0.7, 0.22, 0, b); tone('square', 932, 310, 0.7, 0.12, 0, b); tone('sawtooth', 622, 210, 0.9, 0.16, 0.02, b);
        noise(0.7, 0.45, 7000, 500, 'bandpass', 0, b); noise(0.3, 0.25, 9000, 3000, 'highpass', 0, b);
      },
      holo: function (pos) { var b = shotBus(pos, 'beep'); if (!b) return; tone('sine', 260, 980, 0.7, 0.05, 0, b); tone('triangle', 520, 1500, 0.6, 0.025, 0.1, b); tone('sine', 1500, 1500, 0.4, 0.02, 0.6, b); },
      clap: function (pos) { var b = shotBus(pos, 'beep'); if (!b) return; noise(0.05, 0.16, 2400, 1000, 'bandpass', 0, b); noise(0.03, 0.1, 4200, 2000, 'highpass', 0.005, b); tone('triangle', 520, 300, 0.05, 0.05, 0, b); },
      shutter: function (pos) { var b = shotBus(pos, 'beep'); if (!b) return; noise(0.03, 0.06, 3200, 1400, 'bandpass', 0, b); tone('square', 1900, 1300, 0.03, 0.035, 0, b); noise(0.04, 0.05, 2200, 800, 'bandpass', 0.07, b); },
      beep: function (pos) {
        var b = shotBus(pos, 'beep');
        if (!b) return;
        tone('square', 1320, 1320, 0.1, 0.1, 0, b); tone('square', 1760, 1760, 0.1, 0.1, 0.16, b);
      },
      alWhistle: function (pos) { var b = shotBus(pos, 'ali'); if (!b) return; tone('sine', 1500, 2100, 0.2, 0.03, 0, b); tone('sine', 2100, 1650, 0.26, 0.03, 0.24, b); tone('sine', 1700, 1900, 0.15, 0.02, 0.56, b); },
      alChew: function (pos) { var b = shotBus(pos, 'ali'); if (!b) return; noise(0.06, 0.06, 2400, 900, 'bandpass', 0, b); noise(0.05, 0.05, 2000, 800, 'bandpass', 0.12, b); tone('triangle', 130, 90, 0.08, 0.025, 0.02, b); },
      alMur: function (pos) { var b = shotBus(pos, 'ali'), i, f; if (!b) return; for (i = 0; i < 5; i++) { f = 150 + Math.random() * 90; tone('square', f, f * (0.8 + Math.random() * 0.3), 0.13, 0.018, i * 0.17, b); tone('sine', f * 2.01, f * 1.7, 0.13, 0.012, i * 0.17, b); } },
      splash: function (pos) { var b = shotBus(pos, 'ali'); if (!b) return; noise(0.22, 0.06, 1800, 500, 'bandpass', 0, b); noise(0.12, 0.04, 3500, 1200, 'bandpass', 0.08, b); tone('sine', 320, 180, 0.1, 0.015, 0.03, b); },
      crackle: function (pos) { var b = shotBus(pos, 'ali'), i; if (!b) return; for (i = 0; i < 4; i++) noise(0.025, 0.05 + Math.random() * 0.04, 5000 + Math.random() * 3000, 2500, 'highpass', Math.random() * 0.35, b); tone('sawtooth', 55, 48, 0.9, 0.02, 0, b); },
      alTing: function (pos) { var b = shotBus(pos, 'ali'); if (!b) return; tone('sine', 2400, 2400, 0.14, 0.03, 0, b); tone('sine', 3600, 3600, 0.09, 0.015, 0.02, b); },
      step: function (pos, run) { var b = shotBus(pos, 'step'); if (!b) return; var k = 0.85 + Math.random() * 0.3; noise(0.07, run ? 0.07 : 0.045, 700 * k, 180, 'lowpass', 0, b); tone('sine', 95 * k, 55, 0.09, run ? 0.05 : 0.03, 0, b); tone('triangle', 1700 * k, 1100, 0.025, 0.012, 0, b); },
      servo: function (pos) { var b = shotBus(pos, 'servo'); if (!b) return; var k = 0.9 + Math.random() * 0.25; tone('sawtooth', 300 * k, 430 * k, 0.13, 0.014, 0, b); noise(0.1, 0.012, 2600, 1800, 'bandpass', 0, b); },
      bOn: function (pos) { var b = shotBus(pos, 'bfly'); if (!b) return; noise(0.55, 0.07, 400, 3200, 'bandpass', 0, b); tone('sawtooth', 70, 190, 0.5, 0.035, 0, b); },
      bHum: function (pos) { var b = shotBus(pos, 'bfly'); if (!b) return; tone('sawtooth', 96, 100, 0.32, 0.02, 0, b); noise(0.3, 0.02, 900, 1100, 'bandpass', 0, b); },
      bLand: function (pos) { var b = shotBus(pos, 'bfly'); if (!b) return; noise(0.2, 0.09, 600, 120, 'lowpass', 0, b); tone('sine', 80, 40, 0.2, 0.07, 0, b); },
      talk: function (pos) { var b = shotBus(pos, 'talk'), i, f; if (!b) return; for (i = 0; i < 4 + ((Math.random() * 3) | 0); i++) { f = 520 + Math.random() * 520; tone('square', f, f * (0.9 + Math.random() * 0.25), 0.045, 0.01, i * 0.065, b); } },
      drone: function (pos) {
        var b = shotBus(pos, 'drone');
        if (!b) return;
        tone('sawtooth', 118, 104, 0.8, 0.05, 0, b); tone('square', 59, 52, 0.8, 0.03, 0, b); noise(0.8, 0.04, 1400, 900, 'bandpass', 0, b);
      },
      glitch: function (dur, pow, pos) { glitch(dur, pow, pos); },
      repair: function (pow, pos, dur) { var b = shotBus(pos, 'glitch'); if (!b) return; glitch(dur, pow, pos, b); arp(b, dur); },
      chime: function (pos) { var b = shotBus(pos, 'chime'); if (b) arp(b, 0); }
    };
  })();
};
