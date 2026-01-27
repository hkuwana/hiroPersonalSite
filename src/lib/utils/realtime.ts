/**
 * Real-Time Client
 *
 * WebSocket-based client for real-time bidirectional communication
 * with the conversation API. Handles audio streaming, text messages,
 * and connection management with automatic reconnection.
 */

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface RealtimeClientOptions {
	/** WebSocket endpoint URL */
	url: string;
	/** Authentication token */
	authToken?: string;
	/** Conversation ID for session continuity */
	conversationId?: string;
	/** Enable automatic reconnection */
	autoReconnect?: boolean;
	/** Maximum reconnection attempts */
	maxReconnectAttempts?: number;
	/** Base delay between reconnection attempts (ms) */
	reconnectDelay?: number;
	/** Callback when connection state changes */
	onConnectionChange?: (state: ConnectionState) => void;
	/** Callback when a text message is received */
	onMessage?: (message: ServerMessage) => void;
	/** Callback when an audio chunk is received */
	onAudioChunk?: (chunk: ArrayBuffer) => void;
	/** Callback when a transcript update is received */
	onTranscript?: (text: string, isFinal: boolean) => void;
	/** Callback when an error occurs */
	onError?: (error: Error) => void;
}

// Message types from server
export interface ServerMessage {
	type: 'transcript' | 'response_start' | 'response_chunk' | 'response_end' | 'audio_chunk' | 'error';
	text?: string;
	isFinal?: boolean;
	data?: ArrayBuffer;
	message?: string;
}

// Message types to server
export interface ClientTextMessage {
	type: 'text';
	content: string;
	conversationId?: string;
}

export interface ClientAudioMessage {
	type: 'audio_chunk' | 'audio_end';
	data?: ArrayBuffer;
	conversationId?: string;
}

export type ClientMessage = ClientTextMessage | ClientAudioMessage;

/**
 * RealtimeClient - Manages WebSocket connection for real-time conversation
 */
export class RealtimeClient {
	private ws: WebSocket | null = null;
	private options: Required<RealtimeClientOptions>;
	private connectionState: ConnectionState = 'disconnected';
	private reconnectAttempts = 0;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	private pendingMessages: ClientMessage[] = [];
	private conversationId: string | null = null;

	constructor(options: RealtimeClientOptions) {
		this.options = {
			autoReconnect: true,
			maxReconnectAttempts: 5,
			reconnectDelay: 1000,
			onConnectionChange: () => {},
			onMessage: () => {},
			onAudioChunk: () => {},
			onTranscript: () => {},
			onError: () => {},
			authToken: '',
			conversationId: '',
			...options
		};
		this.conversationId = options.conversationId || null;
	}

	/**
	 * Connect to the WebSocket server
	 */
	async connect(): Promise<void> {
		if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
			return;
		}

		this.setConnectionState('connecting');

		return new Promise((resolve, reject) => {
			try {
				// Build URL with auth and conversation ID if provided
				let url = this.options.url;
				const params = new URLSearchParams();
				if (this.options.authToken) {
					params.set('token', this.options.authToken);
				}
				if (this.conversationId) {
					params.set('conversationId', this.conversationId);
				}
				const queryString = params.toString();
				if (queryString) {
					url += (url.includes('?') ? '&' : '?') + queryString;
				}

				this.ws = new WebSocket(url);
				this.ws.binaryType = 'arraybuffer';

				this.ws.onopen = () => {
					this.setConnectionState('connected');
					this.reconnectAttempts = 0;
					this.flushPendingMessages();
					resolve();
				};

				this.ws.onmessage = (event) => {
					this.handleMessage(event);
				};

				this.ws.onerror = (event) => {
					const error = new Error('WebSocket error');
					this.options.onError(error);
					reject(error);
				};

				this.ws.onclose = (event) => {
					this.handleClose(event);
				};
			} catch (error) {
				this.setConnectionState('disconnected');
				reject(error);
			}
		});
	}

	/**
	 * Disconnect from the server
	 */
	disconnect(): void {
		this.clearReconnectTimeout();
		if (this.ws) {
			this.ws.close(1000, 'Client disconnect');
			this.ws = null;
		}
		this.setConnectionState('disconnected');
	}

	/**
	 * Send a text message
	 */
	sendText(content: string): void {
		const message: ClientTextMessage = {
			type: 'text',
			content,
			conversationId: this.conversationId || undefined
		};
		this.send(message);
	}

	/**
	 * Send an audio chunk (for streaming audio)
	 */
	sendAudioChunk(chunk: ArrayBuffer): void {
		if (this.connectionState !== 'connected' || !this.ws) {
			return; // Drop audio chunks if not connected
		}

		// Send binary audio data directly
		this.ws.send(chunk);
	}

	/**
	 * Signal end of audio stream
	 */
	sendAudioEnd(): void {
		const message: ClientAudioMessage = {
			type: 'audio_end',
			conversationId: this.conversationId || undefined
		};
		this.send(message);
	}

	/**
	 * Set the conversation ID for session continuity
	 */
	setConversationId(id: string): void {
		this.conversationId = id;
	}

	/**
	 * Get current connection state
	 */
	get state(): ConnectionState {
		return this.connectionState;
	}

	/**
	 * Check if connected
	 */
	get isConnected(): boolean {
		return this.connectionState === 'connected';
	}

	private send(message: ClientMessage): void {
		if (this.connectionState !== 'connected' || !this.ws) {
			// Queue message for later
			this.pendingMessages.push(message);
			return;
		}

		try {
			this.ws.send(JSON.stringify(message));
		} catch (error) {
			this.options.onError(error as Error);
		}
	}

	private flushPendingMessages(): void {
		while (this.pendingMessages.length > 0) {
			const message = this.pendingMessages.shift();
			if (message) {
				this.send(message);
			}
		}
	}

	private handleMessage(event: MessageEvent): void {
		// Check if binary (audio chunk)
		if (event.data instanceof ArrayBuffer) {
			this.options.onAudioChunk(event.data);
			return;
		}

		// Parse JSON message
		try {
			const message = JSON.parse(event.data) as ServerMessage;

			switch (message.type) {
				case 'transcript':
					this.options.onTranscript(message.text || '', message.isFinal || false);
					break;
				case 'audio_chunk':
					if (message.data) {
						this.options.onAudioChunk(message.data);
					}
					break;
				case 'error':
					this.options.onError(new Error(message.message || 'Unknown server error'));
					break;
				default:
					this.options.onMessage(message);
			}
		} catch (error) {
			console.error('Failed to parse message:', error);
		}
	}

	private handleClose(event: CloseEvent): void {
		this.ws = null;

		// Don't reconnect if closed cleanly
		if (event.code === 1000) {
			this.setConnectionState('disconnected');
			return;
		}

		// Attempt reconnection if enabled
		if (
			this.options.autoReconnect &&
			this.reconnectAttempts < this.options.maxReconnectAttempts
		) {
			this.setConnectionState('reconnecting');
			this.scheduleReconnect();
		} else {
			this.setConnectionState('disconnected');
			this.options.onError(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
		}
	}

	private scheduleReconnect(): void {
		this.clearReconnectTimeout();

		// Exponential backoff
		const delay = this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts);
		this.reconnectAttempts++;

		this.reconnectTimeout = setTimeout(() => {
			this.connect().catch(() => {
				// Error already handled in connect()
			});
		}, delay);
	}

	private clearReconnectTimeout(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
	}

	private setConnectionState(state: ConnectionState): void {
		if (this.connectionState !== state) {
			this.connectionState = state;
			this.options.onConnectionChange(state);
		}
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.disconnect();
		this.pendingMessages = [];
	}
}

// ============================================================================
// HTTP Fallback Client
// ============================================================================

export interface HTTPClientOptions {
	/** Base URL for API endpoints */
	baseUrl: string;
	/** Authentication token */
	authToken?: string;
	/** Callback when error occurs */
	onError?: (error: Error) => void;
}

/**
 * HTTPClient - Fallback client for non-streaming requests
 *
 * Use this when WebSocket is not available or for simple request/response
 */
export class HTTPClient {
	private options: HTTPClientOptions;

	constructor(options: HTTPClientOptions) {
		this.options = options;
	}

	/**
	 * Send a text message and get response
	 */
	async sendText(content: string, conversationId?: string): Promise<{ response: string; conversationId: string }> {
		const response = await this.fetch('/api/chat', {
			method: 'POST',
			body: JSON.stringify({ message: content, conversationId })
		});

		return response.json();
	}

	/**
	 * Send audio file and get response
	 */
	async sendAudio(
		audioBlob: Blob,
		conversationId?: string
	): Promise<{ transcript: string; response: string; audioUrl?: string }> {
		const formData = new FormData();
		formData.append('audio', audioBlob, 'recording.webm');
		if (conversationId) {
			formData.append('conversationId', conversationId);
		}

		const response = await fetch(`${this.options.baseUrl}/api/audio`, {
			method: 'POST',
			headers: this.options.authToken
				? { Authorization: `Bearer ${this.options.authToken}` }
				: undefined,
			body: formData
		});

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		return response.json();
	}

	private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>)
		};

		if (this.options.authToken) {
			headers['Authorization'] = `Bearer ${this.options.authToken}`;
		}

		const response = await fetch(`${this.options.baseUrl}${path}`, {
			...options,
			headers
		});

		if (!response.ok) {
			const error = new Error(`HTTP error: ${response.status}`);
			this.options.onError?.(error);
			throw error;
		}

		return response;
	}
}

// ============================================================================
// Streaming Response Handler
// ============================================================================

export interface StreamingOptions {
	onChunk?: (chunk: string) => void;
	onComplete?: (fullText: string) => void;
	onError?: (error: Error) => void;
}

/**
 * Handle Server-Sent Events (SSE) for streaming responses
 */
export async function handleStreamingResponse(
	response: Response,
	options: StreamingOptions
): Promise<string> {
	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error('No response body');
	}

	const decoder = new TextDecoder();
	let fullText = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value, { stream: true });

			// Parse SSE format
			const lines = chunk.split('\n');
			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const data = line.slice(6);
					if (data === '[DONE]') {
						break;
					}
					try {
						const parsed = JSON.parse(data);
						if (parsed.content) {
							fullText += parsed.content;
							options.onChunk?.(parsed.content);
						}
					} catch {
						// Not JSON, treat as plain text
						fullText += data;
						options.onChunk?.(data);
					}
				}
			}
		}

		options.onComplete?.(fullText);
		return fullText;
	} catch (error) {
		options.onError?.(error as Error);
		throw error;
	} finally {
		reader.releaseLock();
	}
}

// ============================================================================
// Utility: Create configured client
// ============================================================================

export interface ClientConfig {
	wsUrl?: string;
	httpUrl?: string;
	authToken?: string;
	conversationId?: string;
}

/**
 * Create a realtime client with default configuration
 */
export function createRealtimeClient(
	config: ClientConfig,
	handlers: Partial<RealtimeClientOptions>
): RealtimeClient {
	const wsUrl = config.wsUrl || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/realtime`;

	return new RealtimeClient({
		url: wsUrl,
		authToken: config.authToken,
		conversationId: config.conversationId,
		...handlers
	});
}

/**
 * Create an HTTP client with default configuration
 */
export function createHTTPClient(config: ClientConfig): HTTPClient {
	const httpUrl = config.httpUrl || window.location.origin;

	return new HTTPClient({
		baseUrl: httpUrl,
		authToken: config.authToken
	});
}
