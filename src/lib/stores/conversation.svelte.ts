/**
 * Conversation Store - Svelte 5 Runes-based state management
 *
 * Manages all conversation state including messages, input modes,
 * recording state, and connection status.
 */

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'audio';
export type MessageStatus = 'sending' | 'streaming' | 'sent' | 'error';
export type InputMode = 'text' | 'audio';
export type AudioMode = 'ptt' | 'vad';
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface Message {
	id: string;
	role: MessageRole;
	type: MessageType;
	content: string;
	audioUrl?: string;
	audioDuration?: number;
	timestamp: Date;
	status: MessageStatus;
}

export interface ConversationConfig {
	defaultInputMode?: InputMode;
	defaultAudioMode?: AudioMode;
	vadSensitivity?: number;
	vadSilenceTimeout?: number;
	maxRecordingDuration?: number;
}

const DEFAULT_CONFIG: Required<ConversationConfig> = {
	defaultInputMode: 'text',
	defaultAudioMode: 'ptt',
	vadSensitivity: 0.5,
	vadSilenceTimeout: 1500,
	maxRecordingDuration: 60000
};

/**
 * Creates a conversation store with reactive state management
 */
export function createConversationStore(config: ConversationConfig = {}) {
	const settings = { ...DEFAULT_CONFIG, ...config };

	// Core state using Svelte 5 runes
	let messages = $state<Message[]>([]);
	let inputMode = $state<InputMode>(settings.defaultInputMode);
	let audioMode = $state<AudioMode>(settings.defaultAudioMode);
	let isRecording = $state(false);
	let isProcessing = $state(false);
	let isSpeaking = $state(false);
	let connectionState = $state<ConnectionState>('disconnected');
	let error = $state<string | null>(null);

	// Audio-specific state
	let audioLevel = $state(0);
	let recordingDuration = $state(0);
	let currentTranscript = $state('');

	// VAD settings (reactive)
	let vadSensitivity = $state(settings.vadSensitivity);
	let vadSilenceTimeout = $state(settings.vadSilenceTimeout);

	// Derived state
	const canSend = $derived(!isRecording && !isProcessing && connectionState === 'connected');
	const hasMessages = $derived(messages.length > 0);
	const lastMessage = $derived(messages[messages.length - 1] ?? null);
	const isAudioMode = $derived(inputMode === 'audio');
	const isPTTMode = $derived(audioMode === 'ptt');
	const isVADMode = $derived(audioMode === 'vad');

	// Helper to generate unique IDs
	function generateId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	// Message management
	function addMessage(
		role: MessageRole,
		content: string,
		options: Partial<Omit<Message, 'id' | 'role' | 'content' | 'timestamp'>> = {}
	): Message {
		const message: Message = {
			id: generateId(),
			role,
			type: options.type ?? 'text',
			content,
			audioUrl: options.audioUrl,
			audioDuration: options.audioDuration,
			timestamp: new Date(),
			status: options.status ?? 'sent'
		};
		messages = [...messages, message];
		return message;
	}

	function updateMessage(id: string, updates: Partial<Message>): void {
		messages = messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg));
	}

	function removeMessage(id: string): void {
		messages = messages.filter((msg) => msg.id !== id);
	}

	function clearMessages(): void {
		messages = [];
	}

	// Input mode management
	function setInputMode(mode: InputMode): void {
		inputMode = mode;
		// Stop recording if switching away from audio
		if (mode !== 'audio' && isRecording) {
			stopRecording();
		}
	}

	function toggleInputMode(): void {
		setInputMode(inputMode === 'text' ? 'audio' : 'text');
	}

	function setAudioMode(mode: AudioMode): void {
		audioMode = mode;
		// Stop recording when switching modes
		if (isRecording) {
			stopRecording();
		}
	}

	function toggleAudioMode(): void {
		setAudioMode(audioMode === 'ptt' ? 'vad' : 'ptt');
	}

	// Recording state management
	function startRecording(): void {
		if (isRecording) return;
		isRecording = true;
		recordingDuration = 0;
		error = null;
	}

	function stopRecording(): void {
		isRecording = false;
	}

	function setAudioLevel(level: number): void {
		audioLevel = Math.max(0, Math.min(1, level));
	}

	function setRecordingDuration(duration: number): void {
		recordingDuration = duration;
	}

	function setCurrentTranscript(transcript: string): void {
		currentTranscript = transcript;
	}

	// Processing state
	function setProcessing(processing: boolean): void {
		isProcessing = processing;
	}

	function setSpeaking(speaking: boolean): void {
		isSpeaking = speaking;
	}

	// Connection state
	function setConnectionState(state: ConnectionState): void {
		connectionState = state;
	}

	// Error handling
	function setError(err: string | null): void {
		error = err;
	}

	function clearError(): void {
		error = null;
	}

	// VAD settings
	function setVADSensitivity(sensitivity: number): void {
		vadSensitivity = Math.max(0, Math.min(1, sensitivity));
	}

	function setVADSilenceTimeout(timeout: number): void {
		vadSilenceTimeout = Math.max(500, Math.min(5000, timeout));
	}

	// Send text message (returns message for tracking)
	function sendTextMessage(content: string): Message | null {
		if (!content.trim() || !canSend) return null;

		const message = addMessage('user', content.trim(), {
			type: 'text',
			status: 'sending'
		});

		return message;
	}

	// Send audio message (returns message for tracking)
	function sendAudioMessage(audioUrl: string, transcript: string, duration?: number): Message | null {
		if (!canSend) return null;

		const message = addMessage('user', transcript, {
			type: 'audio',
			audioUrl,
			audioDuration: duration,
			status: 'sending'
		});

		return message;
	}

	// Add assistant response
	function addAssistantMessage(
		content: string,
		options: { audioUrl?: string; audioDuration?: number } = {}
	): Message {
		return addMessage('assistant', content, {
			type: options.audioUrl ? 'audio' : 'text',
			...options,
			status: 'sent'
		});
	}

	// Start streaming assistant response
	function startAssistantStream(): Message {
		return addMessage('assistant', '', {
			type: 'text',
			status: 'streaming'
		});
	}

	// Append to streaming message
	function appendToStream(messageId: string, chunk: string): void {
		const message = messages.find((m) => m.id === messageId);
		if (message) {
			updateMessage(messageId, { content: message.content + chunk });
		}
	}

	// Complete streaming message
	function completeStream(messageId: string): void {
		updateMessage(messageId, { status: 'sent' });
	}

	// Reset entire conversation
	function reset(): void {
		messages = [];
		inputMode = settings.defaultInputMode;
		audioMode = settings.defaultAudioMode;
		isRecording = false;
		isProcessing = false;
		isSpeaking = false;
		error = null;
		audioLevel = 0;
		recordingDuration = 0;
		currentTranscript = '';
	}

	return {
		// State (getters for reactive access)
		get messages() {
			return messages;
		},
		get inputMode() {
			return inputMode;
		},
		get audioMode() {
			return audioMode;
		},
		get isRecording() {
			return isRecording;
		},
		get isProcessing() {
			return isProcessing;
		},
		get isSpeaking() {
			return isSpeaking;
		},
		get connectionState() {
			return connectionState;
		},
		get error() {
			return error;
		},
		get audioLevel() {
			return audioLevel;
		},
		get recordingDuration() {
			return recordingDuration;
		},
		get currentTranscript() {
			return currentTranscript;
		},
		get vadSensitivity() {
			return vadSensitivity;
		},
		get vadSilenceTimeout() {
			return vadSilenceTimeout;
		},

		// Derived state
		get canSend() {
			return canSend;
		},
		get hasMessages() {
			return hasMessages;
		},
		get lastMessage() {
			return lastMessage;
		},
		get isAudioMode() {
			return isAudioMode;
		},
		get isPTTMode() {
			return isPTTMode;
		},
		get isVADMode() {
			return isVADMode;
		},

		// Actions
		addMessage,
		updateMessage,
		removeMessage,
		clearMessages,
		setInputMode,
		toggleInputMode,
		setAudioMode,
		toggleAudioMode,
		startRecording,
		stopRecording,
		setAudioLevel,
		setRecordingDuration,
		setCurrentTranscript,
		setProcessing,
		setSpeaking,
		setConnectionState,
		setError,
		clearError,
		setVADSensitivity,
		setVADSilenceTimeout,
		sendTextMessage,
		sendAudioMessage,
		addAssistantMessage,
		startAssistantStream,
		appendToStream,
		completeStream,
		reset
	};
}

// Default singleton instance
export const conversation = createConversationStore();

// Type for the store
export type ConversationStore = ReturnType<typeof createConversationStore>;
