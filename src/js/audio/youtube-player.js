import { state } from "../state.js";

let player = null;
let isApiReady = false;
let pendingVideoId = null;

export const YOUTUBE_PRESETS = [
	{
		id: "y6lFq2x6YbE",
		url: "https://youtu.be/y6lFq2x6YbE",
		title: "Deep Relaxation & Tranquil Mindfulness",
		subtitle: "Gentle Healing Frequency & Peaceful Ambience"
	},
	{
		id: "3Zmk5G6h-qo",
		url: "https://youtu.be/3Zmk5G6h-qo",
		title: "Deep Ambient Flute & Tanpura",
		subtitle: "Sacred Indian Bamboo Flute & Tanpura Drone"
	},
	{
		id: "iYO8SH-maAc",
		url: "https://youtu.be/iYO8SH-maAc",
		title: "Sacred Om Chanting & Healing",
		subtitle: "Deep Vibrational Om Resonance & Calm"
	},
	{
		id: "Rmh7WcEomg4",
		url: "https://youtu.be/Rmh7WcEomg4",
		title: "Soothing Sitar & Gentle Breeze",
		subtitle: "Traditional Indian Classical Sitar Harmony"
	},
	{
		id: "5XSye4C6sP0",
		url: "https://youtu.be/5XSye4C6sP0",
		title: "528Hz Solfeggio & DNA Repair",
		subtitle: "Miracle Frequency & Deep Mindful Healing"
	},
	{
		id: "RieqLpDhKZg",
		url: "https://www.youtube.com/watch?v=RieqLpDhKZg",
		title: "Nature Rain & Ocean Shore",
		subtitle: "Calming Mountain Rainfall & Ocean Waves"
	},
	{
		id: "6KTnLxmfZWE",
		url: "https://youtu.be/6KTnLxmfZWE",
		title: "Cosmic Delta Wave & Theta Drift",
		subtitle: "Deep Sleep & Unconscious Mind Tranquility"
	},
	{
		id: "w9hqMyHZumU",
		url: "https://youtu.be/w9hqMyHZumU",
		title: "Zen Bamboo Flute & Stream",
		subtitle: "Peaceful Garden Stream & Soft Breeze"
	}
];

export function extractYouTubeId(url) {
	if (!url) return null;
	const trimmed = url.trim();
	const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|music\.youtube\.com\/watch\?v=)([\w-]{11})/);
	return match ? match[1] : null;
}

export function initYouTubeApi() {
	if (window.YT && window.YT.Player) {
		isApiReady = true;
		return;
	}

	if (!document.getElementById("yt-iframe-script")) {
		const tag = document.createElement("script");
		tag.id = "yt-iframe-script";
		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	window.onYouTubeIframeAPIReady = () => {
		isApiReady = true;
		if (pendingVideoId) {
			createPlayer(pendingVideoId);
			pendingVideoId = null;
		}
	};
}

function createPlayer(videoId) {
	const container = document.getElementById("yt-player-element");
	if (!container) return;

	if (player && player.loadVideoById) {
		player.loadVideoById(videoId);
		player.setVolume(Math.round(state.masterVolume * 100));
		player.playVideo();
		return;
	}

	player = new window.YT.Player("yt-player-element", {
		height: "1",
		width: "1",
		videoId: videoId,
		playerVars: {
			autoplay: 1,
			controls: 0,
			disablekb: 1,
			fs: 0,
			loop: 1,
			playlist: videoId,
			modestbranding: 1,
			rel: 0
		},
		events: {
			onReady: (event) => {
				event.target.setVolume(Math.round(state.masterVolume * 100));
				if (state.isActive) {
					event.target.playVideo();
				}
			},
			onError: (event) => {
				console.warn("YouTube Player error:", event.data);
			}
		}
	});
}

export function playYouTubeTrack(videoId) {
	initYouTubeApi();
	if (!videoId) return;

	if (!isApiReady) {
		pendingVideoId = videoId;
		return;
	}

	createPlayer(videoId);
}

export function setYouTubeVolume(vol) {
	if (player && player.setVolume) {
		player.setVolume(Math.round(vol * 100));
	}
}

export function pauseYouTubeTrack() {
	if (player && player.pauseVideo) {
		try {
			player.pauseVideo();
		} catch (e) {}
	}
}

export function stopYouTubeTrack() {
	if (player && player.stopVideo) {
		try {
			player.stopVideo();
		} catch (e) {}
	}
}
