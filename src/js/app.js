import { state } from "./state.js";
import { T, AFFIRMATIONS } from "./themes.js";
import { getActivePattern, setActivePattern, getDefaultPatternForMode } from "./breath-patterns.js";
import { initCanvas, renderFrame, spawnRipple } from "./visuals/canvas-renderer.js";
import { audioEngine } from "./audio/audio-engine.js";
import { haptics } from "./haptics.js";
import { initBreathModal } from "./ui/breath-modal.js";
import { initMusicModal } from "./ui/music-modal.js";

const cueN = {
	inhale: "inhale slowly",
	hold: "hold gently",
	exhale: "exhale fully"
};

let affTo = null;
let affIdx = 0;

function eio(t) {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function buildHeroText(lines, tag) {
	const h1 = document.getElementById("h1-text");
	if (!h1) return;
	h1.innerHTML = "";
	state.charData = [];
	const th = T[state.mode];

	lines.forEach((lineText, li) => {
		const lineEl = document.createElement("div");
		lineEl.style.cssText = "display:block;text-align:center;";
		const words = lineText.split(" ");
		words.forEach((w, wi) => {
			if (wi > 0) {
				const sp = document.createElement("span");
				sp.className = "word-space";
				lineEl.appendChild(sp);
			}
			const wrap = document.createElement("span");
			wrap.className = "word-wrap";
			lineEl.appendChild(wrap);
			[...w].forEach((ch, ci) => {
				const s = document.createElement("span");
				s.className = "char";
				s.textContent = ch;
				s.style.color = th.textMain;
				wrap.appendChild(s);
				state.charData.push({
					el: s,
					line: li,
					word: wi,
					idx: ci,
					phase: Math.random() * Math.PI * 2,
					freq: 0.00036 + Math.random() * 0.00025,
					amp: 3 + Math.random() * 5.5
				});
			});
		});
		h1.appendChild(lineEl);
	});

	const allChars = h1.querySelectorAll(".word-wrap:last-child .char");
	allChars.forEach((c) => (c.style.color = th.accentHex));

	const tgEl = document.getElementById("tagline-text");
	if (tgEl) {
		tgEl.textContent = tag;
		tgEl.style.color = th.textDim;
	}
}

function buildCueText(txt) {
	const el = document.getElementById("cue");
	if (!el) return;
	el.innerHTML = "";
	state.cueChars = [];
	[...txt].forEach((ch, i) => {
		if (ch === " ") {
			el.appendChild(document.createTextNode(" "));
			return;
		}
		const s = document.createElement("span");
		s.className = "cue-char";
		s.textContent = ch;
		el.appendChild(s);
		state.cueChars.push({
			el: s,
			i,
			phase: i * 0.17,
			freq: 0.00046 + i * 0.000016,
			amp: 2 + Math.random() * 3
		});
	});
	el.style.color = T[state.mode].cueCol;
}

function addBreathBar() {
	const barBox = document.getElementById("bar-counter");
	if (!barBox || barBox.children.length >= 24) return;
	const th = T[state.mode];
	const c = barBox.children.length;
	const h = Math.round(2 + (30 - 2) * ((c + 1) / 24));
	const b = document.createElement("div");
	b.className = "breath-bar";
	b.style.height = "0";
	b.style.background = th.barCol;
	barBox.appendChild(b);
	requestAnimationFrame(() => {
		b.style.height = h + "px";
	});
}

function clearBars() {
	const barBox = document.getElementById("bar-counter");
	if (!barBox) return;
	while (barBox.firstChild) barBox.removeChild(barBox.firstChild);
}

function startAff() {
	const affEl = document.getElementById("affirmation");
	const affTxt = document.getElementById("affirmation-text");
	if (!affEl || !affTxt) return;

	affIdx = Math.floor(Math.random() * AFFIRMATIONS.length);
	affTxt.style.color = T[state.mode].cueCol;
	affEl.style.transition = "opacity 2.2s ease";

	function nextAff() {
		affEl.style.opacity = "0";
		setTimeout(() => {
			affTxt.textContent = AFFIRMATIONS[affIdx % AFFIRMATIONS.length];
			affIdx++;
			affEl.style.opacity = "1";
		}, 1400);
		affTo = setTimeout(nextAff, 13000);
	}

	nextAff();
}

function stopAff() {
	clearTimeout(affTo);
	const affEl = document.getElementById("affirmation");
	if (affEl) affEl.style.opacity = "0";
}

function applyTheme(m) {
	const th = T[m];
	document.body.dataset.theme = m;

	document.documentElement.style.setProperty("--theme-accent", th.accentHex);
	document.documentElement.style.setProperty("--theme-accent-rgb", th.accent.join(","));
	document.documentElement.style.setProperty("--theme-bg", th.bg);
	document.documentElement.style.setProperty("--tool-btn-bg", th.toolBtnBg || "rgba(0, 0, 0, 0.45)");

	document.body.style.background = th.bg;
	const vigEl = document.getElementById("vig");
	if (vigEl) {
		vigEl.style.background = `radial-gradient(ellipse at 50% 50%, transparent 14%, ${th.vigA} 56%, ${th.vigB} 100%)`;
	}

	const dotEl = document.getElementById("dot");
	const ringEl = document.getElementById("ring");
	if (dotEl) dotEl.style.background = th.dotCol;
	if (ringEl) ringEl.style.border = `1px solid ${th.ringCol}`;

	const slPat = document.getElementById("sl-pattern");
	const slDet = document.getElementById("sl-detail");

	if (slPat) slPat.style.color = th.slPat;
	if (slDet) slDet.style.color = th.slDet;

	const nav = document.getElementById("mode-track");
	const thumb = document.getElementById("mode-thumb");
	if (nav) {
		nav.style.background = th.navBg;
		nav.style.borderColor = th.navBorder;
	}
	if (thumb) {
		thumb.style.background = th.pillActiveBg || th.accentHex;
	}

	document.querySelectorAll(".mode-pill").forEach((p) => {
		const isAct = p.dataset.mode === m;
		p.style.color = isAct ? th.pillActive : th.pillDim;
		p.style.background = "transparent"; // Button background is transparent so #mode-thumb is the single sliding indicator
		p.style.fontWeight = isAct ? "700" : "400";
	});

	const labelEl = document.getElementById("btn-label");
	const [rr, rg, rb] = th.accent;
	if (labelEl) {
		labelEl.style.color = m === "classical" ? "#8c1426" : `rgba(${Math.min(rr + 40, 255)},${Math.min(rg + 40, 255)},${Math.min(rb + 40, 255)},.9)`;
	}

	const fl = document.getElementById("mode-flash");
	if (fl) {
		fl.style.background = th.flashCol;
		fl.classList.add("pop");
		setTimeout(() => fl.classList.remove("pop"), 200);
	}
}

function updateSessionLabel() {
	const pattern = state.activePattern || getActivePattern();
	const slPat = document.getElementById("sl-pattern");
	const slDet = document.getElementById("sl-detail");
	if (slPat) slPat.textContent = pattern.name;
	if (slDet) {
		if (state.sessionDuration > 0 && state.isActive) {
			const rem = Math.max(0, Math.ceil(state.sessionTimeRemaining));
			const mins = Math.floor(rem / 60);
			const secs = rem % 60;
			const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
			slDet.textContent = `${pattern.detail} · ${timeStr}`;
		} else if (state.sessionDuration > 0) {
			const mins = Math.floor(state.sessionDuration / 60);
			slDet.textContent = `${pattern.detail} · ${mins}m target`;
		} else {
			slDet.textContent = `${pattern.detail} · open session`;
		}
	}
}

function startSession() {
	state.isActive = true;
	document.body.classList.add("active");
	state.textAnim = Math.floor(Math.random() * 6);
	const th = T[state.mode];

	state.phase = 0;
	state.timer = 0;
	state.breathCount = 0;
	state.sessionTimeRemaining = state.sessionDuration;
	clearBars();

	updateSessionLabel();
	buildHeroText(th.heroAct, th.tagAct);
	buildCueText("inhale slowly");

	const labelEl = document.getElementById("btn-label");
	if (labelEl) labelEl.textContent = "Stop";

	const ir1 = document.getElementById("ir1");
	const ir2 = document.getElementById("ir2");
	if (ir1) ir1.style.animation = "none";
	if (ir2) ir2.style.animation = "none";

	audioEngine.startAudioForMode(state.mode);
	haptics.triggerPhaseChange();

	if (state.mode === "anxiety") startAff();
}

function stopSession() {
	state.isActive = false;
	document.body.classList.remove("active");
	const th = T[state.mode];

	state.phase = 0;
	state.timer = 0;
	state.bs = 0;
	state.exhaleVal = 0;

	buildHeroText(th.heroIdle, th.tagIdle);
	buildCueText(th.cueStart);

	const labelEl = document.getElementById("btn-label");
	const fillEl = document.getElementById("btn-fill");
	if (labelEl) labelEl.textContent = "Begin";
	if (fillEl) {
		fillEl.style.transform = "scale(1)";
		fillEl.style.boxShadow = "";
	}

	const ir1 = document.getElementById("ir1");
	const ir2 = document.getElementById("ir2");
	if (ir1) ir1.style.animation = "";
	if (ir2) ir2.style.animation = "";

	audioEngine.stopAudio();
	stopAff();

	const trackName = document.getElementById("track-name");
	if (trackName) trackName.classList.remove("show");
	updateSessionLabel();
}

function posThumb(p) {
	const trk = document.getElementById("mode-track");
	const thm = document.getElementById("mode-thumb");
	if (!trk || !thm || !p) return;

	thm.style.left = p.offsetLeft + "px";
	thm.style.width = p.offsetWidth + "px";

	try {
		p.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
	} catch (e) {}
}

let lastTime = 0;
function renderLoop(ts) {
	const dt = Math.min(ts - lastTime, 50);
	lastTime = ts;

	const th = T[state.mode];
	const [ar, ag, ab] = th.accent;
	const currentPattern = state.activePattern || getActivePattern();
	const phs = currentPattern.phases;

	if (state.isActive) {
		state.timer += dt * 0.001;

		// Session Duration Countdown Timer
		if (state.sessionDuration > 0) {
			state.sessionTimeRemaining -= dt * 0.001;
			updateSessionLabel();

			if (state.sessionTimeRemaining <= 0) {
				state.sessionTimeRemaining = 0;
				stopSession();
				const targetMins = Math.floor(state.sessionDuration / 60);
				buildHeroText(["session", "complete"], `${targetMins} minutes of peace & clarity`);
				buildCueText("rest in gentle stillness");
				return;
			}
		}

		const ph = phs[state.phase] || phs[0];
		const prog = Math.min(state.timer / ph.d, 1);

		if (ph.n === "inhale") state.bs = eio(prog);
		else if (ph.n === "hold") state.bs = 1;
		else if (ph.n === "exhale") state.bs = 1 - eio(prog);
		else state.bs = 0;

		if (state.timer >= ph.d) {
			state.timer = 0;
			state.phase = (state.phase + 1) % phs.length;

			if (state.phase === 0) {
				state.breathCount++;
				addBreathBar();
			}

			const nextPh = phs[state.phase];
			buildCueText(cueN[nextPh.n] || "hold gently");
			haptics.triggerPhaseChange();
		}

		audioEngine.updateBreathWave(state.bs, phs[state.phase].n);
		haptics.triggerPhaseHaptic(phs[state.phase].n, state.bs);
	} else {
		state.bs = (0.5 + 0.5 * Math.sin(ts * 0.00068)) * 0.3;
	}

	const currentPh = phs[state.phase] || phs[0];
	state.exhaleVal += ((!state.isActive ? 0 : currentPh && currentPh.n === "exhale" ? Math.min(state.timer / currentPh.d, 1) * 0.85 : 0) - state.exhaleVal) * (1 - Math.exp(-dt * 0.003));

	renderFrame(ts);

	const fillEl = document.getElementById("btn-fill");
	if (fillEl) {
		const sc = 0.68 + state.bs * 0.78;
		const bri = Math.round(state.bs * 90);
		const alpha = 0.04 + state.bs * 0.24;
		const btnPulse = 1 + state.clickImpulse * 0.04;

		fillEl.style.transform = `scale(${(sc * btnPulse).toFixed(3)})`;
		fillEl.style.background = `radial-gradient(circle at 40% 36%, rgba(${ar},${Math.min((ag + bri * 0.6) | 0, 255)},${Math.min((ab + bri * 0.3) | 0, 255)},${alpha + 0.14}) 0%, rgba(${(ar * 0.88) | 0},${Math.min((ag + bri * 0.35) | 0, 255)},${Math.min((ab + bri * 0.18) | 0, 255)},${alpha + 0.07}) 50%, rgba(${(ar * 0.62) | 0},${(ag * 0.58) | 0},${(ab * 0.48) | 0},${alpha * 0.5}) 100%)`;
		fillEl.style.borderColor = `rgba(${ar},${ag},${ab},${0.18 + state.bs * 0.58 + state.clickImpulse * 0.2})`;
		fillEl.style.boxShadow = `0 0 ${14 + state.bs * 62 + state.clickImpulse * 20}px rgba(${ar},${ag},${ab},${0.07 + state.bs * 0.25 + state.clickImpulse * 0.1}),0 0 ${30 + state.bs * 100}px rgba(${ar},${ag},${ab},${0.02 + state.bs * 0.09})`;
	}

	requestAnimationFrame(renderLoop);
}

function bootstrap() {
	initCanvas();
	state.activePattern = getDefaultPatternForMode(state.mode);
	setActivePattern(state.activePattern.id);

	const initTh = T[state.mode];
	state.sessionDuration = initTh.defaultDuration || 300;
	state.sessionTimeRemaining = state.sessionDuration;

	applyTheme(state.mode);
	buildHeroText(initTh.heroIdle, initTh.tagIdle);
	buildCueText(initTh.cueStart);
	updateSessionLabel();

	// PWA Service Worker Registration
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker.register("./sw.js")
				.then((reg) => console.log("[Service Worker] Registered:", reg.scope))
				.catch((err) => console.warn("[Service Worker] Reg failed:", err));
		});
	}

	// Mobile scroll hint fade listener
	const trk = document.getElementById("mode-track");
	const hint = document.getElementById("scroll-hint-right");
	if (trk && hint) {
		trk.addEventListener("scroll", () => {
			if (trk.scrollLeft + trk.clientWidth >= trk.scrollWidth - 12) {
				hint.style.opacity = "0";
			} else {
				hint.style.opacity = "0.85";
			}
		});
	}

	// Mode Pill Listeners
	document.querySelectorAll(".mode-pill").forEach((p) => {
		p.addEventListener("click", () => {
			if (p.dataset.mode === state.mode) return;
			if (state.isActive) stopSession();

			state.mode = p.dataset.mode;
			state.activePattern = getDefaultPatternForMode(state.mode);
			setActivePattern(state.activePattern.id);

			const newTh = T[state.mode];
			state.sessionDuration = newTh.defaultDuration || 300;
			state.sessionTimeRemaining = state.sessionDuration;

			const timerPills = document.querySelectorAll(".timer-pill");
			timerPills.forEach(pill => {
				const val = parseInt(pill.dataset.value, 10);
				if (val === state.sessionDuration) {
					pill.classList.add("active");
				} else {
					pill.classList.remove("active");
				}
			});

			applyTheme(state.mode);
			posThumb(p);
			state.textAnim = Math.floor(Math.random() * 6);

			buildHeroText(state.isActive ? newTh.heroAct : newTh.heroIdle, state.isActive ? newTh.tagAct : newTh.tagIdle);
			buildCueText(newTh.cueStart);
			updateSessionLabel();
			clearBars();

			const trackName = document.getElementById("track-name");
			if (trackName) trackName.classList.remove("show");
		});

		const ringEl = document.getElementById("ring");
		p.addEventListener("mouseenter", () => {
			if (ringEl) {
				ringEl.style.width = "50px";
				ringEl.style.height = "50px";
			}
		});
		p.addEventListener("mouseleave", () => {
			if (ringEl) {
				ringEl.style.width = "26px";
				ringEl.style.height = "26px";
			}
		});
	});

	// Breath Button Toggle
	const breathBtn = document.getElementById("breath-btn");
	const ringEl = document.getElementById("ring");

	if (breathBtn) {
		breathBtn.addEventListener("click", () => {
			state.isActive ? stopSession() : startSession();
		});
		breathBtn.addEventListener("mouseenter", () => {
			if (ringEl) {
				ringEl.style.width = "84px";
				ringEl.style.height = "84px";
			}
		});
		breathBtn.addEventListener("mouseleave", () => {
			if (ringEl) {
				ringEl.style.width = "26px";
				ringEl.style.height = "26px";
			}
		});
	}

	// Click ripples
	document.addEventListener("click", (e) => {
		if (e.target.closest("#mode-switcher") || e.target.closest("#breath-btn") || e.target.closest(".modal-card") || e.target.closest("#tool-bar")) return;
		spawnRipple(e.clientX, e.clientY);
	});

	// Keyboard Shortcuts
	document.addEventListener("keydown", (e) => {
		if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

		if (e.code === "Space") {
			e.preventDefault();
			state.isActive ? stopSession() : startSession();
		} else if (e.code === "KeyB") {
			const btn = document.getElementById("btn-breath-modal");
			if (btn) btn.click();
		} else if (e.code === "KeyM") {
			const btn = document.getElementById("btn-music-modal");
			if (btn) btn.click();
		}
	});

	// Modals initialization
	initBreathModal((newPattern) => {
		updateSessionLabel();
	});
	initMusicModal((dur) => {
		updateSessionLabel();
	});

	setTimeout(() => {
		const activePill = document.querySelector('.mode-pill[data-mode="breathe"]');
		if (activePill) posThumb(activePill);
	}, 60);

	setTimeout(() => {
		const hero = document.getElementById("hero");
		if (hero) hero.classList.add("in");
	}, 140);

	setTimeout(() => {
		const btnWrap = document.getElementById("btn-wrap");
		const cue = document.getElementById("cue");
		const sessionLbl = document.getElementById("session-label");
		const barCounter = document.getElementById("bar-counter");

		if (btnWrap) btnWrap.classList.add("in");
		if (cue) cue.classList.add("show");
		if (sessionLbl) sessionLbl.classList.add("show");
		if (barCounter) barCounter.classList.add("show");
	}, 560);

	window.addEventListener("resize", () => {
		const activePill = document.querySelector(`.mode-pill[data-mode="${state.mode}"]`);
		if (activePill) posThumb(activePill);
	});

	requestAnimationFrame(renderLoop);
}

window.addEventListener("load", bootstrap);
