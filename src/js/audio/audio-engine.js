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
		this.gainNode.gain.setValueAtTime(0.0001, now);

		this.noiseNode.connect(this.filterNode);
		this.filterNode.connect(this.gainNode);
		this.gainNode.connect(this.destination);

		this.noiseNode.start(now);
	}

	update(bs, phaseName) {
		if (!this.isPlaying || !this.gainNode || !this.actx || !state.guidanceChime) {
			if (this.gainNode) this.gainNode.gain.setValueAtTime(0.0001, this.actx ? this.actx.currentTime : 0);
			return;
		}

		const now = this.actx.currentTime;
		const master = state.masterVolume;

		if (phaseName === "inhale") {
			const freq = 650 + bs * 1150;
			const gainVal = (0.015 + bs * 0.14) * master;
			this.filterNode.frequency.setTargetAtTime(freq, now, 0.08);
			this.filterNode.Q.setTargetAtTime(0.75 + bs * 0.4, now, 0.08);
			this.gainNode.gain.setTargetAtTime(gainVal, now, 0.08);
		} else if (phaseName === "exhale") {
			const freq = 1450 - bs * 880;
			const gainVal = (0.012 + bs * 0.12) * master;
			this.filterNode.frequency.setTargetAtTime(freq, now, 0.08);
			this.filterNode.Q.setTargetAtTime(0.55 + bs * 0.3, now, 0.08);
			this.gainNode.gain.setTargetAtTime(gainVal, now, 0.08);
		} else {
			this.gainNode.gain.setTargetAtTime(0.0001, now, 0.15);
		}
	}

	stop() {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		if (this.gainNode && this.actx) {
			this.gainNode.gain.setTargetAtTime(0.0001, this.actx.currentTime, 0.1);
		}
		setTimeout(() => {
			if (this.noiseNode) {
				try { this.noiseNode.stop(); } catch(e){}
				this.noiseNode.disconnect();
				this.noiseNode = null;
			}
			if (this.filterNode) {
				this.filterNode.disconnect();
				this.filterNode = null;
			}
			if (this.gainNode) {
				this.gainNode.disconnect();
				this.gainNode = null;
			}
		}, 150);
	}
}

class AudioEngine {
	constructor() {
		this.actx = null;
		this.masterGain = null;
		this.ambientGain = null;
		this.classicalSynth = null;
		this.natureSynth = null;
		this.jazzSynth = null;
		this.ambientSynth = null;
		this.airBreath = null;
		this.musicAudio = null;
	}

	initCtx() {
		if (this.actx) {
			if (this.actx.state === "suspended") this.actx.resume();
			return;
		}
		const AC = window.AudioContext || window.webkitAudioContext;
		this.actx = new AC();

		this.masterGain = this.actx.createGain();
		this.masterGain.gain.setValueAtTime(state.masterVolume, this.actx.currentTime);
		this.masterGain.connect(this.actx.destination);

		this.ambientGain = this.actx.createGain();
		this.ambientGain.gain.setValueAtTime(state.ambientVolume, this.actx.currentTime);
		this.ambientGain.connect(this.masterGain);

		this.classicalSynth = new ClassicalSynth(this.actx, this.ambientGain);
		this.natureSynth = new NatureSynth(this.actx, this.ambientGain);
		this.jazzSynth = new JazzSynth(this.actx, this.ambientGain);
		this.ambientSynth = new AmbientSynth(this.actx, this.ambientGain);
		this.airBreath = new NaturalAirBreath(this.actx, this.masterGain);
	}

	setMasterVolume(val) {
		state.masterVolume = val;
		if (this.masterGain && this.actx) {
			this.masterGain.gain.setTargetAtTime(val, this.actx.currentTime, 0.05);
		}
		setYouTubeVolume(Math.round(val * 100));
		if (this.musicAudio) {
			this.musicAudio.volume = Math.min(val, 0.65);
		}
	}

	setAmbientVolume(val) {
		state.ambientVolume = val;
		if (this.ambientGain && this.actx) {
			this.ambientGain.gain.setTargetAtTime(val, this.actx.currentTime, 0.05);
		}
	}

	startBreathWave() {
		if (this.airBreath) this.airBreath.start();
	}

	stopBreathWave() {
		if (this.airBreath) this.airBreath.stop();
	}

	updateBreathWave(bs, phaseName) {
		if (this.airBreath) this.airBreath.update(bs, phaseName);
	}

	stopAllSynths() {
		if (this.classicalSynth) this.classicalSynth.stop();
		if (this.natureSynth) this.natureSynth.stop();
		if (this.jazzSynth) this.jazzSynth.stop();
		if (this.ambientSynth) this.ambientSynth.stop();
	}

	stopMusicTrack() {
		if (this.musicAudio) {
			this.musicAudio.pause();
			this.musicAudio = null;
		}
		pauseYouTubeTrack();
	}

	stopAudio() {
		this.stopAllSynths();
		this.stopMusicTrack();
		this.stopBreathWave();
	}

	playStreamTrack(url, name, onFail) {
		this.stopMusicTrack();
		const trackNameEl = document.getElementById("track-name");

		this.musicAudio = new Audio(url);
		this.musicAudio.crossOrigin = "anonymous";
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

			// Dual-Engine Audio Layering: If dual audio is enabled, layer procedural soundscape underneath!
			if (state.dualAudioEnabled) {
				this.startProceduralMode(mode);
			}
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
