<script setup lang="ts">
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

enum EWebsocketClient {
  READER = 'READER',
  HANDLER = 'HANDLER',
}
enum ENFCScanStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

interface INfcResponseDTO {
  message?: string
  status: ENFCScanStatus
}

interface INfcScanDTO {
  deviceExtendedUniqueIdentifier: string
  applicationExtendedUniqueIdentifier?: string
}

const accessToken = ref<string>()

let socket: Socket | null = null

function startSocketConnection(): void {
  if (!accessToken.value) throw new Error('Could not get token')
  if (socket) throw new Error('You are already conncted try disconnecting ')

  socket = io(import.meta.env.VITE_NEST_ENDPOINT, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    withCredentials: true,
    rejectUnauthorized: false,
    secure: true,
    auth: {
      token: accessToken.value,
      client: EWebsocketClient.HANDLER,
    },
  })

  socket.on('connect', () => {
    console.log('Connected to WebSocket Server')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket Server')
  })

  socket.on('nfc-scan', (data) => {
    console.log('Received NFC scan data:', data)
    incomingMessage.value = data
    const nfcScanObject = data as INfcScanDTO

    appId.value = nfcScanObject.applicationExtendedUniqueIdentifier
    devEUI.value = nfcScanObject.deviceExtendedUniqueIdentifier
  })
}

function sendNfcResponseMessage(status: ENFCScanStatus): void {
  try {
    const nfcResponseObject: INfcResponseDTO = {
      status,
    }

    if (status === ENFCScanStatus.SUCCESS) {
      nfcResponseObject.message = 'All good u can clear and scan another'
    }

    socket.emit('nfc-response', nfcResponseObject)
  } catch (error) {
    console.error(error)
  }
}

const incomingMessage = ref<unknown[]>([])

function disconnectSocketConnection(): void {
  socket?.disconnect()
  socket = null
}

const appId = ref()
const devEUI = ref()
</script>

<template>
  <div class="desktop-container">
    <h1 class="title">DESKTOP VERSION</h1>

    <!-- Access Token Input -->
    <div class="input-group">
      <input
        type="text"
        v-model.trim="accessToken"
        placeholder="Enter Access Token"
        class="access-token-input"
      />
    </div>

    <div class="button-group">
      <button @click.left="startSocketConnection" class="button primary">Connect to Socket</button>
      <button @click.left="disconnectSocketConnection" class="button secondary">Disconnect</button>
    </div>

    <div>
      <p>Actions</p>
      <button @click.left="sendNfcResponseMessage(ENFCScanStatus.ERROR)" class="button">
        ERROR / Cancel
      </button>
      <button @click.left="sendNfcResponseMessage(ENFCScanStatus.SUCCESS)" class="button">
        Success
      </button>
    </div>

    <section class="info-section">
      <p>
        <span class="label">DevEUI:</span> <span class="value">{{ devEUI ?? 'N/A' }}</span>
      </p>
      <p>
        <span class="label">AppID:</span> <span class="value">{{ appId ?? 'N/A' }}</span>
      </p>
    </section>
  </div>
</template>

<style scoped>
/* Main Container */
.desktop-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-family: 'Arial', sans-serif;
  padding: 20px;
}

/* Title Styling */
.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

/* Button Group for Alignment */
.button-group {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

/* General Button Styling */
.button {
  padding: 14px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
  border: none;
}

/* Primary Button (Connect) */
.primary {
  background-color: #4caf50;
  color: white;
}

.primary:hover {
  background-color: #45a049;
}

/* Secondary Button (Disconnect) */
.secondary {
  background-color: #f44336;
  color: white;
}

.secondary:hover {
  background-color: #d32f2f;
}

/* Info Section */
.info-section {
  background-color: #292929;
  padding: 20px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  text-align: left;
  margin-top: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

/* Information Styling */
.info-section p {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 16px;
}

/* Labels & Values */
.label {
  font-weight: bold;
  color: #bdbdbd;
}

.value {
  color: #ffffff;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .info-section {
    max-width: 300px;
  }

  .button {
    font-size: 14px;
    padding: 12px 16px;
  }
}

.access-token-input {
  padding: 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #333;
  width: 100%;
  background-color: #1e1e1e;
  color: #e0e0e0;
  margin-bottom: 2rem;
}
</style>
