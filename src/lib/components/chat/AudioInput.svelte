<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		AudioRecorder,
		VoiceActivityDetector,
		formatDuration,
		isAudioRecordingSupported,
		requestMicrophonePermission,
		type AudioRecorderResult
	} from '$lib/utils/audio';

	// Props
	interface Props {
		mode?: 'ptt' | 'vad';
		vadSensitivity?: number;
		vadSilenceTimeout?: number;
		maxDuration?: number;
		disabled?: boolean;
		onRecordingStart?: () => void;
		onRecordingEnd?: (result: AudioRecorderResult) => void;
		onAudioLevel?: (level: number) => void;
		onError?: (error: Error) => void;
	}

	let {
		mode = 'ptt',
		vadSensitivity = 0.3,
		vadSilenceTimeout = 1500,
		maxDuration = 60000,
		disabled = false,
		onRecordingStart,
		onRecordingEnd,
		onAudioLevel,
		onError
	}: Props = $props();

	// State
	let isSupported = $state(false);
	let hasPermission = $state(false);
	let isRecording = $state(false);
	let audioLevel = $state(0);
	let recordingDuration = $state(0);
	let vadListening = $state(false);

	// Instances
	let recorder: AudioRecorder | null = null;
	let vad: VoiceActivityDetector | null = null;
	let durationInterval: ReturnType<typeof setInterval> | null = null;
	let recordingStartTime = 0;

	// Derived
	const isPTTMode = $derived(mode === 'ptt');
	const isVADMode = $derived(mode === 'vad');
	const showRecordingUI = $derived(isRecording);
	const buttonLabel = $derived(
		isPTTMode
			? isRecording
				? 'Release to send'
				: 'Hold to talk'
			: vadListening
				? isRecording
					? 'Listening...'
					: 'Waiting for speech...'
				: 'Start listening'
	);

	onMount(async () => {
		isSupported = isAudioRecordingSupported();
		if (!isSupported) {
			onError?.(new Error('Audio recording not supported in this browser'));
			return;
		}

		// Initialize recorder
		recorder = new AudioRecorder({
			onAudioLevel: (level) => {
				audioLevel = level;
				onAudioLevel?.(level);
			}
		});

		// Check/request permission
		hasPermission = await requestMicrophonePermission();
	});

	onDestroy(() => {
		cleanup();
	});

	function cleanup() {
		stopDurationTimer();
		recorder?.dispose();
		vad?.dispose();
		recorder = null;
		vad = null;
	}

	function startDurationTimer() {
		recordingStartTime = Date.now();
		recordingDuration = 0;
		durationInterval = setInterval(() => {
			recordingDuration = Date.now() - recordingStartTime;
			// Auto-stop at max duration
			if (recordingDuration >= maxDuration) {
				stopRecording();
			}
		}, 100);
	}

	function stopDurationTimer() {
		if (durationInterval) {
			clearInterval(durationInterval);
			durationInterval = null;
		}
	}

	// PTT Mode handlers
	async function handlePTTStart() {
		if (!recorder || !hasPermission || disabled || isRecording) return;

		try {
			await recorder.start();
			isRecording = true;
			startDurationTimer();
			onRecordingStart?.();
		} catch (error) {
			onError?.(error as Error);
		}
	}

	async function handlePTTEnd() {
		if (!recorder || !isRecording) return;

		try {
			const result = await recorder.stop();
			isRecording = false;
			stopDurationTimer();
			onRecordingEnd?.(result);
		} catch (error) {
			onError?.(error as Error);
			isRecording = false;
			stopDurationTimer();
		}
	}

	// VAD Mode handlers
	async function toggleVADListening() {
		if (!hasPermission || disabled) return;

		if (vadListening) {
			stopVADListening();
		} else {
			await startVADListening();
		}
	}

	async function startVADListening() {
		// Create VAD instance
		vad = new VoiceActivityDetector({
			speechThreshold: vadSensitivity,
			silenceTimeout: vadSilenceTimeout,
			maxDuration,
			onSpeechStart: async () => {
				// Start recording when speech detected
				if (!recorder) return;
				try {
					await recorder.start();
					isRecording = true;
					startDurationTimer();
					onRecordingStart?.();
				} catch (error) {
					onError?.(error as Error);
				}
			},
			onSpeechEnd: async () => {
				// Stop recording when silence detected
				if (!recorder || !isRecording) return;
				try {
					const result = await recorder.stop();
					isRecording = false;
					stopDurationTimer();
					onRecordingEnd?.(result);
				} catch (error) {
					onError?.(error as Error);
					isRecording = false;
					stopDurationTimer();
				}
			},
			onVolumeChange: (level) => {
				audioLevel = level;
				onAudioLevel?.(level);
			}
		});

		try {
			await vad.start();
			vadListening = true;
		} catch (error) {
			onError?.(error as Error);
			vad?.dispose();
			vad = null;
		}
	}

	function stopVADListening() {
		vad?.stop();
		vad?.dispose();
		vad = null;
		vadListening = false;
		isRecording = false;
		stopDurationTimer();
	}

	async function stopRecording() {
		if (isPTTMode) {
			await handlePTTEnd();
		} else {
			stopVADListening();
		}
	}

	// Keyboard support for PTT
	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space' && isPTTMode && !event.repeat) {
			event.preventDefault();
			handlePTTStart();
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.code === 'Space' && isPTTMode) {
			event.preventDefault();
			handlePTTEnd();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

<div class="audio-input" class:recording={isRecording} class:disabled>
	<!-- Audio Level Visualization -->
	<div class="audio-visualizer">
		<div class="level-bar" style="transform: scaleY({audioLevel})"></div>
		<div class="level-bar" style="transform: scaleY({audioLevel * 0.8})"></div>
		<div class="level-bar" style="transform: scaleY({audioLevel * 0.6})"></div>
		<div class="level-bar" style="transform: scaleY({audioLevel * 0.8})"></div>
		<div class="level-bar" style="transform: scaleY({audioLevel})"></div>
	</div>

	<!-- Recording Duration -->
	{#if showRecordingUI}
		<div class="recording-info">
			<span class="recording-dot"></span>
			<span class="duration">{formatDuration(recordingDuration)}</span>
		</div>
	{/if}

	<!-- Main Button -->
	{#if isPTTMode}
		<button
			class="record-button ptt"
			class:active={isRecording}
			onpointerdown={handlePTTStart}
			onpointerup={handlePTTEnd}
			onpointerleave={handlePTTEnd}
			{disabled}
			aria-label={buttonLabel}
		>
			<svg class="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
				<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
				<line x1="12" y1="19" x2="12" y2="23" />
				<line x1="8" y1="23" x2="16" y2="23" />
			</svg>
			<span class="button-label">{buttonLabel}</span>
		</button>
	{:else}
		<button
			class="record-button vad"
			class:active={vadListening}
			class:speaking={isRecording}
			onclick={toggleVADListening}
			{disabled}
			aria-label={buttonLabel}
		>
			<svg class="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
				<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
				<line x1="12" y1="19" x2="12" y2="23" />
				<line x1="8" y1="23" x2="16" y2="23" />
			</svg>
			<span class="button-label">{buttonLabel}</span>
		</button>
	{/if}

	<!-- Permission Warning -->
	{#if !hasPermission && isSupported}
		<p class="permission-warning">Microphone access required</p>
	{/if}

	<!-- Not Supported Warning -->
	{#if !isSupported}
		<p class="not-supported-warning">Audio recording not supported in this browser</p>
	{/if}
</div>

<style>
	.audio-input {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
	}

	.audio-input.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	/* Audio Visualizer */
	.audio-visualizer {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 40px;
		padding: 0.5rem;
	}

	.level-bar {
		width: 4px;
		height: 100%;
		background: var(--color-accent, #0071e3);
		border-radius: 2px;
		transform-origin: bottom;
		transition: transform 0.05s ease-out;
	}

	.audio-input.recording .level-bar {
		background: #ef4444;
	}

	/* Recording Info */
	.recording-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #ef4444;
	}

	.recording-dot {
		width: 8px;
		height: 8px;
		background: #ef4444;
		border-radius: 50%;
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.duration {
		font-variant-numeric: tabular-nums;
	}

	/* Record Button */
	.record-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 2rem;
		border: none;
		border-radius: 1rem;
		background: var(--color-bg-muted, #f5f5f7);
		color: var(--color-text, #1d1d1f);
		cursor: pointer;
		transition: all 0.2s ease;
		touch-action: none;
		user-select: none;
	}

	.record-button:hover:not(:disabled) {
		background: var(--color-bg-subtle, #e8e8ed);
	}

	.record-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/* PTT Button States */
	.record-button.ptt.active {
		background: #ef4444;
		color: white;
		transform: scale(0.98);
	}

	/* VAD Button States */
	.record-button.vad.active {
		background: var(--color-accent, #0071e3);
		color: white;
	}

	.record-button.vad.speaking {
		background: #ef4444;
		color: white;
		animation: recording-pulse 1.5s ease-in-out infinite;
	}

	@keyframes recording-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
		}
		50% {
			box-shadow: 0 0 0 12px rgba(239, 68, 68, 0);
		}
	}

	.mic-icon {
		width: 32px;
		height: 32px;
	}

	.button-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Warnings */
	.permission-warning,
	.not-supported-warning {
		font-size: 0.75rem;
		color: #f59e0b;
		text-align: center;
	}

	.not-supported-warning {
		color: #ef4444;
	}
</style>
