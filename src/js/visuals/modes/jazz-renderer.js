import { drawMouseWave } from "../canvas-renderer.js";

const JP = {
	bg: "#0d0804",
	cream: "#f0e4c0",
	red: "#c02818",
	orange: "#de7808",
	gold: "#eea818",
	navy: "#0c0e1a",
	teal: "#167585",
	black: "#060402"
};

function jpRect(c, x, y, w, h, col, a) {
	c.save();
	c.globalAlpha = a;
	c.fillStyle = col;
	c.fillRect(x, y, w, h);
	c.restore();
}

function jpCircle(c, cx, cy, r, col, a, fill) {
	c.save();
	c.globalAlpha = a;
	if (fill) {
		c.fillStyle = col;
		c.beginPath();
		c.arc(cx, cy, r, 0, Math.PI * 2);
		c.fill();
	} else {
		c.strokeStyle = col;
		c.lineWidth = r * 0.12;
		c.beginPath();
		c.arc(cx, cy, r, 0, Math.PI * 2);
		c.stroke();
	}
	c.restore();
}

function drawVinyl(ctx, cx, cy, R2, t2, bs2) {
	jpCircle(ctx, cx, cy, R2, JP.cream, 0.88, true);
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(t2 * 0.00028 * (1 + bs2 * 0.5));
	for (let i = 0; i < 7; i++) {
		ctx.globalAlpha = 0.11 + i * 0.03;
		ctx.strokeStyle = JP.black;
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		ctx.arc(0, 0, R2 * (0.38 + i * 0.082), 0, Math.PI * 2);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
	ctx.fillStyle = JP.black;
	ctx.beginPath();
	ctx.arc(0, 0, R2 * 0.35, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = JP.orange;
	ctx.globalAlpha = 0.17 + bs2 * 0.1;
	ctx.beginPath();
	ctx.arc(0, 0, R2 * 0.28, 0, Math.PI * 2);
	ctx.fill();

	ctx.globalAlpha = 1;
	ctx.fillStyle = JP.cream;
	ctx.beginPath();
	ctx.arc(0, 0, R2 * 0.045, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

function drawSax(ctx, cx, cy, scale, t2, bs2) {
	const s = scale;
	ctx.save();
	ctx.translate(cx, cy);

	ctx.globalAlpha = 0.82;
	ctx.strokeStyle = JP.gold;
	ctx.lineWidth = s * 0.08;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(0, -s * 0.5);
	ctx.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.4, -s * 0.1, s * 0.25, s * 0.1);
	ctx.bezierCurveTo(s * 0.1, s * 0.3, -s * 0.1, s * 0.4, -s * 0.15, s * 0.55);
	ctx.stroke();

	ctx.restore();
}

export function drawJazz(bgX, fxX, tpX, W, H, t, bs, exhaleVal, mouse) {
	const { rmx, rmy, mvx, mvy, dragEnergy, clickImpulse, clickRipples } = mouse;

	bgX.fillStyle = JP.bg;
	bgX.fillRect(0, 0, W, H);

	const blockShift = dragEnergy * W * 0.015;
	jpRect(bgX, W * 0.44 - blockShift, 0, W * 0.56 + blockShift, H * 0.6, JP.red, 0.88);
	jpRect(bgX, 0, H * 0.55, W * 0.62, H * 0.45, JP.navy, 0.92);
	jpRect(bgX, W * 0.62, H * 0.72, W * 0.38, H * 0.28, JP.teal, 0.44);

	const sp = bgX.createRadialGradient(W * rmx, H * 0.04, 0, W * rmx, H * 0.07, W * (0.58 + dragEnergy * 0.1));
	sp.addColorStop(0, `rgba(238,162,24,${0.09 + bs * 0.16 + dragEnergy * 0.04})`);
	sp.addColorStop(0.42, `rgba(175,88,12,${0.04 + bs * 0.07})`);
	sp.addColorStop(1, "transparent");
	bgX.fillStyle = sp;
	bgX.fillRect(0, 0, W, H);

	clickRipples.forEach(r => {
		const g2 = bgX.createRadialGradient(r.x * W, r.y * H, 0, r.x * W, r.y * H, W * 0.18 * r.strength);
		g2.addColorStop(0, `rgba(238,162,24,${r.strength * 0.08 * Math.exp(-r.t * 1.3)})`);
		g2.addColorStop(1, "transparent");
		bgX.fillStyle = g2;
		bgX.fillRect(0, 0, W, H);
	});

	fxX.clearRect(0, 0, W, H);
	tpX.clearRect(0, 0, W, H);

	const vR = Math.min(W, H) * 0.26 * (1 + bs * 0.015 + clickImpulse * 0.02);
	const vOx = dragEnergy * W * 0.008;
	const vOy = dragEnergy * H * 0.005;
	drawVinyl(bgX, W * 0.22 + vOx, H * 0.44 + vOy, vR, t, bs);

	drawSax(fxX, W * 0.68 + (rmx - 0.5) * W * 0.02, H * 0.28 + (rmy - 0.5) * H * 0.02, Math.min(W, H) * 0.27, t, bs);

	// Piano keys
	const pkY = H * 0.78, pkH = H * 0.2, pkW = W * 0.72, wkCount = 14, kww = pkW / wkCount;
	for (let i = 0; i < wkCount; i++) {
		const kx = i * kww;
		const pulse = 0.92 + Math.sin(t * 0.003 + i * 0.4) * bs * 0.06 + clickImpulse * 0.04;
		tpX.save();
		tpX.globalAlpha = pulse;
		tpX.fillStyle = i % 2 === 0 ? JP.cream : "#e3d7b0";
		tpX.fillRect(kx + 1, pkY, kww - 2, pkH);
		tpX.restore();
	}

	// Vibrating strings
	for (let i = 0; i < 6; i++) {
		const sx = W * (0.56 + i * 0.042);
		const wobble = Math.sin(t * 0.002 * (1 + i * 0.1) + i * 0.8) * (3 + bs * 17) * (1 + (rmx - 0.5) * 1.8 + dragEnergy * 0.8) + mvx * 0.5;

		const grad = fxX.createLinearGradient(0, 0, 0, H);
		grad.addColorStop(0, "rgba(238,172,24,0)");
		grad.addColorStop(0.1, `rgba(238,172,24,${0.44 + bs * 0.32})`);
		grad.addColorStop(0.9, `rgba(238,172,24,${0.38 + bs * 0.26})`);
		grad.addColorStop(1, "rgba(238,172,24,0)");

		fxX.beginPath();
		for (let y2 = 0; y2 <= H; y2 += 3) {
			const xo = wobble * Math.sin((y2 / H) * Math.PI * 3 + t * 0.0015 + i) + (rmx - 0.5) * 8 * Math.sin((y2 / H) * Math.PI * 2 + i);
			y2 === 0 ? fxX.moveTo(sx + xo, 0) : fxX.lineTo(sx + xo, y2);
		}
		fxX.strokeStyle = grad;
		fxX.lineWidth = 0.8 + (6 - i) * 0.18;
		fxX.stroke();
	}

	drawMouseWave(tpX, W, H, t, [238, 162, 24], 0.1, bs, mouse);
}
