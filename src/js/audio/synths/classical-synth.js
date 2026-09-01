/**
 * Indian Carnatic Classical Music Engine
 * Synthesizes authentic Carnatic Raga Mohanam / Hamsadhvani melodies,
 * microtonal Swara Gamakas (pitch slides), Veena, Carnatic Bamboo Flute, 
 * and continuous Tanpura Shruti Box drones using Web Audio API synthesis.
 */

export class ClassicalSynth {
	constructor(actx, masterGain) {
		this.actx = actx;
		this.masterGain = masterGain;
		this.nodes = [];
		this.isPlaying = false;
		this.timerIds = [];
		
		// Swaras for Raga Mohanam (Pentatonic: Sa, Ri2, Ga3, Pa, Dha2, Sa')
		// Fundamental Sa = 216 Hz (A3 base tuning)
		this.swaras = [
			{ name: "Sa", f: 216.00 },
			{ name: "Ri2", f: 243.00 },
			{ name: "Ga3", f: 270.00 },
			{ name: "Pa", f: 324.00 },
			{ name: "Dha2", f: 364.50 },
			{ name: "Sa'", f: 432.00 },
			{ name: "Ri2'", f: 486.00 },
			{ name: "Ga3'", f: 540.00 }
		];

		// Classical Carnatic Phrases (Arohanam & Avohanam motifs with Gamaka slides)
		this.ragaPhrases = [
			[0, 1, 2, 3, 4, 5],        // Sa Ri Ga Pa Dha Sa'
			[5, 4, 3, 2, 1, 0],        // Sa' Dha Pa Ga Ri Sa
			[2, 3, 4, 3, 2, 1, 0],     // Ga Pa Dha Pa Ga Ri Sa
			[0, 2, 3, 5, 4, 3, 2, 0],  // Sa Ga Pa Sa' Dha Pa Ga Sa
			[3, 4, 5, 6, 7, 5, 4, 3]   // Pa Dha Sa' Ri' Ga' Sa' Dha Pa
		];

		this.phraseIdx = 0;
	}

	start() {
		this.stop();
		this.isPlaying = true;

		// 1. Continuous Sacred Tanpura Drone (Shruti Box: Sa - Pa - Sa' - Ni)
		this.startTanpuraDrone();

		// 2. Carnatic Raga Swara & Gamaka Melodic Synthesis
		this.scheduleNextRagaPhrase();
	}

	stop() {
		this.isPlaying = false;
		this.timerIds.forEach(id => clearTimeout(id));
		this.timerIds = [];

		this.nodes.forEach(node => {
			try {
				if (node.stop) node.stop();
				if (node.disconnect) node.disconnect();
			} catch (e) {}
		});
		this.nodes = [];
	}

	/**
	 * Synthesizes continuous Indian Tanpura Drone (Shruti Box)
	 * Pa (204.15Hz) -> Sa (136.1Hz) -> Sa' (272.2Hz) -> Pa (102.07Hz)
	 */
	startTanpuraDrone() {
		if (!this.actx || !this.masterGain) return;

		const droneNotes = [
			{ f: 204.15, vol: 0.08, delay: 0 },    // Pa
			{ f: 136.10, vol: 0.12, delay: 1.2 },  // Sa
			{ f: 272.20, vol: 0.06, delay: 2.4 },  // Sa'
			{ f: 102.07, vol: 0.10, delay: 3.6 }   // Low Pa
		];

		droneNotes.forEach((n) => {
			const osc1 = this.actx.createOscillator();
			const osc2 = this.actx.createOscillator();
			
			osc1.type = "sawtooth";
			osc2.type = "sine";

			osc1.frequency.value = n.f;
			osc2.frequency.value = n.f * 1.0015; // Soft chorus shimmer

			const filter = this.actx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 520;

			const gain = this.actx.createGain();
			gain.gain.value = n.vol;

			// Microtonal Gamaka vibrato LFO
			const lfo = this.actx.createOscillator();
			lfo.frequency.value = 0.18;
			const lfoGain = this.actx.createGain();
			lfoGain.gain.value = 1.8;

			lfo.connect(lfoGain);
			lfoGain.connect(osc1.frequency);

			osc1.connect(filter);
			osc2.connect(filter);
			filter.connect(gain);
			gain.connect(this.masterGain);

			osc1.start();
			osc2.start();
			lfo.start();

			this.nodes.push(osc1, osc2, lfo, lfoGain, filter, gain);
		});
	}

	/**
	 * Play Carnatic Veena Swara Note with expressive Gamaka pitch slide
	 */
	playVeenaSwara(targetFreq, duration, velocity = 0.12) {
		if (!this.isPlaying || !this.actx) return;

		const osc = this.actx.createOscillator();
		const osc2 = this.actx.createOscillator();
		
		osc.type = "sawtooth";
		osc2.type = "triangle";

		const now = this.actx.currentTime;

		// Gamaka: Expressive Carnatic microtonal pitch slide starting slightly below target note
		const startFreq = targetFreq * 0.95;
		osc.frequency.setValueAtTime(startFreq, now);
		osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.14);

		osc2.frequency.setValueAtTime(startFreq * 1.002, now);
		osc2.frequency.exponentialRampToValueAtTime(targetFreq * 1.002, now + 0.14);

		const filter = this.actx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(350, now);
		filter.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
		filter.frequency.exponentialRampToValueAtTime(450, now + duration);

		const gain = this.actx.createGain();
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(velocity, now + 0.08);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

		osc.connect(filter);
		osc2.connect(filter);
		filter.connect(gain);
		gain.connect(this.masterGain);

		osc.start(now);
		osc2.start(now);
		osc.stop(now + duration + 0.1);
		osc2.stop(now + duration + 0.1);
	}

	/**
	 * Play Carnatic Flute Note (pure warm bamboo flute resonance)
	 */
	playCarnaticFlute(targetFreq, duration, velocity = 0.09) {
		if (!this.isPlaying || !this.actx) return;

		const osc = this.actx.createOscillator();
		osc.type = "sine";

		const now = this.actx.currentTime;
		osc.frequency.setValueAtTime(targetFreq, now);

		// Subtle flute breath tremolo
		const lfo = this.actx.createOscillator();
		lfo.frequency.value = 5.2;
		const lfoGain = this.actx.createGain();
		lfoGain.gain.value = 1.2;
		lfo.connect(lfoGain);
		lfoGain.connect(osc.frequency);
		lfo.start(now);

		const gain = this.actx.createGain();
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(velocity, now + 0.12);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start(now);
		osc.stop(now + duration + 0.05);
	}

	scheduleNextRagaPhrase() {
		if (!this.isPlaying || !this.actx) return;

		const phraseIndices = this.ragaPhrases[this.phraseIdx % this.ragaPhrases.length];

		phraseIndices.forEach((swaraIdx, step) => {
			const swara = this.swaras[swaraIdx];
			const delay = step * 0.55;

			const tid = setTimeout(() => {
				if (this.isPlaying) {
					// Play Veena Swara
					this.playVeenaSwara(swara.f, 2.4, 0.12);

					// Occasional Bamboo Flute unison/harmony
					if (Math.random() < 0.65) {
						this.playCarnaticFlute(swara.f, 2.0, 0.09);
					}
				}
			}, delay * 1000);

			this.timerIds.push(tid);
		});

		this.phraseIdx++;
		const phraseDuration = phraseIndices.length * 0.55 + 1.2 + Math.random() * 1.5;

		const nextTid = setTimeout(() => {
			this.scheduleNextRagaPhrase();
		}, phraseDuration * 1000);

		this.timerIds.push(nextTid);
	}
}
