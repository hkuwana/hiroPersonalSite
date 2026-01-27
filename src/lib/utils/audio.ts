/**
 * Audio Utilities
 *
 * Provides audio recording, playback, and voice activity detection
 * for the real-time conversation system.
 */

export interface AudioRecorderOptions {
	mimeType?: string;
	audioBitsPerSecond?: number;
	sampleRate?: number;
	onDataAvailable?: (chunk: Blob) => void;
	onAudioLevel?: (level: number) => void;
}

export interface AudioRecorderResult {
	blob: Blob;
	duration: number;
	url: string;
}

/**
 * AudioRecorder - Handles microphone recording using MediaRecorder API
 */
export class AudioRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private audioContext: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private stream: MediaStream | null = null;
	private chunks: Blob[] = [];
	private startTime: number = 0;
	private animationFrame: number | null = null;
	private options: AudioRecorderOptions;

	constructor(options: AudioRecorderOptions = {}) {
		this.options = {
			mimeType: this.getSupportedMimeType(),
			audioBitsPerSecond: 128000,
			sampleRate: 16000,
			...options
		};
	}

	private getSupportedMimeType(): string {
		const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

		for (const type of types) {
			if (MediaRecorder.isTypeSupported(type)) {
				return type;
			}
		}
		return 'audio/webm';
	}

	/**
	 * Request microphone permission and set up recording
	 */
	async initialize(): Promise<void> {
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
					sampleRate: this.options.sampleRate
				}
			});

			// Set up audio analysis for level monitoring
			this.audioContext = new AudioContext();
			const source = this.audioContext.createMediaStreamSource(this.stream);
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = 256;
			this.analyser.smoothingTimeConstant = 0.8;
			source.connect(this.analyser);
		} catch (error) {
			throw new Error(`Microphone access denied: ${error}`);
		}
	}

	/**
	 * Start recording audio
	 */
	async start(): Promise<void> {
		if (!this.stream) {
			await this.initialize();
		}

		if (!this.stream) {
			throw new Error('No audio stream available');
		}

		this.chunks = [];
		this.startTime = Date.now();

		this.mediaRecorder = new MediaRecorder(this.stream, {
			mimeType: this.options.mimeType,
			audioBitsPerSecond: this.options.audioBitsPerSecond
		});

		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				this.chunks.push(event.data);
				this.options.onDataAvailable?.(event.data);
			}
		};

		// Request data every 100ms for streaming
		this.mediaRecorder.start(100);

		// Start audio level monitoring
		this.startLevelMonitoring();
	}

	/**
	 * Stop recording and return the audio data
	 */
	async stop(): Promise<AudioRecorderResult> {
		return new Promise((resolve, reject) => {
			if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
				reject(new Error('Recorder not active'));
				return;
			}

			this.stopLevelMonitoring();
			const duration = Date.now() - this.startTime;

			this.mediaRecorder.onstop = () => {
				const blob = new Blob(this.chunks, { type: this.options.mimeType });
				const url = URL.createObjectURL(blob);
				resolve({ blob, duration, url });
			};

			this.mediaRecorder.stop();
		});
	}

	/**
	 * Cancel recording without saving
	 */
	cancel(): void {
		this.stopLevelMonitoring();
		if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
			this.mediaRecorder.stop();
		}
		this.chunks = [];
	}

	/**
	 * Get current audio input level (0-1)
	 */
	getAudioLevel(): number {
		if (!this.analyser) return 0;

		const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(dataArray);

		// Calculate RMS (root mean square) for better level representation
		let sum = 0;
		for (let i = 0; i < dataArray.length; i++) {
			sum += dataArray[i] * dataArray[i];
		}
		const rms = Math.sqrt(sum / dataArray.length);

		// Normalize to 0-1 range
		return Math.min(1, rms / 128);
	}

	private startLevelMonitoring(): void {
		const monitor = () => {
			if (this.mediaRecorder?.state === 'recording') {
				const level = this.getAudioLevel();
				this.options.onAudioLevel?.(level);
				this.animationFrame = requestAnimationFrame(monitor);
			}
		};
		monitor();
	}

	private stopLevelMonitoring(): void {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	/**
	 * Check if currently recording
	 */
	get isRecording(): boolean {
		return this.mediaRecorder?.state === 'recording';
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.cancel();
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
			this.stream = null;
		}
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.analyser = null;
		this.mediaRecorder = null;
	}
}

// ============================================================================
// Voice Activity Detection
// ============================================================================

export interface VADOptions {
	/** Threshold for speech detection (0-1), default 0.3 */
	speechThreshold?: number;
	/** Threshold for silence detection (0-1), default 0.1 */
	silenceThreshold?: number;
	/** Time to wait in silence before ending (ms), default 1500 */
	silenceTimeout?: number;
	/** Minimum speech duration to trigger (ms), default 250 */
	minSpeechDuration?: number;
	/** Maximum recording duration (ms), default 60000 */
	maxDuration?: number;
	/** Callback when speech starts */
	onSpeechStart?: () => void;
	/** Callback when speech ends */
	onSpeechEnd?: () => void;
	/** Callback with current audio level */
	onVolumeChange?: (level: number) => void;
}

/**
 * VoiceActivityDetector - Detects speech start/end using volume threshold
 *
 * For production use, consider using @ricky0123/vad-web for neural VAD
 */
export class VoiceActivityDetector {
	private audioContext: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private stream: MediaStream | null = null;
	private animationFrame: number | null = null;
	private options: Required<VADOptions>;

	// State tracking
	private isListening = false;
	private isSpeaking = false;
	private speechStartTime: number | null = null;
	private silenceStartTime: number | null = null;
	private totalSpeechTime = 0;

	constructor(options: VADOptions = {}) {
		this.options = {
			speechThreshold: 0.3,
			silenceThreshold: 0.1,
			silenceTimeout: 1500,
			minSpeechDuration: 250,
			maxDuration: 60000,
			onSpeechStart: () => {},
			onSpeechEnd: () => {},
			onVolumeChange: () => {},
			...options
		};
	}

	/**
	 * Initialize audio input for VAD
	 */
	async initialize(): Promise<void> {
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			});

			this.audioContext = new AudioContext();
			const source = this.audioContext.createMediaStreamSource(this.stream);
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = 512;
			this.analyser.smoothingTimeConstant = 0.5;
			source.connect(this.analyser);
		} catch (error) {
			throw new Error(`Microphone access denied: ${error}`);
		}
	}

	/**
	 * Start listening for voice activity
	 */
	async start(): Promise<void> {
		if (!this.stream) {
			await this.initialize();
		}

		this.isListening = true;
		this.isSpeaking = false;
		this.speechStartTime = null;
		this.silenceStartTime = null;
		this.totalSpeechTime = 0;

		this.monitor();
	}

	/**
	 * Stop listening for voice activity
	 */
	stop(): void {
		this.isListening = false;
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}

		// If we were speaking, trigger end
		if (this.isSpeaking) {
			this.isSpeaking = false;
			this.options.onSpeechEnd();
		}
	}

	/**
	 * Update VAD options on the fly
	 */
	updateOptions(options: Partial<VADOptions>): void {
		Object.assign(this.options, options);
	}

	private getAudioLevel(): number {
		if (!this.analyser) return 0;

		const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(dataArray);

		let sum = 0;
		for (let i = 0; i < dataArray.length; i++) {
			sum += dataArray[i] * dataArray[i];
		}
		const rms = Math.sqrt(sum / dataArray.length);
		return Math.min(1, rms / 128);
	}

	private monitor(): void {
		if (!this.isListening) return;

		const level = this.getAudioLevel();
		const now = Date.now();

		this.options.onVolumeChange(level);

		if (!this.isSpeaking) {
			// Not currently speaking - check for speech start
			if (level >= this.options.speechThreshold) {
				if (!this.speechStartTime) {
					this.speechStartTime = now;
				} else if (now - this.speechStartTime >= this.options.minSpeechDuration) {
					// Speech confirmed!
					this.isSpeaking = true;
					this.silenceStartTime = null;
					this.options.onSpeechStart();
				}
			} else {
				// Reset speech start timer
				this.speechStartTime = null;
			}
		} else {
			// Currently speaking - check for speech end
			this.totalSpeechTime = now - (this.speechStartTime || now);

			if (level < this.options.silenceThreshold) {
				if (!this.silenceStartTime) {
					this.silenceStartTime = now;
				} else if (now - this.silenceStartTime >= this.options.silenceTimeout) {
					// Silence confirmed - speech ended
					this.isSpeaking = false;
					this.speechStartTime = null;
					this.silenceStartTime = null;
					this.options.onSpeechEnd();
				}
			} else {
				// Voice detected - reset silence timer
				this.silenceStartTime = null;
			}

			// Check max duration
			if (this.totalSpeechTime >= this.options.maxDuration) {
				this.isSpeaking = false;
				this.speechStartTime = null;
				this.silenceStartTime = null;
				this.options.onSpeechEnd();
			}
		}

		this.animationFrame = requestAnimationFrame(() => this.monitor());
	}

	/**
	 * Check if currently detecting speech
	 */
	get speaking(): boolean {
		return this.isSpeaking;
	}

	/**
	 * Check if VAD is actively listening
	 */
	get listening(): boolean {
		return this.isListening;
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.stop();
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
			this.stream = null;
		}
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.analyser = null;
	}
}

// ============================================================================
// Audio Player
// ============================================================================

export interface AudioPlayerOptions {
	volume?: number;
	onPlay?: () => void;
	onPause?: () => void;
	onEnded?: () => void;
	onError?: (error: Error) => void;
}

/**
 * AudioPlayer - Handles audio playback for AI responses
 */
export class AudioPlayer {
	private audio: HTMLAudioElement | null = null;
	private audioContext: AudioContext | null = null;
	private options: AudioPlayerOptions;

	constructor(options: AudioPlayerOptions = {}) {
		this.options = {
			volume: 1,
			...options
		};
	}

	/**
	 * Play audio from URL or Blob
	 */
	async play(source: string | Blob | ArrayBuffer): Promise<void> {
		this.stop();

		let url: string;

		if (typeof source === 'string') {
			url = source;
		} else if (source instanceof Blob) {
			url = URL.createObjectURL(source);
		} else {
			// ArrayBuffer - convert to Blob
			const blob = new Blob([source], { type: 'audio/mpeg' });
			url = URL.createObjectURL(blob);
		}

		this.audio = new Audio(url);
		this.audio.volume = this.options.volume ?? 1;

		this.audio.onplay = () => this.options.onPlay?.();
		this.audio.onpause = () => this.options.onPause?.();
		this.audio.onended = () => {
			this.options.onEnded?.();
			this.cleanup();
		};
		this.audio.onerror = () => {
			this.options.onError?.(new Error('Audio playback failed'));
			this.cleanup();
		};

		try {
			await this.audio.play();
		} catch (error) {
			this.options.onError?.(error as Error);
			this.cleanup();
		}
	}

	/**
	 * Play audio chunks for streaming playback
	 * Uses Web Audio API for seamless chunk concatenation
	 */
	async playChunks(chunks: ArrayBuffer[]): Promise<void> {
		if (!this.audioContext) {
			this.audioContext = new AudioContext();
		}

		for (const chunk of chunks) {
			try {
				const audioBuffer = await this.audioContext.decodeAudioData(chunk.slice(0));
				const source = this.audioContext.createBufferSource();
				source.buffer = audioBuffer;
				source.connect(this.audioContext.destination);
				source.start();

				// Wait for this chunk to finish before playing next
				await new Promise<void>((resolve) => {
					source.onended = () => resolve();
				});
			} catch {
				// Skip invalid chunks
				console.warn('Failed to decode audio chunk');
			}
		}

		this.options.onEnded?.();
	}

	/**
	 * Pause playback
	 */
	pause(): void {
		this.audio?.pause();
	}

	/**
	 * Resume playback
	 */
	resume(): void {
		this.audio?.play();
	}

	/**
	 * Stop playback completely
	 */
	stop(): void {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.cleanup();
		}
	}

	/**
	 * Set volume (0-1)
	 */
	setVolume(level: number): void {
		this.options.volume = Math.max(0, Math.min(1, level));
		if (this.audio) {
			this.audio.volume = this.options.volume;
		}
	}

	/**
	 * Get current playback time
	 */
	get currentTime(): number {
		return this.audio?.currentTime ?? 0;
	}

	/**
	 * Get total duration
	 */
	get duration(): number {
		return this.audio?.duration ?? 0;
	}

	/**
	 * Check if currently playing
	 */
	get isPlaying(): boolean {
		return this.audio ? !this.audio.paused : false;
	}

	private cleanup(): void {
		if (this.audio) {
			// Revoke object URL if we created one
			if (this.audio.src.startsWith('blob:')) {
				URL.revokeObjectURL(this.audio.src);
			}
			this.audio = null;
		}
	}

	/**
	 * Clean up all resources
	 */
	dispose(): void {
		this.stop();
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if the browser supports audio recording
 */
export function isAudioRecordingSupported(): boolean {
	return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

/**
 * Check microphone permission status
 */
export async function getMicrophonePermission(): Promise<PermissionState> {
	try {
		const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
		return result.state;
	} catch {
		// Permissions API not supported - try to access microphone directly
		return 'prompt';
	}
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		stream.getTracks().forEach((track) => track.stop());
		return true;
	} catch {
		return false;
	}
}

/**
 * Convert audio blob to base64 for API transmission
 */
export async function audioToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const result = reader.result as string;
			// Remove data URL prefix
			const base64 = result.split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * Format duration in mm:ss format
 */
export function formatDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
