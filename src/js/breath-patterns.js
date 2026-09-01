import { state } from "./state.js";
import { T } from "./themes.js";

const PRESET_PATTERNS = [
	{
		id: "preset-box",
		name: "Box Breathing",
		detail: "4 · 4 · 4 · 4",
		description: "Equalized rhythm used by Navy SEALs to regain focus and calm under pressure.",
		isPreset: true,
		doubleInhale: false,
		phases: [
			{ n: "inhale", d: 4 },
			{ n: "hold", d: 4 },
			{ n: "exhale", d: 4 },
			{ n: "hold", d: 4 }
		]
	},
	{
		id: "preset-478",
		name: "4–7–8 Breath",
		detail: "4 · 7 · 8",
		description: "Natural tranquilizer for the nervous system. Deeply relaxes for sleep & anxiety relief.",
		isPreset: true,
		doubleInhale: false,
		phases: [
			{ n: "inhale", d: 4 },
			{ n: "hold", d: 7 },
			{ n: "exhale", d: 8 }
		]
	},
	{
		id: "preset-sigh",
		name: "Physiological Sigh",
		detail: "2 · 1 · 4",
		description: "Stanford Neurobiology method: fast stress release via double-inhale and long exhale.",
		isPreset: true,
		doubleInhale: true,
		phases: [
			{ n: "inhale", d: 2 },
			{ n: "hold", d: 1 },
			{ n: "exhale", d: 4 }
		]
	},
	{
		id: "preset-coherence",
		name: "Coherence Breath",
		detail: "5.5 · 5.5",
		description: "Optimizes Heart Rate Variability (HRV) and synchronizes heart, lungs, and mind.",
		isPreset: true,
		doubleInhale: false,
		phases: [
			{ n: "inhale", d: 5.5 },
			{ n: "exhale", d: 5.5 }
		]
	},
	{
		id: "preset-calm",
		name: "Calm Breath",
		detail: "4 · 4 · 6",
		description: "Extended exhale triggers parasympathetic nervous system for grounding.",
		isPreset: true,
		doubleInhale: false,
		phases: [
			{ n: "inhale", d: 4 },
			{ n: "hold", d: 4 },
			{ n: "exhale", d: 6 }
		]
	},
	{
		id: "preset-711",
		name: "Deep Focus 7–11",
		detail: "4 · 7",
		description: "Inhale 4s, Exhale 7s to lower heart rate and sharpen cognitive clarity.",
		isPreset: true,
		doubleInhale: false,
		phases: [
			{ n: "inhale", d: 4 },
			{ n: "exhale", d: 7 }
		]
	}
];

const LOCAL_STORAGE_KEY = "digital_sanctuary_custom_patterns";
const ACTIVE_PATTERN_KEY = "digital_sanctuary_active_pattern_id";

export function getPresets() {
	return PRESET_PATTERNS;
}

export function getCustomPatterns() {
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		console.warn("Failed to read custom patterns from localStorage", e);
		return [];
	}
}

export function getAllPatterns() {
	return [...PRESET_PATTERNS, ...getCustomPatterns()];
}

export function saveCustomPattern(data) {
	const customList = getCustomPatterns();
	const newId = "custom-" + Date.now();
	
	const phases = [];
	if (data.inhale > 0) phases.push({ n: "inhale", d: Number(data.inhale) });
	if (data.holdIn > 0) phases.push({ n: "hold", d: Number(data.holdIn) });
	if (data.exhale > 0) phases.push({ n: "exhale", d: Number(data.exhale) });
	if (data.holdOut > 0) phases.push({ n: "hold", d: Number(data.holdOut) });

	const detailParts = phases.map(p => p.d);
	const detailStr = detailParts.join(" · ");

	const pattern = {
		id: newId,
		name: data.name,
		detail: detailStr,
		description: `Custom User Pattern (${detailStr}s)`,
		isPreset: false,
		doubleInhale: !!data.doubleInhale,
		phases: phases
	};

	customList.push(pattern);
	try {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
	} catch (e) {
		console.error("Failed to save custom pattern", e);
	}
	return pattern;
}

export function deleteCustomPattern(id) {
	let customList = getCustomPatterns();
	customList = customList.filter(p => p.id !== id);
	try {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
	} catch (e) {
		console.error("Failed to delete custom pattern", e);
	}
}

export function getDefaultPatternForMode(modeKey) {
	const all = getAllPatterns();
	const themeDef = T[modeKey];
	if (themeDef && themeDef.defaultPattern) {
		const found = all.find(p => p.name === themeDef.defaultPattern);
		if (found) return found;
	}
	return PRESET_PATTERNS[0];
}

export function getActivePattern() {
	const all = getAllPatterns();
	const activeId = localStorage.getItem(ACTIVE_PATTERN_KEY);
	if (activeId) {
		const found = all.find(p => p.id === activeId);
		if (found) return found;
	}
	return PRESET_PATTERNS[0];
}

export function setActivePattern(id) {
	const all = getAllPatterns();
	const found = all.find(p => p.id === id);
	if (found) {
		localStorage.setItem(ACTIVE_PATTERN_KEY, id);
		state.activePattern = found;
		return found;
	}
	return getActivePattern();
}
