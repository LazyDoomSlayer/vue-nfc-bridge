<script setup lang="ts">
import { io } from 'socket.io-client'
import { ref, toRaw, onUnmounted } from 'vue'

const token = import.meta.env.VITE_TOKEN

let socket

function startSocketConnection(): void {
  socket = io('wss://192.168.0.164:3000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    withCredentials: true,
    rejectUnauthorized: false,
    auth: {
      token,
      device: 'Mobile', // This must match the recipient room name
    },
  })

  socket.on('connect', () => {
    console.log('Connected to WebSocket Server')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket Server')
  })

  socket.on('private-message', (data) => {
    console.log('Message from server:', data)
  })
}

function disconnectSocketConnection(): void {
  socket?.disconnect()
}

const textModel = ref<string | null>(null)

const sendPrivateMessage = (recipientId, message) => {
  socket.emit('private-message', { recipientId, message })
}

const sendMessage = () => {
  if (!textModel.value.trim()) return
  const stringify = JSON.stringify(toRaw(nfcRecords.value))

  sendPrivateMessage('Desktop', stringify)
  textModel.value = ''
}

const message = ref('No NFC data')
let nfcReader: any

const nfcRecords = ref<any[]>([])

const startNfcScan = async () => {
  if (!('NDEFReader' in window)) {
    alert('Web NFC is not supported in this browser.')
    return
  }

  try {
    const nfcReader = new (window as any).NDEFReader()
    // await nfcReader.scan()

    await nfcReader.scan()

    nfcReader.addEventListener('reading', (event: any) => {
      console.log('event', event)
      nfcRecords.value = event.message.records.map((record: any) => ({
        id: record.id,
        recordType: record.recordType,
        mediaType: record.mediaType || 'N/A',
        encoding: record.encoding || 'N/A',
        lang: record.lang || 'N/A',
        data: decodeData(record.data), // Convert DataView
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
</script>

<template>
  <div>
    MOBILE VERSION
    <button @click.left="startSocketConnection">Connect to Socket</button>
    <button @clikc.left="disconnectSocketConnection">Disconect</button>

    <input type="text" v-model="textModel" />
    <button @click.left="sendMessage">send message</button>

    <section>
      {{ JSON.stringify(nfcRecords) }}
    </section>

    <button @click.left="startNfcScan">Start Lisetner for nfc</button>
  </div>
</template>
