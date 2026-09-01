import { FONT_AURAS, getActiveFontAura, applyFontAura } from "../fonts.js";

export function initFontModal(onFontChanged) {
	const modal = document.getElementById("font-modal");
	const openBtn = document.getElementById("btn-font-modal");
	const closeBtn = document.getElementById("font-modal-close");
	const grid = document.getElementById("font-aura-grid");

	openBtn.addEventListener("click", () => {
		renderFontList();
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

	function renderFontList() {
		grid.innerHTML = "";
		const activeAura = getActiveFontAura();

		FONT_AURAS.forEach((aura) => {
			const isActive = activeAura.id === aura.id;
			const card = document.createElement("div");
			card.className = `pattern-card ${isActive ? "active" : ""}`;

			card.innerHTML = `
				<div class="pattern-card-title" style="font-family: ${aura.displayFont}; font-size: 1.3rem;">${aura.name}</div>
				<div class="pattern-card-detail" style="font-family: ${aura.uiFont}; font-size: 0.62rem; margin-top: 0.2rem;">${aura.subtitle}</div>
				<div class="pattern-card-desc" style="margin-top: 0.5rem;">${aura.description}</div>
				<div style="margin-top: 0.8rem;">
					<button class="select-btn secondary-btn" style="padding: 0.4rem 0.8rem; font-size: 0.6rem;">${isActive ? "Active Aura" : "Apply Aura"}</button>
				</div>
			`;

			const selectBtn = card.querySelector(".select-btn");
			selectBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				applyFontAura(aura.id);
				renderFontList();
				if (onFontChanged) onFontChanged(aura);
			});

			grid.appendChild(card);
		});
	}
}
