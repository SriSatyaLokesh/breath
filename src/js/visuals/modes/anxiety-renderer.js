import { wv, drawMouseWave } from "../canvas-renderer.js";

export function drawAnxiety(bgX, fxX, tpX, W, H, t, bs, exhaleVal, mouse) {
	const { rmx, rmy, mvx, mvy, dragEnergy, clickRipples } = mouse;

	const bgg = bgX.createLinearGradient(0, 0, 0, H);
	bgg.addColorStop(0, "#010702");
	bgg.addColorStop(0.6, "#020c04");
	bgg.addColorStop(1, "#010802");
	bgX.fillStyle = bgg;
	bgX.fillRect(0, 0, W, H);

	const mg = bgX.createRadialGradient(W * rmx, H * 0.08, 0, W * rmx, H * 0.08, W * (0.58 + dragEnergy * 0.1));
	mg.addColorStop(0, `rgba(60,185,98,${0.04 + bs * 0.15 + dragEnergy * 0.04})`);
	mg.addColorStop(0.42, `rgba(22,65,30,${0.03 + bs * 0.08})`);
	mg.addColorStop(1, "transparent");
	bgX.fillStyle = mg;
	bgX.fillRect(0, 0, W, H);

	clickRipples.forEach(r => {
		const g2 = bgX.createRadialGradient(r.x * W, r.y * H, 0, r.x * W, r.y * H, W * 0.16 * r.strength);
		g2.addColorStop(0, `rgba(60,185,98,${r.strength * 0.05 * Math.exp(-r.t * 1.3)})`);
		g2.addColorStop(1, "transparent");
		bgX.fillStyle = g2;
		bgX.fillRect(0, 0, W, H);
	});

	[
		[0.88, 82, 0.58, 0.000058, 140, 38, 5, 0.68],
		[0.82, 96, 0.76, 0.000075, 143, 42, 7, 0.58],
		[0.76, 80, 0.96, 0.000092, 146, 40, 9, 0.5],
		[0.69, 64, 1.18, 0.000112, 142, 38, 12, 0.42],
		[0.62, 52, 1.48, 0.000138, 145, 36, 15, 0.34],
		[0.56, 42, 1.88, 0.000165, 141, 34, 18, 0.27],
		[0.5, 32, 2.38, 0.000198, 144, 32, 21, 0.21],
		[0.45, 23, 3.08, 0.000238, 142, 30, 24, 0.16],
		[0.41, 16, 3.98, 0.000282, 143, 28, 27, 0.12]
	].forEach(([yc, a, fm, sp, hue, sat, lit, op], i) => {
		wv(bgX, W, H, t, yc, a * (0.62 + 0.38 * bs), fm, sp, i, exhaleVal, 0.65, mouse);
		bgX.lineTo(W, H);
		bgX.closePath();
		bgX.fillStyle = `hsla(${hue},${sat}%,${lit + bs * 13 + exhaleVal * 5}%,${op + bs * 0.08})`;
		bgX.fill();
	});

	// Swaying forest foliage silhouettes
	for (let i = 0; i < 18; i++) {
		const tx = ((((Math.sin(i * 37.4) * 43758) % 1) + 1) % 1) * W;
		const th2 = H * (0.19 + ((((Math.sin(i * 13.7) * 43758) % 1) + 1) % 1) * 0.29);
		const tw2 = 16 + ((((Math.sin(i * 29.1) * 43758) % 1) + 1) % 1) * 32;
		const sway = Math.sin(((t * 0.00028 * (((Math.sin(i * 11.1) * 43758) % 1) + 1)) % 1) * 0.8 + i) * 8 * (1 + exhaleVal * 2.5) + (rmx - 0.5) * 4;

		bgX.beginPath();
		bgX.moveTo(tx + sway, H);
		bgX.lineTo(tx - tw2 / 2 + sway, H - th2 * 0.42);
		bgX.lineTo(tx + sway, H - th2);
		bgX.lineTo(tx + tw2 / 2 + sway, H - th2 * 0.42);
		bgX.closePath();
		bgX.fillStyle = "rgba(0,8,2,.42)";
		bgX.fill();
	}

	fxX.clearRect(0, 0, W, H);
	tpX.clearRect(0, 0, W, H);

	const mxB3 = rmx - 0.5;
	const myB3 = rmy - 0.5;

	[
		[0.6, 0.052, 1.08, 0.00004, 0.17, 0.9],
		[0.5, 0.036, 1.78, 0.000055, 0.13, 0.6],
		[0.68, 0.04, 0.82, 0.00003, 0.14, 0.7],
		[0.44, 0.023, 2.38, 0.00007, 0.1, 0.5],
		[0.54, 0.058, 0.68, 0.000026, 0.16, 0.85]
	].forEach(([yc, a, fm, sp, op, w], li) => {
		const mouseYShift = myB3 * H * 0.16 * (1 - li * 0.08);
		const yB = H * yc + mouseYShift;
		const mxAmpBoost = 1 + Math.abs(mxB3) * 1.9 + dragEnergy * 1.2 + Math.abs(myB3) * 0.65;
		const amp = H * a * (0.52 + 0.48 * bs) * mxAmpBoost;
		const fmMod = fm * (1 + mxB3 * 0.5 + mvx * 0.04);
		const ph = t * sp;

		fxX.beginPath();
		for (let x = 0; x <= W; x += 3) {
			const nx = x / W;
			let y = yB +
				Math.sin(nx * Math.PI * 2 * fmMod + ph * 5.5 + mxB3 * nx * 3) * amp +
				Math.sin(nx * Math.PI * 3 * fmMod * 0.65 + ph * 3.5 + myB3 * 1.5) * amp * 0.38 +
				mxB3 * amp * 0.55 * Math.sin(nx * Math.PI * 2.2 + 1 + li) +
				mvx * amp * 0.06 * Math.sin(nx * Math.PI * 2.8 + ph) +
				mvy * amp * 0.04 * Math.cos(nx * Math.PI * 1.8 + li);

			if (exhaleVal > 0.04) {
				y += Math.sin(nx * Math.PI * 8 * fmMod + ph * 14) * amp * exhaleVal * 0.45;
			}

			for (const r of clickRipples) {
				const dx = nx - r.x, age = r.t, wf = age * 0.55, sp2 = 0.1 + age * 0.15;
				y += r.strength * amp * 0.26 *
					Math.exp(-Math.pow(Math.abs(dx) - wf, 2) / (sp2 * sp2)) *
					Math.exp(-age * 1.0) *
					Math.sin((Math.abs(dx) - wf) * 20);
			}
			x === 0 ? fxX.moveTo(0, y) : fxX.lineTo(x, y);
		}

		const distToMouse = Math.abs(rmy - yc);
		const proximityBoost = Math.exp(-distToMouse * 3.2) * 0.45;
		fxX.strokeStyle = `rgba(190,228,202,${(op + proximityBoost) * (0.48 + 0.52 * bs)})`;
		fxX.lineWidth = w * (1 + proximityBoost * 1.6);
		fxX.stroke();
	});

	// Fireflies
	for (let i = 0; i < 32; i++) {
		const fx = ((((Math.sin(i * 23.7) * 43758) % 1) + 1) % 1) * W;
		const fy = ((((Math.sin(i * 17.1) * 43758) % 1) + 1) % 1) * (H * 0.65) + H * 0.07;
		const fl = 0.28 + 0.72 * Math.abs(Math.sin(((t * 0.0011 * (((Math.sin(i * 9) * 43758) % 1) + 1)) % 1) * 2 + i * 1.85));
		const fa = (0.045 + bs * 0.1) * fl * (1 - exhaleVal * 0.38);

		if (fa < 0.006) continue;

		const gg = fxX.createRadialGradient(fx, fy, 0, fx, fy, 10);
		gg.addColorStop(0, `rgba(165,242,145,${fa * 0.8})`);
		gg.addColorStop(1, "transparent");
		fxX.fillStyle = gg;
		fxX.beginPath();
		fxX.arc(fx, fy, 10, 0, Math.PI * 2);
		fxX.fill();

		fxX.beginPath();
		fxX.arc(fx, fy, 1.3, 0, Math.PI * 2);
		fxX.fillStyle = `rgba(195,248,175,${fa})`;
		fxX.fill();
	}

	drawMouseWave(tpX, W, H, t, [60, 185, 98], 0.07, bs, mouse);
}
