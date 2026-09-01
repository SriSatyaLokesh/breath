import { state } from "./state.js";

export const FONT_AURAS = [
	{
		id: "haute-editorial",
		name: "Haute Editorial",
		subtitle: "Instrument Serif & Tenor Sans",
		displayFont: "'Instrument Serif', 'Cormorant Garamond', serif",
		uiFont: "'Tenor Sans', 'Syne', sans-serif",
		monoFont: "'DM Mono', monospace",
		description: "High-fashion luxury magazine aesthetic with poetic italics and sculpted geometric UI."
	},
	{
		id: "cosmic-mindfulness",
		name: "Cosmic Sanctuary",
		subtitle: "Bodoni Moda & Plus Jakarta Sans",
		displayFont: "'Bodoni Moda', serif",
		uiFont: "'Plus Jakarta Sans', sans-serif",
		monoFont: "'DM Mono', monospace",
		description: "Haute couture high-contrast serif paired with weightless, hyper-clean modern UI."
	},
	{
		id: "gallery-garamond",
		name: "Gallery Garamond",
		subtitle: "Cormorant Garamond & Syne",
		displayFont: "'Cormorant Garamond', serif",
		uiFont: "'Syne', sans-serif",
		monoFont: "'DM Mono', monospace",
		description: "Classic art-gallery exhibition typography with distinct avant-garde pill buttons."
	},
	{
		id: "literary-zen",
		name: "Literary Zen",
		subtitle: "Newsreader & Plus Jakarta Sans",
		displayFont: "'Newsreader', serif",
		uiFont: "'Plus Jakarta Sans', sans-serif",
		monoFont: "'DM Mono', monospace",
		description: "Warm, organic literary book serif designed for quiet, reflective optical readability."
	},
	{
		id: "architectural-minimal",
		name: "Architectural Minimal",
		subtitle: "Cinzel & Space Grotesk",
		displayFont: "'Cinzel', serif",
		uiFont: "'Space Grotesk', sans-serif",
		monoFont: "'DM Mono', monospace",
		description: "Chiseled Roman proportions paired with mid-century technical geometric UI typography."
	}
];

const STORAGE_FONT_KEY = "digital_sanctuary_active_font_aura";

export function getActiveFontAura() {
	const savedId = localStorage.getItem(STORAGE_FONT_KEY);
	if (savedId) {
		const found = FONT_AURAS.find(f => f.id === savedId);
		if (found) return found;
	}
	return FONT_AURAS[0]; // Default to Haute Editorial
}

export function applyFontAura(auraId) {
	const found = FONT_AURAS.find(f => f.id === auraId) || FONT_AURAS[0];
	localStorage.setItem(STORAGE_FONT_KEY, found.id);
	state.activeFontAura = found;

	document.documentElement.style.setProperty("--font-display", found.displayFont);
	document.documentElement.style.setProperty("--font-ui", found.uiFont);
	document.documentElement.style.setProperty("--font-mono", found.monoFont);

	return found;
}
