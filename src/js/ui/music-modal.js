import { state } from "../state.js";
import { audioEngine } from "../audio/audio-engine.js";
import { extractYouTubeId, YOUTUBE_PRESETS } from "../audio/youtube-player.js";

export function initMusicModal(onTimerChanged) {
	const modal = document.getElementById("music-modal");
	const openBtn = document.getElementById("btn-music-modal");
	const closeBtn = document.getElementById("music-modal-close");

	const volumeSlider = document.getElementById("master-volume");
	const volumeValLabel = document.getElementById("volume-val");
	
	const youtubeGrid = document.getElementById("youtube-preset-grid");
	const youtubeInput = document.getElementById("youtube-audio-url");
	const loadYoutubeBtn = document.getElementById("btn-load-youtube-url");
	
	const timerSelect = document.getElementById("session-timer-select");
	const chimeToggle = document.getElementById("guidance-chime");

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

				// Update radio check
				const ytRadio = document.querySelector('input[name="audio-source"][value="youtube-music"]');
				if (ytRadio) ytRadio.checked = true;

				// Update active state in grid
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

	renderYouTubePresets();

	openBtn.addEventListener("click", () => {
		modal.classList.add("open");
		modal.setAttribute("aria-hidden", "false");
		renderYouTubePresets();
	});

	closeBtn.addEventListener("click", () => {
		modal.classList.remove("open");
		modal.setAttribute("aria-hidden", "true");
	});

	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.classList.remove("open");
			modal.setAttribute("aria-hidden", "true");
		}
	});

	// Volume slider
	volumeSlider.addEventListener("input", (e) => {
		const val = parseFloat(e.target.value);
		volumeValLabel.textContent = Math.round(val * 100) + "%";
		audioEngine.setVolume(val);
	});

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
				
				// Automatically check the YouTube Music radio option
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

	// Session Duration Timer selector
	if (timerSelect) {
		timerSelect.addEventListener("change", (e) => {
			const dur = parseInt(e.target.value, 10);
			state.sessionDuration = dur;
			state.sessionTimeRemaining = dur;
			if (onTimerChanged) onTimerChanged(dur);
		});
	}

	// Guidance chime toggle
	chimeToggle.addEventListener("change", (e) => {
		state.guidanceChime = e.target.checked;
	});
}
