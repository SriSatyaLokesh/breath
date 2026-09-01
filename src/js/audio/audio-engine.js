import { state } from "../state.js";
import { ClassicalSynth } from "./synths/classical-synth.js";
import { NatureSynth } from "./synths/nature-synth.js";
import { JazzSynth } from "./synths/jazz-synth.js";
import { AmbientSynth } from "./synths/ambient-synth.js";
import { playYouTubeTrack, setYouTubeVolume, pauseYouTubeTrack } from "./youtube-player.js";

const BASE_C = "https://archive.org/download/classical_music_202209/";
export const CLASSICAL_TRACKS = [
	{
		url: BASE_C + "Beethoven%20-%20Moonlight%20Sonata.mp3",
		name: "Beethoven — Moonlight Sonata"
	},
	{
		url: BASE_C + "Chopin%20-%20Nocturne%20No%202.mp3",
		name: "Chopin — Nocturne No. 2"
	},
	{
		url: BASE_C + "Beethoven%20-%20Fur%20Elise.mp3",
		name: "Beethoven — Für Elise"
	},
	{
		url: BASE_C + "Chopin%20-%20Minute%20Waltz.mp3",
		name: "Chopin — Minute Waltz"
	}
];

/**
 * Natural Pulmonary Airflow Breath Audio Synthesizer
 * Synthesizes authentic human breath air movement:
 * - INHALE: Soft, soothing inhalation air flow through the nose/throat.
 * - HOLD: Gentle resting stillness.
 * - EXHALE: Soft, relaxing exhalation air release through the throat/lips.
 * Zero synthetic sine wave tones, zero pitch sliding, zero artificial sounds.
 */
class NaturalAirBreath {
	constructor(actx, destination) {
		this.actx = actx;
		this.destination = destination;
		this.noiseNode = null;
		this.filterNode = null;
		this.gainNode = null;
		this.isPlaying = false;
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

	start() {
		if (this.isPlaying || !this.actx) return;
		this.isPlaying = true;

		const now = this.actx.currentTime;
		this.noiseNode = this.actx.createBufferSource();
		this.noiseNode.buffer = this.pinkBuffer(4);
		this.noiseNode.loop = true;

		this.filterNode = this.actx.createBiquadFilter();
		this.filterNode.type = "bandpass";
		this.filterNode.frequency.setValueAtTime(1200, now);
		this.filterNode.Q.setValueAtTime(0.8, now);

		this.gainNode = this.actx.createGain();
		this.gainNode.gain.setValueAtTime(0, now);

		this.noiseNode.connect(this.filterNode);
		this.filterNode.connect(this.gainNode);
		this.gainNode.connect(this.destination);

		this.noiseNode.start(now);
	}

	update(bs, phaseName) {
		if (!this.isPlaying || !this.actx || !this.gainNode || !state.guidanceChime) return;
		const now = this.actx.currentTime;

		if (phaseName === "hold") {
			this.gainNode.gain.setTargetAtTime(0.001, now, 0.2);
		} else if (phaseName === "inhale") {
			const airVol = Math.max(0.001, bs * 0.18);
			const airCutoff = 1000 + bs * 800;

			this.gainNode.gain.setTargetAtTime(airVol, now, 0.12);
			this.filterNode.frequency.setTargetAtTime(airCutoff, now, 0.12);
			this.filterNode.Q.setTargetAtTime(0.9, now, 0.12);
		} else if (phaseName === "exhale") {
			const airVol = Math.max(0.001, bs * 0.20);
			const airCutoff = 1600 - (1 - bs) * 900;

			this.gainNode.gain.setTargetAtTime(airVol, now, 0.12);
			this.filterNode.frequency.setTargetAtTime(airCutoff, now, 0.12);
			this.filterNode.Q.setTargetAtTime(0.6, now, 0.12);
		}
	}

	stop() {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		if (this.gainNode && this.actx) {
			try {
				this.gainNode.gain.setTargetAtTime(0, this.actx.currentTime, 0.1);
			} catch (e) {}
		}
		setTimeout(() => {
			try {
				if (this.noiseNode) this.noiseNode.stop();
				if (this.noiseNode) this.noiseNode.disconnect();
			} catch (e) {}
			this.noiseNode = null;
			this.filterNode = null;
			this.gainNode = null;
		}, 250);
	}
}

export class AudioEngine {
	constructor() {
		this.actx = null;
		this.mGain = null;
		this.bgGain = null;
		this.cueGain = null;
		this.musicAudio = null;
		this.classicalSynth = null;
		this.natureSynth = null;
		this.jazzSynth = null;
		this.ambientSynth = null;
		this.breathWave = null;
	}

	initCtx() {
		if (this.actx) return;
		this.actx = new (window.AudioContext || window.webkitAudioContext)();
		
		this.mGain = this.actx.createGain();
		this.mGain.gain.setValueAtTime(0, this.actx.currentTime);
		this.mGain.gain.linearRampToValueAtTime(state.masterVolume, this.actx.currentTime + 2.5);
		this.mGain.connect(this.actx.destination);

		this.bgGain = this.actx.createGain();
		this.bgGain.gain.value = 0.65;
		this.bgGain.connect(this.mGain);

		this.cueGain = this.actx.createGain();
		this.cueGain.gain.value = 0.90;
		this.cueGain.connect(this.mGain);

		this.classicalSynth = new ClassicalSynth(this.actx, this.bgGain);
		this.natureSynth = new NatureSynth(this.actx, this.bgGain);
		this.jazzSynth = new JazzSynth(this.actx, this.bgGain);
		this.ambientSynth = new AmbientSynth(this.actx, this.bgGain);
		this.breathWave = new NaturalAirBreath(this.actx, this.cueGain);
	}

	setVolume(vol) {
		state.masterVolume = vol;
		if (this.mGain && this.actx) {
			this.mGain.gain.setValueAtTime(vol, this.actx.currentTime);
		}
		if (this.musicAudio) {
			this.musicAudio.volume = Math.min(vol, 0.65);
		}
		setYouTubeVolume(vol);
	}

	stopMusicTrack() {
		if (this.musicAudio) {
			try {
				this.musicAudio.pause();
				this.musicAudio.src = "";
			} catch (e) {}
			this.musicAudio = null;
		}
	}

	stopAllSynths() {
		if (this.classicalSynth) this.classicalSynth.stop();
		if (this.natureSynth) this.natureSynth.stop();
		if (this.jazzSynth) this.jazzSynth.stop();
		if (this.ambientSynth) this.ambientSynth.stop();
		if (this.breathWave) this.breathWave.stop();
	}

	stopAudio(cb) {
		this.stopMusicTrack();
		pauseYouTubeTrack();
		this.stopAllSynths();

		if (!this.actx || !this.mGain) {
			if (cb) cb();
			return;
		}

		try {
			this.mGain.gain.cancelScheduledValues(this.actx.currentTime);
			this.mGain.gain.linearRampToValueAtTime(0, this.actx.currentTime + 1.2);
		} catch (e) {}

		setTimeout(() => {
			try {
				this.actx.close();
			} catch (e) {}
			this.actx = null;
			this.mGain = null;
			this.bgGain = null;
			this.cueGain = null;
			this.breathWave = null;
			if (cb) cb();
		}, 1300);
	}

	startBreathWave() {
		this.initCtx();
		if (this.breathWave) this.breathWave.start();
	}

	updateBreathWave(bs, phaseName) {
		if (!this.actx) return;

		// Ensure background music, YouTube stream, and procedural synths play continuously without pausing during Hold
		if (this.bgGain && this.bgGain.gain.value !== 0.65) {
			this.bgGain.gain.setValueAtTime(0.65, this.actx.currentTime);
		}
		if (this.musicAudio) {
			this.musicAudio.volume = Math.min(state.masterVolume, 0.65);
		}
		setYouTubeVolume(state.masterVolume);

		if (this.breathWave) {
			this.breathWave.update(bs, phaseName);
		}
	}

	playStreamTrack(url, name, onFail) {
		const trackNameEl = document.getElementById("track-name");
		this.stopMusicTrack();

		this.musicAudio = new Audio();
		this.musicAudio.crossOrigin = "anonymous";
		this.musicAudio.preload = "auto";
		this.musicAudio.src = url;
		this.musicAudio.volume = 0;

		const timeout = setTimeout(() => {
			if (this.musicAudio) this.musicAudio.pause();
			if (onFail) onFail();
		}, 8000);

		this.musicAudio.addEventListener("playing", () => {
			clearTimeout(timeout);
			if (trackNameEl) {
				trackNameEl.textContent = name;
				trackNameEl.classList.add("show");
			}
			if (this.musicAudio) {
				this.musicAudio.loop = true;
				let v = 0;
				const fade = setInterval(() => {
					if (!this.musicAudio) return clearInterval(fade);
					v = Math.min(v + 0.02, Math.min(state.masterVolume, 0.65));
					this.musicAudio.volume = v;
					if (v >= Math.min(state.masterVolume, 0.65)) clearInterval(fade);
				}, 100);
			}
		}, { once: true });

		this.musicAudio.addEventListener("error", () => {
			clearTimeout(timeout);
			if (onFail) onFail();
		}, { once: true });

		this.musicAudio.play().catch(() => {
			clearTimeout(timeout);
			if (onFail) onFail();
		});
	}

	startAudioForMode(mode) {
		this.initCtx();
		this.stopAllSynths();
		this.stopMusicTrack();
		this.startBreathWave();

		const trackNameEl = document.getElementById("track-name");

		// YouTube Music Stream
		if (state.audioSource === "youtube-music" && state.youtubeVideoId) {
			if (trackNameEl) {
				trackNameEl.textContent = "YouTube Music Stream";
				trackNameEl.classList.add("show");
			}
			playYouTubeTrack(state.youtubeVideoId);
			return;
		}

		// Classical stream
		if (state.audioSource === "classical-stream" || mode === "classical") {
			const shuffled = [...CLASSICAL_TRACKS].sort(() => Math.random() - 0.5);
			const selected = shuffled[0];
			this.playStreamTrack(selected.url, selected.name, () => {
				if (trackNameEl) {
					trackNameEl.textContent = "Live Procedural Synthesis (Classical)";
					trackNameEl.classList.add("show");
				}
				this.classicalSynth.start();
			});
			return;
		}

		if (trackNameEl) trackNameEl.classList.remove("show");
		this.startProceduralMode(mode);
	}

	startProceduralMode(mode) {
		if (mode === "nature") {
			this.natureSynth.start();
		} else if (mode === "jazz") {
			this.jazzSynth.start();
		} else if (mode === "classical") {
			this.classicalSynth.start();
		} else {
			this.ambientSynth.startForMode(mode);
		}
	}
}

export const audioEngine = new AudioEngine();
