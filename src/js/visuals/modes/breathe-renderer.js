import { wv, drawMouseWave } from "../canvas-renderer.js";

export function drawBreathe(bgX, fxX, tpX, W, H, t, bs, exhaleVal, mouse) {
	const { rmx, rmy, mvx, mvy, dragEnergy, clickImpulse, clickRipples } = mouse;

	bgX.fillStyle = "#0e0904";
	bgX.fillRect(0, 0, W, H);

	const gr = bgX.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.72);
	gr.addColorStop(0, `rgba(232,96,38,${0.08 + bs * 0.25})`);
	gr.addColorStop(0.42, `rgba(135,48,8,${0.04 + bs * 0.12})`);
	gr.addColorStop(1, "transparent");
	bgX.fillStyle = gr;
	bgX.fillRect(0, 0, W, H);

	// Mouse glow
	const mGlowX = W * (rmx + mvx * 0.02);
	const mGlowY = H * (rmy + mvy * 0.02);
	const gr2 = bgX.createRadialGradient(mGlowX, mGlowY, 0, mGlowX, mGlowY, W * (0.45 + dragEnergy * 0.18));
	gr2.addColorStop(0, `rgba(210,72,18,${0.06 + bs * 0.12 + dragEnergy * 0.08})`);
	gr2.addColorStop(0.35, `rgba(150,45,10,${0.03 + bs * 0.06})`);
	gr2.addColorStop(1, "transparent");
	bgX.fillStyle = gr2;
	bgX.fillRect(0, 0, W, H);

	// Click impulse glow burst
	if (clickImpulse > 0.05) {
		clickRipples.forEach(r => {
			const g2 = bgX.createRadialGradient(r.x * W, r.y * H, 0, r.x * W, r.y * H, W * 0.18 * r.strength);
			g2.addColorStop(0, `rgba(232,96,38,${r.strength * 0.08 * Math.exp(-r.t * 1.5)})`);
			g2.addColorStop(1, "transparent");
			bgX.fillStyle = g2;
			bgX.fillRect(0, 0, W, H);
		});
	}

	[
		[0.82, 115, 0.78, 0.000082, 20, 65, 10, 0.56],
		[0.76, 95, 1.02, 0.000115, 24, 68, 13, 0.47],
		[0.7, 76, 1.28, 0.000152, 21, 62, 16, 0.39],
		[0.64, 60, 1.58, 0.000192, 27, 60, 19, 0.32],
		[0.58, 48, 1.98, 0.000238, 19, 56, 22, 0.26],
		[0.53, 38, 2.48, 0.000285, 23, 52, 25, 0.2],
		[0.48, 28, 3.2, 0.000338, 20, 49, 28, 0.15],
		[0.44, 20, 4.1, 0.000398, 22, 45, 31, 0.11],
		[0.4, 13, 5.3, 0.000468, 18, 41, 34, 0.08]
	].forEach(([yc, a, fm, sp, hue, sat, lit, op], i) => {
		wv(bgX, W, H, t, yc, a * (0.62 + 0.38 * bs), fm, sp, i, exhaleVal, 0.7, mouse);
		bgX.lineTo(W, H);
		bgX.closePath();
		bgX.fillStyle = `hsla(${hue},${sat}%,${lit + bs * 15 + exhaleVal * 8}%,${op + bs * 0.1})`;
		bgX.fill();
	});

	fxX.clearRect(0, 0, W, H);
	tpX.clearRect(0, 0, W, H);

	const mxBias = rmx - 0.5;
	const myBias = rmy - 0.5;

	[
		[0.65, 0.062, 1.28, 0.000048, 0.2, 1.0],
		[0.55, 0.04, 2.0, 0.000065, 0.15, 0.7],
		[0.72, 0.048, 0.98, 0.000036, 0.13, 0.6],
		[0.48, 0.026, 2.7, 0.000082, 0.11, 0.5],
		[0.6, 0.068, 0.8, 0.000033, 0.16, 0.9],
		[0.78, 0.036, 1.5, 0.000043, 0.11, 0.55]
	].forEach(([yc, a, fm, sp, op, w], li) => {
		const mouseYShift = myBias * H * 0.18 * (1 - li * 0.08);
		const yB = H * yc + mouseYShift;
		const mxAmpBoost = 1 + Math.abs(mxBias) * 1.8 + dragEnergy * 1.2 + Math.abs(myBias) * 0.6;
		const amp = H * a * (0.52 + 0.48 * bs) * mxAmpBoost;
		const ph = t * sp;
		const fmMod = fm * (1 + mxBias * 0.5 + mvx * 0.04);

		fxX.beginPath();
		for (let x = 0; x <= W; x += 3) {
			const nx = x / W;
			let y = yB +
				Math.sin(nx * Math.PI * 2 * fmMod + ph * 6 + mxBias * nx * 3) * amp +
				Math.sin(nx * Math.PI * 4 * fmMod * 0.6 + ph * 3.8 + myBias * 2) * amp * 0.35 +
				mxBias * amp * 0.5 * Math.sin(nx * Math.PI * 1.5 + li) +
				mvx * amp * 0.06 * Math.sin(nx * Math.PI * 2.5 + ph * 2) +
				mvy * amp * 0.04 * Math.cos(nx * Math.PI * 2 + li);

			if (exhaleVal > 0.04) {
				y += Math.sin(nx * Math.PI * 9 * fmMod + ph * 15) * amp * exhaleVal * 0.4;
			}

			for (const r of clickRipples) {
				const dx = nx - r.x, age = r.t, wf = age * 0.55, sp2 = 0.1 + age * 0.15;
				y += r.strength * amp * 0.28 *
					Math.exp(-Math.pow(Math.abs(dx) - wf, 2) / (sp2 * sp2)) *
					Math.exp(-age * 1.0) *
					Math.sin((Math.abs(dx) - wf) * 20);
			}

			x === 0 ? fxX.moveTo(0, y) : fxX.lineTo(x, y);
		}

		const distToMouse = Math.abs(rmy - yc);
		const proximityBoost = Math.exp(-distToMouse * 3) * 0.4;
		fxX.strokeStyle = `rgba(245,232,212,${(op + proximityBoost) * (0.45 + 0.55 * bs)})`;
		fxX.lineWidth = w * (1 + proximityBoost * 1.5);
		fxX.stroke();
	});

	drawMouseWave(tpX, W, H, t, [232, 96, 38], 0.12, bs, mouse);
}
