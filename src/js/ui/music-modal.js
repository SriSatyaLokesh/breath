import { state } from "../state.js";
import { audioEngine } from "../audio/audio-engine.js";
import { extractYouTubeId } from "../audio/youtube-player.js";

export function initMusicModal(onTimerChanged) {
	const modal = document.getElementById("music-modal");
	const openBtn = document.getElementById("btn-music-modal");
	const closeBtn = document.getElementById("music-modal-close");

	const volumeSlider = document.getElementById("master-volume");
	const volumeValLabel = document.getElementById("volume-val");
	
	const youtubeContainer = document.getElementById("youtube-url-container");
	const youtubeInput = document.getElementById("youtube-audio-url");
	const loadYoutubeBtn = document.getElementById("btn-load-youtube-url");
	
	const timerSelect = document.getElementById("session-timer-select");
	const chimeToggle = document.getElementById("guidance-chime");

	openBtn.addEventListener("click", () => {
		modal.classList.add("open");
		modal.setAttribute("aria-hidden", "false");
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
			if (state.audioSource === "youtube-music") {
				if (youtubeContainer) youtubeContainer.classList.remove("hidden");
			} else {
				if (youtubeContainer) youtubeContainer.classList.add("hidden");
			}

			if (state.isActive) {
				audioEngine.startAudioForMode(state.mode);
			}
		});
	});

	// YouTube Music URL loader
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
