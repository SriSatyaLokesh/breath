/**
 * Procedural Ambient Jazz Synthesizer
 * Generates walking basslines, swing hi-hats, jazz 7th chords, and saxophone riffs.
 */

export class JazzSynth {
	constructor(actx, masterGain) {
		this.actx = actx;
		this.masterGain = masterGain;
		this.nodes = [];
		this.isPlaying = false;
		this.timeouts = [];
	}

	start() {
		this.stop();
		this.isPlaying = true;

		const bassNotes = [87.31, 98.00, 110.00, 130.81, 146.83, 130.81, 110.00, 98.00];
		let beatIdx = 0;
		const tempo = 1.4; // Seconds per quarter note

		const bassWalk = () => {
			if (!this.isPlaying || !this.actx) return;

			const osc = this.actx.createOscillator();
			const gain = this.actx.createGain();

			osc.type = "triangle";
			osc.frequency.value = bassNotes[beatIdx % bassNotes.length];

			const now = this.actx.currentTime;
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.24, now + 0.04);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + tempo * 0.85);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(now);
			osc.stop(now + tempo);

			beatIdx++;
			const tid = setTimeout(bassWalk, tempo * 1000);
			this.timeouts.push(tid);
		};

		bassWalk();

		const chordSets = [
			[174.61, 220.00, 293.66], // Fmaj7
			[195.99, 246.94, 329.63], // G7
			[220.00, 277.18, 369.99], // Am7
			[174.61, 220.00, 293.66]
		];
		let chordIdx = 0;

		const strumChord = () => {
			if (!this.isPlaying || !this.actx) return;

			const chord = chordSets[chordIdx % chordSets.length];
			chord.forEach((freq, i) => {
				const osc = this.actx.createOscillator();
				const gain = this.actx.createGain();

				osc.type = "sawtooth";
				osc.frequency.value = freq;

				const lfo = this.actx.createOscillator();
				const lfoGain = this.actx.createGain();
				lfo.frequency.value = 5.5;
				lfoGain.gain.value = 2;

				lfo.connect(lfoGain);
				lfoGain.connect(osc.frequency);
				lfo.start();

				const filter = this.actx.createBiquadFilter();
				filter.type = "lowpass";
				filter.frequency.value = 1800;
				filter.Q.value = 1.2;

				const now = this.actx.currentTime + i * 0.012;
				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
				gain.gain.exponentialRampToValueAtTime(0.0001, now + tempo * 3.8);

				osc.connect(filter);
				filter.connect(gain);
				gain.connect(this.masterGain);

				osc.start(now);
				osc.stop(now + tempo * 4);
				this.nodes.push(osc, lfo, lfoGain, filter, gain);
			});

			chordIdx++;
			const tid = setTimeout(strumChord, tempo * 4 * 1000);
			this.timeouts.push(tid);
		};

		const tidChord = setTimeout(strumChord, 200);
		this.timeouts.push(tidChord);

		const hat = () => {
			if (!this.isPlaying || !this.actx) return;
			const buf = this.actx.createBuffer(1, this.actx.sampleRate * 0.04, this.actx.sampleRate);
			const d = buf.getChannelData(0);
			for (let i = 0; i < d.length; i++) {
				d[i] = (Math.random() * 2 - 1) * Math.exp((-i / d.length) * 30);
			}
			const src = this.actx.createBufferSource();
			src.buffer = buf;

			const hp = this.actx.createBiquadFilter();
			hp.type = "highpass";
			hp.frequency.value = 8000;

			const gain = this.actx.createGain();
			gain.gain.value = 0.09;

			src.connect(hp);
			hp.connect(gain);
			gain.connect(this.masterGain);
			src.start();
		};

		const swingTick = () => {
			if (!this.isPlaying || !this.actx) return;
			hat();
			const t1 = setTimeout(() => {
				if (this.isPlaying) hat();
			}, tempo * 500 * 0.67);

			const t2 = setTimeout(swingTick, tempo * 1000);
			this.timeouts.push(t1, t2);
		};

		const tidSwing = setTimeout(swingTick, 100);
		this.timeouts.push(tidSwing);
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
