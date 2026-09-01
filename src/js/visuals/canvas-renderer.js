import { state } from "../state.js";
import { T } from "../themes.js";
import { drawBreathe } from "./modes/breathe-renderer.js";
import { drawMeditate } from "./modes/meditate-renderer.js";
import { drawAnxiety } from "./modes/anxiety-renderer.js";
import { drawNature } from "./modes/nature-renderer.js";
import { drawClassical } from "./modes/classical-renderer.js";
import { drawJazz } from "./modes/jazz-renderer.js";

let bgC, fxC, tpC;
let bgX, fxX, tpX;
let W = 0, H = 0;

export function RNG(seed) {
	let s = seed;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

export function initCanvas() {
	bgC = document.getElementById("c-bg");
	fxC = document.getElementById("c-fx");
	tpC = document.getElementById("c-top");

	bgX = bgC.getContext("2d");
	fxX = fxC.getContext("2d");
	tpX = tpC.getContext("2d");

	function resize() {
		W = bgC.width = fxC.width = tpC.width = window.innerWidth;
		H = bgC.height = fxC.height = tpC.height = window.innerHeight;
	}

	window.addEventListener("resize", resize);
	resize();
	initMouseEvents();
}

function initMouseEvents() {
	const dotEl = document.getElementById("dot");

	document.addEventListener("mousedown", (e) => {
		state.isDragging = true;
		state.clickImpulse = 1.0;
		state.clickRipples.push({
			x: e.clientX / W,
			y: e.clientY / H,
			t: 0,
			strength: 1.0
		});
		if (state.clickRipples.length > 6) state.clickRipples.shift();
	});

	document.addEventListener("mouseup", () => {
		state.isDragging = false;
	});

	document.addEventListener("mousemove", (e) => {
		state.csx = e.clientX;
		state.csy = e.clientY;
		state.pmx = state.mx;
		state.pmy = state.my;
		state.mx = e.clientX / W;
		state.my = e.clientY / H;
		state.mvx = (state.mx - state.pmx) * 60;
		state.mvy = (state.my - state.pmy) * 60;

		if (state.isDragging) {
			state.dragEnergy = Math.min(
				state.dragEnergy + Math.sqrt(state.mvx * state.mvx + state.mvy * state.mvy) * 0.04,
				1.5
			);
			if (Math.random() < 0.08) {
				state.clickRipples.push({
					x: state.mx,
					y: state.my,
					t: 0,
					strength: 0.4 + state.dragEnergy * 0.3
				});
				if (state.clickRipples.length > 8) state.clickRipples.shift();
			}
		}

		if (dotEl) {
			dotEl.style.left = e.clientX + "px";
			dotEl.style.top = e.clientY + "px";
		}
	});

	document.addEventListener("touchstart", (e) => {
		state.isDragging = true;
		const t2 = e.touches[0];
		state.clickImpulse = 1.0;
		state.clickRipples.push({
			x: t2.clientX / W,
			y: t2.clientY / H,
			t: 0,
			strength: 1.0
		});
		if (state.clickRipples.length > 6) state.clickRipples.shift();
	}, { passive: true });

	document.addEventListener("touchend", () => {
		state.isDragging = false;
	});

	document.addEventListener("touchmove", (e) => {
		const t2 = e.touches[0];
		state.mx = t2.clientX / W;
		state.my = t2.clientY / H;
	}, { passive: true });

	const ringEl = document.getElementById("ring");
	(function updateCursor() {
		state.crx += (state.csx - state.crx) * 0.11;
		state.cry += (state.csy - state.cry) * 0.11;
		state.rmx += (state.mx - state.rmx) * 0.04;
		state.rmy += (state.my - state.rmy) * 0.04;

		state.clickImpulse *= 0.94;
		state.dragEnergy *= 0.97;

		for (let i = state.clickRipples.length - 1; i >= 0; i--) {
			state.clickRipples[i].t += 0.016;
			if (state.clickRipples[i].t > 2.5) state.clickRipples.splice(i, 1);
		}

		state.mvx *= 0.88;
		state.mvy *= 0.88;

		if (ringEl) {
			ringEl.style.left = state.crx + "px";
			ringEl.style.top = state.cry + "px";
		}
		requestAnimationFrame(updateCursor);
	})();
}

export function spawnRipple(x, y) {
	const el = document.createElement("div");
	el.className = "ripple";
	const th = T[state.mode],
		[ar, ag, ab] = th.accent,
		sz = 68 + state.bs * 52;
	el.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;border:1.5px solid rgba(${ar},${ag},${ab},.55)`;
	document.body.appendChild(el);
	setTimeout(() => el.remove(), 880);
}

export function wv(ctx, width, height, t, yc, amp, fm, sp, ph2, chaos, mouseAmp, mouse) {
	const { rmx, rmy, dragEnergy, clickRipples } = mouse;
	const ma = mouseAmp || 0;
	const yB = height * yc + height * (rmy - 0.5) * ma * 0.06;

	ctx.beginPath();
	for (let x = 0; x <= width; x += 3) {
		const nx = x / width;
		const ph = t * sp;
		const mouseWarp = (rmx - 0.5) * ma * amp * 0.5 * Math.sin(nx * Math.PI * 2 + 0.5);
		const dragWarp = dragEnergy * amp * 0.3 * Math.sin(nx * Math.PI * 3 + t * 0.003 + (rmx - 0.5) * 4);

		let rippleWarp = 0;
		for (const r of clickRipples) {
			const dx = nx - r.x, age = r.t;
			const wavefront = age * 0.6;
			const dist = Math.abs(dx);
			const spread = 0.12 + age * 0.2;
			rippleWarp += r.strength * amp * 0.22 *
				Math.exp(-Math.pow(dist - wavefront, 2) / (spread * spread)) *
				Math.exp(-age * 0.9) *
				Math.sin((dist - wavefront) * 18);
		}

		let y = yB + mouseWarp + dragWarp + rippleWarp +
			Math.sin(nx * Math.PI * 2 * fm + ph * 7) * amp * (1 + ma * 0.4) +
			Math.sin(nx * Math.PI * 3 * fm * 0.73 + ph * 5.2 + ph2) * amp * 0.4;

		if (chaos > 0.04) {
			y += Math.sin(nx * Math.PI * 8 * fm + ph * 16 + ph2) * amp * chaos * 0.55;
			y += Math.sin(nx * Math.PI * 14 * fm + ph * 24) * amp * chaos * 0.22;
		}

		x === 0 ? ctx.moveTo(0, y) : ctx.lineTo(x, y);
	}
}

export function drawMouseWave(ctx, width, height, t, [ar, ag, ab], alpha, bs, mouse) {
	const { rmy, rmx, dragEnergy, mvx, mvy, clickImpulse, clickRipples } = mouse;
	const yBase = height * (0.3 + rmy * 0.4);
	const wAmp = height * (0.03 + bs * 0.05) * (1 + rmx * 0.8 + Math.abs(rmy - 0.5) * 0.6) * (1 + dragEnergy * 0.8);
	const velSkew = mvx * 0.003;

	for (let layer = 0; layer < 4; layer++) {
		const phOff = layer * 1.1;
		ctx.beginPath();
		for (let x = 0; x <= width; x += 3) {
			const nx = x / width;
			let y = yBase +
				Math.sin(nx * Math.PI * 2 * (1 + rmx * 0.8) + t * 0.000045 * 7 + phOff + velSkew * nx) * wAmp +
				Math.sin(nx * Math.PI * 3.7 + t * 0.000028 * 5 + phOff) * wAmp * 0.38 +
				(rmx - 0.5) * height * 0.06 * Math.sin(nx * Math.PI + layer) +
				mvx * wAmp * 0.08 * Math.sin(nx * Math.PI * 3 + phOff) +
				mvy * wAmp * 0.05 * Math.cos(nx * Math.PI * 2 + layer);

			for (const r of clickRipples) {
				const dx = nx - r.x, age = r.t, wavefront = age * 0.55, spread = 0.1 + age * 0.15;
				y += r.strength * height * 0.016 *
					Math.exp(-Math.pow(Math.abs(dx) - wavefront, 2) / (spread * spread)) *
					Math.exp(-age * 1.0) *
					Math.sin((Math.abs(dx) - wavefront) * 22);
			}

			x === 0 ? ctx.moveTo(0, y) : ctx.lineTo(x, y);
		}
		ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(alpha - 0.01 * layer) * (0.45 + bs * 0.65 + clickImpulse * 0.35)})`;
		ctx.lineWidth = 1.4 - layer * 0.25;
		ctx.stroke();
	}
}

export function animateText(ts) {
	const a = state.textAnim;
	const mox = (state.rmx - 0.5) * 6;
	const moy = (state.rmy - 0.5) * 4;
	const cj = state.clickImpulse * 3;
	const dragBias = state.mvx * 0.12;

	state.charData.forEach((c) => {
		let tx = 0, ty = 0, rot = 0, sc = 1, op = 1;
		const bf = state.isActive ? 1 + state.bs * 0.85 : 0.52;

		if (a === 0) {
			ty = Math.sin(ts * c.freq + c.line * 1.6 + c.idx * 0.35) * c.amp * bf + moy * 0.3 + Math.sin(cj * c.idx * 0.3) * cj * 0.4;
			tx = Math.cos(ts * c.freq * 0.55 + c.idx * 0.2) * c.amp * 0.2 * bf + mox * 0.2 + dragBias * c.amp * 0.08;
		} else if (a === 1) {
			const bv = Math.abs(Math.sin(ts * 0.0008 + c.line * 1.1 + c.idx * 0.28));
			ty = -bv * (state.isActive ? c.amp * (1 + state.bs) : c.amp * 0.45) + moy * 0.25 - cj * 0.25 * Math.sin(c.idx * 0.5);
			sc = 1 + bv * (state.isActive ? 0.09 : 0.028) + state.clickImpulse * 0.015;
		} else if (a === 2) {
			ty = Math.sin(ts * 0.00112 + c.idx * 0.5 + c.line * 2) * c.amp * 0.7 * (state.isActive ? 1 + state.bs * 0.6 : 0.45) + moy * 0.3 + cj * 0.3 * Math.cos(c.idx * 0.4);
			rot = Math.sin(ts * 0.00086 + c.idx * 0.4) * (state.isActive ? 2 + state.bs * 3 : 1) + state.dragEnergy * Math.sin(c.idx * 0.6) * 2;
			tx = mox * 0.25 + dragBias * c.amp * 0.06;
		} else if (a === 3) {
			const bv = state.isActive ? state.bs : (0.5 + 0.5 * Math.sin(ts * 0.00066)) * 0.36;
			sc = 1 + Math.sin(ts * 0.00056 + c.line * 1.2 + c.idx * 0.15) * (state.isActive ? 0.062 + bv * 0.1 : 0.026) + state.clickImpulse * 0.02;
			ty = Math.sin(ts * 0.0004 + c.idx * 0.3 + c.line) * c.amp * 0.5 * (state.isActive ? 1 + bv : 0.45) + moy * 0.22 + cj * 0.2;
			tx = mox * 0.2 + dragBias * c.amp * 0.05;
		} else if (a === 4) {
			if (Math.sin(ts * 0.00026 + c.line * 3.8 + c.idx * 1.1) > 0.91) {
				tx = (Math.random() - 0.5) * (state.isActive ? 8 + state.bs * 8 : 4) + mox * 0.3 + state.dragEnergy * 4;
				op = 0.7 + Math.random() * 0.3;
			}
			ty = Math.sin(ts * c.freq * 0.5 + c.line * 1.9) * c.amp * 0.4 * (state.isActive ? 0.7 : 0.36) + moy * 0.28 + cj * 0.22;
		} else {
			const t2 = ts * 0.00046 + c.line * 0.8 + c.idx * 0.12;
			tx = Math.cos(t2) * c.amp * 0.6 * (state.isActive ? 1 + state.bs * 0.5 : 0.36) + mox * 0.35 + dragBias * c.amp * 0.1;
			ty = Math.sin(t2 * 1.3) * c.amp * 0.5 * (state.isActive ? 1 + state.bs * 0.5 : 0.36) + moy * 0.3 + cj * 0.28;
			rot = Math.sin(t2 * 0.7) * (state.isActive ? 3 + state.bs * 4 : 1.5) + state.dragEnergy * 1.5 * Math.sin(c.idx * 0.4);
		}

		c.el.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
		if (a === 4) c.el.style.opacity = op;
	});

	state.cueChars.forEach((c) => {
		c.el.style.transform = `translateY(${(
			Math.sin(ts * c.freq + c.phase) * (state.isActive ? 3 + state.bs * 4 : 1.8) +
			state.clickImpulse * 1.2 * Math.sin(c.i * 0.4)
		).toFixed(2)}px)`;
	});

	const tagEl = document.getElementById("tagline-text");
	if (tagEl) {
		tagEl.style.transform = `translateY(${(
			Math.sin(ts * 0.0004 + 5) * (state.isActive ? 2.5 + state.bs * 2 : 1.2) + state.dragEnergy * 1.5
		).toFixed(2)}px)`;
	}
}

export function renderFrame(ts) {
	bgX.clearRect(0, 0, W, H);

	const mouseState = {
		mx: state.mx,
		my: state.my,
		rmx: state.rmx,
		rmy: state.rmy,
		mvx: state.mvx,
		mvy: state.mvy,
		dragEnergy: state.dragEnergy,
		clickImpulse: state.clickImpulse,
		clickRipples: state.clickRipples
	};

	if (state.mode === "breathe") {
		drawBreathe(bgX, fxX, tpX, W, H, ts, state.bs, state.exhaleVal, mouseState);
	} else if (state.mode === "meditate") {
		drawMeditate(bgX, fxX, tpX, W, H, ts, state.bs, state.exhaleVal, mouseState);
	} else if (state.mode === "anxiety") {
		drawAnxiety(bgX, fxX, tpX, W, H, ts, state.bs, state.exhaleVal, mouseState);
	} else if (state.mode === "nature") {
		drawNature(bgX, fxX, tpX, W, H, ts, state.bs, state.exhaleVal, mouseState, state.isActive);
	} else if (state.mode === "classical") {
		drawClassical(bgX, fxX, tpX, W, H, ts, state.bs, state.exhaleVal, mouseState, state.isActive);
	} else if (state.mode === "jazz") {
		drawJazz(bgX, fxX, tpX, W, H, ts, state.bs, state.exhaleVal, mouseState);
	}

	animateText(ts);
}
