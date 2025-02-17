<script setup lang="ts">
import { ref } from 'vue'
import useNfcScan from '../composables/useNfcScan'
import useWebSocket from '../composables/useWebsocket'

import { EWebsocketClient } from '../types'

const accessToken = ref<string>()

const { isScanning, startNfcScan, appId, devEUI, nfcRecords } = useNfcScan()

const { connectSocket, sendMessage, disconnectSocket, nfcResponseMessage } = useWebSocket(
  accessToken.value,
  EWebsocketClient.READER,
  nfcRecords,
)
</script>

<template>
  <div class="container">
    <h1 class="title">MOBILE VERSION</h1>
    <h2>{{ isScanning ? 'You can scan devices' : 'Something is wrong wth scanning' }}</h2>

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
      <button @click.left="connectSocket" class="button primary">Connect to Socket</button>
      <button @click.left="disconnectSocket" class="button secondary">Disconnect</button>
    </div>

    <section class="info-section">
      <p>
        <span class="label">DevEUI:</span> <span class="value">{{ devEUI ?? 'N/A' }}</span>
      </p>
      <p>
        <span class="label">AppID:</span> <span class="value">{{ appId ?? 'N/A' }}</span>
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
