import { wv, drawMouseWave } from "../canvas-renderer.js";

export function drawMeditate(bgX, fxX, tpX, W, H, t, bs, exhaleVal, mouse) {
	const { rmx, rmy, mvx, mvy, dragEnergy, clickRipples } = mouse;

	const bgg = bgX.createLinearGradient(0, 0, 0, H);
	bgg.addColorStop(0, "#03020c");
	bgg.addColorStop(0.5, "#050412");
	bgg.addColorStop(1, "#02020e");
	bgX.fillStyle = bgg;
	bgX.fillRect(0, 0, W, H);

	const aox = (rmx - 0.5) * W * 0.12 + mvx * W * 0.018;
	const aoy = (rmy - 0.5) * H * 0.09 + mvy * H * 0.015;

	const ng = bgX.createRadialGradient(
		W * 0.5 + aox, H * 0.46 + aoy, 0,
		W * 0.5 + aox, H * 0.46 + aoy, W * (0.9 + dragEnergy * 0.15)
	);
	ng.addColorStop(0, `rgba(148,105,255,${0.08 + bs * 0.26 + dragEnergy * 0.06})`);
	ng.addColorStop(0.38, `rgba(72,42,175,${0.05 + bs * 0.14})`);
	ng.addColorStop(0.72, `rgba(25,12,55,${0.04 + bs * 0.08})`);
	ng.addColorStop(1, "transparent");
	bgX.fillStyle = ng;
	bgX.fillRect(0, 0, W, H);

	const ng2 = bgX.createRadialGradient(W * 0.2, H * 0.38, 0, W * 0.2, H * 0.38, W * 0.46);
	ng2.addColorStop(0, `rgba(68,32,155,${0.05 + bs * 0.14})`);
	ng2.addColorStop(1, "transparent");
	bgX.fillStyle = ng2;
	bgX.fillRect(0, 0, W, H);

	const ng3 = bgX.createRadialGradient(W * 0.82, H * 0.35, 0, W * 0.82, H * 0.35, W * 0.38);
	ng3.addColorStop(0, `rgba(90,52,200,${0.04 + bs * 0.11})`);
	ng3.addColorStop(1, "transparent");
	bgX.fillStyle = ng3;
	bgX.fillRect(0, 0, W, H);

	clickRipples.forEach(r => {
		const g2 = bgX.createRadialGradient(r.x * W, r.y * H, 0, r.x * W, r.y * H, W * 0.2 * r.strength);
		g2.addColorStop(0, `rgba(148,105,255,${r.strength * 0.06 * Math.exp(-r.t * 1.2)})`);
		g2.addColorStop(1, "transparent");
		bgX.fillStyle = g2;
		bgX.fillRect(0, 0, W, H);
	});

	[
		[0.74, 52, 0.52, 0.000038, 268, 68, 14, 0.44],
		[0.66, 40, 0.7, 0.000055, 252, 72, 17, 0.37],
		[0.59, 32, 0.92, 0.000072, 278, 62, 20, 0.31],
		[0.52, 25, 1.18, 0.000092, 260, 70, 23, 0.25],
		[0.46, 19, 1.52, 0.000115, 245, 58, 26, 0.19],
		[0.41, 13, 1.98, 0.000145, 270, 54, 29, 0.14]
	].forEach(([yc, a, fm, sp, hue, sat, lit, op], i) => {
		wv(bgX, W, H, t, yc, a * (0.58 + 0.42 * bs), fm, sp, i, exhaleVal, 0.6, mouse);
		bgX.lineTo(W, H);
		bgX.closePath();
		bgX.fillStyle = `hsla(${hue},${sat}%,${lit + bs * 17 + exhaleVal * 6}%,${op + bs * 0.11})`;
		bgX.fill();
	});

	fxX.clearRect(0, 0, W, H);
	tpX.clearRect(0, 0, W, H);

	const mxB2 = rmx - 0.5;
	const myB2 = rmy - 0.5;

	[
		[0.52, 0.033, 1.8, 0.000029, 0.18, 0.6],
		[0.43, 0.02, 2.9, 0.000043, 0.13, 0.4],
		[0.62, 0.027, 1.3, 0.000024, 0.15, 0.5],
		[0.47, 0.017, 3.5, 0.000052, 0.1, 0.4],
		[0.57, 0.038, 0.88, 0.000021, 0.17, 0.7]
	].forEach(([yc, a, fm, sp, op, w], li) => {
		const mouseYShift = myB2 * H * 0.16 * (1 - li * 0.08);
		const yB = H * yc + mouseYShift;
		const mxAmpBoost = 1 + Math.abs(mxB2) * 2.0 + dragEnergy * 1.3 + Math.abs(myB2) * 0.7;
		const amp = H * a * (0.48 + 0.52 * bs) * mxAmpBoost;
		const fmMod = fm * (1 + mxB2 * 0.55 + mvx * 0.035);
		const ph = t * sp;

		fxX.beginPath();
		for (let x = 0; x <= W; x += 3) {
			const nx = x / W;
			let y = yB +
				Math.sin(nx * Math.PI * 2 * fmMod + ph * 5 + mxB2 * nx * 3.5) * amp +
				Math.sin(nx * Math.PI * 3 * fmMod * 0.7 + ph * 3) * amp * 0.38 +
				mxB2 * amp * 0.6 * Math.sin(nx * Math.PI * 1.8 + li) +
				mvx * amp * 0.05 * Math.sin(nx * Math.PI * 2 + ph) +
				mvy * amp * 0.04 * Math.cos(nx * Math.PI * 1.5 + li);

			if (exhaleVal > 0.04) {
				y += Math.sin(nx * Math.PI * 7 * fmMod + ph * 12) * amp * exhaleVal * 0.35;
			}

			for (const r of clickRipples) {
				const dx = nx - r.x, age = r.t, wf = age * 0.55, sp2 = 0.1 + age * 0.15;
				y += r.strength * amp * 0.25 *
					Math.exp(-Math.pow(Math.abs(dx) - wf, 2) / (sp2 * sp2)) *
					Math.exp(-age * 1.0) *
					Math.sin((Math.abs(dx) - wf) * 18);
			}
			x === 0 ? fxX.moveTo(0, y) : fxX.lineTo(x, y);
		}

		const distToMouse = Math.abs(rmy - yc);
		const proximityBoost = Math.exp(-distToMouse * 3.5) * 0.5;
		fxX.strokeStyle = `rgba(220,210,255,${(op + proximityBoost) * (0.42 + 0.58 * bs)})`;
		fxX.lineWidth = w * (1 + proximityBoost * 1.8);
		fxX.stroke();
	});

	// Twinkling stars
	for (let i = 0; i < 145; i++) {
		const sx = ((((Math.sin(i * 42) * 43758.5) % 1) + 1) % 1) * W;
		const sy = ((((Math.sin(i * 42 + 1) * 43758.5) % 1) + 1) % 1) * (H * 0.72);
		const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0014 + i * 1.28));
		const sr = 0.3 + ((((Math.sin(i * 42 + 2) * 43758.5) % 1) + 1) % 1) * 0.7;

		const starX = sx + mvx * sr * 0.8;
		const starY = sy + mvy * sr * 0.5;

		fxX.beginPath();
		fxX.arc(starX, starY, sr, 0, Math.PI * 2);
		fxX.fillStyle = `rgba(220,210,255,${(0.07 + bs * 0.12) * tw})`;
		fxX.fill();

		if (tw > 0.85 && sr > 0.7) {
			const sg = fxX.createRadialGradient(starX, starY, 0, starX, starY, 5);
			sg.addColorStop(0, `rgba(200,185,255,${0.12 * tw})`);
			sg.addColorStop(1, "transparent");
			fxX.fillStyle = sg;
			fxX.beginPath();
			fxX.arc(starX, starY, 5, 0, Math.PI * 2);
			fxX.fill();
		}
	}

	drawMouseWave(tpX, W, H, t, [148, 105, 255], 0.07, bs, mouse);
}
