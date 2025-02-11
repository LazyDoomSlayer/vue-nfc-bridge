<script setup lang="ts">
import { io } from 'socket.io-client'
import { ref } from 'vue'

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
      device: 'Desktop', // This must match the recipient room name!
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
  sendPrivateMessage('Mobile', textModel.value)
  textModel.value = ''
}
</script>

<template>
  <div>
    DESKTOP VERSION
    <button @click.left="startSocketConnection">Connect to Socket</button>
    <button @clikc.left="disconnectSocketConnection">Disconnected</button>
    <input type="text" v-model="textModel" />
    <button @click.left="sendMessage">send message</button>
  </div>
</template>
