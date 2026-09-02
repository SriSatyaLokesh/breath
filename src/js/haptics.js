// Pulmonary Mobile Haptic Engine using Web Vibration API
export class HapticEngine {
	constructor() {
		this.enabled = true;
		this.lastPulse = 0;
		this.hasHaptics = typeof navigator !== "undefined" && "vibrate" in navigator;
	}

	triggerPhaseHaptic(phaseName, breathState) {
		if (!this.enabled || !this.hasHaptics) return;

		const now = performance.now();

		if (phaseName === "inhale") {
			// Accelerating soft vibration pulse frequency matching breath depth (0 -> 1)
			const interval = Math.max(140, 480 - breathState * 320);
			if (now - this.lastPulse >= interval) {
				const duration = Math.round(15 + breathState * 25);
				try {
					navigator.vibrate(duration);
				} catch (e) {}
				this.lastPulse = now;
			}
		} else if (phaseName === "hold") {
			// Steady gentle ticks during hold
			if (now - this.lastPulse >= 650) {
				try {
					navigator.vibrate(12);
				} catch (e) {}
				this.lastPulse = now;
			}
		} else if (phaseName === "exhale") {
			// De-escalating soft vibration pulse during exhale
			const interval = Math.max(140, 160 + (1 - breathState) * 320);
			if (now - this.lastPulse >= interval) {
				const duration = Math.round(10 + breathState * 20);
				try {
					navigator.vibrate(duration);
				} catch (e) {}
				this.lastPulse = now;
			}
		}
	}

	triggerPhaseChange() {
		if (!this.enabled || !this.hasHaptics) return;
		try {
			navigator.vibrate([35, 40, 25]);
		} catch (e) {}
	}
}

export const haptics = new HapticEngine();
