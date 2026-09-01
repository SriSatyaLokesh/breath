import { drawMouseWave, RNG } from "../canvas-renderer.js";

const NOTES_PER_STAVE = 16;
const NOTE_DATA = Array.from({ length: 4 }, (_, si) =>
	Array.from({ length: NOTES_PER_STAVE }, (_, ni) => {
		const r = RNG(si * 100 + ni * 7);
		return {
			pos: Math.floor(r() * 9) - 4,
			type: Math.floor(r() * 3),
			rest: r() > 0.82
		};
	})
);

let classicalWavePhase = 0;

export function drawClassical(bgX, fxX, tpX, W, H, t, bs, exhaleVal, mouse, isActive) {
	const { rmx, rmy, mvx, mvy, dragEnergy, clickRipples } = mouse;

	const bg2 = bgX.createLinearGradient(0, 0, 0, H);
	bg2.addColorStop(0, "#f8f2e4");
	bg2.addColorStop(0.4, "#f3ebd7");
	bg2.addColorStop(0.8, "#eee2cc");
	bg2.addColorStop(1, "#e9d9be");
	bgX.fillStyle = bg2;
	bgX.fillRect(0, 0, W, H);

	const vg = bgX.createRadialGradient(W / 2, H / 2, H * 0.14, W / 2, H / 2, W * 0.74);
	vg.addColorStop(0, "transparent");
	vg.addColorStop(0.62, `rgba(138,92,52,${0.04 + bs * 0.08})`);
	vg.addColorStop(1, `rgba(95,50,20,${0.22 + bs * 0.1})`);
	bgX.fillStyle = vg;
	bgX.fillRect(0, 0, W, H);

	const mspot = bgX.createRadialGradient(W * rmx, H * rmy, 0, W * rmx, H * rmy, W * (0.25 + dragEnergy * 0.06));
	mspot.addColorStop(0, `rgba(200,140,80,${0.03 + bs * 0.05 + dragEnergy * 0.03})`);
	mspot.addColorStop(1, "transparent");
	bgX.fillStyle = mspot;
	bgX.fillRect(0, 0, W, H);

	clickRipples.forEach(r => {
		const g2 = bgX.createRadialGradient(r.x * W, r.y * H, 0, r.x * W, r.y * H, W * 0.15 * r.strength);
		g2.addColorStop(0, `rgba(180,60,50,${r.strength * 0.04 * Math.exp(-r.t * 1.5)})`);
		g2.addColorStop(1, "transparent");
		bgX.fillStyle = g2;
		bgX.fillRect(0, 0, W, H);
	});

	fxX.clearRect(0, 0, W, H);
	tpX.clearRect(0, 0, W, H);

	const staveY = [H * 0.2, H * 0.38, H * 0.56, H * 0.74];
	const stavePeriod = 8;
	const activeStave = Math.floor(((t * 0.001) / stavePeriod) % 4);
	const notePlayPos = (((t * 0.001) / stavePeriod) % 1) * NOTES_PER_STAVE;

	for (let s = 0; s < 4; s++) {
		const baseY = staveY[s];
		const scrollX = (t * 0.021 * (1 + s * 0.42)) % W;

		for (let line = 0; line < 5; line++) {
			const ly = baseY + line * 9;
			const lg = bgX.createLinearGradient(0, 0, W, 0);
			lg.addColorStop(0, "transparent");
			lg.addColorStop(0.04, `rgba(68,32,12,${0.13 + bs * 0.06})`);
			lg.addColorStop(0.96, `rgba(68,32,12,${0.13 + bs * 0.06})`);
			lg.addColorStop(1, "transparent");
			bgX.strokeStyle = lg;
			bgX.lineWidth = 0.72;
			bgX.beginPath();
			bgX.moveTo(0, ly);
			bgX.lineTo(W, ly);
			bgX.stroke();
		}

		bgX.font = `${34 + s * 2}px serif`;
		bgX.fillStyle = `rgba(78,32,15,${0.19 + bs * 0.09})`;
		bgX.fillText("𝄞", Math.max(18, 40 - scrollX * 0.03), baseY + 26);

		NOTE_DATA[s].forEach((nd, ni) => {
			const nx2 = (ni * (W / NOTES_PER_STAVE) + W - scrollX * 1.85) % W;
			if (nx2 < 58 || nx2 > W - 10) return;
			const ny2 = baseY + nd.pos * 4.5 + 18;
			const isNearPlayhead = s === activeStave && Math.abs(ni - notePlayPos) < 1.2;
			const na = isNearPlayhead ? 0.22 + bs * 0.18 : 0.13 + bs * 0.13;

			if (nd.rest) return;

			const vib = Math.sin(t * 0.003 + ni * 1.2) * bs * 2.5 + (rmx - 0.5) * bs * 3 + mvx * 0.4 * Math.sin(ni * 0.3);
			const noteR = isNearPlayhead ? `rgba(165,18,40,${na + 0.08})` : `rgba(52,20,8,${na})`;

			bgX.beginPath();
			bgX.ellipse(nx2 + vib, ny2, 5.5, 4.2, -0.2, 0, Math.PI * 2);
			bgX.fillStyle = noteR;
			bgX.fill();

			const stemDir = nd.pos < 0 ? 1 : -1;
			bgX.beginPath();
			bgX.moveTo(nx2 + vib + 4.5, ny2);
			bgX.lineTo(nx2 + vib + 4.5, ny2 - 28 * stemDir);
			bgX.strokeStyle = noteR;
			bgX.lineWidth = 1.2;
			bgX.stroke();
		});
	}

	// Pink-red harmonic wave
	const scrollSync = notePlayPos / NOTES_PER_STAVE;
	classicalWavePhase += isActive ? 0.0018 : 0.0008;

	const pinkWaveLayers = [
		{ yFrac: 0.5, ampFrac: 0.038, freq: 1.6, lineW: 3.0, alpha: 0.52 + bs * 0.3 },
		{ yFrac: 0.5, ampFrac: 0.062, freq: 1.6, lineW: 9.0, alpha: 0.13 + bs * 0.18 },
		{ yFrac: 0.5, ampFrac: 0.028, freq: 3.2, lineW: 1.5, alpha: 0.36 + bs * 0.24 }
	];

	pinkWaveLayers.forEach(({ yFrac, ampFrac, freq, lineW, alpha }, li) => {
		const wY = H * (yFrac + (rmy - 0.5) * 0.22);
		const wAmp = H * ampFrac * (0.5 + bs * 0.7) * (1 + Math.abs(rmx - 0.5) * 1.8 + dragEnergy * 1.2 + Math.abs(rmy - 0.5) * 0.6);
		const freqMod = freq * (1 + (rmx - 0.5) * 0.5 + mvx * 0.04);
		const ph = classicalWavePhase * 5.5 + scrollSync * Math.PI * 4 + (rmx - 0.5) * 2.5;

		tpX.beginPath();
		for (let x = 0; x <= W; x += 3) {
			const nx = x / W;
			let y = wY + Math.sin(nx * Math.PI * 2 * freqMod + ph) * wAmp +
				Math.sin(nx * Math.PI * 3.5 * freqMod + ph * 0.72) * wAmp * 0.4 +
				Math.sin(nx * Math.PI * 1.1 + ph * 0.4) * wAmp * 0.24 +
				(rmx - 0.5) * wAmp * 1.0 * Math.sin(nx * Math.PI * 2 + li) +
				mvx * wAmp * 0.1 * Math.sin(nx * Math.PI * 3.5) +
				mvy * wAmp * 0.06 * Math.cos(nx * Math.PI * 2.2 + li);

			if (dragEnergy > 0.1) {
				y += dragEnergy * wAmp * 0.6 * Math.sin(nx * Math.PI * 5.5 + ph * 1.3);
			}

			x === 0 ? tpX.moveTo(0, y) : tpX.lineTo(x, y);
		}

		const grad = tpX.createLinearGradient(0, wY - wAmp * 1.5, 0, wY + wAmp * 1.5);
		grad.addColorStop(0, `rgba(230,100,130,${alpha * 0.4})`);
		grad.addColorStop(0.4, `rgba(200,30,60,${alpha})`);
		grad.addColorStop(0.6, `rgba(180,18,45,${alpha})`);
		grad.addColorStop(1, `rgba(240,130,160,${alpha * 0.3})`);
		tpX.strokeStyle = grad;
		tpX.lineWidth = lineW * (1 + dragEnergy * 0.4);
		tpX.stroke();
	});

	drawMouseWave(tpX, W, H, t, [152, 22, 42], 0.05, bs, mouse);
}
