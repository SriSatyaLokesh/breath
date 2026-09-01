import { state } from "../state.js";
import { getPresets, getCustomPatterns, saveCustomPattern, deleteCustomPattern, setActivePattern } from "../breath-patterns.js";

export function initBreathModal(onPatternChanged) {
	const modal = document.getElementById("breath-modal");
	const openBtn = document.getElementById("btn-breath-modal");
	const closeBtn = document.getElementById("breath-modal-close");
	const patternGrid = document.getElementById("pattern-list");
	const customForm = document.getElementById("custom-breath-form");

	openBtn.addEventListener("click", () => {
		renderPatternList();
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

	function renderPatternList() {
		patternGrid.innerHTML = "";
		const presets = getPresets();
		const customs = getCustomPatterns();
		const activePattern = state.activePattern;

		[...presets, ...customs].forEach(p => {
			const card = document.createElement("div");
			const isActive = activePattern && activePattern.id === p.id;
			card.className = `pattern-card ${isActive ? "active" : ""}`;

			card.innerHTML = `
				<div class="pattern-card-title">${p.name} ${!p.isPreset ? '<span style="font-size:0.6rem;opacity:0.6;font-style:normal;">(Custom)</span>' : ''}</div>
				<div class="pattern-card-detail">${p.detail}</div>
				<div class="pattern-card-desc">${p.description}</div>
				<div style="margin-top:0.8rem;display:flex;gap:0.4rem;align-items:center;">
					<button class="select-btn secondary-btn" style="padding:0.4rem 0.8rem;font-size:0.6rem;">${isActive ? 'Active' : 'Select'}</button>
					${!p.isPreset ? `<button class="delete-btn" style="background:transparent;border:none;color:rgba(255,100,100,0.7);cursor:none;font-size:0.75rem;padding:0.2rem;" title="Delete custom pattern">&times;</button>` : ''}
				</div>
			`;

			const selectBtn = card.querySelector(".select-btn");
			selectBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				setActivePattern(p.id);
				renderPatternList();
				if (onPatternChanged) onPatternChanged(p);
			});

			if (!p.isPreset) {
				const deleteBtn = card.querySelector(".delete-btn");
				if (deleteBtn) {
					deleteBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						deleteCustomPattern(p.id);
						if (activePattern.id === p.id) {
							setActivePattern(presets[0].id);
							if (onPatternChanged) onPatternChanged(presets[0]);
						}
						renderPatternList();
					});
				}
			}

			patternGrid.appendChild(card);
		});
	}

	customForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const name = document.getElementById("custom-name").value.trim();
		const inhale = parseFloat(document.getElementById("custom-inhale").value);
		const holdIn = parseFloat(document.getElementById("custom-hold-in").value);
		const exhale = parseFloat(document.getElementById("custom-exhale").value);
		const holdOut = parseFloat(document.getElementById("custom-hold-out").value);
		const doubleInhale = document.getElementById("custom-double-inhale").checked;

		const created = saveCustomPattern({ name, inhale, holdIn, exhale, holdOut, doubleInhale });
		setActivePattern(created.id);
		renderPatternList();
		if (onPatternChanged) onPatternChanged(created);

		modal.classList.remove("open");
		modal.setAttribute("aria-hidden", "true");
	});
}
