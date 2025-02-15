<script setup lang="ts">
import { io, Socket } from 'socket.io-client'
import { ref, toRaw, onUnmounted, computed } from 'vue'

enum EWebsocketClient {
  READER = 'READER',
  HANDLER = 'HANDLER',
}
enum ENFCScanStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
interface INfcScanDTO {
  deviceExtendedUniqueIdentifier: string
  applicationExtendedUniqueIdentifier?: string
}

interface INFCRecordObject {
  id: string
  recordType: string
  mediaType: string
  encoding: string
  lang: string
  data: string
}

interface INfcResponseDTO {
  message?: string
  status: ENFCScanStatus
}

const accessToken = ref<string>()

let socket: Socket | null = null

function startSocketConnection(): void {
  if (!accessToken.value) throw new Error('Could not get access token')
  if (socket) throw new Error('You are already conncted try disconnecting ')

  socket = io(import.meta.env.VITE_NEST_ENDPOINT, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    secure: true,
    withCredentials: true,
    rejectUnauthorized: false,
    auth: {
      token: accessToken.value,
      client: EWebsocketClient.READER,
    },
  })

  socket.on('connect', () => {
    console.log('Connected to WebSocket Server')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket Server')
  })

  socket.on('nfc-response', (data) => {
    console.log('Message from server:', data)
    handleNFCResponse(data as INfcResponseDTO)
  })
}

const nfcResponseMessage = ref<string | null>(null)
function handleNFCResponse(data: INfcResponseDTO): void {
  nfcResponseMessage.value = data.message ?? null

  if (data.status === ENFCScanStatus.SUCCESS) {
    nfcRecords.value = []
    return
  }
}

const sendMessage = () => {
  if (!devEUI.value) throw new Error('Could not get dev id')
  const nfcScanMessageObject: INfcScanDTO = {
    deviceExtendedUniqueIdentifier: devEUI.value,
  }

  socket.emit('nfc-scan', nfcScanMessageObject)
}

let nfcReader: unknown = null

const nfcRecords = ref<INFCRecordObject[]>([])

const startNfcScan = async () => {
  if (!('NDEFReader' in window)) {
    alert('Web NFC is not supported in this browser.')
    return
  }

  try {
    const nfcReader = new window.NDEFReader()
    // await nfcReader.scan()

    await nfcReader.scan()

    nfcReader.addEventListener('reading', (event) => {
      nfcRecords.value = event.message.records.map((record: INFCRecordObject) => ({
        id: record.id,
        recordType: record.recordType,
        mediaType: record.mediaType || 'N/A',
        encoding: record.encoding || 'N/A',
        lang: record.lang || 'N/A',
        data: decodeData(record.data),
      }))

      console.log('NFC Records Updated:', nfcRecords.value)
    })
  } catch (err) {
    console.error('NFC scanning error:', err)
  }
}

const decodeData = (data: DataView) => {
  const decoder = new TextDecoder()
  return decoder.decode(data)
}

const stopNfcScan = () => {
  if (nfcReader) {
    nfcReader = null
  }
}

onUnmounted(() => stopNfcScan())

function disconnectSocketConnection(): void {
  socket?.disconnect()
  socket = null
}

function parseMessageFromNDEFRecord(type: TNDEFRecordMessageHeader): string | null {
  const item = nfcRecords.value.find((el) => el.data.startsWith(`${type}=`))
  return item ? item.data.split('=')[1] : null
}

const orgID = computed((): string | null => parseMessageFromNDEFRecord('OrgID'))
const appId = computed((): string | null => parseMessageFromNDEFRecord('AppId'))
const devEUI = computed((): string | null => parseMessageFromNDEFRecord('DevEUI'))
</script>

<template>
  <div class="container">
    <h1 class="title">MOBILE VERSION</h1>

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

    <section class="info-section">
      <p>
        <span class="label">DevEUI:</span> <span class="value">{{ devEUI ?? 'N/A' }}</span>
      </p>
      <p>
        <span class="label">AppID:</span> <span class="value">{{ appId ?? 'N/A' }}</span>
      </p>
      <p>
        <span class="label">OrgID:</span> <span class="value">{{ orgID ?? 'N/A' }}</span>
      </p>
    </section>

    <div class="button-group">
      <p>{{ nfcResponseMessage }}</p>
      <button @click.left="startNfcScan" class="button accent">Scan NFCs</button>
      <button @click.left="sendMessage" class="button accent">Send NFC data</button>
    </div>
  </div>
</template>

<style scoped>
/* Overall container styling */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
  font-family: Arial, sans-serif;
  padding: 20px;
}

/* Title styling */
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

/* Input group styling */
.input-group {
  margin-bottom: 15px;
  width: 100%;
  max-width: 300px;
}

.access-token-input {
  padding: 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #333;
  width: 100%;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

/* Button group for alignment */
.button-group {
  display: flex;
  gap: 12px;
  margin: 15px 0;
}

/* General button styling */
.button {
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
  border: none;
}

/* Primary button (Connect) */
.primary {
  background-color: #4caf50;
  color: white;
}

.primary:hover {
  background-color: #45a049;
}

/* Secondary button (Disconnect) */
.secondary {
  background-color: #f44336;
  color: white;
}

.secondary:hover {
  background-color: #d32f2f;
}

/* Accent buttons (Scan NFCs & Send NFC data) */
.accent {
  background-color: #1976d2;
  color: white;
}

.accent:hover {
  background-color: #1565c0;
}

/* Info section styling */
.info-section {
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
  text-align: left;
  margin: 15px 0;
}

.info-section p {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 14px;
}

/* Labels and values */
.label {
  font-weight: bold;
  color: #bdbdbd;
}

.value {
  color: #ffffff;
}
</style>
