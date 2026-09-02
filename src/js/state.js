export const state = {
	mode: "breathe",
	isActive: false,
	phase: 0,
	timer: 0,
	bs: 0,
	breathCount: 0,
	exhaleVal: 0,
	textAnim: 0,
	charData: [],
	cueChars: [],
	
	// Mouse & Drag Physics
	mx: 0.5,
	my: 0.5,
	rmx: 0.5,
	rmy: 0.5,
	pmx: 0.5,
	pmy: 0.5,
	mvx: 0,
	mvy: 0,
	clickImpulse: 0,
	isDragging: false,
	dragEnergy: 0,
	clickRipples: [],
	csx: 0,
	csy: 0,
	crx: 0,
	cry: 0,

	// Breath Pattern State
	activePattern: null,

	// Session Timer State (Duration in seconds, 0 = infinite)
	sessionDuration: 300, // Default 5 Minutes
	sessionTimeRemaining: 300,

	// Audio & Settings State
	masterVolume: 0.7,
	ambientVolume: 0.5,
	dualAudioEnabled: false,
	audioSource: "procedural", // "procedural", "youtube-music", "classical-stream"
	customAudioUrl: "",
	youtubeUrl: "",
	youtubeVideoId: null,
	guidanceChime: true
};
