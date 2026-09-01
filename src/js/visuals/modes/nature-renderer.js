import { drawMouseWave, RNG } from "../canvas-renderer.js";

const LAKE_RIPPLES = [];
const RAIN_COUNT = 420;
const RAINDROPS = Array.from({ length: RAIN_COUNT }, (_, i) => {
	const r = RNG(i * 71 + 3);
	return {
		x: r() * 1.2 - 0.1,
		y: r(),
		speed: 6 + r() * 10,
		len: 9 + r() * 22,
		angle: -0.06 + r() * 0.04,
		alpha: 0.12 + r() * 0.22,
		thickness: 0.4 + r() * 0.8
	};
});
let rainY = RAINDROPS.map(d => d.y * 1.0);

const WIND_BANDS = Array.from({ length: 12 }, (_, i) => {
	const r = RNG(i * 53 + 7);
	return {
		y: r(),
		speed: 0.00018 + r() * 0.00028,
		amp: 0.018 + r() * 0.032,
		freq: 0.8 + r() * 1.8,
		phase: r() * Math.PI * 2
	};
});

const LAKE_RING_SEEDS = Array.from({ length: 22 }, (_, i) => {
	const r = RNG(i * 29 + 3);
	return {
		x: 0.15 + r() * 0.7,
		spawnInterval: 2000 + r() * 5000,
		lastSpawn: r() * 5000
	};
});

export function drawNature(bgX, fxX, tpX, W, H, t, bs, exhaleVal, mouse, isActive) {
	const { rmx, rmy, mvx, mvy, dragEnergy, clickImpulse, clickRipples } = mouse;

	fxX.clearRect(0, 0, W, H);
	tpX.clearRect(0, 0, W, H);

	// Sky gradient
	const skyGrad = bgX.createLinearGradient(0, 0, 0, H);
	const overcast = isActive ? Math.min(bs * 0.6, 0.5) : 0.15;
	skyGrad.addColorStop(0, `rgb(${Math.round(18 + overcast * 8)},${Math.round(28 + overcast * 10)},${Math.round(42 + overcast * 15)})`);
	skyGrad.addColorStop(0.35, `rgb(${Math.round(28 + overcast * 10)},${Math.round(48 + overcast * 14)},${Math.round(72 + overcast * 20)})`);
	skyGrad.addColorStop(0.62, `rgb(${Math.round(48 + overcast * 12)},${Math.round(72 + overcast * 16)},${Math.round(92 + overcast * 22)})`);
	skyGrad.addColorStop(1, `rgb(${Math.round(22 + overcast * 8)},${Math.round(38 + overcast * 10)},${Math.round(55 + overcast * 16)})`);
	bgX.fillStyle = skyGrad;
	bgX.fillRect(0, 0, W, H);

	// Mouse glow
	const skyGlow = bgX.createRadialGradient(W * rmx, H * rmy * 0.6, 0, W * rmx, H * rmy * 0.6, W * (0.3 + dragEnergy * 0.1));
	skyGlow.addColorStop(0, `rgba(105,195,215,${0.04 + bs * 0.08 + dragEnergy * 0.04})`);
	skyGlow.addColorStop(1, "transparent");
	bgX.fillStyle = skyGlow;
	bgX.fillRect(0, 0, W, H);

	// Mist layers
	for (let m = 0; m < 4; m++) {
		const my2 = 0.38 + m * 0.06;
		const mistX = (rmx - 0.5) * W * 0.03 * (m + 1) + Math.sin(t * 0.00008 * (m + 1)) * W * 0.04;
		const mist = bgX.createRadialGradient(W * 0.5 + mistX, H * my2, 0, W * 0.5 + mistX, H * my2, W * (0.55 + m * 0.1));
		mist.addColorStop(0, `rgba(155,195,215,${0.04 + m * 0.012 + bs * 0.02})`);
		mist.addColorStop(0.5, `rgba(105,155,185,${0.02 + m * 0.008})`);
		mist.addColorStop(1, "transparent");
		bgX.fillStyle = mist;
		bgX.fillRect(0, 0, W, H);
	}

	// Distant hills / shoreline
	const hillY = H * 0.48;
	bgX.beginPath();
	bgX.moveTo(0, H);
	for (let x = 0; x <= W; x += 4) {
		const nx = x / W;
		const hy = hillY + Math.sin(nx * Math.PI * 1.4 + 0.5) * H * 0.06 + Math.sin(nx * Math.PI * 3.2) * H * 0.022;
		x === 0 ? bgX.moveTo(0, hy) : bgX.lineTo(x, hy);
	}
	bgX.lineTo(W, H);
	bgX.closePath();
	bgX.fillStyle = "rgba(15,30,25,0.72)";
	bgX.fill();

	// Near hill with pine tree silhouettes
	const nearHillY = H * 0.52;
	bgX.beginPath();
	for (let x = 0; x <= W; x += 4) {
		const nx = x / W;
		const hy = nearHillY + Math.sin(nx * Math.PI * 2.1 + 1.2) * H * 0.05 + Math.sin(nx * Math.PI * 5.8) * H * 0.012;
		x === 0 ? bgX.moveTo(0, hy) : bgX.lineTo(x, hy);
	}
	bgX.lineTo(W, H);
	bgX.closePath();
	bgX.fillStyle = "rgba(8,18,12,0.88)";
	bgX.fill();

	for (let i = 0; i < 32; i++) {
		const r2 = RNG(i * 41 + 9);
		const tx2 = r2() * W;
		const nx = tx2 / W;
		const baseY = nearHillY + Math.sin(nx * Math.PI * 2.1 + 1.2) * H * 0.05 + Math.sin(nx * Math.PI * 5.8) * H * 0.012;
		const th2 = H * (0.038 + r2() * 0.045);
		const tw2 = th2 * 0.38;
		const sway = (rmx - 0.5) * tw2 * 0.4 + Math.sin(t * 0.00022 + i * 0.7) * tw2 * 0.18 * (1 + bs * 0.4);

		bgX.beginPath();
		bgX.moveTo(tx2 + sway, baseY);
		bgX.lineTo(tx2 - tw2 / 2 + sway * 0.7, baseY - th2 * 0.45);
		bgX.lineTo(tx2 + sway * 1.1, baseY - th2);
		bgX.lineTo(tx2 + tw2 / 2 - sway * 0.7, baseY - th2 * 0.45);
		bgX.closePath();
		bgX.fillStyle = "rgba(4,12,7,0.92)";
		bgX.fill();
	}

	// Lake surface
	const lakeTop = H * 0.535;
	const lakeGrad = bgX.createLinearGradient(0, lakeTop, 0, H);
	lakeGrad.addColorStop(0, "rgba(18,38,55,0.95)");
	lakeGrad.addColorStop(0.3, "rgba(12,28,44,0.98)");
	lakeGrad.addColorStop(0.7, "rgba(8,20,32,1)");
	lakeGrad.addColorStop(1, "rgba(4,14,22,1)");
	bgX.fillStyle = lakeGrad;
	bgX.fillRect(0, lakeTop, W, H - lakeTop);

	// Lake ripples animation
	LAKE_RING_SEEDS.forEach((seed) => {
		seed.lastSpawn += 16;
		if (seed.lastSpawn > seed.spawnInterval) {
			seed.lastSpawn = 0;
			LAKE_RIPPLES.push({
				x: seed.x * W,
				y: lakeTop + Math.random() * (H - lakeTop) * 0.8,
				r: 0,
				maxR: W * (0.04 + Math.random() * 0.08),
				alpha: 0.28 + bs * 0.15,
				speed: 0.8 + Math.random() * 0.6
			});
		}
	});

	for (let i = LAKE_RIPPLES.length - 1; i >= 0; i--) {
		const lr = LAKE_RIPPLES[i];
		lr.r += lr.speed;
		const progress = lr.r / lr.maxR;
		if (progress >= 1) {
			LAKE_RIPPLES.splice(i, 1);
			continue;
		}
		const a = lr.alpha * (1 - progress) * (1 - progress);
		fxX.beginPath();
		fxX.ellipse(lr.x, lr.y, lr.r, lr.r * 0.32, 0, 0, Math.PI * 2);
		fxX.strokeStyle = `rgba(155,210,228,${a})`;
		fxX.lineWidth = 0.8 + progress * 0.4;
		fxX.stroke();
	}

	// Full-screen rain
	const rainIntensity = isActive ? 0.7 + bs * 0.5 : 0.35;
	const windAngle = -0.06 + (rmx - 0.5) * 0.06 + mvx * 0.008;

	RAINDROPS.forEach((drop, i) => {
		rainY[i] = (rainY[i] + drop.speed * (0.6 + rainIntensity) * 0.016) % 1;
		const rx2 = ((drop.x + windAngle * rainY[i] * 2.5 + 1.2) % 1.4) - 0.1;
		const ry2 = rainY[i] * H;
		const len = drop.len * (0.8 + rainIntensity * 0.4);
		const x1 = rx2 * W, y1 = ry2;
		const x2 = x1 + windAngle * len * 8, y2 = y1 - len;

		const nearLake = Math.max(0, 1 - Math.abs(ry2 - lakeTop) / 60);
		const alpha = drop.alpha * rainIntensity * (1 - nearLake * 0.7);
		if (alpha < 0.01) return;

		tpX.beginPath();
		tpX.moveTo(x1, y1);
		tpX.lineTo(x2, y2);
		tpX.strokeStyle = `rgba(155,210,240,${alpha})`;
		tpX.lineWidth = drop.thickness;
		tpX.stroke();
	});

	drawMouseWave(tpX, W, H, t, [105, 195, 215], 0.06, bs, mouse);
}
