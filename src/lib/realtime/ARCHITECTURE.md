# Real-Time Audio & Text Input Architecture

## Overview

This document outlines the architecture for adding real-time text and audio input capabilities
to the conversation system. The design supports two audio input modes:

1. **Push-to-Talk (PTT)**: User holds a button to record
2. **Voice Activity Detection (VAD)**: Automatic detection of speech start/end

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │   TextInput      │    │   AudioInput     │    │   ChatBubbles        │  │
│  │   Component      │    │   Component      │    │   Component          │  │
│  │                  │    │                  │    │                      │  │
│  │  - Text field    │    │  - PTT mode      │    │  - User messages     │  │
│  │  - Send button   │    │  - VAD mode      │    │  - AI responses      │  │
│  │  - Enter submit  │    │  - Waveform viz  │    │  - Audio playback    │  │
│  └────────┬─────────┘    └────────┬─────────┘    └──────────┬───────────┘  │
│           │                       │                         │              │
│           └───────────────────────┼─────────────────────────┘              │
│                                   │                                        │
│                    ┌──────────────▼──────────────┐                         │
│                    │    Conversation Store       │                         │
│                    │    (Svelte 5 Runes)         │                         │
│                    │                             │                         │
│                    │  - messages[]               │                         │
│                    │  - inputMode (text/audio)   │                         │
│                    │  - audioMode (ptt/vad)      │                         │
│                    │  - isRecording              │                         │
│                    │  - isProcessing             │                         │
│                    │  - connectionState          │                         │
│                    └──────────────┬──────────────┘                         │
│                                   │                                        │
│                    ┌──────────────▼──────────────┐                         │
│                    │    RealtimeClient           │                         │
│                    │                             │                         │
│                    │  - WebSocket connection     │                         │
│                    │  - Audio streaming          │                         │
│                    │  - Event handlers           │                         │
│                    │  - Reconnection logic       │                         │
│                    └──────────────┬──────────────┘                         │
│                                   │                                        │
└───────────────────────────────────┼────────────────────────────────────────┘
                                    │
                                    │ WebSocket / HTTP
                                    │
┌───────────────────────────────────▼────────────────────────────────────────┐
│                              Server                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    API Routes (SvelteKit)                             │  │
│  │                                                                       │  │
│  │  POST /api/chat          - Text message handling                      │  │
│  │  POST /api/audio         - Audio file upload (for non-streaming)      │  │
│  │  WS   /api/realtime      - WebSocket for streaming audio              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Conversation Store (`/src/lib/stores/conversation.svelte.ts`)

Central state management using Svelte 5 runes:

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'audio';
  content: string;           // Text content or transcript
  audioUrl?: string;         // For audio messages
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

interface ConversationState {
  messages: Message[];
  inputMode: 'text' | 'audio';
  audioMode: 'ptt' | 'vad';
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;       // AI is speaking
  connectionState: 'disconnected' | 'connecting' | 'connected';
  error: string | null;
}
```

### 2. Audio Input Component (`/src/lib/components/AudioInput.svelte`)

Handles all audio recording with two modes:

#### Push-to-Talk (PTT) Mode
- User presses and holds button to record
- Release to send
- Visual feedback: recording indicator, timer
- Keyboard shortcut support (spacebar)

#### Voice Activity Detection (VAD) Mode
- Continuous listening for speech
- Automatic start when speech detected
- Automatic stop after silence threshold
- Configurable sensitivity and silence duration

### 3. Audio Utilities (`/src/lib/utils/audio.ts`)

Core audio processing:

```typescript
// Audio recording with MediaRecorder API
class AudioRecorder {
  start(): Promise<void>
  stop(): Promise<Blob>
  cancel(): void
  getAudioLevel(): number  // For visualization
}

// Voice Activity Detection
class VoiceActivityDetector {
  constructor(options: VADOptions)
  start(): void
  stop(): void
  onSpeechStart: (callback) => void
  onSpeechEnd: (callback) => void
  onVolumeChange: (callback) => void
}

// Audio playback for AI responses
class AudioPlayer {
  play(audioData: ArrayBuffer | Blob): Promise<void>
  pause(): void
  stop(): void
  setVolume(level: number): void
}
```

### 4. Real-Time Client (`/src/lib/utils/realtime.ts`)

WebSocket connection management:

```typescript
class RealtimeClient {
  connect(): Promise<void>
  disconnect(): void

  // Send methods
  sendText(message: string): void
  sendAudioChunk(chunk: ArrayBuffer): void
  sendAudioComplete(): void

  // Event handlers
  onMessage: (handler: (msg: Message) => void) => void
  onAudioChunk: (handler: (chunk: ArrayBuffer) => void) => void
  onTranscript: (handler: (text: string, isFinal: boolean) => void) => void
  onError: (handler: (error: Error) => void) => void
  onConnectionChange: (handler: (state: ConnectionState) => void) => void
}
```

## Audio Flow Diagrams

### Push-to-Talk Flow

```
User Action          Client                    Server
    │                   │                         │
    │ Press PTT btn     │                         │
    ├──────────────────►│                         │
    │                   │ Start recording         │
    │                   │ (MediaRecorder)         │
    │                   │                         │
    │ Hold...           │ Stream audio chunks ───►│ Process audio
    │                   │ (WebSocket)             │ (STT)
    │                   │                         │
    │ Release btn       │                         │
    ├──────────────────►│                         │
    │                   │ Send end signal ───────►│
    │                   │                         │
    │                   │◄─── Transcript ─────────│
    │                   │◄─── AI Response ────────│
    │                   │◄─── Audio chunks ───────│ (TTS)
    │                   │                         │
    │◄── Show + Play ───│                         │
```

### Voice Activity Detection Flow

```
                     Client                    Server
                        │                         │
  VAD initialized       │                         │
  (continuous listen)   │                         │
                        │                         │
  Speech detected! ─────┤                         │
                        │ Start recording         │
                        │                         │
  Speaking...           │ Stream audio chunks ───►│
                        │                         │
  Silence detected ─────┤                         │
  (after threshold)     │                         │
                        │ Send end signal ───────►│
                        │                         │
                        │◄─── Transcript ─────────│
                        │◄─── AI Response ────────│
                        │◄─── Audio chunks ───────│
                        │                         │
```

## VAD Implementation Details

### Algorithm Options

1. **Volume Threshold (Simple)**
   - Monitor audio level via AnalyserNode
   - Speech start: level > threshold for X ms
   - Speech end: level < threshold for Y ms
   - Pros: Simple, low CPU
   - Cons: Sensitive to background noise

2. **WebRTC VAD (Recommended)**
   - Use `@ricky0123/vad-web` library
   - ONNX-based neural network
   - Better noise handling
   - Provides speech probabilities

### Configuration Options

```typescript
interface VADConfig {
  // Detection thresholds
  speechThreshold: number;      // 0.5 - probability threshold
  silenceThreshold: number;     // 0.35 - below this = silence

  // Timing
  preSpeechPadding: number;     // 300ms - include audio before speech
  postSpeechPadding: number;    // 800ms - wait before ending
  minSpeechDuration: number;    // 250ms - ignore very short sounds
  maxSpeechDuration: number;    // 30000ms - max recording length

  // Audio
  sampleRate: number;           // 16000 - for most APIs
}
```

## Component Structure

```
src/lib/
├── components/
│   ├── chat/
│   │   ├── ChatContainer.svelte    # Main chat wrapper
│   │   ├── ChatBubble.svelte       # Individual message bubble
│   │   ├── TextInput.svelte        # Text input field
│   │   ├── AudioInput.svelte       # Audio recording controls
│   │   ├── InputModeToggle.svelte  # Switch text/audio
│   │   ├── AudioModeToggle.svelte  # Switch PTT/VAD
│   │   └── WaveformVisualizer.svelte
│   └── ...
├── stores/
│   └── conversation.svelte.ts      # Conversation state
├── utils/
│   ├── audio.ts                    # Audio recording/playback
│   ├── vad.ts                      # Voice activity detection
│   └── realtime.ts                 # WebSocket client
└── realtime/
    └── ARCHITECTURE.md             # This file
```

## API Endpoints

### POST /api/chat
Text message handling (non-streaming fallback)

```typescript
// Request
{ message: string, conversationId?: string }

// Response
{ response: string, conversationId: string }
```

### POST /api/audio
Audio upload for transcription + response

```typescript
// Request: FormData with audio file
// Response
{
  transcript: string,
  response: string,
  audioUrl?: string  // TTS response audio
}
```

### WebSocket /api/realtime
Real-time bidirectional streaming

```typescript
// Client -> Server
{ type: 'audio_chunk', data: ArrayBuffer }
{ type: 'audio_end' }
{ type: 'text', content: string }

// Server -> Client
{ type: 'transcript', text: string, isFinal: boolean }
{ type: 'response_start' }
{ type: 'response_chunk', text: string }
{ type: 'response_end' }
{ type: 'audio_chunk', data: ArrayBuffer }
{ type: 'error', message: string }
```

## Usage Example

```svelte
<script lang="ts">
  import ChatContainer from '$lib/components/chat/ChatContainer.svelte';
  import { conversation } from '$lib/stores/conversation.svelte';
</script>

<ChatContainer
  {conversation}
  defaultInputMode="audio"
  defaultAudioMode="vad"
  onSend={(msg) => console.log('Sent:', msg)}
/>
```

## Dependencies to Add

```json
{
  "dependencies": {
    "@ricky0123/vad-web": "^0.0.18"  // Optional: for neural VAD
  }
}
```

## Browser Compatibility

- **MediaRecorder API**: Chrome 49+, Firefox 25+, Safari 14.1+
- **Web Audio API**: All modern browsers
- **WebSocket**: All modern browsers
- **getUserMedia**: Requires HTTPS in production

## Security Considerations

1. **Microphone Permissions**: Always request explicitly, handle denial gracefully
2. **Audio Data**: Never store raw audio longer than needed
3. **WebSocket Auth**: Include auth token in connection
4. **Rate Limiting**: Implement on server to prevent abuse
