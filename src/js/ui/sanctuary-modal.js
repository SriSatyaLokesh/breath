import { state } from "../state.js";
import { audioEngine } from "../audio/audio-engine.js";
import { extractYouTubeId, YOUTUBE_PRESETS } from "../audio/youtube-player.js";
import { getAllPatterns, saveCustomPattern, getActivePattern, setActivePattern } from "../breath-patterns.js";
import { MINDFULNESS_JOURNEYS } from "../journeys.js";

export function initSanctuaryModal(onPatternChanged, onTimerChanged) {
	const modal = document.getElementById("sanctuary-modal");
	const openBtn = document.getElementById("btn-sanctuary-modal");
	const closeBtn = document.getElementById("sanctuary-modal-close");

	const tabBtns = document.querySelectorAll(".sanctuary-tab-btn");
	const tabContents = document.querySelectorAll(".sanctuary-tab-content");

	const patternList = document.getElementById("pattern-list");
	const customForm = document.getElementById("custom-breath-form");

	const volumeSlider = document.getElementById("master-volume");
	const volumeValLabel = document.getElementById("volume-val");
	const ambientSlider = document.getElementById("ambient-volume");
	const ambientValLabel = document.getElementById("ambient-val");
	const dualAudioToggle = document.getElementById("dual-audio-toggle");

	const journeysGrid = document.getElementById("journeys-preset-grid");
	const youtubeGrid = document.getElementById("youtube-preset-grid");
	const youtubeInput = document.getElementById("youtube-audio-url");
	const loadYoutubeBtn = document.getElementById("btn-load-youtube-url");
	const chimeToggle = document.getElementById("guidance-chime");

	// Tab Switcher
	tabBtns.forEach(btn => {
		btn.addEventListener("click", () => {
			const targetTab = btn.dataset.tab;
			tabBtns.forEach(b => b.classList.remove("active"));
			tabContents.forEach(c => c.classList.remove("active"));

			btn.classList.add("active");
			const activeContent = document.getElementById(`tab-${targetTab}`);
			if (activeContent) activeContent.classList.add("active");
		});
	});

	// Timer Pills Sync
	function syncTimerPills(currentDur) {
		const pills = document.querySelectorAll(".timer-pill");
		pills.forEach(pill => {
			const val = parseInt(pill.dataset.value, 10);
			if (val === currentDur) {
				pill.classList.add("active");
			} else {
				pill.classList.remove("active");
			}
		});
	}

	// Render Breath Patterns
	function renderBreathPatterns() {
		if (!patternList) return;
		patternList.innerHTML = "";
		const activePat = getActivePattern();
		const patterns = getAllPatterns();

		patterns.forEach(pat => {
			const card = document.createElement("div");
			card.className = `pattern-card ${activePat.id === pat.id ? "active" : ""}`;
			card.dataset.id = pat.id;

			card.innerHTML = `
				<div class="pattern-card-title">${pat.name}</div>
				<div class="pattern-card-detail">${pat.detail}</div>
				<div class="pattern-card-desc">${pat.description || pat.desc || ""}</div>
			`;

			card.addEventListener("click", () => {
				setActivePattern(pat.id);
				state.activePattern = pat;
				renderBreathPatterns();
				if (onPatternChanged) onPatternChanged(pat);
				modal.classList.remove("open");
			});

			patternList.appendChild(card);
		});
	}

	// Render Journeys
	function renderJourneys() {
		if (!journeysGrid) return;
		journeysGrid.innerHTML = "";

		MINDFULNESS_JOURNEYS.forEach(j => {
			const card = document.createElement("div");
			card.className = "journey-card";
			card.innerHTML = `
				<div class="journey-card-badge">${j.badge}</div>
				<div class="journey-card-title">${j.title}</div>
				<div class="journey-card-subtitle">${j.subtitle}</div>
				<div class="journey-card-desc">${j.desc}</div>
			`;

			card.addEventListener("click", () => {
				setActivePattern(j.patternId);
				state.activePattern = { id: j.patternId, name: j.title, detail: j.subtitle };

				state.sessionDuration = j.duration;
				state.sessionTimeRemaining = j.duration;
				syncTimerPills(j.duration);
				if (onTimerChanged) onTimerChanged(j.duration);

				if (j.audioMode === "youtube-music" && j.youtubeUrl) {
					const vid = extractYouTubeId(j.youtubeUrl);
					if (vid) {
						state.youtubeUrl = j.youtubeUrl;
						state.youtubeVideoId = vid;
						state.audioSource = "youtube-music";
					}
				} else {
					state.audioSource = j.audioMode;
				}

				const pillBtn = document.querySelector(`.mode-pill[data-mode="${j.spaceMode}"]`);
				if (pillBtn) pillBtn.click();

				renderBreathPatterns();
				modal.classList.remove("open");
			});

			journeysGrid.appendChild(card);
		});
	}

	// Render YouTube Presets
	function renderYouTubePresets() {
		if (!youtubeGrid) return;
		youtubeGrid.innerHTML = "";

		YOUTUBE_PRESETS.forEach(track => {
			const card = document.createElement("div");
			card.className = `yt-card ${state.audioSource === "youtube-music" && state.youtubeVideoId === track.id ? "active" : ""}`;
			card.dataset.id = track.id;

			card.innerHTML = `
				<img src="https://img.youtube.com/vi/${track.id}/hqdefault.jpg" alt="${track.title}" class="yt-card-thumb" loading="lazy" />
				<div class="yt-card-info">
					<div class="yt-card-title">${track.title}</div>
					<div class="yt-card-subtitle">${track.subtitle}</div>
				</div>
			`;

			card.addEventListener("click", () => {
				state.youtubeVideoId = track.id;
				state.youtubeUrl = track.url;
				state.audioSource = "youtube-music";

				const ytRadio = document.querySelector('input[name="audio-source"][value="youtube-music"]');
				if (ytRadio) ytRadio.checked = true;

				document.querySelectorAll(".yt-card").forEach(c => c.classList.remove("active"));
				card.classList.add("active");

				if (state.isActive) {
					audioEngine.startAudioForMode(state.mode);
				}
				modal.classList.remove("open");
			});

			youtubeGrid.appendChild(card);
		});
	}

	renderBreathPatterns();
	renderJourneys();
	renderYouTubePresets();

	// Modal Open & Close Event Handlers
	if (openBtn) {
		openBtn.addEventListener("click", () => {
			modal.classList.add("open");
			modal.setAttribute("aria-hidden", "false");
			renderBreathPatterns();
			renderJourneys();
			renderYouTubePresets();
			syncTimerPills(state.sessionDuration);
		});
	}

	if (closeBtn) {
		closeBtn.addEventListener("click", () => {
			modal.classList.remove("open");
			modal.setAttribute("aria-hidden", "true");
		});
	}

	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.classList.remove("open");
			modal.setAttribute("aria-hidden", "true");
		}
	});

	// Custom Breath Builder Form
	if (customForm) {
		customForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const name = document.getElementById("custom-name").value.trim() || "Custom Pattern";
			const inh = parseFloat(document.getElementById("custom-inhale").value) || 4;
			const holdIn = parseFloat(document.getElementById("custom-hold-in").value) || 0;
			const exh = parseFloat(document.getElementById("custom-exhale").value) || 4;
			const holdOut = parseFloat(document.getElementById("custom-hold-out").value) || 0;
			const doubleInhale = document.getElementById("custom-double-inhale").checked;

			const savedPat = saveCustomPattern({
				name,
				inhale: inh,
				holdIn,
				exhale: exh,
				holdOut,
				doubleInhale
			});

			setActivePattern(savedPat.id);
			state.activePattern = savedPat;
			renderBreathPatterns();
			if (onPatternChanged) onPatternChanged(savedPat);
			modal.classList.remove("open");
		});
	}

	// Master volume slider
	if (volumeSlider) {
		volumeSlider.addEventListener("input", (e) => {
			const val = parseFloat(e.target.value);
			if (volumeValLabel) volumeValLabel.textContent = Math.round(val * 100) + "%";
			audioEngine.setMasterVolume(val);
		});
	}

	// Ambient Layer Volume Slider
	if (ambientSlider) {
		ambientSlider.addEventListener("input", (e) => {
			const val = parseFloat(e.target.value);
			if (ambientValLabel) ambientValLabel.textContent = Math.round(val * 100) + "%";
			audioEngine.setAmbientVolume(val);
		});
	}

	// Dual Audio Toggle
	if (dualAudioToggle) {
		dualAudioToggle.addEventListener("change", (e) => {
			state.dualAudioEnabled = e.target.checked;
			if (state.isActive) {
				audioEngine.startAudioForMode(state.mode);
			}
		});
	}

	// Radio source selectors
	const sourceRadios = document.querySelectorAll('input[name="audio-source"]');
	sourceRadios.forEach(radio => {
		radio.addEventListener("change", (e) => {
			state.audioSource = e.target.value;
			renderYouTubePresets();

			if (state.isActive) {
				audioEngine.startAudioForMode(state.mode);
			}
		});
	});

	// YouTube Music Custom URL loader
	if (loadYoutubeBtn) {
		loadYoutubeBtn.addEventListener("click", (e) => {
			e.preventDefault();
			const url = youtubeInput.value.trim();
			const videoId = extractYouTubeId(url);
			if (videoId) {
				state.youtubeUrl = url;
				state.youtubeVideoId = videoId;
				state.audioSource = "youtube-music";
				
				const ytRadio = document.querySelector('input[name="audio-source"][value="youtube-music"]');
				if (ytRadio) ytRadio.checked = true;

				renderYouTubePresets();

				if (state.isActive) {
					audioEngine.startAudioForMode(state.mode);
				}
				modal.classList.remove("open");
			} else {
				alert("Please enter a valid YouTube Music link (e.g. https://music.youtube.com/watch?v=...)");
			}
		});
	}

	// Session Duration Timer Pills
	const timerPills = document.querySelectorAll(".timer-pill");
	timerPills.forEach(pill => {
		pill.addEventListener("click", () => {
			const dur = parseInt(pill.dataset.value, 10);
			state.sessionDuration = dur;
			state.sessionTimeRemaining = dur;
			syncTimerPills(dur);
			if (onTimerChanged) onTimerChanged(dur);
		});
	});

	// Guidance chime toggle
	if (chimeToggle) {
		chimeToggle.addEventListener("change", (e) => {
			state.guidanceChime = e.target.checked;
		});
	}
}
