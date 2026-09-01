/**
 * Procedural Ambient Synthesizer
 * Provides pink noise, harmonic sine pads, drops, singing bells, nocturnal crickets, and owls.
 */

export class AmbientSynth {
	constructor(actx, masterGain) {
		this.actx = actx;
		this.masterGain = masterGain;
		this.nodes = [];
		this.isPlaying = false;
		this.timeouts = [];
	}

	pinkBuffer(sec = 4) {
		const len = this.actx.sampleRate * sec;
		const buf = this.actx.createBuffer(2, len, this.actx.sampleRate);
		for (let ch = 0; ch < 2; ch++) {
			const d = buf.getChannelData(ch);
			let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
			for (let i = 0; i < len; i++) {
				const w = Math.random() * 2 - 1;
				b0 = 0.99886 * b0 + w * 0.0555179;
				b1 = 0.99332 * b1 + w * 0.0750759;
				b2 = 0.969 * b2 + w * 0.153852;
				b3 = 0.8665 * b3 + w * 0.3104856;
				b4 = 0.55 * b4 + w * 0.5329522;
				b5 = -0.7616 * b5 - w * 0.016898;
				d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
				b6 = w * 0.115926;
			}
		}
		return buf;
	}

	loopNoise(freq, type = "lowpass", vol = 0.12) {
		if (!this.actx || !this.masterGain) return;
		const src = this.actx.createBufferSource();
		src.buffer = this.pinkBuffer(4);
		src.loop = true;

		const filter = this.actx.createBiquadFilter();
		filter.type = type;
		filter.frequency.value = freq;

		const gain = this.actx.createGain();
		gain.gain.value = vol;

		src.connect(filter);
		filter.connect(gain);
		gain.connect(this.masterGain);

		src.start();
		this.nodes.push(src, filter, gain);
	}

	pad(freqs, type = "sine", vol = 0.10, lfoFreq = 0.05) {
		if (!this.actx || !this.masterGain) return;
		freqs.forEach((f, i) => {
			const osc = this.actx.createOscillator();
			osc.type = type;
			osc.frequency.value = f;

			const gain = this.actx.createGain();
			gain.gain.value = vol;

			if (lfoFreq) {
				const lfo = this.actx.createOscillator();
				lfo.frequency.value = lfoFreq + i * 0.015;
				const lfoGain = this.actx.createGain();
				lfoGain.gain.value = 0.025;

				lfo.connect(lfoGain);
				lfoGain.connect(gain.gain);
				lfo.start();
				this.nodes.push(lfo, lfoGain);
			}

			osc.connect(gain);
			gain.connect(this.masterGain);
			osc.start();
			this.nodes.push(osc, gain);
		});
	}

	drops() {
		const scheduleDrop = () => {
			if (!this.isPlaying || !this.actx) return;
			const osc = this.actx.createOscillator();
			const gain = this.actx.createGain();

			osc.frequency.value = [523, 659, 784, 1047][Math.floor(Math.random() * 4)] * (1 + Math.random() * 0.015);
			osc.type = "sine";

			const now = this.actx.currentTime;
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.06, now + 0.012);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(now);
			osc.stop(now + 1.4);

			const tid = setTimeout(scheduleDrop, 1600 + Math.random() * 3800);
			this.timeouts.push(tid);
		};

		const tid = setTimeout(scheduleDrop, 500);
		this.timeouts.push(tid);
	}

	bells() {
		const scheduleBell = () => {
			if (!this.isPlaying || !this.actx) return;
			const f0 = 220 * (1 + Math.random() * 0.04);
			[1, 2.756, 5.4, 8.93].forEach(p => {
				const osc = this.actx.createOscillator();
				osc.type = "sine";
				osc.frequency.value = f0 * p;

				const gain = this.actx.createGain();
				const now = this.actx.currentTime;
				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.06 / (p * 0.5 + 0.5), now + 0.02);
				gain.gain.exponentialRampToValueAtTime(0.0001, now + 5 + Math.random() * 4);

				osc.connect(gain);
				gain.connect(this.masterGain);
				osc.start(now);
				osc.stop(now + 10);
			});

			const tid = setTimeout(scheduleBell, 5000 + Math.random() * 9000);
			this.timeouts.push(tid);
		};

		const tid = setTimeout(scheduleBell, 800);
		this.timeouts.push(tid);
	}

	crickets() {
		const scheduleChirp = () => {
			if (!this.isPlaying || !this.actx) return;
			const buf = this.actx.createBuffer(1, this.actx.sampleRate * 0.07, this.actx.sampleRate);
			const d = buf.getChannelData(0);
			for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;

			const src = this.actx.createBufferSource();
			src.buffer = buf;

			const bp = this.actx.createBiquadFilter();
			bp.type = "bandpass";
			bp.frequency.value = 4100 + Math.random() * 700;
			bp.Q.value = 9;

			const gain = this.actx.createGain();
			gain.gain.value = 0.065;

			src.connect(bp);
			bp.connect(gain);
			gain.connect(this.masterGain);
			src.start();

			const tid = setTimeout(scheduleChirp, 55 + Math.random() * 110);
			this.timeouts.push(tid);
		};

		const tid = setTimeout(scheduleChirp, 1200);
		this.timeouts.push(tid);
	}

	owl() {
		const scheduleHoot = () => {
			if (!this.isPlaying || !this.actx) return;
			const dur = 0.45 + Math.random() * 0.35;
			const osc = this.actx.createOscillator();
			const gain = this.actx.createGain();

			osc.type = "sine";
			const now = this.actx.currentTime;
			osc.frequency.setValueAtTime(315, now);
			osc.frequency.linearRampToValueAtTime(275, now + dur);

			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
			gain.gain.setValueAtTime(0.06, now + dur - 0.1);
			gain.gain.linearRampToValueAtTime(0, now + dur);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(now);
			osc.stop(now + dur + 0.05);

			const tid = setTimeout(scheduleHoot, 6000 + Math.random() * 12000);
			this.timeouts.push(tid);
		};

		const tid = setTimeout(scheduleHoot, 3000);
		this.timeouts.push(tid);
	}

	startForMode(mode) {
		this.stop();
		this.isPlaying = true;

		if (mode === "breathe") {
			this.loopNoise(650, "lowpass", 0.15);
			this.loopNoise(180, "highpass", 0.05);
			this.pad([65.41, 98, 130.81], "sine", 0.12, 0.08);
			this.drops();
		} else if (mode === "meditate") {
			this.loopNoise(380, "lowpass", 0.10);
			this.pad([110, 146.83, 164.81, 220], "sine", 0.12, 0.05);
			this.bells();
		} else if (mode === "anxiety") {
			this.loopNoise(580, "lowpass", 0.10);
			this.loopNoise(140, "highpass", 0.04);
			this.pad([55, 73.42, 87.31], "sine", 0.11, 0.07);
			this.crickets();
			this.owl();
		}
	}

	stop() {
		this.isPlaying = false;
		this.timeouts.forEach(t => clearTimeout(t));
		this.timeouts = [];

		this.nodes.forEach(node => {
			try {
				if (node.stop) node.stop();
				if (node.disconnect) node.disconnect();
			} catch (e) {}
		});
		this.nodes = [];
	}
}
