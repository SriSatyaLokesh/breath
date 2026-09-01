import { state } from "../state.js";

let player = null;
let isApiReady = false;
let pendingVideoId = null;

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
