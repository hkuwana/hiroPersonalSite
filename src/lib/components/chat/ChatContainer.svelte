<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ChatBubble from './ChatBubble.svelte';
	import TextInput from './TextInput.svelte';
	import AudioInput from './AudioInput.svelte';
	import InputModeToggle from './InputModeToggle.svelte';
	import AudioModeToggle from './AudioModeToggle.svelte';
	import {
		createConversationStore,
		type ConversationStore,
		type InputMode,
		type AudioMode
	} from '$lib/stores/conversation.svelte';
	import { AudioPlayer, type AudioRecorderResult } from '$lib/utils/audio';
	import {
		createRealtimeClient,
		createHTTPClient,
		type RealtimeClient,
		type HTTPClient
	} from '$lib/utils/realtime';

	// Props
	interface Props {
		/** Use existing store or create new one */
		store?: ConversationStore;
		/** API configuration */
		apiUrl?: string;
		wsUrl?: string;
		authToken?: string;
		/** Default modes */
		defaultInputMode?: InputMode;
		defaultAudioMode?: AudioMode;
		/** VAD settings */
		vadSensitivity?: number;
		vadSilenceTimeout?: number;
		/** Enable real-time WebSocket connection */
		enableRealtime?: boolean;
		/** Show connection status indicator */
		showConnectionStatus?: boolean;
		/** Callback when message is sent */
		onSend?: (message: { content: string; type: 'text' | 'audio' }) => void;
		/** Callback when response received */
		onResponse?: (message: { content: string; audioUrl?: string }) => void;
	}

	let {
		store,
		apiUrl = '',
		wsUrl = '',
		authToken = '',
		defaultInputMode = 'text',
		defaultAudioMode = 'ptt',
		vadSensitivity = 0.3,
		vadSilenceTimeout = 1500,
		enableRealtime = false,
		showConnectionStatus = true,
		onSend,
		onResponse
	}: Props = $props();

	// Use provided store or create new one
	const conversation =
		store ??
		createConversationStore({
			defaultInputMode,
			defaultAudioMode,
			vadSensitivity,
			vadSilenceTimeout
		});

	// Clients
	let realtimeClient: RealtimeClient | null = null;
	let httpClient: HTTPClient | null = null;
	let audioPlayer: AudioPlayer | null = null;

	// Refs
	let messagesContainer: HTMLElement | null = null;
	let textInputRef: TextInput | null = null;

	// Derived
	const isTextMode = $derived(conversation.inputMode === 'text');
	const isAudioMode = $derived(conversation.inputMode === 'audio');
	const connectionStatusText = $derived(
		conversation.connectionState === 'connected'
			? 'Connected'
			: conversation.connectionState === 'connecting'
				? 'Connecting...'
				: conversation.connectionState === 'reconnecting'
					? 'Reconnecting...'
					: 'Disconnected'
	);

	onMount(async () => {
		// Initialize audio player
		audioPlayer = new AudioPlayer({
			onPlay: () => conversation.setSpeaking(true),
			onEnded: () => conversation.setSpeaking(false)
		});

		// Initialize HTTP client (always available as fallback)
		httpClient = createHTTPClient({
			httpUrl: apiUrl || window.location.origin,
			authToken
		});

		// Initialize realtime client if enabled
		if (enableRealtime) {
			realtimeClient = createRealtimeClient(
				{
					wsUrl: wsUrl || undefined,
					authToken
				},
				{
					onConnectionChange: (state) => {
						conversation.setConnectionState(state);
					},
					onMessage: (msg) => {
						if (msg.type === 'response_start') {
							conversation.startAssistantStream();
						} else if (msg.type === 'response_chunk' && msg.text) {
							const lastMsg = conversation.lastMessage;
							if (lastMsg && lastMsg.status === 'streaming') {
								conversation.appendToStream(lastMsg.id, msg.text);
							}
						} else if (msg.type === 'response_end') {
							const lastMsg = conversation.lastMessage;
							if (lastMsg && lastMsg.status === 'streaming') {
								conversation.completeStream(lastMsg.id);
							}
						}
					},
					onTranscript: (text, isFinal) => {
						conversation.setCurrentTranscript(text);
						if (isFinal) {
							// Could update a sent message with final transcript
						}
					},
					onAudioChunk: (chunk) => {
						// Queue audio for playback
						audioPlayer?.playChunks([chunk]);
					},
					onError: (error) => {
						conversation.setError(error.message);
					}
				}
			);

			try {
				await realtimeClient.connect();
			} catch {
				// Fall back to HTTP
				conversation.setConnectionState('disconnected');
			}
		} else {
			// Mark as "connected" for HTTP-only mode
			conversation.setConnectionState('connected');
		}
	});

	onDestroy(() => {
		realtimeClient?.dispose();
		audioPlayer?.dispose();
	});

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	// Auto-scroll when messages change
	$effect(() => {
		if (conversation.messages.length > 0) {
			// Use timeout to ensure DOM has updated
			setTimeout(scrollToBottom, 50);
		}
	});

	// Handle text message submit
	async function handleTextSubmit(content: string) {
		const message = conversation.sendTextMessage(content);
		if (!message) return;

		onSend?.({ content, type: 'text' });

		conversation.setProcessing(true);

		try {
			if (realtimeClient?.isConnected) {
				// Use WebSocket
				realtimeClient.sendText(content);
				// Response will come via onMessage callback
			} else if (httpClient) {
				// Fall back to HTTP
				const response = await httpClient.sendText(content);
				conversation.updateMessage(message.id, { status: 'sent' });
				const assistantMsg = conversation.addAssistantMessage(response.response);
				onResponse?.({ content: response.response });
			}
		} catch (error) {
			conversation.updateMessage(message.id, { status: 'error' });
			conversation.setError((error as Error).message);
		} finally {
			conversation.setProcessing(false);
		}
	}

	// Handle audio recording complete
	async function handleAudioRecordingEnd(result: AudioRecorderResult) {
		const message = conversation.sendAudioMessage(
			result.url,
			conversation.currentTranscript || '[Audio message]',
			result.duration
		);
		if (!message) return;

		onSend?.({ content: conversation.currentTranscript || '', type: 'audio' });
		conversation.setCurrentTranscript('');
		conversation.setProcessing(true);

		try {
			if (realtimeClient?.isConnected) {
				// Audio was streamed during recording, just signal end
				realtimeClient.sendAudioEnd();
			} else if (httpClient) {
				// Send audio file via HTTP
				const response = await httpClient.sendAudio(result.blob);
				conversation.updateMessage(message.id, {
					content: response.transcript,
					status: 'sent'
				});
				const assistantMsg = conversation.addAssistantMessage(response.response, {
					audioUrl: response.audioUrl
				});
				onResponse?.({ content: response.response, audioUrl: response.audioUrl });

				// Auto-play response audio if available
				if (response.audioUrl) {
					audioPlayer?.play(response.audioUrl);
				}
			}
		} catch (error) {
			conversation.updateMessage(message.id, { status: 'error' });
			conversation.setError((error as Error).message);
		} finally {
			conversation.setProcessing(false);
		}
	}

	function handleInputModeToggle(mode: InputMode) {
		conversation.setInputMode(mode);
		if (mode === 'text') {
			// Focus text input when switching to text mode
			setTimeout(() => textInputRef?.focus(), 100);
		}
	}

	function handleAudioModeToggle(mode: AudioMode) {
		conversation.setAudioMode(mode);
	}

	function handlePlayAudio(audioUrl: string) {
		audioPlayer?.play(audioUrl);
	}
</script>

<div class="chat-container">
	<!-- Connection Status -->
	{#if showConnectionStatus}
		<div
			class="connection-status"
			class:connected={conversation.connectionState === 'connected'}
			class:connecting={conversation.connectionState === 'connecting' ||
				conversation.connectionState === 'reconnecting'}
			class:disconnected={conversation.connectionState === 'disconnected'}
		>
			<span class="status-dot"></span>
			<span class="status-text">{connectionStatusText}</span>
		</div>
	{/if}

	<!-- Messages Area -->
	<div class="messages-area" bind:this={messagesContainer}>
		{#if conversation.messages.length === 0}
			<div class="empty-state">
				<p>Start a conversation</p>
			</div>
		{:else}
			{#each conversation.messages as message (message.id)}
				<ChatBubble {message} onPlayAudio={handlePlayAudio} />
			{/each}
		{/if}

		<!-- Typing/Processing Indicator -->
		{#if conversation.isProcessing}
			<div class="processing-indicator">
				<span class="dot"></span>
				<span class="dot"></span>
				<span class="dot"></span>
			</div>
		{/if}
	</div>

	<!-- Error Display -->
	{#if conversation.error}
		<div class="error-banner">
			<span>{conversation.error}</span>
			<button onclick={() => conversation.clearError()}>Dismiss</button>
		</div>
	{/if}

	<!-- Input Area -->
	<div class="input-area">
		<!-- Mode Toggles -->
		<div class="input-controls">
			<InputModeToggle
				mode={conversation.inputMode}
				disabled={conversation.isRecording || conversation.isProcessing}
				onToggle={handleInputModeToggle}
			/>

			{#if isAudioMode}
				<AudioModeToggle
					mode={conversation.audioMode}
					disabled={conversation.isRecording || conversation.isProcessing}
					onToggle={handleAudioModeToggle}
				/>
			{/if}
		</div>

		<!-- Input Component -->
		<div class="input-component">
			{#if isTextMode}
				<TextInput
					bind:this={textInputRef}
					disabled={conversation.isProcessing}
					onSubmit={handleTextSubmit}
				/>
			{:else}
				<AudioInput
					mode={conversation.audioMode}
					vadSensitivity={conversation.vadSensitivity}
					vadSilenceTimeout={conversation.vadSilenceTimeout}
					disabled={conversation.isProcessing}
					onRecordingStart={() => conversation.startRecording()}
					onRecordingEnd={handleAudioRecordingEnd}
					onAudioLevel={(level) => conversation.setAudioLevel(level)}
					onError={(error) => conversation.setError(error.message)}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 100vh;
		background: var(--color-bg, #ffffff);
	}

	/* Connection Status */
	.connection-status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem;
		font-size: 0.75rem;
		border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.connection-status.connected .status-dot {
		background: #22c55e;
	}

	.connection-status.connecting .status-dot {
		background: #f59e0b;
		animation: pulse 1s ease-in-out infinite;
	}

	.connection-status.disconnected .status-dot {
		background: #ef4444;
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

	.status-text {
		color: var(--color-text-secondary, #6e6e73);
	}

	/* Messages Area */
	.messages-area {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty-state {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary, #86868b);
	}

	/* Processing Indicator */
	.processing-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0.75rem 1rem;
		align-self: flex-start;
	}

	.processing-indicator .dot {
		width: 8px;
		height: 8px;
		background: var(--color-text-tertiary, #86868b);
		border-radius: 50%;
		animation: bounce 1.4s ease-in-out infinite;
	}

	.processing-indicator .dot:nth-child(1) {
		animation-delay: 0s;
	}

	.processing-indicator .dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.processing-indicator .dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-6px);
		}
	}

	/* Error Banner */
	.error-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: #fef2f2;
		border-top: 1px solid #fecaca;
		color: #dc2626;
		font-size: 0.875rem;
	}

	.error-banner button {
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: 1px solid currentColor;
		border-radius: 0.25rem;
		color: inherit;
		cursor: pointer;
		font-size: 0.75rem;
	}

	.error-banner button:hover {
		background: rgba(220, 38, 38, 0.1);
	}

	/* Input Area */
	.input-area {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border-top: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
		background: var(--color-bg, #ffffff);
	}

	.input-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.input-component {
		display: flex;
		justify-content: center;
	}

	/* Scrollbar Styling */
	.messages-area::-webkit-scrollbar {
		width: 6px;
	}

	.messages-area::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-area::-webkit-scrollbar-thumb {
		background: var(--color-border, rgba(0, 0, 0, 0.1));
		border-radius: 3px;
	}

	.messages-area::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-tertiary, rgba(0, 0, 0, 0.2));
	}
</style>
