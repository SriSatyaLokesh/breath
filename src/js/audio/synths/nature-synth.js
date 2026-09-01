/**
 * Procedural Nature Soundscape Generator
 * Synthesizes rain fall, wind gusts, and lake water drops.
 */

export class NatureSynth {
	constructor(actx, masterGain) {
		this.actx = actx;
		this.masterGain = masterGain;
		this.nodes = [];
		this.isPlaying = false;
		this.dropTimeout = null;
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

	loopNoise(freq, type = "lowpass", vol = 0.18) {
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

	startWind() {
		if (!this.actx || !this.masterGain) return;
		const osc = this.actx.createOscillator();
		const lfo = this.actx.createOscillator();
		osc.type = "sawtooth";
		osc.frequency.value = 55;
		lfo.frequency.value = 0.08;

		const lfoGain = this.actx.createGain();
		lfoGain.gain.value = 22;

		const filter = this.actx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 400;

		const gain = this.actx.createGain();
		gain.gain.value = 0.06;

		lfo.connect(lfoGain);
		lfoGain.connect(filter.frequency);
		osc.connect(filter);
		filter.connect(gain);
		gain.connect(this.masterGain);

		osc.start();
		lfo.start();
		this.nodes.push(osc, lfo, lfoGain, filter, gain);
	}

	waterDrops() {
		const scheduleDrop = () => {
			if (!this.isPlaying || !this.actx) return;

			const osc = this.actx.createOscillator();
			const gain = this.actx.createGain();

			osc.type = "sine";
			const baseFreq = [523, 587, 659, 784, 880][Math.floor(Math.random() * 5)];
			const now = this.actx.currentTime;

			osc.frequency.setValueAtTime(baseFreq * 1.5, now);
			osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.3);

			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.045, now + 0.008);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(now);
			osc.stop(now + 0.45);

			this.dropTimeout = setTimeout(scheduleDrop, 600 + Math.random() * 2800);
		};

		scheduleDrop();
	}

	start() {
		this.stop();
		this.isPlaying = true;

		// Rain noise layers
		this.loopNoise(1200, "lowpass", 0.18);
		this.loopNoise(400, "lowpass", 0.12);
		this.loopNoise(5500, "bandpass", 0.04);

		// Wind oscillation
		this.startWind();

		// Water drops
		this.waterDrops();
	}

	stop() {
		this.isPlaying = false;
		if (this.dropTimeout) clearTimeout(this.dropTimeout);
		this.dropTimeout = null;

		this.nodes.forEach(node => {
			try {
				if (node.stop) node.stop();
				if (node.disconnect) node.disconnect();
			} catch (e) {}
		});
		this.nodes = [];
	}
}
